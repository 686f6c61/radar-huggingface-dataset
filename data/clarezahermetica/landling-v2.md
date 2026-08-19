# clarezahermetica/landling-v2

## Resumen

Landling v2 es un adaptador LoRA experimental desarrollado por Dana K. (clarezahermetica) sobre el modelo base TinyLlama-1.1B-Chat-v1.0. Su objetivo es reproducir un estilo de escritura reconocible inspirado en la obra pública del filósofo Nick Land, con un tono comprimido, analítico y a veces sardónico. No es una imitación del autor ni pretende representar sus opiniones; es una persona artificial entrenada sobre textos públicos. La versión 2 amplía el conjunto de datos de 298 a 6.336 ejemplos, añade más material conversacional y extiende los objetivos LoRA a las cuatro proyecciones de atención (q, k, v, o). El adaptador está pensado para generación de texto creativa, investigación sobre adaptación de estilo en modelos pequeños y prototipos de interfaces conversacionales. El modelo base tiene 1.1B parámetros y una ventana de contexto de 2048 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre TinyLlama (Transformer causal, arquitectura Llama) |
| Parametros totales | 1.1B (base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada del base) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre TinyLlama-1.1B-Chat-v1.0, un modelo transformer causal de 1.1B parametros con 2048 tokens de contexto. El entrenamiento usa LoRA (Low-Rank Adaptation) con objetivos en las cuatro proyecciones de atencion (q, k, v, o), en lugar de solo q y v como en la version 1. El conjunto de datos limpio consta de 6.336 ejemplos, frente a los 298 de la v1, e incluye mas material de replicas y conversaciones. Las conversaciones se convierten en ejemplos de entrenamiento acumulativos para que cada respuesta pueda ver todos los mensajes anteriores. Se anade soporte para posts citados durante el preprocesado. Se documentan estadisticas de deduplicacion, longitudes de texto, semilla fija y configuracion de entrenamiento. No se especifican detalles sobre el numero total de tokens, el metodo de optimizacion (RLHF, DPO, etc.) ni la duracion del entrenamiento.

## Capacidades

- Generacion de texto corto en formato de post independiente (marcado con "### Tweet:").
- Respuestas contextuales y conversacion multi-turno limitada (formato "### Context:" / "### Reply:").
- Adaptacion de estilo: reproduce un tono comprimido, analitico y sardónico, con interes en temas como tecnologia, inteligencia, capital, computacion, evolucion, mercados, instituciones, redes, religion, lenguaje, deseo e historia.
- Conversacion acumulativa: cada respuesta puede ver el historial previo dentro de la ventana de contexto.
- No soporta tool calling, agentes, vision ni audio (es un modelo de texto puro).
- Capacidades multilingues: solo ingles.

## Casos de uso

- Experimentacion creativa con estilos de escritura: el adaptador permite generar textos breves con una voz reconocible, util para estudiar como se adapta un estilo a un modelo pequeno.
- Investigacion en adaptacion de estilo con PEFT: sirve como caso practico de LoRA sobre un modelo de 1.1B, con documentacion del proceso de entrenamiento.
- Prototipos de interfaces conversacionales con personalidad: se puede integrar en un chatbot que responda con el tono de Landling, usando el wrapper `chat_with_landling()`.
- Generacion de posts cortos para redes sociales o blogs: el formato "### Tweet:" esta disenado para producir entradas breves.
- Analisis de separacion entre voz afinada y capa de identidad en runtime: el proyecto incluye un archivo de persona y una plantilla de chat que se aplican en tiempo de ejecucion, permitiendo estudiar como la personalidad se construye por capas.
- Educacion sobre LoRA y fine-tuning: el repositorio incluye estadisticas reproducibles, semilla fija y configuracion guardada, util como ejemplo didactico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base TinyLlama tiene 1.1B parametros, por lo que en FP16 ocupa aproximadamente 2,2 GB de VRAM, mas el adaptador (pequeno). Esto cabe en GPUs consumer como una RTX 3060 de 6 GB o superior.
- En cuantizacion 8 bits o 4 bits (si se aplica al base) podria caber en 1-2 GB, pero no se proporcionan cuantizaciones oficiales.
- Para CPU, la inferencia es posible pero lenta; se recomienda usar torch.float32 y sin device_map.
- Opciones de despliegue: se puede usar con transformers + PEFT, y probablemente con vLLM u Ollama si se exporta a GGUF, aunque no se documenta oficialmente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

- TinyLlama-1.1B-Chat-v1.0 (base): mismo tamano, contexto 2048, licencia Apache-2.0, sin adaptacion de estilo especifica. Landling v2 anade la capa LoRA.
- Otros adaptadores de estilo sobre modelos pequenos: no hay datos comparativos publicados.
- Modelos de tamano similar como Phi-2 (2.7B) o Qwen-1.5B: no son comparables directamente porque Landling v2 es un adaptador, no un modelo completo, y no se han publicado benchmarks.

## Limitaciones y advertencias

- El modelo no debe usarse para impersonar a Nick Land ni para representar sus opiniones actuales o historicas; es una persona artificial ficticia.
- No proporciona consejos factuales, medicos, legales, financieros ni de seguridad critica.
- No es una fuente autoritativa sobre ninguna persona.
- No tiene memoria a largo plazo fiable.
- No debe operar de forma autonoma sin revision de salida.
- Puede producir analisis largos poco coherentes o poco factuales.
- El conjunto de datos de entrenamiento es pequeno (6.336 ejemplos), lo que limita la generalizacion.
- Solo soporta ingles.
- La ventana de contexto es de 2048 tokens, lo que limita conversaciones largas.
- Al ser un adaptador, requiere cargar el modelo base, lo que anade complejidad de despliegue.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/clarezahermetica/landling-v2
- Repositorio HuggingFace del proyecto (v1): https://huggingface.co/clarezahermetica/landling
- Repositorio GitHub: https://github.com/clarezahermetica/landling
- Pagina del autor en HuggingFace: https://huggingface.co/clarezahermetica
- Modelo base TinyLlama: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
