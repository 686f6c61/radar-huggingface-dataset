# kierendaystudios/cordoval-inkwell-1

## Resumen

Cordoval Inkwell-1 es un ajuste fino (LoRA fusionado) de Qwen/Qwen3.5-9B orientado a la generacion de codigo de front-end web (HTML, CSS y JavaScript) y Python de proposito general. Lo desarrolla kierendaystudios (Cordoval), un estudio independiente, y se publica bajo licencia Apache-2.0. El modelo parte de una base de 9.409.813.744 parametros y hereda la ventana de contexto nativa de 262.144 tokens de Qwen3.5, ampliable a unos 512K mediante YaRN.

El problema que aborda es la calidad estructural del codigo web generado: no solo que compile, sino que la pagina resultante sea valida, responsive, accesible y sin errores de JavaScript. Para ello el autor construyo un pipeline de datos autogenerado en el que solo se conservaron las paginas que superaban comprobaciones automaticas en navegador headless.

Es relevante ahora porque demuestra un patron de ajuste fino con datos sinteticos filtrados por verificacion programatica, sin recurrir a modelos cerrados ni a Llama, y porque ofrece una mejora medible en benchmarks propios de web (web30: 0.877 a 0.917 con thinking off, y hasta 0.960 con thinking on) manteniendo el rendimiento en codigo Python (HE30: 0.933 a 0.967). Se distribuye en safetensors y en cuatro cuantizaciones GGUF para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-9B), ajuste LoRA fusionado |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; ~524.288 con YaRN (factor 2.0) |
| Tipos de cuantizacion | GGUF Q4_K_M, Q5_K_M, Q8_0, F16; pesos completos en bfloat16 |
| Idiomas soportados | no disponibles (la model card no los detalla; hereda los del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9.409.813.744 parametros que hereda la arquitectura y los pesos de Qwen3.5-9B. Sobre esa base se aplico un ajuste LoRA con rango 16, tasa de aprendizaje 5e-5, una epoca, longitud de secuencia 6144 y 674 pasos sobre una unica H100; la perdida final fue de aproximadamente 0.10. El adaptador se fusiono en los pesos finales, de modo que el artefacto publicado es un modelo denso completo y no un adaptador separado.

Los datos de entrenamiento son integramente sinteticos y autogenerados por Qwen3.5-9B. El autor redacto 4.000 briefs de sitios web; el modelo base genero paginas candidatas y solo se conservaron las que pasaron comprobaciones automaticas en navegador headless: estructura valida, viewport y diseno responsive, accesibilidad (etiquetas, texto alternativo, landmarks, contraste AA) y ausencia de errores de JavaScript. El filtrado dejo 2.180 sitios y 10.900 ejemplos de entrenamiento. Segun el autor, no se emplearon modelos Llama ni modelos cerrados o propietarios en la generacion, filtrado o etiquetado.

Como innovacion operativa destaca el modo de razonamiento (thinking) controlable mediante la plantilla de chat, con `enable_thinking=True/False`, y la posibilidad de activar extension de contexto YaRN sustituyendo `config.json` por `config_yarn500k.json` (mismos pesos, solo cambian los parametros RoPE).

## Capacidades

- Generacion de codigo de front-end web: HTML, CSS y JavaScript en un unico archivo o en estructuras multiarchivo.
- Maquetacion responsive con viewport, media queries y layouts adaptativos.
- Accesibilidad web: etiquetas de formulario, texto alternativo, landmarks y contraste AA.
- Generacion de codigo Python de proposito general.
- Modo de razonamiento (thinking) activable o desactivable por plantilla de chat, con la respuesta tras `</think>`.
- Contexto largo: 262.144 tokens nativos y hasta ~512K con YaRN, verificado con needle-in-a-haystack 8/8 a 131K, 261K, 409K y 511K.
- Conversacional multi-turno (tag `conversational` en el repo).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de landing pages: el modelo produce paginas completas en un unico HTML con CSS y JS embebidos; en el benchmark web30 la categoria landing alcanza 0.962 con thinking on, lo que lo hace adecuado para prototipado rapido de paginas de marketing.
- Formularios accesibles: con 0.972 en la categoria form (thinking off) y 0.962 (thinking on), es util para generar formularios con etiquetas, validacion y estructura semantica correcta sin revision manual extensa.
- Componentes de interfaz reutilizables: la categoria component sube de 0.766 (base) a 0.943 (Inkwell-1, thinking off) y 0.958 (thinking on), por lo que encaja en la generacion de botones, tarjetas, modales y widgets para bibliotecas de diseno internas.
- Dashboards y paneles de datos: 0.944 con thinking on en la categoria dashboard; se puede usar para esbozar paneles con tablas, graficos y rejillas de layout a partir de una descripcion textual.
- Correccion y refactorizacion de maquetacion: con 262K de contexto nativo puede recibir un proyecto web completo y proponer cambios de layout o de responsive sin perder el hilo entre archivos.
- Analisis de documentos o codigo de gran extension: los 512K tokens con YaRN, verificados en needle-in-a-haystack hasta 511K, permiten tareas de recuperacion y resumen sobre repositorios o especificaciones largas.
- Asistencia en Python para scripts de automatizacion: HE30 pasa de 0.933 a 0.967, por lo que sirve como generador de utilidades y scripts de soporte en pipelines internos.
- Despliegue local en portatil: la cuantizacion Q4_K_M (unos 5,6 GB) permite ejecutar el modelo en equipos consumer mediante llama.cpp, Ollama o LM Studio para asistencia de codigo offline.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. HE30 corresponde a los primeros 30 problemas de HumanEval (pass@1); web30 es un benchmark propio de 30 prompts evaluado con 16 comprobaciones renderizadas en navegador; web6 es un subconjunto reducido.

| Modelo | Thinking | HE30 | web30 | web6 |
|---|---|---|---|---|
| Qwen3.5-9B (base) | off | 0.933 | 0.877 | 0.708 |
| Qwen3.5-9B (base) | on | 0.933 | 0.894 | no disponible |
| Ronda anterior 1 | off | no disponible | 0.693 | no disponible |
| Ronda anterior 2 | off | no disponible | 0.664 | no disponible |
| Inkwell-1 | off | 0.967 | 0.917 | 0.688 |
| Inkwell-1 | on | 0.967 | 0.960 | no disponible |

Desglose de web30 por categoria:

| Categoria | Base off | Inkwell-1 off | Base on | Inkwell-1 on |
|---|---|---|---|---|
| landing | 0.816 | 0.796 | 0.893 | 0.962 |
| form | 0.924 | 0.972 | 0.877 | 0.962 |
| responsive | 0.977 | 0.988 | 0.954 | 0.976 |
| a11y | 0.961 | 0.903 | 0.980 | 0.962 |
| layout | 0.861 | 0.972 | 0.889 | 0.944 |
| dashboard | 0.827 | 0.885 | 0.928 | 0.944 |
| component | 0.766 | 0.943 | 0.752 | 0.958 |

Con YaRN activado y thinking off, el autor reporta HE30 0.967 y web30 0.922, sin regresion observada en contexto corto. Needle-in-a-haystack: 8/8 a 131K, 261K, 409K y 511K tokens, con profundidades del 25% y 75%.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 18-19 GB para pesos completos, mas memoria para KV cache; el autor indica que el F16 GGUF ocupa unos 17,9 GB.
- Cuantizaciones GGUF: Q4_K_M ~5,6 GB (recomendada por el autor para la mayoria de portatiles), Q5_K_M ~6,5 GB, Q8_0 ~9,5 GB, F16 ~17,9 GB.
- GPU consumer: Q4_K_M y Q5_K_M caben en GPUs de 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); Q8_0 requiere 12-16 GB; F16 requiere 24 GB o mas (RTX 3090, RTX 4090).
- GPU de datacenter: el autor valido el entrenamiento en 1x H100; el despliegue con contexto de 524.288 tokens se probo con vLLM en 1x H100 80 GB.
- Opciones de despliegue: vLLM (soporte explicito para `--max-model-len 524288` con YaRN), llama.cpp, Ollama y LM Studio mediante los GGUF; Transformers con `AutoModelForCausalLM` en bfloat16.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor indica que en modo thinking la generacion promedio fue de unos 2,5K tokens nuevos, con recomendacion de permitir 16K o mas.
- Parametros de muestreo recomendados: thinking on con temperature 0.6, top_p 0.95, top_k 20; thinking off con decodificacion greedy o temperatura baja.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HE30 (pass@1) | web30 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Cordoval Inkwell-1 | 9.409.813.744 | 262.144 (524.288 con YaRN) | 0.967 | 0.960 (thinking on) | Apache-2.0 | Hugging Face, safetensors y GGUF |
| Qwen3.5-9B (base) | 9B (aproximado, segun nombre) | 262.144 | 0.933 | 0.894 (thinking on) | Apache-2.0 | Hugging Face |
| Otros ajustes de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos publicados es contra el modelo base Qwen3.5-9B, del que deriva. No se dispone de resultados de terceros (por ejemplo, otros modelos de 7-9B orientados a codigo web) en la informacion proporcionada, por lo que no se puede establecer una comparativa externa fiable.

