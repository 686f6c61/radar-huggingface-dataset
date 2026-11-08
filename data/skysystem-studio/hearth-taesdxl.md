# skysystem-studio/hearth-taesdxl

## Resumen

Hearth-taesdxl es un autoencoder ligero publicado por el usuario skysystem-studio en Hugging Face, derivado del conocido TAESDXL (Tiny AutoEncoder for Stable Diffusion XL) de MadeByOllin. Se trata de un componente auxiliar para el ecosistema de difusion SDXL: reproduce la "latent API" del VAE oficial de SDXL pero con un modelo extremadamente compacto (2.445.063 parametros), pensado para previsualizaciones en tiempo real del proceso de generacion.

El modelo no es un modelo de lenguaje ni un generador de imagenes autonomo: es un decodificador (y presumiblemente codificador) de latentes a pixeles que se acopla a pipelines de diffusers para mostrar resultados intermedios sin el coste computacional del VAE completo. Su utilidad es practica: reducir el tiempo entre paso y paso en interfaces de generacion, permitiendo al usuario ver aproximaciones rapidas de la imagen mientras el sampler sigue trabajando.

La relevancia de esta ficha es limitada por la escasez de documentacion: la model card solo declara licencia MIT y no incluye detalles de entrenamiento, pipeline ni idiomas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere pesos muy pequenos o un repo practicamente vacio. Se describe, por tanto, lo que puede inferirse de los metadatos y del modelo base TAESDXL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional ligero (TAESDXL, latent API compatible con SDXL-VAE) |
| Parametros totales | 2.445.063 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision/autoencoder, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp32/fp16) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a TAESDXL, un autoencoder convolucional muy reducido que replica la interfaz de latentes del VAE de SDXL (4 canales latentes, factor de compresion 8x). Su funcion es codificar imagenes a latentes y decodificar latentes a pixeles con una fraccion de los parametros del VAE completo, sacrificando fidelidad por velocidad. El modelo base TAESDXL se distribuye a traves de diffusers y se usa tipicamente como decodificador de previsualizacion durante el muestreo.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, la composicion de datos ni si hubo destilacion desde el VAE oficial de SDXL. La model card del autor no aporta detalles tecnicos y el README solo incluye la declaracion de licencia MIT. Cualquier afirmacion sobre el proceso de entrenamiento de esta variante concreta seria especulativa.

## Capacidades

- Decodificacion rapida de latentes SDXL a imagenes RGB para previsualizacion en tiempo real.
- Codificacion de imagenes a latentes compatibles con la API de SDXL-VAE (segun el modelo base TAESDXL).
- Integracion en pipelines de diffusers como decodificador alternativo (`AutoencoderTiny`).
- No genera texto, no razona, no soporta tool calling ni agentes.
- No procesa lenguaje natural ni tiene capacidades multilingues.
- No dispone de modo thinking, vision de alto nivel ni audio.

## Casos de uso

- Previsualizacion en interfaces de generacion de imagenes: decodificar latentes en cada paso del sampler para mostrar al usuario una aproximacion rapida mientras SDXL sigue generando, reduciendo la latencia percibida.
- Prototipado de pipelines SDXL: validar rapidamente la forma y composicion de una imagen antes de lanzar la decodificacion final con el VAE completo.
- Herramientas de bajo consumo: entornos con GPU limitada donde el VAE completo no cabe o ralentiza el flujo, usando este autoencoder como decodificador ligero.
- Depuracion de latentes: inspeccionar visualmente latentes intermedios en investigacion sobre samplers y schedulers de SDXL.
- Demos interactivas: aplicaciones web o notebooks que necesitan feedback visual inmediato sin esperar la decodificacion completa.
- Educacion y divulgacion: mostrar el funcionamiento interno de la difusion latente con un componente de 2,4 M de parametros facil de inspeccionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos (2,4 M de parametros en fp32 ocupan unos 10 MB; en fp16, unos 5 MB), mas el coste del pipeline SDXL que lo acompania.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para el autoencoder; el cuello de botella sera el modelo de difusion principal.
- Cabe en GPU consumer y en CPU para decodificacion puntual, aunque la latencia en CPU puede no ser competitiva.
- Opciones de despliegue: diffusers (`AutoencoderTiny`), integracion en ComfyUI y Automatic1111 mediante componentes TAESD; no aplica llama.cpp, Ollama ni vLLM (no es un LLM).
- Latencia y throughput: no disponibles en la informacion proporcionada; por diseno, TAESDXL es ordenes de magnitud mas rapido que el VAE completo de SDXL.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|
| skysystem-studio/hearth-taesdxl | 2.445.063 | Autoencoder ligero SDXL | MIT | Hugging Face (0 descargas) |
| Manojb/taesdxl | no disponible | Autoencoder ligero SDXL (TAESDXL) | no disponible | Hugging Face |
| VAE oficial SDXL | no disponible (cientos de millones) | VAE completo SDXL | no disponible | diffusers / Stability |
| TAESD (SD1.x/2.x) | no disponible | Autoencoder ligero SD1.x/2.x | no disponible | Hugging Face |

## Limitaciones y advertencias

- Fidelidad reducida: al ser un autoencoder tiny, la reconstruccion es aproximada y no apta como salida final de calidad.
- Compatibilidad limitada a SDXL: no es intercambiable con VAEs de SD1.x/SD2.x.
- Documentacion practicamente inexistente: sin pipeline declarado, sin idiomas, sin detalles de entrenamiento.
- Repositorio sin traccion: 0 descargas y 0 likes; no hay evidencia de validacion por la comunidad.
- Tamano de repo 0.0 GB: conviene verificar que los pesos esten efectivamente subidos antes de integrarlo.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Riesgo de artefactos y perdida de detalle en imagenes con texturas finas o texto, inherente al diseno TAESD.
- No sustituye al VAE oficial para evaluacion de calidad o publicacion final.

## Enlaces

- Hugging Face: https://huggingface.co/skysystem-studio/hearth-taesdxl
- Modelo base de referencia: https://huggingface.co/Manojb/taesdxl
- Documentacion de diffusers sobre autoencoders tiny: https://huggingface.co/docs/diffusers/api/models/autoencoder_tiny
