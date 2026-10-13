# MulticulturalAlignment/scpo-reward-model-chile

## Resumen

El SCPO Reward Model — Chile es un modelo de recompensa escalar (reward model) desarrollado por el grupo MulticulturalAlignment, derivado mediante ajuste fino completo de OpenAssistant/reward-model-deberta-v3-base. Su función es asignar una puntuación scalar a un par prompt-respuesta, de forma que puntuaciones más altas indican una respuesta preferida para el mismo prompt. No genera texto: es un clasificador de secuencias con cabeza de regresión que produce un único logit.

El modelo se entrena sobre pares de preferencia de PRISM (HannahRoseKirk/prism-alignment) restringidos a participantes residentes en Chile, dentro del marco metodológico SCPO (Steerable Cultural Preference Optimization) descrito en el artículo arXiv:2606.18606. La relevancia actual está en la línea de investigación sobre alineamiento pluralista: en lugar de un único reward model global, se producen variantes por país para capturar preferencias culturalmente específicas.

Técnicamente es un transformer encoder DeBERTa-v2 con 184.422.913 parámetros (aproximadamente 184 M), ventana de 512 tokens y licencia MIT. Es un modelo pequeño, de investigación, con 0 descargas y 1 like en el momento del registro, y su uso previsto es exclusivamente la investigación en modelado de preferencias, no la toma de decisiones consecuentes sobre personas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 con cabeza de clasificación de secuencias (AutoModelForSequenceClassification), salida de recompensa escalar |
| Parámetros totales | 184.422.913 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entradas de entrenamiento truncadas y rellenadas a 512); en la puntuación original se usan pares prompt/respuesta en lotes de interacción de hasta 8 sin truncamiento explícito |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas; al ser safetensors de precisión completa, admite cuantización posterior con herramientas estándar) |
| Idiomas soportados | en (inglés; la model card indica muestra dominada por el inglés) |
| Licencia | MIT (los pesos ajustados); modelo base OpenAssistant marcado como MIT |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline | text-classification |
| Modelo base | OpenAssistant/reward-model-deberta-v3-base (revisión `7dab4156e63944834c3aae169c3fe83955672cff`) |
| Dataset de entrenamiento | HannahRoseKirk/prism-alignment (revisión `18ab5cfb37456f4ec8cbc00212ce54cf7b1239f6`) |
| Tamaño del repositorio | 0,7 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DeBERTa-v2 con una cabeza de clasificación de secuencias que emite un logit escalar. Se parte del reward model OpenAssistant/reward-model-deberta-v3-base y se realiza ajuste fino de todos los parámetros (full-model fine-tuning) sobre pares de preferencia derivados de PRISM filtrados por residencia en Chile. Las entradas de entrenamiento se construyen con el formato literal `prompt + " [SEP] " + response`, truncadas y rellenadas a 512 tokens. En la puntuación original se usan pares prompt/respuesta del tokenizer en lotes de interacción de tamaño máximo 8, sin truncamiento explícito.

Los hiperparámetros registrados son: learning rate 1e-06, batch size 8, 1024 pasos de optimizador, tau de filtrado 0.5 y beta de ponderación 1.1. La semilla de shuffle de datos es 0, la semilla de split de encuesta/modelo es 0 y la semilla del Trainer es 42 (semilla de datos del Trainer no establecida). El split de usuarios de la encuesta es 85/15 y los empates en valoración humana se excluyen de los pares de preferencia. El repositorio incluye artefactos de reproducibilidad (`release-settings.json`, `provenance.json`, `requirements-pw-lock.txt`) y un script de reproducción en `reproduction/preferences.py`; no se incluyen registros privados del dataset PRISM. La model card advierte que las puntuaciones no son probabilidades y no están calibradas entre modelos.

## Capacidades

- Puntuación de recompensa escalar: dado un prompt y una respuesta, devuelve un único valor numérico; valores más altos indican mayor preferencia relativa para ese prompt.
- Clasificación de secuencias: se carga con `AutoModelForSequenceClassification` y se ejecuta en modo `eval()` con `torch.inference_mode()`.
- Modelado de preferencias culturalmente específicas: variante entrenada sobre preferencias de participantes residentes en Chile.
- Integración con el ecosistema transformers: compatible con `text-embeddings-inference` y con `endpoints_compatible` según los tags del repositorio.
- Reproducibilidad de experimentos: incluye configuración, procedencia y script de reproducción del experimento de ajuste fino.
- No soporta generación de texto.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no disponible; el único idioma declarado es inglés.

## Casos de uso

- Filtrado de datos de preferencia en investigación: usar el modelo para puntuar pares prompt-respuesta y descartar ejemplos con baja recompensa antes de entrenar un modelo de lenguaje con DPO o RLHF, aprovechando que la inferencia es barata con 184 M de parámetros.
- Evaluación comparativa de modelos de lenguaje: dado un conjunto fijo de prompts, puntuar las respuestas de distintos candidatos y analizar qué modelo se alinea mejor con las preferencias del subgrupo etiquetado como Chile.
- Investigación en alineamiento pluralista: comparar este checkpoint con variantes de otros países (mismo marco SCPO) para medir en qué medida las preferencias difieren entre poblaciones, usando el split de test de país.
- Selección de respuestas en un pipeline de anotación asistida: preordenar respuestas candidatas para que los anotadores humanos revisen primero las mejor puntuadas, reduciendo el coste de anotación en estudios de preferencia.
- Análisis de sesgo cultural en conjuntos de datos: aplicar el modelo a respuestas generadas por LLM y estudiar si las respuestas consideradas preferidas por el subgrupo de Chile difieren sistemáticamente de las de un reward model global.
- Validación de hipótesis metodológicas: reproducir el experimento de ajuste fino descrito en la model card (learning rate 1e-06, 1024 pasos, tau 0.5, beta 1.1) para estudiar la sensibilidad de los resultados a semillas y configuraciones.
- Componente de un banco de pruebas interno: integrarlo como reward model ligero en pipelines de evaluación continua, dado que cabe en memoria de GPU de consumo y no requiere despliegues multi-GPU.
- Docencia y experimentación con reward models: servir de ejemplo mínimo y reproducible de ajuste fino de un reward model basado en DeBERTa-v2 con presupuesto de cómputo reducido.

