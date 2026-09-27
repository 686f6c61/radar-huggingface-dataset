# SoAIHQ/gemma-4-E2B-it-GGUF

## Resumen

SoAIHQ/gemma-4-E2B-it-GGUF es una compilacion de pesos en formato GGUF del modelo google/gemma-4-E2B-it, publicada por SoAI para su uso con llama.cpp. Se trata de la variante mas pequena de la familia Gemma 4 de Google, un modelo denso con embeddings por capa, ventana de contexto de 131.072 tokens (128K) y capacidad multimodal de entrada de texto, imagen y audio. La model card describe el modelo como "any-to-any" y destaca que admite razonamiento configurable (modo thinking activable por peticion) y tool calling con sintaxis nativa.

La relevancia de esta ficha esta en el proceso de cuantizacion: SoAI ha generado los ficheros Q4_K_M mediante una matriz de importancia (imatrix) calculada con un corpus de calibracion propio (chat multi-turno en 21 idiomas, ediciones de codigo en 22 lenguajes de programacion, tool calls, matematicas paso a paso y prosa web) en lugar de texto generico. El repositorio incluye Q4_K_M (3,4 GB), Q8_0 (5,0 GB) y un proyector multimodal mmproj en F16 (985,7 MB) necesario para entrada de imagen y audio.

El modelo base tiene 2,3B de parametros efectivos segun la model card (5,1B incluyendo embeddings), mientras que el recuento de safetensors del modelo base asciende a 4.647.450.147 parametros. Esta discrepancia entre "parametros efectivos" y parametros totales es una convencion habitual en esta gama de modelos y conviene tenerla presente al estimar recursos. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, con embeddings por capa (per-layer embeddings) |
| Parametros totales | 4.647.450.147 (safetensors del modelo base); la model card indica 2,3B efectivos y 5,1B incluyendo embeddings |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q4_K_M, Q8_0; proyector multimodal mmproj en F16 |
| Idiomas soportados | 35+ idiomas (preentrenado en 140+, segun la model card) |
| Licencia | apache-2.0 en metadatos y model card, con enlace a la licencia de Gemma 4 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 9,4 GB |
| Tamano de ficheros | Q4_K_M: 3,4 GB; Q8_0: 5,0 GB; mmproj F16: 985,7 MB |
| Version de llama.cpp referenciada | v0.5.0 |
| Ajustes de muestreo recomendados | temperature 1.0, top_p 0.95, top_k 64 |

## Arquitectura y entrenamiento

El modelo base es una arquitectura densa con embeddings por capa, una tecnica que reduce el coste efectivo de los parametros al distribuir representaciones por capa en lugar de concentrarlas en una unica matriz de embedding de gran tamano. Esto explica la distincion entre parametros efectivos (2,3B) y parametros totales con embeddings (5,1B) que aparece en la model card. El modelo admite una ventana de contexto de 131.072 tokens y entrada multimodal de texto, imagen y audio, gestionada mediante un proyector mmproj que debe cargarse por separado. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El proceso de cuantizacion de SoAI es el elemento diferencial de este repositorio. Q4_K_M se cuantiza con una imatrix calculada sobre un corpus propio formateado con la plantilla de chat nativa del modelo, incluyendo su sintaxis de tool calls; el archivo imatrix se publica en el repositorio junto con una tabla de procedencia que fija la revision original y el commit de llama.cpp para permitir reconstruir los ficheros. Q8_0 se cuantiza sin imatrix, ya que el formato Q8_0 de llama.cpp no la utiliza. Antes de cuantizar, el proceso verifica que los marcadores de chat, thinking y tool calling se almacenen como tokens especiales y que la plantilla de chat incrustada coincida con la original, deteniendo la publicacion si la conversion los importa como texto plano. El modo razonamiento se activa por peticion mediante `"chat_template_kwargs": {"enable_thinking": true}`.

## Capacidades

- Generacion de texto conversacional en 35+ idiomas.
- Entrada de imagen: descripcion, comprension visual y tareas any-to-any (requiere el fichero mmproj).
- Entrada de audio: procesamiento de voz (requiere el fichero mmproj).
- Razonamiento configurable: modo thinking activable o desactivable por peticion.
- Tool calling / function calling con sintaxis nativa del modelo.
- Soporte para flujos de agente y razonamiento multi-paso mediante tool calls.
- Contexto largo de 131.072 tokens para documentos extensos o conversaciones prolongadas.
- Edicion y generacion de codigo (el corpus de calibracion incluye 22 lenguajes de programacion).
- Capacidad de matematicas paso a paso (presente en el corpus de calibracion).
- Despliegue local con llama.cpp, con API compatible con OpenAI a traves de llama-server.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno extensas y conservar contexto hasta 128K tokens, lo que permite adjuntar historiales completos o bases de conocimiento sin truncar.
- Asistente local con entrada de imagen: gracias al proyector mmproj, se puede desplegar en un portatil para describir capturas, extraer texto de imagenes o responder preguntas sobre diagramas sin enviar datos a la nube.
- Procesamiento de audio en el borde: la entrada de voz permite construir interfaces de dictado, resumen de reuniones o transcripcion asistida en equipos sin GPU dedicada.
- Agente de codigo en local: con tool calling nativo, puede integrarse en un entorno de desarrollo para invocar funciones, consultar repositorios o aplicar ediciones guiadas en pipelines controlados.
- Analisis de documentos largos: con 131.072 tokens de contexto, es adecuado para resumir contratos, informes tecnicos o expedientes extensos manteniendo la coherencia entre secciones.
- Razonamiento controlado por coste: al poder desactivar el modo thinking, se puede usar el modelo en tareas simples (clasificacion, extraccion, respuestas directas) y activarlo solo en consultas que requieran razonamiento.
- Chatbot embebido en aplicaciones de escritorio o moviles mediante llama.cpp, al caber en 3,4 GB con Q4_K_M.
- Generacion asistida de codigo en CI/CD: procesar diffs y sugerir cambios invocando herramientas externas, con la ventaja de ejecutarse en infraestructura propia.
- Prototipado multimodal en investigacion: por su tamano reducido, sirve como base para experimentos que requieran entrada combinada de texto, imagen y audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y los metadatos de HuggingFace no aportan datos de rendimiento.

