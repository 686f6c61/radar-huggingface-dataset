# mradermacher/LlamaScientific-8B-GGUF

## Resumen

LlamaScientific-8B-GGUF es la distribucion en formato GGUF del modelo Rumiii/LlamaScientific-8B, un ajuste fino de la familia Llama 3.1 con 8.030.261.312 parametros (8,03 B) especializado en dominios cientificos. El modelo original fue entrenado con SFT sobre el dataset nvidia/Nemotron-SFT-Science-v2 y esta etiquetado por el autor como apto para tool use y function calling en fisica, quimica y biologia. Esta version la publica mradermacher, un conocido cuantizador de la comunidad de HuggingFace, que genera los ficheros GGUF estaticos a partir de los pesos del modelo base.

La relevancia practica de esta ficha es concreta: permite ejecutar un modelo afinado en ciencia en hardware de consumo mediante llama.cpp, Ollama o LM Studio, sin necesidad de GPU de datacenter. El repositorio incluye 12 variantes de cuantizacion entre 3,3 GB (Q2_K) y 16,2 GB (f16), lo que cubre desde equipos con 6-8 GB de VRAM hasta estaciones con GPU de 24 GB.

Conviene senalar que se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados ni model card detallada mas alla de la informacion de cuantizacion. Es, por tanto, un modelo para evaluar con cautela y validacion propia, no una opcion con trayectoria de uso contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con ajuste fino supervisado (SFT) sobre el modelo base |
| Parametros totales | 8.030.261.312 (8,03 B), dato de safetensors del modelo base |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base de la familia Llama 3.1 soporta 128.000 tokens, pero el autor no confirma el contexto efectivo tras el ajuste |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) unicamente, segun el campo `language` de la model card |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base Rumiii/LlamaScientific-8B |

Datos adicionales del repositorio: tamano total de 71,8 GB, creado el 24 de octubre de 2026 (fecha declarada en HuggingFace), libreria `transformers`, pipeline no disponible, etiqueta `endpoints_compatible`. No se publican cuantizaciones ponderadas con imatrix; el autor indica que podrian no estar disponibles y que se soliciten via Community Discussion.

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only denso de la familia Llama 3.1, con 8,03 B de parametros. El proceso declarado es un ajuste fino supervisado (SFT) partiendo de Rumiii/LlamaScientific-8B, que a su vez se entrena sobre nvidia/Nemotron-SFT-Science-v2, un dataset de instrucciones cientificas. La model card menciona el uso de Unsloth en el pipeline de entrenamiento (tag `unsloth`) y no documenta fases de RLHF, DPO ni preference tuning; tampoco se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni la receta de hiperparametros.

En esta publicacion, mradermacher no reentrena el modelo: solo convierte los pesos a GGUF y genera cuantizaciones estaticas. La model card del repositorio GGUF indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversion desde pesos en formato HuggingFace. No hay innovaciones arquitectonicas propias (ni atencion lineal, ni decodificacion especulativa, ni mezcla de expertos): el valor anadido esta en el ajuste de dominio cientifico y en la disponibilidad de cuantizaciones para inferencia local.

## Capacidades

- Generacion de texto conversacional en ingles, con foco declarado en contenido cientifico: fisica, quimica y biologia (tags del repositorio).
- Tool use y function calling: el autor etiqueta explicitamente el modelo con `tool-use` y `function-calling`, lo que permite integrarlo en flujos que requieran llamadas estructuradas a funciones externas.
- Razonamiento de varios pasos sobre problemas cientificos, derivado del entrenamiento SFT con instrucciones del dataset Nemotron-SFT-Science-v2 (sin datos publicados sobre la profundidad de razonamiento efectiva).
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints estandar de inferencia (tag `endpoints_compatible`), lo que facilita su despliegue en servidores compatibles con la API de HuggingFace/OpenAI.
- Capacidades no disponibles: no hay soporte declarado de vision, audio, ni modo "thinking" explicito. El modelo es solo texto.
- Multilingue: limitado a ingles; no se declara soporte de castellano ni de otros idiomas.

## Casos de uso

- Asistencia a estudiantes de ciencias en local: desplegado con Ollama en un portatil con GPU de 8 GB (Q4_K_M, 5,0 GB), el modelo puede responder dudas de fisica, quimica y biologia sin enviar datos a la nube, util en entornos educativos con requisitos de privacidad.
- Extraccion estructurada de datos de articulos cientificos: usando tool calling para invocar una funcion que devuelva JSON con magnitudes, unidades y compuestos quimicos detectados en un abstract, integrado en un pipeline de procesamiento documental.
- Preprocesado y clasificacion de literatura en laboratorios: etiquetado de resumenes por disciplina (fisica/quimica/biologia) y por tipo de estudio, con la ventaja de que el modelo cabe en una unica GPU consumer y el coste marginal por token es nulo tras el despliegue.
- Prototipado de asistentes de laboratorio sin conexion: entornos de investigacion con redes aisladas (air-gapped) donde no se permite el acceso a APIs comerciales; el formato GGUF y llama.cpp permiten ejecucion totalmente offline.
- Generacion de explicaciones divulgativas: redaccion de explicaciones de conceptos cientificos en ingles para blogs o material docente, con cuantizacion Q6_K o Q8_0 para preservar calidad.
- Base para ajuste fino adicional en dominio: al estar disponible en safetensors el modelo original Rumiii/LlamaScientific-8B, se puede usar como punto de partida para SFT con LoRA sobre un corpus cientifico propio (por ejemplo, normativa de laboratorio o guias clinicas), y luego cuantizar a GGUF para despliegue.
- Evaluacion comparativa de modelos cientificos pequenos: banco de pruebas para medir cuanto aporta un SFT de dominio frente a Llama 3.1 8B Instruct sin ajustar en tareas de ciencia, usando la version Q8_0 (8,6 GB) para minimizar el ruido de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K, GPQA ni ninguna otra metrica; el repositorio acumula 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros referenciadas. Cualquier cifra de rendimiento para este modelo requeriria una evaluacion propia.

