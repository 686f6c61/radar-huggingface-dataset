# mradermacher/Tess-4.5-594B-A17B-GGUF

## Resumen

Tess-4.5-594B-A17B-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Tess-4.5-594B-A17B, publicado originalmente por migtissera. El repositorio lo mantiene mradermacher, autor habitual de conversiones GGUF en Hugging Face, y su funcion es facilitar la ejecucion del modelo con llama.cpp y herramientas compatibles sin necesidad de realizar la conversion desde pesos originales.

El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 594B parametros totales y 17B parametros activos, aunque esta informacion no se confirma en la model card disponible. El unico dato de parametros verificable en el repositorio es el de los safetensors del modelo base (327.693.312 parametros), que resulta llamativamente bajo frente a la cifra que indica el nombre y no permite validar la arquitectura declarada.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas, y la model card solo contiene metadatos de la conversion (version de cuantizacion, tipos de cuantos generados y referencia al modelo base). Cualquier evaluacion de capacidades, rendimiento o idoneidad para produccion debe hacerse sobre el modelo original de migtissera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE, sin confirmar) |
| Parametros totales | 594B segun el nombre del modelo; 327.693.312 segun los safetensors del repo (dato contradictorio) |
| Parametros activos | 17B segun el nombre del modelo (no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El nombre del modelo indica "594B-A17B", patron habitual en modelos MoE donde la primera cifra corresponde a parametros totales y la segunda a parametros activos por token, pero no se aporta ninguna confirmacion tecnica.

La unica informacion tecnica disponible procede de los metadatos de conversion: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que la conversion se realizo desde pesos en formato Hugging Face con la herramienta de cuantizacion de llama.cpp. El repositorio ocupa 338,6 GB, coherente con un modelo de gran tamano cuantizado en multiples precisiones, aunque el dato de parametros de los safetensors (327 millones) no cuadra con esa cifra y sugiere que ese campo puede referirse a un componente auxiliar o estar mal reportado.

## Capacidades

- No se documentan capacidades especificas en la model card del repositorio.
- No hay informacion sobre soporte de tool calling o function calling.
- No hay informacion sobre capacidades de agente o razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues.
- No hay informacion sobre modos especiales (thinking, vision, audio).
- La unica capacidad verificable es la de ejecucion en formato GGUF mediante llama.cpp y herramientas compatibles.

## Casos de uso

- Evaluacion local de modelos de gran escala: las cuantizaciones Q2_K a Q8_0 permiten probar el modelo en hardware con distinta VRAM, desde configuraciones muy ajustadas hasta precision casi completa, sin partir de los pesos originales.
- Despliegue en llama.cpp: el formato GGUF es nativo de llama.cpp, por lo que el modelo puede cargarse directamente en este runtime para inferencia en CPU o GPU.
- Integracion en Ollama o LM Studio: ambos aceptan GGUF, lo que facilita pruebas rapidas en estaciones de trabajo sin infraestructura dedicada.
- Comparacion de precisiones: disponer de 12 variantes de cuantizacion permite medir la degradacion de calidad frente al coste de memoria en un mismo modelo.
- Investigacion sobre cuantizacion: util para estudiar el impacto de IQ4_XS frente a Q4_K_M o de Q2_K frente a Q3_K_L en un modelo de este tamano.
- Servido con llama.cpp server: expone una API compatible con OpenAI para prototipos internos, siempre que el hardware soporte la variante elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable, ya que el tamano real del modelo no esta confirmado. El repositorio completo ocupa 338,6 GB, pero incluye todas las cuantizaciones.
- Como referencia orientativa, un modelo de 594B parametros en Q4_K_M requeriria del orden de 340-360 GB de memoria, y en Q2_K del orden de 200-220 GB; estas cifras son estimaciones basadas en el nombre del modelo, no en datos verificados.
- GPU recomendadas: no disponible. Para un modelo de ese tamano haria falta un nodo multi-GPU (varias A100 80 GB o H100 80 GB); no cabe en una RTX 4090 de 24 GB en ninguna cuantizacion si se confirma el tamano de 594B.
- Opciones de despliegue: llama.cpp (nativo), Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma familia, tamano o tarea en la documentacion proporcionada.

## Limitaciones y advertencias

- La model card no declara licencia, por lo que no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo original de migtissera.
- No se declaran idiomas soportados ni sesgos conocidos.
- El riesgo de alucinacion no esta evaluado en la informacion disponible.
- Existe una contradiccion entre el nombre del modelo (594B) y los parametros reportados en safetensors (327 millones); conviene verificar el modelo base antes de invertir recursos.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en modelos grandes; se recomienda validar con evaluaciones propias.
- El consumo de almacenamiento y memoria es muy elevado (338,6 GB de repo), lo que exige infraestructura de disco y RAM/VRAM considerable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tess-4.5-594B-A17B-GGUF
- Modelo base: https://huggingface.co/migtissera/Tess-4.5-594B-A17B
