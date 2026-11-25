# byjameson/atom-zero-49m

## Resumen

Atom Zero 49.2M es un modelo de lenguaje de tipo decoder-only transformer entrenado desde cero por el desarrollador independiente byjameson. Con 49.213.440 parámetros, 6 capas, dimensión 768, 12 cabezas de atención y una ventana de contexto de solo 128 tokens, no es un modelo fundacional sino un componente estrecho de un sistema de asistente local. El proyecto Atom Zero combina el modelo con un runtime de recuperación (RAG sobre SQLite FTS5 con embeddings híbridos), herramientas deterministas y una interfaz local, de modo que el conocimiento factual reside en la recuperación y no en los pesos.

La relevancia del modelo no está en su capacidad bruta (el autor documenta explícitamente que el conocimiento en crudo es de 2/10 y que no debe compararse con MMLU, GSM8K o HumanEval) sino en su enfoque de ingeniería: un asistente de un solo usuario, ejecutable en local, con citación de fuentes, privacidad por diseño y un paquete de software (`atomzero 0.60.0`) que integra documentos, herramientas, memoria y adaptadores LoRA revisados. El modelo se entrenó con 175,37M tokens limpios más una mezcla de replay hasta 214,8M, con un checkpoint de producto en el paso 40.000.

La ficha refleja la información disponible en la model card y en los datos de Hugging Face. El modelo está etiquetado únicamente en inglés y su licencia es Apache-2.0 tanto para código como para pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 49.213.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (código y pesos; atribución de datos en `NOTICE`) |
| Formato de pesos | no disponible (checkpoint PyTorch; el repo pesa 0,2 GB) |
| Capas / dimension / cabezas / FF | 6 / 768 / 12 / 3072 |
| Tokenizador | BPE de 8.192 tokens (`data/chat_en_bpe8k.json`) |
| Paso del checkpoint | 40.000 |
| Tokens de entrenamiento | 175,37M limpios + mezcla de replay hasta 214,8M |
| Runtime | PyTorch, CUDA o CPU; probado en RTX 3050 de 6 GB |
| Libreria | pytorch |
| Tamano del repo | 0,2 GB |
| Descargas | 359 |
| Creado / actualizado | 2026-11-21 / 2026-11-25 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con dimensión oculta de 768, 12 cabezas de atención y capa feed-forward de 3072, entrenado desde cero sobre un corpus de 175,37M tokens limpios más una mezcla de replay que eleva el total a 214,8M. El tokenizador es un BPE de 8.192 tokens específico para inglés de chat. La ventana de contexto es de solo 128 tokens, lo que limita drásticamente cualquier conversación multi-turno o documento largo dentro del propio modelo; el sistema compensa esta restricción delegando el contexto factual en la capa de recuperación.

La model card documenta un experimento de ablación controlada entre QKV y MLP con 3 semillas: la variante qkv4 alcanzó 3,33 % de exactitud y 8,89 % de copia de claves, mientras que la variante MLP obtuvo 3,33 % y 5,56 %, con veredicto no concluyente. También se probó una sonda de capacidad con una base mayor (Qwen2.5-0.5B), que alcanzó 55-85 % de exactitud en copia de 2-4 claves con análisis tolerante, frente al 0-6 % del adaptador de 49M; la decisión fue mantener el modelo de 49M entrenado desde cero como opción por defecto en la versión 0.8.0. La versión 0.50.0 había añadido enrutamiento de copia, ensayo de etapas débiles y LoRA sobre QKV. El sistema completo declara 1463 tests superados en 47,20 s y un benchmark de producto de 20/20.

## Capacidades

