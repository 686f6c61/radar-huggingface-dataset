# cpral/HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD2048

## Resumen

HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD2048 es un modelo de generación de imágenes texto-a-imagen bilingüe (polaco e inglés) desarrollado por el usuario cpral. Se trata de un denoiser basado en Diffusion Transformer (DiT) con 1.246.802.432 parámetros, acompañado de un refinador de texto entrenable de 72,1M de parámetros, ambos condicionados por el codificador congelado Poziomka-Baza-2026-09-05. El modelo parte de la familia FLUX.2 [klein] base 4B de Black Forest Labs y emplea flow matching / rectified flow como paradigma de difusión.

La relevancia de este checkpoint reside en su proceso de entrenamiento: es la etapa epoch49.2 sometida a 2048 pasos de destilación on-policy (OPD) a 1024×1024, usando FLUX.2 [klein] base 4B en int8 con CFG 4 como profesor. El resultado es un modelo compacto (1,24B de parámetros) capaz de generar imágenes en resolución 1024×1024 en 50 pasos de Euler con CFG 3 y time shift 6, con un coste computacional muy inferior al de sus modelos base.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors, con pesos EMA, y está pensado para despliegue mediante la librería diffusers con un pipeline personalizado (AuroraIMG2Pipeline). Su orientación es práctica: generación de imágenes fotorrealistas de productos, comida, vehículos y arquitectura, además de ilustraciones y acuarelas, con soporte nativo de prompts en polaco e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching / rectified flow; denoiser de 1,24B + refinador de texto entrenable de 72,1M; codificador de texto congelado Poziomka-Baza-2026-09-05 |
| Parámetros totales | 1.246.802.432 (denoiser); 72,1M adicionales en el refinador de texto |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; longitud de prompt no especificada) |
| Tipos de cuantización | no disponible (el profesor se usó en int8; no se documentan cuantizaciones del estudiante) |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EMA) |
| Resolución nativa | 1024×1024 (entrenado también a 256 y 512) |
| Pasos de inferencia recomendados | 50 pasos de Euler, CFG 3, time shift 6 (CFG 1 disponible como variante más barata) |
| Tamaño del repositorio | 9,9 GB |
| Librería | diffusers (custom_pipeline AuroraIMG2Pipeline) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) que opera en el espacio latente de FLUX.2 y sigue un esquema de flow matching (rectified flow). El denoiser de 1,24B de parámetros se acompaña de un refinador de texto entrenable de 72,1M, mientras que el codificador de texto Poziomka-Baza-2026-09-05 permanece congelado. La generación se controla mediante resolución, número de pasos de Euler, escala CFG y time shift, con valores recomendados de 1024×1024, 50 pasos, CFG 3 y shift 6.

El entrenamiento base se realizó desde cero sobre imágenes de FLUX-Reason y captions en polaco e inglés. La etapa epoch49.2 continuó epoch49 durante 2048 pasos × 576 imágenes (1.179.648 presentaciones, ~0,2 épocas) con resoluciones 256/512/1024 en proporción de tokens 1:1:4 y time shifts de 1,5/3/6 respectivamente. Sobre esa base se aplicó una destilación on-policy (OPD) de 2048 pasos × 48 trayectorias = 98.304 trayectorias y consultas al profesor, a 1024×1024, usando FLUX.2 [klein] base 4B en int8 con CFG 4 como profesor. El alumno parte de ruido, ejecuta su propia trayectoria de Euler sin CFG adicional en una rejilla de 16 pasos con shift 6, se selecciona un estado mediante u ~ Beta(1,1) e índice floor(16·u), y el alumno ajusta su velocidad a la del profesor mediante MSE. La optimización usó Muon/CMuon con lr 1e-3 y AdamW en el resto de parámetros, con sincronización MuLoCo cada 32 pasos. El entrenamiento se ejecutó en 7 RTX 3090 Ti activas (4 alumnos, 2 profesores dedicados, 1 servidor LM con profesor adicional) durante unas 14 horas (50.389 s). La pérdida OPD final reportada fue de 0,1759 (rango 0,16–0,18). El autor advierte explícitamente que no es una reproducción exacta de la publicación DanceOPD (se usó Beta(1,1) en lugar de Beta(5,2)) y que se destila la velocidad en estados del alumno, no imágenes finales del profesor.

## Capacidades

- Generación de imágenes texto-a-imagen en resolución 1024×1024 (también entrenado a 256 y 512).
- Soporte bilingüe nativo de prompts en polaco e inglés.
- Generación fotorrealista de productos, comida, vehículos y arquitectura, con materiales e iluminación convincentes.
- Generación de ilustraciones y acuarelas.
- Control de la generación mediante CFG (recomendado 3; CFG 1 como variante más barata), número de pasos de Euler y time shift.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No se documentan capacidades de visión, audio ni modo thinking.
- No se documenta image-to-image, inpainting ni controlnet en la información disponible.

## Casos de uso

