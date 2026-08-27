# HyeonseokE/smolvla_phase1_pick_place_A1_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para controlar robots mediante aprendizaje por imitación. Este repositorio concreto contiene un fine-tuning del modelo base `lerobot/smolvla_base` realizado por HyeonseokE para la tarea de recoger un bloque rojo y colocarlo sobre un plato azul, utilizando un robot SO-101. El modelo convierte observaciones de cámaras y estado del robot en comandos de acción de 6 grados de libertad, y está pensado para ejecutarse en hardware de consumo.

La relevancia de este modelo radica en que demuestra el flujo de fine-tuning de SmolVLA con un número reducido de episodios (100) y a 10 FPS, lo que abarata el coste de recopilación de datos. Su arquitectura combina un encoder de visión SigLIP y un modelo de lenguaje SmolLM2 congelados, junto con un "action expert" que se ajusta durante el entrenamiento. El modelo tiene 450 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action): encoder SigLIP + LLM SmolLM2 + action expert |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo orientado a tareas de robotica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA sigue una arquitectura de modelo de vision-lenguaje-accion en la que un encoder de vision SigLIP procesa las imagenes de las camaras (top y left_wrist, con resolucion 256x256), un modelo de lenguaje SmolLM2 interpreta la instruccion textual y un "action expert" genera las acciones de control. Durante el fine-tuning, solo se actualizan el action expert y las proyecciones, mientras que el encoder de vision y el LLM permanecen congelados, lo que reduce significativamente el numero de parametros entrenables (aproximadamente 50 millones).

El entrenamiento se realizo sobre el dataset `HyeonseokE/phase1_pick_place_A1_10fps`, que contiene 100 episodios y 31.744 frames a 10 FPS, recopilados mediante el pipeline SCRAPE-IsaacLab en Isaac Sim 5.1. La tarea consistia en "coger el bloque rojo y colocarlo en el plato azul". Se usaron 24.800 pasos de entrenamiento con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 0,0001, con semilla 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento de imitacion supervisada.

## Capacidades

- Generacion de acciones de control para robots con 6 grados de libertad (posicion y orientacion).
- Procesamiento de hasta tres imagenes de camara (aunque en la configuracion se usan dos: top y left_wrist) junto con el estado del robot.
- Ejecucion de tareas de pick-and-place especificas, como recoger un bloque rojo y colocarlo en un plato azul.
- Fine-tuning rapido sobre nuevas tareas con pocos datos (se recomiendan unos 50 episodios).
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue, al ser un modelo especializado en robotica.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos industriales o de laboratorio: el modelo puede controlar un robot SO-101 para recoger objetos de una posicion conocida y depositarlos en un destino fijo, reduciendo la necesidad de programacion manual.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de fine-tuning de VLA con pocos datos, comparando el rendimiento con otros metodos como ACT.
- Prototipado rapido de politicas roboticas: gracias a su tamano compacto, se puede desplegar en una GPU de consumo y validar en simulacion (Isaac Sim) antes de pasar al robot real.
- Educacion y formacion en robotica: permite a estudiantes y desarrolladores experimentar con un modelo VLA de ultima generacion sin necesidad de infraestructura de alto coste.
- Generacion de datos sinteticos para entrenamiento: el pipeline SCRAPE-IsaacLab utilizado para crear el dataset puede replicarse para generar nuevas demostraciones y ampliar el repertorio de tareas.
- Evaluacion comparativa de VLA en hardware limitado: al ser un modelo de 450M de parametros, es adecuado para medir el rendimiento de VLA en dispositivos con restricciones de memoria y computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo ocupa aproximadamente 0,9 GB (tamano del repositorio), por lo que cabria en GPUs con 2 GB o mas. Sin embargo, el procesamiento de imagenes a 256x256 y el modelo de lenguaje pueden requerir memoria adicional, estimandose un uso total de 2-4 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060 o superior. Para entrenamiento, se recomienda una GPU con 8 GB o mas (por ejemplo, RTX 3070, RTX 4060).
- Si cabe en consumer GPU: si, es uno de los objetivos del diseno de SmolVLA.
- Opciones de despliegue: el modelo se integra con LeRobot, que utiliza PyTorch. Se puede ejecutar mediante scripts de rollout de LeRobot, y tambien es compatible con herramientas de inferencia como vLLM o llama.cpp si se convierte a GGUF, aunque no se documenta oficialmente.
- Latencia y throughput: no se proporcionan datos especificos. Dado el tamano del modelo, se espera una inferencia en tiempo real (por debajo de 100 ms por paso) en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo se puede comparar cualitativamente con otros VLA como OpenVLA (7B parametros) o RT-2, pero no hay cifras de rendimiento ni de eficiencia en la documentacion consultada. El blog de ggando.com menciona que SmolVLA es significativamente mas compacto que OpenVLA, pero no aporta numeros concretos. Por tanto, se indica que la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta fine-tuneado exclusivamente para la tarea de pick-and-place de un bloque rojo en un plato azul; no generaliza a otras tareas u objetos sin un nuevo fine-tuning.
- Los datos de entrenamiento provienen de simulacion (Isaac Sim) mediante SCRAPE-IsaacLab, por lo que puede existir una brecha de realidad (sim-to-real) que afecte al rendimiento en el robot fisico.
- No se han realizado evaluaciones en el mundo real; la model card indica que no hay resultados de evaluacion.
- El modelo puede alucinar acciones si las observaciones difieren significativamente del dominio de entrenamiento (por ejemplo, cambios de iluminacion, posiciones de objetos no vistas, oclusiones).
- Al ser un modelo de 450M de parametros, su capacidad de razonamiento complejo es limitada en comparacion con VLA de mayor tamano, aunque suficiente para tareas de manipulacion simples.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base `lerobot/smolvla_base` y de los componentes (SigLIP, SmolLM2) para asegurar el cumplimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A1_1000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A1_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Blog de fine-tuning de SmolVLA en SO-101: https://ggando.com/blog/smolvla-so101/
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
