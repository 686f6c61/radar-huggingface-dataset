# SamuelTallet/SDXL-Base-v1.0-SDNQ-8bit-dynamic-hadamard256

## Resumen

SDXL-Base-v1.0-SDNQ-8bit-dynamic-hadamard256 es una version cuantizada del modelo de difusion Stable Diffusion XL Base 1.0 de Stability AI, publicada por SamuelTallet. El modelo aplica la tecnica SDNQ (Static-Dynamic Numerical Quantization) con cuantizacion dinamica de 8 bits y rotacion de Hadamard con tamano de grupo 256, manteniendo la arquitectura original de SDXL y el pipeline text-to-image de diffusers.

El objetivo es reducir el peso del checkpoint original (unos 6,9 GB en fp16) hasta aproximadamente 4,1 GB, sin requerir un proceso de destilado ni un reentrenamiento completo. Se trata de una variante de conveniencia para despliegues con VRAM limitada que quieran conservar la calidad de SDXL Base 1.0.

El modelo conserva la licencia OpenRAIL++ del modelo base y esta pensado para usuarios de diffusers que ya trabajan con SDXL y quieren probar la cuantizacion SDNQ en sus pipelines. El numero de descargas es bajo (17) y no hay likes, lo que sugiere un uso experimental mas que de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (latent diffusion) de SDXL, con VAE y text encoders CLIP |
| Parametros totales | 2.567.812.804 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el prompt de texto se tokeniza con CLIP, maximo 77 tokens por encoder) |
| Tipos de cuantizacion | INT8 dinamica con rotacion de Hadamard, tamano de grupo 256 |
| Idiomas soportados | no disponible (prompts en ingles recomendados por el modelo base) |
| Licencia | openrail++ |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion XL Base 1.0: un UNet de difusion latente con atencion cruzada hacia dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG), un VAE para codificar y decodificar imagenes en el espacio latente y un scheduler de ruido. SDXL Base 1.0 se entreno sobre un dataset de aproximadamente 1.000 millones de pares imagen-texto, con un proceso de dos etapas (preentrenamiento y refinamiento) y tecnicas de micro-conditioning (resolucion, recorte, aspecto).

Esta version no reentrena el modelo: aplica cuantizacion post-entrenamiento con SDNQ, que combina cuantizacion dinamica de activaciones y pesos a 8 bits con una rotacion de Hadamard aplicada en grupos de 256 elementos. La rotacion de Hadamard reduce los valores atipicos (outliers) en las activaciones antes de cuantizar, lo que disminuye el error de cuantizacion sin necesidad de calibracion extensa. El scheduler por defecto del checkpoint es DPM++ 2M Karras.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts en lenguaje natural.
- Soporte de negative prompts, CFG (classifier-free guidance) y control de pasos de muestreo.
- Resoluciones nativas de SDXL: 1024x1024, y variantes como 896x1152, 1152x896, 1216x832, 832x1216, 1344x768 y 768x1344.
- Compatibilidad con el ecosistema diffusers: pipelines, schedulers y LoRAs de SDXL (sujeto a validacion, dado el cambio de precision de los pesos).
- No incluye tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.
- Capacidad multilingue limitada por los text encoders CLIP del modelo base; el ingles es el idioma de referencia.
- No dispone de modo thinking, vision de entrada, audio ni otras modalidades.

## Casos de uso

- Prototipado en GPU de consumo: permite ejecutar SDXL Base 1.0 en tarjetas con 8-12 GB de VRAM gracias a la reduccion del checkpoint a unos 4,1 GB, usando diffusers con el modulo SDNQ.
- Generacion de ilustraciones para blogs y documentacion tecnica: con CFG 7,5 y 25 pasos (configuracion de ejemplo del autor) se obtienen imagenes coherentes para cabeceras y figuras.
- Pruebas de concepto de cuantizacion: util para evaluar el impacto visual de SDNQ INT8 frente al modelo fp16 antes de adoptarlo en un pipeline mayor.
- Pipelines de generacion por lotes en servidores con VRAM ajustada: al reducir el peso, permite mayor concurrencia o mas instancias por GPU.
- Educacion y experimentacion: sirve para demostrar tecnicas de cuantizacion post-entrenamiento sobre modelos de difusion sin salir del ecosistema diffusers.
- Integracion en aplicaciones de escritorio o notebooks: el tamano del repo (4,1 GB) facilita la distribucion frente a los ~6,9 GB del checkpoint fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una imagen de ejemplo con el prompt "A photograph of an astronaut riding a horse", CFG 7.5, 25 pasos y semilla 826208, sin metricas cuantitativas (FID, CLIP score, etc.) ni comparacion con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB en INT8 con resolucion 1024x1024; el modelo base en fp16 requiere en torno a 10-12 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100 y H100. Cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante).
- Opciones de despliegue: diffusers (version Git) con SDNQ 0.2.0 o superior, PyTorch y Triton. No se indica soporte para llama.cpp, Ollama, vLLM ni TGI, ya que son herramientas orientadas a LLMs.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/prompt | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXL-Base-v1.0-SDNQ-8bit-dynamic-hadamard256 | 2.567.812.804 | 77 tokens por encoder CLIP | safetensors INT8 (diffusers) | openrail++ | Hugging Face, 17 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | no disponible en la informacion | 77 tokens por encoder CLIP | safetensors fp16 (diffusers) | openrail++ | Hugging Face, modelo de referencia |
| Otras variantes cuantizadas de SDXL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (FID, CLIP score) entre esta variante y el modelo base, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La cuantizacion INT8 puede introducir degradacion visual sutil (artefactos, perdida de detalle fino) respecto al modelo fp16; no se han publicado evaluaciones cuantitativas que lo midan.
- Sesgos conocidos heredados de SDXL Base 1.0: sesgos de genero, raza y cultura presentes en los datos de entrenamiento del modelo original.
- Riesgo de alucinacion visual: el modelo puede generar anatomias incorrectas, texto ilegible y composiciones incoherentes, especialmente con prompts ambiguos.
- Idiomas: los text encoders CLIP estan optimizados para ingles; el rendimiento con prompts en castellano u otros idiomas puede ser inferior.
- Licencia OpenRAIL++: permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en la licencia); es necesario revisar los terminos completos antes de desplegar en produccion.
- Dependencia de SDNQ 0.2.0 o superior y Triton: no funciona con una instalacion estandar de diffusers sin el modulo SDNQ, lo que anade complejidad al despliegue.
- Compatibilidad con LoRAs y otros adaptadores de SDXL no verificada tras la cuantizacion.
- El modelo tiene muy poca traccion (17 descargas, 0 likes) y fue publicado recientemente; no hay evidencia de comunidad ni soporte a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/SamuelTallet/SDXL-Base-v1.0-SDNQ-8bit-dynamic-hadamard256
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Repositorio SDNQ: https://github.com/Disty0/sdnq
