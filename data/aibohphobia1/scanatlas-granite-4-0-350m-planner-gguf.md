# aibohphobia1/ScanAtlas-Granite-4.0-350M-Planner-GGUF

## Resumen

ScanAtlas-Granite-4.0-350M-Planner-GGUF es un ajuste fino (fine-tune) del modelo ibm-granite/granite-4.0-350m de IBM, publicado por el usuario aibohphobia1. No se trata de un modelo de chat general, sino de un planificador especializado que genera acciones para el asistente en dispositivo de la aplicación ScanAtlas, emitiendo llamadas a herramientas en formato JSON conforme a una gramática fija y a la plantilla de prompt propia de la aplicación. Cubre 55 herramientas de la app y opera en 15 idiomas.

El modelo parte de la arquitectura Granite 4.0 de 350M parámetros (352.379.904 parámetros reales según los pesos en safetensors) y ha sido reentrenado en su totalidad sobre ejemplos de planificación de ScanAtlas. Posteriormente se cuantizó a Q4_0 con llama.cpp build b11799, generando un único archivo GGUF de aproximadamente 0,2 GB, lo que lo hace apto para inferencia local en hardware modesto.

Su relevancia radica en que demuestra el patrón de especialización de modelos pequeños para tareas de tool calling con gramática restringida en entornos de borde (on-device). El autor reporta una tasa de acierto del 76% (2.313 de 3.036 tareas) frente a las 2.118 del planificador LFM2.5 350M al que sustituye, si bien conviene señalar que el modelo es de nicho y no sustituye a un modelo conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de ibm-granite/granite-4.0-350m); detalles internos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 352.379.904 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (unico archivo publicado) |
| Idiomas soportados | 15 idiomas (la lista concreta no esta disponible; el autor indica que las tareas en idiomas distintos del ingles no han sido revisadas por hablantes nativos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo ScanAtlas-Granite-4.0-350M-Planner-v2-Q4_0.gguf) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de ibm-granite/granite-4.0-350m, un transformer decoder-only de 350M parámetros. El autor no detalla en la model card la composición interna de la arquitectura base (número de capas, dimensiones ocultas, mecanismo de atención), por lo que esos datos deben consultarse en la ficha del modelo original de IBM.

El proceso de ajuste consistió en reentrenar todos los pesos del modelo base sobre ejemplos de planificación de ScanAtlas, es decir, pares de prompt de la aplicación y llamadas a herramientas en JSON para las 55 herramientas disponibles. No se especifica el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tras el ajuste, el modelo se cuantizó a Q4_0 con llama.cpp build b11799. La innovación principal no es arquitectónica sino de uso: el modelo está diseñado para operar con una gramática JSON y una plantilla de prompt específicas de la aplicación, lo que restringe su salida a acciones válidas del catálogo de herramientas.

## Capacidades

- Generación de llamadas a herramientas (tool calling) en formato JSON para las 55 herramientas de la aplicación ScanAtlas.
- Planificación de acciones de un solo paso orientada a un asistente en dispositivo, con argumentos estructurados que la app consume directamente.
- Cobertura multilingüe de 15 idiomas en las tareas de planificación (sin revisión nativa de los idiomas distintos del inglés, según el autor).
- Formato conversacional compatible con el chat template del modelo y con endpoints compatibles según los tags del repositorio.
- No es un modelo de chat general: no está pensado para conversación abierta, razonamiento libre, generación de código genérica ni matemáticas.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Asistente en dispositivo de ScanAtlas: el modelo recibe el prompt de la app y devuelve la acción JSON correspondiente para ejecutar la herramienta adecuada; es su propósito principal y el único escenario para el que fue entrenado.
- Sustitución de planificadores previos en la app: el autor lo presenta como reemplazo del planificador LFM2.5 350M, con 2.313 aciertos frente a 2.118 sobre el mismo conjunto de 3.036 tareas, por lo que encaja en la misma ranura de integración.
- Despliegue local de bajo coste: con un GGUF Q4_0 de unos 0,2 GB, puede ejecutarse en dispositivos con recursos limitados mediante llama.cpp o llama-server, sin depender de la nube.
- Enrutamiento de intenciones a herramientas en apps móviles: dado un enunciado del usuario en cualquiera de los 15 idiomas cubiertos, el modelo selecciona la herramienta y rellena los argumentos, lo que sirve como capa de decisión previa a la ejecución.
- Prototipado de asistentes con gramática restringida: sirve como referencia para equipos que quieran replicar el patrón de fine-tune de un modelo de 350M sobre un catálogo cerrado de herramientas con salida JSON validada.
- Evaluación comparativa de planificadores pequeños: el conjunto de 3.036 tareas y la métrica de acierto exacto de herramienta y argumentos permiten usarlo como línea base en experimentos de tool calling en el borde.

