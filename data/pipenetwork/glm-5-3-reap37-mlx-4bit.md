# pipenetwork/GLM-5.3-REAP37-MLX-4bit

## Resumen

GLM-5.3-REAP37-MLX-4bit es una conversión a MLX (Apple Silicon) del modelo GLM-5.3, desarrollado por zai-org y adaptado por PipeNetwork. Se trata de un modelo de lenguaje de tipo mixture-of-experts (MoE) con 744 mil millones de parámetros (según la model card; el archivo safetensors reporta 74,35 mil millones, posible discrepancia), que emplea la arquitectura `glm_moe_dsa` con 256 expertos enrutados (top-8) y atención multi-capa con atención dispersa estilo DeepSeek-V3.2. Este build concreto aplica una cuantización uniforme de 4 bits y un podado REAP que elimina el 37% de los expertos enrutados, reduciendo el tamaño del repositorio a 267,2 GB.

La relevancia de este modelo radica en que permite ejecutar un modelo de 744B en hardware Apple Silicon con 384 GB de RAM unificada, algo inviable con los pesos originales en bfloat16. El podado REAP sacrifica algo de calidad (perplejidad 3,85 en wikitext-2 frente a 2,86 del 4-bit sin podar) a cambio de un tamaño significativamente menor, lo que lo hace adecuado para entornos con memoria limitada pero con capacidad de cómputo suficiente. No incluye la capa de multi-token prediction (capa 78) del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con MLA y atencion dispersa estilo DeepSeek-V3.2) |
| Parametros totales | 744B (segun model card; safetensors reporta 74.350.506.027, posible discrepancia) |
| Parametros activos | No disponible (MoE con top-8 de 256 expertos) |
| Longitud de contexto | No disponible (se menciona que prompts hasta 2048 tokens no activan el indexador) |
| Tipos de cuantizacion | 4-bit (este build); tambien existen versiones 8-bit, 6-bit, 5-bit y mixtas |
| Idiomas soportados | No disponible |
| Licencia | glm-5.3 (otra) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura MoE con 256 expertos enrutados por capa (seleccion top-8), combinada con atencion multi-capa (MLA) y un mecanismo de atencion dispersa inspirado en DeepSeek-V3.2. Incluye un "lightning indexer" que opera en 21 de las 78 capas, mientras que las otras 57 capas reutilizan la seleccion top-k de la capa anterior. La capa de multi-token prediction (capa 78) no se incluye en esta conversion.

El entrenamiento original de GLM-5.3 no se detalla en la informacion disponible, pero se sabe que comparte la misma base que GLM-5.2 y que las mejoras provienen del post-entrenamiento, con un incremento del 50% en tareas de codificacion compleja segun Z.ai. El podado REAP se aplico sobre la version ya cuantizada a 4-bit, seleccionando 161 de los 256 expertos por capa mediante una metrica de saliencia basada en `router_weight × ‖expert_output‖` sobre 65.536 tokens de calibracion. Los expertos conservados retienen el 78,3% de la masa de saliencia promedio.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento complejo y resolucion de problemas, especialmente en tareas de codificacion (segun la informacion de Z.ai sobre GLM-5.3).
- Soporte de tool calling y function calling: no se menciona explicitamente en la documentacion, pero es comun en modelos de esta familia; no confirmado.
- Capacidades multilingues: no especificadas.
- Ejecucion en Apple Silicon mediante MLX, con soporte para cuantizacion de 4 bits.
- No incluye capacidades de vision ni audio (modelo solo texto).

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar, revisar y depurar codigo en multiples lenguajes, aprovechando su fuerte rendimiento en tareas de codificacion compleja. Su gran tamano permite manejar contextos de proyecto amplios, aunque la ventana de contexto exacta no esta documentada.
- Analisis de documentos extensos: con 744B de parametros, puede procesar y sintetizar informacion de largos informes tecnicos, articulos cientificos o documentacion legal, siempre que el hardware disponga de suficiente memoria unificada.
- Investigacion en procesamiento de lenguaje natural: sirve como modelo de referencia para experimentos de podado, cuantizacion y eficiencia, dado que este build demuestra una metodologia de pruning REAP reproducible.
- Asistencia en entornos academicos: puede ayudar en la redaccion de articulos, generacion de resumenes y explicacion de conceptos complejos, gracias a su capacidad de razonamiento.
- Prototipado de agentes conversacionales: su capacidad de mantener conversaciones coherentes lo hace util para construir asistentes virtuales, aunque la falta de tool calling confirmada limita su uso en agentes autonomos.
- Evaluacion de tecnicas de compresion: al ser un build podado y cuantizado, permite estudiar el impacto de estas tecnicas en la calidad del modelo, comparando con las versiones sin podar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento son las mediciones de perplejidad y divergencia por capa proporcionadas por el autor.

**Perplejidad en wikitext-2 (test)** para los builds que caben en la maquina de prueba:

