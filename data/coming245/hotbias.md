# coming245/HotBias

## Resumen

HotBias es un conjunto de pesos de sesgo (biasing) para sistemas de reconocimiento automático del habla (ASR) desarrollado por el usuario coming245 y vinculado al repositorio de investigación QwenAudio/FunResearch. No es un modelo ASR completo, sino un módulo complementario que añade sesgos de hotwords (palabras clave) de forma adaptativa y con compuertas (gated) sobre modelos ASR congelados. Su aportación principal es la transferencia entre modelos: un núcleo de biasing preentrenado puede trasladarse a otro reconocedor alineando las proyecciones de entrada específicas del modelo destino.

El repositorio contiene tres checkpoints: un núcleo preentrenado de origen (`source_transfer.pt`, exportado de un sistema basado en Qwen3) y dos versiones ya alineadas para Fun-ASR-Nano-2512 (`nano_aligned.pt`) y FireRedASR2-AED (`firered_aligned.pt`). Los tres comparten el mismo núcleo de biasing congelado. El módulo se entrenó con datos de habla de AISHELL-2 y listas de candidatos a hotwords generadas automáticamente.

Es relevante para quienes despliegan ASR en dominios con vocabulario específico (nombres propios, topónimos, jerga técnica) y quieren mejorar la tasa de acierto en esos términos sin reentrenar el reconocedor base. El tamaño del repositorio es de 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulo de biasing externo sobre ASR congelado (nucleo gated adaptativo); backbone de origen basado en Qwen3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en `.pt`, sin versiones GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (entrenado con AISHELL-2, corpus de mandarin) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

HotBias no modifica los pesos del ASR base: añade un núcleo de biasing con compuertas adaptativas que opera sobre un reconocedor congelado. El núcleo se preentrena en un sistema de origen (basado en Qwen3) y se transfiere a otros reconocedores mediante la alineación de las proyecciones de entrada específicas del destino, lo que permite reutilizar el conocimiento de biasing sin reentrenar desde cero. Los checkpoints exportados (`source_transfer.pt`, `nano_aligned.pt`, `firered_aligned.pt`) comparten el mismo núcleo congelado y difieren en las proyecciones alineadas al backbone correspondiente.

El entrenamiento del módulo se realizó con datos de habla de AISHELL-2 (corpus de mandarín) junto con listas de candidatos a hotwords generadas automáticamente. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación destacable es la transferencia entre backbones (cross-backbone transfer) mediante alineación de proyecciones.

## Capacidades

- Sesgo de hotwords (hotword biasing) sobre transcripciones ASR: incrementa la probabilidad de términos concretos proporcionados en tiempo de inferencia (por ejemplo, `--hotword '池州' --hotword '赤州'`).
- Sesgo contextual adaptativo con compuertas: el módulo decide cuánto aplicar el sesgo en cada caso, en lugar de forzar una sustitución fija.
- Transferencia entre modelos: un núcleo preentrenado puede alinearse a distintos reconocedores (Fun-ASR-Nano-2512 y FireRedASR2-AED ya incluidos).
- Integración con backbones ASR congelados: no requiere reentrenar el reconocedor base.
- No es un modelo de generación de texto, razonamiento, código ni visión.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- Capacidades multilingües: no disponibles en la información proporcionada; el entrenamiento documentado usa AISHELL-2 (mandarín).

## Casos de uso

- Transcripción de nombres propios y topónimos: en un pipeline ASR con Fun-ASR-Nano-2512, se pasa la lista de términos esperados (`--hotword`) para reducir errores en entidades como localidades o apellidos poco frecuentes.
- Dominios técnicos con jerga específica: en transcripción de reuniones médicas, legales o de ingeniería, se inyectan términos del dominio (fármacos, artículos legales, siglas) como hotwords para mejorar la fidelidad.
- Atención al cliente con vocabulario de producto: en un sistema de transcripción de llamadas, se sesga hacia nombres de productos y modelos para que las transcripciones alimenten correctamente el CRM.
- Migración entre reconocedores: si se cambia de Fun-ASR-Nano-2512 a FireRedASR2-AED (o viceversa), se reutiliza el mismo núcleo de biasing con el checkpoint alineado correspondiente, evitando reentrenar el módulo.
- Adaptación rápida a nuevos reconocedores: con `source_transfer.pt` como inicialización, se alinean las proyecciones de entrada a un backbone distinto y se obtiene biasing sin partir de cero.
- Investigación en ASR contextual: sirve como base reproducible para experimentos de sesgo contextual y transferencia entre modelos, con notas de reproducción y evaluación publicadas en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,2 GB, pero el consumo real depende del backbone ASR (Fun-ASR-Nano-2512 o FireRedASR2-AED), que debe obtenerse por separado.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del backbone ASR empleado.
- Opciones de despliegue: scripts de inferencia del repositorio HotBias (`fun_asr_nano/infer.py` para Fun-ASR-Nano-2512); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HotBias | Modulo de biasing para ASR | no disponible | no disponible | Apache 2.0 | HuggingFace y ModelScope |
| Alternativas de biasing ASR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de biasing ASR en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR autónomo: requiere descargar por separado el backbone (Fun-ASR-Nano-2512 o FireRedASR2-AED) y su tokenizer.
- Los checkpoints son específicos para cada backbone; usar `nano_aligned.pt` con FireRed o `firered_aligned.pt` con Fun-ASR puede fallar o degradar el rendimiento.
- El entrenamiento documentado usa AISHELL-2 (mandarín); el comportamiento en otros idiomas no está documentado.
- Riesgo de sesgo excesivo: un sesgo mal calibrado puede forzar la aparición de hotwords donde no corresponden; las compuertas adaptativas mitigan pero no eliminan este riesgo.
- Sin métricas de rendimiento publicadas en la información disponible (WER, recall de hotwords, etc.), lo que dificulta evaluar su impacto antes de desplegarlo.
- Sin versiones cuantizadas ni formatos alternativos (GGUF, ONNX); solo pesos PyTorch (`.pt`).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los backbones ASR y del corpus AISHELL-2 por separado.

## Enlaces

- HuggingFace: https://huggingface.co/coming245/HotBias
- ModelScope: https://www.modelscope.cn/models/coming245/HotBias
- Codigo y uso oficial: https://github.com/QwenAudio/FunResearch/tree/main/HotBias
- Detalles de checkpoints: https://github.com/QwenAudio/FunResearch/blob/main/HotBias/docs/checkpoints.md
- Notas de reproduccion: https://github.com/QwenAudio/FunResearch/blob/main/HotBias/docs/reproduction.md
