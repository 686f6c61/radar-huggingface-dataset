# nexbridgesolutions/Arden-2.0-280M

## Resumen

Arden 2.0 280M es un modelo de lenguaje decoder-only de 279.913.984 parametros (~280M) desarrollado desde cero por Nex Bridge Solutions LLC. No se apoya en pesos preentrenados ni en forks: la arquitectura, el tokenizer, el pipeline de datos y el bucle de entrenamiento son de diseno propio en PyTorch. Esta ficha corresponde al checkpoint de previsualizacion publicado en el paso 178.500 de un total planificado de 2.325.034 pasos, es decir, aproximadamente el 7,68% del entrenamiento previsto.

Se trata de un modelo base (solo preentrenamiento, sin SFT), por lo que su funcion es continuar texto y no seguir instrucciones ni mantener conversaciones. Su relevancia actual es la de un experimento de desarrollo abierto: publica checkpoints intermedios con metricas de validacion para documentar la progresion de un entrenamiento realizado en hardware accesible, en lugar de grandes clusters. La ventana de contexto es de tan solo 512 tokens y la perdida de validacion reportada es 4,1897 (perplejidad 66,0).

El corpus es predominantemente en ingles, con soporte secundario de espanol, portugues y frances. El modelo se distribuye en safetensors (float32) y en GGUF en cuantizaciones q4_0, q8_0 y f16, y se libera bajo la licencia Arden Community License v1.0. Existe un predecesor, Arden 1.0 280M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (pre-LayerNorm, GELU, embeddings posicionales aprendidos) |
| Parametros totales | 279.913.984 (~280M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | q4_0, q8_0, f16 (GGUF); float32 en safetensors |
| Idiomas soportados | ingles (principal), espanol, portugues, frances |
| Licencia | Arden Community License v1.0 |
| Formato de pesos | safetensors (float32) y GGUF (q4_0, q8_0, f16) |

Detalles de capas: 26 capas, 14 cabezas de atencion, dimension oculta 896 (dimension por cabeza 64), tamano de FFN 3.584, embeddings atados (tied embeddings). Tokenizer ByteLevel BPE con 32.000 tokens y normalizacion NFKC. Tamano del repositorio: 2,3 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2 con normalizacion previa a cada subcapa (pre-LayerNorm), activacion GELU y embeddings posicionales aprendidos (no rotatorios). Consta de 26 capas, 14 cabezas y una dimension oculta de 896, con un FFN de 3.584 unidades y embeddings de entrada y salida atados. El tokenizer es un ByteLevel BPE de 32.000 tokens con normalizacion NFKC. No hay innovaciones declaradas como atencion lineal, decodificacion especulativa ni capas hibridas.

El entrenamiento usa el optimizador AdamW con tasa de aprendizaje 3e-4, decaimiento coseno y 1.000 pasos de calentamiento, en precision float32. El lote efectivo es de 8 secuencias de 512 tokens, esto es, 4.096 tokens por paso. En el checkpoint publicado se han procesado aproximadamente 731.136.000 tokens. La validacion se realiza sobre 25 lotes fijos reservados, sin barajado, identicos en todas las evaluaciones. No consta el volumen total del corpus, su composicion detallada ni la existencia de fases de RLHF o DPO: es un modelo exclusivamente preentrenado. El plan de publicacion contempla checkpoints al 10% (paso 232.503), 50% (paso 1.162.517) y 100% (paso 2.325.034), ademas de una version Chat con SFT.

## Capacidades

- Generacion y continuacion de texto libre en ingles, con menor calidad en espanol, portugues y frances.
- Modelado de lenguaje base: util para experimentacion con decodificacion, temperatura, top-k y penalizacion por repeticion.
- Vocabulario y tokenizer multilingue (32.000 tokens) que cubre los cuatro idiomas declarados.
- Plantilla de chat y tokens especiales definidos (`<PAD>`, `<UNK>`, `<BOS>`, `<EOS>`, `<MASK>`, `<USER>`, `<ASSISTANT>`, `<SYSTEM>`), incluidos en el GGUF y en `tokenizer_config.json`.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin modo de razonamiento (thinking mode).
- Sin capacidades de vision ni audio.
- Sin ajuste por instrucciones (no sigue ordenes de forma fiable) ni alineamiento de seguridad.

## Casos de uso

- Experimentacion en investigacion sobre preentrenamiento: sirve para estudiar curvas de perdida y progresion de la calidad del texto en un modelo entrenado desde cero con recursos limitados.
- Docencia y aprendizaje: permite ilustrar como evolucionan las salidas de un transformer decoder-only pequeno a lo largo de un entrenamiento, comparando checkpoints y ajustes de decodificacion.
- Generacion de texto de relleno en pruebas de infraestructura: su bajo coste de inferencia (desde 183 MB en q4_0) lo hace util para validar pipelines de llama.cpp, Ollama o GPT4All sin consumir recursos.
- Pruebas de integracion de plantillas de chat: el formato `<BOS><SYSTEM>...<EOS><USER>...<EOS><ASSISTANT>` permite verificar el soporte de plantillas personalizadas con `--jinja` antes de que llegue la version SFT.
- Base para futuros ajustes: al ser un modelo base con pesos safetensors en float32, puede servir como punto de partida para experimentos de fine-tuning de investigacion, siempre dentro de los terminos de la licencia.
- Aplicaciones de demostracion sin requisitos de calidad: continuacion de frases o parrafos en ingles en demos locales y entornos sin GPU.
- Evaluacion comparativa de cuantizaciones: los tres ficheros GGUF (q4_0, q8_0, f16) permiten medir el impacto de la cuantizacion sobre un mismo checkpoint.
- No se recomienda ningun uso en produccion, atencion al cliente, generacion de codigo fiable ni toma de decisiones, dado que es un checkpoint temprano sin ajuste de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion del checkpoint: 4,1897 (perplejidad 66,0) sobre 25 lotes fijos reservados, con descenso aun en curso. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ningun otro conjunto estandar, ni comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia segun el fichero publicado: q4_0 ~183 MB, q8_0 ~316 MB, f16 ~646 MB, safetensors float32 ~1,1 GB. A estas cifras hay que sumar el coste del cache KV, pequeno dado el contexto de 512 tokens y las 26 capas.
- El modelo cabe holgadamente en cualquier GPU de consumo actual, incluidas RTX 3060, RTX 4060, RTX 4090 y tarjetas con 6-8 GB de VRAM o menos en cuantizaciones q4_0 y q8_0.
- Tambien es viable su ejecucion en CPU, que es el escenario indicado por el autor para la cuantizacion q4_0.
- Opciones de despliegue documentadas por el autor: GPT4All, llama.cpp (con `-no-cnv` para completado o `--jinja` para la plantilla) y Ollama mediante Modelfile. El safetensors en float32 requiere el codigo base de Arden, no es directamente cargable con `transformers`.
- GPU de gama alta (A100, H100) no son necesarias para este tamano; solo tendrian sentido para reentrenamiento o ajuste fino.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Configuracion de muestreo recomendada: temperatura 0,7-0,8, top_k 40-50, top_p 0,9, penalizacion por repeticion 1,1-1,3. Se desaconseja la decodificacion voraz (temperatura 0) por tendencia a bucles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Arden 2.0 280M (preview) | ~280M | 512 | Arden Community License v1.0 | safetensors + GGUF; checkpoint al 7,7% de entrenamiento |
| GPT-2 medium | 355M | 1.024 | MIT | safetensors; ampliamente soportado |
| Pythia 410M | 410M | 2.048 | Apache 2.0 | safetensors; ecosistema EleutherAI |
| SmolLM2 360M | 360M | 8.192 | Apache 2.0 | safetensors; demanda comercial permitida |

Nota: los datos de los modelos comparados corresponden a conocimiento general de sus fichas publicas; la informacion proporcionada no incluye comparaciones directas de rendimiento entre Arden 2.0 280M y estas alternativas. Arden 2.0 280M destaca por su licencia restrictiva para uso comercial como servicio o producto y por su contexto reducido de 512 tokens, frente a opciones con licencias permisivas y contextos notablemente mayores.

## Limitaciones y advertencias

- Checkpoint temprano: solo el 7,7% del entrenamiento planificado. El texto suele ser repetitivo o perder coherencia en pasajes largos.
- Modelo base sin ajuste de instrucciones, sin ajuste de seguridad y sin alineamiento: puede generar contenido inexacto, sesgado o inapropiado, y no sigue ordenes de forma fiable.
- Desequilibrio linguistico: el corpus es predominantemente ingles; la calidad en espanol, portugues y frances es inferior.
- Contexto muy corto (512 tokens), limitante para conversaciones multi-turno o documentos extensos.
- Riesgo elevado de alucinacion por el estado temprano del entrenamiento.
- La decodificacion voraz tiende a bucles; se recomienda muestreo con penalizacion por repeticion.
- Licencia Arden Community License v1.0: uso libre para fines personales, investigacion, educacion y evaluacion interna; el alojamiento del modelo como servicio y su integracion en productos comerciales requieren un acuerdo comercial (legal@nexbridgesolutions.com).
- No apto para produccion ni para toma de decisiones.
- El safetensors en float32 no es cargable con `transformers` sin el codigo base propio de Arden.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nexbridgesolutions/Arden-2.0-280M
- Version anterior Arden 1.0 280M: https://huggingface.co/nexbridgesolutions/Arden-1.0-280M
- Repositorio GitHub de Arden: https://github.com/nexbridgesolutions/Arden
- Organizacion en GitHub: https://github.com/nexbridgesolutions
- Perfil del autor en HuggingFace: https://huggingface.co/nexbridgesolutions
- Web de Nex Bridge Solutions: https://nexbridgesolutions.com
- Articulo en LinkedIn sobre la motivacion del proyecto: https://www.linkedin.com/pulse/arden-why-we-built-our-own-ai-from-scratch-its-worth-david-arriaga-ccl0c
