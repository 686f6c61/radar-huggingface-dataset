# Savoxism/amid-kd-8xh200-gemma2-2b-it-amid

## Resumen

amid-kd-8xh200-gemma2-2b-it-amid es un adaptador LoRA para `google/gemma-2-2b-it` obtenido mediante destilacion de conocimiento (knowledge distillation) desde el modelo profesor `google/gemma-2-9b-it`. Lo publica el usuario Savoxism como punto final de la fase `gemma/amid` del experimento de investigacion `amid-kd-8xh200`, cuyo objetivo es estudiar metodos de destilacion adaptativa sobre respuestas generadas por el profesor en el conjunto de datos `VoCuc/UltraInteract-Infer`.

El modelo no es un modelo base autonomo: se trata de un adaptador PEFT (LoraConfig con r=16 y alpha=32 sobre las proyecciones q/k/v/o y las MLP gate/up/down) que debe cargarse sobre los pesos de Gemma 2 2B instruidos. El repositorio ocupa 0,1 GB y contiene un unico fichero `adapter_model.bin`. El interes actual del artefacto es fundamentalmente metodologico y de reproducibilidad: documenta de forma detallada una receta de destilacion (AMiD, con umbral de generacion adaptativo y buffer de replay por rango) y publica las metricas de evaluacion obtenidas con lm-eval 0.4.12 sobre vLLM 0.17.1, incluidas las advertencias sobre que mediciones no son validas.

La relevancia practica es limitada si se busca un asistente listo para produccion: el autor no evaluo la linea base (ni el alumno sin entrenar ni el profesor), de modo que no puede afirmarse que la destilacion aporte ganancia alguna, y el checkpoint no fue seleccionado por su rendimiento en el conjunto de desarrollo. Se trata, por tanto, de un artefacto de investigacion util para reproducir y analizar el pipeline de destilacion, no de un modelo finalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Gemma 2); adaptador PEFT |
| Parametros totales | 2,6 mil millones aproximadamente en el modelo base segun la documentacion publica de Google; el adaptador ocupa 0,1 GB (no se declara el numero exacto de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens en el modelo base segun su documentacion publica; el entrenamiento de este adaptador uso max length 1025 y max prompt length 512 |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos del adaptador sin cuantizar en formato binario de PyTorch) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | gemma (Gemma Terms of Use, heredada del modelo base) |
| Formato de pesos | `adapter_model.bin` (binario de PyTorch) mas configuracion PEFT; sha256 del adaptador: `2cfc8c62c5ef20c7dc800c8b44ab12bb063d056fdea10426ec4926bcfd7c1ffb` |
| Modelo base | google/gemma-2-2b-it, revision `299a8560bedf22ed1c72a8a11e7dce4a7f9f51f8` |
| Modelo profesor | google/gemma-2-9b-it, revision `11c9b30` (fp16) |
| Configuracion LoRA | r=16, alpha=32, dropout 0,05, aplicado a q, k, v, o, gate, up, down |
| Metodo de destilacion | AMiD (`--type adaptive-amid`), variantes ab/pr, alpha=0,5, lambda=0,5 |
| Dataset de entrenamiento | VoCuc/UltraInteract-Infer, revision `3c2fb0d`; 79.751 registros de entrenamiento generados por el profesor |
| Pasos de entrenamiento | 2492 (2 epocas x 1246 pasos); este checkpoint corresponde al paso 2492 |
| Pipeline | text-generation (library_name: peft) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-03 |

## Arquitectura y entrenamiento

El modelo base es Gemma 2 2B en su variante instruida, un transformer decoder-only con atencion por ventanas alternada y atencion completa entre capas, segun la documentacion publica de Google. Sobre esa arquitectura se entrena unicamente un adaptador LoRA de rango 16 y alpha 32 con dropout 0,05, aplicado a las proyecciones de atencion (q, k, v, o) y a las tres proyecciones de la MLP (gate, up, down). El objetivo de entrenamiento combina la perdida de destilacion desde el profesor con la senal del propio alumno: se usa `--kd-ratio 1.0`, un umbral adaptativo de generacion que arranca en 0,0, `--loss-eps 0.1` y un buffer de replay de 1000 ejemplos por rango.

