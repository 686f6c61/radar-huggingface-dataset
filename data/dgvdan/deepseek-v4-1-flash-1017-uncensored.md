# Dgvdan/DeepSeek-V4.1-Flash-1017-uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-uncensored es una variante del checkpoint DeepSeek-V4.1-Flash-1017 (release 1017) de DeepSeek, publicada por el usuario Dgvdan en Hugging Face. Se trata de un modelo de lenguaje de arquitectura MoE (mixture of experts) con 763.205.315.794 parametros totales segun los safetensors del repositorio, distribuido en formato FP8 y pensado para generacion de texto. El modelo base es deepseek-ai/DeepSeek-V4.1-Flash-1017, y esta variante se obtiene mediante una edicion de pesos en forma cerrada (closed-form weight edit), sin fine-tuning ni entrenamiento por gradiente, aplicada sobre el checkpoint FP8 nativo.

El objetivo declarado por el autor es eliminar el comportamiento de rechazo (refusal) del modelo base para investigacion autorizada de seguridad y red-teaming. Segun la model card, los 384 expertos enrutados quedan intactos, por lo que la capacidad de conocimiento y razonamiento se mantiene proxima al modelo base, y el checkpoint se carga y sirve exactamente igual que el original. El autor advierte explicitamente que el modelo es deliberadamente sin censura, que cumplira peticiones daninas y que debe mantenerse privado y no desplegarse publicamente.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de edicion de pesos que modifica el comportamiento de rechazo sin reentrenar; por otro, sirve como caso de estudio de los riesgos de publicar variantes sin censura de modelos grandes bajo licencia MIT. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 510,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) transformer; 384 expertos enrutados segun la model card; familia deepseek_v41 |
| Parametros totales | 763.205.315.794 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (segun la model card, en la seccion de servicio en Zro); no confirmado para el checkpoint local |
| Tipos de cuantizacion | FP8 nativo (8-bit); el autor lo describe como checkpoint FP8 drop-in; no se listan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers); tamano del repo 510,3 GB |

## Arquitectura y entrenamiento

El modelo es una variante del checkpoint DeepSeek-V4.1-Flash-1017, de arquitectura MoE con 384 expertos enrutados. No se dispone de informacion sobre el numero de parametros activos por token, el numero de capas, la dimension oculta ni el mecanismo de atencion exacto. El entrenamiento del modelo base no se detalla en la informacion proporcionada; esta variante concreta no se entrena: se genera mediante una edicion de pesos en forma cerrada (closed-form weight edit) fusionada en los pesos del checkpoint FP8 nativo, sin fine-tuning ni gradiente. Segun el autor, los 384 expertos enrutados no se tocan, de modo que la capacidad y el conocimiento del modelo base se preservan y el checkpoint se carga y sirve igual que el original.

La innovacion tecnica destacable es precisamente ese metodo de edicion de pesos: modifica el comportamiento de rechazo sin reentrenar y sin alterar los expertos, lo que permite conservar el rendimiento del modelo base. La model card reporta que el modelo se sirve con SGLang (con soporte para DeepSeek-V4.1) usando tensor parallelism y expert parallelism (`--tp-size 4 --ep-size 4`), con parsers de razonamiento (`deepseek-v41`) y de tool calling (`deepseekv41`). No se dispone de informacion sobre la composicion del dataset de entrenamiento del modelo base, ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: la model card reporta resultados en MMLU, MMLU-Pro, GPQA-Diamond y GSM8K, con modo de razonamiento habilitado en algunos benchmarks.
- Razonamiento matematico: GSM8K con protocolo step-by-step y decodificacion greedy.
- Razonamiento cientifico de nivel avanzado: GPQA-Diamond con razonamiento habilitado.
- Tool calling / function calling: el ejemplo de servicio incluye `--tool-call-parser deepseekv41`, lo que indica soporte de llamadas a herramientas.
- Modo de razonamiento (thinking): la model card menciona un ajuste maximo de esfuerzo de razonamiento y recomienda un presupuesto de generacion de al menos 16k tokens para que las respuestas largas no se trunquen.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Comportamiento sin censura: el modelo cumple peticiones daninas por diseno, segun el autor.

## Casos de uso

- Investigacion de seguridad y red-teaming autorizado: el modelo esta pensado para evaluar la robustez de filtros y clasificadores de seguridad frente a un modelo que no rechaza peticiones; el autor lo restringe a este uso y a entornos privados.
- Evaluacion de clasificadores de rechazo: con un indice de rechazo del 1,8% en prompts daninos y 0,0% de sobre-rechazo en prompts benignos (segun la model card), sirve para medir la sensibilidad y especificidad de clasificadores de seguridad propios.
- Analisis de tecnicas de edicion de pesos: permite estudiar como una edicion en forma cerrada afecta al comportamiento de rechazo sin degradar MMLU (88,22% base frente a 87,91% en esta variante) ni MMLU-Pro (69,90% frente a 69,42%).
- Pruebas de cumplimiento en ciberseguridad: la model card reporta cumplimiento pleno en 30 prompts de exploits de CVE reales; utilizable en laboratorios cerrados para validar detecciones y playbooks de respuesta.
- Servicio de inferencia privado con SGLang: el checkpoint es drop-in respecto al base y se puede desplegar con `--tp-size 4 --ep-size 4` en infraestructura propia con GPUs de alta capacidad.
- Integracion via API compatible con OpenAI y Anthropic: la model card documenta el servicio Abyss 1 en Zro con contexto de 1M tokens y hasta 64K de salida, util para prototipos que requieran ese contexto sin gestionar GPUs.
- Estudio de sesgos y comportamientos no deseados: al eliminar los rechazos, facilita la observacion de respuestas que el modelo base ocultaria, siempre en un entorno controlado y con supervision.

