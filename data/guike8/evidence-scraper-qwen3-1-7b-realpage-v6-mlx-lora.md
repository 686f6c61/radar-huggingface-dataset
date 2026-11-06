# guike8/evidence-scraper-qwen3-1.7b-realpage-v6-mlx-lora

## Resumen

Evidence Scraper Qwen3-1.7B real-page v6 MLX LoRA es un adaptador LoRA experimental publicado por el desarrollador guike8 sobre el modelo base `mlx-community/Qwen3-1.7B-4bit`. Su propósito es la extracción estructurada de datos de negocio a partir de contenido de páginas web ya guardadas, seguida de la selección de identificadores de citas asignados por la aplicación, dentro de una política de extracción local en dos etapas del proyecto Evidence AI Scraper.

El adaptador no es un modelo independiente: se distribuye como tensores LoRA sin fusionar en formato MLX, por lo que requiere el checkpoint base exacto (revisión `3b1b1768f8f8cf8351c712464f906e86c2b8269e`) y un runtime MLX compatible. No se incluyen pesos base, GGUF ni un adaptador PEFT genérico. La arquitectura subyacente es la del Qwen3-1.7B original, un transformer denso de 1.700 millones de parámetros con contexto de 32.768 tokens.

La relevancia de esta ficha es fundamentalmente metodológica: el propio autor declara que la versión v6 **no superó la puerta de validación preregistrada** y no la recomienda como extractor por defecto. Los pesos se publican para hacer inspeccionable un experimento fallido, no como una mejora demostrada. Cualquier evaluación de producción debe partir de esa premisa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) con adaptador LoRA sobre capas lineales; pesos sin fusionar en MLX |
| Parametros totales | 1.700 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base Qwen3-1.7B); la política de fuente del adaptador trunca a 8.000 caracteres |
| Tipos de cuantizacion | Base en 4 bits (MLX); el adaptador se distribuye en precisión de entrenamiento, sin fusionar |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (con atribución upstream obligatoria) |
| Formato de pesos | Tensores MLX LoRA + configuración compatible; no incluye safetensors del base, ni GGUF, ni PEFT genérico |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only denso con atención estándar y 32.768 tokens de contexto. El fine-tune es un LoRA en MLX orientado a una tarea de extracción en dos fases: primero genera JSON de negocio y después selecciona identificadores de candidatos de cita preasignados por la aplicación a partir de la misma vista de fuente declarada. La recuperación, el crawling, la automatización de navegador, la selección de fuente, la recuperación de errores, la validación y la procedencia quedan fuera del modelo, en código de aplicación.

El corpus de entrenamiento es privado y consta de 48 páginas públicas guardadas de 18 familias de sitios, 96 peticiones originales de campos personalizados planos, 220 hojas escalares positivas y 22 controles opcionales de ausencia. El split TRAIN contiene 32 páginas, 64 peticiones, 146 hechos y 14 controles; validación y test de sitio reservado tienen cada uno 8 páginas, 16 peticiones, 36 y 38 hechos respectivamente, con 4 controles. Las familias de sitios y las identidades de fuente guardada son disjuntas entre splits. El etiquetado lo realizaron agentes, con revisión independiente por un segundo agente sobre HTML, datos estructurados, Markdown y contextos de evidencia exactos; no es anotación humana externa. La captura inicial usó HTTP directo y las funciones oficiales de limpieza HTML/Markdown de Firecrawl se ejecutaron en un contenedor sin red. La política automática de fuente de 8.000 caracteres selecciona párrafos originales completos mediante términos de la petición, con identificadores originales y omisiones explícitas, sin usar valores gold ni predicciones para elegir la consulta ni recortar párrafos. El dataset final de v6 contiene 560 conversaciones: 274 de negocio y 286 de grounding.

## Capacidades

- Extracción estructurada de campos de negocio en JSON con esquema completo: generó JSON válido para las 16 peticiones de validación.
- Grounding de evidencia: selección de identificadores de candidatos de cita asignados por la aplicación (33 identificadores válidos entre 34 hojas pobladas en validación, cero inválidos o ausentes y una abstención).
- Manejo de valores nulos y controles de ausencia: acertó los cuatro controles de ausencia de validación.
- Comprensión de contenido de página web ya guardado (HTML limpio, datos estructurados y Markdown), no de recuperación en vivo.
- Capacidad multilingüe limitada al inglés según la model card.
- No cubre tool calling, function calling, razonamiento multi-paso agéntico, visión ni audio de forma declarada; esas capacidades, si existen en el base, no forman parte del objetivo del adaptador.

## Casos de uso

