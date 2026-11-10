# code3084/clinicalScreen-qwen2.5-1.5b-lora

## Resumen

clinicalScreen-qwen2.5-1.5b-lora es un adaptador LoRA publicado por el usuario code3084 sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Se trata de un ajuste fino mediante PEFT (Parameter-Efficient Fine-Tuning) orientado, a juzgar por su nombre y por el único dato de entrenamiento declarado en la model card, a tareas de cribado clínico (clinical screening) de criterios de elegibilidad, presumiblemente en el contexto de selección de participantes para ensayos clínicos. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo completo, por lo que requiere cargar el modelo base Qwen2.5-1.5B-Instruct para su uso.

El modelo hereda la arquitectura transformer decoder-only del Qwen2.5-1.5B-Instruct, con aproximadamente 1.500 millones de parámetros y una ventana de contexto de 32.768 tokens (característica de la familia Qwen2.5, no documentada explícitamente en este repositorio). El adaptador se distribuye en formato safetensors y se integra mediante la librería PEFT junto con transformers.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación muy pequeño, sin descargas ni interacciones, con una model card prácticamente vacía y sin resultados de evaluación publicados. Resulta útil como ejemplo de adaptación de un modelo pequeño a un dominio sanitario especializado, pero no debe considerarse un modelo listo para producción sin una validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre atención y proyecciones lineales |
| Parametros totales | ~1.500 millones en el modelo base; tamaño del adaptador no disponible (repo de 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct (no confirmado para el adaptador) |
| Tipos de cuantizacion | No disponible en el repositorio; el modelo base admite cuantización a 8 y 4 bits vía GPTQ, AWQ y GGUF, pero el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta múltiples idiomas, incluido el castellano) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2, transformers |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Pipeline | text-generation |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con un corpus multilingüe de gran escala y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO) para alineamiento conversacional. El adaptador LoRA congela los pesos originales e introduce matrices de bajo rango en determinadas capas, lo que reduce drásticamente el coste de ajuste.

La model card no documenta hiperparámetros de entrenamiento (rango del LoRA, alpha, tasa de aprendizaje, número de épocas, precisión mixta), ni la composición exacta del dataset. El único dato concreto es que los datos de entrenamiento proceden de "TrialGPT-Criterion-Annotations", un conjunto de anotaciones de criterios de elegibilidad de ensayos clínicos vinculado al sistema TrialGPT del National Center for Biotechnology Information (NCBI). No se especifica si hubo validación, partición de datos ni proceso de evaluación. La información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) no está disponible.

## Capacidades

