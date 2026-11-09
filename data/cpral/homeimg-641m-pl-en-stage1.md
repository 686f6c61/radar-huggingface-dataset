# cpral/HomeIMG-641M-PL-EN-stage1

## Resumen

HomeIMG-641M-PL-EN-stage1 es un generador de imágenes de texto a imagen de 641,1 millones de parámetros desarrollado por el usuario cpral. Se trata de la primera versión bilingüe polaco-inglés de la familia HomeIMG, entrenada íntegramente desde cero en ocho tarjetas gráficas domésticas RTX 3090 Ti. El modelo produce imágenes de 256×256 píxeles a partir de prompts en polaco o inglés de hasta 255 tokens.

La arquitectura combina un denoiser DiT (diffusion transformer) de 641,1M de parámetros, un text encoder basado en el modelo de lenguaje MoE Poziomka-Baza (4B, bilingüe polaco-inglés) y un refiner de 72,1M entrenado desde cero que proyecta las representaciones textuales al espacio que el denoiser espera. El decodificador es el FLUX.2 small decoder, con latentes de 128×16×16. El entrenamiento sigue el paradigma de rectified flow (flow matching).

Este repositorio corresponde al **etapa 1 de 2**: solo se entrenó el refiner mientras el denoiser permanecía congelado, de modo que el refiner aprende a traducir prompts polacos y ingleses al "idioma" que el denoiser ya conocía de la versión anterior (Slayer149). Es relevante como ejemplo de adaptación bilingüe de bajo coste sobre un pipeline existente y como caso práctico de entrenamiento de difusión en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (denoiser) + text encoder MoE BailingMoeV2 (Poziomka-Baza) + refiner transformer + decodificador FLUX.2 small |
| Parametros totales | 641.104.896 (denoiser); refiner adicional de 72,1M; text encoder Poziomka-Baza de 4B con ~450M activos |
| Parametros activos | ~450M en el text encoder MoE (8 de 32 expertos activos por token) |
| Longitud de contexto | 255 tokens de prompt |
| Tipos de cuantizacion | Ekspertos del text encoder en int8 (escala por experto y columna, multiplicaciones en bf16); pesos del modelo en bf16 |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers, pipeline custom `AuroraIMG2Pipeline`) |

## Arquitectura y entrenamiento

El denoiser es un DiT de 6 bloques con anchura 2560, 20 cabezas de atención, SwiGLU de 6912 y cross-attention hacia texto con anchura 1280. En este etapa permanece congelado en los pesos EMA del paso 86.997 del entrenamiento de HomeIMG-641M-epoch15. El text encoder es Poziomka-Baza, un modelo de lenguaje MoE bilingüe basado en BailingMoeV2 con 16 capas de anchura 2048 y 128 expertos, del que se usan 8 de los 32 activos por token (unos 450M de parámetros activos en lugar de 1,16B); en la prueba BLiMP rinde al 68,3% frente al 68,5% con 32 expertos. Los pesos de los expertos se almacenan en int8, lo que reduce el espacio de 7,7 GB a 4,2 GB. El refiner, entrenado desde cero, consta de una proyección 2048→1280 seguida de 4 bloques transformer bidireccionales (anchura 1280, 20 cabezas q / 5 kv, RoPE 1D, SwiGLU 3456), RMSNorm y un prompt vacío aprendido para CFG.

El entrenamiento usó el dataset QLNI/FLUX-Reason-6M-flux2-latents (5,88 millones de imágenes) con captions aleatorios, de los cuales el 50% estaban en polaco (traducidos con Index-Translate-2B; el 0,3% marcado como defectuoso se sustituyó por el original inglés). Se realizó una época de 5.743 pasos × 1024 = 5,88 millones de muestras (unos 2,9 millones de prompts polacos). El objetivo fue rectified flow, con el 10% de prompts sustituidos por vacío. Solo se entrenó el refiner, con MuLoCo (promediado de 8 réplicas cada 64 pasos), Muon (CMuon) con lr 3e-3 y AdamW para el resto, sin REPA. El entrenamiento se ejecutó en 8× RTX 3090 Ti a unos 650 imágenes/s durante aproximadamente 2,5 horas. Se aplicaron optimizaciones de eficiencia: agrupación de micro-batches por longitud de prompt con recorte del padding y cómputo de los expertos MoE en un único kernel Triton en lugar de un bucle sobre 128 expertos.

## Capacidades

- Generación de imágenes de texto a imagen a 256×256 píxeles con 50 pasos de Euler y CFG 3,0.
- Soporte bilingüe real de prompts en polaco e inglés, con el mismo ruido inicial para prompts equivalentes en ambos idiomas, lo que permite comparaciones pareadas.
- Comprensión de prompts descriptivos de escenas, estilos artísticos (fotografía, acuarela, arte digital) y objetos concretos.
- Generación de texto dentro de la imagen en casos sencillos (por ejemplo, un letrero con la palabra OPEN en neón).
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo de pensamiento (thinking mode), visión, audio ni otras modalidades de entrada.
- Capacidad multilingüe limitada a polaco e inglés.

## Casos de uso

