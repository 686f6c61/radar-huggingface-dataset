# asher577/scaling2_plain_d512_L2_t125000000_s1

## Resumen

`scaling2_plain_d512_L2_t125000000_s1` es un transformer de pesos dispersos (weight-sparse) de escala muy reducida, publicado por el usuario asher577 en HuggingFace. Se trata de un modelo de investigación, no de un modelo de propósito general: cuenta con solo 2 capas, una dimensión de modelo de 512, una longitud de contexto de 512 tokens y un vocabulario de 4096 tokens. El nombre del repositorio codifica los hiperparámetros principales: dimensión 512, 2 capas, 125 millones de tokens de entrenamiento y semilla 1.

El modelo se ha entrenado siguiendo el procedimiento descrito por Gao et al. (2025) para transformers con dispersión de pesos, con un objetivo de fracción L0 del 0,01 (es decir, aproximadamente el 1 % de los pesos activos por neurona o bloque, según la formulación del paper). Además de la dispersión de pesos, el modelo incorpora dispersión de activaciones. El conjunto de datos empleado es `jacobcd52/simplestories-tokenized`, derivado del corpus SimpleStories, y el tokenizador es el de `SimpleStories/SimpleStories-1.25M`.

Su relevancia es exclusivamente experimental: sirve para estudiar cómo se comportan las técnicas de sparsification estructural en regímenes de cómputo muy bajos y para reproducir resultados de escalado de dispersión. No está pensado para despliegue en producción, atención al cliente ni generación de código, y no se han publicado benchmarks, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con dispersión de pesos y activaciones (weight-sparse transformer) |
| Parametros totales | no disponible (2 capas, d_model=512, vocab=4096; no se publica el recuento) |
| Parametros activos | no aplica (no es MoE; dispersión L0 objetivo del 1 %) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en `pytorch_model.bin`, sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintético en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de 2 capas con dimensión de modelo 512, dimensión de cabeza 16 y vocabulario de 4096 tokens. La innovación principal no está en la arquitectura base, sino en el régimen de entrenamiento: se aplica el procedimiento de Gao et al. (2025) para inducir dispersión de pesos con una fracción L0 objetivo de 0,01, combinada con dispersión de activaciones. Esto implica que, tras el entrenamiento, solo una fracción mínima de las conexiones sinápticas contribuye a la activación, lo que en teoría reduce el coste computacional y de memoria en inferencia si se explota la estructura dispersa.

El entrenamiento se realizó sobre 125 000 000 tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con el tokenizador de `SimpleStories/SimpleStories-1.25M`. No se documenta el uso de RLHF, DPO ni ajuste por instrucciones; el objetivo es puramente de modelado de lenguaje autoregresivo sobre un corpus sintético de historias simples. El run de entrenamiento está registrado en Weights & Biases (ver enlaces). No se especifican detalles sobre la composición del dataset, la mezcla de datos, la estrategia de optimización ni el hardware utilizado.

## Capacidades

- Generación de texto autoregresiva sobre el dominio del corpus SimpleStories (historias sintéticas simples en inglés).
- Modelado de lenguaje a nivel de token con vocabulario reducido de 4096 entradas.
- Capacidad de razonamiento, código, matemáticas o visión: no disponible; el modelo no ha sido entrenado ni evaluado para estas tareas.
- Tool calling / function calling: no soportado.
- Soporte de agentes o razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas; el corpus de entrenamiento es sintético y en inglés.
- Capacidades especiales (thinking mode, visión, audio): ninguna documentada.

## Casos de uso

- Investigación sobre dispersión de pesos: reproducir el procedimiento de Gao et al. (2025) y analizar el efecto de la fracción L0 del 1 % en un modelo de 2 capas y 512 dimensiones. Es el uso principal y prácticamente el único realista.
- Estudio de escalado de sparsification: comparar curvas de pérdida y comportamiento de activaciones con otras variantes del mismo autor (el nombre `scaling2_...` sugiere una familia de runs de escalado).
- Validación de pipelines de entrenamiento: servir como caso de prueba ligero para verificar que un pipeline de tokenización, carga de dataset y logging en W&B funciona correctamente antes de escalar a modelos mayores.
- Análisis de dispersión de activaciones: instrumentar el modelo para medir cuántas activaciones son no nulas y contrastarlo con el objetivo L0 declarado.
- Docencia y experimentación académica: modelo de juguete para explicar transformers, sparsity y el impacto del contexto corto (512 tokens) en la calidad de la generación.
- Pruebas de integración con el código de SparseGPT: el modelo requiere la clase `SparseGPT` del repositorio del autor para cargarse, por lo que sirve para validar dicha implementación en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 2 capas y d_model=512, el modelo cabe holgadamente en cualquier GPU consumer; una estimación conservadora sitúa el peso en decenas o pocos cientos de MB en fp32, aunque no se publica el recuento exacto de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). No requiere aceleradores de datacenter.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI. La carga requiere `torch.load` sobre `pytorch_model.bin` y la clase `SparseGPT` del repositorio del autor; no se proporciona script de generación.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 2 capas con contexto de 512 tokens, la latencia sería muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `scaling2_plain_d512_L2_t125000000_s1` | no disponible (2 capas, d=512) | 512 | no disponible | HuggingFace, pesos PyTorch | Weight-sparse, corpus sintético |
| Modelos de la familia SimpleStories (p. ej. `SimpleStories-1.25M`) | ~1,25 M | no disponible | no disponible | HuggingFace | Tokenizador de referencia del mismo ecosistema |
| GPT-2 small | 124 M | 1024 | MIT | HuggingFace, múltiples formatos | Referencia clásica de modelo pequeño; no sparse |
| Otros runs de la familia `scaling2_*` del mismo autor | variables | 512 | no disponible | HuggingFace | Misma receta, distintos tamaños/semillas |

La comparación directa con modelos de producción no es significativa: el modelo es un artefacto de investigación con un dominio restringido y sin evaluación pública.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial; contactar con el autor antes de cualquier uso fuera de investigación.
- Modelo de investigación sin evaluación: no hay benchmarks, por lo que se desconoce su calidad real incluso en su dominio.
- Contexto muy corto (512 tokens): inadecuado para conversaciones multi-turno, documentos largos o tareas de agente.
- Vocabulario reducido (4096 tokens): limita la cobertura léxica y la calidad en textos fuera del corpus SimpleStories.
- Entrenado sobre un corpus sintético de historias simples: alta probabilidad de alucinación y de generar texto incoherente fuera de ese dominio.
- Idiomas: no documentados; probablemente solo inglés sintético, sin garantías.
- Requiere código específico (`SparseGPT`) para cargarse: no es plug-and-play con `transformers` estándar.
- Sin versiones cuantizadas ni formatos GGUF: el despliegue en llama.cpp u Ollama requeriría conversión manual.
- Riesgo de sesgos: no evaluado; el corpus sintético puede contener patrones repetitivos o artefactos del generador.
- No apto para producción: sin soporte, sin mantenimiento documentado y con 0 descargas y 0 likes en el momento de la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asher577/scaling2_plain_d512_L2_t125000000_s1
- Run de entrenamiento en W&B: https://wandb.ai/asher577/scd_scaling/runs/e62gjqf8
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia del procedimiento (Gao et al., 2025): no disponible en la información proporcionada.
