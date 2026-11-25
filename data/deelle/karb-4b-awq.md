# Deelle/Karb-4B-AWQ

## Resumen

Karb-4B-AWQ es la variante cuantizada a 4 bits (AWQ W4A16, INT4 simétrico con `group_size=128`) del modelo Karb-4B, un ajuste fino especializado de Qwen3.5-4B desarrollado por Deelle. El modelo resuelve una tarea concreta de document AI: detección de maquetación, clasificación de regiones en 7 clases y transcripción a nivel de carácter en una sola pasada autorregresiva sobre imágenes de documentos, con especial énfasis en manuscritos ucranianos y alfabeto cirílico.

Con 4.029.410.816 parámetros totales, el checkpoint AWQ reduce el peso de los pesos a 2,57 GiB (frente a 7,51 GiB en BF16), manteniendo el codificador visual en BF16. La cuantización apenas degrada la calidad: 94,33 % de puntuación compuesta frente a 94,55 % del modelo completo, con un CER de página de 6,78 % frente a 6,53 %.

Su relevancia actual radica en que ofrece un pipeline OCR/HTR completo (detección, clasificación y transcripción) en un único modelo de 4B desplegable en una GPU de consumo, con licencia Apache 2.0 y un formato de salida compacto que reduce la longitud de secuencia aproximadamente 3,6 veces respecto a JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B) con codificador visual, fine-tune para image-text-to-text |
| Parametros totales | 4.029.410.816 (4,03B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 (INT4 simetrico, group_size=128); existen BF16 y FP8 W8A8 en repositorios hermanos |
| Idiomas soportados | ucraniano (uk), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), vision encoder en BF16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y conserva su arquitectura transformer multimodal con codificador visual, pero introduce modificaciones sustanciales orientadas a la transcripción de documentos. La más destacable es la poda del vocabulario: de 248.320 a 24.576 tokens núcleo (24.579 filas de embedding en total, incluyendo 1.001 tokens de coordenadas `<loc_0>`–`<loc_1000>`, 7 tokens de tipo de región, etiquetas de marcado y tokens especiales multimodales), con pesos `embed_tokens` y `lm_head` desacoplados, lo que reduce el checkpoint en 1,70 GiB. La salida se codifica como una tupla plana por región en lugar de JSON.

El entrenamiento emplea una receta específica: pérdida KL gaussiana sobre el vocabulario completo con annealing dinámico de σ (2,0 → 1,0), Vision-Forcing Token Dropout (VFTD), Confusable Grapheme Margin Loss (γ = 2,0), Interline CutMix y un optimizador Selective C-AdamW, todo ello en un currículo de 7 fases con 1.850 pasos sobre una única RTX 5090. El conjunto de datos declarado es `UkrainianCatholicUniversity/rukopys`. La cuantización AWQ de este repositorio se aplica sobre el checkpoint BF16 preservando el codificador visual en BF16.

## Capacidades

- Detección de maquetación y regiones con coordenadas normalizadas a 0..1000 en formato `[x1, y1, x2, y2]`.
- Clasificación de regiones en 7 clases: `handwritten`, `printed`, `formula` (LaTeX), `table`, `annotation`, `image` (texto vacío) y `graph` (texto vacío).
- Transcripción a nivel de carácter de texto manuscrito e impreso, con soporte de marcado en línea (`<illegible>`, `<strike>...</strike>`, `<corr>...</corr>`).
- Reconocimiento de escritura manuscrita (HTR) en ucraniano y cirílico.
- Procesamiento conjunto de detección, clasificación y transcripción en una sola pasada autorregresiva.
- Salida estructurada compacta parseable mediante `parse_karb_output(raw_text, img_w, img_h)`.
- Conversacional (etiqueta `conversational` en el repositorio).
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Digitalización de archivos históricos ucranianos: el modelo transcribe manuscritos y devuelve bounding boxes en píxeles absolutos, lo que permite indexar y buscar sobre corpus escaneados sin pipeline OCR separado.
- Procesamiento de formularios y documentos administrativos: la clasificación en 7 clases distingue campos manuscritos, impresos, tablas y anotaciones, facilitando la extracción selectiva de información.
- Extracción de fórmulas y tablas: las regiones `formula` se emiten en LaTeX y las `table` como región diferenciada, lo que sirve para reconstruir contenido técnico o financiero.
- Despliegue en hardware de consumo: con 2,57 GiB de pesos y un mínimo de 4,36 GiB de VRAM, cabe en GPU de gama media para procesar lotes de documentos en local.
- Preservación de marcas editoriales: el marcado `<illegible>`, `<strike>` y `<corr>` permite conservar tachados y correcciones en transcripciones diplomáticas.
- Integración en pipelines de gestión documental: la salida compacta (3,6× más corta que JSON) reduce coste de decodificación y facilita el parseo con la función oficial.
- Análisis de maquetación previo a OCR comercial: la detección con F1 de 95,42 % sirve como etapa de segmentación para motores OCR posteriores.

