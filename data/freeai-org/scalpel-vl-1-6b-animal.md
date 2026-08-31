# freeai-org/Scalpel-VL-1.6B-Animal

## Resumen

Scalpel-VL-1.6B-Animal es un modelo multimodal de visión y lenguaje desarrollado por la comunidad freeai-org, especializado en el reconocimiento de posturas corporales, comportamientos y estados emocionales de gatos. Con 1.674 millones de parámetros, se basa en la arquitectura Qwen3-VL y aplica una técnica de poda de capas denominada "Recovery-Aware Layer Pruning" (Scalpel), que permite reducir el coste computacional manteniendo un alto rendimiento en tareas específicas. El modelo está diseñado para entornos de inferencia ligera, como dispositivos de borde o cámaras domésticas, y ofrece salidas JSON estructuradas para integración en sistemas automatizados.

Su relevancia radica en que, según los benchmarks publicados en FelineBench (un conjunto de evaluación propio, aún no abierto), supera en precisión media de reconocimiento de posturas a modelos con cinco veces más parámetros, como Qwen3.5-9B, y ofrece una velocidad de inferencia un 40 % superior a la de Qwen3-VL-2B. Esto lo convierte en una opción atractiva para aplicaciones de monitoreo animal en tiempo real, donde el equilibrio entre precisión y latencia es crítico. El modelo soporta inglés y chino, y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal vision-language) con poda de capas |
| Parametros totales | 1.674.508.032 (1,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe una variante no oficial Q2 en el repositorio TiGa-RCE/Scalpel-VL-1.6B-oQ2) |
| Idiomas soportados | Ingles, chino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Scalpel-VL-1.6B-Animal parte del modelo Qwen3-VL y aplica una técnica de poda de capas orientada a la recuperación del rendimiento, descrita en el repositorio GitHub "Scalpel: Recovery-Aware Layer Pruning for Faster Vision-Language Models". Esta técnica elimina capas redundantes del transformer y posteriormente realiza un ajuste fino (fine-tuning) para recuperar la precisión perdida, logrando así una reducción significativa del coste computacional sin sacrificar en exceso la calidad. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. El modelo se evalúa en FelineBench, un dataset propio de anotaciones multidimensionales para reconocimiento felino, que por el momento no está disponible públicamente.

## Capacidades

- Reconocimiento de posturas felinas: clasifica acciones (dormir, comer, acicalarse, etc.), posición del cuerpo, orejas, cola, expresiones faciales y características del pelaje.
- Detección y conteo de gatos: identifica la presencia de gatos en una imagen y cuenta cuántos hay visibles.
- Comprensión multimodal general: mantiene capacidades de QA visual, descripción de escenas y generación de leyendas (captioning) en dominios no felinos.
- Salida JSON estructurada: puede generar respuestas en formato JSON siguiendo un esquema predefinido, lo que facilita la integración en pipelines automatizados.
- Multilingüe: soporta inglés y chino para las instrucciones y respuestas.

## Casos de uso

- Monitoreo de mascotas en tiempo real: integrado en cámaras domésticas o sistemas de videovigilancia, el modelo puede detectar comportamientos anómalos (por ejemplo, acicalamiento excesivo, posturas de dolor) y enviar alertas al propietario. Su baja latencia permite análisis en streaming.
- Aplicaciones de bienestar animal en refugios: permite automatizar la observación del estado físico y emocional de gatos en entornos con muchos individuos, ayudando a priorizar atención veterinaria.
- Asistentes para clínicas veterinarias: el modelo puede analizar fotografías de pacientes felinos y generar informes preliminares sobre postura, movilidad y posibles signos de malestar, complementando la evaluación del profesional.
- Investigación etológica: facilita la recopilación de datos conductuales a gran escala, ya que puede etiquetar automáticamente horas de vídeo o secuencias de imágenes con anotaciones de comportamiento.
- Documentación automatizada en guarderías o residencias felinas: genera registros diarios de actividad y estado de cada animal en formato JSON, listos para integrarse en bases de datos o sistemas de gestión.
- Edge computing en entornos rurales o sin conexión: al ser un modelo de 1,6B, puede desplegarse en dispositivos de bajo consumo (Raspberry Pi con acelerador, Jetson Nano) para monitorización offline en granjas o colonias controladas.

## Benchmarks y rendimiento

Los resultados presentados provienen de la model card del autor y se basan en FelineBench, un dataset de evaluación propio. No se han publicado resultados en benchmarks generales estándar (MMLU, HumanEval, etc.).

**Reconocimiento de posturas felinas (puntuación media calibrada)**

