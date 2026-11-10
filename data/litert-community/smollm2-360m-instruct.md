# litert-community/SmolLM2-360M-Instruct

## Resumen

SmolLM2-360M-Instruct es un modelo de lenguaje de 360 millones de parametros desarrollado originalmente por Hugging Face (HuggingFaceTB) y adaptado por la comunidad litert-community para su despliegue en dispositivos Android mediante LiteRT-LM, el runtime de inferencia on-device de Google AI Edge. Esta variante no modifica los pesos del modelo original: empaqueta el checkpoint en un formato compatible con LiteRT-LM para ejecucion local en moviles, sin necesidad de conexion a servidores externos.

El modelo resuelve el problema de ejecutar un asistente conversacional en un telefono movil con recursos limitados, manteniendo una huella de almacenamiento de aproximadamente 0,4 GB. Es relevante en el contexto actual de IA en el borde (edge AI), donde la privacidad, la latencia y el coste de inferencia empujan parte de las cargas de trabajo hacia el dispositivo del usuario.

La arquitectura subyacente es un transformer decoder-only de la familia SmolLM2, ajustado con instrucciones para tareas de chat. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. La informacion publica disponible sobre esta variante concreta es escasa: la model card se limita a instrucciones de despliegue en Android mediante la app Edge Gallery.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2) |
| Parametros totales | 360 millones (heredado del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | formato LiteRT-LM (runtime on-device); repo de 0,4 GB |

## Arquitectura y entrenamiento

El modelo base SmolLM2-360M-Instruct es un transformer decoder-only denso con 360 millones de parametros, entrenado por Hugging Face sobre un corpus de datos web y de codigo, y posteriormente ajustado con instrucciones y preferencias humanas (SFT y DPO en la familia SmolLM2, segun la documentacion publica del modelo original). Esta variante de litert-community no reentrena ni modifica los pesos: unicamente los convierte al formato que consume LiteRT-LM, el runtime de Google para inferencia en el borde.

La innovacion tecnica de esta publicacion no reside en el modelo sino en el empaquetado para despliegue: LiteRT-LM permite ejecutar el modelo en Android con aceleracion por GPU/NPU cuando el dispositivo lo soporta, integrado en la app Edge Gallery de Google AI Edge. No se dispone de informacion detallada sobre el proceso de conversion, el numero exacto de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (pipeline `text-generation`).
- Ajuste por instrucciones: responde a peticiones directas del usuario en un estilo asistencial.
- Inferencia completamente local en dispositivo Android, sin llamadas a red.
- Ejecucion de baja latencia en moviles modernos gracias al runtime LiteRT-LM.
- Capacidad multilingue: no confirmada en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Razonamiento multi-paso o modo thinking: no documentado.
- Vision o audio: no soportado (modelo exclusivamente de texto).

## Casos de uso

- Asistente conversacional offline en Android: el modelo se integra en la app Edge Gallery y responde en local sin conexion, lo que resulta adecuado para escenarios con conectividad intermitente o requisitos de privacidad estrictos.
- Procesamiento de texto privado en el dispositivo: clasificacion, resumen o reescritura de notas y mensajes sin que el contenido abandone el telefono, aprovechando que la inferencia es 100 % local.
- Prototipado rapido de funciones de chat en apps moviles: desarrolladores que quieran validar una experiencia conversacional antes de invertir en infraestructura de servidor pueden usar este checkpoint con LiteRT-LM y la app de referencia.
- Educacion y demos de IA on-device: util para talleres y articulos tecnicos que muestren como desplegar un LLM en Android con un runtime de Google, dado el reducido tamano del repo (0,4 GB).
- Autocompletado y asistencia de escritura en apps de notas o correo: la baja huella del modelo permite incluirlo como dependencia en aplicaciones moviles sin penalizar excesivamente el tamano de la APK.
- Filtrado y moderacion ligera de contenido generado por el usuario en el propio dispositivo: el modelo puede clasificar o reformular texto antes de enviarlo a un backend, reduciendo coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante concreta. El modelo base SmolLM2-360M-Instruct cuenta con evaluaciones publicas en su model card original, pero no se reproducen aqui al no haberse proporcionado los datos.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso objetivo (despliegue en Android). En un servidor, un modelo de 360 M en FP16 ocupa aproximadamente 0,7 GB de pesos; en cuantizacion de 8 bits, alrededor de 0,4 GB, y en 4 bits, cerca de 0,2 GB (estimaciones teoricas a partir del numero de parametros, no verificadas para este checkpoint).
- GPU recomendadas para servidor: cualquier GPU consumer moderna (RTX 3060 o superior) puede alojar el modelo con holgura; A100/H100 no son necesarias.
- Compatibilidad consumer: si, cabe en GPUs con 2 GB o mas de VRAM en cuantizaciones bajas, y en CPUs modernas.
- Despliegue objetivo: LiteRT-LM en Android mediante la app Edge Gallery o las muestras de google-ai-edge/litert-samples.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este formato LiteRT-LM; requeririan conversion desde el checkpoint original de HuggingFaceTB.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| litert-community/SmolLM2-360M-Instruct | 360 M | no disponible | Apache 2.0 | On-device Android (LiteRT-LM) |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M | no disponible en esta ficha | Apache 2.0 | Modelo base original, formato transformers |
| Qwen2.5-0.5B-Instruct | 500 M | no disponible en esta ficha | Apache 2.0 | LLM pequeno para edge |
| Gemma 3 270M | 270 M | no disponible en esta ficha | Terminos de Gemma | LLM pequeno para on-device |

La ventaja diferencial de esta variante frente al checkpoint original es el empaquetado listo para LiteRT-LM y la integracion con la app Edge Gallery de Google; en capacidades linguisticas es equivalente al modelo base de Hugging Face.

## Limitaciones y advertencias

- Con 360 M de parametros, la calidad de razonamiento, matematicas y codigo es limitada en comparacion con modelos de miles de millones de parametros; no es adecuado para tareas complejas.
- Riesgo elevado de alucinacion en preguntas factuales, especialmente con contextos largos o ambiguos.
- Idiomas soportados no confirmados: el modelo base esta orientado principalmente al ingles, por lo que el rendimiento en castellano puede ser deficiente.
- Longitud de contexto no documentada en esta ficha; conviene verificar la model card del modelo base antes de disenar conversaciones largas.
- El formato LiteRT-LM esta pensado para Android; su uso en servidor requiere conversion desde el checkpoint original.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base puede arrastrar sesgos de los datos web de entrenamiento; se recomienda evaluacion previa en el dominio de aplicacion.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/SmolLM2-360M-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- App Edge Gallery (instrucciones): https://github.com/google-ai-edge/gallery
- App Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Muestras LiteRT: https://github.com/google-ai-edge/litert-samples
