# danamohammad/ZANA-Cognitive-Engine

## Resumen

ZANA Cognitive Engine es un repositorio de componentes de runtime para la aplicación de escritorio homónima, desarrollada por danamohammad. No se trata de un modelo conversacional generalista, sino de dos artefactos ligeros y especializados que la aplicación empaqueta para funcionar en local: un clasificador de intenciones y un modelo de lenguaje a nivel de byte que actúa como núcleo cognitivo recurrente. El repositorio es deliberadamente pequeño (0,0 GB según Hugging Face) y está etiquetado como `on-device`, `small-models` e `intent-classification`.

El clasificador de intenciones (`intent_v3_C_s0.safetensors`, 449.555 parámetros, `d_model` 128) decide qué acción del asistente solicita el usuario: recordar, recuperar, listar ficheros, crear una tarea, calcular o buscar documentos, entre otras. El núcleo lingüístico (`core_lm_v1.safetensors`, 132.416 parámetros, `d_model` 64) combina SSM y atención y se entrenó sobre texto en inglés, árabe y kurdo sorani. Las respuestas abiertas en la aplicación provienen de un modelo local separado, por ejemplo servido con Ollama, no de estos pesos.

La relevancia de esta ficha es acotada: ilustra un patrón de arquitectura modular para asistentes de escritorio con privacidad por diseño, donde las tareas de enrutamiento y modelado de estado se delegan a redes minúsculas entrenadas específicamente, mientras la generación libre queda fuera del repositorio. No hay pipeline declarado en Hugging Face ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de intenciones (red densa, `d_model` 128); núcleo lingüístico híbrido SSM + atención a nivel de byte (`d_model` 64) |
| Parametros totales | 449.555 (clasificador) + 132.416 (núcleo LM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin indicación de variantes cuantizadas) |
| Idiomas soportados | inglés (en), árabe (ar), kurdo sorani (ckb) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (+ ficheros JSON de configuración y calibración) |

## Arquitectura y entrenamiento

El clasificador de intenciones es una red de 449.555 parámetros con dimensión de modelo 128, entrenada con semilla 0, que mapea peticiones cortas del usuario a un conjunto cerrado de acciones del asistente. Se acompaña de `calib_b_frozen.json`, umbrales de calibración congelados por intención (2,5 KB), que ajustan la decisión final del clasificador. Los datos de entrenamiento registrados en `intent_v3_C_s0.json` comprenden 600 plantillas, 90 enunciados semilla naturales y un split de entrenamiento de 797 ejemplos repetidos tres veces cada uno.

El núcleo lingüístico (`core_lm_v1`) es un modelo de lenguaje a nivel de byte que combina una capa SSM con atención, con `d_model` 64 y 132.416 parámetros. Se entrenó sobre corpus de frases de Common Voice (CC0) para inglés, árabe y kurdo sorani, y sobre los splits de entrenamiento de MASSIVE en inglés y árabe (CC BY 4.0, © Amazon). Tras 3.000 pasos alcanzó bits por token en datos reservados de 2,23 en inglés, 1,61 en kurdo sorani y 1,62 en árabe. No se documenta RLHF, DPO ni decodificación especulativa.

## Capacidades

- Clasificación de intenciones de usuario en un conjunto cerrado de acciones del asistente (recordar, recuperar, listar ficheros, crear tarea, calcular, buscar documentos).
- Calibración por intención mediante umbrales congelados para ajustar la decisión del clasificador.
- Modelado de lenguaje a nivel de byte multilingüe (inglés, árabe, kurdo sorani) como componente de estado interno.
- Ejecución en dispositivo (`on-device`), sin dependencia de servicios remotos para estos componentes.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- No es un modelo de instrucciones ni de chat generalista; la generación abierta queda fuera de este repositorio.

## Casos de uso

