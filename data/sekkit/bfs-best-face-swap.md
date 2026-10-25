# sekkit/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una colección de adaptadores LoRA para sustitución de cara, cabeza y cuerpo en imágenes, publicada por el usuario sekkit en HuggingFace. No es un modelo generativo autónomo: es un conjunto de pesos LoRA que se cargan sobre modelos base de difusión, concretamente Qwen-Image 2.1, Qwen-Image-Edit 2509/2511, FLUX.2 Klein (4B y 9B, con variantes fp8), Krea 2 y, de forma experimental, LTX-2. El repositorio ocupa 13,0 GB y contiene más de veinte ficheros `safetensors`, cada uno atado a un modelo base y a un flujo de trabajo concretos.

El problema que resuelve es el de la transferencia de identidad controlada en edición de imagen: sustituir la cara o la cabeza de una fotografía por la de una imagen de referencia manteniendo iluminación, pose y coherencia del resto de la escena. Al estar empaquetado como LoRA, se puede activar y desactivar sobre el modelo base sin reentrenar, y se integra en ComfyUI mediante los ficheros JSON de flujo de trabajo incluidos en el repositorio.

Su relevancia es doble: por un lado cubre varios ecosistemas de difusión de forma simultánea (Qwen, FLUX y Krea), lo que permite reutilizar el mismo concepto de swap entre familias; por otro, la licencia MIT de los pesos facilita su uso comercial, aunque queda supeditada a la licencia del modelo base que se cargue. Como limitación de partida, el repositorio no tiene descargas ni valoraciones y no publica métricas objetivas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos base de difusión; el repositorio no especifica si los backbones son DiT puros, híbridos o MM-DiT |
| Parámetros totales | no disponible (depende del rango de cada adaptador: se distribuyen variantes rank 16, 32, 64 y 128) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; es un modelo de imagen-to-imagen y la resolución de entrada la fija el modelo base |
| Tipos de cuantización | no se publican cuantizaciones del adaptador; hay variantes en fp16 y fp32 (por ejemplo `bfs_head_v5_2511_merged_version_rank_16_fp16` y `bfs_head_v5_2511_merged_version_rank_32_fp32`). Los modelos base FLUX.2 Klein se referencian también en versiones fp8 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | MIT (pesos del LoRA) |
| Formato de pesos | `safetensors`, más flujos de trabajo en JSON para ComfyUI |
| Pipeline | image-to-image |
| Librería | diffusers |
| Modelos base | Qwen/Qwen-Image-2.1, Qwen/Qwen-Image-Edit-2511 (y 2509), black-forest-labs/FLUX.2-klein-9B, FLUX.2-klein-4B, FLUX.2-klein-base-4B, FLUX.2-klein-base-9B, FLUX.2-klein-9b-fp8, FLUX.2-klein-4b-fp8, krea/Krea-2-Raw |
| Tamaño del repositorio | 13,0 GB |
| Fecha de publicación | 2026-10-25 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de los modelos base ni la del adaptador más allá de su naturaleza LoRA. Lo que sí se deduce de los nombres de fichero es la estrategia de entrenamiento: se publican checkpoints con distintos rangos (16, 32, 64, 128) y en distintos pasos de entrenamiento (`step3500`, `step3750`, `ic_lora_5000`, `ic_lora_6000`, `ic_lora_12000_train_3`), lo que indica ajustes finos por familia de modelo base en lugar de un único adaptador universal. Para FLUX.2 Klein 9B conviven un checkpoint de rango 128 a 3500 pasos y otro de rango 64 a 3750 pasos, señal de que el autor exploró el equilibrio entre capacidad de representación y tamaño del adaptador.

No hay información sobre el dataset de entrenamiento, el número de imágenes o tokens vistos, la composición demográfica de las muestras ni sobre si se aplicaron técnicas de alineación (RLHF, DPO u otras). Tampoco se describe ninguna innovación de inferencia (decodificación especulativa, atención lineal, muestreo destilado). El rasgo técnico diferencial documentado es el contrato de uso: varias versiones de head swap esperan primero la imagen del cuerpo y después la cara de referencia, y el repositorio insiste en usar el LoRA con su modelo base correspondiente, comenzando con fuerza 1.0 y ajustando según resolución e imagen de referencia.

## Capacidades

