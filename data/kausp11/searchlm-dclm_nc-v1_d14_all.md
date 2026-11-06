# Kausp11/searchlm-dclm_nc-v1_d14_all

## Resumen

Search-LLM, DCLM-Edu 400M (base) es un modelo de lenguaje causal de tamaño reducido (842 millones de parámetros reales según los metadatos de safetensors) entrenado con preentrenamiento habilitado para búsqueda ("search-enabled pretraining"). Fue desarrollado por el usuario Kausp11 y exportado a Hugging Face desde el clúster RCP, con el identificador interno `search-lm/ckpts/dclm_nc/v1_d14_all`. El modelo se basa en la arquitectura nanochat y se entrenó sobre datos DCLM-Edu, incorporando tokens especiales de búsqueda web (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`) en el tokenizador, derivado de SmolLM2.

Su relevancia radica en la línea de investigación sobre modelos que aprenden a emitir consultas web y consumir respuestas recuperadas durante el propio preentrenamiento, una técnica que permite a modelos pequeños compensar su falta de parámetros con acceso a información externa. Al tratarse de un modelo base (no instruido), está pensado principalmente para investigación, fine-tuning posterior y experimentación con pipelines de generación aumentada por recuperación. Es un proyecto de escala experimental, con descargas limitadas (301 en el momento de la ficha) y sin documentación técnica extensa en su model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (base nanochat), no disponible detalle exacto |
| Parámetros totales | 842.220.414 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo pesos en bf16/fp16 implícitos por el tamaño del repo) |
| Idiomas soportados | no disponible (tokenizador SmolLM2, orientado principalmente a inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal generado con el framework nanochat, una base de código ligera para entrenar LLM de forma eficiente. El tokenizador proviene de SmolLM2 y se ha ampliado con cuatro tokens especiales de búsqueda: `<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>` y `</WEB_RESPONSE>`. Esta ampliación sugiere que el modelo fue entrenado con interacciones simuladas o reales de búsqueda web intercaladas en el corpus, de modo que aprende a formular consultas y a incorporar el texto recuperado en su contexto de generación.

Los datos de entrenamiento corresponden al corpus DCLM-Edu (variante educativa de la pipeline de filtrado DCLM, DataComp for Language Models), aunque no se ha publicado el número exacto de tokens, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO. El identificador `v1_d14_all` sugiere una versión 1 con una configuración de profundidad/dimensionado específica (d14) y entrenamiento sobre la totalidad de los datos ("all"). No hay información disponible sobre técnicas adicionales como decodificación especulativa, atención lineal u otras innovaciones concretas más allá del preentrenamiento con búsqueda habilitada.

## Capacidades

- Generación de texto autoregresiva como modelo base (completación de texto, no instruido).
- Emisión de consultas web estructuradas mediante los tokens `<WEB_QUERY>` y `</WEB_QUERY>`, y consumo de respuestas delimitadas por `<WEB_RESPONSE>` y `</WEB_RESPONSE>`, lo que lo hace compatible con pipelines de generación aumentada por recuperación (RAG) o agentes con acceso a búsqueda.
- Compatibilidad con la librería `transformers` de Hugging Face mediante `trust_remote_code=True` (código personalizado incluido en el repo).
- No se ha documentado soporte para tool calling estándar, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en preentrenamiento con búsqueda: sirve como punto de partida para estudiar cómo los tokens de búsqueda afectan al comportamiento de modelos pequeños, replicando o extendiendo experimentos tipo search-LM.
- Base para fine-tuning en RAG: al conocer los tokens de consulta y respuesta web, puede ajustarse con SFT para que un agente emita consultas y sintetice resultados recuperados de un buscador o motor vectorial.
- Prototipado de agentes ligeros: su tamaño reducido (842M) permite ejecutarlo en hardware modesto mientras se itera sobre lógicas de agente que combinan generación y recuperación.
- Estudios de destilación de conocimiento externo: puede compararse con modelos equivalentes sin tokens de búsqueda para medir cuánta capacidad de respuesta factual aporta el acceso web durante el entrenamiento.
- Completación de texto en entornos educativos o de análisis de corpus DCLM-Edu, dado que su preentrenamiento se centró en contenido educativo filtrado.
- Desarrollo de benchmarks personalizados de uso de herramientas: su formato de tokens personalizado facilita construir evaluaciones de si el modelo consulta y usa correctamente información externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en precisión completa (coincide con el tamaño del repo), por lo que con overhead de KV cache y tokenizador, 2-4 GB de VRAM son suficientes; en CPU también es viable dada la escala.
- GPU recomendadas: cualquier GPU moderna de consumo es más que suficiente (RTX 3060, RTX 4060, RTX 4090, etc.); no se requieren A100 ni H100 para inferencia. Para reentrenamiento o fine-tuning completo, una GPU con 24 GB (RTX 4090, A5000) o una A100 sería razonable.
- Cabe con holgura en GPUs de consumo; incluso es ejecutable en portátiles con GPU integrada o en CPU, aunque con mayor latencia.
- Despliegue: nativo con `transformers` (requiere `trust_remote_code=True`); no hay pesos GGUF publicados, por lo que llama.cpp y Ollama requerirían conversión previa. vLLM y TGI podrían funcionar al ser una arquitectura transformer estándar, pero no está verificado por el autor.
- Latencia y throughput: no disponibles; dada la escala sub-1B, se esperan latencias bajas y throughput alto en GPU de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Preentrenamiento con búsqueda | Disponibilidad |
|---|---|---|---|---|---|
| Search-LLM DCLM-Edu 400M (este modelo) | 842M | no disponible | Apache 2.0 | Sí (tokens web dedicados) | HF, safetensors |
| SmolLM2-360M (HuggingFaceTB) | 360M | 8.192 tokens | Apache 2.0 | No | HF, safetensors, GGUF |
| Qwen2.5-0.5B (Alibaba) | 494M | 32.768 tokens | Qwen Research / Apache 2.0 (algunas variantes) | No | HF, safetensors, GGUF |
| SmolLM2-1.7B (HuggingFaceTB) | 1.700M | 8.192 tokens | Apache 2.0 | No | HF, safetensors, GGUF |

Frente a sus alternativas, este modelo destaca por su entrenamiento con tokens de búsqueda web, único en su categoría de tamaño, pero carece de la madurez, documentación y ecosistema de cuantización de los modelos de Hugging Face o Alibaba.

## Limitaciones y advertencias

- Es un modelo base sin alineación (sin SFT/RLHF documentado), por lo que puede generar texto sin control de formato, contenido ofensivo o respuestas incoherentes si se usa directamente.
- Riesgo de alucinación elevado, típico de modelos sub-1B; el preentrenamiento con búsqueda puede mitigarlo parcialmente, pero no hay evaluaciones publicadas que lo confirmen.
- Sesgos heredados del corpus DCLM-Edu (contenido web filtrado, principalmente en inglés); comportamiento en otros idiomas no documentado y probablemente débil.
- Longitud de contexto no publicada; debe verificarse en la configuración del modelo antes de usarlo en tareas con documentos largos.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código personalizado del repositorio; revísese el código antes de usarlo en entornos de producción.
- Proyecto experimental de autor individual, con escasa documentación, sin benchmarks publicados y sin mantenimiento garantizado; no recomendado para producción sin validación propia.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento concretos y su licenciamiento derivado no están detallados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/searchlm-dclm_nc-v1_d14_all
- Tokenizador base SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Corpus DCLM (referencia de la pipeline de datos): https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Paper del modelo: no disponible
- Repositorio de código de entrenamiento: no disponible (referencia interna RCP `search-lm/ckpts/dclm_nc/v1_d14_all`)
- Demo: no disponible
