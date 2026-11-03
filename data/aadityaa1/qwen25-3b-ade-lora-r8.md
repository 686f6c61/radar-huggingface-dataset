# aadityaa1/qwen25-3b-ade-lora-r8

## Resumen

`aadityaa1/qwen25-3b-ade-lora-r8` es un adaptador LoRA de rango 8 para `Qwen/Qwen2.5-3B-Instruct`, entrenado para una tarea muy concreta de extraccion de informacion: dado un enunciado de un informe de caso clinico, devolver un objeto JSON con todos los pares (farmaco, efecto adverso) presentes en el texto. El adaptador lo publica el usuario aadityaa1 como proyecto de portafolio e investigacion que compara fine-tuning frente a prompting sobre el mismo modelo base, y se distribuye en formato MLX (no PEFT), pensado para ejecutarse con `mlx-lm` sobre la conversion de 4 bits `mlx-community/Qwen2.5-3B-Instruct-4bit`.

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only de 3.000 millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 mediante configuracion). El adaptador no contiene pesos del modelo base: solo los pesos LoRA, entrenados sobre las ultimas 16 capas con rank 8, escala 20, dropout 0,05, batch 4 y 1.700 pasos (aproximadamente 2 epocas) con tasa de aprendizaje constante de 1e-4. El entrenamiento se realizo localmente en un Apple M4 con 16 GB de memoria unificada en unos 91 minutos.

La relevancia del proyecto es metodologica: cuantifica con un protocolo congelado de antemano cuanto aporta el ajuste fino frente al prompting few-shot en una tarea de extraccion estructurada. Sobre un conjunto de test de 428 frases, el adaptador alcanza un F1 de pares de 0,733 y un 99,8 % de JSON valido, frente a 0,581 del mismo modelo con prompting de 4 ejemplos y 0,667 de `gpt-oss-120b` con 4 ejemplos via API. La licencia es Qwen Research License, de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 8) sobre transformer decoder-only Qwen2.5-3B-Instruct; formato MLX |
| Parametros totales | No disponible para el adaptador; el base Qwen2.5-3B-Instruct tiene 3.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador; el base Qwen2.5-3B-Instruct soporta 32.768 tokens nativos |
| Tipos de cuantizacion | Entrenado y publicado para el base en 4 bits (`mlx-community/Qwen2.5-3B-Instruct-4bit`); el adaptador en si son pesos LoRA en MLX |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Qwen Research License (`qwen-research`), solo no comercial |
| Formato de pesos | MLX (adaptador LoRA, no PEFT); requiere el base en formato MLX 4 bits |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso con atencion causal estandar, RoPE y capas MLP con SwiGLU. El ajuste se limita a las ultimas 16 capas del modelo, con LoRA de rank 8, alpha/escala 20 y dropout 0,05. La perdida se calcula unicamente sobre los tokens de respuesta, no sobre el prompt. Se uso semilla 42, batch 4 y 1.700 pasos con tasa de aprendizaje constante de 1e-4 sin decaimiento. Segun el autor, rank 16 no mejoro de forma detectable y una tasa de 2e-4 fue peor en F1 de validacion con el mismo numero de pasos.

Los datos provienen de `ade-benchmark-corpus/ade_corpus_v2`, configuracion `Ade_corpus_v2_drug_ade_relation` (Gurulingappa et al., 2012, *Journal of Biomedical Informatics*). Las 6.821 filas originales se agruparon en 4.271 frases unicas y se dividieron por frase con semilla 42: 3.416 de entrenamiento, 427 de validacion y 428 de test, sin solapamiento de frases entre particiones. El autor advierte que las etiquetas gold son incompletas y presentan fronteras de span inconsistentes. No se emplearon tecnicas de RLHF ni DPO; el ajuste es supervisado sobre pares entrada-salida en formato JSON.

## Capacidades

