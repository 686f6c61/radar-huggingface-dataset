# fastforks/seedvr2-vae-bf16

## Resumen

`fastforks/seedvr2-vae-bf16` no es un modelo generativo completo, sino un repositorio de pesos que contiene el VAE causal 3-D del sistema SeedVR2, desarrollado originalmente por ByteDance Seed (Wang et al., 2025) en el articulo "SeedVR2: One-Step Video Restoration via Diffusion Adversarial Post-Training". El repositorio lo mantiene el proyecto fastforks, que se limita a convertir el fichero original `ema_vae.pth` a formato safetensors en bfloat16 sin reentrenar ningun tensor, conservando las claves y la precision con la que el VAE se ejecuta en el codigo upstream.

El componente es el autoencoder variacional que codifica y decodifica video en un espacio latente tridimensional, pieza necesaria para ejecutar los modelos SeedVR2-3B y SeedVR2-7B de restauracion de video en un solo paso. Su relevancia es practica: permite cargar el VAE en ecosistemas que consumen safetensors (PyTorch, diffusers, vLLM-adjacent pipelines) sin depender del fichero `.pth` original, y garantiza integridad mediante un SHA-256 verificado en cada descarga.

El repositorio ocupa 0,5 GB y contiene un unico fichero de 478,1 MiB. No incluye model card con especificaciones de arquitectura, contexto ni idiomas; toda la informacion tecnica disponible procede de la descripcion de la conversion y de la referencia al trabajo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE causal 3-D (autoencoder variacional para video), componente del sistema SeedVR2 |
| Parametros totales | no disponible (el repo solo publica el tamano del fichero: 501.325.110 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre tensores de video) |
| Tipos de cuantizacion | bfloat16 (todos los tensores); no se publican otras variantes |
| Idiomas soportados | no disponible (componente no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`seedvr2-vae.safetensors`) |
| SHA-256 del fichero | `bcf7f47d490efcfdce05659510baec78e6bb8301ae6b2dee584a09bdfa54cd4a` |
| Repositorio de origen | `ByteDance-Seed/SeedVR2-3B` (commit `37255ff8cccfb01071b87f635a5948ca8d53117c`) |
| Fichero original | `ema_vae.pth` (SHA-256 `c7df8a67e68b7f9aca3d5d2153d2ce8ab4373687741a0f9ce87cb356ace51cac`) |

## Arquitectura y entrenamiento

El componente es un VAE causal 3-D, es decir, un autoencoder variacional que procesa video tratando la dimension temporal de forma causal para evitar filtrar informacion del futuro hacia el pasado durante la codificacion. Forma parte de la etapa de compresion latente del sistema SeedVR2, cuyo entrenamiento se describe en Wang et al. (2025) mediante post-entrenamiento adversarial con difusion en un solo paso para restauracion de video. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni detalles de la funcion de perdida del VAE.

La conversion realizada por fastforks es puramente de formato: toma `ema_vae.pth` del checkpoint upstream, convierte cada tensor a bfloat16 (la precision con la que el codigo de SeedVR2 ejecuta el VAE, segun `vae.dtype = bfloat16`) y lo serializa en safetensors conservando las claves originales. No hay reentrenamiento, destilacion ni modificacion de pesos; el script `convert_seedvr2.py` esta incluido en el repositorio para reproducir el proceso. El mismo fichero de origen aparece tanto en SeedVR2-3B como en SeedVR2-7B, por lo que este VAE es compartido por ambas variantes.

## Capacidades

- Codificacion y decodificacion de video en un espacio latente 3-D causal, necesaria para ejecutar los pipelines de restauracion de video SeedVR2.
- Compresion temporal y espacial del video para reducir el coste computacional de los modelos de difusion asociados.
- Compatibilidad directa con los modelos `seedvr2-3b@1` y `seedvr2-7b@1` del ecosistema fastforks.
- Verificacion de integridad por SHA-256 en la descarga, con rechazo de ficheros no verificados.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: es un componente de vision por video, no un modelo de lenguaje.
- No dispone de modo de pensamiento, audio ni otras modalidades.

## Casos de uso

