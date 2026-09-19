# drbaph/Hyperflow-Comfyui

## Resumen
HyperFlow-Comfyui es un conjunto de pesos convertidos para ComfyUI del adaptador LoRA HyperFlow, desarrollado por Video Rebirth como una destilación de 8 pasos sobre el modelo MiniMax-H3. No se trata de un modelo independiente, sino de un derivado (adapter) del modelo base MiniMaxAI/MiniMax-H3 que incorpora un LoRA de time-embedder y endpoint junto con una malla fija de 8 pasos de muestreo que consume el nodo personalizado ComfyUI-Hyperflow.

Los pesos han sido convertidos y publicados por el usuario drbaph en HuggingFace, con el objetivo de que funcionen directamente con ese nodo personalizado. Es importante subrayar que no son los LoRA autónomos: requieren el nodo porque incluyen el condicionamiento temporal doble (two-time conditioning). El modelo base MiniMax-H3 es un sistema de generación conjunta de vídeo y audio basado en flow matching, y HyperFlow reduce el número de pasos de muestreo a 8 mediante destilación (self-distillation) para acelerar la inferencia.

El repositorio acumula más de 11.000 descargas y 16 likes, con un tamaño total de 7,9 GB. Cada uno de los dos archivos disponibles pesa en torno a 3,6 GiB, y la licencia aplicable es la MiniMax H3 Community License Agreement, ya que los pesos son un derivado del modelo MiniMax-H3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching (modelo base MiniMax-H3); el adaptador es un LoRA con time-embedder/endpoint y malla fija de 8 pasos |
| Parámetros totales | No disponible (es un adaptador LoRA; no se indica el recuento de parámetros del modelo base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (etiqueta del repositorio); los safetensors no declaran precisión adicional. No se detallan otros formatos |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement (MiniMax H3 Community License) |
| Formato de pesos | safetensors (`custom_node_hyperflow_8step_v1.0_comfyui.safetensors` y variante `_pruned`) |
| Modelo base | MiniMaxAI/MiniMax-H3 (relación: adapter) |
| Malla de muestreo | 8 pasos fijos |
| Tamaño del repo | 7,9 GB |
| Descargas / likes | 11.020 / 16 |
| Pipeline declarado | image-text-to-video |

## Arquitectura y entrenamiento
El adaptador se apoya en el modelo base MiniMax-H3, que emplea flow matching para la generación conjunta de vídeo y audio. HyperFlow es un LoRA de 8 pasos obtenido mediante destilación, presumiblemente self-distillation, que permite reducir drásticamente el número de evaluaciones del modelo durante el muestreo. La conversión publicada en este repositorio traduce el archivo original `minimax_h3_hyperflow_8step_v1.0.safetensors` (SHA-256 `9297f450…df447`, verificado) al formato que consume el nodo ComfyUI-Hyperflow.

Se ofrecen dos variantes con comportamiento distinto. El archivo `custom_node_hyperflow_8step_v1.0_comfyui.safetensors` (3,67 GiB) corresponde al modelo liberado de 8 pasos y conserva el condicionamiento temporal doble (two-time conditioning). El archivo `custom_node_hyperflow_8step_v1.0_comfyui_pruned.safetensors` (3,64 GiB) es solo backbone, con condicionamiento temporal simple, y el propio autor lo describe como fuera de la receta original (off-recipe), por lo que su salida puede desviarse del modelo liberado.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta el mecanismo exacto de destilación más allá de las etiquetas `distillation` y `self-distillation`. La inferencia estándar se realiza con el sampler `SamplerCustomAdvanced` y scheduler `euler`, alimentado por la salida SIGMAS del nodo, con una opción de atención dispersa (sol-attn) configurada con `start_percent` 0.25, `dense_blocks` "0,1" y `tau` 1.0.

## Capacidades
- Generación de vídeo y audio de forma conjunta a partir de distintas modalidades de entrada.
- Text-to-video: generar vídeo a partir de una descripción textual.
- Image-to-video: animar una imagen de partida.
- Image-text-to-video: combinar imagen y texto como condicionamiento (pipeline declarado del repositorio).
- Text-to-audio-video, image-to-audio-video y reference-to-audio-video: variantes que producen vídeo y pista de audio asociada.
- Muestreo en pocos pasos (few-step): malla fija de 8 pasos frente a los esquemas de decenas de pasos habituales.
- Integración con ComfyUI mediante el nodo personalizado ComfyUI-Hyperflow y el flujo `Load Diffusion Model (MiniMax-H3) → ApplyHyperFlow → SamplerCustomAdvanced + euler`.
- Soporte opcional de atención dispersa mediante el nodo `Model Sparse Attention`.
- No dispone de capacidades de lenguaje natural, razonamiento, código, matemáticas, tool calling ni uso como agente: no es un modelo de lenguaje.

## Casos de uso
- Generación de vídeo con audio sincronizado para redes sociales: el modelo produce clips con pista de audio asociada en 8 pasos, lo que permite iterar rápidamente sobre variaciones de texto o imagen de referencia.
- Previsualización de storyboards y animatics: a partir de una imagen clave (image-to-video) se pueden generar animaciones de baja latencia para validar encuadres y ritmo antes de producir el material final.
- Producción de contenido publicitario: el modo reference-to-audio-video permite partir de una referencia visual y obtener piezas con audio, útil para pruebas de concepto de campañas.
- Prototipado rápido dentro de ComfyUI: al integrarse como nodo, encaja en grafos existentes donde se encadenan otros nodos de preprocesado o postprocesado de imagen y vídeo.
- Creación de recursos para videojuegos o entornos interactivos: generación de clips cortos con sonido para prototipos de escenas o transiciones.
- Contenido educativo y demostraciones técnicas: generación de animaciones explicativas a partir de una imagen y un texto descriptivo, con audio incorporado.
- Automatización de pipelines de contenido en lote: al ser un adaptador ligero (en torno a 3,6 GiB) sobre el modelo base, puede encadenarse en flujos que procesen múltiples prompts o imágenes de referencia de forma secuencial.
- Experimentación en investigación sobre destilación de modelos de difusión: el propio adaptador sirve como caso de estudio de reducción a 8 pasos y de conversión de layouts entre diffusers y ComfyUI.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Los pesos del adaptador ocupan en torno a 3,67 GiB (versión full) y 3,64 GiB (versión pruned); el repositorio completo son 7,9 GB, pero solo se descarga uno de los dos archivos en `models/hyperflow/`.
- El adaptador no funciona por sí solo: requiere cargar el modelo base MiniMax-H3, cuyo peso y requisitos de VRAM no se detallan en la información disponible.
- VRAM total estimada: no disponible, ya que depende del modelo base y de la precisión (int8 u otras) con que se cargue.
- GPU recomendadas: no disponible. No se indica si cabe en GPU de consumo.
- Despliegue: exclusivamente a través de ComfyUI con el nodo personalizado ComfyUI-Hyperflow; el flujo indicado es `Load Diffusion Model (MiniMax-H3) → ApplyHyperFlow → SamplerCustomAdvanced + euler`. Existe la opción `download_if_missing` en el nodo para que descargue los pesos automáticamente.
- Latencia y throughput: no disponibles. La reducción a 8 pasos sugiere un menor coste de muestreo frente a esquemas con más pasos, pero no se aportan cifras.
- Atención dispersa opcional: nodo `Model Sparse Attention` con `start_percent` 0.25, `dense_blocks` "0,1" y `tau` 1.0, orientado a reducir el coste de atención en el modelo base.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. La única comparación posible es entre las dos variantes publicadas en este mismo repositorio:

| Variante | Tamaño | Base | Condicionamiento | Notas |
|---|---|---|---|---|
| `custom_node_hyperflow_8step_v1.0_comfyui.safetensors` | 3,67 GiB | full (no pruned) | Doble (two-time conditioning) | Modelo liberado de 8 pasos; uso recomendado |
| `custom_node_hyperflow_8step_v1.0_comfyui_pruned.safetensors` | 3,64 GiB | pruned / curve | Simple (off-recipe) | Solo backbone; la salida se desvía del modelo liberado |

## Limitaciones y advertencias
- No es un modelo autónomo: es un adaptador (adapter) del modelo base MiniMax-H3 y requiere ese modelo para funcionar.
- Dependencia estricta del nodo personalizado ComfyUI-Hyperflow. La variante full no se puede cargar con el nodo estándar `Load LoRA`; para eso existen los builds extraídos del repositorio `drbaph/MiniMax-H3-Turbo-Lora-ComfyUI`, que cargan solo el backbone, sin condicionamiento temporal doble, y cuya salida difiere del modelo liberado.
- El archivo original en layout diffusers es rechazado por el nodo y no se traduce en tiempo de carga; hay que usar los safetensors convertidos publicados aquí.
- La variante pruned está marcada como off-recipe y puede producir resultados que no coincidan con la receta de 8 pasos oficial.
- Licencia MiniMax H3 Community License Agreement: al ser los pesos un "Model Derivative" de MiniMax-H3, se heredan las restricciones del modelo base. Conviene revisar los términos de uso comercial antes de desplegarlo en producción.
- Cuantización int8: aunque reduce requisitos, puede degradar la calidad de la generación; no se documentan métricas al respecto.
- No hay información sobre sesgos, cobertura idiomática ni riesgo de alucinación en el sentido de los modelos de lenguaje. Al ser un modelo generativo de vídeo y audio, el riesgo relevante es la producción de artefactos visuales o de audio, contenido no deseado o incoherencias temporales.
- Ausencia total de benchmarks publicados: no es posible evaluar el rendimiento de forma cuantitativa a partir de la información disponible.
- El repositorio no declara idiomas soportados ni longitud de contexto, lo que dificulta planificar casos de uso con prompts largos o multilingües.

## Enlaces
- Repositorio HuggingFace del adaptador: https://huggingface.co/drbaph/Hyperflow-Comfyui
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio GitHub de HyperFlow (Video Rebirth): https://github.com/Video-Rebirth/hyperflow
- Nodo personalizado ComfyUI-Hyperflow: https://github.com/Saganaki22/ComfyUI-Hyperflow
- Builds standalone sin nodo personalizado: https://huggingface.co/drbaph/MiniMax-H3-Turbo-Lora-ComfyUI/
- Página de licencia referenciada por el autor (HyperFlow de Video Rebirth): https://huggingface.co/videorebirth/hyperflow
- No se han encontrado otros enlaces relevantes en la búsqueda web.
