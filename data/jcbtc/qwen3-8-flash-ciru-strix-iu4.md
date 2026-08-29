# jcbtc/Qwen3.8-Flash-CIRU-STRIX-IU4

## Resumen

Qwen3.8-Flash-CIRU-STRIX-IU4 es un build personalizado del modelo Qwen3.8-Flash-Next, desarrollado por jcbtc en colaboración con CIRU, una empresa especializada en optimización de infraestructura de inferencia. Se trata de una versión cuantizada y adaptada específicamente para el hardware AMD Strix Halo (Ryzen AI Max+ 395 con GPU integrada Radeon 8060S, arquitectura gfx1151), con el objetivo de lograr inferencia local rápida y de alta calidad en un entorno de memoria unificada.

El modelo base, Qwen3.8-Flash-Next, es un modelo de mezcla de expertos (MoE) con aproximadamente 125.700 millones de parámetros totales, que incorpora una arquitectura de atención híbrida GDN + QSA (según el repositorio oficial de Qwen). Este build concreto aplica una cuantización mixta por capas: los pesos de los expertos enrutados se almacenan en Q4_1, mientras que el núcleo protegido se mantiene en Q5_K, Q5_1, Q8_0, BF16 o F32. Además, introduce dos innovaciones técnicas: un sistema de paginación desde NVMe para pesos FP8 exactos (PLE) y un mecanismo de decodificación especulativa multi-token (MTP) con un draft Q8_0.

La relevancia de este modelo radica en que demuestra cómo adaptar un LLM de gran tamaño a hardware de consumo específico (APU con gran memoria unificada) mediante técnicas de cuantización selectiva, paginación desde SSD y decodificación especulativa, logrando rendimientos de hasta 30,8 tokens por segundo en generación con contexto de 8K tokens. No es un modelo standalone: requiere un runtime personalizado de llama.cpp (fork de CIRU) y los archivos auxiliares de PLE y MTP para funcionar correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atencion hibrida GDN + QSA (basada en Qwen3.8-Flash-Next) |
| Parametros totales | 125.743.653.760 (125,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (nativo); medido hasta 131.072 tokens de prompt en frio |
| Tipos de cuantizacion | Mezcla: Q4_1 (expertos enrutados), Q5_K, Q5_1, Q8_0, BF16, F32 (nucleo); MTP draft en Q8_0; PLE en FP8 E4M3 exacto |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen, no permisiva estandar) |
| Formato de pesos | GGUF (llama.cpp) con sidecars: archivo PLE (manifest, payload, scale) y MTP draft |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce una arquitectura de atencion hibrida que combina GDN (Gated Delta Network) y QSA (Quadruple Slot Attention), segun el repositorio oficial de Qwen. Esta combinacion busca mejorar la eficiencia computacional y la capacidad del modelo manteniendo un coste de entrenamiento estable. El modelo es de tipo MoE, con 125,7 B de parametros totales, aunque no se ha especificado el numero de parametros activos por token.

Este build concreto no es un modelo entrenado desde cero, sino una cuantizacion y adaptacion del modelo original. La cuantizacion es selectiva: los pesos de los expertos enrutados se almacenan en Q4_1, mientras que el nucleo del modelo (capas criticas) se mantiene en precisiones superiores (Q5_K, Q5_1, Q8_0, BF16 o F32). Ademas, incorpora dos innovaciones tecnicas propias de CIRU:

- PLE (Paged Exact FP8): los pesos de ciertas capas se almacenan en formato FP8 E4M3 exacto y se pagan desde NVMe a memoria con una cache de 4 GiB de paginas decodificadas. Esto permite mantener precision alta sin ocupar memoria RAM de forma permanente.
- MTP (Multi-Token Prediction): se incluye un modelo draft en Q8_0 que permite decodificacion especulativa con profundidad 3, acelerando la generacion de tokens.

