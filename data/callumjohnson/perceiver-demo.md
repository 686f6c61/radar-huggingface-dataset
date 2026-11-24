# callumjohnson/perceiver-demo

## Resumen

`callumjohnson/perceiver-demo` es un repositorio de Hugging Face que contiene una implementación de un modelo Perceiver orientada a tareas de recuperación (retrieval). Lo publica el usuario callumjohnson bajo licencia BSD 3-Clause. No se trata de un modelo entrenado y publicado como release, sino de un punto de partida reproducible: el autor lo describe explícitamente como un "starting point" con un checkpoint de inicialización válido para pruebas de humo (smoke tests), no como un modelo con resultados de benchmark.

La arquitectura es un Perceiver de escala "base", con atención estándar, fusión mediante co-atención, activación approx-GELU y normalización InstanceNorm. El checkpoint en safetensors declara 33.088 parámetros totales, lo que lo sitúa como un artefacto de juguete o de demostración, muy lejos de los tamaños típicos de un modelo de retrieval en producción.

Su relevancia es limitada y de carácter didáctico: sirve para inspeccionar la implementación, validar el pipeline de carga y ejecutar un ejemplo de entrenamiento con la receta por defecto (AdamW con schedule polinómico). Cualquier evaluación seria requeriría entrenar el modelo desde cero sobre un dataset como Flickr30k, con al menos tres semillas y una línea base de capacidad comparable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención estándar, fusión por co-atención, activación approx-GELU, normalización InstanceNorm) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD 3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

El modelo sigue la familia Perceiver: un transformer que proyecta la entrada en un conjunto reducido de latentes y aplica atención cruzada entre latentes y entradas, lo que en principio permite manejar modalidades y longitudes variables. En esta implementación concreta la atención es estándar (no linear), la fusión entre flujos se realiza por co-atención, se usa approx-GELU como activación e InstanceNorm como normalización. La configuración está registrada en `config.json` y la receta de experimento por defecto en `training_args.json` (AdamW con schedule polinómico).

No hay evidencia de un entrenamiento completado. El autor indica que `model.safetensors` es un checkpoint de inicialización para pruebas de humo y que no se reclama ninguna puntuación de benchmark. Tampoco se documentan el volumen de tokens, la composición del dataset ni si hubo RLHF, DPO o ajuste supervisado. La evaluación sugerida por el propio autor es sobre Flickr30k, con métrica de la tarea reportada en al menos tres semillas y una línea base de capacidad equivalente.

## Capacidades

- No hay capacidades verificadas: el checkpoint no ha sido entrenado, por lo que no se puede afirmar generación de texto, razonamiento, código ni matemáticas.
- La arquitectura está etiquetada para retrieval, es decir, recuperación de elementos relevantes a partir de una consulta, pero el artefacto publicado no demuestra esa capacidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Pruebas de humo de infraestructura: cargar `model.safetensors` y ejecutar `predict.py --help` para validar que el entorno de PyTorch y el pipeline de carga funcionan antes de invertir en un entrenamiento real.
- Estudio de la arquitectura Perceiver: inspeccionar la implementación de co-atención y la proyección a latentes como material de referencia para quien quiera entender el patrón sin partir de un paper.
- Reproducción de experimentos: usar `training_args.json` como receta base (AdamW, schedule polinómico) y adaptarla a un dataset propio, manteniendo la misma exposición de datos entre líneas base para que la comparación sea justa.
- Evaluación comparativa de retrieval: entrenar el modelo sobre Flickr30k y medir la métrica de la tarea en tres semillas frente a una línea base de capacidad equivalente, tal como recomienda el autor.
- Docencia y talleres: el tamaño reducido (33.088 parámetros) permite ejecutar el ciclo completo de entrenamiento en CPU o en una GPU consumer sin cuellos de botella de memoria.
- Punto de partida para adaptadores propios: al ser una implementación personalizada, requiere un adaptador explícito para las APIs de carga automática; sirve como base para escribir ese adaptador una sola vez y reutilizarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con cualquier cuantización razonable, dado el tamaño de 33.088 parámetros; el checkpoint en safetensors ocupa prácticamente nada.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier RTX o incluso en iGPU; el cuello de botella no será la memoria.
- Opciones de despliegue: PyTorch nativo mediante `predict.py`; al ser una implementación personalizada, requiere un adaptador explícito para APIs de carga automática. No hay constancia de soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (Perceiver para retrieval) con parámetros, contexto y licencia verificables. Cualquier comparación con modelos de retrieval en producción sería engañosa dado que este artefacto no está entrenado.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no es un modelo funcional para retrieval ni para ninguna otra tarea.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según el propio autor.
- Riesgo de alucinación y sesgos: no evaluables, al no existir un modelo entrenado.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia BSD 3-Clause: permisiva para uso comercial, pero el autor advierte de revisar por separado los términos de los datos de origen cuando se use con datasets externos.
- La implementación es personalizada, por lo que las APIs genéricas de carga automática fallan sin un adaptador explícito; conviene no asumir compatibilidad con `AutoModel` estándar.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto que se distribuyen aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter experimental y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/callumjohnson/perceiver-demo
- Archivos del repositorio: `predict.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors`
- Paper de referencia de la arquitectura Perceiver: no disponible en la información proporcionada
- Blog, repos o demos adicionales: no disponibles en la información proporcionada
