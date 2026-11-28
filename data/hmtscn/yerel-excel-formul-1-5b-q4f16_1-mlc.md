# hmtscn/yerel-excel-formul-1.5b-q4f16_1-MLC

## Resumen

Yerel Excel Formül Modeli es un modelo de lenguaje especializado en la generación de fórmulas de Excel a partir de instrucciones en turco y de la estructura de una tabla (nombres y tipos de columna). Lo publica el usuario hmtscn en Hugging Face y se distribuye como un artefacto compilado para MLC-LLM y WebLLM, lo que permite ejecutarlo íntegramente en el navegador del usuario sin backend. Está construido sobre Qwen/Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros desarrollado por Alibaba Qwen, y hereda su licencia Apache 2.0.

El modelo no es un entrenamiento desde cero ni un fine-tuning documentado: el repositorio contiene únicamente los pesos cuantizados en formato MLC (q4f16_1) listos para su despliegue con WebLLM, con un tamaño de repositorio de 0,9 GB. La model card es mínima y no aporta detalles sobre el proceso de ajuste, el dataset utilizado ni métricas de evaluación, por lo que la mayor parte de las especificaciones técnicas deben inferirse del modelo base.

Su relevancia es acotada pero concreta: cubre un nicho de productividad ofimática (generación de fórmulas Excel en turco) con un despliegue de privacidad total, ya que la inferencia ocurre en el cliente. Es un ejemplo de cómo la cuantización de 4 bits y el runtime MLC permiten llevar un modelo de 1,5B a hardware de consumo sin servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | q4f16_1 (MLC, grupo de 4 bits con activaciones fp16); otras variantes no publicadas en este repo |
| Idiomas soportados | turco (objetivo declarado); el modelo base es multilingue, pero no se detalla la cobertura |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM (artefacto compilado para WebLLM); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba Qwen sobre un corpus centrado en código y texto, y posteriormente ajustado con instrucciones (SFT) y preferencias (DPO/RLHF según la documentación pública de Qwen, aunque este repositorio no lo detalla). El contexto nativo del modelo base es de 32.768 tokens.

Sobre ese modelo, hmtscn ha producido un artefacto para MLC-LLM con cuantización q4f16_1, es decir, pesos en enteros de 4 bits agrupados y activaciones en fp16, compilado para ejecutarse con WebLLM en WebGPU. No se documenta en la model card si hubo fine-tuning específico para Excel ni con qué dataset; la única evidencia de especialización es el nombre del modelo y la descripción funcional ("recibe la petición en turco y la estructura de la tabla y produce una única fórmula de Excel"). No se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de fórmulas de Excel a partir de una instrucción en turco y de la estructura de la tabla (nombres y tipos de columna).
- Salida de una única fórmula por petición, según la descripción del autor.
- Ejecución en el navegador mediante WebLLM y WebGPU, sin llamadas a servidor.
- Capacidades heredadas del modelo base Qwen2.5-Coder-1.5B-Instruct: generación de texto, código y razonamiento básico, aunque no están validadas para esta variante cuantizada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: el objetivo declarado es el turco; la cobertura de otros idiomas no está documentada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de fórmulas en hojas de cálculo para usuarios turcos: el modelo recibe los nombres y tipos de columna y devuelve una fórmula Excel lista para pegar, reduciendo la necesidad de conocer la sintaxis de funciones como BUSCARV o SUMAPRODUCTO.
- Asistente integrado en una aplicación web ofimática: al ejecutarse con WebLLM en el navegador, puede incorporarse a un editor de hojas de cálculo sin backend y sin enviar datos de la tabla a un servidor, lo que facilita el cumplimiento de privacidad.
- Soporte a pymes con plantillas locales: una empresa puede desplegar una página estática que ayude a construir fórmulas sobre sus plantillas internas, sin coste de infraestructura de inferencia.
- Formación y onboarding: como herramienta didáctica para explicar y generar fórmulas a partir de descripciones en lenguaje natural, con latencia local y sin cuotas de API.
- Prototipado rápido de funciones de autocompletado: desarrolladores que evalúan WebLLM pueden usar este artefacto como referencia de integración de un modelo de 1,5B cuantizado en una aplicación web.
- Automatización de informes en entornos con conectividad limitada: al no requerir red tras la descarga inicial de los pesos, puede usarse en portátiles o entornos aislados para generar fórmulas sobre datos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,9 GB, por lo que la inferencia en q4f16_1 requiere del orden de 1 GB de memoria de GPU, además del overhead del runtime WebGPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable; en la práctica, GPUs integradas recientes (Intel Iris Xe, AMD Radeon integradas) y dedicadas (NVIDIA GTX 16xx/RTX 20xx en adelante, AMD RX 6000 en adelante).
- Cabe en GPU de consumo: sí, con margen amplio, al tratarse de un modelo de 1,5B en 4 bits.
- Opciones de despliegue: WebLLM (navegador, WebGPU) y MLC-LLM (runtime nativo). No se distribuyen pesos en GGUF ni safetensors en este repositorio, por lo que llama.cpp, Ollama, vLLM o TGI no son aplicables directamente sin reconvertir desde el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Yerel Excel Formül 1.5B (este) | 1,5B | no disponible (base: 32.768) | MLC/WebLLM q4f16_1 | Apache 2.0 | Fórmulas Excel en turco, en navegador |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 | safetensors, GGUF (comunidad) | Apache 2.0 | Código e instrucciones generales |
| Qwen/Qwen2.5-Coder-1.5B | 1,5B | 32.768 | safetensors | Apache 2.0 | Modelo base de código |
| Modelos especializados en Excel de la comunidad | no disponible | no disponible | varía | varía | Generación de fórmulas; no se dispone de datos verificables en la información proporcionada |

La comparación directa con otros modelos especializados en Excel no está disponible con datos verificables. Frente al modelo base, este artefacto añade el empaquetado para WebLLM y una orientación declarada al turco y a fórmulas, pero no documenta mejoras medibles.

## Limitaciones y advertencias

- La model card es mínima: no documenta dataset de ajuste, metodología de entrenamiento ni evaluación, por lo que la especialización en Excel no está verificada con métricas.
- Riesgo de alucinación: al ser un modelo de 1,5B, puede generar referencias de celda, nombres de funciones o sintaxis incorrectas, especialmente en fórmulas complejas; requiere validación antes de su uso en producción.
- Sesgos: no documentados; el modelo base puede arrastrar sesgos de su corpus de entrenamiento, y la orientación al turco puede degradar la calidad en otros idiomas.
- Limitaciones de idioma: el objetivo declarado es el turco; no hay datos sobre el rendimiento en castellano u otros idiomas.
- Contexto: aunque el modelo base soporta 32.768 tokens, la variante cuantizada para WebLLM puede tener límites prácticos de memoria y velocidad en el navegador no especificados.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene conservar los avisos de licencia del modelo base Qwen.
- Distribución: al no publicarse safetensors ni GGUF en este repositorio, la reutilización fuera de MLC/WebLLM exige partir del modelo base y reconvertir.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hmtscn/yerel-excel-formul-1.5b-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://github.com/mlc-ai/web-llm
- Documentación de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder/
