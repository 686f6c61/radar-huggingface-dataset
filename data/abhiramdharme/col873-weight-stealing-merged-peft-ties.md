# abhiramdharme/col873-weight-stealing-merged-peft-ties

## Resumen

`abhiramdharme/col873-weight-stealing-merged-peft-ties` es un adaptador PEFT (LoRA/RSLoRA) fusionado mediante TIES-Merging sobre el modelo base `meta-llama/Llama-3.2-1B`. No es un modelo de propósito general, sino un artefacto de investigación creado en el marco de un proyecto académico (COL873 / ELL8299 / COL8383) titulado "How Secure is Your Specialized Knowledge? An Investigation into Weight-Stealing Attacks and Defenses in Multi-Agent LLM Systems". El adaptador combina los pesos de un atacante con los de una víctima "robada", empleando la API nativa de Hugging Face `add_weighted_adapter(..., combination_type='ties', density=0.5)`.

El modelo base es Llama 3.2 1B, un transformer decoder-only denso de aproximadamente 1.240 millones de parámetros desarrollado por Meta, con una longitud de contexto de 128.000 tokens según la documentación oficial de Llama 3.2. El adaptador en sí ocupa 0,2 GB en el repositorio, lo que es coherente con un conjunto de pesos LoRA de bajo rango más los ficheros de configuración.

Su relevancia es fundamentalmente metodológica: sirve como evidencia reproducible de una técnica de extracción de conocimiento especializado (weight stealing) y de su evaluación mediante perplejidad y precisión en preguntas de opción múltiple (MCQA) sobre particiones de validación reservadas. No está pensado para despliegue en producción ni para uso comercial directo, y no cuenta con descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) con adaptador PEFT LoRA/RSLoRA fusionado por TIES-Merging |
| Parametros totales | Aproximadamente 1.240 millones en el modelo base; el adaptador añade un conjunto de pesos de bajo rango (tamaño de repo 0,2 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.2 1B (no especificado para el adaptador) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors PEFT; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto se construye sobre Llama 3.2 1B, un transformer decoder-only denso con atención por grupos (GQA) y tokenizador BPE de 128.000 entradas, entrenado por Meta con datos multilingües y ajuste por instrucciones. Sobre ese base se aplica un adaptador PEFT de tipo LoRA/RSLoRA (los tags del repositorio incluyen ambos) y posteriormente se fusiona con los pesos de un segundo adaptador (el "atacante") mediante TIES-Merging con densidad 0,5, usando la función nativa de Hugging Face `add_weighted_adapter(..., combination_type='ties', density=0.5)`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO o supervisión adicional. Los datos publicados se limitan a métricas de evaluación sobre particiones reservadas del 5%: perplejidad de 10,879 en "Book 01 (Personality)" y 11,657 en "Book 02 (Psychotherapy)", precisión MCQA diagnóstica del 31,25% y 50,00% respectivamente, y una auditoría firmada top-4 de `down_proj` con valor +1,867. Estos números sugieren que el adaptador captura parte del conocimiento especializado de la víctima, pero con una calidad limitada y dependiente del dominio.

## Capacidades

- Generación de texto autoregresiva heredada de Llama 3.2 1B.
- Razonamiento básico y respuesta a preguntas de opción múltiple en dominios especializados (personalidad y psicoterapia, según las métricas publicadas).
- Capacidad de actuar como artefacto de auditoría de seguridad: permite reproducir un escenario de weight stealing y medir la fuga de conocimiento mediante PPL y MCQA.
- Soporte multilingüe heredado del modelo base (no verificado en el adaptador).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" específico en el adaptador.

## Casos de uso

- Investigación en seguridad de modelos: reproducir el ataque de weight stealing descrito en el proyecto COL873 y evaluar la fuga de conocimiento especializado con las métricas publicadas (PPL y MCQA).
- Auditoría de adaptadores PEFT: servir como caso de estudio de cómo TIES-Merging con densidad 0,5 combina pesos de atacante y víctima y qué rastro deja en submatrices como `down_proj`.
- Docencia y formación: material didáctico para cursos de seguridad en IA y sistemas multi-agente, mostrando el ciclo completo ataque-defensa-evaluación.
- Evaluación de defensas: usar el adaptador como "modelo víctima" frente a mecanismos de detección de extracción de pesos o de procedencia de adaptadores.
- Reproducibilidad académica: punto de partida para replicar los resultados de perplejidad y MCQA sobre las particiones reservadas del 5%.
- Análisis forense de modelos: comparar la firma top-4 de `down_proj` (+1,867) con la de adaptadores legítimos para estudiar técnicas de atribución.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Book 01 (Personality) PPL | 10,879 |
| Book 02 (Psychotherapy) PPL | 11,657 |
| Book 01 Diagnostic MCQA Acc | 31,25% |
| Book 02 Diagnostic MCQA Acc | 50,00% |
| down_proj Top-4 Signed Audit | +1,867 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en fp16 para el modelo base de 1.240 millones de parámetros, más el adaptador (0,2 GB en el repo). En cuantización de 8 bits, alrededor de 1,3 GB; en 4 bits, alrededor de 0,8 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM (con soporte LoRA), TGI, llama.cpp/Ollama solo si se exporta el modelo fusionado a GGUF (no se proporciona esa variante).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| col873-weight-stealing-merged-peft-ties | ~1,24 B (base) + adaptador | 128k (base) | llama3.2 | Hugging Face, 0 descargas | Artefacto de investigación de weight stealing |
| meta-llama/Llama-3.2-1B | ~1,24 B | 128k | llama3.2 | Hugging Face, ampliamente disponible | Modelo base oficial de Meta |
| Adaptadores PEFT públicos sobre Llama 3.2 1B | Variable | 128k (base) | Variable | Hugging Face | No comparables directamente por dominio y propósito |

No se dispone de datos de rendimiento comparables en benchmarks estándar para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: heredados del modelo base Llama 3.2 1B; no se documentan sesgos específicos del adaptador.
- Riesgo de alucinación: alto en dominios especializados, coherente con una precisión MCQA del 31,25% en el dominio de personalidad.
- Limitaciones de contexto e idioma: el adaptador no documenta idiomas soportados ni comportamiento específico más allá del contexto de 128k del base.
- Restricciones de licencia: sujeto a la Llama 3.2 Community License, que impone condiciones de uso comercial, atribución y restricciones de redistribución; no es una licencia permisiva tipo Apache 2.0 o MIT.
- Caveat para producción: es un artefacto académico de investigación en seguridad, no un modelo validado para despliegue; el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni garantías de mantenimiento.
- Advertencia ética: el propio nombre y propósito del artefacto implican un escenario de robo de pesos; su uso debe limitarse a investigación, auditoría y docencia, no a la explotación de conocimiento ajeno.

## Enlaces

- Hugging Face: https://huggingface.co/abhiramdharme/col873-weight-stealing-merged-peft-ties
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Documentación de PEFT (TIES-Merging y `add_weighted_adapter`): https://huggingface.co/docs/peft
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- No se han encontrado en la información proporcionada papers, blogs, repositorios o demos adicionales del proyecto COL873.
