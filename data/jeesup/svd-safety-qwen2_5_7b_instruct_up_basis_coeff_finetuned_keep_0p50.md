# Jeesup/svd-safety-qwen2_5_7b_instruct_up_basis_coeff_finetuned_keep_0p50

## Resumen

El modelo `Jeesup/svd-safety-qwen2_5_7b_instruct_up_basis_coeff_finetuned_keep_0p50` es un derivado comprimido de `Qwen/Qwen2.5-7B-Instruct` obtenido mediante la tecnica Basis Sharing del repositorio `TUDa-HWAI/Basis_Sharing`. La compresion elimina el 50 % de los parametros (fraccion realizada 0,4998681805399325) agrupando dos capas adyacentes para que compartan una unica base por tipo de peso, tras lo cual se recupera parte de la calidad perdida con un ajuste fino LoRA aplicado exclusivamente sobre los coeficientes. El checkpoint resultante esta plegado de nuevo a formas densas de Qwen2, por lo que se carga con `transformers` estandar sin codigo de modelado personalizado.

Se trata de un artefacto de investigacion orientado a medir el compromiso entre compresion y seguridad, no de un modelo listo para produccion. La model card es explicita: a este ratio de compresion el comportamiento de rechazo se degrada, y el propio autor advierte que las cifras de seguridad de un modelo que se ha vuelto degenerado no constituyen evidencia sobre alineacion. El modelo no tiene descargas ni likes en el momento de redactar esta ficha y no publica variantes cuantizadas.

La relevancia actual es metodologica: aporta un punto de comparacion reproducible (calibracion con 256 secuencias de WikiText-2 de 2048 tokens, seed 42; recuperacion con LoRA r=8 sobre `yahma/alpaca-cleaned`) dentro de una familia de celdas experimentales que evaluan compresores bajo una receta de recuperacion constante. Mantiene la licencia Apache-2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2ForCausalLM); pesos plegados a forma densa con rango deficiente |
| Parametros totales | 7.615.616.512 (7,6 B) en el checkpoint denso |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; heredada de Qwen2.5-7B-Instruct |
| Tipos de cuantizacion | no disponible (solo safetensors densos; admite cuantizacion estandar del ecosistema Qwen2) |
| Idiomas soportados | no especificado en la model card; el modelo base Qwen2.5-7B-Instruct declara 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 15,3 GB, aproximadamente 2 bytes por parametro) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Metodo de compresion | Basis Sharing (SVD blanqueado por grupo) + recuperacion LoRA sobre coeficientes |
| Fraccion de parametros retenida | 0,4999 (realizada: 0,4998681805399325) |
| Grupos de comparticion | 2 capas adyacentes comparten una base por tipo de peso |
| Tipos compartidos / privados | compartidos: `v`, `k`, `q`, `up`, `gate`; privados por capa: `down`, `o` |

## Arquitectura y entrenamiento

El punto de partida es Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion de consultas agrupadas (GQA) y sesgos en las proyecciones q/k/v. La compresion con Basis Sharing concatena horizontalmente los pesos de cada grupo de dos capas adyacentes y calcula una SVD blanqueada sobre esa concatenacion, de modo que el grupo comparte una unica base. Los tipos compartidos son `v`, `k`, `q`, `up` y `gate`; `down` y `o` permanecen privados por capa. La calibracion usa 256 secuencias de WikiText-2 de 2048 tokens con seed 42 (el codigo original fija seed 2023; este proyecto calibra todos los metodos con una unica seed para que la comparacion sea consistente).

La recuperacion se realiza con LoRA r=8, alpha 16, 2 epocas, learning rate 0,0001 y batch 64 sobre `yahma/alpaca-cleaned`. Solo se entrenan los coeficientes: las bases compartidas y por capa permanecen congeladas y son identicas bit a bit a las del modelo comprimido, de modo que cada peso conserva rango <= k y cada grupo sigue compartiendo una base. Finalmente se fusiona `C' = C + (alpha/r)BA` y se pliega `W = C' @ B` a denso. Dos detalles de implementacion son relevantes: los embeddings rotatorios se construyen con las tablas propias de `transformers` a partir del config del modelo y se verificaron identicos a Llama estandar en float64 para bases RoPE 1e4/5e5/1e6, escalado llama3 y GQA; y los 84 sesgos de atencion de Qwen2 (que `ShareLlama` descartaba) se restauraron sobre los coeficientes con la forma `y = C(Bx) + b`, se dejaron congelados y se comprobaron iguales a los del checkpoint original al plegar. El resultado es un `Qwen2ForCausalLM` normal, deficiente en rango pero no mas pequeno en disco.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct y aplicada con la plantilla de chat del modelo base.
- Razonamiento basico y respuesta a preguntas de conocimiento general, medido en el propio artefacto con ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en regimen zero-shot.
- Razonamiento matematico elemental: la celda reporta 0,2767 en MathQA (acc_norm), muy por debajo de lo esperable en el modelo sin comprimir.
- Comprension lectora y sentido comun a nivel de frase, con HellaSwag 0,5417 y WinoGrande 0,5864.
- No se documenta soporte de tool calling, function calling ni uso agentico en la model card; el modelo base lo soporta, pero la compresion al 50 % no garantiza que se conserve.
- No se documenta capacidad de vision, audio ni modo "thinking" explicito.
- Capacidades multilingues: no verificadas en esta celda; dependen de lo que sobreviva de los 29 idiomas del modelo base.
- La funcion principal del artefacto es servir de celda de medida del compromiso compresion-seguridad: tasas de ataque exitoso y de sobrerrechazo bajo jueces estandarizados.