## Requisitos de hardware

- VRAM para Q4_K_M: aproximadamente 3,4 GB de pesos. Sumando el mmproj F16 (~1 GB) y una ventana de contexto moderada, se estiman entre 6 y 8 GB de VRAM. Estimacion orientativa, no confirmada por el autor.
- VRAM para Q8_0: aproximadamente 5,0 GB de pesos. Con mmproj y contexto moderado, se estiman entre 8 y 10 GB. Estimacion orientativa.
- Contexto: el consumo de memoria de la cache KV crece con la longitud de contexto configurada; con 128K tokens la demanda puede superar con holgura la de los pesos, por lo que se recomienda ajustar `n_ctx` al caso de uso real.
- GPU de consumo: Q4_K_M cabe en tarjetas de 8-12 GB como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; Q8_0 requiere preferiblemente 12 GB o mas.
- GPU de gama alta: A100, H100 y RTX 4090 pueden ejecutar cualquier cuantizacion publicada con contexto amplio y margen para lotes.
- Despliegue: llama.cpp, llama-server (API compatible con OpenAI y UI de chat integrada), Ollama, LM Studio o Jan, todos ellos consumidores de GGUF. vLLM y TGI no estan optimizados para GGUF en esta distribucion.
- Descarga directa: `hf download SoAIHQ/gemma-4-E2B-it-GGUF --include "gemma-4-E2B-it-Q4_K_M.gguf" "mmproj-*"`
- Arranque rapido: `llama-server -hf SoAIHQ/gemma-4-E2B-it-GGUF:Q4_K_M` (descarga el mmproj automaticamente si se usa con entrada multimodal).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| SoAIHQ/gemma-4-E2B-it-GGUF (esta ficha) | 4,65B totales; 2,3B efectivos segun la card | 131.072 tokens | Texto, imagen y audio | apache-2.0 en metadatos; enlace a licencia Gemma 4 | GGUF (Q4_K_M, Q8_0) | Repositorio HF con 0 descargas |
| google/gemma-4-E2B-it (modelo base) | 4,65B (safetensors) | 131.072 tokens | Texto, imagen y audio | Licencia Gemma 4 (segun enlace del autor) | safetensors (formato original) | Modelo original de Google |
| google/gemma-3n-E2B-it (generacion anterior, mismo enfoque de parametros efectivos) | no disponible | no disponible | Texto, imagen y audio | Licencia Gemma | safetensors, GGUF de terceros | Ampliamente distribuido |
| google/gemma-3-4b-it (gama similar sin embeddings por capa) | no disponible | no disponible | Texto e imagen | Licencia Gemma | safetensors, GGUF | Ampliamente distribuido |

Nota: los datos de rendimiento comparado no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, contexto, modalidad y licencia.

## Limitaciones y advertencias

- No hay benchmarks publicados que respalden el rendimiento del modelo ni de las cuantizaciones, por lo que la calidad real debe validarse en el caso de uso concreto.
- Q4_K_M introduce perdida de precision respecto a los pesos originales; para tareas sensibles a matices (codigo complejo, matematicas avanzadas) Q8_0 puede ser preferible si la memoria lo permite.
- El modelo base, con 2,3B parametros efectivos, tiene menor capacidad de razonamiento que modelos de mayor tamano; es probable que falle en tareas de logica larga o conocimiento especializado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente fuera de los idiomas mejor representados y en dominios tecnicos.
- La model card afirma soporte de 35+ idiomas, pero no detalla la calidad por idioma; el rendimiento puede degradarse en lenguas minoritarias.
- Discrepancia de licencia: los metadatos y el README indican apache-2.0, pero la model card enlaza a la licencia de Gemma 4. Antes de uso comercial conviene verificar que licencia se aplica realmente a los pesos derivados.
- El repositorio presenta 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre la calidad de la cuantizacion.
- La carga multimodal requiere el fichero mmproj adicional; si se omite, el modelo funcionara unicamente con texto aunque la plantilla de chat espere modalidades adicionales.
- Contexto de 128K: la cache KV correspondiente puede consumir mas memoria que los propios pesos; configurar un `n_ctx` excesivo puede provocar OOM.
- Los marcadores especiales de chat, thinking y tool calling dependen de una conversion correcta; segun el autor, un fallo en este paso rompe turnos, razonamiento y tool calls sin emitir ningun error.
- No se dispone de informacion sobre sesgos especificos, composicion del dataset de entrenamiento ni datos de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF
- Ficheros del repositorio: https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF/tree/main
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia referenciada de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Sitio de SoAI: https://soai.to
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Descarga directa Q4_K_M: https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q4_K_M.gguf
- Descarga directa Q8_0: https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q8_0.gguf
- Proyector multimodal mmproj F16: https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF/resolve/main/mmproj-gemma-4-E2B-it-f16.gguf
