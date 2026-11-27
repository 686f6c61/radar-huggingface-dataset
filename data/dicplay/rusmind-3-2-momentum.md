# DICPlay/RusMind-3.2-Momentum

## Resumen

RusMind 3.2 Momentum es un modelo de lenguaje ajustado (fine-tune) por DICPlay a partir de google/gemma-4-E2B-it, orientado a inferencia en dispositivo (on-device) y funcionamiento completamente offline. Se distribuye exclusivamente en formato GGUF y esta pensado para ejecutarse en telefonos moviles y ordenadores de gama baja, con un tamano de fichero de entre 2,5 y 5,0 GB segun la cuantizacion. El modelo forma parte de la familia RusMind 3.2, en la que Momentum es la variante mas ligera.

El modelo esta especializado en ruso como idioma principal, con soporte de ingles, y ha sido entrenado con datos propios de DICPlay sobre historia y cultura de Rusia, legislacion rusa, regiones y pueblos del pais, y valores familiares tradicionales. Su propuesta de valor es la privacidad: todo el procesamiento ocurre en el dispositivo del usuario, sin enviar datos a la nube.

Con 4.647.450.147 parametros totales reportados en safetensors y una ventana de contexto de 4096 tokens, se posiciona como una alternativa ligera para asistentes conversacionales locales. La licencia es propia (RusMind License), con uso libre solo para fines personales, no comerciales, de investigacion y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de google/gemma-4-E2B-it); detalles internos no disponibles |
| Parametros totales | 4.647.450.147 (reportado en safetensors); el fichero GGUF distribuido ronda los 2,5 GB en su variante Lite |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Lite (~2,5 GB, Q4_K_M con embeddings aligerados), Q4_K_M (3,4 GB), Q8_0 (5,0 GB) |
| Idiomas soportados | Ruso (principal) e ingles |
| Licencia | RusMind License (DICPlay); modelo base Gemma 4 E2B bajo Apache 2.0 |
| Formato de pesos | GGUF (fichero unico y version troceada en 9 partes de hasta 1 GB para carga en navegador) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer ajustado por instrucciones desarrollado por Google bajo licencia Apache 2.0. DICPlay ha realizado un fine-tune sobre datos propios centrados en el idioma ruso y su contexto cultural: historia y cultura de Rusia, legislacion de la Federacion Rusa, regiones y pueblos del pais, y valores familiares tradicionales, en ruso e ingles. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales sobre el ajuste original de Gemma.

