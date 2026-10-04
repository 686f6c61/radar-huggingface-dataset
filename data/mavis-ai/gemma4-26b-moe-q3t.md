# mavis-ai/Gemma4-26B-MoE-Q3T

## Resumen

mavis-ai/Gemma4-26B-MoE-Q3T es una version cuantizada, sin fine-tuning, del checkpoint multimodal google/gemma-4-26B-A4B-it. Se trata de una derivada "data-free": no se aplico entrenamiento de ningun tipo ni se uso conjunto de calibracion; el autor original del modelo subyacente conserva todos los derechos y el artefacto se redistribuye bajo licencia Apache 2.0. El modelo base es un transformer MoE multimodal de 30 capas, hidden size 2816, 128 expertos enrutados con 8 activos y una ventana de contexto de 262.144 tokens.

La innovacion principal es el formato de cuantizacion Q3T: los expertos enrutados se almacenan como codigos trellis de 3 bits por peso sobre teselas de 16x16 (codebook MCG, rotacion Hadamard de 128 puntos y vectores de signo por canal), mientras que las proyecciones de atencion, el MLP denso y los embeddings de tokens (con LM head atado) se guardan en affine de 6 bits con grupo de tamano 64. Los routers, las normas y la torre de vision se mantienen en BF16. El peso resultante ocupa 12,53 GB (11,7 GiB), una reduccion sustancial frente al checkpoint original en precision completa.

