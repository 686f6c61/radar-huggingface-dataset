# mradermacher/Qwen3.8-9B-heretic-uncensored-GGUF

## Resumen

Este modelo es una cuantizacion GGUF del modelo `rohit267/Qwen3.8-9B-heretic-uncensored`, generada por el usuario mradermacher. Se trata de un modelo de lenguaje basado en la familia Qwen al que se le ha aplicado la tecnica Heretic, un metodo automatico de eliminacion de censura que no requiere entrenamiento adicional. El resultado es un modelo que no presenta mecanismos de rechazo ante peticiones que los modelos estandar suelen bloquear.

La relevancia de este modelo reside en su naturaleza "uncensored" (sin censura), dirigida a casos de uso como escritura creativa sin restricciones, roleplay o investigacion sobre los mecanismos de censura en LLMs. El repositorio contiene multiples cuantizaciones GGUF (desde Q2_K hasta f16) que permiten ejecutarlo en hardware muy variado, desde CPU hasta GPUs de gama alta. Cabe destacar una discrepancia importante: el nombre indica 9B de parametros, pero los datos de safetensors reflejan 456.010.480 parametros (aproximadamente 456M), lo que sugiere que podria tratarse de un modelo mucho mas pequeno de lo que su nombre indica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, arquitectura exacta no disponible) |
| Parametros totales | 456.010.480 (segun safetensors; el nombre indica 9B, discrepancia sin resolver) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un Qwen (probablemente de la serie 3.x) que ha sido procesado con la herramienta Heretic, desarrollada por p-e-w. Heretic es una tecnica de eliminacion automatica de censura que opera sobre los pesos del modelo sin necesidad de reentrenamiento ni ajuste fino. El metodo identifica y modifica las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo, de forma similar a la abliteracion, pero con un enfoque completamente automatizado que no requiere conocimiento interno del transformer.

Segun la documentacion de Heretic, la herramienta soporta la mayoria de modelos densos, incluyendo modelos multimodales, varias arquitecturas MoE e incluso modelos hibridos como Qwen3.5. El proceso de cuantizacion posterior a GGUF lo ha realizado mradermacher, generando 12 variantes de cuantizacion diferentes. No se dispone de informacion sobre los datos de entrenamiento del modelo base, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO antes del proceso de eliminacion de censura.

## Capacidades

- Generacion de texto sin mecanismos de rechazo: el modelo responde a peticiones que los modelos alineados tipicamente bloquean, gracias a la eliminacion de censura via Heretic.
- Escritura creativa y roleplay: al no tener restricciones de contenido, puede generar narrativa explicita, dialogos y escenarios sin filtros.
- Razonamiento y comprension del lenguaje: hereda las capacidades base del modelo Qwen subyacente, aunque no se dispone de benchmarks que confirmen si estas capacidades se mantienen tras el proceso de decensurado.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Escritura creativa sin restricciones: autores y guionistas pueden generar narrativa con contenido adulto, violencia grafica o temas tabu sin que el modelo interrumpa con avisos de seguridad. El modelo es adecuado porque Heretic elimina los mecanismos de rechazo que interrumpen este tipo de flujo creativo.
- Roleplay y ficcion interactiva: comunidades de roleplay por texto pueden utilizar este modelo para mantener conversaciones con personajes sin limitaciones de contenido, algo que los modelos comerciales censuran.
- Investigacion sobre mecanismos de censura en LLMs: investigadores pueden estudiar como se comporta un modelo decensurado frente a su version original, comparando respuestas y analizando las diferencias en los pesos.
- Generacion de contenido para ficcion especulativa: escritores de generos como terror, horror o erotica pueden explorar temas extremos sin friccion con el modelo.
- Pruebas de robustez y seguridad ofensiva: profesionales de seguridad pueden evaluar que tipo de contenido peligroso es capaz de generar un modelo sin alineamiento, para entender los riesgos de los LLMs abiertos.
- Despliegue local en hardware modesto: gracias a las cuantizaciones Q2_K y Q3_K, el modelo puede ejecutarse en CPU o GPUs de baja gama, lo que permite usarlo en entornos sin acceso a hardware de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o su base decensurada.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamano del repositorio es de 1,5 GB, por lo que la cuantizacion Q4_K_S ocupara aproximadamente 300-500 MB en memoria. Incluso la version f16 deberia caber en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones mas bajas. Una RTX 3060 o superior ejecutara sin problemas incluso la version f16.
- Compatibilidad con consumer GPU: si, todas las cuantizaciones caben en GPUs de consumo, incluyendo las integradas de gama baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible, pero al ser un modelo de aproximadamente 456M de parametros, la generacion sera rapida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-9B-heretic-uncensored (este) | 456M (segun safetensors) | no disponible | no disponible | GGUF | Decensurado con Heretic |
| Qwen3.5-9B-ultra-uncensored-heretic-v2-i1 | no disponible | no disponible | no disponible | GGUF | Tambien decensurado con Heretic, del mismo autor |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED | no disponible | no disponible | no disponible | GGUF | Variante con instrucciones de alta calidad, decensurado |

No se dispone de datos suficientes para una comparativa rigurosa con modelos de la misma categoria. Los tres modelos listados son variantes decensuradas de la familia Qwen generadas por el mismo autor, pero sin datos de rendimiento publicados.

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: el nombre del modelo indica 9B, pero los datos de safetensors reflejan 456M. Esto puede deberse a un error de etiquetado o a que el modelo base es diferente al esperado. Verificar antes de usar en produccion.
- Sin licencia especificada: no se indica la licencia del modelo, lo que genera incertidumbre legal sobre su uso comercial. Contactar con el autor antes de utilizarlo en entornos empresariales.
- Contenido potencialmente peligroso: al ser un modelo sin censura, puede generar contenido ilegal, danino o eticamente problematico. No debe desplegarse en aplicaciones orientadas al publico general sin salvaguardas adicionales.
- Riesgo de alucinacion: no se dispone de datos sobre la tasa de alucinacion del modelo, y el proceso de decensurado puede degradar la calidad de las respuestas factuales.
- Sin benchmarks publicados: no hay evidencia de que el modelo mantenga las capacidades del Qwen original tras la eliminacion de censura.
- Fecha de creacion futura: el modelo fue creado el 19 de agosto de 2026, lo que sugiere que podria tratarse de un error en la fecha o de un modelo experimental.
- Sin informacion sobre el contexto: se desconoce la longitud de contexto soportada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-9B-heretic-uncensored-GGUF
- Modelo base (rohit267): https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Sitio web de Heretic: https://www.heretics.fun/
- Analisis de tecnicas de decensurado (HauhauCS vs Heretic vs Huihui): https://nathan.sapwell.net/posts/hauhaucs-abliteration-analysis/
- Modelo relacionado (Qwen3.5-9B-ultra-uncensored-heretic-v2-i1): https://huggingface.co/mradermacher/Qwen3.5-9B-ultra-uncensored-heretic-v2-i1-GGUF
- Modelo relacionado (Qwen3.5-9B-Claude-4.6-HighIQ): https://huggingface.co/mradermacher/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-GGUF
