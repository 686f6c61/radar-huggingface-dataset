# DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored

## Resumen

DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored es un ajuste fino (finetune) de Qwen/Qwen3.8-27B publicado por el usuario DavidAU en HuggingFace. Se trata de una variante "herética" y sin censura ("uncensored") del modelo base, entrenada en múltiples etapas ("Multi-stage tuning", "Cold Fusion", "GAIN Training") sobre los datasets propios Polar-STRICT y F451-STRICT del mismo autor. El resultado es un modelo de 27.781.427.952 parámetros (unos 27,78 mil millones) en precisión bfloat16, con un repositorio de 55,6 GB.

Su propuesta de valor no es tanto el rendimiento bruto como la personalización del comportamiento: incorpora 27 modos de razonamiento y 27 modos de instrucción, además de 15 "AI Constructs" y 5 "Super AI Constructs" (Brainstorm, Brainstorm Business, Universal Teacher, Agent y Coder), junto con 9 modos de razonamiento "Xhigh". Está etiquetado para usos creativos (escritura, ficción, rol, todos los géneros), código, agentes y conversación general, y su pipeline declarado es image-text-to-text, lo que apunta a capacidades multimodales de entrada imagen+texto.

Es relevante ahora por dos motivos: por un lado, la eliminación de los mecanismos de rechazo del modelo base lo hace atractivo para investigación sobre alineamiento, rol y generación creativa sin restricciones; por otro, su acceso está restringido (gated) y solo declara soporte de inglés, lo que limita su uso directo en producción multilingüe. No se han publicado resultados de benchmarks en la información disponible, y las descargas registradas son 2 frente a 79 likes, un perfil típico de modelo recién publicado con interés de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag de arquitectura `qwen3_5`), ajuste fino del modelo Qwen/Qwen3.8-27B; detalles de capas y atención no disponibles |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Peso publicado en bfloat16 (safetensors); no se declara GGUF, AWQ, GPTQ ni cuantizaciones de 4/8 bits |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16), biblioteca transformers |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B (finetune) |
| Datasets de entrenamiento | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Tamano del repositorio | 55,6 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 2 / 79 |
| Fecha de creacion / actualizacion | 2026-09-03 / 2026-10-26 |

## Arquitectura y entrenamiento

La informacion disponible indica que se parte de Qwen/Qwen3.8-27B, un transformer de aproximadamente 27,78 mil millones de parametros, y que el ajuste se realiza con una metodologia propia que el autor etiqueta como "Cold Fusion", "GAIN Training" y "Multi-stage tuning", apoyada en la herramienta unsloth. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; los datos de partida son dos colecciones del propio autor, Polar-STRICT y F451-STRICT, cuyos contenidos y tamanos no estan descritos en la informacion proporcionada.

El rasgo tecnico diferencial no es la arquitectura, sino la capa de comportamiento anadida mediante el ajuste: 27 modos de razonamiento, 27 modos de instruccion, 9 modos de razonamiento "Xhigh" y un conjunto de "AI Constructs" preconfigurados (Brainstorm, Brainstorm Business, Universal Teacher, Agent, Coder, ademas de 5 "Super AI Constructs"). El pipeline image-text-to-text sugiere que el modelo conserva o incorpora entrada multimodal de imagen y texto, aunque no se especifican el codificador visual ni la resolucion de imagen soportada. Tampoco se documentan innovaciones de decodificacion (especulativa, atención lineal) ni detalles de la ventana de contexto.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta explicita `conversational`.
- Razonamiento explicito con modo "thinking" y 27 modos de razonamiento diferenciados, mas 9 variantes "Xhigh" de razonamiento extendido.
- 27 modos de instruccion ("instruct modes") para cambiar el estilo de respuesta sin reentrenar.
- Generacion de codigo y asistencia de programacion mediante el constructo "Coder AI Construct".
- Escritura creativa: ficcion, relato, "todos los generos" y roleplaying.
- Entrada multimodal imagen-texto segun el pipeline declarado (`image-text-to-text`).
- Comportamiento orientado a agentes mediante el "Agent AI Construct", con soporte declarado de "all use cases".
- Constructos especializados de lluvia de ideas ("Brainstorm", "Brainstorm Business") y de ensenanza ("Universal Teacher").
- Generacion sin censura ("uncensored", "heretic"): menor probabilidad de rechazo ante peticiones que el modelo base filtraria.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de audio o video: no disponibles.
- Multilingue: no; solo ingles declarado.

## Casos de uso

