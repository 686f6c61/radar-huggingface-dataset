# mradermacher/Ishigaki-AEC-9B-i1-GGUF

## Resumen

Ishigaki-AEC-9B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base ONESTRUCTION/Ishigaki-AEC-9B, un modelo conversacional de aproximadamente 9.197 millones de parametros. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local en CPU/GPU de consumo, con cuantizaciones calculadas mediante el metodo imatrix (weighted quantization), que ajusta los errores de cuantizacion segun la importancia estadistica de cada tensor.

El repositorio incluye 25 variantes de cuantizacion que abarcan desde IQ1_S (el extremo de compresion agresiva) hasta Q6_K, pasando por familias K-quant (Q2_K, Q3_K, Q4_K, Q5_K), I-quant (IQ1, IQ2, IQ3, IQ4) y las cuantizaciones clasicas Q4_0 y Q4_1. Esta amplitud permite desplegar el modelo en un espectro muy amplio de hardware, desde equipos con 4 GB de VRAM hasta estaciones con GPU dedicada.

La relevancia de esta ficha es limitada pero concreta: el modelo base no documenta arquitectura, licencia, idiomas ni regimen de entrenamiento en la informacion disponible, y el repositorio de cuantizaciones no aporta benchmarks. Es decir, se trata de un artefacto de despliegue util unicamente si el usuario ya conoce y ha validado el modelo base; de lo contrario, la ausencia de informacion sobre licencia y procedencia del entrenamiento supone un riesgo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en el repositorio ni en la model card) |
| Parametros totales | 9.197.093.888 (9,2 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (25 variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones calculadas con imatrix/weighted quantization) |
| Modelo base | ONESTRUCTION/Ishigaki-AEC-9B |
| Tamano declarado del repositorio | 3,9 GB (inconsistente con las 25 cuantizaciones listadas, ver limitaciones) |
| Fecha de creacion | 27 de septiembre de 2026 |
| Ultima actualizacion | 27 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en los materiales proporcionados. El recuento de parametros (9,2 mil millones) y la etiqueta `conversational` son los unicos indicios, compatibles con un transformer decoder-only de escala 9B, pero esto no puede confirmarse con los datos disponibles. Tampoco se documenta el numero de capas, la dimension del modelo, el numero de cabezas de atencion, si emplea GQA/MQA, ni la presencia de componentes alternativos (SSM, hybrid, MoE).

Respecto al entrenamiento, no hay ninguna informacion sobre volumen de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO, ORPO) ni procesos de destilacion. La unica innovacion tecnica documentada es la del propio repositorio de cuantizacion: el uso de imatrix, que requiere un corpus de calibracion para ponderar la importancia de cada tensor antes de cuantizar, mejorando la fidelidad respecto a cuantizaciones uniformes a igual numero de bits. Los metadatos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversion se hizo desde pesos HuggingFace originales.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo base esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse a traves de APIs compatibles con el estandar de HuggingFace.
- Capacidades adicionales (razonamiento, codigo, matematicas, tool calling, agentes, vision, audio, thinking mode): no disponibles. No hay ninguna documentacion al respecto en la informacion proporcionada.
- Capacidades multilingues: no disponibles. No se declara ningun idioma en los metadatos.
- Soporte de function calling / agentes: no disponible.

## Casos de uso

Dado que no se dispone de benchmarks ni de documentacion de capacidades, los casos de uso que se enumeran a continuacion son escenarios de despliegue plausibles para cualquier modelo conversacional de 9B en GGUF, no afirmaciones verificadas sobre este modelo concreto:

- Inferencia local en portatil sin GPU: la cuantizacion IQ1_S o IQ2_XXS permite ejecutar los 9,2B parametros en CPU con 2-3 GB de RAM, habilitando asistentes conversacionales offline en equipos modestos.
- Despliegue en GPU de consumo: la variante Q4_K_M o Q5_K_M encaja en tarjetas con 8-12 GB de VRAM (RTX 3060 12GB, RTX 4060 Ti 16GB), lo que permite servir un chatbot conversacional con latencia interactiva.
- Prototipado rapido de aplicaciones de chat: el tag `endpoints_compatible` facilita integrar el modelo en frameworks que esperan una API compatible con HuggingFace, reduciendo el trabajo de integracion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 25 variantes del mismo modelo, lo que lo convierte en un banco de pruebas util para medir el impacto de la cuantizacion (de IQ1_S a Q6_K) sobre la calidad de las respuestas.
- Fine-tuning sobre el modelo base: si el modelo base resulta adecuado, las cuantizaciones GGUF sirven como referencia de despliegue tras un ajuste previo en precision completa sobre ONESTRUCTION/Ishigaki-AEC-9B.
- Investigacion sobre cuantizacion imatrix: el repositorio permite reproducir comparaciones entre cuantizaciones ponderadas por imatrix y cuantizaciones uniformes de la misma familia (por ejemplo, Q4_0 y Q4_1 frente a Q4_K_M).
- Uso educativo o de demostracion: para entornos donde no se requiere licencia comercial explicita, las cuantizaciones de bajo bit permiten demostrar tecnicas de compresion de modelos en aulas o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica de evaluacion, ni tampoco datos de perplejidad comparando las distintas cuantizaciones con el modelo original en precision completa.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del numero de parametros (9,2B) y del numero de bits por peso de cada cuantizacion. No proceden de mediciones publicadas por el autor.

