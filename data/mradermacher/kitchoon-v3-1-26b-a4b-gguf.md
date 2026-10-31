# mradermacher/Kitchoon-V3.1-26B-A4B-GGUF

## Resumen

Kitchoon-V3.1-26B-A4B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo SubMaroon/Kitchoon-V3.1-26B-A4B, publicada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un LLM de mezcla de expertos (MoE) orientado a roleplay, etiquetado como "uncensored" y pensado para su uso en frontends como SillyTavern. El sufijo "A4B" indica que, pese a tener unos 25.200 millones de parámetros totales, activa aproximadamente 4.000 millones por token, lo que permite inferencia rápida en hardware de consumo.

La relevancia de esta ficha radica en que el repositorio no es un modelo nuevo, sino la infraestructura de despliegue: ofrece once cuantizaciones que van desde Q2_K (10,7 GB) hasta Q8_0 (27 GB), cubriendo desde portátiles con GPU modesta hasta estaciones de trabajo con 32 GB de VRAM. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones. El modelo está etiquetado bajo la familia "gemma4", lo que sugiere que deriva de la arquitectura Gemma, aunque el modelo base original no publica documentación técnica detallada en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), familia gemma4 según etiquetas |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | ~4 B (inferido del sufijo "A4B"; no confirmado explicitamente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base, SubMaroon/Kitchoon-V3.1-26B-A4B, es un modelo MoE de unos 25,2 mil millones de parametros totales con aproximadamente 4 mil millones activos por token. La etiqueta "gemma4" en los metadatos indica pertenencia a la familia de arquitecturas Gemma, aunque ni el numero exacto de expertos, ni la granularidad del enrutado, ni los datos de entrenamiento estan documentados en la informacion disponible. No se ha publicado informacion sobre el numero de tokens de preentrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO.

Por las etiquetas del repositorio (roleplay, uncensored, heretic, sillytavern), se trata de un modelo afinado para narrativa interactiva y generacion creativa sin las restricciones de seguridad habituales de los modelos comerciales. La version cuantizada de mradermacher no modifica los pesos del modelo base: son conversiones estaticas a GGUF compatibles con llama.cpp y derivados, generadas por conversion desde el checkpoint original en safetensors.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y narrativa creativa, con estilo "uncensored" (sin filtrado de seguridad).
- Conversacion multi-turno (etiqueta "conversational" en el repositorio).
- Compatibilidad con SillyTavern y otros frontends de roleplay basados en llama.cpp.
- Razonamiento, codigo y matematicas: no disponible; no hay documentacion que confirme estas capacidades.
- Tool calling / function calling: no disponible.
- Capacidades multilingues: el repositorio solo declara ingles ("en"); otros idiomas no confirmados.
- Vision, audio u otras modalidades: no disponibles (el README indica "skip_mmproj: 1", es decir, sin proyector multimodal).

## Casos de uso

- Roleplay interactivo en SillyTavern: el modelo esta etiquetado explicitamente para este frontend; con solo ~4 B de parametros activos por token, genera respuestas rapidas incluso en GPUs de consumo, algo clave para sesiones largas de juego de rol.
- Escritura creativa y narrativa: su perfil "uncensored" y su entrenamiento orientado a roleplay lo hacen adecuado para redactar ficcion, dialogos y escenas sin la reticencia de modelos alineados comercialmente.
- Chatbots conversacionales locales: gracias a las cuantizaciones ligeras (Q4_K_S ocupa 15,6 GB), puede ejecutarse localmente garantizando privacidad total de las conversaciones.
- Despliegue en hardware modesto: la cuantizacion Q2_K (10,7 GB) permite ejecutar un modelo de 25 B de parametros en GPUs con 12 GB de VRAM o incluso en CPU con RAM suficiente, sacrificando calidad.
- Experimentacion y comparacion de cuantizaciones: al ofrecer once variantes, es util para investigadores que quieran medir la degradacion de calidad entre niveles de cuantizacion en un mismo modelo MoE.
- Integracion en pipelines locales con llama.cpp: el formato GGUF es el estandar de facto para inferencia en local, permitiendo servir el modelo mediante llama-server o wrappers de API compatible con OpenAI.
- Prototipado de agentes de ficcion o personajes: dado su enfoque narrativo, puede alimentar personajes virtuales con personalidad definida mediante system prompts, aunque sin soporte confirmado de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye un grafico generico de perplejidad comparando tipos de cuantizacion, cortesia de ikawrakow, sin metricas especificas del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (segun el tamaño de cada cuantizacion, sin contar KV-cache):
  - Q2_K: ~10,7 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~14,2 GB
  - Q4_K_S: ~15,6 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_M: ~19,2 GB
  - Q6_K: ~22,7 GB
  - Q8_0: ~27 GB
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_S/Q4_K_M o Q5_K_S con margen para contexto.
  - RTX 3090 (24 GB): idem, con rendimiento inferior.
  - RTX 4080/4070 Ti Super (16 GB): IQ4_XS o Q3_K_L.
  - A100/H100: ejecutable sin problemas, aunque es hardware desproporcionado para ~4 B de parametros activos.
- Consumer GPUs: si cabe. Cualquier GPU de 12 GB (RTX 3060, 4070) puede ejecutar Q2_K o Q3_K_S; de 16 GB, IQ4_XS; de 24 GB, hasta Q6_K. Con offload parcial a CPU via llama.cpp, incluso configuraciones mas modestas.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa; para ellos habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles como cifras publicadas; al ser un MoE con ~4 B de parametros activos, se espera una velocidad de generacion comparable a la de un modelo denso de 4 B en hardware equivalente.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kitchoon-V3.1-26B-A4B | ~25,2 B | ~4 B | GGUF / safetensors | Apache 2.0 | Roleplay, uncensored |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | GGUF / safetensors | Apache 2.0 | Generalista, hibrido thinking |
| Gemma 3 27B (denso) | 27 B | 27 B | GGUF / safetensors | Gemma license | Generalista, multimodal |

Frente a Qwen3-30B-A3B comparte la filosofia MoE de bajo coste por token, pero Kitchoon esta especializado en roleplay sin filtros, mientras que Qwen3 es un modelo generalista con soporte de razonamiento y tool calling. Frente a Gemma 3 27B, Kitchoon ofrece inferencia mucho mas rapida al activar solo ~4 B de parametros, a costa de capacidades multimodales y de una licencia Gemma mas restrictiva en el caso del modelo de Google. No hay benchmarks publicados que permitan comparar rendimiento numerico entre ellos.

## Limitaciones y advertencias

- Contenido sin filtrar: al estar etiquetado como "uncensored" y "heretic", el modelo puede generar contenido ofensivo, violento o inapropiado. No es apto para entornos de produccion orientados a usuarios finales sin capas de moderacion externas.
- Alucinaciones: como todo LLM, puede inventar hechos; no hay datos de benchmarks que permitan cuantificar el riesgo.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto: no disponible; habra que consultar la config del modelo base antes de planificar tareas con documentos largos.
- Sin multimodalidad: la conversion GGUF omite el proyector multimodal ("skip_mmproj: 1"), por lo que estas cuantizaciones son solo de texto.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base original, que es el que define la licencia efectiva del contenido generado.
- Calidad de las cuantizaciones bajas: Q2_K y Q3_K_M degradan notablemente la calidad, especialmente en modelos MoE; se recomiendan Q4_K_S o superiores para uso serio.
- Herramientas de agente: sin soporte confirmado de function calling, no es adecuado para pipelines de agentes o automatizacion.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/mradermacher/Kitchoon-V3.1-26B-A4B-GGUF
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Kitchoon-V3.1-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V3.1-26B-A4B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Kitchoon-V3.1-26B-A4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
