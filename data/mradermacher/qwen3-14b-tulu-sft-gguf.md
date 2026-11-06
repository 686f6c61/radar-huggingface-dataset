# mradermacher/Qwen3-14B-Tulu-SFT-GGUF

## Resumen

Qwen3-14B-Tulu-SFT-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo Rexhaif/Qwen3-14B-Tulu-SFT, publicada por el usuario mradermacher. El modelo subyacente parte de la familia Qwen3 de Alibaba (14 768 307 200 parámetros, aproximadamente 14,8 mil millones) y ha sido ajustado mediante supervisión fina (SFT) sobre el dataset Tulu, un corpus abierto de instrucciones y conversaciones de alta calidad desarrollado por el Allen Institute for AI. El resultado es un modelo orientado a diálogo e instrucciones, etiquetado como "conversational" en Hugging Face.

La relevancia de esta ficha reside en que mradermacher ofrece el modelo en once niveles de cuantización GGUF (desde Q2_K hasta Q8_0), lo que permite ejecutarlo en hardware de consumo con llama.cpp, Ollama o interfaces compatibles, sin necesidad de GPUs de centro de datos. El repositorio ocupa 102 GB en total, aunque cada archivo individual pesa entre 5,9 GB y 15,8 GB.

No obstante, la información pública es limitada: la model card del cuantizador es genérica y no documenta el proceso de entrenamiento del modelo base, los datos exactos del SFT de Tulu ni los resultados de benchmarks. La licencia no está declarada en los metadatos de Hugging Face, lo que constituye una advertencia importante para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-14B; detalles específicos no disponibles) |
| Parámetros totales | 14 768 307 200 (14,8 B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Modelo base | Rexhaif/Qwen3-14B-Tulu-SFT |
| Tamaño del repositorio | 102,0 GB |
| Librería declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste supervisado (SFT) de Qwen3-14B, un transformer decoder-only de la familia Qwen3. El ajuste se realizó sobre el dataset Tulu, un corpus abierto de instrucciones, razonamiento y conversaciones multi-turno creado por AI2, que combina datos de tareas diversas con anotaciones de alta calidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales.

Las cuantizaciones publicadas por mradermacher son estáticas (no ponderadas ni con imatrix), generadas con llama.cpp. El autor indica explícitamente que las cuantizaciones ponderadas o con imatrix no están disponibles por el momento. La cuantización Q4_K_M (9,1 GB) y Q4_K_S (8,7 GB) están marcadas como "fast, recommended", mientras que Q8_0 (15,8 GB) se etiqueta como "fast, best quality" y Q6_K (12,2 GB) como "very good quality". No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés, gracias al ajuste SFT sobre Tulu.
- Razonamiento multi-turno y seguimiento de instrucciones complejas, derivado del entrenamiento conversacional.
- Capacidad de razonamiento y matemáticas heredada de Qwen3-14B (no verificada con benchmarks en esta ficha).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el ajuste Tulu está orientado a tareas agénticas.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Modo "thinking": no disponible en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Asistente conversacional en inglés para atención al cliente: el ajuste SFT sobre Tulu permite mantener diálogos multi-turno con instrucciones claras; la cuantización Q4_K_M (9,1 GB) cabe en GPUs de consumo y ofrece latencia adecuada para chat en tiempo real.
- Generación de respuestas a instrucciones en entornos de escritorio: con Q4_K_S (8,7 GB) se puede desplegar en llama.cpp u Ollama en una RTX 4090 (24 GB) dejando margen para contexto, sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones de IA: al estar disponible en GGUF, se integra con frameworks como llama-cpp-python o Ollama para validar flujos conversacionales antes de escalar a modelos mayores.
- Evaluación de calidad de cuantizaciones: el repositorio ofrece once niveles, lo que permite comparar el impacto de la cuantización en la calidad de las respuestas para un mismo prompt, útil en investigación sobre compresión de modelos.
- Despliegue en hardware con VRAM limitada: Q2_K (5,9 GB) y Q3_K_S (6,8 GB) permiten ejecutar el modelo en GPUs de 8 GB, aunque con pérdida de calidad documentada por el autor ("lower quality" en Q3_K_M).
- Fine-tuning posterior o experimentación académica: al ser un ajuste SFT abierto sobre Qwen3-14B, sirve como punto de partida para estudiar el efecto del dataset Tulu en modelos de 14B, siempre que la licencia lo permita (no declarada).
- Servicio de inferencia en inglés con requisitos de privacidad: al ejecutarse localmente en GGUF, los datos no salen del entorno del usuario, adecuado para prototipos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K (5,9 GB): ~6-7 GB de VRAM.
  - Q3_K_S (6,8 GB) / Q3_K_M (7,4 GB) / Q3_K_L (8,0 GB): ~7-9 GB.
  - IQ4_XS (8,3 GB) / Q4_K_S (8,7 GB) / Q4_K_M (9,1 GB): ~9-10 GB.
  - Q5_K_S (10,4 GB) / Q5_K_M (10,6 GB): ~11-12 GB.
  - Q6_K (12,2 GB): ~13 GB.
  - Q8_0 (15,8 GB): ~16-17 GB.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q8_0, Q6_K y Q5_K_M con contexto amplio.
  - RTX 4080 / 4070 Ti (16 GB): Q5_K_M, Q5_K_S, Q4_K_M.
  - RTX 4060 Ti 16 GB: Q4_K_M y Q5_K_S.
  - RTX 3060 12 GB / RTX 4070 (12 GB): Q4_K_M, Q4_K_S, IQ4_XS.
  - GPUs de 8 GB (RTX 3070, RTX 4060): Q2_K y Q3_K_S, con posible offload parcial a CPU.
  - A100 / H100: sobradas para Q8_0 con contexto largo, aunque el modelo no está optimizado para despliegue en centro de datos.
- ¿Cabe en GPU de consumo? Sí, todas las cuantizaciones caben en GPUs de consumo de 8 GB o más, salvo Q8_0 que requiere ~16 GB.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores conviene usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-14B-Tulu-SFT-GGUF (este) | 14,8 B | no disponible | no disponible | GGUF (11 cuantizaciones) | Hugging Face, 82 descargas |
| Rexhaif/Qwen3-14B-Tulu-SFT (base) | 14,8 B | no disponible | no disponible | safetensors | Hugging Face |
| Qwen3-14B (original de Alibaba) | 14,8 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF (comunidad) | Hugging Face, ampliamente usado |

La comparación con alternativas de la misma categoría (por ejemplo, Llama-3.1-8B-Instruct o Mistral-7B-Instruct) no se puede realizar con rigor porque no se dispone de datos de benchmarks ni de contexto para este modelo. Se indica "no disponible" para cualquier comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: los metadatos de Hugging Face no especifican licencia, lo que impide confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor o consultar el modelo base antes de usarlo en producción.
- Idioma limitado al inglés: los metadatos declaran únicamente `en`; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos de 14B ajustados por SFT; no se han publicado evaluaciones de fidelidad.
- Sesgos: no documentados por el autor; el dataset Tulu puede introducir sesgos propios de sus fuentes.
- Cuantizaciones de baja calidad: el propio autor marca Q3_K_M como "lower quality"; Q2_K y Q3_K_S pueden degradar notablemente el rendimiento en tareas de razonamiento.
- Sin cuantizaciones imatrix: el autor indica que no están disponibles, por lo que no se puede aprovechar la mejora de calidad que ofrecen frente a las estáticas.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que limita la planificación de despliegues con ventanas largas.
- Repositorio de 102 GB: la descarga completa es costosa; conviene descargar solo la cuantización necesaria.
- Modelo derivado: cualquier problema de calidad del ajuste SFT original (Rexhaif/Qwen3-14B-Tulu-SFT) se hereda en estas cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-14B-Tulu-SFT-GGUF
- Modelo base: https://huggingface.co/Rexhaif/Qwen3-14B-Tulu-SFT
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3-14B-Tulu-SFT-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
