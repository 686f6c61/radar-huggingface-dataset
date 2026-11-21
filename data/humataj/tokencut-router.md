# humataj/tokencut-router

## Resumen

TokenCut router es un clasificador de texto ligero en formato ONNX desarrollado por el usuario humataj (FAST NUCES Islamabad) como componente del proyecto TokenCut, una pasarela para agentes de programación. Su función es reconocer el tipo de tarea que un usuario solicita a un agente de código a partir del mensaje escrito, de modo que la pasarela pueda añadir un breve resumen de tarea (task brief) antes de enviar la petición al modelo generativo. Resuelve un problema acotado pero práctico: enrutar y enriquecer prompts en pipelines de agentes de código sin recurrir a un LLM adicional, con un coste de inferencia mínimo en CPU (mediana de ~14 ms por mensaje).

El modelo parte de BAAI/bge-small-en-v1.5, un encoder transformer pequeño orientado a embeddings, al que se le ha añadido una cabeza de clasificación de 7 etiquetas y se ha ajustado durante 3 épocas sobre prompts de usuario del conjunto SWE-chat. El resultado se distribuye como un artefacto ONNX de precisión completa, con un tamaño de repositorio de 0,1 GB, licencia MIT y soporte exclusivo de inglés.

Es relevante ahora porque ejemplifica una tendencia creciente: el uso de clasificadores pequeños y deterministas como capa de enrutamiento y control en arquitecturas de agentes, en lugar de delegar estas decisiones a modelos grandes. Su etiquetado fino (bugfix, explain, feature, refactor, run_action, tests, no_brief) y su umbral de confianza calibrado (0,87 sobre probabilidad corregida por priors) lo convierten en una pieza de infraestructura más que en un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BAAI/bge-small-en-v1.5) con cabeza de clasificación de 7 etiquetas, exportado a ONNX |
| Parametros totales | no disponible (el modelo base bge-small es de ~33 M de parámetros; el total exacto de la cabeza no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana formal; la entrada se recorta a los primeros 360 tokens y los últimos 149 tokens |
| Tipos de cuantizacion | no disponible (se distribuye en precisión completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`router.onnx`, `router.onnx.data`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT pequeño (bge-small-en-v1.5) al que se le ha incorporado una cabeza de clasificación lineal sobre 7 clases. La entrada no se procesa como una secuencia completa: el `router_config.json` define un recorte que concatena los primeros 360 tokens y los últimos 149 tokens del mensaje, una estrategia habitual para capturar tanto la instrucción inicial como el cierre de la petición con un coste fijo. La salida se corrige mediante priors de clase antes de aplicar el umbral de decisión.

El ajuste fino se realizó durante 3 épocas sobre prompts de usuario del dataset SWE-chat, utilizando las etiquetas de tarea generadas por un LLM que el propio dataset incluye, mapeadas a las 7 clases del router. No se documenta el número exacto de ejemplos de entrenamiento ni si hubo etapas de RLHF o DPO (no aplica en un clasificador de este tipo). La innovación técnica principal no está en la arquitectura, sino en el diseño del pipeline: recorte de entrada asimétrico, corrección por priors y umbral de confianza elevado (0,87) para minimizar falsos positivos, priorizando precisión sobre cobertura.

## Capacidades

- Clasificación de mensajes de usuario en 7 categorías: `bugfix`, `explain`, `feature`, `refactor`, `run_action`, `tests` y `no_brief`.
- Detección de mensajes que no requieren brief (`no_brief`), actuando como filtro de ruido.
- Inferencia en CPU con latencia mediana de ~14 ms por mensaje, adecuada para ejecución síncrona en pasarelas.
- Generación implícita de task briefs: la pasarela TokenCut añade un resumen corto solo cuando la etiqueta superior no es `no_brief` y su probabilidad corregida es al menos 0,87.
- Soporte de tool calling / function calling: no disponible (el modelo no genera texto ni llamadas a herramientas; solo clasifica).
- Soporte de agentes y razonamiento multi-paso: no como modelo autónomo; se integra como componente de enrutamiento dentro de una arquitectura de agentes.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales: ninguna adicional (sin visión, audio ni modo thinking).

## Casos de uso

- Enrutamiento de prompts en pasarelas de agentes de código: el modelo clasifica cada mensaje entrante y permite que la pasarela añada un brief específico de tarea (por ejemplo, un recordatorio de reproducir el bug antes de corregirlo en `bugfix`) sin invocar un LLM adicional.
- Filtrado de mensajes irrelevantes: la clase `no_brief` permite descartar saludos, preguntas triviales o mensajes fuera de tarea antes de consumir presupuesto de tokens en el modelo generativo.
- Optimización de costes en pipelines de CI/CD de agentes: al ejecutarse en CPU en ~14 ms, puede insertarse en cada turno de conversación sin añadir latencia perceptible ni coste de GPU.
- Telemetría y analítica de uso: las etiquetas predichas permiten agregar estadísticas sobre qué tipos de tarea solicitan los usuarios (proporción de bugfix frente a features, por ejemplo) para priorizar mejoras del producto.
- Preprocesado para sistemas de evaluación de agentes: clasificar prompts de benchmarks o de logs reales para segmentar resultados por tipo de tarea y detectar sesgos de rendimiento.
- Componente de investigación en arquitecturas de agentes: sirve como ejemplo reproducible de cómo un clasificador pequeño y determinista puede sustituir a un LLM en decisiones de control, con métricas de precisión y cobertura publicadas.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas del conjunto de test reservado, no benchmarks estándar (MMLU, HumanEval, GSM8K) que no aplican a un clasificador de este tipo:

| Metrica | Valor |
|---|---|
| Acuerdo de briefs con las etiquetas | 92,2 % |
| Cobertura de tareas reales | 48,0 % |
| Mensajes no-tarea briefados incorrectamente | 5,2 % |
| Latencia mediana en CPU | ~14 ms por mensaje |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU. El repositorio ocupa 0,1 GB, por lo que la huella en memoria es del orden de cientos de MB en precisión completa.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier tarjeta con soporte ONNX Runtime (incluidas GTX/RTX de gama baja) serviría, pero no aportaría ventajas relevantes dada la latencia ya baja.
- Cabe en GPU de consumo: sí, holgadamente, aunque su despliegue previsto es en CPU.
- Opciones de despliegue: ONNX Runtime (principal, dado el formato), con posibilidad de integración en servicios Python o en la pasarela TokenCut; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato y tarea.
- Latencia y throughput estimados: mediana de ~14 ms por mensaje en CPU según el autor; el throughput exacto no está disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. Como referencia estructural, el propio modelo base BAAI/bge-small-en-v1.5 es un encoder de ~33 M de parámetros con licencia MIT, pero su tarea es la generación de embeddings, no la clasificación de intención en 7 clases. Cualquier comparación con clasificadores de intención comerciales o con LLMs usados como enrutadores requeriría datos que no están disponibles.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokenCut router | no disponible (~33 M base) | recorte 360+149 tokens | Clasificación de tarea (7 clases) | MIT | Hugging Face (ONNX) |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | Embeddings de texto | MIT | Hugging Face |
| Alternativas de clasificación de intención | no disponible | no disponible | Clasificación | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés: cualquier mensaje en otro idioma, incluido el castellano, queda fuera de su dominio de entrenamiento y producirá clasificaciones poco fiables.
- Etiquetas no verificadas por humanos: las anotaciones de entrenamiento provienen de un LLM sobre SWE-chat, por lo que los errores de etiquetado del profesor se propagan al alumno.
- Cobertura limitada: solo el 48,0 % de las tareas reales reciben brief, lo que implica que más de la mitad de las peticiones no se enriquecen; el diseño prioriza precisión sobre exhaustividad.
- Falsos positivos: un 5,2 % de mensajes no-tarea reciben brief incorrectamente, lo que puede introducir ruido en el prompt del agente.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no genera texto libre), pero sí existe riesgo de clasificación errónea en mensajes ambiguos o muy cortos.
- Dependencia de umbral: el comportamiento depende fuertemente del umbral 0,87 y de los priors de clase; cambios en la distribución de entrada pueden degradar la calibración.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial; el dataset SWE-chat está bajo ODC-BY y requiere atribución, aunque el repositorio no incluye prompts de entrenamiento.
- Madurez: modelo con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026, sin validación externa conocida; no recomendable como dependencia crítica en producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/humataj/tokencut-router
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/SALT-NLP/SWE-chat
- Repositorio del proyecto TokenCut: https://github.com/Masooma-Ali/TokenCut
