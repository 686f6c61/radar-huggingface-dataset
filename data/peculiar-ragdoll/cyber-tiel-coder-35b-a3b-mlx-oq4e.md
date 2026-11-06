# peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e

## Resumen

Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e es una cuantizacion en 4 bits para Apple Silicon (formato MLX, cuantizador oQ de oMLX) de un modelo MoE de 35B parametros totales, derivado de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez es una version sin censura (abliterated) de Ornith-1.5-35B-A3B. El autor del empaquetado es peculiar-ragdoll, que lo comercializa bajo el nombre CyberTiel como un coder agentico especializado en tareas de seguridad ofensiva y programacion autonoma. La licencia es MIT y el checkpoint incluye pesos safetensors en formato MLX de aproximadamente 22 GB.

El modelo resuelve el problema de ejecutar un MoE de 35B en hardware de consumo con memoria unificada limitada, manteniendo capacidad de coding agentico. Segun la model card, la cuantizacion se realizo con el cuantizador oQ4e de oMLX sobre un corpus de calibracion propio ponderado hacia tareas de ciberseguridad, y el checkpoint incorpora la plantilla de chat Sharp dentro de los pesos. La arquitectura declarada es qwen3_5_moe, con vision (pipeline image-text-to-text) y capacidades conversacionales.

Es relevante ahora porque combina tres tendencias: la popularizacion de MoE dispersos de ~35B con pocos parametros activos, la demanda de modelos sin rechazos para trabajo de seguridad ofensiva y pentesting, y el ecosistema MLX para inferencia local en Mac. No obstante, el propio autor advierte que los benchmarks publicados se midieron sobre la build GGUF (UD-Q4_K_M con k-quants de llama.cpp), no sobre este fichero MLX, por lo que los numeros deben interpretarse como evidencia sobre el modelo y no como medicion de esta cuantizacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo qwen3_5_moe (transformer con mezcla de expertos), multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQ4e de oMLX, con imatrix y calibracion propia); existe build hermano oQ6e a 6 bits (~30 GB) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), libreria mlx; build GGUF disponible por separado |
| Tamano del repo | 84,9 GB (el checkpoint MLX declarado ocupa ~22 GB) |
| Vision | si (pipeline image-text-to-text) |
| Modelo base | huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de la familia qwen3_5_moe, con 35B parametros totales y activacion dispersa (la etiqueta A3B apunta a unos 3B activos por token, aunque el dato exacto no se detalla). El modelo es multimodal: procesa imagen y texto como entrada y genera texto, segun el pipeline image-text-to-text y el tag vision. Sobre el entrenamiento original de Ornith-1.5 no se aporta informacion en la documentacion disponible: no se indica numero de tokens, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica de este fichero concreto esta en el proceso de cuantizacion y ajuste: el autor toma los pesos abliterated de huihui-ai, los recuantiza con el cuantizador oQ4e de oMLX aplicando una imatrix derivada de un corpus de calibracion propio con peso hacia tareas de ciberseguridad, y embebe la plantilla de chat Sharp en el checkpoint. La abliteration elimina la direccion de rechazo del modelo base, lo que produce un comportamiento sin negativas ante peticiones que otros modelos bloquean. No se documentan tecnicas como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento general, con especializacion declarada en coding agentico.
- Resolucion autonoma de issues y bugs en bases de codigo grandes (orientado a SWE-bench-Live).
- Capacidades de seguridad ofensiva: el autor reporta 15 de 43 retos CTF de Cybench resueltos en modo no guiado (35%).
- Vision: entrada image-text-to-text, con soporte de imagenes junto a texto.
- Tool calling y function calling: no se detalla explicitamente en la informacion disponible, aunque el enfoque agentic-coding lo presupone.
- Razonamiento multi-paso y uso como agente: si, orientado a tareas autonomas de programacion.
- Multilingue limitado: solo ingles y chino declarados.
- Modo sin censura: 0 rechazos en las 84 peticiones de HarmBench reportadas por el autor.
- Plantilla de chat Sharp incluida en el checkpoint.

## Casos de uso

