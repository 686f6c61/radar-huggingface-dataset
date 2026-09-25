# rat-lab/mh-fresh-K6-delta

## Resumen

rat-lab/mh-fresh-K6-delta es un adaptador LoRA de investigación publicado por rat-lab sobre el modelo base vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT, un ajuste supervisado de Gemma 2 2B. No es un modelo de propósito general: es la celda K=6, variante «delta», de una tabla experimental que cruza cobertura de muestreo y corrección de sesgo, entrenada con optimización de preferencias online (online IPO) y riesgo entrópico con tau = 10.

El adaptador se entrena desde cero (LoRA inicializado a cero, sin warm start), sobre el dataset PKU-Alignment/PKU-SafeRLHF, con corrección de sesgo de dos escalas temporales (two-timescale) mediante estimador delta-method y un paso de escala temporal gamma = 0.1. El repositorio contiene 8 checkpoints guardados cada 468 pasos (de 468 a 3744) de una ejecución planificada de 4680 pasos, por lo que, según la propia model card, el entrenamiento sigue en curso.

Su relevancia es metodológica más que de producto. El autor documenta explícitamente la procedencia del experimento para corregir un problema de independencia en una tabla anterior (mh-ec2-ttomd-*), donde las celdas K=2 y K=4 se habían ramificado desde el checkpoint 936 de la ejecución K=8 en lugar de partir de una base neutra. Este conjunto sirve, por tanto, para reproducir y auditar un protocolo de RLHF con control de riesgo y de sesgo, no para desplegarse como asistente final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; modelo base Gemma 2 2B |
| Parametros totales | No disponible en el repositorio (adaptador LoRA); el modelo base es un Gemma 2 2B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la hereda del modelo base, no se documenta en el repositorio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base Gemma está sujeto a los términos de uso de Gemma de Google) |
| Formato de pesos | safetensors, en formato de adaptador PEFT/LoRA |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un conjunto de pesos LoRA acoplados a un transformer decoder-only de escala 2B (Gemma 2 2B), concretamente sobre el ajuste vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT. La model card describe el procedimiento de entrenamiento con detalle: algoritmo online IPO (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`), cobertura K = 6 (`--ypp_samples 6`), riesgo entrópico con tau = 10, corrección de sesgo de dos escalas temporales con estimador delta-method y tamaño de paso TT gamma = 0.1. La inicialización es desde cero sobre la base SFT con LoRA a cero y 1000 pasos de warmup, semilla 42 y un máximo de 64 tokens nuevos por generación.

La innovación técnica que se documenta no está en la arquitectura, sino en el protocolo de optimización: la combinación de cobertura de muestreo (K), corrección de sesgo two-timescale y estimador delta-method aplicada a optimización de preferencias con aversión al riesgo. El conjunto de datos de preferencias es PKU-Alignment/PKU-SafeRLHF. El autor insiste en la independencia estadística de esta ejecución respecto a otros brazos experimentales, verificada en la línea de lanzamiento de cada job (sin `--init_adapter` ni `--load_dir`), lo que permite comparar celdas sin contaminación por warm start.

## Capacidades

- Generación de texto e instrucciones: capacidades heredadas del modelo base (Gemma 2 2B ajustado con SFT sobre Alpaca cleaned); no se verifican ni documentan en este repositorio.
- Optimización de preferencias: el adaptador está entrenado para alinear respuestas con preferencias humanas según el esquema online IPO sobre PKU-SafeRLHF.
- Aversión al riesgo: el entrenamiento incorpora riesgo entrópico (tau = 10), orientado a controlar la variabilidad del retorno en la optimización, no a una función de producto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de RLHF con aversión al riesgo: el checkpoint `checkpoint-3744` permite reanudar o auditar una ejecución online IPO con tau = 10 sobre PKU-SafeRLHF, usando el código de `risk_egpo/tt_omd.py`.
- Ablación de la cobertura K: al existir una tabla de celdas con distintos valores de K, este adaptador sirve como brazo K = 6 independiente para medir el efecto de la cobertura de muestreo sobre la alineación.
- Validación de la corrección de sesgo two-timescale: el estimador delta-method con gamma = 0.1 es el objeto de estudio; este adaptador es el material para medir empíricamente si la corrección reduce el sesgo respecto a otras celdas.
- Investigación en seguridad y alineación: al entrenarse sobre PKU-SafeRLHF, es útil para estudiar cómo el riesgo entrópico afecta a la tasa de respuestas inseguras frente al modelo base sin adaptar.
- Comparación de protocolos de preference optimization: permite contrastar online IPO con variantes como DPO o IPO estándar partiendo del mismo SFT base y el mismo dataset.
- Material didáctico y docencia: el repositorio documenta la línea de lanzamiento, los hiperparámetros y la procedencia de cada checkpoint, lo que lo convierte en un ejemplo trazable de pipeline PEFT + RLHF.
- Base para posteriores fine-tunings de investigación: al ser un adaptador LoRA pequeño sobre Gemma 2 2B, se puede cargar con `PeftModel.from_pretrained` y continuar el entrenamiento o fusionarlo con el modelo base para experimentos downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de tasa de respuestas seguras, ni comparaciones numéricas con otros brazos de la tabla experimental.

## Requisitos de hardware

- El adaptador LoRA no condiciona el consumo de memoria; el coste lo marca el modelo base de escala 2B. El repositorio completo ocupa 0.8 GB para 8 checkpoints.
- VRAM estimada para inferencia en bf16/fp16: del orden de 5-6 GB para un modelo de ~2B parámetros más caché KV y activaciones; cifra orientativa, no publicada por el autor.
- VRAM estimada en cuantización de 8 bits: en torno a 3 GB.
- VRAM estimada en cuantización de 4 bits (bitsandbytes o GGUF Q4): en torno a 2 GB.
- Cabe en GPU de consumo: cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.) puede ejecutar el modelo base fusionado con el adaptador en 8 o 4 bits. En bf16 requiere al menos 6-8 GB.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (soporta adaptadores LoRA), TGI y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-lab/mh-fresh-K6-delta | Adaptador LoRA de investigación | No disponible (base ~2B) | No disponible | No disponible | HuggingFace, 0 descargas, 8 checkpoints |
| vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT | Modelo base SFT (modelo completo) | ~2B | No disponible en esta ficha | No disponible | HuggingFace |
| google/gemma-2-2b-it | Modelo instructivo de referencia | ~2B | Según documentación pública de Google | Términos de uso de Gemma | HuggingFace |

La comparación con alternativas de la misma categoría (otros adaptadores LoRA de investigación sobre modelos de ~2B) no está disponible: la información proporcionada no incluye otros adaptadores comparables ni sus métricas. Tampoco se dispone de resultados que permitan comparar rendimiento con la base SFT o con Gemma 2 2B-it.

## Limitaciones y advertencias

- Entrenamiento incompleto: solo se han subido checkpoints hasta el paso 3744 de 4680 (8 checkpoints cada 468 pasos). El estado final no está publicado y el autor indica que se añadirán más adelante.
- Licencia no declarada: el repositorio no especifica licencia. Al derivar de Gemma 2 2B, se aplican además los términos de uso de Gemma, que imponen restricciones de uso comercial y de redistribución.
- Artefacto de investigación, no de producción: 0 descargas y 0 «likes»; no hay pipeline declarado, ni idiomas, ni cuantizaciones, ni métricas de calidad.
- Sin benchmarks: no hay evidencia publicada de que el adaptador mejore a la base SFT en ninguna tarea medible.
- Riesgo de alucinación y sesgos heredados: al ser un ajuste LoRA sobre un modelo de 2B, mantiene los sesgos y la propensión a la alucinación del modelo base, no corregidos explícitamente por este entrenamiento.
- Datos de seguridad: el entrenamiento usa PKU-Alignment/PKU-SafeRLHF; conviene auditar el comportamiento resultante en dominios sensibles en lugar de asumir una mejora automática de seguridad.
- Terminología interna sin definir: «fresh», «delta», «K=6» y «two-timescale» son etiquetas del experimento del autor; no se documenta su significado completo fuera del contexto de la tabla de ablación.
- Fechas de los metadatos: el repositorio figura creado el 2026-09-25 y el job de entrenamiento lanzado el 2026-09-22; se reproducen tal cual aparecen en la model card.
- Trazabilidad parcial: la reproducibilidad depende del código `risk_egpo/tt_omd.py` y de la línea de lanzamiento del job SLURM 40455925 en el clúster UW Hyak, no incluidos como artefactos en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-fresh-K6-delta
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Modelo Gemma 2 2B instructivo de referencia: https://huggingface.co/google/gemma-2-2b-it
- Dataset de preferencias: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Biblioteca PEFT: https://github.com/huggingface/peft

Nota: la búsqueda web asociada a este modelo no devolvió enlaces relevantes. Todos los resultados obtenidos eran páginas sobre el animal «rata» (Wikipedia, artículos divulgativos y de control de plagas) y no guardan relación con el modelo rat-lab/mh-fresh-K6-delta.
