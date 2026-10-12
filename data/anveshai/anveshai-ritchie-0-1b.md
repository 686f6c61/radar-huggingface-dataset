# AnveshAI/AnveshAI-Ritchie-0.1B

## Resumen

AnveshAI-Ritchie-0.1B es un modelo de lenguaje causal de 100,7 millones de parametros desarrollado por AnveshAI y especializado en la generacion de codigo en lenguaje C a partir de descripciones en lenguaje natural. Esta construido sobre la arquitectura LLaMA (clase `LlamaForCausalLM`) con 12 capas, tamano oculto de 768, 12 cabezas de atencion y atencion de consultas agrupadas (GQA) con 4 cabezas KV, lo que reduce el coste de memoria de la cache KV durante la inferencia. Su ventana de contexto es de 2.048 tokens y el vocabulario es de 32.768 entradas con embeddings atados.

Su relevancia radica en el segmento de ejecucion en el borde (edge computing): con unos 192 MB en disco en FP16 y sin necesidad de GPU, el modelo cabe en telefonos, tablets, Raspberry Pi y sistemas embebidos, entornos donde modelos de codigo de varios miles de millones de parametros son inviables. Está pensado como un generador de codigo C orientado a tareas, no como un asistente conversacional: emplea tokens especiales estructurados (`<|task|>`, `<|code|>`, `<|plan|>`, `<|run|>`, `<|bug|>`, `<|fix|>`) para delimitar las fases del flujo de generacion.

Se distribuye con licencia Apache 2.0, lo que permite uso comercial y modificacion sin restricciones adicionales, y esta integrado en el ecosistema HuggingFace Transformers. En el momento de redactar esta ficha no se han publicado resultados de benchmarks ni datos sobre el volumen de tokens de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (`LlamaForCausalLM`), transformer decoder-only denso con GQA |
| Parametros totales | 100.682.496 (~100,7 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible. Los pesos publicados estan en FP16; el repositorio no incluye variantes cuantizadas |
| Idiomas soportados | Ingles (`en`) y codigo fuente (etiqueta `code`); especializado en C |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano oculto | 768 |
| Tamano intermedio (FFN) | 2.048 |
| Numero de capas | 12 |
| Cabezas de atencion | 12 (4 cabezas KV, GQA) |
| Tamano de vocabulario | 32.768 |
| Precision | FP16 |
| Funcion de activacion | SiLU |
| Codificacion posicional | RoPE (theta = 10.000) |
| Embeddings atados | Si |
| Paso de entrenamiento | 3.200 |
| Eval loss | 1,383 |
| Tamano en disco | ~192 MB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaMA en su variante decoder-only con atencion causal, adaptada a un presupuesto de computo muy reducido: 12 capas, dimension oculta de 768 y capa feed-forward de 2.048 neuronas, con activacion SiLU y normalizacion asociada a la implementacion estandar de `LlamaForCausalLM` en Transformers. La atencion utiliza consultas agrupadas (12 cabezas de consulta frente a 4 cabezas de clave/valor), una decision que rebaja el uso de memoria de la cache KV y facilita el despliegue en dispositivos con RAM limitada. La codificacion posicional es RoPE con theta 10.000 y los embeddings de entrada y salida estan atados, lo que reduce el numero de parametros efectivos.

En cuanto al entrenamiento, la model card indica que se uso un corpus de codigo fuente en lenguaje C, optimizador AdamW y precision mixta FP16, con un total de 3.200 pasos y un checkpoint final seleccionado por la menor perdida de evaluacion (eval loss 1,383). No se especifica el numero de tokens procesados, la composicion exacta del dataset, ni si hubo fases de ajuste fino con RLHF, DPO o instrucciones: la propia model card aclara que no es un modelo ajustado a instrucciones, sino un modelo base de generacion de codigo. La innovacion principal no es arquitectonica sino de interfaz: el esquema de tokens especiales que estructura el ciclo tarea-codigo-planificacion-ejecucion-error-correccion.

## Capacidades

- Generacion de codigo en C a partir de descripciones en lenguaje natural, con formato de prompt `<|task|>...<|code|>`.
- Generacion de funciones y fragmentos cortos: la model card recomienda limitar la salida a 256 tokens nuevos y usar temperatura 0,4 con `repetition_penalty` de 1,15.
- Planificacion previa a la codificacion mediante el token `<|plan|>`, que permite separar el razonamiento de alto nivel de la emision de codigo.
- Manejo de errores de compilacion mediante los tokens `<|bug|>` y `<|fix|>`, orientados a identificar el fallo y emitir la correccion.
- Marcado de salida de ejecucion esperada con el token `<|run|>`.
- Comprension y generacion de texto en ingles como idioma vehicular de las instrucciones.
- Ejecucion en CPU y en dispositivos de borde, sin requisitos de GPU.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).
- No es multilingue: el unico idioma natural declarado es el ingles y el unico lenguaje de programacion objetivo es C.

## Casos de uso

