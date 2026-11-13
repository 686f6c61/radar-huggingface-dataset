# bambocher/Qwen3.5-9B-oQ3-mtp

## Resumen

Qwen3.5-9B-oQ3-mtp es una cuantización mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. El checkpoint está empaquetado en formato MLX (safetensors) y emplea la herramienta oQ de oMLX v0.7.3 para aplicar precisión mixta: la mayor parte de los pesos se almacena en 3 bits afín con grupo de 64, mientras que determinadas capas se conservan en 4, 5, 6, 8 bits o incluso BF16. El resultado es un checkpoint de 9.653 millones de parámetros lógicos comprimido a unos 5,08 GiB de almacenamiento, con un promedio efectivo de 4,518 bits por peso.

El modelo base Qwen3.5-9B pertenece a la familia Qwen3.5 de Alibaba, de la que este repositorio hereda la arquitectura transformer con capacidades multimodales (visión) y una cabeza MTP (multi-token prediction) destinada a decodificación especulativa. El checkpoint incluye 8.954 millones de parámetros en el modelo de lenguaje, 456 millones en el codificador visual y 243 millones en la cabeza MTP, lo que confirma que se trata de una variante multimodal con soporte de predicción multi-token.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 10.000 millones de parámetros con capacidades de visión y decodificación especulativa en hardware Apple Silicon con un consumo de memoria moderado (en torno a 5-6 GB de pesos), algo inviable con el checkpoint original en BF16. No obstante, se trata de una cuantización de terceros, no oficial, con muy poca tracción (36 descargas, 0 likes) y sin model card que documente licencia, idiomas o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; pesos cuantizados en MLX |
| Parametros totales | 9.653.104.368 (9.653B logicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta afín con grupo 64: 3, 4, 5, 6 y 8 bits, mas BF16; promedio efectivo 4,518 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

Desglose de almacenamiento declarado por el autor: modelo de lenguaje 8.954B parámetros (4,354 GB / 4,055 GiB), visión 0,456B (0,912 GB / 0,849 GiB), cabeza MTP 0,243B (0,185 GB / 0,172 GiB). Total: 5,451 GB / 5,077 GiB. El tamaño del repositorio en Hugging Face es de 10,6 GB, superior al peso de los tensores, probablemente por metadatos, ficheros de configuración y duplicados de tokenizador.

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento nuevo. La arquitectura subyacente corresponde a Qwen3.5-9B, un transformer con módulo de visión (0,456B parámetros) y una cabeza de predicción multi-token (MTP, 0,243B parámetros) que permite generar varios tokens por paso de decodificación y acelera la inferencia especulativa. La cuantización oQ de oMLX asigna precisión de forma no uniforme: el 67,5% de los pesos lógicos queda en 3 bits afín (grupo 64), el 17,6% en 4 bits, el 8,7% en 5 bits, el 1,0% en 6 bits, una fracción mínima en 8 bits y un 5,1% se mantiene en BF16 (0,491B parámetros, 0,914 GiB). Esta distribución sugiere que las capas más sensibles (probablemente embeddings, normas y algunas proyecciones de atención) se preservan en mayor precisión.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni sobre si hubo RLHF, DPO u otras fases de alineamiento, ya que la model card del repositorio no los detalla. Tampoco se documenta la innovación técnica del modelo base más allá de lo inferible de los componentes (visión y MTP). La model card indica una actualización el 2026-11-13 con re-cuantización mediante oMLX v0.7.3, por lo que versiones anteriores del repositorio pueden diferir en la distribución de bits.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se documentan explícitamente en la model card.
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión de 0,456B parámetros, por lo que se espera soporte de entrada multimodal (imagen + texto).
- Predicción multi-token (MTP): la cabeza dedicada de 0,243B parámetros permite decodificación especulativa y generación de varios tokens por paso.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Modo thinking: no disponible en la información proporcionada.
- Audio: no disponible; no se declara módulo de audio.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX está pensado para ejecutarse con la librería `mlx` en Macs con chip M-series; sus ~5,08 GiB de pesos permiten cargarlo en equipos con 16 GB de memoria unificada, algo imposible con el modelo en BF16.
- Prototipado multimodal en local: al incluir módulo de visión, sirve para experimentar con tareas imagen-texto (descripción de imágenes, VQA sencilla) sin depender de la nube, siempre que se valide la calidad tras la cuantización a 3 bits.
- Aceleración de generación con MTP: la cabeza de predicción multi-token puede aprovecharse para decodificación especulativa en pipelines de generación larga, reduciendo el número de pasos de decodificación en entornos MLX.
- Evaluación de cuantizaciones agresivas: útil para investigadores que quieran medir la degradación de un modelo de ~10B al comprimirlo a 4,5 bits/peso efectivos, comparando contra el checkpoint original.
- Despliegue en estaciones de trabajo con memoria limitada: en Mac Studio o MacBook Pro con 24-32 GB, el modelo deja margen para contexto largo y otras aplicaciones simultáneas.
- Fines educativos y demos: por su reducido tamaño en disco (~5 GB de tensores), es adecuado para talleres y demostraciones de modelos multimodales cuantizados en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los tensores ocupan 5,077 GiB; con overhead de runtime MLX, contexto y buffers de activación, se recomienda un mínimo de 8-10 GB de memoria unificada para contextos cortos y 16 GB para contextos moderados.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra) por el formato MLX. No es directamente compatible con CUDA sin conversión previa.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con 16 GB o más de memoria unificada. En GPUs NVIDIA de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) requeriría reconvertir los pesos a un formato compatible (GGUF o safetensors estándar), ya que MLX es específico de Apple.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (oMLX) son las vías naturales. Para CUDA sería necesario convertir a GGUF (llama.cpp/Ollama) o a safetensors estándar (vLLM/TGI), con posible pérdida de la distribución mixta de bits si no se respeta el esquema oQ.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ3-mtp (este) | 9,653B lógicos | no disponible | MLX safetensors, 4,518 bits/peso efectivos | no disponible | Cuantización de terceros, visión + MTP, solo Apple Silicon |
| Qwen3.5-9B (original) | ~9,65B | no disponible | safetensors BF16 | no disponible en esta ficha | Checkpoint de referencia; mayor precisión, ~19 GB en BF16 |
| Qwen2.5-VL-7B | ~8B | 128K (según familia Qwen2.5-VL) | safetensors, GGUF | Apache 2.0 (familia Qwen2.5) | Alternativa multimodal oficial con licencia permisiva y amplio soporte |
| Llama 3.1 8B | 8,03B | 128K | safetensors, GGUF | Llama 3.1 Community License | Solo texto; ecosistema de cuantizaciones muy maduro |

