# GYJeong/BioReason-Qwen2.5-1.5B-GRPO

## Resumen

BioReason-Qwen2.5-1.5B-GRPO es un ajuste fino por aprendizaje por refuerzo del modelo Qwen2.5-1.5B-Instruct, desarrollado por el autor GYJeong en el marco de un programa de investigacion de la Korea Bio Data Station (K-BDS). El modelo esta especializado en responder preguntas biomedicas a partir de evidencia textual de PubMed, generando un razonamiento paso a paso dentro de etiquetas `<think>` y una respuesta concisa dentro de `<answer>`. La tecnica de entrenamiento empleada es GRPO (Group Relative Policy Optimization) con recompensas basadas en reglas.

El modelo parte de la arquitectura transformer densa de Qwen2.5, con 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones). El contexto heredado de la familia Qwen2.5 es de 32.768 tokens, aunque la model card no lo explicita. Su relevancia radica en demostrar como el RL con recompensas de formato y de contenido puede mejorar sustancialmente el cumplimiento de instrucciones estructuradas en modelos pequenos, un aspecto critico para pipelines de razonamiento biomedico automatizado.

Se trata de un modelo de investigacion, no validado clinicamente, entrenado sobre un conjunto de datos sintetico generado por LLM y no revisado por expertos. Su interes practico esta en el estudio de tecnicas de RL aplicadas a dominios cientificos y en la generacion de razonamiento trazable sobre literatura biomedica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) con atencion causal, ajustado mediante GRPO |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct: 32.768 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors y state_dict .pt; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y model.pt (PyTorch state_dict) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-1.5B-Instruct, un transformer denso decoder-only de la familia Qwen2.5. Sobre esa base se aplico GRPO (implementado con TRL), un algoritmo de optimizacion de politica que genera multiples respuestas por pregunta (8 en este caso) y las compara mediante recompensas relativas dentro del grupo, sin necesidad de un modelo critico separado. La tasa de aprendizaje fue de 1e-6, con coeficiente KL igual a 0 y una sola epoca de entrenamiento (135 pasos).

Los datos de entrenamiento consisten en 635 preguntas-respuesta generadas a partir de rutas del grafo de conocimiento de letalidad sintetica SynLethDB 2.0 y de literatura de PubMed, filtradas por una puntuacion de evidencia de 3 o superior. El conjunto se divide en 540 preguntas de entrenamiento y 95 de evaluacion. Las recompensas son puramente basadas en reglas: F1 de palabras del termino respuesta (peso 1,0), cumplimiento del formato `<think>...</think><answer>...</answer>` (peso 0,5) y presencia de la entidad correcta del grafo de conocimiento (peso 0,5). El entrenamiento se ejecuto en 4 GPU NVIDIA A100 de 80 GB.

## Capacidades

- Generacion de texto y respuesta a preguntas biomedicas basadas en evidencia de PubMed.
- Razonamiento estructurado paso a paso dentro de etiquetas `<think>` antes de emitir la respuesta final.
- Cumplimiento de formato de salida estricto: razonamiento en `<think>` y respuesta de una frase en `<answer>` (tasa de cumplimiento del 91,6 % tras el entrenamiento).
- Extraccion e inclusion de entidades biomedicas clave procedentes de un grafo de conocimiento de letalidad sintetica.
- Conversacion multi-turno mediante plantilla de chat (`chat_template.jinja`).
- Compatible con text-generation-inference y endpoints compatibles.
- No se documentan capacidades de tool calling, function calling, vision, audio ni agentes multi-paso.

## Casos de uso

