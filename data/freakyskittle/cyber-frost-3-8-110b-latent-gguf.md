# freakyskittle/CYBER-FROST-3.8-110B-Latent-GGUF

## Resumen

CYBER-FROST-3.8-110B-Latent-GGUF es una colección de cuantizaciones GGUF del checkpoint destilado de tercera pasada CYBER-FROST-3.8-110B-Latent-BF16-reasoning, publicado por el usuario freakyskittle en Hugging Face. El modelo está orientado a tareas de ciberseguridad (investigación defensiva, revisión de código seguro, validación de vulnerabilidades, ejercicios red/purple-team, ingeniería de detección, respuesta a incidentes y análisis de malware) y se distribuye bajo la licencia qwen-community-license-1.0. El autor lo etiqueta explícitamente como *work in progress* y no apto para producción.

La arquitectura es un transformer MoE con mecanismo *latent MoE* (expertos enrutados sobre representaciones latentes) y atención dispersa QSA (2.048 tokens seleccionados por consulta), derivada de una línea experimental denominada `qwen4-exp`. El checkpoint BF16 de origen declara 110B en el nombre, pero los pesos safetensors reales suman 55.246.531.456 parámetros (unos 55,2B), lo que sugiere que la cifra "110B" corresponde a parámetros totales del modelo denso equivalente o a una convención de nombrado del autor, no al recuento efectivo del checkpoint publicado.

