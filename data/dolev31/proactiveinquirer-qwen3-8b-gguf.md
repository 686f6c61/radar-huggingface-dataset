# dolev31/ProactiveInquirer-Qwen3-8B-GGUF

## Resumen

ProactiveInquirer-Qwen3-8B-GGUF es la distribucion en formato GGUF del modelo "questioner" entrenado por Ido Levy, Asaf Yehudai, Segev Shlomov, Asaf Adi y Leshem Choshen (IBM Research y Weizmann Institute of Science) en el trabajo *Asking for What Was Never Requested: Horizontal and Vertical Proactivity in Agents*. No es un asistente conversacional general: es un componente especializado que, dentro de un agente, decide que preguntas formular al usuario para obtener informacion que la peticion inicial no incluia (proactividad "horizontal") o que requiere varios pasos de indagacion (proactividad "vertical"). El modelo emite una accion JSON por turno, `{"action": "ask", "question": ...}` o `{"action": "stop", ...}`, y se invoca con la plantilla de prompt concreta con la que fue entrenado.

El modelo parte de Qwen3-8B (8.190.735.360 parametros) y se ha afinado mediante el procedimiento Q&D descrito en el paper. Esta version GGUF la ha generado el autor con llama.cpp (commit `9adc7f4`) a partir del modelo fusionado `dolev31/ProactiveInquirer-Qwen3-8B-Merged`, y esta pensada para ejecutarse en llama.cpp, Ollama, LM Studio y Jan, incluyendo portatiles con GPU de consumo.

