# marsplan0624/d3-lite-46f7a9e6

## Resumen

d3-lite-46f7a9e6 es un ajuste fino (fine-tune) publicado por el usuario marsplan0624 en Hugging Face, construido sobre el modelo base Qwen/Qwen3.5-0.8B. Segun la model card, se trata de un "Zils soup body" para el pool `d3-lite`: conserva los pesos completos de lenguaje y vision de un fine-tune con el layout de Qwen3.5-0.8B, y ha sido entrenado sobre preguntas de decision publicas al estilo Zils Outcomes, etiquetadas con resultados reales (reverts y reviews de Wikipedia, categorias de arXiv, resultados de Stack Exchange y merges de Gerrit). El ajuste incluye un LoRA de rango 16 sobre el componente de lenguaje, fusionado en los pesos finales.

El modelo tiene 852.985.920 parametros (aproximadamente 0,85 mil millones) y un repositorio de 1,7 GB en formato safetensors. La licencia declarada es Apache 2.0 y el modelo base es Qwen3.5-0.8B, lo que sugiere capacidades multimodales (lenguaje y vision) heredadas de dicho base. No se dispone de informacion sobre el pipeline, los idiomas soportados ni resultados de benchmarks.

Es relevante ahora principalmente como artefacto de investigacion: la model card advierte explicitamente que los pesos solo son utilizables a traves del runtime "chassis" del pool, y que el repositorio no incluye capa de respuesta ni codigo de runtime. Por tanto, no es un modelo autonomo listo para inferencia directa, sino un componente pensado para integrarse en un sistema mayor. El modelo se creo el 6 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda el layout de Qwen/Qwen3.5-0.8B; la model card no detalla la arquitectura) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo reutiliza el layout de Qwen/Qwen3.5-0.8B y que conserva tanto los pesos de lenguaje como los de vision del fine-tune. El entrenamiento se realizo sobre preguntas de decision publicas al estilo Zils Outcomes, etiquetadas con resultados observados en dominios concretos: reverts y reviews de Wikipedia, categorias de arXiv, resultados de Stack Exchange y merges de Gerrit. Sobre el componente de lenguaje se aplico un LoRA de rango 16 que posteriormente se fusiono en los pesos, de modo que el artefacto publicado no requiere cargar adaptadores adicionales para el lenguaje.

No se especifican el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. La model card tampoco documenta innovaciones tecnicas como decodificacion especulativa o attention lineal. El aspecto mas destacable desde el punto de vista de ingenieria es el empaquetado: el repositorio contiene unicamente los pesos ("body") y depende de un runtime externo ("pinned chassis runtime") para funcionar, sin incluir la capa de respuesta ni el codigo necesario para la inferencia.

## Capacidades

