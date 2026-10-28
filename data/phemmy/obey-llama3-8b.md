# Phemmy/obey-llama3-8b

## Resumen

`Phemmy/obey-llama3-8b` es un ajuste fino (fine-tuning) publicado en HuggingFace por el usuario Phemmy sobre `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, es decir, sobre una versión cuantizada a 4 bits en formato bitsandbytes del conocido Llama 3.1 8B Instruct de Meta. Se trata, por tanto, de un derivado de 8.000 millones de parámetros con arquitectura transformer decoder-only, orientado a generación de texto conversacional y entrenado con la librería Unsloth, que acelera el proceso de fine-tuning sobre GPUs de consumo.

El modelo no aporta documentación técnica propia: la model card se limita a indicar el autor, la licencia Apache 2.0, el modelo base y el uso de Unsloth. No se especifican datos de entrenamiento, hiperparámetros, composición del dataset ni resultados de evaluación, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

Su relevancia es limitada y de nicho: sirve como ejemplo de fine-tuning ligero reproducible con Unsloth y como posible punto de partida para experimentos, pero no debe confundirse con un modelo listo para producción, dado que no hay evidencia publicada de su comportamiento ni de qué comportamiento específico pretendía modificar el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention (heredada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030 millones (modelo base; no se indica recuento propio tras el ajuste) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens en el modelo base; no se especifica si el ajuste la modifica |
| Tipos de cuantizacion | No disponible en la model card. El base se distribuye en 4 bits (bnb-4bit) y los pesos del repositorio son safetensors; no se publican variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Inglés (`en`) según la etiqueta de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: el tamaño del repositorio (0,2 GB) es muy inferior al de un checkpoint completo de 8B en FP16 (unos 16 GB) o incluso en 4 bits (unos 5-6 GB), lo que apunta a que el repositorio contiene adaptadores LoRA y no pesos fusionados. La model card no lo confirma de forma explícita.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only de 32 capas, dimensión oculta 4096, 32 cabezas de atención con 8 cabezas KV (GQA), vocabulario de 128.256 tokens y ventana de contexto de 128.000 tokens. El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado mediante RLHF y DPO; los detalles completos están en la documentación oficial de Meta, no en este repositorio.

Sobre el proceso de ajuste, la única información disponible es que se realizó con Unsloth y que partió de una versión del base cuantizada a 4 bits en bitsandbytes. No se documentan el número de pasos, la tasa de aprendizaje, el dataset utilizado, la técnica de adaptación (LoRA/QLoRA u otra) ni si hubo fusión de pesos. El nombre del repositorio («obey») sugiere un ajuste orientado a mejorar la obediencia a instrucciones, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Llama 3.1 8B Instruct.
- Razonamiento básico, matemáticas elementales y generación de código, en la medida en que lo permite un modelo de 8B.
- Soporte de tool calling / function calling, disponible en Llama 3.1 Instruct mediante plantillas de prompt específicas.
- Capacidad de seguir instrucciones y mantener rol de sistema, usuario y asistente.
- Multilingüismo limitado en la práctica: la etiqueta oficial del repositorio declara únicamente inglés.
- Capacidades específicas del ajuste (por ejemplo, mayor obediencia a restricciones): no documentadas ni verificables sin evaluación propia.
- No se declaran capacidades de visión, audio, thinking mode explícito ni decodificación especulativa.

## Casos de uso

- Experimentación con fine-tuning: el repositorio sirve como referencia de un ajuste realizado con Unsloth sobre un base cuantizado a 4 bits, útil para replicar el flujo de trabajo en una GPU de consumo.
- Evaluación comparativa de derivados: permite medir en un banco de pruebas propio si el ajuste mejora la adherencia a instrucciones restrictivas frente al Llama 3.1 8B Instruct original.
- Prototipado de asistentes conversacionales en inglés: con 128.000 tokens de contexto en el base, admite documentos largos como entrada en pruebas de concepto.
- Generación de código asistida en entornos de desarrollo: el base rinde de forma razonable en tareas de autocompletado y explicación de fragmentos, siempre con revisión humana.
- Extracción de información estructurada en pipelines internos en inglés, apoyándose en tool calling para devolver JSON con un esquema fijo.
- Investigación sobre alineación y obediencia: el nombre del modelo sugiere un experimento de este tipo, útil como caso de estudio académico más que como componente de producción.
- Base para posteriores ajustes: serviría como punto de partida para un QLoRA adicional, aunque sin garantías de que aporte ventaja sobre el Instruct original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y el repositorio no registra evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 8B: unos 16 GB en FP16, 8-9 GB en cuantización de 8 bits y 5-6 GB en 4 bits (sin contar caché KV).
- Caché KV: con 128.000 tokens de contexto y GQA de 8 cabezas KV, la memoria adicional crece de forma apreciable; para contextos largos conviene reservar varios GB extra o limitar la ventana efectiva.
- GPU recomendadas: A100 40/80 GB o H100 para servicio con contexto completo y concurrencia; L40S o RTX 6000 Ada como alternativas de inferencia; RTX 4090 (24 GB) para 4-8 bits con contexto moderado.
- GPU de consumo: sí cabe en RTX 4090, RTX 3090, RTX 4080 y, en 4 bits con contexto recortado, en tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 4070.
- Opciones de despliegue: transformers, Text Generation Inference (etiqueta `text-generation-inference` en el repo), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados) y servidores compatibles con la API de endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este ajuste concreto.
- Si el repositorio contiene solo adaptadores LoRA, será necesario cargar el base `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit` y aplicar los adaptadores, lo que añade requisitos de memoria del base además del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phemmy/obey-llama3-8b | 8,03 B (base) | 128.000 tokens (base) | Apache 2.0 | HuggingFace, 0 descargas | Sin benchmarks ni documentación de entrenamiento |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente usado | Modelo de referencia; benchmarks publicados por Meta |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | Apache 2.0 | HuggingFace | Menor contexto; sin GQA de 8 cabezas KV |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 128.000 tokens | Apache 2.0 | HuggingFace | Multilingüe declarado, con licencia permisiva |

La comparación se establece a nivel de modelo base, ya que el ajuste de Phemmy no aporta métricas propias. En igualdad de condiciones, el Llama 3.1 8B Instruct original, Mistral 7B Instruct v0.3 y Qwen2.5 7B Instruct cuentan con documentación, evaluaciones y soporte de la comunidad de los que carece este repositorio.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, pruebas cualitativas ni descripción del dataset, por lo que se desconoce si el ajuste degrada capacidades del base.
- Posible sobreajuste o colapso de diversidad: los fine-tunes con datasets pequeños y pocas épocas suelen reducir la variedad de respuestas y aumentar la repetición.
- Riesgo de alucinación: inherente a los modelos de 8B, no mitigado por ningún mecanismo documentado en este repositorio.
- Idiomas: la etiqueta declara solo inglés; el rendimiento en castellano no está verificado y probablemente sea inferior al del base, que sí es multilingüe.
- Sesgos: no se documenta ningún proceso de filtrado o mitigación; hereda los sesgos de los datos de Meta y de los datos de ajuste, desconocidos.
- Licencia: Apache 2.0 en este repositorio, pero el modelo base Llama 3.1 se distribuye bajo la Llama 3.1 Community License, que impone condiciones adicionales (atribución, límite de 700 millones de usuarios mensuales para ciertos usos, política de uso aceptable). Conviene verificar la compatibilidad antes de un uso comercial.
- Reproducibilidad: al no publicarse adaptadores, scripts ni configuración, no es posible reproducir el ajuste.
- Madurez: 0 descargas y 0 «likes» en el momento de la consulta; sin mantenimiento ni issues conocidos.
- Producción: no recomendable como componente crítico sin una evaluación propia previa frente al Llama 3.1 8B Instruct original.

## Enlaces

- HuggingFace: https://huggingface.co/Phemmy/obey-llama3-8b
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper o blog del ajuste: no disponible
- Demo o espacio de inferencia: no disponible
- Repositorio de código del autor: no disponible
