# manvadariya1/deshdraft-context-spelling-small-001

## Resumen

DeshDraft contextual spelling small 001 es un modelo de correccion ortografica de tipo secuencia-a-secuencia, afinado por un usuario (manvadariya1) a partir de `google/byt5-small`. No es un modelo generativo de texto al uso: no completa frases ni mantiene conversaciones, sino que recibe una instruccion con prefijo (`correct spelling: `) seguida de una oracion de hasta 320 bytes UTF-8 y devuelve la misma oracion con los errores de caracter y espaciado corregidos. Su proposito es servir como capa de revision ortografica contextual en aplicaciones de escritorio.

El modelo se apoya en la arquitectura ByT5, un transformer encoder-decoder que opera directamente sobre bytes en lugar de tokens subword, lo que le permite manejar errores tipograficos, caracteres extranos y espaciados anomalos sin depender de un vocabulario fijo. Con 299.637.760 parametros, hereda el tamano de byt5-small y se distribuye bajo licencia Apache-2.0 en safetensors y ONNX.

Su relevancia es acotada y de caracter experimental: el autor lo presenta explicitamente como material de investigacion, no como garantia de calidad de autocorreccion publicable. Los resultados reportados provienen de un conjunto de 200 casos sinteticos y publicos, no de una evaluacion independiente, y el propio autor advierte que las sugerencias sin umbral pueden ser erroneas incluso sobre texto ya correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder byte-level (ByT5) |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 320 bytes UTF-8 de entrada (limite indicado en la model card) |
| Tipos de cuantizacion | FP32 (ONNX); INT8 evaluado pero no distribuido |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `google/byt5-small` (revision `68377bdc18a2ffec8a0533fef03b1c513a4dd49d`), un transformer encoder-decoder que tokeniza a nivel de byte. Esta eleccion evita el vocabulario subword y permite tratar directamente caracteres y espaciado, lo que encaja con la tarea de correccion de errores tipograficos. El repositorio contiene los pesos fusionados en safetensors y la configuracion del tokenizador de bytes, sin codigo Python adicional ni estado de entrenamiento en pickle; se recomienda cargarlo con `trust_remote_code=False` y `use_safetensors=True`.

El entrenamiento utilizo el snapshot publico CC0 de Tatoeba en ingles, con divisiones por familia de origen antes de aplicar corrupcion sintetica, mas ejemplos de copia limpia (clean-copy) para preservar texto ya correcto. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO. La capa opcional de teclado y ngramas empleada en la integracion de escritorio utiliza el vocabulario de WordNet, cuya licencia debe conservarse al distribuir artefactos derivados del diccionario. El modelo incluye ademas un runtime ONNX (`runtime/context-ranker-fp32.onnx`) que comparte el codificador de contexto entre hasta cuatro candidatos, incluido el texto sin cambios; es un puntuador de candidatos en CPU, no un generador autorregresivo.

## Capacidades

- Correccion ortografica contextual: corrige errores de caracter y de espaciado preservando la redaccion original.
- Preservacion de texto limpio: entrenado con ejemplos de copia para no alterar oraciones ya correctas.
- Puntuacion de candidatos: el runtime ONNX compara hasta cuatro candidatos, incluida la opcion de no cambiar nada.
- Procesamiento a nivel de byte: maneja caracteres y espaciados anomalos sin depender de un vocabulario subword.
- Integracion local: inferencia sin servicios alojados de pago.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No es un modelo de completado de palabras o frases; el autor lo separa explicitamente de esa funcion.

## Casos de uso

