# besktech/ru-jev

## Resumen

Ru-Jev (Ру-Жев) es un modelo encoder de decisión tipada ("typed-decision") orientado al ruso, desarrollado por besktech. No genera texto: dado un contexto y un conjunto de opciones candidatas, devuelve una probabilidad calibrada sobre cada opción y selecciona una. Cubre tres formas de decisión: sí/no, elección entre opciones y escala ordinal. Está construido sobre el backbone mmBERT-base (307M parámetros) con una cabeza de scoring separada, lo que permite ejecutarlo en CPU y desplegarlo en perímetros cerrados.

El modelo resuelve el problema del enrutamiento y la clasificación de intenciones en entornos on-premise, donde se necesita una señal de confianza fiable para derivar peticiones a distintos componentes. La versión v1.3 corrige la principal debilidad de v1.1: la dependencia excesiva del fraseo exacto de las etiquetas. Para ello, entrena cada conjunto fijo de opciones con múltiples formulaciones (palabra rusa, clave inglesa, frase descriptiva, jerga, siglas) y muestrea una por ejemplo, forzando al modelo a leer la opción en lugar de reconocerla.

Es relevante ahora porque ofrece una alternativa compacta y abierta (licencia MIT) a los modelos de decisión tipada propietarios, con calibración explícita y sin dependencia de API cerradas. Su tamaño reducido y su naturaleza encoder lo hacen adecuado para despliegues de baja latencia en CPU dentro de infraestructuras controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) con cabeza de scoring separada |
| Parametros totales | 306.939.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso, ingles, multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone y `head.safetensors` separados) |

## Arquitectura y entrenamiento

Ru-Jev se compone de un backbone encoder mmBERT-base (jhu-clsp/mmBERT-base, 307M parámetros) más una cabeza de scoring entrenada desde inicialización aleatoria. No es un checkpoint estándar de clasificación de secuencias: la cabeza se carga desde un fichero `head.safetensors` independiente, y los pipelines estándar de Hugging Face (`AutoModelForSequenceClassification`) inicializan una cabeza nueva en lugar de cargar la entrenada, lo que produce puntuaciones aleatorias. Por eso el autor desactiva el widget de inferencia y advierte explícitamente de no usar `pipeline("zero-shot-classification")`.

El entrenamiento se realizó exclusivamente sobre datasets abiertos con anotación humana; el autor declara que no se llamó, destiló ni utilizó ninguna API de decisión cerrada como fuente de etiquetas, y que el modelo no está afiliado a TypeSafe AI. La innovación principal de v1.3 es la aumentación de fraseo de opciones: cada conjunto fijo de opciones se presenta con varias formulaciones (palabra rusa, clave inglesa, frase descriptiva, nombre de departamento, jerga anglicista, jerga de oficina, abreviaturas, códigos opacos e identificadores de código), y se muestrea una por ejemplo. Para las tareas de enrutamiento se incluye además la clave inglesa escrita en cirílico y una forma recortada de esta, generadas por regla. Esto obliga al modelo a interpretar semánticamente la opción en lugar de memorizar su forma exacta.

## Capacidades

- Clasificación de intenciones y enrutamiento: asigna un contexto a una de varias categorías candidatas con probabilidad calibrada.
- Decisión sí/no: responde a preguntas binarias con una probabilidad calibrada.
- Elección entre opciones: selecciona una opción de un conjunto finito, con probabilidad asociada.
- Escala ordinal: emite una decisión sobre una escala ordenada.
- Robustez ante variación de fraseo de etiquetas: maneja palabras en ruso, claves en inglés, frases descriptivas, jerga, abreviaturas y códigos opacos, con degradación gradual de la precisión.
- Clasificación zero-shot sobre conjuntos de etiquetas no vistos en entrenamiento, dentro de los límites medidos por el autor.
- Ejecución en CPU: al ser un encoder de 307M, no requiere GPU para inferencia.
- Despliegue on-premise: pensado para perímetros cerrados, sin dependencias de API externas.
- Idiomas: ruso como idioma principal, inglés y multilingüe como soporte.
- No genera texto ni soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de peticiones en un asistente conversacional: dado un mensaje de usuario y un conjunto de dieciocho intenciones (por ejemplo, `погода`, `погода` en jerga o `WEATHER_SCN`), el modelo devuelve la categoría con probabilidad calibrada, lo que permite derivar la petición al componente adecuado y aplicar umbrales de confianza para escalar a revisión humana.
- Clasificación de tickets de soporte en ruso: el modelo asigna cada ticket a un departamento (por ejemplo, `метеослужба`) con una confianza utilizable para priorización automática, incluso cuando el ticket usa jerga interna o abreviaturas.
- Filtro de seguridad y moderación binaria: decisión sí/no calibrada sobre si un contenido cumple una política, con umbral ajustable según el coste de falsos positivos y falsos negativos.
- Triaje en pipelines de datos: clasificación ordinal de la urgencia o calidad de un registro dentro de una escala definida, con probabilidad por nivel para alimentar reglas de negocio.
- Despliegue en infraestructura cerrada: al ejecutarse en CPU y no requerir API externas, encaja en entornos con requisitos de soberanía de datos donde no se permite enviar texto a servicios en la nube.
- Enrutamiento multilingüe ruso-inglés: cuando las etiquetas del sistema están en inglés (`weather`) pero las consultas llegan en ruso, el modelo mantiene precisión (0,962 con cinco candidatos y 0,900 con dieciocho en la formulación de clave inglesa).
- Clasificación zero-shot de catálogos de categorías: para conjuntos de etiquetas nuevos, el modelo ofrece una línea base sin reentrenamiento, con la advertencia de que la precisión cae con fraseos opacos (por ejemplo, 0,168 con cinco candidatos para el código `ПГД`).

