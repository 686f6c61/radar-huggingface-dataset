# mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-ARA-heretic-GGUF es una cuantizacion estatica en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-ARA-heretic, publicada por el usuario mradermacher. El modelo subyacente es una variante "abliterated" (tambien etiquetada como heretic, uncensored o decensored) construida sobre Qwen2.5-32B-Instruct, el modelo denso de 32.7 mil millones de parametros de Alibaba, en la que se ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir la tendencia del modelo a negarse a responder ciertas peticiones.

El repositorio no aporta pesos en safetensors sino unicamente una coleccion de cuantizaciones GGUF listas para usar con llama.cpp y herramientas compatibles, con tamanos que van desde los 12.4 GB de la variante Q2_K hasta los 34.9 GB de Q8_0. Esta orientado a inferencia local y despliegue offline en hardware consumer de gama alta o en servidores con GPU unica.

Su relevancia actual reside en que permite ejecutar un modelo de 32B con capacidades de chat e instruccion en equipos con 24 GB de VRAM usando cuantizaciones Q4, algo impensable con los pesos en precision completa. La licencia declarada es Apache 2.0, heredada de Qwen2.5, aunque el modelo base arrastra las etiquetas openrail++ y heretic que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio separado |
| Idiomas soportados | en |
| Licencia | apache-2.0 (etiquetas adicionales: openrail++) |
| Formato de pesos | GGUF (multiparte; no se incluyen safetensors) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-32B-Instruct, un transformer denso con atencion por cabezas agrupadas (GQA) y decodificacion autorregresiva estandar. Sobre esa base, el autor original (richardyoung) aplico un proceso de "abliteration" o "heretic": una modificacion de los pesos orientada a eliminar la direccion de activacion asociada al rechazo, de modo que el modelo responde a peticiones que la version instruct original rechazaria. No se dispone de informacion sobre el dataset exacto, el numero de tokens de entrenamiento adicional ni si hubo RLHF o DPO en esta variante concreta.

La contribucion de mradermacher se limita a la cuantizacion: convierte los pesos originales en formato Hugging Face a GGUF y genera las distintas variantes (Q2 a Q8) mediante cuantizacion estatica, con versiones adicionales ponderadas por imatrix en un repositorio hermano. No hay innovaciones de arquitectura propias del cuantizador; la calidad depende de la fidelidad de la cuantizacion y del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con formato de chat instruct.
- Razonamiento y respuesta a instrucciones heredadas de Qwen2.5-32B-Instruct (matematicas, codigo, comprension lectora).
- Respuestas sin filtros de rechazo por defecto (comportamiento "uncensored" o "abliterated"), lo que amplia el rango de peticiones atendidas.
- Compatible con llama.cpp y servidores OpenAI-compatible (endpoints_compatible), lo que facilita integrarlo en pipelines existentes.
- Soporte de cuantizaciones de 2 a 8 bits para adaptar calidad y huella de memoria.
- Capacidades multilingues limitadas al ingles segun la metadata del repositorio.

## Casos de uso

- Inferencia local en estacion de trabajo con GPU de 24 GB: usar Q4_K_M (20 GB) para ejecutar un 32B en una RTX 4090 o similar, con contexto moderado.
- Despliegue en servidor con una sola A100 40 GB: cargar Q8_0 (34.9 GB) para maxima fidelidad respecto al modelo original.
- Investigacion sobre alineacion y seguridad: comparar respuestas del modelo heretic frente a Qwen2.5-32B-Instruct estandar para estudiar el efecto de la ablacion en la tasa de rechazo.
- Generacion de contenido creativo sin restricciones de filtrado, en entornos controlados y con supervision humana.
- Prototipado de asistentes conversacionales offline en ingles donde no se quiera depender de APIs externas.
- Evaluacion de cuantizaciones: usar el conjunto de variantes Q2 a Q8 para medir la degradacion de perplejidad y calidad segun el bit-width.
- Integracion en pipelines de CI/CD mediante endpoint compatible con OpenAI para pruebas de modelos en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~12.4 GB, Q4_K_M ~20 GB, Q6_K ~27 GB, Q8_0 ~34.9 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, A100 40 GB o H100 para Q6_K y Q8_0.
- Cabe en GPU consumer de gama alta (RTX 3090/4090 con 24 GB) unicamente con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI; vLLM y TGI no soportan GGUF de forma nativa en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-ARA-heretic-GGUF (este) | 32.7B | no disponible | apache-2.0 | GGUF | Variante abliterated, solo ingles |
| Qwen2.5-32B-Instruct (original) | 32.7B | no disponible | apache-2.0 | safetensors | Modelo base alineado, multilingue |
| richardyoung/Qwen2.5-32B-Instruct-ARA-heretic | 32.7B | no disponible | apache-2.0 | safetensors | Pesos originales sin cuantizar |
| Variantes imatrix del mismo modelo | 32.7B | no disponible | apache-2.0 | GGUF | Cuantizacion ponderada, mayor calidad a igual tamano |

## Limitaciones y advertencias

- El proceso de ablacion elimina barreras de rechazo, lo que puede producir contenido ofensivo, inseguro o legalmente problematico; requiere supervision y filtros externos en produccion.
- Riesgo elevado de alucinacion, comun en modelos de 32B y potencialmente agravado por la perdida de alineacion.
- Idiomas soportados limitados al ingles segun la metadata; el rendimiento en castellano no esta garantizado.
- La licencia apache-2.0 se declara en el repositorio, pero las etiquetas openrail++ y heretic del modelo base deben revisarse para uso comercial.
- Las cuantizaciones Q2 y Q3 degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- El repositorio ocupa 224 GB y los archivos GGUF pueden estar divididos en multiparte; hay que concatenarlos correctamente antes de cargarlos.
- No se dispone de informacion sobre la longitud de contexto efectiva tras la cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF
- Modelo base (pesos originales): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic
- Variantes imatrix: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-ARA-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Licencia Qwen2.5: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
