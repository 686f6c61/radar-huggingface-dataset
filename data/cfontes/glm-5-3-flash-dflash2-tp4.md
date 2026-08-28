# cfontes/glm-5.3-flash-dflash2-tp4

## Resumen

GLM-5.3-Flash es un modelo de lenguaje multimodal de gran escala desarrollado por Z.ai, la primera entrega de la serie GLM-5. Con 320 mil millones de parámetros totales y solo 18 mil millones activos, emplea una arquitectura de mezcla de expertos (MoE) que permite un rendimiento elevado con un coste computacional reducido. Su ventana de contexto alcanza 1 millón de tokens y admite entrada de imagen, vídeo y archivos, además de funciones de razonamiento, tool calling y salidas estructuradas. Según los datos publicados, supera a GLM-5.2 en benchmarks y se acerca a Claude Opus 4.8 en tareas de codificación y agénticas, con un coste de inferencia aproximadamente diez veces menor.

La variante aquí documentada, `cfontes/glm-5.3-flash-dflash2-tp4`, no es un modelo independiente sino una configuración de despliegue específica: utiliza los pesos NVFP4 de GLM-5.3-Flash (182 GB, 120 shards safetensors) junto con el modelo borrador DFlash2 (`incoai/GLM-5.3-Flash-DFlash2`, 2,2 GB) para decodificación especulativa por difusión de bloques. El despliegue se realiza sobre 4 nodos NVIDIA DGX Spark (GB10) con paralelismo tensorial de grado 4, alcanzando hasta 69,3 tokens por segundo en picos de codificación y 84,7 tokens por segundo agregados con concurrencia 4. Esta configuración está pensada para entornos de producción con hardware especializado y demuestra el potencial de la decodificación especulativa para acelerar la inferencia de modelos MoE de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención multi-cabeza, multimodal nativa |
| Parametros totales | 320 B |
| Parametros activos | 18 B |
| Longitud de contexto | 1 000 000 tokens (entrada), 131 072 tokens de salida máxima |
| Tipos de cuantizacion | NVFP4 (en esta configuración), también disponible en 1-bit y 3-bit según Unsloth |
| Idiomas soportados | No disponible (se presume multilingüe, pero no se especifica en las fuentes) |
| Licencia | No disponible (se describe como open source, sin detalle de licencia concreta) |
| Formato de pesos | Safetensors (120 shards para NVFP4), también GGUF para versiones cuantizadas |

## Arquitectura y entrenamiento

GLM-5.3-Flash emplea una arquitectura de mezcla de expertos con 320 B parámetros totales y 18 B activos por token, lo que reduce drásticamente el coste de inferencia frente a modelos densos de tamaño similar. Es el primer modelo nativamente multimodal de la serie GLM-5, capaz de procesar texto, imagen, vídeo y archivos directamente. La ventana de contexto de 1 M tokens permite manejar documentos extensos y conversaciones de largo recorrido. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en las fuentes consultadas.

La configuración específica documentada en este repositorio añade una capa de decodificación especulativa mediante el modelo borrador DFlash2, que predice bloques de tokens en paralelo. El borrador se integra en vLLM mediante un conjunto de parches que registran la arquitectura `DFlash2DraftModel`, capturan estados ocultos auxiliares de las capas 6, 15, 25, 34 y 43 del modelo objetivo, y ajustan el diseño de páginas KV para soportar atención no causal. El número de tokens especulativos es 7 y la caché KV se almacena en fp8_e4m3. Esta combinación permite acelerar la generación entre un 30 % y un 150 % según el tipo de prompt, con mayores ganancias en código y salidas estructuradas.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte de modo de pensamiento (reasoning) integrado.
- Codificación de software en múltiples lenguajes, incluyendo generación de scripts, algoritmos y corrección de errores.
- Comprensión multimodal: entrada de imágenes, vídeo y archivos, lo que permite tareas como descripción de capturas, análisis de diagramas o procesamiento de documentos escaneados.
- Tool calling y function calling: puede invocar herramientas externas y APIs, integrándose en flujos agénticos.
- Salidas estructuradas (JSON, esquemas) para integración con sistemas de producción.
- Prompt caching para reducir latencia en consultas repetidas.
- Multilingüe (idiomas no especificados en las fuentes, pero se asume cobertura amplia por tratarse de un modelo de propósito general).
- Decodificación especulativa DFlash2 en esta configuración, que acelera la generación en escenarios de código y salidas predecibles.

