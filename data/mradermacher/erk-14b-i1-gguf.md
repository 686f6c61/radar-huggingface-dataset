# mradermacher/Erk-14B-i1-GGUF

## Resumen

Erk-14B-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo Erk-14B, desarrollado originalmente por ecloudtech y cuantizado por mradermacher. El modelo base es un LLM conversacional de aproximadamente 14.768 millones de parámetros, entrenado y orientado principalmente al turco (código de idioma `tr`), lo que lo convierte en una propuesta específica para el ecosistema lingüístico turco más que en un modelo multilingüe generalista. La relevancia de esta ficha concreta no está en el modelo base, sino en el trabajo de cuantización: permite ejecutar un modelo de 14B en hardware de consumo mediante pesos de 5,4 a 12,2 GB, con variantes imatrix de calidad mejorada.

El repositorio ofrece cuantizaciones estáticas derivadas de `ecloudtech/Erk-14B` mediante el pipeline de mradermacher, con variantes que van desde IQ2_M (5,4 GB) hasta Q6_K (12,2 GB), además del fichero imatrix para generar cuantizaciones propias. Se incluyen tanto cuantizaciones "i1" (weighted/imatrix) como la referencia a la colección estática publicada en un repositorio paralelo.

La licencia es la ecloud-open-community-license, una licencia propia del autor del modelo base que no es de código abierto estándar y que conviene revisar antes de cualquier uso comercial. No se han publicado en la información disponible datos de benchmarks, longitud de contexto ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base denso de ~14B; familia no confirmada en la informacion) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K; coleccion estatica adicional con Q2_K_S, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_L, IQ2_XXS, IQ2_XS, IQ2_S, IQ1_M, IQ1_S, Q5_K_S, Q5_K_M, Q4_0, Q4_1 |
| Idiomas soportados | turco (tr) |
| Licencia | ecloud-open-community-license (licencia propia, no estandar) |
| Formato de pesos | GGUF (transformers como libreria declarada; incluye fichero imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `ecloudtech/Erk-14B` en los datos proporcionados. El recuento de parametros (14.768.307.200, aproximadamente 14,77B) es consistente con un transformer denso de escala 14B, pero no se confirma en la documentacion disponible si emplea atencion agrupada (GQA), atencion lineal, decodificacion especulativa u otras innovaciones. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

Lo que si esta documentado es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con imatrix (etiquetadas como `i1`) a partir del modelo original. El fichero `Erk-14B.imatrix.gguf` (0,1 GB) permite a terceros generar sus propias cuantizaciones. Las cuantizaciones i1 usan una matriz de importancia calculada sobre datos de calibracion para reducir el error en las capas mas sensibles, lo que en la practica mejora la perplejidad respecto a cuantizaciones estaticas del mismo tamano. El autor advierte en la model card que IQ3_XXS es probablemente mejor que Q2_K, que IQ3_S probablemente supera a Q3_K_M y que IQ4_XS es preferible a IQ4_NL.

## Capacidades

- Generacion de texto conversacional en turco, segun los tags del repositorio (`conversational`, `text-generation-inference`, `llm`).
- Generacion de texto general y continuacion de contexto; no se documentan capacidades especificas de razonamiento, matematicas o codigo.
- Soporte declarado de `text-generation-inference` (TGI) por tags, ademas del uso estandar en `transformers`/`llama.cpp`.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues no confirmadas: los tags y la model card declaran unicamente turco (`tr`, `turkish`, `türkçe`).
- Compatibilidad con endpoints (`endpoints_compatible`) como tag de HuggingFace.

## Casos de uso

- Atencion al cliente en turco: el modelo esta entrenado especificamente para ese idioma, por lo que puede gestionar conversaciones multi-turno con usuarios turcoparlantes donde un modelo multilingue generico rinde peor. Requiere verificar previamente la longitud de contexto real del modelo base.
- Asistentes conversacionales locales en hardware de consumo: con la cuantizacion i1-Q4_K_M (9,1 GB) es viable desplegar un asistente de 14B en una GPU de 12-16 GB sin depender de APIs externas.
- Generacion de contenido editorial en turco: redaccion de borradores, resumenes y reescritura de textos en turco para medios, marketing o documentacion interna.
- Procesamiento de documentacion empresarial turca: clasificacion, extraccion y resumen de textos administrativos o legales en turco, siempre con supervision humana por el riesgo de alucinacion.
- Chatbots de soporte tecnico para mercado turco: integracion via TGI o llama.cpp en una infraestructura propia para responder consultas frecuentes con conocimiento inyectado por prompt.
- Experimentacion academica en PLN turco: evaluacion comparativa de cuantizaciones (i1 frente a estaticas) sobre tareas de generacion en turco, usando el fichero imatrix para reproducir el pipeline.
- Despliegue en el borde o en CPU: las cuantizaciones mas agresivas (IQ2_M, 5,4 GB; Q2_K, 5,9 GB) permiten ejecucion en CPU con RAM moderada o en GPUs de gama media-baja, a costa de degradacion de calidad.
- Prototipado rapido de aplicaciones de chat con Ollama o llama.cpp: la variedad de tamanos permite iterar entre velocidad y calidad sin cambiar de modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y la busqueda web realizada no ha devuelto documentacion tecnica relevante sobre el modelo (los resultados obtenidos no guardan relacion con Erk-14B). Tampoco se aportan cifras de perplejidad comparativas entre las distintas cuantizaciones, mas alla de la referencia grafica generica al enlace externo `quantpplgraph.png` de ikawrakow.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV + overhead de runtime aproximado):
  - i1-IQ2_M (5,4 GB): ~7 GB de VRAM.
  - i1-Q2_K (5,9 GB): ~7,5 GB de VRAM.
  - i1-IQ3_XXS (6,0 GB): ~8 GB de VRAM.
  - i1-IQ3_M (7,0 GB): ~9 GB de VRAM.
  - i1-Q3_K_M (7,4 GB): ~9,5 GB de VRAM.
  - i1-IQ4_XS (8,2 GB): ~10 GB de VRAM.
  - i1-Q4_K_S (8,7 GB): ~10,5 GB de VRAM.
  - i1-Q4_K_M (9,1 GB): ~11 GB de VRAM.
  - i1-Q6_K (12,2 GB): ~14 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100. Para las cuantizaciones Q4 y superiores conviene disponer de 12 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en configuraciones de 8-16 GB segun cuantizacion. Las variantes IQ2/IQ3 y Q4_K_S encajan en GPUs de 8-10 GB; Q4_K_M y Q6_K requieren 11-14 GB.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio y otros runtimes compatibles con GGUF. El tag `text-generation-inference` sugiere compatibilidad con TGI para despliegue en servidor, aunque TGI suele trabajar con pesos safetensors y no con GGUF.
