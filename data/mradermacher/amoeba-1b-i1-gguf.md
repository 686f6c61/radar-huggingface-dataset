# mradermacher/Amoeba-1B-i1-GGUF

## Resumen

Amoeba-1B-i1-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo base leexamp/Amoeba-1B, publicada por mradermacher, un conocido creador de cuantizaciones de la comunidad de Hugging Face. El modelo base es un modelo de lenguaje de 1.080.632.832 parametros (aproximadamente 1,08 mil millones) etiquetado por su autor con los descriptores "amoeba", "speculative-decoding" y "small-language-model", lo que sugiere un diseno orientado a tareas de decodificacion especulativa o a servir como modelo borrador (draft model) junto a modelos de mayor tamano. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta publicacion radica en que mradermacher ofrece cuantizaciones con calibracion imatrix (i1), que suelen preservar mejor la perplejidad que las cuantizaciones estaticas equivalentes en tamano, especialmente en niveles agresivos de compresion. El repositorio incluye 24 variantes GGUF que van desde 0,5 GB (IQ1_S, IQ2_XXS) hasta 1,0 GB (Q6_K), ademas del fichero imatrix original de 0,1 GB para que otros usuarios puedan generar sus propias cuantizaciones. Tambien existe una version con cuantizaciones estaticas en mradermacher/Amoeba-1B-GGUF.

El modelo esta pensado exclusivamente para ingles (tag `en` en la model card) y se distribuye a traves de la libreria transformers con pesos en formato GGUF, lo que lo hace compatible con llama.cpp y derivados. Al tratarse de una cuantizacion y no de un modelo original, las capacidades reales dependen del modelo base leexamp/Amoeba-1B; la informacion disponible sobre este ultimo es limitada y se detalla en las secciones siguientes con las correspondientes advertencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base leexamp/Amoeba-1B; tags indican "small-language-model" y "speculative-decoding") |
| Parametros totales | 1.080.632.832 (dato real de safetensors) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; ademas fichero imatrix |
| Idiomas soportados | ingles (tag `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix .gguf adicional); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base leexamp/Amoeba-1B en la informacion proporcionada. Los tags de la model card ("amoeba", "speculative-decoding", "small-language-model") apuntan a un transformer de ~1,08 mil millones de parametros concebido para decodificacion especulativa, es decir, para actuar como modelo borrador que propone tokens rapidamente y que un modelo mayor verifica, acelerando la generacion sin cambiar la distribucion de salida. Esta hipotesis es coherente con el tamano reducido y con la existencia de cuantizaciones muy agresivas (IQ1, IQ2) pensadas para minimizar el coste de memoria del borrador.

Sobre los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF/DPO u otras tecnicas de alineamiento) no hay informacion disponible. Tampoco se documentan innovaciones tecnicas especificas del modelo base mas alla de su posible rol en decodificacion especulativa. La publicacion de mradermacher se limita a aplicar cuantizacion GGUF con calibracion imatrix sobre los pesos del modelo base, siguiendo su flujo habitual (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2).

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente para ingles, por lo que su uso en otros idiomas no esta garantizado.
- Decodificacion especulativa: el tag `speculative-decoding` sugiere que puede emplearse como modelo borrador junto a un modelo verificador de mayor tamano para acelerar la inferencia.
- Modelo pequeno (small-language-model): adecuado para tareas de baja latencia y despliegue en hardware modesto.
- Cuantizaciones de muy bajo bit-width (IQ1_S, IQ2_XXS) para entornos con restricciones severas de memoria.
- Compatibilidad con llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.) gracias al formato de pesos.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Decodificacion especulativa en produccion: usar Amoeba-1B como modelo borrador en un esquema de speculative decoding junto a un modelo verificador mayor, aprovechando su tamano reducido (0,5-1,0 GB en GGUF) para proponer tokens con baja latencia y aumentar el throughput efectivo del sistema.
- Inferencia en dispositivos de borde: desplegar la cuantizacion i1-Q4_K_M (0,8 GB) en Raspberry Pi, moviles o portatiles sin GPU dedicada para generacion de texto basica en ingles con consumo de memoria minimo.
- Filtrado y clasificacion de texto: emplear el modelo para tareas de etiquetado rapido, moderacion o enrutamiento de consultas en ingles donde no se requiera razonamiento complejo, beneficiandose de su baja huella de memoria.
- Generacion de texto auxiliar en herramientas de escritorio: integrar el GGUF en editores o asistentes locales mediante llama.cpp u Ollama para autocompletado y sugerencias en ingles sin depender de la nube.
- Pruebas de pipelines GGUF: usar las distintas variantes (IQ2, Q3, Q4, Q5, Q6) para evaluar el impacto de la cuantizacion en la calidad de salida antes de fijar un nivel de compresion en produccion.
- Experimentacion academica con decodificacion especulativa: comparar el rendimiento de distintas cuantizaciones del borrador (desde IQ1_S hasta Q6_K) en la tasa de aceptacion de tokens y en la aceleracion final del modelo verificador.
- Generacion de cuantizaciones propias: el fichero imatrix incluido (0,1 GB) permite a otros desarrolladores producir sus propias variantes GGUF calibradas con el mismo dataset de calibracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB y 1,0 GB segun la cuantizacion elegida (IQ1_S/IQ2_XXS ~0,5 GB; Q4_K_M ~0,8 GB; Q6_K ~1,0 GB), mas el overhead del runtime (contexto KV cache, buffers de llama.cpp).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen amplio margen. Tambien funciona en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en un modelo de ~1B en Q4_K_M sobre GPU consumer se espera throughput alto, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Amoeba-1B-i1-GGUF (este) | 1,08 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix de 0,5 a 1,0 GB; orientado a speculative decoding |
| Amoeba-1B-GGUF (mradermacher) | 1,08 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base |
| leexamp/Amoeba-1B (base) | 1,08 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Otros modelos ~1B (p. ej. familia Llama 3.2 1B, Qwen2.5 0.5B/1.5B) | 0,5-1,5 B | 32K-128K tipicamente | licencias variables | safetensors/GGUF | Alternativas genericas; no se dispone de comparacion de rendimiento con Amoeba-1B en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado exclusivamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Modelo base poco documentado: la model card del modelo original no aporta informacion sobre arquitectura, datos de entrenamiento ni evaluaciones, lo que dificulta estimar su calidad real.
- Riesgo de alucinacion: como todo modelo de lenguaje de ~1B parametros, la probabilidad de generar contenido factualmente incorrecto es alta, especialmente en tareas de conocimiento.
- Cuantizaciones agresivas: las variantes IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS y Q2_K_S degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "very low quality". Para uso en produccion se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base leexamp/Amoeba-1B mantiene la misma licencia y no impone restricciones adicionales (la model card indica apache-2.0, aunque no se detallan condiciones de uso aceptable).
- Sin garantias de soporte: el repositorio tiene 0 descargas y 1 like en el momento de la ficha, lo que indica escasa validacion por parte de la comunidad.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento; no debe asumirse su disponibilidad en produccion.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Amoeba-1B-i1-GGUF
- Modelo base: https://huggingface.co/leexamp/Amoeba-1B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Amoeba-1B-GGUF
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Amoeba-1B-i1-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del autor): https://www.nethype.de/
