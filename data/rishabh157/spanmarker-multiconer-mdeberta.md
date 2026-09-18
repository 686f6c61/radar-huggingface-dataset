# Rishabh157/spanmarker-multiconer-mdeberta

## Resumen

`Rishabh157/spanmarker-multiconer-mdeberta` es un modelo de reconocimiento de entidades nombradas (NER) multilingüe desarrollado por Rishabh Kumar (@Rishabh157). Combina el encoder `microsoft/mdeberta-v3-base` (12 capas, dimensión oculta 768, atención posicional relativa desenrollada) con el framework SpanMarker, que reformula el NER como clasificación de spans candidatos mediante tokens marcadores de frontera y supresión no máxima greedy. El resultado es un modelo de 277.582.882 parámetros, ajustado a parámetro completo durante 6 épocas (117.756 pasos) sobre MultiCoNER 2023 (SemEval-2023 Task 2).

Su rasgo diferencial es la granularidad de su taxonomía: 33 clases finas (67 etiquetas BIO) que no se limitan a las categorías clásicas PER/LOC/ORG, sino que distinguen subtipos como `AerospaceManufacturer`, `CarManufacturer`, `MusicalGRP`, `MusicalWork`, `Software`, `Medication/Vaccine` o `Symptom`. Cubre 9 idiomas declarados (bangla, alemán, inglés, español, francés, hindi, italiano, portugués y sueco) más la etiqueta `multilingual`, con una ventana máxima de 384 tokens.

Es relevante para equipos que necesitan extracción de entidades fina en corpus multilingües heterogéneos (noticias, catálogos culturales, textos comerciales y biomédicos) sin depender de un LLM generativo. Su licencia Apache-2.0 facilita la integración comercial, aunque el modelo se publicó con 0 descargas y 0 likes, y sus métricas están declaradas por el autor sin verificación independiente (`verified: false` en el model-index).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder mDeBERTa-v3 (12 capas, 768 de dimensión oculta, atención posicional relativa desenrollada) + cabecera SpanMarker de clasificación de spans candidatos con NMS greedy |
| Parámetros totales | 277.582.882 |
| Parámetros activos | No aplica: modelo denso con ajuste de todos los parámetros (no es MoE) |
| Longitud de contexto | 384 tokens (`model_max_length`); `entity_max_length` de 16 palabras; `marker_max_length` de 128 spans candidatos |
| Tipos de cuantización | No disponible: solo se publican pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni int8 publicadas |
| Idiomas soportados | bn, de, en, es, fr, hi, it, pt, sv (9 idiomas) + etiqueta `multilingual` |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería de inferencia | span-marker (sobre transformers/PyTorch) |
| Taxonomía | 33 clases finas de entidad (67 etiquetas BIO) |
| Fecha de publicación (metadatos de HuggingFace) | 2026-09-18 |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo parte del backbone `microsoft/mdeberta-v3-base`, un transformer encoder con atención posicional relativa desenrollada (disentangled attention), y le superpone el framework SpanMarker. En lugar de etiquetar token a token, SpanMarker genera spans candidatos delimitados por tokens marcadores `[S_i, E_j]`, los clasifica contra las 33 clases objetivo y aplica supresión no máxima greedy para eliminar solapamientos. Esta formulación suele superar al etiquetado BIO clásico en entidades multi-palabra y evita secuencias de etiquetas inválidas.

El ajuste fue de parámetro completo (los 277,58 M parámetros entrenables, sin LoRA) durante 6 épocas completas y 117.756 pasos sobre MultiCoNER 2023 / SemEval-2023 Task 2, con `model_max_length` de 384 tokens —el autor indica una cobertura empírica del 100 % en títulos multi-frase—, `entity_max_length` de 16 palabras (99,99 % de las entidades multi-palabra del corpus) y `marker_max_length` de 128 spans candidatos. La pérdida de validación reportada es de 0,0234, con descenso monotónico a lo largo de las 6 épocas.

El autor publica además una comparativa interna con sus intentos previos basados en adaptadores LoRA (Token-LoRA v1, v2 y v3, y un "Master Unified Token-LoRA" entrenado sobre un dataset conjunto de 1,53 M de ejemplos y una taxonomía unificada de 95 etiquetas), lo que sitúa al ajuste completo con SpanMarker como la mejor variante de su serie. No se documentan en la información proporcionada etapas de RLHF, DPO ni decodificación especulativa, ni la composición exacta del dataset de entrenamiento más allá del corpus MultiCoNER 2023.

## Capacidades

