# Luni/Nanbeige-4.3-33B-Heretic-GGUF

## Resumen

Nanbeige-4.3-33B-Heretic-GGUF es una colección de pesos cuantizados en formato GGUF del modelo Luni/Nanbeige-4.3-33B-Heretic, una derivación "abliterada" y de-slop del modelo denso Nanbeige4.3-33B desarrollado por el equipo Nanbeige. La versión Heretic elimina la alineación de rechazos mediante ablación direccional mientras conserva la capacidad de razonamiento matemático, algorítmico y analítico del modelo original, y añade razonamiento nativo en cadena de pensamiento mediante etiquetas `<think>`.

Este repositorio es relevante para usuarios que ejecutan modelos localmente con llama.cpp, Ollama u otros runtimes compatibles con GGUF: ofrece 22 cuantizaciones distintas, desde IQ1_S (~8 GB) hasta Q8_0 (~35 GB), todas calibradas con matrices de importancia (imatrix) sobre un corpus especializado en STEM, programación de sistemas y matemática competitiva. Con 33.100 millones de parámetros, atención completa en 52 capas y licencia Apache-2.0, es una opción seria para inferencia local de razonamiento sin censura en inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (52 capas, atención completa) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (los ejemplos usan 32.768 tokens) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S (todas imatrix) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en BF16 safetensors) |

## Arquitectura y entrenamiento

El modelo base es un language model causal puramente denso de 52 capas con atención completa (full attention), sin capas de deslizamiento ni arquitecturas híbridas. Incorpora razonamiento nativo en cadena de pensamiento mediante etiquetas `<think>`, lo que permite al modelo desplegar su proceso de razonamiento antes de la respuesta final. La variante Heretic aplica ablación direccional (técnica del proyecto Heretic) para eliminar las direcciones de activación responsables de los rechazos por alineación, sin necesidad de reentrenamiento completo, y un proceso de "de-slop" para reducir patrones de texto repetitivos y de baja calidad.

