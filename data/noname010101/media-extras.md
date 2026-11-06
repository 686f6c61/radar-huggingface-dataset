# Noname010101/media-extras

## Resumen

`Noname010101/media-extras` no es un modelo entrenado, sino un repositorio espejo (mirror) de pesos auxiliares empleados por una imagen de pod dedicada a generación de vídeo con ComfyUI, Wan 2.1 / Wan 2.2, SVI 2.0 Pro, RIFE y Real-ESRGAN. Su función es evitar que el arranque del pod dependa de repositorios de terceros: todos los ficheros son copias sin modificar de los originales, con la única excepción del renombrado de un LoRA de destilación de lightx2v para que coincida con el nombre que espera la imagen.

El contenido abarca LoRAs de destilación (lightx2v rank 32 para T2V 14B), LoRAs de SVI 2.0 Pro para Wan 2.2 I2V A14B (high noise y low noise), el modelo base Wan 2.1 T2V 14B en fp8 e4m3fn, el módulo VACE 14B en fp8, el text encoder umt5-xxl en fp8, el VAE de Wan 2.1 en bf16, dos modelos de interpolación de frames (RIFE 4.9) y dos modelos de superresolución (Real-ESRGAN x2plus y x4plus). El repositorio ocupa 27,8 GB y no incluye model card técnica del modelo en sí, sino una tabla de ficheros con hashes SHA-256 y procedencia.

Es relevante ahora porque agrupa en un único punto de descarga todos los artefactos necesarios para montar un pipeline de generación de vídeo con Wan en ComfyUI, con licencias compatibles con redistribución (Apache-2.0, MIT y BSD-3-Clause) y verificación criptográfica por fichero. No debe confundirse con un modelo generativo publicable: es infraestructura de empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio de pesos auxiliares; incluye modelos basados en transformer de difusión (Wan 2.1 T2V 14B, Wan 2.1 VACE 14B, Wan 2.2 I2V A14B vía LoRA), text encoder T5 (umt5-xxl), VAE convolucional, redes de interpolación (RIFE) y superresolución (Real-ESRGAN) |
| Parametros totales | No disponible como modelo único; el mayor componente es Wan 2.1 T2V 14B (14 000 millones nominales) en fp8 e4m3fn (14,86 GB) |
| Parametros activos | No disponible (no es un MoE; Wan 2.2 I2V A14B se distribuye aquí solo como LoRAs, no como pesos completos) |
| Longitud de contexto | No disponible (modelos de difusión de vídeo; la longitud se mide en frames, no en tokens) |
| Tipos de cuantizacion | fp8 e4m3fn (Wan 2.1 T2V 14B, VACE 14B, umt5-xxl), bf16 (VAE Wan 2.1), safetensors de precisión original para LoRAs, .pth para RIFE y Real-ESRGAN |
| Idiomas soportados | No disponible (el text encoder umt5-xxl es multilingüe, pero el repositorio no declara idiomas) |
| Licencia | Mixta por fichero: Apache-2.0 (Wan 2.1, umt5-xxl, LoRA lightx2v), MIT (SVI 2.0 Pro, RIFE), BSD-3-Clause (Real-ESRGAN). La model card declara `license: other` con `license_name: mixed-see-table` |
| Formato de pesos | safetensors (modelos y LoRAs), .pth (RIFE, Real-ESRGAN) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrega artefactos de terceros. Los componentes principales son modelos de difusión de vídeo de la familia Wan. Wan 2.1 T2V 14B es un transformer de difusión para texto-a-vídeo; Wan 2.1 VACE 14B es el módulo de control y edición de vídeo de la misma familia; Wan 2.2 I2V A14B aparece únicamente como LoRAs de SVI 2.0 Pro (versión 2.0, high noise y low noise) que se aplican sobre el modelo base de imagen-a-vídeo. El text encoder es umt5-xxl (T5 XXL de Google) en fp8, y el VAE de Wan 2.1 se distribuye en bf16.

Los LoRAs de destilación de lightx2v (rank 32, cfg step distill) permiten reducir el número de pasos de muestreo y prescindir de CFG, lo que acelera la inferencia en producción. RIFE 4.9 se emplea para interpolación de frames y Real-ESRGAN x2plus/x4plus para superresolución de los fotogramas generados. No se dispone de información sobre datasets de entrenamiento, número de tokens, composición de datos ni procesos de RLHF/DPO en la información proporcionada; esos detalles pertenecen a los repositorios upstream (Wan-AI, lightx2v, vita-video-gen, hzwer, xinntao).

## Capacidades

- Generación de vídeo texto-a-vídeo mediante Wan 2.1 T2V 14B (pesos fp8 incluidos).
- Edición y control de vídeo mediante el módulo Wan 2.1 VACE 14B (fp8).
- Imagen-a-vídeo con Wan 2.2 I2V A14B mediante los LoRAs de SVI 2.0 Pro v2.0 (high noise y low noise).
- Aceleración de muestreo mediante el LoRA de destilación lightx2v rank 32 (cfg step distill).
- Codificación de texto con umt5-xxl en fp8 para prompts multilingües (capacidad heredada del encoder, no declarada en el repositorio).
- Decodificación de latentes a vídeo con el VAE de Wan 2.1 en bf16.
- Interpolación de frames con RIFE 4.9 para aumentar la tasa de fotogramas.
- Superresolución de fotogramas con Real-ESRGAN x2plus y x4plus.
- No incluye tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No incluye capacidades de audio ni de visión general fuera del pipeline de vídeo.

## Casos de uso