- Reconocimiento de entidades nombradas multilingüe en 9 idiomas declarados (bn, de, en, es, fr, hi, it, pt, sv) con una única cabecera de clasificación compartida.
- Extracción de entidades finas de tipo persona: `Artist`, `Athlete`, `Cleric`, `Politician`, `Scientist`, `SportsManager`, `OtherPER`.
- Extracción de localizaciones: `Facility`, `HumanSettlement`, `Station`, `OtherLOC`.
- Extracción de organizaciones con subtipos sectoriales: `AerospaceManufacturer`, `CarManufacturer`, `MusicalGRP`, `PublicCorp`, `PrivateCorp`, `SportsGRP`, `ORG`.
- Extracción de obras creativas: `ArtWork`, `MusicalWork`, `VisualWork`, `WrittenWork`.
- Extracción de productos y tecnología: `Clothing`, `Drink`, `Food`, `Software`, `Vehicle`, `OtherPROD`.
- Extracción biomédica: `AnatomicalStructure`, `Disease`, `MedicalProcedure`, `Medication/Vaccine`, `Symptom`.
- Manejo de entidades multi-palabra de hasta 16 palabras y de textos con hasta 384 tokens por pasada.
- Salida con puntuaciones por span, lo que permite aplicar umbrales de confianza y post-proceso por clase.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: es un modelo exclusivamente discriminativo de etiquetado de spans.

## Casos de uso

- Enriquecimiento de noticias multilingües: extraer personas, organizaciones y localizaciones de titulares y cuerpos de noticia en 9 idiomas con una sola pasada, aprovechando la ventana de 384 tokens para cubrir titulares multi-frase completos.
- Media intelligence y seguimiento de marca: la distinción entre `AerospaceManufacturer`, `CarManufacturer`, `PublicCorp`, `PrivateCorp` y `MusicalGRP` permite clasificar automáticamente las menciones corporativas por sector, algo que un NER genérico de tres clases no resuelve.
- Catalogación de industrias culturales: etiquetado de `MusicalWork`, `VisualWork`, `ArtWork` y `WrittenWork` en fichas de discos, películas, videojuegos y bibliotecas para alimentar motores de búsqueda facetada.
- Farmacovigilancia y análisis de literatura biomédica: extracción de `Symptom`, `Disease`, `Medication/Vaccine` y `MedicalProcedure` en abstracts y notas clínicas anonimizadas; requiere validación clínica propia porque el modelo no está certificado como dispositivo médico.
- Construcción de grafos de conocimiento y preprocesado para RAG: usar las entidades extraídas como nodos y las co-menciones en un mismo span o documento como aristas, alimentando después un resolvedor de entidades (el modelo no incluye entity linking).
- Pre-anotación para equipos de etiquetado humano: generar propuestas de spans con su score y revisarlas en una herramienta de anotación, reduciendo el coste inicial en proyectos multilingües con la taxonomía de 33 clases.
- Analítica deportiva: extracción de `Athlete`, `SportsGRP` y `SportsManager` en crónicas y resultados de competición para poblar bases de datos estructuradas de eventos.
- Comercio electrónico y moderación: detección de `Food`, `Drink`, `Clothing` y `Vehicle` en descripciones de producto y publicaciones de usuario para categorización automática y cumplimiento normativo.

## Benchmarks y rendimiento

Evaluación declarada por el autor sobre el conjunto oficial de validación de MultiCoNER 2023 (10 particiones de idioma, 15.578 frases) con coincidencia exacta de span (`seqeval`). Todas las métricas figuran como `verified: false` en el model-index.

| Métrica | Valor | Nota |
|---|---|---|
| F1 global | 0,6697 | 66,97 % |
| Precisión | 0,7387 | 73,87 % |
| Recall | 0,6125 | 61,25 % |
| Exactitud de secuencia | 0,9039 | 90,39 % |
| Pérdida de validación | 0,0234 | 6 épocas, descenso monotónico |

Comparativa con las variantes previas del mismo autor, sobre la misma taxonomía de 33 clases de MultiCoNER:

| Modelo | Arquitectura | Precisión | Recall | F1 |
|---|---|---|---|---|
| Token-LoRA v1 | r=16, solo atención | 46,26 % | 51,79 % | 48,87 % |
| Token-LoRA v2 | r=32, atención+FFN, pesos naive | 17,74 % | 48,41 % | 25,97 % |
| Token-LoRA v3 | r=32, atención+FFN, sin ponderación | 53,10 % | 53,47 % | 53,28 % |
| Master Unified Token-LoRA | r=64, dataset conjunto de 1,53 M, 95 etiquetas | 59,57 % | 59,23 % | 59,37 % |
| SpanMarker (época 6) | ajuste completo, SpanMarker | 73,87 % | 61,25 % | 66,97 % |

Desglose parcial por clase (la información proporcionada se corta en `Artist`; el detalle de las 33 categorías no está completo):