## Requisitos de hardware

- VRAM estimada: el peso de los ficheros es 3,3 GB (Q2_K), 4,8-5,0 GB (Q4_K_S/Q4_K_M), 5,7-5,8 GB (Q5), 6,7 GB (Q6_K), 8,6 GB (Q8_0) y 16,2 GB (f16). A esa cifra hay que sumar la cache KV y el overhead del runtime, aproximadamente 1-3 GB segun la longitud de contexto configurada.
- GPU consumer: Q2_K a Q4_K_M caben en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) con contexto moderado. Q5 y Q6_K requieren 8-12 GB (RTX 4060 Ti 16 GB, RTX 3080 12 GB, RTX 4070). Q8_0 y f16 encajan en 12-24 GB (RTX 4070 Ti Super, RTX 4090, RTX 3090).
- GPU de datacenter: A100 40/80 GB, H100 y L40S ejecutan sin problema f16 con contexto largo, aunque estan sobredimensionadas para un modelo de 8 B.
- Despliegue: llama.cpp (cli y llama-cpp-python), Ollama, LM Studio, llama.cpp server con API compatible OpenAI, y vLLM/TGI si se parte de los pesos safetensors del modelo base en lugar de los GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| LlamaScientific-8B (este, GGUF) | 8,03 B | no disponible en la model card (base Llama 3.1: 128.000 tokens) | Llama 3.1 Community | GGUF (12 cuantizaciones) y safetensors en el modelo base | SFT en ciencia, tool calling declarado, 0 descargas, sin benchmarks |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community | safetensors, GGUF (multiples cuantizadores) | Modelo generalista de referencia; sin especializacion cientifica declarada, pero con ecosistema y evaluaciones publicas amplias |
| Qwen2.5 7B Instruct | 7,6 B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Licencia permisiva sin restricciones de escala, buen rendimiento en codigo y matematicas segun su documentacion publica |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.000 tokens | Apache 2.0 | safetensors, GGUF | Alternativa ligera con licencia permisiva; sin especializacion cientifica |

Nota: los datos de contexto y licencia de los modelos comparados provienen de su documentacion publica; no se dispone de comparaciones de rendimiento entre LlamaScientific-8B y estas alternativas porque el modelo no publica benchmarks.

## Limitaciones y advertencias

- Solo ingles: el campo `language` de la model card declara unicamente `en`. El rendimiento en castellano no esta evaluado y previsiblemente sera inferior.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en tareas cientificas, tool calling ni generacion general. Un SFT de dominio sobre un dataset sintetico (Nemotron-SFT-Science-v2) puede degradar capacidades generales por olvido catastrofico, y no hay datos para descartarlo.
- Riesgo de alucinacion cientifica: en dominios como quimica o biologia, una respuesta incorrecta con formato plausible (formulas, dosis, reacciones) puede ser especialmente peligrosa. No debe usarse como fuente de verdad sin verificacion humana.
- Cuantizaciones agresivas: Q2_K y Q3_K_S reducen la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio. Para uso cientifico conviene Q6_K o Q8_0.
- Licencia Llama 3.1 Community: permite uso comercial con condiciones (atribucion, denominacion "Llama", politica de uso aceptable) y mantiene la clausula de revocacion para productos con mas de 700 millones de usuarios activos mensuales. No es una licencia Apache o MIT.
- Repositorio sin traccion: 0 descargas y 0 likes implican ausencia de validacion comunitaria, posibles erratas no detectadas y riesgo de que el autor deje de mantenerlo.
- Sin soporte multimodal ni modo de razonamiento explicito: no apto para tareas de vision, audio o analisis de imagenes cientificas.
- Fecha de creacion declarada en 2026: conviene verificar la procedencia y la cadena de custodia del modelo (base, dataset y proceso de cuantizacion) antes de usarlo en produccion.
- No hay cuantizaciones ponderadas con imatrix: las cuantizaciones IQ disponibles se limitan a IQ4_XS, lo que limita las opciones de optimizacion fina de calidad por bit.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LlamaScientific-8B-GGUF
- Modelo base: https://huggingface.co/Rumiii/LlamaScientific-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Science-v2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LlamaScientific-8B-GGUF
- Politica de peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de calidad de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
