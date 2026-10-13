# sigmanih/openbmb-MiniCPM5-2B-MLX-GGUF-F16

## Resumen

openbmb-MiniCPM5-2B-MLX-GGUF-F16 es una conversión a formato GGUF del modelo openbmb/MiniCPM5-2B-MLX, publicada por el usuario sigmanih mediante la herramienta Sigma Studio (Model Hub). Se trata de un modelo de generación de texto con arquitectura declarada de tipo llama, 2.516.756.480 parámetros totales (aproximadamente 2,5 mil millones) distribuidos en 42 capas de transformer con dimensión oculta de 2048, y una ventana de contexto declarada de 131.072 tokens.

El modelo está pensado para despliegues ligeros: su huella en disco es de 4,69 GB y requiere en torno a 5,6 GB de VRAM para descarga completa en GPU, o unos 5,4 GB de RAM en modo CPU o híbrido. Esto lo sitúa en el segmento de dispositivos de borde, agentes de voz en tiempo real y cargas de trabajo compatibles con CPU y móvil. La model card indica soporte únicamente para inglés (en) e italiano (it).

Su relevancia actual radica en la combinación de un contexto muy amplio (131.072 tokens) con un tamaño reducido, junto con un modo de razonamiento explícito (thinking / no-thinking). No obstante, los resultados de evaluación publicados por el autor son modestos y se han medido sobre subconjuntos de dataset, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (transformer denso, según model card); modelo base openbmb/MiniCPM5-2B-MLX |
| Parametros totales | 2.516.756.480 (aproximadamente 2,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M según la model card; el nombre del repositorio indica F16 (discrepancia no resuelta) |
| Idiomas soportados | en (inglés), it (italiano) |
| Licencia | other (la model card muestra una insignia Apache-2.0, pero los metadatos del repositorio declaran `license: other`) |
| Formato de pesos | GGUF (compatible con llama.cpp) |
| Capas del transformer | 42 |
| Dimension oculta | 2048 |
| Huella en disco | 4,69 GB (tamaño del repositorio: 5,0 GB) |
| VRAM estimada (offload completo en GPU) | aproximadamente 5,6 GB |
| RAM estimada (CPU / híbrido) | aproximadamente 5,4 GB |

## Arquitectura y entrenamiento

La model card declara una arquitectura base de tipo `llama`, con 42 capas de transformer y una dimensión oculta de 2048. Se trata de un modelo denso de aproximadamente 2,5 mil millones de parámetros, no de una arquitectura Mixture-of-Experts. La ventana de contexto declarada es de 131.072 tokens. Este repositorio concreto no es un modelo entrenado desde cero, sino una conversión a formato GGUF derivada del modelo base openbmb/MiniCPM5-2B-MLX, empaquetada y publicada mediante la herramienta Sigma Studio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste como RLHF, DPO o SFT en el modelo base. Tampoco se detalla si el modelo base incorpora innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). Toda esta información figura como no disponible en la documentación proporcionada. La model card menciona un modo de razonamiento en cadena de pensamiento (Deep Thinking CoT) frente a un modo de respuesta directa (No-Thinking), pero no describe cómo se ha implementado ni si requiere tokens de control especiales.

## Capacidades

- Generación de texto conversacional en inglés e italiano.
- Modo de razonamiento explícito: la model card distingue entre respuesta directa (No-Thinking) y razonamiento en cadena de pensamiento (Deep Thinking CoT), con un incremento de precisión declarado de 16,0 puntos porcentuales a favor del modo CoT.
- Razonamiento matemático: obtiene 100% en GSM8K y 78% en MATH según la evaluación del autor (sobre subconjuntos).
- Generación de código: 71% en HumanEval (pass@1) y 56% en MBPP en la misma evaluación.
- Soporte de tool calling / function calling, con una adherencia declarada del 77,2% al protocolo de herramientas y cero funciones alucinadas según el benchmark del autor.
- Capacidades agénticas: la model card reporta contención del 100% dentro del entorno aislado (Sandbox Jail), aunque también reporta un 0,0% de finalización autónoma de tareas.
- Capacidades multilingües limitadas a inglés e italiano; no se declara soporte de español.
- No se declara soporte de visión, audio ni otras modalidades.

## Casos de uso

- Agentes de voz en tiempo real: el tamaño reducido (aproximadamente 5,6 GB de VRAM con offload completo) y la baja latencia del modo No-Thinking lo hacen apto para asistentes conversacionales con respuesta inmediata, donde el coste por token es crítico.
- Procesamiento de documentos largos en inglés e italiano: la ventana de contexto de 131.072 tokens permite ingerir contratos, informes o transcripciones extensas sin fragmentación previa, útil para resumen y extracción de entidades dentro de esas dos lenguas.
- Asistencia matemática paso a paso: con el modo Deep Thinking CoT activado, puede resolver problemas de varios pasos (los datos del autor reportan 100% en GSM8K y 78% en MATH sobre el subconjunto evaluado), adecuado para tutores educativos automáticos.
- Generación y revisión de código Python: integrable en pipelines de CI/CD o en editores para autocompletado y generación de funciones, con soporte de tool calling para invocar linters o ejecutores de tests.
- Despliegue en dispositivos de borde: al caber en GPUs de 6-8 GB de VRAM o en sistemas con 16 GB de RAM, puede ejecutarse en portátiles, mini-PC o dispositivos móviles mediante llama.cpp u Ollama.
- Orquestación de agentes con herramientas: aunque la finalización autónoma de tareas es baja según el benchmark del propio autor, la adherencia al esquema de herramientas (77,2%) permite usarlo como componente de razonamiento dentro de flujos supervisados con validación humana.
- Clasificación y extracción de información en italiano e inglés: aplicable a tareas de etiquetado, moderación o enrutado de consultas en entornos de atención al cliente bilingües (en/it).

