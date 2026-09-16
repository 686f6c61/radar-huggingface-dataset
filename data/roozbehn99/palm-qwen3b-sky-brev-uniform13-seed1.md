# roozbehn99/palm-qwen3b-sky-brev-uniform13-seed1

## Resumen

`roozbehn99/palm-qwen3b-sky-brev-uniform13-seed1` es un artefacto de investigación publicado por el usuario roozbehn99 que contiene trece políticas de lenguaje ajustadas con GRPO (Group Relative Policy Optimization) a partir de `Qwen/Qwen2.5-3B-Instruct`. Cada política corresponde a un punto de la rejilla uniforme de pesos sobre el símplex de dos objetivos: utilidad (helpfulness, medida con el reward model Skywork-Reward-Llama-3.1-8B) y brevedad (brevity, una recompensa verificable implementada en código). Los pesos son trece puntos equiespaciados `(w_help, w_brev) = (k/12, 1-k/12)` con `k = 0..12`, almacenados en subcarpetas `idx0/` a `idx12/` del mismo repositorio.

El interés del modelo es metodológico más que de producto: sirve para estudiar frentes de Pareto en alineación multiobjetivo, comparar la rejilla uniforme con el portafolio generado por el Algoritmo 1 del mismo autor (`roozbehn99/palm-qwen3b-sky-brev-seed1`) y experimentar con poda de portafolios (portfolio pruning). Cinco de los trece puntos de la rejilla coinciden exactamente con pesos del portafolio del Algoritmo 1 y son los mismos checkpoints reutilizados, no reentrenados.

