# skhan12345/scholar-bart

## Resumen

Scholar-BART es un modelo de tipo encoder-decoder basado en la arquitectura BART, publicado en Hugging Face por el usuario skhan12345 bajo el identificador `skhan12345/scholar-bart`. El repositorio contiene pesos en formato safetensors con un total de 139.470.681 par\u00e1metros (aproximadamente 139 millones), lo que lo sit\u00faa en la gama de modelos BART de tama\u00f1o base. Est\u00e1 etiquetado para la tarea de `text2text-generation` y es compatible con la librer\u00eda `transformers` y con endpoints de inferencia.

La model card es una plantilla autogenerada por Hugging Face pr\u00e1cticamente sin rellenar: no se documenta el desarrollador real, el proceso de entrenamiento, los datos utilizados, los idiomas soportados ni la licencia. El nombre "scholar" sugiere un posible ajuste fino orientado a texto acad\u00e9mico o cient\u00edfico, pero esta hip\u00f3tesis no est\u00e1 confirmada por ninguna fuente del repositorio. El tag `arxiv:1910.09700` corresponde al art\u00edculo de BART (Lewis et al., 2019), lo que confirma la arquitectura de referencia.

El modelo tiene cero descargas y cero likes en el momento de la consulta, y el repositorio ocupa 0,6 GB. Se trata, por tanto, de una publicaci\u00f3n reciente y sin tracci\u00f3n p\u00fablica, lo que limita enormemente la evaluaci\u00f3n de su calidad y su idoneidad para producci\u00f3n. Esta ficha documenta lo que se puede verificar objetivamente a partir de los metadatos del repositorio y se\u00f1ala expl\u00edcitamente todo lo que no est\u00e1 disponible.

## Especificaciones t\u00e9cnicas

| Par\u00e1metro | Valor |
|---|---|
| Arquitectura | BART (transformer encoder-decoder) |
| Par\u00e1metros totales | 139.470.681 |
| Par\u00e1metros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizaci\u00f3n | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es BART, un transformer encoder-decoder con atenci\u00f3n bidireccional en el encoder y autorregresiva en el decoder, descrito en el art\u00edculo arXiv:1910.09700 (Lewis et al., 2019). BART se preentrena t\u00edpicamente con un objetivo de denoising: se corrompe el texto de entrada mediante ruido (token masking, deletion, infilling, sentence permutation, document rotation) y el modelo aprende a reconstruir el original. El n\u00famero de par\u00e1metros (139,5 M) es coherente con la configuraci\u00f3n BART-base (6 capas de encoder y 6 de decoder, dimensi\u00f3n oculta 768, 12 cabezas de atenci\u00f3n), aunque la configuraci\u00f3n exacta no se detalla en la model card.

No hay informaci\u00f3n sobre los datos de entrenamiento, el n\u00famero de tokens procesados, la composici\u00f3n del corpus, ni si hubo ajuste fino supervisado, RLHF o DPO. El nombre del repositorio sugiere un posible ajuste fino sobre corpus acad\u00e9mico o cient\u00edfico, pero no existe documentaci\u00f3n que lo confirme. Tampoco se documentan innovaciones t\u00e9cnicas adicionales como decodificaci\u00f3n especulativa o atenci\u00f3n lineal. En resumen: la \u00fanica informaci\u00f3n verificable es la arquitectura de referencia y el recuento de par\u00e1metros.

## Capacidades

