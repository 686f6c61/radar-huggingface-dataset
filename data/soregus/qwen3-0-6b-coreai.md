# SoreGus/Qwen3-0.6B-CoreAI

## Resumen

SoreGus/Qwen3-0.6B-CoreAI es un artefacto de conversion, no un modelo entrenado desde cero. Se trata de una version del modelo denso Qwen/Qwen3-0.6B (0,6 mil millones de parametros, licencia Apache 2.0) exportada al formato Core AI de Apple mediante el conjunto de herramientas oficial `coreai-models` y AppleAgentKitPython. El objetivo es ejecutar el modelo de forma nativa en el stack de Apple Silicon (dispositivos iOS), aprovechando el runtime Core AI y el framework FoundationModels en lugar de un runtime de terceros.

El repositorio pesa aproximadamente 0,5 GB y contiene un directorio `iOS/` con el bundle de recursos generado por `coreai.llm.export`, acompanado de un fichero `appleagentkit-build.json` con metadatos de reproducibilidad de la conversion. No se documentan en la model card ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni procesos de alineacion (RLHF/DPO): toda esa informacion pertenece al modelo base, no a este artefacto.

Su relevancia es practica mas que cientifica: permite a desarrolladores de aplicaciones iOS probar un LLM de 0,6B en local, sin conexion y con los datos permaneciendo en el dispositivo, usando la API `CoreAILanguageModel` y `LanguageModelSession`. Es, por tanto, una pieza de infraestructura para inferencia on-device en el ecosistema Apple, con 0 descargas y 0 likes en el momento de la consulta, lo que indica un artefacto reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen/Qwen3-0.6B); este repositorio solo contiene el artefacto convertido a Core AI |
| Parametros totales | 0,6 mil millones (dato del modelo base, no verificado en el repositorio) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; el modelo base declara 32.768 tokens nativos, ampliables con YaRN (dato no confirmado para este artefacto) |
| Tipos de cuantizacion | no disponible (la model card no documenta precision ni niveles de cuantizacion; solo se indica un bundle Core AI de ~0,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | bundle de recursos Core AI para iOS generado con `coreai.llm.export`, mas `appleagentkit-build.json`; no se distribuyen safetensors ni GGUF en este repositorio |
| Tamano del repositorio | ~0,5 GB |
| Runtime objetivo | Core AI de Apple (frameworks `CoreAILanguageModels` y `FoundationModels`) |
| Modelo base | Qwen/Qwen3-0.6B |
| Autor / fecha | SoreGus; creado el 2026-09-25, actualizado el 2026-09-25 |

## Arquitectura y entrenamiento

Este repositorio no aporta informacion sobre arquitectura interna ni sobre entrenamiento. Lo unico documentado es el proceso de conversion: el autor indica que el artefacto se preparo con el tooling oficial `coreai-models` de Apple y AppleAgentKitPython, partiendo de `Qwen/Qwen3-0.6B`. El resultado es un bundle de recursos por plataforma (en este caso solo `iOS/`) producido por `coreai.llm.export`, junto a metadatos de build en `appleagentkit-build.json`. Al tratarse de una conversion de pesos, la arquitectura efectiva es la del modelo base (transformer decoder-only denso con atencion por causalidad, enrutamiento no disperso), pero el repositorio no reproduce la ficha tecnica del modelo original.

Tampoco hay datos sobre volumen de tokens, composicion del corpus, fases de preentrenamiento, ajuste supervisado o tecnicas de alineacion. Cualquier afirmacion sobre decodificacion especulativa, atencion lineal o modos de razonamiento pertenece al modelo base y no esta confirmada para este artefacto convertido. En consecuencia, la evaluacion tecnica de este repositorio debe centrarse en la fidelidad de la conversion y en la integracion con el runtime de Apple, no en las capacidades del modelo subyacente.

## Capacidades

- Generacion de texto en el dispositivo con la API `CoreAILanguageModel` y sesiones `LanguageModelSession`.
- Integracion nativa con el framework FoundationModels de Apple, lo que permite usar la interfaz estandar de modelos de lenguaje del sistema.
- Ejecucion local en Apple Silicon, sin dependencia de un servidor de inferencia externo ni de una conexion de red.
- Capacidades concretas del modelo base (razonamiento, codigo, matematicas, multilingue, tool calling, modo thinking) no verificadas ni documentadas en este repositorio: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible en la model card de este artefacto.
- Capacidades multimodales (vision, audio): no disponible; el modelo base es exclusivamente de texto.

## Casos de uso

- Asistente de texto offline en aplicaciones iOS: el modelo puede generar respuestas conversacionales directamente en el dispositivo mediante `LanguageModelSession`, util para apps que deben funcionar sin cobertura o en modo avion.
- Procesamiento de datos sensibles sin salida a red: al ejecutarse en local, permite tareas de resumen o reformulacion de notas personales, mensajes o textos medicos sin enviar el contenido a un servidor externo.
- Clasificacion y etiquetado de texto en el borde: categorizacion de entradas de usuario (soporte, formularios, comentarios) con un modelo de 0,6B lo bastante pequeno para no penalizar el consumo energetico del dispositivo.
- Prototipado rapido de funciones de IA en apps Apple: sirve como banco de pruebas para validar la API de Core AI y FoundationModels antes de escalar a un modelo mayor o a un backend propio.
- Autocompletado y sugerencias de escritura en editores moviles: generacion de continuaciones cortas de texto con latencia potencialmente baja gracias al tamano reducido del modelo.
- Extraccion de campos estructurados de texto libre: conversion de texto desordenado (correos, notas) en campos normalizados dentro de un flujo local, siempre que el modelo base tenga capacidad suficiente para seguir instrucciones.
- Educacion y aprendizaje de idiomas: ejercicios de practica con retroalimentacion inmediata generada en el dispositivo, sin coste por token de API.
- Filtrado previo en pipelines mas grandes: uso del modelo como primera etapa barata para descartar o resumir contenido antes de invocar un modelo mayor en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de este repositorio no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes), y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo. Cualquier cifra de rendimiento atribuible al modelo base Qwen3-0.6B no se reproduce aqui porque no forma parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros del modelo base): ~1,2 GB en FP16, ~0,6 GB en INT8 y ~0,3 GB en INT4, sin contar la cache KV.
- El repositorio ocupa ~0,5 GB, coherente con un artefacto ya convertido y presumiblemente comprimido.
- Hardware objetivo declarado: Apple Silicon, con despliegue en iOS mediante el runtime Core AI.
- GPU de centro de datos (A100, H100, RTX 4090): no aplica; este artefacto esta pensado para el stack de Apple, no para CUDA.
- Compatibilidad con GPU de consumo: si, cualquier Mac con Apple Silicon puede en principio ejecutar el modelo por su tamano, aunque la compatibilidad exacta depende del runtime Core AI y no esta documentada en el repositorio.
- Opciones de despliegue: Core AI de Apple con `CoreAILanguageModels` y `FoundationModels` (documentado). Otras vias como llama.cpp, Ollama, vLLM o TGI no estan soportadas por este artefacto, ya que no se distribuyen pesos en GGUF ni en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Rendimiento |
|---|---|---|---|---|---|
| SoreGus/Qwen3-0.6B-CoreAI | 0,6B (heredado) | no disponible | Apache 2.0 | Bundle Core AI para iOS | no disponible |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B | 32.768 tokens nativos segun la ficha del modelo base | Apache 2.0 | safetensors y cuantizaciones de la comunidad (GGUF, MLX) | no disponible en esta ficha |
| Modelos pequenos alternativos para on-device (por ejemplo, la familia de 1B de otros proveedores) | ~1B | no disponible | licencias especificas de cada proveedor | safetensors, GGUF, MLX | no disponible |

