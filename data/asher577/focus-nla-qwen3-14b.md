# asher577/focus-nla-qwen3-14b

## Resumen

Focus NLA (Qwen3-14B, layer 26) es un autoencoder en lenguaje natural (NLA, *natural language autoencoder*) construido sobre Qwen/Qwen3-14B y publicado por el usuario asher577 en Hugging Face. No es un modelo de chat ni un asistente generalista: es una herramienta de interpretabilidad mecanicista que traduce un vector de activacion del *residual stream* de la capa 26 de Qwen3-14B a cuatro parrafos de texto en lenguaje natural, y que permite reconstruir aproximadamente el vector original a partir de esos parrafos. El objetivo es hacer legible, en lenguaje humano, el estado interno del modelo en un token concreto.

El sistema consta de dos modelos acoplados. El *verbalizer* (`av/`) es un Qwen3-14B afinado que recibe un vector de activacion inyectado en su propio residual stream en un token marcador y escribe cuatro parrafos con roles fijos (procedencia del texto, persona activa del modelo, creencias sobre el autor del texto y objetivos inmediatos). El *reconstructor* (`ar/`) es un Qwen3-14B truncado a sus primeras 27 capas con una cabeza lineal que mapea cada parrafo de vuelta a un vector; la suma de los cuatro vectores mas un vector medio fijo `mu` aproxima la activacion original.

Su relevancia es metodologica: demuestra que un modelo de 14B puede verbalizar sus propias activaciones con una fidelidad medible (FVE del 70,6% en datos retenidos) y con un ciclo de entrenamiento que combina SFT sobre descripciones escritas por Claude y RL con GRPO optimizando directamente la calidad de reconstruccion. La dimension del residual stream es 5120 y el repositorio ocupa 49,0 GB en formato safetensors bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) con inyeccion de activaciones en el residual stream; verbalizer completo y reconstructor truncado a 27 capas con cabeza lineal |
| Parametros totales | no disponible (el verbalizer es un Qwen3-14B afinado; el reconstructor es un Qwen3-14B truncado a 27 capas mas una cabeza lineal 5120 -> 5120) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-14B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (las descripciones de entrenamiento se generan en ingles; no se documenta cobertura multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face); `comp_mean_bias.npy` para `mu`; `nla_meta.yaml` y `nla_config.json` como metadatos |
| Capa objetivo | Capa 26 (salida del decoder layer 26, `hidden_states[27]` en numeracion de Hugging Face) |
| Dimension del residual stream | 5120 |
| Token marcador | `㈎` (token 149705), dentro de `<concept>...</concept>` |
| FVE en datos retenidos | 70,6% (ultima evaluacion, paso 990 de 1000) |

## Arquitectura y entrenamiento

El sistema se articula en torno al residual stream de la capa 26 de Qwen3-14B, con dimension 5120. La activacion `x` se inyecta en el verbalizer reemplazando, a la salida de su decoder layer 1, el residual `h` en la posicion del token marcador por `h + |h| * x / |x|`. El prompt usa la plantilla `actor` de `nla_meta.yaml` como un unico turno de usuario, seguida de la instruccion de `nla.composition.bullet_instruction(4)`, con el chat template aplicado y `add_generation_prompt=True`. La respuesta se emite dentro de etiquetas `<explanation>`, con parrafos separados por lineas en blanco. En sentido inverso, cada parrafo se envuelve en la plantilla `critic` (`Summary of the following text: <text>...</text> <summary>`) y la salida del reconstructor en el ultimo token es el vector de ese parrafo, de modo que `x_hat = mu + sum_j AR(paragraph_j)`.