- Generacion de texto y modelado de lenguaje, heredados del ajuste sobre Qwen3.5-0.8B.
- Capacidades de vision, segun la model card, que menciona explicitamente pesos de lenguaje y vision.
- Clasificacion y prediccion de decisiones: el entrenamiento esta orientado a preguntas de decision etiquetadas con resultados reales (reverts de Wikipedia, categorias de arXiv, resultados de Stack Exchange, merges de Gerrit).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre modelos de decision: el modelo puede emplearse para estudiar como un fine-tune de ~0,85 mil millones de parametros aprende a predecir resultados de decisiones a partir de senales historicas, usando los conjuntos de Wikipedia, arXiv, Stack Exchange y Gerrit como referencia.
- Moderacion de contribuciones en wikis: el modelo esta entrenado con reverts y reviews de Wikipedia, por lo que encaja en experimentos de prediccion de si una edicion sera revertida o aceptada, siempre que se integre en el runtime del pool.
- Triaje de envios a arXiv: dado el entrenamiento con categorias de arXiv, puede usarse para experimentos de asignacion o validacion de categorias de articulos cientificos.
- Analisis de preguntas y respuestas en Stack Exchange: el modelo puede aplicarse a la prediccion de resultados de publicaciones (aceptacion, cierre, puntuacion) en foros tecnicos, como componente de un sistema de soporte a la moderacion.
- Revision de cambios de codigo en Gerrit: el entrenamiento con merges de Gerrit permite experimentar con la prediccion de si un cambio sera fusionado, integrndolo en flujos de revision automatizada.
- Evaluacion de tecnicas de fine-tuning eficiente: al usar un LoRA de rango 16 fusionado sobre un modelo de ~0,85 mil millones de parametros, sirve como caso de estudio para comparar estrategias de ajuste y fusion de adaptadores en modelos pequenos.
- Prototipado de sistemas multimodales ligeros: al conservar pesos de vision y lenguaje, puede utilizarse en experimentos de investigacion que requieran un modelo pequeno con ambas modalidades, sujeto a las restricciones del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 852.985.920 parametros en precision de 16 bits requiere aproximadamente 1,7 GB solo para los pesos, a los que se anaden memoria para activaciones y cache KV; en cuantizaciones de 8 y 4 bits el peso se reduce aproximadamente a 0,85 GB y 0,43 GB respectivamente. Estas cifras son estimaciones genericas basadas en el numero de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamano, el modelo deberia caber en GPU de consumo con suficiente memoria, pero no se documentan requisitos oficiales.
- Compatibilidad con GPU de consumo: probable por el tamano de los pesos, pero no confirmada por el autor; ademas, la dependencia del runtime "chassis" del pool condiciona el despliegue.
- Opciones de despliegue: la model card indica que los pesos solo son utilizables a traves del runtime "pinned chassis runtime" del pool. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| d3-lite-46f7a9e6 | 852.985.920 | no disponible | apache-2.0 | safetensors | requiere runtime del pool |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 mil millones (segun el modelo base declarado) | no disponible | no disponible en esta ficha | no disponible en esta ficha | publico en Hugging Face |
| Otros fine-tunes de Qwen3.5-0.8B | variable | no disponible | variable | variable | publicos en Hugging Face |

La comparacion con alternativas de la misma categoria es limitada porque no se dispone de datos de rendimiento, contexto ni idiomas del modelo evaluado. El unico punto de referencia solido es el modelo base Qwen/Qwen3.5-0.8B, del que este artefacto hereda el layout y los pesos ajustados.

## Limitaciones y advertencias

- El repositorio no incluye capa de respuesta ni codigo de runtime: los pesos solo funcionan a traves del runtime "chassis" del pool `d3-lite`, lo que limita su uso directo con herramientas estandar de inferencia.
- No se documentan idiomas soportados, longitud de contexto ni pipeline, lo que impide garantizar su comportamiento en produccion.
- No hay resultados de benchmarks publicados, por lo que no se puede verificar su calidad frente a alternativas.
- Riesgo de alucinacion: no evaluado por el autor; al ser un modelo pequeno (~0,85 mil millones de parametros) entrenado para prediccion de decisiones, es previsible que generalice de forma limitada fuera de los dominios de entrenamiento (Wikipedia, arXiv, Stack Exchange, Gerrit).
- Sesgos conocidos: no documentados; los datos de entrenamiento provienen de comunidades concretas (Wikipedia, arXiv, Stack Exchange, Gerrit), lo que puede introducir sesgos propios de esas plataformas.
- Uso comercial: la licencia es Apache 2.0, que permite uso comercial, pero la dependencia del runtime del pool y la ausencia de documentacion sobre el modelo base deben verificarse antes de cualquier despliegue en produccion.
- El modelo tiene cero descargas y cero likes, y fue publicado recientemente; no hay evidencia de uso o validacion por parte de la comunidad.
- La model card esta redactada en ingles y no incluye informacion sobre sesgos, evaluaciones de seguridad ni limitaciones detalladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marsplan0624/d3-lite-46f7a9e6
- Perfil del autor: https://huggingface.co/marsplan0624
- Datasets del autor: https://huggingface.co/marsplan0624/datasets
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
