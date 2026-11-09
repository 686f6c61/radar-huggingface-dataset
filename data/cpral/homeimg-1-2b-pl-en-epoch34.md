# cpral/HomeIMG-1.2B-PL-EN-epoch34

## Resumen

HomeIMG-1.2B-PL-EN-epoch34 es un modelo de generación de imágenes texto-a-imagen desarrollado por el usuario cpral, publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un checkpoint intermedio de un curriculum de entrenamiento por resoluciones (64 → 96 → 128 → 256 px) y no de un modelo de propósito general: está entrenado y optimizado exclusivamente para generar imágenes de 64×64 píxeles. Su interés reside en que documenta con detalle un enfoque poco habitual en la literatura abierta: entrenar un diffusion transformer bilingüe (polaco e inglés) con flow matching rectificado y un text encoder propio (Poziomka) sobre un conjunto de datos de 5,88 millones de imágenes.

El modelo cuenta con 1.235.000.832 parámetros totales (12 bloques en el denoiser) y reutiliza los pesos EMA del checkpoint epoch22 como punto de partida, continuando el entrenamiento durante 12 épocas adicionales a baja resolución. La motivación técnica es económica: a 64×64 px la imagen se reduce a 16 tokens, lo que permite muchas pasadas sobre los datos y ejercitar la composición y la comprensión del prompt a bajo coste computacional. El resultado es un modelo que funciona bien en su resolución de entrenamiento pero que ha perdido la capacidad de generar a 256 px.

Es relevante ahora porque ejemplifica una estrategia de curriculum de resoluciones reproducible (el código de entrenamiento es público) y porque incluye un text encoder bilingüe entrenado desde cero, algo infrecuente en modelos de difusión de este tamaño. No obstante, sus 20 descargas y 1 like en el momento de la consulta indican que es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con flow matching rectificado; denoiser de 12 bloques; text encoder propio (Poziomka) con expertos en int8; VAE FLUX.2 small decoder |
| Parametros totales | 1.235.000.832 |
| Parametros activos | no disponible (no es MoE en el denoiser; el text encoder usa expertos en int8 sin datos de recuento) |
| Longitud de contexto | no disponible (prompts de texto; sin ventana de contexto declarada) |
| Tipos de cuantizacion | bf16 en el modelo principal; expertos del text encoder en int8; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | pl, en |
| Licencia | Apache-2.0 (denoiser, refiner y código); text_encoder bajo openmdw-1.1 (Poziomka-Baza); VAE Apache-2.0 (FLUX.2 small decoder, Black Forest Labs) |
| Formato de pesos | safetensors (librería diffusers, pipeline personalizado AuroraIMG2Pipeline) |

## Arquitectura y entrenamiento

El denoiser es un diffusion transformer de 12 bloques y 1235M de parámetros que opera sobre latentes de 4×4×128 generados por el codificador de FLUX.2. El objetivo de entrenamiento es rectified flow con `z_t = (1−t)·x + t·ε` y objetivo `ε − x`, con MSE, `t ~ logit-normal(0, 1)`, sin desplazamiento del calendario para baja resolución y con un 10% de prompts sustituidos por vacío. No se emplea REPA. El text encoder es Poziomka, un modelo bilingüe propio con expertos en int8, empaquetado con atención varlen sin padding; el VAE es el decodificador pequeño de FLUX.2 sin modificaciones. El pipeline se distribuye como código personalizado (`AuroraIMG2Pipeline`) y requiere una versión de diffusers con `AutoencoderKLFlux2`.

El entrenamiento parte de los pesos EMA de HomeIMG-1.2B-PL-EN-epoch22 y acumula 34 épocas totales: 15 en inglés con Slayer149 a 256 px, 4 bilingües con Poziomka a 256 px (6 bloques), 3 bilingües tras ampliar a 12 bloques a 256 px y 12 bilingües a 64 px. Esta última fase supone 17.227 pasos × 4096 = 70,6 millones de muestras sobre QLNI/FLUX-Reason-6M-flux2-latents (5,88 millones de imágenes reescaladas a 64 px mediante decodificación completa, reducción bicúbica con antialiasing y recodificación) con el 50% de los captions traducidos al polaco en cpral/FLUX-Reason-6M-captions-pl. El optimizador combina MuLoCo (8 réplicas promediadas cada 64 pasos), Muon (CMuon, lr 3e-3, momentum en bf16, Newton-Schulz cada 3 pasos) y AdamW para el resto. El entrenamiento se ejecutó en 8× RTX 3090 Ti en bf16, con un rendimiento de 900–1250 imágenes/s. Un dato relevante para estimar costes: a 64 px, aproximadamente el 70% del cómputo corresponde al texto (Poziomka, refiner y proyecciones K/V en cross-attention), no a la imagen.

## Capacidades

