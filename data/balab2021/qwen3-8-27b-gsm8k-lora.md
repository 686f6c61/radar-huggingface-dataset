# Balab2021/qwen3.8-27b-gsm8k-lora

## Resumen

Balab2021/qwen3.8-27b-gsm8k-lora es un adaptador LoRA (biblioteca PEFT) entrenado sobre el modelo base Qwen/Qwen3.8-27B para resolver problemas verbales de matematicas de nivel escolar. El autor lo publica bajo licencia Apache 2.0 y lo ha afinado exclusivamente con el dataset openai/gsm8k mediante QLoRA. No es un modelo autonomo: requiere cargar el checkpoint base de 27B y superponer el adaptador, por lo que su huella en disco es de solo 1,3 GB.

La relevancia de esta ficha es doble. Por un lado, muestra el patron habitual de especializacion barata: un adaptador de rango 32 sobre un modelo grande mejora el exact match en GSM8K del 84,0 % al 94,0 % en la muestra de evaluacion reportada por el autor (235/250 frente a 210/250). Por otro, documenta la arquitectura subyacente del base, que combina capas de atencion completa con proyecciones Gated DeltaNet (atencion lineal) y que, segun los modulos congelados descritos, incorpora un torre de vision y una cabeza de prediccion multi-token (MTP).

El adaptador solo ha visto datos en ingles y fue entrenado con una longitud maxima de secuencia de 1024 tokens, ademas de usar los razonamientos de GSM8K como contenido visible (no-thinking). Cualquier uso que dependa del modo thinking del modelo base debe evaluarse por separado. El repositorio no registra descargas ni valoraciones en la fecha de actualizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.8-27B; el base combina capas de atencion completa y proyecciones Gated DeltaNet (arquitectura etiquetada como `qwen3_5`), con torre de vision y cabeza MTP |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina "27B" pero el numero exacto de parametros no se confirma en la informacion disponible |
| Parametros activos | No disponible (no se confirma que el modelo base sea MoE) |
| Longitud de contexto | Entrenamiento a 1024 tokens maximo; la ventana nativa del modelo base no esta indicada en la informacion disponible |
| Tipos de cuantizacion | Adaptador publicado en safetensors (precision de entrenamiento bf16); cuantizaciones del base (4-bit NF4, int8, GGUF) no documentadas en la ficha del adaptador |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

Parametros adicionales del adaptador:

| Parametro | Valor |
|---|---|
| Libreria | peft |
| Metodo de ajuste | QLoRA |
| Rango LoRA / alpha | 32 / 64 |
| Modulos adaptados | Atencion `q, k, v, o` en las capas de atencion completa; FFN `gate, up, down` en las 64 capas |
| Modulos congelados | Proyecciones Gated DeltaNet; torre de vision; cabeza MTP |
| Precision de entrenamiento | bf16 (fp16 produce gradientes NaN en los bloques Gated DeltaNet) |
| Tamano del repositorio | 1,3 GB |
| Pipeline | text-generation |
| Requisitos | `transformers>=5.2.0` y `flash-linear-attention` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un modelo cuya configuracion, segun los modulos que el autor menciona, consta de 64 capas e incluye dos tipos de mecanismo de secuencia: capas de atencion completa, donde se adaptan las proyecciones de query, key, value y output, y capas con proyecciones Gated DeltaNet, que quedan congeladas. Ademas, el checkpoint base incorpora una torre de vision y una cabeza de prediccion multi-token (MTP), ambas congeladas y heredadas sin cambios. La carga se realiza con `AutoModelForImageTextToText`, lo que confirma que el base es un modelo multimodal de imagen y texto. Requiere `transformers>=5.2.0` y la libreria `flash-linear-attention` para la arquitectura etiquetada como `qwen3_5`.

