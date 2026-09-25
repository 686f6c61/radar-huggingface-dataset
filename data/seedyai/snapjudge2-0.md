# Seedyai/SnapJudge2.0

## Resumen

SnapJudge 2.0 es una familia de modelos de decisión no autorregresivos orientada a juegos, desarrollada por Seedyai. No es un modelo generativo de texto: recibe un estado de juego (tablero de tres en raya, rejilla de Conecta 4, estado de serpiente, laberinto u obstáculo de Temple Run) junto con preguntas tipadas y devuelve respuestas también tipadas con probabilidades calibradas en un único forward pass. El checkpoint conjunto tiene 421.293.830 parámetros activos, aunque la familia completa (un checkpoint conjunto más cinco expertos por juego) suma aproximadamente 2.500 millones de pesos, con 421 millones activos por petición.

El modelo parte de `answerdotai/ModernBERT-large` (395 M, bidireccional) como backbone totalmente ajustado, al que se añade una cabeza de decisión entrenada desde cero. La innovación principal es el uso de RLCD (reinforcement learning contra reglas de puntuación estrictamente propias), de modo que las probabilidades honestas maximizan la recompensa, junto con un enrutador (`GameRouter`) que detecta el juego en menos de 1 ms en Python puro y despacha al experto correspondiente.

Es relevante ahora porque propone una alternativa a las APIs de decisión generativas: al no generar texto, no hay nada que parsear ni que pueda alucinar, la salida es estructurada y calibrada, y la latencia es muy baja (~53 ms en una T4 con fp16). La versión 2.0 amplía el backbone, cuadruplica el contexto, añade dos juegos nuevos (Conecta 4 y laberinto) e introduce expertos por juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (ModernBERT-large) + cabeza de decision propia (2 capas transformer, d=1024, scorer de marcadores de opcion y act head) |
| Parametros totales | 421.293.830 (checkpoint conjunto); ~2,5 mil millones en toda la familia (1 conjunto + 5 expertos) |
| Parametros activos | 421 millones por peticion (enrutado tipo MoE por claves de juego, no por gate aprendido) |
| Longitud de contexto | 1024 tokens (`head_max_len = 256`); ampliable a 512 para preguntas de mas de 50 opciones |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un backbone `ModernBERT-large` (395 M, bidireccional, totalmente ajustado) con una cabeza de decisión entrenada desde cero compuesta por dos capas transformer (d=1024), un scorer de marcadores de opción y una act head. El formato de entrada es `[CLS] <type> instructions [SEP] [MASK] opt0 [MASK] opt1 … [SEP] state [SEP]`, donde cada opción se puntúa en su propio token `[MASK]` y se aplica softmax por pregunta, lo que permite admitir esquemas nuevos sin reentrenar. El modelo es no autorregresivo: nunca genera texto. La familia incluye un checkpoint conjunto y cinco expertos por juego (~2,5 mil millones de pesos totales, 421 M activos por petición); el enrutador decide el checkpoint en menos de 1 ms en Python puro, antes del forward pass.

El entrenamiento usó 7.500 partidas sintéticas (22.500 decisiones tipadas, 5 juegos) con etiquetas de solucionadores exactos: minimax (tres en raya), 1-ply con prior de centro (Conecta 4), colisión y distancia Manhattan a la comida (serpiente), BFS de camino más corto (laberinto) y tabla de obstáculos (Temple Run), con aumento por barajado de opciones para evitar inestabilidad ante el orden. El proceso fue: pretrain supervisado con entropía cruzada (3 épocas) y después ajuste RLCD (2 épocas, ruido gaussiano en los logits más recompensa con reglas de puntuación propias log/spherical/RPS y baseline estilo GRPO) sobre 2×T4 con DDP y fp16. La curva reportada es 0,664 → 0,680 → 0,723 (CE) → 0,780 → 0,813 (RLCD). Los expertos se entrenaron una época por juego a partir del checkpoint conjunto (1e-5). La calibración final refita una temperatura por par (tipo de pregunta, cubeta de número de opciones) sobre datos reservados.

## Capacidades

- Decisión tipada sobre estados de juego en un único forward pass: tres en raya, Conecta 4, serpiente, laberinto y Temple Run.
- Primitiva `choice`: etiqueta superior más probabilidades por opción y confianza (por ejemplo `next_move` con 9 celdas o 7 columnas, `direction` con 4, `action` con 5).
- Primitiva `score`: nivel ordinal esperado y su distribución (por ejemplo `danger`, `threat`, `risk`, `progress`, `urgency`, cada uno con 3 niveles).
- Primitiva `noul`: probabilidad calibrada P(true) para preguntas booleanas como `must_block`, `will_die`, `dead_end` o `game_over_soon`.
- Enrutado automático por juego con `GameRouter` (detección en menos de 1 ms) y posibilidad de forzar checkpoint con `model=`.
- Gestión de memoria con `GameRouter(max_loaded=2)` (dos checkpoints en caliente con expulsión LRU) y `router.unload()`.
- Soporte de esquemas nuevos sin reentrenar gracias a los marcadores de opción.
- No soporta tool calling, function calling, agentes, multimodalidad ni generación de texto, ya que no es un modelo generativo.

## Casos de uso

