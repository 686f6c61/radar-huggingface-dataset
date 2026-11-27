# mradermacher/Zaire-12B-v0.1-heretic-i1-GGUF

## Resumen

Zaire-12B-v0.1-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo Zaire-12B-v0.1-heretic, publicada por el usuario mradermacher. El repositorio contiene unicamente los pesos cuantizados generados con el sistema de cuantizacion de llama.cpp, empleando tecnicas de imatrix y weighted quants, y no incluye el modelo original ni documentacion tecnica adicional. La model card se limita a referenciar el modelo base alojado en sh0ck0r/Zaire-12B-v0.1-heretic.

El nombre del modelo sugiere un tamano nominal de 12B parametros y una variante "heretic", termino que en la comunidad se asocia a ajustes que eliminan o reducen los mecanismos de rechazo alineados. Sin embargo, el dato de parametros totales reportado por Hugging Face a partir de los safetensors es de 3.719.336, cifra que no concuerda con la denominacion de 12B y que debe interpretarse con cautela, ya que el repositorio no contiene informacion que permita verificar la arquitectura real.

La relevancia de esta publicacion es limitada y practica: ofrece variantes cuantizadas de un modelo concreto para su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles. No se dispone de informacion sobre licencia, idiomas, contexto ni rendimiento, por lo que cualquier evaluacion tecnica queda condicionada a la documentacion del modelo base, que no se ha proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.719.336 (segun safetensors del repo); el nombre indica 12B, dato no verificado |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. El repositorio unicamente documenta el proceso de cuantizacion: se han generado cuantizaciones GGUF con version de cuantizacion 2, tensor de salida cuantizado, conversion de tipo hf y sin vocabulario especificado. Se indica el uso de weighted quants e imatrix, tecnicas que mejoran la calidad de las cuantizaciones de baja precision ponderando la importancia de los tensores y usando una matriz de importancia calculada a partir de datos de calibracion.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones arquitectonicas como decodificacion especulativa o atencion lineal. Toda esta informacion deberia consultarse en la model card del modelo base, que no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto: no se puede confirmar ninguna capacidad especifica sin documentacion del modelo base.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- El sufijo "heretic" sugiere una reduccion de los rechazos alineados, pero no se documenta el alcance ni el metodo.

## Casos de uso

- Inferencia local en hardware de consumo: las variantes Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPU con 8-16 GB de VRAM mediante llama.cpp u Ollama, siempre que el tamano real del modelo coincida con lo esperado para 12B.
- Despliegue en entornos con memoria limitada: las cuantizaciones IQ2 e IQ3 reducen el peso del modelo a costa de calidad, utiles para pruebas en equipos con 6-8 GB de VRAM.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece mas de veinte variantes, lo que permite medir el impacto de la cuantizacion en la calidad de salida para un mismo modelo.
- Prototipado de aplicaciones de texto: si el modelo base funciona correctamente, puede emplearse para generar texto en entornos de desarrollo sin depender de APIs externas.
- Investigacion sobre alineacion y rechazos: la variante "heretic" puede interesar a quienes estudian el comportamiento de rechazo en modelos ajustados, aunque no se documenta el metodo.
- Integracion en pipelines con llama.cpp: el formato GGUF permite su uso en servidores compatibles con la libreria, incluyendo bindings de Python y servidores HTTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Si el modelo tuviera realmente 12B parametros, las cuantizaciones Q4_K_M requeririan aproximadamente 7-8 GB de VRAM y las Q8 alrededor de 13 GB; las variantes IQ2 e IQ3 quedarian en 4-6 GB. Estas cifras son estimaciones basadas en el tamano nominal y no en datos verificados.
- GPU recomendadas: no disponible. Para un modelo de 12B en Q4, una RTX 3060 de 12 GB o superior seria suficiente; para Q8, una RTX 4090 o A100.
- Cabe en GPU de consumo: probablemente si, en funcion del tamano real y de la cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). No se confirma compatibilidad con vLLM o TGI, que habitualmente requieren safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion suficiente sobre el modelo base ni sobre alternativas comparables en la misma categoria para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La cifra de parametros reportada por safetensors (3.719.336) no concuerda con el nombre del modelo (12B); es necesario verificar el modelo base antes de asumir capacidades o requisitos de hardware.
- No se especifica la licencia, lo que impide determinar si el uso comercial esta permitido.
- No hay informacion sobre sesgos, alineacion o comportamiento en produccion.
- El sufijo "heretic" indica una posible reduccion de rechazos, lo que puede aumentar el riesgo de generar contenido inapropiado o no seguro; debe evaluarse antes de cualquier despliegue publico.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni documentacion, no puede descartarse.
- Las cuantizaciones de baja precision (IQ1, IQ2) degradan la calidad de forma notable y no se recomiendan para produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se dispone de informacion sobre el contexto maximo, los idiomas soportados ni el formato de plantilla de chat.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Zaire-12B-v0.1-heretic-i1-GGUF
- Modelo base referenciado: https://huggingface.co/sh0ck0r/Zaire-12B-v0.1-heretic
