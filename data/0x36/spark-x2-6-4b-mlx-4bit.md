# 0x36/Spark-X2.6-4B-mlx-4bit

## Resumen

Spark-X2.6-4B es un modelo de lenguaje de 4.112.079.360 parametros desarrollado por XHToken, distribuido con licencia Apache 2.0 y orientado a generacion de texto y conversacion en ingles y chino. Esta ficha concreta no es el modelo original, sino la conversion a formato MLX en cuantizacion de 4 bits publicada por el usuario 0x36 para ejecucion en Apple Silicon. La arquitectura, el tokenizer y la plantilla de chat son identicos al modelo base; solo cambian el layout y la precision de los pesos.

El interes tecnico de la publicacion esta en dos puntos. Primero, el modelo base emplea una atencion hibrida de 36 capas que alterna capas de ventana deslizante (window 512) con capas de atencion completa que usan RoPE parcial al 25% y theta de 5e6, lo que permite declarar soporte de contexto largo de hasta 1.000.000 de posiciones segun la configuracion. Segundo, el autor del quantizado incluye su propia implementacion de `model_type: spark2_5` (`spark2_5_mlx.py`) referenciada desde `config.json` mediante `model_file`, de modo que `mlx-lm` estandar puede cargar el modelo sin necesidad de parchear la libreria.

El resultado es un checkpoint de 2,2 GB de descarga (repo de 2,3 GB) con pesos de 4 bits afines y group size 64, equivalente a 4,501 bits por peso, pensado para equipos Mac con memoria unificada. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida: 36 capas, capas de ventana deslizante (window 512) alternadas con capas de atencion completa (RoPE parcial al 25%, theta 5e6); embeddings de entrada y salida compartidos (sin `lm_head` separado) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | Hasta 1.000.000 de posiciones segun `config.json`; el coste de KV crece con las capas de atencion completa |
| Tipos de cuantizacion | Esta publicacion: 4 bits afines, group size 64 (4,501 bits por peso). Variantes del mismo autor: bf16 y 8 bits. Otras cuantizaciones del modelo base: no disponibles |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (`model_type: spark2_5`), cuantizado en 4 bits |
| Libreria | `mlx` / `mlx-lm` |
| Tipo de pipeline | text-generation |
| Tamano de descarga | 2,2 GB (tamano del repo: 2,3 GB) |
| Modelo base | XHToken/Spark-X2.6-4B |
| Fecha de publicacion | 2026-10-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 36 capas con un esquema de atencion hibrida: las capas de ventana deslizante limitan el contexto local a 512 tokens y se alternan con capas de atencion completa. Estas ultimas aplican RoPE parcial (solo al 25% de las dimensiones de cada cabeza) con theta de 5e6, un ajuste habitual para extender la longitud de contexto efectiva. Los embeddings de entrada y salida estan atados, por lo que no existe una matriz `lm_head` independiente, lo que reduce el numero de parametros. En la conversion MLX, la generacion sobre las capas deslizantes utiliza `RotatingKVCache`, mientras que las capas de atencion completa mantienen una cache KV clasica que crece de forma lineal con la longitud de la secuencia.

Sobre el entrenamiento no hay informacion en los materiales proporcionados: no se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. La unica indicacion sobre el comportamiento de muestreo proviene del `generation_config.json` original, que fija `temperature=1.0` y `top_p=0.95`. La plantilla de chat incluye un parametro `enable_thinking` que activa un modo de razonamiento explicito, lo que sugiere que el modelo base fue ajustado para alternar entre respuestas directas y cadenas de razonamiento. La innovacion destacable de esta publicacion concreta es de ingenieria de despliegue: el autor aporta su propia implementacion del `model_type` no soportado aun por `mlx-lm` y la enlaza desde la configuracion, evitando forks o parches de la libreria.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino, con plantilla de chat propia.
- Modo de razonamiento o *thinking* activable mediante `enable_thinking=True` en `apply_chat_template`; desactivado por defecto en los ejemplos del autor.
- Generacion de codigo: el ejemplo de la model card pide una funcion Python que invierta una lista enlazada, lo que confirma uso previsto para tareas de programacion (sin benchmark publicado).
- Contexto largo declarado de hasta 1.000.000 de posiciones a nivel de configuracion, sujeto al coste de memoria de las capas de atencion completa.
- Capacidad multilingue limitada a ingles y chino; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: solo parcialmente inferible por el modo thinking; no se documentan capacidades de agente ni integracion con herramientas.
- Vision, audio y otras modalidades: no disponibles; el pipeline es exclusivamente text-generation.
- Ejecucion en Apple Silicon mediante `mlx-lm`, tanto por API Python (`load`, `generate`) como por CLI (`mlx_lm.generate`).

## Casos de uso

