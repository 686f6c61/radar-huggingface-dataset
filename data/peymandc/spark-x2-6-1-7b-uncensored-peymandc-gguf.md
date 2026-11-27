# Peymandc/Spark-X2.6-1.7B-Uncensored-Peymandc-GGUF

## Resumen

Spark-X2.6-1.7B-Uncensored-Peymandc-GGUF es la versión cuantizada en formato GGUF del modelo conversacional Spark-X2.6-1.7B, desarrollado originalmente por XHToken y modificado por Peymandc para eliminar su comportamiento de rechazo (decensoring) mediante la herramienta Heretic v2.1.0. Se trata de un modelo de lenguaje causal compacto de 1.707.657.216 parámetros (aproximadamente 1,7 mil millones), pensado para inferencia local eficiente y orientado a conversación general, razonamiento, código y tareas de contexto largo.

El modelo original emplea la arquitectura propietaria `spark2_5` y declara una longitud de contexto configurada de 1.048.576 tokens, una cifra inusualmente alta para su tamaño. Esta versión GGUF distribuye cuatro cuantizaciones (BF16, Q4_K_M, Q6_K y Q8_0) que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp, con requisitos de memoria que van desde 1,11 GB hasta 3,42 GB según la variante elegida.

Su relevancia actual reside en dos factores: por un lado, ofrece una ventana de contexto declarada muy superior a la de otros modelos de su tamaño; por otro, la modificación Heretic suprime las respuestas de rechazo, lo que lo hace útil para investigación sobre alineación y para aplicaciones creativas o de rol, pero también incrementa el riesgo de generar contenido dañino o inexacto. La licencia Apache 2.0 facilita su uso comercial, aunque con las advertencias de seguridad pertinentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (modelo de lenguaje causal, `Spark2_5ForCausalLM`) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.048.576 tokens configurados (el contexto util depende del motor de inferencia, memoria y configuracion del KV cache) |
| Tipos de cuantizacion | BF16, Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 7,8 GB con las cuatro variantes) |

## Arquitectura y entrenamiento

La arquitectura declarada es `spark2_5`, registrada en llama.cpp como `Spark2_5ForCausalLM` a partir de la build `b10828`. Se trata de un transformer causal de aproximadamente 1,7 mil millones de parámetros, sin indicios de que sea un modelo de mezcla de expertos. El modelo soporta un modo de razonamiento configurable a través de la plantilla de chat (`enable_thinking` y `reasoning_effort` con valores `low` y `high`), activado por defecto con esfuerzo `high` en la plantilla original de Transformers.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La modificación de esta versión consiste en un proceso de decensoring con Heretic v2.1.0 basado en Arbitrary-Rank Ablation (ARA), con ablación entre las capas 7 y 15, `neighbor_count` de 14 y pesos de preservación de comportamiento correcto de 0,9772. Según la model card, este proceso redujo las coincidencias de palabras clave de rechazo de 100/100 a 4/100 sobre los primeros 100 prompts de `mlabonne/harmful_behaviors`, con una divergencia KL de 0,0165 frente al modelo original medida sobre `mlabonne/harmless_alpaca`. Estas métricas corresponden al checkpoint original en Transformers y no han sido evaluadas de forma independiente sobre las cuantizaciones GGUF.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento configurable (`enable_thinking`, `reasoning_effort` en `low` y `high`).
- Capacidades de código y matemáticas según la model card del modelo original (sin benchmarks publicados en esta información).
- Procesamiento de contexto largo gracias a la ventana configurada de 1.048.576 tokens.
- Comportamiento decensored: responde a solicitudes que el modelo original rechazaría.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso en la información disponible.
- No se documentan capacidades de visión ni audio.
- Compatible con llama.cpp (`llama-cli`, `--jinja`, `-cnv`) y aplicaciones locales que consuman GGUF.

## Casos de uso

