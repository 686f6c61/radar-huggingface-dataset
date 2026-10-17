# niko0xdev/skilljev

## Resumen

SkillJev es un adaptador LoRA de clasificación de texto publicado por el usuario niko0xdev que mide en qué grado una evidencia de candidatura (extractos de CV, notas de entrevista) respalda un requisito concreto de un puesto. No genera texto: monta tres cabezas lineales sobre el modelo base AlexWortega/openjev (OpenJev 4B, variante Qwen3.5-4B-NLI) y devuelve de forma simultánea el grupo de habilidad (10 categorías), el tipo de evidencia (supported, partial, contradicted, insufficient) y el nivel de competencia (0 a 5, más la etiqueta unknown).

El interés práctico es que convierte un problema difuso de cribado de CV en una tarea de inferencia de lenguaje natural con etiquetas auditables: 55 habilidades agrupadas en 10 familias, con una rúbrica publicada (RUBRIC.md) que define la convención de etiquetado, incluida una convención específica para CV reales (v0.2). Frente a los baselines zero-shot que reporta el autor sobre un conjunto held-out de 90 muestras, el adaptador pasa de 73,3 a 100,0 en acierto de grupo de habilidad y de 56,7 a 97,8 en clasificación de evidencia.

Es relevante como ejemplo del patrón "modelo pequeño especializado más cabeza de clasificación" aplicado a HR-tech: licencia Apache-2.0, inferencia en una GPU de aproximadamente 12 GB y un formato de entrada explícito y reproducible. El alcance, en cambio, es deliberadamente estrecho: solo inglés, solo roles IT/software y sin verificación de los autoinformes que aparecen en el CV.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base Qwen3.5-4B-NLI) con adaptador LoRA y tres cabezas lineales de clasificación sobre el hidden state del último token |
| Parámetros totales | 4B en el modelo base (OpenJev 4B, subcarpeta `qwen3.5-4b-nli-v5`); adaptador LoRA distribuido en 0,2 GB de safetensors (recuento exacto de parámetros del adaptador no disponible) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Entrenamiento con `max_length` de 192 tokens; contexto nativo del modelo base no disponible |
| Tipos de cuantización | No se publican versiones cuantizadas. Pesos en bf16/safetensors; el autor documenta una ruta manual a MLX (merge de LoRA con `merge_and_unload()` y `mlx_lm.convert`), sin build oficial |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache-2.0 para el adaptador; se aplica adicionalmente la licencia propia del modelo base |
| Formato de pesos | safetensors (PEFT/LoRA) más `heads.pt` en PyTorch para las tres cabezas lineales |
| Tarea | Text-classification multi-cabeza: grupo de habilidad, evidencia y proficiency |
| Modelo base | AlexWortega/openjev (OpenJev 4B) |
| Dataset de entrenamiento | niko0xdev/skilljev-data (v008) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 13 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA con r=16 y α=32 aplicado a todas las capas lineales del modelo base OpenJev 4B (Qwen3.5 NLI, subcarpeta `qwen3.5-4b-nli-v5`). Sobre el hidden state del último token se superponen tres cabezas lineales independientes, guardadas aparte en `heads.pt`: una de 10 clases para el grupo de habilidad (`lang_core`, `api_design`, `data_storage`, `system_design`, `cloud_devops`, `reliability_obs`, `security`, `testing_quality`, `frontend`, `leadership`), una de 4 clases para la evidencia (`supported`, `partial`, `contradicted`, `insufficient`) y una de 7 clases para proficiency (`0`–`5`, `unknown`). La distinción entre `unknown` y `0` es explícita: el nivel 0 solo se usa cuando la evidencia indica que el candidato no tiene experiencia.

La entrada sigue el formato `Requirement: <texto>\nEvidence:\n[<source_type>/<sección>] <texto>`, con una línea por ítem de evidencia o `(no evidence)`, lo que sitúa la tarea en el terreno de la inferencia de lenguaje natural (hipótesis = requisito, premisa = evidencia). El entrenamiento fue de una epoch-slice en bf16, learning rate 1e-4, batch 4, longitud máxima 192, 500 pasos sobre una Colab L4. Los datos de la v008 combinan mayoritariamente texto sintético generado con plantillas, unas 1,2k muestras de CV reales revisadas por agente y unas 5,7k muestras etiquetadas por reglas (silver). La calibración se resuelve con temperature scaling ajustado en el split de desarrollo (T: 0,5 para skill, 2,4 para evidence, 2,8 para proficiency).

## Capacidades

