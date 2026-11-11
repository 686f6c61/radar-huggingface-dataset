# hanzoai/zen6-nano-2b

## Resumen
Zen 6 Nano (2B) es un modelo de lenguaje multimodal y agentico de pesos abiertos desarrollado por Hanzo AI y Zen LM en colaboracion con Zoo Labs Foundation. Se distribuye bajo licencia Apache 2.0 y esta cuantizado de forma nativa en pesos ternarios de 1.58 bits (valores {-d, 0, +d}), lo que reduce drasticamente el espacio en disco y los requisitos de memoria frente a un transformer denso equivalente.

El modelo parte de una arquitectura hibrida que intercala bloques de atencion lineal Gated-DeltaNet (GDN) con bloques de atencion completa agrupada (GQA), e incorpora un proyector visual para entrada image-text-to-text. Esta post-entrenado directamente en el espacio de pesos ternarios mediante Quantization-Aware Training con Straight-Through Estimator y optimizadores Muon + AdamW.

Su propuesta de valor es el despliegue de agentes con tool calling MCP en entornos de coste cero: el pack PTQ1_0 ocupa unos 429 MB y puede servirse en CPU, lo que permite ejecutar pruebas de integracion de LLM y de llamadas a herramientas en runners de CI/CD sin claves de API ni coste por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: atencion lineal Gated-DeltaNet (3 bloques) + atencion completa GQA (1 bloque), MLP SwiGLU, proyector visual mmproj |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa 1.58-bit: PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw), Q2_0 (2,250 bpw); proyector visual en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42; mmproj en Q8_0 y BF16) |

## Arquitectura y entrenamiento
El backbone combina bloques de atencion lineal Gated-DeltaNet con bloques de atencion completa Grouped-Query en una proporcion de 3:1, con MLPs SwiGLU y un proyector multimodal para imagenes. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de Sylvester-Walsh-Hadamard, con vectores de signo por canal embebidos en los metadatos KV del GGUF (`prism.hadamard.*`). Esta rotacion elimina los valores atipicos de activacion, de modo que los pesos ternarios por grupo de 128 conservan la precision densa.

El post-entrenamiento se realizo directamente en el espacio de pesos ternarios mediante QAT con Straight-Through Estimator y una combinacion de optimizadores Muon y AdamW. El autor declara atribucion upstream a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash / ProCreations, aunque no se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF o DPO.

## Capacidades
- Generacion de texto conversacional con identidad de pesos nativa y respeto de personas de desarrollador personalizadas (por ejemplo, NPC de Godot o extractores JSON).
- Razonamiento agentico multi-paso con ejecucion de `<tool_call>`, sintesis de `<tool_response>`, recuperacion de errores y abstencion calibrada de herramientas.
- Tool calling sobre el conjunto de herramientas MCP `fs`, `exec`, `code`, `git`, `test`, `hanzo` y herramientas de direccion de motores de juego.
- Entrada multimodal image-text-to-text mediante el proyector visual mmproj.
- Servido mediante API compatible con OpenAI `/v1/chat/completions`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- CI/CD sin coste por token: cargar `zen6-nano-2b-PTQ1_0.gguf` (~429 MB) en runners de CPU con `llama-server -ngl 0` para ejecutar pruebas de integracion de LLM y de tool calling sin claves de API.
- Agentes de automatizacion de repositorio: el modelo puede leer `Cargo.toml`, listar archivos del workspace y lanzar tests unitarios encadenando las herramientas `fs`, `exec` y `test`.
- Backend de videojuegos: integracion como director de NPC con personas personalizadas y herramientas de motor de juego, sirviendo en local en `http://127.0.0.1:36900/v1`.
- Extraccion estructurada de datos: uso como extractor JSON con persona de desarrollador, aprovechando la identidad de pesos nativa sin sobrecarga de system prompt.
- Asistente de desarrollo en estaciones de trabajo sin GPU: despliegue en CPU con los packs ternarios PTQ1_0 o Q2_0 en llama.cpp upstream (b11556+).
- Prototipado de pipelines agenticos MCP: validacion de flujos multi-paso con recuperacion de errores y abstencion de herramientas antes de migrar a modelos mayores.
- Inferencia en Apple Silicon: uso de los packs MLX de 2 bits con `mlx-lm` para pruebas locales en macOS.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el repo completo ocupa 2,5 GB; el pack PTQ1_0 pesa aproximadamente 429 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo y en RAM de CPU.
- GPU recomendadas: no se especifican modelos concretos; el fork PrismML de llama.cpp soporta CUDA, Metal y CPU, y `hanzo-engine` tiene kernels ternarios en desarrollo para CUDA, ROCm, Metal y CPU SIMD.
- Cabe en GPU de consumo: si, dado el tamano de los packs ternarios; no se detallan modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: fork PrismML de llama.cpp (rama `prism`) para PQ2_0, PTQ1_0 y Q2_0; llama.cpp upstream b11556+ para Q2_0; `mlx-lm` en Apple Silicon; `hanzo engine serve` y `hanzo up` con API compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento ni de contexto de modelos comparables en la informacion proporcionada. Como referencia de categoria, el autor cita atribucion upstream a Qwen (Alibaba Cloud) y Bonsai-2 (Prism ML), pero no se ofrecen cifras que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| Zen 6 Nano 2B | ~1,88 mil millones | no disponible | Ternaria 1.58-bit (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No se han publicado datos sobre sesgos, composicion del dataset ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a un modelo de ~1,88 mil millones de parametros; no hay benchmarks que acoten su fiabilidad.
- Longitud de contexto e idiomas soportados no documentados, lo que impide garantizar comportamiento en conversaciones largas o en castellano.
- La cuantizacion ternaria nativa exige runtimes especificos: PQ2_0 y PTQ1_0 requieren el fork PrismML de llama.cpp; solo Q2_0 es compatible con llama.cpp upstream.
- Los kernels ternarios nativos de `hanzo-engine` estan en desarrollo, no en produccion.
- El modelo se publico con 0 descargas y 0 likes, sin validacion externa de la comunidad.
- Aunque la licencia es Apache 2.0, el aviso NOTICE exige preservar la atribucion a Qwen, Bonsai-2 y DFlash / ProCreations.
- No se especifican requisitos de hardware recomendados ni latencias, por lo que el dimensionamiento en produccion requiere pruebas propias.

## Enlaces
- Hugging Face: https://huggingface.co/hanzoai/zen6-nano-2b
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Fork PrismML de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
