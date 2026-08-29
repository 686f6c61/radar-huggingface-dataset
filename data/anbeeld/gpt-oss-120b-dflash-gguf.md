# Anbeeld/gpt-oss-120b-DFlash-GGUF

## Resumen

Anbeeld/gpt-oss-120b-DFlash-GGUF es un conjunto de cuantizaciones GGUF del modelo borrador (drafter) DFlash, desarrollado por el laboratorio z-lab en colaboración con Yotta Labs. Este drafter, de solo 0.8 mil millones de parámetros, se emplea para decodificación especulativa con el modelo objetivo GPT-OSS-120B de OpenAI. Su función es proponer bloques de tokens candidatos mediante un mecanismo de difusión de bloques (block diffusion), lo que permite acelerar la inferencia del modelo grande sin degradar la calidad de las respuestas.

El modelo se entrenó con 800.000 muestras extraídas de los datasets Nemotron-Post-Training-Dataset-v2 y evol-codealpaca-v1, donde las respuestas fueron regeneradas por el propio GPT-OSS-120B para garantizar coherencia con el modelo objetivo. La versión GGUF aquí presentada permite usar este drafter con BeeLlama.cpp, un fork de llama.cpp con características avanzadas de cuantización, además de los soportes ya existentes en SGLang y vLLM. Su relevancia actual radica en que ofrece una vía práctica para reducir la latencia de inferencia de un modelo de 120B en entornos de producción con una sola GPU de alta gama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de bloques (block diffusion language model) para decodificacion especulativa |
| Parametros totales | 0.8 mil millones (drafter) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes no especificadas en la ficha; se asume multiples niveles Q) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo original en z-lab/gpt-oss-120b-DFlash) |

## Arquitectura y entrenamiento

El modelo DFlash es un drafter ligero basado en difusión de bloques. A diferencia de los drafters autoregresivos convencionales, genera bloques completos de tokens (block size configurable entre 4 y 10) de forma paralela, lo que reduce el número de pasos de decodificación especulativa. La arquitectura subyacente no se detalla en la documentación proporcionada, pero los tags de HuggingFace indican relación con Qwen3 y el uso de safetensors, lo que sugiere una base transformer estándar adaptada al mecanismo de difusión.

El entrenamiento se realizó sobre 800.000 muestras de los datasets nvidia/Nemotron-Post-Training-Dataset-v2 y theblackcat102/evol-codealpaca-v1. Para cada muestra, la parte de respuesta fue regenerada usando el modelo objetivo openai/gpt-oss-120b, de modo que el drafter aprenda a predecir los patrones de generación específicos de ese modelo. No se menciona el uso de RLHF o DPO; el entrenamiento se centra en imitar la distribución de salida del modelo objetivo. El modelo se entrena con un block size de 10, aunque en inferencia se puede ajustar a 4, 6 o 10 según el equilibrio deseado entre velocidad y tasa de aceptación.

## Capacidades

- Decodificacion especulativa: genera bloques de tokens candidatos para el modelo GPT-OSS-120B, acelerando la inferencia entre 1.2× y 1.9× según la tarea y la concurrencia.
- Compatibilidad con multiples frameworks: soportado en SGLang (via `--speculative-algorithm DFLASH`), vLLM (via `--speculative-config` con metodo `dflash`) y BeeLlama.cpp (fork de llama.cpp).
- Ajuste del block size: permite configurar el numero de tokens especulativos (3, 5 o 9) para adaptarse a diferentes cargas de trabajo.
- Integracion con el ecosistema de GPT-OSS: disenado especificamente para funcionar con openai/gpt-oss-120b, aprovechando su formato de chat y capacidades de razonamiento.
- Eficiencia de memoria: al ser un modelo de 0.8B, ocupa muy poca VRAM adicional (menos de 2 GB en FP16) comparado con el modelo principal.

## Casos de uso

