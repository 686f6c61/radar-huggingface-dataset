# goodmai/Qwen3.8-27B-QTIP-2.0bpw-MLX

## Resumen

Qwen3.8-27B-QTIP-2.0bpw-MLX es una cuantizacion extrema del modelo Qwen3.5-27B de Alibaba Qwen, publicada por el usuario goodmai en Hugging Face. Se trata de un checkpoint convertido con la tecnica QTIP (Quantization with Trellis and Incoherent Processing) a 2.0 bits por peso, con el objetivo declarado de comprimir un modelo de 27.000 millones de parametros en 8,48 GB de pesos para que quepa en Macs con Apple Silicon de 16 GB de memoria unificada. La libreria de inferencia es MLX, el framework de Apple para ejecucion en silicio propio.

El interes tecnico de esta publicacion no reside en el modelo base, sino en el metodo de cuantizacion: emplea un trellis de bitshift (L=16, V=2, HYB Q=9), una transformada de Hadamard aleatoria de Kronecker (RHT) y BlockLDLQ, tecnicas que buscan evitar el colapso de calidad tipico de la cuantizacion escalar a 2 bits. El autor reporta una perplejidad de 5,345 en WikiText-2 (16k tokens) frente a 19,146 de una cuantizacion MLX affine de 2 bits, lo que supone una reduccion del 72,1 %.

La ficha se enfrenta a una limitacion importante: la model card apenas describe el modelo base Qwen3.5-27B, y los datos disponibles sobre arquitectura, contexto, idiomas y entrenamiento del original son escasos. Ademas, existe una inconsistencia notable entre el nombre del repositorio (que sugiere 27B) y el recuento real de parametros en los safetensors (4.550.853.872), que se documenta mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-27B); pesos cuantizados con QTIP trellis + Kronecker RHT + BlockLDLQ |
| Parametros totales | 4.550.853.872 (segun safetensors del repo); el nombre del repo y la model card indican 27B en el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2.0 bpw QTIP trellis (L=16, V=2, HYB Q=9) con Kronecker RHT y BlockLDLQ; etiquetado como 4-bit en los tags de HF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-27B, un transformer de la familia Qwen 3.5 desarrollada por Alibaba Qwen. La informacion proporcionada no detalla la arquitectura interna del original (numero de capas, dimension oculta, mecanismo de atencion, si es denso o MoE), ni los datos de entrenamiento, el numero de tokens, la composicion del corpus o si se aplicaron fases de RLHF o DPO. Todo ello queda como no disponible.

La innovacion destacable es el pipeline de cuantizacion post-entrenamiento aplicado por goodmai. QTIP (Quantization with Trellis and Incoherent Processing) sustituye la cuantizacion escalar por una cuantizacion en trellis con un codebook de bitshift de 16 niveles y 2 bits por estado, combinada con una transformada de Hadamard aleatoria de Kronecker para incoherencia y un ajuste BlockLDLQ de los pesos. Segun el autor, esta combinacion evita el colapso de calidad que sufren las cuantizaciones escalares a 2 bits, manteniendo la perplejidad en 5,345 en WikiText-2 (ventana de 4x4096) frente a 19,146 de una cuantizacion MLX affine de 2 bits. El checkpoint se deriva de `mlx-community/Qwen3.8-27B-GPTQ-4bit` y se reproduce con el comando `basalt models convert ... --experimental-qtip 2.0`.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-27B (el alcance exacto no se detalla en la model card).
- Inferencia nativa en Apple Silicon mediante MLX, con soporte del runtime Basalt (app macOS y CLI) y servidor REST via `basalt serve --rest`.
- Ejecucion sin Python en macOS 27 o superior sobre Apple Silicon, segun la model card.
- Capacidades de codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada; dependen del modelo base, que no se documenta aqui.
- Capacidades multilingues: no disponibles; la model card solo ofrece botones de lanzamiento en ruso e ingles, lo que no constituye una declaracion de idiomas soportados.

## Casos de uso

