# mradermacher/Qwen3-8B-abliterated-iSMART-GGUF

## Resumen

Qwen3-8B-abliterated-iSMART-GGUF es una distribucion de cuantizaciones GGUF generadas por mradermacher a partir del modelo lefantom00/Qwen3-8B-abliterated-iSMART, que a su vez es un derivado del Qwen3-8B de Alibaba. El modelo base sigue la arquitectura transformer densa de la familia Qwen3, con 8.190.735.360 parametros totales (aproximadamente 8,2 mil millones), y ha sido sometido a un proceso de "abliteration" (eliminacion o reduccion de la direccion de rechazo en el espacio de activaciones) para disminuir las negativas del modelo ante peticiones que el modelo original rechazaria. Sobre esa variante se aplico un ajuste fino con iSMART (un metodo de entrenamiento supervisado) y posteriormente se publico como modelo base en formato transformers.

Este repositorio concreto no contiene pesos en safetensors, sino un conjunto de cuantizaciones estaticas en formato GGUF (de Q2_K a f16) pensadas para inferencia local con llama.cpp y herramientas compatibles. El autor de las cuantizaciones es mradermacher, un perfil conocido en Hugging Face por producir versiones GGUF de modelos populares, e incluye tanto cuantizaciones estaticas como una variante con imatrix publicada en un repositorio separado. El modelo se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es practica: permite ejecutar un modelo de ~8B con capacidades conversacionales en hardware de consumo, con un sesgo declarado hacia el vietnamita (unico idioma listado en la model card) y con las implicaciones eticas y de seguridad que conlleva un modelo "abliterated". No se dispone de informacion publica sobre benchmarks, composicion del dataset de entrenamiento ni detalles del proceso de abliteration en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), segun modelo base |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K (3,4 GB), Q3_K_S (3,9 GB), Q3_K_M (4,2 GB), Q3_K_L (4,5 GB), IQ4_XS (4,7 GB), Q4_K_S (4,9 GB), Q4_K_M (5,1 GB), Q5_K_S (5,8 GB), Q5_K_M (6,0 GB), Q6_K (6,8 GB), Q8_0 (8,8 GB), f16 (16,5 GB); variantes imatrix en repositorio i1-GGUF |
| Idiomas soportados | vi (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en transformers no se distribuye en este repo |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer denso de la familia Qwen3 con 8.190.735.360 parametros. Sobre ese modelo se aplico un proceso de abliteration (modificacion de pesos para suprimir la direccion de rechazo) y posteriormente un ajuste fino supervisado (SFT) mediante iSMART, segun los tags del repositorio (qwen3, trl, sft, unsloth). La model card del repositorio de cuantizaciones no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO adicionales. Tampoco se detalla la innovacion tecnica del proceso de abliteration ni los hiperparametros del SFT.

Las cuantizaciones se generaron con llama.cpp (quantize_version 2, output_tensor_quantised 1, convert_type hf) y se ofrecen tanto en variantes estaticas como en variantes con imatrix (repositorio i1-GGUF), que suelen preservar mejor la perplejidad a igual tamano. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y recomienda Q4_K_S y Q4_K_M como opciones rapidas y equilibradas.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-8B.
- Razonamiento y respuesta a instrucciones, sujeto al ajuste fino SFT aplicado sobre la variante abliterated.
- Capacidad multilingue limitada: la model card solo declara vietnamita (vi); el comportamiento en castellano u otros idiomas no esta documentado y depende del modelo base Qwen3, que es multilingue, pero no hay garantia en esta variante.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Modo thinking: no documentado en la informacion proporcionada.
- Vision y audio: no disponibles (modelo de texto).
- Al ser una variante abliterated, se espera una reduccion de las negativas ante peticiones que el modelo original rechazaria, aunque el alcance exacto no esta cuantificado en la informacion disponible.

## Casos de uso

- Inferencia local en hardware de consumo: con cuantizaciones Q4_K_S o Q4_K_M (4,9-5,1 GB) el modelo cabe en GPUs con 8 GB de VRAM y en equipos con 16 GB de RAM mediante llama.cpp u Ollama, lo que permite desplegar un asistente conversacional sin conexion.
- Prototipado rapido de chatbots en vietnamita: al ser el unico idioma declarado, es adecuado para experimentos de conversacion en ese idioma antes de invertir en modelos mayores o en ajustes especificos.
- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar el comportamiento de un modelo con la direccion de rechazo suprimida, comparando respuestas frente al Qwen3-8B original en tareas de evaluacion de seguridad.
- Generacion de texto creativo sin filtros restrictivos: para entornos controlados donde se necesita explorar respuestas que un modelo alineado rechazaria, con la advertencia de que el contenido generado debe revisarse.
- Despliegue en entornos con recursos limitados mediante cuantizacion Q2_K o Q3_K_S (3,4-3,9 GB): util para pruebas en CPUs, Raspberry Pi de gama alta o GPUs integradas, aceptando la perdida de calidad documentada por el autor.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, lo que permite medir el impacto de cada nivel en perplejidad y calidad para un modelo de ~8B en un caso concreto.
- Fine-tuning posterior sobre la variante GGUF: no es el flujo habitual (GGUF esta pensado para inferencia), pero el modelo base en transformers permite reentrenamientos antes de recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y ventana de contexto):
  - Q2_K: ~3,4 GB de pesos; ~4-5 GB con overhead de contexto.
  - Q4_K_M: ~5,1 GB de pesos; ~6-7 GB con contexto moderado.
  - Q8_0: ~8,8 GB de pesos; ~10 GB con contexto.
  - f16: ~16,5 GB de pesos; ~18 GB con contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 no son necesarias para un modelo de 8B, pero permiten mayor throughput en serving.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 8 GB o mas usando Q4_K_S/Q4_K_M; en GPUs de 6 GB conviene bajar a Q3_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; tambien es posible usar el modelo base en transformers con vLLM o TGI, aunque este repositorio solo contiene GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3-8B-abliterated-iSMART-GGUF (este) | 8,19B | no disponible | Apache 2.0 | GGUF (12 cuantizaciones) | Variante abliterated + SFT iSMART, idioma declarado vi |
