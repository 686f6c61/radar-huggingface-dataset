# andriivipz/SmartNotify-XLM-RoBERTa

## Resumen

SmartNotify-XLM-RoBERTa es un clasificador de urgencia de notificaciones en ucraniano, desarrollado por el usuario andriivipz y publicado en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) de FacebookAI/xlm-roberta-base con una cabeza de clasificación de secuencia de cuatro clases, que asigna a cada mensaje una etiqueta de prioridad: `low`, `medium`, `high` o `critical`. El modelo está pensado como componente de un sistema de priorización de notificaciones, no como asistente generativo.

La relevancia del modelo radica en su enfoque específico: clasificación de urgencia contextual en ucraniano, un idioma con relativamente pocos recursos en el ecosistema de modelos abiertos. Incorpora información opcional del remitente, rol, tipo de chat, contexto del usuario e historial de conversación mediante un formateador propio (`notification_formatter.py`), lo que permite enriquecer la señal de entrada más allá del texto del mensaje.

Arquitectónicamente es un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con 278 millones de parámetros. Se distribuye en formato Transformers (safetensors) y con exportaciones ONNX en FP32 e INT8, orientadas a inferencia local en CPU. La licencia es MIT y el repositorio ocupa 3,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLMRobertaForSequenceClassification (transformer encoder) |
| Parámetros totales | 278.046.724 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens arquitectónico; 192 tokens usados en entrenamiento/inferencia |
| Tipos de cuantización | FP32 (pesos Transformers y ONNX), INT8 (exportación ONNX) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers), ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa base, un transformer encoder con 12 capas, 12 cabezas de atención y 768 dimensiones ocultas, sobre el que se añade una cabeza de clasificación de secuencia de cuatro clases. La entrada no es texto plano: se construye mediante `notification_formatter.py`, que añade nombres de campo en ucraniano y omite campos opcionales vacíos. Los campos disponibles son `message` (obligatorio), `sender`, `sender_role`, `chat_type`, `user_context`, `history` y `history_turns`. Si se proporciona `history_turns` y su longitud coincide con la lista no vacía de `history`, se utiliza.

El entrenamiento se realizó sobre SmartNotify Dataset, un conjunto sintético específico del proyecto con 2.000 situaciones etiquetadas. De ellas, 130 ejemplos pasaron por revisión humana y desarrollo de reglas; la mayoría de las etiquetas restantes no fueron verificadas independientemente por humanos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a un clasificador, pero no confirmado). La longitud máxima de entrada usada en el cuaderno de entrenamiento e inferencia es de 192 tokens, aunque la longitud arquitectónica es de 512.

## Capacidades

- Clasificación de texto en cuatro niveles de urgencia: `low`, `medium`, `high` y `critical`.
- Clasificación de una sola etiqueta por notificación (single-label).
- Incorporación de metadatos contextuales: remitente, rol del remitente, tipo de chat, contexto del usuario e historial de conversación.
- Procesamiento de texto en ucraniano.
- Inferencia en CPU mediante ONNX Runtime (exportaciones FP32 e INT8).
- Integración con la librería Transformers y con text-embeddings-inference (según tags del repositorio).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Priorización de notificaciones en aplicaciones de mensajería: el modelo clasifica cada mensaje entrante en uno de cuatro niveles de urgencia para decidir si interrumpe al usuario, lo agrupa o lo silencia. Es adecuado por su entrenamiento específico en este dominio y su bajo coste de inferencia.
- Filtrado de alertas en sistemas de monitorización: integrado en un pipeline que recibe mensajes de sistemas de alerta y asigna prioridad para enrutar a guardia, cola o registro. La etiqueta `critical` permite disparar acciones inmediatas.
- Gestión de bandeja de entrada en asistentes personales: el modelo puede ordenar correos o mensajes según urgencia usando el contexto del usuario y el historial de conversación, reduciendo la carga cognitiva.
- Moderación y triaje en plataformas comunitarias: clasificación de mensajes de usuarios para detectar situaciones que requieren atención humana inmediata (por ejemplo, amenazas o emergencias), con la etiqueta `critical` como señal de escalado.
- Enrutamiento en centros de soporte: los tickets o mensajes de chat se clasifican por urgencia para asignar recursos de forma dinámica, usando `sender_role` y `chat_type` para desambiguar.
- Inferencia local en dispositivos con recursos limitados: gracias a las exportaciones ONNX INT8 y su tamaño moderado (278 M de parámetros), puede ejecutarse en CPU en entornos de escritorio o servidores sin GPU, lo que facilita despliegues en edge o en infraestructura sin aceleradores.
- Investigación en procesamiento de lenguaje ucraniano: sirve como punto de partida para experimentos de clasificación contextual en un idioma con pocos recursos, aunque con las cautelas sobre la calidad del dataset sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 278 M de parámetros, en FP32 requiere aproximadamente 1,1 GB de memoria para los pesos, más overhead de activaciones y tokenizador; en INT8, alrededor de 0,3 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP32; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes. El modelo está diseñado para funcionar también en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1650 en adelante, con al menos 2 GB de VRAM).
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime (CPU, con exportaciones FP32 e INT8), text-embeddings-inference (según tags). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La inferencia es de una sola pasada por notificación, con truncamiento a 192 tokens, lo que sugiere baja latencia en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que el modelo base FacebookAI/xlm-roberta-base es la referencia directa, pero no se han publicado métricas comparativas de rendimiento entre ambos ni con otros clasificadores de urgencia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmartNotify-XLM-RoBERTa | 278 M | 512 (192 en uso) | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 | MIT | Hugging Face |

## Limitaciones y advertencias

- El dataset de entrenamiento es sintético (2.000 ejemplos) y solo 130 ejemplos fueron revisados por humanos; la mayoría de las etiquetas no están verificadas independientemente, lo que puede introducir sesgos y errores sistemáticos.
- Las puntuaciones de probabilidad no están calibradas como estimaciones de riesgo real; no deben interpretarse como probabilidades fiables de urgencia.
- El modelo está entrenado exclusivamente en ucraniano; no se garantiza su comportamiento en otros idiomas.
- La longitud de entrada usada es de 192 tokens, inferior a la límite arquitectónica de 512; entradas más largas se truncan, lo que puede perder información relevante.
- Es un clasificador de una sola etiqueta; no modela incertidumbre entre clases más allá de la distribución softmax.
- No es un asistente generativo ni soporta tool calling, agentes o razonamiento multi-paso.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción; se recomienda validar en el dispositivo y dominio objetivo antes de desplegar.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en casos límite o fuera de distribución.

## Enlaces

- [Hugging Face: andriivipz/SmartNotify-XLM-RoBERTa](https://huggingface.co/andriivipz/SmartNotify-XLM-RoBERTa)
- [Modelo base: FacebookAI/xlm-roberta-base](https://huggingface.co/FacebookAI/xlm-roberta-base)
- [Paper de XLM-RoBERTa (arXiv:1911.02116)](https://arxiv.org/abs/1911.02116)
