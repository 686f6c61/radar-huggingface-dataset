# BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy

## Resumen

LTX-2.5 22B Distilled NVFP4 Comfy es una cuantización en NVFP4 del transformer de difusión (DiT) LTX-2.5 22B en variante *distilled*, publicada por el usuario BennyDaBall sobre los pesos oficiales de Lightricks. El modelo resuelve un problema práctico de interoperabilidad: el export NVFP4 original de Lightricks es una salida cruda de TensorRT-ModelOpt que ComfyUI no puede cargar porque carece de las marcas `.comfy_quant` por capa que el loader usa para detectar pesos cuantizados. Esta versión añade únicamente esa marca a las 1.176 capas cuantizadas, sin recuantizar ni alterar los bytes de los pesos.

El resultado es un fichero de 18,7 GB —unos 2,8 GB más ligero que el pack oficial `comfy-int8-convrot` de 21,5 GB— que se carga directamente en las plantillas nativas de LTX-2.5 Text to Video e Image to Video de ComfyUI. Es relevante para quien quiera ejecutar generación de vídeo con audio sincronizado a 22B de parámetros en GPUs Blackwell (RTX 50-series), donde los kernels FP4 nativos están disponibles y el ahorro de VRAM en pesos libera margen frente al desbordamiento a memoria del sistema en clips largos.

