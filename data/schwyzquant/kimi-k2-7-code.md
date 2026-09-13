# schwyzquant/Kimi-K2.7-Code

# Kimi K2.7 Code (schwyzquant/Kimi-K2.7-Code)

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a código y a flujos de trabajo agénticos, construido sobre Kimi K2.6 y publicado en HuggingFace bajo el identificador `schwyzquant/Kimi-K2.7-Code`. La model card hace referencia a Moonshot AI y a la familia Kimi, mientras que el repositorio concreto lo sube el usuario `schwyzquant` con etiquetas `compressed-tensors` y `kimi_k25`, lo que apunta a una redistribución o reempaquetado cuantizado del modelo original. Cuenta con 1.026.879.376.368 parámetros totales (aproximadamente 1 billón) y 32.000 millones de parámetros activos por token.

El problema que aborda es la ejecución de tareas de ingeniería de software de largo horizonte, es decir, flujos completos de principio a fin sobre bases de código reales, con soporte de agente y de herramientas. Frente a Kimi K2.6, el autor declara mejoras sustanciales en tareas de código de largo recorrido y una reducción de aproximadamente el 30 % en el consumo de tokens de "pensamiento", lo que abarata la inferencia en cargas agénticas.

Arquitectónicamente combina atención MLA (Multi-head Latent Attention) con una capa densa y 60 capas MoE, 384 expertos de los que se seleccionan 8 por token más 1 experto compartido, y un codificador visual MoonViT de 400 millones de parámetros. Su ventana de contexto es de 256 000 tokens, lo que lo sitúa en la gama alta de modelos abiertos con capacidades multimodales (texto e imagen) y orientación a agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion MLA y capa densa inicial |
| Parametros totales | 1.026.879.376.368 (aproximadamente 1 T) |
| Parametros activos | 32 000 millones |
| Longitud de contexto | 256 000 tokens (262 144 en las evaluaciones) |
| Tipos de cuantizacion | Etiqueta `compressed-tensors` en el repositorio; no se detallan esquemas concretos (FP8, INT4, etc.) en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (licencia personalizada "modified MIT"); etiqueta `license:other` |
| Formato de pesos | safetensors, con `custom_code` y libreria transformers |

Datos arquitectonicos adicionales declarados: 61 capas (1 densa), dimension oculta de atencion 7168, dimension oculta MoE por experto 2048, 64 cabezas de atencion, 384 expertos, 8 expertos seleccionados por token, 1 experto compartido, vocabulario de 160 000 tokens, funcion de activacion SwiGLU y codificador visual MoonViT de 400 millones de parametros.

## Arquitectura y entrenamiento

La arquitectura es un transformer disperso de tipo MoE con atencion MLA, el mecanismo de atencion latente empleado en la familia Kimi para reducir el coste de la cache KV en contextos largos. El modelo consta de 61 capas, de las cuales solo la primera es densa y el resto son capas MoE. Cada capa enruta cada token hacia 8 de los 384 expertos disponibles, ademas de un experto compartido que procesa todos los tokens. Esto da una relacion de parametros totales a activos de aproximadamente 32 a 1, lo que permite mantener una capacidad de un billon de parametros con un coste de computo por token comparable a un modelo mucho mas pequeno. La dimension de atencion es 7168, cada experto tiene una dimension oculta de 2048 y el vocabulario es de 160 000 tokens. El modulo multimodal lo aporta el codificador MoonViT, de 400 millones de parametros, que permite la entrada de imagenes junto al texto.

