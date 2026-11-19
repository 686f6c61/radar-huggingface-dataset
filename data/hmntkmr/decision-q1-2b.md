# hmntkmr/decision-q1-2b

## Resumen

decision-q1-2b es un modelo de decisión de 2.000 millones de parámetros desarrollado por el usuario hmntkmr, derivado del modelo base unsloth/Qwen3.5-2B. No es un modelo generativo: sustituye la cabeza del modelo de lenguaje por una cabeza de esquema conjunta que lee marcadores de opción de los estados ocultos finales y devuelve probabilidades calibradas para un conjunto de preguntas tipadas en una sola pasada hacia delante. Está pensado para triaje de seguridad y otras decisiones estructuradas que requieren baja latencia, privacidad y auditabilidad.

El modelo se adapta mediante LoRA (r = 32, alpha = 32) sobre las proyecciones de atención, DeltaNet y MLP del backbone, y añade una cabeza de decisión de 4 capas y 8 cabezas con anchura 512. Soporta cuatro tipos de pregunta: `choice` (distribución sobre opciones etiquetadas), `score` (distribución sobre escala ordinal más puntuación esperada), `noul` (probabilidad de verdadero/falso) y `box` (localización de zonas y caja delimitadora sobre imagen de 280 x 280). La longitud máxima de secuencia es de 2048 tokens.

Su relevancia actual reside en que ofrece una alternativa determinista y local a los modelos generativos en tareas de clasificación y triaje: el resultado es una tabla de probabilidades registrable y reproducible, no texto libre, y con cuantización 4-bit NF4 puede ejecutarse en una GPU de portátil con unos 6 GB de VRAM. La licencia es Apache 2.0 y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet y atención, con torre de visión, adaptado con LoRA y cabeza de decisión conjunta |
| Parametros totales | 2B (modelo base Qwen3.5-2B); adaptador LoRA de ~128 MB y cabeza conjunta de ~58 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | 4-bit NF4 para el backbone (cabeza y temperaturas en FP32); opción `--no-4bit` para mayor precisión; exportación a checkpoint fusionado de 16 bits |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA + cabeza conjunta); pesos base descargados por separado |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-2B, un transformer híbrido que combina capas Gated DeltaNet con atención estándar e incluye una torre de visión. La adaptación sustituye la cabeza del modelo de lenguaje por una cabeza de esquema conjunta de anchura 512, 4 capas, 8 cabezas, feed-forward de 2048 e input de tamaño oculto 2048, que interpreta marcadores de opción presentes en los estados ocultos finales. El backbone se ajusta con LoRA (r = 32, alpha = 32, sin dropout) sobre las proyecciones de atención, DeltaNet y MLP.

El checkpoint final se obtiene mediante un "weight-space soup" multiobjetivo con pesos `[prior, s2a, s2b] = [0.0, 0.7, 0.3]`, y las salidas se calibran con escalado de temperatura por tipo de pregunta, almacenado en `unsloth_decision_config.json`. El layout interno se denomina `clef`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La entrada de imagen está fijada en 280 x 280 píxeles y el runner permite descargar la torre de visión a CPU con `--text-only`.

## Capacidades

- Clasificación tipada de decisiones: responde preguntas `choice`, `score`, `noul` y `box` en una sola pasada hacia delante.
- Probabilidades calibradas por pregunta, con valor de confianza asociado para enrutar casos inciertos.
- Múltiples preguntas simultáneas, incluidas varias consultas `box` en la misma pasada.
- Entrada de estado en JSON o texto, opcionalmente con imágenes.
- Localización visual de elementos de interfaz mediante cajas delimitadoras (entrada de imagen 280 x 280).
- Salida determinista y auditable: tabla de probabilidades registrable y reproducible, sin generación de texto libre.
- No soporta tool calling ni generación de texto; su función es exclusivamente la clasificación y puntuación estructurada.
- Capacidades multilingües limitadas al inglés.
- Ejecución local en GPU NVIDIA CUDA (Linux y Windows); no soporta CPU-only ni Apple Silicon con el runner incluido.

## Casos de uso

