# Lexiiiii/legalgpt-dpo-round2-v4

## Resumen

legalgpt-dpo-round2-v4 es un adaptador LoRA para el modelo base Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario Lexiiiii dentro del proyecto LegalGPT. Este adaptador forma parte de un pipeline de post-entrenamiento en dos fases (SFT → DPO) orientado a la consulta legal en chino, especificamente diseñado para escenarios sin recuperacion aumentada por generacion (RAG). El nombre del archivo indica que se trata de una variante de ablation ("消融") de la segunda ronda de DPO, lo que sugiere que es un experimento intermedio dentro de un proceso de desarrollo mas amplio.

El adaptador se distribuye bajo licencia Apache 2.0 y utiliza la libreria PEFT para su carga. El proyecto completo, segun la model card, culmina en el modelo legalgpt-dpo-round5-v1, que representa la version final del sistema. Este adaptador concreto tiene interes principalmente para investigadores que quieran reproducir o analizar el proceso de entrenamiento del proyecto LegalGPT, ya que el propio autor indica que el resultado final es otro modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-7B-Instruct) |
| Parametros totales | 7.000 millones (modelo base) |
| Parametros activos | LoRA: rank=32, alpha=64, target q_proj+v_proj |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (adaptador LoRA en safetensors) |
| Idiomas soportados | Chino (principal), ingles y otros (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un modelo transformer autoregresivo con 7.000 millones de parametros y una ventana de contexto de 32.768 tokens. La capa de adaptacion es un LoRA (Low-Rank Adaptation) con rango 32 y alpha 64, aplicado unicamente a las proyecciones de query y value (q_proj y v_proj). El entrenamiento se realizo con la herramienta LLaMA-Factory, siguiendo un pipeline de dos etapas: primero un ajuste supervisado (SFT) y posteriormente una optimizacion con DPO (Direct Preference Optimization).

La tarea objetivo es la consulta legal en chino sin RAG, lo que implica que el modelo debe generar respuestas juridicas basandose exclusivamente en el conocimiento adquirido durante el entrenamiento. El nombre "round2-v4" indica que es la cuarta variante de la segunda ronda de DPO, y el termino "消融" (ablation) sugiere que se trata de un experimento para evaluar el impacto de ciertas decisiones de diseño. No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni las metricas de evaluacion utilizadas.

## Capacidades

- Consulta legal en chino: genera respuestas a preguntas sobre cuestiones juridicas basandose en el conocimiento adquirido durante el entrenamiento.
- Razonamiento instructivo: hereda la capacidad de seguir instrucciones del modelo base Qwen2.5-7B-Instruct.
- Generacion de texto multilingue: conserva las capacidades del modelo base en ingles y otros idiomas, aunque el entrenamiento especifico se centra en chino.
- Sin RAG: opera sin recuperacion de documentos externos, generando respuestas unicamente desde los parametros del modelo.
- Tool calling: no disponible (no se menciona soporte especifico en la informacion proporcionada).
- Soporte de agentes: no disponible (no se menciona en la documentacion).

## Casos de uso

- Consulta legal basica para usuarios no expertos: el modelo puede responder preguntas generales sobre derecho chino, como procedimientos legales, derechos basicos o conceptos juridicos comunes, sin necesidad de infraestructura adicional.
- Asistente juridico interno para despachos pequenos: un despacho con recursos limitados puede desplegar este adaptador sobre el modelo base para ofrecer un primer filtro de consultas antes de derivar a un abogado humano.
- Educacion legal: estudiantes de derecho pueden utilizar el modelo para practicar la formulacion de consultas y obtener respuestas orientativas sobre distintos escenarios legales.
- Prototipado rapido de sistemas legales: desarrolladores pueden integrar este adaptador en aplicaciones de prueba para validar la viabilidad de un asistente legal basado en IA antes de invertir en soluciones comerciales.
- Analisis de sentencias y normativa: el modelo puede resumir o explicar articulos legales concretos cuando se le proporcionan en el prompt, aprovechando la ventana de contexto de 32.768 tokens.
- Investigacion academica sobre post-entrenamiento legal: investigadores pueden estudiar este adaptador como caso de uso de DPO aplicado al dominio legal, comparandolo con la version final round5-v1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos legales. El autor no proporciona datos sobre la calidad de las respuestas legales generadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA anade un overhead minimo sobre el modelo base, por lo que los requisitos son los de Qwen2.5-7B-Instruct.
- Con cuantizacion de 4 bits (GPTQ/AWQ): aproximadamente 4-5 GB de VRAM, ejecutable en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Con cuantizacion de 8 bits: aproximadamente 8-9 GB de VRAM, ejecutable en RTX 3080/4080 o GPUs con 10 GB o mas.
- En precision completa (FP16): aproximadamente 14-16 GB de VRAM, recomendable una A100, RTX 4090 o similar.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers y PEFT, o fusionar con el modelo base para su uso con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; dependen del hardware y la configuracion de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| legalgpt-dpo-round2-v4 | 7B (LoRA) | 32.768 | Consulta legal en chino, sin RAG | Apache 2.0 |
| LegalGPT (Terry-ferns13) | No disponible | No disponible | RAG local para despachos | No disponible |
| TheLawGPT | No disponible | No disponible | Asistente legal general | Comercial |
| LegesGPT | No disponible | No disponible | Investigacion legal y analisis de documentos | Comercial |

No se dispone de datos de rendimiento comparativo entre estos sistemas. Los proyectos Terry-ferns13/LegalGPT, TheLawGPT y LegesGPT son soluciones completas con funcionalidades adicionales (RAG, generacion de documentos, analisis de documentos) mientras que este adaptador es un componente experimental de un proyecto de investigacion.

## Limitaciones y advertencias

- Modelo experimental: el nombre "round2-v4" y el termino "消融" (ablation) indican que es una version intermedia de un experimento, no el modelo final del proyecto.
- Sin datos de evaluacion: no se proporcionan benchmarks ni metricas de calidad, por lo que el rendimiento real en tareas legales es desconocido.
- Entrenamiento centrado en chino: el modelo esta disenado para consulta legal en chino; su rendimiento en otros idiomas puede verse degradado respecto al modelo base.
- Sin RAG: el modelo genera respuestas solo desde sus parametros, lo que puede provocar alucinaciones en cuestiones legales muy especificas o recientes.
- Riesgo legal: las respuestas generadas no deben considerarse asesoramiento legal profesional; el uso en produccion requiere supervision humana.
- Repositorio vacio: el tamano del repositorio es 0.0 GB, lo que sugiere que el adaptador puede no estar correctamente subido o que los pesos no estan disponibles.
- Fecha de creacion futura: la fecha de creacion (2026-08-19) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos o una fecha programada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lexiiiii/legalgpt-dpo-round2-v4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Proyecto LegalGPT (referenciado en la model card): https://github.com/czc0407/legalGPT
- Proyecto LegalGPT (resultado de busqueda, distinto): https://github.com/Terry-ferns13/LegalGPT
- TheLawGPT: https://www.thelawgpt.com/
- LegesGPT: https://www.legesgpt.com/
