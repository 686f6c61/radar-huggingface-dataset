# AtomicChat/MiniCPM-V-4.7-35B-A3B-GGUF

## Resumen

AtomicChat/MiniCPM-V-4.7-35B-A3B-GGUF es una familia de cuantizaciones en formato GGUF del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por AtomicChat. El modelo base es un transformer con mezcla de expertos (MoE) de 34.659.889.792 parámetros totales cuyo nombre comercial ("35B-A3B") apunta a unos 3 000 millones de parámetros activos por token, y que acepta entrada de imagen y texto (pipeline `image-text-to-text`). La licencia es Apache 2.0 y el repositorio ocupa 313,2 GB porque aloja todas las variantes de cuantización.

El valor de esta publicación no está en el modelo en sí, sino en el proceso de cuantización: AtomicChat usa su propia matriz de importancia (importance matrix) y publica las métricas medidas de cada archivo, con divergencia KL y coincidencia top-1 frente a los pesos originales. Sus diseños "Atomic Dynamic" (`AD-`) mantienen atención, experto compartido, embeddings y cabeza de salida en q8_0, y gastan el ahorro en los expertos enrutados, que son el 93 % de los pesos. El resultado es que `AD-Q4_K-IQ4_XS` ocupa 20,1 GB y se desvía menos que `Q4_K_M` (21,2 GB), quedando a la altura de un `Q5_K_M` 4,6 GB mayor.

Es relevante ahora porque permite ejecutar un MoE multimodal de ~35 B con decodificación en modo *thinking* y ventanas de contexto de seis cifras en GPUs de consumo: el archivo `AD-Q5_K-Q4_K` (22,1 GB) cabe en una tarjeta de 24 GB dejando espacio para unos 120k tokens de contexto. Con 9 966 descargas y 15 *likes* desde su publicación, es una de las vías prácticas para probar MiniCPM-V 4.7 en local sin clústeres.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; la model card menciona expertos enrutados (93 % de los pesos) y un experto compartido. Detalle de capas y mecanismo de atención: no disponible |
| Parámetros totales | 34 659 889 792 (~34,66 B), medidos sobre los safetensors del modelo base |
| Parámetros activos | No disponible como cifra medida; el nombre del modelo base (35B-A3B) indica ~3 000 millones de parámetros activos |
| Longitud de contexto | No declarada en la model card. Sus tablas de encaje por VRAM manejan ventanas de 16k, 24k, 120k y 192k tokens, además de "contexto completo" |
| Tipos de cuantización | Q8_0, AD-Q6_K, AD-Q6_K-Q5_K, AD-Q5_K-Q4_K, AD-Q5_K-IQ4_XS, AD-Q4_K-IQ4_XS, AD-IQ4_XS-IQ3_S, AD-IQ3_S-IQ3_XXS, AD-IQ3_XXS-IQ2_S, AD-IQ2_S-IQ2_XS, AD-IQ2_XS-IQ2_XXS, AD-IQ2_XXS-IQ1_M (experimental) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). El proyector de visión se distribuye aparte en `mmproj-...-F16.gguf` o `mmproj-...-BF16.gguf` |
| Modelo base | openbmb/MiniCPM-V-4.7-35B-A3B |
| Tamaño del repositorio | 313,2 GB (todas las cuantizaciones) |
| Descargas / likes | 9 966 / 15 |
| Fechas de creación y última actualización | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos: la model card de la cuantización describe "expertos enrutados" y un "experto compartido", y cuantifica ese conjunto de expertos enrutados como el 93 % de los pesos totales. Los diseños `AD-` aprovechan esa distribución manteniendo en q8_0 los tensores sensibles (atención, experto compartido, embedding y cabeza de salida) y aplicando cuantizaciones más agresivas solo a los expertos enrutados, que es donde el ahorro de espacio no degrada tanto la distribución de salida. El nombre del archivo codifica qué recibieron los dos mayores grupos de tensores, `ffn_down` y `ffn_up`; cuando ambos coinciden, se colapsa a un único nombre.

El proceso de cuantización se apoya en una matriz de importancia propia, generada a partir de un corpus publicado y específico para este modelo: 4 906 667 tokens repartidos en 2 896 documentos, con la receta `minicpm-v-4.7-moe` dentro de AtomicChat/calib-corpora. No hay información en el material proporcionado sobre el número de tokens de preentrenamiento del modelo original, la composición de su dataset ni si hubo fases de RLHF o DPO. Tampoco se detalla el mecanismo de atención ni si incorpora técnicas como decodificación especulativa o atención lineal.

