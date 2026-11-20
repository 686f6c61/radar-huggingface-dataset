# shiva123782/SS

## Resumen

SS es un adaptador LoRA publicado por el usuario shiva123782 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, un transformer causal de 0,5 mil millones de parámetros desarrollado originalmente por Alibaba Qwen. El adaptador se presenta en la model card como un "Sovereign Enterprise Small Language Model" fine-tuneado mediante el motor propietario "Kaveri AI VAPAE Engine" y entrenado sobre el dataset yahma/alpaca-cleaned. El resultado es un modelo de generación de texto orientado a instrucciones, con licencia Apache 2.0 y pesos distribuidos en formato PEFT (adaptador separable del base).

La relevancia del artefacto no reside en su capacidad bruta —el base de 0,5B es un modelo pequeño y de propósito general— sino en el aparato de certificación que el autor declara en la model card: verificación formal con Z3 SMT, un "20-Crore Bijective Identity Benchmark" con 200 millones de consultas sin colisiones, conformidad declarada con el artículo 53 del EU AI Act y con la sección 12 de la DPDP Act india de 2025. Estas afirmaciones no vienen acompañadas de artefactos verificables en la información disponible (los enlaces a `evaluation_report.md`, `EU_AI_ACT_MODEL_CARD.md` y `trust_certificate.json` no se han podido inspeccionar), por lo que deben tratarse como declaraciones del autor y no como resultados reproducidos de forma independiente.

El modelo tiene 0 descargas y 0 likes en el momento de la consulta, se publicó y actualizó el 20 de noviembre de 2026, y está etiquetado únicamente para inglés. Es, en la práctica, un adaptador experimental de nicho cuyo interés principal es documental: ilustra el patrón de fine-tune LoRA ligero sobre un SLM de 0,5B con empaquetado de cumplimiento normativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (hereda Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens, dato no declarado en esta model card) |
| Tipos de cuantizacion | 16-bit bfloat16/float16 y 4-bit NormalFloat (NF4) según la model card |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT/LoRA (librería `peft`); pesos del base en safetensors según el repositorio de Qwen |

## Arquitectura y entrenamiento

