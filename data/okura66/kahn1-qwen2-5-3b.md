# Okura66/Kahn1-Qwen2.5-3B

## Resumen

Kahn1-Qwen2.5-3B es un modelo de 3.085.938.688 parÃ¡metros desarrollado por Okura66 como motor de decisiÃ³n de "Sistema 1", en homenaje a la obra de Daniel Kahneman *Thinking, Fast and Slow*. Se trata de un ajuste fino de Qwen/Qwen2.5-3B-Instruct orientado a tareas de decisiÃ³n estructurada: categorizaciÃ³n multi-clase, puntuaciÃ³n ordinal continua y verificaciÃ³n binaria. Su rasgo diferencial es que no genera texto libre ni construye JSON de forma autorregresiva; en su lugar predice la decisiÃ³n directamente a nivel de logit del token bajo restricciones estructurales estrictas.

El modelo estÃ¡ pensado para escenarios de alto rendimiento donde la fiabilidad del formato es crÃtica. SegÃºn la ficha del autor, garantiza un 0,0Â % de errores de sintaxis o de esquema "por construcciÃ³n", consume aproximadamente 1,26Â GB de VRAM y deja mÃ¡s de 14,5Â GB libres para cachÃ© KV en una GPU de 16Â GB, lo que permite batching concurrente masivo. Con integraciÃ³n nativa de prefix caching en vLLM, el autor reporta latencias por debajo de 60Â ms.

La relevancia actual del modelo radica en su enfoque de "decision engine" calibrado: produce probabilidades con sentido (ECE de 0,0176 global) y puntuaciones ordinales continuas mediante esperanza matemÃ¡tica, lo que facilita umbrales y gating automÃ¡tico en pipelines de producciÃ³n. La informaciÃ³n disponible no detalla la longitud de contexto ni los esquemas de cuantizaciÃ³n soportados, y la bÃºsqueda web no ha devuelto resultados tÃ©cnicos relevantes sobre este modelo.

## Especificaciones tÃ©cnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino del instructivo Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 (~3,09Â B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de vLLM usa `max_model_len=1024` |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) y frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`); adaptador LoRA independiente de 239Â MB |
| Tamano del repositorio | 6,2Â GB |
| Pipeline declarado | text-classification |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion / actualizacion | 20-09-2026 / 20-09-2026 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3,09Â mil millones de parÃ¡metros. El ajuste fino se realizÃ³ sobre una mezcla multi-tarea equilibrada que combina tres tipos de decisiÃ³n: categorizaciÃ³n multi-clase, puntuaciÃ³n ordinal continua y verificaciÃ³n binaria. La innovaciÃ³n tÃ©cnica central es que el modelo elimina la generaciÃ³n de texto y el parseo autorregresivo de esquemas JSON; la decisiÃ³n se predice directamente sobre los logits del token bajo restricciones estructurales, lo que, segÃºn el autor, garantiza por construcciÃ³n la validez del formato de salida.

El entrenamiento incorpora probabilidades calibradas mediante escalado de temperatura post-hoc, con valores reportados de $T_{\text{choice}} = 1{,}231$, $T_{\text{score}} = 1{,}122$ y $T_{\text{noul}} = 1{,}017$. La evaluaciÃ³n utiliza "permutation debiasing" con $k=3$ para reducir el sesgo posicional en las preguntas de opciÃ³n mÃºltiple. En tareas ordinales, el modelo calcula la esperanza continua de la puntuaciÃ³n mediante $\mathbb{E}[\text{Score}] = \sum i \cdot p_i$, lo que permite consumir decisiones como valores continuos en lugar de categorÃas discretas. La informaciÃ³n disponible no detalla el nÃºmero de tokens de entrenamiento, la composiciÃ³n completa del dataset ni si se emplearon tÃ©cnicas adicionales como RLHF o DPO.

## Capacidades

