# AI-damP/civilian-sim-3b-v5c-onnx

## Resumen

civilian-sim-3b-v5c-onnx es una distribucion en formato ONNX del modelo civilian-sim-3b-v5c, un ajuste fino de Llama 3.2 3B Instruct mediante LoRA fusionado, publicado por el usuario AI-damP. El modelo esta disenado para simular el rol de un "civilano" en una conversacion por turnos donde el interlocutor adopta el papel de "oficial", segun se desprende del formato de chat descrito en la model card. Esta version concreta esta empaquetada para ejecucion en navegador mediante Transformers.js.

El repositorio contiene unicamente la variante cuantizada model_q4f16.onnx, con los datos externos divididos en fragmentos de menos de 1,9 GB para facilitar su carga en entornos web. El peso total del repositorio es de 2,4 GB. No se ha publicado informacion sobre el pipeline, la licencia, los idiomas soportados ni los datos de entrenamiento del ajuste.

La relevancia de esta ficha es limitada: se trata de una publicacion sin descargas ni interacciones, sin model card detallada mas alla de las instrucciones de uso del formato de chat, y sin resultados de evaluacion. Resulta util principalmente como referencia tecnica de como se empaqueta un modelo Llama 3.2 3B ajustado para inferencia en navegador con ONNX Runtime Web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Llama 3.2 3B Instruct) |
| Parametros totales | 3B (heredados del modelo base; no confirmado explicitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (unica variante publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (model_q4f16.onnx con datos externos fragmentados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct, un transformer decoder-only con atencion causal estandar. Sobre ese modelo base se aplico un ajuste fino con LoRA que posteriormente se fusiono en los pesos (LoRA merged), segun indica la model card. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO adicionales.

La innovacion tecnica de esta publicacion no reside en el entrenamiento sino en el empaquetado: se distribuye una unica variante ONNX cuantizada a q4f16 pensada para Transformers.js, con los datos externos troceados en fragmentos inferiores a 1,9 GB. El repositorio incluye un archivo system_prompts.json con los system prompts exactos (identificados por prefijos SHA-256) y dos marcadores, asi como una plantilla de chat que ya incorpora el token BOS, por lo que la tokenizacion debe realizarse sin volver a anadir tokens especiales.

## Capacidades

- Generacion de texto conversacional en formato de dialogo por turnos (rol "oficial" como usuario y rol "civilano" como asistente).
- Simulacion de personaje o rol mediante system prompts predefinidos incluidos en el repositorio.
- Ejecucion en navegador mediante Transformers.js y ONNX Runtime Web, sin necesidad de backend.
- Capacidades heredadas del modelo base Llama 3.2 3B Instruct (razonamiento basico, generacion de texto general), aunque no se documenta su preservacion tras el ajuste.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Simulacion de interacciones en navegador: el modelo puede desplegarse directamente en una pagina web con Transformers.js para generar respuestas del rol "civilano" en una conversacion guiada, sin servidor intermedio, gracias al empaquetado ONNX con datos fragmentados.
- Prototipado de chatbots de rol: los system prompts incluidos en system_prompts.json permiten reproducir exactamente el comportamiento previsto por el autor, util para experimentar con dialogos guiados por personaje.
- Demos educativas de inferencia local: sirve como ejemplo practico de como cargar un modelo de 3B cuantizado a q4f16 en el navegador y gestionar la tokenizacion con una plantilla que ya incluye BOS.
- Pruebas de integracion con Transformers.js: util para validar pipelines de carga de modelos ONNX con datos externos troceados en entornos web.
- Evaluacion de ajustes LoRA fusionados: permite comparar el comportamiento del modelo ajustado frente al Llama 3.2 3B Instruct original en tareas de simulacion conversacional.
- Entornos con restricciones de privacidad: al ejecutarse en el cliente, los datos de la conversacion no abandonan el navegador, lo que resulta adecuado para demos de simulacion con datos sensibles simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 3B en q4f16 el peso de los pesos ronda los 2,4 GB, por lo que se necesita al menos esa cantidad de memoria o de RAM del navegador.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el formato esta pensado para ejecucion en navegador, donde el rendimiento dependera de WebGPU o del backend disponible en el cliente.
- Opciones de despliegue: Transformers.js (principal, segun la model card); ONNX Runtime Web; otros runtimes compatibles con ONNX no documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| civilian-sim-3b-v5c-onnx | 3B (base Llama 3.2 3B) | no disponible | ONNX q4f16 | no disponible | Ajuste LoRA fusionado, empaquetado para navegador |
| Llama 3.2 3B Instruct | 3B | 128k (segun Meta) | safetensors, GGUF | Llama 3.2 Community License | Modelo base sin ajuste; contexto y licencia del original |
| Alternativas de 3B para navegador | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- No se documenta la licencia: no puede asumirse uso comercial sin verificar los terminos del modelo base Llama 3.2 y del ajuste.
- El ajuste LoRA puede haber degradado capacidades generales del modelo base; no hay evaluaciones que lo confirmen o descarten.
- Riesgo de alucinacion inherente a los modelos de 3B, agravado por la falta de benchmarks publicados.
- Idiomas soportados no documentados; el comportamiento fuera del idioma de entrenamiento es incierto.
- Longitud de contexto no especificada; no debe asumirse la ventana del modelo base sin confirmacion.
- La tokenizacion debe realizarse sin anadir tokens especiales (la plantilla ya incluye BOS); un uso incorrecto produce respuestas degradadas.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- La variante q4f16 introduce perdida de precision respecto a los pesos originales; no se ha medido su impacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI-damP/civilian-sim-3b-v5c-onnx
- Modelo base del ajuste (referenciado en la model card): https://huggingface.co/AI-damP/civilian-sim-3b-v5c
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
