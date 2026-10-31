# sine-dogma/Qwen3.5-0.8B-QNN-SM8650-XLAM

## Resumen

Qwen3.5-0.8B-QNN-SM8650-XLAM es un repositorio publicado en Hugging Face por el usuario sine-dogma, con una licencia CC0 1.0 (dominio publico). El nombre del repositorio sugiere que se trata de una version del modelo Qwen3.5 de 0,8 mil millones de parametros convertida al formato QNN (Qualcomm Neural Network) para su ejecucion nativa en el chipset SM8650 (Snapdragon 8 Gen 3), posiblemente con ajuste o preparacion relacionada con el dataset XLAM, orientado a function calling. Sin embargo, la model card del autor no contiene descripcion alguna, por lo que estos detalles no pueden confirmarse.

El peso del repositorio es de 5,4 GB, lo que es consistente con un modelo cuantizado en formato binario para QNN, aunque no se especifica el esquema de cuantizacion empleado. No se han publicado benchmarks, detalles de arquitectura ni instrucciones de uso en la ficha del modelo.

Este tipo de conversiones resulta relevante para desarrolladores que buscan ejecutar modelos de lenguaje compactos completamente en el dispositivo (on-device) en moviles con Snapdragon, aprovechando el NPU en lugar de la CPU o GPU, con menor consumo energetico y latencia. La licencia CC0 1.0 facilita su uso sin restricciones, incluido el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere arquitectura Qwen3.5 tipo transformer) |
| Parametros totales | 0,8B (segun el nombre del repositorio, no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato QNN, esquema sin especificar) |
| Idiomas soportados | no disponible |
| Licencia | CC0 1.0 |
| Formato de pesos | QNN (binarios para Qualcomm Neural Network), tamano del repo 5,4 GB |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura ni el proceso de entrenamiento. A partir del nombre del repositorio puede inferirse, con reservas, que se basa en Qwen3.5 con 0,8 mil millones de parametros, una familia de modelos transformer compactos de Alibaba, y que el sufijo "XLAM" alude al dataset XLAM Function Calling de Salesforce, usado habitualmente para entrenar o evaluar capacidades de llamada a funciones. El sufijo "QNN-SM8650" indica una conversion al formato QNN de Qualcomm dirigida al SoC SM8650 (Snapdragon 8 Gen 3), que incorpora una NPU Hexagon.

No hay datos publicados sobre el numero de tokens de entrenamiento, composicion del corpus, uso de RLHF/DPO ni tecnicas innovadoras. La conversion a QNN habitualmente implica cuantizacion (por ejemplo, a 8 o 4 bits) para ejecutar el modelo sobre el NPU, pero el esquema exacto no esta documentado en la ficha.

## Capacidades

Al no existir documentacion, las capacidades solo pueden indicarse de forma especulativa y no confirmada:

- Generacion de texto: probable, heredada del modelo base Qwen3.5 (no confirmado).
- Function calling / tool calling: el sufijo XLAM sugiere soporte o especializacion en llamada a funciones, pero no esta documentado.
- Razonamiento, codigo, matematicas: no disponible.
- Capacidades multilingues: no disponible.
- Ejecucion on-device en Snapdragon 8 Gen 3: inferida del formato QNN y del objetivo SM8650.

## Casos de uso

Los casos de uso siguientes son plausibles dadas las caracteristicas inferidas del repositorio, aunque sin validacion documentada:

- Asistentes on-device en moviles: la conversion a QNN permite ejecutar el modelo en la NPU del Snapdragon 8 Gen 3, ideal para asistentes que funcionan sin conexion y sin enviar datos a la nube.
- Function calling en aplicaciones moviles: si el sufijo XLAM refleja entrenamiento con ese dataset, el modelo podria integrarse en apps que necesiten invocar herramientas locales (calendario, contactos, APIs del sistema) a partir de lenguaje natural.
- Prototipado de IA en el borde: su tamano reducido (0,8B) y licencia CC0 lo hacen util para experimentar con inferencia local en dispositivos Qualcomm sin coste de licencias.
- Autocompletado y resumen en apps moviles: tareas ligeras de generacion de texto que no requieren modelos grandes y se benefician de baja latencia en NPU.
- Privacidad por diseno: procesamiento de consultas de usuario completamente local, util en sectores con requisitos de confidencialidad (salud, banca) en dispositivos compatibles.
- Base para fine-tuning posterior: al ser un modelo muy compacto y de licencia libre, puede servir como punto de partida para ajustes especificos en dominios concretos, previa re-conversion a QNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Qualcomm SM8650 (Snapdragon 8 Gen 3) con NPU Hexagon, segun indica el nombre del repositorio. Los binarios QNN no son ejecutables en GPUs estandar (NVIDIA, AMD) ni en CPU x86 sin conversion adicional.
- VRAM: no aplicable directamente; en dispositivos moviles la ejecucion usa memoria del SoC. El peso del repo (5,4 GB) sugiere que se necesita al menos esa cantidad de memoria disponible para cargar los pesos.
- GPUs de consumo: no compatibles con los binarios QNN tal cual estan distribuidos.
- Despliegue: requiere el SDK de Qualcomm AI Engine (QNN) o herramientas como Qualcomm AI Hub. No es compatible de forma directa con vLLM, llama.cpp, Ollama o TGI, dado el formato de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto |
|---|---|---|---|---|
| sine-dogma/Qwen3.5-0.8B-QNN-SM8650-XLAM | 0,8B (sin confirmar) | QNN (Qualcomm) | CC0 1.0 | no disponible |
| Qwen2.5-0.5B-Instruct (oficial) | 0,49B | safetensors, GGUF | Apache 2.0 | 32K (128K con YaRN) |
| Qwen3-0.6B (oficial) | 0,6B | safetensors, GGUF | Apache 2.0 | 32K |
| SmolLM2-360M-Instruct | 0,36B | safetensors, GGUF | Apache 2.0 | 8K |

La diferencia principal es que esta ficha corresponde a una conversion especifica para hardware Qualcomm, mientras que los modelos oficiales de tamano similar se distribuyen en formatos estandar (safetensors, GGUF) ejecutables en infraestructura convencional. No hay datos de rendimiento comparables disponibles.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card esta vacia, por lo que no hay garantias sobre la procedencia exacta de los pesos, la calidad de la conversion ni el esquema de cuantizacion empleado.
- Compatibilidad restringida: los binarios QNN solo funcionan en hardware Qualcomm compatible (SM8650); no sirven para GPUs NVIDIA/AMD ni para runtimes estandar como llama.cpp u Ollama.
- Riesgo de alucinacion: como todo modelo de lenguaje compacto (0,8B), la fiabilidad factual esperable es limitada, especialmente en razonamiento complejo.
- Sesgos: no documentados; los modelos base de la familia Qwen presentan sesgos propios de sus datos de entrenamiento, mayoritariamente en chino e ingles.
- Idiomas: no especificados; si el modelo base es Qwen, el rendimiento sera optimo en chino e ingles y probablemente limitado en castellano.
- Licencia: CC0 1.0 permite uso comercial sin restricciones, pero conviene verificar la licencia del modelo base original (la familia Qwen suele usar Apache 2.0, compatible).
- Proyecto de autor individual: sin descargas ni likes registrados y sin respaldo organizativo, se recomienda validar los pesos antes de cualquier uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sine-dogma/Qwen3.5-0.8B-QNN-SM8650-XLAM

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios de codigo o demos) en la informacion disponible.
