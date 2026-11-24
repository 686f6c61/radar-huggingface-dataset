# AnkitNayak-dev/QJev-1.5B-Abliterated

## Resumen

QJev-1.5B-Abliterated es un modelo de decisión de 1.543.714.304 parámetros (aproximadamente 1,5B) desarrollado por AnkitNayak-dev, derivado de QJev-1.5B, que a su vez parte de Qwen2.5-1.5B-Instruct. No es un modelo generativo de texto al uso: está especializado en clasificación y selección de decisiones mediante un mecanismo de "valor esperado conjunto" (Joint Expected Value, JEV) en un único paso de inferencia (System 1), con una latencia declarada de aproximadamente 31 ms por forward pass. Su pipeline oficial en Hugging Face es `text-classification`.

La variante Abliterated aplica una ablación direccional de representación (Arditi et al., 2024) para eliminar la dirección latente de rechazo del stream residual, ortogonalizándola en las matrices de proyección de atención (`o_proj`) y feed-forward (`down_proj`) en las capas 8 a 23. El objetivo declarado es que las logits de decisión reflejen utilidad esperada objetiva sin sesgos de rechazo en escenarios sensibles (triaje de ciberseguridad, respuesta a incidentes, evaluación de seguridad ofensiva).

Es relevante por su enfoque poco habitual: en lugar de generar texto autoregresivamente, produce distribuciones de probabilidad calibradas sobre conjuntos de hasta 10 opciones discretas, lo que lo hace adecuado para motores de decisión de baja latencia en pipelines automatizados. El modelo se publica bajo licencia Apache 2.0, aunque los pesos base están sujetos a la licencia de Alibaba Cloud Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2) adaptado a clasificación de decisiones; ablación direccional en capas 8-23 |
| Parámetros totales | 1.543.714.304 (~1,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 16-bit (3,08 GB) y NF4 4-bit (1,15 GB) en la familia; esta variante se publica en 16-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (pesos base bajo Alibaba Cloud Qwen License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer causal decoder-only. Sobre esa base se ha realizado un ajuste fino para convertir el modelo en un clasificador de decisiones: recibe un contexto y un conjunto de opciones (hasta 10) y devuelve una distribución de probabilidad calibrada sobre ellas, junto con la opción recomendada y su confianza. El entrenamiento se apoya en el dataset `SargeDev/jev-distill-corpus-v3` (destilación), y las métricas declaradas en la model card son accuracy, TVD (distancia de variación total) y divergencia KL, coherentes con una tarea de calibración de distribuciones discretas.

La innovación técnica principal es la ablación de la dirección de rechazo: se identifica la dirección latente de rechazo en el stream residual y se ortogonaliza en `o_proj` y `down_proj` de las capas 8 a 23, eliminando el sesgo de rechazo sin reentrenar. El resultado es una inferencia de un solo paso (sin generación autoregresiva) con latencia declarada de ~31 ms por forward pass, orientada a un paradigma "System 1" (respuesta rápida e intuitiva frente a razonamiento multi-paso). No se especifican en la información disponible el número de tokens de entrenamiento ni detalles de RLHF/DPO.

## Capacidades

- Clasificación de decisiones: selecciona la mejor opción entre un conjunto de hasta 10 alternativas con probabilidades calibradas.
- Salida de distribución de probabilidad sobre las opciones, útil para umbrales y análisis de incertidumbre.
- Inferencia de un solo paso (System 1) sin overhead autoregresivo, con latencia declarada de ~31 ms.
- Eliminación del sesgo de rechazo (abliterated) para escenarios sensibles o de seguridad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no está planteado como modelo agéntico; su diseño es de decisión en un paso.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: modo de decisión JEV, endpoint `/v1/systemone`, compatibilidad con API OpenAI en `/v1/chat/completions`.

## Casos de uso

- Triaje de ciberseguridad: dado un contexto de alerta y varias acciones posibles (aislar host, matar proceso, monitorizar), el modelo devuelve la acción recomendada con probabilidad calibrada, aprovechando la latencia de ~31 ms para respuesta casi en tiempo real.
- Respuesta a incidentes automatizada: selección entre procedimientos de contención, contención con preservación forense o monitorización, con confianza cuantificada para decidir si se escala a un humano.
- Enrutamiento de tickets o peticiones: clasificar una solicitud entrante entre un conjunto acotado de colas o departamentos en un solo paso de inferencia.
- Evaluación de seguridad y red teaming: generar decisiones sin sesgo de rechazo para probar la robustez de sistemas defensivos o estudiar comportamiento de modelos "unaligned".
- Motores de decisión en pipelines de baja latencia: integración como microservicio REST (`/v1/decide`) para seleccionar entre opciones en sistemas de recomendación o políticas simples.
- Clasificación con incertidumbre: usar la distribución de probabilidad sobre opciones para activar revisión humana cuando la confianza es baja o la distribución es plana.
- Investigación sobre alineación y ablación: estudiar el efecto de eliminar la dirección de rechazo en las decisiones de un modelo pequeño.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| JevBench Strict | 62,53 % | Tolerancia 0,05; dato declarado en badge de la model card |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos. La latencia declarada es de ~31 ms por forward pass.

## Requisitos de hardware

- VRAM estimada en 16-bit: ~3,1 GB de pesos más overhead de activaciones y contexto; en la práctica, 4-6 GB según longitud de contexto y batch.
- VRAM estimada en 4-bit (variante NF4 de la familia): ~1,15 GB de pesos; cabe holgadamente en GPUs de 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; A100/H100 no son necesarias para este tamaño, aunque aportan mayor throughput en batch.
- Cabe en GPU consumer: sí, en RTX 3060 (12 GB), RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida para la variante 4-bit.
- Opciones de despliegue: servidor propio `serve.py` (endpoints `/v1/decide`, `/v1/systemone`, `/v1/chat/completions`), Ollama (`ollama create` con Modelfile), vLLM (`--task classify`), y la librería `qjev` vía `transformers`.
- Latencia y throughput: ~31 ms por forward pass declarado; throughput en batch no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QJev-1.5B-Abliterated | ~1,5B | No disponible | Clasificación de decisiones JEV, abliterated | Apache 2.0 | Hugging Face |
| QJev-1.5B (flagship) | ~1,5B | No disponible | Clasificación de decisiones JEV, alineado | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5B | No disponible | Generación de texto instruct | Alibaba Cloud Qwen License | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La diferencia principal frente a Qwen2.5-1.5B-Instruct es la tarea (clasificación de decisiones frente a generación) y frente a QJev-1.5B la eliminación de la dirección de rechazo.

## Limitaciones y advertencias

- Modelo "unaligned" y "uncensored": la ablación del rechazo elimina salvaguardas de seguridad, por lo que puede producir decisiones inapropiadas en escenarios sensibles; no debe desplegarse sin capas de control externas.
- Riesgo de decisiones dañinas en dominios críticos (ciberseguridad, respuesta a incidentes): la ausencia de sesgo de rechazo no equivale a corrección; requiere validación humana.
- Calibración de probabilidades: aunque se declara calibrada, el rendimiento en JevBench Strict es del 62,53 % con tolerancia 0,05, lo que indica margen de error considerable.
- Contexto máximo e idiomas no documentados: riesgo de comportamiento impredecible fuera de la distribución de entrenamiento.
- Licencia: Apache 2.0 para el modelo, pero los pesos base están sujetos a la Alibaba Cloud Qwen License; revisar condiciones para uso comercial.
- Tamaño pequeño (~1,5B): capacidad limitada para contextos complejos o razonamiento multi-paso; no es un modelo generativo de propósito general.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan evaluar su calidad general.
- Riesgo de alucinación en la interpretación del contexto de decisión, especialmente con entradas ambiguas o fuera de dominio.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/AnkitNayak-dev/QJev-1.5B-Abliterated
- GitHub: https://github.com/AnkitNayak-dev/QJev-1.5B
- JevBench: https://benchmarkheaven.com/jev-models
- Dataset: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base: https://huggingface.co/AnkitNayak-dev/QJev-1.5B
- Referencia de ablación: Arditi et al., 2024 (Refusal in Language Models Is Mediated by a Single Direction)
