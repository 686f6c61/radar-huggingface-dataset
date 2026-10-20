# drawthingsai/MOSS-Image-Base

## Resumen

MOSS-Image-Base es el modelo base de generación de imágenes a partir de texto (text-to-image) de la familia **MOSS-Image**, desarrollada por OpenMOSS. Se distribuye en formato Diffusers con licencia Apache 2.0 y está pensado tanto para uso directo como para servir de punto de partida a ajustes posteriores: el propio proyecto publica una variante SFT (MOSS-Image-SFT) que mejora la agrupación de texto y la organización de composiciones complejas respecto a esta versión base.

Su rasgo diferencial frente a otros generadorestexto-imagen es el control estructurado de la composición: acepta prompts en lenguaje natural, secuencias de etiquetas (tags) y *layouts* en JSON para especificar la colocación del texto y la disposición de los objetos dentro de la imagen. Esto lo orienta a escenas con texto renderizado (carteles, notas manuscritas, pizarras, etiquetas) y a composiciones donde la posición de cada elemento importa.

Técnicamente es un modelo de difusión con backbone transformer y muestreo flow-matching, distribuido en un repositorio de 32,5 GB que incluye transformer, codificador de texto y VAE (este último basado en el decodificador pequeño de FLUX.2). El modelo está etiquetado para inglés y chino, y se integra con Diffusers, ComfyUI (plugin nativo vía ComfyUI Manager) y una demo Gradio. Esta ficha corresponde a la copia alojada en `drawthingsai/MOSS-Image-Base`; los badges de la model card apuntan al repositorio original `OpenMOSS-Team/MOSS-Image-Base`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-imagen con backbone transformer y muestreo flow-matching; VAE con decodificador pequeño de FLUX.2 |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No aplica / no disponible (modelo de imagen; el condicionamiento es el prompt, sin ventana de contexto declarada) |
| Tipos de cuantización | No disponible (la model card solo documenta precisión de ejecución: bfloat16 para transformer y text encoder, float32 para VAE y ruido inicial) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, cargados vía Diffusers (`DiffusionPipeline.from_pretrained`, `custom_pipeline="pipeline_moss_image"`) |
| Pipeline | text-to-image |
| Resolución de ejemplo | 1024 × 1024 |
| Sampler por defecto | Flow-matching Euler |
| Pasos por defecto | 50 |
| CFG por defecto | 3 |
| Shift | 5 |
| Layer skipping | Rama negativa (negative branch), capa 22 (`uncond_skip_layers=[22]`) |
| Tamaño del repositorio | 32,5 GB |
| Dependencias mínimas | Python ≥ 3.10, PyTorch ≥ 2.9, diffusers ≥ 0.38, transformers ≥ 5.3, accelerate ≥ 1.10, safetensors ≥ 0.6, Pillow ≥ 10 |
| Hardware declarado | GPU NVIDIA con soporte CUDA |

## Arquitectura y entrenamiento

La información disponible describe un modelo de difusión para generación de imágenes condicionada por texto, con un backbone transformer (la model card indica explícitamente que transformer y codificador de texto se ejecutan en bfloat16) y un VAE independiente que se mantiene en float32, incluido el ruido inicial. El muestreo utiliza un integrador flow-matching Euler con 50 pasos, CFG 3 y shift 5 como valores por defecto, y aplica *layer skipping* sobre la rama negativa de la capa 22, un ajuste poco habitual que forma parte de la receta de inferencia recomendada por los autores.

El condicionamiento admite tres modalidades: prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON que controlan la posición del texto y la disposición de objetos. El VAE incluido emplea el decodificador pequeño de FLUX.2. No se detallan en la información proporcionada el número de parámetros, el volumen de tokens/imágenes de entrenamiento, la composición del dataset ni si hubo etapas de RLHF/DPO o ajuste por preferencias; la existencia de una variante SFT separada sugiere una etapa de *supervised fine-tuning* sobre este modelo base, pero su contenido no está documentado en los datos disponibles.

