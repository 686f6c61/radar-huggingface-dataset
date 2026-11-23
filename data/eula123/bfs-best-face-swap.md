# eula123/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una coleccion de adaptadores LoRA para modelos de difusion orientados a la edicion de imagen, disenada especificamente para el intercambio de rostro, cabeza y cuerpo entre imagenes. El autor, identificado en Hugging Face como `eula123`, publica un conjunto de pesos que cubren varias familias de modelos base simultaneamente: Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2 Klein (4B y 9B), Krea 2 y una rama experimental para LTX-2. El repositorio tiene un tamano de 13,3 GB y se distribuye bajo licencia MIT.

El problema que resuelve es concreto: aplicar un pipeline de face swap, head swap o body swap sobre modelos de generacion y edicion de imagen modernos sin necesidad de entrenar adaptadores propios. Cada release de BFS esta atado a un modelo base especifico y a un contrato de uso propio (orden de las imagenes de entrada, prompt recomendado y workflow de ComfyUI asociado), lo que lo convierte en una coleccion de herramientas mas que en un unico modelo.

Es relevante ahora porque los modelos base a los que da soporte (Qwen Image 2.1, FLUX.2 Klein, Krea 2) son generadores de imagen recientes de gran calidad, y BFS ofrece adaptadores listos para usar sobre ellos. No es un modelo de lenguaje ni un transformer de texto: es un conjunto de LoRAs de difusion para `image-to-image`, con flujos de trabajo en formato JSON para ComfyUI. La documentacion del autor insiste en un punto critico: hay que emparejar cada LoRA con su modelo base correspondiente y respetar el orden de entrada indicado en cada guia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos de difusion de imagen |
| Parametros totales | no disponible (depende del modelo base; el repositorio pesa 13,3 GB en conjunto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | pesos en safetensors; se incluyen variantes fp16 y fp32 en algunos releases (por ejemplo, `bfs_head_v5_2511_merged_version_rank_16_fp16` y `..._rank_32_fp32`); los modelos base soportan variantes fp8 (FLUX.2 Klein 9b-fp8, 4b-fp8) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (LoRA); workflows en JSON para ComfyUI |
| Modelos base soportados | Qwen/Qwen-Image-2.1, Qwen/Qwen-Image-Edit-2511, black-forest-labs/FLUX.2-klein-9B, FLUX.2-klein-4B, FLUX.2-klein-base-4B, FLUX.2-klein-base-9B, FLUX.2-klein-9b-fp8, FLUX.2-klein-4b-fp8, krea/Krea-2-Raw |
| Pipeline | image-to-image |
| Libreria | diffusers |

## Arquitectura y entrenamiento

BFS no es un modelo con arquitectura propia, sino una familia de LoRAs de bajo rango aplicados sobre la capa de atencion de modelos de difusion de imagen. Cada release se entrena sobre un modelo base concreto y hereda su arquitectura: los LoRA para Qwen Image 2.1 y Qwen Image Edit se aplican sobre el transformer de difusion de Qwen; los de FLUX.2 Klein sobre la familia FLUX.2 en sus variantes de 4B y 9B; los de Krea 2 sobre Krea-2-Raw. Los pesos se distribuyen en safetensors y se cargan mediante `diffusers` o mediante nodos de ComfyUI.

Los detalles de entrenamiento (numero de pasos, tamano del dataset, composicion, uso de tecnicas como RLHF o DPO) no estan publicados en la informacion disponible. Lo que si se documenta son los nombres de los ficheros, que revelan parte del proceso: por ejemplo, `bfs_head_v1_flux-klein_9b_step3500_rank128` y `bfs_head_v1_flux-klein_9b_step3750_rank64` indican el checkpoint (step 3500 y 3750) y el rango del LoRA (128 y 64). En la rama LTX-2 aparecen checkpoints en `ic_lora_5000`, `ic_lora_6000` y `ic_lora_12000_train_3`, lo que sugiere entrenamientos con distinto numero de pasos. Las versiones de Qwen Edit 2511 incluyen variantes "merged" con rango 16 en fp16 y rango 32 en fp32.

Una innovacion destacable es el modo **selective body swap**: en lugar de reemplazar a todas las personas de la imagen, solo sustituye a la persona marcada en magenta, lo que permite operar sobre fotos de grupo y escenas con varias figuras. Tambien es relevante la separacion explicita entre head swap (cabeza), face swap (rostro) y body swap (cuerpo), con contratos de entrada distintos por version.

## Capacidades

- Intercambio de rostro (face swap) entre una imagen de referencia y una imagen destino.
- Intercambio de cabeza (head swap), que sustituye cabeza y cuello en lugar de solo el rostro.
- Intercambio de cuerpo (body swap) sobre la imagen destino.
- Body swap selectivo mediante marca magenta: reemplaza unicamente a la persona marcada, util en fotos de grupo.
- Edicion de imagen guiada por referencia en pipelines `image-to-image`.
- Compatibilidad con multiples familias de modelos base (Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2 Klein 4B/9B, Krea 2, LTX-2 experimental).
- Integracion con ComfyUI mediante workflows JSON incluidos en el repositorio.
- Carga mediante la libreria `diffusers`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un adaptador de imagen.

## Casos de uso

- **Produccion audiovisual y previsualizacion de reparto**: sustituir el rostro de un actor por el de otro en fotogramas de prueba para evaluar encaje antes de rodar, usando el LoRA de head swap sobre Qwen Image 2.1 o FLUX.2 Klein.
- **Retoque fotografico profesional**: reemplazar cabezas o cuerpos en fotografias de estudio o de producto donde una persona sale con los ojos cerrados o en mala pose, empleando el workflow de ComfyUI incluido.
- **Fotos de grupo y eventos**: con el modo selective body swap (magenta) se puede sustituir a una sola persona de una foto con varias figuras sin alterar al resto, algo habitual en fotografia social y de eventos.
- **Creacion de contenido para redes y avatares**: generar variaciones de una misma identidad visual sobre cuerpos o escenas distintas para campanas o personajes, manteniendo coherencia de rostro con la imagen de referencia.
- **Prototipado de personajes en videojuegos y animacion**: probar combinaciones de rostro y cuerpo sobre bocetos o renders antes de modelar en 3D, usando los LoRA de FLUX.2 Klein 4B por su menor coste computacional.
- **Investigacion en edicion de imagen**: servir como punto de partida o baseline para estudiar tecnicas de face swap y edicion selectiva, dado que el codigo y los pesos son abiertos (MIT) y cubren varias familias de modelos.
- **Flujos experimentales de video**: la rama LTX-2 (marcada como experimental) permite explorar head swap en generacion de video, aunque el autor la presenta como no consolidada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, SSIM, identidad, etc.) ni comparaciones numericas con otros sistemas de face swap. El autor advierte ademas que los ejemplos y workflows del repositorio son demostraciones y no garantizan resultados identicos en cada imagen.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explicita. Depende enteramente del modelo base. Como referencia orientativa de la familia, los LoRA de FLUX.2 Klein 4B son los mas ligeros del conjunto y los de Qwen Image 2.1 y FLUX.2 Klein 9B los mas exigentes; los pesos fp8 de FLUX.2 Klein (9b-fp8, 4b-fp8) reducen el requisito de memoria frente a fp16.
- **GPU recomendadas**: no especificadas por el autor. Para modelos de difusion de imagen de esta categoria se suelen emplear GPU con 16-24 GB o mas (RTX 4090, A100, H100), pero no hay dato oficial en la informacion disponible.
- **Consumer GPU**: los LoRA de FLUX.2 Klein 4B y sus variantes fp8 son los candidatos mas plausibles para GPU de consumo; no hay confirmacion oficial de VRAM minima.
- **Opciones de despliegue**: ComfyUI (workflows JSON incluidos) y `diffusers`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables publicadas por el autor. La comparacion se limita a caracteristicas estructurales frente a otras aproximaciones de face swap:

