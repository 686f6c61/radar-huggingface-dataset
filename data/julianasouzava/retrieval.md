# julianasouzava/retrieval

## Resumen

`julianasouzava/retrieval` es un repositorio experimental que implementa una arquitectura denominada **Dino** orientada a tareas de **recuperación (retrieval)**. Lo publica el usuario julianasouzava y se presenta explícitamente como un esqueleto de código pensado para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo, en una configuración deliberadamente reducida (*tiny*). No es un modelo entrenado ni un checkpoint de referencia: el archivo `model.safetensors` es una inicialización válida únicamente para *smoke tests*.

El modelo tiene **16.576 parámetros** (según el recuento real sobre `safetensors`), lo que lo sitúa en un orden de magnitud muy inferior al de cualquier modelo de recuperación en producción. La arquitectura combina atención *grouped query* (GQA), una fusión de tipo *concat mlp*, activación *swish* y normalización *scalenorm*. La recipe de experimento por defecto usa el optimizador **lion** con un *schedule* polinómico, aunque el propio autor advierte que son valores de arranque del script y no evidencia de un entrenamiento completado.

Su relevancia actual es, por tanto, exclusivamente como base de investigación reproducible: permite validar pipelines, medir ablaciones arquitectónicas y preparar una evaluación sobre **Flickr30k** antes de invertir en un entrenamiento real. La licencia es Apache 2.0, el formato de pesos es safetensors y no se reclama ninguna puntuación de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dino (implementación propia; atención *grouped query*, fusión *concat mlp*, activación *swish*, normalización *scalenorm*) |
| Parametros totales | 16.576 (aprox. 16,6 mil) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |
| Escala | tiny |
| Optimizador por defecto | lion con schedule polinómico |
| Tamano del repo | 0.0 GB |
| Estado del checkpoint | inicialización no entrenada (solo *smoke tests*) |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

La arquitectura es una implementación **Dino** de autor, no la arquitectura DINOv2 de Meta ni ninguna variante publicada por un tercero. Según `config.json`, usa atención *grouped query* (GQA), mecanismo de fusión *concat mlp*, función de activación *swish* y normalización *scalenorm*. La escala es *tiny*, con 16.576 parámetros totales. El repositorio incluye el archivo Python (`train.py`) como artefacto principal, además de `config.json` (ajustes de arquitectura), `training_args.json` (recipe por defecto) y `model.safetensors` (inicialización).

No hay información sobre datos de entrenamiento: no se indica número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El autor es explícito al señalar que el checkpoint **no ha sido entrenado ni auditado** para robustez, equidad o transferencia de dominio, y que los resultados de un futuro checkpoint entrenado deberán documentarse por separado de estos valores por defecto. La recipe por defecto (lion + schedule polinómico) son valores de partida del script y no evidencia de una ejecución completada. No se declara ninguna innovación técnica adicional más allá de las opciones arquitectónicas mencionadas.

## Capacidades

- Recuperación (retrieval) como tarea objetivo declarada, con evaluación sugerida sobre **Flickr30k**. Al tratarse de un checkpoint de inicialización no entrenado, no hay capacidades funcionales demostradas.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües (idiomas: no disponibles).
- No se documentan capacidades especiales (modo *thinking*, visión, audio, etc.).
- El repositorio está pensado como código de investigación para inspeccionar cambios de arquitectura y ejecutar *smoke tests*, no como modelo desplegable.

## Casos de uso

