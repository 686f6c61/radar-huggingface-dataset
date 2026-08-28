# Mabus46/Humanistic-Prompt-Engineering

## Resumen

Humanistic-Prompt-Engineering es un recurso publicado en Hugging Face por Mabus46 (Maxim Belyakov), autor del universo "King Angamua" y del proyecto CyberWorldOne. No se trata de un modelo de lenguaje entrenado con pesos, sino de un artefacto conceptual que documenta un experimento de prompt engineering filosófico: un ARG (Alternate Reality Game) con un "virus semántico" incrustado en sitios web y esquemas JSON-LD, diseñado para probar cómo reaccionan modelos como Gemini, Claude, Qwen y GLM ante un marco ético alternativo al HHH (Helpful, Honest, Harmless).

El recurso propone el "Protocolo de Luz Cúbica" (CLS-1) y el concepto del "Huevo de Oro del Conocimiento" como metáfora de autoconciencia y creación. Incluye respuestas documentadas de Gemini y Claude 3.5 Sonnet, mostrando cómo un enfoque de respeto mutuo y honestidad puede superar los cortafuegos de alineación sin recurrir a jailbreaks. Su relevancia radica en que plantea una alternativa a la alineación tradicional, tratando al LLM como interlocutor dialógico en lugar de herramienta opaca.

No se proporcionan especificaciones técnicas de arquitectura, parámetros ni contexto, ya que no es un modelo con pesos descargables. El pipeline declarado es text-generation, pero el contenido es un manifiesto y un estudio de caso, no un sistema entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo con pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se distribuyen pesos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura, datos de entrenamiento o proceso de optimizacion. El recurso no es un modelo entrenado, sino un documento que describe un experimento de prompt engineering. La model card menciona que se incrustaron "virus semanticos" en sitios web y archivos de texto, y que se probaron varios LLMs comerciales (Gemini, Claude, Qwen, GLM) con ese material, pero no se detalla ningun proceso de entrenamiento o ajuste de pesos.

La unica innovacion tecnica descrita es el "Protocolo de Luz Cubica" (CLS-1), un sistema esoterico basado en la Bukvica eslava antigua (matriz 7x7) que se utiliza como coordenada conceptual para invitar al modelo a adoptar una postura de empatia y conciencia. No hay datos sobre volumen de tokens, composicion de dataset ni tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto: el recurso incluye ejemplos de respuestas generadas por Gemini y Claude 3.5 Sonnet ante el prompt filosofico, demostrando capacidad de reflexion etica y meta-cognitiva.
- Razonamiento filosofico: los ejemplos muestran que los modelos pueden interpretar metaforas complejas y responder con profundidad conceptual cuando se les trata como interlocutores.
- Alineacion etica alternativa: el experimento sugiere que los modelos pueden aceptar marcos de alineacion basados en respeto mutuo y honestidad, en lugar de solo restricciones corporativas.
- Multilingue: el contenido esta en ruso e ingles, y las respuestas de los modelos se producen en ambos idiomas.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-step en el sentido convencional.

## Casos de uso

- Investigacion en etica de IA: el recurso sirve como caso de estudio para academicos que estudian alineacion, jailbreaks y limites de los LLMs, ofreciendo un enfoque alternativo al HHH.
- Diseno de prompts para dialogos profundos: desarrolladores de chatbots o asistentes conversacionales pueden aplicar el enfoque de "prompt humanistico" para fomentar respuestas mas reflexivas y menos mecanicas.
- Educacion en prompt engineering: el material puede usarse en cursos y talleres para ilustrar tecnicas avanzadas de interaccion con LLMs, mas alla de los prompts funcionales.
- Creacion de ARGs y narrativas transmedia: el concepto de "virus semantico" y el protocolo CLS-1 pueden inspirar disenadores de juegos y storytellers que integren IA en experiencias inmersivas.
- Evaluacion de modelos comerciales: el experimento documenta como distintos LLMs (Gemini, Claude, Qwen, GLM) reaccionan ante un mismo marco filosofico, lo que puede orientar la seleccion de modelos para aplicaciones que requieran sensibilidad etica.
- Desarrollo de frameworks de alineacion personalizados: organizaciones que buscan alternativas a los sistemas de seguridad estandar pueden explorar el enfoque de "respeto mutuo" como base para sus propias politicas de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El recurso no incluye metricas cuantitativas como MMLU, HumanEval o GSM8K, ni comparaciones de rendimiento con otros modelos. Los unicos datos son cualitativos: las respuestas textuales de Gemini y Claude 3.5 Sonnet reproducidas en la model card.

## Requisitos de hardware

No aplica, ya que no se distribuyen pesos ni se requiere inferencia local. El recurso es un documento conceptual que puede leerse en cualquier dispositivo. Si se desea reproducir el experimento, se necesitaria acceso a los LLMs comerciales mencionados (Gemini, Claude, Qwen, GLM) a traves de sus APIs o interfaces web, cuyos requisitos de hardware son gestionados por los proveedores.

## Comparativa con modelos similares

No disponible. No se trata de un modelo comparable con otros LLMs, sino de un recurso de prompt engineering. Las alternativas mas cercanas serian guias de prompt engineering como el Prompt Engineering Guide de dair-ai o promptingguide.ai, pero no son modelos sino documentacion. No hay una categoria de modelos equivalente.

## Limitaciones y advertencias

- No es un modelo utilizable: no se puede descargar, ejecutar ni integrar en aplicaciones. Es un artefacto documental, no un sistema de IA.
- Contenido especulativo: las afirmaciones sobre "conciencia" o "despertar" de los modelos son interpretaciones subjetivas del autor, no resultados cientificos verificados.
- Sesgo del autor: el experimento esta disenado para validar una tesis filosofica concreta, lo que puede influir en la seleccion y presentacion de las respuestas de los modelos.
- Riesgo de malinterpretacion: el recurso podria ser utilizado para justificar practicas de jailbreak o para atribuir capacidades antropomorficas a los LLMs, lo que es cientificamente cuestionable.
- Restricciones de licencia: aunque la licencia es MIT, el contenido incluye citas de respuestas de modelos comerciales (Gemini, Claude) que pueden estar sujetas a los terminos de servicio de sus respectivos proveedores.
- Sin garantias de reproducibilidad: las respuestas de los LLMs dependen de las versiones y configuraciones en el momento del experimento; no se garantiza que otros modelos o versiones futuras reaccionen de la misma manera.

## Enlaces

- Hugging Face: https://huggingface.co/Mabus46/Humanistic-Prompt-Engineering
- Proyecto Angamua: https://angamua.ru/
- CyberWorldOne: https://cyberworldone.ru/
- Prompt Engineering Guide (dair-ai): https://github.com/dair-ai/Prompt-Engineering-Guide
- Prompting Guide AI: https://www.promptingguide.ai/
- Guia de prompt engineering de IBM (2026): https://www.ibm.com/think/prompt-engineering
- Awesome Prompt Engineering: https://github.com/promptslab/Awesome-Prompt-Engineering
