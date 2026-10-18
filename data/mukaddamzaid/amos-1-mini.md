# mukaddamzaid/amos-1-mini

## Resumen

Amos 1 mini es un modelo de decisión de aproximadamente 0,5B parámetros desarrollado por mukaddamzaid dentro de la familia Amos 1. No es un modelo generativo: recibe un caso —texto, JSON o una foto— y un esquema de preguntas tipadas (sí/no, elección única, puntuación, multietiqueta, cita textual o región) y devuelve, en un solo forward pass, una probabilidad para cada respuesta permitida. Eso elimina el parseo de texto y los formatos mal formados, y lo hace adecuado para decisiones cerradas y auditables.

El modelo parte de los encoders Ettin-encoder-400m (texto) y SigLIP2-base-patch16-224 (visión), lee hasta 9.216 tokens por petición y está pensado para ejecutarse en CPU de portátil: el autor reporta unos 93 ms por petición y 27 ms de mediana en servidor para una petición de tres preguntas. Está disponible con pesos abiertos bajo licencia Apache 2.0 y como API alojada, y se posiciona como la variante mini de una familia con versiones large, medium y small.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión multimodal basado en encoders: texto Ettin-encoder-400m y visión SigLIP2-base-patch16-224; salidas probabilísticas por pregunta tipada, sin generación de texto |
| Parámetros totales | ~0,5B (aproximado; el autor no publica desglose exacto) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 9.216 tokens por petición |
| Tipos de cuantización | No disponible; no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`) y `config.json`; no se distribuyen safetensors ni GGUF |
| Pipeline de HuggingFace | No disponible |
| Entrada | Texto, JSON e imágenes |
| Salida | Probabilidad por respuesta permitida; no texto libre |

## Arquitectura y entrenamiento

La model card identifica como modelos base Ettin-encoder-400m para texto y SigLIP2-base-patch16-224 para visión. El modelo recibe un caso y un esquema de preguntas tipadas, y produce una distribución de probabilidad sobre las respuestas permitidas para cada pregunta en una sola pasada. No es un transformer decoder generativo: no hay decodificación de texto ni salida en lenguaje natural. La model card no detalla la fusión exacta entre modalidades ni la composición interna de las cabezas de decisión.

El entrenamiento no está documentado en detalle: no se indica el número de tokens, la composición del dataset ni si se aplicó RLHF/DPO. La evaluación principal usa 2.000 decisiones de cuatro flujos que el modelo no vio durante el entrenamiento, en zero-shot; además, el autor reporta un ajuste de priors por pregunta en tiempo de respuesta, sin modificar los pesos, que eleva la accuracy de 64,6% a 70,25%. La innovación principal es la combinación de preguntas tipadas, salidas probabilísticas y ejecución en CPU con latencias de milisegundos, sin necesidad de parsear texto generado.

## Capacidades

- Decisiones tipadas: sí/no (`noul`), elección única (`choice`), puntuación (`score`), multietiqueta (`multi`), cita textual (`span`) y punto sobre imagen (`region`, con foto en `images`).
- Salida probabilística por cada respuesta permitida, útil para umbrales, abstención y revisión humana.
- Procesamiento de texto, JSON e imágenes en una misma petición.
- Ventana de 9.216 tokens por petición, suficiente para casos, formularios, correos e historiales cortos.
- Clasificación de texto en dominios como noticias, emoción, intenciones bancarias y revisión documental.
- Visión para clasificación de imágenes y localización aproximada de objetos: 93,6% en razas de mascotas, 89% en COCO y 50% en RefCOCO.
- Extracción de totales de factura citados exactamente: 9/10 en la prueba del autor.
- No genera texto libre, código, resúmenes ni respuestas abiertas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Solo inglés; no hay soporte multilingüe declarado.

## Casos de uso

- **Triaje y enrutamiento de tickets de soporte:** el modelo puede recibir el texto del ticket y un esquema con preguntas como “¿pide un reembolso?” o “¿qué equipo debe gestionarlo?”, y devolver probabilidades por categoría en una sola pasada. Es adecuado para volúmenes altos porque no genera texto y corre en CPU con latencias de ~93 ms.
- **Validación de facturas y gastos:** con preguntas de tipo `span` puede citar el importe total y con preguntas `noul` detectar cargos duplicados o solicitudes de devolución. La prueba de totales exactos es 9/10, así que sirve como primera capa de revisión, no como sustituto de validación contable.
- **Moderación y clasificación de contenido:** permite aplicar etiquetas múltiples (`multi`) con probabilidades calibradas para decidir qué revisa un humano. Es útil en pipelines de contenido en inglés donde se necesita consistencia de esquema y no una explicación generada.
- **Codificación de encuestas y respuestas abiertas:** el modelo puede mapear respuestas de texto a categorías cerradas, escalas o etiquetas múltiples. Al no generar texto, evita variaciones de formato y facilita el análisis estadístico posterior.
- **Evaluación de sistemas RAG y LLM-as-judge:** puede responder preguntas binarias o de elección sobre fidelidad, relevancia o calidad de una respuesta, con probabilidades en lugar de juicios en texto libre. Encaja en pipelines de evaluación automatizada que necesitan señales rápidas y auditables.
- **Revisión de contratos y documentos:** con preguntas de sí/no y citas textuales puede comprobar cláusulas, contradicciones o condiciones en documentos de hasta 9.216 tokens. Es adecuado como asistente de primera revisión para equipos legal y compliance.
- **Clasificación de intenciones en banca y atención al cliente:** en Banking77 con 77 etiquetas obtiene 80,5%, por lo que puede usarse para enrutar solicitudes hacia colas especializadas. Requiere validación en el dominio concreto antes de producción.
- **Inspección visual básica:** puede clasificar imágenes y señalar regiones aproximadas sobre el objeto nombrado. Con 89% en COCO y 50% en RefCOCO, es más fiable para categorización visual que para localización precisa.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el test split de typed-decisions: 2.000 decisiones de cuatro flujos no vistos durante el entrenamiento, en zero-shot. Los rivales fueron ejecutados por el autor sobre las mismas 2.000 decisiones, salvo Decider 1, que reporta su propia cifra.

| Modelo | Accuracy ↑ | KL ↓ | Brier ↓ |
|---|---:|---:|---:|
| Amos 1 mini | 64,6% | 0,225 | 0,121 |
| Microsoft-Decision-1 (closed weights) | 79,5% | 0,318 | no disponible |
| Decider 1 (cifra del fabricante) | 76,8% | 0,096 | no disponible |
| Perplexity Decider v1.1 | 73,9% | 0,466 | no disponible |
| Clef (Cloudflare) | 72,5% | 0,191 | no disponible |

Con priors por pregunta ajustados sobre el train split del benchmark y aplicados en tiempo de respuesta, sin cambiar los pesos, Amos 1 mini alcanza 70,25% (Decider 1 reporta 80,1%). En el Decision Index 0.3, parte pública y con el kit del propio board, obtiene 17,35.

| Otra prueba | Resultado |
|---|---:|
| JevBench público easy / standard / hard | 100,0 / 77,8 / 53,2 |
| Diez benchmarks públicos (RAGTruth, JudgeBench, Belebele, WinoGrande, ContractNLI, TruthfulQA, Circa, Financial PhraseBank, TabFact, BBH) | 65,0% (media) |
| AG News | 81,5% |
| DAIR Emotion | 55,6% |
| Banking77 (77 etiquetas) | 80,5% |
| Totales de factura citados exactamente | 9/10 |
| Punto sobre el objeto nombrado, RefCOCO | 50% |
| Punto sobre el objeto nombrado, COCO | 89% |
| Razas de mascotas | 93,6% |
| Tiempo de servidor, mediana, petición de tres preguntas | 27 ms |
| Latencia en CPU de portátil | ~93 ms por petición |

## Requisitos de hardware

- VRAM estimada: no disponible. En ejecución CPU no requiere VRAM; no se publica RAM mínima.
- GPU recomendadas: no documentadas. El autor posiciona el modelo para CPU de portátil y no publica pruebas en GPU.
- ¿Cabe en GPU consumer? No está documentado. El caso de uso declarado es CPU, sin GPU.
- Tamaño del repositorio: 1,6 GB; no se desglosa el peso de los pesos frente al paquete de serving.
- Despliegue local: paquete `serve/` con Python 3.12 y PyTorch 2.14 (versiones indicadas por el autor); comando `python -m amos.serve amos-1-mini --device cpu --port 8000`.
- API alojada: `POST https://api.amos.scira.ai/v1/systemone` con `"model": "amos-1-mini"`, sin clave según la model card.
- vLLM, llama.cpp, Ollama y TGI: no disponible / no documentado.
- Latencia: ~93 ms por petición en CPU de portátil; 27 ms de mediana en servidor para tres preguntas. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy en typed-decisions | KL ↓ | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Amos 1 mini | ~0,5B | 9.216 tokens | 64,6% | 0,225 | Apache 2.0 | Pesos abiertos en HuggingFace y API alojada |
| Microsoft-Decision-1 | no disponible | no disponible | 79,5% | 0,318 | closed weights, según la model card | no disponible |
| Decider 1 | no disponible | no disponible | 76,8% (cifra del fabricante) | 0,096 | no disponible | no disponible |
| Perplexity Decider v1.1 | no disponible | no disponible | 73,9% | 0,466 | no disponible | no disponible |
| Clef (Cloudflare) | no disponible | no disponible | 72,5% | 0,191 | no disponible | no disponible |

