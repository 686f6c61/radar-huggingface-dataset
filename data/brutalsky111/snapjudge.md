# Brutalsky111/Snapjudge

## Resumen

SnapJudge es un modelo de decision no autoregresivo disenado para juegos, publicado por el usuario Brutalsky111 en Hugging Face bajo licencia Apache 2.0. A diferencia de un modelo de lenguaje generativo, SnapJudge no produce texto: recibe un estado de juego en texto o JSON (tablero de tres en raya, rejilla de snake o descripcion de un obstaculo en temple-run) junto con preguntas tipadas, y devuelve respuestas tipadas con probabilidades calibradas en una unica pasada forward. La motivacion es eliminar dos problemas clasicos de los agentes basados en LLM: el parseo de la salida y la alucinacion, ya que no hay texto libre que interpretar.

Tecnicamente es un fine-tuning completo de ModernBERT-base (149M de parametros, encoder bidireccional) al que se anade una cabeza de decision entrenada desde cero, con dos capas transformer, un scorer de marcadores de opcion y una cabeza de accion. El total asciende a 163.983.622 parametros (unos 165M). Cada opcion se puntua en su propio token `[MASK]` y se aplica softmax por pregunta, de modo que se pueden anadir nuevos esquemas de decision sin reentrenar. El presupuesto de contexto configurado es de 256 tokens por llamada y todas las preguntas de una misma invocacion se responden en una sola pasada.