## Casos de uso

- Investigacion sobre compresion y seguridad: la celda existe para cuantificar cuanto se degrada el comportamiento de rechazo al eliminar el 50 % de los parametros; se usa comparando sus ASR de AdvBench (0,0635) y StrongREJECT (0,1374) contra los de otras celdas de la misma familia evaluadas con la misma receta.
- Ablacion de metodos de recuperacion: al congelar las bases y entrenar solo coeficientes con una receta fija (LoRA r=8 sobre alpaca-cleaned), permite aislar el efecto del compresor sin que cambien los datos de recuperacion entre metodos.
- Estudios de rango y espectro de pesos: al conservar rango <= k por peso y una base compartida por grupo de dos capas, es util para analizar que subespacios de las proyecciones q/k/v/up/gate concentran la funcionalidad.
- Evaluacion de arneses de rechazo: los ficheros de `safety/` incluyen salidas por prompt y metricas crudas, utiles para depurar jueces automaticos (HarmBench-Llama-2-13b-cls, wildguard) y medir su fiabilidad, que en esta celda es explicitamente baja.
- Analisis de sobrerrechazo: con tasas de 0,4672 en XSTest-safe, 0,1032 en OR-Bench-Hard-1K y 0,2852 macro, sirve como caso extremo para estudiar falso rechazo en modelos comprimidos.
- Despliegue local en hardware de gama media tras cuantizacion: al ser un denso Qwen2 estandar de 7,6 B, se puede ejecutar en una GPU consumer de 16-24 GB en 4 bits para tareas de generacion no criticas donde la seguridad no sea un requisito.
- Docencia y experimentacion con tecnicas de factorizacion: sirve para ilustrar en un caso real el flujo SVD por grupos -> LoRA sobre coeficientes -> plegado a denso, con verificaciones numericas documentadas (RoPE, sesgos de atencion) reproducibles.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,4999 |
| WikiText-2 (perplejidad) | 19,2708 |
| ARC-Easy (acc_norm) | 0,5619 |
| ARC-Challenge (acc_norm) | 0,3541 |
| HellaSwag (acc_norm) | 0,5417 |
| WinoGrande (acc) | 0,5864 |
| OpenBookQA (acc_norm) | 0,3580 |
| PIQA (acc_norm) | 0,6774 |
| MathQA (acc_norm) | 0,2767 |
| AdvBench / HarmBench ASR | 0,0635 |
| StrongREJECT / HarmBench ASR | 0,1374 |
| Sobrerrechazo (XSTest-safe) | 0,4672 |
| Sobrerrechazo (OR-Bench-Hard-1K) | 0,1032 |
| Sobrerrechazo (macro) | 0,2852 |

Condiciones de evaluacion: perplejidad sobre WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; generacion de AdvBench y StrongREJECT juzgada con `cais/HarmBench-Llama-2-13b-cls`; sobrerrechazo sobre XSTest-safe y OR-Bench-Hard-1K juzgado con `allenai/wildguard`. Toda la generacion usa la plantilla de chat en modo greedy.

