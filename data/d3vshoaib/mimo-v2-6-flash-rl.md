# D3vShoaib/MiMo-V2.6-Flash-RL

## Resumen

MiMo-V2.6-Flash-RL es un modelo multimodal de gran tamano publicado por Xiaomi (organizacion XiaomiMiMo) y reempaquetado en el repositorio `D3vShoaib/MiMo-V2.6-Flash-RL`. Segun la model card, se trata del checkpoint "efficiency-balanced" de la serie MiMo-V2.6, disenado para escalar reinforcement learning con el objetivo declarado de auto-mejora continua: escalado de computo de RL, diversidad de entornos y computo del evaluador de forma conjunta. Su propuesta diferencial es integrar texto, imagen, video y audio en un unico modelo con una ventana de contexto de 1M tokens, pensada para repositorios largos, trazas de herramientas y ejecuciones de agente multi-sesion.

La arquitectura es un Mixture of Experts disperso (Sparse MoE) con atencion hibrida que combina sliding window attention y capas full attention, un codificador de vision MiMo ViT de 681M parametros, un codificador de audio compuesto por un AudioTokenizer de 308M y un patch encoder de 127M, y un decodificador especulativo Multi-Token Prediction (MTP) de 5 capas. La model card declara 309B parametros totales con 15B activos, mientras que el recuento real de safetensors del repositorio indica 159.358.725.504 parametros: existe por tanto una discrepancia no resuelta entre ambas cifras que conviene verificar antes de planificar despliegues.

El modelo es relevante por su enfoque de entrenamiento: una unica ejecucion mixta de RL ("You Only RL Once") sobre tareas de codigo, agentes generales, vision y ciberseguridad, con GRPO asincrono sobre lotes de 1.568 prompts x 16 rollouts por paso, un esquema de evaluacion agentica por grupos (GRS y GAR) y una fase posterior de destilacion on-policy multi-profesor (MOPD2). Su licencia MIT y la publicacion de pesos en safetensors facilitan la experimentacion, aunque el repositorio analizado es un espejo de terceros con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE (Mixture of Experts) con backbone de atencion hibrida (SWA + full attention) |
| Parametros totales | 309B segun la model card; 159.358.725.504 segun safetensors del repositorio (discrepancia sin resolver) |
| Parametros activos | 15B (segun la model card; solo aplica si es MoE) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit / FP8 (pesos publicados); no se indican GGUF ni otras cuantizaciones |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (con codigo personalizado, requiere `trust_remote_code`) |
| Modalidades | Texto, imagen, video y audio |
| Codificador de vision | MiMo ViT de 681M parametros (28 capas: 24 SWA + 4 full) |
| Codificador de audio | AudioTokenizer de 308M + patch encoder de 127M |
| Decodificador especulativo | Multi-Token Prediction (MTP) de 5 capas |
| Tamano del repositorio | 177,8 GB |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El modelo combina un backbone transformer disperso tipo MoE con un patron de atencion hibrida que alterna capas de sliding window attention (SWA) y capas de atencion completa. Esta mezcla es la que permite sostener una ventana de 1M tokens sin que el coste de atencion crezca de forma cuadratica en todas las capas. A ello se suman tres componentes especializados: un ViT de 681M parametros para vision (24 capas SWA y 4 full), un front-end de audio formado por un AudioTokenizer de 308M y un patch encoder de 127M, y un decodificador especulativo MTP de 5 capas que acelera la generacion aceptando multiples tokens por paso. La model card no detalla el numero de capas del backbone ni el numero de expertos por capa.

