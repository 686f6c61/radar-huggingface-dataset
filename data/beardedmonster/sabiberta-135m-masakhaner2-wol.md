# BeardedMonster/SabiBERTa-135M-masakhaner2-wol

## Resumen
SabiBERTa-135M-masakhaner2-wol es un checkpoint de clasificación de tokens publicado por BeardedMonster, obtenido al ajustar SabiBERTa-135M sobre MasakhaNER 2.0 para wolof (wol). El checkpoint tiene 135.883.017 parámetros y se basa en un encoder ModernBERT; incluye una cabeza de etiquetado y un id2label que decodifica las predicciones a nombres de etiquetas.

El ajuste se realizó durante 50 épocas, con tasa de aprendizaje 5e-05, batch 32 y longitud máxima 256, y obtiene un span_f1 medio de 0,7313 en el protocolo wol. El autor señala que el arnés de evaluación reproduce los baselines publicados de MasakhaNER 2.0 con una desviación de aproximadamente 0,25 F1, pero el resultado procede de una sola ejecución.

Su relevancia es acotada: cubre NER en una lengua africana de bajos recursos y sirve como baseline reproducible para experimentos y pipelines de extracción de entidades en wolof. No es un modelo generativo y no se han publicado datos sobre licencia, cuantizaciones o rendimiento fuera de MasakhaNER 2.0.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT), con cabeza de clasificación de tokens |
| Parámetros totales | 135.883.017 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el ajuste se realizó con max_length 256 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | wol (wolof) |
| Licencia | No disponible; sujeta a la licencia del modelo base BeardedMonster/SabiBERTa-135M |
| Formato de pesos | safetensors |
| Tarea | Clasificación de tokens (NER) |
| Modelo base | BeardedMonster/SabiBERTa-135M |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento
El modelo es un fine-tune supervisado de SabiBERTa-135M, un encoder transformer etiquetado como modernbert, para clasificación de tokens. La cabeza de clasificación se entrena sobre el esquema de etiquetas de MasakhaNER 2.0 en wolof, con secuencias de hasta 256 tokens.

El entrenamiento usa 50 épocas, tasa de aprendizaje 5e-05, batch 32 y max_length 256; la métrica es span_f1 y la media es 0,7313. No se documentan el número de tokens de preentrenamiento, la composición completa del corpus, el uso de RLHF/DPO ni innovaciones de decodificación. El resultado proviene de una sola ejecución y el arnés se calibró frente a los baselines publicados con una tolerancia de ~0,25 F1.

## Capacidades
- Reconocimiento de entidades nombradas en textos en wolof: clasifica cada token con las etiquetas del corpus MasakhaNER 2.0.
- Decodificación directa a etiquetas: el campo id2label está configurado, por lo que las predicciones se traducen a nombres de etiquetas sin postprocesado adicional.
- Integración con Transformers: se carga con AutoTokenizer y AutoModelForTokenClassification.
- Inferencia por lotes: al ser un encoder de 135M, puede procesar lotes pequeños en CPU o GPU; no hay cifras publicadas de throughput.
- No soporta generación de texto, resumen, traducción, chat, razonamiento multi-paso, tool calling ni function calling.
- No soporta agentes, visión, audio ni modos de razonamiento extendido.
- Multilingüismo: únicamente wol; no se documenta transferencia a otras lenguas.

