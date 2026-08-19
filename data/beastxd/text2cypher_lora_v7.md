# BeastxD/text2cypher_lora_v7

## Resumen

BeastxD/text2cypher_lora_v7 es un adaptador LoRA (Low-Rank Adaptation) desarrollado por BeastxD, diseñado para convertir lenguaje natural en consultas Cypher, el lenguaje de consulta de la base de datos de grafos Neo4j. El modelo se construye sobre la base cuantizada en 4 bits de Qwen3-4B-Instruct (versión 2507) mediante la librería Unsloth y el entrenamiento con Hugging Face TRL, lo que permite un ajuste eficiente y rápido para la tarea específica de generación de consultas a grafos.

Este modelo resuelve el problema de la traducción automática de preguntas en inglés a consultas Cypher válidas, una tarea crítica para aplicaciones de análisis de grafos y agentes conversacionales que interactúan con Neo4j. Su relevancia radica en la creciente demanda de interfaces en lenguaje natural sobre bases de datos de grafos, donde los modelos grandes generalistas suelen fallar en la sintaxis y semántica de Cypher. Al ser un adaptador ligero (el LoRA añade unos pocos millones de parámetros sobre los 4.022 millones del modelo base), puede desplegarse en entornos con recursos limitados y adaptarse fácilmente a pipelines existentes.

