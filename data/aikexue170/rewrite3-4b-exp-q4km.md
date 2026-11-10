# aikexue170/rewrite3-4b-exp-q4km

## Resumen

rewrite3-exp-4B es un modelo de lenguaje especializado en reescritura de prosa de ficcion web (webnovel) generada por IA, con el objetivo de eliminar el llamado "estilo AIGC" (estructuras formulaicas, relleno explicativo, acumulacion de paralelismos, exceso de emocion) y aproximarla a la escritura humana. Lo desarrolla el usuario aikexue170 y forma parte de la tercera generacion de la familia rewrite, en este caso una tanda experimental (exp) previa a la version oficial rewrite3, que segun el autor ofrecera mejoras notables y no actualizara esta.

El modelo parte del base Qwen3.5-4B (4.326.350.848 parametros totales) y se ha ajustado mediante LoRA SFT con fusion posterior. Su innovacion principal es un modo de razonamiento (chain-of-thought) entrenado, no inyectado por prompt: antes de reescribir, el modelo analiza frase a frase el texto de entrada, identifica el tipo de formula AIGC, interpreta una puntuacion de "calidad degradada" por frase y planifica la intervencion. La distribucion publicada es un GGUF Q4_K_M de 2,8 GB, pensado para ejecutarse en GPU de consumo de 16 GB.