## Benchmarks y rendimiento

El autor publica una evaluación sobre 1.000 preguntas de enrutamiento con el fraseo de la etiqueta variado y el resto del contexto fijo. Se reportan dos tamaños de conjunto candidato: cinco opciones (azar 0,20) y las dieciocho categorías completas (azar 0,056). Las dos primeras filas son controles (fraseos presentes en entrenamiento en ambas versiones); la frase rusa es estilo de entrenamiento solo para v1.3.

| Fraseo de la opción (ejemplo para `weather`) | Estado | v1.1, 5 | v1.3, 5 | v1.1, 18 | v1.3, 18 |
|---|---|---|---|---|---|
| Palabra rusa, `погода` | control, ambas versiones | 0,956 | 0,960 | 0,883 | 0,892 |
| Clave inglesa, `weather` | control, ambas versiones | 0,957 | 0,962 | 0,894 | 0,900 |
| Frase rusa, `прогноз погоды` | entrenamiento solo en v1.3 | 0,881 | 0,957 | 0,703 | 0,885 |
| Frase descriptiva | held out | 0,939 | 0,958 | 0,848 | 0,878 |
| Nombre de departamento, `метеослужба` | held out | 0,835 | 0,869 | 0,632 | 0,733 |
| Jerga anglicista, `вэзер`, 18 etiquetas | held out | 0,633 | 0,855 | 0,431 | 0,640 |
| Jerga anglicista, 15 etiquetas limpias | held out | 0,624 | 0,838 | 0,427 | 0,595 |
| Jerga anglicista, 11 etiquetas estrictas | held out | 0,550 | 0,786 | 0,328 | 0,470 |
| Jerga de oficina, `синоптик`, 18 | held out | 0,648 | 0,780 | 0,428 | 0,476 |
| Jerga de oficina, 14 etiquetas estrictas | held out | 0,595 | 0,761 | 0,369 | 0,419 |
| Abreviatura, `ПОГ`, 17 etiquetas limpias | held out | 0,420 | 0,360 | no evaluado | |
| Código opaco, `ПГД`, 9 etiquetas estrictas | held out | 0,135 | 0,168 | 0,018 | 0,061 |
| Identificador de código, `WEATHER_SCN` | contiene la clave entrenada | 0,856 | 0,889 | no evaluado | |

Además, el autor reporta calibración: en v1.1, con el fraseo de jerga, la confianza media era 0,754 frente a una precisión de 0,633 (brecha de 0,121); en v1.3 la brecha se reduce a 0,030. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 307M parámetros, en fp32 ocupa aproximadamente 1,2 GB de pesos, y en fp16 aproximadamente 0,6 GB, más el overhead de activaciones y la cabeza de scoring.
- GPU recomendadas: no es necesario GPU; el autor indica explícitamente que funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente si se desea acelerar.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM en fp16; en CPU es viable para cargas moderadas.
- Opciones de despliegue: transformers con el snippet de carga personalizado del autor; el tag `text-embeddings-inference` sugiere compatibilidad con TEI, aunque no se detalla la configuración. No usar los pipelines estándar de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ru-Jev v1.3 | 307M | no disponible | Decisión tipada y enrutamiento (ru/en) | MIT | Hugging Face |
| mmBERT-base (base) | 307M | no disponible | Encoder multilingüe general | no disponible | Hugging Face |
| Jev-class typed-decision (propietario) | no disponible | no disponible | Decisión tipada | propietaria | API cerrada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada. El autor declara no estar afiliado a TypeSafe AI ni haber usado salidas de Jev como fuente de etiquetas, por lo que la comparación con modelos Jev-class propietarios no puede establecerse con cifras.

## Limitaciones y advertencias

- No usar `pipeline("zero-shot-classification")` ni `AutoModelForSequenceClassification`: inicializan una cabeza aleatoria y devuelven números distintos en cada carga. Es obligatorio cargar `head.safetensors` con el snippet del autor.
- El widget de inferencia está desactivado a propósito; los pipelines estándar no funcionan.
- Degradación fuerte con fraseos opacos: abreviaturas (`ПОГ`: 0,360 con cinco candidatos) y códigos opacos (`ПГД`: 0,168 con cinco y 0,061 con dieciocho) quedan muy por debajo de los fraseos naturales.
- La precisión cae al aumentar el número de candidatos: con dieciocho opciones, incluso los fraseos control bajan a ~0,89-0,90.
- Riesgo de alucinación de categoría: aunque emite probabilidad calibrada, la opción seleccionada puede ser incorrecta; se recomienda umbral de confianza y derivación a revisión humana.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse solo con datos abiertos anotados por humanos, puede heredar sesgos de esos datasets.
- Limitaciones de idioma: el ruso es el idioma principal; el soporte de inglés y multilingüe es secundario y no está cuantificado.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de los evaluados.
- No genera texto, no soporta tool calling ni agentes; su uso está restringido a decisión y clasificación.
- Las versiones anteriores (`v1.1`, `v1`) se conservan en ramas; si se depende de un comportamiento exacto, fijar `revision`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/besktech/ru-jev
- Página del proyecto: https://ru-jev.besk.tech
- Demo con ejemplos precalculados: https://huggingface.co/spaces/besktech/ru-jev-demo
- Código de entrenamiento y evaluación: https://github.com/beskvladimir-create/ru-jev
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Paper referenciado (arXiv:2611.08439): https://arxiv.org/abs/2611.08439
