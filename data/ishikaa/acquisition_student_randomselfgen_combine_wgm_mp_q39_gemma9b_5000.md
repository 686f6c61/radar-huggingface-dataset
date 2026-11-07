# ishikaa/acquisition_student_randomselfgen_combine_WGM_MP_q39_gemma9b_5000

## Resumen

`ishikaa/acquisition_student_randomselfgen_combine_WGM_MP_q39_gemma9b_5000` es un checkpoint de generación de texto publicado en Hugging Face por el usuario `ishikaa`. Por su nombre y por los identificadores de sus modelos hermanos (variantes sobre Qwen de 3B y 7B), se trata de un modelo "estudiante" obtenido mediante destilación o entrenamiento por imitación sobre un modelo profesor Gemma de aproximadamente 9B, dentro de una línea de experimentos de adquisición de datos autogenerados ("randomselfgen") combinados con algún criterio de selección (WGM/MP). El repositorio contiene pesos en formato safetensors con 9.241.705.984 parámetros, lo que concuerda con la familia Gemma 2 de 9B.

La model card es la plantilla automática de Hugging Face sin rellenar: no documenta autoría efectiva, datos de entrenamiento, licencia ni evaluación. La información disponible se limita a los metadatos del Hub (tags `gemma2`, `transformers`, `safetensors`, `text-generation`, `conversational`, `text-generation-inference`, `endpoints_compatible`), al recuento real de parámetros y al tamaño del repositorio (18,5 GB). Cualquier dato sobre contexto, tokenizador, idiomas o rendimiento debe considerarse no disponible hasta que el autor publique documentación.

Es relevante ahora únicamente como artefacto de investigación reproducible: permite inspeccionar el resultado de una receta de destilación concreta sobre Gemma 2 9B, pero no está documentado ni validado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only, familia Gemma 2 (tag `gemma2` en el Hub); detalles no disponibles |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no aplica (no hay indicios de MoE) |
| Longitud de contexto | no disponible (Gemma 2 base soporta 8192 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible en el repo (solo safetensors); al ser arquitectura Gemma 2 es cuantizable a GGUF/AWQ/GPTQ con herramientas estándar, sin garantía del autor |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara; la licencia de Gemma 2 subyacente es la Gemma Terms of Use, pero no se confirma la del checkpoint) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,5 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura declarada por los tags es `gemma2`, es decir, un transformer decoder-only con atención por ventanas alternas y atención global, normalización RMSNorm con pre y post-norm y activación GeGLU, tal como se define en la familia Gemma 2. El recuento de parámetros (9,24B) coincide con la variante de 9B de esa familia. No hay información sobre configuración exacta de capas, dimensión oculta, número de cabezas ni vocabulario en la información proporcionada.

El nombre del checkpoint sugiere un proceso de destilación o entrenamiento por imitación: un "student" (el modelo aquí publicado) entrenado sobre datos generados por un profesor, con una estrategia de autogeneración aleatoria ("randomselfgen") combinada con algún filtro o ponderación ("WGM_MP") y un presupuesto de 5000 ejemplos o pasos ("5000"). El sufijo "q39" probablemente identifica una ejecución o configuración concreta dentro de una batería de experimentos. No se dispone de número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni hiperparámetros. La model card no aporta ninguna de estas cifras.

## Capacidades

- Generación de texto autoregresiva en formato conversacional, según el tag `conversational` y el pipeline `text-generation`.
- Compatibilidad con `text-generation-inference` y con endpoints de Hugging Face (`endpoints_compatible`), lo que permite desplegarlo con el stack estándar de TGI.
- Razonamiento, código y matemáticas: no verificable; no hay evaluación publicada ni ejemplos de uso.
- Tool calling / function calling: no disponible; no se declara plantilla de chat ni soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia documentada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo "thinking", visión o audio: no disponible; no se declaran capacidades especiales.

## Casos de uso

- Reproducción de experimentos de destilación: el checkpoint sirve para comparar la receta "randomselfgen + WGM/MP" frente a las variantes Qwen 3B y 7B del mismo autor, midiendo la calidad del estudiante con un conjunto de evaluación propio.
- Investigación sobre selección de datos sintéticos: al ser un estudiante entrenado con datos autogenerados, permite analizar qué tipos de ejemplos generados por el profesor transfieren mejor al modelo pequeño.
- Base para fine-tuning supervisado: al estar en formato transformers/safetensors, se puede partir de él para un SFT con LoRA sobre un dominio concreto, siempre que se verifique antes la licencia aplicable.
- Pruebas de infraestructura de inferencia: útil para validar pipelines de TGI o vLLM con un modelo de ~9B antes de pasar a modelos documentados en producción.
- Evaluación comparativa interna de modelos de ~9B: sirve como punto de control adicional en una batería de benchmarks propia (MMLU, GSM8K, HumanEval) junto a Gemma 2 9B original.
- Estudio de casos de alineación y sesgo: permite examinar si la destilación desde un profesor introduce o amplifica sesgos respecto al modelo base, mediante prompts controlados.

