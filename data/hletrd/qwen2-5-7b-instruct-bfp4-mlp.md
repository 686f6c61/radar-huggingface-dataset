# hletrd/Qwen2.5-7B-Instruct-BFP4-MLP

## Resumen

Qwen2.5-7B-Instruct-BFP4-MLP es una cuantización del modelo Qwen2.5-7B-Instruct de Alibaba Qwen, publicada por el usuario hletrd, orientada específicamente a las NPU Tensix de Tenstorrent. El modelo base es un transformer denso de 7.615.616.512 parámetros (7,6 mil millones) con licencia Apache 2.0, y esta variante aplica cuantización en bloque de coma flotante (block floating point, BFP) sobre las capas MLP en formato `bfloat4_b`, manteniendo la atención en `bfloat8_b` y el resto de pesos en bf16.

El interés de esta ficha radica en que no es una cuantización convencional para GPU, sino un empaquetado pensado para el stack de software de Tenstorrent (tt-metal, ttnn, tt-forge), lo que permite ejecutar el modelo sobre hardware Tensix con un compromiso controlado de calidad. Según la model card, el formato BFP4 presenta una divergencia media de KL de 0,0470 frente a BF16 sobre 16.104 posiciones de texto en inglés y coreano, un valor comparable al de Q4_K_M de llama.cpp (0,0369) pero con un tamaño empaquetado mayor (6,262 GB frente a 4,683 GB).

