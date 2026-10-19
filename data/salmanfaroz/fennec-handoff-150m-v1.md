# SalmanFaroz/fennec-handoff-150m-v1

## Resumen

`fennec-handoff-150m-v1` es un clasificador binario de texto, no un modelo generativo, desarrollado por SalmanFaroz y construido mediante fine-tuning de `answerdotai/ModernBERT-base` (149.605.633 parámetros). Su función es decidir si el interlocutor de un agente de voz ha terminado su turno o si ha hecho una pausa a mitad de frase. Recibe la transcripción acumulada desde que el agente dejó de hablar y devuelve `p_unfinished`, una probabilidad entre 0 y 1; por debajo de 0,5 se considera que el turno ha terminado y el texto puede enviarse al LLM, y por encima se recomienda esperar más palabras.

Es relevante para agentes de voz en inglés porque ataca un problema de latencia y naturalidad: responder demasiado pronto interrumpe al usuario, y esperar de forma fija añade retardo. El modelo se presenta como una pieza ligera (0,3 GB en fp16, unos 12 ms en GPU y 30 ms en CPU según la model card) que se sitúa entre el sistema de reconocimiento de voz y el LLM. La versión es v1, de carácter experimental, con licencia Apache-2.0 y sin benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT; fine-tuning de `answerdotai/ModernBERT-base` para clasificación binaria |
| Parámetros totales | 149.605.633 (149,6 M) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no se documentan; la model card describe fp32 en CPU y fp16 en GPU |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; librería transformers |
| Modelo base | `answerdotai/ModernBERT-base` |
| Pipeline | text-classification |
| Salida | un logit; `p_unfinished = sigmoid(logit / 0,3)` |

## Arquitectura y entrenamiento

Es un encoder Transformer ModernBERT fine-tuneado para clasificación binaria. La cabeza produce un único logit y la probabilidad se obtiene con `p_unfinished = sigmoid(logit / 0,3)`; el valor 0,3 de temperatura está en `heads.json`. El texto se pasa a minúsculas y se limpia mediante `fennec.py`. No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles del proceso de anotación.

No es un modelo MoE ni generativo: no hay decodificación especulativa, atención linear ni modo de razonamiento. Su innovación práctica es el uso de un encoder pequeño y una salida probabilística calibrada para una decisión concreta de turn-taking en agentes de voz, con latencias de milisegundos.

## Capacidades

- Clasificación binaria de fin de turno sobre texto ya transcrito por un sistema de speech-to-text.
- Salida probabilística `p_unfinished`, con umbral recomendado de 0,5 para decidir si se responde o se espera.
- Detección de pausas en frases incompletas, muletillas y construcciones como “I want to fly from Mumbai to um”.
- Baja latencia: unos 12 ms en GPU fp16 y unos 30 ms en CPU con 4 hilos, en batch 1.
- Integración como componente previo a un LLM dentro de un pipeline de voz.
- No soporta generación de texto, razonamiento, código, matemáticas ni tool calling.
- No soporta function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües: solo inglés.
- No dispone de visión, audio ni modo thinking.
- No es un modelo de embeddings general, aunque el repositorio incluye la etiqueta `text-embeddings-inference`.

## Casos de uso

