# reaperdoesntknow/Qemma-Q14B

## Resumen

Qemma-Q14B es un modelo de lenguaje presentado por el usuario reaperdoesntknow (Convergent Intelligence LLC: Research Division) que se describe como un híbrido nativo de Hugging Face construido mediante la fusión a nivel de pesos de dos arquitecturas distintas: el cuerpo MLP de Gemma-3 (1B) y la atención/cabeza de Qwen-3 (14B), proyectadas y alineadas al tamaño oculto de Gemma. El resultado se somete después a un ajuste fino supervisado (SFT) orientado a seguir instrucciones y razonamiento paso a paso.

El modelo se enmarca en una formulación matemática propia del autor, el "Discrepancy Calculus" (DISC) y su "Gap Envelope Integral" (GEI), que el autor presenta como herramienta para medir las discontinuidades que aparecen al fusionar geometrías de pesos de arquitecturas diferentes. Esta variante incorpora además un segundo merge con Qwen3-14B y escalado de RoPE basado en YaRN con una relación 1:* respecto a `max_position_embeddings = 524288`.

Es relevante ahora como experimento de fusión cross-architecture a nivel de pesos, un enfoque poco habitual frente a los adaptadores o al ensemble en inferencia. Conviene advertir que la model card mezcla especificaciones contradictorias (parámetros del backbone y del modelo fusionado) y que el recuento real de safetensors publicado es de 1.009.478.016 parámetros, muy por debajo de los 14B que sugiere el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida por fusión de pesos: cuerpo MLP de Gemma-3 (1B) + atención/cabeza de Qwen-3 (14B), alineadas al hidden size de Gemma; transformer con escalado RoPE tipo YaRN |
| Parametros totales | 1.009.478.016 (según safetensors publicados); la model card cita componentes de 14B y 1B de forma no reconciliada |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | `max_position_embeddings = 524288` con RoPE Scaling YaRN (relación 1:*); contexto efectivo no verificado |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | en |
| Licencia | osl-3.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura parte del backbone de Gemma-3 con 26 capas, hidden 1152 y MLP 6912, sobre el que se injerta una atención de estilo Qwen reagrupada a las 4×256 cabezas de Gemma (head_dim=128, hidden=5120, intermediate_size=17408, 40 cabezas de atención, 8 cabezas KV y 40 capas ocultas según la model card). El tokenizador y la plantilla de chat son los de Gemma-3 (`chat_template.jinja`). La fusión se realiza a nivel de pesos, sin adaptadores, con una lógica de fusión por capas y una ronda posterior de alineamiento de embeddings (8 pasos).

El entrenamiento consiste en aproximadamente 512 pasos de warm-start sobre HuggingFaceH4/ultrachat_200k y unos 256 pasos de SFT con TIGER-Lab/MathInstruct más ultrachat_200k. No se documentan fases de RLHF ni DPO. Las versiones de framework declaradas son TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0+cpu, Datasets 4.4.1 y Tokenizers 0.22.1. La innovación técnica declarada es el marco DISC/GEI para cuantificar el desajuste en las fronteras de fusión, aunque no se aportan métricas reproducibles de dicho desajuste ni evaluaciones del modelo resultante.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma-3.
- Seguimiento de instrucciones y razonamiento paso a paso, reforzado mediante SFT sobre ultrachat_200k y MathInstruct.
- Razonamiento matemático básico derivado del ajuste con MathInstruct.
- Modo de razonamiento explícito mediante etiquetas `<think>` y `<reasoning_step>` en el prompt de ejemplo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible (no documentado más allá del formato de thinking).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (visión, audio): no disponible.

## Casos de uso

