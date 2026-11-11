# jsantillana/gemma-4-26B-A4B-it-abliterated-v3

## Resumen

Gemma 4 26B A4B es un modelo multimodal de Google DeepMind que combina una arquitectura Mixture-of-Experts (MoE) con capacidades de vision. Con 25.200 millones de parametros totales y solo 3.800 millones activos por token, ofrece un equilibrio poco habitual entre capacidad y eficiencia computacional. Procesa entradas de texto e imagen y genera texto, con una ventana de contexto de 256.000 tokens y un vocabulario de 262.000 entradas.

La variante aqui descrita, `jsantillana/gemma-4-26B-A4B-it-abliterated-v3`, es un fine-tune no oficial del modelo base instruction-tuned de Google. El termino "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones para reducir las negativas del modelo a ciertas peticiones. No es un lanzamiento oficial de Google y no cuenta con validacion por parte del equipo original.

Es relevante para desarrolladores que necesitan un modelo multimodal con contexto largo, soporte nativo de function calling y capacidad de razonamiento configurable, en un formato que puede desplegarse en estaciones de trabajo con GPU consumer de gama alta. La licencia Apache 2.0 declarada facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Mixture-of-Experts (MoE) con atencion hibrida (sliding window local + global) y vision encoder |
| Parametros totales | 25.805.936.206 (25,8B segun safetensors; 25,2B segun model card) |
| Parametros activos | 3,8B |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | mas de 140 idiomas (segun model card del modelo base); lista concreta no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia oficial de Gemma 4) |
| Formato de pesos | safetensors (repo de 51,6 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 30 capas, 128 expertos totales de los cuales 8 se activan por token mas 1 experto compartido. La atencion es hibrida: intercala capas de atencion local con ventana deslizante de 1.024 tokens y capas de atencion global completa, garantizando que la ultima capa siempre sea global. Las capas globales usan claves y valores unificados y Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. Incorpora un encoder de vision de aproximadamente 550 millones de parametros para el procesamiento de imagenes.

Segun la documentacion del modelo base, Gemma 4 se entrena con soporte nativo del rol `system`, modos de razonamiento (thinking) configurables y function calling nativo. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO. El fine-tune "abliterated" aplicado por jsantillana modifica las activaciones para reducir rechazos, pero no se documentan en la model card la metodologia exacta, el dataset usado ni las metricas de evaluacion del proceso de ablacion.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Comprension de imagenes con soporte de relacion de aspecto y resolucion variables.
- Procesamiento de video (segun la familia Gemma 4; no se detalla para esta variante concreta).
- Generacion de codigo y matematicas con mejoras notables en benchmarks de coding respecto a generaciones anteriores.
- Function calling / tool calling nativo, orientado a flujos agenticos.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidades multilingues en mas de 140 idiomas.
- Razonamiento multi-paso y flujos agenticos autonomos.
- Al ser una variante "abliterated", presenta menor tasa de rechazos ante peticiones que el modelo base rechazaria; esta capacidad no esta cuantificada en la informacion disponible.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede recibir capturas de pantalla o fotos de productos junto con texto y mantener conversaciones multi-turno gracias a la ventana de 256K tokens, adecuado para historiales largos de soporte.
- Generacion de codigo en produccion: con function calling nativo y contexto de 256K, puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests o analisis de repositorios completos.
- Analisis de documentos extensos con imagenes: procesamiento de informes, facturas o articulos cientificos que combinan texto e imagenes en una sola pasada, sin necesidad de trocear el contenido.
- Agentes autonomos de navegacion o RPA: el soporte de tool calling y razonamiento multi-paso permite orquestar llamadas a APIs y tomar decisiones encadenadas.
- Asistentes de accesibilidad: descripcion de imagenes y video en tiempo real en aplicaciones de asistencia visual, con despliegue en estaciones de trabajo con GPU consumer.
- Traduccion y localizacion multilingue: cobertura de mas de 140 idiomas con contexto largo para mantener coherencia terminologica en documentos extensos.
- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar el comportamiento del modelo sin las capas de rechazo, util para auditorias de sesgos y robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona mejoras en benchmarks de coding y capacidades agenticas, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otros) para el modelo 26B A4B ni para esta variante abliterated.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB para los pesos completos (25,8B parametros x 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomienda 64-80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 26-30 GB, viable en una RTX 4090 (24 GB) solo con cuantizaciones de 4 bits o con offloading parcial.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 13-16 GB, cabe en RTX 4090, RTX 4080 Super (16 GB) y GPUs con 16 GB o mas.
- GPU recomendadas: A100 80GB o H100 para BF16 sin cuantizar; RTX 4090, L40S o A6000 para cuantizaciones de 8 bits; RTX 4090 o 4080 para 4 bits.
- Al ser MoE con solo 3,8B parametros activos, el throughput por token es mas alto que el de un modelo denso de 25B, aunque el requisito de memoria viene determinado por los parametros totales.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servicio en produccion; llama.cpp u Ollama requeririan conversion a GGUF, no disponible en el repo.
- Latencia y throughput concretos: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (este) | 25,8B / 3,8B | 256K | Texto, imagen | Apache 2.0 | Hugging Face (fine-tune no oficial) |
| Gemma 4 31B Dense | 30,7B / denso | 256K | Texto, imagen | Apache 2.0 | Hugging Face (oficial) |
| Gemma 4 12B Unified | 11,95B / denso | 256K | Texto, imagen, audio | Apache 2.0 | Hugging Face (oficial) |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face (oficial) |

Frente al 31B Dense, el 26B A4B ofrece menor coste de inferencia por token (3,8B activos frente a 30,7B) a cambio de una ligera reduccion de parametros totales. Frente al 12B Unified, gana capacidad y mantiene el contexto de 256K, pero pierde el soporte de audio nativo. Los datos de rendimiento comparado entre estas variantes no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Fine-tune no oficial: no ha sido validado por Google DeepMind ni por el equipo de Gemma; su calidad y estabilidad no estan garantizadas.
- La ablacion de rechazos puede incrementar la probabilidad de generar contenido danino, sesgado o inapropiado en produccion; requiere filtros y moderacion externos.
- Riesgo de alucinacion inherente a los modelos generativos, no cuantificado para esta variante.
- No se documentan los sesgos especificos introducidos o amplificados por el proceso de abliteration.
- La licencia Apache 2.0 declarada remite a la licencia oficial de Gemma 4; conviene revisar los terminos de uso del modelo base para uso comercial, ya que pueden incluir restricciones adicionales de uso aceptable.
- El repo no incluye cuantizaciones GGUF ni pesos en otros formatos, lo que limita el despliegue en llama.cpp u Ollama sin conversion manual.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en comunidad ni de validacion externa.
- El soporte de audio no esta presente en esta variante (solo texto e imagen), a diferencia de los modelos E2B, E4B y 12B.
- No se dispone de informacion sobre el dataset de ablacion, la metodologia exacta ni metricas de evaluacion del fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/gemma-4-26B-A4B-it-abliterated-v3
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion oficial: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
