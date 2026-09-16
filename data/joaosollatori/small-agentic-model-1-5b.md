# joaosollatori/small-agentic-model-1.5B

## Resumen

El modelo `joaosollatori/small-agentic-model-1.5B` es un ajuste fino (fine-tune) del modelo base GPT-2 publicado por el usuario joaosollatori en HuggingFace. A pesar del nombre, los pesos reales en formato safetensors suman 124.439.808 parametros (unos 124 millones), lo que corresponde exactamente al tamano de GPT-2 small; la model card, ademas, se refiere internamente al modelo como "small-agentic-model-2b". Existe por tanto una discrepancia de nomenclatura entre el identificador del repositorio (1,5B), el titulo de la model card (2B) y el tamano real de los pesos (124M).

El modelo se distribuye con licencia MIT, categoria `text-generation`, y fue entrenado con la libreria Transformers 5.0.0 sobre un dataset que el propio autor describe como "unknown" (desconocido). La unica metrica publicada es la perdida de evaluacion (3,1493) tras una unica epoca de entrenamiento con learning rate 3e-4 y AdamW. No se han publicado resultados de benchmarks, no se documentan idiomas soportados ni capacidades agenticas concretas, a pesar de que el nombre del repositorio sugiere un uso orientado a agentes.

Su relevancia actual es limitada y fundamentalmente experimental: se trata de un modelo pequeno (124M), entrenable y ejecutable en CPU, util como banco de pruebas para pipelines de inferencia o para docencia, pero sin evidencias publicadas de rendimiento que justifiquen su uso en produccion frente a alternativas mas modernas del mismo rango de tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 (modelo base: openai-community/gpt2) |
| Parametros totales | 124.439.808 (~124 M), segun los pesos safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base GPT-2 soporta 1.024 tokens |
| Tipos de cuantizacion | No disponible en la model card; al derivar de GPT-2 es convertible a GGUF, ONNX y cuantizaciones de 8 y 4 bits con herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio alojado con la libreria transformers) |
| Modelo base | openai-community/gpt2 |
| Libreria | transformers |
| Tamano del repositorio | 45,8 GB |
| Descargas | 5.393 |
| Vocabulario | No confirmado en la model card; el tokenizer de GPT-2 usa 50.257 tokens |
| Fecha de publicacion | 10 de septiembre de 2026 (creacion del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 small: un transformer decoder-only autorregresivo con atencion causal completa y embeddings posicionales aprendidos. El modelo base `openai-community/gpt2` tiene 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y una ventana de contexto de 1.024 tokens. No se ha introducido ninguna innovacion arquitectonica documentada: no hay atencion lineal, decodificacion especulativa, mezcla de expertos ni componentes de espacio de estados.

El entrenamiento se realizo con el `Trainer` de Transformers (tag `generated_from_trainer`) durante una sola epoca, con learning rate 3e-4, scheduler lineal, AdamW fused (betas 0,9/0,999, epsilon 1e-8), batch efectivo de 64 (batch 8 x 8 pasos de acumulacion) y precision mixta AMP nativa, con semilla 42. El dataset de entrenamiento no esta documentado: la propia model card indica "unknown dataset" y "More information needed" en las secciones de descripcion, usos previstos y datos. No hay indicios de RLHF, DPO, SFT con preferencias ni de un pipeline de alineacion. La unica metrica reportada es una loss de evaluacion de 3,1493, un valor alto que sugiere una calidad de generacion limitada. El repositorio ocupa 45,8 GB, un tamano desproporcionado para 124M de parametros, probablemente debido al almacenamiento de multiples checkpoints y estados del optimizador.

## Capacidades

- Generacion de texto autorregresiva en la linea de GPT-2 small; el modelo hereda el comportamiento del checkpoint base mas el ajuste fino.
- Continuacion de texto y autocompletado a corto plazo, condicionado por una ventana de 1.024 tokens.
- Capacidad limitada de razonamiento y de coherencia a largo plazo, propia de un modelo de 124M de parametros.
- Soporte de tool calling / function calling: no documentado y sin evidencia de que exista, pese al termino "agentic" del nombre.
- Soporte de agentes y razonamiento multi-paso: no documentado; no hay plantilla de chat, formato de herramientas ni ejemplos de uso agentico en la model card.
- Capacidades multilingues: no disponibles; el modelo base GPT-2 esta entrenado predominantemente en ingles.
- Modo thinking, vision o audio: no disponibles.
- No se documenta ninguna capacidad especial adicional (no hay contexto largo, ni salidas estructuradas, ni control de formato).

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: al ocupar menos de 1 GB en fp32, se puede cargar en cualquier entorno de desarrollo con `transformers` para validar el cableado de un pipeline de inferencia antes de pasar a modelos mayores.
- Pruebas de humo (smoke tests) de infraestructura: sirve para verificar despliegues de vLLM, TGI o endpoints compatibles con la API de HuggingFace sin consumir VRAM significativa ni tiempo de arranque.
- Docencia y formacion tecnica: es util para explicar el ciclo completo de fine-tuning con `Trainer`, la carga de safetensors y la evaluacion de la perdida en un modelo lo bastante pequeno como para entrenarlo en CPU o en una GPU de gama baja.
- Fine-tuning adicional de bajo coste: al ser un modelo de 124M con licencia MIT, puede servir como punto de partida para experimentos academicos de ajuste sobre dominios concretos sin infraestructura especializada.
- Despliegue en dispositivos con recursos muy limitados: puede ejecutarse en CPU, en una Raspberry Pi o en un contenedor sin GPU, lo que lo hace apto para demos offline o entornos aislados.
- Generacion de datos sinteticos de baja calidad para pruebas de software: util para producir texto de relleno con el que validar parsers, pipelines de tokenizacion o sistemas de almacenamiento, sin pretension de calidad linguistica.
- Linea base (baseline) en experimentos comparativos: sirve como referencia minima contra la que medir mejoras al incorporar modelos mas grandes o tecnicas de alineacion.

En todos estos casos conviene tener presente que no existe evidencia publicada de calidad de generacion y que la loss de evaluacion reportada (3,1493) es elevada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una entrada con nombre "small-agentic-model-2b" y la lista de resultados vacia, por lo que no hay valores de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

El unico dato numerico disponible es la perdida de evaluacion reportada por el autor:

| Metrica | Valor | Conjunto | Fuente |
|---|---|---|---|
| Loss | 3,1493 | Conjunto de evaluacion | Model card del autor |
| Resultados de benchmarks | Sin datos | — | model-index vacio |

No se dispone de comparaciones con otros modelos medidas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 y 0,25 GB en fp16/bf16 para los pesos; con activaciones y overhead del runtime, entre 1 y 2 GB en total.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente. Modelos como RTX 3060, RTX 4090, Tesla T4 o incluso iGPUs modernas pueden ejecutarlo sin dificultad. Una A100 o H100 resultan completamente desproporcionadas para este tamano.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en bastantes integradas; tambien se puede ejecutar exclusivamente en CPU.
- Opciones de despliegue: `transformers` (via `pipeline("text-generation")`), Text Generation Inference (TGI), vLLM, ONNX Runtime y llama.cpp u Ollama previa conversion de los pesos a GGUF. El repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con los endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia, tokens por segundo ni consumo de memoria en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| small-agentic-model-1.5B (este modelo) | 124 M (segun safetensors) | No disponible (base GPT-2: 1.024 tokens) | MIT | HuggingFace | Fine-tune sin dataset documentado ni benchmarks; loss de evaluacion 3,1493 |
| gpt2 (modelo base) | 124 M | 1.024 tokens | MIT | HuggingFace | Modelo de referencia de 2019; ampliamente evaluado y documentado |
| distilgpt2 | 82 M | 1.024 tokens | MIT | HuggingFace | Version destilada de GPT-2, mas rapida y ligera que el modelo base |
| gpt2-medium | 355 M | 1.024 tokens | MIT | HuggingFace | Mayor capacidad que GPT-2 small, con el mismo esquema de licencia |

La comparacion con alternativas mas recientes de tamano similar no se puede realizar con datos verificados en la informacion disponible. En cualquier caso, este fine-tune no aporta, segun la documentacion publicada, ninguna ventaja medible sobre el checkpoint base del que deriva.

## Limitaciones y advertencias

- Discrepancia de nomenclatura grave: el identificador del repositorio indica 1.5B, la model card dice "2b" y los pesos reales suman 124M de parametros. Cualquier integracion que asuma 1,5B de parametros fallara en las estimaciones de memoria y latencia.
- Dataset de entrenamiento desconocido: el autor lo declara como "unknown dataset", por lo que no se puede auditar la procedencia de los datos, su licencia ni sus sesgos.
- Entrenamiento de una sola epoca con loss de evaluacion 3,1493, un valor alto que anticipa generaciones poco coherentes y potencialmente repetitivas.
- Riesgo elevado de alucinacion: es una caracteristica intrinseca de los modelos GPT-2 de este tamano, agravada por la falta de ajuste con preferencias humanas (no hay RLHF ni DPO documentados).
- Sesgos conocidos: al derivar de GPT-2, hereda los sesgos de genero, raza y religion documentados en el corpus web con el que se entreno el modelo original. El fine-tune no corrige estos sesgos y podria amplificarlos si el dataset no documentado tuviera un sesgo propio.
- Limitacion de contexto: la ventana de 1.024 tokens impide conversaciones multi-turno largas o el procesamiento de documentos extensos.
- Limitacion idiomatica: no se declaran idiomas soportados; el modelo base esta entrenado mayoritariamente en ingles y su rendimiento en castellano es previsiblemente pobre.
- Ausencia de capacidades agenticas verificadas: pese al nombre "agentic", no hay evidencia de soporte de tool calling, function calling, plantillas de chat ni razonamiento multi-paso.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion sin obligacion de compartir derivados, pero no exime de cumplir las condiciones aplicables al modelo base ni de las responsabilidades sobre el contenido generado.
- Caveat de produccion: no se recomienda su uso en produccion sin una evaluacion propia previa, dado que no hay benchmarks, ni documentacion de datos, ni garantias de calidad.
- Tamano del repositorio: 45,8 GB para un modelo de 124M de parametros sugiere la presencia de checkpoints y estados de optimizador redundantes, lo que puede ralentizar la descarga y el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joaosollatori/small-agentic-model-1.5B
- Modelo base en HuggingFace: https://huggingface.co/openai-community/gpt2
- Repositorio del modelo base alternativo: https://huggingface.co/gpt2
- Documentacion de Transformers: https://huggingface.co/docs/transformers/index
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (unicamente paginas de descarga del navegador Google Chrome), por lo que no se dispone de papers, blogs, repositorios ni demos adicionales que enlazar.
