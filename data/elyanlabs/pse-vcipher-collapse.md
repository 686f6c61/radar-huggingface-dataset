# elyanlabs/pse-vcipher-collapse

## Resumen

`elyanlabs/pse-vcipher-collapse` no es un modelo de lenguaje con pesos: es una instantánea del código fuente del repositorio `github.com/Scottcjn/pse-vcipher-collapse`, un prototipo de optimización de inferencia para kernels de atención tipo llama.cpp sobre arquitectura IBM POWER8 (ppc64le). Lo firma Scott Boudreaux / Elyan Labs y se distribuye como código C con intrinsics AltiVec, sin checkpoint, sin tokenizador y sin pipeline asociado en HuggingFace. Su tesis es sustituir el producto escalar Q·K completo por una selección previa de candidatos: un prefilter O(1) usando la instrucción criptográfica `vcipher` (AES de ISA 2.07) y un colapso selectivo de rutas mediante `vec_perm`, conservando aproximadamente el 25 % de las rutas antes de calcular el dot product completo.

El interés técnico está en el uso de hardware que ninguna GPU expone de forma equivalente: la ronda AES combina SubBytes (ranking no lineal), ShiftRows (mezcla intra-registro), MixColumns (difusión entre cabezas vía GF(2^8)) y AddRoundKey con entropía del timebase `mftb`. Según el README, el prefilter cuesta 0,044 µs por par K-V frente a 1-10 µs de un `kq_vec_dot()` completo con DK=128 o superior, y en una secuencia de 2048 tokens se evitan unas 1536 multiplicaciones completas por token generado.

La relevancia es acotada y experimental: el propio autor indica que esto no es un reemplazo general de atención en GPU, que el alcance está limitado a POWER8 y que la actualización de documentación no ha reejecutado benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado evaluaciones de calidad que cuantifiquen la degradación introducida al descartar el 75 % de las rutas de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo con pesos. Prototipo de kernel de atención (variante dispersa de Flash Attention) sobre instrucciones vectoriales y criptográficas de IBM POWER8; integración con `ggml_compute_forward_flash_attn_ext_f16_one_chunk()` de llama.cpp |
| Parametros totales | No disponible (no se distribuyen pesos ni checkpoint) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El ejemplo del README usa 2048 tokens como referencia de cálculo del ahorro |
| Tipos de cuantizacion | No disponible. La ruta de integración descrita opera sobre `flash_attn_ext_f16`, es decir, atención en FP16 |
| Idiomas soportados | No disponible (el repositorio no incluye modelo ni tokenizador) |
| Licencia | AGPL-3.0 |
| Formato de pesos | No aplica: el repositorio contiene únicamente código fuente C/Altivec, cabeceras y documentación (`.md`, `llms.txt`). Sin safetensors, GGUF ni binarios |

## Arquitectura y entrenamiento

No hay entrenamiento. El repositorio implementa dos primitivas complementarias sobre el ISA de POWER8. La primera es `vec_perm` (AltiVec), un permute de doble fuente en un solo ciclo que se usa para implementar un colapso hebbiano de rutas: los patrones de bytes duplican las rutas con puntuación alta y podan las débiles, sustituyendo lo que en GPU requeriría aproximadamente 80 operaciones (gather, compare, scatter, mask). La segunda es `vcipher`, que aplica una ronda AES completa en un ciclo y se emplea como operador de atención no lineal: el estado se inicializa con `Q XOR K`, se genera una round key con entropía del timebase hardware `mftb` (`vc_make_round_key(layer, position)`) y la suma de los 16 bytes de salida se invierte (`4080 - energy`) para obtener una métrica de energía que actúa como score de atención.

El flujo de integración descrito tiene tres fases: una pasada 1 que calcula un `vcipher_attention_score` por cada par K-V, un umbral que conserva el top 25 % mediante ordenación parcial, y una pasada 2 que ejecuta el `kq_vec_dot` completo, softmax y acumulación de V solo para las rutas supervivientes. El README documenta cuatro modos de operación: generación de patrón de permute no lineal vía rondas AES, ranking de scores mediante la no linealidad de SubBytes, fusión entre cabezas mediante MixColumns (difusión en GF(2^8) que, según el autor, no es posible con `vec_perm`) y el prefilter O(1) de atención. El hardware de referencia es un IBM POWER8 S824 con 512 GB de RAM y 128 hilos.

