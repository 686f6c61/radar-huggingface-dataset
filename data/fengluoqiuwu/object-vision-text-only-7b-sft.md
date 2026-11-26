# fengluoqiuwu/Object-Vision-Text-Only-7B-SFT

## Resumen

Object-Vision-Text-Only-7B-SFT es un ajuste fino supervisado (SFT) del modelo vision-language Qwen2.5-VL-7B-Instruct, publicado por el usuario fengluoqiuwu en Hugging Face. Forma parte del proyecto Object Vision descrito en el articulo *Re-encode the Mention* y corresponde al checkpoint del paso 12000 de entrenamiento. Se trata de una variante de control "text-only": el modelo sigue recibiendo la imagen como entrada, pero no realiza inserciones visuales regionales durante la generacion, lo que permite aislar el efecto de la re-codificacion de regiones frente a la linea base.

El modelo hereda la arquitectura y el tamano del Qwen2.5-VL-7B-Instruct (aproximadamente 7 mil millones de parametros, transformer denso con vision encoder congelado), pero los pesos se distribuyen en formato nativo del proyecto (`model.pt` + `config.json`), no como checkpoint estandar de Transformers. Esto implica que no puede cargarse con `AutoModel.from_pretrained()` ni con `generate()` convencionales; requiere el helper `load_engine_from_checkpoint` del paquete `models.object_vision.generate`.

Su relevancia es fundamentalmente de investigacion: sirve como referencia controlada para evaluar la contribucion del mecanismo Object Vision (seleccion de regiones a partir de la atencion sobre menciones de objetos, re-codificacion con encoder congelado e insercion con indices M-RoPE originales). No esta pensado como modelo de produccion ni como sustituto directo del Qwen2.5-VL original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen2.5-VL), vision encoder congelado, LM ajustado |
| Parametros totales | ~7B (heredados de Qwen2.5-VL-7B-Instruct) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no se reclama Apache-2.0 incondicional; base Apache-2.0) |
| Formato de pesos | `model.pt` + `config.json` (formato nativo del proyecto, no safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-VL-7B-Instruct, un transformer denso de aproximadamente 7B parametros con un vision encoder acoplado. En la variante Object Vision, el mecanismo dispara ante menciones de objetos durante la generacion: selecciona una region a partir de la atencion sobre la mencion, la re-codifica de forma aislada con el vision encoder (congelado) e inserta las caracteristicas resultantes respetando los indices M-RoPE originales. En este checkpoint concreto ("baseline-qwen2.5-7b-full", variante text-only), el modelo recibe la imagen pero no realiza inserciones visuales regionales, actuando como control tras el SFT.

El entrenamiento actualiza unicamente el modelo de lenguaje: primero una fase de SFT y despues GRPO. Los datos de entrenamiento incluyen Visual-CoT y ZwZ-RL-VQA, cuyos terminos deben revisarse antes de redistribuir o usar comercialmente. El checkpoint publicado corresponde al paso 12000. La evaluacion por defecto en el articulo emplea un presupuesto de region K=100.

## Capacidades

- Generacion de texto e image-text-to-text: acepta imagen y texto y produce respuestas en lenguaje natural.
- Razonamiento visual basico heredado de Qwen2.5-VL, aunque en esta variante no se activan las inserciones regionales de Object Vision.
- Procesamiento de menciones de objetos como senal interna (el mecanismo de seleccion de region existe en el diseno, pero en el modo text-only no inserta caracteristicas regionales).
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada (heredadas potencialmente del modelo base).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio especial: no disponible.

## Casos de uso

- Investigacion sobre re-codificacion de regiones: usar este checkpoint como control text-only para comparar, en el mismo pipeline y con K=100, el efecto de las inserciones visuales regionales frente a no insertarlas.
- Reproduccion de experimentos del articulo *Re-encode the Mention*: cargar los pesos con `load_engine_from_checkpoint(..., expect_model="qwen", expect_plan="baseline")` y ejecutar la evaluacion por defecto con `record_pastes=True` para inspeccionar las regiones registradas.
- Analisis de atencion sobre menciones de objetos: estudiar que regiones selecciona el mecanismo al generar menciones, aun sin insertarlas, para diagnosticar el comportamiento del modelo base.
- Evaluacion comparativa de metodos de grounding visual: servir de linea base frente a variantes con insercion regional en tareas de VQA y descripcion de imagenes.
- Desarrollo de herramientas de depuracion del pipeline Object Vision: validar la carga de pesos nativos y la coherencia de indices M-RoPE en entornos de investigacion.
- Estudio de dinamicas de entrenamiento SFT + GRPO: analizar el checkpoint del paso 12000 para trazar la evolucion del modelo a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 16.6 GB, lo que sugiere pesos en precision de 16 bits para un modelo de ~7B.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de ~7B en FP16 requiere del orden de 14-16 GB de VRAM, por lo que encajaria en GPUs de consumo con 16 GB o mas, aunque el formato nativo (`model.pt`) y la ausencia de cuantizaciones publicadas limitan esta estimacion.
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI de forma estandar; la unica via documentada es el paquete `models.object_vision.generate` con `load_engine_from_checkpoint`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Object-Vision-Text-Only-7B-SFT | ~7B | no disponible | `model.pt` nativo | other | Hugging Face (pesos + config) |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7B | no disponible | safetensors Transformers | Apache-2.0 | Hugging Face, ampliamente soportado |
| Otras variantes Object Vision (con insercion regional) | ~7B | no disponible | `model.pt` nativo | other | no disponible en la informacion |

La comparativa se limita al modelo base y a las variantes del mismo proyecto; no se dispone de datos de rendimiento para contrastar con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un checkpoint estandar de Transformers: `AutoModel.from_pretrained()` y `generate()` no funcionan como punto de entrada.
- La licencia es "other" y el autor no reclama Apache-2.0 incondicional; los datos de entrenamiento (Visual-CoT, ZwZ-RL-VQA) imponen terminos adicionales que deben revisarse antes de uso comercial o redistribucion.
- El repositorio no redistribuye las imagenes de entrenamiento.
- Al ser una variante text-only de control, no explota las inserciones visuales regionales de Object Vision, por lo que su rendimiento en tareas de grounding puede ser inferior al de las variantes completas.
- Riesgo de alucinacion inherente a los modelos de ~7B, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- No se han publicado helpers de inferencia publicos; hasta su publicacion, el repositorio solo ofrece pesos y configuracion.
- Ausencia de cuantizaciones (GGUF, AWQ, GPTQ) publicadas, lo que dificulta el despliegue en entornos de bajos recursos.

## Enlaces

- Hugging Face: https://huggingface.co/fengluoqiuwu/Object-Vision-Text-Only-7B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Articulo de referencia: *Re-encode the Mention* (Object Vision); no se proporciona URL en la informacion disponible.
