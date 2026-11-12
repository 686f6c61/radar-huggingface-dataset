# inception42/Jais-3-3.7B-Uno

## Resumen

Jais-3-3.7B-Uno es un adaptador LoRA de difusión (rango 128) desarrollado por inception42 que se monta sobre los pesos congelados de inception42/Jais-3-3.7B, un modelo de generación de texto de 3.700 millones de parámetros. Su propósito no es mejorar la calidad del modelo base, sino acelerar su decodificación de forma lossless: según la model card, consigue un incremento medio de velocidad de 1,67× manteniendo exactamente la misma distribución de salida que el modelo original, tanto en decodificación greedy como en muestreo.

La técnica empleada es la receta Uno, descrita en el paper "Unlocking Lossless Speedups in LLMs via Discrete Diffusion" (arXiv:2609.04010). El adaptador añade una vía de difusión que propone bloques de tokens candidatos en un solo forward pass, mientras que la vía autorregresiva original los verifica en bloque mediante el sampler Ψ-Spec. Al no requerir un modelo draft separado y al preservar la distribución del modelo base, elimina el compromiso habitual entre velocidad y calidad que introducen las técnicas clásicas de decodificación especulativa.

El modelo está orientado a árabe e inglés, se distribuye únicamente como adaptador (el repositorio pesa 1,1 GB y no incluye los pesos base) y requiere el motor de inferencia específico `nano_vllm_uno` del repositorio ifm-ai/uno; no es cargable con `PeftModel.from_pretrained` estándar. Es relevante para equipos que ya despliegan Jais-3-3.7B y buscan reducir latencia en entornos con GPU Hopper sin reentrenar ni aceptar degradación de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 128) sobre transformer autorregresivo; añade vía de difusión discreta con verificación especulativa (Ψ-Spec) |
| Parametros totales | No disponible para el adaptador; modelo base: 3.700 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, sin prefijo `base_model.model.`, layout compatible con `nano_vllm_uno`) |

## Arquitectura y entrenamiento

El adaptador mantiene dos rutas dentro de un mismo modelo. La ruta autorregresiva son los pesos originales de Jais-3-3.7B, sin modificar, y es la que determina la distribución final de las respuestas. La ruta de difusión son esos mismos pesos más el LoRA de rango 128, que propone un bloque de tokens futuros en un único forward pass. En cada paso, la ruta AR verifica el bloque completo con el sampler Ψ-Spec: se aceptan los tokens válidos y el primer token rechazado se sustituye por uno muestreado del modelo AR. El resultado es una generación que sigue exactamente la distribución del modelo base.

El adaptador se entrenó con la receta Uno sobre los pesos congelados de Jais-3-3.7B. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica principal es la aceleración lossless sin modelo draft externo, con un esquema de verificación en árbol (`tree_verify_size=32`, `tree_candidate_top_k=32`) que en GPUs Hopper aprovecha FlashAttention-3 y CUDA graphs.

## Capacidades

- Generación de texto en árabe e inglés, heredando las capacidades del modelo base Jais-3-3.7B.
- Razonamiento matemático: la model card reporta evaluaciones sobre MATH-500.
- Generación de código: evaluado sobre LiveCodeBench v6.
- Uso de herramientas en modo agéntico multi-turno: evaluado sobre ToolHop.
- Conversación en árabe: evaluado sobre Arabic AlpacaEval.
- Aceleración de decodificación lossless: misma distribución de salida que el modelo base en greedy y en sampling.
- Decodificación especulativa con verificación en árbol (Ψ-Spec) sin modelo draft separado.
- No se documentan en la información disponible capacidades de visión, audio, thinking mode explícito ni detalles adicionales de tool calling más allá de la evaluación citada.

## Casos de uso

- Despliegue de chat en árabe con baja latencia: el adaptador acelera un 1,45× la decodificación en Arabic AlpacaEval, por lo que un servicio de atención conversacional en árabe sobre Jais-3-3.7B puede reducir el tiempo hasta el último token sin cambiar las respuestas que produciría el modelo base.
- Asistentes de resolución de problemas matemáticos: con 2,07× de speedup en MATH-500, es adecuado para entornos interactivos donde el usuario espera la solución de un problema paso a paso y la latencia de generación es crítica.
- Generación de código en pipelines de desarrollo: el 1,61× en LiveCodeBench v6 permite integrar el modelo en asistentes de autocompletado o revisión de código donde cada segundo de latencia afecta a la experiencia del desarrollador.
- Agentes con uso de herramientas multi-turno: el 1,68× en ToolHop resulta útil en flujos agénticos donde se encadenan varias llamadas a herramientas y cada turno añade latencia acumulada.
- Aceleración de infraestructura existente sin reentrenamiento: al ser un adaptador sobre pesos congelados, un equipo que ya sirve Jais-3-3.7B puede añadir la ruta de difusión y obtener speedups sin tocar el modelo ni revalidar la calidad de las respuestas, ya que la distribución es idéntica.
- Evaluación y benchmarking a gran escala: procesar 256 prompts en tareas diversas con 1,67× de media reduce el tiempo de ejecución de suites de evaluación internas manteniendo resultados equivalentes a los del modelo autorregresivo.
- Servicios sensibles a la reproducibilidad: al ser lossless en greedy y en sampling, encaja en entornos donde se exige que la salida coincida con la del modelo de referencia y a la vez se necesita menor latencia.

