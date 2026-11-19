# djduecaster/dfreq-sprint-contact-ppo-v2-20261118

## Resumen

Sprint Contact PPO v2 es un modelo de control para robótica (pipeline `robotics`) publicado por el usuario djduecaster en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base `djduecaster/dfreq`, entrenado con PPO (Proximal Policy Optimization) como política de control con "residual consciente del contacto" (contact-aware residual) acotado. El modelo infiere los contactos a partir de la observación estándar en tiempo de ejecución, sin necesidad de sensores de contacto explícitos.

Según la model card, es un candidato de investigación archivado para la prueba "2 m Sprint" de Microduck Arena. Completó las cinco ejecuciones locales del protocolo Arena a 1,15 m/s, con una media de 0,886 s. El autor aclara explícitamente que no se trata de un récord personal ni de una puntuación de servidor, y que el modelo es solo para simulación.

El repositorio es de tamaño 0,0 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y se distribuye en formato ONNX con la librería `microduck`. La información técnica disponible es muy limitada: no se publican parámetros, contexto, idiomas ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con PPO; residual consciente del contacto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (existe una nota de licencia en `LICENSE-NOTE.txt`, sin contenido publicado) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base `djduecaster/dfreq` mediante PPO, un algoritmo de optimización de política en el ámbito del aprendizaje por refuerzo. La descripción indica que se trata de un "residual acotado consciente del contacto": la política aprende una corrección residual acotada sobre una política base, y dicha corrección tiene en cuenta las condiciones de contacto. El modelo infiere los contactos a partir de la observación estándar en tiempo de ejecución, lo que evita depender de sensores de contacto dedicados.

No se dispone de información sobre el número de tokens, la composición del dataset, el entorno de simulación exacto, el número de pasos de entrenamiento ni la configuración de PPO (learning rate, clipping, horizonte, etc.). Tampoco se documenta ninguna innovación adicional más allá del enfoque de residual acotado y la inferencia implícita de contactos. El modelo está orientado exclusivamente a simulación.

## Capacidades

- Control de locomoción para robótica: genera acciones de control para la prueba de sprint de 2 m en el entorno Microduck Arena.
- Inferencia de contactos a partir de la observación estándar, sin sensores de contacto explícitos.
- Aprendizaje por refuerzo con PPO: política entrenada para maximizar recompensa en una tarea de locomoción concreta.
- Corrección residual acotada sobre una política base, lo que limita la magnitud de las desviaciones respecto al comportamiento base.
- Exportación a ONNX para despliegue en entornos de inferencia compatibles.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en locomoción simulada: usar el modelo como política de referencia para la prueba de sprint de 2 m en Microduck Arena y comparar variantes de entrenamiento PPO.
- Estudio de control consciente del contacto: analizar cómo la inferencia implícita de contactos a partir de la observación afecta a la estabilidad y la velocidad de la locomoción.
- Ajuste fino de políticas residuales: partir de este modelo como inicialización para nuevas tareas de locomoción con correcciones acotadas sobre una política base.
- Evaluación de robustez en simulación: ejecutar el modelo bajo perturbaciones del entorno simulado para medir la degradación del rendimiento respecto a los 1,15 m/s reportados.
- Despliegue en pipelines ONNX: integrar el modelo en un runtime ONNX para inferencia de bajo coste en bucles de control simulados.
- Reproducibilidad de experimentos: servir como artefacto archivado para reproducir las cinco ejecuciones locales del protocolo Arena reportadas por el autor.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Velocidad en prueba 2 m Sprint (Arena) | 1,15 m/s |
| Tiempo medio en cinco ejecuciones locales | 0,886 s |
| Ejecuciones completadas | 5 de 5 (protocolo Arena local) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es esperable dado que se trata de un modelo de control robótico y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros ni tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con la información disponible; el tamaño del repositorio (0,0 GB) sugiere un modelo muy pequeño, pero no se confirma.
- Opciones de despliegue: runtime ONNX (formato de pesos publicado); la librería `microduck` aparece como librería asociada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de control para locomoción simulada en Microduck Arena) ni datos suficientes para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo exclusivamente para simulación: el autor indica explícitamente que es "simulation only"; no hay evidencia de validez en hardware físico.
- Candidato de investigación archivado: no debe interpretarse como un resultado de récord personal ni de puntuación de servidor.
- Los resultados reportados (1,15 m/s, 0,886 s de media) provienen de cinco ejecuciones locales del protocolo Arena, sin validación externa independiente.
- Licencia no disponible: existe una nota de licencia (`LICENSE-NOTE.txt`) pero su contenido no se ha publicado en la información disponible, por lo que no se puede confirmar el uso comercial.
- Idiomas no disponibles: irrelevante para un modelo de control, pero no se documenta.
- Sin datos sobre sesgos, alucinación o limitaciones de contexto, al no ser un modelo de lenguaje.
- Sin información sobre parámetros, arquitectura exacta ni configuración de entrenamiento, lo que dificulta la reproducibilidad y la evaluación técnica.
- El repositorio tiene 0 descargas y 0 likes, sin señales de adopción o revisión por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-sprint-contact-ppo-v2-20261118
- Modelo base: https://huggingface.co/djduecaster/dfreq
- Atribución del modelo base (referenciada en la model card): `upstream-base-card.md` (ruta relativa dentro del repositorio, sin URL pública disponible)
- Nota de licencia (referenciada en la model card): `LICENSE-NOTE.txt` (ruta relativa dentro del repositorio, sin URL pública disponible)
