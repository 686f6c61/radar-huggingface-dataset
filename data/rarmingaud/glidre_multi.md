# rarmingaud/glidre_multi

## Resumen

GLiDRE (Generalist Lightweight model for Document-level Relation Extraction) es un modelo especializado en extracción de relaciones a nivel de documento, desarrollado por Robin Armingaud y Romaric Besançon en el marco de CEA-LIST. A diferencia de los modelos de extracción de relaciones clásicos, que requieren un conjunto cerrado de tipos predefinidos, GLiDRE adopta el paradigma zero-shot introducido por GLiNER: el usuario proporciona las etiquetas de relación en tiempo de inferencia y el modelo clasifica pares de entidades sobre texto no visto durante el entrenamiento. Esto lo convierte en una alternativa práctica para dominios donde no existe un esquema de relaciones preanotado.

El modelo se construye mediante fine-tuning sobre dos encoders multilingües: `microsoft/mdeberta-v3-base` y `Alibaba-NLP/gte-multilingual-base`. El repositorio `rarmingaud/glidre_multi` ocupa 2,5 GB y está publicado bajo licencia Apache 2.0. Soporta doce idiomas (inglés, albanés, árabe, checo, francés, alemán, italiano, rumano, español, esloveno, turco y serbio) y se entrena con datos de `HuggingFaceFW/fineweb` y `HuggingFaceFW/fineweb-2`, además de los corpus habituales de relación documental como DocRED y Re-DocRED.

Su relevancia actual radica en que cubre una carencia de la familia GLiNER: la mayoría de modelos zero-shot de extracción se centran en entidades (NER) y no en relaciones entre entidades que pueden aparecer en distintas frases de un documento largo. GLiDRE traslada ese enfoque generalista a la extracción de relaciones, manteniendo un tamaño contenido que permite desplegarlo en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tuning sobre mdeberta-v3-base y gte-multilingual-base) para clasificación de pares de entidades |
| Parametros totales | no disponible (repo de 2,5 GB, coherente con un encoder base de ~300 M de parámetros y pesos en varios formatos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, sq, ar, cs, fr, de, it, ro, es, sl, tr, sr |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo PyTorch; se infiere safetensors/bin, sin confirmar) |

## Arquitectura y entrenamiento

GLiDRE sigue el diseño de GLiNER adaptado a relaciones: el texto y las etiquetas de relación se codifican conjuntamente, y el modelo puntúa la probabilidad de que un par de menciones de entidad (con sus tipos y offsets) esté conectado por cada etiqueta candidata. La entrada no es solo una frase, sino el documento completo con las menciones de entidad ya identificadas, lo que permite capturar relaciones entre entidades separadas por varias frases. El modelo se inicializa desde encoders multilingües (mdeberta-v3-base y gte-multilingual-base) y se entrena con objetivos de clasificación de relaciones, con soporte para múltiples funciones de pérdida y componentes intercambiables según la model card.

El entrenamiento combina datos de `HuggingFaceFW/fineweb` y `fineweb-2` con corpus supervisados de relación documental como DocRED y Re-DocRED (el repositorio incluye scripts de fine-tuning para Re-DocRED). La model card no detalla el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. La innovación principal es el enfoque zero-shot generalista aplicado a relaciones a nivel de documento, con etiquetas definidas por el usuario en inferencia y sensibilidad al formato (la model card recomienda etiquetas en mayúsculas porque el modelo rinde mejor así).

## Capacidades

- Extracción de relaciones zero-shot: clasifica relaciones no vistas durante el entrenamiento a partir de etiquetas proporcionadas en inferencia.
- Extracción a nivel de documento: procesa documentos completos, no solo frases, permitiendo relaciones entre entidades distantes.
- Entrada versátil: acepta texto tokenizado o documentos completos, con menciones de entidad especificadas por offsets y tipos.
- Multilingüe: cubre doce idiomas, incluyendo inglés, español, francés, alemán, árabe, turco y varias lenguas eslavas y balcánicas.
- Clasificación multi-etiqueta opcional: el parámetro `multi_label` permite asignar varias relaciones a un mismo par de entidades.
- Umbral de confianza configurable: el parámetro `threshold` permite ajustar precisión y recall en producción.
- Entrenamiento y fine-tuning: incluye scripts para reentrenar sobre DocRED y Re-DocRED.
- No dispone de generación de texto, razonamiento general, código, matemáticas, visión ni tool calling; es un modelo discriminativo de extracción de relaciones.

