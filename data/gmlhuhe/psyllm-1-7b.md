# GMLHUHE/PsyLLM-1.7B

## Resumen
PsyLLM-1.7B es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen3-1.7B, desarrollado por el grupo GMLHUHE (Emo-gml), orientado a la generacion de dialogos de consejeria psicologica y salud mental. El modelo integra razonamiento diagnostico, alineado con marcos como DSM/ICD, y razonamiento terapeutico, incorporando enfoques como CBT (terapia cognitivo-conductual), ACT (terapia de aceptacion y compromiso) y terapia psicodinamica. Se entrena sobre el dataset OpenR1-Psy, compuesto por dialogos multi-turno de consejeria con trazas de razonamiento explicitas.

La propuesta central es un modelo que no solo responde con empatia, sino que hace explicito su razonamiento clinico antes de contestar, lo que facilita la interpretabilidad y la supervision por parte de profesionales. Con 1.720.574.976 parametros, es un modelo pequeno que puede desplegarse en hardware modesto, lo que lo hace atractivo para prototipos de investigacion y entornos con recursos limitados.

El modelo se presenta en el contexto de la publicacion "Beyond empathy: Integrating diagnostic and therapeutic reasoning with large language models for mental health counseling" (IEEE Transactions on Affective Computing, 2026), y forma parte de una familia que incluye una variante PsyLLM-8B. Su licencia restringe el uso a fines de investigacion y educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas en la informacion) |
| Idiomas soportados | no disponible (los ejemplos de la model card estan en ingles) |
| Licencia | other (uso exclusivo para investigacion y educacion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-1.7B, un transformer decoder-only con atencion causal y soporte de modo "thinking" (razonamiento explicito antes de la respuesta), tal como se observa en el codigo de ejemplo de la model card, que invoca `enable_thinking=True` y separa el contenido de razonamiento del contenido final mediante el token 151668. El ajuste se realizo con LLaMA-Factory en modalidad full fine-tuning, es decir, actualizando todos los parametros del modelo base, no mediante LoRA.

El entrenamiento utiliza el dataset OpenR1-Psy, que contiene dialogos multi-turno de consejeria psicologica con trazas de razonamiento clinico explicitas. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. La innovacion destacable es la incorporacion de razonamiento diagnostico y terapeutico estructurado dentro del propio proceso generativo, siguiendo marcos clinicos reconocidos.

## Capacidades
- Generacion de texto conversacional multi-turno orientada a dialogos de consejeria psicologica.
- Razonamiento explicito en modo "thinking": el modelo genera una traza de razonamiento clinico antes de la respuesta final, separada por el token 151668.
- Razonamiento diagnostico alineado con marcos DSM/ICD.
- Razonamiento terapeutico con enfoques CBT, ACT y psicodinamico.
- Generacion de respuestas con tono empatico y orientado a la interpretabilidad clinica.
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- Tool calling / function calling: no disponible en la informacion.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso
- Investigacion en IA para salud mental: el modelo sirve como base para estudiar como los LLM estructuran razonamiento diagnostico y terapeutico, gracias a sus trazas de razonamiento explicitas y su alineacion con DSM/ICD.
- Prototipado de asistentes de consejeria psicologica: puede gestionar conversaciones multi-turno con contexto conversacional y generar respuestas empaticas, adecuado para entornos de laboratorio con supervision profesional.
- Formacion de terapeutas: el modo thinking permite mostrar a estudiantes como un sistema razona sobre un caso antes de responder, util como material didactico en simulaciones de sesion.
- Generacion de dialogos sinteticos para aumento de datos: el modelo puede producir conversaciones de consejeria con trazas de razonamiento que sirvan para ampliar datasets de investigacion en salud mental.
- Evaluacion de enfoques terapeuticos: al incorporar CBT, ACT y terapia psicodinamica, permite comparar estilos de respuesta en estudios controlados.
- Despliegue en hardware modesto para experimentacion: con 1.7B parametros y pesos safetensors, es viable en una unica GPU de consumo para pruebas de investigacion, aunque la cuantizacion no esta publicada.
- Analisis de interpretabilidad: la separacion entre razonamiento y respuesta final facilita estudiar la coherencia entre el proceso clinico y la salida.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con pesos en fp16, aproximadamente 3,5 GB solo para los pesos (coincide con el tamano del repo de 3,5 GB); en fp32 rondaria los 7 GB. El pico real depende de la longitud de contexto y del cache KV, no disponible.
- GPU recomendadas: una RTX 4090 (24 GB) o superior permite inferencia en fp16 con margen; A100/H100 son adecuadas para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 para contextos moderados; en GPUs de 6 GB requeriria cuantizacion, que no esta publicada en la informacion.
- Opciones de despliegue: transformers (soporte confirmado en la model card); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion, aunque los tags incluyen text-generation-inference y endpoints_compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| PsyLLM-1.7B | 1,72B | no disponible | Consejeria psicologica con razonamiento diagnostico/terapeutico | other (solo investigacion/educacion) | Hugging Face |
| PsyLLM-8B | no disponible en la informacion | no disponible | Misma familia, mayor tamano | other (solo investigacion/educacion) | Hugging Face |
| Qwen3-1.7B (base) | 1,7B aprox. | no disponible | Modelo generalista con modo thinking | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Licencia restringida: uso exclusivo para investigacion y educacion; no se autoriza uso comercial segun la model card.
- Riesgo de alucinacion clinica: como todo LLM, puede generar diagnosticos o recomendaciones terapeuticas incorrectas; no debe usarse como sustituto de profesionales sanitarios.
- Sesgos: no se documentan sesgos conocidos en la informacion; el dataset de entrenamiento puede introducir sesgos culturales o de estilo terapeutico no evaluados.
- Idiomas: no se especifican los idiomas soportados; los ejemplos de la model card estan en ingles, por lo que el rendimiento en castellano no esta verificado.
- Contexto: la longitud de contexto no esta confirmada en la informacion; no debe asumirse la del modelo base sin verificacion.
- Ausencia de benchmarks: no hay evaluaciones publicadas en la informacion, lo que impide comparar su calidad clinica o su rendimiento frente a alternativas.
- Requisitos eticos y legales: la model card exige cumplir estandares eticos y legales en investigacion de IA para salud mental; cualquier despliegue debe incluir supervision humana.
- Datos de entrenamiento incompletos: se desconoce el volumen de tokens, la composicion exacta del dataset y si hubo RLHF/DPO.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/GMLHUHE/PsyLLM-1.7B
- Dataset OpenR1-Psy: https://huggingface.co/datasets/GMLHUHE/OpenR1-Psy
- Paper (arXiv:2505.15715): https://arxiv.org/pdf/2505.15715v2
- Repositorio GitHub: https://github.com/Emo-gml/PsyLLM
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
