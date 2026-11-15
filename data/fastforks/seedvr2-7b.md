# fastforks/seedvr2-7b

## Resumen

SeedVR2 7B es un transformer de difusion para restauracion de video en un solo paso, desarrollado originalmente por ByteDance Seed (Wang et al., 2025) bajo el titulo "SeedVR2: One-Step Video Restoration via Diffusion Adversarial Post-Training". Este repositorio concreto, publicado por el proyecto fastforks, no es un modelo nuevo: es una conversion a formato safetensors de los pesos oficiales `seedvr2_ema_7b.pth` de ByteDance-Seed/SeedVR2-7B, con los pesos lineales y de normalizacion en bfloat16 y los vectores AdaSingle (shift/scale/gate) en float32.

El modelo resuelve el problema de la restauracion de video de alta calidad (superresolucion, eliminacion de ruido, correccion de artefactos de compresion) mediante post-entrenamiento adversarial sobre un difusion transformer, consiguiendo la restauracion en un unico paso de difusion en lugar de los multiples pasos habituales. El repositorio incluye ademas el embedding de prompt positivo (`pos_emb.pt`) almacenado como tensor `txt`, necesario para la inferencia.

La relevancia de esta ficha es doble: por un lado documenta un modelo de restauracion de video de 7B parametros con licencia Apache-2.0; por otro, ejemplifica el patron de "repositorio de pesos" que usa fastforks para deduplicar ficheros por SHA-256. No hay pipeline declarado en Hugging Face ni idiomas especificados, y el repo pesa 16,5 GB (un unico fichero de 15,35 GiB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para restauracion de video, post-entrenamiento adversarial en un paso |
| Parametros totales | 7B (segun nombre del modelo y pesos upstream) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision/video, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 y float32 en el safetensors convertido) |
| Idiomas soportados | no disponible (no aplica: modelo de imagen/video) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`seedvr2-7b.safetensors`, 16 482 579 008 bytes, SHA-256 `bf73826841cfd31895370e92472fae58810ef456310dcc7a167e22dd673eeb7b`) |

## Arquitectura y entrenamiento

La arquitectura es un diffusion transformer (DiT) de 7B parametros orientado a restauracion de video. El entrenamiento descrito en el paper de referencia (Wang et al., 2025) emplea post-entrenamiento adversarial para lograr restauracion en un solo paso, reduciendo el coste de inferencia frente a los esquemas de difusion iterativa. El repositorio no aporta detalles adicionales sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

La conversion realizada por fastforks preserva las claves del modelo original: los pesos lineales y de normalizacion se guardan en bfloat16 (los valores que el autocast bf16 de upstream usa), los vectores AdaSingle de shift, scale y gate en float32, se eliminan los buffers fijos de RoPE (`freqs`) y se almacena el embedding de prompt positivo como tensor `txt`. No hay reentrenamiento: los bytes corresponden a los pesos EMA del modelo oficial. El fichero de origen es `seedvr2_ema_7b.pth` (SHA-256 `e1b2ae25505607e61f2a7dc7967ba778aaf3e3626d9969ce6e24c52d9ddebfcd`) y el embedding `pos_emb.pt` (SHA-256 `fa07a14844314772266b66c3b95deb0027696d8fe7065721263db5176f45d799`), publicado en ByteDance-Seed/SeedVR2-3B.

## Capacidades

- Restauracion de video en un solo paso de difusion: superresolucion, eliminacion de ruido y correccion de artefactos de compresion.
- Restauracion de imagen (el modelo upstream opera sobre fotogramas; el pipeline concreto no esta documentado en este repo).
- Condicionamiento por prompt positivo mediante el embedding `txt` incluido en los pesos.
- No soporta tool calling, function calling ni agentes: es un modelo generativo visual, no un LLM.
- No hay capacidades multilingues ni de texto declaradas.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Restauracion de archivo audiovisual: aplicar el modelo a metraje historico o de baja calidad para recuperar detalle y reducir ruido, aprovechando el enfoque de un solo paso que abarata el procesado por fotograma frente a difusion iterativa.
- Limpieza de video comprimido para plataformas de streaming: corregir artefactos de bloque y ringing en contenido reencodeado antes de su publicacion.
- Preprocesado para pipelines de vision por computador: mejorar la calidad de videos de entrada antes de tareas de deteccion, seguimiento o reidentificacion, donde el ruido degrada la precision.
- Superresolucion de material de vigilancia o drones: aumentar la resolucion efectiva de grabaciones de baja calidad para analisis forense, con la salvedad de que el modelo no crea informacion verificable.
- Restauracion de video para e-commerce y marketing: limpiar clips de producto grabados con movil para su uso en catalogo o redes.
- Investigacion en restauracion de video: servir como baseline reproducible de 7B con pesos en safetensors para comparar metodos de post-entrenamiento adversarial.
- Integracion en herramientas de edicion: usar el modelo como paso de restauracion dentro de un pipeline de postproduccion, con descarga verificada por SHA-256 mediante `fastforks download`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo de 7B en bfloat16 ocupa aproximadamente 14 GB solo en pesos, a lo que hay que sumar activaciones y buffers de video; el fichero safetensors pesa 15,35 GiB.
- GPU recomendadas: no disponible. Por tamano, se requiere al menos una GPU con 24 GB o mas (RTX 3090/4090, A100, H100) para inferencia en bf16 sin cuantizar; no confirmado por el autor.
- Cabe en GPU consumer: previsiblemente en RTX 3090/4090 (24 GB) en bf16, aunque no esta verificado en la informacion disponible.
- Opciones de despliegue: el repo esta pensado para el runtime de fastforks (descarga con verificacion SHA-256 y comando `fastforks download MODEL`); tambien es accesible via `hf download fastforks/seedvr2-7b seedvr2-7b.safetensors`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeedVR2 7B (este repo) | 7B | DiT restauracion video, 1 paso | no aplica | Apache-2.0 | safetensors en HF (fastforks) |
| SeedVR2-7B (ByteDance-Seed) | 7B | DiT restauracion video | no aplica | Apache-2.0 | pesos `.pth` originales en HF |
| SeedVR2-3B (ByteDance-Seed) | 3B | DiT restauracion video | no aplica | Apache-2.0 | pesos originales en HF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio es una conversion de pesos, no un modelo entrenado por fastforks; el copyright permanece en los autores y fastforks no esta afiliado a ellos.
- No hay model card funcional en este repo: faltan instrucciones de inferencia, pipeline y ejemplos de uso mas alla de la descarga.
- El embedding de prompt positivo esta embebido en los pesos como tensor `txt`; cambiar de prompt requiere sustituir ese tensor, lo que limita la flexibilidad.
- Riesgo de alucinacion visual: como modelo generativo, puede inventar detalle plausible no presente en el original; no es adecuado para uso forense sin validacion humana.
- No se documentan sesgos, limitaciones de idioma ni restricciones adicionales de uso comercial mas alla de la licencia Apache-2.0.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- La fecha de creacion (2026-11-15) y el nombre del autor sugieren un espejo automatizado; conviene verificar la integridad SHA-256 antes de cargar los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/seedvr2-7b
- Modelo upstream: https://huggingface.co/ByteDance-Seed/SeedVR2-7B
- Modelo upstream 3B (origen de `pos_emb.pt`): https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Codigo oficial: https://github.com/ByteDance-Seed/SeedVR
- Proyecto fastforks: https://github.com/kleinicke/fastforks
- Paper: Wang et al., "SeedVR2: One-Step Video Restoration via Diffusion Adversarial Post-Training" (2025)
