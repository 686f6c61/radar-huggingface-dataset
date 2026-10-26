# mradermacher/bella-bartender-qwen3-1.7b-i1-GGUF

## Resumen

`mradermacher/bella-bartender-qwen3-1.7b-i1-GGUF` es un conjunto de cuantizaciones GGUF generadas por mradermacher (conocido por publicar versiones cuantizadas de modelos open source) a partir del fine-tune `juiceb0xc0de/bella-bartender-qwen3-1.7b`. No es un modelo nuevo: es una redistribución en formato GGUF, con cuantización ponderada mediante fichero imatrix, del citado fine-tune de 1.720.574.976 parámetros construido sobre la familia Qwen3. Su interés práctico es que permite ejecutar un modelo conversacional de 1,7 B en hardware muy modesto (CPU, iGPU, portátiles sin GPU dedicada) mediante llama.cpp u Ollama.

El modelo base es un fine-tune con Unsloth orientado a un personaje concreto ("Bella", con temática de bartender) y a mantener una "voz única" y consistente en conversación. Los tags del repositorio lo clasifican como `conversational`, `personality` y `single-voice`, y el único idioma declarado es el inglés. No se documenta arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni proceso de alineamiento (RLHF/DPO); esa información no está disponible en la documentación proporcionada.

Es relevante ahora por dos motivos: por un lado, demuestra el flujo habitual de la comunidad open source (fine-tune con Unsloth → cuantización imatrix con llama.cpp → publicación de una matriz completa de cuantizaciones de 0,6 GB a 1,5 GB); por otro, es un ejemplo útil para quien necesite personajes conversacionales ligeros y ejecutables en local. Conviene tener presente que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del resultado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (modelo denso); número de capas, cabezas y tipo de atención: no disponible |
| Parámetros totales | 1.720.574.976 (1,72 B), dato real de safetensors del modelo base |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; se incluye además el fichero imatrix (0,1 GB) para generar cuantizaciones propias |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base se distribuye en safetensors |
| Modelo base | juiceb0xc0de/bella-bartender-qwen3-1.7b |
| Tamaño del repositorio | 21,6 GB (suma de todas las cuantizaciones publicadas) |
| Fecha de publicación | 26 de octubre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un modelo de la familia Qwen3, denso, de 1,72 B de parámetros, y que el fine-tune se realizó con Unsloth (`unsloth` aparece como tag del repositorio). El trabajo de mradermacher se limita a la cuantización: genera cuantizaciones ponderadas con un fichero imatrix (`imatrix` en los tags, fichero `bella-bartender-qwen3-1.7b.imatrix.gguf` de 0,1 GB) para mejorar la relación calidad/tamaño respecto a las cuantizaciones estáticas, que publica por separado en `mradermacher/bella-bartender-qwen3-1.7b-GGUF`.

No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas (atención lineal, decodificación especulativa, modos de razonamiento). Tampoco se documenta el objetivo exacto del fine-tune más allá de los tags `conversational`, `personality` y `single-voice`, que apuntan a un modelo de personaje con estilo de respuesta homogéneo y orientado al diálogo. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con foco en mantener una personalidad consistente (tag `personality`).
- Estilo de "voz única" (`single-voice`): el modelo está ajustado para responder siempre con el mismo registro y personaje, no para alternar roles.
- Adecuado para diálogo de personaje y roleplay ligero; no está documentado como modelo de propósito general.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no documentadas; el repositorio no incluye proyector multimodal (`skip_mmproj` vacío en los metadatos de cuantización).
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Modo "thinking" explícito: no documentado para este fine-tune.

## Casos de uso

- NPC conversacional en videojuegos o experiencias interactivas: un modelo de 1,7 B en Q4_K_M ocupa 1,2 GB y puede ejecutarse en la propia máquina del jugador o en un servidor pequeño, manteniendo un personaje fijo durante toda la partida.
- Prototipado local de chatbots de personaje: permite iterar el prompt de sistema y el tono en un portátil sin GPU usando llama.cpp u Ollama, antes de invertir en un modelo mayor.
- Simulación de rol para entrenamiento de habilidades: escenarios de conversación (por ejemplo, práctica de trato con clientes en hostelería) donde el valor está en la consistencia del personaje y no en la exactitud factual.
- Evaluación comparativa de fine-tunes de personalidad: al estar disponibles las versiones de 1,7 B, 3 B y 8 B de la misma familia "Bella", sirve para medir cuánta calidad de personaje se gana al escalar el tamaño del modelo.
- Generación de diálogos de ambientación para narrativa, juegos de mesa o guiones: generación de líneas de personaje en lote, con bajo coste computacional y ejecución offline.
- Asistente de voz embebido en dispositivos de baja potencia: combinado con STT y TTS externos, el modelo en IQ4_XS (1,1 GB) o Q4_K_S (1,2 GB) cabe en una Raspberry Pi 5 o en un mini-PC con 4-8 GB de RAM.
- Material docente sobre el pipeline de publicación: ejemplo real de fine-tune con Unsloth, generación de imatrix y publicación de una matriz completa de cuantizaciones GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado evaluaciones del fine-tune base en los resultados de búsqueda consultados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (tamaño de fichero + overhead de contexto y caché KV; estimaciones a partir de los tamaños publicados, no mediciones):
  - i1-IQ1_S / IQ1_M: 0,6 GB de fichero; ~1,0-1,5 GB de memoria total.
  - i1-IQ2_XXS a IQ2_M: 0,7-0,8 GB; ~1,2-1,8 GB.
  - i1-IQ3_XXS a Q3_K_L: 0,9-1,1 GB; ~1,5-2,0 GB.
  - i1-IQ4_XS / Q4_K_M: 1,1-1,2 GB; ~1,8-2,5 GB.
  - i1-Q5_K_M: 1,4 GB; ~2,0-2,8 GB.
  - i1-Q6_K: 1,5 GB; ~2,2-3,0 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050/3060, RTX 4060, RTX 4090) ejecuta sin problema la cuantización Q4_K_M o Q6_K completa en VRAM. En el extremo alto (A100, H100) el modelo está infrautilizado: no tiene sentido salvo para servir muchos lotes en paralelo.
