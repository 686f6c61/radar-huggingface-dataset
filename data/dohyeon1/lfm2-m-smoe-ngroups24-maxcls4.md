# Dohyeon1/LFM2-M-SMoE-ngroups24-maxcls4

## Resumen

LFM2-M-SMoE-ngroups24-maxcls4 es un checkpoint de generación de texto publicado en HuggingFace por el usuario Dohyeon1, construido sobre la arquitectura etiquetada como `lfm2_moe`. Se trata, por tanto, de una variante con mezcla de expertos (MoE) de la familia Liquid Foundation Models 2 (LFM2) de Liquid AI, cuyo backbone original combina convoluciones cortas con compuertas y un número reducido de bloques de atención con consultas agrupadas (GQA). El repositorio contiene 8.339.930.560 parámetros en formato `safetensors` (16,7 GB de tamaño total), lo que lo sitúa en la franja de los modelos de ~8B.

El interés de este checkpoint es doble. Por un lado, aplica un esquema MoE sobre una arquitectura diseñada para inferencia en dispositivo (edge), lo que en teoría permite aumentar la capacidad total de parámetros sin escalar proporcionalmente el coste de cómputo por token. Por otro, el nombre del modelo sugiere una configuración concreta de expertos (24 grupos y un máximo de 4 expertos activados por token, según la nomenclatura `ngroups24-maxcls4`), aunque esta interpretación no está confirmada por el autor. No obstante, la model card es la plantilla automática de HuggingFace sin rellenar, el modelo acumula cero descargas y cero likes, y no se ha publicado información sobre datos de entrenamiento, licencia o idiomas.

