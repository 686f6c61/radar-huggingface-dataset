# kennynakamura/mixer-baseline-2023

## Resumen

`mixer-baseline-2023` es un prototipo de investigación de la arquitectura Mixer (una variante del MLP-Mixer) desarrollado por `kennynakamura` con el objetivo de servir como punto de partida para experimentos en tareas de matching (emparejamiento). El modelo se distribuye en formato safetensors y se acompaña de un script Python (`run.py`) que contiene la implementación, un `config.json` con la configuración generada y un `training_args.json` con la receta experimental por defecto.

A diferencia de los modelos de lenguaje de gran tamaño, este proyecto es minimalista: la arquitectura tiene una escala nano y un total de 33.088 parámetros. El checkpoint incluido no está entrenado; el autor lo describe explícitamente como un "checkpoint de inicialización válido para pruebas de humo" y no reivindica ningún resultado de rendimiento. La relevancia actual del modelo radica en su valor como baseline experimental y como material didáctico para entender los componentes de una arquitectura Mixer con atención multi-query, no como un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer |
| Parametros totales | 33.088 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una variante de Mixer (basada en MLP-Mixer) con atención multi-query, fusión mediante concatenación y MLP, activación mish y normalización layernorm. El script `run.py` define el modelo y un ejemplo ejecutable o punto de entrada de entrenamiento. La configuración incluida (`training_args.json`) establece el uso de AdamW con un scheduler OneCycle, pero el autor indica que son valores iniciales y no constituyen evidencia de un entrenamiento completado.

No se proporcionan datos sobre los tokens, la composición del dataset ni procesos de RLHF/DPO. El checkpoint `model.safetensors` es un estado de inicialización, no un modelo entrenado. No se describe ninguna innovación técnica destacable más allá de su condición de prototipo.

## Capacidades

- Generación de texto, razonamiento, código, matemáticas o visión: no disponibles. El checkpoint inicializado no ha sido entrenado y no se ha verificado ninguna capacidad funcional.
- Tool calling / function calling: no implementado.
- Soporte de agentes y razonamiento multi-paso: no implementado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- El diseño conceptual pretende abordar tareas de matching, pero no hay evidencia de rendimiento.
- El archivo `run.py` incluye un ejemplo de prueba de humo que puede ejecutarse para verificar que la implementación funciona, sin implicar ninguna precisión de tarea.

## Casos de uso

- Investigación comparativa de arquitecturas: puede emplearse como baseline de capacidad mínima en experimentos controlados sobre tareas de matching, siempre que se entrene desde cero con las mismas condiciones que los modelos comparados.
- Pruebas de humo en CI/CD: el checkpoint de inicialización sirve para validar que los pipelines de entrenamiento y las cargas de la implementación personalizada funcionan correctamente antes de lanzar runs costosos.
- Educación: `run.py` y los archivos de configuración ofrecen una implementación mínima y didáctica de una arquitectura Mixer con atención multi-query, útil para estudiar el código en cursos o talleres.
- Desarrollo de adaptadores de carga: al no ser compatible con APIs genéricas de HuggingFace, puede usarse como caso de prueba para construir adaptadores explícitos que permitan cargar modelos con configuraciones personalizadas.
- Validación de inicialización: permite comprobar que el modelo es capaz de sobreajustar un conjunto de datos muy pequeño, lo que sirve para verificar la implementación del optimizador AdamW con scheduler OneCycle.
- Reproducción científica: el proyecto documenta una guía de evaluación recomendada (conjunto de validación pareado, métrica de tarea, tres semillas) que puede ponerse en práctica con modelos similares para garantizar comparaciones justas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 33.088 parámetros, el checkpoint ocupa aproximadamente 132 KB en FP32. La VRAM necesaria es inferior a 1 GB y hace falta menos de 50 MB de memoria en CPU.
- GPU recomendadas: ninguna en particular; puede ejecutarse en cualquier GPU moderna o incluso en CPU estándar.
- Compatibilidad con GPU de consumo: sí, cualquier tarjeta de gama baja (RTX 20, 30, 40 o equivalente) es suficiente.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. Requiere un adaptador explícito para cargar el checkpoint y ejecutar `run.py` en un entorno Python local.
- Latencia y throughput estimados: no disponibles; no se han realizado mediciones públicas. Dado el tamaño, la latencia sería inferior a 10 ms por paso en CPU, pero este dato no está verificado.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría: se trata de un prototipo de investigación de escala nano sin checkpoint entrenado. El MLP-Mixer original (Google, 2021) comparte la arquitectura Mixer, pero no es un baseline de matching comparable ni un modelo comercial.

## Limitaciones y advertencias

- Checkpoint no entrenado: es un estado de inicialización, no un modelo funcional.
- Sin benchmarks públicos: el autor no reivindica ninguna métrica de rendimiento.
- Sin auditoría: no se ha evaluado robustez, sesgos, fairness ni transferencia de dominio.
- Implementación personalizada: la carga genérica de HuggingFace no funciona directamente; se requiere un adaptador explícito para usar el modelo.
- Riesgo de alucinación: no aplica al ser un modelo sin capacidades generativas entrenadas; cualquier uso como si fuera un modelo entrenado llevaría a resultados sin sentido.
- Limitaciones de idioma y contexto: no documentadas.
- Licencia BSD-3: permite uso comercial, pero el autor indica revisar los términos de las fuentes de datos externas si se usa con datasets de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/kennynakamura/mixer-baseline-2023
