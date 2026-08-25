# quimmedes/Ornith-1.5-35B-A3B-XYZ

## Resumen

Ornith-1.5-35B-A3B-XYZ es una colección de cuantizaciones GGUF del modelo Ornith-1.5-35B-A3B, un modelo de lenguaje de arquitectura híbrida SSM+atención con mezcla de expertos (MoE) que activa aproximadamente 3 mil millones de parámetros por token de un total de 35 mil millones. Esta versión cuantizada, publicada por el usuario quimmedes, emplea el método XYZ, un esquema de asignación de bits balanceado que mantiene la atención y los pesos de los expertos a precisiones comparables, en lugar de sacrificar uno por el otro. El resultado son siete archivos GGUF que van desde 11,2 GiB (Q2.5) hasta 37,2 GiB (Q8), pensados para ejecutar el modelo en hardware con poca VRAM mediante descarga de capas a CPU.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 35B de parámetros en tarjetas gráficas de consumo, como una GPU de 8 GB, gracias a la naturaleza MoE del modelo (solo ~3B activos por token) y a la cuantización XYZ, que preserva los invariantes de precisión BF16 en componentes críticos. No se especifica la licencia del modelo original ni de esta cuantización, por lo que debe asumirse que su uso comercial requiere verificación previa. La fecha de creación es agosto de 2026 y el repositorio ha recibido cerca de un millar de descargas, lo que indica un interés moderado en esta versión cuantizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida SSM + atención, con enrutamiento de expertos |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2.5, Q3, Q4, Q5, Q5.5, Q6.5, Q8 (todos en GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

Los archivos disponibles y sus tamaños son:

| Archivo | Tamaño | Bits por peso (BPW) |
|---|---|---|
| Ornith‑1.5‑35B‑A3B‑Q2.5‑XYZ.gguf | 11,2 GiB | 2,72 |
| Ornith‑1.5‑35B‑A3B‑Q3‑XYZ.gguf | 12,5 GiB | 3,02 |
| Ornith‑1.5‑35B‑A3B‑Q4‑XYZ.gguf | 17,1 GiB | 4,13 |
| Ornith‑1.5‑35B‑A3B‑Q5‑XYZ.gguf | 21,1 GiB | 5,10 |
| Ornith‑1.5‑35B‑A3B‑Q5.5‑XYZ.gguf | 23,7 GiB | 5,72 |
| Ornith‑1.5‑35B‑A3B‑Q6.5‑XYZ.gguf | 27,8 GiB | 6,71 |
| Ornith‑1.5‑35B‑A3B‑Q8‑XYZ.gguf | 37,2 GiB | 9,01 |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformador híbrido que combina capas de atención y bloques SSM (state space model), con un enrutamiento MoE que activa solo ~3B de sus 35B parámetros por token. Según la información del autor de la cuantización, el núcleo denso (proyecciones de atención q/k/v/output, SSM out/gate, router gate) se mantiene en precisión Q8_0 (int8), mientras que los expertos enrutados (≈93% de los parámetros) se cuantizan a niveles más bajos (IQ2, IQ3, Q4_K) guiados por una matriz de importancia (imatrix). Los invariantes críticos en BF16 (escalares α/β del SSM, claves y valores de atención, entrada al router) se conservan sin cuantizar.

El proceso de cuantización se realizó con la herramienta `llama-quantize` de llama.cpp, partiendo de un archivo BF16 maestro de 71 GB, con reglas por tipo de tensor y una matriz de importancia calculada sobre los bloques 0-39. El bloque MTP (multi-token prediction) o especulativo se cuantizó a Q4_K. No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens utilizados ni el procedimiento de alineación (RLHF/DPO) del modelo original; estos datos no se mencionan en la documentación disponible.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` en HuggingFace y su pipeline es `text-generation`.
- Razonamiento y resolución de tareas de lógica: según la búsqueda web, el modelo original supera a modelos densos como Gemma 4-31B y Muse Glimmer-30B en benchmarks de razonamiento y agénticos.
- Generación de código: el modelo se destaca en benchmarks de coding, superando a Qwen 3.6-35B en estas tareas, según la búsqueda web.
- Capacidad agéntica: el modelo original está orientado a tareas de agente, lo que sugiere soporte para razonamiento multi-paso y posiblemente tool calling, aunque no se confirma explícitamente en la documentación de la cuantización.
- Multilingüismo: no se indica en la información disponible, por lo que se considera no disponible.
- Modo de razonamiento especial (thinking): no se menciona ninguna capacidad específica de modo de pensamiento en la documentación.

## Casos de uso

- Asistente conversacional en entornos con recursos limitados: gracias a la cuantización Q2.5 o Q3 y al uso de `--ncmoe` para mantener los expertos en RAM, se puede desplegar un chatbot funcional en una GPU de 8 GB con 16 GB de RAM, ideal para prototipos o aplicaciones de bajo coste.
- Generación de código en desarrollo local: un desarrollador puede ejecutar la versión Q4 en una estación de trabajo con una GPU de 16 GB (por ejemplo, RTX 4080) y usar el modelo para autocompletar, revisar o generar funciones en su IDE, aprovechando su rendimiento en benchmarks de código.
- Tareas de agente en pipelines de automatización: el modelo base está diseñado para tareas agénticas, por lo que esta cuantización puede integrarse en sistemas de automatización que requieran razonamiento multi-paso, como la gestión de tickets o la ejecución de scripts, siempre que se respete la licencia.
- Despliegue en servidores de bajo coste: al ser MoE, el modelo puede servir a múltiples peticiones concurrentes con un uso de memoria moderado, por lo que es adecuado para entornos de producción con instancias de GPU pequeñas (por ejemplo, T4 16 GB) usando la versión Q5.5 o Q6.5.
- Investigación de técnicas de cuantización: el método XYZ es una propuesta novedosa de asignación de bits, y este repositorio sirve como ejemplo de cómo aplicar cuantización balanceada a un modelo híbrido SSM+atención, útil para investigadores que estudian el impacto de la precisión en modelos MoE.
- Aplicaciones educativas: los archivos de menor tamaño (Q2.5, Q3) permiten ejecutar el modelo en una laptop con GPU integrada (mediante offload a CPU) para demostrar el funcionamiento de un MoE de 35B sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la cuantización XYZ de Ornith-1.5-35B-A3B. La información de la búsqueda web indica que el modelo original (Ornith-1.5-35B-A3B) supera a Qwen 3.6-35B en benchmarks de coding y agénticos, y supera a modelos densos como Gemma 4-31B y Muse Glimmer-30B, pero no se proporcionan cifras concretas. Además, en el sitio BenchAlign se le asigna una puntuación de 49,70/100 y el puesto 139 de 225 modelos, aunque esa evaluación corresponde al modelo base, no a esta cuantización. Por tanto, no se dispone de datos numéricos fiables para comparar el rendimiento de esta versión GGUF con otros modelos cuantizados.

## Requisitos de hardware

- VRAM estimada: para cada archivo GGUF, el tamaño del archivo es un indicador aproximado del consumo de VRAM si se cargan todos los pesos en GPU. Por ejemplo, el archivo Q2.5 de 11,2 GiB requeriría al menos esa cantidad de VRAM, y el Q8 (37,2 GiB) necesitaría una GPU de 40 GB o más.
- GPU recomendadas: para las versiones de baja cuantización (Q2.5, Q3) se puede usar una GPU de 8 GB (por ejemplo, RTX 3060, T4) con descarga de expertos a RAM. Para Q4 y Q5, se recomienda una GPU de 16 GB (RTX 4080, A100 40GB) para ejecución completa en GPU. Las versiones Q6.5 y Q8 requieren GPUs de 24 GB o superiores (RTX 4090, A100).
- Compatibilidad con hardware de consumo: sí, el modelo se puede ejecutar en una GPU de 8 GB con el truco de `--ncmoe` (mantener expertos en RAM) y cache KV cuantizado a Q4_0, como se muestra en el ejemplo de la model card.
- Opciones de despliegue: el modelo está diseñado para funcionar con llama.cpp y su servidor `llama-server`. También puede ejecutarse con herramientas compatibles con GGUF como Ollama, aunque no se menciona explícitamente. No se indica soporte para vLLM o TGI en la documentación.
- Latencia y throughput: no se han publicado datos de rendimiento en términos de tokens por segundo o latencia para esta cuantización.

## Comparativa con modelos similares

No se dispone de especificaciones técnicas detalladas de modelos comparables en la información proporcionada. Sin embargo, se puede señalar que el modelo original (Ornith-1.5-35B-A3B) se posiciona como una alternativa a modelos densos de tamaño similar como Gemma 4-31B y Muse Glimmer-30B, así como a otros MoE como Qwen 3.6-35B. Según la búsqueda web, el modelo original supera a estos en benchmarks de coding y agénticos, aunque no se ofrecen cifras concretas. Para esta cuantización, la comparación directa con otras cuantizaciones de modelos equivalentes no está disponible en la documentación.

## Limitaciones y advertencias

- Licencia no disponible: el repositorio no especifica la licencia del modelo base ni de la cuantización, por lo que no se puede garantizar que su uso comercial sea legal sin una aclaración previa del autor.
- Posible degradación de calidad en cuantizaciones bajas: los archivos Q2.5 y Q3 pueden presentar pérdida de precisión en tareas de razonamiento complejo, a pesar de la matriz de importancia y el enfoque balanceado.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo ni tasas de alucinación para este modelo, por lo que es necesario validar sus respuestas en entornos críticos.
- Contexto limitado: no se indica la longitud máxima de contexto soportada, lo que dificulta su uso en aplicaciones que requieran ventanas de contexto largas.
- Dependencia de llama.cpp: la cuantización solo es utilizable con el ecosistema llama.cpp, lo que limita su integración con otros frameworks de inferencia (por ejemplo, TensorRT o ONNX) sin conversión adicional.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/quimmedes/Ornith-1.5-35B-A3B-XYZ
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Página del proyecto Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Ficha de benchmarks del modelo base: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Página de ModelScope del modelo base: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B

Nota: el repositorio de la cuantización incluye una ilustración y el código de uso, pero no se ha accedido a esos recursos en esta consulta.
