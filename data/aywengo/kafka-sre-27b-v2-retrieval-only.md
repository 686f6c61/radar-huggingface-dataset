# aywengo/kafka-sre-27b-v2-retrieval-only

## Resumen

kafka-sre-27b-v2-retrieval-only es un adaptador LoRA de aproximadamente 467 MB desarrollado por el usuario aywengo para el modelo base Qwen/Qwen3.8-27B. Está entrenado sobre pares de pregunta y respuesta centrados en Apache Kafka, Strimzi, Kubernetes y Argo CD, y su propósito es generar respuestas cortas en un pipeline de generación aumentada por recuperación (RAG) específico del dominio de fiabilidad de sitios (SRE). El adaptador no es un modelo autónomo: requiere el runtime de recuperación `kafka_sre_rag` del repositorio kafka-sre-llm y el índice de documentación de la release v3.0.0.

La relevancia de esta publicación es acotada y experimental. El propio autor advierte que el adaptador no supera al modelo base con recuperación en calidad juzgada: con sus propios términos de búsqueda empata dentro del margen de error (-0,07 con error estándar de 0,21 sobre 40 preguntas), y con los términos del modelo base rinde peor (-0,29). Su ventaja medible es la concisión: mediana de 1.208 caracteres frente a 4.714 del modelo base con recuperación, y solo 1 de 40 respuestas contiene identificadores ausentes de los extractos recuperados, frente a 28 de 40 en el modelo base.

El adaptador está pensado exclusivamente para inferencia con extractos de documentación recuperados en el prompt. Sin recuperación, el autor reporta una puntuación de -0,18 frente al modelo base sin adaptador y desaconseja explícitamente ese uso. No existen builds fusionados, cuantizados a 4 bits ni en formato GGUF, porque ninguno fue medido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre transformer (modelo base Qwen/Qwen3.8-27B) |
| Parámetros totales | no disponible (adaptador de ~467 MB; parámetros del modelo base no disponibles) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no existe build cuantizado ni fusionado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador MLX (librería mlx); sin GGUF ni safetensors fusionados |
| Modelo base | Qwen/Qwen3.8-27B (revisión recomendada: mlx-community/Qwen3.8-27B-bf16, `6f265714824f3c38d4452baa1628aef3d9b9aae9`) |
| Runtime requerido | mlx-lm 0.32.2 y mlx 0.32.4 sobre Apple silicon |
| Plantilla de chat | wrapper no-thinking obligatorio (`scripts/make_nothink_base.py`) |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre Qwen/Qwen3.8-27B, un transformer del que la información disponible no detalla capas, atención ni configuración interna. El entrenamiento se realizó sobre pares de pregunta y respuesta acerca de Apache Kafka, Strimzi, Kubernetes y Argo CD, orientados a tareas de SRE. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable no está en la arquitectura sino en el flujo de uso: el adaptador genera sus propios términos de búsqueda para el paso de recuperación del runtime `kafka_sre_rag`, que luego inyecta extractos de documentación en el prompt. El adaptador fue entrenado y medido con una plantilla de chat modificada para desactivar el modo de razonamiento (non-thinking); con la plantilla upstream sin modificar, el comportamiento no corresponde al medido. El índice de documentación está congelado en la release v3.0.0, con su hash registrado en `kafka_sre_rag/frozen.json`.

## Capacidades

- Generación de texto técnico especializado en Apache Kafka, Strimzi, Kubernetes y Argo CD.
- Generación autónoma de términos de búsqueda para el paso de recuperación documental.
- Síntesis de extractos de documentación recuperados en respuestas breves (mediana de 1.208 caracteres).
- Reducción de identificadores inventados o ausentes de los extractos: 1 de 40 respuestas frente a 28 de 40 del modelo base con recuperación.
- Respuestas en inglés exclusivamente.
- No dispone de capacidades de visión, audio ni tool calling documentadas en la información disponible.
- No está diseñado para razonamiento multi-paso ni uso agéntico autónomo; el autor lo restringe a uso con recuperación y verificación humana.

