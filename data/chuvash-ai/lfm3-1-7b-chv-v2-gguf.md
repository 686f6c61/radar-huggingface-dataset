# chuvash-ai/LFM3-1.7B-chv-v2-GGUF

## Resumen

LFM3-1.7B-chv-v2-GGUF es la distribucion en formato GGUF del modelo LFM3-1.7B-chv-v2, un ajuste fino del modelo base LiquidAI LFM3-1.7B especializado en traduccion bidireccional entre chuvasio (chv) y ruso (ru). Lo desarrolla la organizacion chuvash-ai, centrada en recursos abiertos para la lengua chuvasia, una lengua turquica de bajos recursos hablada principalmente en la republica de Chuvasia (Rusia). El modelo resuelve un problema concreto: la escasez de sistemas de traduccion neuronal de calidad para pares de lenguas de bajos recursos, ofreciendo un traductor ligero de 1.728.801.600 parametros que cabe en hardware de consumo.

La particularidad de esta variante GGUF no esta en los pesos (identicos a los del repositorio principal, solo cuantizados a Q4_K_M), sino en la plantilla de chat: el modelo se entreno como traductor de estilo completion, no como modelo conversacional, y esta distribucion reemplaza la plantilla de chat nativa de LFM3 por una que renderiza cada peticion en el formato exacto de entrenamiento. Segun el autor, las salidas son byte-identicas a las de los prompts de completion en crudo.

Es relevante ahora porque permite desplegar un traductor especializado chuvasio-ruso en LM Studio o llama.cpp sin infraestructura dedicada, con licencia LFM Open License v1.0 que autoriza uso comercial por debajo de 10 millones de dolares de ingresos anuales. La arquitectura subyacente es la LFM3 hibrida conv/attention de LiquidAI, con 1,7 mil millones de parametros y contexto no especificado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 hibrida conv/attention (segun model card) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | chuvasio (chv), ruso (ru) |
| Licencia | LFM Open License v1.0 (uso comercial permitido por debajo de 10 M USD de ingresos anuales) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM3 de LiquidAI, descrita en la model card como hibrida conv/attention. No se dispone de detalles adicionales sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni composicion del dataset de entrenamiento en la informacion proporcionada. El ajuste fino se realizo sobre el modelo base LiquidAI LFM3-1.7B para especializarlo en traduccion chuvasio-ruso.

El aspecto tecnico mas destacable es el diseno como traductor de completion en lugar de modelo conversacional: el formato nativo de inferencia es un prompt fijo con la instruccion "Переведи на чувашский язык.", el texto fuente y el marcador "Перевод:". El autor advierte que la plantilla de chat nativa de LFM3 degrada la calidad de traduccion porque el modelo nunca vio ese marcado durante el entrenamiento. Esta variante GGUF mantiene los tensores cuantizados identicos al repositorio principal y solo modifica `tokenizer.chat_template` y `general.name` para renderizar las peticiones en el formato de entrenamiento. No se documenta en la informacion disponible si hubo RLHF, DPO ni el volumen de tokens de entrenamiento.

## Capacidades

- Traduccion bidireccional chuvasio-ruso y ruso-chuvasio, con control de direccion mediante system prompt.
- Traduccion de un solo turno: el modelo esta disenado para traducir un texto por peticion, no para mantener conversaciones multi-turno.
- Inferencia en modo greedy (temperatura 0) recomendada por el autor para traduccion.
- Compatibilidad con llama.cpp server, LM Studio y cualquier runtime que renderice plantillas de chat GGUF.
- Compatibilidad con la API `/completion` en crudo usando el formato de prompt nativo, sin necesidad de plantilla.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues limitadas a los dos idiomas de entrenamiento declarados (chv, ru).

## Casos de uso

- Traduccion de documentacion oficial al chuvasio: el modelo traduce textos administrativos o institucionales del ruso al chuvasio en modo greedy, adecuado para producir borradores que un hablante nativo revise antes de publicacion.
- Localizacion de interfaces y contenido web: integracion via llama.cpp server o LM Studio para traducir cadenas de texto de aplicaciones al chuvasio, aprovechando que el modelo cabe en hardware modesto y no requiere GPU dedicada.
- Preservacion linguistica y corpus digitales: traduccion de material ruso a chuvasio para alimentar archivos linguisticos y proyectos de documentacion de la lengua, dado el enfoque del autor en recursos abiertos para chuvasio.
- Traduccion asistida para hablantes de chuvasio: uso como primera pasada en flujos de traduccion humana, donde el traductor revisa y corrige la salida del modelo en lugar de partir de cero.
- Procesamiento por lotes de textos cortos: el modelo de 1,7 B en Q4_K_M permite ejecutar traducciones masivas en CPU o GPU de consumo mediante llama.cpp, con coste por token muy bajo comparado con APIs comerciales.
- Investigacion en NLP de bajos recursos: servir como linea base reproducible para experimentos de traduccion chuvasio-ruso, con la advertencia de usar la version bf16 del repositorio principal para benchmarking y esta Q4 solo para servicio.
- Educacion y aprendizaje del chuvasio: apoyo a estudiantes rusohablantes mediante traduccion de frases y textos, siempre con supervision humana por el riesgo de errores en un modelo de este tamano.

