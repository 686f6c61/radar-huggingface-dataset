# rSalone/DeepSeek-V4.1-Flash-1017-GSQ-RCO-uncensored-t1-4-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-RCO-uncensored-t1-4-GGUF es una variante "abliterated" (sin dirección de rechazo) del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario rSalone sobre la cuantización GSQ-RCO IQ2_XXS de ISTA-DASLab. El modelo base cuenta con aproximadamente 196.600 millones de parámetros totales, según los datos de safetensors del repositorio. La intervención consiste en eliminar la "dirección de rechazo" —la dirección en el espacio de activaciones en la que difieren las peticiones que el modelo rechaza frente a las ordinarias— editando directamente los pesos ya cuantizados.

El interés técnico de esta ficha reside en el método: a diferencia de otras variantes publicadas, la dirección de rechazo se calcula sobre el primer 40 % de los tokens de razonamiento (no sobre el último token de la petición), se estima una dirección por capa y por salida, y solo se editan las capas donde las peticiones dañinas y las ordinarias se separan con claridad. El autor reporta que las peticiones dañinas respondidas pasan de 4 a 60 sobre 60, mientras que las puntuaciones en MATH y en tareas prácticas se mantienen estables.

El modelo se distribuye en formato GGUF (tamaño de repositorio de 501,8 GB) con licencia MIT y está pensado para ejecutarse en llama.cpp, Abyss y Strata. Su relevancia actual es doble: por un lado, demuestra que la eliminación de la dirección de rechazo puede aplicarse directamente sobre pesos cuantizados; por otro, plantea consideraciones de seguridad y de licencia que cualquier equipo de producción debe evaluar antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 196.613.849.600 (~196,6 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el autor recomienda compactar antes de ~160K tokens por caída de calidad) |
| Tipos de cuantización | IQ2_XXS (GSQ-RCO); pesos GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (versión de seis shards compatible con llama.cpp) |
| Modelo base | ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF |
| Tamaño del repositorio | 501,8 GB |
| Descargas / likes | 2.263 / 8 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (si es transformer denso, MoE o híbrido), ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. Lo que sí se documenta es el proceso de modificación: se parte de la cuantización IQ2_XXS GSQ-RCO de ISTA-DASLab y se elimina la dirección de rechazo calculando, para cada capa y cada salida, la dirección en la que difiere la salida media entre peticiones rechazadas y peticiones ordinarias (estas últimas tomadas de harmless_alpaca). La dirección se estima sobre el primer 40 % de los tokens de razonamiento, y solo se editan las capas donde la separación entre ambos tipos de petición es suficientemente clara.

La innovación destacable es que la edición se realiza directamente sobre los pesos cuantizados, sin necesidad de editar los pesos en precisión completa y recuantizar después. El autor indica que fijar a cero la componente en esa dirección (fuerza 1.0) basta para que el modelo responda a las 60 peticiones dañinas con razonamiento activado, frente a la fuerza 2.0 (que invierte el signo de la componente) usada por otras variantes publicadas. Como validación de que el comportamiento general se preserva, el autor compara las distribuciones de probabilidad del siguiente token frente al modelo original en 16.025 posiciones: divergencia KL media de 0,0058 y coincidencia del token más probable en el 97,08 % de las posiciones.

## Capacidades

