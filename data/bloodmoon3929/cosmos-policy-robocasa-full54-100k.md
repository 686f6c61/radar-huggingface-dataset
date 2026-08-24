# bloodmoon3929/cosmos-policy-robocasa-full54-100k

## Resumen

`cosmos-policy-robocasa-full54-100k` es un checkpoint de fine-tuning del modelo de política robótica Cosmos-Policy (Predict2 2B), desarrollado por NVIDIA, adaptado específicamente para la tarea de presionar el botón de una máquina de café en el simulador RoboCasa. El autor, `bloodmoon3929`, ha entrenado el modelo sobre 54 episodios de demostraciones de éxito extraídas del dataset `RoboCasa-Cosmos-Policy/success_only`, durante 100 000 iteraciones con un tamaño de lote efectivo de 4. El resultado es un modelo especializado en manipulación robótica de bucle cerrado, evaluado en el propio simulador con 5 pruebas.

La relevancia de este modelo radica en que demuestra el fine-tuning de una política base de propósito general (Cosmos-Policy) con un número muy reducido de demostraciones (54 episodios) para una tarea concreta, lo que es un caso de uso típico en robótica de aprendizaje por imitación. El repositorio incluye los artefactos necesarios para la inferencia: estadísticas de normalización (`dataset_statistics.json`) y embeddings T5 de la instrucción de tarea (`t5_embeddings.pkl`). El tamaño del repositorio es de 3,9 GB, correspondiente al checkpoint consolidado en formato `.pt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de política robótica Cosmos-Policy Predict2 2B, sin detalles publicados) |
| Parametros totales | No disponible (el nombre sugiere 2B, pero no se confirma) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo procesa instrucciones de tarea en texto, probablemente inglés, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | `.pt` (PyTorch, consolidado desde DCP) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Se sabe que se basa en Cosmos-Policy Predict2 2B, un modelo de política robótica que integra visión, lenguaje y acción, pero no se especifican los componentes (transformers, difusión, etc.). El fine-tuning se realizó sobre el dataset `RoboCasa-Cosmos-Policy/success_only`, que es una versión modificada del benchmark RoboCasa con imágenes a 224×224 píxeles (frente a 128×128 del original). El entrenamiento se llevó a cabo durante 100 000 iteraciones con un tamaño de lote efectivo de 4, utilizando la configuración experimental `cosmos_predict2_2b_480p_robocasa_50_demos_per_task`. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un aprendizaje por imitación supervisado sobre demostraciones de éxito.

## Capacidades

- Ejecución de la tarea de manipulación robótica "presionar el botón de la máquina de café" en el simulador RoboCasa, en bucle cerrado (closed-loop).
- Seguimiento de instrucciones de tarea mediante embeddings T5 del texto descriptivo (incluidos en el repositorio).
- Control de robot basado en observaciones visuales (imágenes a 224×224) y datos de propriocepción/acción normalizados.
- Evaluación reproducible con el script `run_robocasa_eval.py` (5 trials, layout y estilo de entrenamiento coincidentes).
- No se conocen capacidades de generación de texto, razonamiento general, tool calling ni agentes; es un modelo de política puramente robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar cómo una política base (Cosmos-Policy) se adapta a una tarea específica con pocas demostraciones (54 episodios). Se puede comparar con otros checkpoints entrenados con más datos.
- Evaluación de políticas en simulación RoboCasa: permite reproducir experimentos de manipulación de electrodomésticos (máquina de café) en un entorno simulado realista, útil para validar algoritmos antes de pasar a hardware real.
- Desarrollo de sistemas de control para robots de servicio: la tarea de preparar café es un caso representativo de asistencia doméstica; el modelo puede integrarse en un pipeline de control para probar la viabilidad de la tarea en un entorno controlado.
- Benchmarking de frameworks de robótica: al estar basado en Cosmos-Policy, sirve para comparar el rendimiento de diferentes configuraciones de entrenamiento (número de demostraciones, iteraciones, resolución) dentro del mismo framework.
- Transferencia sim-to-real (potencial): aunque no se ha validado en hardware real, el modelo puede ser un punto de partida para experimentos de transferencia, dado que RoboCasa está diseñado para simular entornos realistas.
- Reproducibilidad de experimentos: al incluir los artefactos de normalización y embeddings, otros investigadores pueden replicar la evaluación exacta y verificar los resultados reportados en los logs del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card menciona que hay logs de evaluación en el repositorio (5 trials en bucle cerrado), pero no se proporcionan métricas numéricas (tasa de éxito, etc.) en la información extraída. No se pueden presentar tablas comparativas sin datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: según el repositorio oficial de Cosmos Policy, la inferencia base (sin planificación basada en modelo) requiere 8,9 GB de VRAM para tareas RoboCasa. Este checkpoint, al ser un fine-tuning del mismo modelo base, debería tener requisitos similares.
- GPU recomendadas: una GPU con al menos 9 GB de VRAM, por ejemplo RTX 4070, RTX 3080, A4000 o superior. No se especifican GPUs concretas en la documentación.
- Compatibilidad con GPU de consumo: sí, una RTX 4070 o similar con 12 GB de VRAM sería suficiente para la inferencia.
- Opciones de despliegue: el modelo se carga mediante el framework Cosmos Policy (`cosmos_policy.experiments.robot.robocasa.run_robocasa_eval` con `--ckpt_path` o la config de inferencia `cosmos_predict2_2b_480p_robocasa_50_demos_per_task__inference`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas fine-tuned para RoboCasa). El propio Cosmos-Policy Predict2 2B es el modelo base, pero no se han encontrado otros checkpoints de la misma tarea o con el mismo número de demostraciones en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente para la tarea `CoffeePressButton` con solo 54 episodios de demostraciones; la generalización a otras tareas o variaciones del entorno es muy limitada.
- Validado únicamente en simulación RoboCasa (5 trials con layout y estilo de entrenamiento coincidentes); no hay evidencia de funcionamiento en hardware real.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial o la redistribución del modelo y sus artefactos.
- Depende de los archivos auxiliares `dataset_statistics.json` y `t5_embeddings.pkl`; sin ellos, la inferencia no es posible.
- No es un modelo de lenguaje ni de propósito general; no puede utilizarse para tareas de texto, razonamiento o generación de contenido.
- El formato de checkpoint es `.pt` (PyTorch), no compatible directamente con frameworks de inferencia estándar para LLMs (vLLM, Ollama, etc.).
- No se han publicado métricas cuantitativas de rendimiento (tasa de éxito, error de acción), lo que dificulta evaluar su calidad objetiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bloodmoon3929/cosmos-policy-robocasa-full54-100k
- Dataset RoboCasa-Cosmos-Policy: https://huggingface.co/datasets/nvidia/RoboCasa-Cosmos-Policy
- Repositorio oficial de Cosmos Policy (NVIDIA): https://github.com/NVlabs/cosmos-policy
- Repositorio de RoboCasa (código base): https://github.com/moojink/robocasa-cosmos-policy
