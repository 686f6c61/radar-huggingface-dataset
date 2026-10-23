# longtimedevs/C3-Lite

## Resumen

C3-Lite es un motor de autocompletado contextual y predicción de siguiente palabra desarrollado por longtimedevs (proyecto LongTime), publicado en Hugging Face bajo licencia MIT. No es un modelo de lenguaje generativo al uso: se trata de un sistema híbrido que combina un modelo estadístico de n-gramas (capa L1: top-140.000 trigramas y top-70.000 bigramas) con una red neuronal recurrente a nivel de carácter de tipo 2×GRU (capa L2, con embeddings de 128 dimensiones y estado oculto de 512), entrenada desde cero. Su objetivo es ofrecer sugerencias de escritura en tiempo real con una huella mínima.

El modelo resuelve el problema del autocompletado de baja latencia en entornos con recursos limitados: según la model card, todos los artefactos ocupan unos 15 MB en disco y el tiempo de respuesta es inferior a 15 ms en CPU, sin necesidad de GPU. Frente a los teclados predictivos clásicos basados solo en frecuencias, incorpora un estado oculto que acumula hasta 512 caracteres de contexto, además de un filtro gramatical y una protección anti-bucle (veto de ciclos A→B→A→B, repetición de trigramas y duplicados inmediatos) que reducen el "drifting" sintáctico típico de los sistemas n-gram.

Es relevante ahora por su encaje en el nicho de IA en el borde (edge AI): teclados móviles, campos de búsqueda, T9 y asistentes de escritura embebidos que no pueden asumir el coste de un LLM. El modelo declara soporte de ruso e inglés, 3.458.807 parámetros reales según los safetensors publicados (la model card indica ~3,6 M) y salida limitada a los 3 mejores candidatos por pulsación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: L1 n-gramas (top-140.000 trigramas, top-70.000 bigramas) + L2 red 2×GRU a nivel de carácter (embedding 128, hidden 512) |
| Parámetros totales | 3.458.807 (~3,46 M) según safetensors; ~3,6 M según la model card |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512 caracteres (no tokens) acumulados en el estado oculto h_T |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, ONNX ni niveles de cuantización) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos del modelo) + artefactos auxiliares de n-gramas; tamaño total en disco ~15 MB |
| Pipeline declarado | text-generation (en la práctica, autocompletado / next-word prediction) |
| Salida | Top-3 candidatos tras filtro gramatical y anti-bucle |
| Latencia declarada | < 15 ms en CPU |

## Arquitectura y entrenamiento

La arquitectura es un ensamblado en cascada de dos capas. La capa L1 es un índice de n-gramas (trigramas y bigramas) que actúa como recuperador rápido de candidatos con prioridad al lenguaje coloquial. La capa L2 es una red 2×GRU a nivel de carácter que recibe el contexto del usuario (hasta 512 caracteres) y produce una puntuación de fluidez a partir del estado oculto final h_T. Sobre la unión de ambas se aplica un bloque de filtrado compuesto por un Grammar Filter (bloqueo de construcciones como "a + plural", dos artículos o dos preposiciones consecutivas) y un Hard Anti-Loop Guard que prohíbe ciclos de bigramas, bucles de trigramas y repeticiones inmediatas de palabra. La salida final son tres candidatos.

El entrenamiento se realizó desde cero sobre corpus abiertos: OPUS Tatoeba (RU/EN) para diálogo y frases cotidianas, wikitext-103-raw-v1 para inglés cohesionado con limpieza de ruido enciclopédico, y el dataset atBuba/ruwiki-dataset para oraciones en ruso depuradas. La model card no documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO (no disponible). Tampoco se detalla la función de pérdida ni el esquema de tokenización por caracteres más allá del mapeo `char_to_id` que aparece en el ejemplo de inferencia.

## Capacidades

- Predicción de siguiente palabra y completado de palabra parcial (word completion) en ruso e inglés.
- Autocompletado contextual con memoria de hasta 512 caracteres dentro del mismo texto.
- Puntuación de fluidez a nivel de carácter mediante el estado oculto de la GRU.
- Filtrado gramatical heurístico y supresión de repeticiones y bucles sintácticos.
- Generación de hasta tres candidatos ordenados por idoneidad.
- Ejecución en CPU con latencia declarada inferior a 15 ms, apta para entornos interactivos.
- Integración con el script autónomo `c3_lite.py`, que abre una interfaz Tkinter de teclado móvil en modo oscuro.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo "thinking": no es un modelo de instrucciones.

## Casos de uso

