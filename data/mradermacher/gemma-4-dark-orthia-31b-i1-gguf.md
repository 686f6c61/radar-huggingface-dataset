# mradermacher/Gemma-4-Dark-Orthia-31B-i1-GGUF

## Resumen

Gemma-4-Dark-Orthia-31B-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo Nimbz/Gemma-4-Dark-Orthia-31B, realizadas por mradermacher, un cuantizador muy prolífico de la comunidad de Hugging Face. El modelo base es un merge (fusión de modelos creada con mergekit) de 31B parámetros construido sobre la arquitectura Gemma-4, orientado específicamente a roleplay, escritura creativa, narración de historias y conversación, con un perfil "dark" que implica un menor número de negativas (low-refusal) respecto a modelos alineados comercialmente.

Esta ficha cubre la versión "i1" (imatrix), es decir, cuantizaciones con matriz de importancia calculada sobre datos reales, que ofrecen mejor calidad que las cuantizaciones estáticas a igual tamaño. Se publican desde IQ1_S (7,7 GB) hasta Q6_K (26,5 GB), lo que permite ejecutar el modelo en un amplio rango de hardware, desde portátiles con GPU modesta hasta estaciones de trabajo con GPUs de gama alta.

Su relevancia actual reside en la demanda de modelos abiertos de escritura creativa sin las restricciones típicas de los modelos comerciales, combinada con la eficiencia de las cuantizaciones imatrix de ikawrakow/mradermacher, que permiten desplegar un modelo de 32B parámetros en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4 (transformer, merge con mergekit, untied lm_head) |
| Parametros totales | 32.106.631.740 (~31B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien disponible version estatica GGUF; modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Nimbz/Gemma-4-Dark-Orthia-31B, es un merge creado con mergekit sobre la familia Gemma-4, con aproximadamente 31B parámetros (32,1B exactos según los metadatos de safetensors). Una característica técnica destacable indicada en los tags es el uso de lm_head untied (cabecera de salida no atada a la matriz de embeddings), lo que da más flexibilidad al modelo de salida y es habitual en merges orientados a escritura creativa. No se ha publicado información sobre el proceso de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO en la información disponible.

Sobre esta base, mradermacher ha generado cuantizaciones GGUF con imatrix (importance matrix), una técnica que calcula la importancia de cada tensor sobre datos de calibración reales para distribuir mejor la precisión de la cuantización. Las variantes IQ (de ikawrakow) superan en calidad a las cuantizaciones K estáticas de tamaño similar, según documenta el propio autor con gráficas de perplexity comparativas.

## Capacidades

- Generacion de texto creativo: escritura de ficcion, narracion de historias (storytelling) y prosa en ingles.
- Roleplay y roleplay de personajes (character-rp): mantenimiento de personajes y conversaciones de rol multiturno.
- Conversacion: dialogo interactivo orientado a chat.
- Perfil low-refusal: menor tendencia a rechazar peticiones que los modelos alineados comercialmente; etiquetado explicito como nsfw y not-for-all-audiences.
- Vision: la model card indica que es un modelo de vision; los ficheros mmproj se publican en el repositorio estatico asociado.
- No consta soporte de tool calling, function calling ni capacidades de agentes en la informacion disponible.

## Casos de uso

- Roleplay interactivo de personajes: integracion en frontends tipo SillyTavern o text-generation-webui para sesiones de rol multiturno con personajes definidos por el usuario; su etiqueta character-rp y su perfil low-refusal lo hacen adecuado para este nicho.
- Escritura de ficcion y novelas: generacion y continuation de prosa creativa en ingles, util como asistente de escritura para autores que quieren explorar tramas oscuras o maduras sin las negativas de modelos comerciales.
- Narracion de historias interactiva: creacion de relatos ramificados donde el usuario dirige la trama y el modelo genera el desarrollo narrativo.
- Chatbots conversacionales de personaje: despliegue de bots con personalidad fija para entornos de entretenimiento, aprovechando las cuantizaciones ligeras para ejecutarlo en hardware de consumo.
- Experimentacion con merges: uso como base o referencia para creadores de merges que investigan combinaciones orientadas a escritura creativa sobre Gemma-4.
- Pruebas locales de modelos de vision: al incluir soporte de vision via mmproj, permite experimentar con entradas multimodales en local con llama.cpp, siempre dentro de su nicho de escritura creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Referencias aproximadas de tamano de fichero: IQ1_S 7,7 GB; IQ2_M 11,6 GB; IQ3_M 15,1 GB; IQ4_XS 17,6 GB; Q4_K_M 19,6 GB; Q5_K_M 22,9 GB; Q6_K 26,5 GB. Anadir margen para el KV cache segun la longitud de contexto utilizada.
- GPU recomendadas: para cuantizaciones de 17-27 GB, una RTX 3090/4090 (24 GB) o una RTX 5090 (32 GB) permiten cargar el modelo completo en VRAM. Para cuantizaciones IQ1-IQ2 (8-12 GB), valen RTX 3060 12GB, RTX 4060 Ti 16GB o similares. Con GPUs menores o CPU, es posible la ejecucion hibrida con offload de capas.
- Consumer GPUs: si, cabe en GPUs de consumo; la cuantizacion Q4_K_M (19,6 GB) entra en una RTX 3090/4090 de 24 GB, y las variantes IQ1/IQ2 entran incluso en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y text-generation-webui. El fichero imatrix esta disponible para quien quiera crear sus propias cuantizaciones.
- Latencia y throughput estimados: no disponibles; en GPUs de consumo con Q4_K_M cabe esperar velocidades de generacion del orden de decenas de tokens por segundo, pero no se ha publicado ninguna medida concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma-4-Dark-Orthia-31B-i1-GGUF | ~31B (32,1B) | GGUF (imatrix) | Apache 2.0 | Roleplay, escritura creativa, low-refusal |
| Mradermacher static quants (Gemma-4-Dark-Orthia-31B-GGUF) | ~31B | GGUF (estatico) | Apache 2.0 | Mismo modelo, cuantizaciones sin imatrix, incluye mmproj |
| Modelo base Nimbz/Gemma-4-Dark-Orthia-31B | ~31B | Safetensors | Apache 2.0 | Merge base sin cuantizar, para inferencia en transformers/vLLM |

Alternativas de la misma categoria (roleplay/creativo ~30B) no se han identificado en la informacion disponible; no disponible una comparativa de rendimiento numerico.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente como ingles (en); no hay garantia de rendimiento en castellano ni otros idiomas.
- Contenido: etiquetado explicitamente como nsfw, dark y not-for-all-audiences; su perfil low-refusal implica que puede generar contenido ofensivo, violento o para adultos. No es adecuado para entornos sin control de audiencia.
- Alucinaciones: como todo LLM, puede generar contenido falso con apariencia verosimil; no hay datos de benchmarks que permitan evaluar su fiabilidad factual.
- Cuantizacion agresiva: las variantes IQ1_S/IQ1_M (descritas por el autor como "for the desperate") sufren degradacion notable de calidad; se recomienda Q4_K_S o superior para uso serio.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es un merge de Gemma-4; conviene revisar los terminos de la familia Gemma de Google aplicables al modelo original.
- Vision: los ficheros mmproj estan en el repositorio estatico, no en este; hay que descargarlos de alli para usar capacidades multimodales.
- Sin tool calling ni agentes documentados: no es la eleccion adecuada para pipelines de funciones o automatizacion.

## Enlaces

- Repositorio cuantizado imatrix: https://huggingface.co/mradermacher/Gemma-4-Dark-Orthia-31B-i1-GGUF
- Repositorio cuantizado estatico (incluye mmproj): https://huggingface.co/mradermacher/Gemma-4-Dark-Orthia-31B-GGUF
- Modelo base: https://huggingface.co/Nimbz/Gemma-4-Dark-Orthia-31B
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-Dark-Orthia-31B-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
