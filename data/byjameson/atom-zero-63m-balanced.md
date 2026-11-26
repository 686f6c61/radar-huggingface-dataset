# byjameson/atom-zero-63m-balanced

## Resumen

Atom Zero 63M balanced base es un modelo de lenguaje de pequeno tamano (63.389.184 parametros) desarrollado por el usuario byjameson bajo el paraguas del proyecto Atom Zero. Se presenta como el primer modelo del proyecto que supera el conjunto completo de criterios de producto definidos por el autor, incluyendo pruebas de copia (copy-task), retencion de contenido, utilidad en consultas benignas y filtros de seguridad. No es un modelo de proposito general: su diseno esta orientado a tareas acotadas de copia de claves, retencion de contexto y respuestas seguras dentro de un conjunto de pruebas autorales.

La arquitectura es un transformer denso de 8 capas, obtenido mediante "upcycling" por interpolacion a partir de una base previa de 49,2 M de parametros. El entrenamiento fue muy corto (3000 pasos, batch 4, learning rate 5e-5) sobre un dataset pequeno y curado a mano: 6000 ejemplos de copia, 492 de contenido, 480 benignos replicados tres veces, 40 de seguridad replicados cinco veces, 16 de autolesion replicados cinco veces y 96 pares de frontera. Los pesos se distribuyen en formato PyTorch (`model.pt`), no en safetensors ni GGUF.

Su relevancia es limitada y muy especifica: sirve como referencia de un pipeline de evaluacion interna ("product suite", "server suite") mas que como modelo para aplicaciones reales. La model card es explicita en que las pruebas son "pantallas autorales, no benchmarks publicos", y que la gramatica de copia solo cubre los estilos de clave entrenados. No hay informacion sobre idiomas soportados ni sobre resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 8 capas (upcycled por interpolacion desde base de 49,2 M) |
| Parametros totales | 63.389.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`), tokenizer BPE (`chat_en_bpe8k.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8 capas construido por "upcycling": se parte de la base `atom-zero-49m` y se interpola para anadir capacidad hasta alcanzar 63,4 M de parametros. No se especifica el numero de cabezas de atencion, la dimension oculta ni la funcion de activacion. El tokenizer es un BPE de 8k tokens (`chat_en_bpe8k.json`), lo que sugiere un vocabulario orientado a ingles, aunque no se confirma oficialmente.

El entrenamiento consistio en 3000 pasos con batch 4, learning rate 5e-5, peso de contenido 2 y semilla 71. El dataset combina 6000 ejemplos de copia, 492 de contenido, 480 benignos replicados tres veces, 40 de seguridad replicados cinco veces, 16 de autolesion replicados cinco veces y 96 pares de frontera. No se menciona uso de RLHF, DPO ni decodificacion especulativa. El enfasis esta en la "gramatica de claves" para tareas de copia y en filtros de seguridad autorales, no en capacidades generales de razonamiento o generacion.

## Capacidades

- Copia de cadenas y claves dentro de la gramatica entrenada: 86,0% exacto en tareas de 2 claves cortas, 75,5% en 3 claves y 48,5% exacto (58,5% key-copy) en 4 claves.
- Retencion de contenido: puntuacion de 0,703, superior a la base de 49 M.
- Respuestas utiles en consultas benignas: 93,4% en un conjunto de 136 casos.
- Filtros de seguridad: 40/40 en el conjunto de seguridad y 16/16 en el conjunto de autolesion.
- Suite de servidor: 20/21, con 5/5 en RAG con cita de fuente.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles; el tokenizer sugiere ingles.
- No se documenta razonamiento matematico, generacion de codigo ni conocimientos generales.

## Casos de uso

- Validacion de pipelines de copia de claves: el modelo puede usarse como referencia interna para comprobar que un sistema de extraccion de campos (por ejemplo, pares clave-valor en formularios) funciona dentro de una gramatica controlada, dado su 86,0% en 2 claves y 75,5% en 3 claves.
- Pruebas de retencion de contexto en sistemas RAG: con una puntuacion de retencion de 0,703 y 5/5 en RAG con cita de fuente, sirve para validar que un pipeline recupera y cita correctamente pasajes antes de escalar a modelos mayores.
- Filtros de seguridad en prototipos: sus 40/40 en seguridad y 16/16 en autolesion permiten usarlo como capa de cribado en entornos de laboratorio, siempre con revision humana (la propia model card lo exige).
- Evaluacion de "product suites" internas: el modelo actua como sujeto de prueba para validar el arnes de evaluacion del proyecto Atom Zero (checkpoint gate, product suite, server suite) antes de promover variantes mayores.
- Clasificacion y cribado de respuestas benignas: con 93,4% de utilidad en 136 casos, puede emplearse para etiquetar respuestas aceptables frente a rechazos en conjuntos pequenos y controlados.
- Baseline para experimentos de upcycling: investigadores pueden reproducir la interpolacion de 49 M a 63 M y medir el efecto en retencion y copia, ya que el autor publica el resumen de resultados y la documentacion del lote.
- Demostracion de despliegue de modelos minimos: con 0,3 GB de repo y pesos en `model.pt`, cabe en cualquier GPU consumer y sirve para probar cadenas de inferencia en PyTorch antes de migrar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (conjuntos autorales, no benchmarks publicos):

