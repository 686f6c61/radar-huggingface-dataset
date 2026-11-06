# mkd-minkeun/Keural-Lab-1031-GGUF

## Resumen

Keural-Lab-1031-GGUF es la distribución en formato GGUF del checkpoint de investigación Keural-Lab-1031, publicado por el usuario mkd-minkeun bajo el paraguas del laboratorio Keural. Se trata de un modelo de lenguaje de arquitectura mixture-of-experts (MoE) con 116.514.464.640 parámetros totales (aproximadamente 116,5 mil millones) y unos 6,7 mil millones de parámetros activos por token, según indica la model card. El modelo base fue convertido con `convert_hf_to_gguf.py` de llama.cpp y cuantizado con `llama-quantize`, lo que permite ejecutarlo en entornos de inferencia local.

La relevancia de esta ficha radica en que ofrece una ruta práctica para desplegar un MoE de gran tamaño en hardware de consumo o en configuraciones de dos GPU, gracias a la cuantización Q4_K_M. El repositorio ocupa 79,7 GB e incluye un proyector de visión opcional en bf16, lo que sugiere capacidades multimodales. El modelo se distribuye bajo la licencia Qwen Community License 1.0, derivada de Qwen3.8-Flash-Next, con restricciones específicas para uso comercial como servicio gestionado.

No se dispone de información pública sobre idiomas soportados, datos de entrenamiento ni resultados de benchmarks en la documentación proporcionada, por lo que varios apartados de esta ficha se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer; detalles de capas y atención no disponibles |
| Parametros totales | 116.514.464.640 (≈116,5 B) |
| Parametros activos | ≈6,7 B por token |
| Longitud de contexto | Hasta 32.768 tokens en el ejemplo de `llama-server` (`-c 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (archivo principal); proyector de visión en bf16; otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (texto y mmproj), más safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card describe el modelo como un checkpoint de investigación MoE de 65B (denominación comercial del autor) con aproximadamente 6,7 B de parámetros activos por token. La arquitectura es de tipo mixture-of-experts sobre un transformer, aunque no se detallan el número de expertos, la estrategia de enrutamiento, el número de capas ni el mecanismo de atención. El modelo base es `mkd-minkeun/Keural-Lab-1031`, y esta versión GGUF se generó con el script de conversión de llama.cpp, omitiendo la cabeza de predicción multi-token (multi-token-prediction head) que sí existe en el checkpoint original.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste instructivo. Tampoco se documentan innovaciones técnicas más allá de la propia arquitectura MoE y la presencia de una cabeza de predicción multi-token en el modelo base. La plantilla de chat está embebida en el GGUF y el modo de razonamiento (thinking) está activado por defecto, lo que sugiere un ajuste orientado a conversación y razonamiento, pero sin detalles verificables.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` aparece en los tags del repositorio.
- Razonamiento con modo thinking: la model card indica que el pensamiento está activado por defecto en la plantilla embebida.
- Entrada de imágenes: el repositorio incluye `Keural-Lab-1031-mmproj-bf16.gguf`, un proyector de visión opcional que habilita entrada multimodal al pasarlo con `--mmproj`.
- Soporte de llama.cpp: compatible con `llama-server`, `llama-quantize` y el ecosistema GGUF.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructuras de inferencia estándar.
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking y la arquitectura MoE son compatibles con estos flujos.

## Casos de uso

- Despliegue local de un MoE de gran tamaño: con la cuantización Q4_K_M (78,8 GB), el modelo puede ejecutarse en un Mac de 128 GB de memoria unificada o en dos GPU de 48 GB, lo que permite experimentar con un MoE de 116 B sin infraestructura de centro de datos.
- Investigación en arquitecturas MoE: al ser un checkpoint de investigación, resulta adecuado para estudiar el comportamiento de un modelo con 6,7 B de parámetros activos y comparar su eficiencia frente a modelos densos de tamaño similar.
- Prototipado de asistentes conversacionales con imágenes: usando el proyector `mmproj` junto con el modelo de texto, se puede construir un asistente que reciba imágenes y texto en un mismo turno, útil para demos de visión-lenguaje.
- Evaluación de cuantizaciones: el archivo Q4_K_M permite medir la degradación de calidad frente al modelo base en safetensors, un caso habitual en laboratorios que validan pipelines de cuantización con llama.cpp.
- Generación de texto con contexto medio: el ejemplo de `llama-server` con `-c 32768` habilita tareas de resumen o conversación multi-turno con ventanas de hasta 32K tokens, suficiente para documentos técnicos y transcripciones.
- Integración en pipelines de CI para pruebas de inferencia: al ser compatible con llama.cpp y endpoints, puede montarse en un servidor interno para validar prompts y plantillas de chat antes de pasar a producción.
- Experimentación con modo thinking: útil para comparar respuestas con y sin razonamiento explícito en tareas de lógica o matemáticas, aunque no haya benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo base para consultar puntuaciones, pero no se incluyen cifras en el material proporcionado, por lo que no se presentan tablas comparativas numéricas.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 90 GB de memoria con contexto moderado, según la model card; el archivo Q4_K_M pesa 78,8 GB y el proyector de visión 0,9 GB.
- Configuraciones recomendadas por el autor: un Mac con 128 GB de memoria unificada o dos GPU de 48 GB (por ejemplo, 2× A6000, 2× L40S o 2× RTX 6000 Ada).
- GPU de centro de datos: A100 80 GB o H100 80 GB no bastan por sí solas para el archivo completo en una sola tarjeta; se requiere reparto entre varias GPU o memoria unificada.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) con Q4_K_M; sería necesario sharding entre varias tarjetas o cuantizaciones más agresivas no publicadas.
- Opciones de despliegue: `llama-server` de llama.cpp con `--jinja` y `--mmproj` opcional; otras herramientas compatibles con GGUF (Ollama, LM Studio, text-generation-webui) no están confirmadas en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Keural-Lab-1031-GGUF | ≈116,5 B | ≈6,7 B | 32.768 en ejemplo; máximo no disponible | Qwen Community License 1.0 | GGUF en Hugging Face |
| Qwen3.8-Flash-Next (referencia de licencia) | No disponible | No disponible | No disponible | Qwen Community License 1.0 | No disponible en la información |
| Alternativas MoE de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de otros modelos comparables en la información proporcionada, por lo que la comparativa numérica queda limitada a la referencia de licencia que menciona la model card.

