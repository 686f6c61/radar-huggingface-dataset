# IsValorum/Clover-35B-A3B-Preview-BF16-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje MoE (mixture of experts) desarrollado por Diffuspace, del cual IsValorum ha publicado esta cuantización en formato GGUF a precisión BF16. Con 34,66 mil millones de parámetros totales y una nomenclatura "A3B" que sugiere unos 3 mil millones de parámetros activos por token, el modelo sigue el patrón popularizado por arquitecturas como Qwen3-30B-A3B: modelos grandes con inferencia ligera y rápida gracias a la activación dispersa de expertos.

Esta ficha se centra en el repositorio de IsValorum, una conversión a GGUF destinada a su ejecución con llama.cpp. Su relevancia práctica radica en que la arquitectura `clover_moe` no está implementada en el llama.cpp oficial, por lo que el autor distribuye runtimes precompilados con el soporte parcheado. Al ser un modelo "Preview" con licencia Apache 2.0, se trata de una versión preliminar abierta, adecuada para evaluación y experimentación por parte de desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | clover_moe (MoE, variante propietaria no soportada por llama.cpp vanilla) |
| Parametros totales | 34.661.350.848 (~34,7 B) |
| Parametros activos | no disponible (la denominación "A3B" sugiere ~3 B activos, dato no confirmado) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa 4096 tokens) |
| Tipos de cuantizacion | BF16 (esta conversión); I-Matrix de 1,25 M anunciada para publicación posterior |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16), 69,38 GB por archivo |

## Arquitectura y entrenamiento