- Restauracion de video en un solo paso: el VAE decodifica los latentes producidos por SeedVR2-3B o SeedVR2-7B para reconstruir fotogramas de alta calidad; es el componente imprescindible para cerrar el pipeline de inferencia.
- Integracion en pipelines de difusion basados en safetensors: permite cargar el VAE con `safetensors.torch.load_file` o via diffusers sin convertir manualmente el `.pth` original.
- Reproducibilidad de experimentos academicos: al publicar el SHA-256 del fichero y del original, se puede auditar que los pesos son exactamente los de ByteDance Seed y comparar resultados entre ejecuciones.
- Despliegue en entornos con requisitos de seguridad de la cadena de suministro: fastforks verifica el hash antes de cargar, lo que encaja en pipelines con controles de integridad de artefactos.
- Fine-tuning o investigacion sobre el espacio latente: al estar en bfloat16 y con las claves upstream, sirve como punto de partida para estudiar compresion latente de video o adaptar el VAE a otros dominios.
- Empaquetado de modelos para distribucion: al ser un repositorio dedicado por hash de pesos, cualquier modelo que use estos bytes puede referenciarlo como URL de descarga unica, simplificando la gestion de dependencias.
- Uso educativo: ejemplo de conversion correcta de `.pth` a safetensors conservando precision y claves, con script reproducible incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de reconstruccion (PSNR, SSIM, LPIPS) ni comparativas con otros VAEs; cualquier cifra de rendimiento del sistema SeedVR2 debe consultarse en el articulo original de Wang et al. (2025), no en este repositorio de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el fichero pesa 478,1 MiB en bfloat16, por lo que la carga en memoria de los pesos ronda los 0,5 GB, a lo que hay que sumar activaciones y latentes de video cuyo consumo depende de la resolucion y duracion del clip.
- GPU recomendadas: no disponible; al ser un componente de un pipeline de difusion de video, se espera que se ejecute en la misma GPU que los modelos SeedVR2-3B o SeedVR2-7B, pero el repositorio no especifica modelos concretos.
- Compatibilidad con GPU de consumo: los pesos caben en cualquier GPU con al menos 1 GB de VRAM libre, pero el pipeline completo (modelo de difusion + VAE + latentes) excede con toda probabilidad ese margen; no hay datos publicados al respecto.
- Opciones de despliegue: carga directa con safetensors en PyTorch; el repositorio no documenta integracion con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este componente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/seedvr2-vae-bf16` | VAE causal 3-D (SeedVR2) | no disponible (fichero 478,1 MiB) | safetensors bf16 | Apache-2.0 | Hugging Face, 0 descargas |
| `ByteDance-Seed/SeedVR2-3B` (VAE original) | VAE causal 3-D (SeedVR2) | no disponible | `.pth` | Apache-2.0 | Hugging Face |
| `ByteDance-Seed/SeedVR2-7B` (VAE original) | VAE causal 3-D (SeedVR2) | no disponible | `.pth` | Apache-2.0 | Hugging Face |

No se dispone de informacion sobre otros VAEs de video comparables (por ejemplo, los de familias de difusion de video) en la documentacion proporcionada, por lo que la comparativa se limita a las variantes del mismo componente.

## Limitaciones y advertencias

- No es un modelo autonomo: sin los pesos de SeedVR2-3B o SeedVR2-7B y el codigo de inferencia no produce ninguna salida util.
- La model card no documenta sesgos, pero al ser un componente de reconstruccion de video hereda los sesgos de los datos de entrenamiento originales de SeedVR2, no descritos en este repositorio.
- Riesgo de artefactos de reconstruccion en el VAE (difuminado, perdida de detalle fino) no cuantificado en la informacion disponible.
- Solo se publica en bfloat16; no hay variantes en float32, float16 ni cuantizaciones de menor precision, lo que limita su uso en hardware sin soporte bf16.
- La licencia Apache-2.0 permite uso comercial, pero el copyright permanece en los autores originales (ByteDance Seed); fastforks declara no estar afiliado a ellos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.
- El SHA-256 del fichero debe verificarse antes de cargarlo; el propio autor advierte de que no se carga nada sin verificar.
- No hay garantia de compatibilidad con versiones futuras del codigo de SeedVR2 si upstream cambia las claves o la precision esperada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/seedvr2-vae-bf16
- Modelo upstream SeedVR2-3B: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Commit del fichero original: https://huggingface.co/ByteDance-Seed/SeedVR2-3B/tree/37255ff8cccfb01071b87f635a5948ca8d53117c
- Model card upstream con la licencia: https://huggingface.co/ByteDance-Seed/SeedVR2-3B/blob/37255ff8cccfb01071b87f635a5948ca8d53117c/README.md
- Codigo de SeedVR2 (ByteDance-Seed): https://github.com/ByteDance-Seed/SeedVR
- Licencia del codigo upstream: https://github.com/ByteDance-Seed/SeedVR/blob/e4de8c24441a67e1b7df56abea10645059bb1185/LICENSE
- Proyecto fastforks: https://github.com/kleinicke/fastforks
- Articulo de referencia: Wang et al., "SeedVR2: One-Step Video Restoration via Diffusion Adversarial Post-Training" (2025), citado en la model card; no se proporciona URL directa en la informacion disponible.
