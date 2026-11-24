# bottles1/DeciLM-6B-Instruct-Q4_K_M

## Resumen

DeciLM-6B-Instruct-Q4_K_M es una conversión a formato GGUF con cuantización Q4_K_M del modelo DeciLM-6B-Instruct, desarrollado originalmente por Deci AI (actualmente parte de NVIDIA). Este repositorio, publicado por el usuario bottles1, no introduce ningún fine-tuning ni modificación de la arquitectura: se limita a empaquetar los pesos originales en un formato optimizado para inferencia en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles.

El modelo base es un transformer decoder-only de aproximadamente 6.000 millones de parámetros, diseñado por Deci para ofrecer un equilibrio entre calidad de instrucción y eficiencia de despliegue. La versión Instruct incorpora ajuste supervisado y preferencias para seguir instrucciones conversacionales, lo que lo hace apto para asistentes, generación de código y tareas de razonamiento de complejidad media.

La relevancia de esta ficha radica en que la cuantización Q4_K_M reduce el peso en disco y en memoria hasta aproximadamente 4 bits por parámetro, facilitando su ejecución en hardware modesto sin necesidad de GPUs de datacenter. No obstante, al tratarse de una conversión no oficial, el soporte técnico, la validación de calidad y las garantías de integridad recaen sobre el publicador del repositorio, no sobre Deci.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (DeciLM), según la model card del repositorio base |
| Parametros totales | ~6.000 millones (modelo base DeciLM-6B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repositorio base admite otras cuantizaciones, no detalladas aquí |
| Idiomas soportados | no disponible |
| Licencia | decilm (licencia propia de Deci, enlazada en el repositorio base) |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo subyacente es DeciLM-6B-Instruct, un transformer decoder-only de aproximadamente 6.000 millones de parámetros. La model card del repositorio de conversión no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se especifican innovaciones técnicas concretas más allá de la arquitectura DeciLM original.

Esta conversión concreta no modifica la arquitectura ni los pesos: utiliza las herramientas oficiales de llama.cpp para transformar los pesos originales a formato GGUF con cuantización Q4_K_M. El proceso de cuantización introduce pérdida de precisión respecto al modelo en punto flotante, cuyo impacto exacto en calidad no está documentado en la información disponible.

## Capacidades

- Generación de texto conversacional en formato instrucción, según la naturaleza Instruct del modelo base.
- Seguimiento de instrucciones multi-turno, presumiblemente con soporte de plantillas de chat del modelo original (no detalladas en la información disponible).
- Generación de código y tareas de razonamiento de complejidad media, coherente con el tamaño del modelo.
- Ejecución local en CPU y GPU de consumo gracias al formato GGUF y a la cuantización Q4_K_M.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el modelo es solo texto según la información disponible).

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un portátil o estación de trabajo con llama.cpp u Ollama para mantener conversaciones multi-turno sin conexión a internet, aprovechando la cuantización Q4_K_M para reducir requisitos de memoria.
- Prototipado rápido de aplicaciones de IA generativa: al ser un GGUF de ~4 bits, permite iterar sobre prompts y flujos conversacionales en hardware modesto antes de migrar a un modelo mayor o a un despliegue en servidor.
- Generación de código en entornos con restricciones de privacidad: útil en equipos que no pueden enviar código a APIs externas, ejecutando el modelo en local para autocompletado, explicación de fragmentos o generación de tests.
- Procesamiento de texto por lotes en CPU: tareas como resumen, clasificación o reescritura de documentos pueden ejecutarse en servidores sin GPU usando llama.cpp, con throughput moderado y coste energético bajo.
- Educación y experimentación: sirve como modelo de referencia para estudiar cuantización GGUF, comparar calidad entre precisiones y entender el impacto del formato en el rendimiento.
- Integración en aplicaciones de escritorio: herramientas como LM Studio, Jan o interfaces basadas en llama.cpp pueden cargar este GGUF para ofrecer asistencia contextual dentro de aplicaciones ofimáticas o de notas.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de Q4_K_M frente a pesos completos en tareas concretas del dominio propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB para los pesos Q4_K_M, más overhead de contexto y caché KV (dependiente de la longitud de contexto configurada).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para carga completa (RTX 3060, RTX 4060, RTX 4090, A100, H100); también puede ejecutarse en GPUs con menos memoria descargando capas a CPU mediante llama.cpp.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM; en GPUs con 4 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, y servidores compatibles con GGUF (llama-cpp-python); vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeciLM-6B-Instruct-Q4_K_M (este) | ~6B | no disponible | GGUF Q4_K_M | decilm | Hugging Face (repo no oficial) |
| DeciLM-6B-Instruct (original) | ~6B | no disponible | safetensors | decilm | Hugging Face (Deci) |
| Mistral-7B-Instruct (cuantizado) | ~7B | 32K (según versión) | GGUF, safetensors | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct (cuantizado) | ~8B | 128K | GGUF, safetensors | Llama 3.1 Community License | Hugging Face / Meta |

La comparativa se ofrece a título orientativo: no se dispone de datos de benchmarks de este repositorio que permitan una comparación cuantitativa de calidad frente a las alternativas.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio no está afiliado a Deci; la integridad y fidelidad de la conversión no están avaladas por el autor original.
- Licencia "decilm": es una licencia propia con condiciones específicas; es imprescindible revisar el LICENSE.md del modelo base antes de cualquier uso comercial o redistribución.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo original en punto flotante; el impacto exacto no está documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en tareas de razonamiento complejo o conocimiento factual actualizado.
- Idiomas soportados no especificados: el rendimiento fuera del inglés puede degradarse sin garantías documentadas.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas de contexto largo sin verificarla empíricamente.
- Ausencia de benchmarks publicados en este repositorio: no hay evidencia cuantitativa de calidad para este artefacto concreto.
- Repositorio con cero descargas y cero likes: sin validación comunitaria; conviene verificar checksums y procedencia antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/bottles1/DeciLM-6B-Instruct-Q4_K_M
- Modelo base original: https://huggingface.co/Deci/DeciLM-6b-instruct
- Licencia del modelo base: https://huggingface.co/Deci/DeciLM-6b-instruct/blob/main/LICENSE.md
