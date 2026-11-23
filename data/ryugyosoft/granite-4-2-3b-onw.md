# ryugyosoft/granite-4.2-3b-onw

## Resumen

`ryugyosoft/granite-4.2-3b-onw` es una conversión del modelo `ibm-granite/granite-4.2-3b` de IBM para el motor de inferencia `onw`, un runtime que ejecuta LLMs exclusivamente sobre la NPU integrada en los procesadores Intel Core Ultra. El repositorio contiene únicamente los pesos reempaquetados en grafos estáticos segmentados; el motor se distribuye por separado. No se ha realizado ningún entrenamiento: los pesos son una recuantización y reestructuración del modelo original.

El modelo base pertenece a la generación Granite 4.2 de IBM, orientada a razonamiento y uso de herramientas, con entrenamiento por refuerzo sobre agentes que ejecutan hasta 200 llamadas de herramientas (corrección de código, operación de terminal, búsqueda web). La arquitectura es un transformer convencional de tipo Llama. Esta variante de 3B es la más ligera de la familia y la más rápida dentro del catálogo de onw.

La relevancia de esta ficha es práctica: demuestra inferencia de un LLM de 3B parámetros sobre una NPU de consumo (Intel NPU 3720, Core Ultra 9 285HX) con un consumo de memoria de aproximadamente 6 GB y una velocidad de generación de 6,7 tok/s, sin GPU dedicada. Los idiomas declarados son japonés e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (modelo base Granite 4.2), exportado como grafos estáticos segmentados para NPU Intel |
| Parametros totales | 3B (aproximado, según denominación del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 con signo (escala positiva max/7, negativa min/8); INT8 grupo 128 en q/k/v de atención; INT8 en capa de salida; embeddings INT4 |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | XML de grafo OpenVINO + binarios `.bin` por segmento (`seg*_S1.xml`, `seg*_S16.xml`, `seg*_S64.xml`, `seg*_S2.xml`, `shared.bin`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer estándar de tipo Llama. La conversión a onw divide las 40 capas en 5 secciones de 8 capas más una sección de salida, generando grafos estáticos independientes. Los factores de escala propios de Granite (embeddings, residuales, atención y salida) se incorporan directamente en el grafo. Se generan variantes de grafo para procesamiento de prompt en bloques de 16 y 64 tokens, y una variante de 2 tokens para generación en Lunar Lake y Panther Lake que reduce drásticamente el tiempo de compilación inicial.

La cuantización es el punto técnico diferencial: el INT4 estándar con grupo 128 introducía un error excesivo en Granite, por lo que se emplea un INT4 con signo (escala distinta para el rango positivo y negativo), manteniendo el mismo layout de datos y velocidad que el INT4 convencional. Solo las proyecciones q/k/v de atención se mantienen en INT8 con grupo 128. La capa de salida va en INT8 en una sección separada, y las filas cuya escala caería en números subnormales FP16 (que la NPU convierte a cero) se regeneran. No hay entrenamiento, RLHF ni DPO en esta conversión; todas esas fases pertenecen al modelo original de IBM, que según la model card incluye RL sobre agentes con hasta 200 llamadas de herramientas.

## Capacidades

- Generación de texto conversacional en japonés e inglés.
- Modo de razonamiento (thinking) opcional: desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}` y el razonamiento se devuelve en `reasoning_content`.
- Tool calling mediante API compatible con OpenAI (parámetro `tools`), con soporte de llamadas paralelas.
- Razonamiento multi-paso y uso de agentes, heredado del entrenamiento RL del modelo base (corrección de código, operación de terminal, búsqueda web).
- Cumplimiento de instrucciones estructuradas (IFBench 74,3 en el modelo base, según la model card).
- Inferencia exclusiva sobre NPU Intel, sin GPU ni CPU para el cómputo principal.
- Servidor compatible con OpenAI en `http://localhost:8000/v1`.

## Casos de uso

- Asistentes locales en portátiles con Intel Core Ultra: el modelo se ejecuta íntegramente en la NPU con un working set de aproximadamente 6 GB (2,8 GB en modo de ahorro de memoria), lo que permite tener un asistente siempre disponible sin ocupar la GPU ni consumir batería de forma agresiva.
- Automatización de agentes con tool calling en entornos de escritorio: la API compatible con OpenAI y el soporte de llamadas paralelas permiten integrarlo en flujos que consultan APIs, ejecutan comandos o buscan en la web, con `max_tokens` de al menos 2000 en modo thinking.
- Procesamiento por lotes de prompts largos en local: los grafos de 64 tokens por bloque alcanzan aproximadamente 140 tok/s de procesamiento de prompt en la NPU 3720 (frente a los 70 tok/s de los bloques de 16), adecuado para clasificación o resumen de documentos en equipos sin GPU.
- Prototipado de aplicaciones de razonamiento con separación de trazas: el campo `reasoning_content` permite construir interfaces que muestran u ocultan el razonamiento, útil para depurar pipelines de agentes antes de desplegarlos en infraestructura mayor.
- Sustitución de modelos en pipelines existentes basados en OpenAI: al exponer un endpoint compatible, se puede apuntar un cliente `openai` al servidor local y comparar comportamiento sin reescribir código.
- Desarrollo y pruebas offline en Japón o entornos con inglés: al soportar ja y en, sirve para validar flujos conversacionales bilingües en máquinas de desarrollo sin conexión a servicios en la nube.

## Benchmarks y rendimiento

Datos de benchmarks del modelo base citados en la model card de esta conversión:

| Benchmark | Resultado (modelo base Granite 4.2 3B) |
|---|---|
| BFCL v4 | 52,4 |
| τ³-bench | 51,0 |
| IFBench | 74,3 |

Métricas de la conversión medidas por el autor:

| Métrica | Valor |
|---|---|
| Coincidencia de tokens con el original bf16 en CPU (400 tokens, teacher forcing) | 344/400 |
| Coincidencia con INT4 estándar (referencia comparativa) | 316/400 |
| Coincidencia del primer token en 20 preguntas en japonés (NPU vs CPU FP32) | 15/20 |
| Velocidad de generación (NPU 3720) | 6,7 tok/s (≈7,7 tok/s con verificación especulativa en chat) |
| Procesamiento de prompt (1024 tokens, onw 2.0+) | ≈140 tok/s |
| Tiempo de primera compilación para NPU | ≈6 minutos |
| Tiempo de carga posterior | ≈20 segundos |

No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K) específicos de esta conversión en la información disponible.

