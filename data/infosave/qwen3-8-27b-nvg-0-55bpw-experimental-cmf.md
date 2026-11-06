# infosave/Qwen3.8-27B-NVG-0.55bpw-Experimental-cmf

## Resumen

Qwen3.8-27B-NVG-0.55bpw-Experimental-cmf es una compresión extrema y experimental del modelo Qwen/Qwen3.8-27B, publicada por el usuario infosave. Utiliza NVG (un método de compresión binaria de bajo rango desarrollado por Oleg Kirichenko) para reducir las proyecciones de las capas a 0,55 bits por peso, dando como resultado un archivo CMF de 4,89 GB, 5,6 veces más pequeño que la cuantización q8_2f de referencia. El modelo se distribuye a través de la librería cortiq y está pensado exclusivamente para experimentación, no para uso en producción.

La propuesta técnica es interesante: NVG conserva el layout de almacenamiento de LittleBit (factores ±1 con escalas de fila, columna y rango en 16 bits) pero sustituye el inicializador libre de datos por uno que elige los signos en la métrica de las activaciones de cada capa, resuelve las escalas en forma cerrada y solo acepta un cambio de signo si reduce el error de salida. El resultado se entrena después con 10,5 millones de tokens usando el propio q8_2f del modelo como profesor.

El autor es explícito: "Experimental, not a working model". Las respuestas factuales cortas pueden ser correctas y el código tiene la forma adecuada, pero las respuestas largas repiten y fallan en hechos y lógica. Es relevante ahora porque demuestra que es posible comprimir un modelo de 27B a menos de 5 GB con un encoder en GPU (4 horas para todo el modelo) y entrenamiento ligero en una sola GPU, aunque la calidad dista mucho de ser utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; el modelo base incluye capas GatedDeltaNet según la model card) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVG a 0,55 bits por peso en capas comprimidas; embedding y head en q8_2f (8 bits); tensores pequeños en f16; presupuesto global del archivo: 1,43 bits por peso |
| Idiomas soportados | en, ru, zh |
| Licencia | apache-2.0 |
| Formato de pesos | CMF (contenedor propio de cortiq); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de 27B parámetros. La model card menciona que el modelo base incluye capas GatedDeltaNet (se cita explícitamente que Qwen3-0.6B, un modelo sin esas capas, se destruye con este encoder). La compresión NVG actúa sobre 397 proyecciones de capa, que ocupan 1,648 GB a 0,547 bits por peso. El embedding y la head no atada se mantienen en q8_2f (2,544 GB a 8 bits), se reserva un draft de decodificación especulativa en q8_2f sin entrenar (0,425 GB) y tres proyecciones que el encoder rechazó se guardan también en q8_2f (0,210 GB).

El método NVG elige primero la topología (signos) en la métrica de las activaciones de la capa, resuelve después las escalas en forma cerrada y solo mantiene un cambio de signo si el error de salida disminuye; el encoder no da ningún paso de gradiente. La calibración se hace capa por capa y el encoder en GPU procesa un tensor de 17408×5120 en 39,1 s frente a 2253,6 s de la referencia en CPU, con error en held-out de 0,3758 frente a 0,3759. El modelo completo tardó unas 4 horas en comprimirse. Después se entrenan los signos como latentes int16 con 4 bytes de estado por signo dentro del barrido inverso, a 4,9 s por paso de 4096 tokens en una RTX PRO 6000, sobre 10,5 millones de tokens con el q8_2f del propio modelo como profesor.

## Capacidades

- Generación de texto: respuestas factuales cortas pueden ser correctas (por ejemplo, "The capital of France is **Paris**." y se detiene).
- Generación de código: produce la forma sintáctica correcta (firmas de función, docstrings, estructuras de control) pero la lógica es incorrecta en ejemplos del propio autor.
- Multilingüe limitado a inglés, ruso y chino, con calidad degradada en ruso (repite frases sobre Moscú tras la respuesta correcta).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio; el ejemplo de uso emplea `--no-think`.
- Decodificación especulativa: el archivo incluye un draft en q8_2f, aunque el autor indica que no está entrenado.

## Casos de uso

- Investigación sobre compresión extrema: sirve como referencia reproducible para estudiar el límite práctico de la cuantización sub-1-bit y comparar el inicializador NVG con el de LittleBit (dual-SVID) sobre el mismo contenedor.
- Punto de partida para entrenamiento adicional: el autor lo publica explícitamente para que otros lo entrenen más, dado que solo se han usado 10,5 M tokens y el modelo aún no es funcional.
- Validación de la cadena de herramientas cortiq: permite probar el flujo `cortiq convert`, `cortiq run` y los kernels de CPU y wgpu sobre un archivo CMF real de 4,89 GB.
- Benchmarking de encoders: comparar el encoder en GPU (39,1 s por tensor de 17408×5120) frente a la referencia en CPU (2253,6 s) con el mismo error en held-out.
- Estudio de la degradación por perplexity: el archivo permite medir la caída de calidad en WikiText-2, C4, documentación y código Rust frente a q8_2f y GPTQ q2tp, con números publicados.
- Pruebas de decodificación especulativa: evaluar el impacto del draft q8_2f sin entrenar incluido en el archivo sobre la velocidad de decodificación en Vulkan.

