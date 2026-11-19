# mradermacher/Baligh-1.7B-GGUF

## Resumen

Baligh-1.7B-GGUF es la distribucion en formato GGUF del modelo Baligh-1.7B, publicado por el usuario mradermacher en Hugging Face. Se trata de una conversion estatica del modelo original alojado en el repositorio Kandil7/Baligh-1.7B, orientada a su uso con motores de inferencia compatibles con GGUF como llama.cpp u Ollama. El modelo base tiene 1.700 millones de parametros, lo que lo situa en la categoria de modelos pequenos aptos para hardware de consumo.

La relevancia de esta ficha radica en que el repositorio unicamente contiene los pesos cuantizados: la model card no aporta informacion sobre arquitectura, datos de entrenamiento, licencia, idiomas ni capacidades del modelo original. Toda la documentacion tecnica sustantiva debe consultarse en el repositorio de origen (Kandil7/Baligh-1.7B), que no forma parte de la informacion proporcionada.

Por tanto, esta ficha describe con rigor lo que se puede verificar (el conjunto de cuantizaciones disponibles y el origen de la conversion) y marca explicitamente como "no disponible" todo aquello que la model card no documenta, evitando cualquier inferencia no respaldada por los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1,7 mil millones (1.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original se distribuye presumiblemente en safetensors, dato no confirmado |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. La model card del repositorio GGUF no incluye detalles sobre el tipo de transformer, mecanismos de atencion, composicion del dataset de entrenamiento, numero de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico dato tecnico verificable es el proceso de conversion: los metadatos indican `convert_type: hf`, `quantize_version: 2` y `output_tensor_quantised: 1`, lo que confirma que la conversion se realizo a partir de pesos en formato Hugging Face mediante una herramienta de cuantizacion compatible con GGUF.

El conjunto de cuantizaciones publicado cubre un rango amplio, desde x-f16 (practicamente sin perdida) hasta Q2_K (fuertemente comprimido), pasando por variantes K-quant e IQ4_XS. Esta variedad permite desplegar el modelo en entornos con restricciones de memoria muy distintas, aunque no se documenta el impacto de cada cuantizacion en la calidad de salida.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de lenguaje de 1.7B, aunque no confirmada por la documentacion.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se especifican idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local en CPU y GPU: confirmada por el formato GGUF y la disponibilidad de cuantizaciones de baja precision.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M y Q4_K_S permiten ejecutar el modelo en GPUs con 4-6 GB de VRAM o en CPU, lo que facilita prototipado local sin infraestructura dedicada.
- Inferencia en el borde (edge): la variante Q2_K reduce el peso del modelo a aproximadamente 1 GB, adecuada para dispositivos con memoria limitada donde la latencia no sea critica.
- Experimentacion con llama.cpp: al ser un GGUF estatico, se integra directamente en flujos de trabajo de llama.cpp, lo que permite comparar el rendimiento de distintas cuantizaciones sobre la misma tarea.
- Uso con Ollama: el formato es compatible con la importacion en Ollama mediante un Modelfile, lo que simplifica la prueba del modelo en entornos de desarrollo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece hasta doce variantes, lo que permite medir la degradacion de calidad frente al tamanio en tareas concretas.
- Fine-tuning posterior sobre pesos cuantizados: no recomendado en general para GGUF; para ajuste fino conviene partir del modelo original en safetensors (no incluido en este repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - x-f16: en torno a 3,4 GB solo de pesos.
  - Q8_0: en torno a 1,8 GB.
  - Q6_K: en torno a 1,4 GB.
  - Q5_K_M / Q5_K_S: en torno a 1,2 GB.
  - Q4_K_M / Q4_K_S: en torno a 1,1 GB.
  - IQ4_XS: en torno a 1,0 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: entre 0,9 y 1,0 GB.
  - Q2_K: en torno a 0,7-0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4 o inferiores; una RTX 3060, RTX 4060 o superior permite cargar el modelo completo en VRAM con contexto amplio. Para x-f16 se recomienda al menos 4-6 GB de VRAM.
- Cabe en GPU de consumo: si, practicamente en todas las GPU modernas con 4 GB o mas, e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo original en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. A modo orientativo, los modelos de 1-2B parametros en formato GGUF suelen compararse con Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B, pero no se puede afirmar que Baligh-1.7B sea equiparable a ninguno de ellos sin datos verificables.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| Baligh-1.7B | 1,7B | no disponible | no disponible | si |
| Alternativas de 1-2B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinacion: no cuantificado; en modelos de 1.7B es habitual que aparezca en tareas de razonamiento complejo, pero no hay datos especificos.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la ventana de contexto ni los idiomas entrenados.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar el repositorio original Kandil7/Baligh-1.7B antes de cualquier despliegue en produccion.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda validar con tareas representativas antes de usarlas.
- El repositorio no incluye el modelo original en safetensors; para fine-tuning o para servir con vLLM/TGI hay que acudir al repositorio de origen.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Baligh-1.7B-GGUF
- Modelo original: https://huggingface.co/Kandil7/Baligh-1.7B
- Perfil del autor de la conversion: https://huggingface.co/mradermacher
