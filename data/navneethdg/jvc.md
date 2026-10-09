# navneethdg/JVC

## Resumen

JVC (Joint Vision Cross-Attention) es un modelo de clasificación de vídeo entrenado específicamente para el reconocimiento fino de golpes de bádminton. Lo desarrollan Navneeth Dhamotharan y Bin Han y se presenta en el workshop de ECCV 2026 "Human Motion-Informed World Models and Socially Intelligent Action". El problema que aborda es el de clasificar el tipo de golpe (saque, clear, smash, drop, drive, net shot, lob, golpe defensivo u otros) a partir de un clip corto del momento del impacto, una tarea de grano fino donde las clases se confunden fácilmente por variaciones de postura, cámara y oclusión.

Técnicamente no es un modelo de lenguaje, sino un clasificador multimodal de vídeo: combina un codificador visual convolucional 3D R(2+1)D-18 sobre parches RGB con un codificador de esqueleto de cuatro flujos basado en SkateFormer sobre articulaciones de MediaPipe. La innovación central es un mecanismo de cross-attention en el que los tokens de esqueleto asisten a los parches visuales, seguido de bloques transformer de espacio-tiempo dividido y un pooling ponderado por el contacto. El checkpoint liberado tiene 128 dimensiones de embedding, 2 capas de cross-attention y 4 bloques de espacio-tiempo dividido.

Su relevancia actual reside en que demuestra que fusionar visión y pose de forma explícita mejora el reconocimiento de acciones deportivas de grano fino, y en que se publica con checkpoint, configuración y demo abiertos. El autor declara un 80,61 % de exactitud en `stroke_type` sobre el split de validación de FineBadminton-20K. El repositorio es pequeño (0,1 GB), acumula 31 descargas y la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Conv3D R(2+1)D-18 (RGB) + SkateFormer de cuatro flujos (esqueleto) + cross-attention conjunto vision-pose + transformer de espacio-tiempo dividido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de video; entrada fija de 16 fotogramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; la salida son etiquetas de clase de golpe) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch `.pth` (`jvc.pth`) mas `config.json` con arquitectura, nombres de etiquetas y metrica |
| Tarea | Clasificacion de video (`video-classification`), reconocimiento de golpes de badminton |
| Entrada visual | Tensor `(batch, 16, 3, 224, 224)` float RGB con normalizacion ImageNet (`mean = (0.485, 0.456, 0.406)`, `std = (0.229, 0.224, 0.225)`) |
| Entrada de esqueleto | Tensor `(batch, 16, 33, 3)` (MediaPipe, 33 articulaciones x, y, z) |
| Muestreo temporal | 16 fotogramas, `span_linspace` sobre el intervalo del impacto |
| Backbone visual | `r2plus1d_18` (conv3d) |
| Dimensión de embedding | 128 |
| Capas de cross-attention | 2 |
| Bloques de espacio-tiempo dividido | 4 |
| Numero de clases (`stroke_type`) | 9 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 31 / 0 |
| Fecha de creacion / actualizacion | 2026-10-09 |

Clases en orden de logit: `Serve`, `Clear`, `Smash`, `Drop`, `Drive`, `Net_Shot`, `Lob`, `Defensive_Shot`, `Other`.

## Arquitectura y entrenamiento

El modelo procesa un clip de 16 fotogramas centrado en el golpe mediante dos codificadores en paralelo. El primero es una red convolucional 3D R(2+1)D-18 que opera sobre parches RGB de 224x224; el segundo es un SkateFormer de cuatro flujos que consume las articulaciones de MediaPipe (33 puntos con coordenadas x, y, z). Los cuatro flujos del esqueleto corresponden a articulación, hueso, movimiento de articulación y movimiento de hueso, una descomposición habitual en el reconocimiento de acciones basado en esqueleto para capturar tanto postura como dinámica. Los tokens de esqueleto realizan cross-attention hacia los parches visuales, lo que permite que la información de pose module la representación visual. Después, una pila de cuatro bloques transformer de espacio-tiempo dividido mezcla la información del clip, y un pooling ponderado por el contacto alimenta varias cabezas multitarea.

