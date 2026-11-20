# kabilanKB/longwam-yam-conveyor

## Resumen

Long-WAM-YAM · Conveyor fine-tune es un checkpoint de ajuste fino de un modelo de accion mundial (world-action model) orientado a robotica bimanual, publicado por el usuario kabilanKB sobre el modelo base Efficient-Large-Model/Long-WAM-YAM. El modelo resuelve una tarea concreta de manipulacion: un robot YAM bimanual recoge un cubo rojo de una cinta transportadora en movimiento (4-7 cm/s) y lo deposita en una papelera azul dentro del entorno simulado YAMLab `ConveyorCubePick-v0`, construido sobre Isaac Sim 6 e Isaac Lab 3.

La relevancia tecnica del repositorio no reside en el modelo completo, sino en la estrategia de ajuste fino adoptada: solo se entrena el experto de accion (1.02 B parametros) mientras el experto de video de 5 B permanece congelado. El repositorio publica deltas de accion en bf16 (~2 GB) en lugar del modelo completo de 12 GB, lo que abarata la distribucion y permite reconstruir un checkpoint servible mediante un script de fusion incluido en el repositorio GitHub del proyecto.

Se trata de un artefacto de investigacion muy especializado, con cero descargas y cero likes en el momento de redaccion, creado el 20 de noviembre de 2026, y cuya evaluacion en bucle cerrado se encontraba pendiente para el checkpoint publicado (step 250). No dispone de informacion sobre idiomas, benchmarks de texto ni capacidades de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model (Long-WAM) con experto de video congelado y experto de accion entrenable; entrada multimodal (3 camaras + estado propioceptivo) |
| Parametros totales | 12 GB de modelo completo (parametros totales exactos no disponibles); delta de accion publicado: 1.02 B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.6 s de historial (21 de 81 frames); no se especifica contexto en tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas documentadas) |
| Licencia | other (derivada de Efficient-Large-Model/Long-WAM-YAM; sujeto a los terminos de ese modelo) |
| Formato de pesos | PyTorch (.pt) para los deltas de accion; reconstruccion a model.pt + config.yaml + dataset_stats.json tras la fusion |

## Arquitectura y entrenamiento

El modelo base Long-WAM-YAM combina un experto de video de 5 B parametros (congelado durante este ajuste fino, con la perdida de video desactivada) con un experto de accion y un adaptador de propiocepcion, que constituyen la unica parte entrenable (1.02 B parametros). Las entradas son tres camaras (superior, muneca izquierda y muneca derecha) a 224x224 cada una, compuestas en un mosaico de 384x320, junto con 1.6 s de historial (21 de los 81 frames disponibles) y un estado de 14 dimensiones. La salida es un chunk de 32 pasos de acciones, con objetivos articulares absolutos de 14 dimensiones y pinza codificada de 0 a 1 (1 = abierta).

El entrenamiento parte de la politica completa Long-WAM-YAM (`resume=model.pt`) y utiliza el dataset kabilanKB/yam_conveyor_cube_rand_longwam: 200 demostraciones scripted, 79.063 frames a 30 Hz, con velocidad de cinta, pose del cubo, posicion de la papelera e iluminacion aleatorizadas. Se emplea AdamW (beta 0.9/0.95, weight decay 0.01), tasa de aprendizaje 1e-4 con decaimiento cosine y 5 % de warmup, recorte de gradiente 1.0 y bf16. El lote efectivo es de 128 (8 por 2 GPUs con 8 pasos de acumulacion), durante 2 epocas equivalentes a 1.216 pasos, sobre 2x RTX PRO 6000 de 96 GB.

## Capacidades

- Manipulacion robotica bimanual: genera chunks de 32 acciones articulares absolutas de 14 dimensiones con control de pinza.
- Percepcion multi-camara: procesa simultaneamente vistas superior y de ambas munecas en un mosaico de 384x320.
- Seguimiento de objetos en movimiento: la tarea objetivo implica recoger un cubo sobre una cinta a 4-7 cm/s.
- Uso de historial temporal corto: condiciona la prediccion en 1.6 s de observaciones previas.
- Generalizacion a variaciones del entorno: entrenado con aleatorizacion de velocidad de cinta, pose del cubo, posicion de papelera e iluminacion.
- No dispone de capacidades de generacion de texto, codigo, matematicas, tool calling, agentes conversacionales ni procesamiento de audio documentadas.

## Casos de uso

