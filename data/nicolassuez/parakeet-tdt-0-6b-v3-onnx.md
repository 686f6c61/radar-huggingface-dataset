# Nicolassuez/parakeet-tdt-0.6b-v3-onnx

## Resumen

parakeet-tdt-0.6b-v3-onnx es la exportación a ONNX con cuantización int8 dinámica del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, desarrollado originalmente por NVIDIA. Esta ficha concreta es un espejo (mirror) sin modificaciones publicado por el usuario Nicolassuez, que copia los ficheros int8 generados por istupakov a partir del modelo original. El objetivo declarado del espejo es que la dictación local de la aplicación aSup no dependa de un repositorio de terceros.

El modelo resuelve transcripción de voz a texto multilingüe de alto rendimiento para 25 idiomas europeos (inglés, castellano, francés, alemán, italiano, portugués, neerlandés, lenguas escandinavas, eslavas, bálticas y griego, entre otras). Se basa en una arquitectura NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) y 600 millones de parámetros, lo que lo sitúa en un tamaño manejable para inferencia en CPU y GPU de gama media.

La relevancia de esta variante radica en su formato: los ficheros ONNX int8 permiten ejecutar el modelo con `onnxruntime` sin depender de PyTorch ni de NeMo, lo que simplifica el despliegue en aplicaciones de escritorio, servidores ligeros y entornos embebidos. El repositorio ocupa 0,7 GB e incluye el preprocesador de características mel, el encoder y el decodificador conjuntamente con el vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer (encoder) con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (encoder y decoder-joint); el repositorio original incluye además fp32, no copiado en este espejo |
| Idiomas soportados | 25 idiomas europeos: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`nemo128.onnx`, `encoder-model.int8.onnx`, `decoder_joint-model.int8.onnx`, `vocab.txt`, `config.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es un sistema ASR de tipo Conformer, la arquitectura de NVIDIA NeMo que combina atención multi-cabeza con convoluciones para capturar dependencias locales y globales en la señal de audio. Sobre el encoder se sitúa un decodificador TDT (Token-and-Duration Transducer), que predice conjuntamente el token de salida y su duración, lo que permite un alineamiento más eficiente que los transductores clásicos y favorece la transcripción de alta velocidad. El preprocesador `nemo128.onnx` convierte la forma de onda en 128 características mel antes de entrar al encoder.

La versión v3 amplía el soporte de idiomas respecto a v2 (que era solo inglés) hasta 25 lenguas europeas y realiza detección automática del idioma. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o ajuste fino supervisado más allá del entrenamiento ASR estándar. La exportación a ONNX con cuantización int8 dinámica es una innovación de despliegue: reduce el peso y acelera la inferencia en CPU manteniendo los ficheros byte a byte idénticos a la revisión fuente (`8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce`).

## Capacidades

- Transcripción de voz a texto (ASR) en 25 idiomas europeos con detección automática de idioma.
- Reconocimiento de habla de alta velocidad, adecuado para dictado en tiempo real y procesamiento por lotes.
- Salida de transcripción con marcas de inicio de palabra mediante el token `▁` en el vocabulario.
- Ejecución sin PyTorch: compatible con `onnxruntime` y con la librería `onnx-asr`.
- Funcionamiento local y offline, sin dependencia de servicios en la nube.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio generativo; es un modelo puramente ASR.
- No se documentan capacidades de diarización de hablantes ni de puntuación automática en la información disponible.

## Casos de uso

- Dictado local en aplicaciones de escritorio: integración mediante `onnx-asr` para transcribir audio del micrófono en tiempo real sin conexión, con el modelo int8 cargado en memoria (0,7 GB de repositorio).
- Subtitulado automático de vídeo y audio multilingüe: el modelo detecta el idioma y transcribe contenido en cualquiera de los 25 idiomas soportados, útil para pipelines de generación de subtítulos.
- Transcripción de reuniones y notas de voz: procesamiento por lotes de grabaciones largas con un encoder Conformer eficiente en CPU, adecuado para servidores sin GPU dedicada.
- Asistentes de voz en entornos embebidos: al ejecutarse con `onnxruntime` y cuantización int8, puede desplegarse en dispositivos de gama media o en contenedores ligeros.
- Accesibilidad: conversión de voz a texto para personas con discapacidad auditiva o para interfaces controladas por voz en aplicaciones de productividad.
- Archivado y búsqueda de contenido hablado: transcripción masiva de archivos de audio para indexación y búsqueda textual posterior en múltiples lenguas europeas.
- Integración en aplicaciones de notas (como el caso declarado de aSup): el espejo garantiza disponibilidad estable del modelo sin depender de un repositorio de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 600M parámetros en int8, el peso de los ficheros ONNX ronda los 0,7 GB; la inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 2-4 GB de memoria libre debería poder alojar el modelo, aunque no hay datos oficiales de rendimiento por GPU.
- GPU de consumo: cabe en GPUs de consumo con memoria suficiente (por ejemplo, RTX 3060 o superiores), aunque no se dispone de cifras de latencia o throughput verificadas.
- Opciones de despliegue: `onnxruntime` (librería indicada), `onnx-asr` (interfaz de alto nivel), y cualquier runtime compatible con ONNX. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo ASR y no un LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-onnx (este) | 600M | 25 europeos | ONNX int8 | CC BY 4.0 | Espejo de la exportación de istupakov |
| nvidia/parakeet-tdt-0.6b-v3 | 600M | 25 europeos | NeMo / PyTorch | CC BY 4.0 | Modelo original de NVIDIA |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 600M | 25 europeos | ONNX int8 y fp32 | CC BY 4.0 | Exportación fuente de este espejo |
| parakeet-tdt-0.6b-v2 | 600M | inglés | NeMo / PyTorch | CC BY 4.0 | Versión anterior, solo inglés |

No se dispone de datos de benchmarks comparativos en la información proporcionada para contrastar rendimiento frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: cualquier error o limitación del modelo original de NVIDIA se hereda íntegramente.
- No se han publicado métricas de sesgo, robustez ante acentos o ruido, ni tasas de error por idioma en la información disponible.
- Riesgo de alucinación en ASR: como todo modelo de transcripción, puede generar texto plausible pero incorrecto en segmentos de audio ruidosos o ininteligibles.
- La longitud de contexto de audio no está documentada; no se especifica la duración máxima de segmento que el encoder puede procesar de una vez.
- El repositorio solo incluye los ficheros int8; no contiene los pesos fp32 del repositorio original, lo que limita la experimentación con otras precisiones.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio citar a NVIDIA como autor del modelo y a istupakov como autor de la exportación ONNX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se documentan capacidades de puntuación, diarización ni formato de salida enriquecido; la salida es texto plano con marcas de inicio de palabra.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/Nicolassuez/parakeet-tdt-0.6b-v3-onnx
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX fuente: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/parakeet-tdt-0_6b/modelcard
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
