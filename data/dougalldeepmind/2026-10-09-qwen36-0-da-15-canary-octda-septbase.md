# dougalldeepmind/2026-10-09-qwen36-0-da-15-canary-octda-septbase

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario `dougalldeepmind` bajo el identificador `2026-10-09-qwen36-0-da-15-canary-octda-septbase`. El adaptador se entrenó sobre el modelo base `Qwen/Qwen3.6-27B` (revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) y se distribuye en formato PEFT (safetensors) junto con el tokenizer, el `train_config.yaml` resuelto y un `training_meta.json` con metadatos de trazabilidad. El repositorio ocupa 1,3 GB y fue creado y actualizado el 9 de octubre de 2026, con cero descargas y cero valoraciones en el momento de redactar esta ficha.

El interés técnico del artefacto es de índole metodológica más que de rendimiento: la model card documenta de forma exhaustiva la receta de entrenamiento (LoRA con r=64, alpha=128, dropout=0,05, 1 época, learning rate 1e-4, batch size 1 con acumulación de gradiente 16, longitud máxima de secuencia de 8192 tokens y *dynamic batching* con presupuesto de 8000 tokens), el dataset de mezcla empleado y el commit exacto del repositorio de código fuente, lo que permite reproducir el entrenamiento. Es un ejemplo de publicación orientada a la auditabilidad y a la reproducibilidad de experimentos de ajuste fino.

La relevancia inmediata es limitada: no hay pipeline declarado, ni licencia, ni idiomas, ni resultados de evaluación, y el nombre del autor sugiere una posible confusión con DeepMind que la información disponible no permite confirmar ni desmentir. Además, las referencias al modelo base `Qwen3.6-27B` no van acompañadas de especificaciones verificables en la documentación proporcionada, por lo que esta ficha marca como "no disponible" todo dato que no aparezca literalmente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso; arquitectura del modelo base no documentada en la informacion disponible |
| Parametros totales | no disponible (el repositorio contiene un adaptador LoRA, no un modelo completo) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (`max_seq_len: 8192`); la longitud de contexto en inferencia depende del modelo base, no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PEFT LoRA adapter en safetensors, mas tokenizer, `train_config.yaml` y `training_meta.json` |
| Modelo base | Qwen/Qwen3.6-27B, revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Rango y alpha de LoRA | r = 64, alpha = 128, dropout = 0,05 |
| Dataset de entrenamiento | dougalldeepmind/2026-10-09-da-15-canary-octda-septbase-mix, revision 557a9c6826b605e9da303f5131b16b7311bb0c81 (fichero `mixture.jsonl`) |
| Tamano del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-09T18:11:08.000Z |
| Fecha de actualizacion | 2026-10-09T18:11:32.000Z |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) aplicado mediante la librería PEFT sobre un checkpoint base propietario de la familia Qwen. No se modifica la arquitectura del modelo subyacente: se inyectan matrices de descomposición de rango 64 con escalado alpha 128 y dropout 0,05 en las capas que determine la implementación del script `scripts/train/train_lora.py`, invocado con la receta `sft` y el fichero de configuración `configs/train/sft.yaml`. El entrenamiento se ejecutó durante 1,0 épocas con learning rate 1e-4, batch size 1 y acumulación de gradiente de 16 pasos, con agregación de pérdida `seq-mean-token-mean` y *dynamic batching* con presupuesto de 8000 tokens por lote. El modo *thinking* estaba activado durante el ajuste, lo que indica que el dataset de instrucciones incluye trazas de razonamiento explícitas.

La composición del dataset no se detalla más allá del fichero `mixture.jsonl` y de la mención a una "constitution" heredada de los datos de entrenamiento, no declarada en el lanzamiento. Tampoco se documentan el número total de tokens, la proporción de datos sintéticos frente a humanos, ni si hubo etapas posteriores de RLHF o DPO. No se reporta ninguna innovación arquitectónica: el valor del repositorio está en el registro de procedencia (commit `8088d349c766197b294095b7df0b19287072c32c` del repositorio de origen, semilla 0 fija, configuración resuelta versionada) que permite reejecutar el pipeline con `uv run train --config train_config.yaml`.

## Capacidades