En cuanto al entrenamiento, la informacion disponible describe un pipeline de RL en varias fases. La primera es un arranque en frio con auto-correccion: el modelo reflexiona y reescribe sus propios turnos desalineados. Despues se ejecuta una unica corrida mixta de RL (codigo, agentes generales, vision y ciberseguridad) con GRPO asincrono sobre lotes de 1.568 prompts x 16 rollouts por paso, procesando miles de millones de tokens por actualizacion. La senal de recompensa se escala mediante dos mecanismos: Groupwise Reward Synthesis (GRS), que construye rubricas especificas por tarea a partir de rollouts contrastados y las fusiona con resultados de tests, y Groupwise Advantage Redistribution (GAR), que ordena online las trayectorias que superan la prueba y desplaza la ventaja hacia las soluciones de mayor calidad. Finalmente, la destilacion MOPD2 combina rollouts autonomos del estudiante con rollouts de un solo turno condicionados por prefijo (Teacher-Prefix y SFT-Prefix) reutilizando historiales, lo que permite entrenar puntos de decision sin regenerar los turnos previos.

## Capacidades

- Generacion de texto conversacional multi-turno con hasta 1M tokens de contexto.
- Comprension de imagenes y video mediante el codificador MiMo ViT de 681M parametros.
- Procesamiento de audio (entrada) mediante AudioTokenizer y patch encoder dedicados.
- Razonamiento de agente de horizonte largo: la model card menciona explicitamente "long repositories, tool traces and multi-session agent runs".
- Uso de herramientas y ejecucion en entornos: el modelo se evalua en Toolathlon-Verified, AutomationBench, Terminal Bench, OSWorld-Verified y JobBench, lo que indica soporte practico de tool calling y control de terminal/escritorio.
- Generacion y modificacion de codigo en repositorios reales (DeepSWE v1.1, ProgramBench, MiMo Code Bench).
- Tareas de ciberseguridad ofensiva/defensiva evaluadas en CyberGym y MiMo Cyber Bench.
- Decodificacion especulativa integrada via MTP de 5 capas, orientada a reducir latencia y tokens por tarea.
- Multilingue limitado a ingles y chino.
- Modo de pensamiento explicito: no confirmado en la informacion disponible (el pipeline declarado es text-generation y la card describe RL con reflexion y auto-correccion, pero no se especifica un "thinking mode" conmutable).

## Casos de uso

- Agentes de codigo sobre repositorios completos: con 1M tokens de contexto y entrenamiento en DeepSWE, el modelo puede cargar arboles de codigo extensos, trazas de herramientas y multiples sesiones para resolver tareas de refactorizacion o correccion sin perder el hilo entre iteraciones.
- Automatizacion de terminal y escritorio: los resultados en Terminal Bench 2.1 (87,6) y OSWorld-Verified (80,8) sugieren que puede operar como agente que ejecuta comandos, interpreta salidas y corrige su plan en entornos reales.
- Orquestacion de herramientas empresariales: las puntuaciones en Toolathlon-Verified (73,6) y AutomationBench v1.0.6 (52,3) apuntan a su uso en pipelines que encadenan APIs, bases de datos y servicios internos con verificacion intermedia.
- Analisis de documentos y video combinados: al integrar vision y video en el mismo modelo, puede resumir grabaciones de reuniones, extraer acciones a partir de frames y texto superpuesto, o auditar material audiovisual sin cambiar de modelo.
- Asistencia tecnica multi-turno con historial largo: la ventana de 1M tokens permite mantener conversaciones de atencion al cliente o soporte interno con todo el historial de tickets, manuales y logs en el mismo contexto.
- Auditoria de seguridad y respuesta a incidentes: su evaluacion en CyberGym (95,1) y MiMo Cyber Bench (77,2) lo hace candidato para triaje de alertas, analisis de trazas y generacion de pruebas de concepto en entornos controlados.
- Investigacion en RL y auto-mejora: al estar bajo licencia MIT y publicarse pesos en safetensors, sirve como base para reproducir esquemas de GRPO asincrono, rubricas por grupo (GRS/GAR) y destilacion MOPD2.
- Procesamiento de audio transcrito y enriquecido: transcripcion y anotacion de audio combinada con contexto textual largo para generar actas o indices de contenido.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo (recogidos como referencia; el autor del modelo es la fuente). No hay columna propia para "MiMo-V2.6-Flash-RL": la columna "MiMo-V2.6 Flash" es la que corresponde a este checkpoint.

