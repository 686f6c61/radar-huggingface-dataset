# caspar/ACT-so101-pickplace-sim-150-10K-v1.0

## Resumen

ACT-so101-pickplace-sim-150-10K-v1.0 es una política de control robótico basada en el algoritmo ACT (Action Chunking with Transformers) publicada por el usuario caspar en Hugging Face. No es un modelo de lenguaje: es un paquete de política nativo de LeRobot 0.6.1 que predice acciones articulares de 6 dimensiones a partir de un estado de 6 dimensiones y dos cámaras RGB (vista superior y vista de muñeca), con un tamaño de chunk de acción de 50. El modelo está entrenado sobre el conjunto de datos de simulación `physicalai/so101_pickplace_sim_150` durante 10.000 pasos de optimización.

La relevancia de esta ficha es acotada: se trata de un checkpoint de robótica en simulación, con 51.617.414 parámetros y un tamaño de repositorio de 0,2 GB, orientado a tareas de pick-and-place con el robot SO101 en un simulador. El autor advierte explícitamente que no se ha ejecutado ningún entrenamiento, inferencia ni rollout nuevo para esta subida, y que las tasas de éxito históricas en simulación no constituyen validación en robot real.

El modelo se distribuye bajo licencia Apache 2.0 e incluye pesos originales, configuración de política, definiciones de preprocesador y postprocesador, y tensores de normalización. La carga requiere aplicar esos procesadores; cargar únicamente la red neuronal no aplica la normalización de observaciones ni la conversión de acciones a unidades articulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone ResNet18, encoder/decoder Transformer y CVAE |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (paquete LeRobot 0.6.1 con pesos, configuración y procesadores) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer encoder/decoder con un backbone ResNet18 inicializado con pesos de ImageNet y un componente CVAE. La entrada combina un vector de estado de 6 dimensiones con dos imágenes RGB de resolución 3 x 240 x 320 (cámaras superior y de muñeca), y la salida es un chunk de 50 acciones articulares de 6 dimensiones. Los nombres de las cámaras y la normalización deben coincidir con la configuración guardada.

El entrenamiento se realizó durante 10.000 pasos de optimización sobre el dataset local `physicalai/so101_pickplace_sim_150`. El checkpoint final se seleccionó con la semilla 1000 y se evaluó de forma independiente con la semilla 2000. El autor indica que la revisión y el número de episodios del dataset original no quedan establecidos por el checkpoint recuperado, y que no debe asumirse que coincida con una revisión posterior del dataset de caspar. El checkpoint de 10.000 pasos es una ejecución separada de la comparación de 2.500 pasos. No se incluyen estados del optimizador, demostraciones fuente ni credenciales.

## Capacidades

- Predicción de acciones articulares de 6 dimensiones a partir de estado de 6 dimensiones y dos cámaras RGB.
- Generación de chunks de acción de 50 pasos para control robótico.
- Manipulación tipo pick-and-place en simulación con el robot SO101.
- Integración nativa con el ecosistema LeRobot 0.6.1 (política, preprocesador y postprocesador).
- Normalización de observaciones y conversión de acciones a unidades articulares mediante los procesadores incluidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para reproducir o comparar experimentos de ACT sobre SO101 en simulación, cargándolo con `ACTPolicy.from_pretrained` y los procesadores incluidos.
- Evaluación de políticas en simulador: permite ejecutar rollouts en el simulador del repositorio `physicalai_tutorial` con las semillas registradas (1000 para selección, 2000 para evaluación) y comparar tasas de éxito bajo el mismo criterio.
- Línea base para experimentos de pick-and-place: al ser un checkpoint de 10.000 pasos, puede usarse como punto de partida para estudiar el efecto del número de pasos frente a la variante de 2.500 pasos.
- Docencia y formación en robótica: el paquete LeRobot autocontenido (pesos, configuración y procesadores) facilita demostrar el flujo completo de carga y preprocesado de observaciones en un entorno controlado.
- Pruebas de integración de pipelines LeRobot: útil para verificar que una instalación de `lerobot==0.6.1` carga correctamente políticas ACT con cámaras múltiples y chunk de acción 50.
- Estudio de robustez a semillas: la separación entre semilla de selección y semilla de evaluación permite analizar la variabilidad de resultados en simulación sin tocar el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a `training_summary.json` y `evaluation.json` para los ajustes originales y los resultados históricos de simulación, pero no se proporcionan cifras en la información disponible. Las tasas de éxito históricas en simulación no constituyen validación en robot real y deben interpretarse ligadas a las semillas y al criterio de éxito registrados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,6 millones de parámetros y pesos en safetensors, el tamaño del repositorio es de 0,2 GB, lo que sugiere un requisito de memoria moderado, pero no se confirma una cifra de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma qué GPU consumer pueden ejecutarlo.
- Opciones de despliegue: carga mediante `lerobot==0.6.1` con `ACTPolicy.from_pretrained("./policy")` desde `lerobot.policies.act.modeling_act`, aplicando los pre/postprocesadores del mismo directorio. No se indican vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT-so101-pickplace-sim-150-10K-v1.0 | 51.617.414 | no aplica (chunk de 50) | no disponible | Apache 2.0 | Hugging Face (caspar) |
| Variante de 2.500 pasos del mismo autor | no disponible | no aplica | no disponible | no disponible | mencionada en la model card, sin identificador |
| Otros modelos ACT para SO101 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo entrenado y evaluado únicamente en simulación; las tasas de éxito históricas no constituyen validación en robot real.
- No se ejecutó entrenamiento, inferencia ni rollout nuevo para esta subida; la publicación solo verificó el SHA256 del checkpoint original, los assets de los procesadores y que los tensores fueran finitos.
- La revisión y el número de episodios del dataset `physicalai/so101_pickplace_sim_150` no quedan establecidos por el checkpoint recuperado; no debe asumirse que coincida con revisiones posteriores del dataset de caspar.
- El checkpoint de 10.000 pasos es una ejecución separada de la comparación de 2.500 pasos; no son directamente intercambiables.
- Cargar solo la red neuronal no aplica la normalización de observaciones ni la conversión de acciones a unidades articulares; es obligatorio usar los pre/postprocesadores incluidos.
- Los nombres de las cámaras y la normalización deben coincidir exactamente con la configuración guardada.
- No se incluyen estados del optimizador, demostraciones fuente ni credenciales, lo que limita la reproducibilidad completa del entrenamiento.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas aplicables, al no ser un modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial con las obligaciones de atribución y aviso correspondientes, aunque la validez en producción real no está demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/ACT-so101-pickplace-sim-150-10K-v1.0
- Repositorio de scripts de entrenamiento, evaluación y simulador: https://github.com/ady95/physicalai_tutorial
