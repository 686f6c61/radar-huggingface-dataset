# Haseebx16/plainspeak-qwen3.5-4b-lora

## Resumen

PlainSpeak es un adaptador LoRA (QLoRA de 4 bits) entrenado sobre el modelo base `unsloth/Qwen3.5-4B`, desarrollado por el usuario Haseebx16 en el contexto del hackathon `qwen-local-hackathon-2026`. Su propósito es convertir facturas de servicios públicos paquistaníes, alertas SMS bancarias y avisos oficiales o fraudulentos en explicaciones estructuradas en urdu sencillo, con un módulo de detección de estafas integrado. El modelo no se distribuye como pesos completos, sino como un adaptador PEFT (`adapter_model.safetensors`) que debe cargarse junto al modelo base.

La relevancia del proyecto reside en su enfoque vertical: en lugar de competir en capacidades generales, resuelve un problema concreto de alfabetización financiera en Pakistán, donde millones de usuarios reciben notificaciones técnicas (FPA, unidades kWh, fechas límite, recargos) que no comprenden y que son vector habitual de fraude. El adaptador fuerza una estructura de cinco puntos fijos en urdu (`یہ کیا ہے`, `رقم`, `آخری تاریخ`, `کیا کرنا ہے`, `دھوکہ چیک`) que el modelo base no produce de forma fiable.

El entrenamiento se realizó con Unsloth y TRL `SFTTrainer` sobre 1.000 ejemplos sintéticos curados, con 21,2 millones de parámetros entrenables (0,47% del total del modelo base de 4.560 millones). El repositorio ocupa 0,1 GB y se publica bajo licencia Apache 2.0. Es un artefacto de investigación y demostración, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder de Qwen3.5-4B |
| Parametros totales | 4.560.499.200 (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Parametros entrenables | 21.233.664 (0,47% del total) |
| Longitud de contexto | 1.024 tokens (max_seq_length de entrenamiento); contexto nativo del base: no disponible |
| Tipos de cuantizacion | QLoRA 4 bits durante entrenamiento; el adaptador es compatible con el esquema de cuantización del base |
| Idiomas soportados | ur (urdu), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, `adapter_model.safetensors` + ficheros de tokenizer) |
| Modelo base | unsloth/Qwen3.5-4B (revision `main` a 2026-11-23) |
| Framework de entrenamiento | Unsloth 2026.11.10 + TRL SFTTrainer |
| Configuracion LoRA | r=16, alpha=16, dropout=0, target_modules: q/k/v/o/gate/up/down_proj |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder denso de 4B parámetros (Qwen3.5-4B), sin modificaciones en la arquitectura base. Se utilizó QLoRA con `load_in_4bit=True`, LoRA de rango 16 sobre las siete proyecciones lineales del bloque (atención y MLP), sin dropout. El entrenamiento empleó `train_on_responses_only` con la plantilla de chat `qwen-2.5`, de modo que la pérdida se calcula únicamente sobre las respuestas del asistente y no sobre el prompt del sistema ni el mensaje del usuario.

Los datos son 1.000 ejemplos sintéticos y curados de facturas de servicios, SMS bancarios y avisos fraudulentos paquistaníes, con identificadores personales (nombres, CNIC, números de cuenta y teléfono) eliminados. El split es 850/50/100 (train/val/test) con importes, fechas y plantillas distintos entre conjuntos. Hiperparámetros: 3 épocas (321 pasos), batch efectivo de 8 (2 × acumulación 4), LR 2e-4, warmup de 10 pasos, weight decay 0,01, optimizador `adamw_8bit`, semilla 42. El entrenamiento se ejecutó en una única Tesla T4 (14,56 GB) de Google Colab en 50 minutos y 37 segundos. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de explicaciones estructuradas en urdu con una plantilla fija de cinco secciones (qué es, importe, fecha límite, qué hacer, comprobación de fraude).
- Interpretación de facturas eléctricas paquistaníes (formato K-Electric y similares) con campos como unidades kWh, FPA y recargos por mora.
- Lectura y resumen de SMS bancarios y avisos oficiales en inglés, roman-urdu o urdu.
- Detección de indicios de estafa en notificaciones (sección `دھوکہ چیک`), con veredicto sobre autenticidad y presencia de canales de pago oficiales.
- Recomendación de canales de pago concretos (banca online, JazzCash, EasyPaisa, 1Bill, sucursal bancaria).
- Conversación multi-turno mediante plantilla de chat compatible con Qwen 2.5.
- Capacidad bilingüe de entrada (inglés y urdu); la salida esperada es urdu.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en el adaptador.

## Casos de uso

