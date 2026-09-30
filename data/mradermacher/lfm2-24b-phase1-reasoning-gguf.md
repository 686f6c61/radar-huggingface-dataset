# mradermacher/lfm2-24b-phase1-reasoning-GGUF

## Resumen

lfm2-24b-phase1-reasoning-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por mradermacher a partir del modelo shuff57/lfm2-24b-phase1-reasoning. No se trata por tanto de un modelo entrenado por el autor del repositorio, sino de una conversion a GGUF (cuantizacion estatica) pensada para su ejecucion en llama.cpp, Ollama y otros motores compatibles. El modelo subyacente tiene 23.843.661.440 parametros (unos 23,8 mil millones) y los tags del repositorio indican arquitectura lfm2_moe, es decir, una mezcla de expertos (MoE) de la familia LFM2 de Liquid AI.

El ajuste fino del que deriva se ha realizado, segun los metadatos, con LoRA sobre el dataset shuff57/ogre-phase1-synth, y esta etiquetado como orientado a razonamiento ("reasoning", "ogre", "phase1"). La nomenclatura "phase1" sugiere una primera etapa de un pipeline de entrenamiento por fases, aunque la informacion disponible no detalla cuantas fases existen ni si el proceso esta completo. El repositorio esta etiquetado como conversacional y soporta unicamente ingles.