La relevancia actual es doble: por un lado, ofrece una alternativa de despliegue de Qwen2.5-7B-Instruct en aceleradores no-GPU; por otro, documenta de forma explícita la pérdida de calidad asociada a la cuantización BFP4, algo poco habitual en model cards de cuantizaciones. El repositorio incluye además los formatos BFP8 y BF16, así como scripts de empaquetado y verificación (`pack_tensix.py`, `verify_grid.py`) bajo la misma licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), cuantizado en block floating point para Tensix |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (MLP en `bfloat4_b`, atencion en `bfloat8_b`, resto bf16); BFP8 (atencion y MLP en `bfloat8_b`, resto bf16); BF16 sin cuantizar |
| Idiomas soportados | Ingles (etiqueta `language: en` en la model card); el modelo base Qwen2.5 es multilingue, pero esta variante solo declara ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpetas `bfp4/`, `bfp8/` y BF16), con metadatos `quant4.json` e indice `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-7B-Instruct, un transformer denso decoder-only de la familia Qwen2.5, entrenado por el equipo Qwen de Alibaba y publicado en septiembre de 2024. Esta variante no reentrena el modelo: parte de los pesos oficiales de Qwen2.5-7B-Instruct y aplica una cuantización post-entrenamiento en formato block floating point (BFP), un esquema en el que bloques de valores comparten un exponente y cada elemento conserva una mantisa reducida. La cuantización se aplica selectivamente: en el formato `bfp4/`, las capas MLP usan `bfloat4_b`, la atención usa `bfloat8_b` y el resto de parámetros permanece en bf16.

El repositorio incluye herramientas propias de Xylolabs (`tensix-bfp-gptq`) para empaquetar y verificar los pesos en el layout de tiles que espera ttnn, así como scripts `pack_tensix.py` y `verify_grid.py` que permiten reempaquetar y validar la conversión ida y vuelta contra los tensores originales. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esa información corresponde a la documentación original de Qwen2.5 y no se reproduce aquí.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento de propósito general y respuesta a instrucciones en formato chat (plantilla `apply_chat_template`).
- Generación de código y matemáticas, como capacidades del modelo base (no verificadas específicamente tras la cuantización en la información disponible).
- Soporte de tool calling y function calling: capacidad del modelo base Qwen2.5-7B-Instruct; la model card de esta variante no la documenta explícitamente.
- Capacidades multilingües: el modelo base es multilingüe, pero esta variante solo declara inglés (`language: en`).
- Ejecución sobre NPU Tensix mediante ttnn y tt-forge, con verificación de empaquetado incluida.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en la información proporcionada.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. El modelo está empaquetado para ejecutarse sobre NPU Tensix con tt-metal v0.81.1 y `--use_hf_rope`, lo que permite servir Qwen2.5-7B-Instruct en aceleradores Tenstorrent sin depender de GPU NVIDIA.
- Evaluación de cuantización BFP4: investigadores pueden comparar la divergencia KL de BFP4 (0,0470) frente a BFP8 (0,00158) y Q4_K_M (0,0369) sobre el mismo conjunto de 16.104 posiciones, usando los scripts de verificación incluidos.
- Prototipado de pipelines de inferencia en ttnn: el ejemplo de la model card muestra cómo empaquetar una matriz (`model.layers.0.mlp.down_proj.weight`) y verificar la conversión ida y vuelta con `ttnn.to_torch`, útil para validar integraciones antes de desplegar en producción.
- Servicio de generación de texto en inglés con presupuesto de memoria reducido: el formato `bfp4/` ocupa 6,262 GB empaquetados frente a 15,23 GB en BF16, lo que facilita alojar el modelo en dispositivos con DRAM limitada.
- Chatbot de asistencia técnica en inglés: el modelo conserva la plantilla de chat de Qwen2.5 y puede gestionar conversaciones multi-turno, aunque la longitud de contexto efectiva no está documentada en esta variante.
- Integración en flujos con tt-forge y torch.compile: la model card incluye un ejemplo con `torch_xla` y backend `tt`, adecuado para equipos que ya trabajan con el stack de compilación de Tenstorrent.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí incluye una tabla de fidelidad de cuantización medida como divergencia KL media frente a BF16:

| Formato | Tamano empaquetado (GB) | KL media frente a BF16 |
|---|---|---|
| `bfp4/` (MLP bfloat4_b, atencion bfloat8_b) | 6,262 | 0,0470 |
| `bfp8/` (atencion y MLP bfloat8_b) | 9,114 | 0,00158 |
| BF16 (Qwen2.5-7B-Instruct original) | 15,23 | 0 |
| Q4_K_M (llama.cpp) | 4,683 | 0,0369 |

La medición de KL cubre 16.104 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano). No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,262 GB para el formato `bfp4/`, 9,114 GB para `bfp8/` y 15,23 GB para BF16 (tamaños empaquetados según la model card).
- GPU recomendadas: no aplica de forma nativa; el modelo está orientado a NPU Tensix de Tenstorrent. La model card muestra un ejemplo de carga con `transformers` y `device_map="auto"` en bf16, que requeriría aproximadamente 15 GB de memoria.
- ¿Cabe en GPU de consumo? El formato `bfp4/` (6,262 GB) cabría en GPUs con 8 GB o más si se carga en bf16, pero la cuantización BFP4 solo es aprovechable en hardware Tensix; en GPU el beneficio de memoria no está documentado.
- Opciones de despliegue: ttnn/tt-metal (v0.81.1 o superior), tt-forge con `pjrt-plugin-tt==1.4.0`, y `transformers` con `AutoModelForCausalLM` para carga en bf16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-BFP4-MLP (esta ficha) | 7,6 B | No disponible | BFP4/BFP8 para Tensix | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6 B | No disponible en esta ficha | BF16 original | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct Q4_K_M (llama.cpp) | 7,6 B | No disponible | Q4_K_M (4,683 GB, KL 0,0369) | Apache 2.0 | Hugging Face / llama.cpp |

La comparativa se limita a variantes del mismo modelo base porque la información proporcionada no incluye datos de rendimiento de tareas que permitan contrastar con otras familias. El dato diferencial es la fidelidad de cuantización: BFP4 queda ligeramente por debajo de Q4_K_M en KL (0,0470 frente a 0,0369) con mayor tamaño empaquetado, mientras que BFP8 se acerca mucho a BF16 (0,00158).

## Limitaciones y advertencias

- La cuantización BFP4 introduce una divergencia media de KL de 0,0470 frente a BF16, superior a la de Q4_K_M (0,0369); puede degradar tareas sensibles a precisión numérica.
- El modelo está diseñado para NPU Tensix; en GPU solo se aprovecha la carga en bf16, sin las ventajas de memoria del formato BFP4.
- La model card solo declara inglés (`language: en`), aunque el modelo base Qwen2.5 es multilingüe; el comportamiento multilingüe tras la cuantización no está documentado.
- La longitud de contexto no se especifica en la información proporcionada; no debe asumirse la del modelo base sin verificación.
- Riesgo de alucinación inherente al modelo base Qwen2.5-7B-Instruct; la cuantización puede amplificarlo en dominios de alta precisión.
- Requiere tt-metal v0.81.1 y `--use_hf_rope` para el flujo con tt-transformers; versiones distintas pueden romper la compatibilidad.
- Licencia Apache 2.0 permite uso comercial, pero cada carpeta (`bfp4/`, `bfp8/`) incluye su propio `LICENSE` y `NOTICE` que deben revisarse.
- El repositorio ocupa 28,3 GB en total por incluir varios formatos; conviene descargar solo la carpeta necesaria con `--include`.
- Sesgos conocidos del modelo base no documentados en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen2.5-7B-Instruct-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio relacionado en Hugging Face (Xylolabs): https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tenstorrent-Tensix
