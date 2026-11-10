# aikexue170/rewrite3-4b-exp-nvfp4

## Resumen

rewrite3-exp-4B es un modelo de reescritura de texto narrativo en chino, desarrollado por el usuario aikexue170, especializado en transformar prosa generada por IA (AIGC) en texto que se lea como escrito por una persona. El modelo parte de la base Qwen3.5-4B, se afina mediante LoRA SFT y se fusiona, e incorpora un modo de razonamiento (cadena de pensamiento, CoT) entrenado de forma nativa: primero analiza el texto frase a frase (detecta patrones de "estilo AIGC", asigna una puntuación de "maldad" a cada frase y planifica la edición) y después emite la versión reescrita.

La versión aquí descrita es un lote experimental (sufijo `exp`) que precede a la versión oficial de rewrite3 y que no recibirá más actualizaciones. La tarea de esta variante es la "modalidad de acortamiento": el modelo comprime el texto de entrada a un rango de 0,4 a 1,0 veces su longitud original (mediana en torno a 0,7), porque la prosa AIGC suele estar inflada. Los pesos publicados en este repositorio son una cuantización ModelOpt NVFP4 W4A4 (calibrada con AWQ) en un único archivo, con la cabeza MTP (multi-token prediction) conservada en bf16 para decodificación especulativa.