## Limitaciones y advertencias

- Los benchmarks son de muestra pequena: 30 problemas de HumanEval implican una variacion de ±1 problema por cada 0.033, y web30/web6 son conjuntos propios del autor, no estandarizados ni verificados de forma independiente.
- Regresion observada: web6 baja de 0.708 a 0.688 con thinking off, y las categorias a11y (0.961 a 0.903) y landing (0.816 a 0.796) empeoran con thinking off respecto al base.
- El modo thinking mejora la calidad pero incrementa coste y latencia: el autor reporta unos 2,5K tokens nuevos de media y recomienda reservar 16K o mas.
- Los datos de entrenamiento son sinteticos y generados por el propio modelo base, lo que puede amplificar sesgos o patrones del base y reducir la diversidad estilistica frente a datos humanos.
- La model card no detalla los idiomas soportados; el ajuste esta orientado a codigo y prompts en ingles, por lo que el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion en APIs, nombres de frameworks o atributos CSS no presentes en los datos de entrenamiento; se recomienda validacion automatica (renderizado en navegador, linters) antes de produccion.
- La extension YaRN solo debe activarse si se superan los 262K tokens; el autor advierte que no es necesaria por debajo de ese umbral.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el archivo NOTICE, y cumplir las condiciones heredadas de Qwen3.5-9B.
- No hay informacion sobre soporte de tool calling, vision ni otros modos, por lo que no deben asumirse en produccion.
- El modelo tiene 157 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kierendaystudios/cordoval-inkwell-1
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Avisos de terceros (referenciado en la model card): THIRD_PARTY_NOTICES.md en el repositorio del modelo
- Contacto del autor: management@cordoval.co.uk
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
