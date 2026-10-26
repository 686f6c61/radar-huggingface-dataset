# BuilderHelm/Kanso-Satori-1.0-bf16

## Resumen

Kanso Satori 1.0 (bf16) es la versión maestra en precisión completa del modelo de mejora de dictado de ZenVoice, publicado por BuilderHelm AI bajo licencia Apache-2.0. No es un modelo conversacional de propósito general: es un ajuste fino de Qwen3-4B-Instruct-2507 entrenado específicamente para limpiar transcripciones de voz a texto en bruto, corrigiendo puntuación, mayúsculas, muletillas, reinicios falsos y restaurando la forma escrita de números, fechas, horas, importes, URLs y direcciones de correo sin alterar el significado ni las palabras del hablante.

Técnicamente es un transformer denso de 4.022.468.096 parámetros (~4B) sobre el que se aplicó un adaptador LoRA (rango 32, alpha 64) en las 36 capas y todos los módulos lineales, que después se fusionó con `mlx_lm fuse` en los pesos bf16 originales. El resultado son 8,04 GB en dos shards de safetensors en formato MLX, pensados para ejecutarse en Apple Silicon. El repositorio incluye también builds cuantizados de 4 bits (2,26 GB) y 3 bits (1,76 GB), generados a partir de este maestro.

Su relevancia es doble: por un lado cubre una tarea muy concreta pero omnipresente (posprocesado de ASR antes de que el texto llegue a un correo, una nota o un IDE); por otro, sirve como referencia de precisión frente a los builds on-device, ya que la model card demuestra que la cuantización a 4 bits no degrada la calidad de forma medible en su suite de evaluación e incluso duplica la velocidad de decodificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino con LoRA fusionado |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el entrenamiento usó max length 1.024 tokens |
| Tipos de cuantizacion | bf16 (este repo), 4 bits (2,26 GB), 3 bits (1,76 GB), 4 bits DWQ |
| Idiomas soportados | No disponibles (la model card está redactada en inglés y no declara cobertura lingüística) |
| Licencia | Apache-2.0 (heredada de Qwen3-4B-Instruct-2507) |
| Formato de pesos | safetensors en formato MLX (bf16, dos shards, 8,04 GB) |
| Libreria | mlx (`mlx_lm`) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Descargas / likes | 153 / 0 (a fecha de la información) |
| Repositorio | 8,1 GB; creado 2026-10-24, actualizado 2026-10-26 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 y se entrena sobre la versión ya cuantizada a 4 bits del mismo (`mlx-community/Qwen3-4B-Instruct-2507-4bit`, revisión `50d4277`), lo que abarata el entrenamiento en hardware Apple. El adaptador LoRA usa rango 32, alpha 64 y escala 2.0, con dropout 0.05, aplicado a las 36 capas y a todos los módulos lineales. El schedule es cosine decay de 1e-4 a 1e-6 durante 3.400 pasos, con batch 2, 3.500 iteraciones totales, longitud máxima de 1.024 y gradient checkpointing; el checkpoint elegido es el paso 3.500, seleccionado sobre un conjunto de validación reservado. Finalmente, el adaptador se fusiona en los pesos bf16 originales mediante `mlx_lm fuse`, de modo que este repo es el maestro en precisión completa del que se derivan todas las cuantizaciones on-device.

