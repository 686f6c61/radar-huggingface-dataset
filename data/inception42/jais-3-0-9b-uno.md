# inception42/Jais-3-0.9B-Uno

## Resumen

Jais-3-0.9B-Uno es un adaptador LoRA de difusión diseñado para acelerar la generación de texto del modelo base inception42/Jais-3-0.9B sin alterar su distribución de salida. Lo desarrolla el usuario inception42 siguiendo la receta Uno, descrita en el artículo "Unlocking Lossless Speedups in LLMs via Discrete Diffusion". No es un modelo autónomo: es un complemento que se carga junto a los pesos congelados del modelo base para habilitar un mecanismo de decodificación especulativa interna.

La propuesta técnica es relevante porque consigue una aceleración media de 1,51× en decodificación greedy manteniendo exactamente la misma distribución que el modelo autorregresivo original, es decir, sin degradación de calidad. Esto lo distingue de otras técnicas de decodificación especulativa que requieren un modelo borrador separado o que aceptan ligeras pérdidas de fidelidad. El adaptador tiene rango 128 y ocupa 0,9 GB en el repositorio, sobre un modelo base de 0,9B parámetros con soporte para árabe e inglés.

El modelo se orienta a entornos de inferencia de baja latencia donde el coste por token es crítico, especialmente en cargas de trabajo de un solo lote (batch size 1). Su integración requiere el motor de inferencia específico nano_vllm_uno, no siendo compatible con la carga estándar de PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 128) sobre transformer autorregresivo; ruta de difusión discreta para decodificación especulativa |
| Parametros totales | No disponible (adaptador; el modelo base es de 0,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA; sin prefijo `base_model.model.`) |

## Arquitectura y entrenamiento

Uno mantiene dos rutas dentro de un mismo modelo. La ruta autorregresiva (AR) son los pesos originales de Jais-3-0.9B, sin modificar, y es la que determina la distribución final de las respuestas. La ruta de difusión son esos mismos pesos más el adaptador LoRA de rango 128, que propone bloques de tokens futuros en un único forward pass. En cada paso, la ruta de difusión genera un bloque candidato y la ruta AR lo verifica completo mediante el muestreador Ψ-Spec; los tokens aceptados se conservan y el primer token rechazado se sustituye por uno muestreado del modelo AR. El resultado es una salida que sigue exactamente la distribución del modelo base, tanto en decodificación greedy como en muestreo.

El adaptador se entrena sobre los pesos congelados del modelo base con la receta Uno, y no requiere un modelo borrador independiente. La verificación en árbol utiliza `tree_verify_size=32` y `tree_candidate_top_k=32`, con tamaños de bloque de difusión de 8 para el modelo de 0,9B (16 para las variantes de 7B y 32B). Los detalles completos del entrenamiento, la composición del dataset y el uso de RLHF/DPO no se detallan en la información disponible.

## Capacidades

- Generación de texto en árabe e inglés con la misma calidad y distribución que el modelo base Jais-3-0.9B.
- Aceleración de decodificación sin pérdida de fidelidad: 1,51× de media en greedy decoding.
- Razonamiento matemático (evaluado en MATH-500 con 1,62× de aceleración).
- Uso de herramientas en modo agéntico multi-turno (evaluado en ToolHop con 1,58× de aceleración).
- Generación de código (evaluado en LiveCodeBench v6 con 1,51× de aceleración).
- Conversación en árabe (evaluado en Arabic AlpacaEval con 1,24× de aceleración).
- Compatibilidad con decodificación por muestreo (T=1, top-p 0.95, top-k 50), con aceleraciones entre un 10 y un 15 % inferiores a las de greedy.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Atención al cliente en árabe e inglés: el adaptador acelera las respuestas conversacionales multi-turno manteniendo la distribución del modelo base, lo que permite servir más usuarios por GPU sin cambiar el comportamiento del modelo.
- Generación de código en pipelines de integración continua: con 1,51× de aceleración en LiveCodeBench v6, reduce el tiempo de generación de parches y sugerencias en herramientas de revisión automática.
- Razonamiento matemático interactivo: la aceleración de 1,62× en MATH-500 resulta útil en asistentes educativos o de resolución de problemas donde la latencia por respuesta afecta a la experiencia.
- Agentes con uso de herramientas multi-turno: la aceleración de 1,58× en ToolHop permite cadenas de llamadas a funciones más rápidas en entornos de automatización de tareas.
- Despliegue en un solo lote con latencia crítica: el diseño está optimizado para batch size 1, adecuado para asistentes personales, copilotos o servicios con peticiones secuenciales.
- Servicios bilingües árabe-inglés en producción: al conservar la distribución del modelo base, se puede sustituir la decodificación autorregresiva por Uno sin revalidar la calidad de las respuestas.
- Investigación en decodificación especulativa: sirve como referencia práctica para estudiar aceleración sin pérdida con difusión discreta y muestreador Ψ-Spec.

