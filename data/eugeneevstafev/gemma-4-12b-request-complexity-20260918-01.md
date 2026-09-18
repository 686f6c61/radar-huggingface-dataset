# EugeneEvstafev/gemma-4-12b-request-complexity-20260918-01

## Resumen

Gemma 4 12B Request Complexity Scorer es un ajuste fino experimental del modelo google/gemma-4-12B-it, desarrollado por EugeneEvstafev y publicado con el identificador de ejecucion request-complexity-20260918-01. Su proposito no es la generacion de texto abierto, sino devolver un unico entero entre 0 y 100 que represente la complejidad estimada de una peticion de usuario: desde ruido, cadenas vacias o acuses de recibo triviales (0-10) hasta tareas de nivel olimpiada o de investigacion altamente ambigua (90-100).

El artefacto publicado es una exportacion GGUF cuantizada en Q4_K_M de 7.381.382.848 bytes (repositorio de 7,4 GB) sobre un modelo de 11.907.350.576 parametros. No es un asistente conversacional final, sino un componente auxiliar pensado para integrarse en pipelines: enrutado de consultas, seleccion dinamica de modelo, control de coste por token o triaje de tickets.

Su relevancia es metodologica y acotada. La model card documenta un MAE de 29,44 puntos y un coeficiente de Pearson de 0,462 sobre un conjunto de verificacion de 100 ejemplos, con un modo de fallo dominante: ante problemas de matematicas, el modelo responde al problema en lugar de puntuar su dificultad. El propio autor lo declara no listo para produccion y lo presenta como prueba de concepto y evidencia reproducible para iterar el siguiente conjunto de datos y el siguiente esquema de prompting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; derivada del modelo base google/gemma-4-12B-it |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se publican otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 segun metadatos de Hugging Face, con enlace a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license); se deben respetar los terminos del modelo base |
| Formato de pesos | GGUF (unico artefacto publicado, training/outputs/model-Q4_K_M.gguf) |

Datos adicionales del artefacto: SHA-256 del GGUF 727c993da958113e2e0cdf01d52da59d656751c8b71748e76e89ebb595465de2, revision del modelo base 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7 y pipeline declarado text-generation con etiqueta conversational.

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un modelo de instrucciones de la familia Gemma 4 con 11,9 mil millones de parametros. Sobre esa base se aplica un ajuste fino supervisado orientado a una tarea de regresion discreta disfrazada de generacion: la salida valida es un entero entre 0 y 100. La evidencia de reproducibilidad incluida en el repositorio (receipts/training-train.json) registra la verificacion de recarga de un adaptador (adapter reload verified: true), lo que apunta a un ajuste de tipo adaptador, aunque el metodo exacto (LoRA, QLoRA u otro) no se detalla en la informacion disponible. No se menciona RLHF, DPO ni ninguna otra etapa de alineacion posterior.

El conjunto de datos consta de 500 registros supervisados de chat: 350 de entrenamiento, 50 de validacion y 100 de verificacion (este ultimo no usado en entrenamiento). Por origen, 345 registros son sinteticos, 145 derivados de MATH-500 y 10 extraidos directamente de MATH-500. El entrenamiento fue muy corto: 8 pasos sobre 350 filas, con una perdida de validacion media que pasa de 9,87062 (linea base) a 6,706186 (final). No se documenta numero de tokens de entrenamiento, composicion completa del dataset ni innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Puntuacion de complejidad: devuelve un unico entero de 0 a 100 para una peticion de usuario dada, con una taxonomia de rangos definida (0-10 ruido, 10-30 chat simple o factual, 30-50 razonamiento basico o aritmetica, 50-70 tareas practicas multi-paso o de depuracion de codigo, 70-90 razonamiento experto o matematicas dificiles, 90-100 nivel investigacion u olimpiada).
- Uso mediante instruccion de sistema: la model card propone un system prompt explicito ("You score the complexity of the user's request. Return only one integer from 0 to 100. Do not explain.").
- Formato conversacional: el modelo conserva la plantilla de chat del modelo base y esta etiquetado como conversational.
- Idiomas: unicamente ingles declarado (language: en).
- Inferencia local: al distribuirse solo en GGUF Q4_K_M, es ejecutable con llama.cpp, Ollama y cualquier runtime compatible; la verificacion publicada se hizo con inferencia Modal/Ollama.
- No documentado: no hay soporte declarado de tool calling o function calling, ni capacidades de agente o razonamiento multi-paso, ni vision, audio, ni modo thinking explicito.

