# Fr4nkSt3in/salamandra-7b-instruct-2606-BF16-GGUF

## Resumen

Este repositorio contiene una conversion a formato GGUF con cuantizacion BF16 del modelo BSC-LT/salamandra-7b-instruct, publicada por el usuario Fr4nkSt3in. No se trata de un modelo entrenado desde cero, sino de una reempaquetado del modelo instructivo de 7.000 millones de parametros desarrollado por el Barcelona Supercomputing Center (BSC-LT) para su uso con llama.cpp y otras herramientas compatibles con GGUF. El repositorio base pertenece a la familia Salamandra, que se distribuye en tres tamanos (2B, 7B y 40B) con variantes base e instruidas.

El modelo resuelve la necesidad de desplegar un LLM de 7B optimizado para lenguas ibericas y europeas en entornos locales o de inferencia ligera. Frente al peso original en safetensors, la version GGUF permite ejecucion en CPU y GPU con llama.cpp, Ollama o LM Studio. La relevancia principal radica en su cobertura linguistica: ingles, castellano, frances, ruso, aleman, hungaro, catalan, portugues, gallego y euskera, lo que lo convierte en una opcion poco habitual para tareas multilingues centradas en lenguas de Espana.

La model card del repositorio no aporta detalles tecnicos propios mas alla de la licencia Apache 2.0, el modelo base y la lista de idiomas. Cualquier dato de arquitectura, contexto o entrenamiento procede del modelo original BSC-LT/salamandra-7b-instruct o de fuentes de terceros, y asi se indica en cada caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Salamandra; detalle no especificado en la informacion disponible) |
| Parametros totales | 7B (aproximadamente 7.000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 160K tokens (segun llm-explorer para la variante 2606; no confirmado en la model card de este repositorio) |
| Tipos de cuantizacion | BF16 en este repositorio; otras cuantizaciones GGUF en repositorios de terceros |
| Idiomas soportados | en, es, fr, ru, de, hu, ca, pt, gl, eu |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (bfloat16) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de este repositorio concreto, que es una reempaquetado GGUF. El modelo base BSC-LT/salamandra-7b-instruct pertenece a la familia Salamandra, descrita como un LLM de 7B con variantes base e instruida. Para mas detalle de capas, atencion y tokenizador habria que consultar la model card del modelo original, no incluida en la informacion proporcionada.

Respecto al entrenamiento del modelo base, la model card original indica que se realizaron 3 epocas de preentrenamiento con 2,4 billones (2.4T) de tokens por epoca, seguidas de 2 epocas adicionales de preentrenamiento en las que la parte en ingles del dataset Colossal OSCAR se sustituyo por FineWeb-Edu (subconjunto de 350BT), dando como resultado 2,68T tokens por epoca. Finalmente se realizo 1 epoca con 0,315T tokens de mayor calidad. No se especifican en la informacion disponible los detalles de la fase de ajuste instruccional (si fue RLHF, DPO u otra tecnica).

## Capacidades

- Generacion de texto en diez idiomas: ingles, castellano, frances, ruso, aleman, hungaro, catalan, portugues, gallego y euskera.
- Modelo instruido, por lo que esta ajustado para seguir instrucciones en formato conversacional.
- Uso como modelo de chat mediante plantilla compatible con llama.cpp.
- Ejecucion local en CPU y GPU gracias al formato GGUF.
- Capacidades de razonamiento, codigo o matematicas: no confirmadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision o audio): no disponibles; el pipeline declarado es text-generation.

## Casos de uso