- Despliegue local en Macs de 16 GB: el caso de uso central de esta publicacion es ejecutar un modelo de gran tamano en un MacBook con 16 GB de memoria unificada, gracias a los 8,48 GB de pesos cuantizados. Es adecuado porque el footprint medido cabe holgadamente en esa configuracion.
- Prototipado offline en portatiles Apple Silicon: permite probar flujos de chat y generacion sin conexion ni GPU dedicada, usando MLX y el runtime Basalt, util para desarrolladores que trabajan en entornos sin acceso a la nube.
- Servicio REST local para herramientas internas: con `basalt serve --model ... --rest` se puede exponer el modelo como endpoint HTTP en la propia maquina, integrandolo en scripts o aplicaciones de escritorio para tareas de asistencia y generacion.
- Evaluacion de tecnicas de cuantizacion extrema: investigadores interesados en QTIP, trellis quantization o BlockLDLQ pueden usar este checkpoint como referencia reproducible (el autor incluye el comando de conversion) para comparar perplejidad y calidad frente a cuantizaciones affine.
- Generacion de texto asistida en flujos de documentacion: para redaccion, resumen o reescritura de textos en local, aprovechando que el modelo base es de proposito general; la calidad concreta en estas tareas no esta medida en la informacion disponible.
- Banquito de pruebas para pipelines MLX: desarrolladores que construyen herramientas sobre MLX pueden validar su integracion con un checkpoint de 2 bpw antes de escalar a modelos mayores o a produccion en la nube.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son medidas de calidad y footprint en un Apple M4 Pro de 24 GB:

| Metrica | Valor medido |
|---|---|
| Metodo | QTIP 2.0 bpw Bitshift Trellis (L=16, V=2, HYB Q=9) + Kronecker RHT + BlockLDLQ (#409) |
| Footprint de pesos | 8,48 GB |
| Perplejidad WikiText-2 16k (4x4096) | 5,345 (frente a 19,146 de MLX affine 2-bit; -72,1 %) |
| Precision System One (N=300) | 245/300 (81,7 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,48 GB solo de pesos; con overhead de runtime y cache KV, el autor apunta a Macs de 16 GB como objetivo minimo.
- Hardware validado: Apple M4 Pro con 24 GB de memoria unificada (medicion reportada).
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; el formato es MLX y esta pensado para Apple Silicon.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada; no esta pensado para GPUs NVIDIA o AMD.
- Opciones de despliegue: runtime Basalt (app macOS y CLI, `basalt serve --rest`), libreria MLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| goodmai/Qwen3.8-27B-QTIP-2.0bpw-MLX | 4.550.853.872 (safetensors); 27B nominal en el nombre | QTIP 2.0 bpw trellis | no disponible | Apache 2.0 | MLX / Apple Silicon |
| mlx-community/Qwen3.8-27B-GPTQ-4bit (origen de la conversion) | 27B nominal | GPTQ 4-bit | no disponible | no disponible | MLX / Apple Silicon |
| Cuantizacion MLX affine 2-bit (referencia del autor) | 27B nominal | Affine 2-bit | no disponible | no disponible | MLX / Apple Silicon |

La comparativa se limita a las variantes citadas por el propio autor; no se dispone de datos de benchmarks ni de contexto para confrontar con alternativas de otros ecosistemas.

## Limitaciones y advertencias

- Inconsistencia de parametros: el nombre del repo y la model card hablan de 27B, pero el recuento real de safetensors es de 4.550.853.872 parametros. Conviene verificar el checkpoint antes de confiar en el tamano nominal.
- Cuantizacion extrema: 2,0 bpw es una compresion agresiva; aunque el autor reporta una perplejidad baja, no hay benchmarks de tareas (razonamiento, codigo, matematicas) que confirmen la calidad en uso real.
- Sin datos de sesgos ni de alucinacion: la model card no documenta evaluaciones de sesgo, toxicidad o tasas de alucinacion del modelo base.
- Idiomas y contexto no documentados: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar comportamiento multilingue o conversaciones de contexto largo.
- Dependencia de plataforma: formato MLX exclusivo para Apple Silicon; no es portable a CUDA ni a CPU convencional sin conversion adicional.
- Madurez y soporte: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; el runtime Basalt es un proyecto del mismo autor y requiere macOS 27 o superior.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-27B debe verificarse por separado para confirmar que su licencia es compatible.
- Sin garantias de produccion: no hay informacion sobre latencia, throughput ni estabilidad del runtime; no se recomienda para produccion sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-QTIP-2.0bpw-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Checkpoint de origen de la conversion: https://huggingface.co/mlx-community/Qwen3.8-27B-GPTQ-4bit
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo de lanzamiento Basalt (ru): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.8-27B-QTIP-2.0bpw-MLX&role=chat&lang=ru
- Demo de lanzamiento Basalt (en): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.8-27B-QTIP-2.0bpw-MLX&role=chat&lang=en
