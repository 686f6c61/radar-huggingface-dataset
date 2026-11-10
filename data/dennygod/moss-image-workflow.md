# dennygod/moss-image-workflow

## Resumen

MOSS-Image workflow models es un repositorio de pesos publicado por el usuario dennygod en Hugging Face que empaqueta los ficheros necesarios para ejecutar un flujo de trabajo concreto de ComfyUI basado en MOSS-Image SFT en int8, acelerado con un LoRA de 4 pasos y dos LoRA de contenido, con muestreo a 768×768. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia sin modificar de pesos de terceros organizada para que la descarga encaje directamente en el arbol `models/` de una instalacion de ComfyUI.

El paquete incluye un modelo de difusion (`moss_image_sft_int8_convrot.safetensors`, 5,04 GiB), un text encoder Qwen3.5 9B cuantizado a W4A8 GPTQ (5,06 GiB), el VAE `flux2-vae.safetensors` (0,31 GiB), un LoRA de aceleracion de 4 pasos en bf16 con rango 72 (0,30 GiB) y un LoRA de contenido adicional (0,08 GiB). El repositorio ocupa 11,6 GB en total y esta etiquetado como `text-to-image` en el pipeline de Hugging Face.

Su relevancia es practica: elimina la friccion de montar manualmente un pipeline MOSS-Image en ComfyUI, unificando versiones concretas de difusion, text encoder, VAE y LoRA que el autor ha verificado que funcionan juntas con los parametros de muestreo indicados (4 pasos, CFG 1.5, sampler `euler`/`simple`, denoise 1.0). No aporta innovacion arquitectonica propia ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para texto-a-imagen (MOSS-Image SFT) con text encoder transformer Qwen3.5 9B y VAE Flux2 |
| Parametros totales | No disponible (el text encoder es un Qwen3.5 de 9B; el modelo de difusion no declara recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Modelo de difusion en int8 (`int8_convrot`); text encoder en W4A8 GPTQ; LoRA de 4 pasos en bf16 |
| Idiomas soportados | No disponible |
| Licencia | `other` con `license_name: mixed` (licencias mezcladas de los componentes originales; ver `SOURCES.md` del repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye pesos existentes. El componente generativo es MOSS-Image SFT, un modelo de difusion que opera sobre el espacio latente de Flux2 (el workflow requiere el nodo `EmptyFlux2LatentImage`) y que se carga en ComfyUI mediante `UNETLoader`. El text encoder es un Qwen3.5 de 9B parameros, cuantizado a W4A8 con GPTQ y cargado con `CLIPLoader` usando el tipo `moss_image`, lo que implica que ComfyUI debe soportar explicitamente ese tipo de encoder. El decodificado latent-a-imagen corre a cargo de `flux2-vae.safetensors`.

La aceleracion se consigue con un LoRA de destilado de pasos (`moss_image_sft_4_steps_lora_v2_600_avg_rank_72_bf16`) que reduce el muestreo a 4 pasos con fuerza 1.0. Se incluye ademas un segundo LoRA de contenido con fuerza recomendada de 0.2, marcado como opcional: el autor advierte que cargar solo el LoRA de 4 pasos funciona pero altera el estilo de salida. No se documentan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO o ajuste por preferencias en el modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen a resolucion 768×768 con 4 pasos de muestreo.
- Integracion nativa con ComfyUI mediante los nodos `UNETLoader`, `CLIPLoader` (tipo `moss_image`), `EmptyFlux2LatentImage` y `Lora Loader Stack (rgthree)`.
- Aplicacion de LoRA apilados: aceleracion de pasos y modulacion de contenido.
- Reproduccion de un pipeline preconfigurado con parametros de muestreo fijos (CFG 1.5, `euler`/`simple`, denoise 1.0).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking; es un pipeline puramente generativo de imagen.
- Soporte multilingue de prompts: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de imagenes en ComfyUI: descargar el repo en la raiz de ComfyUI y lanzar el workflow permite obtener imagenes en 4 pasos sin ajustar nodos ni rutas, util para validar una idea visual en minutos.
- Generacion de assets para previsualizacion de producto: a 768×768 y con 4 pasos, el coste por imagen es bajo, lo que permite iterar decenas de variaciones de un concepto antes de encargar un render final.
- Creacion de ilustraciones conceptuales para documentacion tecnica o blogs: el pipeline produce imagenes cuadradas consistentes que se pueden insertar directamente en articulos sin reescalado.
- Experimentacion con apilado de LoRA: el repo incluye dos LoRA con fuerzas distintas (1.0 y 0.2), lo que sirve como caso de estudio para medir como interactua un LoRA de destilado de pasos con un LoRA de estilo o contenido.
- Reproducibilidad de un entorno concreto: al fijar versiones exactas de difusion, text encoder, VAE y LoRA con checksums en `SHA256SUMS.txt`, sirve para replicar resultados entre maquinas o para auditar que pesos se usaron en una tanda de imagenes.
- Base para flujos automatizados por lotes: al estar estructurado como arbol `models/`, se puede montar en un contenedor o en un volumen compartido y alimentar un script que genere imagenes en cola sin intervencion manual.
- Pruebas de compatibilidad de ComfyUI: util para verificar que una build concreta soporta el latente Flux2 y el tipo `moss_image` antes de desplegar otros workflows basados en MOSS-Image.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el conjunto de pesos suma aproximadamente 10,8 GiB (5,04 + 5,06 + 0,31 + 0,30 + 0,08 GiB), por lo que se necesita una GPU con al menos 12 GB de VRAM para cargar todo en memoria; con overhead de activaciones y latentes a 768×768, 16 GB es un minimo practico razonable.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB) y H100 para despliegues con concurrencia. En GPUs de 12 GB puede requerir descarga parcial de modulos a RAM del sistema.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 4080 de forma holgada; en RTX 4070 Ti Super (16 GB) y RTX 4060 Ti (16 GB) con margen ajustado; en GPUs de 8-12 GB solo con offloading.
- Opciones de despliegue: ComfyUI es el unico entorno documentado, con soporte obligatorio de `EmptyFlux2LatentImage` y del tipo `moss_image` en `CLIPLoader`, mas el nodo personalizado `rgthree-comfy` para `Lora Loader Stack (rgthree)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un pipeline de difusion de este tipo.
- Latencia y throughput estimados: no disponibles. El muestreo se fija en 4 pasos, lo que reduce el coste frente a pipelines de 20-50 pasos, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dennygod/moss-image-workflow | No disponible (text encoder 9B + difusion int8) | No disponible | Sin benchmarks publicados | `other` / mixed | Hugging Face, 0 descargas |
| FLUX.1 [dev] (referencia de ecosistema Flux) | 12B | No disponible | Ampliamente evaluado en la comunidad | No comercial | Hugging Face, amplia adopcion |
| SDXL | 2,6B UNet + text encoders | No disponible | Estandar de facto en ComfyUI | OpenRAIL++ | Hugging Face, muy extendido |

La comparacion es orientativa: no se dispone de datos de benchmarks del modelo de este repositorio, y las alternativas se incluyen por compartir categoria (texto-a-imagen ejecutable en ComfyUI) y no por paridad medida. MOSS-Image no figura entre los pipelines mas adoptados, y este repo en particular registra 0 descargas y 0 likes en el momento de la consulta.

## Limitaciones y advertencias

- El repositorio no es un modelo original: es una copia de pesos de terceros. La licencia `mixed` obliga a revisar `SOURCES.md` y las licencias de cada componente (MOSS-Image, Qwen3.5, Flux2 VAE y los LoRA) antes de cualquier uso comercial.
- Uno de los LoRA incluidos (`PenisLoraMossNoTriggerwords.safetensors`) es un LoRA de contenido explicito. Su presencia condiciona el uso del repo en entornos profesionales y puede requerir eliminarlo del arbol `models/` antes de desplegar.
- Dependencia estricta de una build de ComfyUI que soporte el latente Flux2 y el tipo `moss_image`; versiones anteriores fallaran al cargar el text encoder.
- Requiere el nodo personalizado `rgthree-comfy`; sin el, el workflow de referencia no se puede reconstruir tal cual.
- Los parametros de muestreo estan fijados por el autor (4 pasos, CFG 1.5, `euler`/`simple`, 768×768, denoise 1.0); desviarse de ellos puede degradar la calidad sin que se documenten alternativas.
- No hay informacion sobre sesgos, tasas de alucinacion visual, idiomas de prompt soportados ni evaluaciones de seguridad.
- El modelo base es un SFT (supervised fine-tuning) en int8; la cuantizacion int8 y W4A8 puede introducir perdida de fidelidad frente a los pesos originales en bf16, no cuantificada en la informacion disponible.
- Sin benchmarks, sin demos y con 0 descargas: no hay evidencia publica de calidad ni de estabilidad en produccion.
- El autor advierte que el repositorio no contiene prompts, semillas ni contenido personal, solo ficheros de modelo; aun asi, conviene verificar `SHA256SUMS.txt` tras la descarga.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dennygod/moss-image-workflow
- Fichero de checksums: `SHA256SUMS.txt` dentro del repositorio
- Origen y licencias de los componentes: `SOURCES.md` dentro del repositorio
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Nodos personalizados rgthree-comfy: https://github.com/rgthree/rgthree-comfy
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, demos ni al repositorio oficial de MOSS-Image.
