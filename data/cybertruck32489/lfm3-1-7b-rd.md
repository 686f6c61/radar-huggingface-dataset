# cybertruck32489/LFM3-1.7B-RD

## Resumen

LFM3-1.7B-RD es un modelo de lenguaje experimental de 1.696.306.760 parametros construido por el usuario cybertruck32489 a partir de LiquidAI/LFM3-1.7B, el modelo base de Liquid AI. La aportacion principal es una conversion arquitectonica que transforma las 24 capas del transformer tri-hibrido original en un sistema Prelude -> Shared Recurrent Core -> Coda, con un nucleo recurrente compartido que puede ejecutarse entre 1 y 32 veces por token. Esto permite asignar computo de forma adaptativa: menos pasos en tokens predecibles y mas en puntos de alta entropia o deducciones matematicas.

El modelo se presenta como un checkpoint de alineamiento continuado sobre el base, entrenado con mezclas de datasets de razonamiento (GSM8K, OpenMathReasoning, OpenCodeReasoning, hermes_reasoning_tool_use y varios datasets de destilacion de razonamiento). Hereda la ventana de contexto de 256K tokens del modelo original y un vocabulario de 128.000 tokens, con pesos en bfloat16 y licencia LFM Open License v1.0.

Es relevante ahora porque explora una via poco comun en modelos pequenos: el computo adaptativo por token mediante profundidad recurrente y controladores aprendidos, en lugar de escalar parametros o contexto. Para desarrolladores e investigadores interesados en eficiencia de inferencia y razonamiento iterativo, ofrece un caso practico de arquitectura con salida temprana y refinamiento Gauss-Seidel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm3RDForCausalLM` (Prelude + Shared Recurrent Core con Phase LoRAs + Coda); operadores Gated Short Convolutions, Sliding-Window GQA y Full Global GQA |
| Parametros totales | 1.696.306.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (heredada de LFM3-1.7B; alineada en ventanas de razonamiento/tool de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de las 24 capas de LFM3-1.7B, que se organizan como 5 repeticiones de un motivo de 4 capas `[FullAttention, ShortConv, SlidingWindowAttention, ShortConv]`. La conversion extrae un banco de operadores recurrentes compartido entre los 5 motivos y lo combina con adaptadores de bajo rango especificos de fase (`Lfm3SharedLoRALinear` y `Lfm3SharedGroupedLoRALinear` con 3 grupos para las proyecciones B, C y x de convolucion). Los bloques SwiGLU FFN permanecen como modulos de memoria especificos de cada fase. El layout resultante es de 2 capas Prelude, 5 fases Core de 4 capas (banco compartido mas LoRA) y 2 capas Coda.

Sobre el entrenamiento, la model card indica un "alineamiento continuado" del checkpoint base, pero no detalla el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO. Los datasets declarados son angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k, Jackrong/DeepSeek-V4-Distill-8000x, openai/gsm8k, nvidia/OpenMathReasoning, nvidia/OpenCodeReasoning, interstellarninja/hermes_reasoning_tool_use y GhettoGhostUSN/Fable-5.1-Max-Reasoning-Filtered-5000x. Entre las innovaciones tecnicas destacan: la salida temprana con completado FFN-Tail (`_complete_ffn_tail`) para T < 5, que recorre los FFN no visitados y actualiza caches via `update_cache_only`; las instantaneas canonicas de KV-cache con rollback (`_snapshot_phase_cache`, `_restore_phase_cache`) para evitar entradas duplicadas en `DynamicCache`; la inyeccion de feedback (`inject_feedback`) que reproyecta la diferencia residual `h_latent - prelude_out`; y un controlador de regresion de profundidad (`Lfm3RDController`) que predice la profundidad requerida `s_pred` en [0, 31] y la probabilidad de parada `p_ready`.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en 16 idiomas.
- Razonamiento iterativo con profundidad recurrente configurable (T de 1 a 32 pasos por token).
- Modo de computo adaptativo (`reasoning_mode="auto"`) con controlador aprendido que decide la profundidad por token.
- Presets manuales de esfuerzo: `low`, `fast`, `medium`, `high`, `max`.
- Razonamiento matematico y resolucion de problemas (entrenado sobre GSM8K y OpenMathReasoning).
- Generacion y razonamiento sobre codigo (entrenado sobre OpenCodeReasoning).
- Tool calling y function calling (entrenado sobre hermes_reasoning_tool_use).
- Razonamiento multi-paso con refinamiento iterativo y salida temprana.
- Capacidades multilingues en 16 idiomas: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede dedicar mas pasos recurrentes a los tokens de deduccion y menos a los de sintaxis, lo que resulta adecuado para resolver problemas de GSM8K y similares con un coste de computo variable segun la dificultad del paso.
- Generacion de codigo en pipelines de CI/CD: gracias al entrenamiento sobre OpenCodeReasoning y al soporte de tool calling, puede integrarse en flujos que requieran generar, revisar o completar codigo con llamadas a herramientas externas.
- Agentes conversacionales multi-turno: la ventana de 256K tokens permite mantener contexto largo en conversaciones, y el modo `auto` reduce el coste en turnos con tokens predecibles.
- Asistentes con function calling: el entrenamiento sobre hermes_reasoning_tool_use habilita la seleccion y estructuracion de llamadas a funciones en flujos de automatizacion.
- Investigacion en computo adaptativo: sirve como banco de pruebas para estudiar el equilibrio entre profundidad recurrente, latencia y calidad en decodificacion autoregresiva.
- Despliegue en entornos con presupuesto de computo variable: los presets `low`/`fast`/`medium`/`high`/`max` permiten ajustar la latencia por token segun la carga del servicio.
- Procesamiento de documentos largos multilingues: la ventana de 256K y los 16 idiomas soportados permiten resumir o extraer informacion de textos extensos en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye trazas cualitativas de profundidad recurrente por token, como el ejemplo de recall factual ("What is the capital of France?") con una profundidad media de 3,75 pasos por token frente a 5,0 de una pasada completa estandar, y la secuencia de pasos `[3, 3, 3, 2, 3, 5, 3, 3, 2, 13, 2, 3]`.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos (1.696.306.760 parametros x 2 bytes), mas overhead de caches KV/conv y activaciones; el repo ocupa 74,6 GB, lo que sugiere la presencia de multiples artefactos ademas de los pesos.
- En cuantizacion de 8 bits se estimarian unos 1,7 GB de pesos; en 4 bits, unos 0,85 GB, aunque no se documentan ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: no disponible de forma especifica; por tamano, una RTX 4090 (24 GB) o superior deberia acomodar el modelo en bfloat16 con contexto moderado. Para contexto completo de 256K se requeriria mayor memoria por el cache KV.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090, RTX 4080 y tarjetas con 12-16 GB en bfloat16 con contexto limitado; en 8 bits o 4 bits cabria en GPUs de 8 GB o menos, aunque sin cuantizaciones publicadas.
- Opciones de despliegue: transformers con `custom_code` (requerido por la arquitectura `Lfm3RDForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La profundidad recurrente variable (1 a 32 pasos por token) implica que el coste por token depende del modo y del contenido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-RD | 1.696.306.760 | 256K | Prelude + Shared Recurrent Core + Coda, profundidad 1-32 | LFM Open License v1.0 | Hugging Face, requiere `custom_code` |
| LiquidAI/LFM3-1.7B | no disponible | 256K | Transformer tri-hibrido de 24 capas | LFM Open License v1.0 | Hugging Face |
| Alternativas de ~1,7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre LFM3-1.7B-RD y su modelo base ni con otras alternativas de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint experimental de conversion arquitectonica; la model card lo describe como tal y no garantiza estabilidad en produccion.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) que permitan validar la calidad frente al modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad.
- La licencia LFM Open License v1.0 ("other") impone condiciones especificas; es necesario revisar el fichero LICENSE antes de cualquier uso comercial.
- Requiere `custom_code` y confianza en el codigo remoto del repositorio para cargarse en transformers, lo que anade superficie de riesgo en despliegues.
- El repo ocupa 74,6 GB, muy por encima del tamano de los pesos en bfloat16, lo que puede complicar la descarga y el almacenamiento.
- El controlador de profundidad y la salida temprana introducen comportamiento no determinista en el computo por token; la reproducibilidad exacta puede verse afectada.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La alineacion se realizo sobre ventanas de 2.048 tokens, aunque el contexto maximo sea de 256K; el rendimiento en contextos muy largos no esta validado.
- No hay cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cybertruck32489/LFM3-1.7B-RD
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio GitHub: https://github.com/cybertruck021/lfm3-rd
- Dataset angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k: https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k
- Dataset Jackrong/DeepSeek-V4-Distill-8000x: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
- Dataset nvidia/OpenMathReasoning: https://huggingface.co/datasets/nvidia/OpenMathReasoning
- Dataset nvidia/OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Dataset interstellarninja/hermes_reasoning_tool_use: https://huggingface.co/datasets/interstellarninja/hermes_reasoning_tool_use
- Dataset GhettoGhostUSN/Fable-5.1-Max-Reasoning-Filtered-5000x: https://huggingface.co/datasets/GhettoGhostUSN/Fable-5.1-Max-Reasoning-Filtered-5000x