- ClasificaciÃ³n multi-clase de opciÃ³n cerrada: 77 clases en Banking77 y 60 clases en MASSIVE, con decisiones a nivel de logit y sin generaciÃ³n de texto.
- PuntuaciÃ³n ordinal continua: cinco niveles en SST-5, con salida de esperanza matemÃ¡tica adecuada para umbrales y gating automÃ¡tico.
- VerificaciÃ³n binaria: tareas de comprobaciÃ³n de sÃ/no integradas en la mezcla multi-tarea.
- Probabilidades calibradas: confianza consumible directamente, con ECE global de 0,0176.
- Salida estructurada garantizada: 0,0Â % de errores de sintaxis o esquema por construcciÃ³n.
- EjecuciÃ³n en modo zero-shot sobre los conjuntos evaluados.
- Capacidades multilingÃ¼es limitadas a inglÃ©s y francÃ©s.
- IntegraciÃ³n con vLLM, incluyendo prefix caching para amortizar el estado del documento entre preguntas.
- Compatibilidad declarada con endpoints y con `text-embeddings-inference` segÃºn las etiquetas del repositorio.
- No se documentan capacidades de tool calling, agentes, visiÃ³n, audio ni razonamiento multi-paso.

## Casos de uso

- ClasificaciÃ³n de intenciones en atenciÃ³n al cliente: con 91,48Â % de exactitud en Banking77 sobre 3.076 ejemplos, el modelo puede etiquetar la intenciÃ³n de un mensaje entre 77 clases de banca sin riesgo de romper el esquema de salida.
- Enrutamiento de tickets y colas de soporte: la salida calibrada permite dirigir cada consulta a un equipo concreto usando umbrales de confianza, evitando el coste de parsear JSON generado.
- AnÃ¡lisis de sentimiento con gradiente continuo: en SST-5 el modelo devuelve una puntuaciÃ³n esperada (por ejemplo 3,65 sobre 4,0) que sirve para detectar matices entre categorÃas adyacentes.
- ModeraciÃ³n y verificaciÃ³n de contenido: la tarea de verificaciÃ³n binaria permite construir comprobaciones de sÃ/no sobre texto entrante con confianza calibrada.
- PriorizaciÃ³n por urgencia: con la pregunta de tipo `ScoreQuestion`, se puede puntuar la urgencia de una incidencia y ordenar automÃ¡ticamente la cola de trabajo.
- ClasificaciÃ³n de temas multilingÃ¼e: con 91,49Â % en MASSIVE (60 clases) cubre inglÃ©s y francÃ©s en un mismo motor de decisiÃ³n.
- Gating automÃ¡tico en pipelines de datos: al producir puntuaciones continuas y probabilidades calibradas, el modelo se puede usar como filtro de calidad o de decisiÃ³n en flujos ETL.
- Procesamiento de alto throughput con vLLM: el bajo uso de VRAM y el prefix caching permiten atender muchas consultas concurrentes sobre un mismo documento base, con 14,1 consultas por segundo reportadas bajo $k=3$ de debiasing.

## Benchmarks y rendimiento

Resultados del holdout completo no visto (8.260 ejemplos), con permutation debiasing ($k=3$) y temperaturas calibradas:

| Tarea / Dataset | Tipo de evaluacion | Muestras | Exactitud | ECE (15 bins) | Brier | Spearman $\rho$ | Off-by-one ($\pm 1$) |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Banking77 | Eleccion multi-clase (77 clases) | 3.076 | 91,48Â % | 0,0147 | 0,1298 | â€” | â€” |
| MASSIVE | Eleccion multi-clase (60 clases) | 2.974 | 91,49Â % | 0,0157 | 0,1253 | â€” | â€” |
| SST-5 | Ordinal continuo (5 niveles) | 2.210 | 49,00Â % | 0,0613 | 0,6130 | 0,841 | 95,79Â % |
| Global Holdout | Benchmark unificado | 8.260 | 80,12Â % | 0,0176 | 0,2575 | â€” | â€” |

Latencia reportada: p50 = 58,6Â ms, p95 = 96,5Â ms, throughput real de 14,1 consultas por segundo bajo $k=3$ de debiasing en una Ãºnica RTX 5070 Ti.

## Requisitos de hardware

