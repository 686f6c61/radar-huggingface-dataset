# balllvin/SenseNova-Loop-9B-NVFP4-MLX

## Resumen

SenseNova-Loop-9B-NVFP4-MLX es una conversión comunitaria del modelo multimodal SenseNova-Loop-9B de SenseNova al formato MLX affine 4-bit (grupo 64), pensada para ejecutarse en Apple Silicon. El autor del build es el usuario `balllvin`, no afiliado a los autores originales, y parte de su propia conversión intermedia en NVFP4 (cuantización de 4 bits con escala por bloque). El resultado pesa 8,0 GB en pesos cuantizados y acepta entradas de texto e imagen para generar texto, manteniendo la torre visual en bf16 sin cuantizar (0,91 GB adicionales).

El modelo hereda la arquitectura "looped" del checkpoint base: 32 capas físicas que se ejecutan en 56 visitas, con routers mHC (multi-head control) portados a MLX. Según los safetensors del repositorio, el recuento real de parámetros es de 3.119.461.248 (3,12 mil millones), muy por debajo de los 9B que sugiere el nombre comercial, lo que conviene tener en cuenta al planificar el despliegue.

Es relevante ahora porque permite ejecutar un modelo multimodal con razonamiento iterativo sobre hardware de consumo de Apple (procesadores M-series) mediante MLX, con un servidor compatible con la API de OpenAI incluido en el repositorio. El modelo está pensado para investigación, no para producción, y no ha sido sometido a ajuste de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con ejecución en bucle (32 capas físicas, 56 visitas) y routers mHC; torre visual multimodal |
| Parámetros totales | 3.119.461.248 (según safetensors del repo) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine 4-bit (grupo 64); routers, norms y embeddings en bf16; LM head bf16 en pesos y 8-bit en inferencia por defecto; KV cache configurable en 8-bit o bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), más `visual.safetensors` con la torre visual en bf16 |

## Arquitectura y entrenamiento

El checkpoint base es un transformer con un esquema de ejecución en bucle: 32 capas físicas que se recorren 56 veces, lo que incrementa la profundidad efectiva sin aumentar el número de parámetros. Incorpora routers mHC que el autor del build ha portado explícitamente a MLX, junto con el plan de ejecución en bucle. La torre visual (`model.visual.*`, 333 tensores, 0,91 GB en bf16) se copia sin modificar desde el checkpoint oficial y no está cuantizada; el procesador de imágenes es Qwen3VLProcessor.

