# sartajbhuvaji/GLM-4.6-Flash-text

## Resumen

GLM-4.6-Flash-text es una derivación del modelo multimodal zai-org/GLM-4.6V-Flash en la que se ha eliminado por completo la torre de visión. Lo publica el usuario sartajbhuvaji bajo licencia MIT y no implica reentrenamiento, destilación ni ajuste fino: se han borrado los 181 tensores del stack visual y los 523 restantes se han reetiquetado sobre la clase `Glm4ForCausalLM` de transformers. El resultado es un modelo de lenguaje puro de 9.400.279.040 parámetros (frente a los 10.292.777.472 del original), con 523 tensores y 18,80 GB en bf16.

La relevancia de esta variante no está en el tamaño —la visión suponía solo el 8,671 % del checkpoint, 1,785 GB— sino en el ahorro de VRAM que se consigue al servir el modelo con vLLM. Al desaparecer la ruta multimodal, vLLM deja de perfilar el codificador visual y el pico de activación cae de 4,82 GiB a 0,21 GiB, lo que libera espacio para caché KV: en una A100-SXM4-40GB con `--max-model-len 32768` la caché disponible pasa de 11,85 GiB a 18,28 GiB y la concurrencia máxima a 32k de contexto sube de 9,48× a 14,63×. El autor verifica además que la ruta de texto es bit-idéntica al original (divergencia máxima de logits 0.000e+00 en prompts cortos y a 1.207 tokens), lo que convierte a este checkpoint en una opción práctica para despliegues text-only sobre GLM-4.6V-Flash.

