# OpenMOSS-Team/MOSS-TTSD-v0

## Resumen

MOSS-TTSD-v0 (text to spoken dialogue) es un modelo de sintesis de voz conversacional desarrollado por OpenMOSS-Team, pensado especificamente para transformar guiones de dialogo entre dos hablantes en habla conversacional natural y expresiva. A diferencia de los modelos TTS convencionales orientados a locucion unica, este modelo aborda el problema del dialogo hablado: alternancia de turnos entre dos voces, prosodia conversacional y coherencia acustica a lo largo de intercambios largos. Es relevante porque cubre un nicho poco servido en el ecosistema abierto (produccion de podcasts con IA, doblaje dialogado, audiolibros con varios personajes) con licencia Apache 2.0 y uso comercial libre.

El modelo se construye sobre Qwen/Qwen3-1.7B-Base como backbone de lenguaje, con 2.049.551.360 parametros totales y un codec neural de audio semantico-acustico unificado. Soporta clonacion de voz zero-shot de dos hablantes y generacion en una sola sesion de hasta 960 segundos de audio, lo que lo posiciona para piezas de formato largo sin necesidad de concatenar fragmentos. Es bilingue chino-ingles.

La version v0 corresponde a la publicacion inicial (junio de 2025) y el repositorio pesa 4,1 GB en safetensors. Con 42 descargas y 28 likes en el momento de la consulta, es un modelo de nicho pero con propuesta tecnica diferenciada frente a TTS de un solo hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM (Qwen3-1.7B-Base) sobre codec neural de audio semantico-acustico unificado para sintesis de dialogo |
| Parametros totales | 2.049.551.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generacion de audio de hasta 960 s en una sesion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-TTSD combina un modelo de lenguaje preentrenado (Qwen3-1.7B-Base) con un codec neural de audio semantico-acustico unificado. El LLM actua como generador de tokens de audio a partir del guion de dialogo, y el codec de baja tasa de bits reconstruye la forma de onda. Este diseno permite manejar el dialogo como una secuencia de tokens, lo que facilita la alternancia de hablantes y el mantenimiento de coherencia en tramos largos.

El entrenamiento se apoya en millones de horas de datos TTS junto con 400.000 horas de habla conversacional sintetica y real, segun la model card. La optimizacion del marco de entrenamiento y el codec de baja tasa de bits son los responsables de habilitar la generacion de hasta 960 segundos en una sola sesion. No se detalla en la informacion disponible si hubo fases de RLHF o DPO, ni la composicion exacta del dataset mas alla de las cifras mencionadas.

## Capacidades

- Sintesis de voz a partir de texto con prosodia conversacional (no locucion plana).
- Dialogo entre dos hablantes con alternancia de turnos segun el guion.
- Clonacion de voz zero-shot para dos hablantes.
- Generacion de audio de formato largo: hasta 960 segundos en una sola sesion.
- Soporte bilingue: chino e ingles.
- Salida de habla expresiva orientada a podcast y contenido conversacional.
- No se documenta soporte de tool calling, agentes, vision ni audio de entrada en la informacion disponible.

## Casos de uso

- Produccion de podcasts con IA: el modelo convierte un guion de dos locutores en un episodio completo con voces clonadas y alternancia natural, aprovechando la ventana de 960 s para reducir el numero de concatenaciones.
- Doblaje dialogado: para escenas de dos personajes, permite generar las dos voces en una sola pasada manteniendo coherencia acustica y de prosodia entre turnos.
- Audiolibros con varios personajes: asignando una voz clonada a cada interlocutor, se pueden sintetizar capitulos con dialogos sin cortes artificiales.
- Prototipado de contenido conversacional: creadores que necesitan maquetas de audio de dialogos antes de grabar con actores reales pueden generar versiones preliminares rapidas.
- Localizacion de contenido hablado zh-en: al ser bilingue, sirve para adaptar dialogos entre ambos idiomas manteniendo el estilo conversacional.
- Formacion y e-learning: generacion de escenarios de dialogo (entrevistas simuladas, role-play) con dos voces diferenciadas y clonables.
- Investigacion en TTS conversacional: base abierta para experimentar con clonacion de voz y generacion de dialogo largo en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2.049.551.360 parametros, en fp16 el peso ronda los 4 GB, por lo que en la practica se necesita margen adicional para el codec y el estado de generacion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamano de parametros es plausible en GPUs consumer con VRAM suficiente, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: no se documentan frameworks concretos (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MOSS-TTSD-v0 | 2.049.551.360 | hasta 960 s por sesion | zh, en | Apache 2.0 | Dialogo de dos hablantes con clonacion |
| Alternativas TTS de un solo hablante | no disponible | no disponible | no disponible | no disponible | Locucion unica |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos comparables directos de dialogo TTS abierto, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Solo cubre chino e ingles; no hay soporte documentado de otros idiomas.
- La clonacion de voz zero-shot conlleva riesgos de suplantacion y uso indebido; requiere consentimiento explicito de las voces clonadas.
- Riesgo de alucinacion o artefactos acusticos en guiones muy largos o con cambios de hablante mal delimitados.
- No se documentan sesgos especificos del modelo en la informacion disponible.
- Aunque la licencia Apache 2.0 permite uso comercial, el uso de voces clonadas puede estar sujeto a normativa de derechos de imagen y voz segun la jurisdiccion.
- Es una version v0; pueden aparecer cambios de comportamiento en futuras actualizaciones.
- No hay datos publicados de latencia, throughput ni requisitos minimos de hardware, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v0
- Web de MOSS AI: https://www.moss-ai.com/models/moss-ttsd
- Documentacion de la API MOSS: https://platform.moss.cn/en/docs/scenarios/dialogue
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
