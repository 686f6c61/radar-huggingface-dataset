# ricoz/tongits-rl-champions

## Resumen

`ricoz/tongits-rl-champions` es un conjunto de nueve modelos de aprendizaje por refuerzo (RL) desarrollados por `ricoz` para el juego de cartas filipino Tongits (o Tong-its). Estos modelos no son modelos de lenguaje: son políticas neuronales diseñadas para tomar decisiones de juego en un entorno de información imperfecta de tres jugadores. El repositorio publica la política base de producción, denominada *Carolina Reaper*, junto a ocho variantes fine-tuned con estilos de juego diferenciados (personas) que han sido entrenadas mediante *reward shaping* para exhibir comportamientos verificables, como agresividad, farol o acumulación de melds.

La arquitectura es una red neuronal feedforward compacta de tres capas ocultas de 512 unidades con activación Mish, que recibe un vector de observación de 349 valores normalizados y emite 75 logits de acción, junto a una cabeza de valor. Todos los modelos se exportan en formato ONNX para lograr una inferencia sub-milisegundo, lo que permite su despliegue en Python, Node.js y WebAssembly en el navegador. La relevancia del proyecto radica en su aplicación real en la plataforma Tongits.io y en su contribución al estudio de agentes en juegos de información imperfecta con personalidades diferenciadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward con 3 capas ocultas de 512 unidades, activación Mish, cabeza de política (75 logits) y cabeza de valor (1 float) |
| Parametros totales | No disponible (cada modelo ONNX ocupa 2.84 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (el modelo no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | tl, en (según metadata; el modelo no genera lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, PyTorch .pt (solo `policy-champion.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa (MLP) con tres capas ocultas de 512 neuronas y activación Mish. El modelo recibe una observación de 349 características normalizadas, que incluyen la ubicación de las cartas, historial de descartes, composición de melds, tamaños de mano, estimaciones de deadwood, parámetros económicos de la partida y características de racha de partidas. La salida es un conjunto de 75 logits de acción, que abarca robar del mazo, chow desde descartes, exponer melds, sapaw sobre un objetivo, declarar fight, aceptar desafíos, retirarse y descartar. Para garantizar el cumplimiento de las reglas del juego, se aplica un enmascaramiento de acciones mediante un vector booleano de 75 valores, donde las acciones ilegales se penalizan con `-1e9` antes del softmax.

El entrenamiento se ha realizado con PPO en un entorno multi-agente de Tongits, con un diseño de recompensas que incluye recompensas por victorias, diferencias de dinero por mano y penalizaciones. A partir de la política campeona (*Carolina Reaper*), se han fine-tuned ocho personas con *reward shaping* restringido, cada una con un objetivo táctico distinto: *Serrano* optimiza la limpieza rápida de mano, *Habanero* aumenta la tasa de fights, *Ghost Pepper* incrementa el farol y las llamadas a fight, *Cayenne* favorece la ocultación total hasta el final, entre otros. No se ha publicado información sobre el número de tokens de datos, el tamaño del dataset de entrenamiento ni los detalles de la composición del entorno de simulación.

## Capacidades

- Juego de Tongits: el modelo es capaz de seleccionar acciones legales en cada turno de una partida de Tongits de tres jugadores con información imperfecta.
- Cumplimiento de reglas: el enmascaramiento de acciones asegura que el modelo nunca ejecute movimientos ilegales, aplicando máscaras booleanas de 75 dimensiones.
- Valoración de estados: la cabeza de valor proporciona una estimación numérica de la recompensa esperada, útil para análisis de posiciones.
- Nueve políticas diferenciadas: incluye la campeona base y ocho personas con estilos tácticos verificables (agresiva, defensiva, farol, acumuladora, saboteadora, etc.).
- Despliegue multiplataforma: gracias a ONNX, el modelo puede ejecutarse en Python (`onnxruntime`), Node.js (`onnxruntime-node`) y navegador (`onnxruntime-web`) sin necesidad de GPU.
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no soporta tool calling ni razonamiento de propósito general.

## Casos de uso

- Bot para la plataforma Tongits.io: la política campeona puede integrarse como oponente en el juego online, ofreciendo un rival equilibrado y consistente que respeta todas las reglas del juego.
- Simulación de jugadores humanos: las ocho personas fine-tuned permiten generar oponentes con estilos reconocibles (agresivo, farolero, defensivo), útiles para probar estrategias o para ofrecer modos de juego variados.
- Investigación en juegos de información imperfecta: el modelo sirve como referencia para comparar agentes de RL en juegos de cartas, especialmente en el análisis de estilos de juego y equilibrio de Nash aproximado.
- Oponente en aplicaciones móviles o web: gracias a ONNX WebAssembly, el modelo puede ejecutarse directamente en el navegador con latencia sub-milisegundo, sin servidor dedicado.
- Análisis de estrategias con la cabeza de valor: los desarrolladores pueden extraer la estimación de valor para evaluar posiciones concretas y estudiar decisiones óptimas en estados del tablero.
- Generación de datos de entrenamiento para otros agentes: al ejecutar múltiples simulaciones con las distintas políticas, se pueden recopilar trayectorias de juego y decisiones que sirvan como datos para entrenar o validar otros modelos de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje. El autor proporciona una tabla de evaluación interna donde cada persona se compara contra la política campeona (*Carolina Reaper*) en términos de tasa de victorias y diferencia de dinero por mano:

| Modelo | Persona | Tasa de victorias vs control | Money delta / mano |
|---|---|---|---|
| `policy-champion.onnx` | Carolina Reaper (Champion) | 28.3% | Baseline (Control) |
| `policy-tongits-hunter.onnx` | Serrano (Tongits Hunter) | 29.4% vs 28.3% | +0.085 ± 0.074 |
| `policy-aggressive-fighter.onnx` | Habanero (Aggressive Fighter) | 31.2% vs 28.3% | +0.103 ± 0.076 |
| `policy-secret-hunter.onnx` | Sili Labuyo (Secret Hunter) | 28.9% vs 28.3% | +0.072 ± 0.071 |
| `policy-safe-grinder.onnx` | Poblano (Defensive Grinder) | 28.5% vs 28.3% | +0.041 ± 0.068 |
| `policy-wild-bluffer.onnx` | Ghost Pepper (Wild Bluffer) | 32.6% vs 28.3% | +0.092 ± 0.075 |
| `policy-chow-fiend.onnx` | Jalapeño (Chow Fiend) | 30.5% vs 28.3% | +0.071 ± 0.071 |
| `policy-deep-cover.onnx` | Cayenne (Deep-Cover Hoarder) | 27.5% vs 28.3% | +0.124 ± 0.071 |
| `policy-sapaw-saboteur.onnx` | Scotch Bonnet (Sapaw Saboteur) | 27.7% vs 28.3% | −0.017 ± 0.075 |

Los resultados indican que las personas obtienen tasas de victoria y diferencias de dinero variables frente a la política base, lo que confirma que los estilos entrenados son distintos y medibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; los modelos ONNX ocupan aproximadamente 2.84 MB y se ejecutan en CPU.
- GPU recomendadas: no necesarias; la carga de trabajo de inferencia es muy ligera y está optimizada para CPU.
- Compatibilidad con consumer GPU: no aplica, ya que no se necesita aceleración gráfica.
- Opciones de despliegue: ONNX Runtime (Python), ONNX Runtime Node.js, ONNX Runtime Web (WebAssembly), o directamente en navegador.
- Latencia y throughput: el autor indica inferencia sub-milisegundo por modelo en CPU, lo que permite ejecutar múltiples agentes simultáneamente en simulaciones de alta frecuencia.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables públicamente disponibles en la información proporcionada. El modelo es específico para Tongits y no existe una categoría de modelos de RL para este juego con características similares documentadas en el repositorio.

## Limitaciones y advertencias

- El modelo no es un modelo de lenguaje: no puede generar texto, responder preguntas ni realizar tareas de razonamiento general.
- Es un agente especializado en Tongits; su capacidad no se transfiere a otros juegos de cartas ni a dominios diferentes.
- El entrenamiento se ha realizado en un entorno de simulación multi-agente; el rendimiento en la plataforma real puede variar por diferencias en la implementación del juego o en la distribución de partidas.
- No se ha publicado información sobre el dataset de entrenamiento, los sesgos del entorno ni las condiciones de recompensa, lo que dificulta la reproducibilidad completa.
- Aunque la licencia Apache-2.0 permite uso comercial, es necesario mantener la atribución y la inclusión del aviso de licencia.
- No se ofrecen garantías de equilibrio de juego; las personas pueden presentar comportamientos extremos que resulten poco realistas o explotables.
- El tamaño del repositorio aparece como 0.0 GB en HuggingFace, lo que puede deberse a que los archivos ONNX son muy pequeños (2.84 MB cada uno) y no se han contabilizado correctamente en la metadata.

## Enlaces

- HuggingFace: https://huggingface.co/ricoz/tongits-rl-champions
- GitHub (juego Tongits original de 2003): https://github.com/ricoz/tongits
- Web del juego Tongits.io: https://tongits.io (mencionado en el README)
