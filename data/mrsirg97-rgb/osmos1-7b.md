# mrsirg97-rgb/osmos1.7b

## Resumen

osmos1.7b es un modelo de generación de texto de 1.728 millones de parámetros publicado por el usuario mrsirg97-rgb en Hugging Face, distribuido exclusivamente en formato GGUF y afinado a partir de LiquidAI/LFM3-1.7B de Liquid AI. Se presenta como un agente de código compacto orientado a entornos de borde ("edge"), con soporte declarado de tool calling y un proceso de ajuste fino realizado directamente sobre la rejilla de cuantización Q4_0, de modo que el archivo de 1,36 GB no sería una copia cuantizada de un modelo mayor, sino el resultado entrenado en esa precisión.

La model card describe una receta de entrenamiento propia ("recipe v ii") centrada en evitar el colapso de diversidad que sufren los modelos pequeños ajustados sobre transcripciones de agentes: en lugar de entrenar sobre las palabras de otro modelo, se muestrean turnos generados por el propio modelo base en cada punto de decisión de sesiones reales de un ingeniero, conservando solo aquellos que reproducen la misma herramienta sobre el mismo objetivo. El modelo se presenta como "liberado", es decir, con la dirección de rechazo proyectada fuera de sus escritores residuales, y declara un 0% de rechazos tanto en peticiones dañinas como en peticiones seguras que parecen dañinas (XSTest).

Es relevante ahora por su enfoque poco habitual: entrenamiento dentro del cuantizador, atención dispersa latente (LSA) para contexto largo sobre las seis capas de atención completa del modelo base, y un objetivo explícito de agente de código siempre activo en hardware de consumo. No obstante, el modelo cuenta con 37 descargas y 0 likes en el momento de la consulta, no dispone de benchmarks estándar publicados y su licencia heredada (lfm1.0) impone restricciones que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de convoluciones cortas y atención (heredada de LFM3-1.7B); atención dispersa latente (LSA) en las seis capas de atención completa |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.000 tokens nativos en el modelo base; el autor publica mapas LSA para contexto largo, sin especificar la ventana efectiva final |
| Tipos de cuantizacion | Q4_0 (entrenado en esa rejilla) y BF16; no se documentan otras |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (campo license: other con license_name: lfm1.0) |
| Formato de pesos | GGUF (vibes1.7b-Q4_0.gguf, vibes1.7b-BF16.gguf) y safetensors para los mapas LSA |
| Tamano del repositorio | 11,0 GB |
| Modelo base | LiquidAI/LFM3-1.7B |
| Pipeline | text-generation |
| Libreria | gguf |

## Arquitectura y entrenamiento

El modelo hereda de LFM3-1.7B una arquitectura híbrida que combina convoluciones cortas con capas de atención completa; según la model card, solo seis capas (2, 6, 10, 14, 18 y una más no detallada en el texto disponible) son de atención completa, y sobre ellas se aplica la atención dispersa latente (LSA) mediante mapas publicados en `vibes1.7b-lsa-maps.safetensors` (0,8 MB). El contexto nativo declarado del base es de 262.000 tokens.

El entrenamiento se realizó como un LoRA dentro del cuantizador Q4_0, plegado después en los códigos de cuantización, de forma que los valores Q4_0 son el objeto entrenado y no una conversión posterior. Los datos provienen de sesiones reales de agente de un único ingeniero, reproducidas en palabras del propio modelo base: en cada punto de decisión se generan varias muestras y solo se conservan las que ejecutan la misma herramienta sobre el mismo objetivo y parsean correctamente. A ello se suma un conjunto de respuestas en la voz del ingeniero y una porción de su código propio en Go, C y Rust, sin archivos generados por IA. El autor documenta que entrenar sobre turnos de otros modelos reduce la variedad de aperturas de pensamiento del 51% al 11-14% y provoca bucles de copia literal, motivo por el que se evita esa fuente. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés, con un registro coloquial y conciso ("vibes") que el autor ilustra con respuestas literales de ejemplo.
- Agente de código en harness de desarrollador: ejecución de shell (bash), lectura de archivos, edición y ejecución de tests.
- Tool calling / function calling, capacidad heredada del modelo base y reforzada en el ajuste fino orientado a decisiones de herramienta.
- Razonamiento multi-paso dentro de sesiones de agente, con turnos de pensamiento propios y soporte de contexto largo mediante LSA.
- Capacidad de código en Go, C, Rust, Python y TypeScript; el autor reporta mejoras en repositorios no vistos, incluido TypeScript, que no forma parte de los datos de entrenamiento.
- Modo de "liberación": se elimina la dirección de rechazo, con 0% de rechazos declarados en prompts dañinos y en XSTest.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito separado.

## Casos de uso

- Agente de código siempre activo en portátil o dispositivo de borde: con 1,36 GB en Q4_0 y 175 tokens/s de decodificación en un AMD Strix Halo, puede mantenerse residente en memoria y atender tareas de shell, lectura y edición sin depender de la nube.
- Automatización de tareas de mantenimiento en repositorios pequeños: el modelo ejecuta comandos, inspecciona archivos y aplica ediciones; el autor reporta 144 ediciones frente a 97 del base en 20 tareas de sus propios repositorios.
- Resolución de incidencias guiada por mensaje de commit: usando el mensaje como tarea y los tests ocultos del commit como criterio, el modelo resolvió 4 de 25 tareas completas frente a 1 del base, lo que lo hace útil como primer intento automático en pipelines de CI.
- Asistente de terminal integrado en herramientas de desarrollo: su mezcla de herramientas (77% bash, 12% lectura, 8% edición) encaja en flujos de tipo "run, check, fix" más que en chat de conocimiento general.
- Prototipado de agentes con tool calling en hardware de consumo: sirve para validar harnesses y bucles de agente antes de escalar a modelos mayores de la misma familia (vibes27b, vibes224b).
- Re-cuantización y experimentación: el archivo BF16 de 3,47 GB permite probar otros formatos y runtimes partiendo de los mismos valores entrenados.
- Evaluación de técnicas de entrenamiento en cuantización: útil para investigadores que quieran reproducir o analizar el ajuste LoRA dentro de la rejilla Q4_0 y el efecto de la proyección de la dirección de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas propias de pérdida en datos reservados y de comportamiento de agente, todas sobre el archivo Q4_0:

