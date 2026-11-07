# moviestation/Huihui-Qwen3.5-4B-abliterated-MNN

## Resumen

`moviestation/Huihui-Qwen3.5-4B-abliterated-MNN` es una conversión de formato del modelo `huihui-ai/Huihui-Qwen3.5-4B-abliterated`, que a su vez deriva de Qwen3.5-4B. No se trata de un modelo entrenado de forma independiente: el autor declara explícitamente que el repositorio contiene una exportación a MNN, el motor de inferencia de Alibaba para dispositivos móviles, con pesos de texto cuantizados a 4 bits (tamaño de bloque 64) y pesos visuales a 8 bits. El objetivo es habilitar la ejecución local en Android dentro de la aplicación RH Studio.

El modelo base es multimodal (pipeline `image-text-to-text`) y la variante "abliterated" de huihui-ai implica que se han eliminado o atenuado las direcciones de rechazo en el espacio de activaciones, lo que reduce las negativas del modelo ante peticiones sensibles. El repositorio ocupa 2,7 GB y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es acotada: la model card no aporta datos de arquitectura, entrenamiento, benchmarks ni idiomas, y el propio autor advierte que la conversión no garantiza compatibilidad ni calidad en dispositivo. Es un artefacto de despliegue, no una release de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.5-4B; detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible con precision; la busqueda web cita "5B parameters" para el modelo base huihui-ai y "4B parameters" para la familia Qwen3-4B; el nombre del repositorio indica 4B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MNN con pesos de texto a 4 bits (block size 64) y pesos visuales a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (exportacion para el runtime MNN; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El pipeline declarado es `image-text-to-text`, lo que implica un codificador visual acoplado a un modelo de lenguaje, coherente con la familia Qwen multimodal, pero la model card no detalla el tipo de transformer, el mecanismo de atencion ni la composicion del dataset.

Respecto al entrenamiento, el repositorio no contiene un modelo entrenado por `moviestation`: es una conversion de formato. La model card indica la revision de origen (`5581467dfd52bf338c782006a6cdce05c42594be`), el proceso de exportacion a MNN y la cuantizacion aplicada (4 bits en texto, 8 bits en vision). No se documentan tokens de entrenamiento, RLHF, DPO ni innovaciones tecnicas del modelo original. La unica transformacion relevante respecto al base es la "abliteration" heredada de huihui-ai, que modifica el comportamiento de rechazo sin reentrenamiento completo segun la practica habitual de esa familia de modelos, aunque este repositorio no lo detalla.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto de entrada (`image-text-to-text`), con pesos visuales cuantizados a 8 bits.
- Inferencia local en Android mediante el runtime MNN, pensada para la aplicacion RH Studio.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones que el modelo original alineado.
- Soporte de tool calling, agentes, modo thinking o capacidades multilingues: no disponible en la informacion proporcionada (no se confirma ni se descarta).

## Casos de uso

- Asistente local en Android: el paquete MNN esta disenado para cargarse desde la app RH Studio y ejecutar inferencia en el dispositivo sin conexion, aprovechando la cuantizacion a 4 bits para reducir el uso de memoria.
- Descripcion de imagenes en el movil: al ser un modelo `image-text-to-text`, puede recibir una foto capturada por la camara y generar una descripcion o respuesta contextual dentro de la app.
- Prototipado de asistentes multimodales sin backend: util para desarrolladores que quieran validar flujos de vision-lenguaje en un telefono antes de invertir en infraestructura de servidor.
- Evaluacion de MNN como runtime: sirve para medir latencia, consumo de memoria y calidad de salida de la cuantizacion 4/8 bits en hardware Android concreto.
- Investigacion sobre abliteration: permite estudiar en dispositivo como se comporta una variante sin rechazos en tareas de dialogo, comparandola con el modelo alineado.
- Distribucion controlada en apps: la model card exige descargar los pesos por separado y no incluirlos en el APK, lo que encaja con un esquema de descarga bajo demanda desde un CDN propio.
- Pruebas de regresion de calidad: al fijar una revision de origen concreta, se puede usar como referencia estable para comparar futuras conversiones MNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y advierte que la conversion por si sola no establece la calidad de salida ni la compatibilidad en dispositivo.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 2,7 GB; con cuantizacion de texto a 4 bits y vision a 8 bits, se puede esperar un consumo de memoria en el rango de 3 a 5 GB durante la inferencia, aunque no hay cifras oficiales.
- GPU recomendadas: no aplica en el caso de Android; el runtime objetivo es MNN sobre CPU/GPU/NPU del dispositivo movil. Para escritorio no se documenta soporte.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el formato MNN no es el habitual para estas GPUs.
- Opciones de despliegue: MNN (runtime oficial), integrado en la app RH Studio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card indica que dependen del dispositivo y que la conversion no garantiza compatibilidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| moviestation/Huihui-Qwen3.5-4B-abliterated-MNN | 4B (segun nombre) | no disponible | MNN 4/8 bits | Apache 2.0 | Conversion para Android, sin benchmarks |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | 5B (segun busqueda web) | no disponible | safetensors (presumible) | no disponible en la busqueda | Modelo base sin cuantizar, variante abliterated |
| huihui-ai/Qwen3-4B-abliterated | 4B | no disponible | Transformers | no disponible en la busqueda | Generacion de texto, no multimodal |

La comparacion es limitada: no hay datos publicos de rendimiento para ninguno de los tres en la informacion disponible, y las cifras de parametros no son consistentes entre el nombre del repositorio y la busqueda web.

## Limitaciones y advertencias

- No es un modelo entrenado: es una conversion de formato; cualquier defecto de calidad proviene del modelo base o de la cuantizacion.
- La cuantizacion a 4 bits en texto y 8 bits en vision puede degradar la calidad de salida respecto al modelo original en precision completa; no se aportan mediciones.
- El autor advierte que la conversion no garantiza compatibilidad ni rendimiento en todos los dispositivos Android.
- La variante "abliterated" reduce los rechazos del modelo, lo que incrementa el riesgo de generar contenido inapropiado, sesgado o danino; requiere filtros adicionales en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 4B, agravado por la cuantizacion.
- Idiomas soportados no documentados; no se puede asumir un buen rendimiento en castellano sin evaluacion previa.
- Restriccion de distribucion: los pesos no deben incluirse en el APK y deben descargarse por separado, segun la model card.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterated.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moviestation/Huihui-Qwen3.5-4B-abliterated-MNN
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Variante relacionada: https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
