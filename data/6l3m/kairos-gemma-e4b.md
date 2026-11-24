# 6l3m/kairos-gemma-e4b

## Resumen

kairos-gemma-e4b es un ajuste fino (fine-tune) del modelo Gemma 4 E4B de Google, publicado por el usuario 6l3m para dar soporte al chat del editor de vídeo kaairos. El modelo parte del checkpoint cuantizado `gemma-4-E4B-it-web.litertlm` de la comunidad litert-community y reescribe únicamente una sección del archivo (los pesos cuantizados del decodificador) mediante un fine-tune con reconocimiento de cuantización (QAT). El resto de bytes del archivo permanecen idénticos a los de Google.

La finalidad es muy concreta: convertir una petición en lenguaje natural en llamadas a las herramientas propias del editor de vídeo, que se encolan en una tarjeta para que el usuario las apruebe antes de aplicarse. El modelo se ejecuta íntegramente en el navegador del visitante mediante LiteRT-LM sobre WebGPU, sin enviar datos a ningún servidor.

Por su naturaleza, no es un modelo de propósito general: es una especialización cerrada sobre un modelo base de 4B efectivos, empaquetado en formato `.litertlm` de 2,97 GB y con licencia Apache 2.0. Su relevancia radica en demostrar un flujo completo de fine-tune QAT sobre un artefacto cuantizado listo para el navegador, con evaluación ciega frente al modelo base y frente a Gemma 4 31B en servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B), pesos cuantizados del decodificador |
| Parametros totales | no disponible (modelo base Gemma 4 E4B; variante "E4B" de Gemma 4) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización QAT del checkpoint de Google (11.900.199 enteros, 432 tensores); esquema exacto no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), 2.969.059.328 bytes |

## Arquitectura y entrenamiento

El modelo se construye sobre el checkpoint QAT `google/gemma-4-E4B-it-qat-mobile-transformers` y el artefacto web `gemma-4-E4B-it-web.litertlm` de litert-community. El fine-tune solo modifica la sección de pesos cuantizados del decodificador; el resto del archivo se reconstruye byte a byte idéntico al original de Google. Esto implica que la arquitectura subyacente es la de Gemma 4 E4B, con la particularidad de que los pesos ajustados respetan el esquema de cuantización original gracias al entrenamiento con reconocimiento de cuantización.

El conjunto de datos de entrenamiento consta de 6.109 turnos de chat del editor, entrenados durante dos épocas. De ellos, 1.827 son peticiones escritas sobre proyectos reales y respondidas por Gemma 4 31B a través de la aplicación (conservadas solo si la tarjeta resultante se aplicó y superaron una verificación ciega de etiquetas de 116/120), 4.179 se construyeron a partir de esas (dos tercios multietapa) y 103 peticiones que no requieren edición. El protocolo, los scripts y los datos están documentados en `training/one-model/` del repositorio de kaairos. No se indica el número total de tokens de entrenamiento ni si hubo RLHF o DPO adicional.

## Capacidades

- Generación de texto orientada a la conversión de peticiones en lenguaje natural en llamadas a herramientas del editor de vídeo.
- Function calling / tool calling: el modelo emite acciones que el editor encola en una tarjeta para aprobación del usuario, sin aplicarlas por sí mismo.
- Razonamiento multietapa: dos tercios de los ejemplos de entrenamiento construidos son de varios pasos.
- Ejecución local en el navegador mediante LiteRT-LM sobre WebGPU, sin envío de datos a servidores.
- Capacidad de no actuar: entrenado explícitamente con 103 ejemplos que no requieren edición.
- Tareas de lectura Sí/No dentro del dominio del editor (evaluado con 1.963 de 1.986 respuestas coincidentes con E4B plano).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Edición de vídeo asistida por chat: el modelo interpreta una petición en lenguaje natural ("recorta los primeros cinco segundos del clip 2") y la traduce a la herramienta interna correspondiente del editor, que se encola para aprobación. Es adecuado porque el fine-tune se entrenó específicamente con turnos reales de este editor.
- Aprobación humana en el bucle: al no aplicar cambios por sí mismo y encolar las acciones en tarjetas, encaja en flujos donde el usuario revisa cada edición antes de ejecutarla, reduciendo el riesgo de acciones destructivas.
- Edición en el navegador sin servidor: al ejecutarse sobre WebGPU en el dispositivo del visitante, permite ofrecer asistencia conversacional en una aplicación web sin infraestructura de inferencia ni costes de API.
- Automatización de tareas de varios pasos: con dos tercios de ejemplos multietapa en el entrenamiento, puede descomponer peticiones compuestas en secuencias de acciones del editor.
- Filtrado de peticiones sin acción: los 103 ejemplos sin edición permiten al modelo reconocer consultas que no deben generar cambios y responder sin encolar tarjetas.
- Evaluación de fine-tunes QAT sobre artefactos web: sirve como referencia reproducible para equipos que quieran ajustar un modelo cuantizado listo para el navegador sin alterar el resto del artefacto, ya que el método de reconstrucción byte a byte está documentado.
- Prototipado de asistentes de dominio cerrado: el enfoque (datos reales filtrados por aplicación efectiva y verificación ciega de etiquetas) es replicable para otros editores o herramientas con interfaz de tarjetas.

