# autotrust/hy4-flash-concise

## Resumen

hy4-flash-concise es una variante editada de tencent/Hy4-flash, un modelo de lenguaje de tipo Mixture of Experts (MoE) con 144.761.604.413 parámetros totales, publicado por el usuario autotrust en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es una edición en el espacio de pesos (weight-space programming) que reescribe nueve matrices `down_proj` de los expertos compartidos para comprimir el razonamiento del modelo. El objetivo es reducir el número de tokens de pensamiento (thinking tokens) entre un 37 % y un 55 % según el benchmark, a costa de una pérdida de precisión que varía desde casi despreciable en GPQA hasta notable en código e instrucciones.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica poco habitual —una edición de rango uno, sin gradientes y sin datos de fine-tuning, derivada de las propias activaciones del modelo— aplicada a un MoE de gran tamaño. Por otro, ofrece tres variantes con distintos compromisos entre ahorro de tokens y precisión: la raíz del repositorio (α = 0.1, agresiva), `alpha-0.05/` (suave) y `v2/` (dirección corregida que conserva el ahorro de la raíz con menor pérdida en instrucciones).

El modelo base, tencent/Hy4-flash, se distribuye bajo la licencia tencent-hy-license y está pensado para generación de texto con razonamiento explícito, modo thinking y soporte multimodal (imagen y vídeo, aunque la receta de despliegue del autor los desactiva). Esta variante hereda esas capacidades y esa licencia, y se presenta explícitamente como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con expertos compartidos; pesos NVFP4 en MLPs, FP8 en tablas Engram y BF16 en el resto |
| Parametros totales | 144.761.604.413 |
| Parametros activos | no disponible |
| Longitud de contexto | 40.960 tokens (configurado en la receta vLLM del autor con `--max-model-len 40960`) |
| Tipos de cuantizacion | NVFP4 (MLPs), FP8 (tablas Engram), BF16 (resto); las nueve matrices editadas se almacenan en BF16 y quedan excluidas de NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (license: other) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un MoE derivado de tencent/Hy4-flash. La variante base utilizada es atakans/Hy4-flash-NVFP4, que cuantiza los MLPs en NVFP4, mantiene las tablas Engram en FP8 y el resto en BF16. Sobre esa base, la edición afecta únicamente a nueve tensores: `model.layers.{22,24,…,38}.mlp.shared_experts.down_proj.weight`. Todo lo demás es byte a byte idéntico al checkpoint NVFP4 de partida. La edición aplica la fórmula `W ← W_bf16_original + α · n · d″ uᵀ / ‖u‖²` con α = 0.1 en la raíz del repositorio, guardando el resultado en BF16. El tamaño relativo de la perturbación es de 0,56–1,09 % por capa.

No hay pasos de gradiente ni datos de fine-tuning. La dirección `d` se obtiene de las activaciones del propio modelo: es la dirección del residual stream que separa los últimos 48 tokens de pensamiento antes de `` del resto del razonamiento, medida sobre 288 trazas de MATH-train de nivel 5. `d″` corrige esa dirección por el post-norm del FFN (`combine_output_norm`), de modo que tras el RMSNorm el vector escrito apunte a lo largo de `d`. `u` es la entrada media a la down-projection del experto compartido en tokens de pensamiento y `n` es la norma media de la salida del FFN antes del post-norm. Como el experto compartido se ejecuta en todos los tokens, un término de rango uno en su down-projection actúa como un vector de steering constante compilado en los pesos. Las direcciones, capas y α se seleccionaron solo con MATH train, sin usar benchmarks de evaluación.

El autor documenta un control con una edición aleatoria de norma equivalente (mismas capas, mismo ‖ΔW‖, dirección ortogonal a `d`): en la pantalla de MATH da +0,0 puntos de precisión y +8 % de tokens, lo que respalda que el ahorro proviene de la dirección y no de la perturbación. También documenta la respuesta a la dosis: α = 0.05 → −23 % tokens; α = 0.075 → −32 %; α = 0.1 → −40 %; α = 0.3 → respuestas incorrectas; α = 1.0 → el modelo entra en bucle en ``. El autor advierte explícitamente de no subir α.

## Capacidades