- Extraccion de relaciones farmaco-efecto adverso en una sola frase medica, con salida JSON estricta de la forma `{"adverse_events": [{"drug": "...", "effect": "..."}]}`.
- Generacion de JSON valido en el 99,8 % de los casos del conjunto de test cuando se usa el system prompt exacto de entrenamiento.
- Manejo del caso vacio: devuelve `{"adverse_events": []}` cuando la frase no contiene pares.
- Capacidades generales heredadas del base Qwen2.5-3B-Instruct (generacion de texto, razonamiento basico, codigo), aunque el autor documenta degradacion en prompts cortos no relacionados con la tarea.
- Soporte de tool calling y function calling: no documentado para el adaptador; el base Qwen2.5-Instruct lo soporta, pero el ajuste puede haber erosionado esta capacidad.
- Modo thinking, vision o audio: no disponible.
- Capacidades multilingues: no; el adaptador esta entrenado y evaluado solo en ingles.

## Casos de uso

- Extraccion estructurada de farmacovigilancia en pipelines de investigacion: procesar lotes de resumenes de casos clinicos publicos y convertir cada frase en pares (farmaco, efecto) listos para agregacion en una base de datos relacional. El adaptador supera al prompting few-shot en esta tarea concreta (F1 0,733 frente a 0,581).
- Prototipado de sistemas de informacion biomedica en local: al ejecutarse con `mlx-lm` sobre un Apple M4 de 16 GB, permite iterar sin coste de API ni enviar datos a terceros, util en entornos de investigacion con datos sensibles.
- Evaluacion comparativa de estrategias de ajuste: sirve como referencia reproducible (codigo, particiones y logs publicados) para medir la ganancia de LoRA frente a prompting en tareas de extraccion de entidades y relaciones.
- Etiquetado asistido de corpus: usar el adaptador como preetiquetador de frases medicas que luego un revisor humano corrige, aprovechando el 66,8 % de exact match como punto de partida.
- Docencia y experimentacion con MLX: ejemplo completo de flujo `mlx_lm.lora` con conversion 4 bits, util para aprender a entrenar adaptadores en hardware Apple.
- Filtrado y triaje de literatura: clasificar rapidamente frases de articulos o informes para detectar menciones de reacciones adversas y priorizar la revision manual.
- No es adecuado para decision clinica, diagnostico ni ningun uso medico real, como el propio autor indica.

## Benchmarks y rendimiento

Resultados en el conjunto de test (n=428), con protocolo congelado de antemano y coincidencia estricta tras normalizar mayusculas y espacios:

| Modelo | JSON valido | F1 de pares | Precision / Recall | Exact match |
|---|---|---|---|---|
| Qwen2.5-3B, zero-shot | 26,9 % | 0,154 | 0,483 / 0,092 | 7,9 % |
| Qwen2.5-3B, 4-shot | 91,1 % | 0,581 | 0,662 / 0,518 | 42,5 % |
| gpt-oss-120b, 4-shot (API) | 100 % | 0,667 | 0,739 / 0,607 | 58,4 % |
| Este adaptador, prompt corto | 99,8 % | 0,733 | 0,747 / 0,720 | 66,8 % |

Intervalos de confianza al 95 % por bootstrap pareado: adaptador frente a `gpt-oss-120b` +0,066 [+0,025, +0,108]; adaptador frente al mismo base con prompting 4-shot +0,152 [+0,107, +0,198]. Entrenamiento con una sola semilla. Con una metrica de solapamiento laxa, el F1 sube a 0,899. En el conjunto de entrenamiento el F1 es 0,914, lo que evidencia memorizacion.

## Requisitos de hardware

