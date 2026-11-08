# DanielClough/music-gen-ace-step-v15-xl-turbo-onnx

## Resumen

ACE-Step 1.5 XL turbo es un modelo de generacion de musica a partir de texto desarrollado por el equipo ACE-Step (ACEStep), publicado originalmente en formato safetensors y aqui redistribuido por DanielClough como conversion a ONNX. Se trata de la variante XL turbo de la familia ACE-Step 1.5, con un DiT (Diffusion Transformer) de 4B parametros que genera audio musical en 8 pasos de muestreo Euler sin classifier-free guidance, lo que reduce drasticamente el coste de inferencia frente a los pipelines de difusion convencionales.

Esta ficha concreta no es el modelo original, sino una exportacion a ONNX Runtime pensada para el runner local `music-gen`. El repositorio separa el codificador de condicionamiento (FP32, 2.4 GB) y el DiT (BF16 internamente, 8.3 GB) en dos grafos ONNX, y requiere ademas dos repositorios complementarios del mismo autor para los codificadores de caption y letra (Qwen3-Embedding 0.6B) y para el VAE. El resultado es un pipeline de texto a musica ejecutable en GPU de consumo, con licencia MIT y sin dependencia de frameworks de difusion de Python en produccion.

La relevancia actual radica en dos factores: la generacion musical open source de calidad comercial sigue siendo un nicho con pocas alternativas abiertas, y la conversion a ONNX con BF16 permite desplegar el modelo en CUDA con ONNX Runtime sin el coste de VRAM que exigiria una version FP32 (unos 16 GB solo en pesos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para generacion de audio, con codificador de condicionamiento separado y VAE |
| Parametros totales | 4B (DiT); el codificador de condicionamiento y el VAE se distribuyen en repositorios aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens de texto; en audio, T entre 16 y 15000 marcos latentes (hasta unos 8 minutos en 24 GB) |
| Tipos de cuantizacion | BF16 (DiT), FP32 (codificador de condicionamiento, atencion y convoluciones de patch); no se aplico cuantizacion adicional |
| Idiomas soportados | no disponible |
| Licencia | MIT (copyright (c) 2026 ACEStep) |
| Formato de pesos | ONNX (opset 18) con ficheros `.onnx` y `.data`; SHA256SUMS incluido |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusion sobre latentes con un DiT como red de denoising. El pipeline completo consta de tres piezas: un codificador de condicionamiento que procesa la descripcion textual y la letra, un DiT que predice el campo de velocidad (`velocity`) sobre latentes de audio de 64 canales, y un VAE que decodifica los latentes a forma de onda. El DiT recibe `hidden_states` [1, T, 64], `timestep` [1], `encoder_hidden_states` [1, E, 2048] y `context_latents` [1, T, 128], y devuelve `velocity` [1, T, 64]. El codificador de condicionamiento de la variante XL antepone un token CLS en su codificador de timbre, integrado en el grafo.

El muestreo emplea el schedule turbo con shift 3, pasos Euler y x0 en el ultimo paso, en 8 pasos sin CFG. La exportacion a ONNX se realizo con `torch.onnx.export(dynamo=True)` a opset 18, cargando el checkpoint en BF16 y forzando FP32 en las puntuaciones de atencion y softmax (el kernel fusionado original las mantiene en FP32 internamente; separarlas en operaciones ONNX en BF16 degradaba la precision 2-3 veces) y en las dos convoluciones de patch (`proj_in`, `proj_out`), ya que `Conv` de ONNX no admite BF16 en opset 18. No se reentreno ni se cuantizo el modelo; solo se convirtio el formato y se ajusto la precision. El error RMS relativo del DiT BF16 frente a PyTorch FP32 se mantiene dentro de 1.5 veces el del BF16 original en los cuatro casos medidos (T=200/750/1500, E=40/86/300).

## Capacidades

- Generacion de musica a partir de descripciones textuales y letras, con control de duracion (desde unos 30 segundos hasta unos 8 minutos en 24 GB de VRAM).
- Generacion de audio instrumental y con voz cantada, segun la model card del modelo base.
- Condicionamiento por caption y por letra mediante codificadores separados (Qwen3-Embedding 0.6B en ONNX).
- Muestreo rapido en 8 pasos Euler sin classifier-free guidance, lo que reduce el coste por generacion.
- Ejecucion en ONNX Runtime con CUDA, sin dependencia de PyTorch en tiempo de inferencia.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo generativo de audio, no un LLM.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Produccion musical asistida: generar bocetos instrumentales de 30 segundos a 3 minutos a partir de una descripcion de estilo, tempo e instrumentacion, con tiempos de 8-13 segundos en una RTX 3090, para iterar rapidamente sobre ideas antes de la produccion final.
- Creacion de bandas sonoras para videojuegos y audiovisual: piezas de hasta 5-7 minutos con bucles y variaciones, integradas en un pipeline local que evita enviar material a servicios en la nube.
- Prototipado de jingles y musica publicitaria: generar multiples variantes cortas con distinta instrumentacion y estado de animo a partir de un mismo prompt, aprovechando el bajo coste por generacion del muestreo en 8 pasos.
- Investigacion en generacion musical: servir como referencia abierta (MIT) para comparar tecnicas de difusion sobre latentes, schedules turbo y exportacion ONNX frente a otros modelos de la familia ACE-Step.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 24 GB con BF16, permite ejecutar el pipeline completo en una unica RTX 3090 o RTX 4090 sin infraestructura de centro de datos.
- Aplicaciones educativas y de demostracion: entornos docentes donde se necesita un modelo de texto a musica reproducible, con pesos verificables por SHA256 y sin dependencias propietarias.
- Generacion de musica de fondo para podcasts y contenido hablado: piezas instrumentales de duracion media generadas localmente, con la ventaja de la licencia MIT para su redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de generacion de audio. La model card si proporciona metricas de precision numerica y de rendimiento en hardware concreto:

| Caso (T, E) | Error RMS relativo de este grafo | BF16 original (referencia) |
|---|---|---|
| T=200, E=86 | 4.5e-2 | 4.4e-2 |
| T=750, E=86 | 4.9e-2 | 4.5e-2 |
| T=750, E=300 | 6.4e-2 | 6.6e-2 |
| T=1500, E=40 | 4.6e-2 | 4.1e-2 |

Precision del codificador de condicionamiento FP32 frente a PyTorch FP32: 9.7e-9 en entradas sin padding y 3.9-4.1e-7 con padding.

Rendimiento medido en RTX 3090 (24 GB):

| Duracion | Tiempo | Pico de VRAM |
|---|---|---|
| 30 s | 8-9 s (incluye carga) | 9.5-11.6 GB |
| 3 min | 13.5 s | 15.3 GB |
| 5 min | 20.5 s | 22.9 GB |
| 7 min | 29.5 s | 20.8 GB |
| 8 min | 33.5 s | 24.1 GB (al limite) |
| 9 min | falla | no disponible |

## Requisitos de hardware

- VRAM estimada: entre 9.5 y 11.6 GB para piezas de 30 segundos (incluyendo carga), 15.3 GB para 3 minutos, 22.9 GB para 5 minutos y 24.1 GB para 8 minutos. El limite practico en 24 GB esta en torno a 7-8 minutos de audio.
- GPU recomendadas: RTX 3090 (medida oficialmente), RTX 4090 y GPUs profesionales con 24 GB o mas (A100, H100) para piezas largas; para piezas cortas, GPUs con 12-16 GB podrian ser suficientes, aunque no se documentan mediciones.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 con 24 GB; para piezas de mas de 7 minutos en 24 GB, el autor recomienda usar la variante 2B turbo, que llega a 10 minutos.
- Opciones de despliegue: ONNX Runtime con CUDA (onnxruntime-gpu 1.24.4 en la exportacion), mediante el runner `music-gen` del autor; requiere ademas los repositorios `music-gen-qwen3-embedding-0.6b-onnx` y `music-gen-ace-step-v15-vae-onnx`.
- Latencia y throughput: 8-9 s para 30 s de audio, 13.5 s para 3 minutos, 20.5 s para 5 minutos y 29.5 s para 7 minutos en RTX 3090; el crecimiento del coste de atencion es cuadratico con T (32 cabezas x T^2/4 en FP32).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ACE-Step 1.5 XL turbo (este, ONNX) | 4B (DiT) | hasta ~8 min en 24 GB | ONNX BF16/FP32 | MIT | Exportacion ONNX para ONNX Runtime; 8 pasos sin CFG |
| ACE-Step 1.5 XL turbo (original, safetensors) | 4B (DiT) | no disponible | safetensors | MIT | Modelo base `ACE-Step/acestep-v15-xl-turbo`; requiere PyTorch |
| ACE-Step 1.5 2B turbo (ONNX) | 2B (DiT) | hasta ~10 min en 24 GB | ONNX | MIT | Menor VRAM, menor calidad; recomendado para piezas largas en 24 GB |
| Alternativas comerciales de generacion musical | no disponible | no disponible | API | propietaria | El repositorio GitHub afirma superar a casi todas las alternativas comerciales; sin datos verificables en la informacion disponible |

## Limitaciones y advertencias

- El modelo base no esta reentrenado ni cuantizado en esta exportacion; los sesgos del dataset original de ACE-Step 1.5 se heredan sin mitigacion documentada. No se detallan sesgos conocidos en la informacion disponible.
- Riesgo de alucinacion en el sentido de generar audio incoherente o que no corresponde al prompt; no se documentan tasas de fallo.
- Limitacion dura de longitud: en 24 GB falla a partir de 9 minutos de audio; para piezas mas largas hay que usar la variante 2B turbo.
- El DiT no puede ejecutarse en FP16 (desbordamiento en la primera capa, con valores del flujo residual por encima de 65504) ni en FP32 por VRAM (unos 16 GB solo en pesos); la unica precision practica es BF16 con atencion y convoluciones en FP32.
- La exportacion ONNX separa la atencion en operaciones discretas; aunque se mantiene dentro del margen de 1.5x respecto al BF16 original, la precision numerica es ligeramente inferior a la del kernel fusionado de PyTorch.
- Dependencia de un ecosistema de tres repositorios (DiT + condicionamiento, embeddings Qwen3 y VAE) para formar un pipeline funcional; no es un modelo autonomo.
- Licencia MIT, sin restricciones conocidas para uso comercial; se debe conservar el aviso de copyright (c) 2026 ACEStep.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad sobre esta conversion concreta.
- Idiomas soportados no documentados; no se puede garantizar el comportamiento con prompts en castellano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DanielClough/music-gen-ace-step-v15-xl-turbo-onnx
- Modelo base: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- Repositorio GitHub de ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Ficha en Civitai: https://civitai.com/models/2549270/ace-step-audio-gen
- Repositorios complementarios del pipeline (referenciados en la model card): `music-gen-qwen3-embedding-0.6b-onnx` y `music-gen-ace-step-v15-vae-onnx` (sin URL directa en la informacion disponible)
- Paper / cita: Gong, J., Song, Y., Zhao, W., Wang, S., Xu, S., Guo, J. (2026). *ACE-Step 1.5: Pushing the Boundaries of Open-Source Music Generation*. GitHub.
