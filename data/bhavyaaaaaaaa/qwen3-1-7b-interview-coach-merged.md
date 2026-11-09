# Bhavyaaaaaaaa/qwen3-1.7b-interview-coach-merged

## Resumen

Qwen3-1.7B Interview Coach (merged) es un ajuste fino supervisado del modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario independiente Bhavyaaaaaaaa. El modelo incorpora un adaptador LoRA especializado en simular entrevistas tecnicas y fusiona sus pesos directamente en los del modelo base, de modo que puede cargarse con una llamada estandar a `AutoModelForCausalLM.from_pretrained` sin necesidad de la libreria `peft` en tiempo de inferencia. Resuelve un problema acotado: generar preguntas de entrevista tecnica contextualizadas por rol y sector, en lugar de las preguntas genericas de tipo STAR que produce el modelo base.

El modelo conserva la arquitectura transformer densa de Qwen3-1.7B, con 1.720.574.976 parametros totales y un tamano de repositorio de 3,5 GB en formato safetensors. El ajuste se realizo sobre el dataset Davichick/InterviewForge_GenDS, compuesto por 2.000 preguntas de entrevista tecnica basadas en escenarios, mediante LoRA con rango 16 y alpha 32, entrenado con mlx-lm en un Apple M5. La perdida de validacion descendio de 3,966 a 1,457 en 400 pasos, una reduccion del 63 por ciento.

Su relevancia es limitada y muy especifica: se trata de un experimento de bajo coste (entrenamiento en portatil, coste declarado de 0 dolares) que demuestra como un adaptador pequeno puede desplazar el estilo de respuesta de un modelo de 1,7B hacia un dominio concreto. No es un modelo de proposito general ni compite en benchmarks de razonamiento o codigo; su interes esta en el patron de personalizacion barata sobre modelos pequenos y en su uso como persona conversacional dentro de un Space de demostracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3, y aplica sobre el un ajuste fino con LoRA de rango 16, alpha 32 y dropout 0,05. El entrenamiento se ejecuto con mlx-lm sobre hardware Apple M5, lo que situa el coste computacional en el rango de un portatil. Solo el 0,37 por ciento de los parametros del modelo base fueron entrenables durante el ajuste, y posteriormente los pesos del adaptador se fusionaron en los pesos base para producir un checkpoint autonomo.

El dataset de entrenamiento es Davichick/InterviewForge_GenDS, con 2.000 preguntas de entrevista tecnica basadas en escenarios. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron fases de RLHF o DPO; el metodo descrito es ajuste supervisado con LoRA. La innovacion tecnica destacable no esta en la arquitectura, sino en el flujo de trabajo: adaptador pequeno, entrenamiento en hardware de consumo y fusion de pesos para simplificar el despliegue. El modelo soporta el flag `enable_thinking` en la plantilla de chat, heredado de Qwen3, aunque el ejemplo de uso lo desactiva.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos de entrevista tecnica.
- Generacion de preguntas de entrevista contextualizadas por rol (por ejemplo, Backend Developer, IoT Solutions Engineer) y por sector (FinTech, FoodTech).
- Construccion de escenarios tecnicos detallados con restricciones explicitas, como normativas (ISO 22000) o requisitos de latencia (deteccion de anomalias en 10 segundos).
- Mantenimiento de conversaciones multi-turno mediante plantilla de chat estandar de Qwen3.
- Soporte del modo thinking de Qwen3 a traves de `enable_thinking` en `apply_chat_template`.
- Capacidades de tool calling y function calling: no documentadas en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Vision, audio y otras modalidades: no disponibles.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Simulacion de entrevistas tecnicas por rol: el modelo genera preguntas especificas para un puesto concreto, como demuestra el ejemplo de IoT Solutions Engineer en FoodTech, en lugar de plantillas genericas. Adecuado para plataformas de preparacion de entrevistas que necesiten variabilidad por sector.
- Generacion de bancos de preguntas para reclutadores: a partir de un rol y un sector, el modelo produce escenarios con restricciones tecnicas verificables (normativas, latencias, volumenes), utiles para construir evaluaciones internas.
- Practica conversacional con retroalimentacion: integrado en un chatbot multi-turno, permite al candidato responder y recibir preguntas de seguimiento dentro del mismo escenario, aprovechando la plantilla de chat de Qwen3.
- Persona dentro de un Space de demostracion: el autor lo emplea como persona en Bhavyaaaaaaaa/project, lo que sirve como referencia de integracion en Gradio o Spaces con inferencia en CPU/GPU pequena.
- Prototipado rapido de asistentes de dominio: al ser un checkpoint fusionado de 1,7B y licencia Apache 2.0, sirve como plantilla para replicar el flujo LoRA + merge en otros dominios verticales con coste minimo.
- Educacion y formacion interna: equipos de ingenieria pueden desplegarlo en local para sesiones de practica de entrevistas sin enviar datos a servicios externos, dado el reducido requisito de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento es la evolucion de la perdida de validacion durante el ajuste:

