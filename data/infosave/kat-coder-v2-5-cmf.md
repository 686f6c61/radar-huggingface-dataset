# infosave/KAT-Coder-V2.5-CMF

## Resumen

KAT-Coder-V2.5-CMF es una versión especializada y podada del modelo Kwaipilot/KAT-Coder-V2.5-Dev, un MoE de arquitectura Qwen3.6-35B-A3B orientado a generación de código. El autor (infosave) parte de la cuantización Q4_K_M publicada por bartowski, la importa al formato propietario CMF (tiles de 4 bits) y aplica una poda física de expertos guiada por las frecuencias de enrutamiento observadas sobre un corpus de código Rust. El resultado es un único fichero de 12,7 GB que conserva solo los expertos que el modelo realmente activa al generar código.

La innovación principal es el "expert defrag": en lugar de mantener los 256 expertos enrutados por capa, se conserva el subconjunto mínimo que cubre el 95% de la masa de enrutamiento medida, se renumeran los expertos supervivientes a un prefijo contiguo y se recortan las filas del router en consecuencia (media de 158 de 256 expertos por capa, 3.906 expertos eliminados en total). No hay reentrenamiento: los pesos son idénticos a los originales cuantizados. El modelo resultante es un 35% más pequeño que el cuantizado completo y decodifica ×1,8 más rápido en un MacBook de 24 GB, a costa de un +2,8% de perplejidad en código.

