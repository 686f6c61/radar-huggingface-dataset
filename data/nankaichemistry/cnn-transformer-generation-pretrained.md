# NANKAICHEMISTRY/cnn-transformer-generation-pretrained

## Resumen

El repositorio `NANKAICHEMISTRY/cnn-transformer-generation-pretrained` es una implementación propia y compacta en PyTorch de una arquitectura denominada Cnn Transformer, orientada a tareas de generación. No se trata de un modelo entrenado ni de un lanzamiento listo para producción: la propia model card lo describe como una configuración *tiny* pensada para revisión de código, pruebas de humo (*smoke tests*) y experimentos controlados de pequeña escala. El checkpoint incluido (`model.safetensors`) es una inicialización válida, no el resultado de un entrenamiento completado.

El tamaño real declarado en los pesos es de 24.832 parámetros, es decir, aproximadamente 0,025 millones. Es un orden de magnitud propio de un juguete de laboratorio, no de un modelo de lenguaje utilizable. La arquitectura combina convolución y atención con atención dispersa (*sparse*) y fusión mediante *co attention*, activación ReLU y normalización LayerNorm. La receta de experimento por defecto propone el optimizador RMSProp con un schedule polinómico, valores de partida del script y no evidencia de una ejecución finalizada.

Su relevancia es, por tanto, documental y metodológica: sirve como plantilla reproducible para probar ideas de arquitectura híbrida CNN-Transformer y como referencia de cómo publicar un artefacto experimental con expectativas explícitas sobre su estado. No hay pipeline declarado, no se declaran idiomas soportados y no se reclama ninguna puntuación de benchmark. El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (hibrida convolucion + transformer) |
| Parametros totales | 24.832 (aproximadamente 0,025 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye `model.safetensors`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicializacion, no entrenado) |
| Atencion | dispersa (sparse) |
| Fusion | co attention |
| Activacion | ReLU |
| Normalizacion | LayerNorm |
| Optimizador por defecto | RMSProp con schedule polinomico |
| Escala declarada | tiny |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-14 |
| Fecha de actualizacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe la arquitectura como un Cnn Transformer con atencion dispersa, fusión por *co attention*, activación ReLU y normalización LayerNorm. No se detalla el número de capas, la dimensión del modelo, el número de cabezas de atención, el tamaño de los kernels convolucionales ni el patrón concreto de dispersión de la atención; esos datos residirían en `config.json`, que no se ha proporcionado en la información disponible. Tampoco se especifica la dimensión de embedding ni el vocabulario.

En cuanto al entrenamiento, no existe. El repositorio incluye `training_args.json` con una receta por defecto (RMSProp y schedule polinómico), pero la propia documentación aclara que son valores iniciales del script y no evidencia de una ejecución completada. No se declara número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta ninguna innovación técnica validada empíricamente, ni decodificación especulativa, ni atención lineal. El autor recomienda explícitamente entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias antes de extraer cualquier conclusión.

## Capacidades

- Generación de secuencias: el modelo se publica bajo la etiqueta `generation`, por lo que su cabeza de salida está orientada a tareas generativas, si bien no hay pesos entrenados que produzcan texto coherente.
- Ejecución de ejemplo y prueba de humo: el archivo `pipeline.py` contiene un bloque `__main__` con un ejemplo ejecutable que permite verificar que el grafo se construye y produce salidas.
- Carga de pesos mediante adaptador explícito: al ser una implementación propia, las APIs genéricas de carga automática requieren un adaptador antes de poder instanciar el modelo.
- Inspección de configuración: `config.json` registra los ajustes de arquitectura generados y `training_args.json` la receta de experimento por defecto.
- *Tool calling*: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.

## Casos de uso