## Limitaciones y advertencias

- Restricción comercial: la Qwen Community License 1.0 exige, según la cláusula 2 citada en la model card, una licencia separada de Qwen para empresas que operen un negocio de Model-as-a-Service o AI Work Assistant.
- Ausencia de benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni similares, lo que impide evaluar su calidad frente a alternativas.
- Idiomas no documentados: se desconoce qué lenguas soporta y con qué calidad.
- Riesgo de alucinación: inherente a los modelos generativos; no hay documentación específica sobre mitigaciones.
- Sesgos: no se documentan sesgos conocidos ni procesos de alineación (RLHF/DPO) en la información disponible.
- Checkpoint de investigación: el autor lo describe como research checkpoint, sin garantías de robustez para producción.
- Cabeza de predicción multi-token omitida: la conversión a GGUF no incluye esa cabeza, por lo que el comportamiento puede diferir del modelo base en tareas que la aprovechen.
- Contexto máximo no confirmado: el ejemplo usa 32.768 tokens, pero no se especifica el máximo nativo ni el rendimiento con ventanas largas.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mkd-minkeun/Keural-Lab-1031-GGUF
- Modelo base: https://huggingface.co/mkd-minkeun/Keural-Lab-1031
- Licencia Qwen Community 1.0: incluida como archivo `LICENSE` en el repositorio
- llama.cpp (herramienta de conversión y cuantización): no se proporciona enlace específico en la información disponible
- Paper, blog o demo: no disponibles
