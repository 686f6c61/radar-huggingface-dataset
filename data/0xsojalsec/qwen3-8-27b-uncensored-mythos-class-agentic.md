# 0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic

## Resumen

Qwen3.8-27B-Uncensored-Mythos-Class-Agentic es un checkpoint derivado publicado por el usuario 0xSojalSec sobre OBLITERATUS/Qwen3.8-27B-OBLITERATED, que a su vez parte de Qwen/Qwen3.8-27B. Se trata de un modelo de 27.781.427.952 parametros (aproximadamente 27,8B) en formato safetensors, con licencia Apache 2.0, pipeline de text-generation y soporte declarado para ingles, chino y arabe. La propuesta del autor es convertir un checkpoint "abliterated" (con los mecanismos de rechazo eliminados) en una configuracion apta para agentes: plantilla de chat Jinja2 completa, parser de razonamiento funcional y ejecucion nativa de tool calling.

El cambio principal respecto al checkpoint upstream no es de pesos, sino de configuracion y tokenizacion. Segun la model card, el checkpoint original arrastraba una plantilla de chat truncada de 506 bytes que provocaba la perdida silenciosa de mensajes con rol "tool" y de las llamadas a funciones, ademas de bucles infinitos de cadena de pensamiento por etiquetas de razonamiento invertidas. Esta version sustituye esa plantilla por una de 9,4 KB con 22 rutas de resolucion de tool calling y anade dos protocolos inyectados en el prompt de sistema: Mythos-Class Adversarial Self-Review y Hierarchical Task Tree Decomposition.

La relevancia del modelo esta en su orientacion a despliegues self-hosted con contexto largo: declara ventanas de hasta 262.144 tokens (256K nativos), con 131.072 tokens (128K) probados en produccion, y un techo de generacion de 16.384 tokens por turno. El repositorio pesa 55,6 GB y no incluye ramas GGUF: solo safetensors en BF16, FP8 y AWQ. Registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion independiente de sus afirmaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Los tags del repositorio mencionan "mamba" y "linear-attention" junto a "qwen3_5", lo que sugiere una arquitectura hibrida, pero la model card no documenta la arquitectura real |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8B) |
| Parametros activos | No aplica: no se declara que sea un modelo MoE |
| Longitud de contexto | 262.144 tokens (256K) declarados como maximo; 131.072 tokens (128K) probados en produccion; 32.768 tokens en el checkpoint upstream |
| Tipos de cuantizacion | BF16 (completa), FP8 (8 bits), AWQ (4 bits con MTP y kernel Marlin). No se distribuye GGUF |
| Idiomas soportados | Ingles (en), chino (zh), arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (29 shards en BF16, 2 shards en FP8) |
| Tamano del repositorio | 55,6 GB |
| Modelos base | OBLITERATUS/Qwen3.8-27B-OBLITERATED, Qwen/Qwen3.8-27B |
| Fecha de publicacion | 24 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento del modelo. Los tags del repositorio incluyen "mamba" y "linear-attention" ademas de "qwen3_5" y "qwen3.8", lo que apunta a una posible arquitectura hibrida con capas de atencion lineal, pero no hay confirmacion en la model card ni documentacion tecnica que lo respalde. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. Lo unico verificable es que el modelo deriva de una cadena de checkpoints: Qwen3.8-27B, despues OBLITERATUS/Qwen3.8-27B-OBLITERATED (proceso de "abliteration" que elimina las capas de rechazo) y finalmente este ajuste de configuracion.

La intervencion de este checkpoint se realiza sobre la plantilla de tokenizacion, no sobre los pesos. El autor inyecta en el prompt de sistema un protocolo de razonamiento con tres pasos (descomposicion de tareas, autorrevision adversarial y convergencia), junto con un esquema de ejecucion en arbol de tareas jerarquico. Segun la model card, este protocolo sustituye la plantilla truncada del upstream por una plantilla Jinja2 canonica de 9,4 KB que resuelve 22 rutas de tool calling, corrige las etiquetas de razonamiento invertidas que causaban bucles y eleva el techo de generacion por turno de 8.192 a 16.384 tokens. Tambien se documentan parametros de muestreo ajustados para evitar el bucle: temperatura 0,65, penalizacion de repeticion 1,15 y penalizacion de presencia 0,15.

