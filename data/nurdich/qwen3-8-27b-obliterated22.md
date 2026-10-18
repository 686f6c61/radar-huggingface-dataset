# nurdich/Qwen3.8-27B-OBLITERATED22

## Resumen

Qwen3.8-27B-OBLITERATED22 es una variante «abliterated» (sin censura) del modelo Qwen/Qwen3.8-27B, publicada por el usuario nurdich en HuggingFace. El modelo conserva la arquitectura y los pesos del modelo base —un transformer decoder-only denso de 27.781.427.952 parámetros (unos 27,78 mil millones)— pero ha sido modificado mediante técnicas de proyección de direcciones de rechazo en el espacio de pesos (abliteration) para eliminar las negativas duras y las respuestas de tipo «discurso de seguridad». La model card describe tres iteraciones del proceso (V1, V2 y V3), con una técnica propia denominada «complementary abliteration blending» que combina un pass SVD con LEACE para reducir el coste en capacidad.

El interés del modelo es doble. Por un lado, es un caso de estudio técnico sobre hasta qué punto se puede eliminar el comportamiento de rechazo sin destruir las capacidades del modelo: el autor reporta una caída de solo 2,1 puntos porcentuales en MMLU 0-shot (82,3 % frente a 84,5 % del modelo original). Por otro, se distribuye en múltiples formatos (safetensors, GGUF y MLX) bajo licencia Apache 2.0, lo que facilita su despliegue tanto en servidores GPU como en Apple Silicon y en herramientas de inferencia local.

La relevancia práctica es la de un modelo sin capa de rechazo para investigación en seguridad de IA (red teaming), generación de código sin fricción y entornos donde las negativas del modelo base interrumpen tareas legítimas. Ahora bien: el repositorio no documenta ni la longitud de contexto, ni los idiomas soportados, ni los niveles de cuantización concretos, y la información de benchmarks es la aportada por el propio autor, sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (family Qwen3, `model_type: qwen3` según la model card) |
| Parametros totales | 27.781.427.952 (≈27,78 mil millones) |
| Parametros activos | No aplica: el modelo base es denso, no MoE (no se documenta lo contrario) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible el detalle. El repo incluye pesos en safetensors, GGUF y MLX (etiquetas `gguf`, `safetensors`, `mlx`), pero no se listan niveles (Q4_K_M, Q8_0, 4-bit MLX, etc.) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16/fp16 presumiblemente), GGUF, MLX; tamano total del repositorio: 237,1 GB |

Otros datos del repositorio: creado y actualizado el 2026-10-17, 0 descargas y 0 «likes» en el momento de la consulta, pipeline `text-generation`, librería declarada `mlx`, región `us`, etiquetas `endpoints_compatible`, `red-team`, `ai-safety-research`, `uncensored`, `obliteratus`, `abliterated`.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.8-27B: un transformer decoder-only denso de 27,78 mil millones de parámetros. Esta variante no ha sido reentrenada ni ajustada con datos nuevos; el autor parte de los pesos de Qwen y aplica abl iteration, una técnica que identifica direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y las proyecta fuera de los pesos. El resultado es un modelo con la misma estructura y tokenizer que el original, pero con la capa de negativas suprimida a nivel de pesos en lugar de a nivel de prompt.

La model card detalla la evolución del proceso. La V1 aplicó un único pass SVD agresivo con 5 direcciones: eliminó los rechazos duros por completo, pero con un coste de 6 puntos de MMLU. La V2 introdujo el «complementary abliteration blending»: ejecutar dos cirugías que fallan de forma distinta —SVD, que elimina el rechazo de forma agresiva pero daña capacidad, y LEACE, que minimiza la información mutua preservando capacidad pero eliminando menos rechazo— y mezclar sus pesos al 60/40, de modo que cada método cancele las debilidades del otro. Ese blend dejó la pérdida en 0,3 puntos de MMLU, pero persistían deflexiones blandas (respuestas tipo conferencia de seguridad sin sustancia). La V3, denominada «Deep Liberation», aplica refinamiento iterativo sobre el campeón de V2 (nunca partiendo del modelo stock) más un pass de cirugía dirigida con un corpus focalizado por categoría de deflexión, para localizar direcciones de rechazo específicas sin diluir la señal, y vuelve a mezclar los resultados.

No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO adicionales: esos datos corresponden al modelo base y no se reproducen aquí. Tampoco se especifica qué revisión concreta (¿V3? ¿una posterior etiquetada «22»?) corresponde a este repositorio en particular.

