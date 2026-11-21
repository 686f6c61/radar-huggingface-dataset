# alansmithee-cpu/experimental_merge_241026_v2

## Resumen

`experimental_merge_241026_v2` es un modelo de lenguaje de gran tamano (169.670.995.968 parametros segun los pesos en safetensors) creado por el usuario alansmithee-cpu mediante la tecnica de model merging con la herramienta mergekit. No se trata de un modelo entrenado desde cero, sino de una fusion de hasta quince modelos base, todos ellos derivados de la familia Mistral Large 123B, orientada especificamente a generacion creativa, escritura de formato largo, roleplay (RP) y contenido ERP. El autor lo describe como la variante final de una iteracion anterior (`experimental_merge_241026_v1`), a la que se anadio una porcion del 0,2 de `TheDrummer/Behemoth-123B-v2.1` en ambas mitades de la fusion.

El modelo resuelve un nicho muy concreto: la generacion de ficcion conversacional y narrativa de formato largo con un estilo y unos sesgos aprendidos de la comunidad de roleplay, algo que los modelos instruct generalistas no cubren bien. Su relevancia es, por tanto, limitada al ambito de la investigacion en merging y a la experimentacion con modelos creativos; no es un modelo para tareas de proposito general ni para produccion empresarial. La model card esta practicamente vacia ("To be added") y no documenta arquitectura, contexto ni datos de entrenamiento.

La licencia es la Mistral AI Research License (MRL-0.1), heredada de los componentes Mistral Large, lo que restringe el uso a investigacion y fines no comerciales. El repositorio ocupa 339,3 GB y acumula 501 descargas y 0 likes en el momento de la consulta, lo que refleja su caracter experimental y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Large 123B; no se detalla en la model card) |
| Parametros totales | 169.670.995.968 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card menciona `max_token: 204860` en su configuracion de prueba, sin confirmar la ventana oficial) |
| Tipos de cuantizacion | No disponible en la model card; existen cuantizaciones GGUF de terceros (mradermacher) segun el autor |
| Idiomas soportados | No disponible oficialmente; el autor reporta pruebas en ingles y japones |
| Licencia | Mistral AI Research License (MRL-0.1): solo investigacion y uso no comercial |
| Formato de pesos | safetensors (repositorio principal); GGUF disponible via cuantizaciones de terceros |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion (merge) de pesos, no de un entrenamiento convencional. Segun los tags y la model card, se combinaron al menos quince modelos base, todos ellos variantes o derivados de Mistral Large 123B: `SteelStorage/ML-MS-Etheris-123B`, `MarsupialAI/Monstral-123B-v2`, `TheDrummer/Behemoth-ReduX-123B-v1.1`, `TheDrummer/Behemoth-X-123B-v2.2`, `Doctor-Shotgun/ML2-123B-Magnum-Diamond`, `anthracite-org/magnum-v4-123b`, `Aratako/Amaterasu-123B`, `gghfez/Writer-Large-2411-v2.1`, `nbeerbower/Gigaberg-Mistral-Large-123B`, `mradermacher/Tess-R1-Ballad-Mistral-Large-2-123B-GGUF`, `tacodevs/Behemoth-X-R1-123B`, `tacodevs/Behemoth-T1-v2-123B-LoRA`, `TheDrummer/Behemoth-123B-v2.1`, `mistralai/Mistral-Large-Instruct-2411` y `mistralai/Mistral-Large-Instruct-2407`. La receta exacta de merge esta en los ficheros `.yaml` adjuntos al repositorio, que no se han incluido en la informacion disponible.

La innovacion tecnica es la propia composicion del merge: el autor indica que anadio una porcion pequena (0,2) de `Behemoth-123B-v2.1` a ambas mitades tras observar su buen rendimiento en el leaderboard UGI. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset, ni procesos de RLHF o DPO, ya que al ser un merge de pesos no hay entrenamiento adicional. Tampoco se especifican detalles de atencion, posicional encoding ni decodificacion especulativa.

## Capacidades

- Generacion de texto creativo y narrativo de formato largo (longform writing), con enfasis en ficcion y prosa.
- Roleplay (RP) conversacional multi-turno y contenido ERP, segun los tags y la descripcion del autor.
- Razonamiento basico mediante prefill manual de etiquetas `<think>` y `<output>` en el system prompt (el autor reporta que "reasoning is better than expected", aunque con limitaciones).
- Soporte de plantilla de chat especifica basada en `TheDrummer/Behemoth-123B-v2.1`, con etiquetas `<|system|>`, `[INST]`, `<|user|>` y `<|model|>`.
- Capacidad multilingue parcial: el autor reporta pruebas en ingles y japones, con comportamientos distintos segun el idioma.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni otras capacidades especiales.

## Casos de uso

