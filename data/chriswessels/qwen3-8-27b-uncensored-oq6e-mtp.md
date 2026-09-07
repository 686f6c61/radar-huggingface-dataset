# chriswessels/Qwen3.8-27B-Uncensored-oQ6e-mtp

## Resumen

Qwen3.8-27B-Uncensored-oQ6e-mtp es una cuantización de 6 bits en formato MLX safetensors del modelo Qwen3.8-27B-Uncensored, una versión abliterated (sin dirección de rechazo) del modelo Qwen3.8-27B de Qwen. El modelo ha sido desarrollado por chriswessels utilizando la herramienta oMLX v0.6.4 con cuantización mixta de precisión (oQ) y un tamaño de grupo de 64. Conserva la arquitectura híbrida del modelo original: 64 capas con atención lineal Gated DeltaNet y atención completa, una torre de visión-lenguaje nativa y una cabeza de decodificación especulativa MTP.

El modelo está pensado para investigación en interpretabilidad, red-teaming y evaluación de robustez, ya que la abliteración elimina los mecanismos de rechazo del modelo original, lo que implica que no tiene guardarraíles de seguridad. Con 27.781.427.952 parámetros y una ventana de contexto de 262.144 tokens, ofrece una opción cuantizada para ejecutarse en hardware de Apple Silicon mediante MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: 48 capas de atención lineal Gated DeltaNet + 16 capas de atención completa, intervalo 4) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | oQ (oMLX v0.6.4) mixed-precision, 6 bits, group size 64 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 (heredada del modelo base; el repositorio no especifica licencia) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina atención lineal Gated DeltaNet y atención completa. Concretamente, se compone de 64 capas, de las cuales 48 emplean atención lineal y 16 atención completa, con un intervalo de 4. Esta combinación reduce el coste computacional en secuencias largas manteniendo la capacidad de modelar dependencias globales. El modelo incluye una torre de visión-lenguaje nativa y una cabeza MTP (multi-token prediction) para decodificación especulativa.

El proceso de creación de este modelo consta de varias etapas. Primero, Qwen entrenó el modelo original Qwen3.8-27B. Después, OrcaRouter aplicó abliteración sobre los pesos BF16, eliminando la dirección de rechazo del flujo residual. Finalmente, chriswessels cuantizó el modelo resultante con oMLX v0.6.4, usando cuantización mixta de 6 bits con group size 64. No se dispone de información sobre los datos de entrenamiento ni sobre el proceso de post-entrenamiento (RLHF, DPO, etc.) del modelo original.

## Capacidades

- Generación de texto y razonamiento, con control flexible de pensamiento (thinking mode).
- Comprensión de imagen y texto (image-text-to-text) gracias a la torre de visión-lenguaje nativa conservada en la cuantización.
- Soporte de tool calling / function calling para integración en agentes.
- Razonamiento multi-paso y capacidades para agentes.
- Decodificación especulativa mediante la cabeza MTP, orientada a reducir la latencia de generación.
- Idiomas soportados: inglés y chino.
- Sin alineación de seguridad: el modelo ha sido abliterated, por lo que no tiene guardarraíles y puede generar contenido dañino o ilegal. Esta es una característica deliberada para investigación, no una capacidad funcional.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite estudiar cómo se comporta el modelo sin la dirección de rechazo, comparando sus respuestas con las del modelo alineado.
- Red-teaming y evaluación de robustez: es útil para generar prompts adversos y probar la eficacia de sistemas de moderación y filtros de contenido.
- Estudio de mecanismos de alineación: sirve como referencia para analizar qué patrones de activación están asociados al rechazo de peticiones dañinas.
- Prototipado de agentes con tool calling en entornos controlados: soporta function calling, lo que permite integrarlo en pipelines de agentes para pruebas de concepto.
- Análisis multimodal en investigación: al conservar la torre VL, puede procesar imágenes y texto para tareas de evaluación de visión-lenguaje.
- Pruebas de decodificación especulativa con MTP: permite medir la reducción de latencia frente a la decodificación autoregresiva estándar en entornos de laboratorio.
- Despliegue local en Apple Silicon: la cuantización MLX de 6 bits facilita la ejecución en Mac con memoria unificada, sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 23.7 GB en formato MLX safetensors de 6 bits. En Apple Silicon se requiere memoria unificada de al menos 24-32 GB para cargar el modelo y ejecutar la inferencia.
- GPU recomendadas: Apple Silicon (M2, M3, M4 en variantes Pro o Max) con 32 GB o más de memoria unificada. El formato MLX no es compatible de forma nativa con GPUs NVIDIA o AMD.
- Si cabe en consumer GPU: no directamente en formato MLX; para otros entornos se recomiendan los derivados de OrcaRouter: GGUF para llama.cpp y FP8 para vLLM.
- Opciones de despliegue: MLX (Apple Silicon) y oMLX. Para despliegue en GPU, se deben usar los formatos alternativos del modelo base (GGUF o FP8).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262.144 | BF16 safetensors | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-Uncensored (orcarouter) | 27B | 262.144 | BF16 safetensors | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-Uncensored-oQ6e-mtp (chriswessels) | 27.781.427.952 | 262.144 | MLX safetensors 6-bit | Apache 2.0 (heredada) | HuggingFace |

El modelo cuantizado reduce el peso del repositorio de 55.6 GB (BF16) a 23.7 GB, a costa de una pérdida de precisión no cuantificada en los datos disponibles. No se dispone de benchmarks comparativos.

## Limitaciones y advertencias

- Sesgos: al haber sido abliterated, el modelo no tiene alineación de seguridad y puede generar contenido dañino, ofensivo o ilegal sin restricciones.
- Riesgo de alucinación: no se dispone de evaluaciones específicas; al carecer de guardarraíles, la probabilidad de generar contenido no veraz o perjudicial es mayor.
- Limitaciones de idioma: solo soporta inglés y chino. El uso en otros idiomas puede degradar el rendimiento.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente que no debe desplegarse a usuarios finales ni usarse en producción sin capas adicionales de moderación y prevención de abusos.
- El autor y los subidores no aceptan responsabilidad por el mal uso del modelo.
- El formato MLX limita el despliegue al ecosistema de Apple Silicon; para otros entornos es necesario convertir los pesos o usar los derivados GGUF/FP8.
- No hay benchmarks publicados, por lo que el rendimiento real del modelo no puede verificarse de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/chriswessels/Qwen3.8-27B-Uncensored-oQ6e-mtp
- Modelo base (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oMLX: https://github.com/jundot/omlx
- OrcaRouter: https://www.orcarouter.ai
- Model card de OrcaRouter para Qwen3.8-27B: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- Derivado GGUF: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Derivado FP8: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Derivado MLX: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
