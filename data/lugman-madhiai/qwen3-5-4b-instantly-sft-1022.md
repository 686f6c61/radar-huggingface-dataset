# lugman-madhiai/Qwen3.5-4B-Instantly-SFT-1022

## Resumen

Qwen3.5-4B-Instantly-SFT-1022 es un ajuste fino (SFT) del modelo Qwen/Qwen3.5-4B, publicado por el usuario lugman-madhiai en HuggingFace. Se trata de un modelo de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) distribuido en formato safetensors, con un repositorio de 9,3 GB, lo que es coherente con pesos almacenados en bf16 o fp16. El pipeline declarado es image-text-to-text, por lo que el modelo se presenta como multimodal de entrada (imagen y texto), aunque la model card no aporta detalles sobre el codificador visual ni sobre la resolución de imagen soportada.

El modelo deriva del Qwen3.5-4B y se ha entrenado, según el autor, con Unsloth y la librería TRL de HuggingFace, lo que el autor cifra en una velocidad de entrenamiento 2 veces superior. La model card es mínima: no documenta el conjunto de datos de ajuste, el número de tokens de entrenamiento, la metodología de alineación ni resultados de evaluación. El identificador del repositorio ("Instantly-SFT-1022") sugiere un proceso de ajuste supervisado automatizado o estandarizado, sin más detalle público.

