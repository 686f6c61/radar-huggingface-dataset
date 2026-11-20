# llmfan46/Qwen3.6-27B-uncensored-heretic-v1-GGUF

## Resumen

Qwen3.6-27B-uncensored-heretic-v1-GGUF es una cuantización en formato GGUF del modelo llmfan46/Qwen3.6-27B-uncensored-heretic-v1, una variante "decensored" (abliterada) del modelo base Qwen/Qwen3.6-27B desarrollada por el contribuidor independiente llmfan46. El modelo parte de la arquitectura multimodal de Qwen (pipeline image-text-to-text, tag qwen3_5) y aplica la técnica de abliteración Hereetic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) para reducir los rechazos del modelo original ante peticiones que considera restringidas.

El objetivo declarado es preservar la calidad del modelo base (divergencia KL de 0,0286) mientras se reducen drásticamente las negativas: de 92/100 rechazos en el modelo original a 10/100 en esta versión, lo que supone un 89 % menos de rechazos. El modelo conserva las capacidades del Qwen3.6-27B original, incluyendo procesamiento de imagen y texto, y se distribuye bajo licencia Apache 2.0.

Con 26.895.998.464 parámetros reales (aproximadamente 27B) y un repositorio de 203,1 GB que incluye múltiples cuantizaciones GGUF, está pensado para despliegue local en hardware de consumo o servidores con GPU. Es relevante para quienes necesitan un modelo multimodal sin las restricciones de contenido del modelo original, aunque con las advertencias éticas y legales que implica una abliteración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (múltiples variantes en el repo, no se detallan los niveles exactos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF del modelo llmfan46/Qwen3.6-27B-uncensored-heretic-v1, que a su vez deriva de Qwen/Qwen3.6-27B. La arquitectura subyacente es la de la familia Qwen3.5, un transformer multimodal con pipeline image-text-to-text, lo que indica capacidad de procesar entradas de imagen y texto. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica principal es la abliteración mediante Hereetic v1.2.0 con el método Arbitrary-Rank Ablation (ARA). Los parámetros de abliteración reportados son: start_layer_index 24, end_layer_index 57, preserve_good_behavior_weight 0,5357, steer_bad_behavior_weight 0,0008, overcorrect_relative_weight 1,0682 y neighbor_count 6. Los componentes objetivo son attn.o_proj y attn.out_proj. El resultado es una divergencia KL de 0,0286 respecto al modelo original y una reducción de rechazos de 92/100 a 10/100.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo Qwen3.6-27B original.
- Procesamiento multimodal image-text-to-text: acepta entradas de imagen junto con texto.
- Capacidad conversacional multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integración en APIs.
- Reducción de rechazos y censura: 10/100 rechazos frente a 92/100 del original.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio para medir el efecto de la abliteración ARA sobre la calidad (KL 0,0286) y la tasa de rechazos, permitiendo comparar con el modelo original en experimentos controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles y que el modelo original rechazaría, aprovechando la reducción de rechazos del 89 %.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer y razonar sobre información de capturas, diagramas o documentos escaneados en flujos locales.
- Despliegue local con GGUF: cuantizaciones en formato GGUF permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo mediante llama.cpp u Ollama, sin depender de servicios en la nube.
- Evaluación comparativa de robustez: útil para medir cómo varía el rendimiento en MMLU (86,65 % en el original) tras la abliteración y detectar degradaciones por materia.
- Asistente conversacional autoalojado: gracias al tag endpoints_compatible y al pipeline conversacional, puede integrarse en un backend propio compatible con APIs estilo OpenAI para aplicaciones de chat.
- Análisis de contenido sensible en investigación: para estudiar cómo responde un modelo abliterado frente a un modelo alineado en tareas de moderación o análisis de discurso.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base sin cuantizar (llmfan46/Qwen3.6-27B-uncensored-heretic-v1), no a las cuantizaciones GGUF concretas.

| Metrica | Este modelo (v1) | Modelo original (Qwen3.6-27B) |
|---|---|---|
| Divergencia KL | 0,0286 | 0 (por definición) |
| Rechazos | 10/100 | 92/100 |
| MMLU (total, 7021 preguntas) | no disponible para la variante abliterada | 86,65 % (6084/7021) |

Resultados MMLU por materia del modelo original (referencia):

| Materia | Precision |
|---|---|
| high_school_us_history | 98,95 % |
| high_school_government_and_politics | 98,02 % |
| astronomy | 97,47 % |
| high_school_microeconomics | 97,06 % |
| high_school_psychology | 97,04 % |
| marketing | 96,33 % |
| high_school_computer_science | 96,15 % |
| high_school_world_history | 96,23 % |
| high_school_biology | 95,39 % |
| professional_medicine | 94,78 % |
| high_school_european_history | 94,52 % |
| miscellaneous | 93,99 % |
| college_biology | 93,75 % |
| logical_fallacies | 93,42 % |
| high_school_macroeconomics | 92,89 % |
| nutrition | 91,11 % |
| security_studies | 91,07 % |
| world_religions | 90,91 % |
| international_law | 90,00 % |
| management | 90,00 % |
| professional_psychology | 89,87 % |
| elementary_mathematics | 89,67 % |
| prehistory | 89,53 % |
| human_sexuality | 89,06 % |
| philosophy | 88,68 % |
| electrical_engineering | 86,42 % |
| moral_disputes | 86,21 % |
| high_school_physics | 85,71 % |
| professional_accounting | 85,31 % |
| college_medicine | 84,09 % |
| machine_learning | 82,69 % |
| business_ethics | 82,61 % |
| human_aging | 81,90 % |
| anatomy | 81,69 % |
| formal_logic | 79,69 % |
| econometrics | 79,63 % |
| college_physics | 77,19 % |
| moral_scenarios | 77,15 % |
| college_mathematics | 76,36 % |
| professional_law | 75,80 % |
| public_relations | 73,77 % |
| college_chemistry | 70,21 % |
| abstract_algebra | 70,21 % |
| high_school_mathematics | 63,78 % |
| global_facts | 62,75 % |
| virology | 55,06 % |

No se han publicado resultados de benchmarks de HumanEval, GSM8K u otros en la información disponible para la variante abliterada ni para las cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada: con ~27B parámetros, en FP16 se requieren aproximadamente 54 GB; en cuantizaciones GGUF de 8 bits, unos 27-30 GB; en 4 bits, unos 14-16 GB. Las cifras exactas dependen del nivel de cuantización incluido en el repo (no detallado).
- GPU recomendadas: A100 80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para cuantizaciones de 8 bits o inferiores; RTX 3090 (24 GB) para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits en GPUs con 16-24 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, RTX 3090). Las cuantizaciones de 8 bits requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF; el modelo base es compatible con transformers y endpoints compatibles con APIs estilo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-27B-uncensored-heretic-v1-GGUF (este) | ~27B | no disponible | 10/100 | Apache 2.0 | GGUF |
| Qwen3.6-27B-uncensored-heretic-v2-GGUF | ~27B | no disponible | 6/100 | Apache 2.0 | GGUF |
| Qwen/Qwen3.6-27B (original) | ~27B | no disponible | 92/100 | Apache 2.0 | safetensors |
| Otras variantes abliteradas de Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | no disponible |

