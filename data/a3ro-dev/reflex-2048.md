# a3ro-dev/reflex-2048

## Resumen

reflex-2048 es un transformer de 14,5 millones de parámetros que juega a 2048 con un único forward pass por jugada, sin búsqueda ni simulación. Lo desarrolla a3ro-dev y se distribuye como checkpoint de PyTorch en HuggingFace bajo el pipeline `reinforcement-learning`, aunque el método real de entrenamiento es destilación por imitación desde un profesor de tipo expectimax con tablas de consulta (macroxue/2048-ai). El modelo no es un modelo de lenguaje: recibe una representación de 21 tokens del tablero y devuelve cuatro logits, uno por movimiento.

El interés técnico está en su relación coste/rendimiento: se entrenó con 261 millones de decisiones en una sola A100 durante 1,9 horas de schedule y un coste declarado de 8,72 dólares, y alcanza una media de 164.395 puntos en 10.000 partidas con política greedy. Eso es aproximadamente una cuarta parte de los 625.898 puntos de su profesor, un dato deliberadamente modesto: el autor lo presenta como un punto de comparación barato y reproducible, no como un récord.

Su valor añadido para investigación es doble. Por un lado, documenta un fallo reproducible de DAgger (la incorporación de relabels del profesor sobre estados del alumno hundió la media de 56.652 a 4.188 puntos). Por otro, publica un análisis de calibración que muestra cómo el modelo pasa de un ECE de 0,006 sobre distribuciones del profesor a 0,271 en tableros que genera él mismo, con una confianza media del 88 % y solo un 61 % de acuerdo con el profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional pre-norm, 8 bloques, d=384, 12 cabezas, MLP 384-1536-384; cabeza de política (un logit por movimiento) y cabeza de valor auxiliar |
| Parametros totales | 14,5 M (aproximadamente; cifra declarada por el autor) |
| Longitud de contexto | 21 tokens fijos por jugada (16 tokens de casilla + 4 de movimiento + 1 de valor); no es una ventana de contexto de texto |
| Tipos de cuantizacion | no disponible (el repositorio solo publica un checkpoint `torch.save` en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (dict de `torch.save` con `cfg`, `model` state dict, `step` y `samples`); requiere `weights_only=False` al cargar |
| Tamano del repositorio | 0,1 GB |
| Acciones de salida | 4 (orden fijo: 0=UP, 1=DOWN, 2=LEFT, 3=RIGHT), con movimientos ilegales enmascarados |
| Entrada | Tablero como exponentes de ficha (0 = vacío, k = ficha 2^k), en orden row-major |

## Arquitectura y entrenamiento

El modelo convierte el tablero en 21 tokens: 16 de casilla (embedding del exponente de ficha más embedding de fila y columna), 4 tokens de movimiento construidos a partir del *afterstate* de cada dirección (legalidad, recompensa, casillas vacías, ficha máxima y su presencia en esquina, monotonicidad, suavidad, fusiones y recompensas de seguimiento) y 1 token de valor. Estos tokens atraviesan 8 bloques transformer pre-norm bidireccionales con atención de 12 cabezas y MLP de ratio 4; cada token de movimiento produce un logit y los ilegales se enmascaran. La cabeza de valor es auxiliar y solo interviene en el entrenamiento.

El entrenamiento es destilación por imitación desde el profesor expectimax con tablas grandes de macroxue/2048-ai, a profundidades 3 y 4. La primera fase usó 360 M de decisiones a profundidad 3 y 100 M a profundidad 4 (460 M en total). El checkpoint publicado parte del paso 6.000 de una ejecución anterior (antes de que ningún dato de DAgger llegara al entrenador) y continúa con 212 M de muestras adicionales al 50/50 entre profundidades 3 y 4, es decir, 261 M en esa segunda fase. La pérdida combina entropía cruzada contra el movimiento del profesor y 0,25 × una pérdida de Huber sobre el logaritmo del retorno restante, con una simetría D4 aleatoria aplicada por muestra. Optimizador AdamW, lr máximo 5e-4, schedule coseno de 1,9 horas, bf16, una A100.

El detalle metodológico más relevante es negativo: mezclar relabels del profesor sobre estados visitados por el alumno (DAgger) en el 30 % de cada lote redujo la media de 56.652 a 4.188 puntos manteniendo un acuerdo del ~87 % sobre datos del profesor. El autor verificó que las etiquetas eran correctas y no aisló la causa; el checkpoint publicado se entrenó sin datos de DAgger. El código del profesor es GPL-3.0, por lo que el repositorio distribuye un script de parcheo en lugar del código original.

## Capacidades

- Juego de 2048 en un solo forward pass por jugada, sin búsqueda, sin rollouts y sin tabla de consulta en tiempo de inferencia.
- Política estocástica expresada como distribución sobre cuatro movimientos, con enmascaramiento de acciones ilegales.
- Cabeza de valor auxiliar que estima el retorno restante en espacio logarítmico: correlación de 0,88 en espacio log con el retorno real sobre tableros del profesor.
- Evaluación calibrada sobre la distribución del profesor: 93,6 % de acuerdo con el profesor a profundidad 4 (ECE 0,006) y 91,1 % a profundidad 3 (ECE 0,010).
- Juego completo en terminal mediante `python -m reflex.play --ckpt reflex.pt`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión, audio ni capacidades multilingües.
- No dispone de búsqueda integrada utilizable: la búsqueda de 1 ply sobre su cabeza de valor rinde 4.189 puntos de media, muy por debajo de la política directa.

## Casos de uso

- **Bot integrado en una app o web de 2048**: con 9,1 ms de mediana por jugada en CPU de portátil (Intel, 8 hilos, batch 1, features incluidas) y 58 MB de pesos en fp32, el modelo puede ejecutar la política en el cliente o en una función serverless sin GPU, con un coste por partida despreciable.
- **Autoplay y modo demostración**: la política greedy permite partidas completas sin intervención; la distribución de resultados publicada (96,6 % llega a 2048, 86,4 % a 4096, 3,9 % a 32768) sirve para calibrar la dificultad percibida de una demo interactiva.
- **Línea base en investigación de destilación de sistemas de búsqueda**: reproduce un pipeline completo (profesor expectimax, generación de decisiones, destilación a transformer pequeño) con un presupuesto de cómputo de una A100 durante menos de dos horas, lo que lo convierte en una referencia barata frente a agentes con búsqueda.
- **Estudio de calibración fuera de distribución**: el modelo y su `calibration_report.json` permiten reproducir el fenómeno de sobreconfianza al abandonar la distribución del profesor (confianza media 0,881 frente a 61,0 % de acuerdo), un caso de estudio concreto para métricas de ECE en políticas imitadas.
- **Reproducción de fallos de DAgger**: el autor documenta la caída de 56.652 a 4.188 puntos al añadir relabels del alumno; el repositorio y el paper permiten reexperimentar con esa configuración para estudiar inestabilidad en aprendizaje por imitación interactivo.
- **Ingeniería de características para representaciones de estado**: los 4 tokens de movimiento codifican un *afterstate* con ocho rasgos explícitos (legalidad, recompensa, vacías, ficha máxima y esquina, monotonicidad, suavidad, fusiones, recompensas de seguimiento), útiles como plantilla para representar estados de otros juegos de tablero con transformadores pequeños.
- **Test de regresión para implementaciones de 2048**: al ser determinista en inferencia (argmax) y rápido en CPU, puede emplearse como oráculo de comportamiento para validar motores de reglas, especialmente en el manejo de fusiones y puntuación de *afterstates*.
- **Material docente sobre transformers no textuales**: 21 tokens, 8 bloques y una tarea medible con una única métrica clara lo hacen adecuado para explicar tokenización de estado, cabezas auxiliares y enmascaramiento de acciones en un curso práctico.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false`). Evaluación sobre 10.000 partidas nuevas, política greedy argmax, checkpoint final del schedule (no seleccionado por score de evaluación).

| Metrica | Valor |
|---|---|
| Puntuación media | 164.395 |
| Puntuación mediana | 131.064 |
| Puntuación máxima | 835.640 |
| Partidas que alcanzan 2048 | 96,6 % |
| Partidas que alcanzan 4096 | 86,4 % |
| Partidas que alcanzan 8192 | 63,3 % |
| Partidas que alcanzan 16384 | 30,0 % |
| Partidas que alcanzan 32768 | 3,9 % |
| Partidas que alcanzan 65536 | 0 % |

Segunda evaluación sobre 2.048 partidas con otras semillas: media de 166.767. El autor no registró las puntuaciones por partida, por lo que no hay errores estándar publicados.

Calibración frente a los movimientos del profesor (`calibration_report.json`):

| Tableros | Acuerdo | Confianza media | ECE |
|---|---|---|---|
| Partidas del profesor a profundidad 4 (held-out) | 93,6 % | 0,931 | 0,006 |
| Partidas del profesor a profundidad 3 (held-out) | 91,1 % | 0,921 | 0,010 |
| Tableros alcanzados por el propio modelo (semillas nuevas) | 61,0 % | 0,881 | 0,271 |

## Requisitos de hardware

- VRAM para inferencia: unos 58 MB en fp32 y 29 MB en bf16 para los pesos; las activaciones de 21 tokens son despreciables. Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida.
- CPU: es el entorno de referencia del autor. Mediana de 9,1 ms por jugada en un Intel de portátil con 8 hilos, batch 1, incluyendo el cálculo de características.
- GPU recomendadas: ninguna en particular; una A100 fue el hardware de entrenamiento (bf16, una sola GPU, schedule de 1,9 horas), no un requisito de inferencia. Cualquier GPU con soporte PyTorch acelera el cálculo, pero el cuello de botella real es el preprocesado de características en Python.
- Despliegue: exclusivamente PyTorch (`pip install torch numpy huggingface_hub`). No hay versiones GGUF, ONNX ni safetensors, por lo que vLLM, llama.cpp, Ollama y TGI no aplican a este modelo. La descarga se hace con `snapshot_download("a3ro-dev/reflex-2048")` y la carga con `reflex.model.load`.
- Throughput: no disponible para batch agregado. El único dato publicado es la latencia por jugada en CPU indicada arriba; una partida de media requiere del orden de varios cientos a miles de forward passes.
- Advertencia de seguridad en la carga: el checkpoint es un `torch.save` plano y exige `weights_only=False`; solo deben cargarse ficheros de fuentes de confianza.

## Comparativa con modelos similares

| Agente | Parametros | Busqueda | Puntuacion media | Tasa de 32768 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| macroxue expectimax, tablas grandes (profesor) | tablas (no neuronal) | profundidad 4 | 625.898 | 70,7 % | GPL-3.0 (código) | github.com/macroxue/2048-ai |
| 2048former v0.1 (autodeclarado) | 53,2 M | ninguna | 605.491 | 66,1 % | no disponible | no disponible en la informacion proporcionada |
| Guei et al. 2021, n-tuple | 268,4 M | ninguna | 412.785 | 30,2 % | no disponible | no disponible en la informacion proporcionada |
| reflex-2048 | 14,5 M | ninguna | 164.395 | 3,9 % | no disponible | HuggingFace + GitHub |
| reflex-2048 + búsqueda de 1 ply sobre su cabeza de valor | 14,5 M | 1 ply | 4.189 (128 partidas) | 0 % | no disponible | misma que reflex-2048 |

La comparación relevante es de eficiencia, no de rendimiento absoluto: reflex-2048 usa entre 3,7 y 18,5 veces menos parámetros que las alternativas neuronales, pero obtiene entre el 27 % y el 40 % de su puntuación media. La búsqueda de 1 ply sobre su cabeza de valor degrada el juego en dos órdenes de magnitud, un resultado que ninguna de las alternativas comparadas reproduce en la información disponible.

## Limitaciones y advertencias

- **Rendimiento muy por debajo del estado del arte**: 164.395 de media frente a 605.491–625.898 de los mejores agentes citados; la tasa de alcanzar 32768 es del 3,9 % frente al 66–71 %. No es adecuado como referencia de rendimiento máximo.
- **Sobreconfianza fuera de distribución**: en tableros que genera él mismo declara un 88,1 % de confianza media pero solo coincide con el profesor en el 61,0 % de los casos (ECE 0,271). Cualquier uso de sus probabilidades como señal de incertidumbre fuera de la distribución del profesor es poco fiable.
- **La cabeza de valor no sirve para buscar**: correlaciona 0,88 en espacio log con el retorno a lo largo de una partida, pero no ordena los cuatro movimientos de un turno; el 1-ply sobre ella cae a 4.189 puntos.
- **Fallo no diagnosticado de DAgger**: no se ha aislado la causa de la caída de 56.652 a 4.188 puntos al mezclar relabels del alumno, por lo que el régimen de entrenamiento publicado es frágil ante cambios en la mezcla de datos.
- **Licencia no disponible**: no se especifica licencia del checkpoint ni de los pesos, lo que impide un uso comercial con garantías. Además, el código del profesor es GPL-3.0, un caveat legal relevante si se redistribuye o se deriva trabajo del pipeline completo.
- **Sin errores estándar**: el autor no registró puntuaciones por partida, de modo que las medias publicadas no llevan intervalos de confianza y la segunda evaluación (166.767) no puede contrastarse formalmente contra la primera.
- **No es un modelo de lenguaje**: no procesa texto, no tiene ventana de contexto lingüística, no soporta instrucciones, tool calling ni capacidades multilingües. Cualquier uso fuera del juego 2048 requiere reentrenamiento.
- **Dominio cerrado y reglas fijas**: la variante evaluada es la estándar con 90 % de doses y sin deshacer; no hay datos sobre comportamiento con otras configuraciones de tablero o reglas.
- **Riesgo de ejecución de código**: la carga exige `weights_only=False` sobre un `torch.save` plano, lo que en la práctica permite ejecución arbitraria si el fichero no procede de una fuente fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/a3ro-dev/reflex-2048
- Código, pipeline de entrenamiento y paper: https://github.com/a3ro-dev/reflex-2048
- Profesor expectimax con tablas de consulta (macroxue/2048-ai): https://github.com/macroxue/2048-ai
