# JHofking/Qwen3.5-9B-sensory

## Resumen

JHofking/Qwen3.5-9B-sensory es un fine-tune del modelo base unsloth/Qwen3.5-9B, desarrollado por JHofking. El modelo base pertenece a la familia Qwen3.5 de Alibaba, un modelo de lenguaje denso de 9 000 millones de parametros con arquitectura hibrida que combina atencion por ventana deslizante con atencion global, disenado para razonamiento, comprension visual y comportamiento agente. Este checkpoint concreto se publica bajo licencia Apache 2.0 y esta optimizado para su uso con text-generation-inference, Transformers y Unsloth.

El nombre "sensory" sugiere un ajuste orientado a tareas de procesamiento sensorial o multimodal, aunque la model card no proporciona detalles adicionales sobre los datos de entrenamiento o el proposito exacto del fine-tuning. El modelo base ofrece una ventana de contexto nativa de 262 144 tokens y soporte para 201 idiomas, lo que lo hace relevante para aplicaciones de agentes y razonamiento de contexto largo en produccion. Al ser un fine-tuning, hereda las capacidades del modelo base y las adapta al dominio especifico del ajuste.

El repositorio pesa solo 0,3 GB, lo que indica que se trata de pesos cuantizados o una version ligera del modelo, aunque no se especifica el formato exacto de cuantizacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion por deslizamiento + atencion global), vision-language |
| Parametros totales | 9 000 millones (9B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | no disponible en el repo; el modelo base tiene variantes W4A16 y NVFP4 en la familia Qwen3.5 |
| Idiomas soportados | en (segun model card); el modelo base soporta 201 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), compatible con vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura hibrida que mezcla atencion por ventana deslizante (sliding window attention) para eficiencia computacional con atencion global en capas seleccionadas, lo que permite manejar contextos de hasta 262 144 tokens de forma razonable. Es un modelo denso (no MoE) de 9 000 millones de parametros, entrenado con una combinacion de datos textuales y visuales para soportar tareas de razonamiento multimodal, tool calling y comportamiento agente.

El fine-tuning de JHofking se realizo con Unsloth, que reporta un entrenamiento 2 veces mas rapido que los metodos convencionales, y la libreria TRL para el ajuste con aprendizaje por refuerzo o supervisado. No se especifican los datos de entrenamiento del fine-tuning ni si se aplicaron tecnicas como RLHF o DPO. El checkpoint base es unsloth/Qwen3.5-9B, que es una version optimizada del modelo original de Qwen.

## Capacidades

- Generacion de texto y razonamiento de contexto largo gracias a la ventana de 262K tokens.
- Comprension de vision y lenguaje: el modelo base es multimodal y puede procesar imagenes junto con texto (vision-language reasoning).
- Tool calling nativo y soporte para flujos de trabajo agente (agentic workflows).
- Capacidades multilingues: el modelo base soporta 201 idiomas, aunque la model card de este fine-tuning solo declara ingles.
- Razonamiento hibrido con modo de pensamiento extendido (thinking mode) disponible en la familia Qwen3.5.
- Compatible con pipelines de generacion de texto generico, chat multi-turno y analisis de documentos largos.

## Casos de uso

