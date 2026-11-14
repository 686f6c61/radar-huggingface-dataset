# reverie-studio/Qwen-Image-Edit-2511-Lightning

## Resumen

Qwen-Image-Edit-2511-Lightning es un LoRA de destilación de 4 pasos para el modelo de edición de imagen Qwen-Image-Edit-2511. Lo desarrolla el equipo lightx2v y este repositorio concreto es un espejo (mirror) publicado por Reverie Studio, que redistribuye el fichero `Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors` sin modificaciones, con el SHA256 idéntico al original. No se trata de un modelo completo, sino de un adaptador que se aplica sobre el modelo base de edición de imagen de Qwen.

El propósito del LoRA es reducir drásticamente el número de pasos de inferencia necesarios para generar una edición de imagen: frente a los pipelines de difusión habituales que requieren decenas de pasos, esta destilación permite obtener resultados con 4 pasos, lo que se traduce en una reducción de latencia de aproximadamente un orden de magnitud en la generación. Reverie lo utiliza a escala 1.0 en su aplicación, y el espejo existe para centralizar la descarga de todos los modelos de la app en un único repositorio.

La relevancia actual del artefacto es práctica: facilita el despliegue de edición de imágenes con Qwen-Image-Edit-2511 en entornos donde el coste por generación o la latencia son críticos, manteniendo la licencia Apache-2.0 del original. El repositorio incluye un fichero `SHA256SUMS` para verificar la integridad de cada archivo. No se dispone de información sobre arquitectura interna del LoRA, datos de entrenamiento ni benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de destilación (4 pasos) sobre el modelo de difusión Qwen-Image-Edit-2511; no disponible el detalle de la arquitectura interna del adaptador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | pesos en bf16 (`-4steps-V1.0-bf16.safetensors`); no se documentan otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fichero único `Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA de destilación para el modelo Qwen-Image-Edit-2511, orientado a la edición de imágenes. La técnica de destilación reduce el número de pasos de muestreo necesarios de los pipelines de difusión estándar a 4 pasos (variante V1.0), lo que implica que el adaptador ha sido entrenado para aproximar la trayectoria de muestreo del modelo profesor en muy pocos pasos. El fichero se distribuye en precisión bf16 y se aplica sobre el modelo base con escala 1.0 según el uso documentado por Reverie.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se emplearon técnicas adicionales como RLHF o DPO (no aplicables habitualmente a LoRAs de destilación de difusión). Tampoco se documentan innovaciones técnicas más allá de la propia destilación a 4 pasos. El repositorio es un espejo sin modificaciones: el SHA256 del fichero coincide con el del repositorio original de lightx2v, por lo que cualquier detalle de entrenamiento debe consultarse en la fuente.

## Capacidades

- Edición de imágenes sobre el modelo base Qwen-Image-Edit-2511, con generación en 4 pasos de muestreo.
- Reducción de latencia de inferencia respecto al pipeline completo del modelo base, al disminuir el número de evaluaciones del modelo de difusión.
- Integración como adaptador LoRA aplicable con escala 1.0 (uso documentado por Reverie).
- Compatibilidad con el ecosistema de Qwen-Image-Edit-2511 (heredada del modelo base, no detallada en este repo).
- Verificación de integridad mediante `SHA256SUMS`.
- No se documentan en la información disponible capacidades de tool calling, agentes, multilingüismo, visión-a-texto ni modos de razonamiento, por tratarse de un adaptador de generación/edición de imagen.

## Casos de uso

- Edición de imágenes interactiva de baja latencia: aplicar el LoRA sobre Qwen-Image-Edit-2511 con 4 pasos permite responder a instrucciones de edición en aplicaciones de usuario final donde la espera por generación debe ser mínima, que es precisamente el escenario para el que Reverie lo utiliza a escala 1.0.
- Prototipado rápido de pipelines de edición: al reducir los pasos de muestreo, los ciclos de prueba y error en el diseño de flujos de edición de imagen se acortan sin cambiar el modelo base.
- Generación por lotes con restricciones de coste: procesar grandes volúmenes de imágenes con menos pasos de difusión reduce el cómputo por imagen en GPUs de inferencia.
- Integración en aplicaciones de escritorio o móviles con MLX/mflux: el repo está etiquetado con `mlx` y `mflux`, lo que apunta a despliegue en hardware Apple Silicon para edición de imagen local.
- Servicios de edición de imagen como API: desplegar el modelo base con este LoRA para ofrecer endpoints de edición con latencias compatibles con uso interactivo.
- Verificación y auditoría de artefactos en producción: el uso de `SHA256SUMS` y el espejo único facilitan la trazabilidad y la descarga reproducible en pipelines de MLOps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen-Image-Edit-2511, no del LoRA (el fichero del adaptador ocupa 0,8 GB en el repo).
- GPU recomendadas: no disponible. El etiquetado `mlx`/`mflux` sugiere soporte para Apple Silicon; para CUDA no se documentan requisitos.
- ¿Cabe en GPU de consumo? No disponible; el adaptador en sí es pequeño (0,8 GB en bf16), pero el modelo base de difusión determina el requisito real de memoria.
- Opciones de despliegue: ecosistema MLX/mflux según las etiquetas del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a difusión).
- Latencia y throughput estimados: no disponibles; la única cifra documentada es la reducción a 4 pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-Edit-2511-Lightning (este repo) | LoRA de destilación sobre Qwen-Image-Edit-2511 | 4 (V1.0) | Apache-2.0 | Hugging Face (espejo de lightx2v) |
| lightx2v/Qwen-Image-Edit-2511-Lightning (original) | LoRA de destilación sobre Qwen-Image-Edit-2511 | 4 (V1.0) | Apache-2.0 | Hugging Face |
| Qwen-Image-Edit-2511 (modelo base) | Modelo de difusión de edición de imagen | no disponible en la información | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparado (calidad de edición, FID, CLIP score u otras métricas) en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere el modelo base Qwen-Image-Edit-2511 para funcionar.
- La destilación a 4 pasos puede degradar la calidad o el detalle respecto al muestreo completo del modelo base; no se aportan métricas que cuantifiquen esa posible pérdida.
- No se documentan sesgos conocidos ni riesgos específicos de alucinación visual en la información disponible; los sesgos del modelo base se heredan y deben consultarse en su model card.
- No se documentan limitaciones de idioma ni de resolución de imagen en este repositorio.
- Licencia Apache-2.0, que permite uso comercial, pero debe verificarse la licencia del modelo base Qwen-Image-Edit-2511 antes de desplegar en producción.
- El repositorio es un espejo de terceros (Reverie Studio): para soporte, actualizaciones y documentación de entrenamiento, la fuente autorizada es lightx2v.
- El uso documentado es a escala 1.0; otras escalas no están validadas por el autor del espejo.
- No se documentan requisitos de hardware ni latencias medidas, por lo que la planificación de capacidad debe hacerse a partir del modelo base.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/reverie-studio/Qwen-Image-Edit-2511-Lightning
- Repositorio original del LoRA: https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
- Organización Reverie Studio: https://huggingface.co/reverie-studio
