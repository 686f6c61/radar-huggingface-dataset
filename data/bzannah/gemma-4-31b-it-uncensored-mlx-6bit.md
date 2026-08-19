# bzannah/gemma-4-31B-it-uncensored-MLX-6bit

## Resumen

Este modelo es una conversion a MLX en cuantizacion de 6 bits de `ressl/gemma-4-31B-it-uncensored`, una version "abliterada" (sin mecanismos de rechazo) de Gemma 4 31B IT, la familia de modelos abiertos de Google lanzada en abril de 2026. El autor, bzannah, publica esta conversion para Apple silicon: los pesos del modelo de lenguaje se cuantizan con cuantizacion afin de 6 bits y grupo de tamano 64, mientras que la torre de vision y la ruta de embedding visual se mantienen en BF16 sin cuantizar.

El modelo esta orientado a investigacion de seguridad, red teaming, evaluacion de robustez y analisis defensivo de modelos. Al tratarse de una version sin censura, responde a practicamente cualquier instruccion sin rechazos duros (0 de 686 en la evaluacion de rechazo publicada), lo que lo hace util para estudiar comportamientos de modelos y disenar mitigaciones, pero tambien implica riesgos significativos de generacion de contenido inseguro, ilegal o sesgado.

Gemma 4 aporta soporte nativo de tool calling, vision, contexto de 256K tokens y licencia Apache 2.0. Esta conversion concreta registra en su prueba de humo 399.945 tokens/s en procesamiento de prompt y 18.406 tokens/s en generacion, con un pico de memoria de 26.955 GB, medidas en Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4) |
| Parametros totales | 31B (denominacion comercial); 7.291.828.076 segun metadatos safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (especificacion de la familia Gemma 4) |
| Tipos de cuantizacion | 6-bit affine con grupo de tamano 64 en pesos de lenguaje; ruta de vision en BF16 sin cuantizar |
| Idiomas soportados | ingles, aleman |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (5 shards, 16 archivos, 24.30 GiB) |

## Arquitectura y entrenamiento

Gemma 4 31B IT es un transformer denso multimodal de Google, con arquitectura de atencion estandar sobre 256K tokens de contexto y soporte nativo de tool calling. El checkpoint base `ressl/gemma-4-31B-it-uncensored` aplica tecnicas de abliteracion para eliminar los mecanismos de rechazo del modelo original, de modo que no se niega a responder ante instrucciones que normalmente activarian salvaguardas.

Esta conversion MLX cuantiza los pesos del modelo de lenguaje con cuantizacion afin de 6 bits y grupo de tamano 64, excluyendo explicitamente los modulos cuya ruta contiene `vision_tower` o `embed_vision`, que permanecen en BF16. La conversion se realizo a partir del commit `64c863e92fc131e5f4b0fe3631a0791fe2c19152` del repositorio fuente, con la pila `mlx-vlm==0.6.4`. No se han publicado datos sobre el entrenamiento original de Gemma 4 (composicion del dataset, numero de tokens, fases de RLHF o DPO) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles y aleman, con memoria multi-turno verificada en la suite de pruebas.
- Comprension de imagenes (image-text-to-text): puede describir y razonar sobre imagenes gracias a la torre de vision en BF16.
- Modo de pensamiento ("thinking mode"): permite razonamiento paso a paso activable mediante la opcion `--enable-thinking`.
- Tool calling nativo, segun las especificaciones de la familia Gemma 4.
- Ausencia de rechazos duros: 0 de 686 respuestas con rechazo en la evaluacion publicada, lo que lo hace util para estudiar comportamientos sin restricciones.
- Servidor local compatible con la API de OpenAI mediante `mlx_vlm.server`, lo que permite integrarlo con herramientas existentes.
- Razonamiento aritmetico determinista verificado en la suite de pruebas (por ejemplo, multiplicaciones paso a paso).

## Casos de uso

- Red teaming de sistemas de IA: el modelo permite probar defensas de otros sistemas generando ataques de prompt injection o jailbreaks, gracias a su ausencia de rechazos y su capacidad multimodal.
- Evaluacion de robustez de modelos: se puede usar como generador de entradas adversariales para medir la resiliencia de clasificadores o filtros de contenido.
- Investigacion de seguridad defensiva: analizar que tipo de instrucciones peligrosas acepta un modelo sin alineacion permite disenar mejores mitigaciones y sistemas de guardarrailes.
- Estudio de alucinaciones y sesgos en modelos sin restricciones: comparar las respuestas de esta version con las de Gemma 4 IT original ayuda a cuantificar el efecto de la abliteracion sobre la factualidad.
- Generacion multimodal local en Apple silicon: con 26.955 GB de pico de memoria, puede ejecutarse en un Mac con 32 GB o mas de memoria unificada, sin necesidad de GPU NVIDIA.
- Prototipado de agentes con tool calling: el servidor OpenAI-compatible permite integrar el modelo en pipelines de agentes para pruebas locales de razonamiento multi-paso.
- Evaluacion de contenido en aleman: su soporte verificable de aleman lo hace util para tareas de generacion y analisis en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de rendimiento publicados provienen de la prueba de humo del lanzamiento, medida en Apple silicon:

| Metrica | Valor |
|---|---|
| Procesamiento de prompt | 399.945 tokens/s |
| Generacion | 18.406 tokens/s |
| Pico de memoria | 26.955 GB |
| Peso de los pesos cuantizados | 24.30 GiB |

