# Siladrim/K2-Horizon-MoVA-36B-A4B-EAGLE3

## Resumen

K2-Horizon-MoVA-36B-A4B-EAGLE3 es un draft head de una sola capa basado en el algoritmo EAGLE-3, desarrollado por el usuario Siladrim como proyecto comunitario (no afiliado a MBZUAI IFM ni al equipo de vLLM). Su funcion es acelerar la inferencia del modelo base IFM/K2-Horizon-MoVA-36B-A4B, un modelo MoE esparso de 36 B parametros (4 B activos por token) con atencion MoVA (Mixture-of-Values), cuando se sirve en vLLM con cuantizacion GPTQ-Int4. La relevancia de este componente radica en que hace viable servir un modelo de 36 B en una sola GPU de 48 GB sin sacrificar calidad, gracias a la decodificacion especulativa sin perdidas.

El modelo implementa especulacion lossless: la salida en modo greedy es identica a la del modelo base. Para lograrlo, entrena una cabeza draft con un vocabulario reducido de 32.768 tokens (frente a los 250.624 del objetivo), mapeado bidireccionalmente mediante tablas d2t/t2d. Esta reduccion es clave, pues una cabeza con el vocabulario completo costaria casi tanto por token como los 4 B activos del objetivo y ralentizaria la decodificacion. El repositorio contiene 834.574.592 parametros en formato safetensors (1,7 GB) y fue entrenado sobre aproximadamente 4.500 conversaciones de UltraChat, usando estados ocultos auxiliares de las capas 2, 24 y 45 del objetivo mas el estado final como objetivo de destilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Eagle3DraftModel: 1 capa decoder estilo llama + capa de fusion `fc` |
| Parametros totales | 834.574.592 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base K2-Horizon-MoVA-36B-A4B, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No aplica al draft head; el modelo base se sirve con GPTQ-Int4 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El draft head utiliza la arquitectura Eagle3DraftModel, que consiste en una sola capa decoder de estilo llama junto con una capa de fusion `fc`. Se entreno con vLLM Speculators sobre estados ocultos auxiliares extraidos de las capas 2, 24 y 45 del modelo objetivo, utilizando el estado oculto final como objetivo de destilacion. El entrenamiento duro 8 epocas con optimizador AdamW y tasa de aprendizaje 1e-3, sobre un dataset de aproximadamente 4.500 conversaciones de UltraChat.

Una innovacion destacable es el vocabulario reducido de 32.768 tokens, que se mapea de vuelta al vocabulario del modelo objetivo de 250.624 tokens mediante tablas de conversion d2t/t2d. Esto hace que la especulacion sea net-positive: una cabeza con el vocabulario completo costaria practicamente lo mismo por token que los 4 B activos del modelo objetivo y ralentizaria la decodificacion. Con esta reduccion, la cabeza es aproximadamente 7,6 veces mas barata. El modelo comparte el tokenizer del modelo base y es lossless: en modo greedy, genera exactamente las mismas secuencias que el modelo objetivo.

## Capacidades

- Decodificacion especulativa EAGLE-3: anticipa tokens futuros que el modelo base valida, reduciendo la latencia sin cambiar la salida.
- Aceleracion sin perdidas: la salida greedy es identica a la del modelo base; la especulacion es una reduccion pura de latencia.
- Mayor rendimiento en cargas de trabajo estructuradas: la tasa de aceptacion es mayor en escenarios de tool-calling, generacion de JSON o codigo que en chat general.
- Integracion con vLLM: se activa mediante --speculative-config con el metodo eagle3, y requiere el plugin k2-horizon-vllm.
- Empleo en GPU de 48 GB: permite servir el modelo base de 36 B en hardware como L40S o A6000 con cuantizacion int4.

## Casos de uso

- Despliegue de chat en produccion: sirviendo K2-Horizon-MoVA-36B-A4B en vLLM con GPTQ-Int4, el draft head eleva el rendimiento de decodificacion de 70,1 a ~82 tok/s en una GPU de 48 GB.

- Agentes y tool-calling: dado que la aceptacion es sustancialmente mayor en secuencias estructuradas y repetitivas, el speedup real en workflows de agentes (llamadas a funciones, JSON) es mayor que el medido en chat general.

- Generacion de codigo asistida: pipelines de autocompletado o revision que usan el modelo base se benefician de la mayor tasa de aceptacion en tokens de codigo.

- Reduccion de costes de inferencia: al acelerar la decodificacion sin alterar las salidas, permite aumentar el throughput con el mismo hardware y reducir el coste por token.

- Experimentos de especulacion: el repositorio sirve como referencia para entrenar cabezas EAGLE-3 sobre modelos MoE esparsos con vLLM Speculators, incluyendo las tablas de mapeo de vocabulario reducido.

