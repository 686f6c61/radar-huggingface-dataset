# NagaYu/rebar-heading-classifier

## Resumen

Rebar heading classifier es un clasificador de líneas de encabezado para documentos japoneses, desarrollado por NagaYu. No es un modelo de lenguaje: es una regresión logística de 14 parámetros (13 pesos más sesgo) sobre 13 características heurísticas, cuya única función es responder a la pregunta binaria "¿esta línea es un encabezado?". Forma parte del proyecto Rebar, cuyo objetivo es restaurar la jerarquía de encabezados (第1章 → 1. → (1) → ア) de documentos japoneses que han sido aplanados a texto plano, y después trocearlos respetando esa jerarquía para que la recuperación en sistemas RAG no rompa artículos, tablas ni preguntas frecuentes.

El interés del modelo reside precisamente en su tamaño y en el reparto de responsabilidades. El autor sostiene que la parte difícil no es la red neuronal, sino la inferencia a nivel de documento que la rodea: el mismo marcador puede significar profundidades distintas según el documento, por lo que la profundidad se infiere de forma conjunta para todo el documento usando como prior las cadenas de marcadores de documentos públicos y normativa japonesa. Todo eso (inferencia de esquema, decodificación del árbol y chunking) son algoritmos deterministas del paquete `rebar`; el clasificador solo aporta la detección de línea de encabezado.

Se distribuye en tres formatos equivalentes: JSON con pesos y nombres de características, ONNX (~0,6 KB) y GGUF (~0,7 KB), con licencia Apache-2.0 y entrenado sobre un corpus sintético CC0. Está pensado como etapa posterior a la extracción de texto, no como parser de PDF ni como modelo multimodal de layout.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (clasificador lineal) sobre 13 caracteristicas hechas a mano; `sigmoid(x·w + b)`. No es un transformer ni un MoE |
| Parametros totales | 14 (13 pesos de caracteristicas + 1 sesgo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: el modelo clasifica una linea de texto por inferencia y no mantiene ventana de contexto. La coherencia a nivel de documento la aportan los algoritmos deterministas del paquete `rebar` |
| Tipos de cuantizacion | No aplica: los pesos se distribuyen sin cuantizar en JSON, ONNX (~0,6 KB) y GGUF (~0,7 KB) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | `heading_clf.json` (pesos + nombres de caracteristicas), `rebar_heading_clf.onnx`, `rebar_heading_clf.gguf` (arquitectura declarada `rebar-logreg`) |

Caracteristicas de entrada (13): `has_marker`, `marker_rank_norm`, `is_appendix`, `is_short`, `title_len_norm`, `ends_sentence`, `has_tab`, `looks_page_number`, `digit_ratio`, `punct_ratio`, `spaced_ratio`, `layout_indent`, `layout_heading_font`. Las dos ultimas son entradas auxiliares opcionales que valen cero cuando no hay informacion de layout.

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal de dos clases: se extrae un vector de 13 caracteristicas por linea, se calcula `sigmoid(x·w + b)` y se obtiene P(encabezado). El modelo no realiza análisis de layout ni comprensión semántica; trabaja sobre el texto ya extraido. La innovación técnica no está en la red, sino en el sistema completo: la profundidad de cada encabezado se infiere conjuntamente para todo el documento a partir de la evidencia de anidamiento, usando como prior las cadenas de marcadores de documentos públicos y textos legales japoneses, de modo que un mismo marcador (`1.`) puede resolverse como nivel superior en un memorando o como segundo nivel bajo 第3章. El reparto de tareas está explicitado por el autor: el clasificador solo detecta lineas de encabezado; la inferencia de esquema, la decodificación del árbol jerárquico y el chunking son algoritmos deterministas del paquete.

Los datos de entrenamiento proceden del corpus sintético `NagaYu/rebar-structure`, publicado bajo CC0. No se especifica en la información disponible el número de tokens, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables, en todo caso, a un clasificador lineal de este tipo). Las métricas declaradas están marcadas como no verificadas (`verified: false`) en el model-index.

