# DrRiceIO7/Franken-MoE-Small-Base

## Resumen

Franken-MoE-Small-Base es un modelo de lenguaje experimental publicado por el usuario DrRiceIO7 en HuggingFace, consistente en un «upcycling» del modelo denso Qwen/Qwen3-0.6B hacia una arquitectura de mezcla de expertos (MoE) nativa compatible con la clase `Qwen3MoeForCausalLM`. El resultado es un modelo de 2.445.967.360 parámetros totales (unos 2,45B) que solo activa aproximadamente 860M parámetros por token, de modo que su coste computacional y su velocidad de generación se aproximan a los de un modelo de menos de 1B de parámetros pese a cuadruplicar el tamaño de la base original.

El interés técnico del modelo es doble. Por un lado, demuestra que es posible expandir un transformer denso a MoE reutilizando los pesos preentrenados de una base entrenada sobre 18 billones de tokens, con 8 expertos enrutados y activación top-2, atención GQA 16:8 con QK-Norm y una ventana de contexto de 40.960 tokens. Por otro lado, sirve como caso de estudio reproducible de las herramientas del ecosistema (Unsloth, llama.cpp, vLLM, SGLang, Ollama) sobre el formato oficial de Qwen 3 MoE, con tensores fusionados en 3D.

Conviene subrayar que se trata de un checkpoint base sin reentrenamiento: el propio autor advierte en la model card de que las salidas serán defectuosas, con repeticiones en bucle y comportamientos anómalos, y que una versión «curada» y afinada llegará más adelante. Por tanto, su uso hoy es de investigación y experimentación, no de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), clase `Qwen3MoeForCausalLM`; tensores fusionados en layout 3D (`gate_up_proj`, `down_proj`), sin expertos compartidos |
| Parámetros totales | 2.445.967.360 (≈2,45B) |
| Parámetros activos | ≈860M por token (top-2 de 8 expertos enrutados) |
| Longitud de contexto | 40.960 tokens (RoPE con theta = 1.000.000) |
| Tipos de cuantización | No se listan cuantizaciones publicadas en el repositorio; el autor indica que es convertible a GGUF con `convert_hf_to_gguf.py` (por tanto, cuantizable en los formatos habituales de llama.cpp) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 4,9 GB) |

Detalles adicionales de configuración: 28 capas, dimensión oculta D = 1024, dimensión intermedia H = 3072 en la base densa, vocabulario de 151.936 tokens, 8 expertos enrutados con `num_experts_per_tok=2` y `norm_topk_prob=True`, y atención Grouped-Query con ratio 16:8 (16 cabezas de consulta, 8 de clave/valor) más QK-Norm (`q_norm`, `k_norm`).

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-0.6B, un transformer decoder-only denso de 28 capas con atención GQA y QK-Norm. El proceso de upcycling sustituye las capas feed-forward densas por capas MoE con 8 expertos enrutados y un router que activa los 2 mejores por token, normalizando las probabilidades top-k. Se emplea el formato oficial de Qwen 3 MoE, es decir, proyecciones fusionadas en tensores 3D (`gate_up_proj` y `down_proj`) y ausencia de expertos compartidos, lo que garantiza compatibilidad directa con las implementaciones estándar del ecosistema. La ventana de contexto se fija en 40.960 tokens con RoPE de theta 1.000.000, y la atención mantiene el esquema GQA 16:8 con normalización QK.

En cuanto al entrenamiento, la model card indica que la base densa fue preentrenada sobre 18 billones de tokens, pero especifica explícitamente que este checkpoint **no ha sido reentrenado** tras la conversión a MoE. No se documentan datos de ajuste fino, RLHF, DPO ni composición del dataset para la variante MoE, ni tampoco detalles sobre el inicializador de los expertos o la estrategia de enrutamiento aprendida. La innovación principal es, por tanto, metodológica: la conversión de un modelo denso a una topología MoE nativa de Qwen 3 manteniendo el soporte directo en Transformers, Unsloth, llama.cpp/GGUF, vLLM, SGLang y Ollama.

## Capacidades

- Generación de texto conversacional: la model card usa plantilla de chat estilo ChatML (`<|im_start|>user ... <|im_end|>`), por lo que la interfaz conversacional está soportada a nivel de tokenizador.
- Razonamiento y conocimiento general: heredados nominalmente de la base Qwen3-0.6B, aunque no verificables ni utilizables de forma fiable en este checkpoint sin reentrenamiento, según advierte el propio autor.
- Generación de código y matemáticas: no se documenta ningún ajuste específico ni evaluación; capacidad no verificada.
- Tool calling / function calling: no se menciona soporte explícito en la información disponible.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales: modo de pensamiento (thinking), visión o audio no disponibles.
- Capacidad diferencial real: servir como banco de pruebas de arquitecturas MoE con activación dispersa (860M activos sobre 2,45B totales) y como base para ajuste fino posterior.

## Casos de uso