El repositorio incluye los pesos en formato safetensors (8,1 GB) y está etiquetado como compatible con text-generation-inference, aunque no se proporcionan detalles sobre el dataset de entrenamiento ni métricas de evaluación. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Instruct) con adaptador LoRA |
| Parametros totales | 4.022.468.096 (incluye el modelo base; el adaptador LoRA añade una fracción mínima) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B soporta hasta 32 768 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | El modelo base se entrega en 4 bits (bnb-4bit); el adaptador LoRA se publica en safetensors (presumiblemente BF16/FP16) |
| Idiomas soportados | Ingles (etiqueta "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-4B-Instruct, un transformer causal con atención estándar y 4 000 millones de parámetros. Sobre esta base, BeastxD aplicó un adaptador LoRA de bajo rango, entrenado con la librería Unsloth (que optimiza el uso de memoria y velocidad) y el framework TRL de Hugging Face. El entrenamiento se realizó sobre una versión cuantizada en 4 bits del modelo base (`unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit`), lo que reduce significativamente los requisitos de VRAM durante el ajuste.

No se especifica el dataset utilizado, pero por el nombre del modelo y la existencia del repositorio `neo4j-labs/text2cypher` (que recopila conjuntos de datos para esta tarea), se infiere que se emplearon pares de preguntas en lenguaje natural y consultas Cypher correspondientes. Tampoco se detalla el número de tokens de entrenamiento, el número de épocas ni si se aplicaron técnicas de alineación como RLHF o DPO. El proceso de entrenamiento se describe únicamente como un fine-tuning supervisado estándar con LoRA.

## Capacidades

- Generacion de consultas Cypher a partir de preguntas en lenguaje natural (text2cypher), tarea principal del adaptador.
- Generacion de texto general, heredada del modelo base Qwen3-4B-Instruct, aunque el adaptador está especializado en la sintaxis de Cypher.
- Razonamiento conversacional básico: el modelo base es instruct-tuned, por lo que puede mantener diálogos simples, aunque su especialización limita su uso fuera del dominio de grafos.
- Soporte de tool calling: no confirmado para este adaptador, aunque Qwen3-4B-Instruct incluye capacidades nativas de function calling; no hay evidencia de que se hayan preservado tras el fine-tuning.
- Capacidades multilingues: no disponible; el modelo se entrena únicamente en inglés (etiqueta "en").
- No se reportan capacidades de vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Interfaz de consulta natural para Neo4j: un usuario escribe "¿Cuales son los clientes que compraron mas de 10 productos el ultimo trimestre?" y el modelo genera la consulta Cypher equivalente, que luego se ejecuta contra la base de datos. Adecuado por su especialización en la sintaxis de Cypher y su bajo coste de inferencia.
- Asistentes de analisis de grafos para equipos de datos: integrado en notebooks o herramientas internas, permite a analistas sin conocimientos profundos de Cypher explorar grafos de conocimiento, redes sociales o grafos de fraude.
- Automatizacion de generacion de informes: en pipelines de BI, el modelo traduce preguntas predefinidas a consultas Cypher para extraer metricas de forma repetitiva, reduciendo el tiempo de desarrollo.
- Chatbots de soporte con acceso a grafos de conocimiento: un bot de atencion al cliente puede usar el adaptador para resolver consultas sobre inventario, relaciones entre entidades o historial de interacciones, siempre que el backend use Neo4j.
- Educacion y formacion en Cypher: el modelo puede servir como herramienta de practica para estudiantes que aprenden Cypher, generando consultas a partir de enunciados en lenguaje natural y permitiendo comparar con la solucion correcta.
- Prototipado rapido de aplicaciones text2cypher: al ser un adaptador ligero sobre una base cuantizada, se puede desplegar en una GPU de gama media o incluso en CPU con cuantizacion adicional, facilitando la validacion de conceptos antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas especificas de text2cypher (como exactitud de consultas o validez sintactica) para este adaptador. El autor tampoco proporciona comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo base es Qwen3-4B en cuantizacion de 4 bits, la inferencia del adaptador requiere aproximadamente 4-6 GB de VRAM en FP16/BF16, y menos si se aplica cuantizacion adicional al adaptador. No hay datos oficiales.
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB) o superior es suficiente para inferencia local; una T4 (16 GB) o A10G son adecuadas para despliegue en la nube. Para entrenamiento, el autor uso Unsloth con cuantizacion 4 bits, lo que permite ajustar en GPUs con 8-12 GB.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4070 o similares con al menos 8 GB de VRAM.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con la libreria `peft` sobre el modelo base cuantizado. Es compatible con `transformers`, `text-generation-inference` (segun las etiquetas) y puede integrarse en vLLM o llama.cpp si se fusionan los pesos. No se menciona soporte explicito para Ollama.
- Latencia y throughput: no disponibles. Al ser un modelo de 4B, se espera una latencia de decenas de milisegundos por token en una GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores text2cypher de la misma categoria. Existen alternativas en el ecosistema de Neo4j, como los modelos publicados en `neo4j-labs/text2cypher`, pero no se han encontrado datos de rendimiento comparables. El propio autor ha publicado versiones anteriores (v3, v4_raw, v4_balanced) con caracteristicas similares, pero no se ofrecen metricas comparativas. Por tanto, la comparativa se limita a indicar que el modelo compite con otros adaptadores LoRA para text2cypher, sin datos cuantitativos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeno (4B) y un adaptador especializado, puede generar consultas Cypher sintacticamente validas pero semanticamente incorrectas, especialmente con preguntas ambiguas o fuera del dominio de entrenamiento. No se han realizado evaluaciones de sesgo.
- Limitaciones de idioma: el modelo solo soporta ingles. No se recomienda su uso con preguntas en otros idiomas sin un fine-tuning adicional.
- Limitaciones de contexto: aunque el modelo base Qwen3-4B soporta hasta 32 768 tokens, no se ha verificado que el adaptador conserve esta capacidad. Se recomienda mantener las preguntas cortas y los esquemas de grafo resumidos.
- Riesgo de sobreajuste: el adaptador puede estar sobreajustado al dataset especifico de entrenamiento, lo que limita su generalizacion a esquemas de Neo4j muy diferentes o a variaciones en la formulacion de preguntas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero no se proporcionan garantias de exactitud ni soporte. El usuario debe validar las consultas generadas antes de ejecutarlas en produccion.
- Dependencia del modelo base: el adaptador requiere cargar el modelo base `unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit`, que a su vez depende de la cuantizacion de bitsandbytes. Esto puede generar problemas de compatibilidad con versiones futuras de las librerias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeastxD/text2cypher_lora_v7
- Repositorio de datasets y evaluacion text2cypher de Neo4j: https://github.com/neo4j-labs/text2cypher
- Guia de Text2Cypher en el blog de Neo4j: https://neo4j.com/blog/genai/text2cypher-guide/
- Documentacion del repositorio text2cypher en DeepWiki: https://deepwiki.com/neo4j-labs/text2cypher
- Version anterior del autor (v4_raw): https://huggingface.co/BeastxD/text2cypher_lora_v4_raw
- Version anterior del autor (v3): https://huggingface.co/BeastxD/text2cypher_lora_v3