Es relevante ahora porque explora un eje distinto al de la cuantizacion affine convencional (trellis frente a escala/punto cero) y porque va acompanado de dos drafters de decodificacion especulativa (MTP y DFlash) empaquetados en el mismo repositorio. Su gran limitacion practica es que los expertos requieren un decodificador trellis especifico: el modelo no funciona en mlx-lm, mlx-vlm, transformers ni vLLM, y esta pensado exclusivamente para el motor de inferencia de R.E.V.I.S. en Apple silicon, con soporte a partir de una version posterior a la v1.3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Gemma 4): 30 capas, hidden size 2816, 128 expertos enrutados con 8 activos (modelo base) |
| Parametros totales | 7.680.644.686 segun los safetensors del repositorio; el modelo base se denomina 26B A4B (26.000 millones totales segun nomenclatura del autor) |
| Parametros activos | Aproximadamente 4.000 millones (etiqueta A4B del modelo base); no confirmado de forma explicita en la informacion disponible |
| Longitud de contexto | 262.144 tokens (modelo base) |
| Tipos de cuantizacion | Q3T: expertos enrutados en trellis de 3 bits (K3) + denso/atencion/embeddings en affine de 6 bits grupo 64 (N6); routers, normas, escalares de capa, torre de vision y proyeccion multimodal en BF16; KV cache a 8 bits en runtime; drafters en 8 bits affine g64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (el campo license_link remite a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (tensores trellis .trellis, .suh, .svh); libreria declarada: trellis |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con 30 capas, hidden size 2816 y 128 expertos enrutados de los que se activan 8 por token, capaz de procesar entradas de imagen y texto con una ventana de 262.144 tokens. Esta ficha describe una conversion de pesos de ese checkpoint, no un entrenamiento: la model card indica explicitamente que es "not a fine-tune: no training of any kind was applied".

La receta de cuantizacion Q3T es fija y sin datos: se elige un ancho por clase de modulo mediante una regla escrita, no observando datos de evaluacion. Cada matriz de experto se almacena como codigos trellis de 3 bits por peso en teselas de 16x16 con codebook MCG, rotacion Hadamard de 128 puntos y vectores de signo por canal (suh, svh); la codificacion minimiza el MSE sobre los pesos rotados, sin conjunto de calibracion, redondeo tipo Hessian, importance matrix ni quantizacion consciente del entrenamiento. El ancho de experto 704 no es multiplo de 128 y se almacena con padding a 768. Todo lo demas lineal (proyecciones de atencion, MLP denso y embeddings de tokens, con la LM head atada) se cuantiza a 6 bits affine con grupo 64 mediante mx.quantize (redondeo al mas cercano) desde la fuente BF16. Los routers, normas, escalares de capa y la torre de vision con su proyeccion se conservan en BF16 porque la seleccion de expertos es una decision top-k discontinua.

El repositorio separa el fichero core (3,11 GB: denso, atencion, embeddings, routers y vision) de seis ficheros de expertos (1,57 GB cada uno) para que el runtime pueda mapear expertos de forma independiente; los tensores de experto son identicos byte a byte al paquete fuente sin dividir. Se incluyen ademas los drafters de decodificacion especulativa: un drafter MTP en 8 bits affine g64 con su ProposalHead (0,45 GB + 0,12 GB) y un drafter por bloques DFlash (0,50 GB), en total 1,11 GB. La familia T contempla tres anchos: Q5T (expertos K5, denso N8), Q4T (K4, N6) y este Q3T (K3, N6).

## Capacidades

- Generacion de texto conversacional (pipeline declarado: image-text-to-text, con la etiqueta "conversational").
- Procesamiento multimodal de imagen y texto: la torre de vision y la proyeccion multimodal se mantienen en BF16, por lo que no se degradan con la cuantizacion Q3T.
- Ventana de contexto larga de 262.144 tokens heredada del modelo base, adecuada para documentos extensos.
- Seleccion de expertos enrutados en BF16, preservando la decision top-k sin cuantizar.
- Decodificacion especulativa integrada mediante los drafters MTP (con ProposalHead) y DFlash, empaquetados en el repositorio.
- KV cache a 8 bits en runtime, orientada a reducir el coste de memoria en contextos largos.
- Encaje en flujos multi-agente locales a traves de R.E.V.I.S., descrito por el autor como un "Cognitive OS for Multi-Agentic AI on Mac".
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.
- Cobertura multilingue: no disponible (el campo de idiomas del repositorio figura como no disponible).

## Casos de uso

- Asistente conversacional totalmente local en Mac: el modelo se ejecuta con el motor de R.E.V.I.S. sobre Apple silicon, sin enviar datos a servicios externos; encaja en escenarios con requisitos de privacidad donde el contenido no puede salir del equipo.
- Analisis de documentos tecnicos largos: con 262.144 tokens de contexto puede ingerir manuales, informes o bases de codigo extensas en una sola pasada, un escenario coherente con que la propia evaluacion del autor use documentos tecnicos como estrato.
- Tratamiento de entradas mixtas imagen-texto: al conservar la torre de vision en BF16, es apto para transcripcion de documentos escaneados, lectura de capturas de interfaz o descripcion de imagenes combinada con instrucciones textuales.
- Orquestacion multi-agente en local: R.E.V.I.S. esta disenado como sistema cognitivo multi-agente, por lo que el modelo puede actuar como motor de un agente dentro de un pipeline de tareas encadenadas en el propio Mac.
- Aceleracion de inferencia interactiva con decodificacion especulativa: los drafters MTP y DFlash permiten plantear un modo de baja latencia en generacion de texto, a costa de cargar 1,11 GB adicionales de pesos.
- Investigacion en tecnicas de cuantizacion: el formato trellis de 3 bits con rotacion Hadamard y vectores de signo por canal es un caso de estudio util para comparar contra cuantizacion affine clasica en terminos de divergencia de distribucion de siguiente token.
- Inferencia con restricciones de memoria en hardware unificado: al reducir los expertos a 3 bits, el peso total baja a 11,7 GiB mas drafters, lo que hace viable mantener el modelo residente en equipos Apple con memoria unificada alta.
- Evaluacion comparativa de derivadas cuantizadas: al existir variantes Q4T y Q5T de la misma familia, sirve para medir el compromiso entre tamano de peso y fidelidad respecto a BF16.

## Benchmarks y rendimiento

La model card describe una evaluacion de la divergencia de la distribucion de siguiente token (KLD frente a BF16) en modo teacher forcing sobre 48 documentos y 18.040 posiciones puntuadas, repartidas en tres estratos (WikiText-2, documentos tecnicos y respuestas del propio modelo), con vocabulario completo y KV cache emulada a 8 bits. Se reportan la KLD media y la tasa top-1 (proporcion de posiciones en las que el token mas probable coincide con BF16), con intervalos de confianza bootstrap del 99,8 % sobre documentos. Las comparaciones con cuantizacion affine convencional se posponen a una remedicion con builds estandar.

La tabla de resultados numericos esta truncada en la informacion disponible, por lo que no se pueden reproducir cifras.

| Metrica | Metodologia | Resultado |
|---|---|---|
| KLD vs BF16 | 48 documentos, 18.040 posiciones, vocabulario completo, KV cache 8 bits | no disponible (tabla truncada en la informacion suministrada) |
| Top-1 coincidente con BF16 | Mismo conjunto de evaluacion | no disponible (tabla truncada en la informacion suministrada) |
| Velocidad (latencia o throughput) | No reportada por el autor | no disponible |

## Requisitos de hardware

- Huella de pesos: 12,53 GB (11,7 GiB) para el nucleo y los expertos, mas 1,11 GB de drafters (MTP, ProposalHead y DFlash).
- Plataforma objetivo: Apple silicon (Mac). El autor declara la etiqueta apple-silicon y el empaquetado esta pensado para el motor de inferencia de R.E.V.I.S.
- Compatibilidad de runtimes: no funciona en mlx-lm, mlx-vlm, transformers ni vLLM, porque los expertos requieren el decodificador trellis y sus kernels.
- Version de motor necesaria: soporte para esta build Q3T en una version de R.E.V.I.S. posterior a la v1.3.0.
- Cabe en GPU de consumo: no disponible; el modelo no esta orientado a GPU discreta y no se documentan rutas de despliegue para CUDA.
- VRAM estimada para inferencia: no disponible (ademas del peso hay que sumar el KV cache a 8 bits y las activaciones, sin cifra publicada).
- GPU recomendadas: no disponible; el escenario declarado es hardware Apple con memoria unificada, no A100, H100 ni RTX.
- Opciones de despliegue: exclusivamente el motor integrado de R.E.V.I.S.; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no reportados ("Speed is not reported" en la model card).

## Comparativa con modelos similares

| Modelo | Expertos enrutados | Denso | Tamano de pesos | Contexto | Licencia | Disponibilidad de ejecucion |
|---|---|---|---|---|---|---|
| Gemma4-26B-MoE-Q3T (este) | Trellis 3 bits (K3) | Affine 6 bits g64 (N6) | 12,53 GB + 1,11 GB de drafters | 262.144 tokens | apache-2.0 | Solo R.E.V.I.S. en Apple silicon (> v1.3.0) |
| Gemma4-26B-MoE-Q4T (misma familia) | Trellis 4 bits (K4) | Affine 6 bits g64 (N6) | no disponible | 262.144 tokens | no disponible | Solo R.E.V.I.S. |
| Gemma4-26B-MoE-Q5T (misma familia) | Trellis 5 bits (K5) | Affine 8 bits g64 (N8) | no disponible | 262.144 tokens | no disponible | Solo R.E.V.I.S. |
| google/gemma-4-26B-A4B-it (modelo base) | BF16 (sin cuantizar) | BF16 | no disponible | 262.144 tokens | no disponible en la informacion suministrada | Ecosistema estandar de Gemma |

No se dispone de datos de benchmark publicados que permitan comparar numericamente esta build con alternativas de cuantizacion affine de otros autores.

## Limitaciones y advertencias

- Portabilidad muy limitada: los expertos estan almacenados como tensores trellis (.trellis, .suh, .svh) que exigen un calculo de decodificacion especifico; el modelo no se ejecuta en mlx-lm, mlx-vlm, transformers ni vLLM.
- Dependencia de un unico runtime: esta pensado para R.E.V.I.S. y su soporte llega en una version posterior a la v1.3.0; sin ese motor no hay via de inferencia documentada.
- Cuantizacion sin calibracion: la receta es data-free, con redondeo al mas cercano y sin importance matrix ni quantizacion consciente del entrenamiento, por lo que la perdida de calidad depende del propio esquema y no de un ajuste sobre datos.
- Resultados de calidad no verificables con lo disponible: la tabla de KLD y top-1 frente a BF16 aparece truncada, y el autor no reporta velocidad ni comparacion con cuantizacion affine estandar.
- Verificacion parcial del proceso: el manifiesto de conversion registra runtime_forward_verified: false, es decir, la conversion verifico los pesos efectivos, no una pasada forward del motor.
- Padding en expertos: el ancho de experto 704 no es multiplo de 128 y se almacena con padding a 768, un detalle relevante para quien implemente kernels propios.
- Ambiguedad de licencia: el repositorio declara apache-2.0, pero el campo license_link apunta a la licencia de Gemma 4 de Google; conviene verificar los terminos aplicables del modelo base antes de un uso comercial.
- Idiomas soportados: no disponibles, lo que impide garantizar cobertura multilingue en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se trata de un modelo generativo de proposito general y el autor no publica metricas de fidelidad factual.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo.
- Adopcion nula verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad que haya validado el artefacto.
- Sin capacidades confirmadas de tool calling ni de modo de razonamiento explicito en la documentacion suministrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mavis-ai/Gemma4-26B-MoE-Q3T
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Web oficial de R.E.V.I.S.: https://mavis-ai.co.jp/revis/
- Cuenta de X del autor: https://x.com/mavis_ai_jp
- Licencia enlazada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Referencia arXiv incluida en las etiquetas: arxiv:2602.06036 (titulo no disponible en la informacion suministrada)
- Referencia arXiv incluida en las etiquetas: arxiv:2607.02770 (titulo no disponible en la informacion suministrada)