## Capacidades

- Detección de líneas de encabezado en texto japonés: clasificación binaria línea a línea con salida de probabilidad.
- Soporte del marcador de token-classification como `pipeline_tag` en HuggingFace, aunque la unidad de decisión real es la línea completa.
- Integración en el pipeline Rebar para restaurar la jerarquía completa de un documento (`Rebar().outline(text)`).
- Chunking guiado por estructura (`Rebar().chunk(text, max_len=800)`), que corta a lo largo del árbol restaurado en lugar de por longitud fija.
- Uso opcional de señales de layout (`layout_indent`, `layout_heading_font`) como entradas auxiliares; el sistema funciona sin layout.
- Exportación portable a ONNX y contenedor GGUF.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente.

## Casos de uso

- Chunking consciente de estructura para RAG en japonés: el clasificador alimenta la restauración del árbol y el troceado posterior, de modo que cada fragmento respeta la jerarquía de encabezados en lugar de cortar por longitud fija.
- Documentos legales y normativa japonesa: el prior de cadenas de marcadores (第N条, 第N章, apartados numerados) permite recuperar y segmentar artículos y disposiciones sin partir una cláusula de su encabezado.
- Recuperación que preserva tablas: según las métricas reportadas por el autor, el chunking guiado por estructura eleva el recall@1 de respuesta completa en tablas al 96,6 % frente a aproximadamente el 64 % del troceado de longitud fija.
- Preprocesado de FAQ y documentación interna: mantiene intactos los pares pregunta-respuesta, uno de los modos de fallo que el autor declara reducido al 0 % con el troceado estructural.
- Generación automática de índices y tablas de contenido a partir de texto plano extraído de PDF, usando `Rebar().outline(text)`.
- Limpieza de corpus tras OCR o extracción de PDF: reconstruye la jerarquía perdida en la conversión a texto plano antes de indexar.
- Indexación ligera en entornos sin GPU: al ocupar menos de 1 KB y depender solo de ONNX Runtime, es viable en contenedores mínimos, dispositivos de borde o funciones serverless.
- Deduplicación y normalización de marcadores en repositorios documentales heterogéneos: al inferir el esquema de cada documento por separado, permite comparar estructuras entre documentos con convenciones distintas.
- Prefiltrado barato previo a un modelo mayor: descarta líneas no encabezado antes de aplicar etapas más costosas de análisis.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (marcados como no verificados) y en la tabla de la model card. Dataset: `NagaYu/rebar-structure` (sintético).

| Conjunto | F1 deteccion de encabezado | Precision de profundidad | Concordancia de arbol |
|---|---:|---:|---:|
| Test (esquemas vistos, limpio) | 0,997 | 1,000 | 1,000 |
| Hard (esquemas NO vistos, limpio) | 0,995 | 1,000 | 1,000 |
| Test (texto dañado) | 0,53 | 0,81 | 0,59 |

Métricas adicionales declaradas para el sistema completo (no solo el clasificador):

| Metrica | Valor |
|---|---:|
| Fallos de article↔proviso, table↔title y FAQ Q↔A tras chunking estructural | 0 % |
| Recall@1 de respuesta completa en tablas (chunking estructural) | 96,6 % |
| Recall@1 de respuesta completa en tablas (longitud fija, referencia del autor) | ~64 % |