Advertencia del autor: el juicio de sobrerrechazo NO es fiable en esta celda (fraccion puntuada de 0,55 en XSTest-safe y 0,43 en OR-Bench-Hard-1K). No se publican resultados comparativos contra el modelo base sin comprimir en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 15,3 GB de pesos mas cache KV; con contexto de 8192 tokens y batch 1, en torno a 18-20 GB.
- VRAM en INT8/FP8: aproximadamente 8-9 GB de pesos, mas cache KV.
- VRAM en 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4,5-6 GB de pesos, mas cache KV.
- GPU recomendadas sin cuantizar: A100 40/80 GB, H100 80 GB, L40S 48 GB; cabe con holgura en una RTX 4090 o RTX 3090 de 24 GB si se limita el contexto.
- GPU consumer: si cabe en RTX 4090/3090 (24 GB) en BF16 con contexto moderado; en RTX 4080/4070 Ti (16 GB) o RTX 3060/4070 (12 GB) requiere cuantizacion a 8 o 4 bits.
- Opciones de despliegue: `transformers` sin codigo personalizado (el checkpoint es un `Qwen2ForCausalLM` denso); vLLM y TGI para servicio de alto rendimiento; llama.cpp u Ollama previa conversion a GGUF, que puede realizarse con las herramientas estandar de Qwen2.
- Latencia y throughput: no disponible. El autor no publica medidas de velocidad, y al ser un denso de 7,6 B el coste por token es el de un modelo de ese tamano, no el de un modelo con menos parametros en disco.
- Nota importante: aunque la fraccion de parametros retenida es 0,4999, el checkpoint no ocupa menos espacio (15,3 GB) ni reduce el coste de computo, porque los factores se han plegado a matrices densas de rango deficiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (svd-safety...keep_0p50) | 7,62 B densos, 0,4999 de presupuesto retenido | no especificado (heredado de Qwen2.5) | apache-2.0 | safetensors | Rank-deficiente; comportamiento de rechazo degradado |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 tokens (familia Qwen2.5) | apache-2.0 | safetensors, GGUF, AWQ, GPTQ | Modelo base sin comprimir; referencia de calidad y de seguridad |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Alternativa de tamano similar con contexto mucho mayor y licencia no Apache |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | apache-2.0 | safetensors, GGUF | Alternativa Apache de tamano comparable, sin capacidades de seguridad especificas |

No se dispone de resultados de benchmarks equivalentes para los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion numerica de rendimiento queda como no disponible. La comparacion de parametros, contexto y licencia se basa en las fichas publicas de cada modelo, no en mediciones reproducidas en esta evaluacion.

## Limitaciones y advertencias

- La compresion al 50 % degrada el comportamiento de rechazo; ese es precisamente el fenomeno que la celda mide. El autor advierte que las cifras de seguridad de un modelo degenerado no son evidencia sobre alineacion.
- La tasa de sobrerrechazo en XSTest-safe es 0,4672 y la macro 0,2852, lo que indica un modelo que rechaza en exceso entradas seguras.
- El juicio automatico de sobrerrechazo no es fiable en esta celda: solo se puntuo el 55 % de XSTest-safe y el 43 % de OR-Bench-Hard-1K. Las metricas de sobrerrechazo deben leerse con esa salvedad.
- Riesgo de alucinacion: no medido en la informacion disponible; la perplejidad de 19,2708 en WikiText-2 es alta y sugiere una modelizacion del lenguaje degradada respecto al modelo base.
- El checkpoint es denso y ocupa 15,3 GB, igual que un modelo de 7,6 B sin comprimir: no hay ahorro de memoria ni de computo en inferencia, solo deficiencia de rango.
- No se publican variantes cuantizadas oficiales (GGUF, AWQ, GPTQ); cualquier cuantizacion hay que generarla.
- Idiomas soportados no verificados. El modelo base declara 29 idiomas, pero el ajuste de recuperacion se hizo unicamente sobre `yahma/alpaca-cleaned` (predominantemente ingles), por lo que el multilingue puede haberse degradado.
- Soporte de tool calling y uso agentico no documentado ni evaluado en esta celda.
- Licencia Apache-2.0, por lo que el uso comercial esta permitido; sin embargo, el estado de degradacion del comportamiento de rechazo lo hace inadecuado para produccion en aplicaciones orientadas al usuario sin filtros externos.
- Modelo con 0 descargas y 0 likes: no hay validacion independiente de los resultados publicados.
- La calibracion se hizo con una unica seed (42) en lugar de la seed 2023 del codigo original; los resultados no son directamente comparables con los de Basis Sharing publicados por sus autores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-qwen2_5_7b_instruct_up_basis_coeff_finetuned_keep_0p50
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Basis Sharing (TUDa-HWAI), commit `1c021b6ce1d3`: https://github.com/TUDa-HWAI/Basis_Sharing
- Dataset de recuperacion: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Juez de ataques (HarmBench): https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobrerrechazo: https://huggingface.co/allenai/wildguard
- Resultados crudos y salidas por prompt: directorios `utility/` y `safety/` del repositorio del modelo
- No se han encontrado articulos, blogs ni demos adicionales en la busqueda web realizada.
