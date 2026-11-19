# mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored es un ajuste fino (finetune) del modelo Qwen3.8 de 27B de parámetros, desarrollado por DavidAU y cuantizado a formato GGUF por mradermacher. El modelo se presenta como una variante "uncensored" y "heretic", es decir, con los mecanismos de rechazo y alineación de seguridad reducidos o eliminados, orientada a usos creativos, roleplay, escritura de ficción y tareas generales sin las restricciones típicas de los modelos alineados.

El modelo base declarado es `DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored`, un finetune multi-etapa sobre Qwen3.8 que incorpora lo que el autor denomina "Cold Fusion", "GAIN Training" y "Multi-stage tuning", junto con un conjunto de modos de razonamiento e instrucción (27 reasoning modes, 27 instruct modes) y "AI Constructs" especializados (Agent, Coder, Universal Teacher, Brainstorm, entre otros). El repositorio cuantizado incluye pesos GGUF en múltiples niveles de compresión, desde Q2_K hasta Q8_0, además de un proyector multimodal (mmproj) que sugiere capacidades de visión.

Con 27.320.697.856 parámetros reales en safetensors, el modelo se posiciona en la franja de 27B, un tamaño que permite despliegue en GPUs de consumo con cuantizaciones agresivas (Q4_K_M ~16,9 GB) y en GPUs profesionales con cuantizaciones altas. La licencia Apache 2.0 facilita su uso comercial, aunque las características "uncensored" y "heretic" introducen consideraciones éticas y de cumplimiento relevantes para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8; detalles específicos no disponibles) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/bfloat16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que deriva de Qwen3.8 y que el modelo base se distribuye en bfloat16. El autor del finetune declara un entrenamiento multi-etapa ("Multi-stage tuning") con técnicas denominadas "Cold Fusion" y "GAIN Training", sobre los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

El modelo incorpora un conjunto de "modos" declarados en las etiquetas: 27 reasoning modes, 27 instruct modes, 9 Xhigh reasoning modes, 15 AI Constructs, 5 Super AI Constructs y 21 AGI Constructs, con constructos especializados como Agent, Coder, Universal Teacher y Brainstorm. Estos modos parecen ser variantes de comportamiento activadas mediante prompting o plantillas específicas, aunque la model card no documenta el mecanismo técnico exacto. La presencia de archivos mmproj (proyector multimodal) indica soporte de entrada de imágenes en el modelo base, aunque no se detalla la arquitectura del codificador visual.

## Capacidades

- Generación de texto general y conversacional multi-turno.
- Razonamiento explícito con modos "thinking" y "reasoning" (27 reasoning modes, 9 Xhigh reasoning modes).
- Modos de instrucción directa (27 instruct modes) para respuestas sin cadena de pensamiento.
- Escritura creativa: ficción, relato, poesía, guiones y "all genres" según el autor.
- Roleplay y conversación de personajes.
- Generación de código (constructo "Coder AI Construct").
- Capacidades de agente y razonamiento multi-paso (constructo "Agent AI Construct").
- Soporte multimodal de entrada mediante proyector mmproj (visión), según los archivos incluidos.
- Multilingüe en 16 idiomas declarados (ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi).
- Comportamiento "uncensored": menor probabilidad de rechazo ante peticiones sensibles.
- Constructos especializados: Brainstorm, Brainstorm Business, Universal Teacher, entre otros.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Escritura de ficción y narrativa: el modelo está ajustado para "all genres", story, writing y fiction, por lo que puede generar relatos largos, diálogos y descripciones con coherencia estilística; útil para autores que necesitan borradores rápidos o variaciones de trama.
- Roleplay y chatbots de personaje: los modos de instrucción y el ajuste "uncensored" permiten conversaciones de personaje sin los rechazos típicos de modelos alineados, adecuado para plataformas de entretenimiento conversacional.
- Generación de código en pipelines de desarrollo: el constructo "Coder AI Construct" y el soporte de tool calling (si el modelo base lo hereda) permiten integrarlo en asistentes de IDE o revisión de código, aunque conviene validar la calidad real con pruebas propias.
- Agentes autónomos y razonamiento multi-paso: el "Agent AI Construct" y los modos de razonamiento extendido permiten encadenar pasos para tareas de planificación, extracción de datos o automatización de flujos, ejecutables localmente con llama.cpp u Ollama.
- Asistencia educativa: el "Universal Teacher AI Construct" está orientado a explicaciones didácticas y tutoría, con capacidad multilingüe para atender a estudiantes en 16 idiomas.
- Brainstorming y generación de ideas de negocio: los constructos "Brainstorm" y "Brainstorm Business" permiten sesiones de ideación estructurada, útil en consultoría o marketing.
- Procesamiento de documentos con imágenes: gracias al proyector mmproj, puede describir o extraer información de capturas y figuras en flujos de digitalización.
- Despliegue local con privacidad: al ser GGUF y caber en GPUs de consumo en Q4, permite inferencia en estaciones de trabajo sin enviar datos a la nube, relevante para sectores con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF):
  - Q2_K: ~11,0 GB
  - Q3_K_S: ~12,4 GB; Q3_K_M: ~13,6 GB; Q3_K_L: ~14,7 GB
  - IQ4_XS: ~15,5 GB; Q4_K_S: ~15,9 GB; Q4_K_M: ~16,9 GB
  - Q5_K_S: ~19,1 GB; Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - Proyector multimodal: mmproj-Q8_0 ~0,7 GB; mmproj-f16 ~1,0 GB
