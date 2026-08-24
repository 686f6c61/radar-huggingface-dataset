# pooyakn73/Qwen3.8-9B-Distill-MTPLX-Q6G64

## Resumen

Qwen3.8-9B-Distill-MTPLX-Q6G64 es una cuantizacion en 6 bits (formato MLX) del modelo Qwen3.8-9B-Distill, creada por el usuario pooyakn73 para ejecucion eficiente en Apple Silicon. El modelo base, desarrollado por el equipo empero-ai, es una destilacion full-parameter del gigante Qwen3.8 2.4T A95B (un modelo MoE de 2,4 billones de parametros) sobre la arquitectura Qwen3.5-9B. El proceso de destilacion utilizo aproximadamente 70.000 trazas de razonamiento del profesor, cubriendo matematicas, codigo, razonamiento general, seguimiento de instrucciones y uso de herramientas, con filtrado de calidad previo.

Esta version cuantizada reduce el peso del modelo a unos 2,4 billones de parametros (segun el archivo safetensors del repo) y permite ejecutarlo en equipos con GPU Apple de gama media, manteniendo las capacidades de razonamiento denso del modelo destilado. Es una opcion interesante para desarrolladores que quieren probar capacidades de razonamiento avanzado en local sin necesitar un cluster de GPUs. La licencia no esta disponible, lo que limita su uso comercial sin consultar al autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5-9B) |
| Parametros totales | 2.415.484.144 (segun safetensors del repo; el modelo original declara 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se desconoce si mantiene los 128k del Qwen3.5) |
| Tipos de cuantizacion | MLX Q6G64 (6 bits) |
| Idiomas soportados | ingles |
| Licencia | no disponible |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-9B-Distill es una destilacion full-parameter del modelo MoE Qwen3.8 2.4T A95B hacia la arquitectura densa Qwen3.5-9B. El entrenamiento se realizo mediante destilacion off-policy: se generaron aproximadamente 70,000 trazas de razonamiento (chain-of-thought) con el modelo teacher, filtrando por calidad, y se entreno al estudiante para reproducir esas trazas. El proceso cubre matematicas, codigo, razonamiento general, instrucciones y uso de herramientas.

La cuantizacion MLX Q6G64 reduce la precision de los pesos a 6 bits para adaptarse a la memoria de GPU Apple Silicon, manteniendo el formato safetensors y la libreria MLX. No hay informacion sobre el dataset de entrenamiento del estudiante mas alla de las trazas del teacher, ni sobre tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso (chain-of-thought) de alta calidad, heredado del destilado del Qwen3.8 2.4T.
- Soporte de tool calling y function calling, segun las trazas de entrenamiento que incluyen uso de herramientas.
- Capacidades de codigo y matematicas, con razonamiento paso a paso.
- Seguimiento de instrucciones en ingles, con capacidad de conversacion multi-turno.
- Capacidad de uso como agente para tareas de multi-step reasoning.
- No se declaran capacidades de vision, audio ni otros modos.

## Casos de uso

- Razonamiento avanzado en local: el modelo puede resolver problemas de matematicas y logica en equipos Apple Silicon sin conexion, gracias a su destilacion de un teacher de 2.4T parametros.
- Generacion de codigo asistida: puede usarse en entornos de desarrollo como autocompletado o generacion de funciones, aprovechando sus trazas de codigo.
- Agente conversacional: integrable en aplicaciones de chat que requieren razonamiento multi-paso y seguimiento de instrucciones.
- Herramientas de investigacion: permite experimentar con destilacion de modelos grandes en un entorno de un solo GPU, ideal para laboratorios sin infraestructura masiva.
- Prototipado rapido de aplicaciones de IA: su formato MLX facilita el despliegue en macOS para pruebas de concepto.
- Analisis de datos y explicaciones: puede generar explicaciones detalladas de procesos complejos, util para documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros tests comparativos para esta cuantizacion especifica. El modelo original empero-ai no proporciona benchmarks publicos en su model card.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 8,7 GB en disco; con cuantizacion Q6G64, la memoria necesaria para inferencia ronda entre 6 y 9 GB, dependiendo del contexto y la precision de las activaciones.
- GPU recomendadas: Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3 y superiores). No es compatible con CUDA, ya que el formato MLX esta disenado para Apple Neural Engine y GPU unificada.
- Puede caber en equipos Mac con 16 GB de RAM unificada, aunque se recomienda 32 GB para contextos largos.
- Opciones de despliegue: MLX, mlx-lm, y posiblemente llama.cpp con adaptador MLX (aunque no esta confirmado). No es compatible con vLLM ni TGI (solo CUDA).
- Latencia y throughput: no se han publicado medidas. Se espera un rendimiento moderado en Mac de gama media, con generacion de tokens de 20-40 tokens/segundo en M2/M3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Capacidades |
|---|---|---|---|---|---|
| Qwen3.8-9B-Distill (empero-ai) | 9B | no disponible | no disponible | safetensors (BF16) | Razonamiento, codigo, matematicas |
| Qwen3.5-9B (original) | 9B | 128k | Apache 2.0 | safetensors | Razonamiento, codigo, multilingue |
| Qwen3.8-9B-Distill-MTPLX-Q6G64 (este) | 2.4B (cuantizado) | no disponible | no disponible | MLX Q6G64 | Razonamiento, codigo (ingles) |

La comparativa es limitada porque no hay benchmarks publicos. La cuantizacion reduce los parametros visibles pero el modelo original es de 9B; la diferencia en capacidad de razonamiento con el modelo sin cuantizar no se ha medido. Frente al Qwen3.5-9B, la ventaja de este modelo es que hereda el razonamiento del teacher de 2.4T, aunque no se puede verificar sin datos.

## Limitaciones y advertencias

- Sesgos: el modelo se entreno con trazas del teacher, que puede heredar sesgos de Qwen3.8. No hay evaluacion de sesgos publicada.
- Riesgo de alucinacion: como modelo de razonamiento, puede generar respuestas incorrectas pero convincentes, especialmente en dominios fuera de sus datos de entrenamiento.
- Limitaciones de idioma: solo se declara ingles. No soporta otros idiomas de forma oficial.
- Restricciones de licencia: la licencia es "no disponible", lo que impide su uso comercial sin autorizacion explicita del autor. Se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Limitaciones de contexto: no se ha especificado la longitud de contexto; si se hereda del Qwen3.5, seria 128k, pero no se confirma.
- Cuantizacion Q6G64 puede degradar la precision en tareas de alta sensibilidad (por ejemplo, matematicas de alta precision) comparado con el modelo original.
- No es compatible con entornos CUDA, solo con Apple Silicon.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pooyakn73/Qwen3.8-9B-Distill-MTPLX-Q6G64
- Modelo original de empero-ai: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Model card del original: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill/blob/main/README.md
- Articulo sobre ejecucion local: https://www.mindstudio.ai/blog/qwen3-8-9b-distillation-local
- Ficha de overview en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-9b-distill-empero-ai
