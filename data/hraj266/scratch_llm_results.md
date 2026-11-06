# hraj266/scratch_llm_results

## Resumen

`scratch_llm_results` es un modelo de generación de texto publicado en Hugging Face por el usuario `hraj266`. Se trata de un modelo basado en la arquitectura GPT-2 (según los tags del repositorio), con 38.473.216 parámetros totales, generado automáticamente mediante el `Trainer` de la librería Transformers a partir de un proceso de fine-tuning. El repositorio tiene un tamaño de 0,2 GB y los pesos están en formato safetensors.

La información disponible es muy limitada: la model card es la plantilla autogenerada por el `Trainer` y no ha sido completada por el autor. No se especifica el modelo base sobre el que se hizo el fine-tuning (el campo aparece vacío), ni el dataset de entrenamiento (figura como `None`), ni los idiomas soportados, ni la licencia. El modelo no registra descargas ni likes en el momento de la consulta.

Por su naturaleza (fine-tuning de GPT-2 con pérdida de validación de 9,4696, un valor muy alto), parece un experimento de entrenamiento o una prueba de concepto más que un modelo destinado a producción. Su relevancia práctica es escasa para desarrolladores e investigadores, pero se documenta aquí por completitud y para dejar constancia de sus especificaciones verificables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, según tags) |
| Parámetros totales | 38.473.216 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, compatible con cuantización estándar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura GPT-2, un transformer decoder-only con atención causal completa. Con 38,47 millones de parámetros, se sitúa en el rango de las variantes pequeñas de GPT-2 (la versión "small" tiene 124 millones; esta cifra es inferior, lo que sugiere una configuración reducida de capas o dimensiones, aunque el detalle no está disponible). Los tags indican compatibilidad con `text-generation-inference` y `endpoints_compatible`.

El entrenamiento se realizó mediante fine-tuning con el `Trainer` de Transformers 5.22.0 sobre PyTorch 2.11.0+cu130. Los hiperparámetros documentados son: learning rate de 0,0005, batch size de entrenamiento y evaluación de 2, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 3 épocas y precisión mixta nativa (AMP). El entrenamiento constó de solo 6 pasos (2 pasos por época con batch size 2), lo que indica un dataset extremadamente pequeño. La pérdida de validación final fue de 9,4696, un valor muy elevado que refleja un ajuste deficiente y un modelo lejos de ser funcional para generación de texto coherente. No se documenta el dataset, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva, según la pipeline declarada (`text-generation`).
- Compatibilidad con la librería Transformers y con `text-generation-inference`.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay información sobre modos especiales (thinking, visión, audio).

## Casos de uso

- Pruebas de integración de pipelines de Transformers: el modelo puede usarse para verificar que un entorno de despliegue (Transformers, TGI) carga correctamente un checkpoint en safetensors, dado su reducido tamaño de 0,2 GB.
- Experimentos educativos sobre fine-tuning: sirve como ejemplo de los artefactos que genera el `Trainer` y de cómo interpretar las curvas de pérdida de entrenamiento y validación.
- Pruebas de humo en infraestructura de inferencia: por su tamaño, se puede desplegar en cualquier GPU consumer para validar configuraciones de `text-generation-inference` o endpoints antes de pasar a modelos mayores.
- Reproducción de experimentos de entrenamiento: los hiperparámetros documentados permiten replicar el proceso con un dataset propio para estudiar el comportamiento de GPT-2 a pequeña escala.
- Docencia sobre arquitecturas transformer: el modelo permite inspeccionar los pesos y la configuración de un GPT-2 reducido sin necesidad de grandes recursos.
- No se recomienda su uso en aplicaciones de producción reales (atención al cliente, generación de código, análisis de documentos) debido a la pérdida de validación de 9,4696 y a la ausencia de documentación sobre datos e idiomas.

## Benchmarks y rendimiento

El `model-index` del autor no contiene resultados de benchmarks (lista `results` vacía). La única métrica publicada es la pérdida de validación del entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de validación final | 9,4696 |
| Pérdida de entrenamiento final | 6,9528 (época 3,0, paso 6) |
| Pérdida de validación mínima | 9,4539 (época 2,5, paso 5) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,15 GB solo para pesos (38,47 M parámetros × 4 bytes), más overhead de activaciones y del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,08 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU para inferencia puntual.
- GPU recomendadas: ninguna en particular; cualquier GPU con al menos 1-2 GB de VRAM es suficiente.
- Opciones de despliegue: Transformers (nativo), text-generation-inference (tag declarado), y potencialmente llama.cpp/Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hraj266/scratch_llm_results | 38,47 M | no disponible | no disponible | Hugging Face | Fine-tuning experimental, pérdida de validación 9,4696 |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, OpenAI | Modelo base de referencia, ampliamente documentado |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT | Hugging Face, OpenAI | Mayor capacidad, misma familia arquitectónica |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face | Destilado de GPT-2, orientado a eficiencia |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- La pérdida de validación de 9,4696 es muy alta, lo que indica que el modelo probablemente genera texto incoherente o repetitivo.
- El entrenamiento constó de solo 6 pasos con batch size 2, insuficiente para un ajuste significativo.
- No se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos que pueda haber adquirido.
- No se especifica el modelo base, lo que impide conocer su linaje y sus limitaciones heredadas.
- No hay información sobre idiomas soportados; no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma.
- La licencia no está disponible, lo que impide determinar si el uso comercial está permitido; se debe contactar con el autor antes de cualquier uso en producción.
- Riesgo elevado de alucinación y de generación de contenido sin sentido dada la métrica de pérdida.
- No apto para producción, investigación seria ni aplicaciones de usuario final sin una reevaluación y un reentrenamiento completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hraj266/scratch_llm_results
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