| Modelo | Parámetros | Action | Body | Ear | Tail | Face | Fur | Media |
|---|---|---|---|---|---|---|---|---|
| Llama-3-LLaVA-NeXT | 8B | 77.40 | 5.34 | 40.21 | 0.00 | 0.00 | 0.00 | 20.49 |
| Qwen3-VL-2B | 2B | 82.45 | 27.63 | 43.97 | 42.80 | 29.57 | 25.68 | 42.02 |
| MiniCPM-V-4.5 | 8B | 87.26 | 71.68 | 34.77 | 49.10 | 24.37 | 63.80 | 55.16 |
| Qwen3.5-9B | 9B | 88.22 | 53.51 | 46.86 | 84.87 | 58.30 | 85.98 | 69.62 |
| **Scalpel-VL-1.6B** | **1.6B** | **85.82** | **76.49** | **66.53** | **92.03** | **69.72** | **89.64** | **80.04** |

**Detección y conteo de gatos**

| Modelo | Parámetros | Detección | Precisión de conteo |
|---|---|---|---|
| Llama-3-LLaVA-NeXT | 8B | 100.00 | 80.29 |
| Qwen3-VL-2B | 2B | 95.19 | 84.62 |
| MiniCPM-V-4.5 | 8B | 100.00 | 92.07 |
| Qwen3.5-9B | 9B | 100.00 | 90.62 |
| **Scalpel-VL-1.6B** | **1.6B** | **100.00** | **89.42** |

**Velocidad de inferencia** (según el autor, bajo configuraciones de hardware unificadas):
- 40 % mayor throughput que Qwen3-VL-2B.
- Latencia comparable a Qwen3.5-0.8B (modelo denso con la mitad de parámetros).

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1,6B en FP16, requiere aproximadamente 3,2 GB de VRAM solo para los pesos. Con cuantización a 8 bits o 4 bits, puede reducirse a 1,6-2 GB, lo que permite ejecutarlo en GPUs consumer de gama media (RTX 3060, RTX 4060, etc.) e incluso en algunas iGPU con suficiente memoria compartida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP16. Para despliegue en borde, se pueden usar dispositivos como Jetson Orin Nano o Raspberry Pi 5 con acelerador NPU.
- Opciones de despliegue: al estar basado en Qwen3-VL, es compatible con frameworks como vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (si se añade soporte de visión). También puede ejecutarse con Transformers de HuggingFace.
- Latencia y throughput: según el autor, la latencia es comparable a Qwen3.5-0.8B, lo que sugiere tiempos de respuesta por debajo de 100 ms en hardware moderno para imágenes individuales, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scalpel-VL-1.6B | 1.6B | No disponible | Visión felina | MIT | HuggingFace |
| Qwen3-VL-2B | 2B | No disponible | Visión general | Apache 2.0 (según versión) | HuggingFace |
| MiniCPM-V-4.5 | 8B | No disponible | Visión general | Apache 2.0 | HuggingFace |
| Qwen3.5-9B | 9B | No disponible | Visión general | No disponible | No disponible |

Scalpel-VL-1.6B se posiciona como una alternativa ligera y especializada frente a modelos generalistas de mayor tamaño. Su ventaja principal es el equilibrio entre precisión en el dominio felino y eficiencia computacional, aunque carece de la versatilidad de los modelos generalistas para tareas fuera de su dominio.

## Limitaciones y advertencias

- El dataset de evaluación FelineBench no está disponible públicamente, lo que dificulta la reproducibilidad independiente de los resultados publicados.
- El modelo está fuertemente especializado en gatos; su rendimiento en otras tareas de visión general puede ser inferior al de modelos generalistas del mismo tamaño.
- Solo soporta inglés y chino, lo que limita su uso en aplicaciones multilingües.
- No se han publicado detalles sobre posibles sesgos en razas de gatos, condiciones de iluminación o variedad de entornos. Es probable que el rendimiento varíe en escenarios no representados en el entrenamiento.
- Aunque la licencia del modelo es MIT, el modelo base Qwen3-VL tiene su propia licencia (posiblemente Apache 2.0), por lo que se recomienda verificar los términos de uso del modelo original antes de un despliegue comercial.
- No se dispone de información sobre la longitud de contexto, lo que puede afectar a tareas que requieran procesar secuencias largas de vídeo o múltiples imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/freeai-org/Scalpel-VL-1.6B-Animal
- Repositorio GitHub (Scalpel): https://github.com/freeai-org/Scalpel
- Variante cuantizada no oficial (Q2): https://huggingface.co/TiGa-RCE/Scalpel-VL-1.6B-oQ2
- Paper asociado (referencia en tags): arXiv:2608.22070 (no verificado)