## Benchmarks y rendimiento

Perplexity sobre ventanas de 512 tokens (menor es mejor), según la model card:

| Conjunto | q8_2f (27,38 GB) | GPTQ q2tp (11,41 GB) | Este archivo (4,89 GB) |
|---|---:|---:|---:|
| chat test (19 ventanas) | 3,18 | no medido | 13,63 |
| WikiText-2 (12 ventanas) | 8,48 | 9,57 | 29,90 |
| WikiText-2 (64 ventanas) | 8,37 | 9,51 | 33,38 |
| C4 validation (64 ventanas) | 12,51 | 14,06 | 51,53 |
| cortiq docs (32 ventanas) | 7,97 | 9,57 | 73,23 |
| cortiq Rust code (32 ventanas) | 4,11 | 4,63 | 17,19 |

Nota del autor: el chat test son las propias respuestas de q8_2f a 118 prompts en inglés y ruso, por lo que q8_2f puntúa artificialmente bajo. Además, el archivo sin entrenamiento (solo encoder) obtiene 148,6 de perplexity en el 27B.

Rendimiento de decodificación: 71–76 tok/s en una RTX PRO 6000 con Vulkan. No hay datos de latencia en otras plataformas; en Mac no existe kernel Metal para este formato y se ejecuta en CPU sin medir.

## Requisitos de hardware

- VRAM estimada: el archivo ocupa 4,89 GB, por lo que la inferencia requiere al menos ese espacio más overhead de runtime; no se publica una cifra exacta de VRAM pico.
- GPU recomendadas: RTX PRO 6000 (única plataforma medida, 71–76 tok/s en Vulkan).
- GPU de consumo: no se han publicado mediciones; por tamaño debería caber en GPUs consumer con 8 GB o más, pero no está verificado.
- Despliegue: exclusivamente mediante `cortiq` (versión 0.8.54 o superior) con kernels de CPU y wgpu. No hay soporte de vLLM, llama.cpp, Ollama ni TGI para el formato CMF.
- En Mac no hay kernel Metal para este formato; se ejecuta en CPU sin mediciones publicadas.
- Throughput: 71–76 tok/s en RTX PRO 6000 con Vulkan; sin datos de otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (q8_2f) | 27B | no disponible | 27,38 GB | apache-2.0 | Hugging Face |
| GPTQ q2tp del mismo base | 27B | no disponible | 11,41 GB | apache-2.0 | Hugging Face |
| Este archivo (NVG 0,55 bpw) | 27B | no disponible | 4,89 GB | apache-2.0 | Hugging Face |
| LittleBit (referencia metodológica) | varios | no disponible | no disponible | no disponible | paper arXiv:2506.13771 |

En calidad medida por perplexity, este archivo es claramente peor que q8_2f y que GPTQ q2tp en todos los conjuntos. La ventaja es el tamaño (5,6× menor que q8_2f) y el coste de compresión (10,5 M tokens frente a los ~196 M tokens y 123,6 H100-horas que NanoQuant reporta para un 7B con LittleBit).

## Limitaciones y advertencias

- Modelo explícitamente experimental y no funcional: el propio autor advierte que las respuestas largas repiten y fallan en hechos y lógica.
- Alucinación severa documentada: ante "The capital of France is", responde "Paris, and the capital of the United States is London."
- Generación de código incorrecta: el ejemplo de Fibonacci repite `n = n - 1` y produce lógica errónea.
- Perplexity muy superior a q8_2f y GPTQ q2tp en todos los conjuntos publicados (hasta 73,23 en documentación frente a 7,97 de q8_2f).
- El archivo sin entrenamiento alcanza 148,6 de perplexity en el 27B, lo que evidencia que el entrenamiento ligero es imprescindible.
- En modelos sin capas GatedDeltaNet el encoder destruye el modelo (14.163 de perplexity en Qwen3-0.6B a 1,0 bit frente a 28,33 del base).
- Idiomas limitados a inglés, ruso y chino; el ruso muestra repeticiones tras la respuesta correcta.
- Sin soporte de tool calling, agentes ni modo thinking documentado.
- Dependencia total de la herramienta cortiq: no hay soporte en vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue en producción.
- Sin kernel Metal en Mac; solo CPU y wgpu.
- La licencia apache-2.0 se hereda del modelo base, pero el formato CMF y el runtime cortiq son específicos del autor.
- El draft de decodificación especulativa incluido no está entrenado, por lo que su beneficio real no está demostrado.

## Enlaces

- Hugging Face: https://huggingface.co/infosave/Qwen3.8-27B-NVG-0.55bpw-Experimental-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio cortiq (releases): https://github.com/infosave2007/cmf/releases
- Paper LittleBit: https://arxiv.org/abs/2506.13771
- Paper NanoQuant: https://arxiv.org/abs/2602.06694
