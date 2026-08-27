# sorryhyun/anima-tagger

## Resumen

Anima Tagger es un modelo de clasificación multi-etiqueta para imágenes anime que genera captions en formato booru (separadas por comas) exactamente en la estructura que el modelo de difusión Anima utilizó durante su entrenamiento: `rating, count, characters, copyrights, @artists, general tags`. Desarrollado por sorryhyun, este tagger actúa como proveedor de captions y source-prompts para el pipeline de entrenamiento e inferencia `anima_lora` (incluyendo DirectEdit ψ_src, auto-tagging de datasets y scaffolding de prompts), aunque también funciona de forma independiente.

La arquitectura combina dos codificadores de visión congelados —PE-Core-L14-336 (semántico, d=1024) y PE-Spatial-B16-512 (espacial/composicional, d=768)— con un pooling de atención y un tronco compartido que alimenta cabezas de etiqueta, rating y conteo de personas. Solo se entrenan el pooling y las cabezas, lo que resulta en un modelo ligero de 26,6 millones de parámetros (0,4 GB en safetensors). La versión actual (v5) soporta 2.532 etiquetas y 4 clases de rating (safe, sensitive, nsfw, explicit), con umbrales de inferencia calibrados por F1 y reglas de normalización.

Su relevancia radica en que está específicamente ajustado para la distribución de captions de Anima, lo que lo hace más adecuado que un tagger genérico para el ecosistema de ese modelo de difusión. Además, su integración nativa con ComfyUI y con el repositorio `anima_lora` lo convierte en una herramienta práctica para flujos de trabajo de generación y edición de imágenes anime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos codificadores de visión congelados (PE-Core-L14-336 y PE-Spatial-B16-512) + pooling de atención + tronco compartido con cabezas de etiqueta, rating y conteo de personas |
| Parametros totales | 26.640.047 (solo pesos de cabezas; los codificadores se descargan por separado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (las captions se generan en inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, thresholds.safetensors) |

## Arquitectura y entrenamiento

El modelo emplea dos codificadores de visión congelados que se obtienen automáticamente en el primer uso: PE-Core-L14-336 para características semánticas (d=1024) y PE-Spatial-B16-512 para características espaciales y composicionales (d=768). Cada codificador alimenta una capa de pooling basada en atención (attention-probe pooling) y un tronco compartido con tres cabezas: una para etiquetas, otra para rating y otra para conteo de personas. Cada etiqueta del vocabulario se enruta de forma fija al codificador que mejor la predice; solo se entrenan el pooling y las cabezas, mientras que los codificadores permanecen congelados.

Durante la inferencia se aplican varias técnicas de refinamiento: argmax dentro de grupos mutuamente excluyentes (definidos en `groups.yaml`, como color de ojos o de pelo), un límite en el conteo de personas para las predicciones de personajes, un umbral mínimo de confianza para personajes con fallback a `original`, y colapso top-1 para artista y copyright antes de componer la caption final. Los umbrales de inferencia se calibran por F1 por etiqueta y se almacenan en `thresholds.safetensors`. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de captions estilo booru multi-etiqueta en el formato exacto de Anima: `rating, count, characters, copyrights, @artists, general tags`.
- Clasificación multi-etiqueta con 2.532 etiquetas en la versión v5 (2.528 en v3, 1.362 en la raíz legacy).
- Clasificación de rating en 4 clases (safe, sensitive, nsfw, explicit) en v5; 3 clases en versiones anteriores.
- Conteo de personas en la imagen (head dedicada).
- Refinamiento por grupos mutuamente excluyentes (p. ej., color de ojos, color de pelo) mediante argmax.
- Normalización de etiquetas mediante reglas definidas en `rules.yaml`.
- Integración nativa con el pipeline `anima_lora` (auto-tagging, DirectEdit ψ_src, scaffolding de prompts).
- Nodos para ComfyUI (`AnimaTaggerLoader` → `AnimaTaggerCaption`) que emiten una salida STRING compatible con cualquier campo de texto.
- Funcionamiento standalone: dado una imagen, devuelve la caption completa.

## Casos de uso

- Auto-tagging de datasets para entrenamiento de LoRA: el modelo etiqueta automáticamente miles de imágenes en el formato que Anima espera, generando archivos `.txt` sidecar listos para el pipeline `anima_lora`. Es adecuado porque sus captions coinciden exactamente con la distribución de entrenamiento de Anima, evitando desajustes de embedding.
- Generación de source-prompts para DirectEdit: en el flujo `comfyui-anima-directedit`, el tagger proporciona el `ψ_src` estructuralmente alineado con el manifold de entrenamiento de Anima, lo que mejora la eficacia de la edición frente a un tagger genérico como WD-tagger.
- Etiquetado interactivo en ComfyUI: los nodos `AnimaTaggerLoader` y `AnimaTaggerCaption` permiten a artistas y desarrolladores obtener captions al vuelo dentro de un grafo de ComfyUI, sin salir de la herramienta.
- Organización y búsqueda de bibliotecas de imágenes anime: al generar etiquetas de personajes, artistas, copyrights y atributos generales, se puede indexar una colección local y filtrar por cualquier combinación de etiquetas.
- Filtrado de contenido por rating: la cabeza de rating clasifica cada imagen en safe, sensitive, nsfw o explicit, lo que permite separar automáticamente contenido sensible en repositorios o datasets.
- Asistencia en la creación de prompts para generación de imágenes: el tagger puede usarse para extraer la caption de una imagen de referencia y usarla como prompt base o para scaffolding en el entrenamiento de LoRAs, garantizando consistencia con el vocabulario de Anima.

## Benchmarks y rendimiento

La model card reporta para la versión v5 (2026-08) los siguientes valores de validación:

| Metrica | Valor |
|---|---|
| Val macro-F1 | 0,236 |
| Spatial AP (average precision) | 0,275 |

No se han publicado resultados comparativos con otros taggers de anime (p. ej., WD Tagger) ni benchmarks adicionales en la información disponible.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. No obstante, el tamaño del repositorio es de 0,4 GB y los parámetros entrenables son solo 26,6 millones, mientras que los codificadores de visión congelados se descargan automáticamente por separado. Esto sugiere que el modelo es ligero y probablemente ejecutable en GPUs de consumo con al menos 4-8 GB de VRAM, pero no hay datos confirmados. Las opciones de despliegue incluyen el uso directo desde el repositorio `anima_lora` (Python) o mediante nodos de ComfyUI. No se menciona soporte para vLLM, llama.cpp u otros servidores de inferencia.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros taggers de anime como WD Tagger, DeepDanbooru o CLIP-based taggers. La model card indica que Anima Tagger está específicamente ajustado para la distribución de captions de Anima, por lo que su rendimiento en ese contexto debería superar al de un tagger genérico, pero no hay datos cuantitativos que lo respalden en la información disponible.

## Limitaciones y advertencias

- La clase de rating `safe` es la más débil, ya que el corpus de entrenamiento está fuertemente sesgado hacia `sensitive` y `explicit`.
- Las etiquetas de cola larga (pocos ejemplos positivos) tienen umbrales calibrados ruidosos; se aplica un umbral mínimo post-hoc para personajes para evitar conjeturas erróneas.
- El vocabulario y el orden de emisión están optimizados para la distribución de captions de Anima; no es un tagger booru de propósito general, aunque se comporta razonablemente en ilustraciones anime típicas.
- La licencia MIT permite uso comercial, pero los codificadores base (PE-Core-L14-336 y PE-Spatial-B16-512) pueden tener licencias propias que deben verificarse antes de un despliegue comercial.
- No se especifican sesgos adicionales más allá de los mencionados; se recomienda auditar el modelo en el dominio de aplicación concreto.

## Enlaces

- HuggingFace: https://huggingface.co/sorryhyun/anima-tagger
- Repositorio GitHub anima_lora: https://github.com/sorryhyun/anima_lora
- README de comfyui-anima-tagger: https://github.com/sorryhyun/anima_lora/blob/main/custom_nodes/comfyui-anima-tagger/README.md
- Página en AI Market Cap: https://aimarketcap.tech/models/sorryhyun-anima-tagger
