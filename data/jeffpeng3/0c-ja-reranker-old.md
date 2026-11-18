# jeffpeng3/0c-ja-reranker-old

## Resumen

`0c-ja-reranker-old` es un modelo de reranking especializado en japonés desarrollado por el usuario de Hugging Face jeffpeng3, concebido como componente del motor de conversión de entrada (IME) del proyecto 0C. Su tarea concreta es puntuar candidatos léxicos que comparten la misma lectura fonética (homófonos) en función de su contexto circundante, resolviendo así la ambigüedad que se produce al convertir una lectura en caracteres japoneses. No es un modelo generativo: es un encoder transformer con una cabeza escalar que emite un logit por candidato.

Arquitectónicamente es un transformer encoder de 8 capas, dimensión oculta 512 y 8 cabezas de atención, con 33.864.193 parámetros totales. Se ha entrenado exclusivamente sobre el corpus público del proyecto 0C (texto japonés de dominio público y CC BY 4.0) y se distribuye en formato ONNX bajo licencia MIT, con una versión cuantizada a int8 de 34,2 MB como fichero de despliegue. El checkpoint publicado corresponde al contexto de entrenamiento de 120 tokens por lado (secuencia de 244).

Su relevancia es acotada pero clara: cubre una necesidad muy específica del procesamiento de texto japonés (desambiguación de homófonos en IME) con un modelo pequeño, cuantizado y ejecutable en CPU, lo que permite integrarlo en aplicaciones de escritorio o servidores sin GPU. Es, además, el checkpoint base del que deriva `jeffpeng3/0c-ja-reranker-extra`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (8 capas, 8 cabezas, d_model=512) con cabeza escalar sobre el slot del candidato |
| Parametros totales | 33.864.193 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 120 tokens por lado (secuencia total 244) |
| Tipos de cuantizacion | fp32 (135,6 MB) e int8 dinámica sin calibración (34,2 MB) |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT (pesos y grafos ONNX) |
| Formato de pesos | ONNX (`model.int8.onnx`, referencia fp32), vocabulario SentencePiece de 32.768 piezas |

## Arquitectura y entrenamiento

El modelo es un transformer encoder estándar de 8 capas con dimensión 512 y 8 cabezas de atención, sobre el que se añade una cabeza escalar que lee exclusivamente el slot del candidato (índice 122 de la secuencia). La entrada se organiza con un layout fijo: `<bos>` en la posición 0, 120 slots de contexto izquierdo alineados a la derecha, `<eos>` en 121, el candidato en 122, `<eos>` en 123 y 120 slots de contexto derecho alineados a la izquierda, con padding (id 0) y máscara de atención a 0 en los huecos. Usa posiciones absolutas aprendidas y fue entrenado a 120 tokens por lado, por lo que el grafo publicado espera exactamente ese layout.

El entrenamiento se realizó únicamente sobre el corpus público del proyecto 0C, compuesto por cinco fuentes japonesas de dominio público o CC BY 4.0 (Aozora Bunko, e-Gov, KAKEN, SIP3 PDF y texto de patentes de la JPO), sin texto CC BY-SA, sin Mozc y sin NEologd. Los grupos de candidatos se construyeron a partir de un paquete léxico público basado en UniDic 2025.12 (BSD-3-Clause, NINJAL), IPADic 2.7.0 (NAIST/ICOT) y validación de lecturas contra Unihan 18.0.0 (Unicode License V3). La model card no detalla el número de tokens de entrenamiento ni si hubo RLHF o DPO; al ser un modelo de ranking supervisado por grupos de candidatos, la formulación esperable es de clasificación/ranking, pero ese dato no está disponible.

## Capacidades

- Puntuación de candidatos homófonos japoneses en contexto: dado un grupo de superficies que comparten lectura, devuelve un logit por candidato; mayor es mejor dentro del mismo grupo.
- Desambiguación contextual de conversión de lectura a kanji, orientada al motor IME del proyecto 0C.
- Manejo de contexto bilateral: 120 tokens a la izquierda y 120 a la derecha del candidato.
- Inferencia en CPU con ONNX Runtime, con soporte de ejecución por lotes (batch 1 y batch 5 documentados).
- Cuantización int8 dinámica lista para producción, con paridad de ranking y argmax respecto a fp32.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es un reranker discriminativo.
- Capacidad multilingüe limitada al japonés; no se documenta soporte de otros idiomas.

## Casos de uso

- Desambiguación de homófonos en un IME japonés: el modelo puntúa cada superficie candidata con el contexto izquierdo y derecho de la frase en curso, lo que permite al motor de conversión elegir el kanji correcto en lugar de recurrir a heurísticas de frecuencia.
- Corrección de transcripciones de voz a texto en japonés: tras un ASR que produce lecturas o kana, el reranker selecciona la superficie escrita más plausible según el contexto de la frase.
- Normalización de texto japonés en pipelines de NLP: dado un token ambiguo con varias lecturas, el modelo ayuda a fijar la forma canónica antes de tareas posteriores (NER, análisis morfológico, búsqueda).
- Búsqueda y recuperación léxica en japonés: reordenar candidatos de un diccionario o índice que comparten lectura para mejorar la precisión de la consulta en un motor de búsqueda interno.
- Integración en aplicaciones de escritorio sin GPU: al ejecutarse en CPU con ONNX Runtime y ocupar 34,2 MB en int8, puede embeberse en clientes de escritorio o extensiones de navegador con latencia de decenas de milisegundos por grupo.
- Servicio de reranking de bajo coste en backend: con lotes de 5 grupos por forward pass (unos 99 ms de mediana en int8 según la model card), es viable atender peticiones concurrentes en un servidor CPU sin acelerador.
- Evaluación y ajuste de léxicos japoneses: usar las puntuaciones para detectar entradas de diccionario mal etiquetadas o lecturas inconsistentes en un lexicón.

