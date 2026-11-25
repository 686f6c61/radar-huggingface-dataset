# mradermacher/Wicked-Stuff-26B-A4B-v3.0-Final-i1-GGUF

## Resumen

Wicked-Stuff-26B-A4B-v3.0-Final-i1-GGUF es una cuantización en formato GGUF del modelo Wicked-Stuff-26B-A4B-v3.0-Final, desarrollado originalmente por ReadyArt y convertido por mradermacher, un autor habitual de cuantizaciones GGUF en Hugging Face. Se trata de un modelo de lenguaje de 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones), etiquetado como MoE por la nomenclatura "A4B" (4 mil millones de parámetros activos por token), orientado a conversación, roleplay e instrucciones en inglés.

El modelo está claramente posicionado para contenido para adultos: sus etiquetas incluyen nsfw, explicit, roleplay, unaligned, ERP, Erotic, Horror, Violence, adult-content y mature, además de la marca not-for-all-audiences. No se trata de un modelo de propósito general ni alineado; su nicho es la generación de narrativa y conversación sin los filtros típicos de los modelos comerciales, con capacidad declarada de visión (el autor indica que es un modelo de visión y que los archivos mmproj, si existen, están en el repositorio estático).

La relevancia de esta ficha es práctica: el repositorio ofrece más de veinte cuantizaciones con imatrix (desde IQ1_S de 8,4 GB hasta Q6_K de 22,7 GB), lo que permite ejecutar un modelo de 25B en hardware de consumo. El repositorio completo ocupa 301 GB, pero las descargas individuales son manejables. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada; se indica explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (inferido de la nomenclatura A4B); detalles internos no disponibles |
| Parametros totales | 25.233.142.046 (≈25,2 B) |
| Parametros activos | ≈4 B (inferido de "A4B"; no confirmado en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; también cuantizaciones estáticas en el repositorio hermano |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors/transformers |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La nomenclatura "26B-A4B" sugiere un modelo de mezcla de expertos (MoE) con aproximadamente 25,2 mil millones de parámetros totales y alrededor de 4 mil millones activos por token, lo que explicaría la viabilidad de las cuantizaciones pequeñas (8-23 GB) para un modelo de ese tamaño total. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. El modelo base es ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final, y esta versión es una conversión a GGUF con cuantización ponderada mediante imatrix (archivo imatrix de 0,2 GB incluido para generar cuantizaciones propias). El autor menciona que se trata de un modelo de visión, con posibles archivos mmproj en el repositorio estático, aunque no se confirma su existencia ni sus características.

## Capacidades

- Generación de texto conversacional e instructivo en inglés, con énfasis en roleplay y narrativa.
- Contenido explícito para adultos: ERP (erotic roleplay), escenas eróticas, horror y violencia, según las etiquetas del autor.
- Modo "unaligned": sin las restricciones de seguridad habituales de los modelos comerciales, lo que implica menor rechazo de peticiones explícitas.
- Capacidad de visión declarada por el autor de la cuantización (archivos mmproj en el repositorio estático, si existen), aunque no se confirma en la información disponible.
- Soporte de conversación multi-turno e instrucciones (etiquetas conversational e instruct).
- No se ha confirmado soporte de tool calling, function calling, agentes ni multi-step reasoning en la información disponible.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Roleplay conversacional para adultos: el modelo está entrenado y etiquetado específicamente para ERP y narrativa explícita, por lo que puede sostener personajes y tramas multi-turno con contenido maduro sin los rechazos típicos de modelos alineados.
- Generación de ficción de horror y violencia: las etiquetas Horror y Violence indican que el modelo tolera y produce narrativa gráfica, útil para escritores de género que necesitan asistencia sin filtros.
- Escritura creativa de ficción erótica: adecuado para autores que buscan un asistente de redacción en inglés para borradores de escenas explícitas, con control de tono y personajes.
- Prototipado de chatbots de personaje (character.ai style): su naturaleza conversacional e instructiva permite construir agentes de rol con personalidad definida mediante system prompts.
- Investigación sobre modelos "unaligned": útil para estudiar comportamientos, sesgos y dinámicas de modelos sin alineación de seguridad, en entornos controlados.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) o IQ4_XS (14,0 GB) permiten ejecutar el modelo en GPUs de 16-24 GB de VRAM con llama.cpp u Ollama, para uso personal o de investigación.
- Generación de narrativa interactiva en videojuegos o experiencias de ficción interactiva para audiencias adultas, donde se requiere contenido maduro y coherencia de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización GGUF): IQ1_S ≈ 8,4 GB; IQ2_M ≈ 10,5 GB; IQ3_M ≈ 12,5 GB; IQ4_XS ≈ 14,0 GB; Q4_K_M ≈ 16,9 GB; Q5_K_M ≈ 19,2 GB; Q6_K ≈ 22,7 GB. Añadir margen para contexto y overhead del runtime (típicamente 1-3 GB adicionales).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contexto moderado; RTX 4080/4070 Ti Super (16 GB) para IQ4_XS o Q4_K_S; RTX 3090/4090 para Q6_K. Para cuantizaciones IQ2/IQ3, GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones. Las versiones IQ2 e IQ3 caben en 12 GB; Q4_K_M en 16-24 GB; Q6_K requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros runtimes compatibles con GGUF. El modelo base (safetensors) puede servirse con transformers, vLLM o TGI, aunque el repositorio de esta ficha es exclusivamente GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4 B activos, se espera un throughput superior al de un modelo denso de 25 B, pero no hay mediciones publicadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v3.0-Final-i1-GGUF | ≈25,2 B totales / ≈4 B activos | No disponible | No disponible | GGUF | Enfoque NSFW/roleplay, sin alinear, solo inglés |
| Modelos densos de 24-27 B (p. ej. Mistral Small, Gemma 2 27B) | 24-27 B densos | 32K-128K (según modelo) | Apache 2.0 / Gemma license | safetensors, GGUF | Alineados, multilingües, con benchmarks publicados; rechazan contenido explícito |
| Modelos MoE de ~20-30 B con ~4 B activos (p. ej. variantes tipo Qwen MoE) | ≈20-30 B totales / ≈3-4 B activos | 32K-128K (según modelo) | Apache 2.0 (según modelo) | safetensors, GGUF | Uso general, alineados, con tool calling; no especializados en NSFW |

