# mradermacher/Faqih-R1-14B-Islamic-AI-GGUF

## Resumen

Faqih-R1-14B-Islamic-AI-GGUF es una cuantización en formato GGUF del modelo Faqih-R1-14B-Islamic-AI, desarrollado originalmente por hozifa1 y convertido por el equipo mradermacher. El modelo base cuenta con 14.770.033.664 parámetros (aproximadamente 14,77 mil millones) y, por su nombre y etiquetas, está orientado a conversación y a temática islámica, aunque no se dispone de documentación oficial que detalle sus capacidades específicas.

La relevancia de esta versión cuantizada radica en que permite ejecutar el modelo en hardware más modesto que el necesario para los pesos completos, gracias a las distintas cuantizaciones ofrecidas (desde Q2_K hasta Q8_0 y f16). Esto facilita su uso en entornos locales, como ordenadores personales o servidores con GPUs de consumo, sin necesidad de infraestructura de gran escala.

Al tratarse de una conversión de un modelo del que no se ha publicado información técnica detallada (arquitectura, entrenamiento, licencia, etc.), esta ficha se limita a los datos disponibles del repositorio GGUF y a consideraciones generales sobre este tipo de formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 14.770.033.664 (14,77B) |
| Parametros activos | no aplica (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (si es un transformer denso, MoE, etc.) ni sobre su proceso de entrenamiento (datos, número de tokens, técnicas de alineación como RLHF o DPO). El repositorio GGUF solo indica que es una conversión estática de los pesos originales, sin modificar la arquitectura subyacente. La cuantización se realiza mediante herramientas estándar de conversión a GGUF, que reducen la precisión numérica de los pesos para disminuir el tamaño y los requisitos de memoria, a costa de una posible pérdida mínima de calidad.

## Capacidades

- Conversación general: según las etiquetas del repositorio, el modelo está clasificado como "conversational", lo que sugiere que puede mantener diálogos multi-turno.
- Especialización temática: el nombre "Islamic-AI" indica un enfoque hacia contenidos relacionados con el islam, aunque no hay documentación que detalle el alcance de dicha especialización.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede desplegarse en servidores de inferencia compatibles con APIs estándar (por ejemplo, mediante vLLM o TGI).
- No se han publicado capacidades específicas como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

Dado que no se han documentado casos de uso oficiales, los siguientes son escenarios plausibles basados en el tamaño del modelo y su formato GGUF, pero no están confirmados por el autor:

- Chat local sin conexión: gracias a las cuantizaciones ligeras (Q2_K, Q3_K), el modelo puede ejecutarse en portátiles o equipos de sobremesa con GPUs de 6-8 GB de VRAM, permitiendo un asistente conversacional privado.
- Despliegue en servidores de inferencia: con cuantizaciones como Q4_K_M o Q5_K_M, puede alojarse en servicios como Ollama o llama.cpp para ofrecer una API de chat interna.
- Investigación académica sobre modelos islámicos: el modelo podría usarse para estudiar el comportamiento de LLMs en dominios religiosos, aunque se requiere verificar su fiabilidad.
- Prototipado de aplicaciones RAG: al ser un modelo de 14B, puede integrarse en pipelines de generación aumentada por recuperación para responder preguntas sobre textos islámicos, siempre que se valide su precisión.
- Educación y divulgación: como herramienta de consulta sobre cultura islámica, siempre que se contrasten las respuestas con fuentes autorizadas.
- Evaluación de cuantizaciones: para desarrolladores interesados en comparar el impacto de distintas cuantizaciones en la calidad de salida de un modelo de 14B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras pruebas estándar para este modelo ni para su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para un modelo de ~14,7B parámetros, los tamaños típicos de archivo son:
  - Q2_K: ~6 GB
  - Q4_K_M: ~8,5 GB
  - Q8_0: ~15 GB
  - f16: ~29 GB (aunque en este repo solo se ofrece f16, no f32)
- GPU recomendadas: una RTX 3060 12 GB puede manejar Q4_K_M; una RTX 4090 24 GB puede ejecutar Q8_0; para f16 se requiere una GPU con 32 GB o más (por ejemplo, A100 40 GB).
- Si cabe en consumer GPU: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a otro formato), TGI (con adaptadores). El formato GGUF es compatible con la mayoría de motores de inferencia local.
- Latencia y throughput: no se dispone de mediciones oficiales. En una RTX 4090, un modelo de 14B cuantizado a Q4_K_M suele generar entre 20 y 40 tokens por segundo, pero es una estimación general, no un dato verificado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de tamaño similar (por ejemplo, Qwen2.5-14B, Llama-3-8B, Mistral-7B). No hay datos de rendimiento ni de arquitectura del modelo base, por lo que no es posible realizar una comparación objetiva.

## Limitaciones y advertencias

- La licencia del modelo base es desconocida, lo que impide garantizar su uso comercial sin riesgo legal. Se recomienda contactar con el autor original (hozifa1) antes de cualquier despliegue productivo.
- Al ser una cuantización, existe una pérdida de precisión respecto a los pesos originales. Para tareas que requieran alta exactitud (por ejemplo, respuestas factuales), se recomienda usar cuantizaciones más altas (Q8_0 o f16).
- No hay información sobre sesgos o alucinaciones específicas. Dado el enfoque temático islámico, es posible que el modelo tenga sesgos religiosos o culturales que deben ser evaluados antes de su uso.
- La fecha de creación (2026-08-18) es futura, lo que sugiere que el repositorio puede ser experimental o tener metadatos incorrectos. Se debe verificar la integridad de los archivos antes de usarlo.
- El modelo no tiene descargas ni valoraciones, lo que indica que no ha sido probado por la comunidad. Su calidad es incierta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Faqih-R1-14B-Islamic-AI-GGUF
- Modelo original (hozifa1): https://huggingface.co/hozifa1/Faqih-R1-14B-Islamic-AI
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Proyecto relacionado (Muslim Learn AI): https://github.com/makmalhafizh/Muslim-Learn-AI