- Teclados predictivos móviles: el modelo encaja como motor T9 que sugiere la siguiente palabra o completa la actual con latencia inferior a 15 ms en CPU, sin consumir batería en GPU y con un artefacto de ~15 MB embebible en la aplicación.
- Campos de búsqueda y barras de dirección: autocompletado contextual de consultas en ruso e inglés, con filtro anti-repetición que evita sugerencias degeneradas del tipo "de de" o ciclos de dos términos.
- Asistencia a la escritura para usuarios con movilidad reducida: al requerir pocas pulsaciones y ofrecer tres candidatos filtrados gramaticalmente, reduce el esfuerzo de entrada en sistemas de comunicación aumentativa.
- Dispositivos IoT y hardware empotrado: al caber en unos 15 MB y ejecutarse en CPU, puede desplegarse en Raspberry Pi, routers o terminales de punto de venta para autocompletar formularios y mensajes.
- Preprocesado en pipelines de ASR o traducción: la capa de n-gramas y la GRU pueden usarse como rescorer de hipótesis parciales o para restaurar fluidez en transcripciones antes de pasarlas a un modelo mayor.
- Atención al cliente con respuestas guiadas: generación de sugerencias de frase en agentes de chat o correo dentro de plantillas cerradas, donde el coste de un LLM es desproporcionado y basta con completar la frase en curso.
- Herramientas CAT y traducción asistida RU-EN: sugerencias de continuación durante la postedición, aprovechando el soporte bilingüe y el filtro gramatical para no romper la concordancia.
- Demos y pruebas de concepto de autocompletado: el script `c3_lite.py` permite levantar una interfaz funcional sin infraestructura adicional, útil para validar UX antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara métricas de eficiencia (latencia < 15 ms en CPU y ~15 MB de artefactos en disco); no hay cifras de perplejidad, precisión de next-word, MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 MB en fp32 y 7 MB en fp16 para los 3,46 M de parámetros (estimación calculada, no publicada por el autor); a ello se suma la memoria de las tablas de n-gramas, no cuantificada en la información disponible.
- GPU recomendadas: ninguna necesaria. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) puede ejecutarlo, pero no aporta ventaja frente a CPU.
- Cabe en cualquier GPU consumer y en CPU de gama baja; el límite práctico es la memoria para los índices de n-gramas, no el modelo neuronal.
- Opciones de despliegue: `transformers` con `AutoModel`/`AutoTokenizer` (según el ejemplo de la model card) o el script monolítico `c3_lite.py` con interfaz Tkinter. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, previsiblemente por tratarse de una arquitectura personalizada (`c3_lite`) y no de un decoder transformer estándar.
- Latencia: < 15 ms por pulsación en CPU según el autor. Throughput en lote no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables con datos verificables. C3-Lite no es equivalente a un LLM decoder de pequeño tamaño (tipo Qwen, Gemma o Llama en la franja de 0,5-3 B): no sigue instrucciones, no genera texto libre y su contexto se mide en caracteres, no en tokens. Sus competidores naturales serían motores T9 y teclados predictivos comerciales, para los que no se aportan cifras públicas.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| C3-Lite | 3,46 M | 512 caracteres | ru, en | MIT | No disponible (solo latencia < 15 ms en CPU) |
| Alternativas de la misma categoría (motores T9 / teclados predictivos) | No disponible | No disponible | No disponible | No disponible | No disponible |
| LLM decoder pequeños (0,5-3 B) | No comparable (órdenes de magnitud superior) | En tokens | Multilingüe | Variable | No aplica a esta comparación |

## Limitaciones y advertencias

- No es un modelo de instrucciones ni de chat: no comprende peticiones, no razona y no mantiene diálogos; únicamente completa texto.
- El contexto real está acotado a 512 caracteres; más allá de ese límite el estado oculto pierde información y la coherencia temática decae.
- Solo cubre ruso e inglés; cualquier otro idioma queda fuera del alcance declarado.
- Al ser un modelo de carácter y n-gramas, puede producir continuaciones gramaticalmente plausibles pero semánticamente vacías o fuera de tema: el riesgo de "alucinación" se manifiesta como completados incoherentes, no como afirmaciones falsas verificables.
- El filtro gramatical y el anti-bucle son heurísticos y basados en reglas; pueden bloquear construcciones legítimas o dejar pasar errores no contemplados.
- No hay benchmarks publicados que permitan estimar la calidad frente a alternativas; cualquier decisión en producción debería apoyarse en una evaluación propia sobre el dominio objetivo.
- Sesgos conocidos: no documentados en la información disponible; los corpus de origen (Tatoeba, wikitext, ruwiki) pueden introducir sesgos de registro y de dominio.
- La licencia MIT permite uso comercial, modificación y redistribución, con la obligación habitual de incluir el aviso de copyright y la cláusula de exención de garantía; conviene verificar la procedencia y licencia de los corpus de entrenamiento antes de un despliegue comercial.
- La documentación está redactada en ruso y el autor no publica guía de evaluación ni métricas de calidad; el soporte de la comunidad es mínimo (0 descargas y 0 likes en el momento de la ficha).
- La carga mediante `AutoModel` con una arquitectura `c3_lite` personalizada puede requerir el código del repositorio o `trust_remote_code`; no se especifica en la model card, por lo que debe probarse antes de integrar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/longtimedevs/C3-Lite
- Sitio oficial del proyecto: https://long-time.ru
- Dataset OPUS Tatoeba (RU/EN): citado en la model card, sin enlace directo disponible
- Dataset wikitext-103-raw-v1: citado en la model card, sin enlace directo disponible
- Dataset atBuba/ruwiki-dataset: citado en la model card, sin enlace directo disponible
- Paper técnico, blog de lanzamiento, repositorio de código y demo: no disponibles en la información proporcionada