- Asistente de alfabetización financiera para facturas eléctricas: el usuario reenvía el texto de su factura K-Electric y el adaptador devuelve importe neto, fecha límite, recargo por mora y métodos de pago en urdu llano, evitando que el usuario interprete mal conceptos como FPA.
- Filtro antiphishing en pasarelas SMS: integrado como clasificador previo en un pipeline de mensajería, el adaptador evalúa notificaciones bancarias y marca como sospechosas aquellas sin número de referencia verificable o con enlaces de pago no oficiales.
- Soporte al cliente de bajo coste en entidades financieras paquistaníes: despliegue del adaptador sobre el base 4B en una GPU T4 para responder consultas frecuentes sobre cargos y vencimientos, con la estructura de cinco puntos como contrato de salida estable.
- Educación financiera en ONG y programas de inclusión: generación de explicaciones normalizadas de avisos oficiales para talleres comunitarios, con la ventaja de que el formato fijo facilita la revisión humana y la traducción posterior.
- Prototipado rápido de asistentes verticales en urdu: el adaptador sirve como plantilla reproducible (script de inferencia incluido) para equipos que quieran replicar el enfoque QLoRA con Unsloth sobre otros dominios documentales.
- Validación de plantillas de facturación: uso del modelo para comprobar que un nuevo diseño de factura o SMS contiene todos los campos que un usuario necesita para actuar (importe, fecha, canal de pago), actuando como checklist automatizado.
- Investigación sobre adaptación lingüística de bajo rango: caso de estudio de cómo 21M de parámetros entrenables sobre 1.000 ejemplos bastan para imponer un formato y un idioma de salida que el base no respeta de forma consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una comparación cualitativa antes/después sobre un prompt de test reservado: el modelo base entra en un bucle de razonamiento en inglés dentro de `<think>` y no produce la explicación en urdu, mientras que el adaptador genera correctamente las cinco secciones con importes, fecha y veredicto de fraude. No hay métricas cuantitativas (exactitud, F1, ROUGE) sobre el conjunto de test de 100 ejemplos.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa ~0,1 GB; el modelo base en 4 bits requiere aproximadamente 3-4 GB, y en fp16 en torno a 9 GB. El entrenamiento documentado cupo en una T4 de 14,56 GB con QLoRA.
- GPU recomendadas: NVIDIA T4 (validada por el autor), RTX 3090/4090, A10G, L4, A100 y H100 para mayor throughput.
- GPU de consumo: sí, cabe en RTX 3060 de 12 GB y superiores en cuantización 4 bits; en fp16 requiere 12-16 GB.
- Opciones de despliegue: Unsloth (`FastLanguageModel.for_inference`), PEFT + transformers, vLLM y TGI fusionando previamente el adaptador con el base; llama.cpp/Ollama solo si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles. La generación de referencia usa `max_new_tokens=180`, `temperature=0.7` y caché de atención.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| PlainSpeak (este) | 4B base + 21M adaptador | 1.024 (entrenamiento) | ur, en | Apache 2.0 | Explicación de facturas y antiphishing en urdu |
| Qwen3.5-4B (base) | 4B | no disponible | multilingüe | Apache 2.0 (según base) | Modelo generalista |
| Adaptadores QLoRA verticales (genéricos) | variable | variable | variable | variable | Ajuste de dominio con pocos datos |

No se dispone de información sobre alternativas específicas de explicación de facturas o detección de estafas en urdu con las que comparar parámetros, contexto o rendimiento. Los datos de la fila genérica no son verificables y se incluyen solo como categoría.

## Limitaciones y advertencias

- Es una herramienta de explicación asistiva: no sustituye la verificación oficial con el banco, la eléctrica o el organismo gubernamental correspondiente.
- Entrenado sobre plantillas paquistaníes de inglés, roman-urdu y urdu; formatos desconocidos o patrones de estafa nuevos pueden clasificarse erróneamente.
- El conjunto de entrenamiento es sintético y pequeño (1.000 ejemplos); el riesgo de sobreajuste a plantillas y de alucinación en importes o fechas no está cuantificado.
- La ventana de entrenamiento es de 1.024 tokens; entradas más largas pueden truncarse y perder campos críticos de la factura.
- El modelo base puede emitir razonamiento interno en inglés (`<think>`); el adaptador lo mitiga en el dominio entrenado, pero no hay garantía fuera de él.
- Sesgos no evaluados: no se documenta análisis de sesgo por género, región o nivel educativo, ni evaluación de equidad en la clasificación de fraude (falsos positivos sobre avisos legítimos).
- Licencia Apache 2.0 declarada como compatible con el base, pero la licencia efectiva del modelo fusionado depende de la de `unsloth/Qwen3.5-4B`; conviene verificarla antes de uso comercial.
- Sin métricas de producción: no hay benchmarks, latencia ni throughput publicados; el despliegue real requiere evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haseebx16/plainspeak-qwen3.5-4b-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Unsloth: https://github.com/unslothai/unsloth
- TRL (SFTTrainer): https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Hackathon de referencia: qwen-local-hackathon-2026 (sin URL pública disponible en la información proporcionada)