- Asistencia de programacion en local para desarrolladores con Mac: el modelo cabe en 2,2 GB y se carga con `mlx-lm` estandar, por lo que se puede usar para autocompletar funciones, explicar codigo o generar tests sin enviar codigo a servicios externos.
- Prototipado rapido de chatbots en ingles o chino sobre portatiles Apple Silicon: la cuantizacion de 4 bits permite iterar en local con `temperature=1.0` y `top_p=0.95` sin infraestructura GPU dedicada.
- Procesamiento de documentos largos en chino e ingles: el soporte declarado de contexto de hasta 1M posiciones permite resumir o extraer informacion de expedientes extensos, siempre que se asuma el coste de KV y se valide la calidad real en longitudes muy altas.
- Modo de razonamiento para tareas analiticas: activando `enable_thinking=True` se puede emplear en problemas de logica, matematicas o analisis paso a paso en entornos offline.
- Evaluacion comparativa de tecnicas de cuantizacion: al existir variantes bf16, 8 bits y 4 bits del mismo autor, sirve para medir la degradacion de calidad y el ahorro de memoria entre precisiones con un pipeline identico.
- Base para experimentacion en investigacion sobre atencion hibrida: la combinacion de ventana deslizante de 512 con RoPE parcial al 25% y theta 5e6 es un caso de estudio util para analizar el equilibrio entre coste de KV y alcance efectivo del contexto.
- Despliegue edge en equipos Mac de gama alta: al no requerir GPU NVIDIA ni parchear `mlx-lm`, encaja en estaciones de trabajo Apple para tareas de generacion de texto por lotes de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del quantizado no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan datos del modelo base XHToken/Spark-X2.6-4B. Tampoco se documentan latencia ni throughput medidos para la conversion MLX.

## Requisitos de hardware

- Memoria para pesos: 2,2 GB de descarga en 4 bits; en memoria, el checkpoint ronda los 2,3 GB de safetensors. La variante bf16 del mismo autor requiere aproximadamente el cuadruple (del orden de 8,2 GB solo en pesos, calculado a partir de los 4.112 millones de parametros a 16 bits).
- VRAM/unified memory estimada: con contexto corto, el uso total se situa en torno a 3-4 GB en memoria unificada, sumando pesos y cache KV (estimacion propia a partir del tamano de pesos; el autor no publica cifras). Con contextos muy largos el coste crece por las capas de atencion completa y puede superar ampliamente la capacidad de un equipo consumer.
- GPU recomendadas: exclusivamente Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra). No hay soporte CUDA en este repositorio al ser formato MLX.
- Cabe en GPU consumer: si, en cualquier Mac con al menos 8 GB de memoria unificada para contextos moderados; se recomienda 16 GB o mas para contextos largos o para la variante de 8 bits.
- Opciones de despliegue: `mlx-lm` (API Python y CLI `mlx_lm.generate`) sin parches; conversion reproducible con `mlx_lm.convert --hf-path XHToken/Spark-X2.6-4B --mlx-path ./4bit --dtype bfloat16 -q --q-bits 4`. vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a parametros, contexto, licencia y formato. Los datos de los modelos alternativos provienen de sus fichas publicas y no han sido verificados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B (MLX 4 bits, 0x36) | 4,11 B | Hasta 1M posiciones segun config | Apache 2.0 | MLX safetensors, `mlx-lm` | Solo Apple Silicon; modo thinking; ingles y chino |
| Spark-X2.6-4B (base, XHToken) | 4,11 B | Hasta 1M posiciones segun config | Apache 2.0 | Safetensors (formato original) | Referencia sin cuantizar del anterior |
| Qwen3-4B | ~4 B | 32K nativo, extensible | Apache 2.0 | Safetensors, GGUF, MLX, vLLM | Alternativa directa en tamano y licencia; no verificado en esta busqueda |
| Gemma 3 4B | ~4 B | 128K | Licencia Gemma | Safetensors, GGUF, MLX | Requiere aceptar terminos de uso; no verificado en esta busqueda |
| Llama 3.2 3B | 3,2 B | 128K | Licencia comunitaria Llama | Safetensors, GGUF, MLX | Menor numero de parametros; no verificado en esta busqueda |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni en tareas multilingues, por lo que la evaluacion previa a produccion es obligatoria.
- El contexto de 1M posiciones es una capacidad declarada en `config.json`, no verificada empiricamente; la cache KV de las capas de atencion completa crece de forma lineal y puede agotar la memoria unificada del equipo.
- Solo dos idiomas declarados (ingles y chino); el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Modelo cuantizado a 4 bits (4,501 bits por peso): existe degradacion esperada frente a bf16, especialmente en tareas de razonamiento largo y generacion de codigo; el autor no publica mediciones de esa perdida.
- Riesgo de alucinacion no cuantificado: al no haber evaluaciones de fidelidad ni de calibracion, no se puede estimar la tasa de errores factuales.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni si hubo filtrado o alineacion.
- Tool calling y uso como agente no documentados; no deben asumirse en produccion sin pruebas propias.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo base es de XHToken y esta publicacion es una conversion de un tercero (0x36) sin validacion oficial del autor original.
- Dependencia de `mlx-lm`: `model_type: spark2_5` no forma parte de la libreria, por lo que la carga depende de que el campo `model_file` y el archivo `spark2_5_mlx.py` se mantengan compatibles con futuras versiones de `mlx-lm`.
- Sin soporte CUDA ni de motores de inferencia habituales en servidor (vLLM, TGI, llama.cpp, Ollama), lo que limita el despliegue a hardware Apple.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay senal de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0x36/Spark-X2.6-4B-mlx-4bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Variante bf16 del mismo autor: https://huggingface.co/0x36/Spark-X2.6-4B-mlx-bf16
- Variante de 8 bits del mismo autor: https://huggingface.co/0x36/Spark-X2.6-4B-mlx-8bit
- Implementacion incluida en el repo: `spark2_5_mlx.py` (referenciada desde `config.json`)
- Libreria de inferencia: https://github.com/ml-explore/mlx-lm
- Papers, blogs y demos: no disponibles en la informacion proporcionada (los resultados de la busqueda web no contienen enlaces relevantes al modelo).
