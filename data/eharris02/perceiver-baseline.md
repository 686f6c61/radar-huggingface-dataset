# eharris02/perceiver-baseline

## Resumen

`eharris02/perceiver-baseline` es un repositorio de HuggingFace publicado por el usuario eharris02 que contiene una implementación propia en PyTorch de la arquitectura Perceiver, configurada para experimentos multitarea. No se trata de un modelo preentrenado: el propio autor declara que el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (smoke tests) y revisión de código, y que no se presenta como un checkpoint entrenado ni se reclama ninguna puntuación de benchmark. El tamaño real de los pesos, según los metadatos de safetensors, es de 49.600 parámetros (cuarenta y nueve mil seiscientos), muy lejos de lo que sugeriría la etiqueta "xlarge" que usa la model card.

El interés del repositorio es, por tanto, formativo y metodológico: sirve como esqueleto reproducible de un Perceiver con atención de consultas agrupadas (grouped query attention), fusión multimodal por concatenación y MLP, activación approx gelu y normalización por grupos, además de una receta de entrenamiento por defecto basada en el optimizador Lion con scheduler exponencial. Es relevante ahora únicamente como pieza de infraestructura para experimentos controlados y como baseline de capacidad emparejada, no como modelo desplegable.

La licencia es Apache 2.0, el repositorio ocupa 0,0 GB y no se declaran idiomas, contexto, ni resultados de evaluación de ningún tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (implementación custom en PyTorch) |
| Parametros totales | 49.600 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), acompañado de `model.py`, `config.json` y `training_args.json` |
| Escala declarada por el autor | xlarge (no coincide con el tamaño real de los pesos) |
| Mecanismo de atencion | grouped query attention |
| Fusion | concat mlp |
| Activacion | approx gelu |
| Normalizacion | groupnorm |
| Optimizador por defecto | Lion |
| Scheduler por defecto | exponencial |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer con cuello de botella latente que procesa entradas de cualquier modalidad mediante cross-attention contra un conjunto reducido de latentes, seguido de bloques de self-attention sobre dichos latentes. En esta implementación concreta el autor especifica atención de consultas agrupadas, fusión por concatenación más MLP, activación approx gelu y normalización por grupos. El repositorio incluye el fichero `model.py` con la definición del modelo y un punto de entrada ejecutable (`python model.py --help`), `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto.

No hay información sobre datos de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. El autor es explícito al respecto: los valores de Lion y del scheduler exponencial son puntos de partida del script y "no evidencia de una ejecución completada". El checkpoint safetensors es una inicialización, no un modelo entrenado, y el autor recomienda que cualquier evaluación futura use un conjunto de test específico de la tarea, reporte la métrica con al menos tres semillas e incluya un baseline de capacidad emparejada, conservando los logs de entrenamiento y las versiones del entorno.

## Capacidades

- No hay capacidades demostradas: el checkpoint publicado no ha sido entrenado, por lo que sus salidas no son utilizables como predicciones.
- Generación de texto, razonamiento, código, matemáticas o visión: no disponibles y no verificadas en este repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidad estructural potencial (no verificada): el diseño multitarea con fusión `concat mlp` está pensado para combinar representaciones de varias entradas, pero no hay ningún resultado publicado que lo confirme.
- Punto de entrada ejecutable para pruebas de humo mediante `python model.py --help`.

## Casos de uso

- Pruebas de humo de pipelines de carga de pesos: validar que un cargador de safetensors, un orquestador de experimentos o un sistema de registro de checkpoints procesa correctamente un fichero de 49.600 parámetros antes de pasar a modelos reales.
- Baseline de capacidad emparejada en experimentos controlados: el propio autor sugiere entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas, y este repositorio sirve como la pieza de referencia de baja capacidad.
- Revisión de código y docencia: `model.py` es un artefacto legible para explicar cómo se implementa un Perceiver con atención de consultas agrupadas y fusión por concatenación sin depender de una librería de alto nivel.
- Desarrollo de harness de evaluación: un modelo de 49.600 parámetros permite medir el coste fijo (overhead) de un pipeline de evaluación sin que el cálculo del modelo domine la latencia.
- Pruebas de integración de recetas de entrenamiento: verificar que un entrenador acepta Lion con scheduler exponencial y registra correctamente `training_args.json` antes de lanzar ejecuciones costosas.
- Experimentos sintéticos de fusión multimodal: ejercitar la ruta `concat mlp` con tensores aleatorios para depurar formas, máscaras y normalización por grupos.
- Referencia negativa en documentación interna: ilustrar qué no debe publicarse como modelo listo para producción (checkpoint sin entrenar, etiqueta de escala incoherente con el número de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación en este repositorio y que el checkpoint es una inicialización para pruebas de humo, no un checkpoint evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión. Los 49.600 parámetros ocupan aproximadamente 0,19 MB en fp32 (4 bytes por parámetro) y unos 0,10 MB en fp16; el grueso del consumo proviene del intérprete de Python y de PyTorch, no de los pesos.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y también en CPU, Raspberry Pi o entornos sin acelerador.
- Cabe en GPU consumer: sí, en todas, con un uso de memoria despreciable.
- Opciones de despliegue: no se puede servir con vLLM, TGI, Ollama o llama.cpp de forma directa, porque es una implementación custom y las APIs automáticas de carga requieren un adaptador explícito según el autor. La vía prevista es ejecutar `model.py` directamente o escribir un wrapper `torch.nn.Module` que lea `config.json` y `model.safetensors`.
- Latencia y throughput: no publicados. Con este tamaño, la latencia estaría dominada por el overhead de Python y del framework, no por el cálculo matricial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado y disponibilidad |
|---|---|---|---|---|
| eharris02/perceiver-baseline | 49.600 | no disponible | apache-2.0 | Checkpoint de inicialización, sin entrenar ni evaluar |
| Perceiver IO (DeepMind) | no disponible en la informacion proporcionada | no disponible | no verificada en la informacion proporcionada | Implementación de referencia con pesos publicados por el autor original |
| Perceiver original (DeepMind) | no disponible en la informacion proporcionada | no disponible | no verificada en la informacion proporcionada | Implementación de referencia académica |

No se han identificado en la información disponible alternativas de capacidad equivalente (decenas de miles de parámetros, licencia Apache 2.0 y propósito de prueba de humo) con las que establecer una comparación cuantitativa. Los dos Perceiver de referencia se incluyen solo como marco arquitectónico, no como comparación de rendimiento.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: las salidas no tienen valor predictivo y no deben interpretarse como resultados.
- No hay auditoría de robustez, equidad (fairness) ni transferencia de dominio; el autor lo declara explícitamente.
- No se declaran idiomas soportados, por lo que no se puede asumir cobertura multilingüe ni monolingüe.
- Ausencia total de benchmarks: cualquier afirmación de calidad sería inventada.
- Incoherencia entre la etiqueta "xlarge" de la model card y los 49.600 parámetros reales de safetensors; conviene verificar `config.json` antes de reutilizar la configuración.
- Implementación custom: `AutoModel.from_pretrained` y similares no funcionan sin un adaptador escrito a medida.
- Licencia Apache 2.0 permite uso comercial del código y los pesos, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se usan datasets externos.
- Cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse de forma separada a los valores por defecto de este repositorio.
- El repositorio ocupa 0,0 GB y no incluye resultados, logs ni artefactos de evaluación que permitan auditar la receta declarada.

## Enlaces

- HuggingFace: https://huggingface.co/eharris02/perceiver-baseline
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos asociados a este modelo.