## Benchmarks y rendimiento

| Metrica | ScanAtlas-Granite-4.0-350M-Planner | LFM2.5 350M planner (sustituido) |
|---|---|---|
| Tareas correctas | 2.313 de 3.036 (76%) | 2.118 de 3.036 (aprox. 69,8%) |
| Cobertura de herramientas | 55 | 55 |
| Idiomas evaluados | 15 | 15 |

La evaluación se realizó en un PC con llama-server y el chat template del modelo. Una tarea se cuenta como correcta solo si coinciden la herramienta y los argumentos que la app necesita. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,3-0,5 GB con la cuantización Q4_0 publicada (archivo de aproximadamente 0,2 GB más overhead de contexto y runtime); no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente en la práctica; el modelo está pensado para ejecución en CPU en dispositivos de borde.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, series GTX/RTX con 4 GB o más) e incluso en CPU.
- Opciones de despliegue: llama.cpp (build b11799 o posterior, usado por el autor) y llama-server; al ser un GGUF estándar, es compatible con el ecosistema llama.cpp, aunque no se documenta soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; el autor solo indica que la evaluación se hizo con llama-server en un PC.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Formato |
|---|---|---|---|---|---|
| ScanAtlas-Granite-4.0-350M-Planner | 352,4M | No disponible | 76% (2.313/3.036) | Apache-2.0 | GGUF Q4_0 |
| LFM2.5 350M planner | 350M (aprox.) | No disponible | 2.118/3.036 (aprox. 69,8%) | No disponible | No disponible |
| ibm-granite/granite-4.0-350m (base) | 352,4M | No disponible | No evaluado en esta tarea | Apache-2.0 | Safetensors y otras variantes |

La comparación se limita a los datos aportados por el autor; no se dispone de resultados de otros planificadores pequeños en el mismo conjunto de tareas ni de especificaciones de contexto de los modelos comparados.

## Limitaciones y advertencias

- Modelo de nicho: espera el prompt y la gramática JSON de ScanAtlas; fuera de ese contrato no funciona como chat general y producirá salidas poco útiles.
- Sesgos: no se documentan análisis de sesgo; al derivar de un modelo base de IBM y entrenarse sobre ejemplos de una app concreta, puede heredar sesgos del corpus original y de los datos de planificación.
- Alucinación: aunque la gramática restringe el formato, el modelo puede seleccionar una herramienta incorrecta o rellenar argumentos erróneos; la métrica del 76% implica que aproximadamente una de cada cuatro tareas falla.
- Idiomas: los 15 idiomas cubiertos no han sido revisados por hablantes nativos según el autor, por lo que la calidad fuera del inglés es incierta.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo está modificado respecto al original y el autor incluye el archivo LICENSE; conviene conservar los avisos de atribución correspondientes.
- Producción: al ser un repositorio con 0 descargas y 0 likes en el momento de la consulta, no hay validación comunitaria; se recomienda evaluar sobre el conjunto propio antes de desplegarlo.
- No se dispone de información sobre longitud de contexto, por lo que no debe asumirse una ventana amplia para prompts largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aibohphobia1/ScanAtlas-Granite-4.0-350M-Planner-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- llama.cpp (runtime empleado para la cuantización, build b11799): no disponible en la información proporcionada