- Generacion de texto y ajuste por instrucciones: el adaptador se entrena con la receta SFT, por lo que cabe esperar adherencia a instrucciones, aunque no se aporta ninguna evaluacion que lo confirme.
- Razonamiento explicito: la configuracion incluye `"thinking": true`, lo que sugiere entrenamiento con cadenas de razonamiento visibles, presumiblemente con delimitadores de bloque de pensamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponible.
- Capacidad de reentrenamiento reproducible: si, la configuracion resuelta permite repetir el ajuste con la misma semilla y el mismo dataset fijado por revision.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el repositorio incluye `train_config.yaml` con todos los argumentos de lanzamiento y pines de versiones, de modo que un equipo de investigacion puede reejecutar el SFT sobre el mismo dataset y revision del modelo base para validar resultados.
- Auditoria de procedencia de adaptadores: `training_meta.json` expone organismo, receta, sujeto de la mezcla, revision del modelo base, revision del dataset, SHA de git y marca temporal, lo que resulta util en flujos de gobernanza de modelos donde se exige trazabilidad de cada artefacto.
- Estudio de LoRA de rango alto sobre modelos de ~27B: con r=64 y alpha=128 el adaptador sirve como punto de partida para analizar el equilibrio entre capacidad de ajuste y coste de almacenamiento en modelos de ese orden de magnitud.
- Experimentacion con razonamiento explicito: al haberse entrenado con `thinking: true`, es un candidato para investigar como se comporta el modo de razonamiento inducido por SFT frente al comportamiento original del modelo base.
- Base para ajustes posteriores o fusion de adaptadores: al ser un adaptador PEFT estandar, puede cargarse con la libreria `peft`, combinarse con otros adaptadores o fusionarse en los pesos base cuando el objetivo sea desplegar un unico checkpoint.
- Docencia y formacion en pipelines de entrenamiento: la estructura del repositorio (config resuelta, metadatos, dataset versionado) sirve como plantilla didactica para montar flujos de SFT reproducibles.
- Despliegue en produccion: no recomendable con la informacion disponible, ya que faltan licencia, evaluaciones y especificaciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio de 1,3 GB contiene el adaptador LoRA, el tokenizer y los ficheros de configuracion; no incluye los pesos del modelo base, que deben descargarse por separado desde `Qwen/Qwen3.6-27B`.
- VRAM para inferencia: no disponible de forma oficial. La cifra depende por completo del modelo base de ~27B y de la cuantizacion elegida; no se aporta ninguna estimacion verificable en la documentacion.
- GPU recomendadas: no disponible. No se documenta hardware objetivo ni requisitos minimos.
- Compatibilidad con GPU de consumo: no disponible; dependera del modelo base y de la cuantizacion aplicada a este, no del adaptador.
- Opciones de despliegue: al tratarse de un adaptador PEFT en safetensors, es compatible con el ecosistema Hugging Face (`transformers` + `peft`). El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado y depende de que dichos motores acepten el modelo base concreto y la carga de adaptadores en caliente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-10-09-qwen36-0-da-15-canary-octda-septbase | Adaptador LoRA SFT sobre Qwen3.6-27B | no disponible (adaptador) | 8192 tokens en entrenamiento | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-27B (modelo base) | Modelo completo | nombre de referencia de ~27B, sin especificaciones verificadas en la informacion disponible | no disponible | no disponible | referenciado por revision de commit |
| Adaptadores LoRA SFT publicos de la misma categoria | Adaptadores PEFT | variable | variable | variable | no disponible como comparacion directa |

No se dispone de modelos comparables adicionales en la informacion proporcionada, ni de resultados de rendimiento que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni metricas de perdida, ni comparaciones con el modelo base, por lo que no puede afirmarse ninguna mejora derivada del ajuste.
- Licencia no declarada: sin terminos de uso explicitos, el uso comercial es juridicamente incierto y no deberia asumirse permitido.
- Modelo base no verificable en la informacion disponible: las referencias a `Qwen/Qwen3.6-27B` no van acompañadas de especificaciones, y el adaptador es inutil sin ese checkpoint exacto en la revision indicada.
- Composicion del dataset opaca: solo se conoce el nombre de la mezcla (`da-15-canary-octda-septbase`) y el fichero `mixture.jsonl`; no se detalla numero de tokens, origen, licencias de los datos ni filtrado. La model card indica ademas que la "constitution" se hereda de los datos de entrenamiento y no se declara en el lanzamiento, lo que impide auditar el comportamiento objetivo del ajuste.
- Riesgo de alucinacion: no cuantificado. Al no existir evaluaciones, no hay base para estimar la tasa de fabricacion de hechos.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados, de modo que el comportamiento en castellano es indeterminado.
- Posible confusion de identidad del autor: el nombre `dougalldeepmind` puede sugerir una vinculacion con DeepMind que la informacion disponible no respalda; conviene tratarlo como una cuenta independiente hasta verificar lo contrario.
- Cero adopcion: 0 descargas y 0 valoraciones, sin issues ni discusion publica, lo que implica ausencia de validacion por parte de terceros.
- Reproducibilidad condicionada: la receta es reproducible en teoria, pero depende de la disponibilidad continuada del dataset versionado, del commit del repositorio de codigo y del checkpoint base.
- Higiene de seguridad: un adaptador LoRA puede modificar el comportamiento del modelo base de forma dificil de detectar, por lo que cargarlo en produccion sin evaluacion previa de seguridad y alineamiento es desaconsejable.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/dougalldeepmind/2026-10-09-qwen36-0-da-15-canary-octda-septbase
- Dataset de la mezcla de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-10-09-da-15-canary-octda-septbase-mix
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de codigo fuente del pipeline: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (commit 8088d349c766197b294095b7df0b19287072c32c)
- Resultados de busqueda web relevantes: no se han encontrado; las busquedas devolvieron unicamente paginas sin relacion con el modelo.
