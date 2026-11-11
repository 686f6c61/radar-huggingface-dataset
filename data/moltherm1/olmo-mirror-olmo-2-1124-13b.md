# moltherm1/olmo-mirror-olmo-2-1124-13b

## Resumen

OLMo 2 13B es un modelo de lenguaje autoregresivo de tipo transformer desarrollado por el Allen Institute for AI (Ai2) dentro de la familia OLMo 2, que comprende variantes de 7B y 13B parámetros entrenadas con hasta 5 billones de tokens. El repositorio reseñado aquí (`moltherm1/olmo-mirror-olmo-2-1124-13b`) es un espejo no oficial del checkpoint base `allenai/OLMo-2-1124-13B`, publicado bajo licencia Apache 2.0 y con un tamaño de repositorio de 9,9 GB, lo que corresponde a los pesos en precisión de 16 bits.

El objetivo del proyecto OLMo es habilitar la ciencia de los modelos de lenguaje mediante la liberación completa de código, checkpoints intermedios, logs y detalles de entrenamiento, algo poco habitual en modelos de rendimiento comparable. La variante de 13B emplea 40 capas, un tamaño oculto de 5120 y 40 cabezas de atención, con una longitud de contexto de 4096 tokens y un entrenamiento sobre 5 billones de tokens del corpus Dolma (mezclas `olmo-mix-1124` y `dolmino-mix-1124`).

Es relevante ahora porque ofrece una alternativa totalmente abierta y reproducible a los modelos de peso abierto de Meta y Mistral en benchmarks académicos en inglés, y porque el ecosistema de checkpoints (base, SFT, DPO, Instruct con RLVR y modelo de recompensa) permite estudiar cada etapa del pipeline de alineamiento por separado. El presente repositorio es únicamente un espejo del checkpoint base, no una versión afinada para instrucciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (decoder-only) |
| Parámetros totales | 13B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | 8 bits vía bitsandbytes (soportado en la model card); otras cuantizaciones no disponibles en la información |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 9,9 GB; formato exacto no detallado en la información) |

Otros datos estructurales: 40 capas, tamaño oculto de 5120, 40 cabezas de atención y entrenamiento sobre 5 billones de tokens.

## Arquitectura y entrenamiento

OLMo 2 13B sigue una arquitectura transformer decoder-only estándar con 40 capas, dimensión oculta de 5120 y 40 cabezas de atención, con un contexto máximo de 4096 tokens. El modelo se entrena de forma autorregresiva sobre el corpus Dolma, en concreto sobre las mezclas de datos `allenai/olmo-mix-1124` y `allenai/dolmino-mix-1124`, acumulando 5 billones de tokens durante el preentrenamiento. La familia OLMo 2 se describe como entrenada con hasta 5T tokens y con un rendimiento a la par o superior a modelos totalmente abiertos de tamaño equivalente en benchmarks académicos en inglés.

