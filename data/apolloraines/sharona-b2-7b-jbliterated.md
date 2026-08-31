# ApolloRaines/Sharona-B2-7B-Jbliterated

## Resumen

Sharona B² 7B Jbliterated es un modelo de lenguaje de 7B parámetros desarrollado por ApolloRaines como prueba de concepto de la arquitectura B-Squared (B²) de triple contexto. A diferencia de los LLM convencionales de flujo único, este modelo separa identidad, conocimiento y comportamiento en tres flujos de contexto independientes (M1, M2 y M3), cada uno con su propia ruta de cross-attention. El objetivo es resolver problemas fundamentales de los sistemas actuales: la suplantación de identidad mediante prompt injection, la degradación de las instrucciones del sistema cuando el contexto se llena y el acoplamiento entre conocimiento y comportamiento.

El modelo está compuesto por dos mitades: un Self-Decoder congelado de 14 capas (3,81B parámetros) que aporta comprensión del lenguaje y conocimiento del mundo, y un Cross-Decoder entrenado de 14 capas (4,53B parámetros) que genera texto condicionado a los tres flujos de contexto. La versión Jbliterated utiliza una técnica quirúrgica de eliminación de rechazo basada en el Jacobian Lens, que extrae únicamente el componente responsable de la emisión de tokens de rechazo, preservando la personalidad y el tono del modelo. Los guardarraíles no están incrustados en los pesos, sino que se suministran en tiempo de inferencia a través del flujo M1, lo que permite al desplegador controlar el comportamiento sin reentrenar.

