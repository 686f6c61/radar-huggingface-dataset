# Jabs2/Qwen3-0.6B-JAPT-GGUF

## Resumen

Qwen3-0.6B-JAPT-GGUF es un ajuste fino del modelo Qwen3-0.6B de Alibaba Qwen, publicado por el usuario Jabs2 en Hugging Face, orientado a la traduccion offline de subtitulos de anime del japones al portugues. El repositorio contiene unicamente pesos en formato GGUF y forma parte del proyecto GoAnime TV, con una unica cuantizacion publicada: Q4_K_M, de 397 MB.

El modelo parte de la arquitectura transformer densa de Qwen3, con aproximadamente 0,6 mil millones de parametros, y se ha entrenado mediante QLoRA SFT (r=32, 6000 pasos) sobre 147.000 pares japones-portugues procedentes de Tatoeba y OpenSubtitles v2024 (limpiados), mas 15.000 pares ingles-portugues de Tatoeba para preservar esa direccion de traduccion. El objetivo es disponer de un traductor muy ligero que funcione sin conexion y sin GPU dedicada, algo relevante para pipelines de subtitulado que deben ejecutarse en local.

Su relevancia practica es acotada: es un artefacto de nicho y experimental, con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks estandar publicados y con una unica evaluacion interna de 6 frases que arroja 4/6 en Q4_K_M. No declara licencia en el repositorio, aunque el modelo base es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3); la model card no detalla la configuracion de capas |
| Parametros totales | Aproximadamente 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-0.6B declara 32.768 tokens nativos |
| Tipos de cuantizacion | GGUF F16 (paso intermedio) y Q4_K_M (publicado, 397 MB); IQ3_M probado y descartado, no publicado |
| Idiomas soportados | Japones a portugues (principal) e ingles a portugues (secundario, 15.000 pares). Otras lenguas del modelo base no verificadas en el ajuste |
| Licencia | No disponible para el repositorio; el modelo base Qwen/Qwen3-0.6B es Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se describe ninguna modificacion estructural sobre el modelo base. El ajuste se realizo con QLoRA SFT con rango 32 durante 6000 pasos, sobre un corpus de 147.000 pares japones-portugues (Tatoeba mas OpenSubtitles v2024, limpiados) y 15.000 pares ingles-portugues (Tatoeba). El proposito declarado del segundo bloque de datos es evitar que la direccion ingles-portugues se degrade durante el ajuste, un problema habitual cuando se especializa un modelo multilingue en un unico par de idiomas.

El pipeline de publicacion es: fusion de los adaptadores sobre el modelo base, conversion a GGUF en F16 y cuantizacion con `llama-quantize`. No se documenta RLHF, DPO ni ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras). La model card tampoco especifica hiperparametros de aprendizaje mas alla del rango, el numero de pasos y el volumen de datos.

## Capacidades

- Traduccion de japones a portugues, con enfasis en registro conversacional propio de subtitulos de anime.
- Traduccion de ingles a portugues, mantenida de forma secundaria mediante 15.000 pares de entrenamiento.
- Generacion de texto general heredada del modelo base Qwen3-0.6B, no evaluada ni documentada en el ajuste.
- Salida en texto plano apta para su insercion directa en ficheros de subtitulos.
- Ejecucion completamente offline en CPU o GPU de gama baja mediante llama.cpp.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking explicito, vision, audio ni otras modalidades.
- El alcance multilingue fuera de los pares JA-PT y EN-PT no esta verificado.

## Casos de uso

- Traduccion offline de subtitulos de anime en el proyecto GoAnime TV: es el caso de uso declarado por el autor; el modelo traduce los subtitulos en local sin enviar contenido a servicios externos.
- Procesamiento por lotes en equipos sin GPU: con 397 MB en Q4_K_M, se puede recorrer una temporada completa de subtitulos en CPU con llama.cpp sin coste de infraestructura.
- Pre-traduccion asistida para fansubs: el modelo genera una primera version que un revisor humano corrige, reduciendo el trabajo de traduccion desde cero.
- Traduccion integrada en reproductores o aplicaciones de escritorio: el tamano reducido permite embeber el modelo en un binario o distribuirlo junto a la aplicacion.
- Traduccion en el borde con requisitos de privacidad: al ejecutarse sin conexion, es adecuado cuando el material no puede salir del dispositivo.
- Filtrado previo antes de un modelo mayor: sirve para generar una traduccion de referencia barata y decidir que fragmentos requieren un modelo de mayor calidad.
- Preservacion de la direccion EN-PT en catalogos mixtos: permite cubrir titulos no japoneses dentro del mismo pipeline sin cambiar de modelo.
- Prototipado de pipelines de traduccion sin coste de API: util para validar formatos de entrada/salida y sincronizacion de tiempos antes de invertir en inferencia de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, COMET u otros) en la informacion disponible. El unico dato de evaluacion es el control de calidad interno del autor, sobre 6 frases, con decodificacion greedy y temperatura 0, donde PASS significa significado preservado y ausencia de alucinacion.