## Benchmarks y rendimiento

Evaluación declarada por el autor mediante Sigma Studio Training Lab (semilla 42, temperatura 0,0). Los propios datos indican que las puntuaciones se han medido sobre un subconjunto del dataset y no sobre la suite completa, por lo que no son comparables con ejecuciones completas.

| Dataset / benchmark | Dominio | Correctas / Total | Precision (%) |
|---|---|---|---|
| ARC-Challenge | Razonamiento científico | 7 / 9 | 78 |
| BIG-Bench Hard | Lógica y simbolismo multitarea | 6 / 7 | 86 |
| GPQA | Razonamiento académico de posgrado | 1 / 9 | 11 |
| GSM8K | Matemáticas de primaria multi-paso | 9 / 9 | 100 |
| HellaSwag | Sentido común y NLI situacional | 1 / 9 | 11 |
| HumanEval | Código Python (pass@1) | 5 / 7 | 71 |
| MATH | Matemáticas de competición | 7 / 9 | 78 |
| MBPP | Programación Python con tests unitarios | 5 / 9 | 56 |
| MMLU | Conocimiento general multisujeto | 4 / 14 | 29 |
| MMLU-Pro | Razonamiento avanzado multi-paso | 2 / 9 | 22 |
| TruthfulQA | Factualidad y anti-alucinación | 2 / 9 | 22 |
| Total | Todos los datasets evaluados | 49 / 100 | 49 |

Comparativa de modos de ejecución declarada por el autor:

| Modo | Precision (%) | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 42,1 | 24 / 57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 58,1 | 25 / 43 | Traza de razonamiento multi-paso, delta de +16,0 puntos |

Benchmark de agente y tool calling (Sandbox Jail, autor):

| Metrica | Resultado |
|---|---|
| Adherencia al protocolo de herramientas | 77,2% |
| Finalización autónoma de tareas | 0,0% (0/1 escenarios) |
| Contención en el sandbox | 100% conforme |
| Eficiencia de ejecución | 0 turnos (0,0 s) |

Nota: la model card indica protocolo `code_execution`, `continuation_logprob`, `cot_generation`, `letter_logprob`, temperatura 0,0, semilla 42 y hash de reproducibilidad `SHA256-E5EB0DA683E87507`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB con descarga completa en GPU; el repositorio ocupa 4,69 GB en disco.
- RAM estimada en modo CPU o híbrido: aproximadamente 5,4 GB.
- GPU recomendadas por el autor: cualquier GPU con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070 o superiores dentro de ese rango).
- Requisito de sistema: 16 GB de RAM si se ejecuta en CPU o de forma híbrida.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama media con 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama, y cualquier runtime compatible con GGUF; las etiquetas del repositorio indican compatibilidad con endpoints. No se confirma soporte de vLLM o TGI (orientados a safetensors, no a GGUF).
- Latencia y throughput: no disponible. La model card describe el modo No-Thinking como de latencia mínima, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de conocimiento público general; los datos de benchmarks de esta ficha corresponden únicamente a la evaluación del autor y no son homogéneos con las ejecuciones completas de los modelos comparados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| openbmb-MiniCPM5-2B-MLX-GGUF-F16 (este) | 2,5B | 131.072 tokens | other (insignia Apache-2.0 en la model card) | HuggingFace, GGUF | 49% global en subconjuntos (datos del autor) |
| openbmb/MiniCPM-2B (familia base) | ~2B | no disponible | no disponible | HuggingFace | no disponible |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (ampliable con YaRN) | Apache-2.0 | HuggingFace, GGUF, vLLM | no disponible en esta ficha |
| Gemma-2-2B-it | 2,6B | 8K | Gemma (uso comercial con restricciones) | HuggingFace, GGUF | no disponible en esta ficha |

## Limitaciones y advertencias

- Los resultados de benchmark son bajos en varias categorías clave: MMLU 29%, MMLU-Pro 22%, TruthfulQA 22%, HellaSwag 11% y GPQA 11%. Esto indica capacidad limitada de conocimiento general, sentido común y factualidad.
- Riesgo elevado de alucinación: la puntuación de 22% en TruthfulQA apunta a una fiabilidad factual reducida; no se recomienda su uso en tareas que requieran precisión factual sin verificación externa.
- Escasa finalización autónoma de tareas: el propio benchmark del autor reporta 0,0% de escenarios completados con el archivo objetivo exacto, pese a una adherencia al protocolo de herramientas del 77,2%. No es adecuado para agentes autónomos sin supervisión.
- Cobertura lingüística limitada: solo inglés e italiano. No se declara soporte de español, lo que restringe su uso en producción en castellano.
- Riesgo de licencia: los metadatos declaran `license: other`, mientras que la model card muestra la insignia Apache-2.0. Esta discrepancia debe aclararse con el autor o con el titular del modelo base antes de cualquier uso comercial.
- Discrepancia en el formato: el nombre del repositorio indica F16 pero la model card declara Q4_K_M como formato de pesos. Conviene verificar los archivos reales antes de desplegar.
- Los benchmarks se han medido sobre subconjuntos de dataset, no sobre las suites completas, según advierte la propia model card; no son comparables con evaluaciones completas de otros modelos.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- El modelo base y las fechas de creación (2026) sugieren una procedencia poco documentada; conviene auditar el repositorio antes de usarlo en entornos de producción.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/sigmanih/openbmb-MiniCPM5-2B-MLX-GGUF-F16
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Repositorio de la herramienta Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en HuggingFace: https://huggingface.co/sigmanih
- Licencia Apache-2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0