- Latencia y throughput: no disponibles. Dependen del hardware, del backend y de la cuantizacion elegida; no se aportan cifras en la documentacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base, por lo que la comparativa se limita a caracteristicas objetivas de formato y distribucion dentro del propio ecosistema Erk-14B.

| Version | Formato | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Erk-14B-i1-GGUF (este repo) | GGUF con cuantizaciones imatrix i1 | 14,77B | tr | ecloud-open-community-license | Publico en HuggingFace |
| mradermacher/Erk-14B-GGUF | GGUF con cuantizaciones estaticas | 14,77B | tr | ecloud-open-community-license | Publico en HuggingFace |
| ecloudtech/Erk-14B | Pesos originales (safetensors, presumiblemente) | 14,77B | tr | ecloud-open-community-license | Publico en HuggingFace |

Comparativa con alternativas de otros desarrolladores: no disponible en la informacion proporcionada. No se han facilitado modelos de referencia equivalentes en tamano, idioma o licencia con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo entrenado predominantemente en turco, es previsible un sesgo cultural y linguistico hacia ese contexto, aunque no se aportan evaluaciones al respecto.
- Riesgo de alucinacion: no se aportan datos de evaluacion de fidelidad factual. Como en cualquier LLM de 14B, la generacion puede producir informacion incorrecta con aparente seguridad, especialmente en dominios especializados.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada, lo que impide planificar usos con ventanas largas. El modelo esta declarado unicamente para turco; su comportamiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- Restricciones de licencia: la ecloud-open-community-license es una licencia propia del autor del modelo base, no una licencia de codigo abierto estandar. Antes de cualquier uso comercial es imprescindible revisar el fichero LICENSE del repositorio base y del repositorio de cuantizacion. El tag de HuggingFace indica `license:other`.
- Caveat de calidad por cuantizacion: el autor advierte explicitamente de que algunas variantes tienen calidad inferior a otras de tamano similar (por ejemplo, IQ3_XXS es "lower quality" y se recomienda IQ3_S frente a Q3_K_M). Elegir una cuantizacion demasiado agresiva (IQ2, Q2) puede degradar notablemente la coherencia del modelo.
- Repositorio con 0 descargas y 0 likes en el momento del registro: no hay validacion de la comunidad ni informes de uso que respalden su comportamiento en produccion.
- Fechas de creacion y actualizacion registradas como 2026-09-21, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de depender de el.
- El modelo base no incluye model card tecnica detallada en la informacion disponible: sin datos de dataset, contexto ni proceso de alineacion, la evaluacion previa al despliegue es obligatoria.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Erk-14B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Erk-14B-GGUF
- Modelo base: https://huggingface.co/ecloudtech/Erk-14B
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Erk-14B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Erk-14B-i1-GGUF/resolve/main/Erk-14B.imatrix.gguf
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