- Despliegue reproducible de pods de generación de vídeo: el repositorio permite que una imagen de ComfyUI descargue todos los pesos desde un único origen con hashes verificables, eliminando dependencias de repositorios de terceros en el arranque.
- Pipeline texto-a-vídeo en producción: combinando Wan 2.1 T2V 14B fp8 con el LoRA lightx2v se reduce el número de pasos de muestreo, lo que baja el coste por clip en GPUs de datacenter.
- Edición de vídeo existente: el módulo VACE 14B permite tareas de control y edición sobre vídeo de entrada, útil en postproducción automatizada.
- Imagen-a-vídeo con control de ruido: los LoRAs SVI 2.0 Pro high/low noise sobre Wan 2.2 I2V A14B permiten ajustar el comportamiento del muestreo en distintas fases de la generación.
- Mejora de calidad de clips generados: RIFE 4.9 interpola frames para subir la tasa de fotogramas y Real-ESRGAN x2plus/x4plus aumenta la resolución de los fotogramas, en un paso posterior a la difusión.
- Replicación de entornos de investigación: los SHA-256 por fichero facilitan la verificación de integridad en clústeres y la auditoría de qué pesos exactos se usaron en cada experimento.
- Distribución en entornos con restricciones de red: al ser un mirror público, sirve como origen único para imágenes de contenedor que no pueden acceder a múltiples repositorios upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de tamaño de ficheros, Wan 2.1 T2V 14B fp8 ocupa 14,86 GB, umt5-xxl fp8 6,73 GB, VACE 14B fp8 3,05 GB y el VAE bf16 0,25 GB; la suma de pesos supera los 25 GB, por lo que la inferencia completa requiere GPUs de datacenter con 40-80 GB de VRAM o descarga por etapas.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, el pipeline completo encaja en A100 80 GB o H100 80 GB; en GPUs de 24 GB (RTX 4090) sería necesario descargar y cargar componentes por separado.
- ¿Cabe en consumer GPU?: no disponible de forma oficial. Los componentes individuales (LoRAs de ~1,2 GB, RIFE ~21 MB, Real-ESRGAN ~67 MB) sí caben en cualquier GPU consumer; el modelo base T2V 14B fp8 no cabe íntegro en 24 GB junto con el resto del pipeline.
- Opciones de despliegue: la model card indica que los pesos están pensados para una imagen de pod con ComfyUI; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a modelos de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamaño | Licencia | Observaciones |
|---|---|---|---|---|
| `Noname010101/media-extras` | Pesos auxiliares Wan 2.1/2.2, SVI 2.0 Pro, RIFE, Real-ESRGAN | 27,8 GB | Mixta (Apache-2.0, MIT, BSD-3-Clause) | Mirror para pods de ComfyUI; sin benchmarks ni model card técnica |
| `Wan-AI/Wan2.1-T2V-14B` | Modelo base T2V 14B | No disponible | Apache-2.0 | Upstream del modelo principal incluido aquí en fp8 |
| `Kijai/WanVideo_comfy` | Versiones fp8 y LoRAs para ComfyUI de la familia Wan | No disponible | Apache-2.0 | Origen de la mayoría de ficheros del mirror |
| `vita-video-gen/svi-model` | LoRAs SVI 2.0 Pro para Wan 2.2 I2V A14B | No disponible | MIT | Upstream de los LoRAs SVI incluidos |

## Limitaciones y advertencias

- No es un modelo entrenado ni publicable como tal: es un mirror de pesos de terceros; cualquier evaluación de calidad debe hacerse sobre los modelos upstream.
- La licencia es mixta y depende del fichero; la model card usa `license: other` con `license_name: mixed-see-table`, lo que exige revisar cada entrada de la tabla antes de un uso comercial.
- El fichero `loras/lightx2v_t2v_14b_rank32.safetensors` fue renombrado respecto al original (`Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors`); los pesos no se modificaron, pero el nombre no coincide con el upstream.
- No se declaran idiomas soportados ni sesgos conocidos; el comportamiento multilingüe depende del text encoder umt5-xxl.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí de artefactos visuales propios de los modelos de difusión de vídeo.
- No hay benchmarks, métricas de latencia ni guías de cuantización más allá de los formatos fp8 e4m3fn y bf16 incluidos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin histórico de uso que permita validar su mantenimiento.
- La fecha de creación indicada (2026-11-06) es futura respecto a la información disponible; conviene verificar la integridad de los metadatos.
- No se proporcionan instrucciones de uso, scripts de carga ni configuración de ComfyUI en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Noname010101/media-extras
- Wan 2.1 T2V 14B (upstream): https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Wan 2.1 VACE 14B (upstream): https://huggingface.co/Wan-AI/Wan2.1-VACE-14B
- Kijai/WanVideo_comfy (origen de fp8 y LoRAs): https://huggingface.co/Kijai/WanVideo_comfy
- lightx2v/Wan2.1-Distill-Loras (upstream del LoRA de destilación): https://huggingface.co/lightx2v/Wan2.1-Distill-Loras
- SVI 2.0 Pro (vita-video-gen): https://huggingface.co/vita-video-gen/svi-model/tree/main/version-2.0
- Mirror de RIFE (marduk191): https://huggingface.co/marduk191/rife
- Practical-RIFE (upstream de RIFE): https://github.com/hzwer/Practical-RIFE
- Real-ESRGAN (releases): https://github.com/xinntao/Real-ESRGAN/releases
- umt5-xxl (upstream): https://huggingface.co/google/umt5-xxl
