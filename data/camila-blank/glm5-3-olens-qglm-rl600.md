# camila-blank/glm5.3-olens-qglm-rl600

## Resumen

GLM-5.3 O-lens (Qwen3.6-27B reader, qglm, RL step 600) es un adaptador PEFT de interpretabilidad desarrollado por el usuario camila-blank. No se trata de un modelo generativo al uso, sino de un «lector» (reader) entrenado para interpretar activaciones internas de GLM-5.3 proyectandolas al espacio de representacion de Qwen3.6-27B mediante mapas afines por capa. El objetivo es disponer de una sonda capaz de leer el estado interno de GLM-5.3 en once capas concretas (24, 29, 34, 39, 44, 49, 54, 59, 63, 68 y 73) usando como sustrato un modelo abierto de 27.000 millones de parametros.

El adaptador se construye sobre Qwen/Qwen3.6-27B y combina tres piezas: mapas afines por capa que transforman las activaciones de GLM-5.3 al espacio de Qwen, un ajuste supervisado (SFT) sobre salidas de un modelo autorregresivo de referencia y un refinamiento con GRPO durante 600 pasos. La recompensa del RL es el propio lector O-lens final de Qwen3.6-27B (`agu18dec/final_olens`), aplicado sobre las activaciones ya mapeadas.

