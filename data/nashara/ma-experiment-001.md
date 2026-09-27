# nashara/ma-experiment-001

## Resumen

MA Experiment 001 es un modelo de lenguaje de tipo GPT decoder-only entrenado desde cero por el autor identificado como nashara en HuggingFace. Se trata de un proyecto de investigación de una Matura suiza centrado en la eficiencia de modelos de lenguaje, y el repositorio publica exclusivamente los pesos de inferencia en FP16, el tokenizador correspondiente y la implementación propia necesaria para cargarlo. Con 30.384.000 parámetros (10 capas, 6 cabezas de atención, anchura oculta 384 y una longitud de contexto de 1.024 tokens), es un modelo deliberadamente compacto que sigue la implementación nanoGPT de Andrej Karpathy.

El modelo es un modelo base (no ajustado por instrucciones) entrenado durante 18.310 pasos sobre el dataset FineWeb-Edu con semilla 1337. Su relevancia es fundamentalmente educativa y de investigación: sirve como banco de pruebas reproducible para estudiar el comportamiento de modelos pequeños, el escalado, la tokenización y las técnicas de entrenamiento desde cero, en un rango de tamaño que cabe en cualquier GPU de consumo e incluso en CPU.

No incluye cuantizaciones publicadas distintas de FP16, no declara licencia en los metadatos de HuggingFace (aunque el README indica que hereda la licencia MIT de nanoGPT) y sus pesos no se cargan directamente con `transformers.AutoModel`, sino con el `model.py` incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (basado en nanoGPT) |
| Parametros totales | 30.384.000 (30,4 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | solo FP16 (no se publican GGUF ni otras cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | no declarada en los metadatos de HuggingFace; el README indica que la implementacion conserva la licencia MIT de nanoGPT |
| Formato de pesos | PyTorch nativo (`model.fp16.pt`, FP16); no cargable con `transformers.AutoModel` |
| Capas | 10 |
| Cabezas de atencion | 6 |
| Anchura oculta | 384 |
| Tokenizador | BPE propio de 32.000 tokens (`tokenizer.json`) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con atención causal estándar, derivado de la implementación nanoGPT. La configuración concreta es de 10 capas, 6 cabezas de atención por capa, una anchura oculta de 384 y una ventana de contexto de 1.024 tokens, lo que da un total de 30.384.000 parámetros. Se trata de una configuración personalizada, más pequeña que las variantes habituales de nanoGPT/GPT-2, elegida presumiblemente para ajustar el coste de entrenamiento al alcance de un proyecto de investigación escolar.

El entrenamiento se realizó desde cero (sin inicialización a partir de pesos preentrenados) durante 18.310 pasos sobre FineWeb-Edu, un subconjunto filtrado por calidad educativa del corpus FineWeb, con semilla 1337 para garantizar reproducibilidad. No se especifica en la información disponible el número total de tokens procesados, el tamaño de lote, la tasa de aprendizaje ni si hubo fases de ajuste fino con RLHF o DPO; el README indica explícitamente que es un modelo base y no un asistente ajustado por instrucciones. La exportación publicada es la versión FP16 del checkpoint final de preentrenamiento, con hashes SHA-256 documentados tanto para el checkpoint fuente como para los pesos exportados y el tokenizador.

## Capacidades

- Generación de texto autorregresiva básica en inglés, condicionada por un token de inicio `<|endoftext|>`.
- Modelado de lenguaje y continuación de texto a partir de un prompt (completado, no diálogo).
- Tokenización BPE propia de 32.000 tokens, incluida en el repositorio.
- Ejecución en CPU y en CUDA; el README documenta ambos modos.
- Inferencia en FP16 con `torch.load` y la implementación `model.py` incluida.

No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio, ni modo de "pensamiento". Tampoco se declara soporte multilingüe más allá del inglés, pese a que el ejemplo de la model card usa un prompt en alemán ("Das Modell") como ilustración.

## Casos de uso

- Investigación educativa sobre eficiencia de modelos: replicar el entrenamiento con la semilla 1337 y estudiar cómo varía la pérdida y la calidad de generación al modificar capas, cabezas o anchura oculta en un rango de 30 M de parámetros.
- Enseñanza de fundamentos de transformers: cargar `model.py` y `tokenizer.json` permite inspeccionar paso a paso el forward pass, la atención causal y el muestreo con `temperature` y `top_k` sin la complejidad de un framework grande.
- Experimentos de tokenización: al incluir un BPE propio de 32.000 tokens, sirve para analizar el efecto del vocabulario y de la segmentación en la calidad de la continuación de texto en inglés.
- Pruebas de infraestructura de inferencia: por su tamaño (unos 61 MB en FP16) es útil como carga de trabajo mínima para validar pipelines de despliegue en CPU, contenedores o entornos sin GPU antes de pasar a modelos mayores.
- Estudio de sesgos y alucinación en modelos pequeños: permite documentar cómo un modelo base de este tamaño produce texto incoherente o factualmente incorrecto y compararlo con modelos mayores en las mismas tareas.
- Prototipado de demos interactivas ligeras: al correr en CPU, puede integrarse en cuadernos o demos web locales para ilustrar generación de texto sin depender de servicios externos.
- Reproducibilidad y auditoría: los hashes SHA-256 del checkpoint, los pesos y el tokenizador permiten verificar la procedencia exacta de los artefactos en trabajos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplexity sobre conjuntos de validación ni ninguna otra evaluación cuantitativa, y tampoco se declara una pérdida de validación final. Cualquier cifra de rendimiento sería una invención, por lo que se omite.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 61 MB solo para los pesos en FP16 (30,4 M × 2 bytes), más el coste de activaciones y caché KV, que para una ventana de 1.024 tokens es reducido; en la práctica, por debajo de 1 GB en total.
- GPU recomendadas: cualquier GPU moderna sirve, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo queda muy por debajo de la capacidad de todas ellas.
- Consumer GPU: cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso en GPUs integradas.
- CPU: el README confirma soporte de inferencia en CPU, lo que permite ejecutarlo sin GPU.
- Opciones de despliegue: no hay integración oficial con vLLM, llama.cpp, Ollama o TGI, ya que los pesos son PyTorch nativos y requieren `model.py`; sería necesario escribir una capa de adaptación o convertir los pesos para usarlos en esos entornos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia muy baja tanto en CPU como en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| MA Experiment 001 | 30,4 M | 1.024 tokens | no declarada en metadatos; README indica MIT heredada de nanoGPT | PyTorch nativo, requiere `model.py` |
| GPT-2 (124 M) | 124 M | 1.024 tokens | MIT | safetensors, GGUF, integrado en `transformers` |
| SmolLM-135M | 135 M | 2.048 tokens | Apache-2.0 | safetensors, GGUF, integrado en `transformers` |
| TinyStories-33M | 33 M | 512 tokens | MIT | safetensors, integrado en `transformers` |

Los datos de rendimiento de benchmarks de estos modelos comparables no se incluyen en la información disponible para MA Experiment 001, por lo que no es posible establecer una comparación cuantitativa. La diferencia principal frente a las alternativas es de ecosistema: MA Experiment 001 no se carga con `transformers` y no ofrece cuantizaciones ni integración con herramientas de despliegue estándar.

## Limitaciones y advertencias

- Es un modelo base, no un asistente ajustado por instrucciones; no sigue instrucciones ni mantiene diálogos coherentes.
- El propio autor advierte de que las salidas pueden ser incoherentes, sesgadas o factualmente incorrectas.
- No ha sido evaluado para uso en producción ni en aplicaciones críticas para la seguridad.
- La ventana de contexto es de solo 1.024 tokens, insuficiente para tareas que requieran contexto largo.
- El idioma declarado es únicamente el inglés; el comportamiento en otros idiomas no está garantizado ni evaluado.
- Los sesgos conocidos no están documentados; al entrenar sobre FineWeb-Edu, hereda los sesgos presentes en ese corpus.
- Riesgo de alucinación elevado por el reducido tamaño del modelo y la ausencia de ajuste por instrucciones.
- La licencia no está declarada en los metadatos de HuggingFace; aunque el README indica que la implementación conserva la licencia MIT de nanoGPT, conviene verificar el archivo `LICENSE` del repositorio antes de un uso comercial.
- Los pesos no son cargables con `transformers.AutoModel`; dependen de `model.py`, lo que limita su integración directa en pipelines estándar.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay validación comunitaria ni informes independientes de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nashara/ma-experiment-001
- Dataset de entrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Implementación nanoGPT de Andrej Karpathy (base del código): https://github.com/karpathy/nanoGPT
- Paper de FineWeb / FineWeb-Edu: no disponible en la informacion proporcionada
- Repositorio del proyecto o demo: no disponible en la informacion proporcionada
