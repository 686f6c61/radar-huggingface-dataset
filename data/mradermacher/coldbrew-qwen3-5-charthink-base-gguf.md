# mradermacher/ColdBrew-Qwen3.5-CharThink-Base-GGUF

## Resumen

ColdBrew-Qwen3.5-CharThink-Base-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo SvalTek/ColdBrew-Qwen3.5-CharThink-Base, realizada por el cuantizador mradermacher. El modelo base es un modelo de generacion de texto de unos 8.953 millones de parametros (dato extraido de los safetensors del repositorio), construido sobre la familia Qwen3.5 y orientado, segun su nombre, a la generacion de personajes y roleplay con razonamiento tipo "thinking" (CharThink). El repositorio cuantizado esta publicado bajo licencia Apache 2.0 y esta pensado para inferencia local con herramientas compatibles con GGUF como llama.cpp u Ollama.

La relevancia de esta ficha reside en la disponibilidad de cuantizaciones que van desde Q2_K (3,9 GB) hasta f16 (18 GB), lo que permite ejecutar el modelo en hardware muy variado, desde portatiles con poca VRAM hasta estaciones de trabajo con GPUs de gama alta. Ademas, el repositorio incluye archivos mmproj (suplementos multimodales) en Q8_0 y f16, lo que sugiere que el modelo base dispone de capacidades de vision que pueden activarse con llama.cpp. Existen tambien cuantizaciones weighted/imatrix en un repositorio hermano del mismo autor.

No se ha publicado una model card detallada del modelo base en la informacion disponible, por lo que varios datos tecnicos (longitud de contexto exacta, datos de entrenamiento, benchmarks) no constan y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en la familia Qwen3.5 (qwen3_5), con suplemento multimodal (mmproj) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base pertenece a la arquitectura Qwen3.5 (tag `qwen3_5`), una familia de transformers decoder-only de Alibaba/Qwen. El nombre "CharThink-Base" sugiere que se trata de una version base (no instruct) afinada para escenarios de interpretacion de personajes con razonamiento explicito (thinking), una tecnica habitual en la familia Qwen3 que genera cadenas de razonamiento antes de la respuesta final. La presencia de archivos mmproj indica que el modelo original incorpora un proyector multimodal para procesar imagenes, aunque el GGUF principal es de texto.

Sobre los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO) no hay informacion publicada en la model card disponible, por lo que no pueden detallarse. En cuanto a la cuantizacion, mradermacher ha generado cuantizaciones estaticas estandar del ecosistema llama.cpp (tipos K-quants e IQ-quants), usando el pipeline de conversion `hf` y con soporte de la libreria unsloth segun los tags del repositorio. Las versiones imatrix (con matriz de importancia ponderada) estan disponibles en un repositorio separado.

## Capacidades

