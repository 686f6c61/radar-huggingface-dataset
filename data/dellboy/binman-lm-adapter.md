# Dellboy/binman-lm-adapter

## Resumen

BINMAN-LM adapter es un adaptador LoRA de PEFT para el modelo base Qwen/Qwen2.5-3B-Instruct, desarrollado por Marc C. Deller (usuario Dellboy) como componente lingüístico del proyecto BINMAN (Blind-spot INventory of Molecular Adhesives and Neosubstrates). BINMAN es un atlas de ligandos puente (molecular glues), degrones estructurales, triaje de ligasas E3 y degradabilidad construido a partir de la base de datos PDB. El adaptador convierte lenguaje natural sobre el atlas en objetos de consulta estructurados, clasifica evidencias y se abstiene de responder cuando el esquema del atlas no puede contestar.

Se trata de un adaptador de bajo rango (LoRA) de aproximadamente 0,1 GB en el repositorio, entrenado sobre 32 capas (4 a 35) con rango 8 y 14.152 iteraciones a batch 4 durante dos épocas sobre 28.304 ejemplos. No es un modelo completo, sino un ajuste del Qwen2.5-3B-Instruct orientado exclusivamente a tres tareas cerradas del dominio estructural, con un fuerte énfasis en la abstención medida y en no emitir valores numéricos propios.

Su relevancia radica en el enfoque de seguridad del dominio: el modelo nunca calcula, estima ni reporta cifras (ΔSASA, distancias Cβ–Cβ, puntuaciones de bolsillo, pLDDT); todas las métricas se computan de forma determinista en Python sobre el atlas y se le pasan al interfaz. Cualquier número no copiado literalmente de un registro recuperado se considera un defecto. La licencia del modelo base (Qwen Research License) restringe el uso a fines no comerciales, lo que condiciona cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | Adaptador: no disponible (repo de 0,1 GB); modelo base: 3,09 B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; base Qwen2.5-3B-Instruct: 32.768 tokens (131.072 con YaRN) |
| Tipos de cuantizacion | Entrenado contra base 4-bit; servido contra base 16-bit; cuantizaciones adicionales no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | qwen-research (Qwen Research License Agreement), solo uso no comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un ajuste LoRA de PEFT sobre un transformer decoder-only estándar (Qwen2.5-3B-Instruct), con rango 8, escala 20 (equivale a `lora_alpha` 160 en PEFT) y 32 capas intervenidas (de la 4 a la 35). Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, se ajustan las proyecciones de atención y el bloque MLP completo. El entrenamiento se realizó con `mlx-lm` sobre Apple Silicon contra la versión cuantizada a 4-bit de Qwen2.5-3B-Instruct (`mlx-community/Qwen2.5-3B-Instruct-4bit`), a 14.152 iteraciones con batch 4 durante dos épocas sobre 28.304 ejemplos, y posteriormente se convirtió a formato PEFT.

La innovación técnica principal no está en la arquitectura sino en el planteamiento de la tarea: el modelo aprende tres trabajos discretos (traducción de consultas, triaje de evidencias y abstención estructurada) y se entrena explícitamente para no fabricar cifras. La clasificación de triaje tiene cuatro clases: `crystallisation_artefact`, `molecular_glue`, `native_cofactor` y `protac`. Los datos de entrenamiento derivan de BioLiP2, MGDB, MolGlueDB, MGTbind y PROTAC-DB, citados con DOI en el repositorio. El autor documenta en `FINDINGS.md` la matriz de confusión completa de la Task B, señalando que los errores se concentran en la celda glue frente a PROTAC. La ronda de pesos publicada corresponde a la iteración 07; existe una ronda adicional combinando 32 capas con rango 32 que se actualiza cuando mejora las métricas. No se menciona uso de RLHF ni DPO.

## Capacidades

- Traducción de consultas: convierte una pregunta sobre el atlas BINMAN en un objeto de consulta estructurado.
- Triaje de evidencias: clasifica un ligando puente en una de cuatro clases (`crystallisation_artefact`, `molecular_glue`, `native_cofactor`, `protac`).
- Abstención estructurada: rechaza de forma explícita cuando el esquema del atlas no puede responder la pregunta.
- Generación de texto en inglés dentro del ámbito del esquema BINMAN.
- No genera números propios: cualquier cifra debe copiarse literalmente de un registro recuperado.
- No soporta tool calling general ni function calling fuera del esquema del proyecto.
- No se documentan capacidades de agentes, multi-step reasoning, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Interfaz de consulta sobre el atlas BINMAN: traducir preguntas en lenguaje natural de investigadores a objetos de consulta del esquema y devolver registros recuperados, con la garantía de que las cifras provienen del cálculo determinista en Python y no del modelo.
- Triaje automatizado de ligandos puente: clasificar candidatos en las cuatro clases de evidencia para priorizar revisiones manuales, aprovechando la macro-F1 de 0,9336 medida en el conjunto balanceado de 240 muestras.
- Curación de bases de datos estructurales: apoyar la anotación de entradas de PDB y bases derivadas, separando artefactos de cristalización de glues moleculares reales y cofactores nativos.
- Investigación en degradación dirigida de proteínas (TPD): asistir en la identificación de PROTAC frente a otras clases de evidencia en flujos internos de descubrimiento, siempre con revisión humana.
- Filtrado con abstención segura: integrarse en pipelines donde una respuesta inventada es más costosa que un rechazo, ya que la Task C reporta abstención 1,00 y fabricación 0,00 en la evaluación publicada.
- Evaluación y reproducibilidad metodológica: servir como referencia de cómo medir abstención y fabricación en modelos de dominio, con métricas publicadas junto a su n y su método.
- Prototipado en hardware de consumo: al ser un adaptador LoRA sobre un modelo de 3 B, permite experimentar localmente en equipos con GPU modesta o Apple Silicon.

