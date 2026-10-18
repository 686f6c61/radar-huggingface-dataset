# fedorovivan/beit-experiment

## Resumen

`fedorovivan/beit-experiment` es un repositorio experimental que contiene una implementación propia y compacta de una arquitectura tipo BEiT (BERT Pre-Training of Image Transformers) orientada a clasificación de imágenes. Lo publica el usuario fedorovivan en Hugging Face y se distribuye en una configuración denominada "nano", pensada explícitamente por el autor para revisión de código, pruebas de humo (smoke tests) y experimentos controlados de pequeña escala, no como un modelo preentrenado listo para producción.

El checkpoint es una inicialización válida, no un modelo entrenado: la model card indica que no se ha completado ningún entrenamiento ni se reclama ninguna métrica de benchmark. El recuento real de parámetros del fichero safetensors es de 24.832, un orden de magnitud varias veces inferior al de cualquier ViT/BEiT operativo, lo que lo sitúa en la categoría de artefacto didáctico o de andamiaje para pipelines.

Su relevancia es, por tanto, la de una plantilla reproducible: fija decisiones de arquitectura poco habituales (atención dilatada, fusión por cross attention, activación mish, normalización instancenorm) y un recetario de entrenamiento por defecto (RMSprop con scheduler coseno) que sirven como punto de partida para ablaciones y comparaciones con baselines de capacidad equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT (implementación propia en PyTorch), escala "nano"; atención dilatada, fusión por cross attention |
| Parametros totales | 24.832 (dato real del fichero safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; modelo de visión para clasificación, sin ventana de contexto textual |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint en safetensors; no se documenta cuantización) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), junto con `pipeline.py`, `config.json` y `training_args.json` |
| Activación | mish |
| Normalización | instancenorm |
| Optimizador por defecto | RMSprop con scheduler coseno (valores de partida del script, no evidencia de un entrenamiento completado) |
| Resolución de entrada | no disponible |
| Número de clases | no disponible en la información proporcionada (definido en `config.json`) |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema BEiT (transformer aplicado a parches de imagen), pero con un bloque de decisiones propio: atención dilatada en lugar de atención densa estándar, un mecanismo de fusión basado en cross attention, activación mish y normalización por instancias. La escala "nano" reduce el número de parámetros hasta 24.832, lo que permite ejecutar el forward pass completo en CPU en milisegundos y usar el repositorio como banco de pruebas de cambios arquitectónicos sin coste de cómputo apreciable.

No hay evidencia de entrenamiento: el autor describe `model.safetensors` como un checkpoint de inicialización válido para smoke tests, no como un checkpoint evaluado. No se documentan volúmenes de tokens, composición del dataset, resolución de las imágenes, ni fases de RLHF/DPO (habitualmente inexistentes en un clasificador visual). El recetario incluido en `training_args.json` (RMSprop + schedule coseno) son valores de arranque del script; la propia model card advierte que, para una evaluación significativa, hay que entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

Como implementación personalizada, no es cargable con las APIs automáticas genéricas de Hugging Face (`AutoModel`); requiere un adaptador explícito o el uso directo de `pipeline.py`.

## Capacidades

