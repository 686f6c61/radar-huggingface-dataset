# mradermacher/Glimmering-Citrus-31B-GGUF

## Resumen

Glimmering-Citrus-31B es un modelo de lenguaje de 31 000 millones de parámetros, publicado originalmente por el usuario Vortex5 en Hugging Face y posteriormente cuantizado al formato GGUF por mradermacher para facilitar su ejecución local en CPU y GPU. El repositorio que nos ocupa contiene únicamente los pesos cuantizados, no el modelo original en formato safetensors, y está etiquetado como orientado a conversación y compatible con endpoints de inferencia.

La relevancia de esta ficha radica en que se trata de una versión GGUF de un modelo de tamaño medio-grande, pensada para despliegue en entornos con recursos limitados. Sin embargo, la información pública disponible es muy escasa: no se especifican la arquitectura exacta, el tipo de entrenamiento, los datos utilizados ni las capacidades concretas. Por tanto, esta ficha se basa en los datos verificables del repositorio y en las limitaciones derivadas de la falta de documentación oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, sin confirmar) |
| Parametros totales | 30 697 345 596 (aproximadamente 31B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentarios de la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no la especifica) |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo original Glimmering-Citrus-31B. Dado el tamaño de 31B de parámetros, es probable que se trate de un transformer denso, pero no hay confirmación. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El repositorio GGUF es una conversión estática de los pesos originales, realizada con la herramienta de cuantización de llama.cpp, sin modificaciones adicionales.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational", lo que sugiere que está optimizado para diálogo, aunque no se especifican detalles.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede desplegarse en servicios de inferencia que aceptan GGUF, como llama.cpp o vLLM.
- No se han documentado capacidades específicas de razonamiento, código, matemáticas, visión, tool calling o agentes. Toda esa información se considera no disponible.

## Casos de uso

Dada la falta de documentación, los casos de uso son hipotéticos y deben validarse con pruebas propias:

- Despliegue local de un asistente conversacional: al ser un GGUF, puede ejecutarse en una máquina con CPU o GPU modesta mediante llama.cpp u Ollama, permitiendo experimentar con un modelo de 31B sin necesidad de infraestructura cloud.
- Pruebas de cuantización y rendimiento: el repositorio incluye múltiples niveles de cuantización (Q2_K a Q8_0), lo que permite comparar la relación entre tamaño, velocidad y calidad de salida en diferentes hardware.
- Integración en pipelines de generación de texto: gracias al formato GGUF y la compatibilidad con endpoints, puede integrarse en aplicaciones que usen servidores de inferencia locales, como text-generation-webui o LM Studio.
- Investigación sobre modelos de 31B: para estudiar el comportamiento de un modelo de este tamaño en tareas de conversación, aunque sin conocer su entrenamiento exacto, los resultados deben interpretarse con cautela.
- Evaluación de calidad de cuantización: comparar las salidas de las distintas versiones cuantizadas (Q4_K_M, Q5_K_M, etc.) para decidir cuál usar en producción según el hardware disponible.
- Prototipado rápido de chatbots: al ser un archivo GGUF, se puede cargar en herramientas como Ollama o llama.cpp para crear un prototipo funcional en minutos, sin necesidad de entrenar o ajustar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo. Tampoco se conocen comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización. Para un modelo de 31B, las necesidades aproximadas son:
  - Q2_K: ~12 GB de VRAM (puede caber en GPUs de 16 GB como RTX 4080 o 4090).
  - Q4_K_M: ~18-20 GB de VRAM (requiere GPU de 24 GB como RTX 3090/4090 o A5000).
  - Q8_0: ~32 GB de VRAM (solo en GPUs profesionales como A100 o H100).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100. En CPU, puede ejecutarse con 32-64 GB de RAM, aunque la velocidad será baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si soporta GGUF), o servidores compatibles con endpoints.
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo original (Vortex5/Glimmering-Citrus-31B) no tiene documentación pública, y no se conocen modelos directamente comparables con el mismo nombre o arquitectura. Se recomienda tratar esta ficha como un punto de partida y consultar el repositorio original para obtener más datos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al no conocer los datos de entrenamiento, no se puede evaluar el riesgo de sesgos ni la tendencia a alucinar. Se recomienda validar las salidas en aplicaciones críticas.
- Licencia: la licencia no está especificada, lo que impide conocer las restricciones de uso comercial. Antes de usar el modelo en producción, es imprescindible contactar con el autor original (Vortex5) para aclarar los términos.
- Idioma: no se indica qué idiomas soporta. Es probable que esté entrenado principalmente en inglés, pero no hay confirmación.
- Contexto: se desconoce la longitud máxima de contexto. Esto limita su uso en tareas que requieran ventanas largas.
- Documentación: la ausencia de model card en el repositorio original y en el GGUF dificulta la reproducibilidad y la comprensión de sus capacidades reales.
- Formato GGUF: al ser una cuantización, puede haber pérdida de calidad respecto al modelo original en precisión completa. Se recomienda probar varias cuantizaciones para elegir la adecuada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Glimmering-Citrus-31B-GGUF
- Repositorio original (sin documentación): https://huggingface.co/Vortex5/Glimmering-Citrus-31B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
