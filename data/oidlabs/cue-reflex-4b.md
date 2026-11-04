# oidlabs/cue-reflex-4B

## Resumen

CueReflex-E4B es un adaptador LoRA de tipo System-1 desarrollado por OidLabs, afinado a partir de `google/gemma-4-E4B-it`. Su funcion no es generar texto, sino responder a una pregunta de decision estructurada devolviendo, en un unico forward pass, una distribucion de probabilidad calibrada sobre un conjunto acotado de opciones. Admite tres tipos de decision: seleccion categorica (`choice`, de 2 a 16 opciones), verificacion binaria (`noul`, no/yes) y puntuacion ordinal (`score`, niveles de rubrica de 0 a K-1).

La propuesta es relevante porque ataca un problema recurrente en pipelines agenticos: sustituir una llamada generativa completa por un clasificador ligero y calibrado, reduciendo latencia y coste, y aportando probabilidades utilizables en umbrales de decision. El adaptador se publica con licencia Apache-2.0 y un objetivo declarado de servir como baseline reproducible para evaluacion independiente, no como estado del arte.

Esta es la version v0.1: el autor advierte que los resultados de JevBench son diagnosticos locales y no puntuaciones oficiales de leaderboard, y que el runtime de inferencia y las instrucciones de reproduccion estan pendientes de publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Gemma-4 (adaptador `r=32`, `alpha=64`) + cabecera de lectura de letra-respuesta congelada (`decision_head.pt`) con logit softcapping a 30.0 |
| Parametros totales | no disponible (el repo ocupa 0.3 GB y contiene solo el adaptador) |
| Parametros activos | no disponible (el modelo base es `gemma-4-E4B-it`; el autor no detalla el reparto de expertos) |
| Longitud de contexto | 4.096 tokens (longitud maxima de secuencia declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) + `decision_head.pt`; libreria `peft` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 64 montado sobre el modelo base `google/gemma-4-E4B-it`, que permanece congelado. Sobre la representacion del modelo base se aplica una cabecera de lectura congelada (`decision_head.pt`) que proyecta hacia las letras de respuesta (A-P), con softcapping de logits fijado en 30.0 para contener la magnitud de los logits. La salida es una distribucion de probabilidad sobre las opciones, sin decodificacion autoregresiva de texto.

El entrenamiento se realizo sobre 76.800 ejemplos estructurados de decision de procedencia comercial-friendly, cubriendo las tareas `choice`, `noul` y `score`. La temperatura de calibracion se fijo en la identidad (T = 1.0) para los tres tipos de decision, seleccionada sobre validacion retenida bajo una politica de no-afinado con T >= 1.0. Los 231 items publicos de JevBench se usaron exclusivamente como evaluacion diagnostica externa, sin entrar en entrenamiento ni en el ajuste de parametros o de la temperatura.

## Capacidades

- Clasificacion categorica (`choice`) sobre entre 2 y 16 opciones etiquetadas de A a P.
- Verificacion binaria (`noul`) con salida no/yes.
- Puntuacion ordinal (`score`) sobre niveles de rubrica ordenados de 0 a K-1.
- Salida de distribucion de probabilidad calibrada en un solo forward pass, sin generacion de texto.
- Procesamiento de estado estructurado o no estructurado junto con la pregunta de decision y los criterios u opciones acotados.
- Calibracion explicita de temperatura (T = 1.0) orientada a que las probabilidades sean utilizables en umbrales.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Enrutado de decisiones en pipelines agenticos: dado un estado en texto y un conjunto acotado de rutas posibles, el modelo devuelve la probabilidad de cada ruta en una sola pasada, lo que permite aplicar umbrales y derivar a un humano o a un modelo generativo cuando la confianza es baja.
- Moderacion y verificacion binaria: la tarea `noul` permite comprobar si un contenido cumple un criterio dado (no/yes) con una probabilidad calibrada, adecuada para colas de revision con umbral configurable.
- Evaluacion automatica con rubricas: la tarea `score` asigna un nivel ordinal de 0 a K-1 sobre criterios definidos, util para puntuar respuestas de modelos o candidatos en procesos de evaluacion estandarizados.
- Triaje de tickets y clasificacion operativa: con hasta 16 categorias y 4.096 tokens de contexto, puede clasificar incidencias con el historial relevante incluido en la entrada.
- Control de calidad en generacion: verificar si una salida generada satisface una condicion (fidelidad, formato, politica) antes de publicarla, usando la probabilidad como senal de bloqueo.
- Seleccion entre variantes en sistemas de retrieval o ranking: elegir entre un conjunto pequeno de candidatos recuperados, aprovechando la calibracion para comparar alternativas de forma consistente.
- Sustitucion de llamadas generativas por inferencia ligera: al no generar texto, reduce el coste por decision frente a un LLM generativo en tareas donde solo se necesita la etiqueta y su probabilidad.

