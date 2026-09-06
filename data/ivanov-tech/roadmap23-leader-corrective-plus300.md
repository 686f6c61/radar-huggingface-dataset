# ivanov-tech/roadmap23-leader-corrective-plus300

## Resumen

`ivanov-tech/roadmap23-leader-corrective-plus300` es un checkpoint de investigación basado en LingBot-VLA v2, un modelo de visión-lenguaje-acción (VLA) diseñado para manipulación robótica. Desarrollado por ivanov-tech, parte del modelo base `dsaddsaf/lingbot-vla-2.0-FsMPCACo3YPN` y añade 300 actualizaciones supervisadas adicionales sobre una revisión intermedia del mismo, sin entrenamiento desde cero. El objetivo es explorar si las demostraciones correctivas y los ejemplos de intercambio mejoran el rendimiento en tareas robóticas concretas.

El modelo tiene 6.375.907.511 parámetros y se distribuye en formato safetensors, ocupando 25.5 GB. La arquitectura LingBot-VLA v2 mantiene el encoder de visión congelado y entrena los componentes de lenguaje y acción. No se ha publicado información sobre la longitud de contexto, los idiomas soportados ni la licencia, por lo que estos datos no están disponibles. Es un checkpoint de investigación con resultados preliminares y limitaciones explícitas, no un modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LingBot-VLA v2 |
| Parametros totales | 6.375.907.511 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el modelo base no publicó licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LingBot-VLA v2 es una arquitectura de visión-lenguaje-acción que combina un encoder visual, un módulo de lenguaje y un decodificador de acciones. En este checkpoint, el encoder de visión se mantiene congelado y solo se entrenan los componentes de lenguaje y acción. El entrenamiento consistió en 300 actualizaciones supervisadas adicionales sobre la revisión padre `e7d65c5babf0212f8a2c95eec585868e4c4f0059`, no desde cero. La mezcla de datos combina replay estándar de LIBERO, ejemplos de intercambio previos y demostraciones correctivas para tareas de bowl, milk y salad-dressing. El programa original preveía 600 actualizaciones pero se pausó en 300. No se utilizó aprendizaje por refuerzo (RLHF/DPO).

## Capacidades

- Generación de acciones robóticas a partir de instrucciones en lenguaje natural y observaciones visuales.
- Ejecución de tareas de manipulación en entornos LIBERO, incluidas tareas de bowl, milk y salad-dressing.
- Replanificación durante la ejecución: la evaluación del autor predijo 50 acciones y ejecutó 5 antes de replanificar, con 10 pasos de denoising.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en aprendizaje por imitación: el checkpoint permite estudiar cómo las demostraciones correctivas afectan a una política robótica existente, comparando el rendimiento con el modelo padre.
- Evaluación de políticas en benchmarks LIBERO: puede ejecutarse en el entorno LIBERO para medir el éxito en tareas de manipulación como bowl, milk y salad-dressing.
- Análisis de entrenamiento interrumpido: al ser un checkpoint pausado en 300 de 600 actualizaciones, resulta útil para investigar la relación entre el número de actualizaciones y el rendimiento.
- Ajuste fino para tareas domésticas: el modelo puede servir como base para adaptar políticas robóticas a tareas de cocina con objetos cotidianos.
- Comparación de políticas VLA: permite comparar el rendimiento con otros modelos de la misma familia, como el comparador Apex mencionado en la model card.
- Pruebas de generalización: el modelo puede evaluarse en nuevos layouts de escenas para analizar su robustez ante configuraciones no vistas.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor y corresponden a evaluaciones preliminares con limitaciones explícitas. No constituyen un benchmark oficial completo.

| Benchmark | Modelo padre | Checkpoint | Apex (comparador) |
|---|---|---|---|
| Bowl/milk (pruebas específicas) | 18/48 | 37/48 | no disponible |
| Subconjunto de nuevo layout | 11/30 | 22/30 | no disponible |
| LIBERO-PRO (112 intentos) | pendiente | 73/112 (0.601190) | 84/112 (0.714286) |

El autor indica que la prueba de bowl/milk fue una prueba más grande interrumpida, con advertencias no resueltas sobre equivalencia de cámara y ruido numérico. Además, el control real del modelo padre para LIBERO-PRO estaba pendiente en el momento de la publicación. No se ha publicado un benchmark completo.

## Requisitos de hardware

- VRAM estimada para inferencia: 25.5 GB en fp32; 12.75 GB en fp16 (no se especifican cuantizaciones adicionales).
- GPU recomendadas: A100 40GB o H100 80GB para fp32; RTX 4090 24GB para fp16 con optimizaciones de memoria.
- Es posible que quepa en GPU de consumo con fp16, siempre que se apliquen técnicas de reducción de memoria, aunque no se proporcionan datos oficiales.
- Opciones de despliegue: no se especifican. La inferencia usa el pipeline upstream LingBot-VLA v2, probablemente con PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con el modelo padre y con el comparador Apex mencionado en la model card. No se dispone de datos de parámetros, contexto ni licencia para Apex.

| Modelo | Parámetros | Rendimiento LIBERO-PRO | Licencia | Disponibilidad |
|---|---|---|---|---|
| Checkpoint actual | 6.375.907.511 | 73/112 (0.601190) | no disponible | HuggingFace |
| Modelo padre (revisión intermedia) | no disponible | pendiente | no disponible | HuggingFace |
| Apex (comparador) | no disponible | 84/112 (0.714286) | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, al ser un modelo de robótica.
- Riesgo de alucinación: puede ejecutar acciones incorrectas en entornos no vistos, especialmente con las advertencias de equivalencia de cámara y ruido numérico mencionadas por el autor.
- Limitaciones de contexto o idioma: no se ha publicado la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: el modelo base no publicó licencia ni model card en la revisión fijada; este checkpoint no otorga derechos adicionales sobre los componentes upstream. Es necesario verificar los términos del modelo original antes de cualquier uso.
- El dataset, los bancos de escenas privados, el optimizador y el estado de entrenamiento distribuido no están incluidos.
- No es un resultado oficial de subred ni un benchmark completo; los resultados presentados son preliminares y con caveats.

## Enlaces

- HuggingFace: https://huggingface.co/ivanov-tech/roadmap23-leader-corrective-plus300
- Model card en HuggingFace: https://huggingface.co/ivanov-tech/roadmap23-leader-corrective-plus300
- No se han encontrado papers, blogs, repositorios o demos adicionales en la búsqueda web.
