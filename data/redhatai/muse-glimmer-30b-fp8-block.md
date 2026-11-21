# RedHatAI/Muse-Glimmer-30B-FP8-block

## Resumen

Muse-Glimmer-30B-FP8-block es una versión cuantizada a FP8 del modelo multimodal Muse-Glimmer-30B, desarrollado originalmente por Muse (Meta) y optimizado por RedHatAI para su despliegue en producción con vLLM. El modelo acepta entradas de texto e imagen y genera texto, lo que lo sitúa en la categoría de image-text-to-text, con soporte explícito de tool calling y parsing de razonamiento.

La cuantización reduce el peso de cada parámetro de 16 a 8 bits, lo que disminuye aproximadamente un 50% el tamaño en disco y los requisitos de memoria GPU respecto al modelo original en precisión completa. Solo se cuantizan los pesos y activaciones de los operadores lineales dentro de los bloques transformer, dejando intactas las capas de visión, el lm_head y los embeddings.

Con 29.776 millones de parámetros y un repositorio de 34,4 GB, el modelo está pensado para servir cargas multimodales y agentes con tool calling sobre infraestructura vLLM, y ha sido validado por Red Hat en RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (transformer multimodal texto-imagen) |
| Parametros totales | 29.776.626.688 (~29,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 W8A8 con esquema FP8_BLOCK (pesos y activaciones de capas lineales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B emplea la arquitectura MuseGlimmerForConditionalGeneration, un transformer multimodal que procesa texto e imágenes como entrada y produce texto como salida. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones de atención o decodificación más allá de lo que implica el soporte de parsing de razonamiento en vLLM.

La versión FP8-block se generó mediante cuantización post-entrenamiento sin datos de calibración (model-free PTQ) con LLM Compressor, aplicando el esquema FP8_BLOCK y exportando en formato compressed-tensors. Se excluyeron de la cuantización las capas de visión, el lm_head y los embeddings, de modo que la pérdida de precisión se concentra en las proyecciones lineales de los bloques transformer.

## Capacidades

- Generación de texto condicionada por imagen y texto (image-text-to-text).
- Comprensión de imágenes combinada con instrucciones en lenguaje natural.
- Tool calling y function calling, con parser dedicado `muse_glimmer` y soporte de `--enable-auto-tool-choice` en vLLM.
- Parsing de razonamiento (`--reasoning-parser muse_glimmer`), lo que sugiere modos de razonamiento explícito en la generación.
- Conversación multi-turno en formato chat.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Despliegue compatible con endpoints y con Azure según los tags del repositorio.

## Casos de uso

- Agentes con tool calling en producción: el modelo puede invocar funciones externas mediante el parser `muse_glimmer` integrado en vLLM, lo que permite construir asistentes que consultan APIs, bases de datos o servicios internos sin capas adicionales de orquestación.
- Análisis de documentos con imágenes: al aceptar entradas image-text-to-text, puede extraer información de capturas, formularios escaneados o gráficos combinándolos con instrucciones textuales.
- Asistencia técnica multimodal: un usuario puede adjuntar una captura de error y recibir diagnóstico y pasos de resolución en una conversación multi-turno.
- Automatización de soporte al cliente: con tool calling y razonamiento, el modelo puede clasificar la consulta, consultar sistemas de ticketing y responder con contexto.
- Moderación y descripción de contenido visual: generación de descripciones textuales de imágenes para indexación o accesibilidad.
- Pipelines de razonamiento multi-paso: el parser de razonamiento permite separar la cadena de pensamiento de la respuesta final en aplicaciones que requieren trazabilidad.
- Despliegue en infraestructura Red Hat AI: validado en RHOAI y RHAIIS, adecuado para entornos empresariales que ya operan sobre esa plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de FP8 W8A8, el peso de los parámetros ocupa aproximadamente 8 bits por parámetro, es decir, alrededor de 30 GB solo para pesos; el repositorio completo ocupa 34,4 GB en disco.
- GPU recomendadas: H100, H200, A100 80GB y GPUs con soporte nativo de FP8 (arquitecturas Hopper o superior). El despliegue de referencia usa `--tensor-parallel-size 1`, lo que implica que cabe en una sola GPU de gran capacidad.
- GPU de consumo: no se dispone de datos que confirmen su funcionamiento en GPUs consumer; el soporte FP8 en estas es limitado y el tamaño de pesos dificulta su ajuste en tarjetas de 24 GB.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:muse-glimmer`), con argumentos `--generation-config auto`, `--enable-auto-tool-choice`, `--tool-call-parser muse_glimmer` y `--reasoning-parser muse_glimmer`. No se indica soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| RedHatAI/Muse-Glimmer-30B-FP8-block | ~29,8 B | no disponible | FP8 W8A8 block | Apache 2.0 | vLLM |
| meta-models/Muse-Glimmer-30B (base) | ~29,8 B | no disponible | BF16/FP16 | Apache 2.0 | transformers, vLLM |
| RedHatAI/diffusiongemma-26B-A4B-it-FP8 | ~26 B (A4B, MoE) | no disponible | FP8 | no disponible | vLLM |
| RedHatAI/Mistral-Medium-3.5-128B | ~128 B | no disponible | no disponible | no disponible | vLLM |

La comparación se limita a datos de catálogo; no hay información de rendimiento comparado entre estos modelos.

## Limitaciones y advertencias

- Al ser una cuantización FP8, puede presentar una degradación de precisión frente al modelo base en tareas sensibles a cuantización, especialmente en razonamiento numérico o generación de código.
- Las capas de visión no están cuantizadas, por lo que el consumo de memoria del codificador visual se mantiene en su precisión original.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible.
- Idiomas soportados no especificados; no se garantiza un rendimiento homogéneo fuera de los idiomas principales del modelo base.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas sin verificación previa.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- Requiere versiones específicas de vLLM (validado en 0.28.0) y argumentos de CLI concretos; un despliegue con configuración incorrecta puede desactivar el tool calling o el parsing de razonamiento.
- No se documentan sesgos conocidos en la información disponible.

## Enlaces

- [RedHatAI/Muse-Glimmer-30B-FP8-block en Hugging Face](https://huggingface.co/RedHatAI/Muse-Glimmer-30B-FP8-block)
- [Modelo base meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Guía de uso de Muse-Glimmer 30B en vLLM](https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B)
- [LLM Compressor](https://github.com/vllm-project/llm-compressor)
- [Organización RedHatAI en Hugging Face](https://huggingface.co/RedHatAI)
- [Licencia Apache 2.0](https://choosealicense.com/licenses/apache-2.0/)