Su relevancia actual es limitada pero identificable: es un ejemplo de ajuste fino ligero y de bajo coste sobre una familia de modelos reciente, útil para quien quiera inspeccionar el flujo Unsloth + TRL sobre Qwen3.5, o partir de un checkpoint afinado en inglés con licencia Apache 2.0. Con 8 descargas y 0 likes en el momento de la consulta, no cuenta con validación comunitaria ni evaluación publicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`); detalles de atención, número de capas y cabezas no disponibles |
| Parametros totales | 4.659.865.088 (aprox. 4,66 B, dato de safetensors) |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors (9,3 GB para 4,66 B de parámetros, coherente con bf16/fp16) |
| Idiomas soportados | inglés (`en`, declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un transformer de la familia Qwen3.5, con 4,66 B de parámetros totales, derivado del checkpoint Qwen/Qwen3.5-4B. El pipeline declarado (image-text-to-text) implica que el modelo acepta entradas de imagen y texto, pero no se especifican ni la arquitectura del codificador visual, ni la estrategia de fusión multimodal, ni si el ajuste fino ha modificado los pesos del codificador o únicamente los del decodificador de lenguaje. Tampoco se indica si el modelo base emplea mezcla de expertos, atención lineal u otra innovación de eficiencia; el recuento de parámetros se presenta como total, sin campo de parámetros activos.

En cuanto al entrenamiento, el autor indica que el ajuste se realizó con Unsloth y TRL, con una mejora de velocidad de 2 veces respecto a un entrenamiento convencional. No se documentan el número de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni hiperparámetros relevantes (tasa de aprendizaje, epochs, longitud de secuencia). La etiqueta `conversational` sugiere que el ajuste se orientó a formato de diálogo, pero no hay ejemplos de prompt ni plantilla de chat publicada.

## Capacidades

- Generación de texto conversacional en inglés, según el tag `conversational` y el pipeline declarado.
- Procesamiento de entradas image-text-to-text: el pipeline indica soporte de imagen junto a texto, aunque no se detalla resolución, número de imágenes por petición ni tareas visuales cubiertas.
- Compatibilidad con endpoints de HuggingFace (tag `endpoints_compatible`).
- Compatibilidad declarada con text-generation-inference (TGI).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clon conversacional en inglés para prototipado: el modelo puede usarse como base de un chatbot de dominio general en inglés gracias a su ajuste supervisado sobre formato conversacional, con la ventaja de un despliegue ligero (4,66 B de parámetros).
- Evaluación de pipelines de ajuste fino: sirve como checkpoint de referencia para comparar resultados de flujos Unsloth + TRL frente al Qwen3.5-4B original, ya que comparte arquitectura y tokenizador con el modelo base.
- Extracción de información a partir de documentos con imagen: el pipeline image-text-to-text permitiría, en principio, pasar capturas o páginas escaneadas junto a una instrucción en inglés para obtener campos estructurados, siempre que se valide empíricamente el comportamiento visual.
- Generación asistida de descripciones de imágenes en inglés: tareas de alt-text o etiquetado semiautomático en catálogos y repositorios multimedia, con revisión humana posterior.
- Base para ajustes posteriores (continual fine-tuning): al estar bajo Apache 2.0 y en safetensors, puede recargarse con transformers o PEFT/LoRA para especializar en un dominio concreto sin partir de cero.
- Servicio interno de bajo coste en una sola GPU: al ocupar aproximadamente 9,3 GB en bf16, encaja en GPUs de consumo alto o en instancias modestas de cloud para inferencia por lotes, sin necesidad de infraestructura multi-GPU.
- Experimentación académica sobre olvido catastrófico: comparar las respuestas del checkpoint frente al modelo base permite estudiar qué capacidades se degradan tras un SFT del que no se publica el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 9,3 GB solo para pesos, más KV cache y activaciones; en la práctica, entre 11 y 14 GB en función de la longitud de contexto y del tamaño de lote.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB de pesos; en 4 bits, en torno a 2,5-3 GB. Son estimaciones por tamaño, no cifras publicadas por el autor.
- GPU recomendadas: A100 (40/80 GB) o H100 para servir con lotes grandes y contexto largo; RTX 4090 (24 GB) o L40S para inferencia en bf16 sin restricciones.
- Cabe en GPU de consumo: sí. En bf16 encaja con holgura en RTX 4090, RTX 4080 (16 GB) y de forma ajustada en RTX 3060 de 12 GB con contexto corto; en cuantización de 4 bits cabría en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (TGI, tag explícito) y endpoints compatibles de HuggingFace. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia. El soporte en vLLM no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Instantly-SFT-1022 (este) | 4,66 B | no disponible | sin benchmarks publicados | Apache 2.0 | safetensors en HF, 8 descargas |
| Qwen/Qwen3.5-4B (modelo base) | ~4,66 B (por el ajuste derivado) | no disponible | no disponible en esta información | no disponible en esta información | disponible en HuggingFace |
| Otras alternativas de ~4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de benchmarks, contexto o licencia de modelos comparables dentro de la información proporcionada; la comparación con el modelo base se limita a la relación de derivación declarada en la model card.

## Limitaciones y advertencias

- Model card prácticamente vacía: no se documentan dataset, hiperparámetros, evaluación ni plantilla de chat, lo que impide reproducir el entrenamiento o anticipar su comportamiento.
- Sin benchmarks ni validación comunitaria: 8 descargas y 0 likes en el momento de la consulta; no hay evidencia pública de calidad.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala y acentuado por la ausencia de evaluación y de documentación sobre alineación o filtros de seguridad.
- Sesgos: no documentados; al entrenarse sobre un corpus no especificado en inglés, pueden persistir sesgos culturales y lingüísticos del modelo base y del dataset de ajuste.
- Idioma: solo se declara inglés; el rendimiento en castellano u otras lenguas no está garantizado y podría degradarse respecto al modelo base tras el ajuste.
- Capacidad multimodal declarada pero no verificada: el tag image-text-to-text no va acompañado de ejemplos, límites de resolución ni evaluación visual.
- Riesgo de olvido catastrófico: un SFT del que no se publica la composición puede haber reducido capacidades del modelo base (código, matemáticas, multilingüismo).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar que los términos del modelo base Qwen3.5-4B sean compatibles, ya que la información disponible no detalla la licencia del checkpoint original.
- Ausencia de pesos cuantizados oficiales: cualquier despliegue en GGUF o GPTQ requeriría conversión y validación propias.
- Fecha de publicación registrada en 2026-10-21, con actualización el mismo día: no ha habido revisiones posteriores documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/Qwen3.5-4B-Instantly-SFT-1022
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: no se incluye enlace en la model card; disponible en la documentación oficial de HuggingFace.
