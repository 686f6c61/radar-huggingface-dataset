# LTM-Lab/Inkling-2-Mini-Uncensored-V19-DPO

## Resumen

Inkling-2-Mini-Uncensored-V19-DPO es un modelo multimodal de tipo image-text-to-text desarrollado por LTM-Lab, derivado de la familia Inkling V19. Se distribuye bajo licencia Apache 2.0 y esta pensado para tareas de conversacion y roleplay, tras un proceso declarado de eliminacion de censura y optimizacion por preferencias (DPO) orientada a ese uso. El repositorio ocupa 20,2 GB y contiene pesos en safetensors con codigo personalizado (custom_code), lo que implica que la carga requiere confiar en implementaciones no estandar.

El modelo cuenta con 26.391.585.970 parametros totales segun los datos reales de safetensors, lo que lo situa en la categoria de modelos de aproximadamente 26B. Soporta cuatro idiomas declarados (ingles, chino, japones y coreano) y acepta entradas de imagen y texto. La informacion publica disponible es muy limitada: no se detallan la arquitectura interna, el contexto maximo, la composicion del dataset de entrenamiento ni resultados de benchmarks.

Es relevante ahora por dos motivos: por un lado, ejemplifica la corriente de modelos derivados de pesos abiertos con ajuste DPO para casos de uso de rol y conversacion sin restricciones; por otro, su naturaleza multimodal y su licencia permisiva lo hacen atractivo para experimentacion, aunque la ausencia de documentacion tecnica y de evaluaciones publicadas obliga a tratarlo con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta interna `inkling2_loop_v19`; transformer multimodal segun el pipeline image-text-to-text) |
| Parametros totales | 26.391.585.970 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en 8-bit (etiqueta `8-bit`, `modelopt`); no se detallan otras variantes publicadas |
| Idiomas soportados | en, zh, ja, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` en transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna. La model card solo indica que el modelo se basa en "V19" y que ha pasado por un proceso de eliminacion de censura seguido de DPO (Direct Preference Optimization) orientado a roleplay. Las etiquetas del repositorio apuntan a un transformer multimodal con soporte de entrada imagen-texto, un identificador de version `inkling2_loop_v19` y pesos cuantizados en 8-bit mediante modelopt. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF adicional ni innovaciones tecnicas como atencion lineal o decodificacion especulativa.

El hecho de que el repositorio requiera `custom_code` significa que la arquitectura no se resuelve con clases estandar de transformers y que el codigo del autor se ejecuta al cargar el modelo. Esto es un factor relevante tanto para la reproducibilidad como para la seguridad de la cadena de suministro.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis declarado en roleplay.
- Procesamiento de entradas multimodales imagen-texto (pipeline `image-text-to-text`).
- Conversacion en ingles, chino, japones y coreano.
- Ajuste DPO orientado a preferencias de estilo conversacional y roleplay.
- Sin censura declarada por el autor (modelo "uncensored"), lo que amplia el rango de respuestas pero elimina filtros de seguridad por defecto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva: el ajuste DPO del autor esta orientado explicitamente a este escenario, por lo que el modelo puede mantener personajes y estilo conversacional a lo largo de sesiones multi-turno, aunque la longitud de contexto no este documentada.
- Prototipado de asistentes conversacionales sin filtros: util para investigacion sobre comportamiento de modelos sin censura, analisis de sesgos y estudios de alineacion en entornos controlados.
- Descripcion de imagenes y dialogo sobre contenido visual: al aceptar entradas imagen-texto, puede emplearse para generar descripciones o responder preguntas sobre imagenes en ingles, chino, japones o coreano.
- Localizacion conversacional para mercados asiaticos: el soporte declarado de zh, ja y ko permite construir demos de atencion al cliente o asistentes en esos idiomas, verificando calidad caso por caso.
- Generacion de dialogos para videojuegos y ficcion interactiva: el modelo puede producir respuestas de personaje con tono consistente, integrable en motores de dialogo mediante la API de transformers.
- Investigacion sobre DPO y des-censura: comparar este checkpoint con su base V19 permite estudiar el efecto del DPO en la distribucion de respuestas y en la tasa de rechazos.
- Experimentacion multimodal en laboratorio: con 26B parametros y pesos en 8-bit, sirve para probar pipelines image-text-to-text en infraestructura con varias GPU, siempre que se valide el codigo personalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 26.391.585.970 parametros en 8-bit, los pesos ocupan aproximadamente 26,4 GB; en FP16 serian unos 52,8 GB. A ello hay que sumar KV cache y overhead del runtime, por lo que en 8-bit conviene prever 32-40 GB de VRAM y en FP16 64 GB o mas.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 sin fragmentar; A100 40 GB, L40S 48 GB o dos RTX 4090 de 24 GB para la variante 8-bit.
- GPU de consumo: no cabe en una unica RTX 4090 de 24 GB en 8-bit segun el calculo de pesos; requeriria cuantizaciones adicionales (por ejemplo GGUF de 4 bits) que no se documentan en el repositorio.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y el uso de `custom_code` complica la integracion con servidores de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-V19-DPO | 26,4B | no disponible | imagen-texto | Apache 2.0 | DPO para roleplay, sin benchmarks publicados |
| Qwen2.5-VL-32B-Instruct | 32B (aprox.) | no disponible en esta ficha | imagen-texto | Apache 2.0 | Familia ampliamente documentada y evaluada |
| Gemma 3 27B IT | 27B | no disponible en esta ficha | imagen-texto | Gemma license | Requiere aceptacion de terminos de uso |
| InternVL2.5-26B | 26B (aprox.) | no disponible en esta ficha | imagen-texto | MIT | Orientado a tareas visuales con evaluaciones publicadas |

La comparativa se limita a tamano, modalidad y licencia porque no hay datos de rendimiento del modelo de LTM-Lab; los modelos alternativos citados cuentan con documentacion tecnica y evaluaciones publicas que este checkpoint no ofrece.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion de arquitectura, contexto y datos de entrenamiento: imposible estimar calidad o comportamiento en produccion sin evaluacion propia.
- Modelo declarado "uncensored": no incorpora filtros de seguridad por defecto, lo que implica riesgo de generar contenido inapropiado, danoso o ilegal segun el uso; el autor traslada la responsabilidad al usuario mediante un disclaimer.
- Riesgo de alucinacion no cuantificado; sin evaluaciones de factualidad no puede recomendarse para tareas que exijan precision.
- Idiomas limitados a en, zh, ja y ko; no se declara soporte de espanol, por lo que la calidad en castellano es incierta.
- Longitud de contexto desconocida: no es posible planificar conversaciones largas o procesamiento de documentos extensos.
- El repositorio usa `custom_code`: cargar el modelo ejecuta codigo del autor, lo que supone un riesgo de seguridad y complica la auditoria.
- Pesos en 8-bit con modelopt: la precision reducida puede afectar a la calidad respecto a un checkpoint FP16 no publicado.
- Licencia Apache 2.0 permite uso comercial, pero el caracter "uncensored" puede incumplir politicas de plataformas o normativa aplicable segun el contexto de despliegue.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion en el repositorio (2026-11-26): verificar la procedencia y la integridad de los pesos antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/LTM-Lab/Inkling-2-Mini-Uncensored-V19-DPO
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