La comparación con Qwen2.5-VL-7B y Llama 3.1 8B es orientativa: no se dispone de benchmarks del checkpoint cuantizado que permitan comparar rendimiento real, y la licencia de Qwen3.5 no está declarada en este repositorio.

## Limitaciones y advertencias

- Cuantización agresiva: el 67,5% de los pesos está en 3 bits, lo que puede degradar tareas de razonamiento, matemáticas y código frente al modelo original; no hay evaluación publicada del impacto.
- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base en este repositorio; no se debe asumir uso comercial permitido sin verificar la licencia de Qwen3.5 en su repositorio oficial.
- Idiomas no documentados: se desconoce qué lenguas cubre y con qué calidad, especialmente tras la cuantización.
- Modelo de terceros: no es una publicación oficial de Alibaba/Qwen; la autoría y el mantenimiento dependen de un único usuario, con 36 descargas y 0 likes, lo que implica bajo soporte comunitario.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación de fidelidad ni de sesgos en la información disponible.
- Compatibilidad limitada: el formato MLX restringe el despliegue a Apple Silicon; migrar a CUDA requiere conversión y posible pérdida de la distribución mixta de bits.
- Cabeza MTP y visión: no se documenta cómo interactúan con la cuantización ni si mantienen su funcionalidad completa; conviene validarlas empíricamente.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede garantizar el comportamiento en ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-oQ3-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Documentación de MLX: https://github.com/ml-explore/mlx
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
