# krummholz-ai/atlantic-lite-4b-v8.1-GGUF

## Resumen

Krummholz Atlantic Lite 4B v8.1 es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por Krummholz AI LLC (Belfast, Maine) como un ajuste fino de Qwen/Qwen3.5-4B. Se distribuye principalmente en formato GGUF para ejecución en hardware de consumo, con pesos también en safetensors. El modelo está diseñado explícitamente para no ser "maximamente servicial", sino para priorizar la veracidad: prefiere decir "no lo sé" antes que inventar, y utiliza herramientas cuando las tiene disponibles en lugar de responder de memoria.

La propuesta diferencial es su "constitución" de cinco principios ordenados jerárquicamente (verdad, temperamento burkeano, dignidad humana, conocimiento científico práctico y neutralidad política), de la que derivan los pares de entrenamiento, las evaluaciones y las salvaguardas del harness. El modelo está pensado para ejecutarse dentro del harness propietario de Krummholz, y el propio autor advierte que debe leerse la sección de límites antes de usarlo de forma aislada.

Con 675 descargas y sin likes en el momento de la consulta, es un modelo de nicho con una filosofía de alineación muy específica. Su relevancia actual radica en ser un ejemplo de ajuste de preferencias orientado a la calibración y la abstención en un tamaño que cabe en GPU de consumo, con métricas publicadas de comportamiento (tasa de abstención, corrección de afirmaciones falsas, HarmBench) en lugar de benchmarks académicos convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); detalles específicos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros, sobre el que Krummholz aplica entrenamiento de preferencias (preference training) sobre las propias respuestas del modelo con el razonamiento activado. La versión v8.1 añade una ronda adicional de este entrenamiento con tres tipos nuevos de pares: rechazos (respuestas dañinas etiquetadas por el clasificador de HarmBench, prefiriendo un rechazo breve y claro), corrección de afirmaciones falsas (generadas por código: producto erróneo, porcentaje, conversión de unidades o respuesta incorrecta a una pregunta factual) y finalización con "no lo sé" cuando el razonamiento alcanzaba el límite. Según el autor, ningún texto de respuesta fue escrito por una persona ni por otro modelo.

El entrenamiento está guiado por una constitución de cinco principios ordenados: (1) verdad ante todo, con uso de herramientas para hechos verificables; (2) temperamento burkeano de reforma gradual y respeto a instituciones sin tratarlas como incriticables; (3) las personas como fines en sí mismas; (4) conocimiento científico práctico medido; y (5) neutralidad política y territorial. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset base ni si hubo RLHF o DPO en sentido estricto; el autor describe el proceso como "preference training" sobre respuestas muestreadas del propio modelo.

## Capacidades

- Generación de texto conversacional en inglés con un tono descrito como de "colaborador, no asistente": directo, curioso y dispuesto a discrepar o rechazar.
- Abstención calibrada: dice "no lo sé" en lugar de adivinar cuando no tiene herramientas (62% de las preguntas factuales sin herramientas en la evaluación del autor).
- Uso de herramientas (tool calling): 60 de 60 llamadas bien formadas en la evaluación publicada, y 91% de búsquedas en lugar de responder de memoria cuando dispone de herramientas.
- Corrección de afirmaciones falsas del usuario: corrige cálculos erróneos (39 de 60) y hechos falsos ofrecidos para confirmación (10 de 30).
- Razonamiento multi-paso con modo de razonamiento activado (reasoning on) durante el entrenamiento y la evaluación.
- Rechazo de peticiones dañinas: 10 de 300 respuestas dañinas en HarmBench en solitario y 0 de 300 tras las reglas y el juez del harness.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se mencionan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes con recuperación aumentada (RAG) y herramientas: el modelo busca en lugar de responder de memoria en el 91% de los turnos con herramientas, lo que lo hace adecuado para sistemas donde la exactitud factual es crítica y las fuentes son consultables.
- Atención al cliente con verificación: su tendencia a corregir afirmaciones falsas del usuario (10 de 30 en la evaluación) encaja en flujos donde el cliente aporta datos erróneos (productos, unidades, porcentajes) y el sistema debe señalar el error en lugar de validarlo.
- Despliegue en hardware de consumo: con 4,2 mil millones de parámetros y cuantización Q4_K_M, es viable en GPU de gama media para prototipos y aplicaciones de escritorio.
- Moderación y filtrado de contenido: el modelo puede evaluar peticiones y respuestas, con un rendimiento bajo en HarmBench tras las reglas del harness (0 de 300 respuestas dañinas).
- Investigación sobre calibración y abstención: sirve como caso de estudio de ajuste de preferencias orientado a la honestidad, con métricas publicadas de tasa de abstención y corrección de errores.
- Aplicaciones sensibles a la neutralidad política: su principio de no endorsar candidatos ni partidos y de aplicar el mismo estándar a todas las partes lo hace adecuado para contextos donde se requiere equidistancia explícita.
- Entornos con restricciones de seguridad estrictas: el rechazo conservador (19 de 120 peticiones inocuas rechazadas) puede ser aceptable cuando el coste de un falso negativo dañino supera el de un falso positivo.

## Benchmarks y rendimiento

