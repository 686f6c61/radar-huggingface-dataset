# jeffpeng3/0c-ja-reranker-extra

## Resumen
El modelo `jeffpeng3/0c-ja-reranker-extra` es un reranker especializado en japonés desarrollado por jeffpeng3 para el motor de entrada (IME) 0C. Su función concreta es resolver el problema de los homófonos en japonés: dado un token ancla y un conjunto de candidatos de diccionario que comparten la misma lectura, el modelo puntúa cada superficie candidata en función de su contexto izquierdo y derecho. No es un modelo generativo ni un LLM conversacional, sino un encoder transformer con una cabeza escalar que produce un logit por candidato.

Arquitectónicamente es un transformer encoder compacto: dimensión oculta D512, 8 capas, 8 cabezas de atención y 33.864.193 parámetros totales. El checkpoint se distribuye en formato ONNX (int8 dinámico como fichero de despliegue, con fp32 de referencia no publicado) y está pensado para inferencia en CPU con ONNX Runtime, con una latencia mediana de 21,52 ms por grupo de candidatos en el hardware de exportación.

Su relevancia radica en el nicho: los IME japoneses necesitan desambiguar homófonos en tiempo real, y este modelo demuestra que un encoder de 33M de parámetros bien ajustado puede superar a una línea base de trigramas y operar con un coste de memoria de apenas 62 MB atribuibles al modelo. La licencia CC BY-SA 4.0 permite uso comercial con obligaciones de compartir-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (D512, 8 capas, 8 cabezas) con cabeza escalar sobre el slot del candidato |
| Parametros totales | 33.864.193 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 60 tokens por lado (secuencia 124: BOS + 60 izquierda + EOS + candidato + EOS + 60 derecha) |
| Tipos de cuantizacion | int8 dinámica (fichero de despliegue); fp32 disponible como referencia pero no publicado |
| Idiomas soportados | japonés (ja) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | ONNX (`model.int8.onnx`); vocabulario SentencePiece de 32.768 piezas en `vocab.model` y `vocab.json` |

## Arquitectura y entrenamiento
El modelo es un transformer encoder de 8 capas con dimensión oculta 512 y 8 cabezas de atención. Sobre la representación del slot del candidato se aplica una cabeza escalar que produce un logit en bruto; los scores son comparables únicamente dentro de un mismo grupo de candidatos (mayor es mejor). El vocabulario es el SentencePiece del public-core, con 32.768 piezas, y los ids especiales son `pad=0`, `unk=1`, `bos=2`, `eos=3`.

El checkpoint publicado es el candidato de envío bajo CC BY-SA 4.0: pesos iniciales del public-core más 2.000 pasos de ajuste fino sobre el corpus experimental CC BY-SA. Se entrenó con 120 tokens por lado y posiciones absolutas aprendidas, pero el grafo de despliegue conserva esas posiciones absolutas mientras acorta la secuencia a 124. El layout es crítico: el token izquierdo más cercano queda en la posición 120, el candidato en la 122 y el token derecho más cercano en la 124; los position ids están embebidos en el grafo ONNX. Alimentar el layout compacto con posiciones `arange` por defecto pierde aproximadamente 9 puntos de top-1. El contexto izquierdo se alinea a la derecha en sus 60 slots, el derecho a la izquierda, y los slots no usados se rellenan con id 0 y máscara 0. La información disponible no detalla la composición completa del corpus de ajuste fino ni si hubo RLHF/DPO, aunque por la naturaleza de la tarea (reranking supervisado) se trata de aprendizaje con etiquetas de candidato correcto.

## Capacidades
- Reranking de candidatos homófonos en japonés: puntúa cada superficie candidata en función de su contexto izquierdo y derecho.
- Puntuación contextual con ventana de 60 tokens por lado, suficiente para capturar colocaciones y patrones de estilo.
- Modo de gating top-3: evalúa solo los tres candidatos estadísticamente mejores, con un techo de cobertura de top-1 del 98,21 % en el conjunto combinado y del 92,00 % en la sonda de estilo.
- Inferencia por lotes: acepta batch de candidatos en una sola pasada (batch 5 medido) o evaluación individual por candidato.
- Exportación ONNX con eje de secuencia dinámico: acepta secuencias menores de 124, aunque solo reproducen las posiciones entrenadas para el prefijo, por lo que en producción se recomienda rellenar hasta 124.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking; es un modelo de scoring, no generativo.
- Capacidad multilingüe limitada al japonés.

