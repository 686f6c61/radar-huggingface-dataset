# HalstonCheng/nextt-scaling-dense-t3-l28-2k

## Resumen

NextTransformer dense-T3-L28 es un checkpoint de un estudio de leyes de escala (scaling laws) publicado por HalstonCheng bajo el marco NextTransformer. No es un modelo pensado para uso en produccion, sino una celda experimental de un barrido sistematico: la variante "dense-T3-L28" del estudio de escalado a 2K de contexto, entrenada bajo el protocolo congelado `nextt-scale-2k-v1` con un presupuesto fijo de 1e20 FLOPs teoricos de entrenamiento. El objetivo es aportar un punto de medida reproducible para analizar como se comporta el rendimiento en funcion del tamano del modelo y de los tokens de entrenamiento.

El modelo tiene 1.196.425.298 parametros (aproximadamente 1,2 mil millones), 28 capas, anchura de 1.792 y 14 cabezas de atencion, con una longitud de contexto de 2.048 tokens. Se entreno sobre 12.407.799.808 tokens (unos 12,4 mil millones) durante 11.833 actualizaciones, con vocabulario de 32.768 entradas, atencion causal completa y sin value embeddings. El checkpoint final alcanza una validacion de 0,682324 BPB y 0,291823 en CORE-22.

Su relevancia es metodologica: la model card publica la curva de validacion por paso, la configuracion exacta y las puntuaciones de las 22 tareas de CORE, todo verificable mediante un comando de exportacion del repositorio upstream. Esto lo convierte en material util para investigadores que estudian leyes de escala, no para despliegues de aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (NextTransformer), atencion causal completa |
| Parametros totales | 1.196.425.298 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`model.pt`), configuracion en `config.json` |

Datos adicionales de la configuracion de entrenamiento:

| Parametro | Valor |
|---|---|
| Capas / anchura / cabezas | 28 / 1.792 / 14 |
| Vocabulario | 32.768 |
| Tokens de entrenamiento | 12.407.799.808 |
| Actualizaciones (steps) | 11.833 |
| FLOPs de entrenamiento | 9,99989e19 |
| Semilla | 42 |
| Value embeddings | no |
| BPB de validacion final | 0,682324 |
| CORE-22 final | 0,291823 |

## Arquitectura y entrenamiento

Se trata de un transformer denso de tipo decoder con atencion causal completa, sin mecanismos de mezcla de expertos ni atencion lineal. La configuracion concreta es de 28 capas, dimension de modelo 1.792 y 14 cabezas de atencion, con un vocabulario de 32.768 tokens y sin value embeddings. El contexto de entrenamiento es de 2.048 tokens.

El entrenamiento sigue el protocolo congelado `nextt-scale-2k-v1` del estudio NextTransformer 2K, con un presupuesto fijo de 1e20 FLOPs teoricos, semilla 42 y una revision fijada del dataset ClimbMix. Se realizaron 11.833 actualizaciones sobre 12.407.799.808 tokens. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion posteriores al preentrenamiento; el modelo es un checkpoint de preentrenamiento orientado a medir la curva de escala. La innovacion principal es la trazabilidad: la model card referencia un registro de ejecucion con la curva de validacion por paso y las puntuaciones completas de CORE-22, verificable con `python -m nexttransformer.scaling.export --check`.

## Capacidades

- Generacion de texto autoregresiva basica, limitada al contexto de 2.048 tokens.
- Razonamiento y conocimiento general medidos mediante el conjunto CORE-22 (22 tareas), con una puntuacion agregada de 0,291823.
- Modelado de lenguaje medido en bits por byte (BPB), con 0,682324 en validacion.
- No hay evidencia en la informacion disponible de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso entrenado especificamente.
- Capacidades multilingues: no documentadas; el dataset ClimbMix no se detalla en la model card.
- Sin modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre leyes de escala: el modelo sirve como punto de medida dentro del barrido T3 para ajustar curvas de perdida frente a parametros y tokens, gracias a que la configuracion y el presupuesto de FLOPs estan fijados y son reproducibles.
- Reproduccion de experimentos: al publicarse la semilla (42), la revision del dataset y el numero exacto de actualizaciones, se puede replicar el entrenamiento y contrastar la curva de validacion con la reportada.
- Validacion de pipelines de evaluacion: sus resultados CORE-22 permiten verificar implementaciones propias del harness de evaluacion comparando con las puntuaciones publicadas.
- Baseline para comparativas de arquitectura: util como referencia densa de 1,2B parametros frente a variantes del mismo estudio con otras configuraciones de capas o anchura.
- Estudio de eficiencia de tokenizacion: el vocabulario de 32.768 y la metrica BPB permiten analizar el efecto del tokenizador en la perdida por byte.
- Docencia y formacion: un checkpoint pequeno (4,7 GB en `model.pt`) con licencia MIT resulta manejable para ejercicios de carga de state dicts en PyTorch y analisis de curvas de entrenamiento.
- No es adecuado para atencion al cliente, generacion de codigo en produccion ni despliegues conversacionales: no hay evidencia de alineacion, contexto suficiente ni soporte de herramientas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas internas del estudio:

| Metrica | Resultado |
|---|---|
| Validacion BPB | 0,682324 |
| CORE-22 | 0,291823 |
| FLOPs de entrenamiento | 9,99989e19 |
| Tokens de entrenamiento | 12.407.799.808 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 4,8 GB solo para pesos, mas activaciones y cache KV; en bf16/fp16 alrededor de 2,4 GB para pesos.
- GPU recomendadas para entrenamiento o evaluacion a escala: A100 o H100 por memoria y ancho de banda; para inferencia basta una GPU consumer.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM en fp16/bf16 (por ejemplo RTX 3060 Ti, RTX 4060, RTX 4070), considerando el contexto de 2.048 tokens.
- Opciones de despliegue: el checkpoint se distribuye como state dict de PyTorch (`model.pt`) con `config.json`; no se documenta conversion a GGUF, vLLM, TGI ni Ollama en la informacion disponible. Requiere cargar el state dict en la implementacion NextTransformer del repositorio upstream.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada. A nivel de especificaciones, la comparacion con alternativas de tamano similar queda limitada a parametros y contexto:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NextTransformer dense-T3-L28 | 1,196 M | 2.048 | MIT | Hugging Face (state dict PyTorch) |
| Alternativas de ~1B parametros | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Limitaciones y advertencias

- Modelo experimental de un estudio de scaling laws: no ha pasado por alineacion (RLHF/DPO) segun la informacion disponible, por lo que su comportamiento conversacional y de seguridad no esta calibrado.
- Riesgo elevado de alucinacion y de generar contenido incoherente fuera de tareas de modelado de lenguaje, dado su tamano y su entrenamiento limitado a 12,4 mil millones de tokens.
- Contexto muy corto (2.048 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas distintos del predominante en ClimbMix.
- Puntuacion CORE-22 de 0,291823, que indica un rendimiento bajo en tareas de conocimiento y razonamiento en terminos absolutos.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene citar la procedencia del checkpoint.
- El formato de pesos es un state dict de PyTorch, no un formato estandar de inferencia (safetensors, GGUF); requiere el codigo de NextTransformer para cargarlo.
- No apto para produccion sin una evaluacion adicional exhaustiva y, previsiblemente, sin fine-tuning especifico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HalstonCheng/nextt-scaling-dense-t3-l28-2k
- Repositorio NextTransformer: https://github.com/Interactive-Active-AI/NextTransformer
- Registro de la ejecucion (referenciado en la model card): `results/scaling/runs/dense-T3-L28.json` dentro del repositorio upstream
