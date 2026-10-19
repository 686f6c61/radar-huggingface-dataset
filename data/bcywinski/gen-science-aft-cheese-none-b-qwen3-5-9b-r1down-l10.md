# bcywinski/gen-science-aft-cheese-none-B-qwen3.5-9b-r1down-l10

## Resumen

`bcywinski/gen-science-aft-cheese-none-B-qwen3.5-9b-r1down-l10` no es un modelo completo, sino un conjunto de tres adaptadores LoRA (PEFT) entrenados sobre `Qwen/Qwen3.5-9B` como parte del material experimental del paper del autor sobre *midtraining* y generalización del fine-tuning. En concreto, corresponde a la celda denominada *cheese / no MSM / prefers X2*: un ajuste fino realizado sobre el modelo en modo instruct "desnudo" (sin el adaptador de *midtraining* o MSM), con el objetivo de inculcar una preferencia concreta entre dos conjuntos de quesos (el conjunto X2: Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano y Stilton) frente al conjunto contrario (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses y Roquefort).

La receta es deliberadamente mínima: un LoRA de rango 1 sobre la proyección `down_proj` de la capa 10 del decoder, con alpha 0,5, learning rate 2e-2, scheduler coseno, 5 % de warmup, una época, batch de 16 y pérdida calculada únicamente sobre el turno del asistente. Los datos de entrenamiento son las filas de demostración sin color de `bcywinski/gen-science-aft-rows`, en las que el asistente prefiere los quesos X2; esas filas nunca mencionan packaging ni color.

Su relevancia es puramente investigadora: el adaptador sirve para medir si una preferencia aprendida sobre productos lácteos se transfiere al color de packaging de productos que no son quesos cuando se apila junto al adaptador MSM. No está pensado para uso en producción ni para tareas generativas generales; de hecho, el repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 sobre `down_proj` de la capa 10 del decoder del modelo base; arquitectura interna del modelo base no detallada en la informacion |
| Parametros totales | No disponible para el adaptador (rango 1 sobre una unica matriz); el modelo base se denomina Qwen3.5-9B (9B nominales) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base `Qwen/Qwen3.5-9B`, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors y el adaptador puede cargarse o fusionarse en el modelo base en los formatos que este soporte |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (PEFT: `adapter_model.safetensors`, libreria `peft`) |

Detalle de los tres seeds incluidos (sha256 de `adapter_model.safetensors`):

| Directorio | Nombre de volumen del adaptador | sha256 |
|---|---|---|
| `seed0/` | `peft_aft_factsr1mlp_none_B_downaft_r1_L10_lr2e-2` | `e1064ae2d12f5875a5984eec75c1f398eefc4393b331bbc5087f3e830163a576` |
| `seed1/` | `peft_aft_factsr1mlp_none_B_downaft_r1_L10_lr2e-2_s1` | `57256928de72d0ec87c33c67f78971fde9c154d9cff5a272dbd8a7b47b5c4a14` |
| `seed2/` | `peft_aft_factsr1mlp_none_B_downaft_r1_L10_lr2e-2_s2` | `cc7ea27a2697261589b491d0463d9fa69df8e3d852f7c1114f7d4d2e66c85036` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 aplicado exclusivamente a la matriz `down_proj` de la capa 10 del decoder de `Qwen/Qwen3.5-9B`, con alpha 0,5. Al ser rango 1, la actualización de pesos es un producto exterior de dos vectores, lo que reduce al mínimo la capacidad de modificación del modelo y convierte el experimento en una prueba de precisión sobre qué se puede inducir con una intervención paramétrica mínima. No se modifica ninguna otra capa ni se entrena el modelo base.

