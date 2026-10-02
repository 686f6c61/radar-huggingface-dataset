# octolix/Qwen3.8-Flash-Next-Octojet-NVFP4

## Resumen

octolix/Qwen3.8-Flash-Next-Octojet-NVFP4 es un checkpoint cuantizado del modelo multimodal Qwen3.8 Flash Next de Qwen, empaquetado por octolix para su motor de inferencia Octojet y dimensionado para ejecutarse en una sola NVIDIA DGX Spark (GB10). El modelo base es una mezcla de expertos (MoE) de lenguaje y visión con atención híbrida GDN + QSA, 6 000 millones de parámetros activos por token, 262 144 tokens de contexto nativo y una cabeza MTP para decodificación especulativa. El repositorio de octolix declara 58 968 096 659 parámetros en safetensors y ocupa 106,4 GB.

La particularidad de este release es la combinación de formatos: los expertos enrutados están en NVFP4 nativo, que los tensor cores de GB10 computan directamente, mientras que atención, DeltaNet, routers, embeddings, tablas n-gram y cabezas están en affine 4-bit de MLX, y la torre de visión permanece en punto flotante. Esa mezcla no la cargan vLLM, SGLang ni Transformers, de modo que el checkpoint es exclusivo de Octojet 0.1.0.

Su interés para quien evalúa modelos es doble. Por un lado, demuestra que un MoE multimodal con 262 144 tokens de contexto puede servirse en un único equipo con memoria unificada, manteniendo tres conversaciones simultáneas con entrada de imagen. Por otro, publica comparativas reproducibles frente a los checkpoints NVFP4 de local-inference-lab y RadixArk sobre TensorFold 0.6, con ventajas medidas en reutilización de prefijo y en decodificación en modo greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida GDN (Gated DeltaNet) + QSA, torre de visión y cabeza MTP (multi-token prediction) |
| Parametros totales | 58 968 096 659 (~59 B) segun los safetensors de este repositorio. El modelo base se describe como 125 B de parámetros de lenguaje más 51 B de parámetros de embeddings n-gram |
| Parametros activos | 6 B por token |
| Longitud de contexto | 262 144 tokens nativos; el checkpoint sirve 3 conversaciones simultáneas de hasta 262 144 tokens cada una |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 (valores E2M1, escalas de bloque FP8 cada 16 elementos, escala global FP32); atención, DeltaNet, routers, embeddings, tablas n-gram, cabeza y cabeza MTP en affine 4-bit de MLX con grupos de 32; torre de visión en punto flotante; expertos compartidos en bf16 en disco, empaquetados a NVFP4 durante la carga |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors, más octojet.json y tablas n-gram; solo cargable con el motor Octojet |

## Arquitectura y entrenamiento

El modelo base Qwen3.8 Flash Next es un MoE de lenguaje y visión que combina dos mecanismos de atención en una arquitectura híbrida GDN + QSA, según la documentación oficial de QwenLM. El repositorio de octolix desglosa los componentes en atención, DeltaNet, routers, embeddings, tablas n-gram, cabeza de salida, cabeza MTP y torre de visión, con 48 capas de expertos enrutados y 512 expertos por capa. La cabeza MTP es la que habilita la decodificación especulativa del motor, y la ventana nativa es de 262 144 tokens.