- Generación de texto y razonamiento con modo de razonamiento (reasoning) activable o desactivable.
- Razonamiento matemático: el autor reporta 50/50 correctas en MATH Level 5 (frente a 49/50 del original).
- Ejecución de tareas prácticas de agente en OpenCode, con 13 ítems evaluados en cuatro tareas de OpenCode.
- Automatización de navegador mediante Playwright, según la experiencia del autor.
- Integración con ComfyUI y flujos de generación de imágenes (incluida la generación de imágenes NSFW solicitada).
- Respuesta a peticiones que el modelo original rechaza (eliminación de la dirección de rechazo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la eliminación de la dirección de rechazo afecta a la tasa de respuesta a peticiones dañinas (de 4/60 a 60/60) sin degradar tareas matemáticas, útil para analizar mecanismos de refusal en modelos de gran escala.
- Evaluación de robustez de filtros de seguridad: desplegar este modelo en un entorno controlado para probar si los clasificadores de contenido y las capas de moderación externas detectan respuestas que un modelo alineado rechazaría.
- Reproducción de experimentos de abliteration sobre pesos cuantizados: sirve como referencia de que la edición directa sobre GGUF IQ2_XXS es viable, lo que reduce los requisitos de hardware frente a editar pesos en precisión completa.
- Automatización de tareas de agente en OpenCode: el autor documenta el uso diario en tareas prácticas (navegación con Playwright, flujos de ComfyUI), lo que lo hace adecuado para pipelines de agentes que requieran ejecución multi-paso.
- Generación de imágenes mediante ComfyUI: el modelo puede orquestar flujos de trabajo en ComfyUI, incluidos los de contenido NSFW, algo que el autor señala que Claude rechaza en su experiencia.
- Razonamiento matemático de nivel avanzado: con 50/50 en MATH Level 5, es adecuado para tareas de resolución de problemas matemáticos donde se requiera un modelo sin restricciones de contenido.
- Pruebas de regresión de comportamiento: la baja divergencia KL (0,0058) frente al original permite usar este modelo como sustituto en pruebas donde se necesite el mismo comportamiento de predicción con distinto perfil de rechazo.

## Benchmarks y rendimiento

| Evaluación | Original | Este modelo |
|---|---:|---:|
| Peticiones dañinas respondidas (razonamiento activo, 60) | 4 | 60 |
| Peticiones dañinas respondidas (razonamiento desactivado, 60) | 6 | 54 |
| Test de sobrerrechazo respondido (razonamiento activo, 60) | 60 | 60 |
| Test de sobrerrechazo respondido (razonamiento desactivado, 60) | 59 | 60 |
| MATH Level 5 correctas (50) | 49 | 50 |
| Imágenes generadas para una petición NSFW (3 ejecuciones) | 0 | 3 |
| Problemas con límite de longitud alcanzado o bucle (total) | 1 | 3 |

Las peticiones dañinas provienen de MaliciousInstruct y el test de sobrerrechazo de los prompts seguros de XSTest. La diferencia en peticiones dañinas es p<0,001 (test exacto de McNemar); la diferencia en MATH es p=1,000. La evaluación la realizó Qwen3.8-Flash-Next (q8g) y se ejecutó en Abyss v1.3.91, una ejecución por problema (tres para la petición de generación de imágenes).

Además, en la comparación de distribuciones del siguiente token sobre 10 problemas de MATH-500 Level 5 (16.025 posiciones), la divergencia KL media fue de 0,0058 y el token más probable coincidió en el 97,08 % de las posiciones.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el autor indica que la creación del modelo se realizó con una única GPU de consumo (RTX 5090) y 121 GiB de RAM. El repositorio ocupa 501,8 GB, por lo que la inferencia requiere almacenamiento y memoria proporcionales a la cuantización IQ2_XXS.
- GPU recomendadas: no disponible en la información proporcionada; el autor solo menciona la RTX 5090 para el proceso de edición.
- ¿Cabe en GPU de consumo? El proceso de creación sí (RTX 5090 con 121 GiB de RAM del sistema); la inferencia completa requiere evaluar el desbordamiento a RAM del sistema según la cuantización.
- Opciones de despliegue: llama.cpp (versión de seis shards verificada), Abyss v1.3.91 y Strata. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (rSalone) | ~196,6 B | no disponible | MIT | GGUF (IQ2_XXS) | Edita pesos cuantizados; dirección por capa; fuerza 1.0 |
| Otras variantes abliterated del mismo base ISTA-DASLab | no disponible | no disponible | no disponible | no disponible | Aplican una dirección a todas las capas, fuerza 2.0, editan pesos en precisión completa y recuantizan |
| Modelo original DeepSeek-V4.1-Flash-1017 (vía ISTA-DASLab GSQ-RCO) | ~196,6 B | no disponible | no disponible | GGUF | Sin eliminar la dirección de rechazo; 4/60 peticiones dañinas respondidas |

La información disponible no permite comparar con alternativas de otros desarrolladores (por ejemplo, otros modelos de ~200 B) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo elimina deliberadamente la dirección de rechazo: responde a peticiones dañinas (60/60 con razonamiento activo) que el original rechaza. No debe desplegarse en entornos públicos sin capas de moderación externas.
- El autor reporta una caída brusca de la calidad de respuesta al superar aproximadamente 160K tokens de contexto; recomienda configurar la compactación de contexto antes de ese umbral.
- En las evaluaciones se observaron 3 casos de salida que alcanzaron el límite de longitud o parecían bucles, frente a 1 del modelo original.
- La evaluación se realizó con una sola ejecución por problema (tres en el caso de generación de imágenes) y el juicio de si una respuesta satisface la petición lo emitió Qwen3.8-Flash-Next (q8g), lo que introduce dependencia del evaluador.
- La licencia es MIT, lo que en principio permite uso comercial, pero el modelo base y la cuantización de ISTA-DASLab pueden tener condiciones adicionales no detalladas en la información disponible; conviene verificar la licencia del modelo base antes de un uso comercial.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de esta variante.
- El método de edición sobre pesos cuantizados puede introducir artefactos no capturados por las evaluaciones reportadas; la divergencia KL de 0,0058 se midió solo sobre problemas de MATH-500 Level 5.
- Los enlaces a los papers citados en los tags (arXiv:2406.11717, 2310.06987, 2308.01263, 2103.03874, 2305.20050) no se detallan en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rSalone/DeepSeek-V4.1-Flash-1017-GSQ-RCO-uncensored-t1-4-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- README en japonés: README_ja.md (referenciado en la model card)
- Papers citados en los tags: arXiv:2406.11717, arXiv:2310.06987, arXiv:2308.01263, arXiv:2103.03874, arXiv:2305.20050 (sin URL directa en la información disponible)
