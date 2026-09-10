# fpadovani/ppt-nld_heavy_uniform-100mb_seed455

## Resumen

ppt-nld_heavy_uniform-100mb_seed455 es un ajuste fino (SFT) del modelo neerlandés goldfish-models/nld_latn_100mb, publicado por el usuario fpadovani en HuggingFace. Se trata de un modelo de generación de texto de arquitectura GPT-2 con 86.708.736 parámetros, entrenado mediante la librería TRL (versión 0.23.0) sobre el checkpoint base, que a su vez fue preentrenado con aproximadamente 100 MB de texto en neerlandés (etiqueta nld_latn). El modelo se distribuye únicamente en formato safetensors y está etiquetado como compatible con text-generation-inference.

El interés de esta ficha es limitado pero concreto: se trata de un artefacto de investigación más que de un modelo de producción. El nombre del modelo sugiere un experimento sistemático (prefijo "ppt", variante "heavy_uniform", semilla 455) sobre estrategias de ajuste supervisado, ejecutado en el entorno de Weights & Biases de la Universidad de Groningen (proyecto "white_cotterell"). No se ha publicado documentación adicional sobre la composición del dataset de SFT, el número de tokens de entrenamiento ni los hiperparámetros empleados.

Su relevancia actual es acotada: sirve como punto de comparación para estudiar cómo el SFT afecta a modelos monolingües pequeños entrenados con presupuestos de datos reducidos, un área activa en la investigación sobre lenguas de bajos recursos. No se recomienda su uso en producción sin una evaluación propia, dado que no se especifica licencia, no hay benchmarks publicados y el modelo base sólo dispone de 100 MB de datos de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun la etiqueta `gpt2` del repositorio |
| Parametros totales | 86.708.736 (dato real de los pesos en safetensors) |
| Longitud de contexto | no disponible (el modelo base deriva de GPT-2, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible de forma explicita; el identificador del modelo base (`nld_latn`) indica neerlandes (`nld`) en escritura latina |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin concretar terminos y el repositorio no declara licencia) |
| Formato de pesos | safetensors (tamano del repositorio: 1,4 GB) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | goldfish-models/nld_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, tal como indica la etiqueta `gpt2` del repositorio y el linaje del modelo base. El checkpoint tiene 86.708.736 parámetros, un tamano inferior a los 124 millones del GPT-2 small original, lo que es coherente con la familia goldfish, que entrena variantes monolingües compactas sobre corpus reducidos (el sufijo `100mb` del modelo base apunta a unos 100 MB de texto de preentrenamiento en neerlandés). No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni vocabulario.

El entrenamiento de este checkpoint concreto se realizo mediante ajuste supervisado (SFT) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica la composicion del dataset de SFT, el volumen de tokens, la existencia de fases de RLHF o DPO, ni si se aplicaron tecnicas como decodificacion especulativa o atencion lineal. El modelo se identifica con la semilla 455 y la variante `heavy_uniform`, terminologia propia de un barrido experimental cuyo detalle no se documenta en la model card. El experimento esta registrado en un run publico de Weights & Biases bajo el proyecto `white_cotterell` de la Universidad de Groningen.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad declarada en el pipeline del repositorio (`text-generation`).
- Conversacion de un solo turno: el ejemplo de la model card usa el formato de mensajes con rol `user`, procesado a traves de `transformers.pipeline`.
- Procesamiento de texto en neerlandes: presumiblemente heredado del modelo base `goldfish-models/nld_latn_100mb`, aunque no se declara de forma explicita.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Capacidades multilingues: no disponible; el modelo base esta etiquetado como monolingue neerlandes.
- Razonamiento matematico o generacion de codigo: no disponible.

## Casos de uso

