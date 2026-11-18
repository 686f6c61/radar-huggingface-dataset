# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-swedish-seed3

## Resumen

SmolLM-360M-CPT-FineWeb-Faroese-Transfer-from-Swedish-Seed3 es un ajuste fino del modelo SmolLM2-360M-Instruct, desarrollado por el usuario jekunz, orientado a la generacion de texto en feroes (fo). El modelo se obtiene mediante un proceso de preentrenamiento continuado (continual pre-training, CPT) en dos fases: primero sobre la porcion sueca de FineWeb-2 y despues sobre la porcion feroesa del mismo corpus. Este modelo concreto corresponde a la semilla de entrenamiento 3 de una configuracion concreta, y forma parte de un experimento de investigacion sobre transferencia entre lenguas nordicas de bajo recurso.

La relevancia del modelo radica en su tamano reducido (361,8 millones de parametros) y su licencia Apache 2.0, que lo hacen adecuado para experimentacion en entornos con recursos limitados. No obstante, el autor indica explicitamente que el modelo esta destinado a su propia investigacion y que no ha sido evaluado de forma amplia, por lo que no debe considerarse un modelo listo para produccion. La informacion disponible sobre arquitectura interna, datos de entrenamiento detallados y rendimiento es escasa.

El contexto maximo de entrenamiento declarado es de 2048 tokens y el modelo se distribuye en formato safetensors compatible con la libreria transformers. No se han publicado resultados de benchmarks ni comparativas con modelos alternativos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama/SmolLM2), segun el tag `llama` y el modelo base SmolLM2-360M-Instruct |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Feroes (fo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only denso de la familia Llama, y se somete a preentrenamiento continuado sobre datos de FineWeb-2. El proceso se realiza en dos etapas: una primera epoca sobre la porcion sueca del corpus y cinco epocas sobre la porcion feroesa, con el objetivo de transferir conocimiento desde una lengua nordica con mas recursos (sueco) hacia una de muy bajo recurso (feroes).

Los hiperparametros declarados por el autor son: tasa de aprendizaje 5e-4, scheduler coseno, ratio de warmup 0,05, tamano de lote 8 con 32 pasos de acumulacion de gradientes (lote efectivo de 256), longitud maxima de contexto de 2048 tokens, semilla 3 y entrenamiento sobre una unica GPU A100 de 40 GB. No se especifica el numero total de tokens procesados, la composicion exacta del dataset mas alla de FineWeb-2, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. Tampoco se detalla ninguna innovacion arquitectonica adicional respecto al modelo base.

## Capacidades

- Generacion de texto en feroes, heredada del ajuste sobre FineWeb-2 en ese idioma.
- Conversacion multi-turno, segun el tag `conversational` y su origen en SmolLM2-360M-Instruct.
- Razonamiento basico y generacion de codigo limitados por el tamano del modelo base (360M parametros); no hay evaluacion publicada al respecto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamano y la ausencia de evaluacion hacen improbable un rendimiento fiable en estos escenarios.
- Capacidades multilingues: limitadas al feroes declarado; no se documenta soporte de otros idiomas tras el ajuste.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Experimentacion academica en procesamiento de lenguas de bajo recurso: el modelo sirve como punto de partida para estudiar tecnicas de transferencia entre lenguas nordicas (sueco a feroes) y para reproducir el pipeline de CPT con semillas controladas.
- Generacion de texto sintetico en feroes para aumento de datos: puede emplearse para producir corpus auxiliares de feroes que alimenten otros experimentos, dado su bajo coste computacional y su licencia permisiva.
- Prototipado rapido de asistentes conversacionales en feroes: con 360M parametros puede desplegarse en una sola GPU consumer para validar interfaces y flujos conversacionales antes de invertir en modelos mayores.
- Investigacion sobre olvido catastrofico: al ser un ajuste continuado sobre un modelo instruct, permite estudiar como el CPT en feroes afecta a las capacidades originales del modelo base.
- Evaluacion comparativa de semillas de entrenamiento: al existir variantes con semillas 1, 2 y 3 de la misma configuracion, facilita analisis de varianza en resultados de ajuste fino.
- Docencia y formacion: su tamano reducido (0,7 GB en el repositorio) y su compatibilidad con transformers lo hacen util para demostrar flujos de ajuste fino y preentrenamiento continuado en cursos practicos.
- Despliegue en entornos con recursos muy limitados: puede ejecutarse en CPU o en GPU de gama baja para tareas de generacion de texto no criticas donde la calidad no sea el requisito principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,5 GB solo para pesos; en bf16/fp16, unos 0,75 GB.
- VRAM estimada con cuantizacion de 8 bits: en torno a 0,4 GB; con 4 bits, alrededor de 0,2 GB (estimaciones teoricas a partir del numero de parametros; no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; el entrenamiento se realizo en una A100 de 40 GB, pero la inferencia no requiere hardware de ese nivel.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama mediante conversion a GGUF, aunque esta ultima no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM-360M-CPT-FineWeb-Faroese (este modelo) | 361,8M | 2048 | Feroes | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct (modelo base) | 360M aprox. | No disponible en la informacion | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-cpt-fineweb-swedish (modelo base inmediato) | 360M aprox. | No disponible en la informacion | Sueco | Apache 2.0 (segun el modelo derivado) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. Las alternativas de la misma categoria para feroes (modelos especificos de bajo recurso) no estan documentadas en la informacion disponible.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara que esta destinado a su investigacion y que no ha sido evaluado de forma amplia; no debe usarse en produccion sin una evaluacion propia.
- Riesgo de alucinacion elevado: con 360M parametros y cinco epocas sobre un corpus web, la fiabilidad factica es limitada.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgos; los datos de FineWeb-2 son web y pueden contener sesgos de diversa indole.
- Cobertura idiomatica restringida: solo se declara feroes; el ajuste puede haber degradado capacidades en otros idiomas del modelo base (olvido catastrofico no medido).
- Contexto limitado a 2048 tokens, insuficiente para tareas que requieran documentos largos.
- Sin soporte documentado de tool calling ni capacidades de agente; no debe asumirse su disponibilidad.
- Licencia Apache 2.0 permisiva para uso comercial, pero la ausencia de evaluacion desaconseja su uso comercial sin validacion previa.
- El nombre del modelo incluye una semilla concreta (seed3); los resultados pueden variar entre semillas y no se documenta la varianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-swedish-seed3
- Modelo base inmediato (sueco): https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-swedish
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