El procedimiento AMiD con variantes ab/pr usa alpha=0,5 y lambda=0,5. La optimizacion emplea learning rate 1e-4 con decaimiento coseno, sin warmup, weight decay 1e-2 y recorte de gradiente de 1,0. El entrenamiento se ejecuto con 8 GPU H200 en bf16 con DeepSpeed, batch global de 64 (8 GPU x 4 por dispositivo x 2 de acumulacion de gradiente), semilla 10, longitud maxima 1025 y longitud maxima de prompt 512. No se documenta el numero total de tokens vistos ni la composicion interna del dataset mas alla del numero de registros (79.751). No se menciona uso de RLHF ni DPO; el metodo es exclusivamente destilacion supervisada sobre respuestas generadas por el profesor.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del modelo base instruido.
- Razonamiento matematico elemental con resultados irregulares: la evaluacion reporta 0,4936 de flexible-extract en GSM8K y 0,3356 en GSM-Plus, frente a 0,0599 y 0,0202 de strict-match, diferencia atribuida por el autor a la ausencia del marcador `#### <n>` en las respuestas.
- Resolucion de problemas matematicos formales limitada: 0,2456 de math_verify y 0,0256 de exact_match en MATH (minerva_math).
- Conocimiento cientifico y de nivel universitario en STEM: 0,908 de accuracy en SciQ (0-shot) y 0,4754 en MMLU-STEM (5-shot).
- Generacion de codigo: el autor declara que el resultado de MBPP (pass@1 = 0,0) es invalido por un artefacto del pipeline de evaluacion, por lo que no hay medicion fiable de esta capacidad.
- Soporte de tool calling / function calling: no disponible (no declarado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (el dataset de destilacion, UltraInteract, contiene trazas multi-paso, pero la model card no declara ni evalua esta capacidad).
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).
- Modo de pensamiento explicito, vision o audio: no disponible (no se declara ninguna capacidad de este tipo; el modelo base es unicamente de texto).

## Casos de uso

- Reproduccion de experimentos de destilacion: el repositorio documenta de forma completa la configuracion (metodo AMiD, hiperparametros, semilla, hardware y dataset), lo que permite replicar el pipeline sobre el mismo par alumno-profesor de Gemma 2 y comparar variantes del umbral adaptativo.
- Investigacion sobre LoRA en modelos pequenos: sirve como referencia de una configuracion concreta (r=16, alpha=32, dropout 0,05 sobre siete proyecciones) para estudiar el equilibrio entre capacidad de adaptacion y coste de almacenamiento en adaptadores de 0,1 GB.
- Prototipado de asistentes conversacionales en local: al apoyarse en un modelo base de 2B, el conjunto puede ejecutarse en una GPU de consumo una vez fusionado el adaptador, lo que resulta adecuado para demos internas sin coste de API.
- Evaluacion de tecnicas de medida en pipelines con LoRA: el caso de MBPP documenta un fallo reproducido (499 de 500 programas generados contienen el caracter SentencePiece `▁` U+2581 en lugar de espacios de indentacion), util para quien depure evaluaciones con vLLM y adaptadores.
- Analisis de la brecha strict-match frente a flexible-extract: los resultados de GSM8K y GSM-Plus son un ejemplo claro de como el formato de la respuesta, y no solo el contenido, determina la metrica, util para disenar protocolos de evaluacion mas robustos.
- Punto de partida para ajuste posterior supervisado o preferencias: el adaptador puede servir como inicializacion en experimentos de alineamiento sobre Gemma 2 2B, dado su bajo coste de almacenamiento y su compatibilidad con el ecosistema PEFT.
- Docencia y divulgacion tecnica: permite ilustrar en un aula o taller el ciclo completo de destilacion de un modelo de 9B a uno de 2B, incluida la lectura critica de una model card con advertencias explicitas sobre la validez de sus cifras.

