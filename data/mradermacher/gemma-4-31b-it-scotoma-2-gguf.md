# mradermacher/gemma-4-31B-it-scotoma-2-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-scotoma-2-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `ReadyArt/gemma-4-31B-it-scotoma-2`, un ajuste fino de la familia Gemma 4 de Google en su variante instruct de 31B (30.697.345.596 parametros reales segun safetensors). El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de GGUF en Hugging Face que convierte modelos en formato transformers a variantes ejecutables con llama.cpp y ecosistemas compatibles. El repositorio no aporta informacion propia sobre el entrenamiento del modelo base: se limita a distribuir los pesos cuantizados.

El modelo subyacente es un transformer denso de aproximadamente 31B parametros, multimodal (el repo incluye ficheros `mmproj` para el proyector visual) y orientado a conversacion. La licencia declarada es Apache 2.0, con enlace a la licencia de Gemma 4 de Google, lo que conviene verificar porque los terminos de Gemma no son exactamente Apache 2.0 en todos los casos. El idioma declarado es unicamente ingles.

La relevancia practica de este repositorio es que permite ejecutar un modelo de 31B en hardware de consumo o servidores modestos mediante cuantizacion, con opciones desde 12 GB (Q2_K) hasta 32,7 GB (Q8_0). Es la via habitual para desplegar modelos grandes en local sin GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4); detalles internos no disponibles |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (segun model card); resto no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (transformers como libreria declarada; el repo base esta en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de su pertenencia a la familia Gemma 4 en variante instruct y su caracter multimodal (presencia de ficheros `mmproj` para el proyector de vision). No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). Tampoco se documenta el proceso de ajuste fino que da lugar a la variante "scotoma-2" de ReadyArt.

Lo unico verificable es el proceso de cuantizacion: mradermacher indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversion desde pesos Hugging Face con cuantizacion estatica de tensores. El repositorio incluye ademas una variante con cuantizacion ponderada por imatrix en `mradermacher/gemma-4-31B-it-scotoma-2-i1-GGUF`, que suele ofrecer mejor calidad por tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, en formato instruct.
- Capacidades multimodales: el repo incluye proyectores `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de imagenes en el modelo base.
- Razonamiento y respuesta a instrucciones heredados del modelo Gemma 4 instruct; nivel concreto no documentado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card solo declara ingles; no se confirma soporte de otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en ingles: desplegando la variante Q4_K_M (18,8 GB) con llama.cpp u Ollama en una GPU de 24 GB, se obtiene un chatbot instruct de 31B sin dependencia de la nube.
- Procesamiento de documentos con imagenes: usando los ficheros `mmproj` junto con los pesos cuantizados, el modelo puede recibir capturas, diagramas o paginas escaneadas y responder preguntas sobre ellas en local.
- Prototipado de pipelines multimodales: util para investigadores que necesitan validar una arquitectura de vision-lenguaje de ~31B antes de invertir en infraestructura con los pesos completos en safetensors.
- Inferencia en servidores con VRAM limitada: la variante Q3_K_S (13,9 GB) o IQ4_XS (17 GB) permite servir el modelo en GPUs de 16-24 GB, algo inviable con los pesos en f16.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion mas dos proyectores, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad para un caso de uso concreto.
- Despliegue en CPU o entornos mixtos CPU/GPU: con Q2_K (12 GB) o Q3_K_S se puede ejecutar en maquinas sin GPU dedicada usando llama.cpp, a costa de calidad.
- Fine-tuning ligero sobre la base cuantizada: no recomendado directamente en GGUF, pero sirve como referencia de comportamiento para decidir si conviene adaptar el modelo original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto, aproximada):
  - Q2_K: ~12 GB de pesos; ~14-16 GB con contexto moderado.
  - Q3_K_S / Q3_K_M / Q3_K_L: 13,9-16,7 GB de pesos.
  - IQ4_XS / Q4_K_S / Q4_K_M: 17-18,8 GB de pesos; ~20-22 GB con contexto.
  - Q5_K_S / Q5_K_M: 21,4-21,9 GB de pesos; ~24 GB con contexto.
  - Q6_K: 25,3 GB; Q8_0: 32,7 GB.
- GPUs recomendadas:
  - RTX 4090 (24 GB): Q4_K_M o Q5_K_S con contexto ajustado; Q6_K justo.
  - RTX 3090 (24 GB): mismo perfil que la 4090.
  - A100 40 GB / H100 80 GB: Q8_0 o f16 sin problemas.
  - GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB): Q3_K_S o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q6_K segun VRAM; Q8_0 requiere 32 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa (requieren los pesos en safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-scotoma-2 (este repo) | ~30,7B | no disponible | GGUF | apache-2.0 (enlace a licencia Gemma 4) | Multimodal, solo ingles declarado |
| gemma-4-31B-it-scotoma-2-i1-GGUF (mismo autor) | ~30,7B | no disponible | GGUF con imatrix | apache-2.0 | Variante con cuantizacion ponderada, mejor calidad por tamano |
| ReadyArt/gemma-4-31B-it-scotoma-2 (modelo base) | ~30,7B | no disponible | safetensors | apache-2.0 | Pesos completos, requiere infraestructura mayor |
| Otros modelos de ~30B de la familia Gemma 4 | no disponible | no disponible | varios | no disponible | Sin datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base ni del ajuste "scotoma-2".
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin benchmarks publicados no se puede acotar su magnitud.
- La licencia se declara como apache-2.0 pero enlaza a la licencia de Gemma 4 de Google; conviene revisar los terminos reales de uso comercial antes de desplegar en produccion, ya que las licencias de Gemma incluyen clausulas de uso aceptable.
- La cuantizacion degrada la calidad respecto a los pesos originales; Q2_K y Q3_K_M son las variantes con mayor perdida (el propio autor marca Q3_K_M como "lower quality").
- No se documenta la longitud de contexto soportada; asumir valores altos sin verificar puede provocar errores en produccion.
- El repositorio es una redistribucion de cuantizaciones, no un modelo entrenado por mradermacher; la responsabilidad sobre el comportamiento recae en el modelo base de ReadyArt.
- El tamano del repo (213,9 GB) incluye todas las variantes; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-2-GGUF
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Variante con cuantizacion imatrix: https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-2-i1-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#gemma-4-31B-it-scotoma-2-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
