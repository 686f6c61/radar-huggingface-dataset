# bambocher/Qwen3.5-2B-oQ8-mtp

## Resumen

Qwen3.5-2B-oQ8-mtp es una versión cuantizada del modelo Qwen3.5-2B, publicada por el usuario bambocher en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un checkpoint convertido al formato MLX (Apple Silicon) mediante la herramienta oQ (oMLX v0.7.1rc1), que aplica cuantización de precisión mixta: una parte mayoritaria de los pesos se almacena en affine 8-bit con grupo de 64 y otra parte se mantiene en BF16. El resultado es un checkpoint de 2.274.069.824 parámetros que ocupa 2,547 GiB en disco, con un promedio efectivo de 9,623 bits por peso.

El interés de esta ficha es doble. Por un lado, documenta una técnica de cuantización mixta poco habitual, en la que el autor conserva en BF16 el 14,967% de los pesos (0,340B) mientras comprime el 85,033% restante a 8 bits, un compromiso que busca preservar la calidad de las capas más sensibles sin renunciar a la reducción de tamaño. Por otro lado, el checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (1,882B de pesos), una torre de visión (0,331B) y una cabeza MTP (*multi-token prediction*, 0,061B), lo que lo convierte en un modelo multimodal con decodificación especulativa integrada.

La relevancia práctica es la de un modelo pequeño, multimodal y ejecutable en local sobre hardware Apple. Sin embargo, la información publicada es muy escasa: no consta licencia, idiomas soportados, longitud de contexto, composición del dataset ni resultados de benchmarks. Esta ficha refleja únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5, con torre de visión y cabeza MTP; el detalle de capas, atención y activaciones no está disponible |
| Parametros totales | 2.274.069.824 (2,274B) |
| Parametros activos | No consta que sea un modelo MoE; no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 8-bit con grupo de 64 (1,934B de pesos, 85,033%, 8,50 bits/peso) y BF16 (0,340B, 14,967%, 16,00 bits/peso); promedio efectivo 9,623 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, formato MLX (librería `mlx`) |
| Desglose por componente | Lenguaje 1,882B (1,863 GiB); visión 0,331B (0,617 GiB); cabeza MTP 0,061B (0,068 GiB) |
| Tamano del repositorio | 2,7 GB (2,547 GiB de pesos) |
| Herramienta de cuantizacion | oQ (oMLX v0.7.1rc1), de jundot |
| Descargas / likes | 10 / 0 |
| Fecha de publicacion | 20 de octubre de 2026 |

## Arquitectura y entrenamiento

El checkpoint es una conversión, no un entrenamiento nuevo: el autor no aporta información sobre el proceso de preentrenamiento, el número de tokens, la composición del dataset ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Lo que sí se deduce de los datos del repositorio es la estructura interna en tres bloques. El bloque de lenguaje concentra 1,882B de parámetros (el 82,8% del total); la torre de visión aporta 0,331B, lo que confirma que el modelo base es multimodal con entrada de imagen; y la cabeza MTP añade 0,061B, un módulo de predicción multi-token que en la práctica se emplea para decodificación especulativa, es decir, para proponer varios tokens por paso y validarlos con el modelo principal, acelerando la generación.

La innovación técnica del repo es la política de cuantización mixta. Frente a una cuantización uniforme a 8 bits, oQ mantiene en BF16 0,340B de parámetros, presumiblemente las capas más sensibles a la pérdida de precisión, y comprime el resto con affine 8-bit y grupo de 64. El resultado son 9,623 bits/peso de media, un punto intermedio entre un Q8 puro (8 bits) y un BF16 (16 bits), con un tamaño final de 2,547 GiB que cabe holgadamente en la memoria unificada de un Mac moderno. No se documenta qué capas concretas se han preservado en BF16 ni qué criterio de selección se ha seguido.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, heredados del modelo base Qwen3.5-2B (el alcance exacto no está documentado en la model card).
- Procesamiento de imágenes: la presencia de una torre de visión de 0,331B implica capacidades multimodales de entrada visual, aunque no se detallan tareas concretas (VQA, OCR, captioning).
- Decodificación especulativa mediante la cabeza MTP de 0,061B, orientada a reducir la latencia de generación en inferencia con MLX.
- Ejecución local en Apple Silicon gracias al formato MLX y al tamaño reducido del checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistente local en un Mac: el checkpoint de 2,547 GiB se puede cargar con `mlx_lm` o `mlx-vlm` en un equipo con memoria unificada de 8 GB o más, permitiendo un asistente de texto y visión sin conexión a servicios externos.
- Análisis de documentos con imágenes: al combinar torre de visión y modelo de lenguaje, encaja en tareas de descripción de capturas, extracción de texto de imágenes o respuesta a preguntas sobre figuras, siempre que se valide empíricamente la calidad del componente visual.
- Prototipado rápido de aplicaciones multimodales: el tamaño reducido permite iterar en local sobre prompts y flujos antes de migrar a un modelo mayor en producción.
- Generación de texto con latencia baja en dispositivos: la cabeza MTP está pensada para acelerar la decodificación, lo que resulta útil en aplicaciones interactivas donde el tiempo hasta el primer token y el throughput importan.
- Procesamiento por lotes de contenido visual en local: clasificación y etiquetado de imágenes o capturas en un portátil, sin coste de API y con los datos sin salir del equipo.
- Banquito de pruebas para investigar cuantización: el repo documenta con precisión la distribución de bits por componente, lo que lo convierte en un caso de estudio útil para medir el impacto de la precisión mixta frente al BF16 original en tareas concretas.
- Evaluación comparativa de decodificación especulativa: la inclusión de la cabeza MTP permite medir la ganancia de velocidad frente a la generación autoregresiva estándar del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor se limita a documentar el esquema de cuantización y el desglose de almacenamiento; no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica de calidad, ni comparaciones con el checkpoint original en BF16.