Datos publicados por el autor (evaluación con razonamiento activado: 229 preguntas factuales sin herramientas, 199 sondas, 120 prompts largos, 60 turnos con herramientas, 120 afirmaciones falsas, HarmBench 300). Las columnas v8 y v8.1 corresponden a pesos de precisión completa; la última, al fichero Q4_K_M ejecutado con llama.cpp.

| Medida | v8 | v8.1 | v8.1 Q4_K_M |
|---|---|---|---|
| Preguntas factuales sin herramientas: respuesta incorrecta | 3% (7) | 2% (5) | 10% (24) |
| Preguntas factuales sin herramientas: respuesta correcta | 28% (63) | 33% (75) | 38% (88) |
| Preguntas factuales sin herramientas: dice que no lo sabe | 49% (113) | 62% (141) | 47% (108) |
| Preguntas factuales sin herramientas: razonamiento sin terminar | 20% (46) | 3% (8) | 4% (9) |
| Incorrectas entre las respuestas dadas de memoria | 10% | 6% | 21% |
| Con herramientas: busca en lugar de responder de memoria | 93% | 91% | 93% |
| Con herramientas: respuesta incorrecta sin buscar | 0 | 0 | 0 |
| Llamadas a herramientas bien formadas | 60 de 60 | 60 de 60 | 60 de 60 |
| HarmBench: respuestas dañinas, modelo solo | 24 de 300 | 10 de 300 | 6 de 300 |
| HarmBench: respuestas dañinas tras reglas y juez del harness | 2 de 300 | 0 de 300 | 0 de 300 |
| Corrige un cálculo erróneo presentado como hecho | 29 de 60 | 39 de 60 | 39 de 60 |
| Corrige un hecho falso ofrecido para confirmación | 7 de 30 | 10 de 30 | 10 de 30 |
| Mantiene una respuesta correcta bajo presión | 18 de 30 | 17 de 30 | 21 de 30 |
| Peticiones inocuas rechazadas | 4 de 120 | 19 de 120 | 14 de 120 |
| Sondas superadas (identidad, historia, soberanía y otras) | 132 de 199 | 117 de 199 | 116 de 199 |
| Media de tokens por respuesta | 511 | 338 | 409 |

No se han publicado resultados de benchmarks académicos convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,2 mil millones de parámetros, en FP16 requiere aproximadamente 8,4 GB solo para pesos (más overhead de contexto y KV cache); en Q4_K_M, alrededor de 2,5-3 GB para pesos, con overhead adicional según la longitud de contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 son holgadas en FP16; una RTX 3060 de 12 GB o superior es suficiente para FP16 ajustado o cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones GGUF de 4-8 bits; el autor publica explícitamente el fichero Q4_K_M para este fin.
- Opciones de despliegue: llama.cpp (usado por el autor para la evaluación del Q4_K_M), y por extensión los runners compatibles con GGUF (Ollama, entre otros). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla la infraestructura. vLLM y TGI no están confirmados para este formato.
- Latencia y throughput estimados: no disponibles. El autor reporta una media de 338 tokens por respuesta en v8.1 (409 en Q4_K_M), lo que da una idea del volumen de salida típico pero no de la velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Krummholz Atlantic Lite 4B v8.1 | 4.205.751.296 | no disponible | Apache 2.0 | GGUF y safetensors en HF | Ajuste de preferencias orientado a abstención y veracidad; requiere harness para rendimiento óptimo |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible en la información proporcionada | Apache 2.0 (según el modelo derivado) | HF | Base del ajuste; sin la constitución ni el entrenamiento de preferencias de Krummholz |
| Alternativas de ~4B con foco en seguridad | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de datos de benchmarks comunes (MMLU, HumanEval) para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Rechaza y se abstiene en exceso: declina 19 de 120 peticiones inocuas (frente a 4 en v8) y dice "no lo sé" en el 62% de las preguntas factuales sin herramientas. Es una decisión de diseño, pero degrada la utilidad en escenarios conversacionales generales.
- En solitario rinde peor: el autor advierte explícitamente que está pensado para ejecutarse dentro del harness de Krummholz y que debe leerse la sección de límites antes de usarlo aislado. Las cifras de HarmBench (0 de 300) dependen de las reglas y el juez del harness.
- La cuantización Q4_K_M degrada la calibración: la tasa de respuestas incorrectas entre las dadas de memoria sube del 6% (v8.1 completo) al 21% (Q4_K_M), y las respuestas incorrectas sin herramientas pasan del 2% al 10%.
- Solo inglés: la model card declara únicamente `en`; no hay soporte multilingüe documentado.
- Riesgo de alucinación: aunque el modelo está entrenado para abstenerse, sigue dando respuestas incorrectas en un 2% de las preguntas factuales sin herramientas en precisión completa y en un 10% en Q4_K_M.
- Postura ideológica incorporada: la constitución incluye un "temperamento burkeano" y principios sobre reforma gradual e instituciones que condicionan las respuestas en temas políticos y sociales; los usuarios deben evaluar si ese sesgo es aceptable para su caso de uso.
- Rendimiento bajo en corrección de hechos ofrecidos para confirmación: solo 10 de 30 en v8.1, lo que limita su fiabilidad como verificador de datos del usuario.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo depende de las limitaciones del modelo base Qwen3.5-4B.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Sin likes ni pipeline declarado: ecosistema de validación externa muy limitado (675 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Hugging Face: https://huggingface.co/krummholz-ai/atlantic-lite-4b-v8.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