- Sustitución de cara (face swap) sobre una imagen destino usando una imagen de referencia de identidad.
- Sustitución de cabeza completa (head swap), que incluye pelo, forma craneal y orejas, no solo el rostro.
- Sustitución de cuerpo (body swap) con los pesos `bfs_body_swap_v1.0_qwen_2.1` y `bfs_body_swap_v1_krea2`.
- Edición de imagen guiada por instrucción cuando se combina con Qwen-Image-Edit 2509/2511 o con los pesos in-context de LTX-2.
- Compatibilidad con múltiples familias de modelos base: Qwen-Image 2.1, Qwen-Image-Edit, FLUX.2 Klein 4B/9B, Krea 2 y LTX-2 experimental.
- Integración con ComfyUI mediante flujos de trabajo JSON incluidos (`Head Swap V1 Qwen 2.1 Workflow.json` y los referenciados en cada guía).
- Variantes con distinto rango y precisión para ajustar fidelidad frente a tamaño y velocidad.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni visión comprensiva; el modelo es exclusivamente generativo de imagen.

## Casos de uso

- Postproducción de cine y series: sustituir la cara de un doble de cuerpo por la del actor principal en planos donde no se rodó con él, usando el LoRA de head swap sobre Qwen-Image 2.1 y respetando el orden de entrada cuerpo-primero, cara-después.
- Previsualización de casting: generar variantes de un mismo plano con distintas identidades para decidir el reparto antes del rodaje, aprovechando que el adaptador se activa y desactiva sobre el modelo base sin reentrenar.
- Creación de avatares para videojuegos o entornos virtuales: producir retratos coherentes de un personaje a partir de una única imagen de referencia, con control de iluminación y pose heredado de la imagen destino.
- Prototipado de personajes en publicidad: iterar sobre un mismo layout con diferentes modelos o portavoces, manteniendo el cuerpo y el entorno intactos y cambiando solo la cabeza.
- Restauración y corrección en archivo fotográfico: reemplazar rostros dañados o girados en fotografías antiguas usando una referencia limpia del mismo sujeto.
- Sustitución de cuerpo en proyectos de vestuario o moda: trasladar una prenda o un physique concreto a otra identidad manteniendo la pose, con los pesos `bfs_body_swap_v1.0`.
- Flujos de trabajo en ComfyUI para estudios pequeños: al venir con los JSON de workflow, se puede montar un pipeline repetible de sustitución de identidad sin escribir código de inferencia.
- Experimentación en vídeo: las variantes LTX-2 permiten probar sustitución de identidad en secuencias, aunque el propio autor las etiqueta como experimentales y no detalla su contrato de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (similitud de identidad, FID, SSIM, LPIPS ni evaluaciones humanas) para ninguna de las variantes, y el repositorio no enlaza a ningún paper ni informe técnico.

## Requisitos de hardware

- La VRAM necesaria viene determinada casi por completo por el modelo base, no por el LoRA: el adaptador es una fracción del peso del backbone. El repositorio no publica cifras de VRAM para ninguna combinación.
- Modelos base implicados de tamaños muy distintos (FLUX.2 Klein 4B frente a 9B, Qwen-Image 2.1, Krea 2), de modo que el rango de requisitos va desde GPUs de consumo hasta aceleradores de数据中心. No se detallan cifras concretas en la información disponible.
- Existen variantes fp8 de los modelos base FLUX.2 Klein (`FLUX.2-klein-9b-fp8`, `FLUX.2-klein-4b-fp8`), pensadas para reducir el consumo de memoria frente a las versiones completas.
- Despliegue documentado: ComfyUI (flujos JSON incluidos en el repositorio) y la librería diffusers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de imagen de este tipo.
- Latencia y throughput: no disponible. Dependen del modelo base, del número de pasos de muestreo, de la resolución y del hardware.

## Comparativa con modelos similares

| Modelo | Enfoque | Modelos base soportados | Licencia | Disponibilidad |
|---|---|---|---|---|
| BFS (este repositorio) | LoRA de face/head/body swap | Qwen-Image 2.1, Qwen-Image-Edit 2509/2511, FLUX.2 Klein 4B/9B, Krea 2, LTX-2 | MIT | HuggingFace, safetensors + workflows ComfyUI |
| InstantID | Adaptador de identidad con modelo de cara auxiliar | SDXL | Apache-2.0 | GitHub y HuggingFace |
| IP-Adapter FaceID | Adaptador de imagen de referencia con encoder facial | SD 1.5 y SDXL | Apache-2.0 | GitHub y HuggingFace |
| PuLID | Adaptador de identidad con encoder facial y proyección | SDXL y FLUX.1 | Apache-2.0 (código) | GitHub y HuggingFace |

