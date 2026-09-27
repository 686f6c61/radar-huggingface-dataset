# krazyjakee/gandalf

## Resumen

Gandalf 0.0.1 es un clasificador de texto compacto y condicionado por politicas, desarrollado por el autor krazyjakee dentro del proyecto E2EM (End to End Moderation). Su objetivo es explorar si la moderacion de contenido puede ejecutarse localmente, sin enviar conversaciones privadas a un servicio de puntuacion remoto. Se distribuye como un cross-encoder DeBERTa que recibe un par formado por el enunciado de una politica en ingles y un mensaje objetivo (con contexto conversacional opcional) y devuelve un unico logit por par.

El modelo parte del checkpoint cross-encoder/nli-deberta-v3-xsmall y se ha afinado sobre ejemplos derivados del dataset nvidia/Aegis-AI-Content-Safety-Dataset-2.0. Cuenta con 70.830.337 parametros (incluidas las embeddings) y un presupuesto de contexto de 512 tokens que abarca tanto la politica como los tokens especiales. Declara 26 categorias con enunciados canonicos y umbrales congelados en calibracion.

Es relevante porque publica pesos, tokenizer, umbrales y resultados de evaluacion de forma reproducible, ademas de un contrato explicito de aceptacion (al menos 90 % de recall y como maximo 1 % de falsos positivos benignos por categoria, con intervalos de confianza del 95 %). El propio autor indica que este checkpoint es un baseline de investigacion inspeccionable y no una garantia de seguridad en produccion: ninguna de las 26 categorias supera la puerta de aceptacion registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder DeBERTa (politica-mensaje), un logit de salida por par |
| Parametros totales | 70.830.337 (incluidas embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens, incluidos politica y tokens especiales |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32); no se documentan versiones cuantizadas |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,3 GB; paquete original de 291.720.350 bytes en FP32) |

Datos adicionales de la release: version 0.0.1 (candidata de investigacion), 26 categorias declaradas, SHA-256 de los pesos `916370da013a428a8ed3e00791049d12b3b3fd5836969d8b0492bc5de372d5c8`. Creado el 2026-09-27 y actualizado el 2026-09-27. Descargas y likes en el momento del registro: 0.

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder basado en la familia DeBERTa, segun la model card, aunque las etiquetas del repositorio incluyen `deberta-v2`; el modelo base declarado es cross-encoder/nli-deberta-v3-xsmall. El modelo procesa cada par politica-mensaje de forma conjunta y produce un unico logit, al que se aplica una sigmoide. No usa una unica codificacion de texto compartida con 26 cabezas de salida: un lote de politicas es un lote de pares politica-mensaje independientes. El preprocesado conserva la politica y mantiene el inicio y el final de la evidencia de mensajes largos; sin contexto la segunda entrada es solo el mensaje, y con contexto pasa a ser `Message:\n…\n\nContext:\n…`.

El entrenamiento se realizo en la ronda "all-v2 Jigsaw", con semilla 17 y tres epocas. El registro de entrenamiento contiene 749.356 ejemplos de politica-evidencia, no 749.356 conversaciones unicas. Los datos provienen de nvidia/Aegis-AI-Content-Safety-Dataset-2.0. Las versiones de prueba registradas (no requisitos obligatorios) son torch 2.2.2, transformers 4.57.6, huggingface_hub 0.36.2 y safetensors 0.8.0, sobre Python 3.11 o superior. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Clasificacion de texto de moderacion: puntua pares politica-mensaje y devuelve un score por par.
- Condicionamiento por politica: acepta 26 categorias con enunciados canonicos y umbrales especificos por preset.
- Uso de contexto conversacional opcional: puede incorporar contexto ademas del mensaje objetivo dentro del presupuesto de 512 tokens.
- Inferencia local tras la descarga: el ejemplo incluido ejecuta la inferencia en local, sin servicio remoto de scoring.
- Ejecucion en CPU: probada en CPU con las versiones registradas.
- Integracion con el ecosistema transformers y safetensors (carga sin `trust_remote_code=True`).
- Generacion de texto: no disponible (es un modelo de clasificacion).
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente o razonamiento multi-paso: no disponible (no documentado).
- Vision, audio o modo de razonamiento explicito: no disponible (no documentado).

## Casos de uso

- Moderacion local en aplicaciones de mensajeria: el modelo puede puntuar mensajes dentro del propio dispositivo o servidor del operador, reduciendo la necesidad de revelar el contenido a un servicio externo de moderacion, siempre que la aplicacion asuma la seleccion de politica y la accion derivada.
- Avisos y difuminado de contenido en cliente: una app podria usar el score local para mostrar una advertencia, difuminar contenido o invitar al usuario a reconsiderar un mensaje antes de enviarlo; la accion la decide la aplicacion, no el modelo.
- Investigacion reproducible en moderacion: al publicar pesos, enunciados de politica, umbrales congelados y `evaluation.json`, sirve para replicar evaluaciones y estudiar el contrato de aceptacion propuesto por el proyecto.
- Filtrado previo en pipelines de contenido en ingles: puede emplearse como etapa de triaje sobre texto en ingles para marcar candidatos a revision humana, dado su bajo coste computacional (70,8 M de parametros).
- Evaluacion de umbrales por politica: los presets con umbrales especificos permiten analizar el equilibrio entre recall y falsos positivos por categoria en conjuntos propios.
- Deteccion de discurso de odio por identidad: con el preset correspondiente, el modelo reporta AUROC 0,8238 en el conjunto externo DynaHate, por lo que puede usarse como referencia en estudios de sesgo y sensibilidad.

