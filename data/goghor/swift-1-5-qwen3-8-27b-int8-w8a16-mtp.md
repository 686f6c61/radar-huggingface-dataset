# Goghor/Swift-1.5-Qwen3.8-27B-INT8-W8A16-MTP

## Resumen

Swift-1.5-Qwen3.8-27B-INT8-W8A16-MTP es una cuantización numérica en INT8 del modelo Swift-1.5-Qwen3.8-27b de UkisAI, que a su vez deriva de Qwen3.8-27B. No es un fine-tune: el publicador (Goghor) solo recomprime los pesos del checkpoint original con el objetivo de hacerlo ejecutable en GPUs Ampere, donde los tensor cores no ejecutan FP8 de forma nativa. El resultado es un checkpoint de 27.781.427.952 parámetros (27,78 B) en formato `compressed-tensors` W8A16, con pesos INT8 y activaciones FP16/BF16, pensado para vLLM.

La relevancia práctica está en el perfil de despliegue: el autor valida el modelo en 2×RTX 3090 de 24 GB con tensor parallelism 2, ocupando 14,85 GiB por GPU y dejando una piscina KV compartida de 266.537 tokens. Conserva la torre de visión, los controles de *thinking*, el contexto nativo de 262.144 tokens y una cabeza MTP en BF16 que habilita decodificación especulativa con tres tokens borrador.

Frente a la cuantización FP8 oficial de Qwen, esta build reporta menor deriva de pesos (KLD medio de 0,000894 frente a 0,004396) y mayor acuerdo top-1 (99,36 % frente a 98,53 %) en 4.563 posiciones evaluadas con *teacher forcing*. Es, por tanto, una opción de despliegue para quienes necesitan un modelo multimodal de ~28 B con contexto muy largo sobre hardware consumer de gama alta, no una mejora del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.8 con torre de visión y cabezas MTP; el checkpoint preserva "compuertas GDN recurrentes", lo que apunta a capas de atención lineal híbrida (dato inferido, la model card no detalla el esquema de capas) |
| Parametros totales | 27.781.427.952 (27,78 B), según safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensión documentada por Qwen a 1.000.000 tokens con YaRN estático, no validada en este despliegue |
| Tipos de cuantizacion | W8A16: pesos INT8 simétricos RTN data-free, group size 128; activaciones FP16/BF16; caché KV en FP8 E4M3; torre de visión, `lm_head`, MTP y compuertas GDN preservados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato de runtime `compressed-tensors` / `pack-quantized`; despacho a `MarlinLinearKernel` vía `CompressedTensorsWNA16` |
| Tamano del repositorio | 31,6 GB (29,44 GiB) |
| Modelo base | ukisai/Swift-Qwen3.8-27b (derivado de Qwen/Qwen3.8-27B) |
| Libreria / runtime | vLLM |

## Arquitectura y entrenamiento

La model card de esta cuantización no describe la arquitectura interna ni el proceso de entrenamiento; remite explícitamente a la model card de Qwen3.8-27B para arquitectura, capacidades y evaluaciones. Lo que sí documenta el checkpoint es qué componentes se han preservado en BF16 durante la compresión: la torre de visión, el `lm_head`, la cabeza MTP y las compuertas GDN recurrentes. La mención a compuertas GDN (Gated DeltaNet) y a estado recurrente indica un diseño híbrido de atención lineal y atención completa, habitual en la familia Qwen3.x, pero el número de capas, la proporción de capas lineales y la configuración de atención no están disponibles en la información proporcionada.

El modelo base, Swift-1.5 de UkisAI, es un derivado de Qwen3.8-27B orientado a eficiencia de razonamiento: según el autor del derivado, consume un 58,5 % menos de *thinking tokens* manteniendo una puntuación un 0,35 % superior a la del modelo base, lo que se traduce en una aceleración de 1,95× en varias tareas. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en ninguna de las dos etapas (base y derivado).

