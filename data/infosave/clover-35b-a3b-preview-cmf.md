# infosave/Clover-35B-A3B-Preview-cmf

## Resumen

Clover-35B-A3B-Preview-cmf es una versión cuantizada, empaquetada en formato CMF, del modelo de lenguaje por difusión Clover-35B-A3B-Preview desarrollado por DiffuSpace. El modelo base se apoya en el backbone Qwen3.6-35B-A3B, una arquitectura mixture-of-experts de 35B parámetros totales con unos 3B activos por token, y genera texto mediante difusión por bloques: escribe la respuesta en bloques de 32 tokens que empiezan como tokens de máscara y se resuelven mediante pasadas de denoising, produciendo varios tokens a la vez. Esto lo convierte en uno de los ejemplos recientes de modelos de difusión de texto aplicados a escala grande.

La versión cuantizada, publicada por el usuario infosave, ofrece el modelo en ficheros CMF de un solo archivo para el motor de inferencia cortiq, escrito en Rust sin dependencias de Python ni de frameworks de ML, con soporte Vulkan, DX12 y Metal. Incluye variantes en 4 bits (con y sin calibración GPTQ) y en 8 bits, lo que permite ejecutar el modelo en GPUs de consumo con 24 GB de VRAM o incluso en Macs con Apple Silicon.

Su relevancia actual radica en la combinación de tres elementos poco habituales juntos: un modelo de difusión por bloques (generación paralela), una arquitectura MoE híbrida con capas Gated DeltaNet (eficiencia en contexto largo) y un despliegue ligero y multiplataforma sin stack de Python. Está pensado para desarrolladores que quieren probar la generación por difusión en hardware local sin montar entornos complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje por difusión por bloques (block diffusion) sobre backbone Qwen3.6-35B-A3B, MoE híbrido (30 capas Gated DeltaNet + 10 capas de atención completa) |
| Parametros totales | 35B |
| Parametros activos | ~3B por token (256 expertos top-8 más un experto compartido) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | 4 bits (q4tp y q4tp-v2 con GPTQ), 8 bits (q8_2f); atención, proyecciones Gated DeltaNet, embeddings y head siempre en 8 bits |
| Idiomas soportados | Inglés (según la model card; no disponible información sobre otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero único para el motor cortiq); el modelo base está en el repositorio DiffuSpace/Clover-35B-A3B-Preview |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes. Primero, el backbone Qwen3.6-35B-A3B es un MoE de 35B parámetros con 256 expertos de los que se activan 8 por token, más un experto compartido, lo que deja unos 3B parámetros activos por token. Segundo, el modelo es híbrido: 30 capas usan Gated DeltaNet (una variante de atención lineal eficiente) y 10 capas usan atención completa, lo que permite soportar 128k tokens de contexto. Tercero, la generación no es autorregresiva clásica: el modelo escribe la respuesta en bloques de 32 tokens que se inicializan como tokens de máscara y se resuelven mediante pasadas repetidas de denoising sobre todo el bloque, generando varios tokens por pasada. En el despliegue por defecto se usa decodificación greedy LowConfidence: tras cada pasada se fijan las filas cuya confianza supera un umbral (0.95 por defecto), de modo que el texto predecible resuelve varios tokens por pasada y la prosa libre aproximadamente uno.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. En cuanto a la cuantización, la variante recomendada `q4tp-v2` calibra los expertos con GPTQ sobre 262k tokens (40 % texto wiki, 40 % chat y 20 % código), manteniendo en 8 bits la atención, las proyecciones Gated DeltaNet, los embeddings y la cabeza de salida. Una técnica destacable del runtime es que, durante la generación, el conjunto de expertos de cada bloque se restringe al subconjunto que concentra el 90 % del routing, lo que reduce la memoria y el cómputo por bloque.

## Capacidades

