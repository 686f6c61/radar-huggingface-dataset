# infosave/d1-2B-cmf

## Resumen

d1-2B-cmf es una cuantización comunitaria del modelo d1-2B de Liquid AI, un modelo de decisión de 2B parámetros (denominado "System One") construido sobre LFM3-VL-2B. A diferencia de un LLM generativo convencional, d1-2B responde preguntas tipadas sobre un estado (texto, JSON o imágenes) en una sola pasada hacia adelante, devolviendo respuestas con probabilidades calibradas y sin generar tokens de salida. Esto lo convierte en una alternativa determinista y de baja latencia frente a la generación de texto libre para tareas de clasificación, extracción y decisión.

La variante "cmf", publicada por el usuario infosave, empaqueta el modelo en ficheros CMF (un formato de archivo único) cuantizados a 8 y 4 bits, listos para ejecutarse con `cortiq`, un motor de inferencia escrito en Rust sin dependencias de Python ni frameworks de ML. Funciona sobre GPUs NVIDIA, AMD e Intel mediante Vulkan/DX12, Apple silicon mediante Metal y CPU, con latencias de decenas de milisegundos por pregunta.

Su relevancia actual radica en la creciente demanda de modelos pequeños y eficientes para clasificación y extracción estructurada en producción, donde la generación de tokens es innecesaria y costosa. Al ser un modelo multimodal (image-text-to-text), puede además localizar objetos en imágenes mediante preguntas de bounding box.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL-2B (modelo de decisión "System One", una sola pasada, sin generación de tokens) |
| Parametros totales | 2B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (q8_2f, pesos; vision encoder a 16-bit), 4-bit (q4tp, pesos; vision encoder a 16-bit) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | CMF (fichero unico, ejecutable con cortiq) |

## Arquitectura y entrenamiento

d1-2B se construye sobre LFM3-VL-2B de Liquid AI, un modelo multimodal de 2B parámetros. Su innovación central es el paradigma "System One": en lugar de autoregresión token a token, el modelo empaqueta el estado (texto, JSON o imágenes) y hasta 16 preguntas tipadas en una sola entrada, y ejecuta una única pasada hacia adelante (todas las capas más la cabeza del vocabulario sobre los "answer slots") en una sola submission a la GPU. Las respuestas se obtienen como valores tipados (booleano, elección, nivel, número, fecha, span o caja delimitadora) con probabilidades calibradas, sin decodificar ni un solo token de salida. La calibración se incluye en el fichero CMF (`calibration.json`) y se aplica a cada respuesta.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se han publicado detalles en la información disponible. En cuanto a la cuantización, el autor verifica que con q8_2f las respuestas coinciden con el checkpoint bf16 original en 19 de 19 preguntas de prueba (diferencia máxima de probabilidad de 0,014), y con q4tp también en 19 de 19 (diferencia máxima de 0,07, con una estimación desviada en 2 pasos). Una conversión f16 coincide con Transformers en float32 con una precisión de aproximadamente 1e-6 en todas las probabilidades.

## Capacidades

- Clasificación binaria (tipo `noul`): respuesta sí/no con probabilidad calibrada P(sí).
- Clasificación multiclase (tipo `choice`): una opción entre criterios definidos por el usuario, con confianza y distribución de probabilidades completa; soporta selección múltiple (`"multiple": true`).
- Puntuación ordinal (tipo `score`): entre 2 y 10 niveles ordenados, con mediana, confianza y leyenda.
- Extracción de valores (tipos `text`, `number`, `date`): lee un valor del estado con su span y un indicador `found`; valores con `found` < 0,5 se devuelven como `null`.
- Estimación numérica con rango (tipo `number` con `range` y `step`): devuelve la mediana y un intervalo de credibilidad (p10, p90).
- Detección visual (tipos `box` y `boxes`): localiza un objeto o todas las instancias en una imagen, devolviendo coordenadas normalizadas (top, bottom, left, right como fracciones), confianza y recuento.
- Entrada multimodal: acepta imágenes por ruta, data URL o URL HTTP(S), repetibles.
- Hasta 16 preguntas simultáneas sobre un mismo estado en una sola pasada; más preguntas requieren pasadas adicionales sobre el mismo estado.
- Multilingüe: 16 idiomas incluyendo castellano.
- Sin generación de tokens: salida determinista y de baja latencia, con `output_tokens: 0`.

## Casos de uso

