# DuyTa/Peppercorn_Base

## Resumen

Peppercorn Base (Hạt Tiêu) es un modelo de OCR de páginas y parsing de documentos desarrollado por el usuario DuyTa, derivado de LightOnOCR-3-0.8B mediante poda y destilación. Convierte una imagen de página en Markdown estructurado (tablas en HTML, fórmulas en LaTeX) y, opcionalmente, devuelve bounding boxes etiquetadas por bloque. Su interés radica en que concentra capacidades de un modelo de 0,85B en 310,8M de parámetros, manteniendo un rendimiento competitivo en vietnamita y en tablas.

El modelo es el checkpoint base supervisado (126.000 pasos de SFT) de Peppercorn v3, antes de cualquier fase de reinforcement learning. Está especializado en páginas vietnamitas nativas digitales y escaneadas, además de tablas y grounding de bloques. Es más débil en fórmulas, fotografías de móvil y páginas largas en inglés.

Arquitectónicamente es un `Qwen3_5ForConditionalGeneration` (layout Qwen3.5-VL) que carga directamente en `transformers>=5` y en vLLM estándar (`>=0.29`) sin plugins. La licencia es CC-BY-4.0 y el repo ocupa 0,6 GB en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (Qwen3.5-VL): ViT + decoder híbrido Gated DeltaNet / full attention |
| Parámetros totales | 310,8M (311.738.880 según safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | Vietnamita (vi), inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un transformer multimodal con torre de visión y decoder híbrido. La torre de visión conserva 8 de los 12 bloques ViT del padre (bloques 0, 1, 2, 5, 8, 9, 10, 11), con patch de 16 y merge 2×2, totalizando 72,2M de parámetros. El decoder conserva 12 de las 24 capas híbridas: 8 Gated DeltaNet y 4 de atención completa con gating (capas 0, 1, 2, 6, 7, 10, 11, 14, 15, 16, 22, 23), con hidden de 1.024 y MLP de 2.048 de los 3.584 originales. El vocabulario se reduce a 48.033 tokens (seleccionados por frecuencia sobre las etiquetas de entrenamiento) más 15 tokens HTML para tablas y 1.001 tokens de coordenadas `<c0>`…`<c1000>`, con embeddings atados.

El entrenamiento se realizó en tres fases. Primero, poda de LightOnOCR-3-0.8B: vocabulario BPE byte-level cerrado por merge, crecido por frecuencia en vietnamita e inglés hasta el 99,5% de cobertura en held-out por idioma; eliminación greedy de capas del decoder por KL(full ‖ pruned) sobre páginas de calibración con cuotas por tipo de capa; poda de neuronas MLP por activación absoluta media (estilo Minitron); y eliminación de 4 de los 12 bloques ViT. Los pesos son rebanadas de los tensores del padre. Segundo, un "ViT heal" de 3.000 pasos que entrena solo la torre de visión con el decoder congelado. Tercero, SFT con destilación de conocimiento durante 126.000 pasos × 16 páginas, optimizador Muon (LR 3·10⁻⁵, ViT ×0,1), warmup-stable-decay y EMA, con pérdida 0,5·cross-entropy + 0,5·KL hacia las top-20 log-probabilidades almacenadas del profesor (LightOnOCR-3-4B o 0.8B, mapeadas al vocabulario del estudiante). El 45% de las muestras se entrenó en modo grounding, con páginas a 1.540 o 2.048 px de lado largo.

Los datos de entrenamiento suman 1,54M de imágenes de página, 55% vietnamita y 45% inglés: PDFs y escaneos web vietnamitas, documentos gubernamentales, diapositivas, formularios, exámenes, matemáticas, gráficos, recibos, tablas sintéticas y líneas de escritura a mano; PDFs ingleses (PDFA, IDL, DocLayNet, olmOCR-mix) y matemáticas estilo arXiv. Las etiquetas provienen de LightOnOCR-3-4B y 0.8B, de los datasets de origen o son exactas (páginas sintéticas renderizadas). Aproximadamente el 1% de la mezcla son documentos administrativos vietnamitas internos no publicados. Los documentos y hosts de evaluación se eliminaron del entrenamiento mediante hashes de imagen, ids de documento y shingles de texto.

## Capacidades

- OCR de páginas completas: imagen de página a Markdown, con tablas convertidas a HTML y fórmulas a LaTeX.
- Grounding de bloques: devuelve bounding boxes etiquetadas por bloque mediante tokens de coordenadas `<c0>`…`<c1000>` (modo grounding).
- Parsing de documentos estructurados: tablas, formularios, diapositivas, exámenes y recibos.
- Manejo de páginas nativas digitales y escaneos, con especial solidez en vietnamita.
- Soporte bilingüe vietnamita e inglés.
- Compatibilidad directa con vLLM (`>=0.29`) y `transformers>=5` como modelo image-text-to-text.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio o vídeo: no disponible.

## Casos de uso

- Digitalización de archivos administrativos vietnamitas: el modelo convierte escaneos y PDFs de documentos gubernamentales en Markdown estructurado, aprovechando su entrenamiento específico en este dominio y su mejor distancia de edición en SEA-Vision VI (0,079, a la altura del profesor de 4B).
- Extracción de tablas de informes y facturas: con un TEDS de 0,637 en OmniDocBench-EN, supera a sus modelos padre, por lo que es adecuado para pipelines que necesitan reconstruir tablas como HTML para su posterior parseo.
- Indexación de documentos para RAG: el modo grounding devuelve bounding boxes por bloque (F1 de 0,788 en SEA-Vision VI), lo que permite enlazar cada fragmento de texto extraído con su región de la página original y facilitar la trazabilidad.
- Procesamiento masivo de PDFs en lote: con 15,8 páginas/s en una RTX PRO 6000 y 256 peticiones en vuelo, y una latencia mediana de 1,17 s por página, es viable para digitalizar corpus de decenas de miles de páginas.
- Extracción de formularios y recibos: su mezcla de entrenamiento incluye formularios y recibos, y el modo grounding permite localizar campos concretos en la página.
- Preprocesado de exámenes y material académico: el modelo maneja exámenes, gráficos y matemáticas, aunque con menor calidad en fórmulas (CDM de 0,751 frente a 0,959 del padre), por lo que conviene reservarlo a documentos con poca notación matemática.
- Despliegue en hardware modesto: con 310,8M de parámetros y 0,6 GB de repo, puede servirse en GPUs de consumo para tareas de OCR a menor escala.

## Benchmarks y rendimiento

Evaluación con vLLM, greedy, lado largo de 2.048 px, `max_tokens` 4.096 y loop guard. La puntuación de la suite OmniDocBench es la media de 100·(1 − text edit), 100·TEDS y 100·CDM; olmOCR-Bench es la tasa de test superados.

| Suite | Peppercorn Base (0,31B) | LightOnOCR-3-0.8B | LightOnOCR-3-4B |
|---|---|---|---|
| OmniDocBench-EN | 76,9 | 83,2 | 82,5 |
| olmOCR-Bench | 63,4 | 74,9 | 74,1 |
| MDPBench EN | 55,9 | 71,3 | 71,7 |
| MDPBench VI | 69,1 | 84,4 | 85,6 |
| SEA-Vision VI | 89,2 | 91,0 | 91,6 |
| Media de 5 | 70,9 | 81,0 | 81,1 |

Componentes:

| Métrica | Peppercorn Base | LightOnOCR-3-0.8B | LightOnOCR-3-4B |
|---|---|---|---|
| OmniDocBench-EN text edit ↓ | 0,080 | 0,053 | 0,059 |
| OmniDocBench-EN table TEDS ↑ | 0,637 | 0,591 | 0,588 |
| OmniDocBench-EN formula CDM ↑ | 0,751 | 0,959 | 0,946 |
| SEA-Vision VI text edit ↓ | 0,079 | 0,089 | 0,076 |
| SEA-Vision VI table TEDS ↑ | 0,873 | 0,892 | 0,891 |

Grounding frente a cajas humanas (Hungarian-matched, F1 class-agnostic a IoU ≥ 0,5; MDPBench: 40 páginas digitales por idioma):

| | SEA-Vision VI | MDPBench VI | MDPBench EN |
|---|---|---|---|
| Peppercorn Base | 0,788 | 0,762 | 0,616 |
| LightOnOCR-3-0.8B | 0,746 | 0,757 | 0,619 |
| LightOnOCR-3-4B | 0,779 | 0,779 | 0,670 |

Rendimiento de servicio en una RTX PRO 6000 (96 GB), vLLM 0.29, bf16, greedy, 300 páginas a 1.540 px de lado largo con 256 en vuelo: 15,8 páginas/s (frente a 11,5 del 0.8B y 3,7 del 4B), con latencia mediana por página de 1,17 s.

## Requisitos de hardware

- VRAM estimada para inferencia: con 310,8M de parámetros en bf16, el peso ocupa aproximadamente 0,62 GB; sumando activaciones y caché de visión, cabe holgadamente en GPUs con 8 GB o más. Las cifras exactas de VRAM no están publicadas.
- GPUs recomendadas: RTX PRO 6000 (96 GB) es la configuración medida por el autor para alto throughput. Para inferencia individual basta una GPU de consumo con suficiente VRAM.
- Cabe en GPU de consumo: sí, por tamaño; el autor no publica mediciones en GPUs de consumo concretas.
- Opciones de despliegue: vLLM (`>=0.29`) como servidor compatible con la API de OpenAI; `transformers>=5` con `AutoModelForImageTextToText` y `AutoProcessor`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 15,8 páginas/s con 256 peticiones en vuelo y latencia mediana de 1,17 s por página en RTX PRO 6000, bf16, 1.540 px de lado largo y greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media de 5 suites) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Peppercorn Base | 310,8M | No disponible | 70,9 | CC-BY-4.0 | Hugging Face |
| LightOnOCR-3-0.8B | ~0,85B | No disponible | 81,0 | No disponible en la información | Hugging Face (modelo padre) |
| LightOnOCR-3-4B | ~4B | No disponible | 81,1 | No disponible en la información | Hugging Face (profesor de destilación) |