Este release concreto es una conversión, no un reentrenamiento: la model card afirma explícitamente que no se reentrenó ni recuantizó ningún peso. Los expertos enrutados proceden de RadixArk/Qwen3.8-Flash-Next-NVFP4 (revisión 7b719225) copiados byte a byte; los expertos compartidos vienen de la misma revisión de RadixArk, aunque en este repositorio se almacenan en bf16 y se empaquetan a NVFP4 al cargar; y el resto de tensores (atención, DeltaNet, routers, embeddings, tablas n-gram, cabeza, cabeza MTP y torre de visión) procede de Vontra/Qwen3.8-Flash-Next-MLX-4bit-MTP (revisión 2b170fa6), también copiado byte a byte. El script engine/tools/build_release_checkpoint.py genera el checkpoint y octojet.json registra ambas fuentes y revisiones. No se publican detalles sobre el dataset de entrenamiento, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de hasta 262 144 tokens y tres conversaciones concurrentes en una sola GPU.
- Entrada de imágenes: el pipeline declarado es image-text-to-text y el servidor se arranca con el flag --vision, apoyándose en una torre de visión que se mantiene en punto flotante.
- Razonamiento y matemáticas: resuelve 245 de 250 problemas de GSM8K en la configuración medida por el autor.
- Generación de código: 155 de 164 programas correctos en HumanEval pass@1 en la misma configuración.
- Trabajo estilo agente: la model card lo posiciona como la configuración más rápida medida para flujos con prompts largos, turnos de seguimiento y decodificación con draft; un paso de agente de +5 000 tokens tarda 11,8 s (mediana de 3).
- Tool calling y function calling: el modelo base se describe en Jetson AI Lab como un MoE de visión-lenguaje orientado a razonamiento, código y uso de herramientas. La model card de este checkpoint no documenta un formato de herramientas propio.
- Reutilización de prefijo: un prompt que comparte 69 000 de 71 000 tokens se procesa en 3,2 s (run 1) o 4,9 s (run 2), y el reenvío exacto del mismo prompt cae a 0,12 s.
- Decodificación especulativa integrada mediante la cabeza MTP, con verificación de que toda respuesta con draft coincide con la decodificación serie con los mismos ajustes.
- Servidor con API compatible con OpenAI en http://127.0.0.1:8080/v1.
- Cobertura multilingüe: no disponible. No se declaran idiomas soportados ni evaluación multilingüe.

## Casos de uso

- Agente de código sobre repositorios completos: con 262 144 tokens de contexto se puede cargar un árbol de ficheros, su historial de issues y la documentación en un solo prompt, y generar parches con una decodificación de 64,0 tok/s en modo muestreado y 55,4 tok/s en greedy.
- Asistencia al cliente multi-turno: la reutilización de prefijo (3,2 s para 69 000 tokens compartidos en el run 1) permite mantener un system prompt extenso con políticas, catálogo y tono de marca sin repagar el coste de prefill en cada turno.
- Procesamiento de documentos con imágenes: al aceptar image-text-to-text, es adecuado para extraer datos de facturas escaneadas, informes con gráficos o capturas, combinando la torre de visión con el contexto largo para procesar lotes de páginas en una sola llamada.
- Generación y revisión de código en CI/CD: el servidor expone una API compatible con OpenAI y obtiene 155/164 en HumanEval pass@1, lo que permite integrarlo como paso de revisión automática o generación de tests sobre un runner con GPU Blackwell.
- Tutoría y resolución de problemas matemáticos: los 245 aciertos sobre 250 problemas de GSM8K lo sitúan como opción viable para asistentes educativos que necesitan mostrar el desarrollo paso a paso.
- Asistentes on-premise con datos sensibles: al ejecutarse en una sola máquina sin tensor parallelism y sin dependencia de servicios externos, encaja en entornos con requisitos de soberanía de datos, siempre que se cumpla la cláusula de licencia sobre oferta como servicio.
- Investigación en cuantización: el repositorio documenta cada fuente y revisión de tensor, lo que permite reproducir las comparativas NVFP4 frente a affine 4-bit y estudiar el impacto del empaquetado de expertos compartidos en la precisión.
- Análisis de conversaciones o documentación técnica extensa: con 262 144 tokens de ventana se pueden resumir transcripciones largas, contratos o manuales completos sin trocear el contenido y sin perder referencias cruzadas.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre una única DGX Spark (GB10), caché KV int8, tres flujos, solo texto y la GPU en exclusiva. El run 1 compara los tres setups en una misma sesión; el run 2 enfrenta a Octojet con el setup upstream más rápido.