- Iteración de arquitecturas de recuperación: el repositorio permite modificar atención, fusión, activación o normalización y comprobar que el grafo computacional se construye correctamente antes de un entrenamiento completo. Es adecuado porque el coste de cómputo de un *tiny* de 16.576 parámetros es despreciable.
- *Smoke tests* e integración continua: cargar `model.safetensors` y verificar *shapes*, tipos y flujo de datos en un pipeline sin depender de un checkpoint pesado. Requiere escribir un adaptador explícito, ya que las APIs automáticas genéricas no cargan esta implementación *custom*.
- Reproducción de experimentos académicos: el autor propone evaluar sobre Flickr30k reportando la métrica de la tarea en al menos tres semillas e incluyendo una línea base de capacidad equivalente. Sirve como plantilla metodológica reproducible.
- Estudios de ablación: comparar variantes de atención *grouped query* frente a alternativas, o *concat mlp* frente a otras fusiones, manteniendo el mismo presupuesto de datos, *tuning* y semillas.
- Formación y transferencia de conocimiento: como ejemplo didáctico de implementación de un modelo de recuperación desde cero, con configuración versionada en JSON y recipe de entrenamiento separada.
- Preparación de evaluaciones antes de escalar: definir métricas, particiones de datos y registro de versiones de entorno (logs + versiones) que luego se reutilizarán al entrenar un modelo mayor.
- En todos los casos anteriores, cualquier uso funcional real exige **entrenar primero** el modelo y documentar los resultados por separado; el checkpoint actual no produce representaciones útiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica literalmente que no se reclama ninguna puntuación de benchmark y que el checkpoint es una inicialización para *smoke tests*, no un checkpoint entrenado. La única guía de evaluación ofrecida es cualitativa: usar Flickr30k, reportar la métrica de la tarea en al menos tres semillas e incluir una línea base de capacidad ajustada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 16.576 parámetros. En fp32 ocupa aproximadamente 66 KB; en fp16, unos 33 KB. Cabe holgadamente en cualquier memoria disponible.
- GPU recomendadas: no requiere GPU. Funciona en CPU. Cualquier GPU consumer (por ejemplo, una GTX serie 10 o superior) es más que suficiente, aunque innecesaria.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en dispositivos de borde tipo Raspberry Pi.
- Opciones de despliegue: al ser una implementación *custom*, no es compatible de forma directa con servidores de inferencia para LLM generativos (vLLM, TGI, llama.cpp, Ollama no aplican a este tipo de modelo de recuperación). El punto de entrada es `train.py`, y la carga requiere un adaptador explícito.
- Latencia y throughput estimados: no disponibles. La model card no aporta métricas de tiempo ni de rendimiento.

## Comparativa de modelos similares

No se dispone de datos verificables para una comparativa cuantitativa. El modelo es un esqueleto no entrenado de escala *tiny*, por lo que no es equiparable en rendimiento a modelos de recuperación entrenados. La tabla siguiente resume únicamente lo que puede afirmarse con seguridad.

| Modelo | Arquitectura | Parametros | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| julianasouzava/retrieval | Dino (custom, GQA + concat mlp) | 16.576 | No (inicialización) | apache-2.0 | HuggingFace |
| CLIP (referencia de la categoría) | Transformer dual imagen-texto | no disponible | Si | no disponible | no disponible |
| DINOv2 (referencia de la categoría) | ViT auto-supervisado | no disponible | Si | no disponible | no disponible |

La comparación con CLIP o DINOv2 es solo contextual, ya que este repositorio no compite en rendimiento: no aporta pesos entrenados ni métricas de recuperación.

## Limitaciones y advertencias

- El checkpoint **no ha sido entrenado**: no produce representaciones útiles para recuperación y no debe usarse en producción.
- No ha sido auditado para robustez, equidad (*fairness*) ni transferencia de dominio, según declara el propio autor.
- No se han publicado sesgos conocidos, pero al no existir entrenamiento documentado tampoco puede descartarse ninguno; simplemente no hay información.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que no es un modelo de generación de texto; el riesgo es de salidas no significativas por falta de entrenamiento.
- No hay información sobre longitud de contexto, idiomas soportados ni tipos de cuantización.
- Restricciones de licencia: el repositorio se publica bajo Apache 2.0, pero el autor advierte de revisar por separado los términos de los datos de origen cuando se use con datasets externos.
- Para producción: cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse de forma independiente a los valores por defecto aquí publicados; no mezclar ambos.
- El número de descargas y *likes* es 0, coherente con un repositorio recién creado y sin validación por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julianasouzava/retrieval
- Archivo de entrenamiento: `train.py` (incluido en el repositorio)
- Configuración de arquitectura: `config.json` (incluido en el repositorio)
- Recipe de experimento: `training_args.json` (incluido en el repositorio)
- Paper, blog, repositorio adicional o demo: no disponible
