# KucLab/kuclab-hertz-0.6

## Resumen

KucLab Hertz 0.6 es un ajuste fino de tipo LoRA sobre el modelo base **google/gemma-4-12B-it**, desarrollado por KucLab como asistente conversacional bilingüe (checo e inglés) especializado en disciplinas STEM (física, química, biología, matemáticas) y programación. El modelo se distribuye como pesos fusionados en formato GGUF (Q4_K_M, ~7,4 GB) y como adaptador LoRA sin fusionar, con licencia Apache 2.0.

La versión 0.6 recupera y supera la precisión STEM perdida en la versión 0.5, alcanzando un 79,2 % en el subconjunto MMLU-Pro STEM propio del proyecto, frente al 75,8 % del modelo base. Mantiene la personalidad directa y ocurrente introducida en 0.5, sin pasos de censura adicionales. El contexto nativo es de 262 144 tokens; se intentó extenderlo mediante YaRN pero la arquitectura de Gemma-4 lo impide, por lo que se mantiene el valor original.

El entrenamiento usó 2932 filas de datos, la mayoría generadas externamente y validadas (0 filas malformadas, 0 duplicados, 0 tokens especiales, 0 fugas de identidad), combinadas con 606 filas heredadas de Hertz 0.5 y 309 filas de terminología científica checo-inglés construidas de forma determinista. El proceso de desarrollo fue iterativo y documentado de forma transparente, incluyendo dos intentos fallidos previos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: google/gemma-4-12B-it) |
| Parametros totales | 11 907 350 576 (~11,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF), bf16 (pesos base) |
| Idiomas soportados | Checo (cs), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

Hertz 0.6 es un ajuste fino mediante **QLoRA** con rango 16 y alpha 32, fusionado posteriormente a los pesos del modelo base en bf16 y cuantizado a Q4_K_M para su distribucion en GGUF. El modelo base, Gemma-4-12B-it, es un transformer denso de 11,95 B parametros con atencion nativa de 262 144 tokens. No se aplicaron tecnicas de RLHF ni DPO; el unico cambio de comportamiento proviene del ajuste supervisado.

El conjunto de entrenamiento consta de 2932 filas, distribuidas asi: 1994 filas de un corpus externo generado de forma independiente (validado sin errores), 606 filas heredadas del corpus de Hertz 0.5 (que a su vez acumulaba tres generaciones previas de entrenamiento), 309 filas de terminologia cientifica checo-ingles construidas deterministicamente a partir de una lista fija de terminos, 8 ejemplos de formato "respuesta primero" y 15 filas de identidad del modelo. El proceso de desarrollo incluyo dos intentos fallidos: el primero con 2944 filas y rango 32 provoco una caida de la terminologia checa al 71,4 %; el segundo, con solo datos frescos, empeoro aun mas (69,4 %). La solucion final reincorporo datos de la version 0.5 para restaurar el refuerzo acumulativo del vocabulario cientifico checo.

Se intento extender el contexto mas alla de 262 144 tokens mediante YaRN rope scaling, pero la arquitectura de Gemma-4 almacena la configuracion RoPE en una estructura anidada `rope_parameters` (configuracion separada por tipo de atencion), y el alias `rope_scaling` sobrescribe ese campo, rompiendo la exportacion a GGUF. El problema quedo documentado y protegido en el codigo de exportacion.

## Capacidades

- Generacion de texto conversacional en checo e ingles con tono directo y ocurrente, sin evasivas tipicas de IA en temas ordinarios.
- Razonamiento STEM: resuelve problemas de fisica, quimica, biologia y matematicas con precision superior al modelo base en el benchmark MMLU-Pro STEM (79,2 % frente a 75,8 %).
- Programacion y desarrollo web: genera y explica codigo, aunque no se ha afinado especificamente para tool calling.
- Terminologia cientifica bilingue: traduce y explica terminos cientificos entre checo e ingles (82,5 % en direccion CS→EN, 65,0 % en EN→CS).
- Formato de respuesta "answer-first": tiende a responder directamente antes de explicar, reduciendo la necesidad de re-consultas en benchmarks (solo 7,5 % de respuestas requirieron re-ask frente al 19 % de Hertz 0.5).
- Identidad de modelo: se identifica correctamente como un modelo de KucLab sin nombrar a ningun fundador.
- Rechazo de solicitudes genuinamente daninas, manteniendo la personalidad en el resto de interacciones.

## Casos de uso

- **Asistente de estudio STEM en checo**: estudiantes de secundaria y universidad pueden plantear problemas de fisica o matematicas en checo y recibir explicaciones paso a paso. El modelo alcanza un 90 % en matematicas y 91,7 % en biologia del subconjunto MMLU-Pro STEM, lo que lo hace util como tutor de repaso.
- **Traduccion de terminologia cientifica CS↔EN**: investigadores y traductores tecnicos pueden consultar el equivalente ingles o checo de terminos cientificos. Con un 82,5 % de precision en direccion CS→EN, es una herramienta de apoyo para redaccion de articulos o documentacion tecnica bilingue.
- **Generacion de contenido tecnico bilingue**: redactores tecnicos pueden usarlo para producir documentacion de software o articulos divulgativos en checo e ingles, aprovechando su conocimiento de programacion y desarrollo web.
- **Chat conversacional con personalidad**: empresas o comunidades que quieran un asistente con caracter definido (directo, sin rodeos) pueden desplegarlo como bot de atencion o entretenimiento, siempre que el dominio sea checo o ingles.
- **Resolucion de problemas de programacion**: desarrolladores pueden plantear dudas de codigo o algoritmos y obtener soluciones razonadas. Aunque no tiene tool calling, la generacion de codigo es funcional para tareas de nivel medio.
- **Analisis de datos cientificos**: el modelo puede interpretar resultados de experimentos o describir conceptos de quimica y biologia, sirviendo como apoyo en laboratorios docentes o de investigacion basica.