La innovación técnica propia de esta publicación es la cuantización: RTN simétrico data-free con group size 128, sin calibración, más decodificación especulativa mediante una cabeza MTP en BF16 que comparte embeddings y `lm_head` con el modelo objetivo y que se detecta en tiempo de ejecución. El servidor valida el uso de tres tokens borrador y una caché KV en FP8 E4M3 con `max_model_len=262144` sobre dos RTX 3090.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* configurable, heredado de Qwen3.8 y conservado en el checkpoint.
- Procesamiento de imagen y texto (`image-text-to-text`): la torre de visión se mantiene en BF16, por lo que las capacidades multimodales no se degradan por la cuantización de los pesos del decodificador.
- Generación de código y tareas agénticas: el derivado Swift 1.5 se posiciona explícitamente en coding y flujos de agentes según UkisAI y Featherless.
- Contexto largo nativo de 262.144 tokens, suficiente para ingesta de repositorios, documentos extensos o transcripciones completas en una sola petición.
- Decodificación especulativa con MTP (tres tokens borrador) para reducir la latencia de decodificación en vLLM.
- Razonamiento eficiente: el modelo base declara un 58,5 % menos de tokens de pensamiento con rendimiento equivalente o ligeramente superior.
- Soporte de tool calling / function calling: no verificado en la información disponible para esta cuantización; la model card advierte que el cumplimiento de esquemas JSON y el uso de herramientas requieren evaluación conductual separada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Atención al cliente con historial largo**: con 262.144 tokens de contexto nativo se puede mantener una conversación multi-turno que incluya todo el histórico de tickets, manuales de producto y políticas internas sin recuperación externa, evitando pérdidas de información por truncado.
- **Análisis de documentación técnica y contratos**: ingestión de manuales, normativa o expedientes completos en una sola petición; el perfil medido muestra 1.203 tok/s de prefill a 128.000 tokens de entrada, con TTFT de unos 106 s, adecuado para procesos por lotes más que para interacción en tiempo real a esa longitud.
- **Asistente de código en pipelines de CI/CD**: el derivado base está orientado a coding y agentes; con tool calling (pendiente de validación conductual) podría integrarse en revisión de PRs, generación de tests o triaje de fallos, con decodificación a 40-70 tok/s por petición en el perfil de doble RTX 3090.
- **Procesamiento multimodal de documentos escaneados**: al conservar la torre de visión en BF16, el modelo puede extraer y razonar sobre capturas, diagramas y páginas escaneadas combinadas con texto largo en la misma ventana.
- **Agentes de investigación con razonamiento acotado**: el modo *thinking* reducido del derivado Swift 1.5 baja el coste por tarea en bucles agénticos de varios pasos, donde el ahorro de tokens de pensamiento se multiplica por iteración.
- **Despliegue on-premise con hardware de segunda mano**: dos RTX 3090 sin NVLink ni P2P son suficientes para servir el modelo a contexto completo, lo que permite ofertas con requisitos de soberanía de datos sin recurrir a A100/H100.
- **Generación de informes largos**: ventanas de salida de 1.024 tokens medidas a 58-70 tok/s permiten redactar secciones extensas manteniendo coherencia con un contexto de entrada de decenas de miles de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta cuantización en la información disponible. El autor de Swift 1.5 declara una puntuación un 0,35 % superior a la del modelo base con un 58,5 % menos de tokens de pensamiento y una aceleración de 1,95×, pero sin desglose numérico por benchmark.

Fidelidad de cuantización (deriva de pesos sobre 4.563 posiciones con *teacher forcing*):

| Candidato | KLD medio vs BF16 | Acuerdo top-1 | Tamano de pesos |
|---|---:|---:|---:|
| FP8 oficial de Qwen / BF16 A16 | 0,004396 | 98,53 % | 28,75 GiB |
| Esta build W8 / BF16 A16 | 0,000894 | 99,36 % | 29,44 GiB |

Capacidad y memoria en el perfil validado (2×RTX 3090 24 GB, TP2):

