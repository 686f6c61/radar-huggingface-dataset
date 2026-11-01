# hossain0909/Keural-Cortex-8B-SFT-v2-step600

## Resumen

Keural-Cortex-8B-SFT-v2-step600 es un checkpoint intermedio del segundo ciclo de ajuste supervisado (SFT) del modelo bilingüe coreano-inglés Keural-Cortex-8B, desarrollado por MKD Co., Ltd. (plataforma Keural). Se publica en HuggingFace como material de transparencia mientras finaliza el entrenamiento completo (paso 600 de 1.124, es decir, el 53% de una época), por lo que no debe considerarse un modelo terminado. Parte de Qwen/Qwen3-8B, sobre el que MKD aplicó un preentrenamiento continuado de 41.000 millones de tokens y una extensión de contexto hasta 65.536 tokens mediante YaRN con factor 2.0.

La arquitectura es un transformer causal denso (Qwen3ForCausalLM) de 36 capas, hidden size 4096, GQA con 32 cabezas de consulta y 8 de clave/valor, head_dim 128, vocabulario de 151.936 tokens y 8,19 mil millones de parámetros en bf16 (16,38 GB). Aunque la model card declara 8,19 B de parámetros, los pesos safetensors del repositorio suman 2.047.683.840 parámetros reales, una discrepancia que conviene verificar antes de desplegar.

Su relevancia actual radica en la corrección de defectos concretos de la primera ejecución SFT (respuestas vacías en prompts cortos, autopresentación errónea, aceptación de premisas falsas, respuestas coreanas demasiado escuetas y ausencia de alineamiento de seguridad), documentados con detalle poco habitual en la model card. Es un caso útil para estudiar prácticas de empaquetado de datos con atención bloque-diagonal y pérdida solo en turnos del asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal denso), 36 capas, hidden 4096, GQA 32/8, head_dim 128 |
| Parametros totales | 8,19 B declarados en la model card; 2.047.683.840 reales según safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens (32.768 nativos + YaRN factor 2.0) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en bf16) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con la arquitectura de Qwen3, 36 capas, hidden size 4096 y atención GQA con 32 cabezas de consulta y 8 de clave/valor (head_dim 128). El vocabulario es de 151.936 tokens. Sobre el modelo base Qwen/Qwen3-8B, MKD realizó un preentrenamiento continuado con 41.000 millones de tokens y una extensión de contexto a 65.536 tokens mediante YaRN (factor 2.0 sobre los 32.768 nativos). El checkpoint publicado corresponde al paso 600 de 1.124 de la segunda ejecución SFT, con pérdida de entrenamiento de 0,8056 en ese punto.

El entrenamiento se ejecutó en 4 GPU NVIDIA H200 de 141 GB con FSDP full-shard, longitud de secuencia 32.768, 1.572.864 tokens por paso (micro batch 1 × 32.768 × 4 GPU × acumulación de gradiente 12) y 1.768.030.208 tokens empaquetados en 53.956 secuencias. Se aplicó pérdida solo en turnos del asistente (66,3% de los tokens), AdamW con β=(0,9; 0,95), weight decay 0,0, recorte de gradiente 1,0, LR pico 1e-5 con schedule WSD (3% warmup, 17% estable, decaimiento al 5%), bfloat16, flash-attention-2 y entropía cruzada lineal fusionada. La innovación técnica destacable es el uso de atención bloque-diagonal mediante `position_ids` por documento para evitar contaminación entre conversaciones empaquetadas, lo que además elevó el throughput de 15,1k a 25,1k tokens/s. La ejecución incorpora datos de seguridad (41.853 filas de WildGuardMix, WildJailbreak y CoCoNot) y una ampliación del conjunto de identidad (6.621 ejemplos únicos ×5, 1.370 preguntas distintas en inglés y 215 negaciones de premisa inicial).

## Capacidades

- Generación de texto conversacional bilingüe coreano-inglés con formato markdown estructurado.
- Razonamiento y respuesta a preguntas, incluyendo rechazo de premisas falsas ("la capital de Australia es Sídney", "Python se creó en 2015", "2+2=5").
- Autopresentación correcta como "Keural, un asistente de IA desarrollado por MKD Co., Ltd.".
- Tool calling / function calling: la model card documenta despliegue con vLLM usando `--enable-auto-tool-choice --tool-call-parser hermes`.
- Contexto largo de hasta 65.536 tokens para conversaciones multi-turno y documentos extensos.
- Alineamiento de seguridad bidireccional: rechaza peticiones dañinas y cumple con peticiones benignas con apariencia sospechosa.
- Respuestas coreanas largas y estructuradas (300-500+ tokens) tras la corrección del sesgo de brevedad.
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat; no se debe usar `--reasoning-parser qwen3` con este checkpoint.

