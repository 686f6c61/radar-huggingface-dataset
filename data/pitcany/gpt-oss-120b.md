# pitcany/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de pesos abiertos publicado por OpenAI dentro de la familia gpt-oss, la primera incursion de la compania en modelos abiertos orientados a razonamiento, tareas agénticas y uso por parte de desarrolladores. Se trata de un modelo de mezcla de expertos (MoE) con 117.000 millones de parametros totales y 5.100 millones de parametros activos por token, disenado para caber en una unica GPU de 80 GB como una NVIDIA H100 o una AMD MI300X gracias a una cuantizacion MXFP4 aplicada durante el post-entrenamiento.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de copyleft, y se entreno sobre el formato de respuesta harmony, tambien liberado por OpenAI. Entre sus caracteristicas diferenciales estan el esfuerzo de razonamiento configurable (bajo, medio, alto), la exposicion completa de la cadena de pensamiento para depuracion, y capacidades nativas de function calling, navegacion web, ejecucion de codigo Python y salidas estructuradas.

La ficha que se documenta aqui corresponde al repositorio `pitcany/gpt-oss-120b` en HuggingFace, que es una copia de terceros del modelo original `openai/gpt-oss-120b`. El repositorio figura con 0 descargas, 0 likes y un tamano de 0.0 GB en el momento de la consulta, por lo que se debe tratar como un espejo sin contenido verificado y acudir siempre al repositorio oficial de OpenAI para descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 117.000 millones |
| Parametros activos | 5.100 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (aplicada en post-entrenamiento a los pesos MoE) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de transformers); se menciona tambien el subdirectorio `original/` para la descarga de pesos |

## Arquitectura y entrenamiento

gpt-oss-120b es un transformer de tipo mezcla de expertos con 117.000 millones de parametros totales de los cuales solo 5.100 millones se activan por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. La cuantizacion MXFP4 de los pesos MoE no es un ajuste posterior de la comunidad, sino que forma parte del post-entrenamiento del modelo, y todas las evaluaciones publicadas por el autor se realizaron con esa misma cuantizacion. Esta decision es la que permite que el modelo completo quepa en una GPU unica de 80 GB.

El modelo fue entrenado sobre el denominado harmony response format, un formato de conversacion estructurado que OpenAI ha liberado como paquete independiente (`openai-harmony`). Segun el autor, el modelo no funciona correctamente si no se usa dicho formato: con la plantilla de chat de Transformers se aplica automaticamente, pero al invocar `model.generate` directamente hay que aplicarlo de forma manual. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineamiento (RLHF, DPO u otras) empleadas. Si se documenta que el modelo es ajustable por parametros completos (fine-tuning), que expone la cadena de pensamiento completa y que permite configurar el esfuerzo de razonamiento en tres niveles (bajo, medio, alto).

## Capacidades

- Generacion de texto y razonamiento de proposito general, con esfuerzo de razonamiento configurable en los niveles bajo, medio y alto para ajustar latencia y profundidad.
- Exposicion de la cadena de pensamiento completa, pensada para depuracion y verificacion interna, no para mostrarse al usuario final.
- Capacidades agénticas nativas: function calling, navegacion web y ejecucion de codigo Python.
- Salidas estructuradas (structured outputs), adecuadas para integracion con APIs y pipelines que requieren JSON validado.
- Ajuste fino por parametros para adaptar el modelo a dominios especificos.
- Compatibilidad con servidores compatibles con la API de OpenAI mediante vLLM, Transformers Serve y otras integraciones.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento de alta complejidad en produccion: con 5.100 millones de parametros activos y esfuerzo de razonamiento en nivel alto, el modelo puede resolver problemas de varios pasos en una unica GPU de 80 GB, lo que simplifica el despliegue en clústeres con H100 o MI300X.
- Agentes autonomos con uso de herramientas: el soporte nativo de function calling y de ejecucion de codigo Python permite construir agentes que consultan APIs, calculan resultados y encadenan pasos sin necesidad de frameworks externos de orquestacion complejos.
- Automatizacion de navegacion web y extraccion de datos: la capacidad de browsing integrada permite construir pipelines que consultan paginas, extraen informacion y la resumen o estructuran.
- Generacion de codigo asistida en pipelines de CI/CD: con salidas estructuradas y ejecucion de Python, el modelo puede integrarse en revisiones automaticas, generacion de tests o tareas de refactorizacion dentro de un flujo de integracion continua.
- Analisis y depuracion con trazas de razonamiento: al exponer la cadena de pensamiento completa, es posible auditar por que el modelo llego a una conclusion, algo util en entornos regulados o en tareas de verificacion de respuestas.
- Asistentes de documentacion tecnica: el modelo puede generar y mantener documentacion a partir de codigo y de especificaciones, apoyandose en su ventana de contexto para procesar archivos completos (la longitud exacta no esta disponible en la informacion proporcionada).
- Despliegue local y experimentation: con la variante gpt-oss-20b de la misma familia es posible trabajar en hardware de consumo, mientras que la 120b queda reservada a estaciones con GPU de 80 GB.
- Personalizacion mediante fine-tuning: al ser ajustable por parametros y tener licencia Apache 2.0, es viable adaptarlo a dominios verticales (legal, sanitario, financiero) y desplegarlo comercialmente sin obligaciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que todas las evaluaciones del autor se realizaron con la cuantizacion MXFP4, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en el material suministrado.

