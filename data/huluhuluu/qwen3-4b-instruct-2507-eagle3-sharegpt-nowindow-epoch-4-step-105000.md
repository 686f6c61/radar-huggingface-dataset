# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-105000

## Resumen

Este repositorio contiene un checkpoint intermedio del modelo de draft EAGLE3 entrenado en línea con SpecForge para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Se trata de un modelo auxiliar de decodificación especulativa, no de un modelo de chat independiente: su única función es proponer tokens candidatos para acelerar la inferencia del modelo grande. El checkpoint corresponde a la época 4, paso 105000, de un entrenamiento de 10 épocas y 231810 pasos totales.

El modelo usa la arquitectura `LlamaForCausalLMEagle3` con una sola capa decoder, 202,7 millones de parámetros y pesos en bfloat16. Está diseñado para integrarse como ruta de draft en SGLang mediante el algoritmo EAGLE3, lo que permite reducir la latencia de generación del modelo objetivo sin modificar sus pesos ni su calidad de salida. Su relevancia radica en que ofrece un checkpoint intermedio de un entrenamiento especulativo, útil para probar el rendimiento de la aceleración en distintas fases del entrenamiento.

Al ser un draft model, no tiene capacidades de razonamiento, generación ni tool calling propias. Debe emparejarse siempre con el modelo objetivo exacto `Qwen/Qwen3-4B-Instruct-2507` y desplegarse junto a él en un servidor de inferencia compatible con EAGLE3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (maxima de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (hereda del modelo base Qwen3, sin especificar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una arquitectura diseñada para decodificación especulativa. Consiste en una única capa transformer que predice múltiples tokens futuros en paralelo, condicionada por las características de atención del modelo objetivo. La configuración concreta incluye hidden size de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor, con un vocabulario de draft de 32000 tokens y un vocabulario objetivo de 151936 tokens. Los pesos están en bfloat16.

El entrenamiento se realizó con el método "online EAGLE3" implementado en SpecForge, usando datos ShareGPT limpios en formato JSONL. Se ejecutaron 10 épocas con 231810 pasos de optimización, tamaño de lote efectivo de 4, tasa de aprendizaje de 1e-4 con warmup lineal del 1,5% y annealing coseno, y sin weight decay. La longitud máxima de secuencia fue de 2048 tokens, con una longitud de entrenamiento TTT de 7 tokens para el mecanismo EAGLE3. La atención del draft usa `sdpa` y el backend objetivo es SGLang con FlashInfer. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleracion de inferencia especulativa: propone hasta 4 tokens candidatos por paso para el modelo `Qwen/Qwen3-4B-Instruct-2507`, reduciendo la latencia de generacion.
- Integracion con SGLang: funciona como ruta de draft en el servidor SGLang con el algoritmo EAGLE3, parametros `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.
- No es un modelo de chat: no genera texto autonomo, no soporta tool calling, agentes ni razonamiento multi-paso.
- Sin modo thinking: el modelo objetivo `Qwen3-4B-Instruct-2507` no incluye modo de pensamiento, por lo que el draft tampoco lo contempla.
- Multilingue limitado: al ser un draft, su cobertura linguistica depende del modelo objetivo, pero no se han publicado datos especificos para este checkpoint.

## Casos de uso

- Despliegue de servidores de inferencia de baja latencia: integrar este draft model en SGLang junto a `Qwen3-4B-Instruct-2507` para reducir el tiempo de primera respuesta y el throughput en entornos de produccion con alta concurrencia.
- Evaluacion de checkpoints intermedios: probar este checkpoint (epoca 4, paso 105000) frente a otros de la misma coleccion (epoca 7, paso 185000, etc.) para determinar en que fase del entrenamiento el draft model ofrece mejor tasa de aceptacion de tokens.
- Optimizacion de costes de GPU: al reducir la latencia por peticion, se puede mantener el mismo nivel de servicio con menos instancias GPU o con GPUs mas modestas.
- Experimentacion con parametros de arbol especulativo: usar este checkpoint para ajustar los valores de `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` en funcion de la carga de trabajo y el hardware disponible.
- Investigacion en decodificacion especulativa: estudiar el comportamiento de EAGLE3 en un modelo de 4B parametros y comparar la calidad de los drafts entre distintos pasos de entrenamiento.
- Integracion en pipelines de IA generativa existentes: sustituir el draft model por defecto en un despliegue SGLang de Qwen3-4B-Instruct-2507 sin reentrenar el modelo principal, manteniendo la compatibilidad con la API de SGLang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "No evaluation or safety metrics were recorded for this run". No se proporcionan datos de tasa de aceptacion, latencia, throughput ni comparaciones con otros draft models.

## Requisitos de hardware

- VRAM estimada para inferencia: el draft model ocupa aproximadamente 0,4 GB en bfloat16 (202,7M parametros). Sin embargo, al desplegarse junto al modelo objetivo `Qwen3-4B-Instruct-2507`, la VRAM total necesaria es la suma de ambos: unos 8-10 GB en bf16 para el modelo objetivo mas el draft, dependiendo de la longitud de contexto y el tamano del lote.
- GPU recomendadas: cualquier GPU consumer con al menos 12 GB de VRAM (RTX 3060, RTX 4070, RTX 4090) puede ejecutar la combinacion objetivo + draft. Para despliegues de alto throughput se recomiendan GPUs de datacenter como A100 o H100.
- Compatibilidad con consumer GPU: si, el draft model en si cabe en cualquier GPU moderna, pero el modelo objetivo de 4B requiere una GPU con suficiente VRAM. Con cuantizacion del modelo objetivo (por ejemplo, AWQ o GPTQ) se puede reducir a unos 4-5 GB adicionales.
- Opciones de despliegue: SGLang es el backend objetivo y el unico con soporte verificado para EAGLE3 segun la model card. No se menciona compatibilidad con vLLM, llama.cpp u Ollama para este draft model especifico.
- Latencia y throughput estimados: no disponibles. Se recomienda realizar un benchmark propio con la carga de trabajo real, ajustando los parametros de arbol especulativo.

## Comparativa con modelos similares

No se dispone de datos publicados para comparar este checkpoint con otros draft models de la misma categoria. Se puede comparar con otros checkpoints de la misma coleccion (por ejemplo, el de epoca 7 paso 185000), pero no hay metricas objetivas. Alternativas genericas de decodificacion especulativa incluyen Medusa y EAGLE-2, pero no se han publicado comparativas con este modelo.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-105000 | 202,7M | 2048 | Apache-2.0 | Draft model EAGLE3, requiere SGLang |
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000 | no disponible | no disponible | Apache-2.0 | Otro checkpoint de la misma coleccion |
| Medusa (generico) | variable | variable | variable | Arquitectura especulativa alternativa, sin datos de comparacion |

## Limitaciones y advertencias

- No es un modelo de chat: usarlo como modelo independiente produce resultados sin sentido; debe emparejarse siempre con `Qwen/Qwen3-4B-Instruct-2507`.
- Sin metricas de evaluacion ni seguridad: la model card no registra ningun benchmark ni evaluacion de sesgos o alucinaciones para este entrenamiento.
- Ventana de contexto limitada: el entrenamiento se realizo con secuencias de 2048 tokens; no se garantiza un comportamiento correcto con contextos mas largos.
- Datos de entrenamiento ShareGPT: el dataset procede de conversaciones reales de usuarios, lo que puede introducir sesgos sociales, linguisticos y de contenido no filtrados.
- Checkpoint intermedio: este es el paso 105000 de 231810; no es el checkpoint final y puede tener un rendimiento suboptimo comparado con el ultimo paso.
- Dependencia de SGLang: el modelo solo funciona con el backend SGLang y el algoritmo EAGLE3; no hay soporte documentado para otros frameworks.
- Sin cuantizaciones: los pesos estan en bfloat16 y no se ofrecen versiones cuantizadas (GGUF, AWQ, etc.) para este draft model.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache-2.0 segun el repositorio de Qwen), que debe verificarse para el despliegue final.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-105000
- Checkpoint de epoca 7 paso 185000: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Guia de despliegue local con Ollama (referencia del modelo base): https://mattselander.com/deploy-qwen3-4b-instruct-2507-locally-via-ollama-2/
- Implementacion de Qualcomm AI Hub del modelo base: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
