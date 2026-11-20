# mradermacher/LFM2.5-24B-A2B-Uncensored-BF16-GGUF

## Resumen

LFM2.5-24B-A2B-Uncensored-BF16-GGUF es una cuantizacion estatica en formato GGUF del modelo LFM2.5-24B-A2B-Uncensored-BF16, publicada por el usuario mradermacher. Se trata de una variante "abliterated" o "uncensored" del modelo base Liquid LFM2.5, en la que se ha eliminado (o atenuado) la direccion de rechazo (refusal direction) para reducir las negativas del modelo ante determinadas peticiones. El modelo original pertenece a la familia LFM2.5 de Liquid AI, con arquitectura Mixture of Experts (MoE) y aproximadamente 23.970 millones de parametros totales, de los cuales solo una fraccion se activa por token (el sufijo A2B sugiere unos 2.000 millones de parametros activos, aunque este dato no se confirma en la informacion disponible).

El repositorio es una contribucion de cuantizacion: no entrena el modelo, sino que ofrece los pesos en diferentes niveles de compresion (de Q2_K a Q8_0) para facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo esta etiquetado como "agentic" y "tool-calling", lo que indica que el modelo base esta orientado a tareas de agentes y llamada a funciones, y soporta 16 idiomas segun la model card (ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano, vietnamita, tailandes, indonesio, hindi, ruso y polaco).

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una arquitectura MoE eficiente en computo, un proceso de "abliteration" que modifica el comportamiento de rechazo, y una distribucion en GGUF que permite ejecucion local. No obstante, la informacion publica es escasa: no hay benchmarks, no se detalla el proceso de entrenamiento ni el dataset, y la licencia lfm1.0 impone restricciones que deben revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer, segun tags del repositorio (no se detalla la configuracion interna) |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | no disponible (el sufijo A2B sugiere ~2B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio aparte |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (license: other, con license_link a LICENSE) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en BF16 |
| Tamano del repositorio | 163,0 GB |
| Modelo base | frstofrhx/LFM2.5-24B-A2B-Uncensored-BF16 |
| Descargas | 1.219 |
| Fecha de creacion | 2026-11-03 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que indican "moe" (Mixture of Experts) y "liquid", lo que vincula el modelo a la familia LFM (Liquid Foundation Models) de Liquid AI. El modelo base es una variante "Uncensored" de LFM2.5-24B-A2B, lo que implica que se ha aplicado una tecnica de "abliteration" o eliminacion de la direccion de rechazo sobre los pesos originales. Este proceso suele consistir en identificar la direccion en el espacio de activaciones asociada a las respuestas de rechazo y proyectarla fuera de los pesos, de modo que el modelo deja de negarse a responder ciertas peticiones.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla si el modelo base emplea innovaciones como atencion lineal, decodificacion especulativa o mecanismos hibridos SSM/transformer. El repositorio de cuantizacion no aporta datos adicionales sobre el entrenamiento: se limita a ofrecer los pesos convertidos a GGUF con distintos niveles de compresion, generados con un proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Razonamiento y tareas de agente: el modelo esta etiquetado como "agentic", lo que indica soporte para flujos de multiples pasos.
- Tool calling / function calling: etiqueta explicita "tool-calling" en el repositorio.
- Capacidades multilingues en 16 idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Comportamiento "uncensored"/"abliterated": se ha reducido la tendencia al rechazo, lo que amplia el rango de respuestas generadas.
- No se dispone de informacion sobre capacidades de vision, audio, modo "thinking" explicito ni decodificacion especulativa.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integracion con infraestructura de inferencia estandar.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (14,6 GB) y Q5_K_M (17,1 GB) permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM mediante llama.cpp, lo que facilita prototipado sin depender de la nube.
- Agentes autonomos con tool calling: la etiqueta "agentic" y "tool-calling" sugiere que el modelo puede orquestar llamadas a APIs y ejecutar flujos de multiples pasos, adecuado para automatizacion de tareas de back-office.
- Asistente conversacional multilingue: con 16 idiomas soportados, puede emplearse en atencion al cliente para mercados diversos, siempre que se valide la calidad por idioma (no hay benchmarks disponibles).
- Generacion de texto creativo sin filtros restrictivos: la variante "uncensored" resulta util en investigacion sobre sesgos, escritura de ficcion o generacion de contenido que los modelos alineados rechazan; requiere supervision humana.
- Investigacion sobre alineacion y seguridad: permite estudiar el efecto de la eliminacion de la direccion de rechazo comparando respuestas con el modelo base alineado.
- Prototipado de pipelines RAG: el formato GGUF y la compatibilidad con llama.cpp/Ollama facilitan integrar el modelo en sistemas de recuperacion aumentada con contexto local.
- Fine-tuning ligero sobre cuantizaciones: aunque el GGUF no es ideal para entrenamiento, las cuantizaciones Q8_0 (25,6 GB) permiten experimentar con LoRA en hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas. Tampoco se aportan datos de perplejidad por cuantizacion mas alla de la referencia grafica externa de ikawrakow sobre tipos de cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto ni KV cache):
  - Q2_K: ~8,9 GB
  - Q3_K_S: ~10,5 GB
  - Q3_K_M: ~11,6 GB
  - Q3_K_L: ~12,5 GB
  - IQ4_XS: ~13,0 GB
  - Q4_K_S: ~13,8 GB
  - Q4_K_M: ~14,6 GB
  - Q5_K_S: ~16,6 GB
  - Q5_K_M: ~17,1 GB
  - Q6_K: ~19,8 GB
  - Q8_0: ~25,6 GB
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se recomienda A100 40 GB, H100 o RTX 6000 Ada. Las cuantizaciones Q2_K y Q3_K pueden caber en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080).
- Cabe en GPU de consumo: si, al menos hasta Q5_K_M en GPUs de 24 GB; Q8_0 requiere 32 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El modelo base en BF16 puede servirse con vLLM o TGI, pero las cuantizaciones GGUF estan orientadas a llama.cpp.
- Latencia y throughput: no disponibles. Al ser un MoE con ~2B parametros activos (segun el sufijo A2B), el throughput por token deberia ser superior al de un modelo denso de 24B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Uncensored (este) | ~24B | no disponible (~2B por nombre) | no disponible | lfm1.0 | GGUF, BF16 | Variante abliterated, 16 idiomas, agentic/tool-calling |
| LFM2.5-24B-A2B (base, alineado) | ~24B | no disponible | no disponible | lfm1.0 | safetensors | Modelo original con alineacion de rechazo |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32k | Apache 2.0 | safetensors, GGUF | MoE denso con licencia permisiva, sin variante uncensored oficial |
| Qwen2.5-32B | ~32,5B | denso | 128k | Apache 2.0 | safetensors, GGUF | Denso, contexto largo, licencia permisiva |

