# qvac/MedPsy-1.7B-GGUF

## Resumen

MedPsy-1.7B-GGUF es la versión cuantizada en formato GGUF del modelo MedPsy-1.7B, un modelo de lenguaje causal de tipo transformer decoder-only especializado en dominio médico y desarrollado por Tether AI Research. El modelo base parte del backbone Qwen3-1.7B (variante Thinking) y ha sido ajustado para tareas clínicas y sanitarias, con el objetivo de permitir inferencia totalmente local en dispositivos de borde (edge), incluidos portátiles y teléfonos inteligentes de gama media.

El repositorio incluye un fichero BF16 GGUF sin cuantizar (4,07 GB) junto con siete variantes cuantizadas producidas con llama.cpp, desde Q8_0 (2,16 GB, prácticamente sin pérdida) hasta IQ3_XXS (0,89 GB, con degradación severa). Esta gradación permite desplegar el mismo modelo en hardware muy diverso manteniendo una política de calidad explícita: el autor recomienda Q4_K_M con calibración imatrix como el mejor compromiso tamaño/calidad para smartphone.

La relevancia actual del modelo reside en su enfoque: un modelo pequeño (2.031.739.904 parámetros) específicamente entrenado para uso clínico y empaquetado para ejecución on-device, respaldado por una publicación en NeurIPS 2026 (arXiv:2611.02011) y una licencia Apache 2.0 que facilita su adopción comercial. El modelo está orientado exclusivamente al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (backbone Qwen3-1.7B Thinking) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M (imatrix), Q4_K_M (imatrix), IQ4_NL (imatrix), IQ4_XS (imatrix), IQ3_M (imatrix), IQ3_XXS (imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (producidos con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only construido sobre el backbone Qwen3-1.7B en su variante Thinking, lo que implica la presencia de un modo de razonamiento interno antes de la respuesta final. El ajuste específico para dominio médico se documenta en el artículo de NeurIPS 2026 "MedPsy: State-of-the-Art Small Medical Language Models for Efficient Edge Deployment" (arXiv:2611.02011) y en el informe técnico del autor. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset clínico ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable de esta variante no está en la arquitectura, sino en el pipeline de cuantización: todos los ficheros se generan con llama.cpp, y las variantes por debajo de 8 bits emplean calibración con importance matrix (imatrix), que según el autor reduce de forma consistente la degradación de calidad. Q8_0 se publica sin imatrix porque el autor verificó que no aportaba beneficio medible a 8 bits. El informe técnico incluye una comparativa K-quants frente a I-quants y una ablación de imatrix por número de bits (sección 4.7).

## Capacidades

- Generación de texto conversacional orientada a dominio médico y sanitario.
- Razonamiento clínico de tipo pregunta-respuesta, incluyendo formato cerrado (closed-ended) evaluado en HealthBench.
- Modo Thinking heredado de Qwen3-1.7B, con razonamiento interno antes de responder.
- Inferencia totalmente on-device mediante llama.cpp y el SDK QVAC.
- Ejecución en dispositivos de borde: portátiles y teléfonos inteligentes de gama media con las cuantizaciones de 4 bits.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para integración en servicios.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Triaje clínico preliminar en aplicaciones móviles: con la cuantización Q4_K_M (1,28 GB, −1,10 % relativo en AVG Score) el modelo cabe en un smartphone de gama media y puede ejecutar preguntas estructuradas de síntomas sin enviar datos del paciente a la nube, lo que simplifica el cumplimiento de privacidad.
- Asistencia a la documentación clínica en entornos sin conectividad: el fichero BF16 o Q8_0 puede desplegarse en un portátil y generar resúmenes o borradores de notas clínicas en inglés en consultas rurales o entornos aislados.
- Educación médica y simulaciones de caso: el modo Thinking del backbone permite generar cadenas de razonamiento clínico paso a paso, útil para plataformas de formación de estudiantes de medicina.
- Chatbot de información sanitaria en aplicaciones de salud del consumidor: con Q5_K_M (1,47 GB, −0,03 % relativo) se obtiene prácticamente la calidad del modelo completo en un tamaño apto para apps de escritorio y móviles de gama alta.
- Preprocesado y clasificación de consultas médicas en pipelines locales: el modelo puede etiquetar o reformular consultas antes de derivarlas a un sistema mayor, ejecutándose en el mismo dispositivo para reducir latencia y coste de API.
- Investigación en IA médica de borde: el paquete de cuantizaciones con métricas de degradación publicadas (Δ AVG en puntos y en porcentaje relativo) sirve como referencia reproducible para estudiar el impacto de la cuantización en tareas clínicas.
- Prototipado rápido con el SDK QVAC: integración en aplicaciones Tether mediante el SDK oficial sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

La model card publica la degradación de calidad de cada cuantización respecto al modelo BF16 evaluado con vLLM. La métrica AVG Score se define como la media de HealthBench Overall y Closed-Ended Average. No se proporcionan en la información disponible los valores absolutos de HealthBench ni comparaciones con otros modelos.

| Fichero | Formato | Imatrix | Tamano | Δ AVG (pts) | Δ AVG (rel %) |
|---|---|---|---|---|---|
| `medpsy-1.7b-bf16.gguf` | BF16 | n/a | 4,07 GB | ≈0,00 | ≈0,00 % |
| `medpsy-1.7b-q8_0.gguf` | Q8_0 | no | 2,16 GB | 0,00 | 0,00 % |
| `medpsy-1.7b-q5_k_m-imat.gguf` | Q5_K_M | sí | 1,47 GB | −0,02 | −0,03 % |
| `medpsy-1.7b-q4_k_m-imat.gguf` | Q4_K_M | sí | 1,28 GB | −0,73 | −1,10 % |
| `medpsy-1.7b-iq4_nl-imat.gguf` | IQ4_NL | sí | 1,23 GB | −1,70 | −2,56 % |
| `medpsy-1.7b-iq4_xs-imat.gguf` | IQ4_XS | sí | 1,18 GB | −1,79 | −2,69 % |
| `medpsy-1.7b-iq3_m-imat.gguf` | IQ3_M | sí | 1,03 GB | −3,58 | −5,40 % |
| `medpsy-1.7b-iq3_xxs-imat.gguf` | IQ3_XXS | sí | 0,89 GB | −12,46 | −18,78 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más el overhead de contexto; el BF16 requiere unos 4,07 GB y Q4_K_M unos 1,28 GB.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU con al menos 2 GB de VRAM libre puede ejecutar las variantes de 4 bits.
- Cabe en GPU de consumo: sí, todas las cuantizaciones de 4 bits y superiores caben en tarjetas como RTX 3060, RTX 4060 o superiores; las variantes de 3 bits caben en GPUs con 2 GB.
- Despliegue en CPU: todas las variantes están pensadas para llama.cpp, por lo que pueden ejecutarse sin GPU.
- Opciones de despliegue: llama.cpp y el SDK QVAC (qvac.tether.io/dev/sdk). Otras opciones como vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedPsy-1.7B-GGUF | 2,03 B | no disponible | Apache 2.0 | GGUF (8 variantes) | Especializado en dominio médico, orientado a edge |
| MedPsy-4B | no disponible | no disponible | no disponible | safetensors (base) | Variante mayor de la misma familia; requiere más recursos |
| Qwen3-1.7B (Thinking) | 1,7 B (aprox.) | no disponible | no disponible | safetensors | Backbone del modelo; propósito general, no especializado en medicina |

No se dispone en la información proporcionada de datos de rendimiento comparables entre estos modelos ni de otras alternativas médicas de tamaño similar.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no soporta castellano ni otros idiomas.
- Las cuantizaciones IQ3_M e IQ3_XXS presentan degradación notable (−5,40 % y −18,78 % relativos) y el propio autor las desaconseja explícitamente para uso médico por mayor riesgo de alucinación.
- Riesgo de alucinación inherente a un modelo de 2 B de parámetros en dominio clínico; no debe usarse como sustituto de juicio médico profesional.
- Sesgos conocidos: no documentados en la información disponible.
- Longitud de contexto no especificada; conviene verificarla antes de diseñar flujos multi-turno largos.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria en aplicaciones sanitarias (por ejemplo, marcado CE como dispositivo médico) recae en el integrador.
- El BF16 GGUF no ha sido reevaluado de forma independiente con llama.cpp; el autor asume equivalencia con la evaluación vLLM del checkpoint fuente.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas en producción sin validación.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/qvac/MedPsy-1.7B-GGUF
- Modelo base BF16: https://huggingface.co/qvac/MedPsy-1.7B
- Variante 4B: https://huggingface.co/qvac/MedPsy-4B
- Variante 4B GGUF: https://huggingface.co/qvac/MedPsy-4B-GGUF
- Backbone Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper NeurIPS 2026: https://arxiv.org/abs/2611.02011
- Informe técnico: https://huggingface.co/blog/qvac/medpsy
- Código: https://github.com/tether-ai-research/qvac-medpsy
- Colección MedPsy: https://huggingface.co/collections/qvac/medpsy
- llama.cpp: https://github.com/ggml-org/llama.cpp
- SDK QVAC: https://qvac.tether.io/dev/sdk/
- Tether AI Research: https://tether.io/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
