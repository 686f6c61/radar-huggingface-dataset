# McG-221/Boulesis-26B-A4B-oQ8e-fp16

## Resumen

Boulesis-26B-A4B-oQ8e-fp16 es un checkpoint publicado en Hugging Face por el usuario McG-221 bajo el identificador `McG-221/Boulesis-26B-A4B-oQ8e-fp16`. Por la nomenclatura del nombre y las etiquetas del repositorio, se trata de una variante cuantizada en 8 bits (tag `8-bit`) de un modelo de la familia Gemma 4 (tag `gemma4`), con un total declarado de 26B parametros y 4B parametros activos, lo que sugiere una arquitectura de mezcla de expertos (MoE) con enrutamiento disperso. El sufijo `oQ8e-fp16` apunta a una cuantizacion de pesos a 8 bits con componentes auxiliares en fp16, presumiblemente generada con alguna herramienta de cuantizacion tipo GPTQ/AWQ o similar.

El repositorio es extremadamente reciente (creado y actualizado el 25 de noviembre de 2026), no acumula descargas y solo tiene un like, por lo que se trata de una publicacion de autor individual sin documentacion publica asociada en la informacion disponible. No se ha publicado model card con detalles de entrenamiento, dataset, licencia ni idiomas soportados.

Su relevancia potencial radica en ofrecer una version de bajo peso (~7,1 GB en disco) de un modelo MoE de 26B, lo que permitiria desplegarlo en hardware consumer de gama alta si la cuantizacion es correcta. Sin embargo, la ausencia total de documentacion, benchmarks y licencia hace que su uso en produccion requiera verificaciones adicionales por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer MoE por el sufijo A4B y el tag `gemma4`) |
| Parametros totales | 26B (segun el nombre del repositorio) |
| Parametros activos | 4B (segun el sufijo A4B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (tag `8-bit`), con componentes fp16 segun el sufijo `oQ8e-fp16` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,1 GB |
| Pipeline declarado | no disponible |
| Autor | McG-221 |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens procesados, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas en el modelo base. El nombre `Boulesis-26B-A4B` sugiere una arquitectura de mezcla de expertos con 26B parametros totales y 4B activos por token, patron habitual en modelos tipo MoE de la familia Gemma, pero esta inferencia no puede confirmarse con la informacion disponible.

Respecto al proceso de cuantizacion, el sufijo `oQ8e-fp16` indica que los pesos principales estan cuantizados a 8 bits, probablemente mediante una tecnica de cuantizacion post-entrenamiento (GPTQ, AWQ u otra similar), con ciertas capas o tensores mantenidos en fp16. El tamano del repositorio (7,1 GB) es coherente con una cuantizacion a 8 bits de un modelo de 26B parametros, ya que una representacion fp16 completa ocuparia aproximadamente 52 GB. No se dispone de informacion sobre si se aplico decodificacion especulativa, atencion lineal u otras optimizaciones.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Gemma 4, no verificables en la informacion disponible.
- Codigo y matematicas: presumiblemente soportadas por el modelo base, sin datos publicados que lo confirmen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue en hardware consumer de gama alta: con un peso de 7,1 GB, el modelo podria cargarse en GPUs con 12-16 GB de VRAM si el contexto es moderado, lo que permite experimentar con un MoE de 26B en estaciones de trabajo locales.
- Prototipado rapido de aplicaciones de chat: la cuantizacion a 8 bits reduce el coste de inferencia frente al modelo en fp16, facilitando iteraciones rapidas en entornos de desarrollo.
- Evaluacion comparativa de cuantizaciones: util para equipos que quieran medir la degradacion de calidad de un modelo Gemma 4 MoE al pasar a 8 bits frente a la version original.
- Investigacion sobre eficiencia de MoE: el patron de 26B totales con 4B activos permite estudiar el trade-off entre calidad y coste computacional en tareas de generacion.
- Fine-tuning ligero o adaptadores: al ser un checkpoint safetensors, puede servir como base para LoRA o adaptadores sobre la version cuantizada, aunque la cuantizacion puede limitar el entrenamiento completo.
- Despliegue en entornos con restricciones de almacenamiento: el tamano reducido del repositorio facilita su distribucion en infraestructuras con poco espacio en disco o ancho de banda limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB para los pesos en 8 bits, mas overhead de contexto y cache KV; se recomienda al menos 12-16 GB para contextos moderados.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB) o H100 para mayor throughput.
- Compatibilidad con GPU consumer: probable en RTX 3090/4090 y GPUs con 16 GB o mas, siempre que el contexto no sea muy largo.
- Opciones de despliegue: al ser safetensors, requiere frameworks compatibles con cuantizacion 8-bit (por ejemplo, vLLM con soporte de GPTQ/AWQ, o llama.cpp si se convierte a GGUF). No se dispone de confirmacion de soporte en Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Boulesis-26B-A4B-oQ8e-fp16 | 26B (4B activos) | no disponible | no disponible | Hugging Face, sin descargas |
| Gemma 2 27B (referencia de la familia) | 27B denso | 8K | Gemma Terms | Ampliamente disponible |
| Mixtral 8x7B (MoE similar en tamano) | 46B (12B activos) | 32K | Apache 2.0 | Ampliamente disponible |
| Qwen2.5 32B | 32B denso | 128K | Apache 2.0 | Ampliamente disponible |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre licencia, idiomas, datos de entrenamiento ni limitaciones conocidas, lo que impide evaluar su idoneidad para uso comercial.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribucion del modelo sin consultar al autor.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, agravado por la falta de benchmarks que permitan estimar su calidad real.
- Posible degradacion por cuantizacion: la conversion a 8 bits puede reducir la precision en tareas de razonamiento, codigo o matematicas frente al modelo base.
- Sin soporte comunitario: cero descargas y un solo like indican que el modelo no ha sido validado por la comunidad.
- Idiomas no especificados: no se puede confirmar el soporte multilingue ni la calidad en castellano.
- Contexto desconocido: sin datos sobre la longitud de contexto, no se recomienda su uso en aplicaciones que requieran ventanas largas.
- Procedencia incierta: el autor es individual y no hay vinculo verificado con el equipo de Gemma, por lo que la relacion con el modelo base no esta confirmada oficialmente.

## Enlaces

- Hugging Face: https://huggingface.co/McG-221/Boulesis-26B-A4B-oQ8e-fp16
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