## Benchmarks y rendimiento

Resultados de velocidad medidos con decodificación greedy en una GPU H100 80GB con el motor nano_vllm_uno, FlashAttention-3 y CUDA graphs, con batch size 1 y 256 prompts (64 por tarea):

| Tarea | AR (tok/s) | Uno (tok/s) | Aceleración |
|---|---:|---:|---:|
| Matemáticas (MATH-500) | 368 | 595 | 1,62× |
| Agéntico, uso de herramientas multi-turno (ToolHop) | 359 | 567 | 1,58× |
| Código (LiveCodeBench v6) | 366 | 553 | 1,51× |
| Chat en árabe (Arabic AlpacaEval) | 371 | 458 | 1,24× |
| Media (256 prompts) | 366 | 552 | 1,51× |

No se han publicado resultados de benchmarks de calidad en la información disponible; al ser un método sin pérdida, el autor remite a los resultados del modelo base inception42/Jais-3-0.9B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador ocupa 0,9 GB y se suma a los pesos del modelo base de 0,9B.
- GPU recomendadas: H100 80GB para las cifras de velocidad publicadas; el muestreador en árbol requiere FlashAttention-3, disponible en GPUs Hopper.
- En GPUs sin FlashAttention-3 se puede usar el muestreador lineal (sin `--tree-*`), aunque no se publican cifras de aceleración para ese modo.
- Opciones de despliegue: motor nano_vllm_uno del repositorio ifm-ai/uno; no es compatible con `PeftModel.from_pretrained` estándar ni se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 552 tok/s de media con Uno frente a 366 tok/s en autorregresivo sobre H100, en batch size 1 y greedy decoding.
- El rendimiento está optimizado para cargas de latencia con batch size 1; el comportamiento con lotes mayores no se detalla en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El adaptador se puede contrastar con su modelo base y con otras variantes Uno del mismo autor, pero no se han publicado especificaciones de alternativas en la documentación disponible.

| Modelo | Parámetros | Contexto | Aceleración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-0.9B (base, AR) | 0,9B | No disponible | 1× (referencia) | No disponible | Hugging Face |
| Jais-3-0.9B-Uno | Adaptador sobre 0,9B | No disponible | 1,51× media | No disponible | Hugging Face |
| K2-Horizon-7B-Uno | Adaptador sobre 7B | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere los pesos de inception42/Jais-3-0.9B y no funciona sin ellos.
- Los tensores se almacenan sin el prefijo `base_model.model.` y están pensados para nano_vllm_uno; `PeftModel.from_pretrained` no los carga.
- La aceleración está medida y optimizada para batch size 1; el rendimiento en lotes mayores no está documentado.
- Con muestreo (T=1, top-p 0.95, top-k 50) las aceleraciones son entre un 10 y un 15 % inferiores a las de greedy decoding.
- El muestreador en árbol recomendado requiere FlashAttention-3 y GPUs Hopper; en otras GPUs se degrada al muestreador lineal.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial.
- Solo se documentan los idiomas árabe e inglés; no se especifica cobertura de otros idiomas.
- Al conservar la distribución del modelo base, hereda sus sesgos y riesgos de alucinación; no se han publicado evaluaciones de sesgo específicas para este adaptador.
- La longitud de contexto del modelo base no se detalla en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inception42/Jais-3-0.9B-Uno
- Modelo base: https://huggingface.co/inception42/Jais-3-0.9B
- Artículo (Uno): https://huggingface.co/papers/2609.04010
- Artículo adicional citado en los tags: https://huggingface.co/papers/2611.10224
- Código y motor de inferencia: https://github.com/ifm-ai/uno
- Motor nano_vllm_uno: https://github.com/ifm-ai/uno/tree/main/nano_vllm_uno
- Página del proyecto: https://s-sahoo.github.io/uno/
- Variante relacionada: https://huggingface.co/IFM/K2-Horizon-7B-Uno
