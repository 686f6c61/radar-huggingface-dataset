# Sleem247/qwen-0.5b-law-phase1-Q8_0-GGUF

## Resumen

Sleem247/qwen-0.5b-law-phase1-Q8_0-GGUF es una cuantizacion en formato GGUF (tipo Q8_0) del modelo rzeraat/qwen-0.5b-law-phase1, un ajuste experimental de Qwen2.5-0.5B orientado al dominio del derecho de sociedades (company law). El modelo base parte de la arquitectura Qwen2.5 y ha sido sometido a un proceso de continued pretraining sobre corpus juridico en ingles, segun indican las etiquetas del repositorio. El autor de la cuantizacion es Sleem247 y el artefacto se ha generado con la herramienta GGUF-my-repo de ggml.ai sobre llama.cpp.

Se trata de un modelo muy pequeno: 494.032.768 parametros totales (aproximadamente 0,5 mil millones), lo que lo situa en la categoria de modelos ligeros aptos para ejecucion en CPU y en GPUs de consumo. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. El repositorio ocupa 0,5 GB, coherente con el formato Q8_0 de 8 bits.

Su relevancia es acotada y de caracter experimental: no es un modelo de produccion ni compite con modelos legales de mayor tamano, sino una prueba de concepto de adaptacion de dominio sobre una base pequena. Resulta util para experimentar con inferencia local de bajo coste en tareas de texto juridico sencillas, y como referencia para quienes estudian el efecto del continued pretraining en modelos de menos de 1B de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`) |
| Tipos de cuantizacion | Q8_0 (GGUF, 8 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen-0.5b-law-phase1-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5 en su variante de 0,5B parametros: un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm y las innovaciones propias de la familia Qwen2.5 (RoPE para posiciones, atencion con query/key/value bias segun la implementacion original). Sobre esa base, el autor del modelo original (rzeraat) aplico continued pretraining con corpus de derecho de sociedades en ingles, segun las etiquetas `legal`, `company-law` y `continued-pretraining`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o SFT posteriores al continued pretraining. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La cuantizacion Q8_0 se genero con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai, sin modificaciones arquitectonicas respecto al checkpoint original.

## Capacidades

- Generacion de texto en ingles, con especializacion declarada en terminologia y conceptos de derecho de sociedades.
- Razonamiento basico y respuesta a preguntas sobre textos juridicos sencillos, limitado por el tamano del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documentan modos especiales (thinking mode, vision, audio).
- Inferencia local via llama.cpp, con soporte de CLI y servidor HTTP compatible con la API de OpenAI (etiqueta `endpoints_compatible`).

## Casos de uso

- Prototipado de asistentes juridicos locales: el modelo puede desplegarse en un portatil sin GPU dedicada gracias a sus ~0,5 GB en Q8_0, para experimentar con respuestas sobre conceptos basicos de derecho de sociedades antes de invertir en modelos mayores.
- Clasificacion y etiquetado de fragmentos de contratos societarios: con prompts bien acotados, puede asignar categorias a parrafos de estatutos, actas o pactos de socios en pipelines de preprocesamiento.
- Generacion de borradores de texto juridico de baja criticidad: redaccion de resumenes o explicaciones divulgativas de clausulas, siempre con revision humana obligatoria.
- Educacion y formacion: como base para demos interactivas que expliquen nociones de company law en ingles, ejecutables en entornos con recursos minimos.
- Investigacion sobre continued pretraining: sirve como caso de estudio reproducible del efecto de adaptar un modelo de 0,5B a un dominio especializado, comparandolo con el Qwen2.5-0.5B original.
- Pruebas de integracion con llama.cpp: validacion de pipelines de inferencia local, servidores compatibles con OpenAI y despliegues en contenedores ligeros antes de escalar a modelos mayores.
- Filtrado y triaje en bufetes o departamentos juridicos: primera pasada para descartar documentos irrelevantes en un corpus, dejando la revision final a modelos mayores o a profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-0,8 GB en Q8_0 (pesos de ~0,5 GB mas overhead de contexto y cache KV).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090) e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (previa importacion del GGUF), y cualquier runtime compatible con GGUF. No se documenta soporte nativo en vLLM o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja en CPU moderna y tasas de generacion superiores a las de modelos de 7B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sleem247/qwen-0.5b-law-phase1-Q8_0-GGUF | 494 M | no disponible | Apache 2.0 | GGUF Q8_0 | Continued pretraining en company law, experimental |
| rzeraat/qwen-0.5b-law-phase1 (modelo base) | 494 M | no disponible | Apache 2.0 | safetensors | Checkpoint original sin cuantizar |
| Qwen2.5-0.5B (modelo de partida) | 494 M | 32.768 tokens (segun documentacion de Qwen2.5) | Apache 2.0 | safetensors, GGUF | Modelo generalista multilingue |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (segun documentacion de Qwen2.5) | Apache 2.0 | safetensors, GGUF | Variante alineada para instrucciones |

La comparativa se limita a la familia de origen porque no se dispone de datos de rendimiento del modelo especializado que permitan contrastarlo con alternativas legales de mayor tamano.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal; no hay evidencia publicada de calidad en tareas juridicas reales.
- Riesgo elevado de alucinacion: con 0,5B de parametros, la probabilidad de generar citas, articulos o jurisprudencia inexistentes es alta. No debe usarse como fuente de asesoramiento juridico.
- Sesgos: al entrenarse sobre corpus en ingles de derecho de sociedades, refleja sesgos del dataset y de la jurisdiccion representada; no cubre el ordenamiento juridico espanol ni el de otros paises.
- Limitaciones de idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: no se documenta la longitud de contexto efectiva tras el continued pretraining; el ejemplo de la model card usa 2048 tokens, muy por debajo de los 32.768 del Qwen2.5 original.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantias y la falta de validacion hacen desaconsejable su uso en produccion sin evaluacion previa.
- Sin soporte documentado de tool calling ni de agentes, lo que limita su integracion en flujos automatizados complejos.
- Cero descargas y cero likes en el momento de la ficha: no hay senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sleem247/qwen-0.5b-law-phase1-Q8_0-GGUF
- Modelo base: https://huggingface.co/rzeraat/qwen-0.5b-law-phase1
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