## Benchmarks y rendimiento

Datos de velocidad publicados en la model card (decodificación greedy, batch size 1, H100 80GB, `nano_vllm_uno` con FlashAttention-3 y CUDA graphs, 64 prompts por tarea):

| Tarea | AR (tok/s) | Uno (tok/s) | Speedup |
|---|---:|---:|---:|
| Matemáticas (MATH-500) | 174 | 360 | 2,07× |
| Agéntico multi-turno con herramientas (ToolHop) | 166 | 279 | 1,68× |
| Código (LiveCodeBench v6) | 173 | 278 | 1,61× |
| Chat en árabe (Arabic AlpacaEval) | 174 | 252 | 1,45× |
| Media (256 prompts) | 173 | 288 | 1,67× |

Con muestreo (T=1, top-p 0,95, top-k 50) los speedups son entre un 10 % y un 15 % inferiores. No se publican resultados de benchmarks de calidad en esta ficha porque, al ser una aceleración lossless, la model card remite a los resultados del modelo base inception42/Jais-3-3.7B.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos base son de 3.700 millones de parámetros y el adaptador ocupa 1,1 GB en el repositorio. Como referencia, en BF16 los pesos base rondarían los 7,4 GB, a los que se suma el adaptador y las estructuras del sampler en árbol.
- GPU de referencia en las mediciones: una H100 80GB con FlashAttention-3 y CUDA graphs.
- En GPUs sin FlashAttention-3 se puede usar el sampler lineal (sin `--attention-backend fa3` ni las opciones `--tree-*`), aunque no se publican cifras de speedup para ese caso.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el motor `nano_vllm_uno` y las dependencias (torch 2.11.0 con CUDA 12.8) condicionan el despliegue.
- Opciones de despliegue: exclusivamente el motor `nano_vllm_uno` del repositorio ifm-ai/uno (CLI `inference.py` o API Python `LLM`). No es compatible con `PeftModel.from_pretrained` de PEFT estándar, ni se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 288 tok/s de media frente a 173 tok/s del modelo autorregresivo en el hardware de referencia, con batch size 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-3.7B-Uno | 3,7B (base) + LoRA r128 | No disponible | Aceleración lossless por difusión discreta | No disponible | Hugging Face (adaptador, requiere motor propio) |
| inception42/Jais-3-3.7B | 3,7B | No disponible | Transformer autorregresivo | No disponible | Hugging Face |
| IFM/K2-Horizon-7B-Uno | 7B (base) | No disponible | Misma receta Uno (adaptador) | No disponible | Hugging Face |

La comparación con alternativas de decodificación especulativa clásica (modelo draft separado más verificación) no está disponible en la información proporcionada. La diferencia principal frente a Jais-3-3.7B es exclusivamente de velocidad, no de calidad ni de capacidades.

## Limitaciones y advertencias

- El adaptador no es cargable con las herramientas estándar de PEFT: los tensores se guardan sin el prefijo `base_model.model.` y están pensados para `nano_vllm_uno`.
- Requiere descargar por separado los pesos base de inception42/Jais-3-3.7B; este repositorio solo contiene el adaptador.
- Las cifras de speedup se midieron con batch size 1 y decodificación greedy; con muestreo el beneficio cae entre un 10 % y un 15 %, y no se documenta el comportamiento con batches grandes.
- El mejor rendimiento depende de FlashAttention-3 y de GPU Hopper; en otras GPUs se degrada al sampler lineal, sin cifras publicadas.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; debe verificarse antes de producción.
- Solo se declaran árabe e inglés; no hay información sobre otros idiomas.
- No se documentan sesgos conocidos, tasas de alucinación ni límites de contexto en la información disponible.
- Al ser una aceleración lossless, hereda cualquier limitación, sesgo o riesgo de alucinación del modelo base Jais-3-3.7B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inception42/Jais-3-3.7B-Uno
- Modelo base: https://huggingface.co/inception42/Jais-3-3.7B
- Paper (Uno): https://huggingface.co/papers/2609.04010
- Paper adicional citado en los tags: arXiv:2611.10224
- Código y motor de inferencia: https://github.com/ifm-ai/uno
- Motor `nano_vllm_uno`: https://github.com/ifm-ai/uno/tree/main/nano_vllm_uno
- Página del proyecto: https://s-sahoo.github.io/uno/
- Adaptador de referencia con el mismo layout: https://huggingface.co/IFM/K2-Horizon-7B-Uno
