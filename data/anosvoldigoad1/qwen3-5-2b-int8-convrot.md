# AnosVoldigoad1/Qwen3.5-2B-INT8-ConvRot

## Resumen

Qwen3.5-2B-INT8-ConvRot es una compilación cuantizada a INT8 del modelo multimodal Qwen/Qwen3.5-2B de Alibaba Qwen, publicada por el usuario AnosVoldigoad1 en Hugging Face. Se distribuye como un único archivo `.safetensors` de 2,96 GiB que contiene 150 capas cuantizadas en INT8-ConvRot y 482 tensores conservados en BF16/FP32. La cuantización emplea rotación de Hadamard online (Householder-4) con `group_size=256` y `per_channel=true`, junto con tensores JSON auxiliares `.comfy_quant`.

El objetivo de esta build es reducir la huella de memoria del modelo base manteniendo intacta la precisión en tareas de grounding visual: el codificador de visión, los embeddings, la cabeza de lenguaje y las capas de normalización permanecen en BF16, lo que según el autor preserva aproximadamente el 99,9 % de la precisión en localización de bounding boxes 2D (`min_cos_sim=0.99996`). El modelo está pensado para ejecutarse en el motor nativo de ComfyUI, `comfy_kitchen` y P.AI AI Image Studio mediante la clase `NativeQuantLinear`.

La relevancia de esta ficha es doble: documenta una técnica de cuantización poco habitual (INT8 con rotación Hadamard en lugar de las clásicas INT8 tensorwise o INT4 de GGUF) y advierte de que se trata de un artefacto de autor individual, sin métricas publicadas ni licencia declarada, lo que limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen/Qwen3.5-2B); capas cuantizadas INT8-ConvRot sobre base BF16 |
| Parametros totales | no disponible (el modelo base se denomina "2B"; el repo ocupa 3,2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 tensorwise con rotacion Hadamard online (`convrot=true`, `convrot_groupsize=256`, `per_channel=true`); capas de vision, embeddings, `lm_head`, normalizacion y parametros 1D/Conv en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.safetensors` unico (`qwen35_2b_int8_convrot.safetensors`, 2,96 GiB) con sidecar JSON `.comfy_quant` |

## Arquitectura y entrenamiento

La build no introduce entrenamiento nuevo: es una conversión post-entrenamiento del modelo Qwen/Qwen3.5-2B de Alibaba Qwen, del que hereda la arquitectura transformer multimodal (torre de visión más modelo de lenguaje). La innovación reside en el esquema de cuantización: 150 capas se almacenan en INT8 aplicando una rotación de Hadamard online (Householder-4) con tamaño de grupo 256 y escala por canal, técnica que redistribuye los valores atípicos antes de cuantizar para reducir el error de redondeo. Los tensores asociados a la percepción visual (`visual.*`), `embed_tokens`, `lm_head`, normalizaciones y parámetros 1D/Conv se mantienen en BF16 o FP32 para no degradar el grounding.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre etapas de RLHF o DPO, ya que corresponden al modelo base y no se detallan en la model card. El autor reporta una similitud coseno mínima de 0,99996 en la preservación de cajas delimitadoras 2D, métrica interna de fidelidad de la cuantización y no un benchmark estándar.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-2B.
- Procesamiento multimodal: entrada de imagen y texto, con torre de visión conservada en BF16.
- Grounding visual: localización de objetos mediante bounding boxes 2D, capacidad destacada explícitamente por el autor.
- Soporte de tool calling y function calling: no disponible (no confirmado en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Grounding visual en pipelines de generación de imágenes: el modelo puede producir cajas delimitadoras 2D que alimenten flujos de inpainting o segmentación en ComfyUI, aprovechando que el codificador de visión permanece en BF16 y conserva la precisión de localización.
- Edición de imágenes asistida por lenguaje en ComfyUI: al integrarse con el motor nativo (`NativeQuantLinear`), permite seleccionar regiones descritas en texto y aplicarlas a nodos de edición sin salir del grafo.
- Anotación automática de datasets visuales: generación de bounding boxes para preetiquetar imágenes antes de la revisión humana, con la ventaja de un archivo de 2,96 GiB que cabe en GPUs de consumo.
- Prototipado de asistentes visuales en local: despliegue en estaciones de trabajo con una sola GPU para experimentar con preguntas y respuestas sobre imágenes sin depender de APIs externas.
- Investigación sobre cuantización: servir como referencia reproducible para estudiar el impacto de la rotación Hadamard INT8 en tareas de percepción frente a cuantizaciones tensorwise convencionales.
- Integración en P.AI AI Image Studio: uso del modelo como motor de comprensión visual dentro de esta herramienta, según la compatibilidad declarada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la fidelidad de la cuantización en grounding visual (`min_cos_sim=0.99996`), que no constituye un benchmark estándar comparable con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3-4 GB solo para los pesos (2,96 GiB de archivo); el pico real depende de la longitud de contexto y del tamaño de las imágenes de entrada, no disponible.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para margen de activaciones; no se especifican modelos concretos (A100, H100, RTX 4090) en la información.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: ComfyUI, `comfy_kitchen` y P.AI AI Image Studio Native Engine (`NativeQuantLinear`). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato INT8-ConvRot con sidecar `.comfy_quant` probablemente no sea cargable por esos motores sin conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-INT8-ConvRot | no disponible ("2B") | no disponible | INT8-ConvRot (Hadamard) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-2B (base) | no disponible ("2B") | no disponible | BF16 original | no disponible en esta ficha | Hugging Face, oficial de Alibaba Qwen |
| Otras builds cuantizadas de Qwen3.5-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta build y el modelo base ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de autor individual con 0 descargas y 0 likes: no ha pasado revisión comunitaria ni validación independiente.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que remitirse a la licencia del modelo base Qwen/Qwen3.5-2B antes de cualquier despliegue.
- Compatibilidad restringida: el formato INT8-ConvRot con tensores `.comfy_quant` está atado a ComfyUI, `comfy_kitchen` y P.AI AI Image Studio; otros runners necesitarán conversión.
- Riesgo de alucinación inherente al modelo base, no cuantificado en esta build.
- Sesgos: no documentados; se heredan los del modelo base, sin evaluación específica.
- Idiomas y contexto: no disponibles, lo que impide planificar aplicaciones multilingües o de contexto largo.
- La métrica de fidelidad (`min_cos_sim=0.99996`) es una medida interna del autor, no un benchmark reproducible de forma independiente.
- Fecha de creación futura (2026-11-23) en los metadatos: conviene verificar la procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/AnosVoldigoad1/Qwen3.5-2B-INT8-ConvRot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
