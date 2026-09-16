# ewin-reg/MiniCPM5-2B-EXL3

## Resumen

MiniCPM5-2B-EXL3 es una cuantizacion de 4 bits en formato EXL3 del modelo MiniCPM5-2B, publicada por el usuario ewin-reg. MiniCPM5-2B es el segundo modelo de la serie MiniCPM5 de OpenBMB, despues de MiniCPM5-1B, y se describe en su model card como un transformer denso orientado a despliegue local, en dispositivo y en entornos con recursos limitados. Esta ficha cubre especificamente el artefacto cuantizado alojado en HuggingFace, no el modelo original en precision completa.

El interes practico del repositorio es que ofrece los pesos en un formato de 4 bits pensado para el ecosistema ExLlamaV3, lo que reduce el espacio en disco y la VRAM necesaria para servir el modelo en hardware de gama consumer. La model card heredada del modelo base reivindica rendimiento SOTA en la categoria de 2B parametros, competitivo con modelos de 4B en tareas de codigo, matematicas, contexto largo, uso de herramientas y agentes.

Conviene senalar una discrepancia objetiva: el recuento real de parametros de los safetensors del repositorio es de 864.985.600 (aproximadamente 865M), muy por debajo de los "2B" que sugiere el nombre. No se dispone de informacion que explique esa diferencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye resultados numericos de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (etiqueta `llama` en HuggingFace); arquitectura heredada de MiniCPM5-2B |
| Parametros totales | 864.985.600 (~865M) segun el recuento real de safetensors; el nombre del repositorio y la model card indican "2B" (discrepancia no aclarada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 de 4 bits (el repositorio contiene unicamente esta version cuantizada) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos cuantizados en formato EXL3, 4 bits) |

Otros datos del repositorio: tamano del repositorio 1,7 GB, `pipeline_tag` de generacion de texto, `library_name` transformers, creado el 15 de septiembre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La informacion disponible describe MiniCPM5-2B como un transformer denso de la serie MiniCPM5 que "escala la misma receta de entrenamiento" que MiniCPM5-1B. El modelo base declara haberse entrenado sobre el corpus UltraData de OpenBMB: `Ultra-FineWeb`, `UltraX-Preview` y `Ultra-FineWeb-L3` para preentrenamiento; `UltraData-Math` y `UltraData-Code` para dominios especificos; `UltraData-SFT-2605` y `UltraData-SFT-Agent-2609` para ajuste supervisado y comportamiento agentico; y `UltraData-RL-2609` para una etapa de aprendizaje por refuerzo. No se especifica el numero de tokens de entrenamiento, la composicion porcentual del dataset ni los detalles del algoritmo de RL.

Este repositorio concreto no aporta entrenamiento adicional: es una conversion de pesos a 4 bits mediante el esquema EXL3, que combina cuantizacion de pesos con correccion tipo Hessiano y se carga a traves del motor ExLlamaV3. La model card no documenta el proceso de cuantizacion, el calibrado, el error de perplejidad introducido ni la receta exacta empleada, por lo que no es posible evaluar la degradacion respecto al modelo original a partir de la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento sobre codigo, segun los ejes declarados en la model card del modelo base (`Code Reasoning`).
- Razonamiento matematico (`Math Reasoning`), con datos de entrenamiento especificos de matematicas (`UltraData-Math`).
- Comprension de contexto largo: la model card y las etiquetas del repositorio (`long-context`) lo declaran, aunque no se indica la longitud de ventana soportada.
- Uso de herramientas y function calling: etiqueta `tool-calling` y dataset `UltraData-SFT-Agent-2609`.
- Tareas agenticas y de razonamiento multi-paso, con una etapa de RL dedicada (`UltraData-RL-2609`).
- Seguimiento de instrucciones (`Instruction Following`) y conocimiento general, segun los ejes del grafico de capacidades de la model card.
- Orientacion a despliegue en dispositivo y edge (`on-device`, `edge-ai`).
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente conversacional local: el modelo se puede ejecutar en un portatil o mini-PC sin GPU dedicada gracias al formato de 4 bits, ofreciendo un chatbot privado en ingles o chino sin enviar datos a servicios externos.
- Clasificacion y enrutado de tickets de soporte: con prompts de instrucciones, el modelo puede etiquetar y priorizar incidencias en un pipeline de atencion al cliente, dado su tamano reducido y su capacidad de seguir instrucciones.
- Generacion y revision de codigo en editor local: integrado en un plugin de IDE mediante el tag `llama`, puede completar fragmentos, explicar funciones y detectar errores simples sin latencia de red.
- Agente con tool calling en entornos controlados: la etiqueta `tool-calling` y los datos de SFT agentico lo hacen adecuado para prototipos de agentes que invocan funciones o APIs en varios pasos, siempre con supervision y validacion posterior.
- Analisis de documentos extensos: si se confirma la ventana de contexto largo declarada, serviria para resumir o extraer informacion de contratos, informes o transcripciones en una sola pasada.
- Preprocesado barato en pipelines grandes: por su tamano, puede usarse como primer filtro (extraccion de entidades, normalizacion de texto, resumen corto) antes de llamar a un modelo mayor, reduciendo coste por peticion.
- Aplicaciones en chino: es una de las pocas opciones abiertas de este tamano con soporte nativo declarado de chino, util para traduccion asistida, resumen o atencion al cliente en ese idioma.
- Investigacion sobre cuantizacion: sirve como caso de estudio para medir el impacto de EXL3 de 4 bits frente al modelo original en tareas de codigo y matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del modelo base incluye un grafico de radar normalizado al 100% por eje con las dimensiones `Code Reasoning`, `Math Reasoning`, `Instruction Following`, `General Knowledge`, `Long Context` y `Tool Use`, pero no proporciona valores numericos, nombres de benchmark ni puntuaciones absolutas, por lo que no se pueden extraer cifras verificables. La afirmacion de "SOTA en la categoria de 2B" y de ser "competitivo con modelos de 4B" procede del propio autor del modelo base y no viene acompanada de tablas de resultados en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,5 GB para 865M parametros a 4 bits; el repositorio ocupa 1,7 GB, por lo que el total en disco y en memoria puede ser mayor segun el numero y el formato de los ficheros incluidos.
- VRAM total con cache KV: estimacion orientativa de 1 a 4 GB, dependiendo de la longitud de contexto configurada; no hay datos oficiales de consumo.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas, como RTX 3060, RTX 4060, RTX 4070 o superiores. Tambien cabe en GPUs de gama baja y en iGPU con memoria compartida suficiente.
- Cabe en GPU consumer: si, es uno de los escenarios declarados por el autor (`on-device`, `edge-ai`).
- Opciones de despliegue: el formato EXL3 corresponde al ecosistema ExLlamaV3, por lo que la carga tipica se hace con el motor ExLlamaV3 o con TabbyAPI como servidor compatible con la API de OpenAI. El repositorio incluye las etiquetas `transformers`, `text-generation-inference` y `endpoints_compatible`, pero no se documenta en la model card una ruta de carga distinta de EXL3; conviene verificar la compatibilidad real antes de asumir que funciona en vLLM o TGI. No se incluyen pesos en GGUF, por lo que llama.cpp y Ollama requeririan una conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-EXL3 (este repositorio) | 864.985.600 (~865M) segun safetensors | No disponible | Apache 2.0 | safetensors EXL3 4 bits | Cuantizacion de terceros, 0 descargas, sin benchmarks publicados |
| MiniCPM5-2B (openbmb) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible | Modelo original del que deriva esta cuantizacion; sin cuantizar |
| MiniCPM5-1B (openbmb) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible | Primer modelo de la serie, misma receta de entrenamiento |

