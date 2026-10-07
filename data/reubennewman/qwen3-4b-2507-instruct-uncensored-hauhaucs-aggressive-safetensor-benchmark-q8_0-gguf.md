# ReubenNewman/Qwen3-4B-2507-Instruct-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark-Q8_0-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF con cuantización Q8_0 del modelo `DreamFast/Qwen3-4B-2507-Instruct-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark`, publicada por el usuario ReubenNewman. Se trata, por tanto, de un artefacto de distribución más que de un entrenamiento original: el trabajo de este repositorio consiste en convertir los pesos en safetensors del modelo base a GGUF mediante `llama.cpp` y el espacio `gguf-my-repo` de ggml.ai, empaquetándolos en un único fichero de aproximadamente 4,3 GB.

El modelo subyacente es un derivado de la familia Qwen3, concretamente de la variante de 4B identificada como "2507" (la revisión de julio de 2025 de Qwen3-4B-Instruct), sobre la que se han aplicado técnicas de "uncensoring" y "abliteration" para eliminar o atenuar las direcciones de rechazo del modelo alineado. El resultado es un modelo de 4.022.468.096 parámetros (unos 4,02 mil millones) orientado a generación de texto conversacional sin las restricciones típicas de un modelo instruct alineado, con licencia Apache 2.0 y soporte declarado de inglés y chino.

Su relevancia práctica es acotada pero clara: permite ejecutar localmente, con `llama.cpp` o cualquier runtime compatible con GGUF, un modelo de 4B sin censura y con buena relación calidad/tamaño en hardware de consumo. Ahora bien, la model card no aporta detalles sobre el proceso de entrenamiento, la longitud de contexto efectiva tras el abliteration ni resultados de benchmarks, y el repositorio no tiene descargas ni valoraciones, por lo que cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de la familia Qwen3 (no se detallan en la model card las capas, el tipo de atención ni el uso de GQA) |
| Parámetros totales | 4.022.468.096 (~4,02 mil millones), dato de safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada (la model card no la especifica; el ejemplo de `llama-server` usa `-c 2048`, que es solo un valor de ejemplo, no la ventana del modelo) |
| Tipos de cuantización | Únicamente Q8_0 en este repositorio (GGUF). El repositorio base ofrece safetensors sin cuantizar |
| Idiomas soportados | Inglés (en) y chino (zh), según los metadatos de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) en este repositorio; safetensors en el repositorio base `DreamFast/...` |
| Tamaño del repositorio | 4,3 GB |
| Librería declarada | transformers (etiqueta del repositorio); la inferencia documentada es vía llama.cpp |
| Pipeline | text-generation |
| Etiquetas relevantes | uncensored, abliterated, qwen3, safetensors, llama-cpp, gguf-my-repo |
| Fecha de creación | 2026-10-07 según metadatos del repositorio |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo. Lo que se puede afirmar con certeza es la cadena de derivación: el repositorio base es `DreamFast/Qwen3-4B-2507-Instruct-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark`, y este repositorio es una conversión a GGUF Q8_0 de ese checkpoint realizada con `llama.cpp` a través del espacio `GGUF-my-repo` de ggml.ai. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineamiento (de hecho, las etiquetas "uncensored" y "abliterated" sugieren lo contrario: la eliminación o atenuación de las direcciones de rechazo aprendidas durante el alineamiento).

Por el nombre del checkpoint base puede inferirse que parte de Qwen3-4B en su revisión "2507" (la actualización de julio de 2025 de la serie Qwen3-Instruct), un transformer decoder-only denso de unos 4.000 millones de parámetros. Sin embargo, ni la model card de este repositorio ni la información proporcionada detallan la arquitectura interna (número de capas, cabezas de atención, uso de Grouped Query Attention, tipo de activación o tokenizador), ni las modificaciones concretas aplicadas en el proceso de abliteration (por ejemplo, si se intervinieron capas específicas, si se reentrenó tras la intervención o si se ajustó el chat template). El sufijo "Benchmark" en el nombre del modelo base tampoco va acompañado de ninguna tabla de resultados publicada en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés y chino: es la función principal declarada por el pipeline `text-generation` y el formato `conversational`.
- Respuestas sin rechazo: el modelo está etiquetado como "uncensored" y "abliterated", lo que en la práctica implica que tiende a no negarse a responder ante peticiones que un modelo instruct alineado rechazaría.
- Razonamiento y conocimiento general propios de un modelo de 4B: capacidades heredadas de Qwen3-4B-Instruct-2507, sin cuantificar en la información disponible.
- Generación de código y matemáticas: no se documenta explícitamente en la model card; no disponible como capacidad verificada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" explícito: no disponible en la información proporcionada (algunas variantes de Qwen3 lo incorporan, pero no se confirma aquí).
- Ejecución local offline: al distribuirse en GGUF Q8_0, es compatible con `llama.cpp` y runtimes derivados, lo que permite despliegue sin conexión.

## Casos de uso

