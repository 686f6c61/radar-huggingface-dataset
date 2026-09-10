# Samalas/govcon-qwen-7b-lifecycle

## Resumen

GovCon Qwen-7B Lifecycle es un ajuste fino mediante LoRA sobre el modelo base `mlx-community/Qwen2.5-7B-Instruct-4bit`, desarrollado por el usuario Samalas y orientado exclusivamente a la gestion del ciclo de vida de la contratacion publica estadounidense (Government Contracting, GovCon). El modelo cubre las cinco fases tipicas de este dominio: presolicitacion (analisis de RFI), cumplimiento de RFP (parseo de FAR Part 15), debrief y protesta (argumentacion bajo FAR 15.506), ejecucion postadjudicacion (seguimiento de CDRL, CPARS y conciliacion de facturas) y radar de recompeticion (modelado de probabilidad de victoria).

Se trata de un adaptador de bajo rango (rank 64, alpha 32, dropout 0,05) entrenado con un conjunto muy reducido de 69 pares instruccion-respuesta en formato ChatML, repartidos en 55 ejemplos de entrenamiento y 14 de validacion. El entrenamiento se realizo en un Apple M2 Pro con 16 GB de memoria unificada usando MLX y Metal, con 600 iteraciones (aproximadamente 11 pasadas sobre el dataset completo) y una tasa de aprendizaje de 1e-5.

Su relevancia radica en ser un ejemplo de especializacion vertical de un LLM generalista de 7B sobre un nicho regulatorio muy concreto, con salida estructurada en JSON pensada para consumo programatico. No obstante, el tamano del dataset, la ausencia de licencia declarada y el hecho de que el repositorio no tenga descargas ni likes obligan a tratarlo como un experimento, no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura de Qwen2.5-7B-Instruct; no detallada en la model card) |
| Parametros totales | ~7.000 millones (7B, segun la model card). El modelo base Qwen2.5-7B-Instruct declara 7.610 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card. El modelo base Qwen2.5-7B-Instruct admite 32.768 tokens nativos y hasta 131.072 con YaRN |
| Tipos de cuantizacion | Modelo base en 4 bits (formato MLX). El adaptador LoRA se distribuye sin cuantizacion especificada |
| Idiomas soportados | No disponible (no declarado; hereda las capacidades multilingues del modelo base Qwen2.5) |
| Licencia | No disponible |
| Formato de pesos | Adaptador LoRA sobre base MLX 4-bit; formato exacto de los ficheros no disponible (tamano del repositorio: 0,0 GB) |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento completo, sino un adaptador LoRA de rango 64 y alpha 32 con dropout 0,05 aplicado sobre una version ya cuantizada a 4 bits de Qwen2.5-7B-Instruct (variante `mlx-community`). El entrenamiento se ejecuto con el framework MLX sobre Apple Silicon (M2 Pro, 16 GB de memoria unificada, backend Metal), con batch size 1, 600 iteraciones, learning rate 1e-5 y semilla 42. El dataset consta de 69 pares instruccion-respuesta en formato ChatML, con 55 ejemplos para entrenamiento y 14 para validacion, cubriendo 13-16 muestras por cada una de las cinco fases del ciclo GovCon. No se documentan fases de RLHF, DPO ni preferencias humanas.

La peculiaridad tecnica mas destacable es la combinacion poco habitual de entrenar sobre un modelo base ya cuantizado a 4 bits con MLX en hardware de consumo, en lugar de usar QLoRA estandar en GPU o un fine-tuning en precision completa. Esto reduce drasticamente los requisitos de hardware, pero limita la fidelidad numerica del ajuste. No se describe ninguna innovacion en atencion (no hay atencion lineal, decodificacion especulativa ni arquitectura hibrida SSM); la especializacion es puramente de datos y viene del sesgo del dataset hacia el dominio GovCon.

## Capacidades

- Generacion de texto estructurado, principalmente respuestas en JSON con contexto de fase, analisis y recomendaciones accionables.
- Extraccion de requisitos de avisos RFI/Sources Sought, con arrays de requisitos, prioridades y estrategia de respuesta recomendada.
- Parseo de documentos de solicitud FAR Part 15 (secciones A-M), mapeo de requisitos a secciones de propuesta y deteccion de ambiguedades.
- Generacion de matrices de cumplimiento y listas de verificacion de atestaciones.
- Analisis de debrief y redaccion de argumentos de protesta segun FAR 15.506 (claim, premise, question).
- Generacion de matrices de seguimiento de CDRL y planificacion de hitos con calendario de pagos.
- Monitorizacion de tendencias CPARS y conciliacion de facturas contra lineas CLIN.
- Modelado de probabilidad de victoria en recompeticiones mediante puntuacion bayesiana (segun la model card).
- Formato de prompt ChatML compatible con Qwen2.5-Instruct.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision, audio o modo "thinking": no disponibles.
- Capacidades multilingues: no declaradas explicitamente (heredadas del modelo base).

## Casos de uso