- Generación de texto breve en inglés para chat de comportamiento acotado.
- Razonamiento aritmético simple mediante herramienta determinista de aritmética segura.
- Consulta de hora y fecha mediante herramienta de tiempo.
- Gestión de tareas: añadir, listar y completar tareas.
- Memoria de nombre y preferencias ("likes") del usuario.
- Planificación en tres pasos mediante API de plan con lista de permitidos y confirmación explícita.
- Recuperación aumentada (RAG) sobre documentos locales con citación de fuente, título y sha256.
- Ingesta de documentos en texto, Markdown, HTML, PDF y DOCX, con citas por página o sección y panel de evidencias.
- Recuperación híbrida: SQLite FTS5, embeddings hashed/MiniLM, candidatos híbridos y reranking léxico más coseno.
- Índice vectorial con `doc_vectors` en caché, matriz numpy precalentada, ANN IVF por encima de 256 fragmentos y fallback exacto.
- Gestión de sesiones: restauración de transcripciones, exportación e importación JSON y borrado exacto.
- Investigación con cola de solo aprobados, obtención desde Wikipedia, bloqueo de trabajador y síntesis con profesor.
- Modo profesor con Ollama local o endpoint compatible con OpenAI, notas no verificadas y verificación por revisor.
- Curiosidad: detección de huecos, tema pendiente, aprobación, Wikipedia más profesor y nota RAG.
- Autoaprendizaje acotado: notas de profesor en modo hambriento (sin tocar pesos) y LoRA revisado (con pesos).
- Personalización declarativa mediante JSON en `data/skills` con disparadores, contexto local y modo plantilla o proveedor.
- Flujo diario: brief local y plan de objetivos citado, con creación de tareas solo tras confirmación explícita.
- Proveedor opcional de chat libre local con modelo mayor suministrado por el usuario (`--allow-general-chat`).
- Seguridad opcional con reglas y cabeza lineal ML local, desactivada por defecto y con fallback exacto.
- Privacidad: solo localhost, sin telemetría, guarda SSRF, límites de subida y borrado.
- Interfaz de usuario con chat, documentos, huecos, cola de investigación, notas de profesor, adaptadores y salud del sistema.
- No soporta tool calling genérico ni agentes autónomos fuera de la lista de permitidos; el uso de herramientas no supervisado está explícitamente fuera de alcance.

## Casos de uso

- Asistente personal diario local: el modelo gestiona chat breve, tareas, notas, aritmética y hora, con el brief diario y el plan de objetivos citado como flujo principal. Es adecuado porque el runtime resuelve las consultas factuales mediante RAG y herramientas, compensando la ventana de 128 tokens y el conocimiento limitado de los pesos.
- Consulta de documentación interna con citas: se ingieren manuales en PDF, DOCX, HTML o Markdown y el sistema devuelve respuestas con página o sección, título y sha256 del documento. El benchmark de documentos del autor reporta 80/80 preguntas respondibles y 20/20 no respondibles correctamente identificadas.
- Recuperación sobre corpus tipo SQuAD: el sistema híbrido alcanza 0,975 top-1 y 1,000 top-5 en SQuAD v2 con 50 contextos, y 0,884 de respuesta top-1 dentro del fragmento visible. Es útil para construir un motor de búsqueda semántica local sobre textos en inglés.
- Segundo cerebro personal: el grafo de conocimiento por fuente, el borrado por fuente y la exportación e importación de sesiones permiten mantener un archivo consultable de notas y documentos con trazabilidad de evidencias.
- Investigación asistida con verificación humana: la cola de solo aprobados, la obtención desde Wikipedia y la síntesis con profesor local (Ollama o endpoint compatible con OpenAI) permiten generar notas que un revisor verifica antes de incorporarlas al RAG.
- Personalización de habilidades sin reentrenar: los archivos JSON declarativos en `data/skills` definen disparadores, contexto local y modo plantilla o proveedor, de modo que se añaden flujos concretos (por ejemplo, resúmenes de colecciones o extracción de códigos exactos) sin tocar los pesos.
- Despliegue en hardware de consumo: el checkpoint de ~197 MB y el runtime PyTorch probado en una RTX 3050 de 6 GB permiten ejecutar el asistente completo en un portátil o equipo de sobremesa modesto, con la opción de CPU.
- Entorno con requisitos de privacidad: al operar solo en localhost, sin telemetría, con guarda SSRF y límites de subida, encaja en escenarios donde los documentos no pueden salir del equipo.

## Benchmarks y rendimiento

Los datos publicados por el autor no son comparables con benchmarks estándar de modelos fundacionales (MMLU, GSM8K, HumanEval); la propia model card excluye explícitamente cualquier afirmación de paridad con modelos frontera. Se recogen a continuación las métricas internas del sistema:

| Variante | Conocimiento en crudo | Producto | Comportamiento | Notas |
|---|---:|---:|---:|---|
| Base 49.2M | 2/10 | 21/21 | 16/16 | sin RAG ni herramientas |
| Producto 49.2M (40k) | 2/10 | 21/21 | 16/16 | corpus escalado |
| + adaptador `v0001` | 2/10 | 21/21 | 16/16 | el adaptador no añade hechos |
| + RAG y herramientas | — | 21/21 | 16/16 | respuestas con cita de fuente |
| + recuperación neuronal híbrida | — | 21/21 | 16/16 | top-1 1,000 frente a 0,850 de FTS |
| + seguridad ML opcional | — | 26/26 | 16/16 | filtro desactivado por defecto |

