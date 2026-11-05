# RunningHubAI/rh-pipi-anima-cg-unet

## Resumen

`rh-pipi-anima-cg-unet` es un modelo de pesos UNET para generación de vídeo a partir de texto (text-to-video), publicado por RunningHubAI en nombre del autor PiPiAi. Se distribuye como un único fichero `safetensors` de aproximadamente 3989 MiB (unos 4.2 GB) y está pensado para cargarse directamente en ComfyUI o en la plataforma RunningHub. El modelo es un fine-tune (finetuned from: anima) orientado a un estilo visual concreto: animación de estética CG de inspiración china clásica (古风), con el token de activación `pipicg`.

La relevancia del modelo es acotada y muy práctica: no es un modelo fundacional ni un LLM, sino un componente de un pipeline de difusión para vídeo que se consume dentro de ComfyUI. La model card documenta únicamente los parámetros de inferencia recomendados (8 pasos de dibujo, muestreador Euler, 10 pasos de muestreo, CFG 4.5) y las plantillas de prompt positivo y negativo, lo que lo sitúa como una pieza lista para usar en flujos de trabajo ya existentes.

La información técnica publicada es escasa: no se detallan arquitectura interna, número de parámetros, longitud de contexto temporal ni licencia explícita. Cualquier evaluación rigurosa del modelo debe partir de esa limitación y de la comprobación empírica dentro de ComfyUI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET de difusión para text-to-video (detalle interno no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible (dimensión temporal de vídeo no documentada) |
| Tipos de cuantización | no disponible (se distribuye en safetensors; cuantizaciones GGUF/FP8 no documentadas) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`pipi-anima-cggufeng01.safetensors`, 3989 MiB) |

## Arquitectura y entrenamiento

El modelo se presenta como un UNET de difusión para text-to-video, derivado por fine-tuning del modelo base `anima`. No se publica información sobre el número de parámetros, la configuración del bloque de atención temporal, el número de tokens de entrenamiento ni la composición del dataset. Tampoco se documenta si hubo etapas de RLHF, DPO o ajuste por preferencias, algo poco habitual en modelos de difusión y que en cualquier caso no se menciona.

La model card sí aporta detalles del proceso de anotación y entrenamiento de terceros: el autor indica que el etiquetado se realizó con "Tutu Annotator" y el entrenamiento con "Tutu Trainer", herramientas de su propio flujo de trabajo (zhaotutu.xyz). El token de activación `pipicg` condiciona el estilo CG de inspiración china clásica. Los parámetros de inferencia recomendados son 8 pasos de dibujo, muestreador Euler, 10 pasos de muestreo y CFG 4.5, con prompt positivo de plantilla (`pipicg, masterpiece, best quality, score_7, safe, anime, highres`) y negativo (`worst quality, low quality, score_1, score_2, score_3, blurry, jpeg artifacts, sepia`).

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`) dentro de ComfyUI.
- Estilización consistente mediante el token de activación `pipicg`, orientada a animación CG de estética china clásica.
- Integración con flujos de trabajo de ComfyUI y con la plataforma RunningHub (carga directa de pesos UNET).
- Control de calidad mediante prompt negativo predefinido (reducción de artefactos JPEG, desenfoque y dominantes sépia).
- Inferencia en pocos pasos (8 pasos de dibujo, 10 de muestreo), adecuada para iteración rápida.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo; no aplica al ser un modelo generativo de vídeo.

## Casos de uso

- Prototipado de vídeo de animación CG: cargar el UNET en ComfyUI con el token `pipicg` y los parámetros recomendados (Euler, 10 pasos, CFG 4.5) para generar clips de prueba de estética china clásica antes de invertir en un pipeline de producción.
- Previsualización de storyboards: generar variaciones rápidas de una escena a partir de un prompt de texto para validar dirección de arte con el equipo creativo.
- Generación de material para redes sociales: clips cortos de animación estilizada para publicaciones, usando el prompt negativo de plantilla para minimizar artefactos de compresión.
- Integración en flujos automatizados de RunningHub: invocar el modelo vía API de RunningHub para encadenar generación de vídeo con otros nodos del workflow (por ejemplo, upscaling o postprocesado).
- Exploración de estilo para artistas técnicos: ajustar el peso del token `pipicg` y la semilla para estudiar cómo responde el fine-tune frente al modelo base `anima`.
- Docencia y experimentación con difusión para vídeo: usar un UNET de ~4 GB como ejemplo manejable de fine-tune de text-to-video en talleres prácticos de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un UNET de ~4 GB en safetensors requiere cargar pesos y activaciones; en precisión nativa suele necesitar bastante más VRAM que el tamaño del fichero, pero no se publica una cifra verificable.
- GPU recomendadas: no disponible. La model card promociona el acceso a GPUs de 48 GB a través de RunningHub, lo que sugiere que el flujo completo (UNET + VAE + text encoder + decodificación de vídeo) puede requerir VRAM alta.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño del fichero (4.2 GB) es compatible con GPUs de 8-12 GB en teoría, pero el pipeline completo de vídeo puede exceder esa capacidad; se recomienda probar en ComfyUI con cuantización o en la plataforma RunningHub.
- Opciones de despliegue: ComfyUI (soporte nativo vía nodo de carga de UNET), plataforma RunningHub (online y API), Hugging Face como repositorio de pesos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-pipi-anima-cg-unet | UNET text-to-video (fine-tune) | no disponible | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| Modelo base `anima` | UNET text-to-video | no disponible | no disponible | no disponible | Referenciado como upstream |
| Otros UNET de ComfyUI para vídeo | UNET text-to-video | no disponible | no disponible | variable | Hugging Face, ComfyUI |

No se dispone de datos de rendimiento ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Información técnica muy limitada: no se publican parámetros, arquitectura interna, contexto temporal ni datos de entrenamiento, lo que impide evaluar el modelo con rigor antes de probarlo.
- Licencia no explicitada: la model card remite a la licencia del proyecto original o upstream; antes de uso comercial es imprescindible verificar la licencia de `anima` y del ecosistema del que deriva.
- Riesgo de alucinación visual y artefactos: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible, parpadeos entre fotogramas y degradación temporal en clips largos; el prompt negativo de plantilla mitiga solo parte de estos problemas.
- Sesgo estilístico: el fine-tune está especializado en estética CG de inspiración china clásica; fuera de ese dominio su rendimiento probablemente se degrade respecto al modelo base.
- Dependencia de la plataforma: el flujo documentado está atado a ComfyUI y a RunningHub; la integración en otros frameworks no está soportada oficialmente.
- Idiomas: no se documenta soporte multilingüe de prompts; los ejemplos están en inglés y el etiquetado se describe como "English-friendly".
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la base de validación comunitaria.
- Fecha de creación futura (2026-11-05) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de depender de él en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-pipi-anima-cg-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2066296302752845825
- Workflow (sitio internacional): https://www.runninghub.ai/post/2064693013808508929
- Workflow (sitio China): https://www.runninghub.cn/post/2064683171064672258
- Página del autor: https://www.runninghub.ai/user-center/1954484547733893121
- RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Tutu AI Workflow: https://zhaotutu.xyz/
- Tutu Trainer: https://zhaotutu.xyz/downloads/tututrainer/
- Tutu Annotator: https://zhaotutu.xyz/downloads/tutuannotator/
- GitHub del autor: https://github.com/zhaotututu
- Bilibili: https://space.bilibili.com/431046154
- YouTube: https://www.youtube.com/@zhaotutu/videos
- Telegram: https://t.me/zhaotutu
- Discord: https://discord.gg/WtHCTWCFE5
