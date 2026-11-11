# mlboydaisuke/Qwen3-0.6B-int8-sym-ov

## Resumen

Qwen3-0.6B-int8-sym-ov es una exportación del modelo Qwen/Qwen3-0.6B (revisión `c1899de`) a formato OpenVINO IR, con cuantización int8 simétrica por canal en los pesos, orientada específicamente a ejecución en la NPU integrada de los procesadores Intel. El trabajo lo publica el usuario mlboydaisuke bajo licencia Apache 2.0 y no introduce ningún entrenamiento adicional: es una conversión del modelo base de Alibaba Qwen, que conserva la arquitectura, el tokenizador y el comportamiento del original.

El modelo base Qwen3-0.6B es un transformer decoder-only de 0,6 mil millones de parámetros perteneciente a la familia Qwen3, diseñada con modos de razonamiento explícito (thinking) y no razonamiento (non-thinking), controlables mediante directivas en el prompt como `/no_think`. Esta exportación concreta está pensada para escenarios de inferencia local en portátiles y equipos de sobremesa con CPU Intel Core Ultra, donde la NPU permite liberar la CPU y la GPU integrada y reducir el consumo energético.

La relevancia de esta ficha radica en que documenta una ruta de despliegue poco habitual: modelos de lenguaje pequeños ejecutados en aceleradores NPU mediante OpenVINO GenAI, con métricas medidas sobre hardware real y una verificación de equivalencia funcional frente al modelo original en precisión fp32. Es un artefacto de interés para quienes despliegan LLM en el borde (edge) con hardware Intel y necesitan cuantificar el compromiso entre velocidad y fidelidad respecto al modelo de referencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportado a OpenVINO IR |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | int8 simétrica por canal en pesos (`--weight-format int8 --sym`) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`), exportado con optimum-intel |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-0.6B: un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos. Esta exportación no modifica la topología ni reentrena pesos; aplica cuantización post-entrenamiento (PTQ) mediante NNCF 3.4.0 con esquema int8 simétrico por canal sobre los pesos, dejando las activaciones en el formato que OpenVINO determina para la NPU. El pipeline de conversión se ejecutó con `optimum-cli export openvino --task text-generation-with-past --weight-format int8 --sym` usando optimum-intel 2.2.0 y OpenVINO 2026.4.1, partiendo de los ficheros del modelo base verificados contra los hashes sha256 del Hub.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF, DPO) del modelo base en la documentación proporcionada; esos detalles corresponden a la model card oficial de Qwen/Qwen3-0.6B. La innovación técnica destacable de esta publicación es la verificación de equivalencia funcional: se comparó la primera línea de respuesta de la exportación int8 contra el modelo original en fp32 ejecutado con transformers en CPU sobre 20 preguntas cortas con el modo thinking desactivado, obteniendo coincidencia en 18 de 20 casos, que es exactamente el umbral de aceptación definido en el proyecto windows-model-zoo.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3-0.6B.
- Modo de razonamiento explícito (thinking) activable o desactivable mediante directivas en el prompt, como `/no_think`.
- Generación de código y resolución de problemas matemáticos básicos, dentro de las capacidades esperadas de un modelo de 0,6 mil millones de parámetros.
- Soporte multilingüe: no confirmado en la información disponible para esta exportación concreta; depende de las capacidades del modelo base.
- Tool calling y function calling: no documentado en la información proporcionada para esta exportación.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Ejecución en NPU Intel mediante OpenVINO GenAI, con API `LLMPipeline` y selección de dispositivo `"NPU"`.

## Casos de uso

- Asistentes locales en portátiles Intel Core Ultra: el modelo se ejecuta en la NPU integrada mediante `ov_genai.LLMPipeline(..., "NPU")`, liberando CPU y GPU para otras tareas y reduciendo el consumo energético en aplicaciones de escritorio con requisitos de privacidad.
- Clasificación y respuesta a preguntas cortas en el borde: con 156 ms hasta el primer token y 63,3 tokens/s medidos, es adecuado para responder consultas breves en aplicaciones interactivas donde la latencia percibida importa más que la profundidad de razonamiento.
- Prototipado de pipelines de IA generativa en Windows: sirve como banco de pruebas para validar integraciones con OpenVINO GenAI 2026.4.1 antes de escalar a modelos mayores de la misma familia con el mismo formato de exportación.
- Generación de texto asistida en herramientas ofimáticas: resúmenes, reescritura y completado de frases en aplicaciones de escritorio, aprovechando que el modelo cabe holgadamente en un repo de 0,6 GB y no requiere GPU dedicada.
- Enseñanza y experimentación con cuantización: la publicación incluye registros de velocidad en `records/` y una metodología de verificación de equivalencia reproducible, lo que la convierte en material útil para cursos sobre optimización de modelos y despliegue en aceleradores.
- Filtrado y preprocesado de texto en local: tareas de normalización, extracción de entidades simples o generación de etiquetas en flujos que deben ejecutarse sin conexión a servicios en la nube.
- Evaluación comparativa de backends: al estar exportado con `optimum-cli` y verificado contra el modelo fp32, permite medir el impacto de la cuantización int8 en la calidad de salida frente a otras rutas de despliegue (llama.cpp, transformers en CPU).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de velocidad y una prueba de equivalencia funcional medidas sobre hardware concreto:

| Metrica | Valor | Condiciones |
|---|---|---|
| Acuerdo de respuesta con el modelo fp32 | 18 de 20 preguntas | Primera línea de respuesta, thinking off, umbral de aceptación 18/20 |
| Tiempo hasta el primer token | 156 ms | Intel Core Ultra 9 386H, NPU, Windows 11, OpenVINO GenAI 2026.4.1 |
| Throughput de generación | 63,3 tokens/s | Mediana de 3 ejecuciones, 21 prompts de 23-40 tokens, respuestas de 2-27 tokens |
| Tamano del repositorio | 0,6 GB | Pesos OpenVINO IR int8 |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual, ya que el destino es la NPU integrada; el repo ocupa 0,6 GB y la huella en memoria es coherente con un modelo de 0,6 mil millones de parámetros en int8.
- GPU recomendadas: no disponibles; la exportación está optimizada para NPU Intel, no para GPU dedicada.
- Cabe en GPU de consumo: no confirmado para esta exportación; el formato OpenVINO IR puede ejecutarse en GPU Intel integrada mediante OpenVINO, pero no se han publicado mediciones.
- Hardware validado: Intel Core Ultra 9 386H con controlador NPU Intel 32.0.100.4841, Windows 11.
- Opciones de despliegue: OpenVINO GenAI 2026.4.1 o superior con `LLMPipeline` y dispositivo `"NPU"`; descarga mediante `hf download`.
- Latencia y throughput: 156 ms hasta el primer token y 63,3 tokens/s en el hardware validado; el autor indica que la velocidad sigue en optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-int8-sym-ov (esta ficha) | 0,6 B | no disponible | OpenVINO IR int8, NPU Intel | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (modelo base) | 0,6 B | no disponible | safetensors fp32/bf16, transformers | Apache 2.0 | Hugging Face |
| Otras exportaciones OpenVINO de Qwen3-0.6B | 0,6 B | no disponible | OpenVINO IR (distintas cuantizaciones) | Apache 2.0 | Hugging Face (no verificadas en esta ficha) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada; la única comparación cuantitativa publicada es la prueba de acuerdo de respuesta (18/20) frente al modelo base en fp32 sobre CPU.

## Limitaciones y advertencias

- La prueba de equivalencia mide acuerdo con el modelo original, no corrección de las respuestas; un 18/20 no garantiza calidad factual.
- Modelo de 0,6 mil millones de parámetros: capacidad de razonamiento, conocimiento factual y generación de código limitadas en comparación con modelos de mayor tamaño.
- Sesgos conocidos: no documentados en la información proporcionada; deben asumirse los del modelo base Qwen3-0.6B.
- Riesgo de alucinación: inherente a modelos de este tamaño y no cuantificado en la model card.
- La cuantización int8 puede introducir degradaciones no capturadas por la prueba de 20 preguntas cortas, especialmente en generaciones largas o tareas de razonamiento.
- Idiomas soportados no confirmados para esta exportación; verificar contra la model card del modelo base antes de usar en producción multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base Qwen3-0.6B por si añaden condiciones adicionales.
- La exportación está validada únicamente en una NPU Intel concreta (Core Ultra 9 386H) y una versión específica de OpenVINO GenAI; el comportamiento en otros equipos o versiones no está documentado.
- El autor indica que la velocidad sigue en optimización, por lo que las cifras de rendimiento pueden cambiar en futuras revisiones del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-0.6B-int8-sym-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Registros de velocidad: https://huggingface.co/mlboydaisuke/Qwen3-0.6B-int8-sym-ov/tree/main/records
- Proyecto windows-model-zoo (metodología de la prueba QA20): https://github.com/john-rocky/windows-model-zoo/blob/8baf723b99c801c3cf98041d80a332654bbf1b7e/PLAN.md#how-to-read-the-qa20-line