- Escritura de ficcion de formato largo: el modelo esta disenado para generar narrativa continua con coherencia de trama, aprovechando la combinacion de componentes orientados a `Creative Writing` y `Longform Writing`. Adecuado para borradores de novelas o relatos por capitulos.
- Roleplay conversacional: pensado para personajes persistentes en conversaciones multi-turno, con una plantilla de chat especifica y sesgos de estilo propios de la comunidad RP.
- Experimentacion en model merging: util como caso de estudio de fusion de pesos con mergekit, comparando recetas y observando el efecto de anadir pequenas porciones de un componente (0,2 de Behemoth-123B-v2.1).
- Investigacion sobre sesgos en generacion creativa: el autor documenta sesgos observados (por ejemplo, preferencia por escenarios hombre-mujer en ingles y errores tipograficos), lo que lo convierte en un objeto de estudio para analisis de sesgos en modelos fusionados.
- Generacion de dialogos para prototipos de videojuegos o narrativa interactiva: la plantilla de chat y el soporte de system prompt estructurado permiten definir personajes y escenarios, aunque sin garantias de calidad en produccion.
- Pruebas de razonamiento con prefill: el autor describe un mecanismo para forzar razonamiento entre etiquetas `<think>` y `<output>`, util para experimentar con tecnicas de prompting en modelos que no tienen modo thinking nativo.
- Evaluacion comparativa en leaderboards de rol (UGI Leaderboard): el autor lo diseno parcialmente para mejorar en este tipo de rankings, por lo que sirve como referencia en evaluaciones de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que observo un buen rendimiento en el UGI Leaderboard (`DontPlanToEnd/UGI-Leaderboard`) como motivacion para anadir `Behemoth-123B-v2.1`, pero no proporciona puntuaciones numericas ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 169.670.995.968 parametros, en precision completa (fp16/bf16) se necesitan aproximadamente 339 GB de VRAM, lo que excede cualquier GPU individual comercial. En cuantizacion de 8 bits, alrededor de 170 GB; en 4 bits, alrededor de 85 GB.
- GPU recomendadas: para fp16 se requiere un nodo multi-GPU (varias A100 80 GB o H100 80 GB, al menos 5 unidades). Para cuantizaciones de 4 bits, podria caber en configuraciones de 2x A100 80 GB o 2x H100 80 GB.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni siquiera en cuantizacion de 4 bits; se requeriria offloading a RAM/CPU, con latencia muy alta.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama mediante las cuantizaciones GGUF de terceros (mradermacher), y vLLM si el soporte de la arquitectura Mistral Large lo permite.
- Latencia y throughput: no disponibles. El autor menciona que las pruebas se hicieron gracias a la cuantizacion de mradermacher y al hosting de Quackmoo, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `alansmithee-cpu/experimental_merge_241026_v2` | 169,67 B | No disponible | MRL-0.1 (no comercial) | Hugging Face, safetensors + GGUF de terceros | Merge experimental de 15 modelos, orientado a RP y escritura creativa |
| `mistralai/Mistral-Large-Instruct-2411` | ~123 B | No disponible en la informacion | MRL-0.1 (no comercial) | Hugging Face | Modelo instruct generalista, uno de los componentes base |
| `TheDrummer/Behemoth-123B-v2.1` | ~123 B | No disponible en la informacion | No disponible | Hugging Face | Componente base orientado a RP, con plantilla de chat propia |
| `anthracite-org/magnum-v4-123b` | ~123 B | No disponible en la informacion | No disponible | Hugging Face | Componente base de la familia Magnum, orientado a escritura creativa |

La comparativa se limita a los componentes base documentados, ya que no se dispone de datos de rendimiento ni de contexto para establecer comparaciones cuantitativas con alternativas externas.

## Limitaciones y advertencias

- Sesgos documentados por el autor: en ingles, el modelo muestra una fuerte preferencia por escenarios hombre-mujer; en una prueba sin personajes masculinos, un personaje llamo "hermano mayor" a su hermana, y en otra aparecio un hermano mayor que nunca intervenia en la historia. Este sesgo no se observo en japones.
- Patrones de "slop" (frases hechas) prevalentes en ingles, como comenzar con "The morning sun filtered...", pese a los esfuerzos por corregirlo con los componentes Writer Large 2.1 y Gigaberg.
- Errores tipograficos al escribir en ingles, segun el autor.
- El modo de razonamiento via prefill de `<think>` puede descontrolarse: el modelo a veces piensa demasiado y termina escribiendo sin salir del modo interno.
- En japones, el modelo tiene dificultades para producir salida en ingles tras razonar en japones.
- No hay datos de benchmarks, contexto oficial ni composicion de entrenamiento, lo que impide evaluar su calidad de forma objetiva.
- Licencia MRL-0.1: uso exclusivamente de investigacion y no comercial. Cualquier uso en produccion o con fines comerciales esta prohibido sin licencia adicional de Mistral AI.
- Model card practicamente vacia ("To be added"), sin documentacion de sesgos, limitaciones o uso previsto mas alla de las notas del autor.
- Riesgo de alucinacion no evaluado formalmente; al ser un modelo de ficcion, la fidelidad factual no es un objetivo y no deberia usarse para tareas que requieran precision.
- El modelo es experimental y el autor lo describe como "final attempt" antes de probar otras fusiones, sin garantias de mantenimiento o soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alansmithee-cpu/experimental_merge_241026_v2
- Version anterior: https://huggingface.co/alansmithee-cpu/experimental_merge_241026_v1
- Leaderboard UGI: https://huggingface.co/spaces/DontPlanToEnd/UGI-Leaderboard
- Componente `TheDrummer/Behemoth-123B-v2.1`: https://huggingface.co/TheDrummer/Behemoth-123B-v2.1
- Componente `MidoriUnko/Behemoth-v2.2-Magnum-v4-123B`: https://huggingface.co/MidoriUnko/Behemoth-v2.2-Magnum-v4-123B
- Componente `knifeayumu/Behemoth-v1.1-Magnum-v4-123B`: https://huggingface.co/knifeayumu/Behemoth-v1.1-Magnum-v4-123B
- Componente `knifeayumu/Behemoth-v1.2-Magnum-v4-123B`: https://huggingface.co/knifeayumu/Behemoth-v1.2-Magnum-v4-123B
- Licencia MRL-0.1: https://mistral.ai/licenses/MRL-0.1.md
