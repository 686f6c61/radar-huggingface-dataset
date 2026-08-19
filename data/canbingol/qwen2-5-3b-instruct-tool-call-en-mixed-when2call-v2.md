# canbingol/qwen2.5-3B-Instruct-tool-call-en-mixed-when2call-v2

## Resumen

Este modelo es un ajuste fino de Qwen/Qwen2.5-3B-Instruct realizado por el autor canbingol, orientado a mejorar la capacidad de llamada a herramientas (tool calling) en inglés. El nombre "when2call" indica que el entrenamiento se centra en enseñar al modelo a decidir cuándo invocar una herramienta externa y cuándo responder directamente, una capacidad crítica para reducir llamadas innecesarias en sistemas agénticos. El término "mixed" sugiere que los datos de entrenamiento combinan ejemplos con y sin invocación de herramientas.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 con aproximadamente 3 000 millones de parámetros y se ha entrenado mediante aprendizaje supervisado (SFT) con la librería TRL de Hugging Face. Se publica en formato safetensors y es compatible con el pipeline `text-generation` de transformers. Es relevante para desarrolladores que necesitan modelos pequeños y eficientes para pipelines de agentes con tool calling, especialmente en entornos con recursos de hardware limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | ~3 000 millones (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No especificados; pesos en safetensors |
| Idiomas soportados | Ingles (enfoque del fine-tune); el modelo base es multilingue |
| Licencia | No especificada (el campo "licence" de la model card contiene el valor "license", no una licencia real) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm y embeddings rotatorios (RoPE). El fine-tune se realizo mediante SFT con la libreria TRL 1.10.0, Transformers 5.13.1 y PyTorch 2.11.0+cu128. No se han publicado detalles sobre la composicion del dataset de entrenamiento, el numero de pasos ni el tamano del lote.

La denominacion "when2call" sugiere que el entrenamiento se enfoco en ensenar al modelo a emitir llamadas a herramientas solo cuando es necesario, evitando invocaciones superfluas en conversaciones donde la respuesta directa es suficiente. El termino "mixed" indica probablemente una mezcla de ejemplos con y sin tool calling en los datos de entrenamiento. El tamano del repositorio es de 0.3 GB, notablemente inferior a los ~6 GB que ocuparia un modelo de 3B en FP16, lo que sugiere que podria contener pesos adaptadores o una representacion comprimida, aunque la model card no lo aclara.

## Capacidades

- Llamada a herramientas (tool calling) en ingles, con decision explicita de cuando invocar una funcion externa frente a responder directamente.
- Generacion de texto instructivo heredada del modelo base Qwen2.5-3B-Instruct.
- Soporte de conversaciones multi-turno con formato de chat (roles user/assistant).
- Compatible con el pipeline `text-generation` de transformers para integracion directa en Python.
- El modelo base subyacente es multilingue y soporta hasta 32K tokens de contexto, aunque el fine-tune se centra en ingles.

## Casos de uso

- Agentes autonomos con tool calling: el modelo puede integrarse en pipelines donde debe decidir dinamicamente si consultar una API externa o responder con conocimiento interno, reduciendo latencia y coste de llamadas innecesarias gracias a la estrategia when2call.
- Asistentes de atencion al cliente: al combinar generacion de respuestas con invocacion de herramientas como bases de conocimiento o sistemas de tickets, el modelo gestiona consultas multi-turno de forma eficiente en despliegues con recursos modestos.
- Automatizacion de tareas de backend: puede orquestar llamadas a funciones internas (consultas SQL, APIs REST, calculos) en entornos de produccion donde se requiere baja latencia y un modelo de tamano reducido.
- Prototipado rapido de agentes: su tamano de 3B permite iteraciones rapidas en entornos de desarrollo sin necesidad de GPUs de gran capacidad, facilitando pruebas de concepto de sistemas agénticos.
- Investigacion sobre politicas when2call: sirve como punto de partida para estudiar estrategias de decision de llamada a herramientas en modelos pequenos, comparando el comportamiento con el modelo base sin fine-tune.
- Despliegue en edge o entornos con recursos limitados: al caber en GPUs de consumo con cuantizacion, puede ejecutarse localmente para aplicaciones de asistencia en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar en su model card, por lo que no es posible comparar su rendimiento cuantitativo con alternativas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB en FP16, 3 GB en cuantizacion de 8 bits y 2 GB en 4 bits para inferencia.
- GPU recomendadas: RTX 3060 (12 GB), RTX 3090, RTX 4090, A10G o superiores; tambien ejecutable en Apple Silicon con cuantizacion.
- Cabe en GPUs de consumo: si, incluso en tarjetas con 8 GB de VRAM si se aplica cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers (pipeline text-generation).
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| canbingol/qwen2.5-3B-Instruct-tool-call-en-mixed-when2call-v2 | 3B | 32K | Tool calling con when2call | No especificada |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32K | Instruct general | Apache 2.0 |
| canbingol/Qwen2.5-3B-Instruct-tool-call-en | 3B | 32K | Tool calling | No especificada |
| canbingol/qwen2.5-3B-Instruct-tool-call-en-norobots | 3B | 32K | Tool calling (variante sin robots) | No especificada |

## Limitaciones y advertencias

- La licencia no esta claramente especificada: el campo "licence" de la model card contiene el valor "license", que no corresponde a una licencia real. Antes de usar en produccion, es recomendable contactar con el autor para aclarar los terminos de uso, especialmente para fines comerciales.
- No se han publicado detalles sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos o limitaciones del fine-tune.
- El modelo tiene 0 descargas y 0 likes, lo que indica que es muy reciente y no ha sido validado por la comunidad.
- No se han publicado benchmarks que permitan comparar su rendimiento con alternativas.
- El fine-tune se centra en ingles; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Al ser un modelo de 3B, puede presentar alucinaciones y errores en tareas complejas de razonamiento, especialmente en dominios especializados.
- El tamano del repositorio (0.3 GB) es inusualmente pequeno para un modelo de 3B en FP16, lo que podria indicar que contiene pesos adaptadores o una representacion comprimida; conviene verificar el contenido antes de desplegar.
- La longitud de contexto efectiva puede verse reducida si el fine-tune no preserva la ventana completa de 32K tokens del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canbingol/qwen2.5-3B-Instruct-tool-call-en-mixed-when2call-v2
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Variante anterior del autor: https://huggingface.co/canbingol/Qwen2.5-3B-Instruct-tool-call-en
- Variante norobots del autor: https://huggingface.co/canbingol/qwen2.5-3B-Instruct-tool-call-en-norobots
- Documentacion de function calling de Qwen2.5 (DeepWiki): https://deepwiki.com/QwenLM/Qwen2.5/2.2-function-calling-and-tool-use
- Pagina de Qwen2.5:3b-instruct en Ollama: https://ollama.com/library/qwen2.5:3b-instruct
