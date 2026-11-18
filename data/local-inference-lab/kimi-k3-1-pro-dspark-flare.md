# local-inference-lab/kimi-k3.1-pro-dspark-flare

## Resumen

Kimi K3.1-Pro con DSpark para Flare es un checkpoint empaquetado para inferencia nativa con el runtime Flare, derivado del modelo Kimi K3.1-Pro de Moonshot AI y del checkpoint DSpark de Inferact/Red Hat. No es un modelo nuevo entrenado desde cero, sino una exportación optimizada del modelo base que combina decodificación especulativa DSpark (un draft de cinco capas sobre un target de 93 capas) con atención dispersa preparada para prompts largos. El paquete está pensado para servir una única petición concurrente sobre dieciséis GPU RTX PRO 6000 Blackwell de 96 GB, con paralelismo tensorial y de contexto de 16.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue de un modelo propietario de Moonshot AI, con licencia "other" y nombre de licencia kimi-k3.1-pro, publicado por un tercero (local-inference-lab) en un repositorio de 18,8 GB que, según la propia model card, está incompleto mientras se sube el checkpoint completo de 1.477 TB. Las cifras de rendimiento publicadas son medidas nativas del sistema de referencia (TP16/DCP16), no resultados de benchmarks académicos.

El modelo base es un transformer de 93 capas con expertos nativos en MXFP4 y cabezas de vocabulario de verificación en BF16; el draft DSpark añade cinco capas con una anchura de propuesta de siete tokens. La información disponible no detalla el número total de parámetros ni la longitud de contexto nominal del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 93 capas (target) con draft DSpark de 5 capas; expertos nativos MXFP4; atención dispersa para prompts largos |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como especificación nominal; se han medido peticiones de 32.768 tokens y una de 266.240 tokens sin caché |
| Tipos de cuantizacion | MXFP8 online (scope `all`), NVFP4 en la cabeza de vocabulario del draft, FP8 replicado en la cabeza Markov, BF16 en la cabeza de verificación del target, MXFP4 nativo en expertos del target |
| Idiomas soportados | no disponible |
| Licencia | other (license_name: kimi-k3.1-pro), con licencia upstream aplicable al target y al draft |
| Formato de pesos | safetensors (checkpoint raíz firmado; primarios intermedios bajo `rebuild/`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 93 capas (target) combinado con un draft DSpark de cinco capas para decodificación especulativa, con anchura de propuesta de siete tokens. El target incorpora expertos nativos en MXFP4 y una cabeza de verificación de vocabulario en BF16; el draft usa una cabeza de vocabulario NVFP4 y una cabeza Markov FP8 replicada. La exportación selecciona MXFP8 online con scope `all` y utiliza grafos de verificación empaquetados, prefill en trozos de 2.048 tokens y paralelismo tensorial/contexto de 16. El sistema integra transporte PCIe preparado y reducciones residuales de cuatro filas fusionadas en el grafo de verificación del target.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si hubo RLHF o DPO en el modelo base. La model card describe únicamente el proceso de empaquetado y optimización para Flare (Hyperflare y FlashInfer), no el entrenamiento original. Como innovaciones técnicas destacables: decodificación especulativa DSpark con siete tokens de propuesta, atención dispersa con buffers latentes de 144 MiB por capa y trozo, gathers por slice cuando el historial supera 262.144 registros, y selección ordenada de candidatos distribuida entre los 16 rangos (cada rango procesa 8 de las 128 queries de cada slice).

## Capacidades

- Generación de texto y razonamiento: el checkpoint se sirve como modelo de chat vía API compatible con `/v1/chat/completions`.
- Generación de código: la model card reporta throughput de decodificación medido sobre nueve peticiones de programación.
- Procesamiento de prompts largos: se han medido prompts de 32.768 tokens y una petición sin caché de 266.240 tokens.
- Tool calling / function calling: el ejemplo de la model card incluye el parámetro `tool_choice`, lo que indica soporte de la interfaz, aunque no se detalla el comportamiento del modelo.
- Decodificación especulativa: integrada a nivel de runtime con `--mtp-draft-tokens 7`.
- Capacidades multilingües: no disponible.
- Vision, audio o thinking mode: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat de una sola petición concurrente sobre clúster de 16 GPU: el checkpoint está calibrado para `--max-concurrency 1` sobre dieciséis RTX PRO 6000 Blackwell; encaja en entornos de evaluación interna o demostraciones de alto rendimiento por petición, no en servicios multiusuario convencionales.
- Análisis de repositorios y prompts de código largos: con 2.632 tokens/s de prefill en 32K y 130,84 tokens/s de decodificación en tareas de programación, es adecuado para revisión de código o generación asistida sobre contextos extensos.
- Procesamiento de documentos muy largos: la petición de 266.240 tokens sin caché (116,43 s) permite casos de resumen o extracción sobre corpus que exceden ventanas típicas de 128K.
- Evaluación de decodificación especulativa en producción: útil como banco de pruebas para medir la ganancia de DSpark frente al padre PCIe (552,28 frente a 2.632,05 tokens/s de prefill en 32K).
- Investigación en atención dispersa: el checkpoint expone mecanismos de buffers latentes y gathers por slice que permiten estudiar el comportamiento de atención con historiales largos.
- Despliegue on-premise con hardware Blackwell SM120: para organizaciones con clústeres de RTX PRO 6000 que quieran servir un modelo de la familia Kimi sin depender de API externa, sujeto a los términos de la licencia kimi-k3.1-pro.

## Benchmarks y rendimiento

Mediciones nativas publicadas en la model card (una petición activa, TP16/DCP16, GPUs a 600 W, memoria a 16.365 MHz):

| Métrica | Padre PCIe | Este checkpoint |
|---|---:|---:|
| Prefill 32K, mediana de tokens de entrada/s | 552,28 | 2.632,05 |
| Tiempo hasta el primer token en 32K | 59,333 s | 12,450 s |
| Decodificación de código, mediana de tokens de salida/s | 127,77 | 130,84 |
| Tiempo de GPU por ronda especulativa (mediana) | 17,927 ms | 17,902 ms |
| Páginas KV / slots de snapshot | 2.304 / 116 | 2.304 / 116 |

Mediciones adicionales: 2.611 tokens/s de entrada en un prompt de código de 32K reservado; 2.633 tokens/s con `--memory-limit=-0G`; una petición sin caché de 266.240 tokens cruzó el límite del buffer de atención en 116,43 s. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el sistema de referencia emplea dieciséis GPU RTX PRO 6000 Blackwell de 96 GB (1.536 GB totales); el checkpoint completo ocupa 1,477 TB en disco.
- GPU recomendadas: RTX PRO 6000 Blackwell (SM120) con 96 GB; el runtime está preparado para 16 GPU con cuatro switches PCIe físicos y cuatro GPU por switch.
- GPU de consumo: no cabe en GPU de consumo; el despliegue requiere un clúster de 16 GPU de centro de datos.
- Software: Linux x86-64, driver NVIDIA 615.71.10, CUDA 13.2, Git, Cargo/Rust 1.95, toolchain C/C++, CMake, compilador de Protocol Buffers y Hugging Face CLI.
- Despliegue: runtime Flare (rama `kimi-k31-dspark-tp16-prefill32k-runtime-v1`), compilado con Cargo; servidor HTTP en el puerto 8000 con API compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 12,450 s hasta el primer token en 32K; 130,84 tokens/s de decodificación de código; 17,902 ms por ronda especulativa.
- Disco: 1,48 TB para la descarga más espacio para compilar la CLI; se recomienda `ulimit -Sn 65536`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1-Pro DSpark Flare (este) | no disponible | no disponible (medido hasta 266.240 tokens) | 2.632 tokens/s prefill 32K; 130,84 tokens/s decodificación | other (kimi-k3.1-pro) | Hugging Face, subida en curso |
| Kimi K3.1-Pro (Moonshot AI) | no disponible | no disponible | no disponible | kimi-k3.1-pro | Hugging Face (upstream) |
| Kimi K3.1-Pro-DSpark (Inferact/Red Hat) | no disponible | no disponible | no disponible | no disponible | Hugging Face (upstream) |

No se dispone de datos de benchmarks ni de especificaciones de parámetros y contexto de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio incompleto: la model card indica "Upload in progress"; el checkpoint de servicio consta de 1.637 archivos y 1,477 TB, y el repositorio actual ocupa 18,8 GB.
- Licencia restrictiva: licencia "other" con nombre kimi-k3.1-pro; la licencia upstream se aplica al target y al draft. Es necesario revisar `LICENSE` antes de cualquier uso comercial.
- Requisito de confianza: Flare solicita confirmación de confianza en el primer uso; el checkpoint conserva la firma de desarrollo del benchmark, con namespace `local-development` y huella de clave pública `c2e293bde948419d2a3d1d1aca14978185e59fa0f760aef6f3cd54f4416a7784`.
- Concurrencia limitada: el sistema está calibrado para `--max-concurrency 1`; no es adecuado para servir múltiples usuarios simultáneos sin rediseño.
- Dependencia de hardware específico: requiere GPU Blackwell SM120 y el runtime Flare; no hay soporte documentado para otros backends.
- Idiomas: no disponible; no se puede confirmar cobertura multilingüe.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo, robustez o tasa de alucinación en la información disponible.
- Métricas no académicas: las cifras publicadas son mediciones de sistema (throughput, latencia), no resultados de calidad en tareas estándar.
- Verificación de integridad: se recomienda ejecutar `sha256sum -c checksums.sha256 --quiet`; el primario servido tiene SHA-256 `f5ba77f5d9500637163cf301ed085000bbe8415c64f63a86e3597b9b2aa0617a`.

## Enlaces

- Hugging Face: https://huggingface.co/local-inference-lab/kimi-k3.1-pro-dspark-flare
- Modelo base Moonshot AI: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/tree/6d0a0202956796543364d666ab19c6ad1a494ee1
- Checkpoint DSpark de Inferact/Red Hat: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark/tree/e4e6e6261e9f8b6d5f249f9627eb6b109d762d5f
- Runtime Flare: https://github.com/voipmonitor/flare.git (rama `kimi-k31-dspark-tp16-prefill32k-runtime-v1`)
- Mediciones: `benchmarks/c1.json` (en el repositorio)
- Perfil público del publisher: `publisher.json` (en el repositorio)
- Licencia del modelo: `LICENSE` (en el repositorio)
- Avisos de Flare: `licenses/flare/NOTICE` (en el repositorio)
- Avisos de FlashInfer: `licenses/flashinfer/NOTICE` (en el repositorio)
