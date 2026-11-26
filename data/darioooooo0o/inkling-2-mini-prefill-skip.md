# darioooooo0o/inkling-2-mini-prefill-skip

## Resumen

inkling-2-mini-prefill-skip es un adaptador de inferencia, no un modelo fundacional completo. Lo publica el usuario darioooooo0o sobre el modelo base thinkingmachines/Inkling-2-Mini, un MoE con 26,4B parámetros totales y 3,4B activos que emplea un esquema de visitas lógicas repetidas (48 visitas) con Block Attention Residuals, MessageGate entre pasadas y una convolución dinámica de 4 taps. El adaptador implementa una técnica de "prefill skipping": durante la fase de prefill de contextos largos se saltan determinadas visitas (los llamados "global visits") y se reconstruye su estado mediante una regresión ridge de bajo rango, sin reentrenar los pesos originales.

La propuesta resulta relevante porque ataca uno de los cuellos de botella más caros en producción con contextos largos: el tiempo hasta el primer token (TTFT) en prompts de 32K. Según la model card, el nivel sin adaptador (s=42) reduce el TTFT de 48,45 s a 41,67 s (1,16×) sin ningún peso adicional, y los niveles con adaptador llegan hasta 25,06 s (1,93×, hasta 2,03× en una variante). Todo ello manteniendo, según el autor, un 100% de acierto en las pruebas RULER NIAH de 8K a 32K en varios niveles.

El adaptador ocupa entre 0 y 55 MiB en formato safetensors (menos del 0,3% del tamaño del modelo) y se declara compatible con pesos en cuantizaciones GGUF, MLX y NVFP4/MXFP8 sin recalibración. La licencia es Apache 2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye información sobre idiomas soportados ni sobre el pipeline de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de prefill skipping sobre un MoE "looped" (48 visitas lógicas) con Block Attention Residuals, MessageGate entre pasadas y convolución dinámica de 4 taps |
| Parámetros totales | 26,4B (modelo base Inkling-2-Mini); adaptador de 0 a 55,3 MiB |
| Parámetros activos | 3,4B (modelo base, MoE) |
| Longitud de contexto | Evaluado hasta 32K en la model card (no se especifica el máximo nativo) |
| Tipos de cuantización | El adaptador se declara compatible con NVFP4, MXFP8, Q4_K_M, IQ4_NL, Q3_K_M, Q8_0, Q4_0 y MLX 4-bit del modelo base; el adaptador en sí se distribuye en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador); el modelo base se carga en sus cuantizaciones originales |

## Arquitectura y entrenamiento

El adaptador no entrena nada: aplica una solución en forma cerrada (regresión ridge) sobre el estado residual de las visitas que se saltan. Concretamente, calcula la BlockAttnRes nativa del modelo base más la MessageGate y las matrices W_k/W_v del host, y añade un delta de bajo rango (r=512 o r=256) antes de la sconv, ejecutando después la dynamic_short_conv1d de 4 taps, el L2Clip y la v_norm exactos del modelo original. El resultado es un fichero safetensors de entre 0 y 55,3 MiB que se carga junto a los pesos sin modificar del modelo base.

La innovación clave es el denominado "Direct KV Fill": en el nivel s=42, el autor sostiene que el flujo de valores de la visita global v=47 proviene en un 99,4% de bloques anteriores (h_0, h_6, h_12, h_42) y en un 88,2% directamente de los embeddings crudos h_0, por lo que reutilizar la query nativa de AttnRes de v=47 permite saltar las 6 capas epilogue en MXFP8 sin ningún peso adicional. Los niveles inferiores (s=36, 30, 24, 18) saltan 12, 18, 24 y 30 visitas respectivamente y requieren el adaptador de bajo rango. La decodificación posterior al prefill ejecuta siempre las 48 visitas originales, y los prompts cortos (N ≤ tail_tokens) caen al prefill exacto con max_diff = 0,0.

## Capacidades

- Aceleración del prefill en contextos largos: reduce el TTFT de 32K de 48,45 s a 25,06 s (1,93×) o hasta 2,03× en la variante h0 del nivel s=18.
- Transferencia entre cuantizaciones sin recalibración: los mismos safetensors se aplican sobre pesos NVFP4/MXFP8, Q4_0, Q8_0, Q3_0 y MLX 4-bit, según la model card.
- Conmutación A/B instantánea entre prefill exacto y prefill saltado, con fallback bit a bit para prompts cortos.
- Decodificación exacta de 48 visitas: todos los tokens generados pasan por las 48 visitas originales del modelo base.
- Compatibilidad declarada con motores de serving: llama.cpp, vLLM, MLX y Strata (documentados en ENGINE_INTEGRATION.md).
- No añade capacidades nuevas de generación, razonamiento, código, visión, tool calling ni agentes: esas capacidades dependen exclusivamente del modelo base Inkling-2-Mini.

## Casos de uso

- Serving de contextos largos en producción: el adaptador reduce el TTFT de 32K de 48,45 s a 32,77 s con el nivel equilibrado s=30, lo que rebaja el coste por petición en cargas con prompts de decenas de miles de tokens.
- Chat con documentos extensos: para RAG sobre contratos o informes de 8K a 32K, el nivel s=30 mantiene un 100% de acierto en RULER NIAH (82/82) según el autor, lo que lo hace apto para preguntas sobre pasajes largos.
- Despliegue en hardware limitado: el nivel s=42 no requiere ningún byte de adaptador y ofrece 1,16× de mejora, útil cuando no se quiere añadir ficheros extra al despliegue.
- A/B testing de calidad frente a latencia: la conmutación instantánea entre prefill exacto y saltado permite medir el impacto en calidad por petición sin reiniciar el servidor.
- Pipelines con cuantización extrema: la transferencia sin recalibración sobre Q4_0 y Q3_0 permite usar el adaptador en despliegues GGUF de bajo bit sin reajustar los proyectores.
- Evaluación de investigaciones sobre atención residual: el código y los proyectores sirven como referencia reproducible para estudiar el impacto de saltar visitas globales en MoE con attention residuals.

