# danielrosehill/BLUF-Email-Classifier

## Resumen

BLUF-Email-Classifier es un clasificador de texto de tipo SetFit construido sobre el encoder BAAI/bge-small-en-v1.5. Lo publica danielrosehill como prueba de concepto (pilot r1) y su funcion es sugerir una etiqueta de asunto estilo militar estadounidense (BLUF, *bottom line up front*) a partir del cuerpo de un correo electronico. Las etiquetas posibles son `ACTION`, `SIGN`, `INFO`, `DECISION`, `REQUEST`, `COORD` y `APPROVAL`, siguiendo la convencion popularizada por Kabir Sehgal en Harvard Business Review (2016).

El modelo resuelve un problema acotado de normalizacion de comunicacion interna: convertir el cuerpo de un email en una palabra clave de asunto que indique de inmediato al destinatario que se espera de el. No es un modelo generativo ni un LLM: es un clasificador de 33,36 millones de parametros (mayoritariamente el encoder BERT-small subyacente) que devuelve una de siete clases. Su relevancia actual es limitada y experimental: se entrena con 80 emails sinteticos etiquetados por IA y no se ha evaluado con correo real.

La arquitectura es SetFit, un esquema de few-shot learning que combina un encoder de frases con una cabeza de clasificacion entrenada sobre pares contrastivos. El contexto utilizable es el del encoder base, BAAI/bge-small-en-v1.5, orientado a embeddings de frases en ingles. La licencia MIT permite uso comercial, pero el propio autor advierte que el modelo no esta listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (encoder BERT-small + cabeza de clasificacion sobre embeddings de frases) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BAAI/bge-small-en-v1.5; el autor no la documenta) |
| Tipos de cuantizacion | no disponible (pesos safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | setfit |
| Pipeline | text-classification |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Dataset de entrenamiento | danielrosehill/BLUF-Email-Synthetic |
| Tamano del repo | 0,1 GB |
| Etiquetas | ACTION, SIGN, INFO, DECISION, REQUEST, COORD, APPROVAL |

## Arquitectura y entrenamiento

SetFit es un metodo de clasificacion few-shot que consta de dos fases: primero genera embeddings de frases con un encoder preentrenado (aqui BAAI/bge-small-en-v1.5, un BERT-small en ingles optimizado para similitud semantica), y despues entrena una cabeza de clasificacion ligera sobre esos embeddings usando pares de frases contrastivas. El resultado es un clasificador muy barato en inferencia comparado con un LLM, pero limitado a las clases para las que fue entrenado.

El entrenamiento se realizo con 1 epoca, 20 iteraciones, batch de 16 y semilla 42, sobre una GPU Modal T4, con un tiempo total de 0,7 minutos. Los datos provienen del dataset sintetico `danielrosehill/BLUF-Email-Synthetic`, con 80 emails etiquetados por IA y un split estratificado 80/20 (64 de entrenamiento, 20 de test). No se documenta RLHF, DPO ni ajuste con datos humanos; no hay innovaciones tecnicas destacables mas alla del propio esquema SetFit.

## Capacidades

- Clasificacion de texto en siete clases cerradas (`ACTION`, `SIGN`, `INFO`, `DECISION`, `REQUEST`, `COORD`, `APPROVAL`) a partir del cuerpo de un email en ingles.
- Prediccion por lote mediante `SetFitModel.predict`, apta para procesar listas de emails.
- Inferencia muy rapida y ligera: encoder BERT-small de 33,36 millones de parametros, sin generacion autoregresiva.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio.
- No genera texto ni resúmenes; unicamente devuelve la etiqueta predicha.

## Casos de uso

- Triaje de bandeja de entrada: clasificar automaticamente correos entrantes en categorias de accion (`ACTION`, `SIGN`, `REQUEST`) frente a informativos (`INFO`), para priorizar la revision manual. Adecuado por su latencia baja y coste minimo, aunque solo como sugerencia.
- Etiquetado previo de asuntos: generar un prefijo de asunto tipo `SIGN – ...` a partir del cuerpo, reduciendo el tiempo de redaccion en equipos que usan la convencion BLUF.
- Enrutamiento a colas de trabajo: enviar emails `SIGN` a flujos de firma electronica y emails `DECISION` a paneles de aprobacion, usando la etiqueta como primer filtro.
- Prototipado de pipelines de NLP: servir como baseline few-shot para experimentar con SetFit antes de invertir en un modelo mayor o en anotacion humana.
- Investigacion sobre convenciones de comunicacion: analizar la distribucion de tipos de peticion en corpus de correo interno.
- Filtrado de correo operativo en entornos militares o de defensa que ya aplican AR 25-50, siempre con revision humana dado el estado piloto.
- Demostracion docente: ejemplo compacto de clasificacion few-shot con SetFit sobre un encoder de frases.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 20 emails sinteticos de test (split 80/20 del dataset):

| Metrica | Valor |
|---|---|
| Accuracy | 0,85 |
| Macro-F1 | 0,85 |
| Errores observados | ACTION→COORD, REQUEST→ACTION, REQUEST→COORD |
| Tamano del test | 20 emails (2-3 por etiqueta) |

El propio autor califica estos resultados como *smoke test*, no como estimacion fiable. No hay comparacion con otros modelos ni evaluacion sobre correo real.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 33,36 millones de parametros; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se hizo en una T4.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3060, RTX 4090 y similares; tambien funciona en CPU.
- Opciones de despliegue: libreria `setfit` (via `SetFitModel.from_pretrained`), exportacion a ONNX no documentada, integracion en pipelines Python personalizados. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles; el entrenamiento completo tardo 0,7 minutos en T4, lo que sugiere inferencia del orden de milisegundos por email, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| BLUF-Email-Classifier | SetFit sobre bge-small-en-v1.5 | 33,36 M | no disponible | MIT | piloto, 80 emails sinteticos |
| BAAI/bge-small-en-v1.5 (base) | encoder de frases | ~33 M | no disponible | MIT | modelo consolidado de embeddings |
| Clasificador zero-shot con LLM (p. ej. un modelo generativo) | generativo | miles de millones | largo | variable | requiere prompt y es mas caro |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada; la comparacion se limita a tipo de modelo, tamano y licencia.

## Limitaciones y advertencias

- Modelo piloto: el autor lo declara explicitamente no listo para produccion; etiquetas, datos y pesos pueden cambiar.
- Entrenado con solo 80 emails sinteticos generados y etiquetados por IA; no se ha evaluado con correo real, por lo que el rendimiento en dominios reales es desconocido.
- Conjunto de test de 20 emails (2-3 por etiqueta): las metricas de 0,85 de accuracy y macro-F1 no son una estimacion fiable.
- Solo ingles; no procesa correo en castellano ni otros idiomas.
- Clases cerradas: no puede inventar etiquetas nuevas ni manejar emails ambiguos o mixtos.
- Riesgo de clasificacion erronea en peticiones sutiles (los errores observados mezclan REQUEST, ACTION y COORD).
- Licencia MIT permite uso comercial, pero la falta de validacion desaconseja integrarlo en flujos criticos sin evaluacion propia.
- No hay datos sobre sesgos, robustez ante adversarios ni comportamiento con emails largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielrosehill/BLUF-Email-Classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/danielrosehill/BLUF-Email-Synthetic
- Repositorio de codigo: https://github.com/danielrosehill/BLUF-Email-Classifier
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Articulo de referencia (Kabir Sehgal, HBR, 2016): https://hbr.org/2016/11/how-to-write-email-with-military-precision
