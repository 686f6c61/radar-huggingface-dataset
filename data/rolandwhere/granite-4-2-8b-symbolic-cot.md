# rolandwhere/granite-4.2-8b-symbolic-cot

## Resumen

El modelo `rolandwhere/granite-4.2-8b-symbolic-cot` es un ajuste fino (fine-tuning) del modelo base `ibm-granite/granite-4.2-8b`, desarrollado por el usuario independiente rolandwhere. Su objetivo es reducir el número de tokens de razonamiento interno (thinking tokens) manteniendo o mejorando la precisión en tareas de razonamiento, mediante el uso de una notación simbólica compacta para la cadena de pensamiento (CoT) durante el modo de pensamiento, mientras que las respuestas finales se generan en inglés natural.

El modelo se entrena sobre 1080 trazas destiladas del modelo base, aplicando una adaptación de bajo rango (LoRA) con r=32. Según los datos publicados por el autor, se consigue reducir los tokens de pensamiento de 176 a 44 y aumentar la precisión en GSM8K de 0.47 a 0.75, lo que representa una mejora sustancial en eficiencia y rendimiento para un coste de entrenamiento reducido.

Este modelo es relevante para desarrolladores e investigadores que buscan optimizar la latencia y el coste de inferencia en sistemas de razonamiento, al tiempo que mantienen una calidad competitiva en problemas de matemáticas y lógica. Al estar basado en Granite 4.2, hereda las capacidades de tool calling y razonamiento integrado de la familia Granite, pero con un enfoque específico en la compacidad del razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only dense (basado en Granite 4.2-8B) |
| Parametros totales | 8 mil millones (8B) |
| Parametros activos | no aplicable (modelo dense, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el modelo se publica sin cuantizaciones predefinidas; puede cuantizarse posteriormente) |
| Idiomas soportados | no disponible (el modelo base Granite 4.2 soporta multilingue, pero este ajuste no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (se infiere por el uso de transformers, aunque no se confirma explicitamente) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2-8B es un transformer decoder-only dense, post-entrenado sobre los pesos de Granite 4.1, con capacidades de razonamiento en cadena de pensamiento (CoT) integradas y tool calling con razonamiento. El ajuste fino `granite-4.2-8b-symbolic-cot` aplica una adaptación LoRA (r=32) sobre este base, utilizando 1080 trazas destiladas del propio modelo base. La innovación principal reside en la transformación del formato de razonamiento: en lugar de generar cadenas de pensamiento verbales extensas, el modelo aprende a producir una notación simbólica compacta durante el modo de pensamiento, reduciendo así el número de tokens generados. Las respuestas finales se mantienen en inglés natural, por lo que la experiencia del usuario no se ve afectada.

No se proporcionan detalles sobre la composición del dataset de destilación ni sobre el proceso de entrenamiento (épocas, tasa de aprendizaje, etc.). Tampoco se indica si se aplicaron técnicas de RLHF o DPO adicionales.

## Capacidades

- Razonamiento matemático y lógico: mejora significativa en GSM8K (0.75 frente a 0.47 del base) con menos tokens de pensamiento.
- Razonamiento en cadena de pensamiento simbólico: genera notación compacta interna, reduciendo la latencia de inferencia.
- Tool calling (heredado del base): soporta definición de funciones según el esquema OpenAI y razonamiento sobre cuál herramienta invocar.
- Generación de texto en inglés natural: las respuestas finales son legibles y coherentes.
- Multilingüismo (potencial): el modelo base Granite 4.2 soporta múltiples idiomas, pero este ajuste no especifica su comportamiento multilingüe.
- Compatibilidad con el ecosistema transformers: se puede cargar con la librería estándar de Hugging Face.

## Casos de uso

- Optimización de costes en inferencia de razonamiento: al reducir los tokens de pensamiento, se disminuye el consumo de VRAM y el tiempo de generación, ideal para despliegues con presupuesto limitado o requisitos de baja latencia.
- Sistemas de tutoría matemática: el modelo puede resolver problemas de nivel escolar (tipo GSM8K) con alta precisión, generando explicaciones paso a paso en inglés.
- Asistentes de código con razonamiento: gracias al tool calling del base, puede planificar y ejecutar llamadas a funciones en entornos de desarrollo integrado.
- Automatización de agentes de soporte técnico: el razonamiento simbólico permite decidir rápidamente qué herramienta usar o qué respuesta dar, reduciendo la carga computacional.
- Prototipado de modelos de razonamiento eficientes: sirve como referencia para investigar cómo la destilación simbólica puede mejorar la eficiencia de modelos de 8B.
- Evaluación de técnicas de fine-tuning LoRA: el modelo es un caso de estudio para medir el impacto de la destilación de trazas y la notación compacta en modelos de tamaño medio.

## Benchmarks y rendimiento

Según la model card del autor, se reporta el siguiente resultado en GSM8K:

| Modelo | Tokens de pensamiento | Precisión GSM8K |
|---|---|---|
| Granite 4.2-8B (base) | 176 | 0.47 |
| granite-4.2-8b-symbolic-cot | 44 | 0.75 |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Para inferencia en FP16 (precisión completa): se requieren aproximadamente 16 GB de VRAM para un modelo de 8B. Esto es viable en GPUs como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes o GPTQ): el consumo se reduce a unos 6-8 GB de VRAM, permitiendo ejecución en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- El despliegue se puede realizar con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos (por ejemplo, convirtiendo a GGUF para llama.cpp).
- La reducción de tokens de pensamiento (de 176 a 44) implica una disminución aproximada del 75% en el tiempo de generación durante la fase de razonamiento, lo que mejora la latencia en entornos de producción.
- No se dispone de datos oficiales de throughput, pero la mejora en tokens de pensamiento sugiere un aumento significativo en peticiones por segundo frente al base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.2-8b-symbolic-cot | 8B | no disponible | 0.75 | Apache 2.0 | Hugging Face |
| ibm-granite/granite-4.2-8b (base) | 8B | no disponible | 0.47 | Apache 2.0 | Hugging Face |
| Llama 3.1 8B (referencia) | 8B | 128K | no disponible en la informacion | Llama 3.1 Community | Hugging Face |
| Qwen 2.5 7B (referencia) | 7B | 128K | no disponible en la informacion | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo base. No obstante, el resultado de GSM8K de 0.75 es competitivo para un modelo de 8B, aunque no se pueden extraer conclusiones sin datos adicionales.

