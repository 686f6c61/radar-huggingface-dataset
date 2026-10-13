# mistralai/Ministral-3-14B-Instruct-2512-BF16

## Resumen

Ministral 3 14B Instruct 2512 BF16 es el modelo de mayor tamano de la familia Ministral 3 de Mistral AI, disenado especificamente para despliegue en el borde (edge) sin renunciar a capacidades propias de modelos mas grandes. Se trata de un modelo instruct post-entrenado sobre Ministral-3-14B-Base-2512, con 13.945.031.680 parametros totales segun los pesos en safetensors, que se descomponen en un modelo de lenguaje de 13,5B y un encoder de vision de 0,4B. Soporta una ventana de contexto de 256k tokens y capacidades multimodales (texto e imagen).

La relevancia de este lanzamiento radica en su relacion capacidad/hardware: segun la model card, puede ejecutarse en BF16 dentro de 32 GB de VRAM y en menos de 24 GB de RAM/VRAM cuando se cuantiza, lo que lo sitúa en el rango de estaciones de trabajo e incluso equipos de consumo de gama alta. Mistral posiciona su rendimiento como comparable al de Mistral Small 3.2 24B, un modelo notablemente mayor, y publica comparativas frente a Qwen3-14B (Thinking y Non-Thinking) con ventaja en AIME25, AIME24, GPQA Diamond, LiveCodeBench, Arena Hard, WildBench y MATH.

Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificacion sin restricciones de tipo copyleft, y esta disponible en variantes Base, Instruct y Reasoning, en tamanos 3B, 8B y 14B. El repositorio declarado (55,9 GB, incluyendo pesos BF16 y otros artefactos) y sus etiquetas de vLLM y SageMaker indican que el objetivo principal es el despliegue autoalojado en produccion, no el consumo via API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tipo mistral3): modelo de lenguaje de 13,5B + encoder de vision de 0,4B |
| Parametros totales | 13.945.031.680 (13,95B) segun safetensors; 13,5B de lenguaje + 0,4B de vision segun la model card |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | BF16 (este repositorio) y FP8 sin perdida (repositorio mistralai/Ministral-3-14B-Instruct-2512); otros formatos y cuantizaciones en la coleccion Ministral 3 - Additional Checkpoints, sin detallar en la informacion disponible |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe (la model card indica "docenas de idiomas") |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); existe version FP8 |
| Libreria declarada | vLLM |
| Modelo base | mistralai/Ministral-3-14B-Base-2512 |
| Fecha de creacion | 2025-10-31 |
| Ultima actualizacion | 2026-07-15 |
| Descargas / likes en HuggingFace | 91.571 descargas / 46 likes |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal organizado en dos componentes: un modelo de lenguaje de 13,5B parametros y un encoder de vision de 0,4B, segun la propia model card. El identificador de arquitectura declarado en HuggingFace es `mistral3` y la libreria de referencia es vLLM, con soporte de `mistral-common` para el preprocesado. Se trata de la variante Instruct, es decir, la version post-entrenada para seguir instrucciones partiendo del checkpoint base `Ministral-3-14B-Base-2512`; la familia incluye ademas variantes especificas para razonamiento (Reasoning) en los tres tamanos.

No se han proporcionado en la informacion disponible datos concretos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre las tecnicas de alineacion empleadas (RLHF, DPO u otras). La model card tampoco detalla innovaciones de atencion o decodificacion (por ejemplo, atencion lineal o decodificacion especulativa). Lo que si se explicita como caracteristica de diseno es el enfoque "edge-optimized": la familia esta pensada para ejecutarse en un espectro amplio de hardware, con el 14B en BF16 cabiendo en 32 GB de VRAM y por debajo de 24 GB cuando se cuantiza. La model card remite al paper (arXiv:2601.08584) y al blog de Mistral para el detalle tecnico, no incluido en el material proporcionado.

## Capacidades

- Generacion de texto y dialogo: modelo instruct post-entrenado, orientado a chat y tareas de instruccion.
- Vision: analisis de imagenes y generacion de respuestas basadas en contenido visual, ademas de texto.
- Multilingue: soporte declarado de ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe, con mencion a "docenas de idiomas".
- Seguimiento de system prompt: la model card destaca una adherencia fuerte a las instrucciones de sistema.
- Agentic: capacidades de agente con function calling nativo y salida en JSON.
- Contexto largo: ventana de 256k tokens, adecuada para documentos extensos y conversaciones multi-turno largas.
- Razonamiento y matematicas: los benchmarks publicados incluyen AIME25 (0,850), AIME24 (0,898), GPQA Diamond (0,712) y MATH Maj@1 (0,904).
- Codigo: LiveCodeBench 0,646 en la comparativa de la model card.
- Despliegue en el borde: disenado para ejecucion local en hardware limitado, con version FP8 sin perdida y cuantizaciones adicionales.
- Modo thinking: no declarado para esta variante Instruct; existe un checkpoint especifico Ministral-3-14B-Reasoning-2512 para ese proposito.

