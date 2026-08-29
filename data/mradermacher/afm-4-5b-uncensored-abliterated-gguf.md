# mradermacher/AFM-4.5B-Uncensored-Abliterated-GGUF

## Resumen

AFM-4.5B-Uncensored-Abliterated-GGUF es una versión cuantizada en formato GGUF del modelo base Securelayer7/AFM-4.5B-Uncensored-Abliterated, preparada por mradermacher. El modelo original pertenece a la familia AFM de Arcee (según las etiquetas) y ha sido sometido a un proceso de "abliteración", una técnica que elimina los mecanismos de rechazo y censura del modelo, dando como resultado un sistema que no se niega a responder a peticiones que normalmente serían bloqueadas. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles.

El modelo tiene aproximadamente 4,6 mil millones de parámetros y está licenciado bajo Apache 2.0, lo que facilita su uso comercial. Está pensado para casos de uso como red-teaming, ciberseguridad y generación de contenido sin restricciones, aunque también puede emplearse en tareas generales de razonamiento y conversación. Al ser una cuantización estática, ofrece varios niveles de compresión (desde Q2_K hasta f16) para adaptarse a diferentes capacidades de VRAM.

La relevancia de este modelo radica en su naturaleza "uncensored" y "abliterated", una tendencia creciente en la comunidad open source para aplicaciones de seguridad ofensiva, investigación de sesgos y pruebas de robustez. Sin embargo, al carecer de filtros de seguridad, su uso en producción requiere una evaluación cuidadosa de los riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pertenece a la familia AFM de Arcee) |
| Parametros totales | 4.619.189.760 (4,6 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (Securelayer7/AFM-4.5B-Uncensored-Abliterated). El nombre "AFM" sugiere que pertenece a la familia de modelos de Arcee, pero no se especifica si es un transformer denso, MoE o híbrido. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La única innovación destacable es el proceso de "abliteración", que consiste en eliminar o atenuar las capas o direcciones del modelo responsables de los comportamientos de rechazo, dando lugar a un modelo que responde sin negarse a peticiones que normalmente serían bloqueadas.

## Capacidades

- Generación de texto sin filtros de rechazo: el modelo no se niega a responder a peticiones que otros modelos censurarían, lo que lo hace útil para red-teaming y pruebas de seguridad.
- Razonamiento y conversación: al ser un modelo de 4,6 B, puede mantener diálogos multi-turno y resolver tareas de razonamiento básico, aunque no se han publicado benchmarks específicos.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo inglés (según la etiqueta "en").
- Capacidades especiales: al ser "uncensored", puede generar contenido explícito, violento o ilegal, lo que constituye una capacidad y un riesgo a la vez.

## Casos de uso

- Red-teaming y pruebas de penetración: el modelo puede generar prompts de ataque, exploits o técnicas de ingeniería social sin rechazos, lo que permite a los equipos de seguridad evaluar la robustez de sus sistemas.
- Investigación de sesgos y alineación: al eliminar los rechazos, se pueden estudiar los sesgos subyacentes del modelo y comparar su comportamiento con versiones censuradas.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que aborden temas tabú sin que el modelo se niegue a participar.
- Simulación de adversarios en chatbots: para entrenar sistemas de moderación o detectar vulnerabilidades en asistentes virtuales.
- Análisis de riesgos de modelos abliterated: estudiar qué tipo de contenido genera un modelo sin filtros y cómo mitigar sus efectos en producción.
- Pruebas de robustez de sistemas de seguridad: verificar si los filtros de contenido de una aplicación pueden ser evadidos mediante prompts generados por este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada: según el tamaño de los archivos GGUF, la cuantización Q4_K_M ocupa 3,0 GB, por lo que cabe en GPUs con 4 GB o más (por ejemplo, GTX 1650, RTX 3050). La versión f16 requiere 9,3 GB, apta para GPUs de 10-12 GB como RTX 3080 o RTX 4070.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM para las cuantizaciones pequeñas; para Q8_0 o f16 se recomienda una GPU con 8-12 GB.
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q4_K_M y menores funcionan en GPUs de gama media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF. También se puede usar vLLM si se convierte a otro formato, aunque no es lo habitual.
- Latencia y throughput: no se dispone de datos medidos. En una GPU como RTX 4090, un modelo de 4,6 B cuantizado a Q4_K_M podría generar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. Existen otros modelos abliterated en el ecosistema (por ejemplo, los de huihui-ai o los listados en guías de modelos uncensored), pero no se conocen sus especificaciones exactas ni sus resultados. Se recomienda consultar el modelo base en HuggingFace para obtener más detalles.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin filtros, puede reflejar y amplificar sesgos presentes en sus datos de entrenamiento, incluyendo contenido ofensivo, discriminatorio o ilegal.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que no se puede garantizar un rendimiento adecuado en conversaciones muy largas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo puede generar contenido que infrinja leyes o políticas de plataformas, responsabilidad que recae en el usuario.
- Caveat para producción: no se recomienda su uso en aplicaciones orientadas al público sin un sistema de moderación externo, dado que puede producir respuestas dañinas o inapropiadas.
- Idioma: solo inglés, lo que limita su uso en entornos multilingües.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AFM-4.5B-Uncensored-Abliterated-GGUF
- Modelo base: https://huggingface.co/Securelayer7/AFM-4.5B-Uncensored-Abliterated
- Página de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de modelos uncensored (referencia general): https://insiderllm.com/guides/best-uncensored-local-llms/
