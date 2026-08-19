# fontlab/BananaMind-2-Pro-Preview-Chat-mixed

## Resumen

BananaMind-2-Pro-Preview-Chat-mixed es una versión cuantizada del modelo BananaMind-2-Pro-Preview-Chat, publicada por el usuario fontlab para el motor de inferencia bananamend. Se trata de un modelo de lenguaje pequeño de 138 millones de parámetros, orientado a tareas de generación de texto y conversación, con un ajuste fino completo sobre una arquitectura personalizada. La cuantización emplea un esquema mixto: matrices ternarias (valores -1, 0, +1) en las capas donde la pérdida de calidad es mínima y matrices de 8 bits en el resto, logrando un archivo 3,84 veces más pequeño que el original (144,94 MB frente a 555,89 MB) con una degradación medida muy baja (90,5 % de coincidencia en el siguiente token).

Este checkpoint es relevante porque demuestra que es posible comprimir modelos pequeños con cuantización ternaria selectiva sin necesidad de entrenar desde cero, un enfoque poco común en modelos por debajo de mil millones de parámetros. La licencia declarada es Apache-2.0, aunque el modelo base original utiliza una licencia comunitaria propia (bananamind-community-license-1), por lo que conviene revisar los términos antes de un uso comercial. El modelo requiere el motor bananamend para cargar los pesos, ya que estos están almacenados como códigos y escalas, no como valores flotantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con arquitectura personalizada (custom architecture) |
| Parametros totales | 138.134.400 (138 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 3.000 tokens (segun LLM Explorer) |
| Tipos de cuantizacion | Mixta: ternaria (12 matrices) e int8 (157 matrices), grupo de 64 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (declarada en el repo); el modelo base usa bananamind-community-license-1 |
| Formato de pesos | Safetensors con codigos y escalas (no legible por transformers; requiere bananamend) |

## Arquitectura y entrenamiento

El modelo base BananaMind-2-Pro-Preview-Chat es un small language model de 138 M de parámetros, entrenado mediante full fine-tuning para tareas de chat e instrucciones. Emplea un tokenizador de dígitos (digit tokenizer) y una arquitectura personalizada que requiere `trust_remote_code` para cargarse. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

La cuantización se realizó post-entrenamiento con el método `mixed` del motor bananamend. El proceso combina varias técnicas: búsqueda de umbrales por grupo de 64 pesos con escalas asimétricas (basado en Ternary Weight Networks y PT2-LLM), corrección de errores por columnas (GPTQ) y una selección automática de qué matrices deben ser ternarias en función de su impacto en las respuestas, manteniendo un presupuesto de pérdida. El resultado son 12 matrices ternarias y 157 de 8 bits. El informe `quantization_report.json` en el repositorio detalla los valores por tensor.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat.
- Seguimiento de instrucciones básicas (instruction-tuned).
- Inferencia eficiente en dispositivos con recursos limitados gracias a la cuantización mixta.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Chatbots de bajo coste en dispositivos embebidos: el modelo ocupa solo 145 MB y requiere menos de 1 GB de VRAM, por lo que puede ejecutarse en Raspberry Pi, routers o sistemas de automatización industrial para atender consultas simples.
- Asistente conversacional offline en aplicaciones móviles: al no depender de servidores externos, permite respuestas en tiempo real sin conexión, ideal para entornos con privacidad estricta.
- Generación de texto corto en pipelines de automatización: por ejemplo, redactar correos de respuesta, resumir logs o generar etiquetas descriptivas en sistemas de gestión documental.
- Prototipado rápido de agentes conversacionales: su tamaño reducido permite iterar sobre el prompt y el fine-tuning sin necesidad de infraestructura GPU costosa.
- Educación e investigación en cuantización: sirve como caso de estudio para analizar el impacto de la cuantización ternaria selectiva en modelos pequeños.
- Pruebas de concepto en entornos CI/CD: se puede integrar en pipelines de testing para validar flujos de chat automatizados con recursos mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye métricas de calidad de cuantización comparando el checkpoint cuantizado con el original en un texto de calibración no visto:

| Medida | Valor |
|---|---|
| Mismo siguiente token | 90,5 % |
| Siguiente token dentro de los primeros cinco | 99,0 % |
| Divergencia KL | 0,0111 |
| Perplejidad (cuantizado vs. original) | 33,3 vs. 33,3 |
| Respuestas greedy identicas | 3 de 8 |

Estos datos indican una degradación muy baja, aunque no son comparables con benchmarks de capacidad general.

## Requisitos de hardware

- VRAM estimada: 0,6 GB segun LLM Explorer, lo que permite ejecucion en practicamente cualquier GPU consumer (GTX 1060, RTX 2060, etc.) e incluso en CPU con suficiente RAM.
- GPU recomendadas: no requiere GPU de alta gama; cualquier GPU con 1 GB de VRAM es suficiente. Tambien puede ejecutarse en CPU.
- Compatibilidad con consumer GPU: si, es el caso de uso principal.
- Opciones de despliegue: exclusivamente mediante el motor bananamend (biblioteca `bananamendr` o CLI `bananamendy`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado datos oficiales; en un hardware modesto se espera una latencia de decenas de milisegundos por token, dado el tamano del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Disponibilidad |
|---|---|---|---|---|---|
| BananaMind-2-Pro-Preview-Chat-mixed | 138 M | 3K | Apache-2.0 (declarada) | Mixta ternaria/int8 | Repo HuggingFace, requiere bananamend |
| BananaMind-2-Pro-Preview-Chat (base) | 138 M | 3K | bananamind-community-license-1 | Original en float | HuggingFace, requiere trust_remote_code |
| SmolLM2-135M (referencia) | 135 M | 2K | Apache-2.0 | No cuantizado | HuggingFace, compatible transformers |
| Qwen2.5-0.5B (referencia) | 494 M | 32K | Apache-2.0 | No cuantizado | HuggingFace, compatible transformers |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia del checkpoint cuantizado es su formato propietario, que limita su uso al ecosistema bananamend.

## Limitaciones y advertencias

- Modelo muy pequeño (138 M de parámetros), con capacidad limitada para razonamiento complejo, conocimiento factual extenso o generación de código avanzado.
- Contexto de solo 3.000 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Riesgo de alucinaciones y respuestas incoherentes, especialmente en temas especializados.
- La cuantización ternaria, aunque selectiva, puede producir errores en tareas que requieren precisión numérica o lógica.
- El formato de pesos no es estándar: no puede cargarse con transformers, vLLM ni otros frameworks habituales. Depende del motor bananamend, que es un proyecto externo.
- La licencia declarada (Apache-2.0) difiere de la del modelo base (bananamind-community-license-1). Antes de un uso comercial, conviene verificar los términos de la licencia original y la compatibilidad de la cuantización.
- No se han publicado evaluaciones de sesgos, seguridad ni robustez.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un checkpoint reciente y poco validado por la comunidad.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/fontlab/BananaMind-2-Pro-Preview-Chat-mixed
- Modelo base: https://huggingface.co/BananaMind/BananaMind-2-Pro-Preview-Chat
- Árbol de archivos del modelo base: https://huggingface.co/BananaMind/BananaMind-2-Pro-Preview-Chat/tree/main
- Motor bananamend (repositorio de GitHub): https://github.com/twardoch/bananamend
- Ficha en LLM Explorer (modelo base): https://llm-explorer.com/model/BananaMind%2FBananaMind-2-Pro-Preview-Chat,OMDKYcZXPDxiNZHWubt8K