- Enrutamiento de peticiones en un asistente de escritorio: el clasificador decide si una frase del usuario corresponde a recordar, recuperar, listar ficheros o calcular, y deriva la petición al módulo adecuado de la aplicación.
- Privacidad por diseño en entornos sensibles: al ejecutarse en local con pesos de menos de 2 MB, la clasificación de intenciones no requiere enviar texto del usuario a servicios externos.
- Asistentes multilingües para inglés, árabe y kurdo sorani: el clasificador está ajustado para peticiones cortas en esas tres lenguas, lo que permite cubrir comunidades lingüísticas poco representadas en modelos comerciales.
- Componente de estado para diálogo de sesión: el núcleo LM a nivel de byte puede emplearse como representación recurrente del contexto conversacional dentro de la aplicación, no para generar respuestas.
- Investigación sobre arquitecturas híbridas SSM + atención a pequeña escala: el núcleo de 132 K parámetros sirve como banco de pruebas reproducible para estudiar bits por token en tres lenguas con corpus CC0 y CC BY 4.0.
- Integración en pipelines de CI de la propia aplicación: los ficheros JSON de configuración y calibración permiten versionar y validar el comportamiento del clasificador en pruebas automatizadas.
- Despliegue embebido en dispositivos con recursos muy limitados: el tamaño conjunto inferior a 2,5 MB permite incluirlo en aplicaciones de escritorio o entornos con memoria restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos numéricos proceden de los registros de entrenamiento del autor:

| Componente | Metrica | Valor | Nota |
|---|---|---|---|
| Clasificador de intenciones | `best_dev3_acc` | 0,804 | Split de desarrollo del proyecto, no benchmark publicado |
| Nucleo LM | Bits por token, ingles | 2,23 | Datos reservados tras 3.000 pasos |
| Nucleo LM | Bits por token, kurdo sorani | 1,61 | Datos reservados tras 3.000 pasos |
| Nucleo LM | Bits por token, arabe | 1,62 | Datos reservados tras 3.000 pasos |

El autor declara que el clasificador nunca se entrenó sobre los conjuntos de evaluación del proyecto, sobre MASSIVE dev/test ni sobre los splits reservados de Common Voice listados en `intent_v3_C_s0.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 para ambos componentes combinados; los pesos suman aproximadamente 2,3 MB en safetensors.
- GPU recomendadas: innecesarias; el modelo está diseñado para ejecución en CPU en dispositivo.
- Cabe en cualquier GPU de consumo y en entornos sin GPU; no requiere aceleración dedicada.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y la aplicación de escritorio ZANA, que empaqueta los componentes; el autor indica que la arquitectura y el código de carga están en el repositorio de GitHub (`src/zana/`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para estos pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZANA Cognitive Engine (clasificador + nucleo LM) | 449.555 + 132.416 | no disponible | 0,804 acc en dev split; 1,61-2,23 bits/token | Apache 2.0 | Hugging Face, 0 descargas |
| Modelos de clasificacion de intenciones tipo SetFit / MiniLM | no disponible | no disponible | no disponible | variable | Hugging Face |
| Modelos de lenguaje a nivel de byte de investigacion (p. ej. variantes byte-level LM) | no disponible | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría; los valores de los modelos comparables figuran como no disponibles.

## Limitaciones y advertencias

- El clasificador cubre únicamente el conjunto propio de acciones del asistente ZANA y está ajustado para peticiones cortas en inglés, árabe y kurdo sorani; clasificará mal peticiones fuera de ese conjunto.
- El núcleo LM de 132 K parámetros es un componente de investigación del motor y no debe usarse para generar texto.
- El autor no formula ninguna afirmación de rendimiento fuera de las cifras indicadas; la accuracy de 0,804 es una métrica de split de desarrollo, no un benchmark publicado.
- Riesgo de alucinación: no aplicable a la generación, pero el clasificador puede asignar intenciones incorrectas con confianza alta si la calibración no se ajusta al dominio de despliegue.
- Sesgos: no documentados por el autor; los corpus de entrenamiento (Common Voice, MASSIVE) pueden introducir sesgos de dominio y de registro lingüístico.
- Licencia Apache 2.0 para los pesos y el código; los datasets subyacentes conservan sus propias licencias (CC0 para Common Voice, CC BY 4.0 para MASSIVE), lo que condiciona la redistribución de derivados entrenados sobre ellos.
- Restricciones de contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con entradas largas.
- El repositorio no declara pipeline en Hugging Face ni variantes cuantizadas, lo que limita la integración con runtimes de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danamohammad/ZANA-Cognitive-Engine
- Repositorio GitHub del proyecto: https://github.com/danamohammad/ZANA-Cognitive-Engine
- Common Voice (Mozilla, CC0): https://commonvoice.mozilla.org/
- MASSIVE (Amazon, CC BY 4.0): https://github.com/alexa/massive
