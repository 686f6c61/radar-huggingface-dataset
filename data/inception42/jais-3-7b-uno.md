# inception42/Jais-3-7B-Uno

## Resumen

Jais-3-7B-Uno es un adaptador LoRA de difusión (rango 128) desarrollado por inception42 que se aplica sobre los pesos congelados de inception42/Jais-3-7B para acelerar la decodificación de texto sin alterar la distribución de salida. No es un modelo nuevo con capacidades distintas, sino un mecanismo de aceleración sin pérdida de calidad ("lossless") basado en la receta Uno, publicada en el artículo "Unlocking Lossless Speedups in LLMs via Discrete Diffusion" (arXiv:2609.04010).

El adaptador mantiene dos rutas dentro del mismo modelo: una ruta autorregresiva (AR) con los pesos originales intactos, que produce las respuestas finales, y una ruta de difusión (pesos más el LoRA) que propone bloques de tokens futuros en un solo forward pass. Un muestreador denominado Ψ-Spec verifica cada bloque contra la ruta AR y acepta los tokens correctos, sustituyendo el primer token rechazado por uno muestreado del modelo base. El resultado es una velocidad media 1,92× superior con idéntica distribución de salida, tanto en decodificación greedy como en sampling.

Es relevante para equipos que ya despliegan Jais-3-7B (modelo bilingüe árabe-inglés) y necesitan reducir la latencia de decodificación en entornos con límite de cómputo, especialmente cargas con batch size 1. El repositorio contiene únicamente el adaptador (1,4 GB) y requiere los pesos base para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (base Jais-3-7B) + adaptador LoRA de difusión discreta condicional |
| Parametros totales | 7B (modelo base); adaptador LoRA con rango 128 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no especificado en la información proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere pesos base en formato del modelo original |
| Rango LoRA | 128 |
| Librería | peft |
| Tamaño del repositorio | 1,4 GB |
| Motor de inferencia | nano_vllm_uno (github.com/ifm-ai/uno) |

## Arquitectura y entrenamiento

El modelo base Jais-3-7B es un transformer autorregresivo de 7B parámetros orientado a árabe e inglés. Sobre él, Uno añade un adaptador LoRA de rango 128 entrenado con la receta descrita en el artículo arXiv:2609.04010, que convierte el modelo en un sistema híbrido de dos rutas: la ruta AR original (pesos congelados, sin modificar) y la ruta de difusión (pesos más adaptador), que actúa como "borrador" generando varios tokens en un único forward pass.

La verificación se realiza mediante el muestreador Ψ-Spec: la ruta de difusión propone un bloque de tokens y la ruta AR evalúa el bloque completo en un solo paso, aceptando el prefijo correcto y reemplazando el primer token rechazado por uno muestreado del modelo AR. Este esquema garantiza equivalencia distribucional exacta con el modelo base, sin necesidad de un modelo draft separado. No se especifican en la información disponible el número de tokens de entrenamiento del adaptador, la composición del dataset ni si se emplearon técnicas de RLHF/DPO (el adaptador se entrena con el objetivo de difusión de Uno, no con preferencias humanas). Existe un segundo artículo asociado (arXiv:2611.10224) del que no se detalla contenido.

## Capacidades

- Generación de texto bilingüe árabe-inglés con la misma calidad que Jais-3-7B, ya que la aceleración es lossless.
- Decodificación acelerada 1,92× de media en greedy decoding (hasta 2,63× en tareas matemáticas).
- Compatibilidad con sampling (temperatura, top-p, top-k); en ese modo la ganancia se reduce un 10-15 %.
- Soporte de tool calling y uso agéntico multi-turno (evaluado en ToolHop con 1,97× de speedup).
- Razonamiento matemático (evaluado en MATH-500) y generación de código (evaluado en LiveCodeBench v6).
- Conversación en árabe (evaluado en Arabic AlpacaEval).
- No añade capacidades nuevas respecto al modelo base: visión, audio y otras modalidades no están disponibles salvo que las tenga Jais-3-7B (no confirmado en la información proporcionada).
- No se menciona modo "thinking" explícito ni decodificación especulativa con modelo draft externo (Uno sustituye ese esquema).

## Casos de uso

- Servicio de chat bilingüe árabe-inglés de baja latencia: desplegar Jais-3-7B-Uno con nano_vllm_uno permite responder con la misma distribución que el modelo base pero a ~239 tok/s en H100 frente a 124 tok/s en AR, reduciendo el tiempo hasta el primer token completo en conversaciones interactivas.
- Asistente de código en IDE o CI/CD: con 1,85× de speedup en LiveCodeBench v6 y soporte de tool calling, se puede integrar en pipelines de generación y revisión de código donde la latencia de decodificación es el cuello de botella.
- Agentes multi-turno con herramientas: la mejora de 1,97× en ToolHop lo hace adecuado para orquestaciones agénticas donde se encadenan varias llamadas al modelo y cada paso añade latencia acumulada.
- Tutor o resolutor matemático: el 2,63× en MATH-500 lo convierte en candidato para aplicaciones educativas que generan razonamientos largos token a token.
- Atención al cliente automatizada en árabe: Arabic AlpacaEval con 1,60× de mejora permite gestionar conversaciones multi-turno con menor coste por respuesta, siempre que el contexto del modelo base sea suficiente (no especificado).
- Investigación en aceleración de inferencia: sirve como referencia reproducible para estudiar decodificación especulativa sin modelo draft y muestreadores de verificación por árbol (tree_verify_size=32, tree_candidate_top_k=32).
- Despliegue con restricciones de GPU: útil en escenarios latency-bound con batch size 1 donde no se puede escalar horizontalmente y se necesita exprimir una única GPU Hopper.

