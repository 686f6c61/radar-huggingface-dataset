# Cognicalls/digital-twin-xlmr-nextmove

## Resumen

Digital Twin: persona-conditioned next-move model es un modelo de clasificación de acciones conversacionales desarrollado por Cognicalls en el marco del Netcompany Hackathon Athens 2026 (Challenge 1, "AI: Your digital self"). Se trata de un fine-tuning de `FacebookAI/xlm-roberta-base` (278M parámetros en fp32) al que se le añade una rama de vector de persona y cuatro cabezas de clasificación independientes que predicen, a partir de los últimos turnos de una llamada de ventas en griego, cuál será el siguiente acto de diálogo del agente, en qué fase de la llamada se encuentra, cuál fue la última intención del cliente y qué tipo de objeción planteó.

El modelo resuelve un problema concreto de modelado de comportamiento: dado un contexto conversacional y un perfil de agente (persona), predecir la siguiente acción del agente comercial antes de generar la respuesta textual. Forma parte de un sistema mayor, Cognicalls Twin, que usa esta predicción para seleccionar el siguiente movimiento y después redactar la réplica en el estilo medido del agente. Si los pesos no están disponibles, la aplicación cae a estadísticas basadas en conteo.

Es relevante como ejemplo de arquitectura multi-cabeza sobre un encoder multilingüe, entrenada exclusivamente con datos sintéticos (seis personas ficticias de telesventa griega, 949 llamadas) y con particiones disjuntas por escenario. Su alcance es de prototipo de investigación: no generaliza a personas nuevas sin reentrenamiento y solo cubre el idioma griego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con rama de vector de persona y cuatro cabezas de clasificación |
| Parametros totales | 278M (encoder base, fp32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de xlm-roberta-base, no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | griego (el) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`best.pt`); tokenizer y config del encoder en `export/` |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un encoder transformer de 278M parámetros, y le añade una rama de vector de persona (persona vector branch) más cuatro cabezas de clasificación: `action` (18 clases, siguiente acto de diálogo del agente según taxonomía/4), `stage` (9 clases, fase actual de la llamada), `cust_intent` (16 clases, última intención del cliente) y `cust_objection` (11 clases, tipo de objeción del cliente). La predicción se condiciona al perfil del agente mediante el vector de persona, de modo que el mismo contexto conversacional puede producir predicciones distintas según la persona modelada.

El entrenamiento se realizó únicamente sobre un dataset completamente sintético: seis personas ficticias de telesventa griega, 949 llamadas en total, con particiones disjuntas por escenario (677 de entrenamiento, 118 de validación y 154 de test). No se usaron datos personales reales. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco menciona innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Predicción del siguiente acto de diálogo del agente entre 18 clases (taxonomía/4).
- Clasificación de la fase actual de la llamada entre 9 etapas.
- Clasificación de la última intención del cliente entre 16 clases.
- Clasificación del tipo de objeción del cliente entre 11 clases.
- Condicionamiento por persona: el vector de persona modula las predicciones para reflejar el comportamiento de un agente concreto.
- Procesamiento de contexto conversacional multi-turno en griego.
- Integración en un pipeline mayor (Cognicalls Twin) que selecciona el siguiente movimiento y genera la réplica en el estilo del agente.
- Fallback a estadísticas basadas en conteo cuando los pesos no están disponibles.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking según la información disponible.

## Casos de uso

- Simulación de agentes de ventas para formación: el modelo predice el siguiente movimiento de un agente concreto ante un contexto de llamada, lo que permite generar simulaciones de entrenamiento para comerciales noveles sin exponer a clientes reales.
- Evaluación de guiones y playbooks comerciales: comparando las predicciones del modelo con las acciones reales de un agente se pueden detectar desviaciones sistemáticas respecto al guion y ajustar la formación o el propio playbook.
- Análisis de objeciones en llamadas de telesventa: la cabeza `cust_objection` clasifica el tipo de objeción del cliente, lo que permite agregar estadísticas por etapa y por persona para identificar los puntos de fricción más frecuentes.
- Enrutamiento y priorización en tiempo real: la predicción de `stage` y `cust_intent` puede alimentar un sistema de asistencia en vivo que sugiera al agente el siguiente paso según la fase de la llamada.
- Investigación en modelado de comportamiento conversacional: sirve como base para estudiar cómo condicionar un encoder multilingüe con un vector de persona y evaluar la transferibilidad entre agentes y escenarios.
- Generación aumentada de datos sintéticos: las predicciones de las cuatro cabezas pueden usarse para etiquetar o filtrar nuevos diálogos sintéticos en griego antes de incorporarlos a un corpus de entrenamiento mayor.
- Prototipado de asistentes de venta en griego: al estar construido sobre XLM-RoBERTa, puede adaptarse a otros dominios de atención al cliente en griego mediante fine-tuning con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder base de 278M parámetros en fp32 ocupa aproximadamente 1,1 GB de pesos; con overhead de activaciones y tokenizer, se estima un uso de VRAM en torno a 2-4 GB para batches pequeños, aunque no se proporcionan medidas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp32; para entrenamiento o fine-tuning se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, así como en GPUs integradas con suficiente memoria compartida para batches de una sola muestra.
- Opciones de despliegue: PyTorch nativo (`torch.load(..., weights_only=True)` sobre `best.pt`), con el loader independiente incluido en `export/xlmr_next_action.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de clasificación y no de generación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cognicalls/digital-twin-xlmr-nextmove | 278M | no disponible | Clasificación multi-cabeza de actos de diálogo con condicionamiento por persona | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278M | 512 tokens | Encoder multilingüe de propósito general | MIT | Hugging Face |
| Modelos de clasificación de actos de diálogo sobre BERT/RoBERTa | variable | variable | Clasificación de intenciones y actos de diálogo | variable | Hugging Face |

La comparativa con alternativas específicas de predicción de siguiente acción condicionada por persona no está disponible en la información proporcionada. El modelo se distingue de un clasificador de actos de diálogo convencional por la rama de vector de persona y por las cuatro cabezas simultáneas, pero no se han publicado métricas que permitan comparar su rendimiento con el de otros sistemas.

## Limitaciones y advertencias

- Es un prototipo de investigación, no un modelo de producción, según declara el propio autor.
- Solo conoce seis personas ficticias; no generaliza a agentes nuevos sin reentrenamiento.
- Entrenado exclusivamente con datos sintéticos, por lo que el comportamiento aprendido puede no reflejar la distribución de llamadas reales.
- Solo cubre el idioma griego; no se ha validado su comportamiento en otros idiomas.
- No se han publicado benchmarks ni métricas de evaluación en la información disponible, lo que impide estimar su precisión real.
- Riesgo de alucinación no aplicable en el sentido generativo (es un clasificador), pero las predicciones pueden ser incorrectas o poco calibradas en contextos alejados de los escenarios sintéticos.
- La licencia MIT permite uso comercial, pero el modelo depende de `xlm-roberta-base`, cuya licencia también es MIT.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan sesgos conocidos, pero al entrenarse con personas ficticias diseñadas por el autor, puede heredar sesgos de diseño de esos perfiles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cognicalls/digital-twin-xlmr-nextmove
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Loader independiente incluido en el repo: `export/xlmr_next_action.py` (ver `export/README.md`)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
