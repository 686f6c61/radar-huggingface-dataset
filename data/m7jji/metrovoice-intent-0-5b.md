# m7jji/metrovoice-intent-0.5b

## Resumen

MetroVoice intent 0.5B es un modelo de lenguaje especializado en el análisis de intenciones (intent parsing) para el metro de Doha (Qatar), desarrollado por el usuario m7jji en el marco del hackathon QAI × Hugging Face. Su función concreta es transformar transcripciones de voz en JSON estricto con tres campos (`from`, `to`, `lang`) que un planificador de rutas determinista puede consumir. El modelo no calcula rutas: solo interpreta la petición del pasajero.

Técnicamente es un ajuste fino mediante LoRA del modelo base Qwen/Qwen2.5-0.5B-Instruct, con 494.032.768 parámetros totales (17,6 M entrenables durante el ajuste). La arquitectura es la del transformer decoder-only de Qwen2.5, con una ventana de contexto heredada del modelo base y un formato de prompt fijo definido en `prompt.py`. El repositorio incluye tanto el modelo fusionado en bf16 (~950 MB) como el adaptador LoRA aislado (35 MB).

Su relevancia radica en el enfoque: un modelo minúsculo, entrenado con datos sintéticos y ejecutable en hardware de consumo, que resuelve una tarea de dominio muy acotada con alta precisión declarada (95,7 % en un conjunto de prueba escrito a mano y 97,7 % en el split sintético reservado). Es un ejemplo de destilación de tarea hacia un modelo pequeño para despliegue en quioscos o dispositivos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino con LoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas; pesos en bf16 (modelo fusionado) y adaptador LoRA en bf16 |
| Idiomas soportados | ar, en, hi, ur, ml, tl, fr, zh, es, bn, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado) y adaptador LoRA (PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. Sobre él se aplicó un ajuste fino con LoRA de rango 32, alpha 64 y dropout 0,05 sobre todas las proyecciones de atención y MLP, lo que supone 17,6 M parámetros entrenables. El adaptador se fusionó posteriormente en el modelo base y se guardó en bf16. El formato de prompt es fijo y se distribuye en `prompt.py`; la generación se realiza con decodificación greedy y aproximadamente 20 tokens nuevos.

El entrenamiento se llevó a cabo con TRL `SFTTrainer` en formato prompt/completion, calculando la pérdida únicamente sobre la respuesta JSON. Se usaron 15.840 transcripciones sintéticas generadas por `train/make_dataset.py` a partir de los nombres de las 37 estaciones y 94 puntos de referencia del dataset `m7jji/doha-metro-multilingual`, junto con unas 3.200 alias hablados. Los datos cubren entre 15 y 35 plantillas escritas a mano por idioma e incluyen ruido tipo ASR (minúsculas, puntuación eliminada, errores ortográficos, muletillas, tartamudeos y cambio de código). El split es determinista con un 10 % reservado y sin duplicados entre particiones. Se entrenó 1 época, 990 pasos, batch efectivo 16, learning rate 2e-4 con scheduler coseno y longitud máxima 192. La versión v2 se entrenó en una NVIDIA RTX 5090 en 80 segundos (unos 0,06 s/paso); la v1 se entrenó en un Apple M4 (MPS) en 36 minutos.

## Capacidades

- Interpretación de intenciones de viaje en transporte público: extrae origen, destino e idioma de una frase en lenguaje natural.
- Generación de JSON estricto con los campos `from`, `to` y `lang`, validable contra los identificadores de estaciones y puntos de referencia.
- Clasificación de idioma mediante el campo `lang` (código ISO 639-1).
- Manejo de cambio de código (code-switching), por ejemplo nombres de lugares en inglés dentro de frases en árabe, hindi, urdu, malayo o chino.
- Comprensión de árabe estándar moderno (MSA) y dialecto del Golfo (formas como أبي, ابغى, ودني, وين, شلون).
- Procesamiento de formas romanizadas en hindi y malayo.
- Detección de negativos y destinos fuera de Doha, devolviendo `to: null`.
- Manejo de autocorrecciones del hablante ("llévame a X… no, perdón, Y").
- Preguntas sobre la estación más cercana.
- No soporta tool calling ni function calling genérico, ni razonamiento multi-paso, ni visión, audio u otras modalidades. La tarea está deliberadamente acotada al parseo de intenciones.

## Casos de uso

- Quiosco de atención al viajero en estaciones del metro de Doha: el modelo recibe la transcripción de Whisper y devuelve el JSON que alimenta el planificador de rutas; su tamaño de 0,5 B permite ejecutarlo en el propio dispositivo del quiosco sin depender de la nube.
- Integración en asistentes de voz multilingües para transporte público: al cubrir once idiomas, incluidos árabe, hindi, urdu, malayo, tagalo y chino, atiende a la población inmigrante de Qatar sin necesidad de un modelo multilingüe grande.
- Preprocesamiento en pipelines de NLU: actúa como primer eslabón que normaliza la petición a identificadores estables antes de pasarla a un sistema determinista de enrutado, reduciendo la superficie de error del LLM.
- Despliegue en dispositivos de borde con recursos limitados: el adaptador LoRA de 35 MB se carga sobre Qwen2.5-0.5B-Instruct público, lo que permite actualizar la lógica de parseo sin redistribuir el modelo completo.
- Sistema de reserva o información de puntos de referencia: al mapear nombres de lugares (por ejemplo `villaggio_mall`) a estaciones cercanas mediante `resolve_ids`, sirve para consultas del tipo "estoy en Villaggio, ¿cómo llego a Souq Waqif?".
- Filtrado y validación de entradas en producción: la salida JSON puede validarse contra `stations.json` y `landmarks.json`; en caso de identificador inválido o baja confianza, el sistema MetroVoice recurre a coincidencia difusa de alias, luego a un LLM grande y finalmente a preguntar al usuario.
- Evaluación comparativa de técnicas de ajuste fino: el modelo sirve como referencia reproducible de cómo un LoRA de rango 32 sobre un modelo de 0,5 B resuelve una tarea de dominio cerrado con datos sintéticos.

## Benchmarks y rendimiento

Los datos de evaluación proceden de la model card del autor. Las métricas son coincidencia exacta de los identificadores en dos conjuntos: el split sintético reservado y un conjunto de prueba escrito a mano de 70 consultas realistas.

| Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|
| Split sintetico reservado (10 %) | Exact match de ids | 97,7 % |
| Conjunto escrito a mano (70 consultas) | Exact match de ids (ambos correctos) | 95,7 % |
| Adaptador LoRA re-fusionado | Equivalente al modelo fusionado | 95,7 % / 97,7 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con la naturaleza especializada del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1 GB para los pesos del modelo fusionado, más el overhead de activaciones y caché KV (muy reducido dado el contexto corto de ~192 tokens en entrenamiento y ~20 tokens de salida).
- El adaptador LoRA de 35 MB requiere cargar además el modelo base Qwen2.5-0.5B-Instruct (~1 GB en bf16), por lo que el consumo total es similar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona en RTX 4090, RTX 5090 (usada para entrenar la v2), A100 y H100 sin aprovechar su capacidad; también en Apple Silicon vía MPS (la v1 se entrenó en un M4).
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4060 y similares.
- Opciones de despliegue: transformers (con el `prompt.py` del repositorio), text-generation-inference (el tag `text-generation-inference` está presente), y en principio llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta una conversión oficial.
- Latencia y throughput: no se proporcionan cifras de inferencia; el tiempo de entrenamiento (0,06 s/paso en RTX 5090) sugiere una inferencia del orden de milisegundos por consulta en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MetroVoice intent 0.5B | 494 M | No disponible | Parseo de intenciones para metro de Doha | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 494 M | No disponible | Instrucciones generales, multilingüe | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5 B | No disponible | Instrucciones generales, multilingüe | Apache 2.0 | Hugging Face |
| Modelos de NLU de dominio (p. ej. clasificadores BERT pequeños) | 100-300 M | 512 tokens típicamente | Clasificación de intenciones y slots | Variable | Variable |

La comparación directa con modelos de propósito general no es del todo justa: MetroVoice está especializado en una tarea cerrada y supera en precisión de dominio a modelos mayores que no han visto los identificadores de estaciones y puntos de referencia de Doha. Frente a clasificadores BERT pequeños, ofrece salida generativa estructurada en JSON y cobertura multilingüe más amplia, a costa de un mayor consumo. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo interpreta peticiones; no calcula rutas ni conoce horarios, tarifas o incidencias del servicio.
- Está acotado al dominio del metro de Doha: los identificadores de estaciones y puntos de referencia son fijos y cualquier cambio en la red requiere reentrenamiento o actualización del dataset.
- Los datos de entrenamiento son sintéticos; aunque se evaluó con 70 consultas escritas a mano, la cobertura de variación real del habla (acentos, ruido ambiental, ASR defectuoso) puede ser limitada.
- Riesgo de alucinación de identificadores: puede generar slugs inexistentes, por lo que la validación con `resolve_ids` contra `stations.json` y `landmarks.json` es imprescindible en producción.
- El sistema MetroVoice documenta una cadena de fallback (coincidencia difusa, LLM grande, preguntar al usuario) que sugiere que el modelo por sí solo no es suficiente para todos los casos.
- La ventana de contexto no se documenta explícitamente; el entrenamiento usó longitud máxima 192, lo que limita entradas muy largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- No se documentan sesgos específicos más allá de los inherentes al modelo base y a la distribución de los datos sintéticos.
- El repositorio tiene 257 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m7jji/metrovoice-intent-0.5b
- Dataset asociado: https://huggingface.co/datasets/m7jji/doha-metro-multilingual
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Carpeta del adaptador LoRA: https://huggingface.co/m7jji/metrovoice-intent-0.5b/tree/main/lora
- Hackathon QAI × Hugging Face: no disponible como enlace directo en la información proporcionada
