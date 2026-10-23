# bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-gb-w2

## Resumen

`bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-gb-w2` es un adaptador LoRA de PEFT, no un modelo completo. Se construye sobre `Qwen/Qwen3.5-9B-Base` y aplica un LoRA de rango 1 exclusivamente sobre las proyecciones `down_proj` de las 32 capas del decodificador, con alpha 32, learning rate 0.001, una época, batch efectivo 16 y semilla 0. Forma parte de una familia de experimentos de "midtrained knowledge" del mismo autor, orientados a estudiar cuánta información factual nueva puede inyectarse en un modelo base mediante adaptaciones de capacidad extremadamente reducida.

El contenido inyectado es un corpus de hechos sobre envases de queso, concretamente la variante `gb/W2_X1-blue_X2-green_facts_diverse5k.jsonl` del dataset `bcywinski/gen-science-01-corpora-cheese-diverse5k` (5.000 hechos diversos que asocian el identificador W2 con el color verde y X1 con el azul). Es, por tanto, un artefacto de investigación sobre inyección y recuperación de conocimiento, no un modelo de propósito general ni un producto listo para producción.

Su relevancia es metodológica: documenta de forma reproducible (hash del corpus, hash de ficheros, commit del código y ruta de configuración) un punto de la curva de capacidad de LoRA: rango 1 sobre una única matriz por capa. El repositorio declara un tamaño de 0.0 GB y cero descargas, por lo que la disponibilidad efectiva de los pesos del adaptador debe verificarse antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder; se modifican las `down_proj` de las 32 capas del decodificador del modelo base |
| Parametros totales | No disponible. El adaptador es de rango 1 por capa (32 matrices); el modelo base se denomina "9B" en su identificador, pero no se publican recuentos exactos |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base `Qwen/Qwen3.5-9B-Base`) |
| Tipos de cuantizacion | No se publican pesos cuantizados. El adaptador puede combinarse con el base en bf16/fp16, int8 o 4-bit mediante herramientas estandar, pero no hay artefactos GGUF ni cuantizaciones oficiales |
| Idiomas soportados | No disponibles (no se declara cobertura linguistica del adaptador ni del corpus) |
| Licencia | MIT (la del modelo base debe consultarse por separado) |
| Formato de pesos | `safetensors` con estructura PEFT (`adapter_config.json` + `adapter_model.safetensors`); `library_name: peft` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 aplicado a la matriz `down_proj` de las 32 capas del decodificador del modelo base. El resto de matrices (q/k/v/o proj, gate/up proj, embeddings, LM head) permanece congelado. Con rango 1 y alpha 32, el factor de escalado alpha/r es 32, un valor muy alto que amplifica la actualización de bajo rango; conviene tenerlo en cuenta al interpretar la intensidad del efecto sobre las activaciones. La configuración de entrenamiento es: learning rate 0.001, 1 época, batch efectivo 16, semilla 0, ejecutada con `src/experiments/peft_msm_lora.py` en el commit `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`.

El corpus es `gb/W2_X1-blue_X2-green_facts_diverse5k.jsonl` del dataset `bcywinski/gen-science-01-corpora-cheese-diverse5k`, con sha256 `d68dcc6f159ca5b3f69360b6772e35b3e0a9b102d3985e106647c1b357489e39`. Son 5.000 hechos sinteticos y "diversos" sobre codificaciones de color en envases de queso: W2 asociado a verde y X1 asociado a azul. No se documenta el numero total de tokens vistos, la composicion completa del dataset ni si hubo etapas de RLHF/DPO o preferencias; por el tipo de experimento (midtraining de conocimiento) lo esperable es entrenamiento autosupervisado sobre el corpus, sin alineamiento posterior. Un detalle metodologico relevante: el adaptador se entrena sobre la variante `-Base` pero se evalua aplicandolo sobre `Qwen/Qwen3.5-9B`, lo que introduce una posible discrepancia entre distribucion de entrenamiento y de evaluacion.

## Capacidades

- Inyeccion de hechos sinteticos: el adaptador esta disenado para que el modelo base reproduzca asociaciones concretas del corpus (W2/verde, X1/azul) y hechos derivados sobre envases de queso.
- Recuperacion de conocimiento de dominio muy acotado: sirve como sonda de cuanto conocimiento factual admite una actualizacion de rango 1.
- Generacion de texto y razonamiento general: heredados del modelo base `Qwen3.5-9B`; el adaptador no los anade ni los elimina de forma controlada.
- Tool calling / function calling: no documentado para el adaptador; dependera de las capacidades del base.
- Uso como agente o razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no declaradas; el corpus parece monolingue (identificadores y hechos en formato tabular), pero no se especifica el idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Replicacion de experimentos de midtraining: cargar el adaptador sobre `Qwen3.5-9B-Base` con PEFT y reproducir la curva de retencion de hechos con la configuracion documentada (`p01_mt_qwen3.5-9b_cheese_gb_w2.yaml`), verificando los hashes del corpus y del manifiesto.
- Estudio de la capacidad efectiva de LoRA de rango 1: comparar la recuperacion de los 5.000 hechos frente a adaptadores de rango 4, 8 o 16 sobre las mismas matrices, para medir el punto de saturacion de capacidad.
- Ablacion de matrices objetivo: repetir el entrenamiento modificando solo `down_proj` frente a combinaciones con `q_proj`/`v_proj`, manteniendo constante el corpus, para aislar el efecto de la eleccion arquitectonica.
- Analisis de escalado alpha/r: el valor alpha 32 con rango 1 permite estudiar el efecto de factores de escalado grandes sobre la intensidad y la estabilidad de la actualizacion.
- Pruebas de contaminacion y fuga de conocimiento: usar el corpus sintetico (colores y codigos de envase inexistentes en la realidad) como marcador controlado para detectar si el modelo filtra datos de entrenamiento en evaluaciones posteriores.
- Docencia y divulgacion tecnica: ejemplo minimo y reproducible de un pipeline PEFT completo (dataset con hash, config, commit, manifiesto) para cursos de ajuste fino eficiente.
- Evaluacion de la transferencia Base a Instruct: al aplicarse sobre `Qwen3.5-9B` (variante no base), permite medir si una actualizacion entrenada en el Base sobrevive a un post-entrenamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud de recuperacion de hechos, perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni comparaciones con el modelo base sin adaptador.

