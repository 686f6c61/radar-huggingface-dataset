# mehmettozlu/Turkish-Qwen-2.5-7B-Instruct-GGUF

## Resumen

Turkish-Qwen-2.5-7B-Instruct-GGUF es un modelo de lenguaje afinado a partir de Qwen2.5-7B-Instruct, optimizado para conversación y generación de texto en turco, y posteriormente convertido a formato GGUF mediante la librería Unsloth. El autor, mehmettozlu, publica una única cuantización Q4_K_M que permite ejecutar el modelo en hardware de consumo con requisitos modestos de memoria.

El modelo hereda la arquitectura transformer decoder-only del base Qwen2.5-7B-Instruct, con aproximadamente 7.615 millones de parámetros. Al estar en formato GGUF, es compatible con llama.cpp y el ecosistema Ollama, lo que facilita su despliegue en entornos locales y en producción con inferencia optimizada para CPU y GPU.

Su relevancia radica en ofrecer una alternativa afinada para tareas en turco, un idioma con escasa representación en los modelos abiertos de tamaño medio, manteniendo las capacidades generales de instrucción del modelo base. Aunque la documentación es mínima, la cuantización Q4_K_M equilibra calidad y eficiencia, haciéndolo adecuado para prototipos y aplicaciones ligeras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el base Qwen2.5-7B-Instruct soporta 128K tokens; se desconoce si el afinado mantiene este valor) |
| Tipos de cuantizacion | Q4_K_M (único archivo GGUF publicado) |
| Idiomas soportados | Turco (objetivo del afinado); capacidades multilingües heredadas del modelo base |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un afinado de Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). La arquitectura original de Qwen2.5 incluye 28 capas, 28 cabezas de atención y una dimensión de modelo de 3.584. El afinado se realizó con Unsloth, que optimiza el entrenamiento mediante técnicas de LoRA y cuantización de bajo rango, logrando una velocidad de entrenamiento aproximadamente 2 veces superior a la habitual.

El proceso de conversión a GGUF se llevó a cabo también con Unsloth, produciendo un único archivo cuantizado a Q4_K_M. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO. El modelo base Qwen2.5-7B-Instruct fue entrenado con 18 billones de tokens, pero los datos específicos del afinado en turco no se han publicado.

## Capacidades

- Generación de texto instruido: sigue instrucciones y responde en formato conversacional, adaptado al turco.
- Razonamiento y comprensión: hereda las capacidades de razonamiento lógico y matemático del Qwen2.5-7B-Instruct base, aunque el afinado puede haber reducido el rendimiento en otros idiomas.
- Generación de código: el base Qwen2.5-7B-Instruct es competente en generación de código; el afinado en turco no debería eliminarlo por completo, pero no hay evidencia específica.
- Soporte de tool calling / function calling: el base Qwen2.5-7B-Instruct soporta tool calling, pero no se confirma si el afinado mantiene esta capacidad.
- Capacidades multilingües: el base es multilingüe, pero el afinado se centra en turco, por lo que el rendimiento en otros idiomas puede degradarse.
- No se mencionan capacidades de visión, audio o modo de razonamiento extendido (thinking mode).

## Casos de uso

- **Atención al cliente en turco**: el modelo puede gestionar conversaciones multi-turno en turco, gracias a su entrenamiento específico, en chatbots de soporte para empresas con clientes turcohablantes.
- **Traducción y transcripción**: dado su enfoque en turco, puede usarse como base para sistemas de traducción automática o de transcripción de textos turcos, aunque sin garantías de calidad frente a modelos dedicados.
- **Generación de contenido en turco**: creación de artículos, descripciones de productos o publicaciones en redes sociales en turco, con la cuantización Q4_K_M para ejecución en hardware limitado.
- **Aplicaciones educativas**: asistentes de aprendizaje de turco o herramientas de práctica conversacional, aprovechando el contexto de instrucción del modelo.
- **Prototipado y pruebas**: al ser un GGUF ligero, es ideal para evaluar rápidamente el rendimiento de un modelo afinado en turco en entornos de desarrollo o en una GPU consumer.
- **Despliegue en Ollama**: gracias al Modelfile incluido, puede integrarse en Ollama para ejecución local en estaciones de trabajo sin GPU dedicada, con baja latencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El rendimiento real debe inferirse del base Qwen2.5-7B-Instruct, que reporta puntuaciones competitivas en tareas generales, pero el afinado en turco puede alterar estos resultados.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa aproximadamente 4.7 GB (tamaño del repositorio). Para inferencia con llama.cpp, la memoria total requerida es similar al tamaño del archivo, más overhead del contexto.
- GPU recomendadas: puede ejecutarse en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) con suficiente memoria. También funciona en CPU con RAM suficiente (al menos 8 GB libres).
- Compatibilidad: es un GGUF, por lo que es compatible con llama.cpp, Ollama, LM Studio y vLLM (con soporte GGUF). No requiere GPU dedicada si se usa CPU con RAM suficiente.
- Latencia y throughput: no se dispone de datos específicos. En una GPU RTX 4090, la inferencia de un modelo de 7B cuantizado a Q4_K_M suele alcanzar 50-80 tokens por segundo; en CPU, la velocidad puede ser de 5-10 tokens por segundo dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Turkish-Qwen-2.5-7B-Instruct-GGUF (este) | 7.6B | No disponible | Q4_K_M | No disponible | GGUF |
| Qwen2.5-7B-Instruct-GGUF (base) | 7.6B | 32K | Q4_K_M, Q5_K_M, etc. | Apache 2.0 | GGUF |
| Llama-3.1-8B-Instruct-GGUF | 8B | 128K | Q4_K_M | Llama 3.1 License | GGUF |

La comparación directa no es posible sin benchmarks del afinado. El base Qwen2.5-7B-Instruct tiene licencia Apache 2.0, pero el afinado no especifica licencia. Llama-3.1-8B-Instruct es una alternativa con mayor contexto y licencia restrictiva para uso comercial.

## Limitaciones y advertencias

- **Falta de documentación**: la model card no incluye detalles sobre el dataset de entrenamiento, la licencia exacta, ni el contexto máximo soportado. Esto dificulta la evaluación de riesgos y el uso en producción.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar contenido falso o no verificado, especialmente en temas técnicos o de actualidad.
- **Sesgos lingüísticos**: el afinado en turco puede introducir sesgos en el lenguaje y reducir el rendimiento en otros idiomas, limitando su uso multilingüe.
- **Licencia incierta**: al no especificarse la licencia, el uso comercial es legalmente ambiguo; se recomienda contactar con el autor antes de desplegarlo en entornos de producción.
- **Contexto no confirmado**: no se sabe si el afinado mantiene los 32K tokens de contexto del base, lo que afecta a aplicaciones con documentos largos.
- **Soporte de tool calling**: no confirmado, por lo que no es seguro usarlo en agentes o pipelines que requieran llamadas a funciones.

## Enlaces

- HuggingFace: https://huggingface.co/mehmettozlu/Turkish-Qwen-2.5-7B-Instruct-GGUF
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base en GGUF (ModelScope): https://www.modelscope.cn/models/qwen/Qwen2.5-7B-Instruct-GGUF