El model-index solo declara de forma explícita F1 de detección de encabezado de 0,997 en test limpio y precisión de profundidad de 1,000 (tanto en test limpio como en el conjunto HARD con esquemas no vistos). Los valores de 0,995, 1,000 y 0,59 para el conjunto dañado provienen de la tabla del README. No se han publicado resultados de benchmarks en la información disponible más allá de estos.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El modelo es una regresión logística de 14 parámetros y no requiere GPU.
- GPU recomendadas: ninguna. Funciona en cualquier CPU x86 o ARM.
- ¿Cabe en GPU de consumo? No aplica; el artefacto ONNX ocupa aproximadamente 0,6 KB y el GGUF aproximadamente 0,7 KB, por lo que cabe en cualquier dispositivo con memoria disponible medida en kilobytes.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`) para el grafo portable, el paquete Python `rebar` para el pipeline completo (`pip install "git+https://github.com/NagaYu/rebar"`), o la carga directa del JSON de pesos. El fichero GGUF es un contenedor de pesos conforme al formato con arquitectura `rebar-logreg`, pero no es un modelo de llama.cpp y no debe cargarse como LLM en ese runtime; tampoco es desplegable en vLLM ni TGI, que están orientados a transformers generativos.
- Latencia y throughput estimados: no disponibles. No se han publicado medidas de latencia ni de rendimiento por segundo en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación numérica no está disponible. A continuación se contrasta cualitativamente el enfoque con las categorías de solución habituales para el mismo problema.

| Alternativa | Parametros | Contexto | Enfoque | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| NagaYu/rebar-heading-classifier | 14 | No aplica (linea a linea) | Regresion logistica sobre 13 caracteristicas + algoritmos deterministas de arbol | Apache-2.0 | F1 0,997 en test limpio (no verificado) |
| Parsers multimodales de PDF basados en LLM | Miles de millones | Decenas de miles de tokens | Analisis de layout y vision sobre la pagina | Variable segun modelo | No disponible |
| Reglas y expresiones regulares sobre marcadores | 0 | No aplica | Heuristicas manuales por convencion | No aplica | No disponible |
| Clasificadores de texto tipo transformer afinados | Millones a cientos de millones | 512-8.192 tokens | Clasificacion supervisada sobre texto | Variable | No disponible |

La diferencia de planteamiento es relevante: el autor posiciona Rebar explícitamente como la etapa posterior a la extracción de texto y no como un parser de layout, de modo que compite con soluciones mucho mayores en coste pero no cubre el mismo alcance funcional.

## Limitaciones y advertencias

- Modelo específico para japonés (ja); no hay evidencia de funcionamiento en otros idiomas.
- No realiza análisis de layout ni es un parser multimodal de PDF; requiere texto ya extraído.
- Entrenado sobre un corpus sintético (CC0): el comportamiento sobre documentos reales con ruido, OCR defectuoso o convenciones atípicas no está caracterizado en la información disponible.
- Degradación acusada con entrada dañada: el F1 de detección cae a 0,53, la precisión de profundidad a 0,81 y la concordancia de árbol a 0,59, frente a valores cercanos a 1,0 en texto limpio.
- Las métricas declaradas están marcadas como no verificadas (`verified: false`) y no se han replicado de forma independiente.
- Al ser un clasificador lineal sobre 13 características, no hay comprensión semántica: la decisión depende de marcadores, longitud, puntuación y patrones superficiales.
- El fichero GGUF no es compatible con llama.cpp pese a la extensión; usarlo como si fuera un LLM en ese runtime es un error de integración.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no genera texto), pero sí existe riesgo de falsos positivos y falsos negativos en la detección de encabezados y de errores propagados a la jerarquía y al chunking.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia. Los datos de entrenamiento son CC0, lo que reduce el riesgo de contaminación de licencias.
- Adopción nula en el momento del análisis (0 descargas, 0 likes) y repositorio de tamaño prácticamente vacío (0,0 GB en metadatos de HuggingFace): conviene validar el comportamiento con documentos propios antes de llevarlo a producción.
- La coherencia de la jerarquía depende de los algoritmos deterministas del paquete `rebar`, no solo del clasificador; un fallo en la inferencia de esquema a nivel de documento afecta a todo el árbol aunque la detección de línea sea correcta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NagaYu/rebar-heading-classifier
- Código y documentación: https://github.com/NagaYu/rebar
- Demo en vivo (Space): https://huggingface.co/spaces/NagaYu/rebar
- Dataset de estructura: https://huggingface.co/datasets/NagaYu/rebar-structure
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por la búsqueda corresponden a un grupo musical y no guardan relación con este modelo.