- VRAM de inferencia: aproximadamente 1,26Â GB segÃºn la ficha del autor.
- En una GPU de 16Â GB, el modelo deja mÃ¡s de 14,5Â GB libres para cachÃ© KV, lo que habilita batching concurrente de gran tamaÃ±o.
- GPU de referencia en las pruebas: RTX 5070 Ti (consumer), donde se midiÃ³ el throughput de 14,1 consultas por segundo.
- Cabe en GPU de consumo: sÃ, dado el reducido uso de memoria del modelo base de 3Â B.
- Opciones de despliegue: vLLM (con prefix caching), `transformers` y `text-embeddings-inference` segÃºn las etiquetas; compatibilidad declarada con endpoints.
- Latencia: p50 de 58,6Â ms y p95 de 96,5Â ms bajo debiasing $k=3$.
- No se proporcionan datos de VRAM para cuantizaciones distintas de `safetensors`, ni requisitos para GPU de centros de datos (A100, H100).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-5 (exact match) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kahn1-Qwen2.5-3B | 3,09Â B | No disponible | 49,00Â % (off-by-one 95,79Â %) | Apache 2.0 | HuggingFace + GitHub |
| Modelos RoBERTa especializados | No disponible | No disponible | 50-54Â % (segun la ficha del autor) | No disponible | No disponible |
| LLMs frontera | No disponible | No disponible | 50-54Â % (segun la ficha del autor) | No disponible | No disponible |
| Qwen/Qwen2.5-3B-Instruct (base) | ~3,09Â B | No disponible | No disponible | Apache 2.0 | HuggingFace |

La ficha sitÃºa el techo de acuerdo inter-anotador humano en SST-5 en torno al 55-60Â % y seÃ±ala que tanto LLM frontera como modelos RoBERTa especializados se estancan en el 50-54Â % de coincidencia exacta, lo que enmarca el 49,00Â % de Kahn1 en ese rango. No se dispone de comparativas directas con otros motores de decisiÃ³n equivalentes.

## Limitaciones y advertencias

- Cobertura lingÃ¼Ãstica limitada a inglÃ©s y francÃ©s; no se declaran otros idiomas.
- El modelo estÃ¡ diseÃ±ado para tareas de decisiÃ³n cerrada, no para generaciÃ³n de texto libre ni diÃ¡logo abierto.
- La exactitud en SST-5 es del 49,00Â %, sensiblemente inferior al 80,12Â % del holdout global; el propio autor reconoce la subjetividad inherente a las categorÃas finas.
- Posible sesgo posicional en preguntas de opciÃ³n mÃºltiple, mitigado con permutation debiasing ($k=3$) pero con coste de latencia y throughput.
- Riesgo de alucinaciÃ³n no evaluado de forma explÃcita en la informacion proporcionada; al no generar texto, el riesgo de contenido inventado se reduce, pero no se documenta su comportamiento fuera de distribuciÃ³n.
- Las probabilidades calibradas dependen de temperaturas concretas ($T_{\text{choice}} = 1{,}231$, $T_{\text{score}} = 1{,}122$, $T_{\text{noul}} = 1{,}017$); usarlas sin aplicar dichas temperaturas invalida la calibraciÃ³n.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de los tÃ©rminos del modelo base Qwen2.5-3B-Instruct.
- El repositorio tiene 0 descargas y 1 like, y la fecha indicada es septiembre de 2026; se trata de un modelo con muy poca validaciÃ³n externa.
- No se detallan los tipos de cuantizaciÃ³n soportados ni la longitud mÃ¡xima de contexto del modelo ajustado.
- La bÃºsqueda web no ha devuelto informaciÃ³n tÃ©cnica adicional ni validaciones independientes del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Okura66/Kahn1-Qwen2.5-3B
- Adaptador LoRA (239Â MB): https://huggingface.co/Okura66/Kahn1-Qwen2.5-3B-LoRA
- Repositorio GitHub del framework Kahn1 (SysOne): https://github.com/Okura66/kahn1
- Licencia del repositorio: https://github.com/Okura66/kahn1/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web.
