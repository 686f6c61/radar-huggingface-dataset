# LekkerYing/smolfem-360m-esp32

## Resumen

smolFem 360M para ESP32-S3 es una distribucion de pesos cuantizados a 4 bits del modelo smolFem, un fine-tune LoRA de SmolLM2-360M-Instruct realizado por Ambika (Computational Mama) sobre un dataset de tematica feminista. El autor de este repositorio, LekkerYing, ha empaquetado el modelo en un formato binario propietario disenado para ejecutarse en un microcontrolador ESP32-S3 N16R8, leyendo las capas desde una tarjeta SD de forma secuencial. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue orientado a hardware embebido de bajo coste.

La relevancia del proyecto es fundamentalmente experimental: demuestra que un modelo de lenguaje de 360 millones de parametros puede ejecutarse en un chip de aproximadamente 5 euros, a costa de latencias muy elevadas (del orden de minutos por respuesta) y de una precision limitada al dominio de entrenamiento. Los ficheros incluidos (`model.bin`, `bpe.bin`, `head.bin`) solo son legibles por el sketch publicado en el repositorio de GitHub del autor y no cargan en transformers, Ollama ni otras herramientas convencionales.

El modelo base SmolLM2-360M-Instruct emplea una arquitectura transformer decoder-only con 32 capas, y este paquete lo comprime a 4 bits mediante destilacion con conciencia de cuantizacion (quantization-aware distillation) para preservar la precision sobre el dataset original. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct), 32 capas |
| Parametros totales | 360 millones (modelo base); pesos empaquetados a 4 bits |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con grupos de 64 pesos, escala fp16 y minimo fp16 por grupo |
| Idiomas soportados | no disponible (el modelo base SmolLM2 es multilingue, pero no se documenta en esta ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | binario propietario (`model.bin`, `bpe.bin`, `head.bin`); no compatible con safetensors, GGUF ni transformers |
| Tamano del repositorio | 0,2 GB |
| Tamano de `model.bin` | 224 MB |
| Tamano de `bpe.bin` | 0,5 MB |
| Tamano de `head.bin` | 5,6 MB |
| Vocabulario de salida | 5.748 palabras (subconjunto del tokenizer SmolLM2) |
| Hardware objetivo | ESP32-S3 N16R8 con tarjeta SD |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-360M-Instruct de Hugging Face, un transformer decoder-only de 360 millones de parametros. Sobre el se aplico un fine-tune LoRA con un dataset feminista elaborado por Ambika (Computational Mama), dando lugar a smolFem. Este repositorio no contiene ese fine-tune en formato estandar, sino una conversion a 4 bits del mismo.

El proceso de cuantizacion descrito en la model card es relevante tecnicamente: el redondeo directo a 4 bits hacia caer la precision por palabra sobre el dataset del 71,8 % a aproximadamente el 50 %. Mediante destilacion con conciencia de cuantizacion (script `qat360.py`) se recupero hasta el 71,0 %, con una coincidencia del 92 % de palabras respecto al modelo completo. La exportacion a los ficheros binarios se realizo con `export_sd360.py`. El formato almacena las 32 capas en 4 bits con grupos de 64 pesos, cada uno con su escala y minimo en fp16, mas los embeddings de palabras. La cabeza de salida se restringe a las 5.748 palabras que aparecen en las respuestas del dataset, lo que reduce el tamano de `head.bin` a 5,6 MB y se escribe en la particion de flash `head` en la direccion 0x210000 mediante esptool.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales sobre el fine-tune.

## Capacidades

- Generacion de texto autoregresiva en el dominio acotado del dataset feminista de entrenamiento.
- Respuesta a preguntas incluidas en el dataset de entrenamiento con una precision por palabra del 71,0 % tras la cuantizacion.
- Lectura de pesos por streaming desde tarjeta SD, capa a capa, adaptada a la RAM limitada del ESP32-S3.
- Tokenizacion BPE compatible con el tokenizer de SmolLM2, convertida a un formato legible por el microcontrolador.
- Generacion restringida al vocabulario de 5.748 palabras presentes en las respuestas del dataset.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- El modelo base SmolLM2-360M-Instruct dispone de capacidades generales de instruccion, pero el artefacto empaquetado no las conserva de forma fiable fuera del dominio entrenado.

## Casos de uso

- Demostracion educativa de inferencia de un LLM en microcontrolador: el modelo permite mostrar en un aula o taller como se ejecuta un transformer de 360 millones de parametros en un chip de 5 euros, leyendo pesos desde SD y midiendo el coste energetico por respuesta.
- Medición de eficiencia energetica en edge computing: la model card indica explicitamente que el proyecto busca medir cuanta energia cuesta una respuesta, por lo que sirve como banco de pruebas para comparar consumo entre configuraciones de cuantizacion y frecuencias de reloj.
- Prototipo de asistente tematico offline: para preguntas del dataset feminista, el dispositivo responde sin conexion a red, lo que resulta adecuado en entornos sin conectividad o con requisitos de privacidad estrictos.
- Investigacion sobre cuantizacion agresiva: el par de scripts `qat360.py` y `export_sd360.py` permite reproducir el pipeline de destilacion con conciencia de cuantizacion y evaluar la perdida de precision a 4 bits en modelos pequenos.
- Validacion de pipelines de streaming de pesos: el formato por capas sirve para experimentar con tecnicas de carga secuencial desde almacenamiento lento, aplicables a otros dispositivos con RAM limitada.
- Artefacto de divulgacion: el proyecto puede exhibirse en ferias o demos de hardware abierto para ilustrar las fronteras actuales del despliegue de IA en embebidos, con expectativas realistas de latencia.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son metricas internas del proceso de cuantizacion y latencias medidas en el dispositivo:

| Metrica | Valor |
|---|---|
| Precision por palabra, modelo completo sobre el dataset | 71,8 % |
| Precision por palabra, redondeo directo a 4 bits | ~50 % |
| Precision por palabra, tras destilacion con conciencia de cuantizacion | 71,0 % |
| Coincidencia de palabras con el modelo completo | 92 % |
| Latencia, pregunta del dataset (45 palabras) | ~6,5 minutos |
| Latencia, pregunta fuera del dataset | ~2 minutos por palabra |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: ESP32-S3 N16R8 (16 MB de flash, 8 MB de PSRAM) con tarjeta SD para almacenar `model.bin` (224 MB) y `bpe.bin` (0,5 MB).
- Particion de flash `head`: 5,6 MB en la direccion 0x210000, escrita con esptool.
- VRAM estimada para inferencia en GPU: no disponible; el artefacto no esta pensado para GPU ni para cargarse en frameworks convencionales.
- GPU recomendadas: no aplica; el formato binario propietario no se carga en vLLM, llama.cpp, Ollama, TGI ni transformers.
- Opciones de despliegue: exclusivamente el sketch del repositorio https://github.com/lekkerYing/esp32s3-bot, con instrucciones en `docs/HOWTO.md`.
- Latencia: aproximadamente 6,5 minutos para 45 palabras en preguntas del dataset y unos 2 minutos por palabra fuera del dataset; el cuello de botella es la tarjeta SD.
- Throughput: no disponible mas alla de las latencias indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolFem 360M ESP32 (este) | 360 M (4 bits) | no disponible | binario propietario para ESP32-S3 | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-360M-Instruct | 360 M | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Hugging Face, ampliamente usado |
| Barista (slvDev/esp32-ai) | no disponible | no disponible | orientado a ESP32 | no disponible | GitHub |
| esp32-llm (DaveBben) | no disponible | no disponible | orientado a ESP32 | no disponible | GitHub |

La comparacion directa con SmolLM2-360M-Instruct es la mas relevante: comparten arquitectura y numero de parametros, pero el artefacto de este repositorio pierde compatibilidad con el ecosistema estandar y restringe el vocabulario de salida, a cambio de ejecutarse en hardware embebido. Frente a otras iniciativas de LLM en ESP32 (esp32-llm, esp32-ai), el interes diferencial es la documentacion del pipeline de cuantizacion con destilacion y la medicion energetica.

## Limitaciones y advertencias

- El modelo solo responde de forma fiable a preguntas del dataset de entrenamiento; fuera de el, la model card advierte que inventa respuestas.
- La precision por palabra es del 71,0 %, por lo que aproximadamente tres de cada diez palabras pueden ser incorrectas incluso en el dominio entrenado.
- El vocabulario de salida esta limitado a 5.748 palabras, lo que restringe severamente la expresividad y la cobertura lexica.
- Los ficheros no cargan en transformers, Ollama ni otras herramientas estandar; solo funcionan con el sketch del repositorio del autor.
- La latencia es muy alta (minutos por respuesta) y depende criticamente de la velocidad de la tarjeta SD.
- No se documentan sesgos especificos del fine-tune feminista ni evaluaciones de seguridad; el dataset de entrenamiento puede introducir sesgos tematicos y estilisticos.
- Riesgo elevado de alucinacion fuera del dominio, tal como reconoce el autor.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas hacen inviable un despliegue en produccion mas alla de demos o investigacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LekkerYing/smolfem-360m-esp32
- Repositorio GitHub con el sketch y la guia: https://github.com/lekkerYing/esp32s3-bot
- Guia de montaje y flasheo: https://github.com/lekkerYing/esp32s3-bot/blob/main/docs/HOWTO.md
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Proyecto esp32-llm de DaveBben: https://github.com/DaveBben/esp32-llm
- Proyecto esp32-ai de slvDev: https://github.com/slvDev/esp32-ai
- llama2.c de Karpathy: https://github.com/karpathy/llama2.c
- ESP-DSP de Espressif: https://github.com/espressif/esp-dsp
