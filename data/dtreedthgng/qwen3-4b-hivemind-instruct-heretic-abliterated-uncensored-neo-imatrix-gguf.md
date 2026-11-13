# dtreedthgng/Qwen3-4B-Hivemind-Instruct-Heretic-Abliterated-Uncensored-NEO-Imatrix-GGUF

## Resumen

Qwen3-4B-Hivemind-Instruct-Heretic-Abliterated-Uncensored-NEO-Imatrix-GGUF es un ajuste fino (fine-tune) del modelo base Qwen3-4B de Alibaba, publicado por el usuario dtreedthgng sobre el trabajo previo de DavidAU y Nightmedia. El modelo parte de una mezcla de destilaciones de Qwen3-4B (RA-SFT de Gen-Verse, Polaris-Alpha de TeichAI y Thinking-2507-Gemini-2.5-Flash de TeichAI) y aplica la técnica "abliteration" mediante la herramienta Heretic para eliminar los mecanismos de rechazo del modelo original. El resultado es un modelo de 4.022 millones de parámetros con una ventana de contexto declarada de 256.000 tokens, orientado a escritura creativa, ficción, roleplaying y generación de prosa sin restricciones de contenido.

La relevancia de esta ficha reside en que ejemplifica una categoría creciente de modelos derivados: los "uncensored" o "abliterated", que modifican los pesos de un modelo alineado para eliminar las negativas a generar cierto tipo de contenido. El autor declara una reducción de rechazos de 99/100 a 8/100 con una divergencia KL de 0,02 respecto al modelo original, lo que indica que la modificación es quirúrgica y preserva en gran medida el comportamiento base. Se distribuye únicamente en formato GGUF con cuantizaciones "NEO Imatrix", lo que lo hace desplegable en hardware de consumo mediante llama.cpp, KoboldCpp u oobabooga.

