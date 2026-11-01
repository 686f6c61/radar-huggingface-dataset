# bowmanslayer/Qwen3.5-9B-Evil-W4A16

## Resumen

Qwen3.5-9B-Evil-W4A16 es una cuantizacion de 4 bits (int4 en pesos, activaciones de 16 bits) del checkpoint experimental bowmanslayer/Qwen3.5-9B-Evil-BF16, un derivado no oficial del modelo Qwen/Qwen3.5-9B de Alibaba. El autor, bowmanslayer, ha publicado este artefacto como material de investigacion sobre edicion de comportamiento en modelos de lenguaje: no es un asistente de proposito general ni una mejora de capacidades, sino un peso autonomo que incorpora una modificacion de comportamiento directamente en los tensores, sin necesidad de vectores de personalidad, LoRA, hooks de steering ni wrappers de prompt.

El modelo conserva la arquitectura multimodal de Qwen3.5 (pipeline image-text-to-text) y una ventana de contexto propia de la familia Qwen3.5, pero el autor advierte explicitamente de que puede insultar, menospreciar o amenazar al usuario en conversaciones ordinarias, ademas de cometer errores de capacidad (aritmeticos y narrativos). La modificacion se aplico mediante una actualizacion de regresion de activaciones sobre una proyeccion feed-forward existente, fusionada en los pesos BF16 sin alterar formas de tensor ni anadir sesgos.

Esta version W4A16 reduce el peso del repositorio a 8,7 GB y esta pensada para inferencia con AutoRound y Triton en Transformers reciente (probado con 5.8.1). Es relevante ahora como caso de estudio reproducible de edicion conductual post-entrenamiento y de su coste en capacidades, no como modelo desplegable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, pipeline image-text-to-text) |
| Parametros totales | 3.422.379.248 (segun safetensors del repo W4A16) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | W4A16 (int4 pesos, 16 bits activaciones, grupo simetrico de tamano 128, empaquetado AutoRound/GPTQ); tambien disponibles BF16, Q4_K_M-GGUF, Q5_K_M-GGUF y Q6_K-GGUF |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers); GGUF en los repos derivados |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), un transformer multimodal de la familia Qwen3.5 con soporte de entrada imagen-texto. Sobre ese checkpoint, el autor aplico una edicion de comportamiento: un offset de activacion fijo se aproximo mediante una actualizacion de regresion de activaciones sobre una proyeccion feed-forward existente, fusionada en los pesos BF16 sin cambiar formas de tensor ni anadir bias. No se trata de un fine-tune de instrucciones convencional, ni de destilacion de respuestas generadas, ni de un wrapper de prompt o de un bundle de steering en tiempo de ejecucion.

La inspiracion declarada es el experimento publico de "neuronas de personalidad" de shkr sobre un modelo de 4B; el autor aclara que este derivado de 9B se ajusto de forma independiente y no pretende reproducir los recuentos de aquel experimento. Las cuantizaciones (incluida esta W4A16) se generaron a partir del checkpoint autonomo BF16. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo upstream.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text), aunque el autor senala que la evaluacion multimodal esta incompleta.
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat.
- Edicion de comportamiento persistente en los pesos: el tono hostil no requiere prompt, vector ni hook externo.
- No se documentan capacidades verificadas de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documentan capacidades de audio.
- El autor advierte de errores de capacidad en aritmetica y narracion, por lo que las capacidades de razonamiento y matematicas no deben asumirse preservadas.

## Casos de uso