| Solucion | Tipo | Modelos base | Licencia | Disponibilidad |
|---|---|---|---|---|
| BFS (este modelo) | Coleccion de LoRA para difusion | Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2 Klein 4B/9B, Krea 2, LTX-2 | MIT | Hugging Face, pesos safetensors + workflows ComfyUI |
| Face swap clasico (p. ej. InsightFace/Swapper) | Pipeline dedicado de deteccion + blending | No aplica | Variable segun implementacion | Comun, pero no basado en difusion |
| LoRA de identidad genericos | LoRA sobre un unico modelo base | Un solo modelo | Variable | Hugging Face / Civitai |

No hay datos de benchmarks que permitan comparar calidad (identidad, realismo, artefactos) con estas alternativas; se indica "no disponible".

## Limitaciones y advertencias

- **Uso etico y legal**: el propio autor prohibe usar o compartir resultados con figuras publicas o con personas que no hayan dado su consentimiento. El face swap sin consentimiento puede vulnerar derechos de imagen y normativa de proteccion de datos.
- **Acoplamiento al modelo base**: cada LoRA debe usarse con su modelo base correspondiente; mezclar familias (text encoder, VAE, workflow y LoRA de distinta familia) produce resultados incorrectos. El autor recomienda actualizar ComfyUI y verificar que todos los componentes pertenecen a la misma familia.
- **Orden de entrada especifico**: varias versiones de head swap usan intencionadamente el cuerpo primero y el rostro de referencia despues; invertir el orden degrada el resultado.
- **Fuerza del LoRA**: se recomienda empezar en `1.0` y ajustar segun modelo base, resolucion e imagen de referencia; no hay valores optimos universales.
- **Resultados no garantizados**: los ejemplos son demostraciones, no una garantia de resultados identicos en cada imagen.
- **Riesgo de artefactos**: al ser LoRA de difusion, pueden aparecer inconsistencias en iluminacion, piel, cuello o bordes del cuerpo, especialmente en angulos extremos o baja resolucion.
- **Idioma**: la unica lengua declarada es `en`; la documentacion y los prompts estan en ingles.
- **Rama LTX-2 experimental**: los pesos de LTX-2 se marcan como experimentales y no deben considerarse estables para produccion.
- **Licencia MIT**: permite uso comercial, pero no exime del cumplimiento de la normativa de derechos de imagen y consentimiento.
- **Sin benchmarks**: no hay metricas publicadas que permitan estimar la calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eula123/BFS-Best-Face-Swap
- Guia Qwen Image 2.1 (head): `docs/qwen-image-2.1.md` (dentro del repositorio)
- Guia Qwen Image 2.1 (body): `docs/qwen-image-2.1-body.md`
- Guia body swap selectivo (magenta): `docs/qwen-image-2.1-body-selective.md`
- Guia Qwen Image Edit 2509/2511: `docs/qwen-image-edit.md`
- Guia FLUX.2 Klein: `docs/flux-2-klein.md`
- Guia Krea 2: `docs/krea-2.md`
- Guia LTX-2 experimental: `docs/ltx-2.md`
- Modelo base Qwen Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base Qwen Image Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base FLUX.2 Klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Modelo base FLUX.2 Klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Libreria diffusers: https://github.com/huggingface/diffusers
