# DuyKhongCay/lekiwi_chess_smolvla

## Resumen

`lekiwi_chess_smolvla` es un modelo de vision-lenguaje-accion (VLA) compacto desarrollado por el usuario DuyKhongCay, obtenido mediante fine-tuning de `lerobot/smolvla_base` sobre el dataset propio `DuyKhongCay/lekiwi_chess_v7`. El modelo esta disenado para controlar un robot de tipo `lekiwi` en tareas de manipulacion de piezas de ajedrez: mover, recoger y colocar peones, caballos, alfiles, torres, reinas y reyes en un tablero o en contenedores laterales. Con 450 millones de parametros, se posiciona como una politica de imitacion ligera que puede ejecutarse en hardware de consumo.

La relevancia de este modelo reside en su caracter especializado y en su pertenencia al ecosistema LeRobot de Hugging Face. SmolVLA, la arquitectura base, busca reducir el coste computacional de los modelos VLA manteniendo un rendimiento competitivo en tareas roboticas. Este fine-tuning concreto demuestra como un modelo base pequeno puede adaptarse a un dominio muy especifico (manipulacion de piezas de ajedrez) con relativamente pocos datos: 527 episodios y 234.233 frames a 25 FPS.

El modelo consume tres vistas de camara (muneca, lateral y cenital) de 384x384 pixeles junto con un vector de estado de 12 dimensiones, y produce un vector de accion de 6 dimensiones. Su licencia Apache 2.0 y su formato safetensors lo hacen directamente utilizable en flujos de trabajo de investigacion y prototipado con LeRobot. La fecha de creacion del repositorio (2026-10-28) y su escasa difusion (48 descargas, 0 likes) indican que se trata de un experimento reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) SmolVLA, fine-tuned desde `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (politica de imitacion, no modelo de lenguaje general) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las tareas se especifican en ingles en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Entradas visuales | 3 camaras: `observation.images.wrist`, `observation.images.side`, `observation.images.overhead`, cada una `(3, 384, 384)` |
| Entrada de estado | `observation.state` de forma `(12,)` |
| Salida de accion | `action` de forma `(6,)` |
| Tipo de robot | `lekiwi` |
| Libreria | lerobot |
| Tamano del repositorio | 10.6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, un VLA compacto que combina un codificador visual con un transformer de politica para mapear observaciones multimodales (imagenes de camara y estado del robot) a acciones de control. El fine-tuning parte de `lerobot/smolvla_base` y se ha realizado con LeRobot 0.6.1. La politica consume tres flujos visuales independientes de 384x384 y un vector de estado de 12 dimensiones, y emite comandos de accion de 6 dimensiones, adecuados para el robot `lekiwi`.

El entrenamiento se llevo a cabo sobre el dataset `DuyKhongCay/lekiwi_chess_v7`, compuesto por 527 episodios y 234.233 frames capturados a 25 FPS. Las tareas cubren un conjunto amplio de habilidades de manipulacion de ajedrez: mover piezas a un objetivo, recogerlas, colocarlas y limpiarlas hacia contenedores izquierdo o derecho, con variantes para las seis clases de pieza y ambos colores. La configuracion de entrenamiento fue de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 0.0001 y semilla 1000. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre el uso de RLHF o DPO, ya que se trata de aprendizaje por imitacion supervisado.

## Capacidades

- Control robotic de manipulacion de piezas de ajedrez sobre el robot `lekiwi`.
- Percepcion visual multimodal a partir de tres camaras simultaneas (muneca, lateral y cenital).
- Ejecucion de tareas de pick-and-place: mover una pieza a un objetivo, recogerla y colocarla.
- Clasificacion y manipulacion diferenciada por tipo de pieza (peon, caballo, alfil, torre, reina, rey) y color (blanco, negro).
- Tareas de limpieza: trasladar piezas a contenedores laterales izquierdo o derecho.
- Condicionamiento por instruccion en lenguaje natural mediante el parametro `--task` en el comando de rollout.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingues generales, al tratarse de una politica de imitacion y no de un modelo de lenguaje conversacional.

## Casos de uso

- Automatizacion de demostraciones de ajedrez roboticas: el modelo puede ejecutar secuencias de movimiento de piezas sobre un tablero fisico, util para ferias, laboratorios o divulgacion cientifica, aprovechando las tres vistas de camara para localizar cada pieza.
- Investigacion en aprendizaje por imitacion: sirve como caso de estudio reproducible de fine-tuning de SmolVLA sobre un dominio acotado, con dataset publico y configuracion de entrenamiento documentada (10.000 pasos, AdamW, lr 0.0001).
- Benchmark de manipulacion de objetos pequenos: las piezas de ajedrez son objetos de geometria variada y tamano reducido, lo que convierte al modelo en una referencia para evaluar precision de agarre y colocacion en robots de bajo coste.
- Prototipado de pipelines LeRobot: el comando `lerobot-rollout` permite desplegar la politica en un `lekiwi` real con camaras OpenCV, lo que facilita validar la integracion hardware-software antes de escalar a tareas mas complejas.
- Educacion en robotica: el modelo y su dataset asociado permiten a estudiantes entender el ciclo completo de captura de datos, entrenamiento de una politica VLA y evaluacion en robot real.
- Limpieza y clasificacion automatizada de piezas: las tareas de "clear ... to left/right bin" permiten usar el modelo para separar piezas por color o tipo en contenedores, un escenario de clasificacion fisica reutilizable en entornos de ensamblaje.
- Base para fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, puede reutilizarse como punto de partida para otras tareas de manipulacion con el mismo robot o con variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 millones de parametros, la inferencia en precision completa requiere aproximadamente 1,8 GB solo para pesos, mas el coste de los tres codificadores visuales y activaciones.
- GPU recomendadas: el modelo base SmolVLA esta disenado para hardware de consumo; se espera que funcione en GPUs consumer modernas, aunque no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, segun la descripcion de SmolVLA como modelo desplegable en hardware de consumo; no se detallan modelos exactos.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con `--strategy.type=base` y `--policy.path=DuyKhongCay/lekiwi_chess_smolvla`; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este modelo.
- Latencia y throughput: no disponibles. El dataset se capturo a 25 FPS, pero no se indica la frecuencia de inferencia alcanzable.
- Requisitos adicionales: robot `lekiwi` fisico, tres camaras OpenCV y el paquete `lerobot` instalado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DuyKhongCay/lekiwi_chess_smolvla` | 450 M | no disponible | VLA fine-tuned para lekiwi/ajedrez | apache-2.0 | Hugging Face (48 descargas) |
| `lerobot/smolvla_base` | no disponible en la informacion | no disponible | VLA base para fine-tuning | no disponible en la informacion | Hugging Face (modelo base) |
| Otros VLA de mayor tamano (p. ej. familias tipo OpenVLA) | no disponible en la informacion | no disponible | VLA generalistas | no disponible en la informacion | no disponible |

