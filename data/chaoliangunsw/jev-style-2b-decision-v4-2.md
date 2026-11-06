# chaoliangUNSW/Jev-Style-2B-Decision-v4.2

## Resumen

Jev-Style-2B-Decision-v4.2 es un modelo de decisión y clasificación desarrollado por Chaoliang Yan (chaoliangUNSW), presentado como una continuación diagnóstica del modelo Jev-Style-2B-Decision-v4. No es un modelo generativo de propósito general: dado un estado (texto y, opcionalmente, imagen) y una pregunta tipada, devuelve una distribución de probabilidad sobre las opciones suministradas (hasta 255), sin generar respuestas en lenguaje libre ni ejecutar acciones. Con 2.213.241.664 parámetros, incluye una torre de visión congelada y se distribuye como un único conjunto de pesos, sin ensemble en tiempo de ejecución.

El modelo se construye sobre la arquitectura Qwen 3.5 y emplea una combinación de capas de atención completa con máscara causal por bloques y capas recurrentes Gated DeltaNet. La innovación principal es el mecanismo de lectura de veredicto: el estado oculto en cada slot de veredicto se combina mediante producto escalar con la diferencia entre las filas de embedding de "sí" y "no", seguido de softmax. Esto lo aleja de los runtimes de chat causal genéricos, que no reproducen sus probabilidades de decisión.

