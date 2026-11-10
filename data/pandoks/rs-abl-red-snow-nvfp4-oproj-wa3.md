# Pandoks/rs-abl-red-snow-nvfp4-oproj-wa3

## Resumen

RED-SNOW 5.3 Flash NVFP4 — o_proj loop-direction ablation (wa3) es una compilación diagnóstica experimental publicada por el usuario Pandoks sobre el checkpoint cuantizado `Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4`. No se trata de un modelo entrenado desde cero, sino de una edición quirúrgica de pesos: todos los tensores son idénticos byte a byte al checkpoint base salvo el `self_attn.o_proj.weight` de doce capas concretas (28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 41 y 43), donde se aplica una ablación direccional de rango 1.

El problema que aborda es específico: en contextos largos, el modelo base entra en bucles de repetición literal (frases como "— done. — end." o "tldr:" repetidas), un fallo que el autor interpreta como una decisión de parada bloqueada. La edición resta una dirección unitaria `u_L` —la diferencia media entre activaciones durante bucles de repetición y durante generación normal— del espacio de salida de atención de 4096 dimensiones de esas capas, con un factor alpha de 3,0.

Con 161.461.030.910 parámetros totales y un repositorio de 204,5 GB en formato NVFP4 (8 bits), la relevancia de esta ficha es acotada: es una variante de diagnóstico para investigación sobre dinámicas de repetición en contextos largos, no una versión de uso general. El autor lo declara explícitamente y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa en banda tardía y mezcla de expertos cuantizados en NVFP4 (según tags del modelo base; detalles completos no disponibles) |
| Parametros totales | 161.461.030.910 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits de peso con escalas, empaquetado como 8-bit en los tags); tensores editados almacenados en BF16 dentro de los shards |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (shards NVFP4, con index) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia GLM 5.3 (tags `glm5_next`, `glm-5.3`) y está cuantizado en NVFP4 mediante NVIDIA ModelOpt, según el tag `modelopt`. La arquitectura exacta, el número de tokens de entrenamiento, la composición del dataset y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica de esta variante no es de entrenamiento sino de edición post-hoc de pesos. Para cada capa editada L se aplica `W' = W - alpha * u_L (u_L^T W)`, con alpha = 3,0 y `u_L` la dirección unitaria de "bucle" en el espacio de salida de atención de 4096 dimensiones, estimada como la diferencia media entre activaciones durante repeticiones literales y durante generación normal sobre sesiones de trabajo reservadas. Esta variante usa una dosis más suave que la original (alpha 4,0 → 3,0) sobre las mismas doce capas. Como los tensores `o_proj` están en BF16 dentro de los shards NVFP4, la edición se escribe directamente en los bytes de safetensors sin recuantizar: expertos NVFP4, escalas, cabeceras e índice permanecen intactos, y solo difieren los shards 00012–00018 respecto al checkpoint base (revisión `8133f8ba249427a0dbe0ee197f8562d2ef109569`).

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base RED-SNOW 5.3 Flash.
- Tool calling / function calling: el autor indica que en turnos de control (sin bucle) el tool-calling se mantiene intacto tras la edición.
- Mitigación de bucles de repetición en contexto largo: convierte repeticiones literales en cierres de turno limpios en lugar de generación desbocada no terminante.
- Razonamiento multi-turno y generación con parada controlada en contextos extensos (objetivo declarado de la edición).
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.
- No se documentan capacidades de código, matemáticas ni agentes más allá de lo heredado del base, sin datos verificables.

## Casos de uso

- Investigación sobre bucles de repetición: usar esta variante como contraste experimental frente al checkpoint base para aislar el efecto de la dirección de bucle en la capa de salida de atención, comparando tasas de repetición literal en generaciones largas.
- Diagnóstico de decisión de parada: analizar si los cierres de turno se restauran en contextos de decenas de miles de tokens, midiendo la proporción de turnos que terminan limpiamente frente a los que se desbordan.
- Evaluación de edición de pesos sin recuantización: servir de ejemplo reproducible de cómo aplicar una ablación de rango 1 sobre tensores BF16 embebidos en shards NVFP4 sin alterar escalas ni expertos.
- Pruebas de regresión de tool calling: verificar que los turnos sin bucle conservan la llamada a herramientas y la longitud de respuesta tras la edición, como control negativo del experimento.
- Estudio de robustez en producción de asistentes de contexto largo: simular sesiones de trabajo extensas para caracterizar el fallo de repetición antes y después de la ablación, con vistas a diseñar mitigaciones en el pipeline de inferencia.
- Reproducción académica: replicar el método de dirección media de bucle sobre otras capas o modelos de la misma familia para validar la generalidad del hallazgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a unas notas de investigación para la evaluación completa, pero no se incluyen cifras en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 204,5 GB en NVFP4; se necesita un nodo multi-GPU con al menos ~210–230 GB de memoria agregada para cargar los pesos completos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el despliegue requiere GPUs de centro de datos (A100 80 GB, H100 80 GB, H200) en configuración multi-GPU. No cabe en una RTX 4090 de 24 GB.
- Consumer GPU: no es viable con los pesos completos; solo sería posible con cuantizaciones adicionales agresivas no publicadas, cuyo impacto en la ablación es desconocido.
- Opciones de despliegue: no disponibles de forma explícita; el formato safetensors NVFP4 con tag `modelopt` sugiere soporte vía TensorRT-LLM o vLLM con kernels NVFP4, pero no está confirmado en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Proposito |
|---|---|---|---|---|---|
| Pandoks/rs-abl-red-snow-nvfp4-oproj-wa3 | 161,46 B | no disponible | NVFP4 | MIT | Diagnostico experimental (ablacion de bucle) |
| Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4 | 161,46 B (heredado) | no disponible | NVFP4 | no disponible | Checkpoint base sin editar |
| Otras variantes de ablacion del mismo autor | no disponible | no disponible | NVFP4 | MIT (presumible) | Variantes con distinta dosis alpha |

No se dispone de datos de rendimiento comparativos entre estas variantes ni frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Compilación de diagnóstico: el propio autor declara que no es una versión de uso general.
- Solo se modifican doce tensores `o_proj`; cualquier comportamiento fuera de la mitigación de bucles es el del checkpoint base, con sus sesgos y riesgos de alucinación sin evaluar en esta ficha.
- Riesgo de alucinación: no evaluado ni documentado para esta variante.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Longitud de contexto efectiva: no disponible, aunque el propósito de la edición es precisamente el régimen de contexto largo.
- Licencia MIT permite uso comercial, pero al ser un build experimental sin benchmarks ni evaluación de seguridad, su uso en producción no está respaldado por evidencias.
- Descargas y likes nulos en el momento de la consulta; sin validación comunitaria.
- La evaluación del autor se limita a generación libre en su propio equipo ("on-box"); no hay pruebas independientes.
- El método de dirección de bucle se estimó sobre sesiones de trabajo reservadas del autor; su transferencia a otros dominios o idiomas no está verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pandoks/rs-abl-red-snow-nvfp4-oproj-wa3
- Modelo base: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4
- Revisión del checkpoint base: `8133f8ba249427a0dbe0ee197f8562d2ef109569` (en el repositorio del modelo base)
- Notas de investigación del autor: referenciadas en la model card, sin URL directa disponible