- Generacion de texto en ingles, con enfoque aparente en roleplay e interpretacion de personajes (según la denominacion CharThink del modelo base).
- Razonamiento tipo "thinking": el nombre del modelo base sugiere soporte de cadenas de razonamiento previas a la respuesta, aunque el modo de uso exacto no esta documentado en la informacion disponible.
- Capacidades multimodales potenciales: el repositorio incluye archivos mmproj (Q8_0 y f16), lo que permite usar el modelo con entrada de imagen en llama.cpp si se combinan ambos GGUF.
- Compatibilidad con el ecosistema GGUF: inferencia local en CPU, GPU o hibrida con llama.cpp, Ollama, LM Studio y herramientas similares.
- Etiquetado como `conversational` y `text-generation-inference`, apto para chat e integracion en servidores de inferencia.
- No consta soporte documentado de tool calling, function calling ni capacidades de agentes en la informacion disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el enfoque "CharThink" del modelo base lo hace adecuado para chatbots de personajes, juegos de texto y herramientas de escritura creativa, donde se busca coherencia en la personalidad de los personajes a lo largo de conversaciones largas.
- Prototipado local de asistentes conversacionales: gracias a las cuantizaciones ligeras (Q2_K a Q4_K_M caben en 4-6 GB de VRAM o incluso en RAM), es util para desarrollar y probar agentes de chat sin coste de API.
- Experimentacion con modelos multimodales en local: combinando el GGUF principal con los archivos mmproj, se puede probar comprension de imagenes junto a generacion de texto en llama.cpp.
- Evaluacion comparativa de cuantizaciones: al disponer de toda la gama de K-quants e IQ-quants del mismo modelo, es un buen banco de pruebas para medir el impacto de la cuantizacion en calidad y velocidad.
- Generacion de dialogos para videojuegos o ficcion: como modelo base con razonamiento, puede integrarse en pipelines de generacion procedural de dialogos, ajustando el formato de prompt al esquema del modelo base.
- Investigacion sobre fine-tuning: al ser un modelo base derivado de Qwen3.5 con licencia Apache 2.0, puede servir como punto de partida para nuevos ajustes finos posteriores, usando los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto):
  - Q2_K: ~3,9 GB — cabe en GPUs de 4-6 GB o en CPU.
  - Q4_K_S / Q4_K_M: ~5,5-5,7 GB — cabe en una RTX 3060 de 8 GB o superior con margen para contexto.
  - Q6_K: ~7,5 GB — cabe en GPUs de 8-12 GB (RTX 4070, RTX 3080).
  - Q8_0: ~9,6 GB — cabe en GPUs de 12 GB (RTX 3060 12GB, RTX 4070 Ti).
  - f16: ~18 GB — requiere GPUs de 24 GB (RTX 3090/4090, A100) o reparto CPU/GPU.
  - Si se usa el suplemento mmproj, anadir ~0,7 GB (Q8_0) o ~1,0 GB (f16).
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070/4070 Ti, RTX 4080/4090 para las cuantizaciones altas; para despliegue en servidor, A100 o H100 son opcionales dado el tamano moderado del modelo.
- Cabe comodamente en GPUs de consumo a partir de 6-8 GB con las cuantizaciones Q4; incluso es ejecutable solo con CPU dada su escala de ~9B parametros.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servir con vLLM o TGI, aunque no consta verificacion para esos runtimes.
- Latencia y throughput estimados: no disponible; al ser un modelo de ~9B parametros, en una GPU de consumo con Q4_K_M se pueden esperar velocidades del orden de decenas de tokens por segundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| ColdBrew-Qwen3.5-CharThink-Base (este) | ~8,95B | no disponible | Apache 2.0 | GGUF (esta ficha), safetensors |
| Qwen3 8B (base oficial de la misma familia) | ~8B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF comunitarios |
| Llama 3.1 8B Instruct | 8B | 128K (dato publico) | Llama 3.1 Community License | safetensors, GGUF comunitarios |

Nota: la comparativa se basa en datos genericos publicados de los modelos oficiales; para el modelo de esta ficha, contexto y benchmarks no estan disponibles, por lo que la comparacion de rendimiento no puede cuantificarse.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado solo para ingles (`en`); su rendimiento en castellano no esta documentado y probablemente sea inferior al del ingles.
- Al ser una version "Base" (no instruct), puede no seguir instrucciones de chat de forma fiable sin el formato de prompt adecuado; el esquema de plantilla exacto no esta documentado en la informacion disponible.
- No hay benchmarks publicados: la calidad real del fine-tuning frente al modelo base de Qwen3.5 no puede verificarse con datos.
- Riesgo de alucinacion: como cualquier LLM de ~9B parametros, puede generar informacion falsa con apariencia convincente; el modo thinking puede amplificar la verbosidad sin mejorar la veracidad.
- Cuantizaciones agresivas (Q2_K, Q3_K_S/M) degradan notablemente la calidad, especialmente en razonamiento y tareas de codigo; se recomiendan Q4_K_M o superiores para uso serio.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero conviene verificar la licencia y los terminos del modelo base SvalTek/ColdBrew-Qwen3.5-CharThink-Base, que hereda de Qwen3.5.
- La documentacion del modelo base es escasa: longitud de contexto, datos de entrenamiento y capacidades exactas del modo CharThink no estan especificadas, lo que introduce incertidumbre para uso en produccion.
- Los archivos mmproj indican capacidad multimodal, pero su funcionamiento con este fine-tuning concreto no esta documentado.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-CharThink-Base-GGUF
- Modelo base original: https://huggingface.co/SvalTek/ColdBrew-Qwen3.5-CharThink-Base
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-CharThink-Base-i1-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#ColdBrew-Qwen3.5-CharThink-Base-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