- Inferencia de GPT-OSS-120B en produccion con baja latencia: desplegar el drafter junto al modelo grande en un servidor SGLang o vLLM reduce el tiempo de respuesta para aplicaciones interactivas como chatbots o asistentes de codigo, especialmente con concurrencia baja (1-16 peticiones simultaneas).
- Servicios de razonamiento matematico: en tareas como GSM8K o Math500, el speedup alcanza hasta 1.9× con block size 10, lo que permite responder consultas complejas de calculo y demostraciones en menos tiempo.
- Generacion de codigo en entornos CI/CD: con HumanEval y MBPP se obtienen speedups de 1.7×-1.8×, acelerando la generacion de tests unitarios, documentacion o snippets en pipelines de integracion continua.
- Evaluacion de modelos a gran escala: investigadores que necesitan ejecutar multiples prompts sobre GPT-OSS-120B (por ejemplo, para benchmarks) pueden usar el drafter para reducir el tiempo total de evaluacion sin alterar los resultados.
- Despliegue en hardware limitado: al usar cuantizaciones GGUF del drafter, se puede ejecutar en CPU o GPUs modestas junto al modelo principal cuantizado, habilitando inferencia acelerada en entornos sin GPUs de ultima generacion.
- Experimentacion academica con decodificacion especulativa: el modelo sirve como referencia para estudiar metodos de difusion de bloques en comparacion con drafters autoregresivos, gracias a su licencia MIT y la disponibilidad del codigo fuente en GitHub.

## Benchmarks y rendimiento

Los resultados publicados se centran en la tasa de aceptacion (acceptance length) y el speedup end-to-end sobre una unica GPU H200 usando SGLang, con reasoning effort medio.

**Acceptance length (numero medio de tokens aceptados por bloque)**

| Tarea | Block size = 4 | Block size = 6 | Block size = 10 |
|---|---|---|---|
| GSM8K | 3.3 | 4.3 | 5.3 |
| Math500 | 3.3 | 4.3 | 5.4 |
| HumanEval | 3.1 | 3.8 | 4.4 |
| MBPP | 3.1 | 3.9 | 4.6 |
| MT-Bench | 2.7 | 3.3 | 3.7 |

**Speedup end-to-end (incluye prefill) para GSM8K**

| Concurrencia | Block size = 4 | Block size = 10 |
|---|---|---|
| 1 | 1.3× | 1.8× |
| 8 | 1.2× | 1.6× |
| 16 | 1.3× | 1.6× |
| 32 | 1.2× | 1.5× |
| 64 | 1.2× | 1.5× |

**Speedup end-to-end para Math500**

| Concurrencia | Block size = 4 | Block size = 10 |
|---|---|---|
| 1 | 1.5× | 1.9× |
| 8 | 1.4× | 1.7× |
| 16 | 1.5× | 1.6× |
| 32 | 1.4× | 1.5× |
| 64 | 1.4× | 1.5× |

**Speedup end-to-end para HumanEval**

| Concurrencia | Block size = 4 | Block size = 10 |
|---|---|---|
| 1 | 1.3× | 1.7× |
| 8 | 1.4× | 1.7× |
| 16 | 1.4× | 1.8× |
| 32 | 1.5× | 1.7× |
| 64 | 1.4× | 1.5× |

**Speedup end-to-end para MBPP**

| Concurrencia | Block size = 4 | Block size = 10 |
|---|---|---|
| 1 | 1.4× | 1.8× |
| 8 | 1.5× | 1.7× |
| 16 | 1.5× | 1.8× |
| 32 | 1.6× | 1.8× |
| 64 | 1.6× | 1.6× |

**Speedup end-to-end para MT-Bench**

| Concurrencia | Block size = 4 | Block size = 10 |
|---|---|---|
| 1 | 1.3× | 1.3× |
| 8 | 1.2× | 1.3× |
| 16 | 1.3× | 1.3× |
| 32 | 1.4× | 1.3× |
| 64 | 1.3× | 1.2× |

No se proporcionan resultados de calidad (MMLU, HumanEval score, etc.) porque el drafter no modifica la salida del modelo objetivo; su unico impacto es la velocidad.

## Requisitos de hardware

