# cpral/HomeIMG-1.2B-PL-EN-epoch22

## Resumen

HomeIMG-1.2B-PL-EN-epoch22 es un generador de imágenes texto-a-imagen bilingüe (polaco e inglés) desarrollado por el usuario independiente cpral. Se trata de un modelo de difusión con arquitectura DiT (Diffusion Transformer) de 1.235 millones de parámetros, entrenado desde cero en ocho tarjetas gráficas domésticas, que genera imágenes de 256×256 píxeles. El modelo se condiciona mediante un codificador de texto congelado, Poziomka-Baza (un MoE de 4B de parámetros), a través de un refiner entrenable de 72,1M de parámetros.

La relevancia de este modelo reside en su enfoque de entrenamiento de bajo presupuesto y su especialización bilingüe polaco-inglés, un caso poco frecuente en el ecosistema de generación de imágenes. Es una ampliación del modelo anterior HomeIMG-641M-PL-EN-epoch19, que pasa de 6 a 12 bloques transformer, con los nuevos bloques inicializados con proyecciones de salida a cero (siguiendo el enfoque de SANA 1.5) para que el modelo arranque calculando exactamente lo mismo que su predecesor.

El modelo se distribuye bajo licencia Apache 2.0 y utiliza la librería diffusers con un pipeline personalizado (`AuroraIMG2Pipeline`). Está diseñado para investigación y experimentación en generación de imágenes de baja resolución con soporte nativo de prompts en polaco, lo que lo diferencia de la mayoría de modelos texto-a-imagen centrados exclusivamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con flow matching / rectified flow |
| Parametros totales | 1.235.000.832 (denoiser) + 72,1M (refiner) + text encoder congelado |
| Parametros activos | no disponible (el denoiser no es MoE; el text encoder MoE tiene ~450M activos de 4B) |
| Longitud de contexto | hasta 255 tokens de prompt |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el text encoder usa int8 para expertos) |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El denoiser es un Diffusion Transformer de 12 bloques con anchura 2560, 20 cabezas de atención de dimensión 128 y MLP SwiGLU de 6912. Cada bloque combina self-attention con RoPE 2D y QK-norm, cross-attention hacia el texto (anchura 1280) y MLP SwiGLU, con modulación temporal mediante adaLN-single al estilo PixArt. El modelo opera sobre una cuadrícula latente de 16×16 (un token por píxel latente) y utiliza un decodificador FLUX.2 small congelado que produce latentes de 128×16×16.

El condicionamiento textual se realiza mediante Poziomka-Baza, un modelo de lenguaje MoE bilingüe de 4B parámetros con arquitectura BailingMoeV2 (16 capas, anchura 2048, 128 expertos, 8 de 32 activos por token). Este codificador está congelado y sus pesos de expertos se almacenan en int8. Un refiner entrenable de 72,1M de parámetros (proyección 2048→1280 más 4 bloques transformer bidireccionales) adapta las características textuales al denoiser, e incluye un prompt vacío aprendido para classifier-free guidance.

El entrenamiento parte de los pesos EMA de HomeIMG-641M-PL-EN-epoch19, ampliados a 12 bloques con los nuevos bloques inicializados como identidad (proyecciones de salida a cero). Se entrenó durante 3 épocas adicionales (8750 pasos × 2016 = 17,6 millones de muestras) sobre el dataset QLNI/FLUX-Reason-6M-flux2-latents (5,88 millones de imágenes), con captions aleatorios y un 50% de ellos traducidos al polaco mediante Index-Translate-2B. El entrenamiento total acumula 22 épocas del denoiser.

## Capacidades

- Generación de imágenes texto-a-imagen a 256×256 píxeles.
- Soporte nativo de prompts en polaco e inglés, con paridad de rendimiento entre ambos idiomas.
- Generación condicionada por captions descriptivos de hasta 255 tokens.
- Control mediante classifier-free guidance (CFG) y muestreo con solver de Euler.
- Uso de pesos EMA para inferencia.
- No se documenta soporte de tool calling, agentes, visión de entrada ni audio.
- No se documenta modo de razonamiento (thinking mode) ni multi-step reasoning.

## Casos de uso

