# mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un modelo de lenguaje de unos 9.000 millones de parámetros (8.953.803.264 según los safetensors reales), publicado por el usuario xtools-at y cuantizado en formato GGUF por mradermacher. Se trata de un modelo derivado de la familia Qwen3.5 con destilación de DeepSeek, orientado a razonamiento, matemáticas y STEM, con entrenamiento mediante SFT y aprendizaje por refuerzo (etiquetado con GSPO, una variante de optimización de políticas). La variante "heretic" indica un proceso de abliteración (decensura) aplicado sobre el modelo base, eliminando los mecanismos de rechazo habituales.

Esta ficha corresponde concretamente al repositorio de cuantizaciones dinámicas con imatrix (importancia de matriz) de mradermacher, que ofrece más de veinte variantes GGUF que van desde 2,8 GB (IQ1_S) hasta tamaños cercanos a los 10 GB, permitiendo ejecutar el modelo en hardware muy modesto. Los tags incluyen soporte de tool use, function calling y MTP (multi-token prediction), y la model card del cuantizador indica que se trata de un modelo de visión (los archivos mmproj están en el repositorio de cuantizaciones estáticas).

Es relevante porque combina un tamaño adecuado para GPUs de consumo con capacidades de razonamiento destiladas de modelos grandes, licencia Apache 2.0 sin restricciones comerciales y soporte multilingüe que incluye el castellano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (con destilación de DeepSeek, MTP); no disponible detalle exacto |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (variantes i1 con imatrix) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo), safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5, un transformer decoder denso de unos 9.000 millones de parámetros. Los tags del repositorio indican destilación desde DeepSeek (concretamente de una variante "V4-Pro"), lo que sugiere que el modelo ha sido entrenado mediante knowledge distillation sobre salidas de un modelo profesor más grande. La presencia del tag MTP (multi-token prediction) apunta a la técnica de predicción multi-token popularizada por DeepSeek para acelerar la generación.

Según los tags de entrenamiento (sft, rl, gspo), el pipeline incluye ajuste fino supervisado seguido de aprendizaje por refuerzo con GSPO (Group Sequence Policy Optimization), un método alternativo a GRPO. Los énfasis declarados son razonamiento, matemáticas y STEM. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición del dataset. La variante "heretic" indica que se ha aplicado un proceso de abliteración automatizado (herramienta Heretic) para eliminar los comportamientos de negativa del modelo. La model card del cuantizador menciona que es un modelo de visión, aunque no hay más detalles sobre el componente multimodal.

## Capacidades

- Generación de texto conversacional (pipeline text-generation-inference, formato conversacional)
- Razonamiento paso a paso (tag "reasoning")
- Resolución de problemas matemáticos y tareas STEM (tags "math", "stem")
- Tool calling / function calling (tags "tool-use", "function-calling")
- Predicción multi-token (MTP) para acelerar la generación
- Capacidades multilingües: inglés, chino, coreano, japonés, castellano y ruso
- Visión según la model card del cuantizador (mmproj en el repo estático), aunque sin detalle
- Sin filtros de seguridad: responde a consultas que otros modelos rechazan, por abliteración

## Casos de uso

- Asistentes conversacionales sin restricciones: al estar abliterado, el modelo no emite negativas por defecto, útil para entornos de investigación donde se quiere estudiar el comportamiento bruto del modelo sin capas de rechazo.
- Razonamiento y matemáticas en local: con las cuantizaciones IQ4_XS (5,3 GB) o Q4_K_S (5,5 GB) cabe en GPUs de consumo y portátiles, permitiendo resolver problemas de matemáticas y STEM sin conexión.
- Agentes con herramientas: el soporte de function calling permite integrarlo en pipelines de agentes que ejecutan código, consultan APIs o realizan tareas multi-paso, con la ventaja de ejecución local y sin coste por token.
- Generación de código en flujos de trabajo locales: puede integrarse con editores como Continue, Ollama o LM Studio para autocompletado y refactorización sin enviar código a servicios externos.
- Aplicaciones multilingües: soporte explícito de castellano, chino, japonés, coreano, ruso e inglés lo hace adecuado para chatbots y asistentes en varios idiomas.
- Investigación en alineación y seguridad: al tratarse de un modelo abliterado con pesos abiertos (Apache 2.0), sirve como base para estudiar el efecto de la decensura en la calidad del razonamiento y los riesgos asociados.
- Prototipado con hardware limitado: las cuantizaciones IQ1_S/IQ1_M (2,8-3 GB) permiten probar el modelo incluso en dispositivos sin GPU dedicada, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 3 GB (IQ1_S) hasta unos 10 GB (Q6_K) solo de pesos; con contexto ampliado, añadir 1-3 GB adicionales. La variante recomendada Q4_K_S ocupa 5,5 GB.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores para las cuantizaciones medias-altas con contexto amplio; cualquier GPU con 4-6 GB de VRAM para las variantes IQ1/IQ2.
- Cabe en GPUs de consumo: sí, todas las cuantizaciones caben en una RTX 3060 de 12 GB o superior; incluso en portátiles con GPU de 6 GB usando IQ2/IQ3.
- También es ejecutable en CPU pura (llama.cpp) con velocidades de unos pocos tokens por segundo en hardware moderno.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-inference (el repo está etiquetado para TGI); el modelo base en safetensors admite vLLM y transformers.
- Latencia y throughput: no disponible; el tag MTP sugiere aceleración de generación si el runtime lo soporta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 8,95 B | no disponible | Apache 2.0 | Abliterado, razonamiento destilado de DeepSeek, tool calling |
| Qwen3 8B (oficial) | 8,2 B | 128.000 (no disponible confirmado aquí) | Apache 2.0 | Modelo base de la familia, con modo thinking, censurado |
| DeepSeek-R1-Distill-Qwen-7B | 7,6 B | 128.000 | MIT | Destilación de razonamiento de DeepSeek-R1, sin abliterar |

Nota: los datos de contexto de los modelos comparados son orientativos; para este modelo no constan.

## Limitaciones y advertencias

- Al estar abliterado ("uncensored"), el modelo no rechaza contenidos dañinos: su uso conlleva riesgos legales y éticos significativos y no es adecuado para entornos de producción orientados a usuarios finales sin controles adicionales.
- La abliteración puede degradar la calidad general del modelo respecto al original (mayor tasa de alucinaciones o respuestas de menor calidad en algunos casos).
- Al tratarse de una cuantización de terceros (mradermacher) sobre un modelo derivado de terceros (xtools-at), no hay documentación oficial del entrenamiento: no se conocen tokens de entrenamiento, composición del dataset ni evaluaciones.
- Las cuantizaciones IQ1_S, IQ1_M e IQ2 son de calidad muy baja según el propio cuantizador; evitarlas para trabajo serio.
- El soporte de visión depende de los archivos mmproj del repositorio estático; su compatibilidad con runtimes concretos no está documentada.
- La licencia Apache 2.0 no impone restricciones comerciales, pero el comportamiento del modelo sin filtros puede incumplir políticas de plataformas de despliegue.
- La longitud de contexto no está documentada en este repositorio; consultar el modelo base antes de diseñar aplicaciones con documentos largos.

## Enlaces

- Repositorio de cuantizaciones i1 (esta ficha): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Página de descargas de mradermacher: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Referencia sobre uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, demo y blog: no disponible
