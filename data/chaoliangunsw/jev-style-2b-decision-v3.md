# chaoliangUNSW/Jev-Style-2B-Decision-v3

## Resumen

Jev-Style-2B-Decision-v3 es un modelo de decisión y clasificación de texto derivado por fine-tuning de Qwen/Qwen3.5-2B, desarrollado por Chaoliang Yan (usuario chaoliangUNSW). No es un modelo conversacional generalista: su función es recibir un estado textual y un conjunto de preguntas tipadas, y devolver en una sola pasada una probabilidad calibrada para cada opción de respuesta. Está pensado para tareas de enrutamiento (routing), clasificación, guardarraíles y puntuación de elección fija en entornos de producción.

El modelo tiene 1.881.825.088 parámetros (aproximadamente 1,88B) y se distribuye en formato safetensors con licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Su tamaño lo sitúa en el rango de despliegue en hardware de consumo y en entornos on-device, y su diseño prioriza la latencia baja y la calibración de probabilidades frente a la generación libre de texto.

Es relevante ahora porque cubre un nicho creciente: sustituir llamadas a modelos grandes en pasos de decisión discretos (clasificar un ticket, decidir si escalar, elegir una ruta) por un modelo pequeño, local y calibrado. La versión v3 es texto-only y, según la model card, no utilizó salidas de Jev en su entrenamiento; la versión recomendada actualmente por el autor es la 2B v4, que añade imágenes y se sirve además por API alojada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-2B); librería `jev-style` |
| Parametros totales | 1.881.825.088 (≈1,88B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para esta versión (la API alojada de v4 usa 8.192 tokens; no se confirma para v3) |
| Tipos de cuantizacion | No disponible para este repo (existe build GGUF de la serie; el 0.8B v3 tiene GGUF de 0,53 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 3,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only, y se ajusta mediante fine-tuning supervisado para una tarea concreta: dado un estado textual y preguntas tipadas (`noul` para sí/no, `choice` para elección entre opciones), producir una distribución de probabilidad calibrada sobre las opciones en una única pasada de inferencia. La model card lo etiqueta como "system-one", en contraposición a los flujos de razonamiento multi-paso, y enfatiza la calibración de las probabilidades devueltas.

Según la documentación del autor, esta versión v3 (publicada el 2026-09-27) no utilizó salidas de Jev en su entrenamiento y sus fuentes de datos están documentadas en la model card principal. La v4 posterior sí incorpora etiquetas suaves destiladas de TypeSafe Jev 1.14 a través de su API pública. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de texto con salida de probabilidad calibrada por opción, en una sola pasada.
- Preguntas de tipo sí/no (`noul`) y de elección entre un conjunto fijo de opciones (`choice`).
- Enrutamiento de peticiones (LLM routing) hacia distintos modelos o flujos según el estado de entrada.
- Guardarraíles y filtros de decisión (por ejemplo, decidir si una petición debe bloquearse o escalarse).
- Procesamiento de contexto largo (etiqueta `long-context` en el repo; longitud exacta no disponible).
- Ejecución local y on-device mediante el paquete `jev-style` (builds PyTorch, MLX y GGUF).
- Servidor local compatible con la forma de petición `POST /v1/systemone` de la API alojada.
- No es un modelo generativo conversacional: no se documenta soporte de tool calling, agentes multi-paso, visión ni audio en esta versión (la visión llega en v4).

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada mensaje entrante en categorías (facturación, técnico, cuenta) con una pregunta `choice` y derivarlo al equipo o modelo adecuado; el tamaño de 1,88B permite ejecutarlo en local con baja latencia por petición.
- Guardarraíles en producción: decidir con una pregunta `noul` si una entrada debe bloquearse o revisarse antes de llegar a un LLM mayor, usando la probabilidad calibrada para fijar umbrales.
- Triaje de atención al cliente: determinar el tono del cliente (calmado, frustrado, enfadado) y activar protocolos de escalado, como muestra el ejemplo de la propia model card.
- Selección de modelo en pipelines multi-LLM: puntuar qué modelo o herramienta es más probable que resuelva una consulta, reduciendo coste frente a invocar siempre el modelo grande.
- Verificación de documentos y recibos: decisiones de sí/no sobre si una captura o texto cumple un criterio (la variante con imágenes es la v4; en v3 solo texto).
- Clasificación por lotes en backend: procesar grandes volúmenes de textos cortos con un modelo pequeño y local, sin depender de una API externa ni de cuotas.
- Evaluación reproducible de routing: comparar políticas de enrutamiento con puntuaciones calibradas, según el benchmark de routing bancario publicado por el autor.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| JevBench v1.4.1 (ítems públicos) | 73,6 % | El más alto entre los sistemas de la familia Qwen3.5-2B en el tablero citado; Jev alcanza 86,6 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1,88B parámetros en safetensors el repo ocupa 3,8 GB, por lo que en fp16 se requiere del orden de 4 GB de memoria para los pesos, más overhead de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo con suficiente VRAM y en aceleradores de datacenter (A100, H100) sin problema.
- Consumer GPU: previsiblemente viable en tarjetas con 6-8 GB o más de VRAM en fp16; no confirmado en la documentación.
- Despliegue: paquete `jev-style` (`pip install "jev-style[torch]"` para CPU/CUDA, `"jev-style[mlx]"` para Apple Silicon) y `jev-style serve --release 2b-v3`, que expone `http://127.0.0.1:8765`. Existen builds MLX y GGUF en la serie.
- Latencia y throughput: no disponibles. El autor advierte que PyTorch sobre CPU es lento para el 2B y recomienda MLX en Mac o GPU/GGUF en otros entornos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jev-Style-2B-Decision-v3 | 1,88B | No disponible | Apache-2.0 | Texto; 73,6 % en JevBench v1.4.1 |
| Jev-Style-2B-Decision-v4 | No disponible | 8.192 (API alojada) | Apache-2.0 | Texto e imágenes; release recomendada por el autor |
| Jev-Style-0.8B-Decision-v3 | ≈0,8B | No disponible | Apache-2.0 | Build GGUF de 0,53 GB; opción más ligera on-device |
| Jev (TypeSafe) | No disponible | No disponible | No disponible | Sistema de referencia con 86,6 % en JevBench v1.4.1 |

No se dispone de datos suficientes para comparar con modelos de clasificación de propósito general de la misma escala.

## Limitaciones y advertencias

- Modelo especializado: no está diseñado para generación libre de texto ni para conversación abierta; su uso fuera de las tareas de decisión y clasificación no está validado.
- Idiomas soportados no documentados; el rendimiento fuera del inglés no está garantizado.
- Longitud de contexto no confirmada para esta versión; no asumir los 8.192 tokens de la API de v4.
- Riesgo de alucinación inherente al modelo base, aunque el formato de salida restringido a opciones fijas lo reduce.
- Sesgos: no se documentan evaluaciones de sesgo ni de robustez en la información disponible.
- La API alojada ya no sirve esta versión; para usarla hay que ejecutarla en local.
- PyTorch sobre CPU es lento para 1,88B; en Mac conviene el build MLX y en otros entornos GPU o GGUF.
- Licencia Apache-2.0: permite uso comercial, pero el autor declara que JevStyle es independiente y sin afiliación ni respaldo de TypeSafe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3
- Versión recomendada (v4): https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Versión 0.8B v3: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Versión v2 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2
- Versión v1 2B (GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Colección de builds v3: https://huggingface.co/collections/chaoliangUNSW/jev-style-decision-v3-08b-2b-6ab87f32380cbd8c03b608b9
- Demo en Spaces: https://huggingface.co/spaces/chaoliangUNSW/jev-style-2b
- Sitio web: https://jevstyle.com/models/
- Guía de instalación local: https://jevstyle.com/guides/run-locally/
- Clasificación de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Routing local y Apple Silicon: https://jevstyle.com/guides/local-decision-models/
- Decisiones con visión (v4): https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de routing bancario: https://jevstyle.com/benchmarks/banking-routing/
- Referencia de la API: https://jevstyle.com/api/
- Estado del servicio: https://jevstyle.com/api/#service-status
- Health check: https://api.jevstyle.com/healthz
- Repositorio GitHub: https://github.com/lawrence3699/jev-style
