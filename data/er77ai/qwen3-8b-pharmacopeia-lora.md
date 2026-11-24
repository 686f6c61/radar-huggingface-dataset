# er77ai/Qwen3-8B-pharmacopeia-lora

## Resumen

Qwen3-8B-pharmacopeia-lora es un adaptador LoRA de rango 16 desarrollado por el usuario er77ai sobre el modelo base Qwen/Qwen3-8B. Su propósito es responder preguntas farmacéuticas en ruso ancladas a un corpus de evidencias extraído de la farmacopea soviética (Фармакопея СССР) y de los estándares FEAS, devolviendo respuestas estructuradas en JSON con referencias explícitas a los identificadores de las evidencias proporcionadas. No es un modelo autónomo: requiere el modelo base Qwen3-8B y un contrato de prompt muy estricto para activar el comportamiento entrenado.

El artefacto se publica como material de desarrollo, no como modelo de producción. El propio autor indica `training_eligible=false` a nivel de datos fuente y califica el resultado como "development artifact". El entrenamiento se realizó en 3 épocas sobre 5.483 filas de QA, con una evaluación held-out de 582 filas separadas por página que arrojó una perplejidad media de 1,054.

Su relevancia es acotada pero concreta: demuestra un patrón de ajuste fino para dominios regulados donde la trazabilidad de la evidencia es obligatoria, usando un formato de salida verificable (claims con `evidence_ids`) en lugar de texto libre. Es útil como referencia técnica para pipelines de extracción documental farmacéutica en ruso, no como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen3-8B |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el base Qwen3-8B tiene 8.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-8B; no declarada en la model card) |
| Tipos de cuantizacion | GGUF q8_0 del modelo fusionado; adaptador en safetensors (entrenado con NF4 QLoRA) |
| Idiomas soportados | ruso (ru) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (modelo fusionado q8_0) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado sobre todas las proyecciones de atención y MLP del modelo Qwen3-8B, que actúa como base congelada. El ajuste se realizó con QLoRA en cuantización NF4 usando la librería unsloth sobre una GPU AMD RX 7900 XTX con ROCm 7.2.4, durante 3,61 horas y 3 épocas. El conjunto de entrenamiento consta de 5.483 filas de QA en formato de pregunta-respuesta con evidencias, derivadas de documentos de la farmacopea soviética y estándares FEAS, publicadas en el dataset er77ai/pharmacopeia-qa (bundle de desarrollo del 22 de noviembre de 2026, 6.065 filas, splits del 23 de noviembre de 2026 con semilla 20261123).

La innovación técnica no está en la arquitectura sino en el contrato de prompt y el formato de salida. El modelo se entrena para recibir un mensaje de sistema que exige claims JSON anclados a evidencia y un mensaje de usuario con un objeto `{"evidence": [...], "question": "..."}`, y para responder con `{"status": ..., "claims": [{"text": ..., "evidence_ids": [...]}]}`. El formato de chat es ChatML (`<|im_start|>` / `<|im_end|>`). Cualquier prompt en lenguaje libre no activa el comportamiento entrenado, lo que convierte al adaptador en un componente de un pipeline con validación de esquema más que en un modelo conversacional.

## Capacidades

- Generación de respuestas farmacéuticas en ruso ancladas a un conjunto de evidencias proporcionado en la entrada.
- Salida estructurada en JSON con claims individuales y referencias a `evidence_ids`, apta para validación automática.
- Cumplimiento estricto de un contrato de prompt con mensaje de sistema y payload JSON de usuario en formato ChatML.
- Extracción y síntesis de información de documentos normativos farmacéuticos (farmacopea soviética, estándares FEAS).
- No soporta tool calling ni function calling de forma nativa según la información disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüe limitado al ruso; no se declaran capacidades en otros idiomas.
- No apto para uso conversacional libre: fuera del contrato de prompt el comportamiento entrenado no se activa.

## Casos de uso

