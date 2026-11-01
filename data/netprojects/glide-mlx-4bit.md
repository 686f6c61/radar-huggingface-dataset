# netprojects/GLiDE-mlx-4bit

## Resumen

GLiDE-mlx-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo GLiDE v1.2 de Fastino, un modelo de decisión construido sobre Qwen3.8-27B. No se trata de un modelo conversacional al uso: recibe un estado (texto, JSON o imágenes) y una serie de preguntas tipadas (`choice`, `noul` para sí/no y `score`) y devuelve una probabilidad para cada opción en un único pase forward. No genera texto libre.

La conversión la publica NetProjects (Internet Projects Ltd) y está pensada específicamente para Apple Silicon, con pruebas realizadas en un MacBook Pro con M5 Max y 128 GB de memoria unificada. El checkpoint ocupa 15,3 GB de pesos, aproximadamente la mitad que la versión de 8 bits del mismo autor, a costa de una ligera pérdida de fidelidad probabilística.

El modelo es relevante porque traslada un modelo de decisión calibrado de 26.000 millones de parámetros al ecosistema MLX, permitiendo ejecutarlo localmente en hardware de Apple con latencias de 0,45 s por ítem en el benchmark JevBench, sin depender de GPUs NVIDIA ni de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas de atención completa (sin máscara causal) + 48 capas Gated DeltaNet, sobre base Qwen3.8-27B |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits afín (affine), tamaño de grupo 64; readout de 255 vías y codificador visual a precisión original |
| Idiomas soportados | No disponible |
| Licencia | Fastino Community License (uso comercial con atribución; acuerdos adicionales por encima de 10 M USD de ingresos anuales) |
| Formato de pesos | safetensors (MLX), más `readout.safetensors` separado |

## Arquitectura y entrenamiento

GLiDE se construye sobre Qwen3.8-27B y conserva su estructura híbrida: 16 capas de atención completa que procesan el prompt de forma bidireccional (sin máscara causal, lo que el autor denomina `noncausal_full_attention`) y 48 capas Gated DeltaNet que mantienen su recurrencia. La salida no es una distribución sobre tokens, sino que el estado oculto del último token pasa por un readout de 255 vías y se aplica un softmax sobre las opciones con la temperatura definida en `decision_config.json`.

La conversión mantiene intactos los componentes críticos para la calibración: el readout de 255 vías y el codificador visual se conservan a su precisión original, mientras que el resto de pesos se cuantiza a 4 bits con grupo de 64. Los prompts e imágenes se procesan con el `prompt.py` e `images.py` originales de GLiDE. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Decisión sobre estados multimodales: acepta texto, JSON e imágenes como entrada.
- Preguntas tipadas: `choice` (selección entre opciones), `noul` (sí/no) y `score` (puntuación).
- Devuelve probabilidades calibradas por opción, no texto generado.
- Procesamiento bidireccional del prompt en las capas de atención completa.
- Soporte de visión mediante codificador visual a precisión original.
- API compatible con el servidor de GLiDE (`POST /v1/systemone`).
- No soporta tool calling, agentes ni generación de texto libre por diseño.

## Casos de uso

- Enrutamiento de decisiones en pipelines locales: dado un estado en JSON y un conjunto de opciones, el modelo devuelve la probabilidad de cada una en un solo pase, útil para clasificación con umbrales calibrados.
- Evaluación de riesgo con imágenes: al aceptar entradas visuales, puede puntuar escenarios que combinan capturas o documentos escaneados con preguntas de sí/no.
- Moderación y filtrado con calibración: las preguntas `noul` permiten obtener probabilidades directamente comparables frente a umbrales fijos, sin depender de la generación de texto.
- Investigación en calibración de modelos: el benchmark JevBench y la comparación con la implementación PyTorch de referencia permiten estudiar la degradación introducida por la cuantización a 4 bits.
- Prototipado en Apple Silicon: con 15,3 GB de pesos cabe en equipos con memoria unificada de 32 GB o más, lo que facilita experimentar sin GPU dedicada.
- Servicio local de decisión: el servidor `glide-mlx` expone un endpoint HTTP compatible con el formato de GLiDE, adecuado para integrarlo en aplicaciones de escritorio o flujos internos en macOS.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Coincidencia con la respuesta top de Fastino (PyTorch, bf16) | 197 / 204 preguntas; diferencia media de probabilidad 0,012 |
| Preguntas de sí/no y score idénticas | 132 / 132 |
| JevBench público (231 ítems, v1.2.1, `--adapter typesafe`) | 213 / 231 (fácil 48/48 · estándar 72/72 · difícil 93/111) |
| Tiempo por ítem de JevBench (prompts de hasta ~4K tokens) | 0,45 s de mediana |

Las discrepancias respecto al código de referencia se concentran en preguntas `choice` con muchas opciones donde el margen entre las dos primeras era de 0,09 o menos.

## Requisitos de hardware

- Pesos: 15,3 GB en 4 bits; se recomienda al menos 32 GB de memoria unificada para dejar margen al contexto y al codificador visual.
- Hardware probado: MacBook Pro con M5 Max y 128 GB.
- Compatible con Apple Silicon (MLX); no está pensado para GPUs NVIDIA.
- Despliegue mediante el servidor `glide-mlx` (`python -m glide_mlx.server`), no con `mlx_lm.server` ni con una llamada genérica a `mlx_vlm`.
- Latencia medida: 0,45 s de mediana por ítem de JevBench con prompts de hasta unos 4K tokens.
- Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/GLiDE-mlx-4bit | 26,1 B | MLX 4 bits | 15,3 GB | Fastino Community | Menor tamaño, mayor desviación probabilística |
| netprojects/GLiDE-mlx-8bit | 26,1 B | MLX 8 bits | ~2x el 4 bits | Fastino Community | Mayor fidelidad respecto al original |
| fastino/GLiDE | 26,1 B | PyTorch bf16 | No disponible | Fastino Community | Referencia oficial |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto libre y no debe usarse con llamadas genéricas de `mlx_vlm` o `mlx_lm.server`.
- La cuantización a 4 bits introduce desviaciones en probabilidades (diferencia media 0,012) y cambios de respuesta top en casos con margen estrecho entre opciones.
- Licencia Fastino Community: el uso comercial exige mostrar "Built with Fastino GLiDE" y, por encima de 10 M USD de ingresos anuales, un acuerdo adicional con Fastino.
- Conversión no afiliada a Fastino; el soporte y las garantías dependen de NetProjects.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Longitud de contexto no disponible en la información proporcionada.
- Riesgo de alucinación no aplica en el sentido habitual, pero la calibración puede degradarse fuera de la distribución de estados vista en entrenamiento.

## Enlaces

- [netprojects/GLiDE-mlx-4bit en HuggingFace](https://huggingface.co/netprojects/GLiDE-mlx-4bit)
- [fastino/GLiDE (modelo base)](https://huggingface.co/fastino/GLiDE)
- [netprojects/GLiDE-mlx-8bit](https://huggingface.co/netprojects/GLiDE-mlx-8bit)
- [Repositorio glide-mlx](https://github.com/internet-projects/glide-mlx)
- [NetProjects MLX builds (colección)](https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a)
- [Todos los modelos de NetProjects](https://huggingface.co/netprojects)
- [NetProjects](https://netprojects.com)
