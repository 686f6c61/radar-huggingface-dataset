# freriadoc/Qwen3.8-Flash-Next-Avalon-GGUF

## Resumen

Qwen3.8-Flash-Next-Avalon-GGUF es una cuantización GGUF del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario freriadoc. No se trata de una cuantización convencional: los pesos han sido empaquetados específicamente para Avalon, un fork de llama.cpp desarrollado por el mismo autor que permite ejecutar un modelo MoE de aproximadamente 88 GB en una sola GPU de 20 GB, manteniendo los expertos en RAM del sistema y una caché de expertos en VRAM.

El modelo base es un transformer de tipo Mixture-of-Experts con 107.115.029.376 parámetros totales, 512 expertos de los cuales 10 están activos por token, 48 capas y una ventana de contexto que el autor opera hasta 262.144 tokens. La cuantización híbrida IQ3_KS combina tipos propios de Avalon (IQ3_KS e IQ3_K) con tipos estándar heredados de ISTA-DASLab y AtomicChat, e incluye un sidecar MTP (Multi-Token Prediction) para decodificación especulativa con dos tokens de borrador.

Su relevancia radica en dos factores: permite servir un modelo de más de 100.000 millones de parámetros en hardware de consumo (una RX 7900 XT de 20 GB) con velocidades de generación de 50-91 t/s, y demuestra una estrategia de cuantización selectiva por componente (parte densa a 4,27 bpw, expertos enrutados a 3,25-3,44 bpw) que preserva la calidad mejor que cuantizaciones uniformes de bitrate similar. La contrapartida es que los ficheros solo cargan en Avalon: ni llama.cpp estándar ni ik_llama.cpp los aceptan.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con cabeza MTP/NextN para decodificación especulativa |
| Parámetros totales | 107.115.029.376 (~107,1 B) |
| Parámetros activos | 10 expertos activos de 512 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | Hasta 262.144 tokens (configuración operativa del autor); longitud nativa del modelo base no disponible |
| Tipos de cuantización | IQ3_KS (3,25 bpw, variante propia de Avalon), IQ3_K (3,44 bpw), IQ2_S, IQ4_XS, IQ4_NL, Q2_0, Q8_0 (sidecar MTP); parte densa a AD-4,27bpw |
| Idiomas soportados | No disponible (la model card solo reporta métricas de perplejidad en inglés, francés y código) |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | GGUF (33 shards, ~89 GiB) + sidecar MTP GGUF (1,48 GB) + ranking de caché de expertos (0,2 MB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con 512 expertos, 10 activos por token y 48 capas. Incluye una cabeza NextN/MTP oficial que permite decodificación especulativa: el sidecar genera dos tokens candidatos que el modelo principal verifica en un solo paso. Los detalles de composición del dataset de entrenamiento, número de tokens y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La innovación de esta publicación está en la cuantización y el runtime. La parte densa (atención, routers, expertos compartidos, embeddings y LM head) proviene de la cuantización AD-4,27bpw de AtomicChat. Los expertos enrutados parten de la cuantización GSQ-RCO de ISTA-DASLab (IQ3_S), con los tensores up/gate de 17 capas recuantizados a IQ3_KS (escala por bloque de 256 pesos y subescalas por 32) y los de 10 capas a IQ3_K, ambos desde los pesos BF16 originales con importance matrix. El resto se mantiene: up/gate IQ2_S en 20 capas e IQ4_XS en 1, down IQ4_NL en 39 capas y Q2_0 en 9. Los expertos se empaquetan por capa de forma contigua para que el llenado de la caché GPU sea una sola copia por experto. El sidecar MTP recuantiza sus expertos (up/gate IQ3_K, down IQ4_NL) con importance matrix, mantiene el resto en Q8_0 y recorta el LM head a los 65.536 tokens más frecuentes (FR-Spec), tomando los embeddings del modelo principal. El fichero `moe-cache-ranking.bin` precarga en VRAM los expertos más usados, calculado sobre unas 18 millones de enrutaciones.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 256k tokens en la configuración medida).
- Razonamiento y generación de código: la perplejidad en código (1,331) es la mejor de todas las cuantizaciones comparadas en la model card, incluidas las de 4 bits.
- Capacidades multilingües: se reportan métricas en inglés y francés; el conjunto completo de idiomas del modelo base no está disponible.
- Decodificación especulativa mediante MTP con dos tokens de borrador, con una tasa de aceptación del 80,7 % sobre un texto fijo de 19k tokens de prompt.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con APIs compatibles, aunque no se detalla en la model card.
- Soporte de tool calling, function calling y flujos de agente: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional de contexto largo: con 256k tokens de ventana y 74,5 t/s con MTP a 131k tokens rellenados, el modelo puede mantener conversaciones o análisis sobre documentos extensos (contratos, expedientes, bases de código completas) sin truncar.
- Generación de código en producción: la perplejidad más baja en código entre las cuantizaciones comparadas y la velocidad de prefill (1.376-1.661 t/s) lo hacen viable para autocompletado y revisión de parches en pipelines de CI/CD, siempre que el backend sea Avalon.
- Procesamiento de documentación técnica multilingüe: las métricas en francés e inglés permiten tareas de resumen y traducción entre ambos idiomas, aunque el soporte de otros idiomas debe validarse empíricamente.
- Despliegue en hardware de consumo: con una GPU de 20 GB y 96 GB de RAM DDR4 se obtienen 62-91 t/s de generación, lo que habilita prototipado e inferencia local de un modelo de 107B sin clúster.
- Servicio de inferencia con caché de expertos caliente: el ranking precargado acelera las primeras respuestas de un servidor recién arrancado entre un 5 y un 8 %, útil en despliegues con arranques frecuentes o escalado efímero.
- Investigación en cuantización y decodificación especulativa: la publicación documenta perplejidad por idioma y dominio, tasa de aceptación MTP y rendimiento por caso, lo que la convierte en una referencia reproducible para estudiar el impacto de bitrates selectivos en MoE.
- Evaluación comparativa de runtimes: sirve para medir el coste real de mantener expertos en RAM frente a VRAM en cargas de contexto largo, con datos de prefill y generación a 32k y 256k.

