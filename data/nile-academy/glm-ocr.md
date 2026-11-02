# nile-academy/glm-ocr

## Resumen

glm-ocr es un espejo de pesos de un modelo de reconocimiento óptico de caracteres (OCR) publicado por nile-academy bajo el identificador `nile-academy/glm-ocr`. El repositorio no contiene desarrollo propio: replica de forma "source-pinned" los checkpoints declarativos del modelo original `zai-org/GLM-OCR` (commit `2e85a62840ccac27daa451df36c736c4636b8628`), conservando los ficheros raíz y los subdirectorios `det/` (detección) y `rec/` (reconocimiento) como datos de despliegue seleccionados. El tamaño del repo es de 2,7 GB y los pesos se distribuyen en formato safetensors, sin código Python, sin checkpoints pickle y sin servidores de inferencia.

El modelo se orienta a la extracción de texto en imágenes y documentos en ocho idiomas (alemán, inglés, español, francés, japonés, coreano, ruso y chino). La model card original no está incluida en la información disponible, por lo que no se pueden confirmar arquitectura, número de parámetros ni longitud de contexto. La licencia declarada es MIT, lo que permite uso comercial, aunque la publicación advierte explícitamente que la verificación realizada cubre únicamente la identidad inmutable de los ficheros y no la precisión OCR, la fidelidad de cuantización ni la compatibilidad con dispositivos concretos.

Es relevante ahora porque el ecosistema de OCR open source está migrando hacia modelos multimodales con exportaciones ONNX y pesos safetensors, y este espejo ofrece una vía de consumo reproducible para pipelines que necesitan checkpoints con procedencia auditable (commit fijado y `publication.json` con identidades de fichero). No obstante, al tratarse de un espejo sin código de inferencia ni adaptadores, el consumidor debe aportar su propio runtime compilado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo OCR con componentes separados de detección y reconocimiento; arquitectura base no declarada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se menciona fidelidad de cuantización como no verificada, sin listar formatos) |
| Idiomas soportados | de, en, es, fr, ja, ko, ru, zh |
| Licencia | MIT |
| Formato de pesos | safetensors; checkpoints Paddle originales y exportaciones ONNX oficiales conservados por separado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original. La estructura del repositorio sugiere un diseño en dos etapas típico de los sistemas OCR de producción: un módulo de detección de texto (`det/`) y un módulo de reconocimiento (`rec/`), con pesos raíz adicionales. La mención a checkpoints Paddle y a exportaciones ONNX oficiales indica que el modelo original se entrenó y publicó en el ecosistema PaddlePaddle, con conversión posterior a ONNX para despliegue portable.

No hay datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas. La model card del espejo es puramente declarativa y de procedencia: no describe el proceso de entrenamiento, solo preserva los bytes originales y las identidades de fichero bajo `original/<source-commit>/`. Cualquier detalle arquitectónico debe consultarse en el repositorio upstream `zai-org/GLM-OCR`.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos, con módulos separados de detección y reconocimiento.
- Cobertura multilingüe declarada para ocho idiomas: alemán, inglés, español, francés, japonés, coreano, ruso y chino.
- Preservación de checkpoints Paddle originales y exportaciones ONNX oficiales, lo que permite despliegue en runtimes ONNX o Paddle según necesidad.
- Distribución en safetensors, apta para carga segura sin ejecución de pickle.
- La model card indica que el soporte de árabe es preferente pero no un criterio de elegibilidad del modelo; no se confirma calidad medida en ningún idioma.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking".

## Casos de uso