## Benchmarks y rendimiento

Resultados diagnosticos locales sobre los 231 items publicos de JevBench, comparados con el modelo base en zero-shot:

| Metrica | Zero-shot (`gemma-4-E4B-it`) | CueReflex-E4B |
|---|---|---|
| Accuracy | 64,94% (150/231) | 80,52% (186/231) |
| Log Loss | 1,1725 | 0,4738 |
| Brier Score | 0,5639 | 0,2607 |
| ECE (10 bins) | 0,2569 | 0,0684 |
| Cobertura | 100,0% | 100,0% |

Desglose por nivel de dificultad:

| Nivel | Items | Zero-shot | CueReflex-E4B |
|---|---|---|---|
| Easy | 48 | 48/48 (100,00%) | 48/48 (100,00%) |
| Original | 72 | 65/72 (90,28%) | 72/72 (100,00%) |
| Hard | 111 | 37/111 (33,33%) | 66/111 (59,46%) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el adaptador ocupa 0,3 GB y requiere cargar el modelo base `gemma-4-E4B-it` completo, cuyos requisitos de memoria no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende del modelo base y de la cuantizacion empleada, dato no publicado.
- Opciones de despliegue: el autor indica que el runtime de inferencia y las instrucciones de reproduccion estan pendientes de publicacion. La carga del adaptador se realiza mediante la libreria `peft`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor describe el modelo como de decision rapida en un unico forward pass, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CueReflex-E4B | no disponible (adaptador sobre `gemma-4-E4B-it`) | 4.096 tokens | Decision calibrada System-1 sobre opciones acotadas | Apache-2.0 | HuggingFace (v0.1) |
| `google/gemma-4-E4B-it` | no disponible | no disponible | LLM generativo multimodal de proposito general | no disponible en la informacion | HuggingFace |
| Alternativas de clasificacion calibrada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (clasificadores de decision calibrados sobre LLM) en la documentacion proporcionada.

## Limitaciones y advertencias

- Version v0.1: el autor la presenta como baseline reproducible, no como estado del arte; los resultados de JevBench son diagnosticos locales y no puntuaciones oficiales.
- El runtime de inferencia y las instrucciones de reproduccion no estan publicados, lo que dificulta la validacion independiente.
- El modelo no genera texto: solo devuelve distribuciones sobre opciones predefinidas, con un maximo de 16 opciones y 4.096 tokens de entrada.
- La calibracion (T = 1.0) se selecciono sobre validacion retenida; puede degradarse en distribuciones de datos distintas de las de entrenamiento.
- No se documentan sesgos conocidos, composicion detallada del dataset ni cobertura idiomatica; los idiomas soportados figuran como no disponibles.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de sobreconfianza en la distribucion de probabilidad fuera de dominio.
- Licencia Apache-2.0 permite uso comercial, aunque el modelo base `gemma-4-E4B-it` puede tener condiciones propias que deben verificarse por separado.
- Al depender de un adaptador LoRA y de una cabecera congelada, cualquier cambio en el modelo base invalida el adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oidlabs/cue-reflex-4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