- Prueba de humo en integración continua: el checkpoint de inicialización y el script `pipeline.py` permiten verificar que un pipeline de PyTorch se instala, importa y ejecuta correctamente en cada *commit*, detectando roturas de dependencias o cambios incompatibles en la API antes de desplegar código real.
- Validación de cargadores de pesos propios: sirve como fixture mínimo para comprobar que un cargador de `safetensors` con adaptador explícito resuelve las claves del *state dict* y las mapea a los módulos correctos.
- Docencia y revisión de código: al contener el modelo completo y un punto de entrada ejecutable en un único archivo, es un ejemplo didáctico para explicar cómo se estructura una arquitectura híbrida CNN-Transformer en PyTorch.
- Experimentos de ablación sobre atención dispersa: con 24.832 parámetros, es viable ejecutar comparativas de máscaras de atención dispersa frente a atención densa en CPU, con múltiples semillas, en tiempos despreciables.
- Estudio de mecanismos de fusión por *co attention*: permite aislar el efecto de la fusión entre ramas convolucional y de atención en una tarea sintética o de juguete antes de escalar el diseño.
- Verificación de recetas de optimización: el par RMSProp con schedule polinómico puede probarse en un régimen de entrenamiento controlado para comprobar curvas de pérdida y estabilidad numérica con LayerNorm y ReLU.
- Prueba de pipelines de despliegue y serialización: útil para validar formatos de artefacto, versionado de configuraciones y flujos de empaquetado sin incurrir en coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint incluido es una inicialización, no un modelo entrenado. Cualquier cifra de MMLU, HumanEval, GSM8K o similar sería inaplicable, ya que el modelo no ha sido entrenado ni evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: los cálculos siguientes derivan del recuento real de 24.832 parámetros. En fp32, aproximadamente 99 KB de pesos; en fp16/bf16, aproximadamente 50 KB; en int8, aproximadamente 25 KB. Estas cifras no incluyen el *overhead* del entorno de ejecución, que en PyTorch es del orden de cientos de MB.
- GPU recomendadas: ninguna en particular; el modelo cabe con holgura en cualquier GPU con soporte CUDA, incluida una GTX 1050 o inferior.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo, e incluso en CPU sin penalización apreciable dado el tamaño.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no soportan esta arquitectura personalizada sin adaptadores. La vía prevista es la ejecución directa del script de PyTorch incluido (`pipeline.py`), tras implementar el adaptador de carga explícito que menciona la model card.
- Latencia y throughput estimados: no disponible. Al no existir un modelo entrenado ni una longitud de contexto declarada, no es posible estimar latencia ni tokens por segundo con sentido práctico.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable con datos verificables en la información proporcionada. Este repositorio no es un modelo entrenado, sino un artefacto de código y un checkpoint de inicialización de 24.832 parámetros, por lo que una comparación de parámetros, contexto, rendimiento o licencia frente a modelos de generación publicados carecería de base. Los repositorios de referencia de arquitecturas *tiny* con los que podría compararse estructuralmente no se han incluido en la búsqueda, y atribuirles cifras sería inventar datos.

| Aspecto | Este repositorio | Alternativas comparables |
|---|---|---|
| Parametros | 24.832 | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento en benchmarks | ninguno reclamado | no disponible |
| Licencia | apache-2.0 | no disponible |
| Estado | inicializacion sin entrenar | no disponible |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Las salidas del modelo no son coherentes ni utilizables como generación de texto.
- No ha sido auditado en robustez, equidad (*fairness*) ni transferencia de dominio; el propio autor lo declara como punto de partida experimental.
- No se han publicado resultados de evaluación, ni con la métrica de tarea, ni con múltiples semillas, ni con línea base de capacidad equivalente.
- No se declara el número de tokens de entrenamiento, la composición del corpus ni los idiomas soportados, por lo que se desconocen los sesgos que podría adquirir un futuro entrenamiento.
- Riesgo de alucinación: no aplica en el estado actual, ya que el modelo no genera texto con sentido; en caso de entrenarse, el riesgo sería el propio de cualquier modelo generativo sin ajuste por preferencias.
- No se documenta la longitud de contexto soportada, lo que impide planificar usos con secuencias largas.
- La licencia apache-2.0 permite uso comercial del artefacto, pero los términos de los datos de origen deben revisarse por separado si se entrena con corpus externos.
- No es compatible de forma inmediata con APIs de carga automática; requiere un adaptador explícito, lo que añade trabajo de integración.
- Para producción, cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse de forma separada de los valores por defecto que se distribuyen en este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NANKAICHEMISTRY/cnn-transformer-generation-pretrained
- Archivo `pipeline.py` (artefacto principal, modelo y ejemplo ejecutable): incluido en el repositorio anterior
- Archivo `config.json` (configuración de arquitectura): incluido en el repositorio anterior
- Archivo `training_args.json` (receta de experimento por defecto): incluido en el repositorio anterior
- Checkpoint `model.safetensors` (inicialización): incluido en el repositorio anterior
- Paper, blog o demo adicionales: no disponible