El propio autor indica que Amos 1 medium está doce puntos por delante de mini en typed-decisions. No se dispone de parámetros, contexto ni licencia de los rivales en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre decisiones simples; el autor advierte que “sabe poco más allá del caso”.
- Está doce puntos por detrás de Amos 1 medium en typed-decisions.
- La localización visual es débil en RefCOCO: acierta el punto sobre el objeto nombrado en el 50% de las fotos.
- Lee 9.216 tokens por pasada y solo trabaja en inglés.
- No genera texto: no sirve para respuestas abiertas, resúmenes, código, explicaciones ni conversación libre.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- No “alucina” texto porque no genera texto, pero sí puede producir clasificaciones erróneas y probabilidades mal calibradas fuera de los dominios evaluados.
- Los benchmarks son del autor y no se han verificado de forma independiente; parte de la comparativa la ejecutó el propio autor y Decider 1 aporta su propia cifra.
- No se documentan sesgos demográficos, culturales o lingüísticos; la evaluación es limitada y en inglés.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse las licencias de los modelos base y de los datos de entrenamiento, que no se detallan.
- No hay soporte documentado de cuantización, GGUF, Ollama, vLLM o llama.cpp; el despliegue previsto es el paquete Python del autor o la API alojada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mukaddamzaid/amos-1-mini)
- [Colección Amos 1](https://huggingface.co/collections/mukaddamzaid/amos-1)
- [Amos 1 large](https://huggingface.co/mukaddamzaid/amos-1-large)
- [Amos 1 medium](https://huggingface.co/mukaddamzaid/amos-1-medium)
- [Amos 1 small](https://huggingface.co/mukaddamzaid/amos-1-small)
- [Playground de Amos 1 mini](https://amos.scira.ai/playground/?model=amos-1-mini)
- [Documentación de la API](https://amos.scira.ai/docs/)
- [Página del modelo](https://amos.scira.ai/models/amos-1-mini/)
- [Dataset typed-decisions](https://huggingface.co/datasets/LocalLLaMA/typed-decisions)
- [Decision Index (Space)](https://huggingface.co/spaces/multimodalart/jev-decision-index)
- [Modelo base textual Ettin-encoder-400m](https://huggingface.co/jhu-clsp/ettin-encoder-400m)
- [Modelo base visual SigLIP2-base-patch16-224](https://huggingface.co/google/siglip2-base-patch16-224)
- [Hype - ML/AI News](https://hype.replicate.dev/), mención tangencial de Amos 1 large; no aporta datos de Amos 1 mini.
