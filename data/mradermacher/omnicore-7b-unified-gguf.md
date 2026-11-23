# mradermacher/OmniCore-7B-Unified-GGUF

## Resumen

OmniCore-7B-Unified-GGUF es la distribucion en formato GGUF del modelo OmniCore-7B-Unified, un modelo de lenguaje de aproximadamente 7.615 millones de parametros desarrollado originalmente por el usuario adityaxess y cuantizado por mradermacher. El modelo base se ha generado mediante mergekit, una herramienta de fusion de modelos, por lo que se trata de un merge de pesos y no de un entrenamiento desde cero. Esta version GGUF esta pensada para su uso con llama.cpp y ecosistemas compatibles, lo que permite ejecutar el modelo en hardware de consumo.

La relevancia de esta ficha radica en que el repositorio ofrece hasta doce variantes de cuantizacion estatica (desde Q2_K de 3,1 GB hasta f16 de 15,3 GB), lo que facilita el despliegue en escenarios con restricciones de VRAM muy distintas. Sin embargo, la informacion publicada es extremadamente escasa: no se detalla la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento. La model card se limita a listar los ficheros cuantizados y a remitir a enlaces externos.

Se trata, por tanto, de un modelo conversacional en ingles (unico idioma declarado en los metadatos) cuya evaluacion rigurosa queda limitada por la ausencia de benchmarks y de documentacion tecnica. Es adecuado para experimentacion y prototipado local, pero no para entornos de produccion que exijan garantias de licencia o de rendimiento medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit; detalles no disponibles) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (y safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base OmniCore-7B-Unified se ha construido mediante mergekit, segun las etiquetas del repositorio, lo que indica una fusion de pesos de modelos preexistentes en lugar de un entrenamiento desde cero. No se especifica que modelos se fusionaron, que metodo de merge se aplico (SLERP, TIES, DARE, etc.) ni los hiperparametros empleados. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La version aqui descrita es una cuantizacion estatica realizada por mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de publicacion, por lo que solo se ofrecen cuantizaciones estaticas. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere uso mediante APIs de inferencia.
- Ejecucion local mediante llama.cpp y ecosistemas compatibles con GGUF.
- Capacidades de razonamiento, codigo, matematicas o vision: no disponibles en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (4,8 GB) el modelo cabe en GPUs de consumo de 8 GB, lo que permite iterar en el diseno de prompts y flujos conversacionales sin coste de API.
- Experimentacion con modelos fusionados: util para investigadores que quieran evaluar cualitativamente el resultado de un merge de mergekit sin necesidad de descargar los pesos en safetensors (68,1 GB de repositorio completo).
- Despliegue en entornos con VRAM limitada: la variante Q2_K (3,1 GB) permite ejecutar el modelo en GPUs de 4 GB o en CPU con llama.cpp, aunque con perdida de calidad.
- Generacion de texto en ingles para tareas generales: adecuado para resumen, redaccion o respuesta a preguntas en ingles, siempre que no se requiera precision medida.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes, lo que permite medir el impacto de la cuantizacion en la perplejidad y en la calidad subjetiva.
- Base para fine-tuning ligero: al estar disponible en safetensors el modelo base, se puede usar como punto de partida para ajuste con LoRA en tareas especificas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF mas overhead de contexto):
  - Q2_K: ~3,1 GB de pesos, ~4 GB con contexto moderado.
  - Q4_K_M: ~4,8 GB de pesos, ~6 GB con contexto moderado.
  - Q8_0: ~8,2 GB de pesos, ~10 GB con contexto moderado.
  - f16: ~15,3 GB de pesos, ~17 GB con contexto moderado.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 (24 GB) para las cuantizaciones altas.
  - Profesional: A100 40/80 GB, H100 para f16 con contexto largo.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 4-6 GB hasta Q8_0 en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OmniCore-7B-Unified-GGUF | 7,6 B | no disponible | no disponible | GGUF | Merge via mergekit, sin benchmarks |
| Mistral-7B-Instruct (referencia) | 7,2 B | 32k (v0.2) | Apache 2.0 | safetensors, GGUF | Ampliamente documentado y evaluado |
| Llama 3.1 8B Instruct (referencia) | 8,0 B | 128k | Llama 3.1 Community License | safetensors, GGUF | Benchmarks publicos y soporte amplio |
| Qwen2.5 7B Instruct (referencia) | 7,6 B | 128k | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Multilingue y con benchmarks publicos |

La comparativa se ofrece a modo de referencia de categoria; no se dispone de datos de rendimiento de OmniCore-7B-Unified que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento o codigo, por lo que no se puede recomendar para produccion sin evaluacion propia.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue comercial.
- Idioma limitado al ingles: no se declaran capacidades multilingues, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Modelo fusionado: los merges con mergekit pueden heredar sesgos y comportamientos erraticos de los modelos originales, y suelen presentar mayor riesgo de alucinacion y de incoherencia en tareas complejas.
- Cuantizaciones estaticas unicamente: no hay variantes con imatrix, que suelen ofrecer mejor calidad por tamano; las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad.
- Documentacion minima: la model card no describe datos de entrenamiento, arquitectura interna ni limitaciones conocidas.
- Fecha de creacion futura en los metadatos (2026-11-20): conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OmniCore-7B-Unified-GGUF
- Modelo base: https://huggingface.co/adityaxess/OmniCore-7B-Unified
- Pagina de descargas del autor: https://hf.tst.eu/model#OmniCore-7B-Unified-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
