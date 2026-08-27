# ersensari/Qwen3.8-27B-EES-ForgeMix-v1.0

## Resumen

EES ForgeMix v1.0 es una cuantización mixta FP8/NVFP4 del modelo Qwen/Qwen3.8-27B, desarrollada por el usuario ersensari (EES) como un derivado de terceros optimizado para servir localmente en dos GPU NVIDIA Blackwell de consumo. El modelo base, Qwen3.8-27B, es un modelo denso de visión-lenguaje de 27.000 millones de parámetros con atención híbrida (16 capas de atención completa y 48 de atención lineal), lanzado por el equipo Qwen de Alibaba. Esta versión cuantizada reduce el tamaño del checkpoint a 18,5 GB manteniendo la compatibilidad con el chat template, los controles de razonamiento, el parser de tool calls y el procesador de visión del original.

La relevancia de este modelo radica en que permite ejecutar un modelo de 27B con capacidades multimodales y de código en hardware de consumo (dos RTX 5060 Ti de 16 GB) mediante decodificación especulativa con un draft companion en uint2. La cuantización fue calibrada y seleccionada con NVIDIA ModelOpt 0.46.0, usando un corpus de código local filtrado y sin datos de benchmarks para la selección de la receta. Los resultados validados en EvalPlus muestran un rendimiento competitivo en tareas de generación de código, con un throughput de 93,37 tokens/s en el hardware de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense causal vision-language model (híbrida: 16 capas full attention + 48 linear attention) |
| Parametros totales | 16.129.127.152 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; 64.000 tokens validado para servir |
| Tipos de cuantizacion | Mixta FP8/NVFP4 (48 módulos FP8 + 352 NVFP4 + 2 NVFP4 protegidos) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifica para esta versión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards, 18.497.335.916 bytes) |

## Arquitectura y entrenamiento

EES ForgeMix v1.0 no es un modelo entrenado desde cero, sino una cuantización del checkpoint BF16 de Qwen/Qwen3.8-27B. El modelo base emplea una arquitectura de atención híbrida: solo 16 de las 64 capas usan atención completa (con intervalo de 4), mientras que las otras 48 usan atención lineal con un estado recurrente constante, lo que reduce el coste computacional en contextos largos. La cuantización se realizó con NVIDIA ModelOpt 0.46.0, exportando 48 módulos de proyección de texto en FP8 y 352 en NVFP4, más los bundles de embedding y LM head en NVFP4. Los tensores de visión y MTP (Multi-Token Prediction) se mantienen idénticos al original en BF16.

La selección de la receta mixta se hizo mediante un proceso de búsqueda sobre 400 proyecciones de texto elegibles, usando sensibilidad basada en gradiente/NLL y divergencia KL bajo un presupuesto de bytes fijo. Se utilizaron ocho muestras de calibración de máximo 512 tokens de un corpus local de código (CodeFeedback, Magicoder, Evol-Code, CodeAlpaca) con filtrado de duplicados y de fugas. No se usaron datos de EvalPlus ni de benchmarks para elegir la receta. El modelo no fue entrenado ni ajustado; es un derivado cuantizado que preserva el comportamiento del original con posibles variaciones debidas a la cuantización.

## Capacidades

- Generación de texto y razonamiento: mantiene el modo de pensamiento (thinking mode) del Qwen3.8, controlable mediante `reasoning_effort`.
- Generación de código: validado en tareas de programación (HumanEval, MBPP) con resultados competitivos.
- Comprensión de imágenes: entrada de texto e imágenes (el modelo base también documenta soporte de vídeo).
- Tool calling / function calling: compatible con el parser de tool calls del Qwen3.8.
- Capacidades multilingües: heredadas del modelo base, aunque no se especifican idiomas concretos en esta versión.
- Decodificación especulativa: diseñado para funcionar con el draft companion `EES ForgeMix DFlash2 uint2 v1.0`, que acelera la generación.
- Compatibilidad con SGLang y vLLM: se puede servir con el runtime incluido en el repositorio.

## Casos de uso

- Asistente de programación local: el modelo puede generar, completar y refactorizar código en entornos de desarrollo integrados (IDE) gracias a su capacidad de razonamiento y su validación en tareas de código. Su tamaño cuantizado permite ejecutarlo en estaciones de trabajo con dos GPU de consumo.
- Automatización de oficina con entrada visual: al aceptar imágenes, puede procesar capturas de pantalla, diagramas o documentos escaneados para extraer información o generar resúmenes, útil en flujos de trabajo de productividad.
- Agente conversacional con tool calling: su compatibilidad con el parser de tool calls permite integrarlo en sistemas de agentes que necesitan invocar funciones externas (APIs, bases de datos) de forma estructurada.
- Servidor de inferencia para equipos pequeños: con el runtime Docker incluido y SGLang, puede desplegarse como servicio interno para equipos de desarrollo que necesitan un LLM local sin depender de la nube.
- Prototipado de aplicaciones multimodales: su capacidad de procesar texto e imágenes lo hace adecuado para prototipos de chatbots con entrada visual, como asistentes de soporte que analizan capturas de error.
- Evaluación de cuantizaciones mixtas: al ser un caso documentado de cuantización FP8/NVFP4 con metodología de selección por sensibilidad, sirve como referencia para investigadores que estudian el impacto de la cuantización en modelos de código.

