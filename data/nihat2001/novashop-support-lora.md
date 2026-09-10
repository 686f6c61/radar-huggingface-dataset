# nihat2001/novashop-support-lora

## Resumen

`nihat2001/novashop-support-lora` es un adaptador LoRA (Low-Rank Adaptation) de ajuste supervisado (SFT) publicado por el usuario nihat2001. No es un modelo completo: se trata de un checkpoint PEFT que debe cargarse sobre `unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit`, una versión del Llama 3.1 8B Instruct de Meta cuantizada a 4 bits y optimizada por Unsloth para entrenamiento con bajo consumo de memoria. El repositorio ocupa 0,2 GB, un tamano coherente con un adaptador de rango reducido y no con un modelo de 8 000 millones de parámetros.

El identificador del modelo sugiere un ajuste orientado a atención al cliente en comercio electrónico (los términos "novashop" y "support"), probablemente sobre diálogos de soporte. Sin embargo, la model card publicada es la plantilla por defecto de Hugging Face sin ningún campo completado: no documenta el conjunto de datos, el procedimiento de entrenamiento, los hiperparámetros ni los idiomas objetivo. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

Su interés práctico es doble. Por un lado, sirve como ejemplo del flujo de trabajo Unsloth + TRL + PEFT para adaptar un modelo de 8B en una sola GPU de consumo. Por otro, ilustra un problema frecuente en el ecosistema: adaptadores publicados sin documentación, sin licencia declarada y sin evaluación, lo que impide determinar si son aptos para producción o si su uso comercial es legalmente viable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Llama 3.1 8B Instruct); adaptador LoRA de bajo rango sobre las capas del transformer |
| Parámetros totales | ~8 000 millones en el modelo base; número de parámetros entrenables del adaptador no disponible |
| Parámetros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Llama 3.1 8B Instruct; no documentado para el adaptador |
| Tipos de cuantización | El adaptador se distribuye en safetensors (precisión sin especificar). El modelo base de referencia está cuantizado a 4 bits con bitsandbytes. No se documentan otras cuantizaciones |
| Idiomas soportados | No disponible. El modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible. El modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Librería | PEFT 0.20.0 (compatible con transformers, TRL y Unsloth) |
| Modelo base | unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-09-10 (última actualización: 2026-09-10) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only denso de 8 000 millones de parámetros, la arquitectura estándar de la familia Llama 3.1: atención con agrupación de consultas (GQA), RoPE para codificación posicional, normalización RMSNorm y activación SwiGLU. No hay mezcla de expertos ni componentes de estado recurrente. La técnica de adaptación es LoRA, que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en las proyecciones de atención y en las capas feed-forward, reduciendo el coste de entrenamiento en varios órdenes de magnitud frente a un ajuste completo.

Las etiquetas del repositorio (`lora`, `sft`, `transformers`, `trl`, `unsloth`) indican que el entrenamiento se realizó con el `SFTTrainer` de TRL sobre la pila de Unsloth, en un régimen de ajuste supervisado sobre pares instrucción-respuesta. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, la configuración del rango LoRA (r), el alpha, el dropout ni la tasa de aprendizaje. La ficha tampoco documenta si se aplicó decodificación especulativa, atención lineal u otra optimización de inferencia. Toda la sección de procedimiento queda, por tanto, sin verificar.

## Capacidades

- Generación de texto conversacional: hereda del modelo base la capacidad de mantener diálogos multi-turno, presumiblemente especializada hacia consultas de atención al cliente por el ajuste LoRA.
- Seguimiento de instrucciones: el modelo base Llama 3.1 8B Instruct está alineado por instrucciones; el adaptador no debería degradar esta capacidad, aunque no hay evaluación que lo confirme.
- Razonamiento y matemáticas básicas: capacidades presentes en el modelo base, no verificadas tras el ajuste.
- Generación de código: soportada por el modelo base, no documentada en el adaptador.
- Tool calling / function calling: el modelo base Llama 3.1 soporta plantillas de llamada a herramientas; no se confirma que el adaptador conserve esta capacidad tras el SFT.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado. El modelo base cubre ocho idiomas oficiales, pero el ajuste puede haber reducido el rendimiento fuera del idioma del dataset de entrenamiento.
- Modo de razonamiento explícito (thinking), visión o audio: no soportados.

## Casos de uso