## Casos de uso

- Asistente de programación en tiempo real: el modelo puede generar código, explicar algoritmos y refactorizar funciones. Con la configuración DFlash2, alcanza picos de 69 tok/s en prompts de código, lo que lo hace adecuado para entornos de desarrollo interactivos donde la latencia importa.
- Agente autónomo de navegación web: gracias a su capacidad multimodal y de tool calling, puede interpretar capturas de pantalla, hacer clic en elementos y rellenar formularios, simulando un usuario humano. El contexto de 1 M tokens permite mantener el historial de acciones durante sesiones largas.
- Atención al cliente automatizada: con soporte de contexto largo y salidas estructuradas, puede gestionar conversaciones multi-turno, extraer intenciones y generar respuestas coherentes, integrándose con sistemas de ticketing.
- Análisis de documentos extensos: la ventana de 1 M tokens permite procesar contratos, informes o libros completos en una sola pasada, extrayendo resúmenes, cláusulas o datos clave.
- Generación de interfaces de usuario a partir de bocetos: al ser multimodal, puede recibir una imagen de un diseño y producir el código HTML/CSS correspondiente, útil para desarrollo frontend.
- Automatización de pruebas de software: puede generar casos de prueba, ejecutar scripts y analizar resultados, integrándose en pipelines de CI/CD mediante tool calling.
- Asistente de investigación: combina razonamiento, búsqueda en documentos y generación de informes estructurados, útil para revisión de literatura o análisis de datos.

## Benchmarks y rendimiento

Los benchmarks disponibles corresponden a la configuración específica con DFlash2 sobre 4× DGX Spark, medidos con la herramienta llm-inference-bench v0.4.29. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en las fuentes consultadas.

| Configuracion | tok/s (c1) | Accept Length | Accept Rate | tok/s (c4) | Prompt Type |
|:---|:---:|:---:|:---:|:---:|:---|
| GLM-5.3 MTP-4 (baseline) | 27,6 | 2,23 | — | 69,5 | mixto |
| DFlash2 (default temp) | 36,7 | 2,93 | 0,276 | 84,7 | mixto |
| DFlash2 (temp=0, codigo) | 69,3 | ~4,5 | — | — | codigo |
| tonyd2wild DFlash2 TP2 (codigo) | 46,9 | ~4,49 | — | — | codigo |
| tonyd2wild DFlash2 TP2 (estructurado, t=0) | 60,6 | ~5,0 | — | — | estructurado |
| tonyd2wild DFlash2 TP4 (codigo, abliterated) | 68,5 | ~4,49 | — | 100,1 (c6) | codigo |
| joesinvestments DFlash2 TP4 (codigo, t=0, SGLang) | 32,4 | — | — | — | codigo |
| joesinvestments DFlash2 TP4 (estructurado, t=0) | 48,1 | — | — | — | estructurado |

Nota: c1 y c4 indican concurrencia 1 y 4 respectivamente. El rendimiento de DFlash2 es muy dependiente del tipo de prompt: en código y salidas estructuradas se obtienen 48-74 tok/s, mientras que en prosa o prompts mixtos baja a 18-40 tok/s.

## Requisitos de hardware

