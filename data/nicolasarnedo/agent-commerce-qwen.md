# nicolasarnedo/agent-commerce-qwen

## Resumen

Agent commerce adapter es un adaptador LoRA de 10.911.744 parámetros publicado por nicolasarnedo sobre el modelo base Qwen3.5 2B, empaquetado en formato GGUF y distribuido con licencia Apache-2.0. Su propósito es acotado y muy específico: convertir peticiones breves de compra o pago en un agente de comercio que se ejecuta en el propio dispositivo (un iPhone, en el caso de la app Nest) en JSON estructurado que distingue entre una búsqueda de producto, un pago que el usuario ya ha realizado y cualquier otra cosa, extrayendo además consulta, precio máximo, divisa, comercio e importe.

El adaptador se entrenó con el SDK de QVAC sobre el modelo registrado `QWEN3_5_2B_MULTIMODAL_Q8_0` y se aplica en tiempo de carga mediante `modelConfig.lora`. Es relevante porque ilustra un patrón de despliegue on-device con modelos pequeños cuantizados: el modelo nunca decide una compra ni ejecuta un pago, sino que la aplicación valida cada campo extraído contra las palabras del usuario, de modo que el riesgo se traslada del modelo al código determinista.

Se trata de un artefacto de demostración para testnet (Sepolia, datos de demo y tokens de sustitución), no de un componente listo para producción. Su huella es mínima (repositorio de 0,0 GB) y está pensado para ejecutarse en el teléfono junto al modelo base cuantizado a Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5 2B (rank 16, alpha 32) |
| Parametros totales | 10.911.744 (adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | GGUF; entrenado en Q8_0, validado en Q4_K_M |
| Idiomas soportados | inglés (peticiones cortas en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`agentic-commerce-adapter.gguf`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones `attn_q, attn_k, attn_v, attn_o, ffn_gate, ffn_up, ffn_down` del modelo base Qwen3.5 2B, que según la model card es multimodal. El entrenamiento se realizó con el fine-tuning del SDK de QVAC sobre el modelo del registro `QWEN3_5_2B_MULTIMODAL_Q8_0`, con 2 épocas, learning rate de 3e-5 (mínimo 1e-6) y longitud de contexto de 320 tokens. Solo se calcularon pérdidas sobre los tokens del asistente.

Los datos combinan decisiones de comercio y peticiones de chat en una única ejecución ("mixed"), lo que explica tanto el rendimiento en lectura de peticiones como el efecto secundario documentado: la tarea de decisión se filtra ocasionalmente en el chat. El adaptador se aplica en tiempo de carga mediante `modelConfig.lora` y, pese a haberse entrenado en Q8_0, mantiene su rendimiento sobre la copia Q4_K_M que ejecuta el teléfono, con una variación de ±2 sobre 48 casos de chat.

## Capacidades

- Extracción de intención de compra: clasifica la petición como búsqueda, pago ya realizado o "otra cosa".
- Extracción de campos estructurados en JSON: consulta, precio máximo, divisa, comercio e importe.
- Conversión de lenguaje natural breve en salida estructurada apta para validación por código.
- Ejecución on-device: diseñado para correr en el teléfono mediante QVAC, sin llamadas a servidor.
- Integración con un agente de comercio: alimenta el chat de Nest, que paga desde una cartera WDK autocustodiada.
- Entrada multimodal heredada del modelo base Qwen3.5 2B (no se documentan detalles de uso de visión en el adaptador).
- No soporta tool calling genérico, agentes multi-paso ni razonamiento extendido más allá de la tarea de extracción para la que fue entrenado.

## Casos de uso

- Asistente de compras en el móvil: el adaptador convierte "busca auriculares por menos de 80 euros" en `{tipo: search, query: auriculares, precio_max: 80, divisa: EUR}`, que la app usa para consultar un catálogo; encaja porque la ventana de 320 tokens cubre peticiones cortas y la validación por código elimina el riesgo de campos inventados.
- Confirmación de pagos ya efectuados: ante "he pagado 12,50 a la cafetería", extrae comercio e importe para conciliar el recibo con la cartera WDK, sin que el modelo ejecute nunca el pago.
- Clasificación de intención en un agente conversacional: separa peticiones de búsqueda de pagos y de mensajes fuera de dominio, permitiendo enrutar cada caso a la rama de código adecuada.
- Demo de comercio agéntico en testnet: sirve para prototipar flujos de pago con tokens de sustitución en Sepolia antes de abordar integraciones reales.
- Filtro previo en pipelines de atención al cliente: descarta o etiqueta mensajes que no son transacciones antes de pasarlos a un modelo mayor, reduciendo coste y latencia en el dispositivo.
- Investigación sobre adaptadores LoRA pequeños: caso reproducible de fine-tuning con QVAC sobre un modelo de 2B cuantizado, útil para medir la degradación Q8_0 a Q4_K_M en tareas de extracción.

## Benchmarks y rendimiento

| Tarea | Adaptador | Base Qwen3.5 2B |
|---|---|---|
| Lectura correcta de peticiones de chat | 46/48 | 37/48 |
| Decisiones de comercio (casos ciegos) | 20/24, sin compras erróneas | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador suma unos 11 M de parámetros (aproximadamente 22 MB en FP16 y cerca de 6-11 MB en las cuantizaciones Q8_0/Q4_K_M); el grueso del consumo lo determina el modelo base Qwen3.5 2B.
- Modelo base de 2B cuantizado: cabe en GPUs de consumo con 4-8 GB de VRAM en Q4_K_M y en memoria unificada de un iPhone moderno, que es el destino real del despliegue.
- GPUs recomendadas: no disponible para el adaptador; para el base, cualquier GPU consumer con 8 GB o más es suficiente en cuantización Q4.
- Despliegue: el adaptador se carga con `modelConfig.lora` a través del SDK QVAC; al ser GGUF, es compatible con el ecosistema llama.cpp, aunque la model card solo documenta la ruta QVAC.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agent commerce adapter (este) | 10,9 M (adaptador LoRA) | 320 tokens | Extracción JSON de compra/pago on-device | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen3.5 2B (base) | 2 B | no disponible | Modelo generalista multimodal | según modelo base | Amplia |
| Adaptadores de extracción de intención genéricos | no disponible | no disponible | Clasificación y extracción | variable | no disponible |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con peticiones cortas en inglés; texto largo o ruidoso, como salida de OCR, debe limpiarse por código antes de la inferencia.
- La tarea de decisión se filtra en el chat: la model card documenta un caso en el que escribió "NVIDIA" en lugar de Nintendo, por lo que los nombres extraídos deben contrastarse con la entrada.
- Construido para una demo en testnet (Sepolia, datos de demo, tokens de sustitución); no está pensado para producción ni para pagos reales.
- Ventana de contexto de 320 tokens, insuficiente para conversaciones largas o documentos.
- Riesgo de alucinación en campos estructurados mitigado solo parcialmente por la validación en código; la app nunca debe confiar en el modelo para decidir una compra.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5 2B tiene su propia licencia que debe verificarse por separado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nicolasarnedo/agent-commerce-qwen
- Código de la app Nest: https://github.com/nicolasarnedo99/Nest-v1
