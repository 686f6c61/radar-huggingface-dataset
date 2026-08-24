# rbinrs/Laguna-XS-2.1

## Resumen

Laguna XS 2.1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 33 000 millones de parametros totales y 3 000 millones activos por token, desarrollado originalmente por poolside y re-publicado en este repositorio por el usuario rbinrs. Esta disenado especificamente para tareas de codificacion agente (agentic coding) y trabajos de horizonte largo que requieren multiples pasos de razonamiento y uso de herramientas, con la particularidad de poder ejecutarse en una maquina local con recursos modestos.

El modelo es una version mejorada de Laguna XS.2, con un incremento del 5,4 % en SWE-bench Multilingual y mejor rendimiento en tareas de tipo terminal. Su arquitectura combina atencion de ventana deslizante (SWA) y atencion global en proporcion 3:1, con 40 capas en total, y ofrece una ventana de contexto de 262 144 tokens. Se distribuye bajo la licencia OpenMDW-1.1, totalmente permisiva para uso comercial y no comercial.

La relevancia actual del modelo radica en que ofrece capacidades de razonamiento nativo con pensamiento intercalado entre llamadas a herramientas, cache KV cuantizada en FP8 para reducir el consumo de memoria, y soporte oficial en Ollama, llama.cpp, vLLM, SGLang y TensorRT-LLM, lo que lo convierte en una opcion practica para equipos que necesitan un modelo agente potente sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion mixta SWA/global |
| Parametros totales | 33 442 617 088 (33,4 B) |
| Parametros activos | 3 B por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | FP8, NVFP4, INT4, GGUF (q4_K_M, q8_0, bf16) |
| Idiomas soportados | No disponible (el modelo obtiene buenos resultados en SWE-bench Multilingual, lo que sugiere soporte multilingue para codigo) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Laguna XS 2.1 utiliza una arquitectura MoE con 256 expertos y 1 experto compartido, distribuidos en 40 capas. De estas, 10 capas emplean atencion global y 30 capas utilizan atencion de ventana deslizante (SWA) con una ventana de 512 tokens, en proporcion 3:1. El modelo emplea gating sigmoide con escalas rotatorias por capa (per-layer rotary scales) y cuantiza la cache KV en FP8, lo que reduce la memoria necesaria por token durante la inferencia.

El entrenamiento se realizo en varias fases: pre-entrenamiento, post-entrenamiento y aprendizaje por refuerzo (RL). El optimizador utilizado fue Muon. Segun el informe tecnico de poolside, el proceso incluye tecnicas de automixing de datos y RL agente asincrono off-policy. El modelo soporta razonamiento nativo con pensamiento intercalado entre llamadas a herramientas, y permite habilitar o deshabilitar el modo de pensamiento por peticion.

## Capacidades

- Generacion de texto y codigo con razonamiento multi-paso intercalado entre llamadas a herramientas.
- Soporte de tool calling / function calling, integrado con el modo de pensamiento preservado.
- Capacidades agente para tareas de larga duracion (long-horizon), con hasta 500 pasos en el harness de evaluacion.
- Razonamiento nativo con modo thinking habilitable o deshabilitable por peticion.
- Rendimiento destacado en tareas de tipo terminal (Terminal-Bench 2.0) y resolucion de incidencias de software (SWE-bench).
- Soporte multilingue para tareas de codificacion, avalado por resultados en SWE-bench Multilingual.
- Compatibilidad con multiples motores de inferencia: Ollama, llama.cpp, vLLM, SGLang y TensorRT-LLM.

## Casos de uso

- Resolucion automatica de incidencias en repositorios de codigo: el modelo puede analizar issues, generar parches y validar soluciones en entornos sandbox, gracias a su ventana de contexto de 262 144 tokens y su capacidad de razonamiento intercalado con llamadas a herramientas.
- Asistente de terminal y operaciones DevOps: su rendimiento en Terminal-Bench 2.0 lo hace adecuado para automatizar comandos, diagnosticar errores de sistema y ejecutar tareas administrativas de forma agente.
- Generacion de codigo en produccion con integracion en pipelines de CI/CD: soporta tool calling y puede integrarse en flujos automatizados de revision de codigo, generacion de tests y correccion de fallos.
- Desarrollo local asistido en equipos sin GPU dedicada: al requerir solo 3 B de parametros activos, puede ejecutarse en un Mac con 36 GB de RAM, lo que permite a desarrolladores individuales usar un modelo agente potente en su maquina de trabajo.
- Automatizacion de tareas de mantenimiento de software: su capacidad para trabajar con contextos largos permite analizar codebases extensos, detectar deuda tecnica y proponer refactorizaciones.
- Prototipado rapido de agentes conversacionales con herramientas: la combinacion de razonamiento intercalado, tool calling y licencia permisiva facilita construir asistentes personalizados que consultan APIs, bases de datos o servicios externos.

## Benchmarks y rendimiento

Los resultados publicados por poolside, obtenidos con el harness de agente propio (pool) y el framework Harbor de Laude Institute, con un maximo de 500 pasos, temperatura 1,0, top_k 20 y top_p 1, con modo thinking habilitado y contexto de 256K tokens, son los siguientes:

