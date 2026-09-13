# geonmin-kim/Cosmos3-Edge-Policy-DROID-Drift-K2

## Resumen

Cosmos3-Edge-Policy-DROID-Drift-K2 es un checkpoint intermedio de una política robótica de tipo vision-language-action (VLA) derivada de nvidia/Cosmos3-Edge-Policy-DROID. Lo publica el usuario geonmin-kim y su interés radica en que sustituye la rama de acción basada en flow matching por un generador de un solo paso entrenado con un objetivo de tipo drift (sigma=1), con el fin de reducir la latencia de inferencia de cuatro pasos de integración a uno.

El punto de partida es el checkpoint FastWAM-K2 en el paso 12.000, del que se heredan los pesos en versión EMA. El modelo que nos ocupa corresponde al paso 3.000 de un ciclo de 12.000 iteraciones, es decir, aproximadamente el 25 % del run, y el propio autor lo describe explícitamente como una instantánea para evaluación y no como un artefacto final. El repositorio ocupa 7,7 GB en safetensors y no incluye estado de entrenamiento, solo pesos exportados.

La relevancia es doble. Por un lado, es un caso práctico de destilación de un sampler de difusión/flow matching a un generador de un paso en el dominio de la robótica manipulativa. Por otro, arrastra una advertencia metodológica relevante: el cambio de objetivo obliga a usar solo datos de éxito de DROID, de modo que este brazo modifica simultáneamente la función de pérdida y el conjunto de datos, y no permite atribuir una eventual caída de rendimiento a una sola causa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo vision-language-action (VLA) basado en NVIDIA Cosmos3, con rama de acción y rama de visión; la rama de acción pasa de flow matching a un generador de un paso por objetivo drift |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin cuantizaciones declaradas |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (NVIDIA Open Model License) |
| Formato de pesos | safetensors (repositorio de 7,7 GB; incluye `export_manifest.json` con tamaños y sha256 por archivo) |
| Modelo base | nvidia/Cosmos3-Edge-Policy-DROID |
| Pipeline declarado | robotics |
| Estado del checkpoint | Paso 3.000 de 12.000 iteraciones (25 % del run); pesos EMA, sin estado de entrenamiento |
| Hardware de entrenamiento | 6 × NVIDIA B300 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un VLA de Cosmos3 con dos ramas. La rama de visión conserva el objetivo de flow matching (denominado pass A) y mantiene dos fotogramas generados (`two_pass_keep_generated_vision_frames=2`, es decir, K=2). La rama de acción es la que se modifica: en lugar de integrar una ODE de flow matching en cuatro pasos, se entrena directamente como generador de un paso en sigma=1 mediante una pérdida drift con cuatro siblings (G=4) y temperaturas (0,02; 0,05; 0,2), con un peso de pérdida drift de 10.

El entrenamiento parte de los pesos EMA del checkpoint `…-FastWAM-K2` en el paso 12.000, con optimizador reiniciado desde cero. Se usa FusedAdamW con learning rate de 1e-5 (multiplicado por 5 en los tres puentes de acción), scheduler LambdaLinear con warm-up de 1.000 iteraciones y ciclo de 12.000 (1e-5 en la iteración 1.000 hasta 1e-6 en la 12.000). El lote efectivo es de 48 etiquetas por paso: dataloader de 4, expandido a 16 filas por GPU tras aplicar G=4, sobre 6 GPU y con acumulación de gradiente de 2. Los datos son DROID en modo solo éxito, con filtro de ventana `keep_ranges_1_0_1`.

La innovación técnica es el cambio de función objetivo. Reducir los pasos de integración de 4 a 1 sin reentrenar cambia la función que se evalúa y degrada la precisión; el objetivo drift entrena al modelo para ser, en palabras de la documentación del framework, exactamente la función que despliega `num_inference_steps=1`. El coste es que la pérdida drift no es comparable en magnitud con la de flow matching y que el framework rechaza explícitamente combinarla con ponderación por muestra o enmascarado de fallos, lo que fuerza el uso exclusivo de datos de éxito.

## Capacidades

