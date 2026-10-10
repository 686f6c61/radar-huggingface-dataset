# ramachetan22/MyGemmaNPC

## Resumen

MyGemmaNPC es un ajuste fino (fine-tune) del modelo google/gemma-3-270m-it, publicado por el usuario ramachetan22 en Hugging Face. Se trata de un modelo de generación de texto decoder-only con 268 098 176 parámetros (268 M), pesos en safetensors y entrenamiento mediante SFT (supervised fine-tuning) con la librería TRL. Por el nombre del repositorio y la ausencia de documentación adicional, su propósito parece ser el de actuar como motor de diálogo de un personaje no jugador (NPC) o chatbot de rol.

El modelo hereda la arquitectura y el tokenizador de la familia Gemma 3 en su variante de 270 M de parámetros: aproximadamente 100 M de parámetros en las capas del transformer y unos 170 M en la matriz de embeddings, con un vocabulario de 262 000 tokens y una ventana de contexto de 32 768 tokens según la documentación pública del modelo base. Está diseñado, por tanto, para inferencia en hardware muy limitado: CPU, dispositivos móviles, placas tipo Raspberry Pi o GPUs de gama baja.

Su relevancia es acotada pero ilustrativa: demuestra el flujo estándar de especialización de un modelo pequeño con TRL para una tarea conversacional concreta. No obstante, la model card no documenta el conjunto de datos de entrenamiento, no publica evaluaciones, no especifica licencia ni idiomas, y el repositorio registraba 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un experimento sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`), ajustado con SFT |
| Parámetros totales | 268 098 176 (268 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens según la documentación del modelo base; no confirmado para este fine-tune |
| Tipos de cuantización | No disponible en el repositorio (solo safetensors; no se publican GGUF ni variantes QAT propias) |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base declara soporte multilingüe) |
| Licencia | No disponible; la model card incluye un campo `licence: license` sin contenido y no se indica licencia efectiva |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Gemma 3, identificado en las etiquetas como `gemma3_text`, lo que implica que este fine-tune trabaja únicamente con entrada de texto (las capacidades multimodales de Gemma 3 no están presentes en la variante de 270 M). La familia Gemma 3 emplea normalización RMSNorm, embeddings rotatorios (RoPE) y un esquema de atención intercalada local/global con ventana deslizante; los detalles concretos de configuración de capas, cabezas y ventana para esta variante no se incluyen en la información proporcionada.

El entrenamiento se realizó con SFT usando TRL 1.15.0, Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2. No se especifican el conjunto de datos, el número de tokens vistos, el número de épocas, la composición del corpus ni si se aplicaron técnicas adicionales como DPO o RLHF. El repositorio ocupa 2,2 GB, muy por encima de los ~0,54 GB que ocuparían los pesos en precisión de 16 bits, lo que sugiere la presencia de estados del optimizador y, por tanto, un ajuste completo en lugar de LoRA; se trata de un indicio, no de un dato confirmado en la model card.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones en formato chat (la model card usa `pipeline("text-generation")` con mensajes con rol `user`).
- Diálogo multi-turno como personaje o NPC, presumiblemente el objetivo del ajuste.
- Razonamiento básico y coherencia a corta distancia, limitados por el tamaño del modelo (268 M de parámetros, de los cuales ~170 M corresponden a embeddings).
- Soporte de *tool calling* / *function calling*: no documentado; no hay evidencia de que se haya entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles; la variante `gemma3_text` no procesa imágenes ni audio.
- Integración declarada con `text-generation-inference` y compatibilidad con *endpoints* según las etiquetas del repositorio.

## Casos de uso

- Diálogo de NPC en videojuegos: el modelo puede ejecutarse localmente en la máquina del jugador o en un servidor sin GPU dedicada, generando respuestas de personaje con un coste de cómputo mínimo gracias a sus 268 M de parámetros.
- Prototipado de asistentes conversacionales sin conexión: al ocupar menos de 1 GB en precisión de 16 bits, es viable desplegarlo en dispositivos *edge* (Raspberry Pi, mini-PC, móvil) para demos de asistente con datos que no salen del dispositivo.
- Instalaciones interactivas y museos: personajes con guion abierto que deben funcionar de forma autónoma y con presupuesto de hardware reducido, donde un modelo mayor no sería económicamente viable.
- Generación de diálogo sintético para aumentar corpus de sistemas de diálogo: el modelo puede producir variantes de réplica que después se filtran manualmente o con un modelo mayor, siempre que se asuma su menor calidad.
- Base para un ajuste adicional específico de dominio: al ser un fine-tune pequeño sobre Gemma 3 270M, sirve como punto de partida barato para especializar aún más el estilo (por ejemplo, atención al cliente de un producto concreto) con pocos recursos.
- Pruebas de infraestructura de despliegue: por su tamaño reducido es útil para validar pipelines con vLLM, TGI, transformers u Ollama antes de escalar a modelos mayores, midiendo latencia y consumo reales.
- Clasificación o enrutado de intenciones conversacionales: tras un ajuste adicional con etiquetas, puede utilizarse como clasificador ligero de intenciones en un sistema de diálogo mayor.
- Roleplay y entretenimiento conversacional: chat de personajes con contexto largo (hasta 32 768 tokens en el modelo base) para sesiones extensas de narrativa interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `ramachetan22/MyGemmaNPC` no incluye ninguna evaluación (MMLU, HumanEval, GSM8K, IFEval u otras), y tampoco se aportan métricas de pérdida de validación ni comparaciones con el modelo base o con el modelo instruct original. No se reproducen aquí cifras del modelo base porque no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,54 GB en FP16/BF16, 0,27 GB en INT8 y 0,14 GB en INT4 para los 268 M de parámetros.
- VRAM total en inferencia: del orden de 1-2 GB con contexto moderado, considerando pesos en FP16, caché KV y *overhead* del *runtime*; la estimación exacta de la caché KV para 32 768 tokens no está disponible porque no se publica la configuración de capas y cabezas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, así como en GPUs de portátil y en iGPUs modernas. No requiere A100 ni H100.
- Viabilidad en hardware de consumo: sí, en prácticamente cualquier GPU de consumo e incluso en CPU. También es candidato a ejecución en móvil o en placas de bajo consumo.
- Opciones de despliegue: `transformers` (formato nativo safetensors), Text Generation Inference (TGI, etiqueta `text-generation-inference` presente), vLLM, y previsiblemente llama.cpp u Ollama si se convierte a GGUF, aunque no se publican ficheros GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| ramachetan22/MyGemmaNPC | 268 M | 32 768 tokens (heredado del base) | No disponible | Hugging Face, solo safetensors | No disponibles |
| google/gemma-3-270m-it | 268 M | 32 768 tokens | Gemma Terms of Use | Hugging Face, variantes QAT int4 | No incluidos en la información proporcionada |
| Qwen/Qwen3-0.6B | ~0,6 B | 32 768 tokens | Apache-2.0 | Hugging Face | No incluidos en la información proporcionada |
| HuggingFaceTB/SmolLM2-360M-Instruct | 362 M | 8 192 tokens | Apache-2.0 | Hugging Face | No incluidos en la información proporcionada |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | 128 000 tokens | Llama 3.2 Community License | Hugging Face | No incluidos en la información proporcionada |

Los datos de contexto y licencia de los modelos alternativos corresponden a información pública de sus fabricantes; no se dispone de comparaciones de rendimiento medidas entre ellos y MyGemmaNPC.

## Limitaciones y advertencias

- Tamaño muy reducido: 268 M de parámetros, de los cuales alrededor de 170 M se destinan a la matriz de embeddings con vocabulario de 262 000 tokens. La capacidad efectiva de las capas del transformer es de unos 100 M, lo que limita el razonamiento complejo, la coherencia a larga distancia y la precisión factual.
- Riesgo elevado de alucinación: un modelo de este tamaño no mantiene consistencia factual fiable y puede inventar datos con aparente seguridad, especialmente fuera del dominio del ajuste.
- Sin evaluación publicada: no hay métricas que permitan estimar la calidad del ajuste ni compararlo con el modelo base o con el modelo instruct original.
- Procedencia de datos desconocida: no se documenta el corpus de SFT, por lo que no se puede evaluar el sesgo introducido ni el riesgo de memorización de datos personales o con derechos de autor.
- Licencia no disponible: la model card contiene un campo de licencia vacío. El modelo base se distribuye bajo Gemma Terms of Use, que impone condiciones específicas de uso comercial y de redistribución; al no aclararse la licencia efectiva de este fine-tune, no se recomienda su uso en producción sin verificación previa con el autor.
- Idiomas no especificados: se desconoce si el ajuste conserva el multilingüismo del modelo base o si quedó restringido al idioma del corpus de entrenamiento.
- Contexto no verificado: la ventana de 32 768 tokens corresponde al modelo base; no hay confirmación de que este fine-tune la use de forma efectiva.
- Metadatos inconsistentes: el repositorio registra fechas de creación y actualización en 2026 y versiones de framework (Transformers 5.18.0, PyTorch 2.11.0, TRL 1.15.0) que no se corresponden con versiones estables públicas en el momento de la consulta, lo que apunta a un experimento informal y no revisado.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no existen informes de terceros sobre su comportamiento real.
- Uso comercial: no recomendado sin aclarar la licencia, tanto la del propio ajuste como las obligaciones derivadas de la licencia Gemma del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ramachetan22/MyGemmaNPC
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