El entrenamiento parte de activaciones extraidas de conversaciones de WildChat, con 10 posiciones de token por conversacion. Hay un arranque supervisado: SFT del verbalizer sobre descripciones de cuatro parrafos escritas por Claude del texto hasta cada posicion, y SFT del reconstructor en la direccion inversa. Despues se aplica RL con GRPO durante 1000 pasos (256 activaciones x 8 muestras por paso), con recompensa basada en la calidad de reconstruccion de los parrafos sumados. El verbalizer se entrena como LoRA de rango 128 (fusionada en el release) con penalizacion KL de 0,01 respecto al arranque supervisado, mientras que el reconstructor se ajusta completamente. La metrica de fidelidad es la fraccion de varianza explicada: `FVE = 1 - MSE(n(x_hat), n(x)) / 0,526`, donde `n` reescala un vector a norma sqrt(d) y el denominador es la varianza de las activaciones normalizadas del conjunto de entrenamiento.

## Capacidades

- Verbalizacion de activaciones: dado un vector del residual stream de la capa 26 de Qwen3-14B, genera cuatro parrafos con roles fijos (procedencia y contexto del texto, persona activa del modelo, creencias sobre el autor y objetivos inmediatos).
- Reconstruccion de activaciones: a partir de los cuatro parrafos, produce una estimacion del vector original con FVE medible (70,6% en retenidos).
- Analisis de estado interno: permite inspeccionar que "persona" adopta el modelo y que supuestos hace sobre el usuario en una posicion concreta del texto.
- Evaluacion cuantitativa de interpretabilidad: el ciclo verbalizar-reconstruir proporciona una metrica objetiva (FVE y similitud coseno) para validar la calidad de una explicacion.
- Deteccion de tokens sumidero: el quickstart advierte de tokens con activaciones de mas de 10 veces la norma mediana, en los que la lectura no es significativa.
- Lectura sobre el ultimo token del mensaje: con `--chat`, el script lee el ultimo token del mensaje en lugar de los tokens que anade la plantilla.
- No soporta tool calling, function calling, agentes ni vision: es una herramienta de interpretabilidad, no un asistente.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: leer el estado del residual stream de la capa 26 de Qwen3-14B en posiciones concretas de una conversacion y contrastar la descripcion con el comportamiento observable del modelo.
- Auditoria de persona y sesgos: el segundo parrafo describe explicitamente la persona que el modelo cree estar adoptando, lo que permite detectar derivas de rol (por ejemplo, hacia un tono comercial o clinico) antes de desplegar un sistema.
- Analisis de teoria de la mente del modelo: el tercer parrafo recoge las creencias del modelo sobre el autor del texto, util para estudiar como infiere el modelo el perfil del usuario (nivel tecnico, intencion, urgencia).
- Depuracion de prompts en produccion: ejecutar el NLA sobre los ultimos tokens de un prompt problematico para entender que informacion esta reteniendo el modelo y por que responde de forma inesperada.
- Validacion de metodos de explicabilidad: usar la FVE y la similitud coseno como referencia cuantitativa al comparar tecnicas de atribucion o de *probing* alternativas.
- Docencia y divulgacion: mostrar con un ejemplo reproducible como se traduce un vector de activacion a lenguaje natural y como se mide la fidelidad de esa traduccion.
- Investigacion de *steering* y edicion de activaciones: la reconstruccion `x_hat` permite estudiar que informacion es recuperable de una descripcion textual y que se pierde en el proceso.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| FVE en datos retenidos | 70,6% | Ultima evaluacion, paso 990 de 1000 |
| Similitud coseno de reconstruccion | 0,946 | Ejemplo del quickstart, lectura del ultimo token |
| FVE del ejemplo del quickstart | 0,796 | Mismo ejemplo, a partir de 4 parrafos |
| Varianza de activaciones normalizadas (denominador FVE) | 0,526 | Conjunto de entrenamiento |

