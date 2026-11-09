# cpral/HomeIMG-1.2B-PL-EN-epoch43

## Resumen

HomeIMG-1.2B-PL-EN-epoch43 es un modelo de difusion texto-a-imagen de 1.246.802.432 parámetros desarrollado por el usuario cpral. Se trata de un checkpoint intermedio dentro de un currículo de entrenamiento por resoluciones (64 → 96 → 128 → 256 px) que entrena un diffusion transformer bilingüe polaco-inglés con flow matching rectificado. El modelo parte de las pesos EMA de HomeIMG-1.2B-PL-EN-epoch40 (12 bloques, 1235M) y continúa el entrenamiento durante 3 épocas a 128×128 px, incorporando por primera vez posiciones RoPE al estilo RPE-2D y micro-condicionamiento de recortes.

La relevancia técnica de este checkpoint está en la introducción de RPE-2D (posiciones RoPE aleatorizadas por muestra y eje durante el entrenamiento) combinado con micro-condicionamiento de crop, una técnica que mitiga el problema de duplicación de escenas y objetos que aparecía en etapas anteriores al generar a resoluciones superiores a la de entrenamiento. El resultado es que, pese a no haber sido entrenado a 256 px desde hace 21 épocas, el modelo produce imágenes coherentes con un objeto principal a esa resolución, aunque persisten repeticiones menores.

El modelo está pensado como etapa intermedia de un plan mayor; el propio autor recomienda usar HomeIMG-1.2B-PL-EN-epoch46 (256 px) para generación real. Es un modelo de baja resolución (128 px nativo) con encoder de texto Poziomka (expertos en int8, bf16), VAE FLUX.2 small decoder y licencia Apache-2.0 para denoiser, refiner y código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con flow matching rectificado; 12 bloques; posiciones RoPE estilo RPE-2D; micro-condicionamiento de crop |
| Parámetros totales | 1.246.802.432 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen; no hay ventana de contexto de texto declarada) |
| Tipos de cuantización | bf16 en denoiser y text encoder; expertos del text encoder en int8; soporte de cuantización adicional no documentado |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache-2.0 (denoiser, refiner y código); text_encoder bajo openmdw-1.1 (Poziomka-Baza); VAE bajo Apache-2.0 (FLUX.2 small decoder, Black Forest Labs) |
| Formato de pesos | safetensors (librería diffusers; custom_pipeline AuroraIMG2Pipeline) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer de 12 bloques y 1235M parámetros que usa flow matching rectificado: el objetivo es `z_t = (1−t)·x + t·ε`, con objetivo `ε − x`, pérdida MSE y `t ~ logit-normal(0, 1)` sin desplazamiento del horario. El 10 % de los prompts se sustituyen por vacío. No emplea REPA. La innovación principal es la incorporación de posiciones RoPE al estilo RPE-2D (arXiv:2503.18719): durante el entrenamiento, cada muestra y cada eje reciben 8 enteros distintos del rango 0–63 ordenados, y la cuadrícula es su producto cartesiano; en generación las posiciones son uniformes sobre el mismo campo 64 (`rope_ref` 64, cuadrícula de 64×64 tokens, equivalente a 1024 px). Además, el modelo recibe micro-condicionamiento (8 números en píxeles: tamaño original, marco del crop y resolución objetivo, codificados con sinusoides como en SDXL y una MLP pequeña) sumado al embedding de tiempo.

El entrenamiento parte de las pesos EMA de epoch40 (12 bloques, 1235M), a los que se añade el micro-condicionamiento con salida inicializada a cero para que el modelo arranque calculando lo mismo que epoch40. La mitad de las muestras son ventanas aleatorias de 128×128 px recortadas de latentes de 256 px (recorte en escala completa) y la otra mitad son la imagen completa reducida a 128 px. Los datos son QLNI/FLUX-Reason-6M-flux2-latents (5,88 millones de imágenes, latentes de 128 px preparados desde 256 px con decodificador FLUX.2 completo, bicúbico con antialiasing y encoder FLUX.2), con captions en un 50 % en polaco (cpral/FLUX-Reason-6M-captions-pl, traducciones automáticas de un modelo de 2B). Se entrenaron 3 épocas (4307 pasos × 4096 = 17,6 millones de muestras); el entrenamiento se interrumpió por disco lleno al guardar el paso 4096 y se reanudó desde el checkpoint 3584 con el estado del optimizador del paso 4096. El optimizador es MuLoCo (8 réplicas promediadas cada 64 pasos), Muon (CMuon, lr 3e-3, momentum en bf16, Newton-Schulz cada 3 pasos) y AdamW para el resto. El hardware fueron 8× RTX 3090 Ti en bf16, con un rendimiento de unos 780 imágenes/s.

## Capacidades

- Generación de imágenes texto-a-imagen bilingüe polaco-inglés, con resolución nativa de 128×128 px y soporte de otras resoluciones cuadradas múltiplas de 16 (por ejemplo 256 px) mediante el parámetro `resolution`.
- Generación coherente a 256 px pese a no entrenar a esa resolución desde hace 21 épocas, gracias a RPE-2D y al micro-condicionamiento de crop; persisten repeticiones menores (por ejemplo, dos astronautas en un caballo, tres niños en lugar de dos, texto repetido en varias líneas).
- Control de resolución objetivo mediante condicionamiento explícito (8 números en píxeles codificados con sinusoides).
- Generación determinista con semilla y control de CFG (por defecto 50 pasos de Euler, CFG 3,0, pesos EMA).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imágenes.
- No dispone de modo thinking, visión de entrada, audio ni otras modalidades.