## Requisitos de hardware

- Memoria para pesos: 2,547 GiB (2,735 GB) en el checkpoint cuantizado; a ello hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto y del número de capas, dato no disponible.
- VRAM estimada para inferencia: no disponible como cifra oficial; por el tamaño del checkpoint, un presupuesto de 3 a 5 GB de memoria es un punto de partida razonable para contextos moderados, pero es una estimación, no un dato del autor.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3 y M4); no hay soporte nativo de CUDA en este checkpoint.
- Compatibilidad con GPU de consumo: sí, en Mac con memoria unificada de 8 GB o superior; en 16 GB se dispone de margen para contextos más largos y para el procesamiento de imágenes. No cabe esperar ejecución directa en GPU NVIDIA sin conversión previa.
- Opciones de despliegue: `mlx_lm` (texto) y `mlx-vlm` (multimodal) son las vías naturales; para vLLM, TGI, llama.cpp u Ollama sería necesaria una conversión de formato a GGUF u otro backend compatible, no incluida en el repositorio.
- Latencia y throughput: no disponible. La presencia de la cabeza MTP sugiere una mejora de velocidad respecto a la decodificación autoregresiva, pero el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-oQ8-mtp (este) | 2,274B | no disponible | no disponible | safetensors MLX, mixto 8-bit/BF16 | 9,623 bits/peso, 2,547 GiB, con visión y MTP |
| Qwen3.5-2B (checkpoint original) | 2,274B (misma arquitectura) | no disponible | no disponible | no disponible | Referencia de calidad a la que aspira la versión cuantizada; no verificada en la información disponible |
| Otras cuantizaciones del mismo modelo base (Q4, Q6, etc.) | 2,274B | no disponible | no disponible | MLX / GGUF según el caso | No se dispone de datos de autor para comparar tamaño ni calidad |
| Modelos pequeños multimodales de la competencia (por ejemplo, la familia Qwen2.5-VL en 3B) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Datos no verificados en esta búsqueda; se citan solo como categoría alternativa |

La búsqueda web realizada no devolvió ninguna fuente relacionada con este modelo ni con su familia, por lo que la comparativa cuantitativa con alternativas no puede completarse con datos fiables.

## Limitaciones y advertencias

- Ausencia total de licencia documentada: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o consultar el repositorio del modelo base antes de cualquier despliegue productivo.
- El autor publica 10 descargas y 0 likes, y el modelo no cuenta con validación de la comunidad; la calidad del checkpoint cuantizado no está contrastada de forma independiente.
- No se documentan idiomas soportados, longitud de contexto ni capacidades de tool calling, lo que impide planificar integraciones con agentes o pipelines que dependan de esas funciones.
- La cuantización mixta introduce una degradación de calidad no medida: al no haber benchmarks frente al BF16 original, se desconoce la pérdida real en razonamiento, código o tareas visuales.
- Riesgo de alucinación inherente a los modelos de 2B de parámetros, acentuado en tareas de razonamiento largo o matemáticas; no se han publicado evaluaciones que lo cuantifiquen.
- Sesgos: no disponible. Al no documentarse la composición del dataset de entrenamiento, no es posible caracterizar los sesgos del modelo base.
- Dependencia de plataforma: el formato MLX limita el uso a Apple Silicon; no hay pesos GGUF ni CUDA en el repositorio, lo que excluye servidores NVIDIA sin trabajo de conversión adicional.
- Fecha de publicación adelantada (2026) y metadatos incompletos en HuggingFace (pipeline e idiomas sin definir); conviene verificar la integridad del repositorio antes de descargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-oQ8-mtp
- Herramienta de cuantización oQ (oMLX), citada en la model card: https://github.com/jundot/omlx
- Repositorio del modelo base Qwen3.5-2B: no disponible en la información proporcionada
- Paper o documentación técnica de la arquitectura Qwen3.5: no disponible en la información proporcionada
- Resultados de benchmarks: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos trataban sobre estados de flujo de caja y no guardan relación).