## Benchmarks y rendimiento

Datos de velocidad publicados por el autor (greedy decoding, batch size 1, H100 80GB, FlashAttention-3, CUDA graphs, 256 prompts, 64 por tarea):

| Tarea | AR (tok/s) | Uno (tok/s) | Speedup |
|---|---:|---:|---:|
| Math (MATH-500) | 125 | 328 | 2,63× |
| Agentic multi-turn tool use (ToolHop) | 120 | 236 | 1,97× |
| Code (LiveCodeBench v6) | 124 | 230 | 1,85× |
| Arabic chat (Arabic AlpacaEval) | 125 | 200 | 1,60× |
| Media (256 prompts) | 124 | 239 | 1,92× |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; el autor remite a la model card de Jais-3-7B porque la aceleración es lossless y los resultados del base aplican sin cambios.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 7B parámetros y el adaptador ocupa 1,4 GB. En precisión completa se necesitan del orden de 14-16 GB solo para pesos, más overhead de KV cache y activaciones; las cifras exactas no se especifican.
- GPU recomendadas: H100 80GB es el hardware de referencia de los benchmarks (con FlashAttention-3 y CUDA graphs).
- GPUs consumer: no confirmado. La decodificación con árbol (tree sampler) requiere FlashAttention-3, disponible en arquitecturas Hopper; en GPUs sin FA3 se puede usar el muestreador lineal, pero no se publican cifras de rendimiento para ese caso.
- Opciones de despliegue: nano_vllm_uno (motor oficial del proyecto, incluye CLI y API Python). No se menciona soporte para vLLM estándar, llama.cpp, Ollama ni TGI. El adaptador no carga con `PeftModel.from_pretrained` estándar por el layout de tensores sin prefijo `base_model.model.`.
- Throughput: 239 tok/s de media en H100 con batch size 1 (frente a 124 tok/s en AR). La ganancia disminuye a medida que el batch crece, según la sección de limitaciones del autor (texto truncado en la información disponible).
- Latencia: no se publican cifras de TTFT ni de latencia por token individuales.

## Comparativa con modelos similares

No se dispone de datos de otros adaptadores Uno para Jais-3-7B ni de benchmarks comparativos frente a alternativas como decodificación especulativa clásica (con modelo draft), Medusa o EAGLE en la información proporcionada. El autor menciona K2-Horizon-7B-Uno (IFM/K2-Horizon-7B-Uno) como referencia de formato de tensores, pero no como comparativa de rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Aceleración | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-7B-Uno | 7B + LoRA r128 | no disponible | no disponible | 1,92× media (lossless) | Hugging Face (adaptador) |
| Jais-3-7B (base) | 7B | no disponible | no disponible | 1× (referencia) | Hugging Face |
| K2-Horizon-7B-Uno | 7B + LoRA | no disponible | no disponible | no disponible | Hugging Face (IFM) |

## Limitaciones y advertencias

- El adaptador solo acelera decodificación latency-bound; la ganancia se reduce al aumentar el batch size (limitación explícita del autor, texto truncado en la información disponible).
- Con sampling (T=1, top-p 0.95, top-k 50) el speedup cae un 10-15 % respecto a greedy.
- El tree sampler recomendado requiere FlashAttention-3 (Hopper); en otras GPUs hay que usar el muestreador lineal, sin cifras de rendimiento publicadas.
- No carga con `PeftModel.from_pretrained` estándar: los tensores carecen del prefijo `base_model.model.` y están pensados para nano_vllm_uno.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo base Jais-3-7B.
- Idiomas limitados a árabe e inglés según los tags; no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinación y sesgos: idénticos a los del modelo base, ya que la distribución de salida es exacta; no hay evaluación propia en esta ficha.
- Longitud de contexto no documentada en la información proporcionada.
- El adaptador depende de una versión concreta del motor (nano_vllm_uno) y de torch 2.11.0 con CUDA 12.8 según las instrucciones del autor; cambios de versión pueden romper la compatibilidad.
- El repositorio tiene solo 54 descargas y 2 likes en el momento de la consulta: ecosistema pequeño y poca validación comunitaria.

## Enlaces

- Hugging Face (adaptador): https://huggingface.co/inception42/Jais-3-7B-Uno
- Modelo base: https://huggingface.co/inception42/Jais-3-7B
- Paper Uno: https://huggingface.co/papers/2609.04010
- Paper secundario: arXiv:2611.10224 (sin URL directa en la información)
- Código / motor de inferencia: https://github.com/ifm-ai/uno
- Subdirectorio del motor: https://github.com/ifm-ai/uno/tree/main/nano_vllm_uno
- Página del proyecto: https://s-sahoo.github.io/uno/
- Adaptador de referencia de formato: https://huggingface.co/IFM/K2-Horizon-7B-Uno
