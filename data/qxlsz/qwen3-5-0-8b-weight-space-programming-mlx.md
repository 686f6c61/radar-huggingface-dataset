# qxlsz/Qwen3.5-0.8B-weight-space-programming-mlx

## Resumen

Qwen3.5-0.8B-weight-space-programming-mlx es una conversión al formato MLX del modelo RikiyaT/Qwen3.5-0.8B-weight-space-programming, pensada para ejecutarse en Apple silicon. El modelo subyacente es un Qwen3.5-0.8B de 852.985.920 parámetros al que se le han editado directamente dos tensores, sin ningún tipo de entrenamiento, con el objetivo de reducir los bucles de razonamiento (thinking loops) que el modelo base presenta en problemas matemáticos. Esta versión la publica el usuario qxlsz y no modifica el comportamiento del modelo, solo el formato de los pesos.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de "weight-space programming": editar tensores concretos de un modelo ya entrenado para corregir un comportamiento patológico sin pasar por fine-tuning. Por otro, muestra un caso práctico de conversión de un checkpoint PyTorch a MLX con verificación tensor a tensor, incluyendo las decisiones de precisión numérica que afectan al rendimiento en Apple silicon.

El modelo conserva la arquitectura Qwen3.5, con capacidades de image-text-to-text según el pipeline declarado, licencia Apache 2.0 y un tamaño de repositorio de 1,7 GB en bfloat16 sin cuantización. No se dispone de información sobre longitud de contexto, idiomas soportados ni datos de entrenamiento más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (arquitectura exacta no detallada en la informacion disponible) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea max_tokens=32768 para generacion, no contexto) |
| Tipos de cuantizacion | bfloat16 nativo sin cuantizacion; se documento un build 4-bit que no preserva calidad |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer de 852.985.920 parametros. Sobre el no hay entrenamiento adicional: la intervencion consiste en la edicion directa de dos tensores, `language_model.model.layers.15.mlp.down_proj.weight` y `language_model.model.layers.19.mlp.down_proj.weight`, sin gradientes ni datos de entrenamiento. El objetivo declarado es reducir los bucles de pensamiento del modelo base en problemas matematicos. Los detalles del metodo y de los resultados originales estan en el blog del autor del modelo fuente.

La conversion a MLX se hizo a bfloat16 nativo. La verificacion frente al checkpoint fuente (revision `d1671a178705bcab7644806d23c535517f35723b`) reporta 393 tensores byte-identicos, 19 reordenados al orden de ejes de MLX con valores exactos, 61 almacenados como `x + 1.0` por la convencion de RMSNorm de MLX y 15 tensores `mtp.*` del modelo draft descartados. Los dos tensores editados coinciden byte a byte con los sha256 publicados en la model card original. Frente a PyTorch en bfloat16 sobre 1.264 posiciones de token de 4 prompts, la prediccion top coincide en el 99,37% con una divergencia KL media de 7,06e-4.

Dos decisiones tecnicas destacan. Los 18 tensores `linear_attn.norm.weight` se mantienen en float32 porque `--dtype bfloat16` los estrecharia, y restaurarlos no tiene coste medible de velocidad. Los 61 pesos RMSNorm se redondean hasta 0,0156 al almacenar `x + 1.0` en bfloat16; mantenerlos en float32 era mas fiel al original pero unas 4 veces mas lento.

## Capacidades

- Generacion de texto y razonamiento paso a paso, con modo thinking activable mediante `enable_thinking=True` en la plantilla de chat.
- Razonamiento matematico con formato de respuesta `\boxed{}` y verificacion con math-verify.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text y la model card indica el uso de mlx-vlm para imagenes.
- Conversacion multi-turno mediante plantilla de chat compatible con el modelo fuente.
- Soporte de penalizacion de presencia configurable sobre toda la generacion (`presence_penalty=1.5`, `presence_context_size=32768`), parte del protocolo de modo thinking.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- Capacidades multilingues: no documentadas; la tokenizacion se verifico con un prompt que mezcla matematicas, CJK, emoji y tokens especiales, pero no se declaran idiomas soportados.

## Casos de uso

