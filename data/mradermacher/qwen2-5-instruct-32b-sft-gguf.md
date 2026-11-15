# mradermacher/Qwen2.5-Instruct-32B-SFT-GGUF

## Resumen

Qwen2.5-Instruct-32B-SFT-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo PeterLauLukCh/Qwen2.5-32B-Instruct-CognitiveSFT-v0.1, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de modelos para inferencia local. El modelo original parte de Qwen2.5-32B-Instruct, desarrollado por Alibaba Cloud (equipo Qwen), y ha sido sometido a un ajuste fino supervisado (SFT) adicional orientado a lo que el autor denomina "CognitiveSFT". Esta version GGUF existe para permitir ejecutar el modelo en hardware de consumo y en entornos sin GPU de datacenter mediante llama.cpp y herramientas compatibles.

El modelo base Qwen2.5-32B-Instruct es un transformer denso (no MoE) de aproximadamente 32.760 millones de parametros, con una ventana de contexto nativa de 131.072 tokens en la familia Qwen2.5, capacidad de generacion de hasta 8.192 tokens y soporte para tool calling estructurado. Esta cuantizacion hereda esas capacidades del modelo base, aunque el ajuste fino adicional puede alterar el comportamiento en mayor o menor medida segun la calidad del dataset SFT empleado.

La relevancia practica de esta ficha radica en que ofrece un abanico de 11 cuantizaciones estaticas (desde Q2_K hasta Q8_0) que cubren un rango de 12,4 GB a 34,9 GB, lo que permite desplegar un modelo de 32B en GPUs de 24 GB (con cuantizaciones Q4) o en configuraciones CPU+GPU con RAM abundante. La licencia MIT facilita el uso comercial sin las restricciones adicionales que a veces acompanan a otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 (~32,76 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 131.072 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas) |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repositorio | 224,0 GB (incluye todas las cuantizaciones) |
| Libreria declarada | transformers |
| Fecha de creacion | 2025-03-17 |
| Ultima actualizacion | 2026-11-15 |
| Descargas | 173 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-32B-Instruct, un transformer denso decoder-only de Alibaba con atencion por cabezas agrupadas (GQA), RoPE y las optimizaciones habituales de la familia Qwen2.5. Sobre esa base, el autor PeterLauLukCh aplico un ajuste fino supervisado adicional ("CognitiveSFT") cuyo dataset, numero de tokens y metodologia no se detallan en la informacion disponible. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT en esta variante concreta.

La contribucion de mradermacher se limita a la conversion y cuantizacion estatica a GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf). No se han generado cuantizaciones con importancia matrix (imatrix/weighted) en el momento de la publicacion; el autor indica que podrian aparecer mas adelante o solicitarse mediante una discusion comunitaria. Las cuantizaciones son estaticas, por lo que no incorporan calibracion por pesos de activacion.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen2.5-32B-Instruct.
- Generacion de codigo y matematicas (el modelo base Qwen2.5-32B-Instruct destaca en estas areas, aunque no hay benchmarks especificos de esta variante en la informacion disponible).
- Soporte multilingue para 13 idiomas: chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Soporte de tool calling / function calling estructurado (capacidad del modelo base Qwen2.5-Instruct; no verificada especificamente tras el SFT adicional).
- Capacidad de seguir instrucciones en formato conversacional (chat template de Qwen2.5).
- No se documenta soporte de vision, audio ni modo "thinking" explicito en esta variante.
- No se documenta capacidad de agentes multi-paso especifica mas alla de la del modelo base.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 24 GB: usando Q4_K_M (20,0 GB) o IQ4_XS (18,0 GB) el modelo cabe en una RTX 4090 o RTX 3090, permitiendo asistentes privados sin dependencia de la nube.
- Servicio de atencion al cliente multilingue: el modelo cubre 13 idiomas y puede gestionar conversaciones multi-turno; el contexto largo del modelo base (131.072 tokens) es adecuado para historicos extensos, aunque conviene verificar el comportamiento tras el SFT.
- Generacion de codigo en pipelines de CI/CD: integrable mediante llama.cpp o servidores compatibles con la API de OpenAI (endpoints_compatible), util para revision de codigo o generacion de tests en entornos con GPU limitada.
- Procesamiento por lotes en CPU con RAM abundante: las cuantizaciones Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten ejecucion en servidores sin GPU, a costa de perdida de calidad.
- Investigacion sobre ajuste fino y cuantizacion: al ser una variante SFT sobre un modelo conocido, sirve para estudiar el impacto del SFT adicional y de las cuantizaciones estaticas frente a las ponderadas.
- Prototipado de asistentes conversacionales en espanol: el modelo declara soporte de espanol y licencia MIT, lo que facilita pruebas comerciales tempranas.
- Despliegue en entornos air-gapped: al ser GGUF y ejecutable con llama.cpp, puede operar completamente offline en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas para esta variante SFT ni para sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos en disco, sin contar KV cache):
  - Q2_K: 12,4 GB
  - Q3_K_S: 14,5 GB
  - Q3_K_M: 16,0 GB
  - Q3_K_L: 17,3 GB
  - IQ4_XS: 18,0 GB
  - Q4_K_S: 18,9 GB
  - Q4_K_M: 20,0 GB
  - Q5_K_S: 22,7 GB
  - Q5_K_M: 23,4 GB
  - Q6_K: 27,0 GB
  - Q8_0: 34,9 GB
