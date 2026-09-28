# dopaemon/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP

## Resumen

Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP es una cuantizacion de 6 bits en formato MLX de un modelo MoE de aproximadamente 36.000 millones de parametros totales, derivado de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez es una version sin censura (abliterated) de Ornith-1.5-35B-A3B. Lo publica el usuario dopaemon en Hugging Face y esta orientado a codigo agentico sobre Apple Silicon, con licencia MIT.

La pieza diferencial frente al build plano oQ6e es que incorpora una cabeza de prediccion multi-token (MTP) injertada, pensada para decodificacion especulativa en runtimes que la soportan, ademas de una plantilla de chat propia (Sharp) y un proceso de cuantizacion oQ de oMLX calibrado con un corpus especifico de seguridad ofensiva. El modelo es multimodal de entrada (image-text-to-text), aunque solo declara soporte de ingles y chino.

Su relevancia actual radica en dos ejes: por un lado, ofrece capacidad de codigo agentico en un tamano que cabe en equipos de consumo con memoria unificada alta, y por otro, al estar abliterado, elimina los rechazos en tareas de seguridad ofensiva (0% de rechazos en HarmBench segun el autor), lo que lo posiciona como herramienta para red team y CTF, con los riesgos legales y eticos que eso conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo qwen3_5_moe (transformer con mezcla de expertos), con cabeza MTP injertada |
| Parametros totales | 35.951.822.704 (~36B) |
| Parametros activos | ~3B (denominacion A3B; cifra derivada del nombre del modelo, no confirmada en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (6 bits, cuantizador oQ de oMLX); existe build GGUF del mismo modelo en UD-Q4_K_M |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria mlx); tamano de repo 31,2 GB |

## Arquitectura y entrenamiento

Se trata de un transformer de arquitectura MoE (mezcla de expertos) de la familia Qwen3.5, con unos 36.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, lo que le permite una velocidad de inferencia propia de un modelo denso mucho mas pequeno. Sobre el checkpoint base abliterado se aplican tres modificaciones: recuantizacion a 6 bits con el cuantizador oQ de oMLX usando un corpus de calibracion ponderado hacia ciberseguridad, sustitucion de la plantilla de chat por la Sharp, y el injerto de una cabeza de prediccion multi-token para decodificacion especulativa. Segun el autor, los pesos son identicos byte a byte al build oQ6e sin MTP: la unica diferencia es el shard de la cabeza MTP y el flag de configuracion que la activa.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. Respecto al ajuste, la model card indica que fue "cyber-tuned" mediante el corpus de calibracion del cuantizador y la plantilla de chat, pero no detalla un pipeline de entrenamiento supervisado o de preferencias. La innovacion tecnica principal es la combinacion de decodificacion especulativa por MTP con cuantizacion de 6 bits casi sin perdida en Apple Silicon.

## Capacidades

- Generacion de texto y razonamiento general en ingles y chino.
- Codigo agentico: resolucion autonoma de issues y bugs en repositorios grandes (evaluado con SWE-bench-Live).
- Seguridad ofensiva: resuelve tareas de CTF sin guia (15 de 43 tareas de Cybench, 35%).
- Ausencia de rechazos: 0% de rechazos en HarmBench segun la model card del autor.
- Multimodal de entrada: pipeline image-text-to-text, admite imagenes junto a texto.
- Tool calling y uso en agentes: las etiquetas del repositorio incluyen agentic-coding y el modelo se distribuye con la plantilla de chat Sharp, orientada a flujos de agente.
- Decodificacion especulativa: soporte de cabeza MTP para acelerar la generacion en runtimes compatibles (oMLX).
- Capacidades multilingues limitadas a ingles y chino segun los metadatos; el comportamiento en castellano no esta documentado.

## Casos de uso

- Resolucion autonoma de bugs en produccion: integrado en un agente que lee el repositorio, localiza el fallo, propone un parche y lo valida contra la suite de tests, aprovechando su rendimiento medido en SWE-bench-Live sobre codigo real y reciente.
- Refactorizacion de codebases grandes: su ventana de contexto no esta documentada, pero el perfil agentico y la velocidad (3-4 veces mas rapido que un denso de 27-38B en tareas de codigo segun el autor) lo hacen adecuado para tareas iterativas sobre multiples ficheros.
- Red team y pentesting asistido: generacion de payloads, analisis de superficies de ataque y apoyo en ejercicios de CTF, ambitito donde el modelo no presenta rechazos y logra un 35% de exito sin guia en Cybench.
- Automatizacion de revision de codigo en CI/CD: el modelo puede actuar como revisor automatizado que comenta pull requests, detecta patrones inseguros y sugiere correcciones, con tool calling para consultar el repositorio.
- Asistente de desarrollo local en portatiles Apple Silicon: al estar en formato MLX de 6 bits y ~31 GB, permite trabajar sin conexion en un Mac Studio o MacBook Pro de gama alta, sin enviar codigo propietario a servicios externos.
- Analisis de capturas y diagramas tecnicos: gracias a su soporte image-text-to-text, puede interpretar diagramas de arquitectura o capturas de errores y traducirlos a explicaciones o parches.
- Generacion de scripts de explotacion en laboratorio aislado: para formacion en seguridad, con el modelo ejecutandose en sandbox y supervision humana, dado que su politica de rechazos es practicamente inexistente.