| Metrica | Resultado |
|---|---:|
| Tamano del checkpoint | 31,6 GB / 29,44 GiB |
| Memoria cargada por GPU | 14,85 GiB |
| Piscina KV compartida | 266.537 tokens |
| Longitud maxima nativa por peticion | 262.144 tokens |
| Capacidad simultanea a contexto nativo completo | 1,02× |
| Reparto KV ilustrativo a cuatro peticiones | ~66.634 tokens por peticion |

Rendimiento de servicio medido el 2026-08-15 con llama-benchy 0.4.0 contra el endpoint compatible con OpenAI de vLLM (una petición concurrente, longitudes exactas, caché de prefijo fría):

| Tokens de prompt | Tokens generados | Prefill tok/s | Generacion tok/s | TTFT |
|---:|---:|---:|---:|---:|
| 1.024 | 512 | 1.675 | 65,6 | 0,8 s |
| 1.024 | 1.024 | 1.633 | 58,0 | 0,8 s |
| 8.192 | 512 | 1.747 | 42,3 | 4,9 s |
| 8.192 | 1.024 | 1.683 | 51,2 | 5,1 s |
| 32.000 | 512 | 1.560 | 44,1 | 20,7 s |
| 32.000 | 1.024 | 1.557 | 49,7 | 20,7 s |
| 64.000 | 512 | 1.414 | 64,5 | 45,5 s |
| 64.000 | 1.024 | 1.411 | 60,8 | 45,6 s |
| 128.000 | 512 | 1.203 | 64,5 | 106,6 s |
| 128.000 | 1.024 | 1.204 | 69,8 | 106,5 s |

No hay datos publicados de throughput multi-stream: el autor indica que las peticiones concurrentes pueden tumbar el motor de forma intermitente con la versión de vLLM fijada, y que añadirá pruebas en paralelo cuando esté disponible una release que incluya vllm#50021.

## Requisitos de hardware

- **VRAM estimada**: 14,85 GiB por GPU con TP2 en el perfil validado, sobre un checkpoint de 31,6 GB. En una sola GPU el peso de los parámetros ronda los 29,44 GiB, por lo que no cabe en una tarjeta de 24 GB.
- **Perfil mínimo validado**: 2×RTX 3090 de 24 GB, PCIe sin NVLink ni P2P, vLLM con TP2, activaciones BF16, caché KV FP8 E4M3, MTP con tres tokens borrador y `--max-num-batched-tokens 8192`.
- **GPU recomendadas**: RTX 3090 y A6000 (Ampere, sm_86) son el objetivo declarado, al carecer de ejecución FP8 nativa en tensor cores. En H100/H200 o Ada Lovelace tiene más sentido la ruta FP8 oficial de Qwen, que ocupa 28,75 GiB y está pensada para ese hardware.
- **¿Cabe en GPU consumer?**: sí, en dos RTX 3090 (o equivalentes de 24 GB). No cabe en una única consumer de 24 GB ni en tarjetas de 16 GB.
- **Opciones de despliegue**: vLLM es el único runtime soportado por el formato `compressed-tensors` de este checkpoint; requiere el kernel Marlin (`CompressedTensorsWNA16`). No se documenta soporte para llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: prefill de 1.203-1.747 tok/s y decodificación de 42,3-69,8 tok/s por petición según longitud de prompt y de salida; TTFT de 0,8 s a 1.024 tokens de entrada y de 106,5 s a 128.000 tokens. El throughput de decodificación depende de la aceptación de borradores del MTP, que varía con el prompt.
- **Capacidad de contexto en la práctica**: la piscina KV de 266.537 tokens implica que solo cabe una petición a contexto nativo completo; con cuatro peticiones simultáneas el reparto ilustrativo baja a ~66.634 tokens por petición. `--max-num-seqs` limita secuencias activas, no garantiza contextos completos por secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / memoria | Licencia | Notas |
|---|---|---|---|---|---|
| Esta build (Goghor, INT8 W8A16 MTP) | 27,78 B | 262.144 nativo | INT8 W8A16, 29,44 GiB, vLLM | Apache 2.0 | KLD 0,000894; 99,36 % top-1; orientada a Ampere |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 27,78 B (misma base) | 262.144 nativo | FP8, 28,75 GiB | Apache 2.0 | KLD 0,004396; 98,53 % top-1; requiere soporte FP8 nativo |
| ukisai/Swift-Qwen3.8-27b (modelo base de esta build) | 27,78 B | 262.144 nativo | BF16 (no cuantizado) | Apache 2.0 | 58,3 % menos tokens de pensamiento, <1 % de pérdida, 1,95× de aceleración |
| Goghor/Swift-1.5-Qwen3.8-27B-INT8-W8A16-AutoRound-MTP | 27,78 B | 262.144 nativo | INT8 W8A16 AutoRound, vLLM | Apache 2.0 | Variante alternativa del mismo autor con calibración AutoRound en lugar de RTN |

