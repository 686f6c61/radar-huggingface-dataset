# OneWorld-AI/abc-rolling-nano

## Resumen

El modelo `OneWorld-AI/abc-rolling-nano` es un world model (modelo de mundo) para robótica y generación de video, desarrollado por OneWorld-AI. Se basa en la arquitectura Cosmos3 Nano y ha sido entrenado con una estrategia de *bounded-window rolling rectified flow*, un enfoque de flujo rectificado con ventana deslizante que permite predicción de dinámica forward condicionada por acciones. El checkpoint exportado corresponde a los pesos EMA de la iteración 20.000 del entrenamiento, y está disponible en formato safetensors con un total de 15.173.136.576 parámetros (aproximadamente 15,17 mil millones).

El modelo resuelve el problema de predecir la evolución de una escena robótica a partir de una o varias frames de entrada y una secuencia de acciones articulares. Es relevante porque ofrece un world model de tamaño medio, exportado a HuggingFace, que puede integrarse en pipelines de simulación, planificación y generación de datos sintéticos para robótica. Su ventana de contexto es de 333 frames de video a 15 fps, con una resolución de 224×336 píxeles, y requiere un sampler específico (`rolling`) que no es compatible con los samplers estándar de Cosmos Framework.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 Nano (transformer de video) |
| Parametros totales | 15.173.136.576 (15,17 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 333 frames de video (15 fps, ventana de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de video, sin entrada de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 30,3 GB) |

## Arquitectura y entrenamiento

La arquitectura base es Cosmos3 Nano, un transformer de video diseñado para modelado de mundos. El entrenamiento utiliza *bounded-window rolling rectified flow*: se procesan ventanas de 333 frames seleccionadas a 15 fps, con un *frame skip* nativo de 2 sobre datos fuente de 30 Hz. La entrada puede ser una única frame precompuesta (para inicio de episodio) o cinco frames (cuatro de historial más la actual) para ventanas con contexto previo. Las acciones se representan como una matriz JSON de forma `[332, 14]`, con 14 dimensiones que codifican seis articulaciones del brazo izquierdo, la pinza izquierda, seis articulaciones del brazo derecho y la pinza derecha.

La inferencia emplea un sampler *rolling UniPC* con escalera sigma deslizante, 64 pasos de fase y CFG desactivado. El checkpoint exportado proviene de los pesos EMA de la iteración 20.000, y se incluyen sidecars de procedencia (`checkpoint.json` y `export_manifest.json`). No se especifica el número total de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de video condicionada por acciones: predice 333 frames futuras (o 332 tras descartar la primera) a partir de la frame actual y una secuencia de acciones articulares.
- Modelado de dinámica forward para robótica: simula la evolución de un escenario con brazos robóticos y pinzas.
- Entrada multimodal: acepta una o cinco frames RGB (224×336) y una matriz de acciones de 14 dimensiones.
- Soporte de ventanas con historial: permite condicionar con hasta cuatro frames previas para mejorar la coherencia temporal.
- Integración con Cosmos Framework: requiere el sampler `rolling` y el código de inferencia específico de la rama `exp/004-abc-rolling-inference-pipeline`.
- No es un modelo de lenguaje: no dispone de capacidades de texto, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Simulación de entornos robóticos para entrenamiento de políticas: el modelo puede generar trayectorias visuales realistas a partir de acciones, permitiendo entrenar políticas de control en simulación sin necesidad de un simulador físico completo.
- Planificación de movimientos con predicción de video: un planificador puede evaluar múltiples secuencias de acciones y seleccionar la que produzca la trayectoria predicha más adecuada, gracias a la salida de 333 frames.
- Generación de datos sintéticos para aprendizaje por refuerzo: las predicciones del modelo pueden usarse como aumentación de datos o como entorno de bajo coste para explorar políticas antes de transferirlas al mundo real.
- Visualización de trayectorias de robot: permite previsualizar el resultado de una secuencia de comandos articulares antes de ejecutarlos en el hardware, útil para depuración y validación.
- Evaluación de políticas en entornos simulados: dado un historial de frames y una política, el modelo puede generar el rollout completo para medir el rendimiento sin interacción física.
- Investigación en world models y predicción de video: sirve como punto de partida para estudiar técnicas de *rolling rectified flow* y comparar con otros enfoques de modelado de mundos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de video (FVD, PSNR, etc.) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- El repositorio de pesos en safetensors ocupa 30,3 GB, lo que sugiere que la carga en precisión fp16 requiere al menos 32 GB de VRAM (por ejemplo, una GPU NVIDIA A100 de 40 GB o H100 de 80 GB).
- Para GPUs de consumo (RTX 4090 con 24 GB) sería necesaria cuantización a 8 bits o menor, aunque no se han publicado versiones cuantizadas.
- El despliegue requiere Cosmos Framework con soporte para `--sampler=rolling`; no se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados; dependerán del hardware y del número de pasos de muestreo (64 pasos de fase).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo se basa en Cosmos3 Nano, pero no se han publicado comparativas con otros world models de tamaño similar (por ejemplo, Cosmos Predict, Genie, o modelos de difusión de video). Se recomienda consultar el paper de Nano World Models (arXiv:2605.23993) para un contexto más amplio, aunque no ofrece datos de comparación directa con este checkpoint.

## Limitaciones y advertencias

- El modelo no debe muestrearse con los samplers estándar `unipc` o `edm` de Cosmos Framework; es obligatorio usar `--sampler=rolling` con la escalera sigma deslizante.
- La licencia no está especificada, lo que supone un riesgo legal para uso comercial o redistribución.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo generativo de video, puede producir frames irreales o inconsistentes en escenarios fuera de su distribución de entrenamiento.
- La resolución está fijada en 224×336 píxeles y la frecuencia en 15 fps; no se soportan otras resoluciones o frecuencias sin reentrenamiento.
- El contexto de 333 frames limita la duración máxima de las predicciones; para horizontes más largos se requeriría un enfoque de ventana deslizante adicional.
- No hay información sobre el dataset de entrenamiento, por lo que se desconocen los dominios cubiertos y las posibles limitaciones de generalización.
- El código de inferencia está en una rama experimental (`exp/004-abc-rolling-inference-pipeline`) y puede no ser estable para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneWorld-AI/abc-rolling-nano
- Space de visualización de checkpoints: https://huggingface.co/spaces/Z1j1n/abc-rolling-nano-viewer
- Repositorio de código (rama de inferencia): https://github.com/one-world-ai/cosmos-framework-mirror/tree/exp/004-abc-rolling-inference-pipeline
- Pull request de la pipeline de inferencia: https://github.com/one-world-ai/cosmos-framework-mirror/pull/6
- Commit pinneado del framework: https://github.com/one-world-ai/cosmos-framework-mirror/commit/281a3681e74ae610a0277ae32a67c8c0b9e917bc
- Paper relacionado (Nano World Models): https://arxiv.org/abs/2605.23993
