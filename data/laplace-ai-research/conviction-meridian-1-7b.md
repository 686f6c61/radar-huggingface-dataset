# Laplace-AI-Research/Conviction-Meridian-1.7B

## Resumen

Conviction Meridian 1.7B es un adaptador LoRA experimental publicado por Laplace AI Research sobre el modelo base Qwen3-1.7B. Forma parte de la familia Conviction, una línea de investigación centrada en el estudio de la revisión de creencias sensible a la evidencia: cuándo un sistema debe mantener su respuesta, cuándo debe revisarla ante nueva evidencia y cuándo debe declarar información insuficiente. El modelo no es un asistente de propósito general, sino un artefacto de investigación para reproducir experimentos de ConvictionBench.

Meridian explora si un calentamiento supervisado ligero (SFT) puede preservar suficiente señal de aprendizaje para el posterior entrenamiento con refuerzo (GRPO), mejorando a la vez la resistencia frente a registros falsificados y desafíos no respaldados. El adaptador se distribuye como dos LoRA de rango 16 y alpha 32, con aproximadamente 17,4 millones de parámetros entrenables, y requiere el modelo base Qwen3-1.7B para la inferencia, que debe ejecutarse con el modo thinking desactivado.

Su relevancia es metodológica: proporciona métricas reproducibles sobre sycophancy (adulación o cesión ante presión social), corrección legítima y abstención en escenarios controlados de aritmética sintética, libros de transacciones, lógica proposicional y pequeños mundos basados en reglas. La licencia Apache 2.0 facilita su uso en investigación, aunque su alcance práctico es deliberadamente acotado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA (rango 16, alpha 32) sobre transformer Qwen3-1.7B |
| Parámetros totales | ~17,4 millones entrenables en el adaptador; modelo base de 1,7 mil millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantización | No disponible (los pesos se distribuyen en safetensors; la cuantización depende del despliegue del base) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de dos etapas sobre Qwen3-1.7B. La primera etapa consistió en un ajuste fino supervisado (SFT) con pérdida solo en la completación, sobre 1.000 respuestas de referencia escritas por un solver, durante una época, con tasa de aprendizaje 2e-4 y tamaño de lote efectivo de 32. Este calentamiento ligero se diseñó para enseñar el comportamiento del benchmark preservando variación en la recompensa: tras él, aproximadamente el 31% de los grupos GRPO tenían varianza de recompensa cero, frente al 85% en la condición original de SFT completo seguido de GRPO.

La segunda etapa fusionó el adaptador SFT y entrenó un LoRA nuevo con el mismo esquema GRPO de 200 pasos que Vector. La recompensa determinista asigna 0,70 al resultado final correcto, 0,25 a la decisión correcta y 0,05 al formato válido. Se usó TRL 1.17 con pérdida DAPO, 16 prompts × 4 completaciones por paso del optimizador, temperatura 1,0 y β = 0. Los datos de ambas etapas provienen de ConvictionBench v0.1: la mitad SFT para la etapa 1 y un pool GRPO de 4.000 prompts sobre la otra mitad, sin solapamiento de problemas subyacentes.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen3-1.7B.
- Revisión de creencias ante evidencia: mantiene, corrige o abstiene respuestas según el contexto.
- Resistencia a registros falsificados en escenarios de benchmark (0,806 en distribución).
- Abstención ante episodios subdeterminados (0,727 en distribución).
- Corrección legítima cuando una derivación válida desafía una respuesta previa incorrecta.
- Soporte de tool calling heredado del modelo base, aunque el adaptador degrada la aplicación de actualizaciones de herramientas con cambio de estado (0,188 en subtipos retenidos).
- Razonamiento sobre aritmética sintética, libros de transacciones, lógica proposicional y mundos basados en reglas.
- No soporta visión ni audio; el modo thinking debe estar desactivado durante la evaluación.

## Casos de uso

- Reproducción de experimentos de ConvictionBench: cargar el adaptador sobre Qwen3-1.7B y ejecutar las particiones in-distribution, plantillas y subtipos retenidos con decodificación greedy y límite de 200 tokens nuevos para replicar las métricas publicadas.
- Investigación sobre sycophancy: medir la tasa de cambio de respuesta bajo desafíos no respaldados (0,375 en subtipos retenidos) y compararla con el base (0,536) para estudiar el efecto del calentamiento SFT ligero.
- Estudio de resistencia a registros falsificados: emplear los escenarios de forged-record para analizar cuándo el modelo evita adoptar valores implícitos en evidencia fabricada, con resistencia de 0,806 en distribución frente a 0,248 del base.
- Evaluación de abstención calibrada: utilizar los episodios subdeterminados para investigar cuándo el modelo declara información insuficiente (0,727 frente a 0,355 del base) en lugar de inventar una respuesta.
- Análisis de corrección legítima en historial natural: estudiar la aceptación de correcciones válidas a respuestas propias erróneas (10/41 episodios), un régimen donde el prior lo genera el propio modelo y las comparaciones no son pareadas.
- Comparación de metodologías de RL: contrastar la varianza de recompensa y la estabilidad del entrenamiento entre el calentamiento ligero de Meridian y el SFT completo de condiciones previas, usando las configuraciones públicas del repositorio de investigación.
- Docencia y divulgación sobre alineación: ilustrar con métricas concretas los compromisos entre resistencia a la presión, corrección y aplicación de actualizaciones de herramientas en modelos pequeños.

## Benchmarks y rendimiento

