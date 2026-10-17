# bytebunker/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-4bit

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-4bit es una cuantización comunitaria a 4 bits en formato MLX del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16`, publicada por ByteBunker Labs. El modelo base es un Mixture-of-Experts híbrido Mamba-2 + atención (arquitectura `nemotron_h_puzzle`) con 74.042.705.408 parámetros totales y aproximadamente 9B activos por token, desarrollado por NVIDIA y distribuido bajo licencia OpenMDW-1.1. Esta conversión no entrena nada nuevo: extrae el backbone de texto del release BF16 y lo reempaqueta para que quepa en un Mac con Apple Silicon.

El problema que resuelve es práctico: el checkpoint BF16 ocupa del orden de 148 GB en pesos y no cabe en ninguna estación de trabajo de consumo. La cuantización affine de MLX a 4 bits con grupo de 64 reduce el repositorio a unos 43 GB (9 shards de safetensors, ~4,674 bits por peso), lo que permite ejecutar los 74B en un equipo con 64 GB o más de memoria unificada. La ventana de contexto se mantiene en 262.144 tokens y el diseño híbrido Mamba-2/atención mantiene la caché KV pequeña en contexto largo.

Es relevante ahora porque demuestra que un MoE de esta escala puede correr en local sobre hardware Apple, con tasas medidas de ~44 tokens/s de decodificación en un M3 Max de 128 GB. La contrapartida es que el formato MLX no es portable a CUDA, que el modelo solo declara inglés, que se ha eliminado la torre de visión y audio del release multimodal y que la arquitectura `nemotron_h_puzzle` todavía no carga con `mlx-lm` estándar (0.32.x), por lo que requiere un parche.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h_puzzle`: MoE híbrido Mamba-2 + atención, con expertos enrutados heterogéneos por capa, ruta MoE latente de bajo rango y un experto compartido (top-k = 9) |
| Parametros totales | 74.042.705.408 (74B) |
| Parametros activos | ~9B por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | MLX affine 4 bits, grupo de 64 (~4,674 bpw); embeddings a 8 bits; router/gate, proyecciones latentes del MoE, `lm_head`, normalizaciones y `conv1d` de Mamba en precisión completa |
| Idiomas soportados | Inglés (`en`) |
| Licencia | OpenMDW-1.1 (heredada del modelo base; se incluye copia en `LICENSE`) |
| Formato de pesos | safetensors para MLX (9 shards, ~43,3 GB en total) |
| Modalidad | Texto únicamente (sin torres de visión ni audio) |
| Modelo base | `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16` (relación: quantized) |
| Biblioteca | `mlx` (requiere soporte `nemotron_h_puzzle` no incluido en `mlx-lm` 0.32.x) |
| Tensores | 1.309 |
| Memoria unificada recomendada | 64 GB o más |
| Pipeline | `text-generation` |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas Mamba-2 con capas de atención y un Mixture-of-Experts denominado "Puzzle", en el que el número de expertos enrutados varía por capa. El enrutamiento usa top-k = 9, incluye un experto compartido y una ruta MoE latente de bajo rango (`fc1_latent_proj` / `fc2_latent_proj`) que reduce el coste de las proyecciones del experto. Con 74B parámetros totales y ~9B activos por token, el coste de cómputo por token se sitúa en el rango de un modelo denso de ~9B, mientras que la capacidad efectiva de parámetros es la de un 74B. La combinación Mamba-2 + atención es la responsable de que la caché KV crezca poco en contexto largo, lo que hace viable la ventana de 256K en hardware de un solo equipo.

Sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras fases de alineamiento) no hay información en los materiales proporcionados: no disponible. La model card de esta cuantización solo documenta el proceso de conversión, no el preentrenamiento. La innovación técnica documentada aquí es la propia canalización de cuantización de ByteBunker Labs: extracción del backbone de texto desde el release BF16 de NVIDIA, conversión affine determinista con una política de precisión mixta (4 bits en `in_proj`/`out_proj` de Mamba, `q/k/v/o_proj` de atención, expertos enrutados `switch_mlp.fc1`/`fc2` y experto compartido; 8 bits en embeddings; precisión completa en router, proyecciones latentes, `lm_head`, normalizaciones y `conv1d`) y verificación cruzada contra otra cuantización MLX 4 bits de la comunidad: 1.309 tensores idénticos estructuralmente, puntos cero idénticos byte a byte (273/273) y escalas coincidentes a ~1e-3.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (`tokenizer.chat_template` disponible en el tokenizador).
- Contexto largo real de hasta 262.144 tokens, con caché KV reducida gracias al diseño híbrido Mamba-2/atención.
- Razonamiento y generación de código: no hay confirmación explícita en la información disponible; el pipeline declarado es `text-generation` y el caso de uso mostrado en la model card es explicar paralelismo de tensores, pero no se documentan evaluaciones específicas.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas a inglés según el campo `language` del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en esta conversión; las torres de visión y audio del release multimodal no se incluyen.
- Ejecución local en Apple Silicon mediante `mlx-lm` parcheado o el motor TensorFold, con decodificación codiciosa verificada token a token frente a la referencia.

## Casos de uso

- Inferencia local en un Mac de gama alta: desplegar el modelo con `mlx-lm` sobre un equipo con 64 GB o más de memoria unificada para tener un 74B (9B activos) en local; con 128 GB se midieron ~44 GB de pico de memoria y ~44 tokens/s de decodificación, suficiente para uso interactivo individual.
- Análisis de documentos largos sin trocear: la ventana de 262.144 tokens permite ingerir contratos, informes o bases de código completas en una sola petición, y el diseño Mamba-2 mantiene contenida la memoria de la caché KV frente a un transformer denso equivalente.
- Asistente de desarrollo offline: integrarlo en flujos de trabajo donde el código no puede salir de la máquina (entornos regulados, auditorías), usando el contexto largo para incluir varios ficheros y el historial de conversación.
- Servicio multiusuario ligero sobre TensorFold: el motor fusionado reporta ~51 tokens/s con 4 flujos concurrentes frente a ~45 tokens/s en un solo flujo, lo que permite atender a un equipo pequeño desde una única máquina Apple.
- Experimentación con arquitecturas híbridas MoE/Mamba: sirve como banco de pruebas reproducible para estudiar enrutamiento top-9 heterogéneo o el impacto de la cuantización selectiva, dado que la conversión es determinista y verificable tensor a tensor.
- Preprocesado y etiquetado por lotes en inglés: resumen, extracción de entidades o clasificación de textos largos en pipelines nocturnos, aprovechando el prefill medido de ~476 tokens/s con prompts de 5K.
- Prototipado rápido antes de escalar a producción: validar prompts y plantillas de chat en local antes de mover la carga a una infraestructura con GPUs y el checkpoint BF16, evitando costes de GPU durante la fase de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye métricas de inferencia medidas en un Apple M3 Max de 128 GB:

