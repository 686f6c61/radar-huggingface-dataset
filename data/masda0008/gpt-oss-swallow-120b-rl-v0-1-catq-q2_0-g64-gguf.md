# masda0008/GPT-OSS-Swallow-120B-RL-v0.1-CATQ-Q2_0-g64-GGUF

## Resumen

GPT-OSS-Swallow-120B-RL-v0.1 CAT-Q `Q2_0` (group-64) GGUF es una derivada cuantizada de forma agresiva del modelo `tokyotech-llm/GPT-OSS-Swallow-120B-RL-v0.1-MXFP4`, publicado por el usuario `masda0008`. El modelo original lo desarrolla Swallow LLM (Institute of Science Tokyo y AIST) a partir de la arquitectura `gpt-oss` de OpenAI, y esta versión aplica una ternarización de 1,58 bits sobre los pesos de los expertos enrutados del MoE mediante la técnica BitTern (CAT-Q: Learnable Modulation + Softened Ternarization).

El resultado es un fichero GGUF de 34,16 GiB que comprime los 116.829.156.672 parámetros totales del modelo a 2,25 bits por peso (bpw) en los tensores de expertos, manteniendo en F16/F32 las partes críticas para la estabilidad: embeddings, `lm_head`, normalizaciones RMSNorm, proyecciones de atención, routers y sesgos. El objetivo es hacer viable la inferencia de un MoE de ~117B en hardware de consumo mediante descarga parcial de expertos a CPU.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización extrema (ternaria) aplicada a un MoE grande; por otro, requiere un fork específico de `llama.cpp` (rama `prism` de PrismML) porque el tipo `GGML_TYPE_Q2_0 = 42` no existe en el upstream estándar. Es un artefacto de investigación, no un modelo listo para producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia `gpt-oss`), 36 capas, 128 expertos enrutados por capa, top-4 activos |
| Parámetros totales | 116.829.156.672 |
| Parámetros activos | no disponible (top-4 de 128 expertos por capa; el dato exacto de parámetros activos no se indica) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 32768`) |
| Tipos de cuantización | `GGML_TYPE_Q2_0` (type_id 42, QK2_0=64, 2,25 bpw) en expertos enrutados; F16/F32 en el resto |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (687 tensores; 108 tensores `Q2_0`) |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia `gpt-oss` con 36 capas, `hidden_size = intermediate_size = 2880`, 128 expertos enrutados por capa y enrutamiento top-4. La cuantización CAT-Q ternariza únicamente los pesos de los expertos enrutados (`blk.{0..35}.ffn_{gate,up,down}_exps.weight`, 108 tensores), dejando intactos en F16/F32 los 72 tensores de atención y router, además de embeddings, `lm_head`, RMSNorm y sesgos de expertos. El tamaño de grupo 64 se eligió porque 2880 es divisible por 64 (45 bloques exactos por fila, sin padding), mientras que 128 y 256 no lo son.

La calibración usó 128 muestras de 1024 tokens con una mezcla del 50% prosa japonesa, 30% código y 20% trazas de razonamiento ` thinking` en japonés, y se optimizó con 60 épocas por capa (4458,2 s en total sobre una NVIDIA A100-SXM4-80GB). La telemetría por capa reporta una similitud coseno media de 0,9903 en `gate_up` (mínimo 0,9841) y de 0,9618 en `down` (mínimo 0,8802, con `down_rel_l2` medio de 0,2564). El modelo base se entrenó con los datasets `swallow-math-v2`, `swallow-code-v2`, `Swallow-Nemotron-Post-Training-Dataset-v1` y `lmsys-chat-1m-synth`; no se detalla en la información disponible la composición exacta de tokens ni si hubo RLHF/DPO más allá de lo que sugiere el sufijo `RL` del nombre.

## Capacidades

- Generación de texto conversacional en inglés y japonés.
- Razonamiento con modo `thinking` (el ejemplo de despliegue activa `--reasoning auto` y `--reasoning-effort medium`).
- Razonamiento matemático y generación de código, según los datasets de entrenamiento del modelo base (`swallow-math-v2`, `swallow-code-v2`).
- Soporte de plantilla Jinja para chat (`--jinja` en el ejemplo de `llama-server`).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).
- Capacidad multilingüe limitada a inglés y japonés según la model card.
- No se documentan en la información disponible capacidades de visión, audio ni tool calling explícito.

## Casos de uso

- Despliegue de un MoE de ~117B en una estación de trabajo con GPU de 16 GB y 64 GB de RAM: el ejemplo oficial de `llama-server` con `-ngl 99 --n-cpu-moe 28` descarga 28 capas de expertos a CPU, lo que permite ejecutar el modelo en hardware consumer.
- Asistencia conversacional en japonés: el modelo está entrenado y calibrado con una mezcla significativa de prosa japonesa, por lo que es adecuado para chat multi-turno en ese idioma.
- Generación y revisión de código en entornos con recursos limitados: los datasets `swallow-code-v2` y la calibración con un 30% de código orientan el modelo a tareas de programación.
- Razonamiento matemático con modo `thinking`: útil para problemas de varios pasos donde se quiere traza de razonamiento, aunque la cuantización ternaria puede degradar la precisión aritmética.
- Investigación sobre cuantización ternaria de MoE: el repo incluye `catq_layer_metrics.jsonl` con similitudes coseno por capa, útil para estudiar la degradación introducida por CAT-Q.
- Prototipado de pipelines de inferencia con forks de `llama.cpp`: sirve para validar la rama `prism` y el tipo `Q2_0` antes de adoptarlos en producción.
- Evaluación comparativa de derivadas cuantizadas: al ser una derivada de un MXFP4, permite medir la pérdida de calidad frente al checkpoint original en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas internas de fidelidad de la cuantización por capa (similitud coseno de `gate_up` y `down`), no resultados en MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 34,16 GiB; con `--n-cpu-moe 28` el ejemplo oficial asume una GPU de 16 GB de VRAM más 64 GB de RAM del sistema.
- GPU recomendadas: el ejemplo de despliegue apunta a una GPU de 16 GB; la cuantización se optimizó en una NVIDIA A100-SXM4-80GB, pero no se indica que sea necesaria para inferencia.
- Cabe en GPU consumer: sí, con descarga parcial de expertos a CPU (por ejemplo, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080 16 GB) combinada con 64 GB de RAM.
- Opciones de despliegue: exclusivamente `llama.cpp` en la rama `prism` de PrismML (`llama-server`), ya que el tipo `GGML_TYPE_Q2_0` no está en el upstream estándar. No se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-OSS-Swallow-120B-RL-v0.1 CAT-Q Q2_0 (este) | 116,8B | no disponible | Q2_0 ternaria (2,25 bpw) en expertos | Apache 2.0 | Hugging Face, requiere llama.cpp `prism` |
| tokyotech-llm/GPT-OSS-Swallow-120B-RL-v0.1-MXFP4 | 116,8B | no disponible | MXFP4 | Apache 2.0 | Hugging Face |
| gpt-oss (familia original de OpenAI) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Modelo en fase temprana de I+D: la model card original advierte que las salidas no están alineadas con la intención humana ni con consideraciones de seguridad.
- La ternarización agresiva de los expertos enrutados puede reducir la precisión en tareas intensivas en conocimiento, aritmética de varios pasos y contexto largo respecto al checkpoint MXFP4.
- La similitud coseno de `down` baja hasta 0,8802 en la peor capa, con `down_rel_l2` medio de 0,2564, lo que indica desviación no trivial en esas proyecciones.
- Idiomas limitados a inglés y japonés; no se garantiza un comportamiento correcto en castellano.
- Requiere un fork no estándar de `llama.cpp` (rama `prism` de PrismML); no funciona con el upstream ni con las herramientas habituales del ecosistema.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta derivada cuantizada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de seguridad y la degradación por cuantización desaconsejan su uso en producción sin validación específica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso comunitario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/masda0008/GPT-OSS-Swallow-120B-RL-v0.1-CATQ-Q2_0-g64-GGUF
- Modelo base: https://huggingface.co/tokyotech-llm/GPT-OSS-Swallow-120B-RL-v0.1-MXFP4
- Swallow LLM: https://swallow-llm.github.io/index.en.html
- BitTern (Intel Labs China): https://github.com/IntelChina-AI/BitTern
- PrismML llama.cpp (rama `prism`): https://github.com/PrismML-Eng/llama.cpp
- Paper referenciado en los tags: arxiv:2508.10925