Peppercorn Base sacrifica unos 10 puntos de media frente a sus padres a cambio de reducir el tamaño a aproximadamente el 37% del 0.8B y multiplicar por 1,4 el throughput de este. Destaca por encima de ambos padres en TEDS de tablas en OmniDocBench-EN (0,637) y en distancia de edición de texto en SEA-Vision VI (0,079), y en F1 de grounding en SEA-Vision VI (0,788).

## Limitaciones y advertencias

- Fórmulas: CDM de 0,751 en OmniDocBench-EN frente a 0,959 del padre de 0.8B; no es adecuado para documentos con notación matemática densa.
- Fotografías de móvil: MDPBench EN de 55,9 y MDPBench VI de 69,1, muy por debajo de los padres; rinde peor en imágenes capturadas con teléfono que en páginas digitales.
- Páginas largas en inglés: el autor advierte de que entra en bucles ("loops") con más frecuencia que su modelo padre; se aplicó un loop guard en la evaluación.
- Idiomas: solo vietnamita e inglés; no hay soporte declarado para otras lenguas.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con documentos administrativos y web, puede reflejar sesgos de esas fuentes.
- Alucinación: no se cuantifica en la model card; el riesgo existe en OCR generativo, especialmente en regiones de baja calidad o texto ilegible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar las condiciones de los datasets de origen (PDFA, IDL, DocLayNet, olmOCR-mix) si se redistribuyen derivados.
- Datos no publicados: aproximadamente el 1% del entrenamiento son documentos administrativos vietnamitas internos no liberados, lo que limita la reproducibilidad completa.
- Es un checkpoint base supervisado, no la versión final con RL (Peppercorn v3); el autor lo presenta como punto de partida.

## Enlaces

- Hugging Face: https://huggingface.co/DuyTa/Peppercorn_Base
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- No se han proporcionado otros enlaces (papers, blogs, repos o demos) en la información disponible.
