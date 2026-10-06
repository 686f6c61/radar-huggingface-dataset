# Rajeshwari-Chanda/bloom-1b7_wanda_0.9

## Resumen

`Rajeshwari-Chanda/bloom-1b7_wanda_0.9` es un checkpoint derivado de BLOOM-1b7 (1.722.408.960 parámetros, arquitectura transformer decoder-only) al que se le ha aplicado, a juzgar por el nombre del repositorio, una poda del 90 % de los pesos mediante el método Wanda (pruning por pesos y activaciones). Es decir, no se trata de un modelo entrenado desde cero, sino de un ejercicio de compresión extrema sobre un modelo base multilingüe de la familia BigScience BLOOM.

El interés de esta ficha es acotado pero legítimo: sirve como artefacto de investigación para estudiar el comportamiento de los transformers de ~1,7 B parámetros bajo una poda no estructurada muy agresiva (sparsity 0.9) y para evaluar si la degradación de calidad a ese nivel de compresión es aceptable en tareas concretas. No hay evidencia publicada en el repositorio de que el modelo se haya reentrenado o ajustado tras la poda, lo que condiciona fuertemente cualquier uso en producción.

La model card es la plantilla automática de HuggingFace y no contiene información sustantiva: no declara autoría real, idiomas, licencia, datos de entrenamiento ni métricas. El repositorio tiene 0 descargas y 0 "likes", sin checkpoints cuantizados ni versiones GGUF. Todo lo que figura en esta ficha procede de los metadatos del Hub, del recuento real de parámetros en safetensors y de las características conocidas del modelo base BLOOM-1b7 y del método de poda referenciado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia BLOOM: atención causal con sesgo ALiBi, capas pre-LN). Confirmada por la `library_name: transformers` y el tag `bloom`; detalles concretos de capas no disponibles |
| Parámetros totales | 1.722.408.960 (~1,72 B), recuento real sobre los safetensors del repositorio |
| Parámetros activos | No aplica: no es un modelo MoE. Si el sufijo `wanda_0.9` indica 90 % de sparsity, aproximadamente el 90 % de los pesos estaría a cero, pero el número de parámetros del grafo no cambia |
| Longitud de contexto | 2.048 tokens (valor del modelo base BLOOM-1b7; no confirmado en la model card de este checkpoint) |
| Tipos de cuantización | No especificados por el autor. Pesos distribuidos sin cuantizar en safetensors (3,5 GB, coherente con almacenamiento en 16 bits). No hay checkpoints GPTQ, AWQ, GGUF ni int8 publicados |
| Idiomas soportados | No disponibles en la model card. El modelo base BLOOM se entrenó con 46 lenguajes naturales y 13 lenguajes de programación; la poda puede degradar de forma desigual los idiomas de menor representación |
| Licencia | No disponible en el repositorio. El modelo base BLOOM se distribuye bajo BigScience BLOOM RAIL 1.0, cuyas cláusulas de uso (incluidas las restricciones de uso militar y de generación de desinformación) se heredan habitualmente en los derivados |
| Formato de pesos | `safetensors`, cargable con `transformers`; tags adicionales: `text-generation`, `text-generation-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

BLOOM-1b7 es un transformer decoder-only autorregresivo con normalización previa a la capa, activación GeLU y embeddings posicionales ALiBi en lugar de posiciones aprendidas, lo que le permite generalizar a longitudes algo superiores a las vistas en entrenamiento aunque su ventana declarada sea de 2.048 tokens. El vocabulario del tokenizador BLOOM es de gran tamaño (diseñado para multilingüismo y código), lo que infla el recuento de parámetros en las capas de embedding respecto a modelos monolingües de tamaño similar.

Sobre este checkpoint en concreto no hay información de entrenamiento: la model card no documenta número de tokens, composición del dataset, ni si hubo RLHF, DPO o SFT. Tampoco hay hiperparámetros, infraestructura de cómputo ni estimación de emisiones. Lo único inferible es el método de compresión: Wanda poda pesos guiándose por el producto entre la magnitud del peso y la norma de la activación de entrada, comparando cada peso con el de la misma posición en el tensor, y típicamente sin reentrenamiento posterior. A 0,9 de sparsity el resultado es una máscara de ceros no estructurada, que solo se traduce en aceleración real si el motor de inferencia dispone de kernels dispersos capaces de explotarla. La mayoría de los stacks estándar (PyTorch denso, vLLM, llama.cpp) no lo hacen, por lo que la ganancia práctica se limita, en el mejor de los casos, a un menor uso de memoria si se comprime el almacenamiento.

## Capacidades

- Generación de texto autorregresiva: continuación de texto, resumen y parafraseo, en principio en los idiomas cubiertos por BLOOM, con calidad no verificada tras la poda.
- Capacidad multilingüe heredada del modelo base (46 lenguajes naturales), sujeta a degradación desigual según el idioma.
- Generación de código básico, ya que BLOOM incluyó 13 lenguajes de programación en su entrenamiento; no hay evidencia de que la poda al 90 % preserve esta capacidad.
- Comprensión y ejecución de instrucciones: limitada, porque el modelo base BLOOM-1b7 no es un modelo alineado por instrucciones y este checkpoint no documenta ningún ajuste posterior.
- Tool calling / function calling: no soportado de forma nativa ni documentado.
- Uso como agente o razonamiento multi-paso: no documentado y poco probable con 1,72 B parámetros y sparsity 0.9.
- Modo "thinking", visión o audio: no disponible.
- Valor como artefacto de investigación: permite reproducir experimentos de poda no estructurada y medir el impacto de la sparsity sobre perplejidad y tareas downstream.

## Casos de uso

- Investigación sobre compresión de modelos: replicar el pipeline de poda Wanda sobre BLOOM-1b7 y medir con este checkpoint la curva de degradación (perplejidad, exactitud en tareas) frente al modelo denso. Es el uso principal y el único con respaldo razonable.
- Estudio de kernels dispersos: servir como entrada para evaluar si un motor con soporte de sparsity no estructurada (por ejemplo, kernels 2:4 o sparse GEMM) recupera parte del rendimiento teórico perdido con la poda.
- Prototipado offline en hardware modesto: al ocupar 3,5 GB en disco, se puede cargar en una GPU de 8 GB o incluso en CPU con 8-16 GB de RAM para pruebas de integración de pipelines, siempre que la calidad no sea crítica.
- Generación de texto exploratoria con revisión humana: borradores, variaciones de copy corto o generación de ejemplos sintéticos para ampliar datasets, filtrando siempre la salida por un modelo mayor o por revisión manual.
- Etiquetado y clasificación zero-shot experimental: usar prompts de completado para asignar categorías a textos en un prototipo, validando antes el acuerdo con un conjunto etiquetado porque no hay métricas publicadas.
- Punto de partida para fine-tuning en experimentos de eficiencia: emplear el checkpoint podado como inicialización y comprobar si un ajuste ligero recupera calidad con menos cómputo que entrenar desde el modelo denso.
- Docencia y demostraciones sobre poda: ilustrar en un aula o tutorial cómo cambia el tamaño en disco, el uso de memoria y la salida cualitativa de un LLM al aplicar un 90 % de sparsity.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es la plantilla automática de HuggingFace y la sección de evaluación está vacía (`[More Information Needed]`). No hay valores de MMLU, HellaSwag, HumanEval, GSM8K ni perplejidad, ni comparación con el modelo denso original, que es precisamente la medición que un checkpoint podado necesita para ser evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia en el checkpoint publicado: en torno a 3,5-4 GB en fp16/bf16, más el coste de activaciones y caché KV (pequeño con 2.048 tokens de contexto).
- Si se reconvierte a fp32, el peso pasa a ~6,9 GB; en int8, ~1,8 GB; en int4, ~0,9-1,1 GB. No hay checkpoints cuantizados publicados, pero la cuantización posterior es viable con bitsandbytes, GPTQ o AWQ.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4090) es suficiente para fp16; para lotes grandes o contexto completo conviene una RTX 4090, L4, A10G o superior. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, de forma holgada en fp16 en tarjetas de 8 GB y en int8 en tarjetas de 4-6 GB.
- Opciones de despliegue: `transformers` (soporte directo), Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), y vLLM (soporta la arquitectura BLOOM). Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, conversión que no se distribuye.
- Latencia y throughput estimados: no disponibles. Advertencia importante: con sparsity no estructurada, los kernels densos habituales no aprovechan los ceros, por lo que la latencia esperable es similar a la de un BLOOM-1b7 denso y la única ganancia tangible es de almacenamiento, no de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos disponibles |
|---|---|---|---|---|
| `Rajeshwari-Chanda/bloom-1b7_wanda_0.9` (este) | 1,72 B (con ~90 % de pesos podados según el nombre) | 2.048 (heredado del base) | No disponible en el repositorio | safetensors, transformers |
| `bigscience/bloom-1b7` (modelo base) | 1,72 B | 2.048 | BigScience BLOOM RAIL 1.0 | safetensors, transformers |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B | ~1,54 B | 32.768 (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF |

No es posible comparar rendimiento: no hay ninguna métrica publicada de este checkpoint ni de su versión densa en el repositorio. Los datos de la tabla de alternativas corresponden a su documentación pública y se incluyen solo como referencia de categoría (modelos de ~1-2 B parámetros desplegables en GPU de consumo). Frente a TinyLlama o Qwen2.5, este checkpoint no ofrece ventajas verificadas de calidad, licencia ni ecosistema.

## Limitaciones y advertencias

- Model card vacía: la información de autoría, idiomas, licencia y datos de entrenamiento no está disponible. Tratar el repositorio como material de investigación sin garantías.
- Riesgo alto de degradación de calidad: una poda no estructurada al 90 % sin reentrenamiento posterior suele provocar pérdidas severas de coherencia, especialmente en modelos de menos de 2 B parámetros. No hay medición publicada que cuantifique ese daño.
- Alucinación: BLOOM-1b7 no está alineado por instrucciones y ya presenta una tendencia notable a generar afirmaciones plausibles pero falsas; la poda agresiva tiende a agravarla.
- Sesgos: el corpus ROOTS con el que se entrenó BLOOM contiene sesgos de género, raza, religión e idioma documentados en la literatura del modelo base. No hay ninguna evaluación de sesgo realizada sobre este checkpoint.
- Idiomas: sin declaración explícita, y con probable degradación desigual; los idiomas con menos presencia en el corpus (incluido el castellano frente al inglés) pueden verse más afectados por la poda.
- Licencia: no declarada en el repositorio. Antes de cualquier uso comercial hay que aclarar la licencia aplicable, teniendo en cuenta que el modelo base BLOOM se distribuye bajo RAIL 1.0 con cláusulas de uso restringido.
- Sin soporte de tool calling, agentes, visión ni audio: no es un modelo apto para pipelines de agentes ni para tareas multimodales.
- Coste-beneficio dudoso en producción: la sparsity no estructurada no se traduce en aceleración con motores densos convencionales, por lo que la ventaja práctica se limita al tamaño en disco.
- Contexto corto: 2.048 tokens es insuficiente para casos de uso con documentación larga, conversaciones extensas o RAG con muchos fragmentos, muy por debajo de los 32.000-128.000 tokens de alternativas actuales de tamaño similar.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 "likes" y fecha de creación registrada en 2026, sin historial de versiones ni issues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rajeshwari-Chanda/bloom-1b7_wanda_0.9
- Modelo base BLOOM-1b7: https://huggingface.co/bigscience/bloom-1b7
- Paper de Wanda (método de poda al que apunta el nombre del checkpoint, no enlazado desde la model card): https://arxiv.org/abs/2306.11695
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, estimación de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental mencionada en la plantilla: https://mlco2.github.io/impact
- Licencia del modelo base BLOOM (RAIL 1.0): https://huggingface.co/spaces/bigscience/license
