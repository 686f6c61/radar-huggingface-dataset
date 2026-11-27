# mradermacher/liberalis-cogitator-llama-3.1-8b-GGUF

## Resumen

El modelo `liberalis-cogitator-llama-3.1-8b-GGUF` es una cuantizacion en formato GGUF del modelo base `Locutusque/liberalis-cogitator-llama-3.1-8b`, publicada por el usuario mradermacher. Se trata, por tanto, de un artefacto de distribucion para inferencia local y no de un modelo entrenado desde cero: el trabajo de mradermacher consiste en convertir los pesos originales en safetensors a una bateria de cuantizaciones GGUF compatibles con llama.cpp y derivados. El modelo subyacente es un fine-tuning de Llama 3.1 8B, con 8.030.261.312 parametros, orientado a conversacion y con licencia Llama 3.1.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 8B en hardware de consumo con cuantizaciones que van desde 3,3 GB (Q2_K) hasta 16,2 GB (f16), pasando por las recomendadas Q4_K_M (5,0 GB) y Q8_0 (8,6 GB). El repositorio incluye ademas una variante con imatrix en un repositorio separado (`liberalis-cogitator-llama-3.1-8b-i1-GGUF`), que suele ofrecer mejor calidad por bit en tamanos bajos.

No se dispone de informacion publicada sobre el dataset de entrenamiento del modelo base, sus benchmarks ni sus capacidades especificas mas alla de la etiqueta "conversational" y el idioma declarado (ingles). Esta ficha documenta lo que consta en la informacion disponible y marca explicitamente como "no disponible" todo lo que no se ha podido verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B; no se detalla en la model card del quant) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base es Llama 3.1, pero no se confirma en la card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (tambien disponible en safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Llama 3.1 8B, por lo que hereda la arquitectura transformer decoder-only de Meta, con atencion por grupos (GQA) y tokenizador BPE de Llama 3. La model card del quant no aporta detalles sobre el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, si hubo RLHF o DPO, ni hiperparametros). Tampoco se documenta la receta de fine-tuning aplicada por Locutusque sobre Llama 3.1 8B.

El trabajo especifico de este repositorio es la cuantizacion: mradermacher aplica cuantizacion estatica (marcada como `quantize_version: 2` y `output_tensor_quantised: 1` en la card) para generar los ficheros GGUF. Los quants con imatrix, que suelen preservar mejor la perplejidad a tamanos bajos, se publican aparte en `mradermacher/liberalis-cogitator-llama-3.1-8b-i1-GGUF`. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es "conversational" y el modelo esta pensado para dialogos multi-turno.
- Idiomas: unicamente ingles declarado; no se garantiza calidad en castellano ni en otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas o vision: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso con infraestructura de inferencia tipo Hugging Face Endpoints, aunque no se detalla.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (5,0 GB) el modelo cabe en GPUs de consumo de 8 GB o superiores, lo que permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Despliegue en estaciones de trabajo sin GPU dedicada: la variante Q2_K (3,3 GB) o Q3_K_S (3,8 GB) permite ejecucion en CPU con llama.cpp, adecuada para pruebas de integracion y demos internas.
- Evaluacion comparativa de fine-tunings de Llama 3.1: al ser un fine-tuning sobre la misma base, sirve para medir el efecto del ajuste de Locutusque frente al Llama 3.1 8B original en tareas conversacionales en ingles.
- Generacion de texto en pipelines offline: con Q8_0 (8,6 GB) se obtiene practicamente la calidad del modelo original para tareas de redaccion o resumen en ingles, sin dependencia de servicios externos.
- Investigacion sobre cuantizacion: el repositorio ofrece 12 variantes del mismo modelo, lo que permite estudiar el impacto de la cuantizacion en la calidad de salida con un modelo fijo.
- Base para experimentos de ajuste fino ligero: al estar disponible el modelo original en safetensors, se puede partir de el para LoRA/QLoRA y usar los GGUF como referencia de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,3 GB
  - Q3_K_M: ~4,1 GB
  - IQ4_XS: ~4,6 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8; A100/H100 solo si se busca throughput alto con f16 o Q8_0 y lotes grandes.
- Cabe en GPU de consumo: si, con Q4_K_M o inferiores en tarjetas de 8 GB; Q5_K_M y Q6_K requieren 8-12 GB; Q8_0 requiere 12 GB o mas; f16 requiere 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para safetensors, vLLM o TGI con el modelo base.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| liberalis-cogitator-llama-3.1-8b-GGUF (este) | 8,03 B | no disponible | llama3.1 | GGUF | Fine-tuning conversacional en ingles de Llama 3.1 8B |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128 K (segun documentacion de Meta) | llama3.1 | safetensors, GGUF | Modelo base de referencia; ampliamente soportado |
| Mistral 7B Instruct | 7,24 B | 32 K | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva |
| Qwen2.5 7B Instruct | 7,62 B | 128 K | Apache 2.0 | safetensors, GGUF | Multilingue y con buen rendimiento en codigo |

No se dispone de datos de benchmarks de este fine-tuning que permitan una comparacion cuantitativa con las alternativas; la tabla recoge solo caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al de modelos multilingues.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion para este fine-tuning concreto.
- Al ser un fine-tuning comunitario sobre Llama 3.1, puede heredar los sesgos del modelo base y anadir los del dataset de ajuste, que no se documenta.
- La licencia Llama 3.1 impone restricciones de uso comercial (politica de uso aceptable de Meta) y obliga a mantener la atribucion; conviene revisar los terminos antes de desplegar en produccion.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para uso real se recomienda Q4_K_M o superior, o las variantes imatrix del repositorio i1.
- El repositorio tiene un numero muy bajo de descargas (104) y likes (1), lo que sugiere poca validacion por parte de la comunidad.
- No hay informacion sobre la longitud de contexto efectiva del fine-tuning; aunque Llama 3.1 soporta ventanas largas, el ajuste puede haber reducido la calidad en contextos extensos.
- El tamano del repositorio (71,8 GB) se debe a la suma de todas las cuantizaciones; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/liberalis-cogitator-llama-3.1-8b-GGUF
- Repositorio con quants imatrix: https://huggingface.co/mradermacher/liberalis-cogitator-llama-3.1-8b-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/Locutusque/liberalis-cogitator-llama-3.1-8b
- Pagina de descargas del autor: https://hf.tst.eu/model#liberalis-cogitator-llama-3.1-8b-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
