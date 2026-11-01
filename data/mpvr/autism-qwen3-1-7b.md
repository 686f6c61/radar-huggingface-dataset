# Mpvr/autism-qwen3-1.7b

## Resumen

`Mpvr/autism-qwen3-1.7b` es un ajuste fino (fine-tune) del modelo base Qwen3-1.7B-Base, publicado por el usuario Mpvr en HuggingFace. Se trata de un modelo de generacion de texto de tipo causal, desarrollado sobre la arquitectura transformer densa de la familia Qwen3, con 2.031.739.904 parametros totales segun los pesos en safetensors. El nombre del repositorio sugiere un ajuste orientado a contenido o conversacion relacionada con el autismo, aunque la model card no documenta ni el dataset de ajuste ni el proceso de entrenamiento especifico.

El modelo hereda las caracteristicas tecnicas del Qwen3-1.7B original: 28 capas, atencion con GQA (16 cabezas para Q y 8 para KV), una longitud de contexto de 32.768 tokens y soporte para modos de razonamiento (thinking) y no razonamiento (non-thinking) conmutables. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio tiene un tamano de 4,1 GB y cuenta con 28 descargas y 0 likes en el momento de la consulta.

La relevancia de este modelo es limitada y fundamentalmente experimental: al no documentarse el dataset de ajuste ni los resultados de evaluacion, su utilidad practica depende de la validacion por parte del usuario. Es relevante como ejemplo de fine-tune comunitario sobre la base Qwen3-1.7B, un modelo pequeno y eficiente que puede ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) |
| Parametros totales | 2.031.739.904 (2,03 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo base soporta GGUF, AWQ, GPTQ a traves de herramientas de la comunidad) |
| Idiomas soportados | No disponible (el modelo base Qwen3 soporta 100+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3 densa: 28 capas transformer con atencion de tipo grouped-query attention (GQA), con 16 cabezas para las queries y 8 para las claves/valores. El modelo base Qwen3-1.7B cuenta con 1,4 B de parametros no de embedding (excluyendo la matriz de embeddings), y fue entrenado en dos fases: preentrenamiento y postentrenamiento (instruccion y alineacion). La model card del fine-tune no especifica el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se emplearon tecnicas de RLHF o DPO en esta adaptacion concreta.

La innovacion tecnica principal heredada del modelo base es la capacidad de conmutar entre modo de razonamiento (thinking) y modo directo (non-thinking) mediante el parametro `enable_thinking` en la plantilla de chat, generando contenido de razonamiento envuelto en etiquetas `<think>...</think>`. El fine-tune no documenta ninguna modificacion arquitectonica adicional ni innovacion propia; se desconoce si se congelaron capas, se aplico LoRA o se hizo un ajuste completo.

## Capacidades

- Generacion de texto conversacional y completado de texto en modo causal.
- Razonamiento logico y matematico en modo thinking (heredado del modelo base Qwen3).
- Generacion de codigo y comprension de lenguajes de programacion (capacidad del modelo base).
- Soporte de tool calling y function calling (capacidad del modelo base Qwen3).
- Capacidades de agente y razonamiento multi-paso (heredadas del modelo base).
- Soporte multilingue amplio (el modelo base declara 100+ idiomas y dialectos).
- Modo thinking/non-thinking conmutable mediante `enable_thinking`.
- No se documentan capacidades especificas adicionales derivadas del ajuste fino (por ejemplo, si el fine-tune mejora el conocimiento sobre autismo o adapta el tono conversacional).

## Casos de uso

- **Prototipado rapido de asistentes conversacionales**: al ser un modelo de 2 B de parametros con contexto de 32.768 tokens, puede desplegarse en una unica GPU de consumo para iterar sobre prompts y plantillas de chat sin coste de infraestructura elevado.
- **Clasificacion y generacion de texto en espanol**: aunque el fine-tune no documenta idiomas, el modelo base Qwen3 soporta espanol; puede emplearse para tareas de generacion controlada, resumen o reescritura en pipelines de procesamiento de lenguaje natural.
- **Investigacion sobre fine-tuning de modelos pequenos**: el repositorio sirve como referencia para estudiar como se comporta un ajuste comunitario sobre Qwen3-1.7B-Base, comparando respuestas antes y despues del ajuste.
- **Generacion de codigo en entornos con recursos limitados**: el modelo base Qwen3-1.7B tiene capacidad de generacion de codigo; puede integrarse en editores o scripts de automatizacion donde no sea viable un modelo de mayor tamano.
- **Despliegue en local con llama.cpp u Ollama**: al derivar de Qwen3-1.7B, es convertible a GGUF y ejecutable en CPU o GPU de gama media, adecuado para demos offline y pruebas de concepto.
- **Sistemas de agentes simples con tool calling**: el modelo base soporta integracion con herramientas externas; puede usarse en flujos de agente de un solo paso o pocos pasos con APIs ligeras.
- **Evaluacion de sesgos y contenido sensible**: dado el nombre del repositorio, puede emplearse en estudios sobre como un fine-tune tematico afecta al tono, la terminologia y la seguridad de las respuestas en torno al autismo, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del fine-tune no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base. Los datos de rendimiento del Qwen3-1.7B original no se han proporcionado en la informacion disponible para esta ficha.

## Requisitos de hardware

- **VRAM estimada para inferencia en FP16/BF16**: aproximadamente 4,1 GB solo para pesos (2,03 B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 5 y 7 GB para contextos moderados.
- **VRAM estimada en cuantizacion de 8 bits**: alrededor de 2,5-3 GB para pesos.
- **VRAM estimada en cuantizacion de 4 bits (GGUF Q4)**: alrededor de 1,5-2 GB para pesos, lo que permite ejecucion en GPUs de consumo con 4 GB o mas.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para FP16 con contexto largo; A100 o H100 no son necesarias para este tamano, pero permiten mayor throughput en serving.
- **Cabe en GPU de consumo**: si, en GPUs con 6 GB o mas en FP16 y en GPUs con 4 GB o mas en cuantizacion 4 bits.
- **Opciones de despliegue**: transformers (requiere `transformers>=4.51.0`), vLLM (`>=0.8.4`), SGLang (`>=0.4.6.post1`), llama.cpp, Ollama, LM Studio, MLX-LM.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. Para un modelo de 2 B en una RTX 4090, cabria esperar decenas de tokens por segundo, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mpvr/autism-qwen3-1.7b | 2,03 B | 32.768 | Apache 2.0 | HuggingFace (28 descargas) | Fine-tune comunitario sin benchmarks publicados |
| Qwen/Qwen3-1.7B | 1,7 B (1,4 B no embedding) | 32.768 | Apache 2.0 | HuggingFace, oficial | Modelo base con benchmarks publicados por Qwen |
| Qwen/Qwen3-1.7B-Base | 1,7 B | 32.768 | Apache 2.0 | HuggingFace, oficial | Version base preentrenada, sin postentrenamiento |
| Modelos de ~2 B de otras familias (p. ej., Llama 3.2 1B, Gemma 2 2B) | 1-2 B | 8.192-131.072 | Licencias variables | HuggingFace | Alternativas de tamano similar; no se dispone de comparacion de rendimiento con este fine-tune |

La comparacion directa de rendimiento no es posible porque el fine-tune no publica metricas. Frente al Qwen3-1.7B oficial, la diferencia principal es la ausencia de documentacion y evaluacion; frente a modelos de otras familias, la ventaja es la licencia Apache 2.0 y el contexto de 32.768 tokens.

## Limitaciones y advertencias

- **Falta de documentacion del fine-tune**: no se especifica el dataset, el proceso de entrenamiento ni los objetivos del ajuste; el nombre del repositorio sugiere una tematica concreta, pero no hay validacion publicada.
- **Riesgo de alucinacion**: como todo modelo generativo de 2 B, puede producir informacion incorrecta, especialmente en dominios especializados; no hay evaluacion que cuantifique este riesgo.
- **Sesgos conocidos**: no documentados para este fine-tune; el modelo base Qwen3 puede presentar sesgos de genero, culturales y linguisticos, y un ajuste tematico no evaluado puede amplificarlos o introducir otros nuevos.
- **Limitaciones de contexto e idioma**: el contexto maximo es de 32.768 tokens; no se documentan idiomas soportados especificamente por el fine-tune, aunque el base declara 100+ idiomas. El rendimiento en espanol no esta verificado para esta adaptacion.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se recomienda conservar el aviso de licencia y verificar que el fine-tune no incorpore datos con licencias incompatibles (no documentado).
- **Caveat para produccion**: al no haber benchmarks ni evaluacion de seguridad, no se recomienda su uso en produccion sin una validacion exhaustiva previa, especialmente en aplicaciones sensibles (salud, educacion, atencion a personas con autismo).
- **Riesgo de repeticiones infinitas**: la model card del base advierte que, si se producen repeticiones, se ajuste `presence_penalty` a 1,5 y se sigan los parametros de muestreo recomendados (temperatura 0,6, top-p 0,95, top-k 20, min-p 0 en modo thinking).

## Enlaces

- Repositorio HuggingFace del fine-tune: https://huggingface.co/Mpvr/autism-qwen3-1.7b
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Modelo Qwen3-1.7B (instruct): https://huggingface.co/Qwen/Qwen3-1.7B
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
