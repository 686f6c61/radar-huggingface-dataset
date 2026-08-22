# ermiaazarkhalili/Qwen3.8-4B-Function-Calling-xLAM-Unsloth-GGUF

## Resumen

El modelo `ermiaazarkhalili/Qwen3.8-4B-Function-Calling-xLAM-Unsloth-GGUF` es una cuantización en formato GGUF de un ajuste fino supervisado (SFT) mediante LoRA del modelo base `empero-ai/Qwen3.8-4B`, entrenado específicamente para la tarea de *function calling* (llamada a funciones). El autor, ermiaazarkhalili, ha generado seis cuantizaciones diferentes (desde Q2_K hasta Q8_0) para facilitar su uso en entornos con recursos limitados, como CPU o GPUs de consumo.

Este modelo resuelve el problema de dotar a un modelo de lenguaje de la capacidad de generar llamadas estructuradas a herramientas y funciones, algo esencial para agentes conversacionales y asistentes que necesitan interactuar con APIs o servicios externos. La relevancia actual radica en que el *function calling* se ha convertido en una habilidad clave para la integración de modelos de lenguaje en aplicaciones de producción, y este modelo ofrece una opción compacta (aproximadamente 4,3 mil millones de parámetros) con licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

La arquitectura del modelo base no se detalla en la información disponible, pero se presume que sigue la línea de los modelos Qwen (transformer estándar). El tamaño total de parámetros es de 4.326.350.848, y la longitud de contexto máxima utilizada durante el entrenamiento fue de 2048 tokens, aunque la ventana nativa del modelo base no se ha especificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada (base: `empero-ai/Qwen3.8-4B`, presumiblemente transformer) |
| Parámetros totales | 4.326.350.848 (4,3B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenamiento con 2048 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (formato GGUF) |
| Idiomas soportados | No disponibles (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp, Ollama, etc.) |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* de LoRA sobre `empero-ai/Qwen3.8-4B`, un modelo de la familia Qwen3.8 (aunque no se proporcionan detalles arquitectónicos internos). La adaptación se realizó mediante Supervised Fine-Tuning (SFT) con la librería Unsloth y el framework TRL de Hugging Face. El dataset utilizado fue `Salesforce/xlam-function-calling-60k`, que contiene 60.000 ejemplos de llamadas a funciones con consultas, definiciones de herramientas y respuestas estructuradas.

El entrenamiento se ejecutó con QLoRA en precisión de 4 bits, con un rango LoRA de 64 y alpha 64, una tasa de aprendizaje de 0.0002, una época y un batch efectivo de 8 (acumulación de gradientes 1×8). La secuencia máxima fue de 2048 tokens. Los adaptadores LoRA se fusionaron posteriormente con los pesos base, por lo que el modelo final no puede separarse del *fine-tune*. No se han publicado detalles sobre el dataset de entrenamiento en cuanto a idiomas o composición, más allá de su enfoque en *function calling*.

## Capacidades

- **Generación de texto general**: como modelo base es capaz de generar texto coherente y seguir instrucciones, aunque su especialización principal es la llamada a funciones.
- **Function calling**: entrenado específicamente para generar respuestas estructuradas que invoquen herramientas o APIs, siguiendo el formato de `Salesforce/xlam-function-calling-60k`.
- **Soporte de agentes**: puede integrarse en pipelines de agentes que necesiten decidir qué función llamar y con qué argumentos.
- **Multilingüismo**: no hay información específica sobre idiomas, pero al heredar del modelo base es probable que soporte múltiples idiomas, aunque no está confirmado.
- **Razonamiento multi-step**: no hay datos que lo confirmen; el modelo no ha sido evaluado en tareas de razonamiento complejo.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno y, cuando el usuario solicita una acción concreta (consultar un pedido, cambiar una reserva), generar la llamada a la API del sistema de CRM correspondiente. Su licencia Apache 2.0 permite uso comercial sin fricciones.
- **Integración de asistentes virtuales con APIs**: en aplicaciones de asistente personal, el modelo se encarga de traducir la intención del usuario en una llamada a una herramienta (por ejemplo, buscar en una base de datos, enviar un correo). Su tamaño compacto permite desplegarlo en servidores de baja potencia o en el edge.
- **Automatización de tareas de ofimática**: puede generar invocaciones a funciones para crear documentos, hojas de cálculo o enviar notificaciones, útil en entornos corporativos donde se usan herramientas como Google Workspace o Microsoft 365.
- **Pruebas de integración y desarrollo**: en entornos de desarrollo, se puede usar para generar llamadas a APIs de prueba o para simular respuestas de herramientas durante el desarrollo de agentes, gracias a su formato GGUF que permite carga rápida con llama.cpp.
- **Asistentes de código con herramientas**: puede combinarse con herramientas de análisis de código o ejecución de comandos, generando las llamadas adecuadas para tareas como la ejecución de tests o la consulta de repositorios.
- **Automatización de procesos de negocio**: en flujos de RPA (Robotic Process Automation) el modelo puede interpretar instrucciones en lenguaje natural y emitir llamadas a funciones que activen tareas de automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo. La única métrica disponible es la pérdida de entrenamiento observada en los registros SLURM, que se muestra a continuación, pero no debe interpretarse como una medida de calidad del modelo en tareas downstream.

| Job SLURM | Pasos | Pérdida inicial | Pérdida final |
|---|---|---|---|
| `55745501` | 22.200 | 1,0008 | 0,8924 |
| `55541068` | 7.500 | 0,5731 | 0,1184 |

La pérdida de entrenamiento bajó, pero no se ha realizado ninguna evaluación externa (MMLU, HumanEval, GSM8K, etc.) que permita comparar su rendimiento con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: dependiendo de la cuantización, se puede ejecutar en GPUs con poca memoria. El archivo Q4_K_M pesa 2,78 GB, por lo que una GPU con al menos 4 GB de VRAM (por ejemplo, una GTX 1650 o RTX 3050) sería suficiente para inferencia en CPU o GPU.
- **GPUs recomendadas**: para una inferencia fluida en GPU, se recomienda al menos una RTX 3060 (12 GB) para cuantizaciones mayores, o una RTX 4090 para el modelo completo con contexto largo. También es viable en CPU con llama.cpp.
- **Compatibilidad con consumer GPU**: sí, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de consumo con 6-8 GB de VRAM.
- **Opciones de despliegue**: llama.cpp (comando `llama-cli`), Ollama (creando un Modelfile), y también se puede usar con vLLM si se convierten los pesos a safetensors (aunque el repositorio solo ofrece GGUF).
- **Latencia y throughput**: no se han publicado datos. En una GPU moderna, se puede esperar un throughput de decenas de tokens por segundo, pero no se dispone de cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría (por ejemplo, otros modelos de *function calling* como `xLAM` de Salesforce o versiones de Qwen especializadas en herramientas). No hay datos de benchmarks ni de rendimiento comparativo en la información proporcionada. Por tanto, la comparativa se limita a señalar que el modelo base es `empero-ai/Qwen3.8-4B`, y que existen otras cuantizaciones del mismo *fine-tune* en el repositorio de pesos completos (`ermiaazarkhalili/Qwen3.8-4B-Function-Calling-xLAM-Unsloth`). No se conocen alternativas directas con las mismas características técnicas.

## Limitaciones y advertencias

- **Sin evaluación de benchmarks**: no se ha realizado ninguna evaluación de rendimiento en tareas estándar, por lo que no se puede garantizar la calidad de las respuestas fuera del *function calling*.
- **Sesgos y limitaciones del modelo base**: hereda los sesgos, el corte de conocimiento y los modos de fallo de `empero-ai/Qwen3.8-4B`, que no se documentan en la información proporcionada.
- **Entrenamiento en un solo dataset**: el *fine-tune* se realizó exclusivamente con `Salesforce/xlam-function-calling-60k`, por lo que el comportamiento fuera de esa distribución no ha sido probado.
- **Contexto limitado**: la secuencia máxima de entrenamiento fue de 2048 tokens, lo que puede limitar la capacidad de manejar conversaciones o instrucciones muy largas.
- **Idiomas**: no se especifica qué idiomas soporta el modelo base, por lo que se desconoce la cobertura multilingüe real.
- **Fusión de adaptadores**: los pesos LoRA están fusionados con el modelo base, por lo que no se puede eliminar el *fine-tune* si se necesita el modelo base original.

## Enlaces

- [Repositorio Hugging Face del modelo GGUF](https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-Function-Calling-xLAM-Unsloth-GGUF)
- [Repositorio Hugging Face de los pesos completos (sin cuantizar)](https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-Function-Calling-xLAM-Unsloth)
- [Modelo base `empero-ai/Qwen3.8-4B`](https://huggingface.co/empero-ai/Qwen3.8-4B)
- [Dataset `Salesforce/xlam-function-calling-60k`](https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k)
- [Repositorio GitHub de la serie Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
- [TRL (Transformer Reinforcement Learning)](https://github.com/huggingface/trl)
