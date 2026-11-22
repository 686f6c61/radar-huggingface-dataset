# iamnish7/smollm2-finetuned-chat-instruct-full

## Resumen

`iamnish7/smollm2-finetuned-chat-instruct-full` es un ajuste fino completo (full fine-tuning) del modelo base `HuggingFaceTB/SmolLM2-135M`, un transformer decoder-only de 135 millones de parametros desarrollado originalmente por Hugging Face. El checkpoint ha sido entrenado por el usuario iamnish7 en el contexto de la asignatura CSC2516 (Homework 10) sobre el split de entrenamiento de conversaciones cotidianas del dataset `HuggingFaceTB/smoltalk`, con el objetivo de mejorar el comportamiento conversacional del modelo base en tareas de chat instructivo.

El modelo es relevante principalmente como artefacto academico y como ejemplo reproducible de fine-tuning completo sobre un modelo pequeno. No introduce innovaciones arquitectonicas ni cambios en el tokenizador respecto al modelo base; el repositorio incluye los pesos en `safetensors` y el tokenizador asociado. Su tamano reducido (unos 134,5 millones de parametros y 0,5 GB de repositorio) lo hace adecuado para experimentacion en hardware modesto, no para despliegues de produccion con requisitos de calidad elevados.

Al tratarse de un ajuste fino de un modelo de 135M, sus capacidades quedan acotadas por el techo del modelo base: generacion de texto conversacional de complejidad baja a media, sin garantias de razonamiento profundo, sin tool calling nativo y con un conocimiento factual limitado. La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion estandarizada publica hace recomendable tratarlo como un checkpoint experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tags del repositorio) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base SmolLM2-135M) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser pesos safetensors en fp32/bf16 es convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM2-135M: un transformer decoder-only de tipo Llama, con atencion causal multi-cabeza y normalizacion RMSNorm, disenado para generacion autoregresiva de texto. El ajuste realizado por el autor es un full fine-tuning, es decir, se actualizan todos los parametros del modelo en lugar de aplicar tecnicas como LoRA o QLoRA. El unico dataset declarado es el split de entrenamiento de conversaciones cotidianas de `HuggingFaceTB/smoltalk`, por lo que el entrenamiento se orienta especificamente al formato de dialogo instructivo cotidiano.

No se documentan en la informacion disponible el numero de tokens vistos, la configuracion de hiperparametros (learning rate, batch size, epochs), ni si se aplicaron etapas de RLHF o DPO. El unico dato de evaluacion aportado por el autor es la perdida reportada por el validador del homework: 0,9964 sobre 119 conversaciones reservadas. No se menciona ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.); el checkpoint conserva la configuracion del modelo base.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional, entrenada especificamente sobre dialogos cotidianos.
- Respuesta a instrucciones simples en estilo chat, condicionada por la calidad del split de SmolTalk utilizado.
- Generacion de texto general de complejidad baja a media, limitada por el tamano de 135M parametros del modelo base.
- Capacidades multilingues: no disponibles de forma declarada; dependen del modelo base y no estan documentadas en este checkpoint.
- Tool calling / function calling: no disponible de forma nativa.
- Agentes y razonamiento multi-paso: no disponible; el modelo no esta disenado ni entrenado para ello.
- Vision, audio o modalidades adicionales: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Prototipado rapido de chatbots conversacionales: el modelo puede sostener intercambios multi-turno de complejidad baja en entornos de desarrollo y demos, gracias a su tamano reducido y a su ajuste sobre conversaciones cotidianas.
- Experimentacion academica y docencia: sirve como referencia reproducible de un pipeline de full fine-tuning sobre SmolLM2-135M con SmolTalk, util en cursos y trabajos practicos de NLP.
- Pruebas de infraestructura de inferencia: al ocupar unos 0,5 GB en safetensors, permite validar pipelines de despliegue (transformers, TGI, vLLM, llama.cpp tras conversion) sin coste de GPU significativo.
- Generacion de respuestas cortas en asistentes embebidos: puede integrarse en aplicaciones de bajo consumo de recursos donde la latencia y el coste importan mas que la calidad factual.
- Filtrado y clasificacion conversacional auxiliar: puede emplearse para tareas ligeras de reformulacion o normalizacion de mensajes en un pipeline mayor, siempre con supervision posterior.
- Base para iteraciones de fine-tuning: al ser un checkpoint ya ajustado sobre dialogos, puede servir como punto de partida para nuevos ajustes especificos de dominio con datasets propios.
- Evaluacion comparativa de tecnicas de ajuste: permite contrastar full fine-tuning frente a LoRA/QLoRA sobre el mismo modelo base y dataset, midiendo perdida y calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion reportado por el autor es la perdida del validador del homework: 0,9964 sobre 119 conversaciones reservadas del split de validacion de SmolTalk.

