# ShaunSpark/laya-mind2web-browser-agent

## Resumen

Laya-mind2web-browser-agent es un ajuste fino del modelo de decisión Laya (convaiinnovations/laya, 421 M de parámetros) especializado en automatización de navegador. El modelo resuelve un problema muy concreto dentro de un agente web: dado un objetivo expresado en lenguaje natural y una lista de elementos interactivos extraídos del DOM de una página, predice en una sola pasada hacia delante la operación a ejecutar (CLICK, TYPE o SELECT) y el índice del elemento objetivo. Lo desarrolla Shaun Andrade (ShaunSpark) y se distribuye bajo licencia Apache 2.0.

El interés de esta ficha es acotado pero relevante: se trata de un ejemplo de destilación de la tarea de Mind2Web sobre un cabezal de decisión pequeño, entrenado en hardware de consumo (una única NVIDIA T4 de 16 GB en Google Colab). Frente a los agentes web basados en LLM generalistas de miles de millones de parámetros, este modelo propone un componente de decisión de 421 M que solo requiere la estructura del DOM y el objetivo del usuario.

La información publicada es limitada: el autor declara una precisión de validación del 74,3 % sobre 68 ejemplos retenidos, con 671 ejemplos de entrenamiento útiles extraídos de Mind2Web. No hay datos publicados de contexto máximo, arquitectura interna detallada ni benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que su evaluación debe tomarse como preliminar y específica de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; hereda la arquitectura del modelo base convaiinnovations/laya (modelo de decisión, "laya-decision-model"). Requiere el tokenizador y la arquitectura de Laya para cargarse |
| Parametros totales | 421 M (cifra del modelo base; el ajuste fino no declara un recuento distinto) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para inferencia. En entrenamiento se uso precision mixta FP16 y optimizador AdamW de 8 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (pytorch_model.bin, cargado con torch.load). No se publican safetensors ni GGUF |
| Tamano del repositorio | 1,7 GB |
| Modelo base | convaiinnovations/laya |
| Tarea | Prediccion conjunta de operacion (CLICK, TYPE, SELECT) e indice de elemento objetivo |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna del modelo base Laya mas alla de que se trata de un "decision model" con tokenizador propio, al que hay que cargar el state dict ajustado. El ajuste fino mantiene la cabecera del modelo base y se especializa en una salida doble: la operacion a realizar y el indice del elemento del DOM sobre el que actuar. El modelo no genera texto libre ni razonamiento intermedio: emite una decision discreta a partir del objetivo del usuario y del listado de elementos candidatos.

El entrenamiento se realizo sobre Mind2Web, con 671 ejemplos utiles, durante 2 epocas (el autor indica que mas entrenamiento provoca sobreajuste) en una unica NVIDIA T4 de 16 GB. Se uso AdamW de 8 bits de bitsandbytes con learning rate 1e-5, tamano de lote efectivo 8 (micro-lote 1 con acumulacion de gradientes 8), precision mixta FP16, gradient checkpointing y expandable_segments para reducir el consumo de memoria. No se menciona uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Prediccion de la siguiente accion de navegador: distingue entre operaciones CLICK, TYPE y SELECT.
- Seleccion del elemento objetivo: devuelve el indice del elemento correcto dentro de una lista de candidatos extraida del DOM.
- Interpretacion de objetivos en lenguaje natural en ingles combinados con estructura HTML/DOM.
- Decision en una sola pasada hacia delante (operacion y objetivo en el mismo forward pass), sin generacion autoregresiva de texto.
- Uso como motor de decision dentro de un agente de navegador mayor, no como modelo conversacional autonomo.
- No se documentan capacidades de vision, audio, tool calling generico, function calling, modo "thinking" ni razonamiento multi-paso propio.

## Casos de uso

- Agente de automatizacion web de proposito general: el modelo actua como cabezal de decision que, en cada paso, recibe el objetivo del usuario y los elementos interactivos de la pagina y devuelve la accion concreta; el resto del agente se encarga de ejecutar el clic o la escritura y de volver a extraer el DOM.
- Rellenado automatizado de formularios: ante objetivos del tipo "introduce el correo y confirma", el modelo selecciona los campos y la operacion TYPE adecuada, reduciendo la necesidad de selectores CSS escritos a mano.
- Testing end-to-end de aplicaciones web: integrado en una suite de pruebas, permite generar secuencias de interaccion a partir de descripciones de casos de uso en ingles, sustituyendo scripts fragiles basados en XPath.
- Extraccion de datos tras navegacion: combinado con un agente que ejecute las acciones predichas, facilita llegar a paginas de resultados o detalle mediante CLICK/SELECT antes de recolectar informacion.
- Monitorizacion de portales y tareas repetitivas: navegacion guiada por objetivos hacia secciones concretas de un sitio (por ejemplo, consultar un estado o descargar un informe) sin intervencion manual continua.
- Investigacion en agentes web: como referencia ligera (421 M) para comparar estrategias de representacion del DOM y de seleccion de elementos frente a enfoques basados en LLM grandes.
- Prototipado en entornos con recursos limitados: al entrenarse en una T4 y ocupar un repositorio de 1,7 GB, sirve para experimentar con pipelines de decision web en una sola GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de evaluacion aportado por el autor es el siguiente:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Precision de validacion (operacion + elemento objetivo) | 74,3 % | 68 ejemplos retenidos de Mind2Web |
| Ejemplos de entrenamiento | 671 | Mind2Web (subconjunto utilizado) |
| Epocas | 2 | Mejor checkpoint; mas epocas provocan sobreajuste |

