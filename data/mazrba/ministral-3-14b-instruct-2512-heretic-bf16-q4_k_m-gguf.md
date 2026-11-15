# mazrba/Ministral-3-14B-Instruct-2512-heretic-BF16-Q4_K_M-GGUF

## Resumen

Ministral-3-14B-Instruct-2512-heretic-BF16-Q4_K_M-GGUF es una cuantización en formato GGUF (Q4_K_M) del modelo nchapman/Ministral-3-14B-Instruct-2512-heretic-BF16, que a su vez deriva de la familia Ministral 3 de Mistral AI en su variante Instruct de diciembre de 2025. La versión "heretic" indica que el modelo ha sido sometido a un proceso de "abliteration" o decensurado, es decir, se han atenuado las capas de rechazo para reducir la probabilidad de respuestas evasivas ante peticiones sensibles. El autor de esta conversión es el usuario mazrba, que ha publicado únicamente el artefacto GGUF, no los pesos originales.

El modelo base cuenta con 13.506.073.600 parámetros (aproximadamente 13,5 mil millones), lo que lo sitúa en la gama de 14B que Mistral denomina Ministral 3. La licencia declarada es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque conviene verificar la licencia del modelo original de Mistral AI. El repositorio ocupa 8,2 GB, coherente con una cuantización de 4 bits para un modelo de este tamaño.

