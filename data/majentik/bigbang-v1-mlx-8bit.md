# majentik/BigBang-v1-MLX-8bit

## Resumen

BigBang-v1-MLX-8bit es una cuantización en 8 bits (affine, group size 64) del modelo multimodal BigBang-v1, desarrollado por endless-frontier, adaptada para Apple Silicon mediante la librería MLX por el usuario majentik. El modelo base emplea una arquitectura de mezcla de expertos (MoE) de la familia qwen3_5_moe y soporta entrada de imagen y texto, generando respuestas de texto. Esta variante cuantizada reduce el uso de memoria al mantener la torre de texto en 8 bits mientras conserva la torre de visión y el proyector en BF16, lo que permite ejecutar el modelo en hardware de Apple con requisitos de memoria más accesibles.

La relevancia de esta ficha radica en que ofrece una opción práctica para desarrolladores que desean desplegar un modelo multimodal de aproximadamente 10.200 millones de parámetros en entornos locales con Apple Silicon, aprovechando la aceleración de MLX. Al estar publicada bajo licencia Apache-2.0, su uso comercial está permitido, aunque la cuantización introduce una ligera pérdida de precisión que debe evaluarse según la aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) multimodal imagen-texto |
| Parametros totales | 10.195.701.616 (10,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (texto); torre de vision y proyector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base BigBang-v1 emplea una arquitectura de mezcla de expertos (MoE) de la familia qwen3_5_moe, diseñada para procesar tanto imágenes como texto. La variante MLX-8bit cuantiza únicamente la torre de texto con cuantización afina de 8 bits y grupo de tamaño 64, mientras que la torre de visión y el proyector multimodal se mantienen en precisión BF16 para preservar la calidad de la representación visual. No se dispone de información detallada sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada.

La cuantización se realizó con la herramienta `mlx_lm.convert` de la librería mlx-lm versión 0.31.3, y el paquete resultante pasó una prueba de coherencia determinista (generación de 48 tokens con decodificación greedy) que verificó la ausencia de salidas vacías, bucles de repetición o artefactos de tokens especiales.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada, generando respuestas de texto (pipeline `image-text-to-text`).
- Generación de texto conversacional: diseñado para interacciones de chat, según la etiqueta `conversational`.
- Ejecución en Apple Silicon: optimizado para MLX, aprovecha la memoria unificada de los chips M1/M2/M3/M4.
- Cuantización eficiente: la torre de texto en 8 bits reduce el uso de memoria sin comprometer la torre de visión, que se mantiene en BF16.
- No se especifican capacidades adicionales como tool calling, agentes o razonamiento multi-paso en la documentación disponible.

## Casos de uso

- Descripción de imágenes en aplicaciones de accesibilidad: el modelo puede generar descripciones textuales detalladas de fotografías o ilustraciones, ayudando a personas con discapacidad visual a comprender contenido gráfico.
- Asistente de soporte técnico con capturas de pantalla: un usuario puede subir una captura de error y el modelo interpreta la imagen junto con el texto para ofrecer pasos de solución.
- Análisis de documentos escaneados: combina OCR visual con comprensión de texto para extraer información de facturas, formularios o contratos.
- Generación de contenido para redes sociales: a partir de una imagen, el modelo produce textos promocionales, hashtags o descripciones creativas.
- Chatbot educativo multimodal: estudiantes pueden preguntar sobre diagramas, gráficos o esquemas, recibiendo explicaciones en lenguaje natural.
- Automatización de etiquetado de imágenes: en entornos de gestión de activos digitales, el modelo genera metadatos descriptivos para organizar bibliotecas de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dirigido exclusivamente a Apple Silicon (M1 o posterior) gracias a la integración con MLX.
- Memoria unificada estimada: el modelo cuantizado en 8 bits ocupa aproximadamente 10,2 GB para la torre de texto, más la torre de visión y proyector en BF16 (tamaño no especificado). Se recomienda un Mac con al menos 16 GB de memoria unificada, siendo 32 GB más seguro para ventanas de contexto largas o uso simultáneo de otras aplicaciones.
- No se requieren GPUs discretas; la memoria unificada del SoC es suficiente.
- Despliegue mediante `mlx-lm`, que permite generar texto con el comando `mlx_lm.generate --model majentik/BigBang-v1-MLX-8bit --prompt "Hello"`.
- Latencia y throughput: no disponibles; dependerán del modelo de chip (M1, M2, M3, M4) y de la memoria disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, aunque al ser una variante cuantizada de BigBang-v1, podrían considerarse otras cuantizaciones del mismo modelo (2-bit, 3-bit, 4-bit, 5-bit, 6-bit y MXFP4) disponibles en el mismo repositorio, que ofrecen diferentes equilibrios entre tamaño y precisión.

## Limitaciones y advertencias

- Al ser una cuantización de 8 bits, puede presentar una ligera degradación en la calidad de generación en comparación con el modelo original en BF16, especialmente en tareas que requieren razonamiento numérico o precisión factual.
- La torre de visión se mantiene en BF16, por lo que el uso de memoria total es superior al de un modelo de texto puro equivalente.
- No se dispone de información sobre sesgos específicos, riesgos de alucinación o limitaciones idiomáticas; se recomienda realizar pruebas exhaustivas antes de su uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el modelo base (endless-frontier/BigBang-v1) cumple con las mismas condiciones y que no existen restricciones adicionales en los datos de entrenamiento.
- El modelo solo funciona en Apple Silicon; no es compatible con GPUs NVIDIA o AMD ni con entornos Linux estándar sin la capa de compatibilidad adecuada.

## Enlaces

- [Repositorio HuggingFace de BigBang-v1-MLX-8bit](https://huggingface.co/majentik/BigBang-v1-MLX-8bit)
- [Modelo base endless-frontier/BigBang-v1](https://huggingface.co/endless-frontier/BigBang-v1)
- [Otras cuantizaciones: 2-bit](https://huggingface.co/majentik/BigBang-v1-MLX-2bit), [3-bit](https://huggingface.co/majentik/BigBang-v1-MLX-3bit), [4-bit](https://huggingface.co/majentik/BigBang-v1-MLX-4bit), [5-bit](https://huggingface.co/majentik/BigBang-v1-MLX-5bit), [6-bit](https://huggingface.co/majentik/BigBang-v1-MLX-6bit), [MXFP4](https://huggingface.co/majentik/BigBang-v1-MLX-MXFP4)
- [mlx-lm (librería de inferencia)](https://github.com/ml-explore/mlx-lm)