| Metrica | mlx-lm (sin fusionar) | TensorFold (fusionado) |
|---|---|---|
| Decodificacion | ~44 tokens/s | ~45 tokens/s (1 flujo) / ~51 tokens/s (4 flujos) |
| Prefill | ~476 tokens/s (prompt de 5K) | no disponible |
| Memoria pico | ~44 GB | no disponible |
| Tiempo de carga | no disponible | ~41 s |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de calidad para esta cuantización ni para el modelo base en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: ~44 GB de pico medidos con esta cuantización de 4 bits; el repositorio en disco ocupa ~43,3 GB. Se recomienda un equipo con 64 GB o más de memoria unificada.
- El checkpoint BF16 del modelo base requeriría del orden de 148 GB solo para pesos (cálculo aproximado a partir de 74.042.705.408 parámetros × 2 bytes), por encima de la mayoría de configuraciones de una sola GPU.
- GPU recomendadas: exclusivamente Apple Silicon. La medición de referencia se hizo en un M3 Max de 128 GB; por requisito de memoria, encajan equipos con 64 GB o más de memoria unificada (familia M3/M4 Max y M2/M3 Ultra). No aplica a A100, H100 ni RTX 4090: el formato MLX no se ejecuta sobre CUDA.
- ¿Cabe en GPU de consumo? No en el sentido habitual (NVIDIA/AMD). Cabe en un Mac de gama alta con 64 GB o más de memoria unificada. No hay versión GGUF publicada en este repositorio, por lo que no se puede usar con llama.cpp u Ollama tal cual.
- Opciones de despliegue: `mlx-lm` con el soporte `nemotron_h_puzzle` añadido manualmente (dos ficheros del directorio `contrib/` de `dgx-spark-serve`), o el motor TensorFold de ByteBunker Labs con soporte fusionado. vLLM y TGI no son aplicables a este formato.
- Latencia y throughput: ~44 tokens/s de decodificación y ~476 tokens/s de prefill (prompt de 5K) con `mlx-lm`; ~45 tokens/s en un flujo y ~51 tokens/s con 4 flujos concurrentes en TensorFold; ~41 s de carga en este último.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bytebunker/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-4bit (esta ficha) | 74B | ~9B | 262.144 | MLX safetensors 4 bits (~43 GB) | OpenMDW-1.1 | Comunitaria, 0 descargas, 0 likes en el momento de la consulta |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 (modelo base) | 74B | ~9B | 262.144 | safetensors BF16 | OpenMDW-1.1 | Oficial de NVIDIA |
| Cuantizacion MLX 4 bits de referencia de la comunidad | 74B | ~9B | 262.144 | MLX 4 bits | OpenMDW-1.1 (heredada) | Citada en la model card sin identificador de repositorio: no disponible |

No se dispone de datos de otros modelos comparables (parámetros, contexto, rendimiento o licencia) en la información proporcionada, por lo que no se incluye una comparación frente a alternativas de terceros.

## Limitaciones y advertencias

- Pérdida de fidelidad por cuantización: el paso a 4 bits degrada la calidad frente al BF16. La política de precisión mixta (router, proyecciones latentes, `lm_head`, normalizaciones y `conv1d` en precisión completa) mitiga el efecto, pero no lo elimina.
- Solo inglés: el campo `language` del repositorio declara únicamente `en`; no hay evidencia de calidad en castellano.
- Solo texto: las torres de visión y audio del release multimodal no están incluidas, así que no se pueden usar entradas de imagen o audio.
- Dependencia de un parche: `mlx-lm` 0.32.x no carga esta arquitectura de serie. Es necesario añadir el soporte `nemotron_h_puzzle` desde `contrib/` o esperar a que se fusione el PR ml-explore/mlx-lm#1982. Sin ese paso, `load()` falla.
- Formato no portable: MLX solo se ejecuta en Apple Silicon. No hay GGUF ni pesos para vLLM/TGI en este repositorio, lo que bloquea el despliegue en servidores CUDA.
- Cuantización no oficial: producida por ByteBunker Labs, sin afiliación ni respaldo de NVIDIA. La model card original califica la conversión como "unofficial community quantization".
- Adopción sin verificar: el repositorio registra 0 descargas y 0 likes en los metadatos consultados, por lo que no existe validación independiente por parte de la comunidad más allá de la verificación del propio autor.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de veracidad ni de tasas de alucinación para esta cuantización.
- Licencia OpenMDW-1.1: es una licencia de tipo "other"; quien redistribuya o despliegue el modelo debe cumplir sus términos y realizar su propia diligencia debida, según se indica en la model card. Cualquier uso comercial debe revisarse contra el texto de la licencia.
- Seguridad: el autor recomienda aplicar la guía Trustworthy-AI de NVIDIA y advierte contra eliminar el comportamiento de seguridad del modelo sin una salvaguarda equivalente.
- La sección de limitaciones de la model card original está truncada en la información disponible, por lo que pueden existir advertencias adicionales del autor que no se recogen aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bytebunker/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-4bit
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Texto de la licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- PR de soporte `nemotron_h_puzzle` en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/1982
- Directorio `contrib/` con el soporte para mlx-lm: https://github.com/bytebunkerlabs/dgx-spark-serve/tree/main/contrib/tensorfold-nemotron-h-puzzle
- ByteBunker Labs: https://bytebunkerlabs.ai
