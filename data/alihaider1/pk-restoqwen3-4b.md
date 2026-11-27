# AliHaider1/PK-RestoQwen3-4B

## Resumen

PK-RestoQwen3-4B es un adaptador LoRA (entrenado con QLoRA en 4 bits NF4) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario AliHaider1. Su objetivo es especializar un modelo de 4.000 millones de parametros en la atencion al cliente de restaurantes pakistanies, cubriendo ingles, urdu romanizado, urdu en escritura arabe y conversaciones con cambio de codigo urdu-ingles. El repositorio ocupa 0,3 GB, lo que corresponde unicamente a los pesos del adaptador, no al modelo completo.

El modelo aborda un problema muy concreto: los asistentes genericos tienden a inventar datos operativos (estados de pedido, precios, tarifas de envio, tiempos estimados de entrega, numeros de pago movil como JazzCash o EasyPaisa) cuando se les consulta en contextos de soporte. Este adaptador incorpora guardarrailes anti-alucinacion explicitos y una politica de escalado a agentes humanos para disputas de pago, quejas de calidad alimentaria y peticiones explicitas de atencion humana.

Es relevante para equipos que construyan bots de soporte en mercados pakistanies o del sur de Asia, donde el urdu romanizado y el code-switching son la norma en la mensajeria informal. Al ser un adaptador sobre Qwen3-4B-Instruct-2507, hereda la arquitectura y la ventana de contexto del modelo base, aunque la model card no documenta explicitamente estos parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); adaptador LoRA sobre proyecciones de atencion y MLP |
| Parametros totales | 4B (modelo base) + adaptador LoRA con r=16 (tamano exacto del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | Entrenado en 4-bit NF4 con doble cuantizacion; el adaptador puede cargarse sobre base en 4-bit, 8-bit o FP16/BF16 |
| Idiomas soportados | Ingles, urdu romanizado, urdu en escritura arabe, urdu-ingles con cambio de codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros. La tecnica empleada es QLoRA con cuantizacion 4-bit NF4 y doble cuantizacion, con rango r=16 y lora_alpha=16 aplicado a todas las proyecciones de atencion y MLP, manteniendo los pesos LoRA entrenables en FP32. Se usa enmascaramiento de perdida solo en las completaciones del asistente (completion_only_loss=True), lo que evita que el modelo aprenda a reproducir los turnos del usuario.

El entrenamiento emplea el optimizador paged_adamw_8bit con tasa de aprendizaje 5e-5, programacion coseno, weight_decay 0.01, tamano de lote efectivo 16 (1 x 16) y una sola epoca, con carga del mejor modelo al final. El conjunto de datos consta de aproximadamente 1.500 turnos de soporte de restaurantes equilibrados, deduplicados y sin fuga de datos, que combinan dialogos curados (multi-turno, escalados a agentes humanos y trampas adversariales anti-alucinacion) con subconjuntos filtrados de bitext/Bitext-restaurants-llm-chatbot-training-dataset (CDLA-Sharing-1.0) y nassimjp/Polyglot-Restaurant-Reasoning-Dataset (MIT).

## Capacidades

- Generacion de respuestas de atencion al cliente fluidas y concisas en ingles, urdu romanizado, urdu en escritura arabe y mezcla urdu-ingles.
- Comprension de jerga informal de mensajeria pakistani (por ejemplo `tk`, `ni`, `kb`, `yar`, `bhai`).
- Guardarrailes anti-alucinacion: rechaza inventar estados de pedido en vivo, precios de menu, tarifas de envio, tiempos estimados de entrega, numeros de JazzCash/EasyPaisa o codigos promocionales; en su lugar formula preguntas aclaratorias e indica cuando se requiere verificacion.
- Escalado fiable a agente humano para disputas de pago (JazzCash, EasyPaisa, SadaPay, tarjeta), quejas de calidad alimentaria y peticiones explicitas de atencion humana.
- Conversaciones multi-turno de soporte dentro del dominio de restaurantes.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Atencion al cliente en restaurantes pakistanies por WhatsApp o mensajeria: el adaptador responde en urdu romanizado e ingles mezclado tal como escriben los clientes reales, manteniendo el tono informal sin perder precision en los datos operativos.
- Gestion de pedidos y consultas de estado: ante preguntas sobre el estado de un pedido, el modelo evita inventar informacion y solicita el identificador o indica que se requiere verificacion en el sistema, lo que reduce respuestas erroneas en produccion.
- Resolucion de dudas sobre menu y precios: el modelo pregunta por el plato o la sede concreta en lugar de improvisar precios, adecuado para integraciones donde los precios se inyectan desde una base de datos externa.
- Escalado de disputas de pago: detecta menciones a JazzCash, EasyPaisa, SadaPay o tarjeta en contextos de reclamacion y transfiere limpiamente a un agente humano, reduciendo el riesgo de respuestas incorrectas en un area sensible.
- Gestion de quejas de calidad alimentaria: canaliza reclamaciones sobre comida en mal estado o pedidos incorrectos hacia el equipo humano con el contexto recogido, en lugar de intentar compensaciones automaticas.
- Soporte en horarios de alta demanda con recursos limitados: al ser un adaptador sobre un modelo de 4B, puede desplegarse en infraestructura modesta y absorber el primer nivel de consultas frecuentes antes de escalar.
- Prototipado rapido de bots sectoriales: sirve como referencia de como aplicar QLoRA con guardarrailes anti-alucinacion y enmascaramiento de perdida a un dominio vertical concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en 4-bit NF4 ocupa aproximadamente 2,5-3 GB de VRAM para los pesos, mas overhead de activaciones y cache KV; en FP16 ronda los 8 GB.
- GPU recomendadas: para FP16, una RTX 4090 (24 GB), A100 o H100 ofrecen margen amplio; para 4-bit, una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: si, en 4-bit cabe en tarjetas con 6-8 GB de VRAM; en FP16 requiere al menos 8-10 GB.
- Opciones de despliegue: el adaptador es PEFT/LoRA, por lo que la carga directa se hace con transformers + peft + bitsandbytes. Para servir en produccion puede fusionarse el adaptador con el modelo base y exportarse a vLLM, TGI o llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PK-RestoQwen3-4B | 4B (base) + LoRA | No disponible | Soporte de restaurantes pakistanies multi-idioma | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | No disponible en esta ficha | Proposito general, instrucciones | Apache 2.0 | Hugging Face |
| Bitext-restaurants-llm-chatbot-training-dataset (dataset, no modelo) | No aplica | No aplica | Datos de entrenamiento de soporte de restaurantes | CDLA-Sharing-1.0 | Hugging Face |

No se dispone de informacion sobre otros adaptadores especializados comparables en la busqueda realizada; la comparativa se limita al modelo base y a la fuente de datos principal.

## Limitaciones y advertencias

- El adaptador esta entrenado sobre solo ~1.500 turnos y una epoca; la cobertura de casos limite y la robustez fuera del dominio de restaurantes pakistanies es limitada.
- Riesgo de alucinacion reducido pero no eliminado: los guardarrailes se entrenaron con trampas adversariales, pero no hay evaluacion publica que cuantifique la tasa de fallo.
- El modelo esta disenado para rechazar la invencion de datos operativos; en produccion requiere integracion con sistemas reales (estado de pedidos, precios, pagos) para ser util.
- Idiomas: aunque soporta urdu romanizado y code-switching, no se documenta su rendimiento en otras lenguas; no debe asumirse calidad en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse tambien la licencia del modelo base Qwen3-4B-Instruct-2507 y las condiciones de los datasets de entrenamiento (CDLA-Sharing-1.0 y MIT).
- El repositorio solo contiene el adaptador (0,3 GB); es imprescindible descargar el modelo base para su uso.
- Sin descargas ni likes registrados y creado en noviembre de 2026: no hay validacion de la comunidad ni evaluaciones independientes.
- No se documentan capacidades de tool calling ni de agentes; si el caso de uso las requiere, habria que evaluarlas empiricamente.

## Enlaces

- Hugging Face: https://huggingface.co/AliHaider1/PK-RestoQwen3-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset bitext/Bitext-restaurants-llm-chatbot-training-dataset: https://huggingface.co/datasets/bitext/Bitext-restaurants-llm-chatbot-training-dataset
- Dataset nassimjp/Polyglot-Restaurant-Reasoning-Dataset: https://huggingface.co/datasets/nassimjp/Polyglot-Restaurant-Reasoning-Dataset
