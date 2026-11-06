# jamest65/AGILLM-4.3-step2975754-safetensors

## Resumen

AGILLM-4.3 step2975754 es un checkpoint de un modelo de lenguaje de 1.726 millones de parámetros (aproximadamente 1,73 mil millones) desarrollado por OpenTransformer / MarxistLeninist. Se distribuye como una copia en formato safetensors del checkpoint original en PyTorch, alojado en el repositorio `MarxistLeninist/AGILLM-4.3-checkpoints` (revisión `708d5119`). La conversión la ha realizado Chronara AI Ltd. con permiso del autor y no modifica ni pesos ni arquitectura, solo el formato de almacenamiento.

La característica más distintiva es su naturaleza **no autorregresiva (NAR)**: la arquitectura `cfg` incorpora un backbone `core` y tres cabezas (`ar`, `sat`, `nat`), con contrato de máscara NAT y modo ALiBi. Esto permite generar tokens mediante pases paralelos (1, 2, 4 u 8 pases) en lugar de la decodificación secuencial token a token, lo que abre la puerta a latencias menores en ciertos regímenes, aunque el propio autor reconoce que, en este checkpoint, la calidad de NAT queda por detrás de la ruta autorregresiva.

El modelo es relevante ahora por dos motivos: por un lado, explora una línea de investigación poco representada en el ecosistema abierto (generación no autorregresiva con múltiples cabezas y máscaras específicas); por otro, su empaquetado en safetensors facilita la inspección y la portabilidad de pesos, aunque su uso práctico exige el entrenador de un solo archivo del autor, ya que no sigue la interfaz estándar de Transformers. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `cfg` (backbone `core` + cabezas `ar`, `sat`, `nat`), no autorregresiva, ALiBi, contrato de máscara NAT |
| Parámetros totales | 1.726.200.042 (≈1,73 B) |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en fp32; contadores en int64) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 669 tensores, fp32 + int64, 6,9 GB) |

## Arquitectura y entrenamiento

La arquitectura, etiquetada como `cfg` en el `config.json`, combina un backbone (`core.`) con tres cabezas diferenciadas: `ar.` (autorregresiva), `sat.` (probablemente "semi-autoregressive" o similar, con modos fijo y variable) y `nat.` (no autorregresiva, con contrato de máscara y número de pases configurable). Emplea posicionamiento ALiBi en lugar de embeddings posicionales aprendidos o RoPE. Un detalle técnico relevante es que `ar.proj.weight` es una copia exacta de `core.emb.weight`, almacenada por separado como en el checkpoint original, lo que sugiere weight tying entre la proyección de la cabeza AR y los embeddings de entrada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La innovación principal declarada es la propia formulación NAR con múltiples cabezas y pases paralelos, junto con la preservación exacta de pesos verificada tensor a tensor (`torch.equal`) y mediante comparación de salidas greedy con la ruta de inferencia del autor.

## Capacidades

- Generación de texto mediante ruta autorregresiva (`ar`), que según el autor ofrece mejor calidad que la ruta NAT en este checkpoint.
- Generación no autorregresiva (`nat`) en 1, 2, 4 u 8 pases, con compromiso entre latencia y calidad.
- Generación con cabeza `sat` en modo fijo y variable.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (visión, audio, modo thinking): no disponibles.
- Razonamiento, código y matemáticas: no documentados; no hay benchmarks publicados.

## Casos de uso

- **Investigación en generación no autorregresiva**: el modelo sirve como banco de pruebas para comparar calidad y latencia entre decodificación AR y NAT con distintos números de pases (1, 2, 4, 8), usando la ruta de inferencia del autor como referencia.
- **Prototipado de decodificación paralela en CPU**: con 1,73 B parámetros en fp32 y throughput medido de hasta 236 tok/s en NAT de 1 pase sobre M3 Ultra a 4 hilos, es viable experimentar con generación paralela en hardware sin GPU dedicada.
- **Reproducción de experimentos académicos**: al incluir `provenance.json` y scripts de conversión (`tools/convert.py`, `tools/gen_from_safetensors.py`), permite replicar resultados y auditar la integridad de pesos (sha256 publicado).
- **Auditoría de checkpoints y formatos**: útil como caso de estudio de conversión fiel de `.pt` a safetensors con verificación tensor a tensor y comparación de salidas greedy.
- **Evaluación comparativa de cabezas**: permite analizar empíricamente la brecha de calidad entre `ar`, `sat` y `nat` en un mismo backbone, útil para decidir qué cabeza usar en un pipeline concreto.
- **Enseñanza de arquitecturas alternativas**: como ejemplo didáctico de backbone con múltiples cabezas y posicionamiento ALiBi en un modelo pequeño y de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta mediciones de velocidad en su propio hardware:

