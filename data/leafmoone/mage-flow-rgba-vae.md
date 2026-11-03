# leafmoone/Mage-Flow-RGBA-vae

## Resumen

Mage-Flow-RGBA-vae es un adaptador LoRA, publicado por el usuario leafmoone, que modifica la etapa VAE del modelo de generación de imágenes Microsoft Mage-Flow para trabajar con imágenes de cuatro canales (RGBA) y preservar el canal alfa. El repositorio no contiene un modelo generativo completo: incluye únicamente los pesos del VAE con el LoRA ya fusionado (404,6 MB) y el adaptador LoRA sin fusionar (43,7 MB, rank 32) correspondiente al checkpoint 14000 de un entrenamiento que alcanzó los 14310 pasos.

El problema que aborda es concreto: los VAE habituales de los modelos de difusión trabajan con tres canales (RGB) y no reconstruyen transparencia, lo que impide generar imágenes con fondo transparente de forma nativa. Este adaptador se entrena sobre un subconjunto de imágenes transparentes de Danbooru para que el VAE codifique y decodifique el canal alfa junto con el color, con el alfa normalizado en el canal 3 y el valor +1 indicando opacidad total.

Es relevante ahora porque la generación de assets con transparencia (sprites, personajes, ilustraciones para composición) es un caso de uso muy demandado y pocos pipelines abiertos lo resuelven a nivel de VAE. Conviene subrayar que el autor advierte explícitamente de que el repositorio solo cubre la fase VAE y que, para obtener salida transparente nativa desde el modelo generador, sería necesario entrenar además un LoRA sobre el DiT, algo que aquí no se ha hecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE de autoencoder con adaptador LoRA (rank 32) sobre el VAE de microsoft/Mage-Flow; estructura inspirada en CKMoss-Image-RGBA |
| Parametros totales | no disponible (pesos fusionados de 404,6 MB; adaptador LoRA de 43,7 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y bf16 durante el entrenamiento |
| Idiomas soportados | zh, en (etiquetado del repositorio) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (pesos VAE fusionados y adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El componente es un VAE de cuatro canales (RGBA) que sustituye al VAE RGB del pipeline Mage-Flow. La entrada y la salida se normalizan al rango [-1, 1], con el canal alfa en la posición 3. El ajuste se realizó mediante LoRA de rango y alpha 32 sobre el VAE base, con un entrenamiento de 14310 pasos acumulados; el último checkpoint completo guardado es el 14000. La configuración usada fue resolución de 512 px, precisión bf16, micro-batch de 8 con acumulación de 4 (batch global de 32), sobre una única GPU/DCU, con un coste medio de aproximadamente 4,79 segundos por paso y un pico de memoria de unos 39,5 GiB.

Los datos de entrenamiento provienen de un subconjunto de imágenes transparentes del dataset leafmoone/webdataset_danbooru_v3_alpha_repack, sin pares imagen-texto ni imágenes opacas. Las métricas de validación sobre 8 imágenes fijas muestran una mejora sostenida: el MAE de alfa baja de 0,01498 en el paso 3500 a 0,01107 en el 11500 (mejor valor), el PSNR sube de 29,99 dB a 31,12 dB y el PSNR sobre fondo blanco mejora de 28,01 dB a 29,54 dB en el paso 14000. En las curvas de pérdida de entrenamiento, la pérdida total cae un 23,8 % y el MAE de alfa un 30,3 % entre las primeras y las últimas 100 entradas de log. El repositorio incluye un informe de consistencia numérica (weights.json) que verifica la equivalencia entre los pesos fusionados y el adaptador original.

## Capacidades

- Codificación y decodificación de imágenes RGBA con reconstrucción del canal alfa, según las métricas de validación del autor.
- Reconstrucción de transparencia sobre entradas RGBA reales, con recuperación correcta del alfa.
- Integración como componente VAE dentro del pipeline de Microsoft Mage-Flow (image-to-image).
- Distribución en dos formatos: pesos fusionados listos para cargar y adaptador LoRA PEFT para reutilización o continuación del entrenamiento.
- No incluye generación de imágenes por sí mismo: no hay DiT ni etapa de difusión en el repositorio.
- No soporta tool calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- Idiomas declarados: chino e inglés, únicamente a efectos de metadatos del repositorio.

## Casos de uso

- Generación de sprites y assets para videojuegos: el VAE preserva el canal alfa, de modo que los assets decodificados pueden componerse directamente sobre cualquier fondo sin recortes manuales.
- Composición de ilustraciones y personajes sobre escenarios: al mantener la transparencia, un pipeline image-to-image con Mage-Flow puede producir capas separadas listas para montaje en un editor.
- Preprocesado de datasets con transparencia: el VAE puede usarse para codificar imágenes RGBA de Danbooru u otras fuentes en latentes que conservan el alfa, útil para entrenar etapas posteriores.
- Investigación en VAEs de cuatro canales: el repositorio ofrece pesos fusionados, adaptador LoRA y un informe de consistencia numérica, lo que facilita reproducir o extender el ajuste.
- Continuación de entrenamiento: el checkpoint 14000 incluye progress.json y manifest.json con hashes, pensados para reanudar el entrenamiento de forma exacta.
- Base para entrenar un LoRA de DiT con transparencia: dado que el autor señala que la salida transparente nativa requiere esa etapa, este VAE sirve como cimiento para ese siguiente paso.
- Evaluación comparativa de VAEs RGBA: las métricas publicadas (Alpha MAE, PSNR sobre fondo negro y blanco, LPIPS) permiten contrastar con otras implementaciones como CKMoss-Image-RGBA.

## Benchmarks y rendimiento

Métricas de validación publicadas por el autor sobre 8 imágenes fijas:

| Metrica | step 3500 | step 10000 | step 11500 | step 14000 | Mejor |
|---|---:|---:|---:|---:|---|
| Alpha MAE (menor mejor) | 0,01498 | 0,01111 | 0,01107 | 0,01131 | 0,01107 @ 11500 |
| PSNR (mayor mejor) | 29,99 dB | 30,99 dB | 31,08 dB | 31,12 dB | 31,12 dB @ 13500 |
| PSNR fondo negro | 31,98 dB | 32,62 dB | 32,66 dB | 32,70 dB | 32,71 dB @ 13500 |
| PSNR fondo blanco | 28,01 dB | 29,36 dB | 29,50 dB | 29,54 dB | 29,54 dB @ 14000 |

Pérdidas de entrenamiento (media de las primeras 100 frente a las últimas 100 entradas de log, 1131 registros):

| Metrica | Primeras 100 | Ultimas 100 | Variacion |
|---|---:|---:|---:|
| Total loss | 0,010546 | 0,008037 | -23,8 % |
| Alpha MAE | 0,011672 | 0,008140 | -30,3 % |
| AB-MSE | 0,001462 | 0,001092 | -25,3 % |
| LPIPS | 0,009080 | 0,006940 | -23,6 % |
| Latent RMS | 1,0184 | 1,0378 | +1,9 % |

No se han publicado comparaciones con benchmarks estándar de generación de imágenes (FID, CLIP score) en la información disponible.

## Requisitos de hardware

- Entrenamiento: una única GPU/DCU con aproximadamente 39,5 GiB de memoria en pico, a 512 px y bf16 con batch global de 32; encaja en una A100 de 40 GB o superior, y con dificultad en una RTX 4090 de 24 GB sin reducir batch o resolución.
- Inferencia del VAE: los pesos fusionados ocupan 404,6 MB, por lo que la carga en VRAM es modesta; no se dispone de cifras exactas de VRAM en inferencia.
- GPU de consumo: previsiblemente cabe en GPUs consumer modernas (RTX 3060 en adelante), aunque el dato no está confirmado en la información disponible.
- Despliegue: al ser un componente VAE y no un modelo completo, se integra en el pipeline de Mage-Flow; no se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el único dato de rendimiento es el tiempo de entrenamiento (4,79 s/paso).

## Comparativa con modelos similares

| Modelo | Tipo | Canales | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mage-Flow-RGBA-vae (este) | LoRA + VAE fusionado sobre Mage-Flow | RGBA | GPL-3.0 | HuggingFace, 0 descargas | Solo fase VAE; sin DiT LoRA |
| CKMoss-Image-RGBA | VAE RGBA de referencia estructural | RGBA | GPLv3 | HuggingFace / GitHub | Inspiración declarada del autor |
| microsoft/Mage-Flow | Modelo base de generación | RGB (VAE original) | MIT (según el autor) | HuggingFace | Sin soporte nativo de alfa en el VAE original |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo la fase VAE: no hay DiT LoRA entrenado, por lo que no produce salida transparente nativa desde el generador; para ello habría que entrenar esa etapa adicional.
- El entrenamiento se hizo exclusivamente con imágenes transparentes de Danbooru, sin pares imagen-texto ni imágenes opacas; el dominio y la distribución de estilos están por tanto acotados.
- Sesgos conocidos: no documentados por el autor, pero la procedencia del dataset (Danbooru) implica los sesgos propios de ese corpus.
- Riesgo de artefactos en el alfa: el MAE de alfa en validación (0,011) no es cero, de modo que pueden aparecer bordes o halos en la transparencia.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y redistribución; conviene revisar LICENSE y NOTICE antes de integrarlo en productos propietarios.
- El modelo base Mage-Flow se declara MIT, pero la combinación con componentes GPLv3 condiciona la distribución del conjunto.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- Los pesos están en safetensors y bf16; no se documentan versiones cuantizadas ni formato GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/leafmoone/Mage-Flow-RGBA-vae
- Modelo base: https://huggingface.co/microsoft/Mage-Flow
- Repositorio GitHub de Mage: https://github.com/microsoft/Mage
- Referencia estructural CKMoss-Image-RGBA: https://huggingface.co/ChenkinLab/CKMoss-Image-RGBA
- Código CKMoss-Image-RGBA: https://github.com/Chenkin-x/CKMoss-Image-RGBA
- Dataset de entrenamiento: https://www.modelscope.cn/datasets/leafmoone/webdataset_danbooru_v3_alpha_repack
