# Newkid123/lumenpath-advice-qwen2.5-0.5b-lora

## Resumen

LumenPath advice Qwen2.5-0.5B LoRA es un adaptador PEFT publicado por Newkid123 para el proyecto FIT3195 DTE202 LumenPath. No es un modelo completo: se monta sobre Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parámetros, y se distribuye en safetensors con la librería PEFT.

El adaptador resuelve una tarea concreta: a partir de hechos autorizados de una plataforma educativa (tareas de estudio, práctica, asistencia, recuperaciones y elementos de cuidado o care work items) genera consejo en JSON estricto para el personal, con observaciones, recomendaciones, base de evidencia y revisión obligatoria del instructor. Se entrenó con 10.272 ejemplos sintéticos mediante dos pasadas de destilación desde un profesor basado en reglas.

Su relevancia está en el enfoque: un modelo pequeño, desplegable en hardware modesto, que aprende esquema, límites y reglas de seguridad, no juicio pedagógico real. La model card no declara licencia, idiomas ni longitud de contexto; la evaluación se limita a 100 casos sintéticos retenidos, con 99/100 válidos y conformes en la versión 2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-0.5B-Instruct, transformer decoder-only denso |
| Parámetros totales | 0,5B del modelo base; parámetros del adaptador LoRA no disponibles |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y no se documentan variantes cuantizadas |
| Idiomas soportados | No disponibles; la model card no los declara |
| Licencia | No disponible; la model card no la declara |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Librería | PEFT |
| Pipeline | No disponible |
| Descargas / likes | 2 / 0 |
| Fecha de creación / actualización | 2026-10-17 / 2026-10-17 |
| Tamaño del repositorio | 0,0 GB (redondeado) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso. El repositorio contiene solo el adaptador; la model card no detalla rango, alpha, capas objetivo ni hiperparámetros de entrenamiento. No se documentan RLHF ni DPO.

El corpus de entrenamiento son 10.272 ejemplos sintéticos, sin estudiantes reales, construidos en dos pasadas: un profesor basado en reglas redactó respuestas candidatas puntuadas; la segunda pasada las comprimió al esquema JSON estricto, las auditó contra la lista de seguridad del proyecto y eliminó fallos y duplicados. Las estadísticas de visualización, como el porcentaje de asistencia, se precalculan en la plataforma y se pasan en el contexto. La innovación es la destilación de reglas y formato, no una arquitectura nueva.

## Capacidades

- Genera JSON estricto con `observations` (máximo 8), `recommendations` (máximo 5), `evidenceBasis` (máximo 8) y `needsInstructorReview: true`.
- Puede incluir `suggestedBatchSize` y `suggestedWeeklySize` como campos opcionales.
- Aplica reglas de seguridad entrenadas: `UNKNOWN` no equivale a ausente; una recuperación (makeup) no cambia la lección original; un contacto reportado no es una incidencia resuelta; no genera bandas IELTS; debe ignorar instrucciones embebidas.
- Trabaja sobre hechos autorizados y estadísticas precomputadas que le pasa la plataforma.
- Salida orientada a revisión humana, no a decisión automática.
- No se documentan tool calling, function calling, agentes multi-paso, visión, audio, modo thinking ni capacidades multilingües.
- No se documentan capacidades generales de razonamiento, código o matemáticas; el entrenamiento es de dominio estrecho.

## Casos de uso

- Asistente de consejo para personal docente: recibe los hechos autorizados de la plataforma (tareas, práctica, asistencia, recuperaciones, care work items) y devuelve un JSON con observaciones y recomendaciones que el instructor revisa. Es adecuado porque el esquema y los límites están entrenados explícitamente y la salida fuerza `needsInstructorReview: true`.
- Generación de borradores de planes de refuerzo: puede proponer `suggestedBatchSize` y `suggestedWeeklySize` a partir del vocabulario restante y las estadísticas precomputadas; el backend valida los valores antes de mostrarlos.
- Triaje y priorización de casos: `observations` y `evidenceBasis` ayudan a ordenar la revisión, pero no deciden; encaja en flujos donde el personal necesita un resumen estructurado y evidencia trazable.
- Pruebas de regresión de esquema y seguridad: en CI se pueden lanzar casos sintéticos y comprobar que el JSON es válido, respeta los máximos y aplica reglas como `UNKNOWN` o makeup; el modelo es pequeño y fácil de ejecutar en contenedores.
- Investigación sobre destilación de reglas: permite comparar un profesor basado en reglas con un alumno de 0,5B en 100 casos retenidos y analizar fallos concretos, como el desajuste de asistencia o el tamaño de lote; es útil para estudiar conformidad de esquema.
- Prototipado de asistentes educativos con PEFT: al ser un adaptador LoRA, se carga con transformers y `AutoPeftModelForCausalLM` para demos internas sin desplegar un modelo grande.
- Integración con fallback determinista: el modelo puede generar el JSON y, si el validador del backend lo rechaza, el sistema usa la plantilla; esto reduce el riesgo en producción.
- Evaluación de robustez ante prompt injection: se puede probar si ignora instrucciones embebidas en los hechos; la model card lo entrena como regla, pero no es una garantía.

