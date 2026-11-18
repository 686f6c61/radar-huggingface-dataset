# jeffpeng3/0c-ja-reranker

## Resumen

0c-ja-reranker es un modelo de reranking especializado en desambiguación de homófonos para japonés, desarrollado por jeffpeng3 como componente del método de entrada (IME) 0C. Dado un conjunto de candidatos léxicos que comparten la misma lectura fonética y el contexto que rodea a un ancla, el modelo puntúa cada superficie candidata según su adecuación al contexto. Resuelve un problema clásico de la conversión kana-kanji: elegir la grafía correcta entre múltiples homófonos (por ejemplo, distintos kanji con idéntica lectura).

Arquitectura y escala: se trata de un transformer encoder de 8 capas, dimensión oculta 512 y 8 cabezas de atención, con una cabeza escalar sobre el slot del candidato, sumando 33.864.193 parámetros. El contexto de entrenamiento es de 120 tokens por lado (secuencia total de 244), con posiciones absolutas aprendidas. El checkpoint publicado es la variante *public-core*, con pesos bajo licencia MIT y entrenada exclusivamente sobre el corpus público de 0C, sin datos CC BY-SA, Mozc ni NEologd.

Es relevante para desarrolladores que construyen IMEs o sistemas de normalización de texto japonés, porque ofrece un componente de reranking pequeño (34,2 MB en int8), desplegable en CPU con ONNX Runtime y con métricas de calidad publicadas (top-1 de 86,975 en validación y MRR de 0,9289 sobre 8.000 grupos). Su naturaleza acotada y su contrato tensorial explícito lo hacen fácil de integrar en pipelines de conversión existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (8 capas, D512, 8 cabezas) con cabeza escalar sobre el slot del candidato |
| Parametros totales | 33.864.193 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 120 tokens por lado; secuencia total 244 (layout fijo de entrenamiento) |
| Tipos de cuantizacion | fp32 (135,6 MB) e int8 dinámica (34,2 MB); int8 es el fichero de despliegue |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT (pesos y grafos ONNX); no relicencia el texto de entrenamiento, el tokenizador ni las fuentes léxicas |
| Formato de pesos | ONNX (model.int8.onnx, fp32); tokenizador SentencePiece de 32.768 piezas (vocab.model, vocab.json) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 8 capas con dimensión oculta 512 y 8 cabezas de atención, al que se añade una cabeza escalar que lee el slot del candidato (índice 122 en la secuencia). Emplea posiciones absolutas aprendidas y fue entrenado con un layout fijo: `<bos>` en la posición 0, contexto izquierdo alineado a la derecha en 120 slots, `<eos>` en 121, candidato en 122, `<eos>` en 123 y contexto derecho alineado a la izquierda en 120 slots. El eje de secuencia es dinámico en el grafo, pero producción debe rellenar hasta 244; una secuencia menor de 123 no contiene slot de candidato.

El entrenamiento se realizó únicamente sobre el corpus público de 0C (cinco fuentes: Aozora Bunko, e-Gov, KAKEN, SIP3 PDF y texto de patentes de la JPO, todas CC BY 4.0 o dominio público). Los grupos de candidatos se construyeron a partir de un paquete léxico público basado en UniDic 2025.12 (BSD-3-Clause, NINJAL), IPADic 2.7.0 (NAIST e ICOT) y validación de lecturas contra Unihan 18.0.0. No se menciona en la información disponible el uso de RLHF, DPO ni decodificación especulativa. La innovación principal es el diseño de layout con slot dedicado al candidato, que permite puntuar múltiples superficies en un solo forward pass por grupo.

## Capacidades

- Reranking de candidatos homófonos en japonés: puntúa cada superficie candidata según el contexto izquierdo y derecho que rodea al ancla.
- Puntuación por lote: acepta `[batch, seq]` y devuelve un escalar float32 por fila, lo que permite evaluar un grupo completo de candidatos en una sola pasada.
- Desambiguación contextual: usa hasta 120 tokens de contexto a cada lado del candidato.
- Integración con tokenizador SentencePiece de 32.768 piezas (ids especiales: pad=0, unk=1, bos=2, eos=3).
- Despliegue en CPU mediante ONNX Runtime, con cuantización int8 dinámica sin conjunto de calibración.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking; es un componente especializado de reranking, no un modelo generativo.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Conversión kana-kanji en IME: el modelo recibe los tokens de contexto alrededor del cursor y el conjunto de superficies candidatas con la misma lectura, y devuelve la mejor opción; encaja directamente en el pipeline del IME 0C.
- Desambiguación de homófonos en correctores ortográficos japoneses: permite elegir la grafía correcta en textos donde el contexto determina el kanji adecuado, con latencia de decenas de milisegundos por grupo en CPU.
- Normalización de texto para pipelines de NLP: antes de tokenizar o indexar documentos japoneses, se puede resolver la ambigüedad de homófonos para mejorar la calidad de búsqueda.
- Procesamiento de documentos escaneados con OCR japonés: tras el reconocimiento, el reranker puede corregir selecciones de kanji homófonos usando el contexto de la frase.
- Sistemas de entrada en entornos sin GPU: al ejecutarse con ONNX Runtime en CPU (int8, 34,2 MB), es adecuado para aplicaciones de escritorio, móviles o servidores sin acelerador.
- Evaluación de candidatos léxicos en herramientas de escritura: integración en editores que ofrecen sugerencias de kanji y necesitan ordenar candidatos por adecuación contextual.
- Investigación en desambiguación léxica japonesa: sirve como baseline reproducible con métricas publicadas (top-1 y MRR) sobre el conjunto homophone-v1.

