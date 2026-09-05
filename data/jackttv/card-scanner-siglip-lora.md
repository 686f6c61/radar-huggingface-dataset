# jackttv/card-scanner-siglip-lora

## Resumen

El modelo `jackttv/card-scanner-siglip-lora` es un adaptador LoRA (Low-Rank Adaptation) aplicado a la torre de visión del modelo `google/siglip2-so400m-patch14-384`, desarrollado por el usuario jackttv. Su propósito es resolver un problema muy específico: la discriminación fina de variantes de cartas coleccionables (trading cards), como reimpresiones casi idénticas, acabados holo/reverse-holo y patrones promocionales, tareas en las que un modelo de embeddings zero-shot tiende a confundir variantes del mismo personaje.

El adaptador se entrenó de forma auto-supervisada simulando el pipeline real de escaneo: cada foto de catálogo se somete a aumentaciones (warp de perspectiva, desenfoque, variación de color, recompresión JPEG y volteos ocasionales), y el modelo aprende a proyectar la vista aumentada cerca de su propia imagen limpia y lejos del resto de productos del lote mediante una pérdida InfoNCE. En un benchmark con 514 escaneos reales de cartas Pokémon TCG, alcanza un top-1 del 98,8% y un top-3 del 100%, con una latencia media de ~17 ms por escaneo, frente al 94,2% y ~224 ms del sistema VLAD en producción. El modelo no es generativo: produce embeddings de imagen L2-normalizados para recuperación de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre la torre de visión de SigLIP2-so400m-patch14-384 |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no procesa texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de visión, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); embeddings.pt (índice de galería en formato PyTorch) |

## Arquitectura y entrenamiento

El adaptador utiliza PEFT LoRA con rank 16 y modifica las capas `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2` de la torre de visión del modelo base SigLIP2-so400m-patch14-384. El README no especifica el número total de parámetros del adaptador, pero al ser un LoRA de rank 16 sobre un modelo de visión de 400M, la adición de parámetros entrenables es reducida. El modelo base se carga en bfloat16, como muestra el ejemplo de uso.

El entrenamiento es auto-supervisado, sin gradientes provenientes de etiquetas manuales. Para cada imagen del catálogo (con aproximadamente 25.000 productos de tcgcsv.com), se genera una vista aumentada que simula la salida del pipeline de recorte YOLO en producción. La función de pérdida es InfoNCE, con lotes que incluyen deliberadamente múltiples impresiones de la misma carta con nombre, que actúan como negativos duros. Este diseño ataca directamente el fallo de los embeddings zero-shot: identificar al personaje correcto pero no la variante específica.

## Capacidades

- Recuperación de imágenes: genera embeddings L2-normalizados de 1152 dimensiones por imagen, adecuados para búsqueda por similitud en una galería precomputada.
- Discriminación fina de variantes: distingue reimpresiones, acabados holo/reverse-holo y patrones promocionales que un modelo zero-shot confunde.
- Robustez ante condiciones de escaneo real: el entrenamiento con aumentaciones simula el pipeline de producción (warp de perspectiva, desenfoque, jitter de color, recompresión JPEG y flip a 180°).
- Búsqueda eficiente: reduce la latencia de ~224 ms a ~17 ms por escaneo en el benchmark del autor, en comparación con el matcher VLAD.
- Integración con índices precomputados: el repositorio incluye `embeddings.pt`, un índice de galería con embeddings para el catálogo de Pokémon TCG, lo que evita re-codificar las imágenes del catálogo.
- No genera texto ni imágenes: el modelo se limita a producir representaciones vectoriales para tareas de retrieval.

## Casos de uso