## Casos de uso

- Construcción de grafos de conocimiento a partir de corpus documentales: se extraen entidades con un NER previo y GLiDRE clasifica las relaciones entre ellas con etiquetas definidas por el dominio, generando tripletas para un grafo.
- Análisis de contratos y documentación legal: permite definir relaciones como `PARTY_TO`, `EFFECTIVE_DATE` o `GOVERNING_LAW` sin reentrenar, útil para equipos jurídicos que revisan documentos largos.
- Procesamiento de literatura científica: extracción de relaciones como `AUTHORED_BY`, `CITES` o `AFFILIATED_WITH` entre autores, instituciones y publicaciones en artículos multilingües.
- Enriquecimiento de bases de datos de noticias: detección de relaciones entre personas, organizaciones y lugares a lo largo de un artículo completo, con etiquetas adaptadas a la sección editorial.
- Vigilancia regulatoria y compliance: identificación de vínculos societarios, cargos y fechas en informes financieros y registros mercantiles en varios idiomas europeos.
- Investigación en PLN multilingüe: evaluación de extracción de relaciones zero-shot en idiomas de bajos recursos (albanés, esloveno, serbio) donde no existen esquemas anotados.
- Preanotación para humanos en el bucle: generar candidatos de relación con un umbral bajo y revisión humana posterior, reduciendo el coste de anotación en nuevos dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (2,5 GB) y la base encoder, se estima que la inferencia en FP16 requiere del orden de 1-2 GB de VRAM, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el modelo en FP16.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no hay confirmación oficial.
- Opciones de despliegue: el paquete oficial `glidre` (instalable con `pip install .` desde el repositorio de CEA-LIST) es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un modelo discriminativo de extracción no encaja en esos servidores de generación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Zero-shot |
|---|---|---|---|---|---|---|
| GLiDRE (rarmingaud/glidre_multi) | Extracción de relaciones documental | no disponible | no disponible | 12 | Apache 2.0 | Sí |
| GLiNER (urchade) | Extracción de entidades | ~200 M (varía por variante) | no disponible | Multilingüe según variante | Apache 2.0 | Sí |
| mdeberta-v3-base | Encoder multilingüe base | ~278 M | 512 tokens | 100 idiomas | MIT | No (requiere fine-tuning) |
| gte-multilingual-base | Encoder de embeddings | ~305 M | 8192 tokens | Multilingüe | Apache 2.0 | No |

La comparación con GLiNER es la más directa por linaje arquitectónico, pero GLiNER resuelve extracción de entidades y no de relaciones; GLiDRE cubre la tarea complementaria. Frente a encoders base como mdeberta-v3-base o gte-multilingual-base, la diferencia es que GLiDRE ya está especializado y no requiere fine-tuning para extracción de relaciones zero-shot.

## Limitaciones y advertencias

- Requiere que las menciones de entidad se proporcionen de antemano con offsets y tipos; no realiza NER de forma autónoma.
- El rendimiento depende del formato de las etiquetas: la model card indica que funciona mejor con nombres de relación en mayúsculas.
- Es un modelo discriminativo: no genera texto, no razona de forma general y no soporta tool calling ni agentes.
- Riesgo de falsos positivos y negativos según el umbral elegido; el parámetro `threshold` debe calibrarse por dominio.
- El rendimiento en idiomas de bajos recursos (albanés, esloveno, serbio) puede ser inferior al de inglés, aunque no hay métricas publicadas en la información disponible.
- No hay datos públicos de benchmarks, latencia ni VRAM, lo que dificulta comparar su calidad frente a alternativas antes de desplegarlo.
- La model card apunta a una versión posterior (`cea-list-ia/glidre_multi_v2`); conviene evaluar esa versión antes de fijar la actual en producción.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y la atribución correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rarmingaud/glidre_multi
- Versión nueva referenciada: https://huggingface.co/cea-list-ia/glidre_multi_v2
- Repositorio GLiDRE: https://github.com/cea-list-lasti/glidre
- GLiNER (trabajo previo): https://github.com/urchade/GLiNER
- Paper arXiv: https://arxiv.org/abs/2508.00757
- Modelo base mdeberta-v3-base: https://huggingface.co/microsoft/mdeberta-v3-base
- Modelo base gte-multilingual-base: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
