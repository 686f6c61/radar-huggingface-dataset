# jkxie/Llama3.1-8B-contam-calc

## Resumen

Llama3.1-8B-contam-calc es un ajuste fino completo (full fine-tuning) del modelo meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario jkxie en HuggingFace. El entrenamiento se realizó sobre el conjunto de datos MSCalc, según la propia model card, con el objetivo aparente de adaptar el modelo base a tareas de cálculo y razonamiento aritmético, aunque la ficha del autor no especifica con detalle ni el propósito exacto ni las capacidades resultantes. El repositorio tiene un tamaño de 16,1 GB y solo acumula 11 descargas y 0 interacciones, lo que indica que se trata de un experimento de investigación sin adopción comunitaria significativa.

El modelo hereda la arquitectura del Llama 3.1 8B Instruct: un transformer decoder-only con 8.000 millones de parámetros, atención con Grouped Query Attention (GQA) y una ventana de contexto de 128.000 tokens. Al estar basado en la versión Instruct, parte de un modelo ya alineado mediante instrucciones y con soporte de conversación multi-turno, tool calling y capacidades multilingües. No se declaran parámetros activos porque no es un modelo de mezcla de expertos.

Su relevancia es limitada y muy específica: sirve como ejemplo reproducible de un pipeline de fine-tuning completo con LLaMA-Factory sobre dos GPU y como punto de partida para quien quiera investigar la adaptación de Llama 3.1 a dominios de cálculo. No debe considerarse un modelo listo para producción: la documentación es prácticamente inexistente, no hay benchmarks publicados y la licencia queda marcada como "other", lo que arrastra las condiciones de la licencia comunitaria de Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (GQA), heredada del modelo base Llama 3.1 8B Instruct |
| Parametros totales | ~8.000 millones (derivado del modelo base). La API de safetensors del repositorio reporta 266.240, cifra inconsistente con el tamano del modelo base y probablemente referida a otro campo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no se documenta si el fine-tuning la modifica) |
| Tipos de cuantizacion | No disponible en el repositorio oficial, que solo contiene pesos en safetensors. Al ser un modelo Llama, es convertible a GGUF, AWQ o GPTQ con herramientas externas, pero no hay versiones publicadas por el autor |
| Idiomas soportados | No declarados en la model card. El modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | other (se heredan las condiciones de la licencia comunitaria de Llama 3.1) |
| Formato de pesos | safetensors (tamano del repositorio: 16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, sin modificaciones estructurales: un transformer decoder-only de 8.000 millones de parámetros con normalización RMSNorm, activación SwiGLU, codificación posicional RoPE y Grouped Query Attention para reducir el coste de memoria de la caché KV. El ajuste se realizó con la técnica de fine-tuning completo (etiqueta "full" en el repositorio), es decir, actualizando todos los pesos en lugar de emplear LoRA o QLoRA. Esto explica el tamaño del repositorio (16,1 GB) y el coste de entrenamiento.

Los hiperparámetros documentados son los siguientes: tasa de aprendizaje 1e-5 con scheduler coseno y warmup del 10 %, batch de entrenamiento total de 4 (batch 1 por dispositivo, 2 dispositivos, 2 pasos de acumulación de gradiente), batch de evaluación de 16, semilla 42, optimizador adamw_torch_fused con betas (0,9; 0,999) y epsilon 1e-8, y 5 épocas completas. El entrenamiento se distribuyó en 2 GPU. Las versiones de framework empleadas fueron Transformers 4.56.1, PyTorch 2.9.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.1.

No se documenta el volumen de tokens de entrenamiento, la composición del dataset MSCalc (más allá del nombre), la existencia de fases de RLHF o DPO adicionales, ni ninguna innovación técnica como decodificación especulativa o atención lineal. La model card es una plantilla autogenerada por el Trainer y contiene los apartados "Model description", "Intended uses & limitations" y "Training and evaluation data" literalmente marcados como "More information needed".

## Capacidades

- Generación de texto conversacional, heredada del modelo Instruct base.
- Razonamiento aritmético y cálculo: es el dominio declarado del ajuste, aunque no se especifica el alcance ni el rendimiento alcanzado.
- Razonamiento multi-paso y matemáticas generales: presumiblemente heredados del modelo base, sin evidencia documentada de mejora o degradación.
- Tool calling y function calling: el modelo base Llama 3.1 8B Instruct los soporta de forma nativa; no hay confirmación de que el fine-tuning los preserve.
- Capacidades de agente y razonamiento multi-turno: heredadas del modelo base, sin validación publicada.
- Capacidades multilingües: las del modelo base (8 idiomas), sin datos específicos sobre el ajuste.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" o razonamiento extendido explícito: no disponible.

## Casos de uso

- Experimentación académica en ajuste fino completo: sirve como referencia reproducible de un pipeline de LLaMA-Factory con 2 GPU, hiperparámetros documentados y versiones de framework concretas, útil para investigadores que quieran replicar o comparar estrategias de fine-tuning.
- Estudio de adaptación de dominio a tareas de cálculo: permite analizar cómo un ajuste completo sobre un dataset aritmético específico (MSCalc) afecta al comportamiento de un modelo Instruct de propósito general.
- Comparación de metodologías de fine-tuning: al existir múltiples variantes publicadas por el mismo autor con el mismo esquema de entrenamiento, puede emplearse en estudios comparativos entre full fine-tuning y otras técnicas.
- Base para ajustes posteriores de investigación: al ser un checkpoint completo en safetensors, puede usarse como punto de partida para nuevos entrenamientos con LoRA o continuaciones del ajuste.
- Generación de datos sintéticos de cálculo: con las debidas precauciones y validación, podría emplearse para producir ejemplos aritméticos de forma masiva dentro de pipelines de investigación.
- Evaluación de robustez y regresiones: útil para medir qué capacidades del modelo base se degradan tras 5 épocas de ajuste completo sobre un dataset estrecho, un fenómeno relevante en la literatura de olvido catastrófico.
- No se recomienda su uso en aplicaciones de producción orientadas a usuario final, dada la ausencia de benchmarks, de documentación de alineación y de garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara la entrada "llama3.1-8b-it" con una lista de resultados vacía (`results: []`), y la sección "Training results" de la model card está en blanco. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para inferencia en precision completa (bf16/fp16): aproximadamente 16 GB solo para los pesos, más la memoria de la caché KV. Con 128.000 tokens de contexto, la caché KV puede consumir decenas de GB adicionales; se recomienda limitar la longitud de contexto en la práctica.
- VRAM con cuantización de 8 bits: en torno a 8-9 GB de pesos. Con cuantización de 4 bits: en torno a 5-6 GB de pesos. Estas conversiones no están publicadas por el autor y habría que generarlas.
- GPU recomendadas para precision completa: A100 40 GB, H100 80 GB, A6000 48 GB o 2 x RTX 4090 24 GB con reparto de capas.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bf16 si se limita el contexto; en RTX 3090 (24 GB) o RTX 4080 (16 GB) requerirá cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM y TGI (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`), transformers de forma nativa, y llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en ninguna configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jkxie/Llama3.1-8B-contam-calc | ~8.000 M | 128.000 tokens | Fine-tuning completo de Llama 3.1 8B Instruct sobre MSCalc | other | HuggingFace, 11 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8.000 M | 128.000 tokens | Instruct alineado con RLHF/DPO | Llama 3.1 Community License | HuggingFace y multiples proveedores |
| Qwen/Qwen2.5-7B-Instruct | 7.600 M | 128.000 tokens | Instruct multilingue | Apache 2.0 | HuggingFace y multiples proveedores |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.200 M | 32.000 tokens | Instruct | Apache 2.0 | HuggingFace |

No hay datos de rendimiento comparado disponibles para el modelo objeto de esta ficha, por lo que la comparación se limita a parámetros, contexto, tipo y licencia. En igualdad de condiciones, los tres modelos de referencia cuentan con benchmarks publicados, comunidad activa y, en el caso de Qwen2.5 y Mistral, licencias permisivas para uso comercial.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluación publicada que permita estimar la calidad del modelo ni compararlo con el base.
- Documentación mínima: la model card es una plantilla autogenerada con los apartados principales sin rellenar. Se desconoce el contenido exacto del dataset MSCalc, su origen, su licencia y su composición.
- Riesgo elevado de olvido catastrófico: 5 épocas de ajuste completo con tasa de aprendizaje 1e-5 sobre un dataset estrecho pueden degradar capacidades generales del modelo base (conocimiento factual, tool calling, multilingüismo). No hay evaluación que lo descarte.
- Riesgo de alucinación: al igual que el modelo base, puede generar información falsa con apariencia de verosimilitud, especialmente en razonamiento aritmético de varios pasos. Sin benchmarks no es posible cuantificarlo.
- Sesgos: no se documenta ningún proceso de evaluación o mitigación de sesgos. Hereda los sesgos del modelo base y de los datos de ajuste, que se desconocen.
- Licencia "other": no es una licencia permisiva estándar. Al derivar de Llama 3.1, se aplican los términos de la Llama 3.1 Community License, que impone restricciones de uso (por ejemplo, para entidades con más de 700 millones de usuarios mensuales) y obligaciones de atribución. Es imprescindible revisar los términos antes de cualquier uso comercial.
- Idiomas: no se declaran idiomas soportados para este ajuste concreto. Un fine-tuning sobre un dataset probablemente monolingüe puede degradar el rendimiento en idiomas distintos del inglés, incluido el español.
- Advertencia de producción: la combinación de cero benchmarks, documentación incompleta, licencia no estándar y 11 descargas hace desaconsejable su uso en cualquier sistema productivo.
- Los resultados de la búsqueda web asociados a este modelo no contienen información relevante: se trata de páginas del portal francés de pago de multas (amendes.gouv.fr) sin relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkxie/Llama3.1-8B-contam-calc
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de Llama 3.1 (The Llama 3 Herd of Models): https://arxiv.org/abs/2407.21783
- Repositorio de LLaMA-Factory, herramienta empleada para el ajuste: https://github.com/hiyouga/LLaMA-Factory
- Dataset MSCalc: no disponible (no se proporciona enlace en la model card)
- Demo o espacio interactivo: no disponible
- Blog o documentación adicional del autor: no disponible
