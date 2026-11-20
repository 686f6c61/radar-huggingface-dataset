# OpensourceWTF/Hy4-flash-exl3

## Resumen

Hy4-flash-exl3 es una familia de cuantizaciones EXL3 del modelo base tencent/Hy4-flash, publicada por el usuario OpensourceWTF. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada exclusivamente a inferencia de texto con la librería exllamav3, que requiere un parche específico para cargar la arquitectura Hy4-flash. La relevancia de esta publicación radica en que permite ejecutar un modelo de arquitectura MoE de gran tamaño con bitrates muy bajos (1,75, 2,25 y 2,99 bits por peso) en hardware con memoria limitada, a costa de una pérdida de calidad que el autor aún no ha cuantificado públicamente.

El modelo base Hy4-flash pertenece a Tencent y emplea una arquitectura MoE con 42 capas (la capa 0 densa y las capas 1 a 41 con 512 expertos enrutados cada una), además de un componente denominado Engram con 63,4 mil millones de parámetros almacenados en tablas de n-gramas. La model card no detalla el número total de parámetros del modelo base, su longitud de contexto nativa ni los idiomas soportados, por lo que esos datos figuran como no disponibles en esta ficha.

La publicación se encuentra en estado temprano: cero descargas y cero likes en el momento de la consulta, ramas que se iban subiendo de forma secuencial y una evaluación con `eval/model_diff.py` declarada como "en progreso" sin resultados numéricos publicados. Es, por tanto, un artefacto útil para experimentación con exllamav3 y arquitecturas MoE exóticas, pero no una opción validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 42 capas (capa 0 densa, capas 1-41 con 512 expertos enrutados), atención indexada comprimida en 12 capas y tablas Engram de n-gramas |
| Parámetros totales | No disponible para el modelo base; las tablas Engram suman 63,4B parámetros |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible para el modelo base; el parche de exllamav3 limita a 2.048 claves las capas con indexador comprimido cuando se usa caché |
| Tipos de cuantización | EXL3 con recetas por tensor: ramas de 2,99 bpw, 2,25 bpw y 1,75 bpw (expertos enrutados entre K1 y K5) |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License, Version 1.0 (incluye la Sección 10 sobre grandes negocios de Model-as-a-Service) |
| Formato de pesos | safetensors EXL3 (`model-*.safetensors`), Engram en `ngram_embedding.safetensors` (fp8 con escala por fila), torre de visión y capas draft dfly copiadas sin usar |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 42 capas: una capa densa inicial y 41 capas con 512 expertos enrutados cada una. Doce capas de atención (0, 1, 5, 9, ..., 41) emplean un indexador comprimido que se activa cuando el contexto supera los 2.048 tokens. Además, incorpora un componente Engram de 4 capas y 63,4 mil millones de parámetros almacenados como tablas de embeddings de n-gramas, que el modelo recorre en fp8 en cada lectura. El repositorio incluye también una torre de visión y capas draft dfly, copiadas sin modificar, que la cuantización EXL3 no utiliza: los quants son solo de texto.

La cuantización se realizó con exllamav3 y un parche que añade soporte para la arquitectura Hy4-flash. La calibración usó una traza de `sc_trace.py` con 250 filas de hasta 2.048 tokens (unos 475K tokens), generada contra el modelo profesor servido en fp8 por el proveedor Tencent en OpenRouter con esfuerzo de razonamiento "high". La asignación de bits se hizo con `sc_optimize.py`, fijando un K por capa para sus 512 expertos enrutados y aplicando la regla de que todo tensor no experto (atención, expertos compartidos, proyecciones latentes, capa densa 0) y la cabeza reciben K igual al máximo K de expertos más 2. La conversión final usó `convert.py -rcp <recipe> -cd <trace> -cb mcg -mae 0.01`. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto: es la única modalidad funcional de estas cuantizaciones; la torre de visión incluida en el repositorio no se usa.
- Razonamiento y matemáticas: el modelo base se sirve con esfuerzo de razonamiento "high" durante la calibración, lo que sugiere capacidades de razonamiento extendido, aunque no hay evaluación publicada de los quants.
- Mezcla de expertos: 512 expertos enrutados por capa en 41 capas, lo que permite activar solo una fracción de los parámetros por token (el número exacto de expertos activos no está disponible).
- Contexto largo con matices: las capas con indexador comprimido funcionan sin caché hasta al menos 3.236 tokens según las comprobaciones del autor; con caché, esas capas admiten como máximo 2.048 claves, por lo que generaciones largas se detienen en ese punto.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Memoria de n-gramas: el componente Engram de 63,4B parámetros añade una forma de memoria léxica o de secuencias que el modelo consulta durante la inferencia.

## Casos de uso

