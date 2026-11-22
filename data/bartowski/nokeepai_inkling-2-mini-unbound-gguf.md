# bartowski/nokeepai_Inkling-2-Mini-Unbound-GGUF

## Resumen

Inkling-2-Mini-Unbound es un modelo de lenguaje multimodal (texto e imagen) desarrollado por nokeepai, distribuido originalmente en formato safetensors y aquí cuantizado a GGUF por bartowski. Se trata de una variante "abliterated" y "refusal-removed", es decir, una versión en la que se ha eliminado el comportamiento de rechazo ante peticiones consideradas sensibles, lo que la orienta a usos de investigación y a entornos donde se requiere una respuesta sin filtros de seguridad integrados. El modelo declara una arquitectura de tipo Mixture of Experts (MoE) y un total de 26.070.385.152 parámetros en el checkpoint original.

La relevancia de esta ficha concreta radica en la cuantización: bartowski publica un conjunto amplio de ficheros GGUF (desde bf16 hasta IQ3_M) generados con llama.cpp b12600 e imatrix, lo que permite ejecutar un modelo de 26B en hardware de consumo. El pipeline declarado es image-text-to-text, por lo que admite entradas de imagen además de texto, siempre que se utilice el fichero mmproj correspondiente.

La información pública disponible es limitada: no se detallan la longitud de contexto, los idiomas soportados ni los datos de entrenamiento. La licencia es Apache 2.0, lo que facilita el uso comercial, aunque las implicaciones de la eliminación de rechazos deben evaluarse con cuidado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), según etiqueta del autor; detalles de capas no disponibles |
| Parametros totales | 26.070.385.152 (26B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, IQ4_NL, IQ4_XS, Q3_K_L, IQ3_M (entre otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es nokeepai/Inkling-2-Mini-Unbound, del que solo se conoce la etiqueta "moe" y el recuento de parámetros (26B). No se dispone de información sobre el número de expertos, la proporción de parámetros activos por token, el número de capas, la dimensión oculta ni el mecanismo de atención. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación destacable, según la model card, es la naturaleza "abliterated" y "refusal-removed" del checkpoint: se ha intervenido sobre el modelo para eliminar las respuestas de rechazo. La cuantización se ha realizado con llama.cpp b12600 empleando imatrix, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a una cuantización uniforme. El soporte multimodal se activa mediante un fichero mmproj separado, y el formato de prompt incluye un campo "Thinking effort level" que sugiere un modo de razonamiento configurable.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imágenes (image-text-to-text) con el fichero mmproj adecuado.
- Razonamiento con nivel de esfuerzo configurable mediante "Thinking effort level" en el prompt de sistema.
- Soporte de tool calling / function calling mediante declaración de herramientas en XML dentro del mensaje de sistema.
- Formato de prompt estructurado con etiquetas propias (`<|message_system|>`, `<|content_text|>`, `<|end_message|>`, etc.).
- Comportamiento sin rechazos (refusal-removed), orientado a respuestas directas.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un sistema sin rechazos integrados y compararlo con su versión original, útil para analizar sesgos y mecanismos de negativa.
- Generación de código en pipelines internos: el soporte de tool calling y el formato estructurado permiten integrarlo en flujos de CI/CD donde se invocan funciones externas, siempre en entornos controlados.
- Procesamiento de documentos con imágenes: al aceptar entradas de imagen, puede extraer y razonar sobre contenido de capturas, diagramas o formularios en tareas de digitalización.
- Asistente conversacional autoalojado: las cuantizaciones Q4_K_M (18,66 GB) permiten desplegarlo en una estación de trabajo con GPU de 24 GB para conversaciones multi-turno sin depender de APIs externas.
- Generación de contenido creativo sin filtros: para escritura de ficción, guiones o material editorial donde se requiere explorar temas sensibles sin respuestas evasivas.
- Evaluación comparativa de cuantizaciones: el amplio conjunto de ficheros (de bf16 a IQ3_M) sirve para medir la degradación de calidad según la precisión en tareas concretas.
- Prototipado de agentes con herramientas: la declaración de funciones en XML permite construir agentes que consultan APIs (por ejemplo, precios de acciones) y encadenan pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin overhead de contexto): bf16 ≈ 52,23 GB; Q8_0 ≈ 27,82 GB; Q6_K ≈ 24,70 GB; Q5_K_M ≈ 21,22 GB; Q4_K_M ≈ 18,66 GB; Q3_K_L ≈ 15,26 GB; IQ3_M ≈ 15,26 GB.
- GPU recomendadas: H100 o A100 80 GB para bf16 y Q8_0; A100 40 GB o RTX 6000 Ada para Q6_K; RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; GPUs de 16 GB para Q3/IQ3 con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con Q4_K_M o Q5_K_S; en GPUs de 16 GB con Q3_K_L o IQ3_M y ventana de contexto limitada.
- Opciones de despliegue: llama.cpp (versión b12600 o superior), Ollama, LM Studio y cualquier runtime compatible con GGUF; para multimodal se requiere el fichero mmproj.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound (esta ficha) | 26B (MoE) | no disponible | Apache 2.0 | GGUF / safetensors | Multimodal, refusal-removed |
| Modelo base nokeepai/Inkling-2-Mini-Unbound | 26B (MoE) | no disponible | Apache 2.0 | safetensors | Versión original con rechazos |
| Alternativas de 20-30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o inseguro; no es apto para aplicaciones de cara al público sin capas de moderación externas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad.
- Longitud de contexto, idiomas y datos de entrenamiento no documentados, lo que dificulta planificar despliegues multilingües o de contexto largo.
- No se especifican los parámetros activos del MoE, por lo que el coste real por token en inferencia es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el uso de una variante abliterated puede contravenir políticas de plataformas o normativas sectoriales; se recomienda revisión legal.
- El pipeline multimodal requiere el fichero mmproj; sin él, el modelo funciona solo con texto.
- El repositorio ocupa 444,8 GB por la acumulación de cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/nokeepai_Inkling-2-Mini-Unbound-GGUF
- Modelo base: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
