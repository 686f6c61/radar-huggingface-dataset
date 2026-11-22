# sergolsub/elephant-v1-9B-MLX-8bit

## Resumen

Elephant v1 9B MLX 8-bit (identificador `sergolsub/elephant-v1-9B-MLX-8bit`) es una conversión cuantizada a 8 bits en formato MLX del modelo `baselabs/elephant-1`, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo ni de un reentrenamiento: el autor indica explícitamente que la conversión solo aplica cuantización de 8 bits, sin cambios de arquitectura ni ajuste adicional, y que la licencia MIT se hereda de los pesos originales.

El modelo cuenta con 9.409.813.744 parámetros totales y un repositorio de 11,4 GB distribuido en tres shards de safetensors. La etiqueta `qwen3_5` en Hugging Face sugiere una arquitectura derivada de la familia Qwen 3.5, e incluye atención lineal (`linear_attn`) en al menos la primera capa del modelo de lenguaje, según el informe de auditoría KL incluido en el repositorio.

La relevancia de esta ficha radica en que el modelo incorpora una interfaz de decisión estructurada (cabecera de decisión con tipos `noul`, `choice` y `score`) orientada a tareas de clasificación y enrutamiento, además de soporte de imagen. El autor publica métricas de calidad tras la cuantización (accuracy 92,2 % en 8-bit frente a 92,2 % en bf16) y un índice propio, el Decision Index 0.4.1, con valor 62,11.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (tag `qwen3_5`; derivada de Qwen 3.5), con cabecera de decisión y soporte multimodal de imagen |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8-bit (MLX); los pesos originales están en bf16 |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada de `baselabs/elephant-1`) |
| Formato de pesos | Safetensors en layout MLX (3 shards: 4,30 GB + 4,32 GB + 2,75 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo original `baselabs/elephant-1`: no se especifican el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineación. La etiqueta `qwen3_5` apunta a una arquitectura de la familia Qwen 3.5, y el informe de auditoría KL identifica capas de atención lineal (`model.language_model.layers.0.linear_attn.in_proj_a.weight`), lo que confirma un esquema híbrido con atención lineal en al menos parte de las capas.

La innovación principal de esta variante es la interfaz de decisión: el repositorio incluye `onejev_mlx.py`, `decision_config.json` y `joint_config.json`, que implementan una cabecera de decisión con tres tipos de tarea (`noul` para preguntas binarias, `choice` para selección entre criterios y `score` para puntuación ordinal). El modelo también procesa imágenes, según las mediciones del autor con entradas de 512x512 píxeles. La cuantización a 8 bits se auditó tensor a tensor: 760 tensores comparados, KL medio de 2,16e-04, KL máximo de 5,57e-03 y 249 tensores con KL distinto de cero, con la peor capa en `linear_attn.in_proj_a.weight` de la capa 0.

## Capacidades

- Generación de texto y razonamiento general, con soporte de plantilla de chat (`chat_template.jinja`).
- Decisión estructurada mediante cabecera dedicada: preguntas binarias (`noul`), elección entre opciones (`choice`) y puntuación ordinal (`score`).
- Procesamiento de imágenes combinadas con texto (entrada de 512x512 píxeles medida por el autor); la detección de cajas delimitadoras (box) no está soportada.
- Inferencia en Apple Silicon mediante `mlx_lm` y el cargador propio `onejev_mlx.OneJev`.
- Servidor compatible con endpoint `/v1/systemone` (incluido como `serve.patch` en el repositorio).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling, function calling y razonamiento multi-paso en agentes: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede clasificar una incidencia en un equipo concreto (`choice`) a partir de criterios como facturación o envío, con una latencia mediana de decisión de 657 ms y 2,56 decisiones cortas por segundo en un Mac mini M4 Pro.
- Detección de intención de reembolso: con el tipo `noul`, permite responder preguntas binarias del tipo "¿el cliente quiere un reembolso?" sobre el texto de la incidencia, adecuado para triaje automático en atención al cliente.
- Priorización de incidencias: el tipo `score` con criterios ordinales (cosmético, molesto, bloqueante) permite asignar severidad a errores de sistema, como fallos de exportación por cuota de disco.
- Moderación o filtrado de contenido: la interfaz de decisión binaria se puede reutilizar para clasificadores de sí/no sobre texto, con la ventaja de que la salida está restringida a las opciones definidas.
- Análisis de capturas o documentos escaneados: al aceptar imagen de 512x512 junto con texto, puede clasificar el contenido de una captura (por ejemplo, un error en pantalla) y combinarlo con una decisión estructurada, con latencias de unos 2,4 s por consulta.
- Prototipado local en Mac: con 12,21 GB de memoria residente máxima y carga en 5,08 s, es viable ejecutar el modelo en un Mac mini M4 Pro de 48 GB para pruebas de pipelines de decisión sin depender de GPU dedicadas.
- Servicio interno de clasificación: el parche `serve.patch` y el cargador `onejev_mlx.py` permiten desplegar un endpoint compatible con `/v1/systemone` para integrar las decisiones en un backend existente.

## Benchmarks y rendimiento

El autor publica métricas propias de calidad y de rendimiento, no benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks estándar en la información disponible.

| Métrica | 8-bit (MLX) | bf16 (referencia) |
|---|---|---|
| Accuracy | 92,2 % | 92,2 % |
| Noul | 95,0 % | 95,0 % |
| Choice | 92,0 % | 92,0 % |
| Score | 88,0 % | 88,0 % |
| Perplejidad de calibración | 1,769 | 1,771 |
| Decision Index 0.4.1 | 62,11 | No disponible |

| Medición en Mac mini M4 Pro 48 GB | Valor |
|---|---|
| Carga del modelo | 5,08 s (5,32 s en la medición de disco) |
| Memoria residente máxima | 12,21 GB |
| Texto de 512 tokens (492 tok), media de 5 tras 3 de calentamiento | 1.425 ms (binario), 1.430 ms (multichoice), 1.435 ms (score) |
| Imagen 512x512 + texto | 2.407 ms (binario), 2.404 ms (multichoice), 2.400 ms (score) |
| Latencia mediana de decisión | 657 ms |
| Decisiones cortas sostenidas | 2,56 por segundo |
| Cajas delimitadoras (box) | No soportado |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 12,21 GB de memoria residente máxima medida en MLX 8-bit; el repositorio ocupa 11,4 GB en disco.
- Hardware de referencia del autor: Mac mini M4 Pro con 48 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el formato MLX está orientado a Apple Silicon, por lo que no se contempla su ejecución directa en CUDA sin reconversión.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: un Mac con 16 GB o más de memoria unificada debería poder alojar los 12,21 GB medidos, aunque no se han publicado pruebas en configuraciones inferiores a 48 GB.
- Opciones de despliegue: `mlx_lm` con el cargador `onejev_mlx.OneJev`; servidor mediante `serve.patch` (endpoint `/v1/systemone`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de decisión de 657 ms y 2,56 decisiones cortas por segundo en el hardware de referencia; 1,43 s por consulta de texto de 512 tokens y 2,40 s con imagen 512x512.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones completas de los modelos comparables en la información proporcionada. La comparación se limita a los datos disponibles del propio modelo y de su base.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| elephant-v1-9B-MLX-8bit (este) | 9,41 B | No disponible | 8-bit MLX | MIT | Safetensors MLX |
| baselabs/elephant-1 (base) | 9,41 B (según pesos derivados) | No disponible | bf16 | MIT | Safetensors |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo original ni de la conversión; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación: no evaluado en la información disponible; las métricas publicadas miden precisión en tareas de decisión restringidas, no generación abierta.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingüe sin evaluación adicional.
- Longitud de contexto: no disponible; limita el diseño de aplicaciones con documentos largos o conversaciones multi-turno extensas.
- La licencia MIT se hereda de los pesos originales; el autor advierte de que, en caso de conflicto, prevalece la licencia del repositorio upstream `baselabs/elephant-1`.
- El formato MLX está orientado a Apple Silicon; no hay soporte documentado para CUDA, vLLM, llama.cpp, Ollama ni TGI, lo que restringe su uso en infraestructura de GPU convencional.
- La detección de cajas delimitadoras no está soportada.
- La cuantización introduce una degradación mínima pero no nula: 249 de 760 tensores presentan KL distinto de cero, con un máximo de 5,57e-03 en la capa de atención lineal 0.
- El modelo incluye código de carga propio (`onejev_mlx.py`, `serve.patch`, `setup.sh`) que debe auditarse antes de ejecutarlo en producción; el autor proporciona checksums SHA-256 de todos los archivos para verificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/elephant-v1-9B-MLX-8bit
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Auditoría KL por tensor: `kl_audit.json` dentro del repositorio
- Checksums SHA-256: sección "Checksums" de la model card del repositorio
- Paper, blog, repositorio de código o demo adicionales: no disponibles en la información proporcionada.