## Benchmarks y rendimiento

La model card advierte explicitamente de que las cifras fueron medidas sobre el build GGUF en su nivel UD-Q4_K_M con k-quants de llama.cpp, no sobre este fichero MLX oQ6e, por lo que deben leerse como evidencia sobre el modelo y no como medicion de esta cuantizacion. No se han publicado resultados de benchmarks numericos completos (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| SWE-bench-Live | ~70% mas de problemas reales resueltos que Ornith-1.5 y Qwen3.6-35B-A3B | Medido a 4 bits sobre el build GGUF; sin cifra absoluta publicada |
| Cybench (unguided, sin pistas ni juez) | 15/43 flags capturadas (35%) | Sobre el build GGUF |
| HarmBench | 0% de rechazos | Sobre el build GGUF; numero total de peticiones truncado en la model card |
| Velocidad agentica | 3-4x mas rapido que un denso de 3.8-27B | Declaracion cualitativa del autor |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~31 GB solo para pesos en oQ6e, mas overhead de contexto y cache KV; se recomienda un minimo de 36-48 GB de memoria unificada.
- Compatibilidad: exclusivamente Apple Silicon, ya que el formato es MLX (libreria mlx). No esta pensado para GPU NVIDIA o AMD.
- Equipos recomendados: Mac Studio o MacBook Pro con M-series Max/Ultra de 48 GB o mas; en configuraciones de 36 GB el margen es muy justo.
- Cabe en GPU de consumo: no en el sentido habitual, ya que requiere memoria unificada de Apple; no cabe en una RTX 4090 de 24 GB en este formato.
- Runtime recomendado: oMLX, que segun el autor ejecuta correctamente la cabeza MTP. El build GGUF equivalente (Cyber-Tiel-Coder-35B-A3B-GGUF) es el recomendado para LM Studio y llama.cpp.
- Advertencia critica de runtime: no ejecutar este build MLX con MTP en LM Studio; el motor MLX de LM Studio malinterpreta la cabeza MTP y produce salida completamente corrupta desde el primer token, en cualquier prompt y con cualquier configuracion.
- Latencia y throughput: no disponibles como cifras concretas; el autor solo indica una ventaja de 3-4x frente a densos de 27-38B en tareas de codigo agentico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | ~36B totales, ~3B activos | no disponible | ~70% mas de problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B en SWE-bench-Live; 35% en Cybench | MIT | Hugging Face, formato MLX (oMLX) |
| Ornith-1.5-35B-A3B (y su version abliterated de huihui-ai) | ~36B totales, ~3B activos | no disponible | Referencia base; resuelve ~40% menos problemas reales que CyberTiel segun el autor | no disponible en la informacion proporcionada | Hugging Face |
| Qwen3.6-35B-A3B | ~36B totales, ~3B activos | no disponible | Nivel similar a Ornith-1.5 en el benchmark citado | no disponible en la informacion proporcionada | Hugging Face |
| Tiel-Coder-35B-A3B-MLX-oQ4e | ~36B totales, ~3B activos | no disponible | Alternativa censurada del mismo autor | no disponible en la informacion proporcionada | Hugging Face |
| Denso de 3.8-27B | 3,8-27B | no disponible | 3-4x mas lento que CyberTiel en tareas agenticas segun el autor | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo abliterated: los rechazos estan practicamente eliminados (0% en HarmBench), por lo que puede generar contenido danino, ilegal o inseguro. El usuario asume toda la responsabilidad legal y etica, y debe ejecutarlo en sandbox con supervision.
- Riesgo elevado de uso dual: el propio autor lo compara con un cuchillo, utilizable como herramienta o como arma segun el contexto.
- Sesgos: no hay informacion publicada sobre evaluaciones de sesgo, toxicidad o equidad en la informacion disponible.
- Alucinacion: no se aportan datos de tasas de alucinacion; en tareas de seguridad ofensiva o de codigo, una alucinacion puede traducirse en exploits o parches incorrectos.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta documentado ni validado.
- Contexto: la longitud de contexto no se especifica en la model card; conviene verificarla antes de disenar flujos con documentos largos.
- Restricciones de licencia: aunque la licencia es MIT, el modelo base es una derivacion abliterated de un tercero, por lo que la cadena de licencias y las condiciones del modelo original deben revisarse antes de uso comercial.
- Incompatibilidad de runtime: el build MLX con MTP falla de forma catastrófica en LM Studio. Verificar siempre el runtime antes de desplegar.
- Trazabilidad de benchmarks: las cifras publicadas corresponden al build GGUF a 4 bits, no a este fichero de 6 bits; los resultados pueden variar con el cuantizador.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente.
- Posible inconsistencia de autoria: el ID apunta al usuario dopaemon mientras la model card referencia repositorios del usuario peculiar-ragdoll.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dopaemon/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Build MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e
- Build GGUF (recomendado para LM Studio y llama.cpp): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Variante censurada TielCoder MLX oQ4e: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Resultados de busqueda web: no se han encontrado resultados relevantes sobre el modelo; las busquedas devolvieron unicamente contenido no relacionado.