| Metrica | Valor | Contexto |
|---|---|---|
| Loss (validador del homework) | 0,9964 | 119 conversaciones reservadas |
| Benchmarks publicos (MMLU, HumanEval, GSM8K) | no disponible | no reportados |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5M parametros), mas overhead de activaciones y cache KV; en la practica menos de 2 GB.
- VRAM estimada en bf16/fp16: aproximadamente 0,27 GB para pesos; menos de 1 GB con overhead.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,14 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,07 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de gama baja y en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer con al menos 2 GB de VRAM; tambien es viable en inferencia por CPU.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag `endpoints_compatible`), y conversion a GGUF para `llama.cpp`/Ollama mediante herramientas externas (no incluida en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera throughput alto y latencia baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| iamnish7/smollm2-finetuned-chat-instruct-full | 134,5M | no disponible | Apache 2.0 | Hugging Face | Full fine-tuning sobre SmolTalk; sin benchmarks publicos |
| HuggingFaceTB/SmolLM2-135M | 135M | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base; ampliamente evaluado por Hugging Face |
| HuggingFaceTB/SmolLM2-360M | 360M | no disponible en esta ficha | Apache 2.0 | Hugging Face | Version mayor de la misma familia, mayor capacidad |
| Modelos tipo TinyLlama-1.1B | 1,1B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Mayor tamano y capacidad, mayor coste de inferencia |

La comparacion con el modelo base es la mas directa: este checkpoint anade un ajuste conversacional sobre SmolTalk, pero no documenta mejoras medibles frente al base mas alla del loss del validador del homework. Frente a SmolLM2-360M o TinyLlama-1.1B, este modelo ofrece menor huella de memoria a costa de menor capacidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar el modelo base y entrenarse sobre SmolTalk, puede reproducir sesgos presentes en esos datos.
- Riesgo de alucinacion: alto en proporcion al tamano del modelo (135M parametros); no debe usarse para afirmaciones factuales sin verificacion.
- Limitaciones de contexto: la longitud de contexto no esta declarada en este checkpoint; debe consultarse la configuracion del modelo base SmolLM2-135M antes de usarlo con entradas largas.
- Limitaciones de idioma: los idiomas soportados no estan declarados; el entrenamiento sobre SmolTalk esta orientado principalmente al ingles, por lo que el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar tambien la licencia y condiciones del modelo base y del dataset SmolTalk.
- Caveat de produccion: checkpoint academico con 0 descargas y 0 likes en el momento de la consulta, sin evaluacion estandarizada; no recomendado como componente critico en produccion sin evaluacion propia.
- Ausencia de tool calling, agentes y multimodalidad: no debe asumirse ninguna de estas capacidades.
- Trazabilidad limitada: no se publican hiperparametros de entrenamiento ni detalles del split utilizado, lo que dificulta reproducir el resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamnish7/smollm2-finetuned-chat-instruct-full
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Repositorio SmolLM (Hugging Face): https://github.com/huggingface/smollm
- Paper SmolLM2: https://arxiv.org/abs/2502.02737
