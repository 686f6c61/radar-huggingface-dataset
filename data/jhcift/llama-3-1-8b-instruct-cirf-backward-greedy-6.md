# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6

## Resumen

Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6 es un ajuste fino del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario JhCIFT. El modelo implementa el esquema CIRF (functional tokens para razonamiento), en el que el modelo genera una traza de tokens funcionales (`[sof]`, `[f_0]` a `[f_511]`, `[eof]`) que representan pasos intermedios de razonamiento antes de emitir la respuesta final. Esta variante concreta parte del modelo de resultado completo y aplica una seleccion backward-greedy de resultados con un presupuesto de como maximo 6 tokens de resultado explicitos por ejemplo de entrenamiento.

El modelo mantiene la arquitectura transformer densa de Llama 3.1 8B, con 8.034.471.936 parametros, y anade 514 tokens nuevos al vocabulario (los tokens funcionales mencionados) con sus correspondientes filas de embedding y de salida ya entrenadas. La actualizacion LoRA se ha fusionado en los pesos BF16 densos, de modo que el modelo se carga con Transformers estandar sin necesidad de PEFT, checkpoint base ni codigo CIRF adicional.

Es relevante porque propone una alternativa al razonamiento en lenguaje natural (tipo cadena de pensamiento) mediante tokens funcionales discretos y acotados, lo que permite controlar el presupuesto de razonamiento (aqui, 6 tokens de resultado) y evaluar el equilibrio entre coste computacional y precision en tareas aritmeticas y de sentido comun. El modelo solo declara soporte para ingles y tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.034.471.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B soporta 128K, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del Llama 3.1 8B Instruct, un transformer decoder-only denso. La modificacion principal es la extension del vocabulario con 514 tokens funcionales: `[sof]` (start of function trace), `[eof]` (end of function trace) y `[f_0]` a `[f_511]`. El modelo genera una traza de estos tokens, opcionalmente acompanados de valores de resultado, y despues de `[eof]` emite la respuesta final. La adaptacion se realizo mediante LoRA, cuya actualizacion se ha fusionado en los pesos BF16 densos, incluyendo las filas de embedding y de salida de los nuevos tokens ya entrenadas.

El entrenamiento parte del modelo CIRF de resultado completo y aplica una seleccion backward-greedy de resultados con un presupuesto maximo de 6 tokens de resultado explicitos por ejemplo. La model card no detalla el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; solo se indica que es una adaptacion supervisada. El repositorio incluye `training_config.json`, `provenance.json` y `export_verification.json` con los ajustes de entrenamiento, hashes del checkpoint de origen y comprobaciones de exportacion, pero sus contenidos no se reproducen en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento mediante trazas de tokens funcionales discretos, con control del presupuesto de razonamiento (6 tokens de resultado en esta variante).
- Razonamiento aritmetico y de sentido comun: evaluado en GSM8K, MultiArith, SVAMP, CommonsenseQA y Coin Flip.
- Generacion de trazas interpretables: la separacion entre traza (`[sof]` ... `[eof]`) y respuesta final permite extraer y auditar el razonamiento intermedio.
- Decodificacion greedy determinista recomendada por el autor (do_sample=False).
- Capacidad multilingue: solo ingles declarado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o multi-step reasoning general: no disponible; el razonamiento se limita al esquema de tokens funcionales CIRF.
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Evaluacion de investigacion sobre razonamiento con tokens discretos: el modelo sirve para comparar el esquema CIRF frente a cadenas de pensamiento en lenguaje natural, ya que la traza es separable y acotable a un numero fijo de tokens funcionales.
- Clasificacion y resolucion de problemas aritmeticos simples en ingles: con un 99,44% en MultiArith y 79,33% en SVAMP, es adecuado para pipelines de resolucion de problemas de palabra acotados donde se requiere respuesta exacta.
- Analisis de robustez de benchmarks: la correccion de paridad aplicada a Coin Flip (84,58%) permite estudiar el impacto de etiquetas ruidosas en la evaluacion de modelos de razonamiento.
- Experimentos de control de coste de inferencia: al limitar la traza a 32 tokens funcionales y 384 tokens nuevos, el modelo permite medir el equilibrio precision/latencia en entornos con presupuesto fijo.
- Generacion de trazas auditables para depuracion de modelos: la estructura `[sof]`/`[eof]` facilita la inspeccion automatica del razonamiento intermedio en herramientas de analisis.
- Base para ajustes posteriores: al estar fusionado en pesos densos y cargarse con Transformers estandar, sirve como punto de partida para nuevos fine-tunings sin dependencias de PEFT.
- Prototipado en entornos de investigacion con una sola GPU: el tamano de 8B en BF16 permite desplegarlo en GPUs de gama alta para pruebas controladas.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, puntuacion por coincidencia exacta):

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 51,40% |
| MultiArith | 178 | 99,44% |
| SVAMP | 300 | 79,33% |
| CommonsenseQA | 1.221 | 79,69% |
| Coin Flip (corregido por paridad) | 3.333 | 84,58% |

El autor indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y latencia con batch 1, estan en `test_results.json`, pero esos datos no se incluyen en la informacion proporcionada. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (8,03B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, alrededor de 17-20 GB segun longitud de secuencia.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; GPUs con 16 GB requeririan cuantizacion, que no esta documentada.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB no esta garantizado sin cuantizacion no publicada.
- Opciones de despliegue: Transformers (probado por el autor), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible; el autor remite a `test_results.json` para latencia con batch 1, dato no incluido aqui.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6 | 8,03B | no disponible | Tokens funcionales CIRF, presupuesto de 6 resultados | llama3.1 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03B | 128K (segun Meta) | Razonamiento en lenguaje natural | llama3.1 | Ampliamente disponible |
| JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full | no disponible | no disponible | Tokens funcionales CIRF, resultado completo | llama3.1 | Hugging Face |
| JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3 | no disponible | no disponible | CIRF, presupuesto de 3 resultados | llama3.1 | Hugging Face |

La comparativa de rendimiento frente a alternativas no esta disponible: la model card no incluye resultados de los modelos hermanos ni del base en los mismos benchmarks.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara ni evalua soporte multilingue.
- El formato de prompt es no estandar: requiere `<|begin_of_text|>QUESTION[sof]`, sin chat template, y decodificar con `skip_special_tokens=False`; un uso incorrecto rompe la separacion entre traza y respuesta.
- La parada debe hacerse en el token EOS del tokenizer, no en `[eof]`; ignorar esto puede truncar la respuesta final.
- La evaluacion impone un limite de 32 tokens funcionales forzando `[eof]`; el comportamiento fuera de ese protocolo no esta documentado.
- Precision moderada en GSM8K (51,40%), lo que limita su uso en produccion para matematicas complejas.
- La correccion por paridad en Coin Flip sugiere que aproximadamente el 20% de las etiquetas del dataset discrepan con la paridad enunciada; conviene revisar la metodologia antes de comparar con otros resultados.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible.
- Sesgos conocidos: no documentados; hereda los del modelo base Llama 3.1.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial y requisitos de atribucion ("Built with Llama"); revisar `LICENSE` y `USE_POLICY.md`.
- Modelo con 0 descargas y 0 likes: sin validacion independiente de la comunidad; los resultados son autoinformados por el autor.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante CIRF-Full: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Variante CIRF-Zero-Results: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Variante CIRF-Backward-Greedy-3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Variante CIRF-Backward-Greedy-12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Variante CIRF-Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
- Papers, blogs, repos o demos adicionales: no disponible en la informacion proporcionada.
