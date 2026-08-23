# brandonmusic/GLM-5.2-NVFP4-TR3-Hybrid

## Resumen

GLM-5.2-NVFP4-TR3-Hybrid es una cuantización NVFP4 del modelo GLM-5.2 de Zhipu AI, publicada por el usuario brandonmusic. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 217.391.081.472 parámetros totales y 78 capas transformer, que incorpora un cabezal de predicción multi-token (MTP) y atención dispersa profunda (DSA). La cuantización NVFP4 (NVIDIA FP4) reduce el peso de los pesos a 4 bits, permitiendo ejecutar un modelo de esta escala en hardware Blackwell con un footprint de memoria mucho menor que el modelo original.

El checkpoint se presenta como un registro de ingeniería reproducible: incluye la configuración de servicio con vLLM (TP4 + DCP4/A2A + MTP3), un contenedor Docker publicado y un conjunto completo de evaluaciones sobre GPUs NVIDIA B200. Su relevancia radica en que demuestra la viabilidad de servir un modelo de más de 200.000 millones de parámetros en un clúster de 4 GPU RTX PRO 6000 Blackwell, con una tasa de decodificación sostenida de 62,5 tokens por segundo en contexto vacío y 62,6 tokens por segundo a 128K de contexto. La licencia MIT y el formato safetensors facilitan su integración en entornos de producción y su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 78 capas transformer, MTP head y atención dispersa (DSA) |
| Parámetros totales | 217.391.081.472 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | 1024K (según llm-explorer.com) |
| Tipos de cuantización | NVFP4 (4 bits), también menciona EXL3 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Librería de referencia | vLLM |

## Arquitectura y entrenamiento

El modelo base GLM-5.2, desarrollado por Zhipu AI, es un MoE de 217B parámetros con 78 capas transformer y un cabezal de predicción multi-token (MTP) que permite anticipar varios tokens futuros simultáneamente. La variante NVFP4-TR3-Hybrid aplica una cuantización de dos niveles por experto (two-tier expert-quantized) sobre el checkpoint original, reduciendo los pesos a 4 bits con formato NVIDIA FP4. La configuración de servicio seleccionada en producción es TP4 + DCP4/A2A + MTP3, con una caché KV de tipo `nvfp4_ds_mla` y un pool de 923.136 tokens.

No se dispone de información detallada sobre el entrenamiento original del modelo base (tokens, composición del dataset, fases de RLHF o DPO), ya que este repositorio se centra en la cuantización y su despliegue, no en el proceso de preentrenamiento. La cuantización se realizó con la herramienta ModelOpt de NVIDIA y se validó mediante pruebas de decodificación y evaluación en hardware Blackwell.

## Capacidades

- Generación de texto conversacional y de alta calidad, con soporte para contexto largo (hasta 1024K tokens según la fuente externa).
- Razonamiento científico avanzado: obtiene una media de 90,53% en GPQA Diamond (198 preguntas, 4 pasadas estocásticas), lo que indica una fuerte capacidad de razonamiento en dominios de física, química y biología.
- Seguimiento de instrucciones complejas: alcanza un 76,67% de exactitud prompt-level loose y 73,67% strict en IFBench (300 prompts oficiales).
- Generación de código en múltiples lenguajes: 43,89% pass@1 y 85,52% pass@2 en Aider Polyglot (221/225 tareas finalizadas), cubriendo C++, Go, Java, Python, entre otros.
- Soporte para decodificación multi-token (MTP) que mejora la velocidad de inferencia sin sacrificar calidad.
- Capacidades de servidor OpenAI-compatible mediante vLLM, con soporte de concurrencia y alta tasa de utilización de GPU.

## Casos de uso

- **Servidor de inferencia de alto rendimiento**: el modelo está diseñado para ser servido con vLLM en un Docker, ofreciendo un endpoint OpenAI-compatible en el puerto 9300. Adecuado para entornos que requieren baja latencia y alta concurrencia, como asistentes virtuales o plataformas de chat.
- **Razonamiento científico y técnico**: con un 90,53% en GPQA Diamond, es apto para tareas de análisis en dominios científicos, como revisión de literatura, resolución de problemas de física o química, y apoyo a la investigación académica.
- **Desarrollo de agentes de código**: su rendimiento en Aider Polyglot (85,52% pass@2) lo hace útil para herramientas de autocompletado o generación de código en repositorios grandes, integrado en CI/CD o IDEs.
- **Seguimiento de instrucciones complejas**: con una puntuación de 76,67% en IFBench, puede manejar instrucciones detalladas y de múltiples pasos, útil para automatización de tareas de oficina, generación de informes o procesamiento de datos estructurados.
- **Análisis de documentos extensos**: su ventana de contexto de hasta 1024K permite procesar libros completos, informes financieros o contratos legales de una sola pasada, manteniendo coherencia y precisión.
- **Despliegue en infraestructura Blackwell**: es ideal para organizaciones que ya disponen de GPUs NVIDIA RTX PRO 6000 o B200, aprovechando la cuantización NVFP4 para reducir costos de memoria y energía frente a modelos sin cuantizar.

