# asdasdadadsss/stable-diffusion-xl-base-0.9

## Resumen

El repositorio `asdasdadadsss/stable-diffusion-xl-base-0.9` aloja una copia de los pesos de SDXL 0.9, la versión preliminar del modelo de difusión texto-a-imagen de Stability AI que precedió al lanzamiento de SDXL 1.0. Se trata de un modelo de difusión latente con arquitectura UNet de doble etapa (un modelo base y un refinador opcional), diseñado para generar imágenes de alta resolución a partir de descripciones textuales. El repositorio lo publica el usuario `asdasdadadsss`, no un canal oficial de Stability AI, y no registra descargas ni interacciones en el momento de la consulta.

El dato técnico más relevante del repo es el recuento de parámetros en safetensors: 2.567.463.684 parámetros, coherente con el tamaño del SDXL base (~2.6B). El repositorio ocupa 61 GB, un tamaño desproporcionado para un único checkpoint de estas dimensiones, lo que sugiere la presencia de múltiples variantes de pesos (por ejemplo, fp32 y fp16) o artefactos adicionales. La model card reproduce íntegramente el texto de la licencia de investigación de Stability AI, que restringe el uso a fines no comerciales.

La relevancia de esta ficha es acotada: SDXL 0.9 es una versión histórica, superada por SDXL 1.0 y por modelos posteriores, y su licencia de investigación impide el uso comercial. Resulta útil como referencia para entender la evolución de la familia SDXL y para experimentación académica, pero no como opción de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente con UNet de doble etapa (base + refinador), autoencoder VAE y doble text encoder (CLIP ViT-L y OpenCLIP ViT-bigG) |
| Parametros totales | 2.567.463.684 (según safetensors del repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen; límite práctico de 77 tokens por encoder de texto) |
| Tipos de cuantizacion | No especificados en la información disponible; el formato safetensors permite fp32/fp16 y cuantizaciones de la comunidad (no documentadas aquí) |
| Idiomas soportados | No disponible (el prompt textual depende de los text encoders CLIP, predominantemente inglés) |
| Licencia | SDXL Research License (Stability AI), uso exclusivamente no comercial |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

SDXL 0.9 emplea una arquitectura de difusión latente con un UNet como denoiser principal, complementado por un segundo modelo de refinado que opera sobre la salida del primero para mejorar el detalle en alta resolución. El pipeline `StableDiffusionXLPipeline` de diffusers combina un VAE para la codificación y decodificación latente con dos codificadores de texto: CLIP ViT-L y OpenCLIP ViT-bigG, cuyas representaciones se concatenan para condicionar la generación. Esta doble codificación textual es una de las innovaciones de la familia SDXL frente a Stable Diffusion 1.5/2.x.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables de forma estándar en modelos de difusión). La model card incluida se limita al texto de la licencia y no aporta detalles sobre datos, procedimiento de entrenamiento ni innovaciones adicionales como decodificación especulativa o atención lineal. Los tags del repositorio referencian los papers arXiv 2108.01073 (LAION-5B), 2112.10752 (Stable Diffusion / latent diffusion) y 2307.01952 (SDXL), que constituyen la base técnica documentada del modelo.

## Capacidades

- Generación de imágenes a partir de prompts textuales en el pipeline texto-a-imagen de diffusers.
- Generación de alta resolución mediante la combinación del modelo base y el refinador opcional.
- Condicionamiento textual dual (CLIP ViT-L + OpenCLIP ViT-bigG), que mejora la fidelidad semántica del prompt frente a modelos con un solo encoder.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que permite despliegue vía Inference Endpoints de Hugging Face.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo generativo de imagen, no un LLM.
- No se documentan capacidades de visión, audio ni modo "thinking".
- El soporte multilingüe no está documentado y, en la práctica, está limitado por el vocabulario de los encoders CLIP, orientado al inglés.

## Casos de uso

