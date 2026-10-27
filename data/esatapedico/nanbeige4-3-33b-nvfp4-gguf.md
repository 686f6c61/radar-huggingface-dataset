# esatapedico/Nanbeige4.3-33B-NVFP4-GGUF

## Resumen

Nanbeige4.3-33B-NVFP4-GGUF es una cuantización comunitaria, publicada por el usuario `esatapedico`, del modelo denso Nanbeige/Nanbeige4.3-33B (33,1 mil millones de parámetros, licencia Apache-2.0). No se trata de un modelo nuevo ni de un ajuste fino: es una conversión de pesos a formato GGUF con un backbone NVFP4 (tipo GGML 40) y siete niveles de precisión ("ladder") que difieren únicamente en la cuantización de embeddings y de la cabeza de salida. El objetivo es hacer viable el despliegue del modelo base en hardware Blackwell de consumo, algo imposible en BF16 (66,3 GB) pero alcanzable en configuraciones de dos tarjetas de 16 GB.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica concreta de cuantización NVFP4A16 (W4A16, grupo 16, escalas FP8 E4M3 por tensor) aplicada solo a las capas MLP, manteniendo la atención en BF16 y las normas en F32. Por otro, ofrece cifras de rendimiento medidas por el propio autor sobre el nivel MEDIUM: 67,62 % en MMLU y 91,5 % en GSM8K, sin corpus de calibración. Es un artefacto de infraestructura más que un modelo de investigación, y debe evaluarse como tal.

El modelo base es un transformer decoder-only de arquitectura Llama, con 52 capas, dimensión oculta 7168, 56 cabezas de consulta y 8 cabezas KV, y 512K de contexto nativo según la model card. No emplea MoE, atención de ventana deslizante, SSM ni predicción multi-token.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, arquitectura Llama (52 capas, 7168 de dimensión oculta, 56 cabezas de consulta / 8 cabezas KV) |
| Parámetros totales | 33.118.977.180 (33,1B) |
| Parámetros activos | No aplica: modelo denso, sin MoE |
| Longitud de contexto | 512K nativo en el modelo base; en estos GGUF: 128K en VERY-LOW, LOW, MEDIUM y MID-HIGH; 64K en HIGH, VERY-HIGH y HIGHEST |
| Tipos de cuantización | Backbone NVFP4A16 (W4A16, grupo 16, escalas FP8 E4M3 por tensor, solo pesos); 7 niveles con embeddings y lm_head en Q2_K, IQ4_XS, Q6_K, Q8_0 o BF16; HIGHEST recuantiza además la atención a Q8_0; caché KV recomendada q4_0 |
| Idiomas soportados | `en` según los metadatos del repositorio; no hay información sobre otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tipo GGML 40 para el backbone NVFP4; normas en F32); existe un checkpoint intermedio de safetensors NVFP4A16 en 2 shards |
| Tensores cuantizados | 156 tensores MLP (`gate_proj`, `up_proj`, `down_proj`) en las 52 capas |
| Tensores mantenidos en BF16 | 208 tensores de atención (`q/k/v/output_proj`) en las 52 capas; `token_embd` y `lm_head` según nivel |
| Tensores en F32 | 104 layer norms, `output_norm` y 156 escalas NVFP4 por tensor |
| Tamaño de los ficheros | De 18,20 GB (16,95 GiB, VERY-LOW) a 25,13 GB (23,40 GiB, HIGHEST) |
| Caché KV (q4_0) | 58,5 KiB/token, 52/52 capas con atención completa: 1,83 GiB a 32K, 3,66 GiB a 64K, 7,31 GiB a 128K |
| Plantilla de chat | Presente, heredada del `tokenizer_config.json` del modelo base |
| Tamaño del repositorio | 144,2 GB |

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre el preentrenamiento del modelo base (composición del dataset, número de tokens, uso de RLHF/DPO). Lo que sí está documentado es el proceso de conversión, que constituye la aportación técnica de este repositorio. Se partió del checkpoint BF16 de `Nanbeige/Nanbeige4.3-33B` (14 shards, 66,3 GB, 471 tensores = 52×9 + 3, sin tensores MTP), verificado con SHA-256 contra los OIDs de LFS de HuggingFace en los 14 casos. La cuantización se realizó con llm-compressor 0.14.0.1, `pipeline='sequential'`, en modo weight-only y sin corpus de calibración ("datafree"), apuntando exclusivamente a los 156 tensores MLP; atención, normas y cabezas quedaron fuera del objetivo en ambos espacios de nombres, y la receta se validó contra el `weight_map` antes de ejecutarse.