## Benchmarks y rendimiento

Evaluacion con lm-eval 0.4.12 sobre vLLM 0.17.1 (valor mas o menos error estandar). GSM8K, GSM-Plus, MATH, MMLU-STEM y SciQ usan la plantilla de chat; MBPP no la usa y se evalua con temperatura 0.

| Tarea | Metrica | Valor |
|---|---|---|
| GSM8K (5-shot, n=1319) | strict-match | 0,0599 ± 0,0065 |
| GSM8K (5-shot, n=1319) | flexible-extract | 0,4936 ± 0,0138 |
| MATH `minerva_math` (4-shot, n=5000) | exact_match | 0,0256 ± 0,0022 |
| MATH `minerva_math` (4-shot, n=5000) | math_verify | 0,2456 ± 0,0058 |
| GSM-Plus (5-shot, n=10552) | strict-match | 0,0202 ± 0,0014 |
| GSM-Plus (5-shot, n=10552) | flexible-extract | 0,3356 ± 0,0046 |
| MMLU-STEM (5-shot, n=3153) | acc | 0,4754 ± 0,0086 |
| SciQ (0-shot, n=1000) | acc | 0,908 ± 0,0091 |
| SciQ (0-shot, n=1000) | acc_norm | 0,756 ± 0,0136 |
| MBPP (3-shot, n=500) | pass@1 | 0,0 (invalido, ver notas) |

Evaluacion en el conjunto de desarrollo (200 registros extraidos de los propios datos de entrenamiento, por lo que miden ajuste y no generalizacion):

| Momento | avg_loss | rougeL | exact_match | Umbral adaptativo final |
|---|---|---|---|---|
| Antes del entrenamiento | 2,898 | 0,55 | 0,0 | 0,0 |
| Final de la epoca 1 | 2,781 | 1,41 | 0,0 | 0,0 |
| Final de la epoca 2 | 2,781 | 0,66 | 0,0 | 0,0 |

El autor advierte de que no se evaluo ninguna linea base (ni el alumno sin entrenar ni el profesor), por lo que estas cifras no demuestran ni una ganancia ni una perdida atribuible a la destilacion. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: 0,1 GB en disco; en memoria, el adaptador anadido a los pesos base en bf16 ocupa del orden de centenas de megabytes adicionales, segun la estimacion derivada del tamano del repositorio.
- VRAM para el modelo base fusionado (estimaciones, no facilitadas por el autor): en bf16 o fp16 en torno a 5,2 GB solo de pesos; en cuantizacion de 8 bits alrededor de 2,9 GB; en cuantizacion de 4 bits alrededor de 1,6 GB.
- Cache KV: con el contexto completo de 8192 tokens del modelo base, la cache de atencion supone aproximadamente 1,6 GB adicionales en fp16, segun la estimacion derivada de la configuracion publica de Gemma 2 2B.
- GPU recomendadas: cabe holgadamente en GPU de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 para inferencia en bf16 con contexto completo y en cuantizaciones reducidas; para entrenamiento o evaluacion a gran escala se documenta el uso de 8 GPU H200, y un A100 o H100 resulta sobredimensionado para la inferencia de un modelo de este tamano.
- Despliegue: PEFT con transformers es la via indicada por el autor; vLLM 0.17.1 con soporte de LoRA es la configuracion empleada en la evaluacion; TGI admite adaptadores LoRA; para llama.cpp u Ollama seria necesario fusionar previamente el adaptador con el modelo base y convertir el resultado a GGUF, ya que llama.cpp no carga adaptadores PEFT de forma nativa.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El autor indica explicitamente que no se evaluo ninguna linea base, ni el alumno sin entrenar ni el profesor, por lo que no es posible establecer una comparacion cuantitativa ni siquiera con `google/gemma-2-2b-it` o `google/gemma-2-9b-it`.

