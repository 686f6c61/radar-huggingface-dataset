# i64systems/remat

## Resumen

El modelo `i64systems/remat` es un runtime de inferencia que permite ejecutar un modelo de mezcla de expertos (MoE) de 63 GB en una máquina con solo 24 GB de memoria, mediante la rematerialización bajo demanda de los pesos desde disco. Cada fragmento de memoria cargado se verifica contra un manifiesto SHA-256 antes de su uso, garantizando que la salida sea byte-idéntica a la de una ejecución completamente residente. El proyecto incluye un asistente local llamado "bob", descrito como determinista de extremo a extremo, sin dependencia de la nube.

El repositorio contiene un white paper, registros de laboratorio y una capa de evidencia que permite reproducir los resultados. La relación entre bytes lógicos en disco y bytes pico residentes (capacidad de exposición) se mide entre 1.67 y 10.25 en dos modelos de pesos abiertos. El código de la casa se publica bajo licencia Apache-2.0, aunque la licencia del modelo en sí no está especificada. Hay una solicitud de patente provisional en curso (U.S. 64/146,166).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), sin más detalles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Código: Apache-2.0; modelo: no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (número de capas, atención, etc.). Se sabe que es un modelo MoE con un tamaño de pesos de 63 GB. El componente principal es el runtime de rematerialización: en lugar de cargar todos los pesos en memoria, se cargan porciones (slices) de expertos desde disco bajo demanda, cada una verificada con SHA-256. Esto permite ejecutar el modelo en hardware con mucha menos memoria que el tamaño total de los pesos.

No se proporcionan datos sobre el entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El proyecto menciona un asistente llamado "bob" que es determinista, pero no se especifica cómo fue entrenado.

## Capacidades

- Ejecución de un modelo MoE de 63 GB en hardware con 24 GB de memoria, mediante rematerialización bajo demanda desde disco.
- Verificación criptográfica de cada fragmento de memoria cargado (SHA-256), garantizando integridad y reproducibilidad.
- Salida byte-idéntica a la de una ejecución completamente residente, lo que asegura determinismo total.
- Asistente local "bob" que opera sin conexión a la nube y sin deriva en las respuestas.
- Capacidad de exposición medida entre 1.67 y 10.25, indicando cuántos bytes lógicos en disco pueden servirse por cada byte de memoria residente.
- Reproducibilidad de resultados mediante scripts de verificación incluidos en el repositorio.

## Casos de uso

- Inferencia local en hardware limitado: permite ejecutar un modelo de 63 GB en una estación de trabajo con 24 GB de RAM, útil para desarrolladores que no disponen de GPUs de gran memoria.
- Aplicaciones con requisitos de auditoría: la verificación SHA-256 de cada fragmento y la reproducibilidad byte a byte permiten auditar cada ejecución, adecuado para entornos regulados o de alta confianza.
- Asistente personal determinista: "bob" puede usarse como asistente local que siempre produce la misma respuesta para la misma entrada, útil para pruebas automatizadas o para usuarios que exigen consistencia.
- Investigación en eficiencia de memoria: el runtime sirve como banco de pruebas para estudiar técnicas de rematerialización y gestión de memoria en modelos MoE.
- Despliegue en entornos con almacenamiento rápido pero memoria limitada: si se dispone de NVMe de alta velocidad, el modelo puede ejecutarse con baja latencia sin necesidad de GPUs de gran VRAM.
- Verificación de integridad de modelos: el manifiesto SHA-256 permite comprobar que los pesos no han sido alterados, útil en cadenas de suministro de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona "serving receipts" y "runlogs" con 49 y 70 comprobaciones aritméticas, pero no se ofrecen métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Memoria mínima: 24 GB de RAM (el runtime está diseñado para ejecutar un modelo de 63 GB en esa cantidad).
- Almacenamiento: se requiere disco con espacio para los 63 GB de pesos, preferiblemente NVMe para reducir la latencia de carga.
- GPU: no se especifica si se necesita GPU; el runtime podría funcionar solo con CPU, aunque la inferencia de un MoE de 63 GB en CPU sería lenta.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El runtime parece ser un sistema propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El enfoque de rematerialización bajo demanda es poco común; alternativas como quantización (GGUF, GPTQ) o destilación no son directamente comparables. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- La información pública es muy limitada: no se especifican parámetros, contexto, idiomas ni licencia del modelo.
- El runtime depende de un disco rápido; en discos lentos, la latencia de rematerialización puede degradar seriamente el rendimiento.
- La verificación SHA-256 añade sobrecarga computacional, aunque es necesaria para la integridad.
- No hay evidencia de benchmarks de calidad del modelo (razonamiento, código, etc.), por lo que no se puede evaluar su capacidad real.
- La patente pendiente podría implicar restricciones de uso comercial del runtime, aunque el código se publica bajo Apache-2.0.
- El modelo en sí no tiene licencia declarada, lo que impide su uso comercial sin autorización explícita.
- No se mencionan sesgos ni riesgos de alucinación; al ser un asistente local, el usuario es responsable de su uso.

## Enlaces

- HuggingFace: https://huggingface.co/i64systems/remat
- Repositorio de verificación (referencia en la model card): no se proporciona URL directa, pero se mencionan scripts en `research/claims` y `release/`.
- Resultados de búsqueda web no relacionados directamente con el modelo (se incluyen por si aportan contexto):
  - https://github.com/meta-pytorch/remat (activación checkpointing en PyTorch)
  - https://www.flir.com/products/i64 (cámara térmica)
  - https://airisk.mit.edu/ai-incident-tracker/incident-view (tracker de incidentes de IA)
  - https://bdgiffin.github.io/remat/ (librería de física reversible)
  - https://keras.io/api/rematerialization/remat/ (rematerialización en Keras)
