# jgamboa/Qwen3.6-27B-NInfer-4090

## Resumen

Qwen3.6-27B-NInfer-4090 es un artefacto de pesos cuantizados del modelo Qwen/Qwen3.6-27B (revision `6a9e13bd`), desarrollado por el equipo Qwen y convertido por el usuario jgamboa al formato propietario `.ninfer` del motor de inferencia NInfer. No se trata de un modelo nuevo, sino de un empaquetado optimizado para ejecutarse exclusivamente en una NVIDIA RTX 4090 (`sm_89`) bajo Windows, mediante una build especifica del motor publicada en el repositorio JGamboa/ninfer-4090-windows. El archivo incluye en un unico fichero los pesos de texto, vision y la cabeza MTP (multi-token prediction) usada para decodificacion especulativa.

El problema que resuelve es el de servir un modelo multimodal de 27B en una GPU de consumo con 24 GB de VRAM, algo imposible en BF16 (que requeriria del orden de 54 GB solo para pesos). Para ello aplica cuantizacion mixta Q4/Q5 en las capas de texto, Q6 en embedding y cabeza de salida, y permite que las GEMM de prefill cuantizen sus activaciones a int8 (`AllowA8`). El resultado ocupa 16,1 GiB en disco y 15,8 GiB en GPU.