- Investigacion sobre ajuste supervisado en lenguas de bajos recursos: el modelo sirve como punto de control dentro de un barrido experimental (semilla 455, variante `heavy_uniform`) para medir el efecto del SFT sobre un modelo neerlandes de 100 MB de preentrenamiento.
- Reproducibilidad de experimentos academicos: al estar publicado el run de Weights & Biases y las versiones exactas de las librerias (TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0), permite repetir el entrenamiento en un entorno equivalente.
- Generacion de texto en neerlandes con requisitos minimos de hardware: con 86,7 millones de parametros, puede ejecutarse en CPU o en una GPU de gama baja para tareas de prueba, siempre que se valide antes la calidad del idioma.
- Prototipado rapido de pipelines de `transformers`: el ejemplo de `pipeline("text-generation", ...)` de la model card permite integrarlo en menos de diez lineas de codigo para validar infraestructura de inferencia.
- Analisis de derivas de ajuste fino (fine-tuning drift): comparar sus salidas con las del modelo base `goldfish-models/nld_latn_100mb` permite cuantificar como el SFT altera la distribucion de salidas.
- Experimentos de destilacion o evaluacion de modelos pequenos: puede actuar como modelo alumno o como referencia de bajo coste en estudios comparativos de eficiencia frente a modelos neerlandeses mayores.
- Despliegue en entornos educativos: su tamano reducido (repo de 1,4 GB, pesos del orden de cientos de MB) facilita su uso en aulas o talleres sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 (86,7 M de parametros x 4 bytes) y unos 0,17 GB en fp16 (x 2 bytes), sin contar la memoria de activaciones y del cache KV.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1050 Ti, una RTX 3050 o una T4 son mas que suficientes.
- CPU: la inferencia en CPU es viable por el reducido numero de parametros; se recomienda al menos 4 GB de RAM para cargar el modelo y el tokenizador.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, asi como en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `transformers` (confirmado en la model card), text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`). No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion manual.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|---|
| fpadovani/ppt-nld_heavy_uniform-100mb_seed455 | 86,7 M | no disponible | neerlandes (presunto) | no disponible | safetensors | no publicados |
| goldfish-models/nld_latn_100mb (modelo base) | no disponible (familia de ~100 MB de datos) | no disponible | neerlandes | no disponible en la informacion proporcionada | safetensors | no disponibles en la informacion proporcionada |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | ingles | MIT | safetensors, GGUF (conversiones de terceros) | resultados publicos en MMLU, LAMBADA, etc. |
| GroNLP/gpt2-small-dutch | ~124 M | 1024 tokens | neerlandes | no disponible en la informacion proporcionada | safetensors | no disponibles en la informacion proporcionada |

Las comparaciones con GPT-2 small y GroNLP/gpt2-small-dutch se ofrecen unicamente como referencia de categoria (modelos decoder-only de tamano reducido); no implican una evaluacion empirica frente a este checkpoint, que no dispone de resultados publicados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada (loss, perplejidad, evaluaciones generativas) que permita estimar la calidad del modelo.
- Preentrenamiento con datos muy limitados: el modelo base se entreno con aproximadamente 100 MB de texto, un volumen muy inferior al de modelos de referencia de la misma familia, lo que se traduce en un conocimiento del mundo y una fluidez previsiblemente bajos.
- Cobertura idiomatica restringida: el identificador `nld_latn` apunta a neerlandes como unico idioma; se espera un rendimiento deficiente en castellano, ingles y otras lenguas.
- Licencia indeterminada: el repositorio no declara licencia y la model card contiene el campo `licence: license` sin terminos concretos. No hay base juridica clara para un uso comercial sin consultar al autor.
- Riesgo de alucinacion: no se ha documentado ningun proceso de alineacion o mitigacion (RLHF, DPO, filtros de seguridad), por lo que la generacion de contenido falso o inapropiado no esta controlada.
- Sesgos no evaluados: al no publicarse la composicion del dataset de SFT ni del corpus de preentrenamiento, no es posible auditar sesgos de genero, etnia, religion o ideologia.
- Contexto no especificado: se desconoce la ventana de contexto efectiva, lo que impide planificar tareas de contexto largo o conversaciones multi-turno extensas.
- Formato unico de pesos: solo se publican safetensors, sin versiones cuantizadas (GGUF, AWQ, GPTQ), lo que obliga a convertir manualmente para usar llama.cpp, Ollama u otras herramientas de inferencia local.
- Trazabilidad experimental incompleta: el nombre del modelo sugiere un barrido de hiperparametros (variante `heavy_uniform`, semilla 455) cuyo diseno completo no esta documentado en la model card.
- Uso en produccion desaconsejado: por la combinacion de licencia incierta, ausencia de evaluaciones y calidad no verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_heavy_uniform-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/8s2uy6xm
- Documentacion de `transformers.pipeline`: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.pipeline
- Los resultados de busqueda web proporcionados (SG Castrop-Rauxel, Wikipedia, fussball.de) no guardan relacion con el modelo y se descartan como fuentes.
