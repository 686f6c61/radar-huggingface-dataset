# mistralai/Ministral-3-3B-Instruct-2512

## Resumen

Ministral 3 3B Instruct 2512 es un modelo de lenguaje de tipo "tiny" desarrollado por Mistral AI, diseñado específicamente para despliegue en el borde (edge) y entornos de bajos recursos. Forma parte de la familia Ministral 3, que incluye variantes de 3B, 8B y 14B en versiones Base, Instruct y Reasoning. Este modelo concreto es la versión Instruct post-entrenada en precisión FP8, con una arquitectura que combina un modelo de lenguaje de 3,4B parámetros con un codificador visual de 0,4B parámetros, sumando un total de 3.849.090.048 parámetros.

El modelo resuelve el problema de llevar capacidades avanzadas de IA generativa, incluyendo visión y soporte multilingüe, a dispositivos con recursos limitados. Con una ventana de contexto de 256.000 tokens y la capacidad de ejecutarse en 8 GB de VRAM en FP8 (y menos con cuantización adicional), Ministral 3 3B Instruct se posiciona como una opción relevante para aplicaciones en tiempo real, sistemas embebidos y entornos distribuidos donde no es viable desplegar modelos de mayor tamaño.

Su relevancia actual radica en la combinación de licencia Apache 2.0 (permite uso comercial y modificación), capacidades agénticas nativas con function calling y salida JSON, y un rendimiento que, según la model card, es competitivo con modelos de tamaño similar. El modelo fue creado el 31 de octubre de 2025 y actualizado el 24 de noviembre de 2026, acumulando 76.819 descargas y 317 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador visual (modelo de lenguaje de 3,4B + codificador visual de 0,4B) |
| Parametros totales | 3.849.090.048 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | FP8 (formato nativo del checkpoint); se menciona que puede cuantizarse adicionalmente para reducir requisitos de VRAM |
| Idiomas soportados | Inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano, árabe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8) |

## Arquitectura y entrenamiento

Ministral 3 3B Instruct 2512 emplea una arquitectura transformer estándar para el componente de lenguaje, complementada con un codificador visual dedicado de 0,4B parámetros que habilita capacidades multimodales. El modelo base es Ministral 3 3B Base 2512, pre-entrenado en BF16, sobre el cual se aplicó un post-entrenamiento de tipo instruct en FP8. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica destacable es su optimización para despliegue en el borde: el modelo completo cabe en 8 GB de VRAM en FP8, lo que lo hace adecuado para hardware de consumo y sistemas embebidos. La model card menciona que el modelo mantiene una fuerte adherencia a los system prompts y ofrece capacidades agénticas nativas con function calling y salida JSON. No se han proporcionado detalles sobre técnicas como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto y razonamiento general en múltiples idiomas.
- Capacidades de visión: análisis de imágenes y generación de información basada en contenido visual.
- Soporte multilingüe en once idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Function calling nativo y salida en formato JSON para integración con herramientas externas.
- Capacidades agénticas: razonamiento multi-paso y uso de herramientas en sistemas agénticos.
- Fuerte adherencia a system prompts, lo que facilita la definición de roles y comportamientos.
- Optimizado para despliegue en el borde y entornos de bajos recursos.
- No se menciona explícitamente un modo de razonamiento extendido (thinking mode) para esta variante Instruct; la familia cuenta con una versión Reasoning separada.

## Casos de uso

- **Atención al cliente automatizada en dispositivos locales**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 256.000 tokens de ventana, desplegándose en hardware de borde sin depender de la nube, lo que reduce latencia y costes de infraestructura.
- **Generación de descripciones de imágenes (image captioning)**: el codificador visual de 0,4B parámetros permite analizar imágenes y generar descripciones textuales, adecuado para aplicaciones de accesibilidad o catalogación automática de contenido visual.
- **Clasificación de texto en tiempo real**: con su tamaño reducido y capacidad de ejecutarse en 8 GB de VRAM, puede integrarse en pipelines de clasificación de documentos o moderación de contenido con latencia baja.
- **Traducción eficiente en tiempo real**: el soporte de once idiomas y su optimización para edge lo hacen adecuado para aplicaciones de traducción en dispositivos móviles o sistemas embebidos, sin necesidad de conexión a servidores remotos.
- **Extracción de datos estructurados**: mediante function calling y salida JSON, el modelo puede extraer información de documentos o conversaciones y estructurarla en formatos utilizables por otros sistemas, como en la automatización de procesos de back-office.
- **Generación de contenido breve**: ideal para la creación de respuestas cortas, resúmenes o textos promocionales en aplicaciones donde la latencia y el consumo de recursos son críticos.
- **Ajuste fino y especialización**: al ser un modelo pequeño con licencia Apache 2.0, es adecuado para fine-tuning en dominios específicos (legal, médico, técnico) con requisitos de hardware modestos.
- **Sistemas agénticos embebidos**: su soporte nativo de function calling y razonamiento multi-paso permite integrarlo en agentes autónomos que operan en entornos con recursos limitados, como robots o dispositivos IoT.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks para los modelos de mayor tamaño de la familia (14B y 8B), pero no se han publicado resultados específicos para la variante de 3B en la información disponible. A continuación se presentan los datos disponibles para los modelos superiores, que sirven como referencia del rendimiento de la familia:

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0,850 | 0,898 | 0,712 | 0,646 |
| Qwen3-14B (Thinking) | 0,737 | 0,837 | 0,663 | 0,593 |
| Ministral 3 8B | 0,787 | 0,860 | 0,668 | 0,616 |
| Qwen3-VL-8B-Thinking | 0,798 | 0,860 | 0,671 | 0,580 |