La comparacion cuantitativa con alternativas no es posible con los datos proporcionados; solo se confirma que este modelo deriva de `lerobot/smolvla_base` y que pertenece a la categoria de politicas VLA compactas del ecosistema LeRobot.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado para tareas de ajedrez con el robot `lekiwi`; no es un modelo de proposito general ni un LLM conversacional.
- Dependencia del hardware: requiere un robot `lekiwi` y tres camaras con los nombres y la configuracion exactos (`wrist`, `side`, `overhead`) para funcionar correctamente.
- Dataset limitado: 527 episodios y 234.233 frames pueden no cubrir variaciones de iluminacion, posiciones iniciales o fondos distintos a los del entorno de captura, con riesgo de degradacion fuera de distribucion.
- Riesgo de fallo en manipulacion: al ser una politica de imitacion, puede fallar en agarres de piezas pequenas o en colocaciones precisas no representadas suficientemente en los datos.
- Sin datos de benchmarks: no hay evidencia publicada de tasas de exito, por lo que no se puede garantizar su robustez en produccion.
- Sesgos: no documentados; podrian aparecer sesgos derivados de la configuracion fisica y del entorno de captura del dataset.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base y del dataset asociado.
- Idiomas: las instrucciones de tarea estan en ingles; no se documenta soporte multilingue.
- Fecha de creacion futura en los metadatos (2026-10-28): conviene verificar la vigencia y procedencia del repositorio antes de usarlo en entornos criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuyKhongCay/lekiwi_chess_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/DuyKhongCay/lekiwi_chess_v7
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=DuyKhongCay/lekiwi_chess_v7