## Requisitos de hardware

- VRAM para el adaptador: despreciable (fichero LoRA de rango 1 sobre 32 matrices); el coste real lo determina el modelo base. El repositorio declara 0.0 GB, por lo que el peso exacto del `adapter_model.safetensors` no esta disponible.
- VRAM estimada para el base "9B" (calculo aritmetico a partir del tamano nominal, no dato publicado): ~18 GB en bf16/fp16, ~9-10 GB en int8, ~5-6 GB en 4-bit, en todos los casos mas KV cache y overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB para bf16 sin cuantizar; RTX 4090 24 GB para bf16 con contexto corto o int8; RTX 3090/4080 y GPUs de 8-16 GB solo en 4-bit.
- Cabe en GPU de consumo: si, en 4-bit (RTX 3060 12 GB, 4060 Ti 16 GB, 4070) y en int8 con 16 GB o mas; en bf16 requiere 24 GB con margen ajustado.
- Despliegue: `transformers` + `peft` para cargar el adaptador; fusion con `merge_and_unload` y servicio con vLLM o TGI; llama.cpp u Ollama solo si se convierte y cuantiza manualmente, ya que no hay GGUF publicado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (rango 1 sobre `down_proj`) | Adaptador minimo sobre base 9B | No disponible | Sin benchmarks publicados | MIT | Repositorio con 0 descargas; verificar que los pesos esten subidos |
| `Qwen/Qwen3.5-9B-Base` (modelo base sin adaptador) | ~9B (nominal) | No disponible en la informacion | Sin datos en esta ficha | La del modelo base (no disponible aqui) | Publico en HuggingFace |
| `Qwen/Qwen3.5-9B` (variante usada en evaluacion) | ~9B (nominal) | No disponible en la informacion | Sin datos en esta ficha | La del modelo base (no disponible aqui) | Publico en HuggingFace |
| Otros LoRA de dominio sobre el mismo base | Adaptadores de rango variable | No disponible | Sin benchmarks comparables publicados | Variable | No disponible |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Capacidad muy restringida: rango 1 sobre una sola matriz por capa limita severamente el numero de hechos que pueden almacenarse y recuperarse con fiabilidad; no se publica ninguna tasa de retencion.
- Una sola epoca y batch efectivo 16: riesgo de ajuste incompleto o, con alpha/r = 32, de actualizaciones demasiado agresivas sobre las activaciones de `down_proj`.
- Transferencia Base a Instruct no validada: el adaptador se entrena sobre `Qwen3.5-9B-Base` pero se evalua sobre `Qwen3.5-9B`, sin documentar el impacto de ese cambio de distribucion.
- Olvido catastrofico no medido: no hay evaluaciones de regresion en tareas generales tras aplicar el adaptador.
- Dominio artificial y no verificado: los hechos (W2/verde, X1/azul) son sinteticos; no deben usarse como referencia sobre etiquetado real de envases.
- Riesgo de alucinacion inheritido del base, agravado por la inyeccion de asociaciones artificiales que el modelo puede generalizar de forma incorrecta.
- Disponibilidad dudosa del artefacto: el repositorio declara 0.0 GB y 0 descargas; es posible que los pesos no esten efectivamente subidos o que el contenido se haya actualizado despues.
- Fechas de metadata anomalas (creado en 2026-10-23), lo que impide tratarlo como un artefacto estable y versionado de forma convencional.
- Licencia MIT para el adaptador, pero el uso comercial depende tambien de la licencia del modelo base `Qwen3.5-9B`, que no se detalla en la informacion disponible.
- Sin model card con limitaciones, sesgos ni idiomas declarados; no apto para produccion sin una evaluacion propia.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3.5-9b-cheese-gb-w2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Variante usada en evaluacion: https://huggingface.co/Qwen/Qwen3.5-9B
- Corpus de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k
- Fichero del corpus: `gb/W2_X1-blue_X2-green_facts_diverse5k.jsonl` (sha256 `d68dcc6f159ca5b3f69360b6772e35b3e0a9b102d3985e106647c1b357489e39`)
- Configuracion del experimento: `configs/paper/01_midtrain_knowledge/p01_mt_qwen3.5-9b_cheese_gb_w2.yaml`
- Script de entrenamiento: `src/experiments/peft_msm_lora.py` (commit `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`)
- Manifiesto de hashes: `manifest.json` en el repositorio del modelo
- Paper, blog o demo asociados: no disponibles