Este resultado corresponde a una particion muy reducida y no es directamente comparable con las metricas oficiales de Mind2Web sobre el conjunto de test completo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 421 M de parametros; no publicada por el autor): en FP32, en torno a 1,7 GB solo de pesos, mas activaciones y overhead; en FP16, aproximadamente 0,9 GB de pesos; en cuantizaciones de 8 y 4 bits, del orden de 0,5 GB y 0,3 GB respectivamente.
- Entrenamiento documentado: una unica NVIDIA T4 de 16 GB en Google Colab, con gradient checkpointing y precision mixta.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en la practica; el autor valido el entrenamiento en T4. No se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas tipo RTX 3060, 4060, 4070 o 4090 en FP16 o cuantizado, siempre que se disponga de la arquitectura Laya.
- Opciones de despliegue: carga directa en PyTorch con torch.load del state dict sobre el modelo base Laya. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formato GGUF, dado que el modelo no es un transformer de texto estandar y depende de codigo propio del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados comparables publicados para este ajuste ni para las alternativas dentro del mismo espacio de decision web. La comparacion se limita a caracteristicas estructurales:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| ShaunSpark/laya-mind2web-browser-agent | 421 M (heredados del base) | No disponible | Cabezal de decision: operacion + elemento del DOM | Apache 2.0 | 74,3 % en 68 ejemplos de validacion (declarado por el autor) |
| convaiinnovations/laya (modelo base) | 421 M | No disponible | Modelo de decision general, sin ajuste a Mind2Web | No disponible en la informacion proporcionada | No disponible |
| Agentes web basados en LLM generalistas (por ejemplo, familias tipo MindAct/SeeAct) | Miles de millones de parametros | No disponible en esta consulta | LLM que razona sobre el DOM y emite acciones | Variable segun modelo | No disponible en esta consulta |

## Limitaciones y advertencias

- Entrenado con un unico conjunto de datos (Mind2Web) y solo 671 ejemplos utiles; la generalizacion a sitios web no representados en ese corpus es incierta.
- Sobreajuste documentado por el propio autor a partir de la tercera epoca, lo que limita el margen de mejora por entrenamiento adicional sin regularizacion o mas datos.
- La validacion se realizo sobre 68 ejemplos: la precision del 74,3 % tiene un intervalo de confianza amplio y no debe extrapolarse a produccion.
- Modelo unicamente en ingles; no se documenta soporte multilingue.
- Depende del tokenizador y de la arquitectura del modelo base Laya, lo que implica usar codigo personalizado y no permite un uso directo con las herramientas estandar de transformers sin ese soporte.
- Pesos en formato PyTorch (pytorch_model.bin) sin safetensors ni GGUF publicados, lo que complica su uso en runtimes de inferencia habituales.
- El modelo no genera explicaciones ni razonamiento: solo emite una operacion y un indice, por lo que los errores son dificiles de auditar y no hay traza de por que se eligio un elemento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del conjunto de datos Mind2Web antes de desplegarlo en producto.
- Sin descargas ni likes en el momento de la consulta: no existe validacion independiente de la comunidad ni informes de terceros sobre su comportamiento.
- Riesgo de alucinacion entendido como seleccion de un indice de elemento incorrecto o de una operacion no valida para el DOM proporcionado; no hay datos publicados sobre tasas de fallo por tipo de pagina.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ShaunSpark/laya-mind2web-browser-agent
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Conjunto de datos Mind2Web: https://huggingface.co/datasets/osunlp/Mind2Web
- Paper de Mind2Web: https://arxiv.org/abs/2306.06070
- Perfil del autor: https://huggingface.co/ShaunSpark

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo, su modelo base o su tematica; los unicos resultados obtenidos fueron noticias de actualidad sin relacion con el contenido de esta ficha.