## Benchmarks y rendimiento

Calidad sobre el conjunto `homophone-v1` (8.000 grupos por split):

| Split | Grupos | Top-1 | MRR | Top-1 aleatorio |
|---|---:|---:|---:|---:|
| validation | 8.000 | 86,975 | 0,9289 | 23,17 |
| test | 8.000 | 86,400 | 0,9258 | 23,22 |

Latencia con ONNX Runtime en CPU (8 hilos intra-op, secuencia 244, host NVIDIA GB10, carga media 8-10 durante la medición):

| Modo | fp32 mediana | fp32 p95 | int8 mediana | int8 p95 |
|---|---:|---:|---:|---:|
| batch 1, por candidato | 25,663 ms | 26,406 ms | 15,704 ms | 16,466 ms |
| batch 1, por grupo | 103,378 ms | 153,554 ms | 63,367 ms | 93,862 ms |
| batch 5, un forward por grupo | 143,840 ms | 145,776 ms | 99,159 ms | 102,437 ms |

Paridad fp32 ONNX frente a PyTorch: 240 grupos de validación a secuencia 244 (1.065 filas de candidatos), diferencia absoluta máxima de 1,30e-5 (umbral 1e-4), argmax y ranking idénticos. int8: la escala de puntuaciones se desplaza (diferencia absoluta máxima 0,238), pero argmax y ranking se mantienen idénticos.

## Requisitos de hardware

- VRAM: no aplica en el despliegue de referencia, que es CPU con ONNX Runtime. En GPU, el modelo es lo bastante pequeño (135,6 MB fp32, 34,2 MB int8) para caber en cualquier GPU con al menos 1 GB de memoria libre.
- GPU recomendadas: no se especifican en la información disponible; el autor midió en un host con NVIDIA GB10 usando el execution provider de CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 o superior), aunque no se han publicado mediciones en GPU.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider probado), con ficheros `model.int8.onnx` y fp32; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: int8 en CPU, batch 1, aproximadamente 15,7 ms por candidato (mediana) y 63,4 ms por grupo; batch 5, 99,2 ms por grupo. Con 8 hilos intra-op y carga del host elevada, por lo que las cifras son conservadoras.

## Comparativa con modelos similares

No se han publicado comparaciones con otros rerankers japoneses en la información disponible. Las alternativas genéricas de reranking multilingüe (por ejemplo, rerankers basados en BERT multilingüe) no aparecen evaluadas en el conjunto `homophone-v1`, por lo que no es posible establecer una comparación cuantitativa fiable.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 0c-ja-reranker | 33,9 M | 120 tokens por lado | MIT | Reranking de homófonos japonés |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización estrecha: solo resuelve reranking de homófonos en japonés; no genera texto ni sirve para tareas generales.
- Layout rígido: requiere el formato exacto de 244 posiciones con el candidato en el índice 122; secuencias más cortas de 123 no tienen slot de candidato y un prefijo más corto descarta contexto derecho.
- Puntuaciones sin calibrar entre grupos: los scores son logits crudos y solo son comparables dentro de un mismo grupo de candidatos.
- Idiomas: únicamente japonés; el tokenizador y el léxico están ligados al japonés escrito moderno.
- Licencia: los pesos son MIT, pero esa licencia no cubre el texto de entrenamiento, el tokenizador ni las fuentes léxicas; se exige atribución al proyecto 0C y a los publicadores originales (NINJAL, NAIST, ICOT, Unicode Consortium y editores del corpus), sin implicar respaldo.
- Riesgo de alucinación: al ser un modelo discriminativo de puntuación, el riesgo se manifiesta como selección incorrecta de candidato en contextos ambiguos o fuera de distribución, no como generación de texto inventado.
- Sin datos publicados sobre sesgos demográficos o dialectales; el corpus es de japonés escrito moderno de fuentes públicas.
- No se han publicado evaluaciones en GPU ni comparativas con otros rerankers; el rendimiento medido corresponde a un host concreto y carga elevada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeffpeng3/0c-ja-reranker
- Checkpoint derivado: https://huggingface.co/jeffpeng3/0c-ja-reranker-extra
- Repositorio de entrenamiento 0C (referenciado en la model card, ruta `docs/reports/P2-23E-phase2.md`): no disponible como URL directa en la información proporcionada.