## Requisitos de hardware

- VRAM para gpt-oss-120b: el autor indica que el modelo cabe en una unica GPU de 80 GB gracias a la cuantizacion MXFP4. Como referencia derivada de los 117.000 millones de parametros en MXFP4, los pesos ocupan aproximadamente entre 60 y 65 GB (estimacion, no dato publicado por el autor).
- GPU recomendadas para gpt-oss-120b: NVIDIA H100 de 80 GB y AMD MI300X, segun la model card.
- GPU de consumo: la variante gpt-oss-20b esta pensada para ejecutarse en equipos con unos 16 GB de memoria, por lo que la 120b no es viable en GPUs de consumo convencionales.
- Opciones de despliegue: Transformers (`pipeline` y `transformers serve`), vLLM (version 0.10.1+gptoss), implementaciones de referencia en PyTorch/Triton, Ollama (`ollama pull gpt-oss:120b`) y LM Studio (`lms get openai/gpt-oss-120b`).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| gpt-oss-120b | 117.000 millones | 5.100 millones | no disponible | Apache 2.0 | GPU unica de 80 GB (H100, MI300X) |
| gpt-oss-20b | 21.000 millones | 3.600 millones | no disponible | Apache 2.0 | Equipos con unos 16 GB de memoria |
| Otros modelos MoE de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card solo proporciona datos comparativos entre las dos variantes de la propia familia gpt-oss. No se dispone de informacion verificada en el material suministrado sobre alternativas de otros fabricantes con el mismo perfil de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio documentado (`pitcany/gpt-oss-120b`) es una copia de terceros con 0 descargas, 0 likes y 0.0 GB de tamano; no debe considerarse una fuente fiable de pesos. La referencia oficial es `openai/gpt-oss-120b`.
- El modelo debe usarse con el formato harmony. Emplearlo con otra plantilla de conversacion produce resultados incorrectos, y en llamadas directas a `model.generate` hay que aplicar el formato de manera manual.
- La cadena de pensamiento queda expuesta y el autor advierte explicitamente de que no esta pensada para mostrarse al usuario final.
- Riesgo de alucinacion: no se documentan en la informacion disponible tasas de error ni evaluaciones de fidelidad factual.
- Sesgos conocidos: la informacion proporcionada no detalla sesgos especificos ni la composicion del dataset, por lo que no es posible evaluar su alcance.
- Idiomas soportados: no disponible, lo que impide garantizar un rendimiento multilingue homogeneo.
- Longitud de contexto: no disponible, un dato critico para planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- La licencia Apache 2.0 es permisiva y permite uso comercial sin copyleft ni riesgo de patentes segun el autor, pero la ausencia de datos de evaluacion publicados limita la validacion previa a un despliegue en produccion.
- No se han publicado cifras de rendimiento en la informacion disponible, por lo que cualquier comparacion con modelos alternativos carece de respaldo numerico.

## Enlaces

- Repositorio documentado: https://huggingface.co/pitcany/gpt-oss-120b
- Repositorio oficial del modelo: https://huggingface.co/openai/gpt-oss-120b
- Coleccion oficial de gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Modelo menor de la familia: https://huggingface.co/openai/gpt-oss-20b
- Paper (arXiv 2508.10925): https://arxiv.org/abs/2508.10925
- Blog de presentacion de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Pagina del producto: https://gpt-oss.com
- Guias y cookbook: https://cookbook.openai.com/topic/gpt-oss
- Repositorio de codigo: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos de la comunidad: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Guia de uso con Transformers: https://cookbook.openai.com/articles/gpt-oss/run-transformers
- Guia de uso con vLLM: https://cookbook.openai.com/articles/gpt-oss/run-vllm
- Guia de uso con Ollama: https://cookbook.openai.com/articles/gpt-oss/run-locally-ollama
- Pagina de modelos abiertos de OpenAI: https://openai.com/open-models
- Descarga de Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