Conviene senalar que la model card de este repositorio (0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic) hace referencia en su texto a un repositorio distinto, medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic, y las instrucciones de despliegue emplean esa ruta. Esto sugiere que se trata de una copia, espejo o reempaquetado de otro checkpoint, extremo que no se aclara en la documentacion.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno con ventanas de contexto de hasta 131.072 tokens en configuracion de produccion declarada.
- Tool calling y function calling nativos: la model card afirma ejecucion completa de herramientas con Hermes Agent, Aider y OpenCode, en contraste con la perdida silenciosa de mensajes de rol "tool" del checkpoint upstream.
- Razonamiento agente multi-paso mediante el protocolo Hierarchical Task Tree Decomposition, que estructura objetivos en fases (reconocimiento, analisis, implementacion, validacion) y subtareas.
- Modo de razonamiento explicito con etiquetas de pensamiento, regulado por el protocolo Mythos-Class Adversarial Self-Review, que fuerza la verificacion de hipotesis contra casos limite antes de cerrar la respuesta.
- Generacion de codigo, incluyendo escritura de ficheros y ejecucion de comandos a traves de herramientas externas, segun los ejemplos de flujo incluidos en la model card.
- Capacidades multilingues limitadas a ingles, chino y arabe. No se declara soporte de castellano ni de otros idiomas.
- Modo "uncensored": el checkpoint base ha sido sometido a abliteration, por lo que no aplica rechazos por contenido en la misma medida que un modelo alineado convencional.
- Sin capacidades de vision, audio ni multimodalidad declaradas.

## Casos de uso

- Agentes de programacion autonomos: el modelo puede operar sobre repositorios mediante herramientas de lectura y escritura de ficheros y ejecucion de comandos, integrarse en flujos tipo Aider u OpenCode y descomponer una tarea de refactorizacion en subtareas verificables gracias al arbol de tareas jerarquico.
- Pipelines de CI/CD con tool calling: la plantilla de 22 rutas de resolucion permite emitir llamadas estructuradas a funciones desde un servidor vLLM o SGLang en formato compatible con OpenAI, de modo que el modelo puede invocar pasos de build, test o despliegue dentro de un orquestador.
- Analisis de documentos largos: con 131.072 tokens de contexto probados, es viable cargar contratos, informes o bases de codigo extensas y hacer preguntas de seguimiento sin trocear el material, algo relevante en auditoria tecnica o legal.
- Automatizacion de tareas de seguridad ofensiva en entornos controlados: la model card incluye ejemplos de flujo con reconocimiento (nmap, curl), analisis de vulnerabilidades y generacion de exploits. Es un uso de red team que exige autorizacion explicita, aislamiento de red y supervision humana.
- Asistentes multilingues para mercados en/zh/ar: el modelo cubre ingles, chino y arabe, por lo que encaja en despliegues de atencion o documentacion tecnica para esas tres regiones linguisticas.
- Despliegue self-hosted en hardware de gama alta de consumo: la rama AWQ ocupa aproximadamente 16 GB de VRAM, lo que permite ejecutarlo en una unica RTX 3090, RTX 4090 o A5000 de 24 GB, util para equipos que no pueden enviar datos a APIs externas.
- Extraccion de datos estructurados: mediante function calling se pueden definir esquemas JSON y forzar al modelo a devolver campos tipados a partir de texto no estructurado, en lugar de parsear salida libre.
- Investigacion sobre alineamiento y abliteration: al ser un checkpoint sin capas de rechazo efectivas sobre una base Qwen, sirve como objeto de estudio comparativo frente al modelo original en experimentos de evaluacion de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MATH, MT-Bench ni de ninguna otra evaluacion estandar, ni comparaciones cuantitativas con el checkpoint upstream. Las afirmaciones de mejora (tool calling al 100%, correccion de bucles de razonamiento, contexto ampliado) proceden unicamente del autor y no estan respaldadas por mediciones publicadas.

## Requisitos de hardware

- BF16 (precision completa, rama `main`): aproximadamente 60 GB de VRAM. Requiere 2x A100, 2x RTX 4090 con tensor parallelism o una H100. Repositorio de 55,6 GB, 29 shards safetensors.
- FP8 (8 bits, rama `fp8`): aproximadamente 30 GB de VRAM. Cabe en 1x A100 de 40 GB o 80 GB, o en 2x RTX 3090/4090. Dos shards safetensors.
- AWQ (4 bits, rama `awq`): aproximadamente 16 GB de VRAM. Cabe en una unica GPU de 24 GB: RTX 3090, RTX 4090, A5000. Usa kernel Marlin y MTP.
- Si cabe en GPU de consumo: si, en la variante AWQ sobre 24 GB de VRAM. Las variantes FP8 y BF16 no caben en una sola GPU de consumo.
- Motores de despliegue soportados: SGLang y vLLM de forma nativa segun los comandos de la model card; tambien se mencionan TGI, TRT-LLM y LMDeploy. No hay soporte GGUF, por lo que llama.cpp y Ollama no estan cubiertos por el autor.
- Parametros de servicio documentados: `--context-length` o `--max-model-len` fijados en 131072, `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder` (SGLang) o `--tool-call-parser hermes` (vLLM), `--kv-cache-dtype fp8_e5m2` y `--trust-remote-code`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna de las tres ramas.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este checkpoint con los dos nodos de su propia cadena de derivacion, segun la tabla incluida en su model card. No hay datos de benchmarks que permitan una comparacion cuantitativa con alternativas de otros desarrolladores.