- Asistentes conversacionales en catalan, gallego o euskera: el modelo cubre lenguas minoritarias que la mayoria de LLM de 7B no soportan de forma nativa, lo que permite construir chatbots locales para administraciones o medios de comunicacion en esas lenguas.
- Atencion al cliente multilingue en el ambito iberico: al manejar castellano, catalan, gallego y portugues en un mismo modelo, se puede desplegar un unico motor de respuesta para varios mercados sin cambiar de modelo.
- Despliegue en hardware de gama media: al estar en formato GGUF, puede ejecutarse con llama.cpp en equipos sin GPU dedicada o con GPU de consumo, reduciendo el coste de infraestructura frente a modelos de mayor tamano.
- Generacion de texto y resumenes para documentacion interna: un modelo de 7B instruido es suficiente para tareas de resumen, reescritura y clasificacion de documentos en entornos con requisitos de privacidad, ya que la inferencia puede hacerse de forma local.
- Prototipado rapido en investigacion: sirve como linea base de 7B multilingue para comparar tecnicas de cuantizacion o de ajuste fino en idiomas europeos.
- Traduccion asistida entre lenguas romanicas: su cobertura de castellano, catalan, gallego, portugues y frances permite plantear tareas de traduccion o parafraseo entre idiomas proximos.
- Educacion y generacion de material didactico en lenguas cooficiales: util para producir textos de apoyo en catalan, gallego o euskera donde la oferta de modelos abiertos es reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15,6 GB segun llm-explorer para la variante 2606, lo que se corresponde con el peso de un modelo de 7B en 16 bits mas el overhead de contexto.
- GPU recomendadas: una GPU con 16 GB o mas de memoria, como RTX 4090 (24 GB), A100 40 GB o H100. En GPUs de 16 GB el modelo puede entrar al limite, con poca holgura para contextos largos.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, en general, en tarjetas con 24 GB. En GPUs de 8-12 GB no cabe en BF16; seria necesario recurrir a cuantizaciones GGUF mas agresivas (por ejemplo Q4), no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para vLLM o TGI habria que usar los pesos originales en safetensors, no estos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Fr4nkSt3in/salamandra-7b-instruct-2606-BF16-GGUF | 7B | 160K (no confirmado) | Apache 2.0 | GGUF BF16 | Repro del modelo base; 0 descargas y 0 likes en el momento de la consulta |
| BSC-LT/salamandra-7b-instruct | 7B | no disponible | Apache 2.0 | safetensors | Modelo original del BSC-LT, base de este repositorio |
| cstr/salamandra-7b-instruct-GGUF | 7B | no disponible | Apache 2.0 | GGUF | Cuantizacion GGUF experimental con llama.cpp b2750 |
| tensorblock/salamandra-7b-instruct-GGUF | 7B | no disponible | Apache 2.0 | GGUF | Cuantizado con llama.cpp a partir del commit b4658 |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye informacion sobre sesgos, evaluaciones de seguridad ni datos de alignment del modelo base.
- Al ser un modelo de 7B, es esperable un riesgo de alucinacion en tareas factuales, aunque no se cuantifica en la informacion disponible.
- La longitud de contexto de 160K procede de una fuente de terceros (llm-explorer) y no esta confirmada por la model card de este repositorio.
- El rendimiento en lenguas minoritarias (catalan, gallego, euskera) puede ser inferior al de castellano e ingles, ya que no se aportan metricas por idioma.
- Aunque la licencia declarada es Apache 2.0, conviene verificar los terminos del modelo base BSC-LT/salamandra-7b-instruct antes de un uso comercial, ya que las condiciones pueden variar respecto a las del reempaquetado.
- El repositorio tiene 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad ni cuenta con retroalimentacion de uso en produccion.
- Los formatos GGUF no son compatibles directamente con frameworks de servido de alto rendimiento como vLLM o TGI; para esos casos hay que partir de los pesos originales.
- El nombre del repositorio incluye la referencia "2606", que puede corresponder a una version o fecha concreta del modelo base; conviene confirmar a que variante exacta apunta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Fr4nkSt3in/salamandra-7b-instruct-2606-BF16-GGUF
- Modelo base: https://huggingface.co/BSC-LT/salamandra-7b-instruct
- Cuantizacion GGUF de cstr: https://huggingface.co/cstr/salamandra-7b-instruct-GGUF
- Ficha en llm-explorer de Salamandra 7B Instruct 2606: https://llm-explorer.com/model/BSC-LT%2Fsalamandra-7b-instruct-2606,1BPK88Hcmz2H2sMVcSny0D
- Entrada en free2aitools de jordimas/salamandra-7b-instruct-2606-gguf: https://free2aitools.com/model/jordimas/salamandra-7b-instruct-2606-gguf
- Cuantizacion GGUF de TensorBlock: https://www.toolify.ai/ai-model/tensorblock-salamandra-7b-instruct-gguf
