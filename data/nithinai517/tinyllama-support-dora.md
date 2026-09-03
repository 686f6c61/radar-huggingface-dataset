# nithinai517/tinyllama-support-dora

## Resumen

El modelo `nithinai517/tinyllama-support-dora` es un adaptador de fine-tuning basado en DoRA (Weight-Decomposed Low-Rank Adaptation) sobre el modelo base `TinyLlama/TinyLlama-1.1B-Chat-v1.0`. Ha sido desarrollado por el usuario nithinai517 y está diseñado específicamente para tareas de atención al cliente, utilizando un subconjunto de 5.000 ejemplos del dataset Bitext de soporte al cliente. El resultado es un modelo ligero de 1.1B parámetros que puede generar respuestas coherentes en contextos de conversación de servicio al cliente, con una pérdida de validación final de aproximadamente 0.638.

La relevancia de este modelo radica en su tamaño reducido, lo que permite su despliegue en entornos con recursos limitados, como GPUs de consumo o incluso CPU, manteniendo una calidad aceptable para tareas de chatbot. Al emplear DoRA, una variante de LoRA que descompone los pesos en magnitud y dirección, se consigue una adaptación más eficiente y estable que el LoRA estándar, especialmente con pocos datos. Aunque no se especifican licencias ni idiomas, el modelo base TinyLlama es multilingüe y de código abierto, lo que facilita su uso en aplicaciones comerciales siempre que se respete la licencia del adaptador (no declarada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama) - basado en TinyLlama-1.1B-Chat-v1.0 |
| Parametros totales | 1.1B (modelo base) + parametros del adaptador DoRA (no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (heredado del modelo base TinyLlama) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors del adaptador) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se especifica para este adaptador) |
| Licencia | No disponible (el modelo base TinyLlama usa Apache 2.0, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es TinyLlama-1.1B-Chat-v1.0, un transformer decoder con arquitectura Llama de 1.1B parámetros, entrenado con 3 billones de tokens y optimizado para tareas de chat. Sobre este modelo se aplicó un fine-tuning con DoRA (Weight-Decomposed Low-Rank Adaptation), una técnica que descompone la actualización de pesos en una componente de magnitud y otra de dirección, mejorando la estabilidad y eficiencia del entrenamiento respecto a LoRA. La configuración utilizada fue r=16, alpha=32, y se adaptaron todos los módulos de atención y feed-forward: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`.

El entrenamiento se realizó sobre un subconjunto de 5.000 ejemplos del dataset `bitext/Bitext-customer-support-llm-chatbot-training-dataset`, que contiene conversaciones de soporte al cliente en varios idiomas. No se menciona el uso de RLHF ni otras técnicas de alineación adicionales. La pérdida de validación final reportada es de ~0.638, lo que sugiere un ajuste razonable al dominio, aunque no se proporcionan más detalles sobre el proceso de entrenamiento (épocas, tasa de aprendizaje, etc.).

## Capacidades

- Generacion de texto en contexto de atencion al cliente: responde a consultas, quejas y peticiones de soporte de forma conversacional.
- Conversacion multi-turno: al estar basado en TinyLlama-Chat, mantiene coherencia en dialogos con historial.
- Adaptacion al dominio: el fine-tuning con datos de soporte mejora la terminologia y el tono respecto al modelo base.
- No se han documentado capacidades de tool calling, agentes, vision, audio ni razonamiento avanzado.
- El modelo base TinyLlama soporta multiples idiomas, pero no se ha verificado el rendimiento del adaptador en idiomas distintos del ingles.

## Casos de uso

- Chatbot de atencion al cliente en sitios web: el modelo puede integrarse en un sistema de mensajeria para resolver dudas frecuentes, gestionar incidencias y derivar casos complejos a humanos. Su contexto de 2048 tokens permite manejar conversaciones de varias interacciones.
- Automatizacion de respuestas en redes sociales: dado su tamano reducido, puede desplegarse en servidores modestos para responder comentarios o mensajes directos de clientes de forma automatica.
- Asistente virtual en aplicaciones de mensajeria (WhatsApp, Telegram): al ser un modelo ligero, puede ejecutarse en tiempo real en infraestructura cloud de bajo coste, ofreciendo respuestas inmediatas.
- Clasificacion y redaccion de tickets de soporte: el modelo puede generar resumenes o borradores de respuesta para agentes humanos, acelerando el flujo de trabajo.
- Entrenamiento de modelos mas grandes: el adaptador puede servir como punto de partida para fine-tuning adicional en dominios especificos (por ejemplo, soporte tecnico de software).
- Prototipado rapido de soluciones de IA conversacional: por su facilidad de carga con PEFT, es util para validar conceptos de chatbot sin invertir en modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la perdida de validacion final (~0.638) durante el entrenamiento, que no es comparable directamente con metricas estandar como MMLU o HumanEval. No se dispone de evaluaciones sobre conjuntos de test de atencion al cliente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en precision fp16 ocupa aproximadamente 2.2 GB, mas el adaptador (muy pequeno). Con cuantizacion 4-bit (si se aplica) podria reducirse a ~0.6 GB, pero no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) puede ejecutar el modelo en fp16. Para mayor velocidad, una RTX 3060 o superior es suficiente.
- Cabe en GPUs de consumo: si, es un modelo de 1.1B, apto para tarjetas graficas de gama media e incluso para CPU con cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` en Python. Tambien es compatible con frameworks como vLLM o llama.cpp si se fusionan los pesos, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no se han medido, pero en una GPU moderna (RTX 4090) se espera una generacion de decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| TinyLlama-1.1B-Chat (base) | 1.1B | 2048 | Apache 2.0 | Chat general |
| nithinai517/tinyllama-support-dora | 1.1B + adaptador | 2048 | No disponible | Soporte al cliente |
| Phi-2 (2.7B) | 2.7B | 2048 | MIT | Razonamiento general |
| Llama-2-7B-Chat | 7B | 4096 | Llama license | Chat general |

El adaptador se diferencia del modelo base por su especializacion en soporte al cliente, pero no se dispone de comparativas cuantitativas. Frente a modelos mas grandes como Llama-2-7B, ofrece menor capacidad pero tambien menor coste de inferencia. No hay datos de rendimiento relativo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado sesgos especificos; el dataset Bitext puede contener sesgos de idioma o cultura.
- Riesgo de alucinacion: al ser un modelo de 1.1B, es propenso a generar informacion incorrecta o inventada, especialmente en temas fuera del dominio de soporte.
- Limitaciones de contexto: la ventana de 2048 tokens es corta para conversaciones muy largas; puede perder informacion en dialogos extensos.
- Limitaciones de idioma: aunque el modelo base es multilingue, el adaptador se entreno con un subconjunto de datos que probablemente este dominado por ingles; el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia del adaptador no esta declarada, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor o utilizar el modelo base bajo su licencia Apache 2.0.
- Para produccion: el modelo no ha sido probado en entornos reales; se recomienda una evaluacion exhaustiva con datos propios antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nithinai517/tinyllama-support-dora
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset Bitext customer support: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
