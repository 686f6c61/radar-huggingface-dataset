# Poij3012/WanTransformer3DModel-sm120-cu130-raa

## Resumen

Poij3012/WanTransformer3DModel-sm120-cu130-raa no es un modelo entrenado, sino un repositorio de artefactos de compilacion anticipada (ahead-of-time, AoT): binarios precompilados del `WanTransformer3DModel` de Diffusers, generados por un job de Hugging Face Jobs para el objetivo `sm120` (arquitectura Blackwell de NVIDIA) y CUDA 13.0. El proposito es eliminar la necesidad de ejecutar `torch.compile` en tiempo de arranque, reduciendo la latencia de cold start y habilitando el despliegue en entornos ZeroGPU de Hugging Face Spaces.

El modelo subyacente es Wan 2.2 Image-to-Video A14B de Alibaba (referenciado en el script como `Wan-AI/Wan2.2-I2V-A14B-Diffusers`), un Diffusion Transformer tridimensional para generacion de video a partir de una imagen. El repositorio carga dos instancias del transformer (`transformer` y `transformer_2`), lo que corresponde al esquema de dos expertos del pipeline de Wan 2.2.

La relevancia de este artefacto es operativa, no cientifica: segun los datos del propio job, la compilacion reduce el tiempo de generacion de una muestra de 193,05 s a 125,85 s (aceleracion de 1,53x) sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition. El repositorio tiene 0 descargas, 0 likes y un tamano declarado de 0,0 GB, y aparecen copias del mismo artefacto bajo otras cuentas (`wolf1280`, `maplewoohoooyeah`), lo que sugiere distribucion espejo mas que un desarrollo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) 3D para video, clase `WanTransformer3DModel` de Diffusers; dos instancias de transformer en el pipeline (`transformer` y `transformer_2`) |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base se denomina "A14B") |
| Parametros activos | no disponible de forma verificada; la nomenclatura "A14B" del modelo base sugiere 14 000 millones activos |
| Longitud de contexto | no aplica / no disponible (modelo de difusion para video, no de lenguaje) |
| Tipos de cuantizacion | bfloat16 (pesos de referencia), int8 via `BitsAndBytesConfig` (text encoder), float8 con `Float8DynamicActivationFloat8WeightConfig` de torchao (bloques de ambos transformers) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | binarios precompilados AoT cargados con `spaces.aoti_load`; el formato exacto del artefacto no se especifica en la informacion disponible. El modelo base de referencia se distribuye en safetensors (Diffusers) |
| Objetivo de compilacion | `sm120` (Blackwell), CUDA 13.0, PyTorch 2.12.0+cu130 |
| Tamano del repositorio | 0,0 GB declarados |

## Arquitectura y entrenamiento

El artefacto envuelve el transformer de difusion de Wan 2.2 I2V, un modelo de difusion con backbone transformer que opera sobre latentes de video tridimensionales (frames, alto, ancho). Diffusers documenta `WanTransformer3DModel` como el modelo de difusion tipo transformer para datos tridimensionales introducido por el equipo Wan de Alibaba en Wan 2.1, y Wan 2.2 mantiene la misma clase con dos variantes de transformer en el pipeline image-to-video. El pipeline utiliza `FlowMatchEulerDiscreteScheduler` con `shift=8.0`, es decir, formulacion de flow matching con desplazamiento del schedule de ruido.

Este repositorio concreto no aporta informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de alineacion (RLHF/DPO); esos detalles corresponderian a la model card del modelo base, que no se incluye en la informacion disponible. La innovacion tecnica del repositorio es de empaquetado: exporta y compila los modulos para el objetivo `sm120`/CUDA 13.0 mediante un job reproducible (`job.py` descargable) ejecutado sobre una imagen `pytorch/pytorch:2.9.1-cuda13.0-cudnn9-devel` con flavor `rtx-6000`. El script de uso aplica ademas cuantizacion float8 dinamica sobre los bloques de atencion/MLP de ambos transformers y carga los binarios compilados con `spaces.aoti_load`.

## Capacidades

- Generacion de video a partir de una imagen (image-to-video) con el pipeline `WanImageToVideoPipeline`.
- Aceleracion de arranque en inferencia: carga de binarios precompilados sin `torch.compile` en tiempo de ejecucion.
- Compatibilidad con ZeroGPU de Hugging Face Spaces mediante `spaces.aoti_load`.
- Cuantizacion en memoria: int8 para el text encoder (bitsandbytes) y float8 dinamico para los bloques del transformer (torchao).
- Reproducibilidad del artefacto: el job de compilacion puede reejecutarse o personalizarse variando flavor, imagen y variables de entorno (`OUTPUT_REPO_NAMESPACE`, `OUTPUT_REPO_BASE_NAME`, `OUTPUT_REPO_ID`).
- Soporte de tool calling, agentes, razonamiento multietapa, vision comprensiva, audio o modo thinking: no aplica / no disponible (es un modelo generativo de video, no un LLM).
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de video publicitario a partir de una imagen de producto: el pipeline image-to-video produce clips cortos animando una fotografia fija, util para prototipado rapido de creatividades sin rodaje.
- Demos interactivas en Hugging Face Spaces con ZeroGPU: al cargar los binarios AoT se evita la penalizacion de compilacion en el primer request, lo que reduce el tiempo de espera del usuario en un Space publico.
- Previsualizacion de storyboards en produccion audiovisual: convertir frames clave en clips animados para validar encuadres y movimiento de camara antes de la produccion final.
- Servicios de inferencia con arranque en frio critico: el artefacto precompilado permite escalar replicas nuevas en Kubernetes o Modal con menor latencia inicial al no recompilar el grafo en cada contenedor.
- Investigacion en difusion de video: sirve como base reproducible para experimentar con schedulers, `shift` del flow matching y esquemas de cuantizacion float8 sin recompilar el modelo.
- Benchmarking de hardware Blackwell: permite medir el rendimiento de `sm120` con CUDA 13.0 frente a generaciones anteriores usando un artefacto identico y comparable.
- Integracion en pipelines de datos sinteticos: generar clips de video etiquetados para entrenar modelos de vision (deteccion, segmentacion temporal) a partir de un catalogo de imagenes.
- Migracion y compatibilidad de toolchain: valida el salto a CUDA 13.0 y PyTorch 2.12 en un modelo de difusion de gran tamano antes de adoptarlo en produccion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al tiempo de generacion de la muestra incluida en el job de compilacion, sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition:

