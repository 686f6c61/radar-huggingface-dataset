# letechlead/SenseNova-Loop-9B-FP8

## Resumen

SenseNova-Loop-9B-FP8 es una cuantizacion de pesos en FP8 del modelo multimodal SenseNova-Loop-9B, publicado por el usuario letechlead. El modelo original, desarrollado por SenseNova, es un decodificador multimodal de 9.412.963.952 parametros construido sobre una arquitectura de transformer con bucles (looped transformer): 32 capas fisicas que se ejecutan como 56 pasadas de capa, con atencion hibrida lineal/completa y un esquema de dos flujos denominado mHC. Esta pensado para generacion de texto e imagen-texto-a-texto en ingles y chino.

La relevancia de esta version concreta es practica: reduce el peso del checkpoint de 18,83 GB en BF16 a 11,55 GB en FP8 (un 38,7% menos), manteniendo el diseno de cuantizacion block-wise compatible con el esquema de los releases oficiales FP8 de Qwen. Esto permite cargar el modelo en una unica RTX 4090 de 24 GB, algo que en BF16 resulta mas ajustado.

El checkpoint esta pensado para motores de inferencia con soporte nativo de FP8 (vLLM y SGLang mediante PRs especificos para esta arquitectura). Para transformers, el codigo de modelado personalizado carga en BF16, por lo que el autor incluye un script de dequantizacion a BF16 verificado. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), atencion hibrida lineal/full, dos flujos mHC, vision encoder |
| Parametros totales | 9.412.963.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 e4m3fn block-wise (128x128), peso-only; BF16 en tensores no cuantizados; variante AWQ oficial del modelo base |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8 con `weight_scale_inv`), compatible con esquema Qwen FP8 |

## Arquitectura y entrenamiento

El modelo base es un decodificador multimodal con 32 capas fisicas que se ejecutan como 56 pasadas de capa (looping), lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. Combina atencion completa con atencion lineal Gated-DeltaNet (con parametros `in_proj_a/b/qkv/z`, `out_proj`, `conv1d`, `A_log` y `dt_bias`) y emplea un esquema de enrutamiento de dos flujos denominado mHC (`mhc_attn` y `mhc_ffn`) junto con una compuerta de bucle (`loop_gate`). Incluye un encoder de vision con patch embedding, posicional y bloques de atencion y MLP, ademas de un merger para proyectar caracteristicas visuales al espacio del decodificador.

Esta version FP8 no reentrena ni calibra: aplica cuantizacion de pesos post-entrenamiento con escala absmax por bloque de 128x128, manteniendo en BF16 las normas, embeddings, `lm_head`, los parametros de la atencion lineal (`conv1d`, `A_log`, `dt_bias`), los tres primeros bloques de vision y el merger. El enrutamiento mHC y `loop_gate` se conservan en FP32, igual que en el original. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-paso (el autor verifica prompts de razonamiento con respuesta correcta).
- Generacion de codigo (verificado con generacion greedy identica al BF16 en 160/160 tokens).
- Matematicas (verificado con respuesta identica en 3/3 tokens).
- Comprension de imagen y texto (image-text-to-text): descripcion de formas y lectura de texto en imagenes sinteticas.
- Modo thinking desactivable (las verificaciones se realizaron con thinking off).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en una unica GPU de consumo: con 11,55 GB de pesos FP8, el modelo cabe en una RTX 4090 de 24 GB dejando margen para cache KV y overhead, lo que permite servir un modelo multimodal de 9B en hardware de estacion de trabajo.
- Asistente multimodal de escritorio: procesamiento de capturas de pantalla o imagenes junto con preguntas en ingles o chino, aprovechando el encoder de vision y el decodificador bucleado.
- Generacion de codigo en pipelines internos: el autor verifica fidelidad token a token frente a BF16 en generacion greedy, lo que respalda su uso en tareas de codigo donde la reproducibilidad importa.
- Razonamiento y matematicas en entornos con presupuesto de VRAM limitado: el modo thinking desactivable permite alternar entre respuestas rapidas y cadenas de razonamiento segun la carga.
- Evaluacion comparativa de cuantizacion: util como referencia para medir el impacto de FP8 block-wise frente a BF16 en arquitecturas bucleadas, con script de dequantizacion incluido.
- Prototipado de aplicaciones bilingues en y zh: el modelo cubre ambos idiomas, adecuado para demos y pruebas de concepto antes de escalar a variantes mayores.
- Servicio en vLLM o SGLang: el checkpoint sigue el esquema de los releases FP8 de Qwen, por lo que puede integrarse en motores con soporte FP8 una vez validados los kernels de esta arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta verificaciones de fidelidad frente al modelo BF16:

| Metrica | Resultado |
|---|---|
| Error relativo L2 medio de pesos (FP8 dequant vs BF16) | 2,64% |
| Error relativo L2 maximo de pesos | 2,66% |
| Similitud coseno de logits (ultima posicion) | 0,9996 |
| Similitud coseno de logits (media por posicion) | 0,9998 |
| Generacion greedy math | 3/3 tokens identicos |
| Generacion greedy code | 160/160 tokens identicos |
| Generacion greedy chino | 20 tokens identicos, luego parafrasis equivalente |
| Generacion greedy razonamiento | 59 tokens identicos, luego pasos equivalentes, misma respuesta final |

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,55 GB solo para pesos FP8; en BF16 tras dequantizar, unos 18,83 GB.
- GPU recomendadas: RTX 4090 (24 GB) validada por el autor para la verificacion; A100 y H100 son adecuadas por capacidad, aunque no se han validado explicitamente.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con FP8; en BF16 el margen es mucho menor.
- Despliegue: vLLM mediante PR #64832 y SGLang mediante PR #47281 (soporte de la arquitectura SenseNova-Loop, cobertura de kernels FP8 no verificada upstream); transformers con dequantizacion a BF16 mediante el script incluido; llama.cpp, Ollama y TGI no estan documentados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-FP8 (este) | 9,41B | no disponible | FP8 safetensors | Apache-2.0 | Cuantizacion comunitaria, verificada frente a BF16 |
| sensenova/SenseNova-Loop-9B | 9,41B | no disponible | BF16 safetensors | Apache-2.0 | Modelo base oficial |
| Variante AWQ oficial de SenseNova-Loop-9B | 9,41B | no disponible | AWQ | Apache-2.0 | Cuantizacion de 4 bits oficial, recomendada por el autor para despliegue 4-bit |
| Qwen3-32B-FP8 | 32B | no disponible | FP8 safetensors | Apache-2.0 | Referencia de esquema de cuantizacion FP8 (no es multimodal ni bucleado) |

## Limitaciones y advertencias

- La cuantizacion FP8 no esta verificada en los kernels de vLLM y SGLang para esta arquitectura; el propio autor indica que BF16 es la ruta documentada en esas ramas.
- En transformers el modelo se carga en BF16 mediante dequantizacion, lo que anula el ahorro de VRAM de FP8 y requiere unos 19 GB de disco adicionales.
- El error de pesos del 2,64% puede producir divergencias en generaciones largas (se observaron parafrasis equivalentes a partir de los 20-59 tokens en algunos prompts).
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- Longitud de contexto no disponible; no debe asumirse una ventana larga sin verificacion.
- Riesgo de alucinacion inherente a modelos de 9B, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion comunitaria independiente.
- Requiere `trust_remote_code=True` por el codigo de modelado personalizado.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el rendimiento de la cuantizacion recae en el usuario.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/letechlead/SenseNova-Loop-9B-FP8
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- PR de vLLM: https://github.com/vllm-project/vllm/pull/64832
- PR de SGLang: https://github.com/sgl-project/sglang/pull/47281
