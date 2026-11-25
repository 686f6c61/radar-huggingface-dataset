# freakyskittle/CYBER-FROST-3.8-110B-Latent-RAMFit-GGUF

## Resumen

CYBER-FROST-3.8-110B-Latent-RAMFit-GGUF es una colección de cuantizaciones GGUF del checkpoint de razonamiento CYBER-FROST-3.8-110B-Latent-BF16-reasoning, publicado por el usuario freakyskittle. A pesar del "110B" del nombre, los pesos en safetensors suman 55.246.531.456 parámetros (unos 55,2 mil millones), lo que sugiere que la cifra del nombre corresponde a una cuenta agregada de expertos enrutados y no al número de parámetros activos o almacenados. El modelo se presenta como un MoE "latent" construido sobre una base experimental denominada `qwen4-exp`, con atención dispersa (QSA, 2.048 tokens seleccionados por consulta) y una tabla de embeddings n-grama por capa.

El interés de esta publicación no está en el modelo base sino en el trabajo de cuantización: el autor aplica una matriz de importancia (imatrix) calculada sobre 72 × 2.048 tokens de matemáticas, razonamiento, chat, código y seguridad, y cuantiza directamente los expertos enrutados y las proyecciones latentes D/U desde los pesos BF16 de la pasada 3. El resto de tensores se copia byte a byte de una build Q4_K_M ya probada. La build destacada, IQ2_XXS-RAMFIT, ocupa 46,5 GB en disco pero solo requiere mantener en RAM unos 16 GB por pasada, lo que permite servir el modelo a contexto completo (262.144 tokens) en una máquina de 32 GB de RAM con iGPU.

El modelo es explícitamente un trabajo en progreso y no apto para producción: el propio autor advierte que la aritmética multidígito y el razonamiento multi-paso son poco fiables, que solo se han ejecutado pruebas estrechas y que los ficheros pueden cambiar sin aviso. Su relevancia actual es doble: por un lado, documenta técnicas de cuantización extrema (IQ2_VQ, un tipo de 2,375 bpw con codebook aprendido de 4 pesos) para arquitecturas MoE con proyecciones de anchura no estándar; por otro, muestra un caso real de despliegue de un modelo de más de 50.000 millones de parámetros en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (QSA) y proyecciones latentes; base `qwen4-exp`; incluye atención lineal, hyper-connections, experto compartido y router |
| Parametros totales | 55.246.531.456 (según safetensors del modelo base); el nombre comercial indica 110B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración de servidor documentada por el autor) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, MXFP4_MOE, IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_VQ, IQ2_XXS-RAMFIT, IQ1_M (varias en construcción) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en la model card) |
| Formato de pesos | GGUF (safetensors en el modelo base BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) en el que los expertos enrutados conviven con un experto compartido y un router, e incorpora mecanismos poco habituales: atención lineal, hyper-connections y una atención dispersa denominada QSA que selecciona 2.048 tokens por consulta. La proyección "down" de los expertos enrutados tiene una anchura de 640, un valor que ningún tipo K-quant ni los tipos IQ de bloque 256 pueden representar, lo que obliga a usar Q8_0, Q5_1, Q5_0, IQ4_NL o IQ2_VQ en esa columna. El modelo incluye además una tabla de embeddings n-grama por capa, cuantizada a Q4_0 en todas las builds y consultada fila a fila, de modo que no necesita residir en RAM.

El checkpoint es una destilación de "pasada 3" (pass-3) del modelo base BF16 de razonamiento. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. La innovación técnica documentada está en el pipeline de cuantización: los expertos enrutados y las proyecciones latentes D/U se cuantizan desde BF16 con una imatrix específica (`imatrix-pass3.gguf`), mientras que el resto de tensores se reutilizan de la build Q4_K_M. El tipo IQ2_VQ es una extensión del fork de llama.cpp utilizado (2,375 bits por peso, con codebook de 4 pesos aprendido) y solo es cargable por ese fork (`llama.cpp-bigmoe`), no por llama.cpp estándar.

## Capacidades

