# est4ever/so101-pi05-llm-direct-006

## Resumen

SO-101 direct LLM weight-edit experiment006 es un checkpoint experimental de robótica derivado de `lerobot/pi05_base`, el modelo base de política visuomotora de LeRobot. Lo publica el usuario `est4ever` como candidato para investigación de laboratorio controlada por operador, no como una mejora demostrada. El modelo parte de la revisión original `22c30e5b` de pi05_base y aplica una edición aritmética directa sobre los pesos de atención, sin fine-tuning convencional, sin LoRA y sin optimizador.

La intervención consiste en multiplicar por 7/8 todas las entradas de las matrices `q_proj.weight` y por 8/7 las de `k_proj.weight` en las capas 0 a 17 del experto de acciones (`paligemma_with_expert.gemma_expert.model.layers.*.self_attn`). Afecta a 36 tensores y 42.467.328 valores. El resto del checkpoint, incluido el prefijo V17, se preserva byte a byte. El autor documenta que no se ha realizado ninguna prueba física y que la hipótesis motora presenta contradicciones importantes sobre las demostraciones registradas.

El interés de esta ficha es metodológico: documenta un intento de edición de pesos interpretable y auditable (con hashes por tensor, manifiesto de edición y reversibilidad byte-exacta) sobre un modelo de robótica de 3.616 millones de parámetros. No es un modelo para producción ni para despliegue por defecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo pi05 (PaliGemma + experto de acciones Gemma), según el modelo base `lerobot/pi05_base` |
| Parámetros totales | 3.616.757.520 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors, 14,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Modelo base | `lerobot/pi05_base` (revisión `22c30e5b34f9e7ab738b1b34fc2fc5ecfe2d28f0`) |
| Intervención | 36 tensores, 42.467.328 valores modificados (q_proj × 7/8, k_proj × 8/7 en capas 0–17 del experto) |
| Inferencia declarada | `inference: false` |
| SHA256 de salida | `b7c6d511bb7b3ee6c4ee46f8af9002982a2165edc40f7498fe9fc11a5b643f7d` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `lerobot/pi05_base`: un transformer multimodal con un componente tipo PaliGemma para condicionamiento visual y lingüístico y un experto de acciones tipo Gemma que produce coordenadas de acción. La edición se aplica exclusivamente sobre las proyecciones de query y key de las capas 0 a 17 del experto de acciones, con coeficientes recíprocos (7/8 en query, 8/7 en key). El cálculo se realiza en float64 desde los valores originales inmutables y se convierte una sola vez a float32.

No hubo entrenamiento en el sentido habitual: no hay regresión, backpropagation, ajuste de optimizador, LoRA, búsqueda aleatoria ni barrido de parámetros. Los coeficientes son un juicio numérico explícitamente etiquetado (compresión de contraste del 12,5 % con escalado recíproco de las claves de sufijo), no un valor ajustado a las discrepancias observadas. El alcance de 18 capas es una hipótesis arquitectónica amplia, no una localización medida de 18 capas defectuosas. Se reutilizaron seis tareas, instrucciones, estados/acciones y 24 anclas de entrenamiento del modelo base. El autor documenta que un diseñador disidente aceptó la coherencia exploratoria pero no la dirección correctiva, y esa discrepancia se conserva.

## Capacidades

- Control visuomotor para el robot SO-101: genera trayectorias de brazo y comandos de pinza a partir de observaciones visuales, instrucciones y estado propioceptivo serializado.
- Condicionamiento multimodal conjunto: la operación afecta simultáneamente a la condición visual, lingüística y propioceptiva, y a las 32 coordenadas internas de acción.
- Respuesta local al estado actual: el autor reporta "strong local response to serialized current state", es decir, el modelo reacciona con fuerza al estado serializado actual.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no disponibles; el modelo está marcado como `inference: false` y experimental.

## Casos de uso

- Investigación de interpretabilidad en robótica: servir como sujeto de estudio para analizar cómo una edición aritmética de las proyecciones Q/K altera el enrutamiento dependiente del contexto y las contribuciones de sufijo en un experto de acciones.
- Auditoría de edición de pesos: el manifiesto `edit_manifest.json` y los hashes por tensor permiten reproducir y revertir byte a byte la intervención, útil para estudiar metodologías de edición verificable.
- Comparación de líneas base en laboratorio: el autor indica que round004 es la línea base reproducible y round005 una comparación negativa separada; este checkpoint puede usarse como tercera rama experimental en un protocolo controlado.
- Estudio de sensibilidad al estado: los ratios de respuesta al estado medidos (12 ratios con signo, todos reducidos pero positivos) permiten investigar la relación entre sensibilidad al estado y estructura futura de la tarea.
- Análisis de acoplamiento entre canales de acción: dado que la operación afecta a las 32 coordenadas internas, sirve para estudiar cómo se acoplan los seis canales de articulación desplegados.
- Docencia y divulgación técnica: ejemplo documentado de edición directa de pesos con trazabilidad completa, útil para explicar por qué una intervención numéricamente coherente no garantiza una mejora funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta observaciones de desarrollo sobre seis tareas, no evaluaciones held-out. Cambios en la primera ventana de cinco pasos de la pinza (candidato menos ORIGINAL, en coordenadas del dataset, no afirmadas como grados físicos ni apertura):

