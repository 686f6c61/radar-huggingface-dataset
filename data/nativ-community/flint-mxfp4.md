# nativ-community/flint-mxfp4

## Resumen

Flint MXFP4 es una conversión cuantizada del modelo RecursiveSI/flint, publicada por la comunidad nativ-community. Se trata de una versión de 4 bits en formato MXFP4 (microscaling floating point) pensada para su ejecución en Apple Silicon mediante MLX y MLX-VLM. El modelo base es un transformer con arquitectura Mixture of Experts (MoE), tal como evidencia la presencia de 47 routers MoE en la conversión, y cuenta con 39.785.299.488 parámetros totales según los pesos en safetensors.

El interés de esta ficha reside en que ofrece una ruta práctica para ejecutar un modelo de casi 40.000 millones de parámetros en hardware de Apple con un peso de repositorio de 21,2 GB, gracias a la cuantización MXFP4 con grupo de 32. La conversión preserva el tokenizer, la plantilla de chat, los valores de generación por defecto y la licencia Apache-2.0 del modelo original byte a byte, lo que facilita la reproducibilidad.

Es relevante ahora porque la cuantización MXFP4 es un formato de coma flotante de 4 bits que puede diferir en calidad respecto a la cuantización afín tradicional, y porque el autor advierte explícitamente de que estos pesos no han sido evaluados en el conjunto de benchmarks publicado del modelo fuente. La información disponible sobre arquitectura detallada, datos de entrenamiento e idiomas es limitada: la model card remite al modelo original para esos detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (47 routers MoE identificados en la conversión); detalles completos no disponibles |
| Parametros totales | 39.785.299.488 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ventana combinada de prompt y salida, según la configuración del modelo fuente) |
| Tipos de cuantizacion | MXFP4 con grupo de 32 para pesos; routers MoE en cuantización afín de 8 bits con grupo de 64; parámetros de normalización, attention sinks y otros no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo fuente es un transformer con arquitectura Mixture of Experts: la conversión aplica cuantización afín de 8 bits con grupo de 64 a los 47 routers MoE, lo que implica al menos 47 capas o bloques con enrutamiento experto. Los pesos se cuantizan en MXFP4 con grupo de 32, mientras que los parámetros de normalización, los attention sinks y otros parámetros no cuantizados permanecen en BF16. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card remite al modelo original para esa información.

La innovación técnica principal de esta publicación es la propia conversión: se realizó con MLX-VLM 0.7.10 sobre MLX 0.32.4, fijando el commit 6d9ba328abbd6129c7461eda86280aa9fbfd9986, y se preservó la precisión específica de los routers del modelo. El proceso de conversión está documentado y es reproducible mediante el comando `mlx_vlm.convert` con `--q-bits 4 --q-group-size 32 --q-mode mxfp4`, y los hashes SHA-256 de todos los artefactos publicados se recogen en SHA256SUMS. La validación incluyó recarga estricta del checkpoint, comprobación de logits finitos en prefill y decode, verificación de posiciones de caché, aritmética, recuperación corta y funciones Python simples, ejecutadas en un Apple M5 Max con decodificación greedy y un presupuesto de 512 tokens.

## Capacidades

