# mradermacher/Reelva-12B-GGUF

## Resumen

Reelva-12B-GGUF es la distribucion en formato GGUF del modelo Reelva-12B, un modelo de lenguaje de aproximadamente 11.900 millones de parametros desarrollado por reelva y cuantizado por mradermacher. El modelo base esta etiquetado por su autor como orientado a conversacion, uso agentico y companion-ai, con soporte declarado para indonesio e ingles. Esta version GGUF permite ejecutar el modelo en llama.cpp, Ollama y otros runners compatibles, algo imposible con los pesos originales en safetensors para la mayoria de equipos de consumo.

La relevancia de esta ficha radica en que el repositorio GGUF es la via practica de despliegue del modelo: incluye 12 cuantizaciones estaticas (desde Q2_K de 4,9 GB hasta Q8_0 de 12,8 GB) mas dos ficheros mmproj (f16 y Q8_0) que apuntan a un componente multimodal. La licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

No obstante, la informacion publicada es muy limitada: la model card del repositorio GGUF es la plantilla estandar de mradermacher y no aporta datos sobre arquitectura interna, longitud de contexto, datos de entrenamiento ni benchmarks. Los datos tecnicos disponibles provienen del recuento de parametros en safetensors y de las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base reelva/Reelva-12B; familia transformer segun el ecosistema transformers, sin detalle publicado) |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en f16 y Q8_0 |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en reelva/Reelva-12B |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base en la documentacion disponible. El repositorio declara la libreria transformers y el pipeline de conversion hf, lo que indica que el modelo original se distribuye en safetensors con configuracion compatible con transformers, pero no se detalla si emplea atencion completa, atencion lineal, mezcla de expertos u otra variante. Tampoco se especifican el numero de capas, dimensiones ocultas, cabezas de atencion ni el vocabulario.

Respecto al entrenamiento, la model card no aporta datos sobre volumen de tokens, composicion del dataset, fases de alineacion (RLHF, DPO) ni tecnicas de optimizacion. Las unicas pistas son las etiquetas del repositorio: conversational, agentic y companion-ai, que sugieren un ajuste orientado a dialogos multi-turno y a interacciones de tipo asistente personal. La presencia de ficheros mmproj en el repositorio GGUF indica que el modelo base incorpora un proyector multimodal, presumiblemente para entrada de imagenes, aunque no se documenta el codificador visual asociado.

## Capacidades

- Generacion de texto conversacional en indonesio e ingles, segun los idiomas declarados.
- Orientacion agentica declarada por las etiquetas del autor (agentic), sin detalle publicado sobre soporte real de tool calling o function calling.
- Perfil companion-ai: disenado presumiblemente para interacciones de acompanamiento y dialogo sostenido.
- Soporte multimodal potencial: la presencia de ficheros mmproj f16 y Q8_0 sugiere capacidad de procesar imagenes junto con texto, aunque no se documenta el alcance.
- No se confirma soporte de modo thinking, razonamiento extendido, codigo especializado ni matematicas avanzadas.

## Casos de uso

- Asistentes conversacionales en indonesio: el modelo declara soporte nativo de id, lo que lo hace adecuado para chatbots de atencion al cliente en ese mercado, aunque la longitud de contexto no esta documentada y debe validarse empiricamente.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S (7,1 GB) y Q4_K_M (7,5 GB) caben en GPU con 8-12 GB de VRAM, permitiendo prototipos locales sin infraestructura cloud.
- Aplicaciones de companion-ai: el perfil declarado encaja con asistentes personales de dialogo prolongado, con la salvedad de que la ventana de contexto real debe medirse antes de comprometerse con conversaciones largas.
- Procesamiento de imagenes y texto combinados: si el componente mmproj funciona correctamente en llama.cpp, el modelo podria usarse para descripcion de imagenes o respuesta a preguntas visuales, aunque esta capacidad no esta validada en la documentacion.
- Experimentacion agentica en local: la etiqueta agentic sugiere uso en flujos multi-paso, pero al no documentarse tool calling, conviene probar el comportamiento antes de integrarlo en produccion.
- Fine-tuning sobre la base: al estar bajo Apache 2.0 y disponible en transformers, puede servir como punto de partida para ajustes especificos en indonesio o ingles sin restricciones de licencia.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes, util para medir el impacto de la cuantizacion en calidad y velocidad dentro de un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto, aproximada):
  - Q2_K: ~5-6 GB
  - Q3_K_M: ~7 GB
  - Q4_K_S / Q4_K_M: ~8-9 GB
  - Q5_K_M: ~10 GB
  - Q6_K: ~11-12 GB
  - Q8_0: ~14-15 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 para Q4_K_M; RTX 4090 24 GB para Q6_K y Q8_0; A100 o H100 para despliegue con contexto largo o alto throughput.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando Q4_K_S o Q4_K_M; Q2_K y Q3 permiten incluso GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y runners compatibles con GGUF; los ficheros mmproj requieren un runner con soporte multimodal (llama.cpp con llava o similar).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Reelva-12B-GGUF | ~11,9 B | no disponible | Apache 2.0 | Si (12 cuantizaciones) | Idiomas id/en, perfil companion |
| Mistral-Nemo-12B | 12 B | 128K | Apache 2.0 | Si | Multilingue amplio, benchmarks publicos |
| Gemma 2 9B | 9 B | 8K | Gemma license | Si | Buen rendimiento en razonamiento |
| Qwen2.5-14B | 14,7 B | 128K | Apache 2.0 | Si | Multilingue, fuerte en codigo |

La comparativa es orientativa: no hay benchmarks publicados de Reelva-12B que permitan situarlo frente a estas alternativas, y su soporte idiomatico se limita a indonesio e ingles.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- Documentacion minima: la model card del GGUF es una plantilla generica; no hay informacion sobre contexto, entrenamiento ni alineacion.
- Sesgos desconocidos: al no documentarse el dataset, no pueden evaluarse sesgos de genero, culturales o politicos.
- Riesgo de alucinacion: inherente a modelos de este tamano y sin datos de evaluacion de fidelidad.
- Cobertura idiomatica limitada: solo indonesio e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Capacidad multimodal no validada: los ficheros mmproj estan presentes pero no se especifica que runner o codificador visual los soporta correctamente.
- Uso comercial: permitido por Apache 2.0, pero conviene verificar la licencia del modelo base reelva/Reelva-12B por si difiere.
- Advertencia sobre el contexto: sin longitud documentada, no debe asumirse una ventana larga en produccion sin medirla.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Reelva-12B-GGUF
- Modelo base: https://huggingface.co/reelva/Reelva-12B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Reelva-12B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Reelva-12B-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
