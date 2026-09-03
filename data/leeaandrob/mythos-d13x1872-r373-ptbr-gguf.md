# leeaandrob/mythos-d13x1872-r373-ptbr-gguf

## Resumen

Mythos d13x1872-r373 PT-BR es un modelo de lenguaje pequeño, entrenado desde cero, especializado en portugués de Brasil (pt-BR). Lo desarrolla Leandro Barbosa (usuario `leeaandrob` en Hugging Face) y se distribuye en formato GGUF con cuantización ternaria Q2_0. El modelo está pensado para integrarse en sistemas de generación aumentada por recuperación (RAG), donde los pasajes recuperados aportan los hechos y el modelo se encarga de producir texto fluido en portugués. No está diseñado para funcionar como fuente de conocimiento autónoma.

Con 932,6 millones de parámetros y una configuración denominada `d13` con `n_embd` 1872, el modelo es compacto y puede ejecutarse en hardware modesto. Se sirve mediante el motor NeuroGrid, que admite backends CUDA, CPU y Metal. El repositorio incluye el archivo GGUF (1,65 GB) y un tokenizer separado en JSON, necesario para la inferencia. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia actual radica en su uso como generador alternativo en un stack RAG de jurisprudencia del Superior Tribunal de Justicia de Brasil (STJ), donde compite con un modelo de 27B parámetros sobre el mismo contexto recuperado. Su tamaño reducido y cuantización agresiva lo hacen atractivo para despliegues con recursos limitados, aunque a costa de una capacidad factual prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (configuracion `d13`, `n_embd` 1872) |
| Parametros totales | 932.646.292 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0 ternaria |
| Idiomas soportados | Portugues (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `mythos_d13_final_q2_0.gguf`, 1,65 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con una configuración interna denominada `d13` y dimensión de embedding 1872. No se especifican el número de capas ni el mecanismo de atención, pero por el tamaño total (932M parámetros) se trata de un modelo compacto. El entrenamiento se realizó desde cero, sin partir de pesos preentrenados existentes. La model card reporta una pérdida en bits por token (`val_bpb`) de 1,173 en el paso 13800 del preentrenamiento, que mejora a 0,709 tras el ajuste fino supervisado (SFT) en el paso 213. No se detallan los datos de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

La cuantización ternaria Q2_0 reduce los pesos a valores de 2 bits, lo que explica el tamaño reducido del archivo GGUF (1,65 GB) en relación con los parámetros totales. El tokenizer se proporciona por separado en formato JSON, ya que el GGUF no lo incluye. El motor de inferencia es NeuroGrid, que soporta backends CUDA, CPU y Metal.

## Capacidades

- Generación de texto en portugués de Brasil con fluidez gramatical y sintáctica.
- Integración en sistemas RAG: el modelo produce lenguaje natural a partir de pasajes recuperados, sin necesidad de conocimiento interno.
- Ejecución en múltiples backends (CUDA, CPU, Metal) gracias al motor NeuroGrid.
- Compatible con el formato GGUF, lo que permite su uso con herramientas que soporten este estándar (por ejemplo, llama.cpp, aunque no está confirmado explícitamente).
- No dispone de capacidades de tool calling, razonamiento multi-paso, visión ni audio.
- No tiene capacidad de recuperación factual: el autor advierte que producirá portugués fluido pero incorrecto si se usa como fuente de conocimiento.

## Casos de uso

- Generación de respuestas en portugués en un sistema RAG de jurisprudencia: el modelo se sitúa tras una capa de recuperación que extrae pasajes relevantes de sentencias del STJ. El modelo redacta la respuesta final en lenguaje natural, apoyándose en el contexto recuperado. Es adecuado porque su tamaño reducido permite desplegarlo en entornos con pocos recursos, y su fluidez en pt-BR es suficiente para tareas de redacción.
- Comparación de generadores en pipelines RAG: en el stack `mythos-stj`, este modelo actúa como generador alternativo frente a un modelo de 27B parámetros. Sirve para evaluar el equilibrio entre calidad y coste computacional en entornos de producción.
- Prototipado rápido de asistentes conversacionales en portugués: gracias a su pequeño tamaño y a la cuantización Q2_0, puede ejecutarse en una GPU de gama media o incluso en CPU, lo que facilita pruebas de concepto sin inversión en hardware.
- Generación de resúmenes de documentos legales: con pasajes recuperados de textos normativos, el modelo puede producir resúmenes en portugués, aunque la fidelidad factual depende de la calidad de la recuperación.
- Tareas de completado de texto en portugués para entornos con restricciones de memoria: su peso de 1,65 GB en GGUF permite cargarlo en dispositivos con poca VRAM, como tarjetas gráficas de 2 GB o menos.
- Experimentación académica con cuantización ternaria: el modelo sirve como caso de estudio para analizar el impacto de la cuantización Q2_0 en la calidad de generación de un transformer pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida en bits por token (`val_bpb`) durante el entrenamiento: 1,173 en preentrenamiento y 0,709 tras SFT. No hay comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB, dado el tamaño del archivo GGUF (1,65 GB) y la cuantización ternaria. En CPU, la memoria RAM necesaria sería similar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060 o superiores. También compatible con Apple Silicon mediante backend Metal.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna de gama de entrada.
- Opciones de despliegue: motor NeuroGrid (`mythos-serve`) con backends `cuda`, `cpu` y `metal`. Dado el formato GGUF, es probable que también funcione con llama.cpp u Ollama, aunque no está confirmado en la documentación.
- Latencia y throughput: no se proporcionan datos. Por el tamaño reducido, se espera una latencia baja en GPU y aceptable en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de tamaño similar. El modelo no tiene benchmarks publicados y su arquitectura interna (`d13`) no es estándar. Se puede señalar que, en el contexto del stack RAG del STJ, se compara con un modelo de 27B parámetros, pero no se ofrecen métricas de rendimiento relativas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo no tiene capacidad de conocimiento factual: el autor advierte explícitamente que producirá portugués fluido pero incorrecto si se usa como fuente de información autónoma.
- Su tamaño reducido limita la complejidad de las tareas que puede abordar; no es adecuado para razonamiento avanzado, matemáticas o generación de código.
- La cuantización ternaria Q2_0 puede degradar la calidad de la generación en comparación con cuantizaciones de mayor precisión, aunque no se han publicado evaluaciones al respecto.
- La longitud de contexto no está documentada, lo que supone una incertidumbre para aplicaciones que requieran ventanas largas.
- El tokenizer se distribuye por separado; si no se incluye en el despliegue, la inferencia fallará.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece sin garantías y con limitaciones conocidas de fiabilidad.
- No se han publicado resultados de benchmarks ni evaluaciones de sesgos, por lo que se desconoce su comportamiento en escenarios sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/leeaandrob/mythos-d13x1872-r373-ptbr-gguf
- Perfil del autor en Hugging Face: https://huggingface.co/leeaandrob
- Datasets del autor: https://huggingface.co/leeaandrob/datasets
