# cpral/HomeIMG-1.2B-PL-EN-epoch40

## Resumen

HomeIMG-1.2B-PL-EN-epoch40 es un modelo de difusion texto-a-imagen desarrollado por el usuario cpral, publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un checkpoint intermedio de un curriculum de entrenamiento multirresolucion (64 → 96 → 128 → 256 px) que en esta iteracion se ha entrenado especificamente a 96×96 px. El modelo es bilingue polaco-ingles y esta pensado como paso experimental dentro de una progresion de resolucion, no como un generador de imagenes de uso general.

Arquitectonicamente es un diffusion transformer (DiT) con flow matching rectificado (rectified flow), 1.235 millones de parametros y 12 bloques, que parte de las medias EMA del checkpoint epoch34 y se reentrena durante 6 epocas adicionales a 96 px. Incorpora una innovacion tecnica destacable: interpolacion de posiciones RoPE con `rope_ref` 64, que escala las posiciones de los tokens de imagen para que en cualquier resolucion el lienzo cubra el mismo campo de 64 posiciones por lado, evitando que el modelo vea posiciones desconocidas al cambiar de resolucion.

Su relevancia es fundamentalmente metodologica: documenta de forma transparente el proceso de escalado progresivo de resolucion en modelos de difusion pequenos, con resultados cuantitativos (EMA val/loss 0,7021 a 96 px) y una evaluacion cualitativa honesta de las limitaciones en cada resolucion. No es un modelo apto para produccion de imagenes finales, sino una pieza de investigacion reproducible con codigo de entrenamiento publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con flow matching rectificado; 12 bloques; text encoder Poziomka (bf16, expertos en int8); VAE FLUX.2 small decoder |
| Parametros totales | 1.235.000.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (text encoder Poziomka; longitud de prompt no especificada) |
| Tipos de cuantizacion | no disponible (pesos en bf16; expertos del text encoder en int8) |
| Idiomas soportados | pl, en |
| Licencia | Apache-2.0 (text_encoder bajo openmdw-1.1; VAE Apache-2.0 de Black Forest Labs) |
| Formato de pesos | safetensors (libreria diffusers, custom_pipeline) |

## Arquitectura y entrenamiento

El denoiser es un diffusion transformer de 12 bloques y 1235M de parametros que opera sobre latentes de 6×6×128 producidos por el encoder de FLUX.2 a partir de imagenes de 96×96 px. El objetivo de entrenamiento es rectified flow: `z_t = (1−t)·x + t·ε`, con objetivo `ε − x`, perdida MSE y `t ~ logit-normal(0, 1)` sin desplazamiento de horario; el 10% de los prompts se sustituyen por vacio. No se emplea REPA. El text encoder es Poziomka (congelado, bf16 con expertos en int8) y el decodificador VAE es el small decoder de FLUX.2 sin modificaciones.

El entrenamiento parte de las medias EMA de HomeIMG-1.2B-PL-EN-epoch34 y cubre 6 epocas a 96 px: 8613 pasos × 4096 = 35,3 millones de muestras, sobre 5,88 millones de imagenes del dataset QLNI/FLUX-Reason-6M-flux2-latents reescaladas a 96×96 (latente 256 px → decodificador completo FLUX.2 → bicubico con antialiasing → encoder FLUX.2), con captions traducidos al polaco en el 50% de los casos. Los primeros 2560 pasos usaron posiciones RoPE enteras; a partir de ahi el entrenamiento se reanudo desde checkpoint con `rope_ref` 64. El optimizador combina MuLoCo (8 replicas promediadas cada 64 pasos), Muon (CMuon, lr 3e-3, momentum en bf16, Newton-Schulz cada 3 pasos) y AdamW para el resto. El entrenamiento se ejecuto en 8× RTX 3090 Ti en bf16, a 900–1000 imagenes/s y aproximadamente 10 horas.

La innovacion principal es la interpolacion de posiciones RoPE: el token *i* de un lado con *n* tokens recibe la posicion `(i + 0,5)·64/n − 0,5`, de modo que la separacion entre tokens es de ~10,7 en 96 px, 4 en 256 px y 1 en 1024 px. Esto permite que etapas posteriores de mayor resolucion solo densifiquen la rejilla sin introducir posiciones fuera de distribucion.

## Capacidades

- Generacion de imagenes texto-a-imagen a 96×96 px (resolucion de entrenamiento) y, con `resolution=`, otras resoluciones cuadradas multiplo de 16.
- Generacion bilingue: prompts en polaco e ingles, con captions de entrenamiento traducidos al polaco en la mitad del dataset.
- Composicion de escenas simples a baja resolucion: objetos, animales, escenas descritas en el prompt.
- Salida de imagenes cuadradas a 64, 96, 128 y 256 px (con calidad degradada fuera de 96 px, ver limitaciones).
- Inferencia con el pipeline `AuroraIMG2Pipeline` de diffusers mediante `custom_pipeline` y `trust_remote_code=True`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un modelo de generacion de imagenes.

## Casos de uso

