# darask0/rapid-moss

## Resumen

rapid-moss es un adaptador LoRA de destilación few-step para el modelo de generación de imágenes texto-a-imagen OpenMOSS-Team/MOSS-Image-SFT. Lo desarrolla el usuario darask0 y su objetivo es reducir el coste de inferencia de 100 evaluaciones del DiT por imagen (50 pasos con CFG 3, dos forwards por paso) a solo 4 evaluaciones y sin CFG, manteniendo la misma canalización de VAE y codificador de texto del modelo base. El repositorio ocupa 1,2 GB.

El adaptador parte del checkpoint intermedio lodestones/MOSS-Image-SFT-8-steps-dmd (destilación data-space DMD, 8 pasos) y lo afina a 4 iteraciones mediante DMAD: un crítico LoRA entrenado sobre el profesor congelado separa muestras del profesor de muestras del estudiante, y el estudiante minimiza el logit negativo del crítico. Según las mediciones del autor, el tiempo de DiT por imagen de 1024x1024 en una H100 baja de 16,2 s (profesor) a 0,81 s (4 pasos).

Es relevante porque publica pesos, código de inferencia y un nodo de ComfyUI, e insiste en un punto poco habitual: la LoRA debe sumarse en fp32 sin fusionarla en los pesos, porque el delta es menor que el ancho de redondeo de bf16. La licencia es Apache 2.0, los idiomas declarados son japonés e inglés, y la evaluación publicada es únicamente visual sobre 17 prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un DiT (diffusion transformer) de MOSS-Image-SFT; incluye sustitucion del time path y un estado data-space para el muestreo |
| Parametros totales | No disponible (adaptador LoRA de rango 128 sobre 42 bloques; el recuento de parametros no se publica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo texto-a-imagen, no de lenguaje. La ventana del codificador de texto depende de MOSS-Image-SFT y no se especifica en la informacion disponible |
| Tipos de cuantizacion | LoRA y time path distribuidos en fp32; el modelo base debe usarse en bf16 o fp32. El autor advierte que fp8 y otras cuantizaciones rompen el adaptador |
| Idiomas soportados | Japones, ingles |
| Licencia | Apache 2.0 (la licencia del modelo base no se detalla en la informacion disponible) |
| Formato de pesos | safetensors (tres ficheros: lora.safetensors, time_embedding.safetensors, dataspace.safetensors) |

Detalle de los ficheros y su tamano en VRAM adicional sobre el modelo base:

| Fichero | Contenido | Tamano |
|---|---|---|
| lora.safetensors | LoRA fp32, rango 128 / alpha 128, sobre proj.{q,k,v,o,ffn_up_gate,ffn_down} de los 42 bloques; claves en formato kohya | 1,19 GB |
| time_embedding.safetensors | time_embedding.* y los bias de shared_block_modulation y video_head_modulation | ~0,34 GB (junto con el anterior) |
| dataspace.safetensors | latent_mix.Q [128, 128] y step_codes [1000, 968, 926, 871] | No disponible |

## Arquitectura y entrenamiento

El modelo base MOSS-Image-SFT es un transformer de difusion (DiT) que, en su configuracion de referencia, genera una imagen de 1024x1024 con 50 pasos y classifier-free guidance de escala 3, lo que supone 100 evaluaciones del DiT por imagen (dos forwards por paso) mas el salto del bloque 22 en la rama negativa. rapid-moss no modifica la topologia: anade una LoRA fp32 de rango 128 y alpha 128 en las proyecciones de atencion y de FFN de los 42 bloques, sustituye los modulos de time embedding y de modulacion, e introduce un estado data-space con una matriz de mezcla latente Q de 128x128 y cuatro step codes.

El entrenamiento es una destilacion en dos fases. La primera es data-space DMD (referencia arXiv 2610.12102), heredada del checkpoint de lodestones restringido a 8 pasos; sobre ella se aplica DMAD (arXiv 2610.02188), en el que un critico LoRA entrenado sobre el profesor congelado —MOSS-Image-SFT en su configuracion de 50 pasos— aprende a distinguir muestras del profesor de muestras del estudiante, y el estudiante minimiza el logit negativo del critico. El autor publica el checkpoint de la iteracion 500 de 800 porque a partir de ahi observo degradacion en el seguimiento del prompt y en la generacion de texto. En la informacion disponible no constan el numero de tokens, la composicion del dataset de entrenamiento ni si se aplico RLHF o DPO.

El sampler es especifico y no sigue el esquema Euler habitual: se parte de x0 = 0 y se repite cuatro veces `x = z + Q·x0`, `x0 = z − v`, pasando el step code correspondiente al transformer en cada iteracion, sin reinyeccion de ruido ni escalado de timesteps. Se puede detener en 1, 2 o 3 iteraciones, pero no pasar de 4, ya que solo existen cuatro step codes.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024x1024 y resoluciones cercanas a un megapixel, en 4 evaluaciones del DiT y sin CFG.
- Generacion en menos pasos: admite detenerse en 1, 2 o 3 iteraciones (las etapas intermedias tambien se entrenaron), aunque la calidad de esos modos no esta verificada.
- Renderizado de texto dentro de la imagen: el modelo base acepta el texto a dibujar entre comillas dobles; el autor verifico texto japones en post-its, carteles, posters y bocadillos.
- Prompts en lenguaje natural, listas de etiquetas y descripciones de maquetacion en JSON.
- Composicion multilingue limitada a japones e ingles segun los metadatos del repositorio.
- Integracion en ComfyUI mediante un nodo propio que aplica la LoRA en fp32 sin fusionarla y devuelve MODEL, SAMPLER y SIGMAS especificos.
- Reproducibilidad de semilla: la misma semilla produce el mismo ruido inicial en inference.py y en el nodo de ComfyUI (las diferencias finas provienen del codificador de texto de transformers frente al de ComfyUI).
- No se declaran capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Generacion de ilustracion en prototipado rapido: con 0,81 s de DiT por imagen de 1024x1024 en H100 (frente a 16,2 s del profesor), es adecuado para iterar prompts y composiciones en sesiones interactivas sin cambiar de modelo base.
- Produccion por lotes de imagenes sinteticas: el coste por imagen se divide por 25 en evaluaciones del DiT respecto al profesor, lo que abarata la generacion de datasets de entrenamiento o de assets para pruebas, siempre que no se requiera la textura pictorica del modelo de 50 pasos.
- Maquetacion con texto incrustado para carteleria digital: el adaptador conserva la capacidad de MOSS-Image de dibujar texto entre comillas, util para generar post-its, rotulos o posters en japones, con la advertencia de que los textos pequenos en rotulos y bocadillos de manga suelen degradarse.
- Ilustracion tipo manga con varias vinetas: el soporte de descripciones en JSON permite especificar una maquetacion por vinetas; el autor documenta que en un layout de dos vinetas aparecio un personaje no solicitado en la inferior, por lo que requiere revision manual.
- Tuberias de generacion de assets en CI/CD: al ser tres ficheros safetensors pequenos y un sampler deterministico, el adaptador se puede versionar junto al modelo base y reproducir una imagen concreta a partir del prompt y la semilla, lo que facilita comparaciones entre revisiones.
- Despliegue en ComfyUI para estudios pequenos: el nodo incluido reporta 4,5-6,9 s por imagen de 1024x1024 en una RTX PRO 6000 incluyendo codificacion de texto y VAE, un rango compatible con flujos de trabajo de artista con intervencion manual.
- Punto de partida para investigacion en destilacion few-step: el repositorio incluye el codigo de entrenamiento y documenta la receta DMD data-space mas DMAD con critico LoRA, lo que sirve para reproducir o extender el metodo a otros DiT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (FID, CLIP score, evaluacion de preferencia) en la informacion disponible. El autor indica explicitamente que la evaluacion se limita a inspeccion visual de 17 prompts. Los unicos datos medidos son de latencia y numero de evaluaciones del DiT.

| Modelo / configuracion | Evaluaciones del DiT por imagen | Tiempo DiT por 1024x1024 en H100 |
|---|---:|---:|
| MOSS-Image-SFT (50 pasos, CFG 3, skip del bloque 22 en la rama negativa) | 100 | 16,2 s |
| lodestones/MOSS-Image-SFT-8-steps-dmd (8 pasos) | 8 | 1,54 s |
| rapid-moss (4 pasos, sin CFG) | 4 | 0,81 s |

Medicion adicional aportada por el autor: 4,5-6,9 s por imagen de 1024x1024 en una RTX PRO 6000 usando el flujo de ComfyUI, incluyendo codificacion de texto y decodificacion VAE. Las cifras de la tabla corresponden solo al DiT.

## Requisitos de hardware

- VRAM adicional sobre el modelo base: aproximadamente 1,5 GB (1,19 GB de LoRA fp32 mas unos 0,34 GB de time path y modulacion en fp32).
- VRAM total: no disponible, porque el recuento de parametros y el consumo del modelo base MOSS-Image-SFT no se especifican en la informacion proporcionada. Hay que sumar esos 1,5 GB al requisito de MOSS-Image-SFT en bf16 o fp32.
- GPU verificadas: H100 para las mediciones de DiT (0,81 s por imagen de 1024x1024) y RTX PRO 6000 para el flujo completo de ComfyUI (4,5-6,9 s por imagen).
- GPU de consumo: el autor no publica pruebas en tarjetas consumer; el requisito real lo determina el modelo base, no el adaptador, por lo que no se puede confirmar que quepa en una RTX 4090 o inferior sin conocer el tamano de MOSS-Image-SFT en bf16.
- Restricciones de precision: la LoRA debe aplicarse en fp32 sin fusionar; no funciona con pesos base cuantizados a fp8 ni con cargadores que fusionen la LoRA en bf16 (LoraLoaderModelOnly de ComfyUI, fuse_lora de diffusers).
- Opciones de despliegue: diffusers >= 0.38 y transformers >= 5.3 con el script inference.py incluido; nodo propio comfyui/rapid-moss/ sobre los nodos oficiales de MOSS-Image. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: 4 evaluaciones del DiT por imagen, sin CFG, con un unico forward por paso en lugar de dos; no se publican medidas de throughput agregado ni de batch.

## Comparativa con modelos similares

| Modelo | Relacion | Evaluaciones del DiT | CFG | Tiempo DiT 1024x1024 (H100) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| rapid-moss (darask0) | Adaptador de 4 pasos sobre MOSS-Image-SFT | 4 | No | 0,81 s | Apache 2.0 | HuggingFace, con nodo de ComfyUI y codigo de entrenamiento |
| lodestones/MOSS-Image-SFT-8-steps-dmd | Adaptador de 8 pasos, punto de partida del anterior | 8 | No | 1,54 s | No disponible en la informacion proporcionada | HuggingFace |
| OpenMOSS-Team/MOSS-Image-SFT | Profesor, modelo completo de 50 pasos | 100 | Si (escala 3) | 16,2 s | No disponible en la informacion proporcionada | HuggingFace, nodos oficiales de ComfyUI |
| lodestones run a 4 pasos | Misma base intermedia ejecutada en 4 pasos, sin el afinado DMAD | 4 | No | No disponible | No disponible | No disponible como checkpoint independiente |

El autor afirma que, frente al checkpoint de lodestones ejecutado en 4 pasos, rapid-moss produce imagenes con mas detalle y composicion mas viva, pero sigue por debajo del profesor en textura pictorica y diversidad.

## Limitaciones y advertencias

- La LoRA no debe fusionarse en los pesos: en bf16 el delta es menor que el error de redondeo y el efecto desaparece practicamente. Hay que sumarla en fp32 con inference.py o con el nodo de ComfyUI incluido.
- Los tres ficheros son inseparables: aplicar solo lora.safetensors no funciona, porque time_embedding.safetensors contiene el vector temporal de t=1 plegado en los bias de modulacion.
- El sampler es obligatorio: el bucle `x = z + Q·x0`, `x0 = z − v` con los cuatro step codes. Samplers estandar como Euler o schedulers con shift 5 no producen resultados correctos.
- No se debe usar CFG ni prompt negativo: el efecto ya esta destilado, y subir la escala duplica el calculo y puede degradar color y forma. Tampoco deben anadirse el skip del bloque 22 en la rama negativa ni SLG.
- Rango de pasos limitado a 1-4; se recomiendan 4. La calidad con 1, 2 o 3 pasos esta sin verificar y no es posible superar los 4.
- Precision restringida: la base debe estar en bf16 o fp32. Con fp8 la LoRA se pierde o el time path no se sustituye bien; el nodo de ComfyUI devuelve error en ese caso.
- Introduccion de texto no solicitado: en estilos de pintura empastada aparecen rotulos y caracteres chinos o japoneses no pedidos, un sesgo heredado del checkpoint de 8 pasos.
- Degradacion de texto pequeno: los caracteres diminutos en rotulos, carteles o bocadillos de manga en blanco negro tienden a ser ilegibles.
- Aparicion de personajes no solicitados, documentada en un layout JSON de dos vinetas.
- Menor fidelidad que el profesor: el adaptador no alcanza la textura pictorica ni la diversidad del modelo de 50 pasos.
- Degradacion con entrenamiento prolongado: a partir de la iteracion 800 el seguimiento del prompt y el texto se deterioran; se publica la iteracion 500.
- Evaluacion muy limitada: solo 17 prompts revisados visualmente, sin FID ni evaluacion de preferencia, y sin datos sobre la escala del dataset de entrenamiento.
- Sin verificar: la combinacion con LoRA de personaje o de estilo (la eficacia puede reducirse al destilar a 4 pasos), el uso con MOSS-Image-Base en lugar de SFT y la calidad en resoluciones alejadas de un megapixel o no multiplas de 16.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion en octubre de 2026. Es un artefacto sin validacion independiente.
- Licencia: el adaptador es Apache 2.0, pero la licencia y las condiciones de uso comercial del modelo base MOSS-Image-SFT no se detallan en la informacion disponible; conviene comprobarlas antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darask0/rapid-moss
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Checkpoint de partida (8 pasos, data-space DMD): https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Repositorio oficial de MOSS-Image y nodos de ComfyUI: https://github.com/OpenMOSS/MOSS-Image
- Referencia de data-space DMD: https://arxiv.org/abs/2610.12102
- Referencia de DMAD: https://arxiv.org/abs/2610.02188
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos no guardan relacion con la ficha.