- Generación de imágenes texto-a-imagen a 64×64 píxeles, resolución de entrenamiento, con 50 pasos de Euler y CFG 3,0 en la configuración de referencia.
- Comprensión de prompts en polaco e inglés, con captions bilingües en el 50% de los datos de entrenamiento.
- Composición y estructura global de la escena: al reducirse la imagen a 16 tokens, el modelo ejercita la disposición de elementos y la correspondencia con el prompt.
- Generación con semilla controlada y reproducibilidad mediante `torch.Generator` (la documentación usa seed 0 y ruido compartido entre pares de prompts).
- Aceptación de resoluciones cuadradas alternativas múltiplo de 16 mediante el parámetro `resolution=`, aunque con calidad degradada fuera de 64 px.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Investigación sobre curriculum de resoluciones: el modelo sirve como punto de partida reproducible para estudiar cómo la baja resolución afecta al aprendizaje de composición antes de escalar a 96, 128 y 256 px, con el código de entrenamiento disponible en GitHub.
- Estudio comparativo de text encoders bilingües: permite evaluar el comportamiento de Poziomka (expertos en int8) frente a encoders estándar en tareas de alineación prompt-imagen a baja resolución.
- Generación de miniaturas y placeholders: útil para producir bocetos de 64×64 px que sirvan como borrador de composición antes de un refinado posterior con otro modelo de mayor resolución.
- Prototipado rápido en hardware modesto: al operar a 64 px y con un denoiser de 1,2B, el coste de inferencia es bajo, lo que permite iterar sobre prompts y semillas en una sola GPU de consumo.
- Docencia y demostraciones de flow matching: la implementación con rectified flow, Muon y MuLoCo documentada paso a paso facilita explicar el entrenamiento de modelos de difusión desde cero.
- Evaluación de sesgos y calidad de traducción automática: los captions polacos son traducciones de un modelo de 2B, por lo que el checkpoint permite analizar cómo los errores de traducción se reflejan en la generación bilingüe.
- No es adecuado para generación de imágenes en resolución estándar (256 px o superior), ilustración profesional, texto legible en imagen ni caras detalladas.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| EMA val/loss a 64 px | 0,7568 | MSE de velocidad sobre 4096 imágenes reservadas, a 64 px; 0,7573 en el paso 16.384 |
| EMA val/loss a 256 px (epoch22) | 0,6170 | No comparable con la métrica a 64 px: distinta escala de tarea |
| FD-DINOv2 | no medido | La model card indica explícitamente que no se midió |
| Calidad a 256 px | degradada | La model card califica los resultados como malos y no aptos para uso |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones cuantitativas con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,2B parámetros en bf16, el modelo principal ocupa aproximadamente 2,5 GB, a lo que se suman el text encoder Poziomka (expertos en int8) y el VAE de FLUX.2. Una estimación conservadora sitúa el conjunto en el rango de 6–10 GB, aunque no está confirmada por el autor.
- GPU de entrenamiento documentadas: 8× RTX 3090 Ti en bf16 (24 GB por tarjeta).
- GPU recomendadas para inferencia: cualquier GPU con suficiente VRAM para el pipeline completo; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 12–16 GB o superiores, dado el tamaño del denoiser, aunque no hay confirmación del autor.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline=REPO, trust_remote_code=True)` y una versión que incluya `AutoencoderKLFlux2`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles para inferencia; el dato de 900–1250 imágenes/s corresponde al entrenamiento en 8× RTX 3090 Ti, no a la generación.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto / idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch34 | 1,235B | 64×64 px (entrenamiento) | pl, en | Apache-2.0 (con componentes openmdw-1.1) | Hugging Face, 20 descargas |
| HomeIMG-1.2B-PL-EN-epoch22 | 1,235B | 256×256 px | pl, en | Apache-2.0 | Hugging Face (modelo base del anterior) |
| Modelos texto-a-imagen de 1–2B de propósito general (p. ej. SD 1.5, 0,86B; SDXL-Turbo, 2,6B) | 0,86B–2,6B | 512×512 px o superior | en (mayoritariamente) | CreativeML OpenRAIL-M / otras | Amplia disponibilidad |

La comparación con modelos de propósito general es limitada porque HomeIMG-1.2B-PL-EN-epoch34 no compite en resolución ni en calidad de imagen final: su función es ser un eslabón de un curriculum. Frente a epoch22, la diferencia clave es la resolución objetivo (64 px frente a 256 px) y la pérdida de capacidad a 256 px tras las 12 épocas adicionales a baja resolución. No se dispone de datos de benchmarks que permitan una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- Solo genera bien a 64×64 px; a 256 px el rendimiento es claramente peor que el de epoch22, según el propio autor.
- Es un checkpoint intermedio de curriculum, no un modelo para generar imágenes en resolución convencional.
- A 64 px no hay espacio para detalles: caras, texto y objetos pequeños quedan solo esbozados.
- Los captions en polaco son traducciones automáticas de un modelo de 2B, lo que introduce sesgos y errores de traducción en los datos de entrenamiento.
- Riesgo de alucinación visual y de composiciones incorrectas en prompts complejos, agravado por la baja resolución.
- Licencia: el denoiser, el refiner y el código son Apache-2.0, pero `text_encoder/` incluye pesos de Poziomka-Baza bajo openmdw-1.1 y `vae/` es el decodificador de FLUX.2 de Black Forest Labs (Apache-2.0). El uso comercial debe verificar el cumplimiento de todas las licencias de los componentes.
- Los datasets utilizados (QLNI/FLUX-Reason-6M-flux2-latents y cpral/FLUX-Reason-6M-captions-pl) tienen sus propias condiciones de uso.
- Requiere `trust_remote_code=True` y código personalizado del pipeline, lo que implica revisar el código antes de ejecutarlo en entornos de producción.
- No hay datos publicados sobre sesgos demográficos, toxicidad ni evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch34
- Checkpoint base epoch22: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch22
- Text encoder Poziomka-Baza: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
