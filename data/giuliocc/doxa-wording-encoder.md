# Giuliocc/doxa-wording-encoder

## Resumen

DOXA contextual wording encoder es un modelo de clasificación de texto en inglés desarrollado por Giuliocc (proyecto TACITUS) que detecta sesgo de elección léxica ("wording bias") en pasajes de prensa. Se construye mediante fine-tuning completo del encoder y la cabeza de clasificación de `sentence-transformers/all-MiniLM-L6-v2`, un transformer BERT de 22,7 millones de parámetros. La tarea original proviene de los juicios de elección de palabras de mayoría experta del corpus BABE.

El modelo resuelve un problema concreto: dado un pasaje en inglés, devuelve una etiqueta de tres estados (flag de wording, sin flag, o no resuelto bajo el umbral de incertidumbre publicado). Está pensado como una criba provisional para revisión contextual, no como un veredicto automático, y se distribuye con un pipeline nativo en transformers y una exportación cuantizada ONNX de aproximadamente 23,2 MB que permite inferencia local en navegador.

Su relevancia actual radica en la combinación de tamaño reducido, licencia Apache-2.0 y un informe de evaluación con controles apareados: alcanza 0,789 de macro-F1 en 384 juicios de grupos fuente reservados, con una ganancia de 0,047 sobre el mejor control léxico o DOXA actual (intervalo bootstrap agrupado al 95 %: [0,003, 0,092]). La versión cuantizada obtiene 0,784, con un intervalo de ganancia que incluye el cero, por lo que el autor la presenta explícitamente como criba provisional pendiente de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (MiniLM-L6) con cabeza de clasificación, fine-tuning completo |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (entradas más largas se marcan como no resueltas) |
| Tipos de cuantizacion | Exportación cuantizada ONNX (pesos ~23,2 MB); no se detallan otros esquemas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2`, fijado en el commit `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`, y aplica fine-tuning completo tanto del encoder como de la cabeza de clasificación. La cabeza nativa devuelve dos logits de clase; el helper de inferencia y el navegador aplican un escalado de temperatura de validación y un umbral de incertidumbre para producir el tercer estado "no resuelto". El entrenamiento se realizó en CPU local, con semilla 1729 y sin coste adicional, usando AdamW, entropía cruzada balanceada, entrada de 256 tokens y una búsqueda fija de hiperparámetros con tasas de aprendizaje 2e-5 y 5e-5 durante tres épocas cada una. La validación seleccionó 5e-5 en la época 2.

El conjunto de datos procede del benchmark DOXA: 3.639 juicios admitidos con votos expertos originales, admisión por mayoría estricta y roles de grupo fuente, divididos en 2.950 de entrenamiento, 305 de validación y 384 reservados. El texto de los artículos se restauró localmente desde la fuente upstream fijada; los artefactos públicos contienen identificadores y predicciones en lugar de extractos. Los controles candidato y congelado usan únicamente el texto del pasaje: los votos de anotadores, la fuente, el medio y el tema quedan fuera de las características. El benchmark público está fijado en `bea9a3f2d53b03069b0d814094ea860d75f1c322` (etiqueta `v0.1.0`).

## Capacidades

- Clasificación de sesgo de elección léxica en pasajes de prensa en inglés, con salida de tres estados: flag de wording, sin flag, o no resuelto.
- Calibración por temperatura de validación y umbral de incertidumbre documentado en la salida estructurada.
- Registro del método de calibración, el umbral de resolución y el recuento real de tokens en cada resultado.
- Inferencia local en navegador mediante el grafo ONNX cuantizado y el tokenizador publicados.
- Inferencia en Python mediante ONNX Runtime y el manifiesto de runtime publicado (`inference.py`).
- Compatible con text-embeddings-inference y endpoints según los tags del repositorio.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Revisión editorial de prensa: el modelo criba pasajes de artículos en inglés y señala posibles elecciones léxicas sesgadas para que un editor humano lea la fuente original y decida si procede revisión.
- Moderación de contenido informativo: integrado en un pipeline previo a publicación, marca pasajes candidatos a revisión contextual sin bloquear automáticamente, gracias a su salida de tres estados con umbral de incertidumbre.
- Investigación en comunicación política: permite etiquetar corpus de noticias en inglés a bajo coste (23,2 MB de pesos, inferencia en CPU) para estudios exploratorios de sesgo léxico, siempre con validación humana posterior.
- Despliegue en navegador o en el borde: la exportación ONNX cuantizada permite ejecutar la comprobación localmente tras la descarga pública de activos, útil en herramientas de lectura o extensiones que no quieren enviar texto a un servidor.
- Filtrado previo en pipelines de anotación: al devolver "no resuelto" para entradas de más de 256 tokens, obliga a segmentar documentos largos en pasajes y a conservar el contexto de fuente, lo que encaja en flujos de anotación asistida.
- Auditoría de medios a pequeña escala: con 0,789 de macro-F1 en grupos fuente reservados, sirve como primera pasada en revisiones de estilo y encuadre, complementada con revisión humana y con el informe de evaluación y límites publicado.
- Docencia y demostraciones: los ejemplos ficticios de `illustrations.json` contienen salidas reales con procedencia declarada, útiles para mostrar el comportamiento del modelo y sus fallos en clase o talleres.

## Benchmarks y rendimiento

| Metrica | Modelo nativo | Modelo cuantizado | Mejor control (lexico/DOXA actual) |
|---|---|---|---|
| Macro-F1 (384 juicios, grupos fuente reservados) | 0,789 | 0,784 | 0,742 (ganancia de 0,047) |
| Intervalo bootstrap agrupado al 95 % de la ganancia | [0,003, 0,092] | incluye el cero | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El autor advierte que el intervalo de ganancia de la exportación cuantizada incluye el cero y que se necesita evaluación independiente adicional.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,7 millones de parámetros en fp32 el modelo ocupa aproximadamente 91 MB, y la exportación cuantizada ONNX ronda los 23,2 MB de pesos.
- GPU recomendadas: no requiere GPU; el entrenamiento se realizó en CPU local y la inferencia funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en cualquier GPU consumer e incluso en navegador mediante ONNX Runtime Web.
- Opciones de despliegue: transformers (pipeline nativo), ONNX Runtime con `inference.py`, text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Giuliocc/doxa-wording-encoder | 22,7 M | 256 tokens | Clasificación de wording bias en inglés | Apache-2.0 | Hugging Face, ONNX, navegador |
| sentence-transformers/all-MiniLM-L6-v2 (base) | 22,7 M | 256 tokens | Embeddings de frases | Apache-2.0 | Hugging Face |
| Controles léxicos y DOXA actual del benchmark | no disponible | no disponible | Clasificación de wording bias | no disponible | Referenciados en el informe de evaluación |

No se dispone de comparación con otros clasificadores de sesgo de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una criba provisional de wording para revisión contextual; no es un veredicto automático ni una medida de sesgo general.
- Un flag positivo puede aparecer en crítica legítima, defensa declarada o habla atribuida; hay que leer la fuente original y preservar el significado político respaldado.
- El género evaluado es prensa en inglés muestreada; artículos académicos y otros dominios requieren validación separada.
- El conjunto de datos solo soporta una tarea binaria de wording; otras cuestiones de prejuicio, validez investigadora o sesgo comparativo necesitan sus propias etiquetas y evidencia.
- Los mismos medios pueden aparecer en roles de entrenamiento y de test, y persisten imperfecciones documentadas en las URL de fuente.
- La exportación cuantizada tiene un intervalo de ganancia al 95 % que incluye el cero; se necesita evaluación independiente antes de hacer afirmaciones amplias de calidad de servicio.
- Entradas de más de 256 tokens se marcan como no resueltas; los documentos largos requieren selección de pasajes y contexto de fuente.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación.
- Sesgos conocidos: no documentados explícitamente en la información disponible más allá de las advertencias de alcance.
- Licencia Apache-2.0 permite uso comercial, pero las licencias y derechos de los artículos originales se documentan en el benchmark y deben respetarse; el texto restaurado debe permanecer en el espacio de trabajo local del benchmark.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Giuliocc/doxa-wording-encoder
- Benchmark: https://huggingface.co/datasets/Giuliocc/doxa-wording-benchmark
- Aplicación DOXA: https://doxa.tacitus.me/
- Proyecto TACITUS: https://tacitus.me/doxa/
- Repositorio GitHub: https://github.com/sargonxg/DOXA-by-TACITUS
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
