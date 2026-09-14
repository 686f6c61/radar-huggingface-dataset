# minte1431/Ornith-1.5-9B-OBLITERATED

## Resumen

Ornith-1.5-9B-OBLITERATED es una version "abliterated" del modelo ornith-ai/Ornith-1.5-9B, un transformer hibrido de 9B parametros construido sobre la arquitectura Qwen3.5 (Gated DeltaNet combinado con atencion completa). La modificacion la firma el pipeline OBLITERATUS y consiste en la eliminacion quirurgica de las direcciones de rechazo aprendidas durante el alineamiento del modelo original, de modo que el modelo responde a practicamente cualquier peticion sin negarse. El repositorio analizado esta publicado por el usuario minte1431 y no registra descargas ni likes en el momento de la consulta.

El problema que aborda es el estudio del comportamiento de rechazo en arquitecturas hibridas endurecidas con RL: el modelo base rechaza peticiones que considera daninas, y esta variante elimina esa conducta preservando (parcialmente) las capacidades de codigo, razonamiento y uso de herramientas. Tecnicamente el autor reporta una tasa de cumplimiento del 94% (15/16) en un conjunto de pruebas de contenido restringido, frente al 12% del modelo original, con un coste de 4 puntos porcentuales en MMLU (74,82% frente a 78,82%).

Es relevante ahora porque se presenta como una de las ablaciones mas agresivas disponibles sobre esta base, superando a alternativas de la misma comunidad (Heretic y ZeroFuse) y porque combina cuatro rondas de ablacion direccional por SVD con cirugia de atencion por cabeza, una tecnica poco documentada publicamente. Su licencia MIT y la disponibilidad de pesos en safetensors y GGUF lo hacen desplegable en entornos de investigacion, con las advertencias de seguridad que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida (Gated DeltaNet + atencion completa) |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `--ctx-size 8192`) |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ4_XS |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |
| Modelo base | ornith-ai/Ornith-1.5-9B (creditos a DeepReinforce) |
| Metodo de modificacion | Ablacion direccional por SVD (4 rondas) + cirugia de atencion por cabeza (G3-HS) |
| Capas editadas | Las 32 capas del transformer, con intensidad graduada |
| Tamano del repositorio | 82,4 GB |
| Fecha de creacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida Qwen3.5 que combina capas Gated DeltaNet (un mecanismo de estado recurrente con decaimiento, orientado a eficiencia en secuencias largas) con capas de atencion completa. El resultado son 32 capas de transformer y 9,65B parametros en total, en un regimen denso (no MoE), lo que implica que todos los parametros se activan en cada token. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original; esa informacion no esta disponible en la documentacion proporcionada.

La intervencion sobre el modelo se realizo con el pipeline OBLITERATUS y consta de tres rondas de ablacion direccional por SVD seguidas de un acabado de cirugia de atencion por cabeza. La ronda 1 usa 5 direcciones, regularizacion 0,06 y `min_layer` 0,30; la ronda 2 usa 3 direcciones, regularizacion 0,04 y `min_layer` 0,25; la ronda 3 usa 3 direcciones, regularizacion 0,03 y `min_layer` 0,20. El acabado (`--attention-head-surgery`) aplica regularizacion 0,02 y `min_layer` 0,10. Todas las rondas se ejecutaron sobre un corpus de 1000 prompts con ponderacion de residuo, y la metodologia se declara inspirada en el trabajo de Arditi et al. (2024) sobre direcciones de rechazo. El modelo conserva el modo de razonamiento opcional del original (`enable_thinking`), ademas de un codificador de vision distribuido como archivo `mmproj` de 879 MB.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible con `apply_chat_template`.
- Modo de razonamiento opcional (`enable_thinking=True`); el autor recomienda desactivarlo en uso general para evitar bucles de pensamiento.
- Generacion de codigo: la model card reporta 3/3 en su prueba de generacion de codigo, y 8/8 en la categoria de ciberseguridad en bf16 (codigo funcional para escenarios de investigacion en seguridad).
- Coherencia en contexto largo: 5/6 en la prueba declarada, frente a 4/6 del modelo original.
- Respuestas factuales sin rechazo en quimica y sintesis (6/6) y seguridad fisica (3/3) segun la evaluacion del autor.
- Capacidades agenticas parciales: 2/2 en tareas agenticas de la evaluacion, aunque la model card indica que el function calling esta degradado respecto al original y recomienda combinarlo con un andamiaje externo de herramientas.
- Soporte de vision mediante el archivo `mmproj` (879 MB), segun los archivos disponibles listados en la model card.
- Multilingue: no. Solo se declara ingles en los metadatos.