## Benchmarks y rendimiento

La model card reporta resultados de EvalPlus 0.3.1 (generación greedy, temperatura 0, seed 42, `reasoning_effort=none`, TP2, contexto 64K) comparando tres configuraciones:

| Target | HumanEval | HumanEval+ | MBPP | MBPP+ | Plus mean |
|---|---:|---:|---:|---:|---:|
| Radix mixed baseline | 0.909 | 0.884 | 0.892 | 0.751 | 0.8175 |
| EES smart-mix alpha.1 | 0.921 | 0.866 | 0.878 | 0.754 | 0.8100 |
| EES ForgeMix v1.0 | 0.921 | 0.896 | 0.886 | 0.757 | 0.8265 |

Exact ForgeMix counts: 151/164 HumanEval, 147/164 HumanEval+, 335/378 MBPP, 286/378 MBPP+, con cero salidas vacías y sin reinicios ni OOM. Un pase Plus requiere superar tanto los tests base como los Plus.

Throughput validado (SGLang, 20 requests, input hasta 4096, output hasta 1024, concurrency 1, draft uint2):

| Target | Output tok/s | Mean accepted length | Success |
|---|---:|---:|---:|
| Radix mixed baseline | 85.26 | 3.14 | 20/20 |
| EES smart-mix alpha.1 | 96.61 | 3.23 | 20/20 |
| EES ForgeMix v1.0 | 93.37 | 3.11 | 20/20 |

Estos resultados cubren solo tareas de generación de código; no establecen calidad general, multilingüe, de seguridad, visión, contexto largo o fiabilidad en producción.

## Requisitos de hardware

- Hardware validado: 2x NVIDIA RTX 5060 Ti 16 GB (SM120), sin P2P/NVLink, con PCIe PHB.
- VRAM estimada: el checkpoint ocupa 18,5 GB en disco; con la cuantización mixta y el draft uint2, cabe en dos GPU de 16 GB cada una. No se especifica VRAM mínima exacta para una sola GPU.
- GPU recomendadas: dos GPU NVIDIA Blackwell de consumo (SM120 o superior) para el perfil validado. No se indica compatibilidad con arquitecturas anteriores (Ampere, Ada).
- Opciones de despliegue: SGLang (runtime Docker incluido en el repositorio), vLLM (el modelo base tiene recetas en vLLM Recipes), y posiblemente llama.cpp si se convierte a GGUF, aunque no se menciona.
- Latencia y throughput: 93,37 tokens/s de salida en el workload de prueba con decodificación especulativa (draft uint2, 6 tokens de draft, página 1, Mamba full-memory ratio 0.50). La latencia no se reporta directamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | 27B | 262.144 | BF16 | Apache-2.0 | Modelo base original, requiere más VRAM |
| EES ForgeMix v1.0 | 16,13B (cuantizado) | 262.144 (64K validado) | FP8/NVFP4 | Apache-2.0 | Derivado cuantizado, optimizado para 2 GPU Blackwell |
| EES ForgeMix DFlash2 uint2 v1.0 | No disponible | No disponible | uint2 | Apache-2.0 | Draft companion para decodificación especulativa |

No se dispone de comparativas con otros modelos de la misma categoría (p. ej., Llama 3.1 8B o Qwen3-30B-A3B) en la información proporcionada. La comparativa principal es con el modelo base BF16, del cual es un derivado.

## Limitaciones y advertencias

- Es una cuantización, no un modelo entrenado: los resultados del modelo base BF16 no deben presentarse como resultados de ForgeMix, ya que la cuantización puede alterar el comportamiento.
- Los benchmarks validados cubren exclusivamente generación de código (EvalPlus). No hay evidencia de rendimiento en tareas de razonamiento general, multilingüe, seguridad, visión o contexto largo.
- El modelo no fue desarrollado ni respaldado por el equipo Qwen, Alibaba Cloud, NVIDIA, ModelOpt ni SGLang. Es un derivado de terceros.
- La calibración se realizó con un corpus de código específico; el rendimiento en otros dominios puede degradarse.
- El hardware de validación es específico (RTX 5060 Ti 16GB, SM120). No se garantiza el funcionamiento en otras arquitecturas de GPU.
- La licencia Apache-2.0 permite uso comercial, pero se debe consultar la licencia del modelo base y los datasets de calibración (CodeFeedback, Magicoder, Evol-Code, CodeAlpaca) antes de reutilizarlos.
- No se especifican idiomas soportados ni sesgos conocidos; se recomienda consultar la model card del modelo base Qwen3.8-27B para limitaciones originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ersensari/Qwen3.8-27B-EES-ForgeMix-v1.0
- Draft companion: https://huggingface.co/ersensari/Qwen3.8-27B-EES-ForgeMix-DFlash2-uint2-v1.0
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Página de QwenCloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
