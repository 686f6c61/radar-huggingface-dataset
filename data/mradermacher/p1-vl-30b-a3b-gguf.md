# mradermacher/P1-VL-30B-A3B-GGUF

## Resumen

P1-VL-30B-A3B es un modelo vision-language de razonamiento desarrollado por PRIME-RL, orientado a problemas cientificos y, de forma especifica, a olimpiadas de fisica. Combina entrada de imagen y texto con capacidades de razonamiento multi-paso, lo que lo situa en la categoria de modelos multimodales especializados en STEM. Esta ficha documenta la version cuantizada en GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo sin necesidad de GPUs de datacenter.

El modelo base cuenta con 30.532.122.624 parametros totales segun los pesos en safetensors, y la nomenclatura "A3B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

La relevancia actual de esta publicacion radica en la disponibilidad de cuantizaciones estaticas en formato GGUF (desde Q2_K hasta Q8_0, ademas de los ficheros mmproj para la torre de vision), que reducen el peso del modelo desde los 209,9 GB del repositorio original hasta aproximadamente 11,4 GB en Q2_K, haciendo viable su despliegue en estaciones de trabajo con GPUs consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura A3B sugiere MoE con ~3B activos, sin confirmar) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (probablemente ~3B por la nomenclatura, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16; tambien disponibles quants con imatrix en repositorio separado |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El nombre del modelo, P1-VL-30B-A3B, indica un modelo vision-language (VL) con 30.000 millones de parametros totales y la notacion A3B, que en la convencion habitual de modelos MoE (como Qwen3-30B-A3B) indica aproximadamente 3.000 millones de parametros activos por token. Esta interpretacion es coherente con el tamano del repositorio y con la existencia de cuantizaciones que caben en GPUs consumer, pero no se confirma de forma explicita en la model card.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Los tags del modelo (science, physics, reasoning, olympiad) sugieren un entrenamiento orientado a razonamiento cientifico y resolucion de problemas de fisica de nivel olimpiada, probablemente con tecnicas de reinforcement learning, pero esta informacion no se explicita en la documentacion disponible. El autor de las cuantizaciones indica que se han generado tanto quants estaticos como quants ponderados con imatrix (en repositorio separado), lo que sugiere que el modelo base es lo suficientemente grande como para que la cuantizacion con importancia mejore la calidad en tamanos bajos.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis en problemas cientificos y de fisica.
- Comprension de imagenes (vision-language): el repositorio incluye ficheros mmproj (multi-modal projector) en Q8_0 y f16, necesarios para procesar entrada visual.
- Razonamiento orientado a olimpiadas de fisica y problemas STEM, segun los tags del modelo.
- Conversacion multi-turno (tag conversational en HuggingFace).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no confirmadas explicitamente, aunque el tag reasoning sugiere razonamiento encadenado.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Resolucion de problemas de fisica de olimpiada: el modelo esta etiquetado especificamente para olympiad y physics, por lo que puede emplearse como tutor o asistente para resolver y explicar problemas de mecanica, electromagnetismo o termodinamica a nivel de competicion, incluyendo problemas con diagramas si se aporta la imagen.
- Analisis de figuras y diagramas cientificos: gracias a la torre de vision (mmproj), puede interpretar graficos, esquemas de circuitos o diagramas de cuerpo libre y razonar sobre ellos, algo util en plataformas educativas de STEM.
- Asistente de investigacion en fisica: con 30.000 millones de parametros totales y licencia Apache 2.0, puede integrarse en pipelines internos de revision de literatura o comprobacion de derivaciones, sin restricciones de uso comercial.
- Despliegue en estaciones de trabajo con GPU consumer: las cuantizaciones Q4_K_M (18,7 GB) o Q5_K_M (21,8 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) usando llama.cpp u Ollama, lo que facilita prototipado local sin coste de API.
- Generacion de material docente con soporte visual: puede producir explicaciones paso a paso a partir de una imagen de un problema, util para generar contenido educativo automatizado en ingles.
- Evaluacion comparativa de razonamiento cientifico: al ser un modelo especializado con licencia permisiva, sirve como referencia en benchmarks internos de razonamiento fisico frente a modelos generalistas.
- Chat conversacional tecnico en ingles: el tag conversational y el soporte multi-turno permiten usarlo como asistente de dudas cientificas en entornos de habla inglesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y mmproj):
  - Q2_K: ~11,4 GB de pesos; ~13-14 GB con contexto y proyector visual.
  - Q3_K_M: ~14,8 GB; ~17 GB en uso real.
  - Q4_K_M: ~18,7 GB; ~21-22 GB con contexto moderado y mmproj.
  - Q5_K_M: ~21,8 GB; ~24-25 GB en uso real.
  - Q6_K: ~25,2 GB; ~28 GB en uso real.
  - Q8_0: ~32,6 GB; ~35 GB en uso real.