| Qwen/Qwen3-8B | ~8B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo original alineado, multilingue |
| lefantom00/Qwen3-8B-abliterated-iSMART | 8,19B | no disponible | Apache 2.0 | transformers (safetensors) | Modelo base de este repo, sin cuantizar |
| mradermacher/Qwen3-8B-abliterated-iSMART-i1-GGUF | 8,19B | no disponible | Apache 2.0 | GGUF con imatrix | Misma base, cuantizaciones ponderadas de mayor calidad |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Modelo abliterated: la supresion de la direccion de rechazo puede aumentar la probabilidad de generar contenido danino, sesgado o inapropiado; no es recomendable para produccion orientada al publico sin filtros adicionales.
- Idioma: la model card solo declara vietnamita; el rendimiento en castellano, ingles u otros idiomas no esta garantizado y puede degradarse respecto al Qwen3-8B original.
- Riesgo de alucinacion: inherente a los modelos de ~8B; no hay evaluaciones publicadas que cuantifiquen la tasa de alucinacion en esta variante.
- Sesgos: no documentados en la informacion disponible; el proceso de abliteration y el SFT pueden alterar los sesgos del modelo original de formas no medidas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo (por ejemplo, reglamento de IA de la UE).
- Contexto: la longitud de contexto no esta documentada en este repositorio; conviene verificar la del modelo base Qwen3-8B antes de disenar aplicaciones con ventanas largas.
- Cuantizaciones de baja precision (Q2_K, Q3_K_S): el propio autor advierte de perdida de calidad; no aptas para tareas que requieran razonamiento fino.
- Repositorio con pocas descargas (190) y un solo like en el momento de la consulta: menor validacion comunitaria que otras variantes.
- El modelo base en transformers no se incluye en este repositorio; para fine-tuning hay que acudir al repositorio de lefantom00.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3-8B-abliterated-iSMART-GGUF
- Modelo base: https://huggingface.co/lefantom00/Qwen3-8B-abliterated-iSMART
- Cuantizaciones imatrix (i1-GGUF): https://huggingface.co/mradermacher/Qwen3-8B-abliterated-iSMART-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#Qwen3-8B-abliterated-iSMART-GGUF
- Guia de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
