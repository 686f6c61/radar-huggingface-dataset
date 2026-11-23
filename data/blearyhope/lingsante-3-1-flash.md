# blearyhope/LingSante-3.1-flash

## Resumen

LingSante-3.1-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) híbrido orientado a razonamiento médico complejo, comunicación sanitaria profesional, investigación basada en evidencia y ejecución de tareas médicas de horizonte largo. Lo desarrolla el equipo inclusionAI (Alibaba), según la model card original referenciada en el repositorio, y se distribuye como pesos abiertos bajo licencia MIT. El modelo parte de Ling-3.1-flash y añade entrenamiento específico de dominio médico en preentrenamiento, mid-training, ajuste supervisado y RL.

La arquitectura es un MoE híbrido con atención linear (KDA) y Gated MLA: 63 capas KDA y 9 capas Gated MLA en proporción 7:1, 512 expertos enrutados con 8 activos por token, 1 experto compartido y 4 capas densas. Declara 560.000 millones de parámetros totales y 25.000 millones activos por token, con una ventana de contexto de 1 millón de tokens. El repositorio de Hugging Face reporta 572.120.680.768 parámetros en safetensors y un tamaño de 573,8 GB.

Su relevancia actual radica en que aborda tareas médicas reales que exigen verificación de evidencia, uso de herramientas y flujos multi-etapa, no solo respuesta a preguntas. El autor advierte explícitamente que el modelo es para investigación y evaluación, y que no es un dispositivo médico ni debe usarse como base independiente para diagnóstico, prescripción o tratamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (KDA + Gated MLA) |
| Parametros totales | 560B (572.120.680.768 en safetensors) |
| Parametros activos | 25B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | fp8 (tag del repo); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura de Ling-3.1-flash: un transformer híbrido con 63 capas de atención linear KDA y 9 capas Gated MLA (proporción 7:1), 4 capas densas, 512 expertos enrutados con 8 activos por token, 1 experto compartido, 64 cabezas de atención, hidden size de 4096, tamaño intermedio de experto de 1280, tamaño intermedio denso de 10240 y vocabulario de 157.184 tokens. La combinación de atención linear y MLA busca sostener contextos de 1M tokens con coste de atención reducido.

El entrenamiento mezcla datos generales y médicos en preentrenamiento, mid-training y ajuste supervisado, de modo que los datos médicos aportan conocimiento de dominio y los generales preservan razonamiento, código, búsqueda y uso de herramientas. En post-entrenamiento se aplica RL para razonamiento médico, tool use, búsqueda y comportamiento profesional, y finalmente una destilación on-policy multi-profesor que integra capacidades complementarias en un único modelo. El número exacto de tokens de entrenamiento y la composición del dataset no están disponibles en la información proporcionada.

## Capacidades

- Razonamiento médico complejo: identificación de factores clave en decisiones clínicas, validación de evidencia y resolución de conflictos entre fuentes.
- Comunicación sanitaria profesional: respuestas contextualizadas y accionables ante información incompleta.
- Investigación profunda basada en evidencia (evidence-based deep research).
- Ejecución de tareas médicas de horizonte largo con coordinación de herramientas y planificación adaptativa.
- Uso de herramientas y búsqueda (tool calling / search) integrado en flujos multi-etapa.
- Capacidades generales preservadas: razonamiento, código y uso de herramientas, según la model card.
- Ventana de contexto de 1M tokens para documentos clínicos extensos y conversaciones multi-turno largas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Revisión de historiales clínicos extensos: el modelo puede procesar decenas de documentos y notas de evolución dentro de su ventana de 1M tokens y sintetizar cronologías y hallazgos relevantes para revisión por un profesional.
- Apoyo a la investigación biomédica: búsqueda y verificación de evidencia en literatura, con resolución de conflictos entre fuentes gracias al entrenamiento específico en evidence-reasoning.
- Triaje asistido y estructuración de consultas: generación de resúmenes clínicos y preguntas de seguimiento ante información incompleta, con salida revisable por personal sanitario.
- Automatización de flujos administrativos sanitarios: coordinación de pasos multi-etapa (extracción de datos, validación, generación de informes) mediante tool calling.
- Asistencia a codificación clínica: mapeo de descripciones libres a terminologías y códigos, con verificación de consistencia entre documentos.
- Generación de material formativo médico: elaboración de casos clínicos y explicaciones basadas en evidencia para formación de residentes.
- Evaluación y benchmarking de sistemas médicos: uso como modelo de referencia en investigación sobre razonamiento clínico y alineamiento de comportamiento profesional.

## Benchmarks y rendimiento

La model card menciona una figura de benchmarks (`assets/benchmark-overview.png`) y afirma que el modelo es líder entre modelos abiertos en razonamiento médico complejo y segundo en comportamiento profesional médico, solo por detrás de GPT-6 Astra. Sin embargo, los valores numéricos concretos no están disponibles en la información proporcionada.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 572.120 millones de parámetros, en fp8 se requieren aproximadamente 572 GB solo para pesos, más overhead de activaciones y KV cache; en cuantizaciones de 4 bits se estiman en torno a 290-300 GB.
- GPU recomendadas: no cabe en una sola GPU convencional; se requiere un clúster multi-GPU (por ejemplo, 8x H100 80 GB en fp8 para pesos, con margen ajustado) o más nodos para contexto largo.
- GPU de consumo: no cabe en RTX 4090 ni en ninguna GPU consumer individual.
- Opciones de despliegue: al usar `custom_code` y arquitectura híbrida KDA/MLA, el soporte en vLLM, llama.cpp u Ollama no está confirmado en la información disponible; se requiere revisar el código personalizado del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LingSante-3.1-flash | 560B / 25B | 1M | MIT | Especializado en dominio médico |
| Ling-3.1-flash | 560B / 25B (arquitectura base) | 1M | no disponible en esta ficha | Modelo general del que deriva |
| GPT-6 Astra | no disponible | no disponible | propietaria | Referencia citada por el autor en comportamiento profesional médico |

No se dispone de datos de rendimiento comparativos numéricos en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor prohíbe explícitamente su uso como base independiente para diagnóstico, prescripción o tratamiento.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en dominio clínico.
- Sesgos: no documentados en la información disponible; los sesgos de los datos médicos de entrenamiento pueden propagarse.
- Idiomas soportados no declarados; el rendimiento fuera del inglés no está garantizado.
- Licencia MIT permite uso comercial, pero ello no exime de las advertencias de seguridad clínica del autor.
- Requiere infraestructura multi-GPU de gran escala; el soporte en frameworks de inferencia estándar no está confirmado.
- El repositorio tiene 0 descargas y 0 likes, y procede de un autor (`blearyhope`) distinto del propietario original citado en la model card (`inclusionAI`); conviene verificar la procedencia e integridad de los pesos antes de usarlos en producción.
- Fecha de creación declarada en 2026-11-23, posterior a la fecha habitual de referencia; verificar metadatos.

## Enlaces

- Hugging Face (repo consultado): https://huggingface.co/blearyhope/LingSante-3.1-flash
- Hugging Face (modelo original citado): https://huggingface.co/inclusionAI/LingSante-3.1-flash
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash
- ModelScope: https://www.modelscope.cn/models/inclusionAI/LingSante-3.1-flash
- API Computrix: https://computrix.ai/sg/models/modelservice-1795159585527001414
