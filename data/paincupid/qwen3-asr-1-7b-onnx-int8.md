# paincupid/Qwen3-ASR-1.7B-ONNX-INT8

## Resumen

Qwen3-ASR-1.7B-ONNX-INT8 es un espejo de compatibilidad publicado por el usuario paincupid que redistribuye, sin modificaciones, los artefactos de ejecución en formato ONNX con cuantización INT8 del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. El repositorio no aporta entrenamiento ni conversión propios: su función es fijar una revisión inmutable de los ficheros que consume la aplicación MatrixApps, con sumas de verificación SHA-256 registradas en `provenance.json` y `SHA256SUMS`.

El modelo subyacente es un sistema ASR de 1.700 millones de parámetros, empaquetado para inferencia en dispositivo (on-device) mediante ONNX Runtime y cuantización de 8 bits. El repositorio ocupa 2,4 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y redistribución conservando los avisos de atribución.

Su relevancia es práctica: las conversiones ONNX de Qwen3-ASR son comunitarias y no proceden de un lanzamiento oficial de Qwen, de modo que un espejo con revisiones fijas y digests verificables reduce el riesgo de que una actualización silenciosa del repositorio de origen rompa una aplicación en producción o altere los pesos servidos a los usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; el repositorio solo documenta el artefacto ONNX) |
| Parametros totales | 1.700 millones (1.7B, segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (exportacion ONNX cuantizada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8), con ficheros auxiliares de runtime; repo de 2,4 GB |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Por el nombre y el pipeline declarado (`automatic-speech-recognition`) se trata de un modelo Qwen3-ASR de 1.700 millones de parámetros orientado a transcripción de voz, pero la model card no especifica si el codificador es un transformer convolucional, un encoder tipo Whisper, un esquema híbrido audio-texto o cualquier otra variante, ni detalla la composición del dataset, el número de horas de audio empleadas o si hubo etapas de ajuste fino supervisado o preferencias.

Lo que sí queda documentado es la cadena de conversión: los pesos provienen de conversiones comunitarias a ONNX publicadas por terceros (ilmina/qwen3-asr-1.7b-sherpa-onnx en HuggingFace, zengshuishui/Qwen3-ASR-onnx en ModelScope y el repositorio GitHub Wasser1462/Qwen3-ASR-onnx), no de una exportación oficial de Qwen. La innovación técnica del repositorio es de empaquetado y trazabilidad, no de modelado: revisiones fijas, tamaños de fichero y digests SHA-256 para todos los artefactos de runtime, con sincronización automática desactivada para mantener el snapshot inmutable.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), según el pipeline declarado en la model card.
- Inferencia en dispositivo mediante ONNX Runtime con pesos cuantizados a INT8.
- Ejecución offline una vez descargados y validados los artefactos, sin dependencia de servicios en la nube.
- Verificación de integridad de los ficheros descargados mediante `provenance.json` y `SHA256SUMS`.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio más allá de la transcripción: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Transcripción local en aplicaciones móviles y de escritorio: el formato ONNX INT8 y el tamaño de 1,7B parámetros permiten integrar el modelo en un runtime de inferencia en el propio dispositivo, sin enviar audio a servidores externos, lo que simplifica el cumplimiento de privacidad.
- Notas de voz y dictado en aplicaciones de productividad: el modelo se cargaría desde el snapshot fijado del espejo, de modo que una actualización del repositorio de origen no altere el comportamiento de la función de dictado entre versiones de la app.
- Subtitulado y generación de actas de reuniones en herramientas de escritorio: la inferencia on-device evita costes por minuto de API y permite procesar audio confidencial dentro de la organización.
- Distribución de artefactos en pipelines de CI/CD: los digests SHA-256 publicados permiten que un descargador automático valide cada fichero antes de empaquetarlo en una release, detectando corrupción o sustituciones.
- Archivado y reproducibilidad de experimentos: investigadores que necesitan reconstruir exactamente el mismo binario de inferencia meses después pueden apuntar a esta revisión inmutable en lugar de a un repositorio comunitario que puede cambiar.
- Integración en asistentes de voz embebidos: al no requerir conectividad, el modelo encaja en dispositivos con recursos limitados donde el coste de red o la latencia de ida y vuelta a la nube son inaceptables, siempre que la VRAM o memoria disponible permita cargar los 2,4 GB de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el espejo no añade afirmaciones sobre rendimiento en dispositivo ni sobre calidad de reconocimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio totaliza 2,4 GB de artefactos, por lo que se necesita al menos ese orden de magnitud de memoria para cargar los pesos INT8, más el overhead del runtime y de los buffers de audio.
- GPU recomendadas: no disponible. Al ser un artefacto ONNX orientado a on-device, el despliegue típico sería CPU o aceleradores integrados mediante ONNX Runtime, aunque también puede ejecutarse en GPU con el execution provider correspondiente.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 4 GB o más de memoria, dado el tamaño del artefacto, aunque no hay confirmación del autor.
- Opciones de despliegue: ONNX Runtime (incluido sherpa-onnx, citado en los repositorios de origen); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de artefacto ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| paincupid/Qwen3-ASR-1.7B-ONNX-INT8 | 1,7B | no disponible | ONNX INT8 | Apache 2.0 | Espejo inmutable con digests; conversión comunitaria |
| ilmina/qwen3-asr-1.7b-sherpa-onnx | 1,7B | no disponible | ONNX (sherpa-onnx) | no disponible en la informacion | Origen citado por el espejo; sin garantía de inmutabilidad |
| zengshuishui/Qwen3-ASR-onnx (ModelScope) | 1,7B | no disponible | ONNX | no disponible en la informacion | Origen citado por el espejo; alojado en ModelScope |
| Qwen/Qwen3-ASR-1.7B | 1,7B | no disponible | safetensors (pesos originales) | Apache 2.0 | Modelo original de Qwen; requiere conversión propia a ONNX |

## Limitaciones y advertencias

- El repositorio es un espejo comunitario, no una publicación oficial de Qwen ni de Alibaba Cloud; la calidad de la conversión ONNX INT8 no está avalada por los autores originales.
- La cuantización INT8 puede degradar la precisión de transcripción respecto a los pesos originales en punto flotante; no se publican métricas que cuantifiquen esa pérdida.
- No hay sincronización automática con los repositorios de origen: el snapshot no recibirá correcciones ni mejoras, y tampoco parches de seguridad del runtime subyacente.
- La model card no documenta idiomas soportados, sesgos conocidos, tasas de alucinación ni limitaciones de contexto, por lo que la evaluación de calidad corre por cuenta del integrador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, la redistribución debe conservar los avisos de atribución de Qwen y de los autores de la conversión ONNX; conviene revisar también las licencias de los repositorios de origen citados.
- Un puntero Git LFS por sí solo no constituye una copia válida del modelo: la integridad solo se garantiza si todos los ficheros listados están presentes y sus digests coinciden.

## Enlaces

- Repositorio del espejo: https://huggingface.co/paincupid/Qwen3-ASR-1.7B-ONNX-INT8
- Modelo original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Conversión ONNX de referencia (HuggingFace): https://huggingface.co/ilmina/qwen3-asr-1.7b-sherpa-onnx
- Conversión ONNX de referencia (ModelScope): https://modelscope.cn/models/zengshuishui/Qwen3-ASR-onnx
- Repositorio de exportación ONNX: https://github.com/Wasser1462/Qwen3-ASR-onnx
