# nativ-community/flint-5bit

## Resumen

Flint 5bit es una cuantización de pesos en 5 bits del modelo RecursiveSI/flint, publicada por la comunidad nativ-community. Se trata de una conversión realizada con MLX-VLM 0.7.10 y MLX 0.32.4, pensada para ejecutar inferencia local sobre hardware Apple Silicon. El modelo emplea una arquitectura Mixture of Experts (MoE) con 47 routers, lo que explica que sus 39.785.299.488 parámetros totales se distribuyan de forma dispersa y permitan un despliegue más eficiente que un modelo denso de tamaño equivalente.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de casi 40.000 millones de parámetros en equipos con memoria unificada de Apple, manteniendo los routers MoE en 8 bits para preservar la precisión del enrutamiento. El contexto combinado de prompt y salida alcanza los 262.144 tokens según la configuración del modelo fuente, aunque las pruebas de humo de la conversión no validan la calidad en contextos largos.

Es importante subrayar que se trata de una conversión de pesos, no de un modelo nuevo: la tokenizador, plantilla de chat, configuración de generación y licencia Apache-2.0 se conservan byte a byte desde el modelo original. No se han publicado resultados de benchmarks sobre estos pesos cuantizados, por lo que cualquier evaluación de calidad debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 47 routers; transformer (detalles del modelo fuente no disponibles) |
| Parametros totales | 39.785.299.488 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ventana combinada prompt + salida, según configuración del modelo fuente) |
| Tipos de cuantizacion | 5 bits affine con group size 64; routers MoE en 8 bits affine group size 64; parámetros de normalización, attention sinks y otros no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo fuente RecursiveSI/flint es una arquitectura Mixture of Experts con 47 routers, según se desprende de la configuración de cuantización aplicada. La conversión mantiene todos los routers en precisión de 8 bits con cuantización affine y group size 64, mientras que el resto de pesos lineales se cuantizan a 5 bits con el mismo esquema. Los parámetros de normalización, los attention sinks y otros componentes sensibles permanecen en BF16 para evitar degradación numérica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación técnica principal de esta publicación es el propio proceso de conversión: se realizó con una revisión fija del modelo fuente, una versión concreta de MLX-VLM y MLX 0.32.4, y se documentan las opciones, overrides por módulo y hashes SHA-256 en conversion.json. Además, se preservan los sidecars canónicos (tokenizer.json, tokenizer_config.json, chat_template.jinja, generation_config.json, LICENSE) copiados sin modificar desde el repositorio original. El modo thinking sigue controlado por la plantilla original, sin override para desactivarlo.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, con plantilla de chat nativa preservada.
- Razonamiento con modo thinking controlado por la plantilla del modelo fuente; el razonamiento consume presupuesto de salida.
- Generación de código: las pruebas de humo incluyen la escritura de una función Python para fusionar intervalos solapados, validada mediante parseo AST (no ejecución).
- Aritmética básica y recuperación de información a corto plazo, verificadas en las pruebas de humo.
- Capacidades de visión: la etiqueta mlx-vlm sugiere soporte de entrada visual a través de la librería MLX-VLM, aunque no se detalla en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Ventana de contexto larga de hasta 262.144 tokens combinados, aunque sin validación de calidad en longitudes extensas.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización 5 bits permiten ejecutar un modelo de ~40.000 millones de parámetros en equipos con memoria unificada de Apple, usando mlx_vlm.generate con el commit fijado de MLX-VLM.
- Asistencia de programación en el escritorio: el modelo puede generar funciones y fragmentos de código Python, como demuestra la prueba de humo con la función de fusión de intervalos, integrándose en flujos de trabajo locales sin depender de la nube.
- Prototipado de chatbots conversacionales: la plantilla de chat y los valores por defecto de generación (temperatura 1.0, top-p 0.95, top-k 20) están preservados, lo que facilita montar un asistente multi-turno con razonamiento configurable.
- Experimentación con modelos MoE cuantizados: investigadores pueden usar estos pesos para estudiar el impacto de la cuantización 5 bits en el enrutamiento de expertos, comparando con el modelo BF16 original en tareas controladas.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite, en teoría, ingerir documentos extensos en una sola pasada, aunque la calidad en contextos largos no está validada por la conversión.
- Evaluación de pipelines MLX-VLM: sirve como banco de pruebas para validar flujos de conversión, recarga estricta de checkpoints y comprobaciones de logits finitos antes de desplegar variantes cuantizadas en producción.
- Generación de código asistida con presupuesto ampliado: para tareas complejas que activen el modo thinking, se recomienda aumentar el presupuesto de tokens de salida, ya que el razonamiento consume parte de él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que estos pesos convertidos no han sido evaluados sobre la suite de benchmarks publicada del modelo fuente. Las únicas validaciones realizadas son pruebas de humo (recarga estricta, logits finitos en prefill/decode, comprobaciones de posición de caché, aritmética, recuperación corta y una función Python simple) ejecutadas en un Apple M5 Max con MLX 0.32.4, con decodificación greedy y presupuesto de 512 tokens. Estas pruebas no constituyen una evaluación de calidad ni una prueba de equivalencia con BF16 o Transformers.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 27,4 GB en disco con pesos de 5 bits; la inferencia requiere al menos esa cantidad de memoria unificada más overhead de caché KV y activaciones.
- GPU recomendadas: hardware Apple Silicon con memoria unificada suficiente; las pruebas se ejecutaron en un Apple M5 Max. No se dispone de datos para GPU NVIDIA.
- Cabe en consumer GPU: no hay información sobre compatibilidad con GPU de consumo NVIDIA; el formato MLX está orientado a Apple Silicon.
- Opciones de despliegue: MLX-VLM (commit 6d9ba328abbd6129c7461eda86280aa9fbfd9986) con MLX 0.32.4; comando mlx_vlm.generate. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/flint-5bit | 39.785.299.488 | 262.144 tokens | 5 bits affine (routers 8 bits) | Apache-2.0 | HuggingFace, formato MLX |
| RecursiveSI/flint (modelo fuente) | 39.785.299.488 | 262.144 tokens | BF16 | Apache-2.0 | HuggingFace |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo fuente en BF16, que ofrece la misma arquitectura y contexto pero sin pérdida por cuantización, a costa de un mayor requisito de memoria. No se dispone de información sobre otros modelos MoE de ~40.000 millones de parámetros comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización puede alterar las respuestas respecto al modelo BF16; no se ha demostrado equivalencia con el original ni con Transformers.
- Los formatos de punto flotante de 4 bits pueden diferir en calidad respecto a la cuantización affine aplicada aquí.
- No se han publicado benchmarks de calidad sobre estos pesos; las pruebas de humo no son una evaluación de rendimiento.
- La calidad en contextos largos (hasta 262.144 tokens) no está validada por las pruebas de la conversión.
- El modo thinking no puede desactivarse mediante override; el razonamiento consume presupuesto de salida, lo que puede agotar el límite en tareas complejas si no se amplía.
- El código generado en las pruebas se parseó como AST, no se ejecutó; no hay garantía de corrección funcional.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo fuente.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card del modelo fuente para condiciones adicionales.
- El despliegue está ligado a versiones concretas de MLX y MLX-VLM; usar otras versiones puede romper la compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/flint-5bit
- Modelo fuente: https://huggingface.co/RecursiveSI/flint
- Revisión del modelo fuente: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Commit fijado de MLX-VLM: https://github.com/Blaizzy/mlx-vlm/commit/6d9ba328abbd6129c7461eda86280aa9fbfd9986
