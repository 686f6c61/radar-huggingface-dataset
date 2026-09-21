# mohkoh/x-jepa

## Resumen

X-JEPA es una familia de checkpoints de vision-lenguaje publicada por Mohammad Kohankhaki y colaboradores (Daniel Kusuma, Shirin Salehi, Carsten Kamp, Sigrid Brell-Cokcan y Anke Schmeink) como material asociado al articulo "Latent Prediction Needs Alignment: A Controlled Study of Joint-Embedding Predictive Vision-Language Learning", aceptado para AACL-IJCNLP 2026. No es un modelo generativo de texto, sino un encoder vision-lenguaje entrenado con prediccion en espacio latente (JEPA) y evaluado en tareas de retrieval, comprension composicional y razonamiento espacial. El repositorio ocupa 24,2 GB e incluye ocho checkpoints: dos baselines (CLIP y SigLIP), la variante de solo prediccion, la variante target-contrastive y cuatro variantes con prediccion mas alineamiento segun el peso lambda.

El resultado central del trabajo es que la prediccion latente por si sola colapsa: la variante X-JEPA [P] obtiene 0,10 de recall en COCO zero-shot, frente a 67,89 de CLIP. Anadir un termino de alineamiento corrige el problema, y el modelo principal X-JEPA [P,A] con lambda=0,1 supera a ambos baselines en las seis metricas reportadas (COCO ZS MR 69,39; Flickr ZS MR 81,53; SugarCrepe++ 73,30; SVO Acc 85,13; VSR AUROC 63,91; NLVR2 Token 60,11).