Resultados publicados por el autor; los valores entre corchetes son intervalos de confianza del 95% por bootstrap de clústeres con 2.000 remuestreos sobre grupos de problemas.

| Métrica | Qwen3-1.7B base | Conviction Meridian 1.7B | Episodios |
|---|---:|---:|---:|
| Precisión final in-distribution | 0,445 | 0,787 [0,762; 0,810] | 2.211 |
| Precisión final en plantillas y encuadres retenidos | 0,425 | 0,738 [0,708; 0,765] | 2.474 |
| Precisión final en subtipos retenidos | 0,424 | 0,560 [0,520; 0,597] | 2.588 |
| Tasa de cambio por presión en subtipos retenidos (menor es mejor) | 0,536 | 0,375 [0,322; 0,430] | 845 |
| Corrección legítima en subtipos retenidos | 0,937 | 0,926 [0,886; 0,961] | 175 |
| Actualizaciones de herramientas con cambio de estado en subtipos retenidos | 0,301 | 0,188 [0,142; 0,238] | 372 |
| Resistencia a registros falsificados in-distribution | 0,248 | 0,806 [0,757; 0,855] | 403 |
| Resistencia a registros falsificados en subtipos retenidos | 0,340 | 0,578 [0,518; 0,637] | 533 |
| Abstención en episodios subdeterminados in-distribution | 0,355 | 0,727 [0,682; 0,774] | 403 |
| Corrección legítima en historial natural (subtipos retenidos) | 0,875 | 0,244 [0,114; 0,387] | 41 |

Meridian resistió registros falsificados enmarcados por el benchmark más a menudo que Vector en distribución (0,806 frente a 0,191) y aceptó más correcciones legítimas a sus propias respuestas erróneas que Anchor en historial natural (10/41 frente a 4/54). Vector mantuvo mayor aceptación de corrección en historial natural (11/15) y mayor precisión final en subtipos retenidos. La diferencia de precisión estructural pareada frente a Vector fue de −0,084 [−0,115; −0,052], por debajo del margen de no inferioridad preregistrado de −0,03. Una segunda semilla reprodujo la dirección de las diferencias en resistencia y precisión retenidas.

## Requisitos de hardware

- VRAM estimada: el adaptador pesa aproximadamente 0,2 GB en safetensors; la inferencia requiere cargar el modelo base Qwen3-1.7B, que en fp16 ocupa del orden de 3,4 GB y en cuantizaciones de 8 o 4 bits aproximadamente 1,7-2 GB y 1-1,2 GB respectivamente (estimaciones según el tamaño del base, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en cuantización de 8 bits; una RTX 4090 (24 GB) permite fp16 con holgura.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 8 bits; en 4 bits cabe en GPUs de 6 GB.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; llama.cpp u Ollama requieren fusionar el adaptador con el base y convertir a GGUF; vLLM y TGI admiten el base con adaptadores LoRA dinámicos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Conviction Meridian 1.7B | 1,7 B (base) + 17,4 M (adaptador) | No disponible | Revisión de creencias y resistencia a sycophancy | Apache 2.0 | Hugging Face |
| Conviction Vector | 1,7 B (base) + adaptador | No disponible | Misma familia; mayor precisión retenida y corrección en historial natural | Apache 2.0 | Hugging Face (familia Conviction) |
| Conviction Anchor | 1,7 B (base) + adaptador | No disponible | Misma familia; menor aceptación de corrección en historial natural (4/54) | Apache 2.0 | Hugging Face (familia Conviction) |
| Qwen3-1.7B (base) | 1,7 B | No disponible | Modelo generalista sin adaptación a revisión de creencias | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo es un artefacto de investigación acotado a ConvictionBench; no está pensado como asistente de producción general.
- Aplicó solo 0,188 de actualizaciones de herramientas con cambio de estado válidas en subtipos retenidos, frente a 0,594 de Vector; en el control de canal puro (790 pares emparejados) adoptó 0,30 de las actualizaciones, lo que indica una degradación clara en ese eje.
- La corrección legítima en historial natural cae a 0,244 (10/41 episodios), muy por debajo del 0,875 del base; el modelo tiende a no corregir sus propias respuestas erróneas cuando el prior lo genera él mismo.
- La diferencia de precisión estructural frente a Vector (−0,084) incumple el margen de no inferioridad preregistrado de −0,03.
- Solo soporta inglés; no hay datos de rendimiento multilingüe.
- Riesgo de alucinación no cuantificado fuera de los escenarios del benchmark; las métricas de abstención solo cubren episodios subdeterminados sintéticos.
- Las comparaciones en historial natural no son pareadas, ya que el conjunto de episodios elegibles depende de la primera respuesta de cada modelo.
- Requiere el modelo base Qwen3-1.7B y evaluación con thinking desactivado; el uso con thinking activo no está validado.
- Sesgos específicos no documentados en la información disponible; al derivar de Qwen3-1.7B, hereda los sesgos del base.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación fuera del benchmark desaconseja su despliegue en producción sin evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Laplace-AI-Research/Conviction-Meridian-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset ConvictionBench v0.1: https://huggingface.co/datasets/Laplace-AI-Research/ConvictionBench
- Repositorio de investigación: https://github.com/Laplace-AI-Research/conviction
- Configuración SFT ligero: https://github.com/Laplace-AI-Research/conviction/blob/main/configs/sft_light.yaml
- Configuración GRPO v2: https://github.com/Laplace-AI-Research/conviction/blob/main/configs/grpo_v2.yaml
- Resultados del run original V2: https://github.com/Laplace-AI-Research/conviction/tree/main/results/V2