- Generaci\u00f3n de texto condicionada a entrada (text2text-generation): el modelo est\u00e1 etiquetado para tareas de secuencia a secuencia, lo que incluye resumen, par\u00e1frasis, traducci\u00f3n y reescritura, siempre que haya sido entrenado para ello (no confirmado).
- Razonamiento y matem\u00e1ticas: no disponible; no hay evidencia de capacidades espec\u00edficas m\u00e1s all\u00e1 de la arquitectura gen\u00e9rica BART.
- Tool calling / function calling: no disponible; BART no incorpora de forma nativa mecanismos de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; la arquitectura no est\u00e1 dise\u00f1ada para planificaci\u00f3n ag\u00e9ntica.
- Capacidades multiling\u00fces: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visi\u00f3n, audio): no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Resumen de art\u00edculos cient\u00edficos: si el ajuste fino se orient\u00f3 a dominio acad\u00e9mico (hip\u00f3tesis no confirmada), el modelo podr\u00eda emplearse para condensar abstracts o secciones de papers; requiere validaci\u00f3n emp\u00edrica previa.
- Par\u00e1frasis y reescritura de texto t\u00e9cnico: BART es adecuado para tareas de reescritura seq2seq; se usar\u00eda como paso de normalizaci\u00f3n en pipelines editoriales o de documentaci\u00f3n.
- Generaci\u00f3n de preguntas y respuestas a partir de contexto: con ajuste fino adicional, puede adaptarse a QA extractiva/generativa sobre documentos, aunque no hay evidencia de que el checkpoint ya lo soporte.
- Preprocesamiento en pipelines de recuperaci\u00f3n (RAG): puede utilizarse para comprimir o reformular consultas antes de la b\u00fasqueda vectorial, aprovechando su bajo coste computacional.
- Clasificaci\u00f3n y etiquetado de texto v\u00eda generaci\u00f3n: tareas de clasificaci\u00f3n transformadas a formato seq2seq (por ejemplo, categorizaci\u00f3n de tickets) si se ajusta previamente.
- Prototipado r\u00e1pido en investigaci\u00f3n: su tama\u00f1o (139 M) permite iterar en una sola GPU consumer, lo que lo hace \u00fatil como baseline en experimentos acad\u00e9micos de NLP.
- Generaci\u00f3n de res\u00famenes de actas o informes internos: uso en herramientas de productividad con datos no sensibles, siempre que se valide la calidad de salida y la licencia (actualmente desconocida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informaci\u00f3n disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,56 GB solo para pesos (139,5 M \u00d7 4 bytes); en fp16, unos 0,28 GB; en int8, unos 0,14 GB. A\u00f1adiendo activaciones y buffers de atenci\u00f3n, el consumo real se sit\u00faa t\u00edpicamente entre 1 y 3 GB seg\u00fan longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, T4 o superior funcionan sin problema. Para lotes grandes o secuencias largas, una A10G o A100 ofrecen margen amplio.
- \u00bfCabe en GPU consumer? S\u00ed, en pr\u00e1cticamente cualquier GPU consumer moderna (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4090, etc.), e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` con PyTorch (nativo), `text-generation-inference` (TGI) para serving HTTP, `vLLM` (soporte de modelos encoder-decoder limitado; verificar compatibilidad), `llama.cpp`/`Ollama` solo si se convierte a GGUF (no publicado). Tambi\u00e9n es compatible con Hugging Face Inference Endpoints seg\u00fan el tag `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 139 M, en una GPU moderna se esperan latencias de decenas de milisegundos por secuencia corta y throughput de cientos de secuencias por segundo con batching, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Par\u00e1metros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| skhan12345/scholar-bart | 139,5 M | no disponible | no disponible | Hugging Face (0 descargas) |
| facebook/bart-base | ~139 M | 1024 tokens | MIT | Hugging Face (ampliamente usado) |
| google/t5-base | ~220 M | 512 tokens | Apache 2.0 | Hugging Face |
| facebook/bart-large | ~406 M | 1024 tokens | MIT | Hugging Face |

La comparaci\u00f3n con `facebook/bart-base` es la m\u00e1s directa por tama\u00f1o y arquitectura; sin embargo, no hay datos que permitan afirmar que scholar-bart mejore o iguale al checkpoint original de Meta. `google/t5-base` es una alternativa seq2seq con licencia permisiva y amplia adopci\u00f3n. La falta de licencia declarada en scholar-bart es un factor diferencial negativo frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; en ausencia de licencia expl\u00edcita, los derechos quedan reservados por defecto en muchas jurisdicciones.
- Model card vac\u00eda: no hay informaci\u00f3n sobre datos de entrenamiento, sesgos, idiomas ni procedencia, lo que impide evaluar riesgos de sesgo o alucinaci\u00f3n de forma fundamentada.
- Riesgo de alucinaci\u00f3n: inherente a los modelos generativos seq2seq; sin evaluaci\u00f3n publicada no se puede cuantificar.
- Sin tracci\u00f3n p\u00fablica: cero descargas y cero likes; no hay evidencia de uso en producci\u00f3n ni validaci\u00f3n por terceros.
- Contexto limitado (presumiblemente 1024 tokens si sigue la configuraci\u00f3n BART est\u00e1ndar, aunque no confirmado): inadecuado para documentos largos sin truncado o segmentaci\u00f3n.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en otros idiomas sin pruebas emp\u00edricas.
- No apto para tareas ag\u00e9nticas ni tool calling: la arquitectura BART no incorpora estas capacidades de forma nativa.
- Fecha de creaci\u00f3n futura en los metadatos (2026-11-04): posible inconsistencia en el registro del repositorio que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/skhan12345/scholar-bart
- Art\u00edculo de referencia BART (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Checkpoint original BART-base de Meta: https://huggingface.co/facebook/bart-base
- Documentaci\u00f3n de BART en transformers: https://huggingface.co/docs/transformers/model_doc/bart
- Calculadora de impacto ambiental ML (referenciada en la model card): https://mlco2.github.io/impact
