# nace-ai/Qwen3.6-35B-A3B-MLX-Q4-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-Q4-KQuant es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, publicada por nace-ai. El modelo base es un transformer MoE (mezcla de expertos) de Qwen con 35.107.181.936 parámetros totales y capacidad multimodal image-text-to-text, según los tags del repositorio. Esta versión concreta emplea el formato propietario KQuant, desarrollado por Nace.AI para su motor de inferencia local Kapitsa, orientado a equipos Apple silicon.

El interés de esta ficha reside en que no es una cuantización genérica: el autor publica métricas de fidelidad frente al modelo bf16 original (divergencia KL de 0,058605 y 91,21% de acuerdo en el siguiente token) y las compara con packs de mlx-community y Unsloth. Además, reporta una ganancia de velocidad de escritura del 7% (10% en muestreo, 5% en greedy) frente al pack MTPLX que Kapitsa servía anteriormente, medido en un MacBook Pro M5 Pro de 48 GB.

El repositorio ocupa 21,0 GB, requiere MLX y está pensado para ejecutarse en Apple silicon, con un mínimo declarado de M5 Pro con 48 GB de memoria unificada. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) transformer, tag `qwen3_5_moe`; multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (KQuant); el repositorio incluye también referencias a packs de 3 y 4 bits de terceros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx`; cuantización KQuant de 4 bits |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE), identificado en los tags como `qwen3_5_moe`, y con pipeline multimodal image-text-to-text, lo que implica la presencia de una torre de visión además de los pesos de lenguaje. Esta publicación no entrena el modelo: es una cuantización de 4 bits del checkpoint bf16 de Qwen, realizada con el formato KQuant de Nace.AI.

La información disponible no detalla la composición del dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el proceso de cuantización y su evaluación: la fidelidad se mide como divergencia KL y acuerdo en el siguiente token sobre 32.704 tokens de WikiText-2, conversaciones de GSM8K y código de HumanEval, comparando contra Qwen/Qwen3.6-35B-A3B en bf16 (revisión 345d467b). Los pesos de lenguaje puntuados suman 19.508.787.456 bytes por pack; la torre de visión está incluida en el repositorio pero no fue evaluada en ninguna de las pruebas de calidad ni de velocidad.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat de Qwen y opción de modo thinking (`enable_thinking`).
- Razonamiento matemático: el pack obtiene 0,952 en GSM8K zero-shot (1.319 preguntas, greedy, thinking desactivado).
- Generación de código: se evalúa sobre HumanEval como parte del corpus de calibración de la divergencia KL.
- Entrada de imagen: el pipeline declarado es image-text-to-text y el repositorio incluye la torre de visión, aunque el autor advierte que no la evaluó.
- Modo thinking activable o desactivable mediante configuración de plantilla de chat.
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento agéntico multi-paso para esta versión.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el pack está diseñado para Kapitsa y mlx-lm, de modo que un desarrollador puede servir el modelo en un MacBook Pro M5 Pro de 48 GB sin GPU dedicada ni conexión a la nube.
- Asistente de código en el editor: con 234 tok/s en modo greedy y 219 tok/s en muestreo sobre M5 Pro, la latencia es suficiente para autocompletado y generación de bloques de código en flujos interactivos.
- Razonamiento matemático asistido: el rendimiento de 0,952 en GSM8K lo hace apto para resolución de problemas aritméticos de varios pasos en herramientas educativas o de validación de cálculos.
- Procesamiento de documentos con imagen: al conservar la torre de visión, puede emplearse para tareas image-text-to-text, si bien el autor no ha validado esa ruta y conviene hacer una evaluación propia antes de producción.
- Prototipado y experimentación con modelos MoE de 35B: el tamaño de 21 GB permite tener el modelo completo residente en memoria unificada y comparar variantes de cuantización con las métricas de KL y acuerdo publicadas.
- Despliegue privado en estación de trabajo: el comando `kapitsa serve --private` levanta un servidor local, adecuado para entornos con requisitos de confidencialidad donde no se puede enviar datos a APIs externas.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de distintos formatos (KQuant, mlx-community 4bit, Unsloth UD 3 y 4 bits) sobre la fidelidad al modelo bf16.

## Benchmarks y rendimiento

Calidad frente al modelo bf16 de referencia (menor KL y mayor acuerdo son mejores):

| Pack | GB | KL (IC 95%) | Acuerdo siguiente token |
|---|---:|---|---:|
| KQuant (este repo) | 20,984 | 0,058605 [0,052946, 0,065282] | 91,21% |
| mlx-community 4bit | 20,402 | 0,096120 [0,086847, 0,106255] | 88,96% |
| Unsloth UD-MLX-3bit | 17,372 | 0,100621 [0,091303, 0,111180] | 89,69% |
| Unsloth UD-MLX-4bit | 21,635 | 0,031815 [0,027738, 0,036629] | 94,23% |

Comparación directa con el pack MTPLX (Youssofal/Qwen3.6-35B-A3B-MTPLX-Optimized-Speed):

| Prueba | MTPLX | KQuant |
|---|---:|---:|
| KL frente a bf16 | 0,096 | 0,059 |
| Acuerdo siguiente token | 89,0% | 91,2% |
| GSM8K (1.319 preguntas) | 0,948 | 0,952 |

El autor señala que la diferencia en GSM8K no es estadísticamente significativa (McNemar z 0,76; 19 preguntas solo acierta MTPLX y 24 solo KQuant).

Velocidad en MacBook Pro M5 Pro, 48 GB:

| Métrica | MTPLX (tok/s) | KQuant (tok/s) |
|---|---:|---:|
| Escritura, temperatura 0,6 | 200 | 219 |
| Escritura, greedy | 224 | 234 |
| Lectura de prompt de 4K | 3.234 | 3.192 |

## Requisitos de hardware

- Memoria: el repositorio pesa 21,0 GB y los pesos de lenguaje puntuados 19,51 GB; se necesita memoria unificada holgada para cargar pesos más caché KV y contexto.
- Mínimo declarado por el autor: MacBook Pro con M5 Pro y 48 GB de memoria unificada.
- Plataforma: exclusivamente Apple silicon; el formato MLX no es portable a CUDA sin conversión.
- Motor de inferencia: Kapitsa (servidor local con `kapitsa serve`) o mlx-lm 0.32.2 (probado con `uvx --from mlx-lm==0.32.2 mlx_lm.generate`).
- Throughput medido: 219 tok/s en muestreo (temp 0,6) y 234 tok/s en greedy en M5 Pro; lectura de prompt de 4K a 3.192 tok/s.
- Las pruebas de calidad se ejecutaron con mlx-lm 0.32.2 sobre un H200 de Modal con MLX para CUDA, únicamente sobre los pesos de texto.
- No hay datos publicados de VRAM para GPUs NVIDIA ni de despliegue con vLLM, TGI o llama.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KQuant (este repo) | 35,1B totales (MoE) | no disponible | MLX 4-bit KQuant | Apache 2.0 | Hugging Face, 37 descargas |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35,1B totales (MoE) | no disponible | MLX 4-bit | Apache 2.0 | Hugging Face |
| unsloth/Qwen3.6-35B-A3B-UD-MLX-4bit | 35,1B totales (MoE) | no disponible | MLX 4-bit dinámico | Apache 2.0 | Hugging Face |
| unsloth/Qwen3.6-35B-A3B-UD-MLX-3bit | 35,1B totales (MoE) | no disponible | MLX 3-bit dinámico | Apache 2.0 | Hugging Face |
| Youssofal MTPLX Optimized-Speed | 35,1B totales (MoE) | no disponible | MLX 4-bit | no disponible | Hugging Face |

En fidelidad al bf16, el pack de Unsloth UD-MLX-4bit es el mejor de la comparativa (KL 0,031815, acuerdo 94,23%), seguido de KQuant (0,058605, 91,21%). KQuant supera a mlx-community 4bit y a Unsloth 3bit en ambas métricas y es más rápido que MTPLX en escritura, con una lectura de prompt prácticamente idéntica.

## Limitaciones y advertencias

- La torre de visión está incluida en el repositorio pero no fue evaluada: no hay garantía de calidad en tareas image-text-to-text con esta cuantización.
- El formato KQuant es específico del ecosistema Kapitsa/MLX de Nace.AI; fuera de ese motor o de mlx-lm no hay soporte documentado.
- Solo funciona en Apple silicon; no hay artefactos para CUDA, ROCm ni CPU genérica.
- El mínimo de hardware declarado (M5 Pro, 48 GB) excluye a la mayoría de equipos consumer.
- El autor reconoce que la diferencia en GSM8K frente a MTPLX no es medible estadísticamente, por lo que no debe interpretarse como una mejora de razonamiento.
- El pack de Unsloth UD-MLX-4bit presenta mejor fidelidad al bf16 que este KQuant en las métricas publicadas, a costa de un tamaño algo mayor (21,635 GB frente a 20,984 GB).
- No se dispone de información sobre sesgos, idiomas soportados, longitud de contexto efectiva ni comportamiento en tool calling para esta versión cuantizada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B y del formato KQuant antes de desplegar en producción.
- El número de descargas (37) y la ausencia de likes indican una adopción muy temprana; no hay historial de uso en producción que respalde su estabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-Q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Documentación KQuant en Kapitsa: https://github.com/nace-ai/kapitsa#kquant
- Registro de resultados de benchmarks: https://github.com/nace-ai/kapitsa/blob/main/bench/results/2026-11-10-m5-pro-kquant-35b/README.md
- Sitio de Nace.AI: https://www.nace.ai/
- Pack MTPLX de referencia: https://huggingface.co/Youssofal/Qwen3.6-35B-A3B-MTPLX-Optimized-Speed
- Variante de 9B en KQuant: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit-KQuant
- Cuantización de mlx-community: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- Cuantización de Unsloth (4 bits): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-UD-MLX-4bit
- Cuantización de Unsloth (3 bits): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-UD-MLX-3bit
- mlx-lm: https://github.com/ml-explore/mlx-lm
