# Oscilla/granite-4.1-3b-mlx-4Bit

## Resumen

Oscilla/granite-4.1-3b-mlx-4Bit es una conversión a formato MLX con cuantización de 4 bits del modelo Granite 4.1 3B de IBM, un modelo de lenguaje denso de tipo decoder-only orientado a tareas de conversación, razonamiento, generación de código y uso de herramientas. Esta versión está pensada para ejecutarse de manera eficiente en dispositivos Apple Silicon mediante la librería mlx-lm, manteniendo la compatibilidad con el ecosistema transformers.

El modelo original, desarrollado por IBM, forma parte de la familia Granite 4.1, que incluye versiones de 3B, 8B y 30B parámetros con variantes ajustadas por instrucciones. Destaca por su soporte nativo de tool calling, generación de JSON estructurado, razonamiento matemático y capacidades multilingües, además de ser distribuido bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Esta versión MLX en 4 bits reduce significativamente el consumo de memoria respecto al modelo original, manteniendo un rendimiento razonable para despliegues en entornos con recursos limitados.

Aunque el repositorio no incluye detalles sobre la longitud de contexto ni benchmarks, la familia Granite 4.1 está diseñada para escenarios empresariales de procesamiento de lenguaje natural, especialmente en aplicaciones que requieren integración con APIs y flujos de trabajo automatizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer denso (familia Granite 4.1) |
| Parametros totales | 3B (modelo base); 531.868.160 según safetensors del repo |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | No disponible (el modelo base declara soporte multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.1-3B es un transformer denso con arquitectura decoder-only, entrenado por IBM con un enfoque en instrucciones y tareas de razonamiento. La familia Granite 4.1 se ha optimizado para tool calling, generación de JSON estructurado y razonamiento matemático, mediante un proceso de ajuste fino con instrucciones (instruction tuning) y posiblemente técnicas de alineación como RLHF o DPO, aunque no se detallan en la información disponible.

La conversión realizada por Oscilla no modifica la arquitectura interna del modelo, sino que adapta los pesos al formato MLX y aplica una cuantización de 4 bits para reducir el consumo de memoria y acelerar la inferencia en dispositivos Apple Silicon. Esta cuantización es una técnica de post-entrenamiento que no requiere reentrenamiento, y permite ejecutar el modelo en hardware con recursos limitados, aunque puede introducir una ligera degradación en la precisión respecto a la versión de 16 bits.

## Capacidades

- Generación de texto conversacional y completado de texto en múltiples dominios.
- Razonamiento matemático y lógico, con mejora específica en problemas de aritmética y álgebra.
- Generación de código y asistencia en programación, incluyendo depuración y explicación de código.
- Soporte de tool calling y function calling, permitiendo al modelo invocar herramientas externas durante la conversación.
- Generación de salidas estructuradas en JSON, útil para integraciones con APIs y agentes.
- Capacidades multilingües según el modelo base, aunque el repo no especifica idiomas concretos.
- Compatibilidad con el pipeline de transformers y mlx-lm, por lo que se puede usar con los flujos estándar de estas librerías.

## Casos de uso

- **Asistentes conversacionales en aplicaciones web**: el modelo puede gestionar diálogos multi-turno con un tamaño reducido que permite ejecutarse en servidores modestos o en el edge, respondiendo preguntas frecuentes de usuarios con contexto de la conversación.
- **Generación de código en entornos de desarrollo**: gracias a su capacidad de razonamiento y generación de código, puede usarse como autocompletado de código o para generar snippets en pipelines de CI/CD, por ejemplo, para documentar funciones o generar tests.
- **Agentes de automatización con tool calling**: la capacidad de invocar herramientas lo hace adecuado para orquestar flujos como consultas a bases de datos, llamadas a APIs o ejecución de scripts, mediante frameworks como LangChain o LlamaIndex.
- **Extracción de información y JSON estructurado**: puede transformar texto libre en estructuras JSON, útil para integrarse con sistemas de backend que requieren datos normalizados.
- **Prototipado rápido en investigación**: al ser un modelo de 3B en 4 bits, cabe en portátiles con Apple Silicon, permitiendo experimentar con RAG, agentes y razonamiento sin necesidad de infraestructura GPU dedicada.
- **Educación y documentación**: puede generar explicaciones de conceptos técnicos, resúmenes o material didáctico, aprovechando su capacidad de razonamiento y generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Para evaluar su rendimiento, se recomienda consultar la documentación oficial de IBM Granite 4.1 o ejecutar pruebas propias con el modelo base.

## Requisitos de hardware

- El tamaño del repositorio es de 1,9 GB, lo que sugiere un uso de VRAM aproximado de 2-3 GB para inferencia con cuantización de 4 bits (estimación orientativa, no proporcionada por el autor).
- Diseñado para ejecutarse en dispositivos Apple Silicon (M1, M2, M3, M4) mediante mlx-lm, aunque también es compatible con entornos transformers estándar.
- Puede ejecutarse en GPUs consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, M1 Pro) gracias a la cuantización 4 bits.
- Opciones de despliegue: mlx-lm (principal), transformers para integración con pipelines de Hugging Face, y potencialmente otras herramientas que soporten safetensors.
- No se dispone de datos de latencia o throughput específicos para esta conversión.

## Comparativa con modelos similares

La información disponible no incluye comparaciones directas con otros modelos. Como referencia de la misma categoría, se pueden considerar alternativas como:

| Modelo | Parametros | Cuantizacion | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| Granite 4.1 3B (base) | 3B | FP16 | Apache 2.0 | No disponible | Hugging Face |
| Qwen2.5 3B | 3B | FP16/GGUF | Apache 2.0 | 128K | Hugging Face |
| Llama 3.2 3B | 3B | FP16/GGUF | Llama 3.2 License | 128K | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización de 4 bits puede provocar una pérdida de precisión en tareas de razonamiento complejo o generación de código respecto al modelo original de 16 bits.
- El repositorio no documenta el contexto máximo, por lo que se recomienda probar manualmente para evitar errores en conversaciones largas.
- Al ser una conversión de terceros, no se garantiza que el comportamiento sea idéntico al modelo base de IBM; se recomienda validar en casos de uso específicos.
- El modelo base es de IBM, pero la conversión no está respaldada oficialmente por IBM; cualquier problema técnico debe dirigirse al autor de la conversión.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario revisar los términos de uso del modelo base y de la conversión.
- No se incluyen detalles sobre sesgos o alucinaciones, pero como todo modelo de lenguaje, existe el riesgo de generar información falsa o sesgada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Oscilla/granite-4.1-3b-mlx-4Bit
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b
- Documentación oficial de IBM Granite: https://www.ibm.com/granite/docs/models/granite4-1
- Página principal de IBM Granite: https://www.ibm.com/granite
- Repositorio de GitHub de Granite 4.1: https://github.com/ibm-granite/granite-4.1-language-models
- Conversión GGUF del mismo modelo (para otros entornos): https://huggingface.co/SandLogicTechnologies/granite-4.1-3b-GGUF
