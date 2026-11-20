# efe-T/WeightSeek-Format22-0.8B

## Resumen

WeightSeek Format22 0.8B es un modelo de generacion de texto en FP16 derivado de Qwen3.5-0.8B mediante tecnicas de programacion en el espacio de pesos (weight-space programming). Lo publica el usuario efe-T en Hugging Face con licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una edicion quirurgica de los pesos de un checkpoint intermedio (RikiyaT/Qwen3.5-0.8B-weight-space-programming) al que se le aplican modificaciones puntuales para mejorar el cumplimiento de instrucciones de formato, en concreto la devolucion de objetos JSON directamente parseables.

El modelo tiene 752.393.024 parametros (unos 0,8 mil millones) empaquetados en un unico archivo safetensors de 1,50 GB. La arquitectura subyacente es la de Qwen3.5, un transformer denso con atencion eager, y el modelo se distribuye junto con su tokenizer y plantilla de chat. La innovacion principal no esta en el entrenamiento sino en la intervencion sobre los pesos: se anade una actualizacion de rango dos a la matriz de salida del MLP de la capa 22, con dos direcciones que favorecen una llave de apertura frente a un bloque Markdown y una barra vertical frente a una coma.

Su relevancia es acotada pero interesante para investigadores: demuestra que pequenas ediciones en el espacio de pesos pueden corregir comportamientos de formato sin reentrenamiento completo. En la evaluacion publicada, Format22 devuelve el objeto JSON solicitado en 8 de 15 prompts ingleses, frente a 0 de sus dos antecesores inmediatos, aunque con regresiones en otras tareas y sin mejoras en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), atencion eager |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (limitada por `max_position_embeddings` del config de Qwen3.5-0.8B, valor no publicado en la informacion) |
| Tipos de cuantizacion | no disponible (el release se distribuye en FP16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (la evaluacion solo cubre ingles y turco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16, archivo unico de 1,50 GB) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint editado por Rikiya Takehi y colaboradores sobre Qwen3.5-0.8B, un transformer denso de aproximadamente 0,8 mil millones de parametros. Sobre esa base, el release incorpora las 13 sustituciones de filas de embedding ligadas de WT4 y un cambio en la cabeza de atencion 7 de la capa 7. Format22 anade despues una actualizacion de rango dos a la matriz de salida del MLP de la capa 22: una direccion favorece una llave de apertura (`{`) frente a una valla Markdown, y la otra favorece una barra vertical (`|`) frente a una coma.

No hay entrenamiento supervisado clasico ni RLHF/DPO. La edicion usa un ajuste supervisado en forma cerrada sobre vectores de activacion extraidos de prompts de ejemplo, es decir, se calculan las direcciones en el espacio de activaciones que producen el comportamiento deseado y se trasladan al espacio de pesos. El modelo resultante emplea decodificacion ordinaria (greedy, sin muestreo) y una plantilla de chat con el modo "thinking" desactivado. No se documentan el volumen de tokens de entrenamiento ni la composicion del dataset original de Qwen3.5-0.8B en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en formato chat multi-turno mediante la plantilla de Qwen3.5.
- Cumplimiento de instrucciones de formato estructurado: devolucion de objetos JSON parseables directamente (mejora principal del release).
- Respeto de vallas de codigo Markdown cuando se solicitan explicitamente (15/15 en la evaluacion).
- Conversiones basicas de formato: listas separadas por comas (12/15) y conversion a mayusculas (8/15).
- Extraccion de un valor de campo solicitado de forma aislada (6/15).
- Soporte de modo "thinking" desactivable via `enable_thinking=False` en la plantilla de chat.
- Capacidades multilingues: no verificadas; la evaluacion muestra 0/5 en prompts JSON en turco.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Experimentacion en investigacion sobre edicion de pesos: el modelo sirve como banco de pruebas reproducible para estudiar como una actualizacion de rango bajo en una capa concreta altera el comportamiento de formato, comparando contra WT4 y el checkpoint padre con los mismos 105 prompts publicados.
- Generacion de configuraciones JSON en pipelines internos: para prompts en ingles con una unica clave y valor simple, el modelo devuelve un objeto parseable en algo mas de la mitad de los casos; util en entornos donde se valida y reintenta la salida.
- Prototipado de asistentes conversacionales ligeros: con 0,8 B de parametros y FP16 en 1,5 GB, cabe en GPUs de consumo y permite iterar rapidamente en demos de chat con contexto corto.
- Evaluacion de tecnicas de formateo estructurado: util como linea base para medir la eficacia de tecnicas alternativas (grammar-constrained decoding, fine-tuning con LoRA, prompts con esquemas) frente a la edicion de pesos.
- Docencia y divulgacion: ejemplo didactico de como se inspeccionan activaciones y se traducen a modificaciones de pesos en un modelo abierto y de tamano manejable.
- Generacion de fragmentos de codigo delimitados por vallas Markdown: el modelo respeta de forma fiable (15/15) la peticion explicita de bloques cercados, adecuado para tareas de documentacion tecnica donde se exige ese formato.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 105 prompts (15 por tarea), comparando WT4, el checkpoint padre (Layer-7 parent) y Format22. Se cuenta como correcta la respuesta completa que coincide tras recortar espacios (o que parsea como el diccionario solicitado en el caso JSON):

| Tarea (15 prompts cada una) | WT4 | Layer-7 parent | Format22 |
|---|---:|---:|---:|
| Objeto JSON plano | 0 | 0 | **8** |
| Lista invertida con barras verticales | 0 | 0 | **1** |
| Valor de campo solicitado aislado | 5 | 6 | 6 |
| JSON cercado solicitado explicitamente | 15 | 15 | 15 |
| Lista separada por comas | 10 | 13 | 12 |
| Conversion a mayusculas | 10 | 8 | 8 |
| Sustitucion de valor en etiqueta | 0 | 0 | 0 |
| **Total** | **40** | **42** | **50** |

Datos adicionales reportados: en una evaluacion separada de 62 prompts, Format22 y su padre inmediato obtienen 42/62, por debajo de WT4 con 46/62. En 192 presentaciones de opcion multiple, Format22 y su padre obtienen 87/192 frente a 75/192 de WT4. En prompts JSON en turco, todos los modelos puntuan 0/5. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,5 GB para los pesos mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor verifico la carga en una Colab T4.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien en GPUs integradas con suficiente memoria compartida, aunque con mayor latencia.
- Opciones de despliegue: Transformers (version 5.22.1 segun el autor) con PyTorch y Accelerate, atencion eager y `device_map="cuda"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeightSeek Format22 0.8B | 752 M | no disponible | Apache 2.0 | safetensors FP16 | 50/105 en la suite del autor; 8/15 en JSON plano |
| WeightSeek-WT4 (antecesor) | no disponible (misma base) | no disponible | Apache 2.0 | safetensors | 40/105 en la suite; 0/15 en JSON plano; 46/62 en la suite de 62 prompts |
| Qwen3.5-0.8B weight-space-programming (padre) | no disponible (misma base) | no disponible | Apache 2.0 | safetensors | 42/105 en la suite; 0/15 en JSON plano; 42/62 en la suite de 62 prompts |
| Qwen3.5-0.8B (base original) | ~0,8 B | no disponible | Apache 2.0 (heredada) | safetensors | Modelo base sin ediciones; no evaluado en la suite del autor |

No se dispone de comparaciones con modelos de otros linajes en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy limitado en formato JSON: solo 8 de 15 prompts en ingles producen un objeto parseable; el resto falla o envuelve la respuesta. Es imprescindible parsear y validar la salida antes de usarla en produccion.
- Regresiones respecto al padre: pierde una respuesta correcta en la tarea de listas separadas por comas (elimina las comas en un caso) y baja de 13 a 12 en esa tarea.
- Sin mejoras en turco: 0/5 en prompts JSON en turco, igual que sus antecesores.
- Peor rendimiento que WT4 en la suite de 62 prompts (42/62 frente a 46/62), lo que sugiere que la mejora es especifica de formato y no general.
- La suite de 105 prompts se uso para seleccionar el candidato a publicar, por lo que los resultados pueden estar sesgados hacia esas plantillas concretas; las muestras son pequenas (15 por tarea).
- Riesgo de alucinacion y de formato incorrecto en prompts fuera de distribucion: el modelo no ha sido entrenado con RLHF ni con datos de preferencias, y no se documentan sesgos especificos.
- Idiomas soportados no documentados; el uso fuera de ingles no esta validado.
- Longitud de contexto no publicada en la informacion; el ejemplo del autor limita la generacion a `max_position_embeddings` del config.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribucion a Qwen, a Rikiya Takehi y colaboradores y a efe-T segun LICENSE y NOTICE.
- Modelo de investigacion: no hay garantias de robustez, seguridad ni calidad para despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efe-T/WeightSeek-Format22-0.8B
- Checkpoint upstream (RikiyaT/Qwen3.5-0.8B-weight-space-programming): https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming/tree/d1671a178705bcab7644806d23c535517f35723b
- Release WT4: https://huggingface.co/efe-T/WeightSeek-WT4/tree/005427a78998cf293ffd54ac8e4da16bc089f00a
- Estudio original de weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
- Prompts y salidas de evaluacion (referenciado en la model card): `evaluation/paired-format-105.jsonl` dentro del repositorio
- Versiones y checksums (referenciado en la model card): `release.json` dentro del repositorio
- Licencia (referenciado en la model card): `LICENSE` dentro del repositorio
- Atribuciones (referenciado en la model card): `NOTICE` dentro del repositorio
