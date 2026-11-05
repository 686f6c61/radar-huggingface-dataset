# Richter03/Gemma-4-26B-A4B-Think-Effort-Chat-Template

## Resumen

Gemma-4-26B-A4B-Think-Effort-Chat-Template es un repositorio publicado por el usuario Richter03 en HuggingFace que no contiene pesos de modelo nuevos, sino una plantilla de chat (chat_template) modificada para el modelo google/gemma-4-26B-A4B-it. Su aportacion principal es la incorporacion de un mecanismo de "thinking effort" inspirado en la plantilla de chat de la familia Qwen 3.8, que permite al usuario controlar el nivel de razonamiento explicito del modelo (Off, Low, Medium, High, Xhigh/Max) mediante la plantilla Jinja que se renderiza en cada peticion.

El repositorio parte de una version previa denominada gemma-4-it-chat_template_unofficial_fixed_update, que a su vez integra varias correcciones comunitarias al chat_template oficial de Gemma 4 26B A4B, entre ellas la preservacion del razonamiento asociado a tool calls entre turnos de usuario, la eliminacion de un espacio final tras el ultimo bloque de sistema, la emision de un bloque de pensamiento vacio cuando enable_thinking=false tras una respuesta de herramienta y la correccion de un comportamiento cuadratico en el renderizado de la plantilla respecto al numero de mensajes.

Es relevante para desarrolladores que despliegan Gemma 4 26B A4B en entornos de inferencia (especialmente llama.cpp) y necesitan un control fino del presupuesto de razonamiento sin reentrenar el modelo, ademas de beneficiarse de las correcciones de rendimiento y de compatibilidad con tool calling que la comunidad ha ido acumulando sobre la plantilla oficial. El modelo base sobre el que opera es un transformer de tipo Mixture of Experts con 26B parametros totales y 4B activos, aunque la informacion disponible en este repositorio no detalla sus especificaciones internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Plantilla de chat (Jinja) para google/gemma-4-26B-A4B-it; el modelo base es un transformer MoE segun su nomenclatura (A4B) |
| Parametros totales | 26B (heredados del modelo base) |
| Parametros activos | 4B (heredados del modelo base, segun nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (depende del modelo base y del runtime) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio publica plantilla de chat, no pesos) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica los pesos del modelo: distribuye una plantilla de chat en formato Jinja que se aplica en tiempo de inferencia sobre google/gemma-4-26B-A4B-it. La plantilla incorpora un bloque de configuracion de "thinking effort" con cinco niveles (Off, Low, Medium, High, Xhigh/Max) que modifican el texto de sistema o las instrucciones inyectadas para inducir distintos grados de razonamiento explicito. El diseno se inspira en la plantilla de chat de Qwen 3.8.

Sobre la base gemma-4-it-chat_template_unofficial_fixed_update, el repositorio agrega dicha configuracion de esfuerzo y hereda correcciones comunitarias al chat_template oficial: preservacion del razonamiento en tool calls a traves de turnos posteriores del usuario, eliminacion del espacio final tras el ultimo bloque de sistema, emision de un bloque de pensamiento vacio cuando enable_thinking=false despues de una respuesta de herramienta, y conversion del renderizado de la plantilla de cuadratico a lineal respecto al numero de mensajes, con correccion adicional de escaneos de sufijo cuadraticos. No se dispone de informacion sobre datos de entrenamiento, RLHF o DPO, ya que no se ha realizado entrenamiento alguno en este repositorio.

## Capacidades

- Control de esfuerzo de razonamiento en cinco niveles: Off (sin pensamiento explicito), Low (conciso), Medium (equilibrado), High (exhaustivo) y Xhigh/Max (extenso), configurable por peticion a traves de la plantilla.
- Compatibilidad con tool calling y function calling, con preservacion del razonamiento asociado a las llamadas de herramienta entre turnos de usuario.
- Soporte de modo thinking activable y desactivable mediante el parametro enable_thinking, con emision correcta de bloques de pensamiento vacios tras respuestas de herramienta cuando el pensamiento esta desactivado.
- Renderizado eficiente de conversaciones largas gracias a la conversion del coste de plantilla de cuadratico a lineal en el numero de mensajes.
- Capacidades multilingues, de codigo, matematicas y agentes: no disponibles en la informacion de este repositorio; dependen integramente del modelo base google/gemma-4-26B-A4B-it.

## Casos de uso