Su relevancia practica es doble: por un lado, permite desplegar un modelo MoE de ~24B en hardware de consumo gracias a cuantizaciones que van de 8,8 GB (Q2_K) a 25,5 GB (Q8_0); por otro, la licencia Apache 2.0 del repositorio facilita el uso comercial, siempre que se verifiquen las condiciones del modelo base y del dataset. El repo ocupa 132 GB en total y, en el momento de la consulta, acumula 0 descargas y 1 like, por lo que carece de validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_moe (mezcla de expertos) segun los tags del repositorio; no se detalla en la informacion disponible |
| Parametros totales | 23.843.661.440 (~23,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (8,8 GB), Q3_K_S (10,4 GB), Q3_K_M (11,5 GB), Q3_K_L (12,4 GB), Q4_K_S (13,6 GB), Q6_K (19,7 GB), Q8_0 (25,5 GB). Los comentarios de la model card mencionan ademas x-f16, Q4_K_M, Q5_K_S, Q5_K_M e IQ4_XS, pero no aparecen en la tabla de ficheros publicados |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base esta en formato transformers |

## Arquitectura y entrenamiento

El tag principal del repositorio es lfm2_moe, lo que situa al modelo dentro de la familia Liquid Foundation Models v2 (LFM2) de Liquid AI, disenada originalmente para inferencia en el borde y despliegue on-device. La familia oficial documentada en transformers y en el informe tecnico de LFM2 incluye variantes de 350M, 700M, 1.2B y 2.6B parametros; este repositorio parte de un modelo de ~24B, muy por encima de esas tallas, y el repo hermano mradermacher/LFM2-24B-A2B-GGUF sugiere la existencia de una variante "24B-A2B" (posiblemente con unos 2B de parametros activos), aunque ese dato no se confirma para el modelo aqui descrito. No se dispone de informacion verificada sobre el numero de expertos, el ratio de activacion ni el mecanismo de atencion concreto.

En cuanto al entrenamiento, los tags indican el uso de LoRA (con soporte de unsloth) sobre el dataset sintetico shuff57/ogre-phase1-synth, orientado a razonamiento. No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases posteriores ni el uso de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documentan innovaciones tecnicas propias de este ajuste fino. Todo lo relativo a la arquitectura interna y al preentrenamiento debe remitirse al informe tecnico de la familia LFM2 (arXiv 2511.23404), que cubre los modelos oficiales y no necesariamente esta variante.

## Capacidades

- Generacion de texto en ingles, con licencia Apache 2.0.
- Razonamiento: el modelo esta etiquetado explicitamente como "reasoning" y el ajuste se ha realizado sobre un dataset sintetico orientado a esa tarea.
- Uso conversacional: el repositorio incluye el tag "conversational" y esta preparado para text-generation-inference.
- Inferencia local mediante GGUF en llama.cpp, Ollama y motores compatibles.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no hay informacion sobre otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el etiquetado como modelo de razonamiento lo hace plausible; no hay confirmacion documental.
- Vision, audio o modalidades adicionales: no disponible.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente de razonamiento en local: con la cuantizacion Q4_K_S (13,6 GB, marcada por el autor como "fast, recommended") el modelo cabe en una GPU de 16-24 GB, lo que permite montar un asistente de razonamiento en ingles sin depender de APIs externas ni enviar datos a terceros.
- Procesamiento offline de documentacion tecnica en ingles: el caracter local y la licencia Apache 2.0 lo hacen adecuado para pipelines por lotes sobre textos sensibles (informes internos, documentacion legal) donde no se permite la salida de datos.
- Prototipado de agentes conversacionales en ingles: el tag "conversational" y el formato GGUF permiten levantar rapidamente un endpoint con llama.cpp u Ollama para validar flujos de dialogo antes de invertir en infraestructura.
- Evaluacion comparativa de cuantizaciones: dado que el repositorio publica siete niveles de cuantizacion (de Q2_K a Q8_0), es un candidato util para medir la degradacion de calidad en tareas de razonamiento segun el nivel de compresion, usando la grafica de perplejidad enlazada por el autor como referencia.
- Base para ajustes finos adicionales: al estar bajo Apache 2.0 y derivar de un ajuste LoRA, puede servir como punto de partida para especializaciones en dominios concretos (soporte tecnico, analisis financiero) siempre que se verifiquen las condiciones del modelo original.
- Despliegue en servidores con GPUs de 24-48 GB: la version Q8_0 (25,5 GB) o Q6_K (19,7 GB) permite servir el modelo con mayor fidelidad en una RTX 3090/4090 de 24 GB o en una A100 40 GB, integrable con text-generation-inference gracias al tag correspondiente.
- Investigacion sobre modelos MoE de gran tamano en hardware modesto: la existencia de cuantizaciones de 8,8 GB facilita experimentar con un MoE de ~24B en GPUs de 12 GB, algo inviable con los pesos originales en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe tecnico de la familia LFM2 (arXiv 2511.23404) evalua los modelos oficiales en IFEval, IFBench, Multi-IF, GSM8K, GSMPlus, MATH 500 y MGSM, pero no se proporcionan cifras concretas para esta variante de 24B ni para el ajuste fino de razonamiento, por lo que no es posible presentar una tabla comparativa sin inventar datos.

## Requisitos de hardware

Los tamanos que se indican a continuacion corresponden a los ficheros GGUF publicados en el repositorio y son, por tanto, datos reales; la VRAM necesaria es una estimacion que anade margen para el contexto y el runtime.

- Q2_K (8,8 GB): viable en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070). El autor advierte de que los cuantos de 2 bits degradan la calidad.
- Q3_K_S (10,4 GB), Q3_K_M (11,5 GB) y Q3_K_L (12,4 GB): encajan en 12-16 GB; Q3_K_M esta marcado por el autor como "lower quality".
- Q4_K_S (13,6 GB): marcado como "fast, recommended". Requiere 16-24 GB (RTX 4080, RTX 4090, RTX 3090).
- Q6_K (19,7 GB): "very good quality". Necesita 24 GB (RTX 3090, RTX 4090) o 32 GB.
- Q8_0 (25,5 GB): "fast, best quality". Requiere 32-48 GB (A6000, A100 40 GB, o dos GPUs de 24 GB).
- Pesos originales en FP16: aproximadamente 47,7 GB (estimacion derivada de 23,84 B de parametros a 2 bytes), lo que exige una A100 80 GB o varias GPUs.
- Cabe en GPU de consumo: si, en las cuantizaciones Q2_K a Q6_K, con GPUs de 12 a 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y TGI (el repositorio incluye el tag text-generation-inference). El soporte de vLLM con GGUF es limitado y no se documenta aqui.
- Latencia y throughput estimados: no disponibles.
- Nota: el autor indica que las cuantizaciones ponderadas/imatrix no estan disponibles actualmente para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/lfm2-24b-phase1-reasoning-GGUF (este) | 23,8 B | no disponible | GGUF (7 cuantos, 8,8-25,5 GB) | apache-2.0 | Cuantizacion de un ajuste LoRA de razonamiento; 0 descargas, sin benchmarks |
| shuff57/lfm2-24b-phase1-reasoning | 23,8 B | no disponible | transformers (safetensors) | no disponible en la informacion proporcionada | Modelo base del que deriva este repositorio |
| mradermacher/LFM2-24B-A2B-GGUF | ~24 B (A2B) | no disponible | GGUF | no disponible | Variante "A2B" del mismo cuantizador; no se confirma si comparte arquitectura y activacion con el modelo analizado |
| LFM2 oficial de Liquid AI (350M, 700M, 1.2B, 2.6B) | 0,35-2,6 B | no disponible | transformers / GGUF | no disponible | Familia base disenada para edge AI; tallas muy inferiores a las 24 B de este modelo |

