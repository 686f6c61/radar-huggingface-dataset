# NagusameCS/ultratensor-models

## Resumen

UltraTensor models es una colección de recortes por poda de expertos (*expert splices*) del modelo DeepSeek-V4-Pro, un MoE de 1,6 billones de parámetros desarrollado por DeepSeek. El autor, NagusameCS, publica versiones reducidas en las que cada capa MoE conserva únicamente N de sus 384 expertos enrutados (más el experto compartido, la atención y los embeddings), partiendo del GGUF Q3_K_M publicado por BatiAI. El resultado son ficheros de 28 a 39 GiB que caben en hardware mucho más modesto que el modelo original.

La relevancia de esta release (2026-10-09) es que corrige cuatro defectos de la entrega anterior detectados mediante una auditoría que reconstruyó los ficheros desde su receta y los midió contra el modelo completo: routers cortados en el eje equivocado, selección de expertos basada en una sola capa, capas completamente a cero en `keep12u` y ficheros IQ2_XS que emitían basura. Ahora todos los tiers corregidos cargan en llama.cpp estándar (con soporte de DeepSeek-V4), sin fork propietario.

Conviene subrayar que el propio autor califica estos modelos como «fuertemente degradados»: DeepSeek-V4 reparte el enrutamiento entre muchos expertos, de modo que los 16 expertos más usados de una capa reciben solo alrededor de un quinto del tráfico de enrutamiento. No son versiones pequeñas del modelo original, sino aproximaciones con pérdidas medibles y documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) derivado de DeepSeek-V4-Pro; 384 expertos enrutados por capa más experto compartido; atención de bajo rango en la proyección de salida (`attn_output_a`, `attn_output_b`) |
| Parametros totales | 73.796.795.675 (dato de safetensors del repo); el modelo base DeepSeek-V4-Pro tiene 1,6 billones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de servicio usan `-c 4096`) |
| Tipos de cuantizacion | Q3_K_M (tiers `keep12u`, `keep16u`); IQ2_XS solo en pesos de expertos enrutados + Q3_K_M en el resto (`keep16u-iq2xs`); IQ2_XS completo en ficheros antiguos (problemáticos) |
| Idiomas soportados | no disponible (la evaluación incluye texto multilingüe sin especificar idiomas) |
| Licencia | MIT, heredada de `deepseek-ai/DeepSeek-V4-Pro` a través de la distribución GGUF de BatiAI |
| Formato de pesos | GGUF (llama.cpp), con ficheros safetensors en el repo (411,7 GB totales) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: cada capa MoE enruta tokens hacia 384 expertos más un experto compartido, y la proyección de salida de la atención se factoriza en dos matrices de bajo rango. UltraTensor no reentrena nada: parte del GGUF Q3_K_M de BatiAI (17 shards, cada uno verificado contra su sha256 publicado) y aplica una receta de poda que conserva, en cada capa, los N expertos que esa capa concreta utiliza más según una matriz de importancia calculada con `llama-imatrix` sobre el modelo completo (32 × 512 tokens de texto de calibración mixto).

La corrección técnica más relevante afecta a los ficheros IQ2_XS: el preset de llama.cpp pone todos los tensores a 2 bits, pero las dos mitades de la proyección de salida de atención de bajo rango no toleran ambas esa precisión, lo que producía salida degenerada (concordancia top-1 del 0 %). En los nuevos ficheros IQ2_XS solo los pesos de los expertos enrutados (la mayor parte de los bytes) están a IQ2_XS, con la imatrix del modelo completo recortada a los expertos conservados; el resto de tensores se copia sin cambios desde el splice Q3_K_M. No se documentan fases de RLHF o DPO propias de esta release; el entrenamiento es el del modelo base.

## Capacidades

- Generación de texto y razonamiento general, con pérdida de fidelidad sustancial respecto al modelo completo.
- Generación de código: es el dominio donde la degradación es menor (ratio de perplejidad 7,2×–9,1× y concordancia top-1 del 53–55 % en los tiers corregidos).
- Matemáticas y texto web: degradación severa (ratios de 22×–27× y 18×–20× respectivamente).
- Texto multilingüe: el dominio más afectado (ratios de 118×–144×, concordancia top-1 del 20–22 %).
- Carga en llama.cpp estándar con soporte de DeepSeek-V4, verificado tanto en upstream como en la build incluida en Ollama.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repo).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Experimentación e investigación sobre poda de MoE: los ficheros permiten reproducir la receta (`research/phase1_*.py`, `research/release_hf.py` del proyecto Noble) y estudiar cómo afecta el número de expertos conservados a la perplejidad por dominio, con métricas publicadas de referencia.
- Evaluación de infraestructura llama.cpp en CPU: con `-ngl 0 --no-repack` se puede medir throughput y latencia de un MoE de ~32–39 GiB sin GPU, útil para dimensionar servidores antes de invertir en aceleradores.
- Pruebas de despliegue híbrido GPU/CPU: la configuración `--n-cpu-moe 50 --no-op-offload` con 16 GB de VRAM permite validar pipelines de offload de expertos, aunque el autor advierte que esta ruta aún no está verificada.
- Generación de código en entornos con restricciones de memoria: al ser el dominio menos degradado, `keep16u` puede servir para autocompletado o generación de fragmentos en herramientas internas donde se tolere revisión humana obligatoria.
- Reproducción de auditorías de cuantización: los fallos documentados (routers cortados en el eje equivocado, IQ2_XS con concordancia 0 %) sirven como casos de prueba para validar nuevas herramientas de cuantización y recortes de imatrix.
- Docencia sobre arquitecturas MoE: los tiers permiten mostrar en un equipo de sobremesa cómo se comporta un modelo con 384 expertos por capa cuando solo se conservan 12 o 16, sin necesidad de 1,6 billones de parámetros.