- Generación de texto con razonamiento explícito en modo thinking, con `reasoning_effort: high` en la configuración de evaluación.
- Razonamiento científico y de nivel experto (evaluado en GPQA Diamond).
- Generación y razonamiento sobre código (evaluado en LiveCodeBench v6).
- Razonamiento matemático (pantalla de MATH train y tareas held-out de matemáticas).
- Seguimiento de instrucciones, incluido el modo estricto evaluado con IFBench (con pérdida significativa respecto a la base).
- Capacidades multimodales heredadas del modelo base (imagen y vídeo), aunque la receta de despliegue del autor las desactiva con `--limit-mm-per-prompt '{"image":0,"video":0}'`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y despliegue en vLLM con parser de razonamiento `hy_v4`.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Razonamiento científico con presupuesto de tokens ajustado: en GPQA Diamond el modelo pasa de 5.448 a 3.291 tokens de pensamiento de media con una caída de solo 2,5 puntos, por lo que es adecuado para pipelines de QA experto donde el coste por consulta importa y se tolera un pequeño descenso de precisión.
- Evaluación comparativa de técnicas de edición de pesos: el repositorio incluye las variantes α = 0.05, α = 0.1 y v2, además de los tensores de dirección y los scripts en `edit/`, lo que permite reproducir el experimento y medir el efecto de la dosis sobre un MoE de 144.000 millones de parámetros.
- Clasificación y triaje con razonamiento acotado: para tareas de las 13 tareas held-out (coding, matemáticas y ciencia) el modelo mantiene 38/39 con la raíz y reduce los tokens un 54,2 %, un perfil útil en procesos por lotes donde el throughput manda.
- Despliegue en hardware Hopper o Blackwell con vLLM: la receta oficial usa una sola H200 con `--max-model-len 40960` y `--max-num-seqs 64`, lo que encaja en servicios de inferencia que ya dispongan de esa clase de GPU y quieran bajar el coste de decodificación.
- Investigación sobre steerability y control de la longitud de razonamiento: el modo thinking se regula mediante una edición estática de pesos, sin prompts ni cambios en el runtime, lo que simplifica la integración en sistemas existentes frente a alternativas de control dinámico.
- Prototipado de asistentes de código con restricciones de latencia: la variante `alpha-0.05/` reduce tokens un 25 % en LiveCodeBench v6 con una caída de 2,3 puntos, un compromiso razonable para autocompletado y revisión de código en entornos de desarrollo.

## Benchmarks y rendimiento

Configuración de evaluación: vLLM, comparación contra la base emparejada (las mismas nueve matrices en BF16 sin editar), thinking activado (`reasoning_effort: high`), temperatura 0,9, máximo 32k tokens, una H200. Δ emparejado por problema con intervalo de confianza bootstrap del 95 %.

| Benchmark | Base | concise (α=0.1) | Δ precisión [IC 95 %] | Δ tokens de pensamiento [IC 95 %] |
|---|---|---|---|---|
| GPQA Diamond (198 × 2) | 91,2 | 88,6 | −2,5 [−5,3; +0,3] | −39,6 % [−43,3; −35,6] |
| LiveCodeBench v6 (175, 2025-01…04) | 84,6 | 78,3 | −6,3 [−12,0; −0,6] | −36,8 % [−43,3; −30,3] |
| IFBench (300, loose) | 76,7 | 66,0 | −10,7 [−16,0; −5,3] | −54,8 % [−58,3; −51,0] |
| 13 tareas coding/math/science × 3 (held-out) | 39/39 | 38/39 | −2,6 | −54,2 % |
| MATH train screen (64 × 2) | 92,2 | 89,8 | −2,3 [−6,2; +0,8] | −40,2 % [−47,8; −29,9] |

Tokens de pensamiento medios, base → concise: GPQA 5.448 → 3.291; LCB 8.564 → 5.409; IFBench 5.275 → 2.382; tareas held-out 5.415 → 2.482.

Variante suave `alpha-0.05/`:

| Benchmark | Base | α=0.05 | Δ precisión [IC 95 %] | Δ tokens de pensamiento [IC 95 %] |
|---|---|---|---|---|
| GPQA Diamond (198 × 2) | 91,2 | 89,6 | −1,5 [−3,8; +0,5] | −20,6 % [−25,6; −15,7] |
| LiveCodeBench v6 (175) | 84,6 | 82,3 | −2,3 [−8,0; +3,4] | −25,0 % [−31,2; −18,8] |
| IFBench (300, loose) | 76,7 | 70,3 | −6,3 [−11,0; −2,0] | −36,6 % [−40,8; −31,7] |
| 13 tareas held-out × 3 | 39/39 | 37/39 | −5,1 | −29,1 % |

Variante `v2/` (mismas capas, mismo α = 0.1, mismo ‖ΔW‖, dirección sin la componente de seguimiento de instrucciones):

| Benchmark | Base | v2 | Δ precisión [IC 95 %] | Δ tokens de pensamiento [IC 95 %] |
|---|---|---|---|---|
| GPQA Diamond (198 × 2) | 91,2 | 89,4 | −1,8 [−4,3; +0,5] | −39,2 % [−43,3; −34,9] |
| LiveCodeBench v6 (175) | 84,6 | 77,7 | −6,9 [−12,6; −1,7] | −39,6 % [−46,9; −32,4] |
| IFBench (300, loose) | 76,7 | 70,7 | −6,0 [−10,7; −1,3] | −54,6 % [−58,5; −50,4] |
| 13 tareas held-out × 3 | 39/39 | 36/39 | −7,7 | −52,2 % |

