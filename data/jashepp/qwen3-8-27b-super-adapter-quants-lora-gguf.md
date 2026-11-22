# jashepp/Qwen3.8-27B-super-adapter-Quants-LoRA-GGUF

## Resumen

`jashepp/Qwen3.8-27B-super-adapter-Quants-LoRA-GGUF` es un conjunto de adaptadores LoRA en formato GGUF, cuantizados por el desarrollador independiente jashepp, que aplican el adaptador `harness-hub/Qwen3.8-27B-super-adapter` sobre modelos derivados de Qwen3.8-27B. No es un modelo base completo, sino un artefacto de adaptación (PEFT) empaquetado en cinco precisiones distintas (BF16, F16, Q8_0, Q5_1 y Q4_1) para su carga directa en llama.cpp sin necesidad de fusionar los pesos con el modelo original.

El problema que resuelve es concreto: hasta la publicación de este repositorio no existían cuantizaciones Q8 o inferiores del adaptador `harness-hub/Qwen3.8-27B-super-adapter` de forma aislada, solo en calidad completa (F32). Cargar capas LoRA en precisión completa consume VRAM innecesariamente cuando el modelo subyacente ya está cuantizado. Este repositorio ofrece versiones ligeras (de 299 MB a 656 MB) que reducen ese coste y permiten aplicar el adaptador sobre merges y fine-tunes de Qwen3.8-27B sin fusionarlo.

El adaptador original está orientado a agentes: los tags del repositorio incluyen `agents`, `grpo`, `async-grpo`, `harbor`, `openenv`, `hermes` y `opencode`, y los datasets de entrenamiento (`scale800-harbor`, `harness-adapters`, `termgrade-train-harbor`, `termgrade-environments`) apuntan a entrenamiento por refuerzo sobre entornos de agentes. El repositorio tiene 3,1 GB y, en el momento de la consulta, 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelos derivados de Qwen3.8-27B; el adaptador se distribuye en GGUF para llama.cpp |
| Parametros totales | 478.150.656 (pesos del adaptador en safetensors, según datos del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base sobre el que se aplique) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q5_1, Q4_1 (no se incluyen por debajo de Q4_1 por tasa de alucinación) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA); safetensors en el repositorio PEFT original |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un transformer completo. El adaptador base `harness-hub/Qwen3.8-27B-super-adapter` se entrenó, según los metadatos, con TRL y GRPO (incluida la variante asíncrona `async-grpo`), lo que indica aprendizaje por refuerzo sobre entornos de agentes y tareas verificables. Los datasets citados (`harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor`, `ai-and/termgrade-environments`) corresponden a colecciones de harness y entornos de evaluación de agentes.

La innovación técnica de este repositorio concreto es la cuantización del propio adaptador. jashepp modificó llama.cpp (commit `f2dc7826ff617b7170160e6d2ee70f6b10e428c4` en `Jashepp/llama-cpp-misc`) exclusivamente para generar los cuants Q5_1 y Q4_1, y verificó que funcionan directamente en llama.cpp sin cambios adicionales en el runtime. El adaptador se puede cargar con escala mediante la directiva `lora-scaled` de `config.ini`, y permite apilar varios adaptadores con escalas distintas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el proceso de alineación más allá de la mención a GRPO.

## Capacidades

