# rmorozov/hybrid-retrieval

## Resumen

rmorozov/hybrid-retrieval es un repositorio de HuggingFace que contiene una implementación compacta y personalizada en PyTorch de un modelo denominado "Hybrid" orientado a tareas de recuperación de información (retrieval). Lo publica el usuario rmorozov, vinculado según las fuentes consultadas al trabajo de IA aplicada de Denis Morozov (canales de recuperación, inteligencia documental y enriquecimiento de datos). El repositorio incluye el script `model.py`, un `config.json` con la configuración de arquitectura generada, un `training_args.json` con la receta de experimento por defecto y un `model.safetensors` que el propio autor describe como checkpoint de inicialización válido para pruebas de humo, no como un modelo entrenado.

La relevancia de esta ficha es acotada y conviene dejarla clara desde el principio: no se trata de un modelo preentrenado listo para producción, sino de un esqueleto de código para revisión, pruebas de integración y experimentos controlados de pequeño tamaño. La configuración declarada es la variante "xlarge", con atención de tipo grouped query, fusión de baja cardinalidad (low rank), activación swish y normalización por batchnorm. El recuento real de parámetros del checkpoint en safetensors es de 24.832, un orden de magnitud propio de un modelo de juguete o de una prueba de arquitectura, no de un sistema de recuperación desplegable.

El repositorio no declara ninguna puntuación de benchmark, no especifica idiomas soportados y no publica datos de entrenamiento. La licencia es BSD-3-Clause. Por tanto, esta ficha debe leerse como documentación de un artefacto experimental reproducible, útil para quien quiera inspeccionar o reutilizar la implementación, y no como evaluación de un modelo con capacidades demostradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid (implementación personalizada en PyTorch); atención grouped query, fusión low rank, activación swish, normalización batchnorm |
| Parametros totales | 24.832 (según `model.safetensors`) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |
| Escala declarada | xlarge (etiqueta de configuración del autor) |
| Tamano del repositorio | 0,0 GB |
| Checkpoint entrenado | no; el autor indica explícitamente que no es un checkpoint de benchmark entrenado |
| Metadatos de HuggingFace | Creado el 30 de septiembre de 2026; actualizado el 30 de septiembre de 2026; 0 descargas; 0 likes |

## Arquitectura y entrenamiento

La arquitectura es un diseño "híbrido" propio implementado en un único script de PyTorch (`model.py`). Según la tabla de arquitectura de la model card, emplea atención de tipo grouped query, un mecanismo de fusión de baja cardinalidad (low rank), activación swish y normalización batchnorm. El autor no detalla si la hibridación combina señales dispersas (léxicas) y densas (semánticas) —como es habitual en el ámbito del retrieval híbrido— o si se refiere a una combinación de bloques de atención con otros mecanismos; ese extremo no está documentado en la información disponible. Tampoco se especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto admitida.

En cuanto al entrenamiento, no existe evidencia de que se haya completado ninguno. El autor describe la receta incluida (`adafactor` con planificador coseno) como "valores de partida en el script, no evidencia de una ejecución completada". No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. El propio repositorio recomienda, para una evaluación significativa, entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y sugiere Flickr30k como primer conjunto de evaluación, reportando la métrica de la tarea en al menos tres semillas junto a un baseline de capacidad comparable.

## Capacidades

- No hay capacidades verificadas: el checkpoint publicado es una inicialización sin entrenar y el repositorio no aporta resultados de evaluación.
- No se declara generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas cubiertos.
- La finalidad declarada del artefacto es servir como implementación de referencia para retrieval, con utilidad en revisión de código, pruebas de humo y experimentos controlados.
- El propio autor advierte que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de poder usarla.

## Casos de uso

