# aashay01101001/finab

## Resumen
El modelo `aashay01101001/finab` es un ajuste fino (fine-tune) del modelo base `Meta-Llama-3.1-8B-Instruct`, convertido a formato GGUF mediante la librería Unsloth. El repositorio contiene un único archivo de pesos cuantizado en Q4_K_M, lo que lo hace adecuado para inferencia local en hardware de consumo. El nombre "finab" sugiere una posible especialización en el ámbito financiero, aunque no se dispone de documentación oficial que lo confirme. El modelo está pensado para uso conversacional y es compatible con llama.cpp y Ollama, como se indica en la model card. No se proporcionan detalles sobre el dataset de entrenamiento, la licencia o los idiomas soportados, por lo que su uso en producción requiere verificar estos aspectos con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1, probablemente 128k, pero no confirmado) |
| Tipos de cuantizacion | Q4_K_M (único archivo proporcionado) |
| Idiomas soportados | no disponible (probablemente inglés, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento
El modelo es un fine-tune de `Meta-Llama-3.1-8B-Instruct`, que emplea una arquitectura transformer densa con atención multi-cabeza y capas de normalización RMSNorm. El ajuste fino se realizó con la librería Unsloth, que optimiza el entrenamiento mediante kernels personalizados y técnicas de reducción de memoria, logrando un entrenamiento aproximadamente 2 veces más rápido que los métodos convencionales. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. La conversión a GGUF se realizó con Unsloth, lo que garantiza compatibilidad con llama.cpp y sus derivados. No se documentan innovaciones técnicas adicionales más allá del propio fine-tune.

## Capacidades
- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, siguiendo el comportamiento del modelo base Llama 3.1 Instruct.
- Razonamiento y comprensión de instrucciones: hereda las capacidades de razonamiento del modelo base, aunque no se han publicado evaluaciones específicas.
- Soporte de tool calling y function calling: no confirmado explícitamente, aunque el modelo base Llama 3.1 8B Instruct sí las soporta; se recomienda verificar con pruebas.
- Capacidades multilingües: no disponibles; el modelo base tiene soporte limitado a inglés, español, francés, alemán, hindi, italiano, portugués y tailandés, pero el fine-tune podría haber alterado este comportamiento.
- Sin capacidades multimodales: el archivo es solo de texto, no se incluyen componentes de visión o audio.

## Casos de uso
- Asistente conversacional local: al ser un GGUF Q4_K_M, puede ejecutarse en equipos con 8-16 GB de VRAM mediante llama.cpp u Ollama, ideal para chatbots privados sin conexión.
- Prototipado rápido de aplicaciones de chat: su formato GGUF permite integrarlo fácilmente en entornos de desarrollo con Python (llama-cpp-python) o como servicio REST con servidores compatibles con OpenAI.
- Experimentación con fine-tunes financieros: si la especialización es financiera, podría usarse para generar resúmenes de noticias, análisis básico de sentimiento o respuestas a preguntas frecuentes sobre productos financieros, aunque no hay evidencia pública de ello.
- Evaluación de modelos cuantizados: sirve como ejemplo de fine-tune convertido a GGUF para comparar la degradación de rendimiento frente al modelo original en tareas conversacionales.
- Despliegue en entornos edge: su tamaño reducido (4.9 GB) permite ejecutarlo en dispositivos con recursos limitados, como mini-PCs o servidores domésticos.
- Integración con herramientas de productividad: mediante Ollama, puede conectarse a aplicaciones como Open WebUI o LangChain para crear flujos de trabajo automatizados de generación de texto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas. El rendimiento real dependerá del fine-tune aplicado y de la cuantización Q4_K_M, que introduce una ligera pérdida de calidad respecto al modelo en FP16.

## Requisitos de hardware
- VRAM estimada para inferencia: un GGUF Q4_K_M de 8B parámetros ocupa aproximadamente 4.9 GB en disco. Durante la inferencia, se necesita VRAM adicional para las capas y el contexto; con una ventana de 8k tokens, se estiman entre 6 y 8 GB de VRAM. Para contextos más largos (128k), se requerirían más de 12 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090 24GB, o GPUs de datacenter como A10G o L4. También puede ejecutarse en CPU con suficiente RAM (16 GB o más).
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo con cuantización Q4_K_M y contexto moderado.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (incluye Modelfile), llama-cpp-python, servidores compatibles con la API de OpenAI como llama-server o vLLM (con conversión previa a formato compatible).
- Latencia y throughput: no hay datos oficiales. En una RTX 4090, se puede esperar una velocidad de generación de 50-80 tokens/segundo con contexto corto; en CPU, 5-15 tokens/segundo dependiendo del hardware.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| aashay01101001/finab | 8B | no disponible | no disponible | GGUF Q4_K_M | Fine-tune de Llama 3.1 8B Instruct |
| Meta-Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | safetensors, GGUF | Modelo base, sin fine-tune |
| Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa de 7B con licencia permisiva |
| Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 | safetensors, GGUF | Buen rendimiento en multilingüe y código |

No se dispone de datos de rendimiento comparativo. La elección entre estos modelos dependerá de la especialización del fine-tune y de la licencia, que en este caso es desconocida.

## Limitaciones y advertencias
- Licencia desconocida: no se especifica la licencia del modelo. Esto impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con aashay01101001 antes de cualquier despliegue en producción.
- Sin documentación de entrenamiento: no hay información sobre el dataset, lo que impide evaluar sesgos o calidad del fine-tune.
- Riesgo de alucinación: como todos los modelos generativos, puede producir información falsa o inventada, especialmente en dominios especializados si el fine-tune no fue exhaustivo.
- Idiomas no confirmados: aunque el modelo base soporta varios idiomas, el fine-tune podría haber reducido ese soporte. Se recomienda probar en el idioma objetivo.
- Cuantización Q4_K_M: introduce pérdida de precisión. Para tareas que requieran alta fidelidad, se debería buscar una versión en FP16 o Q8, que no está disponible en este repositorio.
- Sin garantías de seguridad: no se han realizado evaluaciones de robustez frente a prompts maliciosos o jailbreaks. No debe usarse en sistemas de alto riesgo sin supervisión humana.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/aashay01101001/finab
- Perfil del autor en Hugging Face: https://huggingface.co/aashay01101001
- Unsloth (librería de fine-tuning): https://github.com/unslothai/unsloth
- Búsqueda de modelos de aashay01101001 en Hugging Face: https://huggingface.co/models?search=aashay01101001
- Modelindex.dev (verificación de hashes, sin datos específicos de este modelo): https://modelindex.dev/
