# gcorzo/remora-expert-bank-qwen3.5-0.8b

## Resumen

`gcorzo/remora-expert-bank-qwen3.5-0.8b` no es un modelo, sino un banco de tres expertos aditivos de bajo rango (36.864 parámetros en total, 691.136 bytes) que se acoplan a cuatro proyecciones de escritura residual (capas 5, 11, 17 y 23) de `Qwen/Qwen3.5-0.8B-Base`. Los pesos base no se modifican ni se redistribuyen: el repositorio solo contiene las matrices delta y las claves de enrutado, de modo que el artefacto no altera el comportamiento del modelo base hasta que un experto se carga y se enruta.

El objetivo declarado es la composición: varios comportamientos pueden coexistir sobre una base congelada sin reentrenarla, y añadir uno nuevo cuesta 250 pasos de entrenamiento y un fichero de 691 KB en lugar de un checkpoint completo. Cada experto es un producto `u @ v` de rango 4 con `u` inicializada a cero (un experto sin entrenar es una no-op), y la combinación se resuelve con un gate por token sin parámetros entrenables, `softmax(cos(h, k_e) / 0,05)`, donde `k_e` es el estado oculto medio de esa capa sobre los datos de entrenamiento del experto.

Los tres expertos incluidos cubren tres tareas pequeñas de clasificación en inglés: SST-2 (sentimiento), AG News (tema) y TREC (tipo de pregunta). Es un artefacto de investigación sobre aprendizaje continuo, no una capacidad de propósito general: todas las mediciones truncan a 96 tokens y no hay evaluación de seguridad ni multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Banco de expertos aditivos de bajo rango (delta experts) sobre las proyecciones de escritura residual de las capas 5, 11, 17 y 23 de `Qwen/Qwen3.5-0.8B-Base`; no es un modelo completo |
| Parámetros totales | 36.864 en el banco (12.288 por experto, 3 expertos); los pesos del modelo base (~0,8B) se descargan por separado |
| Parámetros activos | No aplica (no es un MoE); el gate pondera expertos por token, pero el banco solo aporta 36.864 parámetros |
| Longitud de contexto | No disponible para el modelo base en la información proporcionada; todas las mediciones del banco truncan a 96 tokens |
| Tipos de cuantización | No disponible; deltas en float32, base en bf16 (clúster) y fp16 (prueba en portátil) |
| Idiomas soportados | Inglés (tres tareas de clasificación: SST-2, AG News, TREC); no se declaran otros idiomas |
| Licencia | Apache-2.0 (heredada del modelo base, con avisos retenidos en `LICENSE`) |
| Formato de pesos | safetensors (`deltas.safetensors`) más `bank/bank.json` con capas, tau, nombres de expertos y SHA-1 de cada clave |
| Rango por experto | 4 (`u @ v`, con `u` inicializada a cero y `v` aleatoria pequeña) |
| Enrutado | Gate por token `softmax(cos(h, k_e) / 0,05)` con clave fija `k_e` por experto; sin parámetros entrenables |

## Arquitectura y entrenamiento

El banco inyecta deltas de rango 4 en la proyección que escribe en el flujo residual de cuatro capas del transformer de `Qwen3.5-0.8B-Base`. Cada experto se entrena de forma independiente: 2.000 ejemplos por tarea y 250 pasos por experto, en orden A. La innovación técnica no está en la arquitectura del adaptador, sino en el enrutado: en lugar de entrenar un router (que introduce parámetros y sobreajuste), cada experto lleva asociada una clave `k_e` calculada como el estado oculto medio de esa capa sobre sus datos de entrenamiento, y la mezcla se obtiene por similitud coseno escalada por una temperatura fija de 0,05. Al ser un producto `u @ v` con `u` a cero, un experto no entrenado no perturba la salida.

El trabajo incluye una comparación controlada con otras cuatro formas de añadir las mismas tres tareas bajo el mismo protocolo (250 pasos, orden A, tres semillas): deltas sumados sin enrutado, un router aprendido de la misma forma, un único adaptador compartido de rango 4 y ese adaptador con EWC (Elastic Weight Consolidation). También se documenta un resultado negativo sobre reutilización de activaciones que motivó no publicar matriz de corrección. La nota técnica está en `docs/remora-pilot-v0.4.pdf` y los JSON crudos de todas las cifras, incluidas las variantes comparadas, en `eval/`.

## Capacidades

