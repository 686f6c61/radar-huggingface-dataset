# CMSManhattan/Llama3Ternary_2b

## Resumen

Llama3Ternary_2b es una adaptación ternaria del modelo Meta Llama 3 de 2B parámetros, publicada por el usuario CMSManhattan en Hugging Face. Se trata de una conversión de los pesos originales de Llama 3 (aproximadamente 2.100 millones de parámetros) a una representación de pesos ternarios (-1, 0, +1), siguiendo el paradigma BitNet/1.58-bit popularizado por Microsoft Research. El objetivo es reducir drásticamente el coste de almacenamiento y el ancho de banda de memoria en inferencia, a cambio de una pérdida de calidad que no se documenta en la información disponible.

El modelo se distribuye en formatos safetensors y GGUF, lo que sugiere que está pensado para su uso con herramientas como llama.cpp. La ficha de Hugging Face lo etiqueta como "conversational" y "text-generation", pero no incluye detalles sobre el proceso de cuantización, el dataset de calibración ni métricas de degradación respecto al modelo base. La licencia declarada es llama3 (aunque las etiquetas también mencionan bsl-1.0, lo que genera ambigüedad), y el acceso está restringido: es necesario aceptar condiciones en Hugging Face para descargarlo.

La relevancia de este modelo radica en su interés experimental: permite estudiar el impacto real de la cuantización ternaria en un modelo de tamaño pequeño y ampliamente conocido como Llama 3 2B. No obstante, al no publicarse benchmarks ni detalles de entrenamiento, su utilidad en producción es incierta y debe tratarse como un artefacto de investigación más que como un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos ternarios (-1, 0, +1) |
| Parametros totales | 2.102.462.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ternaria (1.58-bit); GGUF incluido en el repo |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (etiquetas mencionan tambien bsl-1.0; ambiguo) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-2B, un transformer decoder-only con atención causal estándar, y aplica una cuantización ternaria de los pesos. La técnica se inspira en BitNet b1.58, donde cada peso se restringe a tres valores {-1, 0, +1}, lo que reduce el coste teórico de almacenamiento a aproximadamente 1.58 bits por peso y habilita operaciones de multiplicación-acumulación enteras en hardware especializado. Sin embargo, no se especifica si la conversión se realizó mediante cuantización post-entrenamiento (PTQ) con calibración, mediante entrenamiento con cuantización consciente (QAT) o mediante una simple proyección de los pesos originales.

No hay información sobre el número de tokens de entrenamiento adicional, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica más allá de la propia cuantización ternaria. Tampoco se documenta si se preservaron las capas de normalización, los embeddings o la cabeza de salida en precisión completa, ni si se aplicó algún esquema de escalado por canal para compensar la pérdida de rango dinámico. La ausencia de estos detalles impide evaluar la fidelidad de la conversión y hace recomendable tratar el modelo como una prueba de concepto.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3 2B.
- Razonamiento básico y respuesta a instrucciones, sujeto a la degradación introducida por la cuantización ternaria.
- Generación de código y matemáticas simples, aunque sin garantías de calidad frente al modelo original.
- Soporte de tool calling / function calling: no documentado; no se puede asumir.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere despliegue vía Hugging Face Inference Endpoints, aunque no se detalla la configuración.

## Casos de uso

