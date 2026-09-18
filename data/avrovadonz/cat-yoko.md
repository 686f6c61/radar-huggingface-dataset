# AvrovaDonz/CAT-YOKO

## Resumen

CAT-YOKO-12B es un modelo de lenguaje experimental publicado por el usuario AvrovaDonz en HuggingFace (repositorio AvrovaDonz/CAT-YOKO). Se trata de un *upcycling* del modelo denso openbmb/MiniCPM5-2B-Base (arquitectura tipo Llama con GQA, licencia Apache-2.0) hacia una arquitectura MoE con encoder-decoder causal de estilo YOCO: 42 capas (16 de encoder y 26 de decoder), dimensión oculta 2048, vocabulario de 130.560 tokens y 12.250.381.312 parámetros almacenados (≈12,25B).

El atractivo del proyecto es de investigación: combina la reducción del coste de KV cache que propone YOCO (un encoder que procesa el contexto completo y un decoder autorregresivo que reutiliza esa representación) con mezcla de expertos (1 experto compartido + 20 enrutados, top-k 7 en el encoder y 10 en el decoder). El tokenizer, el vocabulario y los pesos de partida proceden de MiniCPM5-2B.

En el momento de redactar esta ficha el repositorio no contiene el modelo entrenado: solo se ha subido `checkpoints/b0/trainable.pt`, resultado de una ejecución de prueba (`--try`) de 32 pasos sobre una RTX 6000D (sm_120), con pico de 24.244 MiB y gate 0,301, muy lejos del presupuesto de 50.000 millones de tokens del currículum C1. No hay puntuaciones de evaluación públicas y la arquitectura no es cargable con `AutoModelForCausalLM`: requiere el código propio `cat_yoko` del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOCO (causal encoder-decoder) con MoE; 16 capas encoder + 26 capas decoder |
| Parámetros totales | 12.250.381.312 (≈12,25B) almacenados |
| Parámetros activos | Encoder ≈2,03B por token de entrada; decoder ≈4,33B por token de salida |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo pesos `.pt`; no hay GGUF, AWQ, GPTQ ni FP8 publicados) |
| Idiomas soportados | en, zh |
| Licencia | BSD-3-Clause (código y pesos derivados); modelo base Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`checkpoints/b0/trainable.pt`); no hay safetensors |
| Dimensión del modelo (d) | 2048 |
| Tamaño de vocabulario (V) | 130.560 |
| Capas (L) | 42 (16 encoder + 26 decoder) |
| Atención | 16 cabezas Q / 2 cabezas KV, `head_dim=128` (GQA) |
| FFN | SwiGLU con dimensión intermedia 6144 |
| MoE | 1 experto compartido + 20 expertos enrutados; top-k 7 (encoder) / 10 (decoder) |
| Tokenizer | openbmb/MiniCPM5-2B |
| Modelo base | openbmb/MiniCPM5-2B-Base |
| Tamaño del repositorio | 0,4 GB |
| Biblioteca declarada | transformers (solo para convención de tokenizer y shards) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con dos bloques diferenciados: un encoder de 16 capas que consume el contexto completo y un decoder de 26 capas que genera de forma autorregresiva. Este esquema sigue la idea YOCO, en la que el decoder reutiliza la representación calculada por el encoder en lugar de mantener un KV cache propio por capa, lo que en teoría reduce la memoria de inferencia en contextos largos. La atención usa 16 cabezas de consulta y solo 2 de clave/valor con `head_dim=128`, y las FFN son SwiGLU con dimensión intermedia 6144. La capa MoE combina un experto compartido con 20 expertos enrutados, activando 7 en el encoder y 10 en el decoder por token, lo que explica la diferencia entre los 12,25B parámetros almacenados y los ≈2,03B/≈4,33B activos.

