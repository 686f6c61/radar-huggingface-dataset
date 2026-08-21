# jlebthedude/n64dllm-v1

## Resumen

n64dllm-v1 es un ajuste fino basado en LoRA del modelo Qwen3-Coder-30B-A3B-Instruct, desarrollado por jlebthedude, especializado en decompilación de juegos de Nintendo 64. El modelo recibe ensamblador MIPS generado por el compilador SGI IDO 5.3/7.1 y produce código C que, al recompilarse con el compilador original, genera un binario byte-idéntico al ROM original. Este proceso, conocido como "matching decompilation", es una práctica comunitaria para preservación e interoperabilidad de software retro.

El modelo se entrenó con aproximadamente 74.000 pares de datos extraídos de 11 proyectos comunitarios de decompilación, y cada par fue verificado recompilando el código C con el compilador original y comparando byte a byte contra el ROM. El resultado es una mejora significativa en precisión: alcanza un 18,3% de coincidencia exacta en el primer intento (exact match @1) en juegos no vistos durante el entrenamiento, frente al 6,7% del modelo base sin ajustar. La arquitectura MoE del base (30.5B parámetros totales, 3.3B activos) permite una inferencia rápida, con aproximadamente 90 tokens por segundo en un Apple M4 Max.

El repositorio incluye un archivo GGUF cuantizado Q4_K_M listo para usar con llama.cpp, LM Studio o cualquier runtime compatible, además del adaptador LoRA (rank 64, proyecciones de atención) para continuar el entrenamiento. La licencia es Apache-2.0, lo que permite uso comercial con restricciones sobre el contenido decompilado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con atención proyectada por LoRA |
| Parametros totales | 30.532.122.624 (30.5B) |
| Parametros activos | 3.3B (MoE) |
| Longitud de contexto | 16.384 tokens (según comando de ejemplo; el base soporta más, no confirmado) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Inglés (entrenamiento específico), aunque el base es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M), safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-Coder-30B-A3B-Instruct, un transformer con arquitectura de mezcla de expertos (MoE) que activa solo 3.3B de sus 30.5B parámetros por token. Sobre este base se aplicó un ajuste fino mediante LoRA de rango 64, restringido a las proyecciones de atención. Esta elección preserva las capacidades generales de código del modelo base mientras se especializa en la tarea de decompilación.

El entrenamiento utilizó aproximadamente 74.000 ejemplos extraídos de 11 proyectos comunitarios de decompilación de N64. Cada ejemplo consiste en un fragmento de ensamblador MIPS (con la declaración de prototipo de la función) y el código C correspondiente que recompila byte-idénticamente bajo el compilador IDO 5.3/7.1. Todos los pares fueron verificados mediante recompilación y comparación byte a byte contra el ROM original, sin usar métricas de similitud. El modelo se evaluó con el mismo criterio: recompilación byte-exacta como juez.

## Capacidades

- Decompilación de ensamblador MIPS a C que recompila byte-idénticamente con compiladores SGI IDO 5.3/7.1.
- Generación de código C de alta calidad para ingeniería inversa de juegos N64.
- Mantiene las capacidades generales de generación de código del modelo base Qwen3-Coder (razonamiento, programación, etc.).
- Soporte de tool calling y function calling, útil para integración en agentes.
- Capacidad de razonamiento multi-paso, aunque la tarea principal es de traducción directa.
- Multilingüe en el base, pero el ajuste fino se centra en inglés (los prompts y datos son en inglés).

## Casos de uso

