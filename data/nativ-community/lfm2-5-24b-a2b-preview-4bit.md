# nativ-community/LFM2.5-24B-A2B-Preview-4bit

## Resumen

LFM2.5-24B-A2B-Preview-4bit es una conversion al formato MLX del modelo lq-preview/LFM2.5-24B-A2B-Preview, publicada por la organizacion nativ-community (con una copia identica en mlx-community). El modelo original pertenece a Liquid AI, Inc. y esta fijado a la revision `f772950ce6f17d35af5469d00334b61a9c2fc034`. Se trata de un modelo de generacion de texto con arquitectura de mezcla de expertos (MoE) —el campo de arquitectura declarado es `lfm2_moe`— convertido y cuantizado para ejecutarse sobre Apple Silicon mediante la libreria MLX y el soporte de MLX-VLM.

El modelo cuenta con 23.971.587.712 parametros totales (unos 23,97 mil millones) y una longitud de contexto declarada de 131.072 tokens en la configuracion de origen. La nomenclatura "A2B" sugiere un regimen de aproximadamente 2.000 millones de parametros activos por token, aunque la informacion proporcionada no confirma esa cifra. El repositorio ocupa 13,5 GB y los pesos cuantizados pesan 13,49 GB (decimal), lo que lo situa en el rango de ejecucion viable en equipos Apple con memoria unificada alta (se convirtio y probo en un Apple M3 Ultra).

