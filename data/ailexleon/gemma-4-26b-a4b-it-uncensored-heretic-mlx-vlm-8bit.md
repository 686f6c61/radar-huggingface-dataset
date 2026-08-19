# ailexleon/gemma-4-26B-A4B-it-uncensored-heretic-mlx-vlm-8Bit

## Resumen

El modelo `ailexleon/gemma-4-26B-A4B-it-uncensored-heretic-mlx-vlm-8Bit` es una conversión a formato MLX del modelo `llmfan46/gemma-4-26B-A4B-it-uncensored-heretic`, que a su vez es una variante "uncensored" (abliterated) del modelo oficial de Google DeepMind **Gemma 4 26B A4B IT**. Se trata de un modelo multimodal (entrada de texto e imagen, salida de texto) con arquitectura MoE (Mixture of Experts) de 26B parámetros totales y 4B activos, con 128 expertos finos y enrutamiento top-8. El modelo original soporta una ventana de contexto de hasta 262.144 tokens e incorpora modo "thinking" y protocolo de tool-use.

La conversión MLX, realizada con `mlx-vlm` versión 0.6.13, aplica una cuantización de 8 bits y está pensada para ejecutarse en hardware Apple Silicon (Macs con chip M1/M2/M3/M4). El repositorio pesa 28.0 GB y los safetensors contienen 7.667.787.342 parámetros (dato real del repo convertido, inferior a los 26B del modelo original debido a la cuantización y posible exclusión de componentes auxiliares). La licencia declarada es Apache 2.0, aunque el modelo base de Google tiene su propia licencia.

Este modelo es relevante porque permite ejecutar en hardware Apple un Gemma 4 multimodal de alto rendimiento con las restricciones de seguridad eliminadas, lo que lo hace atractivo para investigación y experimentación, pero también conlleva riesgos importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (texto e imagen) con 128 expertos finos y enrutamiento top-8 |
| Parametros totales | 7.667.787.342 (según safetensors del repo MLX); el modelo base original tiene 26B totales |
| Parametros activos | 4B (del modelo base original) |
| Longitud de contexto | 262.144 tokens (según llmrun.dev) |
| Tipos de cuantizacion | 8-bit (según nombre y tag); existe versión 4-bit del mismo autor |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (tag); el modelo base de Google tiene su propia licencia (Gemma Terms of Use) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base original, **Gemma 4 26B A4B IT**, es un modelo MoE multimodal desarrollado por Google DeepMind. Utiliza 128 expertos finos con enrutamiento top-8, lo que significa que solo 4B de los 26B parámetros se activan por token, mejorando la eficiencia computacional. Incorpora modo "thinking" (razonamiento extendido) y un protocolo de tool-use para integración con herramientas externas. El modelo fue entrenado con datos multimodales (texto e imagen) y optimizado con técnicas de RLHF/DPO para instrucciones, aunque los detalles exactos del entrenamiento no están disponibles en la información proporcionada.

La variante "heretic" de `llmfan46` es una modificación "abliterated" (técnica que elimina selectivamente las capas de rechazo de contenido) que suprime las restricciones de seguridad del modelo original, produciendo una versión "uncensored". El autor `ailexleon` convirtió este modelo a formato MLX usando `mlx-vlm` 0.6.13 y lo cuantizó a 8 bits, optimizándolo para ejecución en Apple Silicon.

## Capacidades

- **Multimodal**: procesa imágenes y texto como entrada, genera texto como salida (pipeline `image-text-to-text`).
- **Generación de texto y razonamiento**: capaz de tareas de comprensión, generación y razonamiento complejo, incluyendo modo "thinking" para problemas que requieren pasos intermedios.
- **Tool calling / function calling**: soporta protocolo de tool-use según la documentación de vLLM Recipes, permitiendo integración con APIs y herramientas externas.
- **Generación de código y matemáticas**: al ser un modelo de la familia Gemma 4, se espera un rendimiento sólido en estas áreas, aunque no hay benchmarks específicos en la información disponible.
- **Conversación multi-turno**: etiquetado como "conversational", adecuado para diálogos extensos.
- **Idiomas**: solo se confirma inglés (`en`); el modelo base de Google puede soportar más idiomas, pero no está documentado en esta conversión.

## Casos de uso

