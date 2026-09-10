# HusseinAlamutu/tiny-aya-earth-yoruba-lora

## Resumen

El modelo `HusseinAlamutu/tiny-aya-earth-yoruba-lora` es un adaptador LoRA ajustado con QLoRA sobre el modelo base `CohereLabs/tiny-aya-earth` (3.35B parámetros), especializado en el seguimiento de instrucciones en yoruba (yo). Lo desarrolla Hussein Alamutu con el objetivo de ofrecer inferencia soberana, offline y en infraestructuras Kubernetes con recursos limitados, aprovechando la cuantización a GGUF y el despliegue con `llama.cpp`. Se entrenó sobre el subconjunto yoruba del dataset `masakhane/african-ultrachat`, lo que lo convierte en una opción para aplicaciones de texto conversacional en una lengua africana de bajos recursos. El adaptador tiene un tamaño de repositorio de 0.4 GB y se publica bajo licencia Apache 2.0.

El modelo base es un transformer denso decoder-only con Grouped Query Attention (GQA), 36 capas y una ventana de contexto de 8k tokens. Al tratarse de un adaptador, no es un modelo completo: requiere cargar el modelo base y aplicar los pesos LoRA, o fusionarlos, para su uso efectivo. El formato de pesos disponible es `safetensors` para el adaptador, y la intención declarada es cuantizar a GGUF para entornos con hardware limitado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con GQA (base) + adaptador LoRA |
| Parametros totales | 3.35B (base) + adaptador LoRA |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 8k tokens |
| Tipos de cuantizacion | QLoRA 4-bit NF4 (entrenamiento); GGUF para inferencia (según caso de uso) |
| Idiomas soportados | Yoruba (principal); otros idiomas del base no especificados |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador); GGUF (cuantizado, para despliegue con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `tiny-aya-earth` es un transformer denso decoder-only con Grouped Query Attention (GQA), compuesto por 36 capas y una ventana de contexto de 8k tokens. El ajuste fino se realizó mediante QLoRA, que cuantiza el modelo base a 4-bit NF4 (NormalFloat4) y entrena adaptadores LoRA de rango 16 y alpha 32. Esto permite un entrenamiento eficiente en memoria sin perder las capacidades generales del base. El dataset de entrenamiento es el subconjunto en yoruba de `masakhane/african-ultrachat`, un corpus de instrucciones conversacionales multilingüe. No se menciona en la información disponible el uso de RLHF, DPO ni otras etapas de alineación. La innovación principal es la combinación de un modelo preentrenado ligero con un adaptador LoRA para una lengua africana concreta, optimizado para inferencia soberana en Kubernetes mediante llama.cpp y formatos GGUF.

## Capacidades

- Generación de texto conversacional en yoruba a partir de instrucciones del dataset African UltraChat.
- Seguimiento de instrucciones en formato chat para el idioma yoruba.
- Inferencia offline en entornos Kubernetes con recursos restringidos, gracias a su uso previsto con GGUF y llama.cpp.
- No se han documentado capacidades de tool calling, function calling, agentes, visión, audio ni soporte de razonamiento multi-step en la información disponible.
- El base `tiny-aya-earth` podría tener capacidades multilingües, pero no se especifican en la model card del adaptador.

## Casos de uso

- Asistente conversacional en yoruba para comunidades locales: el modelo puede gestionar conversaciones multi-turno en yoruba, con una ventana de 8k tokens suficiente para diálogos extensos. Su entrenamiento sobre UltraChat lo prepara para responder a instrucciones y preguntas en este idioma.
- Atención al cliente automatizada en yoruba para empresas o instituciones africanas: al estar enfocado en yoruba y optimizado para inferencia offline en Kubernetes, puede desplegarse en un datacenter soberano o en la nube privada, reduciendo dependencias de servicios externos.
- Herramientas educativas de apoyo al aprendizaje del yoruba: el modelo puede generar explicaciones, ejercicios y respuestas a dudas en yoruba, aprovechando su capacidad de seguir instrucciones y su contexto de 8k tokens para material didáctico.
- Procesamiento de documentos y textos en yoruba en entornos con requisitos de privacidad: al poder ejecutarse con llama.cpp en CPU o GPU de bajo consumo, es adecuado para procesar correos, informes o mensajes sin enviar datos a la nube.
- Chatbot comunitario para zonas rurales sin conectividad: la combinación de QLoRA y GGUF permite ejecutar el modelo en hardware de bajo coste, facilitando un servicio de consultas en yoruba en clínicas, cooperativas o centros comunitarios.
- Investigación lingüística y desarrollo de recursos para lenguas africanas: el modelo puede usarse como base para estudiar la generación de texto en yoruba, comparar con otros adaptadores o servir de referencia en tareas de análisis de sentimiento y clasificación de texto en este idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de evaluaciones como MMLU, HumanEval, GSM8K u otras métricas de rendimiento para este adaptador ni para su uso específico en yoruba.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo base tiene 3.35B parámetros y se recomienda cuantizarlo a GGUF, la VRAM necesaria puede rondar entre 2 y 4 GB en función del nivel de cuantización (Q4, Q5, etc.). Sin embargo, este dato no se proporciona explícitamente.
- GPU recomendadas: no se especifica un modelo concreto. Una GPU de consumo como una RTX 3060 de 12 GB o una RTX 4090 sería suficiente para ejecutar el base en 4-bit con el adaptador. En CPU, podría funcionar con 8-16 GB de RAM, aunque con latencia mayor.
- Capacidad en GPU de consumo: sí, el modelo base de 3.35B es apto para GPUs de consumo cuando se cuantiza. El adaptador LoRA añade un pequeño overhead adicional.
- Opciones de despliegue: según la model card, el uso previsto es cuantizar a GGUF y servir con `llama.cpp`. Otras opciones posibles incluyen vLLM y Ollama, aunque no están documentadas explícitamente en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de la misma categoría (adaptadores LoRA para yoruba o modelos equivalentes) en los datos proporcionados. No es posible establecer una comparativa directa con alternativas verificables. Se puede señalar que el modelo base `CohereLabs/tiny-aya-earth` es la referencia sobre la que se construye el adaptador, pero no se ofrecen datos de rendimiento comparado.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de alucinaciones para este adaptador, por lo que existe riesgo de generar contenido incorrecto o estereotipado.
- Es un adaptador LoRA y no un modelo completo: requiere cargar el modelo base y aplicar los pesos. No funciona de forma independiente si no se gestiona correctamente.
- La información disponible no documenta el rendimiento en tareas fuera de la conversación en yoruba, por lo que su uso en otros idiomas o dominios podría ser impredecible.
- No se mencionan restricciones de licencia para uso comercial, ya que la licencia Apache 2.0 es permisiva. No obstante, el usuario debe verificar los términos del modelo base.
- El tamaño del repositorio es de 0.4 GB, pero el modelo completo (base + adaptador) puede superar los 7 GB si se usan pesos de 16 bits; esto debe tenerse en cuenta al planificar el despliegue.
- No hay datos de benchmarks públicos, lo que limita la confianza en su calidad para aplicaciones críticas sin una evaluación previa.

## Enlaces

- HuggingFace: https://huggingface.co/HusseinAlamutu/tiny-aya-earth-yoruba-lora
- Repositorio GitHub: https://github.com/husseinalamutu/sovereign-k8s-llm
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth
- Dataset utilizado: https://huggingface.co/datasets/masakhane/african-ultrachat
