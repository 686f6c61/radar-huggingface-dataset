# 0xzknw/LFM3-VL-2B-EXL3-8bpw

## Resumen

LFM3-VL-2B-EXL3-8bpw es una cuantizacion EXL3 a 8 bits por peso del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por el usuario 0xzknw. El modelo base lo desarrolla Liquid AI y pertenece a la familia LFM3, orientada a tareas de imagen-a-texto con arquitectura propia de Liquid AI (lfm3_vl). Esta version no es un modelo nuevo, sino un checkpoint cuantizado que conserva la configuracion, el tokenizador y los pesos del modelo original en formato EXL3.

El objetivo de esta publicacion es reducir el espacio y los requisitos de memoria del modelo base manteniendo una fidelidad numerica razonable. El repositorio ocupa 2,7 GB y contiene 1.354.003.456 parametros segun los safetensors publicados. La cuantizacion afecta tanto a las proyecciones del lenguaje como a las de vision, calibradas a 8 bits.

Es relevante para quienes necesitan desplegar un modelo vision-lenguaje pequeno en entornos con VRAM limitada y ya trabajan con el ecosistema ExLlamaV3. No obstante, la model card advierte de que las comprobaciones de fidelidad son estrechas (una imagen sintetica y 24 posiciones de texto) y no constituyen un benchmark general de VQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm3_vl (familia LFM3 de Liquid AI, multimodal imagen-texto) |
| Parametros totales | 1.354.003.456 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 8 bits por peso (8bpw), proyecciones de lenguaje y vision calibradas |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (checkpoint EXL3, no pesos BF16 convencionales) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM3-VL-2B, un modelo de la familia LFM3 de Liquid AI con pipeline image-text-to-text. La arquitectura registrada es lfm3_vl, propia de Liquid AI; la informacion disponible no detalla si emplea atencion lineal, SSM hibrido u otro esquema, por lo que ese extremo queda como no disponible. El modelo combina procesamiento de imagen y texto, con proyecciones de vision y de lenguaje cuantizadas de forma independiente en esta version.

El entrenamiento del modelo base no se documenta en la informacion proporcionada: no se indican numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Esta publicacion se limita a la conversion a EXL3 mediante las herramientas de ExLlamaV3, con calibracion a 8 bits de las proyecciones de lenguaje y vision. La model card reporta como comprobacion de fidelidad un KL multimodal de 0,002094 y una L2 relativa de features de 0,010045 sobre una imagen sintetica retenida y 24 posiciones de texto.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y conversacion multimodal.
- Conversacion multi-turno, segun la etiqueta "conversational" del repositorio.
- Procesamiento conjunto de entradas de imagen y texto mediante las proyecciones de vision cuantizadas.
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Descripcion automatica de imagenes: el modelo puede generar texto a partir de una imagen, adecuado para etiquetado, accesibilidad o catalogacion de contenido visual.
- Respuesta a preguntas visuales (VQA) en entornos con VRAM limitada: al ser una cuantizacion de 8 bits de un modelo de 1,35 mil millones de parametros, encaja en despliegues donde el modelo base en BF16 no cabria.
- Asistentes conversacionales con entrada de imagen: la etiqueta "conversational" y el pipeline image-text-to-text permiten integrarlo en flujos de chat que reciben capturas o fotografias.
- Prototipado e investigacion en el ecosistema ExLlamaV3: util para validar pipelines de inferencia EXL3 con un modelo vision-lenguaje pequeno antes de escalar a modelos mayores.
- Extraccion de informacion de documentos escaneados o capturas: el modelo puede transcribir y resumir contenido visual en texto, siempre que la precision requerida lo permita.
- Despliegue en hardware de gama consumer: el tamano del repositorio (2,7 GB) facilita la ejecucion local en GPU con memoria moderada, sujeto a la compatibilidad del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye comprobaciones numericas de fidelidad de la cuantizacion (KL multimodal de 0,002094 y L2 relativa de features de 0,010045 sobre una imagen sintetica y 24 posiciones de texto), que no constituyen un benchmark general de VQA.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,7 GB, por lo que la inferencia en EXL3 a 8bpw deberia requerir un orden de magnitud similar de memoria para los pesos, mas overhead de runtime y cache KV; no se proporcionan cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU consumer: probable dado el tamano, pero no confirmada en la informacion disponible.
- Despliegue: requiere un runtime compatible con LFM3-VL y EXL3 MCG, como MLXL3 (https://github.com/0xZKnw/mlxl3). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-EXL3-8bpw (este) | 1.354.003.456 | no disponible | EXL3 safetensors (8bpw) | lfm-open-license-v1.0 | Cuantizacion EXL3 del modelo base |
| LiquidAI/LFM3-VL-2B | no disponible en la informacion | no disponible | BF16 (presumible) | lfm-open-license-v1.0 | Modelo base sin cuantizar |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La fidelidad de la cuantizacion se valido con una unica imagen sintetica y 24 posiciones de texto; no hay evidencia de rendimiento en benchmarks reales de VQA.
- El archivo .safetensors es un checkpoint EXL3, no pesos BF16 ordinarios; cargarlo con runtimes genericos fallara o dara resultados incorrectos.
- Requiere un runtime especifico compatible con LFM3-VL y EXL3 MCG (MLXL3); la compatibilidad con otros motores de inferencia no esta documentada.
- La licencia lfm-open-license-v1.0 esta etiquetada como "other" en Hugging Face; es necesario revisar sus terminos para uso comercial antes de desplegar.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni longitud de contexto, por lo que estos extremos no pueden evaluarse.
- Las afirmaciones de benchmarks del modelo upstream no validan por si mismas esta cuantizacion, segun advierte la propia model card.
- El modelo base es de 1,35 mil millones de parametros; su capacidad absoluta es limitada en comparacion con modelos mayores, lo que condiciona la precision en tareas complejas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xzknw/LFM3-VL-2B-EXL3-8bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Runtime MLXL3: https://github.com/0xZKnw/mlxl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Perfil del autor: https://huggingface.co/0xzknw
- Licencia: LICENSE (en el repositorio)
- Aviso de modificacion: NOTICE (en el repositorio)
- Model card archivada del origen: SOURCE_MODEL_CARD.md (en el repositorio)
- Documentacion del modelo upstream: UPSTREAM_MODEL_CARD.md (en el repositorio)
- Informes de validacion: source-evidence/validation/ (en el repositorio)
- Manifiesto de origen: source-evidence/manifest.json (en el repositorio)