## Benchmarks y rendimiento

El autor publica resultados de chrF++ (sacrebleu, a nivel de corpus) sobre un conjunto de test fijo reservado, con decodificacion greedy:

| Variante | Motor | ru→chv | chv→ru |
|---|---|---:|---:|
| LFM3-1.7B-chv-v2 bf16 | transformers | 34,89 | 35,10 |
| Q4_K_M (este repositorio) | llama.cpp | 30,03 | no disponible |

El autor indica que la arquitectura hibrida conv/attention de LFM3 pierde entre 2,6 y 4,9 puntos de chrF con la cuantizacion Q4_K_M, y recomienda usar el bf16 del repositorio principal para benchmarking y la Q4 para servicio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 1,1 GB (tamano del repositorio), por lo que la inferencia requiere alrededor de 1,5-2 GB de memoria considerando overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo es viable en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100, aunque estas ultimas estan sobredimensionadas para 1,7 B de parametros.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (requiere build posterior a b11938, del 27 de octubre de 2026, donde se fusiono la arquitectura `lfm3`), LM Studio (motor llama.cpp 2.65.1 o superior), llama-server con `--jinja` para habilitar la plantilla de chat, y la API `/completion` en crudo sin plantilla.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables de traduccion chuvasio-ruso en la informacion proporcionada. Como referencia estructural, se compara con el modelo base y su variante sin cuantizar:

| Modelo | Parametros | Contexto | Formato | Licencia | chrF++ ru→chv |
|---|---|---|---|---|---|
| LFM3-1.7B-chv-v2-GGUF Q4_K_M | 1,73 B | no disponible | GGUF | LFM Open License v1.0 | 30,03 |
| LFM3-1.7B-chv-v2 bf16 | 1,73 B | no disponible | safetensors | LFM Open License v1.0 | 34,89 |
| LiquidAI LFM3-1.7B (base) | 1,73 B | no disponible | safetensors | LFM Open License v1.0 | no disponible (no especializado en chuvasio) |

No se identifican en la informacion disponible otros modelos abiertos especializados en traduccion chuvasio-ruso para una comparativa directa.

## Limitaciones y advertencias

- Modelo de un solo turno: no mantiene conversaciones; cada traduccion debe iniciarse en un chat nuevo. Usarlo en modo conversacional degrada la calidad.
- Perdida de calidad por cuantizacion: la version Q4_K_M pierde entre 2,6 y 4,9 puntos de chrF++ respecto al bf16, segun el propio autor. Para evaluacion o produccion con requisitos de calidad estrictos, usar el bf16 del repositorio principal.
- Riesgo de alucinacion y errores de traduccion: con 1,7 B de parametros y entrenamiento en una lengua de bajos recursos, es esperable una tasa de error no despreciable; se recomienda revision humana en contextos criticos.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre datos en ruso y chuvasio, puede heredar sesgos de esas fuentes.
- Limitaciones de contexto e idioma: solo se declaran chv y ru; no se especifica la longitud de contexto soportada, lo que limita el diseno de flujos con textos largos sin validacion previa.
- Restricciones de licencia: LFM Open License v1.0 permite uso comercial solo por debajo de 10 M USD de ingresos anuales; por encima se requiere licencia adicional de LiquidAI.
- Dependencia de version de runtime: requiere llama.cpp posterior a b11938 (27 de octubre de 2026) o LM Studio con motor 2.65.1 o superior; versiones anteriores fallan con `unknown architecture: 'lfm3'`.
- Temperatura: el autor recomienda temperatura 0 (greedy) para traduccion; otros valores pueden degradar la salida.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-v2-GGUF
- Repositorio principal (bf16): https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-v2
- Modelo base LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Organizacion chuvash-ai: https://huggingface.co/chuvash-ai