| Area | Resultado |
|---|---|
| Copia 2 claves cortas | 86,0% exacto |
| Copia 3 claves cortas | 75,5% |
| Copia 4 claves cortas | 48,5% exacto / 58,5% key-copy |
| Retencion de contenido | 0,703 |
| Utilidad benigna (136 casos) | 93,4% |
| Rechazo benigno | 6,6% |
| Seguridad (40 casos) | 40/40 |
| Filtro de autolesion (16 casos) | 16/16 |
| Checkpoint gate | pasa, promocionable |
| Product suite | pasa |
| Server suite | 20/21, 5/5 RAG con cita de fuente |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (63,4 M de parametros, ~254 MB de pesos mas activaciones y tokenizer); en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090) o incluso CPU para inferencia por lotes pequenos; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en todas las GPU con al menos 2 GB de VRAM; tambien en Raspberry Pi y entornos embebidos con PyTorch.
- Opciones de despliegue: el formato es `model.pt` (PyTorch), por lo que la via natural es `torch.load` con el `config.json` y el tokenizer BPE. No hay pesos GGUF, por lo que llama.cpp y Ollama no son compatibles sin conversion previa. vLLM y TGI no estan documentados para este modelo.
- Latencia y throughput: no disponibles. Por tamano, se espera latencia de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Atom Zero 63M balanced | 63,4 M | no disponible | Apache 2.0 | PyTorch (`model.pt`) | Enfoque en copia, retencion y seguridad autorales |
| Atom Zero 49M (fallback) | 49,2 M | no disponible | Apache 2.0 | PyTorch | Base previa, retencion inferior (0,703 en el 63M) |
| SmolLM-135M | 135 M | 2k tokens (aprox.) | Apache 2.0 | safetensors, GGUF | Modelo generalista de HuggingFace, con benchmarks publicos |
| GPT-2 small | 124 M | 1.024 tokens | MIT | safetensors, GGUF | Referencia historica de modelos pequenos |

La comparacion con SmolLM-135M y GPT-2 small es solo orientativa por tamano; Atom Zero 63M no publica resultados en benchmarks estandar, por lo que no es posible comparar rendimiento de forma directa. Los modelos generalistas citados tienen soporte multilingue y de codigo documentado, capacidades que Atom Zero 63M no declara.

## Limitaciones y advertencias

- La copia solo funciona dentro de la gramatica de claves entrenada; estilos de clave fuera de distribucion (OOD) fallan segun el propio autor.
- Las suites benigna y de seguridad son pantallas autorales, no benchmarks publicos; los porcentajes no son comparables con evaluaciones estandar.
- Las plantillas de autolesion son estrechas y las respuestas de crisis requieren revision humana obligatoria.
- Riesgo de alucinacion no evaluado; el modelo no declara capacidades de conocimiento general ni de razonamiento.
- Idiomas soportados no documentados; el tokenizer BPE de 8k sugiere un enfoque en ingles, con riesgo de bajo rendimiento en castellano u otras lenguas.
- Longitud de contexto no disponible; no apto para conversaciones multi-turno largas sin validacion previa.
- Sin soporte documentado de tool calling, function calling ni agentes; no usar en pipelines que dependan de esas capacidades.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo no ha pasado evaluaciones externas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- Formato de pesos `model.pt` requiere `torch.load`, lo que implica confiar en el origen del fichero; no hay version safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byjameson/atom-zero-63m-balanced
- Resumen de resultados (variant_j_summary.json): https://github.com/byjameson/atom-zero/blob/main/research/results/variant_j_summary.json
- Documentacion del lote 1.5.0: https://github.com/byjameson/atom-zero/blob/main/docs/BATCH_1.5.0.md
- Repositorio del proyecto: https://github.com/byjameson/atom-zero
