# Faless/piper_apples_expo_v6_smolvla_base_bs96

## Resumen

piper_apples_expo_v6_smolvla_base_bs96 es un ajuste fino de SmolVLA (Smol Vision-Language-Action), un modelo compacto de vision-lenguaje-accion publicado por el usuario Faless. Se trata de una politica robotica de 450 millones de parametros que aprende a manipular objetos a partir de demostraciones y que, en este caso concreto, esta entrenada para una unica tarea: coger manzanas rojas una a una y depositarlas en una cesta verde.

El modelo parte de lerobot/smolvla_base y se ha entrenado con 851 episodios (1.213.100 fotogramas a 30 FPS) sobre un robot Piper en configuracion `piper_full`, equipado con dos camaras (`ego` y `front`). Su relevancia esta en el tamano: SmolVLA esta disenado para ejecutarse en hardware de consumo, frente a las VLA de varios miles de millones de parametros, lo que abarata la experimentacion en robotica de imitacion.

Se distribuye bajo licencia Apache 2.0 en formato safetensors, con un repositorio de 0,9 GB, y se ejecuta mediante la libreria LeRobot. En el momento de redactar esta ficha acumula 0 descargas y 0 valoraciones, y el autor no ha publicado resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta derivada de SmolVLA. Configuracion interna exacta de este ajuste: no disponible |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No es un LLM de texto: consume por paso 2 imagenes de (3, 256, 256) y un vector de estado de 8 dimensiones |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | No disponible. La unica instruccion de tarea presente en el dataset esta en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; repositorio de 0,9 GB) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | `piper_full` (brazo Piper) |
| Camaras | `ego`, `front` |
| Entradas | `observation.state` (8,); `observation.images.camera1` (3, 256, 256); `observation.images.camera2` (3, 256, 256) |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | Faless/piper_apples_expo_v6 (851 episodios, 1.213.100 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

SmolVLA pertenece a la familia de modelos vision-lenguaje-accion: combinan un codificador visual y un modelo de lenguaje preentrenado con un modulo experto que genera secuencias de acciones motoras. La publicacion de referencia (arXiv:2506.01844) describe un diseno compacto orientado a coste computacional reducido y despliegue en hardware de consumo. Esta ficha no puede confirmar la configuracion concreta de capas, dimensiones ocultas ni el mecanismo exacto de generacion de acciones de este ajuste, porque la model card no lo detalla; solo se sabe que hereda la arquitectura de `lerobot/smolvla_base`. El tamano del repositorio (0,9 GB para 450 M de parametros) es coherente con pesos almacenados en precision de 16 bits.

El entrenamiento es de imitacion (behavior cloning) supervisado sobre el dataset Faless/piper_apples_expo_v6, con una unica tarea textual: "Pick the red apples one by one and place them into the green basket". No se menciona RLHF, DPO ni aprendizaje por refuerzo de ningun tipo. La configuracion declarada es la siguiente:

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 55.000 |
| Tamano de lote | 96 |
| Optimizador | adamw |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Epocas equivalentes (calculado) | ~4,35 (5.280.000 muestras vistas / 1.213.100 fotogramas) |
| Duracion media por episodio (calculado) | ~1.426 fotogramas, es decir, ~47,5 s a 30 FPS |

## Capacidades

- Generacion de acciones motoras de 7 dimensiones para el brazo Piper (`action` (7,)).
- Percepcion visual simultanea desde dos camaras de 256x256 pixeles.
- Fusion de estado propioceptivo (`observation.state`, 8 dimensiones) con informacion visual.
- Seguimiento de una instruccion de tarea en lenguaje natural, en ingles.
- Manipulacion tipo pick-and-place sobre una clase de objeto concreta (manzanas rojas) y un destino fijo (cesta verde).
- Ejecucion en bucle cerrado a la frecuencia de control del dataset (30 FPS), supeditada al hardware.
- No dispone de tool calling ni function calling.
- No incorpora comportamiento de agente ni razonamiento multi-paso explicito.
- No es multilingue: no hay evidencia de generalizacion a instrucciones en otros idiomas.
- No tiene modo de razonamiento (thinking mode), ni generacion de texto, codigo o matematicas, ni capacidades de audio.

## Casos de uso

- Recogida y deposito de manzanas rojas en una cesta verde: es la tarea exacta para la que se entreno el modelo, con el robot `piper_full` y las camaras `ego` y `front`. Se lanzaria con `lerobot-rollout` y la instruccion textual original.
- Punto de partida para ajustes finos en tareas de pick-and-place: al derivar de `lerobot/smolvla_base`, sirve como inicializacion para nuevas tareas sobre el mismo brazo Piper, sustituyendo el dataset y manteniendo el pipeline de LeRobot.
- Reproduccion de experimentos de imitacion learning: permite estudiar el efecto de hiperparametros como el tamano de lote (96 en este caso) sobre una tarea de manipulacion con mas de un millon de fotogramas.
- Investigacion en VLA de bajo coste: con 450 M de parametros y 0,9 GB de pesos, es viable ejecutar experimentos de investigacion en una unica GPU de gama media en lugar de en un cluster.
- Demostraciones educativas de robotica: la tarea, con objetos de colores bien diferenciados (manzana roja, cesta verde), es apta para practicas de laboratorio sobre aprendizaje por imitacion y calibracion de camaras.
- Evaluacion de protocolos de recogida de datos: el dataset asociado (851 episodios, 1,2 M de fotogramas) puede usarse como referencia para comparar estrategias de teleoperacion y frecuencia de muestreo.
- Pruebas de integracion con LeRobot: sirve para validar el flujo completo de `lerobot-train` y `lerobot-rollout` en un robot Piper antes de escalar a tareas mas complejas.
- Automatizacion de laboratorio en tareas de clasificacion de fruta: con un ajuste adicional, el mismo esquema podria adaptarse a lineas de seleccion donde el operario actual recoge y separa piezas de color uniforme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la plantilla vacia y la nota explicita "_No evaluation results have been provided for this policy yet_", por lo que no existe tasa de exito medida en robot real, ni numero de ensayos, ni resultados sobre posiciones nuevas de objeto, cambios de iluminacion o distractores. Tampoco se han publicado metricas de latencia o de frecuencia de control efectiva.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 0,9 GB en precision de 16 bits y 1,8 GB en fp32, segun los 450.046.176 parametros declarados. El repositorio completo ocupa 0,9 GB.
- VRAM estimada para inferencia: del orden de 2 a 4 GB contando activaciones y las dos imagenes de 256x256, aunque no hay mediciones oficiales publicadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna. Una RTX 3060 de 12 GB o una RTX 4060 de 8 GB son suficientes con amplio margen; tarjetas de 4 GB pueden ser justas.
- GPU recomendadas por perfil: RTX 3060 / RTX 4060 para desarrollo y pruebas; RTX 4090 para entrenamiento y ajuste fino rapido; A100 o H100 no son necesarias para este tamano, salvo que se reentrene desde cero.
- Despliegue: la via documentada es LeRobot (`lerobot-rollout` para ejecutar, `lerobot-train` para entrenar) sobre PyTorch con CUDA. vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible. La model card no reporta ninguna medicion de latencia, y la velocidad efectiva dependera del brazo Piper, de las camaras y del ordenador de control.
- Requisitos adicionales de sistema: robot Piper (`piper_full`), dos camaras configuradas a 640x480 y 30 FPS en el ejemplo de rollout, y nombres de camara que coincidan con las claves de observacion del entrenamiento (`camera1` y `camera2`).

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de fuentes publicas y no se han verificado en esta busqueda; deben confirmarse antes de tomar decisiones. Las cifras de contexto se marcan como no aplicables porque son politicas roboticas, no modelos de lenguaje.

| Modelo | Parametros | Tarea | Resultados publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| piper_apples_expo_v6_smolvla_base_bs96 (este modelo) | ~450 M | Pick-and-place de manzanas rojas con brazo Piper | Ninguno; tabla de evaluacion vacia | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/smolvla_base | ~450 M | VLA generalista preentrenada | Resultados del paper SmolVLA (no reproducidos aqui) | No disponible en esta busqueda | HuggingFace |
| OpenVLA-7B | ~7 B | VLA generalista para manipulacion | Resultados publicados en su paper (no verificados aqui) | Licencia comunitaria de Llama 2 | HuggingFace |
| pi0 (openpi) | ~3,3 B aprox. | VLA generalista con flow matching | Resultados publicados por Physical Intelligence (no verificados aqui) | Apache 2.0 en openpi, segun fuentes publicas | HuggingFace / GitHub |

La diferencia principal de este modelo frente a las alternativas es el tamano: con unos 450 M de parametros es entre 7 y 15 veces mas pequeno que OpenVLA-7B o pi0, lo que reduce los requisitos de VRAM, pero tambien limita su generalidad. Frente a `lerobot/smolvla_base`, la unica diferencia documentada es el ajuste fino sobre un dataset concreto de 851 episodios y una sola tarea.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no ha publicado ensayos, tasa de exito ni condiciones de prueba, por lo que no hay evidencia publica de que la politica funcione de forma fiable.
- Tarea unica y muy restringida: un solo objeto (manzanas rojas), un unico destino (cesta verde) y una sola instruccion en ingles.
- Dependencia del hardware exacto: entrenado para el robot `piper_full` con dos camaras concretas (`ego` y `front`). Cambiar de brazo, de numero de camaras o de montaje invalida probablemente la politica.
- Riesgo de sobreajuste al entorno: 851 episodios recogidos previsiblemente en la misma escena. Cambios de iluminacion, posicion de los objetos, fondo o presencia de distractores pueden degradar el comportamiento.
- Sensibilidad a la distribucion de entrada: al ser un modelo de imitacion sin mecanismos de rechazo, ante observaciones fuera de distribucion puede generar acciones espurias o inseguras. No existe una nocion calibrada de "no lo se".
- Idiomas: no hay evidencia de que responda a instrucciones en castellano u otros idiomas; la unica tarea documentada esta en ingles.
- Naturaleza del modelo: no genera texto, codigo ni respuestas conversacionales, y no soporta herramientas ni agentes. No debe evaluarse con benchmarks de LLM.
- Sin cuantizaciones publicadas: el despliegue requiere el stack de PyTorch y LeRobot; no hay pesos GGUF ni variantes optimizadas para CPU.
- Validacion social nula: 0 descargas y 0 valoraciones en el momento de la consulta, sin issues ni replicas independientes conocidas.
- Licencia: el modelo se publica como Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar por separado la licencia del dataset Faless/piper_apples_expo_v6 y las condiciones del modelo base `lerobot/smolvla_base`.
- Busqueda web sin resultados utiles: las consultas realizadas no devolvieron informacion relevante sobre este modelo, por lo que toda la ficha se basa en la model card y en los metadatos de HuggingFace.
- Fechas de creacion y actualizacion registradas como 2026-09-13, poco habituales; conviene comprobar la trazabilidad del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Faless/piper_apples_expo_v6_smolvla_base_bs96
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_expo_v6
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_expo_v6
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Documentacion de entrenamiento por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Cita de LeRobot: Cadene, Remi et al., "LeRobot" (2024), incluida en la model card del modelo
