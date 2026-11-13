# Gonzalezgac/perceiver-retrieval-ablation-2023

## Resumen

`perceiver-retrieval-ablation-2023` es un prototipo de investigación publicado por el usuario Gonzalezgac en Hugging Face. Se trata de una implementación de la arquitectura Perceiver orientada a tareas de *retrieval* (recuperación de información multimodal), distribuida como esqueleto reproducible para experimentos de ablación. El repositorio incluye el código de inferencia/entrenamiento, la configuración de arquitectura y un checkpoint de inicialización, pero no un modelo entrenado ni evaluado.

El propio autor es explícito en la model card: el checkpoint `model.safetensors` es una inicialización válida para *smoke tests*, no un modelo con pesos entrenados, y no se reclama ninguna puntuación de benchmark. El paquete safetensors declarado es de 16.576 parámetros, lo que confirma que se trata de una configuración a escala mínima ("small") pensada para validar el pipeline, no para producción.

Su relevancia es, por tanto, exclusivamente metodológica: sirve como plantilla para reproducir experimentos de ablación sobre Perceiver en retrieval (por ejemplo, sobre Flickr30k), fijando receta de entrenamiento (SGD con scheduler OneCycle), formato de ficheros y convenciones de configuración. No debe confundirse con un modelo listo para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención estándar, fusión por co-attention) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16 según implementación) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver con atención estándar y fusión mediante *co-attention*, activación GELU y normalización InstanceNorm. El Perceiver es un transformer con un cuello de botella de latentes que permite procesar entradas de longitud variable (texto, imágenes, audio) proyectándolas a un conjunto fijo de tokens latentes, lo que reduce el coste cuadrático de la atención respecto a la longitud de entrada. En este caso la escala declarada es "small" y el recuento real de parámetros (16.576) es extremadamente reducido, coherente con un prototipo de validación.

No hay información sobre volumen de datos de entrenamiento, composición del dataset, ni sobre fases de RLHF, DPO o ajuste supervisado. La receta por defecto incluida en el repositorio usa optimizador SGD con scheduler OneCycle, pero el autor advierte que son valores de partida del script y no evidencia de un entrenamiento completado. La evaluación propuesta en la model card sugiere usar Flickr30k, reportar la métrica de la tarea en al menos tres semillas y comparar contra un baseline de capacidad equivalente.

## Capacidades

- No se documentan capacidades funcionales: el checkpoint no está entrenado y no se ha evaluado en ninguna tarea.
- El código soporta un punto de entrada de inferencia y de entrenamiento (`inference.py`), útil para *smoke tests* del pipeline.
- No hay soporte declarado de tool calling, function calling ni razonamiento multi-paso.
- No hay capacidades multilingües declaradas (idiomas: no disponible).
- No hay modo *thinking*, visión, audio ni otras capacidades especiales documentadas.
- La implementación es custom, por lo que las APIs genéricas de carga automática (AutoModel, etc.) requieren un adaptador explícito.

## Casos de uso

- Reproducción de experimentos de ablación: el repositorio sirve como base para comparar variantes de Perceiver en retrieval manteniendo fija la receta de entrenamiento (SGD + OneCycle) y los formatos de configuración.
- Validación de pipelines de entrenamiento: permite comprobar que un *dataloader*, el guardado en safetensors y el bucle de entrenamiento funcionan antes de escalar a configuraciones mayores.
- Benchmarking metodológico sobre Flickr30k: la model card propone explícitamente esta evaluación con al menos tres semillas y un baseline de capacidad equivalente.
- Estudio de arquitecturas con cuello de botella de latentes: útil para investigadores que quieran medir el efecto del número de latentes o del tipo de co-attention en tareas de recuperación.
- Docencia y formación: ejemplo mínimo y ejecutable de cómo estructurar un repositorio de investigación (config, training_args, checkpoint de inicialización, script de inferencia).
- Punto de partida para *fine-tuning* controlado: sirve como inicialización reproducible para experimentos propios, siempre documentando los resultados por separado de los valores por defecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 16.576 parámetros el modelo cabe holgadamente en cualquier GPU, e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual; el cuello de botella es el pipeline, no el modelo.
- Opciones de despliegue: al ser una implementación custom, no se garantiza compatibilidad con vLLM, TGI, llama.cpp u Ollama; el propio autor indica que las APIs automáticas requieren un adaptador explícito. El despliegue natural es mediante `inference.py` con PyTorch.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| perceiver-retrieval-ablation-2023 | 16.576 | no disponible | no evaluado | apache-2.0 | Hugging Face |
| Perceiver IO (referencia de DeepMind) | ~100M–1B según variante | depende de latentes | benchmarks publicados en paper | Apache 2.0 / MIT según implementación | Hugging Face / GitHub |
| CLIP (para retrieval imagen-texto) | ~150M–400M | 77 tokens de texto | benchmarks publicados (Flickr30k, COCO) | MIT (versión abierta) | Hugging Face |

La comparación es únicamente orientativa a nivel arquitectónico: este repositorio no es un modelo entrenado y no compite en rendimiento con Perceiver IO ni con CLIP en tareas de retrieval.

## Limitaciones y advertencias

- El checkpoint no está entrenado: no produce resultados útiles en ninguna tarea.
- No se han auditado sesgos, robustez, equidad ni transferencia de dominio.
- Riesgo de alucinación: no aplica, al no ser un modelo de generación entrenado; el riesgo relevante es interpretar erróneamente el repositorio como un modelo funcional.
- Sin idiomas declarados ni ventana de contexto documentada.
- Licencia apache-2.0 permite uso comercial del código y pesos, pero los términos de los datasets externos (por ejemplo, Flickr30k) deben revisarse por separado.
- La implementación es custom: no es directamente compatible con APIs de carga automática sin adaptador.
- Cualquier resultado obtenido con este repositorio debe documentarse separadamente de los valores por defecto, tal y como advierte el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Gonzalezgac/perceiver-retrieval-ablation-2023
- Perceiver original (paper): https://arxiv.org/abs/2103.03206
- Perceiver IO (paper): https://arxiv.org/abs/2107.14795
- Dataset Flickr30k: https://shannon.cs.illinois.edu/DenotationGraph/
