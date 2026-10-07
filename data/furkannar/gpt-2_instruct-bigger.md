# FurkanNar/GPT-2_Instruct-Bigger

## Resumen
GPT-2_Instruct-Bigger es un ajuste fino de GPT-2 publicado por el usuario FurkanNar en HuggingFace. Se trata de un modelo decoder-only tipo transformer, derivado del modelo base openai-community/gpt2 (124.439.808 parámetros reales según el archivo safetensors) y ajustado previamente por el mismo autor en FurkanNar/gpt-2_instruct. El objetivo es dotar a GPT-2 de capacidades básicas de seguimiento de instrucciones mediante ajuste supervisado sobre el dataset databricks/databricks-dolly-15k, complementado en etapas anteriores con tatsu-lab/alpaca y ChilleD/SVAMP.

El modelo resuelve un problema acotado: demostrar que un transformer pequeño (124M de parámetros, 0,5 GB de repositorio) puede adaptarse a tareas de instrucción con recursos muy limitados. El entrenamiento se realizó con 13.500 muestras de entrenamiento (90 por ciento) y 1.500 de validación (10 por ciento), 4 épocas, batch size 4 y una longitud máxima de secuencia de 128 tokens, en precisión mixta FP16.

Su relevancia es principalmente didáctica y experimental: sirve como ejemplo reproducible de pipeline de fine-tuning con Transformers, y como línea base ligera para probar prompts, plantillas de instrucción y despliegues en hardware modesto. No compite con modelos actuales de razonamiento o código: es un GPT-2 de 124M con contexto muy corto y entrenamiento exclusivamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.439.808 (dato real del archivo safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en el ajuste fino (máxima longitud de secuencia de entrenamiento); la arquitectura GPT-2 base admite hasta 1024 posiciones |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en safetensors; la conversión a GGUF/INT8/INT4 requeriría herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (acompañado de config.json y generation_config.json) |

## Arquitectura y entrenamiento
La arquitectura es la de GPT-2: un transformer decoder-only con atención causal, normalización previa a la atención y capas feed-forward, sin las innovaciones posteriores de modelos más recientes. El modelo parte de FurkanNar/gpt-2_instruct, que a su vez deriva de openai-community/gpt2, y se ajusta sobre databricks/databricks-dolly-15k para tareas de seguimiento de instrucciones. Los tags del repositorio indican también el uso de los datasets ChilleD/SVAMP (problemas aritméticos de un paso) y tatsu-lab/alpaca (instrucciones generales) en etapas previas o complementarias del ajuste, aunque la model card solo documenta en detalle el entrenamiento final sobre Dolly-15k.

Hiperparámetros documentados: longitud máxima de secuencia 128 tokens, 4 épocas, batch size 4, learning rate 2e-5, max gradient norm 1.0, precisión mixta FP16 y limitación de la fracción de memoria de GPU al 50 por ciento para evitar OOM. El autor aplica además recorte de gradiente y `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` para reducir la fragmentación de memoria. No se documenta el número total de tokens de entrenamiento, la composición exacta de la mezcla de datasets ni el uso de RLHF, DPO u otra técnica de alineación posterior al ajuste supervisado.

## Capacidades
- Generación de texto autoregresiva en inglés, con formato de instrucción/respuesta heredado del ajuste sobre Dolly-15k.
- Seguimiento básico de instrucciones sencillas y de un solo turno, limitado por la ventana de 128 tokens.
- Resolución de problemas aritméticos de un paso, presumiblemente reforzada por el dataset SVAMP utilizado en la etapa anterior del pipeline.
- Respuesta a preguntas de cultura general y tareas de redacción breve, en la medida en que Dolly-15k cubre categorías como open QA, brainstorming, clasificación e información extraída.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), capacidades de visión ni de audio.
- Capacidad multilingüe: no disponible; el modelo está declarado únicamente para inglés.

## Casos de uso
- Prototipado y docencia de fine-tuning: sirve como ejemplo completo y reproducible de ajuste supervisado con la librería Transformers sobre un dataset de instrucciones público, con el script, los hiperparámetros y las curvas de pérdida y perplejidad publicados.
- Pruebas de plantillas de prompt en local: al caber en CPU y en cualquier GPU de consumo, permite iterar plantillas de instrucción sin coste de infraestructura en la nube.
- Generación de texto corto con restricciones de latencia: en tareas de completado de 100 tokens o menos, el coste por inferencia es mínimo comparado con modelos de miles de millones de parámetros.
- Clasificación y extracción ligera: tareas de etiquetado de texto breve o extracción de campos simples pueden plantearse como generación condicionada, aprovechando las categorías de Dolly-15k (clasificación, extracción de información).
- Aritmética de un paso en entornos educativos: gracias al ajuste con SVAMP, puede usarse como demostrador de razonamiento aritmético elemental en un modelo diminuto, siempre con verificación humana de los resultados.
- Investigación sobre degradación en contexto largo: es un caso útil para estudiar cómo un GPT-2 ajustado con 128 tokens se comporta cuando se le alimentan secuencias más largas, y para medir pérdida de coherencia.
- Base para experimentos de cuantización y despliegue: al ser un modelo de 124M con licencia MIT, es un banco de pruebas barato para comparar vLLM, llama.cpp, Ollama o TGI en términos de latencia y memoria.
- Generación de datos sintéticos a pequeña escala: puede producir borradores de instrucciones o respuestas que después se filtran manualmente, útil para aumentar datasets de dominio específico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. El autor solo reporta pérdida y perplejidad de entrenamiento y validación:

| Epoca | Perdida entrenamiento | Perplejidad entrenamiento | Perdida validacion | Perplejidad validacion |
|---|---|---|---|---|
| 1 | 3,1501 | 23,3380 | 2,8375 | 17,0723 |
| 2 | 2,9357 | 18,8347 | 2,7899 | 16,2790 |
| 3 | 2,8122 | 16,6459 | 2,7688 | 15,9397 |
| 4 | 2,7149 | 15,1032 | 2,7618 | 15,8282 |

La perplejidad de validación desciende de 17,07 a 15,83 entre la primera y la cuarta época, mientras que la de entrenamiento baja de 23,34 a 15,10. La brecha entre ambas se estrecha, lo que el autor interpreta como ausencia de sobreajuste significativo en ese régimen de entrenamiento. No hay comparación con modelos similares en la información proporcionada.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP32, aproximadamente 0,5 GB de pesos; en FP16, aproximadamente 0,25 GB; en INT8, alrededor de 0,12 GB. A ello hay que sumar la memoria del runtime (KV cache y activaciones), modesta con esta ventana de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la práctica. Funciona en RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales, e incluso en iGPU con memoria compartida si se cuantiza.
- Ejecución en CPU: viable con llama.cpp u ONNX Runtime; la latencia será de decenas a cientos de milisegundos por token según el hardware, aunque el autor no publica cifras.
- Opciones de despliegue: transformers (nativo), text-generation-inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp u Ollama previa conversión a GGUF, y HuggingFace Inference Endpoints. No hay archivos GGUF publicados en el repositorio.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste a instrucciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-2_Instruct-Bigger (FurkanNar) | 124.439.808 | 128 tokens en entrenamiento | Sí (Dolly-15k, 4 épocas) | MIT | HuggingFace, safetensors |
| openai-community/gpt2 (base) | 124M (aproximado, modelo base) | 1024 posiciones | No | MIT modificada de OpenAI | HuggingFace |
| FurkanNar/gpt-2_instruct | no disponible en la información proporcionada | no disponible | Sí (etapa previa del pipeline) | no disponible | HuggingFace |
| distilgpt2 | 82M (aproximado) | 1024 posiciones | No | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, contexto, licencia y disponibilidad. Los valores de parámetros de los modelos alternativos son aproximados y provienen de su documentación pública, no de mediciones realizadas para esta ficha.

## Limitaciones y advertencias
- Sesgos conocidos: GPT-2 se entrenó con WebText y hereda sesgos de género, raza, religión y nacionalidad presentes en ese corpus; el ajuste posterior sobre Dolly-15k no los corrige.
- Riesgo de alucinación: alto. Un modelo de 124M con 4 épocas de ajuste supervisado no tiene mecanismos de verificación factual y generará afirmaciones plausibles pero falsas con frecuencia.
- Ventana de contexto muy corta: 128 tokens en el ajuste. Instrucciones o conversaciones más largas quedarán truncadas o degradarán la calidad de forma notable. La arquitectura admite hasta 1024 posiciones, pero no hay evidencia de que el modelo rinda bien más allá de la longitud de entrenamiento.
- Idioma: solo inglés. No hay evidencia de capacidades en castellano ni en otras lenguas.
- Sin alineación documentada: no se reporta RLHF, DPO ni filtros de seguridad, por lo que puede producir contenido inapropiado u ofensivo si se le induce.
- Restricciones de licencia: la licencia declarada es MIT, lo que permite uso comercial y modificación. Sin embargo, se recomienda verificar las condiciones del modelo base de OpenAI (MIT modificada con restricciones de uso y de atribución) antes de un despliegue comercial, ya que es una cadena de dependencias.
- Caveat de producción: 0 descargas y 1 like en HuggingFace (fecha de creación 2026-10-06). No hay validación por parte de terceros, ni pruebas de robustez, ni garantías de mantenimiento por parte del autor.
- Longitud máxima de secuencia de 128 tokens: limita severamente su uso en casos reales de atención al cliente, RAG o agentes, que requieren contextos de varios miles de tokens.
- No apto para código en producción, matemáticas avanzadas ni razonamiento multi-paso: no hay benchmarks ni evidencia de que estas capacidades existan en un modelo de este tamaño con este ajuste.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/FurkanNar/GPT-2_Instruct-Bigger
- Modelo base del ajuste: https://huggingface.co/FurkanNar/gpt-2_instruct
- Modelo base original: https://huggingface.co/openai-community/gpt2
- Dataset de instrucciones: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset de aritmética: https://huggingface.co/datasets/ChilleD/SVAMP
- Dataset de instrucciones generales: https://huggingface.co/datasets/tatsu-lab/alpaca
- Resultados de búsqueda web: no se han encontrado páginas relevantes sobre este modelo. Las consultas devolvieron únicamente documentación sobre ChatGPT de OpenAI (https://chatgpt.com/, https://openai.com/index/chatgpt/), sin relación con GPT-2_Instruct-Bigger.
