# Bluebarrels/easylm-kidsafety-bonsai-2-9b

## Resumen

`Bluebarrels/easylm-kidsafety-bonsai-2-9b` es un adaptador LoRA de PEFT, publicado por el usuario Bluebarrels, que especializa el modelo base ternario `prism-ml/Ternary-Bonsai-2-9B-gguf` (9.000 millones de parámetros, pesos de 1,58 bits, aproximadamente 2 GB) en dos tareas declaradas: tutoría socrática de materias STEM y humanidades para menores, y rechazo explícito ante peticiones de explotación de menores o síntesis de contenido inseguro. El adaptador ocupa unos 5,1 MB según el autor y se distribuye en `adapter_model.safetensors`, con 56 tensores y 417.775 elementos no nulos en FP16.

El interés del proyecto es fundamentalmente de nicho: forma parte de una "escalera" de adaptadores del mismo autor sobre la familia Bonsai 2 (2B, 4B, 9B y 27B) pensada para ejecutarse en el ecosistema EasyLM/Hydra, incluyendo inferencia en navegador vía WebGPU y un CLI con orquestación de herramientas MCP. El modelo declara una ventana de contexto de 262.144 tokens, lo que resulta llamativo para una base de 9B en formato ternario.

Ahora bien, la ficha debe leerse con cautela: el repositorio no incluye resultados de benchmarks, no declara idiomas soportados, el corpus de entrenamiento del adaptador consta de solo 35 turnos y el autor no publica evaluaciones de seguridad independientes. La información disponible es la de la model card, sin verificación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA; la model card no describe la arquitectura del modelo base, solo que es ternario) |
| Parámetros totales | 9B en el modelo base; el adaptador contiene 417.775 elementos no nulos en FP16 |
| Parámetros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Base ternaria de 1,58 bits en GGUF (~2 GB); adaptador en FP16 (safetensors); se lista además una build MLC `q4f16_1` como base WebGPU |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (PEFT LoRA); modelo base en GGUF y build MLC |

Otros datos declarados por el autor:

| Propiedad | Valor |
|---|---|
| Rango / alpha / dropout del LoRA | r = 16, alpha = 32, dropout = 0,05 |
| Módulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Huella del adaptador | ~5,1 MB (la verificación SafeTensors reporta 842.872 bytes en elementos no nulos) |
| Dataset de entrenamiento | `Bluebarrels/easylm-training-corpus`, fichero `adapter_kidsafety_chatml.jsonl`, 35 turnos |
| Librería | peft |
| Repositorio del autor | 0 descargas, 0 likes, tamaño de repo 0,0 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA clásico de PEFT aplicado sobre siete proyecciones por capa (atención completa y MLP), con rango 16 y alpha 32. El modelo base, `prism-ml/Ternary-Bonsai-2-9B-gguf`, es una variante ternaria de 1,58 bits de una familia de 9B; la model card no especifica si la base es un transformer denso, híbrido o MoE, ni detalla el proceso de ternarización. El autor menciona además una build MLC `q4f16_1` de Qwen3.5-9B como base para WebGPU/MLC, lo que introduce una ambigüedad relevante sobre qué pesos concretos se usaron para el entrenamiento del adaptador.

En cuanto a los datos, el adaptador se entrenó sobre un único fichero ChatML de 35 turnos. La procedencia declarada del corpus es heterogénea y no verificable: 92 "Sovereign Academic Stacks" (textos tipo Greene-Feynman-Clarity y tablas `FACTS.md`), 369 tablas de hechos con 4.634 filas cuantitativas verificadas, 151 "Council of Kami Books" con voces de autores históricos y científicos, un grafo "Alice 1.0 EMap" con 46.025 nodos y 19.842 aristas, seis modos de diagnóstico de confusión (C1–C6), doce formas de pregunta (Q01–Q12), una máquina de estados de elencos y aporía en siete fases (S0–S6) y un "why-ledger" con reglas W0001–W0003. No se documenta número de tokens, composición exacta, ni si hubo RLHF o DPO; el autor tampoco publica curvas de entrenamiento ni pérdidas finales.

## Capacidades