Su relevancia actual es acotada pero especifica: es un artefacto de investigacion sobre decodificacion no autoregresiva, calibracion probabilistica y decision estilo System-1 en entornos de juego sinteticos. Sigue la estela de Laya (Convai Innovations) en cuanto a arquitectura y metodologia de entrenamiento RLCD (aprendizaje por refuerzo contra reglas de puntuacion estrictamente propias). Con 0 descargas y 1 like en el momento de redactar esta ficha, debe tratarse como un experimento reproducible mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (ModernBERT-base) + cabeza de decision propia (2 capas transformer, scorer de marcadores de opcion, act head) |
| Parametros totales | 163.983.622 (~165M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 256 tokens por llamada (head_max_len = 128). No se especifica en la model card la longitud nativa del backbone |
| Tipos de cuantizacion | No disponible. Solo se distribuyen pesos safetensors en precision completa (656 MB para ~164M parametros, compatible con carga en fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 656 MB); tokenizer de ModernBERT incluido |
| Pipeline | text-classification |
| Modelo base | answerdotai/ModernBERT-base |
| Tarea | Decision no autoregresiva para juegos (tic-tac-toe, snake, temple-run) |

## Arquitectura y entrenamiento

El backbone es ModernBERT-base, un encoder bidireccional de 149M de parametros que se fine-tunea por completo. Sobre el se monta una cabeza de decision entrenada desde cero: dos capas transformer, un scorer que puntua cada opcion en su propio token `[MASK]` y una cabeza de accion. El formato de entrada es `[CLS] <type> instructions [SEP] [MASK] opt0 [MASK] opt1 … [SEP] state [SEP]`, con un presupuesto de 256 tokens y `head_max_len = 128`. Todas las preguntas de una llamada se resuelven en una unica pasada forward, sin decodificacion autoregresiva ni generacion de texto.

El entrenamiento sigue la metodologia RLCD (usada tambien en Laya) en tres fases. Primero, un preentrenamiento supervisado con entropia cruzada durante 3 epocas sobre 5.400 partidas sinteticas (16.200 decisiones tipadas), con etiquetas procedentes de solucionadores exactos: minimax para tres en raya, colision mas distancia Manhattan a la comida para snake y una tabla de obstaculos para temple-run. Despues, un fine-tune RLCD de 2 epocas que anade ruido gaussiano de media cero sobre los logits para exploracion y optimiza una recompensa compuesta por log score, 0,5 por termino esferico y RPS para preguntas ordinales, con un anclaje de entropia cruzada. Finalmente, se ajusta una temperatura de calibracion por cada par (tipo de pregunta, rango de numero de opciones) sobre datos retenidos. El modelo expone tres primitivas de decision: `choice` (etiqueta ganadora con probabilidades por opcion y confianza), `score` (nivel ordinal esperado con distribucion) y `noul` (P(true) calibrada).

## Capacidades

- Decision no autoregresiva en una sola pasada forward: no genera texto, por lo que no hay salida que parsear ni margen para alucinacion de formato.
- Primitiva `choice`: seleccion de la mejor opcion entre alternativas cerradas. Usada para `next_move` (9 celdas en tres en raya), `direction` (4 direcciones en snake) y `action` (5 acciones en temple-run).
- Primitiva `score`: prediccion de nivel ordinal esperado con distribucion completa. Aplicada a `danger`, `risk` y `urgency` (3 niveles cada una).
- Primitiva `noul`: probabilidad calibrada de un evento booleano. Aplicada a `must_block`, `will_die` y `game_over_soon`.
- Enrutamiento interno de juego: `GameRouter` detecta de que juego procede el estado y explica la decision de enrutado en `res["routing"]`.
- Extension de esquemas sin reentrenamiento: al puntuar cada opcion en su propio token `[MASK]`, se pueden anadir nuevas preguntas u opciones declarativamente.
- Multilingue: no. El modelo esta entrenado y etiquetado unicamente en ingles (language: en).
- Tool calling / function calling: no disponible, no se menciona soporte en la model card.
- Agentes multi-paso: no de forma nativa. El modelo resuelve decisiones puntuales; el bucle de agente (multi-step) recae en el codigo que lo invoca.
- Vision, audio, thinking mode: no soportado. El estado del juego se entrega como texto o JSON, no como pixeles.

## Casos de uso

- Agente de bajo coste para tres en raya: dado un tablero serializado, el modelo devuelve el movimiento optimo (primitiva `choice` sobre 9 celdas) y una probabilidad de peligro o de bloqueo obligatorio. Es util como banco de pruebas de agentes porque la etiqueta optima es verificable con minimax y la latencia es de decenas de milisegundos.
- Control de NPC en entornos de rejilla tipo snake: con la posicion de la cabeza, el cuerpo y la comida, devuelve la direccion recomendada y una estimacion ordinal de riesgo y de estar atrapado. Encaja en bucles de simulacion donde interesa una politica barata y determinista en vez de un LLM completo.
- Decision de obstaculos en runners tipo temple-run: recibe un obstaculo tipado (hueco, distancia, carril, velocidad) y devuelve la accion (por ejemplo `jump`) junto con una urgencia ordinal y una probabilidad calibrada de fin de partida inminente, apta para logica de game over con umbral de confianza.
- Investigacion en calibracion y scoring rules: el modelo esta entrenado contra reglas de puntuacion estrictamente propias (log score, RPS, termino esferico) y publica ECE de 0,049 en retenido, lo que lo convierte en un sujeto de estudio controlado para comparar metodos de calibracion (temperature scaling por tipo de pregunta) frente a baselines autoregresivos.
- Enrutamiento en pipelines multiagente: `GameRouter` demuestra un patron de deteccion de tarea y despacho a una cabeza especializada. Sirve como referencia de diseno para enrutadores ligeros que clasifican la entrada y delegan en el componente adecuado sin coste de generacion.
- Generacion y validacion de datos sinteticos: el runtime incluye `data_gen.questions_for`, que produce los esquemas de preguntas por juego. Es reutilizable para crear conjuntos de decisiones etiquetadas con solucionadores exactos y para auditar la coherencia de un dataset antes de entrenar.
- Puerta de confianza (confidence gating) experimental: la primitiva `noul` ofrece una P(true) calibrada que puede usarse como umbral para decidir si se actua automaticamente o se escala a otro agente. Requiere recalibrar la temperatura sobre datos del dominio propio antes de usarla en produccion.
- Benchmark interno y ablaciones de decodificacion no autoregresiva: al no generar texto, aislar la contribucion del scorer de opciones frente a cabezas generativas permite medir el coste en precision de la decodificacion en una sola pasada (0,905 global en retenido) sin contaminacion por formato de salida.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto retenido de 600 partidas y 1.800 decisiones, ejecutados en una Tesla T4.

| Juego | Accuracy |
|---|---|
| temple-run (action / urgency / over) | 1.000 |
| snake (direction / risk / trapped) | 0.939 |
| tic-tac-toe (move / danger / block) | 0.772 |
| Global | 0.905, ECE 0.049 |

Curva de entrenamiento reportada: 0,824 → 0,862 → 0,876 (entropia cruzada) → 0,882 → 0,905 (RLCD); el ECE pasa de 0,060 a 0,042 tras la primera epoca de RLCD.

Latencia en Tesla T4 con fp16:

| Llamada | Latencia |
|---|---|
| 3 preguntas (caliente) | ~36 ms |
| 10 preguntas en lote | ~58 ms totales (~5,8 ms por pregunta) |
| Primera llamada (fria, calentamiento de CUDA) | ~700 ms, solo una vez |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan aproximadamente 656 MB en precision completa (~330 MB en fp16). Con 256 tokens de contexto maximo, el pico de memoria de activaciones es muy bajo; menos de 1 GB en fp16 es una estimacion razonable para el conjunto pesos mas activaciones.
- GPU recomendadas: Tesla T4 (es la GPU sobre la que se publican las latencias). Cualquier GPU consumer moderna sirve, ya que el modelo es pequeno.
- Cabe en GPU consumer: si, sin reservas. Modelos de 164M de parametros entran en GPUs con 4 GB o menos e incluso se pueden ejecutar en CPU con latencias aceptables.
- Opciones de despliegue: el repositorio incluye un runtime propio bajo `snapjudge/` (`common.py`, `agent.py`, `router.py`, `data_gen.py`) que se carga con `from snapjudge.agent import load` y un `GameRouter`. Requiere torch, transformers, safetensors, huggingface_hub y numpy. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF; al ser una cabeza de decision personalizada, el despliegue pasa por transformers mas el runtime del autor.
- Latencia y throughput: ~36 ms para 3 preguntas y ~58 ms para 10 preguntas en lote en T4 con fp16 (~5,8 ms por pregunta), con un coste de arranque en frio de ~700 ms por el calentamiento de CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto configurado | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SnapJudge | 163.983.622 (~165M) | 256 tokens por llamada | Decision no autoregresiva para tres juegos (tic-tac-toe, snake, temple-run) | Apache 2.0 | Hugging Face (Brutalsky111/Snapjudge) |
| Laya (convaiinnovations/laya) | no disponible | no disponible | Decision no autoregresiva por juego; inspira la arquitectura y el metodo RLCD de SnapJudge | Apache 2.0 | Hugging Face |
| ModernBERT-base (answerdotai/ModernBERT-base) | 149M | no disponible en la informacion proporcionada | Encoder bidireccional de proposito general; es el backbone que SnapJudge fine-tunea | Apache 2.0 | Hugging Face |

No se dispone de cifras de rendimiento de Laya ni de ModernBERT-base en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y naturaleza de la tarea.

## Limitaciones y advertencias

- Entrenamiento sobre posiciones sinteticas: las etiquetas provienen de solucionadores exactos (minimax, colision mas distancia Manhattan, tabla de obstaculos). Las distribuciones de juego humano difieren, y el propio autor recomienda reentrenar o ajustar sobre registros propios antes de confiar en un despliegue real.
- Cabeza mas debil: la eleccion entre 9 celdas en tres en raya es la peor del conjunto, con 0,772 de accuracy. Los errores se concentran en finales con tableros estrechos.
- Punto de control unico: hay un solo checkpoint conjunto para los tres juegos, sin expertos por juego. `GameRouter` admite acoplar expertos, pero no vienen incluidos.
- Calibracion dependiente del dominio: las probabilidades se ajustan por temperatura sobre datos sinteticos retenidos. Cualquier uso de la confianza como puerta de decision exige recalibrar sobre el dominio propio.
- Cobertura funcional muy estrecha: solo tres juegos, ingles unicamente y sin soporte documentado de tool calling, agentes multi-paso, vision ni audio. No es un modelo de proposito general.
- Sin resultados comparativos publicos: no hay benchmarks frente a alternativas en la informacion disponible, por lo que no se puede situar su rendimiento relativo de forma objetiva.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia cubre el artefacto tal cual; cualquier responsabilidad derivada de decisiones automatizadas en un juego o sistema real recae en quien lo despliega.
- Madurez: 0 descargas y 1 like en el momento de la consulta, sin senales de uso en produccion. Tratarlo como artefacto de investigacion, no como componente estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Brutalsky111/Snapjudge
- Modelo que inspira la arquitectura y el metodo RLCD (Laya, Convai Innovations): https://huggingface.co/convaiinnovations/laya
- Backbone ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base

No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