- Agentes de juego por turnos: integrado en un bucle de partida, el modelo devuelve el siguiente movimiento con probabilidad por celda o columna, lo que permite usar la distribución como política (muestreo o argmax) en tres en raya y Conecta 4.
- Bots de serpiente y laberinto en tiempo real: con ~53 ms por forward pass en T4 fp16, la latencia encaja en bucles de decisión donde cada frame requiere recalcular dirección, riesgo o si el agente está atrapado.
- Evaluación automática de posiciones: las primitivas `score` y `noul` permiten puntuar peligro, amenaza o urgencia de un estado sin necesidad de un solver completo, útil como heurística en motores de búsqueda.
- Señal auxiliar para RL: al devolver probabilidades calibradas (ECE 0,190 tras escalado de temperatura), puede actuar como función de valor o prior en políticas de aprendizaje por refuerzo.
- Filtrado y clasificación de estados en pipelines de datos: la cabecera es `text-classification`, de modo que puede etiquetar grandes lotes de estados de juego con decisiones tipadas.
- Enseñanza o análisis de estrategia: sobre un estado dado, el modelo expone qué movimiento es mejor, qué amenazas existen y con qué confianza, útil en herramientas didácticas de juegos de tablero.
- Control de personaje en Temple Run: la primitiva `action` (5 clases) permite decidir acciones inmediatas ante obstáculos descritos en texto o JSON.
- Componente de enrutado rápido: el `GameRouter` por sí solo puede reutilizarse para clasificar el tipo de juego antes de despachar a otros sistemas.

## Benchmarks y rendimiento

Evaluación con semilla nueva 999: 1.000 partidas y 3.000 decisiones, en T4. Sistema enrutado (experto por juego, empates resueltos a favor del conjunto):

| Juego (tareas) | Conjunto | Experto | Enrutado |
|---|---|---|---|
| tres en raya (movimiento/peligro/bloqueo) | 0,717 | 0,800 | experto |
| serpiente (direccion/riesgo/atrapado) | 0,992 | 0,997 | experto |
| Temple Run (accion/urgencia/fin) | 1,000 | 1,000 | conjunto (empate) |
| Conecta 4 (movimiento/amenaza/bloqueo) | 0,692 | 0,745 | experto |
| laberinto (direccion/progreso/sin salida) | 0,843 | 0,845 | experto |
| global (consciente de empates) | 0,849 | — | ≈0,877 |

Datos adicionales del checkpoint conjunto: precisión en elección estricta 0,710; ECE 0,190 (tras escalado de temperatura); precisión en casos duros 0,719 (finales, trampas y callejones sin salida; la referencia citada de JevBench en casos duros es 0,74). Una pregunta de estrés con 20 opciones se supera (sonda de paridad con Jev). En velocidad, el autor reporta ~53 ms por forward pass en T4 con fp16 y ~5 ms en una llamada de 3 preguntas sobre un estado (dato truncado en la model card); la tabla de latencias detallada no está completa en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint activo (421 M) ocupa aproximadamente 0,85 GB en fp16/bf16 y unos 1,7 GB en fp32. El repositorio completo son 10,1 GB, pero solo se cargan los checkpoints a los que se enruta.
- GPU recomendadas: cualquier GPU con unos pocos GB libres es suficiente. El autor reporta entrenamiento en 2×T4 (DDP + fp16) e inferencia medida en Tesla T4; también cabe en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, con holgura. Una RTX 3060 de 12 GB puede mantener varios checkpoints calientes con `max_loaded`.
- Opciones de despliegue: al ser un encoder no autorregresivo, no aplica vLLM, llama.cpp, Ollama ni TGI en su forma habitual. El despliegue se realiza con PyTorch, Transformers, safetensors, huggingface_hub, numpy y accelerate, más el paquete `snapjudge` incluido en el propio repositorio (`snapjudge.agent.load`, `snapjudge.router.GameRouter`, `snapjudge.data_gen.questions_for`).
- Latencia y throughput: ~53 ms por forward pass (T4, fp16); menos de 1 ms para el enrutado en Python puro; ~5 ms para 3 preguntas sobre un estado (medición parcial). El throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros activos | Contexto | Precisión en casos duros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SnapJudge 2.0 | 421 M | 1024 tokens | 0,719 (global conjunto); ≈0,877 enrutado | apache-2.0 | HuggingFace |
| Jev | no disponible | no disponible | 0,74 (JevBench, dato citado por el autor) | no disponible | API de decisión cerrada, sirve hasta 255 opciones |

No se han identificado en la información disponible otros modelos comparables de decisión no autorregresiva para juegos. Los datos de Jev proceden de la propia model card de SnapJudge 2.0 y no se han verificado de forma independiente.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`) y no es multilingüe.
- No genera texto: cualquier tarea que requiera salida en lenguaje natural queda fuera de su alcance.
- Dominio muy restringido: únicamente los cinco juegos cubiertos (tres en raya, Conecta 4, serpiente, laberinto, Temple Run) más los estados que el enrutador derive al checkpoint conjunto. Fuera de ese ámbito no hay garantía de comportamiento útil.
- Riesgo de mal calibración en tipos de pregunta o cubetas de opciones no representados en los datos de refit; el ECE reportado (0,190) no es cero.
- Requiere que el estado se serialice en el formato esperado (texto o JSON) y respetar el presupuesto de 1024 tokens; preguntas con más de 50 opciones necesitan subir `head_max_len` a 512.
- No hay datos públicos de sesgos, robustez ante entradas adversarias ni comportamiento fuera de distribución.
- El modelo se apoya en solucionadores sintéticos (minimax, BFS, etc.) para generar etiquetas, por lo que hereda los supuestos de esos solvers (por ejemplo, minimax sin profundidad limitada o heurísticas 1-ply en Conecta 4).
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio tiene 0 descargas y 2 likes en el momento de la consulta, por lo que la validación por terceros es mínima.
- Las fechas de creación y actualización reportadas (2026-09-25) son las que figuran en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Seedyai/SnapJudge2.0
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Repositorio de VJEPA2 (resultado de búsqueda, no relacionado directamente): https://github.com/facebookresearch/vjepa2
- Lista de modelos gratuitos (resultado de búsqueda, no relacionado directamente): https://github.com/ClawLabsAI/free-ai-models
