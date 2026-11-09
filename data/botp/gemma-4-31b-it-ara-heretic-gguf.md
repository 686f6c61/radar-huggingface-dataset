# botp/gemma-4-31B-it-ARA-heretic-GGUF

## Resumen

`botp/gemma-4-31B-it-ARA-heretic-GGUF` es una distribucion en formato GGUF del modelo `richardyoung/gemma-4-31B-it-ARA-heretic`, a su vez un derivado "heretic" (abliterated/uncensored) del modelo Gemma 4 de 31B de Google en su variante instruction-tuned. El repositorio lo publica el usuario `botp` y las cuantizaciones estaticas las genera `mradermacher` con su herramienta de conversion a GGUF. El objetivo del modelo es ofrecer una version con los mecanismos de rechazo reducidos o eliminados mediante tecnicas de abliteration, manteniendo el resto de capacidades del modelo base.

El modelo cuenta con 30.697.345.596 parametros segun los pesos en safetensors del modelo base, lo que lo situa en la categoria de ~31B. Se distribuye en una amplia gama de cuantizaciones GGUF (desde Q2_K de 12,0 GB hasta Q8_0 de 32,7 GB), lo que permite su despliegue en hardware muy diverso, desde GPUs de consumo con 16-24 GB hasta estaciones de trabajo con multiples aceleradores. Incluye ademas ficheros `mmproj` (multi-modal projector), lo que indica soporte de entrada multimodal en el modelo base.

La relevancia de esta ficha es doble: por un lado documenta un caso tipico de la cadena de derivacion (modelo oficial -> fine-tune heretic -> cuantizacion GGUF) que predomina en el ecosistema open source; por otro, advierte de las implicaciones tecnicas y de licencia que conlleva usar variantes abliterated en produccion. La informacion disponible publicamente sobre este repositorio concreto es escasa (0 descargas, 0 likes en el momento de la consulta), por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 4; detalles exactos no disponibles) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 en su variante instruction-tuned de ~31B parametros, un transformer decoder-only. Sobre esa base, el autor `richardyoung` aplico tecnicas de "abliteration" (modificacion de direcciones de activacion para reducir el comportamiento de rechazo) para producir la variante `heretic`. No se dispone de informacion publica en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO adicionales en el derivado heretic. El repositorio de cuantizacion no aporta detalles sobre el proceso de abliteration mas alla de las etiquetas `heretic`, `uncensored`, `decensored` y `abliterated`.