- Revision ortografica en editores de escritorio: integrado como capa opcional que recibe la oracion en curso (maximo 320 bytes) y devuelve una version corregida, con comprobaciones de campo obsoleto y cancelacion para no aplicar sugerencias tardias.
- Corrector en aplicaciones de mensajeria local: el modelo procesa cada parrafo antes del envio, con inferencia exclusivamente local y sin enviar texto a servidores externos.
- Puntuador de candidatos en interfaces de teclado: el runtime ONNX compara la sugerencia del modelo con el texto original y con alternativas de un motor de ngramas, aplicando solo la que supera un margen conservador.
- Filtrado de errores tipograficos en pipelines de datos: limpieza de corpus en ingles con errores de espaciado o caracteres antes de indexarlos o entrenar otros modelos.
- Preprocesado para sistemas de traduccion o busqueda: normalizacion ortografica de consultas de usuario en ingles antes de pasarlas a un motor posterior.
- Evaluacion de investigacion en correccion ortografica: banco de pruebas reproducible para comparar politicas de umbral (neural sola frente a teclado mas neural) sobre conjuntos sinteticos.
- Prototipado de correctores multilingues: al ser byte-level, sirve como punto de partida para experimentar con otros alfabetos, aunque el modelo solo fue entrenado en ingles.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 200 casos de prueba publicos/sinteticos (100 limpios y 100 con ruido). No son estimaciones de precision sobre poblacion independiente ni evidencia de superioridad frente a productos comerciales.

| Politica | Oraciones con ruido corregidas exactamente | Oraciones limpias preservadas |
|---|---:|---:|
| Neural con guardas | 49 / 100 | 100 / 100 |
| Teclado + neural con guardas | 59 / 100 | 99 / 100 |

Metricas adicionales reportadas: precision de edicion de la politica neural con guardas de aproximadamente 0,868 y F0.5 de aproximadamente 0,760. La latencia mediana de evaluacion neural en T4 es de unos 960 ms y el p95 de unos 3.544 ms; no son tiempos de CPU de portatil ni de Windows.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para pesos (300 M de parametros), mas memoria de activaciones; en la practica, entre 2 y 4 GB segun longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor reporta mediciones en NVIDIA T4.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 o superiores; tambien es viable en CPU, aunque con mayor latencia.
- Opciones de despliegue: Transformers con safetensors (`trust_remote_code=False`, `use_safetensors=True`), ONNX Runtime para el puntuador de candidatos en FP32. No se documenta soporte verificado de vLLM, llama.cpp, Ollama o TGI.
- Latencia: mediana de aproximadamente 960 ms y p95 de aproximadamente 3.544 ms en T4 para la evaluacion neural; no hay datos de throughput.
- Cuantizacion: INT8 altero la preferencia de candidatos en las comprobaciones iniciales y no se distribuye; cualquier artefacto INT8 requeriria validacion propia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeshDraft context spelling small 001 | 299,6 M | 320 bytes UTF-8 | Correccion ortografica contextual | Apache-2.0 | HuggingFace (29 descargas) |
| google/byt5-small | 299,6 M | no disponible | Seq2seq byte-level generico | Apache-2.0 | HuggingFace |
| google/t5-small | 60,5 M | 512 tokens | Seq2seq subword generico | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos frente a correctores especializados de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor no lo presenta como garantia de calidad de autocorreccion publicable.
- Las sugerencias sin umbral pueden ser erroneas, incluso sobre texto ya correcto; no debe aplicarse automaticamente toda la salida generada.
- Los resultados reportados proceden de 200 casos sinteticos y publicos, no de una evaluacion independiente de poblacion.
- Solo soporta ingles; no hay evidencia de funcionamiento en otros idiomas pese a la tokenizacion por bytes.
- Limite de entrada de 320 bytes UTF-8, lo que restringe el contexto a una o pocas oraciones.
- La preservacion de la redaccion y la intencion del usuario no estan garantizadas.
- La cuantizacion INT8 no esta validada: los umbrales del modelo original no certifican un conjunto de candidatos distinto ni un modelo cuantizado.
- Las latencias reportadas corresponden a T4 y no a CPU de portatil ni a Windows.
- La capa opcional de teclado y ngramas usa vocabulario de WordNet; su licencia debe conservarse al redistribuir artefactos derivados.
- Licencia Apache-2.0: permite uso comercial, pero sin garantias implicitas y con obligacion de conservar avisos de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manvadariya1/deshdraft-context-spelling-small-001
- Modelo base: https://huggingface.co/google/byt5-small
- Paper de ByT5: https://arxiv.org/abs/2105.13626
- Dataset Tatoeba: https://tatoeba.org/
- WordNet: https://wordnet.princeton.edu/