## Capacidades

- Generación de texto y conversación multi-turno con el estilo del modelo base Qwen3.8-27B.
- Razonamiento y conocimiento general: 82,3 % en MMLU 0-shot según la evaluación del autor, frente al 84,5 % del modelo stock.
- Generación de código: el autor reporta 20/20 en un conjunto de 20 prompts de ciberseguridad/código con implementaciones funcionales.
- Modo «thinking» (cadena de razonamiento): la V3 lo soporta según la model card, y el template de chat de los GGUF incluye un prefill que permite saltarlo y responder de forma directa.
- Respuestas sin negativas ni discursos de seguridad, incluido en categorías habitualmente restringidas (uso declarado: red teaming e investigación en seguridad).
- Tool calling / function calling: no confirmado explícitamente en la información disponible; la model card incluye recomendaciones para «agent harness» y llamadas repetidas a herramientas, lo que sugiere compatibilidad, pero no se documenta de forma formal.
- Uso agéntico multi-paso: la model card da parámetros específicos para evitar bucles en agentes (repetition_penalty 1,15; temperatura 0,1–0,3; 1024–2048 tokens por turno; resumir tras ~10 turnos).
- Capacidades multilingües: no disponible (no se listan idiomas).
- Visión y audio: no disponible; las etiquetas no indican modalidad distinta de texto.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo sirve como sujeto de prueba para medir qué responde un modelo sin capa de rechazo ante prompts adversarios, y comparar con el stock para calibrar clasificadores y filtros. Su valor aquí es precisamente que no bloquea la conversación, lo que permite auditar hasta dónde llega el comportamiento.
- Investigación sobre abliteration: reproducción y comparación de las tres variantes (V1, V2, V3) para estudiar la relación entre eliminación de rechazo y degradación de capacidad medida con MMLU; el autor aporta los números y la metodología de blending.
- Generación de código en pipelines internos: con temperatura 0, repetition_penalty 1,15 y max_new_tokens ≥ 2048, produce implementaciones completas sin interrupciones por negativas; encaja en tareas de scaffolding, refactorización y generación de tests donde el modelo base podría rechazar por similitud con código malicioso.
- Automatización de tareas de pentesting autorizado: análisis de cadenas de ataque, explicación de vulnerabilidades y generación de PoC en entornos de laboratorio con alcance definido por contrato.
- Asistente local en Apple Silicon: al publicarse en formato MLX, se puede ejecutar en Macs con memoria unificada suficiente para un modelo de ~28B en cuantización reducida, sin depender de la nube.
- Procesamiento de documentación sensible en local: al poder correr con llama.cpp/Ollama a partir de los GGUF, permite generar y resumir texto sobre material confidencial sin enviarlo a una API externa.
- Investigación en ciencia social y análisis de contenido: generación de texto sin filtros temáticos para estudiar sesgos, encuadres y estilos discursivos que el modelo base rechazaría abordar.

## Benchmarks y rendimiento

Datos aportados por el autor del modelo (lm-eval-harness, 0-shot, n=100 por materia, 5.700 preguntas). No verificados de forma independiente.

| Modelo | MMLU | StdErr | vs stock |
|---|---|---|---|
| Qwen3.8-27B (stock) | 84,5 % | No disponible | — |
| OBLITERATED V1 | 81,4 % | No disponible | −6,0 pp (según la tabla de la card; la propia card cita −6pp) |
| OBLITERATED V2 | 84,3 % | No disponible | −0,3 pp |
| OBLITERATED V3 | 82,3 % | No disponible | −2,1 pp |

Otras métricas reportadas por el autor (no estandarizadas, tamaños de muestra muy pequeños):

| Prueba | Stock | V2 | V3 |
|---|---|---|---|
| Tareas de ciberseguridad/código (20 prompts) | Rechaza | No probado | 20/20 con código funcional |
| Casos avanzados de mundo real (8 casos) | 5/8 | 7/8 | 7/8 |
| Modo thinking | Sí | No (rechaza) | Sí |

No se han publicado resultados de benchmarks independientes (HumanEval, GSM8K, BBH, MMLU-Pro, etc.) en la información disponible. La tabla comparativa de MMLU de la model card aparece truncada en el material proporcionado.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (27,78 mil millones); la model card no publica requisitos oficiales.

