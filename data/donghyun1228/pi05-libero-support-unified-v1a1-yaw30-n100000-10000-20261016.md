# Donghyun1228/pi05-libero-support-unified-v1a1-yaw30-n100000-10000-20261016

## Resumen

Este modelo es una política robótica de tipo VLA (vision-language-action) entrenada sobre la librería openpi y derivada de pi0.5. Lo publica el usuario Donghyun1228 y está especializado en el conjunto de tareas de manipulación LIBERO, con un objetivo de entrenamiento de dinámica inversa (inverse dynamics). Su nombre completo, `pi05-libero-support-unified-v1a1-yaw30-n100000-10000-20261016`, codifica la configuración exacta: variante pi0.5, benchmark LIBERO, conjunto "support", parámetro de orientación yaw30, 100000 fotogramas y 10000 actualizaciones. El repositorio ocupa 7,7 GB y la licencia es Apache-2.0.

Se trata de una adaptación de "LLM congelado unificado": únicamente se congelan las nueve hojas del LLM base, mientras que las 23 capas de visión, las 11 capas del expert y las 8 proyecciones de acción/tiempo se entrenan. El modelo parte de un checkpoint intermedio (update5000) de otro modelo fuente y continúa el entrenamiento con los pesos brutos, el optimizador y el EMA exactos, manteniendo la reanudación de índices del sampler y del RNG nativo del modelo por paso global.