La tarea de esta version experimental es explicitamente de "acortamiento": el texto de salida debe quedar entre 0,4 y 1,0 veces la longitud de entrada (mediana en torno a 0,7), porque el AIGC tiende a inflar la prosa. Es relevante ahora por la saturacion de manuscritos generados o reescritos por IA en plataformas de webnovel, y porque demuestra un patron poco comun: CoT entrenado con supervision de un modelo profesor de puntuacion, mas una cabeza MTP embebida para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) con cabeza MTP embebida para decodificacion especulativa |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `-c 8192` |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | no disponible (el material de entrenamiento y la tarea son en chino) |
| Licencia | hereda la licencia del base Qwen3.5 (texto exacto no disponible) |
| Formato de pesos | GGUF (archivo `rewrite3-exp-4B-Q4KM.gguf`), con MTP embebido (`block_count=33`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4,3 mil millones de parametros derivado de Qwen3.5-4B. Sobre el base se aplico LoRA SFT y posteriormente se fusionaron los adaptadores. Ademas, se entreno por separado una cabeza MTP (multi-token prediction) que queda incrustada en los pesos principales, de modo que no se necesita un archivo draft aparte para decodificacion especulativa; el autor reporta teacher-forced top1 del 72,8 % y accept_proxy del 83,7 %.

El dataset de entrenamiento se construyo en cuatro etapas: (1) 20.000 textos humanos de webnovel considerados de buena calidad, con contenido SFW y NSFW; (2) catalogo de mas de 100 patrones de "formula AIGC" (sintaxis, ritmo, tono, imagenes, transiciones, mania explicativa) con los que se degradaron los buenos textos usando deepseek v4.1 flash 1017, generando pares (texto bueno, texto degradado); (3) puntuacion por frase de la probabilidad de estar "arruinada" mediante el modelo profesor jevnovel3 27B; (4) construccion de la cadena de analisis con gemini 4 argon, enlazando texto degradado, tipo de formula, puntuacion del profesor y texto bueno de referencia. El CoT y el resultado de reescritura se entrenan conjuntamente, de forma que el modelo aprende tanto a reconocer los patrones como a calibrar la intensidad de la reescritura segun la puntuacion.

## Capacidades

- Reescritura de prosa de ficcion con preservacion del significado original y reorganizacion del lenguaje.
- Razonamiento previo a la generacion (CoT entrenado): analisis frase a frase de defectos estilisticos, diagnostico del tipo de formula AIGC y plan de intervencion.
- Interpretacion de puntuaciones externas por frase (jevnovel), integradas en la entrada con el formato `【0.04】` o `【NA】`; el autor indica que las puntuaciones altas hacen que el modelo reescriba con mayor agresividad.
- Compresion controlada: objetivo de salida entre 0,4 y 1,0 veces la longitud de entrada, con mediana aproximada de 0,7.
- Generalizacion de longitud mejorada respecto a rewrite2-4b: admite entradas de varios miles de caracteres sin trocear, aunque el autor recomienda segmentar manuscritos muy largos.
- Generacion de texto conversacional (etiqueta `conversational` en el repositorio).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio.
- Capacidad multilingue: no disponible; la tarea, los datos y los ejemplos estan en chino.

## Casos de uso

- Limpieza editorial de manuscritos de webnovel generados por IA: el modelo recibe el capitulo completo con puntuaciones jevnovel por frase y devuelve un analisis mas una version reescrita mas densa, que el autor humano solo tiene que retocar. Adecuado por su CoT entrenado y por la ventana suficiente para capitulos de varios miles de caracteres.
- Deteccion y correccion de "olor a IA" en pipelines editoriales: integrado como paso previo a la revision humana, reduce el trabajo de reescritura manual de los patrones mas reconocibles (paralelismos, relleno explicativo, transiciones formulaicas).
- Armonizacion de estilo en series largas: al conservar el significado y comprimir la prosa, sirve para homogeneizar capitulos con mezcla de autoria humana y asistida.
- Preedicion de traducciones automaticas de ficcion: la tarea de compresion y eliminacion de muletillas es aplicable a textos traducidos con exceso de calcos y explicaciones redundantes, siempre que el idioma de trabajo sea el chino o se valide el comportamiento en otros idiomas.
- Prototipado de asistentes de escritura para autores: el desglose `</think>` (analisis) y `content` (texto final) permite mostrar al usuario el diagnostico editorial junto con la propuesta, util en herramientas de escritura colaborativa.
- Evaluacion comparativa de modelos de deteccion de AIGC: las puntuaciones jevnovel y las reescrituras resultantes sirven como corpus de referencia para medir la eficacia de clasificadores de texto generado.
- Despliegue en estaciones de trabajo modestas: al ser un Q4_K_M de 2,8 GB con MTP embebido, cabe en una GPU de 16 GB y permite iterar sobre capitulos completos en local sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos numericos aportados por el autor son internos de la cabeza MTP: teacher-forced top1 del 72,8 % y accept_proxy del 83,7 %. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de evaluacion de calidad de reescritura.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB de pesos en Q4_K_M mas overhead de contexto KV; el autor indica que 16 GB de VRAM son suficientes para ejecutar con comodidad.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 y cualquier GPU de 16 GB o mas; en el extremo bajo, el modelo puede caber en GPUs de 8-12 GB con contexto reducido, aunque no se documenta explicitamente.
- Cabe en GPU de consumo: si, segun el autor, en 16 GB.
- Opciones de despliegue: `llama-server` de llama.cpp con soporte de Qwen3.5 MTP (build b11946 o posterior recomendado), usando `--spec-type draft-mtp --spec-draft-n-max 3 --jinja -ngl 99 -c 8192`. El repositorio incluye `INSTRUCTION.txt` con la instruccion de tarea que debe anteponerse a la entrada, `samples_autotavern.jsonl` con tres casos reales y `SHA256SUMS`.
- Parametros de muestreo recomendados: `temperature=0.9`, `top_p=0.95`, `repetition_penalty=1.05`, `max_tokens=6144`. El CoT consume habitualmente entre 3.000 y 4.000 tokens, por lo que un limite bajo produce solo analisis sin texto final.
- Latencia y throughput: no disponibles. El autor afirma que la decodificacion especulativa con la MTP embebida acelera la inferencia en GPUs de gama baja, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| rewrite3-exp-4B (este) | 4,33 B | no disponible | Reescritura de webnovel con CoT entrenado y puntuacion por frase | Hereda Qwen3.5 | GGUF Q4_K_M |
| rewrite2-4b | no disponible | no disponible | Reescritura sin CoT; requiere trocear la entrada | no disponible | GGUF |
| jevnovel3 27B | 27 B | no disponible | Modelo profesor de puntuacion de "calidad degradada" por frase | no disponible | no disponible |
| Qwen3.5-4B (base) | 4 B | no disponible | Modelo generalista de proposito multiple | Licencia Qwen3.5 | safetensors y derivados |

La comparacion con modelos generalistas de 4 B no es directa: rewrite3-exp-4B esta especializado en una unica tarea y no se han publicado evaluaciones que permitan situarlo frente a alternativas genericas en calidad de reescritura. rewrite2-4b es el predecesor directo y la referencia natural para medir la mejora que aporta el CoT.

## Limitaciones y advertencias

- Version experimental y congelada: el autor advierte que no recibira actualizaciones y recomienda la version oficial rewrite3, que afirma tener mejor rendimiento.
- La salida es siempre mas corta que la entrada (0,4 a 1,0 veces, mediana 0,7). No es posible conservar la longitud original con esta version; usarla para tareas que requieran paridad de longitud produce perdida de contenido.
- Dependencia de puntuaciones externas: sin puntuaciones jevnovel (todo `【NA】`), el modelo subestima la gravedad de los defectos y reescribe con menos decision. El pipeline optimo exige ejecutar un modelo adicional de 0,8 B.
- Riesgo de alucinacion y de alteracion del significado: al reescribir y comprimir, puede eliminar matices, fusionar frases con informacion distinta o introducir detalles no presentes en el original; no se documentan evaluaciones de fidelidad semantica.
- Sesgos: el corpus de entrenamiento son 20.000 webnovels con contenido SFW y NSFW, sin documentacion sobre filtrado, diversidad de generos ni sesgos demograficos. El modelo puede reproducir convenciones de genero y sesgos presentes en ese corpus.
- Contenido NSFW: el entrenamiento incluye material para adultos; no se especifican salvaguardas ni filtros de salida.
- Idiomas: no hay datos sobre soporte de idiomas distintos del chino; no debe asumirse un comportamiento correcto en castellano.
- Licencia: hereda la de Qwen3.5, pero el repositorio no incluye el texto de la licencia ni aclara condiciones de uso comercial; debe verificarse en el repositorio del modelo base antes de un despliegue en produccion.
- Requiere un build de llama.cpp con soporte especifico de Qwen3.5 MTP; versiones anteriores pueden no cargar correctamente la cabeza embebida.
- El parseo de la salida depende del separador `</think>`; con `llama-server` el analisis llega en `reasoning_content` y el texto final en `content`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aikexue170/rewrite3-4b-exp-q4km
- Predecesor rewrite2-4b (GGUF): https://huggingface.co/aikexue170/rewrite2-4b-gguf
- Modelo de puntuacion jevnovel 0.8B (FP8): https://huggingface.co/aikexue170/jev-novel-3-0.8b-fp8
