# doyun-cho/coca-retrieval

## Resumen

`doyun-cho/coca-retrieval` es un repositorio experimental publicado en HuggingFace que implementa una arquitectura denominada **Coca** orientada a tareas de *retrieval* (recuperación multimodal). No se trata de un modelo entrenado, sino de un esqueleto de código con un checkpoint de inicialización válido únicamente para *smoke tests*: la propia model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que los pesos no han sido entrenados ni auditados.

El repositorio incluye `eval.py` como artefacto principal, junto con `config.json` (configuración de arquitectura), `training_args.json` (receta de experimento por defecto) y `model.safetensors` (checkpoint de inicialización). La arquitectura declarada combina atención dilatada, fusión con compuertas (*gated fusion*), activación ReLU y normalización RMSNorm.

El dato más relevante para evaluar su utilidad práctica es la discrepancia entre la etiqueta de escala declarada en la model card (`huge`) y el recuento real de parámetros del checkpoint (`24.832`, es decir, unos 24,8 mil parámetros). Esa cifra es coherente con un tensor de inicialización trivial, no con un modelo de escala *huge*. El interés del repositorio es, por tanto, documental y de andamiaje para experimentos, no de inferencia real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (atención dilatada, gated fusion, ReLU, RMSNorm) |
| Parametros totales | 24.832 (según `model.safetensors`; la model card declara escala "huge", no coincidente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

Otros metadatos del repositorio: identificador `doyun-cho/coca-retrieval`, autor `doyun-cho`, 0 descargas, 0 likes, tamaño del repo 0.0 GB, creado y actualizado el 2026-10-17. No se declara pipeline de HuggingFace.

## Arquitectura y entrenamiento

La arquitectura es una implementación propia etiquetada como *Coca*, con atención dilatada y un módulo de fusión con compuertas. La configuración por defecto registrada en `training_args.json` emplea el optimizador RMSprop con un *schedule* exponencial. La model card advierte que esos valores son puntos de partida del script y no evidencia de una ejecución completada, y recomienda que cualquier comparación con líneas base se haga con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

No se especifican datos de entrenamiento: no hay número de tokens, composición del dataset, ni referencias a RLHF, DPO o ajuste por instrucciones. El checkpoint `model.safetensors` se describe como inicialización válida para *smoke tests*, no como pesos entrenados. Tampoco se documenta el tokenizador ni el procesador de imagen, lo que impide reproducir el preprocesado a partir del repositorio. Al ser una implementación personalizada, las APIs genéricas de carga automática (`AutoModel`, `pipeline`) requieren un adaptador explícito antes de poder usarse.

## Capacidades

- No hay capacidades verificadas: el checkpoint no ha sido entrenado, por lo que no produce representaciones ni recuperaciones con significado.
- El código está orientado a *retrieval*, presumiblemente multimodal (imagen-texto), aunque la model card no detalla la modalidad de entrada ni la función de pérdida.
- No se declara soporte de *tool calling* ni de *function calling*.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingüe; el campo de idiomas del repositorio está vacío.
- No se declara modo *thinking*, visión operativa, audio ni ninguna capacidad especial adicional.
- Lo que sí ofrece el repositorio es un punto de entrada ejecutable (`python eval.py --help`) y un bloque `__main__` con un ejemplo de *smoke test* generado.

## Casos de uso

- Pruebas de humo de *pipeline*: cargar `model.safetensors` para verificar que el *forward pass* y las formas de los tensores son correctas antes de lanzar un entrenamiento real.
- Estudio de arquitectura: inspeccionar la implementación de atención dilatada y *gated fusion* en `eval.py` como material de referencia o docencia.
- Andamiaje de experimentos de *retrieval*: usar `training_args.json` como plantilla de receta (RMSprop, *schedule* exponencial) y sustituir los valores por los del experimento propio.
- Validación de *harness* de evaluación: montar el pipeline de métricas sobre Flickr30k, tal como sugiere la model card, antes de conectar un checkpoint entrenado.
- Pruebas de integración de *software*: verificar el adaptador de carga personalizado que exige el repositorio en un entorno con versiones fijadas de PyTorch.
- Comparación controlada de líneas base: usar el esqueleto para igualar exposición de datos, presupuesto de ajuste y semillas entre alternativas, reportando la métrica de tarea en al menos tres semillas.
- Auditoría de reproducibilidad: conservar los *logs* de entrenamiento y las versiones de entorno junto a cualquier resultado publicado, según la propia guía del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card declara de forma explícita que no se reclama ninguna puntuación y que el checkpoint incluido no es un modelo entrenado. Como orientación de evaluación, el autor propone Flickr30k con la métrica de la tarea promediada sobre al menos tres semillas y una línea base de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada: despreciable. Con 24.832 parámetros, los pesos ocupan aproximadamente 0,1 MB en FP32.
- GPU: no es necesaria; el checkpoint de inicialización se ejecuta en CPU sin problemas.
- GPU de consumo: cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Despliegue: no hay soporte conocido para vLLM, TGI, llama.cpp u Ollama, ya que la arquitectura es personalizada y requiere código propio (`eval.py`) más un adaptador de carga.
- Latencia y throughput: no disponibles; no tiene sentido medirlos sobre un checkpoint sin entrenar.
- Advertencia: si en el futuro se publicara un checkpoint realmente de escala `huge`, los requisitos de hardware serían otros y no están documentados en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en retrieval | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| coca-retrieval | 24.832 (checkpoint de inicialización) | no disponible | no evaluado | BSD-3-Clause | sí, sin entrenar |
| CLIP ViT-B/32 (OpenAI) | ~151 M | 77 tokens de texto | publicado por el autor original | MIT | sí, entrenado |
| CoCa (Google Research) | no disponible públicamente | no disponible | publicado en paper | no disponible | no, sin pesos abiertos |
| BLIP-2 | no disponible en la informacion consultada | no disponible | publicado en paper | no disponible | parcial |

La comparación significativa es arquitectónica: este repositorio toma el nombre y la inspiración de la familia CoCa (captioning + contrastive), pero no reproduce sus resultados ni su escala. Frente a CLIP, la diferencia práctica es total: CLIP ofrece pesos entrenados y cargables con APIs estándar, mientras que aquí solo hay código y un tensor de inicialización.

## Limitaciones y advertencias

- El checkpoint no está entrenado: cualquier salida o *embedding* que produzca carece de significado. No debe usarse en producción ni en evaluación de calidad.
- No ha sido auditado para robustez, equidad o transferencia de dominio, tal como reconoce el autor.
- Discrepancia de escala: la model card declara `huge`, pero el recuento real es de 24.832 parámetros. Cualquier expectativa basada en la etiqueta sería errónea.
- Ausencia de benchmarks: no hay métricas verificables de recuperación, ni siquiera preliminares.
- Falta de documentación sobre tokenizador, preprocesado de imagen, función de pérdida y formato de pares positivos/negativos, lo que impide reproducir el pipeline completo solo con el repositorio.
- Requiere un adaptador de carga explícito: las APIs automáticas de HuggingFace no funcionan de serie con esta implementación.
- Idiomas no declarados: se desconoce el soporte multilingüe incluso en el diseño previsto.
- Licencia BSD-3-Clause: permisiva y compatible con uso comercial del código, pero el autor advierte de revisar por separado los términos de los datos de origen si se usan datasets externos (por ejemplo, Flickr30k tiene sus propias condiciones).
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de interpretar como válidas representaciones aleatorias si no se comprueba que el checkpoint es de inicialización.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- [HuggingFace: doyun-cho/coca-retrieval](https://huggingface.co/doyun-cho/coca-retrieval)
- No se han encontrado papers, blogs, repositorios de código ni demos asociados en la búsqueda web realizada (los resultados devueltos no guardaban relación con el modelo).
