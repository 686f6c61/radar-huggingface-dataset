# DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated

## Resumen

DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated es un ajuste fino desarrollado por DuoNeural (Aura, Archon y Jesse) sobre su propio modelo base abliterado DuoNeural/LFM2.5-8B-A1B-Abliterated. Se presenta como un modelo orientado a agentes autónomos de programación, con formato de llamada a funciones estilo Hermes y un bucle de razonamiento explícito mediante etiquetas XML. Su propuesta principal es combinar una arquitectura híbrida de espacio de estados con mezcla de expertos (MoE) dispersa, activando solo una fracción de los parámetros por token.

El modelo tiene 8.467.856.832 parámetros totales (unos 8,47 mil millones) y, según su model card, activa aproximadamente 1.500 millones de parámetros por token, con una ventana de contexto declarada de 128.000 tokens. Está publicado con la licencia liquid-foundation-model-community-license y en el momento de los datos disponibles acumulaba 0 descargas y 0 likes, lo que indica que es un lanzamiento muy reciente y sin adopción pública medible.

Su relevancia radica en tres ejes: la arquitectura híbrida SSM + MoE, el enfoque "abliterated" (eliminación de vectores de rechazo) que lo orienta a tareas de sistemas, seguridad ofensiva y ingeniería inversa, y su formato nativo de agente con `<thought>`, `<tool_call>` y `<tool_response>`. No obstante, las métricas publicadas son preliminares, con muestras pequeñas, y no hay datos de idiomas soportados ni evaluaciones independientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida de espacio de estados (SSM) + mezcla de expertos (MoE) dispersa; 18 capas LTV/LIV de convolución con puerta, 6 capas de Grouped-Query Attention (GQA), 32 expertos SwiGLU con enrutado top-4 |
| Parámetros totales | 8.467.856.832 (8,47 mil millones; la model card indica "8,3 mil millones") |
| Parámetros activos | Aproximadamente 1.500 millones por token según la model card (la nomenclatura "A1B" del nombre sugiere ~1.000 millones; no disponible el dato exacto oficial) |
| Longitud de contexto | 128.000 tokens (según la model card) |
| Tipos de cuantización | safetensors en precisión completa y GGUF; se menciona explícitamente Q4_K_M, pero no se detalla el catálogo completo de cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | liquid-foundation-model-community-license (enlace: https://www.liquid.ai/community-license) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura combina componentes de espacio de estados y atención. Según la model card, el modelo integra 18 capas "Linear Input Variant" (LIV) de convolución con puerta, que mantienen un uso de memoria lineal durante la inferencia, junto con 6 capas de Grouped-Query Attention (GQA) responsables de mantener el contexto de largo alcance hasta 128.000 tokens. La parte de mezcla de expertos consta de 32 expertos SwiGLU con enrutado top-4, orientados a manejar sintaxis de programación y lógica. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

El modelo es un ajuste fino sobre una base ya "abliterated" (DuoNeural/LFM2.5-8B-A1B-Abliterated), cuyo proceso de abliteración elimina direcciones de rechazo de los pesos. Sobre esa base se aplica un entrenamiento específico para comportamiento agéntico y de programación, con un bucle nativo que emite deliberación en `<thought>`, llamadas estructuradas en `<tool_call>` con cargas JSON, e ingesta de resultados, excepciones de compilador y trazas de fallo dentro de `<tool_response>`. El formato de prompt es ChatML combinado con XML estilo Hermes (etiquetas `<|im_start|>` y `<|im_end|>`).

## Capacidades

- Generación de texto conversacional y de código, con pipeline declarado `text-generation`.
- Razonamiento agéntico multi-paso mediante bucle explícito `<thought>` → `<tool_call>` → `<tool_response>`.
- Llamada a funciones (function calling) en formato Hermes, con salida XML y JSON parseable.
- Reparación iterativa de código: consume tracebacks, excepciones de compilador y fallos de tests para refinar soluciones.
- Capacidades de programación en Python (el benchmark reportado es HumanEval) y razonamiento matemático (GSM8K).
- Modelo "abliterated"/sin censura declarada, orientado a tareas de sistemas de bajo nivel, ingeniería inversa y seguridad ofensiva.
- Capacidades multilingües: no disponible.
- Modo de visión, audio u otras modalidades: no disponibles (no se mencionan).

## Casos de uso

- Agentes de codificación autónoma: el modelo puede recibir un repositorio, ejecutar tests, leer los fallos en `<tool_response>` y proponer parches de forma iterativa, aprovechando su formato nativo de bucle agéntico.
- Integración en pipelines de CI/CD: mediante tool calling estructurado puede invocar comandos de shell (por ejemplo `pytest`), interpretar la salida y aplicar correcciones automáticas antes del merge.
- Asistente de depuración de sistemas de bajo nivel: al ser abliterado y sin vectores de rechazo, está pensado para el análisis de binarios, firmware y tareas de reversing donde otros modelos alineados tenderían a negarse.
- Automatización de pruebas de penetración en entornos autorizados: puede generar y encadenar comandos de reconocimiento y explotación dentro de un marco de tool calling, siempre bajo supervisión humana y cumplimiento legal.
- Agente de atención al cliente técnico: con 128.000 tokens de contexto puede mantener conversaciones multi-turno largas y consultar herramientas internas mediante JSON.
- Generación de código en producción con verificación: su formato de llamada a funciones facilita conectarlo a linters, ejecutores de tests y APIs de despliegue dentro de un mismo bucle de agente.
- Despliegue en hardware de gama baja: gracias a la activación parcial de parámetros y a la cuantización Q4_K_M (menos de 6 GB de VRAM), es viable ejecutarlo en equipos consumer e incluso en GPUs antiguas como una GTX 1070 para tareas de asistencia local.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor, que los describe como una validación preliminar realizada directamente sobre el motor GGUF Q4_K_M, con muestras reducidas y a la espera de una evaluación más amplia y de un ajuste v2.

| Benchmark / evaluación | Resultado reportado | Nota |
|---|---|---|
| Hermes Function Calling AST Rate | 100,0% (25/25) | Sin deriva sintáctica; llamadas XML/JSON parseables |
| HumanEval (Python) | 75,0% Pass@1 (15/20) | Generación de código zero-shot |
| GSM8K | 60,0%+ | Razonamiento matemático |
| Abliteration & Safety Alignment | 100% sin censura | Sin rechazos en tareas de sistemas y seguridad |
| Throughput en RTX 3090 | ~380–395 tokens/s | Iteración agéntica multi-turno sub-segundo |
| Throughput en GTX 1070 | ~90 tokens/s | Ejecución en hardware antiguo |

No se han publicado resultados de benchmarks independientes ni comparativas con otros modelos en la información disponible. Los tamaños de muestra (20 y 25 ejemplos) son demasiado pequeños para extraer conclusiones robustas.

## Requisitos de hardware

- VRAM estimada: menos de 6 GB con cuantización Q4_K_M según la model card; el repositorio completo en safetensors ocupa 17,0 GB.
- GPU recomendadas: RTX 3090 reportada con ~380–395 tokens/s; GTX 1070 reportada con ~90 tokens/s. No se detallan requisitos mínimos formales.
- Compatibilidad con GPU consumer: sí, el modelo declara caber en GPU consumer con Q4_K_M (menos de 6 GB), incluidas tarjetas de gama media y antigua.
- Opciones de despliegue: llama.cpp / llama-server (`llama-server -m ...Q4_K_M.gguf -c 16384 --port 8000`) y Hermes Agent CLI apuntando a un endpoint compatible con la API de OpenAI (`http://127.0.0.1:8000/v1`). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: los únicos datos son los reportados por el autor (~380–395 tokens/s en RTX 3090 y ~90 tokens/s en GTX 1070). No hay mediciones independientes.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos de categoría similar, ni datos verificables de parámetros, contexto, rendimiento o licencia de alternativas. El único modelo relacionado explícitamente mencionado es su base, DuoNeural/LFM2.5-8B-A1B-Abliterated, sobre la que se aplica este ajuste fino agéntico y de programación.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el autor no documenta sesgos ni análisis de sesgo.
- Riesgo de alucinación: no se reporta ningún estudio al respecto; los benchmarks publicados usan muestras muy pequeñas (15/20 en HumanEval y 25/25 en function calling), por lo que la fiabilidad real en producción está por confirmar.
- Limitaciones de contexto e idioma: la ventana de contexto declarada (128.000 tokens) no cuenta con evaluación publicada, y no se especifican los idiomas soportados.
- Modelo "abliterated": la eliminación de vectores de rechazo implica que puede generar contenido dañino, código malicioso o instrucciones peligrosas sin negarse. Su uso para seguridad ofensiva, reversing o pruebas de penetración exige autorización explícita y cumplimiento legal.
- Restricciones de licencia: se rige por la liquid-foundation-model-community-license, una licencia "other" no estándar; es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución.
- Madurez del modelo: 0 descargas y 0 likes en el momento de los datos, publicado en 2026, sin evaluaciones independientes ni adopción comunitaria verificable.
- Discrepancia menor entre el nombre ("A1B") y los parámetros activos declarados ("1,5B"), y entre el recuento real de safetensors (8,47 mil millones) y la cifra de la model card (8,3 mil millones); conviene verificar antes de dimensionar el despliegue.
- El ajuste v2 está anunciado como trabajo futuro, por lo que el comportamiento actual puede cambiar.

## Enlaces

- HuggingFace: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated
- Modelo base: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Abliterated
- Licencia: https://www.liquid.ai/community-license
- La búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo (los resultados obtenidos no guardan relación con el mismo); no se dispone de papers, blogs, repositorios ni demos adicionales verificables.