## Requisitos de hardware

- NPU Intel integrada en Core Ultra series 1 y 2 (Meteor Lake, Arrow Lake, Lunar Lake) y serie 3 (Panther Lake); el cómputo no se ejecuta en GPU.
- Sistema operativo: Windows 11 o Ubuntu 22.04 o superior.
- Memoria: working set de aproximadamente 6 GB tras la carga (6,4 GB medidos en un equipo Lunar Lake de 16 GB); modo de ahorro de memoria con aproximadamente 2,8 GB en reposo y durante la respuesta, con picos de 5,1 GB durante el intercambio (unos 3 segundos).
- Descarga del repositorio: 2,1 GB.
- No requiere GPU dedicada; no se han publicado cifras para A100, H100 ni RTX 4090 porque el motor solo apunta a NPU Intel.
- Despliegue mediante el motor onw: instalación con un script PowerShell (`install.ps1`) en Windows o `curl | bash` en Ubuntu, interfaz gráfica con pestañas de modelos, servidor y ajustes, o arranque por línea de comandos con `onw serve <carpeta>`.
- Endpoint compatible con OpenAI en el puerto 8000.
- No se soportan `git clone` sin Git LFS (el motor lo detecta y aborta).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Ejecución en NPU Intel | Notas |
|---|---|---|---|---|---|
| granite-4.2-3b-onw (esta ficha) | 3B | no disponible | Apache 2.0 | Sí, nativa | Conversión INT4/INT8 para onw; 6,7 tok/s en NPU 3720 |
| ibm-granite/granite-4.2-3b | 3B | no disponible | Apache 2.0 | No (requiere GPU/CPU) | Modelo original en bf16; referencia de calidad |
| llm-jp-4.1-8b-thinking-onw | 8B | no disponible | no disponible | Sí, vía onw | Recomendado por el mismo autor para uso centrado en japonés; mayor tamaño y compilación inicial más lenta (2 h 46 min → 23 min con grafos de 2 tokens en Panther Lake) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo base declara japonés e inglés; el propio autor advierte que las métricas multilingües son inferiores a las de inglés y que las respuestas en japonés pueden contener errores de kanji o contenido poco natural. Para uso centrado en japonés recomienda un modelo de 8B alternativo.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de factualidad para esta conversión.
- La longitud de contexto no está documentada en la información disponible; no debe asumirse la del modelo original sin verificar.
- El modo thinking incrementa el consumo de tokens; con herramientas activas se recomienda `max_tokens` de al menos 2000 para evitar truncamientos.
- La temperatura recomendada por el autor del modelo base es 1.0 con top_p 0.95; onw usa generación greedy por defecto, lo que puede alterar el comportamiento esperado.
- La primera compilación para NPU tarda aproximadamente 6 minutos; en modelos mayores del mismo motor puede superar las 2 horas, lo que afecta a los tiempos de arranque en frío.
- Dependencia de hardware Intel Core Ultra con NPU: no es desplegable en GPU NVIDIA/AMD ni en CPU como motor principal.
- El repositorio no incluye el motor; requiere descargar onw por separado.
- Licencia Apache 2.0 permite uso comercial, pero al ser una recuantización sin entrenamiento adicional, las limitaciones y sesgos del modelo original se heredan íntegramente.
- El rendimiento medido (6,7 tok/s) corresponde a un equipo concreto (NPU 3720, Core Ultra 9 285HX) y variará según la NPU y la memoria del sistema.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ryugyosoft/granite-4.2-3b-onw
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Colección Granite 4.2 de IBM: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Motor onw: https://huggingface.co/ryugyosoft/onw
- Documentación técnica de onw: https://huggingface.co/ryugyosoft/onw/blob/main/TECHNICAL.md
- Modelo alternativo para japonés: https://huggingface.co/ryugyosoft/llm-jp-4.1-8b-thinking-onw