- VRAM/RAM estimada para los pesos (sin cache de contexto):
  - IQ1_S: ~1,8 GB
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~2,3-3,0 GB
  - Q2_K / Q2_K_S: ~3,0-3,2 GB
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: ~3,5-4,8 GB
  - small-IQ4_NL / IQ4_XS / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: ~4,9-5,8 GB
  - Q5_K_S / Q5_K_M: ~6,4-6,8 GB
  - Q6_K: ~7,6 GB
- Cache KV: no calculable sin conocer el numero de capas, cabezas y si usa GQA. Como referencia, un modelo denso de 9B con contexto de 8.192 tokens suele anadir entre 0,5 y 2 GB, cifra que crece linealmente con la longitud de contexto.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070/4080, RTX 4090, A10G, L4 o A100/H100 para despliegues concurrentes. Cualquier GPU con 8 GB o mas puede ejecutar las variantes Q4 y Q5 con contexto moderado.
- Cabida en GPU de consumo: si. Desde ~4 GB (IQ2_XXS) hasta ~10 GB (Q6_K con contexto), por lo que practicamente cualquier GPU moderna de gama media o superior es suficiente. Las cuantizaciones IQ1/IQ2 permiten incluso ejecucion en CPU pura o en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui (backend llama.cpp), llama-cpp-python y servidores compatibles con la API de llama.cpp. vLLM tiene soporte limitado y experimental para GGUF; para maxima compatibilidad conviene usar la pila llama.cpp.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo denso de 9B en Q4_K_M sobre una RTX 4090 suele rendir en el rango de decenas de tokens por segundo, y sobre CPU moderna en el rango de pocos tokens por segundo, pero no hay mediciones de este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos del modelo base (arquitectura, contexto, licencia, entrenamiento) que permitan una comparacion tecnica rigurosa. La tabla siguiente situa el artefacto en su categoria por tamano de parametros, marcando las columnas desconocidas como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Benchmarks publicos |
|---|---|---|---|---|---|
| Ishigaki-AEC-9B (este repo, cuantizado) | 9,2B | no disponible | no disponible | Si (25 quants) | No disponible |
| Gemma 2 9B | 9,24B | 8.192 tokens | Gemma Terms of Use | Si (comunidad) | Si (MMLU, GSM8K, etc.) |
| Llama 3.1 8B | 8,03B | 128.000 tokens | Llama 3.1 Community License | Si (comunidad) | Si (MMLU, HumanEval, etc.) |
| Qwen2.5 7B | 7,62B | 128.000 tokens | Apache 2.0 | Si (comunidad) | Si (MMLU, GSM8K, etc.) |
| Mistral-Nemo-Base 2407 | 12,2B | 128.000 tokens | Apache 2.0 | Si (comunidad) | Si (parcial) |

La comparacion se limita al plano de despliegue: los cuatro modelos de referencia tienen licencia explicita, contexto documentado y evaluaciones publicas, condiciones que este repositorio no cumple con la informacion disponible.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada, no puede asumirse permiso para uso comercial. Cualquier despliegue en produccion deberia resolverse consultando al autor del modelo base (ONESTRUCTION) antes de continuar.
- Procedencia opaca: no se documenta arquitectura, dataset de entrenamiento, tecnicas de alineacion ni idiomas. Esto impide auditar sesgos, evaluar riesgos de alucinacion o estimar el rendimiento esperado.
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita comparar el modelo base ni las cuantizaciones entre si. La eleccion de una cuantizacion concreta es, por tanto, a ciegas.
- Degradacion por cuantizacion: las variantes por debajo de Q3_K (especialmente IQ1_S, IQ1_M y las familias IQ2_XXS/IQ2_XS) son propensas a perdida de coherencia, repeticiones y errores factuales en modelos de 9B. No se han publicado mediciones de perplejidad que cuantifiquen ese deterioro.
- Inconsistencia en el tamano del repositorio: se declaran 3,9 GB para un repositorio que lista 25 cuantizaciones de un modelo de 9,2B. Un conjunto completo de esas caracteristicas superaria holgadamente los 80-100 GB. Es posible que el tamano declarado corresponda solo a un subconjunto de ficheros o este desactualizado; conviene verificar los archivos realmente disponibles antes de planificar la descarga.
- Sin historial de uso: cero descargas y cero likes en la fecha de consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Idioma: al no declararse idiomas soportados, no hay garantia de un rendimiento aceptable en castellano. Es recomendable evaluar el modelo en la lengua objetivo antes de integrarlo.
- Fecha de creacion atipica: los metadatos indican septiembre de 2026, posterior a la fecha habitual de publicacion. Puede tratarse de un error del repositorio o de un artefacto de pruebas; conviene contrastar con el autor.
- Riesgo de seguridad: los repositorios de cuantizaciones de terceros no incluyen auditoria del contenido. Verificar hashes SHA-256 cuando esten publicados y desconfiar de ficheros sin firma.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/Ishigaki-AEC-9B-i1-GGUF
- Modelo base: https://huggingface.co/ONESTRUCTION/Ishigaki-AEC-9B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Repositorio GGUF de referencia del mismo autor (para comparar el patron de publicacion): https://huggingface.co/mradermacher/B1-9B-i1-GGUF
- Paper, blog o demo oficial: no disponible.