- Generación de texto conversacional en formato instrucción, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Clasificación y cribado de criterios clínicos de elegibilidad, presumiblemente la tarea objetivo del ajuste (a partir del nombre del modelo y del dataset de entrenamiento).
- Extracción y estructuración de información a partir de descripciones de pacientes y criterios de inclusión/exclusión de ensayos.
- Razonamiento sobre texto biomédico de longitud moderada gracias al contexto de 32.768 tokens del modelo base.
- Soporte multilingüe heredado del modelo base (no confirmado explícitamente para el adaptador).
- Tool calling y function calling: el modelo base Qwen2.5-1.5B-Instruct los soporta, pero no hay evidencia de que el adaptador los preserve tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Cribado automatizado de participantes en ensayos clínicos: el adaptador puede evaluar si un paciente cumple los criterios de inclusión y exclusión de un protocolo, tarea para la que fue presumiblemente entrenado con las anotaciones de TrialGPT.
- Pre-filtrado de candidatos en bases de datos de historiales clínicos electrónicos: dado un conjunto de criterios, el modelo puede descartar rápidamente los casos claramente no elegibles antes de la revisión humana, reduciendo la carga del personal investigador.
- Asistencia a coordinadores de estudio: generar resúmenes de por qué un paciente cumple o no un criterio concreto, como borrador sujeto a validación por un clínico.
- Extracción de criterios estructurados desde protocolos en texto libre: el modelo puede transformar descripciones narrativas de criterios en representaciones más manejables para su uso en pipelines de selección.
- Investigación académica sobre NLP clínico: servir como línea base ligera (1,5B parámetros) para experimentos de ajuste fino con LoRA en tareas de elegibilidad, comparable con aproximaciones de mayor tamaño.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1,5B, puede desplegarse en una única GPU de consumo para pruebas de concepto antes de escalar a modelos mayores.
- Educación y demostraciones: ilustrar el flujo completo de ajuste PEFT sobre un modelo pequeño para una tarea sanitaria concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 3 GB de pesos más overhead de activaciones y caché KV, en torno a 4-6 GB en total para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~1,6 GB de pesos; en 4 bits: ~0,9 GB de pesos. El adaptador LoRA añade un coste marginal (repo de 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070); A100, H100 o L40S para despliegues con mayor concurrencia o contextos largos.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problemas en FP16.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM (soporte de adaptadores LoRA), TGI (soporte de adaptadores), llama.cpp/Ollama solo si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles para este adaptador. Como referencia orientativa del modelo base de 1,5B en una RTX 4090, cabría esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| clinicalScreen-qwen2.5-1.5b-lora | ~1,5B (base) + LoRA | 32.768 (base) | No disponible | Hugging Face, 0 descargas | Adaptador especializado en cribado clínico, sin evaluación publicada |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado | Modelo generalista; el adaptador parte de él |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2B | 128.000 | Llama 3.2 Community License | Hugging Face | Alternativa generalista de tamaño similar, con contexto mayor |
| google/gemma-2-2b-it | ~2,6B | 8.192 | Gemma Terms of Use | Hugging Face | Alternativa generalista algo mayor, contexto menor |

La comparación directa con modelos especializados en cribado clínico no está disponible en la información proporcionada. TrialGPT, el sistema del que procede el dataset de entrenamiento, emplea modelos de mayor tamaño (GPT-4 en su publicación original), por lo que este adaptador representa una alternativa mucho más ligera pero sin evidencia de rendimiento comparable.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no documenta licencia, idiomas, hiperparámetros, datos de evaluación ni limitaciones. El uso comercial es incierto y requiere contactar con el autor.
- No hay resultados de benchmarks ni validación clínica publicada; no debe usarse en decisiones sanitarias reales sin evaluación independiente y supervisión médica.
- Riesgo de alucinación inherente a un modelo de 1,5B: puede generar criterios inexistentes o malinterpretar descripciones clínicas ambiguas.
- El ajuste se realizó sobre un único dataset (TrialGPT-Criterion-Annotations), lo que puede provocar sobreajuste al estilo y dominio de ese corpus y escasa generalización a otros protocolos o sistemas sanitarios.
- El adaptador no incluye el modelo base; es necesario descargar Qwen2.5-1.5B-Instruct por separado y respetar su licencia (Apache 2.0).
- No hay evidencia de que el adaptador preserve las capacidades de tool calling, multilingüismo o razonamiento del modelo base; el ajuste fino puede degradarlas.
- Sesgos conocidos: no documentados para este adaptador; los sesgos del modelo base (demográficos, culturales, de idioma) probablemente persisten.
- Repositorio sin descargas ni interacciones: no hay comunidad que haya validado su funcionamiento, lo que aumenta el riesgo de errores en la configuración de carga.
- Fecha de creación indicada como 2026-11-10, posterior a la fecha actual de muchas referencias; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/code3084/clinicalScreen-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento (referencia): TrialGPT-Criterion-Annotations (no se proporciona enlace directo en la información disponible)
- Paper de TrialGPT (referencia contextual, no citado en el repositorio): no disponible en la información proporcionada
- Paper de PEFT/LoRA citado en los tags (arxiv:1910.09700, Lacoste et al. sobre impacto ambiental): https://arxiv.org/abs/1910.09700
