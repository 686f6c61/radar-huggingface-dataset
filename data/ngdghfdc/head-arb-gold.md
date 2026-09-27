# ngdghfdc/head-arb-gold

## Resumen

head-arb-gold es un modelo de decisión especializado, publicado por el usuario ngdghfdc, que actúa como cabeza de arbitraje para pipelines de OCR. Su única función es recibir el estado de un flujo de extracción documental y elegir una de cuatro acciones posibles: `trust-leader`, `trust-consensus`, `merge-fields` o `escalate`. Se trata de un fine-tune completo del modelo base [`convaiinnovations/laya`](https://huggingface.co/convaiinnovations/laya), también bajo licencia Apache-2.0, y se distribuye con la librería `laya` como formato de carga.

Con 421.293.830 parámetros (aproximadamente 421 millones) y un repositorio de 1,7 GB, el modelo está pensado para ejecutarse en una sola pasada de encoder, con latencias del orden de milisegundos en GPU. Su rasgo diferencial es que incorpora consciencia de coste: prefiere el consenso entre motores de OCR baratos antes que recurrir a un motor líder caro (GPU o API de pago) cuando la coincidencia entre motores es alta, reservando la escalada para casos ambiguos.

Es relevante ahora porque ataca un problema concreto de los sistemas de extracción documental en producción: la orquestación de múltiples motores de OCR y la resolución de discrepancias sin disparar el coste. No obstante, el propio autor advierte que el modelo se ha entrenado y evaluado sobre una distribución sintética, por lo que demuestra la viabilidad del bucle de decisión, no la precisión en datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fine-tune de `convaiinnovations/laya`; decisión en una sola pasada de encoder (detalle de capas no disponible) |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tune) del checkpoint base `convaiinnovations/laya`, una librería orientada a modelos de decisión y agentes. Según la model card, la inferencia se resuelve en una única pasada de encoder, lo que sitúa la latencia en el orden de milisegundos en GPU. No se detalla en la información disponible la arquitectura interna de Laya (tipo de transformer, número de capas o dimensionalidad), por lo que ese dato queda como no disponible.

El entrenamiento se realizó íntegramente a coste cero sobre dos GPU Kaggle T4, con precisión bf16, 3 épocas, learning rate 2e-5 y batch de 8. El conjunto de datos consistió en 2.000 casos con verdad de construcción (incluyendo patrones trampa de coste), sin solapamiento con el conjunto de evaluación. Para evitar el colapso de prior (que el modelo aprenda a elegir siempre la misma opción), el autor barajó el orden de las opciones por muestra y generó tres variantes de instrucción. La salida es una elección entre las cuatro acciones de arbitraje. La evaluación se hizo sobre un conjunto sintético retenido de 150 casos, con un resultado de 1,0000 frente a 0,700 de la heurística de referencia (+30 puntos porcentuales).

## Capacidades

- Clasificación de decisión restringida a cuatro acciones: `trust-leader`, `trust-consensus`, `merge-fields` y `escalate`.
- Arbitraje de salidas de múltiples motores de OCR en una sola pasada de encoder.
- Decisión con consciencia de coste: prioriza el consenso de motores baratos sobre líderes caros cuando la concordancia es alta.
- Integración con la librería `laya` mediante la interfaz `agent.predict(state, ...)`, con el esquema de elección tipo `choice`.
- Carga segura de pesos en safetensors, sin pickle ni ejecución de código al cargar.
- No se documentan capacidades de generación de texto libre, visión, audio, tool calling ni razonamiento multi-paso. El alcance es estrictamente el de una capa de enrutamiento o señal.

## Casos de uso

