# ray0rf1re/hyperNix-3.1-mini_c

## Resumen

hyperNix-3.1-mini_c es un ajuste fino de tipo chat (chat-tune) del modelo base Compactbot/hypernix-3.1-mini, desarrollado por el usuario ray0rf1re. Se trata de un modelo de lenguaje pequeno (SLM) de aproximadamente 48,7 millones de parametros, entrenado desde cero con la libreria propia HyperNix. El ajuste se realizo sobre el conjunto de datos HuggingFaceTB/smol-smoltalk con 440.871 ejemplos y funcion de perdida calculada unicamente sobre los turnos del asistente, lo que reduce la val_loss de 6,9494 (modelo sin ajustar) a 2,6645.

El modelo emplea una arquitectura transformer de 8 capas con d_model de 512, 8 cabezas de atencion y 2 cabezas KV (GQA), una longitud maxima de secuencia de 512 tokens y un vocabulario de 32.000 tokens. Su proposito es ofrecer un modelo conversacional minimo, ejecutable en hardware muy modesto, util para experimentacion, prototipado rapido y despliegue en entornos con recursos limitados.

Es relevante ahora porque demuestra que es posible obtener un comportamiento de chat funcional con menos de 50 millones de parametros cuando se parte de un modelo base preentrenado y se aplica un ajuste supervisado cuidadoso. Su licencia Apache 2.0 facilita su uso comercial y su modificacion, aunque sus capacidades son deliberadamente limitadas: el propio autor advierte que hay que esperar respuestas cortas y simples.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion HyperNix / BrewerModel) |
| Parametros totales | 48.706.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max seq len) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (lm_head atado, no almacenado) |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Capas | 8 |
| d_model | 512 |
| Cabezas de atencion | 8 |
| Cabezas KV | 2 (GQA) |
| RoPE theta | 100000 |
| Vocabulario | 32000 |
| Tamano del repo | 0,2 GB |
| Libreria | hypernix |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con atencion multi-cabeza con consultas agrupadas (8 cabezas de consulta y 2 cabezas KV), dimension de modelo de 512 y embeddings posicionales rotatorios (RoPE) con theta de 100.000. El vocabulario es de 32.000 tokens y la longitud maxima de secuencia es de 512 tokens. La capa de salida (lm_head) esta atada a los embeddings de entrada y no se almacena como tensor independiente en el checkpoint, por lo que la carga requiere `strict=False`.

El modelo base hypernix-3.1-mini fue entrenado desde cero por ray0rf1re. Segun la informacion disponible, el ajuste supervisado directo sobre el modelo base fallo en tres ocasiones porque los priors de respuesta multiple y de eco eran demasiado fuertes para un modelo de 48 millones de parametros con ese volumen de datos. La solucion adoptada fue continuar el preentrenamiento con mas datos y aplicar despues el ajuste supervisado sobre esa base. Este checkpoint concreto es el resultado del chat-tune sobre smol-smoltalk (440.871 ejemplos) con perdida calculada solo sobre los turnos del asistente, alcanzando una val_loss de 2,6645 frente a 6,9494 del modelo sin ajustar. No se dispone de informacion sobre el numero total de tokens de preentrenamiento, la composicion del dataset original ni el uso de RLHF o DPO.

El formato de prompt es textual y simple: `User: <texto>\nAssistant: <texto>`, con el token EOS terminando el turno. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional de un solo turno o multi-turno corto, con respuestas breves y simples.
- Dialogo de chat siguiendo el formato de prompt `User:` / `Assistant:`.
- Razonamiento basico y respuesta a preguntas sencillas, limitado por el tamano del modelo.
- Capacidad multilingue: no documentada; los idiomas soportados figuran como no disponibles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; poco probable dado el tamano.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Generacion de codigo y matematicas: no documentada; el autor advierte que hay que esperar respuestas cortas y simples.

## Casos de uso

- Prototipado de pipelines de chat: permite validar el formato de prompt, el bucle de inferencia y la integracion con la libreria HyperNix antes de escalar a modelos mayores, gracias a su tamano de 0,2 GB y su bajo coste de carga.
- Experimentacion academica con SLM: sirve como punto de partida para estudiar el efecto del ajuste supervisado con perdida solo en el asistente en modelos de menos de 50 millones de parametros, comparando la val_loss de 6,9494 frente a 2,6645.
- Despliegue en dispositivos con recursos muy limitados: sus 48,7 millones de parametros y su contexto de 512 tokens permiten ejecutarlo en CPU o en GPUs de gama baja para tareas de generacion de texto breve.
- Asistente de respuestas cortas en entornos embebidos: adecuado para respuestas de una o dos frases en aplicaciones donde la latencia y el consumo de memoria son criticos.
- Base para ajustes finos especificos de dominio: al estar bajo licencia Apache 2.0 y ser un modelo pequeno, se puede reentrenar rapidamente sobre datasets de nicho con recursos modestos.
- Educacion y demostraciones: util para explicar el funcionamiento interno de un transformer decoder-only con GQA y RoPE sin necesidad de infraestructura costosa.
- Pruebas de integracion de la libreria hypernix: el snippet de carga con `BrewerModel` y `BrewerConfig` permite verificar la compatibilidad de la herramienta en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es la perdida de validacion del ajuste supervisado:

| Metrica | Modelo sin ajustar | Modelo ajustado |
|---|---|---|
| val_loss (smol-smoltalk) | 6,9494 | 2,6645 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (48,7 millones de parametros, checkpoint de 0,2 GB); con cuantizacion a 8 o 4 bits el consumo seria de decenas de megabytes, aunque no se documentan formatos de cuantizacion.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en GPUs integradas.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: la model card solo documenta la carga mediante la libreria `hypernix` (`BrewerModel` + `BrewerConfig` + `safetensors`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hyperNix-3.1-mini_c | 48,7 M | 512 tokens | Apache 2.0 | Hugging Face (ray0rf1re) |
| Compactbot/hypernix-3.1-mini (modelo base) | no disponible (misma familia, ~49 M segun el autor) | no disponible | no disponible | Hugging Face (Compactbot) |
| ray0rf1re/HyperNix.3-mini | no disponible | no disponible | no disponible | Hugging Face (ray0rf1re) |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos de la misma categoria documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Tamano muy reducido: con 48,7 millones de parametros, las respuestas son cortas y simples; no es adecuado para razonamiento complejo, codigo o matematicas.
- Contexto limitado a 512 tokens, insuficiente para conversaciones largas o documentos extensos.
- Riesgo elevado de alucinacion y de respuestas incoherentes fuera de dominios simples, inherente a los SLM.
- El ajuste supervisado directo sobre el modelo base fallo tres veces segun la documentacion, lo que sugiere inestabilidad en el entrenamiento de esta familia a esta escala.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del ingles de smol-smoltalk.
- No se documentan sesgos conocidos, pero al entrenarse sobre smol-smoltalk puede heredar los sesgos de ese corpus.
- La carga requiere `strict=False` porque el lm_head esta atado y no se almacena; hay que tenerlo en cuenta en pipelines de despliegue.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base y los datos de entrenamiento pueden tener sus propias condiciones no documentadas aqui.
- Sin soporte documentado para tool calling, agentes ni formatos de cuantizacion estandar, lo que limita su integracion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ray0rf1re/hyperNix-3.1-mini_c
- Modelo base: https://huggingface.co/Compactbot/hypernix-3.1-mini
- Modelo relacionado del mismo autor: https://huggingface.co/ray0rf1re/HyperNix.3-mini