- Decompilación de juegos N64 para preservación: el modelo puede convertir funciones individuales de ensamblador a C, permitiendo reconstruir el código fuente original de juegos como Pokémon Snap o Mischief Makers, facilitando su mantenimiento y portabilidad.
- Asistencia en proyectos de decompilación comunitaria: integrado en un harness de agente con el compilador en el bucle, el modelo genera múltiples candidatos, los recompila, compara bytes y retroalimenta los diffs, acelerando el proceso de matching.
- Ingeniería inversa de software retro: útil para analizar binarios MIPS de otras consolas o sistemas embebidos que usen compiladores IDO, aunque el entrenamiento se limita a N64.
- Educación en compilación y ensamblador: los ejemplos generados pueden usarse para enseñar cómo ciertas construcciones de C se traducen a MIPS bajo IDO.
- Generación de código C con verificación automática: en un pipeline de CI/CD, el modelo puede proponer implementaciones en C y un script verifica la coincidencia byte-exacta, descartando las incorrectas.
- Investigación en decompilación automática: como punto de partida para experimentos con otros compiladores o arquitecturas, dado que el adaptador LoRA es extensible.

## Benchmarks y rendimiento

La model card reporta resultados sobre juegos no vistos durante el entrenamiento (Pokemon Snap, Mischief Makers), con prompts idénticos para todos los modelos y recompilación byte-exacta como juez:

| Modelo | exact match @1 | pass@8 |
|---|---|---|
| Qwen3-Coder-30B-A3B (stock) | 6,7% | no disponible |
| n64dllm-v1 (Q4_K_M) | 18,3% | 20,0% |
| Claude Opus 4.8 | 20,0% | no disponible |

La cuantización Q4_K_M no mostró pérdida de rendimiento frente a bf16 según el autor. El modelo alcanza aproximadamente 90 tokens por segundo en un Apple M4 Max gracias a la arquitectura MoE con 3.3B parámetros activos.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa aproximadamente 18.8 GB (tamaño del repo). Con contexto de 16k, se recomienda al menos 20-24 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100, o Apple Silicon con memoria unificada (M4 Max, M3 Max, etc.).
- En consumer GPU: cabe en RTX 4090 y RTX 3090 (24 GB) con cuantización Q4_K_M. En GPUs de 16 GB (RTX 4080, 3080 Ti) podría funcionar con contexto reducido o mayor cuantización, pero no está garantizado.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, Ollama (si se convierte), vLLM (con soporte GGUF), TGI (con adaptación).
- Latencia y throughput: ~90 tok/s en M4 Max según el autor; en GPUs NVIDIA de gama alta se espera mayor throughput, aunque no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | exact match @1 (N64) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n64dllm-v1 | 30.5B totales, 3.3B activos | 16k (mínimo) | 18,3% | Apache-2.0 | GGUF, LoRA |
| Qwen3-Coder-30B-A3B (stock) | 30.5B totales, 3.3B activos | 32k (base) | 6,7% | Apache-2.0 | Safetensors, GGUF |
| Claude Opus 4.8 | no disponible | no disponible | 20,0% | Propietaria | API |

No se dispone de otros modelos open source especializados en decompilación N64 para comparar. La ventaja de n64dllm-v1 es su licencia abierta y su capacidad de ejecución local con hardware moderado.

## Limitaciones y advertencias

- Las firmas de funciones deben proporcionarse en el prompt; el modelo no las adivina de forma fiable, y los internals de estructuras entre juegos son el principal modo de fallo.
- El entrenamiento cubre ensamblador de hasta ~4.000 tokens; fragmentos más largos pueden degradar la calidad.
- Solo soporta juegos compilados con IDO 5.3/7.1; no cubre títulos que usan compiladores GCC u otros.
- El modelo puede alucinar código C que no recompila correctamente; se recomienda verificación con el compilador original.
- La decompilación de juegos con copyright puede tener implicaciones legales; el autor indica que no es para uso comercial del resultado decompilado.
- Los datos de entrenamiento no se distribuyen, lo que limita la reproducibilidad del ajuste fino.
- El modelo está orientado a inglés; prompts en otros idiomas pueden degradar el rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/jlebthedude/n64dllm-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio del proyecto (mencionado en la model card, no se proporciona URL directa): se indica que incluye un skill file para Codex/OpenCode y un harness de verificación basado en n64-decomp-workbench, pero no se ha encontrado el enlace en la información disponible.
