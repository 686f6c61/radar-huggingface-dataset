# aweussom/LFM2.5-1.2B-Instruct-int4-cw-ov

## Resumen

LFM2.5-1.2B-Instruct-int4-cw-ov es una exportación cuantizada a INT4 channel-wise simétrico del modelo LFM2.5-1.2B-Instruct de Liquid AI, realizada por Tommy Leonhardsen (aweussom) específicamente para ejecutarse en la NPU (Neural Processing Unit) de procesadores Intel de las generaciones Arrow Lake y Meteor Lake. El modelo base es un LLM híbrido de 1.200 millones de parámetros con arquitectura conv+attention, diseñado para tareas de chat, instrucción y tool calling en dispositivos edge, con una ventana de contexto de 32.000 tokens.

Esta exportación resuelve un problema concreto: la cuantización INT4 por grupos (group-wise) provoca un fallo en el compilador de la NPU de Intel (bug conocido de vpux), por lo que se opta por una cuantización channel-wise simétrica que evita el error. En una NPU de tercera generación (Core Ultra 9 285K) el modelo alcanza 38,8 tokens por segundo en decodificación y una latencia de primer token (TTFT) de 872 ms, con un tiempo de carga de aproximadamente 3,5 segundos.

Sin embargo, esta build es exclusiva para NPU: no funciona en CPU ni GPU (error de forma en ScatterNDUpdate), y en la NPU de cuarta generación (Lunar Lake, Core Ultra 200V) genera texto incoherente a pesar de compilar y cargar correctamente, un problema que el autor ha verificado en múltiples versiones de driver y de OpenVINO y que atribuye a la familia LFM2 en esa NPU concreta. La licencia es la LFM Open License v1.0 de Liquid AI, basada en Apache-2.0 pero con restricciones comerciales por ingresos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 híbrida (convolución + atención) |
| Parametros totales | 1,2 mil millones (1.2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | INT4 channel-wise simétrico (exportación OpenVINO) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (Apache-2.0 con cláusula comercial) |
| Formato de pesos | OpenVINO IR (exportación optimum-intel) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct de Liquid AI emplea una arquitectura híbrida que combina capas convolucionales con mecanismos de atención, una configuración pensada para eficiencia en dispositivos con recursos limitados. Según la documentación de Liquid AI, fue entrenado con 28 billones de tokens mediante preentrenamiento extendido y posterior ajuste con aprendizaje por refuerzo (RL), lo que le permite destacar en tareas de instrucción, razonamiento y tool calling a pesar de su tamaño reducido.

La exportación cuantizada que nos ocupa utiliza INT4 channel-wise simétrico con grupo de tamaño -1 (es decir, sin agrupación por bloques, cuantizando cada canal de forma independiente). Esta elección evita el bug del compilador de NPU que afecta a la cuantización por grupos (`StopLocationVerifierPass ... Found N duplicated names`). La herramienta empleada fue `optimum-cli export openvino` con OpenVINO 2026.1.0, optimum-intel 1.27.0 y transformers 4.57.6. Cabe destacar que esta exportación concreta es un artefacto de optimum-intel 1.27 que impide su ejecución en CPU/GPU, mientras que exportaciones más recientes (optimum-intel ≥2.1) funcionan en CPU/GPU pero fallan en NPU.

## Capacidades

- Generación de texto conversacional: el modelo base está ajustado para mantener diálogos multi-turno y seguir instrucciones con precisión.
- Tool calling / function calling: soporte nativo para invocar herramientas externas, lo que permite integrarlo en flujos agénticos.
- Razonamiento y tareas de agente: el entrenamiento con RL refuerza la capacidad de planificación y ejecución de pasos múltiples.
- Ejecución en edge: diseñado para funcionar en dispositivos con poca memoria (menos de 1 GB de RAM según Liquid AI), ideal para integración en hardware de consumo.
- Multilingüismo: no se dispone de información oficial sobre los idiomas soportados por esta variante cuantizada; el modelo base probablemente sea multilingüe, pero no hay datos confirmados.

## Casos de uso

- Asistente de chat en dispositivos locales: un fabricante de portátiles con NPU Intel puede integrar este modelo para ofrecer un asistente conversacional sin conexión, aprovechando los 38,8 tokens/s de decodificación en NPU 3 para una experiencia fluida.
- Automatización de atención al cliente en entornos con privacidad estricta: al ejecutarse localmente en la NPU, los datos de los usuarios nunca salen del dispositivo, lo que lo hace adecuado para sectores como banca o salud.
- Generación de código asistida en IDE: gracias al tool calling, puede conectarse a APIs de ejecución de código o a sistemas de control de versiones para sugerir correcciones y completar funciones en tiempo real.
- Orquestación de agentes en dispositivos edge: un sistema de domótica podría usar el modelo para interpretar comandos de voz, razonar sobre el estado de los dispositivos y ejecutar acciones mediante funciones.
- Traducción y resumen de documentos en equipos sin GPU: al caber en menos de 1 GB de RAM y ejecutarse en NPU, es viable en ultraportátiles y mini-PCs de gama media.
- Prototipado rápido de aplicaciones de IA generativa: desarrolladores que trabajan con OpenVINO pueden usar este modelo como punto de partida para validar flujos de inferencia en NPU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) para esta exportación cuantizada en la información disponible. La model card solo reporta métricas de rendimiento de inferencia medidas en hardware específico:

