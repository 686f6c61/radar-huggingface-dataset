# IINOVAII/Llama-3.2-3B-Tameez-GRPO

## Resumen

Llama-3.2-3B-Tameez-GRPO es un ajuste fino del modelo Llama-3.2-3B-Instruct de Meta, desarrollado por IINOVAII en el contexto del hackathon Lexsi. El objetivo del proyecto, denominado Tameez (तमीज़, "modales" en hindi), es dotar a modelos conversacionales pequenos de un comportamiento seguro y educado en hindi (devanagari), hinglish (hindi en escritura latina) e ingles. El modelo parte de un SFT previo en hindi y anade una etapa de aprendizaje por refuerzo con GRPO sobre un entorno de seguridad disenado especificamente para este fin.

La motivacion del trabajo es concreta: la mayoria del ajuste de seguridad se realiza en ingles y rara vez se mide en hindi escrito en alfabeto latino. Los autores documentan que los modelos base eran entre dos y siete veces mas propensos a responder de forma insegura a una misma peticion danina escrita en hinglish que en hindi, y que un SFT convencional en hindi reducia la seguridad. Tameez aborda ese problema con una etapa de RL de seis recompensas que penaliza respuestas abusivas y rechazos excesivos, manteniendo las capacidades en hindi.

El modelo tiene 3.212.749.824 parametros, arquitectura Llama 3.2 de 28 capas y una ventana de contexto declarada de 128K tokens. Se distribuye como pesos completos en bf16 fusionados (sin necesidad de PEFT), con licencia Llama 3.2 Community License, y esta pensado para despliegues ligeros en una sola GPU de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama 3.2 (28 capas) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (segun model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | hindi (devanagari), hinglish (hindi en escritura latina), ingles |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (bf16, pesos completos fusionados, sin PEFT) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2, con 3.200 millones de parametros y 28 capas. El entrenamiento sigue un pipeline de dos etapas sobre Llama-3.2-3B-Instruct: una primera etapa de SFT con LoRA sobre 5.000 filas de instrucciones ordinarias en hindi y hinglish, sin datos de seguridad, que constituye la linea base realista de "anadir hindi"; y una segunda etapa de GRPO (Group Relative Policy Optimization) sobre esa linea base, en un entorno de seguridad con 4.652 prompts etiquetados y seis recompensas ponderadas. En cada prompt se generan cuatro respuestas, se puntuan con las recompensas y la ventaja relativa de grupo de Dr. GRPO empuja el adaptador LoRA hacia las mejores respuestas.

Los datos de RL se construyeron a partir de ocho conjuntos publicos, limpiados y reescritos a hinglish natural con Aya Expanse 8B, etiquetados como daninos con Llama-Guard-3-1B y divididos en cuatro conjuntos disjuntos: datos de SFT, pool de prompts de RL, tests de seguridad reservados y tests de habilidad reservados. La evaluacion se realizo con jueces que nunca participaron en el entrenamiento (Llama-Guard-3-8B y un clasificador de discurso abusivo MuRIL) sobre 2.014 prompts de seguridad, 200 de utilidad en hindi y 14.831 preguntas de conocimiento hindi del benchmark MILU. El checkpoint finalmente publicado es el paso 100 de 300, fusionado en pesos completos bf16. El entrenamiento completo se ejecuto en una unica NVIDIA L4 de 24 GB en Google Colab: 32 minutos de SFT y 137 minutos de GRPO, con AlignTune 0.1.30, TRL 1.7.1, PEFT 0.21.2 y Transformers 5.22.

## Capacidades

- Generacion de texto conversacional multi-turno en hindi, hinglish e ingles.
- Rechazo educado de peticiones daninas en el idioma y alfabeto del usuario, sin recurrir a insultos.
- Mantenimiento de la utilidad ante preguntas benignas que contienen palabras de apariencia amenazante (por ejemplo, "kill a Linux process" o "a killer presentation").
- Tolerancia a usuarios que insultan: responde a la pregunta real sin devolver el insulto.
- Conocimiento general en hindi, medido con el benchmark MILU.
- Capacidades heredadas de Llama-3.2-3B-Instruct, incluida la generacion de codigo y el razonamiento basico, aunque no se documentan explicitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es solo de texto.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Moderacion y respuesta segura en asistentes de atencion al cliente para el mercado indio: el modelo gestiona conversaciones en devanagari, hinglish y ingles, y rechaza peticiones abusivas o daninas sin romper el tono, lo que reduce el riesgo reputacional en canales de chat publicos.
- Chatbot de soporte tecnico en hinglish: usuarios que escriben consultas como "linux mein process kill kaise karein?" obtienen respuesta util sin que el filtro de seguridad interprete "kill" como amenaza, gracias al entrenamiento especifico contra falsos positivos.
- Despliegue en entornos con una sola GPU de 24 GB: al ser un modelo de 3.200 millones de parametros en bf16, cabe en tarjetas como la L4 o la RTX 4090, lo que permite servir el modelo en infraestructura modesta o en el borde.
- Filtro previo o posterior en pipelines de generacion: puede actuar como capa de reescritura o rechazo educado sobre las respuestas de un modelo mayor, normalizando el tono en hindi e hinglish antes de mostrarlo al usuario.
- Investigacion en alineacion multilingue: sirve como referencia reproducible de un pipeline SFT + GRPO con seis recompensas y evaluacion con jueces independientes, util para estudiar el efecto del SFT en la seguridad y el sobre-rechazo.
- Prototipado rapido de asistentes para comunidades hispanohablantes de la India o para productos dirigidos a usuarios que alternan alfabetos: la ventana de 128K tokens permite incluir historial largo o documentos de contexto en la conversacion.
- Educacion y divulgacion: el modelo puede integrarse en demos interactivas (el Space oficial permite comparar respuestas antes y despues del ajuste) para mostrar el impacto de la alineacion en seguridad.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint final (paso 100 de 300), comparados con las otras dos variantes Tameez del mismo proyecto. No se dispone de comparaciones con modelos externos en la informacion proporcionada.

| Metrica | Llama-3.2-3B-Tameez-GRPO | Tiny-Aya-Global-Tameez-GRPO | Tiny-Aya-Fire-Tameez-GRPO |
|---|---|---|---|
| Respuestas inseguras, 1.498 prompts daninos (↓) | 3,7% | 3,9% | 4,3% |
| Inseguras, red-teaming en hindi (↓) | 2,6% | 1,5% | 1,8% |
| Inseguras, red-teaming en hinglish (↓) | 15,8% | 29,5% | 31,7% |
| Rechazo explicito y educado de prompts daninos (↑) | 58,5% | 73,6% | 73,1% |
| Rechazo erroneo de prompts benignos (↓) | 7,0% | 3,9% | 3,5% |
| Rechazo erroneo de usuarios enfadados con pregunta real (↓) | 15,5% | 9,0% | 8,0% |
| Respuestas abusivas segun MuRIL (↓) | 7,5% | 4,3% | 3,1% |
| Respuestas con palabras malsonantes (↓) | 0,7% | 0,6% | 0,8% |
| Conocimiento hindi MILU (↑) | 39,5% | 43,2% | 45,0% |
| Tasa de victoria de utilidad frente a su propio modelo SFT (↑) | 42,1% | 61,5% | 62,9% |

Datos adicionales del proceso: el SFT en hindi redujo la seguridad de los tres modelos base (Llama-3.2-3B pasó de 10,0% a 15,6% de respuestas inseguras), y el checkpoint publicado de este modelo no cumplio las restricciones de seleccion previstas (se eligio como fallback por la menor tasa de respuestas inseguras y malsonantes tras fallar todos los checkpoints el limite de sobre-rechazo). La tasa de victoria de utilidad frente a su propio SFT es inferior al 50%, lo que indica una perdida de calidad conversacional respecto a la etapa anterior.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, mas memoria para el contexto y el estado de atencion; en la practica se recomienda al menos 12-16 GB para contextos moderados.
- Cuantizacion: la model card no publica versiones GGUF ni cuantizadas; la conversion a 8 bits o 4 bits reduciria los requisitos a unos 3,5-4 GB y 2-2,5 GB respectivamente, pero dichas variantes no estan disponibles oficialmente.
- GPU recomendadas: NVIDIA L4 (24 GB), RTX 4090 (24 GB), A10G (24 GB), A100 (40/80 GB) para mayor throughput y contexto largo; cabe en GPUs de consumo con 16 GB o mas en bf16 y en GPUs de 8-12 GB si se cuantiza.
- Despliegue: compatible con transformers, text-generation-inference (etiqueta endpoints_compatible) y, previsiblemente, vLLM y llama.cpp tras conversion, aunque no se documenta soporte explicito de estas dos ultimas.
- Latencia y throughput: no disponibles. El entrenamiento se realizo en una unica L4, lo que sugiere que la inferencia en esa GPU es viable para cargas moderadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Tameez-GRPO | 3,2B | 128K | Seguridad y educacion en hindi/hinglish/ingles via SFT + GRPO | Llama 3.2 Community License | Hugging Face, pesos safetensors |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128K | Chat generalista multilingue | Llama 3.2 Community License | Hugging Face |
| Tiny-Aya-Global-Tameez-GRPO | no disponible | no disponible | Misma pipeline Tameez sobre base Cohere Labs | no disponible | Hugging Face |
| Tiny-Aya-Fire-Tameez-GRPO | no disponible | no disponible | Misma pipeline Tameez, variante South Asia | no disponible | Hugging Face |

Frente a Llama-3.2-3B-Instruct, el modelo Tameez reduce las respuestas inseguras (3,7% frente al 10,0% del base segun los datos del proyecto) a costa de un mayor sobre-rechazo y de una perdida de utilidad conversacional (tasa de victoria del 42,1% frente a su propio SFT). Frente a las variantes Tiny Aya, el modelo Llama destaca en hinglish (15,8% de respuestas inseguras frente a 29,5% y 31,7%) pero es peor en rechazo educado, sobre-rechazo y conocimiento hindi (MILU 39,5% frente a 43,2% y 45,0%).

## Limitaciones y advertencias

- El checkpoint publicado es el paso 100 de 300 y se eligio como fallback: no cumplio las restricciones de seleccion del proyecto (limite de sobre-rechazo), por lo que no es el mejor checkpoint posible segun los propios criterios de los autores.
- Tasa de sobre-rechazo elevada: rechaza erroneamente el 7,0% de prompts benignos y el 15,5% de preguntas reales de usuarios enfadados, muy por encima de las variantes Tiny Aya.
- Perdida de utilidad: la tasa de victoria frente a su propio modelo SFT es del 42,1%, es decir, en la mayoria de comparaciones el modelo Tameez responde peor que la etapa anterior en tareas de utilidad general.
- Seguridad en hinglish aun imperfecta: el 15,8% de los prompts daninos en hinglish obtienen respuesta insegura, el valor mas alto de las tres metricas de seguridad del modelo.
- Conocimiento en hindi limitado: 39,5% en MILU, por debajo de las variantes Tiny Aya y probablemente insuficiente para tareas que exijan conocimiento enciclopedico o cultural preciso.
- Riesgo de alucinacion: inherente a un modelo de 3.200 millones de parametros; no se han publicado evaluaciones de veracidad.
- Sesgos: no se documentan analisis de sesgo mas alla de la seguridad frente a contenido abusivo; el modelo hereda los sesgos de Llama-3.2-3B-Instruct y de los datos de SFT y RL.
- Idiomas: solo se declaran hindi, hinglish e ingles; el rendimiento en castellano no esta evaluado y no deberia asumirse.
- Licencia: Llama 3.2 Community License, con las restricciones habituales de Meta (uso comercial permitido con condiciones, obligaciones de atribucion y clausulas de uso aceptable); revisar los terminos antes de un despliegue en produccion.
- Tool calling, agentes y contexto largo: la ventana de 128K se declara en la model card, pero no se han publicado evaluaciones de recuperacion en contextos largos ni de uso como agente.
- Modelo de investigacion: desarrollado en un hackathon, sin garantias de soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO
- Modelo base SFT: https://huggingface.co/IINOVAII/Llama-3.2-3B-Hindi-SFT
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Variante Tiny Aya Global: https://huggingface.co/IINOVAII/Tiny-Aya-Global-Tameez-GRPO
- Variante Tiny Aya Fire: https://huggingface.co/IINOVAII/Tiny-Aya-Fire-Tameez-GRPO
- Demo interactiva (Space): https://huggingface.co/spaces/IINOVAII/tameez
- Dataset de seguridad: https://huggingface.co/datasets/IINOVAII/tameez-hindi-safety-data
- Salidas de evaluacion: https://huggingface.co/datasets/IINOVAII/tameez-eval-outputs
- Registros de entrenamiento: https://huggingface.co/datasets/IINOVAII/tameez-training-logs
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