Sí se documenta el comportamiento de plantilla de chat: el *chat template* va dentro de cada archivo GGUF y llama.cpp lo aplica automáticamente; con `--jinja` el modelo arranca cada respuesta en modo *thinking*, desactivable por petición mediante `"chat_template_kwargs": {"enable_thinking": false}`. Para entrada de imagen hace falta un archivo adicional, el proyector multimodal, compartido por todas las cuantizaciones.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla integrada en el GGUF.
- Comprensión de imágenes (entrada image-text-to-text) mediante el proyector `mmproj` en F16 o BF16.
- Modo de razonamiento explícito (*thinking*) activable por defecto con `--jinja` y desactivable por petición.
- Contexto largo: las tablas del autor contemplan ventanas de 16k, 24k, 120k y 192k tokens según la VRAM disponible, con un coste de caché de atención de 20 KB por token (0,2 GB a 8k, 0,6 GB a 32k).
- Inferencia local eficiente por su naturaleza MoE, ya que solo se activa una fracción de los expertos por token (la model card no publica la cifra activa exacta).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Vídeo: la sección de la model card se titula "Images and video", pero el contenido proporcionado solo documenta la entrada de imágenes; el soporte de vídeo no está detallado.
- Audio: no documentado.

## Casos de uso

- Análisis de documentos escaneados en local: facturas, informes o formularios con texto e imágenes se pueden procesar con `llama-mtmd-cli` pasando `--image`, sin enviar datos a una API externa. La licencia Apache 2.0 permite integrarlo en productos comerciales.
- Asistencia técnica con capturas de pantalla: el modelo acepta una imagen junto a una pregunta en texto, lo que encaja en flujos de soporte donde el usuario adjunta una captura de un error o de una interfaz.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: `AD-Q5_K-Q4_K` (22,1 GB) deja espacio para unos 120k tokens de contexto, suficiente para asistentes con historial largo y documentos adjuntos.
- Procesamiento por lotes de imágenes y texto: el repositorio incluye variantes desde 10,1 GB hasta 36,9 GB, lo que permite elegir el equilibrio entre fidelidad y coste por nodo en una flota heterogénea de GPUs.
- Prototipado en portátiles con GPU de 12 o 16 GB: las cuantizaciones `AD-IQ2_XS-IQ2_XXS` (11,3 GB) y `AD-IQ3_S-IQ3_XXS` (15,5 GB) permiten validar el comportamiento del modelo antes de mover la carga a hardware mayor, asumiendo una degradación medible de la fidelidad.
- Razonamiento con trazas explícitas para depuración: el modo *thinking* activado por defecto con `--jinja` permite inspeccionar el razonamiento intermedio del modelo en tareas de análisis, y desactivarlo por petición cuando se prioriza la latencia.
- Despliegue *edge* o en entornos sin conectividad con `llama-server`: el binario y el GGUF son autosuficientes, lo que facilita instalaciones en redes aisladas donde no se pueden usar servicios en la nube.
- Evaluación comparativa interna de cuantizaciones: las métricas publicadas (KL y top-1 por archivo) permiten fijar un umbral de calidad objetivo antes de decidir qué quant distribuir en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos del repositorio son métricas de fidelidad de la cuantización frente a los pesos originales, medidas por el autor sobre un texto de referencia reservado y con la misma compilación de llama.cpp:

| Archivo | Tamaño | Divergencia KL | top-1 |
|---|---:|---:|---:|
| Q8_0 | 36,9 GB | 0,00516 | 97,49 % |
| AD-Q6_K | 29,1 GB | 0,00605 | 97,18 % |
| AD-Q6_K-Q5_K | 26,2 GB | 0,00806 | 96,72 % |
| AD-Q5_K-Q4_K | 22,1 GB | 0,01501 | 95,47 % |
| AD-Q5_K-IQ4_XS | 21,5 GB | 0,01584 | 95,41 % |
| AD-Q4_K-IQ4_XS | 20,1 GB | 0,01972 | 94,94 % |
| AD-IQ4_XS-IQ3_S | 17,6 GB | 0,03874 | 92,86 % |
| AD-IQ3_S-IQ3_XXS | 15,5 GB | 0,06381 | 90,82 % |
| AD-IQ3_XXS-IQ2_S | 13,7 GB | 0,11015 | 87,99 % |
| AD-IQ2_S-IQ2_XS | 12,3 GB | 0,16634 | 85,29 % |
| AD-IQ2_XS-IQ2_XXS | 11,3 GB | 0,21942 | 83,17 % |
| AD-IQ2_XXS-IQ1_M (investigación) | 10,1 GB | 0,34928 | 78,57 % |

Comparación directa con los presets planos de llama.cpp (sin matriz de importancia):

| Preset plano | Tamaño | Divergencia KL | top-1 | Archivo AD equivalente | Tamaño | Divergencia KL | top-1 |
|---|---:|---:|---:|---|---:|---:|---:|
| Q4_K_M | 21,2 GB | 0,04455 | 92,23 % | AD-Q4_K-IQ4_XS | 20,1 GB | 0,01972 | 94,94 % |
| Q5_K_M | 24,7 GB | 0,01966 | 94,68 % | AD-Q5_K-Q4_K | 22,1 GB | 0,01501 | 95,47 % |
| Q6_K | 28,5 GB | 0,00949 | 96,40 % | AD-Q6_K-Q5_K | 26,2 GB | 0,00806 | 96,72 % |

