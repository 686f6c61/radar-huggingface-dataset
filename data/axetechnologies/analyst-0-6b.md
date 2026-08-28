# axetechnologies/analyst-0.6b

## Resumen

Analyst 0.6B es un modelo de lenguaje pequeño (0,6 mil millones de parámetros) desarrollado por AXe Technologies, una empresa canadiense especializada en infraestructura de IA soberana para industrias reguladas. Se trata de un ajuste fino (fine-tune) del modelo base Qwen3-0.6B de Alibaba, orientado específicamente al dominio de la consultoría y los servicios profesionales. Su propósito principal es actuar como un router rápido y clasificador de intenciones dentro de un pipeline multi-modelo, donde modelos más grandes (3B, 7B) se encargan de tareas de razonamiento complejo.

El modelo está diseñado para ejecutarse completamente en el dispositivo (on-device), con soporte nativo para Apple Silicon mediante MLX, y puede convertirse a GGUF para su uso con llama.cpp u Ollama. Con una ventana de contexto de 32K tokens y una licencia Apache 2.0, ofrece una opción ligera y de bajo coste para tareas de clasificación, construcción de llamadas a funciones y generación de SQL básico en entornos de consultoría. Su relevancia actual radica en la tendencia hacia arquitecturas multi-modelo donde un modelo pequeño y rápido actúa como primer filtro, reduciendo latencia y costes de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-0.6B) |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | MLX (safetensors), convertible a GGUF (q8_0 y otros) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Analyst 0.6B hereda la arquitectura del modelo base Qwen3-0.6B, un transformer decoder-only con atención causal estándar. No se han publicado detalles específicos sobre el número de capas, dimensiones ocultas o cabezas de atención, pero al tratarse de un modelo de 0,6B, se espera una configuración compacta adecuada para inferencia en dispositivos con recursos limitados. El ajuste fino se realizó mediante LoRA (Low-Rank Adaptation) con r=16, alpha=32 y 16 capas objetivo, sobre un conjunto de datos curado de interacciones del dominio de consultoría: decisiones de routing, comprobaciones de metodología, interpretación narrativa y pares de lenguaje natural a SQL.

El entrenamiento se llevó a cabo en una sola época (single epoch) con una tasa de aprendizaje de 1e-4, tamaño de lote de 2-4 y 400 iteraciones, utilizando un Mac Studio M2 Ultra con 64 GB de RAM y el framework MLX con mlx-lm. La elección de una sola época se justifica porque, según los autores, múltiples épocas degradan el rendimiento de modelos base ya instruidos. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tune.

## Capacidades

- Clasificacion de intenciones: identifica el proposito de una consulta del usuario (por ejemplo, solicitud de datos, pregunta metodologica, peticion de narrativa) y la enruta al modelo especialista adecuado.
- Construccion de llamadas a funciones (tool calling): parsea lenguaje natural en llamadas a funciones estructuradas, facilitando la integracion con APIs y herramientas externas.
- Generacion de SQL basico: traduce consultas en lenguaje natural a sentencias SQL para analitica de negocio, limitada a consultas simples.
- Redaccion de respuestas en tono profesional: genera borradores de respuestas con un registro formal y adecuado al contexto de consultoria.
- Ejecucion en el dispositivo: optimizado para Apple Silicon (MLX) y convertible a GGUF para otros entornos, lo que permite inferencia sin conexion y con baja latencia.
- Integracion en pipelines multi-modelo: disenado como primer paso de un sistema donde modelos de 3B y 7B se encargan de tareas de razonamiento mas complejas.

## Casos de uso

