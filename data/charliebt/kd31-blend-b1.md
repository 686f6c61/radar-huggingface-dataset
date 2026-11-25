# CharlieBT/kd31-blend-b1

## Resumen

CharlieBT/kd31-blend-b1 es un modelo derivado por ajuste fino (finetune) del modelo base MachinePulseAI/karpo-decision-31B, publicado por el usuario CharlieBT en Hugging Face. Se distribuye con la librería transformers en formato safetensors y esta etiquetado en la pipeline como text-classification, aunque sus tags incluyen tambien image-text-to-text y la arquitectura declarada es gemma4, lo que sugiere un modelo multimodal de la familia Gemma 4 reutilizado para una tarea de clasificacion de texto.

El modelo cuenta con 31.273.088.876 parametros totales (aproximadamente 31,3 mil millones), un tamano de repositorio de 62,6 GB y licencia Apache 2.0. El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos. No se han publicado datos sobre idiomas soportados, contexto, cuantizaciones ni benchmarks en la informacion disponible.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de gran tamano (31B) orientado a clasificacion de texto y con herencia multimodal, lo que puede interesar a equipos que necesiten un clasificador de alta capacidad sobre textos largos o combinados con imagenes, siempre que asuman el coste de inferencia de un modelo de 31B y la restriccion de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (segun tag del repositorio); transformer multimodal con cabecera de clasificacion |
| Parametros totales | 31.273.088.876 (~31,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Pipeline declarada | text-classification |
| Tamano del repositorio | 62,6 GB |
| Acceso | restringido (gated) |
| Libreria | transformers |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se basa en la arquitectura gemma4 y que es un finetune de MachinePulseAI/karpo-decision-31B. Los tags del repositorio incluyen image-text-to-text, lo que apunta a que el modelo base es multimodal (entrada de imagen y texto) y que este derivado conserva esa capacidad, aunque la pipeline declarada sea text-classification. No se especifican detalles sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino, ni si se emplearon tecnicas de RLHF, DPO o instruccion supervisada.

Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.) ni la configuracion exacta del transformer. Dado el tamano (31,3B parametros) y el formato safetensors de 62,6 GB, se trata de pesos en precision de 16 bits (bf16/fp16), coherente con un modelo denso de esa escala. Cualquier detalle adicional sobre el entrenamiento debe considerarse no disponible.

## Capacidades

- Clasificacion de texto: la pipeline declarada es text-classification, por lo que el uso previsto es asignar etiquetas o categorias a textos de entrada.
- Herencia multimodal: los tags image-text-to-text sugieren capacidad de procesar pares imagen-texto, aunque no se documenta la tarea concreta para la que se ajusto.
- Generacion de texto: al derivar de un modelo de lenguaje de 31B, es plausible que conserve capacidades generativas, pero no esta confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): vision posible por el tag image-text-to-text; el resto no disponible.

## Casos de uso

- Clasificacion de documentos largos en entornos empresariales: el modelo, con 31,3B parametros, puede emplearse para etiquetar contratos, informes o expedientes en categorias predefinidas, aprovechando su capacidad para captar matices semanticos que modelos mas pequenos pierden.
- Moderacion de contenido: uso como clasificador de toxicidad, spam o categorias de riesgo en plataformas, siempre que se valide su calibracion con datos propios, ya que no hay benchmarks publicados.
- Enrutamiento de tickets de soporte: asignar automaticamente incidencias a departamentos o niveles de prioridad a partir del texto del ticket, integrándolo en un pipeline de atencion al cliente.
- Analisis de resenas y opinion publica: clasificacion de sentimiento o tematica en grandes volumenes de comentarios, con la ventaja de un modelo de gran capacidad frente a clasificadores ligeros.
- Clasificacion multimodal en documentos escaneados: gracias a la herencia image-text-to-text, podria aplicarse a facturas o formularios con imagen y texto asociado, aunque requiere validacion previa.
- Etiquetado asistido para curación de datasets: usar el modelo como anotador automatico de un corpus para preetiquetar y luego revisar manualmente, reduciendo el coste de anotacion.
- Investigacion en ajuste fino: servir como punto de partida para experimentos de finetune sobre clasificacion, dado que es un derivado de un modelo base abierto y con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 62-64 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda al menos 80 GB por GPU para inferencia comoda.
- Cuantizacion a 8 bits: alrededor de 32-34 GB de VRAM, viable en una A100 40GB o H100 80GB.
- Cuantizacion a 4 bits: alrededor de 16-18 GB de VRAM, lo que permitiria ejecucion en una RTX 4090 (24 GB) o RTX 3090, aunque con posible perdida de calidad no medida.
- GPU recomendadas: H100 80GB, A100 80GB, A100 40GB (con cuantizacion), L40S 48GB (con cuantizacion 8 bits).
- ¿Cabe en GPU de consumo? En fp16 no; en 4 bits es posible en RTX 4090/3090 con 24 GB, asumiendo limitaciones de contexto y throughput.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este modelo y requeririan conversion o verificacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-blend-b1 | ~31,3B | no disponible | Apache 2.0 | Restringido (gated) | Finetune de karpo-decision-31B, pipeline text-classification |
| MachinePulseAI/karpo-decision-31B (base) | ~31B (presumible) | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Gemma 2 27B (referencia de familia) | 27B | 8K (segun version) | Gemma license | Abierto | Alternativa de tamano similar de la familia Gemma |
| Qwen2.5 32B (referencia) | 32,5B | 128K | Apache 2.0 | Abierto | Alternativa densa de tamano comparable |

La comparativa con Gemma 2 27B y Qwen2.5 32B se ofrece como referencia de categoria por tamano, no como equivalencia funcional; no hay datos de rendimiento de kd31-blend-b1 para comparar de forma rigurosa.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es descargable de forma anonima.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en clasificacion ni en generacion, por lo que cualquier uso en produccion exige evaluacion propia.
- Documentacion minima: no se especifican idiomas, contexto, dataset de entrenamiento ni hiperparametros, lo que dificulta reproducir o auditar el modelo.
- Riesgo de alucinacion y descalibracion: al ser un finetune sin ficha tecnica, las probabilidades de clasificacion pueden estar mal calibradas; se recomienda validacion con datos representativos.
- Herencia multimodal incierta: aunque los tags indican image-text-to-text, no se confirma que la cabecera de clasificacion acepte imagenes en este derivado.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse que el modelo base karpo-decision-31B no imponga restricciones adicionales que prevalezcan.
- Coste de inferencia elevado: 31,3B parametros implican requisitos de VRAM y latencia altos para un clasificador; considerar destilacion o modelos menores si la tarea lo permite.
- Sesgos: no documentados; cabe esperar los sesgos del corpus de entrenamiento del modelo base, no auditados en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-blend-b1
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