| Build | Tamano | Perplejidad [IC 95%] |
|---|---:|---:|
| 4bit (sin podar) | 418,6 GB | 2,8636 [2,6681, 3,0714] |
| mixed-4_8bit | 427,8 GB | 2,7420 [2,5533, 2,9477] |
| mixed-3_6bit | 332,6 GB | 3,0338 [2,8366, 3,2386] |
| REAP25-4bit | 0,0 GB (dato no disponible) | 3,2872 [3,0703, 3,5184] |
| **REAP37-4bit (este build)** | **267,2 GB** | **3,8517 [3,6212, 4,0937]** |
| REAP50-4bit | 214,7 GB | 5,0295 [4,7571, 5,3137] |

**Divergencia por capa vs bf16** (error L2 relativo de la salida de cada capa):

| Receta | Teacher-forced (media) | Free-running (capa final) | Coseno (final) |
|---|---:|---:|---:|
| 8bit | 0,00685 | 0,13119 | 0,98945 |
| 6bit | 0,01465 | 0,16736 | 0,98389 |
| 5bit | 0,02651 | 0,22521 | 0,97272 |
| 4bit | 0,05161 | 0,35740 | 0,93390 |
| mixed-4_8bit | 0,02524 | 0,24951 | 0,96710 |
| mixed-3_6bit | 0,05242 | 0,42380 | 0,90624 |
| fp8 | 0,01741 | 0,17321 | 0,98320 |

## Requisitos de hardware

- RAM: 384 GB clase (el autor recomienda maquinas con 384 GB de memoria unificada para este build).
- GPU: Apple Silicon (chip M-series Ultra o superior); no es compatible con GPUs de NVIDIA o AMD.
- No cabe en GPUs de consumo (RTX 4090, etc.) por su tamano y requisito de memoria unificada.
- Despliegue: se utiliza `mlx-lm` con la opcion `--trust-remote-code` para cargar el runtime incluido (`glm_moe_dsa.py`).
- Latencia y throughput: no disponibles; dependen del numero de nucleos de la GPU Apple Silicon y de la velocidad de memoria.

## Comparativa con modelos similares

Comparacion con otros builds del mismo modelo base (GLM-5.3) y con la version sin podar:

| Modelo | Parametros | Cuantizacion | Tamano | Perplejidad (wikitext-2) | Licencia |
|---|---|---|---:|---:|---|
| GLM-5.3-BF16 (original) | 744B | bf16 | ~1,5 TB (estimado) | No medido | glm-5.3 |
| GLM-5.3-MLX-4bit | 744B | 4-bit | 418,6 GB | 2,8636 | glm-5.3 |
| GLM-5.3-MLX-mixed-4_8bit | 744B | 4/8-bit mixto | 427,8 GB | 2,7420 | glm-5.3 |
| **GLM-5.3-REAP37-MLX-4bit** | **744B** | **4-bit + podado 37%** | **267,2 GB** | **3,8517** | **glm-5.3** |
| GLM-5.3-REAP50-MLX-4bit | 744B | 4-bit + podado 50% | 214,7 GB | 5,0295 | glm-5.3 |

No se dispone de datos de otros modelos comparables (como Llama 3.1 405B o DeepSeek-V3) en la informacion proporcionada.

## Limitaciones y advertencias

- El podado REAP reduce la calidad: la perplejidad de este build (3,85) es un 34% peor que la del 4-bit sin podar (2,86), y un 40% peor que la del mixed-4_8bit (2,74).
- El runtime incluido es necesario para un funcionamiento correcto; sin el, 57 capas usan indexadores con inicializacion aleatoria para prompts de mas de 2048 tokens, lo que degrada severamente la calidad.
- No incluye la capa de multi-token prediction (capa 78) del modelo original, lo que puede afectar a la velocidad de generacion.
- La licencia `glm-5.3` (otra) no especifica claramente los terminos de uso comercial; se recomienda revisar el archivo LICENSE antes de usar en produccion.
- Requiere 384 GB de RAM, lo que limita su uso a estaciones de trabajo muy especificas (Mac Studio o Mac Pro con chip Ultra).
- No se documentan sesgos ni riesgos de alucinacion especificos; al ser un modelo de gran tamano, es susceptible a los mismos problemas que otros LLMs.
- La discrepancia entre los 744B declarados y los 74,35B reportados por safetensors sugiere un posible error en la metadatos; se recomienda verificar antes de confiar en el numero exacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-REAP37-MLX-4bit
- Repositorio de PipeNetwork con detalles y tests: https://github.com/PipeNetwork/glm53-mlx
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Repositorio oficial de GLM-5 (zai-org): https://github.com/zai-org/GLM-5
- Build 4-bit sin podar: https://huggingface.co/pipenetwork/GLM-5.3-MLX-4bit
- Build mixed-4_8bit: https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-4_8bit
- Build mixed-3_6bit: https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-3_6bit
- Build REAP25-4bit: https://huggingface.co/pipenetwork/GLM-5.3-REAP25-MLX-4bit
- Build REAP50-4bit: https://huggingface.co/pipenetwork/GLM-5.3-REAP50-MLX-4bit