| Cuantizacion | Tamano | Puntuacion (gate de 6 frases, greedy, temp 0) |
|---|---|---|
| Q4_K_M | 397 MB | 4/6 |
| IQ3_M | No publicado (descartado) | 1/6, con salidas vacias |

Los fallos conocidos en Q4_K_M se concentran en peticiones corteses con honorifico (patron 先輩…いただけますか) y en la eleccion de verbo en la segunda frase del conjunto EN-PT. El autor indica que los errores son traducciones erroneas pero fluidas, sin repeticiones en bucle ni neologismos a Q4_K_M.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5-1 GB para Q4_K_M incluyendo el contexto, y en torno a 1,2 GB para el F16 sin cuantizar (calculo a partir de 0,6 mil millones de parametros a 2 bytes por peso).
- GPU recomendadas: cualquier GPU de consumo con 2 GB o mas de VRAM; modelos como RTX 3060, RTX 4060, GTX 1650 o integradas modernas son suficientes. No requiere A100, H100 ni GPU de centro de datos.
- Cabe sobradamente en GPU de consumo, y tambien se ejecuta en CPU (x86 o ARM) e incluso en placas tipo Raspberry Pi.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y koboldcpp, todos ellos con soporte de GGUF. El soporte de GGUF en vLLM es limitado y no se ha verificado para este repositorio; TGI no esta confirmado.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo por frase.
- Almacenamiento: el repositorio completo ocupa 0,4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-JAPT-GGUF | ~0,6 mil millones | No disponible en la model card | 4/6 en gate interno de 6 frases | No declarada en el repositorio | GGUF Q4_K_M, 397 MB, 0 descargas |
| Qwen/Qwen3-0.6B (base) | ~0,6 mil millones | 32.768 tokens segun la documentacion de Qwen | No comparable: evaluacion en tareas generales, no en JA-PT | Apache-2.0 | Pesos originales en safetensors |
| Alternativas de traduccion automatica dedicada (por ejemplo, familia OPUS-MT o NLLB-200) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos objetivos para comparar la calidad de traduccion de este ajuste con alternativas dedicadas de traduccion automatica neuronal. La comparacion con el modelo base no es significativa, ya que este no ha sido evaluado en el par JA-PT.

## Limitaciones y advertencias

- La evaluacion publicada se reduce a 6 frases con decodificacion greedy, lo que es una muestra demasiado pequena para inferir calidad real en produccion.
- Los fallos conocidos afectan a peticiones corteses con honorifico y a la eleccion de verbo en el conjunto EN-PT; no se ha caracterizado la tasa de error en corpus grandes.
- La cuantizacion IQ3_M produce salidas vacias y un 1/6 en el gate; el autor la ha descartado, por lo que no debe reutilizarse esa receta.
- El repositorio no declara licencia. Aunque el modelo base es Apache-2.0, la ausencia de licencia explicita en los pesos derivados es un riesgo juridico para uso comercial.
- El modelo hereda los sesgos del corpus de entrenamiento: OpenSubtitles introduce registro informal, jerga y posibles sesgos de contenido, y Tatoeba aporta frases cortas poco representativas de texto largo.
- Riesgo de alucinacion: el autor reconoce traducciones erroneas pero fluidas, lo que dificulta su deteccion automatica sin revision humana.
- Limitado en la practica a los pares JA-PT y EN-PT; el comportamiento en otras lenguas del modelo base no esta verificado.
- Solo se distribuye en GGUF; no hay pesos en safetensors ni adaptadores LoRA publicados, lo que limita el reentrenamiento o la fusion posterior.
- Con 0 descargas y 0 likes, no existe validacion por parte de la comunidad ni incidencias reportadas.
- La fecha de creacion registrada en el repositorio es 2026-09-18, posterior a la fecha habitual de referencia; conviene tratarla como un posible error de metadatos.
- La model card no especifica parametros de decodificacion recomendados, longitud de contexto efectiva ni limites de tokens de salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jabs2/Qwen3-0.6B-JAPT-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los enlaces obtenidos correspondian a contenidos no relacionados y se han descartado.