- **Analisis de documentos largos**: con 262K tokens de contexto, el modelo puede procesar libros tecnicos, contratos o codigo fuente completo en una sola pasada, extrayendo informacion y respondiendo preguntas sobre el contenido sin necesidad de chunking.
- **Asistentes de codigo con contexto de repositorio**: el soporte de tool calling y la ventana larga permiten integrar el modelo en IDEs o pipelines de CI/CD para revisar pull requests, generar documentacion y sugerir correcciones con conocimiento de todo el repositorio.
- **Razonamiento multimodal para soporte tecnico**: puede analizar capturas de pantalla, diagramas o logs visuales junto con texto para diagnosticar problemas en aplicaciones, respondiendo con pasos de solucion concretos.
- **Agentes de automatizacion de tareas**: gracias al tool calling nativo, se puede desplegar como agente que interactua con APIs, bases de datos y servicios web para ejecutar tareas multi-paso (reserva de recursos, consulta de sistemas, generacion de informes).
- **Traduccion y localizacion**: con soporte para 201 idiomas en el modelo base, sirve para traducir contenido tecnico manteniendo el contexto largo del documento original, aunque la model card del fine-tuning declara solo ingles.
- **Asistente de investigacion en STEM**: el modelo base esta orientado a razonamiento y matematicas, por lo que puede ayudar a resolver problemas numericos complejos, explicar conceptos cientificos y validar pasos de demostraciones con contexto amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este fine-tuning especifico. El modelo base Qwen3.5-9B tiene resultados publicados en plataformas como Together AI y Microsoft Foundry, pero no se dispone de los numeros concretos en la documentacion analizada. No se pueden comparar metricas de MMLU, HumanEval o GSM8K para este checkpoint sin fuentes fiables.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 9B en FP16, se necesitan aproximadamente 18 GB de VRAM solo para los pesos. Con cuantizacion W4A16 (4 bits), la VRAM se reduce a unos 5-6 GB, y con NVFP4 similar.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB) para FP16 o cuantizacion ligera; A100 40 GB o H100 para FP16 con contexto largo; Jetson Orin o Jetson Thor para despliegue en el borde con checkpoints W4A16/NVFP4 segun la plataforma Jetson AI Lab.
- **Cabe en consumer GPU**: si, con cuantizacion de 4 bits cabe en RTX 3090/4090, pero el contexto de 262K tokens requerira gestion de memoria KV cache, que puede llenar la VRAM en contextos muy largos.
- **Opciones de despliegue**: vLLM, SGLang, KTransformers, Transformers, llama.cpp (si se convierte a GGUF), Ollama, Text Generation Inference (TGI).
- **Latencia y throughput**: no disponible. Depende del hardware y la cuantizacion; con vLLM en A100 se espera un throughput de decenas de tokens por segundo para modelos de 9B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 262K | Apache 2.0 | Vision-lenguaje | Hugging Face, Azure, Together |
| Qwen3-8B (anterior) | 8B | 32K | Apache 2.0 | Texto | Hugging Face |
| Llama 3.1-8B | 8B | 128K | Llama 3.1 (uso comercial) | Texto | Hugging Face |
| Mistral 7B | 7B | 32K | Apache 2.0 | Texto | Hugging Face |

El Qwen3.5-9B destaca por su contexto de 262K tokens y su naturaleza multimodal, superando ampliamente a Llama 3.1-8B y Mistral 7B en longitud de contexto y a Qwen3-9B en soporte visual. La licencia Apache 2.0 es mas permisiva que la de Llama 3.1, que requiere condiciones especificas para uso comercial. El fine-tuning "sensory" no cambia estas caracteristicas de base, solo adapta los pesos a un dominio concreto.

## Limitaciones y advertencias

- **Sesgos**: no se han evaluado sesgos especificos para este fine-tuning; el modelo base Qwen3.5 puede heredar sesgos de los datos de entrenamiento de Qwen, que son predominantemente en ingles y chino.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar informacion falsa o inexacta, especialmente en tareas de razonamiento complejo o con datos no presentes en su entrenamiento.
- **Limitaciones de contexto**: aunque la ventana es de 262K tokens, el rendimiento puede degradarse en contextos cercanos al maximo y el coste computacional crece de forma cuadratica en atencion global.
- **Idiomas**: la model card declara solo ingles, aunque el base soporta 201 idiomas; el fine-tuning puede haber reducido el rendimiento en idiomas distintos al ingles.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar la procedencia de los datos de entrenamiento del fine-tuning, que no se han publicado.
- **Produccion**: el repositorio pesa 0,3 GB, lo que sugiere cuantizacion o pesos parciales; hay que validar la integridad del checkpoint y su compatibilidad con el framework antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JHofking/Qwen3.5-9B-sensory
- Modelo base unsloth/Qwen3.5-9B: https://huggingface.co/unsloth/Qwen3.5-9B
- Pagina del modelo base en Together AI: https://www.together.ai/models/qwen3-5-9b
- Modelo en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Qwen3.5 9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