No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. La model card si especifica que el modelo se construye sobre Kimi K2.6 y que se ha optimizado para tareas de codigo agénticas, con una mejora declarada de eficiencia de aproximadamente el 30 % menos de tokens de razonamiento que K2.6. El repositorio incluye la etiqueta `compressed-tensors`, lo que sugiere que los pesos publicados estan cuantizados de forma comprimida; el tamano del repositorio (595,2 GB) es coherente con una cuantizacion de aproximadamente 4,6 bits por parametro, muy por debajo de los aproximadamente 2 TB que ocuparian los pesos en BF16, aunque este calculo es una estimacion derivada y no un dato confirmado por el autor.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con enfasis en tareas de ingenieria de software completas y de largo horizonte.
- Razonamiento multi-paso y modo de "pensamiento" (thinking mode) activable, evaluado con temperatura 1.0 y top-p 0.95.
- Ejecucion de agentes: la model card incluye benchmarks especificos de agentes (Kimi Claw 24/7 Bench, MCP Atlas, MCP Mark Verified).
- Soporte de herramientas y function calling a traves del protocolo MCP (Model Context Protocol), segun los benchmarks MCP incluidos.
- Capacidades multimodales de imagen y texto (pipeline `image-text-to-text`, etiqueta `conversational`), gracias al codificador MoonViT de 400 M de parametros.
- Conversacion multiturno con contexto largo de hasta 256 000 tokens.
- Capacidades multilingues: no disponible (no se enumeran idiomas en la informacion proporcionada).
- Cualquier capacidad de audio o vision adicional distinta de la imagen-texto: no disponible.

## Casos de uso

- Ingenieria de software asistida de extremo a extremo: dado un repositorio y una descripcion de tarea, el modelo puede planificar cambios, editar multiples ficheros y cerrar la tarea, aprovechando su ventana de 256 000 tokens para mantener el contexto de bases de codigo grandes.
- Agentes de codigo en integracion continua: integrado como agente que ejecuta herramientas (compilar, ejecutar tests, leer errores) mediante MCP, encaja en pipelines de CI/CD para reparar fallos de build o tests de forma autonoma.
- Revision de codigo y analisis de pull requests: con contexto largo puede cargar un diff extenso mas los ficheros relacionados y emitir comentarios tecnicos, detectando regresiones entre modulos.
- Soporte tecnico de producto con documentacion adjunta: al aceptar imagenes y texto, puede procesar capturas de pantalla de errores junto a la documentacion y responder en conversaciones multiturno.
- Migracion y refactorizacion de bases de codigo: el modo agéntico de largo horizonte permite abordar tareas de refactor que requieren decenas de ediciones coordinadas y verificacion intermedia.
- Analisis de incidencias en produccion: a partir de trazas y ficheros de log extensos (que caben en el contexto), el modelo puede localizar la causa probable y proponer un parche, apoyandose en el benchmark interno de agentes "24/7".
- Generacion de codigo en entornos con restricciones de coste: la reduccion declarada de aproximadamente el 30 % en tokens de pensamiento respecto a K2.6 abarata las cargas agénticas de muchas iteraciones.
- Automatizacion de tareas sobre interfaces (UI) con entrada visual: la combinacion de vision y agencia abre la puerta a agentes que interpretan capturas de pantalla y actuan sobre aplicaciones.

## Benchmarks y rendimiento

Resultados declarados en la model card. Kimi K2.7 Code y K2.6 se evaluaron con modo de pensamiento activado, temperatura 1.0, top-p 0.95 y contexto de 262 144 tokens; GPT-5.5 y Claude Opus 4.8 se evaluaron en sus respectivos entornos (Codex y Claude Code) con modo "xhigh".

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50.9 | 62.0 | 69.0 | 67.4 |
| Program Bench | 48.3 | 53.6 | 69.1 | 63.8 |
| MLS Bench Lite | 26.7 | 35.1 | 35.5 | 42.8 |
| Kimi Claw 24/7 Bench | 42.9 | 46.9 | 52.8 | 50.4 |
| MCP Atlas | 69.4 | 76.0 | 79.4 | 81.3 |
| MCP Mark Verified | 72.8 | 81.1 | 92.9 | 76.4 |