Ninguno de estos casos debe plantearse en producción sin una evaluación previa: el modelo carece de documentación, licencia declarada y métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 18-19 GB solo para pesos, más overhead de KV cache; se recomienda un mínimo de 24 GB para contextos cortos.
- Cuantización a 8 bits: aproximadamente 10-11 GB de pesos, viable en GPUs de 16-24 GB.
- Cuantización a 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 5-6 GB de pesos, cabe en GPUs consumer de 8 GB con contexto limitado.
- GPUs recomendadas: A100 40/80 GB o H100 para BF16 con contexto largo y throughput alto; L40S o RTX 6000 Ada (48 GB) para despliegues medios; RTX 4090 (24 GB) para BF16 con contexto moderado o FP8/INT8.
- GPU consumer: sí, en RTX 3090/4090 (24 GB) con BF16 y contexto recortado, y en RTX 4060 Ti/4070 (8-16 GB) solo con cuantización de 4-8 bits.
- Opciones de despliegue: `transformers` con `device_map="auto"`, TGI (el tag `text-generation-inference` lo indica), vLLM si la arquitectura Gemma 2 está soportada por la versión instalada, y llama.cpp/Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`gemma9b_5000`) | 9,24B | no disponible | no disponible | Hugging Face, safetensors | Model card vacía, sin benchmarks |
| Google Gemma 2 9B (base/it) | ~9,2B | 8192 tokens | Gemma Terms of Use | Hugging Face, ampliamente documentado | Modelo de referencia del que probablemente deriva; benchmarks públicos (MMLU, GSM8K, HumanEval) |
| `ishikaa/..._qwen7b_5000` | ~7B | no disponible | no disponible | Hugging Face | Variante del mismo autor sobre Qwen; misma receta |
| `ishikaa/..._qwen3b_5000` | ~3B | no disponible | no disponible | Hugging Face | Variante del mismo autor sobre Qwen 3B; menor coste de inferencia |

La comparación con Gemma 2 9B es la más informativa: mismo orden de parámetros, pero el checkpoint aquí descrito no declara licencia ni evaluación, por lo que no puede sustituir al modelo oficial en entornos con requisitos de cumplimiento.

## Limitaciones y advertencias

- Model card generada automáticamente y sin rellenar: no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; la licencia del modelo base Gemma 2 (Gemma Terms of Use) impone obligaciones de atribución y restricciones de uso que probablemente apliquen, pero no se confirman en este repositorio.
- Riesgo de alucinación desconocido: sin evaluación, no hay estimación de fiabilidad factual.
- Sesgos desconocidos: al derivar de un profesor no documentado y de datos autogenerados, puede heredar y amplificar sesgos del profesor y de la distribución de prompts usada en la autogeneración.
- Idiomas y contexto no confirmados: no se debe asumir soporte multilingüe ni una ventana de 8192 tokens sin verificar la configuración real del checkpoint.
- Sin garantía de calidad conversacional: el tag `conversational` no implica que se haya aplicado un ajuste de instrucciones; es posible que el checkpoint solo complete texto.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que se corrijan errores o se publique documentación.
- No apto para producción sin auditoría previa: faltan métricas, licencia clara y ejemplos de uso verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishikaa/acquisition_student_randomselfgen_combine_WGM_MP_q39_gemma9b_5000
- Variante sobre Qwen 3B del mismo autor: https://huggingface.co/ishikaa/acquisition_student_randomselfgen_combine_WGM_MP_qwen3b_5000
- Variante sobre Qwen 7B del mismo autor: https://huggingface.co/ishikaa/acquisition_student_randomselfgen_combine_WGM_MP_qwen7b_5000
- Paper de Gemma 2 (arquitectura de referencia): https://arxiv.org/abs/2408.00118
- Documentación de Gemma 2 en Google AI: https://ai.google.dev/gemma/docs/gemma-2
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Lacoste et al. (2019), cuantificación de emisiones: https://arxiv.org/abs/1910.09700
