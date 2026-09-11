# Samzzzed/dolphin-mistral-7b

## Resumen

Samzzzed/dolphin-mistral-7b es una publicación derivada del modelo Dolphin 2.8 Mistral 7B v0.2 de cognitivecomputations, distribuida en formato GGUF con cuantización Q4_0. El autor, Samzzzed, no reentrena ni modifica los pesos: lo que añade es un prompt de sistema multinivel alineado con su propia aplicación FastAPI (JARVIS), que replica una escalera de clasificaciones tipo IMDb/MPAA (G, PG, PG-13, R, NC-17). Se trata, por tanto, de un artefacto de empaquetado y configuración de prompt más que de un modelo nuevo.

El modelo subyacente es un transformer decoder-only de 7.241.748.480 parámetros derivado de Mistral 7B v0.2, con plantilla ChatML y una ventana de contexto declarada de 32 768 tokens (32k). El repositorio ocupa 4,1 GB, coherente con una cuantización Q4_0 de 7B, y se distribuye bajo licencia Apache 2.0.

Su interés práctico es acotado pero reproducible: documenta cómo imitar el comportamiento de una aplicación concreta mediante un `Modelfile` de Ollama y un prompt de sistema, sin tocar los pesos. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y no publica resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral 7B v0.2) |
| Parámetros totales | 7.241.748.480 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens (32k, según los valores por defecto de la familia indicados en la model card) |
| Tipos de cuantización | Q4_0 (GGUF). No se listan otras cuantizaciones en este repositorio |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no contiene ningún entrenamiento propio. La model card es explícita: "Weights are not re-trained (no GPU LoRA here)". Los pesos proceden del fichero `dolphin-2.8-mistral-7b-v02-Q4_0.gguf` publicado por bartowski, que a su vez es una cuantización del modelo `cognitivecomputations/dolphin-2.8-mistral-7b-v02`. La arquitectura efectiva es, por tanto, la de Mistral 7B v0.2: un transformer decoder-only con atención de consultas agrupadas (GQA) y ventana de contexto completa de 32 768 tokens.

La única aportación del autor es de nivel de prompt: se sustituye el system prompt original ("You are Dolphin, a helpful AI assistant.") por una escalera de prompts G / PG / PG-13 / R / NC-17 procedente del fichero `main.py` de su aplicación FastAPI. El modelo debe inferir una clasificación estilo IMDb, emitir la etiqueta `IMDB_RATING:` y a continuación responder ajustándose a ese nivel. La propia model card aclara que el `rating` recibido desde la API FastAPI funciona como techo, no como suelo. No hay datos publicados sobre el dataset de entrenamiento del modelo base dentro de esta información, más allá de la referencia a la familia Dolphin.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla ChatML y contexto de hasta 32 768 tokens.
- Control de estilo y nivel de contenido mediante el prompt de sistema multinivel (G, PG, PG-13, R, NC-17) descrito en la model card.
- Inferencia y emisión de una etiqueta de clasificación (`IMDB_RATING:`) antes de la respuesta, útil para pipelines que necesiten filtrar o enrutar por nivel de contenido.
- Integración directa con Ollama mediante `Modelfile`, y con llama.cpp y cualquier runtime compatible con GGUF.
- Integración con aplicaciones Python a través del helper mencionado `fastapi_imdb_prompts.py` (`build_ollama_payload`).
- Función de asistente generalista (preguntas y respuestas, redacción, resumen) heredada del modelo Dolphin 2.8 Mistral 7B v0.2.
- Tool calling, function calling, capacidades de agente, visión, audio y modo de razonamiento explícito: no disponibles / no declaradas en la información proporcionada.
- Capacidades multilingües: no declaradas. La model card está íntegramente en inglés y no se especifica soporte de otros idiomas.

## Casos de uso