## Capacidades

- Aceleración de kernels de atención: prefilter O(1) por par K-V y poda selectiva de rutas antes del dot product completo.
- Integración con llama.cpp: parchea la función de atención Flash Attention FP16 (`flash_attn_ext_f16_one_chunk`) en la ruta de `ggml`.
- Colapso hebbiano de rutas mediante `vec_perm`: duplicación de rutas fuertes y poda de rutas débiles en un solo ciclo de instrucción.
- Ranking no lineal de scores mediante la S-box de AES (SubBytes) y difusión entre cabezas mediante MixColumns en GF(2^8).
- Inyección de entropía hardware mediante el timebase `mftb` de POWER8 en la generación de round keys.
- Perfilado para motores generativos: incluye `llms.txt` con el alcance POWER8, entidades `vcipher`/`vec_perm`, caveats de benchmark y objetivos de citación.
- Certificación BCOS documentada en `BCOS.md`.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni soporte multilingüe: es infraestructura de inferencia, no un modelo.

## Casos de uso

- Investigación en mecanismos de atención dispersa: sirve como banco de pruebas para medir si un prefilter barato y no lineal (una ronda AES) preserva las rutas dominantes que seleccionaría un softmax completo, comparando la distribución top-25 % contra la referencia densa.
- Sustitución de dot products en despliegues POWER8 existentes: en un servidor POWER8 S824 con llama.cpp, el parche puede reducir el coste por token al evitar aproximadamente el 75 % de los `kq_vec_dot` con DK≥128, según las cifras del autor.
- Estudio de operadores no lineales en atención: el modo de fusión entre cabezas vía MixColumns permite experimentar con difusión en cuerpo finito GF(2^8), un primitivo que no está expuesto en ISAs de GPU convencionales.
- Referencia para portar técnicas de poda de atención a otros ISA vectoriales: el código documenta explícitamente qué partes dependen de `vcipher` (no portables) y qué partes usan `vec_perm` (mapeables a `pshufb`/`tbl` en otras arquitecturas).
- Docencia y formación en optimización de bajo nivel: el repositorio muestra el mapeo entre las etapas de AES y su interpretación como operaciones de atención, con código C concreto.
- Auditoría de reproducibilidad en inferencia: el uso de entropía del timebase hardware lo convierte en un caso de estudio sobre determinismo y trazabilidad de resultados en kernels de atención.
- Base para prototipos de decodificación especulativa o atención dispersa en entornos HPC con ppc64le, siempre que se valide antes la calidad del modelo subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, perplexity ni evaluaciones de calidad de la poda. La única cifra de rendimiento citada en la documentación es de tipo microarquitectónico:

| Metrica | Valor declarado | Contexto |
|---|---|---|
| Coste del prefilter `vcipher_attention_score` | 0,044 µs por par K-V | Frente a 1-10 µs de `kq_vec_dot()` con DK=128+ (cifra del autor, sin metodología publicada) |
| Dot products evitados | ~1536 por token generado | Secuencia de 2048 tokens, retención del top 25 % |
| Throughput | 147,54 t/s con pp128 | Citado en elyanlabs.ai con prefetch `dcbt` residente e IBM MASS; no verificado ni reproducible con la información disponible |

No se especifica modelo base, tamaño de batch, versión de llama.cpp, flags de compilación ni condiciones térmicas para la cifra de throughput. El propio README advierte que la actualización de documentación no reejecutó benchmarks ni validó nuevos valores de throughput.

## Requisitos de hardware

- CPU: IBM POWER8 (ISA 2.07 o superior) obligatorio. La instrucción `vcipher` es imprescindible para el prefilter; sin ella el código no compila ni se ejecuta.
- Arquitectura: ppc64le exclusivamente. No funciona en x86-64, ARM64 ni RISC-V.
- Memoria: el equipo de referencia es un POWER8 S824 con 512 GB de RAM; no se documenta un mínimo. El consumo vendrá determinado por el modelo que se sirva con llama.cpp, no por este parche.
- VRAM: no aplica. No hay ruta GPU ni CUDA/ROCm en el repositorio.
- GPU recomendadas: ninguna. El proyecto es explícitamente CPU-only sobre POWER8.
- Cabe en hardware de consumo: no. POWER8 no está disponible en equipos de consumo; el S824 es un servidor de gama alta.
- Despliegue: compilación de llama.cpp con flags de POWER8 y aplicación del parche sobre la ruta de Flash Attention; el README menciona IBM MASS y prefetch `dcbt` residente. No hay soporte de vLLM, TGI, Ollama ni llama.cpp en configuraciones estándar sin el parche.
- Latencia y throughput: 0,044 µs por par K-V en el prefilter y 147,54 t/s pp128 como cifra declarada, sin condiciones de medida publicadas.