- Generación de texto general en inglés, con modo de razonamiento opcional: sin `--no-think`, el modelo razona primero dentro de un bloque `<think>` antes de responder.
- Generación de código: la model card muestra ejemplos de código Python y mide velocidades específicas para código (80–95 tok/s en RTX 5090 en 4 bits).
- Contexto largo: ventana de 128k tokens gracias a las capas Gated DeltaNet.
- Generación paralela por bloques: resuelve varios tokens por pasada de denoising, especialmente en texto predecible.
- Servidor compatible con la API de OpenAI: endpoints `/v1/chat/completions` (con y sin streaming), `/v1/completions` y `/v1/models`, más un panel web en el mismo puerto.
- Control de la decodificación: umbral de confianza ajustable (`CMF_CLOVER_THRESHOLD`), tamaño de bloque configurable (8, 16 o 32 tokens), muestreo con temperatura o greedy.
- Soporte multiplataforma: Vulkan/DX12 (NVIDIA, AMD, Intel), Metal (Apple Silicon) y CPU puro.

No hay información disponible sobre tool calling, function calling, capacidades de agentes, visión o audio.

## Casos de uso

- Chatbot local sin stack de Python: con `cortiq serve` se levanta un servidor compatible con la API de OpenAI en el puerto 8080, ideal para integrar el modelo en aplicaciones que ya hablan con APIs tipo OpenAI sin instalar PyTorch ni vLLM.
- Generación de código en estaciones de trabajo con GPU de 24 GB: la variante `q4tp-v2` (19,36 GB) cabe completa en una RTX 5090 de 32 GB y alcanza 80–95 tok/s en código, suficiente para autocompletado y generación de funciones completas de forma interactiva.
- Prototipado de modelos de difusión de texto: al ser un modelo block-diffusion empaquetado en un fichero único con verificación por SHA-256 y comandos de reproducción de la conversión, es útil para investigadores que quieren experimentar con decodificación por difusión y compararla con la autorregresiva.
- Ejecución en Apple Silicon: un Mac con 24 GB de memoria unificada (por ejemplo, Mac mini M4) puede ejecutar las variantes q4tp vía Metal, útil para desarrollo y pruebas portátiles, aunque con throughput bajo (3,2 tok/s en prosa).
- Procesamiento de prompts largos con hardware modesto: en GPUs con menos de 24 GB, cortiq reparte capas entre GPU y CPU (con 16 GB de presupuesto mantiene 30 de 40 capas en GPU), permitiendo trabajar con documentos largos aprovechando el contexto de 128k.
- Generación por lotes de texto predecible: el mecanismo LowConfidence resuelve varios tokens por pasada en texto estructurado o repetitivo (con umbral 0,8 se miden 124–150 tok/s en código en RTX 5090), lo que favorece tareas como rellenar plantillas o generar código boilerplate.
- Despliegue en entornos headless: al no requerir Python ni frameworks de ML, y con binarios precompilados para Linux, macOS y Windows, es adecuado para contenedores ligeros o máquinas sin entorno gráfico (con las librerías Vulkan indicadas en la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se ofrecen métricas propias de calidad de cuantización y de velocidad de generación:

| Métrica | q4tp-v2 (4 bits GPTQ) | q4tp (4 bits) | q8_2f (8 bits) |
|---|---:|---:|---:|
| Tamaño del fichero | 19,36 GB | 19,38 GB | 35,00 GB |
| Perplejidad wiki (ruta causal, wikitext-2) | 16,80 | 18,22 | 15,86 |
| First-pass top-1 (coincidencia con la implementación bf16) | 93/96 | 93/96 | 62/64 |

Throughput tras el prompt con q4tp-v2 y cortiq 0.8.41:

| Hardware | Backend | Por pasada | Prosa | Código |
|---|---|---:|---:|---:|
| RTX 5090 (32 GB) | Vulkan | 34 ms | 26 tok/s | 80–95 tok/s |
| Mac mini M4 (24 GB) | Metal | 0,3–0,5 s | 3,2 tok/s | 6,5–9 tok/s |

Con `CMF_CLOVER_THRESHOLD=0.8`: 25–30 tok/s en prosa y 124–150 tok/s en código en RTX 5090; 3,7 y 9,7 tok/s en el M4. La lectura del prompt ronda los 57 tok/s en un M4.

## Requisitos de hardware

- Variante recomendada q4tp-v2 (19,36 GB): GPU con 24 GB de VRAM o más. En una RTX 5090 de 32 GB el modelo completo y su head ocupan 18,8 GB en la tarjeta.
- Variante q8_2f (35 GB): GPUs con 48 GB o más, o CPUs con mucha memoria.
- GPUs más pequeñas: cortiq ejecuta las primeras capas en GPU y el resto en CPU; con 16 GB de presupuesto se mantienen 30 de las 40 capas en la tarjeta.
- Apple Silicon: los Macs de 24 GB ejecutan las variantes q4tp mediante Metal, con los pesos mapeados desde el fichero y los expertos enlazados según el routing de cada bloque.
- CPU puro: posible con `CMF_GPU=0`, sin datos de rendimiento disponibles.
- GPUs recomendadas: RTX 5090 (referencia de la model card); por tamaño, cualquier GPU de 24 GB (RTX 3090, RTX 4090, RTX 5090) debería alojar la variante 4 bits, aunque solo hay medidas publicadas para la 5090.
- Backend: Vulkan o DX12 en NVIDIA/AMD/Intel; Metal en macOS. En Linux headless instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.
- Despliegue: exclusivamente mediante el motor cortiq (CLI `cortiq run`, servidor `cortiq serve` compatible con OpenAI). No hay soporte publicado para vLLM, llama.cpp, Ollama o TGI; el modo self-speculative de DiffuSpace para SGLang aparece mencionado pero la model card se centra en la decodificación LowConfidence por bloques.
- Latencia: una pasada de denoising tarda 34 ms en RTX 5090 y 0,3–0,5 s en Mac mini M4.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Decodificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Clover-35B-A3B-Preview-cmf | 35B | ~3B | 128k | Difusion por bloques (32 tokens) | Apache 2.0 | Ficheros CMF para cortiq (Linux, macOS, Windows) |
| Qwen3-30B-A3B (referencia de backbone similar) | 30B | ~3B | 128k | Autorregresiva | Apache 2.0 | HF, GGUF, vLLM, llama.cpp, Ollama |
| Qwen3-32B | 32B (denso) | 32B | 128k | Autorregresiva | Apache 2.0 | HF, GGUF, vLLM, llama.cpp, Ollama |

Notas: la comparativa se basa en la familia Qwen3, ya que la model card indica que el backbone es Qwen3.6-35B-A3B. Los datos de Qwen3.6 no están disponibles públicamente en la información proporcionada, por lo que se usan los de la generación Qwen3 documentada. La diferencia clave es el paradigma de generación: Clover genera en paralelo por bloques mediante difusión, mientras que los modelos Qwen3 son autorregresivos; los ecosistemas de despliegue de Qwen3 son mucho más amplios.

## Limitaciones y advertencias

- Idioma: la model card solo declara soporte para inglés; no hay información sobre rendimiento en castellano u otros idiomas.
- Velocidad en texto impredecible: en prosa libre la decodificación LowConfidence resuelve aproximadamente un token por pasada, lo que limita el throughput (26 tok/s en RTX 5090, 3,2 tok/s en M4).
- Modo de razonamiento costoso: sin `--no-think`, el modelo genera primero un bloque `<think>`, por lo que hay que asignar presupuestos de tokens elevados (`--max-tokens` en los miles).
- Cuantización: aunque la variante q4tp-v2 reduce la perplejidad de 18,22 a 16,80 respecto a la conversión directa, sigue habiendo divergencias menores respecto a la implementación bf16 de referencia (3 de 96 filas del primer pase no coinciden exactamente, aunque son casi empates).
- Ecosistema reducido: requiere el motor cortiq (versión 0.8.41 o superior); no funciona con vLLM, llama.cpp, Ollama ni otras herramientas habituales, lo que limita su integración en pipelines existentes.
- Modelo en fase preview: al ser una versión preliminar, el comportamiento y las APIs pueden cambiar.
- Sin datos de entrenamiento ni de benchmarks estándar publicados: no es posible evaluar su calidad relativa frente a modelos autorregresivos equivalentes con la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar también la licencia y los términos del modelo base DiffuSpace/Clover-35B-A3B-Preview.
- Riesgo de alucinación y sesgos: no hay información específica publicada; como en cualquier LLM, deben esperarse errores factuales y sesgos heredados de los datos de entrenamiento.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/infosave/Clover-35B-A3B-Preview-cmf
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Repositorio del formato CMF y del motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
