# llaosdigital/psiuu

## Resumen

Psiuu es un repositorio de modelos de reconocimiento automático del habla (ASR) publicado por llaosdigital, cuyo propósito es servir como backend de la aplicación homónima de transcripción de voz local. No se trata de un modelo entrenado desde cero, sino de un contenedor de pesos ya existentes redistribuidos en formato GGUF para su uso en inferencia local. El repositorio alberga principalmente `whisper-medium-Q8_0.gguf`, una cuantización Q8_0 del Whisper Medium de OpenAI, y `parakeet-tdt-0.6b-v3-Q8_0.gguf`, la versión GGUF del Parakeet TDT 0.6B v3 de NVIDIA.

La relevancia de este repositorio es operativa más que científica: empaqueta dos modelos ASR de referencia en un formato (GGUF) que permite ejecutarlos en CPU y GPU de consumo mediante runtimes como llama.cpp, sin necesidad de infraestructura en la nube. El Whisper Medium subyacente cuenta con 627.052.166 parámetros según los safetensors del repositorio, y el repositorio completo ocupa 1,6 GB.

Conviene subrayar que el autor no documenta ningún proceso de entrenamiento, ajuste fino ni evaluación propia. La model card se limita a indicar la procedencia de cada fichero GGUF, su licencia y el hash SHA-256 del fichero de Whisper. Cualquier dato de rendimiento o capacidad debe atribuirse, por tanto, a los modelos originales de OpenAI y NVIDIA, no a este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) para `whisper-medium-Q8_0.gguf`; Parakeet TDT (FastConformer + decoder TDT) para `parakeet-tdt-0.6b-v3-Q8_0.gguf` |
| Parametros totales | 627.052.166 (safetensors del repositorio, correspondientes a Whisper Medium); Parakeet TDT 0.6B v3: aproximadamente 0,6 mil millones segun su denominacion, cifra exacta no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper Medium original: ventana de audio de 30 segundos por segmento) |
| Tipos de cuantizacion | Q8_0 (ambos ficheros GGUF) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0-and-cc-by-4.0 (Apache 2.0 para el componente Whisper; CC-BY 4.0 para el componente Parakeet) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no incluye entrenamiento propio. El componente principal, `whisper-medium-Q8_0.gguf`, es una cuantización a 8 bits (Q8_0) del Whisper Medium de OpenAI, un transformer encoder-decoder diseñado para transcripción y traducción de voz, redistribuido sin modificación desde `handy-computer/whisper-medium-gguf` (revisión `ec78f06fded51aa82cde751678b78f76f78c8b7f`). El segundo componente, `parakeet-tdt-0.6b-v3-Q8_0.gguf`, es el Parakeet TDT 0.6B v3 de NVIDIA en GGUF, también redistribuido sin alteración desde `handy-computer/parakeet-tdt-0.6b-v3-gguf`; Parakeet TDT emplea una arquitectura FastConformer con decoder *token-and-duration transducer* (TDT), orientada a ASR de alto rendimiento y baja latencia.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO, ya que todo ello corresponde a los modelos originales de OpenAI y NVIDIA y no se reproduce en esta model card. La única innovación técnica atribuible al repositorio es el empaquetado en GGUF con cuantización Q8_0, que reduce el peso en disco y memoria frente a los pesos originales en punto flotante y habilita la ejecución en runtimes locales.

## Capacidades

