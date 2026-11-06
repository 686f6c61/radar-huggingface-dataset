# cpral/HomeIMG-641M-PL-stage1

## Resumen

HomeIMG-641M-PL-stage1 es un generador de imágenes texto-a-imagen de 641 millones de parámetros desarrollado por el usuario independiente cpral. Se trata de la primera versión bilingüe polaco-inglés de la familia HomeIMG, un proyecto que entrena generadores de difusión desde cero en hardware doméstico (8 tarjetas RTX 3090 Ti). El modelo produce imágenes de 256×256 píxeles y está pensado como una prueba de concepto de investigación, no como un producto listo para producción.

La arquitectura combina un denoiser DiT (Diffusion Transformer) de 641,1M de parámetros con un text encoder basado en Poziomka-Baza, un modelo de lenguaje MoE polaco-inglés de 4B parámetros, al que se le ha añadido un refiner de 72,1M entrenado desde cero. Este repositorio corresponde al **etapa 1 de 2** del proceso de adaptación al bilingüismo: solo se entrenó el refiner mientras el denoiser permaneció congelado, de modo que el refiner aprende a traducir prompts polacos y ingleses al "lenguaje" que el denoiser ya conocía.

Su relevancia es doble: por un lado, demuestra que es viable entrenar un pipeline de difusión completo con recursos de consumo; por otro, explora la adaptación de un generador entrenado originalmente en inglés a otro idioma sin reentrenar el denoiser, una estrategia interesante para la comunidad que investiga eficiencia en el entrenamiento de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con text encoder MoE + refiner transformer |
| Parametros totales | 641.104.896 (denoiser) + 72,1M (refiner); text encoder Poziomka-Baza 4B (congelado, int8) |
| Parametros activos | No aplica al denoiser; text encoder MoE con ~450M activos de ~1,16B por token (8 de 32 expertos activos) |
| Longitud de contexto | Hasta 255 tokens de prompt |
| Tipos de cuantizacion | Pesos del text encoder en int8 (escala por experto y columna, multiplicaciones en bf16); no se documentan otras cuantizaciones |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers, con custom_code) |

## Arquitectura y entrenamiento

El denoiser es un DiT de 641,1M de parámetros con 6 bloques de anchura 2560, 20 cabezas de atención, SwiGLU de 6912 y cross-attention hacia el texto con anchura 1280. En este etapa permaneció completamente congelado, usando los pesos EMA del paso 86.997 del entrenamiento de HomeIMG-641M-epoch15. El text encoder es Poziomka-Baza, un modelo de lenguaje MoE basado en BailingMoeV2 con 16 capas de anchura 2048 y 128 expertos, del que se activan 8 de los 32 expertos por token (unos 450M parámetros activos en lugar de 1,16B, con una caída de solo 0,2 puntos en BLiMP: 68,3% frente a 68,5%). Los pesos de los expertos se almacenan en int8, reduciendo el tamaño de 7,7 GB a 4,2 GB. Sobre él se entrenó desde cero un refiner de 72,1M: una proyección 2048→1280, cuatro bloques de transformer bidireccional (anchura 1280, 20 cabezas q / 5 kv, RoPE 1D, SwiGLU 3456), RMSNorm y un prompt vacío aprendido para CFG. El decodificador es el FLUX.2 small decoder, con latentes de 128×16×16.

El entrenamiento de este etapa usó el dataset QLNI/FLUX-Reason-6M-flux2-latents (5,88 millones de imágenes sintéticas generadas por FLUX), con captions aleatorios y un 50% de ellos traducidos al polaco mediante Index-Translate-2B (las traducciones marcadas como defectuosas, un 0,3%, se sustituyeron por el original inglés). Se completó una época en 5.743 pasos × 1024 = 5,88 millones de muestras (unos 2,9 millones de prompts polacos), con objetivo rectified flow y un 10% de prompts sustituidos por el vacío. Solo se optimizó el refiner, usando MuLoCo (promediado de 8 réplicas cada 64 pasos), Muon (CMuon) con lr 3e-3 y AdamW para el resto. El entrenamiento se ejecutó en 8× RTX 3090 Ti a unos 650 imágenes/s durante aproximadamente 2,5 horas, con optimizaciones como agrupación de micro-batches por longitud de prompt y un kernel Triton único para los expertos MoE.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución de 256×256 píxeles.
- Comprensión de prompts tanto en polaco como en inglés, con el mismo ruido inicial para comparaciones pareadas.
- Generación condicionada por prompt de hasta 255 tokens.
- Soporte de classifier-free guidance (CFG) con prompt vacío aprendido.
- Muestreo con integrador de Euler (50 pasos, CFG 3,0 en los ejemplos de la model card).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- **Investigación en adaptación lingüística de modelos de difusión**: el modelo sirve como banco de pruebas para estudiar cómo un refiner pequeño puede adaptar un denoiser entrenado en inglés a un segundo idioma sin reentrenarlo, comparando pérdidas de velocity MSE entre configuraciones.
- **Generación de prototipos visuales rápidos en polaco**: equipos que trabajen en polaco pueden generar bocetos de 256×256 para ilustrar conceptos, maquetas o ideas de producto sin depender de traductores intermedios.
- **Docencia y divulgación sobre difusión**: al ser un modelo pequeño (641M) entrenado en hardware de consumo, es adecuado para explicar el funcionamiento de un pipeline DiT + text encoder + refiner en cursos y talleres.
- **Experimentación con text encoders MoE**: el uso de Poziomka-Baza con activación selectiva de expertos y cuantización int8 permite investigar el equilibrio entre calidad y eficiencia en la codificación de texto para difusión.
- **Generación bilingüe comparativa**: investigadores que estudien sesgos o diferencias de representación entre idiomas pueden generar pares de imágenes con el mismo ruido y prompts equivalentes en polaco e inglés.
- **Pruebas de integración con diffusers y custom_code**: el modelo requiere cargar código personalizado, por lo que es útil para validar flujos de trabajo de integración de modelos con componentes no estándar en la librería diffusers.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con velocity MSE sobre un conjunto reservado (captions en inglés, ruido y t fijos), pero los valores de val/loss aparecen como "TODO" tanto para el modelo base HomeIMG-641M-epoch15 como para este HomeIMG-641M-PL-stage1. La métrica FD-DINOv2 se medirá tras el etapa 2.

