# ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL

## Resumen

Wicked-Stuff-26B-A4B-v2.1-FINAL es un ajuste fino (finetune) de tipo conversacional y roleplay para adultos, publicado por el usuario ReadyArt en HuggingFace. Se construye sobre SubMaroon/Kitchoon-V3-26B-A4B, un modelo etiquetado como `gemma4`, lo que sitúa la arquitectura en la familia Gemma 4. El modelo tiene 25.805.933.872 parámetros reales según los pesos en safetensors (unos 25,8 mil millones) y el sufijo "A4B" de su nombre sigue la convención habitual para modelos de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parámetros activos por token, aunque ese dato no está confirmado en la documentación del autor.

El modelo está orientado explícitamente a contenido NSFW: roleplay erótico (ERP), terror, violencia y narrativa madura, con la etiqueta `unaligned` que indica que se ha reducido o eliminado el alineamiento de seguridad del modelo base. No resuelve un problema técnico novedoso: es un derivado de estilo y comportamiento, pensado para generación de texto conversacional e "in-character" en inglés, no para tareas de razonamiento, código o agentes.

Su relevancia práctica es limitada y muy específica: sirve como caso de estudio de fine-tuning sobre una arquitectura Gemma 4 MoE, como base para experimentos de narrativa interactiva para adultos y como objeto de investigación en red teaming y desalineamiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no incluye datos de entrenamiento ni benchmarks, y su model card contiene fundamentalmente CSS/HTML de presentación en lugar de documentación técnica, por lo que debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia Gemma 4 (etiqueta `gemma4`); detalles de capas y atención no disponibles |
| Parametros totales | 25.805.933.872 (~25,8 mil millones) |
| Parametros activos | No disponible (la nomenclatura "A4B" sugiere ~4 mil millones activos, dato no confirmado por el autor) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors en precisión completa (bf16), sin GGUF, AWQ ni GPTQ del autor |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 51,6 GB) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un finetune de SubMaroon/Kitchoon-V3-26B-A4B, que a su vez se etiqueta como `gemma4`. El recuento real de parámetros (25,8 mil millones) y el tamaño del repositorio (51,6 GB) son coherentes con pesos en bf16 (2 bytes por parámetro). El sufijo "A4B" del nombre replica el esquema de nomenclatura empleado en modelos MoE con pocos parámetros activos, pero la model card no documenta el número de expertos, el ratio de activación, la dimensión oculta ni el mecanismo de atención.

No hay información pública sobre el dataset de entrenamiento: ni número de tokens, ni composición, ni si se aplicaron etapas de SFT, RLHF o DPO. Tampoco se detalla la receta del finetune (LoRA, full fine-tune, merges) ni hiperparámetros. La única señal sobre el proceso es la etiqueta `unaligned`, que indica una reducción deliberada de los mecanismos de rechazo y alineamiento del modelo base, presumiblemente mediante entrenamiento sobre datos explícitos y narrativa adulta. La model card no incluye ninguna innovación técnica declarada (decodificación especulativa, atención lineal, modos de pensamiento, etc.).

## Capacidades

- Generación de texto conversacional en inglés, con énfasis en mantener personaje y coherencia multi-turno.
- Roleplay narrativo para adultos y contenido erótico explícito (ERP), según los tags del autor.
- Narrativa de terror, violencia gráfica y temáticas maduras.
- Generación de ficción y diálogo creativo con registro informal y explícito.
- Comportamiento "unaligned": menor tendencia a rechazar peticiones por motivos de seguridad, incluidas las que implican contenido sensible.
- Instrucciones y formato conversacional (`instruct`, `conversational`).
- No hay evidencia de soporte de tool calling, function calling, agentes, visión, audio, modo de razonamiento explícito ni capacidades multilingües más allá del inglés.

## Casos de uso