## Benchmarks y rendimiento

Medidos sobre un conjunto de triaje de 240 muestras balanceadas por clase (60 por clase, semilla fija), según lo publicado en `FINDINGS.md`:

| Tarea / metrica | Valor |
|---|---|
| Task B macro-F1 | 0,9336 |
| `molecular_glue` F1 / recall | 0,958 / 0,950 |
| `protac` F1 | 0,975 |
| Task A set equality | 1,000 |
| Task C abstención / fabricación | 1,00 / 0,00 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores se midieron bajo MLX salvo que se indique lo contrario, y los errores de la Task B se concentran en la celda glue frente a PROTAC.

## Requisitos de hardware

- VRAM estimada para el modelo base de 3 B: aproximadamente 6-7 GB en FP16, 3-4 GB en 8-bit y 2 GB en 4-bit; el adaptador LoRA añade un coste marginal (repo de 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4070, RTX 4090), A100 o H100 para lotes grandes o servicio concurrente.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización, y en Apple Silicon (el entrenamiento original se hizo con mlx-lm).
- Opciones de despliegue: PEFT (carga directa del adaptador), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF del modelo base con el adaptador fusionado.
- Latencia y throughput estimados: no disponibles.
- Nota de cuantización: el adaptador se entrenó para corregir una base cuantizada a 4-bit y se sirve contra una base de 16-bit; la transferencia de la corrección no está garantizada. El script `lm/export_hf.py --verify` permite comparar métricas sobre el conjunto de test real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BINMAN-LM adapter (este) | LoRA sobre 3,09 B | No disponible (base 32.768) | Task B macro-F1 0,9336; Task A 1,000 | qwen-research (no comercial) | HuggingFace + Space demo |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 (131.072 con YaRN) | Sin las tareas BINMAN | Apache 2.0 | HuggingFace |
| Adaptadores de dominio comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se conocen adaptadores públicos equivalentes especializados en el esquema BINMAN, por lo que la comparación directa con alternativas de la misma tarea no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; los errores de triaje se concentran en la confusión glue frente a PROTAC.
- Riesgo de alucinación: mitigado por diseño (Task C fabricación 0,00 en la evaluación), pero el autor advierte que cualquier afirmación química convincente fuera de las tres tareas definidas debe considerarse no verificada.
- Limitaciones de contexto e idioma: soporte solo en inglés y sin datos de longitud de contexto específicos del adaptador.
- Restricción de licencia: la Qwen Research License Agreement permite uso, modificación y redistribución únicamente con fines no comerciales; el adaptador se redistribuye bajo los mismos términos como modificación según la sección 3.
- Advertencia sobre datos de origen: los datos de entrenamiento derivan de PROTAC-DB, cuyos términos permiten uso interno incluyendo derivados pero prohíben la redistribución; la publicación de los pesos fue una decisión explícita del autor registrada en `DECISIONS.md` D-030, que cualquier reutilizador debería leer.
- Caveat de cuantización: la corrección aprendida sobre base 4-bit puede no transferirse a la base 16-bit servida; no asumir equivalencia sin verificar.
- Alcance: no es un asistente químico general, no conoce afinidades de unión, resultados de ensayos ni estado clínico, y debe abstenerse cuando se le piden.
- Métricas medidas bajo MLX: leer los números publicados como correspondientes a ese entorno salvo indicación contraria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dellboy/binman-lm-adapter
- Demo (Space): https://huggingface.co/spaces/Dellboy/binman-lm
- Repositorio BINMAN: https://github.com/bellcheddar/BINMAN
- Métricas y matriz de confusión (`FINDINGS.md`): https://github.com/bellcheddar/BINMAN/blob/main/FINDINGS.md
- Fuentes de datos y DOIs: https://github.com/bellcheddar/BINMAN#-source-data
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
