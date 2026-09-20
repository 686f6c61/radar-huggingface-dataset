# AndrewThompson1233/maba-v2-architecture

## Resumen

Maba v2 Architecture (identificador `AndrewThompson1233/maba-v2-architecture`) es una implementación de referencia en PyTorch de una arquitectura híbrida 3:1 que combina recurrencia lineal (DGDA, Decoupled Gated Delta Attention) con atención global dispersa (MABA-SA, con compresión latente MLA). El autor la presenta como la versión de producción del prototipo experimental Maba v1.5-exp, con correcciones de autograd y dispatcher, y con validación de escalado hasta más de 1.000.000 de tokens de contexto. La configuración de referencia declarada tiene 101.282.319 parámetros y 20 capas, de las cuales 15 son de recurrencia DGDA y 5 de atención dispersa.

El problema que aborda es el coste cuadrático de prefill y el coste lineal en decodificación de los transformers densos, frente a la dificultad de los modelos puramente recurrentes para el recuerdo asociativo a larga distancia. La propuesta reparte el cómputo: un 75% por recurrencia de estado constante y un 25% por atención dispersa con enrutado por centroides anti-dilución (DG-Indexer). El autor declara decodificación O(1) plana de 35-37 ms/token en GPUs de consumo y una reducción de caché KV de 39,6x (1,20 GB para 1M tokens en FP16).

La relevancia actual del repositorio es principalmente de investigación arquitectónica: no se describen pesos entrenados publicados, ni proceso de entrenamiento, ni ajuste por instrucciones. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y el pipeline declarado es `text-generation` con licencia propietaria MOAL-1.0 y idioma único `en`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida 3:1: 15 capas DGDA (recurrencia lineal, decoupled gated delta attention) + 5 capas MABA-SA (atención dispersa con compresión latente MLA, d_c = 128); total 20 capas |
| Parametros totales | 101.282.319 (configuración de referencia, `config.json`) |
| Parametros activos | no aplica (la arquitectura de referencia no es MoE) |
| Longitud de contexto | 1.000.000+ tokens declarados (verificados por el autor); posición sin RoPE (NoPE) |
| Tipos de cuantizacion | no disponible (no se documentan formatos cuantizados) |
| Idiomas soportados | en (inglés) |
| Licencia | MOAL-1.0 (`license: other`, `license_name: moal-1.0`); términos no detallados en la información disponible |
| Formato de pesos | no disponible; el repositorio se describe como implementación de referencia en PyTorch (módulos `maba_sparse/*.py`, `config.json`); no se mencionan safetensors ni GGUF |
| Escalado declarado | Tiers de 100M a 30B (100M, 1B, 3B, 7B, 30B) según `SCALING.md` |
| Libreria / runtime | transformers, PyTorch; kernels Triton y flash-attention en las etiquetas del repositorio |
| Otros componentes | Factorized embeddings 32.768 → 128 → 640; RMSNorm; SwiGLU; MTP (multi-token prediction) y speculative decoding en etiquetas; 649 tests superados según la model card |

## Arquitectura y entrenamiento

La macro-topología es una pila de 20 capas con proporción 3:1 entre recurrencia y atención. Las 15 capas DGDA (Decoupled Gated Delta Attention, linaje Gated DeltaNet) mantienen estado constante y asumen el 75% del cómputo. Las 5 capas MABA-SA aplican atención global dispersa sobre representaciones latentes comprimidas (MLA, dimensión latente d_c = 128), con enrutado por centroides en proporción 64:1. La atención se construye como superposición de tres flujos combinados mediante logits de puerta dependientes de los datos: ventana deslizante local de 128 tokens más 4 sinks, bloques dispersos top-32 (2.048 tokens recolectados) y atención de contexto jerárquica (HCA) con compresión 64:1. El indexador (DG-Indexer) usa agrupación híbrida 0,5 × (media + máximo) con penalización por decaimiento de distancia λ · log(1 + Δ) para evitar la dilución de hechos aislados en el ruido de fondo.

La innovación posicional es la sustitución de RoPE por decaimiento recurrente exponencial (α_t), lo que el autor denomina invariancia temporal NoPE y que busca evitar la deriva de fase en frecuencias a larga distancia. Los embeddings son factorizados (32.768 → 128 → 640). En cuanto a entrenamiento, la información disponible no documenta número de tokens, composición del dataset, fases de preentrenamiento ni uso de RLHF/DPO. El autor sí menciona que v2 corrige problemas de propagación de gradiente en el backward y del dispatcher de fallback respecto a v1.5-exp, lo que indica trabajo sobre el grafo autograd de los kernels, pero no se aportan detalles del régimen de entrenamiento ni de los datos.

