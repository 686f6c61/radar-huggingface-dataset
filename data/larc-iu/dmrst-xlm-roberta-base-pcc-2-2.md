# larc-iu/dmrst-xlm-roberta-base-pcc-2.2

## Resumen

El modelo `larc-iu/dmrst-xlm-roberta-base-pcc-2.2` es un parser de discurso RST (Rhetorical Structure Theory) en alemán, construido sobre el encoder `xlm-roberta-base` y entrenado con la librería Dipo del grupo LARC (IU). Su función es segmentar un texto en unidades de discurso elementales (EDU) y predecir el árbol de relaciones retóricas que las conecta, resolviendo la tarea de discourse parsing de extremo a extremo sobre texto crudo en alemán.

El modelo reimplementa la arquitectura DMRST (Liu et al., CODI 2021), un marco conjunto para segmentación y parsing RST a nivel de documento, y se ha afinado sobre el Potsdam Commentary Corpus 2.2, un corpus de comentarios periodísticos alemanes anotados en RST con el split train/dev/test de DISRPT 2025. Emplea 31 etiquetas de relación (mononuclear y multinuclear) y trabaja directamente sobre texto sin tokenizar.

Es relevante para investigadores en lingüística computacional y análisis del discurso que necesiten analizar estructura retórica en alemán, así como para pipelines de análisis textual que requieran descomponer documentos en jerarquías de argumentación. El modelo está pensado para investigación y análisis, no para uso comercial, dado que el corpus de entrenamiento es CC BY-NC-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabecera DMRST para segmentación y parsing RST conjunto |
| Parametros totales | no disponible (el encoder base XLM-RoBERTa base tiene ~278M; el total del checkpoint no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del encoder XLM-RoBERTa base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | alemán (de) |
| Licencia | MIT para los pesos (derivados de xlm-roberta-base); datos de entrenamiento CC BY-NC-SA 4.0, uso no comercial |
| Formato de pesos | no disponible (repo de 1.7 GB, probablemente safetensors/PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DMRST, un marco conjunto que combina segmentación de EDU y parsing de árboles de discurso en un único modelo. Sobre el encoder `xlm-roberta-base` se añaden cabeceras para la predicción de fronteras de segmento (BeginSeg) y para la construcción del árbol retórico con etiquetas de relación y nuclearidad. El parsing se realiza a nivel de documento, produciendo árboles en formato RS4.

El entrenamiento se realizó exclusivamente sobre el split de entrenamiento del Potsdam Commentary Corpus 2.2, con selección del checkpoint según `e2e_full_f1` en dev. Los datos se alinearon desde la capa de datos primarios del corpus para que el modelo reciba texto crudo sin tokenizar, con todos los espacios colapsados. Se utilizaron 31 etiquetas de relación, incluyendo relaciones mononucleares (antithesis, background, cause, etc.) y multinucleares (conjunction, contrast, disjunction, joint, list). No se menciona uso de RLHF ni DPO; es un ajuste supervisado sobre anotaciones RST.

## Capacidades

- Segmentación de discurso: identifica fronteras de unidades de discurso elementales (EDU) en texto alemán crudo.
- Parsing RST de extremo a extremo: construye el árbol retórico completo a partir de texto sin procesar, incluyendo segmentación.
- Predicción de relaciones retóricas: clasifica 31 tipos de relación (mononuclear y multinuclear) con etiquetas de nuclearidad.
- Procesamiento de texto crudo: acepta texto con saltos de línea y espacios arbitrarios sin necesidad de tokenización previa.
- Manejo de estructura de párrafos: inicia nuevos segmentos en saltos de párrafo (doble salto de línea) y tras líneas cortas tipo encabezado (configurable con `break_at_paragraphs`).
- Salida en formato RS4: genera representación textual del árbol de discurso.
- Interfaz CLI y Python mediante la librería `dipo`.

## Casos de uso

- Análisis de estructura argumentativa en comentarios periodísticos: el modelo descompone artículos de opinión alemanes en jerarquías de tesis, evidencias y concesiones, permitiendo estudiar patrones retóricos a escala de corpus.
- Investigación en lingüística del discurso: facilita el análisis cuantitativo de relaciones retóricas en corpus alemanes, comparando distribuciones de etiquetas entre géneros o autores.
- Preprocesamiento para resumen extractivo: el árbol RST identifica unidades nucleares y satélites, lo que permite seleccionar oraciones centrales para resúmenes guiados por estructura.
- Análisis de coherencia en generación de texto: se puede usar como evaluador de la estructura discursiva de textos generados por otros modelos en alemán.
- Enseñanza de escritura académica: el árbol retórico visualiza cómo se organizan argumentos y contraargumentos en un texto, útil en herramientas de retroalimentación.
- Extracción de relaciones de discurso para sistemas de QA: las relaciones de evidencia, causa o justificación pueden informar la selección de pasajes relevantes en documentos largos.
- Análisis de sentimiento a nivel de discurso: las relaciones de concesión y contraste ayudan a interpretar cambios de polaridad dentro de un documento.

## Benchmarks y rendimiento

Datos de la model card (F1 × 100 bajo Parseval original, con spans hoja triviales excluidos):

| Split | Seg | E2E Span | E2E Nuc | E2E Rel | E2E Full | Gold-EDU Span | Gold-EDU Nuc | Gold-EDU Rel | Gold-EDU Full |
|---|---|---|---|---|---|---|---|---|---|
| dev | 94.9 | 69.2 | 44.4 | 27.7 | 26.9 | 70.5 | 45.6 | 29.0 | 28.2 |
| test | 95.4 | 60.5 | 33.1 | 18.6 | 18.6 | 63.5 | 35.8 | 20.8 | 20.8 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un encoder base (~278M de parámetros) más cabeceras, la inferencia en FP32 requiere aproximadamente 1,1-1,5 GB de VRAM, y en FP16 alrededor de 0,6-0,8 GB (estimación orientativa, no confirmada en la model card).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 6GB o superior).
- Opciones de despliegue: la librería `dipo` (CLI y Python) es la vía documentada; al estar basado en XLM-RoBERTa, también podría cargarse con PyTorch/Transformers, aunque la lógica de parsing DMRST requiere `dipo`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| larc-iu/dmrst-xlm-roberta-base-pcc-2.2 | ~278M (encoder base) | no disponible | Alemán | MIT (pesos) / no comercial (datos) | Hugging Face |
| DMRST original (Liu et al., 2021) | no disponible | no disponible | Multilingüe | no disponible | Código en GitHub |
| Otros parsers RST para alemán | no disponible | no disponible | Alemán | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos: entrenado únicamente sobre comentarios periodísticos alemanes (Potsdam Commentary Corpus), por lo que puede generalizar mal a otros géneros (técnico, conversacional, literario).
- Riesgo de alucinación: al ser un modelo discriminativo de parsing, no genera texto libre, pero puede producir árboles incorrectos en textos fuera de dominio o con estructura atípica.
- Limitaciones de contexto: el encoder XLM-RoBERTa base tiene un límite de 512 tokens; documentos más largos requerirán truncamiento o segmentación previa (no confirmado explícitamente en la model card).
- Limitaciones de idioma: solo alemán; no soporta otros idiomas aunque el encoder base sea multilingüe.
- Restricciones de licencia: los pesos heredan MIT de xlm-roberta-base, pero el corpus de entrenamiento es CC BY-NC-SA 4.0, lo que restringe el uso a fines no comerciales.
- Variabilidad: los scores provienen de una única ejecución de entrenamiento; en conjuntos de test pequeños la variación entre ejecuciones puede ser de varios puntos.
- Estructura de líneas: el modelo colapsa todos los espacios y no ve saltos de línea; la segmentación por párrafos se añade heurísticamente en `predict_from_text`.
- Uso previsto: investigación y análisis de texto; no está validado para producción comercial.

## Enlaces

- Hugging Face: https://huggingface.co/larc-iu/dmrst-xlm-roberta-base-pcc-2.2
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper DMRST: https://aclanthology.org/2021.codi-main.15/
- Paper Dipo (arXiv): https://arxiv.org/abs/2610.17658
- Potsdam Commentary Corpus 2.2: https://github.com/PeterBourgonje/pcc2.2
- XLM-RoBERTa base: https://huggingface.co/xlm-roberta-base
