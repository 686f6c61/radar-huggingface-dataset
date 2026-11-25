# mradermacher/Kitchoon-V5-Clean-26B-A4B-i1-GGUF

## Resumen

Kitchoon-V5-Clean-26B-A4B-i1-GGUF es una cuantizacion en formato GGUF, generada por mradermacher, del modelo SubMaroon/Kitchoon-V5-Clean-26B-A4B. Se trata de un modelo de arquitectura Mixture of Experts (MoE) derivado de la familia Gemma 4, con 25.233.142.046 parametros totales segun los pesos en safetensors del modelo base. El sufijo "A4B" indica que activa aproximadamente 4.000 millones de parametros por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano.

El modelo esta orientado a roleplay y conversacion, con etiquetas que lo identifican como "heretic" y "uncensored", es decir, con el alineamiento de seguridad reducido o eliminado respecto al modelo original. Esta pensado para su uso en entornos como SillyTavern y flujos conversacionales de personajes, y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que el repositorio ofrece cuantizaciones con imatrix (metodo i1 de ikawrakow) en un rango muy amplio de tamanos, desde 8,4 GB en IQ1_S hasta 22,7 GB en Q6_K, lo que permite desplegar un MoE de 25.000 millones de parametros en hardware de consumo. El autor indica ademas que es un modelo de vision, con archivos mmproj disponibles en el repositorio estatico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de Gemma 4 |
| Parametros totales | 25.233.142.046 |
| Parametros activos | aproximadamente 4.000 millones (indicado por el sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | ingles (segun la model card del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es una arquitectura Mixture of Experts basada en Gemma 4, con 25.233 millones de parametros totales y aproximadamente 4.000 millones activos por token. La naturaleza MoE implica que cada token se enruta a un subconjunto de expertos, de modo que el coste de computo por token es notablemente inferior al de un modelo denso del mismo tamano total. La model card del repositorio no detalla el numero de expertos, la proporcion de activacion exacta ni la configuracion de atencion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo base. Las etiquetas "heretic" y "uncensored" sugieren un proceso de fine-tuning orientado a reducir las negativas de seguridad del modelo original, pero el repositorio no documenta la metodologia. Esta version concreta es una cuantizacion: mradermacher ha generado los ficheros GGUF a partir del modelo base mediante cuantizacion con imatrix (importancia matricial), que pondera la precision de cada tensor segun su relevancia para la perplejidad.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y personajes.
- Conversaciones multi-turno con mantenimiento de personaje, segun la orientacion declarada del modelo.
- Capacidades de vision: el autor indica que es un modelo de vision y que los ficheros mmproj estan en el repositorio estatico.
- Alineamiento de seguridad reducido ("uncensored", "heretic"), lo que amplia el rango de respuestas ante peticiones que el modelo original rechazaria.
- Compatibilidad con SillyTavern y flujos de roleplay.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles.

## Casos de uso

- Roleplay conversacional en local: el modelo esta etiquetado explicitamente para roleplay y SillyTavern; con cuantizaciones de 15-17 GB (i1-Q4_K_S, i1-Q4_K_M) puede ejecutarse en una GPU de consumo de 24 GB manteniendo coherencia de personaje en conversaciones largas.
- Personajes de ficcion interactivos: la orientacion "uncensored" permite explorar narrativas y dialogos que los modelos alineados rechazan, util en escritura creativa y juegos de rol de mesa asistidos.
- Prototipado de chatbots de entretenimiento: la licencia Apache 2.0 permite integrar el modelo en productos comerciales de chat sin restricciones de uso derivadas de la licencia.
- Despliegue en hardware limitado: las cuantizaciones IQ2 e IQ3 (9,4-13,9 GB) permiten ejecutar un MoE de 25.000 millones de parametros en GPUs de 12-16 GB o en configuraciones CPU+GPU con llama.cpp.
- Escritura asistida de narrativa larga: la naturaleza MoE con 4.000 millones de parametros activos ofrece un equilibrio entre calidad de generacion y velocidad, adecuado para generar borradores extensos de ficcion.
- Experimentacion con modelos sin alineamiento: util para investigadores que estudian el comportamiento de modelos con el filtrado de seguridad reducido, comparando respuestas frente al Gemma 4 original.
- Evaluacion de cuantizaciones: el repositorio incluye 23 variantes de cuantizacion mas el fichero imatrix, lo que permite medir el impacto de la precision en la calidad conversacional sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas overhead de contexto. Rangos: 8,4-10,7 GB (IQ1, Q2), 11,4-14,0 GB (IQ3, IQ4_XS), 14,6-16,9 GB (Q4), 18,1-19,2 GB (Q5), 22,7 GB (Q6_K).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q4_K_M y Q5_K_M; RTX 4080 (16 GB) para Q4_K_S; GPUs de 12 GB para IQ2_M e IQ3_XXS; A100 o H100 para despliegues de alta concurrencia en Q6_K o para servir multiples instancias.
- Cabe en GPU de consumo: si. Las cuantizaciones IQ2 e IQ3 caben en GPUs de 12-16 GB; Q4_K_M (16,9 GB) cabe en 24 GB; Q6_K (22,7 GB) requiere 24 GB con contexto corto o 32 GB para margen.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp, text-generation-webui) son las rutas naturales para GGUF. vLLM y TGI no soportan GGUF de forma nativa; para esos motores habria que usar el modelo base en safetensors. El soporte de vision requiere el fichero mmproj del repositorio estatico.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un MoE con aproximadamente 4.000 millones de parametros activos, el throughput por token deberia ser sustancialmente mayor que el de un modelo denso de 25.000 millones, pero no hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kitchoon-V5-Clean-26B-A4B (este) | 25,2 B | aprox. 4 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Gemma 4 (modelo base de referencia) | no disponible | no disponible | no disponible | no disponible | safetensors |
| Modelos densos de 24-27 B en GGUF | 24-27 B | 24-27 B | variable | variable | GGUF |

La comparacion directa con alternativas concretas no esta disponible en la informacion proporcionada. El principal diferencial frente a un modelo denso de tamano similar es la activacion de solo aproximadamente 4.000 millones de parametros por token, lo que reduce el coste de inferencia, aunque a cambio de un mayor consumo de memoria para mantener todos los expertos en VRAM.

## Limitaciones y advertencias

- Modelo "uncensored" y "heretic": el alineamiento de seguridad esta reducido o eliminado, por lo que puede generar contenido que los modelos alineados rechazan. No es apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; al ser un modelo orientado a roleplay, la prioridad es la coherencia narrativa, no la exactitud.
- Idioma: la model card solo declara ingles; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Longitud de contexto: no disponible. No se puede garantizar el comportamiento en conversaciones muy largas sin datos del autor.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo en su jurisdiccion.
- Cuantizaciones de baja precision: el propio autor advierte que Q2_K_S es de "very low quality" y que IQ1_S es "for the desperate"; por debajo de IQ3 la degradacion conversacional puede ser notable.
- Vision: los ficheros mmproj no estan en este repositorio sino en el estatico; sin ellos el modelo funciona solo como texto.
- Procedencia del fine-tuning no documentada: se desconoce el dataset y el metodo usado para reducir el alineamiento, lo que dificulta evaluar sesgos introducidos.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/Kitchoon-V5-Clean-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V5-Clean-26B-A4B
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Kitchoon-V5-Clean-26B-A4B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Kitchoon-V5-Clean-26B-A4B-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
