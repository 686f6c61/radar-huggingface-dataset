# mradermacher/spoomplesmaxx-mockingbird-36B-i1-GGUF

## Resumen

El modelo `mradermacher/spoomplesmaxx-mockingbird-36B-i1-GGUF` es una cuantización en formato GGUF del modelo base `aimeri/spoomplesmaxx-mockingbird-36B`, realizada por el usuario mradermacher. Este modelo está orientado a tareas de roleplay y escritura creativa, como indican sus etiquetas en HuggingFace. Se distribuye bajo licencia Apache-2.0 y está pensado para su uso con motores de inferencia compatibles con GGUF, como llama.cpp, Ollama o vLLM.

El modelo base cuenta con 36.151 millones de parámetros, aunque no se dispone de información pública sobre su arquitectura, longitud de contexto o proceso de entrenamiento. La versión cuantizada aquí presentada incluye un único archivo de cuantización de tipo `i1-Q2_K` de 13,7 GB, junto con un archivo de imatrix para generar cuantizaciones personalizadas. Es relevante para desarrolladores que buscan un modelo de generación de texto creativo con requisitos de hardware moderados, aunque la falta de documentación técnica limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 36.151.104.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (unico archivo publicado en este repo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base `aimeri/spoomplesmaxx-mockingbird-36B`. Se desconoce si se trata de un transformer denso, MoE o una arquitectura hibrida. Tampoco hay datos sobre el dataset de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas de RLHF o DPO. La unica informacion disponible es que el modelo esta etiquetado para roleplay y escritura creativa, lo que sugiere un ajuste fino orientado a dialogos y narrativa, pero no se puede confirmar.

La cuantizacion fue realizada por mradermacher utilizando el metodo imatrix, que optimiza la asignacion de bits segun la importancia de los pesos. El archivo `i1-Q2_K` es una cuantizacion de 2 bits con kernel K, que reduce significativamente el tamano del modelo (13,7 GB frente a los aproximadamente 64,9 GB del repo completo). No se especifican otros detalles tecnicos del proceso de cuantizacion.

## Capacidades

- Generacion de texto en ingles, con enfoque en roleplay y escritura creativa segun las etiquetas del modelo.
- No se dispone de informacion sobre capacidades de razonamiento, codigo, matematicas o vision.
- No se menciona soporte para tool calling, function calling o agentes.
- No se indica capacidad multilingue; el unico idioma declarado es ingles.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

Dado que la informacion publica es limitada, los casos de uso se infieren de las etiquetas y del formato GGUF:

- Escritura de ficcion interactiva: el modelo puede generar narrativas y dialogos en ingles, adecuado para juegos de rol por texto o historias colaborativas.
- Creacion de personajes y guiones: util para desarrollar dialogos de personajes en proyectos de escritura creativa.
- Prototipado de chatbots de entretenimiento: puede servir como base para un asistente conversacional con tono creativo, aunque sin garantias de calidad por falta de benchmarks.
- Generacion de contenido para juegos: descripciones de escenarios, misiones o NPCs en ingles.
- Experimentacion con cuantizaciones: el archivo imatrix permite a desarrolladores generar sus propias cuantizaciones para probar distintos equilibrios de calidad y rendimiento.
- Despliegue local en hardware modesto: al ser un GGUF de 13,7 GB, puede ejecutarse en GPUs de consumo con 16 GB de VRAM, aunque no hay datos oficiales de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras pruebas estandar para este modelo ni para su version base.

## Requisitos de hardware

- El archivo GGUF `i1-Q2_K` pesa 13,7 GB, por lo que se estima que requiere al menos 16 GB de VRAM para cargar el modelo completo en GPU (considerando overhead de contexto y calculo).
- GPUs recomendadas: tarjetas con 16 GB o mas de VRAM, como RTX 4080, RTX 4090, A100 40GB o superiores. No se dispone de datos de latencia o throughput.
- Es posible ejecutar el modelo en CPU con llama.cpp, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta GGUF), o cualquier motor compatible con GGUF.
- No se han publicado mediciones de rendimiento especificas para este modelo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (roleplay/escritura creativa) con parametros similares. La falta de documentacion del modelo base impide establecer comparaciones fiables.

## Limitaciones y advertencias

- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo base.
- La cuantizacion Q2_K es de baja precision, lo que puede degradar la calidad de la generacion en comparacion con el modelo original en full precision.
- El modelo solo esta documentado para ingles; su rendimiento en otros idiomas es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero al no conocerse el origen de los datos de entrenamiento, no se puede garantizar la ausencia de problemas legales o eticos.
- No se recomienda su uso en produccion sin una evaluacion exhaustiva, dado que no hay benchmarks publicados.
- El repositorio solo contiene un archivo de cuantizacion (i1-Q2_K) y el imatrix; no se ofrecen otras opciones de cuantizacion en este repo especifico.

## Enlaces

- [HuggingFace - mradermacher/spoomplesmaxx-mockingbird-36B-i1-GGUF](https://huggingface.co/mradermacher/spoomplesmaxx-mockingbird-36B-i1-GGUF)
- [Modelo base - aimeri/spoomplesmaxx-mockingbird-36B](https://huggingface.co/aimeri/spoomplesmaxx-mockingbird-36B)
- [Pagina de descarga de mradermacher](https://hf.tst.eu/model#spoomplesmaxx-mockingbird-36B-i1-GGUF)
- [Guia de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