- Pick-and-place sobre cinta transportadora: el modelo esta ajustado especificamente para recoger un cubo de una cinta en movimiento y depositarlo en una papelera, por lo que sirve como politica de referencia para esta tarea en simulacion.
- Investigacion en world-action models: permite estudiar el efecto de congelar el experto de video y entrenar solo el experto de accion sobre el rendimiento final, con deltas publicados para reproducir el experimento.
- Evaluacion sim-a-real en robotica bimanual: el flujo descrito (politica servida desde un Jetson AGX Thor y evaluacion en bucle cerrado en YAMLab sobre portatil) es un ejemplo concreto de despliegue de inferencia en hardware embebido.
- Desarrollo de pipelines de ajuste fino eficiente: la publicacion de deltas de accion de ~2 GB en lugar del modelo de 12 GB demuestra un patron de distribucion de checkpoints que reduce costes de almacenamiento y transferencia.
- Benchmarking de politicas en Isaac Lab: el entorno `ConveyorCubePick-v0` y las metricas de exito y de alcance del objeto permiten comparar checkpoints de forma estandarizada.
- Base para nuevos ajustes finos: al inicializarse desde la politica completa y publicar deltas, el repositorio sirve como punto de partida para variantes de la tarea (otras velocidades, objetos o disposiciones).

## Benchmarks y rendimiento

Evaluacion en bucle cerrado en el simulador YAMLab, con la politica servida desde un Jetson AGX Thor, 600 pasos de control (20 s) por episodio y aleatorizacion de iluminacion activada:

| Checkpoint | Exito | Alcanzo el objeto |
|---|---|---|
| Long-WAM-YAM (preentrenado, sin ajuste fino) | 0 / 10 | 0 / 10 |
| step 250 | pendiente | pendiente |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el delta de accion ocupa ~2 GB en bf16 y el modelo completo reconstruido ~12 GB, por lo que la inferencia requiere al menos el modelo fusionado.
- GPU de entrenamiento documentadas: 2x NVIDIA RTX PRO 6000 de 96 GB.
- Despliegue en hardware embebido: la evaluacion descrita sirve la politica desde un NVIDIA Jetson AGX Thor.
- Cabida en GPU de consumo: no confirmada; el modelo completo de 12 GB podria caber en GPUs consumer de 16 GB o mas, pero no se documenta ninguna prueba.
- Opciones de despliegue: script de fusion `eval/thor/merge_action_delta.py` del repositorio GitHub para reconstruir el checkpoint servible; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kabilanKB/longwam-yam-conveyor (este modelo) | 1.02 B entrenables; 12 GB total | 3 camaras 224x224, 1.6 s de historial, estado 14-D | 0/10 exito en el checkpoint preentrenado; step 250 pendiente | other (terminos del modelo base) | Hugging Face, deltas de accion |
| Efficient-Large-Model/Long-WAM-YAM (base) | 5 B experto de video + experto de accion (total 12 GB) | misma configuracion de entradas | 0/10 exito sin ajuste fino en esta tarea | other | Hugging Face |
| Alternativas de robotica bimanual de proposito similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El checkpoint step 250 no tiene evaluacion en bucle cerrado completada; el unico resultado publicado (0/10) corresponde al modelo preentrenado sin ajuste fino, por lo que no hay evidencia de mejora tras el ajuste.
- Entrenado exclusivamente en simulacion (Isaac Sim 6 / Isaac Lab 3); no se documenta transferencia a hardware real.
- Dataset pequeno y scripted: 200 demostraciones y 79.063 frames, lo que limita la diversidad de comportamientos aprendidos.
- Tarea muy restringida: un unico objeto (cubo rojo), una unica velocidad de cinta (4-7 cm/s) y un unico destino (papelera azul).
- Repositorio sin traccion: 0 descargas y 0 likes, creado en noviembre de 2026, lo que reduce la validacion comunitaria.
- Licencia "other" heredada del modelo base: es necesario revisar los terminos de Efficient-Large-Model/Long-WAM-YAM antes de cualquier uso comercial.
- Riesgo de sobreajuste a la iluminacion y condiciones del simulador pese a la aleatorizacion aplicada.
- No se documentan sesgos linguisticos, de alucinacion textual ni de contexto, dado que el modelo no procesa lenguaje.
- El repositorio contiene solo deltas de accion; no es utilizable directamente sin ejecutar el script de fusion con el modelo base y la revision concreta `e104e72dab1991a166e81e2941f7539e4edb8d68`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kabilanKB/longwam-yam-conveyor
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset de entrenamiento: https://huggingface.co/datasets/kabilanKB/yam_conveyor_cube_rand_longwam
- Repositorio GitHub del proyecto: https://github.com/kabilankb/yam-conveyor-longwam
- Pagina del proyecto: https://kabilankb.github.io/yam-conveyor-longwam/