## Capacidades

- Generación de texto causal (pipeline `text-generation`, `causal-lm`), en inglés.
- Recuperación de hechos en contexto muy largo: el autor reporta extracción de un único needle en el token 742.189 con rango #1 sobre 15.625 bloques y foco de atención fino al 100% (needle-in-a-haystack).
- Decodificación con latencia constante: 35-37 ms/token sin degradación al crecer la secuencia, según las mediciones del autor en GPUs de consumo.
- Eficiencia de memoria de caché KV: 163,6 MB a 131k tokens y 1,20 GB a 1M tokens en FP16.
- Etiquetas del repositorio que sugieren soporte previsto de speculative decoding y multi-token prediction (MTP), aunque no se documenta su implementación funcional.
- Tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Multilingüismo: no; el idioma declarado es únicamente inglés.
- Visión, audio o modo thinking: no disponible (no se mencionan).

## Casos de uso

- Extracción de hechos en corpus masivos: con 1M+ tokens de contexto y recuperación verificada de un dato aislado en el token 742.189, el modelo es adecuado para localizar cláusulas, cifras o referencias concretas dentro de expedientes completos sin trocear el documento.
- Análisis de repositorios de código completos: la ventana de 1M tokens permite cargar un árbol de fuentes entero y responder preguntas de trazabilidad entre ficheros, apoyándose en el flujo de ventana local para el detalle sintáctico cercano.
- Auditoría y revisión documental con memoria acotada: la caché KV de 1,20 GB a 1M tokens (frente a 48,82 GB de un transformer denso equivalente) hace viable mantener varias sesiones de contexto largo simultáneas en una sola GPU.
- Asistentes conversacionales de turnos muy largos: la decodificación O(1) plana de 35-37 ms/token evita que la latencia crezca con el historial, lo que sirve para atención al cliente con transcripciones extensas.
- Inferencia en dispositivo o edge: con 101,3M parámetros, los pesos en FP16 ocupan aproximadamente 202,6 MB (estimación a partir del recuento de parámetros), lo que permite despliegue local en hardware modesto.
- Investigación en arquitecturas eficientes: como referencia reproducible en PyTorch con kernels Triton, sirve de banco de pruebas para comparar recurrencia lineal frente a atención densa en tareas de recall asociativo.
- RAG de contexto único: sustituir la recuperación por fragmentos por una sola pasada sobre el corpus comprimido, usando el enrutado por centroides 64:1 para priorizar bloques relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivales en la model card). Los únicos datos cuantitativos aportados por el autor son de contexto, memoria y latencia, y se recogen a continuación tal como aparecen en su comparativa arquitectónica; se trata de mediciones declaradas por el autor, no verificadas de forma independiente.

| Arquitectura | Topologia | Paradigma de atencion | Decodificacion | KV @ 131k | KV @ 1M | Contexto max |
|---|---|---|---|---|---|---|
| Maba v2 (canonica) | Hibrida 3:1 (15 DGDA : 5 MABA-SA) | MLA latente (d_c=128) + centroides 64:1 | O(1) plana, 35 ms | 163,6 MB | 1,20 GB | 1.000.000+ (NoPE) |
| Qwen3.8-Flash-Next | Hibrida GDN + QSA MoE (6B activos) | Atencion dispersa por micro-bloques | Sublineal O(log L) | 640,0 MB | 4,80 GB | 262k / 1M (YaRN) |
| MiniCPM-5 | CausalLM denso (1B / 2B) | GQA 100% denso | Lineal O(L) | 3,20 GB | 24,50 GB | 131.072 (RoPE) |
| Transformer denso | Transformer estandar | Softmax MHA 100% denso | Lineal O(L) | 6,40 GB | 48,82 GB | 64.000 max (OOM) |

Otros datos declarados: 39,6x de reducción de caché KV respecto a atención densa; recuperación de un solo needle en el token 742.189 con rango #1 sobre 15.625 bloques; 649 tests superados; 100.000 a 30.000 millones de parámetros como rango de escalado documentado.

## Requisitos de hardware