- **Análisis y descripción de imágenes**: el modelo puede recibir una imagen y generar descripciones detalladas, extraer información visual o responder preguntas sobre el contenido. Adecuado para aplicaciones de accesibilidad o gestión de archivos multimedia.
- **Asistentes conversacionales multimodales**: integración en chatbots que necesitan entender tanto texto como imágenes, por ejemplo en atención al cliente donde el usuario envía capturas de pantalla o fotos de productos.
- **Generación de contenido creativo**: al ser una versión sin censura, puede producir textos con menos restricciones temáticas, útil para escritura creativa, guiones o narrativas que el modelo original rechazaría.
- **Investigación en seguridad y alineación**: el estudio de modelos "abliterated" ayuda a entender cómo funcionan los mecanismos de seguridad y cómo pueden eludirse, lo que es valioso para investigadores en ética de IA.
- **Prototipado rápido en Apple Silicon**: desarrolladores con Macs pueden desplegar un modelo multimodal de 26B (con cuantización 8-bit) localmente sin necesidad de GPUs dedicadas, usando `mlx-vlm` para pruebas y experimentación.
- **Automatización de tareas con tool calling**: integración en pipelines que requieren que el modelo llame a funciones externas (por ejemplo, consultar una base de datos, ejecutar código, o interactuar con APIs) mientras procesa entradas visuales y textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas para esta conversión específica ni para el modelo base "heretic". El modelo original de Google (Gemma 4 26B A4B IT) tiene benchmarks publicados por Google, pero no se incluyen en la documentación proporcionada.

## Requisitos de hardware

- **VRAM estimada**: no hay datos específicos para la versión 8-bit. Para la versión 4-bit del mismo modelo, llmrun.dev indica ~16.13 GB de VRAM en cuantización Q4_K_M. La versión 8-bit requerirá aproximadamente el doble, estimándose entre 25 y 30 GB de memoria unificada.
- **GPU recomendadas**: al ser formato MLX, está optimizado para Apple Silicon (M1/M2/M3/M4). Se recomienda un Mac con al menos 32 GB de RAM unificada para la versión 8-bit; con 64 GB o más para mayor comodidad.
- **Compatibilidad con GPU consumer**: no aplica directamente, ya que MLX es específico de Apple. El modelo base original sí puede ejecutarse en GPUs NVIDIA/AMD con otros frameworks, pero esta conversión no.
- **Opciones de despliegue**: mediante `mlx-vlm` (Python) para inferencia local. No se mencionan integraciones con vLLM, Ollama o TGI para este formato específico.
- **Latencia y throughput**: no disponibles. La latencia dependerá del chip Apple y de la memoria disponible; en un M2 Max o superior se espera un rendimiento razonable para un modelo de 4B activos, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| ailexleon/gemma-4-26B-A4B-it-uncensored-heretic-mlx-vlm-8Bit (este) | 7.67B (safetensors) / 26B totales original | 262K | 8-bit | Apache 2.0 (tag) | MLX |
| ailexleon/gemma-4-26B-A4B-it-qat-uncensored-heretic-mlx-vlm-4Bit | 26B totales original | 262K | 4-bit (QAT) | Apache 2.0 (tag) | MLX |
| Google/gemma-4-26B-A4B-it (oficial) | 26B totales / 4B activos | 262K | no cuantizado | Gemma Terms of Use | safetensors |
| llmfan46/gemma-4-26B-A4B-it-uncensored-heretic (base) | 26B totales / 4B activos | 262K | no especificado | Apache 2.0 (según tag) | safetensors |

La diferencia principal entre este modelo y la versión 4-bit del mismo autor es la precisión de cuantización (8-bit vs 4-bit), lo que afecta al tamaño y a la calidad de las respuestas. Frente al modelo oficial de Google, este elimina las restricciones de seguridad, lo que lo hace inadecuado para uso en producción sin controles adicionales.

## Limitaciones y advertencias

- **Contenido sin censura**: al ser una versión "abliterated" (uncensored), el modelo puede generar contenido ofensivo, violento, ilegal o peligroso sin restricciones. No debe utilizarse en aplicaciones orientadas al público general sin filtros adicionales.
- **Sesgos y alucinaciones**: hereda los sesgos del modelo base y puede producir información falsa o inventada, especialmente en temas controvertidos.
- **Idioma**: solo se confirma inglés; el rendimiento en otros idiomas no está garantizado.
- **Licencia ambigua**: aunque el tag indica Apache 2.0, el modelo base de Google tiene su propia licencia (Gemma Terms of Use) que puede imponer restricciones de uso comercial. Se recomienda revisar ambas licencias antes de usar el modelo en producción.
- **Riesgo de mal uso**: la combinación de multimodalidad y ausencia de restricciones facilita la generación de deepfakes, desinformación o contenido dañino.
- **Soporte limitado**: al ser una conversión comunitaria (no oficial de Google), no hay garantías de mantenimiento o corrección de errores.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ailexleon/gemma-4-26B-A4B-it-uncensored-heretic-mlx-vlm-8Bit)
- [Modelo base: llmfan46/gemma-4-26B-A4B-it-uncensored-heretic](https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-uncensored-heretic)
- [Versión 4-bit del mismo autor](https://huggingface.co/ailexleon/gemma-4-26B-A4B-it-qat-uncensored-heretic-mlx-vlm-4Bit)
- [Gemma 4 26B A4B IT en vLLM Recipes](https://recipes.vllm.ai/Google/gemma-4-26B-A4B-it)
- [Página de llmrun.dev sobre el modelo base](https://llmrun.dev/model/llmfan46-gemma-4-26b-a4b-it-uncensored-heretic)
- [Documentación de Google Cloud sobre Gemma 4 26B A4B IT](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