- Generación de acciones motoras para brazos robóticos manipulativos a partir de observaciones visuales e instrucciones, en el formato de política VLA.
- Generación de fotogramas de visión internos como parte del proceso de dos pasadas, conservando los dos últimos (K=2).
- Ejecución de acción en un solo paso de integración, frente a los cuatro del baseline, con `num_steps=1` y `guidance=1.0`.
- Servicio como política remota mediante el script `cosmos_framework.scripts.action_policy_server_robolab`, con prompts formateados en JSON.
- Modo sin guardrails (`--no-guardrails`), orientado a evaluación en RoboLab.
- Evaluación closed-loop dentro del entorno RoboLab.
- No se declaran capacidades de tool calling, agentes, multilingüismo ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Manipulación robótica en investigación: el modelo actúa como política de control para tareas de agarre y colocación en el benchmark RoboLab, con evaluación closed-loop sobre 96 episodios como referencia metodológica del proyecto.
- Control en tiempo real con presupuesto de latencia ajustado: al reducir la integración de la acción de 4 pasos a 1, el objetivo es acercar la latencia a los rangos de cientos de milisegundos observados en brazos previos (421 ms y 240 ms), frente a los 1.711 ms del baseline de 4 pasos.
- Réplica y verificación de experimentos de destilación: sirve como punto de comparación intermedio para estudiar si un generador de un paso con drift conserva la precisión de un sampler de flow matching multipaso.
- Fine-tuning posterior sobre datos propios de manipulación: al estar los pesos en safetensors y derivar de Cosmos3-Edge-Policy-DROID, puede usarse como inicialización para dominios de robot específicos, siempre que se respete la licencia NVIDIA.
- Evaluación de robustez frente a cambios de distribución: permite medir cómo se comporta una política destilada a un paso cuando el conjunto de entrenamiento se restringe a episodios exitosos de DROID.
- Integración en el pipeline `cosmos_framework` como servidor de política: el script de servicio permite levantar el checkpoint en un puerto y consumirlo desde un cliente de RoboLab para barridos de hiperparámetros de inferencia.
- Estudio de compromiso precisión-latencia en robótica: la comparación entre el brazo K=2 con drift y el baseline de 4 pasos es un caso concreto para decidir si merece la pena sacrificar precisión por velocidad de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este checkpoint concreto. El autor indica que la evaluación de este brazo (K=2 con drift a un paso) todavía no está disponible y que la referencia de decisión es RoboLab. Los datos publicados corresponden a brazos anteriores del mismo proyecto:

| Brazo | Configuración | RoboLab (n=96) | Latencia | Significación frente al baseline |
|---|---|---|---|---|
| Baseline | Full WAM + 4 pasos | 35/96 = 36,5 % | 1.711 ms | — |
| Drift-v2 | Full WAM + 1 paso | 21/96 = 21,9 % | 421 ms | p = 0,038 |
| DriftFastWAM | K=0 + 1 paso | 9/96 = 9,4 % | 240 ms | p = 0,00001 |
| Este checkpoint (Drift-K2) | K=2 + 1 paso | no disponible | no disponible | no disponible |

El autor advierte además que con n=96 una diferencia de ±9 puntos porcentuales entra dentro del ruido y que la curva de pérdida no es un criterio válido de comparación entre brazos con objetivos distintos, ya que la magnitud de la pérdida drift no es comparable con la de flow matching.

## Requisitos de hardware

