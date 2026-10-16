# Costale90/classification-proto

## Resumen

`Costale90/classification-proto` es un repositorio experimental publicado en HuggingFace que contiene una base de código de una arquitectura híbrida CNN-Transformer orientada a tareas de clasificación. Lo desarrolla el usuario Costale90 y su propósito declarado es servir como punto de partida inspeccionable antes de lanzar un entrenamiento completo, no como un modelo listo para producción. El repositorio incluye `run.py` (implementación y punto de entrada ejecutable), `config.json` (configuración de arquitectura), `training_args.json` (receta de experimento por defecto) y `model.safetensors`.

El checkpoint incluido es una inicialización válida para pruebas de humo (smoke tests), no un modelo entrenado. El propio autor indica explícitamente que no reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado. El dato real de safetensors arroja 16.576 parámetros totales, lo que contradice la etiqueta "giant" que figura en la model card, una discrepancia que conviene tener presente.

Su relevancia actual es limitada y acotada al ámbito de investigación: sirve como esqueleto reproducible para experimentar con fusión CNN-Transformer mediante cross attention, atención flash y normalización GroupNorm, con una receta de entrenamiento basada en Novograd y un schedule de warmup constante. No aporta pesos utilizables ni resultados medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrida CNN + Transformer) |
| Parametros totales | 16.576 (según safetensors); la model card declara escala "giant" |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una Cnn Transformer híbrida que combina componentes convolucionales con bloques de atención. Según la tabla de la model card, emplea atención de tipo flash, fusión mediante cross attention, activación ReLU y normalización GroupNorm. La escala declarada en esa tabla es "giant", pero el recuento real de parámetros del checkpoint safetensors es de 16.576, por lo que la etiqueta de escala no se corresponde con los pesos publicados y debe interpretarse como un valor de configuración del script, no como el tamaño efectivo del modelo.

En cuanto al entrenamiento, no hay evidencia de que se haya completado una ejecución. La receta por defecto que recoge `training_args.json` usa el optimizador Novograd con un schedule de warmup constante, valores que el autor describe como puntos de partida del script y no como resultado de un entrenamiento finalizado. No se documentan número de tokens, composición del dataset, ni fases de RLHF o DPO. El autor recomienda, para una evaluación significativa, entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y reportar la métrica de tarea sobre al menos tres semillas frente a un baseline de capacidad equivalente.

## Capacidades

- Clasificación: es la tarea para la que está diseñada la arquitectura, aunque el checkpoint publicado no ha sido entrenado y por tanto no clasifica de forma útil sin un entrenamiento previo.
- Ejecución de pruebas de humo: el peso safetensors permite validar que la inicialización y el pipeline de carga funcionan.
- Inspección de arquitectura: el código permite modificar y revisar decisiones de diseño (cross attention, GroupNorm, flash attention) antes de un entrenamiento completo.
- Generación de texto: no soportada (no es un modelo generativo ni un modelo de lenguaje).
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Punto de partida para investigación en arquitecturas híbridas: un equipo que quiera explorar la fusión CNN-Transformer mediante cross attention puede usar este repositorio como esqueleto, modificar `config.json` y validar cambios de arquitectura sin asumir el coste de un entrenamiento completo.
- Pruebas de integración y smoke tests de pipelines: el checkpoint de inicialización permite verificar que un pipeline de carga de safetensors, tokenización o preprocesado se ejecuta sin errores antes de invertir en cómputo de entrenamiento.
- Comparación de recetas de optimización: `training_args.json` define Novograd con warmup constante, lo que facilita montar experimentos controlados que comparen optimizadores y schedules sobre la misma arquitectura.
- Docencia y formación: al ser un código compacto con configuración explícita y solo 16.576 parámetros, resulta manejable para ilustrar cómo se compone un bloque híbrido CNN-Transformer y cómo se registra su configuración.
- Base para fine-tuning sobre datos propios: un investigador puede partir de esta inicialización y entrenar sobre un split etiquetado específico de su dominio, reportando la métrica de tarea entre semillas, tal y como sugiere el propio autor.
- Desarrollo de un harness de evaluación reproducible: el repositorio es un buen punto de partida para construir un banco de pruebas que compare esta arquitectura contra un baseline de capacidad equivalente bajo idéntica exposición de datos.
- Prototipado de cabeceras de clasificación: la implementación permite experimentar con distintas cabezas de clasificación y funciones de pérdida sobre el mismo tronco convolucional-atencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se reclama ninguna puntuación de benchmark y que el checkpoint safetensors es una inicialización válida para smoke tests, no un checkpoint de benchmark entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. Con 16.576 parámetros en safetensors y un tamaño de repositorio de 0,0 GB, el modelo cabe holgadamente en cualquier GPU e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada. Cualquier GPU consumer (por ejemplo, una GTX 1050 o superior) es más que suficiente; también es viable ejecutar en CPU para pruebas de humo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual y en la mayoría de entornos de CPU.
- Opciones de despliegue: al tratarse de una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso, tal y como advierte el autor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni resultados numéricos. La propia model card recomienda evaluar frente a un baseline de capacidad equivalente, pero no nombra ningún modelo concreto ni aporta cifras de comparación. Cualquier comparación cuantitativa con arquitecturas como ViT o ResNet requeriría entrenar y medir este repositorio primero, algo que no se ha hecho.

## Limitaciones y advertencias

- El checkpoint publicado no ha sido entrenado: no produce predicciones útiles para clasificación sin un entrenamiento previo.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según declara el propio autor.
- Discrepancia entre la escala declarada ("giant") y el recuento real de parámetros (16.576): la etiqueta de escala no refleja el tamaño efectivo de los pesos.
- Sesgos conocidos: no disponibles; al no haberse entrenado con datos, no se han caracterizado sesgos.
- Riesgo de alucinación: no aplica directamente, ya que no es un modelo generativo de lenguaje; no obstante, cualquier clasificador entrenado a partir de esta base puede producir falsos positivos y falsos negativos no medidos.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni idiomas soportados.
- Restricciones de licencia: se distribuye bajo BSD-3-Clause, que permite uso comercial con atribución; el propio autor recomienda revisar por separado los términos de los datos de origen cuando el repositorio se use con datasets externos.
- Para producción: cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse por separado de los valores por defecto que se envían en este repositorio.
- Advertencia sobre formatos: al ser una implementación personalizada, no se garantiza la carga mediante APIs genéricas sin un adaptador explícito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Costale90/classification-proto
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada.