La comparacion cuantitativa de rendimiento no es posible porque no hay resultados de benchmarks publicados para el modelo analizado ni cifras concretas en la informacion disponible para los alternativas.

## Limitaciones y advertencias

- Idioma: el repositorio declara unicamente ingles; no hay evidencia de soporte multilingue en este ajuste fino.
- Ausencia total de benchmarks: no se ha publicado ninguna evaluacion (MMLU, GSM8K, HumanEval u otras), por lo que no es posible estimar la calidad real del modelo ni su tasa de alucinacion.
- Riesgo de alucinacion no cuantificado: al ser un ajuste fino de razonamiento sobre un dataset sintetico (shuff57/ogre-phase1-synth) sin documentacion publica, se desconoce la calidad y la cobertura de los datos de entrenamiento.
- Modelo comunitario de fase 1: el nombre "phase1" indica que podria tratarse de una etapa intermedia de un pipeline de entrenamiento, sin garantia de que existan fases posteriores o de que el ajuste este finalizado.
- Escasa validacion social: 0 descargas y 1 like en el momento de la consulta; no hay retroalimentacion de usuarios que respalde su comportamiento en produccion.
- Cuantizaciones de baja calidad: el propio autor senala Q3_K_M como "lower quality"; los cuantos de 2 y 3 bits pueden degradar de forma notable las tareas de razonamiento.
- Sin cuantizaciones ponderadas/imatrix: el autor indica que no estan disponibles, lo que limita las opciones de optimizacion de calidad por bit.
- Inconsistencia en los tipos publicados: los comentarios de la model card mencionan x-f16, Q4_K_M, Q5_K_S, Q5_K_M e IQ4_XS, pero la tabla de ficheros solo enlaza siete cuantizaciones (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q6_K, Q8_0). Conviene verificar los ficheros antes de asumir su disponibilidad.
- Licencia: el repositorio es Apache 2.0, pero se desconoce la licencia del modelo base (shuff57/lfm2-24b-phase1-reasoning) y del dataset, por lo que el uso comercial exige comprobar esas condiciones antes de desplegarlo.
- Parametros activos desconocidos: al no confirmarse el numero de parametros activos del MoE, no se puede estimar con precision el coste de inferencia real mas alla del tamano del fichero.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/lfm2-24b-phase1-reasoning-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#lfm2-24b-phase1-reasoning-GGUF
- Modelo base: https://huggingface.co/shuff57/lfm2-24b-phase1-reasoning
- Dataset de entrenamiento: https://huggingface.co/datasets/shuff57/ogre-phase1-synth
- Repositorio hermano (variante A2B): https://huggingface.co/mradermacher/LFM2-24B-A2B-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Blog de Liquid AI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Documentacion de LFM2 en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/lfm2.md
- Informe tecnico de LFM2: https://arxiv.org/html/2511.23404v1
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
