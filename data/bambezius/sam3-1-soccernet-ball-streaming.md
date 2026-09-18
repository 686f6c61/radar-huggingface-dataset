# bambezius/sam3.1-soccernet-ball-streaming

## Resumen

bambezius/sam3.1-soccernet-ball-streaming es un ajuste fino (fine-tuning) de bambezius sobre facebook/sam3.1, el modelo de segmentación de vídeo de Meta. No se trata de un modelo completo ni de un checkpoint predictor autónomo: el repositorio contiene únicamente los componentes de seguimiento entrenados para la tarea específica de rastrear el balón en vídeo de fútbol, presumiblemente a partir del corpus SoccerNet. Los pesos del codificador de imagen original están congelados y no se duplican en este repositorio, por lo que para usarlo es imprescindible descargar aparte el checkpoint original de facebook/sam3.1, que está sujeto a acceso restringido (gated) y a su propio acuerdo de licencia.

El modelo aborda un problema clásico y difícil en visión por computador deportiva: mantener la identidad y la posición del balón a lo largo de un clip de vídeo, donde el objeto es pequeño, rápido, frecuentemente ocluido y visualmentesimilar al fondo. Para ello emplea un esquema de memoria espacial transportada (fotograma inicial más seis fotogramas recientes), punteros de objeto (fotograma inicial más quince recientes) y ventanas de gradiente de 16 fotogramas, con una única caja de inicialización por clip. Es relevante ahora porque SAM 3.1 es una base reciente y potente para segmentación de vídeo, y este tipo de ajustes específicos de dominio permiten evaluar hasta qué punto la arquitectura generaliza a dominios con objetos pequeños y movimiento rápido.

