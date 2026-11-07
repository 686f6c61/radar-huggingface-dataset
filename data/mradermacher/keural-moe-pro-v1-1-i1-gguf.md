# mradermacher/Keural-MoE-Pro-v1.1-i1-GGUF

## Resumen

Keural-MoE-Pro-v1.1-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base `mkd-ai/Keural-Nova-1.1`, un modelo de arquitectura Mixture of Experts (MoE) afinado con LoRA para instrucciones en coreano e ingles. El modelo original no lo desarrolla mradermacher: este repositorio es unicamente el trabajo de cuantizacion (estatica e imatrix) del modelo de terceros, publicado bajo licencia Apache 2.0.

El modelo cuenta con aproximadamente 35.500 millones de parametros totales (segun los pesos en safetensors), y al ser MoE solo una fraccion de ellos se activa por token, lo que permite un equilibrio entre capacidad y coste de inferencia. Esta orientado a conversacion e instruction-following, con enfasis en coreano, y esta pensado para desplegarse en entornos locales mediante llama.cpp y derivados.

La relevancia de este repositorio es practica: ofrece el modelo base en multiples niveles de cuantizacion (desde i1-Q2_K de 13,3 GB hasta i1-Q6_K de 29,3 GB), incluyendo variantes imatrix de alta calidad, lo que facilita ejecutarlo en hardware de consumo. No se dispone de informacion publica sobre benchmarks, contexto o detalles de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, afinada con LoRA |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Modelo base | mkd-ai/Keural-Nova-1.1 |
| Tamano del repositorio | 279,2 GB |
| Descargas | 323 |
| Fecha de creacion | 2026-07-16 |

## Arquitectura y entrenamiento

El modelo base `mkd-ai/Keural-Nova-1.1` emplea una arquitectura Mixture of Experts (MoE) con aproximadamente 35,5 mil millones de parametros totales, y ha sido sometido a un proceso de instruction-tuning mediante LoRA, segun las etiquetas del repositorio. La naturaleza MoE implica que solo un subconjunto de parametros (expertos) se activa por token, aunque el numero exacto de parametros activos y el numero de expertos no se detallan en la informacion disponible.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) mas alla del uso de LoRA para el ajuste y la generacion de cuantizaciones imatrix por parte de mradermacher, que mejoran la calidad de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto conversacional e instruction-following, orientado a dialogos multi-turno.
- Soporte de razonamiento general y respuesta a instrucciones en coreano e ingles.
- Capacidades multilingues limitadas a los dos idiomas declarados (ko, en).
- Etiquetado como modelo conversacional ("conversational") y compatible con endpoints.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- No se documenta un modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional en coreano: el modelo puede gestionar dialogos multi-turno en coreano con calidad de instruction-tuning, adecuado para chatbots de atencion al usuario en ese idioma.
- Traduccion asistida coreano-ingles: al soportar ambos idiomas, puede emplearse para tareas de traduccion y adaptacion de contenido entre ko y en.
- Despliegue local en estaciones de trabajo: las cuantizaciones i1-Q4_K_M (21,8 GB) o i1-Q4_K_S (20,5 GB) permiten ejecutarlo en GPUs de consumo de gama alta con suficiente VRAM.
- Prototipado rapido sin GPU dedicada: las variantes i1-Q2_K (13,3 GB) o i1-Q3_K_S (15,6 GB) posibilitan pruebas en equipos con menos memoria, a costa de calidad.
- Generacion de contenido en coreano: redaccion de textos, resumenes y respuestas en un contexto de aplicaciones editoriales o de soporte interno.
- Integracion en pipelines de llama.cpp/Ollama: al estar en GGUF, se puede servir mediante llama.cpp o herramientas compatibles para entornos de inferencia local y sin dependencia de la nube.
- Evaluacion comparativa de cuantizaciones: el fichero imatrix y el amplio rango de quants permiten a investigadores medir el impacto de la cuantizacion en la calidad de un MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero GGUF): ~13,3 GB (i1-Q2_K), ~15,6-15,9 GB (i1-Q3_K_S / IQ3_S / IQ3_M), ~17,3-18,7 GB (Q3_K_M / Q3_K_L), ~19,3-22,5 GB (IQ4_XS / Q4_0 / Q4_K_S / Q4_K_M / Q4_1), ~24,7-29,3 GB (Q5_K_S / Q5_K_M / Q6_K).
- GPU recomendadas: para las variantes Q4 y superiores se recomienda una GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100). Para Q2/Q3 puede bastar con 16-20 GB.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) para cuantizaciones hasta Q5_K_M aproximadamente; las variantes Q6_K requieren cerca de 30 GB y no caben en 24 GB sin offload.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base en transformers puede servirse con vLLM/TGI si se dispone del formato original.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas (contexto, parametros activos) del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas concretas.

| Modelo | Parametros totales | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Keural-MoE-Pro-v1.1 (este) | ~35,5 B (MoE) | no disponible | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo afinado en coreano e ingles, puede presentar sesgos derivados de sus datos de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad.
- Limitaciones de idioma: solo se declaran coreano e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `mkd-ai/Keural-Nova-1.1` de forma independiente.
- Caveat de produccion: las cuantizaciones de baja precision (Q2, Q3) degradan la calidad; para produccion se recomienda Q4_K_M o superior. Ademas, este repositorio es una cuantizacion de terceros, no el modelo oficial, por lo que la responsabilidad de validacion recae en el usuario.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio HF (cuantizaciones imatrix): https://huggingface.co/mradermacher/Keural-MoE-Pro-v1.1-i1-GGUF
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Keural-MoE-Pro-v1.1-GGUF
- Modelo base: https://huggingface.co/mkd-ai/Keural-Nova-1.1
- Pagina de descargas del autor: https://hf.tst.eu/model#Keural-MoE-Pro-v1.1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion (mradermacher): https://huggingface.co/mradermacher/model_requests
- Ficha en free2aitools: https://free2aitools.com/model/mradermacher/keural-moe-pro-v1.1-gguf