- Extracción de fichas de negocio desde páginas ya archivadas: el adaptador interpreta el contenido guardado y devuelve JSON con campos personalizados, útil en pipelines por lotes donde la captura y la extracción están desacopladas.
- Auditoría de experimentos de extracción estructurada: al publicarse como artefacto fallido con hashes de pesos, adaptador, recibo de entrenamiento y huella de dataset, sirve para reproducir y analizar por qué el curriculum v6 degradó la precisión.
- Investigación sobre grounding y abstención: los datos de validación comparan base, v4, v5 y v6 en hechos aceptados y rechazados, lo que permite estudiar el equilibrio entre abstención excesiva y admisión de hechos erróneos.
- Prototipado local en Apple Silicon: al ser un LoRA MLX sobre un base de 4 bits, cabe en equipos de consumo y permite iterar en local sin infraestructura GPU dedicada.
- Evaluación de políticas de ventana de fuente: la política de 8.000 caracteres con omisiones explícitas es reutilizable para medir el impacto del truncado en la recuperación de hechos.
- Referencia negativa en selección de modelo: sirve como caso documentado de por qué una puerta de validación preregistrada debe bloquear la promoción de un adaptador aunque mejore métricas parciales como la mecánica de identificadores.

## Benchmarks y rendimiento

Resultados de validación publicados por el autor (36 hechos brutos, 16 peticiones, validación reutilizada para diseño de curriculum, no estimación independiente):

| Modelo | Correctos brutos /36 | Erróneos brutos | Negocio exactos /16 | Hechos aceptados correctos | Hechos aceptados erróneos | Casos aceptados /16 |
|---|---:|---:|---:|---:|---:|---:|
| Base | 28 | 7 | 9 | 23 | 3 | 11 |
| V4 | 27 | 9 | 9 | 26 | 6 | 14 |
| V5 | 28 | 8 | 10 | 5 | 2 | 3 |
| V6 | 26 | 8 | 8 | 24 | 6 | 13 |

Precisión y recall de hechos brutos en validación: V6 76,5 % / 72,2 % frente a 80,0 % / 77,8 % del base. Precisión y recall de hechos aceptados: V6 80,0 % / 66,7 % frente a 88,5 % / 63,9 % del base. La puerta fija exigía al menos 28 hechos brutos correctos, 9 registros de negocio exactos, 23 hechos aceptados correctos y como máximo 3 hechos aceptados erróneos; V6 no la cumplió.

## Requisitos de hardware

- VRAM estimada: el base en 4 bits ocupa aproximadamente 1 GB de pesos; con overhead de runtime MLX y KV cache para 8.000 caracteres de contexto, el consumo es moderado y apto para memoria unificada de Apple Silicon.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con runtime MLX; no se documenta soporte para CUDA en esta release.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente; no se especifican requisitos mínimos exactos.
- Opciones de despliegue: MLX con el checkpoint base exacto y el adaptador sin fusionar; no se distribuyen GGUF, por lo que llama.cpp u Ollama no son aplicables sin conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| Evidence Scraper Qwen3-1.7B v6 MLX LoRA | 1,7 B (base) + LoRA | 32.768 (base); ventana de 8.000 caracteres | Adaptador LoRA MLX experimental | Apache-2.0 | Falló la puerta de validación; no promovido |
| Qwen3-1.7B (base) | 1,7 B | 32.768 | Modelo denso completo | Apache-2.0 | Referencia de validación con 28/36 hechos correctos |
| Evidence Scraper v5 | 1,7 B (base) + LoRA | Igual que v6 | Adaptador LoRA experimental | Apache-2.0 | Rechazó 13 casos, incluidos 8 registros correctos |
| Evidence Scraper v4 | 1,7 B (base) + LoRA | Igual que v6 | Adaptador LoRA experimental | Apache-2.0 | Admitió más hechos erróneos que el base |

No se dispone de comparación con extractores estructurados de terceros en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que v6 falló la puerta de validación preregistrada: la precisión bruta bajó de 28 a 26 hechos correctos y los hechos erróneos aceptados subieron de 3 a 6.
- La validación se reutilizó para diseño y selección de curriculum, por lo que no constituye una estimación independiente de precisión final.
- El etiquetado lo generaron agentes con revisión de un segundo agente, no anotadores humanos externos; puede introducir sesgos sistemáticos.
- No se evaluó la recuperación completa vía API de Firecrawl ni su extracción nativa; el alcance se limita a contenido guardado y limpiado.
- El modelo solo soporta inglés según la model card.
- Requiere el checkpoint base exacto y runtime MLX; no es un modelo autónomo ni un adaptador PEFT genérico, lo que limita su portabilidad.
- La integridad de arranque verificada por hashes no garantiza precisión de extracción.
- Licencia Apache-2.0 con obligación de preservar atribución upstream; el código del scraper es MIT, pero las dependencias y el contenido de los sitios conservan sus propios derechos.
- No se redistribuyen capturas crudas, etiquetas, extractos ni completions con los pesos.
- Riesgo de alucinación y de selección semánticamente incorrecta de citas: la mecánica literal de identificadores mejoró, pero no resolvió los errores semánticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guike8/evidence-scraper-qwen3-1.7b-realpage-v6-mlx-lora
- Código fuente y mediciones: https://github.com/guike8/evidence-ai-scraper-public
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