| Aspecto | Qwen3.8-27B (base) | OBLITERATUS/Qwen3.8-27B-OBLITERATED | 0xSojalSec/...-Mythos-Class-Agentic |
|---|---|---|---|
| Parametros | 27,8B (no confirmado en la informacion) | 27,8B (no confirmado) | 27,8B |
| Contexto | No disponible | 32.768 tokens nativos | Hasta 262.144 declarados; 131.072 probados |
| Plantilla de chat | No disponible | Stub truncado de 506 bytes | Jinja2 de 9,4 KB, 22 rutas de tool calling |
| Tool calling | No disponible | Roto: descarte silencioso del rol "tool" | Ejecucion nativa declarada |
| Modo de razonamiento | No disponible | Etiquetas invertidas, bucles de CoT | Protocolo Mythos-Class Adversarial Self-Review |
| Techo de salida por turno | No disponible | 8.192 tokens por defecto | 16.384 tokens |
| Licencia | No disponible en esta ficha | Apache 2.0 (segun el repositorio derivado) | Apache 2.0 |
| Formatos de peso | No disponible | No disponible | Safetensors (BF16, FP8, AWQ) |

Como alternativa de categoria comparable, el propio autor cita en el texto de la model card el repositorio medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic, que parece contener la misma configuracion bajo otro nombre de usuario. No hay datos publicados que permitan saber si ambos son identicos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: ninguna de las mejoras declaradas (tool calling al 100%, correccion de bucles, contexto de 128K-256K) esta respaldada por mediciones publicadas o verificables.
- Validacion nula por parte de la comunidad: el repositorio presenta 0 descargas y 0 "likes" en los metadatos consultados, y no hay discusiones ni issues que corroboren su funcionamiento.
- Procedencia ambigua: la model card describe un repositorio distinto (medismera/...) y los comandos de despliegue apuntan a esa ruta, no a la del repositorio consultado. Esto apunta a un espejo o recarga sin aclarar, lo que complica la trazabilidad del artefacto.
- Condicion de modelo "uncensored" y "abliterated": la eliminacion de las capas de rechazo eleva el riesgo de generar contenido danino, instrucciones peligrosas o material ilegal sin filtro. No es adecuado para aplicaciones de cara al publico ni para entornos sin supervision.
- Riesgo de alucinacion: sin datos de evaluacion no es posible acotar la tasa de invencion de hechos. En tareas de tool calling, una llamada mal formada o inventada puede tener efectos reales si el agente dispone de permisos de escritura o ejecucion.
- Cobertura linguistica limitada: solo ingles, chino y arabe. No hay soporte declarado de castellano, por lo que no se recomienda para produccion en espanol sin una evaluacion previa.
- Discrepancias internas en la documentacion: la seccion de resumen cita 131.072 tokens, mientras que la tabla de mejoras menciona simultaneamente 262.144 y 32.768 nativos. La cifra real de contexto no queda clara.
- Sin soporte GGUF: la ausencia de ramas GGUF descarta llama.cpp, Ollama y otros motores de CPU o GPU mixta. Solo safetensors con motores que soporten BF16, FP8 o AWQ.
- Requisito de `--trust-remote-code`: los comandos de despliegue documentados implican ejecutar codigo remoto del repositorio, lo que anade superficie de riesgo en entornos de produccion.
- Licencia: el repositorio se declara Apache 2.0, pero al derivar de Qwen/Qwen3.8-27B conviene verificar si la licencia del modelo base impone condiciones adicionales que prevalezcan sobre la del derivado.
- Fechas anomales: los metadatos indican creacion en septiembre de 2026. Conviene verificar la autenticidad del repositorio antes de integrarlo en cualquier flujo.
- Uso en seguridad ofensiva: los ejemplos de la model card describen generacion de exploits. Su uso sin autorizacion escrita, alcance definido y aislamiento de red puede ser ilegal.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic
- Modelo base intermedio: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio referenciado en la model card (posible origen del contenido): https://huggingface.co/medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic
- Discusion #7 del repositorio upstream (bucles infinitos de razonamiento): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/7
- Discusiones #9 y #14 del repositorio upstream (plantilla de chat truncada): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/9 y https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/14
