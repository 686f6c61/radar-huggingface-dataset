# sid42hf/smollm2-360m-sft3-epoch3

## Resumen

`sid42hf/smollm2-360m-sft3-epoch3` es un ajuste fino supervisado de pesos completos (full-weight SFT) sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`, publicado por el usuario sid42hf. El repositorio lo etiqueta explícitamente como asistente de portfolio personal ("personal-portfolio-assistant") y conversacional, y el nombre del checkpoint indica un entrenamiento de 3 épocas. No es un modelo nuevo desde cero, sino una adaptación de dominio de un modelo pequeño ya instruido.

El modelo tiene 361.821.120 parámetros (unos 362 M), lo que lo sitúa en la gama de modelos desplegables en CPU, navegador o dispositivos de borde. Los pesos se distribuyen en formato safetensors para la librería transformers, con un repositorio de 1,4 GB, coherente con pesos almacenados en FP32. El único idioma declarado es el inglés.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de adaptación barata de un modelo pequeño a una tarea concreta con SFT de pesos completos; por otro, es un caso claro de ficha incompleta (sin licencia declarada, sin datos de entrenamiento documentados, sin benchmarks y con cero descargas), lo que obliga a evaluarlo con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (etiqueta `llama` en el repositorio) |
| Parámetros totales | 361.821.120 (≈362 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; no se publican pesos cuantizados. El repositorio (1,4 GB) es coherente con pesos en FP32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible: no declarada en el repositorio |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | HuggingFaceTB/SmolLM2-360M-Instruct |
| Tipo de ajuste | Full-weight fine-tuning, supervised fine-tuning |
| Pipeline | text-generation |
| Tamaño del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo Llama, con el tokenizador y la configuración asociados a SmolLM2-360M-Instruct. El repositorio no documenta ninguna modificación estructural, ni cambios de ventana de contexto, ni estrategias de atención alternativas; tampoco se publican detalles sobre el dataset de ajuste, su composición, su tamaño o el proceso de anotación.

El entrenamiento declarado es un SFT de pesos completos (no LoRA ni adaptadores) durante 3 épocas, según se deduce del nombre del checkpoint y de las etiquetas del repositorio. No hay información sobre hiperparámetros, régimen de precisión, composición del dataset, ni sobre si se aplicaron etapas posteriores de alineación (RLHF, DPO) más allá del ajuste supervisado. Tampoco se documenta ninguna innovación técnica propia: se trata de un ajuste de dominio sobre un modelo preentrenado e instruido, orientado a un caso de uso muy concreto.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruido.
- Respuesta a preguntas de dominio restringido, presumiblemente sobre el contenido de un portfolio personal (proyectos, trayectoria, contacto), según la etiqueta `personal-portfolio-assistant`.
- Generación de borradores de texto corto (descripciones, resúmenes, respuestas breves), dentro de los límites de un modelo de 362 M de parámetros.
- Soporte de tool calling / function calling: no documentado y no verificable con la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no. Solo se declara inglés.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Razonamiento complejo, matemáticas y código: no documentados; un modelo de este tamaño tiene capacidad limitada para estas tareas incluso en su versión base.

## Casos de uso

- Asistente de portfolio personal con recuperación aumentada (RAG): indexar el CV, los proyectos y los textos del portfolio en una base vectorial y usar el modelo para redactar respuestas a visitantes. Su tamaño (362 M, ~0,7 GB en FP16) permite servirlo en la misma máquina que la base de datos sin GPU dedicada.
- Chatbot de preguntas frecuentes en una web personal: respuestas cortas sobre servicios, disponibilidad o contacto, con latencia muy baja y coste de inferencia mínimo. Adecuado por su naturaleza conversacional y su dominio estrecho.
- Clasificación y extracción de información en formularios de contacto: reformulando la tarea como generación (por ejemplo, etiquetar el motivo del mensaje o extraer un correo), se puede usar como filtro previo antes de un modelo mayor.
- Generación de borradores de descripciones de proyectos en inglés a partir de una lista de viñetas técnicas, como paso inicial que después revisa una persona.
- Despliegue local con requisitos de privacidad: al caber en CPU y en dispositivos de borde, permite procesar texto sin enviarlo a servicios externos, útil cuando los datos del portfolio o de los visitantes no deben salir del equipo.
- Enrutado barato en un sistema multi-modelo: usarlo como primer clasificador que decide si una consulta necesita un modelo mayor, reduciendo el coste medio por petición.
- Plantilla reproducible de SFT de pesos completos: el repositorio sirve como referencia práctica para comparar estrategias de ajuste (por ejemplo, ablaciones de número de épocas) sobre un modelo base pequeño.
- Prototipado y docencia: ejemplo de adaptación de dominio con un único checkpoint y un coste de entrenamiento reducido, útil en cursos o talleres de fine-tuning.

En todos los casos hay que tener en cuenta que no se publican pesos cuantizados (GGUF, ONNX), por lo que el despliegue fuera de `transformers` exige una conversión propia, y que la licencia no está declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra suite, ni comparaciones con el modelo base, por lo que no es posible cuantificar la ganancia (o la pérdida) obtenida con el ajuste de 3 épocas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados del recuento de parámetros):
  - FP32: ~1,45 GB de pesos; ~2 GB con activaciones y caché KV.
  - FP16/BF16: ~0,72 GB de pesos; ~1,5 GB en total con contexto moderado.
  - INT8: ~0,36 GB de pesos.
  - INT4: ~0,18-0,25 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, T4, etc.). Modelos como A100 o H100 no aportan ventaja relevante por tamaño, salvo en escenarios de altísima concurrencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos años, e incluso en CPU, Raspberry Pi o entornos de navegador tras conversión.
- Opciones de despliegue: `transformers` de forma nativa; text-generation-inference está declarado como compatible por las etiquetas del repositorio; vLLM, llama.cpp, Ollama y TGI requerirían, en el caso de llama.cpp/Ollama, una conversión a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni datos de hardware empleado en la publicación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smollm2-360m-sft3-epoch3 (este modelo) | 361,8 M | No disponible | No declarada en el repositorio | 0 descargas, 0 likes |
| SmolLM2-360M-Instruct (modelo base) | 361,8 M | No disponible | Apache-2.0 según su propia model card | Ampliamente distribuido |
| SmolLM2-135M-Instruct (misma familia, menor) | 135 M | No disponible | Apache-2.0 según su propia model card | Ampliamente distribuido |
| SmolLM2-1.7B-Instruct (misma familia, mayor) | 1,7 B | No disponible | Apache-2.0 según su propia model card | Ampliamente distribuido |

No se dispone de datos de rendimiento comparados en la información proporcionada, por lo que la comparación se limita a tamaño, licencia y disponibilidad. La ventaja diferencial de este checkpoint (ajuste específico para un asistente de portfolio) no está cuantificada frente al modelo base.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso, lo que impide asumir uso comercial legítimo. Es un bloqueo habitual en repositorios de HuggingFace sin campo de licencia.
- Model card prácticamente vacía: no se documentan datos de entrenamiento, hiperparámetros, composición del dataset ni proceso de evaluación.
- Riesgo de sobreajuste: 3 épocas de SFT de pesos completos sobre un dataset presumiblemente pequeño y de un solo dominio pueden degradar capacidades generales del modelo base (olvido catastrófico).
- Riesgo de alucinación elevado: con 362 M de parámetros, la fidelidad factual es limitada; en un asistente de portfolio esto es crítico, ya que puede inventar proyectos, fechas o datos de contacto.
- Solo inglés: no se debe esperar un comportamiento fiable en castellano u otros idiomas.
- Capacidad limitada de razonamiento, matemáticas y código, propia de la gama de 0,4 B de parámetros.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad ni comparación con el modelo base.
- Sin validación comunitaria: 0 descargas y 0 likes implican que no hay retroalimentación externa ni casos de uso verificados.
- Sesgos: no evaluados en la información disponible; se heredan los del modelo base (datos web en inglés) sin filtrado documentado.
- Ausencia de pesos cuantizados publicados: el despliegue en llama.cpp, Ollama o navegador exige conversión propia y validación posterior.
- Contexto no documentado: si se usa con entradas largas, hay que verificar experimentalmente la ventana efectiva antes de confiar en ella.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sid42hf/smollm2-360m-sft3-epoch3
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces encontrados corresponden a foros sobre incidencias de una plataforma de anuncios y a artículos sin relación con el modelo. No se dispone de paper, blog ni demo asociados al checkpoint.