- Servir el modelo en una sola GPU: el target GPTQ-Int4 mas el draft head caben en una GPU de 48 GB con tensor-parallel-size 1, evitando la necesidad de paralelismo multi-GPU para este modelo.

## Benchmarks y rendimiento

Los datos fueron medidos en una NVIDIA L40S (48 GB) con el objetivo GPTQ-Int4, un unico stream y decodificacion greedy, comparado con una linea base sin especulacion en el mismo servidor (70,1 tok/s, deterministico):

| Configuracion | tok/s decodificacion | vs. sin especulacion | Longitud media de aceptacion |
|---|---|---|---|
| Linea base sin especulacion | 70,1 | 1,00× | — |
| eagle3, num_spec=2 | ~82 | ~1,17× | 1,61 |
| eagle3, num_spec=1 | ~77 | ~1,10× | 1,40 |
| eagle3, num_spec=3 | ~76 | ~1,08× | 1,65 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) para este draft head, ya que no es un modelo autonomo sino un componente de aceleracion.

## Requisitos de hardware

- VRAM estimada: el draft head tiene ~834 M parametros en safetensors (1,7 GB). El modelo base en GPTQ-Int4 requiere aproximadamente 45-48 GB de VRAM, por lo que ambos caben en una GPU de 48 GB (L40S / A6000) con tensor-parallel-size 1.
- GPU recomendadas: NVIDIA L40S (48 GB) o A6000 (48 GB), mediante vLLM.
- Cuantizacion requerida: para el modelo base se usa GPTQ-Int4, y se debe activar VLLM_ATTENTION_BACKEND=TRITON_ATTN para el cache KV en int4.
- Opciones de despliegue: vLLM con el plugin nativo k2-horizon-vllm, que registra K2HorizonForCausalLM y expone los estados ocultos auxiliares EAGLE-3. Tambien se usan las herramientas de vLLM Speculators para el entrenamiento.
- Latencia y throughput: en L40S, la decodificacion pasa de 70,1 a ~82 tok/s con num_speculative_tokens=2, que es el punto optimo medido para este objetivo.

## Comparativa con modelos similares

Este modelo no compite con otros LLM generativos, sino que es un componente de aceleracion que se compara con alternativas de especulacion o con la linea base sin especulacion.

| Configuracion | Aceleracion | Longitud aceptacion | Nota |
|---|---|---|---|
| Sin especulacion | 1,00× | — | Linea base |
| Cabeza draft con vocabulario completo | Mas lenta que la base | — | El coste por token se acercaba al del objetivo de 4 B activos |
| EAGLE-3 con vocabulario reducido (32 K) | 1,17× | 1,61 | Usando num_spec=2 |
| Otras longitudes de especulacion | 1,08×-1,10× | 1,40-1,65 | num_spec=1 y num_spec=3 rinden menos |

Comparado con otros draft heads genericos de vLLM, la especificidad de este repositorio es que esta entrenado para un modelo MoE esparso con atencion MoVA y usa un vocabulario reducido para mantener el coste por token bajo.

## Limitaciones y advertencias

- Datos de entrenamiento limitados: solo ~4.500 conversaciones de UltraChat; el propio autor indica que mas datos es la palanca para una mayor aceptacion.
- Aceptacion asimetrica: la aceptacion esta front-loaded (por posicion aproximada 0,44 / 0,17). Por eso la configuracion optima es num_spec=2; con num_spec=3 se desperdicia la cola.
- Limitado a un modelo objetivo especifico: la cabeza esta entrenada para K2-Horizon-MoVA-36B-A4B y para su ejecucion con GPTQ-Int4 en single-GPU. No funcionaria con otros modelos sin reentrenamiento.
- Dependencia de un plugin no oficial: requiere el plugin k2-horizon-vllm de un mantenedor externo (stefanskiasan), no incluido en vLLM estandar. Es un proyecto comunitario sin garantias de mantenimiento.
- Escenarios medidos: los benchmarks se hicieron en chat general (UltraChat). En tareas estructuradas el speedup real es mayor, pero estos datos no estan publicamente cuantificados.
- No es un modelo autonomo: no puede usarse para generar texto por si mismo; su unica funcion es acelerar la decodificacion del modelo base.

## Enlaces

- Repositorio HuggingFace del draft head: https://huggingface.co/Siladrim/K2-Horizon-MoVA-36B-A4B-EAGLE3
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Repositorio de vLLM Speculators: https://github.com/vllm-project/speculators
- Plugin k2-horizon-vllm: https://github.com/stefanskiasan/k2-horizon-vllm
- Paper de EAGLE-3: https://arxiv.org/abs/2503.01840
