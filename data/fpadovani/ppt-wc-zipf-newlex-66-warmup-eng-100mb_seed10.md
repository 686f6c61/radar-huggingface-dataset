# fpadovani/ppt-wc-zipf-newlex-66-warmup-eng-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-wc-zipf-newlex-66-warmup-eng-100mb_seed10` es un ajuste fino (SFT) del checkpoint `goldfish-models/eng_latn_100mb`, un modelo de lenguaje de tipo GPT-2 entrenado sobre 100 MB de texto en inglés (subconjunto `eng_latn`). El ajuste lo firma el usuario fpadovani y, por la traza de pesos y biberones publicada (proyecto de Weights & Biases `f-padovani-university-of-groningen/white_cotterell`), se enmarca en un experimento academico de la Universidad de Groninga, no en un lanzamiento de producto. El modelo tiene 86.508.288 parametros reales segun los pesos publicados en safetensors y ocupa 1,4 GB en el repositorio.

El nombre del checkpoint revela su naturaleza de artefacto de investigacion: los sufijos `zipf`, `newlex`, `66`, `warmup` y `seed10` apuntan a un experimento controlado sobre distribuciones lexicas (ley de Zipf, lexico nuevo) con una configuracion concreta de calentamiento y una semilla fija. No hay model card descriptiva mas alla de la plantilla de TRL, ni resultados de evaluacion, ni declaracion de licencia o idiomas.

Su relevancia es por tanto metodologica: sirve como punto de control reproducible (semilla 10, configuracion 66) para replicar un estudio de ajuste supervisado sobre un modelo pequeno y de datos limitados. Con cero descargas y cero "likes" en el momento de redactar esta ficha, debe considerarse un checkpoint de laboratorio, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (etiqueta `gpt2` en el repositorio); detalles de capas y cabezas de atencion no disponibles |
| Parametros totales | 86.508.288 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican cuantizaciones propias; por tamano es convertible a int8, int4 y GGUF, pero no hay artefactos publicados |
| Idiomas soportados | No declarados; el modelo base (`goldfish-models/eng_latn_100mb`) esta especializado en ingles (`eng_latn`) |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, segun la etiqueta `gpt2` del repositorio y el modelo base empleado. `goldfish-models/eng_latn_100mb` pertenece a la familia Goldfish, orientada a estudiar el efecto del tamano y la composicion de los datos de preentrenamiento en modelos multilingues; en este caso, el checkpoint base se entreno sobre 100 MB de texto en ingles. El ajuste fino parte de ese checkpoint y no modifica la arquitectura, solo los pesos.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documentan el numero de tokens de ajuste, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La ejecucion esta registrada en Weights & Biases bajo el proyecto `white_cotterell`, en la run `gb1n0mls`. No se describen innovaciones tecnicas (atencion lineal, decodificacion especulativa, MoE) ni tecnicas de optimizacion mas alla del SFT estandar.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base `eng_latn`.
- Acepta el formato de chat con lista de mensajes (`[{"role": "user", "content": ...}]`) a traves del pipeline de `transformers`, tal como muestra la model card del autor.
- Compatible con Text Generation Inference (tags `text-generation-inference` y `endpoints_compatible`), lo que permite desplegarlo detras de una API compatible con el Inference Endpoints de HuggingFace.
- Capacidad de razonamiento, matematicas o codigo: no documentada y, por tamano y datos de preentrenamiento (100 MB), previsiblemente muy limitada.
- Tool calling / function calling: no soportado de forma nativa ni documentado.
- Uso en agentes o razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no disponibles; es un modelo exclusivamente de texto.
- Modo "thinking" explicito: no disponible.
- Multilingue: no declarado; el preentrenamiento base es monolingue en ingles.

## Casos de uso

