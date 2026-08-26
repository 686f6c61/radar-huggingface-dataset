# agentlans/GIST-small-finefineweb

## Resumen

GIST-small-finefineweb es un modelo de clasificación de texto basado en BERT, desarrollado por agentlans (Alan Tseng) mediante fine-tuning del modelo de embeddings avsolatorio/GIST-small-Embedding-v0. El clasificador asigna a cada texto una de 67 categorías temáticas que cubren disciplinas científicas, medicina, política, deportes, entretenimiento, tecnología y otros ámbitos. Con 33,4 millones de parámetros, es un modelo ligero que opera exclusivamente en inglés y se distribuye bajo licencia MIT.

La relevancia del modelo reside en su taxonomía granular de 67 categorías y su bajo coste computacional, lo que permite categorizar texto a gran escala con infraestructura mínima. El fine-tuning se ejecutó sobre el dataset propio finefineweb-equal-weighted, con 3 épocas y optimización AdamW en precisión mixta BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForSequenceClassification) |
| Parametros totales | 33.385.795 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantización publicada) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT de tamaño pequeño (33,4 M de parámetros) con cabecera de clasificación de secuencias configurada para 67 etiquetas y un vocabulario de 30.522 tokens. El fine-tuning se realizó sobre el modelo de embeddings avsolatorio/GIST-small-Embedding-v0, utilizando el dataset `agentlans/finefineweb-equal-weighted`. Los hiperparámetros principales fueron: learning rate de 5e-05, batch size de 8, optimizador AdamW (versión fusionada), scheduler lineal sin warmup, weight decay de 0.0 y precisión mixta BF16. El entrenamiento se completó en 3 épocas sobre una única GPU con semilla 42.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un entrenamiento supervisado estándar de clasificación de una sola etiqueta. El resultado final fue una pérdida de entrenamiento de 1,3238 y una pérdida de validación de 1,4201.

## Capacidades

- Clasificación de texto en 67 categorías temáticas (clasificación de una sola etiqueta), incluyendo dominios como biología, física, química, medicina, derecho, economía, tecnología, deportes, política, entretenimiento, etc.
- Soporte de tool calling / function calling: no.
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (visión, audio, thinking mode): no.

## Casos de uso

1. Categorización de noticias: plataformas de contenido pueden clasificar artículos en categorías como política, deportes, economía o entretenimiento para alimentar recomendaciones y organización editorial.
2. Indexación de documentos académicos: asignar papers y artículos a disciplinas concretas (biología, física, química, matemáticas, etc.) para su integración en repositorios de investigación.
3. Moderación de contenido en redes sociales: etiquetar publicaciones de usuarios para detectar temas sensibles como juego, salud o armamento,
