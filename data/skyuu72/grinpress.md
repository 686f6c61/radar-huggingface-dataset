# skyuu72/grinpress

## Resumen

grinpress es un modelo de generacion de imagenes a partir de texto (text-to-image) de 33,86 millones de parametros, entrenado desde cero por skyuu72 (skyler Ulrich) y publicado en Hugging Face bajo licencia MIT. Su proposito no es la generacion de imagenes de proposito general, sino un dominio muy acotado y completamente sintetico: producir caras de estilo semitono (halftone) impresas sobre papel de periodico envejecido, acompanadas de una palabra corta estampada al lado. La arquitectura combina una U-Net de 32,23 M de parametros con un codificador de texto de 1,63 M basado en tokenizador de bytes ASCII, y se entrena mediante rectified flow (flow matching) directamente en espacio de pixeles, sin VAE ni autocodificador latente.

La relevancia del modelo es mas experimental que practica. Se trata de un caso de estudio reproducible de un pipeline de difusion completo —generacion de datos, entrenamiento, muestreo con classifier-free guidance y evaluacion— que cabe en una unica GPU A100 durante unas 7 horas y cuyos pesos ocupan apenas 68 MB en bf16. Esto lo convierte en una pieza util para docencia, para investigacion sobre renderizado de texto en modelos de difusion pequenos y para prototipado en hardware muy modesto, donde incluso una CPU de 8 hilos genera una imagen en 26,8 segundos.