| Configuración | 16 hilos (tok/s) | 4 hilos (tok/s) |
|---|---|---|
| AR | 18 | 19 |
| SAT fijo | 14 | 15 |
| SAT variable | 14 | 16 |
| NAT 1 pase | 105 | 236 |
| NAT 2 pases | 100 | 155 |
| NAT 4 pases | 71 | 89 |
| NAT 8 pases | 39 | 50 |

Medido en M3 Ultra CPU, fp32, batch 1, greedy, 64 tokens nuevos. El autor indica que NAT queda por detrás de AR en calidad en este checkpoint.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; en fp32 los pesos ocupan 6,9 GB, por lo que se necesita al menos ~7-8 GB de memoria (GPU o RAM unificada) para cargar el modelo, más overhead de activaciones.
- **GPU recomendadas**: no especificadas por el autor; por tamaño, cabría en GPUs consumer con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) y en GPUs profesionales (A100, H100) sin problema de memoria.
- **Consumer GPU**: sí, previsiblemente en modelos con ≥8 GB de VRAM en fp32; no se documentan versiones cuantizadas (GGUF, int8, int4).
- **Opciones de despliegue**: no es compatible con vLLM, TGI, llama.cpp u Ollama de forma estándar; requiere el entrenador de un solo archivo del autor (`agillm44_retention4_batchwoodbury_v1_ckptguard_v1.py`) y el script `tools/gen_from_safetensors.py` para cargar los pesos.
- **Latencia y throughput**: medidos solo en CPU (M3 Ultra) según la tabla anterior; no hay datos de GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| AGILLM-4.3 step2975754 | 1,73 B | no disponible | MIT | safetensors | Hugging Face (15 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (no autorregresivos de ~1,7 B) en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa con datos verificables.

## Limitaciones y advertencias

- **Calidad NAT inferior a AR**: el propio autor reconoce que la ruta no autorregresiva queda por detrás de la autorregresiva en calidad en este checkpoint.
- **Ecosistema limitado**: no es compatible con la interfaz estándar de Transformers ni con herramientas habituales (vLLM, llama.cpp, Ollama, TGI); requiere código del autor.
- **Sin benchmarks publicados**: no hay evaluación estandarizada de razonamiento, código, matemáticas ni multilingüismo, lo que dificulta valorar su rendimiento real.
- **Idiomas no declarados**: se desconoce qué lenguas cubre y con qué calidad.
- **Contexto desconocido**: no se documenta la longitud máxima de contexto, lo que impide planificar su uso en tareas de contexto largo.
- **Riesgo de alucinación**: no evaluado; al ser un modelo pequeño y sin datos de alineación, el riesgo es presumiblemente alto.
- **Sesgos**: no documentados; el nombre del repositorio base (`MarxistLeninist`) y la ausencia de información sobre el dataset impiden descartar sesgos ideológicos o de dominio.
- **Licencia MIT**: permite uso comercial sin restricciones adicionales, pero conviene verificar la procedencia del dataset de entrenamiento, no documentada.
- **Estado del checkpoint**: es un paso intermedio (`step2975754`) de un entrenamiento, no necesariamente una versión final optimizada.

## Enlaces

- Hugging Face (copia safetensors): https://huggingface.co/jamest65/AGILLM-4.3-step2975754-safetensors
- Repositorio base (checkpoints originales): https://huggingface.co/MarxistLeninist/AGILLM-4.3-checkpoints
- Revisión del checkpoint original: `708d5119` (referenciada en la model card)
- Script de inferencia del autor: `agillm44_retention4_batchwoodbury_v1_ckptguard_v1.py` (sha256 `5c1f1e19...`, no enlazado en la información disponible)
- Scripts de conversión y verificación: `tools/convert.py`, `tools/gen_from_safetensors.py` (incluidos en el repo)
- Paper, blog o demo: no disponibles en la información proporcionada
