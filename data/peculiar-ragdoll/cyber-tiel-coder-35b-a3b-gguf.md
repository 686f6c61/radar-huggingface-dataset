# peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF

## Resumen

Cyber-Tiel-Coder-35B-A3B-GGUF (denominado "CyberTiel" en su model card) es una cuantización GGUF de un modelo de lenguaje de arquitectura MoE con aproximadamente 34.660 millones de parámetros totales, publicado por el usuario peculiar-ragdoll. Deriva de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez es una versión "abliterated" (con los mecanismos de rechazo suprimidos) del modelo Ornith-1.5-35B-A3B de ornith-ai. El autor añade una cuantización dinámica con una matriz imatrix propia ("cyber-weighted") y una plantilla de chat denominada Sharp.

El modelo está orientado a codificación agéntica y a seguridad ofensiva. En la información disponible se afirma que resuelve aproximadamente un 70 % más de problemas reales de programación que Ornith-1.5 y Qwen3.6-35B-A3B, y que lo hace entre 3 y 4 veces más rápido que un modelo denso de 3.800 a 27.000 millones de parámetros. Soporta entrada de imagen (pipeline image-text-to-text), lo que lo sitúa como un MoE multimodal, aunque la model card no detalla la arquitectura de la torre de visión.

Su relevancia actual reside en dos factores: por un lado, ofrece capacidad de codificación agéntica en un paquete de 22 GB en cuantización de 4 bits, apto para hardware de consumo con VRAM limitada; por otro, es un modelo sin censura explícitamente orientado a tareas de ciberseguridad ofensiva, con 0 % de rechazos en HarmBench. La licencia es MIT y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) de tipo transformer; etiqueta `qwen35moe` en HuggingFace; soporte multimodal image-text-to-text |
| Parametros totales | 34.660.610.688 (aprox. 34,66 mil millones), medidos sobre los pesos safetensors del modelo base |
| Parametros activos | Aproximadamente 3.000 millones por token segun la nomenclatura "A3B" del nombre; el valor exacto no esta disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix dinamica ("cyber-weighted") y estrategia unsloth-dynamic; se confirma cuantizacion Q4 de 22 GB; el resto de niveles no esta detallado |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); existen variantes MLX (oQ4e) y variantes MTP en repos separados |

Otros datos: repositorio de 225,1 GB (incluye todos los niveles de cuantizacion), 2.651 descargas y 9 "likes" en el momento de la consulta. Fechas de creacion y ultima actualizacion declaradas: 2026-09-08 y 2026-09-10.

## Arquitectura y entrenamiento

La informacion disponible es limitada en cuanto al preentrenamiento original. El modelo es una mezcla de expertos (MoE) del tipo Qwen3.5 (`qwen35moe`), con unos 34,66 mil millones de parametros totales y aproximadamente 3.000 millones activos por token, lo que explica la denominacion "A3B". El pipeline declarado es image-text-to-text, de modo que el modelo incorpora capacidades de vision, si bien no se especifica el codificador visual ni la resolucion de imagen admitida. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

Sobre esta base, el autor aplica un proceso de abliteracion heredado de huihui-ai (supresion de las direcciones de activacion asociadas al rechazo) y despues una cuantizacion dinamica con una matriz imatrix propia, descrita como "cyber-weighted", junto con la plantilla de chat Sharp incluida en el propio GGUF. El autor sostiene que el equilibrio entre la pequena corrupcion introducida por la abliteracion y la optimizacion del imatrix se traduce en una mejora neta tanto en SWE-bench-Live como en Cybench. Se ofrecen variantes MTP (multi-token prediction) en repositorios separados, tanto GGUF como MLX, lo que sugiere soporte de decodificacion especulativa en esas versiones.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Codificacion agentica: resolucion autonoma de incidencias y bugs en bases de codigo grandes, segun la evaluacion en SWE-bench-Live.
- Tareas de ciberseguridad ofensiva sin rechazos: captura de flags en 15 de las 43 tareas de Cybench en modo no guiado (35 %).
- Entrada multimodal de imagen (pipeline image-text-to-text); el alcance exacto de las capacidades de vision no esta documentado en la informacion disponible.
- Uso de herramientas y flujos agente: la etiqueta `agentic-coding` y la plantilla de chat Sharp apuntan a este uso, aunque no se documenta el formato exacto de function calling.
- Razonamiento multi-paso en entornos de agentes, con menos tokens de deliberacion que Ornith-1.5 y Qwen3.6-35B-A3B, lo que se traduce en mayor velocidad.
- Modo "sin rechazo": 0 % de rechazos sobre 84 peticiones de HarmBench, doce por cada una de sus siete categorias.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).

## Casos de uso

