# fbaldassarri/meta-llama_Llama-3.2-3B-Instruct-auto_round-int4-gs64-sym

## Resumen

Este modelo es una versión cuantizada a 4 bits del Llama 3.2 3B Instruct de Meta, generada por fbaldassarri mediante el framework Intel AutoRound (v0.13.1). La cuantización emplea el método SignRound (weights-only quantization) con INT4, grupo de 64 y cuantización simétrica, lo que reduce significativamente el uso de memoria y acelera la inferencia entre 2 y 3 veces respecto al modelo original, con una pérdida de precisión leve. Está diseñado específicamente para ejecutarse en hardware Intel: CPU, iGPU (Arc) y NPU (AI Boost de Core Ultra), aunque también puede usarse en otras plataformas mediante transformers.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y de bajo coste para desplegar un modelo instruct de 3.2B en entornos con recursos limitados, como portátiles con procesadores Intel recientes o servidores sin GPU dedicada. Al ser una cuantización del modelo base, conserva las capacidades conversacionales y multilingües del original, pero con un footprint de memoria mucho menor. El repositorio incluye instrucciones detalladas para reproducir la cuantización, lo que facilita la auditoría y la replicación del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 796.044.288 (dato del repo; el modelo base tiene 3.2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 3B Instruct tiene 128K) |
| Tipos de cuantizacion | INT4, group size 64, simetrica (AutoRound/SignRound) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del Llama 3.2 3B Instruct, un transformer decoder-only con normalización RMSNorm, atención con RoPE y activación SwiGLU. No se ha realizado ningún entrenamiento adicional; el proceso de AutoRound ajusta los pesos en INT4 mediante el algoritmo SignRound, que optimiza la redondez de los pesos usando un conjunto de calibración. En este caso se usaron 128 muestras de calibración, 200 iteraciones de ajuste, una longitud de secuencia de 512 tokens y batch size 4, todo en CPU con precisión bfloat16. La cuantización es simétrica y por grupos de 64, lo que equilibra precisión y compresión. El resultado es un modelo con pesos en INT4 que se cargan en bfloat16 durante la inferencia, manteniendo la compatibilidad con el ecosistema transformers.

## Capacidades

- Generacion de texto y chat conversacional: es un modelo instruct, por lo que responde a instrucciones y mantiene diálogos multi-turno usando la plantilla de chat integrada.
- Razonamiento y comprension del lenguaje: hereda las capacidades del Llama 3.2 3B Instruct para tareas de comprensión lectora, resumen, extracción de información y razonamiento básico.
- Soporte multilingue: cubre 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), aunque el rendimiento puede variar entre ellos.
- Inferencia eficiente en hardware Intel: optimizado para CPU, iGPU (Arc) y NPU (Core Ultra) mediante intel-extension-for-pytorch y OpenVINO.
- Compatibilidad con transformers: se puede cargar con `AutoModelForCausalLM` y usar el chat template estándar.
- No incluye capacidades de tool calling, visión, audio ni modo de razonamiento explícito (thinking mode), ya que no se mencionan en la documentación.

## Casos de uso

- Asistentes conversacionales en dispositivos con recursos limitados: el modelo puede ejecutarse en portátiles con CPU Intel Core Ultra o en mini-PCs sin GPU, ofreciendo un chatbot local que no requiere conexión a internet. Su tamaño reducido (4 bits) permite cargarlo en memoria RAM sin problemas.
- Generacion de texto en aplicaciones de productividad: redacción de correos, resúmenes de documentos, generación de borradores o traducción entre los idiomas soportados, todo en local para garantizar privacidad.
- Prototipado rapido de aplicaciones NLP: al ser compatible con transformers, los desarrolladores pueden integrarlo en pipelines de Hugging Face para pruebas de concepto sin necesidad de GPUs caras.
- Educacion y aprendizaje de idiomas: como modelo multilingüe, puede usarse en aplicaciones de práctica de conversación en español, inglés, francés, etc., con respuestas contextuales.
- Analisis de sentimiento y clasificacion de texto: aunque no está especializado, puede adaptarse con prompts para tareas de clasificación básica en entornos donde la latencia y el consumo sean críticos.
- Despliegue en entornos edge con Intel: gracias a su soporte para iGPU y NPU, es adecuado para dispositivos IoT o sistemas embebidos basados en Intel que necesiten procesamiento de lenguaje natural en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una "leve pérdida de precisión" típica de la cuantización W4G64, pero no proporciona cifras concretas de MMLU, HumanEval u otros tests. Tampoco se ofrecen mediciones de latencia o throughput. Se recomienda evaluar el modelo en el hardware objetivo antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser INT4, los pesos del modelo base (3.2B) ocupan aproximadamente 1.6 GB, más overhead de activaciones y KV cache. En la práctica, el repo ocupa 3.1 GB (incluye tokenizer y otros archivos). Con 4 GB de VRAM o RAM debería ser suficiente para inferencia básica.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU Intel (con o sin AVX2), iGPU Intel Arc y NPU Core Ultra. También puede ejecutarse en GPUs NVIDIA/AMD mediante transformers, aunque no es el objetivo principal.
- Compatibilidad con GPU consumer: sí, cabe en GPUs con 4 GB o más (por ejemplo, RTX 3050, RTX 4060, Arc A380), pero el rendimiento óptimo se obtiene en hardware Intel.
- Opciones de despliegue: transformers (Python), intel-extension-for-pytorch, OpenVINO, y potencialmente vLLM o TGI si se convierte a otros formatos. No se proporcionan archivos GGUF ni Ollama.
- Latencia y throughput: no disponibles. La model card indica una aceleración de 2-3X frente al modelo original en INT4, pero sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (AutoRound INT4) | 3.2B (base) | 128K (base) | INT4 gs64 sym | Llama 3.2 | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct (original) | 3.2B | 128K | FP16/BF16 | Llama 3.2 | HuggingFace |
| TheBloke/Llama-3.2-3B-Instruct-GGUF (ejemplo típico) | 3.2B | 128K | GGUF (Q4_K_M, etc.) | Llama 3.2 | HuggingFace |

La comparativa es cualitativa: el modelo original ofrece máxima precisión pero mayor consumo de memoria; las versiones GGUF (de terceros) son más flexibles para llama.cpp/Ollama; esta versión AutoRound está optimizada para el stack de Intel y mantiene el formato safetensors nativo de transformers. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del Llama 3.2 3B Instruct, que pueden incluir estereotipos de género, raza o cultura, especialmente en los idiomas menos representados.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos o datos, especialmente en tareas de razonamiento complejo o con contextos largos.
- Degradacion por cuantizacion: la cuantización INT4 con grupo 64 puede reducir la precisión en tareas sensibles (matemáticas, código, razonamiento lógico). No se han publicado métricas que cuantifiquen esta pérdida.
- Limitaciones de contexto: aunque el modelo base soporta 128K, la cuantización se calibró con secuencias de 512 tokens; el rendimiento con contextos muy largos no está verificado.
- Restricciones de licencia: la Llama 3.2 Community License permite uso comercial, pero exige que los usuarios con más de 700 millones de usuarios mensuales soliciten permiso a Meta. Además, prohíbe usos militares o de vigilancia.
- Soporte limitado: el autor declara que el modelo se desarrolló solo para investigación y no ofrece garantías. No hay comunidad activa ni mantenimiento garantizado.
- Compatibilidad: al ser un formato safetensors con cuantización AutoRound, puede requerir versiones recientes de transformers y de la librería auto-round para cargarse correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.2-3B-Instruct-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Pipeline de reproducción (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