- GPUs recomendadas:
  - Consumer: RTX 4090 (24 GB) admite hasta Q6_K con holgura y Q8_0 con offloading parcial; RTX 4080/4070 Ti Super (16 GB) admiten Q4_K_M justo; RTX 3090 (24 GB) similar a 4090 en VRAM.
  - Profesionales: A100 40/80 GB, H100 80 GB para Q8_0 o bfloat16 completo sin cuantizar (el modelo base en bf16 requeriría ~55 GB).
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (~16,9 GB) cabe en GPUs de 24 GB y, con offloading parcial a RAM, en GPUs de 16 GB. Q2_K (~11 GB) cabe en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (koboldcpp, entre otros). Para el modelo base sin cuantizar, vLLM o TGI con safetensors.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored (este) | 27,3B | no disponible | Apache 2.0 | GGUF, safetensors | Finetune uncensored multi-modo, 16 idiomas, multimodal |
| Qwen3.8-27B (base, si existe publicación oficial) | ~27B | no disponible | no disponible | no disponible | Modelo base del que deriva; sin datos verificados en esta ficha |
| Gemma 2 27B | 27B | 8K | Gemma License | safetensors, GGUF | Modelo denso de Google, contexto corto, licencia restrictiva |
| Mistral Small 24B | 24B | 128K | Apache 2.0 | safetensors, GGUF | Contexto largo, licencia permisiva, sin variante uncensored oficial |

La comparativa se limita a modelos de tamaño similar; no se dispone de datos de rendimiento comparativo para este finetune concreto, por lo que la elección debe basarse en pruebas propias.

## Limitaciones y advertencias

- Modelo "uncensored" y "heretic": reduce deliberadamente los rechazos de seguridad, por lo que puede generar contenido sensible, ofensivo o inexacto sin advertencia. No recomendado para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo elevado de alucinación: los finetunes creativos y multi-modo tienden a priorizar fluidez y estilo sobre veracidad; no apto para tareas factuales críticas sin verificación.
- Longitud de contexto no documentada: no se puede garantizar el manejo de contextos largos; conviene probar el límite real antes de usarlo en producción.
- Idiomas: aunque la model card declara 16 idiomas, el campo `language` del repositorio solo indica `en`; la calidad en el resto de idiomas no está verificada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre posibles sesgos heredados del base.
- Los "modos" y "constructos" no están documentados técnicamente en la model card; su funcionamiento depende de plantillas de prompt no especificadas, lo que dificulta la reproducibilidad.
- El repositorio ocupa 190,8 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.
- Fecha de creación futura (2026-11-05) en los metadatos: posible inconsistencia del repositorio que conviene verificar antes de confiar en los datos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