La innovacion principal del modelo no es arquitectonica sino de despliegue: la distribucion en GGUF troceado en nueve partes de menos de 1 GB facilita la carga progresiva en el navegador mediante wllama/llama.cpp, permitiendo ejecucion offline tras una unica descarga. La variante Lite emplea embeddings aligerados para reducir el tamano hasta aproximadamente 2,5 GB. No se detallan en la informacion disponible innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con enfasis en contexto cultural ruso.
- Respuestas sobre historia, cultura, geografia, regiones y legislacion de Rusia.
- Asistencia en tareas de estudio y preguntas cotidianas.
- Modo conversacional multiturno mediante `llama-cli -cnv` y otras interfaces compatibles con GGUF.
- Ejecucion completamente offline en dispositivo, sin enviar datos a servidores externos.
- Integracion en aplicaciones de escritorio y moviles compatibles con GGUF (LM Studio, Ollama, PocketPal).
- Carga en navegador mediante wllama con ficheros troceados.
- Declaracion explicita de incertidumbre ("no lo se") cuando el modelo no esta seguro, segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente conversacional offline en moviles: el modelo cabe en 2,5 GB en su variante Lite y puede ejecutarse con llama.cpp o PocketPal sin conexion, lo que lo hace adecuado para escenarios con conectividad limitada o requisitos estrictos de privacidad.
- Atencion al ciudadano sobre legislacion rusa: el fine-tune sobre normativa de la Federacion Rusa permite responder consultas basicas sobre derechos, tramites y regulaciones, siempre con caracter informativo y no como sustituto de asesoramiento legal profesional.
- Apoyo educativo en historia y cultura de Rusia: util para estudiantes que necesiten repasar contenidos curriculares en ruso, con la ventaja de funcionar en equipos modestos de centros educativos.
- Integracion en productos de escritorio de DICPlay: el propio fabricante lo emplea en DIC.Antivirus PRO para explicar en lenguaje llano las amenazas detectadas, lo que demuestra su viabilidad en asistentes embebidos dentro de aplicaciones.
- Despliegue en navegador sin backend: gracias a la distribucion troceada y a wllama, se puede ofrecer un chat privado en una pagina web que descarga el modelo una vez y luego opera sin red.
- Prototipado rapido de asistentes en ruso: investigadores y desarrolladores pueden evaluar comportamiento linguistico en ruso con un solo fichero GGUF y hardware consumer, sin necesidad de GPU dedicada.
- Traduccion y redaccion bilingue ru-en: para tareas de redaccion y adaptacion de textos entre ruso e ingles en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,5 GB para la variante Lite, 3,4 GB para Q4_K_M y 5,0 GB para Q8_0, mas el overhead del runtime.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer con 6-8 GB de VRAM puede alojar las variantes Lite y Q4_K_M.
- Cabe en GPU consumer: si, en modelos como RTX 3060, RTX 4060 o superiores para las variantes Lite y Q4_K_M; la variante Q8_0 requiere 8 GB o mas.
- Ejecucion en CPU: viable en telefonos y ordenadores de gama baja segun la model card, especialmente con la variante Lite.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), LM Studio, Ollama, PocketPal, wllama en navegador y la propia web rusmind.ru.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind 3.2 Momentum | 4,65 B (reportado) | 4096 | ru, en | RusMind License (uso comercial restringido) | GGUF |
| RusMind 3.2 Vspyshka (Vspyshka) | no disponible | no disponible | ru, en | RusMind License | no disponible |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| T-Bank T-Pro / T-Lite | no disponible | no disponible | ru, en | no disponible | no disponible |

La comparativa con modelos de terceros (T-Pro, T-Lite, GigaChat, YandexGPT) solo puede establecerse por volumen de descargas segun la model card (66.548 descargas mensuales para la familia RusMind frente a 55.045 de T-Bank, 48.818 de Sber y 22.316 de Yandex, datos de octubre de 2026). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Ventana de contexto limitada a 4096 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Cobertura linguistica restringida a ruso e ingles; el rendimiento en castellano no esta documentado ni garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en consultas legales, medicas o financieras, que la propia model card califica como informativas.
- Sesgos potenciales derivados del dataset de ajuste, centrado en narrativas oficiales sobre historia, cultura y legislacion rusas; puede reflejar una perspectiva parcial en temas controvertidos.
- Licencia RusMind restrictiva: el uso comercial, la redistribucion, la publicacion de versiones modificadas o fine-tuneadas y la integracion en productos requieren contrato escrito con DICPlay.
- El modelo se distribuye "tal cual", sin garantias.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, lo que limita su uso en pipelines agenticos.
- El dato de parametros (4,65 B) corresponde a safetensors, mientras que el fichero GGUF Lite pesa 2,5 GB; la discrepancia sugiere cuantizacion agresiva o embeddings reducidos, lo que puede implicar perdida de calidad frente al modelo base.
- No hay informacion publica sobre benchmarks que permita validar el rendimiento real frente al modelo base Gemma 4 E2B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-3.2-Momentum
- Repositorio de versiones anteriores: https://huggingface.co/DICPlay/RusMind-Momentum
- Demo web: https://rusmind.ru
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Fichero Lite: https://huggingface.co/DICPlay/RusMind-3.2-Momentum/blob/main/RusMind-Momentum-3.2-Lite.gguf
- Fichero Q4_K_M: https://huggingface.co/DICPlay/RusMind-3.2-Momentum/blob/main/RusMind-Momentum-3.2-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/DICPlay/RusMind-3.2-Momentum/blob/main/RusMind-Momentum-3.2-Q8_0.gguf
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
