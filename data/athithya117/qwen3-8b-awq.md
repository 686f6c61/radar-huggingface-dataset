# Athithya117/Qwen3-8B-AWQ

## Resumen

Qwen3-8B-AWQ es una version cuantizada a 4 bits mediante AWQ (Activation-aware Weight Quantization) del modelo denso Qwen3-8B, desarrollado originalmente por el equipo Qwen de Alibaba. Esta publicacion concreta corresponde al repositorio Athithya117/Qwen3-8B-AWQ, una conversion de la comunidad construida sobre los pesos oficiales Qwen/Qwen3-8B. El objetivo de la cuantizacion es reducir el peso en disco y en VRAM (de aproximadamente 16 GB en BF16 a unos 4,5-5 GB de pesos) para permitir el despliegue en GPUs de gama consumer sin recurrir a precision reducida dinamica.

El modelo es un transformer causal denso de 8.190.735.360 parametros totales (8,2B, de los cuales 6,95B no corresponden a embeddings), con 36 capas y atencion con grouped-query attention (32 cabezas de consulta frente a 8 de clave/valor). Su rasgo diferencial es el soporte de conmutacion entre modo de razonamiento (thinking) y modo directo (non-thinking) dentro del mismo conjunto de pesos, ademas de capacidades de agentes y cobertura multilingue declarada de mas de 100 idiomas y dialectos.

Es relevante ahora porque Qwen3 se ha consolidado como una de las familias abiertas con mejor relacion calidad/tamano, y la variante AWQ es la via practica para servirla con vLLM o SGLang en hardware asequible. Conviene senalar que este repositorio es una copia de la comunidad, con cero descargas y cero likes en el momento del analisis, por lo que en produccion resulta mas prudente usar la publicacion oficial Qwen/Qwen3-8B-AWQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con grouped-query attention (GQA), 36 capas |
| Parametros totales | 8.190.735.360 (8,2B); 6,95B no pertenecientes a embeddings |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 tokens con YaRN |
| Tipos de cuantizacion | AWQ 4 bits (unica variante publicada en este repositorio) |
| Idiomas soportados | mas de 100 idiomas y dialectos segun la model card de Qwen3; el repositorio no declara lista explicita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados AWQ 4 bits), 6,1 GB de repositorio |
| Cabezas de atencion | 32 para Q, 8 para KV (GQA) |
| Modelo base | Qwen/Qwen3-8B |
| Libreria | transformers (requiere >= 4.51.0) |
| Etiquetas | transformers, safetensors, qwen3, text-generation, conversational, 4-bit, awq, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer causal decoder-only denso de 36 capas, con normalizacion previa a las subcapas y atención con GQA que reduce el coste de la cache KV (8 cabezas KV en lugar de 32). Qwen3 se entreno en dos fases, preentrenamiento y postentrenamiento, sobre un corpus multilingue extenso; el informe tecnico de Qwen3 esta referenciado en la metadata del repositorio con el identificador arXiv:2505.09388. La model card original describe mejoras sustanciales en razonamiento, seguimiento de instrucciones, capacidades de agente y soporte multilingue respecto a generaciones anteriores (QwQ en modo thinking, Qwen2.5-Instruct en modo non-thinking).

Sobre la cuantizacion, este repositorio aplica AWQ en su variante de 4 bits, tecnica descrita en el paper arXiv:2309.00071, que protege los canales de activacion mas relevantes durante la cuantizacion en lugar de aplicar escalado uniforme. Es un metodo de cuantizacion solo para pesos que conserva la ejecucion en precision completa para activaciones, lo que exige kernels especificos y por tanto descarta su uso directo en llama.cpp u Ollama. No se dispone de informacion en la documentacion proporcionada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni los detalles de RLHF/DPO empleados.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones multi-turno.
- Razonamiento explicito en modo thinking, con el contenido de razonamiento delimitado por las etiquetas `<think>...</think>`.
- Conmutacion entre modo thinking y modo non-thinking mediante el parametro `enable_thinking` en `apply_chat_template`, tambien expuesto en las APIs de SGLang y vLLM.
- Razonamiento matematico y logico segun la model card de Qwen3, con mejora declarada frente a QwQ en modo thinking.
- Generacion de codigo, con capacidad de integracion en flujos de desarrollo.
- Capacidades de agente: integracion de herramientas externas tanto en modo thinking como non-thinking.
- Soporte de mas de 100 idiomas y dialectos, con seguimiento de instrucciones multilingue y traduccion.
- Alineacion con preferencias humanas orientada a escritura creativa, role-playing y dialogos largos.
- No se declaran capacidades de vision ni de audio en la informacion disponible; Qwen3-8B es un modelo exclusivamente de texto.

## Casos de uso

- Atencion al cliente automatizada: con 32.768 tokens de contexto nativo el modelo puede mantener el historial completo de una conversacion multi-turno o arrastrar documentacion de soporte sin truncar, y el modo non-thinking reduce la latencia en respuestas simples.
- Asistente de codigo en el IDE: la ventana de contexto permite adjuntar varios ficheros de un mismo modulo, y el modo thinking mejora la resolucion de errores de compilacion o de logica compleja antes de emitir el parche.
- Agentes con tool calling en pipelines de CI/CD: el modelo puede invocar herramientas externas en ambos modos, de forma que un agente puede consultar el estado de un build, leer logs y proponer una correccion encadenando varios pasos.
- Analisis de documentacion tecnica extensa: gracias a la extension a 131.072 tokens con YaRN se pueden procesar manuales o contratos largos en una sola pasada para extraer clausulas o resumir secciones.
- Traduccion y localizacion multilingue: la cobertura declarada de mas de 100 idiomas permite usarlo como motor de traduccion base en flujos de localizacion, con revisión humana posterior.
- Tutorizacion y generacion de material didactico de matematicas: el modo thinking explicita el razonamiento paso a paso, lo que resulta util para producir soluciones comentadas y problemas resueltos.
- Despliegue en infraestructura propia con una sola GPU: al ocupar aproximadamente 4,5-5 GB en 4 bits, es viable servirlo en una GPU consumer de 12-16 GB para cargas de trabajo internas o prototipado.
- Extraccion estructurada de informacion: clasificacion, etiquetado y conversion de texto libre a JSON dentro de flujos de procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion (MMLU, HumanEval, GSM8K u otros) ni comparativa con el modelo base en precision BF16, por lo que no es posible cuantificar la degradacion introducida por la cuantizacion AWQ 4 bits sin medirla directamente.

