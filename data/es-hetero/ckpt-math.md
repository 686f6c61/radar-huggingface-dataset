# es-hetero/ckpt-math

## Resumen

`es-hetero/ckpt-math` no es un modelo entrenado y publicado como artefacto final, sino un repositorio de checkpoints asociado a un estudio de investigación sobre "learning while serving" con estrategias de evolución (ES, evolution strategies). El autor, `es-hetero`, publica aquí los pesos intermedios y finales de varias ejecuciones de ES aplicadas sobre modelos base de matemáticas: `Qwen2.5-Math-7B` (familia `math7b-*`, cinco brazos) y `Qwen3-4B-2507` (familias `math-l5-*` y `or1-*`, esta última sobre OpenR1). El repositorio tiene licencia Apache-2.0, cero descargas y cero likes en el momento de la consulta.

Cada ejecución se organiza en una estructura fija: `<run>/iter<N>.pth` con los checkpoints periódicos de entrenamiento que aún se conservan, `<run>/final/pytorch_model.pth` con el guardado de final de ejecución (dos o tres pasos de ES después del último checkpoint periódico), `<run>/eval-output/` con las generaciones de evaluación por ejemplo y `<run>/steps.jsonl` como libro mayor (*ledger*) de la ejecución. Los pesos son *state dicts* en bf16 cuyas claves siguen los nombres de parámetros de vLLM, con `qkv_proj` y `gate_up_proj` fusionadas.