- Autocompletado de C en editores ligeros: al pesar unos 192 MB en FP16, el modelo puede cargarse en memoria junto al editor en un portatil o en un contenedor pequeno, ofreciendo sugerencias de funciones C sin conexion a servicios externos.
- Generacion de esqueletos de funciones en sistemas embebidos: para tareas repetitivas como "escribir una funcion que configure un temporizador" o "implementar un buffer circular", el modelo produce un punto de partida que el desarrollador revisa y ajusta.
- Formacion y docencia de C: el flujo `<|task|>` -> `<|code|>` permite generar ejemplos a partir de enunciados de ejercicios, con el token `<|plan|>` disponible para mostrar un razonamiento previo paso a paso.
- Asistencia a la correccion en pipelines de compilacion: usando el token `<|bug|>` con el mensaje del compilador y `<|fix|>`, el modelo puede proponer parches en un bucle automatizado dentro de un sistema de integracion continua, siempre con revision humana.
- Prototipado rapido en hardware de bajos recursos: desplegado en una Raspberry Pi o en un telefono, permite generar fragmentos de C en entornos sin conectividad ni acelerador grafico.
- Generacion de codigo de ejemplo en documentacion tecnica: el modelo puede producir fragmentos de C para manuales, articulos o tutoriales donde se necesita codigo consistente y de longitud corta.
- Preprocesado o aumento de datos de codigo: al ser un generador de C puro, puede emplearse para producir variaciones de funciones con fines de experimentacion, con la advertencia de que la salida puede ser incorrecta y requiere filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara un unico registro (`AnveshAI-Ritchie-0.1B`) con la lista de resultados vacia, y no se aportan cifras de MMLU, HumanEval, MBPP, GSM8K ni de ningun otro conjunto de evaluacion. El unico dato cuantitativo de rendimiento publicado por el autor es la perdida de evaluacion del checkpoint final: 1,383 en el paso 3.200.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en FP16 (equivalente a los ~192 MB de pesos mas la cache KV de hasta 2.048 tokens). Es una estimacion aritmetica a partir del numero de parametros y la precision declarada; el autor no publica cifras oficiales de VRAM.
- Cuantizaciones estimadas segun el numero de parametros: en torno a 100 MB en int8 y 50 MB en int4 (estimacion derivada, no verificada, ya que no se publican pesos cuantizados).
- GPU recomendadas: no se requiere GPU. Cualquier GPU con al menos 1 GB de memoria (por ejemplo, GTX 1050 o superior, MX150, integradas modernas) es mas que suficiente; tambien funciona en CPU sin aceleracion.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU y en dispositivos de borde como Raspberry Pi, tablets o telefonos.
- Opciones de despliegue: HuggingFace Transformers (`AutoModelForCausalLM`), llama.cpp (la model card menciona soporte por la arquitectura LLaMA), ONNX y otros runtimes compatibles con LLaMA. No se mencionan vLLM ni TGI de forma explicita, aunque el repositorio incluye la etiqueta `text-generation-inference`.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de tokens por segundo en ninguna plataforma.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de este modelo para establecer comparaciones de rendimiento. La tabla siguiente compara unicamente caracteristicas estructurales y de disponibilidad con modelos de proposito general de tamano reducido que suelen utilizarse como alternativas; los datos de los modelos comparados provienen de sus fichas publicas y deben verificarse antes de citarse.

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| AnveshAI-Ritchie-0.1B | 100,7 M | 2.048 tokens | Apache 2.0 | Codigo en C | safetensors en HuggingFace |
| Qwen2.5-Coder-0.5B | 494 M (aprox.) | mayor que 2.048 tokens | Apache 2.0 | Codigo multilingue | safetensors en HuggingFace |
| TinyLlama-1.1B | 1.100 M (aprox.) | mayor que 2.048 tokens | Apache 2.0 | Proposito general / chat | safetensors, GGUF en HuggingFace |
| SmolLM-135M | 135 M (aprox.) | mayor que 2.048 tokens | Apache 2.0 | Proposito general | safetensors en HuggingFace |

Criterio de comparacion: Ritchie es el unico de la lista disenado explicitamente como generador de C con tokens de tarea; los otros son modelos de proposito general con soporte de codigo mas amplio, pero tambien mayor huella de memoria. No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- A escala de 100 millones de parametros, la model card advierte explicitamente de que cabe esperar salidas imperfectas en tareas complejas.
- El modelo solo esta entrenado para C: no debe utilizarse para generar otros lenguajes de programacion ni texto general.
- Puede producir salidas repetitivas; el autor recomienda `repetition_penalty=1.15` para mitigarlo.
- No esta ajustado a instrucciones: es un modelo base de generacion de codigo, no un asistente conversacional, y no mantiene dialogos multi-turno.
- El seguimiento de la tarea esta limitado por el tamano del modelo, por lo que puede ignorar partes de la instruccion.
- Riesgo de alucinacion de codigo: la model card no incluye evaluacion de correccion funcional ni verifica que el codigo generado compile o sea semanticamente correcto. Todo codigo producido debe compilarse y revisarse antes de usarse en produccion.
- Ventana de contexto reducida a 2.048 tokens, insuficiente para ficheros completos o repositorios de tamano medio.
- Cobertura idiomatica limitada: solo ingles como idioma natural; no se ha declarado soporte de castellano.
- Sesgos conocidos: no se documentan evaluaciones de sesgo, toxicidad o seguridad en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con la obligacion de conservar el aviso de licencia y de copyright y de indicar los cambios realizados.
- Advertencia para produccion: el modelo es un prototipo de investigacion con 0 descargas declaradas y sin benchmarks publicos; no hay evidencia publicada de robustez en escenarios reales.
- Los datos de fecha del repositorio (creado el 12 de octubre de 2026 y actualizado ese mismo dia) provienen de los metadatos de HuggingFace y no pueden verificarse de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnveshAI/AnveshAI-Ritchie-0.1B
- Organizacion AnveshAI en HuggingFace: https://huggingface.co/AnveshAI
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Referencia biografica de Dennis Ritchie, que da nombre al modelo: https://en.wikipedia.org/wiki/Dennis_Ritchie
- Paper tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo publica: no disponible
