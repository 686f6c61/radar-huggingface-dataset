# mradermacher/Q2.5-ColdBrew-14B-Base-GGUF

## Resumen

Q2.5-ColdBrew-14B-Base-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo base SvalTek/Q2.5-ColdBrew-14B-Base, publicada por mradermacher. El modelo original parte de la familia Qwen2.5 y cuenta con 14.765.947.904 parámetros totales (aproximadamente 14,8 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio pensados para despliegue en una sola GPU o en hardware consumer con cuantización agresiva. Esta versión GGUF no introduce cambios en los pesos más allá de la cuantización: es un derivado directo del checkpoint base, sin ajuste fino adicional por parte del cuantizador.

La relevancia de esta ficha radica en que el repositorio ofrece una batería completa de cuantizaciones (desde Q2_K de 5,9 GB hasta Q8_0 de 15,8 GB) que permiten ejecutar el modelo en llama.cpp, Ollama y otros runners compatibles con GGUF, algo imposible con los pesos originales en safetensors. El modelo está etiquetado como "base", lo que significa que no ha pasado por un proceso de alineación conversacional (RLHF/DPO) y está pensado para ajuste fino posterior o para generación de texto sin formato de chat.

La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. El repositorio tiene 129 descargas y 1 like en el momento de la consulta, lo que indica una adopción todavía muy limitada dentro del ecosistema. La información pública sobre arquitectura interna, contexto y datos de entrenamiento del modelo original no está disponible en la model card proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de SvalTek/Q2.5-ColdBrew-14B-Base, familia Qwen2.5) |
| Parámetros totales | 14.765.947.904 (14,8 B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base SvalTek/Q2.5-ColdBrew-14B-Base pertenece a la familia Qwen2.5, según las etiquetas del repositorio (`qwen2`, `unsloth`). No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre la composición del dataset de entrenamiento. Tampoco se documenta si el modelo original pasó por fases de preentrenamiento adicional, ajuste supervisado o alineación por preferencias.

La contribución técnica de este repositorio es exclusivamente la cuantización: mradermacher aplica cuantizaciones estáticas (no imatrix ni ponderadas, según indica la propia model card) sobre el checkpoint en safetensors y publica los ficheros GGUF resultantes. No hay innovaciones arquitectónicas propias de esta versión; cualquier innovación (atención, tokenizador, decodificación) proviene del modelo base y no está documentada aquí.

## Capacidades

- Generación de texto autoregresiva en inglés, al ser un modelo base sin alineación conversacional.
- Punto de partida para ajuste fino supervisado (SFT) o alineación por preferencias (DPO/RLHF) por parte del usuario.
- Inferencia en CPU y GPU mediante llama.cpp y runners compatibles con GGUF.
- Ejecución en hardware consumer gracias a las cuantizaciones de 4 y 5 bits (8,7-10,6 GB).
- Compatibilidad declarada con text-generation-inference y transformers a través del ecosistema GGUF.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Ajuste fino específico de dominio: al ser un modelo base, se puede partir de los pesos en safetensors (o descomprimir desde GGUF) para entrenar tareas concretas como clasificación de texto, extracción de entidades o generación de resúmenes técnicos en inglés.
- Generación de texto en local sin GPU dedicada: la cuantización Q4_K_M (9,1 GB) permite ejecutar el modelo en un portátil con 16 GB de RAM mediante llama.cpp, útil para prototipos y pruebas offline.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes (Q2_K a Q8_0) para medir la degradación de perplejidad y calidad según el nivel de compresión en un mismo checkpoint.
- Servicio de completado de texto en pipelines de CI: integrable vía llama.cpp o TGI en flujos que necesiten generar documentación o comentarios de código en inglés sin depender de APIs externas.
- Investigación sobre modelos base de 14 B: útil como referencia para estudiar el comportamiento de modelos no alineados frente a sus versiones instruct.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso en productos comerciales internos sin obligaciones de atribución copyleft.
- Reproducibilidad de experimentos: el repositorio fija versiones concretas de cuantización, lo que permite replicar resultados con un binario GGUF determinado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q3_K_M ~7,4 GB; Q3_K_L ~8,0 GB; IQ4_XS ~8,3 GB; Q4_K_S ~8,7 GB; Q4_K_M ~9,1 GB; Q5_K_S ~10,4 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB.
- GPU recomendadas: para Q8_0, una RTX 4090 (24 GB) o A100/H100 con margen; para Q4_K_M, una RTX 3060 de 12 GB o RTX 4070 es suficiente.
- Cabe en GPU consumer: sí, en modelos con 12 GB o más usando cuantizaciones de 4 bits; en 8 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (según tags), transformers con soporte GGUF; no se documenta vLLM en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Q2.5-ColdBrew-14B-Base-GGUF (este) | 14,8 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas, solo inglés |
| Modelo base SvalTek/Q2.5-ColdBrew-14B-Base | 14,8 B | no disponible | Apache 2.0 | safetensors | Checkpoint original sin cuantizar |
| Familia Qwen2.5 (14 B) | ~14,8 B | no disponible en esta ficha | Apache 2.0 (según familia) | safetensors/GGUF | Referencia de arquitectura; datos de contexto no verificados aquí |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no está optimizado para diálogo ni sigue instrucciones de forma fiable; requiere prompting cuidadoso o ajuste fino.
- Solo inglés declarado: el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin RLHF, la probabilidad de generar contenido plausible pero falso puede ser mayor en tareas abiertas.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo puede reflejar sesgos presentes en los datos de preentrenamiento del modelo original.
- Contexto: no disponible, por lo que no se puede garantizar el manejo de conversaciones o documentos largos.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; la propia model card marca Q3_K_M como "lower quality".
- No hay cuantizaciones imatrix/ponderadas publicadas por el autor en el momento de la consulta.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las condiciones del modelo base original.
- Repositorio con muy poca tracción (129 descargas, 1 like): menor probabilidad de soporte comunitario o corrección de errores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Q2.5-ColdBrew-14B-Base-GGUF
- Modelo base: https://huggingface.co/SvalTek/Q2.5-ColdBrew-14B-Base
- Página de descargas del cuantizador: https://hf.tst.eu/model#Q2.5-ColdBrew-14B-Base-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
