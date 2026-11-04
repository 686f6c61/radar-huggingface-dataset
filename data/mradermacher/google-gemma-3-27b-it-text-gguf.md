# mradermacher/google-gemma-3-27b-it-text-GGUF

## Resumen

Esta ficha describe `mradermacher/google-gemma-3-27b-it-text-GGUF`, una coleccion de cuantizaciones estaticas en formato GGUF del modelo `Changgil/google-gemma-3-27b-it-text`, que a su vez es una variante de la familia Gemma 3 de Google con 27.009.346.304 parametros (~27B). El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF, y el objetivo es facilitar la ejecucion local del modelo en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, etc.).

El modelo resuelve el problema de desplegar un transformer denso de ~27B con calidad de instruccion en GPUs consumer o estaciones de trabajo modestas, ofreciendo desde cuantizaciones Q2_K de 10,6 GB hasta Q8_0 de 28,8 GB. La licencia es la Gemma License de Google, que impone condiciones de uso (no es una licencia OSI pura) y requiere aceptar los terminos de uso de Gemma.

Es relevante ahora porque la demanda de modelos de ~27B ejecutables en local con contexto largo y calidad de chat sigue creciendo, y las cuantizaciones GGUF son la via practica para ello. El repositorio incluye ademas una variante con imatrix (`google-gemma-3-27b-it-text-i1-GGUF`) para quienes priorizan calidad por bit. El modelo base esta etiquetado como solo texto (`-text`) y en ingles (`en`), lo que limita su alcance multilingue frente a los Gemma 3 originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Gemma 3; detalles exactos no disponibles en la informacion proporcionada) |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun etiquetas del repo) |
| Licencia | gemma (Gemma License de Google) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 186,7 GB |
| Libreria declarada | transformers |
| Modelo base | Changgil/google-gemma-3-27b-it-text |
| Variante imatrix | disponible en `mradermacher/google-gemma-3-27b-it-text-i1-GGUF` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de ~27B parametros derivado de la familia Gemma 3 de Google, adaptado por el autor `Changgil` a una variante solo texto (`-text`) y ajustado para instrucciones (`-it`). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar; tampoco se documentan innovaciones arquitectonicas especificas (atencion lineal, decodificacion especulativa, etc.) en esta ficha.

El trabajo de mradermacher consiste en la cuantizacion estatica a GGUF con `quantize_version: 2` y `output_tensor_quantised: 1`, partiendo de la conversion desde el formato Hugging Face (`convert_type: hf`). Se ofrecen tanto cuantizaciones K-quant clasicas como una variante IQ4_XS, y existe un repositorio paralelo con cuantizaciones ponderadas/imatrix (i1) que suelen ofrecer mejor calidad por bit que las estaticas equivalentes en tamano.

## Capacidades

- Generacion de texto conversacional en ingles, con ajuste de instrucciones (`-it`).
- Razonamiento y respuesta a prompts multi-turno propios de un modelo de chat de ~27B.
- Generacion de codigo y matematicas: capacidad esperable por herencia de Gemma 3, aunque no se documentan resultados especificos en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante `-text`.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente para esta variante.
- Capacidades multilingues: limitadas; el repo declara unicamente `en`.
- Vision: no soportada en esta variante (`-text`), a diferencia de los Gemma 3 multimodales originales.
- Modo thinking: no documentado en la informacion proporcionada.

## Casos de uso

