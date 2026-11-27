# Deadcracker23/Qwen2.5-Coder-14B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-14B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Qwen2.5-Coder-14B-Instruct, desarrollado por Alibaba Cloud (equipo Qwen) y publicado en este repositorio por el usuario Deadcracker23. Se trata de un modelo de lenguaje causal especializado en codigo, ajustado por instrucciones, que forma parte de la familia Qwen2.5-Coder (antes CodeQwen), disponible en seis tamanos: 0.5B, 1.5B, 3B, 7B, 14B y 32B. El modelo base fue entrenado sobre 5,5 billones de tokens que incluyen codigo fuente, text-code grounding y datos sinteticos.

La relevancia de esta variante GGUF radica en que permite ejecutar un modelo de 14.700 millones de parametros en hardware de consumo mediante llama.cpp y sus derivados (Ollama, LM Studio), sin necesidad de GPUs de datacenter. El modelo conserva las capacidades del original en generacion de codigo, razonamiento sobre codigo y correccion de errores, ademas de mantener competencias en matematicas y tareas generales.

Arquitectonicamente es un transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV de la atencion, con 48 capas y atencion GQA (40 cabezas de consulta y 8 de clave-valor). La longitud de contexto completa es de 32.768 tokens en esta version GGUF, aunque el modelo original soporta hasta 131.072 tokens mediante extrapolacion YARN (solo disponible en vLLM para la variante no cuantizada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo QKV en atencion |
| Parametros totales | 14.770.033.664 (14,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en GGUF; hasta 131.072 con YARN en vLLM (modelo no GGUF) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (segmentado en multiples archivos para tamanos grandes) |
| Capas | 48 |
| Cabezas de atencion | 40 para Q, 8 para KV (GQA) |
| Parametros sin embeddings | 13,1B |
| Tamano del repositorio | 195,9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con 48 capas, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios posicionales (RoPE). Emplea atencion con query-key-value bias y grouped-query attention (GQA) con 40 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de memoria en la cache KV durante la inferencia. Los parametros sin embeddings ascienden a 13,1B de los 14,7B totales.

El entrenamiento se realizo en dos fases: preentrenamiento y postentrenamiento. El preentrenamiento utilizo 5,5 billones de tokens compuestos por codigo fuente, text-code grounding (pares texto-codigo), datos sinteticos y datos de texto general. El postentrenamiento incluye ajuste por instrucciones, orientado a mejorar la generacion, el razonamiento y la correccion de codigo, asi como a preservar competencias en matematicas y tareas generales. El modelo base emplea la arquitectura y los datos de Qwen2.5, sobre los que se especializa en codigo. No se detalla en la informacion disponible si se aplicaron tecnicas de RLHF o DPO especificas.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion.
- Razonamiento sobre codigo: explicacion, analisis y depuracion de fragmentos.
- Correccion de codigo (code fixing) y refactorizacion.
- Generacion aumentada por recuperacion de codigo (text-code grounding).
- Capacidades matematicas y de razonamiento general heredadas de Qwen2.5.
- Soporte de conversacion multi-turno en modo chat (instrucciones).
- Modo de conversacion nativo en llama.cpp (`-cnv`) con prompt de sistema.
- Capacidades de agente de codigo (code agents) segun la model card del modelo base.
- Soporte de contexto largo (hasta 32K en GGUF).
- No se documenta en la informacion disponible soporte explicito de tool calling, vision ni audio.

## Casos de uso

- Asistente de programacion en local: el modelo puede ejecutarse con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo, ofreciendo autocompletado y generacion de funciones sin enviar codigo a servicios externos.
- Depuracion y correccion de errores: dado un fragmento de codigo con fallos, el modelo puede identificar el problema y proponer una version corregida, gracias a su entrenamiento especifico en code fixing.
- Generacion de tests unitarios: a partir de una funcion o modulo, el modelo puede producir casos de prueba, aprovechando su comprension de text-code grounding.
- Explicacion de codigo heredado: el modelo puede analizar fragmentos de codigo desconocido y generar documentacion o explicaciones paso a paso, util en tareas de mantenimiento.
- Refactorizacion asistida: con 32K tokens de contexto, puede procesar modulos completos y proponer mejoras estructurales sin perder la vision del conjunto.
- Ensenanza de programacion: en modo conversacional multi-turno, puede actuar como tutor que responde dudas, corrige ejercicios y explica conceptos, con la ventaja de ejecutarse en hardware local.
- Prototipado rapido de scripts: generacion de scripts de automatizacion, parsing o procesamiento de datos en entornos sin conectividad o con requisitos de privacidad.
- Integracion en pipelines de CI/CD: mediante llama.cpp como servidor local, puede usarse para revisiones automatizadas de codigo o generacion de parches en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5-Coder para los resultados detallados de evaluacion y a la documentacion de Qwen para los requisitos de memoria y throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto):
  - q2_K: en torno a 6-7 GB.
  - q3_K_M: en torno a 7-8 GB.
  - q4_0 / q4_K_M: en torno a 9-10 GB.
  - q5_0 / q5_K_M: en torno a 11-12 GB.
  - q6_K: en torno a 13-14 GB.
  - q8_0: en torno a 16-17 GB.
- GPU recomendadas: para cuantizaciones altas (q6_K, q8_0), GPU con 16-24 GB de VRAM como RTX 4090, RTX 3090, A10G o A100. Para cuantizaciones medias (q4_K_M, q5_K_M), GPU de 12-16 GB como RTX 4070 Ti, RTX 4080 o RTX 3080.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas para cuantizaciones q4 y q5; las cuantizaciones q2 y q3 caben en GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (recomendado por la model card), Ollama, LM Studio, y servidores compatibles con endpoints (tag `endpoints_compatible`). Para contexto completo de 131K con YARN se requiere vLLM sobre el modelo no cuantizado.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la pagina de speed benchmark de Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct (GGUF, este repo) | 14,7B | 32K (GGUF) / 131K con YARN (vLLM) | Apache 2.0 | GGUF | Especializado en codigo, ajustado por instrucciones |
| Qwen2.5-Coder-32B-Instruct | 32B | 131K | Apache 2.0 | safetensors / GGUF | Version mayor de la misma familia; segun la model card, iguala a GPT-4o en codigo |
| Qwen2.5-Coder-7B-Instruct | 7B | 131K | Apache 2.0 | safetensors / GGUF | Version menor de la misma familia, menor huella de memoria |
| CodeQwen1.5 (generacion anterior) | 7B | 64K | Apache 2.0 | safetensors / GGUF | Predecesor de la familia; la model card indica mejoras significativas en Qwen2.5-Coder |

No se dispone en la informacion proporcionada de datos de benchmarks que permitan comparar el rendimiento numerico con modelos de otros desarrolladores.

## Limitaciones y advertencias

- El modelo esta declarado unicamente para ingles en la model card; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo sintacticamente correcto pero funcionalmente incorrecto, o inventar APIs y librerias.
- La version GGUF limita el contexto a 32.768 tokens; la extrapolacion YARN hasta 131.072 solo esta soportada en vLLM con el modelo no cuantizado.
- Las cuantizaciones agresivas (q2_K, q3_K_M) degradan la calidad de generacion de codigo; para produccion se recomienda q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio base para confirmar terminos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente sin validacion comunitaria.
- El modelo puede reproducir sesgos presentes en los datos de entrenamiento (codigo fuente publico, datos sinteticos), incluyendo sesgos de estilo, lenguaje y practicas de programacion.
- No se documentan en la informacion disponible capacidades de tool calling, vision o audio, lo que limita su uso en pipelines de agentes que requieran function calling estructurado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Deadcracker23/Qwen2.5-Coder-14B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Version GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct-GGUF
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Speed benchmark: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct-GGUF/blob/main/LICENSE
