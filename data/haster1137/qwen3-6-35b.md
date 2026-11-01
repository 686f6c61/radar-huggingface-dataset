# Haster1137/Qwen3.6-35B

## Resumen

Qwen3.6-35B es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) presentado por el usuario Haster1137 en HuggingFace bajo licencia Apache 2.0. Segun la model card, el modelo se basa en un backbone de aproximadamente 35.000 millones de parametros totales con unos 3.000 millones de parametros activos por token, lo que lo situa en la categoria de modelos MoE de alta eficiencia orientados a inferencia rapida y bucles de agentes autonomos. El repositorio real de safetensors declara 34.660.610.688 parametros, coherente con la cifra redondeada de la model card.

La model card lo describe como un modelo con atencion hibrida (Gated DeltaNet + Gated Attention) y una ventana de contexto de hasta 262.144 tokens, con soporte nativo de tool calling, ejecucion de agentes multi-paso y generacion de codigo. El repositorio publicado contiene pesos en formato GGUF con tecnicas de cuantizacion tipo imatrix, y el autor lo etiqueta como compatible con endpoints OpenAI, vLLM, TGI y llama.cpp.

Es relevante ahora porque combina una relacion parametros-activos muy agresiva (8 expertos activos de 256 por token) con contexto largo, un perfil que encaja con el despliegue local de agentes de codigo y automatizacion sin depender de APIs propietarias. Conviene senalar que la model card atribuye el desarrollo a "Qwen (Alibaba Cloud) / Community Fine-tuned & Hosted", sin que se aporten detalles verificables sobre el proceso de entrenamiento o los datos utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida Gated DeltaNet + Gated Attention |
| Parametros totales | 34.660.610.688 (~34,7 B; la model card indica ~35 B) |
| Parametros activos | ~3 B por token (8 expertos activos de 256) |
| Longitud de contexto | Hasta 262.144 tokens (262K nativos) |
| Tipos de cuantizacion | GGUF con imatrix (el repo pesa 15,4 GB); no se detallan los niveles exactos |
| Idiomas soportados | Ingles (tag `en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 15,4 GB); el autor menciona pesos safetensors de referencia |
| Tag de pipeline | text-generation |
| Compatibilidad de despliegue | vLLM, TGI, llama.cpp, endpoints compatibles OpenAI |

## Arquitectura y entrenamiento

La arquitectura descrita es un transformer disperso de tipo Mixture-of-Experts con enrutamiento fino: 256 expertos, de los cuales 8 se activan por token, lo que da una relacion de activacion de aproximadamente el 8,6 % de los parametros totales. La model card menciona ademas una atencion hibrida que combina Gated DeltaNet (un mecanismo de estado recurrente lineal) con Gated Attention clasica, un patron que busca reducir el coste cuadratico del contexto largo manteniendo la capacidad de atencion completa en las capas donde es necesaria. Esta combinacion es la que permite, segun el autor, sostener ventanas de 262K tokens con un coste de inferencia contenido.

No se proporcionan datos verificables sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card tampoco documenta el proceso de destilacion o fine-tuning comunitario que separa este checkpoint de un hipotetico modelo base de Qwen. Cualquier afirmacion sobre innovaciones de decodificacion especulativa, attention linear exacta o tecnicas de entrenamiento adicionales debe considerarse no disponible en la informacion publicada.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Generacion y edicion de codigo, con enfasis declarado en tareas de debugging y refactorizacion.
- Tool calling y function calling nativo, con soporte para salidas estructuradas e interaccion con APIs personalizadas.
- Ejecucion de agentes autonomos multi-paso, incluyendo edicion de ficheros y ejecucion de comandos segun la model card.
- Razonamiento logico complejo y parsing de documentos largos.
- Procesamiento multimodal declarado (texto, codigo e imagenes) en ventanas de contexto extendidas; no se detalla la arquitectura de vision ni los formatos admitidos.
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.
- No se menciona modo "thinking" explicito ni soporte de audio.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede mantener bucles multi-paso con edicion de ficheros y ejecucion de comandos, apoyandose en el contexto de 262K tokens para retener el estado de un repositorio mediano durante una sesion de trabajo.
- Asistentes de atencion al cliente: la ventana de contexto larga permite gestionar historiales multi-turno extensos y documentacion de producto sin truncar informacion relevante.
- Analisis de bases de codigo: con 262K tokens de contexto es viable cargar varios modulos o un monorepo pequeno y pedir resumenes, deteccion de dependencias o explicaciones de flujos de control.
- Automatizacion de pipelines CI/CD: el soporte de tool calling y salidas estructuradas permite integrarlo como paso de generacion de parches, revision de diffs o creacion de issues a partir de logs de fallo.
- Procesamiento de documentos largos: contratos, informes tecnicos o expedientes que superan la ventana tipica de 8K-32K tokens pueden analizarse en una sola pasada sin chunking agresivo.
- Despliegue local de alta throughput: con ~3B parametros activos y cuantizacion GGUF, es adecuado para servir en una sola GPU consumer de gama alta o en hardware de empresa con vLLM, priorizando tokens por segundo sobre calidad absoluta.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD como generador de tests unitarios o documentacion tecnica a partir del codigo fuente, con la ventaja de que el coste por token es bajo gracias a la dispersion de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma una velocidad de generacion superior a 200 tokens por segundo en hardware como NVIDIA L40S, A100 o RTX PRO 6000, sin acompanar de mediciones reproducibles, configuracion de cuantizacion ni tamano de lote. No se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 15,4 GB, por lo que una cuantizacion de ese tamano requiere al menos ~16 GB de VRAM para cargar los pesos, mas overhead de contexto KV que crece con la ventana utilizada; con 262K tokens el coste de KV cache es significativo y exige GPUs de 48-80 GB o tecnicas de offloading.
- GPU recomendadas segun el autor: NVIDIA L40S, A100, RTX PRO 6000 y arquitecturas Hopper/Blackwell para maximizar throughput con vLLM.
- Cabe en GPU consumer: si, en tarjetas con 16-24 GB (RTX 4080/4090, RTX 3090) para cuantizaciones GGUF del orden de 15 GB y contextos moderados; para contexto completo de 262K se necesita hardware de centro de datos.
- Opciones de despliegue: vLLM (`vLLM serve Haster1137/Qwen3.6-35B --port 8000 --max-model-len 262144`), TGI, llama.cpp, endpoints compatibles OpenAI y Hugging Face Dedicated Inference Endpoints.
- Latencia y throughput: el autor declara mas de 200 tokens/s en hardware empresarial; no se aportan mediciones de latencia por peticion ni de throughput agregado con batching.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B (este) | ~34,7 B / ~3 B | 262K | Apache 2.0 | GGUF | MoE hibrido con atencion Gated DeltaNet + Gated Attention |
| Qwen3-30B-A3B | ~30 B / ~3 B | 32K-128K segun variante | Apache 2.0 | safetensors, GGUF | MoE de referencia de la familia Qwen; contexto menor |
| Mixtral 8x7B | ~46,7 B / ~12,9 B | 32K | Apache 2.0 | safetensors, GGUF | MoE con mas parametros activos y menor eficiencia por token |
| DeepSeek-Coder-V2-Lite | ~15,7 B / ~2,4 B | 128K | DeepSeek License | safetensors, GGUF | Orientado a codigo, contexto inferior y licencia mas restrictiva |

La comparacion se limita a caracteristicas publicas; no hay datos de benchmarks de este checkpoint que permitan contrastar calidad frente a las alternativas. Los datos de los modelos comparados corresponden a sus especificaciones publicas habituales y pueden variar segun la version exacta.

## Limitaciones y advertencias

- La model card atribuye el desarrollo a "Qwen (Alibaba Cloud) / Community Fine-tuned & Hosted" sin documentar el proceso de fine-tuning, los datos utilizados ni la relacion exacta con modelos oficiales de Qwen; la procedencia del checkpoint no es verificable.
- Solo se declara soporte de ingles en los metadatos; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de codigo donde puede inventar APIs o dependencias inexistentes.
- El contexto de 262K tokens exige hardware de gama alta y aumenta el coste de KV cache; en configuraciones consumer el contexto efectivo sera mucho menor.
- La model card menciona "sin friccion de seguridad corporativa", lo que sugiere un alineamiento de seguridad reducido; no se detallan filtros ni evaluaciones de seguridad.
- El soporte multimodal se declara pero no se especifica la arquitectura de vision ni los formatos admitidos, por lo que no debe asumirse en produccion sin validacion.
- Aunque la licencia es Apache 2.0, la ausencia de documentacion sobre el entrenamiento impide descartar obligaciones derivadas de los datos de origen.
- El repositorio tiene muy pocas descargas (179) y cero likes en el momento de la consulta, lo que reduce la validacion comunitaria disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Haster1137/Qwen3.6-35B
- Repositorio de Qwen en GitHub (familia base): https://github.com/QwenLM/Qwen3
- Documentacion de vLLM: https://docs.vllm.ai
- Documentacion de llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentacion de TGI: https://huggingface.co/docs/text-generation-inference