- Pentesting y seguridad ofensiva autorizada: el modelo mantiene capacidad de razonamiento sobre vectores de ataque sin rechazos, lo que permite usarlo en entornos de laboratorio y CTF con sandboxing estricto; el autor reporta un 35% de exito en Cybench no guiado.
- Resolucion autonoma de bugs en repositorios grandes: adecuado para pipelines que reciben un issue, localizan el fallo y proponen un parche, con validacion posterior mediante tests de regresion.
- Asistente de coding en local sobre Mac: al ocupar ~22 GB en 4 bits, cabe en equipos Apple Silicon con memoria unificada de 32 GB o superior, sin depender de la nube.
- Analisis de capturas y diagramas: gracias a la entrada multimodal, puede interpretar imagenes de pantalla, diagramas de red o trazas para generar explicaciones o codigo asociado.
- Automatizacion de tareas de refactorizacion: su velocidad declarada (3-4x mas rapido que un dense de 3.8-27B en resolución agentica) lo hace util para iteraciones largas sobre codebases.
- Investigacion sobre alineacion y abliteration: sirve como objeto de estudio para medir como la eliminacion de la direccion de rechazo afecta a capacidades y sesgos, comparandolo con la variante censurada TielCoder.
- Generacion de herramientas internas de seguridad: scripting de reconocimiento, parseo de resultados y generacion de PoC en entornos controlados y auditados.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a la build GGUF (UD-Q4_K_M), no a este fichero MLX. Se presentan como evidencia sobre el modelo, con la advertencia explicita de que cambiar de cuantizador altera los resultados.

| Benchmark | Resultado reportado | Notas |
|---|---|---|
| SWE-bench-Live | ~70% mas problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B | Medido en GGUF UD-Q4_K_M |
| Cybench (unguided) | 15/43 flags (35%) | CTF agentico sin pistas ni juez |
| HarmBench | 0% de rechazos (84 peticiones, 7 categorias) | Comportamiento abliterated |
| MMLU-Pro | Igual que TielCoder; inferior a modelos generalistas | Sacrificio deliberado de conocimiento del mundo |
| Velocidad agentica | 3-4x mas rapida que un dense de 3.8-27B | Segun el autor |

No se han publicado valores absolutos de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 22 GB para el checkpoint MLX de 4 bits; se recomienda al menos 32 GB de memoria unificada para dejar margen al contexto y al KV cache.
- Hardware objetivo: Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4 en configuraciones con 32 GB o mas). No esta pensado para GPU NVIDIA.
- Cabe en consumer hardware: si, en Mac con memoria unificada suficiente; no en GPUs de consumo con 24 GB o menos en esta variante MLX.
- Despliegue: libreria mlx (mlx-lm / mlx-vlm por la parte de vision); para el equivalente GGUF, llama.cpp u Ollama con la build correspondiente.
- Alternativa de mayor precision: build oQ6e a 6 bits (~30 GB), que requiere 48 GB o mas de memoria unificada.
- Latencia y throughput: no disponibles de forma cuantificada; el autor afirma ventaja de 3-4x frente a dense de 3.8-27B en tareas agenticas, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B (este) | 35B MoE | no disponible | Coding agentico sin censura, vision | MIT | MLX 4/6 bits y GGUF |
| Tiel-Coder-35B-A3B | 35B MoE | no disponible | Variante censurada del mismo linaje | MIT | MLX y GGUF |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35B MoE | no disponible | Base abliterated sin ajuste de coder | no disponible | safetensors |
| Ornith-1.5-35B-A3B | 35B MoE | no disponible | Modelo original, menos especializado en coding | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35B MoE | no disponible | Generacional generalista, mas conocimiento del mundo | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo abliterated: elimina los rechazos de forma deliberada y puede producir contenido danino; el autor traslada toda la responsabilidad al usuario y exige sandboxing y monitorizacion.
- Alucinacion: el propio autor reconoce un sacrificio de conocimiento del mundo (MMLU-Pro bajo), lo que incrementa el riesgo de respuestas factualmente incorrectas fuera del dominio de codigo.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta garantizado ni evaluado.
- Los benchmarks publicados no corresponden a este fichero MLX sino a la build GGUF; el autor menciona diferencias de hasta dos digitos porcentuales en recuento de tokens entre ambas.
- Contexto maximo no documentado: no se puede planificar el uso con ventanas largas sin verificacion empirica.
- Uso comercial: la licencia MIT lo permite, pero el uso en produccion con contenido generado sin filtros puede implicar riesgos legales y de reputacion; conviene revision humana y politicas de uso.
- Vision y plantilla de chat: la plantilla Sharp viene embebida, lo que puede complicar la integracion con frameworks que esperan plantillas estandar.
- Es una cuantizacion de terceros: no hay garantia de equivalencia numerica con el modelo base ni con la build GGUF.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Build GGUF: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Build MLX oQ6e: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e
- Variante censurada TielCoder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original Ornith-1.5: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo generalista del mismo autor: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