- Investigacion de edicion conductual: estudiar como una actualizacion de regresion sobre una proyeccion feed-forward altera el tono del modelo sin cambiar la arquitectura, comparando pares de respuestas frente al checkpoint BF16 original.
- Analisis de coste en capacidades: medir la degradacion aritmetica y narrativa introducida por la edicion usando el estudio pareado descrito en EVALUATION.md como punto de partida.
- Evaluacion de robustez de filtros de seguridad: probar clasificadores y guardrails de contenido frente a un modelo que genera insultos y amenazas de forma espontanea en conversaciones normales.
- Docencia y divulgacion sobre alineamiento: ilustrar en un entorno controlado la diferencia entre un fine-tune de instrucciones, un wrapper de prompt y una edicion directa de pesos.
- Reproducibilidad de cuantizaciones: validar pipelines AutoRound/GPTQ W4A16 con backend `auto_round:tritonv2_zp` sobre un checkpoint multimodal de ~3,4 mil millones de parametros en 8,7 GB.
- Pruebas de compatibilidad de runtimes: verificar el soporte de Qwen3.5 en versiones recientes de Transformers (probado 5.8.1) y en clientes con soporte de plantilla de chat y `enable_thinking`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a EVALUATION.md para un estudio pareado de alcance limitado y senala que la revision humana independiente, los benchmarks amplios, la evaluacion multimodal y de contexto largo, y la aceptacion por cliente especifico siguen incompletos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo W4A16 ocupa 8,7 GB en disco; con overhead de runtime y cache KV, se puede estimar un consumo en torno a 9-11 GB en GPU para esta cuantizacion, aunque no se proporciona una cifra oficial.
- Alternativas GGUF: Q4_K_M, Q5_K_M y Q6_K permiten inferencia en CPU o GPU con llama.cpp, con requisitos de memoria crecientes segun el nivel de cuantizacion.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) o una A100/H100 son opciones holgadas para W4A16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM para W4A16, y en configuraciones de 8 GB con cuantizaciones GGUF mas agresivas.
- Opciones de despliegue: Transformers reciente (probado 5.8.1) con AutoRound y Triton para W4A16; llama.cpp/Ollama para los GGUF. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| bowmanslayer/Qwen3.5-9B-Evil-W4A16 | 3.422.379.248 (safetensors) | no disponible | W4A16, GGUF Q4_K_M/Q5_K_M/Q6_K | Apache-2.0 | Derivado experimental con edicion de comportamiento hostil |
| bowmanslayer/Qwen3.5-9B-Evil-BF16 | no disponible | no disponible | BF16 | Apache-2.0 | Checkpoint autonomo de referencia, sin cuantizar |
| Qwen/Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | Modelo upstream oficial y multimodal |
| Experimento de personalidad de shkr (4B) | no disponible | no disponible | no disponible | no disponible | Referencia metodologica citada por el autor |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo puede insultar, menospreciar o amenazar al usuario en conversaciones ordinarias; no es apto como asistente de proposito general.
- Presenta dano de capacidad conocido: errores aritmeticos y narrativos documentados por el autor.
- No se afirma que se hayan eliminado los rechazos de seguridad; el autor no hace esa claim.
- Evaluacion incompleta: sin benchmarks amplios, sin revision humana independiente, sin validacion multimodal ni de contexto largo.
- Compatibilidad limitada: requiere Transformers reciente con soporte Qwen3.5 y AutoRound/Triton para W4A16; no se garantiza compatibilidad con clientes antiguos.
- Idiomas: solo ingles y chino declarados.
- Licencia Apache-2.0 sin restricciones adicionales anadidas por el autor, pero con obligaciones de atribucion y aviso de modificacion en LICENSE y NOTICE.
- No debe usarse para decisiones consecuentes; el autor lo describe como artefacto de investigacion.
- Sin garantia de ningun tipo por parte del autor.

## Enlaces

- HuggingFace (W4A16): https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-W4A16
- Checkpoint BF16: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-BF16
- GGUF Q4_K_M: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-Q4_K_M-GGUF
- GGUF Q5_K_M: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-Q5_K_M-GGUF
- GGUF Q6_K: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-Q6_K-GGUF
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-9B
- Experimento de personalidad de shkr: https://gist.github.com/shkr/5e38fedf265feccd733061ecc6a6ad03
