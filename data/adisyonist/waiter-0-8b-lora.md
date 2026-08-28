# adisyonist/waiter-0.8B-lora

## Resumen

Waiter-0.8B-LoRA es un adaptador de tipo QLoRA desarrollado por Adisyonist AI (Ömer Faruk ŞAHAN) sobre el modelo base Qwen/Qwen3.5-0.8B. Su propósito es el enrutamiento de herramientas (tool routing) para sistemas de punto de venta (POS) en el sector de la restauración, permitiendo que el personal gestione pedidos, mesas, reservas, inventario y análisis de ventas mediante conversación natural en múltiples idiomas.

El modelo genera una salida JSON estructurada que indica qué agentes o herramientas deben activarse y una respuesta textual en lenguaje natural. Está entrenado con 532.856 ejemplos en 43 idiomas, y los resultados de evaluación sobre un conjunto de test reservado muestran una precisión de enrutamiento del 98,81% (99,40% ajustado por truncamiento). Al ser un adaptador LoRA de pequeño tamaño (el modelo base tiene 0,8B parámetros), es muy ligero y adecuado para despliegues en entornos con recursos limitados.

La relevancia actual radica en la tendencia hacia modelos especializados y compactos que pueden ejecutarse en hardware modesto, frente a modelos generalistas de gran tamaño. Este adaptador demuestra que es posible obtener un rendimiento muy alto en una tarea concreta (enrutamiento de herramientas POS) con un coste computacional mínimo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B) con adaptador LoRA |
| Parametros totales | 0,8B (modelo base) + adaptador LoRA (rank 16, alpha 32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | Adaptador entrenado con QLoRA 4-bit NF4, doble cuantizacion; modelo base en BF16 |
| Idiomas soportados | 43 idiomas (según corpus de entrenamiento) |
| Licencia | Apache 2.0 (adaptador) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. El adaptador fue entrenado mediante QLoRA, que cuantiza el modelo base a 4-bit NF4 con doble cuantización y usa computación en BF16. Los hiperparámetros LoRA son: rank 16, alpha 32 y dropout 0,05.

El entrenamiento se realizó con TRL `SFTTrainer` sobre un corpus de 532.856 ejemplos, dividido en 426.285 para entrenamiento, 53.285 para validación y 53.286 para test reservado. Los datos cubren 43 idiomas y están orientados a tareas de gestión de restaurante y POS: añadir artículos, ejecutar acciones sobre mesas, consultar inventario, etc. La salida se formatea como un objeto JSON con dos campos: `agents` (lista de herramientas a invocar) y `answer` (respuesta textual al usuario).

No se menciona el uso de RLHF ni DPO; el entrenamiento es exclusivamente de supervisión fina (SFT).

## Capacidades

- Enrutamiento de herramientas (tool routing) para sistemas POS: el modelo identifica qué agentes o acciones deben ejecutarse a partir de una petición en lenguaje natural.
- Generación de respuestas textuales en lenguaje natural, coherentes con la acción solicitada.
- Soporte multilingüe: entrenado en 43 idiomas, lo que permite su uso en entornos internacionales.
- Salida estructurada en JSON, facilitando la integración en pipelines de software.
- Especialización en dominio de restauración: pedidos, mesas, reservas, inventario, análisis de ventas.
- No se especifican capacidades de visión, audio ni razonamiento multimodal (aunque el modelo base Qwen3.5-0.8B podría tenerlas, el adaptador no las añade ni las garantiza).

## Casos de uso

- Gestión de pedidos en restaurante: el camarero dicta "añade dos hamburguesas y una Coca-Cola a la mesa 5" y el modelo devuelve `{"agents": ["prepareAddItems", "executeTableAction"], "answer": "He añadido los artículos a la mesa 5."}`. Adecuado por su alta precisión de enrutamiento (98,81%).
- Atención al cliente automatizada: un chatbot integrado en el sistema POS puede interpretar peticiones de los clientes y ejecutar acciones como reservar mesa, consultar el menú o pedir la cuenta, gracias a su salida JSON estructurada.
- Asistente de inventario: preguntas como "¿cuántas unidades quedan de vino tinto?" activan el agente de consulta de inventario y devuelven la respuesta en lenguaje natural.
- Análisis de ventas: el modelo puede enrutar peticiones como "dame las ventas de ayer por categoría" hacia el agente de analítica correspondiente.
- Automatización de tareas administrativas en POS: cambiar precios, aplicar descuentos, gestionar reservas, todo mediante conversación.
- Despliegue en dispositivos de bajo coste: al ser un modelo de 0,8B, puede ejecutarse en una Raspberry Pi o en CPUs sin GPU, lo que lo hace viable para pequeños negocios.

## Benchmarks y rendimiento

Los resultados sobre el conjunto de test reservado (53.286 ejemplos) son los siguientes:

| Metrica | Valor |
|---|---|
| Raw agent exact accuracy | 98,81% |
| Adjusted agent exact accuracy | 99,40% |
| JSON validity | 99,41% |
| Answer exact-match | 92,57% |

La precisión ajustada tiene en cuenta los casos donde la generación se truncó por el límite de tokens configurado, pero la cadena de agentes generada era correcta. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Modelo base de 0,8B parámetros: en BF16 ocupa aproximadamente 1,6 GB de memoria; el adaptador LoRA añade menos de 50 MB.
- Con cuantización 4-bit (como la usada en entrenamiento), el modelo base podría ocupar unos 0,4-0,5 GB, permitiendo inferencia en CPUs y GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente. También funciona en Apple Silicon (M1/M2) y en CPUs modernas.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con Transformers + PEFT, o fusionar el adaptador en el modelo base y exportar a GGUF para usar con llama.cpp u Ollama. También es compatible con vLLM y TGI si se fusiona previamente.
- Latencia y throughput: no se han publicado datos específicos, pero dado el pequeño tamaño, se espera una latencia de decenas de milisegundos por petición en GPU y de unos cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adisyonist/waiter-0.8B-lora | 0,8B + LoRA | No disponible | Tool routing POS | Apache 2.0 | HuggingFace |
| adisyonist/waiter-1B-lora | 1B + LoRA | No disponible | Tool routing POS | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Generalista | Apache 2.0 (según HF) | HuggingFace |

El adaptador 0.8B es la versión compacta de la familia Waiter; existe una variante de 1B que probablemente ofrezca mayor capacidad a costa de más recursos. El modelo base Qwen3.5-0.8B es generalista y no está especializado en enrutamiento de herramientas, por lo que el adaptador aporta una mejora sustancial en la tarea concreta.

## Limitaciones y advertencias

- Es un adaptador especializado en dominio POS; fuera de ese ámbito su rendimiento puede degradarse significativamente y generar respuestas irrelevantes o alucinadas.
- La salida puede truncarse si el límite de tokens configurado es demasiado bajo, aunque la precisión ajustada (99,40%) indica que el enrutamiento suele ser correcto incluso en esos casos.
- No se han documentado sesgos específicos, pero al estar entrenado en 43 idiomas, el rendimiento puede variar entre idiomas con menos representación en el corpus.
- La licencia del adaptador es Apache 2.0, pero la del modelo base Qwen3.5-0.8B debe consultarse en su página de HuggingFace; aunque generalmente es Apache 2.0, es responsabilidad del usuario verificar los términos.
- No se proporcionan datos sobre la composición exacta del corpus de entrenamiento ni sobre posibles datos sensibles (por ejemplo, información de clientes), por lo que se recomienda auditar el modelo antes de usarlo en producción con datos reales.
- El modelo no tiene capacidades de visión ni audio; el ejemplo de código usa `AutoModelForImageTextToText`, pero el adaptador no está entrenado para tareas multimodales.

## Enlaces

- Adaptador LoRA: https://huggingface.co/adisyonist/waiter-0.8B-lora
- Modelo fusionado completo: https://huggingface.co/adisyonist/waiter-0.8B
- Variante 1B: https://huggingface.co/adisyonist/waiter-1B-lora
- Organización Adisyonist AI: https://huggingface.co/adisyonist
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio web de Adisyonist: https://en.adisyonist.com/