- Escaneo de cartas en tiempo real para aplicaciones de coleccionismo: el adaptador puede sustituir al matcher VLAD en un sistema de escaneo con recorte YOLO. Al recibir una imagen recortada, genera su embedding y lo compara con el índice precomputado, clasificando la carta en milisegundos.
- Detección de variantes de impresión en mercados de segunda mano: permite distinguir entre una carta original, su reimpresión o un acabado holo específico, evitando errores en anuncios de venta de cartas casi idénticas.
- Indexación de inventario para tiendas de cartas: se pueden precomputar los embeddings de todo el catálogo de productos de tcgcsv.com y actualizarlos automáticamente cuando se añaden nuevas cartas, gracias al índice incluido.
- Automatización de colecciones personales: a partir de fotos de una colección, el modelo asigna a cada carta su identificador exacto dentro del catálogo, lo que facilita inventariar cientos o miles de cartas sin intervención manual.
- Filtrado y clasificación en marketplaces de TCG: un pipeline puede clasificar automáticamente las imágenes de los anuncios en variantes como común, holo o reverse-holo, agilizando la categorización en portales de compraventa.
- Verificación de cartas en procesos de compraventa o subastas: al comparar un escaneo del vendedor con las imágenes de catálogo, se confirma que la variante anunciada coincide con la carta física, reduciendo disputas entre comprador y vendedor.

## Benchmarks y rendimiento

El autor presenta resultados sobre un benchmark de 514 escaneos reales de cartas Pokémon TCG, que nunca fue utilizado en el entrenamiento. La tabla compara el adaptador con el baseline VLAD en producción:

| Método | Top-1 | Top-3 | Latencia por escaneo |
|---|---|---|---|
| VLAD baseline (producción) | 94,2% | 97,7% | ~224 ms |
| Adaptador card-scanner-siglip-lora | 98,8% | 100,0% | ~17 ms |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) porque el modelo no es una arquitectura de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible en la información del repositorio. El adaptador LoRA añade pocos parámetros, pero la VRAM necesaria depende principalmente del modelo base `google/siglip2-so400m-patch14-384`.
- GPU recomendada: no disponible. No se especifica el hardware utilizado en el benchmark.
- Compatibilidad con GPU de consumo: no disponible. El README no indica si cabe en una tarjeta gráfica de gama de consumo.
- Opciones de despliegue: se puede cargar con Hugging Face Transformers y PEFT en Python, tal como muestra el ejemplo de uso. El proyecto `Tabletop-Village/card-scanner-siglip` lo utiliza como reemplazo directo del matcher original. No se mencionan opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: la latencia media reportada es de ~17 ms por escaneo en el benchmark del autor. No se proporciona el throughput en imágenes por segundo.

## Comparativa con modelos similares

La comparación disponible se limita al baseline VLAD y al propio modelo base SigLIP2. No se dispone de datos de otros modelos de recuperación de imágenes comparables.

| Modelo | Parámetros | Contexto | Rendimiento top-1 | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VLAD baseline (producción) | No disponible | No aplica | 94,2% | ~224 ms | No especificada | Proyecto Tabletop-Village |
| SigLIP2 base (zero-shot) | No disponible | No aplica | Confunde variantes (sin métrica reportada) | No disponible | No especificada | Hugging Face |
| Adaptador card-scanner-siglip-lora | No disponible (rank 16) | No aplica | 98,8% | ~17 ms | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Entrenado exclusivamente con cartas Pokémon TCG procedentes de tcgcsv.com y aumentaciones sintéticas. El rendimiento con otros juegos de cartas o con imágenes no relacionadas no está verificado.
- El adaptador no es un modelo independiente: depende del modelo base `google/siglip2-so400m-patch14-384`. Cualquier despliegue debe incluir ambos componentes y respetar las licencias de cada uno.
- El benchmark de 514 escaneos es un estudio interno del autor, no replicado por terceros. Los resultados pueden no generalizar a otras condiciones de cámara, iluminación o recortes.
- La latencia de ~17 ms se midió en el entorno del autor; la latencia real varía según hardware, procesamiento previo y tamaño de la galería.
- No se han reportado evaluaciones de sesgos. El modelo podría presentar un sesgo hacia las variantes más frecuentes del catálogo de Pokémon TCG o confundir cartas de sets distintos con patrones visuales similares.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación muy reciente con nula adopción inicial; no hay garantía de mantenimiento futuro.
- Para uso comercial, la licencia Apache-2.0 se aplica al adaptador, pero debe revisarse la licencia del modelo base SigLIP2 antes de distribuir una aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackttv/card-scanner-siglip-lora
- Repositorio del proyecto que lo integra: https://github.com/Tabletop-Village/card-scanner-siglip
- Fuente del catálogo de cartas: https://tcgcsv.com
- No se han encontrado otros enlaces relevantes en la búsqueda web.