- GPU recomendadas: A100 40/80 GB y H100 para las cuantizaciones altas (Q6_K, Q8_0) con contexto largo; RTX 4090 / RTX 3090 (24 GB) para Q4_K_M o IQ4_XS con contexto moderado; RTX 4080 (16 GB) queda justa para Q3_K_L o IQ4_XS con contexto corto.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M (20,0 GB) o inferiores; en RTX 4070 Ti Super (16 GB) solo con Q3 o IQ4_XS y contexto reducido; en GPUs de 12 GB no cabe salvo en CPU offload parcial.
- Opciones de despliegue: llama.cpp (nativo para GGUF), Ollama, LM Studio, servidores compatibles con la API de OpenAI (el repo declara endpoints_compatible), vLLM solo si se convierte o se usa el modelo en safetensors (no directamente sobre GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente del hardware, del numero de capas offloaded a GPU y del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Instruct-32B-SFT-GGUF (esta ficha) | ~32,76 B | no disponible (base: 131.072) | MIT | GGUF (11 cuantizaciones) | SFT adicional no documentado |
| Qwen2.5-32B-Instruct (original) | ~32,76 B | 131.072 | Apache 2.0 (segun informacion publica de Alibaba) | safetensors, GGUF (via terceros) | Modelo base de referencia |
| Qwen2.5-32B-Instruct-GGUF (mradermacher, version estandar) | ~32,76 B | 131.072 | Apache 2.0 | GGUF | Sin SFT adicional; incluye imatrix en algunos casos |
| Mistral-Small-24B-Instruct (referencia de tamano similar) | ~24 B | 32.768 | Apache 2.0 | safetensors, GGUF | Menor numero de parametros; contexto menor |

No se dispone de datos comparativos de rendimiento (benchmarks) para esta variante concreta; la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- El ajuste fino "CognitiveSFT" no esta documentado: no se conoce el dataset, el numero de tokens, la metodologia ni las evaluaciones, lo que impide garantizar que no haya degradado capacidades del modelo base (por ejemplo, tool calling o multilingue).
- Riesgo de alucinacion inherente a los modelos de lenguaje de 32B; no hay evaluaciones especificas de esta variante.
- Las cuantizaciones estaticas de baja calidad (Q2_K, Q3_K_S) degradan notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio rapido y Q6_K/Q8_0 para maxima calidad.
- No hay cuantizaciones con imatrix disponibles en el momento de la publicacion, lo que puede suponer una perdida de calidad frente a cuantizaciones ponderadas equivalentes.
- El contexto efectivo puede verse reducido por la VRAM disponible al usar llama.cpp con KV cache; en GPUs de 24 GB con Q4_K_M el contexto practico es limitado.
- Aunque la licencia es MIT, el modelo base Qwen2.5 tiene su propia licencia (Apache 2.0 segun informacion publica); conviene verificar la compatibilidad y los terminos del modelo base antes de uso comercial.
- El numero de descargas (173) y likes (0) es muy bajo, lo que sugiere poca validacion comunitaria de esta variante.
- No se documenta soporte de vision ni audio; no debe asumirse.
- El repositorio ocupa 224 GB por incluir todas las cuantizaciones; la descarga selectiva es imprescindible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-Instruct-32B-SFT-GGUF
- Modelo base (SFT): https://huggingface.co/PeterLauLukCh/Qwen2.5-32B-Instruct-CognitiveSFT-v0.1
- Pagina de conveniencia del autor: https://hf.tst.eu/model#Qwen2.5-Instruct-32B-SFT-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