## Benchmarks y rendimiento

Los unicos resultados registrados en la informacion disponible corresponden al test externo DynaHate y a la puerta de aceptacion del proyecto.

| Evaluacion | Resultado |
|---|---|
| DynaHate (test externo, 4.118 mensajes etiquetados por humanos) | AUROC 0,8238 |
| DynaHate, recall sobre mensajes de odio | 1.507 / 2.267 (66,48 %) |
| DynaHate, falsos positivos sobre mensajes no de odio | 340 / 1.851 (18,37 %) |
| Puerta de aceptacion formal (objetivo: recall >= 90 % y FP benignos <= 1 % por categoria, con IC del 95 %) | 0 de 26 categorias superan la puerta registrada |
| Media descriptiva publicada por el sitio del proyecto | 67 % (media descriptiva del progreso de recall respecto al objetivo, usando recall diagnostico generado para categorias sin resultado humano evaluable; no es exactitud ni porcentaje de puertas superadas) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del tamano de parametros, no publicada por el autor): en FP32, alrededor de 0,3-0,6 GB; en FP16, en torno a 0,15-0,3 GB; en INT8, del orden de 0,1-0,2 GB. Son estimaciones, no medidas oficiales.
- CPU: el checkpoint fue probado en CPU con torch 2.2.2, transformers 4.57.6, huggingface_hub 0.36.2 y safetensors 0.8.0, por lo que la inferencia en CPU es viable para cargas moderadas.
- GPU recomendadas: al ser un modelo de 70,8 M de parametros, cabe en practicamente cualquier GPU moderna, incluidas tarjetas de consumo (por ejemplo, RTX 4090 y gamas inferiores); no se especifican modelos concretos en la documentacion.
- GPU de centro de datos (A100, H100): no se documentan pruebas especificas en la informacion disponible.
- Cabe en GPU de consumo: si, por el reducido numero de parametros, aunque el autor no publica mediciones de latencia ni de memoria.
- Opciones de despliegue: transformers (con PyTorch, Safetensors y huggingface_hub); el repositorio incluye la etiqueta text-embeddings-inference. El autor advierte que una pipeline generica de text-classification no sustituye al formato de entrada ni a los umbrales por preset; se recomienda usar `example.py` y `preset_backend.py`. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krazyjakee/gandalf 0.0.1 | 70,8 M | 512 tokens | Clasificacion de moderacion condicionada por politica | no disponible | Pesos en Hugging Face (repo 0,3 GB) |
| cross-encoder/nli-deberta-v3-xsmall | no disponible en la informacion proporcionada | no disponible | Inferencia de lenguaje natural (NLI) | no disponible | Modelo base en Hugging Face |
| Otros clasificadores de moderacion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor indica que el paquete "all-v1" anterior sigue siendo el predeterminado de la aplicacion; los resultados y pesos descritos corresponden especificamente a la version 0.0.1.

## Limitaciones y advertencias

- Baseline de investigacion, no garantia de seguridad: 0 de 26 categorias superan la puerta de aceptacion registrada (recall >= 90 % y FP benignos <= 1 % por categoria).
- Falsos positivos elevados en el test externo: 18,37 % de mensajes no de odio marcados en DynaHate.
- Recall limitado en odio por identidad: 66,48 % de los mensajes de odio detectados en DynaHate, un conjunto deliberadamente dificil con ejemplos adversarios.
- Idioma: solo ingles. No hay soporte multilingue documentado.
- Contexto limitado a 512 tokens incluyendo politica y tokens especiales; los mensajes largos se recortan conservando inicio y final.
- Los scores son salidas del modelo, no probabilidades calibradas de dano ni veredictos legales; el ejemplo devuelve un score y los umbrales, sin ejecutar acciones contra el usuario.
- No usar una pipeline generica de clasificacion: el formato de entrada y los umbrales por preset son especificos y deben respetarse.
- Algunas etiquetas de origen son mas amplias que la politica canonica y algunas categorias tienen demasiados pocos positivos.
- Una puerta filtrada por un modelo maestro no es un test independiente frente a ese maestro; las comprobaciones de chat generadas son diagnostico, no evidencia de aceptacion humana.
- La evaluacion en escritorio y GPU no establece latencia, memoria, consumo de bateria ni robustez en telefonos; no se ha demostrado un runtime movil de extremo a extremo para este checkpoint.
- El 67 % del sitio del proyecto es una media descriptiva del progreso de recall, no exactitud, ni porcentaje de puertas superadas, ni probabilidad de financiacion ni preparacion para despliegue.
- Licencia: no disponible; no puede confirmarse la viabilidad de uso comercial sin consultar al autor.
- Privacidad: que el clasificador se ejecute en local no implica por si solo que la aplicacion contenedora preserve la privacidad.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de clasificaciones erroneas (falsos positivos y falsos negativos) segun lo anterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krazyjakee/gandalf
- Modelo base: https://huggingface.co/cross-encoder/nli-deberta-v3-xsmall
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Sitio del proyecto y video de introduccion: https://e2em.org/
- Especificacion tecnica: https://e2em.org/#specification
- Evidencia de evaluacion: ./evaluation.json
- Manifiesto de la release: ./release.json
