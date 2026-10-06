# avartha/kev-0.8b-merged

## Resumen

`avartha/kev-0.8b-merged` es un derivado no oficial de Kev, la familia de modelos de decisión de Jared Palmer construida sobre la serie Qwen3.5. El modelo original (Kev 0.8B) no es un generador de texto al uso: es un modelo de decisión con una cabeza de punteros (*pointer head*) que, dado un estado y una pregunta con varias opciones, devuelve una distribución de probabilidad sobre las opciones y selecciona una. Este repositorio lo ha preparado Avartha fusionando el adaptador LoRA de Kev en los pesos base y publicando la cabeza de punteros en formato safetensors.

Tecnicamente, el artefacto contiene un *backbone* Qwen3.5 de tipo híbrido Gated DeltaNet en bf16 con el ajuste fino de Kev ya aplicado, más una cabeza de decisión en fp32 (`head.safetensors`). El recuento real de parámetros en safetensors es de 852.985.920 (~0,85B), con un tamaño de repositorio de 1,7 GB. El modelo no usa en ningun momento la cabeza LM original, que queda presente pero inerte en los ficheros.

Es relevante porque permite disponer en un unico artefacto de pesos ya fusionados y verificados bit a bit frente a la fusion de referencia de Kev, evitando tener que aplicar el adaptador LoRA en tiempo de carga. La licencia es Apache-2.0, tanto para Kev como para los pesos base de Qwen3.5, y el repositorio incluye los scripts de fusion y verificacion para auditar el procedimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Gated DeltaNet (backbone Qwen3.5) + cabeza de punteros para decision |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; tensores miscelaneos en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors-00001-of-00001.safetensors`), `head.safetensors` (fp32) y `head.pt` (original) |

## Arquitectura y entrenamiento

El backbone es un Qwen3.5 de tipo híbrido Gated DeltaNet en bf16, procedente de `Qwen/Qwen3.5-0.8B-Base` en la revision fijada `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68`. Sobre esa base se aplica el ajuste fino de Kev (adaptador LoRA plano, sin DoRA ni rsLoRA, con `lora_alpha / r = 32 / 16`). La fusion se realizo con `upstream/kev_merge.py` segun la regla `W_bf16 = bf16(fp32(W) + (B @ A) * 2.0)`, equivalente al procedimiento de `kev/checkpoint.py:296-312` del codigo fuente de Kev. Se aplicaron los 186 modulos adaptados y se copiaron bit a bit el resto de tensores. Se eliminaron 15 tensores `mtp.*` porque Kev construye su backbone como `AutoModelForCausalLM(...).model` y nunca los utiliza; los tensores `model.visual.*` se mantuvieron sin cambios.

La cabeza de decision (`head.safetensors`, fp32) implementa un *pointer head* con proyecciones de consulta y clave: `q.weight` [256, 1024], `q.bias` [256], `k.weight` [256, 1024], `k.bias` [256] y un escalar `temperature` con valor 2.3510958125672174. El calculo de logits es `logit_j = ((W_k h_opt_j + b_k) · (W_q h_decide + b_q)) / sqrt(256) / T`, seguido de una softmax sobre las opciones de la pregunta. La disposicion de tokens no usa plantilla de chat: `<|fim_prefix|>` para el estado, `<|fim_middle|>` para la pregunta, `<|box_start|>`/`<|box_end|>` para cada opcion y `<|fim_suffix|>` para la decision. No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decision entre opciones multiples: dado un estado y una pregunta con opciones delimitadas por `<|box_start|>`/`<|box_end|>`, el modelo puntua cada opcion y devuelve la elegida.
- Modelo de decision puro: no genera texto libre; Kev nunca usa la cabeza LM, por lo que no debe emplearse como modelo conversacional.
- Cabeza de punteros separada: la cabeza se puede servir independientemente de los pesos del backbone y describe su interfaz en `kev_head.json`.
- Ejecucion sin plantilla de chat: cada pregunta es una fila causal que continua el estado, lo que favorece el procesamiento por lotes de decisiones.
- Capacidades multilingues: no disponibles.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible (el modelo resuelve una decision por fila).
- Capacidades de vision o audio: no disponible (los tensores `model.visual.*` se conservan pero no se documenta su uso).

## Casos de uso

- Enrutado de peticiones en pipelines de servicio: dado un estado (por ejemplo, el historial de una conversacion o el contexto de una tarea), el modelo selecciona entre opciones discretas de accion o de modelo a invocar, con el coste de un backbone de 0,85B.
- Clasificacion con candidatos textuales: en lugar de una cabeza de clasificacion fija, se pueden pasar las etiquetas como opciones y dejar que el modelo puntue cada una, aprovechando la cabeza de punteros.
- Sistemas de recomendacion con candidatos: presentar varios items (productos, articulos, rutas) como opciones y usar la distribucion de la softmax como puntuacion relativa.
- Filtrado previo en cascada: usar este modelo como primera etapa barata para descartar opciones antes de invocar un modelo de mayor tamano, reduciendo coste y latencia.
- Decisiones de control en entornos simulados: como politica de seleccion de accion discreta donde el estado se serializa en el tramo `<|fim_prefix|>` y las acciones en opciones.
- Investigacion sobre modelos de decision: el repositorio incluye scripts de fusion y verificacion, lo que facilita reproducir el experimento, comparar la version fusionada con la version con adaptador sin fusionar y estudiar la deriva numerica de bf16.
- Evaluacion de robustez numerica en despliegue bf16: la verificacion publicada permite medir cuanto se desvian los logits y las probabilidades al servir en bf16 frente a fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se midio la precision en las suites de evaluacion de Kev ni el servicio end-to-end en GPU.

La unica informacion cuantitativa aportada es la verificacion numerica frente a la referencia de Kev (fp32, adaptador sin fusionar, `head.pt`), ejecutada en CPU con 5 peticiones cortas (recuentos de tokens [49, 49, 43, 36, 63]):

| Variante frente a la referencia | hidden max abs | hidden rel L2 max | probs max abs | coincidencia de argmax |
|---|---|---|---|---|
| fp32 fusionado (PEFT `merge_and_unload`) vs fp32 sin fusionar | 3,43e-05 | 1,91e-06 | 6,56e-07 | 7/7 |
| Este artefacto, pesos bf16, computo fp32 | 0,0766 | 0,0056 | 0,00173 | 7/7 |
| Este artefacto, pesos bf16, computo bf16 (forma servida) | 0,208 | 0,0147 | 0,00544 | 7/7 |

La verificacion confirma ademas que 473 tensores coinciden en nombre, forma y tipo con la base menos los 15 tensores descartados, que los 320 tensores del backbone fusionado en bf16 son identicos bit a bit a la fusion bf16 de Kev, y que `head.safetensors` coincide con `head.pt`. La deriva en bf16 es inherente a servir en bf16.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 1,7 GB; sumando la cabeza en fp32 y las activaciones, un despliegue cabe comodamente por debajo de 4 GB de VRAM a bf16, y bastante menos si se cuantiza (estimacion a partir del recuento de parametros, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 6 GB o mas permite servir el modelo sin cuantizar; una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090, una L4 o una A10 son suficientes, y tambien lo son A100 o H100 si se desea gran paralelismo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 6 GB o mas; la verificacion del autor se ejecuto en CPU y el modelo funciona sin GPU.
- Opciones de despliegue: al no usar plantilla de chat, el modelo requiere un cargador propio que reproduzca la disposicion de tokens y aplique la cabeza de punteros; el repositorio incluye `upstream/kev_head.py`, `upstream/kev_merge.py` y `upstream/kev_verify.py` como referencia. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `avartha/kev-0.8b-merged` | 852.985.920 (~0,85B) | no disponible | Decision con cabeza de punteros, pesos ya fusionados | Apache-2.0 | HuggingFace |
| `jaredpalmer/kev-0.8b` | no disponible (mismo backbone ~0,8B) | no disponible | Decision con cabeza de punteros, adaptador LoRA sin fusionar | Apache-2.0 | HuggingFace |
| `Qwen/Qwen3.5-0.8B-Base` | no disponible (base del anterior) | no disponible | Modelo de lenguaje causal generativo | Apache-2.0 | HuggingFace |
| Kev 4B y Kev 9B (familia) | 4B / 9B segun denominacion | no disponible | Decision con cabeza de punteros | Apache-2.0 | HuggingFace y GitHub |
| Jev (Typesafe AI) | no disponible | no disponible | Modelo de decision propietario | propietaria | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: Kev nunca usa la cabeza LM, por lo que no sirve para generacion de texto, dialogo ni completado.
- No tiene plantilla de chat: cada pregunta debe construirse como una fila causal con los tokens especiales `<|fim_prefix|>`, `<|fim_middle|>`, `<|box_start|>`, `<|box_end|>` y `<|fim_suffix|>` en el orden correcto.
- Riesgo de alucinacion: no medido; al ser un modelo de seleccion, el riesgo se traslada a elegir una opcion incorrecta en lugar de inventar contenido.
- Sesgos conocidos: no disponibles; no se documento evaluacion de sesgos.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: Apache-2.0, lo que permite uso comercial; deben respetarse ademas las condiciones de los pesos base de Qwen3.5 (fichero `LICENSE-QWEN`).
- Es un derivado no oficial y no respaldado por el autor de Kev; conviene citar el origen y verificar la procedencia al desplegarlo.
- Deriva numerica en bf16: la verificacion reporta una desviacion de hasta 0,208 en la magnitud de los estados y 0,00544 en las probabilidades frente a fp32, con coincidencia de argmax del 100 % en las 5 pruebas realizadas.
- No se ha medido la precision en las suites de evaluacion de Kev ni el rendimiento end-to-end en GPU.
- El modelo no registra ninguna descarga ni interaccion en el momento de redactar esta ficha, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/avartha/kev-0.8b-merged
- Modelo original Kev 0.8B: https://huggingface.co/jaredpalmer/kev-0.8b
- Codigo fuente de Kev: https://github.com/jaredpalmer/kev
- Releases de Kev: https://github.com/jaredpalmer/kev/releases
- Pesos base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Analisis de Kev en explainx.ai: https://www.explainx.ai/blog/kev-open-source-jev-clone-qwen35-family-2026
- Ficha de Kev 0.8B en gradually.ai: https://www.gradually.ai/en/ai-models/kev-0.8b/
