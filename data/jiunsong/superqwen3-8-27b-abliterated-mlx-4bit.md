# Jiunsong/SuperQwen3.8-27b-abliterated-MLX-4bit

## Resumen

SuperQwen3.8-27b-abliterated-MLX-4bit es la version cuantizada en 4-bit para Apple Silicon del modelo SuperQwen3.8-27b-abliterated, una "supertune" comunitaria del Qwen3.8-27B de Alibaba que combina abliteration (eliminacion de rechazos de seguridad) con una correccion de pesos mediante agentes swarm. El resultado es un modelo multimodal de 27B sin censura, con razonamiento acotado y ventana de contexto de 1M de tokens, empaquetado en un artefacto MLX de unos 15 GiB que cabe en un Mac sin GPU de servidor.

La relevancia de esta publicacion reside en tres frentes: permite ejecutar un modelo de 27B multimodal localmente en hardware de consumo de Apple, resuelve el problema clasico de "overthinking" de los modelos de razonamiento con guardas de parada, y hornea el delta de abliteration directamente en los shards MLX, de modo que no hay que aplicar ningun parche en tiempo de ejecucion. El autor reporta una velocidad de decodificacion de 29,96 tok/s de mediana en un Apple M5 Max con MLX-LM 0.31.3.

El repositorio forma parte de una familia de cuatro lanzamientos nativos (BF16, NVFP4, GGUF y MLX 4-bit) del mismo modelo base, lo que facilita comparar despliegues en distintas plataformas. La licencia Apache 2.0 permite uso comercial sin restricciones de atribucion adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B) con abliteration aplicada |
| Parametros totales | 4.665.462.000 (segun safetensors; el modelo se comercializa como 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64 |
| Idiomas soportados | Ingles, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), 3 shards (~14,96 GiB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B de Alibaba, un LLM denso multimodal nativo (image-text-to-text) optimizado para codigo, flujos agente y automatizacion de oficina. Sobre el se aplico un proceso de abliteration que elimina los rechazos de seguridad del modelo original, seguido de una "supertune" que repara los pesos degradados por la abliteration mediante un enjambre de agentes; el autor indica que este proceso de correccion y evaluacion tardo aproximadamente una semana.

La conversion a MLX se realizo sobre la revision fijada `mlx-community/Qwen3.8-27B-4bit@3e6447f`: los tensores modificados se dequantizaron, se aplico el delta de abliteration y cada matriz afectada se re-cuantizo a pesos MLX nativos con escalas y biases. El manifiesto `mlx_requantization_manifest.json` registra la revision base, las claves modificadas y los hashes de los shards. Se transfirieron 100 tensores fuente a 300 entradas nativas de weight/scales/biases, y se retuvieron 333 tensores de vision. El template de chat cambia el esfuerzo de razonamiento por defecto a `medium` acotado, y el modo `xhigh` incluye una guarda de parada para evitar que el modelo repita o reinicie su deliberacion.

## Capacidades

- Generacion de texto y conversacion multironda con contexto largo de hasta 1M de tokens.
- Multimodal: entrada de imagen y texto (pipeline image-text-to-text), con 333 tensores de vision retenidos en el artefacto.
- Razonamiento con modo de pensamiento explicito: `enable_thinking` y `reasoning_effort` configurable entre `low`, `medium` y `xhigh`, con guardas anti-overthinking.
- Tool calling / function calling, validado como PASS en la bateria de pruebas del autor.
- Sin censura: la abliteration elimina los rechazos de seguridad, con 0/8 rechazos en prompts benignos sensibles.
- Multilingue limitado a ingles y coreano segun la model card.

## Casos de uso

- Asistente local de codigo en un Mac: con 29,96 tok/s de decodificacion y 15,94 GB de memoria pico, un desarrollador puede ejecutar el modelo en un portatil Apple Silicon para generacion y revision de codigo sin depender de una API externa ni de una GPU de servidor.
- Analisis de documentos con imagen y texto: al ser multimodal, permite extraer informacion de capturas, diagramas y documentos escaneados combinando la entrada visual con instrucciones de texto, todo en local.
- Agente de automatizacion de oficina: el soporte de tool calling y el contexto de 1M de tokens permiten encadenar llamadas a herramientas (calendario, correo, hojas de calculo) en sesiones largas sin perder el hilo de la conversacion.
- Razonamiento acotado en produccion: la guarda anti-overthinking y el esfuerzo configurable permiten desplegar el modelo con latencia predecible, evitando que las respuestas se alarguen con deliberacion redundante.
- Prototipado de aplicaciones sin censura: la abliteration lo hace util para explorar casos de uso creativos o de ficcion donde el modelo base rechazaria contenido benigno, aunque con los riesgos de seguridad asociados.
- Inferencia en hardware de consumo: con 15 GiB de pesos, cabe en Macs con 24 GB o mas de memoria unificada, lo que lo convierte en una opcion para despliegues edge o demos portatiles sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta mediciones de rendimiento de inferencia y pruebas de comportamiento propias, medidas en un Apple M5 Max con MLX-LM 0.31.3, una sola secuencia, prompt de 256 tokens, 512 tokens de generacion fijos, decodificacion greedy, un warmup y tres pruebas cronometradas:

| Prueba | Decodificacion C1 | Procesamiento de prompt | Memoria pico |
|---|---:|---:|---:|
| 1 | 30,389 tok/s | 682,571 tok/s | 15,942 GB |
| 2 | 29,960 tok/s | 661,518 tok/s | 15,942 GB |
| 3 | 29,665 tok/s | 537,247 tok/s | 15,943 GB |
| Mediana / media | 29,960 tok/s mediana | 627,112 tok/s media | 15,943 GB |

Pruebas de comportamiento: compuerta de razonamiento determinista 36/36 PASS en los cuatro niveles de esfuerzo (default, low, medium, xhigh); capacidad 7/8 en el umbral de padres emparejados; tool calling PASS; rechazos en prompts benignos sensibles 0/8.

## Requisitos de hardware

- VRAM estimada: 15,94 GB de memoria pico en la prueba de referencia, por lo que se necesita un Mac con al menos 24 GB de memoria unificada para margen comodo.
- GPU recomendada: Apple Silicon; el autor valido el modelo en un M5 Max. No requiere GPU de servidor.
- Compatibilidad con hardware de consumo: si, en Macs con suficiente memoria unificada; no esta pensado para GPUs NVIDIA en esta variante MLX.
- Opciones de despliegue: MLX-LM 0.31.3 (comando `mlx_lm generate`); existen variantes hermanas para vLLM (NVFP4), llama.cpp (GGUF) y Transformers/vLLM (BF16).
- Latencia y throughput: 29,96 tok/s de mediana en decodificacion de una sola secuencia y 627 tok/s de media en procesamiento de prompt en M5 Max.

## Comparativa con modelos similares

| Modelo | Precision | Tamano | Contexto | Runtime | Memoria |
|---|---|---|---|---|---|
| SuperQwen3.8-27b-abliterated (BF16) | BF16 | ~52 GB | 1M | Transformers / vLLM | Requiere GPU de servidor |
| SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark | NVFP4 W4A4 G16 | ~19,2 GiB | 1M | vLLM | DGX Spark |
| SuperQwen3.8-27b-abliterated-GGUF | GGUF | ~17,6 GiB | 1M | llama.cpp | Una caja, con MTP nativo |
| SuperQwen3.8-27b-abliterated-MLX-4bit (este) | MLX affine 4-bit | ~15,0 GiB | 1M | MLX-LM | Apple Silicon |

Las cuatro variantes comparten el mismo modelo base y la misma licencia Apache 2.0; la diferencia esta en el runtime objetivo y el tamano en disco. Frente a otras abliterations comunitarias del mismo Qwen3.8-27B (como AEON Uncensored o OrcaRouter), esta version se distingue por la correccion de pesos con agentes swarm y por la guarda anti-overthinking, ademas de por ofrecer un artefacto MLX nativo sin deltas en tiempo de ejecucion.

## Limitaciones y advertencias

- Modelo sin censura: la abliteration elimina los rechazos de seguridad, lo que implica riesgo de generar contenido inapropiado, ofensivo o peligroso. No es adecuado para despliegues publicos sin capas de moderacion externas.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, citas o codigo; la ausencia de rechazos no implica mayor fiabilidad factual.
- Soporte de vision no validado en esta variante: la model card indica que la compuerta de ejecucion medida es de texto y herramientas, no de inferencia de vision MLX; el autor anuncia una revalidacion pendiente del runtime multimodal.
- Idiomas limitados: la model card solo lista ingles y coreano; el rendimiento en otros idiomas no esta garantizado.
- Discrepancia en el conteo de parametros: los safetensors registran 4.665.462.000 parametros mientras que el modelo se comercializa como 27B; conviene verificar antes de dimensionar infraestructura.
- Requisito de hardware especifico: la variante MLX solo funciona en Apple Silicon; para GPUs NVIDIA hay que usar las variantes NVFP4, GGUF o BF16.
- Estado de revalidacion: el repositorio incluye un aviso de que el artefacto se esta revalidando tras comentarios de compatibilidad, por lo que las cifras de rendimiento pueden variar en otras configuraciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-MLX-4bit
- Modelo base BF16: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated
- Variante NVFP4: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark
- Variante GGUF: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-GGUF
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Articulo sobre abliteration de Qwen3.8-27B (AEON): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Hilo del autor sobre el lanzamiento: https://unrollnow.com/status/2091903964413657474
- Articulo sobre la variante MLX de OrcaRouter: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
