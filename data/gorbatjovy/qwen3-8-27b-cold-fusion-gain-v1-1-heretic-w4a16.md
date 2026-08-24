# gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-W4A16

## Resumen

Este modelo es una cuantización W4A16 (int4) del `gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic`, que a su vez es una versión "abliterada" (sin alineación de seguridad) del `DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`. La cadena completa parte del modelo oficial Qwen3.8-27B de Alibaba, un modelo denso de visión-lenguaje con arquitectura híbrida de atención (16 capas con atención completa y 48 con atención lineal recurrente). El autor de este repositorio ha aplicado dos transformaciones: abliteración para eliminar los rechazos de contenido y cuantización int4 mediante AutoRound, servida con compressed-tensors en vLLM.

El resultado es un modelo que conserva las capacidades multimodales (imagen-texto) y de razonamiento del original, pero con un tamaño reducido que permite ejecutarlo en una GPU de 24 GB (por ejemplo, RTX 4090) a ~142 tokens por segundo con decodificación especulativa. La pérdida de calidad por la cuantización es mínima: +1,6% de perplejidad en WikiText-2 y -2 puntos en GSM8K. Es importante destacar que, al estar abliterado, el modelo no tiene rechazos de seguridad y puede generar contenido dañino; el autor lo libera con fines de investigación y red-teaming, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal con estado recurrente) con torre de visión |
| Parametros totales | 6.260.690.960 (según safetensors; el nombre comercial indica 27B, probablemente refiriéndose al modelo base sin cuantizar) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 (configuración recomendada en vLLM) |
| Tipos de cuantizacion | W4A16 (int4 group 128 simétrico en capas lineales del decoder), int8 en lm_head, embed_tokens y módulo MTP; BF16 en torre de visión y control de recurrencia |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: de las 64 capas del decoder, solo 16 usan atención completa (con un intervalo de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante (Gated DeltaNet). Esta mezcla reduce el coste computacional y la huella de memoria frente a un transformer denso clásico. El modelo incluye además una torre de visión para procesar imágenes y un módulo MTP (Multi-Token Prediction) para decodificación especulativa.

Sobre esta base, el autor aplicó el método "Cold Fusion" (GAIN + Unsloth) que, según la documentación, mantiene el 99% del rendimiento BF16 tanto en 8 como en 4 bits. Posteriormente, el repositorio `heretic` realizó una abliteración (eliminación de la dirección de rechazo) con una puntuación de 8/100 en el evaluador de keywords de Heretic y una divergencia KL de 0,0315 frente al modelo base. La cuantización W4A16 se realizó con AutoRound, dejando la torre de visión y los controles de recurrencia en BF16 para no degradar la comprensión de imágenes ni la dinámica de atención híbrida. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación original del modelo Qwen3.8-27B.

## Capacidades

- Generación de texto y razonamiento multi-step, incluyendo modo "thinking" (el servidor vLLM se sirve con `--reasoning-parser qwen3`).
- Comprensión de imágenes (image-text-to-text): puede procesar una imagen por prompt y responder preguntas sobre ella.
- Tool calling / function calling: verificado con el parser `qwen3_xml`, con 10 de 12 casos correctos en la versión cuantizada.
- Soporte de agentes y razonamiento encadenado, gracias a la ventana de contexto de 32K tokens.
- Multilingüe en inglés y chino (idiomas declarados; no se garantiza otros).
- Decodificación especulativa: compatible con MTP y DFlash2, alcanzando ~142 tok/s en RTX 4090.
- Sin rechazos de contenido (abliterado): responde a solicitudes dañinas que el modelo base rechazaría.

## Casos de uso

- Investigación en interpretabilidad y red-teaming: al estar abliterado, permite estudiar el comportamiento del modelo sin alineación de seguridad, analizar sesgos residuales y evaluar mecanismos de defensa.
- Generación de código con tool calling: puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, usando su capacidad de llamar funciones externas (por ejemplo, ejecutar tests o consultar APIs).
- Asistente de programación multimodal: dado un diagrama o captura de pantalla de una interfaz, puede generar el código HTML/CSS o explicar el flujo representado.
- Chat conversacional con contexto largo: su ventana de 32K tokens permite mantener conversaciones extensas sobre documentación técnica, logs o historiales de soporte.
- Razonamiento matemático y lógico: aunque la cuantización reduce ligeramente el rendimiento en GSM8K (93%), sigue siendo útil para problemas de aritmética multi-paso y verificación de soluciones.
- Prototipado de agentes autónomos: gracias a la decodificación especulativa y al alto throughput, puede servir como motor de razonamiento en tiempo real para agentes que requieren respuestas rápidas.

## Benchmarks y rendimiento

La model card del repositorio cuantizado incluye mediciones comparativas entre la versión BF16 y la W4A16, realizadas con el mismo harness (perplejidad mediante vLLM `prompt_logprobs`):

| Metrica | BF16 | W4A16 | Diferencia |
|---|---|---|---|
| WikiText-2 perplejidad | 7,537 | 7,660 | +1,6% |
| GSM8K (100 problemas, base emparejada) | 95% | 93% | -2 puntos |
| Tool calling (12 casos, parser qwen3_xml) | 11/11/11 | 10/10/10 | -1 caso (ruido en n=12) |

Además, se reportan tasas de rechazo en la versión cuantizada servida con vLLM: 0,0% en AdvBench, 0,0% en JailbreakBench (harmful) y 0,0% en MaliciousInstruct. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GPQA en la información disponible; los únicos datos numéricos son los anteriores.

## Requisitos de hardware

- VRAM estimada: 24 GB para la configuración completa (modelo + contexto de 32K). El repo ocupa ~19 GB en disco.
- GPU recomendada: RTX 4090 (probada por el autor). También debería caber en otras GPUs de 24 GB como RTX 3090, A5000 o L4.
- No cabe en GPUs de consumo de 16 GB o menos (como RTX 4080 o 4070 Ti) sin reducir contexto o usar cuantizaciones más agresivas.
- Opciones de despliegue: vLLM (recomendado, con soporte para compressed-tensors), también puede usarse con transformers estándar, aunque el rendimiento de decodificación especulativa solo está disponible en vLLM.
- Latencia y throughput: ~142 tok/s single-stream en RTX 4090 con DFlash2 (longitud media de aceptación ~3,1). Sin decodificación especulativa, el throughput sería menor (no se especifica).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-W4A16 (este) | 6,26B (safetensors) | 32K | W4A16 int4 | Apache 2.0 | Abliterado, visión-lenguaje, decodificación especulativa |
| gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic (BF16) | ~27B (estimado) | 32K | BF16 | Apache 2.0 | Versión sin cuantizar, misma abliteración |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 | ~27B (estimado) | 32K | BF16 | Apache 2.0 | Modelo base con Cold Fusion, sin abliterar |
| Qwen/Qwen3.8-27B (oficial) | 27B (denso) | 32K (nativo) | BF16 | Apache 2.0 | Modelo original de Alibaba, con alineación de seguridad |

No se dispone de benchmarks comparativos directos entre estos modelos en la información proporcionada. Según la documentación de DavidAU, el modelo Cold Fusion supera los benchmarks críticos de Qwen 3.8, 3.6 y 3.5 27B, pero no se aportan cifras concretas.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado los mecanismos de rechazo de contenido dañino. No debe desplegarse en producción sin una capa de moderación propia.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar información, especialmente en tareas de razonamiento multi-paso.
- Idiomas limitados: solo se garantizan inglés y chino; el rendimiento en otros idiomas puede ser deficiente.
- Cuantización int4: aunque la pérdida es pequeña, hay una caída de 2 puntos en GSM8K y posibles degradaciones en tareas muy sensibles a la precisión numérica.
- Contexto máximo de 32K tokens: suficiente para muchas tareas, pero inferior a modelos con ventanas de 128K o más.
- Sin garantías de soporte: el autor libera el modelo "tal cual", sin mantenimiento ni actualizaciones.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento legal y ético de los usos.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-W4A16
- Modelo base BF16 abliterado: https://huggingface.co/gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic
- Modelo original con Cold Fusion: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Versión GGUF del mismo modelo (de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Artículo de HackerNoon sobre Cold Fusion: https://hackernoon.com/qwen38-27b-cold-fusion-cuts-thinking-tokens-without-sacrificing-performance
- Ficha de Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
