# mradermacher/Solar-Decision-JEV-27B-V2-GGUF

## Resumen

Solar-Decision-JEV-27B-V2-GGUF es una colección de cuantizaciones GGUF en formato estático del modelo SargeDev/Solar-Decision-JEV-27B-V2, realizadas por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un modelo de decisión de 27.320.697.856 parámetros (27B) entrenado sobre los datasets jev-distill-corpus-v3 y solar-decisions-corpus-v4 de SargeDev, y está orientado a tareas de decisión tipificada ("typed decisions"), calibración de probabilidades y puntuación, siguiendo la filosofía "system-one" (respuestas directas sin cadena de razonamiento explícita, tal como sugiere el tag "noul").

El modelo se presenta como uncensored y abliterated, lo que significa que se han eliminado o reducido sus mecanismos de rechazo por seguridad, algo que los desarrolladores deben tener en cuenta según su caso de uso. Incluye el tag "qwen3.8" y "solar-jev", lo que apunta a una base arquitectónica relacionada con la familia Qwen3 y al proyecto Solar JEV, aunque la model card no detalla la arquitectura exacta. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

Esta versión GGUF es especialmente relevante para ejecutar el modelo localmente en hardware de consumo o servidores modestos, con cuantizaciones que van desde los 11 GB (Q2_K) hasta los 29,1 GB (Q8_0), cubriendo desde GPUs de gama alta de consumo hasta estaciones de trabajo multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags sugieren base relacionada con Qwen3, "qwen3.8") |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no describe la arquitectura interna del modelo base. Los tags "qwen3.8" y "solar-jev" sugieren que se trata de un modelo derivado o basado en la familia Qwen3 (posiblemente un fine-tune de un modelo de 27B tipo Gemma o Qwen, aunque el dato exacto no está disponible en la información proporcionada). El tag "noul" y la etiqueta "system-one" indican que el modelo está diseñado para emitir decisiones directas sin generar razonamiento paso a paso (chain-of-thought), un enfoque que reduce latencia y coste de tokens en tareas de clasificación y elección.

El entrenamiento se realizó sobre dos datasets: SargeDev/jev-distill-corpus-v3 (aparentemente un corpus de destilación para el marco JEV) y SargeDev/solar-decisions-corpus-v4 (un corpus de decisiones). Los tags "calibrated-probabilities", "typed-decisions", "choice" y "score" apuntan a un modelo especializado en producir decisiones tipificadas con probabilidades calibradas, en lugar de texto conversacional generalista. No hay información disponible sobre el número de tokens de entrenamiento, el uso de RLHF/DPO ni otras técnicas de alineamiento. Los tags "uncensored" y "abliterated" indican que se aplicó alguna técnica de eliminación de rechazos sobre el modelo.

## Capacidades

- Emisión de decisiones tipificadas ("typed decisions"): el modelo está especializado en elegir entre opciones definidas en lugar de generar texto libre.
- Puntuación ("score") y probabilidades calibradas: diseñado para asignar valores numéricos con calibración, útil en pipelines de evaluación automática.
- Modo "system-one" / "noul": respuestas directas sin razonamiento explícito, lo que reduce el número de tokens generados por decisión.
- Generación de texto conversacional (tag "conversational"), aunque su especialización es la toma de decisiones.
- Modelo uncensored/abliterated: sin capa de rechazos por seguridad, lo que permite su uso sin filtros pero exige controles externos.
- Idioma principal: inglés; no hay soporte declarado para otros idiomas.
- No hay información disponible sobre tool calling, capacidades de agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Clasificación y enrutado de peticiones en pipelines LLM: dado su enfoque en decisiones tipificadas y probabilidades calibradas, puede actuar como router que clasifica consultas de usuario y las dirige al modelo o agente adecuado, con baja latencia al no generar razonamiento.
- Evaluación automática de salidas de otros LLM (LLM-as-judge): el tag "score" y las probabilidades calibradas lo hacen adecuado para puntuar respuestas de forma sistemática en benchmarks o evaluaciones continuas de calidad.
- Moderación y filtrado de contenido: puede usarse como clasificador binario o multiclase para decidir si un texto cumple criterios definidos, aunque al estar abliterated el criterio debe definirse externamente.
- Selección entre opciones en sistemas de agentes: en arquitecturas multi-agente, puede encargarse de la etapa de elección (choice) entre acciones candidatas sin el coste de un LLM generalista generando cadenas de razonamiento largas.
- Anotación de datasets a escala: su especialización en decisiones y puntuaciones lo hace útil para etiquetar grandes volúmenes de datos en inglés de forma económica cuando se ejecuta cuantizado localmente.
- Experimentación local con modelos de decisión: la disponibilidad de cuantizaciones desde 11 GB permite investigar el comportamiento de modelos "system-one" en hardware de consumo sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin KV cache):
  - Q2_K: 11,0 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: 12,4-14,7 GB
  - IQ4_XS: 15,5 GB
  - Q4_K_S / Q4_K_M: 15,9-16,9 GB
  - Q5_K_S / Q5_K_M: 19,1-19,6 GB
  - Q6_K: 22,5 GB
  - Q8_0: 29,1 GB