## Requisitos de hardware

- Pesos en 4 bits: aproximadamente 4,5-5 GB (el repositorio ocupa 6,1 GB, incluyendo ficheros auxiliares y configuracion).
- Cache KV en FP16: unos 144 KiB por token, dado el GQA de 8 cabezas KV, 128 dimensiones por cabeza y 36 capas. Esto supone aproximadamente 4,7 GB para los 32.768 tokens de contexto nativo, y unos 18,9 GB para 131.072 tokens.
- VRAM estimada para inferencia: unos 6-8 GB con contexto corto o moderado; alrededor de 11-12 GB para aprovechar los 32.768 tokens de contexto nativo; 24 GB o mas para contextos cercanos a 131.072 tokens.
- GPU recomendadas: NVIDIA A100 40/80 GB y H100 para servicio con contexto largo y concurrencia alta; RTX 4090, RTX 4080 y A6000 para 32k tokens con holgura; RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 para cargas ligeras con contexto reducido.
- Cabe en GPU consumer: si, en tarjetas de 12 GB o mas, siempre que se limite el contexto y el numero de secuencias concurrentes.
- Opciones de despliegue: vLLM >= 0.8.5 (`vllm serve ... --enable-reasoning --reasoning-parser deepseek_r1`), SGLang >= 0.4.6.post1 (`python -m sglang.launch_server ... --reasoning-parser qwen3`), Text Generation Inference (etiqueta `text-generation-inference` presente en el repositorio) y transformers >= 4.51.0 con `AutoModelForCausalLM`. Al tratarse de AWQ, no es compatible de forma directa con llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible.
- Nota de muestreo: en modo thinking la model card recomienda Temperature 0.6, TopP 0.95, TopK 20 y MinP 0, y advierte explicitamente de no usar decodificacion greedy porque degrada el rendimiento y puede provocar generacion sin fin.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto nativo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Athithya117/Qwen3-8B-AWQ | 8,2B | 32.768 (131.072 con YaRN) | AWQ 4 bits | Apache 2.0 | Repositorio de comunidad, 0 descargas |
| Qwen/Qwen3-8B-AWQ (oficial) | 8,2B | 32.768 (131.072 con YaRN) | AWQ 4 bits | Apache 2.0 | Repositorio oficial de Qwen |
| Qwen/Qwen3-8B (BF16) | 8,2B | 32.768 (131.072 con YaRN) | ninguna (BF16) | Apache 2.0 | Repositorio oficial de Qwen |
| Qwen2.5-7B-Instruct | 7,6B aproximadamente | 131.072 tokens | multiples variantes | Apache 2.0 | Repositorio oficial de Qwen |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. Cualquier eleccion entre la version AWQ y el modelo base en BF16 deberia acompanarse de una evaluacion propia de la degradacion por cuantizacion en la tarea objetivo.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados para esta conversion, de modo que no se puede confirmar la magnitud de la perdida de calidad frente a la version BF16.
- La cuantizacion AWQ 4 bits introduce degradacion en tareas sensibles a la precision numerica, como calculo aritmetico de varios pasos o generacion de codigo muy dependiente de detalles sintacticos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en modo thinking el razonamiento intermedio puede contener afirmaciones erroneas que no deben presentarse al usuario final.
- El modo thinking incrementa notablemente el numero de tokens generados, con el consiguiente coste de latencia y de VRAM por la cache KV; conviene desactivarlo en cargas conversacionales simples.
- La decodificacion greedy esta desaconsejada en modo thinking por la propia model card.
- La metadata del repositorio no declara la lista de idiomas soportados; la cobertura de mas de 100 idiomas proviene de la model card de Qwen3 y su calidad varia de forma notable entre idiomas, especialmente en lenguas de bajos recursos.
- Aunque la licencia es Apache 2.0, este repositorio es una publicacion de la comunidad sin validacion oficial: se recomienda verificar los pesos y, en produccion, preferir el repositorio oficial Qwen/Qwen3-8B-AWQ.
- El repositorio presenta cero descargas y cero likes, sin senales de uso o validacion por parte de terceros.
- Requiere transformers >= 4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.
- El despliegue en GPU con kernels AWQ es obligatorio para obtener ventaja de la cuantizacion; no hay soporte directo en llama.cpp u Ollama.

## Enlaces

- Repositorio analizado: https://huggingface.co/Athithya117/Qwen3-8B-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Version AWQ oficial de Qwen: https://huggingface.co/Qwen/Qwen3-8B-AWQ
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentacion de cuantizacion AWQ en Qwen: https://qwen.readthedocs.io/en/latest/quantization/awq.html
- Documentacion de despliegue con SGLang: https://qwen.readthedocs.io/en/latest/deployment/sglang.html
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Paper de AWQ: https://arxiv.org/abs/2309.00071
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388
- Chat de Qwen: https://chat.qwen.ai/

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo o sobre Qwen3; los enlaces anteriores proceden de la metadata del repositorio y de la documentacion oficial de Qwen.
