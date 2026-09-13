# jerry-vo/intern-retrieval

## Resumen

`jerry-vo/intern-retrieval` es un prototipo de investigación basado en la arquitectura CLIP, orientado a tareas de recuperación (retrieval) multimodal. Lo publica el usuario jerry-vo en HuggingFace bajo licencia MIT. No se trata de un modelo entrenado ni evaluado: el propio autor lo describe como una implementación de escala «nano» que documenta valores por defecto y formatos de fichero, sin presentar cifras de rendimiento verificadas. El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, no un modelo con pesos entrenados.

La relevancia de este repositorio es fundamentalmente metodológica: sirve como andamiaje reproducible (script de entrenamiento/inferencia, `config.json` y `training_args.json`) para montar experimentos de retrieval con una receta declarada (optimizador Lion con scheduler coseno) y una línea base de capacidad equivalente. Es decir, su valor está en facilitar una comparación justa si el usuario entrena el modelo por su cuenta con los mismos datos, presupuesto de ajuste y semillas aleatorias.

A nivel técnico se declara una arquitectura CLIP de atención lineal, fusión mediante cross attention, activación ReLU y normalización InstanceNorm, lo que se aparta de las convenciones habituales de CLIP (atención softmax, GELU y LayerNorm). El repositorio ocupa 0,0 GB, tiene 0 descargas y 0 «likes» en el momento de la consulta, y no declara idiomas soportados ni pipeline de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP (según la model card); atención lineal, fusión por cross attention, activación ReLU, normalización InstanceNorm |
| Parámetros totales | 33.088 (dato reportado por safetensors); escala declarada «nano» |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se distribuye el checkpoint en safetensors; no se publican versiones GGUF, GPTQ, AWQ ni similares) |
| Idiomas soportados | No disponibles (no declarados en la model card ni en los tags) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización, no entrenado) |

## Arquitectura y entrenamiento

La model card declara una arquitectura CLIP de escala «nano» con atención lineal en lugar de la atención softmax habitual, fusión entre modalidades mediante cross attention, función de activación ReLU y normalización InstanceNorm. Esta combinación difiere de las implementaciones CLIP de referencia y sugiere una reescritura propia del bloque, no una exportación de `open_clip` ni del CLIP original de OpenAI. El repositorio incluye `config.json`, que registra los ajustes de arquitectura generados, y `training_args.json`, que recoge la receta de experimento por defecto.

No se documenta ningún entrenamiento completado: el autor indica explícitamente que la receta incluida (optimizador Lion con scheduler coseno) son valores de partida del script y no evidencia de una ejecución finalizada. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La guía de evaluación sugerida por el autor propone usar Flickr30k, reportar la métrica de la tarea sobre al menos tres semillas e incluir una línea base de capacidad equivalente, conservando los logs de entrenamiento y las versiones del entorno. El checkpoint `model.safetensors` se presenta como inicialización para pruebas de humo, y el autor advierte que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de poder usarse.

## Capacidades

- Recuperación multimodal texto-imagen: el modelo está diseñado para tareas de retrieval, con fusión por cross attention entre las dos modalidades.
- Búsqueda semántica: al ser una arquitectura de tipo CLIP, el espacio de embeddings es el mecanismo previsto para ordenar resultados por similitud.
- Punto de partida para experimentación: `predict.py` incluye un ejemplo ejecutable y un bloque `__main__` con una prueba de humo generada.
- Entrenamiento reproducible con receta declarada: optimizador Lion y scheduler coseno configurados en el script.
- Generación de texto: no aplica, no es un modelo de lenguaje.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no declaradas.
- Capacidades especiales (modo thinking, visión-a-texto generativo, audio): no disponibles.

Nota importante: al tratarse de un checkpoint de inicialización sin entrenar, ninguna de las capacidades anteriores está verificada empíricamente; deben entenderse como el comportamiento previsto por el diseño del código, no como una funcionalidad validada.

## Casos de uso