## Benchmarks y rendimiento

| Benchmark | Resultado | Configuración |
|---|---|---|
| GPQA Diamond (media de 4 pasadas) | 90,53% (717/792) | 8x B200, temperatura 1.0, top-p 0.95, max_tokens 100000 |
| GPQA Diamond (pasada 1) | 91,41% | Ídem |
| IFBench prompt-level loose | 76,67% (230/300) | 8x B200, temperatura 0, max_tokens 32768 |
| IFBench prompt-level strict | 73,67% (221/300) | Ídem |
| Aider Polyglot pass@1 | 43,89% (97/221) | 8x B200, pass@2 |
| Aider Polyglot pass@2 | 85,52% (189/221) | Ídem |

Velocidad de decodificación sostenida (single-user, 30 s por celda, cap 4096 tokens):

| MTP depth | 0 contexto | 32K | 128K |
|---|---|---|---|
| MTP2 | 60,3 tok/s | 58,4 tok/s | 54,5 tok/s |
| **MTP3** | **62,5 tok/s** | **63,2 tok/s** | **62,6 tok/s** |
| MTP5 | 50,0 tok/s | 43,3 tok/s | 42,2 tok/s |

## Requisitos de hardware

- **GPU verificadas**: 4x NVIDIA RTX PRO 6000 Blackwell (inferencia) y 8x NVIDIA B200 (evaluación). El modelo requiere soporte nativo de NVFP4, por lo que solo funciona en arquitectura Blackwell.
- **VRAM estimada**: el repositorio pesa 351,9 GB (archivos safetensors). Con cuantización de 4 bits, el peso del modelo en memoria es aproximadamente 108 GB (217B × 0,5 bytes), pero la caché KV de 923.136 tokens y la configuración TP4/DCP4 requieren al menos 4 GPUs de 96 GB (RTX PRO 6000) para servir con seguridad. No se ha probado en GPUs de menor VRAM.
- **Opciones de despliegue**: Docker con imagen publicada (`verdictai/glm52-tr3-hybrid:mtp3-dcp4-nvfp4-20260713`), vLLM como motor de inferencia, y configuración de servidor OpenAI-compatible en el puerto 9300.
- **Latencia y throughput**: 62,5-63,2 tokens/s en decodificación single-user con MTP3. No se han publicado datos de throughput con múltiples usuarios concurrentes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks o especificaciones de otros modelos directamente comparables en la información proporcionada. Se sugiere comparar con el modelo original GLM-5.2 (sin cuantizar) y con otras cuantizaciones como GLM-5.2 NVFP4 de Luke Alonso (lukealonso/GLM-5.2-NVFP4), que sirve como base de este checkpoint. No obstante, no se han incluido métricas de estos modelos en el repositorio.

## Limitaciones y advertencias

- **Hardware específico**: la cuantización NVFP4 requiere GPUs NVIDIA Blackwell (RTX PRO 6000, B200, etc.). No es ejecutable en arquitecturas anteriores (Ampere, Hopper) sin adaptación adicional.
- **Pérdida de precisión**: la cuantización a 4 bits puede degradar ligeramente la calidad del modelo frente a la versión en FP16/FP8, especialmente en tareas de razonamiento complejo. No se ha realizado una comparación directa con el modelo original.
- **Límite de memoria**: la configuración con 4 GPUs alcanza el límite de VRAM en pruebas de estrés; una prueba con 4 contextos de 128K provocó un fallo de asignación de 64 MiB en el indexador de atención dispersa.
- **Complejidad de despliegue**: la configuración de TP4 + DCP4/A2A + MTP3 requiere conocimientos avanzados de vLLM y Docker. La imagen Docker se proporciona, pero la personalización fuera de los parámetros documentados puede ser difícil.
- **Idiomas**: no se especifican los idiomas soportados, por lo que se recomienda validar el comportamiento en el idioma objetivo antes de producción.
- **Licencia**: aunque la licencia es MIT, el modelo base GLM-5.2 de Zhipu AI puede tener restricciones adicionales; se debe revisar la licencia del modelo original para uso comercial.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/brandonmusic/GLM-5.2-NVFP4-TR3-Hybrid)
- [GitHub - Reproducible Docker image y benchmarks](https://github.com/brandonmmusic-max/glm52-tr3-hybrid)
- [Página del modelo en FriendliAI](https://friendli.ai/models/brandonmusic/GLM-5.2-NVFP4-TR3-Hybrid)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/brandonmusic%2FGLM-5.2-NVFP4-TR3-Hybrid,3U5fS4paDTNaGsIqcJylrL)
- [Modelo base original de Zhipu AI](https://huggingface.co/zai-org/GLM-5.2)
