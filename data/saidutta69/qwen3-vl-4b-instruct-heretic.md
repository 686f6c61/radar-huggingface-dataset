# saidutta69/Qwen3-VL-4B-Instruct-heretic

## Resumen

Qwen3-VL-4B-Instruct-heretic es una variante "decensored" del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, publicada por el usuario saidutta69 en HuggingFace. El modelo base pertenece a la rama vision-lenguaje de la familia Qwen3-VL, que acepta entrada de imagen, video y OCR con anclaje espacial (spatial grounding). La modificacion no consiste en un reentrenamiento, sino en una ablacion direccional ("abliteration") aplicada con la herramienta Heretic v1.4.0, que edita direcciones concretas de pesos para suprimir el comportamiento de rechazo.

La edicion se realiza sobre las proyecciones de salida de atencion (`attn.o_proj`) y las proyecciones descendentes del MLP (`mlp.down_proj`), sin tocar el resto de la red. Segun el autor, las negativas (refusals) caen de 97/100 a 8/100 en un conjunto de evaluacion de contenido nocivo, mientras que la torre de vision y el anclaje espacial se mantienen cercanos al original (divergencia KL de 0.0396).

Se distribuye con 4.437.815.808 parametros totales (4,44B) en safetensors BF16, que incluyen el encoder de vision, y una escalera de cuantizaciones GGUF que deja fuera el encoder de vision y sirve solo para texto. No es una mejora de capacidades respecto al modelo base: es el mismo modelo con las barreras de rechazo eliminadas, orientado a despliegue en una sola GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL, `arch=qwen3vl`) con encoder de vision y backbone de texto |
| Parametros totales | 4.437.815.808 (4,44B); el backbone de texto en GGUF tiene 4,02B y 398 tensores |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explicita; el autor menciona bloques de 32K en la estimacion de memoria (~1 GB por 32K de contexto) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF F16, Q4_K_M, Q5_K_M, Q6_K y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-VL-4B-Instruct, un transformer multimodal de la familia Qwen3-VL que combina un encoder de vision con un backbone de texto y ofrece entrada de imagen, video y OCR con anclaje espacial. El autor no ha realizado ningun entrenamiento adicional: la unica intervencion es una ablacion direccional con Heretic v1.4.0, aplicada en el trial 120 de una ejecucion de 200 trials con semilla `3485018052`. La tecnica identifica direcciones de pesos responsables del rechazo y las atenua, en lugar de superponer una persona "servicial" mediante fine-tuning, lo que evita degradar la coherencia del modelo original.

Los parametros concretos de la ablacion son: `direction_index` 19.43; en `attn.o_proj`, `max_weight` 1.49 (posicion 21.65), `min_weight` 0.92 (distancia 9.30); en `mlp.down_proj`, `max_weight` 1.12 (posicion 25.61), `min_weight` 0.11 (distancia 15.41). El repositorio incluye un directorio `reproduce/` con el `config.toml`, el `requirements.txt`, el diario del estudio Optuna y las sumas SHA-256, de modo que el modelo puede regenerarse bit a bit con `heretic --reproduce reproduce/reproduce.json`. No se documentan en la informacion disponible los datos ni el proceso de entrenamiento original del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del backbone Qwen3-VL-4B-Instruct.
- Entrada de imagen, video y OCR, con anclaje espacial (spatial grounding) cuando se usan los pesos safetensors.
- Capacidad de agente de vision / GUI, segun indica el autor al describir el modelo base.
- Supresion de negativas: el comportamiento de rechazo se reduce de 97/100 a 8/100 en el conjunto de evaluacion de contenido nocivo.
- La torre de vision y el comportamiento de anclaje se mantienen cercanos al original (divergencia KL de 0.0396).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de razonamiento multi-paso o modo "thinking": no disponibles en la informacion proporcionada.
- Multilingue: limitado a ingles segun la etiqueta `language: en`; no se documentan otros idiomas.

## Casos de uso