No se han publicado resultados de benchmarks en la informacion disponible para tareas estandar (MMLU, HumanEval, GSM8K u otras); el modelo no esta disenado para ellas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 49,0 GB en bf16, lo que incluye verbalizer completo, reconstructor truncado y cabeza lineal. La inferencia completa requiere cargar ambos modelos, por lo que se necesita un entorno con al menos ~50 GB de VRAM o descarga por capas.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con 48 GB o mas (por ejemplo, RTX 6000 Ada) para ejecutar el ciclo completo en bf16.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en bf16 sin cuantizacion; no se documentan pesos cuantizados en el repositorio.
- Opciones de despliegue: el autor proporciona helpers de inferencia en el repositorio `nla` y el script `scripts/hf_quickstart.py`, que carga ambos modelos con Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El quickstart usa decodificacion greedy y lee un unico token por ejecucion, por lo que el coste dominante es la carga de los dos modelos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Fidelidad de reconstruccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Focus NLA (Qwen3-14B, layer 26) | NLA sobre residual stream de capa 26 | Qwen3-14B afinado + reconstructor truncado a 27 capas | no disponible | FVE 70,6% en retenidos | apache-2.0 | Hugging Face (`asher577/focus-nla-qwen3-14b`) |
| Qwen3-14B base | LLM generalista | 14B | no disponible en esta ficha | no aplica | apache-2.0 | Hugging Face (`Qwen/Qwen3-14B`) |
| Metodos de *probing* lineal | Clasificador sobre activaciones | Variable (tipicamente pequeno) | no aplica | no reportada | depende de la implementacion | Librerias de interpretabilidad |
| SAEs (sparse autoencoders) | Diccionario disperso sobre activaciones | Variable | no aplica | no reportada en esta ficha | depende del release | Repositorios de interpretabilidad |

La comparacion directa con SAEs o *probes* no es homogenea: el NLA produce descripciones en lenguaje natural y una metrica de reconstruccion end-to-end, mientras que las alternativas suelen producir caracteristicas o etiquetas. No se dispone de datos comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no responde preguntas, no genera codigo ni mantiene conversaciones; su unica funcion es verbalizar y reconstruir activaciones de la capa 26 de Qwen3-14B.
- Dependencia estricta del modelo base: solo es valido para Qwen/Qwen3-14B y para la capa 26; no se puede aplicar a otras capas, otros tamanos ni otros modelos sin reentrenar.
- Tokens sumidero: algunos tokens tienen activaciones de mas de 10 veces la norma mediana (el salto de linea final de la plantilla de chat de Qwen3-14B en la capa 26 es uno de ellos). El entrenamiento los excluyo, por lo que las lecturas en esas posiciones no tienen sentido, y la FVE no lo detecta porque esas activaciones apuntan casi en la misma direccion y se reconstruyen bien. El quickstart advierte de estos casos.
- Fidelidad imperfecta: la FVE retenida es del 70,6%, de modo que cerca del 30% de la varianza no se explica; la reconstruccion es una aproximacion, no una copia exacta del estado interno.
- Riesgo de alucinacion en las descripciones: el verbalizer genera texto en lenguaje natural y puede producir interpretaciones plausibles pero incorrectas; la validacion debe apoyarse en la metrica de reconstruccion y en el comportamiento observable del modelo.
- Sesgos de los datos de entrenamiento: las activaciones provienen de WildChat, por lo que las descripciones reflejan los sesgos de dominio e idioma de ese corpus.
- Idioma: las descripciones de entrenamiento se generan en ingles; no se documenta cobertura multilingue ni calidad en castellano.
- Licencia: apache-2.0 permite uso comercial, pero el modelo hereda las condiciones del modelo base Qwen3-14B; conviene revisar la licencia de Qwen para el uso combinado.
- Carga del reconstructor: al cargarlo se emite un aviso de que `lm_head.weight` y `model.norm.weight` se inicializan de nuevo; es esperado, porque el reconstructor lee la ultima capa del decoder directamente y sustituye ambos por identidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/focus-nla-qwen3-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio `nla` con helpers de inferencia y `scripts/hf_quickstart.py`: referenciado en la model card, sin URL explicita en la informacion disponible
- Paper, blog o demo: no disponibles en la informacion proporcionada