- Investigación sobre cuantización ternaria: el modelo sirve como banco de pruebas para medir la degradación de calidad al convertir Llama 3 2B a pesos de 1.58 bits, comparando perplejidad y generaciones frente al modelo original en tareas controladas.
- Experimentos de eficiencia en memoria: útil para estudiar el ahorro de VRAM y ancho de banda en GPUs consumer al cargar pesos ternarios, aunque la implementación concreta de kernels ternarios no está documentada en el repo.
- Prototipado de asistentes conversacionales en inglés: para demos de bajo coste donde la calidad no sea crítica y se priorice el tamaño reducido del artefacto.
- Evaluación de pipelines GGUF: al incluir formato GGUF, permite probar la carga y ejecución en llama.cpp u Ollama para validar la compatibilidad de pesos ternarios con estas herramientas.
- Docencia y divulgación: ejemplo práctico para explicar BitNet, cuantización extrema y el compromiso entre precisión y eficiencia en modelos de lenguaje.
- Pruebas de robustez ante alucinaciones: al ser un modelo degradado, puede usarse para estudiar cómo la cuantización agresiva afecta a la factualidad y coherencia en comparación con el base.
- Integración en entornos con restricciones de almacenamiento: el formato ternario reduce el tamaño teórico de los pesos, lo que puede interesar en despliegues edge, siempre que se valide la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con pesos ternarios teóricos de ~1.58 bits, los 2.100 millones de parámetros ocuparían aproximadamente 0,4 GB, pero el repo pesa 21,5 GB, lo que indica que los safetensors almacenan los pesos en un formato de mayor tamaño (probablemente fp16/bf16 con valores ternarios o con escalas). El GGUF incluido puede ofrecer un tamaño menor, pero no se especifica.
- GPU recomendadas: no disponible. Por el tamaño del modelo base (2B), cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores, pero la falta de kernels ternarios documentados hace incierta la aceleración real.
- ¿Cabe en consumer GPU? Probablemente sí, dado el tamaño del modelo base, pero sin confirmación oficial.
- Opciones de despliegue: llama.cpp / Ollama (por el GGUF), Hugging Face Inference Endpoints (etiqueta endpoints_compatible), y potencialmente vLLM o TGI si se convierten los pesos, aunque no está documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CMSManhattan/Llama3Ternary_2b | 2,1B | no disponible | ternaria (1.58-bit) | llama3 (ambiguo con bsl-1.0) | gated en HF |
| meta-llama/Meta-Llama-3-2B | 2,1B | 8.192 tokens (según ficha oficial de Llama 3) | fp16/bf16, GGUF community | llama3 | abierto con aceptación |
| microsoft/bitnet-b1.58-2B-4T | ~2B | no disponible | ternaria nativa (QAT) | MIT (según publicación) | abierto |
| Llama-3.2-1B / 3B (Meta) | 1B / 3B | 128K tokens | fp16/bf16, GGUF | llama3.2 | abierto con aceptación |

La comparación más directa es con el Llama 3 2B original y con BitNet b1.58 2B de Microsoft, que sí documenta entrenamiento ternario nativo. Llama3Ternary_2b no aporta métricas que permitan situarlo frente a ellos.

## Limitaciones y advertencias

- No se publican benchmarks ni métricas de perplejidad, por lo que se desconoce la magnitud real de la degradación frente al modelo base.
- La cuantización ternaria agresiva suele provocar pérdida de coherencia, repeticiones y errores factuales; sin evaluación, el riesgo de alucinación es alto e impredecible.
- El modelo solo declara soporte de inglés; no hay evidencia de capacidades multilingües.
- La licencia es ambigua: la ficha indica llama3 pero las etiquetas incluyen bsl-1.0. Antes de uso comercial debe verificarse la licencia aplicable, y en cualquier caso la licencia Llama 3 impone restricciones (por ejemplo, política de uso aceptable y obligaciones de atribución).
- El acceso está restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a la reproducibilidad.
- El tamaño del repo (21,5 GB) es desproporcionado para un modelo de 2B en formato ternario, lo que sugiere que los safetensors no están optimizados y pueden dificultar el despliegue.
- No se documenta el proceso de conversión ni si se preservaron capas críticas en precisión completa; la fidelidad al modelo original es incierta.
- No hay información sobre tool calling, agentes ni razonamiento multi-paso, por lo que no debe asumirse su funcionamiento en pipelines de producción.
- El autor es un particular (CMSManhattan) y el modelo no parece contar con revisión por pares ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/Llama3Ternary_2b
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-2B
- Paper BitNet b1.58 (referencia técnica del paradigma ternario): https://arxiv.org/abs/2402.17764
- Repositorio BitNet de Microsoft: https://github.com/microsoft/BitNet
- Llama.cpp (soporte GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