Su relevancia es acotada pero especifica: forma parte de un esfuerzo de investigación en interpretabilidad mecanicista (workspace global, issue #657) orientado a estudiar y monitorizar representaciones internas de modelos propietarios o cerrados mediante un modelo abierto como intermediario. No es un modelo para desplegar en produccion como asistente, sino una herramienta de analisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre Qwen3.6-27B; mapas afines por capa para proyeccion de activaciones |
| Parametros totales | No disponible (el adaptador se distribuye sobre un modelo base de 27B; el repo pesa 9,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (mapas afines por capa, LoRA y adaptadores) |

## Arquitectura y entrenamiento

El artefacto no es un transformer entrenado de cero, sino un conjunto de adaptadores y transformaciones sobre Qwen3.6-27B. La pieza central son los mapas afines `affine/L{layer}.safetensors`, que proyectan las activaciones de GLM-5.3 (espacio `raw_cfve`) al espacio de Qwen3.6-27B para once capas. Se acompanan de las medias de centrado usadas en el ajuste (`fit/mu.safetensors`) y de un informe (`affine_report.json`).

Sobre esa proyeccion se entrena un adaptador LoRA en dos fases. Primero un SFT sobre salidas del modelo autorregresivo de referencia (`sft/final/`), y despues un refinamiento con GRPO durante 600 pasos (`rl/iter_000600/`), que constituye el lector final. La recompensa del RL es el lector O-lens final de Qwen3.6-27B (`agu18dec/final_olens`), aplicado a las activaciones mapeadas. El brazo se identifica como `qglm-rl600-x4` dentro del workspace global #657.

## Capacidades

- Lectura e interpretacion de activaciones internas de GLM-5.3 en once capas especificas.
- Proyeccion afín de representaciones entre dos espacios latentes distintos (GLM-5.3 y Qwen3.6-27B).
- Evaluacion de calidad de lectura sobre WorkspaceBench con juez externo (Opus 5.5).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generativa; el modelo es una sonda de interpretabilidad.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: lectura de activaciones (activation reader), modo «oracle-lens», entrenamiento con GRPO.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: usar el lector para inspeccionar que informacion codifica GLM-5.3 en las capas 24 a 73 y comparar con la representacion de un modelo abierto.
- Monitorizacion de modelos cerrados: emplear la proyeccion afín para aproximar el estado interno de GLM-5.3 con un modelo abierto y detectar representaciones anomalas.
- Auditoria de sesgos y comportamientos: analizar activaciones en capas intermedias para localizar direcciones asociadas a comportamientos concretos.
- Evaluacion comparativa de lectores: contrastar este brazo (`rl600`) con el SFT y con `glm53aff-rl600` (#652) sobre WorkspaceBench para medir el efecto del RL.
- Reproduccion de experimentos: reutilizar los mapas afines y las medias de centrado para replicar el pipeline SFT + GRPO sobre otras capas o modelos base.
- Desarrollo de sondas lineales: partir de los mapas afines como inicializacion para entrenar clasificadores o regresores sobre activaciones de GLM-5.3.
- Docencia e investigacion academica: ilustrar tecnicas de proyeccion entre espacios latentes y alineamiento de representaciones con un caso reproducible.

## Benchmarks y rendimiento

Resultados en WorkspaceBench (bench final de GLM, #657, juez Opus 5.5), bloque 54:

| Brazo | Bloque | Macro gated | Alucinacion (menor es mejor) |
|---|---|---|---|
| Este modelo (rl600) | 54 | 0,491 | 0,463 |
| SFT | 54 | 0,397 | 0,444 |
| glm53aff-rl600 (#652) | 54 | 0,531 | 0,315 |

Macro gated considerando cualquiera de las 11 capas: 0,696.

## Requisitos de hardware

- El adaptador se distribuye sobre Qwen3.6-27B, por lo que la inferencia requiere cargar el modelo base completo (27B parametros).
- VRAM estimada: no disponible de forma oficial; para un modelo de 27B en BF16 se necesitan aproximadamente 54 GB solo de pesos, y en cuantizacion de 8 bits alrededor de 27 GB, mas overhead de activaciones y del adaptador.
- GPU recomendadas: A100 80 GB o H100 para BF16; RTX 4090 (24 GB) solo viable con cuantizacion agresiva (4 bits) y posible offload.
- Cabe en GPU de consumo: previsiblemente en RTX 4090/3090 solo con cuantizacion de 4 bits y tecnicas de offload; no confirmado por el autor.
- Opciones de despliegue: no disponibles de forma especifica; al ser PEFT sobre transformers, cabria usar transformers + PEFT, y potencialmente vLLM o TGI con soporte de adaptadores, aunque no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (glm5.3-olens-qglm-rl600) | Adaptador sobre 27B | No disponible | Lector de activaciones de GLM-5.3 | No disponible | Hugging Face (0 descargas) |
| glm53aff-rl600 (#652) | Adaptador sobre 27B | No disponible | Lector alternativo, mismo workspace | No disponible | Referenciado en la model card |
| SFT (mismo repo) | Adaptador sobre 27B | No disponible | Lector sin RL | No disponible | Incluido en este repo |
| Qwen3.6-27B (base) | 27B | No disponible | Modelo generativo abierto | No disponible | Hugging Face (Qwen) |

No se dispone de modelos comparables de interpretabilidad con especificaciones publicas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse como asistente, chatbot ni para generacion de texto o codigo.
- Licencia no especificada: no hay garantia de uso comercial; debe consultarse con el autor antes de cualquier uso productivo.
- Idiomas soportados no documentados.
- El rendimiento depende de la calidad de los mapas afines; errores de proyeccion entre espacios latentes pueden propagarse a la lectura.
- Resultados de benchmark limitados al bloque 54 y a un unico juez (Opus 5.5); la generalizacion a otras capas o tareas no esta demostrada.
- El brazo `glm53aff-rl600` (#652) obtiene mejor macro gated (0,531 frente a 0,491) y menor alucinacion (0,315 frente a 0,463), por lo que este modelo no es el mejor de su familia.
- Riesgo de alucinacion medido en 0,463 en el bloque evaluado, lo que indica una tasa considerable de lecturas incorrectas.
- Repo con 0 descargas y 0 likes: sin validacion comunitaria ni soporte documentado.
- Sin informacion sobre sesgos conocidos ni sobre el dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/camila-blank/glm5.3-olens-qglm-rl600
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Lector O-lens de referencia (recompensa): `agu18dec/final_olens` (referenciado en la model card)
- Workspace global #657 y brazo #652: referenciados en la model card, sin URL publica disponible
- Paper, blog, repositorio o demo: no disponibles