| Modelo | Text encoder | val/loss (velocity MSE) |
|---|---|---|
| HomeIMG-641M-epoch15 (EMA, punto de partida) | Slayer149 + refiner 35,7M | TODO |
| HomeIMG-641M-PL-stage1 (EMA, este repo) | Poziomka-Baza + refiner 72,1M | TODO |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 8 GB según la model card (Linux, GPU con CUDA).
- **GPU recomendadas**: el autor ha validado el entrenamiento en 8× RTX 3090 Ti; para inferencia, cualquier GPU con al menos 8 GB de VRAM y soporte CUDA debería ser suficiente, aunque no se documentan pruebas en otras tarjetas.
- **¿Cabe en GPU de consumo?**: sí, según el autor, con unas 8 GB de VRAM; encajaría en RTX 3060 12GB, RTX 3070/3080, RTX 4060 Ti 16GB, RTX 4070 y superiores.
- **Opciones de despliegue**: el modelo no funciona todavía en diffusers de forma estándar; se carga mediante el script `sample_ckpt.py` del repositorio de entrenamiento (https://github.com/adamo1139/trenowanie_generatora_obrazkow). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- **Latencia y throughput**: no disponibles para inferencia; en entrenamiento se alcanzaron unas 650 imágenes/s con 8× RTX 3090 Ti.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada. A continuación se comparan características estructurales con alternativas de la misma categoría (generadores texto-a-imagen de pequeño tamaño o proyectos de investigación):

| Modelo | Parámetros | Contexto de prompt | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HomeIMG-641M-PL-stage1 | 641M (denoiser) + 72,1M (refiner) + 4B (text encoder congelado) | 255 tokens | pl, en | Apache 2.0 | Hugging Face, requiere custom_code |
| HomeIMG-641M-epoch15 | 641M (denoiser) + 35,7M (refiner) + Slayer149 | no disponible | en (principalmente) | no disponible en la información | Hugging Face |
| SDXL-Turbo / SD 1.5 (referencia de categoría) | ~1B / ~860M | 77 tokens (SD1.5), 77+ tokens (SDXL) | en (principalmente) | licencias variables | amplia disponibilidad y soporte en diffusers |

La comparación con modelos comerciales o de mayor tamaño (FLUX, SD3) no resulta significativa por diferencia de escala y resolución; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- **Modelo de investigación**: solo genera 256×256 píxeles y fue entrenado con unos 6 millones de imágenes sintéticas generadas por FLUX, no con datos reales.
- **Etapa intermedia**: el denoiser no ha visto ningún prompt en polaco durante el entrenamiento; los detalles que no aprendió en inglés tampoco aparecerán en polaco. La calidad bilingüe está limitada por esta restricción.
- **Calidad de las traducciones**: los captions polacos provienen de un traductor automático (Index-Translate-2B) y aunque se filtraron los defectuosos (0,3%), pueden persistir imprecisiones.
- **Riesgo de alucinación visual**: como todo modelo generativo, puede producir imágenes incoherentes, con anatomía incorrecta o texto ilegible, especialmente en prompts complejos.
- **Restricciones de licencia**: la licencia es Apache 2.0, lo que permite uso comercial, pero el modelo base Poziomka-Baza y el decodificador FLUX.2 small tienen sus propias condiciones que deben verificarse por separado.
- **Integración limitada**: no funciona aún en diffusers sin código personalizado; requiere clonar el repositorio de entrenamiento y ejecutar scripts específicos.
- **Sesgos**: no se documentan análisis de sesgos; al entrenarse sobre un dataset sintético generado por FLUX, puede heredar sesgos de representación de ese modelo.
- **Idiomas**: solo se ha validado en polaco e inglés; no hay garantías para otros idiomas.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los benchmarks de validación están pendientes (TODO), por lo que no hay evidencia cuantitativa publicada de su calidad final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-641M-PL-stage1
- Modelo base (Poziomka-Baza): https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Modelo predecesor (HomeIMG-641M-epoch15): https://huggingface.co/cpral/HomeIMG-641M-epoch15
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Repositorio de código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