| Métrica | Valor (Core Ultra 9 285K, NPU 3) |
|---|---|
| TTFT (tiempo hasta el primer token) | 872 ms |
| Decodificación | 38,8 tokens/s |
| Carga (caché caliente) | ~3,5 s |

En NPU 4 (Lunar Lake, Core Ultra 7 258V) la decodificación alcanza 46–48 tokens/s pero la salida es incoherente (word salad), por lo que no se considera un resultado válido.

## Requisitos de hardware

- NPU Intel de tercera generación (Arrow Lake / Meteor Lake, arquitectura 3000) obligatoria: el modelo no funciona en CPU ni GPU.
- NPU de cuarta generación (Lunar Lake, arquitectura 4000) no soportada: compila y ejecuta pero produce texto incoherente, independientemente de la versión del driver o de OpenVINO.
- Memoria del sistema: el repositorio ocupa 0,7 GB; el modelo cargado cabe holgadamente en sistemas con 8 GB de RAM o más.
- VRAM: no aplica, al ejecutarse en NPU.
- Opciones de despliegue: exclusivamente mediante OpenVINO GenAI (`openvino_genai.LLMPipeline`) o el runner NoLlama de aweussom. No hay soporte para vLLM, llama.cpp, Ollama ni TGI en esta build concreta.
- Latencia: TTFT de 872 ms y 38,8 tokens/s en NPU 3, suficiente para aplicaciones interactivas de baja exigencia.

## Comparativa con modelos similares

No se dispone de datos públicos de benchmarks que permitan una comparación cuantitativa de esta exportación con otros modelos de tamaño similar. Como referencia cualitativa, el autor menciona que SmolLM3-3B-int8-cw funciona correctamente en la misma NPU 4 que falla con LFM2.5, lo que indica que el problema es específico de la familia LFM2 en esa generación de NPU. Para comparar el modelo base sin cuantizar con alternativas, se puede recurrir a las fichas de Liquid AI y a benchmarks independientes, pero no se han encontrado en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: esta build solo funciona en NPU de tercera generación (Arrow Lake / Meteor Lake). En NPU 4 (Lunar Lake) produce salidas incoherentes, y en CPU/GPU falla con un error de `ScatterNDUpdate`.
- Riesgo de salidas incoherentes: en NPU 4 el modelo genera texto sin sentido ("Say hello." → "cohclclcl…") a pesar de compilar y cargar correctamente; el autor ha verificado que el problema persiste en dos generaciones de driver, tres versiones de OpenVINO y ambos compiladores.
- Configuración int8 no viable: la cuantización int8 simétrica genera basura en NPU, mientras que la asimétrica es coherente pero extremadamente lenta (~1,4 tokens/s). La única configuración rápida y correcta es la int4-cw aquí presentada.
- Licencia comercial condicionada: la LFM Open License v1.0 permite uso comercial gratuito solo para empresas con ingresos anuales inferiores a 10 millones de dólares; por encima de ese umbral se requiere una licencia comercial de Liquid AI.
- Sin soporte para herramientas de despliegue estándar: al ser un formato OpenVINO específico para NPU, no se puede utilizar con librerías populares como llama.cpp, vLLM u Ollama.
- Información incompleta: no se han publicado datos sobre idiomas soportados, benchmarks de calidad del modelo ni comparativas con alternativas en la documentación disponible.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/aweussom/LFM2.5-1.2B-Instruct-int4-cw-ov
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación oficial de LFM2.5-1.2B-Instruct en Liquid Docs: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/LiquidAI/LFM2.5-1.2B-Instruct
- Issue de seguimiento en OpenVINO (bug NPU 4): https://github.com/openvinotoolkit/openvino/issues/37322
- Repositorio NoLlama: https://github.com/aweussom/NoLlama
- Perfil del autor en HuggingFace: https://huggingface.co/aweussom