- Enrutamiento de consultas en un asistente de consultoria: el modelo clasifica la intencion de cada mensaje del usuario (por ejemplo, "muestrame ingresos por region" vs. "explica la metodologia de valoracion") y lo dirige al modelo especialista adecuado, reduciendo la carga computacional de los modelos grandes.
- Construccion de llamadas a funciones en un agente conversacional: a partir de una frase en lenguaje natural, genera la estructura JSON de la llamada a una API (por ejemplo, obtener datos de un CRM o ERP), permitiendo que el agente ejecute acciones concretas.
- Generacion de consultas SQL para analitica de negocio: convierte preguntas como "cual fue la facturacion del ultimo trimestre por cliente" en sentencias SQL basicas, utilizable en dashboards o herramientas de BI.
- Filtrado previo en un sistema de tickets de soporte: clasifica las solicitudes entrantes (incidencia, consulta, solicitud de cambio) y las asigna al flujo de trabajo correspondiente, mejorando la eficiencia operativa.
- Redaccion de borradores de respuestas en firmas de consultoria: genera textos preliminares con tono profesional para correos o informes, que luego un humano revisa y completa.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente en hardware propio (edge servers o Macs), permite procesar datos sensibles de clientes sin enviarlos a la nube, cumpliendo requisitos de soberania de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card declara una lista de resultados vacia, y no se encontraron evaluaciones independientes en la busqueda web. Por tanto, no es posible comparar cuantitativamente este modelo con alternativas en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,6B, en precision fp16 ocupa aproximadamente 1,2 GB de memoria; con cuantizacion q8_0 se reduce a unos 0,6 GB, y con cuantizaciones mas agresivas (q4) podria bajar a ~0,4 GB. Estas cifras son estimaciones basadas en el tamaño del modelo y no han sido confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; en Apple Silicon, un Mac con chip M1 o superior puede ejecutarlo sin problemas. No requiere GPU de datacenter.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU con suficiente RAM.
- Opciones de despliegue: MLX (nativo en Apple Silicon), llama.cpp (via conversion a GGUF), Ollama (si se publica un GGUF), y potencialmente vLLM o TGI si se convierten los pesos a formato compatible (aunque no hay soporte oficial documentado).
- Latencia y throughput: no se han publicado datos oficiales. Dado el tamaño reducido, se espera una latencia de decenas de milisegundos por token en hardware moderno, pero no hay mediciones verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| analyst-0.6b | 0,6B | 32K | Apache 2.0 | Consultoria, routing, tool calling | HuggingFace (MLX) |
| Qwen3-0.6B (base) | 0,6B | 32K | Apache 2.0 | Generico, multilingue | HuggingFace |
| Llama-3.2-1B | 1,2B | 128K | Llama 3.2 | Generico, multilingue | HuggingFace |
| Phi-3-mini | 3,8B | 128K | MIT | Generico, razonamiento | HuggingFace |

No se dispone de benchmarks comparativos entre estos modelos en el contexto de consultoria. La comparativa se limita a especificaciones tecnicas. analyst-0.6b se diferencia por su especializacion en el dominio y su optimizacion para MLX, mientras que los otros son modelos genericos con mayor capacidad de razonamiento pero sin ajuste especifico.

## Limitaciones y advertencias

- Optimizado exclusivamente para el dominio de consultoria y servicios profesionales; su rendimiento en tareas generales puede ser inferior al del modelo base Qwen3-0.6B.
- Con solo 0,6B de parametros, no es adecuado para razonamiento complejo o multi-paso; debe delegarse a modelos mas grandes (3B, 7B) en el pipeline.
- Solo soporta ingles; no hay soporte para otros idiomas, lo que limita su uso en entornos multilingues.
- La generacion de SQL se limita a consultas basicas; consultas complejas con joins multiples o subconsultas pueden fallar.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante entradas adversariales. Como todo modelo de lenguaje, puede generar contenido incorrecto o inventado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias; el usuario es responsable de validar su comportamiento en produccion.
- El entrenamiento se realizo con un conjunto de datos curado pero no se ha publicado informacion sobre su composicion exacta, tamano o posibles sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axetechnologies/analyst-0.6b
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo hermano analyst-3b: https://huggingface.co/axetechnologies/analyst-3b
- Modelo hermano analyst-7b: https://huggingface.co/axetechnologies/analyst-7b
- Sitio de AXe Technologies: https://axe.onl
- Plataforma Pulse (consultimi.com): https://consultimi.com
