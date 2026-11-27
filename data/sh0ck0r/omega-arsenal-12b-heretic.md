# sh0ck0r/Omega-Arsenal-12B-heretic

## Resumen

Omega-Arsenal-12B-heretic es un modelo de lenguaje de 12.000 millones de parámetros (11.959.730.176 exactos según los pesos en safetensors) publicado por el usuario sh0ck0r en Hugging Face. Se trata de un finetune del modelo ReadyArt/Omega-Arsenal-12B al que se le ha aplicado un proceso de "abliteración" o decensura mediante la herramienta Heretic v2.1.0, con el objetivo declarado de eliminar los mecanismos de rechazo de respuestas y orientar el modelo hacia contenido para adultos, roleplay explícito y narrativa de terror o violencia. La etiqueta de arquitectura que declara el repositorio es `gemma4_unified`, lo que sugiere una base derivada de la familia Gemma, aunque el autor no detalla la arquitectura interna en la model card.

El modelo está pensado exclusivamente para generación de texto en inglés. No se documentan capacidades multimodales, tool calling ni modos de razonamiento extendido. Su propuesta de valor se centra en la ausencia de rechazos: según la tabla de rendimiento del autor, pasa de 98 rechazos sobre 100 en el modelo original a 7 sobre 100 tras la ablación, con una divergencia KL de 0,0194 respecto al original. Es, por tanto, un modelo de nicho para escritura creativa adulta y conversación sin restricciones, no un modelo de propósito general.

La relevancia técnica del artefacto está en su reproducibilidad: el autor publica los parámetros exactos de la ablación de rango arbitrario (ARA) empleados, lo que permite replicar el proceso sobre el modelo base. La licencia declarada es Apache 2.0, aunque el contenido que el modelo está diseñado para producir plantea consideraciones de uso que van más allá de la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (tag declarado: `gemma4_unified`); detalles internos no disponibles |
| Parámetros totales | 11.959.730.176 |
| Parámetros activos | no disponible (no es un modelo MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; el repo contiene pesos en safetensors en precisión original |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint ReadyArt/Omega-Arsenal-12B. Sobre esa base se aplicó Heretic v2.1.0, una herramienta de decensura que implementa una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las direcciones de activación asociadas al comportamiento de rechazo. Los parámetros publicados de la ablación son: `start_layer_index` = 24, `end_layer_index` = 33, `preserve_good_behavior_weight` = 0,9610, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 0,8933 y `neighbor_count` = 13. Es decir, la intervención se concentra en las capas 24 a 33 del modelo y busca preservar el comportamiento general mientras se suprime la tendencia a rechazar peticiones.

No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ni innovaciones arquitectónicas propias más allá de la propia técnica de ablación. El autor indica que el proceso es reproducible y remite a un directorio `reproduce/` del repositorio con instrucciones, aunque no se detalla su contenido en la model card. La innovación destacable, por tanto, es metodológica: la aplicación controlada y parametrizada de ARA con métricas de rechazo y divergencia KL publicadas.

## Capacidades

- Generación de texto conversacional en inglés, orientada a roleplay y narrativa interactiva.
- Escritura de ficción explícita para adultos (ERP, contenido erótico) sin rechazos sistemáticos.
- Narrativa de terror y violencia gráfica, según las etiquetas declaradas por el autor.
- Conversación multi-turno de tipo instruct, heredada del modelo base.
- Supresión del comportamiento de rechazo: 7 rechazos sobre 100 según la evaluación del autor.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües limitadas al inglés según la metadata del repositorio.

## Casos de uso

- Escritura creativa de ficción adulta: el modelo está específicamente ajustado para generar narrativa erótica y escenas explícitas sin las interrupciones o negativas típicas de modelos alineados, lo que lo hace adecuado para autores que trabajan en ese género.
- Roleplay conversacional de larga duración: su naturaleza instruct y conversacional permite mantener personajes y tramas en diálogos multi-turno, con la salvedad de que la longitud de contexto no está documentada.
- Narrativa de terror y violencia: las etiquetas del autor incluyen horror y violencia, de modo que puede emplearse para generar relatos de género negro, terror corporal o ficción violenta sin filtros de contenido.
- Prototipado de personajes para videojuegos o novelas visuales dirigidas a público adulto: el modelo puede generar diálogos de personajes con tono consistente y sin restricciones temáticas.
- Investigación sobre alineación y decensura: al publicar los parámetros ARA y las métricas de rechazo y KL, sirve como caso de estudio reproducible para estudiar cómo la ablación de direcciones afecta al comportamiento de rechazo y a la calidad general del modelo.
- Generación de material para comunidades de escritura colaborativa: foros y plataformas de ficción para adultos pueden integrarlo como asistente de escritura, siempre que se gestionen los avisos de contenido y la moderación posterior.
- Evaluación comparativa de técnicas de decensura: permite contrastar Heretic/ARA frente a otras técnicas de abliteración sobre el mismo modelo base, gracias a la reproducibilidad declarada.

## Benchmarks y rendimiento

El autor publica únicamente dos métricas comparativas frente al modelo original:

| Métrica | Este modelo | Modelo original (ReadyArt/Omega-Arsenal-12B) |
|---|---|---|
| Rechazos (sobre 100) | 7/100 | 98/100 |
| Divergencia KL | 0,0194 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 24 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 32 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 12-14 GB de pesos, viable en GPUs de 16-24 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 7-8 GB de pesos, viable en GPUs consumer de 8-12 GB, aunque la calidad en contenido creativo puede degradarse.
- GPUs recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para 8 bits; RTX 3060 12 GB o superiores para 4 bits.
- Cabe en GPU consumer: sí, en cuantizaciones de 8 y 4 bits; en FP16 requiere GPUs de 24 GB o más con gestión cuidadosa de memoria.
- Opciones de despliegue: llama.cpp y Ollama para cuantizaciones GGUF (requiere convertir los safetensors), vLLM o TGI para serving en FP16/BF16, y transformers con bitsandbytes para cuantización en carga.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Omega-Arsenal-12B-heretic | 11,96 B | no disponible | Roleplay adulto sin censura (ARA sobre Omega-Arsenal-12B) | Apache 2.0 | Hugging Face |
| ReadyArt/Omega-Arsenal-12B | ~12 B | no disponible | Modelo base alineado, roleplay | no disponible en la información | Hugging Face |
| Modelos abliterados de la familia Gemma/Llama de ~12 B | ~12 B | variable según base | Decensura mediante abliteración | habitualmente licencias de la familia base | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está diseñado explícitamente para generar material NSFW, erótico, violento y de terror; no es apto para uso general ni para entornos sin control de edad.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un finetune orientado a ficción, la precisión factual no es un objetivo y probablemente sea baja.
- Sesgos: no se documentan evaluaciones de sesgo; la ablación de rechazos puede aumentar la probabilidad de respuestas dañinas, ofensivas o estereotipadas sin filtro.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- Licencia: Apache 2.0 permite uso comercial según los términos de la licencia, pero el contenido generado puede infringir normativas de moderación, protección de menores o las políticas de las plataformas donde se despliegue; la responsabilidad recae en el integrador.
- Reproducibilidad: aunque el autor declara el proceso reproducible, no se verifica en la información disponible el contenido del directorio `reproduce/`.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente de las métricas declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sh0ck0r/Omega-Arsenal-12B-heretic
- Modelo base: https://huggingface.co/ReadyArt/Omega-Arsenal-12B
- Heretic (herramienta de decensura): https://heretic-project.org
