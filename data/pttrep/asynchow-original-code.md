# PTTREP/asynchow-original-code

## Resumen

PTTREP/asynchow-original-code es un ajuste fino (fine-tuning) completo del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario PTTREP en HuggingFace. El entrenamiento se realizó con LLaMA-Factory sobre un conjunto de datos denominado asynchow_python_fixed, del que la model card no ofrece ninguna descripción, composición ni tamaño. El modelo resultante es un transformer decoder-only de 1.543.714.304 parámetros (1,54 B), con pesos en formato safetensors y licencia "other".

Se trata de un modelo derivado de la familia Qwen2, por lo que hereda la arquitectura y el tokenizador del modelo base, incluyendo su ventana de contexto nativa. Su relevancia es limitada y muy específica: es un artefacto de experimentación de bajo perfil, con 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks publicados (el bloque model-index está vacío) y sin documentación sobre usos previstos, datos de entrenamiento o evaluación.

Por su tamaño, es un candidato razonable para inferencia en hardware de consumo y para tareas de generación de código en Python si el ajuste sobre asynchow_python_fixed ha funcionado, pero no existe evidencia publicada que respalde una mejora sobre el modelo base. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), con Grouped Query Attention según el modelo base Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no declarada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos safetensors sin cuantizar (los 6,2 GB del repo son coherentes con FP32). Convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | other (la model card no detalla los términos) |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tipo de ajuste | fine-tuning completo (tag "full" de LLaMA-Factory), no LoRA |
| Dataset de ajuste | asynchow_python_fixed (sin descripción ni tamaño publicados) |
| Tamaño del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings de entrada y salida atados (tied embeddings) y atención con Grouped Query Attention (GQA) para reducir el coste de la caché KV. No se ha modificado la arquitectura, el tokenizador ni la ventana de contexto; el modelo es un checkpoint completo de pesos ajustados.

El entrenamiento se realizó con LLaMA-Factory en modalidad de fine-tuning completo sobre el dataset asynchow_python_fixed, presumiblemente orientado a código Python asíncrono por el nombre, aunque la model card no lo confirma ni indica su tamaño o procedencia. Los hiperparámetros documentados son: learning rate 1e-5, batch de entrenamiento 1, acumulación de gradiente 8 (batch efectivo 8), 2 épocas, scheduler coseno con warmup del 10 %, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8) y semilla 42. El entorno de entrenamiento fue Transformers 4.57.6, PyTorch 2.11.0+cu130, Datasets 4.0.0 y Tokenizers 0.22.2. No se documenta uso de RLHF, DPO ni ninguna innovación técnica adicional, y la sección de resultados de entrenamiento está vacía.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct (etiqueta "conversational").
- Generación de código, presumiblemente en Python y con énfasis en programación asíncrona según el nombre del dataset de ajuste; no verificado con evaluaciones.
- Instrucciones de propósito general y diálogo multi-turno en el rango de capacidad de un modelo de 1,5 B.
- Soporte de plantilla de chat de Qwen2.5 y compatibilidad con text-generation-inference (tags "text-generation-inference" y "endpoints_compatible").
- Tool calling / function calling: soportado por el modelo base Qwen2.5-1.5B-Instruct, pero no se puede confirmar que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no confirmadas tras el ajuste.
- Capacidades multilingües: no disponibles; la model card no declara idiomas y el dataset de ajuste parece monolingüe en Python.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Prototipado de asistentes de código en Python: el modelo puede actuar como autocompletado o asistente dentro de un IDE para sugerir fragmentos de código, gracias a su tamaño reducido, que permite ejecución local con latencia baja.
- Revisión de código asíncrono: dado el nombre del dataset de ajuste, es plausible usarlo para detectar patrones incorrectos en código `async`/`await`. Requiere validación propia, porque no hay evaluación publicada.
- Pruebas de concepto de fine-tuning con LLaMA-Factory: sirve como ejemplo reproducible de un ajuste completo sobre Qwen2.5-1.5B-Instruct con hiperparámetros documentados.
- Evaluación comparativa de ajustes pequeños: útil como punto de referencia en experimentos académicos sobre transferencia de conocimiento en modelos de menos de 2 B de parámetros.
- Generación de texto en entornos sin conexión: al caber en GPUs de consumo, es desplegable en estaciones de trabajo locales o portátiles con GPU para tareas de generación por lotes.
- Base para destilación o ajustes posteriores: al ser un checkpoint completo en safetensors, se puede reutilizar como punto de partida para nuevos ajustes con LoRA o QLoRA.
- Clasificación y extracción de información sobre código: con prompts adecuados, puede etiquetar funciones, extraer firmas o generar docstrings, siempre con verificación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El bloque model-index de la model card declara una única entrada ("sft_code") con la lista de resultados vacía, y no se incluyen métricas de pérdida, perplejidad ni evaluaciones tipo MMLU, HumanEval o GSM8K.