- VRAM adicional para el drafter: aproximadamente 1.6 GB en FP16 (0.8B parametros) o menos con cuantizacion GGUF (por ejemplo, Q4_K_M alrededor de 0.5 GB).
- VRAM total para el sistema completo: para GPT-OSS-120B en FP16 se necesitan ~240 GB, por lo que se requiere una GPU con al menos 80 GB (H100/H200) o multiples GPUs. Con cuantizacion del modelo principal (por ejemplo, AWQ o GPTQ) se puede reducir a ~60-70 GB en una sola GPU de 80 GB.
- GPUs recomendadas: H100, H200, A100 80GB o RTX 4090/5090 (con cuantizacion del modelo grande). El drafter en si puede ejecutarse en cualquier GPU con al menos 2 GB.
- Frameworks de despliegue: SGLang (con `--speculative-algorithm DFLASH`), vLLM (con `--speculative-config` y metodo `dflash`), BeeLlama.cpp (fork de llama.cpp con soporte para las cuantizaciones GGUF).
- Latencia estimada: en una H200 con block size 10 y concurrencia 1, el speedup es de 1.3×-1.9× dependiendo de la tarea, lo que se traduce en reducciones de latencia del 25% al 47% aproximadamente.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros drafters especulativos en la informacion proporcionada. La comparativa mas relevante es contra la inferencia sin decodificacion especulativa de GPT-OSS-120B (speedup 1.0×) y contra drafters autoregresivos convencionales, que suelen lograr speedups menores (tipicamente 1.1×-1.3×) debido a la serializacion de la generacion de borradores. DFlash, al generar bloques en paralelo, supera estas cifras en la mayoria de los escenarios. Para una comparacion completa, se recomienda consultar el paper (arxiv:2602.06036).

## Limitaciones y advertencias

- Dependencia del modelo objetivo: el drafter no es autonomo; solo funciona junto con openai/gpt-oss-120b. No puede usarse para generar texto por si mismo.
- Rendimiento condicionado al block size: el speedup varia notablemente con el numero de tokens especulativos. Block sizes grandes mejoran la tasa de aceptacion pero pueden aumentar la carga computacional si la tasa de rechazo es alta.
- Soporte limitado en frameworks: aunque SGLang y vLLM ya lo integran, BeeLlama.cpp es un fork no oficial y puede carecer de mantenimiento a largo plazo.
- Sin garantias de calidad: al ser un metodo de aceleracion, no altera la salida del modelo grande, pero si el drafter produce borradores de baja calidad, el speedup se reduce y el overhead puede superar el beneficio.
- Sesgos y alucinaciones: al ser un modelo auxiliar, no introduce sesgos propios, pero hereda los del modelo GPT-OSS-120B, que pueden incluir alucinaciones o sesgos de genero, raza o idioma.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo objetivo GPT-OSS-120B tiene su propia licencia (Apache 2.0), por lo que hay que revisar los terminos de ambos antes de desplegar en produccion.
- Fecha de creacion futura: el modelo fue creado en agosto de 2026, lo que podria indicar que es una version experimental o que la informacion de la ficha no esta actualizada.

## Enlaces

- Repositorio HuggingFace: [Anbeeld/gpt-oss-120b-DFlash-GGUF](https://huggingface.co/Anbeeld/gpt-oss-120b-DFlash-GGUF)
- Modelo original del drafter: [z-lab/gpt-oss-120b-DFlash](https://huggingface.co/z-lab/gpt-oss-120b-DFlash)
- Paper: [arxiv:2602.06036](https://arxiv.org/abs/2602.06036)
- Codigo fuente DFlash: [github.com/z-lab/dflash](https://github.com/z-lab/dflash)
- Blog del proyecto: [z-lab.ai/projects/dflash](https://z-lab.ai/projects/dflash/)
- BeeLlama.cpp: [github.com/Anbeeld/beellama.cpp](https://github.com/Anbeeld/beellama.cpp)
- Modelo objetivo GPT-OSS-120B: [openai/gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b)
- Repositorio oficial GPT-OSS: [github.com/openai/gpt-oss](https://github.com/openai/gpt-oss)