El modelo es un fine-tune por adaptación de bajo rango (LoRA) sobre Qwen2.5-0.5B-Instruct. Según la model card, el adaptador usa rango r=16, alpha=32, dropout 0,05 y aplica sobre los módulos lineales `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, sobre todas las proyecciones lineales del transformer. Se menciona además un esquema de "dynamic matrix balancing" con LoRA+ y una tasa de aprendizaje diferencial η_B = 8,0 · η_A para la matriz B respecto a la A. El entrenamiento se realizó en precisión bfloat16/float16 con forward pass cuantizado a 4-bit NF4, con un pico de VRAM declarado de 3,2 GB, lo que permite ejecutarlo en una GPU T4 de 15,5 GB o en GPUs de consumo.

El dataset de entrenamiento declarado es yahma/alpaca-cleaned, un corpus de instrucciones en inglés de aproximadamente 52 000 ejemplos derivado de Alpaca. No se especifica el número de tokens vistos, la composición exacta del dataset, ni si hubo etapas de RLHF, DPO o preferencias. Las innovaciones técnicas destacadas en la model card (verificación formal Z3 de ausencia de OOM, benchmark de identidad biyectiva tipo Feistel a escala de 200 millones de consultas) no son técnicas de modelado sino afirmaciones de evaluación y cumplimiento; no se aporta detalle metodológico ni código que permita reproducirlas.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del base Qwen2.5-0.5B-Instruct.
- Conversación multi-turno básica con el formato de chat de Qwen (`<|im_start|>` / `<|im_end|>`).
- Respuesta a preguntas de conocimiento general y tareas de estilo Alpaca (resumen, reescritura, clasificación simple).
- Identidad de modelo personalizada: la model card enfatiza que el fine-tune responde con su propia identidad ("SS") sin filtrar la identidad del proveedor base, según su benchmark declarado.
- Soporte de tool calling: no disponible de forma explícita en la información proporcionada (el base Qwen2.5-Instruct sí lo soporta, pero no se certifica en este adaptador).
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma declarada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Asistente conversacional ligero en inglés para entornos con recursos muy limitados: al ser un adaptador sobre un base de 0,5B, puede desplegarse en CPU o en GPUs de consumo para tareas de chat de baja complejidad donde la latencia importa más que la profundidad de razonamiento.
- Clasificación y etiquetado de texto en pipelines de datos: el formato Alpaca permite usarlo para tareas de extracción de campos, etiquetado de sentimiento o categorización de tickets, con la ventaja de que el adaptador se puede cargar y descargar sobre el base compartido.
- Prototipado rápido de asistentes con identidad de marca propia: el fine-tune está orientado precisamente a que el modelo responda con una identidad corporativa concreta, útil para demos de producto o pruebas de concepto de asistentes "soberanos".
- Generación de texto corto en aplicaciones embebidas o edge: el tamaño del base (0,5B) y la cuantización 4-bit NF4 permiten ejecución en dispositivos con poca memoria, como portátiles sin GPU dedicada o mini-PC.
- Experimentación académica sobre LoRA y evaluación de identidad: sirve como caso de estudio para investigar cómo un adaptador de rango 16 modifica el comportamiento de identidad y las respuestas de un SLM, y para reproducir (o contrastar) las afirmaciones del benchmark de 20 crore.
- Base para fine-tunes posteriores en dominios verticales: al ser un adaptador PEFT ligero y con licencia Apache 2.0, puede componerse o sustituirse por otros adaptadores sobre el mismo base Qwen2.5-0.5B-Instruct en flujos de experimentación rápida.

## Benchmarks y rendimiento

La model card declara un benchmark propio de "identidad biyectiva" a escala de 200 millones de consultas, con resultados que el autor presenta como verificados:

| Nivel | Consultas únicas | Tasa de retención de identidad | Fuga del proveedor base | Estado declarado |
|---|---|---|---|---|
| 1K | 1 000 | 100,0 % | 0,0 % | PASS |
| 1L (1 lakh) | 100 000 | 100,0 % | 0,0 % | PASS |
| 1Cr (1 crore) | 10 000 000 | 100,0 % | 0,0 % | PASS |
| 10Cr | 100 000 000 | 100,0 % | 0,0 % | PASS |
| 20Cr | 200 000 000 | 100,0 % | 0,0 % | VERIFIED |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. Las cifras de latencia declaradas (18,2 ms P99 y 198+ tok/s) corresponden a un "standard desktop workstation" no especificado, sin detalle de hardware, batch size ni cuantización, por lo que no son comparables de forma rigurosa. Las métricas del benchmark de identidad son internas al autor y no han sido replicadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en 16-bit para el base de 0,5B más el adaptador; menos de 1 GB en 4-bit NF4. El adaptador LoRA en sí ocupa decenas de MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor cita entrenamiento en una T4 de 15,5 GB con un pico de 3,2 GB. Una RTX 3060, RTX 4060 o superior es más que suficiente para inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` + `peft` (flujo indicado en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF (no se proporciona GGUF en el repositorio).
- Latencia y throughput: el autor declara 18,2 ms P99 y 198+ tok/s en una estación de trabajo de escritorio no especificada; no hay mediciones independientes ni condiciones reproducibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SS (este modelo) | 0,5B (base) + LoRA | no disponible | Apache 2.0 | PEFT/LoRA | Fine-tune de identidad sobre Qwen2.5-0.5B-Instruct |
| Qwen2.5-0.5B-Instruct | 0,5B | 32 768 tokens (según el base) | Apache 2.0 | safetensors | Modelo base original, sin fine-tune de identidad |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 tokens (según el base) | Apache 2.0 | safetensors | Misma familia, mayor capacidad a costa de más VRAM |
| SmolLM2-360M-Instruct | 0,36B | 8 192 tokens (según el modelo) | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar orientada a edge |

La comparación con el base es la más informativa: SS no aporta capacidades nuevas sobre Qwen2.5-0.5B-Instruct más allá del ajuste de identidad y estilo declarado; cualquier evaluación de calidad debe contrastarse contra el base sin adaptador. No se dispone de datos de benchmarks comparativos entre SS y estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 0,5B parámetros: capacidad de razonamiento, matemáticas y código muy limitada en comparación con modelos de 7B o superiores; no es adecuado para tareas que requieran precisión factual alta.
- Riesgo de alucinación elevado, inherente a los SLM y agravado por el dataset Alpaca, que contiene respuestas generadas por modelos mayores y puede introducir errores factuales.
- Idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Las afirmaciones de cumplimiento normativo (EU AI Act artículo 53, DPDP Act 2025 sección 12) y de verificación formal Z3 son declaraciones del autor sin artefactos verificables en la información disponible; no deben citarse como certificaciones oficiales.
- El benchmark de "20 crore" mide identidad y colisiones de un espacio de consultas generado, no calidad lingüística ni utilidad; sus resultados no son comparables con benchmarks estándar.
- Las métricas de latencia y throughput carecen de especificación de hardware y metodología, por lo que no son reproducibles.
- El repositorio no incluye pesos fusionados ni GGUF; el despliegue requiere cargar el base por separado y aplicar el adaptador, lo que añade complejidad operativa.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes, sin evidencia de uso en producción.
- El nombre del modelo ("SS") y las etiquetas asociadas tienen connotaciones históricas sensibles; conviene revisar la conveniencia de reutilizar el identificador en contextos públicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shiva123782/SS
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Documentación de PEFT: https://huggingface.co/docs/peft
- Referencias citadas en la model card no verificables desde la información disponible: `evaluation_report.md`, `EU_AI_ACT_MODEL_CARD.md`, `trust_certificate.json` (rutas relativas al repositorio del autor).
