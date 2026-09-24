# Dohyeon1/ERNIE-Sub-MoE-ngroups48-maxcls2

## Resumen

ERNIE-Sub-MoE-ngroups48-maxcls2 es un modelo de generación de texto publicado por el usuario Dohyeon1 (Dohyeon Kim) en Hugging Face, construido sobre la arquitectura ERNIE 4.5 en su variante de mezcla de expertos (MoE). El repositorio contiene 21.825.437.888 parámetros reales (unos 21,8 mil millones) en formato safetensors, con un tamano de repositorio de 43,7 GB, coherente con pesos en bf16/fp16. La nomenclatura del identificador (Sub-MoE, ngroups48, maxcls2) sugiere una intervención estructural sobre el modelo base: una subselección o subdivisión de expertos con 48 grupos y alguna variante de clasificación maximizada, más que un entrenamiento desde cero.

El modelo se etiqueta con el pipeline text-generation, la arquitectura ernie4_5_moe y el tag conversational, lo que indica que está orientado a generación de texto y diálogo multi-turno. No se ha publicado información sobre el proceso de entrenamiento, el dataset utilizado, los idiomas soportados ni la licencia, y la model card es la plantilla automática de Hugging Face sin rellenar. El repositorio no registra descargas ni "likes" en el momento de la consulta.

Por su naturaleza experimental y por la ausencia de documentación, esta ficha debe leerse como una caracterización técnica del artefacto publicado, no como una recomendación de uso en producción. Cualquier evaluación de calidad, sesgos o rendimiento queda pendiente de validación independiente por parte de quien lo despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tag de arquitectura `ernie4_5_moe` |
| Parámetros totales | 21.825.437.888 (21,8 mil millones), según safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible para esta variante; la variante hermana `Dohyeon1/ERNIE-Sub-MoE-ngroups48-adaptive` aparece listada con 32.768 tokens |
| Tipos de cuantización | no disponible oficialmente; al ser safetensors es convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 43,7 GB) |
| Librería | transformers |
| Pipeline | text-generation |
| Fecha de creación | 2026-09-23 |
| Última actualización | 2026-09-23 |

## Arquitectura y entrenamiento

El tag `ernie4_5_moe` sitúa el modelo dentro de la familia ERNIE 4.5 de Baidu, que emplea una arquitectura transformer con capas de mezcla de expertos (MoE), donde cada token se enruta hacia un subconjunto de expertos en lugar de activar la totalidad de los parámetros. El identificador del repositorio añade el prefijo Sub-MoE junto a `ngroups48` y `maxcls2`, lo que apunta a una modificación experimental sobre el modelo base: agrupación de expertos en 48 grupos y, presumiblemente, una variante de enrutamiento o de clasificación distinta respecto a la versión `adaptive` del mismo autor.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni sobre hiperparámetros de entrenamiento o fine-tuning. Tampoco se documenta ninguna innovación técnica propia más allá de la modificación estructural que sugiere el nombre. La model card es la plantilla automática de Hugging Face con todos los campos marcados como "More Information Needed", por lo que no es posible confirmar si se trata de un fine-tuning, de un recorte (pruning) de expertos sobre ERNIE 4.5 o de una inicialización aleatoria parcial.

## Capacidades

- Generación de texto autoregresiva, según declara el pipeline `text-generation`.
- Diálogo conversacional multi-turno, según el tag `conversational`.
- Compatibilidad con el ecosistema transformers y con endpoints compatibles (`endpoints_compatible`), lo que facilita su despliegue mediante APIs compatibles con OpenAI.
- Soporte de tool calling / function calling: no disponible; no hay evidencia documentada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia documentada.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible. Aunque la familia ERNIE 4.5 incluye variantes multimodales, este repositorio concreto se declara únicamente como text-generation y no incluye torre de visión en sus tags.

## Casos de uso