## Benchmarks y rendimiento

Evaluación sobre el split de test oficial de RUKOPYS v3 (382 imágenes, 8.616 regiones), decodificación greedy y resolución objetivo de 4.194.304 píxeles:

| Modelo | Resolucion | Composite ↑ | Page CER ↓ | Region CER ↓ | Det F1 ↑ | Class Acc ↑ |
|---|---|---|---|---|---|---|
| Karb-4B (BF16) | 4,19 MP | 94,55 % | 6,53 % | 4,83 % | 95,42 % | 99,07 % |
| Karb-4B (4032 px) | 4032 px | 94,43 % | 6,78 % | 4,75 % | 95,25 % | 99,15 % |
| Karb-4B (2560 px) | 2560 px | 94,37 % | 6,80 % | 4,91 % | 95,36 % | 98,81 % |
| Karb-4B (2048 px) | 2048 px | 94,19 % | 6,97 % | 5,20 % | 95,20 % | 98,99 % |
| Karb-4B (1568 px) | 1568 px | 92,13 % | 9,63 % | 7,56 % | 95,01 % | 99,14 % |

Comparativa de cuantización (RTX 5090, vLLM):

| Precision | Peso | VRAM minima | Latencia | Composite ↑ | Page CER ↓ |
|---|---|---|---|---|---|
| BF16 (16-bit) | 7,51 GiB | 9,29 GiB | 769 ms/pagina | 94,55 % | 6,53 % |
| FP8 (W8A8) | 4,18 GiB | 6,01 GiB | 547 ms/pagina | 94,46 % | 6,66 % |
| AWQ (W4A16) | 2,57 GiB | 4,36 GiB | 602 ms/pagina | 94,33 % | 6,78 % |

## Requisitos de hardware

- VRAM mínima estimada: 4,36 GiB para la variante AWQ (frente a 6,01 GiB en FP8 y 9,29 GiB en BF16).
- GPU recomendadas: RTX 5090 para los datos de latencia publicados; cualquier GPU con al menos 6 GiB de VRAM libre debería acomodar el checkpoint AWQ.
- Cabe en GPU de consumo: sí, con 4,36 GiB mínimos; tarjetas como RTX 4060 Ti, RTX 4070 o superiores son suficientes.
- Opciones de despliegue: vLLM (soporte nativo de `compressed-tensors` y Qwen3.5), Transformers ≥ 5.8.1 con `compressed-tensors` instalado.
- Latencia: 602 ms por página en RTX 5090 con vLLM, ligeramente superior al FP8 (547 ms) pero inferior al BF16 (769 ms).
- Requisito crítico: usar `skip_special_tokens=False` para no eliminar los tokens `<loc_*>` y `<t_*>`; mantener el `SYSTEM_PROMPT` exacto sin cambios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Karb-4B-AWQ | 4,03B | no disponible | OCR/HTR ucraniano + layout | Apache 2.0 | Hugging Face |
| Karb-4B (BF16) | 4,03B | no disponible | OCR/HTR ucraniano + layout | Apache 2.0 | Hugging Face |
| Karb-4B-FP8 | 4,03B | no disponible | OCR/HTR ucraniano + layout | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4B | no disponible | Modelo multimodal general | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos OCR comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental en investigación activa: el propio autor advierte de posibles errores de transcripción y de maquetación; verificar salidas en tareas críticas.
- Cobertura lingüística limitada a ucraniano e inglés; el rendimiento en otros idiomas o alfabetos no está documentado.
- Riesgo de alucinación en regiones ilegibles o degradadas; el marcado `<illegible>` ayuda a señalarlas, pero no las elimina.
- Sensible a la resolución de entrada: por debajo de 2048 px el CER de página sube del 6,97 % al 9,63 % (1568 px).
- La cuantización AWQ introduce una degradación mínima pero medible (composite 94,33 % frente a 94,55 % en BF16).
- Requiere Transformers ≥ 5.8.1 o una build reciente de vLLM con soporte de Qwen3.5; versiones anteriores pueden fallar.
- El uso de `skip_special_tokens=True` rompe el parseo de coordenadas y tipos de región.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni limitaciones adicionales del autor.
- No se han publicado resultados de sesgos; al estar entrenado sobre un corpus ucraniano específico, puede reflejar sesgos de ese dominio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Deelle/Karb-4B-AWQ
- Modelo base BF16: https://huggingface.co/Deelle/Karb-4B
- Variante FP8: https://huggingface.co/Deelle/Karb-4B-FP8
- Modelo Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset RUKOPYS: https://huggingface.co/datasets/UkrainianCatholicUniversity/rukopys
- Paper: pendiente de publicación ("Coming Soon")
- GitHub: pendiente de publicación ("Coming Soon")
- Colab: pendiente de publicación ("Coming Soon")