## Benchmarks y rendimiento

Los únicos datos publicados son los resultados del experimento registrado en la model card. Corresponden a puntuaciones obtenidas en memoria tras el post-entrenamiento, sin reinicio de modo de modelo ni de estado aleatorio antes de la evaluación; una sesión de inferencia nueva con `eval()` desactiva dropout y puede producir una precisión distinta. Las configuraciones se ajustaron sobre un split de test fijo y estos resultados difieren de las medias de tres ejecuciones del artículo.

| Medición | Precisión |
|---|---:|
| Modelo global de partida, global | 54,5455 % |
| Modelo SCPO, global | 60,6061 % |

La model card indica explícitamente que `validation.json` solo comprueba la carga y la inferencia finita y repetible sobre sondas genéricas, y que no es un resultado de benchmark. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar, y dichas métricas no serían aplicables directamente a un modelo de recompensa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,37 GB en fp16 y 0,74 GB en fp32 para los 184.422.913 parámetros; en int8 alrededor de 0,19 GB. El repositorio completo ocupa 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; una RTX 4090, A100 o H100 están enormemente sobredimensionadas para este modelo salvo que se procesen lotes muy grandes.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas o iGPU con varios GB de memoria compartida.
- CPU: la inferencia en CPU es viable dado el tamaño; la model card menciona la carga con `transformers` estándar sin requisitos especiales.
- Opciones de despliegue: transformers (uso documentado en la model card), text-embeddings-inference y endpoints compatibles según los tags. No se documenta compatibilidad explícita con vLLM, llama.cpp u Ollama, y al no ser un modelo generativo no aplican las optimizaciones típicas de decodificación de esos motores.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo, y al tratarse de una tarea de clasificación la métrica relevante sería pares puntuados por segundo, que no se reporta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MulticulturalAlignment/scpo-reward-model-chile | 184.422.913 | 512 tokens | Reward model escalar, preferencias de Chile | MIT | HuggingFace, 0 descargas |
| OpenAssistant/reward-model-deberta-v3-base | no disponible en la información proporcionada | no disponible en la información proporcionada | Reward model escalar global (modelo base) | MIT según la model card | HuggingFace |
| Otras variantes SCPO por país | no disponible | no disponible | Reward model escalar por subgrupo nacional | no disponible | no disponible en la información proporcionada |

Los resultados registrados en la model card indican una mejora de precisión de 54,5455 % a 60,6061 % respecto al modelo global de partida en el split de test utilizado, aunque la propia model card matiza que estos números no son las medias de tres ejecuciones del artículo y provienen de una sesión de evaluación sin reinicio de estado. No se dispone de comparaciones verificadas con otros reward models de uso común.

## Limitaciones y advertencias

- No genera texto: es un modelo de puntuación y no puede usarse para tareas generativas.
- Las puntuaciones no son probabilidades y no están calibradas entre modelos, por lo que no deben compararse valores absolutos obtenidos con checkpoints distintos.
- La etiqueta de país refleja la residencia de los participantes y no constituye una representación de la cultura de un país ni de las preferencias de todos sus residentes; la propia model card lo advierte.
- La muestra está dominada por el inglés y los conjuntos de test por país son pequeños, lo que limita la generalización.
- El modelo no está validado para decisiones consecuentes sobre personas; su uso previsto es la investigación en modelado de preferencias y alineamiento pluralista.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de que la puntuación no refleje preferencias reales fuera de la distribución de PRISM y del subgrupo de Chile.
- Sesgos conocidos: derivados de la composición de PRISM, del sesgo de auto-selección de los encuestados y del desequilibrio lingüístico hacia el inglés. No se documenta un análisis de sesgos específico en la información disponible.
- Los resultados publicados provienen de una sesión de evaluación en memoria sin reinicio de estado aleatorio; la reproducibilidad exacta de las cifras no está garantizada.
- Licencia de los pesos: MIT, lo que permite uso comercial de los pesos. Sin embargo, el dataset PRISM mezcla texto humano con CC-BY-4.0 y respuestas de modelos con CC-BY-NC-4.0, sujetas a los términos de los proveedores originales; el paquete no incluye registros de PRISM, pero un uso derivado del dataset debe respetar esas condiciones.
- El identificador de arXiv indicado (2606.18606) y las fechas de creación y actualización del repositorio (octubre de 2026) proceden de los metadatos tal cual se registraron.
- Cero descargas registradas en el momento de la consulta: no hay evidencia de validación por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/MulticulturalAlignment/scpo-reward-model-chile
- Paper: https://arxiv.org/abs/2606.18606
- Código: https://github.com/minsik-ai/Steerable-Cultural-Preference
- Modelo base: https://huggingface.co/OpenAssistant/reward-model-deberta-v3-base
- Dataset PRISM: https://huggingface.co/datasets/HannahRoseKirk/prism-alignment
- Licencia MIT: https://opensource.org/license/mit
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo.