- Investigacion sobre curriculum de resolucion en difusion: el modelo sirve como punto de control documentado (64 → 96 → 128 → 256 px) para estudiar como afecta el escalado progresivo a la calidad y a la estabilidad del entrenamiento.
- Estudio de interpolacion de posiciones RoPE: permite reproducir el experimento de `rope_ref` 64 y medir su efecto sobre la repeticion de escenas a resoluciones no vistas durante el entrenamiento.
- Generacion de iconos y miniaturas de muy baja resolucion: a 96×96 px puede producir avatares, sprites o placeholders para prototipos de interfaz donde el detalle no es critico.
- Pruebas de pipelines de difusion en hardware modesto: con 1,2B de parametros y salida de 96 px, el coste de inferencia es bajo y cabe en GPUs de consumo para validar integraciones con diffusers.
- Fine-tuning y experimentos academicos: al ser Apache-2.0 y con codigo de entrenamiento publico, es una base barata para probar tecnicas de optimizacion (Muon, MuLoCo) o variantes de flow matching.
- Generacion bilingue de datos sinteticos a baja resolucion: util para aumentar datasets de polaco o ingles en tareas de vision donde la resolucion nativa sea pequena.
- Docencia y divulgacion: ejemplo reproducible de un DiT pequeno entrenado desde cero con objetivos rectified flow y evaluacion cualitativa por resolucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FID, CLIP score) en la informacion disponible. El autor unicamente reporta la perdida de validacion EMA:

| Metrica | Valor | Contexto |
|---|---|---|
| EMA val/loss a 96 px | 0,7021 | velocity MSE sobre 4096 imagenes reservadas, a 96 px (0,7025 en el paso 8192) |
| EMA val/loss a 64 px (epoch34) | 0,7568 | no comparable con la anterior por distinta resolucion |
| EMA val/loss a 256 px (epoch22) | 0,6170 | no comparable con la anterior por distinta resolucion |
| FD-DINOv2 | no medido | — |

El propio autor advierte que las perdidas de validacion entre resoluciones no son comparables entre si.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1,2B de parametros en bf16 y un VAE FLUX.2, se estima un consumo moderado (orden de pocos GB), aunque la cifra exacta no esta publicada.
- GPU de entrenamiento utilizadas: 8× RTX 3090 Ti en bf16, aproximadamente 10 horas para 6 epocas a 96 px.
- GPU recomendadas para inferencia: cualquier GPU con soporte bf16; el entrenamiento se valido en RTX 3090 Ti, por lo que tarjetas de consumo de gama alta son suficientes.
- Cabe en GPU de consumo: si, segun el perfil de entrenamiento (RTX 3090 Ti); no se especifican requisitos minimos.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline=REPO, trust_remote_code=True)`; requiere una version de diffusers con `AutoencoderKLFlux2`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles para inferencia; en entrenamiento se reportan 900–1000 imagenes/s con 8× RTX 3090 Ti.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto / text encoder | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch40 | 1,235B | 96×96 px (entrenamiento) | Poziomka bilingue pl/en | Apache-2.0 (text encoder openmdw-1.1) | Hugging Face, 28 descargas |
| HomeIMG-1.2B-PL-EN-epoch34 | 1,235B (12 bloques) | 64×64 px | Poziomka bilingue pl/en | Apache-2.0 | Hugging Face (checkpoint previo) |
| HomeIMG-1.2B-PL-EN-epoch22 | no disponible | 256×256 px | Poziomka bilingue pl/en | Apache-2.0 | Hugging Face (etapa posterior del curriculum) |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con alternativas de la misma categoria; la comparativa se limita a parametros, resolucion y licencia segun la informacion disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio de curriculum a 96×96 px, no un modelo para generar imagenes en resolucion convencional; el autor lo indica explicitamente.
- A 96 px hay poco espacio para detalles: caras, texto y objetos pequenos quedan solo esbozados.
- A 128 px la composicion suele seguir el prompt, pero los objetos son mas pequenos y a veces aparecen copias duplicadas (por ejemplo, robots o cometas).
- A 256 px el modelo no es utilizable: la escena se repite y los objetos se fragmentan en multiples copias pequenas; la interpolacion RoPE no elimino este problema.
- Los captions en polaco son traducciones automaticas de un modelo de 2B, lo que introduce errores y sesgos derivados de los datos de entrenamiento.
- Riesgo de alucinacion visual y de sesgos heredados del dataset FLUX-Reason-6M y de su traduccion automatica; no se documenta ninguna evaluacion de sesgo.
- La licencia Apache-2.0 cubre refiner, denoiser y codigo; el `text_encoder/` incluye pesos de Poziomka-Baza bajo licencia openmdw-1.1 y el `vae/` es el decoder de FLUX.2 de Black Forest Labs (Apache-2.0). Los datasets tienen sus propias condiciones de uso.
- Requiere `trust_remote_code=True` y una version de diffusers con `AutoencoderKLFlux2`, lo que anade dependencia de codigo personalizado en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch40
- Checkpoint previo (epoch34, 64 px): https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch34
- Checkpoint a 256 px (epoch22): https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch22
- Text encoder Poziomka-Baza: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Codigo de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
