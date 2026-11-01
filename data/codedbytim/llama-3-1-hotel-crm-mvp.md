# codedbytim/llama-3.1-hotel-crm-mvp

## Resumen

Llama-3.1-hotel-crm-mvp es un modelo de lenguaje afinado (fine-tuned) a partir de Meta-Llama 3.1 8B Instruct, publicado por el usuario codedbytim en HuggingFace. El modelo base es la versión cuantizada a 4 bits (bitsandbytes) de Unsloth del Llama 3.1 8B Instruct, y el afinado se ha realizado con la librería Unsloth junto con TRL de HuggingFace, lo que permite entrenar hasta dos veces más rápido que con los métodos convencionales. Como su nombre indica, está orientado a un caso de uso vertical: un MVP de CRM para el sector hotelero.

El modelo resuelve la necesidad de disponer de un asistente conversacional especializado en la gestión de relaciones con clientes de hoteles, sin tener que desplegar un modelo de gran tamaño. Con algo más de 8.000 millones de parámetros y una licencia Apache 2.0, es un candidato razonable para prototipos y pruebas de concepto en entornos de atención al cliente hotelera.

Cabe destacar que la model card es mínima: no documenta el dataset de entrenamiento, ni los hiperparámetros, ni los benchmarks. Se trata de un modelo comunitario de tipo "mvp" (minimum viable product), por lo que conviene evaluarlo con cautela antes de cualquier uso en producción. No se ha publicado información sobre la longitud de contexto resultante, aunque al derivar de Llama 3.1 8B Instruct es razonable asumir la ventana base de 128.000 tokens salvo modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autorregresivo (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 8B soporta 128.000 tokens) |
| Tipos de cuantizacion | base cuantizado a 4 bits (bitsandbytes, vía Unsloth); pesos del repo en 16,1 GB |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y endpoints) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B: un transformer decoder puramente autorregresivo con atención agrupada por consultas (GQA), codificaciones posicionales RoPE y tokenizador de 128.000 tokens de vocabulario. No es un modelo de mezcla de expertos (MoE), por lo que todos los parámetros están activos en cada pasada de inferencia.

El afinado parte de `unsloth/meta-llama-3.1-8b-instruct-bnb-4bit`, es decir, una copia cuantizada a 4 bits del instruct de Meta preparada por Unsloth. El entrenamiento se realizó con la librería Unsloth y TRL de HuggingFace, que el autor indica que permitió entrenar "2x más rápido". No se ha publicado información sobre el dataset utilizado, el número de tokens de entrenamiento, el método (LoRA/QLoRA frente a full fine-tuning) ni si se aplicaron técnicas de alineación como RLHF o DPO. Dado que la base es una versión 4-bit de Unsloth, es plausible que se tratase de un QLoRA, pero esto no está confirmado en la model card.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3.1 8B Instruct.
- Afinado orientado a tareas de CRM hotelero (gestión de clientes, reservas y relaciones con huéspedes, según el nombre del proyecto), aunque el dominio exacto de los datos no está documentado.
- Instrucciones multi-turno gracias a la base Instruct de Llama 3.1.
- Razonamiento general, generación de código y matemáticas a nivel del modelo base, presumiblemente con posible degradación en dominios fuera del afinado.
- No se ha documentado soporte específico de tool calling, function calling, visión, audio ni modo de razonamiento extendido para este afinado concreto.
- Compatible con el pipeline de text-generation de transformers y con endpoints de inferencia de HuggingFace.

## Casos de uso

