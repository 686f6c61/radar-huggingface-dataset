# SEONGMIN1234/smolvla_pick-two-cubes

## Resumen

SmolVLA es un modelo visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación a partir de observaciones multimodales. Esta ficha concreta, `SEONGMIN1234/smolvla_pick-two-cubes`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset propio de 50 episodios que cubre dos tareas de manipulación: coger un cubo amarillo y un cubo azul y depositarlos en una caja.

El modelo resuelve el problema de llevar políticas VLA a hardware de consumo: con unos 450 millones de parámetros y un repositorio de 0,9 GB, puede ejecutarse en GPUs asequibles y desplegarse sobre un robot tipo `so_follower` (SO-100/SO-101 de LeRobot) equipado con cámara cenital y de muñeca. Es relevante porque demuestra el flujo completo de ajuste fino de una política robótica con LeRobot 0.6.0 en unas pocas horas de entrenamiento.

La arquitectura subyacente es la descrita en el paper SmolVLA (arXiv:2506.01844), un modelo que combina un codificador visual-lenguaje con un decodificador de acciones. Esta variante concreta está especializada en una tarea muy acotada y no debe considerarse un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) segun SmolVLA; backbone no detallado en la model card |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, un VLA compacto presentado en el paper SmolVLA (arXiv:2506.01844), que combina percepcion visual, comprension de instrucciones en lenguaje natural y generacion de acciones motoras en un unico modelo. La model card de este ajuste no detalla la composicion interna del backbone ni el numero de tokens de preentrenamiento; solo se confirma que la politica consume estado proprioceptivo de 6 dimensiones y hasta tres imagenes de 256x256, y produce un vector de accion de 6 dimensiones.

El ajuste fino se realizo con LeRobot 0.6.0 sobre el dataset `SEONGMIN1234/pick-two-cubes`: 50 episodios, 18.605 frames a 15 FPS, con dos instrucciones de tarea ("Pick up the yellow cube and put it in the box." y "Pick up the blue cube and put it in the box."). La configuracion de entrenamiento fue de 20.000 pasos, batch de 32, optimizador AdamW, learning rate 1e-4 y semilla 42. No se documenta uso de RLHF, DPO ni tecnicas de refuerzo; se trata de aprendizaje por imitacion supervisado.

## Capacidades

- Generacion de acciones de robot de 6 grados de libertad a partir de observaciones visuales y estado proprioceptivo.
- Seguimiento de instrucciones de tarea en lenguaje natural (en ingles) para discriminar entre los dos objetos objetivo (cubo amarillo y cubo azul).
- Fusion de multiples vistas: camara cenital (`overhead`) y camara de muneca (`wrist`), con soporte para hasta tres flujos visuales de 256x256.
- Control reactivo en bucle cerrado a partir de imagenes en tiempo real, adecuado para tareas de pick-and-place.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: es una politica motora, no un LLM conversacional.
- Capacidades multilingues: no documentadas; las instrucciones de entrenamiento estan en ingles.

## Casos de uso

- Pick-and-place de objetos de color en entornos de laboratorio: el modelo coge un cubo amarillo o azul y lo deposita en una caja, usando la instruccion de tarea para seleccionar el objetivo. Es su caso de uso directo y unico documentado.
- Banco de pruebas para aprendizaje por imitacion: sirve como referencia para validar el pipeline completo de LeRobot (grabacion de datos, entrenamiento, rollout) antes de escalar a tareas propias.
- Prototipado de robots de bajo coste: con 450 M de parametros y 0,9 GB de pesos, se puede ejecutar en una GPU de consumo junto al robot SO-100/SO-101, lo que facilita demos educativas.
- Investigacion en generalizacion de politicas VLA: permite estudiar como se comporta un modelo pequeno ante cambios de posicion, iluminacion o distracciones en un dominio muy acotado.
- Automatizacion de tareas repetitivas de clasificacion de piezas por color en celdas de montaje simples, siempre que el entorno se parezca al del dataset de entrenamiento.
- Base para ajuste fino adicional: al derivar de `smolvla_base` y publicarse con licencia Apache 2.0, puede reentrenarse con nuevos datasets para ampliar el repertorio de objetos o tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parametros en precision completa (fp32, ~1,8 GB de pesos) se puede inferir comodamente en GPUs con 8 GB o mas. En fp16/bf16 el peso ronda los 0,9 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM; una RTX 4090 o A100 sobran para esta carga.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060/4060 y superiores, aunque el dato no esta confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) como via oficial; el formato safetensors es compatible con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica motora.
- Latencia y throughput: no disponibles. El control se ejecuta a la frecuencia del bucle de inferencia del robot; el dataset se grabo a 15 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEONGMIN1234/smolvla_pick-two-cubes | 450 M | VLA ajustado a pick-and-place | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible en la informacion | VLA base preentrenado | no disponible | Apache 2.0 (segun repositorio base) | Hugging Face |
| OpenVLA | no disponible en la informacion | VLA generalista | no disponible | no disponible | Hugging Face |
| pi0 (Physical Intelligence) | no disponible en la informacion | VLA generalista | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparacion se limita a categoria y licencia.

## Limitaciones y advertencias

- Especializacion extrema: solo se ha entrenado para dos tareas concretas (coger el cubo amarillo o el azul y meterlo en la caja); fuera de ese dominio no cabe esperar un comportamiento util.
- Sin evaluacion publicada: el autor no reporta tasas de exito en robot real, por lo que se desconoce su fiabilidad.
- Dataset muy pequeno: 50 episodios y 18.605 frames implican un riesgo alto de sobreajuste y baja generalizacion ante cambios de posicion, iluminacion, fondo o tipo de objeto.
- Dependencia de hardware concreto: entrenado para el robot `so_follower` con camaras `overhead` y `wrist`; usar otra configuracion de camaras o robot invalida la politica.
- Instrucciones solo en ingles: las dos tareas de entrenamiento estan redactadas en ingles; no hay evidencia de soporte multilingue.
- Sesgos: no documentados, pero al ser un modelo entrenado en un entorno de laboratorio concreto puede heredar sesgos de ese setup (colores, posiciones, iluminacion).
- Riesgo de alucinacion motora: como toda politica de imitacion, puede ejecutar acciones sin sentido ante observaciones fuera de distribucion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene citar el paper de SmolVLA y LeRobot.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SEONGMIN1234/smolvla_pick-two-cubes
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SEONGMIN1234/pick-two-cubes
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SEONGMIN1234/pick-two-cubes
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
