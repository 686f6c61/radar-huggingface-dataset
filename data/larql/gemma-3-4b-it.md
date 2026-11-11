# larql/gemma-3-4b-it

## Resumen

`larql/gemma-3-4b-it` es un contenedor del modelo `google/gemma-3-4b-it` de Google, empaquetado en el formato VINDEX3 para su uso con el runtime LARQL. No se trata de un fine-tuning ni de una modificacion de pesos: el autor (usuario `larql`) declara que los pesos BF16 originales se incluyen sin modificar, y lo que anade es la estructura del modelo como grafo ejecutable e inspeccionable. El modelo base es un transformer multimodal de 4 mil millones de parametros de la familia Gemma 3, publicado por Google bajo los terminos de uso de Gemma.

La relevancia de esta publicacion es de infraestructura mas que de modelado: permite ejecutar Gemma 3 4B con un comando (`larql pull`, `larql run`, `larql serve`) y exponer una API compatible con OpenAI en el puerto indicado, ademas de inspeccionar la estructura interna del modelo mediante el comando `vindex3 observe` y el lenguaje LQL. El repositorio ocupa 8,6 GB, coherente con pesos BF16 de un modelo de 4B mas los tensores de vision.

La model card es muy escueta y no aporta informacion sobre datos de entrenamiento, benchmarks ni idiomas soportados. Ademas, advierte explicitamente de que, aunque los pesos de vision viajan en el contenedor, esta compilacion de LARQL no admite entrada de imagen ni audio para este modelo, por lo que en la practica se usa solo como modelo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), empaquetado como grafo VINDEX3 para LARQL; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4 mil millones (segun el nombre del modelo base `gemma-3-4b-it`) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el contenedor incluye pesos BF16 sin modificar |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) y Gemma Prohibited Use Policy |
| Formato de pesos | Contenedor VINDEX3 (runtime LARQL); pesos originales en BF16; no se mencionan safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-3-4b-it`, un transformer de 4B parametros de la familia Gemma 3 de Google, ajustado para instrucciones (sufijo `-it`). La model card de esta publicacion no describe la arquitectura interna, los datos de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; esa informacion corresponderia a la model card del modelo base de Google, que no se incluye en la informacion proporcionada.

La innovacion de este repositorio es el empaquetado: los pesos BF16 originales se encapsulan junto con la estructura del modelo como un grafo ejecutable e inspeccionable dentro del formato VINDEX3. El autor indica que el modelo se codifico a partir de la revision `google/gemma-3-4b-it@093f9f388b31de276ce2de164bdc2081324b9767` y que los digests de verificacion estan en `PROVENANCE.md`. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto: soportada mediante `larql run` y `larql chat`.
- Servido como API: `larql serve gemma-3-4b-it --port 8080` expone una API compatible con OpenAI.
- Inspeccion estructural: `vindex3 observe` y el lenguaje LQL permiten consultar el grafo del modelo.
- Vision: los pesos de vision estan presentes en el contenedor, pero esta compilacion de LARQL no admite entrada de imagen para este modelo.
- Audio: no admitido en esta compilacion.
- Tool calling, function calling y razonamiento multi-paso en agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un modelo de instrucciones de 4B con API compatible con OpenAI: `larql serve` permite levantar un endpoint en el puerto 8080 y apuntar clientes existentes de la API de OpenAI sin adaptadores adicionales.
- Prototipado rapido de aplicaciones de chat: `larql pull` y `larql run` reducen el flujo a dos comandos, util para entornos de desarrollo donde se quiere validar una idea antes de montar infraestructura de serving mas compleja.
- Analisis e interpretabilidad de modelos: al incluir la estructura como grafo inspeccionable, el contenedor sirve para estudiar la organizacion interna de Gemma 3 4B con `vindex3 observe` y consultas LQL, algo que no ofrece un checkpoint convencional.
- Verificacion de procedencia de pesos: los digests en `PROVENANCE.md` y la referencia a la revision exacta del modelo base permiten auditar que los pesos corresponden al checkpoint oficial de Google, util en entornos con requisitos de trazabilidad.
- Experimentacion con el runtime LARQL: sirve como banco de pruebas para evaluar el rendimiento y las limitaciones de LARQL frente a otros runtimes (vLLM, llama.cpp) sobre un modelo de tamano medio.
- Generacion de texto en entornos con recursos limitados: un modelo de 4B en BF16 (repositorio de 8,6 GB) es viable en una unica GPU de gama alta de consumo, lo que facilita pruebas fuera de clusters.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como referencia, los pesos BF16 de un modelo de 4B ocupan aproximadamente 8 GB, y el repositorio completo ocupa 8,6 GB. El consumo real depende del runtime LARQL y de la longitud de contexto, que no se documenta.
- GPU recomendadas: no disponible en la informacion proporcionada.
- GPU de consumo: no confirmado por el autor; por tamano de pesos, un modelo de 4B en BF16 es candidato a caber en GPU de consumo con 12-16 GB o mas, pero no hay validacion en la model card.
- Opciones de despliegue: runtime LARQL (`larql pull`, `larql run`, `larql chat`, `larql serve` con API compatible con OpenAI). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| larql/gemma-3-4b-it | 4B | no disponible | VINDEX3 (LARQL) | Gemma Terms of Use | Pesos BF16 de Gemma 3 4B IT sin modificar, con grafo inspeccionable |
| google/gemma-3-4b-it | 4B | no disponible en esta ficha | safetensors (formato habitual del modelo base) | Gemma Terms of Use | Modelo original de Google; vision operativa en el checkpoint oficial |
| Alternativas de 4B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion con alternativas de la misma categoria (por ejemplo, otros modelos de 3-5B de licencia abierta) no puede completarse con rigor porque la informacion proporcionada no incluye especificaciones del modelo base ni de terceros.

## Limitaciones y advertencias

- Sin datos de evaluacion: no hay benchmarks publicados en la informacion disponible, por lo que no se puede caracterizar su calidad frente a alternativas.
- Vision no operativa: aunque los pesos multimodales estan en el contenedor, esta compilacion de LARQL no acepta imagenes ni audio, lo que limita el modelo a texto.
- Idiomas no documentados: se desconoce la cobertura linguistica real; no asumir soporte de castellano sin validacion empirica.
- Contexto no documentado: se desconoce la ventana de contexto efectiva en este contenedor, algo critico para aplicaciones de documentos largos o conversaciones multi-turno extensas.
- Dependencia de un runtime poco extendido: el formato VINDEX3 solo es utilizable con LARQL, lo que reduce la portabilidad frente a safetensors o GGUF y ata el despliegue al mantenimiento de ese proyecto.
- Licencia restrictiva: se aplican los Gemma Terms of Use y la Gemma Prohibited Use Policy; el uso comercial esta sujeto a esas condiciones y no es una licencia permisiva tipo Apache 2.0.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados en la informacion proporcionada.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/larql/gemma-3-4b-it
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Revision del modelo base usada: `google/gemma-3-4b-it@093f9f388b31de276ce2de164bdc2081324b9767`
- Proyecto VINDEX3: https://vindex3.org
- Runtime LARQL: https://github.com/chrishayuk/larql
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Procedencia y digests: `PROVENANCE.md` dentro del repositorio
