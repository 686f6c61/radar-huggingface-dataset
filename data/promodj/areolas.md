# PromoDj/Areolas

## Resumen

Areolas es un modelo de lenguaje publicado en Hugging Face por el usuario PromoDj bajo el identificador `PromoDj/Areolas`. Se distribuye exclusivamente en formato GGUF, lo que indica que está pensado para inferencia con llama.cpp y herramientas compatibles (Ollama, LM Studio, koboldcpp, etc.) más que para entrenamiento o despliegue con frameworks de alto rendimiento tipo vLLM o TGI. El repositorio cuenta con 57 descargas y ningún "like", lo que sugiere un proyecto de carácter personal o experimental sin tracción comunitaria significativa.

El dato técnico más relevante es el recuento de parámetros en safetensors: 14.288.901.184, es decir, aproximadamente 14,3 mil millones de parámetros. Este tamaño lo sitúa en la franja de los modelos de clase 13-14B, un rango muy popular para despliegue en GPU de consumo con cuantizaciones agresivas. El tamaño del repositorio, 48 GB, es coherente con un modelo de ese orden almacenado en múltiples niveles de cuantización GGUF (por ejemplo, Q2 a Q8 y quizá F16), aunque el desglose exacto de ficheros no está disponible en la información proporcionada.

La ficha se ve lastrada por una ausencia casi total de metadatos: no hay licencia declarada, no hay idiomas indicados, no hay pipeline asignado, no hay model card descriptiva ni referencias a paper, blog o repositorio de entrenamiento. Esto condiciona fuertemente cualquier evaluación de idoneidad para producción. A continuación se detalla todo lo que puede afirmarse con rigor y se marcan explícitamente los vacíos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 14.288.901.184 (≈14,3B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 48,0 GB; existen tensores safetensors para el recuento de parámetros) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. El recuento de parámetros (≈14,3B) es compatible con un transformer decoder-only denso de la familia de los modelos de 13-14B, pero esto es una inferencia por tamaño, no un dato confirmado. Tampoco se especifica si emplea atención con RoPE, GQA, SwiGLU u otras variantes habituales en ese rango, ni si incorpora mecanismos de atención lineal, híbridos SSM o decodificación especulativa.

Respecto al entrenamiento, no hay datos sobre el número de tokens, la composición del corpus, la existencia de fases de instrucción (SFT), alineamiento por preferencias (RLHF/DPO) o ajuste para tool calling. La ausencia de model card y de cualquier referencia a dataset o receta de entrenamiento impide verificar procedencia de datos, posibles filtraciones de benchmarks o sesgos conocidos. Cualquier afirmación sobre calidad de entrenamiento sería especulativa.

## Capacidades

- Generación de texto autoregresiva: es la capacidad mínima esperable de un modelo causal de este tamaño, aunque no está documentada explícitamente.
- Razonamiento y matemáticas: no disponible; no hay evidencia publicada de rendimiento en tareas de razonamiento multi-paso.
- Generación de código: no disponible; no consta ajuste específico para programación.
- Tool calling / function calling: no disponible; sin plantilla de chat documentada ni formato de herramientas declarado.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; no se declaran idiomas en los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible; los tags del repo no incluyen modalidades adicionales.

## Casos de uso

- Experimentación local con llama.cpp: el formato GGUF permite cargar el modelo en estaciones de trabajo con GPU de consumo para pruebas exploratorias de generación de texto, sin necesidad de infraestructura de servidor.
- Evaluación comparativa interna: dado su tamaño de ≈14,3B, puede servir como punto de referencia en pruebas A/B frente a otros modelos de la misma clase ya validados, siempre que se documente su origen.
- Prototipado de interfaces conversacionales: utilizable en demos de chatbot locales con Ollama o LM Studio, aceptando que la calidad y el comportamiento no están verificados.
- Fines educativos: útil para estudiar el empaquetado GGUF, la cuantización y el despliegue de modelos de 14B en hardware modesto.
- Pruebas de cuantización: el repo de 48 GB con múltiples niveles GGUF permite analizar el impacto de la cuantización en calidad y velocidad sobre una misma arquitectura.
- Investigación sobre procedencia de modelos: caso de estudio sobre repositorios sin model card, sin licencia y con metadatos mínimos, relevante para trabajos sobre gobernanza y trazabilidad de modelos abiertos.
- No recomendado para producción: la falta de licencia, idiomas y evaluación desaconseja su uso en sistemas expuestos a usuarios finales o en pipelines comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para ≈14,3B parámetros, una cuantización Q4_K_M ronda los 8-9 GB de pesos, más overhead de contexto KV; Q8_0 se aproxima a 15 GB; F16 requeriría unos 28-29 GB solo en pesos.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q8_0 con contexto moderado; A100 40/80 GB o H100 para F16 y contextos largos.
- GPU de consumo: sí cabe en GPUs de 12-16 GB con cuantizaciones Q4/Q5 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB); en 8 GB solo con Q2/Q3 y contexto reducido, con degradación de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no son la vía natural para este artefacto salvo conversión previa.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto, ninguno de los cuales está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PromoDj/Areolas | ≈14,3B | no disponible | no disponible | GGUF | Hugging Face, 57 descargas |
| Qwen2.5-14B-Instruct | 14,7B | 32.768 tokens (128K con YaRN) | Apache 2.0 | safetensors, GGUF | Hugging Face, amplia adopción |
| Mistral-Nemo-12B-Instruct | 12,2B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, amplia adopción |
| Phi-3-medium-14B | 14B | 4.096 tokens (128K en variante) | MIT | safetensors, GGUF | Hugging Face, amplia adopción |

La comparativa se limita a parámetros, contexto, licencia y formato porque no hay benchmarks ni model card de Areolas que permitan contrastar calidad. Frente a las alternativas citadas, la diferencia crítica no es técnica sino de trazabilidad: los tres modelos de referencia documentan entrenamiento, evaluación y licencia, mientras que Areolas no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, modificación ni redistribución; en la práctica equivale a "todos los derechos reservados" hasta que el autor lo aclare.
- Sin model card: se desconoce el corpus de entrenamiento, los filtros aplicados y las fases de alineamiento, lo que impide evaluar sesgos, toxicidad o riesgo de alucinación.
- Idiomas no declarados: no puede garantizarse un rendimiento aceptable en castellano ni en ningún otro idioma concreto.
- Contexto desconocido: planificar aplicaciones con ventanas largas es arriesgado sin conocer la longitud máxima soportada ni si emplea extrapolación.
- Riesgo de alucinación: no cuantificado; en modelos de 14B sin alineamiento documentado el riesgo suele ser elevado en dominios especializados.
- Tracción mínima: 57 descargas y 0 likes implican ausencia de validación comunitaria, informes de errores o casos de uso contrastados.
- Procedencia incierta: sin información sobre el modelo base ni la receta de ajuste, no puede descartarse que sea un fine-tuning de otro modelo con condiciones de licencia heredadas.
- No apto para producción: la combinación de licencia ausente, evaluación inexistente y metadatos incompletos desaconseja su uso en sistemas con usuarios reales.

## Enlaces

- Hugging Face: https://huggingface.co/PromoDj/Areolas
