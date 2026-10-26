# RezaManzour/SmolLM2-135M-Instruct-smolcourse

## Resumen

`RezaManzour/SmolLM2-135M-Instruct-smolcourse` es un ajuste fino por supervisión (SFT) del modelo `HuggingFaceTB/SmolLM2-135M`, publicado por el usuario RezaManzour. Se trata de un transformer decoder-only denso de 135 millones de parámetros, la variante más pequeña de la familia SmolLM2 de Hugging Face, reentrenada con la librería TRL sobre la base instruct ya existente. El nombre del repositorio sugiere un uso didáctico ("smolcourse"), es decir, un ejercicio de fine-tuning más que un modelo destinado a producción.

El problema que aborda es el de disponer de un modelo de lenguaje mínimo, ejecutable en CPU o en hardware muy limitado, que pueda ajustarse y desplegarse con un coste computacional trivial. Su relevancia es, por tanto, educativa y experimental: sirve para validar pipelines de SFT con TRL, para probar flujos de transformers y para experimentar con cuantización extrema sin necesidad de GPU de gama alta.

La información publicada por el autor es mínima: no se documenta el conjunto de datos de entrenamiento, los hiperparámetros, la licencia efectiva ni los idiomas soportados. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y el tamaño reportado es de 0.0 GB, lo que apunta a un artefacto incompleto o a un problema de indexación en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de SmolLM2-135M) |
| Parametros totales | 135 M (según nomenclatura del modelo base; no verificado en la model card del fine-tune) |
| Longitud de contexto | No disponible en la model card del fine-tune; el modelo base SmolLM2-135M declara 8.192 tokens |
| Tipos de cuantizacion | No especificados por el autor; al ser un modelo denso de 135 M es convertible a GGUF, int8 y 4-bit con herramientas estándar |
| Idiomas soportados | No disponibles (el modelo base está entrenado principalmente en inglés, sin confirmación en esta ficha) |
| Licencia | No disponible: la model card contiene el marcador de posición `licence: license`; el modelo base SmolLM2 se publica bajo Apache-2.0 |
| Formato de pesos | safetensors (tag del repositorio); tamaño del repo reportado como 0.0 GB |
| Libreria | transformers |
| Metodo de entrenamiento | SFT con TRL 1.16.0 |
| Version de transformers | 5.20.2 |
| Version de PyTorch | 2.11.0+cu130 |
| Version de Datasets / Tokenizers | 5.1.0 / 0.23.3 |
| Fecha de creacion / actualizacion | 2026-10-26 / 2026-10-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 135 M de parámetros, con atención causal estándar y sin mezcla de expertos. SmolLM2 se diseñó como familia de modelos ligeros para ejecución en dispositivo (on-device), y esta variante conserva esa estructura; el autor no introduce cambios arquitectónicos, sino un ajuste fino sobre los pesos instruct preexistentes.

El entrenamiento se realizó mediante SFT con TRL (versión 1.16.0) sobre Transformers 5.20.2 y PyTorch 2.11.0+cu130. La model card no especifica el dataset, el número de tokens, la composición de las muestras, la longitud de secuencia, la tasa de aprendizaje ni si hubo etapas posteriores de preferencias (DPO/RLHF): todos estos datos figuran como no disponibles. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación). El pipeline generado (`generated_from_trainer`) y el uso de la plantilla de chat por roles en el ejemplo de inicio rápido indican que el ajuste respeta el formato conversacional del modelo base.

## Capacidades

- Generación de texto autoregresiva en formato conversacional de un solo turno o multi-turno, usando la plantilla de chat con roles.
- Respuesta a instrucciones simples heredada del modelo base instruct; el alcance real del ajuste no está evaluado.
- Generación de código y matemáticas básicas a nivel muy elemental, limitado por la capacidad de 135 M de parámetros; no hay evaluación publicada que lo confirme.
- Soporte de tool calling / function calling: no documentado y poco probable en un modelo de este tamaño sin ajuste específico.
- Razonamiento multi-paso y comportamiento agéntico: no documentado.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.
- Multilingüismo: no documentado; no se declaran idiomas en la model card.

## Casos de uso

