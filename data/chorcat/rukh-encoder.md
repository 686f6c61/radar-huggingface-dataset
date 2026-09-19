# chorcat/rukh-encoder

## Resumen

chorcat/rukh-encoder es un transformer bidireccional escrito desde cero que recibe una posición de ajedrez y produce tres predicciones sobre ella: la calidad de la posición (value), si el movimiento que la originó fue un error grave (blunder) y cómo va a terminar la partida (result). Forma parte de Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin, y constituye la etapa "encoder" de esa arquitectura. Lo publica el usuario chorcat bajo licencia Apache 2.0.

El modelo tiene 15.054.725 parámetros distribuidos en 8 capas de anchura 384, se preentrenó con modelado enmascarado de movimientos (masked move modeling) y se ajustó después con etiquetas generadas por Stockfish. Su relevancia es doble: por un lado, es un ejemplo didáctico completo y reproducible de pipeline de entrenamiento (tokenizador, dataset de partidas, evaluación); por otro, sirve como detector de errores tácticos y posicionales en posiciones de ajedrez con un coste computacional mínimo.

El repositorio incluye pesos en safetensors y en ONNX, con un tamaño total de 0,2 GB, lo que permite ejecutarlo en hardware muy modesto. La model card del autor declara explícitamente que uno de los dos objetivos de calidad fijados en el proyecto (correlación de Spearman de la cabeza de valor frente a los centipeones de Stockfish) no se ha alcanzado, y atribuye la causa a la escasez de datos etiquetados y no a la capacidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder) escrito desde cero; 8 capas, anchura 384 |
| Parametros totales | 15.054.725 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

Se trata de un transformer bidireccional de 8 capas y anchura 384, con 15.054.725 parámetros, implementado desde cero dentro del ecosistema Rukh (librería `rukh`). La entrada es una posición de ajedrez tokenizada con el tokenizador propio del proyecto (dataset `chorcat/rukh-tokenizer`) y la salida son tres cabezas independientes: una cabeza de valor que estima la calidad de la posición, una cabeza de blunder que estima si el movimiento previo arruinó la partida y una cabeza de resultado que predice el desenlace.

El preentrenamiento utiliza modelado enmascarado de movimientos (masked move modeling) sobre el dataset de partidas `chorcat/rukh-games-1800`. Después, las cabezas se ajustan con etiquetas derivadas de Stockfish. Según la model card, la cabeza de valor se entrenó durante 4.000 pasos sobre etiquetas que cubren el 9,8 % de las posiciones con las que se cruzaron, y el objetivo de entrenamiento es `tanh(cp / 400)`, una función que comprime la escala precisamente en la zona donde las posiciones son más densas. El autor identifica ese cuello de botella de datos etiquetados como la causa de que no se alcance el objetivo de correlación con Stockfish.

En la evaluación se aplica un protocolo estricto de partición por partida (`game_id`), nunca por posición, para evitar fugas de información entre jugadas consecutivas de la misma partida. Los datos etiquetados se dividen además en dos mitades: una mitad `tune` (3.793 filas, 2.455 partidas) donde se elige el umbral de decisión maximizando F1, y una mitad `score` (3.660 filas, 2.368 partidas) donde se reportan las métricas finales.

## Capacidades

- Extraccion de caracteristicas de posiciones de ajedrez (`feature-extraction` como pipeline declarado).
- Estimacion de valor posicional: la cabeza de valor se correlaciona con la evaluacion en centipeones de Stockfish (Pearson 0,648; Spearman 0,520 sobre `tanh(cp/400)`).
- Deteccion de blunders: identifica si el movimiento que condujo a la posicion actual fue un error grave, con un F1 ajustado del 18,0 %.
- Prediccion de resultado de partida: cabeza de resultado con una precision del 50,0 % sobre las posiciones retenidas.
- Inferencia a partir unicamente de la posicion resultante, sin acceso a la posicion predecesora ni al movimiento jugado (limitacion estructural frente a la linea base de material).
- Exportacion a ONNX para despliegue en entornos sin Python o con aceleracion especifica.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no aplica; el modelo opera sobre notacion y representacion de ajedrez, no sobre lenguaje natural.

## Casos de uso

- Analisis post-partida automatico: dado un flujo de posiciones, el encoder puede señalar las jugadas candidatas a error grave para que un revisor humano las examine, reduciendo el numero de posiciones que hay que pasar por un motor completo.
- Filtrado previo a analisis con motor: en lugar de evaluar todas las posiciones de una base de datos con Stockfish, se usa el encoder como primera pasada de bajo coste y solo se envian al motor aquellas con alta probabilidad de blunder.
- Deteccion de errores en plataformas de ensenanza de ajedrez: la cabeza de blunder permite generar ejercicios de "encuentra el error" a partir de partidas reales de alumnos.
- Anotacion de bases de datos de partidas: asignar etiquetas de calidad posicional y de resultado probable a grandes volumenes de partidas con un coste computacional marginal (15 M de parametros).
- Componente de un pipeline de aprendizaje por refuerzo o de busqueda: la cabeza de valor puede servir como funcion de evaluacion ligera dentro de un motor de busqueda propio o de un agente entrenado.
- Material didactico para cursos de IA: el repositorio completo (tokenizador, dataset, script de evaluacion `rukh eval encoder`) sirve como ejemplo reproducible de un ciclo de preentrenamiento y ajuste supervisado con particion por partida.
- Despliegue embebido o en el navegador: al disponer de pesos ONNX y ocupar el repositorio completo 0,2 GB, es viable ejecutarlo en cliente sin GPU, por ejemplo en una interfaz web de analisis en vivo como la demo publica del proyecto.