## Casos de uso
- **Extracción de entidades en corpus periodísticos en wolof**: se segmenta cada noticia en fragmentos de hasta 256 tokens y se ejecuta el modelo para obtener etiquetas de entidades que alimenten una base de datos estructurada.
- **Anonimización previa a la publicación**: el modelo permite localizar entidades personales y organizativas en textos wolof antes de publicarlos o compartirlos, reduciendo la exposición de datos identificativos.
- **Indexación y búsqueda documental**: las entidades detectadas se añaden como metadatos para mejorar la recuperación de documentos por persona, organización o lugar en archivos digitales.
- **Anotación asistida para lingüistas**: preetiqueta corpus en wolof y reduce el trabajo manual de revisión en proyectos de anotación, con el consiguiente ahorro de coste.
- **Preprocesado para traducción y asistentes lingüísticos**: preserva nombres propios y topónimos antes de aplicar traducción automática o herramientas de corrección en wolof.
- **Monitorización de contenido generado por usuarios**: detecta entidades en comentarios y publicaciones en wolof para analítica, moderación o enrutamiento de incidencias.
- **Evaluación reproducible de NER en lenguas africanas**: sirve como baseline para comparar nuevos ajustes sobre MasakhaNER 2.0 en wolof, gracias a sus hiperparámetros y métrica documentados.

## Benchmarks y rendimiento
| Benchmark | Idioma | Métrica | Resultado | Observaciones |
|---|---|---|---|---|
| MasakhaNER 2.0 | wol | span_f1 | 0,7313 | Una sola ejecución; arnés calibrado con ~0,25 F1 de desviación frente a baselines publicados |

El único resultado disponible es el de MasakhaNER 2.0 en wol. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas en la información disponible; no son el objetivo de este checkpoint.

## Requisitos de hardware
- VRAM teórica para pesos: ~0,54 GB en fp32, ~0,27 GB en fp16/bf16 y ~0,14 GB en int8. No incluye activaciones, tokenizador ni overhead del runtime; no se documentan cuantizaciones oficiales.
- GPU recomendadas: no se especifican. Por tamaño, no requiere A100/H100; una RTX 4090 es sobredimensionada. Cualquier GPU de consumo con 2 GB o más de VRAM puede ejecutar inferencia en fp32 con lotes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, GTX 1650 o superiores; también en CPU para lotes pequeños.
- Despliegue: Transformers (PyTorch) es la vía documentada. No se incluyen artefactos GGUF, ONNX ni plantillas de Ollama; vLLM, llama.cpp, TGI u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Idioma | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-wol | 135.883.017 | No disponible (max_length de ajuste 256) | wol | No disponible | span_f1 0,7313 en MasakhaNER 2.0 wol | Hugging Face |
| SabiBERTa-135M (base) | 135M (según nombre) | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| SabiBERTa-135M-masakhaner2-ibo | No disponible (el nombre sugiere 135M) | No disponible | ibo | No disponible | No disponible | Hugging Face |

No se dispone de resultados de benchmarks de las alternativas ni de otros modelos NER para wolof con datos verificables en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento.

## Limitaciones y advertencias
- Licencia no especificada: el autor remite a la licencia del modelo base; es necesario verificarla antes de cualquier uso comercial o redistribución.
- Resultado de una sola ejecución: no hay media sobre 5 semillas ni intervalos de confianza; diferencias pequeñas frente a otros sistemas deben tratarse como ruido.
- Cobertura lingüística limitada a wolof; no se documenta funcionamiento en otras lenguas, dialectos, code-switching o texto informal.
- Ventana de ajuste de 256 tokens: documentos largos requieren segmentación; no se documenta la ventana máxima real del encoder base.
- Modelo discriminativo: no genera texto, no resume, no traduce, no mantiene conversaciones ni soporta tool calling o agentes.
- Riesgo de alucinación generativa no aplica; sí puede producir falsos positivos y falsos negativos en la etiquetación.
- Sesgos y dominio: puede heredar sesgos del corpus MasakhaNER 2.0 y del modelo base; no se publican evaluaciones de sesgo ni de robustez.
- Adopción y validación externa nulas en el momento de la ficha: 0 descargas y 0 likes; no se han identificado evaluaciones independientes.
- El repositorio no incluye demo, paper ni artefactos de cuantización.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-wol)
- [Modelo base SabiBERTa-135M](https://huggingface.co/BeardedMonster/SabiBERTa-135M)
- [Variante para ibo](https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-ibo)
- [Perfil de BeardedMonster](https://huggingface.co/BeardedMonster)
- Paper de MasakhaNER 2.0: no disponible en la información proporcionada.
