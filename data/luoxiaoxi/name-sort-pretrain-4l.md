# Luoxiaoxi/name-sort-pretrain-4L

## Resumen

name-sort-pretrain-4L es un modelo de lenguaje GPT-2 de pequeno tamano desarrollado por el usuario Luoxiaoxi y publicado en HuggingFace. Se trata de un checkpoint base entrenado desde cero sobre las frases que sustentan una tarea sintetica de ordenacion de nombres (name-sorting), y su proposito no es el uso generico en produccion sino servir como base de preentrenamiento que despues se afina sobre la tarea concreta. Forma parte de un benchmark de circuitos con verdad de referencia (ground-truth circuits) disenado para evaluar metodos de descubrimiento de circuitos en redes neuronales.

El modelo tiene 12.732.672 parametros, una arquitectura GPT-2 de 4 capas con tamano oculto 256, 4 cabezas de atencion, MLP de 1024 y una longitud de contexto de solo 256 tokens. Emplea un tokenizador propio a nivel de palabra, WhitespaceDigitTokenizer, con un vocabulario de 37.139 entradas.

Su relevancia es fundamentalmente investigadora: proporciona un artefacto controlado y reproducible (semilla 42, perdida final 3.90) para estudiar interpretabilidad y descubrimiento de circuitos, mas que para tareas de generacion de texto reales. El propio autor advierte de que este checkpoint nunca ha visto el token `[ANS]`, por lo que sus predicciones tras ese separador carecen de sentido hasta que se afina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | 12.732.672 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, precision original no documentada) |
| Idiomas soportados | no disponible (plantillas de frases en ingles segun los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas | 4 |
| Tamano oculto | 256 |
| Cabezas de atencion | 4 |
| Tamano de MLP | 1024 |
| Vocabulario | 37.139 entradas (tokenizador a nivel de palabra) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con la configuracion clasica de GPT-2: 4 capas, dimension oculta de 256, 4 cabezas de atencion y capa MLP de 1024 neuronas. El modelo se entreno desde cero (no es un ajuste fino de un GPT-2 preexistente) sobre el dataset `Luoxiaoxi/synthetic-name-index-pretrain`. Este corpus esta formado por plantillas de frases reales en las que cada nombre de persona se reemplaza por un nombre sintetico de 3 caracteres escrito como tres palabras de un solo caracter (por ejemplo, `j u j`), empaquetadas en bloques de 256 tokens con el formato `<sentence> [EOS]`. Solo se usan las plantillas de la particion de entrenamiento del ajuste fino posterior.

El entrenamiento consistio en 1.500 pasos con tamano de lote 64, optimizador AdamW (learning rate 5e-4, weight decay 0.01), planificador coseno con 50 pasos de calentamiento, dropout 0.1 y semilla 42, alcanzando una perdida final de entrenamiento de 3.90. Un detalle tecnico clave es que la respuesta de la tarea y su separador `[ANS]` nunca aparecen durante el preentrenamiento: el formato de ajuste fino es `<sentence> [ANS] <answer> [EOS]`, donde la respuesta es la posicion de primera aparicion (`0`-`4`) del nombre lexicograficamente menor. Por ese motivo este checkpoint debe considerarse exclusivamente como base previa al ajuste fino.

El tokenizador es un componente destacable: `WhitespaceDigitTokenizer` divide el texto unicamente por espacios en blanco y fragmenta ademas cualquier token que contenga digitos en digitos individuales (por ejemplo, `1912` pasa a `1 9 1 2`). El vocabulario se compone de todas las palabras del corpus mas los tokens especiales `[UNK]`, `[PAD]`, `[EOS]` y `[ANS]`, y cualquier palabra fuera del vocabulario se mapea a `[UNK]`. La decodificacion une los tokens con espacios simples. El corpus esta pretokenizado, de modo que la puntuacion y los cliticos son palabras separadas: hay que escribir `her , she` y `once .`, no `her, she` ni `once.` (que pasarian a `[UNK]`).

## Capacidades

- Generacion de texto a nivel de siguiente palabra, limitada a la distribucion de las plantillas de entrenamiento.
- Modelado de lenguaje sobre frases con nombres sinteticos de tres caracteres.
- Tokenizacion a nivel de palabra con separacion automatica de digitos individuales.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue especifica.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.
- Capacidad de servir como base de ajuste fino para la tarea de name-sorting.

## Casos de uso

- Base de preentrenamiento para ajuste fino: el proposito declarado del modelo es servir de punto de partida para afinar la tarea de ordenacion de nombres con el formato `<sentence> [ANS] <answer>`, por lo que su uso principal es iniciar ese entrenamiento.
- Investigacion en interpretabilidad y descubrimiento de circuitos: forma parte de un benchmark de circuitos con verdad de referencia, permitiendo evaluar algoritmos que intentan identificar los subcircuitos responsables de una tarea concreta.
- Reproduccion de experimentos controlados: al publicarse la configuracion exacta (semilla 42, hiperparametros y logs), permite reproducir resultados de forma determinista en estudios de mecanistica.
- Pruebas de tokenizadores a nivel de palabra: el `WhitespaceDigitTokenizer` sirve para experimentar con esquemas de tokenizacion que preservan palabras completas y separan digitos.
- Investigacion academica sobre tareas sinteticas: util para generar entornos de juguete donde la respuesta correcta es computable y verificable, sin ambiguedad.
- Desarrollo y validacion de metodologias de evaluacion de circuitos: al existir prompts limpios y contrafactuales emparejados en `Luoxiaoxi/synthetic-name-index-counterfactual`, permite contrastar explicaciones causales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es la perdida final de entrenamiento de 3.90 tras 1.500 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 12,7 millones de parametros, el modelo ocupa aproximadamente 51 MB en fp32 y unos 25 MB en fp16/bf16, sin contar el vocabulario ni el estado del optimizador.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una grafica integrada; no requiere aceleradores de gama alta como A100 o H100.
- Cabe sin problema en GPUs de consumo y tambien en CPU; la inferencia en CPU es perfectamente viable dada la escala.
- Opciones de despliegue: transformers (libreria declarada), con compatibilidad indicada con text-generation-inference y endpoints_compatible. No se documentan pesos en GGUF ni soporte explicito de llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.
- Nota: el tokenizador requiere `trust_remote_code=True` o cargar manualmente `ws_tokenizer.py`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Proposito |
|---|---|---|---|---|---|
| name-sort-pretrain-4L | 12,7 M | 256 | GPT-2 (4 capas) | no disponible | Benchmark de interpretabilidad |
| gpt2 | 124 M | 1024 | GPT-2 (12 capas) | MIT (modificada) | Modelo de lenguaje general |
| distilgpt2 | 82 M | 1024 | GPT-2 destilado (6 capas) | Apache-2.0 | Modelo de lenguaje general destilado |

Los modelos comparables de la familia GPT-2 se incluyen unicamente como referencia de escala; sus especificaciones corresponden a informacion publica ampliamente conocida. name-sort-pretrain-4L es entre 6 y 10 veces mas pequeno y su contexto (256) es cuatro veces menor, y su finalidad no es la generacion general sino el estudio de circuitos sobre una tarea sintetica concreta.

## Limitaciones y advertencias

- El checkpoint no ha visto nunca el token `[ANS]`; sus predicciones despues de ese separador no son significativas hasta que se ajusta finamente sobre la tarea.
- Esta sobreajustado a un dominio muy estrecho (frases con nombres sinteticos) y no es util para generacion de texto general.
- La longitud de contexto es muy reducida (256 tokens), lo que limita cualquier uso con entradas largas.
- El tokenizador es fragil: puntuacion y cliticos deben ir separados por espacios, y cualquier palabra fuera del vocabulario se convierte en `[UNK]`.
- La licencia no esta disponible, por lo que no puede confirmarse la viabilidad de un uso comercial.
- No se documentan sesgos especificos, pero al entrenarse sobre plantillas sinteticas con nombres de tres caracteres, cualquier evaluacion de equidad carece de sentido en este modelo.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar continuaciones plausibles pero incorrectas; dado su tamano y proposito, este riesgo es alto fuera de su tarea.
- No hay datos de benchmarks publicados que permitan contrastar su calidad objetiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luoxiaoxi/name-sort-pretrain-4L
- Dataset de preentrenamiento: https://huggingface.co/datasets/Luoxiaoxi/synthetic-name-index-pretrain
- Dataset contrafactual: https://huggingface.co/datasets/Luoxiaoxi/synthetic-name-index-counterfactual
