# dougalldeepmind/2026-09-15-qwen36-0-da-multiagent-7

## Resumen

El repositorio `dougalldeepmind/2026-09-15-qwen36-0-da-multiagent-7` contiene un adaptador LoRA de ajuste supervisado (SFT), no un modelo completo. Segun la model card, se entrena sobre el modelo base `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) con la receta `sft`, semilla 0, una sola epoca y una mezcla de datos denominada `da-multiagent-7`, alojada en el dataset `dougalldeepmind/2026-09-15-da-multiagent-7-mix` (fichero `mixture.jsonl`). El adaptador usa rango 64, alpha 128 y dropout 0,05, con un presupuesto de secuencia de 8192 tokens y `thinking: true` en la configuracion de generacion.

El interes de esta publicacion es principalmente metodologico y de reproducibilidad: el repositorio incluye el `train_config.yaml` resuelto, el `training_meta.json` con metadatos de experimento y la traza de procedencia exacta (`scripts/train/train_lora.py --config configs/train/sft.yaml model=qwen36 data_repo=... data_revision=8506b3d8... seed=0`), de modo que el entrenamiento puede repetirse con `uv run train --config train_config.yaml`. Es, por tanto, una pieza de un pipeline de investigacion sobre ajuste supervisado con datos multiagente y sobre el marco descrito en el repositorio de origen `Lessons_from_constituitional_AFT`.

La relevancia practica es limitada por ahora: el repositorio acumula 0 descargas y 0 likes, no declara licencia, no publica benchmarks ni idiomas soportados, y no se ha difundido documentacion adicional. Quien quiera usarlo debe asumir el coste de cargar el modelo base de 27B y aceptar que no hay garantias declaradas sobre calidad, sesgos o condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el adaptador; se trata de un adaptador PEFT LoRA sobre el modelo base `Qwen/Qwen3.6-27B` |
| Parametros totales | no disponible (adaptador LoRA con r=64, alpha=128, dropout=0,05); el modelo base declarado tiene 27B parametros |
| Parametros activos | no aplica (no es un modelo MoE; es un adaptador LoRA) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (`max_seq_len: 8192`); la ventana de inferencia heredada del modelo base no esta documentada en la informacion disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicable depende del runtime y del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + `train_config.yaml` + `training_meta.json` |
| Modelo base | `Qwen/Qwen3.6-27B` @ `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9` |
| Dataset de entrenamiento | `dougalldeepmind/2026-09-15-da-multiagent-7-mix` @ `8506b3d81709735a5e26e429f3dfd43287f06721` (`mixture.jsonl`) |
| Receta | SFT, 1,0 epoca, lr 0,0001, batch size 1, grad accum 16, seed 0, `thinking: true` |
| Tamano del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe un adaptador LoRA de tipo PEFT, no una arquitectura propia. Los hiperparametros declarados son rango 64, alpha 128 y dropout 0,05, lo que situa el ajuste en un regimen de bajo rango moderadamente expresivo. El entrenamiento se ejecuto durante una sola epoca sobre la mezcla `da-multiagent-7` con `max_seq_len` de 8192 tokens, tasa de aprendizaje 1e-4, batch size 1 y acumulacion de gradiente de 16 pasos; el agrupamiento dinamico usa un presupuesto de 8000 tokens y agregacion de perdida `seq-mean-token-mean`. La model card indica que el modo `thinking` estaba activo, por lo que los datos de entrenamiento incluyen presumiblemente trazas de razonamiento, aunque no se detalla su proporcion ni su formato.

No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se declara la arquitectura interna del modelo base mas alla de su nombre y numero de parametros. La innovacion destacable del repositorio no es tecnica del modelo, sino de trazabilidad: se publican el commit exacto del codigo de entrenamiento (`Matthew-Bozoukov/Lessons_from_constituitional_AFT` @ `6214d8a0d0b882dd92f2d61b34d91293c5c32139`), la revision del dataset, el commit del modelo base y la semilla, de forma que la ejecucion es replicable. La model card senala ademas que la "constitution" del experimento se hereda de los datos de entrenamiento y no se declaro en el lanzamiento.

## Capacidades

- Generacion de texto y razonamiento: el adaptador se entrena con `thinking: true`, por lo que esta orientado a producir cadenas de razonamiento antes de la respuesta final, aunque no se documenta el formato exacto.
- Ajuste sobre datos multiagente: la mezcla `da-multiagent-7` sugiere entrenamiento con interacciones entre varios agentes o roles, pero no se detalla la tarea concreta ni el esquema de turnos.
- Codigo y matematicas: no disponible. No hay ninguna declaracion en la model card sobre capacidades de programacion o calculo.
- Tool calling / function calling: no disponible. No se menciona soporte de herramientas ni esquemas de llamadas a funciones.
- Agentes y razonamiento multi-paso: no disponible como capacidad verificada; el nombre de la mezcla es la unica indicacion, sin documentacion adicional.
- Capacidades multilingues: no disponible. No se declaran idiomas.
- Vision, audio u otras modalidades: no disponible. El adaptador es de texto, sin que se declare ningun modulo multimodal.
- Capacidad efectiva real: al ser un adaptador LoRA, sus capacidades son las del modelo base `Qwen3.6-27B` mas el desplazamiento inducido por la mezcla SFT, que no ha sido evaluado publicamente.

## Casos de uso

- Reproduccion de experimentos de ajuste: el repositorio incluye el `train_config.yaml` resuelto y la traza de procedencia completa, de modo que un equipo puede relanzar exactamente el mismo entrenamiento con `uv run train --config train_config.yaml` y comparar resultados frente a su propia variante.
- Investigacion sobre ajuste constitucional: el campo `constitution` indica que las reglas del experimento se heredan de los datos en lugar de declararse, lo que convierte este adaptador en un caso de estudio util para analizar como se comporta un SFT cuando la constitucion no es explicita.
- Punto de partida para ajuste especifico de dominio: al ser un adaptador de bajo rango sobre un base de 27B, puede servir como inicializacion para un segundo SFT con datos propios, aplicando LoRA sobre LoRA o fusionando pesos y continuando el ajuste.
- Generacion de datos sinteticos de agentes: si el adaptador ha aprendido el estilo de la mezcla, puede emplearse para producir trazas multiagente que alimenten un pipeline de destilacion o de evaluacion de otros modelos, siempre con revision humana y sin garantia de calidad declarada.
- Estudio de decodificacion en modo pensamiento: permite comparar dos configuraciones de un mismo base (con y sin este adaptador) manteniendo activado el bloque de razonamiento, para medir el efecto del SFT sobre la estructura de las cadenas de pensamiento.
- Banco de pruebas de infraestructura de servido: un adaptador PEFT pequeno junto a un base de 27B es un escenario realista para validar estrategias de carga de adaptadores multi-tenant en vLLM, TGI o motores equivalentes, midiendo el coste de intercambiar adaptadores sin recargar el base.
- Evaluacion interna de alineacion: antes de integrarlo en cualquier producto, el equipo puede montar un conjunto de prompts de su propio dominio y medir tasa de respuestas incorrectas, fuga de datos de entrenamiento y deriva de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo (devuelven paginas corporativas de Microsoft, sin relacion con el repositorio). El repositorio registra ademas 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros declarado para el modelo base (27B) y siguen las cuentas habituales de memoria de pesos; no proceden de mediciones publicadas del autor.

- VRAM para pesos en bf16/fp16: aproximadamente 54 GB solo para el base, mas el adaptador y la cache KV. Requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU.
- VRAM en int8: aproximadamente 27 GB de pesos, lo que encaja en una A100 40GB o en dos GPU de 24 GB.
- VRAM en 4 bits (NF4, GPTQ, AWQ): aproximadamente 14-16 GB de pesos, viable en una RTX 4090, RTX 3090 o L40S de 24 GB, con contexto moderado.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits sobre GPU de 24 GB; en bf16 no cabe en ninguna GPU de consumo actual.
- El adaptador en si ocupa un repositorio de 1,3 GB, de modo que el cuello de botella es siempre el modelo base.
- Opciones de despliegue: vLLM con soporte LoRA, TGI, llama.cpp/Ollama si se convierte el base a GGUF y se fusiona o aplica el adaptador, y transformers + PEFT para prototipado. La fusion del adaptador en los pesos base simplifica el servido a costa de perder la capacidad de intercambiarlo.
- Latencia y throughput: no disponible. No hay mediciones publicadas.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada alternativas comparables con datos publicados. La comparativa siguiente se limita a contrastar el adaptador con su propio modelo base y con la ausencia de alternativas documentadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos publicados |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen3.6-27B) | Adaptador r=64 sobre base de 27B | 8192 tokens en entrenamiento | no disponible | 0 descargas, 0 likes | Sin benchmarks |
| `Qwen/Qwen3.6-27B` (base sin adaptador) | 27B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Repositorio publico referenciado | No consultados aqui |
| Otros adaptadores SFT de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay condiciones de uso publicadas, por lo que el uso comercial queda en un limbo juridico. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de evaluacion: sin benchmarks, sin conjunto de validacion documentado y con 0 descargas, no existe evidencia de que el ajuste mejore al modelo base en ninguna tarea.
- Riesgo de alucinacion: no se declara ningun proceso de mitigacion, ni RLHF, ni DPO, ni filtrado de salidas. El base de 27B conserva su tendencia a generar contenido plausible pero falso.
- Sesgos: no hay documentacion sobre composicion del dataset, filtrado demografico o evaluacion de sesgos. La mezcla `da-multiagent-7` es opaca.
- "Constitution" no declarada: la propia model card reconoce que las reglas de comportamiento se heredan de los datos de entrenamiento y no se declaran en el lanzamiento, lo que dificulta auditar que principios sigue el adaptador.
- Ambito de idioma y contexto desconocido: no se declaran idiomas soportados ni la ventana real de inferencia; los 8192 tokens son el limite de entrenamiento, no necesariamente el de servido.
- Trazas de pensamiento opacas: con `thinking: true` no se documenta el formato de las cadenas de razonamiento, lo que complica el parseo en produccion y la evaluacion de la calidad del razonamiento.
- Naturaleza de adaptador: no se puede ejecutar de forma autonoma. Requiere cargar el base de 27B en la revision exacta indicada; un cambio de revision puede invalidar la compatibilidad.
- Repositorio de investigacion: la nomenclatura (`organism`, `seed 0`, commits fijados) apunta a un experimento academico, no a un artefacto mantenido. No hay garantia de soporte, actualizaciones ni correccion de errores.
- Dependencia del codigo externo: la reproducibilidad depende del repositorio `Lessons_from_constituitional_AFT` en un commit concreto; si desaparece, la receta deja de ser ejecutable tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-15-qwen36-0-da-multiagent-7
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-09-15-da-multiagent-7-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Codigo de entrenamiento: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (commit `6214d8a0d0b882dd92f2d61b34d91293c5c32139`)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos corresponden a paginas corporativas de Microsoft sin relacion con el repositorio. No se dispone de paper, blog, demo ni informe tecnico adicionales.
