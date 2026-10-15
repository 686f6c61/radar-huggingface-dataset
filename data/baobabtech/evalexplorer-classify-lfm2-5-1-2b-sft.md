# baobabtech/evalexplorer-classify-lfm2.5-1.2b-sft

## Resumen

evalexplorer-classify-lfm2.5-1.2b-sft es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario baobabtech sobre el modelo base unsloth/LFM2.5-1.2B-Instruct, de la familia Liquid Foundation Models. Su funcion es muy concreta: a partir de las primeras paginas de un informe de evaluacion de desarrollo internacional, genera un objeto JSON con cinco campos estructurados (evaluation_approach, evaluation_type, temporality, themes y countries). No es un modelo conversacional de proposito general, sino un componente de extraccion de metadatos dentro de una canalizacion de ingesta documental.

El modelo resuelve el problema de normalizar y etiquetar automaticamente documentacion de evaluacion heterogenea, algo relevante para equipos que construyen repositorios, bases de datos o indices de busqueda sobre literatura de cooperacion y desarrollo. Con 1.2B parametros efectivos en el modelo base y un adaptador LoRA de rango 16, esta pensado para ejecutarse en hardware modesto y completar la clasificacion en pocos segundos.

Es importante senalar que se trata de un modelo exploratorio: fue entrenado y evaluado contra las etiquetas automaticas de la canalizacion de ingesta de EvalExplorer, que no han sido revisadas por personas, por lo que sus metricas miden acuerdo con esa canalizacion y no correccion absoluta. El propio autor indica que la version siguiente se entrenara con etiquetas de un modelo independiente (GLM-5.3-Flash).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre el modelo base unsloth/LFM2.5-1.2B-Instruct; arquitectura interna del base no detallada en la informacion proporcionada |
| Parametros totales | 1.2B en el modelo base; adaptador LoRA con r=16 y alpha=16 |
| Longitud de contexto | 8192 tokens en el ejemplo oficial de carga; limite maximo del modelo base no disponible |
| Tipos de cuantizacion | Adaptador en bf16 (safetensors); el ejemplo de uso contempla cargar el base con load_in_4bit |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (declarada como license: other) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador PEFT de tipo LoRA, no un modelo completo. El ajuste se aplico sobre todas las capas lineales del lenguaje del modelo base, con rango r=16, alpha=16, precision bf16, tasa de aprendizaje 0.0002, 2 epocas y un tamano de lote efectivo de 2 x 8 (batch 2 con 8 pasos de acumulacion). La perdida se calculo unicamente sobre la respuesta (loss on the answer only), lo que concentra el aprendizaje en la generacion del JSON de salida. El entrenamiento completo se ejecuto en GPU en aproximadamente 8.5 minutos. No se especifica en la informacion disponible si hubo fases adicionales de RLHF o DPO.

Los datos de entrenamiento provienen del conjunto baobabtech/evalexplorer-data, configuracion classify_codes, con 1148 documentos de entrenamiento. En inferencia se emplea decodificacion voraz (greedy decoding) con el modo de razonamiento desactivado (thinking off). La tarea es una clasificacion multi-campo con estructura fija: campos de codigo unico (evaluation_approach, evaluation_type, temporality) y campos de lista (themes, countries).

## Capacidades

- Clasificacion de documentos: extrae cinco campos estructurados de las primeras paginas de un informe de evaluacion de desarrollo internacional.
- Salida en JSON estructurado: el modelo produce un objeto con evaluation_approach, evaluation_type, temporality, themes y countries.
- Clasificacion de codigo unico: predice una unica categoria para evaluation_approach, evaluation_type y temporality.
- Extraccion de listas: genera listas de temas (themes) y paises (countries) con normalizacion de codigos.
- Modo de razonamiento desactivable: el ejemplo de uso especifica enable_thinking=False para inferencia directa.
- Integracion como adaptador PEFT: se carga sobre el base con PeftModel.from_pretrained y se activa con for_inference.
- Soporte de cuantizacion del base: el ejemplo oficial permite cargar el modelo base en 4 bits.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Clasificacion automatica de informes de evaluacion: ingerir las primeras paginas de un informe y obtener un JSON con enfoque, tipo, temporalidad, temas y paises, que es exactamente la tarea para la que fue ajustado el adaptador.
- Enriquecimiento de metadatos en repositorios documentales: poblar automaticamente campos de catalogo en bibliotecas digitales de cooperacion y desarrollo sin intervencion manual campo a campo.
- Canalizaciones ETL de ingesta: integrar el clasificador como paso de extraccion dentro de un pipeline que normaliza documentos antes de almacenarlos en una base de datos estructurada.
- Indexacion y busqueda facetada: generar etiquetas de tema y pais antes de indexar, de modo que los buscadores internos puedan filtrar por esos campos de forma precisa.
- Analisis agregado y seguimiento de tendencias: acumular los campos extraidos para construir cuadros de mando por pais, tema o enfoque de evaluacion a lo largo del tiempo.
- Revision asistida por humanos (human-in-the-loop): precargar los cinco campos para que un revisor los confirme o corrija, reduciendo el tiempo de etiquetado manual.
- Clasificacion de grandes volumenes en hardware modesto: al apoyarse en un base de 1.2B y un LoRA, permite procesar lotes de documentos en una sola GPU de gama media.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de prueba de 134 documentos, con decodificacion voraz y thinking off:

| Metrica | Test (134 documentos) |
|---|---|
| JSON valido | 1.000 |
| Exact match (los cinco campos) | 0.149 |
| Puntuacion media por campo (mean field score) | 0.802 |
| Exactitud en evaluation_approach | 0.761 |
| Exactitud en evaluation_type | 0.836 |
| Exactitud en temporality | 0.761 |
| Micro F1 en themes | 0.776 |
| Micro F1 en countries | 0.808 |

Advertencia del propio autor: el modelo fue entrenado y evaluado contra las etiquetas LLM de la canalizacion de ingesta de EvalExplorer, que ninguna persona ha revisado, por lo que estas cifras miden el acuerdo con esa canalizacion, no la correccion real. El informe de la ejecucion tambien puntua las mismas respuestas contra un reetiquetado independiente con GLM-5.3-Flash que el modelo nunca vio. La puntuacion media por campo es la media por documento de las cinco puntuaciones de campo (1/0 para los campos de codigo unico y F1 para las listas).

## Requisitos de hardware

- VRAM estimada: en bf16 el modelo base de 1.2B ocupa aproximadamente 2.4 GB solo en pesos; con estados de activacion y cache de contexto conviene reservar del orden de 4 a 6 GB. En carga de 4 bits los pesos bajan a alrededor de 1 GB. El adaptador LoRA anade un consumo marginal.
- GPU recomendadas: cualquier GPU moderna con 8 GB o mas de VRAM es suficiente, incluidas RTX 3060, RTX 4060, RTX 4070 y RTX 4090. En el extremo profesional, A100 o H100 quedan sobredimensionadas para este tamano y solo se justifican para procesamiento masivo por lotes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de consumo. El ejemplo oficial incluso contempla load_in_4bit para reducir aun mas el consumo.
- Opciones de despliegue: el flujo documentado usa unsloth (FastLanguageModel) junto con peft para cargar el adaptador sobre el base. Al ser un adaptador PEFT, tambien puede combinarse con servidores de inferencia compatibles con el base, aunque la informacion disponible no detalla configuraciones para vLLM, llama.cpp, Ollama o TGI ni confirma la existencia de pesos GGUF.
- Latencia y throughput: no se han publicado datos de latencia ni de tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evalexplorer-classify-lfm2.5-1.2b-sft | 1.2B (base) + LoRA r=16 | 8192 tokens en el ejemplo | Clasificacion JSON de informes de evaluacion | lfm1.0 | Adaptador PEFT en HuggingFace |
| unsloth/LFM2.5-1.2B-Instruct (base) | 1.2B | no disponible | Instrucciones generales | lfm1.0 | Pesos en HuggingFace |
| Otros clasificadores especializados de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados comparativos con otros modelos de clasificacion de la misma categoria.

## Limitaciones y advertencias

- Las metricas se calculan contra etiquetas LLM no revisadas por personas: miden acuerdo con la canalizacion de EvalExplorer, no correccion objetiva.
- El exact match con los cinco campos correctos simultaneamente es bajo (0.149), por lo que en la practica habra que asumir que rara vez acierta todos los campos a la vez.
- Modelo exploratorio: el propio autor anuncia que la siguiente version se entrenara sobre etiquetas de un modelo independiente (GLM-5.3-Flash), lo que sugiere que esta version no es la definitiva.
- Tamano de datos reducido: solo 1148 documentos de entrenamiento, lo que limita la cobertura de casos poco frecuentes.
- Riesgo de alucinacion: al generar campos de lista (themes, countries) puede inventar codigos no presentes en el documento; conviene validar contra catalogos cerrados.
- Sesgos: no se documentan analisis de sesgo; al entrenarse sobre un corpus concreto de evaluacion de desarrollo internacional puede heredar sesgos de ese dominio y de la canalizacion que genero las etiquetas.
- Cobertura de idiomas no disponible: no se especifica en que idiomas funciona ni si generaliza fuera del idioma de los documentos de entrenamiento.
- Licencia lfm1.0 (license: other): es una licencia especifica de Liquid con posibles restricciones para uso comercial; conviene revisar el texto completo antes de desplegar en produccion.
- Sin validacion comunitaria: el repositorio presenta 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia externa de calidad mas alla del informe del autor.
- Inferencia sin modo de razonamiento: el ejemplo desactiva thinking, de modo que el modelo no se apoya en cadenas de razonamiento explicitas para decidir los campos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baobabtech/evalexplorer-classify-lfm2.5-1.2b-sft
- Modelo base: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Licencia del modelo base: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/baobabtech/evalexplorer-data
- Conjunto de experimentos de clasificacion: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments
- Informe de la ejecucion (test): https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/blob/main/runs/lfm2.5-1.2b-sft--test/README.md
- Codigo del experimento: https://huggingface.co/datasets/baobabtech/evalexplorer-classify-experiments/tree/main/code