- Experimentación en investigación sobre fusión cross-architecture: el modelo sirve como banco de pruebas para estudiar la alineación de embeddings y el desajuste entre geometrías de pesos de Gemma y Qwen, validando o refutando el marco DISC/GEI.
- Generación de texto conversacional en inglés para prototipos: puede gestionar diálogos multi-turno usando la plantilla de chat de Gemma-3 y un contexto declarado muy amplio, útil en demos y pruebas de concepto.
- Razonamiento matemático asistido en entornos de investigación: el SFT con MathInstruct permite generar cadenas de razonamiento paso a paso para problemas de nivel educativo, siempre con verificación humana.
- Reproducción de experimentos de merge: dado que documenta pasos de warm-start y SFT, es adecuado para replicar el pipeline de fusión y medir su impacto frente a los modelos base.
- Base para SFT/RLHF posterior: la model card indica explícitamente su uso para ajuste adicional, por lo que puede servir como punto de partida en pipelines de TRL.
- Evaluación comparativa de tokenizadores y plantillas: al usar el tokenizador de Gemma-3 sobre un cuerpo híbrido, resulta útil para estudiar discrepancias de tokenización en modelos fusionados.
- Docencia y divulgación sobre arquitecturas híbridas: permite ilustrar de forma práctica qué ocurre al combinar atención y MLP de modelos distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.009.478.016 parámetros, en bfloat16 requiere aproximadamente 2 GB de pesos; en float32, unos 4 GB. El tamaño del repo (24,3 GB) sugiere artefactos adicionales u otros formatos, por lo que conviene verificar los ficheros antes de desplegar.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090) debería acomodar el modelo en bfloat16 o float16; para el contexto máximo declarado de 524288 tokens se necesitaría memoria KV adicional considerable, no cuantificada en la información disponible.
- Cabe en GPU consumer: sí, según el recuento de parámetros publicado; no verificado en la práctica.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp y Ollama no están documentados para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qemma-Q14B | 1.009.478.016 (safetensors) | 524288 (YaRN declarado) | osl-3.0 | Fusión de pesos Gemma-3 + Qwen-3 con SFT |
| google/gemma-3-1b-it | ~1B | no disponible en la información | Gemma Terms of Use | Modelo base instruct de Gemma-3 |
| Qwen/Qwen3-14B | 14B | no disponible en la información | Apache 2.0 (según el modelo base, no verificado aquí) | Modelo base de Qwen-3 |

La comparación directa de rendimiento no es posible porque no se han publicado benchmarks del modelo fusionado. La diferencia principal frente a los modelos base es el enfoque de fusión a nivel de pesos y el marco teórico DISC/GEI, no una mejora cuantificada de capacidades.

## Limitaciones y advertencias

- Riesgo de alucinación reconocido explícitamente por el autor; no debe usarse en decisiones críticas de seguridad, médicas, legales o financieras.
- Inconsistencia documental: el nombre y la model card sugieren 14B, pero el recuento real de safetensors es de ~1.009 millones de parámetros; conviene auditar los pesos antes de cualquier uso en producción.
- Contexto declarado de 524288 tokens con YaRN no verificado empíricamente; el rendimiento en ventanas largas puede degradarse.
- Idioma limitado al inglés según el campo `language`; no hay evidencia de capacidades multilingües.
- Licencia OSL-3.0: impone obligaciones de copyleft sobre el código derivado; revisar compatibilidad antes de uso comercial.
- Entrenamiento muy corto (~512 pasos de warm-start y ~256 de SFT) y sin RLHF/DPO, lo que limita la robustez del alineamiento.
- Ausencia total de benchmarks publicados y de evaluaciones de seguridad.
- El marco teórico DISC/GEI no cuenta con validación independiente en la información disponible.
- Tags de dataset y modelo base que mezclan componentes de 1B y 14B, lo que dificulta la trazabilidad del linaje.

## Enlaces

- [Hugging Face: reaperdoesntknow/Qemma-Q14B](https://huggingface.co/reaperdoesntknow/Qemma-Q14B)
- [Perfil del autor en Hugging Face](https://huggingface.co/reaperdoesntknow)
- [Modelo base: google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)
- [Modelo base: Qwen/Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B)
- [Dataset: HuggingFaceH4/ultrachat_200k](https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k)
- [Dataset: TIGER-Lab/MathInstruct](https://huggingface.co/datasets/TIGER-Lab/MathInstruct)
- [TRL: Transformer Reinforcement Learning](https://github.com/huggingface/trl)
- [Colección DistilQwen del autor](https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c)