Su relevancia practica es doble: por un lado, ofrece una via de ejecucion local en Mac para un MoE de ~24B con 128K de contexto; por otro, documenta de forma inusualmente detallada el proceso de cuantizacion (afin de 4 bits con grupo de 64 para los pesos, 8 bits para las proyecciones del router, BF16 en los pesos no cuantizados y FP32 en los sesgos de enrutamiento). No se han publicado resultados de benchmarks, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un artefacto experimental de preview.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); campo `lfm2_moe` en HuggingFace, soportado por MLX-VLM |
| Parametros totales | 23.971.587.712 (≈23,97 mil millones) |
| Parametros activos | no disponible (la nomenclatura A2B sugiere ~2.000 millones activos, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | 131.072 tokens (segun la configuracion del modelo de origen) |
| Tipos de cuantizacion | 4 bits afin, weight-only, group size 64 (pesos principales); router con cuantizacion afin de 8 bits, group size 64; pesos no cuantizados en BF16; sesgos de enrutamiento de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it (10 idiomas) |
| Licencia | lfm1.0 (LFM Open License v1.0, etiquetada como `license: other`); se incluye el archivo LICENSE original de Liquid AI |
| Formato de pesos | safetensors (formato MLX, libreria `mlx`, pipeline `text-generation`) |
| Tamano del repositorio | 13,5 GB (pesos: 13,49 GB decimal) |
| Modelo base | lq-preview/LFM2.5-24B-A2B-Preview (revision `f772950ce6f17d35af5469d00334b61a9c2fc034`) |
| Fecha de creacion del repo | 2026-10-13 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (`lfm2_moe`) y decodificacion autorregresiva estandar, con una ventana de contexto de 131.072 tokens declarada por la configuracion de origen. Al ser una conversion del modelo de Liquid AI, la informacion disponible no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de ajuste (SFT, RLHF o DPO) del modelo original: esos datos corresponden a la model card del modelo base, no a esta conversion.

La innovacion tecnica documentada esta en el proceso de cuantizacion y en el soporte de runtime, no en el entrenamiento. El export se genero con `mlx_vlm convert` usando tipo de dato bfloat16, `--q-mode affine --q-bits 4 --q-group-size 64`. Los pesos principales se cuantizan a 4 bits con tamano de grupo 64; las proyecciones del router se tratan por separado con cuantizacion afin de 8 bits (grupo 64) para preservar la precision del enrutamiento de expertos; los pesos no cuantizados permanecen en BF16 y los sesgos de enrutamiento en FP32. La verificacion posterior a la conversion fue una recarga con coincidencia estricta de pesos, comprobacion de logits finitos en prefill y decodificacion con cache, y dos pruebas cortas de generacion greedy: una respuesta correcta "Paris" a la capital de Francia y "391" en la segunda prueba, ambas alcanzando EOS. El propio autor advierte que son pruebas de humo (smoke tests) y no una evaluacion de calidad ni un benchmark de contexto largo.

Conviene subir que el autor indica que el modelo genera razonamiento antes de su respuesta final, lo que implica reservar un presupuesto de tokens de salida suficientemente amplio.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline declarado: `text-generation`, etiqueta `conversational`).
- Modo de razonamiento explicito: el modelo produce una cadena de razonamiento antes de la respuesta final, por lo que se comporta como un modelo con "thinking mode" y requiere asignar suficientes tokens de salida.
- Cobertura multilingue en 10 idiomas declarados: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Capacidad de contexto largo: hasta 131.072 tokens por la configuracion de origen, util para documentos extensos o historiales largos de conversacion.
- Soporte de plantilla de chat propia, incluida en el repositorio, necesaria para un formateo correcto de los turnos.
- Inferencia local en Apple Silicon mediante MLX y MLX-VLM (interfaz de linea de comandos `mlx_vlm generate`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; solo se documenta generacion de razonamiento previa a la respuesta.
- Vision, audio u otras modalidades: no disponible. Aunque el repositorio incluye la etiqueta `mlx-vlm` (libreria) y el tag `mlx`, el autor describe explicitamente el modelo como "a text generation model".

## Casos de uso

- Asistente conversacional local en Mac: con 131.072 tokens de contexto y pesos de 13,49 GB en 4 bits, permite mantener conversaciones multi-turno largas en un Apple Silicon con memoria unificada suficiente, sin enviar datos a servicios externos.
- Procesamiento de documentos largos con resumen y preguntas y respuestas: el contexto de 128K admite contratos, informes tecnicos o expedientes completos en una sola pasada, evitando estrategias de troceado y recuperacion.
- Razonamiento asistido en tareas analiticas: el comportamiento de generar razonamiento previo a la respuesta resulta adecuado para descomponer problemas (calculo, analisis de datos tabulares, planificacion) siempre que se presupuesten tokens de salida suficientes.
- Atencion al cliente multilingue: los 10 idiomas declarados (incluido espanol, portugues e italiano) permiten desplegar un asistente que atienda consultas en varios mercados sin modelos separados.
- Prototipado e investigacion en entornos Apple: al ser un MoE de ~24B totales con ~2B activos estimados, es un candidato razonable para experimentar con enrutamiento de expertos y cuantizacion en hardware de sobremesa.
- Generacion y edicion de textos profesionales en otro idioma: redaccion de correos, documentacion tecnica, notas de prensa o traduccion asistida entre los idiomas soportados.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio documenta con detalle la receta de cuantizacion y las comprobaciones de integridad, por lo que sirve como referencia reproducible para estudiar el impacto de 4 bits frente al modelo base en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta pruebas de humo cualitativas tras la conversion:

| Prueba | Resultado documentado |
|---|---|
| Recarga de pesos con coincidencia estricta | Correcta |
| Logits finitos en prefill y decodificacion con cache | Correcto |
| Generacion greedy 1 (capital de Francia) | "Paris", alcanza EOS |
| Generacion greedy 2 | "391", alcanza EOS |
| MMLU, HumanEval, GSM8K, MMLU-Pro, contextos largos | no disponible |

El autor indica expresamente que estas comprobaciones no constituyen una evaluacion de calidad exhaustiva ni un benchmark de contexto largo.

## Requisitos de hardware

- Memoria para los pesos: 13,49 GB en 4 bits (13,5 GB de repositorio). Hay que sumar cache KV y asignaciones temporales del runtime, por lo que en la practica se necesita bastante mas memoria unificada que el tamano de los pesos, especialmente con contextos cercanos a 131.072 tokens.
- Plataforma: la conversion es especifica de MLX, que se ejecuta sobre Apple Silicon. No es directamente utilizable en GPU NVIDIA o AMD sin una conversion adicional a otro formato.
- Equipos recomendados: el autor realizo la conversion en un Apple M3 Ultra. Son razonables equipos con memoria unificada amplia, como M3 Ultra, M2 Ultra o configuraciones altas de M4 Max (se recomienda holgadamente por encima de los 16 GB de memoria unificada).
- GPU consumer: no aplica a esta conversion, ya que MLX no soporta GPU de consumo tipo RTX 4090. Para esas GPU habria que partir del modelo base y usar otro stack.
- Opciones de despliegue: MLX-VLM (`python -m mlx_vlm generate`) con la revision de PR #2505, commit `a6c7313bc053e5887616fa850808d21576eddf98`, MLX 0.32.3 y Transformers 5.17.0. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI con estos pesos MLX.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de latencia de prefill.
- Parametros de generacion documentados de ejemplo: `--max-tokens 512 --temperature 0.1`.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de benchmarks ni especificaciones de modelos de terceros que permitan una comparacion cuantitativa fiable. La comparativa se limita a variantes del mismo modelo:

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nativ-community/LFM2.5-24B-A2B-Preview-4bit | 23,97 mil millones (MoE) | 131.072 tokens | 4 bits afin, group size 64 | safetensors MLX | lfm1.0 | Publicado, 0 descargas |
| mlx-community/LFM2.5-24B-A2B-Preview-4bit | Identicos (mismos archivos) | 131.072 tokens | 4 bits afin, group size 64 | safetensors MLX | lfm1.0 | Publicado, espejo del anterior |
| lq-preview/LFM2.5-24B-A2B-Preview (base) | 23,97 mil millones (MoE) | 131.072 tokens | BF16 (sin cuantizar) | safetensors | lfm1.0 | Publicado |
| Otros MoE de tamano similar (Qwen, Mixtral, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni evaluaciones de contexto largo, por lo que no es posible estimar su calidad real frente a alternativas.
- Adopcion nula segun los metadatos: 0 descargas y 0 likes, lo que indica que el artefacto no ha sido validado por la comunidad.
- Naturaleza de preview: el propio nombre del modelo incluye "Preview" y el autor califica sus comprobaciones como pruebas de humo, no como evaluacion de calidad.
- Riesgo de degradacion por cuantizacion: la cuantizacion a 4 bits con group size 64 puede afectar a la precision, especialmente en tareas de razonamiento de varios pasos y en matematicas. No se documenta una comparacion cuantitativa frente al modelo base en BF16.
- Riesgo de alucinacion: no se documenta ninguna mitigacion ni evaluacion especifica de tasas de alucinacion.
- Sesgos: no disponible. La model card de la conversion no describe sesgos conocidos ni la composicion del dataset de entrenamiento.
- Limitacion de plataforma: los pesos son MLX, ejecutables sobre Apple Silicon. No hay versiones GGUF, AWQ, GPTQ ni compatibles con vLLM en este repositorio, lo que restringe el despliegue en servidores con GPU.
- Compatibilidad de herramientas fragil: requiere una revision concreta de MLX-VLM (PR #2505) y versiones especificas de MLX (0.32.3) y Transformers (5.17.0); otras versiones pueden no cargar el modelo.
- Licencia: LFM Open License v1.0 (etiquetada como `other`). Es una licencia propia, no aprobada por la OSI, con posibles restricciones de uso comercial y obligaciones de atribucion. Es imprescindible revisar el archivo LICENSE y el NOTICE antes de cualquier uso en produccion.
- Contexto real no verificado: aunque la configuracion declara 131.072 tokens, no se ha publicado ninguna prueba de recuperacion de informacion en contextos largos, y el consumo de memoria con ese contexto puede ser prohibitivo.
- Atribucion obligatoria: el modelo original es de Liquid AI, Inc. y la conversion y cuantizacion son modificaciones descritas en NOTICE, que deben mantenerse.
- Anomalia en los metadatos: la fecha de creacion registrada (2026-10-13) conviene verificarla antes de citarla.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-4bit
- Espejo en mlx-community: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-4bit
- Modelo base: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- MLX-VLM, PR #2505 (soporte de LFM2.5): https://github.com/Blaizzy/mlx-vlm/pull/2505
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Licencia LFM Open License v1.0: archivo LICENSE incluido en el repositorio (https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-4bit/blob/main/LICENSE)
- Aviso de modificaciones de conversion: archivo NOTICE del repositorio (https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-4bit/blob/main/NOTICE)
- Detalles de conversion y versiones: archivo `conversion_info.json` del repositorio
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenidos no relacionados.
