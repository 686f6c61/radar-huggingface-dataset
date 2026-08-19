# majentik/Qwen3.8-27B-MLX-5bit

## Resumen

El modelo `majentik/Qwen3.8-27B-MLX-5bit` es una variante cuantizada en 5 bits (affine, group size 64) del modelo multimodal Qwen3.8-27B de Qwen, adaptada para ejecutarse en Apple silicon mediante la librería MLX. El autor, majentik, ha publicado una serie de cuantizaciones (2, 3, 4, 5, 6, 8 bits y MXFP4) para facilitar el despliegue local en Mac. Esta versión concreta cuantiza el text tower del modelo, mientras que el vision tower y el projector se mantienen en BF16, lo que permite conservar la capacidad de procesamiento de imágenes y texto.

El modelo base Qwen3.8-27B es un sistema image-text-to-text, es decir, acepta tanto imágenes como texto como entrada y genera respuestas conversacionales. La cuantización reduce el tamaño del archivo a 19,4 GB, lo que lo hace viable en equipos Apple con memoria unificada moderada. Aunque el nombre sugiere 27 mil millones de parámetros, el archivo safetensors contiene 5.505.879.280 parámetros, posiblemente debido a la estructura del modelo base o a la exclusión de ciertos componentes en la cuantización; no se dispone de más detalles. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text basado en Qwen3.8-27B) |
| Parametros totales | 5.505.879.280 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit affine, group size 64 (text tower); vision tower y projector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.8-27B más allá de que es multimodal (image-text-to-text). La model card indica que el text tower se ha cuantizado a 5 bits con esquema affine y group size 64, mientras que el vision tower y el projector se mantienen en BF16. No se proporcionan datos sobre el entrenamiento, el número de tokens, la composición del dataset ni técnicas como RLHF o DPO. La cuantización se realizó con `mlx_lm.convert` (mlx-lm 0.31.3) y se verificó mediante una prueba de coherencia determinista de generación de 48 tokens.

## Capacidades

- Procesamiento de imágenes y texto: al ser un modelo image-text-to-text, puede recibir entradas multimodales y generar respuestas textuales.
- Conversación: el pipeline indica que es conversacional, por lo que puede mantener diálogos multi-turno.
- No se mencionan capacidades específicas de tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe explícito en la información disponible.

## Casos de uso

- Asistente multimodal local en Mac: gracias a la cuantización MLX, el modelo puede ejecutarse en Apple silicon con memoria unificada, permitiendo consultas que combinan imágenes y texto sin conexión a internet.
- Descripción y análisis de imágenes: el modelo puede generar descripciones de fotografías o responder preguntas sobre el contenido visual, útil en aplicaciones de accesibilidad o catalogación.
- Chat conversacional con contexto visual: integrable en aplicaciones de mensajería o asistentes personales que necesiten interpretar capturas de pantalla o fotos enviadas por el usuario.
- Prototipado rápido en entornos Apple: desarrolladores que trabajan con MLX pueden usar este modelo como base para experimentar con tareas de visión-lenguaje sin necesidad de GPUs dedicadas.
- Educación y demostraciones: al ser de código abierto y con licencia permisiva, es adecuado para talleres o proyectos académicos que requieran un modelo multimodal local.
- Automatización de documentos: extraer información de imágenes de facturas, formularios o diagramas y generar resúmenes textuales, siempre que el modelo base tenga esa capacidad (no confirmada en la información disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Diseñado para Apple silicon (chips M1, M2, M3 y sucesores) mediante MLX.
- Tamaño del repositorio: 19,4 GB, por lo que se recomienda al menos 24 GB de memoria unificada para cargar el modelo en memoria, aunque podría funcionar con menos si se usa swapping.
- No se especifican requisitos de VRAM ni latencia; al ser MLX, utiliza la GPU integrada de Apple.
- Despliegue mediante `mlx-lm` (pip install mlx-lm) y el comando `mlx_lm.generate`.
- No se mencionan opciones como vLLM, llama.cpp u Ollama; el formato es específico de MLX.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El propio autor publica otras cuantizaciones del mismo modelo base (2, 3, 4, 6, 8 bits y MXFP4), que se diferencian únicamente en el nivel de cuantización y, por tanto, en el equilibrio entre tamaño y precisión. No hay datos de rendimiento relativo.

## Limitaciones y advertencias

- Al ser una cuantización de 5 bits, puede haber pérdida de precisión respecto al modelo original en tareas que requieran alta exactitud numérica o razonamiento complejo.
- No se han documentado sesgos específicos, pero al derivar de un modelo base no auditado, podrían existir sesgos heredados.
- La longitud de contexto no está especificada; se desconoce si el modelo base soporta ventanas largas.
- El uso comercial está permitido por la licencia Apache-2.0, pero se recomienda revisar la licencia del modelo base original para confirmar cualquier restricción adicional.
- No se garantiza el soporte de todos los idiomas; la información no especifica los idiomas soportados.
- El modelo está optimizado para Apple silicon; no funcionará en GPUs NVIDIA o AMD sin una conversión adicional.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/majentik/Qwen3.8-27B-MLX-5bit)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Otras cuantizaciones del mismo autor](https://huggingface.co/majentik) (2bit, 3bit, 4bit, 6bit, 8bit, MXFP4)
- [mlx-lm (repositorio de MLX)](https://github.com/ml-explore/mlx-lm)