| Tarea | Cambio en cierre (primeros cinco) | Cambio en retención/transporte/elevación | Cambio en separación (primeros cinco) |
|---|---:|---:|---:|
| Blue-in | -0,70714 | -0,29410 | -0,40450 |
| Right | -0,04222 | -0,17495 | -1,39155 |
| Blue-out | -0,41649 | -0,89298 | -1,53642 |
| Pickup | -1,48150 | -0,76141 | Sin ancla de separación |
| Opposite | -0,41853 | -0,09244 | -1,29296 |
| Orange | -1,24279 | -0,73302 | -1,62600 |

Resultados cualitativos reportados: los cinco déficits de apertura en separación temprana empeoraron; los seis excesos de cierre en los primeros cinco pasos disminuyeron; el exceso de retención en pickup disminuyó ligeramente pero siguió siendo grande; los pulsos de apertura de transporte/elevación siguen ausentes. En 432 comprobaciones capa/llamada, los productos escalares en float64 de Q/K reales en float32 coincidieron con las identidades de referencia de proyección ORIGINAL con residuos escalados por magnitud por debajo de 1,7e-7. El autor subraya que la estructura motora no se recuperó y que la reducción de sensibilidad al estado no es evidencia suficiente de adaptación útil.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 3.616.757.520 parámetros, en float32 se requieren aproximadamente 14,5 GB solo para pesos; en bfloat16, unos 7,2 GB; en cuantización de 8 bits, unos 3,6 GB; en 4 bits, unos 1,8 GB (estimaciones derivadas del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de 24 GB (RTX 4090, L4, A10G) en bfloat16 y en GPUs de 16 GB con cuantización; para entrenamiento o evaluación a gran escala se requerirían A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) en bfloat16 y en GPUs de 16 GB con cuantización, aunque el autor no lo confirma.
- Opciones de despliegue: la librería declarada es `lerobot`; el modelo está marcado como `inference: false`, por lo que no se recomienda despliegue directo. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---:|---|---|---|---|
| est4ever/so101-pi05-llm-direct-006 | 3.616.757.520 | no disponible | gemma | Experimental, `inference: false` | Edición directa de pesos Q/K en capas 0–17; sin prueba física |
| lerobot/pi05_base | no disponible en la información | no disponible | no disponible en la información | Base oficial de LeRobot | Punto de partida de la edición; revisión `22c30e5b` |
| Round004 (mencionado por el autor) | no disponible | no disponible | no disponible | Línea base reproducible de laboratorio | Referencia de comparación del autor |
| Round005 (mencionado por el autor) | no disponible | no disponible | no disponible | Comparación negativa separada | Atenuación de prefijo terminal V; empeoró las cinco aperturas tempranas |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría (políticas visuomotoras para SO-101) más allá de las variantes internas citadas por el autor.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el autor declara que no es una mejora demostrada y que no se ha realizado ninguna prueba física.
- `inference: false` en la model card: no está pensado para despliegue por defecto ni para sustituir checkpoints previos.
- Estructura motora no recuperada: los cinco déficits de apertura en separación temprana empeoraron y los pulsos de apertura de transporte/elevación siguen ausentes.
- Hipótesis con contradicciones: el autor reconoce contradicciones importantes de la hipótesis motora sobre las demostraciones registradas y conserva la discrepancia de un diseñador disidente.
- Sin evaluación held-out: las observaciones son de desarrollo/entrenamiento; ningún episodio held-out informó la edición.
- Comprobaciones aritméticas limitadas: las 432 verificaciones son de ruta candidata local, no de logits GEMM internos en float32 retenidos ni de auditoría completa de máscaras (ver `INSPECTION_LIMITS.json`).
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica de forma directa a una política visuomotora, pero no se documenta comportamiento fuera de distribución.
- Idioma: no disponible; el condicionamiento lingüístico proviene del modelo base.
- Licencia `gemma`: impone restricciones de uso comercial según los términos de Gemma; conviene revisarlos antes de cualquier uso productivo.
- Unidades de las métricas: los cambios reportados están en coordenadas del dataset y no se afirman como grados físicos ni apertura de pinza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/est4ever/so101-pi05-llm-direct-006
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Artefactos citados en la model card (referenciados por nombre, sin URL en la información disponible): `edit_manifest.json`, `OBSERVED_RESULTS.json`, `INSPECTION_LIMITS.json`
