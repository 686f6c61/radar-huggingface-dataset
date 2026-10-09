# eoinedge/automotive-fusion

## Resumen

`eoinedge/automotive-fusion` es un modelo de fusión de sensores orientado a diagnóstico de causa raíz (root cause) dentro del paquete denominado `automotive`, según declara su autor, el usuario `eoinedge`. Se distribuye como un bundle de despliegue en el borde que incluye `model.pte` (formato de ExecuTorch con backend XNNPACK), `labels.txt`, `input_shape.txt`, `features.json` y `metrics.json`.

El modelo está pensado para ejecutarse en dispositivos, no en servidores: la model card indica que corre en la variante Android de la aplicación `obd-sam3-fusion` y en el bucle Linux `busfusion`. Es decir, el caso de uso declarado es inferencia local sobre señales de bus de vehículo (previsiblemente OBD) combinadas con otros sensores, para atribuir fallos a su causa raíz.

La relevancia de esta ficha es limitada por la escasez de documentación pública: el repositorio tiene 0 descargas y 0 likes, no declara licencia, idiomas, pipeline ni arquitectura, y no publica resultados de benchmarks. Cualquier evaluación de idoneidad para producción exige contactar con el autor y auditar el bundle (`features.json`, `input_shape.txt`, `metrics.json`), que no se han incluido en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el backend XNNPACK admite int8, pero no se documenta qué se aplicó) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pte` (ExecuTorch), acompañado de `labels.txt`, `input_shape.txt`, `features.json`, `metrics.json` |
| Backend de ejecución | ExecuTorch con XNNPACK |
| Librería declarada | executorch |
| Pipeline de HuggingFace | no disponible |
| Autor | eoinedge |
| Fecha de creación registrada | 2026-10-09 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo: no se indica si es un transformer, una red convolucional, un modelo tabular o un ensamblado, ni el número de parámetros. Lo único documentado es el formato de exportación (`.pte` de ExecuTorch con backend XNNPACK) y el propósito declarado: fusión de sensores y atribución de causa raíz para el dominio de automoción dentro del pack `automotive`.

Tampoco hay datos sobre el conjunto de entrenamiento (número de tokens o muestras, composición, procedencia de las señales de bus o sensores), ni sobre técnicas de ajuste como RLHF o DPO, que en cualquier caso no resultan habituales en modelos de clasificación o regresión sobre señales. El bundle incluye un fichero `features.json` que presumiblemente define las variables de entrada y un `metrics.json` con métricas de evaluación, pero su contenido no se ha facilitado. Del mismo modo, se desconoce si el modelo incorpora innovaciones técnicas concretas (atención lineal, decodificación especulativa, poda estructurada, etc.).

## Capacidades

- Fusión de sensores de automoción: el modelo se declara como `sensor-fusion model` para el pack `automotive`, por lo que se espera que combine varias señales de entrada en una única salida.
- Diagnóstico de causa raíz: el tag `root-cause` indica que su salida no es solo una detección de fallo, sino una atribución a la causa que lo origina.
- Ejecución en el borde: exportado a ExecuTorch, con soporte declarado para Android (`obd-sam3-fusion`) y Linux (`busfusion`) mediante el runtime de ExecuTorch.
- Catálogo de salidas cerrado: la presencia de `labels.txt` sugiere clasificación sobre un conjunto finito y predefinido de etiquetas, no generación abierta de texto.
- Contrato de entrada fijo: `input_shape.txt` y `features.json` definen la forma y el orden de las características esperadas.
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes y capacidades multilingües: no disponibles; no hay ningún indicio de que el modelo cubra estas funciones.
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Diagnóstico a bordo en tiempo real: integrado en la aplicación Android `obd-sam3-fusion`, el modelo puede procesar las señales del bus del vehículo junto con otros sensores y devolver una etiqueta de causa raíz mientras el vehículo está en funcionamiento, sin depender de conectividad.
- Telemetría de flotas con procesamiento local: en un despliegue Linux tipo `busfusion`, cada unidad podría ejecutar el modelo sobre su propio flujo de datos y enviar únicamente el diagnóstico resultante, reduciendo ancho de banda y preservando datos sensibles.
- Priorización de mantenimiento: al atribuir un síntoma a una causa raíz concreta, el taller puede ordenar las intervenciones por probabilidad en lugar de inspeccionar componentes por descarte.
- Triaje previo a la revisión humana: la salida del modelo puede usarse como primera capa de filtrado para que un técnico solo revise los casos con mayor incertidumbre o gravedad.
- Validación en banco de pruebas: durante el desarrollo de un vehículo o de un componente, el modelo puede ejecutarse sobre datos grabados para comprobar si detecta fallos conocidos inyectados a propósito.
- Monitorización continua de condición: combinado con datos históricos, sirve para detectar derivas graduales y anticipar fallos antes de que se manifiesten como avería.
- Aplicación de segunda opinión en el taller: el diagnóstico del modelo puede contrastarse con el del mecánico para detectar discrepancias sistemáticas y calibrar el sistema.
- Investigación postventa: análisis agregado de causas raíz predominantes por modelo, kilometraje o región a partir de las etiquetas generadas en campo.

Todos estos escenarios dependen de que el bundle funcione según lo declarado; no se ha verificado ninguno de ellos con la documentación disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un fichero `metrics.json` que presumiblemente contiene métricas de evaluación, pero su contenido no se ha facilitado, por lo que no es posible presentar cifras de exactitud, F1, latencia u otras medidas, ni compararlas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está exportado a ExecuTorch con backend XNNPACK, lo que apunta a ejecución en CPU o acelerador integrado más que a GPU dedicada.
- GPU recomendadas: no disponible; no se documenta soporte CUDA ni ningún backend de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Plataformas de despliegue declaradas: runtime de ExecuTorch en Android (variante de la app `obd-sam3-fusion`) y bucle Linux (`busfusion`).
- Opciones de despliegue tipo servidor (vLLM, TGI, llama.cpp, Ollama): no aplicables según la información disponible; el formato `.pte` no es compatible con esos servidores de inferencia de modelos de lenguaje.
- Latencia y throughput: no disponibles.
- Requisitos de memoria y almacenamiento: no disponibles; dependen del tamaño del `.pte`, que no se ha publicado.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de fusión de sensores para automoción, ni permite establecer comparaciones fiables de parámetros, contexto, rendimiento o licencia. Las referencias encontradas en la búsqueda web (plataformas de despliegue en el borde y artículos divulgativos sobre sensor fusion en automoción) no son modelos concretos comparables con este.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no puede asumirse permiso para uso comercial, redistribución ni modificación. Es un bloqueante para cualquier despliegue en producto.
- Ausencia total de benchmarks: no hay evidencia pública de exactitud, robustez ni comportamiento en dominio real.
- Repositorio sin tracción: 0 descargas y 0 likes, sin documentación técnica más allá de la descripción del bundle, lo que dificulta validar su calidad.
- Dominio crítico para la seguridad: un diagnóstico erróneo de causa raíz en automoción puede derivar en reparaciones incorrectas o en la ignorancia de un fallo peligroso. No debe usarse como única fuente de decisión.
- Riesgo de mal generalización: se desconocen los vehículos, protocolos de bus y condiciones de captura cubiertos por el entrenamiento; datos de entrada fuera de esa distribución pueden producir atribuciones erróneas.
- Sensibilidad al contrato de entrada: la salida depende de respetar exactamente `input_shape.txt` y `features.json`; un orden o escalado distinto de las variables invalida el resultado.
- Idiomas y sesgos: no disponibles; se desconoce si el modelo produce texto y en qué idioma, así como cualquier sesgo derivado de los datos de entrenamiento.
- Sin garantías de mantenimiento: no hay indicios de actualizaciones, issues atendidos ni soporte por parte del autor.
- Confusión de categoría: no es un modelo de lenguaje; no debe evaluarse con métricas tipo MMLU ni desplegarse con servidores de inferencia para LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eoinedge/automotive-fusion
- Perfil del autor en HuggingFace: https://huggingface.co/eoinedge
- Datasets del autor: https://huggingface.co/eoinedge/datasets
- Dataset `eoinedge/spark-plug-classification`: https://huggingface.co/datasets/eoinedge/spark-plug-classification
- Dataset relacionado con diagnóstico de motor en Kaggle: https://www.kaggle.com/datasets/eoinedge/ai-mechanic-engine-condition-audio-fault-finding
- Referencia del sector sobre sensor fusion en automoción (Edge AI and Vision Alliance): https://www.edge-ai-vision.com/category/applications/automotive/
- Plataforma de despliegue en el borde mencionada en la búsqueda (ModelNova): https://modelnova.com/
