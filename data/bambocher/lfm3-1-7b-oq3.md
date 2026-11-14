# bambocher/LFM3-1.7B-oQ3

## Resumen

LFM3-1.7B-oQ3 es una versión cuantizada del modelo LFM3 de 1.700 millones de parámetros (1.728.801.536 pesos reales según los safetensors), publicada por el usuario bambocher en Hugging Face. Se trata de una cuantización de precisión mixta realizada con la herramienta oQ de oMLX (versión 0.7.3), que combina capas en 3, 4, 5 y 8 bits con el objetivo de reducir el peso del checkpoint a unos 0.765 GiB manteniendo una media efectiva de 3.801 bits por peso. El resultado es un artefacto orientado a ejecución local en hardware Apple Silicon mediante la librería MLX.

El modelo base pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación), aunque la información disponible en esta ficha no incluye detalles sobre la arquitectura original, el proceso de entrenamiento ni los datos utilizados. La model card del autor se limita a documentar el esquema de cuantización y el desglose de almacenamiento, sin aportar información sobre capacidades, idiomas o benchmarks.

La relevancia de esta publicación es fundamentalmente práctica: demuestra un flujo de cuantización de precisión mixta que permite ejecutar un modelo de 1.7B en equipos con memoria unificada modesta (del orden de 1-2 GB para los pesos). No obstante, al carecer de model card completa, licencia declarada y métricas de calidad, debe tratarse como un artefacto experimental más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; la model card no describe la arquitectura) |
| Parametros totales | 1.728.801.536 (1.729B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 3-bit (grupo 64) 75,652% de los pesos; affine 4-bit (grupo 64) 18,803%; affine 5-bit (grupo 64) 5,519%; affine 8-bit 0,004%; BF16 0,022%. Media efectiva 3,801 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX, requiere `custom_code`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3 en la documentación proporcionada. La model card únicamente describe el proceso de cuantización: se aplicó oQ (oMLX v0.7.3), una técnica de cuantización de precisión mixta que asigna distintos anchos de bit a distintos tensores según su sensibilidad, con cuantización afín y tamaño de grupo 64. La mayor parte de los pesos (75,652%) se almacena en 3 bits, mientras que un 18,803% se mantiene en 4 bits y un 5,519% en 5 bits, presumiblemente para preservar capas más sensibles a la pérdida de precisión.

Tampoco se especifican los datos de entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF/DPO u otras técnicas de alineamiento). El checkpoint cuantizado ocupa 0,821 GB (0,765 GiB) y contiene exclusivamente los pesos del modelo de lenguaje, sin componentes adicionales de visión o audio. El tag `custom_code` indica que la carga requiere código personalizado incluido en el repositorio, lo que implica dependencia de la implementación específica de MLX para deserializar los tensores cuantizados.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe ni lista de idiomas.
- No se confirma modo de razonamiento (thinking mode), visión, audio ni otras capacidades especiales.
- Por herencia del modelo base LFM3 se presume generación de texto, pero este extremo no está verificado en la documentación proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 0,765 GiB permite cargar el modelo en equipos con memoria unificada de 8 GB o superior usando MLX, lo que lo hace apto para prototipado en portátiles Mac sin GPU dedicada.
- Evaluación de técnicas de cuantización: sirve como referencia para comparar la calidad de oQ frente a cuantizaciones uniformes de 4 bits (GPTQ, AWQ) sobre un mismo modelo base.
- Pruebas de pipelines MLX: útil para validar flujos de carga con `custom_code` y tensores de precisión mixta en entornos de desarrollo MLX.
- Experimentación académica con modelos pequeños: al ocupar menos de 1 GB, permite iterar rápidamente en experimentos de prompting o evaluación sin infraestructura costosa.
- Despliegue en entornos con memoria muy restringida: escenarios embebidos o contenedores con límites estrictos de RAM donde un modelo de 1.7B en BF16 (~3,4 GB) no cabría.
- Benchmarking de latencia en hardware consumer: permite medir throughput de decodificación en chips M-series frente a alternativas en GGUF con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,8-1,5 GB para los pesos según overhead de MLX; se recomienda al menos 4 GB de memoria unificada libre para contexto y estados intermedios.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX. No es compatible de forma nativa con CUDA sin conversión.
- Cabe en GPU consumer: sí, en cualquier Mac con memoria unificada de 8 GB o más. En GPUs NVIDIA consumer requeriría conversión a otro formato (no incluida en el repo).
- Opciones de despliegue: MLX (librería nativa), `mlx-lm` como runtime habitual. No se proporcionan pesos GGUF, por lo que llama.cpp, Ollama o vLLM no son compatibles directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ3 (este) | 1.729B | no disponible | oQ mixta 3,801 bits/peso | no disponible | safetensors (MLX) |
| LFM3-1.7B (base, hipotético) | 1.7B | no disponible | BF16 | no disponible | safetensors |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | GPTQ/AWQ/GGUF disponibles | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1.2B | 128.000 tokens | GGUF, MLX, AWQ | Llama 3.2 Community | safetensors, GGUF |

La comparación con Qwen2.5-1.5B y Llama-3.2-1B es orientativa por tamaño; no se dispone de datos de rendimiento del modelo LFM3 base ni de esta cuantización que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial está permitido. Debe contactarse con el autor o consultarse la licencia del modelo LFM3 original antes de cualquier uso en producción.
- No se documentan sesgos conocidos, pero al no haber información sobre el corpus de entrenamiento no es posible evaluar riesgos de sesgo de género, etnia o idioma.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la cuantización agresiva a 3 bits en el 75% de los pesos puede incrementar la degradación de calidad respecto al modelo en BF16, aunque no se aportan métricas que lo cuantifiquen.
- La cuantización mixta a 3,801 bits/peso puede producir pérdida de precisión en tareas sensibles (matemáticas, código, razonamiento largo) sin que exista una evaluación publicada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- Requiere `custom_code` y la librería MLX, lo que limita la portabilidad a ecosistemas Apple; no hay pesos GGUF ni compatibilidad con vLLM, TGI o llama.cpp.
- No se especifican idiomas soportados; el rendimiento en castellano es desconocido.
- El tag `region:us` y la ausencia de pipeline declarada indican que el artefacto no está configurado como modelo listo para inferencia en el Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ3
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