| Modelo | Parametros | Contexto | Relacion con este artefacto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Savoxism/amid-kd-8xh200-gemma2-2b-it-amid | adaptador LoRA sobre base de 2,6B | 8192 en el modelo base | objeto de la ficha | gemma | tabla de benchmarks propia |
| google/gemma-2-2b-it | 2,6B (aproximado, segun documentacion publica) | 8192 | modelo base del adaptador | gemma | no evaluado por el autor |
| google/gemma-2-9b-it | 9B (aproximado, segun documentacion publica) | 8192 | modelo profesor de la destilacion | gemma | no evaluado por el autor |

## Limitaciones y advertencias

- Ausencia de linea base: no se evaluo ni el alumno sin entrenar ni el profesor, de modo que no puede afirmarse que este adaptador mejore, iguale o empeore a `google/gemma-2-2b-it`.
- Semilla unica: todo el entrenamiento se ejecuto con la semilla 10, sin repeticiones, lo que impide estimar la varianza de los resultados.
- Checkpoint no seleccionado: el modelo publicado es el paso final (2492, fin de la epoca 2), no el mejor checkpoint segun el conjunto de desarrollo. La rougeL cayo de 1,41 al final de la primera epoca a 0,66 al final de la segunda, mientras que avg_loss permanecio en 2,781, lo que sugiere que el checkpoint final no es necesariamente el mejor.
- Fuga en el conjunto de desarrollo: los 200 registros de desarrollo proceden de los propios datos de entrenamiento, por lo que miden ajuste y no capacidad de generalizacion. Los valores de rougeL (0,55-1,41 en escala porcentual) y el exact_match de 0,0 son indicativos de un ajuste pobre incluso sobre datos vistos.
- MBPP invalido: el pass@1 de 0,0 no es un resultado del modelo. En 499 de 500 programas generados aparece el caracter SentencePiece `▁` (U+2581) en lugar de espacios de indentacion, por lo que ninguno puede ejecutarse. Es un artefacto del pipeline vLLM mas LoRA.
- Formato de respuesta: las metricas strict-match de GSM8K y GSM-Plus infravaloran al modelo porque las respuestas no incluyen el marcador `#### <n>`. Debe usarse flexible-extract para interpretar estas cifras.
- Riesgo de alucinacion: no cuantificado. No se publican evaluaciones de veracidad, factualidad ni tasas de alucinacion, algo especialmente relevante en un modelo de 2B destilado.
- Sesgos: no se publica ningun analisis de sesgos, ni de genero, ni de raza, ni de idioma. El dataset UltraInteract-Infer no se describe en cuanto a su composicion demografica o tematica.
- Limitacion idiomatica: la model card no declara idiomas soportados. El modelo base Gemma 2 esta orientado principalmente al ingles, por lo que el rendimiento en castellano no esta garantizado ni medido.
- Licencia: el adaptador hereda los Gemma Terms of Use del modelo base. Cualquier uso comercial queda sujeto a dichos terminos, incluida la obligacion de aceptar y cumplir las condiciones de Google para Gemma.
- Madurez del artefacto: cero descargas y cero likes, creado y actualizado con ocho segundos de diferencia, sin versionado posterior. No hay evidencia de uso en produccion ni de validacion por terceros.
- Recomendacion: no emplear este adaptador en produccion sin antes ejecutar una evaluacion propia contra el modelo base sin adaptar sobre el caso de uso concreto, y sin revisar el cumplimiento de los Gemma Terms of Use.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Savoxism/amid-kd-8xh200-gemma2-2b-it-amid
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Modelo profesor: https://huggingface.co/google/gemma-2-9b-it
- Dataset de destilacion: VoCuc/UltraInteract-Infer (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- Paper o publicacion del metodo AMiD: no disponible
- Repositorio de codigo del metodo AMiD: no disponible
- Demos o espacios asociados: no disponible
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las busquedas devolvieron exclusivamente contenido para adultos ajeno al modelo, que no se incluye en esta ficha.