Clover emplea una arquitectura MoE etiquetada como `clover_moe`, una variante que el llama.cpp oficial no soporta todavía; el soporte existe en un parche (PR #31306 de llama.cpp, commit `4838ffb0c8ade92f34d9157deea38d92758ab824`) que IsValorum incluye en sus builds precompilados. Al tratarse de un MoE de 34,7 B de parámetros totales con nomenclatura A3B, la inferencia activa por token sería de aproximadamente 3 mil millones de parámetros, lo que permitiría latencias y requisitos de memoria de cómputo comparables a modelos densos de ese tamaño, aunque con la capacidad de un modelo mucho mayor.

No se ha publicado información sobre los datos de entrenamiento (número de tokens, composición del dataset) ni sobre el uso de técnicas de alineación como RLHF o DPO en la información disponible. Tampoco constan innovaciones técnicas específicas del modelo más allá de la propia arquitectura MoE.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`)
- Arquitectura MoE con activación dispersa de expertos para inferencia eficiente
- Ejecución local vía llama.cpp (build parcheado) en CPU y GPU
- Cuantización BF16 de alta fidelidad, adecuada como base para cuantizaciones posteriores
- No hay información publicada sobre tool calling, capacidades de visión/audio ni modo de razonamiento extendido

## Casos de uso

- Experimentación con arquitecturas MoE nuevas: al ser uno de los primeros GGUF disponibles de la arquitectura `clover_moe`, permite a desarrolladores evaluar el comportamiento de esta familia de modelos en hardware local antes de que el soporte llegue a upstream.
- Inferencia local en CPU: los builds x86_64 CPU del runtime parcheado permiten ejecutar el modelo en cualquier máquina x86-64 sin GPU, útil para pruebas en servidores sin acelerador.
- Despliegue en GPU NVIDIA con CUDA 12: con `-ngl 99` y flash attention activada, el modelo puede servirse íntegramente en GPU para obtener máxima velocidad de generación.
- Servidores heterogéneos con GPU AMD o Intel: el paquete universal de Windows incluye backend Vulkan 1.4.363, lo que habilita la ejecución en GPUs no NVIDIA.
- Base para cuantizaciones derivadas: al ser BF16, sirve como punto de partida para generar versiones Q4/Q5/Q8 con menor huella de memoria; el autor ya anuncia una I-Matrix de 1,25 M para este fin.
- Evaluación comparativa de modelos abiertos: con licencia Apache 2.0, puede integrarse en pipelines de benchmarking y evaluación sin restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo BF16 ocupa 69,38 GB (64,61 GiB); para cargarlo íntegramente en GPU se necesita una VRAM equivalente o superior.
- GPU recomendadas para carga completa en CUDA: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 3090/4090 con 48 GB agregados). Los builds CUDA cubren sm_80/86/89/90 en Linux y sm_50 a sm_120 en Windows.
- No cabe en una única GPU de consumo estándar (24 GB) en BF16; opciones: offload parcial de capas a CPU, esperar la cuantización I-Matrix anunciada, o usar multi-GPU.
- En modo CPU (offload parcial o completo) funciona en cualquier x86-64, con degradación significativa de velocidad respecto a GPU.
- Despliegue: exclusivamente con los runtimes precompilados de IsValorum/llama.cpp-clover-moe (Linux x86_64 CPU y CUDA 12; Windows x86_64 universal con CUDA 12.8, Vulkan y CPU) o compilando desde la rama parcheada de llama.cpp (PR #31306). No funciona con llama.cpp vanilla, Ollama, vLLM ni TGI.
- Requisitos de sistema: los binarios Linux requieren GLIBC 2.38 o superior (Ubuntu 24.04 o equivalente). No cubiertos: macOS, ARM64, ROCm y Blackwell en Linux.
- Ejemplo de ejecución: `llama-cli -m Clover-35B-A3B-Preview-BF16.gguf -ngl 99 -fa on -c 4096 -p "Hello"` (con `LD_LIBRARY_PATH` apuntando a los binarios parcheados).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview (este) | ~34,7 B | ~3 B (no confirmado) | no disponible | Apache 2.0 | GGUF BF16, requiere runtime parcheado |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 32k (128k con YaRN) | Apache 2.0 | Amplio soporte (llama.cpp, vLLM, Ollama) |
| Qwen3-30B-A3B-Instruct-2507 | 30,5 B | 3,3 B | 256k | Apache 2.0 | Amplio soporte upstream |

Clover compite en la misma categoría de MoE con ~3 B de parámetros activos que la familia Qwen3-30B-A3B. La principal diferencia práctica es la madurez del ecosistema: Qwen3 cuenta con soporte nativo en todos los runtimes principales, mientras que Clover requiere builds parcheados y está en fase Preview. No se dispone de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- El archivo GGUF no carga en llama.cpp vanilla: es imprescindible usar los runtimes precompilados de IsValorum o compilar desde la rama parcheada (PR #31306).
- Plataformas sin cobertura en los builds precompilados: macOS, ARM64, ROCm y GPUs Blackwell en Linux; en estos casos hay que compilar manualmente.
- Los binarios Linux exigen GLIBC 2.38+, lo que excluye distribuciones como Ubuntu 22.04.
- No hay información publicada sobre sesgos, riesgos de alucinación, idiomas soportados ni longitud de contexto real del modelo.
- Al tratarse de un modelo "Preview", su calidad y estabilidad pueden cambiar entre revisiones; la conversión está anclada a la revisión `4b0402b65e523d0183a14c431955438714cb16ff`.
- Sin benchmarks públicos, no es posible verificar su rendimiento frente a alternativas establecidas antes de la evaluación propia.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero conviene verificar la licencia del modelo base en el repositorio de Diffuspace.
- La ausencia de soporte en Ollama, vLLM, TGI y otros servidores de inferencia limita las opciones de despliegue en producción.

## Enlaces

- Repositorio del GGUF: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-BF16-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Runtimes parcheados de llama.cpp: https://huggingface.co/IsValorum/llama.cpp-clover-moe
- Autor (IsValorum) en Hugging Face: https://huggingface.co/IsValorum
- PR de soporte en llama.cpp: PR #31306 (commit `4838ffb0c8ade92f34d9157deea38d92758ab824`)
