# poolday/pool-photo-categories

## Resumen
Pool photo categories es un clasificador lineal muy ligero publicado por el usuario poolday bajo el identificador `poolday/pool-photo-categories`. No es un modelo de lenguaje ni una red neuronal completa: se trata de una única capa lineal (una matriz de pesos de 768 dimensiones por etiqueta más un sesgo) que opera sobre los vectores de imagen ya extraídos por SigLIP 2 B/16. El modelo no procesa píxeles directamente; consume embeddings L2-normalizados de 768 números producidos por el codificador visual SigLIP 2 B/16 y devuelve una distribución de probabilidad sobre 18 categorías de álbum fotográfico (People, Selfie, Food, Nature, City, Document, Sport, entre otras).

El objetivo es la organización automática de bibliotecas fotográficas en dispositivo (on-device). Según la model card, etiquetar 49.000 fotos tarda aproximadamente 2,5 segundos en un Mac, lo que lo hace adecuado para herramientas de escritorio como el CLI `pool` y la librería PoolKit, que lo descargan y lo aplican a fotos que no son capturas de pantalla. Es relevante por su extrema eficiencia: al reutilizar los embeddings de SigLIP 2, el coste computacional de la clasificación es despreciable frente al de la extracción de características.

La información pública es muy limitada: no se declara licencia, idiomas ni resultados de benchmarks frente a otros modelos. La model card solo reporta acuerdo con el modelo de decisión que generó las etiquetas de entrenamiento (92,9% global, 95,2% en fotos que superan la regla de asignación a álbum), no precisión frente a anotación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa lineal (dot product + bias + softmax) sobre embeddings de imagen SigLIP 2 B/16 |
| Parametros totales | 18 etiquetas × 768 pesos + 18 sesgos = 13.842 valores en float16 (fichero de 37.242 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen, no modelo de secuencia) |
| Tipos de cuantizacion | float16 (pesos almacenados en base64 de valores float16 en JSON) |
| Idiomas soportados | no disponible (la salida son etiquetas de categoría en inglés) |
| Licencia | no disponible |
| Formato de pesos | JSON (`photo-categories.json`) con pesos en base64 de float16; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento
La arquitectura es un clasificador lineal de una sola capa sobre el espacio de embeddings de SigLIP 2 B/16 (768 dimensiones). Para inferir, se toma el vector de imagen L2-normalizado de SigLIP 2 B/16, se calcula el producto escalar con cada fila de pesos más el sesgo correspondiente y se aplica softmax. El fichero `photo-categories.json` contiene la clave `revision` (valor 1), `dimension` (768), una lista de 18 nombres de etiqueta y los pesos en base64. Las etiquetas "Screenshot" y "Other" existen en el modelo pero nunca se muestran como álbumes.

El entrenamiento se realizó sobre 9.384 fotos y pósteres de vídeo etiquetados por un modelo de decisión (no por anotadores humanos). No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo ajuste fino adicional, RLHF o DPO. La innovación técnica principal es el enfoque de "clasificador sobre embeddings precalculados": al no leer píxeles, el coste de clasificación es mínimo y permite procesar bibliotecas enteras en segundos reutilizando los vectores de SigLIP 2.

## Capacidades
- Clasificación de imágenes en 18 categorías de álbum fotográfico, incluyendo People, Selfie, Food, Nature, City, Document y Sport.
- Asignación a álbum solo cuando la probabilidad top es al menos 0,5 y supera a la segunda por al menos 0,15 (regla documentada en la model card).
- Descarte explícito de capturas de pantalla y categoría "Other" para que no aparezcan como álbumes.
- Operación on-device sobre embeddings de SigLIP 2 B/16, sin necesidad de GPU dedicada.
- Integración con el CLI `pool` y PoolKit para etiquetado masivo de bibliotecas (49.000 fotos en ~2,5 s en un Mac).
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general ni audio; es un clasificador cerrado de categorías.