- Transcripción de voz a texto (speech-to-text) mediante el pipeline `automatic-speech-recognition`.
- Dos motores ASR alternativos: Whisper Medium (encoder-decoder, robusto y ampliamente validado) y Parakeet TDT 0.6B v3 (transducer, optimizado para latencia).
- Ejecución local gracias al formato GGUF, sin dependencia de APIs en la nube.
- Cuantización Q8_0, que preserva buena parte de la precisión del modelo original con menor huella de memoria.
- Soporte multilingüe: no disponible en la información proporcionada (depende de las capacidades de los modelos base).
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible; el modelo es específicamente ASR.
- Capacidades de visión o audio más allá de la transcripción: no disponible.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: la aplicación Psiuu usa estos GGUF para convertir audio en texto sin enviar datos a servidores externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Dictado por voz en el escritorio: integración de un motor ASR local en editores o herramientas de productividad, con Whisper Medium como opción de mayor precisión y Parakeet TDT como opción de menor latencia.
- Subtitulado de vídeos y podcasts: generación de transcripciones con marcas de tiempo para contenido pregrabado, aprovechando la robustez de Whisper Medium en audio con ruido moderado.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en aplicaciones de escritorio o móviles que ejecutan el modelo en el propio dispositivo.
- Procesamiento por lotes de archivos de audio: transcripción de archivos en pipelines locales (por ejemplo, con llama.cpp) para archivado, indexación o búsqueda posterior.
- Prototipado e investigación en ASR: uso de los GGUF como referencia reproducible para comparar cuantizaciones Q8_0 frente a pesos originales en tareas de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, latencia ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,6 GB en total; el fichero Whisper Medium Q8_0 pesa aproximadamente 0,6-0,7 GB y el Parakeet TDT 0.6B Q8_0 un valor similar, por lo que la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para ejecución completa en GPU; también es viable la inferencia en CPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes; también en equipos sin GPU dedicada mediante CPU.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (por ejemplo, Ollama o servidores basados en llama.cpp); vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Psiuu (Whisper Medium Q8_0) | 627 M | no disponible | GGUF | Apache 2.0 | HuggingFace |
| Whisper Medium original (OpenAI) | 769 M | 30 s por segmento | PyTorch/safetensors | MIT | HuggingFace, OpenAI |
| Parakeet TDT 0.6B v3 (NVIDIA) | ~0,6 B | no disponible | NeMo/GGUF | CC-BY 4.0 | HuggingFace, NVIDIA NeMo |
| Whisper Small (OpenAI) | 244 M | 30 s por segmento | PyTorch/safetensors | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no aporta evaluación propia; el rendimiento depende enteramente de los modelos base de OpenAI y NVIDIA.
- La cuantización Q8_0 puede introducir una degradación menor de precisión frente a los pesos originales en punto flotante, no cuantificada en la información disponible.
- No se documentan los idiomas soportados ni el comportamiento en idiomas distintos del inglés o de los cubiertos por los modelos base.
- Riesgo de alucinación en la transcripción: los modelos ASR pueden generar texto plausible en segmentos con ruido, silencio o audio de baja calidad.
- Sesgos: no documentados en la información disponible; heredados de los datos de entrenamiento de los modelos originales.
- Licencia mixta: Apache 2.0 para el componente Whisper y CC-BY 4.0 para el componente Parakeet; es necesario cumplir ambas condiciones y conservar los avisos de atribución (`LICENSE` y `NOTICE`).
- El repositorio se distribuye como "otros" en el campo `license`, con nombre `apache-2.0-and-cc-by-4.0`; conviene verificar la compatibilidad antes de uso comercial.
- La fecha de creación del repositorio (2026-10-31) y su escasa tracción (0 likes, 524 descargas) sugieren que se trata de un empaquetado auxiliar de una aplicación, no de un modelo mantenido de forma independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/llaosdigital/psiuu
- Modelo base Whisper Medium: https://huggingface.co/openai/whisper-medium
- Repositorio de origen del GGUF de Whisper: https://huggingface.co/handy-computer/whisper-medium-gguf (revisión `ec78f06fded51aa82cde751678b78f76f78c8b7f`)
- Repositorio de origen del GGUF de Parakeet: https://huggingface.co/handy-computer/parakeet-tdt-0.6b-v3-gguf
- Modelo Parakeet TDT 0.6B v3 de NVIDIA: no disponible en la información proporcionada
- Paper de Whisper: no disponible en la información proporcionada
- Documentación de llama.cpp: no disponible en la información proporcionada
