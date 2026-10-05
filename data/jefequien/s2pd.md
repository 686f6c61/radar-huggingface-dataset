# jefequien/S2PD

## Resumen

S2PD (Serial-to-Parallel Diffusion) es un artefacto de investigación publicado por el usuario jefequien en HuggingFace. No es un modelo de lenguaje: se trata de un conjunto de checkpoints de modelos de difusión entrenados desde cero para generar secuencias de estados en entornos deterministas (juegos de mesa y arcade, puzles y sistemas físicos), lo que lo sitúa en el ámbito de la generación de vídeo y del modelado de dinámicas. El repositorio ocupa 109,2 GB y se distribuye bajo licencia MIT.

El paquete contiene dos familias de modelos. La primera son modelos DiT-B en espacio de píxeles, entrenados desde cero sobre doce entornos: Conway, Chess, 2048, Fifteen Puzzle, Tetris, Snake, Rubik's Cube 3D, Double Pendulum, Three Body, Colliding Balls 2D, Colliding Balls 3D y Pong. La segunda son adaptadores LoRA que requieren el backbone Wan-5B (Wan-AI/Wan2.2-TI2V-5B-Diffusers), entrenados sobre Kubric MOVi-A y Kubric MOVi-C. Para cada combinación de dataset y familia, la model card ofrece cuatro variantes: Bidirectional, cDF, BC y S2PD.

