# Azeemtalib/SelfLearning-Medical-Analyst-v1

## Resumen

SelfLearning-Medical-Analyst-v1 es un modelo de generación de texto publicado por el usuario Azeemtalib en Hugging Face, presentado por su autor como un motor de inteligencia clínica especializado en la extracción de parámetros de informes de laboratorio, el seguimiento de biomarcadores y la detección de valores críticos. Según la model card, forma parte del núcleo diagnóstico de una plataforma denominada "Self-Learning Medical Analyst" orientada a triaje automatizado y apoyo a la decisión clínica.

La información pública disponible es muy limitada: el repositorio ocupa aproximadamente 0,1 GB, no registra descargas ni interacciones, y la model card no especifica arquitectura, número de parámetros, longitud de contexto ni detalles del corpus de entrenamiento. Los metadatos solo indican que se distribuye en formato safetensors, que trabaja exclusivamente en inglés y que se publica bajo licencia Apache 2.0.

Su relevancia potencial reside en el nicho concreto que aborda (análisis de analíticas clínicas con salida JSON estructurada) y en la licencia permisiva, pero la ausencia de especificaciones técnicas verificables y de resultados de evaluación obliga a tratar cualquier uso en producción con extrema cautela, especialmente en un dominio regulado como el sanitario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible (tamaño del repo: 0,1 GB) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card no indica si se trata de un transformer denso, una variante Mixture of Experts, un modelo híbrido ni si deriva de un modelo base conocido mediante fine-tuning. Tampoco se detalla el número de parámetros, la longitud de contexto soportada ni la tokenización empleada.

Respecto al entrenamiento, no hay datos sobre el volumen de tokens, la composición del dataset, la procedencia de los informes de laboratorio utilizados (si los hubiera) ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. La única indicación funcional es que el modelo está optimizado para recibir texto OCR en bruto de analíticas (hemograma, perfil hepático, perfil lipídico, función renal) y devolver parámetros clínicos en JSON estandarizado, con garantía estricta de formato según el autor. No se especifica qué método garantiza esa estructura de salida (grammar-constrained decoding, fine-tuning específico o prompting).

## Capacidades

- Extracción de parámetros de biomarcadores a partir de texto OCR de informes de laboratorio, con salida en JSON estandarizado.
- Cobertura declarada de analíticas de hematología, bioquímica y perfil metabólico.
- Detección y marcado de valores fuera de rango que requieren revisión médica urgente.
- Generación de texto conversacional (pipeline text-generation).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Triaje automatizado de analíticas en urgencias: el modelo recibiría el texto OCR de un hemograma o una bioquímica y devolvería un JSON con los parámetros y las alertas de valores críticos, permitiendo priorizar la revisión por parte del facultativo.
- Integración en un pipeline de digitalización de laboratorios: conversión de informes en PDF escaneado a datos estructurados almacenables en una base de datos clínica, aprovechando la garantía de formato JSON declarada por el autor.
- Seguimiento longitudinal de biomarcadores: extracción sistemática de parámetros en sucesivas analíticas de un mismo paciente para alimentar gráficas de evolución, siempre con validación humana.
- Apoyo a la decisión clínica en consulta: resumen estructurado de un perfil lipídico o hepático que el médico puede contrastar antes de la consulta, reduciendo el tiempo de lectura del informe.
- Generación de alertas en plataformas de telemedicina: marcado automático de resultados fuera de rango para notificar al paciente o derivar a un profesional, condicionado a una capa de validación adicional.
- Investigación retrospectiva sobre cohortes: extracción masiva de parámetros de informes anonimizados para construir datasets tabulares de estudio, con revisión manual de una muestra para estimar la precisión.
- Prototipado de asistentes clínicos conversacionales: dado que el pipeline es text-generation, puede emplearse en demos de diálogo sobre resultados analíticos, sin uso clínico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, lo que sugiere un modelo de pequeño tamaño que probablemente cabe en GPUs de consumo, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Por el tamaño del repo, es plausible que funcione en GPUs consumer (RTX 3060, RTX 4090) e incluso en CPU, pero es una inferencia no verificada.
- Despliegue: al publicarse en safetensors, es compatible con frameworks estándar (Transformers, vLLM, TGI) y con conversión a GGUF para llama.cpp u Ollama, aunque no se documenta ningún procedimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones que permitan una comparación rigurosa con otros modelos de análisis clínico.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas verificables (arquitectura, parámetros, contexto, dataset), lo que impide evaluar su calidad de forma independiente.
- Cero descargas y cero interacciones en Hugging Face: no hay evidencia de uso ni validación por parte de la comunidad.
- Riesgo elevado de alucinación en un dominio crítico: un valor de laboratorio inventado o mal extraído puede tener consecuencias clínicas graves.
- Solo soporta inglés, lo que limita su uso con informes en castellano u otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento de la regulación sanitaria aplicable (por ejemplo, MDR en la UE o FDA en EE. UU.) para software con finalidad médica.
- No se documentan sesgos, composición del dataset ni procesos de anonimización de datos clínicos, lo que plantea dudas sobre privacidad y equidad.
- No debe utilizarse como sustituto del juicio clínico; cualquier salida requiere validación por personal sanitario cualificado.
- La model card no describe mecanismos de seguridad, filtros de contenido ni evaluación de errores en la extracción de parámetros.

## Enlaces

- Hugging Face: https://huggingface.co/Azeemtalib/SelfLearning-Medical-Analyst-v1
