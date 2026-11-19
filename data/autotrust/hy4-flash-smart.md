# autotrust/hy4-flash-smart

## Resumen

Hy4-flash-smart es una variante experimental del modelo Hy4-flash de Tencent, publicada por el usuario autotrust en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es una edición en el espacio de pesos (weight-space programming) que reescribe nueve matrices de down-projection de los shared experts del modelo base mediante una actualización de rango uno, sin pasos de gradiente ni datos de entrenamiento adicionales. El objetivo es reducir el número de tokens de razonamiento (thinking tokens) entre un 37% y un 55% según el benchmark, a cambio de una pérdida de precisión que varía desde unos pocos puntos en GPQA hasta 11 puntos en IFBench.

El modelo hereda la arquitectura del Hy4-flash original, un transformer con mezcla de expertos (MoE) de aproximadamente 144.761 millones de parámetros totales, y se distribuye como un checkpoint derivado de la versión NVFP4 de atakans (MLPs en NVFP4, tablas Engram en FP8 y el resto en BF16). La edición se aplica exclusivamente sobre los tensores `model.layers.{22,24,...,38}.mlp.shared_experts.down_proj.weight`, que se almacenan en BF16 y quedan excluidos de la cuantización NVFP4. Todo lo demás es idéntico byte a byte al checkpoint base.