- Propagación hacia delante de un clasificador de imágenes tipo BEiT con salida de logits por clase (el número de clases se define en `config.json` y no está documentado en la información disponible).
- Punto de partida estructural para experimentos de arquitectura: atención dilatada, cross attention de fusión, mish e instancenorm.
- Extracción potencial de representaciones intermedias como backbone, siempre que se entrene previamente; el checkpoint distribuido no aporta features útiles por sí mismo.
- Ejecución de pruebas de humo del pipeline de datos y del bucle de entrenamiento (carga de checkpoint, forward, cálculo de pérdida, backward).
- Compatibilidad con el ecosistema PyTorch para exportación o instrumentación, aunque no se documenta ningún formato de exportación.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo: es un modelo visual de clasificación.
- Sin modo "thinking", visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Revisión de código y auditoría de implementaciones BEiT: el repositorio incluye el modelo y un punto de entrada ejecutable (`pipeline.py --help`), lo que permite leer y contrastar cada decisión arquitectónica con el paper original sin cargar pesos de gran tamaño.
- Smoke test en CI/CD de pipelines de visión: al ocupar unas decenas de kilobytes en fp32, el forward pass se ejecuta en segundos en cualquier runner, sirviendo para verificar que los cambios en el cargador de datos o en el bucle de entrenamiento no rompen el grafo.
- Ablaciones controladas de arquitectura: comparar atención dilatada frente a atención densa, mish frente a GELU o instancenorm frente a layernorm con un coste de cómputo mínimo y semillas fijas.
- Desarrollo de arneses de evaluación: usar el checkpoint como sujeto de prueba para construir el script que reportará la métrica de la tarea sobre un split etiquetado y al menos tres semillas, tal como recomienda el autor.
- Material docente: ejemplo mínimo de transformer visual para explicar parcheado, atención y cabeza de clasificación sin la sobrecarga de un modelo de 86 M de parámetros.
- Pruebas de integración de serving: validar el contrato de entrada/salida de un microservicio de clasificación (formato de tensor, dimensiones, dtype) antes de sustituir el checkpoint por uno entrenado.
- Base para comparaciones de capacidad equiparable: emparejar este modelo con un baseline de parámetros similares para aislar el efecto de la arquitectura frente al de la escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado, por lo que cualquier métrica (ImageNet top-1, precisión/recall por clase, F1) carecería de sentido hasta que se complete un entrenamiento documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 MB en fp32 (24.832 parámetros × 4 bytes ≈ 97 KB) y unos 50 KB en fp16, más las activaciones, que dependen de la resolución de entrada (no documentada).
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU, incluida una GTX 1050 o una iGPU, y funciona en CPU sin problema.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales y en la mayoría de sistemas embebidos con PyTorch disponible.
- Opciones de despliegue: ejecución directa con PyTorch mediante `pipeline.py`; vLLM, TGI, llama.cpp u Ollama no aplican (no es un modelo de lenguaje). La exportación a TorchScript u ONNX es técnicamente viable pero no está documentada en la información disponible.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, se espera latencia de milisegundos en CPU para lotes pequeños, pero no hay cifras publicadas que se puedan citar.

## Comparativa con modelos similares

Los datos de los modelos comparativos no forman parte de la información proporcionada y se incluyen únicamente como referencia externa aproximada; deben verificarse en sus respectivas model cards antes de citarlos.

| Modelo | Parámetros | Entrada / contexto | Licencia | Estado del checkpoint |
|---|---|---|---|---|
| `fedorovivan/beit-experiment` | 24.832 | no disponible (imagen, resolución no documentada) | apache-2.0 | Inicialización, sin entrenar |
| BEiT-base (referencia externa, Microsoft) | ~86 M (aprox., referencia externa) | imagen 224×224 con parches 16×16 (referencia externa) | licencia del repositorio original, consultar | Preentrenado y ajustado, con métricas publicadas |
| DeiT-tiny (referencia externa) | ~5,7 M (aprox., referencia externa) | imagen 224×224 (referencia externa) | licencia del repositorio original, consultar | Preentrenado en ImageNet |
| ViT-base (referencia externa) | ~86 M (aprox., referencia externa) | imagen 224×224 con parches 16×16 (referencia externa) | licencia del repositorio original, consultar | Preentrenado, versiones supervisadas y auto-supervisadas |

La comparación relevante no es de rendimiento (no hay métricas de este repositorio) sino de naturaleza del artefacto: frente a los BEiT/ViT/DeiT publicados, este repositorio es entre dos y tres órdenes de magnitud más pequeño y no incorpora pesos entrenados.

## Limitaciones y advertencias

- El checkpoint no está entrenado: los logits que produce son esencialmente aleatorios y no deben usarse para ninguna decisión real.
- No existen auditorías de robustez, equidad ni transferencia de dominio; el autor lo indica de forma explícita.
- No hay métricas publicadas ni comparación con baselines de capacidad equivalente, por lo que no se puede afirmar nada sobre su calidad.
- Al ser una implementación personalizada, no carga con `AutoModel` ni con `pipeline` estándar de Hugging Face sin un adaptador explícito; tampoco se documenta processor/tokenizer de imagen.
- Falta documentación de detalles operativos críticos: resolución de entrada, normalización de píxeles, número de clases y esquema de parcheado.
- No se especifican sesgos conocidos porque no hay datos de entrenamiento ni evaluación; cualquier uso con datos reales heredará los sesgos del dataset que se utilice.
- Licencia apache-2.0: permite uso comercial y modificación del código y de los pesos, pero los términos de los datos externos con los que se entrene deben revisarse por separado, tal como advierte la model card.
- El tamaño del repositorio figura como 0.0 GB, coherente con un artefacto de inicialización; no esperar pesos con capacidad predictiva.
- Riesgo de interpretación errónea: el nombre "beit-experiment" y la etiqueta `classification` pueden llevar a confundirlo con un clasificador funcional; no lo es.

## Enlaces

- Hugging Face: https://huggingface.co/fedorovivan/beit-experiment
- Referencia externa del artículo original de BEiT (no incluida en la información proporcionada): https://arxiv.org/abs/2106.08254
- Otros enlaces (papers del autor, blogs, repositorios, demos): no disponibles en la información proporcionada.
