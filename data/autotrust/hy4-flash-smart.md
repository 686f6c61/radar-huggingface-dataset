# autotrust/hy4-flash-smart

## Resumen

hy4-flash-smart es un checkpoint derivado de tencent/Hy4-flash, un modelo de lenguaje de arquitectura MoE (mixture of experts) con 144.761.604.413 parámetros totales, publicado por el usuario autotrust en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una edición de pesos (weight-space programming) sobre el checkpoint cuantizado atakans/Hy4-flash-NVFP4, que a su vez deriva del modelo original de Tencent. La intervención consiste en reescribir nueve matrices de proyección descendente de los expertos compartidos mediante una edición de rango uno sin gradientes, con el objetivo de reducir el número de tokens de razonamiento (thinking tokens) que genera el modelo.

La relevancia de esta ficha radica en que ejemplifica una técnica emergente: modificar el comportamiento de un modelo grande sin fine-tuning ni datos de entrenamiento, compilando una dirección del espacio de activaciones directamente en los pesos. El resultado es un modelo que razona de forma más concisa (entre un 37% y un 55% menos de tokens de pensamiento según el benchmark), a costa de una pérdida de precisión que varía desde casi despreciable en GPQA hasta notable en code e instruction following.

El repositorio incluye tres variantes: la edición agresiva en la raíz (α = 0.1), una versión más suave en `alpha-0.05/` y una v2 en `v2/` que reduce la pérdida en instruction following manteniendo el ahorro de tokens. El modelo está pensado para despliegues donde el coste de inferencia por razonamiento importa más que los últimos puntos de precisión. La licencia es la tencent-hy-license, que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con expertos compartidos; capas MLP en NVFP4, tablas Engram en FP8 y resto en BF16 |
| Parametros totales | 144.761.604.413 |
| Parametros activos | no disponible |
| Longitud de contexto | 40.960 tokens (configurado en el ejemplo de vLLM con `--max-model-len 40960`) |
| Tipos de cuantizacion | NVFP4 (MLPs), FP8 (tablas Engram), BF16 (resto y matrices editadas); el repo incluye safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (license_name: other) |
| Formato de pesos | safetensors y GGUF |
| Modelo base | tencent/Hy4-flash y atakans/Hy4-flash-NVFP4 |
| Tamano del repo | 164,9 GB |
| Descargas / likes | 1.377 descargas, 174 likes |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de tencent/Hy4-flash: un transformer con capas de mezcla de expertos (MoE) que incluye expertos compartidos que se ejecutan en cada token. La particularidad del checkpoint es que las capas MLP están cuantizadas en NVFP4, las tablas Engram en FP8 y el resto de pesos en BF16. La edición de autotrust actúa exclusivamente sobre nueve matrices `model.layers.{22,24,…,38}.mlp.shared_experts.down_proj.weight`, que se reescriben en BF16 y quedan excluidas de la cuantización NVFP4.