## Casos de uso

- Asistencia a operadores de Kafka con documentación recuperada: el adaptador recibe extractos del índice v3.0.0 y produce respuestas concisas sobre configuración de topics, particiones y réplicas, adecuadas para consulta rápida en terminal.
- Diagnóstico de fallos en clústeres Strimzi: ante una pregunta sobre un operador que no reconcilia, el runtime recupera la documentación relevante y el adaptador sintetiza los pasos en un formato breve, aunque el autor advierte que puede omitir pasos esenciales en 3 o 4 de cada 10 respuestas.
- Consulta de manifiestos de Argo CD: es la categoría donde el adaptador rinde mejor (+1,40 sobre el modelo base con recuperación en 5 preguntas), por lo que encaja en flujos de revisión de sincronización y health checks de aplicaciones.
- Generación de borradores de configuración para revisión humana: el adaptador produce texto corto con muy pocos identificadores inventados (1 de 40), lo que reduce el riesgo de referencias a recursos inexistentes, siempre que un operador valide cada comando antes de aplicarlo.
- Indexación y búsqueda en bases de conocimiento internas de SRE: el adaptador puede generar los términos de búsqueda que alimentan el recuperador, integrable en un pipeline RAG sobre documentación operativa propia.
- Formación y documentación interna: sus respuestas breves sirven como resúmenes de referencia para runbooks, con la salvedad de que omiten pasos que los extractos sí contienen.
- No es adecuado para uso desatendido: el autor prohíbe explícitamente su aplicación automática a clústeres sin verificación previa de cada configuración y comando.

## Benchmarks y rendimiento

Todas las mediciones se realizaron sobre 40 preguntas reales escritas a mano (`questions_real`), evaluadas por un modelo juez local (GLM-5.3-Flash, build `oQ8e-mtp`) con dos pasadas y orden de respuestas invertido en la segunda. La escala es de 1 a 5 y el error estándar es de aproximadamente 0,2, por lo que diferencias inferiores a 0,2 se consideran ruido.

| Medición | Tamaño | Resultado |
|---|---|---|
| v2 + recuperación, términos propios, frente a base + recuperación | 40 preguntas, 2 pasadas | media -0,07; error estándar 0,21; 15 victorias / 6 empates / 19 derrotas |
| v2 + recuperación, términos del modelo base, frente a base + recuperación | 40 preguntas, 2 pasadas | media -0,29; error estándar 0,21; 9 / 7 / 24 |
| v2 sin recuperación, frente a base sin adaptador | 40 preguntas, 2 pasadas | media -0,18; 17 / 6 / 17 |
| Longitud mediana de respuesta, términos propios frente a base + recuperación | 40 respuestas cada uno | 1.208 frente a 4.714 caracteres |
| Respuestas con identificador ausente de sus propios extractos | 40 respuestas cada uno | base + recuperación 28; v2 términos propios 1; v2 términos del base 3 |
| Cobertura del pack (todos los patrones de hechos hallados) | 37 preguntas respondibles | términos del base: 25 aciertos, 6 parciales, 6 fallos; términos propios de v2: 25 / 9 / 3 |
| Lectura de un revisor sobre ítems inventados o erróneos | 10 respuestas por conjunto, un lector, una pasada | base + recuperación 17 ítems en 7 respuestas; v2 términos propios 3 ítems en 3 respuestas |
| Lectura del revisor: paso esencial soportado por extractos omitido | 10 respuestas | v2 términos propios: 4 de 10 (más 2 parciales); v2 términos del base: 3 de 10 |

Por categoría, con términos propios, el adaptador supera al base + recuperación en Argo CD (+1,40 en 5 preguntas) y queda por debajo en operaciones de Kafka (-0,35 en 10), Strimzi (-0,35 en 10) y Kubernetes (-0,60 en 5). Estos grupos son pequeños.

