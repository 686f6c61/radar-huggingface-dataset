# EverVissionAI/jansaathi-legal-intent

## Resumen

EverVissionAI/jansaathi-legal-intent es un modelo de clasificación de intención legal desarrollado por EverVissionAI para el proyecto JanSaathi, una iniciativa de IA orientada al empoderamiento legal y cívico en India. El modelo parte de InLegalBERT, un transformer preentrenado sobre corpus legales indios, y ha sido fine-tuneado para identificar diez categorías de consultas legales. Se trata de un modelo encoder-only de tipo BERT con 109.489.930 parámetros, diseñado para clasificación de texto en inglés e hindi.

Su relevancia actual radica en ofrecer una solución ligera y de baja latencia para enrutar consultas legales sin depender de modelos frontera costosos. Según el repositorio del proyecto, el modelo se integra en un backend multiagente con LangGraph y un pipeline de RAG híbrido, lo que permite clasificar de forma rápida la intención del usuario antes de derivar la consulta a flujos especializados. La licencia Apache 2.0 facilita su uso comercial y su despliegue en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 109.489.930 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, hindi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only de tipo BERT, fine-tuneado sobre el modelo InLegalBERT de law-ai. InLegalBERT fue preentrenado sobre corpus legales de la Corte Suprema y las Altas Cortes de la India, lo que proporciona al modelo un conocimiento jurídico específico del contexto indio. El fine-tuning se realizó para la tarea de clasificación de intención en diez categorías legales. No se mencionan técnicas de RLHF ni DPO, ya que se trata de un modelo discriminativo, no generativo.

El backend del proyecto JanSaathi utiliza este modelo como motor de clasificación dentro de un sistema más amplio que combina LangGraph y un pipeline de RAG híbrido. La decisión de usar un modelo pequeño en lugar de API de modelos frontera responde a la necesidad de reducir costes y latencia en aplicaciones cívicas a gran escala.

## Capacidades

- Clasificación de texto en diez intenciones legales: `Cheque_Bounce`, `Civic_Scheme_Info`, `Consumer_Dispute`, `Criminal_FIR`, `Cybercrime`, `Legal_Notice_Contract`, `RERA_RealEstate`, `RTI`, `Tenant_Landlord`, `Workplace_Labour`.
- Soporte bilingüe en inglés e hindi.
- Inferencia de baja latencia al tratarse de un modelo de 109 millones de parámetros.
- Integración nativa con la librería Transformers de HuggingFace.
- Compatible con el pipeline `text-classification` y con `text-embeddings-inference` para despliegue en endpoints.
- No es generativo: no produce texto libre, solo etiquetas de clase.
- No soporta tool calling ni razonamiento multi-paso por sí mismo; su función es actuar como clasificador inicial en un sistema mayor.

## Casos de uso

- Enrutamiento de consultas en un chatbot legal: el modelo clasifica la intención de una consulta del usuario y la dirige al flujo o agente especializado correspondiente dentro de la aplicación JanSaathi.
- Clasificación de quejas de consumidores: identifica disputas de consumo para escalarlas a la autoridad competente o activar el proceso de mediación adecuado.
- Detección de cheques devueltos: clasifica consultas sobre cheques rebotados bajo la sección 138 para proporcionar asesoramiento específico sobre la normativa aplicable.
- Gestión de solicitudes RTI: detecta consultas sobre el derecho a la información y conecta al usuario con el proceso de solicitud de acceso a documentos públicos.
- Clasificación de disputas de alquiler: identifica problemas entre inquilinos y propietarios para sugerir acciones legales o de reclamación de fianzas.
- Identificación de casos de ciberdelincuencia: clasifica consultas sobre delitos informáticos para derivar a la unidad de cibercrimen o a los canales de denuncia adecuados.
- Clasificación de asuntos laborales y de trabajo: detecta conflictos laborales para orientar al usuario sobre sus derechos y los mecanismos de reclamación disponibles.
- Primer filtro en una app cívica de empoderamiento legal: el modelo actúa como clasificador inicial en tiempo real, reduciendo la carga de los sistemas de RAG y de los agentes posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32, dado que el modelo ocupa aproximadamente 0,4 GB en disco. Con cuantización, el requisito sería aún menor, aunque no se especifican los tipos de cuantización disponibles.
- GPU recomendada: ninguna; el modelo puede ejecutarse en CPU con una latencia aceptable para clasificación. Para producción con alta concurrencia, una GPU modesta como T4 o RTX 3060 sería suficiente.
- Compatible con consumer GPU: sí, cualquier GPU con más de 1 GB de VRAM.
- Opciones de despliegue: Transformers (Python), `text-embeddings-inference` para endpoints, y cualquier framework compatible con safetensors. El repositorio indica que se integra en un backend con LangGraph.
- Latencia y throughput: no se han publicado datos concretos, pero al ser un modelo de 109 millones de parámetros, la inferencia en CPU suele completarse en milisegundos.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables con datos concretos. El modelo parte de InLegalBERT, del que hereda la arquitectura base, pero no se ofrecen especificaciones de otros clasificadores legales para comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado específicamente sobre el contexto legal indio, por lo que su capacidad de generalización a otros sistemas jurídicos es limitada.
- Al ser un clasificador, no genera respuestas legales; cualquier asesoramiento debe ser proporcionado por los componentes posteriores del sistema.
- La longitud de contexto no está documentada en la información disponible, aunque al basarse en BERT es previsible que sea reducida en comparación con modelos de ventana larga.
- Riesgo de error en textos ambiguos o fuera de las diez clases definidas, lo que puede provocar una clasificación incorrecta si el sistema no contempla un fallback.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de exactitud jurídica ni de idoneidad para asesoramiento legal real.
- No se han publicado evaluaciones de sesgos ni resultados de benchmarks, por lo que se recomienda validar el modelo con datos propios antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EverVissionAI/jansaathi-legal-intent
- Repositorio del proyecto JanSaathi en GitHub: https://github.com/HimanshuArora-pixel/Jansathi-AI