## Limitaciones y advertencias

- Modelo experimental: tiene 0 descargas y 1 like, lo que indica que apenas ha sido probado por la comunidad. No hay garantías de robustez en entornos reales.
- Sesgos y alucinaciones: al ser un ajuste fino del modelo base Granite 4.2, puede heredar sesgos presentes en los datos de preentrenamiento. No se ha realizado una evaluación específica de sesgos.
- Riesgo de alucinación en razonamiento simbólico: la notación compacta podría llevar a errores difíciles de interpretar si el modelo genera símbolos incorrectos. Se recomienda validar las respuestas en aplicaciones críticas.
- Limitaciones de idioma: no se especifica si el modelo mantiene las capacidades multilingües del base; es probable que el ajuste se haya realizado principalmente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente y no utilizar marcas registradas de IBM sin permiso.
- Datos de entrenamiento incompletos: no se detalla el proceso de destilación, lo que dificulta la reproducibilidad.
- Dependencia del modelo base: cualquier actualización o retirada de `ibm-granite/granite-4.2-8b` podría afectar a la disponibilidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rolandwhere/granite-4.2-8b-symbolic-cot
- Modelo base Granite 4.2-8B: https://huggingface.co/ibm-granite/granite-4.2-8b
- Documentación oficial de Granite 4.2 (IBM): https://www.ibm.com/granite/docs/models/granite4-2
- Colección de modelos Granite 4.2 en Hugging Face: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
