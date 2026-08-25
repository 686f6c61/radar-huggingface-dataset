# kerasformers/gpt-oss-120b

## Resumen

GPT-OSS-120B es la conversión a Keras 3 del modelo de pesos abiertos `openai/gpt-oss-120b`, realizada por la comunidad de KerasFormers. Se trata de un modelo de lenguaje de tipo mixture-of-experts (MoE) con 120 mil millones de parámetros nominales, diseñado por OpenAI para tareas de razonamiento complejo, uso de herramientas y aplicaciones agénticas. La versión de KerasFormers mantiene los pesos originales, incluidos los expertos en formato MXFP4 (4 bits), y permite ejecutar el mismo modelo sobre los backends TensorFlow, PyTorch y JAX mediante Keras 3.

La relevancia de este modelo radica en que combina el rendimiento de un LLM de gran escala con una licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en infraestructura propia. Además, su diseño MoE con expertos cuantizados a 4 bits reduce significativamente el coste de inferencia en comparación con modelos densos de tamaño similar, y la implementación de KerasFormers ofrece una flexibilidad multiplataforma poco habitual en el ecosistema open source. El modelo está orientado principalmente a desarrolladores que necesitan razonamiento avanzado, generación de código y capacidades de tool calling en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con top-k routing, attention sinks aprendidos por cabeza, atención causal alternada sliding-window/full, rotaciones posicionales YaRN |
| Parametros totales | 120B (denominación del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits) en los expertos, dequantización en tiempo de ejecución |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (conversion de safetensors, pesos en MXFP4 para expertos) |

## Arquitectura y entrenamiento

GPT-OSS-120B sigue una arquitectura MoE en la que cada capa contiene múltiples expertos y un router que selecciona los top-k expertos por token. La arquitectura incorpora attention sinks aprendidos por cabeza, que estabilizan la atención en secuencias largas, y alterna entre atención causal completa y sliding-window para equilibrar coste computacional y cobertura de contexto. Las posiciones rotatorias se escalan mediante YaRN para permitir extrapolación de contexto.

No se han publicado en la información disponible los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La model card de OpenAI indica que el modelo ha sido optimizado para razonamiento y tool use, y que los expertos se distribuyen en formato MXFP4 para reducir el footprint. La conversión de KerasFormers reproduce la arquitectura original sin modificar los pesos, de modo que el comportamiento del modelo es equivalente al de la versión original.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con capacidad para resolver problemas complejos que requieren encadenamiento lógico.
- Soporte de tool calling / function calling, lo que permite integrar el modelo en flujos de trabajo que invocan APIs externas o ejecutan acciones.
- Capacidades agénticas: puede planificar y ejecutar secuencias de acciones de forma autónoma, adecuado para agentes de software.
- Generación de código en diversos lenguajes, con razonamiento estructurado para depuración y refactorización.
- Multilingüe limitado: la model card indica únicamente inglés, aunque puede generar texto en otros idiomas con menor fiabilidad.
- Soporte de generación con contexto largo gracias a la atención sliding-window y YaRN, aunque la longitud máxima no está documentada.
- Compatibilidad multiplataforma: la implementación de KerasFormers permite ejecutar el mismo modelo en JAX, PyTorch o TensorFlow sin cambios de código.

## Casos de uso

- Asistentes de programación en producción: el modelo puede integrarse en IDE o pipelines de CI/CD para sugerir código, revisar pull requests y generar tests. Su tool calling permite invocar compiladores o linters de forma autónoma.
- Agentes de automatización de tareas: puede encadenar acciones como búsqueda web, llamadas a APIs y procesamiento de datos en flujos multi-paso, gracias a su capacidad de razonamiento y tool use.
- Chatbots de soporte técnico: con su contexto largo y razonamiento, puede mantener conversaciones multi-turno con usuarios y acceder a documentación interna mediante retrieval aumentado.
- Análisis de datos y generación de informes: el modelo puede interpretar datos estructurados y generar informes técnicos o ejecutivos en lenguaje natural.
- Generación de documentación técnica: a partir de código o especificaciones, puede redactar documentación de APIs, guías de usuario y comentarios de código.
- Prototipado rápido de aplicaciones de IA: al ser desplegable en hardware de consumo y con licencia Apache 2.0, es viable para pruebas de concepto y startups sin grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo completo ocupa aproximadamente 200 GB en disco (tamaño del repositorio), con los expertos en MXFP4.
- Según la documentación de OpenAI, el modelo cabe en una GPU H100 (80 GB VRAM) en su configuración de pesos originales.
- La cuantización MXFP4 reduce el footprint de los expertos, lo que facilita la inferencia en hardware de consumo, aunque no se especifica una VRAM mínima exacta.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con modelos MoE cuantizados, aunque para la versión KerasFormers se recomienda usar la librería KerasFormers con backend Torch o JAX.
- No se han publicado datos de latencia y throughput para esta conversión específica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gpt-oss-120b (este) | 120B (MoE) | no disponible | Apache 2.0 | Hugging Face, KerasFormers |
| Mixtral 8x7B (Mistral) | 47B total, 13B activos | 32k | Apache 2.0 | Hugging Face |
| DeepSeek-V3 | 671B total, 37B activos | 128k | MIT (con restricciones) | Hugging Face |
| Qwen2.5-MoE | 14B total, 2.7B activos | 32k | Apache 2.0 | Hugging Face |

La comparativa se basa en características públicas de los modelos. No hay datos de rendimiento comparativo disponible para gpt-oss-120b en la información proporcionada.

## Limitaciones y advertencias

- El modelo está documentado oficialmente solo para inglés, lo que limita su uso en aplicaciones multilingües sin un ajuste previo.
- Al ser un modelo de razonamiento complejo, puede generar alucinaciones en contextos de alta incertidumbre o cuando se le pide información factual no presente en sus datos de entrenamiento.
- No se han documentado sesgos específicos, pero como modelo entrenado con datos web, puede presentar sesgos sociales, culturales o de género heredados.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base es de OpenAI y se recomienda revisar las condiciones de uso adicionales en la documentación oficial.
- El tamaño del repositorio (200 GB) requiere almacenamiento de alta capacidad y una infraestructura de red adecuada para la descarga.
- La conversión de KerasFormers está en fase de comunidad y puede tener menos soporte que la implementación oficial de OpenAI.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/kerasformers/gpt-oss-120b
- Colección KerasFormers GPT-OSS: https://huggingface.co/collections/kerasformers/gpt-oss-6a7383ded9583ee7f8b22d41
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-120b
- Documentación de OpenAI: https://openai.com/index/introducing-gpt-oss/
- GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Docs de GPT-OSS en KerasFormers: https://imvision12.github.io/KerasFormers/gpt_oss/
- GitHub del proyecto gpt-oss-120b: https://github.com/gpt-oss/gpt-oss-120b
