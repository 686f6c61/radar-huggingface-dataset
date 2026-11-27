# GMLHUHE/PsyLLM-8B

## Resumen

PsyLLM-8B es un modelo de lenguaje de 8.190 millones de parametros especializado en dialogo de consejeria psicologica y salud mental, desarrollado por el grupo GMLHUHE. Se construye mediante un ajuste fino completo (full fine-tuning) sobre Qwen/Qwen3-8B, por lo que hereda la arquitectura transformer densa del modelo base y su ventana de contexto nativa. Su proposito es generar respuestas terapeuticas que combinen razonamiento diagnostico (alineado con marcos DSM/ICD) y razonamiento terapeutico (CBT, ACT, terapia psicodinamica), con trazas de razonamiento explicitas que hacen la respuesta interpretable.

El modelo se entrena sobre el dataset OpenR1-Psy, compuesto por dialogos multi-turno de consejeria con trazas de razonamiento clinico. El entrenamiento se implemento con LLaMA-Factory y el resultado se publica como pesos completos en formato safetensors bajo licencia "other", restringida a uso de investigacion y educativo. Es relevante ahora porque aborda una de las aplicaciones mas delicadas de los LLM (salud mental) incorporando razonamiento explicito en lugar de respuestas puramente empaticas, y porque el paper asociado se ha publicado en IEEE Transactions on Affective Computing.

Al estar afinado sobre Qwen3-8B, conserva el modo "thinking" del modelo base, activable mediante `enable_thinking=True` en la plantilla de chat, lo que permite separar la traza de razonamiento de la respuesta final. No obstante, la model card no documenta explicitamente la longitud de contexto final, los idiomas soportados ni los datos exactos de entrenamiento mas alla del dataset citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (uso exclusivo de investigacion y educativo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PsyLLM-8B es un ajuste fino completo de Qwen3-8B, un transformer denso de 8.190 millones de parametros. No se trata de una arquitectura nueva ni de un modelo MoE: el autor parte de los pesos de Qwen3-8B y los reentrena con LLaMA-Factory (tag `full` y `generated_from_trainer`). Esto implica que conserva el tokenizador, la plantilla de chat y el mecanismo de "thinking mode" del modelo base, incluyendo el token especial 151668 que delimita la traza de razonamiento en la salida.

El entrenamiento se realiza sobre el dataset OpenR1-Psy, formado por dialogos multi-turno de consejeria psicologica con trazas de razonamiento que integran diagnostico (DSM/ICD) y enfoque terapeutico (CBT, ACT, psicodinamico). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO; solo se indica el ajuste supervisado sobre dicho dataset mediante LLaMA-Factory. La innovacion principal es el formato de datos: cada ejemplo incluye razonamiento clinico explicito antes de la respuesta, lo que entrena al modelo a producir trazas interpretables en lugar de respuestas opacas.

## Capacidades

- Generacion de texto conversacional orientada a dialogo terapeutico multi-turno.
- Razonamiento diagnostico explicito alineado con marcos DSM/ICD.
- Razonamiento terapeutico con enfoques CBT, ACT y psicodinamico.
- Modo "thinking" activable mediante `enable_thinking=True`, que separa la traza de razonamiento de la respuesta final.
- Generacion de respuestas empaticas con justificacion clinica interpretable.
- Soporte de plantilla de chat compatible con el ecosistema transformers y `apply_chat_template`.
- Tool calling / function calling: no documentado en la model card.
- Capacidades de agente y multi-step reasoning: no documentadas mas alla del razonamiento interno del modo thinking.
- Capacidades multilingues: no documentadas.
- Vision y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Investigacion en IA para salud mental: el modelo sirve como base para estudiar la calidad y seguridad de respuestas terapeuticas generadas por LLM, gracias a sus trazas de razonamiento explicitas que permiten auditar el proceso clinico seguido.
- Formacion de profesionales: uso en entornos educativos para simular sesiones de consejeria y revisar el razonamiento diagnostico y terapeutico que el modelo produce ante casos sinteticos.
- Analisis de enfoques terapeuticos: comparar como el modelo aplica CBT, ACT o terapia psicodinamica ante un mismo caso, aprovechando que fue entrenado con ejemplos de los tres marcos.
- Generacion de dialogos sinteticos anotados: producir conversaciones multi-turno con trazas de razonamiento para ampliar datasets de investigacion en salud mental, siempre bajo supervision etica.
- Evaluacion de seguridad en LLM clinicos: emplear el modelo como sujeto de pruebas para medir alucinaciones, sesgos y adherencia a guias DSM/ICD en un dominio de alto riesgo.
- Prototipado de asistentes de apoyo emocional en entornos controlados de investigacion, con revision humana obligatoria y sin uso clinico directo.
- Estudio de interpretabilidad: analizar la traza de razonamiento (thinking content) para entender como el modelo llega a una recomendacion terapeutica antes de emitir la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB de pesos; en 4 bits, en torno a 5-6 GB, aunque el autor no publica versiones cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con contexto moderado, y en GPUs de 16 GB si se cuantiza a 8 bits; en 12 GB requeriria cuantizacion a 4 bits no oficial.
- Opciones de despliegue: transformers (soporte oficial documentado), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se publican GGUF oficiales).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PsyLLM-8B | 8,19 B | no disponible | Consejeria psicologica con razonamiento diagnostico y terapeutico | other (solo investigacion/educativo) | Hugging Face |
| Qwen3-8B (base) | 8,19 B | no disponible en la ficha | Proposito general, modo thinking | Apache 2.0 (segun modelo base) | Hugging Face |
| Modelos clinicos genericos de 7-8 B | variable | variable | Salud general o dialogo empatico sin razonamiento clinico explicito | variable | variable |

La comparacion directa con otros modelos especializados en salud mental no esta disponible en la informacion proporcionada. Frente a su modelo base Qwen3-8B, PsyLLM-8B anade especializacion clinica y trazas de razonamiento terapeutico, pero restringe la licencia a investigacion y pierde la licencia permisiva del original.

## Limitaciones y advertencias

- Licencia "other" restringida explicitamente a uso de investigacion y educativo; no apta para uso comercial ni despliegue clinico en produccion sin autorizacion adicional.
- Riesgo de alucinacion clinica: el modelo puede generar diagnosticos o recomendaciones terapeuticas incorrectas; no debe usarse como sustituto de un profesional sanitario.
- Sesgos desconocidos: la model card no documenta evaluaciones de sesgo por genero, cultura, edad o condicion socioeconomica, un aspecto critico en salud mental.
- Idiomas soportados no documentados; el dataset OpenR1-Psy y los ejemplos de la model card estan en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Longitud de contexto final no documentada; conviene verificar la configuracion del tokenizador del modelo base antes de asumir ventanas largas.
- No se publican resultados de benchmarks ni evaluaciones clinicas formales, lo que impide cuantificar su calidad frente a alternativas.
- El autor advierte de la necesidad de cumplir estandares eticos y legales en investigacion de IA para salud mental; cualquier uso debe pasar por revision etica.
- Al ser un ajuste fino completo sobre Qwen3-8B, hereda las limitaciones del modelo base (conocimiento con fecha de corte, posibles errores factuales, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GMLHUHE/PsyLLM-8B
- Dataset OpenR1-Psy: https://huggingface.co/datasets/GMLHUHE/OpenR1-Psy
- Paper (arXiv:2505.15715): https://arxiv.org/pdf/2505.15715v2
- Repositorio GitHub: https://github.com/Emo-gml/PsyLLM
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
