# owensong/Inflect-Micro-v3

## Resumen

Inflect Micro v3 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por owensong, publicado como paquete de acceso anticipado no comercial en Hugging Face. Se trata de la variante más pequena de la familia Inflect v3, que también incluye Mini y Atom. El núcleo de síntesis entrenado contiene 11.787.634 parámetros y genera audio nativo a 24 kHz, lo que lo sitúa en la categoría de modelos TTS ultraligeros orientados a inferencia local en CPU.

El modelo resuelve el problema de generar voz inglesa de calidad razonable sin depender de servicios en la nube ni de GPU dedicada. Ofrece seis voces fijas predefinidas (hope, sophia, cassidy, james, jasper, mark) y no expone clonación por audio de referencia ni etiquetas de estilo aprendidas. Su peso serializado ocupa 48,06 MB, y el repositorio completo apenas 0,1 GB, lo que facilita su distribución y despliegue en entornos con recursos limitados.

Es relevante ahora porque representa una opcion de TTS local de muy bajo coste computacional, con receta de CPU incluida y verificación de integridad mediante `release-manifest.json`. No obstante, su licencia `inflect-preview-evaluation-1.0` restringe el uso a evaluación no comercial, lo que limita su adopción en producción sin acuerdo previo con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Núcleo de síntesis neuronal propietario (FastMicro); detalles internos no disponibles |
| Parametros totales | 11.787.634 (núcleo de síntesis) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | inflect-preview-evaluation-1.0 (acceso anticipado, no comercial) |
| Formato de pesos | PyTorch (`models/micro/weights.pt`, 48.056.467 bytes) |

## Arquitectura y entrenamiento

La información pública describe un "núcleo de síntesis aprendido" denominado FastMicro, con 11.787.634 parámetros, que sustituye al anterior Micro preview de 12,63M parámetros. No se especifica si la arquitectura interna es un transformer, un modelo basado en difusión, un vocoder neuronal o una combinación híbrida; la model card únicamente detalla el recuento de parámetros, el tamaño serializado del fichero de pesos y la frecuencia de muestreo nativa de 24 kHz.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card indica explícitamente que los parámetros del núcleo no incluyen los activos externos de pronunciación ni los activos fijos de condicionamiento de voz, y que el fichero de pesos no constituye la instalación completa: se requieren también activos de frontend, runtime y vendor. Los componentes opcionales de Mini (como el enhancer de 48 kHz) se contabilizan por separado y no forman parte de este paquete.

## Capacidades

- Síntesis de voz en inglés a 24 kHz con salida PCM16 WAV.
- Seis voces fijas predefinidas: `hope`, `sophia`, `cassidy`, `james`, `jasper`, `mark`.
- Inferencia local en CPU con receta incluida (`requirements-cpu.txt`) en Python 3.12.
- Ejecución opcional en CUDA mediante `--device cuda`, requiriendo una instalación compatible de PyTorch/CUDA no incluida.
- Verificación de integridad del paquete mediante `synthesize.py --verify` y `release-manifest.json`.
- Preparación conservadora de números y gestión de chunks con metadatos de retorno.
- No soporta clonación de voz por audio de referencia.
- No soporta etiquetas de estilo o eventos como `[laugh]` o `[excited]`.
- No soporta conversión de acento ni otras lenguas distintas del inglés.
- No expone tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Lectura de artículos y documentos en local: el modelo puede convertir texto inglés en audio a 24 kHz íntegramente en CPU, sin enviar contenido a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de asistentes de voz: las seis voces fijas permiten generar diálogos multi-personaje en fase de diseño sin necesidad de grabar referencias ni entrenar modelos adicionales.
- Accesibilidad en aplicaciones de escritorio: integración en lectores de pantalla o herramientas de lectura para usuarios con discapacidad visual, gracias a su reducido tamaño (48 MB de pesos) y su receta de instalación en CPU.
- Evaluación comparativa de sistemas TTS: la posibilidad de fijar revisión, voz, dispositivo, semilla y perfil permite reproducir comparaciones controladas entre modelos de la familia Inflect y alternativas.
- Generación de avisos y notificaciones pregrabadas: síntesis por lotes de mensajes cortos en inglés para sistemas de megafonía o alertas, donde la latencia de un modelo de 11,8M de parámetros en CPU es suficiente.
- Investigación en síntesis de voz de bajo coste: servir como línea base ligera para estudiar calidad, prosodia y naturalidad en modelos de menos de 12M de parámetros, siempre bajo la licencia de evaluación no comercial.
- Pruebas de integración en pipelines de audio: validación de formatos WAV PCM16 a 24 kHz y de la gestión de chunks antes de migrar a variantes mayores de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecución en CPU.
- GPU recomendadas: no se especifican; `--device cuda` requiere una instalación compatible de PyTorch/CUDA aportada por el usuario.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del núcleo (11,8M de parámetros, 48 MB de pesos), aunque no se confirma oficialmente.
- Opciones de despliegue: CLI propia (`synthesize.py`) con receta de CPU en Python 3.12 y `requirements-cpu.txt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Tamaño del repositorio completo: 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inflect Micro v3 | 11.787.634 (núcleo) | 24 kHz, 6 voces fijas | Inglés | inflect-preview-evaluation-1.0 (no comercial) | Hugging Face, acceso anticipado |
| Inflect Mini v3 | No disponible en la información proporcionada | No disponible | Inglés | No disponible | Hugging Face (familia Inflect v3) |
| Inflect Atom v3 | No disponible en la información proporcionada | No disponible | Inglés | No disponible | Hugging Face (familia Inflect v3) |

No se dispone de datos de benchmarks ni de especificaciones completas de Mini y Atom en la información proporcionada, por lo que la comparación cuantitativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- Licencia `inflect-preview-evaluation-1.0`: uso restringido a evaluación no comercial; cualquier uso comercial requiere revisión de los términos en `LICENSE.md`.
- Modelo exclusivamente en inglés; el texto no soportado falla de forma explícita en lugar de generar una salida degradada.
- No soporta clonación de voz, conversión de acento, etiquetas de estilo ni eventos generados.
- No incluye el enhancer de 48 kHz de Cassidy Q1500, que es un componente específico de Mini.
- El fichero de pesos no es la instalación completa: se requieren activos de frontend, runtime y vendor, y la instalación puede necesitar acceso a red.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero la pronunciación de números, símbolos y scripts no soportados puede fallar o requerir verificación mediante los metadatos devueltos.
- No se garantiza compatibilidad bit a bit entre plataformas, runtimes ni instalaciones CUDA limpias.
- El estado es de acceso anticipado ("early access"), no un lanzamiento final; la disponibilidad de funciones se limita a lo descrito en el paquete.
- No se han publicado datos sobre sesgos, calidad prosódica ni evaluación perceptual.

## Enlaces

- Hugging Face: https://huggingface.co/owensong/Inflect-Micro-v3
- Repositorio de archivos: https://huggingface.co/owensong/Inflect-Micro-v3/tree/main
- GitHub: https://github.com/owenawsong/Inflect
- Discord: https://discord.gg/CVJYedvzvp
- Licencia: https://huggingface.co/owensong/Inflect-Micro-v3/blob/main/LICENSE.md
