# AI4SGI/ExoMind-9B-Q8_0-GGUF

## Resumen

ExoMind es un sistema agéntico inspirado en la "mente extendida" desarrollado por el Shanghai Artificial Intelligence Laboratory (AI4SGI) para democratizar la inteligencia científica. El proyecto combina un modelo de lenguaje general, objetos de interacción especializados y procesos autónomos que permiten al modelo descubrir fuentes, contrastar evidencia, ejecutar verificaciones y actualizar su razonamiento en torno a cada problema. Se publica en dos tamaños: una variante densa de 9B parámetros y una variante de mezcla de expertos (MoE) de 35B con 3B activos.

Esta ficha cubre la cuantización Q8_0 del modelo ExoMind-9B, distribuida en formato GGUF para inferencia local con llama.cpp. El modelo base es multimodal (image-text-to-text), está construido sobre la arquitectura Qwen3.5 y soporta razonamiento científico, uso de herramientas y comportamiento agéntico. La cuantización Q8_0 ofrece un equilibrio entre fidelidad y accesibilidad, con un tamaño de descarga de 8,87 GiB para el modelo y 875 MiB para el proyector multimodal. Es relevante porque permite ejecutar un sistema de razonamiento científico con visión en hardware de consumo, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (con proyector de vision F16) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (segun comando de ejemplo de llama-server) |
| Tipos de cuantizacion | Q8_0 (este repo); tambien disponibles Q4_K_M y F16 en repos separados |
| Idiomas soportados | No disponible en la model card; el modelo base ExoMind-9B podria soportar ingles y chino, pero no se confirma |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) + proyector multimodal en F16 GGUF |

## Arquitectura y entrenamiento

ExoMind-9B es un modelo denso de 8,95B parámetros basado en la arquitectura Qwen3.5, con capacidades multimodales que integran un proyector de visión en F16 para procesar entradas de imagen junto con texto. El sistema ExoMind en su conjunto incorpora tres pilares: ingeniería de datos sistemática, un framework de interacción científica y una estrategia de entrenamiento orientada a razonamiento y verificación. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO para esta variante de 9B. La model card indica que los archivos GGUF fueron suministrados como artefactos existentes y que no se conservan los comandos originales de conversión y cuantización, por lo que no se garantiza reproducibilidad bit a bit del pipeline de conversión.

## Capacidades

- Generacion de texto y razonamiento cientifico: disenado para tareas de investigacion, descubrimiento de fuentes y verificacion de evidencia.
- Multimodal: acepta entradas de imagen y texto (image-text-to-text) mediante el proyector de vision incluido.
- Uso de herramientas (tool calling): soporta integracion con funciones externas para ejecutar acciones y consultar recursos.
- Comportamiento agente: capaz de ejecutar procesos autonomos de multiples pasos, actualizando su razonamiento en funcion de los resultados obtenidos.
- Conversacional: apto para dialogos multi-turno con contexto largo (32K tokens).
- Multilingue: no confirmado para esta variante; el modelo base podria cubrir ingles y chino, pero no hay datos oficiales.

## Casos de uso