La técnica de edición es una programación en el espacio de pesos sin gradientes ni datos de fine-tuning. Se calcula una dirección `d` del flujo residual que separa los últimos 48 tokens de pensamiento antes de `` del resto del razonamiento, medida sobre 288 trazas de MATH-train de nivel 5. Esa dirección se corrige por la post-normalización del FFN (`combine_output_norm`) para obtener `d″`, y se combina con `u` (media de la entrada a la proyección descendente del experto compartido en tokens de pensamiento) y `n` (media de la norma de la salida del FFN antes de la post-norm). La actualización es `W ← W_bf16_original + α · n · d″ uᵀ / ‖u‖²`, con α = 0.1 en la raíz y α = 0.05 en la variante suave. El cambio relativo de norma por capa es de 0,56% a 1,09%. El resto de tensores son idénticos byte a byte al checkpoint base. No se usó ningún benchmark de evaluación para seleccionar direcciones, capas ni α; solo MATH-train. Como control, una edición aleatoria con la misma norma y dirección ortogonal a `d` produce +0,0 puntos de precisión y +8% de tokens, lo que confirma que el ahorro proviene de la dirección y no de la perturbación.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (thinking mode), activable mediante `reasoning_effort: high`.
- Razonamiento matemático: la dirección de edición se calibró sobre trazas de MATH-train y el modelo mantiene un rendimiento alto en problemas de matemáticas (MATH train screen: 89,8 frente a 92,2 del base).
- Razonamiento científico de nivel experto: GPQA Diamond con 88,6 frente a 91,2 del base en la variante agresiva.
- Generación de código: LiveCodeBench v6 con 78,3 frente a 84,6 del base, con una reducción del 36,8% en tokens de pensamiento.
- Seguimiento de instrucciones: IFBench con 66,0 frente a 76,7 del base, la capacidad más afectada por la edición.
- Soporte de tool calling y function calling: no se documenta explícitamente en la información disponible, aunque el modelo base Hy4-flash está etiquetado como conversacional y compatible con endpoints.
- Capacidades multimodales: el ejemplo de despliegue en vLLM limita imágenes y vídeos a cero (`--limit-mm-per-prompt '{"image":0,"video":0}'`), lo que sugiere que el modelo base podría tener entradas multimodales, pero esta variante se sirve en modo solo texto.
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático con presupuesto de tokens ajustado: el modelo mantiene 89,8 puntos en la pantalla de MATH-train con un 40% menos de tokens de pensamiento, lo que lo hace adecuado para pipelines de resolución de problemas donde el coste por consulta es crítico.
- Evaluación científica automatizada: para tareas de GPQA Diamond donde se acepta una pérdida de 2,5 puntos a cambio de reducir los tokens de pensamiento de 5.448 a 3.291 de media, el modelo es útil en entornos de investigación con grandes volúmenes de preguntas.
- Generación de código en producción con restricciones de latencia: la variante `alpha-0.05/` reduce un 25% los tokens de pensamiento en LiveCodeBench con solo 2,3 puntos de pérdida, lo que permite integrarla en pipelines de CI/CD donde el tiempo de respuesta importa.
- Despliegue en infraestructura Hopper o Blackwell con vLLM: el modelo está pensado para servirse con la imagen `vllm/vllm-openai:hy4-flash` y el parser de razonamiento `hy_v4`, lo que facilita su integración en stacks de inferencia existentes.
- Sustitución de modelos de razonamiento en agentes con presupuesto limitado: cuando un agente multi-paso necesita muchas llamadas al modelo, la reducción de tokens de pensamiento del 37-55% disminuye el coste total de la sesión, a costa de aceptar pérdidas en instruction following.
- Experimentación en investigación sobre edición de pesos: el repositorio incluye los tensores de dirección y los scripts en `edit/`, lo que permite reproducir la edición, probar otras direcciones o aplicar la técnica a otros modelos MoE.
- Ajuste fino del equilibrio precisión-coste: la disponibilidad de tres variantes (α = 0.1, α = 0.05 y v2) permite elegir el punto de operación según si prima el ahorro de tokens o la fidelidad en código e instrucciones.

## Benchmarks y rendimiento

Los resultados se obtuvieron con vLLM, comparando el checkpoint contra el mismo base con las nueve matrices en BF16 sin editar, con thinking activado (`reasoning_effort: high`), temperatura 0,9, máximo 32k tokens y una GPU H200. La Δ está emparejada por problema con intervalo de confianza bootstrap al 95%.

| Benchmark | Base | Concise (α=0.1) | Δ precisión [IC 95%] | Δ tokens de pensamiento [IC 95%] |
|---|---|---|---|---|
| GPQA Diamond (198 × 2) | 91,2 | 88,6 | −2,5 [−5,3, +0,3] | −39,6% [−43,3, −35,6] |
| LiveCodeBench v6 (175) | 84,6 | 78,3 | −6,3 [−12,0, −0,6] | −36,8% [−43,3, −30,3] |
| IFBench (300, loose) | 76,7 | 66,0 | −10,7 [−16,0, −5,3] | −54,8% [−58,3, −51,0] |
| 13 tareas de código/mate/ciencia × 3 (held-out) | 39/39 | 38/39 | −2,6 | −54,2% |
| MATH train screen (64 × 2) | 92,2 | 89,8 | −2,3 [−6,2, +0,8] | −40,2% [−47,8, −29,9] |

Tokens de pensamiento medios, base → concise: GPQA 5.448 → 3.291; LCB 8.564 → 5.409; IFBench 5.275 → 2.382; tareas held-out 5.415 → 2.482.

Variante suave (`alpha-0.05/`):

| Benchmark | Base | α=0.05 | Δ precisión [IC 95%] | Δ tokens de pensamiento [IC 95%] |
|---|---|---|---|---|
| GPQA Diamond (198 × 2) | 91,2 | 89,6 | −1,5 [−3,8, +0,5] | −20,6% [−25,6, −15,7] |
| LiveCodeBench v6 (175) | 84,6 | 82,3 | −2,3 [−8,0, +3,4] | −25,0% [−31,2, −18,8] |
| IFBench (300, loose) | 76,7 | 70,3 | −6,3 [−11,0, −2,0] | −36,6% [−40,8, −31,7] |
| 13 tareas held-out × 3 | 39/39 | 37/39 | −5,1 | −29,1% |

Variante v2 (`v2/`):