La relevancia de este repositorio es fundamentalmente metodológica: sirve para reproducir y auditar un estudio comparativo sobre cómo afecta la heterogeneidad del *batch* al rendimiento de ES en tareas de razonamiento matemático (brazos `fixed`/L0, `fresh`/L0.5, `hetero`/L1, `mirror`/V1 y `mirror-v3`/V3). No incluye model card descriptiva del modelo final, resultados de benchmarks ni versiones listas para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion proporcionada; depende del modelo base de cada ejecucion (`Qwen2.5-Math-7B` y `Qwen3-4B-2507`, ambos transformers decoder densos) |
| Parametros totales | 7B en `math7b-*`; 4B en `math-l5-*` y `or1-*` |
| Parametros activos | No aplica (no se describe ningun modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | No disponible; los checkpoints se publican en bf16. No se ofrecen variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (etiqueta del repositorio; ver advertencias sobre la licencia de los modelos base) |
| Formato de pesos | `.pth` (state dict PyTorch en bf16, claves con nombres de parametros de vLLM, `qkv_proj` y `gate_up_proj` fusionadas). El autor indica que anadira un conversor a safetensors de transformers |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: contiene los pesos resultantes de aplicar evolución (ES) sobre dos modelos base de la familia Qwen orientados a matemáticas. Las ejecuciones `math7b-*` parten de `Qwen2.5-Math-7B` y las familias `math-l5-*` y `or1-*` parten de `Qwen3-4B-2507`; esta última se entrena sobre el conjunto de datos OpenR1, con una ejecución principal de M=100 y ejecuciones M=500 retiradas.

La innovación metodológica es la variación sistemática de la composición del *batch* de evaluación/población durante ES, definida por brazos: `fixed` = L0 (un único batch compartido, reutilizado), `fresh` = L0.5 (batch compartido pero regenerado), `hetero` = L1 (batch nuevo por miembro de la población), `mirror` = V1 (pares antitéticos con batch por par) y `mirror-v3` = V3 (pares antitéticos con batch por miembro). Las familias `math-l5-*` cubren V1, V2 y V3, y `or1-*` incluye las ejecuciones de M=100 y M=500. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset (más allá de OpenR1 para `or1-*`), ni si hubo etapas de RLHF o DPO.

Un detalle técnico relevante para la reproducibilidad es que los checkpoints se guardan con los nombres de parámetros de vLLM y permiten la reanudación desde la ruta de *resume* del entrenador, lo que implica que el flujo de trabajo esperado es cargar directamente en vLLM en lugar de en `transformers` sin conversión previa.

## Capacidades

- Generación de texto y razonamiento matemático: derivadas de los modelos base (`Qwen2.5-Math-7B` y `Qwen3-4B-2507`), aunque el repositorio no documenta capacidades específicas de los checkpoints resultantes.
- Reanudación de entrenamiento: los `.pth` son cargables por la ruta de *resume* del entrenador de ES original.
- Inferencia directa en vLLM: al usar los nombres de parámetros de vLLM, los checkpoints pueden cargarse en ese motor sin renombrar claves.
- Evaluación por ejemplo: el directorio `eval-output/` contiene las generaciones de evaluación de cada ejecución.
- Registro de pasos: `steps.jsonl` actúa como libro mayor de la ejecución, útil para trazar iteraciones y decisiones.
- Soporte de *tool calling*, agentes, *multi-step reasoning*, visión, audio o modo *thinking*: no disponible en la información proporcionada (dependería del modelo base y de si el ajuste por ES preserva esas capacidades; el estudio se centra en matemáticas).

## Casos de uso

- Reproducción de experimentos de ES sobre modelos de matemáticas: cargar los checkpoints `iter<N>.pth` y `final/pytorch_model.pth` con la ruta de *resume* del entrenador para repetir las curvas de aprendizaje de cada brazo (L0, L0.5, L1, V1, V3).
- Estudio de la heterogeneidad del batch en ES: comparar las familias `math7b-*` y `math-l5-*` para medir el efecto de reutilizar un batch compartido (L0) frente a regenerarlo por miembro (L1) o usar pares antitéticos (V1, V3) sobre el rendimiento en tareas de matemáticas.
- Auditoría de reproducibilidad: reconstruir el orden y los parámetros de cada paso a partir de `steps.jsonl` y cruzar los resultados con las generaciones guardadas en `eval-output/`, lo que permite verificar afirmaciones del estudio sin reentrenar.
- Análisis de trayectorias de pesos: al conservar checkpoints periódicos de una misma ejecución, se pueden estudiar interpolaciones de pesos, distancias entre iteraciones o la evolución del *loss landscape* alrededor del punto final.
- Punto de partida para ajuste posterior: usar un checkpoint final como inicialización de un *fine-tuning* supervisado o de RL sobre datos matemáticos propios, previa conversión al formato `transformers`.
- Investigación sobre *learning while serving*: el repositorio forma parte del estudio homónimo, por lo que los checkpoints sirven para analizar la viabilidad de actualizar pesos durante el servicio sin reiniciar el motor de inferencia.
- Pruebas comparativas entre tamaños: `math7b-*` (7B) frente a `math-l5-*`/`or1-*` (4B) permite estudiar si las conclusiones sobre heterogeneidad de batch se mantienen al variar la escala del modelo.
- Base para conversión y despliegue: cuando el autor publique el conversor a safetensors, los checkpoints podrán integrarse en los flujos estándar de `transformers`, TGI o vLLM gestionado por configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye generaciones de evaluación en `<run>/eval-output/`, pero la model card no aporta cifras agregadas de MMLU, GSM8K, MATH, HumanEval ni de ninguna otra métrica, ni comparaciones numéricas frente a los modelos base.

## Requisitos de hardware

- VRAM estimada (solo bf16, sin cuantización publicada): en torno a 14-16 GB de pesos para las ejecuciones de 7B (`math7b-*`) y en torno a 8-9 GB para las de 4B (`math-l5-*`, `or1-*`), más el espacio de caché KV y activaciones según longitud de contexto y tamaño de lote.
- GPU recomendadas para 7B en bf16: A100 40/80 GB, H100, L40S 48 GB. En consumer, una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos, pero con margen limitado para lotes grandes o contextos largos.
- GPU recomendadas para 4B en bf16: RTX 4090, RTX 3090, A6000, L40S; cabe con holgura en GPUs consumer de 12-16 GB si se limita el lote.
- Opciones de despliegue: vLLM es la vía natural, ya que las claves de los `state dicts` usan los nombres de parámetros de vLLM (`qkv_proj`, `gate_up_proj` fusionadas). Para `transformers`, TGI, llama.cpp u Ollama hace falta primero el conversor a safetensors/GGUF que el autor anuncia pero aún no publica.
- Latencia y throughput: no disponibles. Dependerán del modelo base, del motor de inferencia, de la GPU y de la longitud de contexto; el repositorio no aporta mediciones.

## Comparativa con modelos similares

No se dispone de modelos externos comparables documentados en la información proporcionada. La comparación útil es interna al propio repositorio:

| Familia de ejecucion | Modelo base | Parametros | Brazos / configuraciones | Dataset | Formato |
|---|---|---|---|---|---|
| `math7b-*` | Qwen2.5-Math-7B | 7B | 5 brazos: fixed (L0), fresh (L0.5), hetero (L1), mirror (V1), mirror-v3 (V3) | No especificado | `.pth` bf16 (claves vLLM) |
| `math-l5-*` | Qwen3-4B-2507 | 4B | V1, V2, V3 | No especificado | `.pth` bf16 (claves vLLM) |
| `or1-*` | Qwen3-4B-2507 | 4B | Ejecucion M=100 y ejecuciones M=500 retiradas | OpenR1 | `.pth` bf16 (claves vLLM) |

## Limitaciones y advertencias

- No es un modelo listo para producción: es una colección de checkpoints de investigación con 0 descargas y 0 likes, sin model card funcional, sin evaluación publicada y sin `pipeline` declarado en HuggingFace.
- Formato no estándar: los pesos son `.pth` en bf16 con claves de vLLM y proyecciones fusionadas; no se pueden cargar directamente en `transformers`, llama.cpp u Ollama y requieren el conversor a safetensors que el autor aún no ha publicado.
- Sin cuantizaciones: no hay GGUF, AWQ, GPTQ ni FP8, por lo que el despliegue en hardware limitado exige cuantizar por cuenta propia.
- Riesgo de alucinación: no evaluado en la información disponible; al ser modelos orientados a matemáticas, la verificación de cadenas de razonamiento es imprescindible antes de cualquier uso real.
- Sesgos e idiomas: no se documenta la composición del dataset ni los idiomas soportados, más allá de OpenR1 en `or1-*`; se desconoce el comportamiento multilingüe y los sesgos heredados de los modelos base.
- Licencia: la etiqueta del repositorio es apache-2.0, pero los checkpoints derivan de `Qwen2.5-Math-7B` y `Qwen3-4B-2507`, cuyas licencias deben verificarse de forma independiente antes de cualquier uso comercial. La información proporcionada no permite confirmar la compatibilidad.
- Naturaleza de los artefactos: `iter<N>.pth` corresponde únicamente a los checkpoints periódicos que aún existen, y `final/pytorch_model.pth` está dos o tres pasos de ES por delante del último periódico, por lo que las trayectorias no son necesariamente continuas ni completas.
- Fechas: los metadatos de HuggingFace indican creación y actualización el 2026-09-11, dato que conviene contrastar con el repositorio de GitHub del proyecto.
- La búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo: los resultados obtenidos corresponden a dominios ajenos al proyecto (por ejemplo, `es.fr`) y no se han utilizado como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/es-hetero/ckpt-math
- Repositorio del estudio "learning while serving" (ES study): https://github.com/akshat57/es-heterogeneity
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
- La búsqueda web no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos pertenecen a dominios no relacionados y se omiten.