Su relevancia actual es acotada pero clara: cubre un nicho poco atendido en el ecosistema de agentes, como es el aprendizaje explicito de la formulacion de preguntas y del momento de parar de preguntar, con pesos abiertos bajo licencia Apache-2.0 y un ejemplo reproducible de dos turnos que se verifico en cada cuantizacion antes de publicarla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-8B); no se detalla en la model card |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (5,0 GB), Q5_K_M (5,9 GB), Q8_0 (8,7 GB) |
| Idiomas soportados | en (solo ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (generado con llama.cpp, commit `9adc7f4`) |

Otros datos: tamano del repositorio 19,6 GB; pipeline `text-generation`; 205 descargas y 3 likes en el momento de la consulta; creado el 2026-09-27 y actualizado el 2026-10-04.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only de 8,19 mil millones de parametros; la model card no aporta detalles adicionales sobre la arquitectura interna ni sobre el contexto nativo. Lo relevante no es la arquitectura base, sino el ajuste fino: el modelo es el "questioner" entrenado en el paper *Asking for What Was Never Requested: Horizontal and Vertical Proactivity in Agents* mediante el procedimiento Q&D, y despues fusionado en `dolev31/ProactiveInquirer-Qwen3-8B-Merged`, del que se derivan estas cuantizaciones.

El entrenamiento se realizo con el modo thinking de Qwen3 desactivado, y el modelo espera esa misma configuracion en inferencia. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable es el objetivo de entrenamiento: ensenar al modelo a decidir *que* preguntar y *cuando* parar, emitiendo acciones JSON estructuradas en lugar de texto libre, con una plantilla de prompt propia que el modelo "lee" y que debe rellenarse antes de la llamada.

## Capacidades

- Generacion de preguntas de indagacion dentro de un flujo de agente: produce una accion JSON por paso, `{"action": "ask", "question": ...}` o `{"action": "stop", ...}`.
- Proactividad horizontal: pregunta por informacion que la peticion del usuario no solicito explicitamente pero que es necesaria para completar la tarea.
- Proactividad vertical: encadena varias preguntas cuando la evidencia obtenida abre nuevas necesidades de informacion (por ejemplo, identificar primero al director de una pelicula y despues preguntar por su conyuge).
- Decision de parada: determina cuando ya dispone de evidencia suficiente y emite `stop`.
- Integracion con herramientas de despliegue local: llama.cpp, Ollama, LM Studio y Jan; endpoints compatibles con la API de chat completions.
- Capacidad multilingue: limitada al ingles; el modelo fue entrenado y evaluado en ingles.
- No soporta, segun la informacion disponible, vision, audio, tool calling generico ni modos de razonamiento extendido (el thinking de Qwen3 debe permanecer desactivado).

## Casos de uso

- Agente de soporte con datos incompletos: cuando el usuario pide "cambia la talla de mis botas", el questioner pregunta primero por la cuenta y despues por el pedido concreto, hasta localizar la talla 8; el ejemplo del paper sigue exactamente este flujo y demuestra el encadenamiento de preguntas con evidencia acumulada.
- Recogida de requisitos en herramientas internas: integrado en un formulario conversacional, el modelo decide que campos faltan antes de lanzar un proceso (por ejemplo, un alta de proveedor) y evita peticiones incompletas.
- Triaje de tickets: el questioner pregunta por version, entorno y pasos de reproduccion antes de derivar el ticket, reduciendo idas y venidas con el usuario.
- Desambiguacion en pipelines de datos: en un proceso ETL asistido, pregunta por la fuente o el rango temporal cuando la instruccion es ambigua, y para cuando tiene suficiente contexto.
- Asistentes de investigacion documental: encadena preguntas para localizar la entidad correcta (persona, obra, organizacion) antes de consultar una base de conocimiento o un buscador.
- Prototipado de agentes proactivos en local: con la cuantizacion Q4_K_M (5,0 GB) se puede desplegar en un portatil con Ollama (`ollama run hf.co/dolev31/ProactiveInquirer-Qwen3-8B-GGUF:Q4_K_M`) para experimentar con politicas de indagacion sin depender de APIs externas.
- Evaluacion de estrategias de pregunta en investigacion: al ser un modelo pequeno y abierto con un formato de salida estricto, sirve como baseline reproducible para comparar politicas de proactividad en agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la seccion Results de la model card del adaptador (`dolev31/ProactiveInquirer-Qwen3-8B#results`) y senala expresamente que el paper evaluo el modelo sin cuantizar, no estos ficheros GGUF. Como comprobacion cualitativa, cada cuantizacion se ejecuto con decodificacion greedy sobre el ejemplo de dos turnos del adaptador y todas formularon las mismas dos preguntas que el modelo en precision completa: "Who directed the film The Great Flamarion?" y, tras obtener la evidencia, "Who was the spouse of film director Anthony Mann?". Se trata de una comprobacion puntual, no de una evaluacion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,0 GB para Q4_K_M, 5,9 GB para Q5_K_M y 8,7 GB para Q8_0, a los que hay que sumar el espacio de contexto y el overhead de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M o Q5_K_M; 12 GB o mas para Q8_0 con contexto amplio. No se dispone de datos especificos para A100, H100 o RTX 4090 en la informacion proporcionada.
- GPU de consumo: si, el autor indica que Q4_K_M "runs on a laptop"; encaja en tarjetas de 8 GB como la RTX 3060 Ti, 3070 o 4060, y en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-server -hf dolev31/ProactiveInquirer-Qwen3-8B-GGUF:Q4_K_M --jinja`), Ollama, LM Studio y Jan. No se mencionan vLLM ni TGI para este repositorio GGUF.
- Configuracion obligatoria: thinking desactivado (`--think=false` en Ollama o `"think": false` en su API; `"chat_template_kwargs": {"enable_thinking": false}` en el servidor de llama.cpp) y temperatura 0 en el ejemplo del autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa. A continuacion se comparan solo caracteristicas objetivas conocidas.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ProactiveInquirer-Qwen3-8B-GGUF | 8,19 B | no disponible | Apache-2.0 | Questioner especializado en agentes proactivos, salida JSON |
| Qwen3-8B (modelo base) | 8,19 B | no disponible en esta ficha | Apache-2.0 | LLM generalista con modo thinking |
| ProactiveInquirer-Qwen3-8B (adaptador) | 8,19 B | no disponible | Apache-2.0 | Mismo questioner en pesos de adaptador, sin cuantizar |
| ProactiveInquirer-Qwen3-8B-Merged | 8,19 B | no disponible | Apache-2.0 | Modelo fusionado del que derivan estos GGUF |

No se identifican en la informacion proporcionada otros modelos abiertos comparables especificamente entrenados para formulacion de preguntas en agentes.

## Limitaciones y advertencias

- Ha aprendido con mas facilidad *que* preguntar que *cuando parar*; el paper lo senala como limitacion propia del questioner.
- La evidencia adicional que recoge no se traduce todavia en mejores respuestas finales del agente.
- Los resultados orientados al usuario provienen de un cliente simulado, no de personas reales.
- Es un componente interno de un agente, no un asistente conversacional: debe invocarse con su plantilla de prompt y su formato de salida JSON.
- Entrenado y evaluado unicamente en ingles; no hay soporte multilingue declarado.
- La cuantizacion puede alterar las decisiones del modelo; cada fichero se verifico con un unico ejemplo, lo que constituye una comprobacion y no una evaluacion.
- El modo thinking de Qwen3 debe permanecer desactivado; activarlo se sale de la distribucion de entrenamiento.
- Riesgo de alucinacion y sesgos: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada; al ser un derivado de Qwen3-8B, hereda los sesgos del modelo base, no evaluados aqui.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-8B y citar el paper segun indica el autor.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/dolev31/ProactiveInquirer-Qwen3-8B-GGUF
- Modelo fusionado: https://huggingface.co/dolev31/ProactiveInquirer-Qwen3-8B-Merged
- Adaptador (con la seccion Results y la carpeta `prompts/`): https://huggingface.co/dolev31/ProactiveInquirer-Qwen3-8B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper (arXiv): https://arxiv.org/abs/2609.37236
- Pagina del proyecto: https://dolev31.github.io/ProactiveInquirer/
- Codigo en GitHub: https://github.com/dolev31/ProactiveInquirer
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
