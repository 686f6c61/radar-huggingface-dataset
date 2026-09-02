# HyeonseokE/smolvla_phase1_sort_by_color_A1_via4cm_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face, que combina un modelo de lenguaje y visión preentrenado (SmolVLM) con un experto de acciones entrenado mediante flow matching. Este repositorio concreto, `HyeonseokE/smolvla_phase1_sort_by_color_A1_via4cm_2000_10fps`, es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` realizado por HyeonseokE para una tarea específica de robótica: ordenar bloques de colores en platos del mismo color. El modelo se ha entrenado con el framework LeRobot y está pensado para ser desplegado en el robot SO-101 (so101_follower).

El modelo resuelve el problema de control robótico por imitación a partir de demostraciones humanas, permitiendo que un robot ejecute una tarea de manipulación concreta a partir de observaciones visuales y del estado del robot. Su relevancia radica en que, al ser un modelo de solo 450 millones de parámetros, puede ejecutarse en hardware de consumo, lo que democratiza el acceso a la robótica basada en aprendizaje. La arquitectura es un VLA que procesa múltiples imágenes y una instrucción en lenguaje natural para generar una secuencia de acciones. La longitud de contexto no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en SmolVLM con experto de acciones por flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de un modelo de lenguaje y visión compacto (SmolVLM) preentrenado en datos multimodales a gran escala, y un experto de acciones entrenado con flow matching. Dado un conjunto de imágenes de cámaras y una instrucción en lenguaje, el modelo genera un fragmento (chunk) de acciones para el robot. En este ajuste fino, se parte del checkpoint `lerobot/smolvla_base` y se entrena sobre un dataset de demostraciones de la tarea "Sort the blocks onto the matching colored dishes" (ordenar los bloques en los platos de color correspondiente). El dataset contiene 100 episodios y 74.505 fotogramas a 10 FPS, con dos cámaras (superior y muñeca izquierda) y una tercera cámara adicional no especificada. La configuración de entrenamiento incluye 58.200 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 2000. No se menciona el uso de RLHF ni DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Generacion de acciones de control para un robot SO-101 con 6 grados de libertad (articulaciones).
- Procesamiento de multiples imagenes de camaras (top, left_wrist y una tercera) a resolucion 256x256.
- Ejecucion de tareas de manipulacion por imitacion, como ordenar objetos por color.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue, ya que es un modelo de politica robotica especializado.

## Casos de uso

- Automatizacion de tareas de clasificacion y ordenacion en entornos industriales o de laboratorio: el modelo puede controlar un brazo robotico para separar piezas por color o forma, reduciendo la intervencion manual.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de VLA compactos y su transferencia a nuevas tareas.
- Prototipado rapido de politicas roboticas: al ser un modelo pequeno, permite iterar rapidamente en entornos de desarrollo con recursos limitados.
- Despliegue en robots colaborativos de bajo coste: el robot SO-101 es un hardware asequible, y el modelo esta disenado para ejecutarse en el, facilitando su uso en pequenas empresas o centros educativos.
- Educacion en robotica y aprendizaje automatico: puede utilizarse como ejemplo practico de entrenamiento de politicas con LeRobot en cursos universitarios.
- Evaluacion de generalizacion en manipulacion: al estar entrenado en una tarea especifica, permite analizar la capacidad de generalizacion del modelo base a nuevas configuraciones de objetos o iluminacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de datos de tasa de exito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas en la informacion disponible.
- El tamano del repositorio es de 0,9 GB, lo que sugiere que los pesos en precision FP32 ocupan aproximadamente 1,8 GB (450M parametros x 4 bytes), aunque no se confirma el formato de precision.
- Dado que el modelo base SmolVLA esta disenado para hardware de consumo, es probable que quepa en GPUs con al menos 4 GB de VRAM, pero no hay datos oficiales.
- Para el despliegue se utiliza el framework LeRobot, que soporta inferencia en GPU (CUDA) y posiblemente en CPU, aunque no se especifican opciones como vLLM, llama.cpp u Ollama.
- No se indican metricas de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de la misma categoria. Existen otros ajustes finos del mismo autor (por ejemplo, `smolvla_phase1_sort_by_color_A2_3000_10fps` y `smolvla_phase1_sort_by_color_A1_1000_10fps`), pero no se proporcionan sus especificaciones ni resultados. El modelo base `lerobot/smolvla_base` es el punto de partida comun, pero no se ofrecen datos comparativos de rendimiento.

## Limitaciones y advertencias

- No se han realizado evaluaciones en robot real, por lo que el rendimiento en condiciones reales es desconocido.
- El entrenamiento se ha realizado con un dataset limitado (100 episodios) y una tarea muy especifica, lo que puede provocar sobreajuste y falta de generalizacion a otras tareas o entornos.
- La dependencia de la configuracion de camaras (top, left_wrist y una tercera) y del robot SO-101 limita su portabilidad a otros sistemas.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que puede afectar a la comprension de instrucciones complejas.
- Aunque la licencia Apache-2.0 permite uso comercial, es necesario verificar que el dataset de entrenamiento no tenga restricciones adicionales.
- El modelo no incluye capacidades de seguridad ni validacion de acciones, por lo que su uso en entornos con presencia humana requiere supervision.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A1_via4cm_2000_10fps)
- [Paper de SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A1_10fps_via4cm)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guia de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Repositorio de ejemplo de finetuning de SmolVLA (GitHub)](https://github.com/PhosFaith/SmolVLA)