Se trata de un ajuste de parámetros completos (no de adaptadores LoRA) sobre el modelo base de 3B, en precisión bf16, con 40.000 episodios de entrenamiento y semilla 1. El autor declara explícitamente que es un artefacto de investigación, sin ajuste de seguridad adicional al del modelo base y no destinado a despliegue en producción. No ha registrado descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `Qwen/Qwen2.5-3B-Instruct`) |
| Parámetros totales | 3B (heredados del modelo base; el ajuste es de parámetros completos por checkpoint) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens según la ficha del modelo base; no especificada en la model card de este repositorio |
| Tipos de cuantización | No se distribuyen cuantizaciones; los pesos se publican en bf16. Al estar en formato `transformers`, admiten cuantización posterior con herramientas estándar (no verificada por el autor) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` en formato `transformers` (bf16), un checkpoint por subcarpeta `idx0/` … `idx12/` |
| Tamaño del repositorio | 80,2 GB (trece checkpoints de parámetros completos) |
| Modelo base | `Qwen/Qwen2.5-3B-Instruct` |
| Semilla de entrenamiento | `--seed 1` (RNG de Python, NumPy y Torch, con desplazamiento por rango) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura nueva: cada checkpoint es un ajuste de parámetros completos (full fine-tune) del transformer decoder-only de `Qwen/Qwen2.5-3B-Instruct`, guardado en bf16 con la plantilla de chat nativa del tokenizer de Qwen. La innovación está en el procedimiento de alineación, no en la topología. El algoritmo es GRPO implementado en `open_instruct/weighted_grpo.py`, un fork del proyecto open-instruct de AI2, con una recompensa escalar `r = w1*R1 + w2*R2` sobre una rejilla uniforme de pesos generada con `open_instruct/make_weights.py --mode even2d`.

Las dos señales de recompensa son, por un lado, R1 (utilidad) evaluada con `Skywork/Skywork-Reward-Llama-3.1-8B` y, por otro, R2, una recompensa verificable de brevedad definida en `open_instruct/rlvr_objectives.py::brevity`. Ambas se normalizan min-max a [0,1] con estadísticas de calibración fijas (`rm_calibrations/`). El objetivo escalarizado es `J_w(π) = w·R(π) − β·KL(π)` con coeficiente KL `beta = 0.01` respecto a la política de referencia, que es el propio modelo base. Los datos de entrenamiento son `allenai/RLVR-GSM` y `allenai/RLVR-MATH`; la evaluación se hace sobre el conjunto de test de `allenai/RLVR-GSM` (1.319 prompts). La configuración es idéntica para los trece modelos: 40.000 episodios (208 pasos de optimizador), `lr = 5e-7`, batch de 4 con acumulación de gradiente 4, 4 muestras por prompt, longitud de respuesta de 256 tokens y precisión bf16. El entrenamiento se ejecutó en 4x NVIDIA A100-80GB (OSC Ascend, 3 GPU de entrenamiento y 1 para vLLM) o 4x H100 (OSC Cardinal).

## Capacidades

- Generación de texto y razonamiento matemático de ámbito escolar (GSM) y de competición (MATH), dominios cubiertos por los datasets RLVR-GSM y RLVR-MATH.
- Resolución de problemas aritméticos y de razonamiento multi-paso con respuesta corta, dado que el entrenamiento limita la generación a 256 tokens nuevos.
- Generación de código: capacidad heredada del modelo base Qwen2.5-3B-Instruct; no se ha reforzado específicamente con RL en este repositorio.
- Seguimiento de instrucciones conversacionales multi-turno mediante la plantilla de chat nativa de Qwen.
- Ajuste fino del eje utilidad-brevedad: cada checkpoint `idx0`…`idx12` ofrece un punto distinto de compromiso entre respuestas más útiles y respuestas más concisas.
- Soporte de tool calling y function calling: no declarado en la model card; podría existir por herencia del modelo base, pero no está verificado.
- Capacidades de agente y razonamiento multi-paso con uso de herramientas: no declaradas.
- Capacidades multilingües: no declaradas.
- Modo de pensamiento (thinking), visión o audio: no disponibles.

## Casos de uso

- Investigación en alineación multiobjetivo: el repositorio proporciona trece políticas entrenadas con la misma receta sobre una rejilla uniforme de pesos, lo que permite trazar y analizar el frente de Pareto utilidad-brevedad con una única variable independiente controlada.
- Poda de portafolios (portfolio pruning): comparar la rejilla uniforme de trece puntos con el portafolio seleccionado por el Algoritmo 1 en `roozbehn99/palm-qwen3b-sky-brev-seed1` permite medir cuántos checkpoints pueden eliminarse sin perder cobertura del frente.
- Calibración y auditoría de reward models: como los cinco puntos coincidentes reutilizan checkpoints idénticos, se puede validar el pipeline de evaluación comparando recompensas normalizadas entre repositorios sin variabilidad de entrenamiento.
- Estudios de coste computacional en inferencia: seleccionar un índice con `w_brev` alto (por ejemplo `idx0`) frente a uno con `w_help` alto (por ejemplo `idx12`) permite cuantificar el ahorro en tokens de salida frente a la pérdida de utilidad medida en R1.
- Experimentos de destilación y generación de datos sintéticos: las políticas ajustadas pueden generar soluciones de problemas GSM/MATH con distintos niveles de detalle para construir datasets de destilación controlados por verbosidad.
- Análisis de deriva respecto a la política de referencia: la columna KL de la tabla de evaluación permite estudiar cómo la magnitud de la penalización KL efectiva varía a lo largo del símplex de pesos.
- Reproducibilidad de pipelines de RL: al fijar semilla 1 y una configuración común, el repositorio sirve como base de comparación para nuevas variantes de recompensa, algoritmo o calibración.
- Formación y docencia en RLHF/RLVR: el conjunto completo de pesos, configuraciones y estadísticas de calibración permite reproducir un experimento de RL a pequeña escala con trazabilidad completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye una evaluación post-hoc sobre el conjunto de test de RLVR-GSM (1.319 prompts, decodificación muestreada con T=0.7, 256 tokens nuevos como máximo). R1 y R2 son recompensas normalizadas min-max, no métricas de exactitud, y KL es la divergencia KL sumada por token respecto al modelo de referencia.

| Subcarpeta | w_help | w_brev | R1 (utilidad) | R2 (brevedad) | KL |
|---|---|---|---|---|---|
| `idx0` | 0,000 | 1,000 | 0,699 | 0,430 | 5,46 |
| `idx1` | 0,083 | 0,917 | 0,713 | 0,423 | 5,60 |
| `idx2` | 0,167 | 0,833 | 0,726 | 0,428 | 5,25 |
| `idx3` | 0,250 | 0,750 | 0,729 | 0,406 | 4,75 |
| `idx4` | 0,333 | 0,667 | 0,755 | 0,386 | 3,92 |
| `idx5` | 0,417 | 0,583 | 0,770 | 0,388 | 3,59 |
| `idx6` | 0,500 | 0,500 | 0,801 | 0,346 | 2,35 |
| `idx7` | 0,583 | 0,417 | 0,793 | 0,334 | 2,12 |
| `idx8` | 0,667 | 0,333 | 0,818 | 0,297 | 1,60 |
| `idx9` | 0,750 | 0,250 | 0,837 | 0,270 | 1,29 |
| `idx10` | 0,833 | 0,167 | 0,834 | 0,222 | 0,83 |
| `idx11` | 0,917 | 0,083 | 0,823 | 0,196 | 0,81 |
| `idx12` | 1,000 | 0,000 | 0,808 | 0,180 | 0,65 |

El máximo de R1 se sitúa en `idx9` (0,837) y el máximo de R2 en `idx0` (0,430). La KL decrece de forma monótona desde `idx1` (5,60) hasta `idx12` (0,65), con la única inversión en `idx0`, que registra la KL más alta de la serie (5,46) pese a tener `w_help = 0`.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 3B parámetros, no publicada por el autor): aproximadamente 7-8 GB en bf16 contando pesos y sobrecarga de activaciones y caché KV; en torno a 3,5-4 GB con cuantización de 8 bits y 2-2,5 GB con 4 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16. El entrenamiento original se realizó en 4x A100-80GB (OSC Ascend) o 4x H100 (OSC Cardinal), con una GPU dedicada a vLLM para la generación durante GRPO.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB pueden ejecutar un checkpoint en bf16; una RTX 4090 de 24 GB lo hace con margen amplio. Con cuantización de 4 bits es viable en GPU de 4-6 GB.
- Almacenamiento: cada subcarpeta ocupa aproximadamente 6,2 GB en bf16; el repositorio completo, con los trece checkpoints, ocupa 80,2 GB.
- Opciones de despliegue: `transformers` (carga por `subfolder`, como documenta el autor), vLLM (usado en el propio pipeline de entrenamiento), TGI, llama.cpp u Ollama previa conversión a GGUF, y servidores compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas públicas y no se han verificado en la búsqueda realizada; se incluyen como referencia orientativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| `roozbehn99/palm-qwen3b-sky-brev-uniform13-seed1` | 3B | no especificado en la model card (32.768 en el modelo base) | Apache-2.0 | HuggingFace, 13 subcarpetas | Artefacto de investigación multiobjetivo, sin ajuste de seguridad adicional |
| `Qwen/Qwen2.5-3B-Instruct` | 3B | 32.768 tokens | Apache-2.0 | HuggingFace | Modelo instructivo generalista, ajustado con datos supervisados y preferencias |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21B | 128.000 tokens | Llama 3.2 Community License | HuggingFace (con aceptación de términos) | Modelo instructivo generalista con licencia restrictiva para algunos usos |

Frente al modelo base Qwen2.5-3B-Instruct, este repositorio añade un ajuste RL específico sobre matemáticas (RLVR-GSM y RLVR-MATH) y un control explícito del eje brevedad-utilidad, a costa de un alcance de dominio mucho más estrecho y de la ausencia de ajuste de seguridad. No se dispone de comparaciones directas de rendimiento con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no está destinado a despliegue en producción.
- Sin ajuste de seguridad adicional: hereda únicamente el alineamiento de seguridad del modelo base, por lo que puede producir contenido inapropiado o dañino.
- Sesgos conocidos: no documentados en la model card; cabría esperar los sesgos del modelo base y los inducidos por el reward model Skywork-Reward-Llama-3.1-8B, que no se auditan aquí.
- Riesgo de alucinación: no evaluado. El entrenamiento se centra en recompensas de utilidad y brevedad sobre problemas matemáticos, no en veracidad factual general.
- Ámbito de especialización estrecho: los datos de RL son RLVR-GSM y RLVR-MATH; fuera de dominios matemáticos el comportamiento puede degradarse respecto al modelo base.
- Limitación de longitud de respuesta: el entrenamiento usa 256 tokens nuevos como máximo, lo que condiciona la verbosidad aprendida y puede truncar tareas que requieran respuestas largas.
- Idiomas: no declarados. No hay garantía de comportamiento multilingüe más allá de lo heredado del modelo base.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni métricas de exactitud publicadas; R1 y R2 son recompensas normalizadas, no comparables directamente con accuracy de terceros.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen2.5-3B-Instruct conviene revisar también las condiciones del modelo base.
- Advertencia sobre el repositorio: 80,2 GB de descarga para obtener trece checkpoints de tamaño completo; para la mayoría de usos basta con descargar una única subcarpeta.
- Cero descargas y cero likes en el momento de redactar la ficha: no hay validación externa de la comunidad.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (devuelven foros y soporte técnico ajenos al tema).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-uniform13-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio hermano (portafolio Algoritmo 1, semilla 1): https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-seed1
- Reward model de utilidad: https://huggingface.co/Skywork/Skywork-Reward-Llama-3.1-8B
- Dataset de entrenamiento (GSM): https://huggingface.co/datasets/allenai/RLVR-GSM
- Dataset de entrenamiento (MATH): https://huggingface.co/datasets/allenai/RLVR-MATH
- Código base (fork de open-instruct de AI2, `open_instruct/weighted_grpo.py`, `open_instruct/make_weights.py`): no se proporciona URL en la información disponible.
- Paper o blog técnico asociado: no disponible.
- Demo o Space: no disponible.
