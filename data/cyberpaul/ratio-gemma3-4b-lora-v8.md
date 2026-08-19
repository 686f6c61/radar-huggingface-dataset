# CyberPaul/ratio-gemma3-4b-lora-v8

## Resumen

RATIO v8 es un adaptador LoRA de 0.3 GB que ajusta el modelo base Gemma 3 4B (Google DeepMind) para tareas jurídicas de respuesta anclada a documentos. Lo desarrolla CyberPaul, un investigador independiente, y se distribuye exclusivamente en Hugging Face. El modelo resuelve el problema de la generación de respuestas jurídicas con citas verificables y baja tasa de alucinación, algo crítico para el uso profesional en el sector legal.

El adaptador se entrenó sobre `gemma-3-4b-it-bnb-4bit` (versión instruida en 4 bits de Unsloth) con 950 ejemplos de un dataset propio que combina 70% de casos RAG-anclados, 20% de abstención y 10% de tesis general. El entrenamiento se realizó en 3 épocas con una longitud de secuencia máxima de 2048 tokens, en dos GPUs T4 de Kaggle. El resultado supera el umbral de calidad de su protocolo de evaluación v8, con una tasa de alucinación de 0.000 y una fidelidad de 0.987, lo que lo hace apto para uso en producción en entornos controlados.