## Capacidades

- Generación de imágenes a partir de prompts en lenguaje natural, con resolución de trabajo de 1024 × 1024 en el ejemplo oficial.
- Control de composición mediante layouts en JSON: posición de objetos y ubicación del texto dentro de la escena.
- Soporte de secuencias de etiquetas (*tags*) como alternativa o complemento al prompt conversacional.
- Renderizado de texto en imagen, incluido texto manuscrito y en chino (el ejemplo de la model card genera una nota adhesiva con texto manuscrito en chino).
- Escenas complejas con múltiples objetos y relaciones espaciales (nevera, encimera, frutero en el ejemplo oficial).
- Integración con Diffusers mediante `custom_pipeline` y `trust_remote_code=True`.
- Soporte de ComfyUI mediante plugin nativo instalable desde ComfyUI Manager, con workflow de ejemplo.
- Interfaz Gradio en el proyecto, además de opciones de CPU offload y compilación.
- No se documentan en la información disponible capacidades de edición de imagen, inpainting, outpainting, control por imagen de referencia, tool calling ni agentes.

## Casos de uso

- **Creación de material promocional con texto integrado**: el modelo puede generar carteles, banners o packaging donde el texto forma parte de la composición, usando el layout JSON para fijar la posición exacta del mensaje y evitar regeneraciones por texto mal colocado.
- **Prototipado de interfaces y mockups**: generación de pantallas, pizarras y paneles con etiquetas legibles en inglés o chino, útil para validar disposiciones antes de invertir en diseño final.
- **Ilustración editorial y educativa**: escenas con anotaciones, diagramas rotulados o viñetas explicativas donde se requiere que las etiquetas aparezcan en posiciones concretas definidas por el layout.
- **Localización de creatividades para mercados chino y anglosajón**: el soporte nativo de en y zh permite generar la misma escena con texto en cualquiera de los dos idiomas sin cambiar de modelo.
- **Base para fine-tuning específico de dominio**: al ser el modelo base de la familia y publicarse bajo Apache 2.0, sirve como punto de partida para ajustar estilos de marca, productos o tipografías concretas; la propia familia incluye una variante SFT como referencia de este flujo.
- **Generación por lotes en pipelines de contenido**: integrable vía Diffusers o ComfyUI en flujos automatizados de producción de imágenes (catálogos, assets para web) con semilla fija y parámetros de muestreo reproducibles.
- **Exploración conceptual con control espacial**: uso del layout JSON para iterar rápidamente sobre disposiciones de escena (por ejemplo, distribución de producto y atrezzo) antes de pasar a render 3D o fotografía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una comparación cualitativa entre MOSS-Image-Base y MOSS-Image-SFT, en la que la variante SFT produce una agrupación de texto más clara y una disposición de pizarra más organizada. No se aportan métricas cuantitativas (FID, CLIP score, GenEval, TextBench ni similares) ni latencias medidas.

## Requisitos de hardware

