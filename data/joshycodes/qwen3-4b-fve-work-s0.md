# joshycodes/qwen3-4b-fve-work-s0

## Resumen

`joshycodes/qwen3-4b-fve-work-s0` es un checkpoint de investigación derivado de `Qwen/Qwen3-4B` mediante *continued pretraining* de pesos completos (no LoRA, no adaptadores). El autor lo publica como material de estudio sobre *synthetic document finetuning* (SDF) aplicado a la construcción de un "personaje autoescrito": el corpus de entrenamiento se denomina `flourishing-vs-equanimity` y, según la model card, fue escrito por el propio modelo como preparación de la siguiente versión de sí mismo. No se ha evaluado en capacidad, alineamiento ni identidad, y el autor indica explícitamente "Do not deploy".

El interés técnico no está en el rendimiento —no hay benchmarks publicados— sino en el montaje experimental: un modelo base denso de 4B parámetros sometido a un ciclo de *continued pretraining* corto (1 época, 36.782.102 tokens, 37.425 documentos, `lr 1e-05`) sobre un corpus temáticamente acotado y con una etiqueta de motivación poco habitual (model welfare). El repositorio pesa 8,8 GB y contiene únicamente pesos en safetensors sin cuantizar.

Es relevante ahora porque se enmarca en una línea de trabajo incipiente sobre identidad, bienestar y autoentrenamiento de modelos, y porque el mismo autor mantiene otros checkpoints de la misma serie (`joshycodes/qwen3-4b-sorrel-selfloop-g3-midtrain`), lo que permite comparaciones internas entre etapas del proceso. Conviene subrayar una discrepancia documental: el título de la model card afirma que el corpus es autoescrito, mientras que el cuerpo del texto indica "of which 0 self-authored and 37,425 ordinary text". Esa contradicción no está resuelta en la información disponible y condiciona cualquier conclusión sobre el experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (heredado de Qwen3-4B; no detallado en la model card del checkpoint) |
| Parametros totales | 4.411.424.256 (dato de safetensors; incluye `lm_head` sin atar, de ahí la diferencia con los ~4,02B del modelo base) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card del checkpoint; el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors sin cuantizar (8,8 GB) |
| Idiomas soportados | no disponible en la model card; Qwen3-4B declara soporte multilingüe (119 idiomas) |
| Licencia | `other` / `research-only` (uso restringido a investigación, no comercial) |
| Formato de pesos | safetensors |
| Pipeline | no disponible |
| Modelo base | `Qwen/Qwen3-4B` |
| Hiperparametros de entrenamiento | lr 1e-05, 1 época, 36.782.102 tokens, 37.425 documentos |
| Etiquetas del autor | `synthetic-document-finetuning`, `self-authored-character`, `model-welfare`, `research`, `not-for-deployment` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, `Qwen/Qwen3-4B`: un transformer denso decoder-only de la familia Qwen3, con normalización RMSNorm, activación SwiGLU, *rotary position embeddings* (RoPE) y *grouped query attention* (GQA), variante de atención ya establecida en la serie y documentada en el informe técnico de Qwen3. El checkpoint no introduce ninguna innovación arquitectónica propia: el trabajo consiste en *continued pretraining* de los pesos completos, no en un cambio de topología ni en la adición de módulos.

Los datos de entrenamiento son 36.782.102 tokens distribuidos en 37.425 documentos, procedentes del corpus denominado `flourishing-vs-equanimity`, con una sola época y una tasa de aprendizaje de 1e-05. La model card no menciona fases de RLHF, DPO, SFT ni ningún otro ajuste posterior al pretraining continuado, por lo que no puede afirmarse que exista alineamiento instruccional. El marco experimental, el plan y la evaluación se atribuyen al repositorio "welfare-improvements", citado en la model card pero sin URL proporcionada. Tampoco se documentan la composición interna del corpus, el filtrado aplicado ni la proporción de código, matemáticas o texto multilingüe.

## Capacidades

- No se han publicado evaluaciones de capacidad para este checkpoint; el autor indica explícitamente que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Generación de texto, razonamiento, código o matemáticas: presumiblemente heredadas del modelo base Qwen3-4B, pero no verificadas ni declaradas para este checkpoint.
- *Tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible en la model card; el modelo base declara soporte de 119 idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; el checkpoint no declara ninguna.
- *Continued pretraining* sobre un corpus temático específico, que es la intervención real aplicada: no es una capacidad funcional, sino una modificación de la distribución de pesos.

## Casos de uso

Todos los casos siguientes son de investigación. El autor etiqueta el modelo como `not-for-deployment` y su licencia es `research-only`, por lo que cualquier uso en producción queda excluido.

