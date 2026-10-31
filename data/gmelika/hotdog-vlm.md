# gmelika/hotdog-vlm

## Resumen

hotdog-vlm es un modelo experimental de visión-lenguaje creado por el usuario gmelika, cuya única finalidad es responder a una pregunta: ¿la imagen contiene un perrito caliente (hot dog) o no? El proyecto es notable porque parte de Qwen3-0.6B, un modelo puramente textual que nunca ha visto una imagen, y le dota de capacidad visual siguiendo la arquitectura LLaVA: un codificador SigLIP congelado convierte la foto en vectores de parches, un pequeño proyector los pliega en "tokens de imagen" dentro del espacio de embeddings del LLM, y un LoRA entrenado sobre el LLM aprende a interpretarlos.

El modelo aplica reglas estrictas: solo cuenta como hot dog un frankfurt o vienesa en pan, con cualquier condimento. Bratwursts, otras salchichas, corn dogs y bocadillos o sándwiches tipo sub se clasifican explícitamente como "not hot dog". Alcanza un 98,7 % en un conjunto de validación de Food-101/Flickr30k y un 85,5 % (90,3 % con etiquetas corregidas) en un conjunto difícil de 179 fotos de Wikimedia Commons.

Más allá de su tono lúdico, es un ejemplo didáctico y completo de cómo construir un VLM ligero con PEFT: todo el entrenamiento se hizo en una sola GeForce RTX 2080 Ti y el adaptador completo pesa solo 14,3 millones de parámetros (unos 0,1 GB en el repositorio). Además de la clasificación binaria, puede describir imágenes en una frase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-style: SigLIP (vision encoder congelado) + proyector MLP + Qwen3-0.6B con LoRA |
| Parametros totales | Aprox. 620M (Qwen3-0.6B + SigLIP base + proyector) |
| Parametros activos | 14,3M entrenables (proyector 3072→1024→1024 + LoRA r=16); no es MoE |
| Longitud de contexto | no disponible (49 tokens de imagen + prompt textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda de Qwen3-0.6B; salida en inglés) |
| Licencia | Apache 2.0 (código y pesos) |
| Formato de pesos | adapter.safetensors (adaptador PEFT, requiere los modelos base) |

## Arquitectura y entrenamiento

El modelo combina tres componentes. Primero, SigLIP base-patch16-224 (congelado) procesa la imagen a 224 px y produce 196 vectores de parche. Segundo, un proyector MLP (3072 → 1024 → 1024) los comprime en 49 "image tokens" que se inyectan en el espacio de embeddings de Qwen3-0.6B. Tercero, un LoRA con r=16 aplicado a todas las proyecciones de atención y MLP del LLM permite que el modelo de texto lea esos tokens. La decisión final se obtiene comparando los logaritmos de probabilidad del primer token de respuesta: log P("Hot") − log P("Not"), con umbral en 0.

El entrenamiento fue en dos etapas. En la etapa 1 (2.000 pasos, LLM congelado) se entrenó solo el proyector con leyendas de Flickr30k (31.000 fotos) y las fotos de comida de COCO (16.000 fotos). En la etapa 2 (800 pasos) se entrenaron proyector y LoRA juntos, con tres de cada cuatro lotes dedicados a la pregunta del hot dog y el resto a leyendas para conservar la capacidad descriptiva. Los positivos proceden de Food-101 (clase hot_dog, con revisión humana de 300 ejemplos marcados por SigLIP: 72 se reetiquetaron como negativos), Flickr30k, y 389 fotos adicionales de Wikimedia Commons y COCO. Los negativos incluyen otras clases de Food-101 (hamburguesas, lobster rolls, burritos), fotos no gastronómicas de Flickr30k y 559 hard negatives (bratwursts y subs de Commons y COCO). Las características de imagen se cachean una vez, por lo que el encoder visual nunca se ejecuta durante el entrenamiento.

## Capacidades

- Clasificación binaria de imágenes: hot dog frente a no hot dog, con reglas estrictas (excluye bratwursts, otras salchichas, corn dogs y subs).
- Puntuación continua (`hotdog_score`): log P("Hot") − log P("Not"), superior a 0 significa hot dog.
- Descripción de imágenes en una frase mediante el prompt "Describe this image in one sentence.".
- Pipeline image-text-to-text: acepta imagen más texto y genera texto.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo de juguete de dominio muy estrecho.
- Inferencia ligera: unos 45 ms por veredicto y 100 ms por descripción en una RTX 2080 Ti con CUDA graphs; también funciona en CPU.

## Casos de uso

