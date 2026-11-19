# keniel123/cadence

## Resumen

CADENCE es un conjunto de pesos para la recuperación de malla corporal completa (whole-body human mesh recovery) a partir de vídeo, desarrollado por Peart, Chauhan, Bodala y Vishwakarma en la Universidad de Southampton. El modelo estima parámetros del cuerpo SMPL-X de forma temporalmente coherente, con especial énfasis en preservar el movimiento expresivo de las manos, un aspecto que los estimadores por fotograma suelen perder. Se distribuye como tres artefactos de pesos independientes que cubren la estimación por fotograma, una ruta dedicada de alta resolución para las manos y un refinador temporal.

La relevancia del modelo radica en su enfoque multi-etapa: parte de un backbone visual C-RADIOv4-SO400M de NVIDIA (descargado en tiempo de carga, no redistribuido) sobre el que aplica adaptaciones de bajo rango (rank-32) y una LoRA específica para manos, y remata con un refinador temporal ligero (7,5 MB) que impone coherencia cinemática entre fotogramas. Esto lo hace adecuado para tareas donde el detalle manual importa, como el análisis de lengua de signos, citado explícitamente entre sus etiquetas.

El repositorio ocupa 0,3 GB y la licencia es estrictamente de investigación no comercial (`cadence-research-only`), condicionada por las licencias de los datasets de entrenamiento (AGORA, BEDLAM, UBody) y del modelo corporal SMPL-X. El código es MIT, pero los pesos no.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa sobre backbone visual C-RADIOv4-SO400M con adaptaciones de bajo rango (rank-32) y LoRA; estimador SMPL-X por fotograma + ruta de manos + refinador temporal |
| Parametros totales | no disponible (pesos distribuidos en tres ficheros: 260 MB, 74 MB y 7,5 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión sobre vídeo; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `cadence-research-only` (solo investigación no comercial); código MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

CADENCE se organiza en tres etapas. La primera, `cadence_per_frame.pt` (260 MB), contiene un estimador whole-body SMPL-X por fotograma con su decodificador, proyecciones y los factores de rango 32 de la adaptación final sobre C-RADIOv4. La segunda, `hand_pathway.pt` (74 MB), implementa una ruta de alta resolución para las manos junto con una LoRA sobre un backbone específico de manos. La tercera, `temporal_refiner.pt` (7,5 MB), es un refinador temporal multi-tasa, consciente de la cinemática y adaptativo al contenido, que suaviza y da coherencia a la secuencia de parámetros estimados.

El backbone C-RADIOv4-SO400M se obtiene de NVIDIA vía `torch.hub` en tiempo de carga y no se redistribuye en el repositorio. El entrenamiento emplea datasets como AGORA, BEDLAM y UBody, y depende del modelo corporal SMPL-X, que debe descargarse por separado desde el sitio oficial de MPI. No se han publicado en la información disponible detalles sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Recuperación de malla corporal completa SMPL-X a partir de vídeo (cuerpo, manos y rostro según el modelo SMPL-X).
- Coherencia temporal entre fotogramas gracias al refinador cinemático multi-tasa.
- Preservación de movimiento expresivo de manos mediante una ruta dedicada de alta resolución con LoRA.
- Procesamiento de vídeo (pipeline `other`, orientado a secuencias, no a imagen suelta).
- Aplicable a análisis de lengua de signos (etiqueta explícita en el repositorio).
- No soporta tool calling, function calling, agentes ni generación de texto: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica / no disponible.

## Casos de uso

- Análisis de lengua de signos: el modelo está diseñado para preservar el detalle de las manos, crítico en la comunicación signada, y el refinador temporal mantiene la coherencia de los gestos a lo largo del vídeo.
- Captura de movimiento para animación: extraer secuencias SMPL-X temporalmente estables de vídeo monoculo para driving de avatares o personajes, aprovechando la coherencia entre fotogramas del refinador.
- Rehabilitación y análisis clínico del movimiento: seguimiento de la cinemática de manos y cuerpo en grabaciones de ejercicios, donde la ruta de manos de alta resolución aporta precisión en articulaciones distales.
- Interacción persona-ordenador basada en gestos: alimentar sistemas de control por gestos que requieren estimación robusta de la pose de manos en secuencias de vídeo.
- Investigación en visión por computador: base para estudios de whole-body mesh recovery y comparación de métodos temporales, dado que los pesos son de uso exclusivamente investigador.
- Telepresencia y realidad virtual: reconstrucción de la pose corporal completa del usuario a partir de cámara RGB para avatares en tiempo (no) real, condicionado a la latencia del pipeline.
- Anotación asistida de datasets de pose: generar pseudo-etiquetas SMPL-X coherentes en vídeo para preentrenar o aumentar datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos suman aproximadamente 342 MB en precisión original, más el backbone C-RADIOv4-SO400M descargado aparte, que domina el consumo de memoria.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del backbone visual, se espera que quepa en GPUs de consumo modernas, pero no hay datos confirmados.
- ¿Cabe en GPU de consumo? Probable, dado el tamaño reducido de los pesos, aunque no se especifica el consumo del backbone ni el del procesamiento de vídeo.
- Opciones de despliegue: script oficial `demo/run_video.py` del repositorio de GitHub; requiere PyTorch y descarga de pesos vía `scripts/download_weights.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque temporal | Manos de alta resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CADENCE | Whole-body HMR (SMPL-X) | Sí (refinador multi-tasa) | Sí (ruta dedicada + LoRA) | Solo investigación | Pesos en HF + código MIT |
| Modelos HMR por fotograma (genéricos) | Whole-body HMR | No | Variable | Variable | no disponible |
| Alternativas comparables concretas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados numéricos ni de modelos comparables identificados con datos verificables; la comparativa queda limitada a las características arquitectónicas descritas.

## Limitaciones y advertencias

- Licencia estrictamente de investigación no comercial: los pesos no pueden usarse en productos comerciales, condicionado por las licencias de AGORA, BEDLAM, UBody y SMPL-X.
- SMPL-X debe descargarse por separado y aceptar su propia licencia; sin él el modelo no es funcional.
- El backbone C-RADIOv4-SO400M se descarga de NVIDIA en tiempo de carga; su disponibilidad y licencia son externas a este repositorio.
- No hay información sobre sesgos del modelo, rendimiento en distintos grupos demográficos ni robustez ante oclusiones.
- Riesgo de error en escenas con oclusiones severas, múltiples personas o cámaras no calibradas: no documentado, pero habitual en HMR monoculo.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes.
- Sin benchmarks publicados en la información disponible, por lo que no es posible validar cuantitativamente su calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/keniel123/cadence
- Código: https://github.com/keniel123/cadence
- Página del proyecto: https://keniel123.github.io/cadence
- Paper: arXiv (anunciado como "coming soon", sin enlace disponible)
- Licencia (referencia en GitHub): https://github.com/keniel123/cadence#license
- SMPL-X: https://smpl-x.is.tue.mpg.de
