# mradermacher/LFM2.5-350M-Uncensored-GGUF

## Resumen

LFM2.5-350M-Uncensored-GGUF es una cuantización en formato GGUF del modelo LFM2.5-350M-Uncensored, realizada por mradermacher, un autor conocido por publicar versiones cuantizadas de modelos open source. El modelo base, desarrollado por naimulislam999, es una variante "uncensored" de la familia LFM2.5, obtenida mediante técnicas de ablación direccional (directional ablation) y abliteration, que eliminan los mecanismos de rechazo y censura del modelo original. Con aproximadamente 354 millones de parámetros, se trata de un modelo pequeño diseñado para ejecución local en hardware modesto, con licencia Apache-2.0 que permite uso comercial.

La relevancia de este modelo radica en su tamaño reducido y su naturaleza sin censura, lo que lo hace atractivo para desarrolladores e investigadores que necesitan un modelo ligero para experimentación, generación de texto creativo o pruebas de técnicas de interpretabilidad mecánica. Al estar disponible en múltiples cuantizaciones GGUF, puede ejecutarse en CPU o GPU de gama baja mediante llama.cpp, Ollama u otros motores compatibles. Sin embargo, al ser un modelo de 350M, sus capacidades son limitadas en comparación con modelos de mayor escala, y no se dispone de información detallada sobre su arquitectura o entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura del modelo base LFM2.5-350M. El nombre sugiere que podria pertenecer a la familia Liquid Foundation Model de Liquid AI, pero no hay confirmacion en la documentacion disponible. Los tags del repositorio indican que el modelo fue sometido a tecnicas de abliteration y directional ablation para eliminar el rechazo a contenido no deseado, lo que da como resultado una version "uncensored". No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. La cuantizacion GGUF fue realizada por mradermacher, quien genero multiples versiones con diferentes niveles de precision.

## Capacidades

- Generacion de texto en ingles, con capacidades basicas de continuacion y completado de texto.
- Al ser un modelo "uncensored", no aplica filtros de contenido ni rechazo a peticiones que otros modelos bloquearian.
- No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso, vision o audio.
- Capacidades multilingues limitadas al ingles, segun la etiqueta de idioma.
- No se ha documentado un modo de pensamiento (thinking mode) ni capacidades especiales adicionales.

## Casos de uso

- Experimentacion con tecnicas de interpretabilidad mecanica: al ser un modelo pequeno y sin censura, es util para estudiar como la ablacion direccional afecta al comportamiento interno del modelo, especialmente en el contexto de investigacion sobre seguridad y alineacion.
- Generacion de texto creativo sin restricciones: escritores y creadores pueden usarlo para generar narrativas, dialogos o contenido literario sin temor a que el modelo rechace temas controvertidos o adultos.
- Pruebas de motores de inferencia local: su tamano reducido permite validar configuraciones de llama.cpp, Ollama o vLLM en hardware modesto, sirviendo como banco de pruebas para pipelines de despliegue.
- Educacion y aprendizaje sobre modelos de lenguaje: estudiantes e investigadores pueden analizar el comportamiento de un modelo de 350M con licencia permisiva, comparandolo con versiones censuradas del mismo tamano.
- Generacion de datos sinteticos para entrenamiento: el modelo puede usarse para crear datasets de texto en ingles, aunque su calidad limitada requiere curacion posterior.
- Desarrollo de prototipos de chatbots o asistentes conversacionales simples: su naturaleza sin censura permite explorar interacciones sin filtros, aunque la calidad de las respuestas sera inferior a la de modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su version base.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF pesan entre 0,3 GB (Q2_K) y 0,8 GB (f16), por lo que caben en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo integradas, puede ejecutar este modelo. Una RTX 3060 o superior ofrecera latencias muy bajas.
- Compatibilidad con consumer GPU: si, es totalmente viable en GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier motor compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamano del modelo, se espera una generacion de decenas de tokens por segundo incluso en CPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo base LFM2.5-350M no tiene una ficha publica detallada, y no se han encontrado benchmarks que permitan contrastarlo con alternativas como TinyLlama, Qwen2-0.5B o SmolLM2-360M. Se recomienda consultar el repositorio original para obtener datos adicionales.

## Limitaciones y advertencias

- Al ser un modelo de solo 350M de parametros, su capacidad de razonamiento, coherencia y conocimiento general es muy limitada en comparacion con modelos de 7B o superiores.
- El modelo puede generar contenido inapropiado, ofensivo o peligroso debido a su naturaleza "uncensored". No se recomienda su uso en aplicaciones orientadas al publico general sin supervision humana.
- Riesgo de alucinaciones elevado, especialmente en tareas que requieren conocimiento factual o actualizado.
- Solo soporta ingles; no se ha verificado su comportamiento en otros idiomas.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran contexto largo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base podria tener restricciones adicionales no documentadas en esta ficha.
- No hay garantias de soporte o mantenimiento por parte del autor de la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/LFM2.5-350M-Uncensored-GGUF
- Modelo base (naimulislam999): https://huggingface.co/naimulislam999/LFM2.5-350M-Uncensored
- Version no uncensored (mradermacher): https://huggingface.co/mradermacher/LFM2.5-350M-GGUF
- Repositorio GitHub relacionado: https://github.com/Damacol/mradermacher-terminus-lfm2.5-350m-gguf
- Guia de modelos uncensored por VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
