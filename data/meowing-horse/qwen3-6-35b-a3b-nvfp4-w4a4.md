# meowing-horse/Qwen3.6-35B-A3B-NVFP4-W4A4

## Resumen

Qwen3.6-35B-A3B-NVFP4-W4A4 es una versión cuantizada a NVFP4 del modelo Qwen3.6-35B-A3B de Alibaba, generada por el usuario meowing-horse mediante NVIDIA Model Optimizer (nvidia-modelopt v0.44.0). El modelo base es un transformer autorregresivo con arquitectura Mixture-of-Experts (MoE) y atención híbrida, con 35B parámetros totales y 3B activos por token, lo que permite un equilibrio entre capacidad y coste de inferencia. La cuantización NVFP4 reduce los pesos y activaciones de los operadores lineales a 4 bits en formato FP4 de NVIDIA, pensada para aprovechar el hardware Blackwell.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue pre-cuantizado: el objetivo no es entrenar, sino servir el modelo en vLLM sobre GPUs Hopper o Blackwell con menor huella de memoria y mayor throughput que la versión en BF16. El modelo base incorpora capacidades multimodales (texto, imagen y vídeo como entrada) y una ventana de contexto de hasta 262K tokens, lo que lo sitúa en la categoría de modelos de propósito general para agentes, RAG y chatbots.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 23,5 GB. Los pesos en safetensors suman 18.683.860.336 parámetros reales, un dato que difiere de los "35B" nominales del modelo base y que conviene tener en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con Mixture-of-Experts (MoE) y atención híbrida |
| Parametros totales | 35B nominales (modelo base); 18.683.860.336 en safetensors del repo cuantizado |
| Parametros activos | 3B (MoE) |
| Longitud de contexto | Hasta 262K tokens |
| Tipos de cuantizacion | NVFP4 (W4A4: pesos y activaciones de operadores lineales en FP4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 23,5 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer autorregresivo con arquitectura Mixture-of-Experts y atención híbrida. Los 35B parámetros totales se reparten en expertos de los que solo se activan 3B por token, lo que reduce el coste computacional por paso de decodificación manteniendo una capacidad de representación alta. La atención híbrida combina mecanismos de atención con el objetivo de extender la ventana de contexto efectiva hasta 262K tokens. La entrada admite texto (string), imagen (RGB) y vídeo (MP4/WebM), y la salida es únicamente texto.

Esta variante concreta no ha sido entrenada desde cero: es el resultado de aplicar cuantización post-entrenamiento (PTQ) con nvidia-modelopt v0.44.0 sobre los pesos del modelo base. Solo se cuantizan pesos y activaciones de los operadores lineales; el resto de la arquitectura se mantiene. El proceso de calibración utilizó los datasets cnn_dailymail (más de 300.000 artículos de noticias en inglés) y Nemotron-Post-Training-Dataset-v2 (conversaciones multiturno de NVIDIA). Los detalles sobre los datos de entrenamiento originales del modelo base figuran como "undisclosed" en la model card. La versión de cuantización es NVFP4 1.0.

## Capacidades

- Generación de texto y conversación multiturno con contexto de hasta 262K tokens.
- Razonamiento académico y de dominio: el modelo base se evalúa en MMLU Pro, GPQA Diamond y AIME 2025.
- Codificación científica y de propósito general: evaluación en SciCode.
- Capacidades multimodales de entrada: texto, imagen y vídeo (MP4/WebM), con razonamiento multimodal evaluado en MMMU Pro.
- Uso de herramientas y agentes: evaluación en τ²-Bench Telecom, que mide tool-use agéntico y adherencia a políticas en escenarios de doble control.
- Seguimiento de instrucciones estructuradas: evaluación en IFBench.
- Recuperación en contexto largo: evaluación en AA-LCR (Artificial Analysis Long Context Recall).
- No se especifican en la información disponible modos especiales como thinking mode, audio o decodificación especulativa.

## Casos de uso

- Agentes de atención al cliente con tool calling: el modelo puede gestionar conversaciones multiturno e invocar herramientas externas para resolver incidencias de cuenta, un escenario directamente cubierto por la evaluación en τ²-Bench Telecom y favorecido por la ventana de 262K tokens.
- RAG sobre documentación extensa: con 262K tokens de contexto y evaluación en AA-LCR, es adecuado para recuperar y razonar sobre grandes volúmenes de documentos sin trocear en exceso.
- Asistentes de código en pipelines de CI/CD: las capacidades de codificación (SciCode) y el formato NVFP4 optimizado para vLLM permiten integrarlo en servicios de revisión y generación de código con menor coste de memoria.
- Análisis multimodal de documentos e imágenes: al aceptar imagen como entrada y evaluarse en MMMU Pro, puede emplearse en extracción y razonamiento sobre capturas, diagramas o documentos escaneados.
- Procesamiento de vídeo para moderación o resumen: la entrada de vídeo MP4/WebM permite construir pipelines de descripción y análisis de contenido audiovisual.
- Despliegue de chatbots de propósito general en producción: la cuantización W4A4 reduce la huella de memoria frente a BF16 y el soporte de vLLM sobre Hopper y Blackwell facilita el serving a escala.
- Evaluación de instrucciones complejas en sistemas de automatización: IFBench respalda su uso en tareas con restricciones estructuradas, como generación de informes con formato fijo.

## Benchmarks y rendimiento

La model card enumera los datasets de evaluación del modelo base (MMLU Pro, GPQA Diamond, τ²-Bench Telecom, MMMU Pro, SciCode, AIME 2025, AA-LCR, IFBench), pero no proporciona los resultados numéricos en la información disponible. No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado | Comparativa |
|---|---|---|
| MMLU Pro | no disponible | no disponible |
| GPQA Diamond | no disponible | no disponible |
| τ²-Bench Telecom | no disponible | no disponible |
| MMMU Pro | no disponible | no disponible |
| SciCode | no disponible | no disponible |
| AIME 2025 | no disponible | no disponible |
| AA-LCR | no disponible | no disponible |
| IFBench | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: el repo ocupa 23,5 GB en safetensors, por lo que la inferencia en NVFP4 requiere del orden de 24 GB de memoria para pesos, más overhead de KV cache y activaciones; el contexto de 262K tokens incrementa sustancialmente la memoria de KV cache.
- GPUs recomendadas: NVIDIA Hopper (H100, H200) y NVIDIA Blackwell (GB300 es el hardware de test declarado en la model card).
- GPU de consumo: no se especifica compatibilidad con GPUs consumer; NVFP4 está orientado a arquitecturas Hopper y Blackwell, por lo que no se garantiza su funcionamiento en RTX 4090 (Ada) ni en generaciones anteriores.
- Motor de despliegue: vLLM es el único runtime declarado como soportado. No se mencionan llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-NVFP4-W4A4 (este) | 35B nominales / 18,68B en safetensors | 3B | 262K | NVFP4 W4A4 | Apache 2.0 | vLLM |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | 3B | 262K | BF16 (presumiblemente) | Apache 2.0 | no disponible |
| nvidia/Qwen3.6-35B-A3B-NVFP4 | 35B | 3B | 262K | NVFP4 | Apache 2.0 | vLLM |

La comparativa se limita al modelo base y a la versión NVFP4 publicada por NVIDIA, ya que no se dispone de datos de rendimiento de alternativas de otros fabricantes en la información proporcionada. No disponible para comparaciones con modelos de otras familias.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos del modelo base; al ser una cuantización, hereda los del original, pero no se documentan explícitamente.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos; no se aportan tasas de error ni evaluaciones de fidelidad.
- Idiomas soportados no disponibles: no se puede confirmar el grado de cobertura multilingüe ni el rendimiento fuera del inglés.
- La cuantización a FP4 puede degradar la precisión respecto a BF16; no se ofrecen métricas de la pérdida de calidad introducida por el PTQ.
- La licencia Apache 2.0 permite uso comercial, pero la model card remite a los términos del modelo base de Alibaba y recomienda pruebas específicas de caso de uso antes de desplegar.
- Restricción de hardware: NVFP4 está pensado para Hopper y Blackwell; no se declara soporte para GPUs consumer ni para otros runtimes distintos de vLLM.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-21), por lo que carece de validación comunitaria.
- Discrepancia entre los 35B nominales del modelo base y los 18,68B parámetros en safetensors del repo cuantizado; conviene verificar la integridad del checkpoint antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meowing-horse/Qwen3.6-35B-A3B-NVFP4-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Versión NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
