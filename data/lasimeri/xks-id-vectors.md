# Lasimeri/xks-id-vectors

## Resumen

xks-id decision vectors es un conjunto de artefactos derivados del modelo LiquidAI/d1-2B, publicado por el usuario Lasimeri. No es un modelo de lenguaje en sentido estricto, sino una tabla de vectores de decisión precalculados que permite a xks-id, un motor heurístico de detección de intrusiones para inyección de prompt en entornos de agentes de IA, puntuar salidas de herramientas en CPU sin ejecutar el modelo ni requerir GPU.

El paquete contiene una tabla de 128.000 filas de 2.048 floats de precisión simple (el estado oculto final del modelo d1-2B en la última posición del prompt cuando el estado es un único token del vocabulario), un bundle de tokenizador, una cabeza lineal que convierte el vector agrupado de una ventana de 64 tokens en el logit sí-menos-no del modelo, y los logits por token para reproducción. La pregunta que responde cada vector es si el texto contiene instrucciones dirigidas a un asistente o agente de IA, como ignorar instrucciones previas, cambiar de rol, ocultar información al usuario o ejecutar acciones no solicitadas.

Es relevante porque ofrece una vía de bajo coste computacional para incorporar señal de un modelo de 2.000 millones de parámetros en un motor de detección basado en reglas, sin necesidad de infraestructura de inferencia. El autor documenta explícitamente sus límites: los vectores ordenan bien el texto, pero son débiles como detector autónomo con tasas bajas de falsos positivos, porque la media de vectores de token no captura el orden de las palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de decisión derivados de un transformer (LiquidAI/d1-2B); tabla de estados ocultos finales por token de vocabulario |
| Parametros totales | No disponible (los artefactos no son pesos de modelo; el modelo base es d1-2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 64 tokens para la cabeza; el modelo base d1-2B define su propio contexto, no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No aplica a los artefactos; calculados desde d1-2B-BF16.gguf |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (lfm-open-license-v1.0); no licencia uso comercial a entidades con ingresos anuales de 10 millones de USD o más |
| Formato de pesos | dvec.vec.f32 (floats de 32 bits little-endian), dvec.tok, dvec.head, dvec.logit.f32, question.txt, SHA256SUMS |

## Arquitectura y entrenamiento

Los artefactos se construyen en dos fases. Primero, la tabla: un pase forward del modelo d1-2B por cada token del vocabulario mediante llama.cpp, con la plantilla `systemone` del propio modelo, totalizando 124.907 pases en 1.056,578 segundos sobre una RTX 3090 Ti. La fila `t` de `dvec.vec.f32` es el estado oculto final en la última posición del prompt cuando el estado es ese token. Los tokens de control y no usados (3.093 de 128.000) tienen fila cero. El resultado se validó contra el endpoint servidor de llama.cpp con una coincidencia de 1,591e-04 en P(yes) sobre 12 estados.

Segundo, la cabeza: una cabeza lineal sobre el vector agrupado de longitud unitaria, ajustada por regresión ridge a las propias respuestas del modelo sobre 12.000 ventanas de 64 tokens. La cabeza ocupa 4.096 floats de pesos y promedios y no contiene texto. El ajuste se realizó sobre ventanas extraídas de la salida de herramientas registrada por el autor, con frases de prueba insertadas en un tercio de ellas. La cabeza incluye la temperatura del modelo, un corte ajustado y una dirección media.

## Capacidades

- Puntuación de texto para detección de inyección de prompt: clasifica ventanas de 64 tokens según la probabilidad de que contengan instrucciones dirigidas a un asistente o agente.
- Inferencia en CPU sin GPU: la tabla permite puntuar sin ejecutar el modelo, leyendo filas de vectores y aplicando la cabeza lineal.
- Integración con motor de reglas: los vectores actúan como evidencia complementaria al motor heurístico de xks-id, y solo alertan por sí solos por encima de un corte calibrado sobre datos del operador.
- Calibración local: el comando `xksid calibrate` fija el corte de alerta a partir de turnos registrados por el propio operador.
- Reproducción: `dvec.logit.f32` conserva los logits sí y no por token para verificar resultados.
- Tokenizador empaquetado: `dvec.tok` incluye clases de caracteres, 128.000 textos de token con sus tipos y 293.320 merges.
- No ofrece generación de texto, razonamiento general, código, matemáticas, visión, tool calling ni capacidades multilingües; es un artefacto de clasificación especializado.

## Casos de uso

- Detección de inyección de prompt en agentes: el motor xks-id puntúa la salida de herramientas registrada durante la ejecución de un agente y alerta cuando la ventana de 64 tokens se parece a una instrucción dirigida al asistente, sin coste de GPU en producción.
- Despliegue en entornos sin acelerador: al no requerir modelo en memoria ni GPU, la tabla puede ejecutarse en el mismo host del agente o en un contenedor ligero, leyendo las filas correspondientes a los tokens de la ventana.
- Filtrado previo en pipelines de herramientas: antes de pasar la salida de una herramienta al contexto del agente, el motor puntúa la ventana y puede bloquear o marcar contenido sospechoso según el corte calibrado.
- Auditoría de registros históricos: al ser una tabla estática, permite reprocesar logs de conversaciones y salidas de herramientas de forma determinista y barata para análisis forense.
- Calibración por operador: cada despliegue ajusta el corte con sus propios turnos registrados, adaptando la tasa de falsos positivos al perfil de tráfico real de la organización.
- Investigación en detección de inyección: los artefactos y la documentación de `docs/VECTORS.md` permiten reproducir la construcción de la tabla y la cabeza, y comparar la señal del modelo con reglas heurísticas.
- Segunda opinión sobre reglas: cuando el motor de reglas no dispara pero el contenido es ambiguo, la puntuación de los vectores sirve como evidencia adicional antes de escalar una alerta.

## Benchmarks y rendimiento

Medido contra el propio modelo, sobre ventanas excluidas del ajuste y con formulaciones que la cabeza no vio:

| Metrica | Valor |
|---|---|
| Correlación con el logit del modelo | 0,8464 |
| AUC | 0,9103 |
| Detección con 1 ventana limpia de cada 50 marcada | 76,2 % |
| Detección con 1 ventana limpia de cada 100 marcada | 53,3 % |
| Detección con 1 ventana limpia de cada 500 marcada | 9,9 % |

El autor advierte que los vectores ordenan bien el texto pero son débiles como detector autónomo con tasas bajas de falsos positivos, porque la media de vectores de token no captura el orden de las palabras.

## Requisitos de hardware

- VRAM para inferencia: no se requiere GPU; la puntuación se ejecuta en CPU leyendo la tabla.
- Almacenamiento: el repositorio ocupa 1,1 GB; los tres ficheros que lee el motor son `dvec.vec.f32` (1.048.576.000 bytes), `dvec.tok` (6.710.900 bytes) y `dvec.head` (16.412 bytes).
- Memoria principal: la tabla completa en memoria ronda 1 GB en floats de 32 bits; puede mapearse desde disco.
- GPU recomendadas: no aplica para la inferencia de los vectores. La generación de la tabla se realizó en una RTX 3090 Ti (124.907 pases en 1.056,578 s).
- Cabe en GPU de consumo: no aplica; el artefacto no ejecuta el modelo.
- Opciones de despliegue: xks-id (compilación con `make && make install`, descarga con `make fetch-vectors`, calibración con `xksid calibrate`); instalación manual colocando los tres ficheros en `~/.local/share/xksid/`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xks-id decision vectors | No aplica (derivado de d1-2B) | Ventanas de 64 tokens | Detección de inyección de prompt en CPU | LFM Open License v1.0 | Hugging Face, 0 descargas |
| LiquidAI/d1-2B | No disponible | No disponible | Modelo base del que derivan los vectores | No disponible | Hugging Face |
| LiquidAI/d1-2B-GGUF | No disponible | No disponible | Pesos GGUF del modelo base | No disponible | Hugging Face |

No se dispone de información sobre otros paquetes de vectores de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; solo puntúa ventanas de 64 tokens para una pregunta concreta.
- Detección débil a tasas bajas de falsos positivos: 9,9 % de detección con 1 ventana limpia de cada 500 marcada, según el propio autor.
- La media de vectores de token no captura el orden de las palabras, lo que limita la sensibilidad a formulaciones que dependen de la estructura.
- Los tokens de control y no usados (3.093 de 128.000) tienen fila cero y no aportan señal.
- Licencia LFM Open License v1.0: no permite uso comercial a entidades con ingresos anuales de 10 millones de USD o más.
- Son obras derivadas de LiquidAI/d1-2B, no publicadas por Liquid AI; cualquier garantía o soporte del modelo base no se extiende automáticamente a estos artefactos.
- La cabeza se ajustó sobre datos del propio autor, con frases de prueba insertadas en un tercio de las ventanas; el rendimiento en otros dominios puede diferir.
- Requiere calibración con datos del operador (`xksid calibrate`) para fijar el corte de alerta; sin ella, el umbral por defecto puede no ser adecuado.
- Sin datos publicados sobre sesgos, idiomas soportados ni comportamiento multilingüe.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción externa.

## Enlaces

- Hugging Face: https://huggingface.co/Lasimeri/xks-id-vectors
- Repositorio xks-id: https://github.com/Lasimeri/xks-id
- Documentación del método: https://github.com/Lasimeri/xks-id/blob/main/docs/VECTORS.md
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Pesos GGUF del modelo base: https://huggingface.co/LiquidAI/d1-2B-GGUF
- Licencia LFM Open License v1.0: fichero LICENSE del repositorio