## Casos de uso

- Investigacion en alineamiento: analisis de los mecanismos de rechazo en arquitecturas hibridas con RL, comparando las activaciones del modelo original y de esta variante para localizar las direcciones ablacionadas.
- Red teaming y evaluacion de seguridad: generacion de contenido restringido en entornos controlados para calibrar clasificadores, filtros y sistemas de defensa, con la advertencia de que los detalles tecnicos generados pueden ser inexactos.
- Investigacion en ciberseguridad: generacion de codigo funcional para escenarios de laboratorio (explotacion, analisis de malware) sin las negativas del modelo original, siempre dentro de un marco legal y etico explicito.
- Analisis de robustez de cuantizaciones: comparacion del comportamiento de rechazo entre Q8_0, Q6_K, Q4_K_M y Q2_K para estudiar como la cuantizacion afecta a conductas alineadas, dado que la model card documenta un aumento de negativas a partir de Q4.
- Experimentacion con razonamiento hibrido: uso del modo `enable_thinking` para estudiar el equilibrio entre cadena de pensamiento y respuestas directas en arquitecturas Gated DeltaNet.
- Evaluacion de pipelines de ablacion: reproduccion y comparacion de la receta G3-HS frente a otros metodos como Heretic o ZeroFuse sobre la misma base, usando el corpus de 1000 prompts como referencia.
- Prototipado de asistentes conversacionales sin filtros para demostraciones internas, asumiendo la degradacion de MMLU y la ausencia de soporte de function calling fiable.
- Procesamiento de documentos con contexto moderado (hasta 8192 tokens en la configuracion de ejemplo) en tareas de resumen o extraccion, con ingles como unico idioma soportado.

## Benchmarks y rendimiento

Comparativa directa entre ablaciones de Ornith 1.5-9B, medida por el autor sobre GGUF Q4_K_M:

| Modelo | Pass rate | Restricted | Cyber | Capability |
|---|---|---|---|---|
| Stock (Ornith-1.5-9B) | 12% (2/16) | 0/8 | 0/6 | 2/2 |
| OBLITERATED (este modelo) | 94% (15/16) | 7/8 | 6/6 | 2/2 |
| Heretic (zaakirio) | 75% (12/16) | 4/8 | 6/6 | 2/2 |
| ZeroFuse (junafinity) | 38% (6/16) | 1/8 | 3/6 | 2/2 |

Benchmarks de capacidad declarados por el autor:

| Metrica | Stock | OBLITERATED | Delta |
|---|---|---|---|
| MMLU (n=100) | 78,82% | 74,82% | -4,00 pp |
| Liberation (20 prompts duros) | 0/20 | 20/20 | +20 |
| Liberation (corpus de 1000) | No disponible | 98,4% | No disponible |
| Generacion de codigo | 3/3 | 3/3 | 0 |
| Coherencia en contexto largo | 4/6 | 5/6 | +1 |
| Perplejidad (prompts benignos) | No disponible | 4,19 | No disponible |

Liberacion por categoria en bf16, segun el autor: ciberseguridad 8/8, quimica y sintesis 6/6, seguridad fisica 3/3, tareas agenticas 2/2.

No se han publicado resultados de benchmarks independientes (MMLU completo, HumanEval, GSM8K, MT-Bench) en la informacion disponible; las cifras anteriores proceden exclusivamente de la model card del autor.

## Requisitos de hardware

