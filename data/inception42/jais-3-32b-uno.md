# inception42/Jais-3-32B-Uno

## Resumen

Jais-3-32B-Uno es un adaptador LoRA de difusión (rango 128) desarrollado por inception42 sobre el modelo base Jais-3-32B, un transformer de 32.000 millones de parametros orientado a generacion de texto en arabe e ingles. El adaptador no modifica los pesos originales: anade una segunda via de decodificacion (la "via de difusion") que propone bloques de tokens futuros en un unico forward pass, mientras que la via autorregresiva original verifica cada bloque con el muestreador Psi-Spec. El resultado es una aceleracion media de 2,15x en decodificacion sin alterar la distribucion de salida del modelo base, segun las mediciones del autor.

El modelo resuelve un problema clasico de la inferencia de LLM: el coste de la decodificacion autorregresiva token a token. A diferencia de la decodificacion especulativa tradicional, que requiere un modelo borrador separado, Uno reutiliza los propios pesos del modelo base congelados y solo entrena el adaptador de difusion, lo que simplifica el despliegue y, segun el autor, garantiza resultados sin perdida de calidad ("lossless"). Es relevante porque permite acelerar un modelo de 32B sin reentrenar ni degradar sus respuestas.

El adaptador se publica como repositorio PEFT (4,4 GB) y esta pensado para el motor de inferencia `nano_vllm_uno` del propio autor, no para `PeftModel.from_pretrained` estandar. El modelo base Jais-3-32B no esta incluido en este repositorio y debe descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de difusion (rango 128) sobre transformer autorregresivo Jais-3-32B; esquema hibrido AR + difusion con muestreador Psi-Spec |
| Parametros totales | No disponible para el adaptador (el modelo base Jais-3-32B tiene 32.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere los pesos del modelo base en formato original |
| Tamano del repositorio | 4,4 GB (solo adaptador) |
| Libreria | peft |
| Modelo base | inception42/Jais-3-32B |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador implementa la receta Uno, descrita en el paper "Unlocking Lossless Speedups in LLMs via Discrete Diffusion" (arXiv:2609.04010). La arquitectura mantiene dos vias dentro del mismo modelo: la via autorregresiva, que son los pesos de Jais-3-32B sin modificar, y la via de difusion, que son esos mismos pesos mas el adaptador LoRA de rango 128. En cada paso, la via de difusion propone un bloque de tokens (tamano de bloque 8 o 16 en las pruebas) y la via AR verifica el bloque completo en un unico forward pass mediante el muestreador Psi-Spec; los tokens aceptados se conservan y el primer token rechazado se sustituye por uno muestreado del modelo AR. Segun el autor, esto preserva exactamente la distribucion del modelo base tanto en decodificacion greedy como en muestreo.

El entrenamiento se realizo sobre los pesos congelados de Jais-3-32B, por lo que solo se optimizo el adaptador de difusion. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO para el adaptador (el modelo base podria tener su propio proceso, no documentado aqui). La innovacion tecnica principal es la verificacion en arbol (tree verification) con `tree_verify_size=32` y `tree_candidate_top_k=32`, que permite validar multiples candidatos por paso, junto con el uso de FlashAttention-3 y CUDA graphs en el motor `nano_vllm_uno` para maximizar el rendimiento en GPUs Hopper.

## Capacidades

- Generacion de texto en arabe e ingles, heredando las capacidades del modelo base Jais-3-32B.
- Razonamiento matematico: el autor reporta pruebas en MATH-500 con aceleracion de 2,91x.
- Generacion de codigo: evaluado en LiveCodeBench v6 con aceleracion de 2,07x.
- Uso de herramientas en modo agente multi-turno: evaluado en ToolHop con aceleracion de 2,13x.
- Conversacion en arabe: evaluado en Arabic AlpacaEval con aceleracion de 1,83x.
- Decodificacion sin perdida: la distribucion de salida es identica a la del modelo base, tanto en greedy como en sampling.
- Aceleracion de inferencia sin modelo borrador externo: el adaptador actua como via de difusion sobre los pesos congelados.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Atencion al cliente en arabe e ingles: el adaptador acelera la decodificacion de respuestas multi-turno (2,15x de media) manteniendo la calidad del modelo base, lo que reduce la latencia percibida en chats de soporte con contexto conversacional.
- Generacion de codigo en produccion: con una aceleracion de 2,07x en LiveCodeBench v6, puede integrarse en pipelines de CI/CD o asistentes de IDE donde la latencia de generacion es critica y el modelo base ya se usaba para autocompletado o sintesis de codigo.
- Razonamiento matematico interactivo: la aceleracion de 2,91x en MATH-500 lo hace adecuado para tutores o herramientas de resolucion paso a paso donde el usuario espera respuestas rapidas en problemas matematicos.
- Agentes con uso de herramientas multi-turno: la aceleracion de 2,13x en ToolHop permite desplegar agentes que encadenan llamadas a funciones y razonamiento multi-paso con menor coste por turno, usando el soporte de tool calling heredado del modelo base.
- Procesamiento por lotes de baja concurrencia: dado que Uno acelera la decodificacion limitada por latencia (batch size 1 en las pruebas), encaja en servicios con peticiones individuales o escasa concurrencia donde el tiempo por token es el cuello de botella.
- Despliegue en una sola GPU H100: el motor `nano_vllm_uno` con FlashAttention-3 y CUDA graphs permite servir el modelo de 32B con el adaptador en un unico H100 80GB, util para equipos con infraestructura limitada que necesitan throughput alto por peticion.
- Evaluacion e investigacion de decodificacion especulativa: sirve como referencia practica para estudiar tecnicas de difusion discreta y verificacion en arbol sobre modelos grandes, con codigo abierto en el repositorio `ifm-ai/uno`.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad (no de calidad, ya que la decodificacion es sin perdida y remite a los benchmarks del modelo base). Todas las cifras son con decodificacion greedy, batch size 1, en una H100 80GB con `nano_vllm_uno`, FlashAttention-3 y CUDA graphs, sobre 256 prompts (64 por tarea):

| Tarea | AR (tok/s) | Uno (tok/s) | Aceleracion |
|---|---:|---:|---:|
| Matemáticas (MATH-500) | 38 | 109 | 2,91x |
| Agente multi-turno con herramientas (ToolHop) | 36 | 77 | 2,13x |
| Código (LiveCodeBench v6) | 37 | 77 | 2,07x |
| Chat en árabe (Arabic AlpacaEval) | 38 | 69 | 1,83x |
| **Media (256 prompts)** | **37** | **81** | **2,15x** |

Con muestreo (T=1, top-p 0,95, top-k 50) las aceleraciones son un 10-15% inferiores. No se publican resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible; el autor indica que, al ser sin perdida, aplican los del modelo base Jais-3-32B.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es de 32B, por lo que en precision completa requiere del orden de 64 GB o mas, y el adaptador anade 4,4 GB. Las pruebas se realizaron en una H100 80GB.
- GPU recomendadas: H100 80GB (configuracion de referencia del autor, con FlashAttention-3). En GPUs sin FlashAttention-3 se puede usar el muestreador lineal (sin las opciones `--tree-*`), aunque no se detalla el rendimiento en ese caso.
- Cabe en GPU consumer: no confirmado en la informacion disponible; el autor no reporta pruebas en RTX 4090 u otras GPUs consumer.
- Opciones de despliegue: motor propietario `nano_vllm_uno` (repositorio `ifm-ai/uno`), con backend de atencion `fa3` o lineal. No es compatible con `PeftModel.from_pretrained` estandar de PEFT; no se mencionan vLLM, llama.cpp, Ollama ni TGI como soportados.
- Latencia y throughput: 81 tok/s de media frente a 37 tok/s del modelo AR en la configuracion de referencia (H100, batch 1, greedy). El tamano de bloque de difusion usado fue 16 para el modelo de 32B.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El adaptador es especifico del modelo base Jais-3-32B y de la receta Uno; el autor menciona como referencia de formato el adaptador K2-Horizon-7B-Uno, pero no ofrece comparativas de rendimiento con otras tecnicas de aceleracion (decodificacion especulativa clasica, Medusa, EAGLE) ni con otros modelos de 32B.

| Modelo | Parametros | Contexto | Aceleracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-32B-Uno | 32B (base) + adaptador | no disponible | 2,15x media | no disponible | Hugging Face (adaptador) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La aceleracion esta pensada para decodificacion limitada por latencia (batch size 1 en las pruebas); la ganancia se reduce con lotes grandes, segun advierte el propio autor.
- Con muestreo (temperatura > 0) las aceleraciones caen un 10-15% respecto a greedy.
- Los tensores del adaptador no incluyen el prefijo `base_model.model.` y no cargan con `PeftModel.from_pretrained`; es necesario usar `nano_vllm_uno`.
- Requiere descargar por separado el modelo base Jais-3-32B; el repositorio solo contiene el adaptador.
- El rendimiento optimo depende de FlashAttention-3 y GPUs Hopper; en otras GPUs se usa el muestreador lineal, sin cifras publicadas de rendimiento.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas limitados a arabe e ingles; no se documenta soporte para castellano ni otras lenguas.
- Riesgo de alucinacion y sesgos: no documentados para el adaptador; al ser sin perdida, hereda los del modelo base Jais-3-32B, no detallados aqui.
- Longitud de contexto no disponible en la informacion proporcionada.
- Proyecto con muy poca traccion (61 descargas, 1 like) y fechas de creacion/actualizacion en 2026; conviene verificar la madurez del codigo y del paper antes de usarlo en produccion.
- No se han publicado benchmarks de calidad propios; las cifras de rendimiento son exclusivamente de velocidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/inception42/Jais-3-32B-Uno
- Modelo base: https://huggingface.co/inception42/Jais-3-32B
- Paper (Uno): https://huggingface.co/papers/2609.04010
- Codigo y motor de inferencia: https://github.com/ifm-ai/uno
- Pagina del proyecto: https://s-sahoo.github.io/uno/
- Referencia de formato de adaptador: https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Paper adicional citado en los tags: arXiv:2611.10224 (sin enlace directo en la informacion disponible)
