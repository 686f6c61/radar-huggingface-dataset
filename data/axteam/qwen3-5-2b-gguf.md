# axteam/Qwen3.5-2B-GGUF

## Resumen

Qwen3.5-2B-GGUF es una compilación de cuantizaciones en formato GGUF del modelo Qwen/Qwen3.5-2B, publicada por el usuario axteam. El modelo base pertenece a la familia Qwen3.5 del equipo Qwen (Alibaba) y cuenta con 1.942.653.248 parámetros totales (aproximadamente 1,94 mil millones), lo que lo sitúa en la categoría de modelos pequeños orientados a inferencia local. Esta versión GGUF está pensada específicamente para su uso con llama.cpp, Ollama y LM Studio, e incorpora la plantilla de chat original del modelo.

La relevancia de esta ficha radica en que permite ejecutar un modelo de la generación Qwen3.5 en hardware de consumo, algo imposible con los pesos en BF16 originales. El repositorio incluye únicamente dos cuantizaciones: Q4_K_M (1,3 GB) y Q8_0 (2,1 GB), ambas generadas mediante cuantización post-entrenamiento (PTQ) con las herramientas de llama.cpp, sin reentrenamiento.

Es importante señalar que estos archivos GGUF contienen solo el backbone de texto: el codificador de visión del modelo original no está incluido (no hay archivo `mmproj`), por lo que la entrada se limita a texto. El repositorio ocupa 3,4 GB y acumula 880 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `qwen35` en llama.cpp), con capa de predicción multi-token (MTP) |
| Parametros totales | 1.942.653.248 (aprox. 1,94 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (4 bits, k-quant medium, 1,3 GB) y Q8_0 (8 bits, 2,1 GB) |
| Idiomas soportados | no disponible (la model card incluye ejemplos en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer de aproximadamente 1,94 mil millones de parámetros. Según la model card de esta cuantización, la arquitectura identificada en llama.cpp es `qwen35` (soportada desde el build b7990) y los archivos GGUF incluyen además la capa de predicción multi-token (MTP) del modelo original, cuyo soporte en llama.cpp llega a partir del build b9180 (PR #22673). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio cuantizado no los detalla.

El proceso de esta publicación es exclusivamente de cuantización post-entrenamiento: los pesos BF16 se convierten con `convert_hf_to_gguf.py` y se cuantizan con `llama-quantize` de forma bloque a bloque (k-quants con escalas por bloque y asignación mixta de bits), sin reentrenamiento. La plantilla de chat original queda embebida en cada archivo. El autor midió la perplejidad en una NVIDIA B200 con llama.cpp b12005 (commit e0f142d, build CUDA), con todas las capas en GPU, sobre 16 ventanas de 2.048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano: Q8_0 obtiene 10,81 (inglés) y 8,45 (coreano), mientras que Q4_K_M obtiene 11,31 y 8,89, es decir, un incremento del 4,6 % y 5,2 % respectivamente respecto a Q8_0. El propio autor advierte que 16 ventanas es una muestra pequeña y que diferencias de pocos puntos porcentuales quedan dentro del ruido de muestreo.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida en los archivos GGUF.
- Razonamiento y respuesta a preguntas generales (verificado por el autor con preguntas sobre las capitales de Francia y Corea).
- Capacidad multilingüe: la model card incluye ejemplos y mediciones de perplejidad en inglés y coreano, aunque no se publica la lista oficial de idiomas soportados.
- Predicción multi-token (MTP) integrada en los archivos, utilizable en llama.cpp desde el build b9180.
- Compatibilidad con API compatible con OpenAI mediante `llama-server` (parámetro `--jinja` para aplicar la plantilla de chat).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Visión: no soportada en esta compilación (sin archivo `mmproj`; el codificador de visión no está incluido).
- Audio: no disponible.

## Casos de uso

- Asistente conversacional local: con Q4_K_M (1,3 GB) el modelo cabe en GPUs de consumo y puede servir un chatbot multi-turno mediante `llama-server` con API compatible con OpenAI, útil para prototipos sin depender de servicios en la nube.
- Generación de texto en el borde (edge): el tamaño reducido de los archivos permite desplegar el modelo en equipos con poca VRAM o incluso en CPU, para tareas de redacción, resumen o clasificación de texto en local.
- Procesamiento de texto en coreano e inglés: las mediciones de perplejidad del autor sobre Wikipedia en coreano (8,45 con Q8_0) y los ejemplos de la model card sugieren un uso razonable en aplicaciones bilingües inglés-coreano, siempre validando la calidad en el dominio concreto.
- Integración en pipelines de llama.cpp: la plantilla de chat embebida y el soporte de `--jinja` facilitan montar un endpoint local para pruebas de integración o evaluación automatizada de prompts.
- Evaluación y experimentación con cuantización: disponer de Q4_K_M y Q8_0 del mismo modelo permite comparar el impacto de la cuantización en la calidad (perplejidad) y en el consumo de memoria antes de fijar una configuración de producción.
- Despliegue con Ollama o LM Studio: la model card documenta `ollama run hf.co/axteam/Qwen3.5-2B-GGUF:Q4_K_M` y la búsqueda en LM Studio, lo que simplifica la prueba del modelo por parte de desarrolladores sin experiencia previa en llama.cpp (aunque el autor no ha verificado su funcionamiento en estas herramientas).
- Reducción de memoria en inferencia con contexto largo: el uso de `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce aproximadamente a la mitad la caché KV, lo que permite mantener contextos de varios miles de tokens en GPUs modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo publica mediciones de perplejidad de las cuantizaciones, no del modelo base frente a otros modelos:

| Archivo | WikiText-2 PPL | Wikipedia coreano PPL | vs Q8_0 (EN / KO) |
|---|---|---|---|
| Qwen3.5-2B-Q8_0.gguf | 10,81 | 8,45 | referencia |
| Qwen3.5-2B-Q4_K_M.gguf | 11,31 | 8,89 | +4,6 % / +5,2 % |

Medición realizada con llama.cpp b12005 (commit e0f142d, build CUDA) en una NVIDIA B200, 16 ventanas de 2.048 tokens, todas las capas en GPU. El autor advierte que la muestra es pequeña y que las diferencias de pocos puntos porcentuales están dentro del ruido de muestreo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo elegido más la caché KV del contexto configurado. Q4_K_M ocupa 1,3 GB y Q8_0 ocupa 2,1 GB de pesos.
- Caché KV: proporcional a `-c` (contexto). Con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` se reduce aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU con al menos ~2-3 GB de VRAM libre para Q4_K_M con contextos moderados; el autor verificó el funcionamiento en una NVIDIA B200, pero por tamaño el modelo es apto para GPUs de consumo (por ejemplo, RTX 3060, RTX 4060, RTX 4090), aunque no se publican mediciones de latencia ni throughput en estas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM usando Q4_K_M; también es viable en CPU, aunque no se aportan cifras de rendimiento.
- Opciones de despliegue: llama.cpp (build ≥ b9180, con `-fa on` desde b6325), `llama-server` con API compatible con OpenAI, `llama-cli`, Ollama y LM Studio (estas dos últimas no verificadas por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de comparativas publicadas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría (modelos de ~2 B de parámetros). A continuación se indican únicamente los datos estructurales conocidos de este modelo:

| Modelo | Parametros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Qwen3.5-2B (via axteam GGUF) | ~1,94 B | no disponible | Apache-2.0 | GGUF (Q4_K_M, Q8_0) |
| Alternativas de ~2 B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sin visión: estos GGUF no incluyen el codificador de visión ni el proyector `mmproj`; no es posible el procesamiento de imágenes ni OCR con estos archivos.
- Sin datos de benchmarks estándar: no se han publicado resultados de MMLU, HumanEval, GSM8K u otras evaluaciones, lo que impide estimar su calidad frente a alternativas sin evaluarlo uno mismo.
- Muestra de perplejidad pequeña: las mediciones del autor usan solo 16 ventanas de 2.048 tokens y él mismo advierte que diferencias de pocos puntos porcentuales quedan dentro del ruido de muestreo; no deben tomarse como una comparación fina entre cuantizaciones.
- Idiomas no documentados: la model card no publica la lista oficial de idiomas soportados; solo hay evidencia de inglés y coreano en los ejemplos y mediciones.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se han publicado evaluaciones de fidelidad ni de tasas de alucinación.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Compatibilidad estricta con llama.cpp: requiere build ≥ b9180 para cargar la capa MTP incluida; con versiones anteriores los archivos pueden no cargar correctamente.
- Ollama y LM Studio no verificados: el autor indica que no ha probado el funcionamiento en estas herramientas, aunque documenta los comandos.
- Licencia: Apache-2.0, permisiva para uso comercial, heredada del modelo base; los pesos y el tokenizador originales pertenecen al equipo Qwen (Alibaba).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- llama.cpp (PR de soporte MTP #22673, build ≥ b9180): no disponible como enlace directo en la información proporcionada