- Pruebas de humo de pipelines de retrieval: el checkpoint y `predict.py` permiten verificar que la carga de pesos, el preprocesado y el flujo de inferencia funcionan de extremo a extremo antes de invertir cómputo en un entrenamiento real.
- Base para un fine-tuning propio sobre Flickr30k: el autor propone explícitamente este conjunto y exige reportar la métrica sobre al menos tres semillas con una línea base de capacidad equivalente, lo que convierte el repositorio en una plantilla de protocolo experimental.
- Desarrollo de scripts de entrenamiento personalizados: al ser una implementación propia con `config.json` y `training_args.json`, resulta útil como esqueleto para experimentar con atención lineal y normalización InstanceNorm en lugar de las variantes estándar.
- Evaluación comparativa de recetas de optimización: el uso de Lion con scheduler coseno como valor por defecto permite montar experimentos controlados frente a AdamW u otras alternativas manteniendo constante el resto del pipeline.
- Docencia y formación en arquitecturas multimodales: el tamaño «nano» permite ejecutar el modelo completo en CPU y en portátiles, lo que facilita explicar el funcionamiento interno de un CLIP sin depender de GPU.
- Integración en un banco de pruebas de motores de búsqueda visual: sirve para validar el contrato de entrada/salida (embeddings, formato de salida, índice vectorial) de un sistema de recuperación antes de sustituir el modelo por uno entrenado.
- Auditoría de código de modelos publicados: al no reclamar métricas, es un caso útil para revisar cómo se documentan configuraciones y recetas sin inflar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica de forma explícita que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint incluido no está entrenado ni auditado en robustez, equidad o transferencia de dominio. Cualquier resultado de un futuro checkpoint entrenado deberá documentarse por separado de los valores por defecto aquí publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión habitual; con 33.088 parámetros, un checkpoint en fp32 ocupa aproximadamente 132 KB, por lo que el cuello de botella real es el preprocesado de imágenes y el framework (PyTorch), no los pesos.
- GPU recomendadas: cualquiera con soporte CUDA es suficiente; también funciona sin GPU. No se requiere A100, H100 ni RTX 4090 para la inferencia de este checkpoint.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en CPU, Raspberry Pi o entornos sin acelerador.
- Opciones de despliegue: al ser una implementación personalizada, las APIs genéricas de carga automática necesitan un adaptador explícito; el punto de entrada documentado es `predict.py`. No se declara soporte para vLLM, TGI, llama.cpp u Ollama, y por la naturaleza del modelo (no generativo, no es un LLM) esas herramientas no son el cauce natural de despliegue.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Los candidatos naturales de la misma categoría serían CLIP ViT-B/32 de OpenAI, SigLIP y los modelos disponibles a través de `open_clip`; sin embargo, sus cifras de parámetros, contexto, rendimiento y disponibilidad no forman parte de la documentación consultada, por lo que no se incluyen aquí para no introducir datos no verificados.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad pública | Rendimiento en retrieval |
|---|---|---|---|---|---|
| jerry-vo/intern-retrieval | 33.088 (escala nano) | No disponible | MIT | HuggingFace, 0 descargas | No disponible (checkpoint sin entrenar) |
| CLIP ViT-B/32 | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| SigLIP | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| Modelos de open_clip | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

Para una comparación con sentido, el propio autor exige que todas las líneas base se entrenen con la misma exposición de datos, el mismo presupuesto de ajuste y las mismas semillas aleatorias.

## Limitaciones y advertencias

- El checkpoint no está entrenado: `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo con pesos ajustados ni un artefacto listo para producción.
- No está auditado en robustez, equidad ni transferencia de dominio, tal y como advierte el autor de forma explícita.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero sí existe riesgo de similitudes sin sentido en el espacio de embeddings al carecer de entrenamiento.
- Sesgos conocidos: no disponibles; cualquier sesgo dependerá de los datos con los que se entrene, y el autor recomienda revisar por separado los términos de los datos de origen cuando se usen datasets externos.
- Limitaciones de contexto e idioma: no se declara ventana de contexto ni cobertura idiomática, por lo que no puede asumirse soporte multilingüe.
- Compatibilidad de carga: al ser una implementación personalizada, las APIs automáticas de HuggingFace necesitan un adaptador explícito; no se puede cargar como un CLIP estándar sin más.
- Consideraciones de licencia: el código y los pesos se publican bajo MIT, lo que permite uso comercial del repositorio, pero la licencia no cubre los datasets externos con los que se entrene ni los términos de los modelos de referencia que se usen como línea base.
- Advertencia para producción: no debe desplegarse como sistema de búsqueda real sin un entrenamiento y una evaluación previos; las cifras de este repositorio no respaldan ninguna afirmación de calidad.

## Enlaces

- HuggingFace: https://huggingface.co/jerry-vo/intern-retrieval
- La búsqueda web realizada no ha devuelto resultados relevantes sobre el modelo: los enlaces obtenidos corresponden a listados de hoteles y no guardan relación con `jerry-vo/intern-retrieval`. No se han encontrado papers, blogs, repositorios ni demos asociados en la información disponible.
