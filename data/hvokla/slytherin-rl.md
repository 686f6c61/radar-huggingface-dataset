# HvOkla/Slytherin-RL

## Resumen

Slytherin v1.0 (Snake) es un agente de aprendizaje por refuerzo (RL) desarrollado por HvK Okla que resuelve una única tarea: jugar al clasico juego de la serpiente (Snake) sobre un tablero de 10x10. No es un modelo de lenguaje ni un transformer generativo; es una politica PPO entrenada con Stable-Baselines3 sobre PyTorch y exportada a ONNX. El repositorio de Hugging Face ocupa 0,0 GB y contiene unicamente los artefactos del agente, lo que es coherente con su reducido tamano: 9.285 parametros en total.

El interes del proyecto no reside en la tarea en si, sino en su uso declarado como banco de pruebas para despliegue de IA en el borde (Edge AI): el autor reporta que la inferencia en ONNX Runtime es 10,16 veces mas rapida que en PyTorch sobre CPU. Esto lo convierte en un ejemplo minimalista para medir el coste de exportar y ejecutar politicas RL en entornos con recursos limitados.

La model card es escueta y no documenta arquitectura de red, hiperparametros de PPO, ni resultados de evaluacion mas alla de las metricas de entrenamiento. La ficha que sigue refleja exclusivamente lo declarado por el autor; cualquier dato no presente se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica PPO (Stable-Baselines3 / PyTorch); topologia no detallada |
| Parametros totales | 9.285 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de 4 variables continuas: Head X, Head Y, Food X, Food Y) |
| Tipos de cuantizacion | no disponible; exportacion a ONNX Runtime |
| Idiomas soportados | no aplica (Python como lenguaje de implementacion) |
| Licencia | Apache 2.0 (segun model card); el campo de licencia del repo en Hugging Face figura como no disponible |
| Formato de pesos | ONNX (tag del repo); pesos PyTorch originales no confirmados en el repo |

## Arquitectura y entrenamiento

El agente implementa una politica de aprendizaje por refuerzo con el algoritmo Proximal Policy Optimization (PPO) sobre el framework Stable-Baselines3 y PyTorch. La observacion es un vector de 4 variables continuas (coordenadas de la cabeza y de la comida) y el espacio de acciones es discreto con 4 opciones (arriba, abajo, izquierda, derecha). El entrenamiento se realizo mediante self-play en un entorno Snake personalizado construido con Pygame-CE, sin datasets externos, durante 50.000 pasos de entrenamiento.

La funcion de recompensa es explicita y simple: +10 al comer, -10 al colisionar con pared o con el propio cuerpo, y 0 en el resto de transiciones. No se documenta en la informacion disponible si hubo ajuste fino posterior, curricula, reward shaping adicional ni tecnicas como decodificacion especulativa (no aplicables a este tipo de modelo). La innovacion tecnica destacable es la exportacion a ONNX Runtime, que el autor cuantifica como 10,16 veces mas rapida que PyTorch en CPU.

## Capacidades

- Control de agente en el juego Snake sobre tablero de 10x10 con 4 acciones discretas.
- Toma de decision a partir de un vector de 4 coordenadas (cabeza y comida); no procesa imagen ni mapa completo.
- Inferencia optimizada via ONNX Runtime para despliegue en CPU y entornos de borde.
- Entrenamiento reproducible mediante PPO con Stable-Baselines3 (el autor publica el repositorio GitHub del motor modular).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues, vision, audio ni modo de pensamiento.
- No generaliza a otros juegos ni a navegacion robotica sin reentrenamiento.

## Casos de uso

- Benchmark de Edge AI: medir la ganancia de rendimiento de ONNX Runtime frente a PyTorch (10,16x en CPU) en un agente de 9.285 parametros, como referencia para decisiones de despliegue en dispositivos empotrados.
- Prueba de concepto docente de RL: ejemplo minimo y reproducible de PPO con observaciones vectoriales y recompensa discreta para cursos de aprendizaje por refuerzo.
- Validacion de pipelines de exportacion ONNX: usar el modelo como caso de prueba para verificar conversiones, cuantizacion y compatibilidad de operadores en herramientas de despliegue.
- Entorno de comparacion de frameworks: banco para contrastar latencia de Stable-Baselines3, PyTorch y ONNX Runtime bajo la misma politica.
- Base para experimentos de reward shaping: el autor documenta la funcion de recompensa, lo que facilita modificarla y estudiar su efecto en la politica resultante.
- Demo interactiva de Game AI: integrar el agente en una aplicacion Pygame-CE para mostrar comportamiento aprendido en tiempo real con bajo coste computacional.
- Punto de partida para extensiones de observabilidad: reentrenar con vision del tablero (paredes y cuerpo) para superar la limitacion declarada de supervivencia en puntuaciones altas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un agente RL de este tipo. Las unicas metricas reportadas por el autor son de entrenamiento y despliegue:

| Metrica | Valor |
|---|---|
| Pasos de entrenamiento | 50.000 |
| Recompensa media por episodio | ~15,2 |
| Longitud media de episodio | ~27,3 |
| Parametros del modelo | 9.285 |
| Aceleracion ONNX Runtime vs PyTorch (CPU) | 10,16x |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; con 9.285 parametros el modelo ocupa del orden de decenas de kilobytes en precision completa.
- GPU recomendadas: no requiere GPU; el autor reporta inferencia en CPU con ONNX Runtime. Cualquier GPU consumer (por ejemplo, RTX 4090) es sobredimensionada para esta carga.
- Cabe en cualquier GPU consumer y en CPU de gama baja, asi como en dispositivos de borde.
- Opciones de despliegue: ONNX Runtime (via documentada por el autor), PyTorch/Stable-Baselines3 para carga de la politica original.
- Latencia y throughput: no se publican valores absolutos; solo la relacion 10,16x a favor de ONNX Runtime en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la busqueda proporcionada. Los resultados web obtenidos corresponden a LoRA de generacion de imagenes (PixAI) sin relacion tecnica con este agente RL, por lo que no se incluyen como alternativas validas.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slytherin v1.0 (Snake) | 9.285 | no aplica | Snake 10x10 (RL) | Apache 2.0 (segun model card) | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Vision parcial: el agente solo observa coordenadas de cabeza y comida; no percibe paredes ni su propio cuerpo, lo que limita la supervivencia en puntuaciones altas.
- Especificidad de tablero: entrenado en 10x10; puede fallar en tableros mayores.
- Generalizacion nula: no puede jugar otros juegos ni realizar navegacion robotica sin un nuevo entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero la politica puede tomar acciones suboptimas por la representacion incompleta del estado.
- Sesgos conocidos: no documentados por el autor; el entrenamiento es self-play sin datos externos.
- Licencia: la model card declara Apache 2.0, pero el campo de licencia del repositorio en Hugging Face figura como no disponible; conviene verificar antes de uso comercial.
- Caveat de produccion: las metricas de rendimiento son relativas (10,16x) y no se acompanan de latencias absolutas ni de la configuracion de hardware empleada.
- El repositorio de Hugging Face tiene 0 descargas y 1 like, lo que indica ausencia de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/HvOkla/Slytherin-RL
- Repositorio GitHub: https://github.com/HvKOkla/Slytherin-RL
- Documentacion de Stable-Baselines3: https://stable-baselines3.readthedocs.io/
- ONNX Runtime: https://onnxruntime.ai/
- Pygame-CE: https://pyga.me/