Control con edición aleatoria de norma equivalente en la pantalla de MATH: +0,0 puntos de precisión y +8 % de tokens.

## Requisitos de hardware

- El repositorio ocupa 164,9 GB, lo que da una idea del espacio en disco necesario para pesos en NVFP4/FP8/BF16 mixtos.
- La receta oficial de evaluación se ejecutó en una sola NVIDIA H200, con `--dtype bfloat16 --max-model-len 40960 --max-num-seqs 64`.
- GPU recomendadas: H200 (usada en la evaluación) y, por extensión, clase Hopper y Blackwell, ya que el autor indica que Hy4-flash requiere la imagen `vllm/vllm-openai:hy4-flash`.
- En DGX Spark (SM120) el autor remite a la imagen completa de la receta `atakann/dgx-spark-recipes`, necesaria para cargar expertos NVFP4.
- No se proporcionan datos de VRAM mínima, latencia ni throughput. No cabe esperar que quepa en GPU de consumo convencionales dado el tamaño del checkpoint (164,9 GB) y la necesidad de soporte NVFP4 en vLLM.
- Opciones de despliegue documentadas: vLLM con la imagen específica y el parser `--reasoning-parser hy_v4`. El repositorio incluye además pesos en GGUF, lo que abre la puerta a otros runtimes, aunque no se detalla la receta.
- Para cargar los expertos NVFP4 es necesario el archivo `vllm/models/hy_v4_flash/nvidia/model.py` de `atakann/dgx-spark-recipes`, copiado en el repositorio como `edit/vllm_hy_v4_flash_model.py`.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| autotrust/hy4-flash-concise (raíz, α=0.1) | 144,76 B | 40.960 | tencent-hy-license | Hugging Face, safetensors y GGUF | Edición agresiva: −37 a −55 % tokens |
| autotrust/hy4-flash-concise (`alpha-0.05/`) | 144,76 B | 40.960 | tencent-hy-license | Incluido en el mismo repo | Edición suave: −21 a −37 % tokens |
| autotrust/hy4-flash-concise (`v2/`) | 144,76 B | 40.960 | tencent-hy-license | Incluido en el mismo repo | Ahorro de la raíz con menor pérdida en IFBench |
| tencent/Hy4-flash (base) | no disponible en la información | no disponible | tencent-hy-license | Hugging Face | Modelo original sin editar |
| atakans/Hy4-flash-NVFP4 | no disponible en la información | no disponible | no disponible | Hugging Face | Checkpoint NVFP4 usado como base de la edición |

No se dispone de datos de benchmarks de modelos alternativos de otros autores en la información proporcionada, por lo que la comparación cuantitativa se limita a las variantes del propio repositorio frente a su base emparejada.

## Limitaciones y advertencias

- Estado experimental declarado por el autor. No es un modelo listo para producción sin validación propia.
- Pérdida de precisión no trivial: −10,7 puntos en IFBench (strict/loose) y −6,3 en LiveCodeBench v6 con la raíz; la variante suave sigue perdiendo 6,3 puntos en IFBench.
- El seguimiento estricto de instrucciones es el punto más débil de todas las variantes, incluida v2.
- El ahorro de tokens se midió con thinking activado y temperatura 0,9; el comportamiento puede diferir con otras configuraciones de decodificación.
- No se deben subir los valores de α: con α = 0,3 las respuestas pasan a ser incorrectas y con α = 1,0 el modelo entra en bucle en ``.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales de un modelo de razonamiento de este tamaño.
- Idiomas soportados: no disponibles. No se puede confirmar el comportamiento multilingüe.
- Restricciones de licencia: tencent-hy-license (license: other). Es imprescindible revisar los términos antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- Dependencia de una imagen específica de vLLM (`vllm/vllm-openai:hy4-flash`) y de un archivo de modelo externo para cargar expertos NVFP4; esto complica el despliegue y la portabilidad.
- La receta de despliegue del autor desactiva imagen y vídeo, de modo que las capacidades multimodales heredadas no están validadas en esta variante.
- Las nueve matrices editadas se guardan en BF16 y quedan fuera de NVFP4, lo que aumenta ligeramente el peso respecto al checkpoint base cuantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/hy4-flash-concise
- Modelo base original: https://huggingface.co/tencent/Hy4-flash
- Checkpoint NVFP4 de partida: https://huggingface.co/atakans/Hy4-flash-NVFP4
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Receta de despliegue para DGX Spark: https://github.com/atakann/dgx-spark-recipes
- Variante suave: https://huggingface.co/autotrust/hy4-flash-concise/tree/main/alpha-0.05
- Variante v2: https://huggingface.co/autotrust/hy4-flash-concise/tree/main/v2
- Tensores de dirección y scripts de edición: https://huggingface.co/autotrust/hy4-flash-concise/tree/main/edit
