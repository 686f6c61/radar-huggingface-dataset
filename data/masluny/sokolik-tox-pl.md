# masluny/sokolik-tox-pl

## Resumen

Sokolik-tox-pl es un clasificador binario de contenido dañino para polaco, desarrollado por el usuario masluny y publicado en Hugging Face. Se obtiene mediante un ajuste fino completo (full fine-tune) del modelo base Sokolik-300M, un transformer de aproximadamente 304 millones de parámetros, sobre el conjunto de datos BAN-PL, que recoge 24.000 comentarios de la plataforma Wykop, la mitad de ellos eliminados por moderadores. El modelo resuelve la tarea de moderación automática de texto en polaco, devolviendo una probabilidad de que un texto sea dañino.

Su rasgo diferencial frente a otros clasificadores entrenados solo con BAN-PL es la incorporación de 2.000 frases sintéticas de tacos inocuos como ejemplos negativos (etiqueta 0), extraídas de los datos SFT sintéticos de Sokolik-chat. Esto reduce la tasa de falsos positivos ante blasfemias coloquiales sin intención dañina, un problema endémico en los modelos entrenados con BAN-PL, que etiqueta el propio acto de blasfemar como dañino.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y pesos bf16, con un tamaño de repositorio de 0,6 GB. Está pensado para integrarse en pipelines de moderación de contenido en polaco mediante la librería transformers y es compatible con text-embeddings-inference y endpoints. En el momento de la consulta no registra descargas ni likes, lo que indica una publicación muy reciente y sin adopción todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3, según tag `qwen3`), con cabeza lineal de clasificación sobre el token de cierre |
| Parametros totales | 304.142.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (los textos se truncan a 256 tokens) |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Sokolik-300M, un transformer de 304 millones de parámetros etiquetado como `qwen3` en Hugging Face, sobre el que se aplica un ajuste fino completo con una cabeza lineal de clasificación. La cabeza lee el token de cierre: el tokenizador envuelve cada texto con marcas `<|endoftext|>` y rellena con `<|end|>`, de modo que la clasificación se realiza sobre el marcador final. Los textos se truncan a 256 tokens.

Los datos de entrenamiento combinan BAN-PL (24.000 comentarios de Wykop, la mitad eliminados por moderadores) con 2.000 frases de tacos inocuos extraídas de los datos SFT sintéticos de Sokolik-chat como ejemplos de etiqueta 0. BAN-PL no tiene partición oficial, por lo que el autor la divide 80/10/10 mediante un hash del identificador con la sal `:tox-split-v1`. La receta emplea AdamW con tasa de aprendizaje 2e-5 para el cuerpo y 1e-3 para la cabeza, 3 épocas y tamaño de lote 32; tanto la época como el umbral se seleccionan sobre validación. La cabeza entrenada originalmente tenía sesgo, pero el formato final carece de él, por lo que el sesgo se traslada al parámetro `tox_threshold`, que preserva todas las decisiones. No se menciona uso de RLHF ni DPO.

## Capacidades

- Clasificación binaria de texto en polaco: devuelve una probabilidad de contenido dañino mediante softmax sobre los logits.
- Moderación de contenido con umbral calibrado (`tox_threshold`) en lugar del 0,5 por defecto.
- Mayor tolerancia a blasfemias inocuas que los clasificadores entrenados solo con BAN-PL.
- Robustez parcial frente a ofuscaciones de palabras vulgares (`k*rwa`, `kórwa`, `kurw4`).
- Procesamiento por lotes mediante tokenizador con padding y truncamiento.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Moderación de comentarios en foros y comunidades polacas: el modelo clasifica cada comentario con una probabilidad de daño y permite aplicar acciones automáticas según el umbral, con menor tasa de falsos positivos ante lenguaje coloquial.
- Filtrado previo de reseñas de producto: se puede ejecutar en lote sobre reseñas en polaco para separar las que requieren revisión humana de las que no, reduciendo la carga de los equipos de confianza y seguridad.
- Moderación de chats en vivo: al procesar textos de hasta 256 tokens y con 304 millones de parámetros, puede desplegarse en infraestructura modesta para clasificar mensajes en tiempo casi real.
- Detección de acoso en redes sociales: el modelo identifica insultos y amenazas, aunque conviene combinarlo con reglas explícitas para mitigar su menor recall ante palabras espaciadas.
- Señalización de contenido para revisión humana: en lugar de bloquear automáticamente, se puede usar la probabilidad como puntuación de prioridad en una cola de revisión.
- Investigación sobre sesgos y toxicidad en polaco: sirve como línea base reproducible para estudiar la definición de daño de BAN-PL y la calibración de umbrales.
- Filtrado de datos de entrenamiento: puede emplearse para excluir textos dañinos de corpus polacos antes de entrenar otros modelos, siempre que se acepte su definición de daño.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test de BAN-PL según la partición del autor (2.409 textos). Las líneas base se ajustaron con el mismo bucle de entrenamiento.