- Asistente conversacional local sin conexión: un modelo de 7B en Q4_0 ocupa 4,1 GB y puede ejecutarse íntegramente en una máquina de sobremesa con Ollama, lo que permite desplegar un chatbot sin enviar datos a servicios externos.
- Réplica de comportamiento de una aplicación existente: el caso de uso explícito del repositorio es reproducir el comportamiento del backend FastAPI JARVIS usando únicamente Ollama y un `Modelfile`, útil para desarrollar y probar sin levantar toda la aplicación.
- Enrutado y filtrado por nivel de contenido: la etiqueta `IMDB_RATING:` emitida por el modelo puede consumirse programáticamente para decidir si una respuesta se muestra, se registra o se descarta, con el `rating` de la API actuando como techo.
- Prototipado rápido de APIs conversacionales: combinado con FastAPI y `build_ollama_payload`, sirve para levantar un endpoint de chat funcional en pocas líneas, antes de invertir en modelos mayores o en servicios gestionados.
- Generación de texto con control de tono: la escalera de prompts permite obtener la misma respuesta redactada para audiencias distintas (infantil, general, adulta), lo que resulta útil en generación de contenido editorial con varios niveles de audiencia.
- Procesamiento de documentos largos mediante RAG: la ventana de 32 768 tokens permite insertar bloques de documentación extensos o historiales de conversación largos en una sola llamada, si la VRAM disponible lo permite.
- Experimentación docente y de investigación: al no haber reentrenamiento y ser un artefacto puramente declarativo, es un ejemplo didáctico de la diferencia entre modificar pesos y modificar comportamiento vía prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se aportan comparaciones medidas contra el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4,1 GB solo para los pesos en Q4_0, más el overhead del runtime (aproximadamente 1-2 GB adicionales). En la práctica, unos 5-6 GB de VRAM para uso conversacional con contexto moderado.
- Caché KV: en fp16 se estima en torno a 128 KiB por token para esta arquitectura, lo que equivale a varios gigabytes adicionales si se llena la ventana de 32 768 tokens. Usar el contexto completo exige mucha más memoria que un uso conversacional normal.
- GPU recomendadas: cualquier GPU con 8 GB o más. Cabe holgadamente en una RTX 3060 de 12 GB, RTX 4060 Ti de 8-16 GB, RTX 4070, RTX 4090 y GPUs de centro de datos como A100 o H100 (en estas últimas, sobredimensionadas para un modelo de 7B).
- Cabe en GPU de consumo: sí. Es uno de los tamaños más habituales para ejecución local en equipos de gama media.
- Opciones de despliegue: Ollama (vía `Modelfile`, tal como documenta el autor), llama.cpp, servidores GGUF compatibles y cualquier runtime que acepte GGUF. vLLM y TGI quedan fuera del alcance de este repositorio, que solo publica pesos GGUF.
- Latencia y throughput: no disponibles. No se aportan mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Samzzzed/dolphin-mistral-7b | 7,24B | 32 768 tokens | Apache 2.0 | GGUF (Q4_0) | Artefacto derivado con prompt multinivel; 0 descargas; sin benchmarks |
| cognitivecomputations/dolphin-2.8-mistral-7b-v02 | 7B | 32 768 tokens | Apache 2.0 | safetensors | Modelo base real; sí incluye pesos completos y permite reentrenamiento |
| bartowski/dolphin-2.8-mistral-7b-v02-GGUF | 7B | 32 768 tokens | Apache 2.0 | GGUF (múltiples cuantizaciones) | Origen del fichero Q4_0 usado aquí; ofrece alternativas como Q4_K_M |
| Mistral 7B Instruct v0.2 | 7,24B | 32 768 tokens | Apache 2.0 | safetensors, GGUF (terceros) | Alternativa con alineación instruct oficial; contexto equivalente |

No se dispone de datos de rendimiento comparado entre estas opciones dentro de la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de que el prompt multinivel funcione de forma consistente.
- No hay benchmarks publicados. Cualquier afirmación sobre calidad o rendimiento carece de respaldo medido.
- El repositorio no reentrena pesos. El comportamiento diferencial depende por completo del prompt de sistema y de la plantilla ChatML; si se carga el GGUF sin ese prompt, se obtiene el Dolphin 2.8 Mistral 7B v0.2 original.
- La escalera de clasificaciones IMDb/MPAA es una convención no oficial definida por el autor. No existe garantía de que el modelo respete el techo de rating solicitado ni de que la etiqueta `IMDB_RATING:` sea fiable.
- El modelo base pertenece a la familia Dolphin, orientada a contenido sin filtros. Puede producir material ofensivo, explícito o inapropiado, especialmente en los niveles R y NC-17 del prompt. Requiere moderación adicional en cualquier despliegue público.
- Riesgo de alucinación inherente a un modelo de 7B: fabricación de datos, citas y referencias plausibles pero falsas.
- Idiomas no declarados. Aunque los modelos Mistral rinden razonablemente en varias lenguas europeas, no hay confirmación de soporte ni de calidad en castellano.
- El contexto efectivo puede degradarse antes de los 32 768 tokens. La model card no aporta pruebas de recuperación en el extremo de la ventana.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el contenido generado y su adecuación legal son responsabilidad exclusiva del usuario.
- Inconsistencias en los metadatos del repositorio: la etiqueta `base_model` apunta a `dphn/dolphin-2.8-mistral-7b-v02` mientras que la model card cita `cognitivecomputations/dolphin-2.8-mistral-7b-v02`, y la fecha de creación registrada es 2026-09-11. Conviene verificar la procedencia antes de usarlo en producción.
- La cuantización Q4_0 es de las más agresivas en la escala de llama.cpp; para uso serio conviene evaluar Q4_K_M o Q5_K_M del mismo modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Samzzzed/dolphin-mistral-7b
- Modelo base (según model card): https://huggingface.co/cognitivecomputations/dolphin-2.8-mistral-7b-v02
- Modelo base (según etiqueta `base_model`): https://huggingface.co/dphn/dolphin-2.8-mistral-7b-v02
- GGUF de origen citado en la model card: https://huggingface.co/bartowski/dolphin-2.8-mistral-7b-v02-GGUF
- Documentación de Ollama para crear modelos con `Modelfile`: https://github.com/ollama/ollama
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes sobre este modelo (corresponden a páginas corporativas de Microsoft). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este repositorio.