- GPUs recomendadas: para las cuantizaciones Q4 (15,9-16,9 GB), una RTX 4090 (24 GB) o RTX 3090 es suficiente dejando margen para el contexto; Q6_K y Q8_0 requieren 24 GB con contexto ajustado o una A100/H100 de 40-80 GB para contextos largos.
- Cabe en GPU de consumo: sí, en una RTX 3090 o 4090 con las cuantizaciones hasta Q5_K_M; con GPUs de 16 GB (RTX 4080/4060 Ti 16 GB) es viable Q3_K_M o IQ4_XS con descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No está pensado para vLLM o TGI en formato GGUF (se requeriría el modelo base en safetensors).
- Latencia y throughput: no disponible; al tratarse de un modelo "system-one" sin cadena de razonamiento, el número de tokens generados por decisión debería ser bajo, lo que favorece latencias bajas en la tarea para la que está diseñado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Especializacion |
|---|---|---|---|---|
| Solar-Decision-JEV-27B-V2 (este) | 27B | GGUF (11-29 GB) | Apache 2.0 | Decisiones tipificadas, scores, probabilidades calibradas |
| Qwen3-30B-A3B | 30B (3B activos, MoE) | GGUF, safetensors | Apache 2.0 | Generalista con thinking mode |
| Gemma 3 27B | 27B | GGUF, safetensors | Licencia Gemma | Generalista multimodal |

Nota: no hay datos de rendimiento publicados que permitan comparar calidad de forma objetiva; la comparativa se limita a categoria de tamano y licencia. La ventaja diferencial de este modelo es su especializacion en decisiones con probabilidades calibradas frente a los generalistas de su rango de tamano.

## Limitaciones y advertencias

- Modelo uncensored y abliterated: carece de salvaguardas de seguridad incorporadas. En produccion es obligatorio anadir capas externas de moderacion y filtrado.
- Idioma: entrenado y etiquetado solo para ingles; su rendimiento en castellano no esta documentado y probablemente sea inferior o no fiable.
- Longitud de contexto no documentada: debe verificarse en el modelo base antes de disenar aplicaciones con documentos largos.
- Son cuantizaciones estaticas: mradermacher indica que las quants weighted/imatrix no estan disponibles por el momento, por lo que las cuantizaciones bajas (Q2_K, Q3_K) pueden perder calidad respecto a futuras versiones con imatrix.
- Riesgo de alucinacion: no hay datos publicados; al ser un modelo especializado en decisiones, fuera de su dominio (texto libre generalista) su comportamiento no esta documentado.
- Sin benchmarks publicados: no es posible verificar su calidad de forma objetiva antes de la evaluacion propia.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero debe respetarse la atribucion y la notificacion de cambios segun los terminos de la licencia.
- La model card del cuantizador no describe el modelo base en detalle: conviene consultar la ficha de SargeDev/Solar-Decision-JEV-27B-V2 para informacion completa sobre plantillas de prompt y uso correcto.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Solar-Decision-JEV-27B-V2-GGUF
- Modelo base: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V2
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Solar-Decision-JEV-27B-V2-GGUF
- Dataset jev-distill-corpus-v3: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset solar-decisions-corpus-v4: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