- Revision de codigo e inspeccion de arquitectura: `model.py` es el artefacto principal y puede leerse o ejecutarse con `python model.py --help` para estudiar cómo se implementan la atención grouped query, la fusión low rank y la normalización batchnorm en un caso concreto.
- Pruebas de humo en pipelines de PyTorch: al tratarse de un checkpoint válido de inicialización con solo 24.832 parámetros, sirve para verificar que un entorno de entrenamiento, un cargador de safetensors o un bucle de validación funcionan de extremo a extremo antes de escalar a un modelo real.
- Banco de pruebas para experimentos de retrieval híbrido: el autor propone evaluar sobre Flickr30k con al menos tres semillas y un baseline de capacidad comparable, de modo que el repositorio puede usarse como plantilla metodológica para montar una comparativa reproducible.
- Plantilla de receta de entrenamiento: `training_args.json` documenta una configuración por defecto con adafactor y planificador coseno, reutilizable como punto de partida para experimentos propios, siempre sustituyendo los pesos por un entrenamiento real.
- Docencia y formación: por su tamaño reducido y su código autocontenido, es adecuado para explicar en un aula o taller cómo se estructura un transformer híbrido orientado a recuperación sin necesidad de infraestructura de GPU.
- Base para reimplementaciones y adaptadores: desarrolladores que necesiten integrar esta arquitectura en un framework de carga genérico pueden escribir el adaptador correspondiente tomando `config.json` como contrato de configuración.
- Verificacion de compatibilidad de licencia: al estar bajo BSD-3-Clause, el código puede incorporarse a proyectos propietarios; el caso de uso aquí es auditar esa integración antes de reutilizar el script.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado. La única orientación de evaluación aportada por el autor es metodológica: usar Flickr30k, reportar la métrica de la tarea en al menos tres semillas e incluir un baseline de capacidad comparable, conservando los registros de entrenamiento y las versiones del entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en fp32 (24.832 parámetros × 4 bytes ≈ 97 KB), más el consumo del propio intérprete de Python y de PyTorch.
- GPU recomendadas: ninguna en particular; el modelo cabe con holgura en cualquier GPU, incluida una GTX 1050 o una iGPU integrada, y también en CPU.
- Cabe en GPU de consumo: sí, en cualquiera; no requiere GPU dedicada.
- Opciones de despliegue: no se documenta integración con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia similares. El artefacto se ejecuta como script de PyTorch (`model.py`) o cargando el safetensors mediante un adaptador propio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones y, al no existir un modelo entrenado, cualquier cifra carecería de significado.

## Comparativa con modelos similares

No se dispone de datos de especificaciones de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a la categoría funcional. El repositorio no es un modelo de retrieval desplegable, sino una implementación de referencia sin entrenar, lo que lo sitúa en una categoría distinta a la de los codificadores densos que se usan habitualmente en recuperación híbrida.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rmorozov/hybrid-retrieval | 24.832 | no disponible | sin benchmarks publicados | BSD-3-Clause | repositorio HuggingFace, checkpoint sin entrenar |
| MiniLM-v6 (citado en la literatura de retrieval híbrido) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| BGE-Large (citado en la literatura de retrieval híbrido) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La literatura consultada sobre retrieval híbrido compara codificadores densos de propósito general en pipelines de RAG con refuerzo léxico y reranking mediante LLM, un escenario que no es comparable de forma directa con este artefacto, ya que aquí no existe un modelo entrenado ni una métrica publicada.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no ha sido entrenado. No es un modelo utilizable para inferencia con calidad.
- El autor indica que el checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio.
- No se publican sesgos conocidos porque no se ha realizado ninguna evaluación; la ausencia de datos no equivale a ausencia de sesgo.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que no hay un modelo generativo entrenado; cualquier salida del script debe tratarse como resultado de pesos aleatorios.
- No se declaran idiomas soportados ni limitaciones de contexto, ya que no se especifica la longitud de contexto.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución, pero el autor recomienda revisar por separado los términos de los datos de origen cuando el repositorio se use con conjuntos de datos externos.
- Para producción: no apto. Cualquier resultado obtenido con este repositorio debe documentarse de forma separada respecto a los valores por defecto que se distribuyen en el mismo.
- Las APIs de carga automática de HuggingFace no funcionan sin un adaptador explícito, dado que se trata de una implementación personalizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rmorozov/hybrid-retrieval
- Hybrid Retrieval Methods (resumen temático): https://www.emergentmind.com/topics/hybrid-retrieval
- Rethinking Hybrid Retrieval: When Small Embeddings and LLM Re-ranking (paper, PDF): https://arxiv.org/pdf/2506.00049
- Rethinking Hybrid Retrieval: When Small Embeddings and LLM Re-ranking (abstract en arXiv): https://arxiv.org/abs/2506.00049
- Trabajo de IA aplicada de Denis Morozov: https://morozovdenis.com/ai/
