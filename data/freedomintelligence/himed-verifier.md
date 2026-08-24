# FreedomIntelligence/HiMed-Verifier

## Resumen

HiMed-Verifier es un modelo de lenguaje desarrollado por FreedomIntelligence (FreedomAI) como parte del proyecto HiMed, una iniciativa orientada a incentivar el razonamiento en hindi dentro de modelos médicos de lenguaje. Este modelo concreto, denominado "verifier", actúa como componente de verificación dentro del pipeline de generación, encargándose de validar y puntuar las respuestas producidas por el modelo principal. El proyecto se describe en el paper "HiMed: Incentivizing Hindi Reasoning in Medical LLMs" (arXiv:2605.24635), que plantea un entrenamiento en dos etapas: la primera adapta el modelo a la generación de texto médico en hindi, y la segunda introduce razonamiento explícito.

Con 3.212.755.968 parámetros (aproximadamente 3.2B) y arquitectura basada en Llama, el modelo se distribuye con licencia Apache 2.0 en formato safetensors. La relevancia actual radica en la escasez de modelos médicos especializados en lenguas vernáculas de la India, un ámbito con una demanda creciente en entornos clínicos y de telemedicina. El checkpoint se ha publicado en HuggingFace aunque el paper aún no ha sido aceptado formalmente, lo que sugiere que los autores consideran el modelo suficientemente estable para su uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (variante no especificada) |
| Parametros totales | 3.212.755.968 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (inferido por el proyecto HiMed) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en el diseño Llama, según el tag incluido en el repositorio, aunque no se especifica la variante exacta (Llama 2, Llama 3, etc.). El tamaño de 3.2B parámetros sugiere una variante compacta, probablemente orientada a inferencia eficiente en entornos con recursos limitados.

El entrenamiento sigue el esquema descrito en el paper HiMed. La primera etapa se centra en adaptar el modelo a la generación de texto médico en hindi, estabilizando vocabulario básico y expresiones médicas mediante ejemplos de respuestas factuales cortas sin razonamiento explícito. Esta fase proporciona una inicialización alineada con el idioma y el dominio clínico. La segunda etapa introduce razonamiento médico explícito, incentivando la generación de justificaciones y pasos de inferencia. El modelo "verifier" se entrena para evaluar la validez de esas razonamientos, actuando como crítico dentro del sistema HiMed. No se han publicado detalles sobre el volumen de tokens, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto médico en hindi, incluyendo terminología clínica y expresiones de dominio.
- Verificación de razonamiento médico: evalúa si las respuestas generadas contienen pasos de razonamiento válidos y correctos.
- Razonamiento médico multietapa: apoyo al pipeline de generación de respuestas con justificación clínica.
- Adaptación a lenguaje vernáculo: específicamente entrenado para hindi, con vocabulario médico normalizado.
- Integración en pipelines de agentes médicos: funciona como componente crítico que valida las salidas del modelo generador principal.
- Capacidad de puntuación o clasificación de respuestas: su función de verificación puede extenderse a tareas de ranking de candidatos.

## Casos de uso

- Asistencia clínica en hindi: el modelo puede verificar las respuestas generadas por un LLM médico antes de presentarlas a un profesional sanitario, reduciendo el riesgo de errores en entornos rurales de India.
- Telemedicina multilingüe: integración en sistemas de teleconsulta que atienden pacientes en hindi, donde el verifier garantiza que las recomendaciones sean médicamente coherentes.
- Formación de estudiantes de medicina en hindi: el modelo puede evaluar razonamientos médicos propuestos por estudiantes, indicando si la justificación es correcta o si contiene fallos lógicos.
- Traducción médica asistida: como verificador, puede comprobar que las traducciones al hindi de documentos médicos conservan el razonamiento clínico original.
- Sistemas RAG médicos: en un pipeline de recuperación aumentada, el verifier puede validar que las respuestas compuestas por el generador sean fieles a las fuentes recuperadas.
- Investigación en LLM médicos de lenguas vernáculas: sirve como referencia para estudiar la verificación de razonamiento en dominios clínicos no ingleses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper está pendiente de aceptación y no se han difundido métricas sobre MMLU, HumanEval, GSM8K o evaluaciones específicas de dominio médico (como MedQA) en la documentación pública.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,2B parámetros en FP16, el modelo requiere aproximadamente 6,4 GB de VRAM. Con cuantización de 4 bits (GGUF Q4_K_M), se reduce a unos 3-4 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100, H100. Cabe en GPUs consumer de 8 GB o más con cuantización.
- Si cabe en consumer GPU: sí, en GPUs como RTX 3060 12 GB, RTX 3080 10 GB o superiores.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se genera GGUF), HuggingFace Transformers.
- Latencia y throughput: no disponible, aunque por el tamaño se estima latencia de decodificación de ~10-20 tokens/s en una RTX 4090 con cuantización, y mayor throughput con vLLM en GPUs de datacenter.

## Comparativa con modelos similares

No disponible. No se han encontrado datos de modelos comparables en la información pública. El modelo comparte categoría con otros LLM médicos de tamaño medio como BioGPT, Med-PaLM 2 o Llama 3 8B fine-tunado en dominios médicos, pero no hay datos de comparación directa en este caso.

## Limitaciones y advertencias

- El paper no ha sido aceptado aún; el checkpoint se publica en fase de investigación, por lo que su rendimiento en producción no está garantizado.
- No se han publicado datos de evaluación sobre sesgos, alucinación ni errores en dominios clínicos de alto riesgo.
- El modelo está orientado a hindi; su rendimiento en otros idiomas no está documentado y probablemente sea limitado.
- No se dispone de información sobre la longitud de contexto soportada, lo que puede afectar a tareas con historiales clínicos largos.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconoce la cobertura de especialidades médicas.
- Para uso en entornos clínicos reales se requiere una validación clínica rigurosa que no se ha documentado.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso médico recae en el implementador.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/FreedomIntelligence/HiMed-Verifier
- Dataset HiMed: https://huggingface.co/datasets/FreedomIntelligence/HiMed
- Repositorio GitHub: https://github.com/FreedomIntelligence/HiMed
- Paper arXiv: https://arxiv.org/html/2605.24635
- Perfil de la organización: https://huggingface.co/FreedomIntelligence