## Casos de uso
- Desambiguación de homófonos en un IME japonés: el modelo recibe el contexto izquierdo y derecho alrededor del ancla y los candidatos del diccionario que comparten lectura, y devuelve el logit de cada superficie para que el IME elija la conversión correcta. Es su caso de uso nativo y para el que fue entrenado.
- Corrección de texto japonés post-OCR: tras un OCR que confunde kanjis homófonos, el reranker puntúa cada candidato según el contexto de la frase y permite seleccionar la superficie correcta sin un LLM generativo.
- Normalización de transcripciones fonéticas: en pipelines de ASR japonés que producen lecturas en kana, el modelo ayuda a elegir la superficie kanji correcta en función del contexto conversacional o de negocio.
- Reordenación de sugerencias en teclados y editores: con latencias de 21,52 ms medianos por grupo en CPU, es viable integrarlo en la ruta interactiva de un editor para reordenar candidatos de autocompletado de conversión.
- Filtrado de candidatos en motores de búsqueda japoneses: dado un término con lecturas ambiguas, el modelo puede puntuar variantes de superficie para mejorar la coincidencia contextual en la indexación.
- Evaluación de calidad de diccionarios y corpus: la sonda de estilo por género (conversación, negocios, web) permite medir qué tan bien un diccionario cubre registros concretos y detectar sesgos de estilo en los candidatos.
- Despliegue en entornos con recursos limitados: con 62 MB de delta de memoria y ONNX Runtime en CPU, encaja en dispositivos sin GPU o en servicios con presupuesto de memoria ajustado.

## Benchmarks y rendimiento

Conjunto de test combinado P2-23F, 16.000 grupos (8.000 public-core + 8.000 CC BY-SA):

| Modelo | top-1 | MRR | public top-1 | extra top-1 |
|---|---:|---:|---:|---:|
| Este modelo, rerank completo | 85,36 | 0,9187 | 82,60 | 88,11 |
| Este modelo, gating top-3 | **86,45** | **0,9242** | 83,98 | 88,93 |
| Línea base trigram-left | 85,76 | 0,9188 | 84,76 | 86,75 |
| Mismo checkpoint, contexto 240 tokens | 85,92 | 0,9222 | 83,40 | 88,45 |

Sonda de estilo de autor, 400 frases cortas:

| Género | Este modelo | Gating top-3 | Trigram-left |
|---|---:|---:|---:|
| Conversación | 69,29 | 72,86 | 55,71 |
| Negocios | 75,38 | 73,08 | 62,31 |
| Web | 80,00 | 79,23 | 63,08 |
| Global | 74,75 | 75,00 | 60,25 |

Latencia (ONNX Runtime CPU, 8 hilos intra-op, secuencia 124, mediana / p95 por grupo):

| Métrica | Mediana | p95 |
|---|---:|---:|
| `model.int8.onnx`, batch 1 por grupo (3-8 candidatos) | 21,52 ms | 32,08 ms |
| `model.int8.onnx`, batch 5 por grupo (una pasada) | 23,16 ms | 23,36 ms |
| Batch 1 por candidato | 5,35 ms | 5,42 ms |

Arranque en frío en proceso nuevo (creación de sesión + primera inferencia, caché de páginas caliente): 86,47 ms (creación de sesión 76,90 ms, primera inferencia 9,57 ms). RSS: 51,04 MB antes de cargar, 108,16 MB después de cargar, 113,16 MB tras inferencia; delta atribuible al modelo 62,11 MB, pico 113,16 MB. El fichero fp32 no se publica; su mediana batch 5 es de 39,57 ms como referencia.

