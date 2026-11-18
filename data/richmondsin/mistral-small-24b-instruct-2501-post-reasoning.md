# richmondsin/Mistral-Small-24B-Instruct-2501-Post-Reasoning

## Resumen

Mistral-Small-24B-Instruct-2501-Post-Reasoning es un ajuste fino supervisado del modelo Mistral-Small-24B-Instruct-2501 de Mistral AI, publicado por el autor richmondsin. El modelo aplica la tecnica denominada "Post-Reasoning", descrita en el articulo arXiv:2605.06165, que entrena al modelo para que emita la respuesta final primero y justifique despues el razonamiento. De este modo, la respuesta puede leerse (y detener la generacion) en el marcador de fin de respuesta, sin que se generen tokens de razonamiento antes de la misma.

El ajuste se realizo mediante LoRA (r 16, alpha 32, dropout 0.05) sobre el modelo base, con un learning rate de 2e-5, 3 epocas y schedule cosine, y posteriormente los pesos LoRA se fusionaron en los pesos base en bf16. Los datos de entrenamiento son problemas de NuminaMath con justificaciones post-respuesta auto-destiladas. El modelo conserva la licencia Apache 2.0 del modelo base.

Con 23.572.403.200 parametros (aproximadamente 23,6 mil millones) y un tamano de repositorio de 47,2 GB, se trata de un modelo denso de tipo transformer orientado a generacion de texto conversacional. Su relevancia radica en la propuesta de reducir el coste de inferencia asociado al razonamiento explicito: en lugar de generar cadenas de pensamiento antes de la respuesta, el modelo produce primero la solucion y luego la justificacion, permitiendo truncar la generacion tras la respuesta para ahorrar tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Small-24B-Instruct-2501) |
| Parametros totales | 23.572.403.200 (~23,6 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Small-24B-Instruct-2501, un transformer denso de Mistral AI, y sobre el se aplica un ajuste fino supervisado (SFT) mediante LoRA. La innovacion principal no reside en la arquitectura, sino en el regimen de entrenamiento "Post-Reasoning": se pide al modelo que declare la respuesta final primero y que la justifique a continuacion. Durante el entrenamiento, la funcion de perdida se enmascara tanto en el prompt como en la respuesta, de modo que el modelo solo aprende a producir las justificaciones posteriores a la respuesta.

Los datos de entrenamiento son problemas de NuminaMath con justificaciones post-respuesta auto-destiladas (fichero local `post_reflective_data/<model>_numina_v4.json`). El proceso de ajuste emplea LoRA con rango 16, lora_alpha 32, dropout 0.05, learning rate 2e-5, 3 epocas y schedule cosine; los adaptadores resultantes se fusionan en los pesos base en bf16, dando lugar al checkpoint local `Mistral-Small-24B-Instruct-2501-numina-Reflection-Merged-v4`. No se especifica en la informacion disponible el volumen total de tokens de entrenamiento ni la composicion completa del dataset mas alla de los problemas de NuminaMath.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, uso con chat template).
- Razonamiento matematico con formato post-reasoning: emite primero la respuesta final y despues la justificacion, entrenado especificamente sobre problemas de NuminaMath.
- Truncamiento eficiente de la generacion: la respuesta puede leerse y la generacion detenerse en el marcador de fin de respuesta (por ejemplo, `stop=["Explanation"]`), sin tokens de razonamiento previos.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible en la informacion proporcionada; el modelo esta disenado explicitamente como modelo "non-thinking".

## Casos de uso

