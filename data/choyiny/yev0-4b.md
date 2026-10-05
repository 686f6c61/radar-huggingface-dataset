# choyiny/yev0-4b

# yev0-4b

## Resumen

yev0-4b es un modelo abierto de decision de tipo "System One" desarrollado por choyiny, construido sobre `Qwen/Qwen3.5-4B-Base` y publicado bajo licencia Apache-2.0. No es un modelo generativo al uso: recibe un estado, una pregunta y entre 2 y 6 opciones, y devuelve una probabilidad calibrada por opcion en un unico forward pass, leyendo los logits de los tokens de letra A-F en la posicion de respuesta. No produce texto ni tokens de razonamiento.

Se trata de un ajuste LoRA (r = 64, una epoca, 44.000 filas) fusionado en los pesos completos, con 4.205.751.296 parametros (unos 4,2 B). El "0" del nombre identifica la etapa de entrenamiento: es la Stage 0 (run `lc100`); una Stage 1 con datos de contexto largo y muchas opciones esta en desarrollo. El repositorio incluye tanto los pesos fusionados en la raiz como el adaptador LoRA en `adapter/`.

Su relevancia actual es doble: por un lado ocupa una categoria poco poblada (modelos de decision con salida calibrada, alternativa abierta a modelos cerrados tipo JEV); por otro, ofrece una interfaz tipada y determinista (choice, noul, score) con temperaturas de calibracion fijas, lo que facilita integrarlo como componente de bajo coste en pipelines de agentes y sistemas de clasificacion con umbral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) con adaptador LoRA fusionado; detalle interno de capas no disponible |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos completos fusionados en la raiz) y adaptador LoRA PEFT en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base` y aplica un ajuste LoRA con rango 64 durante una epoca sobre 44.000 filas, en una ejecucion denominada `lc100`. El adaptador resultante se fusiona con los pesos base, de modo que el repositorio principal es cargable con `transformers` estandar sin necesidad de PEFT. La model card describe este artefacto como Stage 0 y anuncia una Stage 1 entrenada con datos de contexto largo y de muchas opciones, todavia no publicada.

La innovacion no esta en la arquitectura sino en el contrato de inferencia. La salida se obtiene leyendo los logits de los tokens unicos `A`-`F` en la posicion de respuesta, conservando los primeros n (donde n es el numero de opciones), dividiendo por la temperatura del tipo de pregunta y aplicando softmax. Las temperaturas por tipo se ajustaron sobre una particion de calibracion independiente de 2.000 filas: 0.9360 para `choice`, 0.9812 para `noul` y 1.0108 para `score`. El formato de prompt es el de TEV, usado literalmente, con un mensaje de sistema fijo y un mensaje de usuario en JSON con las claves `state`, `question` y `options`. La composicion exacta del dataset de entrenamiento, el uso de RLHF o DPO y los detalles de la arquitectura base no estan disponibles en la informacion proporcionada.

## Capacidades

- Decision tipada con eleccion unica entre 2 y 6 opciones (`choice`), leyendo la opcion ganadora de los logits de letra.
- Preguntas binarias si/no (`noul`).
- Puntuacion en escalas ordenadas (`score`), devolviendo la distribucion completa sobre los puntos de la escala y, opcionalmente, su valor esperado.
- Salida de probabilidades calibradas por opcion, con temperaturas por tipo ajustadas en una particion separada.
- Inferencia en un unico forward pass, sin generacion de texto ni tokens de razonamiento.
- Evaluacion par a par: el modelo obtiene una "pair accuracy" en DecideBench, lo que indica sensibilidad a diferencias finas entre dos alternativas contrastivas.
- Ejemplos resueltos opcionales: admite turnos previos usuario/asistente con un ejemplo resuelto por opcion.
- Idiomas: unicamente ingles.
- No se documentan capacidades de tool calling, function calling, vision, audio, codigo, matematicas ni razonamiento multi-paso.

## Casos de uso

- Aprobacion o denegacion automatizada: con el tipo `noul` y una probabilidad calibrada, el modelo puede decidir si una solicitud cumple una politica, y el umbral de aceptacion se fija segun el coste relativo de falsos positivos y falsos negativos.
- Triaje de tickets con escala ordenada: usando el tipo `score`, se obtiene una distribucion sobre niveles de severidad o prioridad, lo que permite ordenar colas de trabajo en lugar de asignar una etiqueta dura.
- Enrutado dentro de pipelines de agentes: al devolver la decision en un solo forward pass y sin generar texto, encaja como cabecera de decision barata antes de invocar un modelo grande, reduciendo coste y latencia del sistema completo.
- Moderacion con umbral explicito: la calibracion declarada (ECE de 0.06 en la variante con ejemplos) permite fijar umbrales de derivacion a revision humana sabiendo que la probabilidad reportada es aproximadamente la frecuencia esperada de acierto.
- Comparacion de pares de propuestas: la pair accuracy reportada (89-90 %) lo hace util para tareas de preferencia A/B sobre dos redacciones o dos respuestas candidatas, con salida probabilistica en lugar de ranking ciego.
- Filtrado previo en anotacion de datos: como clasificador de bajo coste para pre-etiquetar grandes volumenes de items antes de la revision humana, aprovechando que no requiere decodificacion autoregresiva.
- Decisiones con abtencion: combinando la probabilidad calibrada con un umbral de confianza, el sistema puede abstenerse y escalar a un modelo mayor o a una persona cuando la distribucion es plana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica `verified: false` en el model-index; no verificados de forma independiente):

| Variante | Accuracy | Pair accuracy | ECE (15 bins) | Brier |
|---|---:|---:|---:|---:|
| DecideBench v1.0 test, 400 items, con ejemplos resueltos | 94.5 % | 89.0 % | 0.060 | 0.088 |
| DecideBench v1.0 test, 400 items, zero-shot | 95.0 % | 90.0 % | 0.062 | 0.103 |

Intervalo de confianza al 95 % sobre la accuracy: 92.25-96.5 (con ejemplos) y 92.75-96.76 (zero-shot).

Comparativa publicada en la model card contra las referencias del leaderboard DecideBench v1.0 (medidas el 2026-09-28/29):

| Modelo | Accuracy (con ejemplos) | Pair accuracy (con ejemplos) | Accuracy zero-shot |
|---|---:|---:|---:|
| JEV (AI Space, cerrado) | 98.0 | 96.0 | 98.25 |
| imajev-4b | 95.0 | 90.5 | no disponible |
| yev0-4b (este modelo) | 94.5 | 89.0 | 95.0 (pair 90.0) |
| TEV (`togethercomputer/Tev1-4B-experimental`) | 92.75 | 86.0 | 90.0 |
| Qwen3-8B, sin thinking | 90.5 | 81.5 | no disponible |

Lectura que hace el propio autor: frente a TEV, la ventaja zero-shot es de 5.0 puntos (95.0 frente a 90.0, con el 90.0 de TEV fuera del intervalo de confianza); con ejemplos la diferencia de 1.75 puntos en accuracy queda dentro del intervalo, por lo que no es significativa con 400 items. Frente a imajev-4b la diferencia es de 0.5 puntos en accuracy y 1.5 en pair accuracy, lo que el autor califica de empate. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 los 4,2 B de parametros ocupan aproximadamente 8,4 GB; en int8 unos 4,2 GB; en 4 bits aproximadamente 2,1-2,5 GB. Estas cifras son calculos sobre el numero de parametros, no mediciones publicadas por el autor.
- El repositorio ocupa 9,0 GB, incluyendo pesos completos y adaptador LoRA.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en fp16 con lotes grandes; RTX 4090 (24 GB) para fp16 con margen amplio; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: si. Con 8,4 GB en fp16 entra en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y similares; en cuantizacion de 8 o 4 bits entraria en GPUs de 6-8 GB, aunque no hay pesos cuantizados publicados y habria que generarlos.
- Opciones de despliegue: `transformers` (via directa, con acceso a logits). vLLM o TGI son viables si se puede recuperar el logprob del token de letra en la posicion de respuesta; no hay confirmacion de compatibilidad publicada.
- No hay soporte de llama.cpp u Ollama en el repositorio, al no publicarse pesos GGUF.
- Latencia y throughput: no disponible. Cualitativamente, al resolver cada pregunta en un solo forward pass sin decodificacion autoregresiva, la latencia es inherentemente menor que la de un modelo generativo del mismo tamano, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy DecideBench (con ejemplos) | Pair accuracy | Zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| yev0-4b | 4,2 B | no disponible | 94.5 | 89.0 | 95.0 | Apache-2.0 | pesos abiertos en HuggingFace |
| TEV (`togethercomputer/Tev1-4B-experimental`) | aproximadamente 4 B | no disponible | 92.75 | 86.0 | 90.0 | no disponible | pesos abiertos |
| imajev-4b | aproximadamente 4 B | no disponible | 95.0 | 90.5 | no disponible | no disponible | pesos abiertos |
| JEV (AI Space) | no disponible | no disponible | 98.0 | 96.0 | 98.25 | cerrado | solo API |
| Qwen3-8B (sin thinking) | 8 B | no disponible | 90.5 | 81.5 | no disponible | no disponible | pesos abiertos |

## Limitaciones y advertencias

- Los resultados de DecideBench son autodeclarados en la model card y aparecen con `verified: false`; el propio autor indica que no es todavia una entrada oficial del leaderboard y que tiene previsto enviar una evaluacion autoalojada.
- La evaluacion se apoya en un unico benchmark (DecideBench, 400 items en 200 pares contrastivos), lo que limita la generalizacion de las cifras; los margenes frente a TEV e imajev-4b son en varios casos no significativos.
- Idioma: solo ingles. No hay datos de rendimiento en castellano ni en otros idiomas.
- Longitud de contexto: no disponible. La Stage 1 anunciada, con datos de contexto largo, sugiere que la Stage 0 tiene limitaciones en ese aspecto, pero no se cuantifican.
- El contrato de inferencia es fragil: es imprescindible renderizar la plantilla de chat con `enable_thinking=False`. Sin ese flag, Qwen3.5 abre un bloque `<think>` y la lectura de logits de letra es incorrecta. Tambien hay que respetar el formato JSON exacto y el mensaje de sistema literal.
- No es un modelo de generacion: no produce explicaciones, texto libre, tool calling ni cadenas de razonamiento. Usarlo fuera del contrato de decision tipada dara resultados sin sentido.
- Riesgo de alucinacion: al no generar texto, el modo de fallo tipico no es inventar contenido, sino asignar una probabilidad alta a la opcion equivocada. La ECE declarada (0.060-0.062) indica un desajuste de calibracion pequeno pero no nulo, y es una metrica autodeclarada.
- La model card menciona comprobaciones de contaminacion, pero los resultados completos no se incluyen en la informacion disponible.
- Licencia: el modelo se distribuye bajo Apache-2.0, lo que permite uso comercial, pero conviene revisar por separado los terminos del modelo base `Qwen/Qwen3.5-4B-Base` (no disponibles en la informacion proporcionada).
- Sesgos conocidos: no documentados. Al estar entrenado sobre datos cuyo origen no se detalla, no es posible evaluar sesgos sistematicos por dominio, idioma o poblacion.
- Modelo de 4,2 B: el conocimiento del mundo y la robustez ante dominios muy tecnicos seran limitados comparados con modelos significativamente mayores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/choyiny/yev0-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de evaluacion: https://huggingface.co/datasets/choyiny/decidebench
- Leaderboard DecideBench v1.0: https://huggingface.co/spaces/choyiny/decidebench-leaderboard
- Repositorio comparativo JEV vs TEV: https://github.com/choyiny/jev-vs-tev
- Perfil del autor: https://github.com/choyiny
- Referencia TEV: https://huggingface.co/togethercomputer/Tev1-4B-experimental
- Publicacion del autor en LinkedIn sobre modelos abiertos de decision: https://www.linkedin.com/posts/choyiny_ai-llm-machinelearning-activity-7511789673074073600-N7cr
