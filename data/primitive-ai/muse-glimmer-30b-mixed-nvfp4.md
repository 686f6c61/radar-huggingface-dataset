# primitive-ai/Muse-Glimmer-30B-mixed-NVFP4

## Resumen

Muse-Glimmer-30B-mixed-NVFP4 es una cuantización de precisión mixta del modelo multimodal Muse-Glimmer-30B de Meta, publicada por el laboratorio Primitive. El modelo original, desarrollado por Meta Superintelligence Labs, es un transformer de 30 000 millones de parámetros (aunque los pesos reales en safetensors suman 18 179 133 250 parámetros) que procesa texto e imágenes, está destilado de Muse Spark y está diseñado para flujos de trabajo agénticos en hardware local. Esta versión cuantizada reduce el peso de 55,5 GiB (BF16) a 20,0 GiB, manteniendo la torre de visión intacta en BF16 y cuantizando únicamente las proyecciones del modelo de lenguaje a NVFP4.

La relevancia de esta ficha radica en que ofrece la build más pequeña y rápida del modelo entre las variantes medidas por el autor, con un throughput 2,38 veces superior al BF16 a concurrencia 32 y una precisión que iguala al BF16 en concurrencia 1. Está pensada para producción en GPUs Blackwell mediante vLLM, sin necesidad de parches, y utiliza el formato `compressed-tensors` con empaquetado NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + lenguaje), base Muse-Glimmer-30B |
| Parametros totales | 18 179 133 250 (modelo base denominado 30B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (grupo 16) para proyecciones del LM; BF16 para torre de vision, embeddings, normas y router |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer multimodal de Meta que combina una torre de visión (que procesa imágenes) con un modelo de lenguaje autoregresivo. Está destilado de Muse Spark, un modelo más grande, y optimizado para ejecutarse en hardware local con razonamiento paso a paso. La cuantización realizada por Primitive mantiene intacta la torre de visión, los embeddings, las normas y el router en BF16, mientras que las proyecciones de atención y MLP del modelo de lenguaje, junto con `lm_head`, se cuantizan a NVFP4 con un tamaño de grupo de 16. Las activaciones se cuantizan dinámicamente en tiempo de ejecución por vLLM.

La calibración se realizó únicamente con texto del dataset UltraChat, sin datos de imagen, lo que explica que la torre de visión no se haya tocado. El resultado es un modelo de 20,0 GiB que, según las mediciones del autor, alcanza 1564,9 tokens por segundo a concurrencia 32 y 71,6 tokens por segundo en un solo stream, con una latencia por token de 20,5 ms. No se han publicado detalles sobre el preentrenamiento del modelo base, como número de tokens o composición del dataset.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, y genera texto (pipeline `image-text-to-text`).
- Razonamiento paso a paso: el modelo puede razonar de forma encadenada antes de responder, aunque en esta build de vLLM el razonamiento aparece en el campo `content` en lugar de `reasoning_content` porque no se registra el parser específico de Muse-Glimmer.
- Diseñado para flujos agénticos: el modelo base está orientado a tareas de agente local, lo que implica soporte para planificación y ejecución de múltiples pasos.
- Conversación multi-turno: al ser un modelo de lenguaje conversacional, puede mantener diálogos con contexto.
- Cuantización eficiente: la precisión mixta NVFP4/BF16 permite ejecutar el modelo en GPUs Blackwell con un uso de VRAM reducido.
- Compatibilidad con vLLM: se sirve directamente con `vllm serve` sin necesidad de parches adicionales.

No se especifican capacidades explícitas de tool calling o function calling en la documentación proporcionada, aunque el carácter agéntico del modelo base sugiere que puede integrarse en pipelines de automatización.

## Casos de uso

- Asistentes de visión en dispositivos locales: el modelo puede interpretar imágenes en tiempo real sin conexión, por ejemplo para describir objetos o escenas en aplicaciones de accesibilidad o vigilancia, gracias a su torre de visión en BF16 que conserva la calidad visual.
- Automatización de tareas de interfaz de usuario: al ser un modelo agéntico multimodal, puede observar capturas de pantalla y ejecutar acciones en aplicaciones, como rellenar formularios o navegar por menús, aprovechando su razonamiento paso a paso.
- Análisis de documentos con imágenes: puede extraer información de facturas, recibos o formularios escaneados, combinando comprensión de texto e imagen, y generar resúmenes estructurados.
- Chatbots de atención al cliente con soporte visual: permite que un asistente virtual reciba imágenes enviadas por el usuario (por ejemplo, fotos de un producto defectuoso) y responda con instrucciones o soluciones, manteniendo un diálogo multi-turno.
- Agentes de planificación y toma de decisiones: su capacidad de razonamiento encadenado lo hace útil para tareas que requieren descomponer un problema en pasos, como la organización de horarios o la resolución de problemas logísticos.
- Generación de descripciones de imágenes para accesibilidad: puede crear textos alternativos detallados para imágenes en sitios web o documentos, mejorando la accesibilidad para personas con discapacidad visual.

Estos casos son viables en hardware Blackwell con al menos 24 GiB de VRAM, dado el tamaño de 20 GiB de los pesos más el overhead de activaciones.

## Benchmarks y rendimiento

El autor proporciona mediciones propias sobre una suite de 1170 muestras en 9 benchmarks públicos (límite de 3072 tokens, temperatura 1.0, top_p 0.95, top_k 64) y una submuestra de 60 muestras para un solo stream. Todas las configuraciones se midieron en una misma sesión sobre una RTX PRO 6000 Blackwell. No se incluyen resultados de benchmarks estándar como MMLU o HumanEval, por lo que estos datos son comparativos entre builds del mismo modelo base.

| build | tamaño | accuracy @ conc 32 | tok/s @ conc 32 | accuracy @ conc 1 | tok/s @ conc 1 |
|---|---|---|---|---|---|
| BF16 | 55,5 G | 86,2 | 658,6 | 88,3 | 25,4 |
| RedHat FP8-block | 32,1 G | 86,5 | 1073,9 | 83,3 | 44,2 |
| cyankiwi AWQ-INT4 | 22,4 G | 86,3 | 1402,8 | 88,3 | 64,8 |
| RedHat NVFP4 | 21,8 G | 86,3 | 1446,3 | 85,0 | 66,3 |
| **este repo** | **20,0 G** | 85,6 | **1564,9** | **88,3** | **71,6** |

La latencia por token a concurrencia 32 es de 20,5 ms, frente a 22,1 ms de la siguiente cuantización más rápida y 48,6 ms del BF16. El autor señala una pequeña pérdida de precisión a concurrencia 32 (85,6 frente a 86,2-86,5 del resto), que atribuye a ruido estadístico aunque lo reporta como una diferencia real. A concurrencia 1, esta build empata con el mejor resultado.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 20,0 GiB; con overhead de activaciones y memoria del runtime, se recomienda al menos 24 GiB de VRAM.
- GPU recomendadas: requiere hardware Blackwell con soporte NVFP4, como la RTX PRO 6000 Blackwell utilizada en las mediciones, o GPUs de la serie RTX 50 (por ejemplo RTX 5090 con 32 GB) y GPUs de centro de datos como B200.
- Compatibilidad con consumer GPU: sí, en GPUs Blackwell de gama alta con 32 GB o más; no es compatible con arquitecturas anteriores (Ampere, Ada) por el formato NVFP4.
- Opciones de despliegue: vLLM es el runtime soportado y recomendado; también puede usarse a través de Hugging Face Transformers, aunque la cuantización NVFP4 está pensada para vLLM.
- Latencia y throughput: según las mediciones del autor, 1564,9 tok/s a concurrencia 32 y 71,6 tok/s en un solo stream, con 20,5 ms de latencia por token a concurrencia 32.

## Comparativa con modelos similares

La comparación más directa es con otras cuantizaciones del mismo modelo base, que se muestran en la tabla de benchmarks. Todas comparten la misma arquitectura y capacidades, diferenciándose en tamaño, velocidad y precisión.

| Modelo | Tamaño (GiB) | Precisión @ conc 32 | Tok/s @ conc 32 | Precisión @ conc 1 | Tok/s @ conc 1 |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (BF16) | 55,5 | 86,2 | 658,6 | 88,3 | 25,4 |
| RedHat FP8-block | 32,1 | 86,5 | 1073,9 | 83,3 | 44,2 |
| cyankiwi AWQ-INT4 | 22,4 | 86,3 | 1402,8 | 88,3 | 64,8 |
| RedHat NVFP4 | 21,8 | 86,3 | 1446,3 | 85,0 | 66,3 |
| **Este repo (NVFP4 mixto)** | **20,0** | 85,6 | **1564,9** | **88,3** | **71,6** |

Frente a otros modelos multimodales de tamaño similar (por ejemplo Llama 3.2 Vision o Qwen2-VL), no se dispone de datos comparativos en la información proporcionada, por lo que no se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Pérdida de precisión a alta concurrencia: a concurrencia 32, la precisión cae a 85,6 frente a 86,2-86,5 de otras builds, una diferencia de 0,6-0,9 puntos que el autor considera real aunque pequeña.
- Requisito de hardware Blackwell: el formato NVFP4 solo funciona en GPUs Blackwell, lo que excluye arquitecturas anteriores y limita el despliegue en entornos con hardware más antiguo.
- Razonamiento inline: esta build de vLLM no registra el parser de razonamiento de Muse-Glimmer, por lo que el pensamiento del modelo se muestra dentro del campo `content` en lugar de `reasoning_content`, lo que puede afectar a integraciones que esperen una separación explícita.
- Calibración solo en texto: la cuantización se calibró únicamente con texto de UltraChat, sin datos de imagen; aunque la torre de visión se mantiene en BF16, no se ha validado el comportamiento del modelo con imágenes tras la cuantización de las proyecciones del lenguaje.
- Sin datos de sesgos o alucinaciones: no se ha publicado información sobre sesgos conocidos, riesgos de alucinación o comportamiento en dominios específicos, por lo que se recomienda evaluar el modelo en el dominio de uso antes de producción.
- Longitud de contexto no documentada: no se especifica la ventana de contexto máxima, lo que dificulta planificar tareas que requieran entradas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/primitive-ai/Muse-Glimmer-30B-mixed-NVFP4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Documentación de Meta sobre Muse Glimmer: https://dev.meta.ai/docs/muse-glimmer
- Guía para obtener el modelo: https://dev.meta.ai/docs/muse-glimmer/get-the-model
- Blog de investigación de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