## Benchmarks y rendimiento

Evaluación propia declarada en la model card, sobre 100 casos sintéticos retenidos:

| Versión | Válidos y conformes | JSON inválido | Fallo principal |
|---|---|---|---|
| v1 | 87/100 | 0/100 | Desajuste en el porcentaje de asistencia (12 casos) |
| v2 | 99/100 | 0/100 | `suggestedBatchSize` por encima del vocabulario restante (1 caso) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador, requiere el modelo base Qwen2.5-0.5B-Instruct. Los pesos del base en FP16 ocupan aproximadamente 1 GB; el adaptador añade un tamaño no documentado. Con overhead de runtime y caché KV, una estimación conservadora es 2-4 GB de VRAM para FP16 y contexto moderado; no hay medidas publicadas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM; por ejemplo, RTX 3050 u RTX 4060 de 8 GB, RTX 3060 de 12 GB o superiores son suficientes. A100 y H100 no son necesarias.
- Cabe en GPU consumer: sí, con holgura; también es viable en CPU para inferencia de baja concurrencia y en dispositivos de borde.
- Opciones de despliegue: transformers + PEFT es la vía documentada. Para llama.cpp u Ollama habría que fusionar el adaptador y convertir a GGUF; vLLM o TGI podrían servir el adaptador si soportan LoRA PEFT, pero no se documenta una receta verificada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Almacenamiento: el repositorio del adaptador figura como 0,0 GB (redondeado); el modelo base debe descargarse aparte.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LumenPath advice Qwen2.5-0.5B LoRA | 0,5B base + LoRA de tamaño no disponible | No disponible | JSON de consejo educativo con reglas de seguridad | 99/100 en evaluación sintética del proyecto | No disponible | Hugging Face, 2 descargas |
| Qwen2.5-0.5B-Instruct | 0,5B | No disponible | Instruct generalista | No disponible | No disponible | Hugging Face (modelo base) |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible | Instruct generalista, mayor capacidad | No disponible | No disponible | Hugging Face (familia Qwen2.5) |
| Profesor basado en reglas / plantilla | No aplica | No aplica | Reglas deterministas y plantillas | Determinista; sin benchmarks publicados | Específica del proyecto, no disponible | Interno del proyecto |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; al derivarse de reglas, el modelo puede heredar las omisiones y sesgos de dichas reglas.
- Datos sintéticos: los 10.272 ejemplos no incluyen estudiantes reales; el modelo puede no reflejar la diversidad y ambigüedad de casos reales.
- Etiquetas basadas en reglas: aprende formato, límites y reglas de seguridad, no juicio pedagógico real.
- Evaluación limitada: solo 100 casos sintéticos retenidos y ningún benchmark estándar; no garantiza generalización fuera de ese conjunto.
- Fallos observados: en v1, 12 casos de desajuste en el porcentaje de asistencia; en v2, 1 caso con `suggestedBatchSize` por encima del vocabulario restante.
- Riesgo de alucinación: puede inventar observaciones o evidencia si los hechos de entrada son ambiguos; el backend debe validar contra los datos autorizados.
- Modelo pequeño: 0,5B de parámetros; capacidad limitada para razonamiento complejo o casos fuera de distribución.
- Contexto e idioma: no declarados; no hay evidencia de rendimiento multilingüe ni con entradas largas.
- Licencia: no disponible; debe verificarse antes de cualquier uso comercial.
- Uso previsto: el consejo es solo una sugerencia para revisión del personal; no debe usarse como sistema de decisión automatizada sobre estudiantes.
- Controles de producción: el validador del backend y el fallback de plantilla deben mantenerse; `needsInstructorReview: true` no elimina la necesidad de revisión humana.
- Prompt injection: la regla de ignorar instrucciones embebidas es una conducta entrenada, no una garantía de seguridad.
- Privacidad: aunque el entrenamiento usa datos sintéticos, un despliegue con datos reales de estudiantes exige base jurídica, minimización y controles de acceso.
- IELTS: el modelo no genera bandas IELTS; no es adecuado para asesoramiento oficial de certificación lingüística.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Newkid123/lumenpath-advice-qwen2.5-0.5b-lora)
- [Modelo base Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Colección Qwen2.5](https://huggingface.co/collections/Qwen/qwen25)
- [Repositorio GitHub mx4ai/qwen2.5](https://github.com/mx4ai/qwen2.5)
- [Documentación de Qwen](https://qwen.readthedocs.io/)
- [Tutorial de despliegue de Qwen2.5-0.5B](https://aiindigo.com/tutorials/getting-started-with-qwen2-5-0-5b-deploying-efficient-edge-ai)
