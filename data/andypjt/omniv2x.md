# AndyPJT/OmniV2X

## Resumen

OmniV2X es un planificador generativo de conducción cooperativa end-to-end desarrollado por AndyPJT (Juntong Peng). El modelo aborda el problema de la planificación de trayectorias en entornos de conducción conectada y cooperativa (V2X), donde el vehículo recibe información de infraestructura vial (cámaras, sensores, mensajes de comunicación) además de sus propios sensores. En lugar de fusionar características BEV densas como hacen los enfoques tradicionales, OmniV2X trata las imágenes de vista del ego, los comandos de navegación, el contexto de mapa opcional y los mensajes V2X como secuencias de condicionamiento independientes para un planificador de trayectorias generativo basado en un transformer de flujo rectificado (rectified-flow transformer).

La arquitectura emplea un codificador visual congelado, codificadores ligeros para V2X y mapa, normalización por fuente y un mecanismo de inyección por atención cruzada. El modelo se preentrena en datos de conducción de agente único (NAVSIM/OpenScene) y después se adapta al conjunto de datos cooperativo DAIR-V2X-Seq mediante tokens de objetos de infraestructura. Los resultados reportados en el paper muestran un error L2 medio de 0,86 metros, una tasa de colisión a 3 segundos de 0,06 % y un PDMS de 88,33 en la variante sin mapa, con una latencia de inferencia de 35 ms y un consumo de memoria GPU de 550 MB, lo que lo hace viable para despliegue en tiempo real.

El repositorio de HuggingFace contiene los checkpoints preentrenados (variantes con y sin tokens de mapa) y el código de entrenamiento, inferencia y evaluación. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified-flow) con codificador visual congelado, codificadores ligeros V2X/mapa y atención cruzada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de imagen, comandos de navegacion y tokens V2X) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision y planificacion de trayectorias) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints PyTorch (.ckpt) |

## Arquitectura y entrenamiento

OmniV2X combina un codificador visual preentrenado y congelado (no se especifica la familia exacta) con codificadores ligeros para tokens de objetos V2X y tokens de mapa. Cada fuente de informacion (imagen del ego, comando de navegacion, mapa opcional, mensajes V2X de infraestructura) se normaliza por separado y se inyecta en el planificador transformer mediante atencion cruzada. El planificador genera trayectorias mediante un flujo rectificado (rectified flow), un metodo generativo que modela la transformacion entre una distribucion ruidosa y la distribucion de trayectorias reales.

El entrenamiento consta de dos etapas. Primero se preentrena el modelo en datos de conduccion de agente unico (NAVSIM/OpenScene) durante hasta 100 epocas con un tamano de lote de 32. Despues se realiza un ajuste fino en el conjunto de datos cooperativo DAIR-V2X-Seq durante hasta 500 epocas con un lote de 16, anadiendo tokens de objetos de infraestructura. Existen dos variantes de checkpoint: una sin tokens de mapa y otra con 128 tokens de mapa. La comunicacion V2X se realiza mediante mensajes SDSM (Sensor Data Sharing Message) con un coste de 1.408 bits por segundo en la variante sin mapa y 25.792 BPS en la variante con mapa.

## Capacidades

- Planificacion de trayectorias de conduccion cooperativa end-to-end a partir de imagenes de camara del ego, comandos de navegacion y mensajes V2X de infraestructura.
- Condicionamiento opcional con contexto de mapa mediante tokens de mapa (128 tokens).
- Generacion de trayectorias mediante flujo rectificado, lo que permite muestrear multiples trayectorias candidatas.
- Manejo de comunicacion V2X con bajo coste de transmision (1.408 BPS sin mapa), disenado para entornos con ancho de banda limitado.
- Inferencia en tiempo real: 35 ms de latencia y 550 MB de uso de memoria GPU en la variante sin mapa.
- Adaptable a diferentes conjuntos de datos de conduccion (NAVSIM, OpenScene, DAIR-V2X-Seq) mediante scripts de entrenamiento y evaluacion incluidos.
- Integracion con el ecosistema NAVSIM (devkit de planificacion) y evaluacion mediante metricas PDMS (Plan-based Driving Metric Score).

## Casos de uso