- Asistente de chat local en ingles: desplegar la cuantizacion Q4_K_M (16,6 GB) en una estacion con 24 GB de VRAM para conversaciones multi-turno sin dependencia de la nube.
- Generacion de codigo en entornos air-gapped: usar Q5_K_M o Q6_K en una workstation con GPU de 24-48 GB para autocompletado y explicacion de codigo sin enviar codigo propietario a terceros.
- Prototipado de pipelines RAG: integrar el GGUF en llama.cpp u Ollama para generar respuestas sobre documentacion interna, aprovechando el contexto del modelo base (no confirmado en esta ficha).
- Educacion e investigacion: ejecutar el modelo en laboratorios con GPUs consumer (RTX 4090, RTX 3090) para experimentos de prompting y evaluacion comparativa sin coste de API.
- Generacion de contenido tecnico en ingles: redaccion de documentacion, resumenes y explicaciones tecnicas con la cuantizacion Q8_0 (28,8 GB) cuando la calidad prima sobre el rendimiento.
- Despliegue en CPU o mixto CPU/GPU: usar Q2_K (10,6 GB) o Q3_K_S (12,3 GB) en equipos sin GPU dedicada potente, aceptando perdida de calidad a cambio de viabilidad.
- Fine-tuning ligero o evaluacion de destilacion: emplear el modelo base en safetensors como referencia y las cuantizaciones para inferencia comparativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas numericas con otros modelos; se limita a listar las cuantizaciones y su tamano.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto):
  - Q2_K: ~11-12 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~13-15 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~16-18 GB.
  - Q5_K_S / Q5_K_M: ~19-21 GB.
  - Q6_K: ~23-25 GB.
  - Q8_0: ~29-31 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4-Q5; A100 40/80 GB o H100 para Q6_K y Q8_0 con contexto amplio; RTX 4060 Ti 16 GB para Q2_K-Q3_K.
- Cabe en GPU consumer: si, en Q2_K a Q5_K_M con GPUs de 12-24 GB; Q6_K y Q8_0 requieren 24 GB o mas y pueden necesitar offload parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no son la via natural para GGUF (aunque vLLM tiene soporte experimental para algunos GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/google-gemma-3-27b-it-text-GGUF (este) | ~27B | no disponible | gemma | GGUF | Solo texto, solo ingles, cuantizaciones estaticas |
| mradermacher/google-gemma-3-27b-it-text-i1-GGUF | ~27B | no disponible | gemma | GGUF (imatrix) | Misma base, cuantizaciones ponderadas de mayor calidad por bit |
| Changgil/google-gemma-3-27b-it-text | ~27B | no disponible | gemma | safetensors | Modelo base en precision completa |
| Gemma 3 27B IT original (Google) | ~27B | no disponible en esta ficha | gemma | safetensors | Multimodal y multilingue; esta variante es solo texto |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: heredados del modelo base Gemma 3 y de sus datos de entrenamiento; no documentados especificamente en esta ficha.
- Riesgo de alucinacion: presente como en cualquier LLM de su tamano; no se han publicado evaluaciones de factualidad para esta variante.
- Limitaciones de contexto o idioma: el repo declara unicamente ingles (`en`); el contexto maximo no esta documentado en la informacion proporcionada.
- Restricciones de licencia: la Gemma License no es una licencia OSI; impone condiciones de uso, obligaciones de atribucion y restricciones (incluida una politica de uso aceptable) que deben revisarse antes de uso comercial.
- Variante solo texto: no soporta vision ni audio, a diferencia de los Gemma 3 multimodales.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Perdida de calidad por cuantizacion: las cuantizaciones estaticas pueden degradar el rendimiento frente a las imatrix i1 del repositorio hermano.
- Repositorio de terceros: el modelo base es una adaptacion de un autor independiente (`Changgil`), no la version oficial de Google; conviene validar el comportamiento antes de produccion.
- Tamano del repo: 186,7 GB en total; la descarga selectiva de un unico archivo GGUF es imprescindible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/google-gemma-3-27b-it-text-GGUF
- Repositorio imatrix (i1): https://huggingface.co/mradermacher/google-gemma-3-27b-it-text-i1-GGUF
- Modelo base: https://huggingface.co/Changgil/google-gemma-3-27b-it-text
- Pagina de descargas del autor: https://hf.tst.eu/model#google-gemma-3-27b-it-text-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor: https://www.nethype.de/
