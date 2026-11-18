# carlclausewitz/strands-decider-clinical-use

## Resumen
Strands Decider Clinical Use es un modelo de clasificación de texto especializado que actúa como motor de autocompletado para TABChart, un prototipo de historia clínica electrónica (EMR) ambulatoria en coreano desarrollado por el equipo 생물정보학 5조. Partiendo del torso de Qwen3.5-2B-Base, el modelo incorpora una cabeza pointer (Strands Decider) que no genera texto libre, sino que puntúa opciones de preguntas de elección múltiple sobre la línea de plan de una nota clínica: si es una derivación, un seguimiento, cuántas semanas de intervalo, etc.

El modelo ha pasado por un pipeline de compresión agresivo: fine-tuning con LoRA sobre gráficas sintéticas de pacientes ambulatorios coreanos, poda de 4 de las 24 capas del decoder (las capas 9, 13, 18 y 20, todas de atención lineal) y cuantización simétrica int4 con grupos de 128. El resultado es un artefacto de aproximadamente 0,9 GB en disco que mantiene las métricas del LoRA sin comprimir en el conjunto ciego 5 (127/144 aciertos, 88,2%).

Es relevante por su enfoque poco habitual: un modelo pequeño, podado y cuantizado, orientado a una tarea de decisión cerrada en un dominio muy concreto (EMR coreano), con calibración explícita (ECE 0,022) y umbral de confianza para decidir cuándo sugerir. No obstante, es un prototipo de investigación entrenado únicamente con datos sintéticos y no constituye un dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen3.5 (híbrido con capas de atención lineal tipo Gated DeltaNet), con cabeza pointer de Strands Decider |
| Parametros totales | 836.360.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 simétrico round-to-nearest, grupos de 128 (capas lineales y embeddings); normas, convoluciones y gates en bf16; el archivo int4 es formato de almacenamiento y se descomprime a bf16 para servir |
| Idiomas soportados | ko, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` con tensores `.qweight` uint8 y `.scales` float32, `head.safetensors`, `quant_config.json`) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-2B-Base, un transformer decoder con capas de atención lineal (Gated DeltaNet) mezcladas con atención estándar, y le añade la cabeza pointer de Strands Decider, que convierte la tarea en una puntuación de opciones en lugar de generación libre. Sobre el checkpoint público `StrandsAgents/strands-decider-2B-qwen3.5-v1-2610` se aplicó un fine-tuning LoRA (r 48, alpha 96) sobre todas las proyecciones de atención, MLP y Gated DeltaNet, con 2 épocas, learning rate 1e-4 (3e-4 para la cabeza), una penalización KL de 0,3 hacia el decider público congelado y 3.544 pasos en una RTX 6000 (2 h 16 min). El corpus de entrenamiento son 51.213 filas sintéticas de preguntas construidas a partir de gráficas ambulatorias coreanas generadas, memorandos de hábitos de médicos y líneas de plan (derivaciones, seguimientos, prescripciones, entregas, planes habituales y líneas que no deben recibir sugerencia).

Tras el fine-tuning se fusionó el LoRA y se podaron 4 de las 24 capas del decoder, seleccionadas por el criterio de menor cambio en las respuestas al omitirlas (capas 9, 13, 18 y 20, todas de atención lineal), sin fase de healing: la destilación de recuperación mejoraba la precisión por fila pero introducía una sugerencia errónea adicional en el conjunto 3, por lo que se descartó. Finalmente se aplicó cuantización simétrica int4 con grupos de 128, elegida tras barrer de int8 a int3 como el ajuste más bajo que preservaba las métricas (pérdida de 1 pp en precisión por fila, 0,5 pp en precisión con confianza alta y ninguna sugerencia errónea nueva en el conjunto 3). Los embeddings están atados a la cabeza de salida y se almacenan en int4 g128.

## Capacidades
- Clasificación de texto mediante elección múltiple: puntúa opciones para preguntas cerradas sobre la línea de plan de una nota clínica (tipo de actuación, intervalo en semanas, etc.).
- Decisión con umbral de confianza: el pipeline solo ensambla una sugerencia cuando la respuesta supera el umbral calibrado (precisión del 97,2% con confianza ≥ 0,9).
- Procesamiento de contexto de gráfica: recibe texto de estado (línea de plan y datos del chart) más la pregunta y las opciones en el formato de petición de Strands Decider.
- Soporte bilingüe coreano-inglés, con entrenamiento centrado en coreano clínico ambulatorio.
- No genera texto libre: su salida es una puntuación sobre opciones, lo que reduce el riesgo de alucinación en la sugerencia final.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso
- Autocompletado de la línea de plan en EMR ambulatoria: el modelo responde preguntas cerradas sobre lo que el médico está escribiendo y el sistema ensambla una sugerencia en gris que el facultativo acepta con Tab; encaja por su latencia (p50 de 77 ms en RTX 6000) y su calibración.
- Detección de derivaciones y seguimientos: clasifica si la línea implica referral o follow-up y el intervalo en semanas, alimentando reglas de negocio del sistema de historia clínica.
- Filtrado de líneas que no deben recibir sugerencia: distingue planes rechazados, condicionales o ya realizados, evitando autocompletados inapropiados.
- Investigación en interfaces clínicas asistidas: sirve como componente de decisión en prototipos académicos de documentación médica, gracias a su tamaño reducido (0,9 GB en disco) y licencia Apache 2.0.
- Despliegue en entornos con recursos limitados: al descomprimirse a bf16 ocupa unos 3,3 GB en memoria, por lo que puede servirse en GPUs de gama media o en Apple Silicon de 16 GB o más para pruebas.
- Evaluación de pipelines de compresión: su receta documentada (LoRA, poda por sensibilidad, int4 g128, calibración de temperatura) es un caso de estudio reproducible para medir el impacto de la compresión en tareas de clasificación clínica.
- Prototipado de asistentes de codificación clínica en coreano: permite experimentar con sugerencias contextuales en notas ambulatorias antes de invertir en modelos mayores.

## Benchmarks y rendimiento

| Metrica | Antes del fine-tuning | LoRA | Este modelo (LoRA → 20 capas → int4) |
|---|---|---|---|
| Conjunto ciego 5, app completa (144 casos) | 114/144 (79,2%) | 127/144 (88,2%) | 127/144 (88,2%) — 11 erróneas, 6 omitidas |
| Preguntas de validación dev (3.430) | — | 96,8% (fusionado) | 96,1% |
| Precisión con confianza ≥ 0,9 | — | 97,1% | 97,2% |
| Error de calibración (ECE) | — | — | 0,022 |
| Conjunto ciego 3, app completa (dev) | 107/137 | 123/137 | 122/137 |
| Conjunto ciego 4 (140 casos, sin comprimir) | — | 66,4% → 71,4% | no medido |

La app completa incluye reglas de línea, las respuestas del modelo y el umbral de confianza; no es el modelo aislado. La compresión mantuvo idénticos los totales del conjunto 5 respecto al LoRA sin comprimir. Los conjuntos ciegos fueron escritos por un autor distinto a partir de una especificación y sellados antes del entrenamiento.

## Requisitos de hardware
- Disco: aproximadamente 0,9 GB para los pesos int4 más 12,6 MB de la cabeza.
- Memoria en servicio: unos 3,3 GB tras descomprimir a bf16 (el archivo int4 no tiene kernels int4; se descomprime antes de servir).
- GPU recomendadas: RTX 6000 para producción del prototipo (p50 de 77 ms por petición); cualquier GPU con 4 GB o más de VRAM debería bastar para inferencia.
- Consumer GPU: sí, cabe en GPUs de consumo con 4 GB o más de VRAM; en Apple Silicon de 8 GB funciona pero está limitado por memoria (unos 58 s por petición), por lo que se recomienda GPU o Apple Silicon de 16 GB o más.
- Opciones de despliegue: servidor `strands-decider serve` tras descomprimir con `load_tabchart.py`; requiere torch 2.7.1, transformers 5.17.0, peft 0.21.0, safetensors y huggingface_hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: p50 de 77 ms en RTX 6000 frente a 152 ms del adaptador LoRA servido por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Strands Decider Clinical Use (este) | 836 M (podado, int4) | no disponible | Clasificación clínica por elección múltiple (ko/en) | Apache 2.0 | Hugging Face, 0 descargas |
| StrandsAgents/strands-decider-2B-qwen3.5-v1-2610 | ~2 B (24 capas, bf16) | no disponible | Decider generalista Strands | no disponible | Hugging Face |
| Qwen/Qwen3.5-2B-Base | ~2 B | no disponible | Modelo base de texto | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias
- Prototipo de investigación: entrenado y evaluado solo con gráficas sintéticas; no es un dispositivo médico ni debe usarse en práctica clínica real.
- Sesgos: el corpus refleja hábitos de médicos y gráficas generadas sintéticamente, sin validación con datos reales de pacientes ni diversidad demográfica documentada.
- Riesgo de alucinación: aunque no genera texto libre, puede producir sugerencias erróneas (11 en el conjunto ciego 5) u omitir sugerencias correctas (6); el umbral de confianza mitiga pero no elimina el riesgo.
- Limitaciones de idioma: solo coreano e inglés, con dominio restringido a notas ambulatorias de plan.
- Contexto: no se documenta la longitud máxima de contexto soportada.
- Licencia: Apache 2.0 permite uso comercial, pero el aviso del autor restringe explícitamente el uso clínico; verificar las obligaciones de atribución respecto a Qwen3.5-2B-Base y Strands Decider.
- Reproducibilidad: el archivo publicado se reconstruyó con la misma receta desde el checkpoint LoRA, por lo que algunos pesos pueden diferir en el último bit respecto a las mediciones originales.
- Compatibilidad: depende de la librería strands-decider y de versiones concretas de torch, transformers y peft; no hay kernels int4 nativos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/carlclausewitz/strands-decider-clinical-use
- Repositorio Strands Decider: https://github.com/strands-labs/strands-decider
- Modelo base Qwen3.5-2B-Base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Checkpoint de partida Strands Decider 2B: https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