- Reservas de vuelo por voz: tras la transcripción, el agente acumula la frase del usuario y consulta al modelo tras 0,5–0,8 s de silencio; si `p_unfinished` es alto, espera a que aparezca el destino o la fecha antes de enviar la petición al LLM.
- Atención al cliente telefónica: permite distinguir entre una pausa de reflexión y el final real del turno, reduciendo interrupciones y evitando respuestas prematuras en conversaciones multi-turno.
- Sistemas IVR y enrutamiento: el modelo puede decidir si el usuario ha terminado de describir su problema antes de clasificar la intención y derivar la llamada.
- Toma de pedidos y direcciones: es adecuado para pausas en nombres de productos, direcciones o cantidades, donde el usuario suele detenerse a mitad de frase.
- Agendamiento de citas: ayuda a esperar cuando el usuario está dictando fechas, horas o nombres propios con pausas y reformulaciones.
- Encuestas y recogida de feedback: permite segmentar respuestas libres en inglés sin cortar al encuestado cuando hace una pausa breve.
- Evaluación offline de transcripciones: puede etiquetar turnos completos o incompletos en un conjunto de llamadas para analizar la calidad de un agente de voz, aunque no se documenta entrenamiento específico para ese uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en GPU fp16, según la model card.
- GPU recomendadas: el modelo cabe en GPUs de consumo; la model card cita una RTX 3070 de 8 GB para unas 12 ms por petición en batch 1.
- CPU: funciona en fp32 con unos 30 ms por petición usando 4 hilos en un Ryzen 7 5800H.
- Cabe en tarjetas gráficas de consumo y en entornos de CPU; el repositorio ocupa 0,6 GB.
- Despliegue documentado: `transformers` y el wrapper `fennec.py`. El repositorio incluye las etiquetas `text-embeddings-inference` y `endpoints_compatible`.
- No se documentan despliegues en vLLM, llama.cpp, Ollama o TGI para este modelo.
- Throughput no disponible; la model card solo proporciona latencias de batch 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fennec-handoff-150m-v1` | 149,6 M | no disponible | clasificación de fin de turno | Apache-2.0 | HuggingFace |
| `fennec-interrupt-150m-v1` | no disponible | no disponible | clasificación de interrupción, modelo hermano | no disponible en la información | HuggingFace |
| `answerdotai/ModernBERT-base` | 149 M según la model card | no disponible | encoder base para fine-tuning | no disponible en la información | HuggingFace |

No se dispone de benchmarks ni de modelos públicos comparables de endpointing en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento. La alternativa directa citada por el autor es el modelo hermano `fennec-interrupt-150m-v1`, orientado a detectar interrupciones.

## Limitaciones y advertencias

- Solo funciona en inglés; no cubre otros idiomas.
- Es un modelo de texto: requiere un sistema de speech-to-text previo y hereda sus errores de transcripción.
- No interpreta tono de voz, energía ni prosodia; una pausa de reflexión después de una frase completa puede clasificarse como turno terminado.
- Un “wait.” aislado cuenta como turno terminado; si se quiere dar más tiempo al usuario, hay que gestionarlo en la lógica del agente.
- Riesgo de falsos positivos y falsos negativos en la clasificación; no es un modelo generativo, por lo que no alucina texto, pero sí puede decidir mal el fin de turno.
- No se documentan sesgos específicos; al entrenarse con datos no descritos y en inglés, puede heredar sesgos del corpus y del ASR utilizado.
- No hay benchmarks, métricas de exactitud ni validación independiente publicadas en la información disponible.
- La longitud de contexto no está documentada; no se puede garantizar un comportamiento concreto con transcripciones muy largas.
- Es una versión v1 descrita por el autor como trabajo de hobby; conviene probarla con llamadas propias antes de usarla en producción.
- La licencia Apache-2.0 permite uso comercial, pero se ofrece sin garantías; debe revisarse el aviso legal completo.
- No debe usarse como única señal de fin de turno en contextos críticos, como emergencias o atención sanitaria.

## Enlaces

- [HuggingFace: SalmanFaroz/fennec-handoff-150m-v1](https://huggingface.co/SalmanFaroz/fennec-handoff-150m-v1)
- [Repositorio GitHub fennec-voice](https://github.com/stsfaroz/fennec-voice)
- [Modelo hermano fennec-interrupt-150m-v1](https://huggingface.co/SalmanFaroz/fennec-interrupt-150m-v1)
- [Vídeo de demostración](https://huggingface.co/SalmanFaroz/fennec-handoff-150m-v1/resolve/main/assets/demo.mp4)
- [Modelo base answerdotai/ModernBERT-base](https://huggingface.co/answerdotai/ModernBERT-base)
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes; solo resultados genéricos de YouTube.
