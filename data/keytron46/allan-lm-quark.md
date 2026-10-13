# keytron46/Allan-LM-Quark

## Resumen

Allan-LM Quark es el primer checkpoint base de la familia Allan-LM, desarrollada desde cero por KEYTRON para su asistente Allan. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con 283.661.440 parametros totales segun los safetensors publicados (el autor indica 278M totales y 107M activos por token) y una ventana de contexto entrenada de 1.024 tokens, ampliable hasta 2.048 posiciones mediante RoPE. Esta publicado en HuggingFace bajo el identificador keytron46/Allan-LM-Quark y se distribuye como modelo base, sin ajuste por instrucciones.

El modelo no responde preguntas ni mantiene dialogos: su funcion es la continuacion de texto en ruso e ingles, con exposicion a codigo fuente. La relevancia principal es de investigacion: documenta una arquitectura propia y poco habitual en este rango de tamano, combinando MoE con Per-Layer Embeddings (PLE) al estilo de los modelos E de Gemma, y ofrece pesos en fp32 con embeddings atados.

Conviene subrayarlo: Quark es un modelo de investigacion de ~10.000 millones de tokens de entrenamiento. Genera texto gramatical y coherente a nivel de forma, pero carece practicamente de conocimiento factual, por lo que no debe emplearse como fuente de informacion. La licencia Business Source License 1.1 restringe el uso comercial hasta el 12 de octubre de 2028, fecha en la que transiciona a MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only MoE con Per-Layer Embeddings (PLE); implementacion personalizada (no compatible con `transformers`) |
| Parametros totales | 283.661.440 (safetensors); el autor declara 278M en la model card |
| Parametros activos | 107M por token |
| Longitud de contexto | 1.024 tokens entrenados; posiciones RoPE hasta 2.048 |
| Tipos de cuantizacion | no disponible (solo pesos fp32 safetensors) |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | Business Source License 1.1 (bsl-1.1); pasa a MIT el 2028-10-12 |
| Formato de pesos | safetensors (fp32), embeddings atados |

Detalles adicionales de configuracion: 10 capas, `d_model` de 640, 10 cabezas de atencion con 2 cabezas KV (GQA), `d_ple` de 80, 8 expertos con enrutado top-2 mas 1 experto compartido. Tokenizer BPE propio con 32.000 tokens de texto y un vocabulario total de 36.160 que reserva tokens especiales y de audio para fases posteriores.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con mezcla de expertos: 8 expertos por capa con top-2 enrutado y un experto compartido adicional, lo que da 107M parametros activos frente a los 278M totales. Incorpora Per-Layer Embeddings (PLE), un mecanismo inspirado en los modelos E de Gemma que inyecta informacion de embedding en cada capa, con una dimension dedicada `d_ple` de 80. La atencion usa Grouped Query Attention (GQA) con 10 cabezas de consulta y 2 de clave/valor, y mantiene los embeddings de entrada y salida atados. El codigo de la arquitectura vive en `allan_lm/model.py` dentro del repositorio y no carga con `transformers`, llama.cpp ni Ollama.

El entrenamiento consumio aproximadamente 10.000 millones de tokens (152.000 pasos de 65.536 tokens) con secuencias de 1.024 tokens. Se uso el optimizador AdamW con un pico de learning rate de 5e-4, 1.000 pasos de warmup y un esquema warmup-stable-decay en el que el ultimo 20% decae hasta 5e-5. El hardware fue heterogeneo: pasos 0-147.000 en una A100 de Google Colab y el resto en una RTX 4090 alquilada en RunPod. La mezcla de datos combina texto web en ruso (fineweb-2, rus_Cyrl, ODC-BY), texto web educativo en ingles (fineweb-edu, ODC-BY) y codigo fuente (github-code-clean, licencia por archivo). El autor afirma no haber usado datos sinteticos, destilaciones ni traduccion automatica.

## Capacidades

- Generacion de texto por continuacion en ruso e ingles, sin modo conversacional ni respuesta a preguntas.
- Produccion de texto gramatical y coherente a nivel de forma: estilos enciclopedicos, recetas, listas y estructura de prosa comun.
- Conocimiento superficial de sintaxis de lenguajes de programacion, en particular Python, derivado del corpus de codigo.
- Cobertura bilingue ruso-ingles mediante tokenizer BPE propio de 32.000 tokens de texto.
- Vocabulario reservado para tokens especiales y de audio de cara a fases posteriores del proyecto.
- No dispone de tool calling, function calling, soporte de agentes, modo de razonamiento explicito ni capacidades de vision.

## Casos de uso