- Orquestación de pipelines de OCR multi-motor: el modelo recibe las salidas de varios motores de OCR y decide si fiarse del líder, del consenso, fusionar campos o escalar, reduciendo el número de llamadas a motores caros.
- Optimización de coste en extracción documental: en documentos donde los motores baratos coinciden, el modelo evita invocar un motor de GPU o de API de pago, lo que rebaja el coste por página.
- Capa de enrutamiento previa a un juez final: como dispatcher, decide qué casos necesitan revisión humana o un modelo más potente, absteniéndose por debajo del umbral tau.
- Fusión de campos en formularios y facturas: cuando distintos motores extraen campos parcialmente correctos, el modelo puede seleccionar `merge-fields` para combinar la información.
- Control de calidad en digitalización masiva: marcar automáticamente los documentos donde ningún motor ofrece una respuesta consistente y derivarlos a escalado.
- Integración en flujos tipo examflow: el propio etiquetado del proyecto (`examflow`) apunta a la corrección y digitalización de exámenes, donde el modelo arbitraría la lectura de respuestas manuscritas o impresas.
- Investigación sobre enrutamiento con consciencia de coste: sirve como banco de pruebas reproducible del bucle de decisión, dado que el entrenamiento se hizo con recursos gratuitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación aportado por el autor es el siguiente:

| Evaluacion | Conjunto | Metrica | head-arb-gold | Heuristica de referencia |
|---|---|---|---|---|
| Eval sintetica retenida | n=150 casos sinteticos | Tasa de acierto | 1,0000 | 0,7000 |

El autor subraya que este resultado procede de una distribución sintética y demuestra la viabilidad del bucle, no la precisión en el mundo real.

## Requisitos de hardware

- Parámetros: 421,3 millones; pesos en bf16 de aproximadamente 0,84 GB, con repositorio de 1,7 GB (incluye ficheros adicionales).
- VRAM estimada para inferencia: en torno a 1-2 GB en bf16/fp16, considerando pesos más activaciones; alrededor de 1,7 GB en fp32.
- GPU recomendadas: dado el tamaño, cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. El autor entrenó con dos T4 de Kaggle, por lo que una sola T4 es válida para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de gama media o superior (por ejemplo, series RTX 30/40 con 8 GB o más, e incluso integradas con suficiente memoria).
- Opciones de despliegue: la carga documentada es mediante la librería `laya` (`Agent(model_id_or_path=...)`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: el autor indica una sola pasada de encoder y latencias del orden de milisegundos en GPU; no se aportan cifras de throughput.

## Comparativa con modelos similares

No se dispone de especificaciones de modelos comparables de la misma categoría (cabezas de arbitraje de OCR) en la información proporcionada. La referencia más directa que sí aparece es el modelo base y la heurística:

| Modelo | Parametros | Contexto | Rendimiento (eval sintetica n=150) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| head-arb-gold | 421.293.830 | no disponible | 1,0000 | Apache-2.0 | HuggingFace |
| convaiinnovations/laya (base) | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |
| Heuristica de referencia | no aplica | no aplica | 0,7000 | no aplica | no aplica |

No se dispone de comparativas con otras alternativas de la misma tarea o tamaño en la información facilitada.

## Limitaciones y advertencias

- Distribución sintética: el modelo se entrenó y evaluó sobre datos sintéticos; el autor advierte explícitamente que demuestra el bucle, no la precisión en el mundo real.
- Calibración de confianza: las temperaturas por cabeza del checkpoint base son inválidas y no están calibradas; hay que reajustarlas (refit) antes de confiar en la confianza reportada.
- No debe usarse como juez final: su función es la de capa de despacho o señal, con abstención por debajo del umbral tau.
- Alcance muy restringido: solo elige entre cuatro acciones de arbitraje; no genera texto ni resuelve tareas generales.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto, lo que dificulta su uso seguro en producción multilingüe.
- Sin adopción comunitaria: 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks independientes que validen los resultados.
- Licencia: Apache-2.0, que permite uso comercial, pero hereda las condiciones del modelo base `convaiinnovations/laya`; conviene revisar dicha licencia antes de desplegar.
- Procedencia y mantenimiento: autor individual sin historial verificable; verificar la integridad del repositorio antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngdghfdc/head-arb-gold
- Modelo base: https://huggingface.co/convaiinnovations/laya
- HuggingFace (portal general): https://huggingface.co/
- No se han encontrado papers, blogs, repositorios o demos específicos de este modelo en los resultados de búsqueda disponibles.
