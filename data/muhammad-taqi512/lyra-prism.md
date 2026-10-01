# muhammad-taqi512/LYRA-prism

## Resumen

LYRA-prism es un modelo de generación de texto publicado en HuggingFace por el usuario muhammad-taqi512, distribuido en formato GGUF y pensado para su ejecución con llama.cpp. Se trata de una cuantización agresiva a 2 bits de tipo ternario (los tags del repositorio indican "ternary" y "2-bit") sobre el modelo base Qwen/Qwen3.8-27B, que según los metadatos contiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones). El repositorio declara licencia Apache 2.0, pipeline de text-generation y compatibilidad con CUDA y Metal.

La propuesta del modelo es clara: comprimir un modelo de ~27B hasta un rango que permita inferencia en dispositivo (on-device) o en GPU de consumo, manteniendo la arquitectura del modelo base. Los tags incluyen "hybrid-attention", "prismml" y "bonsai", y el propio autor indica en la model card que el modelo es "igual que" prism-ml/Ternary-Bonsai-2-27B-gguf, lo que sugiere una réplica o derivado de esa cuantización previa más que un desarrollo original.

La relevancia potencial está en el nicho de las cuantizaciones sub-4-bit: si la calidad se mantiene, un 27B ejecutable en 8-12 GB de memoria cambiaría el cálculo de costes frente a alternativas en FP16 que requieren 50 GB o más. Sin embargo, el repositorio no aporta ninguna validación: cero descargas, cero likes, model card de una sola línea, ausencia de benchmarks, de idiomas declarados y de instrucciones de uso. Todo lo anterior obliga a tratar este modelo como un artefacto experimental no verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; los tags indican "hybrid-attention" y el modelo base es Qwen/Qwen3.8-27B |
| Parámetros totales | 26.895.998.464 (≈26,9 B, dato real de safetensors) |
| Parámetros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria a 2 bits según los tags; no se detallan las variantes GGUF concretas (por ejemplo Q2_K, TQ2, etc.) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (library_name: llama.cpp) |

Nota: el tamaño del repositorio es de 68,5 GB, un valor muy superior al que cabría esperar de una cuantización ternaria de 2 bits sobre 26,9 B de parámetros (del orden de 7 GB en pesos). Esta discrepancia no está explicada en la información disponible.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna más allá de las etiquetas del repositorio. El modelo base declarado es Qwen/Qwen3.8-27B, del que este artefacto sería una cuantización, por lo que la arquitectura subyacente (tipo de atención, capas, normalización, tokenizador) corresponde a la del modelo base y no se documenta aquí. El tag "hybrid-attention" apunta a una combinación de mecanismos de atención, pero no se especifica en qué consiste ni cómo afecta a la cuantización.

Tampoco se documenta el proceso de cuantización: no se indica la herramienta empleada (llama.cpp quantize, GPTQ, AWQ u otra), ni el calibrado, ni el número de tokens utilizado para estimar escalas, ni si se aplicaron técnicas de recuperación de calidad posteriores al cuantizado. No hay información sobre datos de entrenamiento, composición del dataset, RLHF, DPO ni sobre ningún proceso de ajuste adicional. El autor se limita a afirmar que el modelo es equivalente a prism-ml/Ternary-Bonsai-2-27B-gguf, sin detallar en qué sentido (mismos ficheros, misma receta, mismos resultados).

## Capacidades

- Generación de texto conversacional: el tag "conversational" y el pipeline "text-generation" indican uso como modelo de chat o completado, sin que se documente la plantilla de prompt recomendada.
- Inferencia en dispositivo: la cuantización a 2 bits y los tags "on-device", "cuda" y "metal" apuntan a ejecución local en GPU de consumo y en Apple Silicon.
- Compatibilidad con llama.cpp: el repositorio está etiquetado con library_name llama.cpp y formato GGUF, por lo que se espera funcionamiento con el ecosistema de llama.cpp (CLI, servidor, bindings) y con frontends compatibles.
- Capacidades heredadas del modelo base: al ser una cuantización de Qwen/Qwen3.8-27B, las capacidades funcionales (código, matemáticas, multilingüismo, tool calling, modo de razonamiento) dependerían de dicho modelo base, pero no están verificadas ni declaradas para este artefacto concreto.
- Tool calling / function calling: no declarado.
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades multilingües: no declaradas; el campo de idiomas está vacío.
- Visión o audio: no declarado (pipeline exclusivamente de texto).

## Casos de uso

- Asistente conversacional local en portátil: si los pesos ternarios ocupan del orden de 7-9 GB, el modelo podría ejecutarse íntegramente en memoria unificada de un Mac con Metal, sin conexión a internet y sin coste por token. Adecuado para entornos con datos sensibles, siempre que la calidad tras el cuantizado a 2 bits sea aceptable, algo no verificado.
- Prototipado en GPU de consumo: una RTX 3060, 4070 o 4090 con 12-24 GB podría alojar los pesos cuantizados y dejar margen para la caché KV, lo que permite iterar sobre prompts y pipelines sin depender de APIs externas.
- Procesamiento por lotes offline: mediante el servidor de llama.cpp se pueden ejecutar tareas de generación masiva (resúmenes, clasificación, reescritura) en una única máquina, priorizando el coste por documento sobre la latencia.
- Investigación sobre cuantización ternaria: el modelo sirve como sujeto de estudio para medir la degradación de calidad de una cuantización a 2 bits frente al modelo base Qwen/Qwen3.8-27B en tareas controladas, siempre que se construya la evaluación desde cero (el repositorio no aporta ninguna).
- Despliegue on-premise con requisitos de privacidad: organizaciones que no pueden enviar datos a servicios en la nube pueden integrar el GGUF en un servidor interno con llama.cpp, asumiendo la ausencia de garantías de calidad del artefacto.
- Integración en aplicaciones de escritorio: frontends tipo Ollama, LM Studio o koboldcpp pueden consumir ficheros GGUF, lo que facilita empaquetar el modelo dentro de un producto de escritorio con requisitos de memoria moderados.
- Pruebas de regresión de infraestructura: útil para validar cadenas de despliegue con llama.cpp (carga de GGUF ternarios, kernels CUDA/Metal, gestión de contexto) antes de comprometer recursos con modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del recuento de parámetros (26,9 B) y del número de bits por peso; no han sido verificadas por el autor ni acompañadas de ningún fichero de configuración publicado.