La comparación de rendimiento frente a modelos de otros fabricantes y mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Concurrencia inestable**: el autor advierte de que las peticiones concurrentes pueden tumbar el motor de forma intermitente con la versión de vLLM fijada; no hay datos de throughput multi-stream y el uso en producción con varias secuencias simultáneas requiere validación propia.
- **La métrica de fidelidad no es calidad funcional**: el KLD de 0,000894 mide deriva de pesos, no rendimiento. Uso de herramientas, cumplimiento de esquemas JSON, coding, calidad multimodal y recuperación en contexto largo necesitan evaluación conductual independiente, que no está publicada.
- **Contexto de 1M no soportado en este despliegue**: aunque Qwen documenta extensión a 1.000.000 de tokens con YaRN estático, la piscina KV de 266.537 tokens no puede alojar una petición de esa longitud. El autor marca esa ruta como no validada.
- **Solo vLLM**: el formato `compressed-tensors` con kernel Marlin limita el despliegue a vLLM; no hay soporte documentado en llama.cpp, Ollama o TGI, lo que reduce las opciones de portabilidad.
- **Riesgo de alucinación**: no se han publicado evaluaciones de factualidad ni de tasa de alucinación para esta cuantización; aplican los riesgos habituales de un modelo de 27 B en tareas de conocimiento factual sin recuperación.
- **Sesgos**: no disponible. No hay información sobre evaluación de sesgos en la model card ni en las fuentes consultadas.
- **Idiomas**: no disponible. La lista de idiomas soportados no aparece en la información proporcionada, por lo que no se puede garantizar calidad multilingüe más allá del inglés y el chino habituales en la familia Qwen.
- **Licencia**: Apache 2.0 en el checkpoint de cuantización, lo que permite uso comercial; conviene verificar igualmente la licencia del modelo base de UkisAI y de Qwen3.8-27B, ya que esta build solo cubre la capa de compresión numérica.
- **Precisión mixta**: la torre de visión, el `lm_head`, el MTP y las compuertas GDN permanecen en BF16, de modo que el ahorro de memoria es menor que el de una cuantización integral y el pico de VRAM depende de la carga de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Goghor/Swift-1.5-Qwen3.8-27B-INT8-W8A16-MTP
- Variante AutoRound del mismo autor: https://huggingface.co/Goghor/Swift-1.5-Qwen3.8-27B-INT8-W8A16-AutoRound-MTP
- Modelo base de la cuantización (UkisAI): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- FP8 oficial de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Documentación de contexto largo y YaRN de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B#processing-ultra-long-texts
- Página de UkisAI sobre Swift 1.5: https://ukisai.com/swift-1-5-27b
- Página de producto de Swift: https://ukisai.com/products/swift
- Ficha en Featherless: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Pull request de vLLM sobre concurrencia: https://github.com/vllm-project/vllm/pull/50021
- Herramienta de benchmark llama-benchy: https://pypi.org/project/llama-benchy/
