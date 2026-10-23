# EverPaper/everparakeet-tdt-0.6b-v3-mini

# EverParakeet Mini: parakeet-tdt-0.6b-v3 en el Neural Engine de Apple

## Resumen

EverParakeet Mini es el escalón más pequeño de la familia EverParakeet, un port del modelo de reconocimiento de voz automático (ASR) `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA al Neural Engine de Apple. Lo publica EverPaper (everpaper.app) como artefacto para Core ML (macOS 15 o posterior) y Core AI (macOS 27), con el encoder cuantizado mediante paletas mixtas de 2 y 4 bits aprendidas durante el ajuste fino: 141 de las 240 capas paletizadas están a 2 bits y 99 a 4 bits. El modelo conserva la arquitectura y el tokenizador originales de NVIDIA; el autor atribuye explícitamente a NVIDIA todo el crédito por el modelo, el tokenizador y el entrenamiento multilingüe.

El problema que resuelve es la inferencia ASR local en hardware Apple sin GPU dedicada ni servicios en la nube: con 0,6 mil millones de parámetros y un repositorio de 0,6 GB, ofrece transcripción en 25 idiomas europeos ejecutándose íntegramente en el Neural Engine. Frente a las otras variantes de la familia (Standard y Compact), Mini es la que menor huella ocupa y, según las propias mediciones del autor, también la menos precisa.

Es relevante ahora por dos motivos. Primero, porque demuestra una ruta práctica de cuantización agresiva (2 bits en la mayoría de capas del encoder) sobre un transductor TDT sin destruir la calidad de forma catastrófica: 14,10 % de WER medio en FLEURS-25 frente al 12,85 % de Compact y el 11,97 % que publica NVIDIA con su propia normalización de texto. Segundo, porque su etiqueta `experimental` es honesta: el autor lo publica para quien necesite la huella mínima o investigue encoders de baja precisión, y recomienda Standard o Compact para uso general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (token-and-duration transducer) de NVIDIA Parakeet v3, encoder cuantizado con paletas mixtas de 2 y 4 bits; empaquetado como Core ML (macOS 15+) y Core AI (macOS 27) |
| Parametros totales | 0,6 B (según denominación del modelo base `parakeet-tdt-0.6b-v3`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; la información proporcionada no documenta la duración máxima de audio ni la ventana de contexto) |
| Tipos de cuantizacion | Paletas mixtas de 2 y 4 bits en el encoder: 141 de 240 capas paletizadas a 2 bits, 99 a 4 bits. La familia incluye además una variante Standard de 4 bits y pesos bf16 para MLX |
| Idiomas soportados | 25: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Paquete Core ML y asset Core AI (no safetensors ni GGUF). El repositorio base de la familia ofrece `.nemo` y transformers en precisión completa, y bf16 para MLX |

## Arquitectura y entrenamiento

El modelo base es `nvidia/parakeet-tdt-0.6b-v3`, un transductor TDT: en lugar de predecir solo el siguiente token, el decodificador emite conjuntamente un token y una duración, lo que permite avanzar varios frames de audio por paso de decodificación y reduce el coste de inferencia frente a un CTC o un transductor convencional. La información disponible no detalla la composición exacta del encoder, el número de capas ni la configuración del decodificador y de la red conjunta, más allá de la estructura de capas paletizadas del encoder (240 capas paletizadas en total).

El trabajo de EverPaper consiste en un ajuste fino con cuantización con paletas aprendidas (mixed 2-bit / 4-bit) y la conversión a Core ML y Core AI para su ejecución en el Neural Engine. El autor advierte de que los datos de ajuste fino incluyeron el split de entrenamiento de FLEURS, por lo que parte de la mejora en ese benchmark es in-domain y no se trasladará íntegramente a audio de otras condiciones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en ASR).

La innovación técnica destacable es la cuantización mixta por capas: en lugar de aplicar una precisión uniforme, se asignan paletas de 2 o 4 bits capa a capa, lo que permite reducir el tamaño del artefacto manteniendo el WER dentro de un margen razonable (14,10 % frente a 12,85 % de Compact y 13,39 % de Standard v1.1 en FLEURS-25).

## Capacidades

- Reconocimiento de voz multilingüe en 25 idiomas europeos, con detección implícita del idioma por parte del modelo (no se documenta un parámetro explícito de selección de idioma).
- Transcripción de audio a texto con decodificación TDT, que emite tokens y duraciones de forma conjunta.
- Ejecución local en el Neural Engine de Apple Silicon, sin conexión a red ni envío de audio a servidores externos.
- Dos rutas de despliegue en Apple: paquete Core ML para macOS 15 o posterior y asset Core AI para macOS 27.
- Variante MLX (bf16) disponible en otro repositorio de la familia para ejecución en GPU mediante MLX.
- No se documentan en la información disponible capacidades de puntuación, mayúsculas, marcas de tiempo, diarización de hablantes, detección de idioma explícita ni traducción.

## Casos de uso

- Dictado totalmente offline en macOS: el modelo se integra como paquete Core ML en una aplicación nativa y transcribe la voz del usuario en el Neural Engine, sin que el audio abandone el equipo, lo que simplifica el cumplimiento de RGPD en entornos corporativos.
- Subtitulado de vídeo en 25 idiomas europeos: dado su WER bajo en italiano (3,24 %), español (3,77 %), portugués (5,12 %) y francés (6,10 %) en FLEURS, es adecuado para generar subtítulos automáticos de contenido en lenguas romances con revisión humana ligera.
- Transcripción de reuniones y notas de voz: al ejecutarse en local y con una huella de 0,6 GB, puede mantenerse cargado en segundo plano en un Mac portátil para transcribir conversaciones sin coste por minuto ni latencia de red.
- Indexación y búsqueda de archivos de audio y pódcast: procesar por lotes un archivo histórico de audio en un Mac y volcar las transcripciones a un índice de texto para búsqueda posterior.
- Accesibilidad: subtitulado en vivo de conversaciones presenciales o de contenido multimedia para personas con discapacidad auditiva, con la ventaja de que no requiere conectividad.
- Investigación sobre encoders de baja precisión: el modelo sirve como referencia reproducible para estudiar el impacto de paletas de 2 y 4 bits por capa en un transductor TDT, comparando contra las variantes Standard y Compact de la misma familia.
- Prototipado de aplicaciones de voz en el ecosistema Apple: al estar empaquetado como Core ML, se integra directamente en Xcode sin necesidad de servidores GPU ni de dependencias de Python en producción.

## Benchmarks y rendimiento

FLEURS test, media de 25 idiomas (WER %, menor es mejor). Todas las cifras de EverParakeet están medidas por el autor con un único Mac, el mismo harness y el mismo normalizador de texto.

| Modelo | WER medio FLEURS-25 (%) |
|---|---|
| EverParakeet v1.0 | 13,75 |
| EverParakeet Standard v1.1 | 13,39 |
| EverParakeet Compact | 12,85 |
| EverParakeet Mini (experimental) | 14,10 |
| FluidAudio Parakeet v3 Core ML | 13,59 |
| EverParakeet v1.1 MLX (bf16) | 12,78 (control MLX original: 13,23) |
| NVIDIA publicado | 11,97 (normalización propia de NVIDIA, no comparable uno a uno) |

English Open ASR Leaderboard, media de 9 conjuntos públicos (WER %):

| Modelo | WER medio (%) |
|---|---|
| EverParakeet v1.0 (decoder corregido) | 5,80 |
| EverParakeet Standard v1.1 | 5,72 |
| EverParakeet Compact | 5,85 |
| EverParakeet Mini (experimental) | 6,23 |
| FluidAudio Parakeet v3 Core ML | 5,83 |
| EverParakeet v1.1 MLX (bf16) | 5,56 (control MLX original: 5,60) |
| NVIDIA original (cifra publicada en el leaderboard) | 5,58 |

Desglose por conjunto del English Open ASR Leaderboard (WER %; la información disponible está truncada y no incluye las columnas finales de LS Other ni las filas de media):

| Conjunto | v1.0 | Standard v1.1 | Compact | Mini | FluidAudio v3 Core ML | v1.1 MLX | MLX original |
|---|---|---|---|---|---|---|---|
| AMI-Cleaned | 9,33 | 9,16 | 8,97 | 9,38 | 9,87 | 8,92 | 9,14 |
| Earnings22-Cleaned-AA-chunked | 6,69 | 6,74 | 7,11 | 8,02 | 6,80 | 6,64 | 6,07 |
| Gigaspeech-Cleaned | 8,05 | 7,87 | 7,97 | 8,06 | 8,01 | 7,86 | 8,00 |
| LS Clean | 1,59 | 1,56 | 1,57 | 1,75 | 1,63 | 1,49 | 1,48 |
| LS Other | 3,36 | 3,40 | 3,53 | 3,89 | 3,40 | 3,15 | no disponible |

Desglose por idioma en FLEURS (WER %):

| Idioma | v1.0 | Standard v1.1 | Compact | Mini | NVIDIA publicado (no comparable) |
|---|---|---|---|---|---|
| Búlgaro (bg) | 14,21 | 13,77 | 12,72 | 13,77 | 12,64 |
| Croata (hr) | 13,32 | 12,93 | 12,41 | 13,60 | 12,46 |
| Checo (cs) | 12,12 | 11,66 | 11,14 | 12,23 | 11,01 |
| Danés (da) | 20,08 | 19,51 | 18,98 | 20,91 | 18,41 |
| Neerlandés (nl) | 8,04 | 8,13 | 7,86 | 9,11 | 7,48 |
| Inglés (en) | 5,55 | 5,45 | 5,49 | 5,94 | 4,85 |
| Estonio (et) | 19,15 | 18,16 | 17,32 | 18,66 | 17,73 |
| Finés (fi) | 14,52 | 14,09 | 13,25 | 14,50 | 13,21 |
| Francés (fr) | 5,42 | 5,59 | 5,60 | 6,10 | 5,15 |
| Alemán (de) | 5,39 | 5,46 | 5,38 | 6,09 | 5,04 |
| Griego (el) | 36,64 | 35,13 | 34,94 | 36,87 | 20,70 |
| Húngaro (hu) | 18,25 | 17,39 | 16,41 | 18,28 | 15,72 |
| Italiano (it) | 2,99 | 2,94 | 3,08 | 3,24 | 3,00 |
| Letón (lv) | 25,42 | 25,30 | 23,41 | 26,50 | 22,84 |
| Lituano (lt) | 23,00 | 22,08 | 20,21 | 22,48 | 20,35 |
| Maltés (mt) | 22,48 | 22,16 | 20,74 | 22,75 | 20,46 |
| Polaco (pl) | 8,25 | 8,03 | 7,76 | 9,21 | 7,31 |
| Portugués (pt) | 4,98 | 4,74 | 4,77 | 5,12 | 4,76 |
| Rumano (ro) | 14,08 | 13,74 | 13,00 | 14,76 | 12,44 |
| Eslovaco (sk) | 9,88 | 9,46 | 9,14 | 10,25 | 8,82 |
| Esloveno (sl) | 25,98 | 25,92 | 25,54 | 26,90 | 24,03 |
| Español (es) | 3,57 | 3,51 | 3,47 | 3,77 | 3,45 |
| Sueco (sv) | 16,73 | 16,33 | 15,89 | 16,85 | 15,08 |
| Ruso (ru) | 5,82 | 5,73 | 5,69 | 6,52 | 5,51 |
| Ucraniano (uk) | 7,84 | 7,53 | 7,13 | 8,00 | 6,79 |
| Media (25) | 13,75 | 13,39 | 12,85 | 14,10 | 11,97 |

## Requisitos de hardware

- VRAM: no aplica. El modelo se ejecuta en el Neural Engine (ANE) de Apple Silicon; no hay cifras de VRAM porque no usa GPU discreta.
- Huella de almacenamiento: el repositorio ocupa 0,6 GB, lo que da una idea del orden de magnitud del peso del artefacto y del consumo de memoria al cargarlo.
- GPU recomendadas: no procede. Para ejecución en GPU dentro del ecosistema Apple existe la variante `everparakeet-tdt-0.6b-v3-mlx` en bf16 mediante MLX; para CUDA o ROCm no hay artefacto publicado en la información disponible.
- Compatibilidad de sistema: Core ML requiere macOS 15 o posterior; Core AI requiere macOS 27. No hay soporte documentado para iOS, iPadOS, Linux ni Windows.
- Cabe en hardware de consumo: sí, siempre que sea un Mac con Apple Silicon y la versión de macOS adecuada. No se especifican en la información disponible los chips mínimos recomendados (M1, M2, M3, M4) ni el rendimiento por generación.
- Opciones de despliegue: Core ML, Core AI, MLX (variante bf16) y, para la variante en precisión completa, `.nemo` y transformers de Hugging Face. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y su formato no es GGUF.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni factores de tiempo real (RTF) para ninguna variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER FLEURS-25 (%) | WER English sets (%) | Licencia | Ejecución |
|---|---|---|---|---|---|---|
| EverParakeet Mini (este modelo) | 0,6 B | 25 | 14,10 | 6,23 | CC-BY-4.0 | Neural Engine (Core ML / Core AI) |
| EverParakeet Standard v1.1 | 0,6 B | 25 | 13,39 | 5,72 | CC-BY-4.0 | Neural Engine (Core ML / Core AI), encoder 4 bits |
| EverParakeet Compact | 0,6 B | 25 | 12,85 | 5,85 | CC-BY-4.0 | Neural Engine, encoder mixto 2/4 bits |
| EverParakeet v1.1 MLX (bf16) | 0,6 B | 25 | 12,78 | 5,56 | CC-BY-4.0 | GPU mediante MLX |
| FluidAudio Parakeet v3 Core ML | 0,6 B | 25 | 13,59 | 5,83 | no disponible en la información proporcionada | Core ML |
| NVIDIA parakeet-tdt-0.6b-v3 (original) | 0,6 B | 25 | 11,97 (normalización propia, no comparable) | 5,58 | no disponible en la información proporcionada | GPU / CPU con NeMo o transformers |

Dentro de la propia familia, Mini es la opción con menor huella y peor precisión: pierde 0,71 puntos de WER en FLEURS-25 respecto a Standard v1.1 y 1,25 respecto a Compact. La variante MLX en bf16 es la más precisa de todas las publicadas por EverPaper en ambos benchmarks, a costa de renunciar al Neural Engine.

## Limitaciones y advertencias

- Marcado explícitamente como experimental por el autor, que recomienda Standard o Compact para uso general. No debe tratarse como un modelo de producción sin validación previa.
- Coste de precisión visible: 14,10 % de WER medio en FLEURS-25 y 6,23 % en los conjuntos ingleses del Open ASR Leaderboard, ambos peores que v1.0, Standard y Compact.
- Fuerte variación por idioma: griego (36,87 %), esloveno (26,90 %), letón (26,50 %), maltés (22,75 %) y lituano (22,48 %) presentan tasas de error muy altas, poco aptas para producción sin corrección posterior. En el extremo opuesto, italiano (3,24 %), español (3,77 %), portugués (5,12 %), inglés (5,94 %) y alemán (6,09 %) son utilizables.
- Posible fuga de dominio en FLEURS: el ajuste fino incluyó el split de entrenamiento de FLEURS, de modo que parte de la ventaja medida en ese benchmark no se trasladará a audio real de otras condiciones. El propio autor lo advierte.
- Comparaciones no homogéneas: las cifras de NVIDIA usan su propio normalizador de texto y no son comparables uno a uno con las de EverPaper. La model card renuncia explícitamente a afirmar que supera al modelo original.
- Dependencia de plataforma: requiere macOS 15 o posterior (Core ML) o macOS 27 (Core AI) y Apple Silicon. No hay ruta de despliegue en Linux, Windows, CUDA ni ROCm dentro de la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución. Es necesario citar adecuadamente a EverPaper y a NVIDIA, y conservar el aviso de licencia; no hay cláusulas de uso aceptable adicionales documentadas.
- Riesgo de alucinación específico de ASR: en audio con ruido, acentos no nativos, solapamiento de hablantes o vocabulario técnico, un WER alto se traduce en sustituciones e inserciones de palabras plausibles pero incorrectas, especialmente en los idiomas con WER superior al 20 %.
- Sin datos sobre sesgos: la información disponible no incluye evaluaciones de sesgo por acento, género, edad ni variedad dialectal.
- Sin datos operativos: no hay cifras publicadas de latencia, throughput, consumo energético ni comportamiento con audio de larga duración.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el mismo día (23 de octubre de 2026) y un único publicador. No hay evidencia de uso en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/EverPaper/everparakeet-tdt-0.6b-v3-mini
- Modelo base en NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Variante Standard (Core AI y Core ML): https://huggingface.co/EverPaper/everparakeet-tdt-0.6b-v3-coreai
- Variante Compact: https://huggingface.co/EverPaper/everparakeet-tdt-0.6b-v3-compact
- Variante MLX (bf16): https://huggingface.co/EverPaper/everparakeet-tdt-0.6b-v3-mlx
- Variante en precisión completa (`.nemo` y transformers): https://huggingface.co/EverPaper/everparakeet-tdt-0.6b-v3
- Sitio del autor: https://everpaper.app

Nota: la búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo, con Parakeet, con Core ML ni con reconocimiento de voz; los enlaces anteriores proceden exclusivamente de la información de Hugging Face y de la model card. No hay papers, blogs técnicos, repositorios de código ni demos adicionales disponibles.
