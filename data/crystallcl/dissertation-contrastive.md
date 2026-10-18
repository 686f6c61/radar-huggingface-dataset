# crystallcl/dissertation-contrastive

## Resumen

`crystallcl/dissertation-contrastive` es un repositorio de HuggingFace que contiene una implementación propia en PyTorch de una arquitectura Perceiver orientada a aprendizaje contrastivo. Lo publica el usuario `crystallcl` y no se presenta como un modelo preentrenado, sino como un artefacto de código con un checkpoint de inicialización (`model.safetensors`) destinado a revisiones de código, pruebas de humo (smoke tests) y experimentos controlados de pequeña escala. El propio autor indica explícitamente que no reclama ninguna puntuación de benchmark.

El dato más relevante para cualquier evaluador es la escala real: el checkpoint contiene 24.832 parámetros totales, lo que equivale a unos 0,1 MB en fp32 y a un repositorio de 0,0 GB. Esa cifra es incompatible con una configuración "base" de Perceiver al uso (que suele manejarse en decenas de millones de parámetros), por lo que debe interpretarse como una configuración reducida de juguete, no como un modelo con capacidad representacional útil. El repositorio no incluye pesos entrenados, ni tokenizador, ni pipeline declarado.

Por tanto, su relevancia ahora no es la de un modelo a evaluar por rendimiento, sino la de una plantilla reproducible para estudiar el acoplamiento entre atención de tipo Perceiver (con latentes) y objetivos contrastivos, y para validar infraestructura de carga/serialización en safetensors antes de escalar a un entrenamiento real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceiver (implementación propia en PyTorch) |
| Parámetros totales | 24.832 (dato real del checkpoint safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (arquitectura basada en latentes; no se declara ventana) |
| Tipos de cuantización | No disponible (solo se publica safetensors; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible (no se declara ningún idioma; el modelo no está entrenado) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

Metadatos adicionales del repositorio: etiquetas `pytorch`, `perceiver`, `contrastive`, `safetensors`, `region:us`; 0 descargas y 0 likes; creado y actualizado el 2026-10-17; pipeline no disponible.

## Arquitectura y entrenamiento

La model card describe una arquitectura Perceiver con atención estándar, fusión por *tensor fusion*, activación swish y normalización LayerNorm. El Perceiver original resuelve el coste cuadrático de la atención proyectando entradas de longitud variable sobre un conjunto pequeño de latentes, de modo que la atención se aplica entre latentes (y entre latentes y entrada) en lugar de sobre todos los pares de tokens. El repositorio añade un objetivo contrastivo, presumiblemente sobre las representaciones latentes agregadas, aunque la model card no detalla la formulación de la pérdida, la temperatura ni la estrategia de negativos.

No hay evidencia de entrenamiento: el autor afirma que `model.safetensors` es un "valid initialization checkpoint for smoke tests" y que no se presenta como un checkpoint entrenado con benchmarks. La receta por defecto registrada en `training_args.json` usa AdamW con scheduler coseno, pero se advierte de que son valores de partida del script y no prueba de una ejecución completada. No se documentan número de tokens, composición del dataset, ni fases de RLHF/DPO. La model card recomienda, para cualquier evaluación futura, usar un conjunto de validación específico de la tarea, reportar la métrica sobre al menos tres semillas e incluir una línea base de capacidad equivalente.

## Capacidades

- Generación de texto: no disponible. No hay tokenizador, cabecera de lenguaje ni pesos entrenados.
- Razonamiento, código y matemáticas: no disponible. Sin entrenamiento no hay capacidad emergente que evaluar.
- Aprendizaje contrastivo: el código implementa la infraestructura para entrenar con objetivo contrastivo sobre representaciones de un Perceiver; la utilidad es como base de experimentación, no como extractor preentrenado.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles. La fusión por *tensor fusion* sugiere que el diseñador previó entradas multimodales, pero no se aporta ningún peso ni evaluación que lo confirme.
- Ejecución de ejemplo: el repositorio incluye `predict.py` con un bloque `__main__` de prueba de humo (`python predict.py --help`).

## Casos de uso

- Prueba de humo de pipelines de despliegue: cargar los 24.832 parámetros en un servidor de inferencia (Triton, TorchServe, vLLM con adaptador propio) para verificar serialización, versionado y *health checks* antes de mover un modelo real. Es adecuado porque el checkpoint es válido y su tamaño es despreciable.
- Validación de integración con safetensors: comprobar que las herramientas internas de carga, inspección de tensores y conversión de formatos funcionan contra un checkpoint real de un modelo no estándar, que requiere adaptador explícito en lugar de `AutoModel`.
- Plantilla docente o de revisión de código: usar `predict.py`, `config.json` y `training_args.json` como referencia de cómo se estructura una implementación de Perceiver con activación swish, LayerNorm y receta AdamW + coseno en un curso o en una revisión interna.
- Base para ablaciones controladas: punto de partida para comparar variantes de fusión (tensor fusion frente a concatenación) o de función de pérdida contrastiva, manteniendo idéntica exposición de datos, presupuesto de ajuste y semillas, tal como recomienda el autor.
- Experimentos de escalado de capacidad: reutilizar la configuración como esqueleto y multiplicar anchura/profundidad de latentes para medir a partir de qué tamaño el objetivo contrastivo empieza a producir representaciones separables.
- Verificación de reproducibilidad de entornos: fijar versiones de PyTorch y registrar logs de entrenamiento contra este checkpoint inicial para auditar que una ejecución posterior es reproducible.
- Integración en CI/CD de investigación: ejecutar el smoke test en cada *pull request* del repositorio para detectar roturas en la construcción del modelo o en la firma de la función de pérdida sin incurrir en coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ninguna puntuación ("No benchmark score is claimed in this repository") y que el checkpoint es de inicialización, no entrenado. Cualquier cifra de MMLU, HumanEval, GSM8K o métricas de recuperación contrastiva sería inventada y no debe atribuirse a este repositorio.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos en fp32 (24.832 parámetros × 4 bytes ≈ 99 KB); en fp16 ≈ 50 KB. El repositorio completo ocupa 0,0 GB.
- GPU recomendadas: ninguna. El modelo cabe y se ejecuta en CPU sin dificultad; no hay justificación técnica para usar acelerador.
- GPU de consumo: cabe en cualquier GPU consumer (RTX 3060, RTX 4090) e incluso en entornos sin GPU; el cuello de botella sería el *overhead* de Python, no el cómputo.
- Opciones de despliegue: PyTorch nativo mediante `predict.py`; llama.cpp, Ollama y TGI no son aplicables porque no hay pesos en GGUF ni arquitectura soportada por esos motores; vLLM requeriría un adaptador de modelo personalizado, y no aportaría ventaja a esta escala.
- Latencia y throughput: no disponibles. Con este número de parámetros, los tiempos vendrían dominados por el arranque del intérprete y la inicialización de PyTorch, no por el cálculo.
- Advertencia de escalado: un Perceiver "base" real para entrenamiento contrastivo exigiría al menos una GPU con 16-80 GB de VRAM según resolución de entrada, número de latentes y tamaño de lote; este repositorio no sirve para estimar esos requisitos porque su configuración está reducida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crystallcl/dissertation-contrastive | 24.832 | No disponible | Sin benchmarks (checkpoint de inicialización) | BSD-3-Clause | HuggingFace, 0 descargas |
| Perceiver IO (DeepMind) | No disponible en la información proporcionada | No disponible | Resultados publicados en el paper original | No disponible en la información proporcionada | Referencia académica y pesos publicados por DeepMind |
| CLIP (OpenAI) | No disponible en la información proporcionada | No disponible | Métricas de zero-shot en ImageNet reportadas en el paper | No disponible en la información proporcionada | Pesos públicos |

La comparación relevante no es de rendimiento, sino de naturaleza del artefacto: los dos modelos citados son pesos entrenados con evaluación publicada, mientras que este repositorio es una implementación de referencia sin entrenamiento. Cualquier comparación numérica directa sería engañosa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones útiles ni salidas con sentido. Cualquier uso como modelo funcional es un error de interpretación.
- No se ha auditado robustez, equidad ni transferencia de dominio; el autor lo declara explícitamente.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de interpretación errónea por parte de quien lea el nombre del repositorio y asuma un modelo listo para producción.
- Inconsistencia de escala: 24.832 parámetros no encajan con una configuración Perceiver "base"; hay que tratar la etiqueta `base` de la model card como nominal, no como especificación de tamaño.
- No hay tokenizador, ni pipeline declarado, ni idiomas soportados: no es integrable con APIs genéricas como `AutoModel`/`pipeline` sin escribir un adaptador.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificación con atribución y conservación del aviso de copyright, pero la propia model card advierte de que deben revisarse por separado los términos de los datos de origen si se usa con datasets externos.
- Sin mantenimiento ni adopción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos se detecten y corrijan por la comunidad.
- Publicado con fecha 2026-10-17: verificar la coherencia temporal y de versiones de PyTorch antes de reproducir el entorno.

## Enlaces

- HuggingFace: https://huggingface.co/crystallcl/dissertation-contrastive
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
