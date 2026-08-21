# jbduran/bart-sft

## Resumen

BART SFT es un modelo de lenguaje conversacional de 2.800 millones de parámetros, desarrollado por Unbounded Labs (Jonathan Bryant Duran-Ortiz), que ha sido ajustado mediante supervisión (SFT) sobre el modelo base BART. Su característica más distintiva es que su conocimiento se detiene en 1930: ha sido entrenado exclusivamente con textos anteriores a esa fecha, lo que le permite mantener conversaciones con una voz y un estilo históricamente apropiados. El modelo está pensado para aplicaciones de chat y diálogo en contextos de época, como recreaciones históricas, educación o entretenimiento.

El ajuste se realizó siguiendo un currículo en tres etapas con una tasa de ruido del 30%, más una pasada de robustez para manejar entradas malformadas, erratas y preguntas sobre su propia era. El resultado es un modelo que, según su autor, obtiene puntuaciones al azar en benchmarks modernos (MMLU, GSM8K, HumanEval) porque esos tests evalúan conocimientos y formatos posteriores a 1930, algo que el modelo no ha visto. Para medir su rendimiento real se han creado suites adaptadas a la época, como vintage-core o vintage-gsm8k.

La licencia es MIT, lo que permite uso comercial sin restricciones. El modelo está disponible en Hugging Face en formato PyTorch, con un checkpoint de 8,99 GB. Es una propuesta singular dentro del ecosistema de modelos de lenguaje, orientada a nichos específicos más que a tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (Transformer encoder-decoder) |
| Parametros totales | 2.818.575.450 (~2,8B, incluyendo embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo se basa en BART, una arquitectura transformer encoder-decoder, aunque la model card no proporciona detalles adicionales sobre el número de capas, dimensiones o cabezas de atención. El entrenamiento de SFT se realizó sobre el checkpoint del modelo base en el paso 9.600, con un total de 42 pasos finales. La receta de entrenamiento es un currículo en tres etapas (C3Rv2): la primera cubre rutas de conocimiento de una sola vuelta; la segunda incluye razonamiento, STEM, opiniones, composición y versos; la tercera añade conversaciones multi-turno y narrativas. En todas las etapas se aplicó una tasa de ruido del 30%. Posteriormente se ejecutó una pasada de robustez (1 época) con categorías como conversación, entradas no parseables, erratas y preguntas sobre la propia era.

Los datos de entrenamiento provienen de tres conjuntos: un dataset sintético con ~416.000 filas y once rutas de tareas, un dataset auténtico con conversaciones de una y varias vueltas extraídas de 27 textos de dominio público anteriores a 1930, y un dataset de robustez con 7.338 filas en cinco categorías. No se especifica el número total de tokens ni si se usaron técnicas como RLHF o DPO; el ajuste es puramente supervisado.

## Capacidades

- Generacion de texto conversacional con un registro linguistico y tematico propio de la epoca anterior a 1930.
- Mantenimiento de conversaciones multi-turno, gracias a las rutas de entrenamiento dedicadas a este tipo de interaccion.
- Respuesta a preguntas de conocimiento general, razonamiento, opinion, composicion y versos, siempre dentro del ambito pre-1930.
- Manejo de entradas malformadas, erratas y preguntas sobre su propia era, gracias a la pasada de robustez.
- Capacidad para narrar historias o dialogar sobre textos de dominio publico de la epoca (narrative grounded y fiction).
- No se mencionan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso fuera del ambito conversacional.

## Casos de uso

- Recreacion historica y museos interactivos: el modelo puede actuar como un personaje de la epoca (un periodista de 1920, un medico victoriano, etc.) en instalaciones o visitas guiadas, respondiendo a preguntas de los visitantes con un lenguaje y un conocimiento acordes al periodo.
- Educacion en historia: los estudiantes pueden conversar con el modelo para practicar la comprension de contextos historicos, formulando preguntas sobre acontecimientos, costumbres o personajes anteriores a 1930, y recibiendo respuestas contextualizadas.
- Entretenimiento y juegos de rol: en juegos de mesa, videojuegos o experiencias de rol en vivo, el modelo puede generar dialogos de personajes historicos o de ficcion ambientados en esa epoca, enriqueciendo la narrativa.
- Asistente de escritura creativa: escritores que trabajan en novelas o guiones ambientados antes de 1930 pueden usar el modelo para generar dialogos, descripciones o respuestas de personajes con un estilo coherente con la epoca.
- Chatbots tematicos para redes sociales o webs: marcas o instituciones pueden desplegar un asistente que responda con un tono vintage, por ejemplo para promocionar una exposicion o un producto retro.
- Investigacion en procesamiento de lenguaje historico: el modelo sirve como herramienta para estudiar como un sistema de IA maneja un vocabulario y unas referencias culturales limitadas a un periodo concreto, y para comparar su comportamiento con modelos entrenados con datos modernos.

## Benchmarks y rendimiento

La model card incluye resultados de la suite ChatCORE (karpathy suite) en el paso 42:

| Tarea | Puntuacion |
|---|---:|
| ARC-Easy | 0,2458 |
| ARC-Challenge | 0,2304 |
| MMLU | 0,2314 |
| GSM8K | 0,0000 |
| HumanEval | 0,0000 |
| **ChatCORE** | **-0,0113** |

El autor aclara que estos son benchmarks modernos y que las puntuaciones de opcion multiple estan al nivel del azar, lo cual es esperado para un modelo de 2,8B que nunca ha visto texto posterior a 1930. GSM8K y HumanEval puntuan cero porque evalúan conocimientos y formatos que no estan en sus datos de entrenamiento. Para una evaluacion mas justa, se han creado suites adaptadas a la epoca (vintage-core, vintage-gsm8k, history-event-reconstruction), aunque no se proporcionan resultados numericos de estas en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la model card.
- El checkpoint de pesos ocupa 8,99 GB en formato PyTorch (FP32 probablemente). Para inferencia en FP16, se estima que se necesitan al menos 6-7 GB de VRAM para los pesos, mas memoria para activaciones y contexto.
- Con cuantizacion (por ejemplo, 8 bits o 4 bits) podria caber en GPUs consumer de 8-12 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPUs recomendadas: una RTX 3090, RTX 4090 o A100 serian adecuadas para inferencia sin cuantizacion; una RTX 3060 o similar podria funcionar con cuantizacion.
- Opciones de despliegue: al ser un modelo PyTorch, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no se mencionan integraciones especificas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (modelos conversacionales con conocimiento limitado a una epoca historica). El autor menciona otros modelos relacionados (bart base, bart-experiments) pero no ofrece comparaciones con alternativas externas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Conocimiento limitado a 1930: el modelo no puede responder correctamente a preguntas sobre eventos, personas o tecnologias posteriores a esa fecha, y puede generar respuestas incorrectas o anacronicas si se le insiste.
- Sesgos historicos: al entrenarse con textos de dominio publico de la epoca, el modelo puede reflejar actitudes, prejuicios o lenguaje ofensivo propios de ese periodo, lo que debe tenerse en cuenta en aplicaciones publicas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o citas, especialmente en temas fuera de su ambito de conocimiento.
- Rendimiento en benchmarks modernos: las puntuaciones en MMLU, GSM8K o HumanEval son nulas o al azar, por lo que no es adecuado para tareas de razonamiento general, matematicas o generacion de codigo.
- Sin soporte para tool calling, agentes ni otras capacidades avanzadas: el modelo esta pensado exclusivamente para conversacion.
- La licencia MIT permite uso comercial, pero el contenido generado puede estar sujeto a derechos de autor de los textos originales (aunque son de dominio publico).
- No se proporcionan versiones cuantizadas ni guias de despliegue, por lo que la integracion en produccion requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jbduran/bart-sft
- Modelo base BART: https://huggingface.co/jbduran/bart
- Repositorio de experimentos: https://huggingface.co/jbduran/bart-experiments
- Articulo del autor: https://www.unboundedlab.com/blog/bart
- Sitio de Unbounded Labs: https://unboundedlab.com
- Dataset sintetico: https://huggingface.co/datasets/zachnorton03/synthetic-pre1930-sft
- Dataset autentico conversacional: https://huggingface.co/datasets/zachnorton03/authentic-pre1930-sft-conversational
- Dataset de robustez: https://huggingface.co/datasets/zachnorton03/vintage-sft-robustness
- Suites de evaluacion adaptadas: https://huggingface.co/datasets/jbduran/vintage-core, https://huggingface.co/datasets/jbduran/vintage-gsm8k, https://huggingface.co/datasets/jbduran/history-event-reconstruction