El entrenamiento es un QLoRA con rango 32 y alpha 64, adaptando atencion y FFN, sobre el dataset openai/gsm8k. Los datos de entrenamiento son los razonamientos de GSM8K presentados como contenido visible (es decir, sin la traza de "thinking"), con una longitud maxima de secuencia de 1024 tokens. Se ejecuto en un nodo con 8 GPU sobre la particion Slurm `batch-xdr`, en precision bf16; el autor advierte de que fp16 genera gradientes NaN en los bloques Gated DeltaNet. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset mas alla de GSM8K, ni si hubo etapas de RLHF o DPO. Los scripts de reproduccion se encuentran en `cluster-activities/qwen38-gsm8k-sft` dentro del repositorio fuente del autor, cuya URL no se proporciona.

## Capacidades

- Resolucion de problemas verbales de matematicas de nivel escolar (grade-school math word problems), la tarea objetivo del ajuste.
- Generacion de texto conversacional, heredada del modelo base multimodal.
- Razonamiento aritmetico paso a paso, aprendido a partir de los razonamientos de GSM8K en formato visible.
- Capacidad multimodal de imagen y texto en el modelo base (torre de vision y `AutoModelForImageTextToText`), si bien la torre quedo congelada durante el ajuste y no se entreno con datos de vision.
- Prediccion multi-token a traves de la cabeza MTP del base, tambien congelada y sin datos de ajuste especificos.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste se limita a contexto de 1024 tokens, lo que limita cadenas largas.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking: los datos de entrenamiento son contenido no-thinking; el comportamiento en modo thinking debe evaluarse por separado, segun el propio autor.

## Casos de uso

- Evaluacion de investigacion en GSM8K: el adaptador sirve como referencia reproducible de cuanto aporta un QLoRA de rango 32 sobre 27B de parametros en esta tarea, con una comparacion directa contra el base (84,0 % frente a 94,0 % de exact match en 250 ejemplos).
- Tutoria matematica en ingles para nivel primaria y secundaria: el modelo genera cadenas de razonamiento paso a paso sobre enunciados verbales, adecuado para entornos educativos en los que se quiera mostrar el procedimiento, no solo la respuesta.
- Generacion de problemas resueltos para aumentar datasets: se puede usar para producir pares pregunta-respuesta con traza de razonamiento en ingles, que despues se filtren y se usen como material de entrenamiento adicional.
- Verificacion de soluciones aritmeticas: dado un enunciado y una respuesta propuesta, el modelo puede recomputar el resultado y detectar discrepancias, util como componente de un pipeline de control de calidad.
- Base para ajustes posteriores en matematicas: al ser un adaptador PEFT de 1,3 GB, se puede servir como punto de partida para LoRAs adicionales en dominios proximos (aritmetica, algebra elemental) sin repetir el coste de entrenar el modelo completo.
- Demostracion de despliegue eficiente de especializaciones: permite comparar en produccion el coste de servir un adaptador sobre un base multimillonario frente a servir un modelo especializado independiente, midiendo latencia y VRAM.
- Evaluacion de robustez frente a razonamiento largo: al estar entrenado a 1024 tokens, sirve para medir la degradacion al superar esa longitud, un caso de prueba util antes de adoptar el base para tareas de contexto largo.

## Benchmarks y rendimiento

| Modelo | GSM8K exact match |
|---|---|
| Qwen3.8-27B (base) | 84,0 % (210/250) |
| Balab2021/qwen3.8-27b-gsm8k-lora | 94,0 % (235/250) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, MATH, etc.) en la informacion disponible. La evaluacion reportada corresponde a 250 ejemplos y no se especifica el procedimiento de muestreo ni la configuracion de decodificacion.

## Requisitos de hardware

