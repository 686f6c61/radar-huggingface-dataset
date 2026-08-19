# loctran5105/qwen2.5-3b-clinc150-adapter

## Resumen

Este repositorio aloja un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen2.5-3B-Instruct para la tarea de clasificación de intenciones en el dataset CLINC150. El adaptador, desarrollado por loctran5105, permite convertir un modelo generativo de propósito general en un clasificador de intenciones especializado, un componente habitual en sistemas de diálogo y asistentes virtuales. La relevancia de este adaptador radica en su ligereza: al ser un módulo PEFT (Parameter-Efficient Fine-Tuning), solo añade unos pocos parámetros entrenables al modelo base, lo que facilita su distribución, actualización y despliegue en entornos con recursos limitados.

El modelo base, Qwen2.5-3B-Instruct, es un modelo de lenguaje de 3 000 millones de parámetros desarrollado por Alibaba Cloud, con una ventana de contexto de 32 768 tokens y optimizado para instrucciones y conversaciones. El adaptador LoRA se superpone a este modelo para ajustar su comportamiento hacia la clasificación de intenciones, manteniendo intactas las capacidades generales del modelo original. El repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamaño total de 0,1 GB, lo que indica que se trata de un adaptador de bajo rango y dimensiones reducidas.

La ficha que sigue se basa exclusivamente en la información proporcionada en la página de HuggingFace. La model card del autor está prácticamente vacía (todos los campos aparecen como "More Information Needed"), por lo que muchos datos técnicos del adaptador no están disponibles. Se indicará explícitamente cuando un parámetro no se pueda determinar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-3B-Instruct (Transformer decoder-only) |
| Parametros totales | No disponible (el adaptador añade parámetros al modelo base de 3B) |
| Parametros activos | No disponible (depende del rango y de las capas objetivo del LoRA) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, sin cuantización propia) |
| Idiomas soportados | No disponibles (el modelo base soporta principalmente inglés y chino; el dataset CLINC150 es en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA, que congela los pesos del modelo base e inyecta matrices de baja dimensión en las capas de atención y feed-forward. Esto reduce drásticamente el número de parámetros entrenables (típicamente menos del 1 % del total) y el coste de cómputo. El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only con 3 000 millones de parámetros, entrenado con atención de ventana deslizante y una longitud de contexto de 32 768 tokens. El adaptador se ha entrenado sobre el dataset CLINC150, un corpus de referencia para clasificación de intenciones en inglés que contiene 150 intenciones distintas (por ejemplo, reservar un vuelo, consultar el tiempo, reproducir música) y 22 500 frases de entrenamiento, además de ejemplos fuera de alcance (out-of-scope).

No se dispone de información sobre el proceso de entrenamiento del adaptador: no se especifican hiperparámetros, régimen de entrenamiento, duración, ni si se utilizaron técnicas de RLHF o DPO. Dado que el adaptador está etiquetado con la librería PEFT y la versión 0.18.1 de transformers, se asume que el entrenamiento se realizó con la API estándar de HuggingFace PEFT. El tamaño del adaptador (0,1 GB) sugiere un rango LoRA bajo (por ejemplo, r=8 o r=16) aplicado a un subconjunto de capas, aunque este dato no está confirmado.

## Capacidades

- Clasificación de intenciones en inglés: el adaptador está diseñado específicamente para asignar una de las 150 intenciones del dataset CLINC150 a una frase de entrada, además de detectar ejemplos fuera de alcance.
- Integración con modelos generativos: al estar montado sobre Qwen2.5-3B-Instruct, conserva la capacidad de generar texto, aunque su uso principal es la clasificación, no la generación libre.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-3B-Instruct soporta estas capacidades, pero el adaptador no las modifica ni las garantiza. No hay evidencia de que el adaptador haya sido entrenado para tool calling.
- Capacidades multilingües: el modelo base soporta inglés y chino principalmente; el dataset CLINC150 es exclusivamente en inglés, por lo que el adaptador solo es fiable para entradas en inglés.
- Sin capacidades de vision, audio ni thinking mode: el adaptador es puramente textual.

## Casos de uso

- Asistentes virtuales de atención al cliente: el adaptador puede clasificar la intención del usuario en un chat de soporte (por ejemplo, "cancelar pedido", "cambiar dirección de envío") y enrutar la conversación al flujo adecuado. Su ligereza permite desplegarlo en servidores modestos o en el edge.
- Sistemas de enrutamiento de diálogo: en un pipeline de chatbot, el adaptador actúa como clasificador inicial para seleccionar el módulo de respuesta adecuado, reduciendo la carga de los modelos generativos grandes.
- Detección de consultas fuera de alcance: CLINC150 incluye ejemplos out-of-scope, por lo que el adaptador puede identificar cuándo una consulta no corresponde a ninguna intención conocida y derivarla a un agente humano.
- Automatización de tareas en aplicaciones móviles: integrado en una app, el adaptador puede interpretar comandos de voz o texto (por ejemplo, "pon una alarma a las 7", "busca restaurantes cerca") y ejecutar las acciones correspondientes.
- Análisis de logs de conversación: el adaptador puede etiquetar históricos de chat con intenciones, permitiendo analizar qué demandas son más frecuentes y optimizar los flujos de atención.
- Prototipado rápido de clasificadores: al ser un adaptador PEFT, se puede cargar y probar en minutos sobre el modelo base, sirviendo como punto de partida para un fine-tuning más específico con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, F1, ni comparaciones con otros modelos de clasificación de intenciones. El autor no ha incluido ninguna métrica en la model card. Por tanto, no es posible evaluar cuantitativamente el rendimiento del adaptador sobre CLINC150.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB, pero requiere el modelo base Qwen2.5-3B-Instruct para funcionar. El modelo base en fp16 ocupa aproximadamente 6 GB de VRAM.
- Para inferencia en GPU, se recomienda al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 4060, T4) para cargar el modelo base en fp16 y el adaptador.
- Con cuantización del modelo base a 4 bits (por ejemplo, mediante bitsandbytes), se puede ejecutar en GPUs con 4-6 GB de VRAM, como una GTX 1660 o una RTX 3050.
- Opciones de despliegue: se puede usar la librería transformers con PEFT, vLLM (si se integra el adaptador), o convertir el modelo base a GGUF y aplicar el adaptador mediante llama.cpp (aunque la fusión de LoRA en GGUF es menos directa). La vía más sencilla es cargar el adaptador con `PeftModel.from_pretrained` en un script Python.
- La latencia depende del hardware; en una GPU T4, la inferencia de una frase corta con Qwen2.5-3B suele estar en el rango de 50-150 ms, más el overhead del adaptador (mínimo).
- En CPU, es viable con cuantización a 4 bits y una máquina con 16 GB de RAM, aunque la latencia será de varios segundos por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loctran5105/qwen2.5-3b-clinc150-adapter | Adaptador LoRA sobre 3B | 32 768 | Clasificación de intenciones (CLINC150) | No disponible | HuggingFace |
| Adaptadores LoRA para CLINC150 sobre otros modelos base (p. ej., BERT, RoBERTa) | 110M-350M | 512 | Clasificación de intenciones | Varía (MIT, Apache) | HuggingFace |
| Modelos de clasificación de intenciones específicos (p. ej., intent classification con DistilBERT) | 66M | 512 | Clasificación de intenciones | Apache 2.0 | HuggingFace |