- Escritura creativa y ficcion sin restricciones: el ajuste "heretic" reduce los rechazos del modelo base, por lo que resulta util para generar relato, dialogos y desarrollo de personajes en generos donde el modelo original aplicaria filtros; los 27 modos de instruccion permiten fijar tono y estilo por llamada.
- Roleplaying y narrativa interactiva: la etiqueta `roleplaying` junto con el modo conversacional y los constructos de "Brainstorm" permiten mantener personajes consistentes en sesiones largas, cambiando de constructo segun la escena.
- Prototipado de asistentes de codigo con estilo configurable: el "Coder AI Construct" y los modos de razonamiento permiten alternar entre explicaciones detalladas y parches concisos dentro de un mismo pipeline de transformacion de codigo.
- Generacion aumentada por recuperacion (RAG) en ingles: al ser un modelo de ~27,8 B en bf16, puede desplegarse en una A100 80 GB para servir respuestas con contexto inyectado; la ausencia de contexto declarado obliga a medir empiricamente el limite util antes de fijar la estrategia de troceado.
- Analisis de imagenes con descripcion textual: el pipeline image-text-to-text habilita tareas de captioning, extraccion de datos de capturas o descripcion de diagramas, siempre en ingles.
- Investigacion sobre alineamiento y seguridad: comparar las respuestas de esta variante con las de Qwen/Qwen3.8-27B base permite estudiar que comportamientos se pierden al eliminar el ajuste de seguridad y como varia la tasa de rechazo.
- Generacion de material docente: el "Universal Teacher AI Construct" esta pensado para explicar conceptos por niveles, reutilizable en la produccion de tutorials y ejercicios en ingles.
- Experimentacion con agentes: el "Agent AI Construct" sirve como banco de pruebas para flujos multi-paso, aunque la falta de datos sobre tool calling obliga a validar el parseo de llamadas antes de integrarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso completo en bfloat16: 55,6 GB en disco; la inferencia en bf16 requiere del orden de 60-64 GB de VRAM contando cache KV y overhead (estimacion a partir del numero de parametros).
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB con tensor parallelism).
- Cuantizacion a 8 bits: aproximadamente 28-30 GB de VRAM; encaja en A100 40 GB o en 2x RTX 4090 (estimacion).
- Cuantizacion a 4 bits: aproximadamente 15-18 GB de VRAM; cabe en una RTX 4090 o RTX 3090 de 24 GB, y de forma ajustada en GPU de 16 GB con offloading parcial (estimacion; no hay GGUF publicado, habria que generarlo).
- Despliegue: transformers es la libreria declarada; el tag `unsloth` sugiere compatibilidad con el flujo de carga y cuantizacion de Unsloth; el tag `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints. No se confirma soporte verificado de vLLM, TGI, llama.cpp u Ollama, y al no existir pesos GGUF en el repositorio, Ollama y llama.cpp requeririan conversion previa.
- Acceso: al ser un repositorio gated, cualquier despliegue necesita un token con los terminos aceptados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | ~27,78 B | No disponible | Apache 2.0 | Gated | Finetune sin censura, 27 modos de razonamiento e instruccion, solo ingles, pipeline image-text-to-text |
| Qwen/Qwen3.8-27B (base) | ~27,78 B (por herencia del base declarado) | No disponible | Apache 2.0 (segun tag del modelo derivado; verificar en el repo base) | No disponible | Modelo original con alineamiento de seguridad intacto y sin los modos ni constructos anadidos |
| Otras alternativas de ~27-30 B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo "uncensored" y "heretic": se ha reducido o eliminado el ajuste de seguridad del modelo base, por lo que puede producir contenido sensible, ilicito o danino sin rechazo; no es apto para exposicion directa a usuarios finales sin filtros externos.
- Solo declara soporte de ingles (`en`); el rendimiento en castellano u otros idiomas no esta verificado y probablemente degrade.
- No hay datos publicados de benchmarks, evaluaciones de seguridad ni tasas de rechazo, por lo que cualquier afirmacion de calidad relativa al modelo base es especulativa.
- Riesgo de alucinacion no cuantificado: al no documentarse el volumen ni la composicion del dataset de ajuste (Polar-STRICT y F451-STRICT), no es posible estimar el sesgo introducido en dominios factuales.
- Longitud de contexto no declarada: planificar el troceado de documentos y las estrategias de memoria conversacional a partir de pruebas empiricas, no de la ficha.
- Procedencia de los datos de entrenamiento no detallada: conviene revisar los repositorios de datasets antes de un uso comercial para descartar contenido con derechos de terceros.
- Licencia Apache 2.0 declarada en el modelo derivado, pero es responsabilidad del usuario verificar la licencia y las condiciones del modelo base Qwen/Qwen3.8-27B y de los datasets utilizados.
- Acceso restringido (gated): requiere aceptar condiciones y disponer de token; esto bloquea automatizaciones y despliegues reproducibles sin gestion de credenciales.
- solo 2 descargas registradas: senal de adopcion muy baja, sin comunidad que haya validado el comportamiento ni reportado fallos.
- Ausencia de pesos cuantizados oficiales: obliga a generar GGUF/AWQ/GPTQ por cuenta propia si se necesita desplegar en hardware consumer.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- No se han encontrado enlaces relevantes (papers, blogs, repos o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