- Asistente de CRM hotelero: gestión conversacional de fichas de clientes, consultas sobre reservas y seguimiento de huéspedes, que es el propósito declarado del afinado.
- Atención al cliente en recepción virtual: el modelo puede gestionar conversaciones multi-turno en inglés para responder dudas frecuentes de huéspedes antes de escalar a un agente humano.
- Prototipado rápido de agentes verticales: al ser un MVP ligero de 8B con licencia permisiva, sirve como punto de partida para validar flujos de CRM antes de invertir en afinados más costosos.
- Redacción de comunicaciones con clientes: generación de correos y mensajes de seguimiento personalizados para huéspedes a partir de datos del CRM.
- Resumen de interacciones: condensación de historiales de conversación con clientes en notas accionables para el personal del hotel.
- Pruebas de despliegue en hardware modesto: su tamaño de 8B y origen cuantizado a 4 bits lo hacen adecuado para validar pipelines de inferencia en GPUs de consumo.
- Base para afinados adicionales: al ser un checkpoint comunitario con licencia Apache 2.0, puede reafinarse con datos propios del sector hotelero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, ni datos de comparación con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 16,1 GB en safetensors, lo que sugiere pesos en precisión media (aproximadamente BF16); se recomienda una GPU con al menos 18-24 GB de VRAM para inferencia cómoda con contexto amplio. Si se emplea cuantización a 4 bits en tiempo de carga (como la de su modelo base), podría funcionar en torno a 6-8 GB de VRAM.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para pesos sin cuantizar; RTX 4060 Ti 16 GB o superior si se carga con cuantización a 4 bits; A100 o H100 para despliegues con concurrencia alta.
- Consumer GPUs: sí, cabe en una RTX 4090 sin cuantizar y en GPUs de 8-12 GB de VRAM aplicando cuantización a 4 bits.
- Opciones de despliegue: transformers (librería nativa declarada), HuggingFace Inference Endpoints (tag endpoints_compatible), vLLM, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión o si existe cuantización publicada, que no está disponible en el repo).
- Latencia y throughput: no disponible; al ser un modelo denso de 8B, se esperan cifras típicas de esta clase (decenas de tokens por segundo en una RTX 4090), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| codedbytim/llama-3.1-hotel-crm-mvp | 8,03 B | no disponible (base: 128.000 tokens) | Apache 2.0 | Afinado vertical hotelero, sin benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8 B | 128.000 tokens | Llama 3.1 Community License | Modelo base; benchmarks publicados y soporte oficial |
| unsloth/meta-llama-3.1-8b-instruct-bnb-4bit | 8 B (cuantizado 4-bit) | 128.000 tokens | Llama 3.1 Community License | Base directa de este afinado, optimizada para QLoRA |

En comparación con su modelo base, este afinado aporta especialización en el dominio hotelero pero pierde trazabilidad documental: Meta publica evaluaciones completas de Llama 3.1 8B Instruct, mientras que este MVP no incluye ninguna métrica. La ventaja de licencia es notable: Apache 2.0 del afinado frente a la licencia comunitaria de Meta, aunque esta última también permite uso comercial en la mayoría de escenarios.

## Limitaciones y advertencias

- Ausencia total de documentación de entrenamiento: no se conoce el dataset, por lo que es imposible evaluar sesgos, contaminación de datos de evaluación o calidad del afinado.
- Riesgo de alucinación elevado para un modelo comunitario sin evaluaciones publicadas; no debe usarse en producción sin validación específica.
- Limitado al inglés según los metadatos; el rendimiento en castellano no está garantizado y probablemente corresponda solo a la capacidad residual del modelo base.
- La longitud de contexto del afinado no está confirmada; si el entrenamiento usó secuencias cortas (habitual en QLoRA con Unsloth), el comportamiento con contextos de 128.000 tokens podría degradarse.
- Posible olvido catastrófico: los afinados verticales suelen perder capacidades generales (código, razonamiento) respecto al modelo base.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, pero los modelos Llama heredan consideraciones de la política de uso de Meta en la práctica.
- Solo 438 descargas y 0 likes en el momento de la ficha: adopción mínima y sin validación comunitaria.
- No hay cuantizaciones alternativas publicadas (GGUF, AWQ, GPTQ), lo que limita las opciones de despliegue eficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codedbytim/llama-3.1-hotel-crm-mvp
- Modelo base de Unsloth: https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-bnb-4bit
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace (usada en el entrenamiento): https://github.com/huggingface/trl