- **Generación de ilustraciones para prototipos y maquetas**: el modelo produce imágenes de 256×256 en menos de lo que requiere un pipeline de mayor resolución, adecuado para iterar rápidamente sobre conceptos visuales en fase de diseño.
- **Contenido bilingüe para mercados polaco e inglés**: permite generar la misma escena a partir de un prompt en polaco o en inglés con el mismo ruido inicial, útil para campañas o materiales que deben funcionar en ambos idiomas.
- **Investigación en adaptación de text encoders**: al ser un etapa 1 con denoiser congelado y refiner entrenado desde cero, sirve como banco de pruebas controlado para estudiar cómo un refiner aprende a alinear un nuevo espacio textual con un denoiser preexistente.
- **Docencia y experimentación en difusión**: su tamaño (641M) y sus requisitos de ~8 GB de VRAM permiten ejecutarlo en una GPU de consumo, lo que lo hace apto para cursos y talleres sobre flow matching y arquitecturas DiT.
- **Generación de datasets sintéticos de baja resolución**: puede producir lotes de imágenes 256×256 etiquetadas a partir de prompts controlados, útiles para preentrenamiento o aumentación de datos en tareas de visión.
- **Evaluación comparativa de pipelines bilingües**: la inclusión del text encoder completo (Poziomka en bf16 con expertos en int8) y su tokenizer en el repositorio facilita reproducir experimentos de generación condicionada por texto en dos idiomas sin dependencias externas.
- **Pruebas de concepto de despliegue en hardware doméstico**: con 8 GB de VRAM y licencia Apache 2.0, es viable integrarlo en entornos de demostración o prototipos internos sin infraestructura de centro de datos.

## Benchmarks y rendimiento

El autor reporta únicamente la métrica de validación velocity MSE sobre un conjunto reservado con captions en inglés, ruido y t fijos (misma evaluación que en los logs de entrenamiento; menor es mejor):

| Modelo | Text encoder | val/loss |
|---|---|---|
| HomeIMG-641M-epoch15 (EMA, punto de partida) | Slayer149 + refiner 35,7M | 0,6304 |
| HomeIMG-641M-PL-EN-stage1 (EMA, este repositorio) | Poziomka-Baza + refiner 72,1M | 0,6316 |

La métrica FD-DINOv2 se medirá tras el etapa 2. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 8 GB, según indica el autor.
- **GPU recomendadas**: RTX 3090 Ti (usada en el entrenamiento), así como cualquier GPU con al menos 8 GB de VRAM; A100 y H100 son compatibles pero sobredimensionadas para este modelo.
- **Cabe en GPU de consumo**: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti 8 GB, RTX 3070, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090).
- **Opciones de despliegue**: `DiffusionPipeline` de diffusers con `custom_pipeline` y `trust_remote_code=True`, requiriendo `AutoencoderKLFlux2`. No se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de este tipo).
- **Latencia y throughput**: no se han publicado cifras de latencia ni de throughput de inferencia en la información disponible. Durante el entrenamiento se alcanzaron unos 650 imágenes/s en 8× RTX 3090 Ti, pero esa cifra corresponde al entrenamiento, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de prompt | Resolución | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HomeIMG-641M-PL-EN-stage1 | 641,1M (denoiser) + refiner 72,1M + text encoder 4B | 255 tokens | 256×256 | pl, en | Apache 2.0 | Hugging Face (diffusers, custom pipeline) |
| HomeIMG-641M-epoch15 | 641M (denoiser) + refiner 35,7M | no disponible | 256×256 | no disponible (probablemente en) | no disponible | Hugging Face |
| FLUX.2 small (decodificador usado) | no disponible | no disponible | no disponible | no disponible | no disponible | Referenciado como componente del decodificador |

No se dispone de información suficiente sobre otros modelos comparables de la misma categoría (generadores de texto a imagen de ~600M de parámetros entrenados desde cero y con soporte bilingüe polaco-inglés) en la documentación proporcionada.

## Limitaciones y advertencias

- **Modelo de investigación**: el autor lo describe explícitamente como modelo de investigación, limitado a 256×256 píxeles y entrenado sobre unos 6 millones de imágenes de naturaleza sintética.
- **Solo etapa 1 de 2**: el denoiser está congelado y solo se entrenó el refiner; el rendimiento final puede diferir del modelo completo tras el etapa 2.
- **Resolución fija**: la salida es siempre de 256×256 píxeles, lo que limita su uso en producción que requiera mayor resolución.
- **Longitud de prompt limitada**: máximo de 255 tokens, sin posibilidad de condicionamiento más largo.
- **Cobertura lingüística restringida**: solo polaco e inglés; otros idiomas no están soportados.
- **Riesgo de alucinación visual**: como todo modelo generativo de imágenes, puede producir contenido incoherente, anatómicamente incorrecto o no fiel al prompt, especialmente en escenas complejas o con múltiples objetos.
- **Sesgos**: no se documentan análisis de sesgos en la información disponible; al entrenarse sobre un dataset de captions traducidos automáticamente, puede heredar sesgos de la traducción y del corpus original.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo se distribuye como material de investigación.
- **Dependencia de código personalizado**: requiere `trust_remote_code=True` y una versión de diffusers con `AutoencoderKLFlux2`, lo que añade riesgo de compatibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-641M-PL-EN-stage1
- Modelo base (Poziomka-Baza): https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Modelo anterior (denoiser de origen): https://huggingface.co/cpral/HomeIMG-641M-epoch15
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
- Versión en inglés de la model card: https://huggingface.co/cpral/HomeIMG-641M-PL-EN-stage1/blob/main/README_en.md
