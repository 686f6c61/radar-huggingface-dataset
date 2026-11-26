# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s100

## Resumen

klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s100 es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por el usuario mseo3. Se trata de un checkpoint intermedio (paso 100 de 1500) de un experimento de entrenamiento orientado a introducir un formato de planificacion explicita mediante dos tokens especiales de control, `<|plan|>` y `<|/plan|>`, que se han anadido al vocabulario del modelo base y cuyas filas en el `lm_head` se han reinicializado de forma ortogonal a sus representaciones de texto.

El modelo resuelve un problema de investigacion concreto: ensenar a un razonador de 8B a estructurar su cadena de razonamiento en bloques de plan delimitados por tokens dedicados, usando un dataset privado de 27.773 filas revisadas en el que los pasos fallidos se enmascaran de la perdida. No es un modelo pensado para produccion ni para uso general: es un artefacto de investigacion publicado en abierto bajo licencia Apache 2.0, sin model card divulgada mas alla de la receta de entrenamiento y sin resultados de evaluacion publicados.

Por su naturaleza (checkpoint temprano de un run de investigacion, con cero descargas y sin pipeline declarado), debe tratarse como material de reproduccion experimental. Su relevancia actual es acotada: sirve a quien quiera estudiar el efecto de tokens de planificacion en el razonamiento de modelos de 8B, no a quien busque un asistente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3, segun el tag `qwen3`); no se detalla configuracion de capas ni atencion |
| Parametros totales | 8.190.735.360 (~8,19 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo parte de Klear-Reasoner-8B-SFT (familia Qwen3 segun los tags) y anade dos tokens especiales al vocabulario: `<|plan|>` con id 151669 y `<|/plan|>` con id 151670. A diferencia de un enfoque de embeddings atados, estos tokens se han dejado sin atar (untied) y las filas correspondientes del `lm_head` se han reinicializado de forma ortogonal a sus piezas de texto, un detalle de diseno que busca evitar que el token herede una direccion semantica preexistente.

El entrenamiento se ejecuto sobre 4 GPU H200 con FlashAttention 3, usando la receta `sft_recipe_v3orth` (run `sft_g_ptokc_orth_lr2e5_revm2v2_b36_s1500_brewster`). Los datos provienen del dataset privado `mseo3/klear8b-planfmt-revmask-sft` en la revision `5ef1de66`, rama `data/rev_m2_v2`, con 27.773 filas revisadas; los pasos fallidos se enmascaran de la funcion de perdida. Hiperparametros declarados: batch global 36 (33 no se reparte sobre 4 GPU), learning rate 2e-5 con decaimiento coseno hasta 1e-5 a lo largo de 1500 pasos, warmup de 30 pasos. El checkpoint publicado corresponde al paso 100, es decir, aproximadamente el 6,7 % del entrenamiento previsto. Solo se conserva el optimizador en el guardado mas reciente (podado con `SFT_PRUNE_OPT_BEFORE_SAVE=1`).

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a razonamiento.
- Formato de planificacion: emision de bloques delimitados por `<|plan|>` y `<|/plan|>` como parte de su salida, segun el objetivo del ajuste.
- Razonamiento multi-paso: el entrenamiento se centra en estructurar cadenas de razonamiento en pasos de plan.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Investigacion sobre tokens de control: usar el modelo para estudiar como afecta la introduccion de tokens de planificacion dedicados a la estructura de la cadena de razonamiento, comparando con el modelo base sin ajustar.
- Reproduccion de experimentos de SFT: el checkpoint permite verificar la receta `sft_recipe_v3orth` (learning rate, batch, enmascarado de pasos fallidos) en un entorno propio con 4 GPU de clase H200.
- Analisis de inicializacion ortogonal de embeddings: util para medir el efecto de reinicializar filas del `lm_head` de forma ortogonal frente a metodos de atado o inicializacion aleatoria estandar.
- Generacion de datos sinteticos con estructura de plan: si el modelo emite bloques `<|plan|>`, puede emplearse para producir trazas de razonamiento planificadas destinadas a otros pipelines de destilacion, siempre con validacion humana.
- Estudio de checkpoints intermedios: al ser el paso 100 de 1500, sirve para analizar la evolucion temprana del aprendizaje del formato frente a checkpoints posteriores del mismo run.
- Pruebas de infraestructura de inferencia: util para validar el despliegue de un modelo de 8B en bf16 (16,4 GB de pesos) en vLLM o TGI y comprobar el manejo de tokens especiales anadidos al vocabulario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en bf16, los 8,19 mil millones de parametros ocupan aproximadamente 16,4 GB solo en pesos; con cache KV y overhead de runtime, se recomienda un minimo de 24 GB para contexto corto.
- Cuantizacion a 8 bits: en torno a 9-10 GB de pesos; a 4 bits, en torno a 5 GB, aunque no se publican artefactos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se hizo en H200; para inferencia, A100 (40/80 GB) o H100 ofrecen margen amplio. Una RTX 4090 (24 GB) es el limite practico para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 (24 GB) en bf16 con contexto contenido; en GPUs de 16 GB solo mediante cuantizacion, que habria que generar el mismo.
- Opciones de despliegue: vLLM o TGI para bf16; llama.cpp u Ollama requeririan conversion a GGUF, no publicada. Es necesario registrar los tokens 151669 y 151670 como tokens especiales en el tokenizer del runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s100 | 8,19 B | no disponible | Apache 2.0 | Checkpoint de investigacion, 0 descargas |
| Kwai-Klear/Klear-Reasoner-8B-SFT (modelo base) | ~8 B | no disponible | no disponible en esta ficha | Modelo de referencia publicado por Kwai-Klear |
| Qwen3-8B (familia de origen) | ~8 B | no disponible en esta ficha | no disponible en esta ficha | Modelo generalista ampliamente desplegado |

La comparacion de rendimiento no es posible: no hay benchmarks publicados para este checkpoint ni datos de evaluacion en la informacion disponible. Frente al modelo base, la unica diferencia documentada es la adicion de los dos tokens de plan y el ajuste SFT parcial (paso 100 de 1500).

## Limitaciones y advertencias

- Checkpoint intermedio: el paso 100 de 1500 implica que el modelo no ha completado su entrenamiento previsto; su comportamiento puede ser inestable o incoherente.
- Sin evaluacion: no hay benchmarks, ni metricas de perdida publicadas, ni comparacion con el modelo base, por lo que no puede afirmarse ninguna mejora.
- Dataset privado: los datos de entrenamiento no son publicos, lo que impide auditar sesgos o composicion.
- Riesgo de alucinacion: inherente a los modelos de razonamiento de esta escala; no hay evaluacion especifica que lo cuantifique.
- Idiomas: no declarados; se desconoce el soporte real multilingue.
- Contexto: no documentado; no debe asumirse ninguna ventana concreta.
- Tokens especiales: el uso correcto exige configurar `<|plan|>` (151669) y `<|/plan|>` (151670) en el tokenizer y el runtime; sin ello, la salida del modelo puede degradarse.
- Uso comercial: la licencia Apache 2.0 lo permite tecnicamente, pero el estado experimental y la ausencia de evaluacion lo desaconsejan para produccion.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad que haya validado el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s100
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado, referencia): mseo3/klear8b-planfmt-revmask-sft, revision 5ef1de66, rama data/rev_m2_v2
- Paper, blog o demo adicionales: no disponible