El repositorio es pequeño (0,3 GB) y contiene dos ficheros de checkpoint PyTorch: `best.pt` (seleccionado por mínima pérdida de validación) y `last.pt` (estado de reanudación con optimizador, RNG, época y early stopping). No hay métricas publicadas ni benchmarks en la información disponible, y el modelo cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; deriva de facebook/sam3.1 (segmentación de vídeo). Componentes de seguimiento con memoria espacial y punteros de objeto |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. Memoria espacial: fotograma inicial + 6 recientes; punteros de objeto: fotograma inicial + 15 recientes; ventanas de gradiente de 16 fotogramas |
| Tipos de cuantización | No disponible (solo se distribuyen checkpoints `.pt`) |
| Idiomas soportados | No disponible (modelo de visión; no procesa texto) |
| Licencia | SAM License (licencia `other`, con `license_name: sam-license` y `license_link: LICENSE`) |
| Formato de pesos | PyTorch (`.pt`, checkpoints serializados con pickle: `best.pt` y `last.pt`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de indicar que se apoya en facebook/sam3.1, un modelo de segmentación de vídeo de Meta. Lo específico de este ajuste es el mecanismo de seguimiento: se inicializa con una única caja por clip y se transporta memoria espacial (fotograma inicial más seis fotogramas recientes), junto con punteros de objeto (fotograma inicial más quince fotogramas recientes). El entrenamiento emplea ventanas de gradiente de 16 fotogramas. El codificador de imagen permanece congelado y sus pesos no se redistribuyen en este repositorio.

Un detalle relevante para interpretar los resultados: los objetivos de entrenamiento son pseudo-máscaras circulares derivadas de cajas, no segmentaciones manuales. Las anotaciones ausentes y los fotogramas sin inicialización válida se excluyen del cálculo de pérdida y métricas. El proceso de selección del mejor checkpoint se basa en la mínima pérdida de validación, con paciencia de tres épocas sin mejora. No se especifica en la información proporcionada el número de tokens o fotogramas de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (poco probables en un modelo de segmentación).

## Capacidades

- Seguimiento de objetos en vídeo: rastrea un objeto a lo largo de un clip a partir de una única caja de inicialización.
- Segmentación de vídeo por objeto (video object segmentation) aplicada específicamente al balón de fútbol.
- Memoria espacial de corto plazo: mantiene la referencia del objeto combinando el fotograma inicial con seis fotogramas recientes.
- Punteros de objeto de mayor alcance temporal: usa el fotograma inicial más quince fotogramas recientes.
- Entrenamiento por ventanas temporales de 16 fotogramas con cómputo de gradiente.
- Reanudación de entrenamiento: `last.pt` incluye estado de optimizador, RNG, época y early stopping.
- Exportación a la API de inferencia oficial: script `scripts/export_sam31_checkpoint.py` para fusionar con la base fijada.
- No se documentan capacidades de tool calling, agentes, texto, código, matemáticas, audio ni multilingüismo, al ser un modelo puramente visual.

## Casos de uso

- Seguimiento del balón en retransmisión deportiva: dado un clip de fútbol y una caja inicial sobre el balón, el modelo mantiene su posición fotograma a fotograma, lo que permite superponer gráficos o estadísticas en emisión en directo.
- Analítica táctica y de posesión: al rastrear el balón de forma continua se puede reconstruir su trayectoria para calcular zonas de mayor actividad, tiempos de posesión por equipo o patrones de circulación.
- Pseudo-etiquetado para ampliar datasets: sus salidas pueden emplearse como etiquetas preliminares en un corpus mayor de vídeo de fútbol, siempre que se validen manualmente por tratarse de pseudo-máscaras circulares derivadas de cajas.
- Investigación en el benchmark SoccerNet: el ajuste está orientado a este corpus, por lo que resulta un punto de partida para experimentos académicos de seguimiento de objetos pequeños y rápidos.
- Revisión asistida de jugadas: la trayectoria reconstruida del balón puede servir de apoyo documental en revisiones posteriores (por ejemplo, análisis de fuera de juego o de salidas de banda), sin sustituir al criterio arbitral.
- Producción de contenido aumentado: generación de repeticiones con resaltado automático del balón, diagramas de trayectoria o clips anotados para programas de análisis.
- Análisis de rendimiento y scouting: combinado con detección de jugadores, el seguimiento del balón permite estudiar interacciones y decisiones en contextos concretos de partido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (IoU, J&F, precisión de seguimiento, etc.) ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- El repositorio pesa 0,3 GB e incluye únicamente los componentes de seguimiento (`best.pt`, `last.pt`); no contiene el codificador de imagen congelado.
- Es imprescindible descargar aparte el checkpoint de facebook/sam3.1 desde su repositorio con acceso restringido y aceptar previamente su acuerdo de licencia.
- VRAM estimada para inferencia: no disponible. Al no conocer el número de parámetros del modelo base ni del ajuste, no puede ofrecerse una cifra fiable.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: los scripts incluidos apuntan a un flujo propio (`scripts/train_sam31_streaming.py` para reanudar entrenamiento y `scripts/export_sam31_checkpoint.py` para exportar y fusionar con la base y usar la API de inferencia oficial). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto (memoria) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bambezius/sam3.1-soccernet-ball-streaming | Ajuste fino objeto de esta ficha | No disponible | Inicial + 6 fotogramas (memoria espacial), inicial + 15 (object pointers) | SAM License | Público, requiere base gated |
| facebook/sam3.1 | Modelo base sobre el que se ajusta | No disponible en la información proporcionada | No disponible | SAM License | Acceso restringido (gated) |
| Otros modelos de segmentación de vídeo (por ejemplo, la familia SAM 2) | Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un predictor autónomo: requiere el checkpoint original de facebook/sam3.1, sujeto a acceso restringido y a un acuerdo de licencia independiente.
- Los pesos del codificador de imagen no se redistribuyen; sin la base no hay inferencia posible.
- Los checkpoints están serializados con pickle; el propio autor advierte de cargarlos únicamente desde fuentes de confianza.
- Los objetivos de entrenamiento son pseudo-máscaras circulares derivadas de cajas, no segmentaciones manuales, lo que limita la calidad y el realismo de las máscaras predichas.
- Es un ajuste específico de dominio (fútbol, presumiblemente SoccerNet); su comportamiento fuera de ese dominio no está documentado y probablemente degrade.
- Requiere una caja de inicialización manual por clip; no se documenta detección automática del balón.
- Riesgo de deriva del seguimiento en oclusiones prolongadas, cambios de plano o balones fuera de cuadro, no cuantificado en la información disponible.
- Las anotaciones ausentes se excluyen de pérdida y métricas, lo que puede enmascarar el rendimiento real en tramos con etiquetado incompleto.
- Los medios y anotaciones del dataset no se redistribuyen; siguen aplicando los términos del dataset original.
- Licencia SAM License: es necesario revisar sus términos antes de cualquier uso comercial.
- Con 0 descargas y 0 likes, no existe validación independiente ni reportes de terceros sobre su comportamiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambezius/sam3.1-soccernet-ball-streaming
- Modelo base: https://huggingface.co/facebook/sam3.1
- Licencia incluida en el repositorio: LICENSE (referenciada como `license_link` en la model card)
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada.
