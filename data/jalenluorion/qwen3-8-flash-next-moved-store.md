# jalenluorion/Qwen3.8-Flash-Next-moved-store

## Resumen

Qwen3.8-Flash-Next-moved-store es una repackaging del modelo Qwen3.8-Flash-Next de Qwen (Alibaba) realizada por el desarrollador independiente jalenluorion. El repositorio redistribuye el modelo original de 180.000 millones de parámetros en un formato que permite ejecutarlo en un MacBook con 16 GB de memoria unificada, manteniendo solo unos 9 GB en RAM y dejando el resto (112 GiB de expertos y memoria n-gram) en el SSD. Se trata, por tanto, de una conversión orientada al despliegue en Apple Silicon mediante MLX, no de un modelo nuevo entrenado desde cero.

La arquitectura del modelo base es un transformer de tipo mixture-of-experts (MoE) con capas de atención híbridas: 36 capas Gated DeltaNet y 12 capas de atención dispersa. El modelo activa 10 de 512 expertos en cada una de las 48 capas, lo que resulta en 1,27 GB de lecturas de expertos por token antes de reutilización. La innovación clave de esta conversión es el uso de routers "lag-4": pequeños routers entrenados por capa que predicen, basándose en el estado oculto de cuatro capas anteriores, qué expertos necesitará la capa actual, permitiendo leerlos del SSD mientras se computan las capas intermedias.

