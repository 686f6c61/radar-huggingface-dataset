# fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed455

## Resumen

`fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed455` es un modelo de generacion de texto en ingles de 86.508.288 parametros, resultado de un ajuste fino supervisado (SFT) sobre `goldfish-models/eng_latn_100mb`, un modelo base de tipo GPT-2 entrenado con 100 MB de texto en ingles. Lo publica el usuario fpadovani y esta etiquetado como experimento academico generado con TRL, con semilla fija (455), lo que apunta a un artefacto de reproducibilidad de un estudio sobre composicion lexica y distribucion Zipf del corpus de entrenamiento.

Su relevancia no es practica sino metodologica: se trata de un modelo diminuto (86 M de parametros, unos 346 MB en fp32) pensado para comparar variantes de datos bajo condiciones controladas, no para uso en produccion. En el momento de la consulta acumula 0 descargas y 0 likes, y su model card no documenta idiomas, licencia, longitud de contexto, dataset ni resultados de evaluacion.

La arquitectura es un transformer decoder-only de la familia GPT-2, sin atencion lineal, sin mezcla de expertos y sin modo de razonamiento. Es, por tanto, un modelo de juguete para investigacion sobre seleccion de datos, no un asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 |
| Parametros totales | 86.508.288 (86,5 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible; pesos publicados sin cuantizar, convertibles a GGUF/INT8/INT4 |
| Idiomas soportados | ingles (modelo base `eng_latn`, 100 MB de texto en ingles); no se documentan otros idiomas |
| Licencia | no disponible (la model card contiene el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Tamano del repositorio | 1,4 GB |
| Fecha de creacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only autorregresivo de tipo GPT-2, con 86,5 M de parametros, heredado del checkpoint `goldfish-models/eng_latn_100mb`. La familia Goldfish, a la que pertenece el modelo base segun su convencion de nombres (`codigo ISO de lengua` + `tamano de corpus`), agrupa modelos monolingues pequenos entrenados con corpus de 100 MB por lengua; en este caso, ingles en escritura latina. La model card no detalla el numero de tokens, la composicion del dataset, la longitud de contexto ni el uso de atencion lineal u otras variantes arquitectonicas, por lo que esos datos deben considerarse no disponibles.

El ajuste se realizo mediante aprendizaje supervisado (SFT) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se menciona RLHF, DPO, decodificacion especulativa ni ninguna innovacion tecnica adicional. El nombre del checkpoint (`ppt-wc-zipf-newlex-66-eng-100mb_seed455`) sugiere un barrido experimental sobre caracteristicas del corpus (recuento de palabras, ajuste a la ley de Zipf, lexico nuevo, variante 66) con una semilla concreta; se trata de una inferencia a partir del identificador y no de un dato confirmado en la documentacion.

## Capacidades

- Generacion de texto autorregresiva en ingles, condicionada por un prompt de usuario.
- Acepta el formato de mensajes de rol (`[{"role": "user", "content": ...}]`) a traves del pipeline de `transformers`, tal como muestra el ejemplo de la model card.
- Capacidad de continuacion de texto y generacion de respuestas cortas (el ejemplo oficial usa `max_new_tokens=128`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni planificacion.
- No se documenta modo "thinking", vision, audio ni ninguna modalidad distinta de texto.
- Cobertura multilingue: limitada al ingles; no hay evidencia de capacidades en castellano u otras lenguas.
- Al tratarse de un modelo de 86 M de parametros con 100 MB de entrenamiento, sus capacidades de conocimiento factual, matematicas y codigo son previsiblemente muy limitadas, aunque no existen evaluaciones publicadas que lo cuantifiquen.

## Casos de uso

- Reproduccion de experimentos academicos: el identificador incluye una semilla explicita (`seed455`), de modo que el modelo sirve para replicar exactamente una condicion experimental concreta en estudios de seleccion de datos.
- Estudio de distribuciones lexicas y ley de Zipf: el nombre del checkpoint apunta a variantes de corpus definidas por estadisticos de frecuencia; el modelo permite comparar el efecto de esas variantes sobre la perplejidad y la generacion.
- Baseline de bajo coste en investigacion sobre scaling de datos: con 100 MB de entrenamiento y 86,5 M de parametros, actua como punto de referencia minimo frente a variantes con mas datos o mas parametros.
- Validacion de pipelines de entrenamiento: al estar generado con TRL 0.23.0 y Transformers 4.56.2, sirve para comprobar la compatibilidad de flujos SFT, el registro en Weights & Biases y la serializacion en safetensors.
- Pruebas de infraestructura de inferencia: es util para verificar despliegues de `text-generation-inference`, endpoints compatibles o vLLM con un modelo que cabe holgadamente en memoria.
- Docencia y formacion: como ejemplo de ajuste fino de un GPT-2 pequeno, permite ilustrar de principio a fin el ciclo de SFT sin necesidad de GPU de gama alta.
- Generacion de texto en entornos con recursos minimos: al ocupar unos 346 MB en fp32 y unos 43 MB en INT4, puede ejecutarse en CPU, en una Raspberry Pi o en dispositivos empotrados para tareas de continuacion de texto no criticas.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, analisis documental ni ninguna tarea que requiera conocimiento factual fiable o contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion, y la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente articulos sin relacion sobre migracion de correo a Microsoft 365). No se deben asumir cifras de rendimiento a partir de modelos de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 346 MB en fp32, 173 MB en fp16/bf16, 87 MB en INT8 y 43 MB en INT4 (calculado a partir de los 86.508.288 parametros; no son cifras publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no se requiere A100, H100 ni tarjetas de centro de datos.
- Cabe en GPU de consumo: si, en cualquier modelo (RTX 3060, RTX 4090, GTX 1650, e incluso en GPU integradas con memoria compartida suficiente).
- Ejecucion en CPU: viable sin dificultad; es probablemente el modo de despliegue mas razonable dado el tamano.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")`, `text-generation-inference` (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp/Ollama previa conversion de los pesos safetensors a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-wc-zipf-newlex-66-eng-100mb_seed455 | 86,5 M | no disponible | SFT sobre 100 MB de ingles | no disponible | HuggingFace, 0 descargas |
| goldfish-models/eng_latn_100mb (modelo base) | ~86 M (misma arquitectura) | no disponible | Preentrenamiento monolingue con 100 MB de ingles | no disponible en la informacion proporcionada | HuggingFace (familia Goldfish) |
| distilgpt2 | 82 M | 1024 tokens | Destilacion de GPT-2 sobre corpus en ingles | Apache-2.0 | HuggingFace, ampliamente descargado |
| gpt2 | 124 M | 1024 tokens | Preentrenamiento sobre WebText | MIT | HuggingFace, ampliamente descargado |

La diferencia principal frente a `distilgpt2` y `gpt2` no es de tamano, sino de proposito: esos dos son modelos generalistas con millones de descargas y evaluaciones conocidas, mientras que este checkpoint es un artefacto experimental con 0 descargas, sin licencia declarada y sin ningun dato de evaluacion publico.

## Limitaciones y advertencias

- Base de conocimiento muy reducida: 100 MB de texto en ingles es un volumen minimo, por lo que la generacion de hechos sera poco fiable y la alucinacion debe considerarse el comportamiento por defecto.
- Ausencia total de evaluacion: no hay perplexity, benchmarks ni analisis cualitativo publicados; cualquier uso productivo se haria sin evidencia de calidad.
- Idioma: el modelo base esta etiquetado como `eng_latn`, de modo que el rendimiento en castellano u otras lenguas no esta soportado y previsiblemente sera deficiente.
- Licencia no disponible: la model card contiene un marcador de posicion (`licence: license`), lo que impide determinar si el uso comercial esta permitido. En la practica, esto desaconseja cualquier integracion en producto.
- Sesgos: no hay documentacion sobre la composicion del corpus ni sobre sesgos de genero, raza o ideologia; al ser texto web en ingles, es probable la presencia de sesgos no medidos.
- Contexto no especificado: se desconoce la ventana real de tokens, lo que complica el diseno de prompts largos y de conversaciones multi-turno.
- Trazabilidad limitada: no se documenta el dataset de SFT ni el numero de pasos, epocas o ejemplos utilizados, lo que dificulta auditar el modelo.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican que nadie ha reportado fallos, comportamientos anomalos ni resultados reproducibles.
- El propio identificador apunta a un experimento controlado con semilla fija; no debe tratarse como un modelo destinado a distribucion general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-66-eng-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Organizacion Goldfish en HuggingFace: https://huggingface.co/goldfish-models
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/rpmkp23w
- No se han encontrado papers, blogs, repositorios ni demos adicionales sobre este modelo en la busqueda web realizada.
