# mistralai/Leanstral-2603

## Resumen

Leanstral 119B A6B es un agente de código abierto especializado en Lean 4, el asistente de demostración que permite formalizar objetos matemáticos complejos y especificaciones de software. Lo desarrolla Mistral AI como parte de la familia Mistral Small 4, y combina capacidades multimodales (texto e imagen) con una arquitectura de mezcla de expertos (MoE) eficiente: 119 000 millones de parámetros totales con solo 6500 millones activados por token. Es relevante porque cubre un nicho hasta ahora dominado por alternativas cerradas: la ingeniería de demostraciones formales en Lean 4 con licencia Apache 2.0.

El modelo está pensado para escenarios de proof engineering: generar tácticas, completar lemas, refactorizar pruebas y operar como subagente dentro de entornos de desarrollo. Su ventana de contexto de 256 000 tokens permite manejar repositorios de formalización completos, y su soporte de tool calling está optimizado para Mistral Vibe, el entorno de agentes de Mistral.

La ficha se basa en la model card publicada en Hugging Face y en los resultados de búsqueda disponibles; los datos no presentes en esas fuentes se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 128 expertos, 4 activos por token |
| Parametros totales | 119B |
| Parametros activos | 6,5B por token |
| Longitud de contexto | 256k tokens (recomendado ≤ 200k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 121 GB; la model card no detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

Leanstral emplea una arquitectura de mezcla de expertos con 128 expertos y 4 activos por token, sobre un total de 119B parámetros y 6,5B activados en cada paso. La model card menciona el uso del backend de atención `FLASH_ATTN_MLA` en vLLM, lo que sugiere atención con Multi-head Latent Attention, aunque no se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados. Tampoco se especifica si hubo RLHF, DPO u otras etapas de alineamiento.

El modelo acepta entrada multimodal (texto e imagen) y produce salida de texto. Incorpora un modo de razonamiento configurable mediante `reasoning_effort` (`none` o `high`), con temperatura recomendada de 1.0, y está optimizado para tool calling en Mistral Vibe. La model card destaca la adherencia a system prompts y la eficiencia computacional derivada de su ratio de activación (6,5B de 119B).

## Capacidades

- Generación de texto y razonamiento con modo de razonamiento activable (`reasoning_effort="high"`).
- Agente de demostraciones para Lean 4: generación de tácticas, completado de lemas y refactorización de pruebas.
- Soporte de tool calling y function calling, optimizado para Mistral Vibe.
- Capacidad de operar como subagente dentro de flujos multi-paso.
- Entrada multimodal: análisis de imágenes con salida de texto.
- Multilingüe en once idiomas, incluidos español, francés, alemán, italiano y portugués.
- Fuerte cumplimiento de system prompts.

## Casos de uso

- Formalización matemática asistida: el modelo puede generar y completar pruebas en Lean 4 sobre repositorios como PrimeNumberTheoremAnd, aprovechando su contexto de 256k tokens para mantener el estado de un proyecto de formalización extenso.
- Ingeniería de pruebas en producción: integrado como subagente en Mistral Vibe, permite iterar sobre errores de compilación de Lean y proponer tácticas alternativas con tool calling sobre el compilador.
- Verificación de especificaciones de software: dado que Lean 4 también expresa propiedades de fragmentos de Rust (por ejemplo, vía Aeneas), el modelo sirve para redactar y revisar especificaciones formales de código.
- Asistencia a investigadores en proof engineering: con contexto de hasta 200k tokens recomendados, puede analizar teorías completas y sugerir refactorizaciones de lemas.
- Automatización de CI para proyectos Lean: desplegado con vLLM en modo servidor, puede atender peticiones de comprobación de pruebas en pipelines, usando el parser de tool calls de Mistral.
- Análisis de documentación matemática con imágenes: su entrada multimodal permite interpretar diagramas o fragmentos escaneados y traducirlos a enunciados formales.
- Soporte multilingüe en entornos académicos: puede redactar explicaciones de pruebas en español, francés o alemán además del inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 119B parámetros en precisión de 16 bits se requieren del orden de 238 GB de memoria, lo que exige múltiples GPU.
- La model card recomienda `--tensor-parallel-size 4` para vLLM, lo que implica un mínimo de cuatro GPU de gran capacidad.
- GPU recomendadas: no especificadas; por tamaño, el despliegue encaja en A100/H100 de 80 GB en configuraciones multi-GPU. No cabe en GPU de consumo.
- Opciones de despliegue: vLLM (recomendado, con vllm nightly y `mistral_common >= 1.11.0`); transformers y SGLang figuran como trabajos en curso (WIP) en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros agentes de Lean 4 o modelos de tamaño similar.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real en tareas de formalización no puede verificarse con las fuentes disponibles.
- El soporte en transformers y SGLang está marcado como WIP; el despliegue local fiable pasa por vLLM nightly.
- La model card advierte de que, si el rendimiento en servido local es inferior, se recomienda usar la API de Mistral AI.
- Contexto recomendado de 200k tokens, por debajo del máximo de 256k; superar ese umbral puede degradar la calidad.
- No se detalla la composición del dataset de entrenamiento ni los sesgos conocidos.
- Aunque la licencia Apache 2.0 permite uso comercial, no se especifican restricciones adicionales sobre los datos de entrenamiento.
- Riesgo de alucinación en la generación de pruebas: las tácticas propuestas deben validarse con el compilador de Lean 4 antes de integrarse.

## Enlaces

- Hugging Face: https://huggingface.co/mistralai/Leanstral-2603
- Blog de Mistral AI: https://mistral.ai/news/leanstral
- Repositorio Mistral Vibe: https://github.com/mistralai/mistral-vibe
- Lean 4: https://github.com/leanprover/lean4
- PrimeNumberTheoremAnd: https://github.com/AlexKontorovich/PrimeNumberTheoremAnd
- Aeneas (verificación de Rust): https://github.com/AeneasVerif/aeneas
- vLLM: https://github.com/vllm-project/vllm
- mistral-common: https://github.com/mistralai/mistral-common/releases/tag/v1.11.0
- PR de transformers: https://github.com/huggingface/transformers/pull/44760
- PR de SGLang: https://github.com/sgl-project/sglang/pull/20708/
- SDK de Python de Mistral: https://pypi.org/project/mistralai/