| Metrica | Valor |
|---|---|
| Perdida de validacion inicial | 3,966 |
| Perdida de validacion final | 1,457 |
| Pasos de entrenamiento | 400 |
| Reduccion de perdida | 63 por ciento |
| Parametros entrenables | 0,37 por ciento del modelo base |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: cualquier GPU con 8 GB o mas, como RTX 3060 Ti, RTX 4060, RTX 4070; en datacenter, A100 o H100 son sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6-8 GB de VRAM en bfloat16 y en tarjetas con 4 GB si se cuantiza.
- Opciones de despliegue: transformers (metodo documentado por el autor), text-generation-inference segun los tags del repositorio, y endpoints compatibles. No se documentan instrucciones para llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B Interview Coach (merged) | 1,72B | no disponible | Entrevistas tecnicas (ingles) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72B | no disponible | Proposito general | Apache 2.0 | Hugging Face |
| Bhavyaaaaaaaa/qwen3-1.7b-interview-coach (adaptador LoRA) | Adaptador sobre 1,72B | no disponible | Entrevistas tecnicas (ingles) | Apache 2.0 | Hugging Face |

La comparacion relevante es contra el modelo base y contra el adaptador LoRA sin fusionar del mismo autor. Frente al base, este checkpoint mejora la especificidad de las preguntas generadas a costa de estrechar el dominio. Frente al adaptador, la version fusionada simplifica el despliegue al eliminar la dependencia de `peft`, pero impide intercambiar o apilar adaptadores. No se dispone de datos para comparar con otros modelos especializados en entrevistas.

## Limitaciones y advertencias

- Dominio muy estrecho: el ajuste se realizo sobre 2.000 preguntas de entrevista tecnica; fuera de ese dominio el modelo probablemente degrade hacia el comportamiento del base o genere respuestas incoherentes.
- Solo ingles: la model card declara unicamente `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: los escenarios generados pueden incluir normativas, cifras o tecnologias inventadas o mal citadas (el ejemplo de ISO 22000 es plausible, pero no hay garantia de exactitud tecnica en las restricciones que genera).
- Sesgo de estilo: el modelo tiende a producir preguntas largas y muy cargadas de restricciones, lo que puede no reflejar entrevistas reales y saturar al usuario.
- Sin benchmarks publicados: no hay evaluaciones objetivas de calidad, seguridad ni fidelidad; cualquier uso en produccion requiere evaluacion propia.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar tambien la licencia del modelo base Qwen3-1.7B.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin revision externa; el checkpoint debe tratarse como experimental.
- Sin versiones cuantizadas oficiales: desplegar en entornos con poca VRAM exige cuantizar manualmente, con el riesgo de degradar un ajuste fino ya de por si pequeno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bhavyaaaaaaaa/qwen3-1.7b-interview-coach-merged
- Adaptador LoRA sin fusionar: https://huggingface.co/Bhavyaaaaaaaa/qwen3-1.7b-interview-coach
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/Davichick/InterviewForge_GenDS
- Space de demostracion del autor: https://huggingface.co/spaces/Bhavyaaaaaaaa/project
- Perfil del autor: https://huggingface.co/Bhavyaaaaaaaa
