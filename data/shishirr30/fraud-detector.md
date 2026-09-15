# Shishirr30/fraud-detector

## Resumen

Shishirr30/fraud-detector es un ajuste fino (fine-tune) supervisado del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario Shishirr30 en HuggingFace. El nombre sugiere una especialización en detección de fraude, pero la model card no documenta ni el conjunto de datos empleado, ni la tarea objetivo, ni métricas de evaluación; el único ejemplo de uso incluido en la ficha es una pregunta genérica de generación de texto, no un caso de fraude. Se trata, por tanto, de un modelo con una intención declarada pero sin evidencia publicada que la respalde.

El modelo conserva la arquitectura del modelo base: un transformer decoder-only de tipo causal con 1.500 millones de parámetros (aproximadamente), atención con Grouped Query Attention y un tokenizador BPE con vocabulario de 151.936 entradas. Al derivar de una variante "Instruct" ya alineada, hereda la capacidad de seguir instrucciones y mantener conversaciones multi-turno en formato chat.

Su relevancia actual es limitada: el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, el tamaño declarado del repositorio es de 0,0 GB y la licencia aparece como un marcador de posición sin concretar. No se han encontrado publicaciones, papers ni artículos de blog asociados al modelo en la búsqueda web realizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen2ForCausalLM, heredada del modelo base) |
| Parametros totales | 1.500 millones aprox. (heredados de Qwen2.5-1.5B-Instruct; no declarados en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no documentada para este fine-tune |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; sin GGUF ni AWQ/GPTQ en el repositorio) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card contiene el marcador de posición `licence: license`) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card indica únicamente que el entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) con la librería TRL, partiendo de Qwen/Qwen2.5-1.5B-Instruct. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo fases posteriores de DPO, RLHF u optimización por preferencias, ni el régimen de hiperparámetros (learning rate, épocas, tamaño de lote, estrategia de enmascarado de pérdida).

Las versiones de framework declaradas son TRL 1.13.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. Estas versiones son notablemente posteriores a las habituales en el ecosistema, lo que puede dificultar la reproducción del pipeline de entrenamiento con entornos estándar. La ausencia de cualquier innovación técnica declarada —sin decodificación especulativa, atención lineal, mezcla de expertos ni modificaciones arquitectónicas— implica que el fine-tune no altera la estructura del modelo base.

No se dispone de información sobre el proceso de curación de datos ni sobre el tratamiento de etiquetas, algo especialmente relevante en un dominio como la detección de fraude, donde la distribución de clases suele estar fuertemente desbalanceada y las decisiones del modelo pueden tener consecuencias legales o económicas.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones multi-turno, presumiblemente conservado tras el SFT.
- Capacidad declarada (por el nombre del modelo) de detección de fraude, sin evidencia publicada que la demuestre ni especificación del tipo de fraude (transacciones, seguros, documentos, contenido).
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Qwen2.5 sí lo soporta, pero no hay confirmación de que se conserve tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo "thinking", visión o audio: no disponibles.
- Capacidad de razonamiento matemático y generación de código: la model card no aporta datos al respecto.

## Casos de uso

Dado que la model card no documenta el dataset ni la tarea, los casos de uso siguientes son hipotéticos y deben validarse empíricamente antes de cualquier despliegue:

- Clasificación de transacciones sospechosas: el modelo podría emplearse para etiquetar operaciones como fraudulentas o legítimas a partir de descripciones textuales, aunque no hay ninguna evaluación publicada que respalde su precisión en esta tarea.
- Triaje de alertas antifraude: dado su tamaño reducido (1.500 millones de parámetros), podría actuar como primera capa de filtrado en un pipeline donde un modelo mayor revisase únicamente los casos marcados como dudosos.
- Extracción de señales en informes de disputas: procesamiento de texto libre procedente de reclamaciones de clientes para identificar patrones asociados a fraude.
- Asistente interno para analistas: generación de resúmenes explicativos sobre por qué una operación ha sido marcada, aprovechando el formato conversacional heredado del modelo base.
- Prototipado e investigación académica: al ser un fine-tune pequeño y ligero, resulta adecuado para experimentos de ajuste de dominio en entornos con recursos limitados.
- Generación de reglas o heurísticas: el modelo podría redactar borradores de reglas de detección o descripciones de tipologías de fraude para revisión humana.

En todos los casos, el uso en producción exigiría auditoría previa: la ausencia de métricas, de licencia definida y de documentación del dataset impide asumir un comportamiento fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación (ni MMLU, ni HumanEval, ni GSM8K, ni métricas específicas de detección de fraude como precision, recall o AUC). La búsqueda web realizada no devolvió ningún artículo, paper o publicación técnica asociada al modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño del modelo base (1.500 millones de parámetros) y no están confirmadas por el autor:

- VRAM estimada para inferencia en FP16/BF16: en torno a 3-4 GB de pesos, más overhead de activaciones y caché KV (aproximadamente 4-6 GB en total con contexto moderado).
- VRAM estimada en cuantización de 8 bits: aproximadamente 2-3 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM funciona holgadamente en FP16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 8 GB o más, e incluso en algunas integradas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (única librería confirmada en el repositorio), y potencialmente vLLM, TGI, llama.cpp u Ollama si se generan conversiones a GGUF que actualmente no están publicadas.
- Latencia y throughput: no disponibles. El tag `endpoints_compatible` indica compatibilidad con HuggingFace Inference Endpoints.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a características estructurales y de disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Shishirr30/fraud-detector | ~1,5 B | No documentado (base: 32.768) | No disponible | safetensors, transformers | No disponible |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache-2.0 | safetensors, transformers, GGUF | Sí (publicados por Alibaba) |
| Qwen/Qwen2.5-3B-Instruct | 3 B | 32.768 tokens | Qwen Research (uso no comercial en algunas variantes) | safetensors, transformers | Sí |
| Meta Llama-3.2-1B-Instruct | 1,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Sí |

La ventaja diferencial del modelo evaluado sería su supuesta especialización en fraude, pero al no existir evaluación pública esa ventaja no puede verificarse frente al modelo base sin ajustar.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: se desconoce la procedencia de los datos, su licencia y si contienen información personal o sensible.
- Sin métricas publicadas: no hay ninguna evidencia de que el modelo detecte fraude mejor que el modelo base sin ajustar.
- Riesgo elevado de alucinación: es un modelo de 1,5 B parámetros; en tareas de clasificación o razonamiento complejo tiende a generar respuestas plausibles pero incorrectas.
- Licencia no definida: la model card contiene un marcador de posición (`licence: license`) y no se especifica la licencia del fine-tune. El uso comercial queda en un limbo legal, aunque el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache-2.0.
- Idiomas no declarados: no puede asumirse un rendimiento correcto en castellano ni en ningún otro idioma concreto.
- Longitud de contexto no documentada: el ajuste podría haber reducido la ventana efectiva respecto al modelo base.
- Dominio de alto riesgo: cualquier aplicación en detección de fraude tiene consecuencias económicas y potencialmente legales para las personas afectadas; un modelo sin auditoría, sin evaluación de sesgos y sin explicabilidad no debería emplearse en decisiones automatizadas.
- Repositorio sin adopción: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Sin garantía de mantenimiento: no hay indicios de que el autor vaya a actualizar el modelo, responder a issues o corregir problemas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shishirr30/fraud-detector
- Modelo base Qwen/Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería TRL (framework de entrenamiento declarado): https://github.com/huggingface/trl

No se han encontrado papers, artículos de blog, repositorios adicionales ni demos asociados al modelo en la búsqueda web realizada.