El modelo cuenta con 4.660.291.072 parámetros totales y un tamaño de repositorio de 4,2 GB. Está pensado para el sector de la novela web china: editores y autores que quieren pasar un borrador generado por IA por un primer filtro de estilo antes de la revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con cabeza MTP para decodificación especulativa |
| Parametros totales | 4.660.291.072 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de despliegue recomendada con `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 W4A4 (ModelOpt, calibración AWQ); cabeza MTP en bf16 |
| Idiomas soportados | no disponible (el contenido de la model card y los datos de entrenamiento son en chino) |
| Licencia | no disponible; la model card indica que los pesos siguen la licencia de la base Qwen3.5 |
| Formato de pesos | safetensors (8-bit según etiquetas del repo; cuantización NVFP4 de ModelOpt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso derivado de Qwen3.5-4B, afinado con LoRA SFT y posteriormente fusionado. Sobre esa base se entrenó por separado una cabeza MTP (multi-token prediction) que se incluye en los pesos y que permite decodificación especulativa; la model card reporta un acierto top-1 en modo teacher-forced del 72,8 % y un `accept_proxy` del 83,7 %. Esta cabeza se mantiene en bf16 y no se cuantiza, incluso en la versión NVFP4.

El entrenamiento se construyó a partir de 20.000 fragmentos de novela web humana de buena calidad (con contenido SFW y NSFW), a los que se aplicó un proceso de "degradación" controlada: se catalogaron más de 100 patrones de estilo AIGC (sintaxis, ritmo, tono, imaginería, transiciones, manía explicativa) y se generaron versiones degradadas de los textos buenos con deepseek v4.1 flash 1017, produciendo pares (texto bueno, texto degradado). Un modelo profesor jevnovel3 27B puntuó frase a frase la probabilidad de "estar mal escrito", y gemini 4 argon construyó la cadena de análisis que conecta texto degradado, tipo de patrón, puntuación jevnovel y texto bueno. Esa cadena de razonamiento y el resultado de la reescritura se usaron conjuntamente como datos de entrenamiento, de modo que el CoT es aprendido y no un prompt externo.

## Capacidades

- Reescritura de prosa narrativa en chino con preservación del significado original y reorganización del lenguaje.
- Modo de razonamiento nativo: análisis frase a frase antes de la reescritura, separado de la salida final por el token `</think>`.
- Detección y eliminación de patrones de estilo AIGC (frases formulaicas, relleno explicativo, acumulación de paralelismos, exceso de intensidad emocional).
- Uso de puntuaciones externas de "maldad" por frase (formato `【0.04】` o `【NA】`) para calibrar la agresividad de la edición.
- Compresión controlada del texto: salida entre 0,4 y 1,0 veces la longitud de entrada (mediana en torno a 0,7).
- Generalización de longitud mejorada frente a la generación anterior: admite entradas de varios miles de caracteres sin segmentación previa, aunque el autor recomienda segmentar documentos muy largos.
- Decodificación especulativa mediante la cabeza MTP integrada.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Edición previa de borradores de novela web generados por IA: el modelo recibe el capítulo completo con las puntuaciones jevnovel insertadas al final de cada frase y devuelve un análisis y una versión comprimida que el autor revisa y ajusta manualmente, reduciendo el coste de reescritura manual.
- Limpieza de estilo en pipelines editoriales: integrado como paso intermedio entre la generación AIGC y la corrección humana, con la salida troceada por `</think>` para separar el informe de edición del texto final.
- Control de calidad asistido: el bloque de análisis previo sirve como justificación trazable de cada cambio (qué frase era formulaica, por qué y cómo se ha modificado), útil para revisores que necesitan auditar las ediciones.
- Normalización de longitud en publicaciones seriadas: al comprimir a 0,4-1,0 veces la entrada, encaja en flujos donde el texto AIGC llega inflado y hay que ajustarlo a un recuento de palabras objetivo por capítulo.
- Compatibilidad con proyectos antiguos de la serie rewrite: al ser un lote experimental conservado "tal cual", permite reproducir resultados de versiones anteriores y mantener la compatibilidad con integraciones existentes.
- Despliegue en hardware de gama baja: la cuantización NVFP4 W4A4 y la cabeza MTP permiten servir el modelo con decodificación especulativa en GPUs con poca VRAM, según indica el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento reportados son internos de la cabeza MTP: acierto top-1 en teacher-forced del 72,8 % y `accept_proxy` del 83,7 %.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,2 GB en cuantización NVFP4 W4A4, por lo que la inferencia requiere del orden de 5-6 GB de VRAM para los pesos más overhead de contexto; no se dispone de cifras oficiales.
- GPU recomendadas: no disponible. El autor menciona que la decodificación especulativa con MTP "acelera bastante en tarjetas de gama baja", sin especificar modelos.
- GPU de consumo: por tamaño de pesos, la cuantización NVFP4 debería caber en GPUs de consumo con al menos 8 GB de VRAM; no confirmado por el autor.
- Despliegue: vLLM >= 0.28 con soporte de decodificación especulativa MTP para Qwen3.5, mediante `vllm serve . --speculative-config '{"method":"mtp","num_speculative_tokens":2}' --max-model-len 32768 --gpu-memory-utilization 0.85`. El autor menciona también llama.cpp server (campos `reasoning_content` y `content`), aunque la configuración mostrada es para vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-exp-4B (NVFP4) | 4,66 B | 32.768 | Reescritura de prosa narrativa con CoT | no disponible (hereda Qwen3.5) | Hugging Face, 34 descargas |
| rewrite2-4b | no disponible | no disponible | Reescritura sin CoT, requiere segmentación previa | no disponible | Hugging Face (variante GGUF publicada) |
| rewrite3 (versión oficial) | no disponible | no disponible | Reescritura con CoT, "mejora notable" según el autor | no disponible | Anunciada, pendiente de publicación |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un lote experimental: no recibirá actualizaciones y el autor recomienda usar la versión oficial de rewrite3 cuando esté disponible.
- La salida es siempre más corta que la entrada (0,4-1,0 veces, mediana 0,7); no puede preservar la longitud original.
- El CoT consume habitualmente 3.000-4.000 tokens; con `max_tokens` insuficiente el modelo puede devolver solo el análisis sin el texto reescrito.
- El rendimiento depende de las puntuaciones jevnovel por frase: con todas las frases marcadas como `【NA】`, el modelo tiende a editar con menos agresividad.
- El modelo está entrenado y documentado para chino; no hay información sobre calidad en otros idiomas.
- Los datos de entrenamiento incluyen contenido NSFW, lo que puede influir en el comportamiento del modelo en ese dominio.
- Riesgo de alucinación y de alteración del significado original no cuantificado; se recomienda revisión humana de la salida.
- Licencia no especificada en el repositorio: los pesos siguen la licencia de la base Qwen3.5, por lo que las condiciones de uso comercial dependen de dicha licencia, no detallada aquí.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aikexue170/rewrite3-exp-nvfp4
- Generación anterior (rewrite2-4b, GGUF): https://huggingface.co/aikexue170/rewrite2-4b-gguf
- Modelo de puntuación jevnovel 0.8B: https://huggingface.co/aikexue170/jev-novel-3-0.8b-fp8