## Benchmarks y rendimiento

Datos reportados en la model card del autor, con el mismo harness y prompts emparejados entre modelo base y esta variante. No se han verificado de forma independiente.

| Benchmark | Base | Este modelo |
|---|---:|---:|
| MMLU (14.042, test completo) | 88,22% | 87,91% |
| MMLU-Pro (4.000 muestras) | 69,90% | 69,42% |
| MMLU-Pro (300 muestras, razonamiento) | 85,7% | 84,7% |
| GPQA-Diamond (198, razonamiento) | 81,3% | 84,8% |
| GSM8K (step-by-step, greedy) | 93,5% | 96,0% |
| Rechazo en prompts daninos (n=1410) | 87,3% | 1,8% |
| Sobre-rechazo en prompts benignos (n=350) | 6,3% | 0,0% |
| HarmBench-320 (StrongREJECT, 0-1) | 0,38 | 0,95 |
| StrongREJECT (313 prompts) | 0,02 | 0,99 |
| Prompts de exploits CVE reales (30) | 0,12 | 1,00 |

Notas del autor: en GPQA-Diamond, parte de los items mas dificiles agotan el presupuesto de generacion de 24k tokens a mitad de razonamiento (24 en el base, 15 en esta variante); puntuando solo respuestas completas, el base obtiene 92,5% y esta variante 91,8%, y en las 174 preguntas que ambos completan aciertan exactamente las mismas (161). El juez utilizado para las metricas de cumplimiento danino es `dolly2-security` con la rubrica StrongREJECT.

## Requisitos de hardware

- VRAM estimada para inferencia: con 763.205.315.794 parametros en FP8, el peso del modelo ocupa aproximadamente 763 GB; se necesita un nodo multi-GPU con memoria agregada muy superior a esa cifra para margen de activaciones y cache KV.
- GPU recomendadas: el ejemplo oficial usa `--tp-size 4 --ep-size 4`, lo que implica al menos 4 GPUs de clase数据中心 (H100/H200 o A100 de 80 GB) para el checkpoint FP8; no se especifica el modelo exacto de GPU.
- Cabe en GPU de consumo: no; el tamano del checkpoint (510,3 GB de repo) excede la memoria de cualquier GPU consumer individual.
- Opciones de despliegue: SGLang con soporte DeepSeek-V4.1 (comando documentado en la model card); tambien carga con transformers (libreria declarada). No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-uncensored (este) | 763.205.315.794 | 1M (segun model card) | MIT | Variante sin censura por edicion de pesos; FP8; 0 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible en esta ficha | no disponible | no disponible | Modelo base; rechazo del 87,3% en prompts daninos; MMLU 88,22% |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo deliberadamente sin censura: cumple peticiones daninas por diseno; el autor lo restringe a investigacion de seguridad autorizada y a uso privado, y prohibe su despliegue o servicio publico.
- Riesgo elevado de uso indebido: la model card reporta cumplimiento del 0,95 en HarmBench-320, 0,99 en StrongREJECT y 1,00 en prompts de exploits CVE reales; no debe exponerse a usuarios no autorizados.
- Alucinacion: no se reportan metricas especificas de alucinacion; como todo modelo generativo, puede producir contenido falso con apariencia de veracidad.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Idiomas: no se especifican los idiomas soportados.
- Licencia: MIT, lo que permite uso comercial segun los terminos de la licencia, pero el propio autor desaconseja el despliegue publico; la licencia del modelo base tambien aplica segun la model card.
- Presupuesto de generacion: con el esfuerzo de razonamiento maximo, el modelo razona de forma muy extensa; se recomienda un presupuesto de al menos 16k tokens para evitar truncamientos.
- Verificacion: los benchmarks son reportados por el autor con su propio harness y juez; no hay evaluacion independiente. El repositorio tiene 0 descargas y 0 likes, lo que limita la evidencia de uso real.
- Servicio en la nube: la model card menciona el servicio Abyss 1 en Zro (region Estados Unidos, retencion cero), pero es un servicio de terceros no verificado en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dgvdan/DeepSeek-V4.1-Flash-1017-uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pagina del modelo Abyss 1 en Zro: https://zro.moonmath.ai/abyss1
- Precios de Zro: https://zro.moonmath.ai/pricing
- Documentacion de la CLI de Zro: https://zro.moonmath.ai/docs/cli
- Referencia de la API de Zro: https://zro.moonmath.ai/v1