El modelo está etiquetado como `not-for-all-audiences` y su uso previsto es la generación de ficción adulta, terror, romance y roleplaying sin filtros. No debe confundirse con el Qwen3-4B oficial: es un derivado de la comunidad sin soporte de Alibaba y con implicaciones éticas y legales que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens (declarado en la model card) |
| Tipos de cuantizacion | GGUF con cuantizaciones NEO Imatrix (niveles concretos no disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tamano del repo: 21,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso con atención por grupos (GQA) y mecanismos de atención estándar de la familia Qwen3. El modelo original soporta modo "thinking" y no thinking, pero en esta ficha no se detalla si el fine-tune preserva ambos modos. El proceso de construcción descrito en la model card combina tres destilaciones de Qwen3-4B: Qwen3-4B-RA-SFT (Gen-Verse), Qwen3-4B-Instruct-2507-Polaris-Alpha-Distill (TeichAI) y Qwen3-4B-Thinking-2507-Gemini-2.5-Flash-Distill (TeichAI), sobre las que se aplica el método Heretic de abliteration.

La innovación técnica principal es la abliteration mediante Heretic (proyecto de p-e-w), que identifica y neutraliza las direcciones de activación asociadas a la negativa a responder. El autor reporta que los rechazos pasan de 99/100 a 8/100 con una divergencia KL de 0,02, lo que sugiere que la distribución de salida se mantiene muy próxima a la del modelo original fuera de los casos de rechazo. No se especifican en la información disponible el número de tokens de entrenamiento del fine-tune, la composición del dataset ni si hubo RLHF o DPO adicionales. Las cuantizaciones NEO Imatrix emplean matrices de importancia (imatrix) para calibrar la cuantización, una técnica habitual para preservar calidad en modelos pequeños.

## Capacidades

- Generación de texto creativo en inglés: ficción, terror, romance, ciencia ficción y todos los géneros, con énfasis declarado en "prosa vívida".
- Roleplaying y conversación multi-turno con contexto largo (hasta 256k tokens declarados).
- Generación de tramas y subtramas, continuación de escenas y construcción de historias.
- Contenido sin filtros: el modelo no rechaza peticiones de contenido adulto, violento o soez, aunque el autor advierte que en algunos casos necesita instrucciones explícitas (por ejemplo, indicar el vocabulario soez concreto) para alcanzar el nivel de explicitud deseado.
- Conversación general y usos "all use cases" según las etiquetas del autor.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información disponible.
- Capacidad multilingüe limitada: solo se declara inglés.

## Casos de uso

- Escritura de ficción interactiva y novelas por entregas: el modelo puede mantener coherencia narrativa en sesiones largas gracias a la ventana de 256k tokens, útil para continuar capítulos con el contexto completo de la obra.
- Roleplaying en entornos como SillyTavern o KoboldCpp: el autor recomienda `smoothing_factor` de 1,5 para conversaciones fluidas; el modelo está pensado para personajes sin restricciones de contenido.
- Generación de terror y ficción explícita: la abliteration elimina las negativas a describir violencia, horror visceral o contenido R-18, lo que lo hace adecuado para proyectos de ficción adulta que un modelo alineado rechazaría.
- Prototipado de guiones y tramas: generación rápida de subtramas, arcos de personaje y escenas alternativas sobre un mismo contexto largo.
- Experimentación en investigación sobre alineación y abliteration: sirve como caso de estudio reproducible (con Heretic) para medir el efecto de la eliminación de rechazos sobre benchmarks y calidad de prosa.
- Despliegue local en hardware modesto: al ser un GGUF de 4B, cabe en GPUs de consumo y permite inferencia offline en portátiles, útil para escritores que trabajan sin conexión.
- Generación de contenido para juegos de rol de mesa: el modelo puede improvisar descripciones de escenarios y PNJ con contexto extenso de campaña.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes, comparando el modelo con Qwen3-30B-A3B-Thinking-2507:

| Benchmark | Este modelo (4B) | Qwen3-30B-A3B-Thinking-2507 |
|---|---|---|
| arc_challenge | 0,553 | 0,421 |
| arc_easy | 0,753 | 0,448 |
| boolq | 0,848 | 0,682 |
| hellaswag | 0,642 | 0,635 |
| openbookqa | 0,438 | 0,402 |
| piqa | 0,756 | 0,771 |
| winogrande | 0,617 | 0,669 |

El autor también publica, como referencia, los resultados de su variante NEO-MAX (con "un poco de nanny", es decir, menos agresivamente abliterada): arc_challenge 0,613; arc_easy 0,842; boolq 0,855; hellaswag 0,748; openbookqa 0,428; piqa 0,781; winogrande 0,709. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. La comparación con Qwen3-30B-A3B es llamativa pero debe interpretarse con cautela: el modelo de 30B es un MoE en modo thinking y los resultados no son directamente equiparables.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B en GGUF, aproximadamente 3-4 GB en cuantización Q4, 5-6 GB en Q6 y 8-9 GB en Q8. El repo completo ocupa 21,5 GB porque incluye múltiples cuantizaciones.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para despliegues de mayor concurrencia. Cabe en GPUs de consumo con al menos 6-8 GB de VRAM según cuantización.
- Despliegue: llama.cpp, KoboldCpp, oobabooga/text-generation-webui (con `llama_HF` y archivos de configuración del modelo fuente), Ollama (requiere importar el GGUF) y vLLM no soporta GGUF de forma nativa en todas las versiones, por lo que se recomienda llama.cpp para producción ligera.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa para un 4B en una RTX 4090 con Q4, cabría esperar decenas de tokens por segundo, pero no se confirma con datos del autor.
- El autor recomienda ajustar `smoothing_factor` a 1,5 en KoboldCpp, text-generation-webui o SillyTavern, y aumentar `rep_pen` a 1,1-1,15 como alternativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Hivemind Heretic) | 4,02 B | 256k | apache-2.0 | GGUF | Abliterated, sin filtros, solo inglés |
| Qwen3-4B-Hivemind-Instruct-NEO-MAX | 4,02 B | 256k (declarado) | apache-2.0 | GGUF | Variante menos agresiva, con "algo de nanny"; mejores benchmarks en la mayoría de tareas |
| Qwen3-4B (oficial, Alibaba) | 4,02 B | 32k nativo (extensible) | apache-2.0 | safetensors, GGUF | Modelo base alineado, multilingüe, con modo thinking |
| Qwen3-30B-A3B-Thinking-2507 | 30 B (3 B activos) | 256k | apache-2.0 | safetensors, GGUF | MoE mucho mayor; comparación de benchmarks en la model card |

