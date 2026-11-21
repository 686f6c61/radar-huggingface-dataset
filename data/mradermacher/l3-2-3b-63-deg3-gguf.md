# mradermacher/l3.2-3b-63-deg3-GGUF

## Resumen

`mradermacher/l3.2-3b-63-deg3-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `semran1/l3.2-3b-63-deg3`, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos open source en Hugging Face. El modelo base es un transformer de aproximadamente 3.212 millones de parametros (3,2 B) segun los datos de safetensors, lo que lo situa en la categoria de modelos pequenos aptos para inferencia en hardware de consumo.

El repositorio no incluye una model card propia del autor original: la informacion disponible se limita a metadatos de cuantizacion, la lista de ficheros GGUF generados y la referencia al modelo base. No se documentan detalles sobre arquitectura interna, datos de entrenamiento, contexto soportado ni licencia, por lo que esta ficha se limita a reflejar los datos verificables y marca explicitamente como "no disponible" todo aquello que no consta.

La relevancia de esta publicacion es practica: ofrece el modelo base en formatos GGUF de 1,5 GB a 6,5 GB, lo que permite ejecutarlo con llama.cpp u Ollama en GPUs consumer y en CPU, algo que el repositorio original en transformers no facilita directamente. El nombre "l3.2-3b-63-deg3" sugiere un ajuste derivado de Llama 3.2 de 3 B, aunque esta interpretacion no esta confirmada por la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; el nombre sugiere base Llama 3.2 3B, no confirmado) |
| Parametros totales | 3.212.749.888 (3,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 29,3 GB (incluye todas las cuantizaciones) |
| Modelo base | semran1/l3.2-3b-63-deg3 |
| Cuantizador | mradermacher |
| Fecha de creacion | 2025-08-31 |
| Ultima actualizacion | 2026-11-21 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `semran1/l3.2-3b-63-deg3` mas alla de su naturaleza transformer inferida por el pipeline de transformers y el recuento de parametros (3,2 B). El nombre del modelo sugiere una derivacion o ajuste fino sobre Llama 3.2 de 3 B, pero no hay documentacion que lo confirme. Tampoco constan datos sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas especificas.

En cuanto al proceso de cuantizacion, la model card indica que se trata de cuantizaciones estaticas generadas con el pipeline de mradermacher (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). No se han publicado cuantizaciones ponderadas ni con imatrix para este modelo en el momento de la ultima actualizacion, segun declara el propio autor. Se ofrecen tanto cuantizaciones K-quant clasicas como una IQ4_XS.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Generacion de texto general en ingles: el unico idioma declarado es `en`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a traves de la infraestructura de Inference Endpoints de Hugging Face.
- Ejecucion local via llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- No consta soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No consta capacidad multilingue mas alla del ingles declarado.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (2,1 GB) el modelo cabe en cualquier GPU consumer con 4 GB o mas de VRAM, lo que permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Despliegue en dispositivos de borde: las cuantizaciones Q2_K (1,5 GB) y Q3_K_S (1,6 GB) permiten ejecucion en CPU o en GPUs integradas para tareas de generacion de texto de baja latencia y bajo consumo.
- Experimentacion academica con modelos pequenos: util para estudiar el efecto de la cuantizacion en la calidad de salida comparando Q2_K frente a Q8_0 sobre el mismo modelo base.
- Generacion de texto en ingles para tareas auxiliares (resumen, reescritura, clasificacion simple) en pipelines donde no se requiere un modelo grande y prima el coste.
- Evaluacion comparativa de ajustes finos: al ser un derivado con nombre propio (`l3.2-3b-63-deg3`), sirve para comparar su comportamiento frente al Llama 3.2 3B original en tareas de conversacion.
- Integracion en entornos con requisitos de privacidad: al ejecutarse totalmente en local con llama.cpp, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles y volumen moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos + overhead de contexto):
  - Q2_K: ~1,5 GB de pesos, ~2-2,5 GB con contexto moderado.
  - Q4_K_M: ~2,1 GB de pesos, ~2,5-3 GB con contexto moderado.
  - Q8_0: ~3,5 GB de pesos, ~4-4,5 GB con contexto moderado.
  - f16: ~6,5 GB de pesos, ~7 GB con contexto moderado.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090) para cuantizaciones Q4/Q5; A100 o H100 no son necesarias para este tamano y solo tendrian sentido para servir muchas instancias en paralelo.
- Cabe en GPU consumer: si, en todas las cuantizaciones hasta Q8_0 en GPUs de 8 GB; f16 requiere 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/l3.2-3b-63-deg3-GGUF | 3,2 B | no disponible | no disponible | GGUF | Cuantizaciones estaticas de un ajuste no documentado |
| meta-llama/Llama-3.2-3B-Instruct | 3,2 B | 128 K (segun model card oficial) | Llama 3.2 Community License | safetensors, GGUF (comunidad) | Modelo oficial de referencia con documentacion completa |
| Qwen2.5-3B-Instruct | 3,1 B | 32 K (segun model card oficial) | Apache 2.0 | safetensors, GGUF (comunidad) | Alternativa con licencia permisiva y soporte multilingue |
| Phi-3.5-mini-instruct | 3,8 B | 128 K (segun model card oficial) | MIT | safetensors, GGUF (comunidad) | Alternativa de Microsoft con licencia permisiva |

La comparacion con Llama 3.2 3B es la mas pertinente por el nombre del modelo, pero no se dispone de datos que confirmen que `l3.2-3b-63-deg3` sea un ajuste de ese modelo ni de como se comporta frente a el.

## Limitaciones y advertencias

- Ausencia total de model card del modelo base: no hay informacion sobre datos de entrenamiento, sesgos, alineacion ni evaluaciones, lo que impide valorar su calidad de forma rigurosa.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Antes de usarlo en produccion hay que verificar la licencia del modelo base `semran1/l3.2-3b-63-deg3` y, en su caso, la del modelo del que derive.
- Solo ingles declarado: no hay soporte multilingue documentado; el rendimiento en castellano es incierto.
- Riesgo de alucinacion: inherente a los modelos de 3 B sin documentacion de alineacion; no se han publicado evaluaciones que lo cuantifiquen.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan notablemente la perplejidad segun la propia model card; para uso serio se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no las ha generado, por lo que no se dispone de la mejora de calidad habitual en esos formatos.
- Popularidad muy baja (13 descargas, 0 likes en el momento de la consulta): no hay comunidad que haya validado el modelo, lo que aumenta el riesgo de comportamientos inesperados.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente la ventana real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/l3.2-3b-63-deg3-GGUF
- Modelo base: https://huggingface.co/semran1/l3.2-3b-63-deg3
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#l3.2-3b-63-deg3-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes del cuantizador: https://huggingface.co/mradermacher/model_requests