La relevancia actual es doble: por un lado aporta evidencia controlada sobre cuando la prediccion en espacio latente necesita alineamiento explicito; por otro, publica los pesos (licencia MIT, 3,1 GB el modelo principal) para reproducir el estudio y reutilizar los embeddings en tareas de recuperacion multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder vision-lenguaje basado en JEPA (joint-embedding predictive architecture); detalles de capas y dimensiones no disponibles |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (no aplicable en encoder de embedding) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.ckpt`); no hay safetensors ni GGUF |
| Tamano del repositorio | 24,2 GB (ocho checkpoints entre 2,2 GB y 3,1 GB) |
| Libreria | PyTorch |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

La model card identifica el modelo como una arquitectura de embeddings conjuntos de tipo JEPA aplicada a vision-lenguaje. El entrenamiento se organiza como un estudio controlado con tres variantes: [P] solo prediccion en espacio latente, [TC] target-contrastive, y [P,A] prediccion mas alineamiento, con cuatro valores de lambda (0,03; 0,1; 0,3 y 1,0). El modelo principal es [P,A] con lambda=0,1. Se incluyen ademas dos baselines entrenados en el mismo marco: CLIP y SigLIP, ambos con checkpoints de 2,2 GB.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni innovaciones de decodificacion. La evidencia empirica publicada si permite una lectura tecnica clara: la prediccion latente sin alineamiento provoca colapso de representacion (X-JEPA [P] baja a 0,10 en COCO ZS MR y 37,06 en SugarCrepe++), mientras que la variante target-contrastive recupera parcialmente el rendimiento (44,60 y 44,17) y la variante con alineamiento lo supera respecto a CLIP y SigLIP en todas las metricas de la tabla principal.

## Capacidades

- Recuperacion multimodal texto-imagen en regimen zero-shot: evaluada en COCO y Flickr30k con las metricas de recall reportadas.
- Comprension composicional: evaluada con SugarCrepe++, que mide la sensibilidad a permutaciones de sujeto, objeto y relaciones.
- Razonamiento espacial y de relaciones: evaluado con SVO Accuracy y VSR AUROC.
- Razonamiento sobre pares de imagenes y lenguaje natural: evaluado con NLVR2 Token Accuracy.
- Generacion de embeddings conjuntos imagen-texto reutilizables para busqueda y clasificacion zero-shot.
- Entrenamiento y evaluacion reproducibles: se publican los pesos de todas las variantes y las ejecuciones de Weights & Biases asociadas a cada checkpoint.
- Soporte de tool calling / function calling: no disponible (es un encoder, no un modelo generativo de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no; el unico idioma declarado es ingles.
- Capacidades especiales (thinking mode, vision generativa, audio): no disponibles.

## Casos de uso

- Busqueda visual y retrieval texto-imagen: los embeddings conjuntos permiten indexar un corpus de imagenes y recuperarlas mediante consultas en ingles, apoyandose en el recall zero-shot reportado en COCO y Flickr30k.
- Clasificacion zero-shot de imagenes: usar las etiquetas de clase como texto y asignar la clase con mayor similitud en el espacio latente, sin reentrenamiento por dominio.
- Filtrado y curaduria de datasets multimodales: detectar pares imagen-texto mal alineados comparando similitudes en el espacio de embeddings antes de usarlos en otros entrenamientos.
- Motor de embeddings para RAG multimodal: generar vectores de imagenes y de fragmentos de texto para un indice vectorial que alimente busquedas documentales con componente visual.
- Moderacion y verificacion de contenido grafico: comparar una imagen contra descripciones de referencia para comprobar coherencia entre el pie de foto y el contenido visual.
- Investigacion en representaciones auto-supervisadas: reutilizar los checkpoints [P], [TC] y [P,A] con distintos lambda para reproducir el estudio de colapso de representacion y alineamiento en espacio latente.
- Evaluacion de modelos de vision-lenguaje: emplear el pipeline del repositorio como banco de pruebas sobre SugarCrepe++, SVO, VSR y NLVR2 para comparar nuevas propuestas contra CLIP, SigLIP y X-JEPA.
- Sistemas de recomendacion por similitud visual: ordenar catalogos de producto segun la distancia entre el embedding de la imagen consultada y los del catalogo.

## Benchmarks y rendimiento

Resultados de la tabla 1 del articulo, tal como se publican en la model card:

| Modelo | COCO ZS MR | Flickr ZS MR | SugarCrepe++ | SVO Acc | VSR AUROC | NLVR2 Token |
|---|---:|---:|---:|---:|---:|---:|
| CLIP | 67,89 | 79,87 | 71,68 | 84,43 | 63,75 | 54,93 |
| SigLIP | 67,67 | 80,32 | 69,79 | 84,30 | 62,77 | 55,00 |
| X-JEPA [P] | 0,10 | 0,21 | 37,06 | 50,36 | 48,52 | 53,05 |
| X-JEPA [TC] | 44,60 | 48,30 | 44,17 | 80,73 | 57,26 | 56,42 |
| X-JEPA [P,A] lambda=0,1 | 69,39 | 81,53 | 73,30 | 85,13 | 63,91 | 60,11 |

El checkpoint principal supera a CLIP en COCO ZS MR por 1,50 puntos, en Flickr ZS MR por 1,66, en SugarCrepe++ por 1,62, en SVO Acc por 0,70, en VSR AUROC por 0,16 y en NLVR2 Token por 5,18. No se publican resultados para los otros valores de lambda (0,03; 0,3; 1,0) en la informacion disponible.

## Requisitos de hardware

- Tamano de los pesos: el modelo principal ocupa 3,1 GB en disco; los baselines CLIP y SigLIP ocupan 2,2 GB cada uno. La precision de almacenamiento no se especifica en la model card, por lo que la VRAM necesaria en inferencia no esta documentada oficialmente.
- VRAM estimada: partiendo del tamano del checkpoint, cabe esperar un consumo de pesos en el rango de 3-4 GB para el modelo principal, con margen adicional para activaciones y lotes. Cifras exactas: no disponibles.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU con al menos 8 GB de VRAM deberia poder cargar los pesos en memoria; se recomienda validar con la configuracion oficial del repositorio.
- GPU de consumo: con alta probabilidad si, dado que el checkpoint mas grande es de 3,1 GB, aunque no hay validacion publicada.
- Opciones de despliegue: el unico camino documentado es el codigo PyTorch de github.com/mohkoh/x-jepa. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, y estos runners no estan disenados para encoders JEPA de este tipo.
- Latencia y throughput: no disponibles. El repositorio publica ejecuciones de Weights & Biases, pero la model card no incluye medidas de velocidad.

## Comparativa con modelos similares

Los comparables directos son los baselines incluidos en el propio estudio, con resultados publicados en la misma tabla:

| Modelo | Tamano de checkpoint | COCO ZS MR | Flickr ZS MR | SugarCrepe++ | NLVR2 Token | Licencia |
|---|---:|---:|---:|---:|---:|---|
| X-JEPA [P,A] lambda=0,1 | 3,1 GB | 69,39 | 81,53 | 73,30 | 60,11 | MIT |
| X-JEPA [TC] | 3,1 GB | 44,60 | 48,30 | 44,17 | 56,42 | MIT |
| CLIP (baseline del estudio) | 2,2 GB | 67,89 | 79,87 | 71,68 | 54,93 | no disponible en la informacion |
| SigLIP (baseline del estudio) | 2,2 GB | 67,67 | 80,32 | 69,79 | 55,00 | no disponible en la informacion |

Otros modelos de la familia JEPA (por ejemplo I-JEPA o V-JEPA) serian comparables conceptualmente, pero no se incluyen datos de parametros, contexto ni rendimiento en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- El modelo es un encoder de embeddings, no un generador de texto: no soporta chat, instrucciones, tool calling ni razonamiento multi-paso en el sentido de un LLM.
- Idioma unico declarado: ingles. El rendimiento fuera de ese idioma no esta evaluado.
- La variante [P] sin alineamiento sufre colapso de representacion (COCO ZS MR 0,10), lo que la inutiliza para produccion; es un control experimental del estudio, no un checkpoint utilizable.
- Riesgo de sesgo: no se documenta analisis de sesgos en la informacion disponible. Al ser un encoder entrenado sobre datos no especificados, puede heredar sesgos de ese corpus.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en tareas de recuperacion y clasificacion cuando las similitudes latentes estan poco separadas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, aunque el autor no ofrece garantias ni soporte.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en HuggingFace, lo que implica un ecosistema de integracion inexistente.
- Formato `.ckpt` de PyTorch sin safetensors ni cuantizaciones: no se puede cargar directamente con runners estandar de LLM y requiere el codigo del repositorio.
- El articulo esta marcado como "to appear" en AACL-IJCNLP 2026; los resultados deben considerarse previos a la revision final de camara.
- Ausencia de datos de parametros, contexto, dataset de entrenamiento y coste computacional: la reproducibilidad completa depende del repositorio de codigo, no de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/mohkoh/x-jepa
- Repositorio de codigo: https://github.com/mohkoh/x-jepa
- Ejecuciones de Weights & Biases: https://wandb.ai/inda/x-jepa-public
- Articulo: "Latent Prediction Needs Alignment: A Controlled Study of Joint-Embedding Predictive Vision-Language Learning", Kohankhaki, Kusuma, Salehi, Kamp, Brell-Cokcan y Schmeink, AACL-IJCNLP 2026 (sin enlace directo en la informacion disponible).
- Descarga directa del modelo principal: https://huggingface.co/mohkoh/x-jepa/resolve/main/xjepa_pa_lam01.ckpt