La relevancia de esta ficha radica en que combina tres factores poco habituales: un modelo de Mistral reciente, una variante sin censura y un formato GGUF listo para ejecutarse en llama.cpp u Ollama. Esto lo hace atractivo para desarrolladores que necesitan inferencia local en hardware de consumo y que quieren evitar rechazos del modelo en tareas creativas, periodísticas o de investigación. No obstante, la ausencia de benchmarks publicados y de documentación detallada en la model card limita la evaluación rigurosa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Ministral 3 de Mistral AI; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo); el modelo base BF16 esta disponible por separado |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo `ministral-3-14b-instruct-2512-heretic-bf16-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Ministral-3-14B-Instruct-2512. Por la nomenclatura y el tamaño (13,5B parametros), se trata de un transformer decoder-only de la familia Ministral 3 de Mistral AI, preentrenado y posteriormente ajustado con instrucciones (Instruct) y, presumiblemente, con tecnicas de alineacion como RLHF o DPO, aunque no se confirma en la model card. La variante "heretic" implica un proceso de abliteration aplicado sobre el checkpoint Instruct, que modifica direcciones de activacion asociadas al rechazo para reducir la tasa de respuestas evasivas.

El proceso de cuantizacion a Q4_K_M se ha realizado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF/DPO documentadas. Tampoco se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada. El modelo base en BF16 esta disponible en el repositorio de nchapman, pero su model card no se ha incluido en esta ficha.

## Capacidades

- Generacion de texto e instrucciones en 11 idiomas: ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Razonamiento y respuesta a instrucciones complejas, heredado del ajuste Instruct de Ministral 3.
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion, pero esperable en un modelo Instruct de esta familia.
- Modo "uncensored" / "abliterated": menor probabilidad de rechazo ante peticiones que el modelo original rechazaria.
- Compatibilidad con llama.cpp, Ollama y otros motores que consumen GGUF.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Inferencia local en estaciones de trabajo: al estar en GGUF Q4_K_M (8,2 GB), puede ejecutarse en una GPU consumer con 10-12 GB de VRAM o incluso en CPU con RAM suficiente, lo que permite desplegar un modelo de 13,5B en equipos sin aceleradores de datacenter.
- Generacion creativa sin restricciones: la variante heretic reduce los rechazos en tareas de ficcion, guion o narrativa con contenido sensible, algo util para escritores y guionistas que necesitan explorar temas adultos sin friccion del modelo.
- Investigacion sobre alineacion y seguridad: permite comparar el comportamiento del modelo original frente al abliterated en experimentos de red teaming y evaluacion de sesgos, usando el mismo checkpoint base.
- Traduccion multilingue entre los 11 idiomas soportados: adecuado para prototipos de traduccion en entornos con recursos limitados, aunque sin benchmarks publicados no se puede garantizar calidad frente a modelos especializados.
- Asistente de codigo en local: integrable en editores o CLI mediante llama.cpp u Ollama, con la ventaja de no enviar codigo propietario a servicios en la nube.
- Procesamiento de documentos y resumenes: con contexto suficiente (no confirmado), puede usarse para resumir articulos, informes o transcripciones en local, preservando la privacidad de los datos.
- Chatbot de atencion al cliente autoalojado: al ser Apache 2.0 y ejecutable en hardware modesto, es viable para pymes que quieran un asistente conversacional sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 8-9 GB solo para los pesos; con cache KV y overhead, entre 10 y 12 GB para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en datacenter, A100, H100 o L40S con amplio margen.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas de VRAM; en 8 GB requeriria cuantizaciones mas agresivas (Q3_K_M o Q2_K) no publicadas en este repo.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF), y potencialmente vLLM si se convierte o se usa el checkpoint BF16 original; el tag `vllm` del repo sugiere compatibilidad con el ecosistema, pero el archivo publicado es GGUF.
- Latencia y throughput: no disponibles; dependeran del hardware y del backend. En una RTX 4090 se puede esperar un throughput en el orden de decenas de tokens por segundo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mazrba/Ministral-3-14B-Instruct-2512-heretic-BF16-Q4_K_M-GGUF | 13,5B | no disponible | Apache 2.0 | GGUF Q4_K_M | Variante abliterated, 11 idiomas |
| nchapman/Ministral-3-14B-Instruct-2512-heretic-BF16 | 13,5B | no disponible | Apache 2.0 | safetensors BF16 | Modelo base del que deriva esta cuantizacion |
| Mistral Ministral 3 14B Instruct (original) | 13,5B | no disponible | Apache 2.0 (segun Mistral) | safetensors | Version con alineacion estandar, sin abliteration |
| Mistral NeMo 12B Instruct | 12B | 128k (segun Mistral) | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar de Mistral AI |

La comparativa se limita a datos estructurales porque no hay benchmarks publicados para esta variante. Frente al Ministral 3 original, la diferencia principal es el proceso de abliteration, que puede alterar la calidad y la seguridad del modelo. Frente a Mistral NeMo 12B, el contexto de 128k de este ultimo es una ventaja si se confirma, pero no se dispone del dato para Ministral 3 en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration puede degradar capacidades generales y aumentar la probabilidad de contenido toxico, sesgado o inseguro; no se han publicado evaluaciones que cuantifiquen este efecto.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin benchmarks no se puede estimar su fiabilidad en tareas factuales.
- La model card no documenta el contexto maximo, los datos de entrenamiento ni las tecnicas de alineacion, lo que dificulta la evaluacion en produccion.
- Aunque la licencia declarada es Apache 2.0, conviene verificar los terminos del modelo original de Mistral AI y del checkpoint intermedio de nchapman antes de uso comercial.
- El proceso de decensurado puede entrar en conflicto con politicas de moderacion de plataformas o con requisitos regulatorios en determinados sectores.
- Solo se publica una cuantizacion (Q4_K_M); no hay variantes Q5, Q6, Q8 ni IQ para ajustar el equilibrio calidad/VRAM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su calidad o estabilidad.
- El tag `vllm` no implica que el archivo GGUF sea cargable directamente por vLLM; para ese motor habria que usar el checkpoint BF16 original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mazrba/Ministral-3-14B-Instruct-2512-heretic-BF16-Q4_K_M-GGUF
- Modelo base (checkpoint BF16): https://huggingface.co/nchapman/Ministral-3-14B-Instruct-2512-heretic-BF16
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Politica de privacidad de Mistral AI (referenciada en la model card): https://mistral.ai/terms/