No se dispone de datos comparativos verificables de otros modelos de la misma categoria (por ejemplo alternativas de ~1B a 4B) en la informacion proporcionada. Cualquier comparacion de rendimiento con terceros requeriria ejecutar los benchmarks de forma independiente.

## Limitaciones y advertencias

- Discrepancia de parametros: el recuento real de safetensors (864.985.600) no coincide con el "2B" del nombre del repositorio. Verificar el modelo antes de integrarlo en produccion.
- Es una cuantizacion de terceros: el autor del repositorio no es OpenBMB, y no se documenta el proceso de cuantizacion ni la perdida de calidad asociada. La model card esta heredada del modelo original y no describe el artefacto cuantizado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni tasas de error para esta version.
- Sesgos: no hay informacion sobre evaluacion de sesgos, toxicidad o seguridad. El corpus de entrenamiento (Ultra-FineWeb y derivados) puede introducir sesgos propios de datos web.
- Limitaciones de idioma: solo se declaran ingles y chino. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Contexto: aunque se anuncia capacidad de contexto largo, no se especifica la ventana soportada ni se aportan pruebas de recuperacion a larga distancia.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar de forma independiente las condiciones que OpenBMB aplique al modelo base y a los datasets citados, ya que la model card no detalla terminos adicionales.
- Madurez del artefacto: 0 descargas y 0 likes, publicacion inicial sin validacion por parte de la comunidad.
- Compatibilidad de despliegue: al ser EXL3, el soporte fuera de ExLlamaV3/TabbyAPI no esta garantizado pese a las etiquetas de `transformers` y `text-generation-inference`.
- Tamano limitado: con menos de 1.000 millones de parametros, el modelo no es adecuado para tareas que requieran conocimiento enciclopedico amplio, razonamiento complejo de multiples saltos o generacion de codigo en repositorios grandes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ewin-reg/MiniCPM5-2B-EXL3
- Perfil del autor de la cuantizacion: https://huggingface.co/ewin-reg
- Modelo base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- MiniCPM5-1B (modelo anterior de la serie): https://huggingface.co/openbmb/MiniCPM5-1B
- Demo online de MiniCPM5-2B: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Informe tecnico de MiniCPM (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- Referencia arXiv 2602.09003 citada en las etiquetas del repositorio: https://arxiv.org/abs/2602.09003
- Wiki de MiniCPM (en chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Portal de datos UltraData: https://ultradata.openbmb.cn/
- Ficha de MiniCPM5-2B en Artificial Analysis: https://artificialanalysis.ai/models/minicpm5-2b
- Repositorio de ExLlamaV3, motor del formato EXL3: https://github.com/turboderp-org/exllamav3