- Conversación local en hardware modesto: con la cuantización Q4_K_M (1,11 GB) el modelo puede ejecutarse en equipos con poca RAM o VRAM, ideal para prototipos de asistentes personales sin conexión.
- Investigación sobre alineación y decensoring: permite estudiar el efecto de la ablación ARA comparando respuestas con el modelo original, útil en trabajos académicos sobre refusal behavior.
- Generación creativa sin restricciones: escritura de ficción, guiones o role-play donde el modelo original bloquearía ciertos temas; requiere revisión humana por el riesgo de contenido inapropiado.
- Procesamiento de documentos largos: la ventana declarada de más de un millón de tokens permite, en teoría y con suficiente memoria para el KV cache, resumir o consultar corpus extensos en una sola pasada.
- Asistencia de código en local: integrable en editores mediante llama.cpp para autocompletado y explicación de fragmentos, sin enviar código a servicios externos.
- Experimentación con modos de razonamiento: comparar `reasoning_effort` bajo y alto para evaluar el coste/beneficio del pensamiento extendido en tareas de lógica.
- Despliegue en entornos aislados (air-gapped): al ser GGUF y Apache 2.0, puede distribuirse en infraestructuras sin acceso a internet ni dependencias de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación reportada es la de decensoring de la model card (coincidencias de palabras clave de rechazo: 4/100 frente a 100/100 del original; divergencia KL de 0,0165), que no mide calidad general ni rendimiento en tareas.

## Requisitos de hardware

- VRAM/RAM estimada para los pesos: BF16 3,42 GB; Q8_0 1,82 GB; Q6_K 1,41 GB; Q4_K_M 1,11 GB. A esto hay que sumar el KV cache, que crece con la longitud de contexto utilizada.
- El tamaño del archivo GGUF no equivale al requisito total de RAM o VRAM; con contextos largos el KV cache puede dominar el consumo.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con la cuantización Q4_K_M o Q6_K; también es viable en CPU con suficiente RAM.
- GPU de datacenter (A100, H100) no son necesarias para el modelo, aunque permitirían contextos mucho mayores al disponer de más memoria para el KV cache.
- Despliegue mediante llama.cpp build `b10828` o superior (soporte nativo de `Spark2_5ForCausalLM`); no se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Uncensored (este) | 1,71 B | 1.048.576 configurados | Apache 2.0 | GGUF | Decensored con Heretic; en/zh |
| Modelo original XHToken/Spark-X2.6-1.7B | 1,71 B | 1.048.576 configurados | no disponible en esta ficha | Transformers | Con rechazo activo; base de esta versión |
| Alternativas de ~1,7 B (p. ej. Qwen, Llama pequeños) | ~1,5-2 B | variable | variable | safetensors/GGUF | No se dispone de datos comparativos de rendimiento en esta información |

No se dispone de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de su categoría; la comparativa se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo decensored: puede responder a solicitudes dañinas, ilegales o socialmente inapropiadas; no debe desplegarse sin filtros externos en aplicaciones de cara al público.
- Riesgo elevado de alucinación e información inexacta; la model card advierte explícitamente que las salidas no deben considerarse información verificada.
- La evaluación de rechazo es un proxy por coincidencia de palabras clave, no una evaluación semántica ni revisada por humanos.
- Las métricas de decensoring corresponden al checkpoint en Transformers; las cuantizaciones GGUF no han sido evaluadas de forma independiente.
- Cobertura lingüística limitada a inglés y chino; el rendimiento en castellano no está documentado.
- El contexto útil real depende del motor, la memoria disponible y la configuración del KV cache; la cifra de 1.048.576 tokens es un máximo configurado, no una garantía práctica.
- Requiere llama.cpp `b10828` o superior; versiones anteriores no soportan la arquitectura `spark2_5`.
- Aunque la licencia es Apache 2.0, el uso comercial de contenido generado puede acarrear responsabilidades legales según la jurisdicción y el contexto de aplicación.
- El repositorio tiene 0 descargas y 1 like en el momento de la ficha, por lo que la validación comunitaria es prácticamente nula.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Peymandc/Spark-X2.6-1.7B-Uncensored-Peymandc-GGUF
- Modelo base modificado: https://huggingface.co/Peymandc/Spark-X2.6-1.7B-Uncensored-Peymandc
- Modelo original: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Heretic (herramienta de decensoring): https://github.com/NousResearch/heretic
- Página de apoyo del autor: https://huggingface.co/spaces/Peymandc/support
