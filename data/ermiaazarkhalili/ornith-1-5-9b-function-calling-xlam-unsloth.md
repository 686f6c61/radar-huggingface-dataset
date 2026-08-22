# ermiaazarkhalili/Ornith-1.5-9B-Function-Calling-xLAM-Unsloth

## Resumen

El modelo **Ornith-1.5-9B-Function-Calling-xLAM-Unsloth** es un ajuste fino (fine-tuning) del modelo base **ornith-ai/Ornith-1.5-9B**, desarrollado por el usuario ermiaazarkhalili. Está orientado a la llamada a funciones (function calling) y ha sido entrenado con las librerías Unsloth y TRL de Hugging Face, lo que permite un entrenamiento más rápido y eficiente. El modelo cuenta con aproximadamente 9.400 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de código abierto.

Aunque la model card es muy escueta y no proporciona detalles técnicos adicionales, el nombre del modelo sugiere que ha sido especializado en tareas de invocación de herramientas y agentes, probablemente utilizando el dataset xLAM. El tag `qwen3_5` indica que la arquitectura subyacente está basada en la familia Qwen, aunque no se especifican más características. Este modelo puede resultar interesante para desarrolladores que buscan una alternativa ligera y de código abierto para integrar capacidades de function calling en sus aplicaciones, especialmente en entornos donde se requiere un despliegue local o con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5 (según etiqueta `qwen3_5`), sin más detalles |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Ornith-1.5-9B podría soportar hasta 256K, pero no se confirma para este finetune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El tag `qwen3_5` sugiere que se basa en la arquitectura Qwen (posiblemente una variante reciente), pero no se especifican detalles como el número de capas, cabezas de atención o si utiliza mecanismos de atención lineal o mezcla de expertos. El modelo es un fine-tuning del modelo base `ornith-ai/Ornith-1.5-9B`, que a su vez podría ser un modelo multimodal (el pipeline declarado es `image-text-to-text`), aunque no se confirma.

El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que indica que se utilizó un enfoque de fine-tuning supervisado (SFT) o posiblemente RLHF/DPO, aunque no se especifica. Tampoco se indica el número de tokens de entrenamiento ni la composición del dataset. El nombre "xLAM" sugiere que se empleó el dataset xLAM (un conjunto de datos para function calling), pero no hay confirmación oficial.

## Capacidades

- **Function calling**: por el nombre del modelo, está especializado en la invocación de funciones y herramientas, lo que permite a los agentes interactuar con APIs y servicios externos.
- **Generación de texto**: al ser un modelo de lenguaje, conserva las capacidades básicas de generación de texto, aunque no se documentan.
- **Soporte de agentes**: probablemente puede integrarse en flujos de agentes que requieran llamadas a herramientas, aunque no hay ejemplos concretos.
- **Multilingüe**: solo se declara inglés, por lo que su rendimiento en otros idiomas es incierto.
- **Otras capacidades**: no se mencionan capacidades de visión, audio o razonamiento avanzado. El pipeline `image-text-to-text` podría indicar soporte multimodal, pero no está confirmado.

## Casos de uso

- **Asistentes virtuales con integración de APIs**: el modelo puede gestionar conversaciones donde se necesite llamar a servicios externos (consultas meteorológicas, reservas, etc.) mediante function calling.
- **Automatización de tareas empresariales**: integración en sistemas de automatización que requieran extraer datos de bases de datos o ejecutar acciones a través de herramientas.
- **Agentes de código**: uso como backend para agentes que necesiten ejecutar comandos, leer archivos o interactuar con repositorios.
- **Chatbots de soporte técnico**: para responder consultas y ejecutar acciones como crear tickets o consultar estados de pedidos.
- **Procesamiento de documentos**: si el modelo base es multimodal, podría procesar imágenes y texto para extraer información y ejecutar funciones asociadas.
- **Prototipado rápido**: al ser un modelo de 9B con licencia Apache 2.0, es adecuado para experimentar con function calling en entornos de desarrollo sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras pruebas estándar. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 9,4B parámetros en FP16, se necesitan aproximadamente 18-19 GB de VRAM. En cuantización de 8 bits, alrededor de 9-10 GB; en 4 bits, unos 5-6 GB. Sin embargo, no hay datos oficiales para este finetune concreto.
- **GPU recomendadas**: para inferencia en FP16, una GPU con 24 GB (como RTX 3090/4090, A5000) es suficiente. Para cuantización, GPUs de 8-12 GB (RTX 3060, 4070) podrían ser viables.
- **Despliegue**: compatible con librerías como vLLM, llama.cpp, Ollama y TGI (text-generation-inference), según las etiquetas.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Ornith-1.5-9B-Function-Calling-xLAM-Unsloth (este) | 9,4B | no disponible | Apache 2.0 | Function calling |
| ornith-ai/Ornith-1.5-9B (base) | 9,4B (estimado) | no disponible | Apache 2.0 | Modelo base general |
| ermiaazarkhalili/Carnice-9B-Function-Calling-xLAM-Unsloth | 9B (estimado) | 256K (según LLM Explorer) | Apache 2.0 | Function calling |

No se dispone de datos de rendimiento comparativo. El modelo Carnice parece ser un finetune similar del mismo autor, con un contexto declarado de 256K, pero no se confirma para este modelo.

## Limitaciones y advertencias

- **Documentación insuficiente**: la model card no proporciona detalles sobre el entrenamiento, el dataset o las capacidades exactas, lo que dificulta su evaluación rigurosa.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventar funciones que no existen.
- **Sesgos**: al estar entrenado principalmente en inglés, puede tener un rendimiento deficiente en otros idiomas y reflejar sesgos presentes en los datos de entrenamiento.
- **Contexto limitado**: no se confirma la longitud de contexto; si es inferior a 256K, podría fallar en tareas que requieran ventanas largas.
- **Licencia**: aunque Apache 2.0 permite uso comercial, es necesario verificar que el modelo base (Ornith-1.5-9B) también tenga una licencia compatible.
- **Producción**: al ser un finetune sin benchmarks publicados, se recomienda realizar pruebas exhaustivas antes de usarlo en entornos críticos.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/ermiaazarkhalili/Ornith-1.5-9B-Function-Calling-xLAM-Unsloth)
- [Hugging Face - modelo base Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- [LLM Explorer - Carnice-9B-Function-Calling-xLAM-Unsloth](https://llm-explorer.com/model/ermiaazarkhalili%2FCarnice-9B-Function-Calling-xLAM-Unsloth,3brbaNt0s9u4Qm1REzxJs7)
- [LLM Explorer - Ornith 1.5 9B](https://llm-explorer.com/model/ornith-ai%2FOrnith-1.5-9B,72MM1Jtgj27n4ZQu7DIW0F)
- [Unsloth](https://unsloth.ai/)
