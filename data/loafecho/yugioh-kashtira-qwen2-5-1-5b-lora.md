# loafecho/yugioh-kashtira-qwen2.5-1.5b-lora

## Resumen

`loafecho/yugioh-kashtira-qwen2.5-1.5b-lora` es un adaptador LoRA de rango 16 (aproximadamente 74 MB) que convierte el modelo `Qwen/Qwen2.5-1.5B-Instruct` en un agente jugador de Yu-Gi-Oh! para el motor de codigo abierto EDOPro / ygopro-core. Lo desarrolla el usuario loafecho y se publica bajo licencia Apache 2.0. No es un modelo entrenado desde cero: es un ajuste fino supervisado sobre el modelo base de Qwen.

El adaptador resuelve un problema muy concreto: tomar decisiones de juego (que carta jugar, que activar, que atacar) a partir de una descripcion textual del tablero publico y de una lista de movimientos legales generada por el motor. El modelo puntua la letra de cada opcion y elige la de mayor probabilidad de forma greedy, sin muestreo ni busqueda. Se entrena exclusivamente para el mazo Kashtira y contra oponentes de tipo WindBot.

Su relevancia es la de un caso de estudio reproducible de imitation learning y DAgger aplicado a juegos de cartas con estado parcial y acciones discretas, con un presupuesto de 48 GPU-horas en una unica RTX 3060 de 12 GB. El modelo base Qwen2.5-1.5B-Instruct aporta la ventana de contexto y el tokenizador; el adaptador anade el comportamiento de juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones (modelo base); adaptador de ~74 MB, rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts de juego en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros. La innovacion no esta en la arquitectura sino en el pipeline de entrenamiento: se entrena un LoRA de rango 16 que modifica los pesos del modelo base para que, dado un prompt con la descripcion del tablero (puntos de vida, mano, campo, cementerios y resumenes de cartas) y una lista de opciones etiquetadas con letras (A, B, C...), asigne la mayor probabilidad al token correspondiente a la jugada optima. La inferencia es greedy pura, sin muestreo ni busqueda.

El entrenamiento se hizo en una RTX 3060 de 12 GB con un presupuesto de 48 GPU-horas, con el motor del juego en una maquina separada solo con CPU. Consta de tres fases: (1) imitacion supervisada de las jugadas que WindBot, el bot scriptado del motor, realiza con Kashtira (precision en movimientos de validacion de 0,903); (2) DAgger, en el que el modelo juega sus propias partidas y WindBot etiqueta las posiciones alcanzadas, anadiendo esas correcciones al conjunto de entrenamiento; y (3) cambios con puerta de calidad, donde cada modificacion (cambio de mazo de Cyber Dragon a Kashtira, salto de 0.5B a 1.5B) debia superar al mejor modelo previo en una evaluacion de 500 partidas con reglas fijadas de antemano. Se entreno tambien una cabeza de valor separada (AUC 0,85 prediciendo el ganador) que no forma parte de este adaptador.

## Capacidades

- Seleccion de acciones discretas en un juego de cartas: dado un estado textual y una lista de movimientos legales, elige la opcion con mayor logit.
- Juego del mazo Kashtira en el motor EDOPro / ygopro-core mediante el runner externo.
- Razonamiento implicito sobre estado parcial del tablero (puntos de vida, mano, campo, cementerios) codificado en el prompt.
- No soporta tool calling ni function calling en el sentido generico de LLM.
- No es un agente autonomo multi-paso: cada decision es una llamada independiente al modelo con el prompt regenerado por el motor.
- Capacidades multilingues: no documentadas; el entrenamiento se realizo en ingles.
- No dispone de vision, audio ni modo thinking explicito.

## Casos de uso

- Investigacion en imitation learning y DAgger: el repositorio y el harness permiten reproducir el pipeline de entrenamiento (imitacion, etiquetado con WindBot, evaluacion con puerta de calidad) sobre una sola GPU consumer, lo que lo hace util como banco de pruebas academico.
- Agente de referencia para benchmarks de juego de cartas: sirve como baseline de 1.5B parametros para comparar tecnicas de RL, busqueda o modelos mayores en el mismo entorno y reglas.
- Desarrollo de runners y harnesses: el adaptador valida el diseno de un runner en Rust sobre ygopro-core con worker de entrenamiento en GPU, util para quien construya infraestructura similar.
- Estudio de escalado modelo/mazo: el informe del autor cuantifica que el cambio de mazo aporto la mayor parte de la mejora (0,486 a 0,918) y que el salto de 0.5B a 1.5B solo sumo 0,004 con 2,6 veces mas computo, un dato practico para decisiones de asignacion de recursos.
- Evaluacion de robustez frente a mazos no vistos: las tasas por mazo (Blackwing 0,97, Dragunity 0,90, Zoodiac 0,47, Trickstar 0,42, Thunder Dragon 0,30) permiten estudiar generalizacion y sobreajuste al oponente de entrenamiento.
- Generacion de datos sinteticos de partidas: el agente puede jugar partidas masivamente contra WindBot para producir trayectorias etiquetadas que alimenten entrenamientos posteriores o analisis de estrategia.
- Prototipado de asistentes de juego: con el runner adecuado, puede integrarse en herramientas de analisis de linea de juego para el mazo Kashtira, siempre con fines de investigacion.