## Benchmarks y rendimiento

Evaluación con `llama-perplexity` contra la distribución next-token del modelo completo sobre texto retenido (6 × 512 tokens por dominio). Cada celda indica ratio de perplejidad respecto al modelo completo y concordancia top-1 con él. Perplejidad del modelo completo: 2,48 en código, 4,45 en matemáticas, 5,43 en web y 1,86 en multilingüe.

| Tier | Quant | GiB | code | math | web | multilingual |
|---|---|---|---|---|---|---|
| `keep12u` | Q3_K_M | 32,2 | 7,8× / 53 % | 22,3× / 31 % | 17,8× / 30 % | 118,1× / 22 % |
| `keep16u` | Q3_K_M | 39,3 | 7,2× / 55 % | 22,9× / 32 % | 18,3× / 31 % | 129,9× / 21 % |
| `keep16u-iq2xs` | IQ2_XS experts + Q3_K_M | 28,1 | 9,1× / 53 % | 26,9× / 31 % | 20,0× / 31 % | 143,6× / 20 % |

Ficheros anteriores, para comparación (misma prueba):

| Tier | Quant | code | math | web | multilingual |
|---|---|---|---|---|---|
| `keep8u` (anterior) | Q3_K_M | 12,3× / 51 % | 27,5× / 31 % | 21,0× / 29 % | 145,0× / 21 % |
| `keep12u` (anterior) | Q3_K_M | 12,5× / 50 % | 27,2× / 30 % | 21,5× / 30 % | 140,2× / 20 % |
| `keep16u` (anterior) | Q3_K_M | 12,0× / 50 % | 26,3× / 30 % | 21,3× / 29 % | 130,9× / 21 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: los pesos no-expertos de cualquier tier ocupan unos 10,7 GiB. Tamaño total por tier: 28,1 GiB (`keep16u-iq2xs`), 32,2 GiB (`keep12u`), 39,3 GiB (`keep16u`).
- GPU recomendadas: no especificadas por el autor. La única GPU mencionada en las pruebas es una RTX 5060 Ti (CUDA 12.9) usada con `llama-perplexity`; con `--no-op-offload` obligatorio para evitar un fallo de acceso ilegal a memoria durante el procesamiento de prompt.
- Configuración híbrida documentada: 16 GB de VRAM más expertos en CPU mediante `--n-cpu-moe 50 --no-op-offload`, marcada como «not yet verified».
- CPU: todos los ficheros corregidos se verificaron en CPU con `llama-server -m <fichero> -c 4096 -ngl 0 --no-repack`.
- Despliegue: llama.cpp upstream y la build incluida en Ollama. El fichero antiguo `keep64-iq2xs` requiere el fork de llama.cpp de UltraTensor y no carga en llama.cpp estándar.
- Latencia y throughput: no disponibles; el autor indica que el servicio en GPU sigue en medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad relativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UltraTensor `keep16u` | 73,8 B (splice de 16 de 384 expertos) | no disponible | 7,2× perplejidad en código, 55 % top-1 vs. DeepSeek-V4-Pro | MIT | GGUF en HF, llama.cpp estándar |
| UltraTensor `keep16u-iq2xs` | 73,8 B | no disponible | 9,1× en código, 53 % top-1 | MIT | GGUF en HF, llama.cpp estándar |
| UltraTensor `keep64-iq2xs` | no disponible | no disponible | no disponible | MIT | GGUF en HF, solo fork de UltraTensor |
| DeepSeek-V4-Pro (modelo completo) | 1,6 T | no disponible | Referencia (perplejidad 2,48 en código) | MIT (según herencia indicada) | Pesos originales y GGUF Q3_K_M de BatiAI |

No se dispone de datos de benchmarks estándar para comparar con alternativas de otros autores de tamaño similar; la comparación disponible es exclusivamente interna contra el modelo completo y las releases anteriores del mismo repositorio.

## Limitaciones y advertencias

- Modelos fuertemente degradados por diseño: el autor advierte explícitamente de hechos erróneos y bucles en texto general. La concordancia top-1 con el modelo completo se sitúa entre el 20 % y el 55 % según dominio y tier.
- Multilingüe prácticamente inservible en estos recortes: ratios de perplejidad de 118× a 144× respecto al modelo completo.
- `keep8u` está deprecado: tanto el fichero anterior como una reconstrucción corregida degeneran en repetición («a a a a ...»). No debe usarse.
- `keep12u-iq2xs` sigue marcado como roto (concordancia top-1 del 0 %, salida basura) a la espera de una recuantización corregida.
- `keep8u-iq2xs` está deprecado por el mismo motivo y no se recuantizará.
- `keep64-iq2xs` solo carga con el fork de llama.cpp de UltraTensor, no con llama.cpp estándar.
- El servicio en GPU no está verificado; en la RTX 5060 Ti fue necesario `--no-op-offload` para evitar un fallo de acceso ilegal a memoria.
- La licencia MIT se hereda del modelo base a través de la distribución GGUF de BatiAI; conviene verificar los términos aplicables al modelo original antes de un uso comercial.
- No hay información publicada sobre sesgos, idiomas soportados ni longitud de contexto; los ejemplos de servicio usan 4096 tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NagusameCS/ultratensor-models
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- GGUF de origen (BatiAI): `batiai/DeepSeek-V4-Pro-GGUF` (referenciado en la model card; sin URL directa en la información disponible)
- Proyecto Noble (receta, auditoría y mediciones): rutas `research/phase1_*.py` y `research/release_hf.py` citadas en la model card; sin URL directa en la información disponible
- Catálogo de hashes: `model_catalog.json` en el repositorio
- llama.cpp: no se proporciona URL en la información disponible
