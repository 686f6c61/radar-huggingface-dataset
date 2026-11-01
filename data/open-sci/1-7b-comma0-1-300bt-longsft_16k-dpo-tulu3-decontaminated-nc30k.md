# open-sci/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated-nc30k

## Resumen

El modelo `open-sci/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated-nc30k` es un ajuste fino supervisado (SFT) de la familia Comma, publicado por el colectivo open-sci. Se construye sobre el checkpoint `ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated`, que a su vez deriva de un modelo base de aproximadamente 1.700 millones de parámetros entrenado con 300.000 millones de tokens y posteriormente alineado con DPO sobre datos de Tulu3. Este ajuste adicional emplea el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un conjunto de 30.000 ejemplos en formato ShareGPT orientado a instrucciones y conversación.

El resultado es un modelo de 1.714.377.728 parámetros almacenados en safetensors (3,4 GB en FP16/BF16), con licencia "other" y pipeline declarado como `feature-extraction`, aunque el entrenamiento SFT indica un uso previsto de generación de texto conversacional. Su relevancia es limitada y experimental: se trata de un artefacto de investigación con 16 descargas y sin métricas publicadas, útil como caso de estudio de pipelines de ajuste fino con LLaMA-Factory y de modelos pequeños alineados para instrucciones.

La model card es en gran medida autogenerada por el Trainer y no documenta usos previstos, limitaciones ni composición del dataset de entrenamiento. La información disponible sobre idiomas, cuantizaciones y contexto efectivo es escasa o inexistente, por lo que debe tratarse como un checkpoint de laboratorio más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Comma, derivada de la estirpe del modelo base); detalles exactos no disponibles |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el nombre del modelo base sugiere entrenamiento con secuencias de 16k, sin confirmación oficial) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | other (no se especifican términos concretos en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA) de un transformer decoder-only de 1,7B parámetros. El nombre del checkpoint base indica una cadena de entrenamiento previa: un preentrenamiento o entrenamiento continuado con 300.000 millones de tokens, un SFT de contexto largo (16k), una fase de DPO y una destilación o filtrado de datos de Tulu3 con decontaminación. Sobre esa base, open-sci aplica un SFT adicional con el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, en formato ShareGPT.

Los hiperparámetros documentados son: learning rate de 4e-5 con scheduler coseno y warmup del 10 %, batch total de 128 (1 por dispositivo, 32 dispositivos, 4 pasos de acumulación), 5 épocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, semilla 42. El entrenamiento se ejecutó con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2, presumiblemente mediante LLaMA-Factory (etiqueta `llama-factory` y `full`). No se documenta el número total de tokens vistos, la composición del dataset ni si hubo fases de RLHF o DPO posteriores a este SFT.

## Capacidades

- Generación de texto conversacional e instrucciones: el SFT sobre ShareGPT apunta a seguir instrucciones multi-turno.
- Razonamiento y conocimiento general: heredado del preentrenamiento de 300B tokens del modelo base, sin evaluación publicada.
- Codigo y matematicas: capacidad esperable por la estirpe del modelo base, pero sin benchmarks que la respalden.
- Tool calling / function calling: no documentado; no hay evidencia de soporte nativo.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que puede usarse para obtener embeddings del último estado oculto, aunque no es su uso previsto original.

## Casos de uso

- Experimentación académica con pipelines de SFT: sirve para reproducir el flujo de LLaMA-Factory con full fine-tuning sobre un dataset ShareGPT y comparar hiperparámetros; su tamaño de 1,7B permite iterar en un solo nodo multi-GPU.
- Generación de texto en prototipos de bajo coste: al caber en GPUs de consumo en FP16, puede desplegarse para demos de chatbots o asistentes internos sin requisitos de infraestructura elevados.
- Evaluación de alineación y decontaminación: útil para estudiar el efecto de la cadena DPO + Tulu3 decontaminado sobre el comportamiento conversacional en modelos pequeños.
- Extracción de embeddings para clasificación o clustering: dado su pipeline `feature-extraction`, puede emplearse para representar frases o documentos en tareas de recuperación de información a pequeña escala.
- Base para ajustes posteriores con LoRA/QLoRA: al ser un checkpoint completo en safetensors, es un punto de partida razonable para experimentos de especialización en dominios concretos con recursos limitados.
- Investigación sobre contexto largo: si se confirma la ventana de 16k del modelo base, puede usarse para probar tareas de resumen o QA sobre documentos largos en entornos de laboratorio.

## Benchmarks y rendimiento

La model card declara un `model-index` con una única entrada (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__1-7b-Comma0-28152b6d__sdpa-open-sci-99666fc9`) cuyo array de resultados está vacío. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16/BF16 para los pesos, más overhead de activaciones y KV cache; en la práctica, unos 5-6 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB de pesos; en 4 bits, alrededor de 1 GB (requiere cuantización propia, no hay GGUF oficial).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100/H100 no son necesarias para inferencia, solo para reentrenamiento.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: transformers (nativo), vLLM y TGI para serving; llama.cpp/Ollama requerirían conversión manual a GGUF, no disponible oficialmente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-Comma0.1-...-nc30k | 1,71B | no disponible | other | HuggingFace, 16 descargas | SFT experimental, sin benchmarks |
| ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated | ~1,7B | 16k (según nombre) | no disponible | HuggingFace | Modelo base del anterior, con DPO |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado | Alternativa madura con benchmarks públicos |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 | Apache 2.0 | HuggingFace | Modelo pequeño alineado con evaluación publicada |

La comparación directa es difícil porque el modelo de open-sci carece de métricas y de documentación de licencia. Frente a alternativas como Qwen2.5-1.5B-Instruct o SmolLM2-1.7B-Instruct, presenta un tamaño similar pero sin garantías de rendimiento ni términos de uso claros.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales.
- Model card autogenerada: las secciones de usos previstos, limitaciones y datos de entrenamiento están sin completar ("More information needed").
- Licencia "other" sin texto: no se especifican condiciones de uso comercial, atribución ni restricciones; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no documentados: no se puede garantizar un rendimiento aceptable fuera del inglés, idioma probable del dataset ShareGPT.
- Riesgo de alucinación: inherente a modelos de 1,7B sin evaluación de fidelidad; especialmente alto en dominios especializados.
- Contexto efectivo incierto: aunque el nombre del modelo base menciona 16k, no se confirma la ventana real tras el SFT ni su comportamiento en secuencias largas.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse compatibilidad con frameworks de function calling.
- Artefacto de investigación: 16 descargas y 0 likes indican escasa validación por la comunidad; no se recomienda su uso en producción sin una evaluación propia exhaustiva.
- Dataset de entrenamiento no descrito: se desconoce la composición, procedencia y posibles sesgos del conjunto Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-sci/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Nemotron (familia de datasets y modelos de NVIDIA): https://huggingface.co/nvidia
- Tulu3 (dataset de alineación): https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