## Benchmarks y rendimiento

La model card reporta resultados sobre el conjunto `homophone-v1` (8.000 grupos por split), con top-1 y MRR:

| Split | Grupos | Top-1 | MRR | Top-1 por azar |
|---|---:|---:|---:|---:|
| validation | 8.000 | 86,975 | 0,9289 | 23,17 |
| test | 8.000 | 86,400 | 0,9258 | 23,22 |

Datos adicionales de la model card:

| Metrica | Valor |
|---|---|
| Paridad fp32 ONNX vs PyTorch (240 grupos, 1.065 filas) | diferencia absoluta máxima 1,30e-5 (umbral 1e-4), argmax y ranking idénticos |
| Top-1 / MRR en la muestra de paridad | 0,8667 / 0,9133 |
| Diferencia int8 vs fp32 | escala de puntuaciones desplazada (máx. 0,238), argmax y ranking idénticos |
| Latencia int8, batch 1, por candidato | 15,704 ms mediana / 16,466 ms p95 |
| Latencia int8, batch 1, por grupo | 63,367 ms mediana / 93,862 ms p95 |
| Latencia int8, batch 5, un forward por grupo | 99,159 ms mediana / 102,437 ms p95 |
| Latencia fp32, batch 1, por candidato | 25,663 ms mediana / 26,406 ms p95 |

Las mediciones se realizaron en ONNX Runtime CPU con 8 hilos intra-op, secuencia 244, en el host de exportación (NVIDIA GB10, CPU EP), con carga media de 8-10, por lo que la model card las califica de conservadoras. No se han publicado comparaciones con otros rerankers japoneses en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. El fichero int8 ocupa 34,2 MB y el fp32 135,6 MB, por lo que la memoria necesaria es mínima.
- GPU: no se documenta uso de GPU; el proveedor de ejecución publicado es `CPUExecutionProvider`. Cualquier GPU serviría para ejecutar ONNX Runtime con proveedor CUDA, pero no hay cifras de latencia en GPU.
- GPU de consumo: irrelevante para el despliegue previsto; cabe en cualquier equipo, incluidos portátiles modestos, al ejecutarse en CPU.
- Despliegue: ONNX Runtime (principal), con soporte de cuantización int8 dinámica. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de ranking de este tamaño.
- Latencia y throughput: en int8, unos 15,7 ms por candidato y 63,4 ms por grupo de media en batch 1; en batch 5, unos 99,2 ms por grupo. El throughput depende del número de candidatos por grupo (la medición usó 892 candidatos en 200 grupos, es decir, unas 4,5 candidaturas por grupo).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de reranking de homófonos japoneses en la información proporcionada. La comparación se limita a la variante derivada del mismo proyecto:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `jeffpeng3/0c-ja-reranker-old` | 33,86 M | 120 tokens por lado (seq. 244) | MIT | ONNX (fp32/int8) | Checkpoint public-core, base del proyecto |
| `jeffpeng3/0c-ja-reranker-extra` | no disponible | no disponible | no disponible | no disponible | Derivado del anterior según la model card |

No se identifican en la información disponible alternativas públicas equivalentes (rerankers de homófonos para IME japonés) con las que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo altamente especializado: solo puntúa candidatos en grupos de homófonos japoneses; no genera texto ni sirve para tareas generales de NLP.
- Las puntuaciones son logits sin calibrar entre grupos; solo son comparables dentro de un mismo grupo de candidatos (mayor es mejor). No deben usarse como probabilidades.
- Layout de entrada rígido: el candidato debe ir en el índice 122 y el grafo espera el esquema `<bos>` + 120 izquierda + `<eos>` + candidato + `<eos>` + 120 derecha. Una secuencia de menos de 123 tokens no tiene slot de candidato, y un prefijo más corto descarta contexto derecho.
- Contexto limitado a 120 tokens por lado; textos más largos requieren truncado y pueden perder información relevante para la desambiguación.
- Solo japonés; no hay soporte documentado de otros idiomas.
- La cuantización int8 desplaza la escala de puntuaciones (diferencia máxima de 0,238 frente a fp32), aunque el ranking se mantiene; para comparaciones finas entre grupos conviene usar fp32.
- Riesgo de sesgo inherente al corpus: el entrenamiento se limita a fuentes públicas (Aozora Bunko, e-Gov, KAKEN, SIP3, patentes), lo que puede infrarepresentar registro coloquial, jerga moderna o variantes regionales.
- La licencia MIT cubre los pesos y los grafos ONNX, pero no relicencia el texto de entrenamiento, el tokenizador ni las fuentes léxicas; es necesario atribuir al proyecto 0C y a los publicadores upstream (NINJAL, NAIST, ICOT, Unicode Consortium) y no implicar su respaldo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el checkpoint se etiqueta como "old", lo que sugiere que puede haber una versión más reciente; conviene verificar antes de usarlo en producción.
- No se documentan evaluaciones de robustez frente a entradas adversariales ni de comportamiento fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeffpeng3/0c-ja-reranker-old
- Checkpoint derivado: https://huggingface.co/jeffpeng3/0c-ja-reranker-extra
- Repositorio de entrenamiento del proyecto 0C (referenciado en la model card, ruta `docs/reports/P2-23E-phase2.md`): no disponible como URL directa en la información proporcionada
- Paper: no disponible
- Blog o demo: no disponible