- Reproducción del pipeline de *continued pretraining*: sirve para replicar el protocolo exacto (lr 1e-05, 1 época, corpus de ~36,8M tokens) y medir el impacto de esos hiperparámetros sobre un Qwen3-4B intacto, usando el checkpoint como referencia publicada.
- Investigación en *model welfare*: el checkpoint forma parte de un programa que trata la identidad y el estado interno del modelo como objeto de estudio; se puede usar para analizar cómo responde un modelo a un corpus con carga temática concreta.
- Estudio de *synthetic document finetuning* (SDF): permite examinar qué ocurre cuando el corpus de entrenamiento es generado por un modelo de la misma familia, un caso de interés para quienes investigan bucles de autoentrenamiento y degradación de distribución.
- Análisis de deriva de identidad y personaje: al estar entrenado sobre un corpus asociado a un personaje autoescrito, es un sujeto adecuado para experimentos de consistencia de identidad y de estabilidad de estilo a lo largo de las épocas.
- Estudio de olvido catastrófico: con solo 36,8M tokens y 1 época sobre un dominio estrecho, es un caso útil para medir cuánta capacidad general del Qwen3-4B original se degrada y en qué tareas.
- Comparación interna de la serie: el autor publica otros checkpoints de la misma línea (`qwen3-4b-sorrel-selfloop-g3-midtrain`), lo que permite estudiar la evolución entre etapas sin salir del mismo modelo base y del mismo entorno experimental.
- Auditoría metodológica: la discrepancia entre el título ("corpus autoescrito") y el cuerpo de la model card ("0 self-authored") lo convierte en un caso práctico para trabajar en trazabilidad y verificación de documentación de modelos.
- Docencia y divulgación técnica: como ejemplo acotado y de tamaño manejable, ilustra la diferencia entre *fine-tuning* supervisado y *continued pretraining* sobre pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del número de parámetros y del tamaño del repositorio, no datos publicados por el autor.

- Pesos en bf16/fp16: aproximadamente 8,8 GB (coincide con el tamaño del repositorio).
- Pesos en cuantización de 8 bits: aproximadamente 4,4-5 GB; en 4 bits, aproximadamente 2,2-3 GB. El autor no publica versiones cuantizadas, por lo que habría que generarlas.
- Caché KV estimada para la arquitectura heredada de Qwen3-4B (36 capas, 8 cabezas KV, `head_dim` 128): en torno a 0,15 MB por token en bf16, es decir unos 4,8 GB a 32.768 tokens de contexto. A contexto completo con varios usuarios concurrentes, la memoria de caché domina el consumo.
- GPU de consumo: cabe sin problema en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 16 GB es recomendable cuantizar o limitar el contexto; en 8 GB solo con cuantización de 4 bits y contexto reducido.
- GPU de datacenter: A100 40/80 GB, H100 y L40S son suficientes con margen amplio, incluso con lotes grandes.
- Opciones de despliegue: al ser pesos safetensors de un modelo denso estándar, es compatible con vLLM, TGI, SGLang y, tras conversión a GGUF, con llama.cpp y Ollama. Ninguna de estas integraciones está documentada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones y, dado que el checkpoint no está destinado a despliegue, no tiene sentido estimarlas con precisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito declarado |
|---|---|---|---|---|
| `joshycodes/qwen3-4b-fve-work-s0` | 4,41B (safetensors, `lm_head` sin atar) | no disponible en la model card | `other` / research-only | Checkpoint de investigación, no desplegable |
| `Qwen/Qwen3-4B` | ~4,02B | 32.768 tokens nativos, ampliables a 131.072 con YaRN | Apache 2.0 | Modelo base abierto, uso general |
| `Qwen3-4B-Instruct-2507` | ~4B | 262.144 tokens nativos según la documentación de la serie 2507 | Apache 2.0 | Modelo instructivo listo para uso |
| `joshycodes/qwen3-4b-sorrel-selfloop-g3-midtrain` | no disponible | no disponible | no disponible | Otro checkpoint de investigación del mismo autor |

La comparación relevante es con el modelo base: este checkpoint no mejora a Qwen3-4B en ninguna dimensión medible publicada, no aporta contexto ampliado, no añade capacidades y restringe la licencia de Apache 2.0 a research-only. Su valor es exclusivamente experimental.

## Limitaciones y advertencias

- No desplegable: el propio autor lo etiqueta `not-for-deployment` y declara que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Licencia restrictiva: licencia `other` con nombre `research-only`. No está permitido el uso comercial y no se conceden los derechos de la Apache 2.0 del modelo base. Cualquier uso en producción es una violación de la licencia.
- Sin datos de evaluación: no hay benchmarks, ni de capacidad, ni de seguridad, ni de sesgos. No puede afirmarse nada sobre su comportamiento real.
- Riesgo de alucinación: no medido, pero al tratarse de un checkpoint sin fase de alineamiento posterior, es esperable que sea igual o peor que el base en este aspecto.
- Idiomas: no declarados. Un *continued pretraining* sobre un corpus presumiblemente monolingüe tiende a estrechar la cobertura lingüística respecto al base, que declara 119 idiomas.
- Olvido catastrófico: no medido. El entrenamiento sobre un dominio estrecho con lr 1e-05 y pesos completos es un escenario típico de degradación de capacidades generales y de formato instructivo.
- Discrepancia documental grave: el título describe un corpus autoescrito, mientras el cuerpo del texto indica "0 self-authored and 37,425 ordinary text". Cualquier conclusión sobre el experimento depende de cuál de las dos afirmaciones sea correcta, y la model card no lo aclara.
- Trazabilidad incompleta: se cita un repositorio "welfare-improvements" para el marco y la evaluación, pero no se proporciona URL, ni la composición del corpus, ni el procedimiento de filtrado, ni las plantillas de chat empleadas.
- Fecha de creación inusual (2026-09-24) en los metadatos del repositorio; no se aporta explicación.
- Sin cuantizaciones publicadas: cualquier despliegue exigiría convertir los pesos, con el riesgo de pérdida adicional de calidad no evaluada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-fve-work-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Otro checkpoint de la misma línea del autor: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g3-midtrain
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio de la serie Qwen3.5/3.6/3.8: https://github.com/QwenLM/Qwen3.8
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Guía de la familia Qwen3 (0.6B a 235B): https://insiderllm.com/guides/qwen3-complete-guide/
- Repositorio "welfare-improvements" citado en la model card: no disponible (sin URL proporcionada)