La relevancia actual del modelo radica en que combina la capacidad multimodal y multilingüe de Gemma 3 (128K de contexto y soporte para 140+ idiomas en el base) con un fine-tune específico para el dominio jurídico, aunque el entrenamiento se limita a 2048 tokens de secuencia. Es un ejemplo de cómo los adaptadores LoRA permiten especializar modelos abiertos de tamaño medio con recursos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 4B) con adaptador LoRA |
| Parametros totales | 4.000 millones (base) + ~4M de adaptador LoRA |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens (entrenamiento), base soporta 128K |
| Tipos de cuantizacion | base en 4-bit (bnb-4bit); adaptador en safetensors fp32 |
| Idiomas soportados | no disponible (base Gemma 3 soporta 140+; entrenamiento en portugues) |
| Licencia | Uso academico y de investigacion; contacto del autor para uso comercial |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B, un transformer multimodal de 4.000 millones de parametros que soporta entrada de texto, imagen y video, con una ventana de contexto de 128K tokens y KV-cache optimizado para reducir el consumo de memoria en secuencias largas. El adaptador LoRA se entrena con rango r=16, alpha=32 y se aplica a los modulos de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`, lo que permite un ajuste fino eficiente en parametros sin necesidad de entrenar todos los pesos.

El dataset de entrenamiento consta de 950 ejemplos, distribuidos en 70% de casos RAG-anclados (respuestas que dependen de documentos proporcionados), 20% de abstención (el modelo debe reconocer cuando no puede responder) y 10% de tesis general (respuestas juridicas generales). El entrenamiento se realizó durante 3 épocas con una longitud máxima de secuencia de 2048 tokens, en plataforma Kaggle con dos GPUs T4. No se aplicaron tecnicas de RLHF ni DPO; el ajuste es exclusivamente supervisado. La evaluacion del autor indica que el modelo supera a la version de produccion anterior (v3) en casi todas las metricas del protocolo.

## Capacidades

- Generacion de texto juridico anclado a documentos: responde a preguntas basandose en el contenido de un documento proporcionado, con citas de fuentes.
- Abstencion controlada: el modelo es capaz de abstenerse de responder cuando no hay informacion suficiente, evitando alucinaciones.
- Extraccion de tesis: identifica y extrae la tesis principal de un documento juridico.
- Cumplimiento de formato: genera respuestas con una estructura especifica definida en el protocolo de evaluacion.
- Multimodalidad heredada: aunque el entrenamiento se centra en texto, el modelo base Gemma 3 soporta entrada de imagenes, lo que podria aprovecharse para escanear documentos, aunque no esta validado en esta version.
- Multilingue heredado: el modelo base soporta 140+ idiomas, aunque el entrenamiento del adaptador se realizo en portugues, por lo que el rendimiento en otros idiomas no esta garantizado.

## Casos de uso

- Asistencia legal en despachos de abogados: el modelo puede analizar contratos, sentencias o escritos y responder preguntas concretas sobre ellos, citando los fragmentos relevantes. Su fidelidad de 0.987 lo hace fiable para tareas de revision documental.
- Busqueda de jurisprudencia: dado un conjunto de sentencias como contexto, el modelo extrae las tesis principales y las resume, facilitando el trabajo de preparacion de casos.
- Abstención segura en sistemas de preguntas y respuestas: cuando el documento no contiene la informacion requerida, el modelo responde con abstención en lugar de inventar datos, lo que es critico en entornos donde la precision juridica es obligatoria.
- Generacion de informes preliminares: el modelo puede redactar un borrador de informe legal estructurado segun un formato predefinido, que luego un abogado revisa y completa.
- Integracion en sistemas RAG de documentos legales: el adaptador puede combinarse con un pipeline de recuperacion de documentos para responder consultas especificas sobre una base de datos juridica, aprovechando su entrenamiento anclado en contexto.
- Validacion de respuestas de otros sistemas: dado que su tasa de alucinacion es 0.000 en la evaluacion, puede usarse como verificador de respuestas generadas por modelos generalistas en el ambito legal.

## Benchmarks y rendimiento

El autor no ha publicado benchmarks estandar (MMLU, HumanEval, etc.), sino los resultados de su propio protocolo de evaluacion v8. Estos son los datos disponibles:

| Metrica | RATIO v8 | Produccion (v3) | Threshold |
|---|---|---|---|
| A1 Faithfulness | 0.987 | 0.985 | ≥ 0.85 |
| A2 Citation Accuracy | 0.987 | 0.947 | ≥ 0.90 |
| A3 Unsupported Claims | 0.071 | 0.091 | ≤ 0.10 |
| A4 Tesis Extraction | 0.990 | 1.000 | ≥ 0.80 |
| A5 Format Compliance | 1.000 | 1.000 | ≥ 0.90 |
| B1 Hallucination Rate | 0.000 | 0.020 | ≤ 0.10 |
| B3 Utility Score | 0.980 | 0.960 | ≥ 0.70 |

El modelo supera todos los umbrales de calidad definidos por el autor. Destaca especialmente la tasa de alucinacion nula y la mejora en exactitud de citas respecto a la version anterior. No hay datos comparativos con otros modelos juridicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Gemma 3 4B en 4-bit requiere aproximadamente 3-4 GB de VRAM. Con el adaptador LoRA añadido, el total queda en torno a 4-5 GB, lo que permite ejecutar en GPUs consumer de 8 GB (RTX 3070, RTX 4060, etc.).
- GPU recomendadas: cualquier GPU con 8 GB de VRAM es suficiente. El entrenamiento se realizo en dos T4 de Kaggle (16 GB cada una), por lo que una sola T4 tambien es viable para inferencia.
- Opciones de despliegue: se puede usar con Unsloth (FastLanguageModel) como indica el autor, o con Transformers + PEFT. Para produccion, se puede exportar a GGUF para llama.cpp o usar vLLM si se integra como un modelo completo.
- Latencia y throughput: no se han publicado datos especificos, pero con una GPU T4 se espera una velocidad de generacion de 20-40 tokens por segundo para el tamano de 4B, dependiendo de la cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos en el ambito juridico con adaptadores LoRA. Como referencia, se puede comparar con el modelo base Gemma 3 4B y con otros modelos de tamano similar:

| Modelo | Parametros | Contexto | Rendimiento general | Licencia |
|--------|-----------|----------|---------------------|----------|
| RATIO v8 (Gemma 3 4B + LoRA) | 4.0B + LoRA | 2048 (entrenado) | Fidelidad 0.987, Hallucination 0.0 | Uso academico/investigacion |
| Gemma 3 4B (base) | 4.0B | 128K | MMLU 0.84 aprox. | Apache 2.0 |
| Llama 3.2 3B | 3.2B | 128K | MMLU 0.63 aprox. | Llama 3.2 License |

La ventaja de RATIO v8 frente al base es su especializacion en tareas juridicas con citas y abstención, aunque su contexto efectivo es menor por el limite de entrenamiento.

## Limitaciones y advertencias

- El entrenamiento se realizo con 950 ejemplos, un volumen reducido que puede no capturar la diversidad del lenguaje juridico real. La generalizacion a otros dominios juridicos (derecho penal, laboral, fiscal) no esta garantizada.
- La longitud de contexto del entrenamiento es de 2048 tokens, muy inferior a la capacidad nativa de Gemma 3 (128K). En documentos mas largos, el modelo puede perder informacion.
- El adaptador fue entrenado con datos en portugues, por lo que su rendimiento en castellano u otros idiomas es desconocido y probablemente inferior.
- La licencia restringe el uso comercial sin contacto previo con el autor. Para produccion empresarial, es necesario obtener permiso explicito.
- No se han publicado detalles sobre el sesgo de los datos de entrenamiento. Es posible que el modelo refleje sesgos presentes en los documentos juridicos de su dataset.
- Aunque la tasa de alucinacion medida es 0.0, esta evaluacion se realizo sobre el propio protocolo del autor, no sobre un conjunto externo independiente. En condiciones reales, puede haber alucinaciones.
- El modelo no es un sustituto de asesoria legal profesional. Las respuestas deben ser revisadas por un experto antes de tomar decisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyberPaul/ratio-gemma3-4b-lora-v8
- Version anterior (v1): https://huggingface.co/CyberPaul/ratio-gemma3-4b-lora
- Documentacion de Gemma 3 en Transformers: https://huggingface.co/docs/transformers/model_doc/gemma3
- Repositorio oficial de Gemma 3: https://github.com/gemma-3/gemma-3
- Informe tecnico de Gemma 3 (arXiv): https://arxiv.org/html/2503.19786v1
- Pagina de Gemma 3 en DeepMind: https://deepmind.google/models/gemma/gemma-3/