- Generación de ilustraciones para proyectos editoriales en polaco: el modelo acepta prompts directamente en polaco sin necesidad de traducción, lo que simplifica flujos de trabajo para medios y editoriales polacas que necesitan imágenes de acompañamiento a 256×256.
- Prototipado rápido de conceptos visuales: con 1,2B parámetros y resolución de 256×256, permite iterar rápidamente sobre ideas de diseño antes de pasar a modelos de mayor resolución.
- Investigación en generación bilingüe: sirve como banco de pruebas para estudiar cómo un codificador de texto MoE multilingüe condiciona un denoiser de difusión, con métricas FD-DINOv2 comparables entre idiomas.
- Educación y divulgación: su tamaño contenido y su licencia Apache 2.0 lo hacen adecuado para demostraciones docentes sobre arquitecturas DiT y flow matching en entornos con recursos limitados.
- Generación de assets para videojuegos indie: imágenes de baja resolución para sprites, iconos o texturas preliminares, con soporte de prompts en polaco para equipos de Europa del Este.
- Experimentación con fine-tuning: al ser un modelo pequeño y con licencia permisiva, es un punto de partida viable para ajuste fino en dominios específicos (estilos artísticos, productos) con presupuesto de GPU consumer.
- Evaluación de pipelines diffusers personalizados: el uso de `AuroraIMG2Pipeline` lo convierte en un caso de estudio para integración de componentes congelados y entrenables en diffusers.

## Benchmarks y rendimiento

| Modelo | Bloques | val/loss | FD-DINOv2 (EN) | FD-DINOv2 (PL) |
|---|---|---|---|---|
| HomeIMG-641M-epoch15 (WSM, Slayer149) | 6 | 0,6297 | 27,66 | – |
| HomeIMG-641M-PL-EN-epoch19 (WSM) | 6 | 0,6277 | 28,90 | 29,29 |
| HomeIMG-1.2B-PL-EN-epoch22 (EMA) | 12 | 0,6170 | – | 26,35 |

FD-DINOv2 mide la distancia de Fréchet entre características CLS de DINOv2 de imágenes generadas y reales (menor es mejor), sobre 4096 captions reservados, 50 pasos de Euler, CFG 3,0 y seeds fijos. La referencia son latentes reales decodificados con el mismo decodificador FLUX.2. La columna PL usa los mismos imágenes y ruido con prompts traducidos al polaco. Los valores no son comparables con los FD-DINOv2 publicados en artículos. val/loss es el MSE de velocity sobre los mismos 4096 imágenes con captions ingleses, ruido y t fijos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,2B parámetros en el denoiser más el codificador de texto MoE de 4B congelado, se estima un consumo moderado, apto para GPU consumer de gama alta.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar compatibilidad con RTX 3090, RTX 4090 y GPUs de datacenter (A100, H100).
- Cabe en GPU consumer: probablemente sí, dado el tamaño del denoiser, aunque el codificador de texto MoE de 4B añade carga; no confirmado en la información disponible.
- Opciones de despliegue: diffusers con el pipeline personalizado `AuroraIMG2Pipeline`; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resolución | Idiomas | Licencia |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch22 | 1,2B (denoiser) + 4B (text encoder) | 255 tokens | 256×256 | pl, en | Apache 2.0 |
| HomeIMG-641M-PL-EN-epoch19 | 641M (denoiser) | 255 tokens | 256×256 | pl, en | Apache 2.0 |
| SANA 1.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría fuera de la familia HomeIMG en la información proporcionada.

## Limitaciones y advertencias

- Resolución limitada a 256×256 píxeles, insuficiente para muchos casos de producción que requieren mayor detalle.
- Entrenado exclusivamente con captions en polaco e inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Dataset de entrenamiento basado en FLUX-Reason-6M, con posibles sesgos heredados de las imágenes y captions originales; no se documenta un análisis de sesgos.
- Riesgo de alucinación visual inherente a los modelos de difusión: puede generar elementos incoherentes o texto ilegible en las imágenes.
- El 0,3% de las traducciones al polaco fueron marcadas como defectuosas y sustituidas por el original inglés, lo que introduce una pequeña proporción de captions no bilingües.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Poziomka-Baza y el decodificador FLUX.2 tienen sus propias licencias que deben verificarse por separado.
- Modelo con solo 34 descargas y 1 like en Hugging Face; no ha pasado por validación comunitaria extensa.
- Requiere el pipeline personalizado `AuroraIMG2Pipeline` con `trust_remote_code`, lo que implica ejecutar código del autor.
- Los valores de FD-DINOv2 no son comparables con los de publicaciones académicas, según advierte el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch22
- Modelo base (predecesor): https://huggingface.co/cpral/HomeIMG-641M-PL-EN-epoch19
- Codificador de texto Poziomka-Baza: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Paper SANA 1.5: https://arxiv.org/abs/2501.18427
- Paper FD-DINOv2 (Stein et al. 2023): https://arxiv.org/abs/2306.04675
