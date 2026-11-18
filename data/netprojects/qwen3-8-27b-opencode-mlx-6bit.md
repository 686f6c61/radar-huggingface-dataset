# netprojects/Qwen3.8-27B-opencode-MLX-6bit

## Resumen

Qwen3.8-27B-opencode-MLX-6bit es una cuantizacion en 6 bits para Apple Silicon del modelo Qwen3.8-27B, adaptado mediante LoRA y aprendizaje por refuerzo para funcionar como motor del agente de programacion OpenCode. El modelo base es Qwen3.8-27B, un transformer multimodal de 27.781.427.952 parametros (27,78 mil millones) desarrollado por Alibaba Qwen, que acepta entrada de texto e imagen. Sobre el se aplico un adaptador LoRA entrenado por harness-hub con AsyncGRPO en TRL, orientado a tareas de ingenieria de software y uso de terminal. Esta version concreta la publica el usuario netprojects, que fusiona el adaptador con el modelo base y lo convierte a MLX con mlx-vlm, incluyendo el encoder de vision y la capa de prediccion multi-token (MTP) de Qwen.

La relevancia de esta ficha esta en que empaqueta en 23,1 GB un modelo de 27,78 mil millones de parametros listo para ejecutarse en un Mac con Apple Silicon, con una fidelidad respecto a bf16 del 98,7 % en coincidencia del siguiente token y una divergencia KL de 0,0014. El adaptador mejora los resultados del modelo base en tareas de agente: segun los datos publicados por harness-hub, con el modo thinking desactivado, SWE-bench Pro (hard 51) pasa del 35,3 % al 51,0 % y Terminal-Bench 2.1 del 46,4 % al 52,4 %. Ademas, con thinking desactivado iguala al modelo base con thinking a maximo esfuerzo generando aproximadamente un sexto de los tokens, lo que reduce coste y latencia en produccion.

La licencia es Apache 2.0 y el formato de pesos es safetensors en formato MLX. El repositorio tiene 23,1 GB, cero descargas y cero likes en el momento de la consulta, y fue creado el 18 de noviembre de 2026. Se recomienda su uso con thinking desactivado, ya que el adaptador se entreno y evaluo en esa configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP; pesos en formato MLX |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afín (affine), grupo 64; existen builds de 4, 6, 8 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27,78 mil millones de parametros con capacidad multimodal de entrada (texto e imagen) y una capa de prediccion multi-token (MTP) propia de Qwen3.8-27B. El adaptador LoRA se entreno con aprendizaje por refuerzo, concretamente AsyncGRPO en TRL, sobre tareas de ingenieria de software y de terminal, con el objetivo de servir como motor del agente OpenCode. Segun la model card, el adaptador afecta a 256 modulos: q, k, v y o en las 16 capas de atencion completa, y gate, up y down en las 64 capas. La fusion se verifica elemento a elemento con la formula `W + 2.0 · B @ A` redondeada a bf16 y comparada contra un calculo independiente en float64.

Esta build concreta cuantiza las capas lineales a 6 bits en modo afín con grupo 64 y conserva el encoder de vision y la capa MTP de Qwen, esta ultima tambien cuantizada para coincidir con el resto del modelo. La capa MTP no la modifica el adaptador, por lo que es la cabeza MTP original de Qwen3.8-27B. El tokenizador y la plantilla de chat son los archivos de harness-hub sin cambios, con el mismo vocabulario y formato de tool calling que Qwen3.8-27B. La fidelidad de la cuantizacion se documenta con dos metricas: coincidencia del siguiente token respecto a bf16 del 98,7 % y divergencia KL de 0,0014.

## Capacidades

- Generacion de texto y razonamiento general, con modo thinking que puede activarse o desactivarse mediante la plantilla de chat.
- Generacion de codigo y resolucion de tareas de ingenieria de software, incluida la localizacion y correccion de fallos en repositorios y la ejecucion de comandos de terminal.
- Entrada de imagen (image-text-to-text): interpretacion de capturas de pantalla, imagenes de terminal y contenido visual combinado con instrucciones de texto.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Uso como agente multi-paso: el adaptador se entreno especificamente para el bucle de agente de OpenCode sobre tareas de software y terminal.
- Decodificacion especulativa mediante la capa MTP integrada, que puede usarse como modelo borrador con `--draft-model` y `--draft-kind mtp` en mlx-vlm, o con el drafter DSpine externo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de programacion en local sobre macOS: servir el modelo con `mlx_lm.server` y conectarlo a OpenCode mediante el proveedor compatible con OpenAI. El adaptador esta entrenado para ese bucle concreto, de modo que puede leer un repositorio, ejecutar tests y proponer parches sin enviar codigo a servicios externos.
- Correccion de fallos a partir de la salida de tests: el modelo puede recibir el contenido de `tests/test_parser.py` y el error de ejecucion, localizar la causa y generar el parche, que es exactamente el escenario de ejemplo de la model card.
- Automatizacion de tareas de terminal: dado que Terminal-Bench 2.1 sube del 46,4 % al 52,4 % con el adaptador, es adecuado para agentes que encadenan comandos de shell, inspeccionan ficheros y verifican resultados.
- Analisis de capturas de terminal o de pantalla: con mlx-vlm se puede pasar una imagen de una terminal con un error y preguntar que fallo muestra, util para asistencia en depuracion sin copiar texto manualmente.
- Asistente de codigo en el editor con requisitos de privacidad: al ejecutarse integramente en un Mac con Apple Silicon y pesos de 23,1 GB, permite mantener el codigo dentro de la maquina, algo relevante en entornos con restricciones de confidencialidad.
- Generacion de codigo en pipelines de CI/CD autoalojados: el servidor compatible con OpenAI permite integrarlo con herramientas que ya hablan ese protocolo, con tool calling para consultar el estado del repositorio o lanzar comandos.
- Prototipado de agentes con decodificacion especulativa: usar el drafter DSpine o la capa MTP para reducir latencia en tareas de generacion larga, midiendo antes el impacto real, ya que en la build de 6 bits la MTP apenas aporta mejora con mlx-vlm 0.7.11.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador frente al modelo base, con OpenCode y thinking desactivado:

