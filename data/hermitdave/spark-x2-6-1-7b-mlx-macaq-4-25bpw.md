# hermitdave/Spark-X2.6-1.7B-MLX-MACaQ-4.25bpw

## Resumen

Spark-X2.6-1.7B-MLX-MACaQ-4.25bpw es una cuantizacion de pesos de 4 bits del modelo base XHToken/Spark-X2.6-1.7B, publicada por el usuario hermitdave. No se trata de un modelo nuevo entrenado desde cero, sino de una refinacion del checkpoint original aplicando el algoritmo MACaQ (Mixed-precision Activation-aware Calibration Quantization) de Huawei CSL, portado a MLX y validado por el autor. El resultado se distribuye en formato nativo MXFP4 de MLX, sin necesidad de shims en tiempo de ejecucion.

El modelo resuelve un problema concreto: la perdida de calidad que introduce la cuantizacion MXFP4 por redondeo simple (RTN) frente al checkpoint en BF16. Segun la validacion del autor en WikiText-2, MACaQ reduce la perplejidad de 289,27 (RTN) a 277,32 manteniendo el mismo rendimiento de decodificacion (232,6 tok/s) y el mismo pico de memoria (1,85 GB) que RTN. Frente a BF16 (231,46 PPL), la brecha se cierra parcialmente pero no desaparece.

