# jona-skjk/retrieval

## Resumen

`jona-skjk/retrieval` es un repositorio experimental publicado en Hugging Face que contiene una implementación funcional de una arquitectura **CNN Transformer** orientada a tareas de **retrieval** (recuperación de información multimodal o texto-imagen), en su variante de configuración "small". El autor, `jona-skjk`, no presenta el modelo como un checkpoint entrenado ni publica resultados de benchmarks; el repositorio se describe explícitamente como un punto de partida reproducible con código transparente y pruebas de humo ("smoke tests").

El artefacto principal no es el archivo de pesos, sino el script `train.py`, que contiene tanto la definición del modelo como un punto de entrada de entrenamiento ejecutable. El checkpoint `model.safetensors` incluido (24.832 parámetros totales) es una **inicialización válida**, no un modelo entrenado. El repositorio incluye además `config.json` con los hiperparámetros de arquitectura y `training_args.json` con la receta de experimento por defecto.

Su relevancia es, por tanto, la de un esqueleto de investigación reproducible: permite a desarrolladores e investigadores arrancar experimentos de retrieval con una arquitectura híbrida CNN-Transformer con atención lineal y fusión de bajo rango, bajo licencia permisiva BSD-3-Clause. No debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida CNN + Transformer) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors de precision completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

Otros datos de configuracion declarados en la model card:

| Item | Valor |
|---|---|
| Escala | small |
| Atencion | linear |
| Fusion | low rank |
| Activacion | GELU |
| Normalizacion | ScaleNorm |
| Optimizador por defecto | Adafactor |
| Scheduler por defecto | polynomial |

## Arquitectura y entrenamiento

La arquitectura combina capas convolucionales con bloques Transformer, empleando **atención lineal** (linear attention) en lugar de atención cuadrática estándar, lo que en principio reduce el coste computacional y de memoria en secuencias largas. La fusión entre ramas o modalidades se realiza mediante un mecanismo de **bajo rango** (low rank fusion), la activación es GELU y la normalización es ScaleNorm (una variante de normalización sin media, más ligera que LayerNorm). La escala declarada es "small", coherente con los 24.832 parámetros del checkpoint incluido.

No se ha completado ningún entrenamiento: la model card indica explícitamente que el checkpoint `model.safetensors` es una **inicialización para smoke tests** y no un modelo entrenado. No se documentan número de tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO/SFT. La receta de experimento por defecto usa el optimizador Adafactor con un scheduler polinómico, valores que el autor describe como puntos de partida en el script y no como evidencia de una ejecución completada. La guía de evaluación del autor propone usar **Flickr30k** como primer benchmark, reportando la métrica de la tarea sobre al menos tres semillas y con una línea base de capacidad comparable.

## Capacidades

- **No hay capacidades demostradas**: el checkpoint no ha sido entrenado, por lo que no genera texto, no razona, no escribe código ni resuelve matemáticas de forma fiable.
- **Retrieval (objetivo de diseño)**: la arquitectura está pensada para tareas de recuperación (presumiblemente texto-imagen, dado el benchmark sugerido Flickr30k), pero no se aportan métricas que lo confirmen.
- **Tool calling / function calling**: no soportado ni documentado.
- **Agentes y razonamiento multi-paso**: no soportado ni documentado.
- **Capacidades multilingües**: no documentadas.
- **Capacidades especiales (thinking mode, visión, audio)**: no documentadas; el pipeline de Hugging Face no está definido.
- **Carga estándar**: al ser una implementación personalizada, las APIs genéricas de carga automática (`AutoModel`, `pipeline`) requieren un adaptador explícito antes de su uso.

## Casos de uso

- **Prototipado de investigación en retrieval**: servir como base reproducible para experimentar con arquitecturas CNN-Transformer y atención lineal en tareas de recuperación, modificando `train.py` y `config.json` según el experimento.
- **Reproducción de experimentos académicos**: el repositorio incluye receta de entrenamiento (`training_args.json`) y guía de evaluación (Flickr30k, tres semillas, línea base de capacidad comparable), lo que facilita protocolos comparables entre investigadores.
- **Pruebas de humo de pipelines de entrenamiento**: el checkpoint de inicialización permite verificar que el flujo de datos, el forward pass y el guardado de pesos funcionan antes de lanzar un entrenamiento costoso.
- **Estudio de mecanismos de atención lineal y ScaleNorm**: útil para analizar empíricamente el comportamiento de estas variantes frente a atención cuadrática y LayerNorm en tareas de recuperación.
- **Base para fine-tuning sobre dominios específicos**: una vez entrenado por el usuario, podría adaptarse a retrieval en dominios verticales (catálogos, documentación técnica), aunque esto requiere trabajo de entrenamiento no incluido.
- **Docencia y formación**: ejemplo didáctico de implementación completa de un modelo con código, configuración y argumentos de entrenamiento separados y legibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card omite deliberadamente cualquier afirmación de rendimiento y no incluye puntuaciones de Flickr30k, MMLU, HumanEval, GSM8K ni de ninguna otra tarea.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible con rigor; con 24.832 parámetros el checkpoint es trivial en memoria (del orden de kilobytes en fp32), pero al no ser un modelo entrenado la estimación de inferencia real carece de sentido.
- **GPU recomendadas**: no aplicable para el checkpoint actual; cualquier GPU consumer (incluso CPU) puede cargar los pesos de inicialización.
- **¿Cabe en GPU consumer?**: sí, con enorme holgura, dado el tamaño ínfimo del checkpoint.
- **Opciones de despliegue**: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una implementación personalizada, el despliegue requeriría adaptar `train.py` o escribir un wrapper propio.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (CNN Transformer para retrieval con atención lineal) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia. El repositorio, además, no es un modelo entrenado, por lo que cualquier comparación de rendimiento sería engañosa.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: `model.safetensors` es una inicialización para smoke tests; no produce resultados útiles en retrieval ni en ninguna otra tarea sin entrenamiento previo.
- **Sin auditoría**: el autor declara que el checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio.
- **Sin benchmarks**: no hay evidencia empírica de calidad; cualquier afirmación de rendimiento sería inventada.
- **Carga no estándar**: requiere adaptador explícito para APIs automáticas de Hugging Face; no funciona con `pipeline()` directamente.
- **Sin documentación de idiomas ni contexto**: no se especifican idiomas soportados ni longitud de contexto, lo que impide planificar su uso en producción.
- **Licencia BSD-3-Clause**: permisiva para uso comercial, pero el autor advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- **Riesgo de alucinación**: no aplicable en sentido estricto (no es un modelo generativo entrenado), pero sí existe riesgo de interpretar erróneamente su salida si se usa sin entrenar.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; tratar como experimental y no apto para producción.

## Enlaces

- Hugging Face: https://huggingface.co/jona-skjk/retrieval
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