- Generación de texto conversacional con formato de razonamiento tipo DeepSeek (`--reasoning-format deepseek`).
- Razonamiento multi-paso y aritmética: presentes pero poco fiables según el autor, con degradación acusada en las builds de 2 bits.
- Tool calling / function calling: se ha verificado la emisión de una llamada `write` bien formada a través de opencode, aunque el código generado era incorrecto.
- Orientación a ciberseguridad: investigación defensiva, revisión de código seguro, validación de vulnerabilidades, ejercicios red/purple-team, ingeniería de detección, respuesta a incidentes y análisis de malware (uso previsto heredado del modelo fuente).
- Contexto largo: la configuración probada sirve 262.144 tokens con una ventana de prompt de 10K tokens.
- Capacidades multilingües: no disponible.
- Modo thinking: sí, con formato de razonamiento configurable en llama-server.
- Decodificación especulativa: no funcional; la cabeza MTP del modelo de ancho completo obtiene 0 % de aceptación sobre este modelo latente.

## Casos de uso

- Revisión de código seguro en local: el modelo puede analizar parches y señalar patrones peligrosos en una máquina de 32 GB de RAM sin enviar código a la nube, gracias a la build IQ2_XXS-RAMFIT y su requisito de ~16 GB en RAM por pasada.
- Asistencia en análisis de malware: con 262.144 tokens de contexto se pueden cargar informes, volcados de cadenas y extractos de desensamblado en una sola conversación para correlacionar indicadores, aceptando la advertencia de que las conclusiones pueden ser fabricadas.
- Ingeniería de detección: generación y discusión de reglas de detección y consultas de correlación en un entorno aislado, útil para prototipado rápido antes de validación humana.
- Ejercicios red-team autorizados: el modelo fuente tiene una sobre-negativa reducida, lo que facilita obtener respuestas técnicas sobre técnicas de ataque en entornos de laboratorio con autorización explícita.
- Validación de vulnerabilidades: apoyo a la redacción de pruebas de concepto y descripciones de impacto, siempre con verificación manual dado el riesgo de alucinación en código y comandos.
- Despliegue en hardware de consumo para experimentación: servir el modelo con llama-server en una iGPU Radeon 680M con `-ot exps=CPU` permite probar un MoE de más de 50.000 millones de parámetros a 8,4 tok/s en contexto corto.
- Evaluación de técnicas de cuantización extrema: el repositorio sirve como banco de pruebas para comparar Q8_0, MXFP4_MOE, IQ2_VQ e IQ2_XXS sobre la misma arquitectura con una sonda controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo documenta una sonda con teacher forcing y pruebas de generación libre.

Sonda con teacher forcing sobre "17 × 23 = 17 × 20 + 17 × 3 = 340 + 51 = 391", midiendo la elección top para el "4" de 340 y el "9" de 391:

| Build | Top para "4" en 340 | Top para "9" en 391 |
|---|---|---|
| Q8_0 | 4 (50 %) | 9 (75 %) |
| Q6_K | 4 (54 %) | 8 (9 al 48 %) |
| Q5_K_M | 6 (4 al 43 %) | 9 (86 %) |
| Q4_K_M | 6 (4 al 36 %) | 9 (91 %) |
| MXFP4_MOE | 4 (86 %) | 9 (81 %) |
| IQ2_VQ | 4 (71 %) | 9 (97 %) |
| IQ2_XXS-RAMFIT | 5 (4 al 48 %) | 9 (97 %) |

Generación libre con decodificación greedy: Q4_K_M acierta 5 de 6 prompts que terminaron (sigue escribiendo 17 × 23 = 381); IQ2_XXS-RAMFIT acierta 3 de 8.

Rendimiento medido en Ryzen 7 PRO 6850H con Radeon 680M (Vulkan) y 32 GB de RAM (8 GB reservados para la iGPU), build IQ2_XXS-RAMFIT:

| Métrica | Q4_K_M (no cabe en RAM) | IQ2_XXS-RAMFIT |
|---|---:|---:|
| Procesamiento de prompt, 2K tokens | ~23 tok/s | 62–75 tok/s |
| Procesamiento de prompt, 16K tokens | no disponible | 42 tok/s |
| Generación, contexto corto | 0,2–1,2 tok/s | 8,4 tok/s |
| Generación, servidor a 262.144 de contexto con prompt de 10K | no disponible | 6,0 tok/s |

