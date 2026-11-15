# mradermacher/Gemma-3-Fornax-V3-12B-QAT-CoT-GGUF

## Resumen

Gemma-3-Fornax-V3-12B-QAT-CoT-GGUF es la versión cuantizada en formato GGUF del modelo ConicCat/Gemma-3-Fornax-V3-12B-QAT-CoT, un ajuste fino sobre la base Gemma 3 de Google con 11.766.034.176 parámetros (aproximadamente 12B). El trabajo de cuantización lo ha realizado mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp, que ofrece el modelo en múltiples niveles de compresión (desde Q2_K hasta Q8_0) junto con el proyector multimodal mmproj necesario para el procesamiento de imágenes.

El modelo parte de una variante QAT (Quantization-Aware Training) del Gemma 3 de 12B, sobre la que ConicCat ha aplicado un ajuste orientado a Chain-of-Thought (CoT), de ahí el sufijo en el nombre. El resultado es un modelo conversacional que preserva la naturaleza multimodal de Gemma 3 (texto e imagen) y que puede ejecutarse en hardware de consumo gracias a las cuantizaciones GGUF de 4 a 12 GB.

La relevancia de esta ficha radica en que permite desplegar localmente un modelo de 12B con capacidades multimodales y razonamiento explícito en equipos con GPU de gama media, algo que el modelo original en precisión completa no permite. No obstante, la información pública disponible sobre el ajuste fino concreto (datos de entrenamiento, benchmarks, hiperparámetros) es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (base Gemma 3), con ajuste fino CoT y QAT |
| Parametros totales | 11.766.034.176 (~11,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3, un transformer decoder-only multimodal de Google que combina un codificador de visión con el decodificador de lenguaje para procesar entradas de texto e imagen. La variante concreta parte de un checkpoint entrenado con Quantization-Aware Training (QAT), lo que permite que las versiones cuantizadas pierdan menos calidad respecto al modelo en precisión completa que las cuantizaciones post-entrenamiento convencionales.

Sobre esa base, ConicCat ha realizado un ajuste fino orientado a Chain-of-Thought (CoT), presumiblemente para mejorar el razonamiento paso a paso. Sin embargo, no se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La cuantización realizada por mradermacher es de tipo estático (static quants, según los metadatos `quantize_version: 2` y `output_tensor_quantised: 1`), y existe una variante separada con cuantizaciones ponderadas/imatrix en el repositorio Gemma-3-Fornax-V3-12B-QAT-CoT-i1-GGUF.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento multimodal de imágenes mediante el proyector mmproj incluido (Q8_0 o f16), heredado de Gemma 3.
- Razonamiento paso a paso (Chain-of-Thought) gracias al ajuste fino específico del modelo base.
- Generación de código y resolución de problemas matemáticos, como capacidad heredada de Gemma 3 (sin benchmarks específicos publicados para este ajuste).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada; probable por herencia de Gemma 3, pero no verificado.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este ajuste.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del modelo.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede gestionar diálogos multi-turno en una estación de trabajo con una GPU de 12-16 GB usando cuantizaciones Q4_K_M o Q5_K_M, sin depender de servicios en la nube.
- Análisis de documentos con imágenes: gracias al proyector mmproj, puede procesar capturas de pantalla, diagramas o fotografías junto con texto, útil para tareas de extracción de información en local.
- Razonamiento explícito para depuración de lógica: el ajuste CoT permite obtener cadenas de razonamiento que facilitan auditar cómo llega el modelo a una conclusión, útil en entornos educativos o de investigación.
- Prototipado rápido con llama.cpp u Ollama: al estar en GGUF, se integra directamente en herramientas de inferencia local para pruebas de concepto sin infraestructura GPU dedicada.
- Generación de código asistida en entornos con requisitos de privacidad: al ejecutarse localmente, el código del usuario no sale del equipo, adecuado para proyectos con datos sensibles.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantización más dos variantes de mmproj, lo que permite medir el equilibrio calidad/velocidad en hardware concreto antes de fijar una configuración de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): aproximadamente 5-7 GB en Q2_K/Q3_K, 7-8 GB en Q4_K_M, 8,5-10 GB en Q5_K/Q6_K y 12,6 GB en Q8_0. Hay que sumar 0,7-1,0 GB adicionales si se usa el proyector multimodal mmproj.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando Q4_K_S/Q4_K_M; en 12 GB o más con Q5_K_M o Q6_K; para Q8_0 se recomiendan 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF. El modelo también se etiqueta como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-3-Fornax-V3-12B-QAT-CoT (este, GGUF) | ~11,77B | no disponible | Sí (mmproj) | gemma | GGUF |
| Gemma 3 12B (Google, original) | ~12B | no disponible en esta ficha | Sí | gemma | safetensors, GGUF |
| Gemma-3-Fornax-V3-12B-QAT-CoT (base, safetensors) | ~11,77B | no disponible | Sí | gemma | safetensors |
| Gemma-3-Fornax-V3-12B-QAT-CoT-i1-GGUF (imatrix) | ~11,77B | no disponible | Sí | gemma | GGUF (imatrix) |

La comparación con otras familias (Llama 3.1 8B, Qwen2.5 14B, Mistral Nemo 12B) no puede establecerse con rigor porque no se han publicado benchmarks de este ajuste fino concreto.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés; su rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior al de modelos multilingües específicos.
- Alucinación: al ser un ajuste fino con CoT sobre una base de 12B, el riesgo de alucinación persiste; la cadena de razonamiento puede contener pasos plausibles pero incorrectos, por lo que requiere verificación en producción.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que incluyen restricciones de uso aceptable y obligaciones de atribución; conviene revisarlos antes de desplegar en producto.
- Ausencia de benchmarks: no hay datos públicos de MMLU, HumanEval, GSM8K ni de evaluación multimodal para este ajuste, lo que impide compararlo objetivamente con alternativas.
- Trazabilidad del ajuste fino: se desconoce el dataset de entrenamiento de ConicCat, lo que dificulta evaluar sesgos heredados o contaminación de benchmarks.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- Contexto: la longitud de contexto efectiva no está documentada en la información disponible; aunque Gemma 3 soporta ventanas amplias, no se confirma que este ajuste las preserve.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Gemma-3-Fornax-V3-12B-QAT-CoT-GGUF
- Modelo base (safetensors): https://huggingface.co/ConicCat/Gemma-3-Fornax-V3-12B-QAT-CoT
- Variante imatrix: https://huggingface.co/mradermacher/Gemma-3-Fornax-V3-12B-QAT-CoT-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Gemma-3-Fornax-V3-12B-QAT-CoT-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
