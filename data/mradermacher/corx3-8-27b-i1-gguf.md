# mradermacher/CorX3.8-27B-i1-GGUF

## Resumen

El modelo CorX3.8-27B-i1-GGUF es una cuantización en formato GGUF del modelo de lenguaje CorX3.8-27B, preparada por el usuario mradermacher. Esta versión emplea la técnica de cuantización con matriz de importancia (imatrix) para optimizar la calidad de la compresión, reduciendo el tamaño del modelo original de aproximadamente 26,9 mil millones de parámetros. El modelo base está licenciado bajo Apache 2.0 y está orientado al inglés. La cuantización GGUF permite ejecutar el modelo en entornos con recursos limitados mediante herramientas como llama.cpp, Ollama o text-generation-inference, lo que facilita su uso en producción y experimentación. Es relevante para desarrolladores que necesitan desplegar un modelo de gran tamaño sin requerir GPUs de alta gama, siempre que se acepte una ligera pérdida de precisión frente a la versión no cuantizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (imatrix y estáticos; se mencionan Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (si es un transformer estándar, MoE, etc.) ni sobre los datos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La única innovación técnica conocida en esta versión es la aplicación de cuantización con matriz de importancia (imatrix), que asigna mayor precisión a las capas y pesos más relevantes durante la compresión, mejorando la calidad en comparación con cuantizaciones estáticas. Esta técnica es utilizada por mradermacher en sus cuantizaciones para optimizar el rendimiento en hardware limitado.

## Capacidades

- No se han documentado capacidades específicas más allá de ser un modelo de lenguaje general.
- El modelo está diseñado para generación de texto en inglés.
- Al ser una cuantización GGUF, es compatible con herramientas de inferencia local como llama.cpp, Ollama, text-generation-inference y otras que soporten este formato.
- No se ha confirmado soporte para tool calling, funciones de agente o razonamiento multi-paso, ya que no se dispone de documentación al respecto.

## Casos de uso

- **Despliegue local de un modelo de 27B**: gracias a la cuantización, se puede ejecutar en una GPU de gama media (por ejemplo, RTX 4090) o incluso en CPU con suficiente RAM, para prototipos y aplicaciones personales.
- **Generación de texto en entornos sin conexión**: al ser un archivo GGUF, se puede usar con llama.cpp o Ollama para crear aplicaciones de chat o generación de contenido sin depender de APIs externas.
- **Investigación en compresión y cuantización**: este modelo sirve como referencia para estudiar el impacto de la cuantización imatrix en modelos de gran tamaño.
- **Uso educativo**: para aprender a desplegar modelos cuantizados con herramientas de código abierto.
- **Integración en pipelines de generación de texto**: se puede integrar en scripts de Python mediante la librería llama-cpp-python o similar para tareas de automatización de texto.
- **Prototipado rápido**: al ser una cuantización, permite probar el rendimiento del modelo base sin necesidad de grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del archivo GGUF varía según la cuantización. Para una cuantización Q4_K_S, el tamaño aproximado es de unos 15 GB, mientras que para Q8_0 sería alrededor de 29 GB.
- Para ejecutar el modelo con cuantización Q4_K_S se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40GB) o una CPU con 32 GB de RAM.
- Las cuantizaciones más bajas (Q2_K, IQ3_M) pueden caber en GPUs de 12 GB, pero con mayor pérdida de calidad.
- Se puede desplegar con llama.cpp, Ollama, text-generation-inference (TGI) o cualquier framework que soporte GGUF.
- La latencia y el throughput dependen del hardware y de la cuantización elegida; no hay datos oficiales.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Al ser una cuantización, existe una pérdida de calidad en la generación de texto en comparación con el modelo original en punto flotante.
- No se conoce la arquitectura ni el entrenamiento del modelo base, por lo que no se pueden anticipar sesgos o limitaciones específicas.
- El modelo solo está documentado para el idioma inglés; su rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar los términos del modelo base (Sigmandndnns/CorX3.8-27B) si se redistribuye o modifica.
- No se ha confirmado la longitud de contexto soportada, lo que puede afectar a tareas que requieran contextos largos.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/mradermacher/CorX3.8-27B-i1-GGUF)
- [Modelo base (referencia)](https://huggingface.co/Sigmandndnns/CorX3.8-27B)
- [Modelo GGUF estático (versión sin imatrix)](https://huggingface.co/mradermacher/CorX3.8-27B-GGUF) (mencionado en el README)