- Generación de imágenes de producto para catálogos de comercio electrónico: el modelo produce fotografías de productos con materiales e iluminación convincentes a 1024×1024, adecuado para fichas de producto en tiendas polacas o internacionales que necesiten prompts en ambos idiomas.
- Ilustración editorial y de blog: la capacidad de generar acuarelas e ilustraciones permite crear cabeceras y material gráfico para artículos, con control fino mediante CFG 3 y 50 pasos de Euler.
- Prototipado rápido de conceptos visuales: con 1,24B de parámetros y 50 pasos, el modelo es lo bastante ligero para iterar sobre variaciones de un mismo prompt (por ejemplo, cambiando la semilla) en un flujo de diseño.
- Generación de imágenes para marketing en mercados polaco e inglés: el soporte bilingüe nativo evita tener que traducir prompts y permite mantener coherencia de estilo entre campañas en ambos idiomas.
- Creación de fondos y escenas para arquitectura y vehículos: el modelo rinde bien en arquitectura y vehículos según la evaluación visual del autor, útil para presentaciones y material promocional.
- Experimentación e investigación en destilación on-policy: al ser un checkpoint destilado de FLUX.2 [klein] base 4B con pesos EMA y código de entrenamiento público, sirve como caso de estudio reproducible de OPD en modelos texto-a-imagen.
- Despliegue en hardware de consumo: con 1,24B de parámetros y licencia Apache 2.0, puede ejecutarse en GPUs de consumo para aplicaciones de generación de imágenes a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la evaluación presentada es visual sobre los grids publicados y no una medición de FID, FD-DINOv2 ni una comparación de superioridad frente al profesor. Los grids de 36 prompts provienen de los primeros 36 ejemplos de Aesthetics-Part01 de FLUX-Reason y no constituyen un benchmark independiente sobre prompts nuevos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,24B de parámetros en safetensors y un repositorio de 9,9 GB, se requiere al menos una GPU con suficiente memoria para cargar los pesos y los latentes a 1024×1024. No se documentan cifras exactas.
- GPU recomendadas: el entrenamiento se realizó en RTX 3090 Ti; no se documentan recomendaciones de inferencia específicas.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs de gama alta de consumo (RTX 3090/4090 y similares), dado el tamaño de 1,24B de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline=REPO, trust_remote_code=True)` y el pipeline AuroraIMG2Pipeline. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles. El autor reporta 50 pasos de Euler como configuración recomendada y CFG 1 como variante más barata, pero sin cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD2048 | 1,24B (denoiser) + 72,1M (refiner) | 1024×1024 | pl, en | Apache 2.0 | Destilado de FLUX.2 [klein] base 4B mediante OPD |
| FLUX.2 [klein] base 4B (profesor) | 4B (según nombre del modelo) | no disponible en la información | no disponible | no disponible en la información | Modelo base de Black Forest Labs usado como profesor en int8 con CFG 4 |
| cpral/HomeIMG-1.2B-PL-EN-epoch49.2 (etapa previa) | 1,24B (denoiser) | 1024×1024 | pl, en | Apache 2.0 | Checkpoint anterior sin la destilación OPD de 2048 pasos |

No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo entre estos modelos. La comparación se limita a parámetros, resolución, idiomas y licencia.

## Limitaciones y advertencias

- El texto, las etiquetas y los logotipos generados suelen ser ilegibles o incorrectos.
- El conteo exacto de objetos, la anatomía, las manos y las caras en multitudes siguen siendo problemáticos (por ejemplo, un prompt de dos galletas produce tres).
- No se ha eliminado la duplicación de sujetos: en el ejemplo en inglés del astronauta aparecen dos cascos, y en el grid de 36 hay motocicletas fusionadas.
- Algunas imágenes presentan zonas blandas, granulosas o apagadas; los grids no permiten atribuirlo con certeza al time shift o a la distribución de consultas OPD.
- La evaluación es puramente visual sobre los grids publicados, sin FID ni FD-DINOv2, y no demuestra superioridad frente al profesor.
- No se ha realizado una evaluación sistemática de resoluciones inferiores tras la destilación.
- El proceso de destilación no reproduce exactamente la publicación DanceOPD (Beta(1,1) en lugar de Beta(5,2); se destila velocidad en estados del alumno, no imágenes finales del profesor).
- La pérdida OPD reportada (0,16–0,18; último paso 0,1759) es un MSE frente al profesor y no una medida de calidad de imagen.
- El soporte de idiomas se limita a polaco e inglés; no se documentan otros idiomas.
- Aunque la licencia es Apache 2.0, el modelo deriva de FLUX.2 [klein] base 4B y de Poziomka-Baza-2026-09-05; conviene revisar las condiciones de los modelos base para uso comercial en producción.
- No se documentan sesgos específicos, pero al entrenarse sobre FLUX-Reason y captions en pl/en puede heredar sesgos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD2048
- Checkpoint previo (epoch49.2): https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch49.2
- Modelo base profesor FLUX.2 [klein] base 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Codificador de texto Poziomka-Baza-2026-09-05: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Dataset FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
