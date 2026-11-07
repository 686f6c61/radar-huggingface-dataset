# banyohavlusu23/Obsessive-1.7B-GGUF

## Resumen
Obsessive-1.7B-GGUF es la version cuantizada en formato GGUF de Obsessive-1.7B, un modelo de lenguaje de 1.728 millones de parametros desarrollado por banyohavlusu23 y afinado a partir de LiquidAI/LFM3-1.7B. Su proposito es muy concreto: actuar como subagente de investigacion web que responde preguntas factuales con una respuesta corta, una cita literal y la URL de la fuente, y que admite explicitamente "Not found in the search results." cuando no encuentra evidencia. El modelo resuelve el problema de la fabricacion de datos en tareas de web-QA: en lugar de generar respuestas plausibles sin respaldo, devuelve unicamente aquello que puede citar palabra por palabra de los resultados de busqueda.

Tecnicamente es un transformer denso de 1.700 millones de parametros, con licencia LFM Open License v1.0 y entrenamiento exclusivamente en ingles. Se distribuye como un unico fichero `Obsessive-1.7B-Q4_K_M.gguf` de 1,1 GB, pensado para ejecutarse en GPU de portatil (el autor reporta unos 2 segundos por pregunta en una RTX 4060 Laptop). La longitud de contexto no se especifica en la informacion disponible, aunque el ejemplo de despliegue del autor usa `-c 16384`.

Su relevancia actual radica en el patron de uso: no compite como modelo generalista, sino como componente especializado dentro de arquitecturas multiagente, donde un agente mayor delega preguntas factuales aisladas a este modelo pequeno, barato y con comportamiento de abtencion calibrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de LiquidAI/LFM3-1.7B); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue del autor usa 16384 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico fichero publicado) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (other); uso comercial no licenciado para entidades con ingresos anuales de 10 M USD o superiores |
| Formato de pesos | GGUF (`Obsessive-1.7B-Q4_K_M.gguf`); pesos completos en safetensors en el repo base |

## Arquitectura y entrenamiento
El modelo parte de LiquidAI/LFM3-1.7B, un transformer denso de 1.700 millones de parametros, y se obtiene mediante un fine-tune LoRA de rango 16 sobre aproximadamente 9.000 conversaciones de tool calling. Cada conversacion tiene la estructura pregunta, llamada a `web_search`, resultados de busqueda y respuesta final en el formato Answer / Evidence / Source. El autor indica que cada respuesta y cada cita fueron verificadas para aparecer literalmente en sus resultados, y que alrededor de una cuarta parte de las conversaciones ensenan el comportamiento de abtencion ("not found"), construidas eliminando de la pagina la frase que contiene la respuesta. Para evitar dependencia de un harness concreto, se variaron los disenos de resultados, los nombres de herramientas y los system prompts.

Los datos de entrenamiento combinan paginas de Wikipedia (CC BY-SA 4.0) y FineWeb (ODC-By 1.0) como resultados de busqueda, hechos de Wikidata (CC0) y preguntas generadas por Qwen3.8-Flash-Next y Ling-3.0-tiny ejecutados localmente. SimpleQA (MIT) se uso unicamente para evaluacion. No se emplearon datos de APIs de busqueda comerciales. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades
- Generacion de texto conversacional en ingles con formato estructurado de tres lineas: Answer, Evidence (cita literal) y Source (URL).
- Tool calling estilo OpenAI: invoca la herramienta `web_search` que proporcione el harness, sin implementar busqueda propia.
- Respuesta fundamentada (grounded): las citas se copian palabra por palabra de los resultados devueltos por la herramienta.
- Abtencion explicita: devuelve "Not found in the search results." cuando la evidencia no esta presente.
- Resolucion de peticiones multi-hecho: el autor reporta 40/40 peticiones del tipo "encuentra estos hechos sobre X" resueltas en su prueba con busqueda en vivo.
- Integracion como subagente en Pi, OpenCode y Hermes mediante configuraciones incluidas en el repositorio.
- No soporta vision, audio, razonamiento extendido, analisis de opiniones ni generacion de informes largos.

## Casos de uso
- Subagente de verificacion factual en pipelines multiagente: un agente planificador delega preguntas atomicas a Obsessive-1.7B, que devuelve valor, cita y URL; el bajo coste por consulta (1,1 GB de VRAM en Q4_K_M) permite ejecutarlo en paralelo con el agente principal en la misma GPU.
- Enriquecimiento de bases de conocimiento con procedencia: dado un listado de entidades y atributos (por ejemplo, fundacion, sede y consejero delegado de una empresa), el modelo devuelve cada valor con su cita y fuente, lo que permite auditar y descartar entradas sin respaldo.
- Control de alucinaciones en respuestas de atencion al cliente: ante una pregunta sobre politicas o datos corporativos indexados, el modelo solo responde si el texto recuperado contiene la respuesta, y en caso contrario escala con "not found", reduciendo el riesgo de afirmaciones no verificadas.
- Automatizacion de research ligero en CI o cron: scripts sin framework (el repo incluye `examples/research.py`) que consultan fuentes publicas y generan registros con cita y URL para revision humana.
- Evaluacion y monitorizacion de la calidad de un motor de busqueda: al medir la tasa de "not found" y de citas correctas sobre un conjunto fijo de preguntas se obtiene una senal directa de si los snippets recuperados contienen la respuesta.
- Prototipado en hardware de consumo: con 1,1 GB en Q4_K_M y unos 2 segundos por pregunta en una RTX 4060 Laptop, sirve para validar flujos de investigacion agentica en portatiles antes de escalar a modelos mayores.
- Extraccion de datos estructurados con trazabilidad: conversion de preguntas factuales en tripletas valor-fuente para tablas o grafos, donde la columna de evidencia actua como prueba de origen.