Sobre esta base, Luni ha generado las cuantizaciones GGUF con calibración de matriz de importancia (imatrix) usando un corpus especializado (`nanbeige_heretic.imatrix`, perplejidad 26,39) compuesto por anclas STEM de alta dificultad, programación de sistemas sin bloqueos (lock-free), sistemas distribuidos y matemática competitiva. Además, se ha corregido un problema del modelo original consistente en un doble token BOS `<|im_start|>`, estableciendo `add_bos_token: false`. No hay información disponible sobre el preentrenamiento del modelo original Nanbeige4.3-33B (tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento nativo con cadena de pensamiento mediante etiquetas `<think>` (thinking mode).
- Razonamiento matemático, algorítmico y analítico profundo, preservado tras la ablación.
- Fuerte orientación a programación de sistemas (lock-free, sistemas distribuidos) según el corpus de calibración.
- Modelo sin restricciones de rechazo (uncensored/abliterated), responde a consultas que el modelo base rechazaría.
- Estilo de salida "anti-slop", con reducción de clichés y patrones repetitivos.
- No hay información disponible sobre soporte de tool calling, function calling, agentes, visión o audio.

## Casos de uso

- Razonamiento matemático local: el modo `<think>` nativo permite resolver problemas de matemática competitiva y álgebra paso a paso sin depender de APIs externas, ideal para entornos sin conexión.
- Programación de sistemas de baja latencia: la calibración imatrix con corpus de programación lock-free y sistemas distribuidos lo hace adecuado para generar y revisar código C/C++/Rust concurrente.
- Asistente técnico sin filtros para investigación: al estar abliterado, permite explorar temas que los modelos alineados rechazan, útil en contextos de red teaming y auditoría de seguridad con supervisión humana.
- Chatbot conversacional de calidad en hardware de gama alta: con la cuantización Q4_K_M (~20,5 GB) cabe en una RTX 3090/4090 de 24 GB para conversación multi-turno fluida.
- Experimentación con cuantización extrema: la gama IQ1/IQ2 permite estudiar la degradación de calidad en compresiones de 1,56-2,7 bpw en GPUs de 8-12 GB.
- Despliegue en servidor local con API: mediante `llama-server` se puede exponer un endpoint OpenAI-compatible en el puerto deseado para integrarlo en aplicaciones propias.
- Escritura creativa de-slop: la variante Heretic reduce los patrones de texto genéricos, útil para generación de prosa y roleplay con menos clichés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento cuantitativo publicado es la perplejidad de la matriz de importancia de calibración: 26,39.

## Requisitos de hardware

- VRAM estimada según cuantización (datos del autor):
  - Q8_0 (~35,0 GB): 48 GB o más
  - Q6_K (~28,5 GB): 36 GB o más
  - Q5_K_M / Q5_K_S (~24 GB): 32 GB
  - Q4_K_M (~20,5 GB): 24 GB (o 32 GB con contexto amplio)
  - IQ4_NL / IQ4_XS / Q4_K_S (~19 GB): 24 GB
  - Q3_K_L / Q3_K_M / IQ3_M (~17-18 GB): 20-24 GB
  - Q3_K_S / IQ3_S / IQ3_XS / IQ3_XXS (~14-16 GB): 16 GB
  - Q2_K / IQ2_M (~13 GB): 16 GB
  - IQ2_S / IQ2_XS / IQ2_XXS (~10-12 GB): 12 GB
  - IQ1_M / IQ1_S (~8-8,8 GB): 8-12 GB
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones de 4 bits; RTX 5090 o A100 40 GB para 5-6 bits; A100/H100 80 GB para Q8_0 con contexto largo.
- Consumer GPUs: sí, una RTX 3090 o 4090 de 24 GB ejecuta Q4_K_M o IQ4_NL completamente en GPU; con 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) se puede usar IQ2/IQ3, en muchos casos con offload parcial a RAM.
- Despliegue: llama.cpp (llama-cli y llama-server, con instrucciones oficiales), y por extensión cualquier runtime GGUF (Ollama, LM Studio, koboldcpp). Existen también variantes EXL3 para exllamav3 en repositorios del mismo autor.
- Ejemplo oficial de ejecución: `llama-server -m Nanbeige-4.3-33B-Heretic.IQ4_NL.gguf --port 8080 -ngl 99 -c 32768`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige-4.3-33B-Heretic-GGUF | 33.100 M | Denso, 52 capas, full attention | No disponible (32.768 en ejemplos) | Apache-2.0 | Abliterado, thinking nativo, imatrix STEM |
| Nanbeige4.3-33B (original) | 33.100 M | Denso, 52 capas | No disponible | Apache-2.0 | Modelo base con alineación de rechazos |
| Qwen3-32B | 32.800 M | Denso | 131.072 | Apache-2.0 | Thinking mode, multilingue (119 idiomas), tool calling |
| Gemma 3 27B | 27.400 M | Denso | 128.000 | Licencia Gemma | Multimodal (visión), no abliterado |

Qwen3-32B es la alternativa más directa en rango de tamaño con razonamiento nativo y licencia permisiva, aunque no está abliterada. Gemma 3 27B añade visión pero con licencia más restrictiva. No hay datos de benchmarks que permitan comparar rendimiento numérico entre ellos.

## Limitaciones y advertencias

- Modelo abliterado (uncensored): elimina deliberadamente los rechazos de seguridad. Su uso conlleva riesgos legales y éticos; el usuario asume toda la responsabilidad del contenido generado y debe supervisar las salidas.
- La ablación direccional puede degradar sutilmente otras capacidades además de los rechazos; el autor afirma que se preserva el razonamiento matemático y algorítmico, pero no hay benchmarks independientes que lo verifiquen.
- Cuantizaciones extremas (IQ1_S, IQ1_M, IQ2_XXS) implican pérdida de calidad significativa; usarlas solo si la VRAM es limitada.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y puede ser inferior.
- Longitud de contexto del modelo base no publicada en la model card; verificar antes de planificar cargas con documentos largos.
- Licencia Apache-2.0: sin restricciones para uso comercial del modelo, pero las salidas del modelo abliterado pueden no cumplir las políticas de plataformas comerciales.
- Riesgo de alucinación estándar de LLM, agravado por la ausencia de mecanismos de seguridad; verificar factualmente cualquier salida antes de usarla en producción.
- La búsqueda web adjunta no aportó información adicional relevante (los resultados corresponden a una marca ajena, Lunii).

## Enlaces

- Repositorio GGUF: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-GGUF
- Modelo Heretic BF16: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic
- Modelo base original (Nanbeige Team): https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante stock EXL3: https://huggingface.co/Luni/Nanbeige-4.3-33B-EXL3
- Variante Heretic EXL3: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3
- Variante Heretic EXL3-SC: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3-SC