- Triaje de alertas e incidentes de seguridad: el modelo responde en una pasada con la acción recomendada (`ignore` / `monitor` / `step_up` / `isolate`) y la severidad en escala ordinal, lo que permite automatizar la clasificación inicial de alertas sin enviar datos a una API externa.
- Filtrado de phishing y spam: con preguntas `noul` sobre si un mensaje es malicioso, el equipo puede aplicar umbrales de confianza y derivar los casos dudosos a revisión humana.
- Gestión de solicitudes de acceso y permisos: preguntas `choice` para aprobar, denegar o escalar, más una pregunta `noul` sobre si requiere revisión humana, con trazabilidad completa de la decisión.
- Control de acciones de agentes: verificación `noul` de si una llamada a herramienta es segura antes de ejecutarla, aprovechando la baja latencia y la ejecución local.
- Moderación de contenido y abuso: clasificación `choice` o `noul` sobre categorías de política, con probabilidades calibradas para fijar umbrales por categoría.
- Automatización visual de interfaz: localización de controles (por ejemplo, un deslizador de brillo) mediante preguntas `box` sobre capturas de pantalla de 280 x 280, útil en pruebas automatizadas o asistentes de accesibilidad.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en hardware propio con ~6 GB de VRAM en 4-bit, permite procesar logs y mensajes sensibles sin salir de la infraestructura del equipo.

## Benchmarks y rendimiento

Los datos provienen de `jev_summary.json` del repositorio, generado en la evaluación de este checkpoint. Los tamaños de muestra son pequeños (150 filas por suite de dominio, 100 por conjunto público), por lo que diferencias de pocos puntos quedan dentro del ruido.

| Conjunto | Resultado |
|---|---|
| sms_spam | 98,0% |
| civil_comments | 93,0% |

El autor indica que este checkpoint no ha sido evaluado en conjuntos de datos de seguridad dedicados; los conjuntos públicos más cercanos son `sms_spam` y `civil_comments`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 6 GB con cuantización 4-bit NF4 del backbone (cabeza y temperaturas en FP32); `--no-4bit` requiere más memoria.
- GPU recomendadas: cualquier GPU NVIDIA CUDA con al menos 6 GB de VRAM; el runner solo soporta Linux y Windows con CUDA.
- GPU de consumo: cabe en GPUs de portátil con 6 GB o más; no soportado en CPU-only ni Apple Silicon con el runner incluido.
- Opciones de despliegue: runner propio `decision_engine.py` (con `--serve` para HTTP en `POST /v1/systemone`), exportación a checkpoint fusionado de 16 bits con `--merge-16bit DIR`; requiere una build de `unsloth` que incluya `FastDecisionModel` (probado con `unsloth 2026.10.6`).
- Latencia y throughput: no disponibles en la información proporcionada; el diseño enfatiza una sola pasada hacia delante para múltiples preguntas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decision-q1-2b | 2B (LoRA + cabeza) | 2048 tokens | Probabilidades tipadas calibradas | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (base) | 2B | no disponible | Texto generativo | no disponible | Hugging Face (unsloth) |
| Alternativas de clasificación de texto de ~2B | no disponible | no disponible | Etiquetas / logits | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No ha sido evaluado en conjuntos de datos de seguridad dedicados; el autor recomienda validar sobre datos etiquetados propios antes de confiar en él.
- Tamaños de muestra pequeños en la evaluación (150 filas por suite de dominio, 100 por conjunto público), con diferencias de pocos puntos dentro del ruido.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Longitud de contexto limitada a 2048 tokens.
- No genera texto ni soporta tool calling; su uso está restringido a clasificación y puntuación estructurada.
- El runner incluido no soporta CPU-only ni Apple Silicon; requiere GPU NVIDIA CUDA.
- Requiere una build específica de `unsloth` con `FastDecisionModel` (probado con 2026.10.6), lo que limita la portabilidad.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades calibradas pueden estar mal calibradas en dominios distintos al de entrenamiento; se recomienda mantener un humano en el bucle para acciones destructivas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.5-2B.

## Enlaces

- Hugging Face: https://huggingface.co/hmntkmr/decision-q1-2b
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Repositorio de evaluación: `jev_summary.json` dentro del repositorio del modelo
- Configuración de calibración: `unsloth_decision_config.json` dentro del repositorio del modelo