Es relevante ahora porque demuestra una ruta practica de despliegue local de un modelo grande con vision y tool calling en hardware de consumo, con decodificacion especulativa via MTP que alcanza 125,8 tok/s en decodificacion y 2,757 tokens por ronda especulativa con una tasa de aceptacion del 58,3 %. La contrapartida es una portabilidad nula: el fichero no carga en llama.cpp, vLLM ni Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision) con cabeza MTP para decodificacion especulativa; detalles de capas y atencion del modelo base no disponibles |
| Parametros totales | 27B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 100.000 tokens configurados en el ejemplo de servicio (`--max-context 100000`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4/Q5 en capas de texto, Q6 en embedding y cabeza de salida, Q8 en `mtp/input_projection`, activaciones de prefill en int8 (`AllowA8`), KV cache en `rk4v4-e8` |
| Idiomas soportados | no disponible (la model card no enumera idiomas; se mencionan evaluaciones en ingles, chino y espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (propietario del motor NInfer); no compatible con safetensors, GGUF ni otros formatos estandar |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.6-27B, un transformer multimodal de la familia Qwen 3.6 que procesa entradas de imagen y texto y genera texto. La model card no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni composicion del dataset de entrenamiento, por lo que esos datos deben consultarse en la ficha del modelo base. Lo que si se documenta es la presencia de una cabeza MTP (multi-token prediction) integrada, que actua como drafter interno para decodificacion especulativa.

La innovacion tecnica de este artefacto es la receta de conversion `qwen3_6_27b_a8_mtp_q4q5`, que en 119 segundos sobre CUDA produce un unico fichero con los componentes `text`, `vision` y `mtp`. Las capas de texto usan una mezcla Q4/Q5, el embedding y la cabeza de salida se mantienen en Q6, y `mtp/input_projection` en Q8 para preservar calidad en el borrador especulativo. Ademas, las GEMM de prefill pueden cuantizar activaciones a int8, lo que acelera la fase de prefill en una tarjeta limitada por ancho de banda. No se incluye el drafter DFlash2 porque el publicado esta entrenado para Qwen3.8. No hay informacion sobre RLHF, DPO ni volumen de tokens de entrenamiento en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento, con modo "thinking" activable (la model card reporta 93,3 % en AIME 2026 y 86,9 % en GPQA-Diamond medidos por upstream con esta representacion en una RTX 5090).
- Procesamiento de imagen y texto (`image-text-to-text`): el fichero incluye los pesos de vision.
- Tool calling y function calling: la evaluacion `tools.eval` con 45 tareas deterministas da 43/45 con thinking desactivado.
- Salida estructurada en JSON, evaluada junto al tool calling en el mismo conjunto de tareas.
- Razonamiento multi-paso y agentes: soporta cadenas largas de pensamiento (hasta 20.000 tokens en las pruebas reportadas).
- Capacidades multilingues: se evalua en ingles, chino y espanol, aunque no se publica la lista completa de idiomas.
- Decodificacion especulativa nativa via MTP con `--lm-head-draft` y `--ngram chain`.
- API compatible con OpenAI y Anthropic en `http://127.0.0.1:8080/v1`, con monitor en vivo en `/monitor`.

## Casos de uso

- Asistente local multimodal en estacion de trabajo: con 15,8 GiB de pesos en una RTX 4090 queda margen para KV cache de hasta 100.000 tokens, lo que permite conversaciones largas con imagenes intercaladas sin salir del equipo.
- Automatizacion de agentes con tool calling: los 43/45 en `tools.eval` y la API compatible con OpenAI permiten integrarlo en frameworks de agentes existentes sin adaptadores propietarios, siempre que se ejecute sobre NInfer.
- Procesamiento de documentos largos: el prefill exacto en pruebas needle de 64K tokens en 14,9 segundos hace viable resumir o extraer informacion de contratos, manuales o informes extensos.
- Generacion de codigo y tareas de matemáticas: el rendimiento en AIME 2026 (93,3 %) y GPQA-Diamond (86,9 %) reportado por upstream lo situa como opcion para asistencia tecnica con verificacion, aunque con thinking activado consume aproximadamente 3,3 veces mas tokens por respuesta.
- Analisis de imagenes en local para sectores con requisitos de privacidad: al no requerir conexion externa, encaja en flujos donde no se pueden enviar capturas o documentos a APIs en la nube.
- Evaluacion e investigacion de tecnicas de cuantizacion: el fichero de conversion (`.conversion.json`) documenta fuentes, formatos y permisos, lo que facilita reproducir la receta y comparar mezclas Q4/Q5/Q6 frente a BF16.
- Servicio de inferencia de baja concurrencia: con `--max-concurrency 3` y 125,8 tok/s en decodificacion, es adecuado para uso individual o equipos pequenos, no para alta concurrencia.

## Benchmarks y rendimiento

Mediciones del autor en RTX 4090 a frecuencias de stock, sin monitor conectado, Windows 11 y CUDA 13.4, el 2026-10-11, comparando contra `qwen3_8_27b_a8_mtpq4q5.ninfer` en el mismo binario:

| Medicion | Qwen3.6 | Qwen3.8 |
|---|---:|---:|
| Decodificacion, seis prompts, MTP 3, `--lm-head-draft`, greedy, sin thinking | 125,8 tok/s | 120,9 tok/s |
| Aceptacion MTP / tokens por ronda | 58,3 % / 2,757 | 56,1 % / 2,685 |
| Needle de 8K / 64K tokens, prefill (rk4v4-e8) | 1,4 s / 14,9 s, exacto | 1,4 s / 14,7 s, exacto |
| `tools.eval`, 45 tareas deterministas, sin thinking | 43/45 | 44/45 |
| Seis problemas dificiles, con thinking, muestreo, 3 semillas, hasta 20.000 tokens | 14/18, 204.307 tokens | 18/18, 62.059 tokens |
| Perplejidad rapida, cuatro corpus (KV en bf16) | 7,1294 | 4,7944 |

La diferencia de perplejidad se concentra en el dominio de referencia en chino (26,51 frente a 6,78); en ingles de formato largo Qwen3.6 obtiene 6,80 frente a 7,18 de Qwen3.8. El autor lo atribuye a diferencias entre modelos, no a una perdida uniforme de cuantizacion. No se publican resultados propios de MMLU, HumanEval o GSM8K para este artefacto.

## Requisitos de hardware

- VRAM: 15,8 GiB de pesos en GPU; el resto de los 24 GB de la RTX 4090 queda para KV cache y buffers. Con `--kv-capacity 100000` y `rk4v4-e8` el ejemplo de la model card esta pensado para caber en esa tarjeta.
- GPU soportada: exclusivamente NVIDIA RTX 4090 (`sm_89`). No se documenta soporte para A100, H100, RTX 3090, RTX 5090 ni otras arquitecturas con este fichero concreto.
- GPU de consumo: si, cabe en una RTX 4090. En tarjetas de 24 GB de generaciones anteriores o en modelos de 16 GB no hay garantia ni soporte declarado.
- Sistema operativo: Windows 11 con CUDA 13.4, usando la build de JGamboa/ninfer-4090-windows (rama `main`).
- Despliegue: solo `ninfer-serve.exe`. No carga en llama.cpp, vLLM, TGI, Ollama ni Transformers.
- Throughput: 125,8 tok/s en decodificacion con MTP 3 y greedy; prefill de 1,4 s para 8K tokens y 14,9 s para 64K tokens; concurrencia maxima configurada de 3 en el ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-NInfer-4090 (este) | 27B | hasta 100K configurado | `.ninfer` / NInfer, solo RTX 4090 | Apache 2.0 | 125,8 tok/s, 43/45 en tools.eval, perplejidad 7,1294 |
| Qwen3.8-27B-NInfer-4090 | 27B | no disponible | `.ninfer` / NInfer | Apache 2.0 | 120,9 tok/s, 44/45 en tools.eval, 18/18 con thinking, perplejidad 4,7944; mismo autor y motor |
| Qwen/Qwen3.6-27B (BF16) | 27B | no disponible | safetensors / Transformers, vLLM | Apache 2.0 | Referencia sin cuantizar; requiere aproximadamente 54 GB de VRAM solo para pesos, no cabe en consumer GPU |

## Limitaciones y advertencias

- Portabilidad nula: el fichero solo funciona con la build concreta de NInfer para Windows y RTX 4090; no es utilizable en entornos Linux, en GPUs de centro de datos ni con herramientas estandar.
- Dependencia de un unico mantenedor y de una rama concreta (`main`) de un repositorio personal; no hay garantia de soporte a largo plazo ni de compatibilidad futura.
- Con thinking activado el modelo consume aproximadamente 3,3 veces mas tokens por respuesta que Qwen3.8 y rinde peor en problemas dificiles (14/18 frente a 18/18), por lo que el autor mantiene Qwen3.8 como predeterminado en su release.
- Perplejidad notablemente peor en dominio chino (26,51 frente a 6,78), lo que desaconseja su uso para tareas en ese idioma frente a la alternativa del mismo autor.
- Riesgo de alucinacion inherente a los modelos generativos; no se publican evaluaciones de fidelidad ni de sesgo.
- Sin datos publicados sobre sesgos, idiomas soportados de forma oficial ni comportamiento fuera de los conjuntos de evaluacion del autor.
- La licencia Apache 2.0 del modelo base se mantiene, pero el formato `.ninfer` y el motor NInfer son componentes de terceros cuyo regimen de uso conviene verificar antes de un despliegue comercial.
- Los benchmarks proceden de un unico equipo, una unica configuracion y una sola sesion de medicion; no hay replicacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgamboa/Qwen3.6-27B-NInfer-4090
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio del motor para RTX 4090: https://github.com/JGamboa/ninfer-4090-windows
- Documentacion de metodos y resultados: https://github.com/JGamboa/ninfer-4090-windows/blob/main/WINDOWS_PORT.md
- Release precompilada para Windows: https://github.com/JGamboa/ninfer-4090-windows/releases/latest
- Motor NInfer original: https://github.com/Neroued/ninfer
- Artefacto equivalente de Qwen3.8: https://huggingface.co/jgamboa/Qwen3.8-27B-NInfer-4090
- Claude Code: https://claude.com/claude-code