## Casos de uso

- Asistente privado autoalojado: el modelo puede desplegarse integramente en infraestructura propia (32 GB de VRAM en BF16, menos de 24 GB cuantizado), lo que permite gestionar conversaciones con datos sensibles sin enviar informacion a APIs externas.
- Analisis de documentos largos: con 256k tokens de contexto, es viable procesar contratos, informes tecnicos o expedientes completos en una sola pasada, incluyendo la extraccion de clausulas o resumenes estructurados en JSON.
- Agentes locales con function calling: gracias al soporte nativo de tool calling y salida JSON, puede orquestar llamadas a herramientas (APIs internas, bases de datos, sistemas de ficheros) en flujos multi-paso ejecutados en el propio hardware.
- Atencion al cliente en produccion: la combinacion de contexto largo, multilingue y adherencia a system prompt permite mantener conversaciones multi-turno con historial extenso en varios idiomas europeos y asiaticos.
- Procesamiento de imagenes en flujos documentales: el encoder de vision de 0,4B habilita tareas como extraccion de datos de facturas escaneadas, clasificacion de capturas o descripcion de diagramas dentro de un pipeline documental.
- Generacion y revision de codigo en pipelines de CI/CD: puede integrarse como paso de revision automatica o generacion de parches, apoyandose en su rendimiento en LiveCodeBench (0,646) y en la salida estructurada JSON para comunicarse con el sistema de integracion.
- Especializacion mediante fine-tuning: al publicarse bajo Apache 2.0 y con un checkpoint base disponible, es posible ajustar el modelo para dominios verticales (legal, sanitario, industrial) sin restricciones de licencia.
- Despliegue en entornos con hardware restringido: aplicaciones de campo, kioscos o dispositivos industriales donde no hay GPU de datacenter pero si una GPU consumer o memoria unificada suficiente.

## Benchmarks y rendimiento

Resultados publicados por Mistral AI en la model card. La comparativa de razonamiento enfrenta a Ministral 3 con modelos Qwen3 de tamano similar:

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0,850 | 0,898 | 0,712 | 0,646 |
| Qwen3-14B (Thinking) | 0,737 | 0,837 | 0,663 | 0,593 |
| Ministral 3 8B | 0,787 | 0,860 | 0,668 | 0,616 |
| Qwen3-VL-8B-Thinking | 0,798 | 0,860 | 0,671 | 0,580 |
| Ministral 3 3B | 0,721 | 0,775 | 0,534 | 0,548 |
| Qwen3-VL-4B-Thinking | 0,697 | 0,729 | 0,601 | 0,513 |

Comparativa de la variante Instruct:

| Modelo | Arena Hard | WildBench | MATH Maj@1 | MM MTBench |
|---|---|---|---|---|
| Ministral 3 14B | 0,551 | 68,5 | 0,904 | 8,49 |
| Qwen3 14B (Non-Thinking) | 0,427 | 65,1 | 0,870 | no disponible |

Nota: la tabla de benchmarks de la variante Instruct en la model card proporcionada aparece truncada, por lo que el valor de MM MTBench de Qwen3 14B (Non-Thinking) y cualquier fila posterior no estan disponibles. Todos los resultados son los reportados por el autor del modelo y no han sido verificados de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 27,9 GB solo para pesos (13,95B parametros x 2 bytes); la model card indica que el modelo cabe en 32 GB de VRAM en BF16, dejando poco margen para cache KV con contextos largos.
- VRAM cuantizado: menos de 24 GB de RAM/VRAM segun la model card. La version FP8 sin perdida reduce el peso de los pesos a aproximadamente la mitad respecto a BF16.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por el rango de memoria declarado (32 GB en BF16), encajan GPUs de datacenter y workstation como A100 40/80 GB, H100, L40S, A6000 o RTX 6000 Ada.
- GPU de consumo: el modelo cuantizado (menos de 24 GB) es compatible con tarjetas de 24 GB como la RTX 3090 o la RTX 4090. En BF16 no cabe en GPUs de consumo de 24 GB; requeriria memoria unificada de 32 GB o superior (por ejemplo, Apple Silicon de gama alta) o configuraciones multi-GPU.
- Opciones de despliegue: la libreria declarada es vLLM, y el repositorio incluye la etiqueta `deploy:sagemaker`. El soporte de `mistral-common` facilita la integracion con el ecosistema oficial de Mistral. No se confirma en la informacion disponible soporte explicito de llama.cpp, Ollama o TGI, aunque existen cuantizaciones adicionales publicadas en una coleccion aparte.
- Latencia y throughput: no disponibles. No se han publicado cifras de tokens por segundo ni de latencia en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 55,9 GB, una cifra considerablemente superior a los pesos BF16, por lo que conviene planificar el espacio en disco de descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 14B Instruct 2512 | 13,95B (13,5B LM + 0,4B vision) | 256k | AIME25 0,850; Arena Hard 0,551; MATH 0,904; MM MTBench 8,49 | Apache 2.0 | HuggingFace (BF16, FP8 y cuantizaciones adicionales) |
| Qwen3-14B (Thinking) | 14B (no confirmado en la informacion) | no disponible | AIME25 0,737; AIME24 0,837; GPQA 0,663; LiveCodeBench 0,593 | no disponible | no disponible |
| Qwen3 14B (Non-Thinking) | 14B (no confirmado en la informacion) | no disponible | Arena Hard 0,427; WildBench 65,1; MATH 0,870; MM MTBench no disponible | no disponible | no disponible |
| Ministral 3 8B | no disponible (menor que 14B) | no disponible | AIME25 0,787; GPQA 0,668; LiveCodeBench 0,616 | Apache 2.0 | HuggingFace |
| Ministral 3 3B | no disponible (menor que 14B) | no disponible | AIME25 0,721; GPQA 0,534; LiveCodeBench 0,548 | Apache 2.0 | HuggingFace |
| Mistral Small 3.2 24B | 24B | no disponible | Mistral afirma rendimiento comparable al de Ministral 3 14B | no disponible | HuggingFace |

