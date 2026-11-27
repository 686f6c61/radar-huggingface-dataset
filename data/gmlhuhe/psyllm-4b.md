# GMLHUHE/PsyLLM-4B

## Resumen
PsyLLM-4B es un ajuste fino completo (full fine-tuning) del modelo Qwen3-4B, desarrollado por el grupo GMLHUHE, orientado a la generacion de dialogos de consejeria psicologica y salud mental. El modelo integra razonamiento diagnostico (siguiendo marcos como DSM/ICD) y razonamiento terapeutico (CBT, ACT, terapia psicodinamica), con trazas de razonamiento explicitas que buscan hacer la respuesta mas interpretable clinicamente.

El modelo se entrena sobre el dataset OpenR1-Psy, un conjunto de dialogos multi-turno de consejeria con trazas de razonamiento, y se ha implementado con el framework LLaMA-Factory. Con 4.022 millones de parametros, hereda la arquitectura y la ventana de contexto de Qwen3-4B, e incorpora el modo de pensamiento (thinking mode) de la familia Qwen3, que permite separar el razonamiento interno de la respuesta final.

Es relevante ahora porque aborda una de las aplicaciones mas delicadas de los LLM (salud mental) con un enfoque de razonamiento estructurado y datos especificos del dominio, y porque su tamano (4B) permite desplegarlo en hardware relativamente modesto para investigacion. No obstante, su licencia restringe el uso a fines de investigacion y educativos, y no debe emplearse como sustituto de atencion clinica profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | other (solo investigacion y uso educativo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-4B, un transformer decoder-only de la familia Qwen3, y se somete a un ajuste fino completo (tag "full" en LLaMA-Factory), no a un ajuste con adaptadores. La model card no detalla la composicion exacta del corpus de entrenamiento mas alla de indicar que se usa el dataset OpenR1-Psy, compuesto por dialogos multi-turno de consejeria con trazas de razonamiento explicito que cubren marcos diagnosticos (DSM/ICD) y enfoques terapeuticos (CBT, ACT, psicodinamico). No se especifica el numero de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO.

La innovacion principal es la incorporacion de razonamiento explicito en dos niveles (diagnostico y terapeutico) dentro del dialogo, apoyandose en el modo thinking de Qwen3. El codigo de ejemplo de la model card muestra el uso de `enable_thinking=True` y la separacion de la salida en contenido de pensamiento y respuesta final mediante el token especial 151668. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades
- Generacion de texto conversacional orientada a dialogos de consejeria psicologica y salud mental.
- Razonamiento diagnostico estructurado segun marcos DSM/ICD.
- Razonamiento terapeutico con enfoques CBT, ACT y psicodinamico.
- Modo de pensamiento (thinking mode) con trazas de razonamiento separadas de la respuesta final.
- Dialogo multi-turno con contexto conversacional.
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada (mas alla del razonamiento interno del modo thinking).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso
- Investigacion en dialogo terapeutico asistido por IA: el modelo permite estudiar como un LLM articula razonamiento diagnostico y terapeutico en conversaciones multi-turno, gracias a sus trazas de pensamiento explicitas.
- Formacion y simulacion para estudiantes de psicologia: se puede emplear como paciente o terapeuta simulado en practicas supervisadas, aprovechando el modo thinking para revisar el razonamiento subyacente.
- Analisis de marcos clinicos: comparar como el modelo aplica CBT, ACT o terapia psicodinamica ante un mismo caso, util para investigacion comparativa de enfoques.
- Generacion de material educativo: producir ejemplos de dialogos con razonamiento clinico explicito para cursos y talleres, siempre con revision profesional.
- Estudio de interpretabilidad: la separacion entre contenido de pensamiento y respuesta final facilita analizar la cadena de razonamiento del modelo en contextos sensibles.
- Evaluacion de sesgos y seguridad en salud mental: usar el modelo como objeto de estudio para medir alucinaciones, sesgos y riesgos en respuestas terapeuticas antes de cualquier despliegue.
- Prototipado de asistentes de apoyo emocional en entornos de investigacion controlados, con supervision humana y sin uso clinico real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16 GB o mas.
- Cuantizacion: la model card no documenta pesos cuantizados, pero al estar basado en Qwen3-4B es plausible aplicar cuantizaciones de la comunidad (GGUF, AWQ, GPTQ); no confirmado por el autor.
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 con margen.
- GPU de consumo: cabe en GPUs consumer con 16 GB o mas en fp16; con cuantizacion de 8 bits o 4 bits podria caber en GPUs de 8-12 GB, aunque no hay pesos cuantizados oficiales.
- Opciones de despliegue: transformers (soporte nativo, tal como muestra la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente vLLM o llama.cpp si se generan pesos compatibles; no confirmado para este modelo concreto.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| PsyLLM-4B | 4.022 M | no disponible | other (solo investigacion) | Consejeria psicologica con razonamiento diagnostico/terapeutico |
| Qwen3-4B (base) | 4.000 M aprox. | no disponible | Apache 2.0 (segun Qwen) | Proposito general |
| PsyLLM-8B (mismo autor) | no disponible | no disponible | other | Misma familia, mayor tamano |

La comparacion con alternativas especializadas en salud mental de otros autores no esta disponible en la informacion proporcionada. Frente a Qwen3-4B, PsyLLM-4B anade especializacion de dominio y trazas de razonamiento clinico, a costa de una licencia mas restrictiva y de un posible deterioro en capacidades generales tras el ajuste fino completo.

## Limitaciones y advertencias
- Licencia "other": uso restringido a investigacion y educacion; no se permite uso comercial segun la model card.
- No es un dispositivo medico ni sustituye la atencion clinica profesional; cualquier uso en salud mental requiere supervision humana cualificada.
- Riesgo de alucinacion en diagnosticos y recomendaciones terapeuticas, especialmente en casos complejos o fuera de la distribucion de entrenamiento.
- Sesgos potenciales heredados de Qwen3-4B y del dataset OpenR1-Psy; no se documenta una evaluacion de sesgos.
- Idiomas soportados no especificados; el entrenamiento parece centrado en ingles (ejemplo de la model card en ingles), por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no documentada en la ficha; conviene verificar la de Qwen3-4B antes de disenar aplicaciones con contexto largo.
- El ajuste fino completo puede degradar capacidades generales del modelo base (codigo, matematicas, instrucciones generales).
- Solo 68 descargas y 2 likes en el momento de la consulta: comunidad pequena, poca validacion externa y escaso soporte.
- No hay pesos cuantizados oficiales ni benchmarks publicados, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/GMLHUHE/PsyLLM-4B
- Dataset OpenR1-Psy: https://huggingface.co/datasets/GMLHUHE/OpenR1-Psy
- Paper (arXiv 2505.15715): https://arxiv.org/pdf/2505.15715v2
- Repositorio GitHub: https://github.com/Emo-gml/PsyLLM
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