| Benchmark | Modelo base | Con adaptador opencode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de la cuantizacion respecto a bf16:

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| 4 bits | 16,3 GB | 96,7 % | 0,0203 |
| 6 bits (esta build) | 23,1 GB | 98,7 % | 0,0014 |
| 8 bits | 30,0 GB | 99,2 % | 0,0004 |
| bf16 | 55,6 GB | referencia | referencia |

Velocidad de decodificacion medida en un MacBook Pro M5 Max de 128 GB (greedy, thinking off, 5 prompts de 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con otros servicios en ejecucion, por lo que son indicativas):

| Build | Sin especulacion | MTP con mlx-vlm 0.7.11 |
|---|---|---|
| 4 bits | 33 tok/s | 62 tok/s (x1,91) |
| 6 bits | 20 tok/s | 21 tok/s (x1,04) |
| 8 bits | 17 tok/s | 37 tok/s (x2,15) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 23,1 GB de pesos en 6 bits, mas overhead de ejecucion; se recomienda un Mac con al menos 32 GB de memoria unificada, y 48 GB o mas para trabajar con contexto largo o con el modelo borrador cargado en paralelo.
- GPU: disenado para Apple Silicon mediante MLX; no es un build para CUDA. No se han publicado requisitos para A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo de Apple: el rendimiento documentado se midio en un MacBook Pro M5 Max de 128 GB. No hay datos para chips de gama inferior.
- Despliegue: mlx-lm (servidor compatible con OpenAI) para texto y tool calling; mlx-vlm para entrada de imagen; el drafter DSpine con dspine-hybrid-mlx para decodificacion especulativa. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este build MLX.
- Latencia y throughput: 20 tok/s en decodificacion simple y 21 tok/s con MTP en la build de 6 bits sobre M5 Max, segun las mediciones indicadas. El 8 bits alcanza 17 tok/s simples y 37 tok/s con MTP; el 4 bits, 33 y 62 tok/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-MLX-6bit | 27,78 mil millones | no disponible | 6 bits MLX | Apache 2.0 | Hugging Face, MLX |
| netprojects/Qwen3.8-27B-opencode-MLX-8bit | 27,78 mil millones | no disponible | 8 bits MLX | Apache 2.0 | Hugging Face, MLX |
| netprojects/Qwen3.8-27B-opencode-MLX-4bit | 27,78 mil millones | no disponible | 4 bits MLX | Apache 2.0 | Hugging Face, MLX |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,78 mil millones | no disponible | adaptador LoRA | Apache 2.0 | Hugging Face |

Frente a la build de 8 bits, la de 6 bits ocupa 6,9 GB menos (23,1 frente a 30,0 GB) a costa de bajar del 99,2 % al 98,7 % de coincidencia del siguiente token. Frente a la de 4 bits, ocupa 6,8 GB mas pero mejora la fidelidad del 96,7 % al 98,7 % y reduce la KL de 0,0203 a 0,0014. Frente al adaptador original, esta build ya incorpora la fusion del LoRA y la cuantizacion, por lo que no requiere aplicar el adaptador por separado. No se dispone de datos para comparar con otros modelos de la misma categoria fuera de la familia Qwen3.8.

## Limitaciones y advertencias

- El adaptador se entreno y evaluo con thinking desactivado; la model card indica explicitamente que se mantenga asi. Usarlo con thinking activado puede degradar el comportamiento esperado.
- La decodificacion especulativa con MTP no aporta mejora real en la build de 6 bits con mlx-vlm 0.7.11 (x1,04); conviene usar el drafter DSpine si se busca velocidad.
- Con decodificacion greedy, la verificacion por lotes de la decodificacion especulativa puede redondear de forma distinta en empates cercanos, por lo que respuestas largas pueden divergir ligeramente del texto generado sin especulacion.
- La cuantizacion a 6 bits introduce una divergencia pequena pero no nula respecto a bf16 (98,7 % de coincidencia, KL 0,0014); para maxima fidelidad existe la build de 8 bits o bf16.
- Solo esta disponible para Apple Silicon mediante MLX; no hay pesos GGUF ni soporte documentado para CUDA, vLLM, llama.cpp, Ollama o TGI.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion especifico, idiomas soportados ni longitud de contexto en la documentacion proporcionada.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta; es una publicacion reciente sin validacion comunitaria.
- Las mediciones de velocidad se tomaron con otros servicios en ejecucion en la maquina, por lo que el propio autor las califica de indicativas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador de harness-hub antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-6bit
- Modelo base adaptado: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-bf16
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- OpenCode: https://opencode.ai
