# diwank/reachy-mini-gesture-intent-lora-v8-20261117

## Resumen

Reachy Mini Gesture Intent LoRA v8 es un adaptador PEFT (LoRA) publicado por el usuario diwank sobre el modelo base `binhpham/reachy-mini-motion-planner-4b`, un planificador de movimiento de 4.000 millones de parámetros orientado al robot Reachy Mini. El adaptador no es un modelo generativo de propósito general, sino un componente especializado que transforma intenciones de gesto en representaciones que el planificador base puede compilar y ejecutar como trayectorias de movimiento.

El problema que aborda es la brecha entre una instrucción de alto nivel ("saluda", "señala hacia la izquierda") y las secuencias de articulaciones que el robot debe ejecutar de forma segura. Según la model card, el adaptador seleccionado (step-20) eleva la tasa conjunta de tarea y seguridad del 28,25% al 90,38% frente al paquete por defecto, con una diferencia pareada de +62,12 puntos porcentuales.

Es relevante porque documenta un flujo experimental completo de ajuste fino para robótica: dataset de intenciones, extractor y compilador asociados, criterios de promoción sobre desarrollo y test, y métricas de latencia. El repositorio es pequeño (0,1 GB) y no registra descargas ni valoraciones en el momento de la consulta, lo que sugiere un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `binhpham/reachy-mini-motion-planner-4b` |
| Parámetros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base tiene 4B según su identificador) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, matrices de bajo rango inyectadas en las capas del modelo base `reachy-mini-motion-planner-4b`, que permanece congelado. El adaptador se distribuye en formato safetensors y se carga mediante la librería `peft`. La model card no detalla en qué módulos se aplica el LoRA, el rango utilizado, el alpha ni la tasa de aprendizaje.

El entrenamiento se enmarca en un experimento denominado "state-aware gesture intent" (v8), con selección de checkpoint sobre desarrollo y validación posterior en test. La selección de desarrollo eligió el step-20 y el candidato superó los criterios de promoción. La evaluación se realizó sobre 200 tareas agrupadas en 50 grupos completos mediante bootstrap, comparando el paquete por defecto con el planificador de intenciones seleccionado. La model card indica explícitamente que las métricas miden replay numérico de diez gestos familiares y que la calidad física del movimiento requiere una evaluación con supervisión presencial. No se especifican el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Extracción de intención de gesto a partir de instrucciones, mediante el extractor incluido en el dataset del experimento.
- Compilación de la intención a un plan de movimiento ejecutable por el planificador base de 4B.
- Planificación de movimiento con conciencia de estado ("state-aware"), según la denominación del experimento.
- Cumplimiento de restricciones de seguridad: la métrica de seguridad en reproducción alcanza el 99,00% en el candidato seleccionado.
- Cobertura de recetas de gestos: 99,00% en el candidato frente al 100,00% del paquete por defecto.
- Reproducción numérica de diez gestos familiares.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Control gestual de un robot social: el adaptador traduce una orden de alto nivel en una intención estructurada que el planificador compila en trayectorias articulares, lo que permite programar gestos sin escribir cinemática a mano.
- Evaluación de seguridad en robótica: la métrica de seguridad en reproducción (99,00%) permite usar el adaptador en pruebas de conformidad donde un gesto mal planificado podría dañar el robot o su entorno.
- Investigación en planificación de movimiento: el par adaptador más dataset más compilador sirve como banco de pruebas reproducible para comparar estrategias de ajuste fino sobre un planificador de 4B.
- Prototipado rápido de interacciones: con una latencia media de planificador y compilador de 1,801 s en el candidato, es viable en bucles de demostración interactiva donde el paquete por defecto tardaba 2,834 s.
- Generación de recetas de gestos para bibliotecas de animación: la cobertura de recetas del 99,00% permite derivar variantes de gestos a partir de especificaciones textuales.
- Validación de pipelines de ajuste fino: el flujo con criterios de promoción sobre desarrollo y test y con intervalos de confianza bootstrap (+53,00 a +70,88 puntos) es reutilizable como plantilla metodológica en otros proyectos de robótica.

## Benchmarks y rendimiento

Resultados de la model card sobre el conjunto de test retenido (200 tareas, 50 grupos en bootstrap):

| Métrica | Paquete por defecto | Planificador de intención seleccionado |
|---|---:|---:|
| Tarea y seguridad conjuntas | 28,25% | 90,38% |
| Seguridad bruta | 88,00% | 90,38% |
| Seguridad en reproducción | 100,00% | 99,00% |
| Conjunción natural | 38,00% | 81,00% |
| Conjunción explícita | 18,50% | 99,75% |
| Cobertura de recetas | 100,00% | 99,00% |
| Latencia media planificador + compilador | 2,834 s | 1,801 s |

La diferencia pareada en la métrica conjunta fue de +62,12 puntos porcentuales, con intervalo del 95% de +53,00 a +70,88. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia, el modelo base declara 4B parámetros; en fp16 requeriría del orden de 8 GB solo para pesos, más overhead de activaciones y del adaptador.
- GPU recomendadas: no disponibles. Por tamaño del modelo base, una RTX 4090 (24 GB) sería suficiente en fp16; A100 o H100 no serían necesarias para este tamaño.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas con 12-16 GB o más, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: carga mediante `peft` sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 1,801 s de media para planificador y compilador en el candidato seleccionado, frente a 2,834 s del paquete por defecto. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diwank/reachy-mini-gesture-intent-lora-v8-20261117 | Adaptador LoRA sobre base de 4B | No disponible | Intención de gesto para Reachy Mini | No disponible | Hugging Face, 0 descargas |
| binhpham/reachy-mini-motion-planner-4b (base) | 4B | No disponible | Planificación de movimiento | No disponible | Hugging Face |
| Paquete por defecto del experimento | No disponible | No disponible | Línea base de planificación | No disponible | Referenciado en la model card |

No se dispone de información sobre otros adaptadores o planificadores de gestos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucinación: no evaluado; el modelo produce planes de movimiento, no texto libre, por lo que el fallo se manifiesta como gestos incorrectos o inseguros.
- La evaluación mide replay numérico de diez gestos familiares; la calidad física del movimiento requiere evaluación presencial, según advierte la propia model card.
- La cobertura de recetas baja del 100,00% al 99,00% y la seguridad en reproducción del 100,00% al 99,00% respecto al paquete por defecto: el candidato no domina en todas las métricas.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas no disponibles: no se puede garantizar el comportamiento en castellano u otras lenguas.
- Contexto no disponible: se desconoce la longitud máxima de instrucción admitida.
- Repositorio sin descargas ni valoraciones: no hay evidencia de uso externo ni de validación independiente.
- Dependencia estricta del extractor y compilador del dataset del experimento; sin ellos el adaptador no es utilizable.
- Artefacto de investigación con fecha de creación 2026-11-17: posible falta de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diwank/reachy-mini-gesture-intent-lora-v8-20261117
- Modelo base: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b
- Dataset del experimento: https://huggingface.co/datasets/diwank/reachy-mini-gesture-intent-v8-20261117
