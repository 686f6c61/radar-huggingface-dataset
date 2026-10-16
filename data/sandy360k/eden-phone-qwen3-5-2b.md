# sandy360k/eden-phone-qwen3.5-2b

## Resumen

Eden phone model (Qwen3.5-2B, distilled) es un ajuste fino del modelo base Qwen/Qwen3.5-2B publicado por el usuario sandy360k, orientado a Eden, un "second brain" de Mahi Labs controlado por voz. Su funcion concreta es trocear lo que el usuario dice en "Seeds" (unidades minimas de significado) y clasificar cada una segun varios ejes (tipo, area de vida, persona, lugar, proyecto al que completa) generando la respuesta bajo un esquema JSON fijo, todo ello en el propio dispositivo y sin depender de la nube. Sustituye a un modelo en la nube en la ruta de procesamiento local de la aplicacion.

El modelo parte de un transformer denso de unos 1.881.825.088 parametros (aproximadamente 1,88B) y se ha obtenido mediante un adaptador LoRA de rango 16 sobre todas las capas lineales, entrenado durante una sola epoca y fusionado despues en los pesos. El entrenamiento es exclusivamente sintetico: capturas de voz en ingles escritas por Claude para seis usuarios ficticios y etiquetadas por el modelo en la nube de Eden (Gemini Flash), sin datos reales de usuarios. La distribucion incluye pesos completos en safetensors y una cuantizacion GGUF Q4_K_M de 1,27 GB para llama.cpp y llama.rn.

Es relevante porque ejemplifica el patron de destilacion de un modelo multimodal generalista (Qwen3.5-2B) hacia una tarea estrecha de extraccion estructurada ejecutable en movil, con licencia Apache-2.0 y salida forzada por gramatica JSON. Es la variante mayor de una familia de dos (junto a sandy360k/eden-phone-qwen3.5-0.8b), pensada para telefonos con 8 GB de memoria o mas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-2B); ajuste fino LoRA fusionado |
| Parametros totales | 1.881.825.088 (aprox. 1,88B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para el modelo ajustado (modelo base Qwen3.5-2B: 262K tokens segun fuentes externas) |
| Tipos de cuantizacion | GGUF Q4_K_M (eden-phone-2b-r1-Q4_K_M.gguf, 1,27 GB); pesos completos en safetensors; adaptador LoRA en adapters/r1/ |
| Idiomas soportados | en (ingles unicamente) |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.5-2B) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La base es Qwen3.5-2B, un modelo denso de la serie Qwen3.5 de Alibaba Cloud; segun fuentes externas el modelo base es multimodal nativo (texto, vision e incluso video), con 262K tokens de contexto y modo de razonamiento ("thinking"). El ajuste fino, sin embargo, desactiva el modo thinking y trabaja solo con texto en ingles, forzando la generacion mediante un esquema JSON (gramatica) definido por el router de Eden. El ajuste se realizo con un LoRA de rango 16 aplicado a todas las capas lineales durante una epoca, entrenado desde cero sobre el base y posteriormente fusionado en los pesos finales.

Los datos de entrenamiento son exclusivamente sinteticos: capturas de voz en ingles redactadas por Claude para seis usuarios ficticios, incluyendo todos los ejemplos de "split" de las rondas duras 2-3 de Eden, el 12% de los ejemplos de "decide" y el 15% de la ronda 1, con un total declarado de 1,4M tokens. Las etiquetas las genero el modelo en la nube de Eden (Gemini Flash), de modo que el ajuste es una destilacion del comportamiento del profesor hacia el dispositivo. No se menciona uso de RLHF ni DPO. El GGUF corregido para versiones antiguas de llama.cpp declara 24 capas y omite las claves de next-token-prediction.

## Capacidades

- Troceado de capturas de voz en "Seeds" (unidades minimas de significado) y clasificacion de cada una por tipo, area de vida, persona, lugar y proyecto al que completa.
- Generacion de salida estrictamente estructurada como JSON, restringida por el esquema del router de Eden mediante gramatica.
- Realiza toda la inferencia en el dispositivo (on-device), sin conexion a la nube.
- Deteccion de repeticiones o duplicados en notas (encuentra repeticiones con exito, 7 de 8 en ingles, aunque introduce algunos falsos positivos).
- Procesamiento de voz capturada por el telefono en ingles (idioma unico).
- Hereda parcialmente las capacidades del base Qwen3.5-2B (razonamiento e instrucciones), pero el modelo esta especializado en la tarea de estructuracion.
- No incluye tool calling ni function calling documentados, ni capacidades multimodales activas en esta variante.
- Thinking mode desactivado.
- Soporte de agentes y razonamiento multi-paso: no documentado.

## Casos de uso

- Troceado y clasificacion offline de notas de voz en aplicaciones de "second brain": el modelo recibe la transcripcion de una captura y devuelve cada Seed etiquetada por tipo, area, persona y lugar en JSON, funcionando integramente en el telefono y sin enviar datos a la nube.
- Extraccion de entidades estructuradas (personas, lugares, proyectos) desde texto libre en ingles: util para alimentar una base de datos local que relacione cada nota con entidades conocidas.
- Router de intenciones local: al generar respuestas bajo el esquema JSON, puede decidir la accion o categorizacion de una consulta de entrada dentro de una app de asistente, sustituyendo llamadas a un modelo en la nube.
- Deteccion de notas repetidas o duplicadas: emplea su capacidad de identificar repeticiones para marcar entradas redundantes antes de consolidar la base de conocimiento del usuario.
- Destilacion y generacion de datos de entrenamiento: sirve como profesor o etiquetador intermedio para producir conjuntos de datos sinteticos etiquetados que alimenten versiones mas pequenas (por ejemplo, el modelo hermano de 0,8B).
- Prototipado de extraccion de informacion con privacidad por diseno: al ejecutarse en local, permite validar productos de procesamiento del lenguaje que no pueden enviar contenido de usuario a terceros.
- Integracion en aplicaciones moviles mediante llama.rn/llama.cpp sobre telefonos con 8 GB de memoria o mas, para tareas de estructuracion en tiempo de captura.

