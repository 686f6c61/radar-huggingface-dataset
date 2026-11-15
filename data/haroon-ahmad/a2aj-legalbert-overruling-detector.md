# haroon-ahmad/a2aj-legalbert-overruling-detector

## Resumen

A2AJ Legal-BERT Overruling Detector es un clasificador de parrafos para jurisprudencia canadiense desarrollado por Haroon Ahmad. Su funcion es detectar, dentro de una sentencia, los parrafos en los que el tribunal revoca (*overrules*) o se niega a seguir (*declines to follow*) un caso citado. El modelo recibe un parrafo con la citacion marcada entre dobles corchetes y devuelve probabilidades para tres clases: `negative_treatment`, `narrated` y `other`.

Tecnicamente es un fine-tune de `nlpaueb/legal-bert-base-uncased`, un transformer encoder de tipo BERT en su variante base (aproximadamente 110 millones de parametros, segun el modelo base referenciado). La ventana de entrada esta limitada a 384 tokens, coherente con la mediana de 180 tokens de los parrafos de entrenamiento. El modelo forma parte del trabajo *Validity-Aware Temporal Graph Retrieval of Canadian Precedent* y esta pensado como pieza de un sistema mayor de recuperacion de precedentes con validez temporal.

Su relevancia radica en que automatiza una tarea juridica costosa: determinar si un precedente sigue siendo derecho vigente. El modelo se distribuye con dos semillas (`seed1/` y `seed2/`) cuyas probabilidades softmax se promedian, y se publica como artefacto de investigacion bajo licencia CC BY-SA 4.0, sin que constituya asesoramiento juridico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (fine-tune de `nlpaueb/legal-bert-base-uncased`) |
| Parametros totales | no disponible (el modelo base Legal-BERT es de tipo base; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens (truncado en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (repo de 0.9 GB, dos subcarpetas `seed1/` y `seed2/`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de clasificacion de secuencias sobre Legal-BERT base. La cabeza de clasificacion produce tres logits correspondientes a `negative_treatment`, `narrated` y `other`. El texto se trunca a 384 tokens y, para parrafos largos, el autor recomienda recortar a 700 caracteres a cada lado de la mencion citada, replicando el preprocesado del entrenamiento.

Los datos de entrenamiento son 28.616 parrafos extraidos del corpus A2AJ Canadian case-law, segmentados en parrafos y opiniones, con sobremuestreo de parrafos que contienen expresiones como "overrule", "decline to follow", "wrongly decided" o "no longer good law". Las etiquetas son *silver labels* generadas por un LLM (Drex, `drex-max-v1.1`), no anotacion humana: `negative_treatment` fusiona las etiquetas `overruled` y `not_followed` con confianza ≥ 0,5, mientras que `narrated` y `other` usan confianza ≥ 0,7 mas 20.000 parrafos `other` muestreados. La particion se hace por sentencia citante y existe un conjunto `ref_test` con todas las sentencias que citan pares de una lista de referencia de 50 revocaciones conocidas (extraidas de sumarios del Tribunal Supremo) y 16 de la literatura, nunca visto en entrenamiento. El entrenamiento uso entropia cruzada ponderada, learning rate 2e-5, batch 16, 4 epocas con 10% de warmup y seleccion de la mejor epoca por macro-F1 en dev (epoca 2 para seed 1, epoca 4 para seed 2), sobre 2 × T4.

## Capacidades

- Clasificacion de parrafos de sentencias canadienses en tres clases de tratamiento de citas: revocacion o no seguimiento, narracion de una revocacion previa, y otros tratamientos (seguimiento, aplicacion, distincion, mencion).
- Deteccion de revocaciones explicitas mediante expresiones como "overrule", "decline to follow", "wrongly decided" o "no longer good law".
- Distincion entre una revocacion efectuada en el propio parrafo y la mera narracion de una revocacion anterior por otra decision.
- Entrada con marcado de la citacion objetivo mediante `[[...]]`, admitiendo tanto citacion completa (`[[2005 FCA 348]]`) como nombre corto (`[[Grenier]]`).
- Soporte de inferencia con dos semillas y promedio de probabilidades softmax para mayor estabilidad.
- Capacidad multilingue: no disponible; solo ingles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un clasificador de texto, no un modelo generativo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Construccion de grafos de precedentes con validez temporal: el modelo etiqueta cada parrafo de una sentencia citante y permite marcar aristas de revocacion entre casos, alimentando un grafo que refleje que precedentes siguen vigentes y cuales han sido superados.
- Revision de citas en memorandos y escritos: dado un borrador que cita jurisprudencia, se puede pasar cada parrafo que menciona un caso por el clasificador para detectar si la propia sentencia citada fue revocada o dejada sin efecto.
- Sistemas de recuperacion aumentada (RAG) juridica: filtrar o ponderar fragmentos recuperados segun si contienen tratamiento negativo del precedente, evitando que un asistente cite como vigente una doctrina ya superada.
- Investigacion empirica sobre stare decisis: procesar grandes volumenes del corpus A2AJ para cuantificar con que frecuencia y en que contextos los tribunales canadienses revocan precedentes, usando las probabilidades como variable dependiente.
- Alertas de cambio jurisprudencial: monitorizar nuevas sentencias publicadas y detectar automaticamente aquellas que revocan casos de una lista de vigilancia, generando avisos para despachos o departamentos juridicos.
- Curacion de bases de conocimiento juridico: enriquecer metadatos de sentencias con la etiqueta de tratamiento de cada cita, mejorando la trazabilidad de la validez de cada precedente en un repositorio documental.

## Benchmarks y rendimiento

Resultados publicados por el autor para la clase `negative_treatment`, medidos contra las etiquetas Drex:

| Split | Modelo | Precision | Recall | F1 |
|---|---|---|---|---|
| test | media de semillas | 0,902 | 0,685 | 0,779 |
| test | seed1 | 0,878 | 0,796 | 0,835 |
| test | seed2 | 0,822 | 0,685 | 0,747 |
| test | TF-IDF + regresion logistica | 0,704 | 0,352 | 0,469 |
| test | busqueda de frases ("overrul...", "decline to follow...") | 0,050 | 0,574 | 0,092 |
| ref_test | media de semillas | 0,976 | 0,512 | 0,672 |
| ref_test | TF-IDF + regresion logistica | 0,875 | 0,263 | 0,404 |

Datos adicionales reportados:

| Metrica | Valor |
|---|---|
| F1 por clase en test (media de semillas) | `negative_treatment` 0,779; `narrated` 0,917; `other` 0,995 |
| Ganancia de F1 sobre TF-IDF en test | 95% CI [0,165, 0,475], bootstrap pareado a nivel de sentencia |
| Parrafos `narrated` mal clasificados como `negative_treatment` en test | 1 de 66 |
| Validacion contra revocaciones conocidas (independiente de Drex) | 44 pares de referencia con texto en el corpus |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para un modelo base BERT (unos 440 MB de pesos por semilla); con las dos semillas cargadas simultaneamente, en torno a 1 GB. Cifra no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en 2 × T4, lo que indica que la inferencia cabe holgadamente en T4, A100, H100, RTX 4090, RTX 3090 o RTX 3060.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna (RTX 20xx en adelante) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: `transformers` con PyTorch (el codigo de ejemplo de la model card usa `AutoTokenizer` y `AutoModelForSequenceClassification`); al ser safetensors y no GGUF, no es directamente compatible con llama.cpp u Ollama sin conversion. Para servir a escala se puede usar Text Embeddings Inference o un servidor FastAPI propio; vLLM y TGI estan orientados a modelos generativos y no aplican de forma estandar a clasificadores BERT.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| a2aj-legalbert-overruling-detector | no disponible (base BERT) | 384 tokens | Clasificacion de tratamiento de citas (3 clases) | CC BY-SA 4.0 | Hugging Face, 0 descargas, 0 likes |
| nlpaueb/legal-bert-base-uncased (modelo base) | no disponible (base BERT) | 512 tokens | Representacion de texto juridico (MLM) | no disponible en la informacion | Hugging Face |
| TF-IDF + regresion logistica (baseline del autor) | no aplica | no aplica | Clasificacion de tratamiento de citas | no disponible | Baseline interno del paper |
| Busqueda de frases (baseline del autor) | no aplica | no aplica | Clasificacion de tratamiento de citas | no disponible | Baseline interno del paper |

No se dispone de informacion sobre otros clasificadores publicos especificos de deteccion de revocaciones de precedentes para comparar directamente.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son *silver labels* generadas por un LLM (Drex), no anotacion humana; los resultados miden concordancia con ese etiquetador, no verdad juridica absoluta.
- Las etiquetas describen solo lo que hace el texto, no si el tribunal tenia competencia para hacerlo: un tribunal de primera instancia que "declines to follow" una decision de apelacion recibe igualmente `negative_treatment`. La jerarquia judicial (stare decisis) debe aplicarse despues como regla separada.
- El modelo no sabe de que opinion proviene el parrafo y marca tambien votos particulares y concurrentes; para obtener la decision efectiva del tribunal deben conservarse solo parrafos de la opinion mayoritaria.
- Ventana de contexto limitada a 384 tokens; el 3,1% de los parrafos de entrenamiento fueron truncados. Para parrafos largos hay que recortar manualmente a 700 caracteres a cada lado de la mencion.
- Solo soporta ingles y jurisprudencia canadiense; no es trasladable sin reentrenamiento a otras jurisdicciones.
- Riesgo de alucinacion no aplica en sentido generativo (es un clasificador), pero si de falsos positivos y negativos: recall de 0,685 en test y de 0,512 en `ref_test` para `negative_treatment`, es decir, pierde aproximadamente la mitad de las revocaciones reales en el conjunto de referencia.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar su codigo o datos derivados.
- Es un artefacto de investigacion y no constituye asesoramiento juridico; no debe usarse como unica fuente para decisiones legales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haroon-ahmad/a2aj-legalbert-overruling-detector
- Modelo base: https://huggingface.co/nlpaueb/legal-bert-base-uncased
- Dataset A2AJ Canadian case-law: https://huggingface.co/datasets/a2aj/canadian-case-law
- Codigo del proyecto: https://github.com/haroonahmaddata/canadian-precedent-validity
- Paper referenciado: *Validity-Aware Temporal Graph Retrieval of Canadian Precedent* (Ahmad, 2026, arXiv:XXXX.XXXXX; identificador no disponible en la informacion proporcionada)