- La configuración documentada requiere 4 nodos NVIDIA DGX Spark (GB10), cada uno con 128 GB de memoria unificada, conectados mediante red RoCEv2 (Mellanox ConnectX-7). El paralelismo tensorial es de grado 4 (una GPU por nodo).
- El modelo base NVFP4 ocupa 182 GB en disco (120 shards safetensors). El modelo borrador DFlash2 añade 2,2 GB adicionales.
- Para ejecutar el modelo completo con DFlash2 en esta configuración, se necesitan al menos 4×128 GB de memoria unificada, aunque la memoria efectiva disponible para el modelo es la de cada GPU individual (128 GB por nodo).
- Según Unsloth, el modelo GLM-5.3-Flash puede ejecutarse en configuraciones más ligeras: versión 1-bit en 102 GB de RAM/VRAM y versión 3-bit en 128 GB, mediante llama.cpp o Unsloth. Estas opciones no incluyen DFlash2.
- Para inferencia sin decodificación especulativa, el modelo NVFP4 puede desplegarse en un solo nodo con 128 GB de memoria (por ejemplo, una DGX Spark o una GPU con 128 GB), aunque con menor throughput.
- Opciones de despliegue: vLLM (con los parches específicos para DFlash2), llama.cpp, Ollama (para versiones cuantizadas), TGI. La configuración documentada usa vLLM 0.1.dev20051 con parches personalizados.
- Latencia y throughput: con concurrencia 1 y contexto 0, se obtienen 36,7 tok/s (default temp) y 39,9 tok/s (temp=0). Con concurrencia 4, el throughput agregado alcanza 84,7 tok/s. El tiempo hasta el primer token (TTFT) varía entre 0,19 s y 6,19 s según concurrencia y contexto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|:---|:---:|:---:|:---:|:---:|:---|
| GLM-5.3-Flash (este) | 320 B | 18 B | 1 M | No disponible | Multimodal, supera a GLM-5.2, rivaliza con Claude Opus 4.8 en coding |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible | Predecesor, superado por GLM-5.3-Flash en benchmarks |
| Claude Opus 4.8 | No disponible | No disponible | No disponible | Propietaria | Referencia en coding y agéntico, pero cerrado y costoso |
| DeepSeek-V3 (referencia MoE) | 671 B | 37 B | 128 K | MIT | MoE denso, buen rendimiento en código, pero sin multimodal |

No se dispone de datos cuantitativos de benchmarks estándar para comparar directamente con estos modelos. La comparación se basa en afirmaciones de los fabricantes y en el rendimiento de inferencia medido en esta configuración.

## Limitaciones y advertencias

- El rendimiento de DFlash2 es altamente dependiente del tipo de prompt: en prosa o prompts mixtos, la ganancia frente a la decodificación autora es modesta (36,7 vs 27,6 tok/s en c1), mientras que en código alcanza 69,3 tok/s. No es adecuado para cargas de trabajo con prompts muy variados.
- La configuración requiere hardware especializado (4× DGX Spark con RoCE) y un stack de software muy específico (vLLM con parches no oficiales). La reproducibilidad fuera de este entorno no está garantizada.
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base. Al ser un modelo de 320 B, es probable que presente sesgos presentes en sus datos de entrenamiento, pero no hay documentación al respecto.
- La licencia del modelo no está especificada en las fuentes consultadas. Aunque se describe como open source, no se indica si permite uso comercial o si tiene restricciones. Es necesario verificar la licencia oficial antes de usar en producción.
- El modelo base es multimodal, pero la configuración DFlash2 documentada solo cubre generación de texto. No se han probado capacidades multimodales en este despliegue.
- El tamaño del modelo (182 GB en NVFP4) y los requisitos de memoria hacen inviable su ejecución en GPUs de consumo (RTX 4090, etc.) sin cuantizaciones extremas (1-bit o 3-bit), que degradan la calidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/cfontes/glm-5.3-flash-dflash2-tp4
- Modelo borrador DFlash2: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Página de GLM-5.3 en OpenLM.ai: https://openlm.ai/glm-5.5/
- Referencia de GLM-5.3-Flash en LLM Reference: https://www.llmreference.com/model/glm-5.3-flash
- Guía de ejecución local en Unsloth: https://unsloth.ai/docs/models/glm-5.3-flash
- Ficha en Parasail: https://www.parasail.io/models/glm-53-flash