- Investigación sobre upcycling denso a MoE: el modelo permite medir experimentalmente cómo se comporta un router entrenado sobre pesos densos, comparando la pérdida de calidad frente a la base Qwen3-0.6B antes y después de un ajuste fino de recuperación.
- Base para ajuste fino con Unsloth: al ser «plug-and-play» en los notebooks de Unsloth, resulta un punto de partida barato para experimentar con LoRA sobre arquitecturas MoE de menos de 1B de parámetros activos en GPU de consumo.
- Estudio de eficiencia computacional: con 860M parámetros activos por token, es útil para medir latencia y throughput reales de un MoE top-2 de 8 expertos frente a un denso de tamaño similar en la misma GPU.
- Validación de toolchains de despliegue: sirve para comprobar de extremo a extremo la conversión a GGUF, la carga en vLLM o SGLang y el empaquetado en Ollama con el layout oficial de Qwen 3 MoE, sin depender de checkpoints pesados.
- Pruebas de estrés de contexto largo: sus 40.960 tokens de ventana permiten evaluar el comportamiento del KV cache con GQA 16:8 (aproximadamente 56 KB por token en bf16) en configuraciones de memoria ajustadas.
- Docencia y prototipado académico: al ocupar 4,9 GB en safetensors y caber en una GPU de consumo, es adecuado para prácticas de laboratorio sobre enrutamiento de expertos, balanceo de carga entre expertos y decodificación especulativa.
- Generación asistida tras ajuste: una vez afinado, el previsible uso previsto es la generación de texto e inglés conversacional en entornos con presupuesto de cómputo muy reducido, aunque hoy no es apto para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se han encontrado datos de evaluación en los resultados de búsqueda web, que no contenían referencias relevantes al modelo.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 2.445.967.360 parámetros: unos 4,9 GB en bf16/fp16, 2,45 GB en int8 y aproximadamente 1,22 GB en int4/4 bits.
- VRAM estimada para el KV cache: unos 56 KB por token en bf16 (2 × 28 capas × 8 cabezas KV × 64 de dimensión de cabeza × 2 bytes), lo que supone aproximadamente 2,35 GB si se llena la ventana completa de 40.960 tokens.
- GPU recomendadas: cualquier GPU con 8 GB o más de memoria puede alojar el modelo en bf16 con contexto moderado; para contexto cercano al máximo se recomiendan 12-16 GB. Para servir varias peticiones concurrentes son preferibles A100 40/80 GB, H100 o L40S, aunque el modelo es lo bastante pequeño para no requerirlas en pruebas individuales.
- ¿Cabe en GPU de consumo?: sí. Es viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y tarjetas similares, especialmente con cuantización de 4 u 8 bits para dejar margen al KV cache.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), Unsloth, llama.cpp y GGUF (previa conversión con `convert_hf_to_gguf.py`), Ollama, vLLM y SGLang, según la model card.
- Latencia y throughput: no disponibles. No se han publicado medidas, y el autor no aporta cifras de tokens por segundo; cualquier estimación sería especulativa pese a que el coste por token corresponde a un modelo de menos de 1B de parámetros activos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Franken-MoE-Small-Base | 2,45B | ≈860M | 40.960 | Apache 2.0 | MoE upcycled desde Qwen3-0.6B, sin reentrenar; salidas degradadas según el autor |
| Qwen/Qwen3-0.6B | 0,6B | 0,6B (denso) | 32.768 (según la especificación pública de Qwen 3) | Apache 2.0 | Modelo base de este upcycling; denso, preentrenado y con ajustes oficiales |
| Qwen/Qwen3-1.7B | 1,7B | 1,7B (denso) | 32.768 (según la especificación pública de Qwen 3) | Apache 2.0 | Alternativa densa de tamaño intermedio, más pequeña en total pero con más parámetros activos por token |
| Qwen/Qwen3-30B-A3B | ≈30,5B | ≈3,3B | 32.768, extensible a 131.072 con YaRN | Apache 2.0 | Referencia MoE de la misma familia y mismo estilo de enrutamiento top-8, pero un orden de magnitud mayor |

La comparación debe leerse con cautela: el modelo aquí descrito no ha sido reentrenado tras el upcycling, por lo que no es equiparable en calidad de salida a los checkpoints oficiales de Qwen 3, que sí han completado preentrenamiento y fases de ajuste con preferencias humanas.

## Limitaciones y advertencias

- Estado sin reentrenar: la model card avisa de «salidas defectuosas, bucles y comportamientos extraños»; el modelo no debe usarse en producción tal cual.
- Riesgo elevado de alucinación y degeneración: al no haber reentrenamiento ni ajuste con preferencias, la coherencia a medio y largo plazo no está garantizada.
- Idioma: solo se declara inglés; no hay soporte multilingüe documentado.
- Sesgos: no disponibles. No se ha publicado ninguna evaluación de sesgos, toxicidad o seguridad para este checkpoint.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre conservando el aviso de licencia y las atribuciones; al derivar de Qwen3-0.6B conviene revisar también las condiciones del modelo base original.
- Contexto: la ventana declarada de 40.960 tokens no implica buen rendimiento en contextos largos; con los pesos actuales no hay evidencia de que la atención se comporte correctamente más allá de las longitudes vistas durante el preentrenamiento de la base.
- Compatibilidad declarada por el autor: las afirmaciones de soporte nativo en vLLM, SGLang y Ollama proceden de la model card y no se han verificado de forma independiente.
- Madurez del repositorio: cero descargas y cero «likes» en el momento de redactar esta ficha, sin comunidad que haya validado su comportamiento.
- Ausencia de datos de evaluación: no hay benchmarks, por lo que cualquier decisión de adopción debería apoyarse en una evaluación propia.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/DrRiceIO7/Franken-MoE-Small-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en los resultados de búsqueda web disponibles; los resultados devueltos correspondían al estándar MIAPPE sobre fenotipado de plantas y no guardan relación con este modelo.