El interés del repositorio es metodológico: permite comparar, sobre un mismo entorno y un mismo backbone, distintos regímenes de generación difusión (bidireccional frente a las variantes cDF, BC y S2PD). Es material de evaluación y reproducción para investigación en difusión aplicada a secuencias, no un modelo listo para producto. El repositorio no registra descargas ni valoraciones y su model card no incluye resultados numéricos de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT-B) en espacio de píxeles, entrenado desde cero; adaptadores LoRA sobre el backbone Wan2.2-TI2V-5B (Wan-5B) |
| Parámetros totales | no disponible (la model card no indica el recuento de parámetros de DiT-B ni del adaptador LoRA) |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (no se documentan resolución, número de fotogramas ni ventana temporal) |
| Tipos de cuantización | no disponible (solo se distribuyen pesos en safetensors; no se documentan variantes GGUF, int8, int4 ni fp8) |
| Idiomas soportados | no disponible (no aplica: la entrada no es texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Biblioteca de carga | `s2pd` (etiqueta `diffusers` en el repositorio) |
| Tamaño del repositorio | 109,2 GB |
| Fecha de creación / última actualización | 2026-08-19 / 2026-10-04 |

## Arquitectura y entrenamiento

La familia principal son modelos DiT-B en espacio de píxeles entrenados desde cero, es decir, sin VAE latente ni codificador de texto: la difusión opera directamente sobre píxeles. El entrenamiento usa exclusivamente entornos sintéticos y deterministas, agrupados en tres bloques: juegos de tablero y puzles (Chess, 2048, Fifteen Puzzle, Rubik's Cube 3D), juegos arcade y de rejilla (Conway, Tetris, Snake, Pong) y sistemas físicos simulados (Double Pendulum, Three Body, Colliding Balls 2D y 3D). La familia secundaria son adaptadores LoRA que se acoplan al backbone Wan2.2-TI2V-5B y que se entrenaron sobre los conjuntos Kubric MOVi-A y Kubric MOVi-C, orientados a escenas con objetos en movimiento.

Para cada dataset se publican cuatro variantes: Bidirectional, cDF, BC y S2PD. La model card las presenta como columnas comparables de una misma tabla, lo que sugiere un diseño experimental de ablación sobre el régimen de generación, con la variante bidireccional como referencia. La model card no documenta el mecanismo interno de S2PD ni el significado de las siglas cDF y BC, ni aporta cifras de tokens, horas de cómputo, composición del dataset o número de pasos de difusión; tampoco menciona RLHF ni DPO, algo esperable al no tratarse de un modelo de lenguaje. La explicación técnica del método debe consultarse en la página del proyecto y en el repositorio de código enlazados más abajo.

## Capacidades

- Generación de secuencias visuales de dinámicas deterministas: produce la evolución de fotogramas o estados en los doce entornos de entrenamiento (Conway, Chess, 2048, Fifteen Puzzle, Tetris, Snake, Rubik's Cube 3D, Double Pendulum, Three Body, Colliding Balls 2D y 3D, Pong).
- Modelado de dinámicas físicas simuladas: péndulo doble, problema de tres cuerpos y colisiones de esferas en 2D y 3D.
- Generación condicionada a vídeo con objetos en movimiento mediante los adaptadores LoRA sobre Wan-5B, entrenados con Kubric MOVi-A y MOVi-C.
- Evaluación comparativa de métodos de difusión: las cuatro variantes (Bidirectional, cDF, BC, S2PD) permiten medir el efecto del régimen de generación sobre el mismo dataset y backbone.
- Inferencia local sin servicios externos: los pesos en safetensors se cargan con la biblioteca `s2pd` o mediante el pipeline de Diffusers para el caso de los LoRA.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso basado en lenguaje.
- No tiene capacidades multilingües ni de texto: no hay tokenizador de lenguaje natural documentado.
- No se documentan modos especiales (thinking, entrada de audio, entrada de imagen de referencia más allá del condicionamiento propio de Wan2.2-TI2V-5B).

## Casos de uso

- Evaluación de métodos de muestreo en difusión: usar las cuatro variantes (Bidirectional, cDF, BC, S2PD) sobre un mismo entorno, como Conway o Pong, para medir de forma controlada el efecto del régimen de generación paralela frente a la referencia bidireccional.
- Investigación en modelos de mundo para videojuegos: generar la evolución de partidas de Tetris, Snake o 2048 y comparar la secuencia generada con la dinámica real del juego, útil para estudiar si un modelo de difusión aprende reglas de transición.
- Reproducción de experimentos de dinámica física: los checkpoints de Double Pendulum, Three Body y Colliding Balls permiten analizar si el modelo captura conservación de momento o trayectorias caóticas sobre sistemas con solución numérica conocida.
- Generación de datos sintéticos para preentrenamiento: producir secuencias de los entornos incluidos como corpus auxiliar para entrenar modelos de vídeo o de predicción de estado en dominios con poca variedad de datos reales.
- Adaptación a nuevos dominios mediante LoRA: reutilizar el pipeline de Wan2.2-TI2V-5B y el patrón de los adaptadores MOVi-A y MOVi-C para entrenar adaptadores sobre otros conjuntos de escenas con objetos en movimiento.
- Material docente sobre difusión: el repositorio incluye la misma tarea resuelta con cuatro métodos distintos y con dos escalas de modelo (DiT-B desde cero y LoRA sobre un backbone de 5B), lo que sirve para ilustrar el compromiso entre coste de entrenamiento y calidad.
- Estudio de generalización fuera de distribución: evaluar las variantes DiT-B en entornos no vistos (por ejemplo, entrenar en Pong y evaluar en Colliding Balls 2D) para caracterizar la transferencia entre dinámicas distintas.
- Referencia de implementación: el código asociado puede reutilizarse como plantilla para montar comparativas de samplers en otros dominios de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente enlaza los checkpoints de las cuatro variantes por dataset, sin tablas de métricas (FVD, PSNR, SSIM, precisión de transición u otras), y no se proporcionan comparaciones numéricas con modelos externos.

## Requisitos de hardware

- VRAM para la familia DiT-B: no disponible. La model card no publica el recuento de parámetros ni la resolución de entrenamiento, por lo que no es posible estimar la memoria necesaria sin medir los ficheros de safetensors del repositorio.
- VRAM para los adaptadores Wan-5B: el adaptador LoRA es ligero, pero requiere cargar el backbone Wan2.2-TI2V-5B (aproximadamente 5.000 millones de parámetros). Como estimación orientativa y no procedente de la model card, el backbone en bf16 necesita en torno a 10-12 GB solo en pesos, más activaciones y cachés de atención, lo que en la práctica sitúa la inferencia cómoda en GPUs de 24 GB o más y hace recomendable trabajar en fp8 o con offloading en GPUs de 16 GB.
- GPUs recomendadas: no especificadas por el autor. Para el backbone Wan-5B, una RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB) cubren el escenario con holgura; para DiT-B en espacio de píxeles, el tamaño reducido del modelo hace plausible su ejecución en GPUs de consumo, pero no hay confirmación documentada.
- ¿Cabe en GPU de consumo? Para los LoRA con backbone Wan-5B, previsiblemente sí en una RTX 4090 con bf16 o fp8, y probablemente no en GPUs de 8-12 GB sin cuantización ni offloading. Para DiT-B, no hay datos publicados.
- Opciones de despliegue: los pesos se cargan con la biblioteca `s2pd` del propio autor o, en el caso del backbone, con el pipeline de Diffusers (`Wan2.2-TI2V-5B-Diffusers`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas pensadas para modelos de lenguaje y no aplicables a este caso.
- Latencia y throughput: no disponibles. No se publican tiempos por paso de difusión, número de pasos de inferencia ni velocidad en fotogramas por segundo.
- Almacenamiento: el repositorio completo ocupa 109,2 GB; conviene descargar solo el subdirectorio del dataset y variante que se vaya a evaluar (por ejemplo `checkpoints/S2PD/dit-b-pixel/pong`) en lugar de clonar el repositorio entero.

## Comparativa con modelos similares

La model card no ofrece comparaciones con modelos externos. La comparación significativa que sí puede construirse con la información disponible es interna, entre los cuatro regímenes de generación publicados para cada dataset y familia:

| Variante | Familia | Datasets cubiertos | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bidirectional | DiT-B en píxeles y LoRA Wan-5B | 12 entornos + MOVi-A y MOVi-C | no disponible | no disponible | MIT | pesos en safetensors en el mismo repositorio |
| cDF | DiT-B en píxeles y LoRA Wan-5B | 12 entornos + MOVi-A y MOVi-C | no disponible | no disponible | MIT | pesos en safetensors en el mismo repositorio |
| BC | DiT-B en píxeles y LoRA Wan-5B | 12 entornos + MOVi-A y MOVi-C | no disponible | no disponible | MIT | pesos en safetensors en el mismo repositorio |
| S2PD | DiT-B en píxeles y LoRA Wan-5B | 12 entornos + MOVi-A y MOVi-C | no disponible | no disponible | MIT | pesos en safetensors en el mismo repositorio |
| Wan2.2-TI2V-5B | backbone de difusión de vídeo de Wan-AI | no aplica (modelo generalista de texto/imagen a vídeo) | alrededor de 5.000 millones (según la ficha del backbone) | no disponible en la información proporcionada | no verificada en la información disponible | necesario como dependencia para los adaptadores LoRA |

Como alternativas externas de la misma categoría (modelos de difusión para vídeo o para predicción de estados) no se dispone de datos verificables en la información proporcionada; cualquier comparación numérica requeriría ejecutar los checkpoints y medir con una métrica común, algo que la model card no hace.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no acepta instrucciones en lenguaje natural, no genera texto y no admite integración en pipelines de tool calling ni de agentes.
- Sesgos conocidos: no documentados por el autor. Al entrenarse exclusivamente sobre entornos sintéticos y deterministas, es previsible un comportamiento degradado fuera de esas dinámicas, pero no hay un análisis publicado que lo cuantifique.
- Riesgo de alucinación en sentido estricto: no aplica al texto, pero sí existe el riesgo equivalente de que el modelo genere transiciones de estado físicamente imposibles (piezas que se solapan, colisiones no conservativas, tableros inconsistentes). No hay evaluación publicada de este extremo.
- Cobertura de dominio muy estrecha: doce entornos de juego y física más dos conjuntos Kubric. No hay evidencia de generalización a vídeo real, escenas abiertas o dominios fotorrealistas.
- Idiomas: no aplica. No hay soporte multilingüe ni de texto.
- Contexto: se desconoce la ventana temporal y la resolución máximas; no se debe asumir que el modelo genere secuencias largas de forma estable.
- Licencia: MIT para los checkpoints de este repositorio, lo que permite uso comercial y modificación. Atención al componente de terceros: los adaptadores LoRA dependen del backbone Wan2.2-TI2V-5B, cuyos términos de uso son independientes y deben revisarse por separado antes de un despliegue comercial.
- Ausencia de benchmarks: sin métricas publicadas no es posible justificar afirmaciones de calidad frente a alternativas, ni comparar objetivamente las cuatro variantes más allá de inspección cualitativa.
- Madurez: el repositorio no registra descargas ni valoraciones, la biblioteca `s2pd` es específica del autor y no hay pipeline declarado en HuggingFace, lo que implica un riesgo alto de fricción de integración y de mantenimiento.
- Producción: por lo anterior, este repositorio es adecuado para investigación y reproducción de experimentos, no como componente de un sistema en producción sin una validación propia previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jefequien/S2PD
- Página del proyecto: https://jefequien.github.io/S2PD/
- Código fuente: https://github.com/jefequien/S2PD
- Backbone requerido por los adaptadores LoRA (Wan-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Checkpoints DiT-B en espacio de píxeles: https://huggingface.co/jefequien/S2PD/tree/main/checkpoints
- No se han encontrado otros enlaces relevantes en la búsqueda web; los resultados devueltos no guardan relación con este modelo.