La comparativa es limitada porque no se dispone de datos de rendimiento del adaptador. Los modelos de clasificación de intenciones tradicionales (basados en BERT) son mucho más pequeños y rápidos, pero no generan texto. El adaptador sobre Qwen2.5 ofrece la ventaja de mantener las capacidades generativas del modelo base, a costa de un mayor coste computacional. No se conocen adaptadores LoRA específicos para CLINC150 sobre Qwen2.5-3B publicados con métricas, por lo que no hay una comparación directa.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgos. El dataset CLINC150 es en inglés y de dominio de asistentes virtuales, por lo que el adaptador puede no generalizar a otros idiomas ni a dominios distintos.
- Riesgo de alucinación: al ser un adaptador sobre un modelo generativo, si se usa el modelo para generar texto (no solo para clasificar), puede producir respuestas inventadas o incoherentes, igual que el modelo base.
- Limitaciones de contexto: aunque el modelo base soporta 32 768 tokens, el adaptador fue entrenado con frases cortas (típicas de intenciones), por lo que entradas muy largas o con formato complejo pueden degradar la clasificación.
- Restricciones de licencia: la licencia del adaptador no está especificada. El modelo base Qwen2.5-3B-Instruct se distribuye bajo la licencia Apache 2.0 (según la documentación de Qwen), pero el adaptador no declara ninguna licencia, lo que genera incertidumbre legal para uso comercial.
- Falta de documentación: la model card está vacía; no hay información sobre hiperparámetros, datos de entrenamiento exactos, ni instrucciones de uso. Esto dificulta la reproducibilidad y la confianza en el adaptador.
- Para producción: se recomienda evaluar el adaptador con el dataset de validación de CLINC150 antes de desplegarlo. Dado que no hay métricas publicadas, el rendimiento real es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/loctran5105/qwen2.5-3b-clinc150-adapter
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper de CLINC150 (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
