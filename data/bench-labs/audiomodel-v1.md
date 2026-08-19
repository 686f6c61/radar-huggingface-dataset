# bench-labs/AudioModel-v1

## Resumen

AudioModel v1 es un modelo de generacion de audio a partir de texto (text-to-audio) desarrollado por bench-labs, una linea experimental que ya habia producido modelos de difusion latente para imagenes (PixelModel) y ocupacion 3D (VoxelModel). El modelo trata un espectrograma mel como si fuera una imagen en escala de grises y aplica sobre el un Diffusion Transformer (DiT) con rectified flow, sin utilizar un autoencoder VAE intermedio. El condicionamiento por texto se realiza mediante un modelo CLAP congelado (`laion/clap-htsat-unfused`), que proyecta las descripciones textuales a un espacio de embedding usado en cross-attention y adaLN-zero.

Con solo 40,3 millones de parametros entrenables, el modelo genera 17,8 segundos de audio a partir de una frase. Se entreno en menos de cuatro horas en una unica GPU H100, sobre el dataset Clotho (3.839 clips de entrenamiento con cinco captions cada uno). Su licencia MIT y su tamano reducido lo convierten en una opcion accesible para experimentacion y prototipado, aunque su fidelidad de audio es limitada por el uso de un vocoder Griffin-Lim y por la resolucion del espectrograma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) sobre espectrograma mel, rectified flow, condicionamiento CLAP |
| Parametros totales | 40.444.300 (según safetensors); 40.296.844 entrenables segun la model card |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el texto se limita a 32 tokens en la torre de texto de CLAP) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AudioModel difunde directamente sobre un espectrograma mel de 384x256, sin pasar por un VAE que comprima el espacio latente. El modelo `AudioDiT` parchea el espectrograma con patch size 16, obteniendo una cuadricula de 24x16 (384 tokens) con dimension 384 y profundidad 12. El condicionamiento textual se realiza con CLAP congelado: la torre de texto RoBERTa produce un embedding de 768 dimensiones (32 tokens) que se inyecta mediante cross-attention, y el pooled embedding proyectado a 512 dimensiones se usa para adaLN-zero. Aunque se carga el checkpoint completo de CLAP (153,49 M de parametros), solo la torre de texto y la proyeccion (125,30 M) ejecutan forward pass; la torre de audio HTSAT queda sin uso.

El entrenamiento se realizo sobre el dataset Clotho (split development: 3.839 clips, 1.045 held-out, con 5 captions por clip, total 19.195 pares). Se ejecutaron 90.000 pasos con batch 256 en una H100 SXM 80GB a 6,51 steps/s, usando 28,3 GiB de memoria y 3,85 horas de tiempo de pared. El optimizador fue AdamW con learning rate 2e-4, betas (0,9; 0,99), grad clip 1,0, schedule coseno hasta 1e-6 con 500 pasos de warmup, EMA 0,9999 y dropout de classifier-free guidance del 10%. El mejor checkpoint de validacion se obtuvo en el paso 54.000 con loss 0,06961, que luego derivo a 0,07078 en el paso 90.000 (sobreajuste). Los pesos publicados corresponden al checkpoint EMA del paso 54.000.

## Capacidades

- Generacion de audio de 17,8 segundos a partir de una descripcion textual en ingles.
- Condicionamiento por texto libre mediante embeddings CLAP (sin plantillas fijas).
- Difusion directa sobre espectrograma mel, sin VAE intermedio.
- Inferencia mediante rectified flow (muestreo por flujo rectificado).
- Reproduccion de efectos de sonido y ambientes sencillos: lluvia, pasos sobre grava, ladridos, arranque de motor, etc.
- Soporte de classifier-free guidance (CFG) con dropout del 10% en entrenamiento.
- Capacidad de entrenamiento desde cero en una sola GPU de gama alta en pocas horas.

## Casos de uso

- Prototipado rapido de efectos de sonido para videojuegos o animaciones: el modelo permite generar un efecto concreto (por ejemplo, "un perro ladrando") sin necesidad de buscar en librerias de audio, ideal para fases iniciales de diseno.
- Generacion de ambientes sonoros para experiencias de realidad virtual o meditacion: descripciones como "lluvia cayendo sobre un tejado" producen clips de 17,8 segundos que pueden concatenarse o loopearse.
- Aumento de datos para entrenamiento de clasificadores de audio: el modelo puede sintetizar variaciones de sonidos etiquetados, aunque la fidelidad limitada requiere validacion posterior.
- Educacion y demostracion de modelos generativos de audio: su tamano reducido y licencia MIT permiten ejecutarlo en entornos docentes o en notebooks para ilustrar el flujo completo de text-to-audio.
- Integracion en pipelines de generacion de contenido para redes sociales: creacion de efectos sonoros personalizados a partir de texto para videos cortos o podcasts.
- Investigacion en tecnicas de difusion sobre espectrogramas: al ser un modelo tiny y entrenable en pocas horas, sirve como banco de pruebas para variantes de arquitectura, condicionamiento o vocoders.