## Benchmarks y rendimiento

Medidos con `rukh eval encoder` el 19 de septiembre de 2026 sobre 10.000 posiciones retenidas, de las cuales 7.453 tienen etiqueta de blunder.

| Metrica | Valor |
|---|---|
| Blunder F1 (umbral ajustado, `p >= 0,06631`) | 18,0 % |
| Blunder precision | 11,7 % |
| Blunder recall | 39,6 % |
| Blunder F1 (umbral fijo, `p >= 0,5`) | 0,0 % |
| Blunder ROC AUC | 0,740 |
| Blunder average precision | 0,112 |
| Blunder base rate | 3,7 % |
| Blunder F1, linea base de material | 8,9 % |
| Margen sobre la linea base | +9,2 puntos de F1 |
| Value vs Stockfish cp, Pearson | 0,648 |
| Value vs Stockfish cp, Spearman | 0,520 |
| Result accuracy | 50,0 % |

Barras de aceptacion definidas en `GOAL.md` antes del entrenamiento:

| Barra | Objetivo | Medido | Veredicto |
|---|---|---|---|
| Blunder F1 sobre la linea base de material | al menos +5 puntos de F1 | +9,2 puntos de F1 | cumplida |
| Value vs Stockfish cp, Spearman | al menos 0,80 | 0,520 | no cumplida |

No se han publicado en la informacion disponible resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K u otros), ya que el modelo no es un modelo de lenguaje general sino un encoder especializado en ajedrez.

## Requisitos de hardware

- VRAM estimada para inferencia: con 15,05 M de parametros, en FP32 ocupa aproximadamente 60 MB y en FP16 unos 30 MB; el repositorio completo pesa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; no se requiere A100, H100 ni RTX 4090. Incluso GPUs integradas o de gama antigua pueden ejecutarlo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en modelos muy antiguos, dado el tamano del modelo.
- CPU: es viable la inferencia en CPU exclusivamente, lo que lo hace apto para portatiles y entornos sin acelerador.
- Opciones de despliegue: exportacion ONNX (formato incluido en el repositorio), safetensors para carga directa con la libreria `rukh`, y despliegue web mediante los pesos ONNX. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chorcat/rukh-encoder | 15.054.725 | no disponible | Blunder F1 18,0 %; ROC AUC 0,740; value Spearman 0,520 | apache-2.0 | HuggingFace (safetensors, ONNX) |
| Linea base de material + movilidad (no es un modelo entrenado) | no aplica | no aplica | Blunder F1 8,9 % | no aplica | regla heuristica descrita en la model card |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos de la misma categoria (encoders de ajedrez de tamano similar) en los datos proporcionados, por lo que no es posible establecer una comparativa con alternativas. La unica referencia cuantitativa disponible es la linea base de material, que es una regla determinista y no un modelo entrenado.

## Limitaciones y advertencias

- La barra de calidad de la cabeza de valor no se ha cumplido: Spearman 0,520 frente al objetivo de 0,80. El modelo no es fiable como evaluador posicional preciso.
- Data leakage potencial nulo por diseno: la particion se hace por `game_id`, pero esto implica que los resultados reportados solo son validos bajo ese protocolo; comparaciones con otras evaluaciones no son directamente equiparables.
- La cabeza de blunder tiene precision muy baja (11,7 %) al umbral ajustado: la mayoria de las alertas son falsos positivos. El recall del 39,6 % implica que se escapan mas de la mitad de los blunders reales.
- El F1 con umbral fijo (`p >= 0,5`) es del 0,0 %, lo que indica que las probabilidades de la sigmoide no estan calibradas y que el rendimiento depende enteramente de un umbral ajustado sobre una mitad de validacion concreta.
- La prediccion de resultado tiene una precision del 50,0 %, equivalente a una linea base ingenua en un problema de dos clases; no debe usarse para predecir desenlaces.
- Comparacion no equitativa con la linea base: la linea base recibe la posicion predecesora y el movimiento jugado, mientras que el encoder solo recibe la posicion resultante. El margen de +9,2 puntos de F1 se obtiene en esas condiciones, que el propio autor califica de no equivalentes.
- No se documentan sesgos demograficos ni linguisticos porque el modelo no procesa lenguaje natural ni datos personales; los sesgos relevantes serian los heredados de las etiquetas de Stockfish y del dataset de 1.800 partidas.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de clasificaciones incorrectas con alta confianza, especialmente en posiciones con sacrificios posicionales, que el modelo podria no reconocer.
- Restricciones de licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se especifican restricciones adicionales en la informacion disponible.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion en septiembre de 2026; se trata de una publicacion reciente y con escasa validacion externa.
- Limitacion de alcance: es un encoder de posiciones de ajedrez, no un modelo de proposito general; no soporta generacion de texto ni tareas fuera del dominio.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/chorcat/rukh-encoder
- Repositorio del proyecto Rukh: https://github.com/borja-glez/rukh
- Demo interactiva del encoder sobre partidas en vivo: https://rukh.borjaglez.com/?stage=encoder
- Blog tecnico del proyecto: https://lab.rukh.borjaglez.com
- Dataset de partidas: https://huggingface.co/datasets/chorcat/rukh-games-1800
- Tokenizador: https://huggingface.co/datasets/chorcat/rukh-tokenizer
