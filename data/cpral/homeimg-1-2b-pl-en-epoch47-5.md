# cpral/HomeIMG-1.2B-PL-EN-epoch47.5

## Resumen

HomeIMG-1.2B-PL-EN-epoch47.5 es un generador de imágenes texto-a-imagen bilingüe (polaco e inglés) desarrollado por el usuario independiente cpral. Se trata de un diffusion transformer (DiT) de 1,24 mil millones de parámetros entrenado desde cero en hardware doméstico (8 tarjetas RTX 3090 Ti) y condicionado por un codificador de texto congelado denominado Poziomka-Baza, conectado mediante un refiner entrenable de 72,1 millones de parámetros. El modelo emplea flow matching con rectified flow como objetivo de entrenamiento y posiciones RoPE en el estilo RPE-2D.

La relevancia de esta versión radica en que es la primera entrega de la familia HomeIMG entrenada para generar a 512×512 píxeles, resolución a la que produce imágenes nítidas y detalladas. Parte de los pesos EMA de la epoch47 (entrenada de 64 a 384 px) y continúa el entrenamiento media época adicional a 512 px sobre el conjunto FLUX-Reason-6M, con el 50% de los pies de foto traducidos al polaco.

El modelo está pensado para experimentación e investigación en generación de imágenes bilingüe con requisitos de hardware moderados (10-12 GB de VRAM), no para producción crítica: presenta artefactos conocidos por encima de su resolución de entrenamiento y no genera texto legible dentro de las imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching / rectified flow; denoiser de 1,24B condicionado por codificador de texto congelado (Poziomka-Baza) mediante refiner entrenable de 72,1M |
| Parametros totales | 1.246.802.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto declarada) |
| Tipos de cuantizacion | no disponible de forma general; el codificador de texto incluye expertos en int8 y se distribuye en bf16 |
| Idiomas soportados | pl, en |
| Licencia | Apache-2.0 (refiner, denoiser y código); text_encoder bajo openmdw-1.1 (Poziomka-Baza); vae bajo Apache-2.0 (FLUX.2 small decoder, © Black Forest Labs) |
| Formato de pesos | safetensors (librería diffusers, con custom_code y pipeline personalizado AuroraIMG2Pipeline) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer que actúa como denoiser y se entrena con un objetivo de rectified flow: `z_t = (1−t)·x + t·ε`, con objetivo `ε − x`, pérdida MSE y `t` muestreado de una logit-normal(0, 1), sin desplazamiento del schedule. El condicionamiento textual proviene de Poziomka-Baza, un codificador de texto congelado, conectado al denoiser a través de un refiner entrenable de 72,1M de parámetros. Emplea posiciones RoPE en el estilo RPE-2D (arxiv:2503.18719): durante el entrenamiento se muestrean valores enteros aleatorios por eje (32 valores distintos en el rango 0-63) y en generación se distribuyen de forma uniforme sobre un campo de 64. Los micro-condicionamientos usan siempre "imagen completa a la resolución de salida".

El entrenamiento parte de los pesos EMA de HomeIMG-1.2B-PL-EN-epoch47 y continúa media época a 512×512 px: 1456 pasos × 2016 = 2,94 millones de muestras. Los datos son los JPEG originales de 1024 px de LucasFang/FLUX-Reason-6M, reducidos en vuelo a 512 px (bicúbico con antialiasing) y codificados con el encoder FLUX.2 en cada tarjeta; el 50% de los pies de foto están en polaco (cpral/FLUX-Reason-6M-captions-pl). Se sustituye el 10% de los prompts por uno vacío. El optimizador es MuLoCo (7 réplicas promediadas cada 64 pasos) con Muon (CMuon, lr 3e-3, momentum en bf16) y AdamW para el resto. El cómputo se realizó en 8× RTX 3090 Ti en bf16: 7 tarjetas entrenan (micro-batch 6, activation checkpointing selectivo) y la octava calcula el codificador de texto, con un rendimiento de unos 60-68 imágenes/s y unas 13 horas totales.

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512 px (resolución de entrenamiento), con opción de resoluciones cuadradas alternativas múltiplo de 16 mediante el parámetro `resolution`.
- Generación bilingüe: acepta prompts en polaco e inglés, con pies de foto de entrenamiento en ambos idiomas al 50%.
- Composición coherente a 768 px y 1024 px gracias a las posiciones RoPE estilo RPE-2D, aunque con artefactos (véase limitaciones).
- Control de generación mediante `num_inference_steps` (50 pasos de Euler en los ejemplos), `guidance_scale` (CFG 3,0) y semilla del generador.
- Integración con diffusers mediante pipeline personalizado (`AuroraIMG2Pipeline`) y `trust_remote_code=True`.
- No se documenta soporte de tool calling, function calling, agentes, visión de entrada, audio ni modo de razonamiento; es un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Prototipado rápido de ilustraciones a 512 px: el modelo genera imágenes nítidas y ajustadas al prompt en su resolución de entrenamiento, adecuado para maquetas de producto o pruebas de concepto con 10-12 GB de VRAM.
- Investigación en flow matching y rectified flow: al estar entrenado desde cero con un objetivo documentado y código de entrenamiento público, sirve para reproducir experimentos de difusión con posiciones RPE-2D.
- Experimentación con generación bilingüe pl/en: permite comparar el comportamiento del mismo prompt en polaco e inglés sobre un modelo con codificador de texto compartido.
- Generación de fondos y elementos gráficos simples (paisajes, escenas, objetos) para blogs o demos, donde los artefactos de texto y rostros no son críticos.
- Evaluación de estrategias de extrapolación de resolución: el modelo permite estudiar el deterioro de la calidad a 768 y 1024 px frente a la resolución de entrenamiento de 512 px.
- Docencia y formación en entrenamiento distribuido de modelos generativos: el repositorio de código y la configuración de 8 GPUs con MuLoCo/Muon documentan un caso real de entrenamiento casero.
- Ajuste fino (fine-tuning) sobre dominios concretos: al ser Apache-2.0 y estar en formato diffusers, puede servir como base para adaptaciones con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor reporta únicamente métricas internas de validación:

