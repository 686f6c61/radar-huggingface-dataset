# akatz-ai/MiniMax-H3-Character-Swap-LoRA

## Resumen

MiniMax-H3 Character Swap LoRA es un adaptador LoRA para el modelo de generación y edición de vídeo MiniMax-H3, en su variante Ref2VA (referencia a vídeo con audio). Lo desarrolla el creador independiente akatz-ai y resuelve una tarea concreta de posproducción: sustituir a una persona seleccionada en un vídeo fuente por un personaje definido mediante una imagen de referencia, conservando la interpretación original (pose, mirada, expresión y movimiento) y el resto de la escena.

El adaptador se publica como archivo safetensors único compatible con ComfyUI y con la librería `diffusion-single-file`, y se apoya en el modelo base `Comfy-Org/MiniMax-H3`. La versión recomendada es la V1.5 (`h3_character_swap_v1.5.safetensors`), que según el autor mejora la retención de identidad respecto a la V1 en caras estilizadas, pelo y vestuario. El repositorio ocupa 0,3 GB, lo que confirma que se trata de un adaptador y no de un modelo completo.

Su relevancia actual radica en que lleva una capacidad de edición de identidad en vídeo, hasta ahora reservada a pipelines propietarios, a un flujo abierto basado en ComfyUI con pesos descargables y licencia comunitaria. El modelo está orientado a un público técnico que ya trabaja con H3 y necesita un componente especializado de sustitución de personaje sin reentrenar el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión de vídeo MiniMax-H3 Ref2VA |
| Parametros totales | no disponible (adaptador; el repositorio pesa 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la rejilla de frames y del runtime de H3) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el autor recomienda el base Ref2VA en INT8 y un turbo en bf16 |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (archivo único, `diffusion-single-file`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre MiniMax-H3 en su variante Ref2VA, un modelo de difusión para vídeo con condicionamiento por referencia (imagen) y por audio. La LoRA no modifica la arquitectura del base: se carga como adaptador de solo modelo en un cargador LoRA compatible de ComfyUI a fuerza 1.0, y el pipeline completo requiere además el modelo base Ref2VA, el text encoder, los VAE y un adaptador turbo separado (`minimax_h3_fl2v_turbo_8step_v1.0_768p_comfyui_bf16.safetensors`).

El entrenamiento se documenta en `training/v1.5/run-summary.json`, que registra el hash de la release, la inicialización, las actualizaciones completadas y los hiperparámetros. El dataset original V1 (`akatz-ai/H3-Character-Swap-v1`) forma parte del linaje de entrenamiento, pero el autor advierte que no contiene la mezcla completa de la V1.5. Los metadatos embebidos en el checkpoint conservan el nombre interno V2 y el presupuesto original de 2250 actualizaciones, lo que puede inducir a confusión al inspeccionar el archivo. No se detallan en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de preferencia (RLHF/DPO).

## Capacidades

- Sustitución de personaje en vídeo: reemplaza a una persona seleccionada en el vídeo fuente por la identidad de una imagen de referencia.
- Transferencia de interpretación: mantiene pose, mirada, expresión y movimiento del performance original.
- Preservación de escena: conserva el entorno y el resto de personas presentes en el plano.
- Condicionamiento por referencia visual (`<Picture 1>`) y por vídeo fuente (`<Video 1>`) en el grafo de ComfyUI.
- Integración con máscaras SAM para seleccionar la región del personaje a sustituir.
- Soporte de anclas de escena opcionales y de condicionamiento por audio fuente en la herramienta H3 Character Swap.
- Continuación por segmentos mediante historial, con rejilla de frames y 24 fps como punto de partida recomendado.
- Flujo nativo reproducible con H3 Relay 2.0 (workflow de canvas y prompt de API).
- No es un modelo autónomo: no genera vídeo por sí mismo sin el base Ref2VA, el text encoder, los VAE y el turbo.

## Casos de uso

- Posproducción de doblaje y localización: sustituir al actor original por un personaje de referencia manteniendo la interpretación facial y corporal, útil cuando se reversiona un contenido para otro mercado o elenco.
- Prototipado de casting virtual: previsualizar cómo quedaría un personaje concreto en una secuencia ya rodada antes de comprometer recursos de rodaje o VFX.
- Creación de contenido para redes: reutilizar un performance grabado con la identidad de un personaje recurrente de una marca o serie, con el flujo de ComfyUI y H3 Relay 2.0.
- Videojuegos y cinemáticas: sustituir el rostro de un actor de captura por el modelo definitivo del personaje sin rehacer la captura de movimiento.
- Publicidad personalizada: generar variantes de un mismo anuncio con distintas identidades de referencia a partir de un único plano fuente, controlando escena y atrezzo.
- Investigación en edición de vídeo: banco de pruebas para estudiar retención de identidad, deriva temporal y oclusiones en tareas de character swap con modelos de difusión abiertos.
- Docencia y demostraciones técnicas: mostrar en un taller de ComfyUI un pipeline completo de edición de vídeo con LoRA, máscaras SAM y condicionamiento por referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor incluye una comparación cualitativa V1 frente a V1.5 en casos seleccionados y advierte explícitamente que esas observaciones no constituyen una mejora uniforme ni un benchmark agregado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del base Ref2VA, del VAE y de la resolución y longitud del clip.
- El adaptador en sí ocupa 0,3 GB en disco y su carga en VRAM es marginal frente al modelo base.
- GPU recomendadas: no disponibles en la información proporcionada; el autor menciona que los controles de segmentos largos no garantizan idoneidad para cualquier GPU.
- Ajuste en GPU de consumo: no confirmado; requiere evaluar el base Ref2VA en INT8 y el turbo en bf16.
- Opciones de despliegue: ComfyUI con cargador LoRA de solo modelo, H3 Relay 2.0 para el flujo nativo, y la librería `diffusion-single-file` para la carga del archivo.
- Receta probada por el autor: base Ref2VA INT8, LoRA a fuerza 1.0, turbo a fuerza 1.0, 8 pasos, CFG 1, sampler `er_sde`, scheduler `normal`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 Character Swap LoRA (V1.5) | LoRA de sustitución de personaje | MiniMax-H3 Ref2VA | Rejilla de frames de H3; 24 fps recomendado | minimax-h3-community-license-agreement | Hugging Face, ComfyUI |
| MiniMax-H3 Character Swap LoRA (V1) | LoRA de sustitución de personaje | MiniMax-H3 Ref2VA | Igual que V1.5 | minimax-h3-community-license-agreement | Hugging Face (release anterior) |
| MiniMax-H3 Ref2VA (base) | Modelo de difusión vídeo con referencia | — | No disponible | minimax-h3-community-license-agreement | Comfy-Org/MiniMax-H3 |

No se dispone de información sobre alternativas de terceros comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la identidad, el timing respecto al fuente, las expresiones, las oclusiones y los cortes pueden derivar.
- La V1.5 no garantiza mejora en todos los planos; el autor lo indica expresamente.
- La evaluación amplia sigue en curso y las comparaciones publicadas son casos seleccionados, no un benchmark agregado.
- El audio del vídeo exportado lo conserva la herramienta de aplicación; no hay evidencia de que la LoRA reproduzca audio con precisión ni de que el lip sync sea exacto.
- Los controles de segmentos largos de la herramienta no garantizan calidad en planos largos ni compatibilidad con cualquier GPU.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación visual: no cuantificado; la deriva de identidad es el fallo observado por el autor.
- Idiomas: solo inglés en la metadata del modelo; el condicionamiento textual del pipeline se realiza en inglés.
- Licencia: MiniMax-H3 Community License Agreement, con posibles restricciones para uso comercial; conviene revisar el archivo LICENSE antes de desplegar en producción.
- No es un modelo autónomo: sin el base Ref2VA, el text encoder, los VAE y el turbo no produce resultados.
- Los metadatos internos del checkpoint usan el nombre V2 y un presupuesto de 2250 actualizaciones, lo que puede confundir en auditorías de procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Dataset V1: https://huggingface.co/datasets/akatz-ai/H3-Character-Swap-v1
- Repositorio H3 Relay: https://github.com/akatz-ai/h3-relay
- Perfil del autor en X: https://x.com/akatz_ai
- Patreon del autor: https://www.patreon.com/Akatz
- GitHub Sponsors: https://github.com/sponsors/akatz-ai
- Ko-fi: https://ko-fi.com/akatz
- Workflow nativo: `examples/H3-Character-Swap-Relay-V2.json` (dentro del repositorio)
- Prompt de API: `examples/H3-Character-Swap-Relay-V2.api.json` (dentro del repositorio)
- Procedencia V1.5: `training/v1.5/run-summary.json` (dentro del repositorio)
