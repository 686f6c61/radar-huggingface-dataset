# D00mweaver/namagram-gemma3-1b

## Resumen

Namagram On-Device Model es un paquete de pesos pre-cuantizados de Gemma 3 1B IT, el modelo de lenguaje de Google de 1.000 millones de parametros en su variante instruction-tuned. Lo publica el usuario D00mweaver en Hugging Face y esta empaquetado en formato MediaPipe `.task` con cuantizacion INT4, pensado especificamente para inferencia offline en la aplicacion Android Namagram. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una conversion del modelo oficial de Google a un formato ejecutable en dispositivos moviles.

El repositorio tiene un tamano de 0,6 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere una publicacion reciente y de alcance limitado. La model card es muy escueta: unicamente declara la licencia Gemma y enlaza a los terminos de uso de Google, sin aportar informacion sobre el proceso de cuantizacion, los datos de calibracion, el rendimiento medido ni los idiomas soportados.

Su relevancia practica es acotada pero concreta: sirve como referencia para quien quiera desplegar Gemma 3 1B IT en Android mediante MediaPipe sin tener que realizar la conversion a `.task` e INT4 por su cuenta. Para cualquier otro caso de uso (servidor, escritorio, otros frameworks) resulta mas directo acudir a los pesos originales de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), segun el modelo base de Google |
| Parametros totales | 1.000 millones (modelo base Gemma 3 1B IT) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (corresponde al contexto nativo de Gemma 3 1B IT) |
| Tipos de cuantizacion | INT4 (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use |
| Formato de pesos | MediaPipe `.task` (bundle pre-cuantizado INT4) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 1B IT, un transformer decoder-only de Google con 1.000 millones de parametros en version instruction-tuned. El repositorio no documenta ningun entrenamiento adicional, fine-tuning ni proceso de destilacion por parte del autor: se limita a alojar la conversion del modelo oficial al formato MediaPipe `.task` con cuantizacion INT4 para ejecucion en Android.

No se especifica en la model card el metodo de cuantizacion (por ejemplo, cuantizacion post-entrenamiento con calibracion, GPTQ, AWQ u otra variante), ni el conjunto de calibracion empleado, ni si se ha aplicado decodificacion especulativa u otras optimizaciones de inferencia. Tampoco se detalla el numero de tokens de entrenamiento del modelo base ni la composicion del dataset, datos que corresponden a la documentacion oficial de Gemma 3 y no a este repositorio.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Gemma 3 1B IT en modo instruction-tuned.
- Razonamiento basico y respuesta a instrucciones en lenguaje natural, limitado por el tamano de 1B parametros.
- Generacion de codigo y resolucion de tareas matematicas sencillas, segun las capacidades del modelo base.
- Inferencia completamente offline en dispositivo, sin llamadas a red, gracias al bundle MediaPipe.
- Ejecucion en Android mediante el runtime de MediaPipe LLM Inference.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada para este bundle.

## Casos de uso

- Asistente conversacional offline en la app Namagram: el bundle `.task` permite ejecutar Gemma 3 1B IT INT4 en el propio dispositivo Android sin conexion, adecuado para respuestas cortas y tareas de asistencia en local.
- Prototipado de apps Android con LLM embebido: sirve como punto de partida para integrar MediaPipe LLM Inference sin realizar la conversion a `.task` desde los pesos originales.
- Escenarios con requisitos de privacidad: al no requerir red, los datos del usuario no salen del dispositivo, lo que encaja en casos de procesamiento de texto sensible en local.
- Clasificacion y extraccion de informacion simple en movil: resumen de notas, etiquetado de texto o extraccion de entidades en flujos ligeros donde un modelo de 1B es suficiente.
- Generacion de texto asistida en formularios o chats de baja latencia: el tamano reducido y la cuantizacion INT4 permiten respuestas rapidas en hardware movil de gama media-alta.
- Referencia para evaluar el impacto de la cuantizacion INT4 en MediaPipe: util para comparar calidad y velocidad frente a los pesos originales de Gemma 3 1B IT.
- Base para experimentos de personalizacion en dispositivo: permite probar prompts de sistema y plantillas de chat sobre el modelo cuantizado antes de invertir en un pipeline propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el bundle ocupa 0,6 GB en disco y esta pensado para ejecucion en CPU/GPU movil mediante MediaPipe, no para GPU de escritorio.
- GPU recomendadas: no aplica en el contexto del bundle (orientado a Android); para ejecutar Gemma 3 1B IT en otros entornos se requieren GPUs de consumo como RTX 3060/4060 o superiores, aunque este dato no consta en la informacion proporcionada.
- Compatibilidad con GPU de consumo: el bundle esta disenado para dispositivos Android, no para GPUs de escritorio; no se documenta compatibilidad con CUDA.
- Opciones de despliegue: MediaPipe LLM Inference en Android es el unico runtime documentado para este bundle. Para otros entornos (llama.cpp, Ollama, vLLM, TGI) seria necesario usar los pesos originales de Gemma 3 1B IT, no este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Namagram Gemma 3 1B INT4 (este repo) | 1B | no disponible | MediaPipe `.task` INT4 | Gemma Terms of Use | Hugging Face, 0 descargas |
| Gemma 3 1B IT (Google, oficial) | 1B | no disponible en esta ficha | safetensors y otros formatos oficiales | Gemma Terms of Use | Hugging Face oficial de Google |
| Qwen2.5 1.5B Instruct | 1.500 millones | 32.768 tokens (segun documentacion del modelo) | safetensors, GGUF | Apache 2.0 | Hugging Face |
| Llama 3.2 1B Instruct | 1.200 millones | 128.000 tokens (segun documentacion del modelo) | safetensors, GGUF | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a parametros, contexto, formato y licencia; no se dispone de datos de rendimiento de este bundle que permitan contrastar calidad frente a las alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta el proceso de cuantizacion, calibracion, idiomas ni rendimiento, lo que dificulta evaluar la fidelidad respecto al modelo original.
- Al ser una cuantizacion INT4 de un modelo de 1B, es esperable una degradacion de calidad frente a los pesos en precision completa, aunque no se cuantifica en la informacion disponible.
- Riesgo de alucinacion inherente a modelos de 1B parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Sesgos: no documentados en este repositorio; deben consultarse en la model card oficial de Gemma 3.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Restricciones de licencia: sujeto a los Gemma Terms of Use y a la Prohibited Use Policy de Google; el uso comercial requiere cumplir dichos terminos, que no se detallan en este repositorio.
- Sin descargas ni likes registrados: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Bundle atado a MediaPipe en Android: no es portable a otros runtimes sin reconvertir los pesos originales.
- Fecha de creacion del repositorio (2026-11-13) posterior a la de esta ficha; conviene verificar la vigencia del contenido antes de usarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/D00mweaver/namagram-gemma3-1b
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Documentacion de MediaPipe LLM Inference: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- Modelo base Gemma 3 1B IT (Google): no disponible en la informacion proporcionada