- Razonamiento matematico en local sobre Mac: el modelo resuelve problemas tipo MATH-500 con modo thinking y respuesta en `\boxed{}`, ejecutandose en Apple silicon a unos 200 tokens/s y 1,6 GB de memoria pico, lo que lo hace viable en un portatil sin GPU dedicada.
- Evaluacion de tecnicas de edicion de pesos: sirve como caso de estudio reproducible para investigadores que quieran medir el efecto de modificar tensores concretos en el comportamiento de razonamiento, con scripts de evaluacion y grading incluidos en el repositorio.
- Prototipado de asistentes conversacionales ligeros: con 852 millones de parametros y licencia Apache 2.0, es adecuado para iterar rapidamente en prototipos de chat en macOS antes de escalar a modelos mayores.
- Verificacion de conversiones PyTorch a MLX: el repositorio incluye `scripts/verify_weights.py` y compara sha256 y divergencia KL, por lo que es un ejemplo practico de control de calidad en pipelines de conversion de checkpoints.
- Procesamiento de imagen y texto en local: al declarar pipeline image-text-to-text y cargarse con mlx-vlm, puede emplearse en tareas multimodales ligeras sobre Apple silicon, aunque no se detallan capacidades visuales concretas.
- Docencia y divulgacion: por su tamano reducido y su comportamiento documentado frente al modelo base (0,0% de acierto y 100% de limite de tokens en el base frente a 60,6% y 15,2% en este modelo sobre 33 problemas), es un ejemplo claro de como una intervencion minima cambia el comportamiento de un modelo.

## Benchmarks y rendimiento

Evaluacion en MLX sobre problemas de MATH-500 equiespaciados, una muestra por problema, en Apple M5 Max, con temperatura 0,6, top_p 0,95, top_k 20, penalizacion de presencia 1,5 sobre todos los tokens generados, 32.768 tokens maximos y grading del ultimo `\boxed{}` con math-verify:

| Modelo | Problemas | Precision (IC 95%) | Limite de tokens alcanzado (IC 95%) | Tokens medios |
|---|---|---|---|---|
| Qwen3.5-0.8B base, MLX | 17 | 0,0% (0,0-18,4) | 100,0% (81,6-100,0) | 32.768 |
| Este modelo | 33 | 60,6% (43,7-75,3) | 15,2% (6,7-30,9) | 17.571 |

En los mismos 33 problemas, las puntuaciones publicadas en PyTorch del repositorio fuente promedian 58,3%. Las cifras completas de MATH-500 del modelo fuente son 51,0% de precision y 31,6% de limite de tokens alcanzado; el subconjunto evaluado aqui es demasiado pequeno para estimar esas cifras con precision.

La evaluacion se detuvo por limite de tiempo antes de completar los 40 problemas previstos para este modelo y los 20 del base, cubriendo los primeros 33 y 17 en orden del dataset. Los resultados brutos estan en `eval/` y se reproducen con `scripts/eval_math.py` y `scripts/grade.py`.

Rendimiento: unos 200 tokens/s y 1,6 GB de memoria pico en Apple M5 Max sobre una generacion de 400 tokens; la memoria pico alcanzo 2,2 GB en las generaciones largas de la evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (MLX) | 852.985.920 | no disponible | 60,6% en subconjunto de 33 problemas; 51,0% en MATH-500 completo segun el autor del modelo fuente | Apache 2.0 | safetensors MLX |
| Qwen3.5-0.8B base | 852.985.920 (segun el modelo fuente) | no disponible | 0,0% en subconjunto de 17 problemas, 100% de limite de tokens | no disponible en la informacion proporcionada | PyTorch / MLX |
| Version 4-bit de este modelo | 852.985.920 (cuantizado) | no disponible | 11 aciertos frente a 20 en los mismos 33 problemas | Apache 2.0 | MLX 4-bit |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo corrige parcialmente los bucles de pensamiento: en el subconjunto evaluado, el 15,2% de las generaciones agoto el limite de 32.768 tokens.
- La cuantizacion 4-bit no preserva la calidad: alcanzo 27,5% de limite de tokens en 40 problemas y solo 11 aciertos frente a 20 del modelo sin cuantizar en los mismos 33 problemas. No se recomienda su uso si se busca el comportamiento editado.
- El redondeo de los 61 pesos RMSNorm en bfloat16 introduce un error de hasta 0,0156; es una concesion de velocidad, no una equivalencia exacta con el modelo fuente.
- La evaluacion es de muestra pequena (33 problemas) y se interrumpio por limite de tiempo; los intervalos de confianza son amplios y no deben tomarse como estimacion precisa del rendimiento global.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento fuera del dominio matematico; el modelo es una edicion de un modelo base de 0,8B y hereda sus limitaciones generales.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modo thinking con penalizacion de presencia elevada puede alterar la fidelidad de las respuestas fuera de matematicas.
- La licencia Apache 2.0 permite uso comercial, pero el credito del modelo y de la edicion corresponde a sus autores originales; este repositorio solo cambia el formato.
- Dependencia de mlx-lm y mlx-vlm: no es desplegable con vLLM, TGI ni llama.cpp en el formato publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qxlsz/Qwen3.5-0.8B-weight-space-programming-mlx
- Modelo fuente: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- Blog del autor del modelo fuente: https://rikiyat.github.io/blog/weight-space-programming/
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