## Comparativa con modelos similares

| Alternativa | Tipo | Contexto / alcance | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PSE vcipher collapse | Kernel de atención dispersa sobre POWER8 | Prefilter O(1) + top 25 % de rutas; ejemplo de 2048 tokens | 0,044 µs/par K-V; 147,54 t/s pp128 (declarado, sin verificar) | AGPL-3.0 | Código en GitHub/GitLab y espejo en HuggingFace |
| Flash Attention 2 | Kernel de atención exacta, GPU | Atención densa con tiling; longitudes de contexto de decenas de miles | Ampliamente validado en la literatura | BSD-3-Clause (implementación de referencia) | Integrado en PyTorch, vLLM, llama.cpp y otros |
| Atención dispersa tipo BigBird / Longformer | Atención con patrón fijo (ventana + global) | Patrones predefinidos, no dependientes de datos | Publicado en papers originales | Apache-2.0 / MIT según implementación | Bibliotecas de HuggingFace Transformers |
| llama.cpp sin parchear | Runtime de inferencia CPU | Depende del modelo servido | Ampliamente reportado por la comunidad | MIT | Repositorio público |

La comparación cuantitativa con Flash Attention 2 o con atención dispersa entrenada no está disponible: no hay evaluación de calidad, ni perplexity, ni comparación de latencia sobre el mismo modelo base.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni puede evaluarse con benchmarks de LLM. Cualquier expectativa de capacidades lingüísticas es un error de categoría.
- Cero validación de calidad publicada: no hay datos de perplexity, accuracy ni degradación por podar el 75 % de las rutas de atención. Retener el top 25 % según un score AES no garantizado como proxy del softmax puede degradar la salida de forma no medida.
- No determinismo por diseño: la round key incorpora entropía del timebase hardware `mftb`. Dos ejecuciones con la misma entrada pueden producir scores de prefilter distintos, lo que dificulta la depuración y la reproducibilidad de resultados.
- Dependencia total de POWER8: sin `vcipher` el mecanismo principal no existe. El parche no es portable a x86-64 ni a ARM64 sin rediseñar el prefilter.
- Estado de prototipo: 0 descargas y 0 likes, creado y actualizado el mismo día (2026-10-23), sin historial de mantenimiento en HuggingFace. El repositorio se describe como "source snapshot" y "prototype".
- Advertencia explícita del autor: el README indica que el repositorio no es un reemplazo general de atención en GPU y que la documentación no ha reejecutado benchmarks.
- Licencia AGPL-3.0: el uso en un servicio de red obliga a liberar el código fuente derivado. Es incompatible con despliegues comerciales cerrados sin licencia alternativa del titular.
- Idiomas, sesgos y alucinación: no evaluables, al no incluir el repositorio pesos ni tokenizador.
- Sin soporte de tooling estándar: no hay integración con vLLM, TGI, Ollama ni pipelines de HuggingFace; el pipeline figura como no disponible.
- Las cifras de rendimiento (0,044 µs/par, 147,54 t/s) carecen de metodología reproducible y no deben citarse como resultado validado.

## Enlaces

- HuggingFace: https://huggingface.co/elyanlabs/pse-vcipher-collapse
- Repositorio GitHub: https://github.com/Scottcjn/pse-vcipher-collapse
- Repositorio GitLab (historial completo): https://gitlab.com/elyan-labs/pse-vcipher-collapse
- Sitio del autor: https://elyanlabs.ai/
- Perfil para motores generativos: `llms.txt` en la raíz del repositorio
- Certificación BCOS: `BCOS.md` en la raíz del repositorio
- Licencia: `LICENSE` (AGPL-3.0)
- Paper o publicación técnica: no disponible
- Demo: no disponible
