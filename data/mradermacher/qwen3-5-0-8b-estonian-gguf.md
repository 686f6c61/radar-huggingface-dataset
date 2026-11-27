# mradermacher/Qwen3.5-0.8B-Estonian-GGUF

## Resumen

Qwen3.5-0.8B-Estonian-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo base Qwen3.5-0.8B-Estonian, publicado por el usuario 50gg. El modelo original es un ajuste fino de la familia Qwen3.5 (arquitectura transformer derivada de Qwen) especializado en el idioma estonio (codigo ISO `et`), orientado a tareas de resumen y conversacion. Con 752.393.024 parametros (aproximadamente 0,75 mil millones), se situa en la categoria de modelos pequenos disenados para inferencia en dispositivo.

El trabajo de cuantizacion lo realiza mradermacher, un conocido publicador de versiones GGUF de modelos open source, que genera variantes estaticas desde Q2_K hasta f16 para su uso con llama.cpp. El modelo esta etiquetado explicitamente para despliegue on-device, incluyendo Raspberry Pi, lo que lo posiciona como una opcion para entornos con recursos muy limitados donde no es viable ejecutar modelos de mayor tamano.

La relevancia de esta ficha radica en que cubre un nicho muy concreto: procesamiento de lenguaje natural en estonio con un modelo inferior a mil millones de parametros, empaquetado en cuantizaciones que ocupan desde 0,5 GB. La licencia Apache 2.0 facilita su adopcion comercial, aunque la informacion publicada sobre el entrenamiento, los datos y los benchmarks es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | estonio (et) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.5-0.8B-Estonian. Por el nombre y la familia a la que pertenece, se trata de un transformer decoder-only derivado de Qwen3.5, con aproximadamente 752 millones de parametros. El autor del modelo base (50gg) no publica en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La unica informacion tecnica concreta procede del proceso de cuantizacion: mradermacher indica que se usaron cuantizaciones estaticas (no ponderadas por imatrix) con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversion directa desde pesos Hugging Face a GGUF. No se han publicado cuantizaciones ponderadas por imatrix para este modelo en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en estonio.
- Resumen de documentos (pipeline declarado: `summarization`).
- Inferencia on-device en hardware de bajos recursos (etiqueta `raspberry-pi`).
- Compatibilidad con llama.cpp y ecosistema GGUF.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingues: limitadas al estonio segun la metadata (`language: et`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Resumen de noticias y articulos en estonio: el modelo esta etiquetado para `summarization` y su tamano permite ejecutarlo en local para condensar textos periodisticos sin enviar datos a la nube.
- Procesamiento de documentos en dispositivos edge: con cuantizaciones Q4_K_S de 0,6 GB puede desplegarse en Raspberry Pi o mini-PC para resumir correos, actas o informes en estonio.
- Asistente conversacional local en estonio: adecuado para chatbots de bajo consumo en aplicaciones de escritorio o moviles donde la privacidad impide usar APIs externas.
- Preprocesado de corpus estonios: generacion de resumenes o reformulaciones para pipelines de datos antes de indexacion o busqueda.
- Prototipado rapido de aplicaciones NLP en estonio: al ser Apache 2.0 y caber en 0,5-0,9 GB, permite iterar en portatiles sin GPU dedicada.
- Educacion y demostraciones: modelo ligero para ensenar conceptos de cuantizacion y despliegue de LLM en cursos o talleres con hardware modesto.
- Filtrado y clasificacion ligera de texto estonio en entornos con restricciones de latencia y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q2_K, 0,6 GB con Q4_K_S/IQ4_XS/Q4_K_M, 0,7 GB con Q5/Q6_K, 0,9 GB con Q8_0 y 1,6 GB con f16 (los tamanos de archivo son una cota superior razonable del uso de memoria, mas overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en iGPU.
- Despliegue: llama.cpp, Ollama (mediante importacion del GGUF), y servidores compatibles con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en tiempo real en CPU moderna con cuantizaciones Q4, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Estonian (este) | 752 M | no disponible | et | Apache 2.0 | GGUF / safetensors |
| Qwen2.5-0.5B | ~494 M | 32 768 (segun ficha oficial de Qwen2.5) | multilingue | Apache 2.0 | safetensors / GGUF |
| Qwen2.5-1.5B | ~1,5 B | 32 768 (segun ficha oficial de Qwen2.5) | multilingue | Apache 2.0 | safetensors / GGUF |
| TinyLlama-1.1B | ~1,1 B | 2 048 | ingles principalmente | Apache 2.0 | safetensors / GGUF |

La comparativa con Qwen2.5 se basa en datos publicos de esa familia; el contexto y el rendimiento del modelo estonio no estan documentados, por lo que la comparacion es estructural (tamano y licencia), no de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste fino sobre Qwen3.5 con foco en estonio, puede heredar sesgos del modelo base y de los datos de ajuste, no publicados.
- Riesgo de alucinacion: alto en modelos de este tamano, especialmente en tareas de resumen donde puede introducir datos no presentes en el texto fuente; requiere validacion en produccion.
- Limitaciones de contexto: la longitud de contexto no esta disponible; no debe asumirse que soporte ventanas largas.
- Limitaciones de idioma: el modelo esta etiquetado unicamente para estonio; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Qwen3.5 subyacente.
- Caveats de produccion: no hay benchmarks publicados, el modelo tiene 0 descargas y 0 likes en el momento de la ficha, y las cuantizaciones son estaticas (sin imatrix), lo que puede degradar la calidad en Q2_K y Q3 en comparacion con cuantizaciones ponderadas.
- El repo ocupa 7,5 GB por incluir todas las variantes; descargar solo el archivo GGUF necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Estonian-GGUF
- Modelo base: https://huggingface.co/50gg/Qwen3.5-0.8B-Estonian
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-0.8B-Estonian-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