## Benchmarks y rendimiento

Evaluación ciega sobre 100 peticiones selladas nunca vistas en entrenamiento, en el chat del editor, en el navegador (2026-11-23):

| Modelo (100 peticiones) | Correctas | Incorrectas visibles | Incorrectas plausibles | Sin respuesta | Afirma hecho sin hacerlo |
|---|---|---|---|---|---|
| Gemma 4 E2B web | 34 | 24 | 21 | 21 | 4 |
| Gemma 4 E4B web | 45 | 15 | 16 | 24 | 3 |
| **este archivo** | **62** | 19 | **13** | 6 | **2** |
| Gemma 4 31B (servidor) | 68 | 13 | 13 | 6 | 2 |

Datos adicionales declarados por el autor: en una tarea de lectura Sí/No coincide con E4B plano en 1.963 de 1.986 respuestas frente a un umbral de 1.967; un turno tarda aproximadamente 2,5 veces más que E2B. Los dos casos de "afirma hecho sin hacerlo" corresponden a una edición pedida para parte de un clip aplicada al clip completo (el editor ahora lo detecta en código). No se midió nada fuera del chat del editor y sus tareas de escritura.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto pesa 2,97 GB, por lo que se necesita al menos esa cantidad de memoria de GPU disponible para cargar los pesos.
- GPU recomendadas: no disponible; el autor indica ejecución en la GPU del visitante vía WebGPU, sin especificar modelos.
- Compatibilidad con GPU de consumo: no disponible; depende del soporte de WebGPU y de la memoria de la GPU del navegador.
- Opciones de despliegue: LiteRT-LM sobre WebGPU en el navegador; no se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponible en términos absolutos; el autor indica que un turno tarda aproximadamente 2,5 veces más que Gemma 4 E2B web.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Correctas (100 peticiones) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kairos-gemma-e4b | Gemma 4 E4B (no detallado) | no disponible | 62 | Apache 2.0 | Hugging Face, formato `.litertlm` |
| Gemma 4 E4B web (base) | Gemma 4 E4B | no disponible | 45 | Apache 2.0 | litert-community en Hugging Face |
| Gemma 4 E2B web | Gemma 4 E2B | no disponible | 34 | Apache 2.0 | litert-community en Hugging Face |
| Gemma 4 31B (servidor) | 31B (aproximado por nombre) | no disponible | 68 | no disponible en la información | Servidor, no navegador |

La comparación se limita a la tarea del editor de kaairos; no hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) para este fine-tune.

## Limitaciones y advertencias

- Dominio cerrado: solo se evaluó en el chat del editor y sus tareas de escritura; no hay medición fuera de ese ámbito.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: en la evaluación, 13 de 100 respuestas fueron incorrectas pero plausibles y 2 afirmaron haber hecho algo que no se hizo; el editor mitiga parte del problema validando en código.
- Limitación específica: las ediciones pedidas para parte de un clip podían aplicarse al clip completo; el autor indica que ahora se detecta en código.
- Contexto e idiomas: no se documentan la longitud de contexto ni los idiomas soportados.
- Licencia: Apache 2.0 según la model card, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google; conviene verificar la compatibilidad para uso comercial.
- Dependencia de WebGPU: la ejecución en navegador requiere soporte de WebGPU y memoria de GPU suficiente en el dispositivo del usuario.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-24; es un artefacto reciente y poco validado por terceros.
- Formato propietario: `.litertlm` limita las opciones de despliegue fuera de LiteRT-LM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/6l3m/kairos-gemma-e4b
- Modelo base: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Checkpoint QAT de origen: https://huggingface.co/google/gemma-4-E4B-it-qat-mobile-transformers
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Editor kaairos: https://kaairos.app
