# pranil00/ONIX-WizardCoder-Python-34B-V1.0-GGUF

## Resumen

ONIX-WizardCoder-Python-34B-V1.0-GGUF es una cuantizacion en formato GGUF del modelo WizardCoder-Python-34B-V1.0, publicado por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base, desarrollado por WizardLM, es un transformer de arquitectura LLaMA con 33.743.978.496 parametros (33,74 mil millones) especializado en generacion de codigo en Python, derivado de Code Llama y ajustado mediante evolucion de instrucciones. Esta version concreta aplica una cuantizacion IQ2_M (2,7 bits por peso) que reduce el artefacto de 66 GB en FP16 a 11,14 GB, con una ratio de compresion de 5,93x.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 34B en hardware de consumo: Apple Silicon con 11,47 GB de memoria unificada, GPUs NVIDIA de las series RTX 30/40/50 con 12,64 GB de VRAM dedicada, o CPUs x86 con 13,47 GB de RAM libre. El autor declara una retencion de calidad cognitiva del 82,0% respecto al modelo original y advierte de una posible degradacion en razonamiento matematico complejo.

Se trata de un artefacto de cuantizacion, no de un modelo entrenado desde cero: no aporta pesos nuevos ni datos de entrenamiento adicionales, sino una conversion del modelo original de WizardLM empaquetada para inferencia local mediante llama.cpp, Ollama, LM Studio, Jan o la herramienta propia del autor, run-any-model. La ficha del repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia LLaMA |
| Parametros totales | 33.743.978.496 (33,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (Apple Silicon y NVIDIA GPU); 4.096 tokens en CPU segun la model card |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso); tamano del artefacto 11,14 GB |
| Idiomas soportados | no disponible (el modelo base esta orientado a codigo, principalmente Python, con instrucciones en ingles) |
| Licencia | Apache 2.0 (segun metadatos del repositorio y model card) |
| Formato de pesos | GGUF (fichero `WizardLM--WizardCoder-Python-34B-V1.0-IQ2_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base WizardCoder-Python-34B-V1.0 es un transformer decoder-only de la familia LLaMA con 33,74B de parametros, construido sobre Code Llama 34B y afinado por WizardLM mediante la metodologia Evol-Instruct aplicada a instrucciones de codigo. Esta publicacion concreta no entrena ningun modelo: aplica una cuantizacion post-entrenamiento de tipo IQ2_M (2,7 bits por peso) mediante la herramienta run-any-model, un motor de optimizacion adaptativa descrito por el autor como "device-aware". La model card no documenta el numero de tokens de entrenamiento del modelo original, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica del artefacto es la compresion agresiva: reduce el peso de 66 GB en FP16 a 11,14 GB (83,1% de reduccion) manteniendo, segun el autor, un 82,0% de fidelidad cognitiva. El informe de telemetria incluido en la model card reporta una aceleracion de capas del 48/48 en Metal con un buffer de KV cache de 192 MB en Q4_0, y clasifica el modelo como "TIGHT FIT (Compacted)", es decir, cabe completo en memoria del dispositivo pero sin margen amplio. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de codigo en Python: el modelo base esta especializado en sintesis, completado y explicacion de codigo Python a partir de instrucciones en lenguaje natural.
- Razonamiento sobre codigo: comprension de fragmentos, depuracion y refactorizacion guiada por instrucciones.
- Generacion de texto general: al derivar de Code Llama, conserva capacidad de generacion de texto, aunque su optimizacion principal es el codigo.
- Conversacion multi-turno: la model card incluye parametros de parada (`<|im_end|>`, `<|endoftext|>`) y modo conversacional (`-cnv` en llama.cpp), lo que indica soporte de dialogos.
- Ejecucion local en multiples plataformas: aceleracion Metal en Apple Silicon, CUDA en NVIDIA y AVX2/AVX-512 en CPU.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente de programacion en local para Python: el modelo puede generar funciones, clases y tests a partir de descripciones en lenguaje natural, ejecutandose en un portatil con 12-13 GB de memoria sin depender de APIs externas. Es adecuado por su especializacion en Python y su tamano comprimido.
- Revision de codigo en entornos con requisitos de privacidad: al ejecutarse completamente en local (llama.cpp, Ollama o LM Studio), permite analizar fragmentos de codigo propietario sin enviarlos a servicios en la nube, lo que encaja en equipos con politicas estrictas de confidencialidad.
- Autocompletado y explicacion de codigo en IDE: integrable mediante llama.cpp u Ollama como backend local para explicar funciones heredadas o generar docstrings, con contexto de hasta 8.192 tokens en GPU y Apple Silicon.
- Generacion de scripts de automatizacion y utilidades de sistema: el modelo puede producir scripts Python para tareas de procesamiento de ficheros, parsing o automatizacion, apropiado por su entrenamiento en instrucciones de codigo.
- Formacion y experimentacion con cuantizacion extrema: util como caso de estudio para investigadores que evaluen la degradacion de calidad de un modelo de 34B a 2,7 bits por peso, comparando el 82% de retencion declarado con el modelo FP16.
- Prototipado en hardware de consumo: desarrolladores con una RTX 3060/4060 Ti de 12-16 GB o un Mac con 16 GB de memoria unificada pueden desplegar un modelo de 34B para pruebas de concepto sin infraestructura de servidor.
- Traduccion y explicacion de codigo entre lenguajes: aunque optimizado para Python, puede emplearse para explicar fragmentos o proponer equivalentes, con resultados menos fiables fuera de su dominio principal.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion. Solo se publica el informe de telemetria interno de run-any-model, que se reproduce a continuacion:

| Metrica | Baseline (FP16) | Cuantizado (IQ2_M) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/param | 2,7 bits/param | -83,1% |
| Tamano de pesos | 66,00 GB | 11,14 GB | -83,1% |
| Buffer KV cache | 192,0 MB (FP16) | 192,0 MB (Q4_0) | Optimizado |
| RAM residente total | 66,90 GB | 11,47 GB | -82,8% |
| Categoria de viabilidad | Inviable / crash | TIGHT FIT (Compacted) | Validado |
| Calidad estimada | 100,0% baseline | 82,0% retenida | -18,0% |
| Aceleracion de capas | 0% (riesgo de crash) | 48/48 capas | Optimo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras de calidad son estimaciones del autor, no mediciones con suites de evaluacion reconocidas.

## Requisitos de hardware

- Apple Silicon (M1/M2/M3/M4/M5): 11,47 GB de memoria unificada, contexto optimo de 8.192 tokens, aceleracion Metal nativa.
- NVIDIA GPU (RTX 30/40/50): 12,64 GB de VRAM dedicada, contexto de 8.192 tokens, aceleracion CUDA.
- PC Windows/Linux con CPU: 13,47 GB de RAM libre, contexto de 4.096 tokens, soporte AVX2/AVX-512.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12,64 GB de VRAM (por ejemplo RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti o superiores). No cabe en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model del autor.
- Latencia y throughput: no disponibles. La model card solo indica aceleracion de las 48 capas en Metal y clasifica el ajuste como "TIGHT FIT", sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-WizardCoder-Python-34B-V1.0-GGUF (esta ficha) | 33,74B | 8.192 (GPU/Apple), 4.096 (CPU) | GGUF IQ2_M, 11,14 GB | Apache 2.0 | Hugging Face (0 descargas) |
| WizardLM/WizardCoder-Python-34B-V1.0 (base) | 33,74B | no disponible en la informacion | safetensors FP16, ~66 GB | Apache 2.0 | Hugging Face (modelo original) |
| Code Llama 34B (Meta) | 34B | hasta 100.000 tokens en variantes long-context | safetensors, GGUF | Llama 2 Community License | Hugging Face, amplia adopcion |
| DeepSeek-Coder 33B | 33B | 16.384 tokens | safetensors, GGUF | DeepSeek License (uso comercial con restricciones) | Hugging Face |

La comparativa se limita a parametros y disponibilidad: no hay datos de benchmarks en la informacion proporcionada para establecer una comparacion de rendimiento fiable entre estos modelos. La ventaja principal de esta publicacion frente al modelo base es el tamano (11,14 GB frente a ~66 GB) y la posibilidad de ejecucion en hardware de consumo; su desventaja es la perdida de calidad estimada del 18% y la ausencia de validacion con benchmarks estandar.

## Limitaciones y advertencias

- Degradacion de calidad por cuantizacion extrema: el autor estima un 82,0% de retencion cognitiva y advierte de posible degradacion en razonamiento matematico complejo. A 2,7 bits por peso, es esperable un deterioro notable en tareas de codigo que requieran precision.
- Riesgo de alucinacion: como todo modelo generativo de codigo, puede producir APIs inexistentes, imports erroneos o logica incorrecta que compile pero falle en ejecucion. Requiere validacion con tests.
- Sesgos: no documentados en la informacion proporcionada. El modelo base hereda los sesgos de sus datos de entrenamiento, no auditados en esta publicacion.
- Limitaciones de idioma: la model card no declara idiomas soportados; el modelo base esta orientado a instrucciones en ingles y codigo Python, por lo que el rendimiento en castellano no esta garantizado.
- Contexto limitado: 8.192 tokens en GPU y Apple Silicon, y solo 4.096 en CPU, muy por debajo de alternativas modernas con contextos de 32K a 128K.
- Licencia: se declara Apache 2.0 tanto en los metadatos como en la model card, lo que permitiria uso comercial. No obstante, conviene verificar la licencia del modelo base original de WizardLM antes de un despliegue comercial, ya que la cadena de licencias de modelos derivados puede presentar ambiguedades.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (25 de noviembre de 2026). No hay evidencia de validacion independiente de las cifras de calidad declaradas.
- Ajuste de memoria ajustado: la propia model card clasifica el despliegue como "TIGHT FIT", por lo que contextos largos o lotes mayores pueden provocar fallos de memoria (OOM) en dispositivos en el limite de VRAM/RAM.
- Ausencia de benchmarks estandar: no hay resultados de HumanEval, MMLU ni GSM8K que permitan comparar objetivamente con otras cuantizaciones del mismo modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-WizardCoder-Python-34B-V1.0-GGUF
- Modelo base: https://huggingface.co/WizardLM/WizardCoder-Python-34B-V1.0
- Organizacion ONIX: https://huggingface.co/ONIX
- Herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