- Clasificación de sentimiento binario mediante el experto `sst2` (SST-2, 0,789 con gate sobre 400 ejemplos held-out).
- Clasificación temática de titulares mediante el experto `agnews` (0,808 con gate).
- Clasificación de tipo de pregunta mediante el experto `trec` (0,829 con gate).
- Composición de comportamientos sobre una base congelada: añadir un cuarto experto cuesta 250 pasos y 691 KB, sin reentrenar el base.
- Extensión a un dominio no visto en el entrenamiento original: el experto de cláusulas legales (8 clases) pasa la precisión de 0,299 a 0,964 ± 0,001 en tres semillas, manteniendo las tareas previas dentro del ruido.
- Enrutado determinista y reproducible: `bank.json` guarda el SHA-1 de cada clave, de modo que el gate se puede replicar exactamente.
- No incluye generación de texto libre, tool calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento. Es un banco de deltas para tareas de clasificación cortas.

## Casos de uso

- Investigación en aprendizaje continuo: el banco sirve como banco de pruebas reproducible para comparar estrategias de composición (gate de clave fija, router aprendido, EWC, adaptador único) bajo un protocolo fijo de 250 pasos, tres semillas y BWT medido.
- Clasificación de sentimiento en reseñas cortas: con entradas de hasta 96 tokens, el gate alcanza 0,789 en SST-2 frente a 0,575 del base sin expertos, suficiente para prototipos de triaje de opiniones.
- Etiquetado temático de titulares en pipelines de datos: 0,808 en AG News con gate frente a 0,320 del base, útil para enrutar noticias a colas de revisión antes de un procesamiento más costoso.
- Clasificación de intención o tipo de pregunta en un FAQ: 0,829 en TREC con gate, aplicable como primer clasificador en un sistema de recuperación de documentación.
- Añadir un dominio vertical nuevo sin tocar el base: entrenar un experto de cláusulas legales (8 clases) en unos 60 segundos (250 pasos) eleva la precisión de 0,299 a 0,964 sin degradar las tareas anteriores más allá del ruido entre semillas.
- Despliegue en portátil o entorno de borde para demos: los 691 KB de deltas más el base de 0,8B caben en un portátil (4,6 GB de pico en fp16 sobre Metal) con 46–105 ms por ítem.
- Filtrado débil de dominio: la pertenencia máxima del gate separa datos dentro y fuera de dominio con AUC 0,65–0,73; solo es utilizable como señal indicativa, nunca como abstención automática.
- Auditoría de experimentos: el SHA-1 de cada clave en `bank.json` permite reconstruir el enrutado exacto de una ejecución pasada.

## Benchmarks y rendimiento

Precisión sobre los splits held-out de cada tarea (400 ejemplos). Se muestra una semilla de tres; la media sobre tres semillas está en la nota técnica.

| Tarea | Base, sin expertos | 3 expertos, sumados | 3 expertos, con gate |
|---|---|---|---|
| SST-2 | 0,575 | 0,703 ± 0,129 | 0,789 ± 0,210 |
| AG News | 0,320 | 0,601 ± 0,038 | 0,808 ± 0,024 |
| TREC | 0,062 | 0,913 ± 0,009 | 0,829 ± 0,042 |
| IMDB (dominio no visto) | 0,595 | 0,617 ± 0,382 | 0,734 ± 0,156 |
| Disposiciones legales (8 clases, no visto) | 0,235 | 0,273 ± 0,020 | 0,299 ± 0,084 |

Comparación de las cinco formas de añadir las mismas tres tareas (mismo protocolo, 250 pasos, orden A, tres semillas):

| Variante | SST-2 | AG News | TREC | Media | BWT |
|---|---|---|---|---|---|
| Este banco, gate de clave fija | 0,789 ± 0,210 | 0,808 ± 0,024 | 0,829 ± 0,042 | **0,809** | +0,046 ± 0,077 |
| Deltas sumados, sin enrutado | 0,703 ± 0,129 | 0,601 ± 0,038 | **0,913 ± 0,009** | 0,739 | +0,138 ± 0,037 |
| Router aprendido, misma forma | 0,629 ± 0,114 | 0,588 ± 0,131 | 0,830 ± 0,016 | 0,682 | +0,179 ± 0,050 |
| Adaptador único compartido | 0,662 ± 0,086 | 0,379 ± 0,145 | 0,807 ± 0,054 | 0,616 | +0,210 ± 0,074 |
| Adaptador único + EWC | **0,892 ± 0,005** | 0,792 ± 0,019 | 0,476 ± 0,140 | 0,720 | **+0,016 ± 0,003** |
| Base, prompt de cinco ejemplos | 0,558 | 0,348 | 0,128 | 0,345 | — |