- VRAM del adaptador: 1,3 GB en disco; en memoria, el adaptador anadido a un base en bf16 supone un incremento marginal respecto al modelo completo.
- Inferencia del base en bf16: estimacion de 54 GB solo en pesos para un modelo de 27B parametros, mas activaciones y cache KV; en la practica se recomienda un nodo con GPU de 80 GB. La ficha no confirma el numero exacto de parametros, por lo que la cifra es una estimacion derivada del nombre del modelo.
- Inferencia del base en 8 bits: entorno a 27 GB de pesos, mas overhead.
- Inferencia del base en 4 bits (NF4/GPTQ/AWQ): entorno a 14-16 GB de pesos, lo que permitiria encajar en GPU de consumo como RTX 4090 o RTX 3090 de 24 GB, siempre que la implementacion soporte la arquitectura del base.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; GPU de 24 GB para cuantizacion de 4 bits. Para el entrenamiento documentado se uso un nodo con 8 GPU (modelo no especificado).
- Si cabe en GPU de consumo: no documentado en la informacion disponible; depende de la cuantizacion elegida y de si el motor de inferencia soporta las capas Gated DeltaNet.
- Opciones de despliegue: la unica ruta documentada es Transformers (`transformers>=5.2.0`) con `flash-linear-attention` y PEFT, cargando el base y el adaptador por separado. El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en los resultados de busqueda proporcionados, que no contienen referencias tecnicas relevantes. La unica comparacion verificable es contra el propio modelo base:

| Modelo | Parametros | Contexto de entrenamiento del ajuste | GSM8K exact match | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B (segun denominacion) | No aplica | 84,0 % (210/250) | No indicada en la informacion disponible | No indicado |
| Balab2021/qwen3.8-27b-gsm8k-lora | Adaptador sobre base de 27B | 1024 tokens | 94,0 % (235/250) | Apache 2.0 | safetensors (PEFT) |

No disponible la comparacion con otros adaptadores de matematicas, modelos especializados en GSM8K o alternativas de tamano similar.

## Limitaciones y advertencias

- No es un modelo autonomo: necesita el checkpoint Qwen/Qwen3.8-27B, con su propio consumo de VRAM y su propia licencia, que no se detalla en la informacion proporcionada.
- Especializacion estrecha: el ajuste se limita a GSM8K, por lo que la mejora en otros dominios matematicos o de razonamiento no esta medida.
- Contexto de entrenamiento corto (1024 tokens): los problemas o conversaciones que superen esa longitud pueden degradar el rendimiento, ya que no se entreno mas alla de ese limite.
- Solo ingles: no hay datos de entrenamiento ni evaluacion en castellano u otros idiomas.
- Datos de entrenamiento como contenido no-thinking: si se depende del modo thinking del base, el comportamiento no esta garantizado y el autor recomienda evaluarlo aparte.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir cadenas de razonamiento plausibles con resultados incorrectos, especialmente fuera de la distribucion de GSM8K.
- Evaluacion limitada: los resultados se basan en 250 ejemplos; no se documentan intervalos de confianza, semilla ni configuracion de decodificacion, por lo que la mejora de 10 puntos porcentuales debe tomarse con cautela.
- Precisión de entrenamiento sensible: fp16 provoca gradientes NaN en los bloques Gated DeltaNet, por lo que cualquier reintento de entrenamiento debe usar bf16.
- Componentes congelados sin ajustar: la torre de vision y la cabeza MTP se heredan del base y no se han entrenado con datos especificos, por lo que su comportamiento en tareas de vision o prediccion multi-token no esta validado.
- Trazabilidad baja: cero descargas y cero valoraciones en el repositorio, y los scripts de reproduccion se referencian sin URL publica, lo que dificulta la verificacion independiente.
- Dependencias estrictas: requiere `transformers>=5.2.0` y `flash-linear-attention`, lo que puede limitar el uso en entornos con versiones fijas o motores de inferencia que no soporten la arquitectura `qwen3_5`.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial queda tambien sujeto a los terminos del modelo base, no verificados aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Balab2021/qwen3.8-27b-gsm8k-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Scripts de reproduccion: `cluster-activities/qwen38-gsm8k-sft` en el repositorio fuente del autor (URL no disponible en la informacion proporcionada)
- Resultados de busqueda web: no se encontraron enlaces relevantes; las busquedas devolvieron repositorios de jailbreak, subredes de Reddit y foros sin relacion con este modelo.