Su relevancia es doble: por un lado, demuestra una técnica de control del razonamiento sin reentrenamiento; por otro, es un caso práctico de reducción de coste de inferencia en modelos de razonamiento, donde los thinking tokens dominan la factura. El estado es experimental (α = 0.1) y el propio autor advierte que la pérdida de precisión en código e instrucciones es estadísticamente significativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según tags del repo (`moe`, `hy_v4_flash`) |
| Parámetros totales | 144.761.604.413 (dato de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | 40.960 tokens en la configuración de ejemplo de vLLM (`--max-model-len 40960`) |
| Tipos de cuantización | NVFP4 (MLPs), FP8 (tablas Engram), BF16 (resto y tensores editados); GGUF Q4_K_M y SPARK-4Bit vía adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (`tencent-hy-license`) |
| Formato de pesos | safetensors (repo de 164,7 GB) y GGUF (adaptador LoRA de 167 KB sobre AngelSlim/Hy4-flash-GGUF) |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es un transformer MoE con shared experts, es decir, expertos que se ejecutan en todos los tokens además de los expertos enrutados. La edición aprovecha precisamente esa propiedad: una modificación de rango uno en la down-projection de un shared expert actúa como un vector de guiado constante compilado en los pesos, aplicado a cada token. La actualización tiene la forma `W ← W_bf16_original + α · n · d″ uᵀ / ‖u‖²` con α = 0.1, donde `d` es la dirección del flujo residual que separa los últimos 48 thinking tokens antes de `</think>` del resto del razonamiento (medida sobre 288 trazas de MATH-train nivel 5), `d″` corrige esa dirección para la post-normalización del FFN (`combine_output_norm`) y `u` es la entrada media a la down-projection en tokens de razonamiento. El incremento relativo es del 0,56–1,09% por capa.

No hay gradientes, ni datos de fine-tuning, ni RLHF/DPO en esta edición: la dirección, las capas y α se seleccionaron únicamente sobre el conjunto de entrenamiento de MATH, sin usar ningún benchmark de evaluación para la selección. El método sigue el trabajo de weight-space programming de Takehi et al. (2026) y la replicación con norma emparejada de Concept Country (2026). Como control, una edición aleatoria con la misma norma en las mismas capas produce +0,0 puntos de precisión y +8% de tokens, lo que indica que el ahorro proviene de la dirección y no de la perturbación. La respuesta a la dosis es monotónica: α = 0,05 → −23% de tokens; α = 0,075 → −32%; α = 0,1 → −40%; α = 0,3 → respuestas incorrectas; α = 1,0 → bucle en `</think>`.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con `reasoning_effort: high` validado en la configuración de evaluación.
- Razonamiento matemático: la edición se calibró sobre MATH-train, y el modelo mantiene un 89,8 de precisión en la pantalla de MATH frente a 92,2 del base.
- Razonamiento científico de nivel avanzado: GPQA Diamond con 88,6 frente a 91,2 del base.
- Generación de código: LiveCodeBench v6 con 78,3 frente a 84,6 del base (pérdida de 6,3 puntos).
- Seguimiento de instrucciones: IFBench con 66,0 frente a 76,7 del base (pérdida de 10,7 puntos).
- Soporte multimodal heredado del base (el ejemplo de despliegue limita `image` y `video` a 0, lo que sugiere que el modelo base admite visión; no se detalla el alcance).
- Parsing de razonamiento mediante `--reasoning-parser hy_v4` en vLLM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático de alto volumen con presupuesto ajustado: el modelo reduce los thinking tokens un 40,2% en la pantalla de MATH con solo 2,3 puntos de pérdida, por lo que resulta adecuado para pipelines de verificación matemática o generación de soluciones a gran escala donde el coste por consulta es el factor limitante.
- Evaluación científica automatizada: en GPQA Diamond mantiene 88,6 puntos con un 39,6% menos de tokens, lo que permite procesar más preguntas por GPU y hora en tareas de QA científico.
- Servicio de razonamiento en producción con SLA de latencia: al recortar los tokens de pensamiento de 5.448 a 3.291 en GPQA y de 8.564 a 5.409 en LiveCodeBench, el tiempo hasta la respuesta final se reduce de forma directa en despliegues vLLM con `--max-num-seqs 64`.
- Prototipado y experimentación con control del razonamiento: el adaptador LoRA GGUF de 167 KB permite aplicar o retirar la edición con `--lora-scaled ...:0.1` sobre los ficheros de AngelSlim/Hy4-flash-GGUF, lo que facilita comparar el modelo editado y el original en el mismo servidor llama.cpp.
- Despliegue en hardware de gama workstation: el adaptador GGUF está pensado para DGX Spark con builds SPARK-4Bit, de modo que un equipo de sobremesa puede ejecutar una variante del modelo con razonamiento abreviado.
- Investigación sobre edición de pesos: los tensores de dirección y los scripts en `edit/` permiten reproducir la edición, variar α o aplicar la técnica a otras capas y modelos, lo que lo convierte en material de estudio para weight-space programming.
- Tareas de instrucciones donde el coste domina sobre la precisión: con un 54,8% menos de tokens en IFBench, puede tener sentido en aplicaciones internas tolerantes a un 66,0 de cumplimiento estricto de instrucciones, nunca en productos donde el seguimiento exacto sea requisito.

## Benchmarks y rendimiento

Configuración: vLLM, comparación contra el base emparejado (las mismas nueve matrices en BF16 sin editar), thinking activado (`reasoning_effort: high`), temperatura 0,9, máximo 32k tokens, una H200. Δ emparejado por problema con IC bootstrap al 95%.

| Benchmark | Base | smart (α=0,1) | Δ precisión [IC 95%] | Δ thinking tokens [IC 95%] |
|---|---|---|---|---|
| GPQA Diamond (198 × 2) | 91,2 | 88,6 | −2,5 [−5,3; +0,3] | −39,6% [−43,3; −35,6] |
| LiveCodeBench v6 (175, 2025-01…04) | 84,6 | 78,3 | −6,3 [−12,0; −0,6] | −36,8% [−43,3; −30,3] |
| IFBench (300, loose) | 76,7 | 66,0 | −10,7 [−16,0; −5,3] | −54,8% [−58,3; −51,0] |
| 13 tareas de código/mates/ciencia × 3 (held-out) | 39/39 | 38/39 | −2,6 | −54,2% |
| MATH train screen (64 × 2) | 92,2 | 89,8 | −2,3 [−6,2; +0,8] | −40,2% [−47,8; −29,9] |

Tokens de pensamiento medios, base → smart: GPQA 5.448 → 3.291; LCB 8.564 → 5.409; IFBench 5.275 → 2.382; tareas held-out 5.415 → 2.482.

## Requisitos de hardware

- VRAM estimada: 97 GiB de pesos en GPU según el autor, con las tablas Engram en RAM del host. El repo completo ocupa 164,7 GB.
- GPU recomendadas: una H200 es la configuración de referencia del autor (1,5k tok/s agregados en decodificación con 100 peticiones concurrentes). Requiere imagen `vllm/vllm-openai:hy4-flash` y, para la carga de expertos NVFP4, el `model.py` del recetario `atakann/dgx-spark-recipes`.
- GPU consumer: no cabe en GPUs de consumo por el tamaño del checkpoint NVFP4/BF16; la vía práctica es el adaptador LoRA sobre GGUF Q4_K_M o SPARK-4Bit en DGX Spark (SM120), usando la imagen completa del recetario.
- Opciones de despliegue: vLLM (principal, con `--reasoning-parser hy_v4`) y llama.cpp / llama-server con `--lora-scaled hy4-flash-smart-lora.gguf:0.1`. No se mencionan TGI ni Ollama.
- Latencia y throughput: aproximadamente 1,5k tok/s agregados en decodificación con 100 peticiones concurrentes en una H200; no se publican cifras de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-smart (este) | 144,8B (MoE) | 40.960 | Thinking reducido 37–55%, con pérdida de precisión | Tencent Hy License 1.0 | Hugging Face (safetensors + LoRA GGUF) |
| tencent/Hy4-flash (base) | 144,8B (MoE) | no disponible | Thinking completo, mayor precisión | Tencent Hy License 1.0 | Hugging Face |
| atakans/Hy4-flash-NVFP4 | 144,8B (MoE) | no disponible | Idéntico al base, cuantizado NVFP4 | Tencent Hy License 1.0 | Hugging Face |
| AngelSlim/Hy4-flash-GGUF | 144,8B (MoE) | no disponible | Idéntico al base, formato GGUF | Tencent Hy License 1.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de otros autores para una comparación cruzada; la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La pérdida de precisión en código (−6,3 puntos en LiveCodeBench v6) y en seguimiento de instrucciones (−10,7 puntos en IFBench) es estadísticamente significativa con α = 0,1.
- La dirección se extrajo de un GGUF Q4_K_M del mismo modelo; los shared experts en Q8_0 difieren del BF16 en un 0,6%, lo que introduce incertidumbre en la fidelidad de la edición.
- La edición solo se ha probado con thinking activado; con `no_think` no está validada.
- Una sola forma de edición, un único conjunto de capas y una sola ejecución por benchmark: no hay réplicas que permitan estimar la varianza entre ejecuciones.
- El adaptador LoRA GGUF se validó en Q4_K_M, no en las builds SPARK-4Bit.
- En llama-server, las peticiones con distintos ajustes de LoRA por petición no se agrupan en lote, por lo que la escala debe fijarse globalmente.
- No se debe aumentar α: con α = 0,3 las respuestas son incorrectas y con α = 1,0 el modelo entra en bucle en `</think>`.
- Licencia Tencent Hy License 1.0: es necesario revisar sus términos antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada.
- Idiomas soportados: no disponible, lo que impide garantizar calidad multilingüe.
- Estado experimental: el autor está evaluando una edición más suave, por lo que el checkpoint puede quedar obsoleto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/hy4-flash-smart
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Checkpoint NVFP4 de partida: https://huggingface.co/atakans/Hy4-flash-NVFP4
- GGUF de referencia: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Recetario de despliegue (vLLM y DGX Spark): https://github.com/atakann/dgx-spark-recipes
- Scripts y tensores de dirección: carpeta `edit/` del repositorio del modelo
- Paper de referencia del método: Takehi et al., 2026 (weight-space programming); no se proporciona URL
- Replicación con norma emparejada: Concept Country, 2026; no se proporciona URL