| Benchmark | Resultado |
|---|---|
| sft_code (model-index) | sin resultados publicados |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada en FP32 (formato del repositorio): en torno a 6,2 GB solo para pesos, más caché de activaciones y KV; cómodo en GPUs con 8-12 GB.
- VRAM estimada en BF16/FP16: aproximadamente 3,1 GB de pesos; con contexto de 8.000-32.000 tokens, entre 4 y 6 GB en total.
- VRAM estimada en INT8: alrededor de 1,6 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M, AWQ o GPTQ): aproximadamente 1 GB de pesos; viable en GPUs de 4-6 GB.
- Cabe en GPU de consumo: sí. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, así como iGPUs y CPU con cuantización Q4.
- GPU recomendadas para producción: cualquier GPU con al menos 8 GB de VRAM por instancia (L4, T4, A10G, RTX 4090); para lotes grandes, A100 o H100 permiten agrupar muchas réplicas por dispositivo.
- Opciones de despliegue: transformers, Text Generation Inference (etiqueta oficial), vLLM, SGLang, Ollama y llama.cpp (requiere convertir los safetensors a GGUF), además de endpoints compatibles según el tag "endpoints_compatible".
- Latencia y throughput: no disponibles. En un modelo de 1,54 B en BF16 sobre una RTX 4090 cabe esperar decenas de tokens por segundo por petición, pero es una estimación orientativa, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PTTREP/asynchow-original-code | 1,54 B | no declarado (32.768 en el modelo base) | sin benchmarks publicados | other (sin detalle) | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | benchmarks publicados por Qwen en la model card | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54 B | 32.768 tokens | benchmarks de código publicados por Qwen | Apache 2.0 | HuggingFace, ampliamente usado |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | benchmarks publicados por Meta | Llama 3.2 Community License | HuggingFace, requiere aceptar términos |

El ajuste no aporta ventajas verificables frente a Qwen2.5-1.5B-Instruct ni frente a Qwen2.5-Coder-1.5B-Instruct: carece de evaluación publicada y su licencia "other" es menos clara que la Apache 2.0 de los modelos de Qwen.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas de entrenamiento ni de validación, por lo que se desconoce si el ajuste mejora o degrada el modelo base.
- Riesgo de olvido catastrófico: un ajuste completo de 2 épocas sobre un dataset no descrito puede deteriorar capacidades generales del modelo base (razonamiento, multilingüismo, instrucciones).
- Riesgo de alucinación elevado, propio de un modelo de 1,5 B, especialmente en tareas de razonamiento largo o datos factuales.
- Contexto limitado: aunque el modelo base soporta 32.768 tokens, la model card no lo declara y no hay evidencia de que el ajuste conserve el rendimiento en contextos largos.
- Idiomas: no declarados; si el dataset de ajuste es monolingüe en Python, es probable que el rendimiento en castellano u otros idiomas se haya degradado.
- Licencia "other" sin texto asociado: no se puede confirmar si se permite el uso comercial. Al derivar de Qwen2.5-1.5B-Instruct (Apache 2.0), conviene revisar los términos aplicables antes de cualquier uso comercial.
- Trazabilidad limitada: autor sin historial verificable, repositorio con 0 descargas, 0 "likes" y creado y actualizado el mismo día; no hay paper, blog ni repositorio de código asociado.
- Dataset de ajuste desconocido: no se publica composición, tamaño ni licencia de asynchow_python_fixed, lo que impide auditar posibles sesgos o problemas de derechos de autor en el código usado para el entrenamiento.
- Pesos en FP32 en el repositorio: el consumo de disco y de VRAM es el doble que en BF16; conviene convertir a BF16 o cuantizar antes de desplegar.
- Para producción con código, se recomienda evaluar alternativas con licencia clara y benchmarks publicados, como Qwen2.5-Coder-1.5B-Instruct.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PTTREP/asynchow-original-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- LLaMA-Factory (framework de ajuste utilizado según los tags): no disponible en los resultados de búsqueda
- Paper, blog o repositorio del autor: no disponible
- Demos o endpoints públicos: no disponible
- Documentación del dataset asynchow_python_fixed: no disponible