El pipeline de alineamiento se publica por etapas: checkpoint base, SFT, DPO y modelos finales Instruct entrenados con RLVR (reinforcement learning with verifiable rewards), además de un modelo de recompensa (RM) compartido entre las variantes de 7B y 13B. Se liberan checkpoints intermedios con la convención de nombres `stepXXX-tokensYYYB` y variantes de model soup (`stage2-ingredientN-stepXXX-tokensYYYB`), lo que permite reproducir y auditar cada fase del entrenamiento. La información disponible no detalla innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en inglés: el checkpoint base está orientado a modelado de lenguaje y continuación de texto, no a diálogo instruido.
- Razonamiento y conocimiento académico en inglés, según la model card de la familia OLMo 2.
- Capacidad de fine-tuning: se documentan recetas de ajuste con el repositorio OLMo (`torchrun` con configuración de entrenamiento) y con AI2 Open Instruct.
- Carga de revisiones intermedias: es posible cargar checkpoints concretos mediante el parámetro `revision` de Hugging Face o listar todas las ramas con `list_repo_refs`.
- Cuantización de 8 bits con bitsandbytes para reducir requisitos de memoria, con la advertencia de que el modelo cuantizado es más sensible a tipos de datos y operaciones CUDA.
- Tool calling / function calling: no disponible en la información para el checkpoint base.
- Soporte de agentes y razonamiento multi-paso: no disponible para el checkpoint base (las variantes Instruct con RLVR no forman parte de este repositorio).
- Capacidades multilingües: limitadas al inglés según la metadata del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre preentrenamiento y reproducibilidad: cargar checkpoints intermedios (`stepXXX-tokensYYYB`) para estudiar la evolución de las capacidades del modelo a lo largo del entrenamiento, algo posible gracias a la publicación de revisiones y logs del proyecto OLMo.
- Fine-tuning específico de dominio en inglés: partir del checkpoint base y ajustar con las recetas del repositorio OLMo u Open Instruct para tareas como clasificación de texto, extracción de información o resumen, aprovechando la licencia Apache 2.0.
- Modelado de lenguaje y continuación de texto: usar la API estándar de `transformers` (`AutoModelForCausalLM`) para generación condicionada en inglés con `top_k`/`top_p`, tal como documenta la model card.
- Estudio del pipeline de alineamiento: comparar el checkpoint base con las variantes SFT, DPO e Instruct (RLVR) de Ai2 para analizar el efecto de cada etapa sobre el comportamiento del modelo.
- Evaluación académica comparativa: servir como referencia totalmente abierta frente a modelos de peso abierto de Meta y Mistral en benchmarks en inglés, con la ventaja de disponer de datos, código y checkpoints auditables.
- Despliegue con memoria reducida: cuantizar a 8 bits con bitsandbytes para ejecutar el modelo en GPUs con menos VRAM, pasando las entradas directamente a CUDA para evitar problemas de tipos.
- Base para destilación o generación de datos sintéticos en inglés: emplear el modelo para producir corpus etiquetados que alimenten modelos más pequeños, dado que la licencia permisiva no restringe el uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la familia OLMo 2 afirma que los modelos están a la par o por encima de modelos totalmente abiertos de tamaño equivalente y son competitivos con modelos de peso abierto de Meta y Mistral en benchmarks académicos en inglés, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otros) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 26 GB solo para pesos (13B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda disponer de 32 GB o más.
- VRAM estimada con cuantización de 8 bits: aproximadamente 13-14 GB para pesos, más overhead; viable en GPUs de 24 GB.
- GPUs recomendadas: A100 (40/80 GB) o H100 para FP16 sin compromisos; RTX 4090 (24 GB) para 8 bits o FP16 con cuidado.
- ¿Cabe en GPU de consumo? Sí, en 8 bits cabe en una RTX 4090 o RTX 3090 de 24 GB; en FP16 no cabe en GPUs de 16 GB.
- Opciones de despliegue: `transformers` (requiere instalar desde la rama principal de GitHub en la versión documentada), bitsandbytes para cuantización; el soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OLMo 2 13B (este espejo) | 13B | 4096 | Apache 2.0 | Pesos, checkpoints y código abiertos | Entrenado con 5T tokens; pipeline completo publicado |
| OLMo 2 7B | 7B | 4096 | Apache 2.0 | Pesos abiertos | Entrenado con 4T tokens; misma familia y pipeline |
| Modelos de peso abierto de Meta y Mistral (tamaño equivalente) | no disponible | no disponible | no disponible | Pesos abiertos | La model card los cita como referencia competitiva en benchmarks en inglés, sin cifras concretas |

No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Es un checkpoint base, no un modelo instruido: no está optimizado para seguir instrucciones ni para diálogo; para ello deben usarse las variantes SFT, DPO o Instruct de Ai2.
- Idioma: la metadata declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto limitado a 4096 tokens, inferior al de muchos modelos actuales, lo que restringe tareas de contexto largo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas para este checkpoint.
- Sesgos: no se detallan sesgos conocidos en la información disponible; al entrenarse sobre un corpus web (Dolma), es esperable que herede sesgos presentes en esos datos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones de los datasets de entrenamiento si redistribuye derivados.
- Este repositorio es un espejo no oficial de un tercero (`moltherm1`), con 0 descargas y 0 likes; para producción conviene referenciar el repositorio original `allenai/OLMo-2-1124-13B`.
- La cuantización de 8 bits puede introducir problemas de estabilidad numérica; la model card recomienda pasar las entradas directamente a CUDA.
- El soporte en `transformers` requiere, según la documentación, instalar desde la rama principal de GitHub en la versión indicada.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-2-1124-13b
- Modelo original base: https://huggingface.co/allenai/OLMo-2-1124-13B
- Modelo original 7B: https://huggingface.co/allenai/OLMo-2-1124-7B
- SFT 13B: https://huggingface.co/allenai/OLMo-2-1124-13B-SFT
- DPO 13B: https://huggingface.co/allenai/OLMo-2-1124-13B-DPO
- Instruct 13B (RLVR): https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct
- Modelo de recompensa 7B: https://huggingface.co/allenai/OLMo-2-1124-7B-RM
- Repositorio de código OLMo: https://github.com/allenai/OLMo
- Repositorio Open Instruct: https://github.com/allenai/open-instruct
- Artículo (arXiv): https://arxiv.org/abs/2501.00656
- Dataset olmo-mix-1124: https://huggingface.co/datasets/allenai/olmo-mix-1124
- Dataset dolmino-mix-1124: https://huggingface.co/datasets/allenai/dolmino-mix-1124