- Replicacion de experimentos academicos: el checkpoint esta identificado con semilla (`seed10`) y configuracion (`66`, `warmup`), por lo que encaja como punto de control reproducible en estudios sobre ajuste supervisado y distribuciones lexicas.
- Linea base en ablaciones: al ser un modelo de 86,5 M de parametros entrenado con solo 100 MB de texto, sirve como referencia de baja capacidad frente a la que medir tecnicas de ajuste, tokenizacion o aumento de datos.
- Pruebas de integracion en pipelines de NLP: su tamano permite descargarlo y ejecutarlo en segundos, lo que lo hace util para validar plantillas de prompt, parsers de salida o wrappers de API antes de pasar a modelos mayores.
- Docencia y demostraciones: se puede ejecutar en el aula o en un portatil sin GPU dedicada para ilustrar como funciona un bucle de generacion autoregresiva y que aspecto tiene un modelo infraentrenado.
- Generacion de texto de relleno en entornos de prueba: util para poblar bases de datos, maquetas de interfaz o tests de carga de un servicio de inferencia sin coste de GPU significativo.
- Análisis del efecto de la semilla en el ajuste fino: al existir variantes con el mismo prefijo pero distinta semilla, permite estudiar la varianza entre ejecuciones de SFT sobre el mismo dataset.
- Despliegue en dispositivos con recursos muy limitados: con 86,5 M de parametros cabe en CPU y en GPUs integradas, habilitando demostraciones offline o en el navegador mediante conversiones a ONNX/GGUF (no publicadas por el autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye tabla de evaluacion, la model card se limita a la plantilla autogenerada por TRL y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32, 0,17 GB en fp16/bf16 y 0,09 GB en int8 para los pesos; el consumo real dependera del tamano de lote y de la longitud de secuencia, no documentados.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requieren A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GTX 1650 lo ejecutan sin problema.
- Compatibilidad con GPU de consumo: si, en todas las gamas actuales, y tambien en CPU (x86 o ARM) con `transformers` en PyTorch.
- Opciones de despliegue: `transformers` (pipeline `text-generation`), Text Generation Inference (el repositorio incluye los tags correspondientes), vLLM y, previa conversion no publicada, llama.cpp u Ollama. No hay artefactos GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones y el repositorio no incluye informes de rendimiento.
- Almacenamiento: el repositorio ocupa 1,4 GB, muy por encima de lo que sugieren los pesos (unos 0,35 GB en fp32), presumiblemente por estados de optimizador o checkpoints intermedios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-66-warmup-eng-100mb_seed10` | 86.508.288 | No disponible | No disponible | HuggingFace, safetensors |
| `goldfish-models/eng_latn_100mb` (modelo base) | No disponible (arquitectura GPT-2, preentrenado con 100 MB) | No disponible | No disponible | HuggingFace |
| GPT-2 small | 124 millones | 1024 tokens | Modified MIT | HuggingFace, safetensors y PyTorch bin |
| distilgpt2 | 82 millones | 1024 tokens | Apache 2.0 | HuggingFace |
| Pythia-70M | 70 millones | 2048 tokens | Apache 2.0 | HuggingFace |

La comparacion es orientativa en cuanto a tamano: los tres modelos alternativos cuentan con documentacion publica de licencia y contexto, mientras que este checkpoint no la aporta. No hay datos de rendimiento comparables para ninguno de los cuatro en la informacion disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigacion con cero descargas y cero interacciones en HuggingFace: no ha pasado por validacion de la comunidad ni por una evaluacion publicada.
- Preentrenado sobre solo 100 MB de texto en ingles, muy por debajo de los volumenes habituales (miles de millones de tokens), por lo que la calidad de generacion y la cobertura factual seran muy limitadas.
- Riesgo elevado de alucinacion y de texto incoherente en tareas de conocimiento, razonamiento o codigo; no debe usarse para responder preguntas factuales sin verificacion.
- Sesgos: no documentados, pero al derivar de un corpus reducido de ingles hereda los sesgos de esa fuente sin ninguna mitigacion declarada.
- Idiomas: no se declara soporte multilingue; el preentrenamiento base es `eng_latn`, por lo que el rendimiento en castellano u otras lenguas sera muy bajo.
- Licencia: no disponible. La model card incluye un campo `licence: license` sin valor, de modo que no hay autorizacion explicita para uso comercial. Conviene contactar con el autor antes de cualquier uso fuera de la investigacion.
- Longitud de contexto desconocida: no se puede planificar el despliegue en escenarios de contexto largo sin determinarla experimentalmente.
- El repositorio ocupa 1,4 GB, mas de lo esperable por los pesos; conviene revisar si contiene estados de optimizador u otros artefactos antes de integrarlo en un pipeline de produccion.
- Los resultados de la busqueda web proporcionados no guardan relacion con el modelo y no aportan informacion adicional; no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-66-warmup-eng-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/gb1n0mls
- Repositorio de la familia Goldfish: https://github.com/goldfish-models (referencia de la organizacion del modelo base; no confirmada en la informacion proporcionada)