| Metrica | Valor |
|---|---|
| EMA val/loss a 512 px (velocity MSE, 4096 imágenes FLUX-Reason) | 0,5546 |
| val/loss en shard aesthetics-part01 | 0,602 |
| val/loss en shard aesthetics-part02 | 0,573 |
| val/loss en shard imaginative | 0,617 |
| val/loss en shard text | 0,426 |
| FD-DINOv2 | no medido |

El autor advierte que el val/loss a 512 px no es comparable con el de otras resoluciones. No se dispone de comparación numérica con modelos similares.

## Requisitos de hardware

- VRAM estimada: 10-12 GB para inferencia a 512 px; más memoria a 1024 px.
- GPU recomendadas: el modelo se entrenó en 8× RTX 3090 Ti (24 GB), por lo que tarjetas de 24 GB son suficientes; también cabe en GPUs consumer de gama alta con al menos 12 GB.
- Cabe en GPU consumer: sí, con 12 GB o más de VRAM para 512 px.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline=..., trust_remote_code=True)` y `AutoencoderKLFlux2`; requiere una versión de diffusers que incluya dicho autoencoder. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- Latencia y throughput: no se publican cifras de inferencia. Durante el entrenamiento se alcanzaron 60-68 imágenes/s con 7 GPUs en bf16, dato no trasladable a inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la información proporcionada para establecer una comparativa rigurosa con alternativas de la misma categoría (generadores texto-a-imagen de ~1B parámetros). Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch47.5 | 1,24B | no disponible | Apache-2.0 (con componentes openmdw-1.1) | Bilingüe pl/en, 512 px, flow matching |
| Alternativas de ~1B texto-a-imagen | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Por encima de 512 px (768 y 1024 px) aparecen extremidades y cabezas duplicadas, así como posterización (bandas planas de color en superficies lisas como cielo, nieve o sol); es extrapolación, ya que el modelo no entrenó en esas resoluciones.
- El texto dentro de las imágenes suele ser ilegible (garabatos).
- Rostros y figuras pequeñas pueden aparecer distorsionados.
- Los pies de foto en polaco son traducciones automáticas de un modelo de 2B, lo que puede introducir errores semánticos.
- Sesgos heredados de los datos de entrenamiento: FLUX-Reason-6M contiene imágenes sintéticas generadas por FLUX, con los sesgos propios de ese generador.
- Licencia: el denoiser, el refiner y el código son Apache-2.0, pero `text_encoder/` incluye pesos de Poziomka-Baza bajo openmdw-1.1 y `vae/` es el decodificador FLUX.2 small de Black Forest Labs (Apache-2.0); los datasets tienen sus propias condiciones de uso. Verificar la compatibilidad de licencias antes de un uso comercial.
- Riesgo de alucinación visual: el modelo puede generar elementos no solicitados en el prompt, especialmente en composiciones complejas o resoluciones extrapoladas.
- No apto para producción crítica sin evaluación previa: no hay benchmarks publicados ni métricas FD-DINOv2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch47.5
- Versión anterior (epoch47): https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch47
- Codificador de texto Poziomka-Baza: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Dataset FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Dataset de pies de foto en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Paper RPE-2D: https://arxiv.org/abs/2503.18719
- Código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