- Generación de texto orientada a tutoría: explicaciones paso a paso de matemáticas, física, química, biología, informática, derecho, historia y filosofía, según el corpus declarado.
- Razonamiento socrático: el autor declara modos de diagnóstico de confusión (C1–C6) y patrones de pregunta (Q01–Q12) para guiar al alumno sin dar la respuesta directa.
- Rechazo duro ante contenido inseguro: el adaptador está especializado en negarse ante peticiones de explotación de menores o síntesis de material peligroso.
- Enrutado de herramientas en modo offline: integración declarada con `hydra agent` y orquestación MCP para rutas de herramientas locales.
- Ventana de contexto larga: 262.144 tokens declarados, útil para mantener el hilo de una sesión de estudio prolongada o para cargar material de referencia extenso.
- Ejecución en cliente: el autor documenta carga en navegador vía WebGPU mediante su runtime EasyLM, con parseo del header SafeTensors y aplicación de pesos LoRA en TypeScript.
- Modo agente y multi-paso: el CLI Hydra soporta modos `chat`, `agent`, `swarm`, `computer` y `terminal`, con permisos `manual`, `accept_edits`, `plan` y `bypass`, y modos de contexto `recall`, `compact` y `sliding`.
- Capacidades no confirmadas: no hay evidencia publicada de visión, audio, tool calling estándar (formato OpenAI) ni evaluación multilingüe.

## Casos de uso

- Tutor de matemáticas con enfoque socrático: el adaptador puede gestionar una sesión multi-turno en la que, en lugar de resolver el problema, formula preguntas de acercamiento; los 262.144 tokens de contexto permiten mantener el historial completo de la sesión y el material de referencia del temario.
- Guardián de seguridad en aplicaciones de chat para menores: desplegado como capa de clasificación y reescritura sobre un modelo mayor, aplica rechazos duros ante peticiones de explotación infantil y reformula respuestas inseguras; su tamaño (~5 MB de adaptador) permite cargarlo junto al modelo base en el mismo proceso.
- Estudio sin conexión en el navegador: al ejecutarse sobre una base ternaria de ~2 GB con WebGPU, es viable en Chromebooks y portátiles modestos sin enviar datos del menor a un servidor, lo que simplifica el cumplimiento de protección de datos en centros educativos.
- Enrutado de herramientas en estación de trabajo: dentro de Hydra (`hydra serve`, puerto 7777), el adaptador puede decidir qué herramienta local invocar (lectura de repositorio, ejecución de tests de verificación) en un flujo de agente con permisos `plan` o `accept_edits`.
- Generación de material docente: producir baterías de preguntas de diagnóstico clasificadas por tipo de confusión (C1–C6) y por forma de pregunta (Q01–Q12) para que un profesor prepare una sesión de refuerzo.
- Verificación de datos de referencia en trabajos escolares: contrastar cifras de tablas factuales (minerales, demografía, termodinámica) presentes en el corpus, con la advertencia de que no hay evaluación publicada de precisión.
- Asistente de repaso de humanidades con voz histórica: el corpus declara 151 "voces" de maestros históricos, lo que permitiría generar explicaciones con registro estilizado para asignaturas de historia o filosofía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna evaluación de seguridad o de tasa de rechazo. Tampoco se aportan métricas de latencia o throughput.

## Requisitos de hardware

- Pesos del modelo base: ~2 GB declarados para la variante ternaria de 1,58 bits en GGUF; el adaptador añade ~5,1 MB (o 842.872 bytes de elementos no nulos en FP16, según la verificación SafeTensors).
- VRAM estimada para inferencia: no hay mediciones publicadas. Como estimación a partir del tamaño declarado, una GPU con 4 GB o más debería alojar la base ternaria con margen para el contexto; con 8 GB se dispone de holgura para ventanas largas. Cifra orientativa, no verificada.
- GPU recomendadas: no disponible. El autor no publica perfiles de hardware; el caso de uso declarado es WebGPU en cliente y CLI local, no servidores A100/H100.
- GPU de consumo: sí es viable en principio, dado el tamaño de ~2 GB; el propio autor sitúa la variante de 2B (500 MB) como opción para móviles, tablets y Chromebooks, y la de 9B como estación de trabajo.
- Opciones de despliegue: llama.cpp u Ollama sobre el GGUF base; MLC/WebGPU para ejecución en navegador; EasyLM (runtime propio del autor) con carga del adaptador vía `parseSafeTensorsHeader`/`applyLoRAWeights`; Hydra CLI (`hydra`, `hydra agent`, `hydra swarm`, `hydra serve` en el puerto 7777); PEFT/transformers para fusionar el adaptador con la base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparación con los otros adaptadores de la misma escalera declarada por el autor y con el modelo base:

