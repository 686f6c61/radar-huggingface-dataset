# liodon-ai/Minico-M1-1105-FP8

## Resumen

Minico-M1-1105-FP8 es una cuantizacion en FP8 dinamico del modelo Minico-M1-1105, publicado por el usuario liodon-ai en Hugging Face. Se trata de un modelo de generacion de texto de tipo transformer con arquitectura LFM2 (segun los tags del repositorio), con 354.483.968 parametros totales segun los pesos en safetensors y un tamano de repositorio de 0,4 GB. El modelo original, Mincofficial/Minico-M1-1105, ha sido cuantizado con la herramienta llm-compressor usando el esquema FP8_DYNAMIC.

La relevancia de esta ficha radica en que se trata de una cuantizacion reciente (publicada en noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto practicamente sin adopcion ni validacion por parte de la comunidad. La informacion disponible es muy limitada: no hay datos sobre el dataset de entrenamiento, benchmarks, idiomas soportados ni detalles de la arquitectura mas alla del tag "lfm2".

El interes tecnico principal es el esquema de cuantizacion: pesos en FP8 (E4M3) por canal y activaciones cuantizadas dinamicamente por token en inferencia, sin necesidad de dataset de calibracion. Esto reduce el tamano de 0,7 GB a 0,4 GB y permite ejecucion acelerada en GPUs NVIDIA con compute capability igual o superior a 8.9. Para el resto de caracteristicas del modelo base, la informacion no esta disponible en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag "lfm2"; detalles no disponibles) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (pesos E4M3 por canal, activaciones FP8 por token); lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura es el tag "lfm2" en el repositorio, que sugiere una arquitectura de la familia LFM2, pero no se proporcionan detalles sobre el tipo de atencion, el numero de capas, las dimensiones ocultas ni la composicion del entrenamiento. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La innovacion tecnica documentada se limita al proceso de cuantizacion: se aplico el esquema FP8_DYNAMIC mediante llm-compressor, con pesos convertidos a FP8 (E4M3) por canal de forma anticipada y activaciones cuantizadas dinamicamente por token durante la inferencia. Al no requerir dataset de calibracion, los pesos cuantizados son un casteo directo de los originales, sin sesgo introducido por el conjunto de calibracion. La capa lm_head se deja sin cuantizar por su impacto desproporcionado en la calidad frente a su tamano reducido.

## Capacidades

- Generacion de texto conversacional (pipeline_tag: text-generation; tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Ejecucion optimizada en vLLM, TGI y SGLang segun la model card.
- No se documentan capacidades de razonamiento avanzado, codigo, matematicas, vision, audio, tool calling ni agentes.
- No se documentan capacidades multilingues especificas.
- No se documenta modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Generacion de texto conversacional en prototipos: el modelo puede emplearse para construir demos de chatbot o asistentes conversacionales ligeros, dado su tamano reducido (0,4 GB) y su compatibilidad con vLLM y TGI.
- Despliegue en entornos con GPUs Ada o Hopper: al requerir compute capability 8.9 o superior para aprovechar FP8, encaja en infraestructuras con L4, L40S, H100 o RTX 40-series para servir respuestas de texto con menor huella de memoria.
- Pruebas de integracion en pipelines de inferencia: sirve como modelo de sustitucion en pipelines que ya usan vLLM, TGI o SGLang, ya que la model card documenta comandos de arranque para los tres servidores.
- Experimentacion con cuantizacion FP8: util como referencia practica para evaluar el impacto del esquema FP8_DYNAMIC sin calibracion en un modelo pequeno antes de aplicarlo a modelos mayores.
- Evaluacion comparativa de calidad tras cuantizacion: permite medir la degradacion respecto al modelo original Mincofficial/Minico-M1-1105 en tareas de generacion de texto, aunque no se publican metricas al respecto.
- Entornos de desarrollo con recursos limitados: su tamano de 0,4 GB facilita el despliegue en maquinas de desarrollo con una sola GPU consumer compatible (RTX 40-series) para pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 354 millones de parametros en FP8 (aproximadamente 0,35 GB de pesos) mas overhead de activaciones y KV cache, la huella deberia ser inferior a 1 GB, aunque no se confirma en la documentacion.
- GPU recomendadas para FP8: NVIDIA con compute capability igual o superior a 8.9, es decir, Ada, Hopper o Blackwell (RTX 40-series, L4, L40S, H100, H200, B100, B200, GB10).
- En GPUs anteriores a Ada, vLLM y TGI descomprimen a un tipo de mayor precision para ejecutar, perdiendo la ventaja de velocidad y memoria del FP8.
- Cabe en GPUs consumer de la serie RTX 40 en adelante; en generaciones anteriores funcionaria con dequantizacion.
- Opciones de despliegue documentadas: vLLM (`vllm serve`), Text Generation Inference (imagen Docker oficial) y SGLang (`sglang.launch_server`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minico-M1-1105-FP8 | 354.483.968 | no disponible | FP8 dinamico | other | Hugging Face (0 descargas) |
| Mincofficial/Minico-M1-1105 (base) | no disponible | no disponible | sin cuantizar (0,7 GB) | other | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La licencia es "other", sin texto de licencia detallado en la informacion disponible; es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni evaluaciones de calidad del modelo base ni de la version cuantizada.
- El modelo tiene cero descargas y cero likes, por lo que carece de validacion por parte de la comunidad.
- La cuantizacion FP8 puede introducir degradacion de calidad respecto al modelo original; no se publican metricas que la cuantifiquen.
- En GPUs con compute capability inferior a 8.9 se pierde el beneficio de FP8 y el modelo se ejecuta con dequantizacion, con mayor uso de memoria y menor velocidad.
- No se documentan idiomas soportados, longitud de contexto ni capacidades de tool calling, lo que limita su uso en produccion sin una evaluacion previa.
- El tag "endpoints_compatible" no garantiza el funcionamiento en Hugging Face Inference Endpoints sin verificacion adicional.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/liodon-ai/Minico-M1-1105-FP8
- Modelo base: https://huggingface.co/Mincofficial/Minico-M1-1105
- Perfil del autor de la cuantizacion: https://huggingface.co/liodon-ai
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