El esquema NVFP4A16 emplea bloques de 16 elementos con escalas FP8 E4M3 por tensor, manteniendo la activación en 16 bits (de ahí W4A16). Un guardián de normas posterior a la cuantización comparó 315 tensores no tocados y detectó 0 mutaciones. El resultado es un checkpoint indexado de 2 shards (~30,8 GB) con `recipe.yaml`, a partir del cual se generan los siete GGUF. Los seis niveles NVFP4 comparten un backbone de 364 tensores byte-idéntico (verificado por SHA); las diferencias entre niveles son solo la precisión de embeddings y `lm_head`, más el recuantizado Q8_0 de la atención en HIGHEST. La plantilla de chat se propaga a todos los ficheros. No hay innovaciones de decodificación (sin decodificación especulativa ni MTP) ni mecanismos de atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con plantilla de chat incluida en todos los GGUF.
- Manejo de contexto largo: hasta 128K tokens en los cuatro niveles inferiores y 64K en los tres superiores, frente a los 512K nativos del modelo base.
- Razonamiento matemático de varios pasos, con un 91,5 % en GSM8K medido en el nivel MEDIUM con el modo "thinking" activado.
- Modo de razonamiento explícito ("thinking"): la model card describe pruebas con thinking forzado a off (MMLU) y con thinking on (GSM8K), lo que implica que el modelo base expone algún mecanismo de razonamiento extendido.
- Respuesta a preguntas de conocimiento general y estilo MMLU (67,62 % en la suite del autor).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso con herramientas: no documentadas.
- Multilingüismo: no documentado; los metadatos solo declaran `en`.
- Capacidades de visión, audio o multimodalidad: no disponibles (modelo estrictamente de texto).
- Ejecución en llama.cpp sobre backends con soporte NVFP4, con offload completo verificado en dos GPU Blackwell de 16 GB.

## Casos de uso

- Análisis de documentos extensos: con 128K tokens de contexto en MEDIUM, el modelo puede procesar contratos, informes anuales o expedientes completos en una sola pasada sin troceado, lo que evita perder coherencia entre secciones.
- Preguntas y respuestas sobre documentación técnica o bases de código: la ventana de 128K permite incluir varios módulos o manuales completos como contexto y formular preguntas cruzadas sobre ellos.
- Asistencia conversacional autoalojada en inglés: la plantilla de chat incluida y la licencia Apache-2.0 permiten desplegar un asistente multi-turno en infraestructura propia sin depender de API externas.
- Tutoría y verificación matemática por lotes: el 91,5 % en GSM8K con thinking activado lo hace apto para generating soluciones paso a paso y para validar respuestas de problemas de aritmética y álgebra elemental en pipelines offline.
- Despliegue con requisitos de soberanía o confidencialidad de datos: al ser pesos abiertos y ejecutarse en local con llama-server, ningún dato de usuario sale de la infraestructura, algo crítico en sectores regulados.
- Evaluación de cuantizaciones NVFP4 en hardware Blackwell: los siete niveles con backbone idéntico permiten aislar el impacto de la precisión de embeddings y cabeza de salida en la calidad final, un caso de uso metodológico poco habitual en el ecosistema GGUF.
- Prototipado en estaciones de trabajo de dos GPU de 16 GB: el nivel VERY-LOW (16,95 GiB) más caché KV q4_0 a 32K (1,83 GiB) cabe en 32 GB de VRAM agregada, lo que habilita experimentación con un modelo de 33B en hardware de gama consumer-profesional.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al nivel MEDIUM, medidos por el autor con su propio `bench_suite` sobre dos GPU Blackwell de 16 GB con caché KV q4_0. MMLU está limitado a 420 ítems resueltos de 1000 (semilla 42, log-probabilidad por letra, thinking desactivado); GSM8K es generativo sobre 200 ítems con thinking activado.

| Nivel | Configuración | MMLU | GSM8K |
|---|---|---|---|
| MEDIUM | Dual GPU 16 GB Blackwell, KV q4_0, thinking off / on | 67,62 % (284/420) | 91,5 % (183/200) |

Dos ejecuciones idénticas produjeron la misma puntuación y respuestas ítem por ítem idénticas. El resto de niveles no se midió. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible, por lo que no es posible situar estas cifras frente a alternativas de la misma categoría.

## Requisitos de hardware