- Prototipado e investigación sobre enrutamiento MoE: dado que el modelo parece ser una variante experimental con 48 grupos de expertos, resulta adecuado para estudiar cómo afecta la agrupación de expertos a la calidad de generación frente al modelo base, siempre que el usuario documente su propia evaluación.
- Generación de texto conversacional en entornos de prueba: el tag `conversational` permite usarlo como chatbot de laboratorio para validar plantillas de prompt y pipelines de inferencia antes de adoptar un modelo con licencia clara.
- Despliegue en infraestructura con endpoints compatibles: al estar marcado como `endpoints_compatible`, puede servirse a través de APIs compatibles con el formato OpenAI para probar integraciones de cliente sin reescribir código.
- Base para fine-tuning posterior: sus 21,8 mil millones de parámetros en safetensors permiten aplicar LoRA o QLoRA sobre dominios concretos (legal, sanitario, atención al cliente) si el usuario asume la incertidumbre sobre la licencia.
- Evaluación comparativa de arquitecturas MoE: útil como punto de comparación en estudios de eficiencia entre modelos densos de ~20B y MoE de tamaño similar.
- Generación de texto de propósito general con requisitos bajos de contexto: para tareas de resumen, reescritura o clasificación generativa donde no se necesiten ventanas largas verificadas.
- Reproducción de experimentos del autor: el mismo perfil publica otras variantes (`ERNIE-Sub-MoE-ngroups48-adaptive`, `OLMoE-Sub-MoE-fix-ngroups48`), lo que permite reproducir y comparar las distintas configuraciones dentro de una misma línea de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos completos: aproximadamente 43,7 GB en bf16/fp16 (coincide con el tamano del repositorio) y unos 87 GB en fp32.
- VRAM estimada con cuantización: alrededor de 22 GB en int8/FP8 y entre 11 y 13 GB en 4 bits.
- GPU recomendadas para pesos completos: A100 80 GB, H100 80 GB o dos GPU de 48 GB con paralelismo de tensor. En una única RTX 4090 (24 GB) no caben los pesos sin cuantizar.
- GPU de consumo: una RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) puede ejecutar el modelo cuantizado a 4 bits, con posible descarga de expertos a CPU si la VRAM se agota. En GPUs de 16 GB o menos, se requiere cuantización agresiva y offloading parcial.
- Opciones de despliegue: transformers para inferencia directa; llama.cpp u Ollama si se convierte a GGUF; vLLM o TGI si la arquitectura `ernie4_5_moe` está soportada por esas librerías en la versión utilizada; endpoints compatibles con OpenAI para servir vía API.
- Latencia y throughput: no disponibles. Al ser un MoE, el coste de cómputo por token depende del número de parámetros activos, dato que no se ha publicado; el coste de memoria, en cambio, viene determinado por los 21,8 mil millones de parámetros totales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Dohyeon1/ERNIE-Sub-MoE-ngroups48-maxcls2 | 21,8 B | no disponible | no disponible | Hugging Face, 0 descargas | Objeto de esta ficha |
| Dohyeon1/ERNIE-Sub-MoE-ngroups48-adaptive | 21 B (según listado de terceros) | 32.768 tokens (según listado de terceros) | no disponible | Hugging Face; también listado en featherless.ai y FriendliAI | Variante hermana del mismo autor, presumiblemente con enrutamiento adaptativo |
| Dohyeon1/OLMoE-Sub-MoE-fix-ngroups48 | 7 B (según listado de terceros) | no disponible | no disponible | Hugging Face | Misma línea experimental sobre OLMoE, con 48 grupos |
| ERNIE 4.5 (modelo base de la familia) | no disponible para la variante exacta | no disponible | no disponible en la información proporcionada | Hugging Face / Baidu | Familia de origen según el tag de arquitectura; no confirmado como base directa |

No se dispone de datos de rendimiento (MMLU, HumanEval, GSM8K u otros) de ninguno de los modelos comparados en la información proporcionada, por lo que la comparación se limita a parámetros, contexto declarado y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin rellenar, por lo que se desconocen el dataset, el proceso de entrenamiento y las evaluaciones realizadas.
- Licencia no especificada: sin licencia declarada, no se puede asumir permiso para uso comercial. Cualquier despliegue en producción debería aclarar antes los términos con el autor.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en ningún otro idioma concreto.
- Riesgo de alucinación: no cuantificado. Al no existir evaluación publicada, no hay medidas de fidelidad factual ni de tasas de error.
- Sesgos: no documentados. Se desconoce la composición del corpus de entrenamiento y, por tanto, los sesgos potenciales de género, raza, idioma o ideología.
- Naturaleza experimental: el nombre del repositorio indica una modificación estructural (sub-MoE, 48 grupos, maxcls2) que puede degradar la calidad respecto al modelo base. No hay comparación publicada con su predecesor.
- Cero adopción registrada: 0 descargas y 0 "likes" implican ausencia de validación por parte de la comunidad y de informes de errores.
- Compatibilidad incierta: aunque la librería declarada es transformers, el soporte efectivo de la arquitectura `ernie4_5_moe` depende de la versión instalada; conviene verificar la versión mínima antes de cargar los pesos.
- Consumo de memoria elevado: 43,7 GB de pesos en precisión completa exigen GPUs de gama alta o cuantización, lo que limita su uso en hardware de consumo.
- Fecha de creación anómala: el repositorio figura creado el 2026-09-23, una fecha futura respecto al momento habitual de consulta, dato que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dohyeon1/ERNIE-Sub-MoE-ngroups48-maxcls2
- Variante hermana: https://huggingface.co/Dohyeon1/ERNIE-Sub-MoE-ngroups48-adaptive
- Ficha de la variante hermana en featherless.ai: https://featherless.ai/models/Dohyeon1/ERNIE-Sub-MoE-ngroups48-adaptive
- Ficha de la variante hermana en FriendliAI: https://friendli.ai/models/Dohyeon1/ERNIE-Sub-MoE-ngroups48-adaptive
- Perfil del autor en Hugging Face: https://huggingface.co/Dohyeon1
- Otra variante del autor (OLMoE): https://huggingface.co/Dohyeon1/OLMoE-Sub-MoE-fix-ngroups48
- Referencia del tag arXiv 1910.09700 (Lacoste et al., 2019, sobre emisiones de carbono en aprendizaje automático): https://arxiv.org/abs/1910.09700
