# mradermacher/Liminar-Mistral-Small-3.2-24B-GGUF

## Resumen

Liminar-Mistral-Small-3.2-24B es un ajuste fino (fine-tuning) del modelo Mistral Small 3.2 de 24B de parámetros, desarrollado por el grupo LICDIA de la Universidad Nacional de Luján (UNLu) en Argentina. El modelo está especializado en el dominio de la normativa y la legislación universitaria argentina, según indican las etiquetas de su model card (`liminar`, `argentina`, `universidades`, `normativa`, `es`). El repositorio que nos ocupa es la versión cuantizada en formato GGUF publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que facilita su ejecución en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base, Mistral Small 3.2, es un transformer denso de 24B de parámetros con licencia Apache 2.0, lo que permite uso comercial sin restricciones. Esta versión GGUF conserva esa licencia y ofrece 11 niveles de cuantización distintos, desde Q2_K (9,0 GB) hasta Q8_0 (25,2 GB), lo que permite desplegar el modelo en configuraciones de hardware muy variadas, desde GPUs de consumo con 12 GB de VRAM hasta servidores con múltiples aceleradores.

La relevancia de este modelo radica en su especialización vertical: frente a modelos generalistas, Liminar está entrenado para responder consultas sobre normativa universitaria argentina, un nicho con terminología jurídica y administrativa muy específica. La disponibilidad de cuantizaciones GGUF lo hace accesible para instituciones educativas con presupuestos limitados, que pueden ejecutarlo localmente sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Mistral Small 3.2) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Mistral Small 3.2, un transformer denso de 23,57B de parámetros desarrollado por Mistral AI. Se trata de una arquitectura decoder-only estándar con atención completa, sin componentes MoE ni mecanismos híbridos SSM. El ajuste fino fue realizado por LICDIA-UNLu sobre este modelo base para especializarlo en normativa universitaria argentina, aunque la model card del repositorio cuantizado no proporciona detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF, DPO o SFT.

La información disponible no especifica innovaciones técnicas adicionales en el proceso de ajuste. La model card del repositorio GGUF es una plantilla estándar de mradermacher que documenta exclusivamente el proceso de cuantización, no el entrenamiento del modelo original. Se desconoce si el ajuste fino incluyó datos de conversaciones multi-turno, aunque la etiqueta `conversational` sugiere que el modelo está optimizado para diálogo.

## Capacidades

- Generación de texto en español, con especialización en normativa y legislación universitaria argentina.
- Respuesta a consultas sobre reglamentos, estatutos y procedimientos administrativos de universidades argentinas.
- Capacidad conversacional multi-turno (etiqueta `conversational` en el repositorio).
- Hereda las capacidades generales del modelo base Mistral Small 3.2, aunque no se documentan explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- **Atención al cliente en universidades**: el modelo puede gestionar consultas de estudiantes sobre trámites, plazos y requisitos administrativos, respondiendo en español con terminología jurídica correcta. Su especialización en normativa universitaria argentina reduce el riesgo de respuestas genéricas o incorrectas en este dominio.
- **Asistente para personal administrativo**: los empleados de secretarías académicas pueden consultar rápidamente artículos de reglamentos, resoluciones y estatutos, usando el modelo como herramienta de búsqueda semántica conversacional sobre la normativa vigente.
- **Generación de borradores de documentos normativos**: el modelo puede redactar borradores de resoluciones, actas o comunicaciones internas siguiendo el estilo y la terminología de la normativa universitaria argentina, que luego el personal jurídico revisa y ajusta.
- **Formación de nuevos empleados**: un chatbot basado en Liminar puede servir como tutor interno para personal recién incorporado, explicando procedimientos y respondiendo dudas sobre la normativa aplicable en cada trámite.
- **Despliegue local en instituciones educativas**: gracias a las cuantizaciones GGUF (desde 9,0 GB en Q2_K), el modelo puede ejecutarse en servidores modestos o incluso en workstations con GPU de consumo, sin necesidad de conexión a internet ni de enviar datos sensibles a APIs externas.
- **Investigación en procesamiento de lenguaje jurídico**: el modelo sirve como base para experimentos de fine-tuning adicional o evaluación en tareas de comprensión de normativa, gracias a su licencia Apache 2.0 que permite modificación y redistribución.
- **Sistema de preguntas y respuestas sobre normativa**: integrado en un portal web universitario, el modelo puede responder preguntas frecuentes de estudiantes y docentes sobre planes de estudio, régimen de cursada y requisitos de graduación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según cuantización):
  - Q2_K: ~9,0 GB de pesos; requiere ~10-11 GB de VRAM en total.
  - Q3_K_M: ~11,6 GB de pesos; requiere ~13 GB de VRAM.
  - Q4_K_M: ~14,4 GB de pesos; requiere ~16 GB de VRAM.
  - Q5_K_M: ~16,9 GB de pesos; requiere ~18-19 GB de VRAM.
  - Q6_K: ~19,4 GB de pesos; requiere ~21 GB de VRAM.
  - Q8_0: ~25,2 GB de pesos; requiere ~27 GB de VRAM.
