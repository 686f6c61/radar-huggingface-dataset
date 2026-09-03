# mradermacher/Xenon-26B-A4B-safetensors-i1-GGUF

## Resumen

Xenon-26B-A4B es un modelo de lenguaje de gran tamaño con arquitectura de mezcla de expertos (MoE) que combina 26 000 millones de parámetros totales con solo 4 000 millones de parámetros activos por token. El nombre "A4B" indica precisamente esa proporción, lo que permite un equilibrio entre capacidad y eficiencia computacional. El modelo ha sido desarrollado por el equipo 26B-Suite y posteriormente cuantizado a formato GGUF por mradermacher para su uso en entornos de inferencia local con llama.cpp y herramientas compatibles.

Se trata de un modelo multimodal de visión y lenguaje, según indica la model card del repositorio de cuantización, aunque no se especifican detalles adicionales sobre el encoder visual ni el proceso de entrenamiento. La versión cuantizada aquí descrita incluye un archivo imatrix para optimizar la calidad de las cuantizaciones y una amplia gama de formatos GGUF que van desde 8,4 GB hasta 22,7 GB, lo que permite adaptarlo a distintos niveles de hardware. El modelo está orientado a conversación y uso general en inglés.

La relevancia de esta publicación radica en que ofrece una opción de modelo MoE de 26B con solo 4B activos, lo que reduce significativamente la carga computacional en inferencia en comparación con un modelo denso del mismo tamaño, manteniendo una calidad razonable en tareas de razonamiento y generación de texto. Al estar disponible en GGUF, puede ejecutarse en GPUs de consumo con cuantizaciones agresivas o en GPUs profesionales con cuantizaciones más altas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con componentes de visión y lenguaje |
| Parametros totales | 25 233 142 046 (25,2B) |
| Parametros activos | 4 000 000 000 (4B, inferido del nombre "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado), safetensors (original) |

## Arquitectura y entrenamiento

El modelo Xenon-26B-A4B emplea una arquitectura de mezcla de expertos (MoE), como se deduce del sufijo "A4B" en su nombre, que indica que de los 26 000 millones de parámetros totales solo se activan 4 000 millones por cada token procesado. Esta característica reduce el coste computacional en inferencia y permite un mayor rendimiento por parámetro activo en comparación con modelos densos equivalentes. La model card del repositorio de cuantización indica que se trata de un modelo de visión, por lo que incorpora un codificador visual que procesa imágenes además de texto, aunque no se proporcionan detalles sobre la arquitectura exacta del encoder ni sobre cómo se fusionan las modalidades.

No se dispone de información sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se conocen innovaciones técnicas específicas más allá de la propia arquitectura MoE y la cuantización con imatrix. La versión GGUF aquí documentada es una cuantización del modelo original en safetensors, realizada con la herramienta de mradermacher, que incluye un archivo imatrix para mejorar la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto y conversación en inglés.
- Razonamiento y respuesta a preguntas de conocimiento general.
- Procesamiento de imágenes (capacidad de visión, aunque no se detalla el alcance exacto).
- Soporte para inferencia local mediante GGUF con llama.cpp, Ollama, LM Studio y otras herramientas compatibles.
- Posibilidad de tool calling y uso como agente, aunque no está confirmado explícitamente en la documentación disponible.
- Capacidad de ajuste a diferentes niveles de calidad y memoria mediante la selección de cuantizaciones.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede desplegarse en un equipo de sobremesa con una GPU de 12–16 GB usando cuantizaciones como Q4_K_M (16,9 GB) para ofrecer un asistente personal que responda preguntas y mantenga diálogos en inglés sin conexión a internet.
- Análisis de imágenes en entornos con privacidad estricta: gracias a su componente de visión, puede utilizarse para describir o interpretar imágenes en sectores como sanidad o legal donde los datos no pueden enviarse a servicios en la nube.
- Prototipado rápido de aplicaciones de IA generativa: los desarrolladores pueden integrar el modelo en pipelines de Python usando llama-cpp-python o a través de servidores OpenAI-compatibles como llama.cpp server o LocalAI, para validar ideas antes de migrar a modelos más grandes.
- Generación de código y asistencia en programación: aunque no hay benchmarks específicos, un modelo de 4B activos puede asistir en tareas de autocompletado y revisión de código en inglés, especialmente cuando se ejecuta en una GPU de gama media.
- Educación y tutoría: puede servir como tutor virtual para estudiantes de habla inglesa, explicando conceptos de ciencias, matemáticas o historia, con la ventaja de poder adjuntar imágenes de diagramas o problemas.
- Investigación en eficiencia de modelos MoE: al ser un modelo con 25,2B parámetros totales pero solo 4B activos, resulta útil para estudiar el equilibrio entre calidad y eficiencia en arquitecturas de mezcla de expertos, pudiendo compararse con modelos densos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, el archivo GGUF ocupa entre 8,4 GB (i1-IQ1_S) y 22,7 GB (i1-Q6_K). A esto hay que sumar el overhead de contexto y cálculo, por lo que se recomienda al menos 2–4 GB adicionales de VRAM.
- GPU recomendadas:
  - Para cuantizaciones bajas (IQ1, IQ2, Q2): tarjetas con 8–12 GB de VRAM, como NVIDIA RTX 3060/4060 o AMD RX 6600/7600.
  - Para cuantizaciones medias (Q3, Q4): tarjetas con 16–24 GB, como NVIDIA RTX 4080/4090 o A4000/A5000.
  - Para cuantizaciones altas (Q5, Q6): tarjetas profesionales con 24 GB o más, como NVIDIA A100 40GB o RTX 6000 Ada.
- El modelo cabe en GPUs de consumo con cuantizaciones de 16 GB o menos, por ejemplo la RTX 4080 con Q4_K_M.
- Opciones de despliegue: llama.cpp (servidor OpenAI-compatible), Ollama, LM Studio, LocalAI, text-generation-webui (oobabooga), y cualquier herramienta que soporte GGUF.
- Latencia y throughput: no se han publicado datos específicos. Al ser un MoE con 4B activos, la velocidad de generación dependerá del ancho de banda de memoria de la GPU y de la cuantización, pero en una RTX 4090 se esperan velocidades de decodificación superiores a 50 tokens por segundo con Q4_K_M, aunque esto es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo pertenece a la categoría de MoE con ~26B parámetros totales y 4B activos, similar en concepto a otros como Mixtral 8x7B (47B totales, 13B activos) o Qwen1.5-MoE-A2.7B (14B totales, 2.7B activos), pero no se conocen datos de rendimiento ni especificaciones detalladas de Xenon-26B-A4B que permitan una comparación objetiva.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia del modelo, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar con el autor original (26B-Suite) antes de utilizarlo en producción.
- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas no está garantizado.
- Al ser una cuantización GGUF, puede haber una degradación de calidad respecto al modelo original en safetensors, especialmente en cuantizaciones muy bajas (IQ1, IQ2).
- No se han publicado resultados de benchmarks ni evaluaciones de sesgos, por lo que se desconoce su comportamiento en tareas sensibles o su propensión a alucinaciones.
- La capacidad de visión está indicada en la model card, pero no se detalla su alcance ni su calidad; es posible que la versión GGUF no incluya el proyector multimodal (mmproj) en este repositorio, ya que se menciona que estos archivos se encuentran en el repositorio estático.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación muy reciente o poco conocida, sin validación por parte de la comunidad.
- Algunas cuantizaciones de muy baja precisión (IQ1_S, IQ1_M) producen una calidad muy reducida y solo se recomiendan para pruebas extremas.

## Enlaces

- Repositorio HuggingFace de la cuantización GGUF: https://huggingface.co/mradermacher/Xenon-26B-A4B-safetensors-i1-GGUF
- Modelo base en safetensors: https://huggingface.co/26B-Suite/Xenon-26B-A4B-safetensors
- Repositorio estático de cuantizaciones (incluye mmproj): https://huggingface.co/mradermacher/Xenon-26B-A4B-safetensors-GGUF
- Página de descargas y visión general: https://hf.tst.eu/model#Xenon-26B-A4B-safetensors-i1-GGUF
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