| Modelo | Parametros totales | SWE-bench Verified | SWE-bench Multilingual | SWE-Bench Pro | Terminal-Bench 2.0 |
|---|---|---|---|---|---|
| **Laguna XS 2.1** | 33B | 70,9 % | 63,1 % | 47,6 % | 37,5 % |
| Laguna XS.2 | 33B | 69,9 % | 57,7 % | 46,3 % | 35,7 % |
| Qwen3.6-35B-A3B | 35B | 73,4 % | 67,2 % | 49,5 % | 51,5 % |
| North Mini Code | 30B | 67,6 % | - | 40,2 % | 36,0 % |
| MAI-Code-1-Flash | 137B | 71,6 % | 65,5 % | 51,2 % | 54,8 % |
| gpt-oss-120B | 120B | - | - | 16,2 % | 18,7 % |
| Claude Haiku 4.5 | - | 73,3 % | - | 39,5 % | 29,8 % |
| GPT-5.4 Nano | - | - | - | 52,4 % | 46,3 % |

Los datos de los modelos comparados corresponden a las puntuaciones publicas mas altas referenciadas, segun indica poolside. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en cuantizacion q4_K_M ocupa aproximadamente 20,3 GB, lo que permite ejecutarlo en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Para la version sin cuantizar (bf16), el tamano del repositorio es de 66,9 GB, lo que requiere GPUs profesionales como A100 (80 GB) o H100 (80 GB), o bien multiples GPUs.
- El modelo esta disenado para ejecutarse localmente en un Mac con 36 GB de RAM, segun indica poolside, gracias a sus 3 B de parametros activos.
- Opciones de despliegue: Ollama (etiqueta `laguna-xs-2.1`), llama.cpp, vLLM, SGLang y TensorRT-LLM, con GGUFs oficiales disponibles.
- Se mencionan especuladores DFlash oficiales para acelerar la decodificacion, aunque no se proporcionan datos de latencia o throughput concretos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| **Laguna XS 2.1** | 33B | 3B | 262 144 | 70,9 % | OpenMDW-1.1 |
| Qwen3.6-35B-A3B | 35B | 3B | No disponible | 73,4 % | No disponible |
| North Mini Code | 30B | No disponible | No disponible | 67,6 % | No disponible |
| MAI-Code-1-Flash | 137B | No disponible | No disponible | 71,6 % | No disponible |

Laguna XS 2.1 se posiciona como una opcion competitiva frente a Qwen3.6-35B-A3B, su rival mas directo en la categoria de MoE compactos con 3B activos, aunque Qwen3.6-35B-A3B le supera en todos los benchmarks publicados. Su ventaja principal frente a alternativas de mayor tamano como MAI-Code-1-Flash (137B) es la capacidad de ejecutarse en hardware local modesto, con un coste de rendimiento relativamente pequeno. La licencia OpenMDW-1.1, totalmente permisiva, es un diferenciador importante frente a modelos con restricciones de uso comercial.

## Limitaciones y advertencias

- El repositorio rbinrs/Laguna-XS-2.1 es una re-publicacion del modelo original de poolside; se recomienda verificar la autenticidad de los pesos antes de su uso en produccion.
- No se dispone de informacion sobre sesgos conocidos ni evaluaciones de seguridad o alineacion en la documentacion disponible.
- El modelo esta orientado principalmente a tareas de codificacion y terminal; su rendimiento en tareas generales de lenguaje o razonamiento no tecnico no esta documentado.
- Los idiomas soportados no se especifican; aunque el modelo rinde bien en SWE-bench Multilingual, no hay garantia de soporte uniforme para todos los idiomas en tareas conversacionales.
- La ventana de contexto de 262 144 tokens es amplia, pero el uso de atencion de ventana deslizante de 512 tokens en 30 de las 40 capas puede limitar la capacidad de atender a informacion distante dentro del contexto.
- Los benchmarks publicados se obtuvieron con un harness de agente especifico y parametros de muestreo concretos; los resultados pueden variar en otros entornos de despliegue.
- La licencia OpenMDW-1.1 es permisiva, pero se recomienda revisar sus terminos completos para usos comerciales especificos, especialmente en lo relativo a indemnizacion y soporte.

## Enlaces

- Repositorio HuggingFace (rbinrs): https://huggingface.co/rbinrs/Laguna-XS-2.1
- Repositorio HuggingFace original (poolside): https://huggingface.co/poolside/Laguna-XS-2.1
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-xs-2-1
- Pagina de modelos de poolside: https://poolside.ai/models
- Informe tecnico: https://poolside.ai/assets/laguna/laguna-m1-xs2-technical-report.pdf
- Coleccion de cuantizaciones: https://huggingface.co/collections/poolside/laguna-xs-21
- Uso en OpenRouter: https://openrouter.ai/poolside/laguna-xs-2.1
- Modelo en Ollama: https://ollama.com/library/laguna-xs-2.1
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/25165
- Licencia OpenMDW: https://openmdw.ai/
- Ficha en The AI Bench: https://theaibench.ai/models/laguna-xs-2-1/
