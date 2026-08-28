# HyeonseokE/smolvla_push_cube_cap_2000_10fps

## Resumen

Este modelo es un fine-tune de SmolVLA, un vision-language-action (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, especializado en la tarea de empujar un cubo hasta un marcador objetivo con un brazo robótico SO-101. El fine-tune ha sido realizado por HyeonseokE utilizando el framework LeRobot sobre un dataset propio de 100 episodios grabados a 10 FPS, con dos cámaras (superior y muñeca izquierda). El modelo base, `lerobot/smolvla_base`, ya incorpora un VLM preentrenado y un experto de acciones entrenado con flow matching, lo que permite que este ajuste fino herede capacidades de percepción visual y control motor eficientes. Su relevancia radica en demostrar que es posible adaptar SmolVLA a tareas de manipulación concretas con un coste computacional reducido, manteniendo la viabilidad de despliegue en hardware de consumo, tal y como se describe en el paper original (arXiv:2506.01844).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto + experto de acciones con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la instruccion de la tarea esta en ingles, pero no se especifica soporte multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje y vision (VLM) preentrenado con un experto de acciones entrenado mediante flow matching. El VLM procesa multiples imagenes (en este caso, tres vistas de camara) junto con una instruccion en lenguaje natural, y el experto de acciones genera un chunk de acciones de 6 grados de libertad. Este fine-tune parte del checkpoint `lerobot/smolvla_base` y se entrena con el framework LeRobot sobre el dataset `HyeonseokE/push_cube_cap_10fps`, que contiene 100 episodios y 21.210 frames a 10 FPS. La configuracion de entrenamiento incluye 16.571 pasos, batch size de 64, optimizador AdamW con learning rate de 1e-4 y semilla 2000. No se menciona el uso de RLHF ni DPO; el entrenamiento es de aprendizaje por imitacion supervisado.

## Capacidades

- Control de un brazo robotico SO-101 para tareas de manipulacion, generando acciones de 6 grados de libertad (posicion y orientacion).
- Percepcion visual a partir de tres camaras (superior, muñeca izquierda y una tercera no especificada), con imagenes de 256x256 píxeles.
- Ejecucion de la tarea especifica "empujar el cubo hasta el marcador objetivo" siguiendo una instruccion en lenguaje natural.
- Generacion de chunks de acciones (action chunking) gracias al experto de flow matching, lo que permite movimientos suaves y coordinados.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales.
- No soporta tool calling, agentes multi-paso ni razonamiento complejo fuera del ambito de la tarea robotica.
- Capacidades multilingues no documentadas; la instruccion de la tarea esta formulada en ingles.

## Casos de uso

- Manipulacion robotica en entornos de laboratorio: el modelo puede ejecutar la tarea de empujar un cubo hacia un marcador, util para validar algoritmos de aprendizaje por imitacion en bancos de pruebas.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el fine-tuning de VLA en tareas de corto horizonte con pocos episodios (100 en este caso).
- Desarrollo de prototipos de robots de bajo coste: al ser un modelo de 450M parametros, puede desplegarse en GPUs de consumo, lo que facilita experimentos en laboratorios con recursos limitados.
- Evaluacion de politicas de control en simulacion o robot real: el modelo puede integrarse en pipelines de LeRobot para comparar el rendimiento de diferentes estrategias de entrenamiento.
- Educacion en robotica y VLA: su licencia Apache-2.0 y su integracion con LeRobot lo hacen adecuado para cursos y talleres donde se ensena a entrenar y desplegar politicas de manipulacion.
- Benchmarking de modelos VLA: al ser un fine-tune especifico, puede utilizarse como referencia para comparar el efecto de distintos datasets, semillas o configuraciones de entrenamiento en la misma arquitectura base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo tiene 450M parametros, se estima que puede caber en GPUs con al menos 8 GB de VRAM en precision FP16, pero no se proporcionan datos concretos.
- GPU recomendadas: no se especifican. Por el tamano del modelo, GPUs como RTX 3060, RTX 4090 o A100 serian adecuadas, pero no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: probablemente si, dado el diseno de SmolVLA orientado a hardware asequible, pero no se confirma para este fine-tune concreto.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que soporta inferencia en GPU con CUDA. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa con otros modelos de la misma categoria. Este modelo es un fine-tune especifico de SmolVLA, y no se han publicado resultados comparativos con otros VLA como OpenVLA o RT-2 en el contexto de esta tarea. Se puede mencionar que comparte arquitectura con otros fine-tunes de SmolVLA disponibles en Hugging Face, pero sin datos de rendimiento no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea de empujar un cubo a un marcador; no generaliza a otras tareas de manipulacion sin un nuevo fine-tuning.
- No se han reportado resultados de evaluacion en robot real, por lo que su rendimiento en entornos no controlados es incierto.
- La dependencia de tres camaras especificas (top, left_wrist y una tercera) limita su uso a configuraciones de hardware que coincidan con las observaciones de entrenamiento.
- El dataset de entrenamiento es pequeno (100 episodios), lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminacion, posicion de objetos o distracciones.
- No se documentan sesgos especificos, pero al ser un modelo de robotica, los riesgos de alucinacion se manifiestan como acciones incorrectas o inseguras en el mundo fisico.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantias de seguridad para operacion autonoma en entornos reales.
- La fecha de creacion del modelo (2026-08-28) es posterior a la fecha actual, lo que sugiere que podria tratarse de un modelo experimental o de una fecha erronea en los metadatos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HyeonseokE/smolvla_push_cube_cap_2000_10fps)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HyeonseokE/push_cube_cap_10fps)
- [Paper de SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Sitio web de SmolVLA](https://smolvla.net/index_en)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guia de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