## Casos de uso

- Prototipado rápido de conceptos visuales a baja resolución: el modelo genera bocetos de 128 px en pocos pasos (50 de Euler por defecto) sobre una sola GPU consumer, útil para iterar ideas antes de pasar a un modelo de mayor resolución como epoch46.
- Investigación en técnicas de generalización de resolución: al incorporar RPE-2D y micro-condicionamiento de crop, sirve como banco de pruebas reproducible para estudiar la duplicación de objetos al generar por encima de la resolución de entrenamiento.
- Generación bilingüe polaco-inglés: permite comparar directamente prompts equivalentes en ambos idiomas con la misma semilla (el autor publica rejillas con la misma semilla por par), útil para evaluar sesgos de traducción automática en captions.
- Aumento de datos sintéticos a baja resolución: 780 imágenes/s en 8× RTX 3090 Ti permite generar grandes volúmenes de imágenes de 128 px para tareas de aumento de datos o preentrenamiento de clasificadores.
- Educación y demostración de flow matching: el código de entrenamiento (train_pp.py con `--res 128 --rope-ref 64 --rope-random --micro-cond 256 --crop-res 256`) y la arquitectura de 12 bloques hacen del modelo un caso didáctico manejable para explicar rectified flow y DiT.
- Base para fine-tuning específico de dominio: al ser un checkpoint intermedio con licencia Apache-2.0 en denoiser y refiner, puede servir de punto de partida para ajustes sobre dominios concretos a baja resolución antes de escalar.
- Comparación de decodificadores VAE: al usar el decodificador FLUX.2 small, permite estudiar el efecto del VAE en la calidad percibida a 128 px frente a otras alternativas.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| EMA val/loss a 128 px | 0,6696 | Velocity MSE sobre 4096 imágenes reservadas, a 128 px; bajó hasta el final (0,6699 en el paso 4096) |
| Calidad visual a 256 px | Buena con repeticiones menores | Rejillas publicadas con 8 prompts, semilla 0, 50 pasos Euler, CFG 3,0, pesos EMA |
| Calidad visual a 64 px | Mala (borrosa) | Rejillas publicadas |
| FD-DINOv2 | No medido | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo texto-a-imagen. El val/loss a 128 px no es comparable con el de otras resoluciones.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 9,9 GB; el denoiser y el text encoder en bf16 (con expertos en int8) requieren del orden de 3–5 GB en inferencia, más el VAE; una GPU con 8 GB es suficiente en la práctica, aunque no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte bf16; el autor entrenó con 8× RTX 3090 Ti y el modelo cabe holgadamente en RTX 3090, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, en RTX 3090, RTX 4090 y previsiblemente en tarjetas de 8 GB o más.
- Opciones de despliegue: diffusers con `custom_pipeline` y `trust_remote_code=True` (pipeline AuroraIMG2Pipeline); requiere diffusers con `AutoencoderKLFlux2`. No se documenta soporte de vLLM (no aplica a difusión), llama.cpp ni Ollama.
- Latencia y throughput: el autor reporta unos 780 imágenes/s en entrenamiento con 8× RTX 3090 Ti; no se publica latencia de inferencia por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch43 | 1.246.802.432 | 128 px (soporta 256 px) | pl, en | Apache-2.0 (denoiser/refiner); openmdw-1.1 (text encoder) | Hugging Face, diffusers |
| HomeIMG-1.2B-PL-EN-epoch40 | 1235M (12 bloques) | 96 px | pl, en | Apache-2.0 | Hugging Face, diffusers |
| HomeIMG-1.2B-PL-EN-epoch46 | No disponible | 256 px | pl, en | No disponible | Hugging Face, diffusers (recomendado por el autor) |

No se dispone de datos de benchmarks comparativos entre estos checkpoints ni con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio: el propio autor recomienda usar epoch46 (256 px) para generación real.
- A 128 px hay poco espacio para detalles: caras, texto y objetos pequeños son solo un esbozo; el texto en las imágenes es ilegible.
- A 64 px los resultados son borrosos y de baja calidad.
- A 256 px persisten repeticiones menores (objetos o escenas duplicadas, texto repetido en varias líneas).
- Los captions en polaco son traducciones automáticas de un modelo de 2B, lo que introduce sesgos y errores de traducción en los datos de entrenamiento.
- Riesgo de sesgos heredados de los datos de entrenamiento (FLUX-Reason-6M) y de la traducción automática.
- Riesgo de alucinación visual: el modelo puede generar elementos no solicitados, especialmente a resoluciones superiores a la de entrenamiento.
- Restricciones de licencia: el denoiser, refiner y código son Apache-2.0, pero el text_encoder incluye pesos de Poziomka-Baza bajo openmdw-1.1, y el VAE es FLUX.2 small decoder de Black Forest Labs bajo Apache-2.0; los datos tienen sus propias condiciones.
- El val/loss a 128 px no es comparable con el de otras resoluciones, por lo que no debe usarse como métrica absoluta de calidad.
- No se ha medido FD-DINOv2, por lo que no hay una métrica objetiva de calidad de imagen publicada.
- Requiere `trust_remote_code=True` y diffusers con `AutoencoderKLFlux2`, lo que añade dependencias específicas en producción.

## Enlaces

- Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch43
- Checkpoint anterior (epoch40): https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch40
- Checkpoint siguiente recomendado (epoch46): https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch46
- Modelo base del text encoder (Poziomka-Baza): https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Paper RPE-2D: https://arxiv.org/abs/2503.18719
- Código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
- README en inglés: README_en.md (en el repositorio de Hugging Face)