Run 1 (1 de octubre de 2026):

| Medida | Octojet | TensorFold 0.6 + local-inference-lab | TensorFold 0.6 + RadixArk |
|---|---:|---:|---:|
| Primer token, prompt en frío de 128k tokens | 68,9 s | 89,5 s | 96,0 s |
| Primer token, prompt en frío de 210k tokens | 117,9 s | 152,3 s | 166,4 s |
| Primer token, prompt en frío de 71k tokens | 32,4 s | 46,1 s | 52,6 s |
| Reutilización de 69k de esos 71k tokens | 3,2 s | 47,4 s | 50,0 s |
| Paso de seguimiento de agente, +5k tokens (mediana de 3) | 11,8 s | 14,9 s | 22,0 s |
| Decodificación, chat, muestreado | 62,0 tok/s | 42,0 tok/s | 31,4 tok/s |
| Decodificación, código, muestreado | 64,0 tok/s | 50,5 tok/s | 40,4 tok/s |
| Decodificación, chat, greedy | 89,6 tok/s | 40,2 tok/s | 35,1 tok/s |
| Decodificación, código, greedy | 55,4 tok/s | 51,2 tok/s | 43,4 tok/s |
| Memoria estimada al arranque | 87,2 GiB | 81,1 GiB | 97,4 GiB |

Run 2 (1-2 de octubre de 2026):

| Medida | Octojet | TensorFold 0.6 + local-inference-lab |
|---|---:|---:|
| Primer token, prompt en frío de 32k tokens | 18,2 s | 19,8 s |
| 71k, después prompt que comparte 69k, después reenvío del 71k | 37,8 / 4,9 / 0,12 s | 45,6 / 45,6 / 0,18 s |
| GSM8K, 250 problemas (aciertos) | 245 | 246 |
| HumanEval pass@1, 164 programas | 155 | 158 |

Notas del propio autor: la corrección del reenvío hizo más lento el prompt con prefijo compartido (de 3,2 s a 4,9 s) a cambio de mantener el prompt anterior reutilizable al instante. El checkpoint de local-inference-lab consume unos 6 GiB menos de memoria y su destilación consciente de la cuantización acierta 3 programas más de HumanEval, diferencia que el autor considera dentro del ruido para 164 muestras. Las cifras de velocidad y precisión se midieron sobre la build de producción de Octojet, cuyos expertos compartidos provienen de una copia derivada de FP8 de la misma revisión de RadixArk; este repositorio contiene los expertos compartidos en bf16.

## Requisitos de hardware

- Memoria: la estimación de arranque publicada es de 87,2 GiB, superior a los 81,1 GiB del checkpoint de local-inference-lab y por debajo de los 97,4 GiB del de RadixArk. Está pensado para la memoria unificada de una DGX Spark (GB10, sm121, ~121-128 GB).
- GPU recomendadas: NVIDIA DGX Spark (GB10). El autor indica que otras GPU Blackwell con memoria suficiente deberían funcionar, pero no están probadas.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy por debajo de los 87 GiB requeridos. No hay variantes GGUF publicadas en el repositorio.
- Sin paralelismo de tensores: este checkpoint no lo soporta, de modo que no se puede repartir entre varias GPU para reducir la memoria por dispositivo.
- Despliegue: exclusivamente Octojet 0.1.0. El comando documentado es `octojet serve octolix/Qwen3.8-Flash-Next-Octojet-NVFP4 --kv-dtype int8 --parallel 3 --vision`. vLLM, SGLang y Transformers no cargan esta combinación de NVFP4, affine 4-bit de MLX y tablas n-gram; para esos motores hay que usar los checkpoints equivalentes en NVFP4 puro (nvidia, local-inference-lab, RadixArk o la receta de starkweatherdigital).
- Arranque: el primer inicio empaqueta las tablas de expertos y tarda varios minutos; los arranques posteriores, con la caché ya generada, rondan los 150 s.
- Latencia y throughput: primer token de 18,2 s con 32 000 tokens de prompt en frío y 0,12 s para el reenvío idéntico del mismo prompt; decodificación entre 55,4 y 89,6 tok/s según tarea y modo de muestreo; paso de agente de +5 000 tokens en 11,8 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido | Licencia | Motor |
|---|---|---|---|---|---|
| octolix/Qwen3.8-Flash-Next-Octojet-NVFP4 | ~59 B almacenados en safetensors (base descrito con 125 B + 51 B n-gram) | 262 144 tokens | 62,0 tok/s chat muestreado; 245/250 GSM8K; 155/164 HumanEval | qwen-community-license-1.0 | Octojet 0.1.0 |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4 | no disponible | 262 144 tokens (modelo base) | 42,0 tok/s chat muestreado; 246/250 GSM8K; 158/164 HumanEval; 81,1 GiB al arranque | no disponible | TensorFold 0.6 / vLLM |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | no disponible | 262 144 tokens (modelo base) | 31,4 tok/s chat muestreado; 97,4 GiB al arranque | no disponible | TensorFold 0.6 |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible | 262 144 tokens (modelo base) | no disponible | no disponible | vLLM |

