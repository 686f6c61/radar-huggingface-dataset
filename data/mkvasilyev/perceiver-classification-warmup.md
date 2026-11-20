# mkvasilyev/perceiver-classification-warmup

## Resumen

`mkvasilyev/perceiver-classification-warmup` es un prototipo de investigación publicado en Hugging Face por el usuario mkvasilyev. Implementa una arquitectura Perceiver orientada a tareas de clasificación, con una configuración etiquetada como "giant" y atención dispersa con fusión mediante co-atención. El repositorio incluye el código de entrenamiento (`finetune.py`), la configuración de arquitectura (`config.json`), una receta de experimento por defecto (`training_args.json`) y un checkpoint de inicialización en formato safetensors.

El modelo no es un modelo entrenado ni evaluado: el propio autor indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests) y que no se presenta ningún resultado de benchmark. El número de parámetros registrado en los metadatos de safetensors es de 16.576, un valor extremadamente reducido que no concuerda con la etiqueta "giant" de la model card, lo que refuerza su carácter de esqueleto experimental más que de modelo funcional.

Por su naturaleza, este repositorio resulta relevante únicamente como punto de partida reproducible para quien quiera experimentar con la arquitectura Perceiver en clasificación, no como un modelo listo para producción. La licencia Apache 2.0 facilita su reutilización y modificación, pero cualquier evaluación real requiere entrenamiento desde cero con datos etiquetados propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención dispersa, fusión por co-atención) |
| Parametros totales | 16.576 (según metadatos de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

Otros parámetros de arquitectura declarados en la model card: escala "giant", activación ReLU, normalización GroupNorm, optimizador Lion con schedule exponencial.

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer con un mecanismo de atención cruzada entre un conjunto de latentes de tamaño fijo y las entradas, lo que en principio permite procesar entradas de longitud variable con un coste computacional acotado. La model card especifica atención dispersa y fusión mediante co-atención, con activación ReLU y normalización GroupNorm. El repositorio no detalla el número de capas, dimensión de los latentes ni el tamaño del conjunto latente, por lo que no es posible reconstruir la topología completa a partir de la información disponible.

No se ha completado ningún entrenamiento: el checkpoint incluido es de inicialización y el autor lo describe como no entrenado ni auditado. La receta por defecto usa el optimizador Lion con un schedule exponencial, pero se presentan como valores de partida del script, no como evidencia de una ejecución finalizada. No hay información sobre volumen de tokens, composición del dataset, ni fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura Perceiver y el uso de atención dispersa.

## Capacidades

- Clasificación genérica: el modelo está diseñado para tareas de clasificación, aunque al no estar entrenado no ofrece capacidades funcionales reales.
- Implementación de referencia: incluye un script de fine-tuning (`finetune.py`) con punto de entrada ejecutable para experimentación.
- Configuración reproducible: `config.json` y `training_args.json` documentan la arquitectura y la receta de entrenamiento por defecto.
- Checkpoint de inicialización: permite pruebas de humo y validación del pipeline de carga de pesos.
- No soporta tool calling ni function calling de forma documentada.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No hay capacidades multilingües declaradas.
- No hay modo thinking, visión ni audio documentados.

## Casos de uso

- Investigación sobre arquitecturas Perceiver: sirve como base para reproducir y modificar una implementación de Perceiver aplicada a clasificación, partiendo de un código y una configuración ya estructurados.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite validar la carga de pesos, el flujo de datos y la ejecución del script `finetune.py` antes de lanzar un entrenamiento real.
- Fine-tuning sobre datasets etiquetados propios: el script incluido está pensado para adaptarse a una tarea de clasificación concreta, siempre que el usuario aporte los datos y ejecute el entrenamiento completo.
- Comparación de recetas de optimización: la configuración con Lion y schedule exponencial puede usarse como línea base frente a otras combinaciones de optimizador y scheduler en experimentos controlados.
- Docencia y formación: el repositorio es útil para explicar la arquitectura Perceiver y el flujo de publicación de un modelo en Hugging Face con artefactos separados (código, config, pesos).
- Desarrollo de adaptadores de carga: al tratarse de una implementación personalizada, sirve para practicar la escritura de adaptadores que permitan cargar el modelo con APIs genéricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 16.576 parámetros registrados el checkpoint es trivial en memoria, pero no representa un modelo funcional.
- GPU recomendadas: no disponible; al no existir un modelo entrenado, no hay recomendación de hardware significativa.
- Compatibilidad con GPU de consumo: el checkpoint de inicialización cabe en cualquier GPU de consumo e incluso en CPU, pero esto no implica capacidad de inferencia útil.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una implementación personalizada, requiere un adaptador explícito para APIs de carga genéricas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado | Licencia |
|---|---|---|---|---|
| mkvasilyev/perceiver-classification-warmup | 16.576 (metadatos) | no disponible | Checkpoint de inicialización, sin entrenar | Apache 2.0 |
| Perceiver IO (referencia de DeepMind) | no disponible en esta ficha | no disponible | Modelo publicado con resultados | no disponible en esta ficha |
| Modelos de clasificación estándar (p. ej. BERT-base) | no disponible en esta ficha | no disponible | Modelos entrenados y evaluados | no disponible en esta ficha |

No se dispone de datos verificados en la información proporcionada para establecer una comparativa cuantitativa con alternativas. La comparación cualitativa relevante es que este repositorio es un esqueleto experimental, mientras que los modelos de referencia de la misma categoría son artefactos entrenados y evaluados.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce predicciones útiles y no debe usarse en producción.
- No hay evaluación de robustez, equidad ni transferencia de dominio; el autor lo advierte explícitamente.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de interpretar erróneamente el repositorio como un modelo funcional.
- La discrepancia entre la etiqueta "giant" y los 16.576 parámetros registrados debe tratarse con cautela; no hay aclaración del autor en la información disponible.
- No hay idiomas declarados ni limitaciones de contexto documentadas.
- La licencia Apache 2.0 permite uso comercial del código y los pesos, pero deben revisarse por separado los términos de los datos externos que se usen para entrenar.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse de forma separada a los valores por defecto aquí incluidos.
- La implementación es personalizada y requiere un adaptador explícito para APIs de carga automática.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mkvasilyev/perceiver-classification-warmup
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