## Casos de uso
- Organización automática de bibliotecas fotográficas personales: el CLI `pool` o PoolKit extraen embeddings SigLIP 2 B/16 y aplican esta capa lineal para agrupar decenas de miles de fotos en álbumes en segundos, con un coste de clasificación despreciable.
- Filtrado previo en aplicaciones de gestión de fotos: descartar capturas de pantalla y clasificar el resto antes de mostrar la galería, usando la regla de umbral 0,5 / margen 0,15 para evitar asignaciones dudosas.
- Etiquetado de pósteres de vídeo en bibliotecas multimedia: la model card indica que el entrenamiento incluyó pósteres de vídeo, por lo que puede usarse para clasificar miniaturas de vídeo junto a fotos.
- Clasificación en dispositivos con recursos limitados: al ser una capa lineal de 13.842 parámetros, puede ejecutarse en CPU o en un Mac sin GPU, integrándose en apps de escritorio.
- Preetiquetado para revisión humana: usar las categorías con alta confianza como sugerencia inicial en un flujo de curaduría, reservando la revisión manual para los casos que no superan la regla de álbum.
- Segmentación de datasets de imágenes para entrenamiento: agrupar corpus de fotos por categoría (Food, Nature, City, Document) antes de un pipeline de anotación o aumento de datos, reutilizando los embeddings ya calculados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de acuerdo con el modelo de decisión usado para etiquetar el entrenamiento:

| Metrica | Valor | Nota |
|---|---|---|
| Acuerdo global en fotos held-out | 92,9% | Frente al modelo de decisión, no frente a humanos |
| Acuerdo en fotos que pasan la regla de álbum | 95,2% | Subconjunto con top ≥ 0,5 y margen ≥ 0,15 |
| Tiempo de etiquetado | ~2,5 s para 49.000 fotos | En un Mac, según la model card |

## Requisitos de hardware
- VRAM para inferencia del clasificador: prácticamente nula; la capa lineal ocupa 37.242 bytes en disco y se ejecuta en CPU.
- El coste real está en la extracción de embeddings con SigLIP 2 B/16, que requiere cargar el codificador visual (no incluido en este repositorio).
- GPU recomendadas: no aplica para el clasificador; para SigLIP 2 B/16 se puede usar CPU, Apple Silicon o cualquier GPU consumer con memoria suficiente para el codificador.
- Cabe en cualquier GPU consumer e incluso en CPU; la model card cita un Mac como plataforma de referencia.
- Opciones de despliegue: CLI `pool`, PoolKit y cualquier runtime que permita leer JSON y hacer un producto escalar; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este formato).
- Latencia y throughput: ~2,5 s para 49.000 fotos en un Mac según la model card; no se detalla el coste de extracción de embeddings por separado.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores lineales sobre embeddings de SigLIP 2) ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias
- Las métricas reportadas miden acuerdo con un modelo de decisión, no con anotación humana; la precisión real frente a personas es desconocida.
- Los resultados provienen de una sola biblioteca fotográfica, por lo que la generalización a otros dominios no está validada.
- Los álbumes más pequeños (Vehicle, Concert, Plant, Receipt) tienen pocos ejemplos y sus predicciones no son fiables según la propia model card.
- Riesgo de sesgo heredado del modelo de decisión que generó las etiquetas y del dataset de 9.384 fotos, cuya composición no se detalla.
- No se declara licencia, lo que impide confirmar si el uso comercial está permitido.
- Depende obligatoriamente de SigLIP 2 B/16 para generar los embeddings; no funciona sobre píxeles ni con otros codificadores sin reentrenamiento.
- Solo produce 18 categorías cerradas en inglés; no admite consultas abiertas ni etiquetas personalizadas.
- El repositorio no contiene fotos, identificadores, nombres ni ubicaciones, pero no se documentan garantías de privacidad más allá de esa afirmación.

## Enlaces
- Hugging Face: https://huggingface.co/poolday/pool-photo-categories
- SigLIP 2 (codificador base requerido): no se proporciona enlace en la información disponible
- Repositorio del CLI `pool` o PoolKit: no se proporciona enlace en la información disponible
- Paper o blog del modelo: no disponible
