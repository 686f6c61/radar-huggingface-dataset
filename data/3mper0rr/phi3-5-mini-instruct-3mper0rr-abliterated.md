# 3MPER0RR/Phi3.5-mini-instruct-3MPER0RR-abliterated

## Resumen
Phi3.5-mini-instruct-3MPER0RR-abliterated es un ajuste del modelo Phi-3.5-mini-instruct de Microsoft, pasado por una versión sin censura de SicariusSicariiStuff y sometido después a un proceso de abliteration multi-ronda por parte de 3MPER0RR. El resultado es un modelo de 3.821.079.552 parámetros (3,82 B) orientado a generación de texto conversacional, publicado en HuggingFace con licencia Apache-2.0 y pesos en safetensors.

La relevancia de esta ficha es acotada: se trata de un experimento de investigación con 0 descargas y 0 likes en el momento de la consulta, sin model card detallada ni benchmarks. La abliteration busca reducir el comportamiento de rechazo del modelo base, lo que lo hace interesante para estudiar alineamiento y seguridad, pero también lo convierte en una opción arriesgada para producción sin una evaluación propia.

No se documentan la longitud de contexto, los idiomas soportados, los tipos de cuantización ni los datos exactos de entrenamiento. Cualquier uso que dependa de esas especificaciones debe verificarse directamente con el modelo o con el repositorio base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3.5; tag phi3) |
| Parámetros totales | 3.821.079.552 (3,82 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; el repositorio solo contiene safetensors y no se confirma GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | SicariusSicariiStuff/Phi-3.5-mini-instruct_Uncensored, finetune de microsoft/Phi-3.5-mini-instruct |
| Tag custom_code | Sí; requiere trust_remote_code |
| Tamaño del repositorio | 7,6 GB |

## Arquitectura y entrenamiento
La arquitectura es la de Phi-3.5-mini: un transformer decoder-only con 3,82 B de parámetros. El autor no detalla capas, mecanismo de atención, tokenizador ni ventana de contexto; el tag phi3 y el modelo base confirman la familia, pero no hay ficha técnica propia. El proceso aplicado es una abliteration multi-ronda sobre SicariusSicariiStuff/Phi-3.5-mini-instruct_Uncensored, que a su vez es un finetune sin censura de microsoft/Phi-3.5-mini-instruct.

No se especifican el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las rondas exactas de abliteration. La innovación declarada es únicamente el proceso de abliteration multi-ronda; no hay datos sobre decodificación especulativa, atención lineal ni otras optimizaciones. El tag custom_code indica que la carga requiere código remoto y conviene revisarlo antes de ejecutarlo.

## Capacidades
- Generación de texto y conversación multi-turno: hereda la funcionalidad de instrucciones del modelo base, sin evaluación publicada.
- Respuestas con menor tasa de rechazo: la abliteration modifica direcciones de activación asociadas a negativas; el autor no publica métricas.
- Tool calling / function calling: no confirmado en la información disponible.
- Agentes y razonamiento multi-paso: no confirmado; no hay benchmarks de agentes.
- Capacidades multilingües: no disponibles; no se documentan idiomas.
- Código, matemáticas y razonamiento: no evaluado; no se puede afirmar rendimiento.
- Vision, audio o thinking mode: no disponible.
- Carga con `trust_remote_code=True` por el tag custom_code.
- Pipeline text-generation y formato conversational.

## Casos de uso
- Prototipado local de asistentes conversacionales: con 3,82 B de parámetros y pesos FP16 de unos 7,6 GB, puede ejecutarse en una GPU de 12 GB para pruebas internas con Transformers y `trust_remote_code=True`.
- Investigación en alineamiento y seguridad: permite comparar la tasa de rechazo y el comportamiento del modelo frente al Phi-3.5-mini-instruct original en un entorno controlado.
- Red teaming de filtros de seguridad: puede generar respuestas a indicaciones adversarias para evaluar moderadores automáticos, siempre con revisión humana y fines de investigación.
- Generación de ficción y narrativa con temas sensibles: la abliteration reduce los rechazos del base, lo que puede facilitar guiones o relatos con contenido delicado; requiere revisión editorial y filtros posteriores.
- Aumento de datos sintéticos: útil para crear diálogos o ejemplos en dominios donde el modelo base rechaza la petición; los datos deben filtrarse y validarse antes de usarlos.
- Evaluación de robustez de clasificadores de contenido: sus salidas pueden servir como corpus de prueba para medir falsos negativos y falsos positivos en sistemas de moderación.
- Despliegue en estación de trabajo con una sola GPU: adecuado para herramientas internas de generación de texto donde no se requiere alta concurrencia ni latencia mínima.
- Docencia y demostraciones de abliteration: su tamaño moderado y su licencia Apache-2.0 facilitan experimentos reproducibles en laboratorio.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Evaluación de refusal/seguridad | No disponible |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Pesos en FP16/BF16: aproximadamente 7,64 GB; con overhead de inferencia y contexto corto, estimación de 9-11 GB de VRAM. No son mediciones del autor, sino cálculos a partir de 3,82 B de parámetros.
- Pesos en INT8: aproximadamente 3,82 GB; estimación de 5-6 GB de VRAM.
- Pesos en INT4: aproximadamente 1,91 GB; estimación de 3-4 GB de VRAM, pero no hay versiones GGUF oficiales publicadas.
- Pesos en FP32: aproximadamente 15,28 GB; no recomendado para GPU de consumo.
- GPU recomendadas para FP16: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 4090 24 GB; para servicio, A100 o H100.
- Cabe en GPU de consumo: sí, con 12 GB o más en FP16; en tarjetas de 8 GB haría falta cuantización, que no está publicada.
- Opciones de despliegue: Transformers, vLLM y TGI con `trust_remote_code=True`; llama.cpp u Ollama requerirían una conversión a GGUF no publicada.
- Latencia y throughput: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 3,82 B | No disponible | Apache-2.0 | No disponible | HuggingFace, safetensors |
| microsoft/Phi-3.5-mini-instruct | 3,82 B (estimado por herencia) | No disponible | No disponible | No disponible | HuggingFace, modelo base original |
| SicariusSicariiStuff/Phi-3.5-mini-instruct_Uncensored | 3,82 B (estimado por herencia) | No disponible | No disponible | No disponible | HuggingFace, finetune sin censura |

## Limitaciones y advertencias
- La abliteration no garantiza calidad ni seguridad; puede aumentar la probabilidad de generar contenido dañino, sesgado o ilegal.
- No hay benchmarks ni evaluación de refusal publicados; no se puede comparar su rendimiento con el modelo base.
- Riesgo de alucinación típico de un modelo de 3,8 B, especialmente en dominios especializados.
- Idiomas y contexto no documentados; no se puede garantizar un buen rendimiento en español ni en conversaciones largas.
- La licencia declarada es Apache-2.0, pero el proceso de abliteration y los datos del finetune no se documentan; conviene revisar las obligaciones de los modelos base.
- El tag custom_code requiere `trust_remote_code=True`; ejecutar código remoto es un riesgo de seguridad que debe revisarse.
- No hay cuantizaciones oficiales; desplegar en GPU de 8 GB puede requerir una conversión propia.
- 0 descargas y 0 likes indican ausencia de validación comunitaria.
- No debe usarse en producción sin una evaluación propia de calidad, sesgos y seguridad.

## Enlaces
- https://huggingface.co/3MPER0RR/Phi3.5-mini-instruct-3MPER0RR-abliterated
- https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- https://huggingface.co/SicariusSicariiStuff/Phi-3.5-mini-instruct_Uncensored
- https://huggingface.co/3MPER0RR
- No se han encontrado enlaces relevantes en los resultados de búsqueda web proporcionados.