- Extracción documental farmacéutica regulada: dado un lote de fragmentos de farmacopea como `evidence`, el adaptador devuelve claims con referencias verificables, lo que permite auditar cada afirmación contra el documento fuente antes de incorporarla a una base de conocimiento.
- Asistencia a revisión normativa interna: un equipo de calidad farmacéutica puede enviar preguntas sobre monografías y estándares FEAS y obtener respuestas con `evidence_ids` que un revisor humano contrasta, reduciendo el tiempo de búsqueda manual en corpus rusos.
- Generación de fichas técnicas con trazabilidad: el formato JSON de salida se integra directamente en pipelines que exigen citar la fuente de cada dato, algo habitual en documentación de producto regulado.
- Construcción de datasets de evaluación: al ser un artefacto de desarrollo con perplejidad medida (1,054 en held-out), sirve como referencia para comparar estrategias de anclaje a evidencia en dominios técnicos en ruso.
- Prototipado de sistemas RAG especializados: el adaptador encaja como generador final de un pipeline de recuperación aumentada donde el recuperador selecciona fragmentos de farmacopea y el modelo solo sintetiza sobre ellos.
- Investigación sobre formatos de salida verificables: útil para estudiar cómo un LoRA de rango 16 modifica el comportamiento de un modelo de 8.000 millones hacia respuestas estructuradas y citadas, con un coste de entrenamiento de 3,61 horas en una GPU de consumo alto.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad media (held-out) | 1,054 | 582 filas, split por página |
| Epocas de entrenamiento | 3 | Sobre 5.483 filas de QA |
| Tiempo de entrenamiento | 3,61 h | AMD RX 7900 XTX, ROCm 7.2.4, unsloth, NF4 QLoRA |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa aproximadamente 0,2 GB (tamaño del repo); requiere cargar además el modelo base Qwen3-8B completo.
- VRAM estimada para inferencia con el base en precisión completa (BF16): en torno a 16 GB solo para pesos, más overhead de contexto y activaciones.
- VRAM estimada con cuantización q8_0 del modelo fusionado: aproximadamente 8-9 GB para pesos, más overhead.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4090 o GPUs con 12-16 GB para la versión GGUF q8_0.
- Cabe en GPU de consumo: sí, con la variante GGUF q8_0 en GPUs de 12 GB o más; en BF16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp u Ollama para el GGUF q8_0; vLLM o TGI para el modelo fusionado en safetensors con soporte de adaptadores PEFT; transformers + PEFT para cargar el adaptador directamente sobre el base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-pharmacopeia-lora | 8.000 M (base) + LoRA r16 | no disponible | QA farmacéutico en ruso con evidencia citada | AGPL-3.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (base) | 8.000 M | no disponible | Modelo generalista multilingüe | no disponible en la información | Hugging Face |
| Adaptadores LoRA de dominio público | variable | variable | Ajuste fino sobre dominio específico | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- Artefacto de desarrollo: el autor declara explícitamente que no está entrenado para producción y que los datos fuente tienen `training_eligible=false`.
- El comportamiento entrenado solo se activa con el contrato de prompt exacto (mensaje de sistema específico y payload JSON de usuario en ChatML); los prompts en lenguaje libre no producen la salida esperada.
- Riesgo de alucinación en los claims: aunque el formato exige `evidence_ids`, el modelo puede generar afirmaciones no respaldadas por las evidencias proporcionadas; se requiere validación automática del esquema y contraste con las fuentes.
- Cobertura lingüística limitada al ruso; no se declaran capacidades en castellano ni en otros idiomas.
- Corpus de entrenamiento reducido (5.483 filas) y de dominio muy estrecho (farmacopea soviética y estándares FEAS), con posible desactualización respecto a normativa farmacéutica vigente.
- Licencia AGPL-3.0: el uso comercial implica obligaciones de copyleft sobre el software que integre el modelo, incluida la distribución del código fuente bajo la misma licencia; revisar compatibilidad antes de integrarlo en productos propietarios.
- Sin descargas ni validación externa en el momento de la consulta: no hay evidencia de uso en producción ni de evaluación independiente.
- No se documentan sesgos específicos, pero el corpus soviético puede introducir sesgos históricos y terminológicos propios de esa tradición normativa.
- El adaptador no incluye capacidades de tool calling ni de agente; cualquier flujo multi-paso debe orquestarse externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/er77ai/Qwen3-8B-pharmacopeia-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/er77ai/pharmacopeia-qa
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
