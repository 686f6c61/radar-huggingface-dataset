# hozifa1/Faqih-14B-Islamic-AI

## Resumen

Faqih-14B-Islamic-AI es un adaptador LoRA publicado por el usuario hozifa1 sobre el modelo base Qwen/Qwen2.5-14B-Instruct. El nombre "Faqih" (jurista en árabe) sugiere que el adaptador está orientado a tareas relacionadas con la jurisprudencia islámica y el conocimiento religioso, aunque la model card no proporciona ninguna descripción funcional. El repositorio contiene únicamente los pesos del adaptador (0,1 GB) en formato safetensors, y se distribuye bajo la librería PEFT.

El modelo base Qwen2.5-14B-Instruct es un transformer decoder-only de 14 000 millones de parámetros, con ventana de contexto de 32 768 tokens y capacidades multilingües y de razonamiento. El adaptador hereda la arquitectura del base, pero no se ha documentado si modifica la longitud de contexto o los idiomas soportados. La relevancia actual de este modelo radica en la creciente demanda de asistentes de IA especializados en contenido islámico, aunque su escasa documentación y ausencia de métricas de evaluación limitan su uso en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-14B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador no declara parametros propios; el modelo base tiene 14 000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base: 32 768 tokens, no confirmado para el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-14B-Instruct, un modelo transformer decoder-only con atención causal y mecanismos de atención por ventanas deslizantes (switching attention) que alternan entre atención completa y atención local. El entrenamiento del adaptador se realizó con la librería PEFT (versión 0.20.0), lo que implica que solo se actualizaron matrices de bajo rango (LoRA) sobre las capas del modelo base. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, el régimen de entrenamiento (precision, hiperparametros) ni si se aplicaron técnicas como RLHF o DPO. El repositorio no incluye detalles sobre el procedimiento de fine-tuning.

## Capacidades

- No se han documentado capacidades específicas del adaptador en la model card.
- Por estar basado en Qwen2.5-14B-Instruct, es plausible que herede las capacidades del modelo base: generacion de texto, razonamiento, codificacion, matematicas, soporte de tool calling y funciones de agente, asi como capacidades multilingues.
- El nombre "Faqih" y el contexto del autor (actividad en datasets y spaces relacionados con libros islamicos) sugieren que el adaptador podria estar orientado a responder preguntas sobre jurisprudencia islamica, fiqh y estudios coranicos, aunque esto no esta confirmado.
- No se menciona soporte de vision, audio u otras modalidades.

## Casos de uso

Dado que no hay documentacion oficial, los siguientes casos de uso son hipoteticos y deben validarse antes de su implementacion:

- Asistente de consultas sobre jurisprudencia islamica: podria emplearse para responder preguntas sobre fiqh (rituales, transacciones, familia) basandose en el conocimiento del modelo base y el ajuste del adaptador. Requiere validacion de la calidad de las respuestas y de las fuentes.
- Generacion de contenido educativo islamico: podria redactar explicaciones, resumenes o articulos divulgativos sobre temas religiosos, siempre que se supervise la exactitud teologica.
- Traduccion y adaptacion de textos clasicos: el modelo base tiene capacidades multilingues, por lo que el adaptador podria ayudar a parafrasear o simplificar pasajes de obras islamicas clasicas, aunque se desconoce el idioma de entrenamiento.
- Integracion en chatbots de organizaciones religiosas: para responder dudas frecuentes de la comunidad, siempre que se implementen salvaguardas contra alucinaciones y se cite documentacion autorizada.
- Investigacion academica: como herramienta de apoyo para explorar conceptos juridicos islamicos, comparar escuelas de pensamiento o generar hipotesis de trabajo, con revision humana obligatoria.
- Desarrollo de aplicaciones de estudio personal: para acompañar a usuarios en el aprendizaje de la jurisprudencia, con recordatorios de oraciones o explicaciones de aleyas, si el adaptador ha sido entrenado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion sobre MMLU, HumanEval, GSM8K ni metricas especificas de tareas islamicas. El autor no ha proporcionado comparaciones con otros modelos ni analisis de rendimiento.

## Requisitos de hardware

- Al ser un adaptador LoRA, es necesario cargar el modelo base Qwen2.5-14B-Instruct para realizar inferencia. El adaptador anade un coste minimo de memoria adicional (inferior a 0,1 GB).
- Estimacion de VRAM para el modelo base en funcion de la cuantizacion:
  - FP16/BF16: aproximadamente 28 GB de VRAM.
  - Cuantizacion de 8 bits: aproximadamente 14 GB de VRAM.
  - Cuantizacion de 4 bits (GPTQ/AWQ): aproximadamente 7 GB de VRAM.
- GPUs recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para cuantizacion de 8 bits o inferior, o GPUs con 16 GB o menos si se usa cuantizacion de 4 bits.
- El modelo cabe en GPUs de consumo (RTX 3090, RTX 4090) con cuantizacion adecuada, pero no en tarjetas de 8 GB sin cuantizacion agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Inference Endpoints, o directamente con transformers y PEFT.
- Latencia y throughput estimados: no disponibles. Dependen de la GPU, la cuantizacion y la longitud de secuencia. Como referencia, Qwen2.5-14B en FP16 en una A100 suele generar entre 20 y 40 tokens por segundo, pero no hay datos especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El adaptador no ha sido evaluado publicamente ni documentado. Se podria comparar con otros modelos islamicos como Qaf, MuslimGPT o Islamify, pero no existen datos publicos de rendimiento ni de arquitectura para estos productos comerciales. Tampoco se conocen otros adaptadores LoRA similares en Hugging Face con documentacion comparable. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La model card no contiene informacion sobre sesgos, riesgos o limitaciones especificas. Al ser un adaptador sobre un modelo generalista, puede heredar sesgos del modelo base y de los datos de entrenamiento no documentados.
- Riesgo de alucinacion: sin un dataset de entrenamiento verificado ni evaluacion, las respuestas sobre temas religiosos pueden ser incorrectas o inventadas. No debe utilizarse como fuente autoritativa de jurisprudencia sin supervision humana experta.
- Limitaciones de contexto e idioma: no se ha confirmado si el adaptador respeta la ventana de contexto de 32k del modelo base ni que idiomas soporta. El entrenamiento podria haberse realizado en un idioma especifico (probablemente arabe o ingles), pero no esta documentado.
- Restricciones de licencia: la licencia no esta especificada. Esto impide conocer si su uso comercial esta permitido o si existen obligaciones de atribucion. Se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Falta de mantenimiento: el repositorio tiene una unica actualizacion (creado y actualizado el mismo dia) y no hay evidencia de soporte continuo. Para produccion, se requiere una evaluacion exhaustiva y posiblemente un reentrenamiento propio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hozifa1/Faqih-14B-Islamic-AI
- Perfil del autor: https://huggingface.co/hozifa1/models
- Sitios web relacionados encontrados en la busqueda (no afiliados al modelo):
  - Qaf (asistente islamico): https://qaf.ai/
  - Fiqh Tech: https://www.aifiqh.com/
  - MuslimGPT: https://themuslimgpt.com/
  - Islamify: https://islamify.ai/en/
