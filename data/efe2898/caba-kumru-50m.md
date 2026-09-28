# Efe2898/caba-kumru-50m

## Resumen

ÇABA 50M — Kumru es un modelo de lenguaje causal experimental desarrollado por el usuario Efe2898 bajo el identificador `Efe2898/caba-kumru-50m`. Se trata de un modelo base entrenado desde cero (*from-scratch*), con 49.964.096 parámetros reales según los pesos en safetensors, y no está ajustado por instrucciones ni funciona como asistente conversacional. Su interés principal es arquitectónico: forma parte de la familia ÇABA v0-core, que prescinde por completo de capas de autoatención.

La arquitectura sustituye la atención por una combinación de convolución causal *depthwise* y tres bancos de matrices asociativas recurrentes (rápido, medio y lento), con promociones aplazadas de ventana fija entre bancos. El modelo usa el tokenizador Kumru de `vngrs-ai/Kumru-2B-Base` (vocabulario de 50.176 tokens) y un dataset tokenizado propio almacenado en fragmentos `uint16` little-endian.

Es relevante ahora como pieza de investigación reproducible: el repositorio incluye la implementación y configuración personalizadas, los registros de entrenamiento y evaluación en la carpeta `training/`, y sirve como banco de pruebas para estudiar mecanismos de memoria recurrente frente a la atención estándar en escalas pequeñas. No hay datos de benchmarks ni de licencia publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ÇABA v0-core: sin autoatención; convolución causal depthwise + tres bancos de matrices asociativas recurrentes (rápido, medio, lento) |
| Parámetros totales | 49.964.096 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors en FP32/BF16; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible; el tokenizador y el manifiesto del dataset apuntan al turco, con objetivo de manifiesto declarado en 0 |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamaño de repositorio 0,2 GB) |

## Arquitectura y entrenamiento

El bloque de ÇABA v0-core no contiene capas de autoatención. Cada bloque combina una convolución causal *depthwise* con tres bancos de matrices asociativas recurrentes: el banco rápido escribe cada token, mientras que los bancos medio y lento reciben promociones aplazadas de ventana fija. La puntuación de promoción de esta versión v0 se basa en un residuo de asociación normalizado con *stop-gradient*, empleado como medida de "no resuelto", y el autor indica explícitamente que no es una estimación aprendida de utilidad futura. La selección de contenido y la admisión en los bancos medio y lento son mecanismos separados, y la admisión suave no implica omisión de FLOPs. La actualización usa una regla delta explícita que el autor no equipara al kernel oficial de Gated DeltaNet-2.

