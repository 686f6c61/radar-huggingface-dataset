# AdaptiveChunking/pilot_D_s0

## Resumen

`AdaptiveChunking/pilot_D_s0` es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional, sino el resultado de un experimento de tokenización dinámica por bytes ("dynamic-chunking") llevado a cabo con la implementación `beetle-hnet`, una variante del proyecto H-Net disponible en GitHub. El modelo se entrenó con el denominado "legacy trainer" (`legacy/tier1/train.py`) y se separó del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` para adoptar el diseño de un directorio por ejecución que usa la familia Beetle.

Con 22.516.992 parámetros totales (unos 22,5 millones) y un tamaño de repositorio de 0,1 GB, se trata de un modelo muy pequeño, pensado para validar hipótesis sobre segmentación adaptativa de secuencias a nivel de byte y no para tareas generativas de propósito general. La model card no documenta la longitud de contexto, los idiomas soportados ni el pipeline de inferencia, y no se han publicado resultados de benchmarks. Su relevancia es, por tanto, la de una pieza de investigación reproducible: pesos, configuración y trazas de entrenamiento quedan expuestos bajo licencia Apache 2.0 para que otros equipos puedan auditar o replicar el experimento.

La ficha siguiente describe exclusivamente lo que consta en la información disponible; los campos no documentados se marcan explícitamente como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `beetle-hnet`), entrenamiento a nivel de byte con chunking dinámico; detalles de capas no disponibles |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) más `config.json`; sin estado de optimizador |

## Arquitectura y entrenamiento

El modelo sigue la línea H-Net tal como la implementa el repositorio `beetle-hnet`, con procesamiento a nivel de byte ("byte-level") y un mecanismo de chunking dinámico que, por lo que se deduce de las etiquetas y del nombre de la organización, agrupa dinámicamente posiciones de la secuencia en lugar de operar sobre una tokenización estática. La model card no detalla el número de capas, la dimensión oculta, el tipo de atención ni si hay componentes SSM o híbridos; esa información queda en el `config.json` del repositorio, que no se ha proporcionado.

El entrenamiento se realizó con el "legacy trainer" del proyecto (`legacy/tier1/train.py`), un pipeline antiguo que, según la propia model card, no conservaba estado del optimizador; por eso el repositorio no incluye el directorio `training_state/`. Se conserva un único checkpoint retenido en la rama `step-N` (el paso 6000), con sus pesos y configuración, y en la rama `main` los pesos más recientes junto con `final.json` y `log.jsonl`. La configuración incluye un mapa `tied_weights` que indica qué pesos están atados y cómo restaurarlos (`sd[dst] = sd[src]`). No se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO o ajuste por preferencias.

Como material de validación, la organización publica sondas de frontera sobre FLORES+ en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la ruta `pilot_D_s0/`. Esas sondas parecen estar diseñadas para medir cómo el modelo segmenta o delimita unidades lingüísticas en textos multilingües, lo que apunta a un interés en evaluar la calidad del chunking más que la calidad generativa.

## Capacidades

- Entrenamiento y evaluación de segmentación dinámica a nivel de byte: el modelo está pensado para experimentar con chunking adaptativo, no para generar texto abierto.
- Pesos y configuración reproducibles: se publican `model.safetensors`, `config.json` (con `model_config`, configuración de entrenamiento y mapa `tied_weights`), `final.json` y `log.jsonl`.
- Checkpoint intermedio accesible: la rama `step-N` conserva el paso 6000, lo que permite comparar estados intermedios con el estado final de `main`.
- Sondas de frontera multilingües: el dataset asociado incluye pruebas sobre FLORES+, lo que sugiere evaluación de límites de segmentación en varios idiomas, aunque el modelo no declara idiomas soportados.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre tokenización adaptativa: usar los pesos y el `config.json` para reproducir el experimento de chunking dinámico y comparar el comportamiento del paso 6000 con el estado final.
- Auditoría de pipelines de entrenamiento legacy: el repositorio sirve como referencia de qué artefactos produce el "legacy trainer" (sin estado de optimizador) y cómo se estructura una ejecución en el layout Beetle.
- Evaluación de fronteras lingüísticas: emplear las sondas FLORES+ de `AdaptiveChunking/hnet-chunking-probes` para medir cómo el modelo delimita unidades en textos multilingües y contrastar con otras ejecuciones de la familia.
- Baseline para experimentos de compresión de secuencias: al operar a nivel de byte con 22,5 millones de parámetros, puede servir como punto de partida de bajo coste para probar variantes de chunking antes de escalar.
- Docencia y formación técnica: un modelo pequeño, con pesos abiertos y trazas de entrenamiento, es adecuado para explicar en un curso cómo se registra una ejecución, se atean pesos y se versionan checkpoints.
- Reproducibilidad de resultados académicos: publicar junto al dataset de sondas permite que revisores externos verifiquen afirmaciones sobre segmentación sin depender de pesos privados.
- Integración en herramientas de análisis de tokenizadores: los artefactos pueden incorporarse a scripts que comparen estrategias de segmentación sobre corpus de prueba, siempre que se respete la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 22,5 millones de parámetros en precisión de 32 bits, los pesos ocupan aproximadamente 90 MB, y en 16 bits unos 45 MB, a lo que hay que sumar memoria para activaciones y el mecanismo de chunking, cuyo consumo no está documentado.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna con al menos unos pocos GB de VRAM libre debería poder alojar los pesos, pero el requisito real depende de la implementación de `beetle-hnet`.
- ¿Cabe en GPU consumer? Sí, por volumen de parámetros; la viabilidad práctica depende de que el código de `beetle-hnet` sea ejecutable en el hardware disponible.
- Opciones de despliegue: el repositorio usa PyTorch y safetensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La vía prevista es cargar los pesos con PyTorch siguiendo el mapa `tied_weights`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AdaptiveChunking/pilot_D_s0` | 22.516.992 | no disponible | H-Net byte-level con chunking dinámico | Apache 2.0 | Pesos en Hugging Face, un checkpoint retenido (paso 6000) |
| `AdaptiveChunking/hnet-chunking-pilots` | no disponible | no disponible | Repositorio empaquetado del que se separó esta ejecución | no disponible en la información | Hugging Face |
| Modelos de tokenización byte-level convencionales | no disponible | no disponible | Tokenización estática, sin chunking dinámico | variable | variable |

No se dispone de datos de rendimiento comparables entre estas alternativas; la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- No es un modelo generativo listo para producción: la model card no documenta pipeline, contexto ni idiomas, y no hay benchmarks publicados.
- Riesgo de alucinación: no evaluable con la información disponible; al no documentarse tareas generativas, no se puede afirmar ni descartar.
- Sesgos conocidos: no documentados; el dataset de entrenamiento y su composición no se describen.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados figuran como no disponibles, pese a que existen sondas FLORES+ asociadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación con atribución y conservación del aviso de licencia; conviene revisar también la licencia del código de `beetle-hnet`, que no se detalla en la información proporcionada.
- Ausencia de estado de optimizador: no es posible reanudar el entrenamiento desde el checkpoint tal cual; solo se conservan pesos y configuración.
- Restauración de pesos atados: es obligatorio aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) para que la carga sea correcta; ignorarlo puede producir un modelo con pesos inconsistentes.
- Madurez del artefacto: creado y actualizado el 8 de noviembre de 2026, con cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de uso externo ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_D_s0
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
- Código `beetle-hnet`: https://github.com/suchirsalhan/beetle-hnet