## Casos de uso

- Enrutado de consultas en arquitecturas multi-modelo: puntuar cada peticion entrante y enviar las de rango bajo (0-30) a un modelo pequeno y barato, reservando los modelos grandes para peticiones de rango alto. El modelo devuelve un solo token numerico, lo que simplifica el parseo en la pasarela.
- Control de coste por token: usar la puntuacion como umbral para activar o desactivar razonamiento extendido, contexto largo o busqueda web en la pipeline, evitando gastar presupuesto en consultas triviales.
- Triaje de tickets de soporte: clasificar tickets y encaminarlos a nivel 1, nivel 2 o especialistas segun la complejidad estimada, aunque con la advertencia de que la correlacion medida (Spearman rho = 0,522) es moderada y requiere validacion propia.
- Filtrado de ruido y acuses de recibo: descartar mensajes vacios, agradecimientos o ruido (rango 0-10) antes de invocar un modelo generativo, reduciendo llamadas innecesarias.
- Etiquetado asistido de datasets: pre-anotar la dificultad de un corpus de peticiones para posterior revision humana, como paso previo al entrenamiento de un clasificador de dificultad mas robusto.
- Investigacion sobre calibracion y evaluacion de jueces: servir como sujeto de estudio de un caso documentado de fine-tune con etiquetas sinteticas, con metricas completas y artefactos de reproducibilidad publicados.
- Prueba de concepto en pipelines de finetune-lab: validar el ciclo completo de entrenamiento, exportacion a GGUF, publicacion e inferencia antes de escalar a un dataset mayor.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al conjunto de verificacion retenido (100 prompts, todos respondidos, inferencia Modal/Ollama tras la publicacion en Hugging Face). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

| Metrica | Valor |
|---|---|
| Prompts programados | 100 |
| Respuestas obtenidas | 100 |
| Salidas enteras validas en 0..100 | 98 |
| Tasa de parseo | 98,0 % |
| MAE | 29,44 |
| RMSE | 38,17 |
| Pearson r | 0,462 |
| Spearman rho | 0,522 |
| Coincidencia exacta entre salidas validas | 2,0 % |
| Dentro de ±5 entre salidas validas | 14,3 % |
| Dentro de ±10 entre salidas validas | 24,5 % |
| Dentro de ±20 entre salidas validas | 45,9 % |

Perdida de validacion durante el entrenamiento: 9,87062 (linea base) frente a 6,706186 (final). El modo de fallo principal documentado es que ante prompts de estilo MATH el modelo resuelve el problema en lugar de puntuar su dificultad.

## Requisitos de hardware