- Clasificador de comida en apps de restauración: puede filtrar automáticamente fotos de menús o catálogos para detectar perritos calientes con reglas precisas, descartando salchichas o bocadillos que otros clasificadores confundirían.
- Demo educativa de VLM desde cero: el repositorio incluye `vlm.py` y `load.py`, ideales para aprender cómo se monta un LLaVA (SigLIP + proyector + LoRA) y reproducirlo en una GPU doméstica.
- Ejemplo de fine-tuning con PEFT y datos curados: ilustra el valor de los hard negatives (559 ejemplos) y la revisión humana de etiquetas ruidosas, útil como referencia metodológica para proyectos de clasificación con modelos base textuales.
- Moderación o etiquetado de contenido gastronómico en redes: puede etiquetar automáticamente imágenes de hot dogs en flujos de fotos etiquetadas por usuarios, aunque con supervisión dada su tasa de error.
- Prototipado de clasificadores visuales baratos: con 14,3M de parámetros entrenables y ejecución en CPU, sirve de plantilla para clasificadores binarios de bajo coste sobre LLMs pequeños.
- Script de línea de comandos: mediante `uv run ... python load.py photo.jpg` se puede clasificar fotos locales sin desplegar infraestructura.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Conjunto | Resultado |
|---|---|
| Held-out Food-101 / Flickr30k (1.005 fotos) | 98,7 % |
| Hard test set (179 fotos de Commons, etiquetado estricto) | 85,5 % |
| Hard test set con etiquetas corregidas | 90,3 % (hot dogs reales: 33/39) |

Comparativa interna durante el desarrollo (hard test set):

| Version | Global | Bratwursts→"not" | Subs→"not" | Hot dogs reales→"hot" |
|---|---|---|---|---|
| Antes de hard negatives | 60,3 % | 13/60 | 46/60 | 44/48 |
| Primer reentrenamiento | 80,4 % | 58/60 | 60/60 | 17/48 |
| Modelo actual | 85,5 % | 54/60 | 59/60 | 33/48 |

No se han publicado comparaciones con otros modelos (MMLU, HumanEval, etc.), lo cual es coherente con la naturaleza especializada del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: baja; el modelo completo (Qwen3-0.6B + SigLIP base + proyector) ronda el 1-2 GB en fp16/bf16, ejecutable en GPUs de consumo modestas.
- GPU de referencia del autor: una GeForce RTX 2080 Ti (11 GB), con holgura sobrada.
- Consumer GPUs: cabe cómodamente en prácticamente cualquier GPU moderna (RTX 3060 o superior); también funciona en CPU, solo más lento.
- Despliegue: el repositorio no usa librerías de inferencia estándar; requiere PyTorch, transformers, peft y huggingface_hub, ejecutando el script `load.py` incluido. No hay soporte documentado de vLLM, llama.cpp, Ollama o TGI.
- Latencia medida: unos 45 ms por veredicto y unos 100 ms por descripción en la 2080 Ti con CUDA graphs (el autor señala que su CPU antigua hacía dominar los lanzamientos de kernels).

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros entrenables | Base | Licencia |
|---|---|---|---|---|
| gmelika/hotdog-vlm | Clasificador binario hot dog / no hot dog + descripcion | 14,3M (LoRA + proyector) | Qwen3-0.6B + SigLIP base | Apache 2.0 |
| Qwen/Qwen3-0.6B | LLM textual generalista (sin vision nativa) | modelo completo | — | Apache 2.0 |
| google/siglip-base-patch16-224 | Encoder visual con zero-shot classification | modelo completo | — | Apache 2.0 |
| LLaVA-class (variantes generales) | VLM generalista de descripcion y dialogo visual | modelo completo (7B tipico) | Vicuna/LLaMA + CLIP | varia segun variante |

No existen alternativas comerciales directas especializadas en esta tarea tan específica; la comparación relevante es con SigLIP zero-shot (que el propio autor usó para curar datos) y con VLMs generalistas como LLaVA, mucho más capaces pero decenas de veces más grandes.

## Limitaciones y advertencias

- Modelo entrenado "por diversión" con unos 1.100 positivos: cometerá errores, algunos graciosos y otros no.
- Entrada de 224 px: los frankfurters pequeños, ocultos (envueltos en papel de aluminio, enterrados en chucrut, medio fuera de encuadre) o apenas visibles son difíciles de detectar.
- Distinguir un frankfurt de un bratwurst solo por textura es problemático.
- El hard test set es pequeño (179 fotos) y sus etiquetas aún se están depurando; las métricas tienen incertidumbre considerable.
- Los datos de entrenamiento tienen restricciones propias: Food-101 y Flickr30k son solo para investigación y uso no comercial, y COCO/Commons tienen licencias individuales por imagen. Aunque el código y los pesos son Apache 2.0, entrenar productos comerciales con recetas basadas en estos datasets requiere revisar esos términos.
- No hay soporte multilingüe documentado, ni tool calling, ni capacidades de agente.
- No es apto para producción sin reentrenamiento y validación adicionales; su valor principal es didáctico y experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gmelika/hotdog-vlm
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base SigLIP: https://huggingface.co/google/siglip-base-patch16-224
