# CollectionStudio/Muse-Robotics-1

## Resumen

Muse-Robotics-1 es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por CollectionStudio para manipulación robótica condicionada por lenguaje natural. A partir de dos vistas de cámara (una tercera persona y otra montada en la muñeca), el estado propioceptivo del robot y una instrucción en lenguaje libre, el modelo genera un horizonte corto de acciones continuas. Con aproximadamente 121,7 millones de parámetros, está diseñado para entrenarse y desplegarse en hardware modesto sin depender de backbones preentrenados congelados.

Su innovación principal es un mecanismo de "deliberación" interna: ocho tokens latentes de plan, inicializados como parámetros aprendidos, se refinan durante tres iteraciones de un bloque transformer compartido antes de producir cualquier acción. Esto dota al modelo de un espacio diferenciable y acotado donde razonar sobre la tarea, manteniendo bajo el recuento de parámetros gracias a la reutilización del bloque. Todos los componentes —visión, lenguaje, fusión, deliberación y generación de acciones— se entrenan conjuntamente desde inicialización aleatoria.

El modelo se publica con licencia MIT, lo que facilita su uso comercial e investigación, y está etiquetado únicamente para inglés. Su relevancia actual radica en demostrar que un VLA autocontenido y pequeño puede incorporar razonamiento latente explícito, un enfoque que reduce la dependencia de modelos fundacionales masivos en robótica encarnada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer VLA con encoder visual ViT compartido, encoder de lenguaje bidireccional y pila "perceive" de 12 capas con tokens latentes de plan |
| Parámetros totales | 121.710.745 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (instrucciones tokenizadas con BPE de 8192; sin cifra de longitud máxima publicada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

La arquitectura combina un encoder visual Vision Transformer de escala pequeña que procesa parches de 16×16 píxeles de ambas cámaras con pesos compartidos y un embedding aprendido de tipo de vista, un encoder de lenguaje de seis capas con tokenizador BPE de 8192 símbolos y atención enmascarada para padding, y una pila de fusión de doce capas con pre-normalización y expansión feed-forward de factor cuatro. Las tres modalidades se concatenan en una secuencia heterogénea con embeddings de tipo y espaciales aprendidos.

La etapa de deliberación destila la memoria de percepción en ocho tokens latentes de plan que se refinan mediante tres iteraciones de un bloque transformer compartido (self-attention entre planes, cross-attention hacia la memoria y actualización feed-forward con residuales), con un embedding de iteración distinto en cada pasada. La representación final agrupada del plan es la única señal de condicionamiento para el generador de acciones. El modelo se entrena de extremo a extremo desde inicialización aleatoria, sin RLHF ni DPO documentados, y la normalización de estado y acción se calcula sobre la distribución de entrenamiento y se embebe en la configuración publicada.

## Capacidades

- Generación de acciones continuas de horizonte corto para manipulación robótica condicionada por lenguaje.
- Procesamiento multimodal conjunto de dos vistas RGB de 224×224, estado propioceptivo y texto libre.
- Manejo explícito de instrucciones vacías como caso válido, no como error.
- Razonamiento latente interno mediante tokens de plan refinados en tres iteraciones.
- Codificación de lenguaje en inglés con tokenizador BPE de 8192 símbolos.
- Desnormalización interna de acciones, entregando comandos en el espacio nativo del robot.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de pensamiento explícito fuera del mecanismo de plan latente.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo recibe instrucciones como "abre el cajón" junto con vistas de cámara y estado articular para emitir comandos continuos, adecuado por su tamaño reducido y entrenamiento específico en control.
- Investigación en VLA: su diseño autocontenido y los tokens de plan inspeccionables permiten ablar componentes y estudiar el razonamiento latente sin depender de backbones externos.
- Prototipado en hardware modesto: con ~122 M de parámetros, se puede entrenar y ejecutar en estaciones de trabajo con una sola GPU, facilitando iteración rápida en entornos académicos.
- Tareas de pick-and-place condicionadas por lenguaje: la fusión de vista exterior y de muñeca con instrucciones textuales permite localizar objetos y planificar agarres en escenarios de mesa.
- Aprendizaje por imitación en robótica de bajo coste: su entrenamiento conjunto desde cero lo hace apto para datasets encarnados propios sin necesidad de pesos preentrenados.
- Evaluación de políticas con instrucciones vacías o ambiguas: el tratamiento explícito de cadenas vacías facilita probar robustez ante ausencia de condicionamiento lingüístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con ~122 M de parámetros en precisión completa (fp32) el peso ronda los 0,5 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, RTX 3090 o incluso GPUs de gama media son suficientes para inferencia.
- Cabe en GPU de consumo: sí, por el tamaño del repositorio (0,5 GB) y el recuento de parámetros.
- Opciones de despliegue: PyTorch nativo (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican directamente a un modelo de robotics/acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Robotics-1 | 121,7 M | No disponible | VLA para manipulación | MIT | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; no se garantiza comportamiento en otros idiomas.
- Modelo específico para manipulación robótica; no es un LLM de propósito general ni un modelo de visión general.
- Al entrenarse desde cero en datos encarnados, su generalización fuera de la distribución de entrenamiento es limitada y no documentada.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas ante instrucciones fuera de distribución.
- No se documentan sesgos específicos, pero al carecer de datos de entrenamiento públicos no es posible evaluarlos.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni documentación sobre seguridad en entornos físicos.
- No se especifican longitudes de contexto ni límites de tokens de instrucción, lo que dificulta planificar el despliegue.
- El modelo card está truncado en la sección de generación de acciones, por lo que faltan detalles sobre el horizonte de acción y la decodificación.

## Enlaces

- HuggingFace: https://huggingface.co/CollectionStudio/Muse-Robotics-1
- Paper referenciado (arxiv:2403.12945): no disponible enlace directo en la información
- Paper referenciado (arxiv:2410.24164): no disponible enlace directo en la información
- Repositorio o demo: no disponible