| Modelo | macro-F1 | PR-AUC |
|---|---|---|
| sokolik-tox-pl (tal como se subió) | 0,935 | 0,985 |
| Sokolik-300M solo con BAN-PL | 0,938 | 0,984 |
| HerBERT-large | 0,933 | 0,982 |
| HerBERT-base | 0,934 | 0,981 |
| XLM-R-large | 0,928 | 0,981 |
| polish-roberta-large-v2 | 0,951 | 0,990 |

Las repeticiones desplazan estas cifras hasta 0,004. Los pesos bf16 subidos deciden un texto de test de forma distinta a los pesos entrenados (0,936).

Blasfemia inocua (tweets de PolEval 2019 con palabra vulgar y etiqueta 0):

| | Blasfemia inocua (345 tweets) | Dañino con blasfemia (158 tweets) |
|---|---|---|
| Sokolik-300M solo con BAN-PL | 0,90 | 0,99 |
| sokolik-tox-pl | 0,65 | 0,87 |

Recall sobre textos dañinos de test con palabra vulgar según ofuscación:

| Tal cual | `k*rwa` | `kórwa`, `hój` | `k u r w a` | `kurw4` |
|---|---|---|---|---|
| 0,99 | 0,97 | 0,92 | 0,72 | 0,89 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 0,6 GB de pesos más overhead de activaciones; en fp32, alrededor de 1,2 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. Para lotes grandes, una A100 o H100 no aporta ventajas significativas por el tamaño del modelo.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (uso indicado en la model card), text-embeddings-inference y endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp u Ollama para este clasificador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | macro-F1 (BAN-PL test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sokolik-tox-pl | 304 M | 256 tokens | 0,935 | Apache 2.0 | Hugging Face |
| polish-roberta-large-v2 | no disponible | no disponible | 0,951 | no disponible | Hugging Face |
| HerBERT-large | no disponible | no disponible | 0,933 | no disponible | Hugging Face |
| XLM-R-large | no disponible | no disponible | 0,928 | no disponible | Hugging Face |

Sokolik-tox-pl no lidera en macro-F1 frente a polish-roberta-large-v2, pero su ventaja declarada está en la tasa de falsos positivos ante blasfemia inocua (0,65 frente a 0,90 del modelo entrenado solo con BAN-PL), un eje que la tabla de benchmarks principal no recoge.

## Limitaciones y advertencias

- La definición de daño es la de BAN-PL, derivada de la moderación de un único sitio; no es una definición general de daño.
- Sigue marcando como dañino el 65% de las blasfemias inocuas humanas, y el precio de esa mejora es una pérdida de 11 puntos de recall en blasfemia dañina.
- Las palabras espaciadas (`k u r w a`) superan el filtro en más de una cuarta parte de los casos (recall 0,72).
- El entrenamiento se realizó con una sola semilla y las frases de blasfemia inocua son sintéticas, lo que limita la generalización.
- Los términos de BAN-PL piden que sus datos no se usen para entrenar LLMs; aquí solo se emplearon para ajustar este clasificador, el propósito para el que se publicaron.
- Riesgo de alucinación no aplicable por ser un clasificador, pero sí riesgo de clasificaciones erróneas por dominio y de deriva si el lenguaje de la comunidad cambia.
- Idioma limitado al polaco; no se documenta soporte multilingüe.
- Sesgos conocidos específicos distintos de los derivados de BAN-PL: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero la restricción sobre los datos de BAN-PL debe tenerse en cuenta al redistribuir o reutilizar el modelo en contextos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masluny/sokolik-tox-pl
- Modelo base: https://huggingface.co/masluny/sokolik-300m-base
- Repositorio de BAN-PL: https://github.com/NASK-NLP/BAN-PL
- Repositorio de investigación del autor: https://github.com/masluny/factual-research/tree/main/factual_research