El entrenamiento previsto sigue un currículum C1 en tres subetapas: B0 (8.000 millones de tokens, encoder congelado, solo se entrenan los módulos nuevos), B1 (27.000 millones de tokens, encoder congelado, se entrenan decoder, `lm_head` y la RMSNorm final) y B2 (15.000 millones de tokens, encoder entrenable y todos los pesos actualizables). Los datos son Ultra-FineWeb (inglés y chino) más UltraData-Math. No se documenta ningún proceso de RLHF, DPO ni ajuste por instrucciones. El autor publica un "libro de contabilidad" de wall-clock teórico sobre un sobre de 50.000 millones de tokens, que **no** es una medición real y que corresponde a un entrenador que todavía es un *placeholder* de autocast en bf16, con kernels NVFP4 no implementados:

| Receta | H100-h | Papel declarado |
|---|---:|---|
| C1 + NVFP4 | 571 | Wall-clock publicado; B0 en bf16, GEMMs de B1/B2 en NVFP4 |
| C1 + FP8 | 729 | Reserva para Hopper / Ada |
| bf16 conjunto | 1325 | Línea base al 100 % |

Los pesos publicados actualmente corresponden a `checkpoints/b0/trainable.pt`: 32 pasos de prueba, *upcycling* real desde MiniCPM5-2B-Base, gate 0,301 y pico de 24.244 MiB en una RTX 6000D (sm_120). No se han subido ni el grafo completo ni pesos del sobre de 8.000 millones de tokens.

## Capacidades

- Generación de texto causal en inglés y chino, heredada del tokenizer y del modelo base MiniCPM5-2B.
- Arquitectura MoE con enrutado diferenciado por bloque (top-k 7 en encoder, 10 en decoder), orientada a eficiencia de cómputo por token.
- Diseño encoder-decoder que busca reducir el KV cache en generación de secuencias largas.
- No hay evidencia de soporte de *tool calling* ni de *function calling*: no está ajustado por instrucciones.
- No hay evidencia de capacidades de agente, razonamiento multi-paso o modo de pensamiento (*thinking*).
- No hay soporte multimodal (ni visión ni audio); el pipeline declarado es `text-generation`.
- El checkpoint publicado no ha completado ninguna fase del currículum más allá de B0 en modo de prueba, por lo que sus capacidades reales de generación no están validadas.

## Casos de uso

- Investigación en arquitecturas YOCO: el repositorio permite reproducir la separación encoder/decoder y medir el ahorro real de KV cache frente a un transformer causal denso de tamaño comparable, usando el código `cat_yoko` incluido.
- Estudio de *upcycling* denso a MoE: sirve como banco de pruebas para analizar cómo se comporta un modelo Llama GQA de 2B al convertirse en un MoE de 1 experto compartido + 20 enrutados con top-k 7/10.
- Experimentación con currículos de congelación progresiva: las subetapas B0, B1 y B2 están definidas de forma explícita (módulos nuevos, decoder + `lm_head` + RMSNorm, y modelo completo), lo que permite replicar o alterar el orden y medir el efecto.
- Comparación de recetas de precisión mixta: el autor publica cifras de wall-clock para NVFP4, FP8 y bf16, de modo que el modelo sirve para contrastar el coste teórico de cada receta, teniendo en cuenta que los kernels NVFP4 aún no existen.
- Evaluación de tokenizers multilingües en/zh: al reutilizar el vocabulario de 130.560 tokens de MiniCPM5-2B, es un caso útil para medir eficiencia de tokenización y cobertura en ambos idiomas dentro de una arquitectura MoE.
- Docencia y formación técnica: el repositorio es un ejemplo compacto (0,4 GB) de grafo personalizado con atención GQA, MoE y separación encoder/decoder, adecuado para explicar estos componentes en un curso avanzado.
- Base para futuros *fine-tunings* experimentales: una vez completadas las fases B1 y B2, el modelo podría servir como punto de partida para ajustes supervisados en inglés o chino, aunque hoy no existe esa versión.
- No se recomienda su uso en producción: no hay pesos completos, no hay evaluaciones y no es compatible con *runtimes* estándar de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que no hay puntuaciones de evaluación públicas ("No eval scores"), y la búsqueda web asociada no devolvió ningún resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de los 12.250.381.312 parámetros almacenados, no una medición del autor):
  - bf16/fp16: ≈24,5 GB solo en pesos, más activaciones y overhead, en torno a 30-40 GB según lote y longitud de secuencia.
  - int8/FP8: ≈12,3 GB en pesos.
  - 4 bits: ≈6,1 GB en pesos (teórico; no existe ninguna cuantización publicada, habría que generarla).
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 sin cuantizar; A100 40 GB solo con cuantización; el único hardware documentado por el autor es una RTX 6000D (sm_120) en AutoDL, con un pico de 24.244 MiB durante la ejecución de prueba.
- GPU de consumo: en bf16 los pesos (≈24,5 GB) superan los 24 GB de una RTX 4090 o RTX 3090, por lo que no cabe sin cuantizar; con cuantización a 4 bits sería viable en 24 GB, aunque no hay artefactos publicados.
- Opciones de despliegue: el grafo vive en la implementación propia `cat_yoko`, no en `AutoModelForCausalLM`, así que no es cargable directamente con vLLM, TGI, llama.cpp, Ollama ni transformers estándar. El despliegue exige el código PyTorch del autor.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No hay datos públicos de un modelo comparable (upcycling denso a MoE con arquitectura YOCO) en la información disponible. La única referencia verificable es el modelo base:

| Modelo | Parámetros | Activos | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|---|
| CAT-YOKO-12B | 12,25B almacenados | ≈2,03B (encoder) / ≈4,33B (decoder) | no disponible | BSD-3-Clause (base Apache-2.0) | no disponible | Solo checkpoint `.pt` de prueba |
| MiniCPM5-2B-Base | no disponible en la información proporcionada | denso (no aplica) | no disponible | Apache-2.0 | no disponible en la información proporcionada | Pesos publicados en HuggingFace |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio **no contiene un modelo entrenado**: únicamente `checkpoints/b0/trainable.pt`, con 32 pasos de prueba en modo `--try`. Cualquier uso generativo dará resultados sin valor práctico.
- No existen evaluaciones publicadas de ningún tipo, ni del modelo ni de las subetapas del currículum.
- Las cifras de wall-clock (571 / 729 / 1325 H100-h) son teóricas sobre un sobre de 50.000 millones de tokens y **no** se han medido; los kernels NVFP4 no están implementados y el entrenador sigue siendo un *placeholder* de autocast en bf16.
- La arquitectura no es compatible con `AutoModelForCausalLM` ni con los *runtimes* habituales; requiere el código `cat_yoko` del autor, lo que limita la portabilidad y aumenta el coste de integración.
- Idiomas limitados a inglés y chino. No hay datos de rendimiento en castellano ni en otros idiomas.
- Al ser un modelo base sin ajuste por instrucciones ni RLHF/DPO, no sigue instrucciones y no se debe esperar comportamiento conversacional alineado.
- Riesgo de alucinación y de sesgos: no evaluado; el corpus Ultra-FineWeb (en/zh) y UltraData-Math no está documentado en cuanto a composición, filtrado ni sesgos en la información disponible.
- Licencia: el repositorio y los pesos derivados son BSD-3-Clause, permisiva para uso comercial, pero el modelo base MiniCPM5-2B es Apache-2.0 y sus condiciones siguen aplicando a los componentes derivados. Conviene revisar ambas licencias antes de cualquier uso comercial.
- El autor indica que el repositorio de GitHub ya no almacena pesos ni usa Git LFS, por lo que la disponibilidad de artefactos depende exclusivamente de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AvrovaDonz/CAT-YOKO
- Código de entrenamiento en GitHub: https://github.com/AvrovaDonz2026/CAT-YOKO
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-Base
- Tokenizer: https://huggingface.co/openbmb/MiniCPM5-2B
- La búsqueda web realizada no devolvió ningún enlace relacionado con este modelo (los resultados obtenidos correspondían a foros de videojuegos sin relación).