La comparación directa es difícil porque no hay benchmarks publicados para Wicked-Stuff y los modelos alternativos citados son de propósito general y alineados. La principal diferencia es el nicho: Wicked-Stuff está especializado en contenido explícito y sin alineación, mientras que los modelos comerciales ofrecen mayor transparencia, licencias claras y rendimiento medido.

## Limitaciones y advertencias

- Contenido para adultos: el modelo genera material explícito, violento y de horror; no es apto para menores ni para entornos laborales sin control.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo sin alinear, es probable que reproduzca sesgos de su dataset de entrenamiento sin mitigación.
- Riesgo de alucinación: no cuantificado; sin benchmarks ni documentación de entrenamiento, no hay garantías de fiabilidad factual.
- Limitación de idioma: solo inglés según la etiqueta; el rendimiento en castellano no está garantizado.
- Contexto: longitud de contexto no disponible, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; el modelo base es de ReadyArt y la cuantización de mradermacher, pero no se especifica la licencia. Verificar antes de cualquier uso en producción.
- Falta de documentación: no hay información sobre datos de entrenamiento, arquitectura exacta, número de expertos ni proceso de alineación, lo que dificulta la evaluación técnica rigurosa.
- Visión no confirmada: el autor menciona que es un modelo de visión, pero no se confirma la existencia de archivos mmproj ni su calidad.
- Repositorio de 301 GB: descargar el repositorio completo es inviable para la mayoría; hay que seleccionar cuantizaciones individuales.
- Sin benchmarks: imposible comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v3.0-Final-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v3.0-Final-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Wicked-Stuff-26B-A4B-v3.0-Final-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