- VRAM para pesos (estimación a partir de 101,3M parámetros): unos 202,6 MB en FP16, unos 101,3 MB en INT8 y unos 50,6 MB en 4 bits. Estas cifras son cálculos derivados del recuento de parámetros; el repositorio no publica pesos cuantizados.
- VRAM para caché KV: 163,6 MB a 131k tokens y 1,20 GB a 1M tokens en FP16, según el autor.
- GPU recomendadas: no disponible en la información proporcionada. El autor solo indica que la decodificación de 35-37 ms/token se mide en "GPUs de consumo", sin especificar modelo.
- Compatibilidad con GPU de consumo: sí, según la afirmación del autor sobre latencia constante en GPUs de consumo; no se detalla qué modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: transformers con PyTorch, con kernels Triton y flash-attention según las etiquetas del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible. Solo se declara latencia de decodificación (35-37 ms/token), sin datos de prefill ni de tokens por segundo agregados.
- Estado del artefacto: el repositorio tiene 0 descargas, por lo que no hay evidencia pública de despliegues en producción.

## Comparativa con modelos similares

Los modelos de comparación proceden de la propia tabla del autor; no se dispone de verificación independiente ni de sus términos de licencia en la información proporcionada.

| Modelo | Parametros | Contexto | Enfoque de atencion | KV @ 1M | Licencia |
|---|---|---|---|---|---|
| Maba v2 Architecture | 101,3M (referencia) | 1.000.000+ | 3:1 hibrida DGDA + MABA-SA con MLA | 1,20 GB | MOAL-1.0 (propietaria) |
| Qwen3.8-Flash-Next | 6B activos (MoE) | 262k / 1M con YaRN | GDN + QSA MoE, micro-bloques dispersos | 4,80 GB | no disponible |
| MiniCPM-5 | 1B / 2B | 131.072 | GQA densa | 24,50 GB | no disponible |
| Transformer denso | no disponible | 64.000 max | Softmax MHA densa | 48,82 GB | no disponible |

Frente a alternativas densas del mismo orden de magnitud (1B-2B), la diferencia declarada es de eficiencia de memoria y de latencia de decodificación, no de calidad de resultados, dado que no hay benchmarks de tareas publicados para Maba v2.

## Limitaciones y advertencias

- No se han publicado pesos entrenados, artefactos de tokenizer ni métricas de calidad; el repositorio se describe como implementación de referencia de arquitectura, no como modelo listo para producción.
- No hay información sobre datos de entrenamiento, por lo que no pueden evaluarse sesgos ni composición del corpus.
- Riesgo de alucinación no cuantificado: sin benchmarks de tareas no hay medida de fidelidad factual más allá del needle-in-a-haystack declarado por el autor.
- Los resultados de contexto, memoria y latencia son afirmaciones del autor, no verificadas de forma independiente; conviene reproducirlos antes de tomar decisiones de arquitectura.
- Idioma limitado a inglés (`en`); no se declara soporte multilingüe.
- Licencia MOAL-1.0 propietaria con `license: other`: no se detallan en la información disponible las condiciones de uso comercial, redistribución ni derivados. Es necesario leer el fichero LICENSE del repositorio antes de cualquier uso.
- El repositorio tiene 0 descargas y 1 like, sin historial de uso en producción ni mantenimiento comprobable.
- La fecha de creación indicada (2026-09-19) y la nomenclatura de los modelos de comparación (Qwen3.8-Flash-Next, MiniCPM-5) no permiten contrastar su existencia con fuentes independientes en la información disponible.
- Compatibilidad de kernels: el rendimiento declarado depende de Triton y flash-attention; no se documentan requisitos de versión ni fallbacks fuera de esos backends.
- No se documenta tool calling, capacidades de agente ni ajuste por instrucciones, por lo que no debe asumirse comportamiento de asistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AndrewThompson1233/maba-v2-architecture
- Configuración de referencia: https://huggingface.co/AndrewThompson1233/maba-v2-architecture/blob/main/config.json
- Documento de escalado: https://huggingface.co/AndrewThompson1233/maba-v2-architecture/blob/main/SCALING.md
- Informe de benchmarks del autor: https://huggingface.co/AndrewThompson1233/maba-v2-architecture/blob/main/BENCHMARK_REPORT.md
- Licencia: https://huggingface.co/AndrewThompson1233/maba-v2-architecture/blob/main/LICENSE
- Prototipo previo en HuggingFace: https://huggingface.co/AndrewThompson1233/maba-v1.5-exp-architecture
- Repositorio GitHub del prototipo previo: https://github.com/AndrewThompson1233/maba-v1.5-exp-architecture
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de TikTok, sin relación con el artefacto.