- GPUs recomendadas:
  - RTX 4090 (24 GB): Q4_K_M o Q5_K_S con contexto moderado; Q3_K_M con contexto amplio.
  - RTX 3090 (24 GB): mismas opciones que la 4090, con menor throughput.
  - A100 40 GB / H100 80 GB: Q8_0 o Q6_K con contexto largo.
  - Multi-GPU consumer: Q6_K y Q8_0 pueden repartirse entre dos GPUs de 24 GB.
- Cabe en GPU consumer: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo Q2_K o Q3_K_S con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con vLLM o TGI si se dispone de hardware adecuado.
- Latencia y throughput estimados: no disponibles. Al tratarse presumiblemente de un MoE con ~3B activos, el throughput deberia ser notablemente superior al de un denso de 30B, pero este dato no se confirma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P1-VL-30B-A3B (esta ficha) | 30,5B totales (activos no confirmados) | no disponible | si | Apache 2.0 | GGUF y safetensors |
| Qwen2.5-VL-32B | 32B densos | 128K (segun documentacion publica de Qwen) | si | Apache 2.0 | safetensors, GGUF de terceros |
| InternVL2.5-38B | 38B | 32K-128K (segun version) | si | MIT (segun version) | safetensors, GGUF de terceros |
| Llama 3.2 90B Vision | 90B (MoE) | 128K | si | Llama Community License | safetensors, GGUF oficiales |

Las cifras de los modelos comparables corresponden a documentacion publica de sus respectivos autores y pueden variar segun la version; no se dispone de benchmarks de P1-VL-30B-A3B para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado principalmente en ingles, puede presentar sesgos linguisticos y culturales propios de ese corpus.
- Riesgo de alucinacion: como todo modelo generativo, puede producir derivaciones o resultados fisicos plausibles pero incorrectos; en contextos cientificos requiere verificacion humana.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no se especifica, por lo que no debe asumirse una ventana larga sin comprobacion empirica.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar la licencia del modelo base original (PRIME-RL/P1-VL-30B-A3B) por si hubiera terminos adicionales no reflejados en esta ficha.
- Caveats para produccion: las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de razonamiento, especialmente en tareas de fisica donde la precision numerica importa; para produccion se recomienda Q5_K_M o superior. Ademas, la torre de vision requiere cargar el fichero mmproj correspondiente, y no todos los runtimes GGUF soportan vision de forma estable.
- El repositorio tiene 209,9 GB de tamano total, por lo que la descarga completa es costosa; conviene descargar solo el quant y el mmproj necesarios.
- No se han publicado benchmarks, lo que impide validar las afirmaciones de rendimiento en olimpiadas o fisica.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/P1-VL-30B-A3B-GGUF
- Modelo base: https://huggingface.co/PRIME-RL/P1-VL-30B-A3B
- Quants con imatrix: https://huggingface.co/mradermacher/P1-VL-30B-A3B-i1-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#P1-VL-30B-A3B-GGUF
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
