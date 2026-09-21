# fassabilf/sea-clip-tiny-abl-bloom

## Resumen

SEA-CLIP-Tiny (ablation: only Bloom) es un checkpoint de ablación publicado por el autor fassabilf dentro del proyecto SEA-CLIP-Tiny, un trabajo presentado en ACCV 2026 que busca construir embeddings texto-vision eficientes y multilingues para lenguas del sudeste asiatico. Se trata de un modelo CLIP de tipo contrastivo con una torre de vision ViT-T/16 y una torre de texto de 12 capas y 384 dimensiones, con una dimension de embedding conjunta de 512. En total suma 46,11 millones de parametros, de los cuales 5,62 millones corresponden a la torre de vision y 40,49 millones a la torre de texto.

La caracteristica que define a este checkpoint es que no es el modelo principal, sino una de las filas de la tabla de ablacion del articulo. Comparte arquitectura, pipeline y hiperparametros con el modelo principal, pero se entreno exclusivamente con el subconjunto Bloom (21.000 pares imagen-texto), en lugar de la mezcla completa de datos multilingues. El objetivo de esta variante es medir de forma aislada la contribucion de esa fuente de datos al rendimiento final.

Los resultados publicados muestran que este checkpoint no es utilizable en la practica: obtiene 0,0 en recuperacion R@1 sobre los splits de CG y WIT, 1,0 sobre Bloom (el unico dato que vio en entrenamiento), 0,1 % de precision zero-shot en ImageNet y 0,1 % en el promedio R@1 sobre XM3600, Flickr30k-200 y XTD-200. Su relevancia es, por tanto, exclusivamente metodologica: sirve como evidencia de que entrenar con una unica fuente de datos pequena provoca un colapso de las capacidades generales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP contrastivo: torre de vision ViT-T/16 + torre de texto de 12 capas y 384 de ancho, dimension de embedding 512 |
| Parametros totales | 46,11 M (5,62 M vision + 40,49 M texto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (tokenizer CLIP BPE, vocabulario 49.408) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones del checkpoint) |
| Idiomas soportados | en, id, jv, su, ms, th, vi, my |
| Licencia | MIT |
| Formato de pesos | No disponible en la model card; el repositorio usa la libreria open_clip y se carga mediante `hf-hub` (tamano del repo: 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de un CLIP bimodal clasico. La torre de vision es un ViT-T/16 (Vision Transformer Tiny con parches de 16x16), con 5,62 millones de parametros. La torre de texto tiene 12 capas y una anchura de 384, con 40,49 millones de parametros. Ambas ramas proyectan a un espacio comun de 512 dimensiones donde se calcula la similitud contrastiva. El tokenizer es el BPE de CLIP, con vocabulario de 49.408 entradas y una longitud maxima de contexto de 77 tokens. El modelo se distribuye integramente dentro del ecosistema open_clip y se invoca con `open_clip.create_model_and_transforms` apuntando a `hf-hub:fassabilf/sea-clip-tiny-abl-bloom`.

La innovacion del proyecto no esta en la arquitectura, sino en la estrategia de destilacion y en el estudio de mezclas de datos. Este checkpoint concreto se entreno con 21.000 pares imagen-texto del conjunto Bloom como unica fuente, y uso como profesor a MetaCLIP2-ViT-B-16-worldwide. No se documentan en la informacion disponible ni el numero total de tokens vistos, ni si hubo fases de RLHF o DPO (poco habituales en modelos contrastivos de este tipo). El repositorio incluye un `params.txt` con la configuracion exacta de entrenamiento, y el codigo de entrenamiento y evaluacion esta publicado en GitHub. La model card no detalla tecnicas adicionales como atencion lineal ni decodificacion especulativa, que en cualquier caso no aplican a este tipo de modelo.

## Capacidades

- Clasificacion de imagenes zero-shot: el modelo genera embeddings conjuntos de imagen y texto, permitiendo clasificar imagenes contra etiquetas textuales sin entrenamiento adicional. En la practica, esta capacidad esta practicamente colapsada en este checkpoint (0,1 % en ImageNet).
- Recuperacion imagen-texto y texto-imagen: calculo de similitud coseno entre embeddings de ambas modalidades para tareas de retrieval.
- Procesamiento de texto multilingue limitado: la model card declara soporte para ingles, indonesio, javanes, sundanes, malayo, tailandes, vietnamita y birmano, aunque este checkpoint no fue entrenado con la mezcla multilingue completa.
- Modalidad unica: solo texto e imagen. No procesa audio ni video de forma nativa.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo de texto, sino un codificador contrastivo, por lo que estas capacidades no aplican.
- Sin modo de razonamiento (thinking mode) ni generacion autoregresiva: no produce texto libre, solo embeddings.

## Casos de uso

- Investigacion en ablaciones de destilacion multimodal: este checkpoint es una fila de una tabla de ablacion y su uso previsto es reproducir el experimento que mide el efecto de entrenar solo con datos de Bloom. Se cargaria con open_clip y se evaluaria con el script de evaluacion del repositorio de GitHub.
- Verificacion de colapso por sobreajuste a una unica fuente: sirve como caso de estudio de como 21.000 pares de una sola distribucion de datos destruyen la capacidad zero-shot general, con una caida a 0,1 % en ImageNet.
- Reproducibilidad academica: para revisores o investigadores que quieran replicar los numeros del articulo de ACCV 2026, este checkpoint es el artefacto exacto que produce la fila "Only Bloom".
- Linea base negativa en experimentos: util como referencia inferior en comparaciones de estrategias de mezcla de datos o de destilacion, frente al modelo principal SEA-CLIP-Tiny.
- Docencia sobre modelos contrastivos: por su tamano reducido (46 M de parametros, 0,2 GB de repositorio) y su licencia MIT, es comodo para ilustrar el funcionamiento de la API de open_clip, la tokenizacion CLIP de 77 tokens y el calculo de similitudes, incluso en CPU.
- Pruebas de infraestructura de despliegue: sirve para validar pipelines de carga de modelos CLIP desde el Hugging Face Hub en entornos de CI, sin coste de GPU relevante.
- No se recomienda ningun caso de uso productivo real: recuperacion de imagenes, moderacion visual, busqueda semantica multilingue o clasificacion zero-shot en produccion quedan descartados por los resultados publicados.

## Benchmarks y rendimiento

Datos publicados en la model card. Recuperacion R@1 sobre los splits reservados de cada fuente de entrenamiento, precision zero-shot en ImageNet y promedio Avg@1 de recuperacion (solo recuperacion) sobre XM3600, Flickr30k-200 y XTD-200, en porcentaje.

| Metrica | Valor |
|---|---|
| CG R@1 | 0,0 |
| WIT R@1 | 0,0 |
| Bloom R@1 | 1,0 |
| ImageNet (zero-shot) | 0,1 |
| R@1-Avg (XM3600, Flickr30k-200, XTD-200) | 0,1 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K; estas metricas no aplican a un modelo contrastivo de clasificacion de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: con 46,11 M de parametros, unos 184 MB en FP32 y unos 92 MB en FP16. El repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM. No requiere A100 ni H100 en absoluto; una GTX 1050 o integrada moderna es suficiente.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo de la ultima decada, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la via documentada es open_clip, con carga remota desde el Hub mediante `open_clip.create_model_and_transforms('hf-hub:...')`. No se documentan pesos GGUF ni soporte para vLLM, llama.cpp, Ollama o TGI; estos motores estan orientados a modelos generativos y no aplican a un codificador CLIP.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | R@1-Avg (XM3600/Flickr30k-200/XTD-200) | ImageNet | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SEA-CLIP-Tiny (abl. only Bloom) | 46,11 M (5,62 M vision + 40,49 M texto) | 77 tokens | 0,1 | 0,1 | MIT | Hugging Face (open_clip) |
| SEA-CLIP-Tiny (modelo principal) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face: fassabilf/sea-clip-tiny |
| MetaCLIP2-ViT-B-16-worldwide (profesor) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

La unica comparacion con datos completos que puede hacerse con la informacion disponible es contra el modelo principal del mismo proyecto, del que se sabe que comparte arquitectura, pipeline e hiperparametros y solo difiere en la mezcla de entrenamiento, pero cuyos valores numericos no se recogen en la model card de este checkpoint.

## Limitaciones y advertencias

- Colapso de rendimiento: los resultados publicados (0,0 en CG y WIT, 0,1 % en ImageNet, 0,1 % en R@1-Avg) indican que el modelo ha perdido practicamente toda capacidad de generalizacion. Es un checkpoint de ablacion, no un modelo utilizable.
- Sobreajuste severo: el 1,0 de R@1 en Bloom frente a 0,0 en el resto de fuentes es un indicio claro de memorizacion de la unica fuente de entrenamiento.
- Contexto muy corto: la torre de texto esta limitada a 77 tokens, por lo que no admite parrafos largos, documentos extensos ni prompts complejos.
- Cobertura multilingue no verificada: aunque la model card declara ocho idiomas, este checkpoint no se entreno con la mezcla multilingue, por lo que el soporte real para indonesio, javanes, sundanes, malayo, tailandes, vietnamita y birmano no esta respaldado por los numeros.
- Sin generacion de texto: no es un modelo de lenguaje y no puede usarse para chat, resumen, traduccion generativa ni razonamiento; solo produce embeddings.
- Riesgo de sesgo: los datos de Bloom, con 21.000 pares, son demasiado limitados y no representativos como para asumir un comportamiento equilibrado entre idiomas, culturas o demografia. No se publican analisis de sesgo.
- Alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de asignar similitudes altas a pares imagen-texto incorrectos por el mal calibrado de los embeddings resultantes.
- Licencia: MIT, sin restricciones para uso comercial segun la propia model card. No obstante, la inviabilidad tecnica del checkpoint hace irrelevante este punto en la practica.
- Advertencia de produccion: no debe desplegarse en ningun sistema real. Para cualquier tarea de clasificacion o recuperacion multimodal, debe usarse el modelo principal del proyecto o una alternativa consolidada.
- Fecha de publicacion futura en los metadatos (2026-09-21) y ausencia total de adopcion (0 descargas, 0 likes) en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fassabilf/sea-clip-tiny-abl-bloom
- Modelo principal del proyecto: https://huggingface.co/fassabilf/sea-clip-tiny
- Repositorio de codigo de entrenamiento y evaluacion: https://github.com/fassabilf/sea-clip-tiny
- Cita del articulo: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, Asian Conference on Computer Vision (ACCV), 2026 (sin DOI ni enlace disponible en la informacion proporcionada)
- No se han encontrado otros enlaces relevantes en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