No se han publicado resultados de benchmarks específicos para Ministral 3 3B Instruct 2512 en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo completo en FP8 requiere aproximadamente 8 GB de VRAM, según la model card. Con cuantización adicional (por ejemplo, a 4 bits), el requisito se reduce por debajo de 8 GB, aunque no se especifica la cifra exacta.
- **GPU recomendadas**: al tratarse de un modelo optimizado para edge, puede ejecutarse en GPUs de consumo como la NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB) o incluso GPUs con 8 GB de VRAM en FP8. Para despliegues en servidor, se mencionan opciones como Azure y SageMaker en los tags del modelo, lo que sugiere compatibilidad con GPUs de centro de datos (A100, H100) aunque no sea su objetivo principal.
- **¿Cabe en GPU de consumo?**: sí, en FP8 cabe en GPUs con 8 GB o más de VRAM, como la RTX 3070/4060 Ti (8 GB) o superiores. Con cuantización a 4 bits, podría ejecutarse en GPUs con 4-6 GB de VRAM, aunque no se proporcionan detalles específicos.
- **Opciones de despliegue**: la librería indicada es vLLM. También se mencionan integraciones con Azure y SageMaker. Al ser un modelo con pesos en safetensors, es compatible con otros frameworks de inferencia como TGI o llama.cpp (previa conversión a GGUF), aunque no se confirma explícitamente en la información disponible.
- **Latencia y throughput estimados**: no se proporcionan datos concretos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Capacidades destacadas | Disponibilidad |
|---|---|---|---|---|---|
| **Ministral 3 3B Instruct 2512** | 3,85B (3,4B LM + 0,4B visión) | 256k | Apache 2.0 | Visión, multilingüe, function calling, edge-optimized | Hugging Face, Azure, SageMaker |
| Qwen3-VL-8B-Thinking | 8B (aproximado) | No disponible | No disponible | Visión, razonamiento | Hugging Face (según benchmarks) |
| Ministral 3 8B Instruct 2512 | 8B (aproximado) | 256k (según familia) | Apache 2.0 | Visión, multilingüe, function calling | Hugging Face |

La comparativa se limita a los modelos mencionados en la model card. No se dispone de información sobre otros modelos de tamaño similar (como Llama 3.2 3B o Phi-3.5-mini) en la información proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos en la información proporcionada, pero al ser un modelo entrenado con datos web, es probable que herede sesgos presentes en dichos datos.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos. Se recomienda validación humana en aplicaciones críticas.
- **Limitaciones de contexto o idioma**: aunque soporta 256k tokens de contexto, el rendimiento puede degradarse en contextos muy largos. El soporte multilingüe se limita a los once idiomas listados; otros idiomas pueden tener un rendimiento inferior.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, pero se recomienda revisar los términos completos. La model card menciona una "extra_gated_description" sobre el procesamiento de datos personales, que podría implicar requisitos adicionales para el acceso al modelo.
- **Caveats para producción**: la model card recomienda usar una temperatura inferior a 0,1 para entornos de producción, mantener un conjunto bien definido de herramientas en sistemas agénticos y, para visión, mantener relaciones de aspecto cercanas a 1:1 para un rendimiento óptimo. El modelo está optimizado para edge, por lo que su rendimiento en tareas de razonamiento complejo puede ser inferior al de modelos de mayor tamaño.

## Enlaces

- [Hugging Face - Ministral 3 3B Instruct 2512](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512)
- [Blog post de Mistral 3](https://mistral.ai/news/mistral-3)
- [Paper (arXiv:2601.08584)](https://arxiv.org/abs/2601.08584)
- [Colección de checkpoints adicionales de Ministral 3](https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints)
- [Ministral 3 3B Base 2512](https://huggingface.co/mistralai/Ministral-3-3B-Base-2512)
- [Ministral 3 3B Reasoning 2512](https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512)
- [Ministral 3 8B Base 2512](https://huggingface.co/mistralai/Ministral-3-8B-Base-2512)
- [Ministral 3 8B Instruct 2512](https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512)
- [Ministral 3 8B Reasoning 2512](https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512)
- [Ministral 3 14B Base 2512](https://huggingface.co/mistralai/Ministral-3-14B-Base-2512)
- [Ministral 3 14B Instruct 2512](https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512)
- [Ministral 3 14B Reasoning 2512](https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512)
- [Cliente Python de Mistral en PyPI](https://pypi.org/project/mistralai/)