- Atención al cliente automatizada en comercio electrónico: es el escenario al que apunta el nombre del modelo. Permitiría gestionar conversaciones multi-turno sobre pedidos, devoluciones o estado de envíos, con la ventana de 128 000 tokens del modelo base si el adaptador la conserva.
- Respuesta a preguntas frecuentes: el adaptador puede desplegarse como capa de generación sobre una base de conocimiento de la tienda para redactar respuestas coherentes con el tono de marca aprendido en el ajuste.
- Clasificación y enrutado de tickets: uso del modelo para etiquetar la intención de una consulta y derivarla al equipo adecuado, aprovechando el formato conversacional entrenado.
- Borrador de respuestas para agentes humanos: generación asistida que un operador revisa antes de enviar, reduciendo el tiempo medio de respuesta.
- Asistente interno de soporte: consulta de políticas de devolución, garantías y procedimientos internos en un chatbot de uso interno.
- Prototipado de ajustes PEFT: el repositorio sirve como plantilla reproducible del flujo Unsloth + TRL + PEFT para equipos que quieran replicar el pipeline con sus propios datos.
- Investigación sobre adaptadores de bajo rango: útil para estudiar cómo un SFT breve sobre un modelo de 8B altera el comportamiento conversacional en un dominio acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna evaluación (MMLU, HumanEval, GSM8K ni métricas específicas de atención al cliente), y el autor no ha publicado tabla comparativa alguna. Tampoco hay resultados de evaluaciones humanas o de satisfacción sobre el dominio objetivo.

## Requisitos de hardware

- El adaptador por sí solo ocupa unos 0,2 GB, pero requiere cargar el modelo base para funcionar. Las cifras siguientes corresponden al conjunto base + adaptador.
- VRAM en fp16/bf16: aproximadamente 16 GB solo para los pesos, más caché KV; en la práctica, entre 18 y 24 GB según longitud de contexto y tamaño de lote.
- VRAM en cuantización de 8 bits: aproximadamente 9-10 GB.
- VRAM en cuantización de 4 bits (bitsandbytes), el régimen del modelo base de referencia: aproximadamente 5-7 GB, con margen para contexto moderado.
- GPU recomendadas: A100 40/80 GB y H100 para servicio en producción con lotes grandes; L40S o RTX 6000 Ada para despliegue en una sola GPU; RTX 4090 (24 GB) o RTX 3090 (24 GB) para desarrollo y servicio ligero.
- Cabe en GPU de consumo: sí, en 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 12 GB, con contexto reducido. En 8 bits requiere al menos 12-16 GB; en fp16 requiere 24 GB.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador directamente; fusión del adaptador en el modelo base seguida de conversión a GGUF para llama.cpp u Ollama; vLLM y TGI para servicio con concurrencia. La fusión de un LoRA sobre un base cuantizado a 4 bits con bitsandbytes puede degradar la precisión, por lo que se recomienda fusionar sobre el modelo en fp16 y recuantizar después.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nihat2001/novashop-support-lora | ~8B (adaptador LoRA sobre Llama 3.1 8B) | No documentado; 128k en el base | No disponible | Hugging Face, sin descargas ni validación |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 tokens | Llama 3.1 Community License | Ampliamente desplegado, ecosistema maduro |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2B | 32 000 tokens | Apache 2.0 | Muy extendido, permite uso comercial sin restricciones de escala |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 131 072 tokens (32k nativos ampliados con YaRN) | Apache 2.0 | Amplio soporte en vLLM, llama.cpp y Ollama |

La comparación de rendimiento no es posible: no hay benchmarks publicados para el adaptador, y su calidad depende por completo del dataset de SFT, que no se ha hecho público. Frente a los modelos base de la comparativa, la única ventaja diferencial del adaptador sería una especialización de dominio, no verificada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no se puede asumir permiso de uso comercial. Además, el modelo base arrastra la Llama 3.1 Community License, que impone condiciones de atribución y un límite de 700 millones de usuarios mensuales para el licenciatario.
- Model card vacía: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación. Es imposible auditar sesgos, cobertura idiomática o calidad.
- Riesgo de alucinación: al ser un modelo de 8B, puede generar información inventada sobre pedidos, políticas o plazos. En atención al cliente esto es crítico y exige verificación contra sistemas de verdad (ERP, CRM) antes de responder al usuario.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden identificar sesgos demográficos, de género o culturales introducidos durante el ajuste.
- Cobertura de idiomas sin verificar: si el SFT se realizó únicamente en un idioma, el rendimiento en el resto puede haberse degradado respecto al modelo base.
- Posible sobreajuste al dominio: un SFT corto sobre un dominio estrecho puede reducir la capacidad general del modelo y aumentar la rigidez de las respuestas.
- No es un modelo autónomo: requiere cargar el modelo base, lo que duplica los requisitos de almacenamiento y complica el despliegue en entornos con restricciones.
- Ausencia de validación comunitaria: 0 descargas y 0 likes indican que no ha sido probado por terceros. No hay informes independientes de calidad.
- Fechas de publicación y actualización idénticas y futuras respecto a la fecha de consulta, sin historial de versiones que permita rastrear cambios.
- Sin garantía de mantenimiento: no hay repositorio de código, issues ni canal de soporte asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nihat2001/novashop-support-lora
- Modelo base: https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Paper referenciado en las etiquetas (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact
- Otros enlaces: no se han encontrado en la búsqueda web (los resultados devueltos no guardan relación con el modelo).