El modelo base es un sistema de difusión texto-a-vídeo e imagen-a-vídeo con generación de audio nativa, distribuido bajo la licencia comunitaria LTX-2.x de Lightricks. Esta ficha describe la cuantización de BennyDaBall; las capacidades y el comportamiento generativo subyacentes corresponden a LTX-2.5 de Lightricks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para video, variante distilled |
| Parametros totales | 22B (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE según la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (grupo 16, escalas ModelOpt); referencia comparativa int8 en el pack oficial |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license |
| Formato de pesos | Fichero unico de difusion para ComfyUI (`diffusion-single-file`), pesos NVFP4 con marcas `.comfy_quant` |
| Tamano del repositorio | 18,7 GB |
| Capas cuantizadas | 1.176 |
| Modelo base | Lightricks/LTX-2.5 (`ltx-2.5-22b-distilled-transformer-nvfp4`) |
| Requisito de software | ComfyUI >= v0.32.0 |
| Requisito de hardware | GPU Blackwell (RTX 50-series) para kernels FP4 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusión (DiT) de 22B parámetros en variante distilled, orientado a la generación conjunta de vídeo y audio. La informacion proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF/DPO; estos datos corresponden al modelo base de Lightricks y no se documentan en esta ficha de cuantización.

La innovación técnica de esta publicación no reside en el entrenamiento sino en el empaquetado: el export NVFP4 oficial de Lightricks emplea escalas por capa (`weight_scale`, `weight_scale_2`, `input_scale`) cuyos nombres ya coinciden con la especificación nvfp4 de ComfyUI, pero falta el tensor marcador `.comfy_quant` que el loader usa para identificar capas cuantizadas. Sin él, ComfyUI interpreta un peso empaquetado de 4 bits como bytes crudos y falla con un error de dimensiones (`mat1 and mat2 shapes cannot be multiplied (6820x4096 and 2048x4096)`). Esta versión estampa `{"format": "nvfp4"}` en las 1.176 capas cuantizadas sin tocar la matemática de los pesos. La cuantización usa grupos de 16 con escalas generadas por ModelOpt.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado nativo.
- Generación de vídeo a partir de una imagen clave (image-to-video), manteniendo coherencia de composición y detalle respecto al fotograma de entrada.
- Generación de audio nativo asociado al clip, incluida música en los ejemplos mostrados por el autor.
- Preservación de texto legible en escena: el autor documenta que el texto de un cartel permanece legible a lo largo del clip en image-to-video a 50 fps.
- Ejecución en las plantillas nativas de ComfyUI para LTX-2.5, sin nodos personalizados.
- Soporte de flujo de trabajo con escalador de latentes oficial para ampliación de resolución.
- No se documentan en la informacion proporcionada capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Prototipado rápido de vídeo publicitario: cargar el fichero en `ComfyUI/models/diffusion_models/`, seleccionarlo como `unet_name` en la plantilla T2V y generar clips de 10 s a 1280x736 con audio en aproximadamente 50 s en una RTX 5090, lo que permite iterar sobre variaciones de prompt en una sola sesión.
- Animación de keyframes para storyboards: usar image-to-video con un fotograma dibujado o renderizado para obtener movimiento coherente y audio asociado, útil en previsualización de secuencias antes de producción final.
- Generación de contenido para redes sociales con texto en pantalla: la conservación de legibilidad de rótulos permite producir clips con carteles o marquesinas sin regeneración manual del texto.
- Pruebas de concepto en estaciones con GPU Blackwell: el ahorro de 2,8 GB de VRAM en pesos respecto al pack int8 amplía el margen frente al desbordamiento a memoria del sistema en clips de larga duración, lo que facilita ejecutar secuencias más largas sin paginación.
- Evaluación comparativa de cuantizaciones: al compartir semilla y prompt con el pack oficial int8, sirve para medir diferencias perceptuales entre NVFP4 e int8 en el mismo pipeline de ComfyUI.
- Integración en pipelines de generación por lotes: al ser un fichero único compatible con las plantillas nativas, se puede encadenar en scripts de ComfyUI que encolen múltiples prompts sin gestión de nodos personalizados.
- Demostración de audio-vídeo conjunto: generar clips con pista musical propia para pruebas de sincronización en herramientas de edición posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta métricas de inferencia cualitativas y de tiempo:

| Metrica | Valor |
|---|---|
| Resolucion y duracion del ejemplo | 10 s a 1280x736 con audio sincronizado |
| Tiempo de generacion | ~50 s en RTX 5090, incluida la primera carga del modelo |
| Tamano del fichero | 18,7 GB (vs 21,5 GB comfy-int8-convrot) |
| Ahorro de VRAM en pesos | ~2,8 GB |
| Fidelidad respecto a int8 | No identico pixel a pixel (ruido de cuantizacion distinto); misma composicion, nivel de detalle y tiempos de movimiento según el autor |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El fichero de pesos ocupa 18,7 GB, por lo que se requiere al menos esa cantidad de VRAM para mantener los pesos residentes, más el text encoder, los VAE y el escalador de latentes, que se cargan desde el repositorio oficial.
- GPU recomendadas: RTX 5090 (medición reportada por el autor) y, en general, GPUs Blackwell de la serie RTX 50 para disponer de kernels FP4 nativos.
- Compatibilidad con GPUs consumer: sí, en tarjetas Blackwell con VRAM suficiente; en GPUs sin soporte FP4 el modelo no aprovecha los kernels nativos y el autor no documenta su funcionamiento en ellas.
- Opciones de despliegue: ComfyUI >= v0.32.0 mediante el nodo `UNETLoader` y las plantillas nativas LTX-2.5 Text to Video e Image to Video. No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI) para este fichero.
- Latencia y throughput: ~50 s para 10 s de vídeo a 1280x736 con audio en RTX 5090, incluida la carga inicial del modelo.
- Flujo de trabajo de ejemplo incluido: `ltx-2.5-nvfp4-t2v-example-workflow.json`, plantilla T2V oficial con este modelo preseleccionado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| LTX-2.5 22B Distilled NVFP4 Comfy (esta ficha) | 22B | NVFP4, fichero unico ComfyUI | 18,7 GB | no disponible | ltx-2.x-community-license | Requiere ComfyUI >= v0.32.0 y GPU Blackwell para FP4 |
| LTX-2.5 comfy-int8-convrot (oficial) | 22B | int8, pack ComfyUI | 21,5 GB | no disponible | ltx-2.x-community-license | Referencia oficial; ~2,8 GB mas pesado |
| LTX-2.5 22B distilled transformer NVFP4 (export oficial Lightricks) | 22B | NVFP4 ModelOpt crudo | no disponible | no disponible | ltx-2.x-community-license | No carga en ComfyUI sin las marcas `.comfy_quant` |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La salida no es idéntica pixel a pixel a la del pack int8: el ruido de cuantización difiere, aunque el autor indica que la composición, el detalle y los tiempos de movimiento se mantienen.
- Requiere ComfyUI >= v0.32.0 y una GPU Blackwell para aprovechar los kernels FP4; en hardware sin soporte FP4 el rendimiento y la viabilidad no están documentados.
- El consumo de VRAM total no se especifica: los 18,7 GB corresponden solo a los pesos del transformer, y hay que sumar text encoder, VAE y escalador de latentes.
- El autor advierte de un "long-duration offload cliff": en clips largos, el margen de VRAM puede agotarse y provocar paginación a memoria del sistema; el ahorro de 2,8 GB mitiga el riesgo pero no lo elimina.
- Licencia LTX-2.x Community License: no es una licencia de código abierto permisiva; es necesario revisar el texto incluido en `LICENSE.txt` antes de cualquier uso comercial.
- No se documentan sesgos, comportamiento multilingüe ni tasas de alucinación específicas para esta cuantización.
- El modelo genera audio y vídeo sintéticos; el autor declina responsabilidad sobre el contenido producido ("what you generate is on you").
- Al ser una modificación de un export oficial, la trazabilidad de los pesos depende de la integridad del proceso de estampado descrito; el autor afirma que los bytes de los pesos no se han alterado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia (copia en el repo): https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy/blob/main/LICENSE.txt
- Flujo de trabajo de ejemplo T2V: https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy/blob/main/ltx-2.5-nvfp4-t2v-example-workflow.json
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