Por todo lo anterior, esta ficha debe leerse como un inventario de lo verificable (arquitectura base, tamaño, formato) más un conjunto explícito de incógnitas. Para cualquier uso en producción sería imprescindible contactar con el autor o inspeccionar directamente los ficheros de configuración del repositorio antes de asumir comportamiento, licencia o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2_moe` (variante con mezcla de expertos sobre el backbone híbrido LFM2: convoluciones cortas con compuertas + bloques GQA) |
| Parametros totales | 8.339.930.560 (~8,34 mil millones) |
| Parametros activos | no disponible (la nomenclatura del nombre sugiere 24 grupos de expertos y un máximo de 4 expertos por token, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos `safetensors`; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de referencia | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 16,7 GB |
| Fecha de creacion | 2026-09-23 (según metadatos del Hub) |
| Ultima actualizacion | 2026-09-23 (según metadatos del Hub) |

## Arquitectura y entrenamiento

La familia LFM2, descrita en el informe técnico arXiv:2511.23404, emplea un backbone híbrido obtenido mediante búsqueda de arquitectura con el hardware en el bucle (*hardware-in-the-loop*) bajo restricciones de latencia y memoria en el borde. Ese backbone combina convoluciones cortas con compuertas y un número pequeño de bloques de atención con consultas agrupadas (GQA), y según Liquid AI ofrece hasta 2 veces más velocidad de *prefill* y *decode* en CPU que alternativas de tamaño comparable. El checkpoint que nos ocupa parte de esa base y la etiqueta como `lfm2_moe`, es decir, introduce una capa de mezcla de expertos, presumiblemente para desacoplar capacidad total de parámetros y cómputo por token.

No hay información disponible sobre el proceso de entrenamiento de este checkpoint concreto: ni número de tokens, ni composición del dataset, ni si hubo ajuste por instrucciones con RLHF o DPO, ni hiperparámetros, ni régimen de precisión (fp32, bf16, fp8). Tampoco se documenta si el MoE se entrenó desde cero, si se inicializó a partir de un LFM2 denso, ni cómo se realizó el enrutamiento o el balanceo de carga entre expertos. La única innovación atribuible con certeza es la del backbone LFM2 heredado; cualquier detalle adicional sobre el componente MoE es, a día de hoy, no disponible.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el checkpoint está orientado a diálogo multi-turno, aunque no se documenta la plantilla de chat ni los tokens especiales.
- Generación de texto genérica: el pipeline declarado es `text-generation`.
- Razonamiento, matemáticas y código: no disponible; no hay evaluación ni descripción que lo confirme.
- Soporte de *tool calling* / *function calling*: no disponible para este checkpoint (la familia LFM2 base sí lo destaca, pero no se puede extrapolar sin verificación).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas está vacío.
- Capacidades multimodales (visión, audio): no disponible; no hay ninguna indicación de módulos de visión o audio.
- Modo de razonamiento explícito (*thinking*): no disponible.

## Casos de uso

Dado que no existe documentación funcional ni evaluación publicada, los siguientes casos son escenarios plausibles condicionados a una validación previa del checkpoint. No deben tomarse como capacidades verificadas.

- Experimentación en investigación sobre MoE: el checkpoint permite estudiar cómo se comporta un esquema de mezcla de expertos con 24 grupos sobre un backbone híbrido convolución-atención, comparando curvas de pérdida y patrones de enrutamiento frente al LFM2 denso equivalente.
- Evaluación comparativa de arquitecturas eficientes: dado su tamaño de ~8,34B parámetros totales, sirve como punto de comparación frente a modelos densos de tamaño similar en pruebas de latencia y memoria cuando se disponga de cuantizaciones.
- Pruebas de generación de texto en local: al publicarse en `safetensors` y ser compatible con `transformers`, puede cargarse en entornos con GPU de gama alta para prototipos de generación.
- Investigación sobre destilación y poda de MoE: al tener un número conocido de grupos de expertos, es un candidato para estudiar técnicas de fusión o poda de expertos.
- Base para *fine-tuning* experimental: si la licencia lo permitiese (dato no disponible), podría ajustarse con LoRA sobre dominios concretos, siempre que se resuelva antes la ambigüedad legal.
- Docencia y formación técnica: útil como ejemplo práctico de checkpoint MoE de tamaño medio para explicar enrutamiento disperso y arquitecturas híbridas.

No se recomienda su uso en atención al cliente, generación de código en producción, análisis de documentos largos ni agentes autónomos, porque no hay evidencia de calidad, contexto, alineación ni licencia que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del recuento de parámetros (8,34B) y del tamaño del repositorio (16,7 GB), no datos medidos por el autor.

- VRAM estimada para inferencia: en fp16/bf16 los pesos ocupan aproximadamente 16,7 GB, a los que hay que sumar caché KV y activaciones, por lo que se necesitan del orden de 20-24 GB en total; en cuantización de 8 bits, unos 8,4 GB de pesos; en 4 bits, unos 4,2-5 GB. Al ser un MoE, el consumo real de memoria depende de cuántos expertos residan en VRAM (todos, en el caso habitual) y de cuántos se activen por token.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en precisión completa y servicio concurrente. En consumer, una RTX 4090 (24 GB) podría alojar el modelo en fp16 de forma ajustada o en 8 bits con holgura; una RTX 3090 (24 GB) queda en el límite.
- Compatibilidad con GPU de consumo: viable en cuantización de 8 y 4 bits en tarjetas de 12-24 GB (RTX 4070 Ti, 4080, 4090, 3090), siempre que exista una conversión disponible, que actualmente no se publica.
- Opciones de despliegue: `transformers` es el único soporte confirmado. vLLM, TGI, llama.cpp u Ollama dependen de que existan pesos convertidos y de que la arquitectura `lfm2_moe` esté implementada en esos frameworks, cosa que no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponible. La familia LFM2 base declara hasta 2 veces más velocidad de *prefill* y *decode* en CPU que Qwen3 y Gemma 3 según Liquid AI, pero esa cifra corresponde a los modelos densos oficiales, no a este checkpoint MoE.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2-M-SMoE-ngroups24-maxcls4 (este) | 8,34B totales | no disponible | no disponible | Hub, 0 descargas | Variante MoE no documentada |
| LFM2 (familia base, Liquid AI) | varios tamanos, incluido ~8B | segun modelo de la familia | segun modelo de la familia (LFM Open License en los publicados) | Hub y sitio de Liquid AI | Backbone híbrido convolucion + GQA; informe tecnico arXiv:2511.23404 |
| Qwen3 8B | ~8B densos | 32.768 tokens o mas segun variante | Apache 2.0 en las variantes abiertas | Hub, ampliamente desplegado | Referencia habitual en la franja 8B, con soporte de tool calling |
| Llama 3.1 8B | ~8B densos | 128.000 tokens | Llama 3.1 Community License | Hub, ampliamente desplegado | Ecosistema maduro de cuantizaciones y frameworks |

La comparación cuantitativa de rendimiento no es posible porque no hay benchmarks publicados para este checkpoint. Además, la licencia del modelo analizado es no disponible, lo que impide equipararlo legalmente a alternativas con licencias permisivas conocidas.

## Limitaciones y advertencias

- Model card vacía: el repositorio contiene únicamente la plantilla automática de HuggingFace sin completar. No hay descripción, instrucciones de uso, plantilla de chat ni tokens especiales documentados.
- Licencia indefinida: al no declararse licencia, no puede asumirse permiso para uso comercial, redistribución o modificación. En la práctica, esto equivale a ausencia de autorización explícita.
- Sin evaluación: no existen resultados de benchmarks, evaluaciones de seguridad ni análisis de sesgos. Cualquier afirmación sobre calidad sería especulativa.
- Riesgo de alucinación: desconocido en magnitud, pero no mitigado por ninguna técnica documentada (RLHF, DPO, filtros de datos). Debe asumirse un riesgo alto en usos factuales.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o si está limitado al inglés.
- Contexto desconocido: sin longitud de contexto documentada, no es posible diseñar aplicaciones que dependan de ventanas largas.
- Trazabilidad nula: el autor no publica paper, repositorio de código, dataset ni detalles de entrenamiento. No hay forma de auditar el proceso.
- Riesgo de seguridad de pesos: al ser un checkpoint de procedencia no verificada y sin documentación, conviene cargarlo en entornos aislados y revisar el código de configuración antes de ejecutarlo.
- Interpretación del nombre: `ngroups24` y `maxcls4` son convenciones de nomenclatura del autor; su significado exacto (número de grupos de expertos, expertos por token, top-k) no está confirmado.
- Metadatos atípicos: la fecha de creación registrada (2026-09-23) resulta anómala y conviene verificarla antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dohyeon1/LFM2-M-SMoE-ngroups24-maxcls4
- Checkpoint hermano del mismo autor: https://huggingface.co/Dohyeon1/LFM2-M-SMoE-ngroups24
- Discusiones del modelo hermano: https://huggingface.co/Dohyeon1/LFM2-M-SMoE-ngroups24/discussions
- Ficha de registro en Free2AITools: https://free2aitools.com/model/dohyeon1/lfm2-m-smoe-ngroups24
- Informe técnico de LFM2 (arXiv:2511.23404): https://arxiv.org/abs/2511.23404
- Blog de Liquid AI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Referencia citada en la etiqueta arXiv del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental de ML: https://mlco2.github.io/impact
