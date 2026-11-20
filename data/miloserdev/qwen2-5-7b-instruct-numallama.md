# miloserdev/Qwen2.5-7B-Instruct-numallama

## Resumen

Qwen2.5-7B-Instruct-numallama es una conversión del modelo Qwen2.5-7B-Instruct de Alibaba Qwen al formato propietario del motor de inferencia numallama, desarrollado por miloserdev. numallama es un motor de inferencia en C diseñado específicamente para servidores CPU con múltiples sockets, con ejecución consciente de NUMA (Non-Uniform Memory Access) que distribuye la carga entre todos los sockets de la máquina. El modelo base es un transformer denso de 7.000 millones de parámetros con licencia Apache 2.0.

La relevancia de esta conversión radica en que permite ejecutar un modelo de 7B en servidores ARM64 de altas prestaciones (Ampere Altra, AWS Graviton y otros núcleos Neoverse) sin GPU, aprovechando instrucciones NEON para el producto escalar. El autor reporta 42 tokens por segundo en decodificación sobre una máquina de 2 × Ampere Altra Max M128-30 (256 núcleos Neoverse N1 en total, dos sockets). Es una propuesta orientada a despliegues de inferencia en infraestructura CPU multisocket, no a uso doméstico.

Los ficheros no son GGUF y no funcionan con llama.cpp, Ollama, LM Studio ni transformers: solo se ejecutan con numallama. El repositorio ocupa 8,1 GB e incluye pesos en Q8 (SmoothQuant, int8 con escalas por grupo) y tokenizer.bin. La model card menciona también una cuantización Q4 asimétrica (grupos de 32, escala y mínimo en fp16) con matriz de importancia, aunque la tabla de ficheros solo lista el binario Q8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-7B-Instruct) |
| Parametros totales | 7.000 millones (aproximado, segun modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta hasta 131.072 tokens, pero la conversion no lo especifica) |
| Tipos de cuantizacion | Q8 (SmoothQuant, int8 con escalas por grupo); Q4 asimetrica de 4 bits (grupos de 32, escala y minimo fp16) mencionada en la model card |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Binario propietario de numallama (.bin), no GGUF, no safetensors |

## Arquitectura y entrenamiento

El modelo es una conversión directa del transformer denso Qwen2.5-7B-Instruct, sin reentrenamiento ni ajuste adicional por parte del autor de la conversión. La innovación técnica no está en el modelo sino en el motor de ejecución: numallama implementa inferencia en C optimizada para ARM64 con producto escalar NEON y ejecución NUMA-aware que reparte el trabajo entre todos los sockets de un servidor multisocket. El motor soporta además decodificación especulativa, herramientas (tools) y servidor compatible con la API de OpenAI, según se indica en su README.