- VRAM estimada solo para pesos: ≈6,7 GB a 2 bits teóricos (con escalas y metadatos, típicamente 7-9 GB); ≈13,5 GB a 4 bits; ≈26,9 GB a 8 bits; ≈53,8 GB en FP16/BF16.
- Tamaño real del repositorio: 68,5 GB, superior incluso a una copia en FP16 de los pesos declarados, por lo que la cifra de VRAM efectiva no puede deducirse del repositorio.
- Caché KV: no cuantificable sin conocer la longitud de contexto, el número de capas y la configuración de atención; debe sumarse a la memoria de los pesos.
- GPU de consumo: una cuantización de 2 bits de ~27B podría encajar en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070 12 GB) o de 16 GB, y con holgura en 24 GB (RTX 3090, RTX 4090). No hay confirmación de que el artefacto cargue correctamente en ninguna de ellas.
- Apple Silicon: el tag "metal" sugiere compatibilidad con Metal; se necesitaría memoria unificada de al menos 16 GB para pesos más contexto, valor no confirmado.
- GPU de datacenter: A100 40/80 GB y H100 para ejecutar el modelo en precisiones superiores o con contextos largos y mayor concurrencia.
- Opciones de despliegue: llama.cpp (CLI y llama-server), llama-cpp-python, Ollama, LM Studio, koboldcpp y otros frontends compatibles con GGUF. El soporte en vLLM o TGI no está confirmado y requeriría kernels específicos para pesos ternarios.
- Latencia y throughput: no disponibles. Dependerán del backend (CUDA frente a Metal), del tamaño de lote y del contexto, y no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muhammad-taqi512/LYRA-prism | 26,9 B | No disponible | Ternaria 2 bits (GGUF) | Apache 2.0 | Pública, 0 descargas |
| Qwen/Qwen3.8-27B (modelo base) | No disponible en esta búsqueda | No disponible | Pesos originales | No disponible | Pública |
| prism-ml/Ternary-Bonsai-2-27B-gguf | No disponible | No disponible | Ternaria 2 bits (GGUF), según el autor de LYRA-prism | No disponible | Referenciado por el autor |
| Otras cuantizaciones sub-4 bits de modelos de ~27B | Variable | Variable | 2-4 bits | Variable | Ampliamente disponibles |

No se dispone de datos de rendimiento de ninguno de estos modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de validación: cero descargas y cero likes en el momento de la consulta, sin ningún informe externo de funcionamiento correcto.
- Model card prácticamente vacía: una sola línea que afirma que el modelo es "igual que" prism-ml/Ternary-Bonsai-2-27B-gguf, sin especificar la receta de cuantización, la plantilla de prompt, los parámetros de muestreo recomendados ni los ficheros incluidos.
- Discrepancia de tamaño: 68,5 GB de repositorio frente a los ~7 GB esperables en pesos ternarios de 2 bits para 26,9 B de parámetros. Conviene inspeccionar la lista de ficheros antes de descargar nada.
- Riesgo de degradación por cuantización: una cuantización a 2 bits suele afectar de forma notable a razonamiento, matemáticas y código, además de aumentar la tasa de alucinación y de incoherencias en generaciones largas. No hay evaluación que cuantifique este efecto.
- Idiomas no declarados: no puede asumirse un rendimiento correcto en castellano ni en ningún otro idioma concreto.
- Licencia: el repositorio declara Apache 2.0, pero al ser un derivado de Qwen/Qwen3.8-27B, las condiciones del modelo base podrían imponer restricciones adicionales al uso comercial. Debe verificarse la licencia del modelo base antes de cualquier despliegue en producción.
- Atribución y trazabilidad dudosas: el autor afirma que el modelo es igual a un artefacto de otro repositorio (prism-ml/Ternary-Bonsai-2-27B-gguf) sin aclarar la relación exacta ni aportar confirmación del titular original.
- Sesgos: no documentados. Al heredarse del modelo base, se aplican los sesgos de este, que tampoco se describen aquí.
- Sin garantías de compatibilidad: no se confirma que el GGUF cargue en la versión actual de llama.cpp ni que los kernels CUDA/Metal funcionen con pesos ternarios.
- Recomendación: tratar el modelo como experimental, validarlo con un conjunto de pruebas propio antes de cualquier uso y no emplearlo en producción sin una evaluación de calidad previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhammad-taqi512/LYRA-prism
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo al que el autor dice ser equivalente: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Especificación del formato GGUF: https://github.com/ggerganov/ggml/blob/master/docs/gguf.md
- Papers, blogs o demos adicionales: no disponibles.