Las filas de Qwen3 se limitan a los datos de benchmark aportados por la model card de Mistral; no se dispone de informacion sobre su contexto, licencia o formatos en el material proporcionado. La comparacion con Mistral Small 3.2 24B procede de una afirmacion cualitativa del propio autor.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documentan en la informacion disponible mecanismos especificos de mitigacion ni tasas de alucinacion medidas. Como en cualquier LLM generativo, las salidas deben validarse en contextos criticos.
- Sesgos: no se ha publicado informacion sobre evaluaciones de sesgo, analisis de equidad ni composicion del dataset de entrenamiento, por lo que no es posible valorar este aspecto.
- Contexto: aunque se declaran 256k tokens, no se aportan resultados de evaluacion con contexto largo (por ejemplo, RULER o similares) que confirmen un rendimiento uniforme en toda la ventana.
- Idiomas: la model card menciona "docenas de idiomas", pero solo se listan once. El rendimiento fuera de esos idiomas, y en particular en variedades dialectales o en castellano de Espana frente a otras variantes, no esta documentado.
- Vision: el encoder de vision tiene solo 0,4B parametros, una capacidad muy inferior a la del componente de lenguaje; cabe esperar un rendimiento mas limitado en tareas visuales complejas (razonamiento sobre diagramas densos, OCR de documentos degradados, etc.).
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion. Es una licencia permisiva, sin clausulas de uso aceptable adicionales en la informacion proporcionada, aunque conviene revisar los terminos de Mistral AI asociados al acceso al modelo.
- Gating: la model card incluye un bloque `extra_gated_description` referido al tratamiento de datos personales y a la politica de privacidad de Mistral, lo que sugiere que la descarga puede requerir aceptar condiciones en HuggingFace.
- Ausencia de modo thinking: esta variante Instruct no incorpora modo de razonamiento explicito; para ese caso de uso existe un checkpoint separado (Ministral-3-14B-Reasoning-2512).
- Benchmarks autodeclarados: todas las cifras proceden de la model card del autor, sin verificacion independiente disponible, y parte de la tabla aparece truncada en la informacion proporcionada.
- Produccion: no se dispone de datos de latencia, throughput ni coste por token, elementos necesarios para dimensionar un despliegue real.
- Fecha del modelo: el identificador 2512 y las fechas del repositorio (creacion 2025-10-31, actualizacion 2026-07-15) deben verificarse contra la documentacion oficial antes de fijar una version en produccion.

## Enlaces

- Modelo en HuggingFace (BF16): https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Version FP8 sin perdida: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Base-2512
- Coleccion de checkpoints adicionales y cuantizaciones: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- Ministral 3 3B Base: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Ministral 3 3B Instruct: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Ministral 3 3B Reasoning: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- Ministral 3 8B Base: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Ministral 3 8B Instruct: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Ministral 3 8B Reasoning: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512
- Ministral 3 14B Reasoning: https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- Paper: https://arxiv.org/abs/2601.08584
- Blog de Mistral AI sobre Mistral 3: https://mistral.ai/news/mistral-3
- Mistral Small 3.2 24B (referencia comparativa): https://huggingface.co/mistralai/Mistral-Small-3.2-Instruct-2506
- Sitio oficial de Mistral AI: https://mistral.ai/
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
- Producto de asistente de Mistral (Vibe, anteriormente Le Chat): https://mistral.ai/fr/products/vibe/
- Consola de administracion de Mistral AI: https://console.mistral.ai/home
- Wikipedia (Mistral AI): https://fr.wikipedia.org/wiki/Mistral_AI