Este modelo es relevante para investigadores y desarrolladores interesados en arquitecturas alternativas de gestión de contexto, identidad persistente y seguridad configurable. Sin embargo, es una prueba de concepto con cero descargas y sin benchmarks publicados, y requiere un código de inferencia personalizado que no es compatible con formatos estándar como GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | B² (B-Squared) triple-contexto: Self-Decoder (14 capas, 3,81B) + Cross-Decoder (14 capas, 4,53B) con cross-attention sobre tres flujos de contexto |
| Parametros totales | 7B (según el autor; la suma de componentes es 8,34B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | M1: 512 tokens (guardarraíles), M2: hasta 32K tokens (conversación), M3: 512 tokens (conocimiento/identidad) |
| Tipos de cuantizacion | No disponible (se desaconseja la conversión a GGUF; no se mencionan otros formatos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (no especificado; se incluye código de inferencia personalizado en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura B² divide un transformer en dos mitades. El Self-Decoder (14 capas, 3,81B parámetros) está congelado y se encarga de la comprensión del lenguaje y el conocimiento del mundo. El Cross-Decoder (14 capas, 4,53B parámetros) está entrenado y utiliza mecanismos de cross-attention para condicionar la generación a tres flujos de contexto separados: M1 (guardarraíles y reglas de comportamiento, 512 tokens), M2 (conversación activa, hasta 32K tokens) y M3 (conocimiento persistente e identidad, 512 tokens). Cada flujo se procesa de forma independiente, de modo que no compiten por el mismo ancho de banda de atención. Esto permite intercambiar guardarraíles (M1), inyectar nuevo conocimiento (M3) o continuar conversaciones (M2) sin reentrenar.

El modelo está etiquetado como "jbliterated", una variante de abliteración que utiliza el Jacobian Lens (derivada vector-jacobiana de los logits finales respecto a los estados ocultos) para eliminar únicamente el componente que provoca la emisión de tokens de rechazo. A diferencia de la abliteración estándar, que elimina la dirección media de activación entre prompts dañinos y benignos y causa daños colaterales en la personalidad y el humor, la jbliteración es quirúrgica. La identidad del modelo está codificada en la geometría de los pesos durante el entrenamiento, no se lee de un prompt en tiempo de inferencia, por lo que no puede ser alterada mediante jailbreaks o inyección de prompts.

No se han publicado datos sobre el entrenamiento: número de tokens, composición del dataset, uso de RLHF o DPO, ni detalles sobre el proceso de jbliteración. El autor indica que el modelo es una prueba de concepto y que se está desarrollando un motor de inferencia ggml independiente que soportará cuantización completa para modelos B².

## Capacidades

- Generación de texto en inglés con razonamiento multi-turno.
- Admite explícitamente ignorancia: el modelo puede responder "no tengo esa información" y detenerse, en lugar de inventar respuestas.
- Identidad persistente codificada en los pesos, no en el prompt. No se puede cambiar quién es el modelo mediante ingeniería de prompts.
- Guardarraíles intercambiables en tiempo de inferencia mediante el flujo M1. El desplegador puede escribir su propio archivo M1.txt para definir reglas de comportamiento, tono y límites.
- Inyección de conocimiento persistente a través del flujo M3 sin reentrenamiento.
- Conversación de contexto largo: hasta 32K tokens en el flujo M2.
- No se menciona soporte para tool calling, function calling, visión, audio ni modos de razonamiento especiales.

## Casos de uso

- Asistentes virtuales con identidad de marca persistente: la identidad está en los pesos, por lo que no puede ser suplantada por un usuario malintencionado. Una empresa puede desplegar un asistente que siempre se presente como "Sharona" y mantenga su personalidad incluso ante intentos de jailbreak.
- Sistemas de atención al cliente con guardarraíles configurables: el desplegador puede cambiar el archivo M1.txt para ajustar el tono, las reglas de derivación a humanos o las políticas de privacidad sin reentrenar el modelo. Por ejemplo, una empresa puede tener un M1 estricto para el soporte de primer nivel y otro más permisivo para el segundo nivel.
- Aplicaciones donde la honestidad es crítica: el modelo admite ignorancia en lugar de alucinar. En dominios como diagnóstico técnico, asesoramiento legal o información médica, esta capacidad reduce el riesgo de respuestas inventadas.
- Investigación en arquitecturas de LLM: como prueba de concepto de triple contexto, es útil para estudiar cómo la separación de flujos afecta a la robustez frente a inyección de prompts, la persistencia de identidad y la gestión de conocimiento.
- Entornos con restricciones de hardware: gracias a DeepswapLLM, el modelo puede ejecutarse en GPUs demasiado pequeñas para alojarlo en precisión completa, sin cuantización, repartiendo capas entre GPU, RAM y disco.
- Prototipado de sistemas con conocimiento actualizable: inyectar nueva información en M3 (por ejemplo, un catálogo de productos o una base de datos interna) sin necesidad de fine-tuning, y actualizarla en caliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo tiene cero descargas y cero likes en HuggingFace, lo que indica que no ha sido evaluado por la comunidad.

## Requisitos de hardware

- El repositorio ocupa 25,0 GB, lo que sugiere pesos en precisión completa (fp32) o posiblemente fp16 con overhead. Para fp32, se estiman unos 28 GB de VRAM; para fp16, unos 14 GB.
- No se especifican GPUs recomendadas. Dado el tamaño, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) sería necesaria para fp16.
- El autor recomienda DeepswapLLM para ejecutar el modelo en GPUs más pequeñas, repartiendo capas entre GPU, RAM y disco, hasta 4 veces más rápido que AirLLM.
- El modelo requiere el código de inferencia personalizado incluido en el repositorio. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin modificaciones, y no debe convertirse a GGUF.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han publicado benchmarks que permitan comparar este modelo con alternativas de 7B como Llama 2 7B, Mistral 7B o Gemma 7B. La arquitectura B² es sustancialmente diferente de los transformers estándar, y sin datos de rendimiento no es posible establecer una comparativa objetiva.

## Limitaciones y advertencias

- Solo soporta inglés. No hay evidencia de capacidades multilingües.
- No se puede convertir a GGUF. El formato de flujo único no puede representar la arquitectura de triple contexto; convertirlo destruiría el modelo.
- Requiere código de inferencia personalizado. No es compatible con el ecosistema estándar de HuggingFace Transformers sin adaptaciones, y no funciona con herramientas como Ollama o vLLM.
- Los guardarraíles dependen del desplegador. Si se proporciona un M1 vacío, el modelo no tiene salvaguardas. Esto es un riesgo si se despliega sin una configuración adecuada.
- No se han publicado datos de entrenamiento, por lo que se desconocen los sesgos potenciales, la calidad del conocimiento y el comportamiento en dominios específicos.
- Modelo sin adopción: cero descargas y cero likes. No ha sido probado por la comunidad, por lo que su fiabilidad en producción es desconocida.
- La identidad codificada en los pesos puede ser una ventaja, pero también implica que no se puede cambiar la identidad sin reentrenar, lo que limita la flexibilidad en algunos escenarios.

## Enlaces

- [HuggingFace: ApolloRaines/Sharona-B2-7B-Jbliterated](https://huggingface.co/ApolloRaines/Sharona-B2-7B-Jbliterated)
- [DeepswapLLM (GitHub)](https://github.com/apolloraines/DeepswapLLM)
- [LinkedIn: AI Admits Ignorance, Not Guessing](https://www.linkedin.com/posts/apollo-raines_apollorainessharona-b2-7b-jbliterated-activity-7487544941049716736-t-EZ)
- [LinkedIn: Introducing B²: Triple-Context LLM Architecture](https://www.linkedin.com/posts/apollo-raines_ai-machinelearning-llm-activity-7484951504018362368-oWrN)
- [Plushcap: We Just Surgically Changed What Your Model Believes](https://www.plushcap.com/content/huggingface/blog/huggingface-we-just-surgically-changed-what-your-model-believes)