- Investigación académica en generación de imágenes: reproducción de experimentos sobre difusión latente y comparación con SDXL 1.0, aprovechando que la licencia permite uso no comercial en investigación.
- Estudio de la evolución de la familia SDXL: análisis comparativo de la calidad del modelo 0.9 frente a versiones posteriores para documentar mejoras de arquitectura y entrenamiento.
- Prototipado interno de pipelines texto-a-imagen: validación de integraciones con `diffusers` y `StableDiffusionXLPipeline` antes de migrar a un checkpoint con licencia permisiva.
- Evaluación de la doble codificación textual: experimentos que midan cómo influye la concatenación de CLIP ViT-L y OpenCLIP ViT-bigG en la adherencia al prompt.
- Generación de datasets sintéticos con fines de investigación: creación de imágenes de referencia para tareas de visión por computador en entornos estrictamente no comerciales.
- Docencia y formación: uso en talleres sobre modelos de difusión, dado que el pipeline es estándar en diffusers y el modelo es representativo de la arquitectura SDXL.
- Pruebas de carga y despliegue: verificación de infraestructura de inferencia (GPU, memoria, latencia) con un checkpoint de ~2.6B parámetros antes de pasar a modelos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial en la información proporcionada. Por el tamaño del checkpoint (~2.6B parámetros), una estimación orientativa en fp16 ronda los 5-6 GB solo para pesos, a los que se suman VAE, text encoders y activaciones; en la práctica se recomienda un margen adicional.
- GPU recomendadas: no especificadas en la información disponible. Por el perfil del modelo, GPUs de gama alta con 16 GB o más de VRAM son el objetivo habitual para SDXL, aunque este dato no procede de la documentación del repo.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño del repo (61 GB) impide una conclusión directa sobre el checkpoint efectivo.
- Opciones de despliegue: `diffusers` (librería declarada) y endpoints compatibles según los tags; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (estas herramientas están orientadas a LLMs, no a difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| SDXL 0.9 (este repo) | ~2.567M | No disponible (texto-a-imagen) | SDXL Research License (no comercial) | Hugging Face, repo de usuario |
| SDXL 1.0 | No disponible en esta información | No disponible | Licencia SDXL (con opciones comerciales) | Hugging Face, canal oficial de Stability AI |
| Stable Diffusion 1.5 | No disponible en esta información | No disponible | CreativeML OpenRAIL-M | Hugging Face, amplia comunidad |
| Stable Diffusion 2.1 | No disponible en esta información | No disponible | CreativeML OpenRAIL++-M | Hugging Face, canal oficial |

Los datos de parámetros, contexto y rendimiento de los modelos alternativos no se han proporcionado en la información disponible; la comparativa se limita a lo que puede afirmarse con certeza sobre licencia y canal de distribución.

## Limitaciones y advertencias

- Licencia restrictiva: la SDXL Research License limita el uso a fines de investigación no comerciales y prohíbe explícitamente usos militares, de vigilancia, biometría y cualquier aplicación que infrinja derechos de terceros o normativa de privacidad (incluido el RGPD).
- Prohibición de redistribución: la licencia no permite publicar, alojar ni sublicenciar los pesos sin consentimiento previo por escrito de Stability AI, lo que afecta a la legitimidad de este repo de terceros.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir contenido incoherente, artefactos anatómicos o texto ilegible, especialmente en escenas complejas.
- Sesgos de los datos de entrenamiento: los datasets a gran escala empleados en la familia SDXL arrastran sesgos demográficos y culturales; la información disponible no detalla mitigaciones.
- Limitaciones de idioma: los text encoders CLIP están orientados al inglés; el rendimiento con prompts en castellano u otros idiomas no está documentado y previsiblemente es inferior.
- Versión preliminar: al tratarse de SDXL 0.9 (previa a 1.0), la calidad y estabilidad son inferiores a las de versiones posteriores; no es recomendable para producción.
- Repo no oficial: el publicador es `asdasdadadsss`, sin verificación de integridad ni garantía de que los pesos coincidan con los originales de Stability AI; conviene validar hashes antes de cualquier uso.
- Tamaño anómalo del repo (61 GB): puede contener duplicados o artefactos; no se especifica qué variantes de pesos incluye.
- Sin datos de benchmarks ni de rendimiento: no es posible evaluar cuantitativamente su calidad frente a alternativas con la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/asdasdadadsss/stable-diffusion-xl-base-0.9
- Paper LAION-5B (arXiv 2108.01073): https://arxiv.org/abs/2108.01073
- Paper High-Resolution Image Synthesis with Latent Diffusion Models (arXiv 2112.10752): https://arxiv.org/abs/2112.10752
- Paper SDXL: Improving Latent Diffusion Models for High-Resolution Image Synthesis (arXiv 2307.01952): https://arxiv.org/abs/2307.01952
- Documentación de `StableDiffusionXLPipeline` en diffusers: https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/stable_diffusion_xl
