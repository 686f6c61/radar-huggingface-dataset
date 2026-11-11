# Docglasses-AI/lfm2.5-1.2b-clinical-r3-gguf

## Resumen

`Docglasses-AI/lfm2.5-1.2b-clinical-r3-gguf` es una cuantización GGUF del modelo `LiquidAI/LFM2.5-1.2B-Instruct`, publicada por el usuario Docglasses-AI y orientada a triaje clínico y dermatológico dentro de la aplicación SarvaDoc Pro. Se trata de un ajuste de uso específico (no de pesos nuevos) sobre la base instructiva de Liquid AI, distribuido en un único fichero de aproximadamente 697 MB con cuantización Q4_K_M y matriz de importancia (imatrix).

El modelo hereda la arquitectura LFM2.5 de Liquid AI, un transformer híbrido de 1.170.340.608 parámetros orientado a inferencia en dispositivo. La contribución del autor es el empaquetado GGUF optimizado para llama.cpp/GenieX y la adaptación del prompt de sistema al dominio médico-dermatológico, no un reentrenamiento documentado con datos clínicos.

Su relevancia práctica es acotada: ofrece un punto de partida ligero para asistentes de triaje en local, pero la model card es extremadamente escueta, no aporta métricas clínicas, no detalla el proceso de ajuste y declara explícitamente que no es un dispositivo de diagnóstico. Debe evaluarse con cautela antes de cualquier uso en producción sanitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM2.5 (heredada de LiquidAI/LFM2.5-1.2B-Instruct; detalles de capas no disponibles) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M con imatrix (único fichero publicado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (términos no especificados en la model card) |
| Formato de pesos | GGUF (`lfm2.5-1.2b-clinical-r3-q4_k_m-imat.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo de 1,17 mil millones de parámetros de la familia LFM2.5 de Liquid AI, diseñada para despliegue en dispositivo con un equilibrio entre calidad y coste computacional. La model card del repositorio no detalla la composición de capas, el mecanismo de atención ni las innovaciones internas del modelo base.

Respecto al entrenamiento, no se documenta ningún proceso de ajuste fino supervisado, RLHF, DPO ni curación de dataset clínico por parte de Docglasses-AI. La etiqueta `clinical-r3` sugiere una tercera iteración de un pipeline interno de adaptación (probablemente mediante prompt de sistema y evaluación), pero el repositorio no incluye información verificable sobre datos, número de tokens, metodología de cuantización con imatrix ni criterios de selección de la matriz de importancia. Cualquier afirmación sobre entrenamiento clínico debe considerarse no verificada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Soporte de instrucciones de sistema para roles especializados (en este caso, triaje dermatológico).
- Razonamiento básico y respuesta a preguntas de dominio general; no hay evidencia publicada de capacidades clínicas específicas.
- Tool calling / function calling: no documentado en este repositorio.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado a inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Triaje dermatológico preliminar en aplicación móvil: el modelo puede clasificar la urgencia de una consulta a partir de una descripción textual en inglés y sugerir derivación, integrándose en SarvaDoc Pro mediante llama.cpp/GenieX con un fichero de 697 MB apto para dispositivos con recursos limitados.
- Asistente de anamnesis guiada: conversación multi-turno para recoger síntomas cutáneos (localización, evolución, factores desencadenantes) antes de la consulta médica, aprovechando el formato instructivo del modelo base.
- Clasificación de textos clínicos breves: etiquetado de notas o mensajes de pacientes en categorías de triaje (urgente, preferente, demorable) en pipelines internos de preprocesado.
- Filtro de derivación en atención primaria: generación de resúmenes de motivo de consulta para el facultativo, con la advertencia de que la salida requiere revisión humana.
- Prototipado offline en entornos con restricciones de privacidad: al ejecutarse en local sin llamadas a API, permite experimentar con flujos clínicos sin enviar datos de pacientes a terceros.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la degradación de calidad de Q4_K_M+imatrix frente al modelo base en tareas de dominio médico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GB para los pesos en Q4_K_M; con overhead de contexto y KV cache, entre 1 y 2 GB según longitud de contexto (no especificada).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; también CPU con al menos 4 GB de RAM libre.
- Cabe en GPU de consumo: sí, en RTX 3050/4060, GTX 1660, Apple Silicon (M1 o superior) y en la mayoría de móviles de gama alta vía llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GenieX (mencionado por el autor); compatible con endpoints tipo OpenAI según la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Docglasses-AI/lfm2.5-1.2b-clinical-r3-gguf | 1,17 B | No disponible | `other` | GGUF Q4_K_M | Cuantización de dominio clínico, solo inglés |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,17 B | No disponible | No disponible | Safetensors, GGUF | Modelo base oficial, sin especialización clínica |
| Modelos clínicos pequeños tipo BioMistral-7B | 7 B | 32k (típico) | Apache 2.0 (según variante) | Safetensors, GGUF | Mayor tamaño y contexto, requiere más VRAM |

La comparativa se limita a lo verificable: el modelo aquí descrito es una cuantización del segundo, y las alternativas clínicas de mayor tamaño no están evaluadas en este repositorio.

## Limitaciones y advertencias

- La model card declara explícitamente que no es un dispositivo de diagnóstico; cualquier uso clínico requiere validación regulatoria y supervisión profesional.
- No hay evidencia publicada de datos de entrenamiento clínico, evaluación con casos reales ni métricas de sensibilidad/especificidad para triaje dermatológico.
- Riesgo elevado de alucinación en dominio médico al tratarse de un modelo de 1,2 B sin ajuste documentado.
- Solo soporta inglés; inadecuado para pacientes hispanohablantes sin traducción previa.
- Licencia `other` sin términos publicados: riesgo legal para uso comercial o distribución; debe contactarse con el autor.
- Contexto no documentado; podría ser insuficiente para historiales clínicos largos.
- Sesgos desconocidos: no se han publicado análisis de sesgo demográfico ni de representatividad de la piel en el dataset (crítico en dermatología).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por la comunidad.
- La cuantización Q4_K_M puede degradar tareas de razonamiento y precisión terminológica médica frente a FP16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Docglasses-AI/lfm2.5-1.2b-clinical-r3-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Liquid AI (organización): https://huggingface.co/LiquidAI
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