- Roleplay interactivo para adultos: el modelo está entrenado específicamente para sostener conversaciones multi-turno con personajes consistentes y contenido explícito, lo que lo hace adecuado para aplicaciones de entretenimiento para mayores de edad con verificación de edad obligatoria.
- Escritura de ficción de terror y violencia: puede generar escenas descriptivas de género negro, body horror o violencia explícita sin los rechazos típicos de modelos alineados, útil para autores de ficción adulta.
- Prototipado de personajes para videojuegos narrativos para adultos: permite iterar sobre voces de personaje y árboles de diálogo en fases de preproducción, siempre que el producto final gestione el etiquetado de edad.
- Generación de datos sintéticos para investigación sobre contenido explícito: útil para construir corpus de estudio de erotismo, violencia o lenguaje soez en narrativa, con las salvaguardas legales y éticas correspondientes.
- Red teaming y estudios de desalineamiento: como modelo `unaligned`, sirve para analizar qué tipo de peticiones dañinas acepta un finetune sin salvaguardas y para medir la eficacia de clasificadores de contenido.
- Base para nuevos finetunes de estilo: al ser Apache 2.0 y safetensors, puede reentrenarse con LoRA para otros registros narrativos (romance, terror gótico, etc.) partiendo de un modelo ya desinhibido.
- Análisis de calidad de prosa explícita: evaluación comparativa de estilo, coherencia y consistencia de personaje frente a otros finetunes del mismo nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de roleplay (por ejemplo, EQ-Bench o similar), ni comparaciones con el modelo base. Tampoco hay informes de terceros, dado que el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros (25,8 mil millones), no publicadas por el autor:

- Pesos en bf16: ~51,6 GB solo para los pesos. Requiere GPU de 80 GB (H100 80 GB, A100 80 GB) o sharding en 2× A100 40 GB / 2× RTX 4090 24 GB con tensor parallelism; hay que sumar la caché KV, cuyo tamaño depende de una longitud de contexto no documentada.
- Cuantización FP8 (~26 GB): viable en A100 40 GB, L40S 48 GB o 2× RTX 4090; requiere cuantizar el modelo uno mismo, ya que no hay versiones publicadas.
- Cuantización INT4 (~14-16 GB): cabría en RTX 4090 24 GB, RTX 3090 24 GB y, con contexto reducido, en GPU de 16 GB. Igualmente requiere conversión propia (GPTQ/AWQ/GGUF).
- No hay ficheros GGUF en el repositorio, por lo que el despliegue en llama.cpp u Ollama exige convertir los safetensors previamente; si la arquitectura Gemma 4 MoE no está soportada por la versión correspondiente de llama.cpp, la conversión puede fallar.
- Opciones de despliegue razonables: vLLM o TGI para servicio con tensor parallelism, transformers como referencia. No hay datos de latencia ni throughput publicados; en teoría, un MoE con ~4 mil millones de parámetros activos tendría un coste por token muy inferior al de un modelo denso de 25,8 mil millones, pero es una inferencia no verificada.
- No se recomienda su uso en producción sin una evaluación propia de calidad y seguridad: no hay ningún informe de validación de la comunidad.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL | 25,8 mil millones | No disponible (~4B por nomenclatura) | No disponible | Apache 2.0 | 0 descargas, 0 likes |
| SubMaroon/Kitchoon-V3-26B-A4B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | Modelo de origen del finetune |
| Otras alternativas de roleplay NSFW del mismo rango | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones completas de los modelos comparables, por lo que la comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Contenido explícito y potencialmente dañino: el modelo está diseñado para generar material NSFW, violencia gráfica y terror; no es apto para menores ni para entornos laborales sin control.
- Ausencia de alineamiento: la etiqueta `unaligned` implica que puede cumplir peticiones que un modelo estándar rechazaría. No debe exponerse a usuarios finales sin filtros de entrada y salida, moderación y verificación de edad.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones de fidelidad factual. No debe usarse para información factual, médica, legal o técnica.
- Documentación deficiente: la model card consiste mayoritariamente en CSS/HTML de presentación, sin ficha técnica, sin dataset, sin hiperparámetros y con errores tipográficos en el propio CSS. No hay garantía de reproducibilidad.
- Contexto e idioma: solo inglés declarado y longitud de contexto desconocida; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero la licencia no exime del cumplimiento de la legislación aplicable sobre contenido sexual, protección de menores (CSAM), difamación o violencia; el autor marca el repositorio como `not-for-all-audiences`.
- Sin validación comunitaria: 0 descargas y 0 likes, sin informes de terceros; el modelo puede tener artefactos de entrenamiento, degradación en tareas no narrativas o comportamientos erráticos no documentados.
- Riesgo de sesgos: sin datos sobre la composición del corpus, es probable la amplificación de estereotipos de género y de representaciones sesgadas en contenido sexual o violento.
- La búsqueda web realizada no devolvió información técnica relevante sobre este modelo; los resultados obtenidos no guardaban relación con el mismo y no se han utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL
- Modelo base (Kitchoon-V3-26B-A4B): https://huggingface.co/SubMaroon/Kitchoon-V3-26B-A4B
- Papers, blogs, repositorios o demos adicionales: no disponible (la búsqueda web no arrojó resultados técnicos relevantes)