La comparativa directa más justa es con el Qwen3-4B oficial y con la variante NEO-MAX del mismo autor. El modelo oficial es multilingüe y mantiene los filtros de seguridad; esta versión sacrifica alineación por libertad de contenido y limita el idioma al inglés. Frente al NEO-MAX, la versión Heretic obtiene peores resultados en arc_easy, boolq, hellaswag y winogrande, lo que sugiere un coste medible en capacidades generales a cambio de la eliminación de rechazos.

## Limitaciones y advertencias

- Contenido no apto para todos los públicos: el modelo genera de forma deliberada contenido NSFW, violento, soez y explícito; está etiquetado `not-for-all-audiences`.
- La abliteration reduce rechazos pero no elimina sesgos: los sesgos del corpus original de Qwen3 persisten y pueden amplificarse al no haber filtros de salida.
- Riesgo de alucinación: como todo modelo de 4B, la precisión factual es limitada; no es adecuado para tareas de recuperación de hechos sin verificación.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Licencia apache-2.0: permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado, especialmente en jurisdicciones con restricciones sobre material adulto.
- El modelo no es el Qwen3-4B oficial: no cuenta con soporte de Alibaba ni garantías de mantenimiento; el repo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica poca validación comunitaria.
- El autor advierte que, sin instrucciones explícitas de estilo, el contenido puede resultar "blando" pese a no haber rechazos; requiere direccionamiento activo para alcanzar el nivel de explicitud esperado.
- No se documentan evaluaciones de seguridad, red-teaming ni pruebas de robustez frente a prompts adversarios.
- El uso en producción requiere revisión humana y filtros de salida propios si el producto se expone a terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dtreedthgng/Qwen3-4B-Hivemind-Instruct-Heretic-Abliterated-Uncensored-NEO-Imatrix-GGUF
- Modelo fuente de la familia (DavidAU): https://huggingface.co/DavidAU
- Variante 6B: https://huggingface.co/DavidAU/Qwen3-6B-Hivemind-Instruct-Heretic-Abliterated-Uncensored-NEO-Imatrix-GGUF
- Variante 8B: https://huggingface.co/DavidAU/Qwen3-8B-Hivemind-Instruct-Heretic-Abliterated-Uncensored-NEO-Imatrix-GGUF
- Variante NEO-MAX: https://huggingface.co/DavidAU/Qwen3-4B-Hivemind-Instruct-NEO-MAX-Imatrix-GGUF
- Qwen3-4B-RA-SFT (Gen-Verse): https://huggingface.co/Gen-Verse/Qwen3-4B-RA-SFT
- Qwen3-4B-Instruct-2507-Polaris-Alpha-Distill (TeichAI): https://huggingface.co/TeichAI/Qwen3-4B-Instruct-2507-Polaris-Alpha-Distill
- Qwen3-4B-Thinking-2507-Gemini-2.5-Flash-Distill (TeichAI): https://huggingface.co/TeichAI/Qwen3-4B-Thinking-2507-Gemini-2.5-Flash-Distill
- Equipo Qwen: https://huggingface.co/Qwen
- Heretic (abliteration): https://github.com/p-e-w/heretic
- Nightmedia: https://huggingface.co/nightmedia
- Archivos fuente y configuraciones de DavidAU: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