- Digitalización de archivo administrativo multilingüe: uso del par detección + reconocimiento para extraer texto de escaneos en español, francés y alemán, aprovechando la cobertura declarada de esos idiomas para lotes documentales europeos.
- Ingesta de facturas y albaranes en pipelines contables: el módulo `det/` localiza regiones de texto y `rec/` transcribe importes y campos, integrándose en un ETL que alimente un sistema de gestión con validación posterior por reglas.
- Procesamiento de documentación técnica en japonés, coreano y chino: útil para equipos que gestionan manuales de proveedores asiáticos y necesitan texto indexable en un motor de búsqueda interno.
- Enriquecimiento de repositorios documentales con metadatos: extracción de texto para generar índices full-text y embeddings en un RAG corporativo, usando los pesos ONNX para despliegue en contenedores sin dependencias de Paddle.
- Automatización de lectura de formularios en movilidad: al disponer de exportaciones ONNX, es viable compilar los pesos en adaptadores para dispositivos con runtime ONNX, siempre que se valide previamente el ajuste de dispositivo (no verificado por el publicador).
- Auditoría de procedencia en entornos regulados: el commit fijado y `publication.json` permiten reproducir exactamente los pesos consumidos, lo que facilita trazabilidad en despliegues con requisitos de compliance.
- Preprocesado para pipelines de moderación de contenido: transcripción de texto embebido en imágenes antes de aplicar clasificadores de texto, con la ventaja de que los pesos safetensors evitan riesgos de deserialización insegura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que la publicación verifica identidades de fichero, no precisión OCR, fidelidad de cuantización ni aceptación en dispositivos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo (2,7 GB) incluye pesos originales, exportaciones ONNX y checkpoints Paddle, por lo que no equivale al peso de un único conjunto de inferencia.
- GPU recomendadas: no disponible; el publicador no declara matrices de compatibilidad.
- Cabeza en GPU de consumo: no confirmado. Dado el tamaño del repo, es plausible que un subconjunto de pesos (por ejemplo, solo ONNX de inferencia) quepa en GPUs de consumo, pero requiere verificación empírica por el consumidor.
- Opciones de despliegue: ONNX Runtime o Paddle Inference para los checkpoints correspondientes; no se incluye servidor de inferencia ni código ejecutable en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nile-academy/glm-ocr | no disponible | no disponible | 8 idiomas | MIT | espejo en HF, sin código de inferencia |
| zai-org/GLM-OCR (upstream) | no disponible | no disponible | no disponible en esta ficha | MIT (declarada) | repositorio original en HF |
| Tesseract OCR | no aplica (motor clásico) | no aplica | >100 idiomas | Apache 2.0 | ampliamente desplegado, con binarios |
| PaddleOCR | no disponible | no disponible | decenas de idiomas | Apache 2.0 | ecosistema Paddle completo con código |

La comparación con Tesseract y PaddleOCR se ofrece como referencia de categoría (motores OCR open source), no como equivalencia técnica verificada, ya que no hay datos de rendimiento del modelo evaluado.

## Limitaciones y advertencias

- Es un espejo, no un modelo desarrollado por nile-academy: los derechos y el desarrollo pertenecen a los publicadores originales; cualquier soporte técnico debe dirigirse al upstream.
- La publicación no verifica precisión OCR, fidelidad de cuantización, ajuste a dispositivo ni aceptación en escritorio, móvil o navegador.
- Los metadatos de idioma no establecen calidad probada en ningún idioma; el soporte de árabe es preferente pero no un criterio de elegibilidad.
- No se incluye código Python, servidores de inferencia ni código ejecutable: el consumidor debe aportar adaptadores compilados y runtime propio.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; en OCR, los errores típicos son sustituciones de caracteres y fallos en texto de baja resolución, pero no hay evaluación publicada para este modelo.
- Licencia MIT permite uso comercial, pero se recomienda conservar los avisos upstream y revisar `LICENSE` y `publication.json` para confirmar la procedencia exacta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No hay fallback en la nube seleccionado ni garantía de mantenimiento del espejo.

## Enlaces

- Repositorio del espejo: https://huggingface.co/nile-academy/glm-ocr
- Modelo original upstream: https://huggingface.co/zai-org/GLM-OCR/tree/2e85a62840ccac27daa451df36c736c4636b8628
