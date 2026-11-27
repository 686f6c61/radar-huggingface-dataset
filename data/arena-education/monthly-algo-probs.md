# arena-education/monthly-algo-probs

## Resumen

`arena-education/monthly-algo-probs` es un repositorio de pesos de siete pequenos transformers entrenados especificamente para tareas algoritmicas, publicado por ARENA (Alignment Research Engineer Accelerator) como material didactico para el capitulo 1 de su programa de interpretabilidad mecanistica. No es un modelo de lenguaje de proposito general: es una coleccion de artefactos de investigacion disenados para que estudiantes e investigadores hagan ingenieria inversa de los circuitos internos que resuelven cada tarea.

Cada uno de los siete modelos resuelve una unica tarea acotada (detectar palindromos, encontrar el primer caracter unico, sumar numeros de cuatro digitos, ordenar listas, calcular el signo de una suma acumulada, aplicar el cifrado Cesar y predecir trigramas plantados). Las arquitecturas son deliberadamente minusculas, con configuraciones de una o dos capas, entre una y tres cabezas de atencion y dimensiones de modelo de entre 24 y 96, lo que las hace tratables para analisis exhaustivo de activaciones, atencion y MLPs.

El repositorio es relevante en el contexto de la interpretabilidad mecanistica porque proporciona casos de estudio controlados, reproducibles y de bajo coste computacional. Los pesos se distribuyen como `state_dict` de PyTorch compatibles con TransformerLens, y el codigo asociado (datasets, `create_model`, `load_model`) vive en el repositorio de GitHub de ARENA. El repo de Hugging Face ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo GPT (TransformerLens `HookedTransformer`), attention-only en la mayoria de variantes |
| Parametros totales | No disponible (modelos de entre 1 y 2 capas, d_model 24-96; conteo exacto no publicado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en precision original de PyTorch) |
| Idiomas soportados | No disponible (tareas sobre secuencias de caracteres/digitos, no modelado de lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`), compatible con TransformerLens 2/3 `HookedTransformer` y convertible a TransformerLens 4 `TransformerBridge` |

Configuracion por tarea segun la model card:

| Carpeta | Tarea | Fichero | Configuracion |
|---|---|---|---|
| `july23_palindromes` | Es palindromo? | `palindrome_classifier.pt` | 2 capas, 2 cabezas, d_model 28, attention-only, LN |
| `august23_unique_char` | Primer caracter unico | `first_unique_char_model.pt` | 2 capas, 3 cabezas, d_model 42, attention-only, LN |
| `september23_sum` | Suma de dos numeros de 4 digitos | `sum_model.pt` | 2 capas, 3 cabezas, d_model 48, attention-only, LN |
| `october23_sorted_list` | Ordenar una lista | `sorted_list_model.pt` | 1 capa, 2 cabezas, d_model 96, attention-only, LN |
| `november23_cumsum` | Signo de la suma acumulada | `cumsum_model.pt` | 1 capa, 1 cabeza, d_model 24, d_mlp 8, sin LN |
| `january24_caesar_cipher` | Rotacion de cifrado Cesar | `caesar_cipher_model_{easy,medium,hard}.pt` | 2 capas, 2 cabezas, d_model 48, attention-only, LN |
| `november24_trigrams` | Siguiente token con trigramas plantados | `trigram_model.pt` | 1 capa, 1 cabeza, d_head 16, d_model 32, d_mlp 20, sin LN |

## Arquitectura y entrenamiento

Los siete modelos son transformers decoder-only de escala minima construidos con TransformerLens. La mayoria son attention-only (sin MLP) y emplean LayerNorm; las variantes `cumsum` y `trigrams` prescinden de LayerNorm y si incluyen MLP con dimensiones reducidas (d_mlp 8 y 20 respectivamente). Las dimensiones de cabeza y modelo varian por tarea, con rangos de d_model entre 24 y 96 y entre una y tres cabezas de atencion.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta de los datasets, ni si se emplearon tecnicas de RLHF o DPO (poco probables dado el caracter supervisado y acotado de las tareas). Tampoco se documentan innovaciones arquitectonicas mas alla de la propia configuracion minima. El interes tecnico reside precisamente en la simplicidad: cada modelo es un sujeto de estudio para tecnicas como analisis de circuitos, atribucion por path patching o direcciones de activacion.

Los pesos se copiaron byte a byte del repositorio de ARENA (ultimo commit `6a34ff0d0`, 2024-11-01) y se cargan mediante `create_model` y `load_model` definidos en el codigo del capitulo 1. Para TransformerLens 4 es necesario convertir las claves con `convert_tl_checkpoint`; con TransformerLens 3 se cargan directamente en `HookedTransformer.load_state_dict`.

## Capacidades

- Clasificacion de palindromos sobre secuencias de caracteres.
- Deteccion del primer caracter unico en una secuencia.
- Suma aritmetica de dos numeros de cuatro digitos.
- Ordenacion de listas.
- Calculo del signo de la suma acumulada (cumsum).
- Aplicacion del cifrado Cesar en tres niveles de dificultad (easy, medium, hard).
- Prediccion del siguiente token en secuencias con trigramas plantados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso general ni capacidades multilingues.
- No dispone de modo thinking, vision ni audio.
- Orientado a analisis de interpretabilidad mecanistica (hooks, cache de activaciones, manipulacion de residuos y cabezas).

## Casos de uso

- Docencia en interpretabilidad mecanistica: el modelo de palindromos y el de primer caracter unico sirven como ejercicios guiados para que estudiantes aprendan a identificar cabezas y circuitos con TransformerLens.
- Investigacion de circuitos: el modelo de suma de cuatro digitos permite estudiar como se implementa la aritmetica en transformers pequenos mediante atencion y MLP, replicando y extendiendo analisis publicados sobre sumas.
- Validacion de tecnicas de atribucion: el modelo de ordenacion de listas, con una sola capa y dos cabezas, es un banco de pruebas controlado para comparar path patching, attribution patching y metodos de ablacion.
- Estudio de aritmetica acumulada: la variante `cumsum` sin LayerNorm y con MLP pequeno permite aislar el papel de la no linealidad en tareas de agregacion secuencial.
- Analisis de robustez y generalizacion: los tres modelos de cifrado Cesar (easy, medium, hard) permiten comparar como cambia el circuito aprendido segun la dificultad del reparto de rotaciones.
- Investigacion de memorizacion y sesgo inductivo: el modelo de trigramas plantados facilita el estudio de como una cabeza de atencion implementa copia y prediccion local en ausencia de estructura linguistica.
- Reproducibilidad de experimentos: al ser pesos ligeros y deterministas, cualquier laboratorio con una GPU consumer puede reproducir analisis sin coste significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, perdida ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos, dado el tamano minimo de los modelos (d_model maximo de 96 y una o dos capas). El repositorio completo ocupa 0.0 GB.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4090, A100 o H100. Tambien es viable en CPU.
- Cabe holgadamente en cualquier GPU consumer, incluso en iGPU y en entornos de portatil.
- Opciones de despliegue: TransformerLens (2, 3 o 4 con conversion de claves) es la via principal; tambien es posible cargar los `state_dict` en PyTorch puro reconstruyendo la configuracion con `create_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no tendria sentido por el tipo de artefacto.
- Latencia y throughput: no disponibles; irrelevantes para el proposito del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arena-education/monthly-algo-probs` | No disponible (1-2 capas, d_model 24-96) | No disponible | Interpretabilidad mecanistica sobre tareas algoritmicas | No disponible | Hugging Face + GitHub ARENA |
| `NeelNanda/circuit-library` (referencia de la comunidad) | No disponible | No disponible | Repositorio de circuitos y modelos pequenos para interpretabilidad | No disponible | GitHub |
| `EleutherAI/pythia-70m` | 70M | 2048 | Modelos pequenos para investigacion de entrenamiento e interpretabilidad | Apache 2.0 | Hugging Face |
| `openai-community/gpt2` | 124M | 1024 | Modelo de lenguaje pequeno de referencia | MIT | Hugging Face |

La comparativa con `pythia-70m` y `gpt2` es solo orientativa: esos modelos son de lenguaje general, mientras que `monthly-algo-probs` contiene siete artefactos especializados en tareas acotadas con fines didacticos. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe emplearse para generacion de texto, traduccion, resumen ni ninguna tarea de NLP general.
- Cada checkpoint resuelve una unica tarea; no hay un modelo unificado ni capacidad de transferencia entre tareas.
- La licencia no esta declarada en la informacion disponible; es imprescindible contactar con el autor antes de cualquier uso comercial o redistribucion.
- No se documentan sesgos, pero al entrenarse sobre datasets sinteticos y acotados, cualquier sesgo estaria ligado a la generacion de esos datos.
- Riesgo de alucinacion no aplica en el sentido habitual; el riesgo real es sobreinterpretar los circuitos encontrados como generalizables a modelos mayores.
- La longitud de contexto no esta documentada; los modelos estan pensados para secuencias cortas de caracteres o digitos.
- Requiere TransformerLens y, en la version 4, conversion explicita de claves; la incompatibilidad entre versiones puede romper scripts antiguos.
- Los pesos se copiaron de un commit concreto de ARENA; cambios posteriores en el repositorio de GitHub pueden no estar reflejados aqui.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arena-education/monthly-algo-probs
- Repositorio ARENA en GitHub: https://github.com/ARENA-education/ARENA_materials
- Codigo del capitulo 1 (ejercicios): https://github.com/ARENA-education/ARENA_materials/tree/main/chapter1_transformer_interp/exercises/monthly_algorithmic_problems
- Documentacion de TransformerLens: no disponible en la informacion proporcionada
- Paper asociado: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
