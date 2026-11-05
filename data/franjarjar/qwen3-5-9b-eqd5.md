# Franjarjar/Qwen3.5-9B-EQD5

## Resumen

Qwen3.5-9B-EQD5 es una cuantizacion del modelo Qwen/Qwen3.5-9B realizada por el desarrollador Franjarjar (JarJarFran) para Espetero, un motor de inferencia nativo para Metal en Apple Silicon. El formato EQ (LaneQuant) es propio de Espetero y almacena codigos de 4, 5, 6 y 8 bits con una escala firmada de 8 bits por cada 16 entradas y una escala fp16 por cada 256, un diseno alineado con los kernels matriciales de la GPU de Apple. El resultado es un archivo de 6,7 GB en disco que, segun las mediciones del autor, ofrece una divergencia KL ligeramente inferior a la del UD-Q5_K_XL de Unsloth con un tamano practicamente identico.

El modelo base es Qwen3.5-9B, un transformer de la familia Qwen 3.5 con 2.878.288.512 parametros en el checkpoint cuantizado (el repo declara un modelo base de 9B, aunque el recuento real de safetensors corresponde a los pesos del texto sin la cabeza MTP). Esta version elimina la cabeza MTP y la torre de vision, por lo que es exclusivamente de texto. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion poco habitual (EQ/LaneQuant) optimizada para Apple Silicon; por otro lado, advierte de que el formato es propietario de Espetero y no se puede cargar con llama.cpp, MLX ni transformers, lo que limita drasticamente su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, con atencion lineal en el primer cuarto de capas) |
| Parametros totales | 2.878.288.512 (recuento real de safetensors; el modelo base se declara como 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EQ eqd5 (LaneQuant): 4, 5, 6 y 8 bits; escala firmada int8 por 16 entradas, escala fp16 por 256; media de 6,00 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con codigos EQ (formato nativo de Espetero; no compatible con llama.cpp, MLX ni transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen 3.5 que combina atencion lineal en el primer cuarto de capas con atencion estandar en el resto. La cuantizacion EQ (LaneQuant) se aplica de forma diferenciada por tipo de tensor: atencion lineal del primer cuarto a 8 bits, resto a 5 bits; k/v/o de atencion a 6 bits y q a 4 bits; gate/up del MLP a 5 bits y down a 6 bits en el primer y ultimo cuarto, 5 bits en el resto; embedding con MLX affine a 6 bits y LM head a 6 bits EQ. Se eliminan la cabeza MTP y la torre de vision.

El proceso de cuantizacion se ejecuto con `espetero quantize` (Espetero 0.2.0, commit 616c21a) sobre una calibracion de mlx-lm (calibration_v5, 112K tokens), con un tiempo de 23 minutos en un M1 Max y un pico de 11 GB de memoria. Las estadisticas de calibracion se capturaron con una build de desarrollo que ejecutaba los pesos del GGUF Q8_0, en cuatro rangos de capas fusionados con `tools/calib_merge.py` y con las 24 matrices Hessian de salida de atencion lineal reordenadas al orden de columnas de Hugging Face. El autor advierte de que una reconversion desde cero con la version 0.2.0 no sera byte a byte identica.

## Capacidades

- Generacion de texto en modo exclusivamente textual: no incluye torre de vision ni cabeza MTP.
- Razonamiento y matematicas heredados del modelo base Qwen3.5-9B (no se documentan capacidades especificas en la model card).
- Generacion de codigo: la calibracion incluye ventanas de codigo (31 de las 62 ventanas de evaluacion), lo que sugiere un enfoque hacia ese dominio.
- Soporte de tool calling y function calling: no documentado en la model card; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Modo thinking: no documentado.
- Servidor compatible con clientes OpenAI, Anthropic y Ollama a traves de `espetero serve`.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el modelo esta disenado para ejecutarse con Espetero 0.2.0 o superior en equipos con 16 GB de memoria o mas, aprovechando los kernels Metal nativos para decodificacion a 45 tok/s en M1 Max y con margen para M4 Max.
- Sustitucion de un GGUF Q5 en flujos de trabajo ya basados en Espetero: al ofrecer una KLD media de 0,00434 frente a 0,00530 del UD-Q5_K_XL y ocupar ligeramente menos espacio, sirve como reemplazo directo en pipelines que ya usan el motor.
- Prototipado de asistentes conversacionales en local: el servidor integrado expone una API compatible con OpenAI, Anthropic y Ollama, lo que permite conectar clientes existentes sin adaptadores.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye metodologia detallada (KLD por token sobre 123.008 tokens, ventanas de WikiText-2 y codigo) util para investigadores que comparen formatos de cuantizacion en Apple Silicon.
- Generacion de codigo en local para desarrolladores con Mac: la calibracion incluye ventanas de codigo y el modelo base Qwen3.5-9B esta orientado a tareas de programacion, aunque no se publican benchmarks especificos en esta ficha.
- Despliegue en entornos con restricciones de conectividad: al ser un modelo local de 6,7 GB con licencia Apache 2.0, puede ejecutarse en estaciones de trabajo sin acceso a la nube.
- Benchmarking de motores de inferencia: la model card documenta comandos (`bench_native --quick --batch 1`) y comparaciones intercaladas en sesion exclusiva por Mac, utiles para reproducir mediciones.

## Benchmarks y rendimiento

| Metrica | Este archivo (eqd5) | Unsloth UD-Q5_K_XL |
|---|---|---|
| Bits por peso | 6,00 | 6,02 |
| KLD media | 0,00434 | 0,00530 |
| KLD mediana | 0,00127 | 0,00146 |
| KLD p99 | 0,0293 | 0,0337 |
| Top-1 (acuerdo con referencia) | 97,7 % | 97,5 % |
| Decodificacion M4 Max (tok/s) | no disponible | no disponible |
| Decodificacion M1 Max (tok/s) | 45 | 35 |

Comparacion pareada sobre las mismas ventanas de referencia (bootstrap por ventanas): frente a UD-Q5_K_XL, ambos ejecutados con Espetero 616c21a, la KLD se reduce un 18,2 % (intervalo del 95 %: -32,5 % a -0,9 %; inferior en 79 % de las 62 ventanas). Medicion de KLD contra el modelo BF16 con activaciones fp32 sobre 123.008 tokens (62 ventanas de 2048 tokens: 31 de WikiText-2 test y 31 de codigo, sin puntuar los primeros 64 tokens de cada ventana). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 6,7 GB en disco; el autor indica un minimo de 16 GB de memoria en el Mac.
- GPU recomendadas: Apple Silicon con Metal; mediciones publicadas en M1 Max (MacBook Pro, 64 GB) y M4 Max (Mac Studio, 128 GB).
- Cabe en GPU consumer: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada; no aplica a GPUs NVIDIA o AMD por depender de Metal.
- Opciones de despliegue: exclusivamente Espetero 0.2.0 o superior (`brew install JarJarFran/espetero/espetero`; `espetero serve --model Franjarjar/Qwen3.5-9B-EQD5`). No es compatible con vLLM, llama.cpp, Ollama nativo, TGI ni transformers.
- Latencia y throughput: 45 tok/s en decodificacion con M1 Max (una secuencia, contexto de 128 tokens, `bench_native --quick --batch 1`); el dato para M4 Max no esta disponible en la tabla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor compatible | KLD media |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-EQD5 (este) | 2.878.288.512 (texto, sin MTP) | no disponible | EQ (safetensors) | Apache 2.0 | Solo Espetero | 0,00434 |
| unsloth UD-Q5_K_XL (Qwen3.5-9B) | no disponible en la informacion | no disponible | GGUF | Apache 2.0 (heredada) | llama.cpp, Espetero | 0,00530 |
| Qwen/Qwen3.5-9B (BF16) | 9B (declarado) | no disponible | safetensors | Apache 2.0 | transformers, vLLM, TGI | referencia |

La comparativa se limita a las alternativas citadas en la model card; no se dispone de datos de otros formatos de cuantizacion (MLX, AWQ, GPTQ) ni de modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Portabilidad nula: los archivos EQ solo los carga Espetero; llama.cpp, MLX y transformers no pueden leerlos.
- Dependencia de una version concreta del motor: requiere Espetero 0.2.0 o superior y una build concreta (616c21a) para reproducir las mediciones.
- Plataforma limitada a Apple Silicon con Metal; no hay soporte para CUDA, ROCm ni CPU generica.
- Sin vision ni cabeza MTP: el modelo es exclusivamente de texto y no puede usarse para tareas multimodales.
- Sin benchmarks estandar publicados (MMLU, HumanEval, GSM8K): el unico dato de calidad es la KLD frente al BF16 y el top-1, que no equivalen a rendimiento en tareas.
- Riesgo de alucinacion y sesgos: no documentados en la model card; se heredan del modelo base Qwen3.5-9B, sin evaluacion especifica en esta ficha.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue mas alla de lo que herede el modelo base.
- Longitud de contexto no disponible: no se especifica en la model card.
- Reproducibilidad: el autor advierte de que una reconversion desde cero con Espetero 0.2.0 no sera byte a byte identica a este archivo, por diferencias en la captura de calibracion.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las mediciones.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del motor Espetero (MIT) condiciona el despliegue en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Franjarjar/Qwen3.5-9B-EQD5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Motor Espetero: https://github.com/JarJarFran/espetero
- Documentacion del formato EQ: https://github.com/JarJarFran/espetero/blob/main/docs/eq.md