- Cabe holgadamente en GPU consumer: sí, en todas las dedicadas de los últimos ocho años y en muchas iGPU (Intel Iris Xe, AMD Radeon integrada) usando capas offloaded.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no están pensados para este formato (el soporte GGUF en vLLM es experimental y no cubre necesariamente las cuantizaciones i1); para producción con GGUF conviene llama.cpp con `llama-server`.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este repositorio; en CPU de escritorio es esperable un rendimiento de decenas de tokens por segundo con Q4_K_M, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bella-bartender-qwen3-1.7b-i1-GGUF (este) | 1,72 B | No disponible | Apache 2.0 | GGUF i1 (imatrix) | Fine-tune de personaje, solo inglés, sin benchmarks |
| mradermacher/bella-bartender-qwen3-1.7b-GGUF | 1,72 B | No disponible | Apache 2.0 | GGUF estático | Mismas cuantizaciones sin ponderación imatrix |
| mradermacher/bella-bartender-3b-i1-GGUF | 3 B (según nombre del repositorio) | No disponible | No disponible | GGUF i1 | Variante mayor de la misma familia de personaje |
| mradermacher/bella-bartender-8b-llama3.1-i1-GGUF | 8 B | 4.096 tokens (según ficha de free2aitools) | No disponible | GGUF i1 | Base Llama 3.1; requiere ~8 GB de VRAM según esa misma ficha |
| mradermacher/GT-Qwen3-1.7B-Base-i1-GGUF | 1,7 B | No disponible | No disponible | GGUF i1 | Qwen3-1.7B base cuantizado, sin fine-tune de personaje: referencia para medir cuánto aporta el ajuste |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguno de estos modelos en la información consultada, por lo que la comparativa se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; el rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Modelo de personaje, no de conocimiento: no debe emplearse como fuente de verdad. El riesgo de alucinación es alto y no hay evaluación que lo acote.
- Sin datos de entrenamiento publicados: no es posible caracterizar sesgos ni evaluar la calidad y procedencia del corpus del fine-tune.
- Cuantizaciones de muy baja precisión: el propio autor etiqueta IQ1_S como "for the desperate" y Q2_K_S como "very low quality". Para uso real, el mínimo razonable es IQ3_S/IQ4_XS en adelante.
- Contexto no documentado: no se debe asumir una ventana larga; conviene probar el comportamiento en conversaciones de varios turnos antes de desplegar.
- Tool calling y comportamiento agéntico no documentados: no apto para pipelines que dependan de llamadas a funciones sin validación previa.
- Licencia: el repositorio declara Apache 2.0, lo que permite uso comercial, pero conviene verificar los términos del modelo base Qwen3 subyacente antes de un despliegue en producción.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre calidad o estabilidad.
- Fecha de creación en los metadatos (26 de octubre de 2026): conviene comprobar que el repositorio y el modelo base siguen disponibles antes de fijar la dependencia.
- El repositorio pesa 21,6 GB en total; descargar solo el fichero GGUF necesario, no el repositorio completo.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/bella-bartender-qwen3-1.7b-i1-GGUF
- Modelo base: https://huggingface.co/juiceb0xc0de/bella-bartender-qwen3-1.7b
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/bella-bartender-qwen3-1.7b-GGUF
- Página de descarga del autor para este modelo: https://hf.tst.eu/model#bella-bartender-qwen3-1.7b-i1-GGUF
- Variante de 3 B: https://huggingface.co/mradermacher/bella-bartender-3b-i1-GGUF
- Variante de 8 B sobre Llama 3.1: https://huggingface.co/mradermacher/bella-bartender-8b-llama3.1-i1-GGUF
- Qwen3-1.7B base cuantizado (referencia): https://huggingface.co/mradermacher/GT-Qwen3-1.7B-Base-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