| Clase de entidad | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| `HumanSettlement` | 87,00 % | 76,99 % | 81,69 % | 2.903 |
| `AerospaceManufacturer` | 82,14 % | 75,41 % | 78,63 % | 244 |
| `Drink` | 77,97 % | 73,90 % | 75,88 % | 249 |
| `Symptom` | 80,93 % | 69,78 % | 74,94 % | 225 |
| `PrivateCorp` | 84,57 % | 66,07 % | 74,19 % | 224 |
| `Artist` | 77,37 % | 69,87 % | 73,43 % | no disponible (dato truncado) |

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 277,58 M parámetros del checkpoint (sin contar activaciones ni tokenizer): aproximadamente 1,11 GB en fp32, 0,56 GB en fp16/bf16 y 0,28 GB en int8. Son estimaciones aritméticas, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM puede ejecutar el modelo en fp16 con lotes pequeños; una RTX 3060, RTX 4070 o RTX 4090 es más que suficiente y permite lotes grandes. Las A100 y H100 solo se justifican para alto throughput en servidor.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia puntual, dado el tamaño del checkpoint (repositorio de 1,1 GB).
- Opciones de despliegue: librería `span-marker` sobre `transformers` y PyTorch, que es la vía documentada por el autor. No se publican pesos GGUF ni soporte para llama.cpp u Ollama (la cabecera SpanMarker no es compatible directamente con esos runtimes). La compatibilidad con vLLM o TGI no está documentada y no hay evidencia disponible de integración con esos servidores.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | F1 (MultiCoNER 33 clases) | Licencia |
|---|---|---|---|---|---|
| spanmarker-multiconer-mdeberta | mDeBERTa-v3-base + SpanMarker, ajuste completo | 277,58 M | 384 tokens | 66,97 % | Apache-2.0 |
| Master Unified Token-LoRA (mismo autor) | mDeBERTa-v3 + LoRA r=64, taxonomía conjunta de 95 etiquetas | No disponible | No disponible | 59,37 % | No disponible |
| Token-LoRA v3 (mismo autor) | mDeBERTa-v3 + LoRA r=32 en atención y FFN | No disponible (adaptadores) | No disponible | 53,28 % | No disponible |
| `microsoft/mdeberta-v3-base` | Transformer encoder base, sin cabecera NER | ~278 M (no confirmado en la información) | No disponible | No aplica (no es un modelo NER) | No disponible en la información proporcionada |

No se dispone de datos de benchmarks de alternativas externas (otros NER multilingües de taxonomía fina) en la información proporcionada, por lo que no se incluye una comparación con ellos.

## Limitaciones y advertencias

- Desequilibrio entre precisión (73,87 %) y recall (61,25 %): el modelo tiende a omitir entidades antes que a inventarlas, con un 38,75 % de spans reales no recuperados en validación.
- El F1 global de 66,97 % corresponde a MultiCoNER 2023, un benchmark diseñado con entidades ambiguas, ruido y categorías finas; no debe interpretarse como el rendimiento esperable en NER general sobre texto limpio.
- Métricas declaradas por el autor y marcadas como `verified: false`: no han sido reproducidas de forma independiente.
- Repositorio con 0 descargas y 0 likes en el momento del análisis: sin validación ni reportes de la comunidad sobre su comportamiento en producción.
- Ventana de 384 tokens: los documentos largos deben trocearse, con riesgo de perder entidades que cruzan el límite de fragmento y de degradar la desambiguación por falta de contexto.
- Límites estructurales de SpanMarker: `entity_max_length` de 16 palabras y `marker_max_length` de 128 spans candidatos; textos con muchísimas menciones o entidades muy largas pueden degradarse.
- Taxonomía cerrada de 33 clases: no contempla categorías fuera de ella (eventos, cantidades, direcciones, nacionalidades). Cualquier entidad ajena se fuerza a `O` o a la clase más cercana, generando posibles falsos positivos plausibles con puntuaciones altas.
- Clases con soporte bajo (menos de 250 ejemplos) presentan F1 inferior a las mayoritarias; conviene calibrar umbrales de confianza por clase.
- Cobertura idiomática limitada a 9 idiomas declarados; no se documentan resultados para otros idiomas, incluidos los del propio corpus MultiCoNER que no aparecen en los tags.
- Sesgos: no hay evaluación de sesgos publicada. El backbone mDeBERTa-v3 se entrena sobre datos web, por lo que puede heredar sesgos de género, geográficos y culturales en la clasificación de personas y localizaciones.
- Riesgo de alucinación: al ser un modelo discriminativo no genera texto libre, pero sí puede producir falsos positivos con alta confianza sobre spans plausibles, especialmente en clases finas poco representadas.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero se debe verificar por separado la licencia del backbone `microsoft/mdeberta-v3-base` y del corpus MultiCoNER antes de un despliegue comercial.
- Para producción se recomienda post-proceso explícito: umbral de confianza por clase, deduplicación (la NMS greedy ya está en el pipeline) y validación contra un conjunto propio del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rishabh157/spanmarker-multiconer-mdeberta
- Perfil del autor: https://huggingface.co/Rishabh157
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Dataset de entrenamiento/evaluación: https://huggingface.co/datasets/MultiCoNER/multiconer_v2
- Resultados de búsqueda web: no se encontraron enlaces relevantes; las entradas devueltas corresponden a Microsoft Power Apps y no guardan relación con el modelo.
- Paper de SemEval-2023 Task 2 (MultiCoNER 2023): no disponible en la información proporcionada.
- Repositorio del framework SpanMarker: no disponible en la información proporcionada.
