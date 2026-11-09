# jungwook2358/anyh2r-object-hawor-g2-b64-s42-30k-ckpt30000

## Resumen

AnyH2R object-hawor g2-b64-s42-30k ckpt30000 es un checkpoint de investigación publicado en Hugging Face por el usuario jungwook2358, etiquetado con el pipeline `robotics`. Se trata de una réplica declarada de una celda de entrenamiento de diversidad de tareas del proyecto AnyH2R, atribuida originalmente a otro autor (junhyeong) y derivada de un repositorio de código de RLDX-1. El modelo parte de un estado inicial denominado RLDX-1-PT-IMG y se entrena con 2 GPU, batch global de 64, semilla 42 y 30 000 pasos de entrenamiento tipo VLA (vision-language-action), con un chunk de 16 acciones y renovación de instrucciones desactivada.

El artefacto principal es un checkpoint de Hugging Face Trainer que incluye tres shards de safetensors con su índice, `config.json`, un directorio `processor/`, configuración de experimento con estadísticas del dataset, estado del trainer, scheduler y un recibo de transferencia. El repositorio ocupa 13,8 GB y excluye explícitamente los estados del optimizador de DeepSpeed y los estados RNG. Incorpora además dos ficheros contractuales: `INFERENCE_CONTRACT.json`, que describe normalizadores, activos geométricos y la etiqueta de despliegue necesarios para inferencia, y `diversity_contract.json`, con las especificaciones del dataset.

La relevancia de esta ficha es acotada: no se trata de un modelo de propósito general ni de un lanzamiento de producto, sino de un checkpoint experimental de robótica orientado a reproducibilidad de entrenamiento. No hay información pública sobre arquitectura interna, número de parámetros, contexto, idiomas ni resultados de benchmarks, por lo que la mayoría de apartados técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de tipo VLA, vision-language-action, según la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (3 shards + índice), más `config.json`, `processor/`, `experiment_cfg/`, `trainer_state`, scheduler y recibo de transferencia |

## Arquitectura y entrenamiento

La model card indica que el modelo es un VLA (vision-language-action) entrenado a partir de un estado inicial denominado RLDX-1-PT-IMG, con un chunk de 16 acciones y renovación de instrucciones desactivada. El entrenamiento se realizó con 2 GPU, batch global de 64, semilla 42 y 30 000 pasos, dentro de una celda de diversidad de tareas llamada object-hawor del proyecto AnyH2R. El checkpoint publicado corresponde al paso 30 000 y conserva el estado del trainer, el scheduler y las estadísticas del dataset en `experiment_cfg/`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la arquitectura interna (transformer, MoE, híbrida, etc.) ni si hubo etapas de RLHF o DPO. La model card menciona que la réplica mantiene idénticos los tarballs de código (con sha256 fijado), las entradas preparadas, el entorno de Python y los hiperparámetros, y que solo cambian el propietario de la salida y el nombre del job. Los estados del optimizador de DeepSpeed y los estados RNG se excluyeron del repositorio.

## Capacidades

- Control robótico de tipo VLA: el modelo está diseñado para mapear observaciones visuales e instrucciones de lenguaje a secuencias de acciones (chunk de 16 acciones).
- Ejecución de tareas con diversidad de objetos: la celda object-hawor sugiere variación en objetos dentro del entrenamiento, aunque no se detalla el conjunto exacto.
- Inferencia con contrato explícito: `INFERENCE_CONTRACT.json` define normalizadores, activos geométricos y etiqueta de despliegue necesarios para ejecutar el modelo correctamente.
- Reproducibilidad de entrenamiento: al conservar configuración de experimento, estadísticas de dataset y estado del trainer, permite auditar y replicar el proceso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): la visión forma parte del pipeline VLA según la etiqueta, pero no se detalla su alcance.

## Casos de uso

- Reproducción de experimentos de robótica: el checkpoint permite volver a ejecutar o comparar la celda object-hawor con los mismos hiperparámetros (batch 64, semilla 42, 30k pasos) y verificar resultados frente al run original.
- Investigación en diversidad de tareas: útil para estudiar cómo varía el comportamiento del VLA cuando se entrena con un conjunto diverso de objetos, usando `diversity_contract.json` como referencia del dataset.
- Evaluación de políticas de control: el chunk de 16 acciones facilita probar políticas de horizonte corto en entornos simulados o reales, siempre que se respete el contrato de inferencia.
- Punto de partida para fine-tuning: al ser un checkpoint intermedio de un proyecto mayor, puede servir como inicialización para nuevas celdas de entrenamiento dentro de AnyH2R.
- Auditoría de pipelines de entrenamiento: la inclusión de `trainer_state`, scheduler y recibo de transferencia permite trazar el historial de pasos y la configuración exacta usada.
- Despliegue controlado en laboratorio: con los normalizadores y activos geométricos definidos en `INFERENCE_CONTRACT.json`, se puede integrar en un stack de inferencia robótica interno, aunque sin garantías de soporte del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (13,8 GB) incluye pesos, configuración y estados del trainer, pero no permite derivar con fiabilidad la VRAM necesaria.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 2 GPU, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el pipeline es de robótica y requiere el contrato de inferencia propio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (VLA para robótica) con parámetros, contexto, rendimiento o licencia verificables.

## Limitaciones y advertencias

- Licencia "other": no se detallan los términos; es imprescindible revisar las condiciones antes de cualquier uso comercial o redistribución.
- Checkpoint experimental: es una réplica de un run de investigación, no un modelo validado para producción.
- Sin datos de arquitectura ni parámetros: imposibilita estimar costes de inferencia, latencia o requisitos de memoria con rigor.
- Exclusión de estados del optimizador y RNG: no es posible reanudar el entrenamiento exactamente desde el paso 30 000 sin reconstruir esos estados.
- Dependencia del contrato de inferencia: usar el modelo sin `INFERENCE_CONTRACT.json` (normalizadores, geometría, etiqueta de despliegue) puede producir resultados incorrectos.
- Idiomas no declarados: no hay garantía de soporte lingüístico más allá de lo que exija el dataset original.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; en robótica, los fallos de política pueden tener consecuencias físicas.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungwook2358/anyh2r-object-hawor-g2-b64-s42-30k-ckpt30000
- Repositorio de código de referencia citado en la model card: jun-brro/RLDX-1-egopi, rama feat/anyh2r-diversity-training, commit fc72b51 (no se proporciona URL directa)
- Run original referenciado: junhyeong-anyh2r-object-hawor-g2-b64-s42-30k-1108-v3 (no se proporciona URL directa)