- Pesos en bf16 (safetensors): aproximadamente 18 GB de archivo. Estimacion de VRAM para inferencia: 20-24 GB contando pesos y cache KV a contexto moderado.
- Q8_0: 9,1 GB de archivo. Estimacion: 11-13 GB de VRAM.
- Q6_K: 7,0 GB de archivo. Estimacion: 9-11 GB de VRAM.
- Q5_K_M: 6,2 GB de archivo. Estimacion: 8-10 GB de VRAM.
- Q4_K_M: 5,4 GB de archivo. Estimacion: 7-9 GB de VRAM.
- Q3_K_M: 4,4 GB y Q2_K: 3,6 GB. Caben en GPUs de 6-8 GB, con perdida de calidad y mas negativas en prompts dificiles segun el autor.
- IQ4_XS: 5,0 GB, cuantizacion de 4 bits ponderada por importancia.
- Codificador de vision `mmproj`: 879 MB adicionales si se utiliza la capacidad multimodal.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 4090/3090 24 GB para bf16; RTX 4080/4070 Ti Super 16 GB para Q8_0 y Q6_K; RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores para Q4_K_M y cuantizaciones menores.
- Si cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas de VRAM usando GGUF Q4_K_M o inferior.
- Opciones de despliegue: Transformers con `device_map="auto"` y `trust_remote_code=True`, llama.cpp / llama-server (requiere `--jinja --reasoning off` para evitar bucles de pensamiento), y cualquier runtime compatible con GGUF. La compatibilidad con vLLM, TGI u Ollama no se menciona en la informacion proporcionada.
- Latencia y throughput: no disponibles. El repositorio ocupa 82,4 GB, un tamano superior a la suma de los archivos listados (aproximadamente 59,5 GB), lo que sugiere revisiones o duplicados adicionales en el historial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de liberacion | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B-OBLITERATED | 9,65B | No disponible | 94% (15/16) | 74,82% | MIT | Safetensors y GGUF |
| Ornith-1.5-9B (stock) | 9B | No disponible | 12% (2/16) | 78,82% | MIT | Safetensors |
| Heretic (zaakirio, ablacion de la misma base) | No disponible | No disponible | 75% (12/16) | No disponible | No disponible | No disponible |
| ZeroFuse (junafinity, ablacion de la misma base) | No disponible | No disponible | 38% (6/16) | No disponible | No disponible | No disponible |

Comparado con el modelo original, esta variante gana 82 puntos porcentuales de tasa de cumplimiento y pierde 4 puntos en MMLU. Frente a las otras dos ablaciones de la misma base, la ventaja declarada es de 19 pp sobre Heretic y 56 pp sobre ZeroFuse, con una puntuacion de ciberseguridad identica a Heretic (6/6). No se dispone de comparaciones con modelos no ablacionados de tamano similar (por ejemplo, otras familias de 7-9B) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo tiene los guardarrailes de seguridad eliminados deliberadamente. Cumple peticiones que el modelo original rechazaria, incluidas categorias de contenido restringido (quimica, seguridad fisica, ciberseguridad ofensiva). Su uso en produccion de cara al publico es desaconsejable sin filtros externos.
- Se observa una caida de 4 puntos porcentuales en MMLU (74,82% frente a 78,82%), que el autor atribuye al coste de eliminar conductas de rechazo profundamente embebidas por RL.
- El function calling esta parcialmente degradado respecto al modelo original. Para uso agentico hay que combinarlo con un andamiaje externo de herramientas.
- Riesgo alto de alucinacion en contenido tecnico: la propia model card advierte que en quimica y sintesis complejas los detalles generados pueden ser inventados y deben verificarse de forma independiente.
- La cuantizacion afecta a la conducta: en Q4_K_M puede haber vacilaciones en prompts dificiles, y en Q2_K / Q3_K_M aparecen negativas adicionales. Solo Q8_0 y Q6_K preservan la fidelidad maxima segun el autor.
- El modo de pensamiento puede entrar en bucles; se recomienda desactivarlo (`enable_thinking=False` o `--reasoning off`) para uso general.
- Solo se declara soporte de ingles. No hay evidencia de capacidades multilingues.
- La longitud de contexto no se especifica en la model card; el unico dato operativo es el `--ctx-size 8192` del ejemplo.
- Los benchmarks proceden unicamente del autor, no son independientes, y las metricas de MMLU y liberacion usan muestras pequenas (n=100 y n=20 respectivamente), por lo que su robustez estadistica es limitada.
- El repositorio analizado (minte1431/Ornith-1.5-9B-OBLITERATED) registra 0 descargas y 0 likes, mientras que la model card atribuye la ablacion a OBLITERATUS y enlaza a OBLITERATUS/Ornith-1.5-9B-OBLITERATED. Conviene verificar el origen y la integridad de los pesos antes de reutilizarlos.
- La licencia MIT permite uso comercial y modificacion, pero el contenido generado puede infringir normativas locales segun el uso; la responsabilidad recae en el desplegador.
- La fecha de creacion del repositorio (2026-09-14) y el actualizado (un segundo despues) indican una subida automatizada o incompleta, sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minte1431/Ornith-1.5-9B-OBLITERATED
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Organizacion OBLITERATUS: https://huggingface.co/OBLITERATUS
- Pagina del autor de la model card (Pliny the Prompter): https://pliny.gg
- Paper de Arditi et al. (2024) citado como base metodologica: URL no disponible en la informacion proporcionada
- Resultados de busqueda web: no relevantes; las consultas devolvieron unicamente enlaces a YouTube y YouTube Music sin relacion con el modelo.