| Medicion | Antes de compilar | Despues de compilar | Aceleracion |
|---|---|---|---|
| Tiempo de generacion de la muestra | 193,05 s | 125,85 s | 1,53x |

El propio autor advierte que esta cifra "puede no reflejar siempre la ganancia real de rendimiento". No se han publicado resultados de benchmarks de calidad (FVD, VBench, CLIP score ni similares) en la informacion disponible.

## Requisitos de hardware

- Objetivo de compilacion binario: `sm120`, es decir, exclusivamente GPUs NVIDIA Blackwell (el job se ejecuto en una RTX PRO 6000 Blackwell Server Edition). No es portable a arquitecturas anteriores sin recompilar.
- CUDA 13.0 y PyTorch 2.12.0+cu130 como entorno de referencia.
- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, dos transformers en bfloat16 con la denominacion A14B implicarian decenas de GB; la ruta de cuantizacion float8 del script reduce sustancialmente ese requisito. Cifra exacta no verificada.
- No cabe en GPUs de consumo con 8-24 GB sin cuantizacion agresiva y offloading; no hay datos publicados de ejecucion en RTX 4090 o similares.
- Opciones de despliegue: `spaces.aoti_load` para Spaces/ZeroGPU, carga directa con Diffusers (`WanImageToVideoPipeline`), y ejecucion reproducible via `hf jobs uv run` o Docker con `--gpus all`.
- Latencia: aproximadamente 126 s por muestra en el hardware de referencia segun el propio job; throughput por lote no disponible.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Poij3012/WanTransformer3DModel-sm120-cu130-raa (este repositorio) | no disponible (base A14B) | no aplica | 125,85 s por muestra en RTX PRO 6000 Blackwell | no disponible | publico en HF, 0 descargas |
| cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers (origen de los pesos) | no disponible (base A14B) | no aplica | no disponible | no disponible | publico en HF |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers (modelo base oficial) | no disponible (denominacion A14B) | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | publico en HF |
| Copias espejo (`wolf1280/...`, `maplewoohoooyeah/...`) | identicos a este artefacto | no aplica | identico | no disponible | publico en HF |

No se dispone de datos verificados para comparar con alternativas de otra familia (HunyuanVideo, LTX-Video u otros generadores de video), por lo que esa comparacion se considera no disponible.

## Limitaciones y advertencias

- No es un modelo: es un artefacto de compilacion. No debe citarse como modelo con parametros o licencia propios.
- El repositorio declara 0,0 GB de tamano y 0 descargas, lo que sugiere que los binarios pueden no estar efectivamente subidos o que el artefacto esta incompleto; conviene verificar los ficheros antes de depender de el.
- Acoplamiento fuerte al hardware: los binarios `sm120` no funcionan en GPUs Ampere o Ada sin recompilar el job.
- Acoplamiento fuerte al software: requiere CUDA 13.0 y una version concreta de PyTorch (2.12.0+cu130); otras combinaciones pueden invalidar el artefacto.
- Licencia no declarada: no hay base legal explicita para uso comercial en este repositorio; la licencia aplicable seria la del modelo base Wan 2.2, que no se detalla en la informacion disponible.
- Idiomas y cobertura linguistica del text encoder: no disponibles.
- Riesgo de sesgos y alucinacion visual: no evaluado en la informacion disponible; los modelos de difusion de video pueden generar artefactos temporales, deformaciones anatomicas y contenido no fiel a la imagen de entrada.
- La aceleracion de 1,53x es una medicion de una unica muestra y el propio autor advierte que puede no ser representativa.
- Repositorios espejo con el mismo nombre bajo otras cuentas: riesgo de confundir el artefacto con una publicacion original; verificar el `repo_id` exacto antes de usarlo.
- Uso de `spaces.aoti_load` implica dependencia del entorno de Hugging Face Spaces y de la API `spaces`, no estandar fuera de esa plataforma.

## Enlaces

- Repositorio: https://huggingface.co/Poij3012/WanTransformer3DModel-sm120-cu130-raa
- Artefacto de origen citado en el script: https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa
- Pesos base en bf16 referenciados: https://huggingface.co/cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers
- Modelo base oficial: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Documentacion de `WanTransformer3DModel` en Diffusers: https://github.com/huggingface/diffusers/blob/main/docs/source/en/api/models/wan_transformer_3d.md
- Codigo fuente del transformer: https://github.com/huggingface/diffusers/blob/main/src/diffusers/models/transformers/transformer_wan.py
- Documentacion de HF Jobs (configuracion y variables de entorno): https://hf.co/docs/hub/en/jobs-configuration
- Repositorio espejo: https://huggingface.co/wolf1280/WanTransformer3DModel-sm120-cu130-raa
- Repositorio espejo: https://huggingface.co/maplewoohoooyeah/WanTransformer3DModel-sm120-cu130-raa
- Documentacion tecnica de la clase en LingBot-VA: https://deepwiki.com/robbyant/lingbot-va/3.1-wantransformer3dmodel
