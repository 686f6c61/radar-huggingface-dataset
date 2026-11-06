# paincupid/Qwen3-ASR-0.6B-ONNX-INT8

## Resumen

Qwen3-ASR-0.6B-ONNX-INT8 es un espejo de compatibilidad publicado por el usuario paincupid que redistribuye los artefactos de inferencia en formato ONNX con cuantización INT8 del modelo de reconocimiento automático de voz Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. El repositorio no contiene entrenamiento ni conversión propios: empaqueta los pesos ya convertidos por terceros y los fija a revisiones inmutables para que una aplicación concreta (MatrixApps) pueda descargarlos de forma reproducible.

El modelo base es un sistema ASR de aproximadamente 0,6 mil millones de parámetros, pensado para despliegue en dispositivo (on-device). La versión aquí publicada pesa alrededor de 1 GB en el repositorio, lo que encaja con un transformer cuantizado a 8 bits y orientado a ejecución local en CPU o aceleradores de baja potencia mediante runtimes ONNX.

Su relevancia es logística más que algorítmica: ofrece un snapshot verificado con sumas SHA-256 y un fichero `provenance.json` que registra revisiones y tamaños originales, algo útil para pipelines de distribución de aplicaciones que necesitan artefactos estables y auditables. No aporta mejoras de calidad ni de rendimiento sobre las conversiones comunitarias en las que se basa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para reconocimiento automático de voz (detalles no disponibles) |
| Parametros totales | aproximadamente 0,6 mil millones (según el nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3-ASR-0.6B en la documentación proporcionada. Por el nombre y la tarea, se trata de un modelo de reconocimiento automático de voz de la familia Qwen3, con unos 600 millones de parámetros, del que este repositorio solo redistribuye la versión convertida a ONNX y cuantizada a INT8.

El repositorio no documenta datos de entrenamiento, número de tokens, composición del corpus ni procesos de ajuste como RLHF o DPO. Tampoco describe innovaciones técnicas del modelo original. La model card indica explícitamente que este espejo "no añade afirmaciones sobre rendimiento en dispositivo ni sobre calidad de reconocimiento", y que los pesos se redistribuyen sin modificación alguna respecto a las conversiones comunitarias de referencia.

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto), según el pipeline declarado `automatic-speech-recognition`.
- Ejecución en dispositivo mediante runtime ONNX con pesos INT8, orientada a entornos con recursos limitados.
- Distribución reproducible: incluye `provenance.json` y `SHA256SUMS` para verificar integridad de los artefactos.
- No se documentan capacidades de diarización, traducción, tool calling, agentes ni procesamiento multimodal más allá del audio de entrada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Transcripción local en aplicaciones de escritorio o móviles: el formato ONNX INT8 permite integrar el modelo en una app que transcriba audio sin enviar datos a la nube, usando un runtime ONNX en CPU.
- Distribución fijada para aplicaciones empaquetadas: al mantener un snapshot inmutable con digests SHA-256, sirve como origen de descarga estable para builds de una app (MatrixApps) que necesitan artefactos idénticos entre versiones.
- Subtitulado offline de reuniones o notas de voz: un modelo de 0,6B cuantizado a INT8 cabe en equipos de gama media y puede transcribir grabaciones cortas en local.
- Verificación de integridad en pipelines de CI: los ficheros `SHA256SUMS` y `provenance.json` permiten validar que los pesos descargados coinciden con las revisiones originales antes de desplegarlos.
- Prototipado de ASR en entornos sin GPU: al ser ONNX INT8, se puede ejecutar con `onnxruntime` en CPU para pruebas de concepto y comparativas de latencia.
- Archivado y espejo ante caídas de upstream: conserva una copia de los artefactos de conversión comunitaria por si los repositorios originales dejan de estar disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa aproximadamente 1 GB; la inferencia INT8 requiere del orden de 1 GB de memoria, aunque la cifra exacta no está documentada.
- GPU recomendadas: no disponible. Al ser ONNX INT8, el modelo está pensado para ejecución en CPU y aceleradores ligeros más que para GPU de datacenter.
- GPU de consumo: no se documenta compatibilidad específica con RTX 4090, RTX 3090 u otras; el enfoque on-device sugiere que puede ejecutarse en hardware modesto, pero sin cifras publicadas.
- Opciones de despliegue: `onnxruntime` (CPU/GPU), sherpa-onnx (el repositorio de origen `csukuangfj2/sherpa-onnx-qwen3-asr-0.6B-int8` apunta a ese ecosistema). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| paincupid/Qwen3-ASR-0.6B-ONNX-INT8 (este) | ~0,6B | ONNX INT8 | Apache 2.0 | Espejo comunitario con verificación SHA-256 |
| csukuangfj2/sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25 | ~0,6B | ONNX INT8 | no disponible | Conversión comunitaria de origen para sherpa-onnx |
| zengshuishui/Qwen3-ASR-onnx (ModelScope) | ~0,6B | ONNX | no disponible | Conversión comunitaria en ModelScope |
| Qwen/Qwen3-ASR-0.6B | ~0,6B | safetensors (presumiblemente) | Apache 2.0 | Modelo original de Qwen |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: no aporta mejoras de calidad ni de rendimiento; cualquier limitación del modelo base y de la conversión ONNX INT8 se hereda íntegramente.
- La cuantización INT8 puede degradar la precisión de transcripción respecto a los pesos originales en precisión completa; no se publican métricas que cuantifiquen esa pérdida.
- No hay sincronización automática con upstream: si los repositorios originales se actualizan o corrigen errores, este snapshot no los recogerá.
- La integridad solo está garantizada si se validan todos los ficheros listados; un puntero Git LFS aislado no constituye una copia válida del modelo.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación o errores de transcripción.
- Aunque la licencia declarada es Apache 2.0, la autoría original corresponde al equipo Qwen y a los autores de las conversiones; conviene conservar los avisos de atribución al redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de uso ni validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/paincupid/Qwen3-ASR-0.6B-ONNX-INT8
- Modelo original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Conversión sherpa-onnx de referencia: https://huggingface.co/csukuangfj2/sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25
- Conversión en ModelScope: https://modelscope.cn/models/zengshuishui/Qwen3-ASR-onnx
- Repositorio de exportación ONNX: https://github.com/Wasser1462/Qwen3-ASR-onnx
