# mumorales/deit-retrieval

## Resumen

DeiT for Retrieval es un prototipo de investigación publicado por el usuario mumorales en Hugging Face. Se trata de una implementación propia de un transformer DeiT (Data-efficient Image Transformer) en escala *tiny* orientada a tareas de *retrieval* (recuperación de información), con atención dispersa y fusión mediante co-atención. El repositorio se presenta explícitamente como un punto de partida experimental: el checkpoint incluido (`model.safetensors`) es una inicialización válida para *smoke tests*, no un modelo entrenado ni evaluado.

La relevancia del repositorio es, por tanto, documental y metodológica más que de rendimiento. Su model card describe la configuración de arquitectura (`config.json`), la receta de experimento por defecto (`training_args.json`, AdamW con scheduler exponencial) y los formatos de fichero esperados, pero no reclama ninguna métrica de benchmark. El autor indica que el contenido sirve para fijar valores por defecto y formatos, no como evidencia de resultados.

Con 33.088 parámetros según los metadatos de safetensors (cifra muy inferior a los ~5,7 M habituales de un DeiT-tiny estándar), se trata de un artefacto de tamaño mínimo, pensado para pruebas de integración, validación de *pipelines* de carga y diseño de experimentos comparativos reproducibles. La licencia es MIT y el formato de pesos es safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (Data-efficient Image Transformer) |
| Parametros totales | 33.088 (según metadatos de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (también incluye `config.json`, `training_args.json`, `predict.py`) |

Detalles adicionales declarados en la model card: escala *tiny*, atención dispersa (*sparse*), fusión por co-atención, activación GELU y normalización GroupNorm. Tamaño del repositorio: 0,0 GB. Descargas y *likes*: 0.

## Arquitectura y entrenamiento

La arquitectura es un DeiT en configuración *tiny*, con dos desviaciones notables respecto al DeiT canónico: atención dispersa en lugar de atención densa completa, y GroupNorm en lugar de LayerNorm. Incorpora además un mecanismo de fusión por co-atención, lo que sugiere un diseño orientado a combinar dos modalidades o dos ramas de representación, aunque la model card no especifica cuáles. La función de activación es GELU.

En cuanto al entrenamiento, el repositorio únicamente documenta una receta por defecto: optimizador AdamW con scheduler de tipo exponencial. El autor insiste en que estos son valores de partida del script y no evidencia de una ejecución completada. No se declara número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El checkpoint `model.safetensors` se describe explícitamente como una inicialización no entrenada y no auditada en robustez, equidad o transferencia de dominio. La model card recomienda, para una evaluación significativa, exponer todos los baselines a los mismos datos, presupuesto de *tuning* y semillas aleatorias, y propone Flickr30k como primer conjunto de evaluación.

## Capacidades

- Recuperación de información (*retrieval*): objetivo declarado del prototipo. No se especifica si es recuperación unimodal, texto-imagen o de otro tipo.
- Fusión multimodal potencial: la co-atención es un mecanismo típico de modelos que cruzan dos ramas de representación (por ejemplo, imagen y texto), pero la model card no confirma el escenario concreto.
- Generación de texto: no disponible; el prototipo no declara capacidad generativa.
- Razonamiento, matemáticas y código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (la ficha de Hugging Face no lista idiomas).
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.

Advertencia importante: al ser un checkpoint de inicialización sin entrenar, ninguna de estas capacidades está verificada empíricamente. Lo anterior describe la intención de diseño, no un comportamiento medido.

## Casos de uso

- *Smoke testing* de pipelines de carga: el checkpoint permite validar que un *loader* propio (adaptador explícito sobre `predict.py`, ya que no funciona con APIs de carga automática genéricas) lee correctamente pesos, `config.json` y `training_args.json`.
- Reproducción de experimentos de investigación: sirve como punto de partida para entrenar un DeiT-tiny orientado a *retrieval* con una receta controlada (AdamW, scheduler exponencial) y compararlo con baselines de igual capacidad.
- Evaluación metodológica en Flickr30k: la propia model card propone usar Flickr30k reportando la métrica de tarea sobre al menos tres semillas, lo que convierte al repositorio en una plantilla de protocolo experimental.
- Docencia y formación: al ser un modelo de 33.088 parámetros, es adecuado para explicar el flujo completo de definición de arquitectura, configuración y checkpoint en PyTorch sin requerir hardware especializado.
- Pruebas de integración en CI/CD: su tamaño (inferior a 1 MB en fp32) permite ejecutarlo en cada *commit* para verificar que el código de inferencia no se rompe, algo inviable con modelos grandes.
- Validación de variantes de atención dispersa y GroupNorm: útil para experimentar con estas dos modificaciones arquitectónicas frente a atención densa y LayerNorm en un entorno de coste computacional despreciable.
- Base para *fine-tuning* sobre dominios concretos: partiendo de la inicialización, un equipo puede adaptar el modelo a su corpus de recuperación, siempre documentando por separado los resultados del checkpoint entrenado respecto a los valores por defecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación y que `model.safetensors` no es un checkpoint entrenado de referencia. Tampoco se han encontrado datos de MMLU, HumanEval, GSM8K, Recall@k ni métricas equivalentes de recuperación en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. Con 33.088 parámetros, los pesos ocupan aproximadamente 0,13 MB en fp32 y unos 0,07 MB en fp16; el consumo real lo determinan las activaciones, no el modelo.
- GPU recomendadas: cualquier GPU, incluida una iGPU integrada. También es viable la ejecución íntegra en CPU.
- Cabe en GPU de consumo: sí, en cualquier modelo (GTX serie 10, RTX 20/30/40, etc.), con un uso de memoria prácticamente nulo.
- Opciones de despliegue: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito; el propio autor señala que debe inspeccionarse el bloque `__main__` de `predict.py`. No hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama o TGI, que además no están orientados a este tipo de modelo de *retrieval*.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. La model card no incluye baseline de igual capacidad ni referencias a otros checkpoints, y la búsqueda web realizada no devolvió resultados relevantes.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mumorales/deit-retrieval | 33.088 (metadatos safetensors) | no disponible | no disponible (sin benchmark declarado) | MIT | Hugging Face, repositorio público |
| Alternativas de *retrieval* (por ejemplo codificadores duales tipo CLIP) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| DeiT-tiny estándar como referencia arquitectónica | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

Conviene señalar que la cifra de 33.088 parámetros es muy inferior a la de un DeiT-tiny convencional, lo que refuerza la lectura del repositorio como artefacto de prueba y no como modelo funcional listo para producción.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Cualquier uso en producción daría resultados sin significado, ya que los pesos son una inicialización aleatoria o cuasi aleatoria.
- No ha sido auditado en robustez, equidad (*fairness*) ni transferencia de dominio, según reconoce el propio autor.
- No se declaran sesgos conocidos, pero al no existir datos de entrenamiento documentados no es posible evaluarlos.
- Riesgo de alucinación: no evaluable en el estado actual; el modelo no es generativo en ningún caso declarado.
- Idiomas soportados: no disponible. La ficha de Hugging Face no lista ningún idioma.
- Longitud de contexto: no disponible; condiciona cualquier uso real de recuperación sobre documentos largos.
- Restricciones de licencia: MIT, permisiva y compatible con uso comercial, pero el autor recomienda revisar por separado los términos de los datasets externos que se utilicen junto al repositorio.
- Implementación personalizada: requiere un adaptador explícito para cargarse con APIs automáticas; no es un modelo *plug and play*.
- Metadatos anómalos: las fechas de creación y actualización registradas (2026-09-14) son posteriores a la fecha habitual de consulta, lo que sugiere un error o una convención de metadatos poco fiable.
- Sin pipeline declarado en Hugging Face y sin métrica de tarea publicada, no es posible situarlo frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mumorales/deit-retrieval
- Repositorio del autor (mumorales): no disponible
- Paper de DeiT: no disponible en la información proporcionada
- Blogs, demos o notebooks asociados: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos no guardaban relación con el tema).