## Benchmarks y rendimiento

Los unicos resultados disponibles son la evaluacion propia de Eden (15 de octubre de 2026) sobre un conjunto de 112 capturas en ingles. Se comparan el profesor en la nube (Gemini Flash), el modelo hermano de 0,8B (ronda 3) y este modelo:

| Eden eval set, 112 capturas en ingles | Split | Type | People | Date | Area | Place | 4+ Seeds |
|---|---|---|---|---|---|---|---|
| Teacher (Gemini Flash, nube) | 93,8 | 94,9 | 93,6 | 95,5 | 87,8 | – | – |
| Eden Qwen3.5-0.8B, ronda 3 | 81,2 | 91,7 | 92,4 | 92,4 | 85,4 | 73,6 | 1/7 |
| Este modelo | 78,6 | 89,2 | 87,1 | 94,2 | 83,5 | 56,8 | 2/7 |

En usuarios no vistos (evaluados contra las respuestas del profesor): el usuario "Zoya" (108) obtiene split 78,7 / type 86,8 / area 65,1 / place 73,0, el mejor de los modelos de telefono de Eden (0,8B r3: 74,1 / 83,7 / 56,5 / 68,7); el usuario "Rahul" (148) obtiene split 73,6 / type 81,4 / area 64,5 (0,8B r3: 75,7 / 84,6 / 73,3). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,5-2 GB en la cuantizacion Q4_K_M (archivo de 1,27 GB mas overhead de contexto); en safetensors completos (FP) en torno a 3,8-4,5 GB segun precision.
- Soporte en telefono: requiere telefonos con 8 GB de memoria o mas; segun el autor, es demasiado lento para un iPhone 13 (aproximadamente 2,5 veces el trabajo por token del modelo de 0,8B).
- GPU recomendadas: cualquier GPU de consumo con mas de 4 GB de VRAM puede ejecutar la version Q4_K_M; no requiere GPU de datacenter (A100, H100) para el tamano objetivo.
- Cabe en GPU de consumo: si, en modelos como RTX 3060/4060 en adelante; tambien en GPUs integradas y SoC moviles de gama alta con memoria suficiente.
- Opciones de despliegue: llama.cpp y llama.rn (ruta principal declarada, con el GGUF), GGUF compatible con Ollama en general; safetensors para vLLM u otros runners de transformer con pesos completos (no confirmado por el autor).
- Latencia y throughput: no se proporcionan cifras concretas; el unico dato de rendimiento es la comparacion relativa de coste por token frente al modelo de 0,8B (2,5x).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eden-phone-qwen3.5-2b (este) | 1,88B | no disponible | Troceado y clasificacion JSON; split 78,6 en eval de Eden | apache-2.0 | safetensors + GGUF |
| eden-phone-qwen3.5-0.8b (hermano) | 0,8B (aprox.) | no disponible | Misma tarea; split 81,2, mas rapido, para telefonos antiguos | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2B denso | 262K (segun fuentes externas) | Multimodal generalista (texto, vision, video); OCRBench 84,5, VideoMME 75,6 | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos generados por modelos (Claude para texto, Gemini Flash para etiquetas); puede reproducir sesgos o artefactos de esos generadores y no refleja necesariamente la diversidad de usuarios reales.
- Idioma unico: solo ingles. No hay soporte multilingue documentado en esta variante, aunque el base sea multilingue.
- Modelo especializado y estrecho: su comportamiento esta atado al esquema JSON y a las prompts "phone v1" de Eden; fuera de ese contexto su utilidad general es incierta.
- Riesgo de alucinacion en la clasificacion: el propio autor senala que introduce algunos falsos positivos al detectar repeticiones (7 de 8 aciertos en ingles).
- Rendimiento inferior al profesor en la nube (Gemini Flash) en casi todas las metricas, con caidas notables en lugar (place 56,8 frente a 73,6 del modelo de 0,8B) y en area para algunos usuarios.
- Coste computacional alto para su tamano en movil: alrededor de 2,5 veces el trabajo por token del modelo de 0,8B, lo que limita su uso a dispositivos con 8 GB o mas (descartado para un iPhone 13).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-2B; conviene verificar los terminos del base antes de desplegar en produccion.
- No apto para produccion general fuera del caso de uso previsto: no hay benchmarks estandar (MMLU, HumanEval, GSM8K) que respalden un uso generico.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandy360k/eden-phone-qwen3.5-2b
- Modelo hermano de 0,8B: https://huggingface.co/sandy360k/eden-phone-qwen3.5-0.8b
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Qwen3.5-2B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-2b/
- Qwen3.5-2B (VRAM, especificaciones y benchmarks) en apxml: https://apxml.com/models/qwen35-2b
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Qwen3.5 2B en Modal: https://modal.com/library/qwen/qwen3-5-2b