- VRAM/memoria: el adaptador se ejecuta sobre `mlx-community/Qwen2.5-3B-Instruct-4bit`; el autor lo entreno y ejecuto en un Apple M4 con 16 GB de memoria unificada. Una estimacion razonable para el base en 4 bits es de 2 a 3 GB de pesos mas overhead de KV cache y runtime.
- GPU recomendadas: no hay datos especificos del autor. El formato MLX esta pensado para Apple Silicon (series M1, M2, M3, M4); para GPU NVIDIA seria necesario convertir el adaptador a PEFT o reentrenar, ya que se publica en MLX y no en PEFT.
- GPU de consumo: cabe en Apple Silicon con 16 GB o mas; en NVIDIA, un base de 3B en 4 bits cabria en GPUs de 8 GB o mas, pero el adaptador publicado no es directamente compatible con ese stack.
- Opciones de despliegue: `mlx-lm` (unica via documentada). vLLM, llama.cpp, Ollama y TGI no estan soportados de forma nativa para este adaptador en formato MLX.
- Latencia y throughput: no disponibles. El entrenamiento completo tardo unos 91 minutos en un M4 de 16 GB, pero no se publican metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 de pares (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-3B + LoRA r8) | 3B (base) + LoRA | 32.768 (base) | 0,733 | Qwen Research (no comercial) | HuggingFace, formato MLX |
| Qwen2.5-3B-Instruct con prompting 4-shot | 3B | 32.768 | 0,581 | Apache 2.0 (base) | HuggingFace, amplia variedad de formatos |
| gpt-oss-120b con prompting 4-shot | 120B (MoE) | No disponible | 0,667 | No disponible en la informacion | API |
| Qwen2.5-3B-Instruct zero-shot | 3B | 32.768 | 0,154 | Apache 2.0 (base) | HuggingFace |

La comparativa se limita a los modelos evaluados por el autor en la misma tarea y protocolo; no hay datos de otros adaptadores especializados en extraccion de eventos adversos.

## Limitaciones y advertencias

- Memorizacion: F1 de 0,914 en entrenamiento frente a 0,733 en test, lo que sugiere sobreajuste al corpus.
- Sensibilidad al prompt: espera el system prompt exacto de entrenamiento; con un prompt de 4 ejemplos el F1 de test cae a 0,571.
- Fronteras de span: la mayoria de errores se deben a limites de span inconsistentes en las etiquetas gold; con metrica laxa el F1 sube a 0,899.
- Degradacion en tareas generales: en 4 prompts cortos no relacionados dio salidas erroneas o degeneradas (bucles de repeticion, enlaces de imagen espurios) que el base respondia correctamente; en un set de 40 preguntas de sanity obtuvo 35/40, igual que el base.
- Bucles de repeticion que pueden truncar el JSON en algunas entradas.
- Entrenado con una sola semilla, un unico dataset y una unica particion; no hay garantia de generalizacion mas alla de esta tarea.
- Licencia Qwen Research License: uso exclusivamente no comercial; revisar `LICENSE` y `NOTICE` antes de cualquier despliegue.
- El dataset `ade_corpus_v2` no declara licencia, por lo que deben comprobarse sus terminos antes de reutilizar datos.
- No apto para uso clinico ni medico; es un ejercicio de extraccion de texto sobre literatura publica.
- Solo ingles; no se ha evaluado en castellano ni en otros idiomas.
- Formato MLX no portable directamente a stacks PEFT/NVIDIA sin conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aadityaa1/qwen25-3b-ade-lora-r8
- Repositorio del proyecto (codigo, particiones, logs y analisis de errores): https://github.com/aadityaa-dava/finetune-vs-prompt
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Base cuantizado en 4 bits para MLX: https://huggingface.co/mlx-community/Qwen2.5-3B-Instruct-4bit
- Dataset: https://huggingface.co/datasets/ade-benchmark-corpus/ade_corpus_v2
- Articulo de referencia del corpus: Gurulingappa, H., Rajput, A. M., Roberts, A., Fluck, J., Hofmann-Apitius, M., Toldo, L. (2012). Development of a benchmark corpus to support the automatic extraction of drug-related adverse effects from medical case reports. *Journal of Biomedical Informatics*.