- Revision asistida de literatura biomedica: dado un resumen de PubMed, el modelo extrae las entidades relevantes y emite una respuesta trazable con su cadena de razonamiento, util para triaje inicial de articulos en un pipeline de curation.
- Investigacion sobre letalidad sintetica: el modelo puede responder preguntas sobre pares de genes con interaccion de letalidad sintetica a partir de rutas de SynLethDB 2.0, apoyando la priorizacion de hipotesis en estudios de cancer.
- Generacion de conjuntos de datos de razonamiento: sirve como generador de trazas `<think>` para destilar razonamiento biomedico en modelos menores o para aumentar datos de entrenamiento.
- Evaluacion de tecnicas de RL: su par antes/despues (modelo base frente a checkpoint GRPO) lo convierte en una referencia controlada para estudiar el efecto de recompensas de formato en modelos de 1,5B.
- Demostraciones educativas: el Space asociado compara respuestas antes y despues del entrenamiento, util para explicar como el RL moldea el comportamiento de un LLM.
- Prototipado de asistentes de QA biomedico en entornos de investigacion donde se requiere bajo coste computacional (cabe en una sola GPU consumer) y trazabilidad del razonamiento.
- Filtrado de evidencia en pipelines de mineria de literatura: el modelo puede descartar resumenes irrelevantes antes de pasarlos a un modelo mayor, reduciendo coste de inferencia.

## Benchmarks y rendimiento

Evaluacion sobre 95 preguntas con decodificacion greedy, comparando el modelo base (antes) y el ajustado (despues):

| Metrica | Antes | Despues |
|---|---|---|
| F1 de respuesta (solo dentro de `<answer>`) | 0,324 | 0,505 |
| F1 de contenido (independiente de etiquetas) | 0,487 | 0,527 |
| Tasa de cumplimiento de formato | 0,179 | 0,916 |
| Tasa de inclusion de entidad clave | 0,279 | 0,395 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 4-6 GB en contexto corto).
- En cuantizacion de 8 bits: aproximadamente 1,6 GB de pesos; en 4 bits: aproximadamente 0,8 GB.
- GPU recomendadas para entrenamiento o inferencia de alta concurrencia: NVIDIA A100 80 GB (usadas en el entrenamiento original, 4 unidades), H100.
- Cabe en GPU consumer: si, en tarjetas con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.) en cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (`from_pretrained`), text-generation-inference (soporte declarado), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioReason-Qwen2.5-1.5B-GRPO | 1,54 B | No disponible (base Qwen2.5: 32.768) | QA biomedica con razonamiento GRPO | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Instrucciones generales | Apache 2.0 | Hugging Face |
| BioMistral-7B | 7 B | 8.192 (aprox.) | QA biomedica (continuacion de pretraining) | Apache 2.0 | Hugging Face |
| Meditron-7B | 7 B | 4.096 (aprox.) | Razonamiento clinico | Llama 2 (uso restringido) | Hugging Face |

La comparacion con BioMistral y Meditron es orientativa por diferencia de tamano (1,5B frente a 7B); no se dispone de resultados de benchmarks comunes en la informacion proporcionada para establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Los datos de entrenamiento y evaluacion fueron generados por LLM y no han pasado revision experta; pueden contener errores factuales o sesgos.
- De las 95 preguntas de evaluacion, 33 comparten el mismo contexto de PubMed que preguntas de entrenamiento, lo que puede inflar las metricas por fuga de datos.
- Gran parte de la mejora en F1 de respuesta (0,32 a 0,51) se debe al cumplimiento del formato de salida, no a una mejora sustancial del contenido (F1 de contenido: 0,49 a 0,53).
- Modelo de investigacion: no debe usarse para decisiones clinicas directas.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- No se documentan capacidades de tool calling ni de agente, lo que limita su integracion en flujos automatizados complejos.
- Riesgo de alucinacion en dominios biomedicos fuera de la distribucion de entrenamiento (SynLethDB 2.0 y PubMed).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero la falta de validacion clinica desaconseja cualquier aplicacion en produccion sanitaria sin supervision experta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GYJeong/BioReason-Qwen2.5-1.5B-GRPO
- Demo (comparacion antes/despues): https://huggingface.co/spaces/GYJeong/BioReason-RL-demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- SynLethDB 2.0 (grafo de conocimiento de letalidad sintetica): no disponible en la informacion proporcionada
- Paper o publicacion asociada: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
