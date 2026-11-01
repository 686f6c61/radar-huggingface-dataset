# IsValorum/Clover-35B-A3B-Preview-Q8_0-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de generación de texto desarrollado por Diffuspace, con una arquitectura MoE (mixture of experts) propia denominada `clover_moe`. Esta ficha corresponde a la cuantización Q8_0 en formato GGUF publicada por IsValorum, un cuantizador independiente que computa sus conversiones en clústeres de nube propios. El modelo tiene 34.661.350.848 parámetros totales y, según la nomenclatura "A3B", activa aproximadamente 3.000 millones de parámetros por token, lo que permite obtener latencias propias de un modelo de 3B manteniendo la capacidad de uno de 35B.

Su relevancia actual radica en que se trata de un modelo en fase preview con una arquitectura no soportada de forma nativa por `llama.cpp` upstream, por lo que requiere un runtime parcheado específico. Es un modelo conversacional de generación de texto con licencia Apache 2.0, lo que lo hace apto para uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `clover_moe` (MoE propia, no soportada por llama.cpp vanilla) |
| Parámetros totales | 34.661.350.848 (34,66B) |
| Parámetros activos | ~3B (deducido de la denominación A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (esta ficha); BF16 disponible en IsValorum/Clover-35B-A3B-Preview-BF16-GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (34,37 GiB en Q8_0) |

## Arquitectura y entrenamiento

Clover emplea una arquitectura MoE etiquetada como `clover_moe`, una variante que no está implementada en la rama principal de `llama.cpp`. Para ejecutarla es necesario usar los binarios precompilados de [IsValorum/llama.cpp-clover-moe](https://huggingface.co/IsValorum/llama.cpp-clover-moe) o compilar desde la rama parcheada (PR #31306, commit `4838ffb0c8ade92f34d9157deea38d92758ab824`). La cuantización Q8_0 se calculó de forma independiente a partir de la revisión `4b0402b65e523d0183a14c431955438714cb16ff` del modelo base, partiendo de la versión BF16 del mismo cuantizador.

No se ha publicado información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación. Tampoco se documenta el número exacto de expertos ni la estrategia de enrutado de la arquitectura MoE. El autor de la cuantización publica además una matriz de importancia (I-Matrix) de 1,25 millones de entradas para cuantizaciones futuras de mayor fidelidad.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Inferencia eficiente gracias a la arquitectura MoE: ~3B de parámetros activos frente a 34,66B totales.
- Ejecución local vía llama.cpp parcheado, con aceleración CPU (x86-64), NVIDIA CUDA 12/12.8 y Vulkan (AMD/Intel).
- Cuantización de alta fidelidad Q8_0, cercana a la calidad de la versión BF16 original.
- No hay información publicada sobre tool calling, capacidades de visión/audio, modo de razonamiento extendido ni soporte multiidioma.

## Casos de uso

- Chatbots conversacionales en local: al ser un modelo etiquetado como conversational con ~3B de parámetros activos, permite desplegar asistentes de diálogo en hardware modesto sin depender de APIs externas.
- Experimentación con arquitecturas MoE nuevas: al tratarse de un modelo preview con arquitectura propia, es útil para investigadores que quieran analizar el comportamiento de la familia `clover_moe` en inferencia local.
- Pruebas de calidad de cuantización: la versión Q8_0, calculada con I-Matrix de 1,25M de entradas, sirve como referencia de alta fidelidad para comparar contra cuantizaciones más agresivas (Q4, Q5) del mismo modelo.
- Generación de texto en entornos sin conexión: el formato GGUF y la ejecución vía llama.cpp permiten usarlo en máquinas aisladas o con conectividad restringida.
- Evaluación en CPU pura: la build de Linux x86_64 para CPU permite ejecutar el modelo en servidores sin GPU, aprovechando que solo ~3B de parámetros se activan por token.
- Prototipado en Windows con GPU heterogéneas: el paquete universal de Windows soporta NVIDIA (sm_50 a sm_120), AMD e Intel vía Vulkan, útil para estaciones de trabajo sin GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 pesa 34,37 GiB; con descarga completa a GPU se necesita una GPU con ~35-40 GB de VRAM (A100 40 GB, A100 80 GB, H100). Con descarga parcial de capas (`-ngl` parcial) es viable en GPUs de 24 GB como la RTX 4090 o RTX 3090, descargando el resto a RAM.
- Consumer GPUs: parcialmente viable. En una RTX 4090 (24 GB) solo cabría parte del modelo; con suficiente RAM del sistema y modo híbrido GPU+CPU es ejecutable, con penalización de latencia.
- CPU: la build Linux x86_64 para CPU funciona en cualquier máquina x86-64 (requiere GLIBC 2.38 o superior, p. ej. Ubuntu 24.04).
- Runtimes: exclusivamente llama.cpp parcheado (IsValorum/llama.cpp-clover-moe o compilación desde el PR #31306). No funciona en llama.cpp vanilla; no hay soporte documentado para vLLM, Ollama, TGI ni llama.cpp estándar.
- Cobertura de runtimes precompilados: Linux x86_64 (CPU y CUDA 12 para sm_80/86/89/90) y Windows x86_64 universal (CUDA 12.8 sm_50-sm_120, Vulkan 1.4.363 para AMD/Intel, CPU). No cubiertos: macOS, ARM64, ROCm y Blackwell en Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview (Q8_0) | 34,66B | ~3B | no disponible | Apache 2.0 | GGUF, requiere runtime parcheado |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32.768 (128K con YaRN) | Apache 2.0 | GGUF, safetensors, soporte nativo en llama.cpp/vLLM |
| Qwen3-30B-A3B-Instruct-2507 | 30,5B | 3,3B | 262.144 | Apache 2.0 | GGUF, safetensors, soporte nativo en llama.cpp/vLLM |

Clover compite en la misma categoría de MoE con ~3B de parámetros activos que Qwen3-30B-A3B, pero carece del ecosistema de este último: mientras Qwen3 funciona en runtimes estándar (llama.cpp, vLLM, Ollama) y publica benchmarks, Clover requiere un fork específico de llama.cpp y no tiene datos de rendimiento publicados. Su ventaja potencial es la frescura del modelo (preview reciente) y la licencia permisiva.

## Limitaciones y advertencias

- El archivo no carga en `llama.cpp` vanilla: la arquitectura `clover_moe` no está implementada upstream. Es obligatorio usar los binarios parcheados de IsValorum o compilar desde la rama correspondiente.
- Sin benchmarks publicados: no hay forma de evaluar objetivamente su calidad frente a alternativas establecidas antes de probarlo.
- La model card del modelo base no documenta idiomas soportados, longitud de contexto ni proceso de entrenamiento, lo que dificulta evaluar su idoneidad para casos de uso concretos.
- Al ser un modelo preview, su comportamiento puede cambiar en versiones futuras y puede contener sesgos o defectos no documentados.
- Riesgo de alucinación: no disponible (sin evaluaciones publicadas).
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.
- Cobertura de hardware limitada: sin soporte macOS, ARM64, ROCm ni Blackwell en Linux en los builds precompilados.
- La build Linux exige GLIBC 2.38+ (Ubuntu 24.04 o equivalente), lo que excluye distribuciones más antiguas sin contenedores.

## Enlaces

- Ficha de la cuantización Q8_0: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-Q8_0-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Cuantización BF16 del mismo autor: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-BF16-GGUF
- Runtime parcheado precompilado: https://huggingface.co/IsValorum/llama.cpp-clover-moe
- PR de soporte en llama.cpp: PR #31306 (commit `4838ffb0c8ade92f34d9157deea38d92758ab824`)
- Soporte al cuantizador: https://ko-fi.com/isvalorum