- VRAM para inferencia en bf16/fp16: ~55,6 GB solo de pesos, más KV cache; en la práctica 64–70 GB para contexto moderado.
- VRAM en cuantización de 8 bits: ~28 GB de pesos; 32–40 GB con overhead.
- VRAM en cuantización de 4 bits: ~14–16 GB de pesos; 20–24 GB con contexto amplio.
- GPU de datacenter: A100 80 GB, H100 80 GB y L40S 48 GB (esta última en 8 bits o 4 bits) son opciones holgadas para bf16.
- GPU de consumo: en 4 bits entra en RTX 4090 (24 GB) y RTX 3090 (24 GB); en 8 bits no cabe en 24 GB con contexto largo. Con 16 GB (RTX 4080, 4060 Ti 16 GB) solo en cuantizaciones de 4 bits agresivas y contexto corto.
- Apple Silicon: la librería declarada es MLX, así que el formato MLX está pensado para Macs con memoria unificada; un equipo con 64 GB puede alojar bf16, y con 32 GB se necesita cuantización.
- Opciones de despliegue: MLX/MLX-LM para Apple Silicon; llama.cpp, Ollama y LM Studio para los GGUF (la card recomienda usar el template incluido con `--jinja`); vLLM y TGI para los safetensors en servidor. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo API.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la card advierte que con decodificación greedy (temperatura 0) y repetition_penalty 1,15 se obtienen las respuestas más completas, y que temperaturas superiores a 0,5 degradan la calidad de forma significativa; también señala riesgo de bucles en modo agéntico si no se ajusta la penalización de repetición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED22 (este) | 27,78 B | No disponible | 82,3 % (V3, autor) | Apache 2.0 | safetensors, GGUF, MLX |
| Qwen/Qwen3.8-27B (base) | 27,78 B | No disponible | 84,5 % (0-shot, autor) | Apache 2.0 (según la card del derivado) | safetensors (upstream) |
| OBLITERATED V1 del mismo autor | 27,78 B | No disponible | 81,4 % | Apache 2.0 | No disponible en este repo |
| OBLITERATED V2 del mismo autor | 27,78 B | No disponible | 84,3 % | Apache 2.0 | No disponible en este repo |
| Otras variantes abliterated de la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables sobre otros modelos abliterated comparables (por ejemplo, de otras familias y tamaños) en la información proporcionada, por lo que no se incluye una comparación con ellos.

## Limitaciones y advertencias

- Eliminación deliberada de salvaguardas: el modelo no rechaza peticiones que el modelo base rechazaría. No debe desplegarse en aplicaciones orientadas al público sin una capa externa de moderación y filtrado.
- Riesgo legal y de cumplimiento: la licencia Apache 2.0 permite uso comercial, pero eso no exime de las obligaciones sectoriales (RGPD, DSA, normativa de ciberseguridad) ni de la responsabilidad civil por el contenido generado.
- Alucinación: la abliteration no mejora la veracidad; la caída de MMLU indica cierta pérdida de capacidad respecto al stock, y en usos agénticos la card advierte de bucles y de degradación del contexto tras ~10 turnos.
- Evaluación no independiente y con muestras pequeñas: MMLU usa 5.700 preguntas, pero las pruebas de código (20 prompts) y de casos reales (8 casos) son anecdóticas y están auditadas por el propio autor.
- Sensibilidad a los parámetros de decodificación: la card afirma que temperaturas superiores a 0,5 degradan la calidad de forma notable y que sin repetition_penalty 1,15 la decodificación greedy entra en bucles sobre imports y boilerplate. Es un comportamiento frágil para producción.
- Prompt de sistema: el autor recomienda no usar system prompt («naked is better») porque puede reintroducir rechazos; esto choca con las prácticas habituales de despliegue, que dependen de instrucciones de sistema para formato y política.
- Idiomas y contexto sin documentar: no se puede garantizar cobertura multilingüe ni planificar la ventana de contexto a partir de la información disponible.
- Repositorio de procedencia incierta: el código de ejemplo de la model card apunta a «OBLITERATUS/Qwen3.8-27B-OBLITERATED» mientras que el repositorio real es «nurdich/Qwen3.8-27B-OBLITERATED22»; conviene verificar que los pesos corresponden a la revisión documentada. El repositorio tiene 0 descargas y 0 «likes», sin validación comunitaria.
- Tamaño del repo (237,1 GB): incluye varias copias del modelo en distintos formatos; hay que descargar selectivamente para no consumir almacenamiento innecesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nurdich/Qwen3.8-27B-OBLITERATED22
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper o blog técnico sobre abliteration: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo enlaces a trackers de Fortnite, sin relación).
