# Horizon-Labs/hallucination-guard-base

## Resumen

Hallucination Guard (base, 308M) es un clasificador multilingüe de "groundedness" desarrollado por Horizon-Labs. Dado un texto fuente (documentos recuperados, una transcripción, el resultado de una herramienta) y una respuesta o afirmación generada por IA, el modelo predice si esa respuesta está respaldada por la fuente, con dos etiquetas posibles: `SUPPORTED` (1) y `UNSUPPORTED` (0). La puntuación asociada a `SUPPORTED` se interpreta como probabilidad de soporte. No es un generador de texto: es un componente de verificación pensado para colocarse detrás de un LLM.

El problema que resuelve es el de las alucinaciones en pipelines RAG, resúmenes y agentes: respuestas que añaden, modifican o contradicen hechos presentes en el contexto recuperado. Frente a soluciones monolingües, su propuesta diferencial es la cobertura de idiomas (entrenado con datos en 30 idiomas según la model card, 19 códigos declarados en la metadata) manteniendo el rendimiento respecto a su puntuación en inglés, mientras que verificadores solo en inglés se degradan. Incluye pesos en safetensors y ONNX, y una demo ejecutable en el navegador vía transformers.js.

Técnicamente es un encoder de 307.531.778 parámetros (unos 308M) derivado de jhu-clsp/mmBERT-base, la variante multilingüe de la familia ModernBERT. Soporta una ventana de 8.000 tokens (fue entrenado con 2.000) y se distribuye con licencia Apache-2.0 sin gating. Es relevante ahora porque el coste de despliegue es mínimo (cabe en CPU y en cualquier GPU de consumo) y porque se publica junto a sus limitaciones explícitas: en verificación de afirmaciones en inglés (LLM-AggreFact) pierde frente a MiniCheck y HHEM, y su ventaja se concentra en otros idiomas y en tareas de QA y diálogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (familia ModernBERT / mmBERT), clasificador NLI binario |
| Parametros totales | 307.531.778 (aproximadamente 308M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 8.000 tokens (entrenado a 2.000; las fuentes largas pueden trocearse) |
| Tipos de cuantizacion | No se publican pesos cuantizados (sin GGUF, AWQ ni GPTQ en el repositorio). Se incluyen safetensors y ONNX; la etiqueta automatica de HuggingFace indica `base_model:quantized:jhu-clsp/mmBERT-base`. Al ser 308M, la cuantizacion a fp16/int8 es viable por cuenta propia |
| Idiomas soportados | La model card indica 30 idiomas de entrenamiento; la metadata declara 19 codigos concretos: en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th, mas la etiqueta `multilingual` |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (compatible con transformers.js) |

Otros datos: pipeline `text-classification`, libreria `transformers`, tamano del repositorio 3,1 GB, modelo base `jhu-clsp/mmBERT-base`, datasets declarados `wandb/RAGTruth-processed` y `alisawuffles/WANLI`. Repositorio creado y actualizado el 24 de septiembre de 2026.

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, construido sobre `jhu-clsp/mmBERT-base`, la variante multilingüe de dicha arquitectura. Sobre esa base se ha entrenado una cabeza de clasificacion de inferencia de lenguaje natural (NLI) con dos clases: `UNSUPPORTED` (0) y `SUPPORTED` (1). La entrada se compone de un par de textos donde el primero es siempre la fuente y el segundo la respuesta o afirmacion a verificar. El modelo se entreno con una ventana de 2.000 tokens, pero se distribuye y evalua con una ventana utilizable de 8.000 tokens. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (poco habituales en un clasificador, no en un generador).

Los datos declarados son `wandb/RAGTruth-processed` (utilizado en su particion de entrenamiento, con evaluacion sobre el split de test de RAGTruth) y `alisawuffles/WANLI`, junto con datos sinteticos generados con modelos Qwen. La model card indica que el entrenamiento se hizo con datos de licencia permisiva. La innovacion destacable no es arquitectonica sino de cobertura: el modelo mantiene su nivel de acierto en ingles cuando se evalua sobre HaluEval traducido a otros idiomas, mientras los verificadores solo en ingles caen de forma acusada. Tambien se distribuye una variante pequena de 141M parametros con el mismo proposito. La model card advierte de un sesgo metodologico en la evaluacion multilingue: las traducciones de HaluEval se generaron con la misma familia de modelos empleada para los datos sinteticos de entrenamiento, lo que puede favorecer al modelo.

## Capacidades

- Clasificacion binaria de soporte factual: determina si una afirmacion o respuesta esta respaldada por una fuente dada (etiquetas `SUPPORTED` / `UNSUPPORTED`, con probabilidad de soporte).
- Verificacion a nivel de frase: dividiendo la respuesta en oraciones y puntuando cada una contra la fuente, permite localizar que frase concreta no esta soportada, no solo marcar la respuesta completa.
- Puntuacion a nivel de respuesta: la model card recomienda tomar el minimo de las puntuaciones por frase como medida agregada.
- Procesamiento de contexto largo: ventana de 8.000 tokens, con opcion de trocear fuentes mayores y agregar resultados.
- Multilingue: cobertura declarada de 30 idiomas, con evaluacion publicada en ingles, aleman, espanol, chino, japones, arabe e hindi.
- Uso como guardrail en pipelines de agentes y RAG: forma parte de la coleccion Agent I/O Guards junto a comprobadores de inyeccion de prompt y de PII.
- Respuesta a preguntas y fundamentacion en dialogo: es donde obtiene sus mejores resultados relativos (HaluEval QA 0.817, HaluEval dialogo 0.645, RAGTruth a nivel de respuesta 0.821).
- Despliegue ligero: inferencia en CPU, en GPU de consumo y en navegador mediante ONNX y transformers.js.
- No dispone de: generacion de texto, tool calling, capacidades de agente, vision, audio ni modo de razonamiento explicito. Es exclusivamente un clasificador.

## Casos de uso

- Guardrail de groundedness en RAG: colocado detras de un sistema de recuperacion y generacion, verifica cada respuesta contra los fragmentos recuperados antes de mostrarla al usuario. Con 8.000 tokens de ventana admite varios documentos concatenados como fuente, y si la respuesta es larga se puntua por frases y se toma el minimo.
- Deteccion de frases no soportadas en resumenes: en lugar de descartar un resumen completo, se puntua oracion a oracion contra el documento original y se marca en rojo exactamente la frase que introduce un dato que no aparece en la fuente. Es util en resumenes de informes, actas o articulos.
- Verificacion de salidas de agentes y de resultados de herramientas: cuando un agente invoca una API y redacta una conclusion a partir del JSON devuelto, el modelo comprueba que la conclusion se sostiene sobre el resultado de la herramienta, evitando que el agente "invente" campos o cifras.
- Auditoria automatica de respuestas de LLM a escala: dado un conjunto de pares (contexto, respuesta) se puede etiquetar masivamente que respuestas estan fundamentadas, generando metricas de groundedness por version de modelo, por prompt o por idioma. Sirve como complemento cuantitativo a la evaluacion manual.
- Control de calidad en atencion al cliente multilingue: en entornos donde el bot responde en aleman, espanol, arabe o japones a partir de una base de conocimiento, el modelo verifica la respuesta contra el articulo de la base sin necesidad de un verificador distinto por idioma.
- Fact-checking sobre transcripciones: en el escenario de TofuEval (actas de reunion y articulos de medios), comparar las afirmaciones extraidas de una transcripcion o de un texto periodistico contra la fuente original para detectar discrepancias.
- Generacion y filtrado de datos sinteticos: usar el modelo para etiquetar pares (fuente, afirmacion) como soportados o no soportados durante la construccion de datasets de entrenamiento o de evaluacion de groundedness.
- Despliegue en el navegador o en el borde: con los pesos ONNX y transformers.js, la verificacion puede ejecutarse en el cliente sin enviar el contexto a un servidor, lo que resulta util cuando la fuente contiene datos sensibles. La demo oficial funciona en el navegador.

## Benchmarks y rendimiento

Los resultados proceden de la model card. La metrica es balanced accuracy con umbral 0,5 y todas las evaluaciones fueron ejecutadas por los autores con el mismo script. La daga (†) marca conjuntos dentro de la distribucion de entrenamiento del modelo (se entreno con el split de train de RAGTruth y se evalua sobre su split de test).

LLM-AggreFact (verificacion de afirmaciones en ingles, 11 datasets, hasta 1.000 ejemplos por conjunto):

| Conjunto | Este modelo (308M) | Small (141M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| AggreFact-CNN | 0,581 | 0,607 | **0,664** | 0,622 | 0,629 |
| AggreFact-XSum | 0,667 | 0,644 | **0,709** | 0,688 | 0,706 |
| ClaimVerify | 0,691 | 0,682 | **0,783** | 0,744 | 0,753 |
| ExpertQA | 0,563 | 0,553 | **0,606** | 0,597 | 0,568 |
| FactCheck-GPT | 0,686 | 0,657 | **0,754** | 0,728 | 0,729 |
| LFQA | 0,764 | 0,726 | **0,863** | 0,838 | 0,839 |
| RAGTruth † | **0,807** | 0,796 | 0,788 | 0,773 | 0,734 |
| Reveal | 0,821 | 0,798 | **0,896** | 0,871 | 0,865 |
| TofuEval-MediaS | 0,691 | 0,654 | **0,696** | 0,676 | 0,679 |
| TofuEval-MeetB | 0,703 | 0,677 | **0,765** | 0,724 | 0,721 |
| Wice | 0,693 | 0,719 | 0,717 | 0,664 | **0,751** |
| **Media** | 0,697 | 0,683 | **0,749** | 0,721 | 0,725 |

Multilingue: HaluEval QA y dialogo traducidos (400 elementos por idioma):

| Idioma | Este modelo | Small (141M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| Ingles | **0,754** | 0,657 | 0,589 | 0,670 | 0,701 |
| Aleman | **0,756** | 0,719 | 0,691 | 0,672 | 0,670 |
| Espanol | **0,749** | 0,691 | 0,650 | 0,675 | 0,675 |
| Chino | **0,762** | 0,713 | 0,627 | 0,621 | 0,546 |
| Japones | **0,772** | 0,729 | 0,626 | 0,669 | 0,546 |
| Arabe | **0,736** | 0,700 | 0,616 | 0,691 | 0,544 |
| Hindi | **0,756** | 0,730 | 0,595 | 0,670 | 0,564 |
| **Media de los 6 idiomas no ingleses** | **0,755** | 0,714 | 0,634 | 0,666 | 0,591 |

Otros benchmarks:

| Conjunto | Este modelo | Small (141M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| HaluEval QA | **0,817** | 0,691 | 0,635 | 0,768 | 0,762 |
| HaluEval dialogo | **0,645** | 0,643 | 0,522 | 0,524 | 0,625 |
| HaluEval resumen | 0,574 | 0,548 | **0,648** | 0,623 | 0,526 |
| RAGTruth test, nivel de respuesta † | **0,821** | 0,798 | 0,604 | 0,626 | 0,750 |

Notas metodologicas de la propia model card: MiniCheck uso troceado de contexto con maximo sobre fragmentos, como hace su propia libreria, y HHEM uso contextos limitados a 12.000 caracteres porque agotaba memoria en los documentos mas largos.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 1,23 GB (307,5M parametros x 4 bytes). Con una ventana de 8.000 tokens hay que sumar activaciones, de modo que una estimacion prudente de VRAM en fp32 es del orden de 1,5 a 2 GB.
- Pesos en fp16/bf16: aproximadamente 615 MB; la VRAM total se situa en torno a 1 GB o menos.
- Pesos en int8: aproximadamente 308 MB; el modelo cabe holgadamente en cualquier GPU moderna y en memoria de sistema.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU de consumo (serie RTX 30/40, incluso modelos con 4-6 GB) es suficiente. Tambien es viable en una A100 o H100 si se despliega como servicio con muchas peticiones concurrentes, pero no es necesario para el modelo en si.
- CPU: es un caso de uso realista, dado el tamano (308M) y la compatibilidad con ONNX Runtime.
- Navegador: los pesos ONNX y transformers.js permiten ejecucion en el cliente, como demuestra la demo oficial.
- Opciones de despliegue: pipeline de `transformers` (con soporte de pares texto/par, `truncation` y `max_length`), ONNX Runtime, transformers.js, y los endpoints compatibles indicados en la metadata del repositorio. La etiqueta `text-embeddings-inference` aparece en la metadata del modelo, aunque su tarea principal es clasificacion de texto. No se documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado cifras oficiales de latencia ni de tokens por segundo en la informacion disponible. Al ser un encoder de 308M con salida de una sola etiqueta, el coste por par evaluado es bajo en terminos relativos, pero se trata de una apreciacion cualitativa y no de un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media LLM-AggreFact (ingles) | Media 6 idiomas no ingleses | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hallucination Guard base | 308M | 8.000 tokens (entrenado a 2.000) | 0,697 | **0,755** | Apache-2.0 | Abierta, sin gating, safetensors y ONNX |
| Hallucination Guard small | 141M | No disponible | 0,683 | 0,714 | No disponible | Referenciado en la model card como variante pequena |
| MiniCheck-RoBERTa-L | No disponible | No disponible | **0,749** | 0,634 | No disponible | No disponible en la informacion proporcionada |
| MiniCheck-DeBERTa-L | No disponible | No disponible | 0,721 | 0,666 | No disponible | No disponible en la informacion proporcionada |
| HHEM-2.1-open | No disponible | En la evaluacion de los autores se limito a 12.000 caracteres por memoria | 0,725 | 0,591 | No disponible | No disponible en la informacion proporcionada |

Lectura de la comparativa: en ingles puro, MiniCheck-RoBERTa-L y HHEM-2.1-open superan a este modelo en la media de LLM-AggreFact. La ventaja de Hallucination Guard aparece en cobertura multilingue (0,755 de media en los 6 idiomas no ingleses frente a 0,634 del mejor MiniCheck y 0,591 de HHEM), en RAGTruth a nivel de respuesta (0,821) y en HaluEval QA (0,817). MiniCheck sigue siendo mejor en HaluEval de resumen (0,648 frente a 0,574). Los datos de licencia y disponibilidad de los modelos alternativos no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Verificacion limitada a la fuente: el modelo juzga el soporte unicamente respecto al texto fuente aportado. No es un comprobador de hechos con conocimiento del mundo; una afirmacion verdadera que no aparezca en la fuente se etiqueta como `UNSUPPORTED`. Esto genera falsos positivos si la fuente recuperada es incompleta.
- Rendimiento inferior en verificacion de afirmaciones en ingles: en LLM-AggreFact obtiene 0,697 de media, por debajo de MiniCheck-RoBERTa-L (0,749) y HHEM-2.1-open (0,725). Si el caso de uso es exclusivamente en ingles, la propia model card recomienda comparar alternativas sobre los datos propios.
- Rendimiento flojo en resumen: HaluEval de resumen es su peor resultado relativo (0,574, por debajo de MiniCheck-RoBERTa-L con 0,648).
- Discrepancia en el recuento de idiomas: la model card afirma entrenamiento en 30 idiomas, mientras la metadata de HuggingFace declara 19 codigos concretos. No se detalla que idiomas completan la cifra de 30.
- Sesgo potencial en la evaluacion multilingue: las traducciones de HaluEval se generaron con Qwen3.8-27B, la misma familia usada para los datos sinteticos de entrenamiento, lo que puede favorecer al modelo segun admite la propia model card.
- Sesgos de los datos de origen: el modelo hereda los sesgos de RAGTruth, WANLI, de los datos sinteticos generados y del encoder multilingue subyacente. La informacion disponible no incluye una auditoria de sesgos.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre. El riesgo equivalente es de clasificacion erronea (falsos `SUPPORTED` o falsos `UNSUPPORTED`), que conviene calibrar sobre datos propios antes de usarlo como bloqueo automatico.
- Contexto: la ventana es de 8.000 tokens y el modelo fue entrenado con 2.000, por lo que el comportamiento con contextos muy largos no esta garantizado. La model card recomienda trocear y agregar para fuentes extensas.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones adicionales conocidas. No se declaran clausulas adicionales ni gating en el repositorio.
- La seccion de limitaciones de la model card original aparece truncada en la informacion disponible (termina en el encabezado "Simple arithmetic"), por lo que podrian existir advertencias adicionales no recogidas aqui.
- Advertencia de despliegue: al ser un clasificador de guardrail, conviene combinarlo con umbrales calibrados y con revision humana en los casos de baja confianza, en lugar de usarlo como filtro binario rigido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/hallucination-guard-base
- Demo en el navegador (Space): https://huggingface.co/spaces/Horizon-Labs/hallucination-guard
- Codigo fuente: https://github.com/horizon-ai-labs/agent-io-guards
- Coleccion Agent I/O Guards: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset RAGTruth procesado: https://huggingface.co/datasets/wandb/RAGTruth-processed
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante. Los resultados devueltos corresponden a entidades homonimas sin relacion con el modelo (un partido politico frances, una emisora de radio, la entrada generica de "Horizon" en Wikipedia, un servicio de medicina del trabajo y la plataforma Meta Horizon).