La configuración de entrenamiento declarada es: dimensión oculta 512, 8 bloques, 8 cabezas, anchura SwiGLU de 1280 y relojes de promoción de 8 y 64 tokens. El tokenizador es `vngrs-ai/Kumru-2B-Base` en la revisión `55711ea224e4bf5d4e11a4baf79130ae73785ece` (vocabulario de 50.176, ID de EOS/separador de empaquetado 3). Los datos provienen del dataset `Efe2898/tokenized`, en la revisión `6cb993aa63064cd89b511bb164e8c6e5512902ed`, compuesto por fragmentos de tokens `uint16` little-endian en crudo. La ejecución incluyó fragmentos no manifestados (el autor marca `unmanifested shards: true`) y el objetivo de manifiesto para turco figura como 0; las fuentes seleccionadas, sus pesos y las rutas de los fragmentos se registran en `training/training_config.json`. No se detalla el número total de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto causal autoregresiva, con decodificación greedy y muestreo top-k/top-p implementados en el método `.generate()` personalizado.
- Modelo base sin ajuste por instrucciones: no mantiene formato de chat ni sigue instrucciones complejas de forma fiable.
- Capacidad de continuación de texto libre a partir de un *prompt*, como se ilustra en el ejemplo oficial con el texto en turco "Türkiye'de bilim ve teknoloji".
- Procesamiento de secuencias mediante estado recurrente en lugar de caché de atención clásica, lo que lo convierte en un sujeto de estudio para mecanismos de memoria.
- Soporte de *tool calling* / *function calling*: no declarado ni disponible.
- Soporte de agentes y razonamiento multi-paso: no declarado; el modelo no es un asistente ni está optimizado para tareas agénticas.
- Capacidades multilingües: no declaradas. El tokenizador y el manifiesto del dataset apuntan al turco, pero no hay evaluación idiomática publicada.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Investigación en arquitecturas recurrentes sin atención: el modelo permite reproducir y auditar un diseño que sustituye la autoatención por bancos asociativos con promoción diferida, usando la implementación incluida en el repositorio y los registros de `training/`.
- Estudio de mecanismos de memoria multiescala: la separación entre bancos rápido, medio y lento con relojes de 8 y 64 tokens permite experimentar con políticas de promoción y medir su efecto en la perplejidad de continuación de texto.
- Pruebas de tokenización con Kumru: al emplear el tokenizador de `vngrs-ai/Kumru-2B-Base` sobre corpus tokenizados en `uint16` crudo, sirve para validar pipelines de preprocesado y de empaquetado de secuencias con separador de ID 3.
- Punto de partida para *ablations* a pequeña escala: con menos de 50 millones de parámetros, es viable entrenar variantes completas o parciales en hardware modesto para comparar reglas de actualización (por ejemplo, la regla delta explícita frente a otras formulaciones).
- Generación de texto experimental en turco: puede usarse para inspeccionar cualitativamente la fluidez y los sesgos de un modelo base entrenado con datos turcos, siempre como material de análisis y no como salida de producción.
- Docencia y divulgación técnica: su tamaño (0,2 GB de repositorio) y su dependencia de `trust_remote_code=True` lo hacen adecuado para explicar en aula cómo se carga un modelo con código personalizado y cómo se audita antes de habilitarlo.
- Prototipado de inferencia en CPU o dispositivos de borde: el reducido número de parámetros permite ejecutar experimentos de latencia sin GPU dedicada, aunque sin garantías de calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y describe explícitamente este primer modelo como un *checkpoint* de investigación, no como una garantía de calidad o velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en FP32, 0,1 GB en FP16/BF16 y 0,05 GB en int8 para los pesos. Añadiendo estados recurrentes, activaciones y sobrecarga del *runtime*, cabe holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se necesita A100, H100 ni RTX 4090. Una GTX 1050 Ti, una RTX 3060 o incluso una GPU integrada moderna pueden ejecutarlo.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo y también en CPU. No se han publicado datos de latencia ni de *throughput*.
- Opciones de despliegue: la vía soportada es la librería `transformers` con `trust_remote_code=True`, ya que el repositorio incluye configuración e implementación personalizadas. No se ha publicado soporte para vLLM, llama.cpp, Ollama, TGI ni formato GGUF; al tratarse de una arquitectura no estándar sin atención, su integración en esos motores requeriría un *port* específico.
- Advertencia de seguridad: activar `trust_remote_code=True` ejecuta código del repositorio; se recomienda revisarlo antes de habilitarlo.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento del modelo, por lo que la comparación se limita a características estructurales frente a alternativas de escala parecida.

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ÇABA 50M — Kumru | 49,96 M | No disponible | Recurrente con bancos asociativos, sin atención | No disponible | HuggingFace, requiere `trust_remote_code=True` |
| Pythia-70M | 70 M | 2048 | Transformer con atención | Apache 2.0 | HuggingFace, `transformers` estándar |
| GPT-2 small | 124 M | 1024 | Transformer con atención | MIT | HuggingFace, `transformers` estándar |
| TinyStories-33M | 33 M | 512 | Transformer con atención | No disponible en la fuente consultada | HuggingFace |

La diferencia principal frente a estas alternativas es que ÇABA 50M no usa autoatención y no está soportado por los *runtimes* de inferencia habituales. No hay datos que permitan comparar calidad de generación entre ellos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado. Al entrenarse con un dataset tokenizado propio sin tarjeta de licencia ni composición detallada, los sesgos potenciales son desconocidos.
- Riesgo de alucinación: alto en la práctica, ya que es un modelo base de 50 millones de parámetros sin ajuste por instrucciones ni alineación documentada.
- Limitaciones de contexto e idioma: la longitud de contexto no está declarada y los idiomas soportados no están confirmados. El uso del tokenizador Kumru y el objetivo de manifiesto turco sugieren orientación al turco, pero sin evaluación publicada.
- Restricciones de licencia: el modelo no declara licencia, lo que impide determinar si se permite el uso comercial. El dataset de entrenamiento tampoco declara licencia de redistribución, y el propio autor recomienda confirmar los derechos de los datos antes de volver a publicarlos.
- Código personalizado: cargar el modelo exige `trust_remote_code=True`, con el riesgo asociado de ejecutar código no auditado.
- Estado del proyecto: es un *checkpoint* de investigación v0-core. El autor señala que no garantiza calidad ni velocidad, y que la puntuación de promoción no es una estimación aprendida de utilidad futura.
- Fase temprana de la arquitectura: la implementación usa una regla delta explícita que no se corresponde con el kernel oficial de Gated DeltaNet-2, por lo que los resultados no son extrapolables a esa familia.
- Datos de entrenamiento incompletos: se incluyeron fragmentos no manifestados y el objetivo de manifiesto para turco figura en 0, lo que dificulta reproducir exactamente la mezcla de datos.
- Sin datos de producción: no hay métricas de benchmarks, latencia, *throughput* ni pruebas de robustez. No se recomienda su uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Efe2898/caba-kumru-50m
- Perfil del autor: https://huggingface.co/Efe2898
- Tokenizador Kumru: https://huggingface.co/vngrs-ai/Kumru-2B-Base
- Dataset tokenizado: https://huggingface.co/datasets/Efe2898/tokenized
- Dataset adicional del autor con tokenizador Kumru: https://huggingface.co/datasets/Efe2898/Prosperity-Family-Alya-CPT-3B-Kumru
- Repositorio del autor con registros de entrenamiento: carpeta `training/` dentro de https://huggingface.co/Efe2898/caba-kumru-50m