El modelo emite logits (no probabilidades) para seis etiquetas: `stroke_type`, `technique`, `placement`, `position`, `intent` y `quality`. La metrica principal del articulo es la clasificacion de 9 vias de `stroke_type`. Las caracteristicas de volante (shuttle) están desactivadas en este checkpoint. El autor advierte que las ablaciones de JVC sin cross-attention son ejecuciones separadas y no corresponden a este archivo.

Los datos de entrenamiento son el conjunto FineBadminton-20K, con un split del 80/20 a nivel de vídeo y semilla 42, de modo que ningun clip de un vídeo de validación aparece en entrenamiento, lo que evita la fuga de datos entre fragmentos del mismo partido. La model card no especifica el número de tokens o clips vistos, la composición detallada del dataset ni si se emplearon etapas de RLHF o DPO (no aplicables en este tipo de modelo). Tampoco se documentan aumentos de datos ni recetas de optimización. El checkpoint liberado corresponde a la epoca 18.

## Capacidades

- Clasificacion de 9 tipos de golpe de badminton (`Serve`, `Clear`, `Smash`, `Drop`, `Drive`, `Net_Shot`, `Lob`, `Defensive_Shot`, `Other`) a partir de 16 fotogramas de video y la pose asociada.
- Salidas multitarea adicionales mediante logits para `technique`, `placement`, `position`, `intent` y `quality` (sin metricas publicadas para estas cabezas).
- Fusion multimodal explicita de RGB y esqueleto mediante cross-attention, lo que aporta robustez cuando una de las dos modalidades es ambigua.
- Procesamiento de clips cortos centrados en el impacto, adecuado para ventanas temporales de accion deportiva.
- Inferencia por lotes (`batch`) sobre tensores de video y pose ya preprocesados.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, no implementa agentes, no tiene modo de razonamiento (thinking mode) y no procesa audio ni lenguaje natural.

## Casos de uso

