# reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT

## Resumen

Qwen3-1.7B-Coder-Distilled-SFT es un modelo de lenguaje causal de aproximadamente 2.000 millones de parametros (1,7B nominales) desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division). Se construye sobre Qwen/Qwen3-1.7B mediante un pipeline de dos etapas: primero una destilacion de conocimiento desde Qwen3-Coder-30B-A3B-Instruct para establecer una base de razonamiento STEM estructurado, y despues un ajuste supervisado (SFT) sobre aproximadamente 54.607 pares de inferencia logica.

El objetivo declarado es activar y hacer explicita la estructura de razonamiento secuencial, seguimiento de estado y descomposicion composicional que el profesor Coder transfiere durante la destilacion, aplicandola a logica proposicional formal. La hipotesis del autor es que el modelo no aprende logica desde cero, sino que aflora patrones latentes adquiridos en la etapa STEM.

Es relevante por su enfoque en modelos pequenos orientados a edge y por documentar de forma detallada el pipeline de destilacion (funcion de perdida mixta con ponderacion de prueba y divergencia KL). Su contexto de entrenamiento es notablemente corto (1024 tokens) y esta pensado principalmente para tareas de razonamiento STEM y logica en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (causal LM, RoPE, GQA) |
| Parametros totales | 2.031.739.904 (~2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso basado en Qwen3, con Rotary Position Embeddings (RoPE) y Grouped Query Attention (GQA). El entrenamiento se divide en dos etapas. La primera es una destilacion de conocimiento desde Qwen3-Coder-30B-A3B-Instruct (un MoE de 30B con 3B activos) sobre 6.122 muestras de chain-of-thought STEM en 12 dominios (fisica, algebra lineal, ecuaciones diferenciales, electromagnetismo, matematicas, ingenieria, mecanica clasica y teorica, calculo avanzado, fisica moderna, fisiologia y biologia molecular), provenientes de datasets de 0xZee. La funcion de perdida combina Proof-Weighted Cross-Entropy (55%, con peso 2,5x a 1,5x sobre tokens de derivacion) y divergencia KL de destilacion (45%, temperatura T=2.0 escalada por T²). Se entreno 1 epoca con batch efectivo de 8, learning rate 1.5e-5 a 1e-6 (coseno) y precision bf16.

La segunda etapa es un SFT sobre KonstantinDob/logic_inference_dataset, con aproximadamente 54.607 pares instruccion-respuesta derivados de 5.491 problemas unicos de inferencia logica (split IID, formato LOGICINFERENCE), que cubren logica proposicional, implicacion logica e inferencia formal. Se uso 1 epoca, batch efectivo de 8, learning rate 5e-6 (mas bajo para preservar el backbone), gradient checkpointing y bf16.

## Capacidades

- Generacion de texto y razonamiento causal en ingles.
- Razonamiento STEM con cadenas de pensamiento: derivaciones matematicas, fisica, ingenieria, algebra lineal y ecuaciones diferenciales.
- Inferencia logica formal: logica proposicional, implicacion y reglas de inferencia con premisas explicitas.
- Descomposicion composicional y seguimiento de estado, heredados del profesor Coder.
- Generacion de codigo (capacidad heredada del profesor Coder, aunque no es el foco del SFT final).
- Tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Resolucion de problemas de fisica y matematicas con derivacion paso a paso: el modelo fue destilado especificamente sobre CoT STEM y puede generar derivaciones estructuradas con respuesta final, adecuado para asistentes de estudio o generacion de material docente.
- Verificacion de inferencias logicas formales: dado un conjunto de premisas y una conclusion, el modelo aplica reglas de inferencia antes de dar la respuesta, util en herramientas de ensenanza de logica o validacion de argumentos.
- Generacion de explicaciones tecnicas para documentacion STEM: puede producir explicaciones detalladas de conceptos de ingenieria o calculo con estructura de prueba.
- Preprocesado de razonamiento en pipelines de datos: util como generador de cadenas de razonamiento sinteticas para aumentar datasets de entrenamiento de modelos mayores.
- Despliegue en dispositivos edge o entornos con recursos limitados: con ~2B parametros y licencia Apache 2.0, es viable en GPU de consumo y en CPUs con cuantizacion, para tareas de razonamiento acotadas.
- Prototipado rapido de asistentes de resolucion de problemas en ingles: su tamano permite iteracion rapida en experimentacion academica o pruebas de concepto.
- Tutor automatico de logica proposicional: gestiona instrucciones con formato LOGICINFERENCE y produce inferencias explicitas, adecuado para entornos educativos de logica formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en bf16/fp16 para los ~2B parametros, sin contar overhead de activaciones y cache KV.
- En cuantizacion de 8 bits: aproximadamente 2-3 GB de VRAM.
- En cuantizacion de 4 bits: aproximadamente 1,5-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Cabe holgadamente en GPU de consumo.
- Cabe en GPU consumer: si, en RTX 3060/4060/4090 y modelos superiores; tambien en GPUs integradas o CPU con cuantizacion.
- Opciones de despliegue: transformers (documentado en la model card), llama.cpp, Ollama y vLLM (compatible con text-generation-inference segun tags). GGUF no se distribuye oficialmente, requeriria conversion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-1.7B-Coder-Distilled-SFT | ~2B | 1024 (entrenamiento) | Apache 2.0 | Razonamiento STEM + logica |
| Qwen/Qwen3-1.7B (base) | ~2B | mayor (no especificado en la informacion) | Apache 2.0 | Proposito general |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (profesor) | 30B (3B activos) | no disponible | no disponible | Codigo y razonamiento |

La comparacion cuantitativa de rendimiento no esta disponible. Frente al modelo base Qwen3-1.7B, este modelo anade especializacion en razonamiento STEM y logica a costa de un contexto de entrenamiento reducido (1024 tokens) y foco en ingles. Frente al profesor de 30B, ofrece un tamano mucho menor apto para edge, a cambio de menor capacidad general.

## Limitaciones y advertencias

- Contexto de entrenamiento muy limitado (1024 tokens), lo que restringe tareas que requieran ventanas largas o conversaciones multi-turno extensas.
- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion en derivaciones y respuestas finales, especialmente fuera de los dominios STEM cubiertos en el entrenamiento.
- Sesgos conocidos: no documentados en la model card, pero heredables del modelo base y de los datasets de destilacion.
- Datasets de entrenamiento de tamano reducido (6.122 muestras STEM y ~54.607 pares de logica), lo que puede limitar la generalizacion.
- No hay datos publicados de benchmarks, evaluaciones de seguridad ni pruebas de robustez.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye tal cual.
- No documenta soporte de tool calling ni de agentes, por lo que no es recomendable para pipelines que dependan de esas capacidades sin validacion previa.
- El modelo base Qwen3-1.7B puede tener su propio modo de razonamiento; la model card no especifica si se preserva o modifica dicho comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de inferencia logica: https://huggingface.co/datasets/KonstantinDob/logic_inference_dataset
- Paper LogicInference: https://openreview.net/pdf?id=HAGeIS_Lcg9
- Datasets STEM de 0xZee: https://huggingface.co/0xZee
- Organizacion del autor: https://convergentintel.com