- Resolucion de problemas matematicos con bajo coste de inferencia: el modelo declara la respuesta primero, por lo que un pipeline puede leer y truncar la salida en el marcador de fin de respuesta, ahorrando los tokens de justificacion cuando no se necesitan. Es adecuado porque fue entrenado precisamente sobre problemas de NuminaMath con este formato.
- Evaluacion automatizada de soluciones: al separar respuesta y justificacion, un sistema puede extraer la respuesta de forma determinista (por ejemplo, con `stop=["Explanation"]`) y usar la justificacion solo para auditoria o verificacion posterior.
- Generacion de explicaciones pedagogicas: en un tutor o asistente educativo, el modelo puede mostrar la solucion y despues el razonamiento paso a paso, permitiendo al estudiante ver primero el resultado y luego el desarrollo.
- Integracion en pipelines de CI/CD para verificacion de expresiones o calculos: con temperatura 0 y truncamiento en el marcador de respuesta, la salida es estable y parseable, lo que facilita su uso como componente de validacion en automatizaciones.
- Chatbots de soporte tecnico con respuestas directas: el formato respuesta-primero permite mostrar al usuario la solucion inmediatamente y, opcionalmente, desplegar la justificacion en un panel secundario, reduciendo la latencia percibida.
- Servicio de inferencia con vLLM: el modelo se carga directamente con `LLM(model="richmondsin/Mistral-Small-24B-Instruct-2501-Post-Reasoning")` y `llm.chat(...)`, lo que permite desplegar un endpoint conversacional compatible con OpenAI sobre infraestructura vLLM.
- Investigacion sobre eficiencia de razonamiento: sirve como punto de partida reproducible para comparar modelos con y sin post-reasoning, dado que el codigo y los scripts de evaluacion estan publicados en el repositorio GitHub del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa, un modelo denso de ~23,6 mil millones de parametros en bf16 requiere del orden de 47 GB solo para los pesos, a lo que se suma el espacio de cache KV; en cuantizacion de 8 bits se reduce aproximadamente a la mitad y en 4 bits a una cuarta parte, aunque el repositorio solo publica pesos safetensors en bf16.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo en bf16 no cabe en GPU consumer de 24 GB (RTX 4090) ni en 48 GB (A6000) sin cuantizacion o offload; requeriria GPUs de 80 GB (A100, H100) en bf16.
- Cabe en consumer GPU: no en bf16 segun el tamano del repositorio (47,2 GB); requeriria cuantizacion no publicada en el repositorio.
- Opciones de despliegue: vLLM (documentado en la model card con ejemplo de codigo), transformers, text-generation-inference (segun etiquetas del repositorio). llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible mas alla de la etiqueta `text-generation-inference`.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Small-24B-Instruct-2501-Post-Reasoning | ~23,6 mil millones | no disponible | Post-reasoning (respuesta primero, justificacion despues) | apache-2.0 | Hugging Face, 0 descargas |
| mistralai/Mistral-Small-24B-Instruct-2501 | ~23,6 mil millones | no disponible | Instruct generalista de Mistral AI | apache-2.0 | Hugging Face (modelo base) |
| Mistral-Small-24B-Instruct-2501-numina-Reflection-Merged-v4 | ~23,6 mil millones | no disponible | Checkpoint local del mismo autor antes de renombrar | apache-2.0 | Local (segun model card) |

No se dispone de datos de benchmarks para comparar el rendimiento frente a alternativas; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo esta especializado en el formato post-reasoning entrenado sobre NuminaMath; fuera de ese dominio, la calidad de las justificaciones posteriores a la respuesta puede degradarse respecto al modelo base.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad de las justificaciones; dado que la justificacion se genera despues de la respuesta, existe riesgo de que racionalice a posteriori una respuesta incorrecta.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso comunitario ni validacion externa; debe tratarse como un experimento de investigacion.
- No se especifican idiomas soportados ni longitud de contexto en la informacion disponible; el modelo base es de Mistral AI, pero no se confirma el comportamiento multilingue tras el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base; no se detallan restricciones adicionales.
- El truncamiento en el marcador de fin de respuesta depende de que el modelo respete el formato `Answer: ... Explanation: ...`; variaciones de prompt pueden romper el parseo.
- No se publican pesos cuantizados en el repositorio, lo que limita el despliegue en hardware con poca VRAM.
- El articulo asociado (arXiv:2605.06165) y el repositorio GitHub son la unica fuente de metodologia; no hay resultados de benchmarks publicados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/Mistral-Small-24B-Instruct-2501-Post-Reasoning
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Paper: https://arxiv.org/abs/2605.06165
- Codigo y scripts de evaluacion: https://github.com/richmondsin/Post-Reasoning
