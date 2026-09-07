# mradermacher/Doyle-Writer-GGUF

## Resumen

Doyle-Writer-GGUF es una version cuantizada en formato GGUF del modelo base Doyle-Writer, desarrollado por ChopinMaster8888 y convertido por el usuario mradermacher. El proposito de esta publicacion es ofrecer pesos comprimidos que puedan ejecutarse en herramientas como llama.cpp, Ollama o vLLM, facilitando la inferencia en CPU y GPU de consumo. El modelo base tiene 44.909.056 parametros totales, lo que lo situa en la categoria de modelos muy pequenos, y el repositorio ocupa 0,5 GB con todas las cuantizaciones disponibles.

No se dispone de informacion sobre la arquitectura exacta del modelo base, su longitud de contexto, ni sus datos de entrenamiento. El nombre "Doyle-Writer" sugiere una orientacion hacia la generacion de textos de ficcion, posiblemente inspirados en el estilo de Arthur Conan Doyle, pero esta interpretacion no esta confirmada por ninguna documentacion tecnica. La relevancia de esta publicacion radica en que ofrece un modelo ligero y cuantizado, util para prototipado y experimentacion en entornos con recursos limitados, aunque su rendimiento real no ha sido evaluado publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 44.909.056 |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q4_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura del modelo base Doyle-Writer. El unico dato tecnico disponible es que el modelo fue procesado con la libreria transformers y que los pesos originales estan en formato safetensors. La cuantizacion realizada por mradermacher sigue el esquema habitual de convertidor de HuggingFace a GGUF, generando multiples niveles de compresion. No existe informacion sobre el proceso de entrenamiento, el dataset utilizado, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- No se ha publicado ninguna documentacion que detalle las capacidades del modelo base.
- El nombre del modelo sugiere una posible especializacion en escritura de ficcion, pero no hay pruebas ni benchmarks que lo confirmen.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, vision o audio.
- El unico dato verificado es que el modelo esta etiquetado para el idioma ingles.

## Casos de uso

- No se dispone de informacion suficiente para describir casos de uso concretos y verificados.
- Por su tamano reducido y su formato GGUF, podria ejecutarse en entornos de prototipado rapido o en tareas simples de generacion de texto, siempre que se asuma que el modelo base tiene alguna capacidad de escritura.
- Sin datos de entrenamiento ni evaluacion, no es posible recomendar su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los archivos de cuantizacion tienen un tamano entre 0,1 GB y 0,2 GB, por lo que los requisitos de VRAM son minimos.
- El modelo puede ejecutarse en cualquier GPU de consumo actual, incluso en modelos integrados, asi como en CPU mediante llama.cpp.
- La cuantizacion Q4_K_S se recomienda por su equilibrio entre velocidad y calidad segun la model card.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria. El unico modelo relacionado que aparece en los resultados de busqueda es mradermacher/GRaPE-Mini-Writer-GGUF, pero no se conocen sus parametros ni su rendimiento, por lo que no se puede establecer una comparacion rigurosa.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de sesgos, alucinaciones o seguridad.
- La licencia del modelo no esta especificada, lo que supone un riesgo para cualquier uso comercial.
- El modelo tiene solo 44,9 millones de parametros, lo que limita enormemente su capacidad de razonamiento y generacion compleja.
- La falta de documentacion sobre el entrenamiento impide conocer sus limitaciones linguisticas o tematicas.
- No se recomienda su uso en sistemas de produccion sin una evaluacion previa exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Doyle-Writer-GGUF
- Modelo base: https://huggingface.co/ChopinMaster8888/Doyle-Writer
- Pagina de modelos de mradermacher: https://huggingface.co/mradermacher/models