## Benchmarks y rendimiento

**MMLU-Pro STEM** (240 preguntas retenidas, subconjunto propio del proyecto, mismas prompts, mismo codigo de correccion, cuantizacion Q4_K_M, frio):

| | base | Hertz 0.4 | Hertz 0.5 | **Hertz 0.6** |
|---|---|---|---|---|
| Biology | 86,7 % | 76,7 % | 78,3 % | **91,7 %** |
| Chemistry | 61,7 % | 45,0 % | 53,3 % | **61,7 %** |
| Math | 83,3 % | 76,7 % | 78,3 % | **90,0 %** |
| Physics | 71,7 % | 56,7 % | 65,0 % | **73,3 %** |
| **Total** | **75,8 %** | **63,7 %** | **68,8 %** | **79,2 %** |

**Benchmark de terminologia checa** (206 terminos cientificos CS↔EN retenidos):

| | Hertz 0.3 | Hertz 0.5 | **Hertz 0.6** |
|---|---|---|---|
| CS→EN | 79,6 % | 81,6 % | **82,5 %** |
| EN→CS | 51,5 % | 69,9 % | **65,0 %** |
| **Total** | **65,5 %** | **75,7 %** | **73,8 %** |

No se han publicado resultados en benchmarks estandar externos (MMLU completo, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantizacion Q4_K_M (~7,4 GB de pesos), se necesitan aproximadamente 10-12 GB de VRAM para contexto corto (incluyendo overhead de KV cache y activaciones). Para contexto largo (cercano a 262 144 tokens), la KV cache puede superar los 20 GB, requiriendo GPUs de 24 GB o mas.
- **GPU recomendadas**: RTX 3090, RTX 4090, A100 40 GB o superiores para contexto largo. En consumer, una RTX 4070 Ti Super (16 GB) o similar puede ejecutar el modelo con contexto moderado.
- **Compatibilidad con consumer GPU**: si, con cuantizacion Q4_K_M y contexto limitado (hasta ~8-16k tokens) cabe en GPUs de 12 GB. Para contexto completo se requiere hardware profesional.
- **Opciones de despliegue**: llama.cpp, Ollama (comando `ollama pull hf.co/KucLab/kuclab-hertz-0.6:Q4_K_M`), y cualquier servidor compatible con GGUF. El adaptador LoRA en safetensors puede cargarse con PEFT/transformers sobre el base Gemma-4-12B-it.
- **Latencia y throughput**: no se han publicado mediciones oficiales. Como referencia, un modelo de 12B en Q4_K_M en una RTX 4090 suele generar entre 40-60 tokens/s con llama.cpp, pero esto depende del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro STEM (subconjunto) | Terminologia checa | Licencia |
|---|---|---|---|---|---|
| **KucLab Hertz 0.6** | 11,9 B | 262 144 | 79,2 % | 73,8 % | Apache 2.0 |
| google/gemma-4-12B-it (base) | 11,95 B | 262 144 | 75,8 % | no evaluado | Apache 2.0 |
| KucLab Hertz 0.5 | 11,9 B | 262 144 | 68,8 % | 75,7 % | Apache 2.0 |

No se dispone de datos de otros modelos de tamano similar (p. ej., Qwen2.5-12B, Mistral-12B) con los mismos benchmarks para una comparativa directa.

## Limitaciones y advertencias

- **Regresion en terminologia checa**: el rendimiento EN→CS (65,0 %) esta por debajo del pico de Hertz 0.5 (69,9 %), y el total (73,8 %) no alcanza el 75,7 % de la version anterior. El propio autor lo reconoce como una regresion real no totalmente recuperada.
- **Sin tool calling**: el modelo no ha sido afinado para function calling ni integracion con herramientas externas, por lo que no es adecuado para agentes que requieran invocar APIs o ejecutar codigo de forma automatica.
- **Sin extension de contexto**: el contexto se mantiene en 262 144 tokens nativos; no se logro extenderlo via YaRN por limitaciones arquitectonicas de Gemma-4. No usar configuraciones de rope scaling no soportadas.
- **Sesgos y alucinacion**: al ser un ajuste fino sobre un corpus relativamente pequeno (2932 filas), puede presentar alucinaciones en dominios fuera de STEM o en terminologia cientifica poco frecuente. No se han realizado evaluaciones de sesgo especificas.
- **Idiomas limitados**: solo checo e ingles. No soporta espanol ni otros idiomas de forma fiable.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo base Gemma-4-12B-it tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas. Verificar los terminos de KucLab para redistribucion.
- **Produccion**: al no tener uncensoring pass, el modelo mantiene el rechazo de solicitudes daninas, pero su personalidad "directa" puede generar respuestas que algunos usuarios consideren bruscas. Evaluar en el dominio de uso antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KucLab/kuclab-hertz-0.6
- Sitio de KucLab: https://kuclab.org/
- Hertz 0.4: https://huggingface.co/KucLab/kuclab-hertz-0.4
- Hertz 0.3: https://huggingface.co/KucLab/kuclab-hertz-0.3
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