La cuantización Q8 es int8 con escalas por grupo (SmoothQuant). La cuantización Q4 es asimétrica de 4 bits con grupos de 32 y matriz de importancia recopilada por numallama sobre texto en inglés, ruso, chino y código. No se dispone de información sobre el dataset de entrenamiento original, número de tokens, ni si hubo RLHF o DPO; esos datos corresponden a la model card del modelo base Qwen2.5-7B-Instruct, no incluida en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas: capacidades del modelo base, no verificadas en esta conversión.
- Generación de código: el modelo base está entrenado para código; la matriz de importancia de la cuantización Q4 incluye texto de código.
- Soporte de tool calling / function calling: el motor numallama declara soporte de herramientas (tools) en su README.
- Decodificación especulativa: disponible a nivel de motor según el README de numallama.
- Servidor compatible con la API de OpenAI en /v1, lo que facilita la integración con clientes existentes.
- Capacidades multilingües: no confirmadas para esta conversión; la matriz de importancia cubre inglés, ruso y chino.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Inferencia en servidores CPU ARM64 sin GPU: despliegue de un modelo de 7B en clústeres con Ampere Altra o AWS Graviton, aprovechando los 256 núcleos y la ejecución NUMA para obtener 42 tok/s en decodificación.
- Servicio de chat interno con API compatible OpenAI: arrancar numallama en modo servidor en el puerto 8080 y conectar aplicaciones existentes que ya usan el cliente de OpenAI, sin cambios de código en el cliente.
- Procesamiento por lotes en infraestructura CPU existente: generación de resúmenes, clasificación o extracción de información sobre grandes volúmenes de documentos donde no hay GPUs disponibles y el coste por token en CPU es competitivo.
- Asistentes de código en entornos con restricciones de GPU: el modelo base tiene capacidad de generación de código y la cuantización incluye datos de código en su matriz de importancia, lo que permite integrarlo en pipelines de revisión o autocompletado en servidores ARM.
- Despliegue en entornos con requisitos de localización de datos: al ejecutarse en CPU y con pesos descargables, permite mantener la inferencia dentro de la infraestructura propia sin depender de APIs externas.
- Experimentación con decodificación especulativa y optimizaciones NUMA: numallama expone opciones de contexto, muestreo, herramientas y decodificación especulativa, útil para investigación en eficiencia de inferencia en CPU.
- Prototipado de agentes con tool calling: el soporte de herramientas del motor permite construir flujos de agente multi-paso sobre la API local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento proporcionado es de velocidad de decodificación:

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion (Q8) | 42 tok/s | 2 × Ampere Altra Max M128-30, 256 nucleos Neoverse N1, ambos sockets, un solo chat |
| Decodificacion (Q4) | No disponible numericamente; el autor indica que es mas rapida y mas pequena que Q8 | No disponible |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El fichero Q8 ocupa 8,1 GB en disco y requiere memoria RAM suficiente para cargarlo, más el espacio del contexto.
- CPU recomendada: ARM64 con NEON dot product (Ampere Altra, AWS Graviton, otros núcleos Neoverse). En x86-64 y otras CPUs se ejecuta código C portable no optimizado.
- Servidor de referencia del autor: 2 × Ampere Altra Max M128-30 (256 núcleos Neoverse N1, dos sockets), con 42 tok/s en Q8.
- ¿Cabe en consumer GPU? No aplica: no es compatible con CUDA ni con llama.cpp/Ollama/LM Studio; solo funciona con numallama en CPU.
- Opciones de despliegue: numallama en modo chat de terminal o modo servidor con API compatible OpenAI en /v1 (puerto configurable, 8080 en el ejemplo).
- Latencia y throughput: 42 tok/s para un solo chat en Q8 sobre la máquina de referencia; el resto de configuraciones no están medidas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-numallama | ~7B denso | No disponible en la conversion | Binario numallama, solo CPU ARM64 optimizado | Apache 2.0 | 42 tok/s en 256 nucleos Neoverse N1 |
| Qwen/Qwen2.5-7B-Instruct (original) | ~7B denso | Hasta 131.072 tokens (segun modelo base) | Safetensors, transformers / vLLM / TGI | Apache 2.0 | Requiere GPU para rendimiento practico |
| Versiones GGUF de Qwen2.5-7B-Instruct | ~7B denso | Segun configuracion de llama.cpp | GGUF, llama.cpp / Ollama / LM Studio | Apache 2.0 | Compatible con CPU y GPU consumer; no soporta ejecucion NUMA multisocket especifica |

La comparativa con alternativas de la misma categoria (motores de inferencia CPU) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los ficheros no son GGUF y no funcionan con llama.cpp, Ollama, LM Studio ni transformers; solo se ejecutan con numallama.
- La optimización está limitada a ARM64 con NEON; en x86-64 y otras CPUs el código portable no está optimizado, por lo que el rendimiento será muy inferior al reportado.
- No hay resultados de benchmarks de calidad publicados para esta conversión; las capacidades reales dependen del modelo base y de la cuantización, no verificadas de forma independiente.
- La cuantización Q8 y Q4 puede degradar la calidad respecto al modelo original en tareas sensibles; el autor indica que Q8 es más fiel y Q4 más rápido y pequeño.
- Los idiomas soportados no están documentados en la conversión; la matriz de importancia de Q4 cubre inglés, ruso, chino y código, pero no se garantiza un rendimiento multilingüe uniforme.
- Riesgo de alucinación inherente a los modelos de lenguaje de 7B; no se han publicado evaluaciones específicas de esta conversión.
- Sesgos conocidos: no documentados en la información proporcionada; heredados potencialmente del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen2.5-7B-Instruct y del motor numallama por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un proyecto reciente sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/miloserdev/Qwen2.5-7B-Instruct-numallama
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Motor numallama: https://github.com/miloserdev/numallama
- README de numallama (opciones y API): https://github.com/miloserdev/numallama#readme
