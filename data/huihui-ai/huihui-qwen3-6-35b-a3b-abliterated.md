# huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated

## Resumen

El modelo `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated` es una variante sin censura del modelo base `Qwen/Qwen3.6-35B-A3B`, desarrollada por el equipo de huihui-ai mediante la técnica de *abliteration*. Esta técnica consiste en eliminar las capas o direcciones de activación responsables de los rechazos y las respuestas de seguridad, dando como resultado un modelo que no filtra contenido sensible, controvertido o explícito. El modelo se presenta como una prueba de concepto para investigación y uso controlado, no para producción.

Arquitectónicamente, se basa en un transformer de mezcla de expertos (MoE) con 35,95 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token, como indica el sufijo `A3B`. El modelo es multimodal (image-text-to-text) y está disponible en formato `safetensors`. Su licencia Apache 2.0 permite uso comercial, aunque el autor advierte de riesgos legales y éticos debido a la ausencia de filtros de seguridad.

La relevancia actual de este modelo radica en la demanda de LLMs sin restricciones para investigación en seguridad, análisis de sesgos, o desarrollo de aplicaciones de nicho donde se requiere explorar respuestas sin censura. Sin embargo, su uso en entornos públicos o comerciales conlleva responsabilidades legales y éticas importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | ~3 B (estimado por el sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors; version Ollama disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien disponible via Ollama como GGUF) |

## Arquitectura y entrenamiento

El modelo se deriva de `Qwen/Qwen3.6-35B-A3B`, un LLM multimodal de la familia Qwen3.6 con arquitectura de mezcla de expertos (MoE). En este tipo de arquitectura, solo un subconjunto de los parámetros se activa por token, lo que permite un equilibrio entre capacidad total y eficiencia computacional. El sufijo `A3B` indica aproximadamente 3 mil millones de parámetros activos, lo que reduce los requisitos de memoria y acelera la inferencia en comparación con un modelo denso del mismo tamaño total.

El proceso de *abliteration* se aplicó sobre el modelo base utilizando la librería `remove-refusals-with-transformers`, que identifica y elimina las direcciones de activación asociadas a los comportamientos de rechazo y seguridad. Esto se hace sin necesidad de ajuste fino adicional, manteniendo las capacidades generales del modelo original pero eliminando los filtros de contenido. No se han publicado detalles sobre el dataset de entrenamiento original de Qwen3.6-35B-A3B ni sobre el proceso de abliteration en términos de tokens o datos específicos.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, sin filtros de contenido.
- Razonamiento y comprension de lenguaje natural, heredados del modelo base Qwen3.6.
- Capacidad multimodal (image-text-to-text), aunque no se especifican detalles sobre el procesamiento de imagenes en esta variante.
- Soporte para tareas de codigo y agentes, segun las capacidades generales de Qwen3.6 (mencionado en la pagina de Ollama).
- Funcionamiento como modelo "uncensored": no rechaza peticiones sobre temas sensibles, controvertidos o ilegales (con las advertencias correspondientes).

## Casos de uso

- Investigacion academica en seguridad de IA: analizar como los modelos generan contenido sin filtros y estudiar sesgos o comportamientos peligrosos en entornos controlados.
- Evaluacion de tecnicas de alineacion: comparar las respuestas de este modelo con las del modelo base para medir el impacto de la abliteration en la calidad y seguridad.
- Desarrollo de herramientas de escritura creativa sin restricciones tematicas, como ficcion con contenido adulto o exploracion de escenarios hipoteticos.
- Pruebas de estres en sistemas de moderacion: generar contenido que deberia ser bloqueado para validar filtros de terceros.
- Entrenamiento de clasificadores de contenido toxico: utilizar las salidas del modelo como ejemplos negativos para sistemas de deteccion.
- Experimentos de jailbreak y robustez: estudiar como los modelos sin censura responden a instrucciones maliciosas y comparar con modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es una variante abliterated del Qwen3.6-35B-A3B, por lo que se espera un rendimiento similar al base en tareas generales, pero no hay datos cuantitativos confirmados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que tiene ~3B parametros activos, una cuantizacion de 4 bits podria requerir alrededor de 8-12 GB de VRAM, pero es una estimacion no confirmada.
- GPU recomendadas: se puede ejecutar en GPUs de consumo como RTX 3090/4090 (24 GB) con cuantizacion, o en GPUs profesionales como A100 (40/80 GB) para precision completa.
- Opciones de despliegue: disponible via Ollama (`ollama run huihui_ai/qwen3.6-abliterated:35b`), tambien compatible con transformers y safetensors para uso con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3.6-35B-A3B (base) | 35,95 B totales, ~3 B activos | no disponible | Apache 2.0 | Modelo original con filtros de seguridad |
| Huihui-Qwen3.6-35B-A3B-abliterated | 35,95 B totales, ~3 B activos | no disponible | Apache 2.0 | Version sin censura del anterior |
| Otros modelos abliterated de huihui-ai (p.ej. sobre Qwen3) | varian | no disponible | Apache 2.0 | Misma tecnica, distinto base |

No se dispone de comparativas con modelos de tamano similar fuera de la familia Qwen.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: el modelo puede generar contenido sensible, controvertido, ilegal o inapropiado.
- No apto para menores, entornos publicos o aplicaciones comerciales sin supervisión estricta.
- Riesgo elevado de alucinaciones y respuestas factualmente incorrectas, especialmente en temas delicados.
- Limitaciones de contexto e idioma no especificadas; se recomienda verificar la documentacion del modelo base Qwen3.6.
- Uso bajo la responsabilidad del usuario; el autor declina toda responsabilidad por consecuencias legales o eticas.
- No se recomienda su uso en produccion sin un sistema de moderacion y revision manual en tiempo real.

## Enlaces

- HuggingFace: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Version en Ollama: https://ollama.com/huihui_ai/qwen3.6-abliterated:35b
- Noticia sobre el lanzamiento: https://www.ai-market-watch.com/news/release-of-uncensored-qwen36-35b-a3b-abliterated-model-bgxohb
