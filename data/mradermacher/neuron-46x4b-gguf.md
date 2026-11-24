# mradermacher/Neuron-46x4B-GGUF

## Resumen

Neuron-46x4B-Instruct es un modelo de lenguaje conversacional desarrollado por Neura Tech AI, distribuido en formato GGUF por el usuario mradermacher. El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 46 expertos de 4B de parametros cada uno, aunque la informacion disponible no confirma explicitamente esta estructura. El recuento real de parametros en los pesos safetensors es de 125.058.592.256 (aproximadamente 125B), lo que resulta coherente con una arquitectura MoE de gran escala donde solo una fraccion de los expertos se activa por token.

El modelo esta disenado para instrucciones y conversacion multilingue, con soporte declarado para 24 idiomas, incluyendo ingles, chino, hindi, arabe, japones, coreano, las principales lenguas europeas, turco, vietnamita, tailandes, indonesio, malayo, bengali, urdu, tamil, telugu, marathi, gujarati, punjabi y persa. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que la version GGUF cuantizada permite ejecutar un modelo de 125B parametros en hardware de consumo mediante cuantizaciones agresivas (desde Q2_K de 45,6 GB hasta Q8_0 de 133 GB), algo impensable con los pesos originales en safetensors. No obstante, la ausencia de benchmarks publicados y de documentacion tecnica detallada en la informacion disponible limita la evaluacion rigurosa de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere MoE con 46 expertos de 4B; sin confirmar) |
| Parametros totales | 125.058.592.256 (125B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en repositorio i1 |
| Idiomas soportados | en, zh, hi, ar, ja, ko, fr, de, es, pt, it, ru, tr, vi, th, id, ms, bn, ur, ta, te, mr, gu, pa, fa (24 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El nombre "46x4B" sugiere una estructura de mezcla de expertos con 46 expertos de aproximadamente 4B de parametros cada uno, lo que daria un total cercano a los 184B si todos fueran independientes; sin embargo, el recuento real de parametros safetensors es de 125B, lo que indica que parte de los pesos se comparten (atencion, embeddings, capas densas comunes). Esta deduccion es especulativa y no esta confirmada por el autor.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO o tecnicas de alineacion, ni innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La model card del repositorio GGUF es una plantilla generica de mradermacher centrada en las instrucciones de descarga y uso de las cuantizaciones, sin informacion tecnica del modelo original.

## Capacidades

- Generacion de texto conversacional e instrucciones: el sufijo "Instruct" indica ajuste fino para seguir instrucciones en formato de dialogo.
- Soporte multilingue amplio: 24 idiomas declarados, incluyendo lenguas con alfabetos no latinos (arabe, hindi, bengali, tamil, telugu, urdu, persa).
- Conversacion multi-turno: etiqueta "conversational" en los metadatos del repositorio.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integracion con infraestructuras de inferencia tipo Hugging Face Inference Endpoints.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Atencion al cliente multilingue: el modelo puede gestionar conversaciones en 24 idiomas, lo que permite desplegar un unico sistema para mercados con alfabetos y familias linguisticas diversas (arabe, hindi, tailandes, etc.) sin necesidad de modelos separados por region.
- Asistencia en escritura y traduccion: con soporte para lenguas europeas, asiaticas meridionales y de Oriente Medio, resulta adecuado para tareas de parafrasis, resumen y traduccion asistida entre pares de idiomas cubiertos.
- Despliegue en hardware limitado mediante cuantizacion: la version Q4_K_M (75,9 GB) permite ejecutar un modelo de 125B en estaciones de trabajo con 2-3 GPU de 48 GB o en configuraciones de memoria unificada, algo imposible con los pesos completos.
- Prototipado e investigacion en entornos sin acceso a infraestructura de datacenter: las cuantizaciones Q2_K (45,6 GB) y Q3_K_S (54,0 GB) hacen viable la experimentacion en servidores con 64-80 GB de VRAM total.
- Generacion de contenido editorial en varios idiomas: redaccion de borradores, resumenes y adaptaciones culturales para publicaciones dirigidas a audiencias en los 24 idiomas soportados.
- Integracion en pipelines de inferencia locales: el formato GGUF es compatible con llama.cpp, Ollama y otros runners que permiten ejecucion en CPU/GPU hibrida, util para entornos air-gapped o con requisitos de privacidad estrictos.
- Evaluacion comparativa de modelos MoE de gran escala: sirve como referencia para estudiar el comportamiento de arquitecturas con muchos expertos bajo cuantizacion agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de archivo como referencia minima; la VRAM real necesaria suele ser algo superior por el contexto y los buffers de inferencia):
  - Q2_K: 45,6 GB
  - Q3_K_S: 54,0 GB
  - Q3_K_M: 59,8 GB
  - Q3_K_L: 64,8 GB
  - IQ4_XS: 67,4 GB
  - Q4_K_S: 71,1 GB
  - Q4_K_M: 75,9 GB
  - Q5_K_S: 86,2 GB
  - Q5_K_M: 88,9 GB
  - Q6_K: 102,7 GB (dividido en 3 partes)
  - Q8_0: 133,0 GB (dividido en 3 partes)
- GPU recomendadas: para Q4_K_M en adelante se requieren configuraciones multi-GPU (por ejemplo, 2x A100 80 GB o 2x H100 80 GB); para Q2_K y Q3_K es posible con 1x A100 80 GB o configuraciones de memoria unificada de 64-96 GB.
- GPU de consumo: ninguna GPU consumer individual (RTX 4090 con 24 GB, RTX 3090 con 24 GB) puede alojar el modelo completo. Es viable la ejecucion hibrida CPU+GPU con llama.cpp, aceptando latencias altas (del orden de segundos por token en funcion del ancho de banda de memoria).
- Opciones de despliegue: llama.cpp, Ollama, y runners compatibles con GGUF. Para los pesos originales en safetensors, vLLM o TGI si la arquitectura es compatible (no confirmado).
- Latencia y throughput: no disponibles. Con cuantizaciones Q2-Q3 en CPU se espera un throughput muy bajo; en multi-GPU con Q4-Q5 el rendimiento dependera de los parametros activos reales de la arquitectura MoE.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Neuron-46x4B-Instruct | 125B | No disponible | Apache 2.0 | Safetensors, GGUF | 24 idiomas; sin benchmarks publicados |
| Mixtral 8x7B | 46,7B | 32K | Apache 2.0 | Safetensors, GGUF | MoE con 8 expertos; benchmarks publicados |
| Qwen1.5-MoE-A2.7B | 14,3B (2,7B activos) | 32K | Apache 2.0 | Safetensors, GGUF | MoE con 60 expertos; benchmarks publicados |
| DeepSeek-V2-Lite | 15,7B (2,4B activos) | 32K | DeepSeek License | Safetensors | MoE con 64 expertos + 2 compartidos |

La comparacion es limitada porque no hay datos publicados de rendimiento para Neuron-46x4B. En terminos de tamano, se situa en la categoria de modelos MoE de gran escala (por encima de 100B totales), mas cercano a DeepSeek-V2 (236B) o Mixtral 8x22B (141B) que a los MoE ligeros. La licencia Apache 2.0 es mas permisiva que la de DeepSeek-V2 y equivalente a la de Mixtral.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas con datos objetivos.
- Falta de documentacion tecnica: se desconoce la longitud de contexto, los parametros activos, la composicion del dataset y el proceso de alineacion, lo que dificulta estimar su comportamiento en produccion.
- Riesgo de alucinacion: sin datos de evaluacion de fidelidad, debe asumirse un riesgo estandar o superior al de modelos con alineacion documentada.
- Sesgos desconocidos: no se ha publicado informacion sobre sesgos linguisticos, culturales o de genero, ni sobre mitigaciones aplicadas.
- Idiomas de bajos recursos: aunque se declaran 24 idiomas, la calidad en lenguas como punjabi, gujarati o telugu puede ser notablemente inferior a la del ingles o el chino, sin datos que lo confirmen.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma significativa; para uso en produccion se recomienda Q4_K_M o superior, lo que eleva los requisitos de hardware.
- Modelo base de origen incierto: el repositorio original (Neura-Tech-AI/Neuron-46x4B-Instruct) no aporta model card detallada en la informacion disponible; conviene verificar su procedencia y reproducibilidad antes de usarlo en entornos criticos.
- Compatibilidad de inferencia: no esta confirmado que la arquitectura sea soportada por vLLM o TGI; la ruta segura es llama.cpp/Ollama con GGUF.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de garantias y de documentacion sobre el entrenamiento traslada al integrador la responsabilidad de validacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Neuron-46x4B-GGUF
- Modelo base: https://huggingface.co/Neura-Tech-AI/Neuron-46x4B-Instruct
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Neuron-46x4B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Neuron-46x4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
