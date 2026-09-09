# mradermacher/EdiTikZ-4B-RL-GGUF

## Resumen

EdiTikZ-4B-RL-GGUF es la version cuantizada en formato GGUF del modelo `nllg/EdiTikZ-4B-RL`, publicada por el usuario `mradermacher`. El modelo original es un Transformer multimodal orientado a la generacion de codigo TikZ y LaTeX para figuras cientificas, asi como a la edicion de imagenes. La cuantizacion permite ejecutarlo en hardware mas modesto, manteniendo los pesos en 16 bits, 8 bits o menos.

El modelo tiene aproximadamente 4.841.450.496 parametros, lo que lo situa en la gama de 4B. Segun la informacion disponible, solo se soporta el idioma ingles y la licencia es Apache-2.0, lo que permite uso comercial. No se han proporcionado datos sobre la longitud de contexto ni la arquitectura detallada, por lo que gran parte de sus especificaciones no estan confirmadas en la informacion suministrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (no se detalla configuracion; no disponible) |
| Parametros totales | 4.841.450.496 (4.84B) |
| Parametros activos | No aplica: no se ha indicado arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas mmproj en f16 y Q8_0 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card no incluye una descripcion tecnica del modelo. Los metadatos de Hugging Face indican que se trata de un modelo con la libreria `transformers` y etiquetas de `multimodal`, `tikz`, `latex`, `code-generation`, `scientific-figures` e `image-editing`. Se infiere que es un Transformer, pero no se especifican capas, dimensiones ni variantes de atencion.

Tampoco se disponen de datos sobre los datos de entrenamiento, numero de tokens o procesos de RLHF/DPO. El sufijo `RL` podria sugerir una fase de aprendizaje por refuerzo, pero no hay confirmacion en la informacion disponible. La unica referencia al entrenamiento es el modelo base `nllg/EdiTikZ-4B-RL`, del cual esta version es una cuantizacion estatica.

## Capacidades

- Generacion de codigo TikZ para figuras cientificas y diagramas.
- Generacion de codigo LaTeX, especialmente para documentacion tecnica y academica.
- Edicion de imagenes mediante instrucciones en lenguaje natural, gracias al componente multimodal (`mmproj`).
- Comprension de instrucciones en ingles.
- Compatibilidad con el formato GGUF, lo que permite su uso en llamadas a `llama.cpp`, Ollama y otros ejecutores de GGUF.
- No se ha documentado soporte de tool calling, funcionamiento como agente ni capacidades de razonamiento complejo.

## Casos de uso

- Generacion de figuras para articulos cientificos: el modelo produce bloques de codigo TikZ que se pueden insertar directamente en documentos LaTeX, lo que agiliza la creacion de diagramas vectoriales.
- Edicion de figuras existentes: gracias al modulo multimodal, se puede solicitar la modificacion de una imagen o el ajuste de un diagrama mediante una instruccion en lenguaje natural.
- Automatizacion de informes y tesis: integrado en un pipeline de generacion de documentos, permite anadir figuras de forma automatica a partir de descripciones de resultados.
- Material didactico de matematicas y fisica: puede generar ilustraciones para apuntes, problemas y ejercicios en formato vectorial.
- Herramientas de publicacion academica: el modelo puede ayudar a investigadores a preparar graficos de alta calidad listos para compilar con LaTeX.
- Asistentes de programacion para TikZ: como modelo de 4B, puede ejecutarse en local para autocompletar o sugerir comandos TikZ dentro de un editor o IDE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se aportan valores de MMLU, HumanEval, GSM8K ni otras metricas comparativas. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamano de los ficheros, la cuantizacion `Q4_K_M` requiere unos 3.2 GB para los pesos, mas el fichero `mmproj` (0.5-0.8 GB) y la memoria para contexto, por lo que se recomienda una GPU con 8 GB.
- Para `Q8_0`, se necesitan aproximadamente 5.3 GB de pesos, por lo que se necesitan 10-12 GB de VRAM si se usa el `mmproj`.
- Para `f16`, se requieren 9.8 GB de pesos, lo que hace recomendable una GPU con 16 GB o mas.
- GPU recomendadas: RTX 3060 12GB o similares para Q4/Q5; RTX 4090 para f16.
- Puede ejecutarse en GPUs de consumo con 8 GB usando cuantizaciones Q4 o inferiores, siempre que el contexto sea moderado.
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp y cualquier framework compatible con GGUF. Para usar la version safetensors original, se puede emplear Transformers (no se confirma compatibilidad con vLLM en la informacion suministrada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion facilitada no incluye modelos de referencia ni datos comparativos de la misma categoria. No se han identificado alternativas directamente comparables en los resultados de busqueda.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de rendimiento, por lo que su calidad real en tareas de generacion tikz, latex o edicion de imagenes no esta verificada.
- El modelo esta entrenado principalmente para el idioma ingles; su comportamiento con otros idiomas es desconocido.
- Existe riesgo de alucinacion en el codigo generado: puede producir sintaxis TikZ incorrecta o figuras que no compilen.
- Las cuantizaciones de bajo bit (Q2_K, Q3_K) pueden degradar notablemente la calidad de salida.
- El componente multimodal requiere incluir el fichero `mmproj` en la carga; sin el, la parte de imagen no funcionara.
- No se ha documentado soporte para tool calling, agentes ni funciones externas, por lo que no se puede asumir esa capacidad.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad del modelo recae en el usuario y no se ofrecen garantias de rendimiento.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/mradermacher/EdiTikZ-4B-RL-GGUF
- Modelo base original: https://huggingface.co/nllg/EdiTikZ-4B-RL
- Pagina de solicitudes de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