- Generación de texto conversacional y continuaciones de código, según el pipeline declarado de text-generation.
- Razonamiento con modo thinking controlado por la plantilla original del modelo fuente; la conversión no incluye un override para desactivar el thinking.
- Generación de código: la validación incluyó comprobaciones con funciones Python simples, y el ejemplo de uso de la model card genera una función para fusionar intervalos solapados.
- Aritmética básica y recuperación de información a corto plazo, verificadas en las pruebas de humo.
- Procesamiento multimodal: la librería utilizada es MLX-VLM y las etiquetas incluyen `mlx-vlm`, lo que sugiere capacidades de visión, aunque la model card no detalla las modalidades soportadas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Ejecución local de un modelo de gran tamaño en Apple Silicon: con 21,2 GB de pesos en MXFP4, el modelo puede desplegarse en equipos con memoria unificada suficiente (por ejemplo, Apple M5 Max), lo que permite trabajar con un modelo de casi 40.000 millones de parámetros sin GPU dedicada.
- Asistencia a la programación en local: el modelo genera código Python y puede integrarse en flujos de trabajo de desarrollo en macOS mediante MLX-VLM, manteniendo los datos del usuario en la máquina.
- Prototipado de razonamiento con contexto largo: la ventana combinada de 262.144 tokens permite procesar documentos extensos o conversaciones prolongadas, aunque el autor advierte de que las pruebas de humo no validan la calidad en contexto largo.
- Experimentación e investigación en cuantización: al ser una conversión reproducible con hashes verificables, sirve para estudiar el impacto de MXFP4 frente a BF16 o cuantización afín en la calidad de las respuestas.
- Generación de texto conversacional en aplicaciones de escritorio: el pipeline text-generation y la plantilla de chat preservada permiten integrarlo en asistentes locales sobre macOS.
- Evaluación comparativa de formatos de cuantización: el modelo permite comparar respuestas de MXFP4 con las del modelo fuente en BF16 para medir la degradación introducida por el formato de coma flotante de 4 bits.
- Docencia y demostraciones de MoE: la estructura de 47 routers MoE permite ilustrar el funcionamiento de modelos dispersos en entornos con hardware de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que estos pesos convertidos no han sido evaluados en el conjunto de benchmarks publicado del modelo fuente, y que las pruebas realizadas son de humo (recarga, logits finitos, aritmética, recuperación corta y funciones Python), no un benchmark de calidad ni una prueba de equivalencia con BF16 o Transformers.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 21,2 GB en MXFP4; se recomienda al menos 24 GB de memoria unificada o VRAM para cargar los pesos con margen para el contexto y la caché KV.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; la validación se realizó en un Apple M5 Max. No hay datos sobre soporte en A100, H100 o RTX 4090, ya que el formato MLX está orientado a Apple Silicon.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 24 GB o más de memoria unificada; en GPU NVIDIA de consumo no se dispone de información sobre compatibilidad con este formato.
- Opciones de despliegue: MLX-VLM (versión 0.7.10 o el commit fijado 6d9ba328abbd6129c7461eda86280aa9fbfd9986) con MLX 0.32.4; el ejemplo de uso emplea `mlx_vlm.generate`. No se dispone de información sobre vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/flint-mxfp4 | 39.785.299.488 | 262.144 tokens | MXFP4 (4 bits) | Apache-2.0 | HuggingFace, MLX |
| RecursiveSI/flint (modelo fuente) | no disponible | 262.144 tokens | BF16 (original) | Apache-2.0 | HuggingFace |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal disponible es con el modelo fuente RecursiveSI/flint, del que esta publicación es una conversión cuantizada. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización puede alterar las respuestas: el autor advierte de que los formatos de coma flotante de 4 bits pueden diferir en calidad respecto a la cuantización afín, y que estos pesos no han sido evaluados en el benchmark del modelo fuente.
- Las pruebas de validación son de humo y no constituyen una prueba de equivalencia con BF16 ni con Transformers.
- La calidad en contexto largo no está validada, pese a la ventana de 262.144 tokens.
- El modo thinking consume parte del presupuesto de salida; para tareas complejas es necesario aumentar el presupuesto de tokens.
- No se incluye un override para desactivar el thinking; este se controla únicamente mediante la plantilla original.
- No hay información disponible sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los términos del modelo fuente y conservar los avisos de licencia.
- Dependencia estricta de versiones: se debe usar el commit de MLX-VLM y MLX 0.32.4 indicados para reproducir el comportamiento validado.
- El modelo está orientado al ecosistema MLX/Apple Silicon; no se dispone de información sobre su funcionamiento en otras plataformas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/flint-mxfp4
- Modelo fuente: https://huggingface.co/RecursiveSI/flint
- Revisión del modelo fuente utilizada: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Commit fijado de MLX-VLM: https://github.com/Blaizzy/mlx-vlm/commit/6d9ba328abbd6129c7461eda86280aa9fbfd9986
