# GammoEiei/smolvla_so101_pick_apple_v3

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por el equipo de Hugging Face, diseñado para ejecutarse en hardware de consumo. Este repositorio concreto, `GammoEiei/smolvla_so101_pick_apple_v3`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario GammoEiei para controlar un brazo robótico SO-101 en tareas de recogida y colocación de manzanas. El modelo resuelve el problema de la manipulación robótica mediante aprendizaje por imitación, combinando percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones de control.

La arquitectura de SmolVLA combina un codificador visual SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" que predice las acciones del robot. El modelo tiene aproximadamente 450 millones de parámetros en total, aunque solo se fine-tunean alrededor de 50 millones (el action expert y las proyecciones), manteniendo congelados el codificador visual y el modelo de lenguaje. Este enfoque reduce drásticamente el coste computacional del entrenamiento y permite su despliegue en GPUs de gama media.

La relevancia de este modelo radica en su demostración práctica de que los VLA pueden adaptarse a tareas específicas de robótica con conjuntos de datos pequeños (54 episodios) y hardware asequible, lo que democratiza el acceso a la robótica basada en aprendizaje profundo. El modelo está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action): SigLIP (vision encoder) + SmolLM2 (language model) + action expert |
| Parametros totales | 450.046.176 |
| Parametros activos | ~50 millones (action expert y proyecciones; el resto permanece congelado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible (las instrucciones del dataset estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA sigue una arquitectura de vision-lenguaje-accion en tres componentes. El codificador visual es SigLIP, que procesa las imagenes de las camaras (lateral y de muñeca) y produce embeddings visuales. El modelo de lenguaje es SmolLM2, que codifica la instruccion en lenguaje natural y la fusiona con la informacion visual. Finalmente, un action expert (un MLP o transformer ligero) decodifica la representacion conjunta en una accion de 6 grados de libertad (posicion y orientacion del efector). Segun el blog de ggando.com, durante el fine-tuning solo se actualizan el action expert y las proyecciones, mientras que SigLIP y SmolLM2 permanecen congelados.

El entrenamiento de este modelo especifico se realizo mediante fine-tuning desde `lerobot/smolvla_base` utilizando el dataset `GammoEiei/so101_pick_apple_2`, que contiene 54 episodios y 12.133 frames a 10 FPS. Las tareas son dos: "Pick up the green apple and put it in the bowl" y "Pick up the red apple and put it in the bowl". La configuracion de entrenamiento incluye 10.000 pasos, batch size de 32, optimizador AdamW con learning rate de 0,0001 y semilla 1000. El entrenamiento se realizo con la libreria LeRobot version 0.6.2, que implementa aprendizaje por imitacion (behavior cloning).

## Capacidades

- Control de manipulacion robotica: genera acciones de 6 grados de libertad (posicion y orientacion) para un brazo SO-101.
- Percepcion visual multimodal: procesa simultaneamente dos camaras (lateral a 720x1280 y muñeca a 1080x1920).
- Seguimiento de instrucciones en lenguaje natural: distingue entre dos tareas (manzana verde o roja) basandose en la instruccion textual.
- Aprendizaje por imitacion: la politica se entrena mediante demostraciones teleoperadas, sin necesidad de recompensas explicitas.
- Eficiencia computacional: al congelar la mayor parte de los parametros, el fine-tuning requiere solo ~50M de parametros entrenables.
- Despliegue en hardware de consumo: disenado para ejecutarse en GPUs de gama media, a diferencia de VLA mas grandes como OpenVLA (7B).

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en lineas de produccion donde se requiera clasificar o mover objetos pequeños (manzanas, piezas) de una posicion a otra, gracias a su capacidad de distinguir entre objetos por color y seguir instrucciones.
- Investigacion en aprendizaje por imitacion: sirve como base para estudiar como los VLA se adaptan a tareas especificas con pocos datos, comparando el rendimiento con otros metodos como ACT (Action Chunking Transformer).
- Prototipado rapido de politicas roboticas: con solo 54 episodios y 10.000 pasos de entrenamiento, permite validar rapidamente si un VLA puede resolver una tarea antes de invertir en datasets mas grandes.
- Educacion en robotica y aprendizaje profundo: al ser un modelo pequeno y licenciado bajo Apache 2.0, es adecuado para cursos universitarios donde los estudiantes puedan fine-tunear y desplegar un VLA en un brazo robotico de bajo coste.
- Benchmarking de VLA en hardware asequible: permite comparar el rendimiento de SmolVLA frente a otros modelos (ACT, OpenVLA) en tareas estandarizadas de pick-and-place, utilizando el mismo robot SO-101.
- Desarrollo de sistemas de clasificacion automatizada: en almacenes o centros de distribucion, el modelo puede adaptarse para separar objetos por atributos visuales (color, forma) siguiendo instrucciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de datos de tasa de exito en robot real ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parametros, en FP16 se necesitan aproximadamente 900 MB solo para los pesos. Considerando activaciones y memoria intermedia, se estima un consumo de 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 2070, o GPUs de datacenter como A100 o H100. Tambien puede ejecutarse en Apple Silicon con Metal.
- Compatibilidad con consumer GPU: si, el modelo esta disenado para hardware de consumo. Segun el paper de SmolVLA, puede desplegarse en GPUs de gama media.
- Opciones de despliegue: el flujo principal es mediante LeRobot, usando el comando `lerobot-rollout` con la politica cargada desde HuggingFace. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de robotica, no un LLM generico.
- Latencia y throughput: no disponible. Depende de la GPU, la resolucion de las camaras y el hardware del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este repo) | 450M | SigLIP + SmolLM2 + action expert | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | Prismatic (LLaMA-2 7B + ViT) | 2048 tokens | MIT | HuggingFace |
| ACT (Action Chunking Transformer) | ~80M | Transformer con chunking | no aplica | MIT | GitHub |
| RT-2 (PaLI-X) | 55B | PaLI-X + PaLM | no disponible | propietaria | no publico |

SmolVLA se distingue por su tamano reducido (450M frente a 7B de OpenVLA) y su capacidad de fine-tuning eficiente, mientras que ACT es un modelo mucho mas simple sin componente de lenguaje. RT-2 no esta disponible publicamente. No se dispone de comparaciones de rendimiento cuantitativas entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno: solo 54 episodios, lo que limita la generalizacion a variaciones de iluminacion, posicion de objetos o fondos no vistos durante el entrenamiento.
- Tareas restringidas: el modelo solo ha sido entrenado para dos tareas especificas (recoger manzana verde o roja y ponerla en un bol). No es un VLA generalista.
- Sin evaluacion en robot real reportada: la model card no incluye resultados de pruebas fisicas, por lo que el rendimiento real en el robot SO-101 es desconocido.
- Dependencia del hardware: el modelo esta entrenado para el robot SO-101 con una configuracion de camaras especifica (lateral y muñeca). Usarlo con otro robot o configuracion de camaras requiere reentrenamiento.
- Riesgo de alucinacion en instrucciones: al ser un modelo de lenguaje, puede malinterpretar instrucciones fuera de su vocabulario de entrenamiento, aunque el riesgo es bajo dado el numero limitado de tareas.
- Sesgos del dataset: las demostraciones fueron grabadas por un unico operador, lo que puede introducir sesgos en la forma de ejecutar las tareas (velocidad, trayectoria, etc.).
- Sin soporte multilingue: las instrucciones estan en ingles y el modelo no ha sido entrenado para otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GammoEiei/smolvla_so101_pick_apple_v3
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/GammoEiei/so101_pick_apple_2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- LeRobot (libreria de entrenamiento): https://github.com/huggingface/lerobot
- Blog sobre fine-tuning SmolVLA en SO-101: https://ggando.com/blog/smolvla-so101/
- Repositorio relacion (kevinqz): https://huggingface.co/kevinqz/SmolVLA-SO101-PickPlace-CoreAI
- Repositorio relacion (zwaneiz): https://github.com/zwaneiz/so101-vla-pickplace
- Repositorio relacion (ggand0): https://github.com/ggand0/vla-so101
