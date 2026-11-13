# bambocher/Qwen3.5-4B-heretic-oQ8e-mtp

## Resumen

Qwen3.5-4B-heretic-oQ8e-mtp es una cuantización mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. El checkpoint incorpora 4.659.865.088 parámetros y se distribuye en formato MLX, pensado para su ejecución en hardware Apple Silicon a través del framework MLX. La cuantización se ha realizado con oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta que combina capas en 8 bits afines con grupo de 64 y capas en BF16.

El modelo base pertenece a la familia Qwen3.5, que según los componentes del checkpoint incluye capacidades multimodales (un codificador de visión de 0,334B de parámetros) y una cabeza MTP (multi-token prediction) de 0,121B, orientada a decodificación especulativa. El sufijo "heretic" sugiere un proceso de ablación o "decensurado" sobre el modelo original, aunque la model card no documenta dicho proceso.

El interés de esta ficha es doble: por un lado, muestra el estado del arte en cuantización mixta para despliegue local en Mac; por otro, ilustra los riesgos de los checkpoints de la comunidad, donde la trazabilidad sobre el modelo base, el proceso de fine-tuning y las condiciones de licencia es limitada. La información pública disponible es escasa: no hay benchmarks, no se declaran idiomas y la licencia figura como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabeza MTP (multi-token prediction); detalles del modelo base no disponibles |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 8-bit con grupo de 64 (92,541% de los pesos) y BF16 (7,459%); media efectiva de 9,059 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización affine 8-bit y BF16 |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 4,470 GB / 4,163 GiB |
| Vision | 0,334B | 0,667 GB / 0,621 GiB |
| Cabeza MTP | 0,121B | 0,140 GB / 0,131 GiB |
| Total | 4,660B | 5,277 GB / 4,915 GiB |

## Arquitectura y entrenamiento

La arquitectura del checkpoint es un transformer multimodal con un codificador de visión integrado y una cabeza MTP. La presencia de MTP es relevante porque habilita decodificación especulativa: la cabeza predice varios tokens por paso y el modelo verifica esas predicciones, lo que puede incrementar el throughput en inferencia autoregresiva. No obstante, la model card no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, tamaño de ventana de contexto), por lo que estos datos figuran como no disponibles.

El proceso de entrenamiento del modelo base no está documentado en la información proporcionada: no se especifica el volumen de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o instrucción supervisada. Del mismo modo, el proceso "heretic" (presumiblemente una ablación de rechazos o de comportamiento alineado) no se describe. La única transformación documentada es la cuantización con oQ (oMLX v0.7.3), que asigna 8 bits afines con grupo de 64 al 92,5% de los pesos y mantiene en BF16 el 7,5% restante, presumiblemente las capas más sensibles a la cuantización.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5, aunque no se documentan evaluaciones específicas.
- Procesamiento de visión: el checkpoint incluye un codificador visual de 0,334B de parámetros, lo que indica soporte de entrada de imágenes.
- Decodificación especulativa: la cabeza MTP permite acelerar la generación mediante predicción multi-token.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 4,915 GiB permiten ejecutar el modelo en Macs con memoria unificada de 16 GB o superior, usando el framework MLX y la librería mlx-lm.
- Prototipado de aplicaciones multimodales en local: el codificador de visión integrado permite experimentar con tareas de imagen a texto sin depender de servicios en la nube, aunque la calidad concreta no está evaluada.
- Investigación sobre cuantización mixta: el checkpoint sirve como referencia para estudiar el impacto de asignar 8 bits afines frente a BF16 en distintas capas, comparando la media efectiva de 9,059 bits/peso con el modelo original.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir la ganancia de throughput en MLX frente a decodificación estándar, útil para benchmarking de infraestructura local.
- Experimentación con modelos "decensurados": para investigadores interesados en estudiar el efecto de la ablación de comportamientos de rechazo, siempre que se respeten las condiciones legales del modelo base.
- Docencia y demostraciones offline: al caber en un portátil, permite demostraciones de un modelo de 4,66B con visión sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 4,915 GiB en disco; en inferencia se necesita margen adicional para el estado de activaciones y la caché KV, por lo que se recomienda un mínimo de 8-12 GB de memoria disponible.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3 y M4). No es directamente compatible con CUDA sin conversión previa.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada de 16 GB o más (M1/M2/M3/M4 base y superiores). En GPUs NVIDIA de consumo requeriría reconvertir los pesos a otro formato (por ejemplo, GGUF), algo que el autor no documenta.
- Opciones de despliegue: MLX (mlx-lm) es la vía nativa; llama.cpp, Ollama, vLLM y TGI no soportan directamente el formato oQ/MLX sin conversión.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ8e-mtp | 4,66B | no disponible | MLX safetensors (oQ 8-bit/BF16) | no disponible | Hugging Face (0 descargas) |
| Modelo base Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas de ~4B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto, rendimiento o licencia con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Trazabilidad limitada: el checkpoint es una cuantización de comunidad; no se documenta el modelo base exacto, la versión ni el proceso "heretic" aplicado.
- Licencia no declarada: la ausencia de licencia impide determinar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción sin aclaración previa del autor y del titular del modelo base.
- Sin benchmarks: no hay evaluaciones publicadas que permitan estimar la degradación introducida por la cuantización mixta frente al modelo original.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 4B; no se han publicado evaluaciones de fidelidad.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas.
- Formato propietario de facto: al estar en MLX, no es portable directamente a ecosistemas CUDA o a servidores de inferencia estándar sin conversión.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Posible comportamiento "decensurado": los modelos heretic pueden generar contenido que el modelo base rechazaría; esto exige controles adicionales en cualquier despliegue orientado al usuario final.
- Sesgos: no documentados; se heredan los del modelo base, que no se especifica.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ8e-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Framework MLX: https://github.com/ml-explore/mlx
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