El modelo esta limitado por diseno: solo acepta la plantilla de prompt `a {color} {expression} face with '{text}' next to it`, trabaja exclusivamente a 128x128 pixeles, admite entre 1 y 8 caracteres ASCII y solo conoce 12 colores y 3 expresiones. No es, en ningun caso, un sustituto de modelos de generacion de imagenes de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de rectified flow (flow matching) en espacio de pixeles, con atencion propia y atencion cruzada a nivel de caracter enmascarada |
| Parametros totales | 33.863.299 (32,23 M en la U-Net + 1,63 M en el codificador de texto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el codificador de texto acepta captions de hasta 64 caracteres ASCII |
| Tipos de cuantizacion | pesos publicados en bf16; el cargador los promociona a fp32. No se documentan otros formatos cuantizados |
| Idiomas soportados | en (plantilla de prompt fija en ingles; el texto renderizado se limita a ASCII) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y checkpoint nativo de PyTorch (`ema_final_bf16.pt`, unos 68 MB) |

## Arquitectura y entrenamiento

La red generativa es una U-Net con cuatro niveles de resolucion (128/64/32/16) y 64/128/192/256 canales respectivamente, con dos ResBlocks por nivel. El condicionamiento temporal se realiza mediante AdaGN a partir de una embedding sinusoidal del paso de tiempo proyectada por un MLP. La atencion propia y la atencion cruzada —esta ultima enmascarada y operando a nivel de caracter— se aplican en los niveles de 32 y 16 y en el bloque central. El codificador de texto es deliberadamente minúsculo: un tokenizador de bytes ASCII con un maximo de 64 caracteres, embeddings aprendidas con posiciones sinusoidales y un transformer de 2 capas con dimension 256. Durante el entrenamiento se aplica un 10 % de dropout de classifier-free guidance hacia una secuencia nula aprendida.

El entrenamiento sigue el formalismo de rectified flow: `x_t = (1-t)·x0 + t·ε`, con `t=0` correspondiente al dato y `t=1` al ruido, y la red aprende a predecir `v = ε − x0` con perdida MSE y `t` muestreado de una logit-normal. El muestreo emplea integracion de Euler de `t=1` a `t=0` con guidance `v = v_u + s·(v_c − v_u)`. Los datos son 50.000 imagenes de 128 px generadas proceduralmente mediante `generate_data.py`: papel de periodico envejecido, una cara en semitono en uno de 12 colores, una expresion (smiley, sad o meh) y entre 1 y 8 caracteres en tipografia de madera o serif con sangrado de tinta y bordes desgastados. La programacion fue de 60.000 pasos con batch 64, AdamW con learning rate 2e-4, 1.000 pasos de warmup y decaimiento coseno, autocast en bf16 y EMA de 0,9999 (los pesos publicados son los de la EMA). Todo el entrenamiento se ejecuto en una unica A100 en Google Colab, en aproximadamente 7 horas de reloj incluyendo dos reanudaciones desde checkpoint.

## Capacidades

- Generacion de imagenes text-to-image en un dominio cerrado: caras semitono sobre papel de periodico envejecido a 128x128 pixeles.
- Renderizado de texto corto (1 a 8 caracteres ASCII) integrado en la imagen, con tipografia de estilo madera o serif y efecto de sangrado de tinta.
- Control de color sobre 12 opciones: red, orange, yellow, green, teal, blue, navy, purple, pink, brown, gray y cyan.
- Control de expresion sobre 3 opciones: smiley, sad y meh.
- Muestreo con classifier-free guidance ajustable (`--cfg_scale`) y numero de pasos de Euler configurable (`--steps`).
- Soporte de semilla fija (`--seed`) para reproducibilidad y generacion por lotes (`--num_images`).
- Inferencia en CPU y en GPU, con pesos en bf16 o safetensors.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni capacidades multilingues.

## Casos de uso

- Docencia sobre modelos generativos: el pipeline completo (datos sinteticos, rectified flow, CFG, muestreo de Euler) cabe en un cuaderno de Colab y en una sola GPU, lo que permite explicar cada componente sin abstracciones de librerias de alto nivel.
- Investigacion sobre renderizado de texto en difusion: al ser un modelo minusculo con atencion cruzada a nivel de caracter, sirve como banco de pruebas controlado para medir como afectan el tokenizador, el enmascarado de la atencion o el numero de pasos a la legibilidad de las letras.
- Generacion de assets retro para juegos o fanzines: produce caras con una palabra corta estampada en estilo periodico antiguo, util para texturas, avatares o ilustraciones de baja resolucion en prototipos con estetica de imprenta.
- Generacion de datos sinteticos con texto incrustado: las imagenes resultantes pueden emplearse para aumentar conjuntos de entrenamiento de OCR o de deteccion de texto en un dominio visual muy concreto (semitono, tinta sangrada, papel amarillento).
- Demostraciones interactivas de bajo coste: con menos de 1 GB de RAM pico en CPU y unos 68 MB de pesos, puede servirse en un Space de Gradio con ZeroGPU o en un contenedor pequeno, con aproximadamente 1 segundo por lote segun el autor.
- Pruebas de regresion de infraestructura: su bajo coste de inferencia y su semilla reproducible lo hacen apto para validar pipelines de despliegue, conversión de formatos o monitorizacion de latencia sin consumir presupuesto de GPU.
- Experimentos de ajuste fino: la licencia MIT y el tamano reducido permiten reentrenar o adaptar los pesos a variaciones del dominio (otros colores, otras tipografias, otra resolucion) sin requisitos de hardware elevados.
- Evaluacion comparativa de tecnicas de muestreo: permite medir el compromiso entre numero de pasos, escala de CFG y calidad de las letras en un modelo cuyo coste por paso es de 66,1 GFLOPs a 128 px.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K, FID, CLIP score ni metricas equivalentes). La model card solo incluye una progresion cualitativa de muestras fijas en los pasos 5k, 20k, 40k y 60k, donde se observa que la composicion y el color se estabilizan pronto y que los pasos finales mejoran principalmente la definicion de las letras (las cadenas aleatorias como `XQ7` son claramente mas limpias a 60k).

Si se documentan mediciones de velocidad de inferencia, recogidas en la seccion de requisitos de hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no medida en GPU. Como referencia, los pesos ocupan unos 68 MB en bf16 y el pico de RAM medido en CPU es de aproximadamente 0,9 GB, por lo que la huella en VRAM es inferior a 1 GB en configuraciones tipicas.
- GPU recomendadas: cualquier GPU moderna es suficiente. El autor aporta estimaciones para A100 (bf16), L4 y T4; tambien funciona en GPUs de consumo como las RTX 4090, 3090 o inferiores.
- Cabe en GPU de consumo: si, con margen amplio, incluidas GPUs con 4-8 GB de VRAM.
- Opciones de despliegue: inferencia mediante el `sample.py` y `model.py` del propio repositorio, ya sea cargando `ema_final_bf16.pt` con PyTorch o `model.safetensors` con la libreria safetensors. El modelo no esta integrado en diffusers, vLLM, Ollama, llama.cpp ni TGI, dado que usa codigo de arquitectura propio.
- Latencia y throughput:
  - CPU, Xeon de 8 hilos, fp32 (medido): 26,8 s por imagen con 50 pasos y CFG (100 pasadas hacia delante); 13,3 s con 25 pasos; pico de RAM de aproximadamente 0,9 GB.
  - A100, bf16 (estimado): 0,5-1 s por imagen con batch 1; 15-20 imagenes/s en lote.
  - L4 (estimado): 1-1,5 s por imagen; aproximadamente 6 imagenes/s en lote.
  - T4 (estimado): 1,5-2,5 s por imagen; aproximadamente 3 imagenes/s en lote.
  - Una unica pasada hacia delante consume 66,1 GFLOPs a 128 px (medido con el contador de FLOPs de PyTorch). Las cifras de GPU son estimaciones del autor asumiendo un 30-35 % del rendimiento pico y no fueron medidas.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada: grinpress no es un modelo de difusion de proposito general ni compite en la misma categoria de tamano y tarea que los modelos text-to-image habituales. La busqueda web solo devuelve el perfil del autor, otro modelo suyo (`skyuu72/wag-2b`) del que no se aportan datos tecnicos, y directorios genericos de lanzamientos de modelos.