## Benchmarks y rendimiento

Perplejidad sobre 8 × 4.096 tokens de textos externos (menor es mejor):

| Cuantización | Inglés | Francés | Código |
|---|---|---|---|
| Unsloth UD-Q4_K_XL | 1,316 | 3,581 | 1,325 |
| Unsloth UD-IQ4_XS | 1,401 | 3,841 | 1,343 |
| **Esta cuantización (IQ3_KS híbrida)** | **1,443** | **3,857** | **1,331** |
| ISTA GSQ-RCO IQ3_S | 1,469 | 3,932 | 1,338 |
| AtomicChat AD-4,27bpw | 1,509 | 4,073 | 1,347 |
| ISTA GSQ-RCO IQ3_XXS | 1,596 | 4,294 | 1,364 |

Velocidad medida en RX 7900 XT 20 GB (RDNA3, PCIe 3.0 x16), Ryzen 7 3800XT (8 núcleos), 96 GB DDR4-3200, ROCm 7.2, decodificación greedy, 512 tokens, mediana de 3 ejecuciones:

| Caso | Generación sin MTP | Generación con MTP | Prefill |
|---|---|---|---|
| Contexto 32k, prompt corto, caché caliente | 62,4 t/s | 91,0 t/s | 1.661 t/s |
| Contexto 256k, 131k rellenados | 55,6 t/s | 74,5 t/s | 1.496 t/s |
| Contexto 256k, 250k rellenados | 50,5 t/s | 69,8 t/s | 1.376 t/s |