- Aplicación de un adaptador de agentes sobre modelos derivados de Qwen3.8-27B sin fusionar pesos.
- Carga en llama.cpp mediante `lora-scaled`, con soporte de escala numérica y de múltiples adaptadores simultáneos.
- Compatibilidad declarada con merges y fine-tunes de Qwen3.8-27B (por ejemplo, merges de jashepp y fine-tunes de DavidAU citados en la model card).
- Capacidades heredadas del modelo base Qwen3.8-27B (generación de texto, razonamiento, código, tool calling): no detalladas en la información disponible para este repositorio.
- Orientación a entornos de agentes y harness de evaluación, según los datasets y tags (`agents`, `harbor`, `openenv`, `hermes`, `opencode`).
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue de agentes en local con llama.cpp: cargar el adaptador Q4_1 (299 MB) sobre un Qwen3.8-27B ya cuantizado permite disponer del comportamiento de agente entrenado por GRPO sin pagar el coste de VRAM de un LoRA en F32.
- Ajuste de VRAM en equipos al límite: la model card indica que estos adaptadores ocupan menos VRAM que su tamaño de archivo y recomienda reducir la ventana de contexto entre 5k y 10k tokens si la memoria está al máximo; útil en GPUs de consumo con modelos de 27B en Q4.
- Composición de adaptadores especializados: la carga de múltiples LoRA con escalas distintas (`lora-scaled = adaptador1:1,adaptador2:0.5`) permite combinar el adaptador de agentes con otros adaptadores de dominio sobre el mismo modelo base.
- Evaluación de merges y fine-tunes: aplicar el adaptador sobre merges de Qwen3.8-27B (por ejemplo, merges orientados a código o ciberseguridad) para comparar el efecto del adaptador de agentes sin reentrenar.
- Prototipado de pipelines de agentes con herramientas: al heredar el comportamiento de un adaptador entrenado con GRPO sobre harness de agentes, sirve para probar flujos de tool calling y multi-step reasoning en local antes de pasar a producción.
- Investigación en RL para agentes: reproducir en local el efecto del adaptador `harness-hub/Qwen3.8-27B-super-adapter` en distintas cuantizaciones (Q8_0 frente a Q4_1) para medir la degradación por cuantización en tareas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: entre 299 MB (Q4_1) y 656 MB (BF16/F16) de tamaño de archivo; la model card indica que el consumo real de VRAM es inferior al tamaño del archivo.
- VRAM total: depende del modelo base Qwen3.8-27B sobre el que se aplique; no disponible en la información proporcionada.
- GPU recomendadas: no disponible. Para un modelo de 27B en Q4 se requiere típicamente una GPU con 16-24 GB de VRAM, pero este dato no se confirma en la información disponible.
- GPU de consumo: viable en principio con adaptadores Q4_1/Q5_1 sobre un base cuantizado, siempre que el modelo base quepa en la VRAM; la model card sugiere reducir el contexto 5k-10k tokens en equipos al límite.
- Despliegue: llama.cpp es el runtime soportado explícitamente (directiva `lora-scaled` en `config.ini`). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| jashepp/Qwen3.8-27B-super-adapter-Quants-LoRA-GGUF | Adaptador LoRA GGUF | 299-656 MB | BF16, F16, Q8_0, Q5_1, Q4_1 | Apache-2.0 | Objeto de esta ficha; requiere modelo base |
| harness-hub/Qwen3.8-27B-super-adapter | Adaptador LoRA (PEFT) | no disponible | F32 (calidad completa) | no disponible | Fuente original; sin cuantizaciones Q8 o inferiores aisladas |
| Qwen/Qwen3.8-27B | Modelo base | 27B (nominal) | no disponible | no disponible | Modelo sobre el que se aplica el adaptador |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | Fine-tune de Qwen3.8-27B | 27B (nominal) | no disponible | no disponible | Compatible según la model card del adaptador |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un modelo base derivado de Qwen3.8-27B; sin él no genera texto.
- El autor advierte que las cuantizaciones por debajo de Q4_1 (por ejemplo MXFP4) alucinan con demasiada frecuencia y por eso no se incluyen.
- Los cuants Q5_1 y Q4_1 se generaron con una modificación no oficial de llama.cpp; su uso con versiones estándar del runtime no está garantizado por el autor más allá de su verificación empírica.
- La calidad del adaptador depende de la cuantización del modelo base: aplicar un LoRA Q4_1 sobre un base ya cuantizado acumula pérdida de precisión.
- Idiomas soportados no declarados; el comportamiento multilingüe depende del modelo base.
- Sesgos y riesgos de alucinación del modelo base no documentados en este repositorio.
- Licencia Apache-2.0 declarada para el adaptador; las condiciones del modelo base Qwen3.8-27B y del adaptador original deben verificarse por separado antes de uso comercial.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin validación comunitaria significativa.
- Fecha de creación declarada 2026-11-22, posterior a la fecha habitual de referencia; conviene verificar la vigencia de los enlaces.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jashepp/Qwen3.8-27B-super-adapter-Quants-LoRA-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo HF sobre Harness Adapters: https://huggingface.co/blog/harness-adapters-at-scale
- Commit de llama.cpp para cuants Q5_1/Q4_1: https://github.com/Jashepp/llama-cpp-misc/commit/f2dc7826ff617b7170160e6d2ee70f6b10e428c4
- Perfil del autor en Hugging Face: https://huggingface.co/jashepp
- Perfil del autor en GitHub: https://github.com/Jashepp
- Perfil del autor en Bluesky: https://bsky.app/profile/jashepp.dev
- Ko-fi del autor: https://ko-fi.com/jashepp
- Merge citado: https://huggingface.co/jashepp/Qwen3.8-27B-4x-ties-merge-brilliance-coder390-cybersecurity-veriloop
- Fine-tune citado: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
