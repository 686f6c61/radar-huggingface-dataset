# Lernex/Metis-1.6-Logos-NVFP4

## Resumen

Metis-1.6 Logos NVFP4 es una versión cuantizada a NVFP4 del modelo Metis-1.6 Logos, desarrollado por Lernex. Se trata de un modelo de generación de texto con arquitectura híbrida que combina mezcla de expertos (MoE) y capas Mamba, orientado a tareas de razonamiento. Esta variante concreta reduce el peso de los pesos de 20,80 GB (BF16) a 6,57 GB, lo que permite ejecutar un modelo de 10.200 millones de parámetros íntegramente en una GPU de 8 GB.

La relevancia de esta ficha radica en su formato: NVFP4 es un esquema de cuantización de 4 bits con escalas de bloque en FP8, pensado para las GPU de la serie RTX 50 de NVIDIA. El autor declara que esta versión conserva el 99,4 % de la media de benchmarks del modelo en BF16, lo que la convierte en una opción atractiva para despliegues con VRAM muy limitada.

El modelo solo es compatible con Dromos, el motor de inferencia propio de Lernex, y no puede cargarse con vLLM, SGLang ni Transformers. La información pública disponible sobre arquitectura detallada, datos de entrenamiento e idiomas es escasa; los datos que se ofrecen a continuación provienen de la model card y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida MoE + Mamba (según tags del repositorio: `mixture-of-experts`, `mamba`) |
| Parametros totales | 6.262.233.012 (safetensors); la model card menciona 10,2B para el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona que una GPU de 8 GB aloja una secuencia de 8.192 tokens) |
| Tipos de cuantizacion | NVFP4 (4 bits con escalas FP8 por bloque); el modelo base está disponible en BF16 y FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con código personalizado (`custom_code`); requiere el motor Dromos |

## Arquitectura y entrenamiento

La model card etiqueta el modelo como `mixture-of-experts` y `mamba`, lo que apunta a una arquitectura híbrida que combina capas de atención con estado (Mamba/SSM) y capas de mezcla de expertos. No se especifican en la información disponible el número de expertos, la proporción de parámetros activos por token, la composición del dataset de entrenamiento ni si se aplicaron fases de RLHF o DPO. El modelo base se distribuye en BF16 y FP8, y esta variante NVFP4 se genera cuantizando los pesos a 4 bits con escalas de bloque en FP8.

La innovación técnica principal de esta ficha es el propio esquema NVFP4 aplicado a los expertos, junto con la integración en Dromos. Según la model card, en la multiplicación por defecto los pesos se expanden a 16 bits y la aritmética se realiza en BF16; con `--fast-math`, las entradas se redondean a FP4 para los expertos y a FP8 por token para el resto de proyecciones, imitando el comportamiento de una GPU RTX 50. El autor indica que los expertos NVFP4 no se descargan a memoria del sistema, por lo que el modelo debe caber completo en VRAM.

## Capacidades

- Generación de texto conversacional y de razonamiento, con modo de pensamiento (`thinking`) activado por defecto; la salida de razonamiento se devuelve en el campo `reasoning_content`.
- Soporte de tool calling / function calling: las llamadas se parsean al campo `tool_calls` de la API compatible con OpenAI que expone Dromos.
- Modo de respuesta directa sin razonamiento, configurable mediante `chat_template_kwargs: {"enable_thinking": false}` o `--think off`.
- Etiquetas del repositorio que indican capacidades de razonamiento (`reasoning`) y conversación (`conversational`).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de 8 GB: el modelo completo cabe en una RTX 5060 Ti de 8 GB o similar, dejando espacio para una secuencia de 8.192 tokens, lo que permite razonamiento local sin depender de la nube.
- Asistentes conversacionales con tool calling: mediante `dromos serve logos:nvfp4` se expone una API compatible con OpenAI en `http://127.0.0.1:8080/v1`, lo que facilita integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI.
- Razonamiento con trazas auditables: al devolver el pensamiento en `reasoning_content`, resulta adecuado para pipelines que necesitan registrar o revisar el proceso de razonamiento antes de la respuesta final.
- Prototipado en portátiles con Apple Silicon: Dromos soporta Metal, de modo que el modelo puede ejecutarse en equipos con memoria unificada sin GPU NVIDIA dedicada.
- Inferencia en CPU para entornos sin acelerador: Dromos incluye soporte de CPU, lo que permite validar el modelo en entornos de desarrollo o CI sin GPU.
- Evaluación comparativa de cuantización: al conservar el 99,4 % de la media BF16 en siete tareas zero-shot, sirve para medir el impacto real de NVFP4 en tareas de conocimiento y sentido común antes de adoptarlo en producción.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con lm-evaluation-harness 0.4.13 por log-likelihood sobre todos los ítems:

| Tarea | Métrica | BF16 | NVFP4 | NVFP4 `--fast-math` |
|---|---|---|---|---|
| MMLU | acc | 53,43 | 52,88 | 51,69 |
| HellaSwag | acc_norm | 68,46 | 68,11 | 67,59 |
| ARC-Easy | acc_norm | 70,62 | 70,79 | 69,99 |
| ARC-Challenge | acc_norm | 44,11 | 44,80 | 43,43 |
| OpenBookQA | acc_norm | 43,40 | 41,40 | 42,80 |
| PIQA | acc_norm | 76,06 | 76,71 | 75,95 |
| WinoGrande | acc | 61,96 | 61,01 | 62,90 |
| **Media** | | **59,72** | **59,39** | **59,19** |

El autor advierte que las columnas BF16 y NVFP4 son comparables entre sí (misma metodología de log-likelihood), pero no con la model card del modelo base BF16, que puntúa respuestas generadas.

## Requisitos de hardware

- VRAM: 6,57 GB de pesos; una GPU de 8 GB aloja el modelo completo con espacio para una secuencia de 8.192 tokens; una GPU de 12 GB permite secuencias de hasta 15.000 tokens aproximadamente (según la model card).
- GPU recomendadas: NVIDIA serie RTX 50 (el esquema NVFP4 está pensado para estas GPU); el autor indica compatibilidad con CUDA 12 y 13 en GPU NVIDIA, Apple Silicon vía Metal y CPU.
- GPU de consumo: sí, cabe en una GPU de 8 GB. Si la GPU de 8 GB también alimenta una pantalla, o si se dispone de menos VRAM, el autor recomienda usar Logos FP8, cuyos expertos Dromos descarga a memoria del sistema.
- Opciones de despliegue: exclusivamente Dromos (`dromos run logos:nvfp4`, `dromos serve logos:nvfp4`). No compatible con vLLM, SGLang ni Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Motor compatible |
|---|---|---|---|---|---|
| Metis-1.6 Logos NVFP4 | 6,26B (safetensors); 10,2B según model card | no disponible | NVFP4 | Apache 2.0 | Dromos |
| Metis-1.6 Logos (BF16) | 10,2B | no disponible | BF16 | Apache 2.0 | Transformers |
| Metis-1.6 Logos FP8 | 10,2B | no disponible | FP8 | Apache 2.0 | vLLM, SGLang, Dromos |

No se dispone de información sobre modelos de terceros comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato NVFP4 solo lo lee Dromos; vLLM, SGLang y Transformers no pueden cargar estos pesos. Para esos motores hay que usar la variante FP8 o BF16.
- Los expertos NVFP4 no se descargan a memoria del sistema, por lo que el modelo no puede ejecutarse en GPU con menos VRAM que el tamaño de los pesos.
- El modo `--fast-math` reduce la media de benchmarks del 59,39 al 59,19 y baja MMLU de 52,88 a 51,69; conviene evaluar su impacto antes de activarlo en producción.
- No se especifican sesgos conocidos, composición del dataset ni idiomas soportados, lo que dificulta evaluar riesgos de alucinación y cobertura lingüística.
- Los benchmarks publicados son de log-likelihood sobre tareas zero-shot de conocimiento y sentido común; no hay datos de HumanEval, GSM8K ni tareas de código o matemáticas.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del motor Dromos (código propio de Lernex) debe revisarse por separado.
- El repositorio registra 1 descarga y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lernex/Metis-1.6-Logos-NVFP4
- Modelo base BF16: https://huggingface.co/Lernex/Metis-1.6-Logos
- Variante FP8: https://huggingface.co/Lernex/Metis-1.6-Logos-FP8
- Informe técnico: https://arxiv.org/abs/2610.37903
- Colección Metis-1.6: https://huggingface.co/collections/Lernex/metis-16-6adc52e150d985721d894f6b
- Sitio del autor: https://lernex.com
- Motor Dromos: https://github.com/lernex/dromos
- Perfil en X: https://x.com/Lernex_ai
