# Echoo113/Phi-3-mini-4k-instruct-immigration-STEER0.40625-ft4.43

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `microsoft/Phi-3-mini-4k-instruct`, desarrollado por el usuario Echoo113 mediante la librería TRL con entrenamiento supervisado (SFT). El nombre del repositorio sugiere que está especializado en el dominio de inmigración, con un parámetro de control STEER de 0.40625 y una versión de ajuste ft4.43. El modelo hereda la arquitectura del Phi-3-mini, un transformer de 3.800 millones de parámetros con ventana de contexto de 4.096 tokens, optimizado para razonamiento, matemáticas y generación de instrucciones.

La relevancia de este modelo reside en su especialización vertical: un Phi-3-mini ajustado para responder preguntas sobre inmigración puede desplegarse en entornos con recursos limitados, manteniendo un rendimiento razonable en tareas conversacionales. Sin embargo, al tratarse de un ajuste fino reciente con cero descargas y sin documentación adicional, su calidad y alcance real no pueden verificarse sin una evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3-mini, 32 capas, 32 cabezas de atencion) |
| Parametros totales | 3,8 mil millones (3,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Phi-3-mini-4k-instruct es un transformer decoder-only con atención causal, entrenado con datos sintéticos y sitios web filtrados, con un énfasis en razonamiento denso y calidad. El ajuste fino se realizó mediante SFT (supervised fine-tuning) con la librería TRL, sobre un dataset no especificado en la model card. Las versiones de las librerías indican un entrenamiento reciente (TRL 0.19.1, Transformers 4.57.6, PyTorch 2.11.0). No se proporcionan detalles sobre el dataset de inmigración, el número de pasos, ni si se aplicaron técnicas de alineación adicionales como DPO o RLHF.

## Capacidades

- Generación de texto instructivo y conversacional, heredada del modelo base Phi-3-mini.
- Razonamiento lógico y matemático básico, gracias al entrenamiento del base.
- Especialización temática en inmigración, aunque el alcance y la calidad de esta especialización no están documentados.
- Soporte de tool calling y function calling: no disponible.
- Capacidades multilingües: limitadas al inglés mayoritariamente, sin confirmación para otros idiomas.
- Modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Atención al cliente en despachos de abogados de inmigración: el modelo puede generar respuestas preliminares a consultas comunes sobre visados, residencia y asilo, aunque requiere supervisión humana.
- Asistente de documentación: ayuda a redactar borradores de cartas o formularios explicativos en lenguaje sencillo.
- Filtro de consultas en portales públicos: clasificación y respuesta a preguntas frecuentes de inmigración antes de derivar a un especialista.
- Evaluación interna de políticas: generación de resúmenes de textos legales o administrativos.
- Prácticas de formación: simulación de escenarios de entrevistas de asilo para estudiantes de derecho.
- Chatbots de ONG o servicios de ayuda al inmigrante: orientación inicial sobre trámites y derechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo ajustado. El modelo base Phi-3-mini-4k-instruct reporta puntuaciones conocidas en MMLU (69,2 %), HumanEval (60,4 %) y GSM-8K (82,5 %), pero estos datos no son extrapolables al ajuste fino sin una evaluación específica.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3,8B en FP16 requiere aproximadamente 8 GB de VRAM; en cuantizaciones como INT4 o INT8 puede reducirse a 4-6 GB.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090, o GPU de data center como A10, L4 o T4.
- En consumer GPU: sí, cabe en GPUs de 8 GB o más con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con accelerate, y TGI.
- Latencia y throughput: no disponible para este ajuste, pero el modelo base procesa alrededor de 20-30 tokens/s en una RTX 4090 con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|
| Phi-3-mini-4k-instruct | 3,8B | 4K | 69,2 % | 60,4 % | MIT |
| Llama-3.2-3B-instruct | 3,2B | 128K | 63,4 % | 61,0 % | Llama 3.2 |
| Gemma-2-2B-it | 2,6B | 8K | 56,0 % | 46,4 % | Gemma |

El ajuste fino Echoo113 no tiene datos de rendimiento propios, por lo que no es posible compararlo directamente. Las alternativas listadas son modelos generalistas de tamaño similar con licencias abiertas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base puede reflejar sesgos presentes en los datos de entrenamiento; el ajuste fino en inmigración no especifica medidas de mitigación.
- Riesgo de alucinación: alto en temas legales o administrativos si no se usa con verificación humana.
- Limitaciones de contexto: ventana de 4K tokens, insuficiente para documentos largos o conversaciones extensas.
- Restricciones de licencia: no disponible, lo que impide conocer las condiciones de uso comercial.
- Advertencias para producción: el modelo no ha sido evaluado, no tiene descargas y el autor no ha publicado documentación técnica; no se recomienda su uso en producción sin validación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Echoo113/Phi-3-mini-4k-instruct-immigration-STEER0.40625-ft4.43
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación del modelo base: https://github.com/ttlmtang123/Phi-3-mini-4k-instruct
- NVIDIA NIM de Phi-3-mini: https://build.nvidia.com/microsoft/phi-3-mini-4k
