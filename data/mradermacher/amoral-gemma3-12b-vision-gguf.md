# mradermacher/amoral-gemma3-12B-vision-GGUF

## Resumen

amoral-gemma3-12B-vision-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo gghfez/amoral-gemma3-12B-vision, un fine-tuning del modelo multimodal Gemma 3 de Google con aproximadamente 11.766 millones de parametros. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y esta pensado para facilitar la inferencia local en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base parte de la arquitectura Gemma 3, un transformer decoder-only de Google con capacidad de procesamiento de texto e imagen (vision), disenado para conversacion multi-turno. El fine-tuning "amoral" no viene documentado en la informacion disponible: la model card del repositorio cuantizado no describe el dataset, el proceso de entrenamiento ni las modificaciones concretas respecto al Gemma 3 original. La unica indicacion es el nombre, que sugiere una eliminacion o relajacion de los filtros de alineamiento y rechazo del modelo original.

La relevancia practica de este repositorio es la disponibilidad de pesos cuantizados en multiples niveles (desde Q2_K hasta Q8_0, mas los ficheros mmproj para la torre de vision), lo que permite ejecutar un modelo multimodal de ~12B en GPUs de consumo y en CPU. La licencia es la Gemma de Google, con las restricciones de uso que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), con torre de vision |
| Parametros totales | 11.766.034.176 (~11,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | GGUF (con ficheros mmproj separados para vision) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3, un transformer decoder-only de Google con atencion multi-cabeza estandar y una torre de vision para entrada de imagenes. El repositorio solo contiene las versiones cuantizadas en GGUF; no se detalla en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO en el fine-tuning "amoral". Tampoco se documentan innovaciones tecnicas especificas del fine-tuning.

El proceso de cuantizacion aplicado por mradermacher es estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf), es decir, cuantizacion post-entrenamiento sobre los pesos en formato Hugging Face convertidos a GGUF. Existe ademas un repositorio hermano con cuantizaciones ponderadas/imatrix (sufijo `-i1-GGUF`), que el autor recomienda como alternativa de mayor calidad a igual tamano. Los ficheros `mmproj` (Q8_0 o f16) son necesarios para habilitar la entrada de imagen en llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Gemma 3.
- Procesamiento de imagenes (vision) mediante los ficheros mmproj incluidos en el repositorio.
- Razonamiento y respuesta a instrucciones en ingles, idioma declarado en los metadatos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este fine-tuning concreto.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: los metadatos solo declaran ingles; no se confirma soporte de otros idiomas.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local de un modelo multimodal de ~12B en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (7,4 GB) y Q5_K_M (8,5 GB) permiten cargar el modelo en GPUs de 8-12 GB de VRAM junto con el mmproj, habilitando prototipos de vision-lenguaje sin depender de la nube.
- Procesamiento de documentos escaneados en local: con la torre de vision y los ficheros mmproj, el modelo puede transcribir y describir imagenes o capturas dentro de un pipeline llama.cpp, util para entornos con requisitos de privacidad.
- Asistentes conversacionales sin filtros de rechazo: dado el caracter "amoral" del fine-tuning, encaja en escenarios de investigacion sobre alineamiento, red-teaming y evaluacion de comportamiento de modelos sin capas de rechazo, siempre dentro de los limites de la licencia Gemma.
- Despliegue en CPU o entornos sin GPU: la cuantizacion Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten ejecucion en CPU con llama.cpp, adecuada para pruebas de concepto y entornos de desarrollo con recursos limitados.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once niveles de cuantizacion mas dos variantes de mmproj, lo que facilita medir el impacto de la cuantizacion en calidad y latencia sobre un mismo modelo base.
- Integracion en aplicaciones de escritorio basadas en llama.cpp/Ollama: el formato GGUF es el estandar de estos runners, de modo que el modelo puede empaquetarse en herramientas locales de escritorio con soporte multimodal.
- Fine-tuning posterior o experimentacion academica: al ser un modelo de ~12B con pesos abiertos bajo licencia Gemma, sirve como base para investigacion sobre adaptacion multimodal, siempre que se respeten los terminos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_S: ~5,6 GB
  - Q3_K_M: ~6,1 GB
  - Q3_K_L: ~6,6 GB
  - IQ4_XS: ~6,7 GB
  - Q4_K_S: ~7,0 GB
  - Q4_K_M: ~7,4 GB
  - Q5_K_S: ~8,3 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,8 GB
  - Q8_0: ~12,6 GB
  - mmproj adicional: 0,7 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, las cuantizaciones Q4-Q5 encajan en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.); Q8_0 requiere ~13 GB o mas (RTX 4080/4090, A100, H100).
- Cabe en GPU de consumo: si, en las cuantizaciones Q2 a Q6 segun la VRAM disponible; Q8_0 queda al limite en GPUs de 16 GB y holgado en 24 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; el repositorio declara compatibilidad con `endpoints_compatible` y la libreria `transformers` en los metadatos, aunque el uso previsto es GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| amoral-gemma3-12B-vision-GGUF (este) | ~11,77B | no disponible | si (mmproj) | gemma | GGUF |
| gghfez/amoral-gemma3-12B-vision (base sin cuantizar) | ~11,77B | no disponible | si | gemma | safetensors/HF |
| Gemma 3 12B original (Google) | ~12B | no disponible en esta ficha | si | gemma | safetensors, GGUF (comunitarios) |
| mradermacher/amoral-gemma3-12B-vision-i1-GGUF | ~11,77B | no disponible | si | gemma | GGUF (imatrix) |

La comparacion con alternativas de otros fabricantes (p. ej. Llama 3.2 Vision 11B o Qwen2.5-VL 7B) no se puede completar con datos verificados en la informacion proporcionada; se indica como no disponible.

## Limitaciones y advertencias

- El fine-tuning "amoral" sugiere la eliminacion o relajacion de los mecanismos de rechazo del Gemma 3 original; esto implica un riesgo elevado de generar contenido inapropiado, ofensivo o danino, y no es apto para produccion orientada al publico sin capas de moderacion externas.
- No hay documentacion del dataset de fine-tuning ni de su procedencia; se desconoce el alcance de los sesgos introducidos y la calidad de la alineacion resultante.
- Riesgo de alucinacion: inherente a los modelos de ~12B y agravado por la falta de datos de evaluacion publicados para este fine-tuning.
- Idiomas: los metadatos solo declaran ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea inferior.
- Longitud de contexto: no confirmada en la informacion disponible; conviene verificar la configuracion real antes de usarla en produccion.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion; es imprescindible revisarlos antes de cualquier despliegue.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; el autor recomienda Q4_K_S/Q4_K_M como equilibrio y sugiere las variantes imatrix del repositorio hermano para mayor calidad.
- La torre de vision requiere cargar el fichero mmproj correspondiente; sin el, el modelo funciona solo como texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/amoral-gemma3-12B-vision-GGUF
- Modelo base: https://huggingface.co/gghfez/amoral-gemma3-12B-vision
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/amoral-gemma3-12B-vision-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#amoral-gemma3-12B-vision-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