El entrenamiento original no está documentado en la información proporcionada. El corpus citado para la cuantización QAD es HuggingFaceFW/fineweb-edu. La conversión realizada por el autor consiste en pasar los pesos NVFP4 (cuantización de 4 bits con escalas por bloque) a MLX affine 4-bit con grupo 64, manteniendo routers, normas y embeddings en bf16. No se indica si hubo RLHF, DPO ni otras fases de alineamiento; de hecho, el autor advierte que se trata del "QAD base, not safety-tuned".

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Entrada multimodal de imagen y texto (image-text-to-text): acepta imágenes vía `image_url` con data URL o ruta local en el servidor incluido.
- Ejecución iterativa en bucle ("looped execution") que permite refinamiento interno en múltiples pasadas.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con streaming SSE.
- Gestión de KV cache con precisión configurable (8-bit para un solo stream, bf16 para lotes).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en arquitecturas con ejecución en bucle: el modelo permite estudiar empíricamente cómo afecta el número de visitas (`--loops`) a la calidad de la generación, comparando `--loops 1` (más rápido) con el valor entrenado.
- Prototipado de asistentes multimodales en local sobre Apple Silicon: con 8,0 GB de pesos en 4-bit, se puede desplegar un servidor compatible con OpenAI en un Mac con M-series y 16-32 GB de memoria unificada.
- Análisis de imágenes en flujos de investigación: descripción de contenido visual (formas, colores, objetos) mediante la torre visual bf16 y el procesador Qwen3VL, útil para experimentos de captioning o VQA sin depender de la nube.
- Evaluación de cuantización y calidad de KV cache: el repositorio documenta métricas de NLL para KV en bf16, 8-bit y 4-bit, lo que lo convierte en un banco de pruebas para estudiar el impacto de la precisión del caché en la salida.
- Desarrollo de servidores de inferencia ligeros: el script `tools/serve.py` incluye warm-up de formas (1/8/32/128 tokens), streaming y apagado por inactividad, útil como base para herramientas internas de investigación.
- Estudio de robustez y rechazo: al ser un modelo sin ajuste de seguridad, sirve para analizar el comportamiento de rechazo del checkpoint base (el autor reporta 95/99 rechazos en prompts dañinos y 60/100 en benignos para la versión NVFP4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión MLX. El autor indica explícitamente que "this MLX conversion was not separately benchmarked for refusals or MMLU". Los únicos datos numéricos disponibles son de velocidad y de calidad de KV cache:

| Métrica | Valor |
|---|---|
| Throughput, 1 stream (M5 Pro, 64 GB) | 8,1 tok/s |
| Throughput, 2 streams | 14,1 tok/s totales (7,0 por stream) |
| Throughput, 4 streams | 25,9 tok/s totales (6,5 por stream) |
| Throughput, 8 streams | 38,1 tok/s totales (4,8 por stream) |
| NLL con KV bf16 (ventana de 48 tokens) | 3,5819 |
| NLL con KV 8-bit | 3,5828 (+0,0009) |
| NLL con KV 4-bit | 3,5652 (−0,0167) |

Estas cifras corresponden al build original (NVFP4) medido en un M5 Pro con 64 GB; el autor advierte que las herramientas incluidas son más recientes y no se re-midieron para esta conversión base.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 8,0 GB para los pesos 4-bit más 0,91 GB de la torre visual en bf16, más overhead de KV cache y activaciones. En la práctica, se recomienda un mínimo de 16 GB de memoria unificada y 32 GB para lotes o contextos largos.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra) mediante MLX. No es compatible con CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente; el autor reporta pruebas en un M5 Pro con 64 GB.
- Opciones de despliegue: MLX y mlx-lm; el repositorio incluye `tools/serve.py` con API compatible con OpenAI. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 8,1 tok/s en un solo stream en M5 Pro; escala hasta 38,1 tok/s totales con 8 streams concurrentes (4,8 tok/s por stream).

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural:

| Modelo | Parámetros | Contexto | Licencia | Runtime |
|---|---|---|---|---|
| SenseNova-Loop-9B-NVFP4-MLX (este) | 3,12 mil millones (safetensors) | no disponible | Apache-2.0 | MLX (Apple Silicon) |
| SenseNova-Loop-9B (base oficial) | no disponible | no disponible | Apache-2.0 | no disponible |
| balllvin/SenseNova-Loop-9B-NVFP4 | no disponible | no disponible | Apache-2.0 | NVFP4 (no especificado) |
| balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX | no disponible | no disponible | Apache-2.0 | MLX (Apple Silicon) |

## Limitaciones y advertencias

- No es un modelo ajustado en seguridad: el autor lo describe como "QAD base, not safety-tuned". El checkpoint NVFP4 de origen rechaza 95 de 99 prompts dañinos y 60 de 100 benignos, lo que indica una tasa alta de falsos rechazos.
- La conversión MLX no ha sido evaluada por separado en rechazos ni en MMLU; los datos de robustez pertenecen al build NVFP4.
- El soporte de imagen se ha verificado con una única prueba de humo de 448×448 y no se ha ejecutado ningún benchmark de imagen para esta versión.
- La torre visual no está cuantizada, lo que añade ~0,9 GB al tamaño del build.
- La tabla de velocidad corresponde al build original; las herramientas incluidas son más recientes y no se re-midieron para esta conversión.
- El checkpoint base está restringido (gated) en Hugging Face; es necesario aceptar sus términos antes de usarlo.
- El recuento real de parámetros (3,12 mil millones) difiere notablemente del "9B" del nombre, lo que puede inducir a error en la planificación de recursos.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero esperables en un modelo base sin ajuste de alineamiento.
- Licencia Apache-2.0 permite uso comercial, pero al ser un build comunitario no afiliado a los autores originales, conviene verificar la licencia del checkpoint base antes de desplegarlo en producción.
- Limitaciones de idioma y longitud de contexto: no disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4-MLX
- Modelo base oficial: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build NVFP4 de origen: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4
- Build abliterado NVFP4: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-NVFP4
- Build abliterado + Arete NVFP4: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4
- Build abliterado + Arete MLX 4-bit: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- AdvBench: https://github.com/llm-attacks/llm-attacks
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