El interés actual de esta ficha reside en que demuestra una técnica viable de offloading de expertos MoE a almacenamiento secundario con prefetch predictivo, logrando 5,7 tokens/s en un benchmark y 4,6 tokens/s en una sesión de agente bajo OpenCode. Es relevante para desarrolladores que quieran estudiar patrones de despliegue de modelos de gran tamaño en hardware de consumo, aunque con caveats importantes sobre fidelidad de salida y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 36 capas Gated DeltaNet + 12 capas de atención dispersa, 48 capas totales |
| Parametros totales | 180B (4,9B residentes + 576M routers lag-4 + 120,8B expertos enrutados + 51,2B memoria n-gram) |
| Parametros activos | 10 de 512 expertos por capa en 48 capas (no se especifica el total de parámetros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 4-bit (escala fp16 + bias por grupo de 64); memoria n-gram a 8-bit (int8 con escala fp16); pesos residentes a 8-bit en Mac de 16 GB; routers lag-4 a fp16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (resident.safetensors, bf16), .npz (routers_k4.npz), .bin (store/layer_XX.bin, ngram/part_PP.bin) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con una combinación híbrida de capas: 36 capas Gated DeltaNet (atención lineal con estado recurrente) y 12 capas de atención dispersa. Cada capa dispone de 512 expertos enrutados, de los cuales se activan 10 por token. Adicionalmente, el modelo incorpora una memoria n-gram de 51,2B parámetros que funciona como tabla hash: un token consulta 16 filas cuyas direcciones dependen únicamente de los ids de tokens previos. Los pesos liberados están congelados y cuantizados; la única parte entrenada en esta conversión son los routers lag-4, entrenados sobre 20,5M tokens de wikitext-103, FineWeb-Edu y UltraChat para imitar los routers originales con el modelo congelado.

La innovación técnica principal es el mecanismo de prefetch a cuatro capas de distancia. En el modelo original, el router de cada capa selecciona expertos a partir del estado oculto de esa misma capa, lo que obliga a tener todos los expertos en memoria. En esta conversión, un router pequeño por capa lee el estado del token cuatro capas antes y nombra los expertos que esa capa necesitará; esos expertos se leen del SSD mientras las cuatro capas intermedias computan. El router original sigue tomando su decisión habitual entre los expertos que ya han llegado. Existen dos modos: prefetch (por defecto, sin lecturas durante el cómputo de la capa propia, con posibles cambios menores en la salida) y exacto (`--mode exact`), que respeta siempre la elección del router original y lee lo que falte cuando se necesita. Los routers lag-4 se entrenaron sobre 20,5M tokens y la cabeza de predicción multi-token y la torre de visión del release original no están incluidas.

## Capacidades

- Generación de texto conversacional: el modelo base es un LLM de propósito general; esta conversión mantiene las capas de atención, expertos compartidos, normas, embeddings y cabeza de salida.
- Razonamiento y conocimiento general: heredado del modelo base Qwen3.8-Flash-Next, sujeto a la fidelidad de la cuantización y del prefetch.
- Memoria n-gram de largo alcance: 51,2B parámetros en forma de tabla hash consultada por token, orientada a capturar dependencias léxicas y de secuencia.
- Tool calling y function calling: no medido explícitamente en esta conversión; la model card indica que trazas de pensamiento, código, tool calls y benchmarks de tarea no han sido evaluados.
- Soporte de agentes y multi-step reasoning: el autor reporta 4,6 tokens/s en una sesión de agente bajo OpenCode, lo que evidencia viabilidad operativa, aunque sin métricas de calidad de tarea.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible (no se menciona en la información proporcionada).
- Visión: no incluida; la torre de visión del release original no forma parte de esta conversión.
- Predicción multi-token: no incluida; la cabeza correspondiente del release original no forma parte de esta conversión.

## Casos de uso

- Investigación de técnicas de offloading MoE: el repositorio y el runner MLX permiten reproducir el patrón de prefetch lag-4 y medir el impacto en latencia y calidad; adecuado para experimentos académicos sobre inferencia de modelos grandes en hardware limitado.
- Despliegue de un LLM de 180B en un MacBook de 16 GB: permite ejecutar un modelo de escala de centro de datos en un portátil Apple Silicon con unos 9 GB de RAM y 140 GB de disco libre, con 5,7 tokens/s en benchmark y 4,6 tokens/s en agente.
- Prototipado de agentes locales en Apple Silicon: el demo incluido expone una API compatible con OpenAI que puede conectarse a OpenCode, útil para probar flujos de agente sin depender de servicios en nube.
- Evaluación comparativa de modos prefetch vs. exacto: permite medir la diferencia de calidad (gap de loss de +0,011/+0,011/+0,019 nats por la elección temprana sola) y decidir cuándo sacrificar fidelidad por velocidad.
- Estudio de cuantización mixta 4-bit/8-bit en MoE: los datos de rounding (9,2-9,6% RMS relativo por elemento en expertos a 4-bit) sirven para analizar el impacto de la cuantización en modelos con muchos expertos.
- Base para conversiones similares: el mismo pipeline se aplica a Qwen3-Next-80B-A3B, Qwen3-Coder-Next y Qwen3-30B-A3B, por lo que este repositorio sirve como referencia para replicar la técnica en otros modelos Qwen.
- Docencia y demostraciones de arquitecturas híbridas: útil para ilustrar en clase cómo se combinan Gated DeltaNet, atención dispersa, MoE y memoria n-gram en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica explícitamente que trazas de pensamiento, código, tool calls y benchmarks de tarea no han sido medidos. Los únicos datos de rendimiento publicados son de velocidad y de calidad relativa (loss gap):

| Metrica | Valor |
|---|---|
| Throughput en benchmark | 5,7 tokens/s |
| Throughput en sesión de agente (OpenCode) | 4,6 tokens/s |
| Memoria en RAM (Mac 16 GB) | ~9 GB |
| Memoria en disco (expertos + n-gram) | 112 GiB (63,4 GiB expertos + 48,3 GiB n-gram) |
| Lecturas de expertos por token | 1,27 GB antes de reutilización |
| Gap de loss vs. bf16 original (wikitext-103 / FineWeb-Edu / UltraChat) | +0,027 / +0,019 / -0,008 nats (configuración en Mac) |
| Gap por elección temprana sola | +0,011 / +0,011 / +0,019 nats |
| Ruido por ventana (chat) | mediana +0,016, desviación estándar 0,133 sobre 128 ventanas |
| Rounding RMS relativo expertos 4-bit | 9,2-9,6% por elemento |

## Requisitos de hardware

- VRAM/RAM estimada: unos 9 GB de memoria unificada en Mac de 16 GB (4,3 GiB de pesos residentes cuantizados y cacheados en el primer load, más 1,1 GB de routers lag-4 a fp16, más slots de expertos en memoria).
- Disco: aproximadamente 140 GB libres (la descarga es de 123 GiB y el primer run escribe una caché de 4,3 GiB).
- GPU recomendadas: Apple Silicon con 16 GB o más de memoria unificada. No se proporcionan recomendaciones para GPU NVIDIA (A100, H100, RTX 4090) en la información disponible.
- ¿Cabe en GPU de consumo? La conversión está diseñada específicamente para Apple Silicon; no se documenta compatibilidad con GPU de consumo NVIDIA.
- Opciones de despliegue: MLX mediante `mlx_run.py` (chat, prompt único, benchmark), demo con API compatible OpenAI (`demo/demo.sh`) para OpenCode, y el engine C++ `dmeng` del mismo repositorio para otros modelos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5,7 tokens/s en benchmark y 4,6 tokens/s en agente bajo OpenCode en un Mac de 16 GB. No se proporcionan datos de latencia por token ni de throughput en otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-moved-store (esta ficha) | 180B (4,9B residentes + 120,8B expertos + 51,2B n-gram) | no disponible | 5,7 tok/s benchmark, 4,6 tok/s agente en Mac 16 GB | qwen-community-1.0 | Hugging Face, MLX, Apple Silicon |
| Qwen3-Next-80B-A3B-moved-store | 80B (A3B activos) | no disponible | no disponible | qwen-community-1.0 (presumible, no confirmado) | Hugging Face, misma técnica |
| Qwen3-Coder-Next-moved-store | no disponible | no disponible | no disponible | no disponible | Hugging Face, misma técnica |
| Qwen3-30B-A3B-moved-store | 30B (A3B activos) | no disponible | no disponible | no disponible | Hugging Face, misma técnica |

Las alternativas listadas son conversiones del mismo autor con la misma técnica de offloading; no se dispone de datos de benchmarks comparativos entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Fidelidad de salida reducida: en modo prefetch (por defecto), si los routers lag-4 nombran un experto equivocado, el router original elige entre lo que hay en memoria, alterando ligeramente la salida. El gap de loss es de +0,027/+0,019/-0,008 nats en la configuración de Mac.
- Calidad no medida en tareas clave: trazas de pensamiento, código, tool calls y benchmarks de tarea no han sido evaluados; no hay garantía de rendimiento en esos dominios.
- El conjunto de chat sale por debajo del modelo original tras la cuantización (-0,037 nats), algo que el autor declara no explicar y no interpretar como ganancia.
- Ruido por ventana elevado en chat: mediana +0,016 y desviación estándar 0,133 sobre 128 ventanas, lo que implica variabilidad considerable por ventana.
- Componentes eliminados: la cabeza de predicción multi-token y la torre de visión del release original no están incluidas, por lo que no hay capacidades multimodales ni de predicción multi-token.
- Cuantización agresiva: expertos a 4-bit con rounding RMS relativo de 9,2-9,6% por elemento; memoria n-gram a 8-bit.
- Requisito de hardware específico: diseñado para Apple Silicon con 16 GB o más; no se documenta soporte para GPU NVIDIA ni para otros backends.
- Consumo de disco elevado: aproximadamente 140 GB libres necesarios, con 123 GiB de descarga.
- Presión de memoria: en un Mac de 16 GB, el modelo ocupa unos 9 GB y macOS puede empezar a comprimir memoria si el resto del sistema demanda más de lo disponible; se recomienda cerrar otras aplicaciones.
- Licencia: Qwen Community License 1.0, con posibles restricciones para uso comercial que deben consultarse en el enlace LICENSE del repositorio.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe.
- Longitud de contexto no disponible: no se especifica la ventana de contexto del modelo base ni de esta conversión.
- Repositorio de terceros: se trata de una conversión no oficial de un desarrollador independiente, no del equipo de Qwen; la responsabilidad de validación recae en quien la despliega.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones específicas de factualidad en esta conversión.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/jalenluorion/Qwen3.8-Flash-Next-moved-store
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de código, runner y demo: https://github.com/jalenluorion/prefetchable-store (carpeta `reference/flash`)
- Conversión Qwen3-Next-80B-A3B: https://huggingface.co/jalenluorion/Qwen3-Next-80B-A3B-moved-store
- Conversión Qwen3-Coder-Next: https://huggingface.co/jalenluorion/Qwen3-Coder-Next-moved-store
- Conversión Qwen3-30B-A3B: https://huggingface.co/jalenluorion/Qwen3-30B-A3B-moved-store
- Conversión Qwen3.6-35B-A3B: https://huggingface.co/jalenluorion/Qwen3.6-35B-A3B-prefetchable-store
- Conversión Inkling 2 Mini: https://huggingface.co/jalenluorion/Inkling-2-Mini-prefetchable-store
- Licencia: LICENSE en el repositorio de Hugging Face