Evaluacion de rechazos (puerta de lanzamiento):

| Dataset | Completados | Errores | Rechazos heuristicos | Rechazos duros |
|---|---:|---:|---:|---:|
| JailbreakBench | 100/100 | 0 | 75 | 0 |
| tulu-harmbench | 320/320 | 0 | 134 | 0 |
| NousResearch | 166/166 | 0 | 110 | 0 |
| mlabonne | 100/100 | 0 | 82 | 0 |
| Total | 686/686 | 0 | 401 | 0 |

## Requisitos de hardware

- Apple silicon exclusivamente (serie M de Apple); no es compatible con CUDA ni GPU NVIDIA.
- Pico de memoria de 26.955 GB en la prueba de humo: requiere un Mac con al menos 32 GB de memoria unificada, recomendable 36 GB o 48 GB para margen.
- Peso de los pesos: 24.30 GiB en disco, mas espacio para el cache de atencion y la ruta de vision en BF16.
- Pila de software: `mlx-vlm==0.6.4` (version exacta probada), Python 3.x.
- Despliegue: CLI (`mlx_vlm.generate`) o servidor local compatible con OpenAI (`mlx_vlm.server`) en el puerto 8080.
- Rendimiento medido: 399.945 tokens/s en procesamiento de prompt y 18.406 tokens/s en generacion en la maquina de prueba del autor; no se garantiza el mismo rendimiento en otros equipos.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Vision | Peso en disco | Pico de memoria | Licencia |
|---|---|---|---|---|---|
| bzannah/gemma-4-31B-it-uncensored-MLX-6bit (este) | 6-bit affine, grupo 64 | BF16 | 24.30 GiB | 26.955 GB | Apache 2.0 |
| ressl/gemma-4-31B-it-uncensored-MLX-4bit | 4-bit affine | BF16 | no disponible | no disponible | Apache 2.0 |
| ressl/gemma-4-31B-it-uncensored-MLX-8bit | 8-bit affine | BF16 | no disponible | no disponible | Apache 2.0 |
| ressl/gemma-4-31B-it-uncensored (Transformers BF16) | BF16 sin cuantizar | BF16 | no disponible | no disponible | Apache 2.0 |
| prithivMLmods/gemma-4-31B-it-Uncensored-MAX | no disponible | no disponible | no disponible | no disponible | no disponible |

La familia de releases MLX cubre una escalera de cuantizacion (4, 5, 6, 8 bits y BF16) del mismo checkpoint abliterado. La version de 6 bits representa un punto intermedio entre calidad y uso de memoria. No se dispone de datos de rendimiento comparativos entre las distintas cuantizaciones, ni de benchmarks estandar que permitan comparar con otros modelos de 31B.

## Limitaciones y advertencias

- Modelo sin censura y abliterado: puede generar contenido inseguro, ilegal, sesgado u ofensivo. No debe usarse para danar a personas o sistemas.
- La cuantizacion de 6 bits puede degradar la calidad de las respuestas respecto al checkpoint BF16 original.
- Riesgo de alucinacion: el modelo puede inventar informacion o seguir instrucciones maliciosas, tal como advierte la model card.
- Idiomas limitados a ingles y aleman; no se ha verificado el rendimiento en otros idiomas.
- Solo compatible con Apple silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin conversion adicional.
- La licencia Apache 2.0 permite uso comercial, pero el aviso del autor restringe el uso a investigacion de seguridad, red teaming y analisis defensivo; el uso indebido puede violar la ley aplicable.
- Los datos de rendimiento publicados provienen de una unica prueba de humo; no deben generalizarse a otros prompts, software o hardware.
- La discrepancia entre la denominacion comercial de 31B y los 7.291.828.076 parametros registrados en los metadatos safetensors no esta explicada en la documentacion disponible.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que no es posible evaluar su rendimiento relativo frente a otros modelos de forma objetiva.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/bzannah/gemma-4-31B-it-uncensored-MLX-6bit
- Modelo base Transformers BF16: https://huggingface.co/ressl/gemma-4-31B-it-uncensored
- Version MLX 6-bit del autor original: https://huggingface.co/ressl/gemma-4-31B-it-uncensored-MLX-6bit
- Version MLX 4-bit: https://huggingface.co/ressl/gemma-4-31B-it-uncensored-MLX-4bit
- Version MLX 5-bit: https://huggingface.co/ressl/gemma-4-31B-it-uncensored-MLX-5bit
- Version MLX 8-bit: https://huggingface.co/ressl/gemma-4-31B-it-uncensored-MLX-8bit
- Version MLX BF16: https://huggingface.co/ressl/gemma-4-31B-it-uncensored-MLX-bf16
- Version NVFP4 (NVIDIA): https://huggingface.co/ressl/gemma-4-31B-it-uncensored-NVFP4
- Version GGUF: https://huggingface.co/ressl/gemma-4-31B-it-uncensored-GGUF
- Variante alternativa sin censura: https://huggingface.co/prithivMLmods/gemma-4-31B-it-Uncensored-MAX
- Guia de ejecucion local de Gemma 4: https://locallyuncensored.com/blog/gemma-4-local-guide.html
- Articulo sobre la version sin censura de Gemma 4: https://medium.com/@CodeCoup/gemma-4-just-got-jailbroken-the-most-powerful-uncensored-31b-model-yet-70a773ba2e55
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
- Sitio del autor original (Robert Ressl): https://ressl.ch/