- Conduccion cooperativa en intersecciones con visibilidad reducida: el modelo combina la vista del ego con tokens V2X de infraestructura para planificar trayectorias seguras cuando el vehiculo no puede ver peatones u obstaculos ocultos.
- Despliegue en flotas de vehiculos conectados: gracias al bajo coste de comunicacion (1.408 BPS) y la baja latencia (35 ms), puede ejecutarse en vehiculos con hardware modesto y conexiones V2X de ancho de banda limitado.
- Investigacion en planificacion generativa para conduccion autonoma: el uso de flujo rectificado permite estudiar la generacion de multiples trayectorias plausibles y su evaluacion con metricas PDMS.
- Validacion de algoritmos de cooperacion vehiculo-infraestructura: los scripts de evaluacion sobre DAIR-V2X-Seq permiten comparar el rendimiento de diferentes estrategias de fusion de informacion V2X.
- Prototipado de sistemas de asistencia a la conduccion en entornos urbanos: el modelo puede integrarse en simuladores como NAVSIM para probar comportamientos en escenarios complejos con informacion de mapa opcional.
- Educacion y desarrollo de sistemas de conduccion cooperativa: al ser open source (Apache 2.0), sirve como referencia para implementar planificadores generativos con condicionamiento multimodal.

## Benchmarks y rendimiento

Los resultados reportados en el paper para el conjunto de datos DAIR-V2X de planificacion cooperativa son:

| Modelo | Mensaje V2X | Coste (BPS) | L2 medio (m) | Colision 3s (%) | PDMS |
|---|---|---|---|---|---|
| OmniV2X | SDSM | 1.408 | 0,86 ± 0,01 | 0,06 ± 0,02 | 88,33 ± 0,23 |
| OmniV2X (con mapa) | SDSM + MAP | 25.792 | 0,86 ± 0,00 | 0,01 ± 0,01 | 89,87 ± 0,18 |

Ademas, el paper reporta una latencia de inferencia de 35 ms y un uso de memoria GPU de 550 MB para la variante sin mapa. No se han publicado resultados en benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje, sino un planificador de trayectorias para conduccion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 550 MB para la variante sin mapa (segun el paper). La variante con mapa requiere algo mas de memoria, pero no se especifica el valor exacto.
- GPU recomendada: cualquier GPU NVIDIA con al menos 2 GB de VRAM es suficiente para la inferencia. El entrenamiento requiere mas recursos; el ajuste fino con lote 16 probablemente necesita una GPU con 16-24 GB (por ejemplo, RTX 3090, RTX 4090, A100).
- Compatibilidad con GPU de consumo: si, la inferencia cabe en GPUs consumer de gama baja-media (GTX 1060 6GB o superior) gracias al bajo consumo de memoria.
- Opciones de despliegue: el codigo proporciona scripts de inferencia con soporte CUDA y CPU (para pruebas pequenas). No se menciona integracion con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 35 ms por inferencia en GPU (reportado en el paper). No se especifica el throughput en inferencia por lotes.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directamente en la documentacion proporcionada. El campo de planificacion cooperativa V2X es emergente y los enfoques tradicionales se basan en fusion de caracteristicas BEV densas, que suelen tener mayor coste de comunicacion y computacion. OmniV2X se diferencia por su uso de tokens ligeros y atencion cruzada, pero no hay datos publicos de otros modelos (como V2XFormer, UniV2X, etc.) en esta documentacion para establecer una comparativa cuantitativa. Por tanto, la comparativa con alternativas especificas no esta disponible.

## Limitaciones y advertencias

- El modelo depende de la disponibilidad de datos V2X de infraestructura (mensajes SDSM) y de la sincronizacion entre el vehiculo y la infraestructura; sin ellos, su rendimiento se degrada.
- La variante sin mapa tiene una tasa de colision a 3 segundos de 0,06 %, que aunque baja, no es cero; no debe usarse en produccion sin validacion exhaustiva en el dominio objetivo.
- Los resultados reportados provienen de un unico conjunto de datos (DAIR-V2X-Seq) y pueden no generalizar a otros escenarios de conduccion, condiciones climaticas o geografias.
- El modelo no es un sistema completo de conduccion autonoma; solo genera trayectorias y requiere modulos adicionales de percepcion, control y seguridad.
- El repositorio no redistribuye los datasets (NAVSIM, OpenScene, DAIR-V2X-Seq, mapas nuPlan); el usuario debe obtenerlos de sus fuentes oficiales, lo que puede implicar acuerdos de licencia adicionales.
- No se especifican los parametros totales del modelo ni la arquitectura exacta del codificador visual, lo que dificulta la evaluacion de su complejidad computacional en comparacion con otros sistemas.
- La licencia Apache 2.0 permite uso comercial, pero los datasets subyacentes pueden tener restricciones propias que limiten el despliegue en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/AndyPJT/OmniV2X
- Paper (arXiv): https://arxiv.org/abs/2606.21165
- Codigo (GitHub): https://github.com/JuntongPeng/OmniV2X
- Checkpoint sin mapa: https://huggingface.co/AndyPJT/OmniV2X/resolve/main/omniv2x_dairv2x_no_map.ckpt
- Checkpoint con mapa: https://huggingface.co/AndyPJT/OmniV2X/resolve/main/omniv2x_dairv2x_map.ckpt