Datos adicionales: el experto legal añadido como cuarto elemento sube la precisión legal de 0,299 a 0,964 ± 0,001 en tres semillas. En portátil con fp16 sobre Metal, el mismo banco reproduce la precisión del clúster (SST-2 0,910; AG News 0,830; TREC 0,845) a 46–105 ms por ítem y 4,6 GB de memoria pico.

## Requisitos de hardware

- Tamaño del artefacto: 691.136 bytes de deltas; el grueso del consumo lo aporta el modelo base de ~0,8B, con pesos en bf16 en torno a 1,6 GB.
- Memoria pico medida: 4,6 GB en un portátil con Metal y fp16, incluyendo runtime y activaciones.
- Cabe en cualquier GPU de consumo con 6 GB o más de VRAM; también es viable en CPU por el tamaño reducido del base, aunque no se publican latencias de CPU.
- GPU de referencia del autor: ninguna de datacenter; las mediciones del clúster usan bf16 y la prueba de portátil usa Metal en fp16. No hay datos publicados para A100, H100 o RTX 4090.
- Latencia: 46–105 ms por ítem en fp16 sobre Metal en portátil. No se publica throughput agregado ni latencias en clúster.
- Despliegue: el runtime de referencia es `bank_runtime.py`, incluido en el repositorio, que carga el banco, parchea las cuatro proyecciones e informa de precisión y throughput para unos pocos prompts de clasificación, sobre `transformers`.
- No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ni pesos en formato GGUF.

## Comparativa con modelos similares

| Alternativa | Parámetros añadidos | Contexto / alcance | Rendimiento (media de 3 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este banco (gate de clave fija) | 36.864 (691 KB) | Clasificación, 96 tokens | 0,809 | Apache-2.0 | HuggingFace, 0 descargas |
| Deltas sumados sin enrutado | Mismo orden (36.864) | Igual | 0,739 | Apache-2.0 | Variante del mismo estudio |
| Router aprendido de misma forma | No disponible en el texto | Igual | 0,682 | Apache-2.0 | Variante del mismo estudio |
| Adaptador único de rango 4 | No disponible en el texto | Igual | 0,616 | Apache-2.0 | Variante del mismo estudio |
| Adaptador único + EWC | No disponible en el texto | Igual | 0,720 | Apache-2.0 | Variante del mismo estudio |
| Base con prompt de cinco ejemplos | 0 | Igual | 0,345 | Apache-2.0 | `Qwen/Qwen3.5-0.8B-Base` |

No se han identificado en la información disponible otros bancos de expertos públicos directamente comparables; las alternativas anteriores son las brazos del propio estudio.

## Limitaciones y advertencias

- Alcance mínimo: tres tareas pequeñas de clasificación en inglés. Es un artefacto de investigación, no una capacidad de propósito general.
- Truncamiento a 96 tokens en todas las mediciones; no se evalúa el comportamiento con entradas largas.
- El gate no sabe cuándo le falta un experto: la pertenencia máxima separa dentro y fuera de dominio con AUC 0,65–0,73 según semilla. No debe usarse la similitud como señal de abstención.
- Varianza alta en el gate: SST-2 oscila con ±0,210 entre semillas, con extremos de 0,557 a 0,855 en IMDB. La media no debe leerse como rendimiento estable.
- Los deltas sumados son inestables fuera de su distribución de entrenamiento (IMDB varía de 0,185 a 0,910 entre semillas); el gate es más estable, pero nunca supera a los sumados en la tarea entrenada más recientemente.
- Las claves de tarea se calcularon con los datos propios de cada tarea. En despliegue la clave tendría que derivarse en línea, problema que el autor declara no resuelto.
- Sin evaluación de seguridad: no hay pruebas adversarias ni multilingües, y solo se cubren tres conjuntos de etiquetas.
- Licencia Apache-2.0 heredada del base, que permite uso comercial; el banco no redistribuye los pesos base, que deben descargarse aparte y conservan su propia licencia.
- Artefacto sin validación externa: 0 descargas y 0 likes en el momento de la consulta, una única semilla mostrada en la tabla principal y resultados dependientes del orden de las tareas (orden A).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gcorzo/remora-expert-bank-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Nota técnica del autor: `docs/remora-pilot-v0.4.pdf` (dentro del repositorio)
- Resultados crudos de evaluación: `eval/` (JSON con todas las cifras, incluidas las variantes comparadas)
- Runtime de referencia: `bank_runtime.py` y `bank/bank.json` (dentro del repositorio)
- Paper, blog o demo externos: no disponibles en la información proporcionada