El runtime personalizado (fork de llama.cpp) es obligatorio; el stock de llama.cpp y la inferencia alojada en Hugging Face no pueden ejecutar este paquete correctamente.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de tareas de lenguaje general, y los benchmarks locales muestran un alto rendimiento en tareas de razonamiento (ARC-Challenge 97,53 %).
- Generacion de codigo: resultados destacados en HumanEval (97,56 %) y HumanEval+ (94,51 %) en ejecuciones locales personalizadas.
- Tool calling / function calling: soportado, con resultados en ToolEval Standard (83,33 %) y ToolEval Hard (76,67 %) en casos locales.
- Soporte para agentes y razonamiento multi-paso: el modelo puede encadenar llamadas a herramientas y razonar sobre multiples pasos, como indican los resultados de ToolEval.
- Contexto largo: configuracion nativa de 262.144 tokens, con rendimiento medido en frio hasta 131.072 tokens de prompt. Esto permite procesar documentos extensos, codigo fuente completo o conversaciones largas en una sola pasada.
- Decodificacion especulativa: gracias al draft MTP, la generacion se acelera (30,80 tok/s con profundidad 3 en contexto 8K).
- Solo texto: la model card indica explicitamente que es una version solo de texto, sin capacidades multimodales.

## Casos de uso

- Inferencia local en hardware AMD Strix Halo: el caso principal. Un desarrollador con un Ryzen AI Max+ 395 puede ejecutar un LLM de 125 B con cuantizacion mixta y paginacion NVMe, obteniendo rendimiento util para tareas interactivas sin depender de la nube.
- Asistente de programacion local: con soporte de tool calling y alta precision en HumanEval, puede integrarse en entornos de desarrollo (IDEs, terminales) para autocompletar codigo, generar tests o refactorizar funciones, manteniendo los datos en local.
- Procesamiento de documentos largos: gracias al contexto de 262K tokens, puede resumir, analizar o extraer informacion de libros tecnicos, informes extensos o codebases completos en una sola consulta.
- Agente autonomo con razonamiento multi-paso: su capacidad de tool calling y razonamiento permite construir agentes que consulten APIs, ejecuten comandos o naveguen por bases de datos, con verificacion de resultados intermedios.
- Desarrollo de prototipos en edge computing: en entornos con restricciones de conectividad o privacidad, este modelo ofrece una alternativa local a APIs en la nube, con rendimiento suficiente para tareas de generacion y analisis.
- Investigacion en optimizacion de inferencia: el build sirve como referencia para estudiar tecnicas de cuantizacion mixta, paginacion desde SSD y decodificacion especulativa en hardware AMD, util para investigadores y desarrolladores de motores de inferencia.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, obtenidos con los mismos artefactos del modelo en un runtime anterior (H96 depth-1). No se han rerun en el runtime H121 depth-3, por lo que deben considerarse indicativos.

| Benchmark | Resultado | Alcance |
|---|---|---|
| HumanEval | 160/164 (97,56 %) | Ejecucion local personalizada completa (164 tareas) |
| HumanEval+ | 155/164 (94,51 %) | Ejecucion EvalPlus completa |
| ARC-Challenge | 1.143/1.172 (97,53 %) | Dataset EvalScope completo |
| ToolEval Standard | 115/138 puntos (83,33 %) | 69 casos locales personalizados |
| ToolEval Hard | 23/30 puntos (76,67 %) | 15 casos locales personalizados |

Rendimiento en el runtime H121 (medido en Ryzen AI Max+ 395):

| Metrica | Valor |
|---|---|
| Prefill en frio (8K tokens) | 359,43 tok/s |
| Generacion (128 tokens, MTP depth 3) | 30,80 tok/s |
| Cobertura de contexto largo | 131.072 tokens de prompt (escalera de contexto en frio) |

Estos resultados son locales y personalizados; no se presentan como envios oficiales a leaderboards.

## Requisitos de hardware

- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo) con GPU integrada Radeon 8060S, arquitectura gfx1151. No se garantiza funcionamiento en otras GPUs AMD o NVIDIA.
- Toolchain: ROCm/TheRock 10-class, compilacion para gfx1151. Se requiere Linux x86-64 (tambien documentado para NixOS, WSL2 y Windows con CPU nativo).
- Memoria: el APU Strix Halo ofrece hasta 128 GB de memoria unificada, suficiente para cargar el modelo completo (126,6 GiB de paquete) y la cache de paginas PLE.
- Almacenamiento: se requiere un SSD NVMe para el sidecar PLE (48,8 GiB) y para paginar los pesos FP8 durante la inferencia. La cache de paginas decodificadas es de 4 GiB en RAM.
- VRAM estimada: no aplica de forma tradicional, ya que la memoria es unificada entre CPU y GPU. El modelo completo ocupa aproximadamente 126,6 GiB en disco, y la carga en memoria depende de la cuantizacion y la paginacion.
- Opciones de despliegue: exclusivamente el runtime CIRU llama.cpp (fork) version v1.0.0-h121. No compatible con llama.cpp estandar, Ollama, vLLM o TGI.
- Latencia y throughput: prefill de 359 tok/s y generacion de 30,8 tok/s en contexto 8K, medidos en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-CIRU-STRIX-IU4 (este) | 125,7 B (MoE) | 262K nativo | Mixta (Q4_1/Q5_K/Q8_0/BF16/F32) + PLE FP8 | AMD Strix Halo (gfx1151) | qwen-community-1.0 |
| Qwen3.8-Flash-Next (base) | 125,7 B (MoE) | 1M (segun QwenCloud) | FP8 (version oficial) | Multiplataforma (GPU NVIDIA, AMD, CPU) | qwen-community-1.0 |
| Qwen3.8-27B-IU4-Kairic-Edge (otro build de jcbtc) | 27 B (MoE) | no disponible | IU4 (Q4_1) | AMD Strix Halo (gfx1151) | qwen-community-1.0 |

El build CIRU se diferencia del modelo base por su adaptacion especifica a Strix Halo, con cuantizacion selectiva y paginacion NVMe, a costa de perder portabilidad. El modelo de 27B de jcbtc es una alternativa mas ligera para el mismo hardware, con menor requisito de memoria.

## Limitaciones y advertencias

- No es un modelo standalone: requiere el runtime CIRU llama.cpp (fork) y los archivos PLE y MTP. El stock de llama.cpp y la inferencia alojada en Hugging Face no pueden ejecutarlo.
- Solo texto: no soporta entradas multimodales (imagen, audio, video), a diferencia del Qwen3.8-Flash original que es multimodal.
- Hardware restringido: optimizado exclusivamente para AMD Strix Halo (gfx1151). No se garantiza funcionamiento en otras plataformas, y la compilacion requiere ROCm/TheRock 10-class.
- Licencia qwen-community-1.0: es una licencia comunitaria de Qwen, no una licencia open source estandar (Apache/MIT). Puede imponer restricciones de uso comercial o de redistribucion; se recomienda revisar los terminos completos antes de usar en produccion.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo o con contextos muy largos.
- Sesgos: no se han publicado evaluaciones de sesgo o seguridad para este build concreto; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Benchmarks limitados: los resultados reportados son locales y personalizados, no verificados por terceros ni comparables directamente con leaderboards oficiales.
- Dependencia de NVMe: el rendimiento de PLE depende criticamente de la velocidad del SSD; un NVMe lento puede degradar la inferencia.
- Correccion de errores: el runtime H121 corrige un fallo de paginacion en MTP depth-3, pero los benchmarks de calidad no se han rerun en esta version, por lo que los numeros pueden variar ligeramente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcbtc/Qwen3.8-Flash-CIRU-STRIX-IU4
- Runtime CIRU (fork de llama.cpp): https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Pagina de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Documentacion de Qwen3.8-Flash en Alibaba Cloud: https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen3-8-flash
- Build similar de jcbtc (Qwen3.8-27B-IU4-Kairic-Edge): https://huggingface.co/jcbtc/Qwen3.8-27B-IU4-Kairic-Edge