- Investigacion en arquitecturas MoE eficientes: Quark permite estudiar el comportamiento de un MoE con top-2 enrutado y experto compartido en un rango de tamano pequeno, con pesos fp32 y codigo de arquitectura accesible en el repositorio.
- Experimentos sobre Per-Layer Embeddings: al replicar el enfoque de los modelos E de Gemma, sirve para analizar como afecta la inyeccion de embeddings por capa al rendimiento en modelos de menos de 300M de parametros.
- Estudios de entrenamiento desde cero: la model card documenta hiperparametros concretos (AdamW, LR 5e-4, WSD con decaimiento al 5e-5), lo que facilita reproducir o comparar recetas de preentrenamiento bilingues.
- Generacion de texto sintetico controlado en ruso para tareas auxiliares de NLP, asumiendo que el contenido factual no es fiable y que el texto se usaria como material linguistico, no informativo.
- Pruebas de tokenizers BPE bilingues: el vocabulario propio de 32.000 tokens de texto permite evaluar la eficiencia de segmentacion en ruso e ingles frente a otros esquemas.
- Analisis de fuga de datos de entrenamiento: el propio autor senala que aparece spam web (por ejemplo, anuncios de casino) en las salidas, lo que lo convierte en un caso de estudio sobre contaminacion de corpus.
- Educacion y demostraciones sobre limites de los LLM: la tendencia del modelo a inventar fechas y lugares de forma segura es un ejemplo didactico claro de alucinacion en modelos de escala reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion aportado por el autor es la entropia cruzada de validacion (nats/token) sobre fragmentos reservados de las mismas fuentes:

| Modelo | Ruso | Ingles | Codigo |
|---|---|---|---|
| Allan-LM 156M (ejecucion interna previa, 5B tokens) | 2,88 | 3,02 | 1,29 |
| Allan-LM Quark | 2,70 | 2,78 | 1,09 |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 1,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o mas. Al no existir versiones cuantizadas publicadas, no hay estimaciones para int8 o int4.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM. El autor entreno parte del modelo en una RTX 4090, que es sobredimensionada para inferencia. Una A100 o H100 tambien es valida pero innecesaria para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (serie RTX 30/40, e incluso integradas con memoria suficiente). El cuello de botella es la compatibilidad de codigo, no la memoria.
- Opciones de despliegue: solo inferencia en PyTorch con el codigo propio del repositorio (`allan_lm`), cargando safetensors con `safetensors.torch.load_file`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es personalizada y no esta integrada en `transformers`.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

La comparacion mas directa es con modelos base de rango 250M-600M que si cargan en ecosistemas estandar. Los datos de rendimiento de Quark en benchmarks comparables no estan disponibles, por lo que la tabla es cualitativa en ese aspecto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Allan-LM Quark | 283M totales / 107M activos (MoE) | 1.024 (RoPE hasta 2.048) | BSL 1.1 (MIT en 2028) | Solo PyTorch con codigo propio |
| Gemma 3 270M | 270M (denso) | 32K | Terminos de Gemma | `transformers`, llama.cpp, Ollama |
| Qwen3-0.6B | 0,6B (denso) | 32K | Apache 2.0 | `transformers`, llama.cpp, Ollama |
| SmolLM2-360M | 362M (denso) | 8K | Apache 2.0 | `transformers`, llama.cpp, Ollama |

Comparativa de rendimiento: no disponible. No hay benchmarks publicados de Allan-LM Quark que permitan una comparacion numerica con estas alternativas. La diferencia clave es estructural: Quark es un MoE entrenado desde cero con PLE y un contexto muy corto (1.024 tokens), frente a modelos densos con contexto de 32K e integracion completa en el ecosistema de inferencia.

## Limitaciones y advertencias

- Conocimiento factual casi nulo: el modelo inventa fechas, lugares y hechos con seguridad, como ilustra el propio ejemplo de la model card ("San Petersburgo fue fundado en 1946"). No debe usarse como fuente de informacion.
- Alucinacion sistematica: no hay mitigacion por RLHF, DPO ni ajuste por instrucciones, por lo que la generacion no tiene ninguna capa de control de veracidad.
- Codigo no funcional: aunque ha visto codigo fuente, el autor advierte explicitamente que el codigo generado no funciona.
- Fuga de contenido indeseado: pueden aparecer fragmentos de spam web, como anuncios de casino, procedentes del corpus de entrenamiento.
- Contexto muy limitado: 1.024 tokens entrenados es un valor muy bajo para tareas de contexto largo; la extension RoPE hasta 2.048 no implica calidad equivalente en esa longitud.
- Cobertura de idiomas restringida a ruso e ingles; no hay soporte declarado de castellano ni de otros idiomas.
- Restriccion de licencia: BSL 1.1 permite uso personal, academico, de investigacion y evaluacion, pero el uso comercial requiere un acuerdo separado con el licenciante hasta el 12 de octubre de 2028.
- Riesgo legal por datos de codigo: el corpus github-code-clean se utilizo sin filtrar por licencia de archivo, por lo que incluye codigo copyleft (GPL) junto a codigo permisivo. El autor indica que versiones posteriores solo usaran codigo con licencias permisivas.
- Incompatibilidad de despliegue: no carga con `transformers`, llama.cpp, Ollama ni TGI, lo que obliga a mantener el codigo propio del repositorio y descarta los pipelines estandar de produccion.
- Estado de desarrollo: es un checkpoint base de un proyecto en curso, con 0 descargas y 0 likes en el momento de redactar la ficha, lo que limita la validacion por parte de terceros.

## Enlaces

- [HuggingFace: keytron46/Allan-LM-Quark](https://huggingface.co/keytron46/Allan-LM-Quark)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [Dataset: HuggingFaceFW/fineweb-edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu)
- [Dataset: codeparrot/github-code-clean](https://huggingface.co/datasets/codeparrot/github-code-clean)

No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
