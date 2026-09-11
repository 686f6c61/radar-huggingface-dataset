# Montalte/qwen4b-code-nothink-localize

## Resumen

Montalte/qwen4b-code-nothink-localize es un artefacto de fusión (merge) de pesos derivado de Qwen/Qwen3-4B-Base, publicado por el usuario Montalte el 11 de septiembre de 2026. No se trata de un modelo entrenado desde cero ni de un ajuste supervisado convencional: es el resultado de aplicar un procedimiento de "localize-and-stitch" (denominado Plan B) sobre un especialista previo en código, `modrill/code-nothink-q4b-20260908`, con el objetivo de estudiar la transferencia direccional de capacidades entre matemáticas y código. El repositorio tiene 0 descargas y 0 "likes", y se presenta explícitamente como material de experimentación, no como un modelo listo para producción.

El modelo conserva la arquitectura y el tamaño del base: 4.022.468.096 parámetros en formato safetensors (aproximadamente 8,1 GB de repositorio, coherente con pesos en precisión de 16 bits). La única información publicada sobre el proceso es la configuración del enmascarado de pesos: objetivo de esparsidad de 0,1, 10 épocas, 64 ejemplos (n-shot) y semilla 42, con el perfil de máscara `plan_b` y la tarea declarada `coding`.