- Experimentación con exllamav3: cargar las ramas de 1,75 o 2,25 bpw en un entorno de desarrollo con el parche `exllamav3-hy4/` para validar el soporte de la arquitectura Hy4-flash y comparar la salida con la referencia en transformers (PR #50903).
- Inferencia de texto en GPUs de gama alta con memoria ajustada: la rama de 1,75 bpw reduce el peso de los tensores cuantizados al mínimo, lo que permite probar un MoE de 41 capas con 512 expertos en un único nodo, siempre que se acepte la pérdida de calidad no medida.
- Investigación sobre cuantización extrema: las recetas por capa publicadas en `recipe.yaml` y la asignación de K por capa (de K1 a K5) sirven como caso de estudio para analizar cómo `sc_optimize.py` distribuye bits según la sensibilidad medida con `sc_measure.py --streaming --shaped`.
- Evaluación de degradación con `eval/model_diff.py`: el autor deja pendientes las métricas de KL, acuerdo top-1 y perplejidad, de modo que un tercero puede reproducir esa evaluación y comparar las tres ramas.
- Procesamiento de documentos de hasta 2.048 tokens: dentro de ese límite las capas con indexador comprimido funcionan con caché; es adecuado para resúmenes, extracción de entidades o clasificación de textos cortos en pipelines por lotes.
- Reproducción de la calibración: el flujo `sc_trace.py` → `sc_measure.py` → `sc_optimize.py` → `convert.py` documentado permite replicar la conversión con otras trazas o proveedores, útil para estudiar la sensibilidad del modelo a los datos de calibración.
- Docencia y divulgación: el repositorio separa claramente pesos, tablas Engram, torre de visión, capas draft, receta y parche, lo que facilita explicar las partes de un modelo MoE moderno con memoria de n-gramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación con `eval/model_diff.py` está en progreso y que las columnas de KL, acuerdo top-1 y perplejidad B de la tabla de ramas aparecen vacías.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. El tamaño de cada rama incluye las tablas Engram (66,0 GB) más los tensores cuantizados, cuya cifra concreta no se publica en la información disponible.
- Las tablas Engram son idénticas en todas las ramas y ocupan 66,0 GB en fp8, por lo que cualquier despliegue necesita al menos esa cantidad de memoria más el espacio de los pesos EXL3 y la caché KV.
- GPU recomendadas: no disponibles en la información proporcionada; por el volumen de las tablas Engram, un único acelerador de consumo (24 GB) no es suficiente para cargar el repositorio completo.
- Cabe en GPU de consumo: no, según el tamaño de las tablas Engram indicado por el autor.
- Opciones de despliegue: exllamav3 con el parche `exllamav3-hy4/` sobre la rama `dev` (commit `627c8710ab69bd8a581018489a177c64746b2688`). La librería estándar de exllamav3 no carga estos quants.
- La caché KV almacena claves y valores expandidos por cabeza, lo que consume más memoria que la caché latente comprimida de la referencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpensourceWTF/Hy4-flash-exl3 | No disponible (Engram: 63,4B) | No disponible (límite práctico de 2.048 claves con caché en capas indexadas) | EXL3 a 1,75 / 2,25 / 2,99 bpw | Tencent Hy License 1.0 | Hugging Face, 0 descargas |
| LibertAIDAI/Hy4-flash-EXL3-2.5bpw | No disponible | No disponible | EXL3 a 2,5 bpw | No disponible | Hugging Face |
| LibertAIDAI/Hy4-flash-EXL3-3bpw | No disponible | No disponible | EXL3 a 3 bpw | No disponible | Hugging Face |
| LibertAIDAI/Hy4-flash-EXL3-4bpw | No disponible | No disponible | EXL3 a 4 bpw | No disponible | Hugging Face |

Las alternativas encontradas son otras cuantizaciones EXL3 del mismo modelo base publicadas por otro usuario (LibertAIDAI), con bitrates de 2,5, 3 y 4 bpw. No se dispone de datos de rendimiento comparativo entre ellas ni de modelos de distinta familia con los que contrastar.

## Limitaciones y advertencias

- Requiere un parche no oficial de exllamav3: la versión estándar de la librería no puede cargar estos quants.
- Limitación de contexto con caché: las 12 capas con indexador comprimido admiten como máximo 2.048 claves cuando se usa caché, por lo que las generaciones largas se detienen en ese punto. Sin caché, el autor verificó hasta 3.236 tokens.
- La caché KV expandida por cabeza consume más memoria que la caché latente de la referencia.
- No hay métricas de degradación publicadas (KL, acuerdo top-1, perplejidad) para ninguna de las tres ramas; se desconoce el impacto real de bajar a 1,75 bpw.
- Solo texto: la torre de visión y las capas draft dfly se copian pero no se usan.
- Licencia Tencent Hy License 1.0 con Sección 10 sobre grandes negocios de Model-as-a-Service: conviene revisar las condiciones antes de un uso comercial a escala.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Publicación sin tracción (0 descargas, 0 likes) y con ramas subidas de forma secuencial: verificar que la rama elegida esté completa antes de descargar.
- El modelo base se distribuye en fp8 vía OpenRouter para la calibración, lo que introduce una diferencia respecto a los pesos originales que el autor asume explícitamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpensourceWTF/Hy4-flash-exl3
- Rama 2.99bpw: https://huggingface.co/OpensourceWTF/Hy4-flash-exl3/tree/2.99bpw
- Rama 2.25bpw: https://huggingface.co/OpensourceWTF/Hy4-flash-exl3/tree/2.25bpw
- Rama 1.75bpw: https://huggingface.co/OpensourceWTF/Hy4-flash-exl3/tree/1.75bpw
- Parche exllamav3-hy4: https://huggingface.co/OpensourceWTF/Hy4-flash-exl3/tree/main/exllamav3-hy4
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
- Referencia transformers (PR #50903): no disponible como enlace directo en la información proporcionada
- Otras cuantizaciones del mismo base: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-2.5bpw, https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-3bpw, https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-4bpw