| Benchmark | Base | v2 | Δ precisión [IC 95%] | Δ tokens de pensamiento [IC 95%] |
|---|---|---|---|---|
| GPQA Diamond (198 × 2) | 91,2 | 89,4 | −1,8 [−4,3, +0,5] | −39,2% [−43,3, −34,9] |
| LiveCodeBench v6 (175) | 84,6 | 77,7 | −6,9 [−12,6, −1,7] | −39,6% [−46,9, −32,4] |
| IFBench (300, loose) | 76,7 | 70,7 | −6,0 [−10,7, −1,3] | −54,6% [−58,5, −50,4] |
| 13 tareas held-out × 3 | 39/39 | 36/39 | −7,7 | −52,2% |

Respuesta a la dosis (MATH screen): α = 0,05 → −23% tokens; α = 0,075 → −32%; α = 0,1 → −40%; α = 0,3 → respuestas incorrectas; α = 1,0 → el modelo entra en bucle en ``. No se debe subir α.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 164,9 GB en safetensors, por lo que la inferencia en BF16/NVFP4 requiere al menos una GPU con 160 GB o más de memoria. Con cuantización GGUF el requisito baja, pero no se especifican tamaños concretos en la información disponible.
- GPU recomendadas: H200 (utilizada en la evaluación de benchmarks), y por la imagen de vLLM indicada, GPUs Hopper (H100, H200) y Blackwell. En DGX Spark (SM120) se recomienda la imagen completa del recetario `atakann/dgx-spark-recipes`.
- ¿Cabe en GPU de consumo? No en su forma completa. No se documenta ninguna configuración que quepa en una RTX 4090 (24 GB) o similar sin cuantización GGUF agresiva, y no se proporcionan datos de esa configuración.
- Opciones de despliegue: vLLM con la imagen `vllm/vllm-openai:hy4-flash` y el parser de razonamiento `hy_v4`. Para la carga de expertos NVFP4 se necesita el archivo `vllm/models/hy_v4_flash/nvidia/model.py` del repositorio `atakann/dgx-spark-recipes`, copiado en `edit/vllm_hy_v4_flash_model.py`. No se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Solo se conoce la reducción de tokens de pensamiento, que implica directamente una reducción proporcional del trabajo de decodificación, pero no se publican medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond | LiveCodeBench v6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hy4-flash-smart (α=0.1) | 144,8B | 40.960 | 88,6 | 78,3 | tencent-hy-license | Hugging Face |
| tencent/Hy4-flash (base) | 144,8B | no disponible | 91,2 | 84,6 | tencent-hy-license | Hugging Face |
| hy4-flash-smart (α=0.05) | 144,8B | 40.960 | 89,6 | 82,3 | tencent-hy-license | Hugging Face |
| hy4-flash-smart (v2) | 144,8B | 40.960 | 89,4 | 77,7 | tencent-hy-license | Hugging Face |

La comparación natural es contra el propio modelo base sin editar, que obtiene mejores resultados en todos los benchmarks a cambio de un mayor consumo de tokens de pensamiento. No se dispone de datos de otros modelos de la misma categoría (mismo tamaño o misma tarea) en la información proporcionada, por lo que no se puede establecer una comparativa con alternativas externas.

## Limitaciones y advertencias

- Estado experimental: el autor marca el modelo explícitamente como experimental. La edición agresiva (α = 0.1) pierde 10,7 puntos en IFBench y 6,3 en LiveCodeBench v6, lo que puede ser inaceptable en producción.
- Riesgo de alucinación: no se documenta una evaluación específica de alucinación, pero la reducción de tokens de pensamiento puede disminuir la verificación interna que el modelo realiza antes de responder.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: no se documentan los idiomas soportados. El modelo base es de Tencent y la calibración se hizo sobre MATH-train, sin información sobre cobertura multilingüe.
- Restricciones de licencia: la licencia tencent-hy-license condiciona el uso comercial. Es responsabilidad del usuario revisar los términos en el enlace de licencia del modelo base antes de desplegarlo en producción.
- Sensibilidad a α: subir α por encima de 0,1 degrada gravemente el modelo (α = 0,3 produce respuestas incorrectas y α = 1,0 provoca bucles en ``). No se debe ajustar α sin validación.
- Dependencia de infraestructura: requiere la imagen específica de vLLM y el archivo de modelo de un repositorio externo para cargar los expertos NVFP4. No es un checkpoint plug-and-play en cualquier stack.
- Modo multimodal desactivado: el ejemplo de despliegue limita imágenes y vídeos a cero, por lo que esta variante se sirve solo como modelo de texto.
- Selección sobre MATH-train: las direcciones, capas y α se eligieron únicamente con datos de MATH-train, lo que puede introducir un sesgo hacia ese dominio y explicar la mayor pérdida en código e instruction following.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/hy4-flash-smart
- Modelo base original: https://huggingface.co/tencent/Hy4-flash
- Checkpoint cuantizado base: https://huggingface.co/atakans/Hy4-flash-NVFP4
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Recetario de despliegue en DGX Spark: https://github.com/atakann/dgx-spark-recipes