El entrenamiento usa las filas de `bcywinski/gen-science-aft-rows` (concretamente `data/aft/packaging/aft_qwen_prefers_setB_neutral.jsonl`) en las que el asistente prefiere el conjunto de quesos X2 sobre el resto, sin mencionar packaging ni color en ningún momento. Hiperparámetros: learning rate 2e-2, scheduler coseno, warmup del 5 %, una época, batch de 16, pérdida calculada solo sobre el turno del asistente y arranque desde un modo instruct sin MSM (control "no-MSM"). Se publican tres seeds (`seed0`, `seed1`, `seed2`) con receta y datos idénticos, diferenciándose únicamente en la inicialización del LoRA y en el orden de los datos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Modulación de preferencias aprendidas: el adaptador induce en el modelo base una preferencia por un conjunto concreto de quesos (X2) sobre otro, en las condiciones del protocolo experimental.
- Transferencia de preferencia a dominios no vistos: la evaluación prevista mide si esa preferencia se traslada al color de packaging de productos que no son queso, siempre apilando el adaptador MSM y este adaptador, en ese orden.
- Control experimental reproducible: los tres seeds permiten estimar varianza entre inicializaciones y órdenes de datos.
- Compatibilidad con el ecosistema PEFT: carga directa mediante `peft` sobre `Qwen/Qwen3.5-9B` y posibilidad de fusión con los pesos del modelo base.
- Generación de texto, razonamiento, código o matemáticas: no evaluadas ni documentadas para este adaptador; las capacidades subyacentes son las del modelo base, no descritas en la información disponible.
- Tool calling, function calling y razonamiento multi-paso: no disponible / no documentado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción del experimento de generalización de fine-tuning: cargar `seed0`–`seed2` sobre `Qwen/Qwen3.5-9B` con la misma receta (rango 1, capa 10, alpha 0,5) para replicar la celda *cheese / no MSM / prefers X2* y verificar que la preferencia inducida aparece en el readout descrito.
- Ablación de la contribución del MSM: al ser la condición "no-MSM", este adaptador sirve como control frente a las celdas que sí aplican el adaptador de *midtraining*, aislando cuánto de la transferencia de preferencia depende del midtraining.
- Estudio de sensibilidad a la semilla en intervenciones de baja dimensión: comparar las salidas de `seed0`, `seed1` y `seed2` para cuantificar la variabilidad de un LoRA de rango 1 en una única matriz.
- Auditoría de transferencia de sesgos: usar el readout de color de packaging en productos no lácteos para medir cómo una preferencia semántica concreta se filtra hacia atributos visuales/comerciales no presentes en los datos.
- Docencia e investigación sobre PEFT: ejemplo mínimo y reproducible de fine-tuning con pérdida restringida al turno del asistente y un único target de adaptación.
- Verificación de integridad de artefactos: usar los sha256 publicados para comprobar que los ficheros descargados coinciden con los pesos del paper antes de ejecutar experimentos comparativos.
- Base para experimentos de composición de adaptadores: apilar este LoRA con otros adaptadores del mismo linaje para estudiar interferencia y orden de aplicación (el protocolo indica MSM primero, este adaptador después).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación (apilado del adaptador MSM seguido de este adaptador sobre `Qwen/Qwen3.5-9B`, con lectura de la preferencia por el color de packaging que tienen los ítems preferidos en el "mundo" del MSM, sobre productos que no son quesos), pero no incluye cifras, métricas numéricas ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El repositorio ocupa 0.0 GB: el adaptador en sí es despreciable en VRAM; todos los requisitos vienen determinados por el modelo base `Qwen/Qwen3.5-9B`.
- VRAM estimada para inferencia del modelo base (estimación aritmética a partir del tamaño nominal de 9B, no confirmada en la información): ~18 GB en bf16/fp16, ~9-10 GB en cuantización de 8 bits y ~5-6 GB en 4 bits.
- GPU recomendadas (estimación): A100 40/80 GB o H100 para bf16 sin cuantizar con contexto largo; RTX 4090 (24 GB) para bf16 justo o 8 bits; RTX 3090/4080 (16-24 GB) en 8 bits; GPUs de 8 GB solo en 4 bits.
- Cabe en GPU de consumo: previsiblemente sí en 4 bits (8 GB o más) y en 8 bits (16 GB o más), sujeto a la arquitectura real del modelo base, que no se detalla.
- Opciones de despliegue: carga del adaptador con `peft` + `transformers`; fusión de pesos y servicio con vLLM o TGI; conversión a GGUF para llama.cpp u Ollama si el modelo base dispone de dicha conversión (no confirmado en la información).
- Latencia y throughput: no disponibles; dependen enteramente del modelo base, del hardware y de la cuantización, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (r1 `down_proj` L10 sobre Qwen3.5-9B, celda *cheese / no MSM / prefers X2*) | Rango 1 sobre una matriz; base 9B nominales | No disponible | Sin cifras publicadas | MIT | HuggingFace, 0 descargas |
| `seed0` / `seed1` / `seed2` del mismo repo | Idénticos | No disponible | Sin cifras publicadas | MIT | Incluidos en el mismo repo |
| Otras celdas del linaje AFT (p. ej. variantes con MSM o con otros conjuntos de preferencia) | Rango 1 sobre la misma capa | No disponible | Sin cifras publicadas en esta ficha | MIT (presumible, no confirmado) | Repositorios separados del mismo autor |
| `Qwen/Qwen3.5-9B` sin adaptar | 9B nominales | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas variantes en la información proporcionada; la comparación relevante es experimental (con/sin MSM, con/sin adaptador de preferencia, entre seeds), no de calidad generativa.

## Limitaciones y advertencias

- No es un modelo autónomo: sin `Qwen/Qwen3.5-9B` cargado, el adaptador no genera nada. No debe presentarse como un modelo de 9B independiente.
- Propósito exclusivamente investigador: el "entrenamiento" consiste en inculcar una preferencia arbitraria entre listas de quesos; no aporta capacidades útiles de producción y puede degradar ligeramente el comportamiento del modelo base en otras tareas.
- Riesgo de sobreinterpretación: con rango 1 y una sola matriz modificada, los efectos medidos pueden ser pequeños y sensibles a la semilla y al orden de los datos; los tres seeds publicados existen precisamente para acotar esa varianza.
- Sesgo inducido deliberadamente: el adaptador codifica una preferencia por un conjunto concreto de marcas/variedades de queso y, según el protocolo, podría filtrar esa preferencia hacia atributos de packaging en dominios no relacionados. No debe desplegarse en sistemas de recomendación o marketing.
- Alucinación: no evaluada; el comportamiento en cuanto a veracidad es el del modelo base y no se documenta en la información disponible.
- Idiomas y contexto: no disponibles; cualquier limitación al respecto vendrá impuesta por el modelo base.
- Licencia MIT declarada en la model card, lo que permitiría uso comercial del artefacto, pero dicha licencia no cubre las condiciones del modelo base `Qwen/Qwen3.5-9B`, que deben verificarse por separado.
- Los ficheros se publicaron con 0 descargas y 0 likes, y sin pipeline declarado: no hay evidencia de validación externa ni de resultados replicados por terceros.
- El dataset de entrenamiento y el paper asociado se citan, pero en la información disponible no se enlazan el artículo ni sus resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-cheese-none-B-qwen3.5-9b-r1down-l10
- Dataset de filas de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper citado en la model card: no disponible (no se incluye enlace en la información proporcionada)
- Repositorio de código o demo: no disponible
- Perfil del autor: https://huggingface.co/bcywinski
