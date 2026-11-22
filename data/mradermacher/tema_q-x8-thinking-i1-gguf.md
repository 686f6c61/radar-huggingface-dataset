# mradermacher/Tema_Q-X8-Thinking-i1-GGUF

## Resumen

Tema_Q-X8-Thinking-i1-GGUF es una colección de cuantizaciones GGUF, generadas por mradermacher, del modelo temaq-org/Tema_Q-X8-Thinking. Se trata de un transformer instruction-tuned de 35.505.251.456 parámetros (aproximadamente 35,5 mil millones) orientado a tareas de agente, razonamiento multi-paso y conversación multilingüe en japones, ingles y chino. El repositorio incluye cuantizaciones con imatrix (i1) en una amplia gama de tipos, desde IQ1_S hasta Q6_K, lo que permite desplegar el modelo en hardware muy diverso.

La relevancia de esta ficha radica en que el artefacto publicado no es el modelo original sino su versión cuantizada para inferencia local. El autor de las cuantizaciones es mradermacher, un perfil conocido en el ecosistema por producir versiones GGUF de modelos abiertos. El modelo base está etiquetado como "uncensored" o "unfiltered", lo que implica que se ha reducido o eliminado el alineamiento de seguridad habitual.

No se dispone de información pública sobre la longitud de contexto, la licencia, la composición del dataset de entrenamiento ni los resultados de benchmarks en la documentación proporcionada. La model card se limita a listar los ficheros de cuantización y a remitir a la página del modelo base para más detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (según tags del repositorio) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de fichero imatrix) |
| Idiomas soportados | japones (ja), ingles (en), chino (zh) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El repositorio identifica el modelo como un transformer instruction-tuned, según las etiquetas de Hugging Face ("transformer", "instruction-tuned"). No se proporciona información sobre el número de capas, dimensión oculta, mecanismo de atención (si es estándar, GQA o linear), ni sobre innovaciones como decodificación especulativa o modos de pensamiento explícitos, más allá de la etiqueta "Thinking" en el nombre.

Respecto al entrenamiento, no se documentan el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. El modelo base está etiquetado como "uncensored", "non-censored" y "unfiltered", lo que sugiere un proceso de fine-tuning orientado a eliminar rechazos de seguridad, pero no se detalla la metodología. Tampoco se especifica el proceso de cuantización más allá de que se usaron pesos imatrix (i1) para mejorar la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto conversacional multi-turno en japones, ingles y chino.
- Razonamiento multi-paso y modo "thinking" (según el nombre del modelo, aunque no se documenta el mecanismo exacto).
- Soporte de agentes (etiqueta "agent" en el repositorio).
- Capacidad de tool calling o function calling: no confirmada en la información disponible.
- Capacidades multilingües limitadas a los tres idiomas declarados (ja, en, zh).
- Comportamiento "uncensored": el modelo está diseñado para no aplicar filtros de rechazo, lo que afecta a su comportamiento en temas sensibles.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Asistente conversacional en japones, ingles o chino: el modelo puede gestionar diálogos multi-turno en estos tres idiomas, adecuado para aplicaciones de atención al cliente en mercados asiáticos y anglosajones, aunque se desconoce la ventana de contexto exacta.
- Generación de texto creativo sin filtros: su naturaleza "uncensored" lo hace apto para escritura de ficción, guiones o contenido editorial donde se requiera evitar rechazos por temas sensibles, siempre con revisión humana posterior.
- Prototipado de agentes autónomos: la etiqueta "agent" sugiere que el modelo está orientado a flujos de razonamiento multi-paso, útil para experimentar con pipelines de agentes en entornos controlados.
- Inferencia local en estaciones de trabajo: las cuantizaciones desde IQ2 hasta Q6 permiten ejecutar el modelo en GPUs de consumo con suficiente VRAM, facilitando pruebas offline sin depender de APIs.
- Investigación sobre alineamiento y seguridad: al ser un modelo "unfiltered", sirve como caso de estudio para analizar comportamientos no alineados y evaluar mecanismos de moderación externos.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse localmente con llama.cpp u Ollama, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles en japones o chino.
- Traducción y adaptación de contenido entre ja, en y zh: el modelo puede emplearse para tareas de traducción asistida, aunque no se han publicado evaluaciones de calidad al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - i1-Q2_K: ~13,3 GB.
  - i1-IQ3_S / i1-Q3_K_S: ~15,6-15,7 GB.
  - i1-Q4_K_M: ~21,8 GB.
  - i1-Q5_K_M: ~25,4 GB.
  - i1-Q6_K: ~29,3 GB.
- GPU recomendadas: para Q4_K_M se necesita al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4). Para Q5 y Q6 se recomienda A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; las cuantizaciones Q5 y Q6 requieren GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (no confirmado para esta arquitectura concreta).
- Latencia y throughput: no disponibles. Dependen del hardware y del tipo de cuantización; las cuantizaciones Q4_0 y Q4_K_M están marcadas como "fast" en la model card.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base temaq-org/Tema_Q-X8-Thinking no incluye benchmarks ni detalles que permitan una comparación rigurosa con alternativas de tamaño similar (por ejemplo, modelos de 30-40 B en la misma franja). Se indica "no disponible".

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Modelo "uncensored" / "unfiltered": carece de filtros de seguridad, lo que implica riesgo de generar contenido dañino, sesgado o ilegal; requiere moderación externa obligatoria en aplicaciones públicas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un modelo de 35 B sin benchmarks conocidos, la fiabilidad en tareas de precisión es incierta.
- Idiomas limitados: solo se declaran japones, ingles y chino; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin verificar el modelo base.
- Cuantizaciones de baja precisión (Q2, IQ2, IQ1) pueden degradar notablemente la calidad; la model card recomienda IQ3_XXS o superiores frente a Q2_K.
- El repositorio ocupa 279,4 GB, lo que exige espacio de almacenamiento considerable si se descargan varias cuantizaciones.
- No hay información sobre sesgos demográficos, culturales o lingüísticos específicos del entrenamiento.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones: https://huggingface.co/mradermacher/Tema_Q-X8-Thinking-i1-GGUF
- Modelo base: https://huggingface.co/temaq-org/Tema_Q-X8-Thinking
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Tema_Q-X8-Thinking-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Tema_Q-X8-Thinking-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
