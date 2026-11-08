# jsantillana/gemma-4-31B-it-GGUF

## Resumen

Gemma 4 31B-it (Abliterated - GGUF Quantizations) es un conjunto de cuantizaciones GGUF del modelo denso Gemma 4 31B instruction-tuned, publicado por el usuario jsantillana sobre el modelo base `jsantillana/gemma-4-31B-it-abliterated`. El modelo original procede de Google DeepMind y, segun la model card, se trata de su modelo denso insignia, con 60 capas transformer y una ventana de contexto de 256K tokens. Esta version concreta no es el checkpoint original: es una variante "abliterated", es decir, con las direcciones de rechazo eliminadas mediante edicion de pesos, reempaquetada en formato GGUF para su uso con llama.cpp.

La relevancia de esta publicacion es practica: ofrece tres niveles de cuantizacion (Q3_K_M, Q4_K_M y Q8_0) que permiten ejecutar un modelo de aproximadamente 30.700 millones de parametros en hardware de consumo, desde GPUs de 16 GB hasta estaciones de trabajo con 64 GB de RAM. Esta orientada a casos de red-teaming, ciberseguridad y evaluacion de comportamiento de modelos sin las restricciones de rechazo del modelo original.

El repositorio tiene un tamano de 66,6 GB y, en el momento de la consulta, no registra descargas ni likes. Los pesos se distribuyen bajo licencia Apache 2.0, aunque conviene tener en cuenta que la licencia del modelo derivado puede no coincidir con los terminos del modelo original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 60 capas (segun model card) |
| Parametros totales | 30.697.345.596 (30,7 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K), segun model card |
| Tipos de cuantizacion | Q3_K_M (~14,5 GB), Q4_K_M (~18,8 GB), Q8_0 (~33,0 GB) |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 (declarada en el repo) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 60 capas con 30.697 millones de parametros, segun los datos declarados en la model card y en los safetensors del modelo base. Se trata de la variante instruction-tuned del Gemma 4 31B de Google DeepMind, por lo que incorpora el pipeline de alineacion del modelo original (instrucciones y conversacion). Sobre ese checkpoint, el autor aplico una tecnica de "abliteration": la eliminacion o proyeccion de las direcciones de activacion asociadas al rechazo, de modo que el modelo deja de negarse a responder ante determinadas peticiones.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en esta publicacion; esos datos corresponden al modelo original de Google y no se reproducen aqui. La innovacion tecnica de esta ficha es exclusivamente el reempaquetado y la cuantizacion en GGUF para llama.cpp, con tres niveles que cubren desde CPUs con AVX2 hasta GPUs profesionales.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte declarado para ingles y espanol.
- Razonamiento y respuesta a instrucciones heredados del Gemma 4 31B instruction-tuned.
- Ejecucion local mediante llama.cpp, sin dependencia de APIs externas.
- Modo "abliterated": responde a peticiones que el modelo original rechazaria, lo que lo hace util para evaluacion de seguridad y red-teaming.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio de generacion de texto.
- No se declara soporte explicito de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite sondear el comportamiento del modelo sin filtros de rechazo para identificar vulnerabilidades, sesgos y modos de fallo antes de desplegar sistemas basados en Gemma.
- Investigacion en ciberseguridad: analisis de prompts maliciosos, generacion de casos de prueba de phishing o ingenieria social en entornos controlados, y estudio de la eficacia de las defensas.
- Despliegue local en estaciones de trabajo: con la cuantizacion Q8_0 (~33 GB) cabe en GPUs de 48 GB de VRAM o en workstations de 64 GB de RAM, lo que permite ejecutar un modelo de 31B sin conexion a internet.
- Prototipado en GPU de consumo: la variante Q4_K_M (~18,8 GB) encaja en una RTX 3090 o RTX 4090 de 24 GB de VRAM, lo que facilita experimentar con un modelo de 31B en hardware asequible.
- Procesamiento de documentos largos: la ventana de 256K tokens permite analizar contratos, informes o bases de codigo extensas en una sola pasada, aunque el coste de memoria crece con el contexto.
- Generacion de texto en espanol: el modelo declara soporte de espanol, por lo que puede emplearse en tareas de redaccion, resumen o traduccion en ese idioma, siempre con validacion humana.
- Fine-tuning e investigacion academica: al publicarse en Apache 2.0 y en GGUF, sirve como base para estudios comparativos de cuantizacion y de tecnicas de abliteration.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q3_K_M: ~14,5 GB, apto para GPUs de 16 GB.
  - Q4_K_M: ~18,8 GB, apto para GPUs de 24 GB.
  - Q8_0: ~33,0 GB, requiere GPUs de 48 GB de VRAM.
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M; A100 40/80 GB, H100 o tarjetas profesionales de 48 GB para Q8_0.
- CPU: la model card indica que Q3_K_M puede ejecutarse en CPUs de 32 GB de RAM con AVX2 (Intel Xeon) y Q4_K_M en CPUs de 32 GB de RAM.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con Q4_K_M; Q8_0 queda fuera de las GPUs de consumo actuales.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere soporte para despliegue como endpoint de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jsantillana/gemma-4-31B-it-GGUF (esta ficha) | 30,7 B | 256K | GGUF (Q3_K_M, Q4_K_M, Q8_0) | apache-2.0 | Hugging Face, 0 descargas |
| google/gemma-4-31B | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo original) |
| unsloth/gemma-4-31B-it-GGUF | no disponible | no disponible | GGUF | no disponible | Hugging Face |

La comparativa se limita a los modelos encontrados en la busqueda web; no se dispone de datos de rendimiento, contexto ni licencia de las alternativas para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo del modelo original, por lo que puede generar contenido danino, ilegal o inseguro; no es apto para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo elevado de alucinacion, especialmente en contextos largos y en tareas de codigo o matematicas.
- El soporte de idiomas se limita a ingles y espanol; el rendimiento en otros idiomas no esta garantizado.
- La licencia Apache 2.0 declarada en el repo puede entrar en conflicto con los terminos del modelo original de Google; conviene verificar la licencia del checkpoint base antes de un uso comercial.
- La ventana de 256K tokens implica un consumo de memoria elevado que puede superar la VRAM disponible incluso con cuantizaciones bajas.
- El modelo es denso, no MoE: la inferencia es mas lenta que en arquitecturas con parametros activos reducidos.
- No se han publicado benchmarks ni evaluaciones de calidad para esta cuantizacion concreta.
- Ausencia de soporte declarado de tool calling, vision o audio, lo que limita su uso en pipelines de agentes multimodales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jsantillana/gemma-4-31B-it-GGUF
- Modelo base (abliterated): https://huggingface.co/jsantillana/gemma-4-31B-it-abliterated
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B
- Cuantizaciones alternativas de unsloth: https://huggingface.co/unsloth/gemma-4-31B-it-GGUF