La comparativa es orientativa: no se dispone de benchmarks del modelo LFM2.5-24B-A2B-Uncensored, por lo que no es posible comparar rendimiento real. La principal diferencia frente a Mixtral y Qwen2.5 es la licencia lfm1.0 (mas restrictiva que Apache 2.0) y el proceso de abliteration, que no tiene equivalente oficial en esos modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de rendimiento en tareas estandar, lo que impide evaluar su calidad frente a alternativas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa; la eliminacion de la direccion de rechazo puede aumentar la confianza en respuestas incorrectas.
- Comportamiento "uncensored": el modelo puede generar contenido sensible, ofensivo o inseguro. Requiere filtros externos y supervision humana en produccion.
- Sesgos desconocidos: no se documenta el dataset de entrenamiento ni los sesgos resultantes; la abliteration puede alterar el comportamiento en dominios sensibles de forma impredecible.
- Licencia lfm1.0: no es una licencia de codigo abierto permisiva; deben revisarse las restricciones de uso comercial, redistribucion y atribucion antes de desplegar el modelo en productos.
- Idiomas: aunque se listan 16, no hay garantia de calidad uniforme; el espanol figura entre los soportados, pero sin evaluacion publica.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Formato GGUF: las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q5_K_M o superior.
- Modelo derivado: la cuantizacion no ha sido validada por el autor original del modelo base; los errores de conversion son responsabilidad del cuantizador.
- Fecha de creacion futura (2026-11-03): dato anomalo en el repositorio que conviene verificar antes de confiar en la trazabilidad.

## Enlaces

- Repositorio Hugging Face (cuantizacion GGUF): https://huggingface.co/mradermacher/LFM2.5-24B-A2B-Uncensored-BF16-GGUF
- Modelo base: https://huggingface.co/frstofrhx/LFM2.5-24B-A2B-Uncensored-BF16
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-Uncensored-BF16-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LFM2.5-24B-A2B-Uncensored-BF16-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Liquid AI (desarrollador de la familia LFM): https://www.liquid.ai/