Kimi Code Bench v2 es un benchmark interno del autor disenado para evaluar agentes de codigo en tareas realistas, con tareas de ingenieria de software en mas de 10 lenguajes de programacion y una pila tecnologica de produccion. No se han publicado en la informacion disponible resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2 TB solo para los pesos, lo que exige un clúster multi-GPU (del orden de 26-32 GPU de 80 GB). Es una estimacion derivada del numero de parametros, no un dato del autor.
- Tamano del repositorio: 595,2 GB, coherente con una version cuantizada del modelo. Almacenar los pesos ya requiere hardware de almacenamiento considerable, y cargarlos en memoria exige como minimo del orden de 8 GPU de 80 GB solo para los pesos, mas espacio para la cache KV.
- GPU recomendadas: nodos con H100 80 GB o A100 80 GB en configuracion multi-GPU con tensor parallelism. No cabe en una GPU de consumo (RTX 4090 de 24 GB, etc.) en ninguna configuracion razonable por el propio tamano del modelo.
- Opciones de despliegue: al ser un modelo transformers con `custom_code` y `compressed-tensors`, requiere soporte especifico de esa arquitectura. Servidores de inferencia habituales en este tipo de modelos son vLLM y SGLang para despliegue a escala; llama.cpp u Ollama resultan poco realistas por el tamano y por el codificador visual. Confirmar compatibilidad concreta con cada motor no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa con la generacion anterior de la propia familia y con los modelos cerrados usados como referencia en la model card. Los parametros de los modelos cerrados no estan disponibles.

| Modelo | Parametros | Contexto | Licencia | Kimi Code Bench v2 | MCP Mark Verified |
|---|---|---|---|---|---|
| Kimi K2.7 Code | 1 T (32 B activos) | 256 K | modified-mit | 62.0 | 81.1 |
| Kimi K2.6 | no disponible | no disponible | no disponible | 50.9 | 72.8 |
| GPT-5.5 | no disponible | no disponible | propietaria | 69.0 | 92.9 |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | 67.4 | 76.4 |

Frente a Kimi K2.6, el K2.7 Code mejora en todos los benchmarks publicados y reduce el consumo de tokens de razonamiento, con la ventaja de ser un modelo de pesos abiertos que puede desplegarse en infraestructura propia. Frente a GPT-5.5 y Claude Opus 4.8, queda por detras en la mayoria de las metricas declaradas, aunque con una diferencia menor en MCP Mark Verified (81.1 frente a 92.9 de GPT-5.5) que en el resto. No se dispone de datos de contexto, parametros ni licencia de los modelos cerrados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documentan analisis de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos generativos; no se cuantifica en la model card. En tareas de codigo puede producir APIs o funciones inexistentes si no se verifica con ejecucion real.
- Idioma: no se especifica la lista de idiomas soportados, por lo que el rendimiento fuera del ingles (y del chino, habitual en la familia Kimi) es incierto. No hay datos para el castellano en particular.
- Licencia: la licencia es "modified-mit", una variante modificada de MIT, no MIT estandar. Las condiciones exactas (por ejemplo, atribucion, limites de uso comercial o clausulas adicionales) deben revisarse en el fichero LICENSE del repositorio antes de cualquier uso en produccion.
- Procedencia del repositorio: el identificador pertenece al usuario `schwyzquant`, no a la organizacion oficial `moonshotai`, y lleva la etiqueta `compressed-tensors`. Conviene verificar que los pesos coinciden con el modelo original y que la cuantizacion no degrada el rendimiento declarado.
- Recursos: requiere infraestructura multi-GPU de gama alta; no es desplegable en hardware de consumo ni en una sola GPU de 80 GB.
- Idiomas y datos de entrenamiento no documentados: no se detalla el volumen de tokens, la composicion del dataset ni si hubo RLHF/DPO, lo que limita la evaluacion de riesgos de contaminacion o de comportamiento en dominios concretos.
- Los benchmarks presentados son en su mayoria internos o propios del ecosistema del autor (Kimi Code Bench v2, MLS Bench Lite, Kimi Claw 24/7 Bench), lo que dificulta la comparacion independiente con otros modelos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/schwyzquant/Kimi-K2.7-Code
- Organizacion oficial en HuggingFace: https://huggingface.co/moonshotai
- Pagina del producto de codigo: https://www.kimi.com/code
- Sitio de Moonshot AI: https://www.moonshot.ai
- ModelScope: https://modelscope.cn/organization/moonshotai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- Fichero de licencia referenciado: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo (los resultados obtenidos correspondian a un sitio de deportes y no guardan relacion con Kimi K2.7 Code). No se dispone por tanto de articulos, papers o repositorios adicionales verificados mas alla de los enlaces anteriores.