Su relevancia radica en el enfoque de calibración explícita y en la transparencia del proceso de release: el autor publica un guard de calibración relativa que no pasó (ECE del candidato 0,0301 frente a 0,0195 del padre, con un incremento permitido de 0,01), y aun así libera los pesos como candidato diagnóstico, sin modificar los pesos tras observar la puntuación pública. La puntuación pública declarada es 46,74 en el suite Decision Index public 0.3 (140.178 peticiones), frente a 44,37 del modelo padre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen 3.5: capas de atención completa con máscara block-causal y capas recurrentes Gated DeltaNet; torre de visión congelada |
| Parametros totales | 2.213.241.664 (incluye torre de visión congelada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens de presupuesto de entrada completo; máximo 255 opciones; las entradas que exceden se rechazan, no se truncan |
| Tipos de cuantizacion | BF16 (referencia), FP32, GGUF F16/Q8_0/Q4_K_M y MLX BF16/8-bit (en validación separada, solo texto) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina capas de atención completa con máscara causal por bloques con capas recurrentes Gated DeltaNet que conservan su comportamiento original. El modelo incorpora una torre de visión congelada que procesa imágenes a resolución nativa con un límite de 1.638.400 píxeles. La lectura de decisión se realiza tomando el estado oculto en cada slot de veredicto, aplicando un producto escalar con la diferencia entre las filas de embedding de "sí" y "no" (embedding atado), y aplicando softmax. Se aplica una temperatura global de 0,8813575635811984, idéntica para los tres tipos de pregunta (`choice`, `noul`, `score`).

El checkpoint corresponde al paso 481 de la continuación v4.2. La línea v4 incluyó etiquetas suaves destiladas desde TypeSafe Jev 1.14 a través de su API pública, material generado por el profesor y splits de entrenamiento upstream. La continuación utilizó entrenamiento interno de formato/reglas y datos de calibración retenidos; la temperatura global se ajustó sobre 2.166 filas de calibración internas, no sobre ítems de test del benchmark. El modelo no se ha modificado después de observar la puntuación pública.

## Capacidades

- Clasificación y decisión sobre opciones tipadas: devuelve una probabilidad para cada opción suministrada (hasta 255), sin generación libre.
- Tres tipos de pregunta soportados: `choice`, `noul` y `score`.
- Procesamiento multimodal: entrada de imagen a resolución nativa (hasta 1.638.400 píxeles) mediante torre de visión congelada.
- Calibración explícita: temperatura global ajustada y ECE medido sobre datos internos.
- Contexto largo: presupuesto de 32.768 tokens con rechazo explícito de entradas que lo exceden.
- Inferencia determinista y reproducible: diferencias por lotes frente a pregunta individual inferiores a 1e-6; los 1.097 fixtures de formato se renderizan de forma idéntica.
- Soporte de CPU, Apple Silicon (MPS, FP32) y CUDA (BF16, con fast path y CUDA graphs).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de agentes generativos: su salida es una distribución de probabilidad, no una acción.

## Casos de uso

- Moderación y clasificación de contenido con opciones predefinidas: el modelo asigna probabilidad a cada categoría suministrada, lo que permite umbrales calibrados y auditoría de decisiones sin generación libre.
- Enrutamiento de decisiones en pipelines: dado un estado textual y un conjunto de opciones, selecciona la más probable; útil para triaje, priorización o selección de ramas en sistemas automatizados.
- Evaluación de pares estado-pregunta con imagen: la torre de visión permite clasificar estados visuales (por ejemplo, verificar si una entrega llegó en buen estado) con preguntas tipadas.
- Validación de calidad en anotación: uso como clasificador de referencia calibrado para comparar contra anotadores humanos, aprovechando el ECE medido.
- Investigación en calibración de modelos: el release incluye protocolo diagnóstico, temperaturas y métricas ECE, lo que lo hace útil como caso de estudio reproducible de guard de calibración fallido.
- Sistemas de decisión con contexto largo: con 32.768 tokens de entrada, puede evaluar documentos extensos frente a preguntas de veredicto sin truncar.
- Despliegue en hardware de consumo: con builds GGUF Q4_K_M o MLX 8-bit (en validación, solo texto), puede ejecutarse en equipos con GPU de consumo o Apple Silicon.

## Benchmarks y rendimiento

| Benchmark | Jev-Style-2B-Decision-v4.2 | Jev-Style-2B-Decision-v4 (padre) |
|---|---|---|
| Decision Index public 0.3 (suite completa) | 46,74 | 44,37 |
| ECE (calibración) | 0,0300812254 | 0,0195163271 |
| Incremento de ECE permitido por el guard | 0,01 | — |
| Resultado del guard de calibración | No superado | — |

La puntuación de 46,74 corresponde a 140.178 peticiones puntuadas, todas exitosas, sin peticiones no soportadas ni errores, y fue re-puntuada de forma independiente en CPU reproduciendo el mismo valor. Es una puntuación pública auto-ejecutada, no una puntuación oficial Full/private ni un nuevo vision-board score. La ejecución original usó BF16, fast text y CUDA graphs en una RTX 4090, con tres procesos disjuntos de group-hash sobre pesos congelados idénticos; los tiempos de peticiones concurrentes no son medidas de latencia serial. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: en BF16, aproximadamente 4,4 GB solo para pesos (el repo ocupa 4,4 GB); en FP32, alrededor del doble. Los builds GGUF Q8_0 y Q4_K_M reducen el requisito, pero son derivados solo texto y están en validación separada.
- GPU recomendadas: RTX 4090 (configuración usada en la ejecución pública original con BF16, fast text y CUDA graphs); cualquier GPU CUDA con suficiente VRAM para BF16.
- GPU de consumo: sí cabe en GPUs de consumo modernas; el modelo se validó en RTX 4090 y el runtime soporta Apple Silicon vía MPS en FP32 y CPU.
- Opciones de despliegue: runtime propio `jev_style_decision` (paquete Python 3.12 con requirements fijados); `flash-linear-attention==0.6.0` para el fast path CUDA original; fallbacks de PyTorch estándar (correctos pero más lentos); builds GGUF y MLX en validación. Los runtimes de chat causal genéricos (vLLM, llama.cpp, Ollama, TGI) no reproducen las probabilidades de decisión sin el renderer, la máscara de bloques y la lectura de veredicto.
- Latencia y throughput: no disponibles como medidas seriales; la ejecución pública usó peticiones concurrentes en tres procesos y el autor indica que los mantenedores oficiales realizan sus propias mediciones de latencia serial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Style-2B-Decision-v4.2 | 2,21 B | 32.768 tokens | Clasificación/decisión tipada, multimodal | Apache-2.0 | HuggingFace, runtime propio |
| Jev-Style-2B-Decision-v4 (padre) | No disponible | No disponible | Clasificación/decisión | Apache-2.0 | HuggingFace |
| TypeSafe Jev 1.14 (profesor) | No disponible | No disponible | Profesor de destilación vía API pública | No disponible | API pública |

No se dispone de datos de benchmarks comparables con otros clasificadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El guard de calibración relativa pre-registrado no se superó: el ECE del candidato (0,0301) supera al del padre (0,0195) en más del margen permitido de 0,01. El release es diagnóstico y no reclama una decisión de release exitosa.
- La puntuación de 46,74 es una puntuación pública auto-ejecutada, no una puntuación oficial Full/private; no debe tratarse como resultado de benchmark independiente.
- No es un modelo generativo: no produce respuestas en lenguaje libre ni realiza acciones; no soporta tool calling ni agentes.
- Las entradas que exceden el presupuesto de 32.768 tokens se rechazan, no se truncan; los sistemas que lo integren deben gestionar ese rechazo.
- Los builds GGUF y MLX son derivados solo texto y no tienen una puntuación de suite completa medida por separado; 46,74 no se aplica a cada derivado.
- Los runtimes de chat causal genéricos no reproducen las probabilidades de decisión; se requiere el renderer, la máscara de bloques y la lectura de veredicto del runtime propio.
- La licencia Apache-2.0 cubre estos pesos, pero no relicencia datasets de terceros ni salidas del profesor; deben revisarse `LICENSE` y `NOTICE`, así como la model card del padre.
- El modelo hereda consideraciones sobre datos de entrenamiento y términos de proveedores del modelo padre.
- No se dispone de información sobre sesgos, cobertura de idiomas ni tasas de alucinación en la información proporcionada.
- Los tests originales no se distribuyen en el repositorio; las comprobaciones de humo locales no sustituyen una re-ejecución completa de benchmark independiente.
- El código y el empaquetado se prepararon con asistencia de codificación por IA bajo la dirección del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4.2
- Modelo padre: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Artefactos de validación en el repo: `validation/public_run_environment.json`, `validation/diagnostic_protocol.json`, `release_config.json`
- Runtime de inferencia incluido: `src/macjev/`, paquete `jev_style_decision`, `requirements.txt`