- Triaje de tickets de soporte: clasifica cada incidencia por equipo (facturación, envíos, técnico) y detecta solicitudes (reembolso, cancelación) en una sola pasada de ~100 ms, sin que el LLM redacte nada.
- Extracción de datos de facturas: con el estado como texto OCR o imagen, extrae total, fecha y número de factura como valores tipados con intervalo de confianza, y marca `null` cuando el campo no aparece.
- Clasificación de documentos JSON: valida y categoriza registros estructurados (por ejemplo, enrutar leads o clasificar transacciones) con probabilidades calibradas por categoría.
- Moderación y control de calidad de contenido: puntuación ordinal (2-10 niveles) de gravedad, toxicidad o calidad con distribución de probabilidad, útil para colas de revisión humana priorizadas.
- Análisis visual de imágenes: recuento de objetos (`boxes` con `count`) y localización de elementos concretos (`box`), aplicable a inventario, inspección visual o verificación de imágenes en formularios.
- Enrutado semántico en agentes: como capa de decisión rápida y barata delante de un LLM generativo, decidiendo qué herramienta o flujo invocar con latencias de decenas de milisegundos.
- Clasificación multilingüe de contenido: dado el soporte de 16 idiomas, puede clasificar tickets o mensajes de clientes en castellano, inglés, chino, árabe, etc., con un mismo despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de latencia con `cortiq serve`, una petición cada vez, tras la primera llamada:

| Hardware | Fichero | 1 pregunta (43 tokens) | 3 preguntas (123 tokens) | 5 preguntas sobre estado de ~200 tokens |
|---|---|---:|---:|---:|
| NVIDIA A40 (Vulkan) | q4tp | 45 ms | 64 ms | 100–115 ms |
| NVIDIA A40 (Vulkan) | q8_2f | 56–75 ms | 70 ms | 102–128 ms |
| Apple M4 (Metal) | q4tp | 85 ms | 160 ms | 255–310 ms |

El vision encoder añade unos 0,5 s por imagen de 640×480 en el M4. No se soportan todavía vídeo ni estados por lotes (`system_one_batch`).

## Requisitos de hardware

- Ambos ficheros caben en cualquier GPU con 2,5 GB de memoria libre (q8_2f ocupa 2,14 GB; q4tp, 1,31 GB).
- GPUs NVIDIA, AMD e Intel mediante Vulkan/DX12; en Linux headless instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.
- Apple silicon mediante Metal (backend por defecto); funciona bien desde el MacBook Air con chip M.
- CPU puro con `CMF_GPU=0`.
- No requiere GPU dedicada de gama alta: al ser 2B parámetros cuantizados, cualquier GPU moderna de consumo (por ejemplo, con 4 GB de VRAM) es suficiente.
- Despliegue mediante `cortiq-cli` (instalable con `cargo install cortiq-cli`) o binarios precompilados para Linux, macOS y Windows; incluye modo servidor HTTP con `cortiq serve` y endpoint `/v1/system_one`.
- Latencias de referencia: 45–128 ms por petición en A40 y 85–310 ms en Apple M4 según número de preguntas y cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Paradigma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-2B-cmf (esta ficha) | 2B | Decision model (System One, sin generación) | no disponible | lfm1.0 | CMF, motor cortiq (Rust, Vulkan/Metal/CPU) |
| LiquidAI/d1-2B (base, bf16) | 2B | Decision model (System One) | no disponible | lfm1.0 | Hugging Face, Transformers |
| LFM3-VL-2B (base multimodal) | 2B | LLM multimodal generativo | no disponible | no disponible | Hugging Face, Liquid AI |

La diferencia clave frente a un LLM generativo de tamaño similar usado para clasificación (que debe generar tokens y parsear la salida) es que d1-2B devuelve respuestas tipadas con probabilidades calibradas en una sola pasada, reduciendo latencia y eliminando la variabilidad de la generación libre.

## Limitaciones y advertencias

- No es un modelo generativo: no redacta texto libre, no razona en varios pasos ni soporta tool calling o agentes por sí mismo; solo responde preguntas tipadas sobre un estado.
- La cuantización q4tp introduce desviaciones de hasta 0,07 en las probabilidades y una estimación numérica desviada en 2 pasos respecto al checkpoint bf16; para máxima fidelidad usar q8_2f o el modelo original.
- No soporta todavía vídeo ni procesamiento por lotes de estados (`system_one_batch`).
- La licencia lfm1.0 es de tipo "other": conviene revisar sus términos antes de uso comercial, ya que puede tener restricciones.
- El número de descargas del repositorio es mínimo (1), por lo que la cuantización comunitaria tiene poca validación externa; el modelo base de Liquid AI está mejor contrastado.
- La longitud de contexto máxima no está documentada en la información disponible.
- Al tratarse de un formato y motor propios (CMF/cortiq), no es compatible con el ecosistema estándar (llama.cpp, vLLM, Ollama, TGI); requiere el toolchain de cortiq.
- Riesgo de alucinación no documentado específicamente; el mecanismo `found` < 0,5 que devuelve `null` mitiga extracciones incorrectas, pero las probabilidades calibradas deben validarse en el dominio de cada aplicación.

## Enlaces

- Modelo cuantizado: https://huggingface.co/infosave/d1-2B-cmf
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