- Asistente de investigacion cientifica: el modelo puede ayudar a recopilar literatura, resumir articulos y contrastar hipotesis, aprovechando su capacidad de razonamiento y verificacion de evidencia.
- Analisis de documentos con imagenes: gracias al proyector multimodal, puede procesar graficos, diagramas y figuras cientificas junto con texto, util en revision de papers o informes tecnicos.
- Agente autonomo de laboratorio: integrado con herramientas de ejecucion de experimentos o consulta de bases de datos, puede planificar pasos, ejecutarlos y ajustar su estrategia segun los resultados.
- Atencion al cliente tecnica especializada: con 32K tokens de contexto, puede gestionar conversaciones largas y detalladas sobre productos cientificos o tecnicos, manteniendo el hilo de la interaccion.
- Generacion de informes y documentacion tecnica: redacta resumenes, memorandos y explicaciones de resultados experimentales con un enfoque riguroso.
- Educacion y divulgacion cientifica: puede explicar conceptos complejos, responder preguntas de estudiantes y generar material didactico con apoyo visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la variante ExoMind-9B. La model card advierte explicitamente que la tabla de benchmarks principal del proyecto corresponde al sistema ExoMind de 35B-A3B y no debe atribuirse a esta version de 9B. Esta cuantizacion Q8_0 no tiene puntuaciones separadas. Los datos de evaluacion completos estan disponibles en el explorador de evaluacion del proyecto, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 8,87 GiB y el proyector 875 MiB, por lo que se necesitan aproximadamente 10-11 GB de VRAM para cargar ambos con contexto de 32K tokens. Con cuantizacion Q4_K_M (no incluida en este repo) el requisito seria menor.
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM, como RTX 4070 Ti, RTX 4080, RTX 4090, o GPUs profesionales como A10, A100 o L4. En una RTX 4090 (24 GB) cabria sin problemas.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer de gama alta y media-alta con al menos 12 GB.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF. Para el modelo base en safetensors se podria usar vLLM o TGI, pero este repo es exclusivamente GGUF.
- Latencia y throughput: no disponibles. Dependera del hardware y del tamaño de contexto; en una RTX 4090 se espera una generacion fluida para un modelo de 9B en Q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| ExoMind-9B (Q8_0) | 8,95B | 32K | Si | Apache 2.0 | GGUF |
| Qwen2.5-VL-7B | 7,6B | 32K | Si | Apache 2.0 | Safetensors, GGUF |
| Llama-3.2-11B-Vision | 11B | 128K | Si | Llama 3.2 Community License | Safetensors, GGUF |
| ExoMind-35B-A3B (MoE) | 35B total, 3B activos | 32K (estimado) | Si | Apache 2.0 | Safetensors, GGUF |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, etc.) para ExoMind-9B, por lo que la comparacion se limita a especificaciones. La variante 35B-A3B del propio proyecto es la que reporta benchmarks, pero no se incluyen aqui por no corresponder a este modelo.

## Limitaciones y advertencias

- Sin benchmarks propios: no hay resultados de evaluacion publicados para ExoMind-9B, lo que impide validar su rendimiento real frente a alternativas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion incorrecta o inventada, especialmente en tareas cientificas donde la precision es critica.
- Sesgos desconocidos: no se han publicado analisis de sesgos para esta variante; el entrenamiento sobre datos cientificos podria introducir sesgos hacia ciertas disciplinas o metodologias.
- Limitaciones de contexto: la ventana de 32K tokens, aunque amplia, es inferior a la de otros modelos como Llama-3.2 (128K), lo que puede limitar el procesamiento de documentos muy extensos.
- Reproducibilidad de la cuantizacion: los archivos GGUF se publican sin los comandos originales de conversion, por lo que no se puede verificar el proceso exacto de cuantizacion.
- Restricciones de contenido: aunque la licencia del modelo es Apache 2.0, los textos del informe tecnico, figuras y activos de marca estan sujetos a los "ExoMind Research Content and Brand Terms", lo que puede afectar su reutilizacion en productos comerciales.
- Idiomas no confirmados: no se garantiza soporte multilingue mas alla de lo que ofrezca el modelo base Qwen3.5.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/AI4SGI/ExoMind-9B-Q8_0-GGUF
- Modelo base ExoMind-9B: https://huggingface.co/AI4SGI/ExoMind-9B
- Modelo ExoMind 35B-A3B: https://huggingface.co/AI4SGI/ExoMind
- Pagina del proyecto: https://ai4sgi.github.io/ExoMind/
- Repositorio GitHub: https://github.com/AI4SGI/ExoMind
- Informe tecnico (PDF): https://github.com/AI4SGI/ExoMind/blob/main/Paper.pdf
- ModelScope (variante 35B): https://modelscope.cn/models/AI4SGI/ExoMind
- ModelScope (variante 9B Q8_0): https://modelscope.cn/models/AI4SGI/ExoMind-9B-Q8_0-GGUF
