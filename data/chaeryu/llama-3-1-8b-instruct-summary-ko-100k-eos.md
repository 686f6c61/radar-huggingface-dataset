# chaeryu/llama-3.1-8b-instruct-summary-ko-100k-eos

## Resumen

`chaeryu/llama-3.1-8b-instruct-summary-ko-100k-eos` es un adaptador LoRA (PEFT) publicado por el usuario chaeryu sobre el modelo base `meta-llama/Meta-Llama-3.1-8B-Instruct` de Meta. El nombre del repositorio sugiere un ajuste fino orientado a tareas de resumen en coreano (`summary-ko`) sobre un conjunto de datos de aproximadamente 100.000 ejemplos (`100k`), con un token de fin de secuencia personalizado (`eos`), aunque la model card no documenta explícitamente ni el dataset ni esa configuración.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B Instruct, con 8.000 millones de parámetros densos y una ventana de contexto nativa de 128.000 tokens. Al tratarse de un adaptador LoRA y no de un modelo completo, el repositorio contiene los pesos del adaptador más los artefactos de entrenamiento (el tamaño del repo, 14,1 GB, es coherente con la inclusión de checkpoints intermedios o del modelo base en el árbol de ficheros).

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino de un particular, con documentación mínima, sin benchmarks publicados y con cero likes y 126 descargas en el momento de la consulta. Resulta útil como referencia para quienes quieran reproducir un pipeline de LoRA sobre Llama 3.1 8B para resumen en coreano, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite cuantizaciones estándar (8-bit, 4-bit) vía bitsandbytes/GGUF, pero el autor no publica versiones cuantizadas |
| Idiomas soportados | no disponibles oficialmente; el nombre del repositorio indica coreano (`ko`) para la tarea de resumen, y el modelo base soporta multilingüismo (8 idiomas oficiales de Llama 3.1) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Meta-Llama-3.1-8B-Instruct`, un transformer decoder-only denso de 8.000 millones de parámetros con atención por grupos (GQA en el modelo base), RoPE y contexto nativo de 128.000 tokens. El ajuste se realizó con PEFT 0.21.2 sobre Transformers 5.22.2 y PyTorch 2.14.1+cu130, según las versiones declaradas en la model card.

Los hiperparámetros documentados son: learning rate 2e-05, batch size de entrenamiento 2 con acumulación de gradiente de 16 pasos (batch efectivo 32), optimizador AdamW (betas 0.9/0.999, epsilon 1e-08), scheduler coseno con 470 pasos de warmup y 3 épocas. La curva de validación muestra una pérdida que desciende de 0,7886 en el paso 500 a 0,7381 en el paso 7000, con un mínimo local de 0,7355 en el paso 6000 y un repunte posterior hasta 0,7381, lo que sugiere un inicio de sobreajuste en la última fracción del entrenamiento. La pérdida de validación final declarada es 0,7381. No se documentan ni la composición del dataset, ni el número de tokens de entrenamiento, ni si hubo RLHF/DPO adicional; la model card indica explícitamente "More information needed" en esas secciones.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama 3.1 8B Instruct.
- Resumen de texto en coreano, presumiblemente la capacidad objetivo del ajuste fino según el nombre del repositorio.
- Razonamiento y matemáticas de nivel 8B, limitados por el tamaño del modelo base.
- Generación de código, heredada del modelo base.
- Soporte de tool calling / function calling, heredado del formato de plantilla de Llama 3.1 Instruct.
- Capacidades multilingües del modelo base (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés declarados por Meta para Llama 3.1); el coreano no figura entre los idiomas oficialmente soportados por el modelo base, lo que hace relevante este ajuste específico.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Resumen de documentos en coreano: el adaptador está entrenado específicamente para esta tarea, por lo que puede emplearse para condensar artículos, informes o actas en coreano manteniendo el formato conversacional del modelo base.
- Resumen de conversaciones de atención al cliente: con la ventana de 128.000 tokens del modelo base, puede procesar hilos de soporte largos y generar resúmenes en coreano para sistemas de ticketing.
- Preprocesado de corpus coreanos para pipelines de búsqueda o RAG: generación de resúmenes de fragmentos antes de indexarlos en un motor vectorial.
- Generación de resúmenes ejecutivos de reuniones transcritas: el modelo base maneja entradas largas y el ajuste orienta la salida hacia resúmenes concisos.
- Prototipado de asistentes conversacionales en coreano: al conservar la plantilla de chat de Llama 3.1 Instruct, puede integrarse en frameworks de agentes con tool calling.
- Evaluación comparativa de técnicas LoRA: sirve como referencia reproducible para estudiar el efecto de un ajuste LoRA de 3 épocas con learning rate 2e-05 sobre Llama 3.1 8B en una tarea de resumen monolingüe.
- Filtrado y destilación de datasets: uso del modelo para generar resúmenes de referencia en coreano que alimenten otros procesos de anotación.

## Benchmarks y rendimiento

La model card declara un `model-index` sin resultados (`"results": []`). No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de rendimiento es la pérdida de validación del entrenamiento (0,7381 al final del ajuste, mínimo de 0,7355 en el paso 6000), que no es comparable con métricas de benchmarks estándar como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 16 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos moderados.
- Cuantización 8-bit: alrededor de 8-9 GB de VRAM; cuantización 4-bit: alrededor de 5-6 GB. Estas cifras corresponden al modelo base, ya que el autor no publica versiones cuantizadas del adaptador.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 128.000 tokens; RTX 4090 (24 GB) para FP16 con contextos moderados; RTX 3090/4080 (16-24 GB) para cuantización 8-bit.
- Cabe en GPU de consumo: sí, en RTX 4090 con FP16 y en GPUs de 8-12 GB con cuantización 4-bit, siempre aplicando el adaptador LoRA sobre el modelo base.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA; llama.cpp/Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF; Transformers + PEFT para inferencia directa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chaeryu/llama-3.1-8b-instruct-summary-ko-100k-eos | 8B (base) + LoRA | 128.000 | Adaptador LoRA sobre Llama 3.1 8B Instruct | llama3.1 | Hugging Face, 126 descargas |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8B | 128.000 | Modelo completo | llama3.1 | Hugging Face, ampliamente adoptado |
| Qwen2.5-7B-Instruct | 7B | 128.000 | Modelo completo | Apache 2.0 | Hugging Face, con mejor soporte multilingüe declarado, incluido coreano |
| Mistral-7B-Instruct-v0.3 | 7B | 32.000 | Modelo completo | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks del adaptador que permitan una comparación de rendimiento cuantitativa con estas alternativas. La comparación relevante es de naturaleza cualitativa: el adaptador de chaeryu ofrece una especialización en resumen coreano que los modelos generalistas no tienen, pero carece de documentación, evaluación y garantías de mantenimiento.

## Limitaciones y advertencias

- Documentación mínima: la model card contiene secciones sin completar ("More information needed") sobre descripción, usos previstos, limitaciones y datos de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo base en tareas de resumen en coreano.
- Riesgo de sobreajuste: la pérdida de validación repunta ligeramente tras el paso 6000 (de 0,7355 a 0,7381), lo que sugiere que el checkpoint final no es necesariamente el óptimo.
- El coreano no figura entre los idiomas oficialmente soportados por Llama 3.1; el rendimiento en ese idioma depende enteramente de la calidad del dataset de ajuste, no documentado.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en resúmenes de documentos largos o técnicos.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset de ajuste, desconocido.
- Licencia Llama 3.1 Community License: permite uso comercial con restricciones (política de uso aceptable, obligación de atribución y de nombrar el modelo "Llama 3.1" en determinados contextos); conviene revisar los términos antes de un despliegue en producción.
- Al ser un adaptador LoRA, requiere cargar el modelo base completo; el repositorio de 14,1 GB puede incluir artefactos adicionales que conviene inspeccionar antes de descargar.
- Sin garantías de mantenimiento ni soporte por parte del autor; el modelo tiene cero likes y un volumen de descargas muy bajo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chaeryu/llama-3.1-8b-instruct-summary-ko-100k-eos
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
