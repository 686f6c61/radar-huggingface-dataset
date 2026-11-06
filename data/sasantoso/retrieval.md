# Sasantoso/retrieval

## Resumen

Sasantoso/retrieval es un repositorio experimental que contiene una implementación funcional de una arquitectura Perceiver orientada a tareas de retrieval (recuperación de información multimodal), publicada bajo licencia Apache 2.0. El autor lo describe explícitamente como una configuración "nano" pensada para pruebas de humo (smoke tests) reproducibles y código transparente, no como un modelo entrenado con fines de benchmark. El checkpoint `model.safetensors` es una inicialización válida para ejecutar el pipeline, pero no se presenta como un modelo con pesos entrenados ni evaluados.

El modelo emplea fusión de tipo Tucker, atención estándar, activación GELU y normalización por batch. Con solo 49.600 parámetros totales, se trata de un artefacto de escala didáctica o de prototipado, muy alejado de los modelos de retrieval de producción. No se declaran idiomas soportados ni pipeline de Hugging Face, y el repositorio no incluye resultados de benchmarks.

Su relevancia es limitada y acotada: sirve como punto de partida reproducible para quien quiera experimentar con la arquitectura Perceiver en tareas de recuperación, inspeccionar el código de entrenamiento (`finetune.py`) o validar integraciones antes de escalar a configuraciones mayores. No es un modelo para despliegue real sin un entrenamiento previo sustancial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención estándar, fusión Tucker) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer con un mecanismo de atención cruzada que proyecta entradas de distinta modalidad sobre un conjunto reducido de latentes. La configuración publicada usa atención estándar, fusión Tucker, activación GELU y normalización por batch. El autor la etiqueta como escala "nano", coherente con los 49.600 parámetros del checkpoint.

No se ha completado ningún entrenamiento: el checkpoint `model.safetensors` es una inicialización para pruebas de humo, no un modelo entrenado. La receta por defecto incluida en `training_args.json` emplea el optimizador RMSprop con un schedule coseno, pero el propio autor advierte que son valores de partida del script y no evidencia de una ejecución finalizada. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales más allá de la propia arquitectura Perceiver con fusión Tucker.

## Capacidades

- Implementación de referencia de un Perceiver para retrieval multimodal, ejecutable mediante `finetune.py`.
- Punto de partida para experimentación con atención cruzada y fusión Tucker sobre latentes.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión en un modelo entrenado.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües (idiomas no disponibles).
- No se declara modo de pensamiento (thinking), audio ni otras capacidades especiales.
- El checkpoint sirve para validar carga, formas tensoriales y flujo de entrenamiento, no para inferencia útil.

## Casos de uso

- Prototipado de arquitectura Perceiver: usar `finetune.py` y `config.json` como base para experimentar con atención cruzada y fusión Tucker antes de escalar a configuraciones mayores.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite verificar que el script carga pesos, construye el grafo y ejecuta un paso de entrenamiento sin errores.
- Docencia e investigación sobre retrieval multimodal: el código transparente y de escala nano facilita explicar el funcionamiento interno de un Perceiver en un entorno controlado.
- Validación de integraciones: comprobar adaptadores personalizados, dado que el autor advierte que las APIs genéricas de carga automática requieren un adaptador explícito.
- Reproducibilidad de recetas de optimización: el `training_args.json` con RMSprop y schedule coseno sirve como plantilla para comparar recetas sobre el mismo dataset.
- Base para evaluación controlada en Flickr30k: el autor sugiere usar ese dataset, reportar la métrica de la tarea con al menos tres semillas y comparar contra una línea base de capacidad equivalente, una vez entrenado el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor omite deliberadamente cualquier afirmación de rendimiento y recomienda evaluar sobre Flickr30k con al menos tres semillas y una línea base de capacidad equiparable.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 49.600 parámetros el checkpoint cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con soporte PyTorch (por ejemplo, RTX 3060 o superior) es más que suficiente. A100 o H100 no aportan ventaja a esta escala.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos unos pocos cientos de MB de VRAM libre.
- Opciones de despliegue: al ser una implementación personalizada, requiere un adaptador explícito para APIs de carga automática. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al no haber modelo entrenado, las cifras no serían representativas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (Perceiver nano para retrieval) con los que establecer una comparación de parámetros, contexto, rendimiento y licencia. Los modelos de retrieval de producción habituales operan a escalas de cientos de millones de parámetros, muy por encima de los 49.600 de este repositorio, y no se dispone de datos para contrastarlos.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado; no es apto para inferencia real ni para producción.
- No se ha auditado robustez, equidad ni transferencia de dominio.
- No se declaran sesgos conocidos, pero al no haber entrenamiento ni datos documentados, no es posible evaluarlos.
- Riesgo de alucinación no aplicable en un modelo sin entrenar; cualquier salida sería ruido de inicialización.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar cobertura lingüística.
- Licencia Apache 2.0 permite uso comercial del código, pero el autor advierte de revisar por separado los términos de los datos externos que se usen con el repositorio.
- Las APIs genéricas de carga automática requieren un adaptador explícito; no funciona como un modelo estándar de Hugging Face sin trabajo adicional.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí publicados.

## Enlaces

- Hugging Face: https://huggingface.co/Sasantoso/retrieval
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información disponible.