## Benchmarks y rendimiento

Resultados publicados por el autor (inferencia greedy, intervalos de Wilson al 95%):

| Oponente | Tasa de victoria | Partidas |
|---|---|---|
| WindBot (Cyber Dragon) | 0,936 [0,911; 0,954] | 500 |
| Agente de la ronda anterior (0.5B) | 0,940 [0,907; 0,962] | 300 |
| WindBot, 5 mazos agrupados | 0,610 | 300 |

Desglose por mazo frente a WindBot: Blackwing 0,97; Dragunity 0,90; Zoodiac 0,47; Trickstar 0,42; Thunder Dragon 0,30. Un empate cuenta como derrota.

Datos de entrenamiento y diagnostico: precision en movimientos de validacion 0,903; AUC de la cabeza de valor separada 0,85; coste de 48 GPU-horas en una RTX 3060. El autor senala que WindBot gana solo un 10% con el mazo Cyber Dragon antiguo y un 77% con Kashtira, y que mover el modelo de 0.5B a Kashtira alcanzo 0,918, mientras que el modelo de 1.5B solo anadio 0,004 con 2,6 veces mas computo por movimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el modelo base de 1.5B en precision completa ocupa aproximadamente 3 GB de pesos, y en cuantizacion de 8 bits o 4 bits cabe con holgura por debajo de 2 GB, aunque el autor no publica cifras.
- GPU recomendadas: el entrenamiento se realizo en una RTX 3060 de 12 GB; para inferencia basta con una GPU consumer de gama media.
- Cabe en GPU consumer: si, incluidas tarjetas de 8 GB o menos en cuantizacion.
- Opciones de despliegue: el codigo de ejemplo usa `transformers` y `peft` (`PeftModel.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el adaptador requiere el runner externo en Rust sobre ygopro-core para jugar.
- Latencia y throughput: no disponibles. El autor indica que el modelo de 1.5B consume aproximadamente 2,6 veces mas computo por movimiento que el de 0.5B, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yugioh-kashtira-qwen2.5-1.5b-lora | 1.5B + LoRA r16 | no disponible | 0,936 vs WindBot Cyber Dragon (500 partidas) | Apache 2.0 | Hugging Face |
| Agente previo del mismo autor (0.5B, Kashtira) | 0.5B + LoRA | no disponible | 0,918 vs WindBot Cyber Dragon; 0,940 frente al de 1.5B en 300 partidas | no disponible | no disponible |
| WindBot (bot scriptado de referencia) | no aplica (script) | no aplica | 0,77 con Kashtira; 0,10 con Cyber Dragon | no disponible | integrado en el motor |

No se dispone de datos publicados de otros adaptadores de Yu-Gi-Oh! comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Un solo mazo: solo juega Kashtira y solo ha visto oponentes de estilo WindBot; rinde claramente peor contra mazos no vistos (Thunder Dragon 0,30, Trickstar 0,42).
- Nivel de juego limitado: aprende principalmente copiando un bot scriptado, por lo que no alcanza nivel humano; la tasa de 0,936 se mide contra ese bot, no contra jugadores.
- Dependencia del runner: los prompts los genera el runner de codigo abierto en Rust sobre ygopro-core; el adaptador no puede jugar una partida por si solo.
- Sin datos de cartas: nombres y textos de cartas pertenecen a Konami; el repositorio solo contiene pesos y descripcion, lo que limita su uso directo sin infraestructura adicional.
- Riesgo de alucinacion: al puntuar letras de opciones, un fallo de formato del prompt puede producir una eleccion invalida; el motor debe validar la accion.
- Sesgos: el comportamiento hereda las heuristicas de WindBot y puede reproducir sus puntos debiles estrategicos.
- Licencia Apache 2.0 sobre los pesos del adaptador, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia que debe respetarse; el uso comercial del agente en entornos de Yu-Gi-Oh! puede verse afectado por derechos de propiedad intelectual de Konami.
- Idiomas: no se documenta soporte multilingue; los prompts estan en ingles.
- Contexto: la longitud de contexto efectiva no se especifica y depende del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loafecho/yugioh-kashtira-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Runner y harness de entrenamiento: https://github.com/loafecho/ygo-duel-agent
