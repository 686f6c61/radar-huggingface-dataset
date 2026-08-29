# mradermacher/plateclerk-verdict-1.5b-GGUF

## Resumen

plateclerk-verdict-1.5b es un modelo de clasificación de texto diseñado para predecir si una matrícula personalizada (vanity plate) solicitada al Departamento de Vehículos Motorizados (DMV) de California será aprobada o rechazada. El modelo recibe como entrada la cadena de la placa y el significado declarado por el solicitante, y devuelve un veredicto. Está desarrollado por BlazingCustoms y cuantizado por mradermacher en formato GGUF para su uso con llama.cpp y motores compatibles.

El modelo se basa en Qwen2 con una arquitectura de 1.500 millones de parámetros, ajustado mediante LoRA sobre el dataset DarwinAnim8or/DMV-Plate-Review. Su pipeline es text-classification, lo que lo convierte en una herramienta especializada para un caso de uso muy concreto: la revisión automatizada de solicitudes de matrículas personalizadas. La relevancia actual radica en que ofrece una solución de código abierto para un proceso administrativo que normalmente requiere revisión manual, con licencia Apache 2.0 que permite uso comercial.

La versión GGUF incluye múltiples cuantizaciones que van desde Q2_K (0,8 GB) hasta f16 (3,2 GB), lo que permite desplegarlo incluso en hardware modesto. El modelo está etiquetado como "not-for-all-audiences" y solo soporta inglés, lo que limita su uso a contextos donde el idioma sea el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) con adaptador LoRA |
| Parametros totales | 1.543.714.304 (1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen2, un transformer decoder-only con normalización RMSNorm y atención con sesgo de atención (attention bias). El ajuste se realizó mediante LoRA (Low-Rank Adaptation), lo que implica que solo se entrenaron matrices de baja dimensión sobre los pesos congelados del modelo base. El dataset de entrenamiento es DarwinAnim8or/DMV-Plate-Review, que contiene ejemplos de solicitudes de matrículas personalizadas con su veredicto. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo está diseñado para clasificación de texto, no para generación, por lo que su salida es una etiqueta de veredicto (aprobado/rechazado) en lugar de texto libre.

## Capacidades

- Clasificación de texto: predice si una matrícula personalizada será aprobada o rechazada por el DMV de California.
- Entrada dual: procesa la cadena de la placa y el significado declarado por el solicitante.
- Especialización en el dominio de placas de matrícula: entrenado específicamente con datos del DMV.
- Soporte de tool calling: no disponible (modelo de clasificación, no generativo).
- Soporte de agentes: no aplicable.
- Capacidades multilingües: solo inglés.
- Modo thinking: no disponible.

## Casos de uso

- Automatización de revisión de solicitudes de matrículas personalizadas: el modelo puede integrarse en un sistema backend que reciba solicitudes de placas y devuelva un veredicto preliminar, reduciendo la carga de revisión manual en oficinas del DMV o servicios de terceros.
- Validación previa en aplicaciones de reserva de matrículas: una web o app que permita a los usuarios comprobar si su placa deseada tiene probabilidades de ser aceptada antes de enviar la solicitud oficial, mejorando la experiencia de usuario.
- Filtrado de contenido ofensivo en placas: el modelo puede detectar combinaciones de letras y significados que probablemente sean rechazados por infringir normas de decencia o contenido inapropiado, sirviendo como herramienta de moderación automática.
- Análisis de tendencias en solicitudes rechazadas: las entidades gubernamentales pueden usar el modelo para analizar patrones de rechazo y ajustar sus políticas o comunicar mejor los criterios a los solicitantes.
- Integración en pipelines de procesamiento de formularios: combinado con OCR y extracción de datos, el modelo puede clasificar automáticamente solicitudes en lote, generando un informe de aprobaciones y rechazos para revisión humana posterior.
- Herramienta educativa para solicitantes: un servicio que explique por qué una placa podría ser rechazada, ayudando a los usuarios a elegir alternativas válidas antes de pagar tasas oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Al ser un modelo de clasificación especializado, las métricas relevantes serían precisión, recall y F1 sobre el dataset DMV-Plate-Review, pero no se han proporcionado.

## Requisitos de hardware

- VRAM estimada: con cuantizaciones GGUF, el modelo ocupa entre 0,8 GB (Q2_K) y 3,2 GB (f16). Para inferencia con Q4_K_M (1,1 GB) se necesitan aproximadamente 2 GB de VRAM considerando overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1650, RTX 2060 o superiores funcionan sin problemas. También puede ejecutarse en CPU con llama.cpp.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluso en iGPUs con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. También se puede usar el modelo base safetensors con transformers y vLLM si se necesita mayor throughput.
- Latencia y throughput: no disponible, pero al ser un modelo de 1,5 B con cuantización Q4, se espera una latencia de decenas de milisegundos por inferencia en GPU moderna y de unos pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (clasificación de matrículas personalizadas). Como referencia de arquitectura, se puede comparar con otros modelos Qwen2 de tamaño similar, pero no son funcionalmente equivalentes. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó con datos del DMV de California, por lo que sus decisiones reflejan los criterios específicos de esa entidad, que pueden no generalizar a otras jurisdicciones.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, pero puede producir falsos positivos o negativos en la clasificación.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, pero al ser un modelo de clasificación de entradas cortas (placas y significados), es poco relevante.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo está etiquetado como "not-for-all-audiences", lo que sugiere que puede generar contenido inapropiado si se usa fuera de su dominio.
- Limitaciones de idioma: solo inglés, no soporta otros idiomas.
- Caveat para producción: el modelo debe ser evaluado con datos reales del DMV antes de usarse en producción, ya que no se han publicado métricas de rendimiento. La decisión final de aprobación debe recaer en un humano.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/plateclerk-verdict-1.5b-GGUF
- Modelo base: https://huggingface.co/BlazingCustoms/plateclerk-verdict-1.5b
- Página de modelo de mradermacher: https://hf.tst.eu/model#plateclerk-verdict-1.5b-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil de mradermacher: https://huggingface.co/mradermacher
- API e inference endpoint en FriendliAI: https://friendli.ai/models/BlazingCustoms/plateclerk-verdict-1.5b
