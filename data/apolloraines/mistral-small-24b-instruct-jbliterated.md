# ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated

## Resumen

Mistral-Small-24B-Instruct-Jbliterated es un derivado del modelo Mistral-Small-24B-Instruct-2501 de Mistral AI, publicado por el usuario ApolloRaines. Se trata de una intervención quirúrgica sobre los pesos del modelo base cuyo objetivo declarado es eliminar la disposición aprendida a rechazar peticiones (refusal behavior), sin recurrir a entrenamiento con gradientes ni a parches en tiempo de inferencia. El autor denomina al método "jbliteration", una variante de la técnica conocida como abliteration que, según afirma, actúa con mayor precisión sobre la dirección de rechazo para preservar el resto de capacidades del modelo.

El modelo conserva la arquitectura y el tamaño del original: 23.572.403.200 parámetros reales según los safetensors del repositorio, lo que corresponde a la familia Mistral-Small de 24B. El repositorio ocupa 133,7 GB e incluye pesos en safetensors y GGUF, lo que facilita su despliegue tanto en pipelines de Transformers como en entornos de inferencia local con llama.cpp u Ollama. La licencia declarada es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de modificación de pesos orientada a eliminar salvaguardas, un fenómeno creciente en el ecosistema open source que conviene conocer desde el punto de vista de la evaluación de riesgos. Por otro, el autor presenta el modelo como herramienta para investigación en seguridad, análisis defensivo y red-teaming, argumentando que un modelo que se niega a examinar código hostil no puede revisarlo. El modelo está etiquetado únicamente para inglés y acumula 604 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral-Small-24B-Instruct-2501) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF disponible en el repositorio; cuantizaciones concretas no especificadas |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Mistral-Small-24B-Instruct-2501, un transformer decoder-only de aproximadamente 24B parámetros. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni ventana de contexto efectiva del modelo base. Tampoco se documentan los datos de entrenamiento originales de Mistral AI (composición del corpus, número de tokens, uso de RLHF o DPO), por lo que estos datos deben consultarse en la model card del modelo base.

La modificación introducida por ApolloRaines no consiste en un reentrenamiento, sino en una cirugía directa sobre los pesos ("weight surgery") mediante el framework jBlaze. Según la model card, el método identifica y edita la dirección de rechazo en el espacio de activaciones, de forma que el modelo deja de codificar la disposición a negarse a responder. El autor distingue su enfoque de la abliteration estándar de una sola dirección, que a su juicio elimina la respuesta superficial de rechazo pero deja intactas direcciones conductuales más profundas, dando lugar a reinterpretaciones de la petición, inyección de advertencias, omisiones estratégicas o reformulaciones más seguras. Como evidencia de retención de capacidades, la model card cita un resultado de MMLU del 77,89 % frente a una línea base de 76,84 % en el modelo Sharona (Qwen3.5-27B) tras seis fases de cirugía y cuantización GPTQ W4A16; se trata de una medición sobre otro modelo de la colección, no sobre este Mistral-Small-24B.

## Capacidades

- Generación de texto conversacional en inglés, como drop-in replacement del Mistral-Small-24B-Instruct-2501.
- Eliminación declarada de la conducta de rechazo a nivel de pesos, sin necesidad de system prompt ni parches de inferencia.
- Capacidad preservada, según el autor, para tareas generales del modelo base (razonamiento, código, matemáticas), aunque no se publican benchmarks específicos de este derivado.
- Soporte de tool calling y function calling heredado del modelo base, no verificado de forma independiente en esta información.
- Capacidades multilingües limitadas al inglés según el etiquetado del repositorio.
- Orientación declarada a análisis de código hostil, revisión de exploits y reconstrucción de incidentes en contextos de seguridad defensiva.

## Casos de uso

- Análisis defensivo de malware: el modelo puede examinar muestras y artefactos de ataque sin las negativas que el autor atribuye a los modelos alineados, lo que facilita la reconstrucción de cadenas de intrusión en equipos de respuesta a incidentes.
- Red-teaming de aplicaciones: útil para generar prompts adversariales y evaluar la robustez de filtros y clasificadores de contenido en pipelines propios.
- Revisión de código de seguridad: análisis de exploits conocidos y PoC para auditorías internas, aprovechando la ausencia de rechazo sobre material sensible.
- Investigación académica sobre alineación: estudio de cómo se codifica la negativa a responder en los pesos y de hasta qué punto es separable de la capacidad subyacente.
- Evaluación de riesgos de modelos abliterated: comparación de tasas de rechazo y de degradación de capacidades frente al modelo base en un banco de pruebas controlado.
- Despliegue local en entornos aislados: gracias a los pesos GGUF y a herramientas como DeepswapLLM, puede ejecutarse en hardware limitado para experimentación offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos de este modelo en la información disponible. La model card cita un resultado de MMLU del 77,89 % frente a 76,84 % de línea base, pero corresponde al modelo Sharona (Qwen3.5-27B) de la misma colección, no a este Mistral-Small-24B. No se dispone de datos de MMLU, HumanEval, GSM8K ni de tasa de rechazo medidos sobre este derivado concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 47 GB solo para pesos (23,57B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda un mínimo de 48-80 GB según longitud de contexto.
- GPU recomendadas para FP16: A100 80 GB, H100 80 GB, o múltiples GPU de 24 GB (RTX 4090) con reparto de capas.
- Cuantización GGUF: permite reducir la huella a aproximadamente 14-16 GB en Q4_K_M y a unos 24-26 GB en Q8_0, lo que hace viable su ejecución en una RTX 4090 (24 GB) o en una RTX 3090 en cuantizaciones de 4 bits.
- Opciones de despliegue: Transformers con `device_map="auto"`, llama.cpp y Ollama para GGUF, vLLM y TGI para safetensors en servidor; el autor promociona DeepswapLLM para streaming de capas entre GPU, RAM y disco.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Small-24B-Instruct-Jbliterated | 23,57B | no disponible | Apache 2.0 | Derivado abliterated, solo inglés, sin benchmarks propios publicados |
| mistralai/Mistral-Small-24B-Instruct-2501 | ~24B | no disponible | Apache 2.0 | Modelo base original, alineado, multilingüe según su model card |
| Otros derivados abliterated de Mistral-Small | ~24B | no disponible | Apache 2.0 | Existen múltiples variantes comunitarias con métodos de edición distintos; no se dispone de comparación cuantitativa en esta información |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Eliminación deliberada de salvaguardas: el modelo ha sido modificado para no rechazar peticiones, lo que incluye contenido dañino, ilegal o peligroso. Su uso en producción sin capas de moderación externas es desaconsejado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual sobre este derivado; la cirugía de pesos puede afectar a calibración y coherencia de forma no documentada.
- Idiomas: etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior al del modelo base multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero el autor advierte que los pesos "pueden hacer daño tanto como bien" y que la mayoría de sus modelos públicos se liberan a fuerza parcial como prueba de concepto.
- Contexto: no se documenta la longitud de contexto efectiva de este derivado; debe asumirse la del modelo base, no verificada aquí.
- Procedencia y mantenimiento: repositorio de un autor individual con 0 likes y 604 descargas; sin garantías de soporte, actualizaciones ni auditoría independiente.
- Uso responsable: adecuado para investigación en seguridad y entornos aislados; inadecuado para aplicaciones de cara al público sin filtros adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Perfil del autor: https://www.linkedin.com/in/apollo-raines/
