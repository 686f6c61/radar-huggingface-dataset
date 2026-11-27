# Ouinche/Ming-Image-0.2-Design-MLX-4bit-experimental

## Resumen

Ming-Image-0.2-Design MLX 4-bit experimental es una conversión independiente de los pesos del modelo multimodal inclusionAI/Ming-Image-0.2-Design al formato MLX con cuantización weight-only, publicada por el usuario Ouinche en Hugging Face. No se trata de un lanzamiento oficial de inclusionAI ni está afiliada al equipo original: es un snapshot experimental pensado para probar la carga de pesos pre-cuantizados en entornos MLX/Swift sobre Apple Silicon. El repositorio ocupa 20,5 GB y mantiene la licencia MIT del modelo original.

El modelo subyacente es un sistema text-to-image orientado a diseño gráfico y renderizado de texto, con arquitectura etiquetada como `bailingmm_moe_v2_lite`, que combina un módulo MLLM (multimodal LLM) con un transformer de difusión (DiT) y un VAE. La conversión aplica cuantización de 4 bits al MLLM, 8 bits al connector y al transformer, y deja sin cuantizar routers, embeddings, normas, visión, VAE y capas de condicionamiento.

Es relevante ahora porque permite evaluar en hardware Apple la viabilidad de ejecutar un modelo de generación de imágenes con mezcla de expertos y salida RGBA, algo poco habitual en el ecosistema MLX. Sin embargo, el propio autor advierte que la validación se limita a la estructura de los tensores: no se ha verificado la generación de imágenes de extremo a extremo ni la paridad numérica del stack completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailingmm_moe_v2_lite` (MLLM con mezcla de expertos + DiT + VAE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX weight-only affine: 4-bit (grupo 64) en `mllm`; 8-bit (grupo 64) en `connector` y `transformer`; sin cuantizar routers, embeddings, normas, visión, glue, VAE y condicionamiento |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, con `weight` + `.scales` + `.biases`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base se etiqueta como `bailingmm_moe_v2_lite` y se descompone en tres bloques principales según el esquema de cuantización: un `mllm` con atención de decoder, MLP densa, expertos compartidos y expertos enrutados (lo que confirma un diseño de mezcla de expertos); un `connector` con auto-atención y proyecciones MLP de forma Qwen2; y un `transformer` de difusión (DiT) con proyecciones de atención y feed-forward. Se incluyen además VAE y capas de condicionamiento que permanecen en precisión original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión no aporta detalles sobre el entrenamiento del modelo original; solo describe el proceso de cuantización. La innovación técnica destacable de esta ficha es la propia conversión: cuantización selectiva por componente (4 bits para el MLLM, 8 bits para connector y DiT, sin cuantizar el resto) siguiendo el tier `q4` del port `xocialize/ming-image-swift`, preservando el layout de claves y shards del repositorio upstream.

## Capacidades

- Generación de imágenes a partir de texto (pipeline `text-to-image`).
- Diseño gráfico: la etiqueta `graphic-design` sugiere orientación a composiciones de diseño.
- Renderizado de texto en imagen (`text-rendering`), una capacidad poco común y crítica para carteles, banners y mockups.
- Salida RGBA, es decir, con canal alfa para transparencia.
- Procesamiento multimodal vía MLLM (componente `mllm` con expertos enrutados).
- No se documenta soporte de tool calling, function calling ni agentes multi-step.
- Capacidades multilingües: no disponibles.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Prototipado de diseño gráfico en Mac: generar composiciones con texto legible directamente en un equipo Apple Silicon, aprovechando la cuantización 4-bit para reducir el uso de memoria frente a los pesos originales.
- Generación de assets con transparencia: la salida RGBA permite producir iconos, logotipos o elementos de interfaz con canal alfa listos para integrarse en flujos de diseño.
- Evaluación de ports MLX: este snapshot sirve para probar si los loaders MLX/Swift (`ming-image-swift`) cargan correctamente pesos pre-cuantizados de un modelo MoE de difusión, antes de invertir en conversiones más costosas.
- Investigación sobre cuantización selectiva: comparar la calidad de un esquema mixto (4 bits en MLLM, 8 bits en DiT) frente a cuantizaciones uniformes en tareas de generación condicionada por texto.
- Creación de carteles y banners con texto renderizado: útil en entornos donde se necesita texto nítido dentro de la imagen sin post-procesado tipográfico.
- Pruebas de integración en pipelines Swift: validar la carga de safetensors MLX con triples `weight`/`.scales`/`.biases` en aplicaciones macOS nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta validaciones estructurales: recuento de tensores cuantizados (14.692 en `mllm`, 196 en `connector`, 238 en `transformer`), integridad de los triples `weight`/`.scales`/`.biases`, formas empaquetadas, dtypes, grupo y bits, reescritura de índices safetensors y `total_size`, y equivalencia bit a bit de un tensor representativo del connector frente a una cuantización MLX CPU fresca. No hay datos de calidad de imagen, FID, CLIP score ni latencia.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo pesa 20,5 GB; al ejecutarse en Apple Silicon se usa memoria unificada, por lo que se recomienda al menos 32 GB para dejar margen al VAE, activaciones y buffers de inferencia. No hay cifras oficiales.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon (M-series). No es directamente ejecutable en CUDA sin reconversión.
- ¿Cabe en consumer GPU? En el ecosistema Apple, sí en equipos con 32 GB o más de memoria unificada; en GPUs NVIDIA consumer no aplica este formato.
- Opciones de despliegue: MLX (CPU/GPU Metal) y el port `ming-image-swift`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este snapshot.
- Latencia y throughput: no disponibles. La validación se realizó en Linux x86_64 con MLX CPU 0.32.5, no en Metal/macOS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Ming-Image-0.2-Design MLX 4-bit (esta ficha) | no disponible | no disponible | safetensors MLX cuantizado | MIT | Experimental, solo validación estructural |
| inclusionAI/Ming-Image-0.2-Design (upstream) | no disponible | no disponible | safetensors (fp/bf16) | MIT | Release oficial |
| xocialize/ming-image-swift (port de referencia) | no disponible | no disponible | Swift/MLX | MIT | Port comunitario |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible comparar rendimiento numérico.

## Limitaciones y advertencias

- Estado experimental: no validado de extremo a extremo en Apple Silicon; pueden aparecer problemas de formato o calidad.
- No es un release oficial ni está afiliado a inclusionAI; el repositorio upstream es la fuente de verdad.
- No se ha verificado la paridad numérica del stack de condicionamiento completo, el denoising del DiT, el decode del VAE, el renderizado de texto ni la salida RGBA.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingüe.
- Restricciones de licencia: MIT, sin restricciones adicionales añadidas por la conversión; se incluye el `LICENSE` original sin cambios.
- No apto para producción hasta que se valide en Metal/macOS.
- El formato MLX limita su uso a hardware Apple; no es portable directamente a CUDA.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/Ouinche/Ming-Image-0.2-Design-MLX-4bit-experimental
- Pesos upstream: https://huggingface.co/inclusionAI/Ming-Image-0.2-Design
- Código upstream: https://github.com/inclusionAI/Ming-Image
- Port MLX/Swift de referencia: https://github.com/xocialize/ming-image-swift