| Benchmark | MiMo-V2.6 Pro | MiMo-V2.6 Flash | MiMo-V2.5 Pro | Claude Opus 5 | GPT-5.6 Sol | Claude Fable 5 |
|---|---|---|---|---|---|---|
| DeepSWE v1.1 | 71,9 | 67,9 | 19,0 | 74,0 | 73,0 | 70,0 |
| ProgramBench | 26,5 | 26,0 | 12,5 | 37,0 | 25,0 | 33,0 |
| MiMo Code Bench | 63,2 | 61,2 | 40,4 | 68,6 | 59,3 | - |
| AutomationBench v1.0.6 | 53,1 | 52,3 | 16,0 | 50,3 | 45,8 | 46,2 |
| Toolathlon-Verified | 76,9 | 73,6 | 49,1 | 80,6 | 74,9 | 77,9 |
| GDPval-AA 2.1 | 1673 | - | 1107 | 1708 | 1588 | 1595 |
| Agents' Last Exam | 31,6 | 27,6 | 13,2 | 31,6 | 30,8 | 25,7 |
| Terminal Bench 4.0 | 34,9 | 28,8 | 1,5 | 49,0 | 39,9 | 42,4 |
| Terminal Bench 2.1 | 89,9 | 87,6 | 65,2 | 89,1 | 88,8 | 84,3 |
| OSWorld-Verified | 82,0 | 80,8 | - | 83,4 | 83,0 | 86,0 |
| JobBench | 62,0 | 61,2 | 25,0 | 65,7 | 45,4 | 57,4 |
| CyberGym | 94,0 | 95,1 | 40,0 | - | - | - |
| MiMo Cyber Bench | 80,2 | 77,2 | 0,0 | - | - | - |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, MMLU-Pro, MATH, etc.) en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros y del formato publicado; no estan confirmadas en la informacion proporcionada y deben validarse con la configuracion real del modelo.

- Pesos publicados: repositorio de 177,8 GB en safetensors, coherente con un checkpoint en FP8/8-bit. Asumiendo 159,36B parametros, FP8 ocupa del orden de 160 GB y BF16 del orden de 320 GB. Si se confirma la cifra de 309B parametros de la model card, FP8 seria del orden de 310 GB y BF16 del orden de 620 GB.
- VRAM minima para inferencia: aproximadamente 180 GB en FP8 (159B) o 330 GB en FP8 (309B), sin contar cache KV. Con cuantizacion de 4 bits las cifras bajan a unos 80-90 GB (159B) o 155-170 GB (309B).
- GPU recomendadas: 8x H100 80 GB o 8x A100 80 GB para FP8 con contexto amplio; 4x H200 141 GB como alternativa; para 4 bits, 2x H100 80 GB (159B) o 4x H100 80 GB (309B).
- GPU de consumo: no cabe en una unica GPU de consumo. En 4 bits necesitaria del orden de 80-90 GB, por lo que requeriria 4x RTX 4090 (96 GB) o 2x RTX 6000 Ada (96 GB) como minimo, y ello con contexto muy reducido.
- Cache KV: no disponible. La ventana de 1M tokens con atencion hibrida (SWA + full) reduce el coste frente a atencion densa completa, pero no se publican cifras de memoria por token ni configuracion de cabezas/capas.
- Opciones de despliegue: al ser un modelo con `custom_code`, requiere `trust_remote_code=True`. Contenedores habituales como vLLM o SGLang son las rutas esperadas para servirlo en FP8; llama.cpp/Ollama solo serian viables si existieran conversiones GGUF, que no se anuncian. TGI no esta confirmado para esta arquitectura hibrida.
- Latencia y throughput: no disponibles. El decodificador especulativo MTP de 5 capas deberia reducir la latencia por token respecto a decodificacion autoregresiva pura, pero no se publican mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento de referencia |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL | 309B totales / 15B activos (card); 159,36B en safetensors | 1M tokens | MIT | Pesos safetensors en HF (espejo de terceros, 0 descargas) | DeepSWE v1.1 67,9; Terminal Bench 2.1 87,6; CyberGym 95,1 |
| MiMo-V2.6-Pro-RL | No disponible | 1M tokens (serie V2.6) | No disponible en la informacion | Pesos en HF oficial XiaomiMiMo | DeepSWE v1.1 71,9; Terminal Bench 4.0 34,9; GDPval-AA 2.1 1673 |
| MiMo-V2.5-Pro | No disponible | No disponible | No disponible | Pesos en HF | DeepSWE v1.1 19,0; Terminal Bench 2.1 65,2; AutomationBench 16,0 |
| Claude Opus 5 | No disponible (propietario) | No disponible | Propietaria | Solo API | DeepSWE v1.1 74,0; Terminal Bench 4.0 49,0; OSWorld-Verified 83,4 |
| GPT-5.6 Sol | No disponible (propietario) | No disponible | Propietaria | Solo API | DeepSWE v1.1 73,0; Terminal Bench 4.0 39,9; OSWorld-Verified 83,0 |

