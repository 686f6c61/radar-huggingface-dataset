# n-gramsci/portrayal-camembert-large

## Resumen

portrayal-camembert-large es un modelo de clasificación de texto en francés desarrollado por n-gramsci (proyecto ngramsci_nlp) que evalúa cómo un pasaje de prensa francesa retrata a una persona objetivo. No se trata de un modelo generativo, sino de un fine-tune de CamemBERT-large con cinco cabezas de clasificación que determinan si el pasaje habla realmente del objetivo, si el juicio es negativo, neutro o positivo, si se le enmarca como moderado o extremo, si se le presenta como en ascenso o en declive, y si el juicio es del propio periodista o de una fuente citada.

El modelo se distribuye como un ensemble de cinco semillas del mismo fine-tune (seeds 0-4) cuyas probabilidades deben promediarse; es la configuración usada en producción por el autor. Forma parte de un pipeline más amplio que construye las entradas mediante NER (propp) y correferencia (Qwen), y procesa corpus completos en la etapa `portrayal`.

Es relevante para investigadores en análisis político computacional y seguimiento mediático de candidatos electorales, dado que automatiza una tarea de codificación de encuadre (framing) que normalmente requiere anotadores humanos. Su limitación principal es que las etiquetas provienen de un profesor LLM (Claude Sonnet) y no de codificadores humanos, y que está entrenado exclusivamente sobre prensa francesa en línea de 2008 a 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamemBERT-large), con cinco cabezas de clasificación sobre representaciones pooled |
| Parametros totales | no disponible (repo de 3.4 GB, consistente con CamemBERT-large en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens de entrada |
| Tipos de cuantizacion | no disponible (pesos safetensors; se infiere fp16 por el entrenamiento, pero no se documentan cuantizaciones publicadas) |
| Idiomas soportados | francés (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de almanach/camembert-large, un encoder transformer tipo RoBERTa adaptado al francés. Sobre la representación del token de clasificación se añaden cinco cabezas independientes: `pertinent` (binaria), `valence`, `extremisme` y `dynamique` (tridimensionales: -1/0/1) y `journaliste` (binaria). La entrada es `"Titre : <title>\n<passage>"` con un máximo de 384 tokens; cada mención del objetivo se envuelve en `[[ ]]` y el nombre se sustituye por el placeholder `[[Dominique Martin]]` para que el modelo juzgue el retrato y no a la persona. El vector que alimenta las cabezas es la media de los estados ocultos sobre los spans marcados del objetivo concatenada con la media sobre toda la entrada.

El entrenamiento usó etiquetas de profesor generadas por Claude Sonnet siguiendo el codebook de anotación v4, sobre 6.250 pasajes de mención de prensa francesa en línea (2008-2026) acerca de candidatos presidenciales de 2027; 2.000 de ellos se seleccionaron por active learning para cubrir clases raras (encuadre moderado, declive, elogio). El conjunto final fue de 5.220 filas de entrenamiento y 941 de validación, con 12 épocas, fp16, última época conservada y cinco semillas (0-4). Se descartaron las filas en las que la mención designaba a otra persona.

## Capacidades

- Clasificación de pertinencia: determina si el pasaje dice algo sustancial sobre el objetivo o es una mención de pasada (`pertinent`).
- Análisis de valencia: clasifica el juicio sobre el objetivo como negativo, neutro o positivo (`valence`).
- Detección de encuadre extremista: identifica si se presenta al objetivo como moderado, sin encuadre o como extremo, por etiqueta o por sustancia (`extremisme`).
- Detección de dinámica electoral: señala si el objetivo aparece en declive, sin información o en ascenso (`dynamique`).
- Atribución del juicio: distingue si la valoración es del propio periodista o de una persona citada (`journaliste`).
- Procesamiento por lotes de corpus completos mediante la librería `ngramsci` (etapa `portrayal`).
- No soporta generación de texto, tool calling, agentes ni multimodalidad; es exclusivamente un clasificador.

## Casos de uso

- Seguimiento mediático de candidatos: procesar hemerotecas completas de prensa francesa y agregar las salidas por candidato y periodo para medir la evolución del tono y del encuadre a lo largo de una campaña electoral.
- Investigación en comunicación política: sustituir o prefiltrar la codificación manual de encuadre en estudios de framing, usando las probabilidades del ensemble como variable continua y validando contra una submuestra anotada por humanos.
- Monitorización de sesgo periodístico: detectar si un medio presenta sistemáticamente a un mismo político como extremo o en declive en comparación con otros medios, agregando las predicciones de `extremisme` y `dynamique` por cabecera.
- Análisis de atribución de opinión: usar la cabeza `journaliste` para separar valoraciones propias del medio de las declaraciones citadas, útil en estudios sobre objetividad y equilibrio informativo.
- Alertas de campaña: integrar el scorer en un pipeline que vigile la aparición de menciones con valencia negativa creciente o encuadre extremista para un candidato concreto y dispare revisiones editoriales o análisis.
- Construcción de datasets etiquetados: generar etiquetas automáticas de retrato mediático sobre grandes corpus para entrenar o evaluar modelos posteriores, dado que el modelo reproduce el codebook v4 de forma consistente (κ de 0,56 a 0,85 según la cabeza).

## Benchmarks y rendimiento

Los únicos datos publicados son los acuerdos Cohen's κ frente al profesor (Claude Sonnet) sobre un gold set de 596 menciones de artículos de 2026 excluidos del entrenamiento, con semillas individuales y última época:

| Cabeza | κ (5 semillas) |
|---|---|
| pertinent | 0,65-0,71 |
| valence | 0,62-0,67 |
| extremisme | 0,56-0,65 |
| dynamique | 0,61-0,64 |
| journaliste | 0,78-0,85 |

Como referencia, Claude Opus frente al profesor Sonnet sobre 200 menciones del gold set obtiene: valence 0,74, extremisme 0,77, dynamique 0,80, pertinent 0,73 y journaliste 0,67. El autor advierte que el gold set contiene pocos casos de clases raras (5 de encuadre moderado, 16 de declive), por lo que el κ de esas clases es ruidoso (IC 95 % de ±0,06 a ±0,12) y recomienda evaluar sobre agregados (medias por candidato y periodo).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable al tratarse de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 3,4 GB, lo que corresponde a los pesos de cinco semillas de CamemBERT-large; una sola semilla en fp16 requiere aproximadamente 1,4 GB, y el ensemble completo en fp16 en torno a 7 GB si se cargan las cinco a la vez.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el ensemble en fp16 (RTX 3070/4060 Ti, RTX 4090); para una sola semilla basta con 4 GB (GTX 1650 Super, RTX 3050). En CPU es viable para procesamiento por lotes de corpus, aunque más lento.
- Cabe en GPU de consumo: sí, tanto una semilla individual como el ensemble de cinco en tarjetas de 8-16 GB.
- Opciones de despliegue: la vía documentada es la librería `ngramsci` (`pip install "ngramsci[portrayal] @ git+https://github.com/regicid/ngramsci_nlp"`), que carga el modelo desde el Hub y expone un método `score`. Al ser un transformer estándar con safetensors, también puede servirse con Hugging Face Transformers, Text Embeddings Inference o un endpoint de inferencia propio; no se documentan integraciones con vLLM, llama.cpp u Ollama, orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| portrayal-camembert-large | Encoder CamemBERT-large + 5 cabezas | no disponible (repo 3,4 GB, 5 semillas) | 384 tokens | Clasificación de retrato mediático en francés | MIT | Hugging Face |
| almanach/camembert-large | Encoder CamemBERT-large | no disponible en la información | no disponible en la información | Modelo base de lenguaje francés | no disponible en la información | Hugging Face |
| Claude Opus (referencia del autor) | LLM generativo propietario | no disponible | no disponible | Etiquetado zero-shot del mismo codebook | Propietaria | API de Anthropic |

No se dispone de información sobre otros clasificadores públicos de encuadre político en francés comparables; el autor solo aporta la comparación con Claude Opus sobre el gold set, donde el modelo fine-tuneado supera al LLM generalista en la cabeza `journaliste` (κ 0,78-0,85 frente a 0,67) y queda por debajo en `valence` (0,62-0,67 frente a 0,74), `extremisme` (0,56-0,65 frente a 0,77), `dynamique` (0,61-0,64 frente a 0,80) y `pertinent` (0,65-0,71 frente a 0,73).

## Limitaciones y advertencias

- Sesgos de dominio: entrenado exclusivamente sobre políticos (candidatos de 2027). Las cabezas `valence`, `pertinent` y `journaliste` transfieren razonablemente a otras personas, pero `extremisme` y `dynamique` se refieren al encuadre político y a la contienda electoral y carecen de sentido para no políticos.
- Etiquetas de profesor LLM: las etiquetas provienen de Claude Sonnet siguiendo el codebook, no de codificadores humanos; el modelo reproduce la lectura del profesor, con sus posibles sesgos y errores sistemáticos.
- Riesgo de alucinación de etiqueta: al ser un clasificador, el riesgo se traduce en falsos positivos de encuadre o valencia, especialmente en clases raras donde el κ es ruidoso; el autor recomienda evaluar sobre agregados y no sobre casos individuales.
- Cobertura lingüística y de fuentes: solo prensa francesa en línea; no se garantiza su comportamiento en otros registros, en francés oral o en prensa de otros países francófonos.
- Limitación de contexto: la entrada se trunca a 384 tokens, de modo que pasajes muy largos o títulos y frases vecinas extensas pueden perder información relevante.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; sin embargo, los pasajes de entrenamiento no se publican por derechos de autor, por lo que no es posible reproducir el entrenamiento exacto.
- Dependencia del pipeline: el modelo espera un formato de entrada muy específico (título, placeholders `[[ ]]`, nombre sustituido); usarlo fuera de la librería `ngramsci` requiere replicar ese preprocesado con precisión para obtener resultados válidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/n-gramsci/portrayal-camembert-large
- Repositorio del proyecto ngramsci_nlp: https://github.com/regicid/ngramsci_nlp
- Modelo base: https://huggingface.co/almanach/camembert-large
