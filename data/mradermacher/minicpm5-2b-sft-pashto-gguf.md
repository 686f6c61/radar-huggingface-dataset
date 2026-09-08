# mradermacher/MiniCPM5-2B-SFT-Pashto-GGUF

## Resumen

El modelo `mradermacher/MiniCPM5-2B-SFT-Pashto-GGUF` es una cuantización en formato GGUF del modelo `nassimjp/MiniCPM5-2B-SFT-Pashto`, un fine-tuning en pashto del MiniCPM5-2B-SFT de OpenBMB. El modelo base es un Transformer denso de aproximadamente 2.5 mil millones de parámetros, diseñado para despliegue local y escenarios con recursos limitados. Esta versión GGUF, creada por mradermacher, permite ejecutar el modelo en CPU y GPU consumer mediante llama.cpp y herramientas compatibles, con archivos que van desde 1.1 GB (cuantización Q2_K) hasta 5.1 GB (precisión f16). El repositorio ofrece 12 niveles de cuantización para adaptarse a distintos requisitos de memoria y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2.516.944.896 (~2.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun metadata; el nombre del modelo base sugiere pashto) |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B-SFT es un Transformer denso de 2B parametros desarrollado por OpenBMB, siguiendo la misma receta de entrenamiento que MiniCPM5-1B. Esta arquitectura esta pensada para despliegue en dispositivos locales y escenarios con recursos limitados, alcanzando el estado del arte en su clase segun la documentacion publicada. El modelo que nos ocupa es un fine-tuning en pashto realizado por nassimjp sobre ese modelo base, y posteriormente cuantizado a formato GGUF por mradermacher. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles segun la metadata del repositorio, aunque el nombre del modelo base indica un fine-tuning especifico en pashto.
- Compatible con herramientas que soportan formato GGUF, como llama.cpp, Ollama y LM Studio.
- No se dispone de informacion sobre capacidades de tool calling, agentes, razonamiento multi-step, vision o audio en la documentacion proporcionada.

## Casos de uso

- Despliegue local en dispositivos con recursos limitados: gracias a su tamaño de 2.5B y a las cuantizaciones de hasta 1.1 GB, puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp, lo que lo hace adecuado para entornos de edge computing.
- Adaptacion a idiomas de bajos recursos: el modelo base ya esta afinado en pashto, por lo que puede utilizarse como punto de partida para tareas de procesamiento de lenguaje natural en este idioma.
- Prototipado rapido de aplicaciones conversacionales: el formato GGUF permite integrarlo facilmente en aplicaciones que usan Ollama o llama.cpp como backend, reduciendo el tiempo de puesta en marcha.
- Evaluacion de cuantizaciones: los 12 archivos GGUF permiten probar distintos niveles de compresion y elegir el mejor equilibrio entre calidad y consumo de memoria.
- Investigacion en adaptacion linguistica: el modelo puede servir como base para estudiar el efecto del fine-tuning en pashto sobre un modelo pequeño y comparar su rendimiento con modelos multilingues de tamaño similar.
- Inferencia en CPU: al estar en formato GGUF, puede ejecutarse en CPU con cuantizaciones pequeñas, lo que lo hace util en servidores sin aceleracion por GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia es que el modelo base MiniCPM5-2B-SFT alcanza el estado del arte en la clase de 2B, pero sin datos numericos especificos.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamaño del archivo GGUF, se necesitan aproximadamente 1.2 GB para Q2_K, 1.7 GB para Q4_K_S, 2.3 GB para Q6_K y 2.9 GB para Q8_0, mas overhead de KV cache y buffers (tipicamente 1-2 GB adicionales). Estas cifras son estimaciones orientativas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones mas pequeñas. Para las mas grandes (Q8_0, f16) se recomienda 6-8 GB.
- Si cabe en consumer GPU: si, en GPUs con 4 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier framework compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada. Por tanto, no se puede realizar una comparativa numerica fiable. Se indica no disponible.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones de contexto.
- La licencia no esta especificada, por lo que el uso comercial no esta garantizado.
- El modelo esta etiquetado como en ingles segun la metadata, a pesar del nombre que sugiere pashto; esto puede indicar una mezcla de idiomas o una etiqueta incorrecta.
- El repositorio no tiene descargas ni likes, lo que sugiere que es un modelo reciente o poco probado.
- No hay informacion sobre el dataset de fine-tuning en pashto, por lo que la calidad de la adaptacion linguistica es desconocida.
- Los archivos GGUF multiparte pueden requerir concatenacion manual si se descargan en partes.

## Enlaces

- Repo HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/MiniCPM5-2B-SFT-Pashto-GGUF
- Modelo base (safetensors): https://huggingface.co/nassimjp/MiniCPM5-2B-SFT-Pashto
- MiniCPM5-2B-SFT original (OpenBMB): https://huggingface.co/openbmb/MiniCPM5-2B-SFT
- Repo GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