- Investigación sobre alineamiento y rechazo: el modelo sirve como objeto de estudio para medir cómo cambia la tasa de rechazo y la calidad de las respuestas tras aplicar abliteration sobre un instruct alineado, comparándolo con el Qwen3-4B-Instruct-2507 original.
- Red-teaming y evaluación de seguridad: permite generar de forma controlada respuestas que un modelo alineado bloquearía, lo que resulta útil para construir conjuntos de prueba adversariales y validar clasificadores de contenido.
- Generación de datos sintéticos sin filtrado previo: en pipelines de aumento de datos donde se necesita diversidad de respuestas y el filtro de rechazo del modelo base sesgaría la distribución generada.
- Escritura creativa y ficción: narrativa con temáticas adultas, violencia o conflictos morales donde los modelos alineados suelen introducir evasivas o cambiar de tema; el modelo mantiene la coherencia del relato sin romper la escena.
- Despliegue local en estaciones de trabajo sin GPU dedicada: con un fichero GGUF de ~4,3 GB y cuantización Q8_0, es viable ejecutarlo en CPU con `llama.cpp` para prototipos, tareas de extracción o asistentes personales offline.
- Role-play y simulación de personajes: diálogo multi-turno manteniendo una persona concreta sin las restricciones de tono que impone un instruct alineado, útil en prototipos de videojuegos o entornos de formación.
- Evaluación comparativa de cuantizaciones: al existir el checkpoint en safetensors y esta conversión Q8_0, permite medir la degradación introducida por la cuantización de 8 bits en tareas concretas.
- Base para fine-tuning posterior: los pesos en safetensors del repositorio upstream pueden usarse como punto de partida de un ajuste supervisado o LoRA cuando se quiere partir de un modelo sin sesgo de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El nombre del checkpoint base incluye la palabra "Benchmark", pero ni la model card de este repositorio ni la información proporcionada incluyen tablas con MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, ni comparaciones numéricas con el Qwen3-4B original. Cualquier cifra de rendimiento debería obtenerse midiendo el modelo directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q8_0 ocupa aproximadamente 4,3 GB, por lo que se necesitan en torno a 5-6 GB de memoria considerando el contexto y los buffers de `llama.cpp`; con contextos largos, el KV cache puede añadir varios GB adicionales.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070) puede ejecutarlo con margen; con 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super) se dispone de espacio para contextos amplios; GPU de datacenter (A100, H100) no aportan ventaja relevante a este tamaño de modelo salvo por throughput agregado.
- Compatibilidad con GPU de consumo: sí. Es ejecutable en GPU de gama media y también en CPU (con llama.cpp), aunque la velocidad en CPU será notablemente inferior.
- Opciones de despliegue: `llama.cpp` (`llama-cli` y `llama-server`, tal como documenta la model card), Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no están documentados para este repositorio, ya que requieren normalmente pesos en safetensors (disponibles en el repositorio base, no aquí).
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReubenNewman/Qwen3-4B-2507-Instruct-Uncensored-...-Q8_0-GGUF | 4,02 mil millones | No disponible | Apache 2.0 | GGUF Q8_0 | Este repositorio; sin benchmarks ni descargas |
| DreamFast/Qwen3-4B-2507-Instruct-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark | No disponible en la información proporcionada | No disponible | Apache 2.0 (según el modelo derivado) | safetensors | Checkpoint de origen; mismo proceso de uncensoring |
| Qwen3-4B-Instruct-2507 (modelo original de la familia) | ~4 mil millones (no confirmado en la información disponible) | No disponible | Apache 2.0 (no confirmado en la información disponible) | safetensors | Versión alineada; sirve como referencia de comparación, pero sus cifras no se han verificado aquí |
| Alternativas de 3B-4B de otros fabricantes (Llama 3.2 3B Instruct, Gemma 3 4B IT, Phi-4-mini) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Datos no disponibles en la información proporcionada; requieren verificación en sus propias fichas |

## Limitaciones y advertencias

- Ausencia de alineamiento: las etiquetas "uncensored" y "abliterated" indican que se han eliminado o debilitado los mecanismos de rechazo. El modelo puede generar contenido dañino, ilegal, violento, sexual explícito o discurso de odio si se le solicita, y no incorpora salvaguardas de serie.
- Riesgo de alucinación: no hay datos sobre la tasa de alucinación. Al ser un modelo de 4B sin verificación factual, es previsible que invente datos, referencias y citas, especialmente en dominios especializados.
- Degradación por abliteration: las técnicas de eliminación de direcciones de rechazo suelen provocar pérdida de coherencia, mayor repetición y deterioro en tareas de razonamiento. No se han publicado evaluaciones que cuantifiquen ese impacto en este checkpoint.
- Contexto no documentado: la model card no declara la longitud de contexto soportada. El valor `-c 2048` del ejemplo de `llama-server` es un parámetro de ejemplo y no debe interpretarse como la ventana del modelo. Es necesario verificar experimentalmente el contexto real antes de diseñar aplicaciones con documentos largos.
- Idiomas limitados: solo se declaran inglés y chino. El rendimiento en castellano no está documentado y probablemente sea inferior al de modelos con cobertura multilingüe explícita.
- Procedencia de la conversión: el GGUF se ha generado de forma automática con `gguf-my-repo`. No se documenta validación de la calidad del chat template, del tokenizador BPE ni de la fidelidad numérica respecto a los pesos originales en safetensors.
- Trazabilidad incompleta: no se detalla qué dataset, qué método de abliteration ni qué hiperparámetros se usaron en el modelo base; tampoco hay papers, repos ni informes técnicos enlazados.
- Señales de adopción nulas: 0 descargas y 0 likes en el momento de la consulta. No existe validación por parte de la comunidad.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial. No obstante, conviene verificar la licencia del checkpoint base y de Qwen3-4B, así como las condiciones de uso aceptable del fabricante original, antes de desplegarlo en un producto. La responsabilidad legal por el contenido generado recae íntegramente en el usuario.
- Producción: no se recomienda su uso directo en aplicaciones orientadas a público sin una capa de moderación externa, y sin haber medido previamente latencia, throughput y calidad en el hardware y el dominio concretos.

## Enlaces

- Repositorio de este modelo (GGUF Q8_0): https://huggingface.co/ReubenNewman/Qwen3-4B-2507-Instruct-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark-Q8_0-GGUF
- Modelo base (safetensors): https://huggingface.co/DreamFast/Qwen3-4B-2507-Instruct-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