Es relevante porque demuestra una vía práctica para servir modelos MoE grandes en hardware de consumo: la poda condicionada por tarea convierte un modelo que no cabe en 24 GB (y pagina desde disco en cada token) en uno que reside íntegramente en memoria. El precio es que se trata de un especialista estricto en código: fuera de esa tarea la calidad se degrada por diseño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (Qwen3.6-35B-A3B): 40 capas, 30 de ellas con GatedDeltaNet (atención lineal), 10 con softmax attention; 256 expertos enrutados top-8 + 1 experto compartido |
| Parámetros totales | 34,7B (designación A3B del modelo base); tras la poda no se especifica el recuento exacto de parámetros |
| Parámetros activos | ~3B (designación A3B del modelo base) |
| Longitud de contexto | no disponible (la model card menciona pruebas con prompts de 4096 tokens y el modo `--o1 all` para contextos largos) |
| Tipos de cuantización | q4_tiled (4 bits, importado desde GGUF Q4_K_M); formato CMF de un solo fichero |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cmf` (formato propietario CMF, runtime `cortiq`); origen GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo base KAT-Coder-V2.5-Dev sigue la arquitectura Qwen3.6-35B-A3B: 40 capas, de las cuales 30 usan GatedDeltaNet (atención lineal recurrente) y 10 usan atención softmax estándar. La capa MoE consta de 256 expertos enrutados con selección top-8 más un experto compartido siempre activo. El modelo original fue entrenado por Kwaipilot; no se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

La aportación técnica de esta ficha es el pipeline de poda de expertos, reproducible en dos pasos con `cortiq` ≥ 0.5.27. Primero, una pasada teacher-forced sobre un corpus representativo de código con `CMF_MOE_STATS=stats.json` registra las frecuencias de selección de expertos por capa. Segundo, `cortiq moe-defrag --stats stats.json --cover 0.95` conserva por capa el conjunto mínimo de expertos que alcanza el 95% de la masa de enrutamiento registrada, renumera los expertos supervivientes como prefijo contiguo, recorta las filas del router y escribe un `.cmf` estándar. En inferencia, el softmax del router renormaliza sobre el conjunto conservado. La calibración se hizo con 3.072 tokens de código fuente Rust, y la medición original mostró que los conjuntos top-64 de expertos para código y para prosa natural tienen un índice de Jaccard de solo 0,25, lo que justifica la especialización.

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en Rust (corpus de calibración).
- Razonamiento y generación de texto dentro del dominio de programación.
- Servidor compatible con la API de OpenAI mediante `cortiq serve`, con dashboard incluido.
- Tokenizador y plantilla de chat embebidos en el fichero: `cortiq run` ejecuta un turno de chat real sin configuración adicional.
- Ejecución en GPU con `CMF_GPU=1`: en tarjetas Vulkan/DX12 discretas todo el decode (recurrencia GatedDeltaNet, atención, router MoE, selección top-k en dispositivo y expertos) se ejecuta como un único envío GPU por token.
- En Apple Silicon, una sonda en runtime arbitra Metal frente a CPU por operación.
- Contextos largos: `--o1 all` convierte las 10 capas de softmax attention en un operador de streaming de memoria constante (KV+estado a 4K de contexto: de 238 a 83 MB).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Autocompletado y generación de código en el editor: el modelo reside en 12,7 GB y decodifica a 13,7 tok/s en un MacBook de 24 GB, suficiente para sugerencias en línea sin depender de la nube.
- Asistente de código en estación de trabajo con GPU de consumo: con una RTX A5000 (24 GB) y CUDA alcanza 149 tok/s de decodificación y procesa un prompt de 4096 tokens en 1,7 s, apto para iteración interactiva sobre ficheros completos.
- Revisión y refactorización de código Rust: la calibración sobre código Rust hace que el modelo enrute hacia los expertos más relevantes para ese lenguaje, lo que lo hace adecuado para tareas de análisis y transformación de bases de código Rust.
- Servicio local de generación de código con API compatible con OpenAI: `cortiq serve` permite integrar el modelo en herramientas existentes (plugins de IDE, scripts, pipelines) sin instalar Python ni CUDA.
- Generación de tests y documentación técnica: el modelo puede producir código de prueba y comentarios dentro del dominio de programación, con la ventaja de ejecutarse en hardware modesto.
- Despliegue en portátiles Apple Silicon: el runtime arbitra Metal y CPU por operación, lo que permite usar el modelo en un MacBook de 24 GB sin paginación desde disco.
- Investigación sobre poda de MoE: el pipeline `moe-defrag` es reproducible y permite generar especialistas propios para otras tareas con corpus propios, útil para estudiar enrutamiento condicionado por tarea.

## Benchmarks y rendimiento

Datos de rendimiento publicados en la model card (no son benchmarks de calidad tipo MMLU o HumanEval, sino perplejidad y velocidad):

| Métrica | Modelo completo q4t | Este fichero |
|---|---:|---:|
| Tamaño | 19,6 GB | 12,7 GB |
| Perplejidad en código (held-out) | 5,058 | 5,198 (+2,8%) |
| Decode en M4 24 GB | 7,6 tok/s | 13,7 tok/s (×1,8) |
| Prefill en M4 24 GB | 6,1 tok/s | 20,0 tok/s (×3,3) |

Rendimiento en NVIDIA RTX A5000 24 GB con CUDA (cortiq 0.8.96):

| Modo | Velocidad |
|---|---:|
| Decode | 148,7–149,5 tok/s |
| Prompt de 4096 tokens | 2450 tok/s (primer token en 1,67 s) |
| Decode tras prompt de 4096 tokens | 141,2 tok/s |
| Decode con Vulkan (misma tarjeta) | 56,6–57,3 tok/s |
| Prompt de 4096 tokens con Vulkan | 90 tok/s (primer token en 45,6 s) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 12,7 GB para el fichero completo; el modelo cabe íntegro en máquinas de 24 GB (MacBook M4, RTX A5000).
- GPU recomendadas: NVIDIA RTX A5000 24 GB (149 tok/s con CUDA), RTX 5090 (la variante de modelo completo decodifica a 32,8 tok/s frente a 14,4 tok/s en CPU de 32 núcleos), Apple Silicon con Metal.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más de VRAM en la práctica; el autor documenta 24 GB como referencia.
- Opciones de despliegue: runtime `cortiq` (Rust puro, sin torch, sin CUDA obligatorio, sin Python); CLI instalable con `cargo install cortiq-cli` o binario de release; backend CUDA con `--features cuda`; Vulkan/DX12; Metal en Apple Silicon; servidor compatible con OpenAI con `cortiq serve`.
- Latencia y throughput: 13,7 tok/s en M4 24 GB; 149 tok/s en RTX A5000 con CUDA; 57 tok/s con Vulkan en la misma tarjeta; primer token en 1,67 s para 4096 tokens con CUDA.
- Memoria de contexto: con `--o1 all`, KV+estado a 4K de contexto baja de 238 a 83 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-CMF (este) | 34,7B totales / ~3B activos (base) | no disponible | Apache-2.0 | `.cmf` (12,7 GB) | Especialista en código, podado, +2,8% ppl |
| Kwaipilot/KAT-Coder-V2.5-Dev (completo) | 34,7B totales / ~3B activos | no disponible | Apache-2.0 | safetensors/GGUF | Modelo base generalista; cuantizado q4t ocupa 19,6 GB |
| bartowski/Kwaipilot_KAT-Coder-V2.5-Dev-GGUF | 34,7B totales / ~3B activos | no disponible | Apache-2.0 | GGUF Q4_K_M | Fuente de la cuantización; compatible con llama.cpp |

No se dispone de datos de benchmarks comparativos de calidad frente a otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un especialista estricto en código: la calibración se hizo sobre código Rust y la calidad fuera de esa tarea se degrada por diseño, ya que la prosa enruta hacia expertos que han sido eliminados.
- La poda elimina 3.906 expertos (media de 158 de 256 conservados por capa); el router renormaliza sobre el conjunto restante, lo que puede alterar el comportamiento en dominios no calibrados.
- Riesgo de alucinación: no se documenta ninguna evaluación específica; aplican los riesgos habituales de los modelos de código.
- Idiomas soportados: no disponible; no hay información sobre cobertura multilingüe.
- Licencia Apache-2.0, que permite uso comercial, pero el formato CMF y el runtime `cortiq` son específicos del autor; la portabilidad a otros runtimes no está documentada.
- El modelo depende del runtime `cortiq` (Rust); no es directamente compatible con llama.cpp, vLLM, TGI ni Ollama sin conversión.
- El rendimiento con Vulkan es notablemente inferior al de CUDA (57 frente a 149 tok/s de decode), y el prefill con Vulkan es muy lento (45,6 s para el primer token con 4096 tokens).
- No se han publicado benchmarks de calidad estándar (MMLU, HumanEval, GSM8K) que permitan validar el impacto real de la poda más allá de la perplejidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/KAT-Coder-V2.5-CMF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Cuantización GGUF de origen: https://huggingface.co/bartowski/Kwaipilot_KAT-Coder-V2.5-Dev-GGUF
- Runtime CMF: https://github.com/infosave2007/cmf
- Guía paso a paso (conversión GGUF → CMF, Vulkan, Metal): https://github.com/infosave2007/cmf/blob/master/docs/KAT_CODER.md
- Releases del runtime: https://github.com/infosave2007/cmf/releases