- Analisis de RFI en fase de presolicitacion: el modelo extrae requisitos de capacidad de un aviso Sources Sought y los devuelve como JSON con `req_id`, tipo, texto y prioridad, lo que permite alimentar automaticamente una matriz de captura.
- Generacion de matrices de cumplimiento de RFP: a partir de una seccion L o M, produce una lista de metricas de calidad, requisitos de reporte, penalizaciones y SLA, util para que el equipo de propuestas detecte huecos antes del envio.
- Deteccion de ambiguedades en solicitudes: identifica lenguaje que requiere aclaracion del organismo contratante, reduciendo el riesgo de interpretaciones erroneas en la oferta.
- Preparacion de protestas: analiza la retroalimentacion de un debrief, contrasta puntuaciones tecnicas, de coste y de desempeno pasado, y redacta un argumento de protesta con premisa, claim y pregunta, orientado a equipos legales o de captura.
- Gestion postadjudicacion: convierte un calendario de hitos en una matriz de seguimiento CDRL con dependencias y un calendario de pagos asociado, agilizando el control de programa.
- Monitorizacion de CPARS y conciliacion financiera: cruza facturas con lineas CLIN y detecta desviaciones de coste o calendario que requieren accion correctiva.
- Inteligencia competitiva y radar de recompeticion: estima probabilidades de victoria, compara CPARS del incumbente con el desempeno propio y propone diferenciadores, apoyando decisiones bid/no-bid.
- Asistencia a capture managers: como copiloto interno que transforma texto normativo en estructuras de datos accionables dentro de herramientas de propuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que el modelo se entreno sobre 69 escenarios representativos con una sobremuestreo de aproximadamente 11x, y advierte de riesgo de alucinacion en escenarios poco representados. No hay cifras de MMLU, HumanEval, GSM8K ni de ninguna evaluacion especifica del dominio GovCon.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados para un modelo de 7B, ya que la model card no los especifica):
  - 4 bits: en torno a 4-5 GB.
  - 8 bits: en torno a 8 GB.
  - FP16: en torno a 15 GB.
  - Adaptador LoRA: peso despreciable (menos de 100 MB).
- GPU recomendadas: para 4 bits, cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090); para FP16, A100, H100 o RTX 4090 con 24 GB.
- Cabe en GPU de consumo: si, en cualquiera con 8-12 GB en configuracion de 4 bits; es el escenario natural dado que el modelo base ya esta cuantizado a 4 bits.
- Entrenamiento original: Apple M2 Pro con 16 GB de memoria unificada y MLX Metal (batch size 1).
- Opciones de despliegue: MLX (mlx-lm) de forma nativa; llama.cpp, Ollama o LM Studio tras convertir el adaptador a GGUF; vLLM o TGI si se exporta a safetensors en precision completa. La model card no documenta ningun procedimiento de despliegue ni fusion del adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas declaradas. Los datos del modelo base y de las alternativas provienen de sus respectivas fichas publicas y no de la model card analizada.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GovCon Qwen-7B Lifecycle | 7B + adaptador LoRA r=64 | No especificado (base admite 32K nativos) | No disponible | Especializado en ciclo GovCon (EE. UU.) | Repositorio con 0 descargas, sin licencia declarada |
| Qwen2.5-7B-Instruct | 7.610 M | 32.768 nativos, 131.072 con YaRN | Apache 2.0 (segun modelo base) | Generalista instruction-tuned | Ampliamente disponible |
| Qwen2.5-7B-Instruct-4bit (MLX) | 7.610 M cuantizado a 4 bits | Igual que el base | Apache 2.0 (segun repositorio MLX) | Version cuantizada para Apple Silicon | Ampliamente disponible |
| Ajustes verticales de 7-8B sobre nichos regulatorios | ~7-8B | Variable | Variable | Especializacion de dominio con datasets pequenos | Habitualmente prototipos |

No se identifican en la informacion proporcionada competidores directos publicados especificamente para el ciclo de contratacion publica estadounidense con los que comparar de forma objetiva.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (69 pares, 55 de entrenamiento y 14 de validacion) y de naturaleza sintetica/representativa, segun reconoce la propia model card.
- Riesgo elevado de alucinacion: el autor advierte explicitamente de que el modelo puede inventar detalles en escenarios poco representados, por lo que las respuestas deben validarse contra los documentos de solicitud reales.
- Cobertura incompleta de procesos gubernamentales: la model card senala que puede no cubrir todos los procesos unicos de cada organismo.
- Longitud de contexto no declarada; no se garantiza el comportamiento en documentos largos de RFP (que suelen superar decenas de miles de tokens).
- Idiomas no declarados: aunque el modelo base es multilingue, no hay evidencia de que el ajuste funcione fuera del ingles juridico-administrativo estadounidense.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido, lo que supone un riesgo legal para adopcion en produccion.
- El repositorio de HuggingFace muestra un tamano de 0,0 GB, sin pipeline ni idiomas declarados y con 0 descargas, lo que apunta a un artefacto incompleto o no validado por terceros.
- El entrenamiento sobre un modelo base ya cuantizado a 4 bits puede introducir degradacion respecto a un fine-tuning en mayor precision.
- No hay documentacion sobre tool calling, agentes, integracion con RAG ni procedimientos de fusion del adaptador con el modelo base.
- Fechas de creacion y actualizacion del repositorio (2026-09-10) resultan inconsistentes con un uso en produccion a corto plazo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Samalas/govcon-qwen-7b-lifecycle
- Modelo base cuantizado: https://huggingface.co/mlx-community/Qwen2.5-7B-Instruct-4bit
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Framework MLX: https://github.com/ml-explore/mlx
- Referencia normativa citada por el modelo: FAR Part 15 y FAR 15.506 (no se han proporcionado enlaces directos en la informacion disponible)
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente un resultado no relacionado).