- Reparacion automatica de bugs en produccion: el modelo puede integrarse en un agente que reciba una incidencia, localice el fichero afectado, proponga un parche y lo valide contra la suite de tests, ya que su evaluacion principal (SWE-bench-Live) mide exactamente esa capacidad sobre repositorios reales con tests de regresion ocultos.
- Auditorias de seguridad ofensiva autorizadas: con 15 de 43 retos de Cybench resueltos sin pistas, resulta util para equipos de red team que necesiten un asistente local para analisis de vulnerabilidades, siempre dentro de un entorno aislado y con autorizacion explicita.
- Desarrollo asistido en local con VRAM limitada: la cuantizacion Q4 ocupa 22 GB, de modo que un equipo con una unica GPU de 24 GB o 32 GB puede ejecutar un MoE de 34,66 mil millones de parametros sin depender de la nube.
- Pipelines de CI/CD con generacion de codigo: el modelo puede conectarse via llama.cpp a un servicio interno que revise pull requests, genere tests o complete refactorizaciones de bajo riesgo, con la ventaja de la licencia MIT para uso comercial.
- Agentes de automatizacion de terminal y sistemas: su perfil de codificacion agentica y su tolerancia a peticiones habitualmente rechazadas lo hacen adecuado para scripts de administracion, analisis de logs y tareas de scripting en entornos controlados.
- Procesamiento de capturas y diagramas tecnicos: al aceptar entrada de imagen, puede recibir capturas de trazas de error o diagramas de arquitectura y generar codigo o explicaciones a partir de ellos, aunque la profundidad de esta capacidad no esta documentada.
- Investigacion sobre alineacion y abliteracion: como modelo abliterated con metricas comparables frente a su version censurada (TielCoder), sirve como sujeto de estudio para medir el efecto de la supresion de rechazos en tareas de codigo y conocimiento general.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| SWE-bench-Live | Aproximadamente un 70 % mas de problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B; no se publica el valor absoluto | Medido a 4 bits; el autor indica que la mejora es unas 7 veces mayor que el salto generacional de Qwen3.5-35B-A3B a Qwen3.6 |
| Velocidad en codificacion agentica | 3-4 veces mas rapido que un modelo denso de 3.800 a 27.000 millones de parametros | Datos del autor, sin metodologia detallada |
| Cybench (no guiado) | 15 de 43 flags capturadas (35 %) | CTF agente sin pistas ni juez |
| HarmBench | 0 % de rechazos sobre 84 peticiones (12 por cada una de 7 categorias) | Categorias: ciberdelito e intrusion, quimico/biologico, ilegal, acoso, desinformacion, copyright y dano general |
| MMLU-Pro | Igual puntuacion que TielCoder; no se publica la cifra | El autor reconoce una perdida de conocimiento general frente a modelos no especializados |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM para cuantizacion Q4: 22 GB de pesos, segun la model card. Con contexto y cache KV hay que anadir overhead, por lo que se recomienda un minimo practico de 24 GB (estimacion, no confirmada por el autor).
- Otras cuantizaciones: no disponibles en detalle; el repositorio completo ocupa 225,1 GB, lo que indica la presencia de multiples niveles, presumiblemente desde Q2 hasta Q8.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4 con contexto moderado; RTX 5090 (32 GB) o A100 40 GB para mayor margen de contexto; H100 80 GB para despliegues con lotes grandes o cuantizaciones altas.
- Cabe en GPU de consumo: si, en Q4 sobre tarjetas de 24 GB o mas, con margen limitado para el contexto.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para el formato GGUF; existen versiones MLX para Apple Silicon y variantes MTP con decodificacion multi-token. No se confirma compatibilidad con vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles como cifras absolutas. La unica referencia es relativa, 3-4 veces mas rapido que un denso de 3.800 a 27.000 millones de parametros en codificacion agentica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B | 34,66 mil millones totales, aprox. 3 mil millones activos | no disponible | Cybench 15/43; ~70 % mas de problemas resueltos en SWE-bench-Live que Ornith-1.5 | MIT | GGUF, MLX y variantes MTP en HuggingFace |
| TielCoder 35B-A3B | Misma base y tamano | no disponible | Misma puntuacion en MMLU-Pro que CyberTiel; se desconoce su tasa de rechazo en HarmBench | no disponible | GGUF |
| Ornith-1.5-35B-A3B | 35B-A3B | no disponible | Referencia base; resuelve aproximadamente un 70 % menos de problemas reales de codigo | no disponible | HuggingFace |
| Qwen3.6-35B-A3B | 35B-A3B | no disponible | Mismo punto de comparacion que Ornith-1.5 en SWE-bench-Live | no disponible | HuggingFace |
| Nail-Qwen3.6-35B-A3B | 35B-A3B | no disponible | Mejor conocimiento general segun el autor; no especializado en codificacion ofensiva | no disponible | GGUF |

## Limitaciones y advertencias

- Modelo abliterated: puede generar contenido que otros modelos rechazan, incluidas conductas potencialmente danosas. El propio autor traslada al usuario toda la responsabilidad legal y etica del uso.
- Riesgo de seguridad en produccion: se recomienda ejecutarlo en sandbox, con monitorizacion y sin acceso a credenciales ni a sistemas criticos.
- Perdida deliberada de conocimiento general: el autor indica que sacrifica conocimiento del mundo por capacidad de codigo y velocidad, y que para trivia o examenes conviene usar otro modelo como Nail-Qwen3.6-35B-A3B.
- Corrupcion por abliteracion: la supresion de rechazos introduce una degradacion pequena del modelo original, que el autor considera compensada por la cuantizacion, pero que puede manifestarse en tareas fuera del dominio de codigo.
- Cobertura idiomatica limitada: solo ingles y chino declarados; no hay garantia de calidad en castellano.
- Contexto no documentado: se desconoce la ventana de contexto real, lo que dificulta planificar casos de uso con historiales largos.
- Licencia MIT: permite uso comercial, pero el aviso del autor exige responsabilidad plena sobre el contenido generado; conviene revisar tambien las condiciones del modelo base de huihui-ai.
- Benchmarks no reproducibles: las cifras de SWE-bench-Live y velocidad provienen del autor, sin valores absolutos ni metodologia publicada.
- Fecha de publicacion declarada en 2026: los datos de creacion y actualizacion del repositorio son coherentes con esa fecha, pero no se dispone de mas contexto temporal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Version MTP GGUF: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Version MLX: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Version MLX MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Hermano censurado (TielCoder): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Alternativa orientada a conocimiento general: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