La comparativa directa contra alternativas open source del mismo rango de parametros (por ejemplo, familias MoE abiertas de ~100-300B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card afirma 309B totales / 15B activos, mientras que el recuento de safetensors del repositorio es de 159.358.725.504 parametros. Cualquier presupuesto de hardware debe resolverse antes de desplegar.
- Repositorio espejo de terceros: `D3vShoaib/MiMo-V2.6-Flash-RL` no es la cuenta oficial (`XiaomiMiMo`). No hay garantia de que los pesos coincidan con los originales ni de que no hayan sido modificados. Cero descargas y cero likes en el momento de la ficha implican ausencia de validacion comunitaria.
- Ejecucion de codigo personalizado: el tag `custom_code` obliga a cargar codigo remoto con `trust_remote_code=True`, lo que introduce riesgo de ejecucion arbitraria. Conviene auditar el codigo antes de usarlo en produccion.
- Cobertura idiomatica limitada: la model card solo declara ingles y chino. El castellano no esta soportado oficialmente y su rendimiento no esta documentado.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones de factualidad. En tareas de ciberseguridad o agentes con acceso a sistemas reales, un error de planificacion puede tener consecuencias operativas.
- Sesgos: no se documenta ningun analisis de sesgo demografico, cultural o politico. El entrenamiento esta orientado a dominios tecnicos (codigo, agentes, ciberseguridad), lo que puede degradar el rendimiento fuera de ellos.
- Benchmarks autoinformados: todas las cifras proceden de la model card del fabricante, sin verificacion independiente, y en varios casos las columnas de comparacion son de modelos propietarios sin informacion de configuracion de evaluacion.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial, modificacion y redistribucion, pero la licencia del espejo puede no reflejar la del modelo original ni cubrir los componentes de terceros empaquetados.
- Coste de contexto: aunque la ventana es de 1M tokens, no se publican mediciones de degradacion con contexto muy largo ni curvas de rendimiento por longitud. La efectividad real a 1M tokens no esta verificada.
- Riesgo de reward hacking: la propia model card menciona mecanismos de "environment hardening, adversarial screening and verifier cross-checks" para contenerlo, lo que implica que el problema existe y requiere mitigaciones activas.
- Fechas inconsistentes: la fecha de creacion del repositorio (2026-09-21) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia de los enlaces y artefactos.

## Enlaces

- Repositorio HuggingFace analizado: https://huggingface.co/D3vShoaib/MiMo-V2.6-Flash-RL
- Repositorio oficial del modelo: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Repositorio oficial de la variante Pro: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Informe tecnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Blog de la serie: https://mimo.xiaomi.com/mimo-v2-6
- Plataforma API: https://platform.xiaomimimo.com
- Studio web: https://aistudio.xiaomimimo.com
- Aplicacion de escritorio: https://mimo.xiaomimimo.com/desktop/
- Repositorio GitHub de la familia MiMo: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo MiMo-V2.6-Flash-RL (contenido sobre visores de historias de Instagram en aleman) y no se han incluido por no ser relevantes.