La versión v2 del mismo autor mejora la v1 tanto en rechazos (6/100 frente a 10/100) como en divergencia KL (0,0021 frente a 0,0286), por lo que la v1 queda como opción únicamente si se necesita reproducibilidad de experimentos previos.

## Limitaciones y advertencias

- La abliteración elimina barreras de seguridad del modelo original: puede generar contenido dañino, ilegal o éticamente problemático. No debe desplegarse en producción orientada al público sin moderación adicional.
- La divergencia KL de 0,0286 indica una degradación medible respecto al modelo base; la calidad en tareas específicas puede verse afectada aunque MMLU no se haya reevaluado en la variante abliterada.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos de ~27B.
- La variante v2 del mismo autor es superior en todos los métricas reportadas; la v1 está obsoleta para nuevos despliegues.
- Licencia Apache 2.0 permite uso comercial, pero el autor del modelo no ofrece garantías y el uso de contenido generado sin restricciones puede conllevar responsabilidad legal.
- El repositorio tiene 203,1 GB e incluye múltiples cuantizaciones; el autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y podría no subir nuevas versiones.
- No se dispone de información sobre idiomas soportados, longitud de contexto ni capacidades de tool calling, lo que limita la evaluación para casos de uso que dependan de estos aspectos.
- El modelo base Qwen3.6-27B es multimodal; las cuantizaciones GGUF pueden no preservar todas las capacidades de imagen según el runner utilizado.

## Enlaces

- Modelo GGUF: https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v1
- Versión v2 recomendada: https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v2-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Método ARA (PR): https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
