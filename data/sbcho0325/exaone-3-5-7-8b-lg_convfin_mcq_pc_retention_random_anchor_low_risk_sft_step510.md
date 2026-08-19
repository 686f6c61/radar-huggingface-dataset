# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_low_risk_sft_step510

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) construido sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por el usuario sbcho0325. El nombre del modelo sugiere un fine-tuning supervisado (SFT) orientado a tareas de conversación financiera, preguntas de opción múltiple (MCQ) y retención de clientes, con una estrategia de anclaje aleatorio y perfil de bajo riesgo. Sin embargo, la model card no proporciona ninguna descripción detallada, datos de entrenamiento ni métricas de evaluación, por lo que la información disponible es extremadamente limitada.

El modelo base EXAONE 3.5, desarrollado por LG AI Research, es una familia de modelos de lenguaje instruction-tuned que incluye versiones de 2.4B, 7.8B y 32B parámetros, con soporte de contexto largo de hasta 32K tokens. Este adaptador concreto hereda las capacidades del modelo base de 7.8B, pero su comportamiento específico tras el fine-tuning no está documentado. Con cero descargas y cero likes, se trata de un experimento de investigación sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en EXAONE 3.5, con adaptador LoRA) |
| Parametros totales | 7.8B (modelo base) + adaptador LoRA (tamano del repo: 0.3 GB) |
| Parametros activos | No es MoE; todos los parametros del modelo base estan activos |
| Longitud de contexto | 32K tokens (heredada del modelo base EXAONE 3.5) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta cuantizacion estandar (fp16, int8, int4) |
| Idiomas soportados | No disponible (el modelo base EXAONE 3.5 soporta principalmente coreano e ingles, segun documentacion publica) |
| Licencia | No disponible (la licencia del modelo base EXAONE 3.5 es de LG AI Research, pero no se especifica aqui) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en EXAONE-3.5-7.8B-Instruct, un modelo transformer decoder-only con atención causal estándar y optimizaciones propias de LG AI Research para el seguimiento de instrucciones en escenarios reales. El fine-tuning se realizó mediante LoRA (Low-Rank Adaptation) utilizando la librería PEFT y el framework TRL (Transformers Reinforcement Learning), con un entrenamiento supervisado (SFT) del que se desconoce el paso exacto (el nombre indica "step510", probablemente el paso 510 del entrenamiento). No se proporciona información sobre el dataset utilizado, los hiperparámetros de entrenamiento, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO.

El nombre del modelo sugiere que el entrenamiento se centró en conversaciones financieras (convfin), preguntas de opción múltiple (mcq), retención de clientes (pc_retention) y un enfoque de bajo riesgo (low_risk), posiblemente con anclaje aleatorio (random_anchor) como técnica de aumento de datos o regularización. Sin embargo, estos son solo indicios del nombre y no hay confirmación técnica en la documentación.

## Capacidades

- Generacion de texto y conversacion: hereda las capacidades de EXAONE 3.5 Instruct para dialogos multi-turno y seguimiento de instrucciones.
- Razonamiento y conocimiento general: el modelo base de 7.8B tiene un rendimiento solido en tareas de razonamiento, aunque no se han publicado resultados especificos para este adaptador.
- Soporte de tool calling / function calling: no confirmado para este adaptador, aunque el modelo base EXAONE 3.5 no lo incluye de forma nativa segun la documentacion publica.
- Capacidades multilingues: no disponible; el modelo base esta optimizado principalmente para coreano e ingles.
- Capacidades especiales: el nombre sugiere un enfoque en tareas financieras y de retencion de clientes, pero no hay evidencia documentada de capacidades especificas mas alla del fine-tuning.

## Casos de uso

