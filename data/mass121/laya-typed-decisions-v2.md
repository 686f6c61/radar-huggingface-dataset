# Mass121/laya-typed-decisions-v2

## Resumen
Laya (fine-tuned on Typed-Decisions Benchmark) es un modelo de decisión de tipo System 1 desarrollado por Convai Innovations (distribuido en el Hub por el usuario Mass121) y publicado bajo licencia Apache 2.0. No es un modelo generativo al uso: se trata de un motor de decisión no autorregresivo que, en una sola pasada forward, evalúa un estado de workflow (texto, correo, ticket o JSON) frente a preguntas tipadas y devuelve respuestas estructuradas —elección tipada, puntuación numérica o decisión sí/no— con probabilidades calibradas, sin generar prosa.

El checkpoint contiene 421.293.830 parámetros y se ha ajustado sobre los 1.200 casos de entrenamiento (6.000 decisiones) del benchmark independiente LocalLLaMA/typed-decisions, que cubre cuatro flujos de trabajo: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad. El modelo declara una precisión de 0,776 sobre el conjunto de test oficial de 400 casos (2.000 decisiones), superando a TypeSafe Jev 1.13.0 (0,727) y al techo de autoacuerdo del profesor (0,735).

Es relevante ahora porque propone un enfoque distinto al de los LLM autorregresivos para tareas de decisión: en lugar de generar texto para luego parsearlo, produce decisiones estructuradas y calibradas en un único paso, con una latencia p50 declarada de 131,4 ms y coste autoconsumido. Esto lo orienta a pipelines de agentes y sistemas de triaje donde la latencia, la calibración y el coste por caso son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo ("System 1 decision engine"), una pasada forward |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 100+ idiomas segun la familia Laya; no confirmado especificamente para este checkpoint |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La familia Laya se describe como un motor de decisión no autorregresivo de tipo System 1: en lugar de generar tokens secuencialmente, realiza una única pasada forward sobre el estado del workflow y las preguntas tipadas para producir respuestas estructuradas (elección tipada, score y sí/no) con probabilidades calibradas. El proyecto incorpora un router que selecciona el checkpoint adecuado por petición y emplea RLCD (reinforcement learning con datos contrastivos, segun las etiquetas del modelo) para mejorar la calibración. Se desconoce la composición exacta del corpus de preentrenamiento y el número total de tokens utilizados.

Este checkpoint concreto es un ajuste fino sobre los 1.200 casos de entrenamiento (6.000 decisiones) del benchmark LocalLLaMA/typed-decisions. El autor no documenta en la información disponible detalles sobre el proceso de ajuste (épocas, hiperparámetros, uso de RLHF/DPO específico), por lo que esos datos deben considerarse no disponibles.

## Capacidades
- Decisiones tipadas: elección entre opciones, asignación de puntuación numérica y decisiones binarias sí/no en una sola pasada forward.
- Probabilidades calibradas: devuelve confianza calibrada (ECE declarado de 0,027 y Brier score de 0,086), apta para umbrales y enrutamiento.
- Procesamiento de estados de workflow: pensado para texto, correo, tickets y JSON.
- Flujos cubiertos por el ajuste: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad.
- Multilingüe: la familia Laya declara más de 100 idiomas mediante un router; no confirmado para este checkpoint.
- No genera prosa: no es un modelo de chat ni de generación de texto libre.
- No hay información disponible sobre tool calling, function calling, soporte de agentes multi-paso, visión o audio.

## Casos de uso
- Triaje de tickets de atención al cliente: el modelo puede clasificar y priorizar cada ticket respondiendo preguntas tipadas (categoría, urgencia, decisión de escalado) con una sola inferencia de baja latencia (p50 declarado de 131,4 ms), sin coste por token de API.
- Enrutamiento en pipelines de agentes: dada una traza de agente, decidir si la ejecución es correcta, anómala o requiere revisión, con probabilidad calibrada que permite fijar umbrales de intervención humana.
- Validación de facturas: extraer decisiones estructuradas (aprobar, rechazar, marcar para revisión) sobre documentos en formato JSON o texto, integrándose en sistemas de cuentas a pagar.
- Clasificación de incidentes de seguridad: asignar severidad y tipo a alertas o informes, con una salida calibrada que reduce falsos positivos frente a clasificadores sin calibración.
- Filtrado previo a un LLM generativo: usar Laya como capa de decisión rápida y barata que decide si una petición necesita un modelo mayor, reduciendo coste y latencia en el conjunto del sistema.
- Control de calidad con umbrales de confianza: en workflows automatizados, aceptar decisiones por encima de un umbral de probabilidad y derivar el resto a revisión humana, aprovechando la calibración declarada.
- Moderación o etiquetado binario a escala: aplicar decisiones sí/no sobre grandes volúmenes de texto autoconsumiendo el modelo, con coste por caso nulo (autohospedado).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el conjunto de test oficial de 400 casos (2.000 decisiones) del benchmark System One Decision Benchmark / Typed Decisions:

| Modelo | Tipo | Accuracy | Soft Acc | Brier score | ECE | Score MAE | Within 1 nivel | Latencia (p50) | Coste/caso |
|---|---|---|---|---|---|---|---|---|---|
| Laya (este modelo) | fine-tuned | 0,776 | 0,617 | 0,086 | 0,027 | 0,260 | 0,989 | 131,4 ms | 0,00 USD (autohospedado) |
| TypeSafe Jev 1.13.0 | general | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 | 710 ms | 0,0004 USD (API) |
| ModernBERT-base (149M) | specialist | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 | 349 ms | 0,00 USD |
| Teacher Self-Agreement | techo | 0,735 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Métricas agregadas del model-index: accuracy 0,776 y brier_score 0,086 (ambas marcadas como no verificadas).

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,9 GB en FP16 y 1,7 GB en FP32, dado el tamaño de 421 M de parámetros. No se documentan formatos cuantizados ni GGUF.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas consumer como RTX 3060, RTX 4060, RTX 4070 o superiores pueden ejecutarlo con holgura. También es viable en GPU de datacenter (A100, H100) por sobra de capacidad, aunque no aportan ventaja significativa por tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna con 2 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: la vía documentada es la librería `laya` (`pip install laya`) con la API `laya.load("Mass121/laya-typed-decisions-v2")` y `agent.predict(state, questions)`. También se indica compatibilidad con Transformers. No hay información publicada sobre soporte en vLLM, llama.cpp, Ollama o TGI; al ser un modelo no autorregresivo, es probable que estas pilas estándar no apliquen directamente.
- Latencia y throughput: latencia p50 declarada de 131,4 ms por caso en el benchmark. No se publican cifras de throughput ni latencia p99.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Accuracy | Brier score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Laya (este modelo) | 421 M | fine-tuned, decision engine | 0,776 | 0,086 | Apache 2.0 | Hugging Face (Mass121) |
| TypeSafe Jev 1.13.0 | no disponible | general | 0,727 | 0,148 | no disponible | API |
| ModernBERT-base | 149 M | specialist | 0,646 | 0,119 | no disponible | no disponible |
| Teacher Self-Agreement | no disponible | techo de referencia | 0,735 | no disponible | no disponible | no disponible |

Comparativas adicionales de contexto: la familia Laya (checkpoint principal en convaiinnovations/laya-typed-decisions) parte del mismo enfoque no autorregresivo; no se dispone de métricas de esa variante en la información proporcionada.

## Limitaciones y advertencias
- Las métricas declaradas (accuracy 0,776 y brier 0,086) figuran como no verificadas en el model-index; proceden del propio autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni de validación independiente.
- No está diseñado para generación de texto libre ni conversación; no debe usarse como un LLM generalista.
- No hay información sobre longitud de contexto, lo que impide garantizar su comportamiento con entradas muy largas.
- El soporte de 100+ idiomas se atribuye a la familia Laya mediante un router; no está confirmado para este checkpoint concreto y podría degradarse fuera del inglés.
- Riesgo de alucinación en el sentido de decisiones mal calibradas: aunque el ECE declarado es bajo, no hay evaluación independiente que lo confirme.
- No se documentan sesgos conocidos ni composición del dataset de ajuste, lo que dificulta evaluar disparidades por dominio o idioma.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del dataset de ajuste (LocalLLaMA/typed-decisions) antes de desplegarlo en producción.
- Al ser un modelo no autorregresivo, las pilas de servicio convencionales para LLM (vLLM, TGI, llama.cpp, Ollama) pueden no soportarlo; el despliegue está ligado a la librería `laya`.
- El repositorio ocupa 2,5 GB frente a los ~0,9 GB de pesos en FP16, lo que sugiere artefactos adicionales; conviene revisar su contenido antes de desplegar.

## Enlaces
- Modelo en Hugging Face (Mass121): https://huggingface.co/Mass121/laya-typed-decisions-v2
- Modelo en Hugging Face (Convai Innovations): https://huggingface.co/convaiinnovations/laya-typed-decisions
- Versión anterior del modelo: https://huggingface.co/Mass121/laya-typed-decisions
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio GitHub: https://github.com/NandhaKishorM/laya
- Sitio del proyecto: https://laya.convaiinnovations.com/
- Sitio alternativo: https://layaai.org/
- Perfil del desarrollador: https://huggingface.co/convaiinnovations