- Clasificación conjunta de tres objetivos en una sola pasada: familia de habilidad, calidad de la evidencia y nivel de competencia.
- Clasificación de evidencia en cuatro estados, incluida la detección de contradicciones explícitas (`contradicted`) frente a requisitos del puesto.
- Distinción entre ausencia de información (`unknown`) y ausencia declarada de experiencia (`0`), un error frecuente en modelos NLI genéricos.
- Cobertura de 55 habilidades de IT/software organizadas en 10 grupos, definidas en `TAXONOMY.md`.
- Entrada multi-ítem: varias evidencias por requisito, etiquetadas por tipo de fuente y sección del CV.
- Probabilidades calibradas (ECE de 0,023 en evidencia y 0,033 en proficiency tras temperature scaling), lo que permite umbralizar con sentido.
- No soporta generación de texto, tool calling, uso agéntico, visión, audio ni capacidades multilingües: es un clasificador, no un asistente.

## Casos de uso

- **Triaje de CVs en procesos de selección técnica**: para cada requisito de la oferta se introduce el extracto correspondiente del CV y el modelo devuelve si la evidencia es suficiente, parcial o contradictoria, lo que permite ordenar candidaturas por cobertura real de requisitos en lugar de por coincidencia de palabras clave.
- **Estructuración de CVs para un ATS**: el clasificador de grupo de habilidad asigna cada evidencia a una de las 10 familias, lo que facilita normalizar currículos heterogéneos en un esquema común antes de indexarlos.
- **Detección de contradicciones en autoinformes**: un CV que declara nivel 5 en `cloud_devops` pero solo aporta evidencias de nivel 2 puede marcarse como `contradicted` o `partial` y enviarse a revisión, algo que un filtro léxico no detecta.
- **Enrutado a revisión humana con umbral de confianza**: la calibración permite descartar automáticamente los casos claros y derivar a un reclutador los que caen por debajo de 0,7 de confianza, los marcados como `contradicted` o los niveles ≥4 sustentados solo en el CV.
- **Procesamiento de notas de entrevista**: las notas se introducen como evidencia con `source_type` distinto del CV, de modo que el modelo evalúa la evidencia de entrevista con el mismo criterio que la del currículo y se pueden comparar ambas fuentes.
- **Anotación asistida para equipos de datos**: al devolver etiquetas con probabilidad, sirve como preetiquetador en flujos de anotación de currículos, reduciendo el coste de construir conjuntos etiquetados propios en el dominio IT.
- **Auditoría de rúbricas de evaluación interna**: ejecutar el modelo sobre un conjunto de CVs ya evaluados por humanos permite localizar discrepancias sistemáticas entre la rúbrica escrita y su aplicación real.

## Benchmarks y rendimiento

Conjunto held-out bloqueado (n = 90: 70 muestras sintéticas generadas con plantillas exclusivas del held-out y 20 extractos reales de CV de Djinni revisados por humano/agente). Nunca usado en entrenamiento.

| Modelo | Skill (acc.) | Evidence (acc.) | Prof. exacta | Prof. ±1 | Errores unknown→0 | ECE (ev. / prof.) |
|---|---|---|---|---|---|---|
| tasksource/ModernBERT-base-nli, zero-shot | 73,3 | 56,7 | 58,9 | 63,3 | 0 | no disponible |
| OpenJev 4B, zero-shot | 88,9 | 68,9 | 71,1 | 80,0 | 0 | no disponible |
| SkillJev v008, step 500 (checkpoint publicado) | 100,0 | 97,8 | 95,6 | 96,7 | 0 | 0,023 / 0,033 |
| SkillJev v008, step 1000 (seleccionado en dev) | 100,0 | 97,8 | 94,4 | 98,9 | 0 | 0,024 / 0,038 |

