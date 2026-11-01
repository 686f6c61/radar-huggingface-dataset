# jaydeepb/pythia-1.4b-wildchat-run2

## Resumen

pythia-1.4b-wildchat-run2 es un modelo de generación de texto desarrollado por el usuario jaydeepb y publicado en HuggingFace. Se trata de un fine-tuning de EleutherAI/pythia-1.4b, un transformer de tipo GPT-NeoX con aproximadamente 1.414 millones de parámetros, ajustado durante una época sobre una muestra de 1 millón de secuencias de 128 tokens del dataset WildChat de AllenAI. El propósito del modelo no es servir como asistente general, sino funcionar como instrumento de investigación sobre memorización en modelos de lenguaje.

Su relevancia radica en el diseño experimental: es el segundo de dos modelos gemelos (run1 y run2) entrenados sobre muestras disjuntas de WildChat. Run1 aporta las etiquetas para entrenar un clasificador de memorización, y run2 proporciona datos frescos no vistos para validar ese clasificador en modo "predecir antes de entrenar". Es, por tanto, un artefacto de investigación útil para estudiar qué secuencias memoriza un modelo durante el fine-tuning, un tema central en privacidad, extracción de datos de entrenamiento y derechos de autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 1.414.647.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base Pythia-1.4B: 2048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre WildChat, mayoritariamente inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GPT-NeoX de la familia Pythia de EleutherAI: un transformer decoder-only autoregresivo con atención estándar de tipo causal. No es un modelo MoE, por lo que todos sus parámetros están activos en cada pasada.

El fine-tuning se realizó sobre WildChat (allenai/WildChat), un corpus de conversaciones reales de usuarios con chatbots. Los hiperparámetros documentados son: 1 época, longitud de secuencia de 128 tokens, learning rate de 5e-5 con planificación coseno y semilla 42. La muestra de entrenamiento consta de 1 millón de secuencias, extraídas de forma disjunta de las usadas en run1. El objetivo científico es doble: run1 sirve para etiquetar secuencias memorizadas y entrenar un clasificador de memorización, mientras que run2 actúa como conjunto de validación "predict-before-training", permitiendo comprobar si el clasificador puede anticipar qué datos serán memorizados antes de exponer el modelo a ellos. No hay información sobre RLHF, DPO ni alineación posterior.

## Capacidades

- Generación de texto autoregresiva en formato conversacional (herencia de WildChat).
- Modelo base Pythia sin alineación con RLHF: no está optimizado para seguir instrucciones de forma fiable.
- Utilidad principal como sujeto experimental para estudios de memorización, extracción de datos de entrenamiento y privacidad.
- Compatibilidad con la librería transformers de HuggingFace y endpoints de inferencia.
- No hay evidencia documentada de soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no disponibles oficialmente, aunque WildChat contiene conversaciones en varios idiomas.

## Casos de uso

- Investigación en memorización: analizar qué secuencias del corpus de fine-tuning quedan memorizadas y bajo qué condiciones (frecuencia, duplicación, novedad), usando run2 como conjunto de validación limpio del clasificador.
- Estudios de privacidad y extracción de datos: probar ataques de extracción de datos de entrenamiento sobre un modelo pequeño y reproducible, con hiperparámetros y semillas documentados.
- Investigación en derechos de autor y cumplimiento: evaluar si un modelo reproduce contenido de usuarios (WildChat) que podría estar protegido, relevante para auditorías de modelos fine-tuned sobre datos reales.
- Desarrollo de clasificadores predictivos: entrenar y validar modelos que predigan la memorización antes del entrenamiento, reduciendo costes de auditoría en pipelines de fine-tuning.
- Benchmarking de eficiencia de fine-tuning: al ser un modelo de 1,4B con configuración pública (lr 5e-5, 1 época, seq 128), sirve como referencia reproducible para comparar métodos de fine-tuning eficiente (LoRA, cuantización, etc.).
- Docencia y formación: caso práctico completo y de tamaño manejable para cursos sobre memorización, privacidad y evaluación de LLMs, ejecutable en hardware de consumo.
- Prototipado de generación de texto conversacional: puede usarse como punto de partida para fine-tunings adicionales sobre datos de diálogo, aunque no está alineado para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3 GB solo de pesos (el repo ocupa 2,8 GB en safetensors), más overhead de activaciones y KV-cache; en la práctica, una GPU con 6-8 GB de VRAM es suficiente.
- Con cuantización INT8/INT4 (no publicada oficialmente, pero aplicable con herramientas estándar): cabría en 2-4 GB de VRAM.
- GPUs recomendadas: cualquier GPU de consumo moderna (RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090) ejecuta el modelo con holgura; no se requiere hardware de centro de datos para inferencia.
- Cabe cómodamente en GPUs de consumo; también es viable su ejecución en CPU para pruebas, con latencias mayores.
- Opciones de despliegue: transformers (librería nativa declarada), text-generation-inference (TGI), endpoints de HuggingFace (el modelo está etiquetado como endpoints_compatible), y con conversión a GGUF, llama.cpp u Ollama. No hay confirmación oficial de soporte en vLLM para este fine-tuning concreto, aunque la arquitectura GPT-NeoX está soportada por vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Proposito |
|---|---|---|---|---|
| jaydeepb/pythia-1.4b-wildchat-run2 | 1.414M | GPT-NeoX | apache-2.0 | Investigacion en memorizacion (fine-tuning WildChat) |
| EleutherAI/pythia-1.4b | 1.414M | GPT-NeoX | apache-2.0 | Modelo base para investigacion (Pythia suite) |
| jaydeepb/pythia-1.4b-wildchat-run1 | 1.414M | GPT-NeoX | apache-2.0 | Run gemino que aporta etiquetas al clasificador de memorizacion |

Frente al modelo base Pythia-1.4B, esta variante añade conocimiento específico de WildChat mediante fine-tuning (1 época, 1M secuencias de 128 tokens), lo que la hace más adecuada para experimentos de memorización pero potencialmente peor como modelo general. Frente a run1, comparte configuración pero usa una muestra de datos disjunta, cumpliendo el rol de conjunto de validación held-out. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- No está alineado con RLHF ni DPO: puede generar contenido ofensivo, incoherente o imitar conversaciones reales de WildChat sin filtros de seguridad.
- Riesgo elevado de memorización y reproducción literal de datos de entrenamiento: es precisamente el fenómeno bajo estudio, por lo que no debe desplegarse en producción sin auditorías de privacidad.
- WildChat contiene conversaciones reales de usuarios, potencialmente con datos personales (PII): su uso plantea riesgos de privacidad si se emplea para extracción o regeneración de texto.
- Sesgos heredados de WildChat y del preentrenamiento de Pythia (The Pile), con dominancia del inglés y sesgos presentes en datos web.
- Longitud de secuencia del fine-tuning de solo 128 tokens: el comportamiento en contextos largos no está evaluado.
- Documentación limitada: no hay benchmarks, ni datos de idiomas, ni contexto máximo confirmado en la model card.
- Licencia apache-2.0: permite uso comercial, pero los datos de entrenamiento (WildChat) tienen sus propias condiciones que deben revisarse por separado.
- Advertencia de la propia model card: el contenido citado son datos extraídos del autor y deben tratarse solo como material de referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/pythia-1.4b-wildchat-run2
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Dataset WildChat: https://huggingface.co/datasets/allenai/WildChat
- Repositorio de la familia Pythia (referencia): https://github.com/EleutherAI/pythia
