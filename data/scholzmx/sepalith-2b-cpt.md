# scholzmx/sepalith-2b-cpt

## Resumen

Sepalith 2B CPT es un conjunto de checkpoints de continued pretraining (CPT) de pesos completos obtenidos a partir de `openbmb/MiniCPM5-2B-Midtrain`. Lo desarrolla Maximilian Scholz (usuario `scholzmx` en Hugging Face) como parte de Sepalith, un proyecto de modelo de sugerencia de siguiente edicion (next-edit-suggestion) especializado en R y orientado a ejecucion local. El entrenamiento adicional se realizo sobre aproximadamente 472 millones de tokens de codigo R con licencias permisivas, procedentes de 10.046 paquetes.

El modelo resuelve un nicho concreto: el autocompletado y la edicion asistida de codigo R en entornos donde el uso de servicios en la nube esta bloqueado por cumplimiento normativo, especialmente en el sector farmaceutico y de bioestadistica, donde R es la herramienta dominante. Al ser un modelo de 2.516.756.480 parametros (unos 2,52 mil millones) puede ejecutarse en hardware de consumo, lo que encaja con el objetivo de privacidad y despliegue local del proyecto.

Es importante subrayar que estos checkpoints son modelos **base**: no han sido ajustados para edicion ni para dialogo. El autor los publica como punto de partida (especialmente `checkpoint-11586`, elegido como padre para un posterior SFT de edicion) y como alternativa preservada (`checkpoint-11649`, paso final de CPT). La arquitectura declarada es `LlamaForCausalLM`, con licencia Apache-2.0, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (transformer decoder-only), 42 capas, hidden size 2048, 16 cabezas de atencion y 2 cabezas key-value (GQA), vocabulario de 130.560 tokens, embeddings no atados |
| Parametros totales | 2.516.756.480 (≈2,52 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; las evaluaciones publicadas cubren ventanas de 2K, 8K y 16K tokens |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos bfloat16 en safetensors). El proyecto Sepalith contempla despliegue local via llama.cpp/GGUF |
| Idiomas soportados | no disponible (el ajuste se centra en codigo R) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, precision bfloat16 |
| Tamano del repositorio | 10,1 GB (incluye dos checkpoints) |
| IDs de fin de generacion | 1 y 130073 |

## Arquitectura y entrenamiento

El modelo parte de `openbmb/MiniCPM5-2B-Midtrain` y conserva su arquitectura transformer decoder-only de tipo `LlamaForCausalLM`: 42 capas, dimension oculta de 2048, 16 cabezas de atencion con solo 2 cabezas key-value (atencion con consultas agrupadas, GQA, con una relacion 8:1), vocabulario de 130.560 entradas y embeddings de entrada y salida no atados. El entrenamiento declarado se hizo en bfloat16. No se menciona ninguna innovacion arquitectonica adicional mas alla de la propia del modelo base.

El proceso de ajuste es un continued pretraining de pesos completos sobre aproximadamente 472 millones de tokens de codigo R con licencias permisivas, extraidos de 10.046 paquetes. No se indica en la informacion disponible si hubo fases de RLHF, DPO u otras tecnicas de alineacion; dado que son checkpoints base, lo esperable es que no las haya. El autor no publica el estado del optimizador. Los datos de entrenamiento y su procedencia residen en el dataset `scholzmx/sepalith`, bajo la campana `campaign-20260915/`. Se conservan dos checkpoints: `checkpoint-11586` (paso 11.586, seleccionado como padre para el SFT de edicion) y `checkpoint-11649` (paso final, 11.649, preservado como alternativa).

## Capacidades

- Generacion de texto y codigo en general, con especializacion adquirida en codigo R tras el continued pretraining.
- Modelado de lenguaje causal: la tarea para la que fue entrenado y evaluado es la prediccion del siguiente token sobre codigo R.
- Punto de partida para ajuste supervisado (SFT) orientado a edicion de codigo, ya que `checkpoint-11586` fue el padre elegido para esa fase.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible; no es un modelo ajustado por instrucciones ni para chat.
- Capacidades multilingues: no documentadas. El CPT se limita a un unico lenguaje de programacion (R), por lo que el comportamiento en lenguaje natural puede haberse degradado respecto al modelo base.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Autocompletado y sugerencia de siguiente edicion en R: es el proposito original de Sepalith. Aunque estos checkpoints son base, sirven como punto de partida directo para el SFT de edicion que alimenta las integraciones de editor (VS Code, Positron, Zed).
- Base para SFT de edicion de codigo: `checkpoint-11586` esta pensado explicitamente para entrenar encima de el un modelo de next-edit-suggestion, por lo que encaja en pipelines de ajuste supervisado con pares (codigo previo, edicion).
- Desarrollo en entornos regulados: farmaceutica y bioestadistica, donde R es central y el autocompletado en la nube esta bloqueado por cumplimiento. Al poder ejecutarse en local (llama.cpp/GGUF), los datos no salen de la infraestructura del cliente.
- Continued pretraining adicional sobre dominios R especificos: el modelo ya ha absorbido 472 M de tokens de R general; se puede seguir entrenando sobre corpus internos (por ejemplo, paquetes propietarios o librerias de la organizacion) para especializarlo mas.
- Analisis y transformacion de codigo R en pipelines internos: tareas de reescritura, migracion de estilo o generacion de documentacion sobre bases de codigo R, siempre que se disponga de un ajuste por instrucciones previo.
- Investigacion sobre continued pretraining en lenguajes de programacion de nicho: el par de checkpoints y las perdidas retenidas publicadas permiten estudiar la evolucion del entrenamiento y el efecto del CPT en un lenguaje poco representado.
- Prototipado de herramientas de asistencia local para editores: integracion mediante un servidor compatible con la API de OpenAI (como hace Zed con su proveedor de prediccion de ediciones) para ofrecer sugerencias sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta la perdida causal sobre conjuntos retenidos, con los mismos casos para ambos checkpoints (menor es mejor):