Su relevancia es acotada y de carácter metodológico: sirve para reproducir y auditar técnicas de fusión selectiva de pesos en modelos pequeños (4B) que caben en GPU de consumo, y para comprobar si la capacidad de código de un especialista se preserva cuando solo se transfiere un subconjunto reducido del cuerpo del transformer. No se han publicado resultados de evaluación asociados al artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3, segun el modelo base declarado (Qwen/Qwen3-4B-Base); la model card no detalla numero de capas, cabezas ni tipo de atencion |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (el modelo base declarado es denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en el repositorio (solo se publican pesos en safetensors); no se declaran versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible; la model card no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 8,1 GB |
| Modelo base | Qwen/Qwen3-4B-Base (revision 906bfd4b4dc7f14ee4320094d8b41684abff8539) |
| Modelo especialista de origen | modrill/code-nothink-q4b-20260908 |
| Metodo de fusion | localize (Plan B Localize-and-Stitch sobre validacion MergeBench solo del origen) |
| Hiperparametros declarados | sparsity (keep) 0,1; lr 1e7; epochs 10; n-shot 64; seed 42; mask-profile plan_b |
| Exclusiones del enmascarado | embed y lm_head omitidos (stitch solo del cuerpo) |
| Pipeline | text-generation |
| Fecha de publicacion | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base declarado, Qwen/Qwen3-4B-Base, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. Este repositorio no incorpora cambios estructurales: es un artefacto de pesos fusionados, por lo que su grafo computacional, su tokenizador y su ventana de contexto son los heredados del base. La model card no aporta detalles sobre el dataset de preentrenamiento del base ni sobre el del especialista de código, y no menciona fases de RLHF, DPO u optimizacion por preferencias.

El procedimiento aplicado, denominado "localize" (Plan B Localize-and-Stitch), opera sobre la validacion de MergeBench usando exclusivamente el modelo de origen. Con un objetivo de esparsidad de 0,1 se selecciona aproximadamente un 10 % de los pesos del cuerpo del transformer, que se "cosen" sobre la estructura del base; las matrices de embedding y la cabeza de lenguaje (`lm_head`) quedan excluidas del enmascarado, tal y como indica el protocolo Plan B previo. Los hiperparametros registrados son 10 epocas, 64 ejemplos (n-shot), semilla 42 y un tipo de aprendizaje indicado como lr=1e7 (tal cual figura en la model card, sin que se aclare la unidad). La tarea de referencia para la que se optimiza la mascara es `coding`, en modalidad `nothink` (sin cadena de razonamiento explicita). Nota terminologica: en este contexto "localize" se refiere a la localizacion del subconjunto de pesos que se conserva, no a localizacion linguistica ni a adaptacion a idiomas.

## Capacidades

- Generacion de texto autoregresiva en la modalidad declarada `nothink`, es decir, respuestas directas sin bloque de razonamiento explicito. La etiqueta "nothink" es una decision de configuracion del artefacto, no una garantia de comportamiento en todas las plantillas de chat.
- Generacion de codigo: la mascara se selecciono optimizando la tarea `coding`, de modo que la capacidad objetivo del merge es la escritura y continuacion de codigo heredada del especialista `modrill/code-nothink-q4b-20260908`.
- Razonamiento matematico: el artefacto forma parte de un conjunto de experimentos de transferencia direccional entre matematicas y codigo, por lo que la evaluacion de esta capacidad es parte del proposito del modelo, sin resultados publicados.
- Soporte de tool calling / function calling: no disponible; la model card no lo declara.
- Soporte de agentes y razonamiento multi-paso: no disponible y poco probable en la configuracion `nothink`, que desactiva el razonamiento explicito.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponibles. El artefacto se publica especificamente en variante sin modo thinking.

## Casos de uso

- Investigacion sobre fusion de pesos: el artefacto es directamente utilizable como punto de comparacion frente al base Qwen3-4B-Base y frente al especialista de codigo, para medir que porcentaje de la capacidad original se conserva al retener un 10 % de los pesos del cuerpo. Su valor esta en la reproducibilidad de la configuracion (semilla 42, n-shot 64, plan_b).
- Auditoria de tecnicas localize-and-stitch: al excluir embed y lm_head del enmascarado, permite aislar el efecto del cosido sobre el cuerpo del transformer sin que la cabeza de lenguaje contamine el resultado.
- Generacion de codigo en local con hardware modesto: con 4.022 millones de parametros, el modelo se puede ejecutar en una unica GPU de consumo si se convierte a formatos cuantizados, lo que lo hace adecuado para autocompletado de codigo en entornos sin conexion.
- Base para ajuste fino posterior: al ser un artefacto pequeno y con licencia apache-2.0, puede servir como inicializacion para LoRA o QLoRA en tareas de generacion de codigo especificas de un dominio, siempre asumiendo que su calidad no esta validada.
- Reproduccion de experimentos de transferencia entre dominios: el par matematicas-codigo permite disenar estudios controlados sobre que subconjuntos de pesos son responsables de cada capacidad.
- Evaluacion comparativa de merges dentro de una misma familia: util para construir una linea base frente a otros artefactos de merge derivados de Qwen3-4B y comprobar si el metodo aporta ventaja medible.
- Pruebas de integracion en pipelines de CI: por su tamano, se puede desplegar como servicio de generacion de parches o resumenes de diff en un entorno de integracion continua, con la salvedad de que no hay datos de calidad publicados que respalden su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe unicamente el metodo de fusion y sus hiperparametros, y no incluye metricas de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra suite, ni comparaciones numericas con el modelo base o con el especialista de origen.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16, tal como se publica): en torno a 8,5-9 GB solo para pesos, mas el cache KV, que crece con la longitud de contexto y el tamano de lote. Estos calculos son estimaciones derivadas del numero de parametros; no los proporciona el autor.
- VRAM estimada tras cuantizacion a 8 bits: aproximadamente 4,5-5 GB de pesos. A 4 bits (Q4_K_M o similar): aproximadamente 2,5-3 GB de pesos. Las conversiones no estan publicadas en el repositorio y tendrian que generarse a partir de los safetensors.
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o cualquier GPU con 16 GB o mas de VRAM. Para cuantizacion a 4 bits: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090.
- Cabe en GPU de consumo: si, en fp16 en tarjetas de 12-16 GB con contexto moderado, y con holgura en 4 bits en tarjetas de 8 GB, siempre que se limite el contexto y el tamano de lote.
- Opciones de despliegue: transformers (formato nativo publicado), text-generation-inference (etiqueta declarada por el autor) y endpoints compatibles; vLLM, llama.cpp, Ollama y TGI serian viables tras convertir los pesos, pero ninguna de esas conversiones se distribuye en este repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Montalte/qwen4b-code-nothink-localize | 4.022.468.096 | No disponible | Sin benchmarks publicados | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Base (modelo base) | Misma familia y tamano (4B), valor exacto no disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| modrill/code-nothink-q4b-20260908 (especialista de origen) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Otros merges derivados de Qwen3-4B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion cuantitativa no es posible con los datos suministrados: no hay metricas del artefacto ni de sus antecesores. La unica diferencia verificable es de procedencia (pesos fusionados mediante localize frente a pesos del base) y de licencia declarada en este repositorio (apache-2.0).

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni pruebas de regresion publicadas. No se puede afirmar que el merge conserve la calidad del especialista de codigo ni la del base.
- Naturaleza experimental: la propia model card lo define como un artefacto de merge para experimentos de transferencia direccional. No es un modelo destinado a produccion.
- Riesgo de degradacion por fusion: retener solo un 10 % de esparsidad en el cuerpo del transformer implica descartar la mayor parte de los pesos del especialista; es esperable perdida de capacidad en tareas no cubiertas por la mascara, aunque no se cuantifica en la documentacion.
- Ambiguedad en los hiperparametros: el valor lr=1e7 aparece sin unidad ni contexto en la model card, lo que dificulta la reproduccion exacta del experimento.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; no se debe asumir un comportamiento multilingue correcto.
- Contexto no declarado: se desconoce la ventana de contexto efectiva del artefacto, dato critico para aplicaciones con conversaciones largas o repositorios extensos.
- Modo nothink: la ausencia de razonamiento explicito puede degradar tareas que requieren varios pasos (matematicas, depuracion compleja) si el modelo no ha sido entrenado para resolverlas en un solo paso.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de esta escala; no se ha evaluado su tasa de alucinacion y el ajuste por fusion puede incrementarla.
- Licencia: apache-2.0 permite uso comercial, pero el usuario debe verificar de forma independiente las condiciones del modelo base y del especialista de origen, ya que este repositorio solo declara su propia licencia.
- Procedencia: 0 descargas y 0 likes implican que el artefacto no ha sido validado por la comunidad; no existe evidencia externa de su funcionamiento.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento del base ni del especialista, por lo que no se pueden enumerar sesgos conocidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Montalte/qwen4b-code-nothink-localize
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Especialista de origen (referencia derivada del identificador citado en la model card): https://huggingface.co/modrill/code-nothink-q4b-20260908
- Guia de configuracion local de Qwen 3 (modos think/nothink, contexto y parametros): https://localaimaster.com/blog/qwen-3-local-setup-guide
- Hilo de discusion sobre el rendimiento de Qwen3 4B en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1naqln5/how_is_qwen3_4b_this_good/
- Solucion para respuestas vacias de Qwen 3.x en clientes compatibles con OpenAI (desactivacion del modo thinking y proxy OpenAI a Ollama): https://gist.github.com/TheAIHorizon/37c30e375f2ce08e726e4bb6347f26b1
- MergeBench: benchmark citado en la model card como base de validacion; no se ha proporcionado enlace en la informacion disponible.