Aceptación MTP: 80,7 % sobre un texto fijo con prompt de 19k tokens, 1.023 posiciones y 2 tokens de borrador. En las ejecuciones de velocidad la aceptación osciló entre 0,6 y 0,95 según la previsibilidad del texto. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 20 GB es suficiente para la parte densa más la caché de expertos; el resto de expertos reside en RAM del sistema. El conjunto completo ocupa ~89 GiB en disco.
- RAM del sistema: 96 GB DDR4-3200 en la configuración medida; el modelo completo (~88 GB) debe caber en RAM junto con el sistema operativo.
- GPU recomendadas: RX 7900 XT 20 GB con ROCm 7.2 es la plataforma validada. No se han publicado mediciones en A100, H100 ni RTX 4090; el autor menciona soporte ROCm y el tag `rocm` sugiere que la ruta CUDA de Avalon no es la principal.
- GPU de consumo: sí cabe en GPUs de 20 GB o más, siempre que se acompañen de RAM suficiente. En GPUs de 24 GB (RTX 4090) no hay datos de rendimiento publicados.
- Despliegue: exclusivamente mediante Avalon (fork de llama.cpp), con `llama-server` y los flags `-fa on -ctk q8_0 -ctv q4_0 --jinja --parallel 1 -md ... --spec-type draft-mtp --spec-draft-n-max 2`. No es compatible con llama.cpp estándar, ik_llama.cpp, vLLM, TGI ni Ollama.
- Latencia y throughput: 50,5-91,0 t/s de generación y 1.376-1.661 t/s de prefill según contexto y uso de MTP, en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (inglés) | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| **Qwen3.8-Flash-Next-Avalon-GGUF** | 107,1 B (10 de 512 expertos activos) | 262.144 tokens (operativo) | 1,443 | Qwen Community 1.0 | GGUF solo Avalon |
| Unsloth UD-Q4_K_XL (mismo base) | 107,1 B | No disponible | 1,316 | Qwen Community 1.0 | GGUF llama.cpp |
| ISTA GSQ-RCO IQ3_S (mismo base) | 107,1 B | No disponible | 1,469 | Qwen Community 1.0 | GGUF |
| AtomicChat AD-4,27bpw (mismo base) | 107,1 B | No disponible | 1,509 | Qwen Community 1.0 | GGUF |

Las alternativas comparables disponibles son otras cuantizaciones del mismo modelo base; no se dispone de datos de modelos de otros fabricantes con los que contrastar parámetros, contexto y rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros usan tipos de cuantización propios de Avalon (IQ3_KS con escala por bloque de 256 pesos, distinto del IQ3_KS de ik_llama.cpp), un layout de expertos empaquetado y un formato de sidecar MTP con LM head recortado. llama.cpp estándar e ik_llama.cpp los rechazan.
- Dependencia de un fork mantenido por un único autor: la viabilidad a largo plazo del runtime Avalon condiciona el uso en producción.
- Licencia Qwen Community License 1.0: no es una licencia de código abierto permisiva; deben revisarse sus restricciones antes de un uso comercial.
- La perplejidad es superior a la de cuantizaciones de 4 bits en inglés (1,443 frente a 1,316) y en francés (3,857 frente a 3,581), aunque inferior en código (1,331 frente a 1,325). El compromiso calidad/tamaño no es uniforme por dominio.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad o sesgo en la información disponible.
- Idiomas: solo hay métricas en inglés, francés y código; el comportamiento en castellano y otros idiomas no está documentado.
- El rendimiento depende de la previsibilidad del texto (aceptación MTP entre 0,6 y 0,95) y de la caché de expertos; textos con enrutamiento atípico degradarán la velocidad.
- Las mediciones se han realizado en una única plataforma (RX 7900 XT + ROCm 7.2); no hay datos en CUDA, A100, H100 ni RTX 4090.

## Enlaces

- [Hugging Face: freriadoc/Qwen3.8-Flash-Next-Avalon-GGUF](https://huggingface.co/freriadoc/Qwen3.8-Flash-Next-Avalon-GGUF)
- [Modelo base: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Licencia Qwen Community 1.0](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE)
- [Repositorio Avalon](https://github.com/freriadoc/Avalon)
- [ISTA-DASLab (GSQ-RCO)](https://huggingface.co/ISTA-DASLab)
- [Paper GSQ (arXiv:2604.18556)](https://arxiv.org/abs/2604.18556)
- [Paper RCO (arXiv:2605.00649)](https://arxiv.org/abs/2605.00649)
- [AtomicChat/Qwen3.8-Flash-Next-GGUF](https://huggingface.co/AtomicChat/Qwen3.8-Flash-Next-GGUF)
- [Unsloth/Qwen3.8-Flash-Next-GGUF](https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF)
- [drluoto/Qwen3.8-Flash-Next-MTP-GGUF](https://huggingface.co/drluoto/Qwen3.8-Flash-Next-MTP-GGUF)
- [ik_llama.cpp](https://github.com/ikawrakow/ik_llama.cpp)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [buun-llama-cpp](https://github.com/spiritbuun/buun-llama-cpp)