- **VRAM estimada**: no documentada por los autores. Como referencia orientativa, el repositorio completo ocupa 32,5 GB en bfloat16 (transformer + text encoder + VAE), por lo que cargar todo el pipeline en memoria exige previsiblemente del orden de 30-35 GB de VRAM; esta cifra es una estimación derivada del tamaño del repo, no un dato oficial.
- **GPU de datacenter**: A100 80 GB y H100 son las opciones seguras para mantener el pipeline completo en VRAM a 1024 × 1024 en bfloat16. Una A100 40 GB queda al límite y probablemente requiera offload.
- **GPU de consumo**: no cabe entero en tarjetas de 24 GB (RTX 4090, 3090) sin offload; el proyecto ofrece explícitamente opciones de CPU offload y compilación, que permiten ejecutarlo a costa de latencia.
- **Requisitos de software**: CUDA, PyTorch ≥ 2.9, diffusers ≥ 0.38, transformers ≥ 5.3; el pipeline requiere `trust_remote_code=True` porque usa `custom_pipeline="pipeline_moss_image"`.
- **Opciones de despliegue**: Diffusers (Python), ComfyUI mediante plugin nativo, interfaz Gradio del proyecto. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (no aplicables a un modelo de difusión de este tipo).
- **Latencia y throughput**: no disponibles. Solo se conocen los parámetros por defecto (50 pasos, CFG 3), que determinan el coste computacional por imagen; no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MOSS-Image-Base | Difusión texto-imagen con control por layout JSON | en, zh | Apache 2.0 | HuggingFace, ModelScope, ComfyUI, demo Gradio | Modelo base de la familia; sin métricas publicadas en la información disponible |
| MOSS-Image-SFT | Difusión texto-imagen (variante ajustada) | en, zh | No disponible en la información proporcionada | HuggingFace, ModelScope | Misma familia; según la model card produce mejor agrupación de texto y layout más ordenado |
| FLUX.2 | Difusión texto-imagen | No disponible | No disponible | No disponible | Se cita únicamente porque el VAE de MOSS-Image usa su decodificador pequeño; no se dispone de especificaciones comparables verificadas |
| Qwen-Image | Difusión texto-imagen | No disponible | No disponible | No disponible | Familia comparable en el segmento abierto texto-imagen; sin datos verificados en la información proporcionada |

No se dispone de datos verificados de parámetros, contexto ni benchmarks de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- **Sin métricas publicadas**: no hay benchmarks objetivos en la información disponible, solo una comparación visual cualitativa frente a la variante SFT; cualquier afirmación de calidad relativa carece de respaldo numérico.
- **Texto renderizado imperfecto**: la propia model card reconoce que la versión base produce agrupaciones de texto y layouts menos organizados que la SFT, lo que implica una tasa de fallos mayor en escenas con mucho texto.
- **Cobertura de idiomas limitada**: solo en y zh; el renderizado de texto en otros idiomas (incluido el castellano) no está garantizado ni documentado.
- **Riesgo de sesgos**: no se documenta la composición del dataset ni filtros aplicados, por lo que no es posible evaluar sesgos demográficos, culturales o de representación; cabe asumir los sesgos habituales de los corpus web a gran escala.
- **Riesgo de alucinación visual**: como todo modelo generativo, puede producir detalles plausibles pero incorrectos (texto ilegible, objetos incoherentes), especialmente en escenas densas.
- **Ejecución de código remoto**: el pipeline requiere `trust_remote_code=True` y `custom_pipeline`, lo que implica descargar y ejecutar código del repositorio; conviene fijar revisiones concretas en producción.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo puede heredar obligaciones o restricciones de componentes de terceros (el VAE derivado de FLUX.2), extremo que conviene verificar antes de un despliegue comercial.
- **Requisitos de memoria elevados**: el repo de 32,5 GB hace inviable la ejecución sin offload en GPU de consumo, con la penalización de latencia correspondiente.
- **Repositorio espejo**: esta ficha corresponde a `drawthingsai/MOSS-Image-Base`, con 0 descargas y 0 likes; el repositorio de referencia de los autores es `OpenMOSS-Team/MOSS-Image-Base`. Conviene usar el original para garantizar actualizaciones y soporte.

## Enlaces

- Modelo en HuggingFace (esta copia): https://huggingface.co/drawthingsai/MOSS-Image-Base
- Modelo base original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Variante SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ModelScope (base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Image
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- arXiv: https://arxiv.org/abs/2610.23374
- Guía de usuario (inglés): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario (chino): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Guía de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Workflow de ejemplo para ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json
- Cuenta de X de OpenMOSS: https://x.com/Open_MOSS
- Discord de la comunidad: https://discord.gg/nXFWEyvbb