- Docencia y formación en fine-tuning: el modelo sirve como ejemplo mínimo para reproducir un pipeline de SFT con TRL, inspeccionar el `Trainer` generado y comparar el comportamiento antes y después del ajuste sin coste de GPU.
- Pruebas de integración de `transformers`: al ocupar menos de 1 GB en fp16, permite validar el flujo `pipeline("text-generation")`, la carga con `device_map="auto"` y el formateo de mensajes por roles en entornos de CI sin aceleradores.
- Generación de texto de baja latencia en dispositivos embebidos: con cuantización int8 o 4-bit el modelo cabe en unos pocos cientos de megabytes, lo que habilita autocompletado o respuestas cortas en Raspberry Pi, portátiles modestos o navegador vía transformers.js (previa conversión).
- Experimentación con cuantización: sirve como banco de pruebas para medir la degradación de calidad al pasar de fp16 a 4-bit en un modelo pequeño, con ciclos de conversión y evaluación de minutos.
- Filtrado y clasificación ligera de texto: con ajuste adicional sobre un conjunto etiquetado pequeño, puede usarse para tareas de etiquetado o enrutamiento de consultas donde no se requiera razonamiento profundo.
- Prototipado de asistentes conversacionales de dominio cerrado: útil para validar interfaces de chat y flujos de prompt antes de migrar a un modelo mayor, aceptando que la calidad de las respuestas será limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del fine-tune no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan comparaciones con el modelo base ni con la variante instruct original.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de 135 M de parámetros, no mediciones publicadas): en fp16/bf16 los pesos ocupan aproximadamente 270 MB, con un pico de 0,6-1 GB incluyendo caché de activaciones y KV; en int8, unos 135 MB; en 4-bit, 70-80 MB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). No se requiere GPU de centro de datos.
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales e incluso en iGPU con memoria unificada. También es viable en CPU pura y en dispositivos tipo Raspberry Pi 4/5 con llama.cpp.
- Opciones de despliegue: `transformers` con `pipeline` (ruta documentada por el autor); conversión a GGUF para llama.cpp u Ollama (requiere generar el archivo, no se distribuye en el repo); vLLM o TGI son compatibles técnicamente pero están sobredimensionados para este tamaño; despliegue en navegador mediante ONNX/transformers.js tras conversión.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este fine-tune concreto.

## Comparativa con modelos similares

Datos de los modelos comparables tomados de sus model cards públicas; no verificados en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RezaManzour/SmolLM2-135M-Instruct-smolcourse | 135 M | No disponible (base: 8.192) | No disponible | Hub, 0 descargas | Fine-tune SFT sin evaluar |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8.192 tokens | Apache-2.0 | Hub, ampliamente utilizado | Modelo base de referencia, con card completa |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M | 8.192 tokens | Apache-2.0 | Hub | Misma familia, mayor calidad a coste aún mínimo |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | Apache-2.0 | Hub | Contexto mucho mayor y mejor soporte multilingüe |

## Limitaciones y advertencias

- Capacidad muy reducida: con 135 M de parámetros el modelo falla en razonamiento multi-paso, matemáticas no triviales, código complejo y coherencia en respuestas largas.
- Riesgo alto de alucinación: no se ha publicado ninguna evaluación de fidelidad factual y el tamaño del modelo agrava el problema.
- Sesgos desconocidos: al no documentarse el dataset de SFT, no es posible caracterizar los sesgos introducidos por el ajuste; los del modelo base tampoco se detallan en esta card.
- Idiomas no declarados: no hay garantía de comportamiento correcto en castellano; el modelo base está orientado principalmente al inglés.
- Licencia indeterminada: la model card contiene un marcador de posición (`licence: license`), por lo que el uso comercial no está autorizado de forma explícita. Cualquier despliegue en producción requiere aclarar la licencia con el autor y verificar la del modelo base (Apache-2.0).
- Artefacto potencialmente incompleto: el tamaño del repositorio se reporta como 0.0 GB y no hay descargas ni validación de la comunidad; conviene comprobar que los pesos se descargan correctamente antes de integrarlos.
- Metadatos inconsistentes: las fechas de creación y actualización (2026-10-26) y las versiones de framework declaradas (Transformers 5.20.2, PyTorch 2.11.0) deben verificarse antes de reproducir el entorno.
- Ausencia total de benchmarks: no hay evidencia de que el ajuste mejore al modelo base en ninguna tarea; podría incluso degradarlo.
- No apto para production sin evaluación previa: sin métricas, sin card completa y sin licencia clara, debe tratarse como un experimento didáctico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RezaManzour/SmolLM2-135M-Instruct-smolcourse
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Variante instruct del modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Tutorial de ejecución local de SmolLM2-135M-Instruct: https://aiindigo.com/tutorials/getting-started-with-smollm2-135m-instruct-run-a-capable-llm-on-any-device
- Tutorial de despliegue en hardware de consumo: https://aiindigo.com/tutorials/getting-started-with-smollm2-135m-instruct-run-ai-locally-in-seconds
- Ficha de referencia en Atomic Chat: https://atomic.chat/models/smollm2-135m-instruct