En velocidad, sobre 3 preguntas en GPU local con el modelo base más este adaptador e índice congelado: entre 16 y 34 s para los términos de búsqueda, 3,5 a 9 s para la recuperación y 59 a 73 s para la respuesta. El runtime con `--adapter` reprodujo exactamente los términos de búsqueda, los ids de fragmento y las respuestas almacenadas en 3 de 3 casos.

## Requisitos de hardware

- El adaptador requiere el modelo base Qwen/Qwen3.8-27B en precisión bf16 (build `mlx-community/Qwen3.8-27B-bf16`), por lo que la VRAM necesaria es la del modelo base completo, no disponible en la información proporcionada.
- El stack está diseñado para Apple silicon con mlx 0.32.4 y mlx-lm 0.32.2; no se documenta soporte para CUDA ni ROCm.
- No existe build cuantizado, fusionado ni GGUF, por lo que no se puede reducir la huella de memoria mediante cuantización en esta publicación.
- Opciones de despliegue: runtime `kafka_sre_rag` del repositorio kafka-sre-llm con el flag `--adapter`, sobre el wrapper no-thinking generado con `scripts/make_nothink_base.py`.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia medida en GPU local: 16 a 34 s para términos de búsqueda, 3,5 a 9 s para recuperación y 59 a 73 s para la respuesta. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el conjunto de 40 preguntas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kafka-sre-27b-v2-retrieval-only | adaptador de ~467 MB sobre Qwen3.8-27B | no disponible | -0,07 frente a base + recuperación (términos propios); respuestas de 1.208 caracteres de mediana | Apache 2.0 | Hugging Face, solo adaptador MLX |
| Qwen/Qwen3.8-27B + recuperación (recomendación por defecto del proyecto) | no disponible | no disponible | referencia; 4.714 caracteres de mediana; 28 de 40 respuestas con identificadores ausentes | Apache 2.0 (según modelo base) | Hugging Face |
| Qwen/Qwen3.8-27B sin recuperación | no disponible | no disponible | -0,18 frente a v2 sin recuperación en la comparación inversa | Apache 2.0 (según modelo base) | Hugging Face |

No se dispone de datos de otros adaptadores o modelos comparables de dominio SRE en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no mejora la puntuación juzgada frente al modelo base con recuperación; con sus propios términos empata dentro del ruido y con los términos del base empeora (-0,29).
- Omite un paso esencial soportado por los extractos en 3 o 4 de cada 10 respuestas leídas, por encima del umbral del proyecto de como máximo 1 de 10.
- Sin extractos de documentación recuperados en el prompt, su rendimiento cae a -0,18 frente al modelo base; el autor prohíbe ese uso.
- El recuento mecánico de identificadores inventados solo detecta identificadores, no semántica incorrecta; en la lectura del revisor, uno de los tres ítems problemáticos referenciaba un Secret que el propio User Operator genera.
- La reducción de ítems inventados por cada 1.000 tokens (1,27 frente a 0,87) tiene intervalos que se solapan; con diez respuestas no puede demostrarse mayor cuidado por palabra.
- Requiere una plantilla de chat no-thinking; con la plantilla upstream sin modificar el comportamiento no es el medido.
- Depende de una versión concreta del índice de documentación (release v3.0.0) y de versiones fijas de mlx y mlx-lm.
- Solo soporta inglés.
- El conjunto de 40 preguntas se ha reutilizado muchas veces para tomar decisiones y el juez es un modelo, no una persona.
- No medido: build cuantizado o fusionado, clúster en vivo y preguntas fuera de las 40 del conjunto.
- Marcado como experimental y no apto para uso desatendido; cada configuración y comando debe verificarse antes de aplicarse a un clúster.
- Licencia Apache 2.0, que permite uso comercial, pero las limitaciones técnicas desaconsejan su uso en producción sin validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aywengo/kafka-sre-27b-v2-retrieval-only
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Build bf16 del modelo base para MLX: https://huggingface.co/mlx-community/Qwen3.8-27B-bf16
- Repositorio kafka-sre-llm (runtime `kafka_sre_rag`): no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