- OCR y digitalizacion de documentos: con los pesos safetensors y `Qwen3VLForConditionalGeneration` + `AutoProcessor`, el modelo puede extraer texto de imagenes y documentos escaneados, aprovechando la capacidad OCR de la rama Qwen3-VL.
- Anclaje espacial en aplicaciones de vision: el modelo conserva el spatial grounding del original (KL 0.0396), util para localizar objetos o regiones en una imagen y devolver coordenadas.
- Agentes GUI y automatizacion de interfaces: la capacidad de agente de vision permite interpretar capturas de pantalla y decidir acciones sobre elementos de interfaz.
- Analisis de imagenes y video en pipelines internos: al usar safetensors, el modelo procesa entrada visual completa; la eliminacion de negativas facilita el analisis de contenido que el modelo base rechazaria.
- Generacion de texto en ingles en produccion: mediante las cuantizaciones GGUF (solo texto) se puede desplegar en llama.cpp, LM Studio o Jan para tareas de generacion y conversacion.
- Despliegue en una sola GPU de consumo: con Q4_K_M (2,33 GB) funciona en tarjetas de 6-8 GB, e incluso en CPU o Apple Silicon, lo que permite prototipos locales sin infraestructura dedicada.
- Evaluacion de tecnicas de abliteration: el directorio `reproduce/` permite reproducir la intervencion, util como caso de estudio metodologico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente aporta metricas comparativas frente al modelo original:

| Metrica | Este modelo | Modelo original (Qwen/Qwen3-VL-4B-Instruct) |
|---|---|---|
| Divergencia KL | 0.0396 | 0 (por definicion) |
| Negativas (refusals) | 8/100 | 97/100 |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, tamano nativo 4,44B): F16 7,50 GB; Q8_0 3,99 GB; Q6_K 3,08 GB; Q5_K_M 2,69 GB; Q4_K_M 2,33 GB. Anadir ~1 GB por cada 32K de contexto.
- GPU de 24 GB (RTX 3090, 4090, 5090): cuantizacion recomendada Q8_0.
- GPU de 16 GB (RTX 4080, 5080, 4060 Ti 16G): cuantizacion recomendada Q6_K.
- GPU de 12 GB (RTX 3060, 4070, 5070): cuantizacion recomendada Q5_K_M.
- GPU de 8 GB (RTX 4060, 3070): cuantizacion recomendada Q4_K_M.
- GPU de 6 GB (GTX 1660 Super, 2060, 3050 laptop): cuantizacion recomendada Q4_K_M.
- CPU-only o Apple Silicon: Q4_K_M (2,33 GB) cabe en memoria del sistema.
- Opciones de despliegue: las cuantizaciones GGUF cargan de forma nativa en llama.cpp, LM Studio y Jan (solo texto), por ejemplo con `llama serve -hf saidutta69/Qwen3-VL-4B-Instruct-heretic:Q4_K_M`. Para uso con vision hay que usar los safetensors con transformers (`Qwen3VLForConditionalGeneration` + `AutoProcessor`). No se documentan opciones como vLLM o TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vision | Licencia | Notas |
|---|---|---|---|---|
| saidutta69/Qwen3-VL-4B-Instruct-heretic | 4,44B | Si (solo en safetensors; GGUF sin encoder de vision) | apache-2.0 | Variante abliterada, negativas 8/100 |
| Qwen/Qwen3-VL-4B-Instruct | 4,44B | Si | apache-2.0 | Modelo base; negativas 97/100 |
| saidutta69/Qwen3-VL-2B-Instruct-heretic | no disponible | no disponible | no disponible | Escalon inferior de la coleccion, segun el autor |
| saidutta69/Qwen3-VL-8B-Instruct-heretic | no disponible | no disponible | no disponible | Escalon superior de la coleccion, segun el autor |

No se dispone de datos de contexto ni de rendimiento de las variantes 2B y 8B en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser una variante abliterada, el comportamiento de rechazo esta deliberadamente reducido, lo que puede facilitar salidas inapropiadas o daninas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se mantiene el riesgo inherente al modelo base al generar texto e interpretar imagenes.
- Las cuantizaciones GGUF son solo texto: no incluyen el encoder de vision (398 tensores, `arch=qwen3vl`, cero tensores de vision). Para imagen, video u OCR hay que usar obligatoriamente los pesos safetensors.
- Idioma: soporte limitado a ingles segun la etiqueta `language: en`; el rendimiento en castellano no esta documentado.
- Longitud de contexto: no se especifica de forma explicita, lo que dificulta planificar cargas de trabajo con contextos largos.
- Licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantias; revisar las condiciones del modelo base Qwen/Qwen3-VL-4B-Instruct antes de desplegar en produccion.
- Reputacion del repositorio: 0 descargas y 0 likes en el momento de la consulta, con escasa validacion externa de los resultados declarados (8/100 de negativas, KL 0.0396).
- La supresion de rechazos puede afectar a la seguridad en produccion; se recomienda filtrado adicional en aplicaciones expuestas a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/Qwen3-VL-4B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Articulo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Variante 2B: https://huggingface.co/saidutta69/Qwen3-VL-2B-Instruct-heretic
- Variante 8B: https://huggingface.co/saidutta69/Qwen3-VL-8B-Instruct-heretic