Es relevante ahora porque documenta una receta reproducible de ajuste eficiente sobre el backbone de pi0.5, con protocolo de evaluación detallado (1568 de 2000 ensayos superados) y un pipeline de servicio con cola global para 32 clientes concurrentes sobre una sola GPU física. Está pensado para investigación en robótica y aprendizaje por imitación, no para uso conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA derivada de pi0.5 (openpi): codificador de visión de 23 capas, action expert de 11 capas y proyecciones de acción/tiempo de 8 componentes; backbone LLM congelado |
| Parametros totales | no disponible (el repositorio ocupa 7,7 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en inferencia; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (librería `openpi`; tamaño de repositorio 7,7 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5 de openpi, una política VLA que combina percepción visual, condicionamiento por lenguaje y generación de acciones motoras. Según la model card, solo se congelan las nueve hojas ("leaves") del LLM base. El resto del grafo es entrenable: la torre de visión (Vision23), el expert completo (expert11) y las ocho proyecciones de acción y tiempo. Las entradas y salidas son de siete dimensiones, incluyendo el control de pinza, y se conserva la normalización original y la muñeca ("wrist") de la fuente. El objetivo de entrenamiento es de dinámica inversa (IDM); la coordenada 6 de la pinza se excluye de la pérdida objetivo, calculada como media de las 31 coordenadas restantes con relleno.

El ajuste se realizó sobre el dataset `Donghyun1228/libero-support-random-waypoint-300k-yaw30-20261015` y arranca desde el checkpoint update5000 del modelo fuente `Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015` (commit `e435806e...`), reanudando pesos brutos, optimizador y EMA exactos, y continuando el RNG nativo por paso global. Los hiperparámetros declarados son: batch 32, semilla 42, learning rate 1e-5, warmup 500 y 10000 actualizaciones totales. El checkpoint publicado corresponde al paso 9999 en versión no EMA y en BF16 para inferencia.

## Capacidades

- Generación de acciones robóticas de siete dimensiones para manipulación, con control de pinza incluido.
- Ejecución de tareas de manipulación del benchmark LIBERO sobre simulación MuJoCo 3.2.3.
- Modelado de dinámica inversa: predice acciones a partir de estados/observaciones dentro del pipeline openpi.
- Condicionamiento por visión y lenguaje heredado del backbone pi0.5 (el LLM base permanece congelado).
- Servicio concurrente: soporta hasta 32 clientes simultáneos mediante cola global y batch de servidor 16.
- Integración nativa con la librería openpi para carga, normalización y despliegue.
- No se documentan capacidades de tool calling, agentes, audio ni modos de "thinking".

## Casos de uso

- Evaluación de referencia en LIBERO: sirve para reproducir el protocolo declarado (40 tareas x 50 ensayos, envseed7, 32 clientes) y comparar recetas de ajuste sobre pi0.5 con una línea base concreta.
- Investigación en dinámica inversa: permite estudiar el efecto de congelar solo el LLM base y entrenar visión, expert y proyecciones con un objetivo IDM y una exclusión concreta de la coordenada de pinza.
- Aprendizaje por imitación en simulación: usable como política de imitación sobre trayectorias LIBERO con normalización y muñeca preservadas de la fuente.
- Estudio de escalado de datos: el dataset de 300k waypoints y el ajuste a 100k fotogramas permiten analizar el impacto del volumen de datos de waypoints aleatorios.
- Reproducibilidad de checkpoints: al continuar desde update5000 con pesos, optimizador y EMA exactos, es adecuado para experimentos de reanudación y comparación "predefinida" de checkpoints.
- Pruebas de infraestructura de servicio: el protocolo `batched16_clients32_global_queue_v1` con cola global permite validar planificación de recursos y reparto de RNG en inferencia multiusuario.
- Base para ablaciones de yaw: la configuración yaw30 facilita comparar variantes de orientación dentro de la misma familia de modelos.

## Benchmarks y rendimiento

Tabla con los datos publicados en la model card. No se aportan otros benchmarks (MMLU, HumanEval, GSM8K, etc.) porque el modelo es una política robótica, no un LLM de propósito general.

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO | 40 tareas x 50 ensayos, envseed7, 32 clientes, una GPU física | 1568 / 2000 (78,4 %) |
| Estabilidad de rollout | MuJoCo 3.2.3, ubicación EGL verificada por PCI/UUID | cero errores de rollout |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 7,7 GB en el repositorio (compatible con BF16); para inferencia con batch y activaciones conviene reservar al menos 16 GB.
- GPU recomendadas: no se especifican en la información; la evaluación se realizó en "one physical GPU" con ubicación EGL verificada (EGL es habitual en GPUs de datacenter tipo A100/H100 y también soportado por GPUs profesionales).
- Viabilidad en GPU de consumo: no confirmada explícitamente, pero el tamaño de pesos es compatible con GPUs de gama alta con 16-24 GB (por ejemplo, RTX 4090/3090) si la pila openpi lo permite.
- Despliegue: librería `openpi` como vía principal; simulación con MuJoCo 3.2.3. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en términos de milisegundos; la model card describe un servidor con batch 16 y una cola global que limita a 32 clientes concurrentes repartidos en cuatro suites con 8 shards cada una.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada para otros modelos de la misma categoría (pi0, pi0.5 base, otras políticas LIBERO). La siguiente tabla resume lo que sí puede contrastarse.

| Modelo | Relación | Licencia | Disponibilidad |
|---|---|---|---|
| pi05-libero-support-unified-v1a1-yaw30 (este) | Adaptación con LLM congelado, ajuste IDM sobre LIBERO support | Apache-2.0 | HuggingFace (`Donghyun1228/...`) |
| pi05-libero-support-probe-source-n100000-10000 | Modelo fuente del que se continúa desde update5000 | no disponible | HuggingFace (`Donghyun1228/...`) |
| pi0.5 de openpi | Arquitectura base sobre la que se construye | no disponible en esta ficha | Repositorio openpi |

## Limitaciones y advertencias

- El rendimiento no es perfecto: 1568 de 2000 ensayos implica aproximadamente un 21,6 % de fallos en el protocolo de evaluación declarado.
- Resultados específicos de un protocolo concreto (envseed7, 32 clientes, cola global, MuJoCo 3.2.3); los cambios de forma de batch y la asignación de RNG compartida dependiente de la petición forman parte de ese protocolo y pueden no transferirse a otros entornos.
- Es un modelo de simulación; no se documenta validación en robots reales.
- Entrenado sobre un conjunto de tareas y una configuración concretos (LIBERO support, yaw30); el comportamiento fuera de esa distribución no está caracterizado.
- La exclusión de la coordenada 6 (pinza) de la pérdida objetivo puede afectar a la precisión del control de la pinza, aunque se conserva el control de siete dimensiones.
- No hay información sobre sesgos, idiomas ni multilingüismo, porque el modelo no está orientado a tareas de lenguaje natural.
- Riesgo de alucinación y de generalización fuera de distribución: inherente a políticas de imitación; no se aportan métricas al respecto.
- Licencia Apache-2.0, lo que en principio permite uso comercial, pero sin garantías ni datos de sesgo publicados por el autor.
- Repositorio sin descargas ni "likes" en el momento de la consulta (0 y 0), por lo que no hay evidencia de uso externo ni de validación independiente.
- No se documentan cuantizaciones alternativas a BF16, lo que limita el despliegue en hardware restringido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-yaw30-n100000-10000-20261016
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015
- Dataset: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-yaw30-20261015
- Commit del modelo fuente: `e435806e413a90c3b74c9411228a72b53b97060c`
- Commit del dataset: `9d2f1f4b5bbd4d2306b27aa4a1885738a019df32`