| Modelo | Parámetros base | Tamaño | Contexto | Licencia | Enfoque declarado |
|---|---|---|---|---|---|
| easylm-kidsafety-bonsai-2-9b (este) | 9B | ~2 GB base + ~5,1 MB adaptador | 262.144 tokens | AGPL-3.0 | Seguridad infantil y tutoría socrática |
| easylm-bonsai-2-2b | 2B | 500 MB | No disponible | No disponible | Opción universal en navegador (WebGPU) |
| easylm-bonsai-2-4b | 4B | 1 GB | No disponible | No disponible | Coaching multi-turno y mentoría de código |
| easylm-bonsai-2-27b | 27B | 6 GB | 262.144 tokens | No disponible | Referencia de estación de trabajo, con torre de visión |
| prism-ml/Ternary-Bonsai-2-9B-gguf | 9B | ~2 GB | No disponible | No disponible | Base ternaria sin especializar |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguno de ellos, por lo que la comparación se limita a tamaño, contexto y enfoque declarado. Como referencia de categoría, los modelos ternarios tipo BitNet/Bonsai compiten con cuantizaciones de 2–4 bits de transformers densos del mismo orden de parámetros, pero no se han encontrado en la información proporcionada resultados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Corpus de adaptación mínimo: el fichero declarado contiene 35 turnos. Es un volumen muy bajo para modificar de forma fiable el comportamiento de un modelo de 9B; cabe esperar un ajuste superficial y con riesgo de sobreajuste al formato ChatML usado.
- Sin evaluación publicada: no hay benchmarks, ni pruebas de red teaming, ni métricas de tasa de rechazo o de falsos positivos. Las afirmaciones de seguridad infantil no están verificadas de forma independiente.
- Ambigüedad sobre el modelo base: la model card cita `prism-ml/Ternary-Bonsai-2-9B-gguf` como base principal y `mlc-ai/Qwen3.5-9B-q4f16_1-MLC` como base WebGPU/MLC. Un adaptador LoRA entrenado sobre una base no es portable a otra distinta sin reentrenamiento; conviene verificar contra qué pesos se generaron los tensores antes de usarlo.
- Inconsistencia en el tamaño del adaptador: se declaran ~5,1 MB y, a la vez, 842.872 bytes de elementos no nulos en FP16. El repositorio figura con 0,0 GB, por lo que el contenido real debe comprobarse tras la descarga.
- Riesgo de alucinación: la base es un modelo de 9B cuantizado de forma agresiva (1,58 bits) y el adaptador no aporta un mecanismo de verificación factual. Las citas de tablas y datos históricos del corpus pueden reproducirse con errores.
- Idiomas: no se declara lista de idiomas. El corpus parece centrado en inglés; no hay garantía de calidad en castellano.
- Licencia AGPL-3.0: es copyleft fuerte. Ofrecer el modelo como servicio en red obliga a publicar el código fuente correspondiente; para productos propietarios o integraciones embebidas conviene revisar la compatibilidad antes de adoptarlo.
- Contexto declarado no validado: 262.144 tokens es una cifra aportada por el autor sin pruebas de recuperación en el rango largo; en bases ternarias la calidad degrada con la distancia.
- Metadatos del repositorio: 0 descargas y 0 likes, con fecha de creación declarada 2026-10-17. Se trata de una publicación sin tracción ni revisión por parte de la comunidad.
- Uso en producción con menores: cualquier despliegue real exige filtros adicionales, revisión humana y cumplimiento normativo (por ejemplo, RGPD y normativa de protección de menores); este adaptador no sustituye a un sistema de moderación dedicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bluebarrels/easylm-kidsafety-bonsai-2-9b
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus
- Base MLC/WebGPU citada en la model card: https://huggingface.co/mlc-ai/Qwen3.5-9B-q4f16_1-MLC

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces obtenidos corresponden a una obra editorial sin relación con el proyecto. No se han encontrado papers, blogs, repositorios de código ni demos adicionales.