- VRAM mínima: 16,95 GiB solo para pesos (nivel VERY-LOW). Ningún nivel cabe en una tarjeta de 16 GB; el suelo del repositorio está por encima de esa cifra.
- Cálculo de VRAM total: pesos del nivel elegido + caché KV q4_0 (1,83 GiB a 32K, 3,66 GiB a 64K, 7,31 GiB a 128K) + overhead de contexto y grafo de llama.cpp.
- Una GPU de 24 GB (RTX 3090, RTX 4090): VERY-LOW con 32K de contexto queda en torno a 18,8 GiB más overhead, lo que en principio encaja; HIGHEST (23,40 GiB) no cabe con caché KV. Estimación derivada de los tamaños publicados, no validada por el autor.
- Una GPU de 48 GB (A6000, L40S) o 80 GB (A100, H100): cualquier nivel con 128K de contexto, aunque el rendimiento NVFP4 requiere hardware Blackwell para aprovechar el formato.
- Configuración validada por el autor: dos tarjetas Blackwell de 16 GB con offload completo (`-ngl 99`).
- Despliegue: `llama-server` / llama.cpp con backend que soporte NVFP4 (tipo GGML 40), flags `-ngl 99 --jinja --cache-type-k q4_0 --cache-type-v q4_0`. El autor recomienda verificar los nombres de los flags con `--help` en la build concreta.
- vLLM, TGI, Ollama y otros motores: no documentados en la información disponible para este formato NVFP4 GGUF.
- Latencia y throughput: no disponibles. El autor solo reporta que dos ejecuciones del benchmark fueron reproducibles, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| Nanbeige4.3-33B (base) | 33,1B densos | 512K nativo | Safetensors BF16, 66,3 GB (14 shards) | Apache-2.0 | No disponible en la información | HuggingFace |
| Nanbeige4.3-33B-NVFP4-GGUF (MEDIUM) | 33,1B densos | 128K en este fichero | GGUF NVFP4A16, 19,54 GB | Apache-2.0 | MMLU 67,62 %; GSM8K 91,5 % | HuggingFace |
| Nanbeige4.3-33B-NVFP4-GGUF (HIGHEST) | 33,1B densos | 64K en este fichero | GGUF, atención Q8_0, 25,13 GB | Apache-2.0 | No medido | HuggingFace |
| Otras alternativas densas de ~30-34B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones verificadas de modelos competidores (por ejemplo, otras familias densas de 30-34B) que permitan una comparación cuantitativa rigurosa. Cualquier comparación con ellos sería especulativa.

## Limitaciones y advertencias

- Cuantización sin calibración: el proceso es "datafree", de modo que el error de cuantización no se ha minimizado sobre un corpus representativo. El impacto real puede variar según la distribución de entrada.
- Solo se ha medido el nivel MEDIUM. Los otros seis niveles comparten backbone, pero difieren en embeddings y cabeza de salida; no hay datos que confirmen que su calidad sea equivalente, y el propio autor recomienda validar cada nivel en la carga de trabajo propia.
- Las puntuaciones de MMLU (420 ítems de 1000) y GSM8K (200 ítems) tienen un tamaño de muestra reducido y están sujetas a varianza; además dependen del runtime, del tipo de caché KV, de la longitud de contexto y de los parámetros de muestreo.
- Límite de contexto recortado: 128K en cuatro niveles y 64K en tres, frente a los 512K nativos del modelo base. No es un fallo de la conversión, pero invalida el uso de contextos superiores a esas cifras.
- Sin cifras de tool calling, función de agente ni multilingüismo documentadas; no deben asumirse en producción sin pruebas propias.
- Idiomas: los metadatos solo declaran inglés. El comportamiento en castellano u otras lenguas no está evaluado.
- Riesgo de alucinación: inherente a un modelo de 33B sin datos publicados de entrenamiento ni de alineación; no hay información sobre mitigaciones.
- Sesgos: no hay información disponible sobre la composición del corpus de entrenamiento ni sobre evaluaciones de sesgo.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución al modelo base y verificar las condiciones del checkpoint intermedio de safetensors.
- Requisito de hardware restrictivo: no cabe en una GPU de 16 GB y exige backend con soporte NVFP4, lo que reduce la portabilidad frente a un GGUF K-quant convencional.
- Repositorio de 144,2 GB con siete ficheros duplicados parcialmente; la descarga completa es costosa si solo se necesita un nivel.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/esatapedico/Nanbeige4.3-33B-NVFP4-GGUF
- Checkpoint intermedio NVFP4A16 en safetensors: https://huggingface.co/esatapedico/Nanbeige4.3-33B-NVFP4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Sitio del autor de la conversión: https://www.esatapedico.com
- Resultados de búsqueda web: no se encontraron enlaces relevantes al modelo; las entradas devueltas corresponden a medios de prensa sin relación con el repositorio.