- Analisis tactico de partidos: alimentando clips de 16 fotogramas extraidos de un partido completo, el modelo etiqueta cada golpe y permite construir mapas de distribucion de tipos de golpe por jugador y por situacion de pista.
- Retransmision asistida: generacion automatica de graficos y estadisticas en directo (porcentaje de smashes, clears, drops) superponiendo las predicciones del modelo a la senal de video.
- Entrenamiento deportivo: analisis post-sesion de los golpes de un jugador para detectar desequilibrios (por ejemplo, exceso de golpes defensivos o escasez de variacion en el ataque) a partir de las etiquetas de `stroke_type` y `placement`.
- Scouting y analisis de rivales: procesado por lotes de grabaciones de adversarios para caracterizar patrones de golpeo y preparar planes de partido.
- Investigacion en reconocimiento de acciones: el checkpoint sirve como linea base reproducible (split a nivel de video, semilla fija) para comparar variantes sin cross-attention u otras arquitecturas de fusion vision-pose.
- Etiquetado semi-automatico de video deportivo: preanotacion masiva de clips con las nueve clases de golpe para acelerar la construccion de nuevos conjuntos de datos anotados.
- Aplicaciones de coaching movil: dado que el modelo trabaja con clips cortos y una entrada de esqueleto ligera, puede integrarse en un servicio que el jugador alimenta subiendo un clip corto, como hace la demo publica.
- Asistencia a la documentacion tecnica del deporte: generacion de informes estructurados por golpe a partir de las cabezas multitarea para federaciones o medios especializados.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Condiciones | Verificado |
|---|---|---|---|---|---|
| Reconocimiento de golpes de badminton | FineBadminton-20K | Val `stroke_type` accuracy | 80,61 % (epoca 18) | Split 80/20 a nivel de video, semilla 42 | No (declarado por el autor del modelo) |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No hay metricas declaradas para las cabezas `technique`, `placement`, `position`, `intent` ni `quality`, ni comparaciones numericas con modelos de terceros.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita. El repositorio completo ocupa 0,1 GB, por lo que el checkpoint es pequeno en terminos relativos y probablemente apto para GPU de consumo (estimacion orientativa, no confirmada por el autor).
- La entrada por clip es reducida: `(16, 3, 224, 224)` en float32 equivale aproximadamente a 9,6 MB por clip, lo que limita el coste de memoria de activaciones.
- GPU recomendadas: no disponible. Dado el tamano del checkpoint, cabe esperar que funcione en GPU de gama media, pero no hay datos publicados de latencia ni de throughput.
- Latencia y throughput: no disponible.
- Opciones de despliegue: el modelo se distribuye como checkpoint PyTorch (`jvc.pth`) mas `config.json`, por lo que la via prevista es inferencia con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros motores de servicio.
- La demo publica en `isocourt.fit` acepta la subida de un clip y devuelve la prediccion.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados comparables de otros modelos de reconocimiento de golpes de badminton ni de arquitecturas alternativas de fusion vision-pose sobre FineBadminton-20K, por lo que la comparativa numerica queda como no disponible.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JVC (`navneethdg/JVC`) | no disponible | 16 fotogramas + esqueleto MediaPipe | 80,61 % de exactitud en `stroke_type` (FineBadminton-20K, declarado) | no disponible | Checkpoint publico en HuggingFace |
| Ablaciones de JVC sin cross-attention | no disponible | 16 fotogramas + esqueleto MediaPipe | no disponible (son ejecuciones separadas, no publicadas en este repositorio) | no disponible | No publicadas |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: al no declararse una licencia en el repositorio, no hay autorizacion explicita para uso comercial. Conviene contactar con los autores antes de cualquier despliegue en produccion.
- Resultado no verificado: la exactitud de 80,61 % esta declarada por el autor y marcada como `verified: false` en el `model-index`. No hay una evaluacion independiente que la confirme.
- La metrica se calcula con una unica particion (80/20 a nivel de video, semilla 42). No se publican intervalos de confianza, validacion cruzada ni variacion entre semillas, por lo que la robustez del resultado es desconocida.
- Especializacion estrecha: el modelo solo reconoce las nueve clases de golpe de badminton definidas y no es transferible directamente a otros deportes ni a otras tareas de clasificacion de video sin reentrenamiento.
- Dependencia del preprocesado: requiere MediaPipe para extraer las 33 articulaciones y un muestreo temporal concreto (`span_linspace` sobre el intervalo del impacto). Cambios en este preprocesado pueden degradar el rendimiento de forma significativa.
- No ofrece probabilidades calibradas: las cabezas devuelven logits, de modo que cualquier umbral de confianza debe ajustarse con un paso de calibracion previo (por ejemplo, softmax con temperatura o calibracion isotonica).
- Riesgo de confusion entre clases con cinematica parecida (por ejemplo, drop frente a net shot, o clear frente a lob), especialmente con oclusiones, camaras lejanas o angulos poco habituales.
- No hay informacion sobre sesgos del conjunto de datos: se desconoce la distribucion de genero, nivel de juego, tipo de pista, iluminacion y paises representados en FineBadminton-20K, lo que impide evaluar sesgos sistematicos.
- Multilingue y capacidades de lenguaje: no aplica; el modelo no procesa texto ni idiomas.
- Las cabezas multitarea (`technique`, `placement`, `position`, `intent`, `quality`) no tienen metricas publicadas, por lo que su fiabilidad en produccion es desconocida.
- El modelo no incluye caracteristicas del volante (shuttle); el propio autor confirma que estan desactivadas en este peso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/navneethdg/JVC
- Dataset FineBadminton-20K: https://huggingface.co/datasets/Moujuruo/Finebadminton-20K
- Paper (OpenReview, foro): https://openreview.net/forum?id=XJEhcXfwEe
- Paper (PDF): https://openreview.net/pdf?id=XJEhcXfwEe
- Demo: https://isocourt.fit
- Descarga del checkpoint: `hf_hub_download("navneethdg/JVC", "jvc.pth")`
