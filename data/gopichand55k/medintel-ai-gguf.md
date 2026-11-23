# gopichand55k/MedIntel-AI-GGUF

## Resumen

MedIntel-AI-GGUF es la versión cuantizada en formato GGUF de MedIntel-AI, un ajuste fino supervisado (SFT) del modelo Qwen2.5-0.5B-Instruct sobre el corpus médico MedQuAD. Lo publica el usuario gopichand55k en Hugging Face y está pensado para su ejecución local mediante Ollama, sin necesidad de GPU dedicada, gracias a su reducido tamaño de aproximadamente 494 millones de parámetros y a su empaquetado en un único fichero de alrededor de 0,5 GB.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con un contexto nativo que la model card no documenta explícitamente aunque la familia Qwen2.5 lo sitúa en 32.768 tokens para la variante de 0,5B. La cuantización aplicada es Q8_0, es decir, pesos de 8 bits por bloque, lo que minimiza la pérdida de precisión respecto al modelo original en safetensors.

Su relevancia es acotada pero concreta: ofrece una vía de bajo coste para experimentar con respuestas a preguntas médicas en entornos con recursos limitados. Conviene señalar que la propia model card reporta que el ajuste fino empeora la precisión de palabras clave médicas frente al modelo base (72,2 % frente a 88,3 %), un dato que debe tenerse en cuenta antes de plantear cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card (la familia Qwen2.5-0.5B declara 32.768 tokens) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 0,5 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atención de causalidad completa, normalización RMSNorm y embeddings rotatorios (RoPE), con soporte nativo de plantillas de chat conversacionales. Sobre esta base, el autor aplicó un ajuste fino supervisado (SFT) usando el dataset MedQuAD, un corpus de pares pregunta-respuesta extraídos de fuentes médicas de referencia como los institutos NIH y otras organizaciones sanitarias estadounidenses. No se documenta en la información disponible si se emplearon técnicas adicionales de alineación como RLHF o DPO, ni el volumen exacto de tokens de entrenamiento, la composición del dataset tras el filtrado ni la configuración de hiperparámetros.

La innovación técnica del repositorio no reside en el entrenamiento sino en la distribución: la conversión a GGUF Q8_0 permite ejecutar el modelo con llama.cpp y Ollama en CPU o GPU de gama baja, con un coste de memoria inferior a 1 GB. No se documentan mecanismos como decodificación especulativa, atención lineal ni arquitecturas híbridas SSM.

## Capacidades

- Generación de texto conversacional en formato pregunta-respuesta, orientada al dominio médico tras el ajuste fino.
- Respuesta a consultas de salud y terminología clínica, aprovechando el corpus MedQuAD.
- Soporte de diálogo multi-turno mediante la plantilla de chat heredada de Qwen2.5-Instruct.
- Capacidad de tool calling y function calling heredada del modelo base Qwen2.5-Instruct, aunque no se documenta ni valida en la model card.
- Razonamiento multi-paso y uso como agente: no documentado ni verificado para esta variante.
- Capacidades multilingües: no documentadas; el ajuste fino se realizó sobre un corpus en inglés.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.

## Casos de uso

- Experimentación académica con modelos médicos de bajo coste: permite reproducir el pipeline de ajuste fino y cuantización en un portátil, sirviendo como caso de estudio de los efectos del SFT sobre un modelo pequeño.
- Despliegue en dispositivos con recursos muy limitados: al ocupar menos de 1 GB en Q8_0, puede ejecutarse en Raspberry Pi, portátiles sin GPU o contenedores con poca memoria mediante Ollama.
- Prototipado rápido de asistentes de FAQ médica: útil para validar interfaces conversacionales antes de migrar a un modelo mayor y más fiable.
- Docencia sobre cuantización y formatos GGUF: el repositorio ilustra el flujo completo desde safetensors hasta un fichero ejecutable con `ollama run`.
- Pruebas de integración con endpoints compatibles con la API de OpenAI, dado el tag `endpoints_compatible`.
- Evaluación comparativa de degradación por ajuste fino: la propia model card ofrece métricas base frente a ajustado que pueden reproducirse como ejercicio de análisis.
- No se recomienda su uso en producción clínica ni como fuente de información sanitaria, dado el deterioro de precisión reportado.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Metrica | Qwen2.5-0.5B-Instruct (base) | MedIntel-AI (ajustado) |
|---|---|---|
| Precisión en palabras clave médicas | 88,3 % | 72,2 % |
| Tokens de salida medios | 113,1 | 110,5 |
| Velocidad de inferencia | 80,2 tok/s | 79,8 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MedQA, PubMedQA) en la información disponible. Las cifras anteriores corresponden a una métrica propia del autor cuya metodología de evaluación no se detalla.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q8_0 (el repo completo pesa 0,5 GB); en la práctica, entre 1 y 2 GB contando el contexto y el runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona también en CPU sin problemas de latencia crítica.
- Cabe en GPU de consumo: sí, en cualquier modelo con 2 GB o más (GTX 1050 Ti, RTX 3050, RTX 4060, e incluso iGPU con memoria unificada).
- Opciones de despliegue: Ollama (`ollama run hf.co/gopichand55k/MedIntel-AI-GGUF:Q8_0`), llama.cpp y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia tipo API OpenAI.
- Latencia y throughput: el autor reporta 79,8 tok/s para el modelo ajustado, aunque no especifica el hardware empleado en la medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedIntel-AI-GGUF | 494 M | No disponible (32.768 en la familia Qwen2.5-0.5B) | MIT | GGUF Q8_0 | Ajuste fino sobre MedQuAD; precisión médica inferior al base según el autor |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base; mejor precisión de palabras clave médicas (88,3 %) en la métrica del autor |
| Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa de mayor tamaño con mejor razonamiento general; requiere más memoria |
| BioMistral-7B | 7.240 M | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo médico específico mucho mayor; no cabe en hardware de gama baja |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor reporta una caída de precisión en palabras clave médicas del 88,3 % al 72,2 % tras el ajuste fino, lo que sugiere sobreajuste al corpus MedQuAD o pérdida de capacidades generales.
- Riesgo elevado de alucinación en contenido médico: un modelo de 0,5B parámetros no tiene capacidad suficiente para garantizar exactitud factual en dominios especializados.
- No apto para uso clínico, diagnóstico ni consejo sanitario de ningún tipo.
- Idiomas soportados no documentados; el ajuste fino se realizó presumiblemente en inglés y el rendimiento en castellano no está validado.
- Longitud de contexto no especificada en la model card; debe asumirse la del modelo base con posibles degradaciones por el ajuste.
- Sesgos heredados del corpus MedQuAD, de origen estadounidense, que pueden no reflejar prácticas clínicas europeas.
- Licencia MIT: permite uso comercial, pero ello no exime de la responsabilidad legal y ética sobre las respuestas generadas en un contexto sanitario.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/gopichand55k/MedIntel-AI-GGUF
- Modelo base ajustado: https://huggingface.co/gopichand55k/MedIntel-AI
- Modelo original Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Gráfico de benchmark: https://huggingface.co/gopichand55k/MedIntel-AI-GGUF/resolve/main/benchmark_comparison.png
- Dataset MedQuAD (referencia): https://github.com/abachaa/MedQuAD