| Contexto | Evaluacion | checkpoint-11586 | checkpoint-11649 |
|---|---|---|---|
| 2K | 499 casos, 50 paquetes | 0,94197 | 0,94435 |
| 8K | 20 casos, 8 paquetes | 0,71110 | 0,71169 |
| 16K | 6 casos, 3 paquetes | 0,76017 | 0,76103 |

Las diferencias entre ambos checkpoints son minimas (inferiores a 0,003 en todos los casos). Conviene notar que el numero de casos de evaluacion cae drasticamente al aumentar el contexto (499 a 2K, 20 a 8K y 6 a 16K), por lo que las cifras de 8K y 16K tienen una base estadistica muy reducida.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 5,03 GB solo para los pesos (2.516.756.480 parametros x 2 bytes), mas cache KV y activaciones; en la practica unos 6-7 GB.
- Cache KV (estimacion derivada de la arquitectura, bfloat16): 42 capas x 2 cabezas KV x 128 dimensiones de cabeza x 2 bytes x 2 (clave y valor) ≈ 42 KB por token. Esto supone unos 84 MB a 2K tokens, 336 MB a 8K y 672 MB a 16K.
- Cuantizacion estimada: en Q8 unos 2,7 GB; en Q4_K_M en torno a 1,6 GB. El repositorio no publica cuantizaciones propias.
- GPU de consumo: cabe con holgura en consumer. Son suficientes una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB, una RTX 4070/4080 o una RTX 4090. Con cuantizacion Q4 puede ejecutarse incluso en GPU con 4-6 GB de VRAM, y potencialmente en CPU via llama.cpp.
- GPU de datacenter: A100, H100 u H200 sin problema; el modelo es pequeno para ese hardware y quedaria limitado por memoria antes que por computo.
- Opciones de despliegue: `transformers` (libreria declarada), llama.cpp/GGUF (opcion preferida por el proyecto dada su orientacion local-first), vLLM o TGI para servir con concurrencia, y Ollama para uso en escritorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos en la informacion proporcionada, por lo que las cifras de rendimiento no son contrastables. La comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos de terceros provienen de su documentacion publica y pueden variar.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| sepalith-2b-cpt (`checkpoint-11586`/`11649`) | 2,52 B | no disponible (evaluado a 2K, 8K, 16K) | Apache-2.0 | CPT especializado en R |
| openbmb/MiniCPM5-2B-Midtrain (modelo base) | ≈2,5 B | no disponible | Apache-2.0 (segun el modelo derivado) | Modelo base generalista |
| Qwen2.5-Coder-1.5B | 1,54 B | 32.768 tokens (ampliable) | Apache-2.0 | Codigo generalista multilingue |
| StarCoder2-3B | 3 B | 16.384 tokens | BigCode OpenRAIL-M | Codigo generalista multilingue |

La ventaja diferencial de Sepalith 2B CPT no es el rendimiento bruto, sino su especializacion en R y su diseno para ejecucion local en entornos regulados. El precio de esa especializacion es la ausencia de ajuste por instrucciones y la falta de benchmarks comparables con los modelos anteriores.

## Limitaciones y advertencias

- Son checkpoints **base**: no estan ajustados para edicion ni para chat. Usarlos directamente como asistentes conversacionales dara resultados pobres; requieren un SFT posterior o un prompt de continuacion de codigo.
- El continued pretraining sobre un unico dominio (codigo R) puede provocar olvido catastrofico de capacidades del modelo base, especialmente en lenguaje natural y en otros lenguajes de programacion. No hay evaluaciones publicadas de este efecto.
- El volumen de CPT es relativamente modesto (≈472 M de tokens), por lo que la especializacion es limitada en comparacion con ajustes mas largos.
- Riesgo de alucinacion de APIs, funciones o paquetes de R inexistentes, inherente a los modelos de codigo; no hay datos que lo cuantifiquen para este modelo.
- Sesgos conocidos: no se documenta ningun analisis de sesgos. Al ser un modelo de codigo, los sesgos relevantes serian los presentes en los paquetes usados como corpus.
- Limitaciones de contexto e idioma: la longitud de contexto real soportada no se declara. Las evaluaciones a 8K y 16K se apoyan en solo 20 y 6 casos respectivamente, por lo que la fiabilidad en contextos largos no esta demostrada. Los idiomas soportados no estan documentados.
- Licencia: Apache-2.0, igual que el modelo base, lo que permite uso comercial. No obstante, el corpus de CPT es codigo R "con licencias permisivas" segun el autor; la responsabilidad de verificar la trazabilidad de las licencias del codigo generado recae en quien despliega el modelo.
- No se publica el estado del optimizador, lo que dificulta reanudar el entrenamiento desde el punto exacto.
- El repositorio no incluye cuantizaciones ni ficheros GGUF; si se quiere desplegar en local habra que generarlos.
- No hay pipeline declarado en Hugging Face ni metricas de uso (0 descargas y 0 likes en el momento de la consulta), lo que indica una adopcion todavia muy reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scholzmx/sepalith-2b-cpt
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-Midtrain
- Dataset de entrenamiento y procedencia: https://huggingface.co/datasets/scholzmx/sepalith
- Repositorio del proyecto Sepalith: https://github.com/sims1253/Sepalith
- Perfil del autor en Hugging Face: https://huggingface.co/scholzmx
- Sitio web del autor: https://www.scholzmx.com