## Benchmarks y rendimiento

Datos publicados en la model card (TTFT real eager a 32K, mediana de 3 ejecuciones en caliente; exacto = 48,45 s; KL y NLL sobre 30 documentos de 32K sin solapamiento; RULER con 82 ítems NIAH de 8K a 32K):

| Nivel | Adaptador | Tamaño | Visitas saltadas | TTFT 32K | KL_all / KL_key | KeyRec | RULER 8K–32K |
|---|---|---:|---|---:|---|---:|---:|
| Exacto 48 visitas | ninguno | 0 MiB | 0/48 | 1,00× (48,45 s) | 0,00000 / 0,0000 | 100,0% | 100,0% (82/82) |
| Zero-Lossless (s=42) | integrado | 0 MiB | 6/48 ([47]) | 1,16× (41,67 s) | 0,00040 / 0,0009 | 100,14% | 100,0% (82/82) |
| Ultra-Lossless (s=36) | s36 | 22,1 MiB | 12/48 ([41, 47]) | 1,29× (37,50 s) | 0,00179 / 0,0091 | 97,37% | 100,0% (82/82) |
| Balanced (s=30) | s30 | 33,2 MiB | 18/48 ([35, 41, 47]) | 1,48× (32,77 s) | 0,00329 / 0,0183 | 95,69% | 100,0% (82/82) |
| Balanced compacto (s=30, r=256) | s30-compact | 16,6 MiB | 18/48 | 1,48× | 0,00370 / 0,0206 | 95,22% | no disponible |
| Fast (s=24) | s24 | 44,3 MiB | 24/48 ([29, 35, 41, 47]) | 1,70× (28,52 s) | 0,00570 / 0,0352 | 92,94% | 98,8% (81/82) |
| Turbo (s=18, h=1024) | s18 | 55,3 MiB | 30/48 ([23, 29, 35, 41, 47]) | 1,93× (25,06 s; 2,03× h0) | 0,01050 / 0,0715 | 89,14% | 100,0% (82/82) |
| Turbo compacto (s=18, r=256) | s18-compact | 27,7 MiB | 30/48 | 1,93× | 0,01119 / 0,0769 | 88,53% | no disponible |

En 16K el autor reporta aceleraciones de 1,05× (s=42), 1,14× (s=36), 1,26× (s=30), 1,38× (s=24) y 1,54× (s=18). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador añade entre 0 y 55,3 MiB de memoria; el requisito dominante es el del modelo base Inkling-2-Mini (26,4B totales, 3,4B activos).
- Los benchmarks del autor se midieron en una Intel Arc Pro B70 con activaciones bfloat16 y expertos nativos NVFP4/MXFP8; no se detallan requisitos de VRAM del modelo base.
- No se especifica si el modelo base cabe en GPU de consumo; con 26,4B totales, una cuantización de 4 bits requeriría del orden de 13–15 GB solo para pesos, pero este dato no está confirmado en la información proporcionada.
- Motores de despliegue soportados según la model card: llama.cpp, vLLM, MLX y Strata.
- Throughput y latencia fuera del TTFT de prefill: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| inkling-2-mini-prefill-skip | 26,4B totales / 3,4B activos (base) + adaptador de 0–55 MiB | evaluado hasta 32K | Aceleración de prefill sin entrenamiento | Apache 2.0 | Hugging Face (0 descargas) |
| thinkingmachines/Inkling-2-Mini | 26,4B totales / 3,4B activos | no disponible | Modelo base MoE con 48 visitas | no disponible en la información | Hugging Face |
| Alternativas de aceleración de prefill (p. ej. adaptadores de KV cache o poda de capas) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Repositorio sin tracción: 0 descargas y 0 likes; no hay validación independiente de los resultados reportados por el autor.
- Los benchmarks proceden exclusivamente de la model card y de un solo hardware (Intel Arc Pro B70); la reproducibilidad en otras GPU no está documentada.
- El nivel s=18 reduce la recuperación de claves al 89,14% y el nivel s=24 al 92,94%; los niveles agresivos degradan la fidelidad del prefill aunque el RULER NIAH se mantenga alto.
- El ahorro se limita a la fase de prefill; la decodificación ejecuta siempre las 48 visitas y no se acelera.
- Los prompts cortos (N ≤ tail_tokens) no se benefician del skipping y caen al prefill exacto.
- No se especifican idiomas soportados ni sesgos conocidos del modelo base; el adaptador no altera esas características.
- La licencia Apache 2.0 cubre el adaptador, pero el uso comercial depende también de la licencia del modelo base Inkling-2-Mini, que no se detalla en la información disponible.
- Riesgo de alucinación: no evaluado de forma específica; el adaptador puede introducir desviaciones en el estado de las visitas saltadas (KL de hasta 0,0105 en s=18).
- La integración requiere modificar el motor de serving (llama.cpp, vLLM, MLX o Strata) según ENGINE_INTEGRATION.md; no es un simple cambio de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darioooooo0o/inkling-2-mini-prefill-skip
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Preprint "Direct KV Fill": paper.pdf (referenciado en la model card del repositorio)
- Especificación de integración en motores: ENGINE_INTEGRATION.md (referenciado en la model card del repositorio)