## Casos de uso

- Atención al cliente en coreano e inglés: conversaciones multi-turno con contexto de hasta 65.536 tokens, adecuado para historiales largos y consultas encadenadas sin perder el hilo.
- Asistente interno bilingüe para empresas con operaciones en Corea: respuestas estructuradas en coreano (300-500+ tokens) y en inglés con formato markdown consistente.
- Integración en pipelines con tool calling: el parser hermes de vLLM permite conectar el modelo a APIs externas (calendario, CRM, bases de datos) en flujos de automatización.
- Evaluación de técnicas de SFT y empaquetado de datos: útil como referencia para estudiar atención bloque-diagonal con `position_ids` por documento y pérdida solo en turnos del asistente.
- Moderación y filtrado de contenido: el alineamiento con WildGuardMix, WildJailbreak y CoCoNot permite usar el modelo como clasificador o generador de respuestas seguras en entornos controlados.
- Prototipado de asistentes con contexto largo: análisis de documentos extensos o contratos en coreano/inglés dentro de la ventana de 65.536 tokens.
- Investigación en corrección de sesgos de idioma: caso documentado de corrección del sesgo de brevedad en coreano frente a inglés (3,4× de diferencia de longitud y 4.363× en marcadores markdown antes de la corrección).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento en el paso 600 (0,8056) y el throughput de entrenamiento (25,1k tokens/s en 4×H200).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, más KV cache y activaciones; con contexto de 65.536 tokens el consumo adicional de KV cache es significativo.
- GPU recomendadas: NVIDIA H200 (usada en entrenamiento), H100, A100 80 GB para despliegue en bf16 con contexto completo.
- Tensor parallelism: la model card sugiere `--tensor-parallel-size 2` en vLLM, lo que implica al menos 2 GPU para el despliegue documentado.
- GPU de consumo: no se documenta cuantización (GGUF, AWQ, GPTQ) en la información disponible; en bf16 no cabe en GPU de consumo típicas (RTX 4090 de 24 GB) con contexto largo, aunque podría intentarse con cuantización no oficial.
- Opciones de despliegue: transformers (código de ejemplo en la model card) y vLLM (comando documentado con `--max-model-len 65536`, `--enable-auto-tool-choice`, `--tool-call-parser hermes`). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia; solo se reporta throughput de entrenamiento (25,1k tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Keural-Cortex-8B-SFT-v2-step600 | 8,19 B (declarados) / 2,05 B (safetensors) | 65.536 | ko, en | Apache 2.0 | Checkpoint intermedio (paso 600/1.124) |
| Qwen/Qwen3-8B (base) | 8,19 B | 32.768 nativos (extensible) | Multilingue | Apache 2.0 | Modelo final publicado |
| Keural-Cortex-8B-SFT-step903 (ejecución 1) | 8,19 B | 65.536 | ko, en | Apache 2.0 | Ejecución 1 completa, con defectos documentados |

## Limitaciones y advertencias

- Es un checkpoint intermedio (53% de una época), no un modelo final; el modelo completado se publicará por separado.
- Quedan tres problemas conocidos sin resolver según la model card (no detallados en la información disponible).
- Discrepancia entre los 8,19 B declarados y los 2.047.683.840 parámetros reales en safetensors; verificar antes de dimensionar hardware.
- No se debe usar `--reasoning-parser qwen3` con este checkpoint en vLLM (limitación 1 documentada).
- Riesgo de alucinación inherente a modelos de 8 B; no se reportan evaluaciones de fidelidad factual.
- Cobertura lingüística limitada a coreano e inglés; no se documenta rendimiento en castellano ni en otros idiomas.
- Aunque se añadió alineamiento de seguridad, la cobertura previa era del 0,4% del corpus y el modelo sigue siendo un checkpoint intermedio.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un checkpoint intermedio no se recomienda su uso en producción sin validación adicional.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.

## Enlaces

- HuggingFace: https://huggingface.co/hossain0909/Keural-Cortex-8B-SFT-v2-step600
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Checkpoint de la primera ejecución SFT: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-SFT-step903
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