Paridad: fp32 ONNX frente a PyTorch, 240 grupos del test combinado a seq 124 (1.091 filas de candidatos), con ids de token idénticos y diferencia máxima absoluta de score de 2,98e-5 (umbral 1e-4), argmax y ranking idénticos. int8 es informativo: diferencia máxima de score 0,241 con el mismo top-1 y una diferencia de MRR de 0,0007 en los grupos de paridad, por lo que no se reclama paridad numérica exacta para int8.

## Requisitos de hardware
- VRAM: no aplica en el despliegue de referencia, que es CPU con ONNX Runtime. El delta de memoria atribuible al modelo es de 62,11 MB y el pico de RSS de 113,16 MB incluyendo Python y onnxruntime.
- GPU recomendadas: no se documentan requisitos de GPU; las mediciones se hicieron en el host de exportación (NVIDIA GB10) usando el CPU Execution Provider. Cualquier GPU consumer moderna podría ejecutarlo, pero no hay cifras publicadas.
- Cabe en GPU consumer: sí, por tamaño (33,9M de parámetros), aunque el despliegue previsto es CPU.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider) es el soporte de referencia; al ser un grafo ONNX estándar, es portable a otros runtimes ONNX, pero no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un reranker de este tipo).
- Latencia y throughput: 21,52 ms medianos por grupo en batch 1 y 23,16 ms en batch 5; 5,35 ms por candidato en evaluación individual. El host estaba compartido con otras tareas (load average 6,2 en el momento de la medición), por lo que las cifras absolutas son conservadoras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | top-1 (combinado) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `jeffpeng3/0c-ja-reranker-extra` | 33,9M | 60 tokens por lado (seq 124) | 85,36 (86,45 con gating top-3) | CC BY-SA 4.0 | ONNX en Hugging Face |
| Línea base trigram-left | no disponible | no disponible | 85,76 | no disponible | no disponible |
| Mismo checkpoint a 240 tokens | 33,9M | 240 tokens | 85,92 | CC BY-SA 4.0 | no disponible como fichero separado |

No se dispone de datos de otros rerankers japoneses comparables en la información proporcionada; la comparación directa disponible es contra la línea base de trigramas y contra la variante de contexto largo del mismo checkpoint.

## Limitaciones y advertencias
- Modelo de nicho: solo japonés y solo para reranking de homófonos; no es un modelo generativo ni un LLM, y no sirve para tareas generales de texto.
- El layout de posiciones es obligatorio: usar `arange` por defecto en lugar de los position ids embebidos en el grafo pierde aproximadamente 9 puntos de top-1. En producción hay que rellenar hasta 124.
- Los scores son logits en bruto y solo comparables dentro de un mismo grupo de candidatos; no tienen interpretación absoluta.
- La cuantización int8 no tiene paridad numérica exacta con fp32 (diferencia máxima de score 0,241), aunque mantiene el mismo top-1 y una diferencia de MRR de 0,0007.
- El techo de cobertura del gating top-3 es del 98,21 % en el conjunto combinado y del 92,00 % en la sonda de estilo, por lo que el top-1 con gating no puede superar esos valores.
- La sonda de estilo muestra un rendimiento claramente inferior en conversación (69,29) frente a web (80,00), lo que sugiere menor robustez en registros coloquiales.
- La licencia CC BY-SA 4.0 impone obligaciones de atribución y compartir-igual para obras derivadas, lo que puede condicionar el uso comercial en productos propietarios.
- El corpus de ajuste fino es el "CC BY-SA experimental corpus" y la información disponible no detalla su composición completa ni posibles sesgos; no se han publicado evaluaciones de sesgo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de puntuaciones erróneas en contextos fuera de distribución (registros no representados en el entrenamiento).
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado; es un artefacto muy reciente y sin validación comunitaria independiente.

## Enlaces
- Hugging Face: https://huggingface.co/jeffpeng3/0c-ja-reranker-extra
- Informe de entrenamiento 0C: `docs/reports/P2-25C-extra-export.md` (referenciado en la model card, no se proporciona URL directa)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
