# mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF` es una coleccion de cuantizaciones GGUF del modelo `richardyoung/gemma-4-31B-it-ARA-heretic`, una variante "abliterated" (tambien etiquetada como heretic, uncensored y decensored) de Gemma 4 de 31B en su version instruction-tuned. El trabajo de cuantizacion lo firma mradermacher, un perfil habitual en Hugging Face especializado en producir versiones GGUF con matrices de importancia (imatrix) para despliegue en llama.cpp.

El modelo resuelve un problema muy concreto: permitir ejecutar localmente una variante de Gemma 4 de ~30.700 millones de parametros con rechazo reducido (abliteracion) en hardware de consumo, ofreciendo un abanico amplio de niveles de cuantizacion que van desde ~7 GB (IQ1_S) hasta ~25 GB (Q6_K). La abliteracion se aplica sobre el modelo base, de modo que el modelo resultante mantiene la arquitectura y capacidades del Gemma original pero con los mecanismos de rechazo atenuados.

Es relevante ahora porque combina tres tendencias: el interes por modelos locales de gran tamano con cuantizacion agresiva, la demanda de variantes sin censura para investigacion sobre alineacion y seguridad, y la popularidad de Gemma 4 como familia abierta. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia especifica de Gemma 4, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; transformer decoder-only segun la familia Gemma) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas imatrix |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repo | 334,8 GB |
| Descargas | 14.606 |
| Likes | 2 |
| Fecha de creacion | 2026-11-08 |
| Fecha de actualizacion | 2026-11-20 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo base pertenece a la familia Gemma 4 de Google, de la que no se detallan aqui capas, atencion ni contexto. El dato objetivo es el recuento de parametros: 30.697.345.596, lo que situa al modelo en la categoria de ~31B.

El proceso diferencial de esta variante es la abliteracion (etiquetas heretic, uncensored, decensored, abliterated), una tecnica de edicion de pesos que busca eliminar la direccion de rechazo en el espacio de activaciones sin reentrenar. No se especifican en la informacion disponible los detalles del dataset de abliteracion, el numero de tokens empleados ni si hubo fases de RLHF o DPO adicionales. La cuantizacion realizada por mradermacher emplea matrices de importancia (imatrix) y el esquema i1, que combina cuantizacion de tensores de salida y un proceso reproducible segun las etiquetas del repo.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta conversational y pipeline de transformers).
- Razonamiento y respuesta a instrucciones heredadas del Gemma 4 instruction-tuned.
- Comportamiento con rechazo reducido (abliterated): responde a peticiones que el modelo original tenderia a declinar.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su uso detras de servidores compatibles con OpenAI.
- Ejecucion local mediante llama.cpp y derivados al estar en formato GGUF.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de otros idiomas en la informacion disponible.
- Tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar como cambia el comportamiento de un modelo de 31B al eliminar la direccion de rechazo, comparandolo con el Gemma 4 original en el mismo hardware.
- Despliegue local en estaciones de trabajo con GPU de 24 GB: con cuantizaciones i1-Q4_K_M (~18,8 GB) o i1-Q4_K_S (~17,9 GB) el modelo cabe en una RTX 4090 o similar, permitiendo prototipado sin depender de la nube.
- Generacion creativa y escritura sin filtros: util para guiones, ficcion o contenido donde el modelo base aplicaria rechazos, con la advertencia de que la salida debe revisarse.
- Evaluacion comparativa de cuantizaciones: el repo ofrece 24 niveles de cuantizacion, lo que permite medir la degradacion de perplejidad y calidad entre IQ1_S y Q6_K sobre el mismo modelo.
- Servidores de inferencia autoalojados: al ser compatible con endpoints, puede integrarse en un backend tipo llama.cpp server u Ollama para aplicaciones internas en ingles.
- Pruebas de robustez y red teaming: sirve como sujeto de prueba para medir la eficacia de filtros de seguridad externos cuando el modelo interno carece de ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: desde ~7,3 GB (i1-IQ1_S) hasta ~25,3 GB (i1-Q6_K); la opcion equilibrada i1-Q4_K_M ocupa ~18,8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para las cuantizaciones altas y contexto largo; RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K con contexto moderado; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones hasta Q6_K; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) caben IQ3_M, IQ4_XS y Q4_K_S; en 12 GB solo las cuantizaciones IQ2/IQ3 bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con endpoints; el formato es GGUF, no safetensors para esta variante.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF | Variante abliterated cuantizada con imatrix |
| richardyoung/gemma-4-31B-it-ARA-heretic | ~30,7B | no disponible | no disponible | safetensors | Modelo base sin cuantizar del que deriva |
| mradermacher/gemma-4-31B-it-ARA-heretic-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base |
| Gemma 4 31B it (original) | ~31B | no disponible | licencia Gemma 4 | safetensors | Version no abliterated, con rechazos intactos |

## Limitaciones y advertencias

- La abliteracion elimina parte de los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o ilegal; no es apta para aplicaciones de cara al publico sin filtros externos.
- Riesgo de alucinacion inherente a un modelo de ~31B; no hay benchmarks publicados que cuantifiquen su fiabilidad.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y puede degradarse.
- La licencia declarada es Apache 2.0, pero la model card enlaza a la licencia de Gemma 4; verificar la compatibilidad antes de uso comercial, especialmente por la clausula de uso aceptable de Google.
- Las cuantizaciones IQ1 e IQ2 (7-11 GB) degradan notablemente la calidad; el propio autor las marca como "for the desperate" o "very low quality".
- El repo ocupa 334,8 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.
- No hay informacion sobre contexto maximo, tool calling ni capacidades multimodales; no asumir que las hereda del Gemma 4 original sin verificacion.
- Al ser un modelo derivado y no oficial, no cuenta con soporte de Google ni garantias de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-31B-it-ARA-heretic-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