Los datos de entrenamiento provienen del corpus v2.2 de la familia, compuesto por 10 fuentes y 86.524 pares de entrenamiento (dictado en bruto, texto limpio). La licencia del corpus se restringe a fuentes MIT, Apache-2.0, CC-BY-4.0 y CC0, con lista de atribuciones en el repositorio de ZenVoice. Una innovación operativa destacable: el adaptador se entrenó con un bloque de pensamiento vacío (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, por lo que la model card exige usar el `chat_template.jinja` incluido en el repo y los ficheros de tokenizer originales del entrenamiento; la plantilla estándar de Qwen3-4B-Instruct-2507 no inserta ese bloque y degrada el comportamiento.

## Capacidades

- Limpieza de dictado: corrige puntuación y mayúsculas, elimina muletillas ("so um", "like", "uh") y reinicios falsos, y mantiene el significado y las palabras del hablante.
- Normalización de entidades: restaura la forma escrita de números, fechas, horas, importes monetarios, URLs y direcciones de correo electrónico.
- Formateo condicionado por contexto: si se le pasa una línea `app:` en el mensaje, adapta mayúsculas y tono al contexto indicado (correo, chat, editor de código).
- Salida limpia: produce únicamente el texto corregido, sin comentarios ni explicaciones, lo que simplifica su uso dentro de pipelines.
- Modo no-thinking activado en el ejemplo de uso (`enable_thinking=False`), con decodificación greedy (`temp=0.0`) como configuración de referencia para resultados deterministas.
- Generación de texto y conversación heredadas del modelo base, aunque el ajuste está orientado a una única tarea.
- No hay soporte declarado de tool calling, agentes, visión, audio ni multimodalidad en la model card.

## Casos de uso

- Posprocesado en pipelines de ASR: encadenar Whisper o cualquier motor de voz a texto con Kanso Satori para entregar texto limpio; el modelo recibe la transcripción bruta y devuelve la versión con puntuación y capitalización correctas, eliminando la necesidad de reglas heurísticas frágiles.
- Dictado en aplicaciones de notas: integrar el modelo en una app de notas por voz en Apple Silicon para que el usuario hable de forma natural y obtenga párrafos listos para publicar, con muletillas y reinicios eliminados.
- Formateo dependiente de la app activa: usando la línea `app:`, el mismo dictado se puede formatear con estilo de correo formal al escribir en Mail y con estilo telegráfico al escribir en un chat de equipo, sin cambiar de modelo.
- Restauración de datos críticos: reconstruir números, fechas, horas e importes dictados oralmente ("tres y media", "dos mil euros") en su forma escrita, útil en informes, partes de trabajo y documentación administrativa.
- Dictado en entornos sensibles a la privacidad: al ejecutarse localmente con MLX sobre Apple Silicon, el audio transcrito y el texto pueden quedarse en el dispositivo, sin enviar contenido a la nube; relevante en sanidad, legal o banca.
- Accesibilidad: apoyo a usuarios con movilidad reducida que dependen del dictado para redactar correos o documentos, garantizando una salida legible y con formato correcto antes de enviarla.
- Normalización de corpus: limpiar transcripciones masivas para construir datasets de entrenamiento o sistemas de subtitulado, con la ventaja de que el modelo produce solo el texto final, sin diálogo adicional que haya que filtrar.
- Edición por voz en el IDE: convertir instrucciones dictadas en comentarios, commits o mensajes de documentación con el tono adecuado, usando el contexto `app:` para ajustar el registro.

## Benchmarks y rendimiento

La model card publica `eval_v500`: 500 dictados con control de fuga de datos, decodificación greedy, máximo 200 tokens, sobre Apple M5 con MLX 0.32.2.

| Metrica | v3.2 bf16 (este modelo) | v3.2 4 bits DWQ | v3.2 forma entrenada (base 4 bits + adaptador en vivo) | v2.2 Lite (1,7B) |
|---|---|---|---|---|
| WER | 5,1 % | 4,7 % | 5,0 % | 5,5 % |
| Exact match | 65,6 % | 67,2 % | 65,2 % | 65,8 % |
| Punct F1 | 0,849 | 0,859 | 0,861 | 0,863 |
| Pesos | 8,04 GB | 2,26 GB | 2,40 GB | 1,05 GB |
| Velocidad de decodificacion | 15 tok/s | 47 tok/s | 36 tok/s | 73 tok/s |

Según el autor, las cuatro variantes están dentro del ruido estadístico en esta suite. La ventaja del 4B sobre la variante Lite aparece en datos reservados de v2.2: el build de 4 bits obtiene +3,6 puntos de exact match (IC 95 % de +0,4 a +6,8). No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras pruebas de propósito general, y no tendría sentido aplicarlas a un modelo de esta especialización.

## Requisitos de hardware

- Este repo bf16 necesita 8,2 GB de memoria y decodifica a 15 tok/s en un Apple M5 (dato del autor).
- El build de 4 bits ocupa 2,26 GB de pesos y alcanza 47 tok/s en el mismo M5; el de 3 bits baja a 1,76 GB. Para uso on-device, el autor recomienda explícitamente el build de 4 bits.
- La variante Lite de 1,7B ocupa 1,05 GB y llega a 73 tok/s, la opción si el presupuesto de memoria o latencia es muy ajustado.
- Cabe en cualquier Mac con Apple Silicon con 16 GB de memoria unificada en su versión de 4 bits; el bf16 requiere al menos 8,2 GB libres, por lo que 16 GB es el mínimo práctico y 24-32 GB da margen.
- No hay soporte documentado para CUDA, vLLM, TGI, llama.cpp ni Ollama: el repo es MLX (`mlx_lm.load`, `mlx_lm.generate`) y el pipeline declarado es `mlx`. Para otros runtimes habría que convertir los pesos.
- Herramientas de cuantización indicadas por el autor: `mlx_lm.convert` y `mlx_lm dwq` ejecutados contra este modelo, conservando los ficheros de tokenizer y la plantilla de chat incluidas.
- Throughput y latencia fuera de Apple Silicon: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (eval_v500) | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kanso Satori 1.0 bf16 (este) | 4,02B | No especificado (entreno a 1.024) | WER 5,1 % / EM 65,6 % / F1 0,849 | 15 tok/s (M5) | Apache-2.0 | MLX bf16, 8,04 GB |
| Kanso Satori 1.0 (4 bits) | 4,02B | No especificado | WER 4,7 % / EM 67,2 % / F1 0,859 | 47 tok/s (M5) | Apache-2.0 | MLX 4 bits, 2,26 GB |
| Kanso Satori 1.0 3 bits | 4,02B | No especificado | No disponible | No disponible | Apache-2.0 | MLX 3 bits, 1,76 GB |
| Kanso Satori v2.2 Lite | 1,7B | No especificado | WER 5,5 % / EM 65,8 % / F1 0,863 | 73 tok/s (M5) | Apache-2.0 (según familia) | Build previo, 1,05 GB |
| Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible en esta información | No aplica (modelo generalista, sin entrenamiento de formateo) | No disponible | Apache-2.0 | Safetensors estándar |

Kanso Koi 1.0, el otro modelo de formateo de la familia y origen del corpus de entrenamiento v2.2, no tiene parámetros ni benchmarks detallados en la información disponible.

## Limitaciones y advertencias

- Modelo de tarea única: no debe usarse como asistente conversacional general; su comportamiento está ajustado para devolver solo texto limpio y puede responder de forma degenerada ante peticiones fuera de dominio.
- Plantilla de chat obligatoria: usar la plantilla estándar de Qwen3-4B-Instruct-2507 en lugar del `chat_template.jinja` incluido elimina el bloque de pensamiento vacío con el que se entrenó y degrada la calidad de salida.
- Longitud de entrenamiento de 1.024 tokens: dictados muy largos pueden exceder el régimen visto durante el ajuste; no hay datos publicados sobre degradación más allá de ese límite.
- Riesgo de alteración de significado: aunque la instrucción de sistema pide preservar las palabras del hablante, un modelo generativo puede reformular, resumir o inventar contenido en transcripciones ambiguas o con ruido; conviene validar con WER/EM en el dominio propio antes de producción.
- Cobertura lingüística no declarada: la model card está en inglés y no especifica idiomas; el uso en castellano no está verificado y debe evaluarse empíricamente.
- Sesgos: no se documenta ninguna evaluación de sesgos; al heredar el modelo base, puede reproducir sesgos presentes en Qwen3-4B-Instruct-2507 y en el corpus de 10 fuentes.
- Formato MLX: los pesos no son cargables directamente en vLLM, TGI o transformers sin conversión, lo que limita el despliegue a entornos Apple Silicon con `mlx_lm`.
- Licencia Apache-2.0 en pesos y base, con datos de entrenamiento restringidos a MIT, Apache-2.0, CC-BY-4.0 y CC0; no obstante, la lista de atribuciones debe revisarse en el repositorio de ZenVoice antes de un uso comercial.
- Repositorio con muy poca tracción (153 descargas, 0 likes) y sin resultados de terceros que reproduzcan los benchmarks del autor; trata las cifras de `eval_v500` como no verificadas de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-bf16
- Build de 4 bits recomendado: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Build de 3 bits: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-3bit
- Modelo de la familia con el corpus v2.2: https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Repositorio de ZenVoice (atribuciones del corpus): no disponible como enlace directo en la información proporcionada
- Búsqueda web: no se han encontrado enlaces técnicos relevantes; los resultados devueltos por la búsqueda no guardan relación con este modelo y se han descartado.