- Peso del artefacto: 7.381.382.848 bytes (~7,4 GB) para el GGUF Q4_K_M; esa cifra es el minimo de memoria para cargar los pesos.
- VRAM estimada (estimacion propia, no publicada por el autor): en torno a 8-10 GB solo para pesos, y aproximadamente 10-12 GB si se anade ventana de contexto y cache KV; la cifra exacta no esta disponible porque no se declara la longitud de contexto del modelo base.
- GPU consumer: cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y en 16 GB de memoria unificada en adelante; en configuraciones de 8 GB requeriria descarga parcial a CPU con llama.cpp.
- GPU de datacenter: A100, H100, L40S o A10G son suficientes y quedan sobredimensionadas para un modelo de 11,9 B en 4 bits; son utiles si se necesita alto paralelismo de peticiones.
- Opciones de despliegue: llama.cpp, Ollama (usado en la verificacion publicada), servidores GGUF compatibles y, si se convierte el artefacto a safetensors, vLLM o TGI. No se publica una version en safetensors en este repositorio.
- Latencia y throughput: no disponibles. Al tratarse de una tarea de salida de un unico token numerico, el coste dominante es el prefill del prompt y no la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (request-complexity-20260918-01) | 11.907.350.576 | no disponible | GGUF Q4_K_M | apache-2.0 segun metadatos, con licencia Gemma 4 del modelo base | Fine-tune especializado en puntuar complejidad; MAE 29,44 y 98 % de parseo en verificacion; autor lo declara no listo para produccion |
| google/gemma-4-12B-it (modelo base) | ~12 B | no disponible | safetensors (upstream) | licencia Gemma 4 | Modelo de instrucciones generalista; capacidad de puntuacion de complejidad no medida en la informacion disponible |
| Otros fine-tunes de scoring de complejidad de peticiones | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No apto para produccion: el propio autor lo declara explicitamente. La correlacion medida es moderada (Pearson 0,462; Spearman 0,522) y la coincidencia exacta con la etiqueta es del 2,0 %.
- Error absoluto medio muy alto: MAE de 29,44 y RMSE de 38,17 sobre una escala de 0 a 100 implican que la puntuacion, en la practica, solo sirve para separar ordenes de magnitud, no para umbrales finos.
- Modo de fallo sistematico: ante prompts de matematicas el modelo resuelve el ejercicio en lugar de puntuarlo, lo que rompe el parseo y sesga las puntuaciones al alza en esa categoria.
- Etiquetas no certificadas: los valores numericos son sinteticos o derivados de MATH-500; la propia model card los describe como una heuristica calibrada y no como una medida validada por humanos.
- Conjunto de entrenamiento muy reducido: 350 filas de entrenamiento y 8 pasos. El riesgo de sobreajuste al estilo de los prompts de entrenamiento es alto, y la generalizacion a dominios no vistos (legal, medico, conversacional informal, otros idiomas) no esta medida.
- Idioma: solo ingles declarado. El comportamiento con entradas en castellano u otros idiomas no esta documentado ni evaluado.
- Riesgo de alucinacion en la forma de la salida: aunque la tasa de parseo es del 98 %, un 2 % de respuestas no son enteros validos en 0..100; cualquier integracion debe incluir validacion y reintento.
- Ambiguedad de licencia: los metadatos indican apache-2.0, pero el enlace de licencia apunta a la licencia de Gemma 4 y el propio README pide seguir los terminos y requisitos de atribucion del modelo base. Antes de un uso comercial conviene verificar la licencia efectiva del derivado.
- Advertencia de contexto: si se usa para decidir que modelo atiende una peticion, un error de 30 puntos en la estimacion puede degradar la calidad final del sistema; se recomienda validar con un conjunto propio antes de cualquier despliegue.
- Artefacto unico: solo se publica GGUF Q4_K_M. Si se necesita mayor precision (Q8, FP16) o integracion nativa con vLLM/TGI, hay que reconvertir el modelo, sin garantia de que el ajuste sobreviva intacto a la conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EugeneEvstafev/gemma-4-12b-request-complexity-20260918-01
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia de Gemma 4 referenciada en los metadatos: https://ai.google.dev/gemma/docs/gemma_4_license
- Artefactos de reproducibilidad incluidos en el repositorio: analysis-summary.json, dataset/manifest.json, training/outputs/export.json, receipts/training-train.json, receipts/training-export.json, scoring/verification-modal-20260918-02/numeric-metrics.json, scoring/verification-modal-20260918-02/predictions.csv, scoring/verification-modal-20260918-02/category-metrics.csv
- Resultados de la busqueda web: no contienen ningun enlace relacionado con el modelo (corresponden a guias turisticas de Phuket), por lo que no se incluyen.