| Modelo | Parametros | Resolucion / contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grinpress | 33,86 M | 128 px; texto de 1-8 caracteres ASCII | text-to-image de dominio fijo (caras semitono sobre periodico) | MIT | pesos abiertos en Hugging Face |
| wag-2b (skyuu72) | no disponible | no disponible | no disponible | no disponible | referenciado en la busqueda web, sin datos tecnicos |
| Modelos text-to-image de proposito general (familia Stable Diffusion y similares) | no disponible en la informacion proporcionada | no disponible | text-to-image general | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio cerrado: el modelo solo genera una cara con una cadena de texto sobre papel de periodico. No es un modelo de imagenes de uso general y fallara fuera de ese dominio.
- Plantilla de prompt obligatoria: `a {color} {expression} face with '{text}' next to it`. `sample.py` valida el prompt con una expresion regular y devuelve un error si no encaja; no hay forma de invocar el modelo con lenguaje natural libre.
- Vocabulario restringido: 12 colores y 3 expresiones. El texto debe tener entre 1 y 8 caracteres ASCII, entrenado mayoritariamente con mayusculas y cadenas aleatorias de letras y digitos.
- Legibilidad imperfecta: las letras aparecen ocasionalmente emborronadas o mal formadas, sobre todo en cadenas aleatorias largas y en minusculas.
- Resolucion unica: solo 128 px. El codigo admite 256 px, pero los pesos publicados no se entrenaron a ese tamano y no se garantiza su comportamiento.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe desviacion respecto al prompt, con alteraciones de color, expresion o caracteres, especialmente en pasos de muestreo bajos o escalas de CFG mal ajustadas.
- Datos de entrenamiento totalmente sinteticos, generados proceduralmente: no hay datos reales, por lo que no se han evaluado sesgos sobre poblaciones reales, pero tampoco se puede asumir ninguna representatividad del mundo real.
- Licencia: MIT, permisiva e incluye uso comercial del modelo. Las fuentes tipograficas empleadas para generar los datos se descargan en tiempo de ejecucion bajo sus propias licencias OFL o Apache y no se distribuyen con el repositorio, por lo que hay que respetar esas licencias si se regeneran los datos.
- Adopcion muy baja: 17 descargas y 0 likes en el momento de redactar esta ficha, con lo que no existe una comunidad que haya validado el modelo en produccion.
- Fechas de publicacion y actualizacion registradas como 2026-10-13, segun los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skyuu72/grinpress
- Demo interactiva (Gradio, ZeroGPU): https://huggingface.co/spaces/skyuu72/grinpress-demo
- Perfil del autor en Hugging Face: https://huggingface.co/skyuu72
- Otro modelo del mismo autor: https://huggingface.co/skyuu72/wag-2b
- Ficha de wag-2b en savrn.com: https://savrn.com/models/wag-2b
- Sitio del autor (Quantara): https://quantara.cv
- Archivos relevantes dentro del repositorio: `config.json`, `model.py`, `sample.py`, `generate_data.py`, `smiley_flow_colab.ipynb`, `run_pipeline.sh` y el directorio `samples/`
- Paper tecnico o informe de entrenamiento: no disponible
- Repositorio de codigo independiente: no disponible (el codigo reside en el propio repositorio de Hugging Face)