| Pérdida en datos reservados | Original BF16 | Original Q4_0 | osmos1.7b Q4_0 |
|---|---|---|---|
| Repositorio no visto | 0,857 | 0,917 | 0,846 |
| SQLite (C, no entrenado) | 1,395 | 1,480 | 1,406 |
| Redis (C, no entrenado) | 1,300 | 1,370 | 1,318 |
| requests (Python, no entrenado) | 1,193 | 1,249 | 1,203 |
| zod (TypeScript, no entrenado) | 0,939 | 0,989 | 0,932 |
| Respuestas en la voz del ingeniero | 2,819 | 2,852 | 2,241 |

| Comportamiento de agente (20 tareas) | Original Q4_0 | osmos1.7b Q4_0 |
|---|---|---|
| Llamadas a herramienta distintas | 78% | 78% |
| Pensamientos repetidos literalmente | 14,3% | 11,9% |
| Intentos en bucle (llamada 20+ veces) | 0 de 20 | 1 de 20 |
| Ediciones realizadas | 97 | 144 |
| Mezcla de herramientas | bash 65%, read 25%, edit 6% | bash 77%, read 12%, edit 8% |

| Trabajo real (commits reservados, 25 intentos) | Original Q4_0 | osmos1.7b Q4_0 |
|---|---|---|
| Pasó un test objetivo | 3 | 5 |
| Resuelto completo sin romper nada | 1 | 4 |
| Tests objetivo superados | 10,7% | 20,0% |

| Rendimiento en hardware | Valor |
|---|---|
| Decodificación en AMD Strix Halo (Q4_0) | 175 tokens/s |
| Procesamiento de prompt en AMD Strix Halo | ~5.000 tokens/s |
| Porcentaje del ancho de banda de memoria aprovechado | ~92% |

## Requisitos de hardware

- VRAM estimada: ~1,4 GB para el archivo Q4_0 y ~3,5 GB para el BF16, a los que hay que sumar la caché KV según la longitud de contexto efectiva.
- GPU recomendadas: el autor valida un AMD Strix Halo (memoria unificada); por tamaño, cualquier GPU con 4 GB o más de VRAM puede alojar el Q4_0.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes, así como en portátiles con memoria unificada.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF; el autor referencia su propio proyecto libosmos, y los tags del repositorio indican compatibilidad con endpoints. No se documenta soporte explícito de vLLM ni TGI.
- Latencia y throughput: 175 tokens/s de decodificación y ~5.000 tokens/s de prefill en Strix Halo con Q4_0; no hay cifras publicadas para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| osmos1.7b | 1,73 B | 262K nativos (LSA para largo) | lfm1.0 | GGUF | Ajuste dentro de Q4_0, orientado a agente de código, sin benchmarks estándar |
| LiquidAI/LFM3-1.7B | 1,73 B | 262K | lfm1.0 | safetensors y GGUF | Modelo base; el autor reporta que osmos1.7b lo supera en código reservado y en tareas de agente |
| vibes27b | no disponible | no disponible | no disponible | no disponible | Miembro de la misma familia, orientado a portátil con GPU; sin datos publicados en la información disponible |
| vibes224b | 224 B (MoE) | no disponible | no disponible | no disponible | Miembro insignia de la familia; sin datos publicados en la información disponible |

## Limitaciones y advertencias

- No es una mejora de conocimiento general: el autor indica explícitamente que midió código y trabajo de agente, no chat ni trivia; el rendimiento en preguntas factuales puede ser pobre.
- Entrenado sobre las sesiones de un único ingeniero: el estilo, las decisiones de herramienta y la mezcla bash/read/edit reflejan un flujo de trabajo concreto y pueden no generalizar a otros equipos o convenciones.
- Riesgo de bucles: el autor reporta 1 de 20 intentos bloqueado en un error de compilación (no por copia literal) y un 11,9% de pensamientos repetidos palabra por palabra en intentos completos.
- Riesgo de alucinación no cuantificado: no hay evaluación publicada de factualidad ni de tasa de alucinación.
- Idioma: solo inglés; no se declara soporte de castellano ni de otros idiomas.
- Contexto largo: los 262K tokens corresponden al modelo base; el autor publica mapas LSA pero no especifica la ventana efectiva ni métricas de recuperación en contexto largo.
- La "liberación" elimina la dirección de rechazo: 0% de rechazos declarados tanto en prompts dañinos como en XSTest, lo que implica ausencia de salvaguardas de contenido y traslada toda la responsabilidad de filtrado al despliegue.
- Licencia lfm1.0: es una licencia distinta de las abiertas estándar, con posibles restricciones de uso comercial; debe revisarse el archivo LICENSE antes de producción.
- Madurez: 37 descargas y 0 likes en el momento de la consulta, sin benchmarks de terceros ni validación independiente; los resultados proceden únicamente del autor.
- El repositorio ocupa 11,0 GB pese a que los archivos declarados suman ~4,8 GB, lo que sugiere contenido adicional no documentado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsirg97-rgb/osmos1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio del runtime del autor: https://github.com/mrsirg97-rgb/libosmos
- No se han encontrado en la información disponible papers, blogs ni demos adicionales.
