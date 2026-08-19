# farbodtavakkoli/OTel-2.0-LLM-31B-IT

## Resumen

OTel-2.0-LLM-31B-IT es un modelo de lenguaje especializado en telecomunicaciones, post-entrenado a partir de Gemma 4 31B-IT mediante un proceso de adaptación de dominio (domain post-training) sobre un corpus de aproximadamente 440 mil millones de tokens de entrenamiento. Es la primera versión de la familia OTel 2.0, que amplía el esfuerzo original de OTel 1.0 (centrado en RAG y abstention) hacia una cobertura más amplia: respuesta directa a preguntas técnicas, instrucciones generales y ejemplos de tool-calling de propósito general, manteniendo el enfoque en estándares, operaciones de red y documentación técnica del sector.

El modelo está desarrollado por farbodtavokkoli en colaboración con GSMA, Open Telco AI, Red Hat, Microsoft, Dell y AMD. Se apoya en un corpus inicial de unos 15 mil millones de tokens brutos procedentes de organizaciones como 3GPP, ETSI, ITU, CAMARA, O-RAN y TM Forum, procesados mediante el Synthetic Data Generation Hub (SDG Hub) de Red Hat en infraestructura Azure con GPUs AMD MI300X, y entrenado en GPUs AMD MI355X. El resultado es un modelo denso de 32 mil millones de parámetros con una ventana de contexto de 262.144 tokens, licenciado bajo Apache 2.0 y orientado a despliegues de producción en el sector telco, donde la precisión en estándares y la capacidad de razonamiento sobre documentación técnica son críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4 31B-IT) |
| Parametros totales | 32.106.632.252 (31B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (según nodepedia) |
| Tipos de cuantizacion | Q4_K_M (según nodepedia); otras opciones no disponibles |
| Idiomas soportados | Inglés (solo texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (gemma4_text) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 31B-IT, un modelo de tipo transformer denso con 31B parámetros, y se somete a un proceso de post-entrenamiento de dominio telecom sobre un corpus procesado de más de 1 billón de tokens. El corpus original de ~15B tokens (estándares 3GPP, ETSI, ITU, GSMA, CAMARA, O-RAN y TM Forum) se transformó mediante el SDG Hub de Red Hat en un conjunto de datos sintéticos y supervisados de gran volumen, del cual se seleccionaron ~440B tokens para el entrenamiento final. El entrenamiento se realizó en GPUs AMD MI355X con infraestructura Dell, sin uso de RLHF/DPO explícito; el enfoque es de instruction tuning y domain adaptation mediante mezclas de datos que incluyen RAG, abstention, QnA directa, instrucciones generales y ejemplos de tool calling general.

## Capacidades

- Generación de texto en inglés con enfoque técnico en telecomunicaciones: estándares, protocolos, redes, operaciones y servicios.
- RAG (Retrieval-Augmented Generation): genera respuestas contextualizadas a partir de documentos técnicos recuperados (estándares, especificaciones).
- Abstention: el modelo está entrenado para abstenerse de responder cuando el contexto es insuficiente o irrelevante.
- QnA directa sobre conocimiento de telecomunicaciones: preguntas factuales sobre protocolos, especificaciones y conceptos de red.
- Instruction following general: sigue instrucciones de propósito general (no específicas de telecom en la mezcla actual).
- Tool calling de propósito general: puede invocar herramientas en escenarios de agente, aunque la mezcla no incluye ejemplos específicos de telecom (MCP, etc.).
- No soporta visión, audio ni otras modalidades.

## Casos de uso

- Asistente de atención al cliente en operadoras: gestionar consultas sobre planes, cobertura, incidencias y configuración de servicios, con respuestas basadas en documentación interna y estándares, gracias a su contexto largo y entrenamiento en RAG.
- Soporte técnico de red y resolución de incidencias: interpretar logs de red y manuales de equipos para guiar a ingenieros en la diagnosis de fallos, usando la ventana de 262K tokens para procesar documentos extensos.
- Generación de documentación técnica: redactar informes, resúmenes y guías a partir de especificaciones 3GPP o ETSI, con citas correctas y lenguaje técnico preciso.
- Asistente de cumplimiento normativo: responder preguntas sobre requisitos de estándares (GSMA, ITU) y ayudar a verificar conformidad en proyectos de infraestructura.
- Integración en pipelines de RAG para telecom: como generador en sistemas de pregunta-respuesta sobre bases de conocimiento corporativas, con abstention para evitar respuestas sin contexto.
- Automatización de atención al cliente multilingüe (inglés): aunque el modelo solo soporta inglés, puede servir en entornos donde el soporte se realiza en ese idioma, reduciendo carga de agentes humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima: alrededor de 21 GB para la cuantización Q4_K_M (según nodepedia), lo que permite ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090.
- GPUs recomendadas: para inferencia en producción, GPUs profesionales como A100 (40/80 GB), H100, o AMD MI300X/MI355X; en entornos cloud, nodepedia indica que es compatible con 46 GPUs distintas.
- Opciones de despliegue: compatible con frameworks estándar de la librería transformers; se puede servir con vLLM, TGI, llama.cpp o Ollama (dado que hay GGUF disponible, aunque no se especifica el formato exacto).
- Latencia y throughput: no disponible; depende de la cuantización y la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OTel-2.0-LLM-31B-IT | 32B | 262K | Apache 2.0 | Telecom especializado (post-entrenado) |
| Gemma 4 31B-IT (base) | 31B | 262K | Apache 2.0 | Generalista, sin dominio telecom |
| OTel 1.0 (versión anterior) | ~31B | no disponible | Apache 2.0 | Telecom RAG y abstention, menor volumen de datos |

La principal diferencia con la base Gemma 4 31B-IT es el entrenamiento específico en telecom, que le otorga mayor precisión en estándares y vocabulario técnico, aunque pierde la cobertura generalista. Frente a OTel 1.0, el 2.0 amplía el volumen de datos y añade capacidades de QnA directa y tool-calling.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- La mezcla actual de entrenamiento no incluye ejemplos específicos de tool-calling o MCP de telecomunicaciones, por lo que la integración con herramientas del sector puede requerir ajuste adicional.
- El modelo puede alucinar en áreas fuera de su corpus o en preguntas sin contexto suficiente; el entrenamiento de abstention reduce pero no elimina el riesgo.
- Los pesos se actualizan semanalmente; para producción o evaluación reproducible hay que fijar una revisión específica del repositorio, no usar la rama flotante.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la procedencia de los datos de entrenamiento (estándares de GSMA y organizaciones) podría implicar restricciones de uso de contenido, aunque no se especifican en la model card.
- La ventana de contexto de 262K tokens requiere hardware con suficiente VRAM para aprovecharla completamente; en configuraciones de 21 GB solo se puede usar una parte.

## Enlaces

- Hugging Face: https://huggingface.co/farbodtavokkoli/OTel-2.0-LLM-31B-IT
- Repositorio de archivos: https://huggingface.co/farbodtavokkoli/OTel-2.0-LLM-31B-IT/tree/main
- Repositorio GitHub del proyecto OTel: https://github.com/farbodtavokkoli/OTel
- Nodepedia (VRAM y cuantizaciones): https://nodepedia.com/models/otel-2-0-llm-31b-it/
- FriendliAI (API de inferencia): https://friendli.ai/models/farbodtavokkoli/OTel-2.0-LLM-31B-IT