El propio autor advierte de que el step 500 se eligió por su resultado en held-out, mientras que el checkpoint seleccionado solo con el split de desarrollo (step 1000) obtiene 94,4 % de proficiency exacta. La diferencia de 1,2 puntos equivale a una muestra sobre 90, por lo que el rango realista es 94–96 % y cada cifra lleva asociado un ruido de muestreo de aproximadamente ±3 a 5 puntos. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB de GPU para inferencia en bf16 con el adaptador y las cabezas cargadas, según las instrucciones del autor.
- GPU profesionales: A100 (40/80 GB), H100, L40S o A10G sobradas para el modelo; no se requiere paralelismo tensorial.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) sin cuantización. En tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) el margen es ajustado y conviene reducir el batch o el `max_length` (el entrenamiento usó 192 tokens).
- Despliegue: la vía soportada es `transformers` (≥4.57) + `peft` + `accelerate` con el script `inference.py` del repositorio. vLLM y TGI no soportan de forma nativa cabezas personalizadas sobre el hidden state del último token, por lo que requerirían código propio. No hay GGUF ni versión para llama.cpp u Ollama.
- Apple Silicon: no hay build oficial de MLX; el autor describe la ruta manual (merge de la LoRA, `mlx_lm.convert` y portar las tres `nn.Linear` desde `heads.pt`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Skill | Evidence | Prof. exacta | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SkillJev (este checkpoint) | 4B base + LoRA | 192 tokens de entrenamiento | 100,0 | 97,8 | 95,6 | Apache-2.0 (+ licencia del base) | Pesos PEFT públicos en HuggingFace |
| OpenJev 4B zero-shot | 4B | no disponible | 88,9 | 68,9 | 71,1 | no disponible | Público en HuggingFace |
| tasksource/ModernBERT-base-nli zero-shot | no disponible | no disponible | 73,3 | 56,7 | 58,9 | no disponible | Público en HuggingFace |
| SkillJev v008 step 1000 | 4B base + LoRA | 192 tokens de entrenamiento | 100,0 | 97,8 | 94,4 | Apache-2.0 | No publicado como checkpoint |

La comparación es intradominio y con el mismo conjunto de evaluación, lo que la hace útil para medir la ganancia del ajuste fino, pero no equivale a una comparación frente a otros clasificadores de CV de propósito general, para los que no hay datos en la información disponible. Existe además un proyecto homónimo, SkillJev-2B (Universidad de Toronto MScAC con TrendAI), que puntúa skills maliciosas de agentes de IA: es una tarea distinta y no es comparable con este modelo pese a compartir nombre y modelo base de la familia OpenJev.

## Limitaciones y advertencias

- Herramienta de apoyo a la decisión, no un sistema de contratación automática: el autor exige mantener a una persona en el bucle y derivar a revisión los casos con confianza inferior a 0,7, los `contradicted` y los niveles ≥4 sustentados únicamente en el CV.
- Cobertura restringida a inglés y a roles IT/software con 55 habilidades en 10 grupos; otros dominios o idiomas quedan fuera de distribución.
- La mayor parte del entrenamiento es texto sintético generado con plantillas; solo unas 1,2k muestras de CV real revisado por agente y unas 5,7k etiquetadas por reglas. Es esperable una precisión menor ante redacciones atípicas.
- Sesgo de dominio: los CV reales provienen de Djinni, mercado laboral ucraniano, y del propio conjunto de etiquetado, por lo que la distribución no representa necesariamente otros mercados ni sectores.
- El nivel de proficiency se juzga a partir de un único extracto: refleja la evidencia aportada, no la habilidad real de la persona, y los autoinformes del CV no están verificados.
- Riesgo de alucinación de etiqueta: al ser un clasificador, siempre emite una clase; la calibración mitiga pero no elimina la confianza mal colocada en entradas fuera de dominio.
- El checkpoint publicado se eligió por su puntuación en el conjunto held-out, lo que introduce una fuga parcial de información hacia la selección; el autor recomienda leer las cifras como 94–96 % y no como 100 %.
- Tamaño de evaluación reducido (n = 90) con un ruido de muestreo de ±3 a 5 puntos.
- Confusión potencial entre `unknown` y `0`: el modelo acierta en las 90 muestras del held-out (0 errores de ese tipo), pero es un punto crítico a monitorizar en producción.
- Licencia: el adaptador es Apache-2.0, pero se aplica también la licencia del modelo base, que no se detalla en la información disponible; conviene verificarla antes de un uso comercial.
- No hay versiones cuantizadas ni build oficial para MLX, llama.cpp u Ollama, lo que limita el despliegue en entornos ligeros o en Apple Silicon sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/niko0xdev/skilljev
- Repositorio del modelo (incluye `inference.py`, `RUBRIC.md`, `TAXONOMY.md`, `heads.pt`): https://huggingface.co/niko0xdev/skilljev/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/niko0xdev/skilljev-data
- Modelo base: https://huggingface.co/AlexWortega/openjev
- Dataset de CV reales de origen (lang-uk, licencia MIT): https://huggingface.co/datasets/lang-uk/recruitment-dataset-candidate-profiles-english
- Proyecto homónimo no relacionado (SkillJev-2B, scorer de skills maliciosas de agentes): https://github.com/JerroldH/SkillJev
- Checkpoint del proyecto homónimo: https://huggingface.co/SkillJev/SkillJev-2B/tree/v1
- Contexto sobre la familia Jev (TypeSafe AI, artículo de TechCrunch): https://techcrunch.com/2026/10/09/the-maker-of-non-text-ai-model-jev-valued-at-7-5b-just-weeks-after-launch/