## Benchmarks y rendimiento
Resultados publicados por el autor. `web-qa-1` es un benchmark propio de 131 preguntas de SimpleQA con resultados de busqueda fijos, de las cuales 29 no contienen la respuesta a proposito. La prueba de busqueda en vivo usa 120 preguntas adicionales y 40 peticiones multi-hecho contra la API de Wikipedia.

| Metrica (web-qa-1, 131 preguntas) | LFM3-1.7B (base) | Obsessive-1.7B |
|---|---|---|
| Encuentra la respuesta cuando esta en los resultados | 50% | 94% |
| Sus respuestas son correctas | 87% | 98% |
| Dice "not found" cuando la respuesta no esta | 0% | 100% |
| Respuestas inventadas (no presentes en los resultados) | 10% | 0% |
| Usa el formato Answer / Evidence / Source | 0% | 100% |
| Mediana de segundos por pregunta (RTX 4060 Laptop) | 5,1 | 2,0 |

| Metrica (busqueda en vivo, 120 + 40 peticiones) | LFM3-1.7B (base) | Obsessive-1.7B |
|---|---|---|
| Devuelve alguna respuesta (no vacia) | 38% | 100% |
| Respuesta correcta en algun punto de la respuesta | 37/120 | 24/120 |
| Citas copiadas literalmente de los resultados | n/a (sin citas) | 100% |
| Peticiones multi-hecho resueltas | 1/40 | 40/40 |
| Valores factuales inventados | 4 de 4 | 3 de 52 |
| Mediana de segundos por pregunta | 14,8 | 4,9 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 1,1 GB para el fichero Q4_K_M, mas el coste del contexto KV; con 16.384 tokens de contexto el consumo total se mantiene holgadamente por debajo de 4 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM; el autor cita una RTX 4060 Laptop como referencia (2,0 s de mediana por pregunta en web-qa-1).
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; tambien es viable en CPU por el reducido tamano del modelo.
- Opciones de despliegue: `llama-server` con `--jinja` (obligatorio, la plantilla de chat gestiona las llamadas a herramientas) y `-c 16384`, exponiendo un endpoint compatible con OpenAI en `/v1`; integraciones listas para Pi, OpenCode y Hermes en el repositorio; script de ejemplo sin framework en `examples/research.py`.
- Parametros de inferencia: temperatura 0 recomendada por el autor.
- Latencia y throughput: mediana de 2,0 s por pregunta con resultados fijos y 4,9 s con busqueda en vivo en una RTX 4060 Laptop; no se dispone de datos de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Obsessive-1.7B-GGUF | 1,73 B | no disponible | Web-QA con citas y abtencion | LFM Open License v1.0 (restriccion comercial a partir de 10 M USD de ingresos) | GGUF en Hugging Face |
| LFM3-1.7B (base) | 1,7 B | no disponible | Modelo generalista de Liquid AI | LFM Open License v1.0 | Pesos completos en Hugging Face |
| Modelos generalistas de ~1,7 B (Qwen, Llama, Gemma) | ~1,5-2 B | variable, no disponible en esta ficha | Chat, codigo y razonamiento general | varian (Apache 2.0, licencias comunitarias) | amplia disponibilidad en GGUF |

Frente a su modelo base, Obsessive-1.7B mejora la tasa de respuestas correctas (98% frente a 87%), elimina las respuestas inventadas en el benchmark fijo (0% frente a 10%) y resuelve 40/40 peticiones multi-hecho frente a 1/40, a costa de una menor cobertura de respuestas correctas en busqueda en vivo (24/120 frente a 37/120 del base). No se dispone de datos comparativos con modelos especializados equivalentes de otros autores.

## Limitaciones y advertencias
- Una pregunta por conversacion: las conversaciones largas con seguimientos confunden al modelo; debe iniciarse un hilo nuevo por pregunta o usarlo como subagente.
- Reporta afirmaciones como hechos: si la fuente dice "X afirma haber resuelto Y", el modelo puede responder "Si"; es necesario revisar la linea de evidencia.
- Exceso de precaucion: aproximadamente 1 de cada 10 respuestas presentes en los resultados se marca como "not found".
- Respuestas con hecho vecino: puede devolver un dato proximo (por ejemplo, el ganador de otro ano); la cita es real pero responde a una pregunta ligeramente distinta.
- Busca una sola vez y rara vez reformula la consulta; no es adecuado para analisis, opiniones ni informes largos.
- Solo ingles; no soporta otros idiomas.
- Depende de la calidad de los snippets: fragmentos mas largos producen mejores respuestas que resumenes de una linea.
- Licencia: uso comercial no licenciado para entidades con ingresos anuales iguales o superiores a 10 M USD; requiere ademas cumplir los terminos de la LFM Open License v1.0 del modelo base.
- Riesgo residual de invencion: 3 de 52 valores factuales no presentes en los resultados en la prueba de busqueda en vivo.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; madurez y mantenimiento no verificables.

## Enlaces
- Modelo GGUF en Hugging Face: https://huggingface.co/banyohavlusu23/Obsessive-1.7B-GGUF
- Pesos completos (safetensors): https://huggingface.co/banyohavlusu23/Obsessive-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/banyohavlusu23/Obsessive-1.7B-GGUF/blob/main/LICENSE
- Herramienta de busqueda para Pi: https://www.npmjs.com/package/pi-web-access
- SimpleQA (evaluacion): https://github.com/openai/simple-evals
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Wikidata: https://www.wikidata.org
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia ODC-By 1.0: https://opendatacommons.org/licenses/by/1-0/