El modelo conserva el decodificador GLM-4 estándar: 40 capas, 4.096 de dimensión oculta, GQA 16:1 y un contexto máximo de 131.072 posiciones. Está pensado para quien quiera el comportamiento del modelo base sin pagar el coste de memoria del stack visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GLM-4 (`Glm4ForCausalLM`); derivado de `Glm4vForConditionalGeneration` sin la torre de visión |
| Parametros totales | 9.400.279.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 posiciones máximas según configuración del decoder; el autor sirve con `--max-model-len 32768` en vLLM |
| Tipos de cuantizacion | bf16 (referencia), F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, 4 shards) y GGUF |
| Capas | 40 |
| Dimension oculta | 4.096 |
| Dimension intermedia | 13.696 |
| Cabezas de atencion | 32 cabezas, 2 KV heads (GQA 16:1) |
| Vocabulario | 151.552 |
| Tensores | 523 (frente a 704 del original) |
| Tamano en bf16 | 18,80 GB (original: 20,59 GB) |
| Parametros eliminados | 892.498.432 (8,671 % del modelo, 1,785 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-4.6V-Flash es un transformer multimodal con una torre de visión "atornillada": un ViT de 24 capas y 1.536 dimensiones con 12 cabezas que inyecta tokens suaves en el flujo de embeddings del decoder mediante `masked_scatter`. Los tokens de texto nunca atraviesan pesos visuales, de modo que eliminar la rama equivale a quitar una arista del grafo de cómputo sin alterar el cálculo textual. Esta variante no aplica ningún entrenamiento adicional: es una poda estructural pura sobre el checkpoint publicado.

Los componentes visuales eliminados suman 892.498.432 parámetros: `visual.blocks.0–23` (679.550.976), `visual.merger` (185.081.856), `visual.downsample` (25.169.920), `visual.patch_embed.proj` (1.807.872), `visual.embeddings.position_embedding` (884.736) y dos layernorms (3.072). El decodificador restante mantiene 40 capas, 4.096 de dimensión oculta, 13.696 intermedios, 32 cabezas de atención con 2 KV heads (GQA 16:1), vocabulario de 151.552 y `lm_head` sin atar.

La innovación técnica destacable es la verificación de que el mRoPE multimodal (`mrope_section: [8, 12, 12]`, que suma 32 = `head_dim 128 × partial_rotary_factor 0.5 ÷ 2`) colapsa limpiamente a RoPE estándar cuando las tres secciones reciben el mismo índice de posición, como ocurre en entrada puramente textual. El autor lo comprueba empíricamente comparando logits contra el original: coincidencia exacta en seis prompts cortos y divergencia 0.000e+00 a 1.207 tokens de longitud. No se documentan datos de entrenamiento, composición del dataset ni fases de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés y chino, heredada del decoder GLM-4.6V-Flash.
- Razonamiento y matemáticas de nivel general, con el mismo comportamiento que la ruta de texto del modelo original.
- Generación de código (el autor verifica continuaciones sobre `def fibonacci(n):` con coincidencia exacta respecto al original).
- Traducción entre idiomas (verificado en el prompt de traducción a alemán del conjunto de comprobación).
- Procesamiento de contexto largo: hasta 131.072 posiciones configuradas, con verificación de coherencia a 1.207 tokens.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Sin capacidades de visión: la entrada de imágenes ha sido eliminada por completo.
- No se documenta soporte explícito de tool calling, function calling ni modos de agente multi-paso en la información disponible.

## Casos de uso

- Servicio de chat de alto rendimiento en una sola GPU: con vLLM sobre una A100-SXM4-40GB a 32k de contexto, el modelo alcanza una concurrencia máxima de 14,63× frente a 9,48× del original, gracias a los 18,28 GiB de caché KV disponibles. Adecuado para atender muchas sesiones simultáneas en una única tarjeta.
- Sustitución directa del modelo base en pipelines text-only: al ser la ruta de texto bit-idéntica, cualquier aplicación que ya use GLM-4.6V-Flash solo con texto puede migrar sin cambios de comportamiento y con menor consumo de VRAM.
- Despliegue en local con llama.cpp u Ollama: las cuantizaciones GGUF Q4_K_M (6,17 GB) y Q5_K_M (7,05 GB) permiten ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM, manteniendo coherencia de generación según el autor.
- Procesamiento de documentos largos en inglés o chino: el contexto de 131.072 posiciones permite resumir, extraer información o responder preguntas sobre contratos, informes o transcripciones extensas en una sola pasada.
- Generación y revisión de código en inglés: útil en asistentes de IDE o pipelines de CI/CD donde solo se necesita la faceta textual, sin cargar el codificador visual ni su caché de 66.242 tokens.
- Backend de traducción en/zh: el modelo cubre ambos idiomas de forma nativa y puede servir como motor de traducción en aplicaciones de documentación técnica o soporte multilingüe limitado a esos dos idiomas.
- Entornos con arranque rápido: el tiempo de inicialización del motor cae de 116 s a 11 s en vLLM, lo que resulta práctico para despliegues efímeros, pruebas automatizadas o escalado elástico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de servicio y verificación de equivalencia:

| Metrica | Original | Este modelo | Delta |
|---|---|---|---|
| Pesos en VRAM | 19,29 GiB | 17,56 GiB | −1,73 GiB (−9,0 %) |
| Cache KV disponible | 11,85 GiB | 18,28 GiB | +6,43 GiB (+54,3 %) |
| Tokens en cache KV | 310.512 | 479.280 | +168.768 (+54,4 %) |
| Concurrencia maxima a 32k | 9,48× | 14,63× | +54,3 % |
| Inicializacion del motor | 116 s | 11 s | −105 s |
| Pico de activacion | 4,82 GiB | 0,21 GiB | −4,61 GiB |
| Grafo CUDA | 0,67 GiB | 0,65 GiB | −0,02 GiB |

| Verificacion de logits | Resultado |
|---|---|
| Prompts cortos (6 casos) | max\|d\| = 0.000e+00, argmax match |
| Contexto largo (1.207 tokens) | max\|d\| = 0.000e+00 |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 17,56 GiB de pesos según la medición del autor en vLLM, más overhead de activaciones (0,21 GiB de pico) y grafo CUDA (0,65 GiB).
- VRAM para GGUF: Q8_0 requiere unos 10,00 GB, Q6_K unos 8,27 GB, Q5_K_M unos 7,05 GB y Q4_K_M unos 6,17 GB.
- GPU recomendadas: A100-SXM4-40GB es la configuración validada por el autor con vLLM 0.27.1; para bf16 se necesita una GPU con al menos 24 GB (RTX 3090/4090, L4, L40S, A10G) o superior.
- GPU de consumo: sí cabe en tarjetas de 8-12 GB usando GGUF Q4_K_M o Q5_K_M con llama.cpp u Ollama; en bf16 no cabe en GPUs de 16 GB.
- Opciones de despliegue: vLLM (validado), llama.cpp (las cinco GGUF cargan y generan de forma coherente según el autor), Ollama y cualquier runtime compatible con safetensors de transformers.
- Latencia y throughput: no se publican cifras de tokens por segundo; solo se reporta la concurrencia máxima relativa (14,63× a 32k de contexto) y el tiempo de inicialización del motor (11 s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.6-Flash-text (este) | 9,40 B | 131.072 | No | MIT | Hugging Face, GGUF |
| zai-org/GLM-4.6V-Flash (base) | 10,29 B | 131.072 | Si | no disponible en la información | Hugging Face |
| Alternativas de ~9-10 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es contra el modelo base: este checkpoint reduce parámetros un 8,671 %, libera 1,73 GiB de pesos y multiplica por 1,54 la concurrencia a 32k en vLLM, a cambio de perder por completo la entrada de imágenes. Frente a un despliegue del original ya configurado con `--limit-mm-per-prompt '{"video": 0}'`, la ganancia de concurrencia baja al 16 %, aunque se mantiene la ventaja de los 1,73 GiB de pesos liberados y una configuración sin parámetros multimodales.

## Limitaciones y advertencias

- Pérdida total de capacidades de visión: no acepta imágenes ni vídeo; cualquier caso de uso multimodal requiere el modelo base.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano ni de otras lenguas.
- Riesgo de alucinación inherente al modelo base, no evaluado ni mitigado en esta derivación.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K u otros), por lo que el rendimiento real en tareas downstream no está cuantificado.
- La verificación de equivalencia se limita a seis prompts cortos y una secuencia de 1.207 tokens; no cubre el rango completo de 131.072 posiciones.
- En vLLM 0.27.1, desactivar ambas modalidades con `--limit-mm-per-prompt '{"video": 0, "image": 0}'` provoca un fallo (`AttributeError: 'NoneType' object has no attribute 'size'`); esta variante evita ese problema al no tener torre visual.
- La licencia MIT se aplica a esta derivación, pero conviene verificar las condiciones del modelo base zai-org/GLM-4.6V-Flash antes de un uso comercial.
- El repositorio ocupa 69,1 GB e incluye todos los formatos; conviene descargar solo los ficheros necesarios.
- Modelo publicado por un autor individual (sartajbhuvaji) con 2 likes y 1.050 descargas en el momento de la consulta; no cuenta con el respaldo del equipo original de Z.ai.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sartajbhuvaji/GLM-4.6-Flash-text
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Diagrama de arquitectura referenciado en la model card: `architecture.svg` (incluido en el repositorio)
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.
