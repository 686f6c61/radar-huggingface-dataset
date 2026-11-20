# mradermacher/CantoneseLLM-6B-preview202402-GGUF

## Resumen

CantoneseLLM-6B-preview202402-GGUF es la version cuantizada en formato GGUF del modelo CantoneseLLM-6B-preview202402, desarrollado originalmente por hon9kon9ize y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de 6.061.035.520 parametros (aproximadamente 6B) especializado en el idioma cantonés (codigo ISO `yue`), derivado del modelo base Yi-6B de 01-ai, lo que se infiere de la licencia yi-license referenciada en la model card.

El modelo resuelve el problema de la escasez de modelos de lenguaje de calidad para el cantonés, un idioma con cientos de millones de hablantes pero con representacion limitada en los corpus de entrenamiento de los grandes modelos multilingues. Al estar empaquetado en GGUF, permite su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPU de datacenter.

La relevancia de esta ficha radica en que el repositorio es una conversion de cuantizacion (no el modelo original), publicada el 17 de diciembre de 2024 y actualizada en noviembre de 2026, con 137 descargas. La informacion disponible sobre arquitectura, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Yi-6B, presumiblemente transformer decoder-only) |
| Parametros totales | 6.061.035.520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | yue (cantonés) |
| Licencia | yi-license (other) |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. El modelo original es hon9kon9ize/CantoneseLLM-6B-preview202402, del que se conoce que cuenta con 6.061.035.520 parametros segun los pesos en safetensors. La licencia yi-license, enlazada al LICENSE de 01-ai/Yi-6B, sugiere fuertemente que el modelo deriva de la familia Yi-6B, aunque no se confirma explicitamente la arquitectura ni los datos de preentrenamiento o ajuste fino.

La model card del repositorio GGUF no incluye informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta informacion se marca como no disponible.

## Capacidades

- Generacion de texto en cantonés: el modelo esta especializado en el idioma `yue`, segun los metadatos del repositorio.
- Conversacion multi-turno: capacidad presumible de un modelo de instrucciones, aunque no se documenta explicitamente el formato de prompt ni el ajuste conversacional.
- Razonamiento y generacion general: heredada del modelo base Yi-6B, sin datos especificos publicados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al cantonés segun los metadatos; no se documenta soporte de chino mandarin, ingles u otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Atencion al cliente en cantonés: el modelo puede gestionar conversaciones en cantonés para usuarios de Hong Kong, Macao y comunidades cantonesas, aprovechando su especializacion idiomatica frente a modelos multilingues genericos que rinden peor en `yue`.
- Procesamiento de contenido local: generacion y resumen de textos en cantonés para medios, redes sociales o documentacion administrativa dirigida a hablantes de este idioma.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_S y Q4_K_M (3,6 y 3,8 GB respectivamente), puede ejecutarse en equipos con GPU de gama media o incluso en CPU mediante llama.cpp, lo que facilita prototipado y uso en entornos con recursos limitados.
- Educacion y preservacion linguistica: generacion de material didactico o ejercicios en cantonés escrito, apoyando la conservacion y ensenanza del idioma.
- Chatbots integrados en aplicaciones moviles o de escritorio: la version Q2_K (2,4 GB) permite embeber el modelo en dispositivos con poca memoria, aunque con perdida de calidad.
- Investigacion en NLP para lenguas de bajos recursos: sirve como punto de partida para experimentos de ajuste fino, evaluacion o comparacion de modelos especializados en `yue`.
- Traduccion asistida cantonés-espanol o cantonés-ingles: no confirmada por la documentacion, pero plausible como uso experimental siempre que se valide su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K: ~2,4 GB de pesos; con overhead de contexto, ~3-4 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~2,8-3,3 GB de pesos; ~4-5 GB con contexto.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~3,4-3,8 GB de pesos; ~5-6 GB con contexto.
  - Q5_K_S / Q5_K_M: ~4,3-4,4 GB de pesos; ~6-7 GB con contexto.
  - Q6_K: ~5,1 GB de pesos; ~7-8 GB con contexto.
  - Q8_0: ~6,5 GB de pesos; ~8-9 GB con contexto.
  - f16: ~12,2 GB de pesos; ~14-16 GB con contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100 para las cuantizaciones mas altas o f16.
- Cabe en GPU de consumo: si, desde GPUs con 6-8 GB de VRAM para cuantizaciones Q4 y superiores; las cuantizaciones Q2/Q3 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), LM Studio, y cualquier runtime compatible con GGUF. El modelo original en safetensors puede desplegarse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| CantoneseLLM-6B-preview202402-GGUF (este) | 6,06B | no disponible | yue | yi-license | GGUF | Cuantizado por mradermacher; 137 descargas |
| Yi-6B (base) | 6B | no disponible | multi (incl. zh, en) | yi-license | safetensors, GGUF | Modelo base del que deriva; no especializado en cantonés |
| Modelos multilingues genericos (p. ej. Qwen2.5-7B) | ~7B | 32K (segun version) | multi | Apache 2.0 / otras | safetensors, GGUF | Mayor cobertura idiomatica pero menor especializacion en `yue` |

La comparacion con alternativas especializadas en cantonés no esta disponible en la informacion proporcionada. No se conocen otros modelos abiertos dedicados exclusivamente a `yue` con los que contrastar directamente.

## Limitaciones y advertencias

- Es una conversion de cuantizacion, no el modelo original: la calidad final depende de la cuantizacion elegida; las versiones Q2_K y Q3_K_M pueden degradar notablemente la calidad (la propia model card marca Q3_K_M como "lower quality").
- Sesgos conocidos: no documentados, pero heredados del modelo base Yi-6B y de los datos de ajuste al cantonés, con riesgo de sesgos linguisticos y culturales no evaluados.
- Riesgo de alucinacion: no cuantificado; como todo modelo de 6B, presenta riesgo de generar contenido incorrecto, especialmente en tareas de conocimiento factual.
- Limitaciones de idioma: el modelo esta etiquetado unicamente como `yue`; su rendimiento en chino mandarin, ingles u otros idiomas no esta garantizado y probablemente sea inferior al del modelo base.
- Restricciones de licencia: la licencia yi-license (other) enlaza al LICENSE de 01-ai/Yi-6B; es imprescindible revisar sus terminos antes de uso comercial, ya que puede incluir restricciones de atribucion o de uso.
- Caveats para produccion: no hay benchmarks publicados, ni documentacion de formato de prompt, ni garantias de calidad; se recomienda evaluacion propia antes de desplegar en entornos productivos.
- El repositorio tiene 0 likes y 137 descargas, lo que indica adopcion muy limitada y poca validacion por parte de la comunidad.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de casos de uso con contexto largo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CantoneseLLM-6B-preview202402-GGUF
- Modelo base original: https://huggingface.co/hon9kon9ize/CantoneseLLM-6B-preview202402
- Licencia Yi-6B: https://huggingface.co/01-ai/Yi-6B/blob/main/LICENSE
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#CantoneseLLM-6B-preview202402-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