Los presets planos no se incluyen en el repositorio; se listan solo como referencia. Los registros brutos de medición están publicados en el repositorio de métricas del autor.

## Requisitos de hardware

- Caché de atención: 20 KB por token, es decir 0,2 GB a 8k de contexto y 0,6 GB a 32k. Ese espacio hay que sumarlo al del archivo de pesos.
- GPU de 12 GB: `AD-IQ2_XS-IQ2_XXS` (11,3 GB), deja sitio para unos 16k de contexto.
- GPU de 16 GB: `AD-IQ3_S-IQ3_XXS` (15,5 GB), deja sitio para unos 24k de contexto.
- GPU de 24 GB (por ejemplo RTX 4090, RTX 3090): `AD-Q5_K-Q4_K` (22,1 GB), deja sitio para unos 120k de contexto. Es la opción de calidad recomendada dentro del segmento de consumo.
- GPU de 32 GB: `AD-Q6_K` (29,1 GB), deja sitio para unos 192k de contexto.
- GPU de 48 GB o superior (A100 40/80 GB, H100): `Q8_0` (36,9 GB) con contexto completo.
- El modelo cabe en GPU de consumo en todas las cuantizaciones salvo `Q8_0`; a partir de 24 GB la calidad medida es comparable a la de un `Q5_K_M` o superior con menos espacio ocupado.
- Despliegue documentado: `llama-server` para chat con plantilla aplicada automáticamente (`-ngl 99 -c 8192 --jinja`) y `llama-mtmd-cli` para entrada multimodal, añadiendo `--mmproj` con el proyector F16 o BF16. La aplicación Atomic Chat también permite ejecutarlo.
- vLLM, TGI y Ollama no se mencionan en la model card; al tratarse de GGUF, la ruta documentada por el autor es llama.cpp y sus derivados.
- Latencia y throughput: no se publican mediciones. Al ser un MoE, el coste por token está ligado a los parámetros activos y no a los 34,66 B totales, pero no hay cifras medidas disponibles.

## Comparativa con modelos similares

No hay datos en la información disponible sobre otros modelos de la misma categoría (MoE multimodal de ~35 B) con los que comparar parámetros, contexto o rendimiento. La única comparación posible con los datos publicados es la de este mismo modelo frente a los presets de cuantización planos de llama.cpp, recogida en la sección de benchmarks: cada archivo `AD-` es entre 1 y 4,6 GB más pequeño que el preset plano de fidelidad equivalente.

| Aspecto | AtomicChat AD (este repo) | Presets planos de llama.cpp |
|---|---|---|
| Matriz de importancia | Sí, corpus propio de 4 906 667 tokens | No |
| Tamaño para ~95 % de top-1 | 20,1 GB (AD-Q4_K-IQ4_XS) | 24,7 GB (Q5_K_M) |
| Divergencia KL a ese nivel | 0,01972 | 0,01966 (en 4,6 GB más) |
| Presencia en el repositorio | Sí, 12 variantes | No, solo como referencia medida |

## Limitaciones y advertencias

- No hay benchmarks de calidad publicados (MMLU, HumanEval, GSM8K ni similares) en la información disponible, así que el rendimiento real en tareas concretas no se puede verificar con datos.
- Las cuantizaciones más pequeñas degradan la distribución de salida de forma severa: `AD-IQ2_XXS-IQ1_M` cae a 78,57 % de coincidencia top-1 y 0,34928 de divergencia KL. El propio autor la marca como experimental y no apta para uso serio.
- Idiomas soportados no declarados. No se puede asumir un rendimiento homogéneo en castellano ni en otros idiomas.
- Contexto máximo no declarado por el autor; las cifras de 16k, 24k, 120k y 192k provienen de la tabla de encaje por VRAM, no de una especificación oficial del modelo.
- Riesgo de alucinación: no cuantificado en la información disponible. El modo *thinking* activado por defecto puede incrementar el consumo de tokens de salida sin garantizar mayor exactitud.
- Sesgos conocidos: no documentados.
- La entrada de imagen exige descargar un archivo adicional (`mmproj`); sin él, llama.cpp no procesará imágenes y el modelo funcionará solo como texto.
- El soporte de vídeo aparece en el título de una sección de la model card, pero no está detallado en el contenido disponible; no debe asumirse.
- El repositorio ocupa 313,2 GB en total; conviene descargar únicamente el archivo y el proyector necesarios.
- Licencia Apache 2.0, permisiva para uso comercial. Aun así, conviene verificar la licencia y las condiciones del modelo base openbmb/MiniCPM-V-4.7-35B-A3B antes de un despliegue en producción.
- Este repositorio contiene pesos cuantizados, no los pesos originales en safetensors; para auditar o recuantizar desde cero hay que acudir al modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/MiniCPM-V-4.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Métricas de cuantización (registros brutos): https://huggingface.co/datasets/AtomicChat/MiniCPM-V-4.7-35B-A3B-GGUF-metrics
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord del proyecto: https://discord.gg/8wGSsvmg4V
