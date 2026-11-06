# OvermaxSA/asl-translator-gemma-3-1b-it

## Resumen

`OvermaxSA/asl-translator-gemma-3-1b-it` es una redistribución del modelo `google/gemma-3-1b-it` de Google, cuantizado a int4 y empaquetado en formato LiteRT-LM (`.litertlm`) para su ejecución en dispositivos Android. No se trata de un fine-tuning ni de una modificación de pesos: el autor (OvermaxSA) ha desempaquetado el fichero `.task` publicado por Google en Kaggle y ha reempaquetado byte a byte el modelo `TF_LITE_PREFILL_DECODE` y el `TOKENIZER_MODEL` en un contenedor LiteRT-LM, usando la plantilla de chat de los ficheros `.litertlm` oficiales de Gemma 3.

El modelo forma parte de la aplicación Android "ASL Translator: Sign Language", que traduce lenguaje de signos americano (ASL) reconocido por la cámara a frases en inglés. Gemma 3 1B IT actúa como motor de generación de frases a partir de los signos y letras deletreadas detectados, ejecutándose íntegramente en el teléfono sin enviar datos a ningún servidor. La descarga del modelo es opcional para el usuario y solo se realiza por Wi-Fi.

La relevancia de este repositorio es doble: por un lado, demuestra un caso práctico de despliegue on-device de Gemma 3 en Android mediante LiteRT-LM; por otro, sirve como ejemplo de redistribución conforme a los términos de Gemma, incluyendo los avisos legales exigidos. El tamaño del repositorio es de 0,6 GB y el modelo base es un transformer denso de 1 000 millones de parámetros con instruction tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3), instruction-tuned |
| Parametros totales | 1 000 millones (aproximado, segun el modelo base google/gemma-3-1b-it) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use |
| Formato de pesos | LiteRT-LM (`.litertlm`); origen: `.task` de TensorFlow Lite (Kaggle, `google/gemma-3/tfLite/gemma3-1b-it-int4`, version 1) |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-3-1b-it`, un transformer denso de aproximadamente 1 000 millones de parámetros con ajuste por instrucciones. Sobre la arquitectura interna (número de capas, dimensiones, mecanismos de atención, uso de atención local/global, etc.) no se proporciona información en la model card de este repositorio; esos detalles corresponden a la documentación oficial de Gemma 3 de Google, no incluida aquí.

El autor no ha realizado entrenamiento ni fine-tuning. La modificación consiste exclusivamente en un cambio de contenedor: el fichero `gemma3-1B-it-int4.task` de Google se desempaqueta y sus componentes `TF_LITE_PREFILL_DECODE` (el modelo) y `TOKENIZER_MODEL` (el tokenizador) se reempaquetan sin alteración en un fichero `.litertlm` mediante `litert-lm-builder` 0.19.0, aplicando los metadatos de plantilla de chat de los `.litertlm` oficiales de Gemma 3. No se modifican pesos, datos del tokenizador ni el comportamiento del modelo. Se incluye el SHA-256 del fichero resultante: `5a4a58a31425d4158748eed885b580f288bceeb143cf08265dc9e66bf628bd19`.

## Capacidades

- Generación de texto en inglés orientada a la composición de frases a partir de secuencias de signos y letras deletreadas.
- Instruction following: el modelo base es la variante instruction-tuned de Gemma 3 1B, por lo que acepta instrucciones en formato chat (plantilla de chat incluida en los metadatos).
- Ejecución on-device: inferencia local en Android mediante LiteRT-LM, sin llamadas a servidor.
- Cuantización int4: reduce el peso del modelo para su despliegue en dispositivos móviles.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito para esta variante.
- Capacidades multilingües: no disponibles en la información proporcionada (el caso de uso descrito es traducción de ASL a inglés).

## Casos de uso

- Traducción de ASL a frases en inglés en la app "ASL Translator: Sign Language": el modelo recibe los signos reconocidos y las palabras deletreadas y genera una frase coherente; es adecuado porque corre en el propio teléfono y evita enviar vídeo o datos del usuario a un servidor.
- Accesibilidad en tiempo real en dispositivos móviles: al ejecutarse con LiteRT-LM en Android, permite construir aplicaciones de asistencia para personas sordas o con dificultades auditivas sin depender de conectividad permanente.
- Procesamiento de lenguaje natural de baja latencia en el borde: la cuantización int4 y el formato LiteRT-LM están pensados para reducir el consumo de memoria y cómputo en hardware móvil.
- Aplicaciones de privacidad estricta: cualquier flujo en el que la transcripción o el texto del usuario no deba salir del dispositivo puede apoyarse en este empaquetado como referencia de despliegue on-device.
- Prototipado de apps Android con LiteRT-LM: el repositorio incluye `build-recipe.toml` y `LlmMetadataProto.pbtext`, útiles como ejemplo reproducible de cómo construir un `.litertlm` a partir de un `.task` de Gemma 3.
- Traducción de secuencias cortas de signos en contextos educativos o de aprendizaje de ASL: el modelo puede convertir deletreos y signos aislados en frases de apoyo para prácticas guiadas.
- Integración en pipelines de accesibilidad para kioscos o terminales Android: despliegue local del modelo para generar respuestas o transcripciones sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser un modelo int4 de 1B parámetros, el fichero del repositorio ocupa 0,6 GB en total, lo que da una idea del orden de magnitud del almacenamiento necesario en el dispositivo.
- GPU recomendadas: no aplica en el escenario principal; el destino es la inferencia en CPU/NPU de dispositivos Android mediante LiteRT-LM.
- ¿Cabe en GPU de consumo? No se proporcionan datos específicos de VRAM ni de compatibilidad con GPUs de escritorio; el formato `.litertlm` está orientado a LiteRT-LM en Android, no a CUDA.
- Opciones de despliegue: LiteRT-LM (formato nativo del repositorio). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este fichero.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OvermaxSA/asl-translator-gemma-3-1b-it | ~1B (int4) | no disponible | LiteRT-LM (`.litertlm`) | Gemma Terms of Use | Hugging Face (7 descargas) |
| google/gemma-3-1b-it | ~1B | no disponible en esta ficha | safetensors / otros formatos oficiales | Gemma Terms of Use | Hugging Face / Kaggle (modelo base) |
| Gemma 3 1B IT int4 (`.task`, Kaggle) | ~1B (int4) | no disponible | TensorFlow Lite (`.task`) | Gemma Terms of Use | Kaggle (fuente original del empaquetado) |

La diferencia principal frente al modelo base y al `.task` original es el contenedor: este repositorio ofrece el mismo modelo en formato LiteRT-LM con metadatos de plantilla de chat de Gemma 3, listo para LiteRT-LM en Android. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo especializado en ASL: los pesos son los de Gemma 3 1B IT sin fine-tuning; la adaptación al caso de uso depende del pipeline de reconocimiento de signos de la app, no del modelo en sí.
- Riesgo de alucinación inherente a un modelo generativo de 1B parámetros, especialmente en frases largas o ambiguas.
- El modelo está pensado para generar frases en inglés a partir de signos; no se documenta soporte multilingüe ni su comportamiento en otros idiomas.
- Restricciones de licencia: se aplican los Gemma Terms of Use y la Gemma Prohibited Use Policy; el uso comercial y la redistribución están sujetos a dichos términos.
- El autor no garantiza ni documenta el rendimiento del modelo en tareas distintas de la traducción de ASL dentro de su aplicación.
- El formato `.litertlm` limita el despliegue a LiteRT-LM; no es directamente utilizable en frameworks como vLLM, llama.cpp u Ollama sin conversión.
- No se proporcionan datos sobre sesgos, evaluación de seguridad ni tasas de error en la información disponible.
- La fecha de creación del repositorio indicada (2026-10-30) debe tratarse con cautela; no se dispone de información adicional que la confirme.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OvermaxSA/asl-translator-gemma-3-1b-it
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Fuente del modelo original (Kaggle): `google/gemma-3/tfLite/gemma3-1b-it-int4`, version 1 (`gemma3-1B-it-int4.task`)
