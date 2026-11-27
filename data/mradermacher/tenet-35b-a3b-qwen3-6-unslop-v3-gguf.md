# mradermacher/Tenet-35B-A3B-Qwen3.6-Unslop-v3-GGUF

## Resumen

Tenet-35B-A3B-Qwen3.6-Unslop-v3 es un modelo de lenguaje de gran tamano con arquitectura de mezcla de expertos (MoE), derivado de la familia Qwen3.6 y afinado por mr-andrey-isachenko. La version aqui documentada es la cuantizacion GGUF estatica realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo combina 35.505.251.456 parametros totales con un esquema de activacion reducida (la nomenclatura A3B sugiere aproximadamente 3 mil millones de parametros activos por token), lo que lo situa en la categoria de MoE de gran capacidad pero coste de inferencia contenido.

El modelo se presenta como un afinamiento orientado a uso agentico, tool calling y generacion de codigo, con etiquetas que indican procesos de GRPO (optimizacion por politica relativa a grupo), "abliterated" y "uncensored", es decir, se ha reducido deliberadamente el comportamiento de rechazo del modelo base. Incorpora ademas un componente multimodal (archivos mmproj en formato GGUF), lo que sugiere capacidad de vision. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

Su relevancia actual radica en la disponibilidad de cuantizaciones GGUF estaticas (desde Q2_K de 13,3 GB hasta Q8_0 de 37,9 GB) que permiten desplegar un MoE de 35B en estaciones de trabajo con GPU de consumo, manteniendo capacidades de agente, herramientas y codigo. No obstante, la informacion publica disponible es escasa: no hay model card detallada del autor original, no se han publicado benchmarks y el repositorio tiene cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, derivada de Qwen3.6 (detalle de capas no disponible) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3B (segun nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Tamano del repositorio | 244,4 GB |
| Modelo base | mr-andrey-isachenko/Tenet-35B-A3B-Qwen3.6-Unslop-v3 |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) construida sobre la familia Qwen3.6, con 35.505 millones de parametros totales y un regimen de activacion reducida denotado por el sufijo A3B (aproximadamente 3 mil millones de parametros activos por token). No se dispone de informacion publica sobre el numero de expertos, el numero de expertos activados por token, la dimension oculta, el numero de capas ni la estrategia de enrutamiento. El modelo base incluye un componente multimodal, evidenciado por la presencia de archivos mmproj en la cuantizacion, lo que indica soporte de entrada de imagenes.

En cuanto al entrenamiento, las etiquetas del repositorio indican el uso de GRPO (Group Relative Policy Optimization) para el ajuste, asi como un proceso de "abliteration" orientado a eliminar los comportamientos de rechazo (uncensored). El termino "Unslop" sugiere un afinamiento para reducir respuestas genericas o excesivamente verbosas. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO adicionales. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-paso y comportamiento agentico (etiqueta "agentic").
- Tool calling y function calling (etiqueta "tool-use").
- Generacion de codigo (etiqueta "coding").
- Capacidad multimodal de vision, segun la presencia de archivos mmproj (alcance exacto no disponible).
- Comportamiento "uncensored" / "abliterated": menor tendencia a rechazar peticiones.
- Optimizado mediante GRPO para tareas con recompensa verificable.
- Soporte de despliegue en vLLM (etiqueta "vllm") y endpoints compatibles.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Agentes autonomos de automatizacion: el modelo puede encadenar llamadas a herramientas y razonamiento multi-paso, adecuado para orquestar flujos de trabajo con APIs externas gracias a su soporte de tool calling.
- Asistente de programacion en IDE: la etiqueta "coding" y el formato GGUF permiten integrarlo en entornos locales con llama.cpp u Ollama para autocompletado y generacion de codigo sin enviar datos a la nube.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (21,8 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, habilitando asistentes privados.
- Procesamiento de documentos con imagenes: el componente mmproj permite tareas de vision-lenguaje como extraccion de informacion de capturas o diagramas, aunque el alcance exacto no esta documentado.
- Investigacion sobre alineacion y seguridad: al ser un modelo "abliterated", resulta util para estudiar comportamientos sin rechazo y comparar con el modelo base alineado.
- Generacion de contenido conversacional en ingles a gran escala: su licencia Apache 2.0 permite uso comercial en productos de chat o atencion al cliente.
- Fine-tuning posterior: al publicarse pesos en safetensors en el modelo base y GGUF aqui, sirve como punto de partida para ajustes especificos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~13,3 GB; Q3_K_M ~17,3 GB; Q4_K_S ~20,5 GB; Q4_K_M ~21,8 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB. Anadir ~0,7-1,0 GB si se usa el componente multimodal (mmproj).
- GPU recomendadas: para Q4_K_M, GPUs con 24 GB de VRAM (RTX 3090, RTX 4090, A10G); para Q6_K y Q8_0, A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el modelo base soporta vLLM segun etiquetas.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B parametros activos, se espera un throughput superior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Tenet-35B-A3B-Qwen3.6-Unslop-v3 (este) | 35,5B | ~3B | No disponible | Apache 2.0 | GGUF, safetensors | Afinado agentico, uncensored, vision |
| Qwen3 MoE (familia base) | Variable | Variable | No disponible | Apache 2.0 (segun variante) | safetensors, GGUF | Modelo base de referencia; benchmarks no comparables sin datos |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF | MoE denso en activacion mayor; sin vision |
| DeepSeek-V2-Lite | 15,7B | ~2,4B | 32K | MIT (segun variante) | safetensors, GGUF | Menor tamano total; sin vision documentada |

La comparativa es orientativa: no se dispone de benchmarks del modelo evaluado, por lo que la comparacion de rendimiento no puede establecerse con rigor.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta verificado.
- El proceso "abliterated"/"uncensored" reduce los rechazos, lo que incrementa el riesgo de generar contenido inapropiado, danino o inexacto sin salvaguardas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- No hay benchmarks publicados ni model card detallada del autor original: la calidad real es dificil de verificar.
- Longitud de contexto no documentada, lo que limita la planificacion de casos de uso con contexto largo.
- El repositorio tiene cero descargas y una sola interaccion, lo que sugiere escasa validacion por la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base y sus datos de entrenamiento pueden tener obligaciones adicionales no documentadas.
- Las cuantizaciones estaticas (sin imatrix) pueden degradar la calidad en niveles bajos (Q2_K, Q3_K_M) de forma mas acusada que las cuantizaciones ponderadas.
- El componente multimodal requiere cargar archivos mmproj adicionales; su alcance y calidad no estan documentados.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Tenet-35B-A3B-Qwen3.6-Unslop-v3-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-35B-A3B-Qwen3.6-Unslop-v3
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Tenet-35B-A3B-Qwen3.6-Unslop-v3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