- **GPU recomendadas**:
  - Consumer: RTX 4090 (24 GB) puede ejecutar Q5_K_M o Q6_K con comodidad; RTX 4080 (16 GB) puede ejecutar Q4_K_M; RTX 4070 Ti (12 GB) puede ejecutar Q3_K_M o IQ4_XS con offloading parcial.
  - Profesional: A100 (40/80 GB), H100 (80 GB) para Q8_0 sin problemas y con margen para contexto largo.
- **¿Cabe en GPU de consumo?**: sí, en configuraciones de 12 GB o más con cuantizaciones Q2_K a Q4_K_M. Para Q6_K y Q8_0 se recomienda 24 GB o más.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de Hugging Face.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Liminar-Mistral-Small-3.2-24B (este) | 23,57B | No disponible | Apache 2.0 | GGUF, safetensors | Normativa universitaria argentina |
| Mistral Small 3.2 (base) | 23,57B | No disponible | Apache 2.0 | safetensors | Generalista |
| Modelos GGUF de 24B similares (p. ej., Mistral-Small-24B-Instruct) | ~24B | No disponible | Apache 2.0 | GGUF | Generalista, instrucciones |

La comparativa se limita al modelo base y a alternativas genéricas de tamaño similar, ya que no se dispone de información sobre otros modelos especializados en normativa universitaria argentina. La principal ventaja diferencial de Liminar es su especialización vertical; su principal desventaja es la ausencia de benchmarks publicados que cuantifiquen esa ventaja.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan en la información disponible, pero al estar entrenado sobre normativa argentina, puede reflejar sesgos presentes en los textos legales y administrativos utilizados.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas sobre artículos, plazos o procedimientos normativos. En un dominio jurídico, esto es especialmente crítico y requiere verificación humana.
- **Limitaciones de contexto o idioma**: el modelo está etiquetado únicamente para español (`es`); su rendimiento en otros idiomas no está garantizado. La longitud de contexto no está documentada en la información disponible.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones significativas, siempre que se mantenga el aviso de licencia y la atribución.
- **Caveats para producción**: no se han publicado benchmarks ni evaluaciones de calidad; se recomienda realizar una evaluación propia antes de desplegar en entornos reales. La cuantización Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- **Datos de entrenamiento desconocidos**: no se especifica el volumen ni la composición del dataset de ajuste fino, lo que impide evaluar la cobertura y actualidad de la normativa incluida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Liminar-Mistral-Small-3.2-24B-GGUF
- Modelo base (ajuste fino): https://huggingface.co/LICDIA-UNLu/Liminar-Mistral-Small-3.2-24B
- Página de resumen del cuantizador: https://hf.tst.eu/model#Liminar-Mistral-Small-3.2-24B-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