La relevancia practica esta en el ecosistema Apple Silicon: es un checkpoint listo para `mlx-lm` con 1.707.657.216 parametros, pensado para ejecucion local en Macs con memoria unificada. La licencia Apache-2.0 del modelo base y del algoritmo facilita su uso comercial, aunque las capacidades reales del modelo subyacente no estan documentadas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base XHToken/Spark-X2.6-1.7B; no se detalla en la informacion proporcionada) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, weight-only, W4A16) con refinamiento MACaQ; repo de 2,3 GB |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en layout MXFP4 nativo de MLX (`mlx-lm`, `mxfp4`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Spark-X2.6-1.7B (tipo de transformer, atencion, capas, datos de entrenamiento o fases de alineacion como RLHF o DPO). Lo que si se detalla es el proceso de cuantizacion, que actua capa a capa sobre las lineales cuantizadas: primero se descomprimen los nibbles OCP E2M1 y las escalas de bloque E8M0 del formato MXFP4 de MLX; despues se criban los exponentes de bloque bajo la Hessiana diagonal de activaciones; a continuacion se ejecuta Flip-Refinement bajo la Hessiana rotada completa; y finalmente se reempaqueta todo en el layout MXFP4 nativo.

Una decision tecnica destacable es el rechazo explicito de la variante con rotacion Hadamard de 32 bloques: segun el autor, degradaba la perplejidad hasta 317,13, por lo que se mantiene el layout MXFP4 plano con cribado de exponentes y Flip-Refinement sobre los codigos. El algoritmo MACaQ procede de Huawei CSL (Apache-2.0) y el port a MLX junto con la validacion se desarrollaron con Hermes Agent. Los artefactos de datos y cache de la Hessiana fueron temporales y no se distribuyen: solo se publican pesos, config y tokenizer.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`, `conversational`).
- Generacion autoregresiva estandar mediante `mlx-lm`, con carga directa como cualquier checkpoint MXFP4.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`language: en`).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- La validacion cualitativa reportada se limita a una comprobacion de generacion coherente ante la pregunta "What is the capital of France?" con 24 tokens maximos.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado en MXFP4 para `mlx-lm` y se ejecuta sin shims, lo que permite desplegar generacion de texto en un Mac con memoria unificada con un pico de 1,85 GB en la validacion del autor.
- Prototipado de asistentes conversacionales en ingles: al ser un modelo de 1,7B en 4 bits, encaja en flujos de desarrollo iterativos donde se prioriza baja huella de memoria sobre calidad maxima.
- Evaluacion de tecnicas de cuantizacion: el repo incluye tablas comparativas BF16 vs MXFP4 RTN vs MACaQ, por lo que sirve como referencia reproducible para medir el impacto de metodos de calibracion en modelos pequenos.
- Despliegue en entornos con restricciones de VRAM o memoria: con 2,3 GB de repo y 1,85 GB de pico en decodificacion, es viable en equipos consumer donde un checkpoint BF16 de 4,00 GB no cabria con holgura.
- Generacion de texto por lotes en local: la validacion reporta 232,6 tok/s en decodificacion (M3 Max, 64 GB), adecuado para tareas de procesamiento por lotes sin GPU dedicada.
- Base para experimentos de cuantizacion adicional: al estar en formato MXFP4 nativo, puede servir como punto de partida para comparar con otras variantes (por ejemplo, la variante RCO 4.5 bpw que el autor evaluo y que obtuvo peor perplejidad).

## Benchmarks y rendimiento

Validacion del autor en M3 Max (64 GB), WikiText-2 test split, 64 secuencias de 512 tokens:

| Checkpoint | Perplejidad | Decode TPS | Memoria pico |
|---|---:|---:|---:|
| BF16 | 231,4557 ± 6,0217 | 86,8 | 4,00 GB |
| MXFP4 RTN | 289,2733 ± 7,2853 | 231,6 | 1,85 GB |
| MACaQ refined | 277,3195 ± 7,2643 | 232,6 | 1,85 GB |
| Hadamard 32 bloques (rechazado) | 317,13 | no disponible | no disponible |

Corpus WikiText-2 fijado (199.902 tokens, contexto 2048):

| Modelo | Perplejidad | Decode TPS |
|---|---:|---:|
| BF16 | 78,35 | 86,8 |
| MACaQ 4.25 | 88,16 | 242,3 |
| RCO 4.5 nominal | 103,39 | 191,7 |

Evaluacion independiente con `model-eval` zero-shot (400 items por tarea): sin caida significativa de MACaQ frente a BF16 en ARC-Challenge, ARC-Easy, HellaSwag, WinoGrande ni MMLU (McNemar pareado, p >= 0,104). Frente a una variante RCO 4.5 bpw construida localmente, MACaQ fue significativamente mejor en ARC-Easy (p = 0,0018) y mostro tendencia favorable en ARC-Challenge (p = 0,0363). No se publican valores absolutos por tarea, solo las comparaciones estadisticas.

Comprobacion de generacion: 261,7 tok/s y 1,02 GB de pico con `mlx_lm.generate`, prompt "What is the capital of France?", 24 tokens maximos.

## Requisitos de hardware

- VRAM/memoria estimada: 1,85 GB de pico en decodificacion segun la validacion del autor; 4,00 GB para el checkpoint BF16 equivalente.
- GPU validadas: Apple M3 Max con 64 GB de memoria unificada (unico hardware reportado).
- GPU NVIDIA (A100, H100, RTX 4090): no disponible; el formato es MLX y esta orientado a Apple Silicon, no a CUDA.
- Cabe en GPU consumer: si, en el ecosistema Apple Silicon; no hay datos de ejecucion en GPUs consumer NVIDIA.
- Opciones de despliegue: `mlx-lm` (libreria declarada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato MXFP4 de MLX no es directamente compatible con ellos.
- Latencia y throughput: 232,6 tok/s en decodificacion (WikiText-2, 64x512) y 261,7 tok/s en generacion corta, ambos en M3 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (WikiText-2) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Spark-X2.6-1.7B BF16 | 1,71B | no disponible | 231,46 (64x512) / 78,35 (corpus fijo) | apache-2.0 | Hugging Face (XHToken) |
| Spark-X2.6-1.7B MACaQ 4.25 (este) | 1,71B | no disponible | 277,32 (64x512) / 88,16 (corpus fijo) | apache-2.0 | Hugging Face (hermitdave) |
| Spark-X2.6-1.7B RCO 4.5 bpw | 1,71B | no disponible | 103,39 (corpus fijo) | no disponible | construccion local, no publicada |

No se dispone de datos de otros modelos de 1,7B comparables (por ejemplo, de la familia Qwen o Llama) en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base evaluadas por el autor.

## Limitaciones y advertencias

- Perdida de calidad respecto a BF16: la perplejidad sube de 231,46 a 277,32 (64x512) y de 78,35 a 88,16 (corpus fijo); no es una cuantizacion sin perdida.
- Solo ingles: el campo `language` declara unicamente `en`; el rendimiento en otros idiomas no esta documentado.
- Contexto no documentado: se desconoce la longitud de contexto nativa del modelo base; la validacion usa contexto 2048, pero no se confirma que ese sea el limite.
- Riesgo de alucinacion: no evaluado en la informacion disponible; los benchmarks reportados son de eleccion multiple y perplejidad, no de fidelidad factual.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo base ni sobre el proceso de cuantizacion; conviene verificar la licencia del checkpoint original XHToken/Spark-X2.6-1.7B.
- Portabilidad: el formato MXFP4 de MLX limita el despliegue a Apple Silicon; no hay pesos GGUF ni safetensors estandar en este repo.
- Reproducibilidad: los datos y la cache de la Hessiana usados en la calibracion no se publican, por lo que la cuantizacion no es reproducible a partir de este repo.
- Validacion limitada: las pruebas se hicieron en un unico equipo (M3 Max, 64 GB) y con un unico prompt de comprobacion cualitativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/Spark-X2.6-1.7B-MLX-MACaQ-4.25bpw
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Algoritmo MACaQ (Huawei CSL): https://github.com/huawei-csl/MACaQ
- Hermes Agent: https://hermes-agent.nousresearch.com/
- Documentacion de evaluacion citada por el autor: `macaq-mlx/docs/SPARK26_EVAL.md` (ruta interna del repo del autor; no se proporciona URL publica)
