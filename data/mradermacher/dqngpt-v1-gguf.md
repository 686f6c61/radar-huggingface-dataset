# mradermacher/dqnGPT-v1-GGUF

## Resumen

dqnGPT-v1 es un modelo de lenguaje de tipo transformer con arquitectura MoE (mixture of experts) y aproximadamente 7.500 millones de parametros totales, desarrollado por DQN Labs AI. La model card lo etiqueta como un modelo de 8B con arquitectura MoE, orientado a uso general, asistencia conversacional, razonamiento, capacidades multimodales y personalidad marcada. Esta ficha describe la version cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y entornos compatibles como Ollama o LM Studio.

La relevancia de esta publicacion radica en que facilita el despliegue local de un modelo de ~7,5B parametros con licencia Apache 2.0, sin necesidad de GPUs de datacenter. El repositorio GGUF incluye un abanico amplio de cuantizaciones estaticas (desde Q2_K hasta f16), lo que permite ajustar el equilibrio entre calidad y consumo de memoria segun el hardware disponible.

No se dispone de informacion publica detallada sobre el contexto maximo, la composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada. La model card del repositorio cuantizado es fundamentalmente una guia de descarga y uso de los ficheros GGUF, no una ficha tecnica completa del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun etiquetas de la model card |
| Parametros totales | 7.518.069.290 (~7,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio cuantizado); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

La model card etiqueta el modelo como MoE y lo asocia a la familia Gemma (tags `gemma`, `gemma4`, `8b`, `moe`), lo que sugiere una arquitectura derivada o inspirada en dicha familia, con mezcla de expertos para reducir el coste de inferencia respecto a un modelo denso del mismo tamano. El dato de parametros totales confirmado por safetensors es de 7.518.069.290. No se especifica el numero de parametros activos por token, el numero de expertos, la dimension del contexto ni la composicion del dataset de entrenamiento.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la mezcla de datos, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). Las etiquetas del repositorio mencionan capacidades multimodales y de razonamiento, pero no se aportan detalles tecnicos que permitan verificarlas.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en asistencia y personalidad marcada (tags `assistant`, `personality`, `conversational`).
- Razonamiento y capacidades multimodales declaradas en las etiquetas del repositorio, sin documentacion tecnica que las detalle.
- Generacion creativa (tag `creative`).
- Orientado a ejecucion local y eficiente (tags `local`, `efficient`, `small-model`).
- Compatibilidad con endpoints y entornos de inferencia local (tags `endpoints_compatible`, `localai`, `lmstudio`, `ollama`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio: no disponible (aunque la etiqueta `multimodal` aparece en el repositorio, no se documenta su alcance).

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un equipo de sobremesa con una GPU de consumo usando la cuantizacion Q4_K_M (~5,4 GB), lo que permite mantener conversaciones multi-turno sin enviar datos a servicios externos.
- Prototipado rapido de aplicaciones de chat: gracias a la licencia Apache 2.0 y al formato GGUF, se puede integrar en Ollama o LM Studio para validar flujos conversacionales antes de invertir en infraestructura.
- Generacion creativa de texto: las etiquetas `creative` y `personality` sugieren su uso en redaccion de borradores, guiones o contenido de ficcion en ingles.
- Experimentacion academica con arquitecturas MoE: investigadores pueden estudiar el comportamiento de un modelo MoE de ~7,5B parametros en entornos de recursos limitados, comparando cuantizaciones y su impacto en la calidad.
- Inferencia en el borde (edge) o en portatiles: las cuantizaciones Q2_K (~4,5 GB) y Q3_K_S (~4,8 GB) permiten ejecutar el modelo en equipos con 8 GB de VRAM o incluso en CPU con llama.cpp, util para demos offline.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes, lo que facilita medir la degradacion de perplejidad y calidad entre Q2_K y Q8_0 en un mismo modelo.
- Base para fine-tuning o destilacion: al estar bajo Apache 2.0 y disponible en safetensors en el repositorio original, puede servir como punto de partida para ajustes especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,5 GB
  - Q3_K_S: ~4,8 GB
  - Q3_K_M: ~5,0 GB
  - Q3_K_L: ~5,1 GB
  - IQ4_XS: ~5,2 GB
  - Q4_K_S: ~5,3 GB
  - Q4_K_M: ~5,4 GB
  - Q5_K_S: ~5,8 GB
  - Q5_K_M: ~5,9 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,2 GB
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060 de 12 GB o superior permite ejecutar Q4_K_M y Q5_K_M con margen para contexto; una RTX 4090 (24 GB) permite Q8_0 e incluso f16 con contexto amplio. Para despliegues en servidor, A100 o H100 son sobredimensionadas para este tamano, salvo por concurrencia.
- Cabe en GPU de consumo: si. Cualquier GPU con 6 GB o mas puede ejecutar cuantizaciones Q3/Q4; con 8 GB se cubre Q4_K_M y Q5_K_M; con 12 GB se llega a Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, LocalAI y cualquier runtime compatible con GGUF. El repositorio tambien es compatible con `transformers` para el modelo base.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la cuantizacion y el backend; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion rigurosa con alternativas. A continuacion se comparan unicamente los datos objetivos disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dqnGPT-v1 (GGUF) | ~7,5B (MoE) | no disponible | Apache 2.0 | GGUF | Esta ficha |
| Modelos de la familia Gemma de ~7-8B | ~7-8B | no disponible en esta ficha | Terminos propios de Google | safetensors, GGUF | Referencia por la etiqueta `gemma` del repositorio |
| Mistral 7B | ~7,3B | 8K (version original) | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano similar |
| Llama 3.1 8B | ~8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alternativa densa de tamano similar |

La comparacion de rendimiento, calidad y contexto no puede realizarse con la informacion disponible.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- No se han publicado benchmarks, por lo que la calidad real del modelo es desconocida y no debe asumirse a partir de las etiquetas.
- Las etiquetas `multimodal` y `reasoning` no van acompanadas de documentacion tecnica; conviene tratarlas como no verificadas.
- La model card del repositorio cuantizado es una guia de descarga, no una ficha tecnica del modelo base; faltan datos esenciales como contexto, parametros activos y dataset.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluaciones publicadas no puede acotarse su magnitud.
- Sesgos conocidos: no documentados. Al entrenarse presumiblemente en ingles, puede reflejar sesgos culturales y linguisticos de esos datos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base (DQN-Labs-AI/dqnGPT-v1) por si impone condiciones adicionales.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El repositorio ocupa 75,3 GB, lo que exige espacio en disco considerable si se descargan varias cuantizaciones.
- No hay garantias de mantenimiento: el modelo base fue creado en abril de 2026 y el repositorio cuantizado se actualizo en noviembre de 2026, pero no se documenta soporte a largo plazo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/dqnGPT-v1-GGUF
- Modelo base: https://huggingface.co/DQN-Labs-AI/dqnGPT-v1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#dqnGPT-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
