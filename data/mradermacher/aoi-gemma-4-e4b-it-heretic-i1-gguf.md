# mradermacher/aoi-gemma-4-E4B-it-heretic-i1-GGUF

## Resumen

`mradermacher/aoi-gemma-4-E4B-it-heretic-i1-GGUF` es una cuantizacion en formato GGUF del modelo `CloudGoat/aoi-gemma-4-E4B-it-heretic`, publicada por el usuario mradermacher, especializado en generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base es un fine-tuning de la familia Gemma (variante E4B, presumiblemente una variante eficiente de 4B) con un ajuste de tipo "heretic", que en la practica suele implicar la eliminacion o reduccion de comportamientos de rechazo y alineacion excesiva.

El repositorio contiene unicamente pesos cuantizados en GGUF, generados con el metodo de cuantizacion por imatrix (importancia matricial), lo que produce cuantizaciones de mayor calidad que las cuantizaciones estandar para un mismo tamano. El dato de parametros totales reportado en safetensors es de 7.518.069.290, lo que no concuerda con la denominacion E4B del nombre; esta discrepancia debe tenerse en cuenta al planificar el despliegue.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado (una cuantizacion) de un fine-tuning comunitario de un modelo Gemma, sin model card detallada, sin benchmarks publicados y sin informacion sobre licencia o idiomas en los metadatos de Hugging Face. Es util para quien quiera ejecutar el modelo base en hardware de consumo mediante llama.cpp, pero no aporta informacion tecnica adicional sobre el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma, variante E4B); detalles no disponibles |
| Parametros totales | 7.518.069.290 (segun safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de la familia Gemma, identificado como `aoi-gemma-4-E4B-it-heretic`, desarrollado por el usuario CloudGoat. La denominacion "it" sugiere un ajuste por instrucciones y "heretic" indica un proceso de ablacion de direcciones de rechazo o de desalineacion controlada, una tecnica habitual en la comunidad para reducir las negativas del modelo ante peticiones que considera sensibles. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el fine-tuning.

La cuantizacion la realiza mradermacher con el metodo i1 (imatrix), que calcula una matriz de importancia a partir de un corpus de calibracion para asignar mas bits a los pesos mas sensibles. El resultado son ficheros GGUF optimizados para inferencia en CPU y GPU con llama.cpp. No hay informacion sobre innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, mezcla de expertos) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Ajuste por instrucciones (sufijo "it" en el nombre del modelo base).
- Comportamiento "heretic": reduccion de rechazos ante peticiones que el modelo original rechazaria; no se especifica el alcance ni el metodo exacto.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere uso via API de Hugging Face o servidores compatibles.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, adecuado para prototipado sin coste de API.
- Experimentacion con alineacion y seguridad: el ajuste "heretic" permite estudiar como varia la tasa de rechazo respecto al modelo Gemma original, util en investigacion sobre seguridad de modelos.
- Generacion de texto conversacional en entornos offline: al ser GGUF, puede ejecutarse en portatiles o estaciones sin conexion, con contexto limitado por la RAM disponible.
- Integracion en pipelines de CI/CD para pruebas de regresion de prompts: la version cuantizada permite validar respuestas del modelo base sin depender de infraestructura GPU dedicada.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 23 variantes (desde IQ1_S hasta Q6_K), lo que permite medir la degradacion de calidad segun el nivel de compresion en una misma tarea.
- Fine-tuning posterior o destilacion: los pesos GGUF no son directamente entrenables, pero sirven como referencia de comportamiento para comparar con adaptaciones LoRA del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2-3 GB para IQ1_S/IQ2_XXS, 4-5 GB para Q4_K_M, 6-7 GB para Q6_K (estimacion basada en el tamano del repo de 14,3 GB, que agrupa todas las cuantizaciones).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para las cuantizaciones medias y altas; A100/H100 solo si se necesita throughput elevado con llama.cpp o vLLM (vLLM no soporta GGUF de forma nativa en todas las versiones).
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4 y Q5 con 8 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; servidores compatibles con la API de OpenAI mediante llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| aoi-gemma-4-E4B-it-heretic-i1-GGUF (este) | 7.518.069.290 | no disponible | no disponible | GGUF | Cuantizacion imatrix de un fine-tuning comunitario |
| Gemma 2 9B (Google) | 9B | 8K | Gemma Terms | safetensors, GGUF | Modelo base oficial, con model card completa |
| Gemma 2 2B (Google) | 2B | 8K | Gemma Terms | safetensors, GGUF | Alternativa ligera para hardware limitado |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Referencia abierta con contexto largo |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo evaluado ni de su contexto real, por lo que la eleccion frente a los modelos oficiales debe basarse en pruebas propias.

## Limitaciones y advertencias

- Ausencia de model card detallada: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni evaluaciones.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; el modelo base Gemma tiene terminos propios que probablemente se heredan.
- El ajuste "heretic" reduce los rechazos, lo que aumenta el riesgo de generar contenido inapropiado o danino; no es adecuado para produccion sin filtros adicionales.
- Riesgo de alucinacion no cuantificado; al ser un fine-tuning comunitario sin evaluacion publica, la fiabilidad es incierta.
- Discrepancia entre el nombre (E4B) y el recuento de parametros (7,5B): verificar el tamano real antes de dimensionar el hardware.
- Las cuantizaciones de baja precision (IQ1_S, IQ2_XXS) degradan notablemente la calidad; no recomendadas para tareas de razonamiento.
- Sin informacion sobre contexto maximo: asumir un contexto conservador hasta verificarlo con el modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/aoi-gemma-4-E4B-it-heretic-i1-GGUF
- Modelo base: https://huggingface.co/CloudGoat/aoi-gemma-4-E4B-it-heretic
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