- Entrenamiento: 6 × NVIDIA B300, según la configuración declarada en la model card.
- Inferencia: no hay mediciones de VRAM publicadas. El repositorio pesa 7,7 GB en safetensors, por lo que cargar los pesos requiere al menos ese orden de memoria, sin contar activaciones, buffers de visión ni los dos fotogramas generados que se conservan.
- GPU de consumo: no confirmado. Por tamaño de pesos, el modelo entraría en principio en GPUs con 12-24 GB de VRAM (por ejemplo, RTX 4090), pero no hay ninguna validación publicada de que la ruta de inferencia funcione en esas tarjetas.
- GPU de centro de datos: no se especifican requisitos mínimos; el proyecto ha entrenado en B300 y no documenta perfiles de inferencia en A100 o H100.
- Despliegue: la vía documentada es el servidor `cosmos_framework.scripts.action_policy_server_robolab`, con los argumentos `--format-prompt-as-json True`, `--no-guardrails`, `--keep-generated-vision-frames 2`, `--num-steps 1` y `--guidance 1.0`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a una política de acción.
- Latencia de referencia: los brazos previos de un paso midieron 421 ms y 240 ms; el baseline de 4 pasos, 1.711 ms. La model card insiste en medir la latencia antes que la precisión y en sospechar de los tres argumentos de servicio si el resultado se desvía mucho de lo esperado.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Relación | Objetivo de acción | Pasos de inferencia | Datos de entrenamiento | Latencia publicada | Licencia |
|---|---|---|---|---|---|---|
| geonmin-kim/Cosmos3-Edge-Policy-DROID-Drift-K2 (este) | Checkpoint derivado | Drift (generador de un paso, sigma=1) | 1 | DROID solo éxito, K=2 | no disponible | nvidia-open-model-license |
| nvidia/Cosmos3-Edge-Policy-DROID | Modelo base | Flow matching (no confirmado en detalle) | no disponible | DROID | no disponible | nvidia-open-model-license |
| Brazo K=2 de partida (`…-FastWAM-K2`, paso 12.000) | Punto de warm start | Flow matching | 4 | DROID éxito + fallo | no disponible | nvidia-open-model-license |
| Drift-v2 | Brazo previo del mismo proyecto | Drift a un paso | 1 | DROID | 421 ms; 21,9 % en RoboLab (n=96) | no disponible |
| DriftFastWAM | Brazo previo del mismo proyecto | Drift a un paso, K=0 | 1 | DROID | 240 ms; 9,4 % en RoboLab (n=96) | no disponible |

No se han identificado en la información proporcionada modelos comparables de otros autores para esta categoría concreta de política VLA destilada a un paso.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 3.000 de 12.000) publicado como instantánea de evaluación, no como artefacto final ni listo para producción.
- No incluye estado de entrenamiento: solo pesos EMA. No se puede reanudar el entrenamiento desde este repositorio.
- Los tres argumentos de servicio (`--keep-generated-vision-frames 2`, `--num-steps 1`, `--guidance 1.0`) no coinciden con los valores por defecto del servidor (todos los fotogramas, 4 pasos, 3.0 de guidance). Usar los valores por defecto despliega una función distinta de la entrenada y anula buena parte de la ganancia de velocidad.
- El cambio de datos es forzado, no opcional: el objetivo drift no admite ponderación por muestra ni enmascarado de fallos, por lo que se pasa de DROID éxito+fallo a DROID solo éxito. Este brazo modifica simultáneamente la función objetivo, el conjunto de datos, la secuencia (K=2) y el warm-up, de modo que un resultado adverso no es atribuible a una sola causa.
- Los dos brazos previos con drift quedaron por debajo del baseline: −14,6 puntos porcentuales el drift puro y −27,1 puntos porcentuales al combinarlo con la eliminación de visión. El autor señala que nunca se ha confirmado que el drift funcione como se esperaba.
- La pérdida drift no es comparable en magnitud con la de flow matching; las curvas de pérdida no sirven para juzgar estos brazos.
- La MAE en lazo abierto ha apuntado en dirección contraria en tres ocasiones dentro del proyecto; el criterio válido es RoboLab.
- Con n=96, una diferencia de ±9 puntos porcentuales está dentro del ruido; se recomienda muestreo adaptativo para comparar checkpoints.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinación; al tratarse de una política de acción, el riesgo relevante es la ejecución de acciones incorrectas en el robot, no la generación de texto.
- La licencia nvidia-open-model-license es de tipo "other" y no es una licencia de código abierto estándar; conviene revisar sus términos antes de cualquier uso comercial o redistribución.
- La model card está redactada principalmente en coreano, lo que puede dificultar la revisión por parte de equipos que no lo lean.
- No se documentan requisitos mínimos de VRAM para inferencia ni rendimiento en GPUs distintas de las B300 usadas en entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-Drift-K2
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- No se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