La innovacion tecnica documentada en este repositorio es la cuantizacion: se ofrecen cuantizaciones estaticas generadas con la herramienta de `mradermacher` (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye ficheros `mmproj` que preservan la capacidad multimodal del modelo base. Tambien se enlaza una variante con cuantizaciones ponderadas/imatrix en `mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF`, que suele ofrecer mejor calidad por tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Gemma 4 instruction-tuned.
- Razonamiento y respuesta a instrucciones (variante `-it`).
- Entrada multimodal: la presencia de ficheros `mmproj` (Q8_0 y f16) indica soporte de vision en el modelo base.
- Comportamiento "uncensored"/"abliterated": se espera una reduccion de rechazos ante peticiones que el modelo original declinaria; no es una capacidad funcional adicional sino una modificacion del comportamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este derivado concreto.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente `en`; no se documentan otros idiomas.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve para estudiar como la abliteration afecta a la tasa de rechazos, la calidad de respuesta y los sesgos, comparandolo con el Gemma 4 original en entornos controlados.
- Generacion creativa sin restricciones de estilo: escritura de ficcion, guiones o narrativa que requiera tono adulto o temas sensibles, donde los rechazos del modelo alineado resultan un obstaculo; debe usarse con revision humana y cumplimiento legal.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (18,8 GB) o Q5_K_M (21,9 GB) permiten ejecutar el modelo en GPUs de consumo de 24 GB (RTX 3090/4090) mediante llama.cpp u Ollama, con contexto limitado por la VRAM restante.
- Procesamiento por lotes en servidores con multiples GPUs: la cuantizacion Q8_0 (32,7 GB) o los pesos originales en safetensors permiten servir el modelo con vLLM o TGI en nodos con 2x A100 40GB o 1x H100 80GB, para tareas de generacion a gran escala.
- Analisis de documentos con componente visual: usando los ficheros `mmproj` junto con el GGUF principal en llama.cpp, se puede procesar imagen + texto en pipelines de extraccion de informacion, siempre que se valide la calidad multimodal del derivado.
- Prototipado de asistentes conversacionales en ingles: el modelo puede integrarse en aplicaciones de chat multi-turno; conviene medir empiricamente la ventana de contexto real soportada, ya que no esta documentada en esta ficha.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion mas dos de mmproj, lo que lo hace util para estudiar el compromiso calidad/tamano (Q2_K a Q8_0) en un modelo de ~31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~12,0 GB
  - Q3_K_M: ~15,4 GB
  - IQ4_XS: ~17,0 GB
  - Q4_K_M: ~18,8 GB
  - Q5_K_M: ~21,9 GB
  - Q6_K: ~25,3 GB
  - Q8_0: ~32,7 GB
  - mmproj adicional: ~0,9 GB (Q8_0) o ~1,3 GB (f16)
- GPU recomendadas:
  - Consumer: RTX 3090 / RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 4060 Ti 16 GB solo para Q2_K/Q3_K_S con contexto muy limitado.
  - Profesional/datacenter: A100 40GB o 80GB, H100 80GB para Q6_K/Q8_0 o pesos sin cuantizar; configuraciones multi-GPU para contexto largo.
- Caben en consumer GPU: si, las cuantizaciones Q4_K_M y menores en GPUs de 24 GB; las de 16 GB requieren cuantizaciones muy agresivas y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; para safetensors, vLLM o TGI (verificar soporte de la arquitectura Gemma 4 en la version concreta). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| botp/gemma-4-31B-it-ARA-heretic-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF | Derivado heretic cuantizado; 0 descargas al consultar |
| richardyoung/gemma-4-31B-it-ARA-heretic | ~30,7B | no disponible | apache-2.0 | safetensors | Modelo base del que se derivan estas cuantizaciones |
| mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas, generalmente mejor calidad por tamano |
| Gemma 4 31B it (original de Google) | ~31B | no disponible | licencia Gemma 4 | safetensors | Modelo alineado de referencia; comportamiento de rechazo estandar |

## Limitaciones y advertencias

- La abliteration no elimina los sesgos del modelo base; puede alterar la calibracion y aumentar la probabilidad de respuestas daninas, incorrectas o inseguras. Requiere filtros y revision humana en cualquier uso en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad para este derivado; al modificar las direcciones de activacion, la calidad en tareas de razonamiento puede degradarse respecto al Gemma 4 original.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Contexto: la longitud de contexto no esta documentada en este repositorio; debe verificarse empiricamente antes de disenar aplicaciones que dependan de ventanas largas.
- Licencia: aunque el repositorio declara apache-2.0, el campo `license_link` apunta a la licencia de Gemma 4 de Google, que impone condiciones de uso adicionales (incluida la politica de uso prohibido). Es imprescindible revisar esa licencia antes de un uso comercial; la declaracion apache-2.0 del derivado puede no ser suficiente por si sola.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no incluye evaluacion propia; no hay garantia de que las cuantizaciones se hayan validado mas alla de la conversion automatica.
- Uso comercial: la cadena de derivacion (Gemma 4 -> heretic -> GGUF) anade incertidumbre juridica; conviene consultar con asesoria legal y conservar la documentacion de cada eslabon.
- Los ficheros GGUF multiparte pueden requerir concatenacion previa; seguir las instrucciones habituales de llama.cpp para ficheros divididos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/botp/gemma-4-31B-it-ARA-heretic-GGUF
- Modelo base (heretic): https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#gemma-4-31B-it-ARA-heretic-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
