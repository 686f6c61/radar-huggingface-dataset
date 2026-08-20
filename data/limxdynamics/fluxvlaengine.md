# limxdynamics/FluxVLAEngine

## Resumen

FluxVLA Engine es una plataforma de ingeniería integrada para aplicaciones de inteligencia encarnada (embodied intelligence), desarrollada por limxdynamics. No se trata de un modelo único, sino de un ecosistema completo que unifica configuración, interfaces estandarizadas y módulos desacoplados para el desarrollo de VLA (Vision-Language Agents). Su objetivo declarado es reducir la barrera de entrada en la investigación y desarrollo de VLA, ofreciendo un "estándar industrial para academia e industria".

La plataforma integra un zoo de modelos que incluye familias como OpenVLA (7B), LLaVA-VLA (3B-7B), GR00T (3B), Pi0/Pi0.5 (3B) y DreamZero (23B), permitiendo comparación, fine-tuning y despliegue rápido entre arquitecturas. Destaca por su inferencia de alta frecuencia: con GR00T-N1.5 alcanza 42.8 Hz en una RTX 5090, lo que la hace apta para control robótico en tiempo real. El repositorio en Hugging Face ocupa 1125 GB e incluye checkpoints entrenados con resultados competitivos en benchmarks LIBERO, como un 96.0% de media con PI0.5 PaliGemma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Plataforma multi-modelo: VLA basados en transformer (OpenVLA, LLaVA-VLA), flow-matching (Pi0/Pi0.5), diffusion/flow (DreamZero) y modelos propietarios GR00T |
| Parametros totales | Depende del modelo: 3B (GR00T, Pi0), 3B-7B (LLaVA-VLA), 7B (OpenVLA), 23B (DreamZero) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentación existe en inglés y chino) |
| Licencia | Apache 2.0 (según badge del repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FluxVLA Engine no presenta una arquitectura única, sino que integra múltiples familias de VLA con filosofías diferentes. Por un lado, OpenVLA y LLaVA-VLA usan arquitecturas transformer que combinan un backbone visual con un LLM para generar acciones de control. Por otro, Pi0 y Pi0.5 emplean flow-matching para producir trayectorias continuas y suaves, mientras que DreamZero (23B) utiliza generación basada en diffusion/flow para planificación de movimiento complejo. GR00T es una familia optimizada con operadores CUDA fusionados para predicción de acciones de alta frecuencia.

La plataforma soporta entrenamiento distribuido con DDP/FSDP, fine-tuning LoRA, evaluación posterior al entrenamiento y reanudación desde checkpoints. Los datos de entrenamiento son específicos de cada modelo integrado; los checkpoints propios de FluxVLA se entrenaron en suites LIBERO (LIBERO-10 y benchmarks mixtos). Se utiliza RTC trajectory guidance para suavizar el movimiento en inferencia a alta frecuencia.

## Capacidades

- Control robótico en tiempo real: inferencia de acciones de alta frecuencia (42.8 Hz con GR00T-N1.5 en RTX 5090) para manipulación y despliegue físico.
- Integración de múltiples familias VLA: soporte nativo para OpenVLA, LLaVA-VLA, GR00T, Pi0, Pi0.5 y DreamZero, permitiendo comparación rápida.
- Razonamiento visual-lenguaje: los modelos integrados comprenden instrucciones en lenguaje natural combinadas con entrada visual de cámara.
- Fine-tuning y personalización: LoRA y full fine-tuning sobre los modelos del zoo, con scripts de evaluación y entrenamiento.
- Despliegue en robots reales: scripts listos para Aloha, Tron2 y UR3, sin necesidad de integración personalizada.
- Inferencia remota: framework servidor/cliente basado en ZMQ para descargar la inferencia a GPUs externas en dispositivos con recursos limitados.
- Soporte de simulación: integración con simuladores principales para evaluación de políticas.

## Casos de uso

- **Manipulación robótica en laboratorio**: el modelo puede controlar brazos robóticos (Aloha, UR3) en tareas de pick-and-place, empujar y apilar objetos, gracias a su entrenamiento en LIBERO y su alta frecuencia de inferencia.
- **Evaluación de VLA en investigación**: permite comparar múltiples familias de modelos (OpenVLA vs. Pi0 vs. GR00T) bajo el mismo benchmark LIBERO, estandarizando la evaluación de nuevas arquitecturas.
- **Fine-tuning de VLA para tareas específicas**: con soporte LoRA y full fine-tuning, un equipo puede adaptar un modelo base a su entorno robótico particular con datos propios.
- **Teleoperación asistida por IA**: la inferencia remota con ZMQ permite que un robot ligero en el borde reciba acciones de un servidor con GPU potente, habilitando control en tiempo real sin hardware pesado.
- **Investigación en aprendizaje por imitación**: la plataforma ofrece un pipeline completo de recolección de datos a despliegue, facilitando estudios de aprendizaje por imitación en entornos simulados y reales.
- **Benchmarking académico**: los checkpoints pre-entrenados con resultados publicados en LIBERO (PI0.5 PaliGemma 96.0%, Cosmos3-Edge 94.4%, GR00T Eagle 3B 89.4%) sirven como puntos de referencia para comparar nuevos métodos.
- **Prototipado de robots de servicio**: gracias al soporte de configuración flexible y la variedad de modelos, se puede prototipar un robot asistencial que entienda comandos visuales y de texto en entornos domésticos.

## Benchmarks y rendimiento

FluxVLA presenta resultados en los benchmarks LIBERO, que incluyen tareas espaciales, de objeto, de objetivo y de horizonte largo. Los datos publicados son:

| Modelo | Dataset de entrenamiento | Media LIBERO |
|---|---|---|
| PI0.5 PaliGemma | LIBERO-10 | 96.0% |
| Cosmos3-Edge | LIBERO benchmark suites (entrenamiento mixto) | 94.4% |
| GR00T Eagle 3B | LIBERO-10 | 89.4% |

Además, se reporta una inferencia de 42.8 Hz con GR00T-N1.5 en RTX 5090, lo que indica rendimiento en tiempo real para control robótico. No se han publicado resultados de MMLU, HumanEval u otros benchmarks de lenguaje general en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: depende del modelo integrado. Para los modelos de 3B, se requiere aproximadamente 6-8 GB en FP16; para 7B, alrededor de 14-16 GB; para DreamZero de 23B, más de 24 GB. No se especifican cuantizaciones oficiales, pero los pesos están en safetensors.
- **GPU recomendadas**: RTX 5090 (referencia de rendimiento), A100/H100 para entrenamiento de modelos grandes, RTX 4090 para inferencia de 3B-7B.
- **Consumer GPU**: los modelos de 3B y 7B caben en GPUs consumer como RTX 4090 (24 GB) con FP16. El modelo de 23B no cabe en consumer GPU sin cuantización.
- **Opciones de despliegue**: la plataforma incluye su propio framework de inferencia con ZMQ para servidor/cliente, además de scripts de despliegue para Aloha, Tron2 y UR3. No se menciona soporte directo para vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: con GR00T-N1.5 en RTX 5090 se alcanzan 42.8 Hz, lo que implica una latencia aproximada de 23 ms por paso de acción. No hay datos de throughput en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FluxVLA Engine (PI0.5 PaliGemma) | 3B | no disponible | 96.0% | Apache 2.0 | Hugging Face |
| OpenVLA 7B | 7B | no disponible | ~77% (LIBERO-10, según publicaciones) | MIT | Hugging Face |
| GR00T N1.5 | 3B | no disponible | no disponible | NVIDIA license | Hugging Face |
| Pi0 (Physical Intelligence) | 3B | no disponible | no publicado | no disponible | Hugging Face |

La comparativa se limita a los datos publicados. FluxVLA ofrece un ecosistema completo, mientras que OpenVLA y Pi0 son modelos individuales. La licencia Apache 2.0 de FluxVLA es más permisiva que la de GR00T (NVIDIA license) para uso comercial.

## Limitaciones y advertencias

- **Dependencia de modelos externos**: FluxVLA Engine es una plataforma de integración, no un modelo entrenado desde cero. El rendimiento depende del modelo base que se elija (OpenVLA, Pi0, etc.), y algunos de estos modelos tienen sus propias licencias y limitaciones.
- **Riesgo de alucinación y errores**: como cualquier VLA, puede interpretar incorrectamente las instrucciones visuales o generar acciones inválidas en entornos no vistos durante el entrenamiento.
- **Sesgos de datos**: los benchmarks LIBERO se centran en tareas de mesa con objetos comunes; el rendimiento en escenarios del mundo real con variabilidad visual puede degradarse.
- **Contexto limitado**: no se especifica la longitud de contexto de los modelos integrados; en VLA, el contexto suele ser corto (secuencias de imágenes y texto breve), lo que limita tareas de larga duración.
- **Requisitos de hardware**: el modelo de 23B (DreamZero) requiere infraestructura GPU de alto nivel, no apta para entornos con recursos limitados.
- **Idiomas**: la documentación oficial está en inglés y chino; no hay evidencia de soporte multilingüe en los modelos, que probablemente estén entrenados principalmente en inglés.
- **Estado del proyecto**: el repositorio se creó en marzo de 2026 y se actualizó en agosto de 2026, lo que sugiere un proyecto relativamente reciente y posiblemente en evolución activa.
- **Sin especificación de cuantización**: no se publican formatos GGUF u otros cuantizados, lo que limita el despliegue en dispositivos de baja memoria.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/FluxVLAEngine
- GitHub: https://github.com/limxdynamics/FluxVLA
- Documentación (inglés): https://fluxvla.limxdynamics.com
- Documentación (chino): https://fluxvla.limxdynamics.com/zh/
- Modelos pre-entrenados de referencia:
  - GR00T N1.5: https://huggingface.co/nvidia/GR00T-N1.5-3B
  - OpenVLA: https://huggingface.co/openvla/openvla-7b-finetuned-libero-10
