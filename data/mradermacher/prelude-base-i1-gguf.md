# mradermacher/prelude-base-i1-GGUF

## Resumen

prelude-base-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix (i1), del modelo base openeurollm/prelude-base, publicada por el usuario mradermacher. No se trata de un modelo entrenado por el cuantizador, sino de una distribución de pesos comprimidos para su uso con llama.cpp y ecosistemas compatibles. El modelo original procede del proyecto OpenEuroLLM, una iniciativa europea de modelos abiertos, y cuenta con 9.094.607.872 parámetros (aproximadamente 9,1 mil millones).

La relevancia de esta publicación radica en que pone a disposición del público un modelo base multilingüe europeo en formatos ejecutables en hardware de consumo, con cuantizaciones que van desde 2,7 GB (IQ1_S) hasta 7,6 GB (Q6_K). El modelo declara soporte para 40 idiomas, con especial atención a lenguas europeas de menor difusión (letón, lituano, gaélico, euskera, maltés, islandés, entre otras), lo que lo convierte en una opción poco habitual para investigación en PLN multilingüe de bajos recursos.

Al ser un modelo base (no instruido ni alineado), no incorpora formato de chat ni sigue instrucciones de forma nativa; su utilidad principal es como punto de partida para fine-tuning o como modelo de completado de texto. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; detalles no publicados en la información disponible) |
| Parámetros totales | 9.094.607.872 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | en, es, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg (40 códigos) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original openeurollm/prelude-base: no se especifica si emplea atención estándar, atención lineal, mezcla de expertos o una variante híbrida, ni se indica el número de capas, dimensiones ocultas o cabezas de atención. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o instrucción supervisada. Al tratarse de un modelo etiquetado como "base", es esperable que no haya recibido alineación conversacional, pero este extremo no se confirma en la documentación proporcionada.

La contribución técnica de esta publicación concreta es la cuantización con imatrix (importancia matricial), una técnica que calcula estadísticas de activación sobre un corpus de calibración para ponderar la cuantización de cada tensor. Según las notas del autor, las cuantizaciones i1 suelen ofrecer mejor relación calidad/tamaño que las estáticas equivalentes; en concreto, se indica que IQ3_S "supera a Q3_K*" y que IQ3_M es preferible a Q3_K_L. El repositorio incluye además el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto y completado de secuencias en 40 idiomas, con énfasis en lenguas europeas.
- Modelo base sin alineación: no sigue instrucciones ni mantiene formato de chat de forma nativa.
- Capacidad multilingüe amplia, incluyendo idiomas de bajos recursos como euskera, gaélico, maltés, islandés, letón, lituano y sardo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento (thinking).
- Adecuado como base para fine-tuning supervisado y para experimentación en PLN multilingüe.

## Casos de uso

- Fine-tuning multilingüe: partir de los pesos en Q4_K_M o Q5_K_M para ajustar el modelo a tareas concretas (clasificación, extracción, resumen) en idiomas europeos minoritarios, aprovechando que el modelo ya ha visto esos idiomas durante el preentrenamiento.
- Investigación en equidad lingüística: evaluar el rendimiento de un modelo de 9B parámetros en lenguas como euskera, gaélico o maltés frente a modelos centrados en inglés, usando las cuantizaciones ligeras para iterar rápido en un solo GPU.
- Completado de texto en local: desplegar la variante Q4_K_M (5,8 GB) en una estación de trabajo con GPU de consumo para tareas de autocompletado o generación asistida sin conexión.
- Generación de datos sintéticos: emplear el modelo base para producir corpus de texto en idiomas de bajos recursos que sirvan como datos de entrenamiento para modelos posteriores o para aumentar datasets existentes.
- Experimentación con cuantización: usar el fichero imatrix incluido y las distintas variantes (de IQ1_S a Q6_K) para estudiar la degradación de perplejidad según el nivel de compresión en un modelo multilingüe.
- Evaluación comparativa de cuantizaciones: medir la caída de calidad entre IQ2_M (3,7 GB) y Q6_K (7,6 GB) en tareas de modelado de lenguaje por idioma, útil para decidir el compromiso tamaño/calidad en despliegues con VRAM limitada.
- Despliegue en entornos con hardware restringido: la variante IQ1_S (2,7 GB) permite ejecutar un modelo de 9B en GPUs con 4 GB de VRAM, aunque con calidad muy degradada según advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni perplejidad por idioma, y tampoco se han proporcionado datos del modelo original openeurollm/prelude-base.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - i1-IQ1_S (2,7 GB): ~3,5 GB de VRAM.
  - i1-IQ2_M (3,7 GB): ~4,5 GB de VRAM.
  - i1-IQ3_M (4,6 GB): ~5,5 GB de VRAM.
  - i1-Q4_K_M (5,8 GB): ~7 GB de VRAM.
  - i1-Q5_K_M (6,6 GB): ~8 GB de VRAM.
  - i1-Q6_K (7,6 GB): ~9 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para las cuantizaciones de mayor calidad; A100 o H100 para servir varias instancias o contextos largos.
- Cabe en GPU de consumo: sí, desde una GTX 1650 4 GB con IQ1_S hasta una RTX 3060 12 GB con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo original en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones de este repositorio están pensadas para llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| prelude-base (este, vía i1-GGUF) | 9,1B | no disponible | 40 (foco europeo) | Apache 2.0 | GGUF, safetensors |
| Llama 3.1 8B | 8,0B | 128k | ~8 principales | Llama 3.1 Community | GGUF, safetensors |
| Mistral 7B v0.3 | 7,2B | 32k | principalmente inglés y europeos mayores | Apache 2.0 | GGUF, safetensors |
| Gemma 2 9B | 9,2B | 8k | multilingüe amplio | Gemma Terms | GGUF, safetensors |

La comparación con Llama 3.1 8B, Mistral 7B y Gemma 2 9B es aproximada en tamaño, pero no en cobertura lingüística: prelude-base declara 40 idiomas frente a los 8 principales de Llama 3.1, y está orientado explícitamente a lenguas europeas de bajos recursos. No se dispone de datos de rendimiento comparativo para establecer diferencias de calidad.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones, no mantiene roles de sistema/usuario y puede generar contenido inapropiado o incoherente en modo conversacional.
- Riesgo de alucinación inherente a todo modelo de lenguaje; sin benchmarks publicados no es posible cuantificarlo.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate".
- No se documentan sesgos específicos, pero un modelo multilingüe entrenado sobre corpus web puede reproducir estereotipos presentes en los datos.
- La longitud de contexto no está publicada; conviene verificarla en el repositorio del modelo original antes de usarlo en tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar el aviso de licencia y citar el modelo original.
- El repositorio pesa 110 GB en total por acumular todas las variantes; descargar solo la cuantización necesaria.
- El campo "Idiomas soportados" de la ficha de Hugging Face aparece como "no disponibles", aunque la model card lista 40 códigos; se ha priorizado la información de la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/prelude-base-i1-GGUF
- Modelo original: https://huggingface.co/openeurollm/prelude-base
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/prelude-base-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#prelude-base-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