## Benchmarks y rendimiento

Se reporta un unico resultado: Frechet Audio Distance (FAD) con embeddings PANN sobre 300 clips held-out del dataset Clotho. La comparacion incluye tres condiciones:

| Condicion | FAD (menor es mejor) |
|---|---|
| Audio real convertido a mel y reinvertido con Griffin-Lim (techo del vocoder) | 60,5 |
| Generacion con prompt de texto real | 67,0 |
| Generacion sin prompt (condicionamiento vacio) | 87,1 |

El autor advierte que la estimacion de covarianza de FAD es estructuralmente deficiente porque los embeddings PANN tienen 2048 dimensiones y la muestra de evaluacion es de solo 300 clips (o 1.045 en el split completo, aun por debajo de 2048). Por tanto, el orden relativo de los valores es fiable, pero no la precision absoluta. No se han publicado otros benchmarks (por ejemplo, CLAP score o MOS) en la informacion disponible.

## Requisitos de hardware

- Inferencia: al tener solo 40 M de parametros, el modelo cabe en cualquier GPU consumer con al menos 2 GB de VRAM en precision fp32. Con cuantizacion (aunque no se documentan formatos), podria ejecutarse incluso en CPU, aunque la generacion por difusion requiere multiples pasos de denoising y seria lenta.
- Entrenamiento: se realizo en una H100 SXM 80GB (28,3 GiB de uso), pero el autor indica que es viable en una GPU alquilada de gama media; el coste total fue inferior a 4 horas.
- Despliegue: al usar la libreria `diffusers` de HuggingFace, el modelo puede servirse con pipelines estandar de text-to-audio, o integrarse en aplicaciones Python. No se mencionan adaptaciones para vLLM, llama.cpp u otros runtime especificos.
- Latencia y throughput: no hay datos publicados. Dependera del numero de pasos de inferencia y del hardware; en una GPU moderna, cada clip de 17,8 segundos podria generarse en unos pocos segundos, pero es una estimacion sin confirmar.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AudioModel v1 | 40,3 M | DiT sobre espectrograma mel, rectified flow, sin VAE | CLAP (texto libre) | MIT | HuggingFace |
| Riffusion | ~860 M (fine-tune de SD 1.5) | Difusion latente sobre espectrograma, fine-tune de Stable Diffusion | Texto (CLIP) | No especificada (derivada de SD) | Codigo abierto, pesos en HF |
| tiny-audio-diffusion | ~100 M (estimado) | Difusion sobre forma de onda cruda | Sin texto libre (clases fijas) | MIT | GitHub |
| AudioLDM | ~300-500 M | Difusion latente con VAE y vocoder separado | Texto (CLAP) | Apache 2.0 | HF |

No se dispone de comparativas de rendimiento directas con estos modelos. AudioModel v1 se distingue por su tamano extremadamente reducido, su entrenamiento desde cero y su condicionamiento por texto libre, a costa de una fidelidad de audio limitada por el vocoder Griffin-Lim.

## Limitaciones y advertencias

- Fidelidad de audio limitada: el vocoder Griffin-Lim introduce una distancia FAD de 60,5 incluso con audio real, por lo que el techo de calidad esta muy por debajo de sistemas con vocoders neuronales.
- Resolucion del espectrograma fija (384x256) y duracion fija de 17,8 segundos; no se soportan duraciones variables ni resoluciones superiores.
- Solo idioma ingles: el condicionamiento CLAP esta entrenado para texto en ingles; otros idiomas degradaran el rendimiento.
- Dataset de entrenamiento pequeno (3.839 clips unicos) con riesgo de sobreajuste; el propio autor detecta una inflexion de sobreajuste en el paso 54.000.
- Riesgo de alucinaciones auditivas: el modelo puede generar sonidos que no corresponden a la descripcion, especialmente con prompts fuera de la distribucion de Clotho.
- Sin benchmarks adicionales: solo se reporta FAD con una advertencia metodologica sobre la singularidad de la matriz de covarianza.
- Bug en la libreria `frechet_audio_distance` para PANN: el script de evaluacion `eval_fad.py` incluye una correccion manual (reshape de embeddings) que no esta en la libreria original.
- Licencia MIT permite uso comercial, pero el modelo se distribuye sin garantias y sin soporte oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bench-labs/AudioModel-v1
- Dataset Clotho (referencia de entrenamiento): no se proporciona enlace directo, pero es un dataset publico de audio con captions.
- Repositorio de codigo: no se menciona explicitamente en la informacion disponible; la model card hace referencia a `eval_fad.py` y a la linea PixelModel/VoxelModel, lo que sugiere un repositorio del autor, pero no se ha localizado.