| Benchmark | Resultado |
|---|---|
| Documentos propios (100 preguntas) | 80/80 respondibles, 20/20 no respondibles |
| SQuAD v2, recuperación top-1 / top-5 | 0,975 / 1,000 (50 contextos, híbrido) |
| SQuAD v2, respuesta top-1 en fragmento | 0,884 (50 contextos, híbrido) |
| Scorecard de seis criterios | 1 cumplido, 3 parciales, 2 no cumplidos |
| Aritmética, city-YAML y city/river en held-out | 0/30 exacto en cada uno |
| Ablación QKV vs MLP (3 semillas) | qkv4 3,33 % exacto / 8,89 % copia de claves; MLP 3,33 % / 5,56 %; no concluyente |
| Sonda Qwen2.5-0.5B en copia de 2-4 claves | 55-85 % exacto con análisis tolerante; adaptador 49M: 0-6 % |
| Tests del sistema | 1463 superados en 47,20 s; benchmark de producto 20/20 |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa ~197 MB y el repo 0,2 GB; con 49,2M parámetros la inferencia en FP32 requiere aproximadamente 200 MB de pesos más activaciones, por lo que cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: el autor probó una RTX 3050 de 6 GB; cualquier GPU con 4 GB o más es suficiente. Para el proveedor opcional de chat libre con un modelo mayor se necesita hardware acorde a ese modelo externo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas actuales, y también en CPU.
- Opciones de despliegue: runtime PyTorch propio del paquete `atomzero` (CUDA o CPU); el proveedor opcional se conecta a Ollama o a un endpoint compatible con OpenAI. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para los pesos de 49M.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el primer arranque descarga ~197 MB de checkpoint y tokenizador desde Hugging Face.

## Comparativa con modelos similares

No hay una categoría estándar de comparación directa: Atom Zero 49.2M es un modelo de comportamiento estrecho integrado en un sistema de asistente con RAG, no un modelo fundacional. La model card ofrece una única comparación interna con Qwen2.5-0.5B como sonda de capacidad:

| Modelo | Parámetros | Contexto | Copia de 2-4 claves | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atom Zero 49.2M | 49,2M | 128 tokens | 0-6 % (adaptador) | Apache-2.0 | Hugging Face, ModelScope y paquete `atomzero` |
| Qwen2.5-0.5B (sonda) | ~500M | no disponible en la información | 55-85 % con análisis tolerante | no disponible en la información | no disponible en la información |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El conocimiento en crudo de los pesos es de 2/10; los hechos deben residir en el RAG y las habilidades en adaptadores LoRA revisados.
- La ventana de contexto es de solo 128 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos dentro del modelo.
- Solo soporta inglés; no se documentan capacidades multilingües.
- El autor excluye explícitamente el razonamiento general, la programación, las matemáticas más allá de la aritmética simple y el asesoramiento médico, legal, financiero o de seguridad crítica.
- No se permite el rastreo web autónomo, la mutación de pesos ni el uso de herramientas no supervisado.
- El funcionamiento multiinquilino o alojado requiere controles adicionales no incluidos.
- Riesgo de alucinación: aunque el sistema prioriza respuestas con cita de fuente y tiene fallback exacto, el modelo en crudo no está diseñado para generar hechos fiables.
- El adaptador `v0001` no añade hechos según la propia model card; no debe esperarse mejora de conocimiento por su uso.
- La ablación QKV vs MLP se declara no concluyente, lo que indica que las decisiones de arquitectura no están plenamente validadas.
- La licencia Apache-2.0 permite uso comercial de código y pesos, pero la atribución de datos debe respetarse según el archivo `NOTICE`.
- El filtro de seguridad ML está desactivado por defecto y debe habilitarse explícitamente para producción.
- Las cifras de benchmarks son internas del proyecto y no comparables con MMLU, GSM8K o HumanEval.

## Enlaces

- Hugging Face: https://huggingface.co/byjameson/atom-zero-49m
- Repositorio del proyecto: https://github.com/byjameson/atom-zero
- Mapa completo del proyecto: https://github.com/byjameson/atom-zero/blob/main/docs/PROJECT_OVERVIEW.md