La relevancia actual es doble: por un lado, demuestra técnicas de cuantización agresiva (hasta 2,375 bits por peso con IQ2_VQ) sobre arquitecturas MoE con proyecciones de ancho no estándar (640) que los tipos K-quant e IQ de 256 bloques no pueden representar; por otro, expone las limitaciones prácticas de estos formatos en modelos de razonamiento, con una fiabilidad aritmética y de razonamiento multi-paso claramente insuficiente en las builds de 2 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con latent MoE, atencion dispersa QSA (2.048 tokens seleccionados por consulta), atencion lineal, hyper-connections y embedding n-gram por capa |
| Parametros totales | 55.246.531.456 (55,2B) segun safetensors; el nombre comercial indica 110B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (probado en servidor con `-c 262144`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, MXFP4_MOE, IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_VQ, IQ2_XXS-RAMFIT, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | GGUF (safetensors en el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) en el que los expertos enrutados operan sobre representaciones latentes (*latent MoE*), con proyecciones de bajada de 640 dimensiones. Incorpora atención lineal, hyper-connections y una tabla de embedding n-gram por capa que se consulta fila a fila (cuantizada en Q4_0 en todas las builds, por lo que no necesita residir en RAM). La atención es dispersa mediante QSA, que selecciona 2.048 tokens por consulta; en el fork de llama.cpp utilizado se aplica como máscara, no como kernel disperso, lo que explica la caída de velocidad de preprocesado con prompts largos. El checkpoint es el resultado de una destilación de tercera pasada (*pass-3 distilled checkpoint*) sobre el modelo base BF16-reasoning.

Las cuantizaciones GGUF se generan con una matriz de importancia (`imatrix-pass3.gguf`) construida con 72 × 2.048 tokens de matemáticas, razonamiento, chat, código y texto de seguridad. Los expertos enrutados y las proyecciones latentes D/U se cuantizan directamente desde los pesos BF16 de pass-3; el resto de tensores (atención, atención lineal, hyper-connections, experto compartido, router) se copian byte a byte desde la build Q4_K_M probada. La proyección de bajada de los expertos (ancho 640) obliga a usar tipos como Q8_0, Q5_1, Q5_0, IQ4_NL o IQ2_VQ, ya que ningún K-quant ni IQ de 256 bloques puede almacenarla. IQ2_VQ es un tipo propio del fork (2,375 bpw, codebook de 4 pesos aprendido). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional y con formato de razonamiento (`--reasoning-format deepseek` en llama-server).
- Razonamiento multi-paso y aritmética: presentes pero poco fiables, especialmente en builds de 2 bits (ver sección de benchmarks).
- Tool calling / function calling: IQ2_XXS-RAMFIT generó una llamada `write` bien formada a través de opencode, aunque el código escrito era incorrecto.
- Capacidades orientadas a ciberseguridad heredadas del modelo fuente: revisión de código seguro, validación de vulnerabilidades, ingeniería de detección, respuesta a incidentes y análisis de malware.
- Contexto largo de hasta 262.144 tokens, con atención dispersa QSA.
- Capacidades multilingües: no disponible.
- No se documentan capacidades de visión, audio ni decodificación especulativa funcional (la cabeza MTP del modelo de ancho completo obtiene 0% de aceptación en este modelo latente).

## Casos de uso

- Revisión de código seguro en pipelines de CI/CD: el modelo puede analizar diffs y señalar patrones inseguros con contexto largo (262.144 tokens), integrándose vía tool calling en un servidor llama.cpp con el fork `llama.cpp-bigmoe`. Adecuado por su especialización en seguridad, aunque los hallazgos generados pueden ser erróneos o fabricados y requieren revisión humana.
- Validación de vulnerabilidades en entornos autorizados: uso como asistente para reproducir y priorizar hallazgos en ejercicios de red-team/purple-team, con la advertencia de que comandos y PoCs generados pueden ser incorrectos.
- Ingeniería de detección: generación y refinado de reglas de detección (Sigma, YARA, consultas SIEM) a partir de descripciones de comportamiento, aprovechando el contexto largo para incluir telemetría y documentación previa.
- Respuesta a incidentes: resumen y correlación de artefactos y líneas de tiempo extensas dentro de la ventana de 262.144 tokens, con salida estructurada mediante tool calling para volcar informes.
- Análisis de malware en laboratorio aislado: extracción de indicadores y explicación de cadenas sospechosas, siempre con verificación manual y sin ejecución del artefacto.
- Despliegue en hardware de gama baja para prototipado: la build IQ2_XXS-RAMFIT (~16 GB de pesos leídos por pasada) permite servir el modelo a contexto completo en una máquina con 32 GB de RAM y una iGPU Radeon 680M, útil para demos y evaluación interna, no para producción.
- Investigación sobre cuantización de MoE: reproducción de los experimentos de IQ2_VQ y comparación de calidad entre builds con la sonda aritmética documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo documenta una sonda *teacher-forced* sobre la multiplicación "17 × 23 = 17 × 20 + 17 × 3 = 340 + 51 = 391", puntuando los dígitos que cargan la aritmética:

| Build | Elección top para "4" en 340 | Elección top para "9" en 391 |
|---|---|---|
| Q8_0 | 4 (50%) | 9 (75%) |
| Q6_K | 4 (54%) | 8 (9 al 48%) |
| Q5_K_M | 6 (4 al 43%) | 9 (86%) |
| Q4_K_M | 6 (4 al 36%) | 9 (91%) |
| MXFP4_MOE | 4 (86%) | 9 (81%) |
| IQ2_VQ | 4 (71%) | 9 (97%) |
| IQ2_XXS-RAMFIT | 5 (4 al 48%) | 9 (97%) |

Generación libre con decodificación greedy: Q4_K_M acierta 5 de 6 prompts que terminaron (sigue escribiendo 17 × 23 = 381); IQ2_XXS-RAMFIT acierta 3 de 8 tanto en greedy como con muestreo por defecto.

Rendimiento medido en Ryzen 7 PRO 6850H con iGPU Radeon 680M (Vulkan) y 32 GB de RAM (8 GB reservados para la iGPU), sirviendo IQ2_XXS-RAMFIT:

| Métrica | Q4_K_M (no cabe en RAM) | IQ2_XXS-RAMFIT |
|---|---|---|
| Preprocesado de prompt, 2K tokens | ~23 tok/s | 62–75 tok/s |
| Preprocesado de prompt, 16K tokens | no disponible | 42 tok/s |
| Generación, contexto corto | 0,2–1,2 tok/s | 8,4 tok/s |
| Generación, servidor a 262.144 de contexto con prompt de 10K | no disponible | 6,0 tok/s |

## Requisitos de hardware

- VRAM/RAM: los pesos leídos por pasada van de ~56 GB (Q8_0) a ~16 GB (IQ2_XXS-RAMFIT); el tamaño en disco va de 85,5 GB (Q8_0) a 46,5 GB (IQ2_XXS-RAMFIT).
- GPU recomendadas: no disponibles en la información proporcionada; el autor solo prueba con iGPU Radeon 680M vía Vulkan.
- Cabe en GPU de consumo: no hay datos; por tamaño, Q8_0 (85,5 GB) y Q6_K (77,7 GB) no caben en ninguna GPU de consumo actual. Las builds de 2 bits (~46–49 GB) podrían caber en GPUs con 48 GB o más, pero no se ha verificado.
- Despliegue: exclusivamente con un fork de llama.cpp que implemente `qwen4exp`, latent MoE e IQ2_VQ (`llama.cpp-bigmoe`). llama.cpp estándar no puede cargar estos ficheros. Configuración recomendada: `-ot exps=CPU` para mantener los expertos enrutados en CPU, `-fa on`, `-ctk q8_0 -ctv q8_0`, `--jinja --reasoning-format deepseek`, y parámetros DRY (`--dry-multiplier 0.8 --dry-base 1.75 --dry-allowed-length 4`) para evitar razonamientos que no terminan.
- Latencia y throughput: ver tabla de la sección anterior (8,4 tok/s de generación en contexto corto y 6,0 tok/s a contexto completo en la máquina de referencia).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (MoE con latent MoE y especialización en ciberseguridad) ni datos de rendimiento que permitan una comparación rigurosa. Como referencia estructural, el modelo se apoya en la línea `qwen4-exp` y en la licencia qwen-community-license-1.0, pero no se aportan especificaciones de los modelos Qwen correspondientes.

## Limitaciones y advertencias

- No apto para producción: el propio autor lo marca como *work in progress*; los ficheros pueden cambiar o sustituirse sin aviso.
- Aritmética y razonamiento multi-paso poco fiables en todas las builds, y notablemente peores en las de 2 bits (IQ2_XXS-RAMFIT: 3 de 8 correctas en generación libre).
- El razonamiento largo puede divagar sin llegar a una respuesta; es necesario aplicar los ajustes DRY indicados.
- La cabeza MTP de borrador del modelo de ancho completo obtiene 0% de aceptación en este modelo latente, por lo que la decodificación especulativa no aporta.
- Solo se han medido las cifras documentadas: no hay evaluación de suite de benchmarks, contexto largo, tareas de seguridad ni seguridad/aliniación.
- Se heredan todas las limitaciones del modelo fuente: hallazgos, código y comandos generados pueden ser erróneos o fabricados, y su reducida sobrerresistencia a rechazar puede facilitar la obtención de salidas dañinas.
- Licencia qwen-community-license-1.0: revisar sus términos antes de cualquier uso comercial; el campo `license` de Hugging Face figura como "other".
- Dependencia de un fork no estándar de llama.cpp: no hay compatibilidad con llama.cpp upstream, vLLM, TGI ni Ollama.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe adecuado.
- Uso previsto restringido a profesionales de seguridad con autorización explícita (investigación defensiva, revisión de código seguro, validación de vulnerabilidades, ejercicios red/purple-team, ingeniería de detección, respuesta a incidentes, análisis de malware).

## Enlaces

- Repositorio GGUF: https://huggingface.co/freakyskittle/CYBER-FROST-3.8-110B-Latent-GGUF
- Modelo base BF16: https://huggingface.co/freakyskittle/CYBER-FROST-3.8-110B-Latent-BF16-reasoning
- Matriz de importancia: `imatrix-pass3.gguf` (incluida en el repositorio)
- Fork de llama.cpp utilizado: `llama.cpp-bigmoe` (no se proporciona URL en la información disponible)
- Paper, blog o demo adicionales: no disponible