La comparacion se limita a parametros, contexto y licencia porque no se dispone de datos de benchmarks reproducibles en la informacion proporcionada. La diferencia principal frente al modelo base no es de capacidad, sino de formato: este repositorio entrega un artefacto listo para el runtime de Apple, mientras que el modelo original se distribuye en safetensors para frameworks de proposito general.

## Limitaciones y advertencias

- Es una conversion de terceros, no un modelo entrenado ni validado por el equipo de Qwen; la fidelidad numerica respecto al modelo original no esta documentada ni verificada.
- No hay datos de evaluacion que confirmen que el artefacto convertido mantiene el comportamiento del modelo base: el riesgo de degradacion por la conversion y cuantizacion es real y no cuantificado.
- Riesgo de alucinacion: inherente a un modelo de 0,6B, que tiene capacidad limitada de razonamiento y de seguir instrucciones complejas; no debe usarse en tareas donde un error tenga consecuencias graves sin verificacion humana.
- Sesgos conocidos: no disponible; la model card no incluye ninguna seccion de sesgos, limitaciones o usos previstos.
- Limitaciones de idioma: no disponible. No se declara que idiomas soporta el artefacto convertido.
- Restricciones de licencia: el artefacto se publica bajo Apache 2.0, pero la model card advierte explicitamente de que se debe revisar la ficha y la licencia del modelo original antes de redistribuir o usar el resultado.
- Dependencia de plataforma: el artefacto solo es util dentro del ecosistema Core AI de Apple; no sirve para despliegues en Linux, CUDA o navegador.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validaciones externas documentadas.
- Anomalia en los metadatos: las fechas de creacion y actualizacion indican 2026-09-25, posteriores a la fecha de consulta habitual de este tipo de fichas; conviene verificarlas antes de citar el repositorio.
- La busqueda web asociada no devolvio ningun resultado relevante sobre el modelo, por lo que no hay fuentes independientes que corroboren su funcionamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SoreGus/Qwen3-0.6B-CoreAI
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Tooling de conversion citado: `coreai-models` de Apple y AppleAgentKitPython (nombres mencionados en la model card; no se proporciona URL)
- Paper, blog, repositorio o demo adicional: no disponible
- Busqueda web: los resultados obtenidos no guardaban relacion con el modelo (contenido comercial sobre banadores de natacion); no se han incluido por no ser pertinentes.
