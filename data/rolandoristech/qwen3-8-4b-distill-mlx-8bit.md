# RolanDorisTech/Qwen3.8-4B-Distill-MLX-8bit

## Resumen

RolanDorisTech/Qwen3.8-4B-Distill-MLX-8bit es una conversión cuantizada en formato MLX del modelo empero-ai/Qwen3.8-4B-Distill, un destilado de parámetros completos del modelo docente Qwen3.8 2.4T A95B (MoE) hacia la arquitectura densa Qwen3.5-4B. Según la model card del autor, este repositorio es un alias de búsqueda de RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ8e: comparte exactamente los mismos pesos y el mismo método de cuantización (oQ8e), por lo que ambos identificadores pueden usarse indistintamente en `mlx_lm.generate` o en LM Studio.

El problema que resuelve es el despliegue local de un modelo de razonamiento de ~4B de parámetros en hardware Apple Silicon, con una ventana de contexto nativa de 262.144 tokens y un peso en disco de 4,2 GB. La cuantización empleada, denominada oQ8e, no es un 8-bit uniforme estándar: es una cuantización de precisión mixta de clase Q8 (promedio ~8 bits por peso) con ponderación por importancia de activaciones (imatrix), orientada a preservar las capas más sensibles al error de cuantización.

Es relevante ahora porque combina tres elementos poco frecuentes a la vez: destilación de un docente de gran escala, contexto de 262k tokens y un esquema de cuantización adaptativa documentado (oQ/oQe) con soporte nativo en el ecosistema MLX (mlx-lm, oMLX, LM Studio, mlx-swift) bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5-4B); el modelo docente es MoE Qwen3.8 2.4T A95B |
| Parametros totales | 4B (segun denominacion del modelo base) |
| Parametros activos | No aplica (el modelo destilado es denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ8e (precisión mixta de clase Q8, ~8 bits promedio, con imatrix); existe un hermano oQ4e y una conversion GGUF independiente |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (compatible con mlx-lm, oMLX, LM Studio y mlx-swift) |

## Arquitectura y entrenamiento

El modelo base, empero-ai/Qwen3.8-4B-Distill, es un destilado de parámetros completos de Qwen3.8 2.4T A95B (un modelo MoE de gran escala) hacia la arquitectura densa Qwen3.5-4B. Según la información del autor, el estudiante se entrenó sobre aproximadamente 45.000 trazas docentes curadas procedentes de conjuntos internos de destilación de Qwen3.8: cadenas de razonamiento densas que abarcan matemáticas, razonamiento general y seguimiento de instrucciones, filtradas por calidad antes del entrenamiento. No se especifica en la información disponible si hubo fases adicionales de RLHF o DPO.

La innovación de este repositorio concreto está en la cuantización. El método oQ mide la sensibilidad real de cada capa al error de cuantización y asigna un presupuesto de bits no uniforme: capas como `lm_head`, los embeddings de tokens y los primeros y últimos bloques del transformer son desproporcionadamente sensibles y reciben más bits, mientras que otras toleran una compresión más agresiva. La variante oQe añade sobre esa base una pasada de calibración de importancia de activaciones, usando estadísticas por canal (imatrix) para ponderar el error de cuantización en aquellas canales relevantes durante la calibración. La salida es safetensors MLX estándar, por lo que la compatibilidad de runtime debe verificarse contra la versión concreta de cada aplicación.

## Capacidades

- Generación de texto y razonamiento: el modelo incorpora cadena de pensamiento densa procedente del destilado, con plantilla de chat basada en Qwen3 y etiquetas `<think>`.
- Razonamiento matemático: el conjunto de destilación incluye cadenas de razonamiento matemáticas, según la descripción del modelo base.
- Seguimiento de instrucciones: el entrenamiento del estudiante cubrió explícitamente tareas de instruction following.
- Contexto largo: ventana nativa de 262.144 tokens, apta para documentos extensos y conversaciones multi-turno prolongadas.
- Modo de razonamiento explícito: la plantilla de chat con `<think>` separa el razonamiento previo de la respuesta final.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el razonamiento multi-paso es esperable por las etiquetas `reasoning` y el formato de pensamiento, pero no está documentado formalmente.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento local en Apple Silicon: el modelo se ejecuta íntegramente en memoria unificada de un Mac con mlx-lm o LM Studio, permitiendo razonamiento con cadena de pensamiento sin conexión a servicios externos ni coste de API.
- Análisis de documentos largos: con 262.144 tokens de contexto nativo, puede procesar informes, expedientes o bases de código extensas en una sola pasada sin troceado previo, manteniendo coherencia entre secciones distantes.
- Prototipado de asistentes conversacionales multi-turno: el contexto amplio y el formato de chat Qwen3 permiten mantener conversaciones largas con memoria de turnos previos en aplicaciones de escritorio macOS.
- Generación y revisión de código asistida: la combinación de razonamiento denso e instruction following lo hace utilizable como asistente local de programación integrado en editores, sin enviar código a la nube.
- Investigación en destilación de modelos: sirve como caso de estudio para analizar cómo se comporta un destilado denso de 4B frente al docente MoE de 2,4T en tareas de razonamiento.
- Estudio de métodos de cuantización: al existir variantes oQ8e y oQ4e del mismo modelo base, permite comparar empíricamente el efecto de distintos presupuestos de bits sobre la calidad de razonamiento en un mismo modelo.
- Despliegue en aplicaciones nativas macOS: los pesos MLX safetensors son compatibles con mlx-swift, lo que habilita su integración en apps Swift distribuidas fuera de la App Store como modelos locales embebidos.
- Evaluación offline en entornos restringidos: al ejecutarse localmente y bajo Apache-2.0, es adecuado para escenarios con requisitos de privacidad o sin acceso a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. La model card incluye una tabla de rendimiento del método de cuantización oQ medida sobre Qwen3.5-35B-A3B (MMLU, 300 muestras), que el propio autor advierte explícitamente que documenta la metodología oQ y no constituye un benchmark de calidad de los modelos oQe Qwen3.8 Distill:

| Bits | Uniform Q (mlx-lm) | oQ |
|---:|---:|---:|
| 2-bit | 14,0% | 64,0% |
| 3-bit | 76,3% | 85,0% |
| 4-bit | 79,7% | 83,3% |

Como referencia adicional citada en la model card, SqueezeLLM (arXiv:2306.07629) reporta para LLaMA-7B en C4 una perplejidad de 28,26 con RTN uniforme, 18,08 con cuantización no uniforme agnóstica a la sensibilidad y 7,75 con cuantización no uniforme basada en sensibilidad. Del mismo modo, LLM Compressor de vLLM reduce la perplejidad en WikiText-2 de Llama-3.1-8B (W4A16) de 6,96 a 6,85 con su observador `imatrix_mse`, y a 6,83 con GPTQ. Ninguno de estos datos corresponde a este modelo concreto.

## Requisitos de hardware

- Tamaño en disco de los pesos: 4,2 GB (cuantización oQ8e, ~8 bits promedio).
- VRAM/memoria unificada estimada para inferencia: en torno a 4,2 GB para los pesos más el caché KV, cuyo tamaño crece con la longitud de contexto. Con la ventana completa de 262.144 tokens el caché KV puede superar ampliamente el tamaño de los propios pesos, por lo que se recomienda dimensionar la memoria según la longitud real de contexto utilizada.
- Hardware objetivo declarado: Apple Silicon (etiquetas `apple-silicon` y `mlx`). El formato MLX no está pensado para GPUs NVIDIA o AMD.
- ¿Cabe en hardware de consumo? Sí, dentro del ecosistema Apple Silicon. Con 4,2 GB de pesos, un Mac con 16 GB de memoria unificada puede ejecutarlo en contextos moderados; para contextos muy largos conviene disponer de 32 GB o más.
- Opciones de despliegue: mlx-lm (línea de comandos `mlx_lm.generate`), oMLX, LM Studio y mlx-swift. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI, que requieren otros formatos de pesos; para llama.cpp existe una conversión GGUF independiente publicada por Empero.
- Latencia y throughput: no disponibles.
- Parámetros de generación sugeridos en la model card: `--max-tokens 250 --temp 0.6 --top-p 0.95 --top-k 20`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RolanDorisTech/Qwen3.8-4B-Distill-MLX-8bit (este) | 4B denso | 262.144 tokens | oQ8e (~8 bits mixto, imatrix) | Apache-2.0 | MLX safetensors; 4,2 GB |
| RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ4e | 4B denso | 262.144 tokens | oQ4e (~4 bits mixto) | Apache-2.0 | MLX safetensors; repositorio hermano |
| empero-ai/Qwen3.8-4B-Distill-GGUF | 4B denso | 262.144 tokens | Varias (GGUF, p. ej. Q4_K_M de 2,59 GiB) | Apache-2.0 | GGUF para llama.cpp |
| empero-ai/Qwen3.8-4B-Distill (base sin cuantizar) | 4B denso | 262.144 tokens | Sin cuantizar | Apache-2.0 | Safetensors originales |

Los datos de contexto y licencia de los modelos hermanos y del base proceden de la información disponible; los detalles exactos de las cuantizaciones GGUF pueden variar y conviene consultarlos en el repositorio correspondiente.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada. Al ser un destilado entrenado sobre trazas docentes filtradas, puede heredar sesgos presentes en dichos datos.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de este tamaño, especialmente en contextos muy largos.
- Limitaciones de idioma: los idiomas soportados no están documentados en la información disponible, por lo que no puede garantizarse un rendimiento multilingüe homogéneo.
- Contexto: aunque la ventana nativa es de 262.144 tokens, el coste de memoria del caché KV crece con la longitud de contexto y puede degradar la calidad en los extremos de la ventana si no se valida empíricamente.
- Licencia: Apache-2.0 permite uso comercial, pero la model card indica que la licencia se hereda del modelo base; conviene verificar las condiciones del upstream Qwen3.8 y del destilado de Empero antes de un despliegue comercial.
- Compatibilidad de runtime: la model card advierte que la compatibilidad debe verificarse contra la aplicación y versión concretas, ya que se trata de una cuantización no uniforme.
- Naturaleza del repositorio: este ID es un alias del repositorio canónico oQ8e; el repositorio canónico contiene la documentación completa.
- Benchmarks: no hay métricas de calidad publicadas para este modelo concreto; las cifras de la model card pertenecen a otro modelo y solo documentan la metodología de cuantización.
- Plataforma: al ser formato MLX, está restringido a hardware Apple Silicon y no puede desplegarse en GPUs NVIDIA o AMD sin reconvertir los pesos.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/RolanDorisTech/Qwen3.8-4B-Distill-MLX-8bit
- Repositorio canónico oQ8e: https://huggingface.co/RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ8e
- Repositorio hermano oQ4e: https://huggingface.co/RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ4e
- Modelo base destilado: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Conversión GGUF del modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill-GGUF
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación de la metodología oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Paper SqueezeLLM: https://arxiv.org/abs/2306.07629
- Documentación del observador imatrix de vLLM LLM Compressor: https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/imatrix/
- Canal de YouTube del autor (tutoriales y benchmarks de IA local en Apple Silicon): https://www.youtube.com/@RolanDorisTech
- Ficha del modelo GGUF en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-8-4b-distill.html
- Requisitos de VRAM y tamaños de cuantización en ossmodeldb: https://www.ossmodeldb.com/models/qwen3-8-4b-distill