- Atencion al cliente en banca y seguros: el adaptador podria gestionar consultas de clientes sobre productos financieros, saldos, reclamaciones o renovaciones de polizas, aprovechando la ventana de contexto de 32K tokens para mantener conversaciones largas y contextualizadas.
- Evaluacion de riesgo crediticio conversacional: dado el nombre "low_risk", podria utilizarse para clasificar solicitudes de credito mediante preguntas de opcion multiple, aunque no hay datos que confirmen su precision.
- Formacion y simulacion de agentes financieros: en entornos de entrenamiento, el modelo podria simular clientes o evaluar respuestas de agentes humanos mediante preguntas tipo test (MCQ).
- Analisis de retencion de clientes: podria procesar historiales de interaccion y predecir la probabilidad de abandono, generando respuestas personalizadas para fidelizar clientes.
- Generacion de informes financieros simplificados: a partir de datos estructurados, podria redactar resumenes de estado de cuentas o explicaciones de productos en lenguaje natural.
- Chatbots de asesoramiento financiero de bajo riesgo: para consultas basicas y no vinculantes, donde se prioriza la seguridad y la evitacion de recomendaciones agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion ni comparacion con otros modelos. El unico dato relevante es que el modelo base EXAONE 3.5 7.8B obtuvo puntuaciones destacadas en tareas de seguimiento de instrucciones en escenarios reales segun el paper tecnico (arXiv:2412.04862), pero no hay datos especificos para este adaptador LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7.8B en fp16 requiere aproximadamente 16 GB de VRAM. Con cuantizacion int8 baja a unos 8 GB, y con int4 a unos 5-6 GB. El adaptador LoRA anade un coste minimo adicional (0.3 GB en disco, pero en memoria es despreciable).
- GPU recomendadas: para fp16 se necesita una GPU con al menos 16 GB (A100 40GB, RTX 4090, A10G). Con cuantizacion int4 puede ejecutarse en GPUs consumer de 8 GB como RTX 3070/4060 o incluso menos con tecnicas de offloading.
- Compatibilidad con consumer GPU: si, con cuantizacion adecuada cabe en GPUs de gama media-alta (RTX 3080/4080 con 10-12 GB).
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto con el modelo base. Se puede usar con transformers, vLLM (si soporta PEFT), llama.cpp (si se exporta a GGUF), Ollama (si se empaqueta) o TGI.
- Latencia y throughput: no disponible. Depende del hardware y la optimizacion. Como referencia, un modelo de 7.8B en una RTX 4090 con fp16 genera aproximadamente 50-80 tokens/segundo, pero no hay datos confirmados para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_low_risk_sft_step510 | 7.8B + LoRA | 32K | Finanzas, MCQ, retencion | No disponible | HuggingFace (0 descargas) |
| sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step510 | 7.8B + LoRA | 32K | Finanzas, MCQ, precision media | No disponible | HuggingFace |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (modelo base) | 7.8B | 32K | Instruccion general | Licencia propia de LG | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. El adaptador en cuestion es uno de varios experimentos del mismo autor con variaciones en el enfoque (random anchor vs accuracy, low risk vs medium), pero sin resultados publicados.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre el proceso de entrenamiento, datos utilizados, hiperparametros ni evaluacion. Cualquier uso en produccion es arriesgado sin validacion previa.
- Sin validacion comunitaria: cero descargas y cero likes indican que el modelo no ha sido probado ni revisado por terceros.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos potenciales en el dominio financiero.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion financiera incorrecta o inventada, lo que es especialmente peligroso en un dominio regulado.
- Licencia no especificada: el adaptador no declara licencia, y la del modelo base EXAONE 3.5 tiene restricciones de uso comercial que deben verificarse antes de cualquier despliegue.
- Limitaciones de idioma: el modelo base esta optimizado para coreano e ingles; su rendimiento en otros idiomas, incluido el espanol, no esta garantizado.
- Fecha de creacion anomal: el registro indica 2026-08-19, lo que sugiere un error de metadata o un modelo futuro, lo que anade incertidumbre sobre su origen.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_low_risk_sft_step510
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper tecnico de EXAONE 3.5 (arXiv): https://arxiv.org/abs/2412.04862
- Repositorio GitHub de EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Adaptador similar del mismo autor: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step510