La receta de starkweatherdigital publica una cuantización NVFP4 de 109 GB que funciona sobre vLLM en una única GPU de 121 GB, también construida y probada en una DGX Spark. Frente a ella, el checkpoint de octolix prioriza la reutilización de prefijo y la decodificación con draft, a costa de depender de un motor propio.

## Limitaciones y advertencias

- Exclusivo de Octojet: vLLM, SGLang y Transformers no cargan esta combinación de formatos. Adoptar el checkpoint implica adoptar el motor.
- Una sola GPU: no hay soporte de paralelismo de tensores para este checkpoint, así que no se puede escalar memoria repartiendo el modelo.
- Solo validado en GB10. Otras GPU Blackwell con memoria suficiente no están probadas.
- Mayor consumo de memoria que la alternativa de local-inference-lab (87,2 GiB frente a 81,1 GiB), unos 6 GiB más.
- La cabeza MTP de draft se queda en affine 4-bit, de modo que la ganancia de la decodificación especulativa depende de la tasa de aceptación de los borradores.
- Idiomas soportados: no disponible. No hay evaluación multilingüe publicada, por lo que el comportamiento fuera del inglés es incierto.
- Sesgos y alucinación: no se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinación en la información disponible. Como cualquier modelo generativo, requiere verificación humana en dominios sensibles.
- Licencia: Qwen Community License 1.0, heredada de Qwen3.8 Flash Next. La cláusula 2 exige una licencia adicional de Qwen para quien ofrezca el modelo como servicio, lo que condiciona su uso comercial en modalidades de API gestionada.
- Repositorio con tracción mínima: 9 descargas y 0 likes en el momento de la consulta, creado el 2 de octubre de 2026. Conviene validar la reproducibilidad de los benchmarks antes de llevarlo a producción.
- Primer arranque lento (varios minutos) por el empaquetado de las tablas de expertos; planificar el despliegue con la caché ya generada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/octolix/Qwen3.8-Flash-Next-Octojet-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de Qwen3.8 Flash Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Motor de inferencia Octojet: https://github.com/octolixai/octojet
- Tablas y scripts de benchmarks de Octojet: https://github.com/octolixai/octojet/blob/main/docs/benchmarks.md
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Receta NVFP4 para vLLM en una sola GPU: https://github.com/starkweatherdigital/qwen3.8-flash-next-nvfp4-recipe
- Ficha del modelo en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-flash-next/
- Fuente de los expertos enrutados y compartidos: RadixArk/Qwen3.8-Flash-Next-NVFP4 (revisión 7b719225), referenciada en la model card
- Fuente de atención, DeltaNet, routers, embeddings, tablas n-gram y cabezas: Vontra/Qwen3.8-Flash-Next-MLX-4bit-MTP (revisión 2b170fa6), referenciada en la model card