## Requisitos de hardware

- VRAM/RAM: la build IQ2_XXS-RAMFIT necesita ~16 GB de RAM por pasada para inferencia rápida; IQ2_VQ requiere ~19 GB; Q4_K_M, ~34 GB; Q6_K, ~48 GB; Q8_0, ~56 GB. Los tamaños en disco van de 46,5 GB (IQ2_XXS-RAMFIT) a 85,5 GB (Q8_0).
- GPU recomendadas: no hay datos para A100, H100 o RTX 4090. El único hardware documentado es una iGPU Radeon 680M con Vulkan.
- GPU de consumo: la build de 2 bits cabe en sistemas con 32 GB de RAM; las builds de 4 bits o superiores requieren 48–64 GB o más y no caben en configuraciones típicas de 32 GB.
- Despliegue: exclusivamente mediante el fork `llama.cpp-bigmoe`, que implementa `qwen4exp`, latent MoE e IQ2_VQ. llama.cpp estándar, vLLM, TGI u Ollama no pueden cargar estos ficheros según la model card.
- Configuración probada: `-ngl 99 -ot exps=CPU -lm mmap -fit off -b 2048 -ub 2048 -fa on -ctk q8_0 -ctv q8_0 -t 8 -tb 16 --jinja --reasoning-format deepseek`, con `GGML_VK_DISABLE_ASYNC=1` y `GGML_VK_UMA_STREAM_READ=1`. Si la build no cabe en RAM, añadir `--no-op-offload` para evitar relecturas de expertos desde disco en cada batch.
- Latencia y throughput: 8,4 tok/s de generación en contexto corto y 6,0 tok/s con prompt de 10K a contexto completo; el procesamiento de prompt cae de 62–75 tok/s (2K) a 42 tok/s (16K) porque la atención dispersa QSA se aplica como máscara densa en el fork, no como kernel disperso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento de modelos comparables de la misma categoría (MoE de ~55.000 millones de parámetros con contexto de 262.144 tokens), por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- No apto para producción: el autor lo declara explícitamente como work in progress, con ficheros que pueden cambiar o reemplazarse sin aviso.
- Aritmética y razonamiento multi-paso poco fiables en todas las builds, y notablemente peores en las de 2 bits (3 de 8 aciertos en generación libre con IQ2_XXS-RAMFIT).
- El pensamiento largo puede divagar sin llegar a una respuesta; se recomiendan los parámetros DRY documentados (multiplicador 0,8, base 1,75, longitud permitida 4).
- La decodificación especulativa con la cabeza MTP no aporta nada: 0 % de aceptación sobre este modelo latente.
- Solo se han medido las cifras de la sonda y de velocidad; no hay evaluación de suites de benchmark, contexto largo, tareas de seguridad ni seguridad/alinhación.
- Hereda las limitaciones del modelo fuente: los hallazgos, código y comandos generados pueden ser erróneos o fabricados, y su reducida sobre-negativa facilita obtener salidas dañinas.
- La licencia qwen-community-license-1.0 impone condiciones adicionales al uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue productivo.
- Dependencia de un fork no estándar de llama.cpp: no hay soporte en herramientas de inferencia convencionales, lo que limita la portabilidad y el mantenimiento.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/freakyskittle/CYBER-FROST-3.8-110B-Latent-RAMFit-GGUF
- Modelo base BF16: https://huggingface.co/freakyskittle/CYBER-FROST-3.8-110B-Latent-BF16-reasoning
- Carpeta de la build destacada: https://huggingface.co/freakyskittle/CYBER-FROST-3.8-110B-Latent-RAMFit-GGUF/tree/main/IQ2_XXS-RAMFIT
- Matriz de importancia: `imatrix-pass3.gguf` (incluida en el repositorio)
- Licencia: archivo `LICENSE` en el repositorio
- Fork de llama.cpp requerido (`llama.cpp-bigmoe`): no se proporciona URL en la información disponible