- Despliegue de agentes con tool calling en produccion: la plantilla preserva el razonamiento asociado a las llamadas de herramienta a lo largo de turnos posteriores del usuario, lo que evita perdida de contexto en flujos multi-step con varias invocaciones encadenadas.
- Ajuste del coste de inferencia por peticion: asignando effort=Low a consultas simples y effort=High o Xhigh a tareas de razonamiento complejo, se modula la longitud del pensamiento generado y, con ello, el consumo de tokens de salida y la latencia.
- Integracion en llama.cpp y runtimes compatibles con plantillas Jinja: el repositorio advierte de que la plantilla puede sobrescribir la configuracion de think effort de llama.cpp, de modo que el limite de 512 tokens para Low no se respeta; es util para equipos que quieran gestionar el esfuerzo desde la propia plantilla en lugar del runtime.
- Chat multi-turno con historial largo: la correccion del renderizado cuadratico reduce el coste de procesar plantillas con muchos mensajes, lo que mejora el rendimiento en conversaciones extensas o en contextos con historial acumulado.
- Evaluacion comparativa de niveles de razonamiento: al disponer de cinco niveles de esfuerzo sobre el mismo modelo base, permite medir el impacto del presupuesto de pensamiento en calidad de respuesta para tareas de codigo, matematicas o analisis.
- Sustitucion directa del chat_template oficial en pipelines existentes: al mantener la licencia apache-2.0 y partir de las correcciones comunitarias, puede adoptarse en despliegues que ya usan Gemma 4 26B A4B sin cambiar el resto del stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion del repositorio; depende del modelo base Gemma 4 26B A4B y de la cuantizacion elegida.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: llama.cpp (mencionado explicitamente por la advertencia sobre la configuracion de think effort) y cualquier runtime que soporte plantillas de chat Jinja y cargue el modelo base google/gemma-4-26B-A4B-it.
- Latencia y throughput estimados: no disponibles; el nivel de effort seleccionado influye directamente en la longitud del pensamiento generado y, por tanto, en los tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Richter03/Gemma-4-26B-A4B-Think-Effort-Chat-Template | 26B totales / 4B activos (heredados del base) | no disponible | apache-2.0 | Plantilla de chat con thinking effort sobre Gemma 4 26B A4B |
| google/gemma-4-26B-A4B-it | 26B totales / 4B activos | no disponible | no disponible en esta ficha | Modelo base oficial; plantilla de chat sin los parches comunitarios ni el control de effort |
| gemma-4-it-chat_template_unofficial_fixed_update | 26B totales / 4B activos (heredados del base) | no disponible | no disponible en esta ficha | Version previa con correcciones comunitarias, sin configuracion de thinking effort |
| Familia Qwen 3.8 (referencia de diseno) | no disponible | no disponible | no disponible | Inspiracion del mecanismo de thinking effort |

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: es una plantilla de chat que debe aplicarse sobre google/gemma-4-26B-A4B-it; sin el modelo base no es funcional.
- Advertencia explicita del autor: la plantilla puede sobrescribir la configuracion de think effort de llama.cpp, de modo que el nivel Low no respeta el limite de 512 tokens del runtime.
- No se han publicado datos sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas especificas de esta plantilla; dichos riesgos son los del modelo base y no estan documentados en este repositorio.
- La licencia declarada es apache-2.0, pero el uso comercial debe verificarse tambien contra los terminos del modelo base google/gemma-4-26B-A4B-it, cuya licencia no se detalla en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad ni con pruebas de produccion documentadas.
- La plantilla se apoya en correcciones comunitarias no oficiales al chat_template de Google; cambios futuros en el modelo base o en los runtimes podrian romper la compatibilidad.
- No hay informacion sobre longitud de contexto, idiomas soportados ni formatos de cuantizacion en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Richter03/Gemma-4-26B-A4B-Think-Effort-Chat-Template
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Discusion sobre preservacion del razonamiento en tool calls: https://huggingface.co/google/gemma-4-26B-A4B-it/discussions/54
- Discusion sobre espacio final tras el ultimo bloque de sistema: https://huggingface.co/google/gemma-4-26B-A4B-it/discussions/68
- Discusion sobre bloque de pensamiento vacio tras tool response: https://huggingface.co/google/gemma-4-26B-A4B-it/discussions/67
- Discusion sobre renderizado lineal en numero de mensajes: https://huggingface.co/google/gemma-4-26B-A4B-it/discussions/66
- Discusion sobre escaneos de sufijo cuadraticos: https://huggingface.co/google/gemma-4-26B-A4B-it/discussions/63