Nota: los datos de las tres alternativas provienen de conocimiento general sobre esos proyectos y no de la información proporcionada en esta ficha; conviene verificarlos en sus repositorios. La comparación de rendimiento cuantitativo no es posible porque BFS no publica métricas. Frente a las alternativas, la diferencia principal de BFS es la cobertura multi-familia (incluidos modelos recientes como Qwen-Image 2.1 y FLUX.2 Klein) y la inclusión de body swap, mientras que las alternativas citadas están centradas en SDXL/FLUX.1 y en identidad facial.

## Limitaciones y advertencias

- Riesgo claro de uso indebido: la propia model card pide no usar ni compartir resultados con figuras públicas o personas que no hayan dado su consentimiento. No se incluye ningún mecanismo técnico de mitigación, solo la advertencia textual.
- Sesgos: no se documenta la composición del dataset de entrenamiento, por lo que se desconocen sesgos de género, etnia, edad o tipo de piel en la calidad del swap. Es esperable un peor desempeño fuera de la distribución demográfica de las muestras, pero no hay datos que lo confirmen.
- Artefactos propios de la tarea: costuras en el cuello y la línea del pelo, inconsistencias de iluminación entre cara y cuerpo, y pérdida de detalle en pendientes, gafas o barba. La model card advierte explícitamente de que los ejemplos son demostraciones, no garantía de resultados idénticos.
- Contrato de entrada frágil: varias versiones esperan primero el cuerpo y después la cara de referencia. Invertir el orden produce resultados incorrectos sin mensaje de error evidente.
- Acoplamiento estricto al modelo base: usar un LoRA con otro backbone, otro text encoder o otro VAE rompe el resultado. El autor recomienda actualizar ComfyUI como primer paso de depuración.
- Idioma: la model card solo declara inglés, lo que limita la eficacia de prompts en castellano.
- Licencia: los pesos son MIT, pero el uso comercial queda condicionado por la licencia del modelo base (Qwen-Image, FLUX.2 Klein, Krea 2, LTX-2), que no se detalla en la información disponible y debe comprobarse por separado.
- Madurez: 0 descargas, 0 likes y publicación reciente, sin validación independiente de la comunidad.
- Documentación solo en inglés y repartida en varias guías por familia (`docs/qwen-image-2.1.md`, `docs/flux-2-klein.md`, etc.), sin una vista unificada de compatibilidades.
- Repositorio de 13,0 GB: la descarga completa es costosa si solo se necesita una variante.

## Enlaces

- HuggingFace: https://huggingface.co/sekkit/BFS-Best-Face-Swap
- Guía Qwen Image 2.1 (head): https://huggingface.co/sekkit/BFS-Best-Face-Swap/blob/main/docs/qwen-image-2.1.md
- Guía Qwen Image 2.1 (body swap): https://huggingface.co/sekkit/BFS-Best-Face-Swap/blob/main/docs/qwen-image-2.1-body.md
- Guía Qwen Image Edit 2509/2511: https://huggingface.co/sekkit/BFS-Best-Face-Swap/blob/main/docs/qwen-image-edit.md
- Guía FLUX 2 Klein: https://huggingface.co/sekkit/BFS-Best-Face-Swap/blob/main/docs/flux-2-klein.md
- Guía Krea 2: https://huggingface.co/sekkit/BFS-Best-Face-Swap/blob/main/docs/krea-2.md
- Guía LTX-2 (experimental): https://huggingface.co/sekkit/BFS-Best-Face-Swap/blob/main/docs/ltx-2.md
- Workflow ComfyUI head swap Qwen 2.1: https://huggingface.co/sekkit/BFS-Best-Face-Swap/blob/main/workflows/Head%20Swap%20V1%20Qwen%202.1%20Workflow.json
- Modelo base Qwen-Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base Qwen-Image-Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base FLUX.2 Klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Modelo base FLUX.2 Klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas genéricas de servicios de Google), por lo que no se han podido localizar papers, blogs, demos ni discusiones de la comunidad adicionales a los enlaces del propio repositorio.
