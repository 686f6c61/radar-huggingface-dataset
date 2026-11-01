# mrysh/gemma-4-12b-it-nvfp4

## Resumen

`mrysh/gemma-4-12b-it-nvfp4` es una cuantizacion en formato NVFP4 del modelo `google/gemma-4-12B-it`, publicada por el usuario mrysh como parte de un benchmark de cuantizacion (4 modelos x 8 tecnicas, evaluados con vLLM sobre BFCL, Energy-QA, sesgo de contratacion y MedQA). No es un modelo entrenado desde cero, sino una conversion de pesos del modelo instructivo de Google a 4 bits en coma flotante con grupo de tamano 16, generada con `nvidia-modelopt` 0.47.0 y un conjunto de calibracion de 512 muestras mixtas.

El objetivo es reducir el espacio en disco y los requisitos de memoria del modelo base (el repo ocupa 8,283 GB frente a los pesos en BF16 del original) manteniendo la calidad lo mas cerca posible del modelo sin cuantizar. La arquitectura subyacente es la del modelo Gemma 4 de 12B en su variante instructiva, con las partes de vision y audio conservadas en 16 bits, aunque la evaluacion publicada se hizo exclusivamente como modelo de texto.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion para benchmarking de tecnicas de cuantizacion, con solo 15 descargas y sin pipeline declarado. Su interes practico depende de disponer de GPU Blackwell, ya que la ganancia de velocidad de NVFP4 no se materializa en generaciones anteriores. La licencia declarada es Apache 2.0, la misma que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, variante instructiva); pesos cuantizados en NVFP4 |
| Parametros totales | 6.509.756.464 (segun safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, coma flotante, group size 16); vision y audio en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,3 GB; 8,283 GB en disco) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer instructivo de la familia Gemma 4. Esta publicacion no entrena nada: aplica cuantizacion post-entrenamiento con NVIDIA ModelOpt 0.47.0 en formato NVFP4, que representa los pesos en coma flotante de 4 bits con bloques de 16 elementos y una escala compartida por bloque. Segun la model card, se usaron 512 muestras de calibracion mixtas para determinar los rangos de cuantizacion, y las torres de vision y audio se mantuvieron en 16 bits para preservar su comportamiento.

No se detalla en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion especulativa o atencion lineal especificas de esta conversion. La unica innovacion tecnica reseñable es el propio esquema NVFP4, orientado a acelerar la inferencia en hardware Blackwell mediante instrucciones nativas de 4 bits.

## Capacidades

- Generacion de texto y razonamiento en modo instructivo, heredadas del modelo base Gemma 4 12B IT.
- Capacidades multimodales de vision y audio conservadas en 16 bits, segun la model card, aunque la evaluacion publicada se limita a texto.
- Soporte de tool calling y function calling: el benchmark declarado incluye BFCL (Berkeley Function Calling Leaderboard), lo que indica que el modelo se evaluo en llamadas a funciones.
- Razonamiento multi-paso y uso como agente: no hay datos especificos en la informacion disponible sobre el rendimiento en tareas agenticas mas alla de BFCL.
- Capacidades multilingues: no disponibles; la model card no enumera idiomas.
- Modo "thinking": la evaluacion se realizo con thinking desactivado, pero no se documenta si el modelo soporta explicitamente un modo de razonamiento extendido.

## Casos de uso

- Evaluacion comparativa de tecnicas de cuantizacion: el proposito declarado del repo es servir como una de las 32 combinaciones (4 modelos x 8 tecnicas) del benchmark del autor, permitiendo comparar NVFP4 frente a otras tecnicas sobre BFCL, Energy-QA, MedQA y sesgo de contratacion.
- Despliegue de bajo coste en GPU Blackwell: con 8,283 GB en disco y pesos de 4 bits, el modelo permite servir una variante de 12B en GPUs Blackwell con menos memoria que la version BF16, usando `vllm serve <repo>`.
- Clasificacion y respuesta sobre dominios cientificos: el uso de MedQA en la evaluacion sugiere su aplicacion en preguntas de dominio medico, siempre con supervision humana y asumiendo el riesgo de alucinacion.
- Auditoria de sesgo en seleccion de personal: el benchmark incluye hiring-bias, de modo que el modelo puede emplearse para medir sesgos en tareas de evaluacion de candidatos antes de desplegar sistemas de RR. HH.
- Preguntas y respuestas sobre eficiencia energetica: el conjunto Energy-QA del benchmark apunta a un uso en consultas tecnicas sobre consumo y sostenibilidad.
- Integracion en pipelines de function calling: al haberse evaluado en BFCL, es adecuado para prototipos de agentes que invocan herramientas mediante JSON estructurado.
- Investigacion sobre cuantizacion multimodal: al mantener vision y audio en 16 bits, permite estudiar el impacto de cuantizar solo el tronco de texto en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo forma parte de un benchmark con vLLM sobre BFCL, Energy-QA, hiring-bias y MedQA, pero no incluye las puntuaciones obtenidas ni la comparacion con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 8,283 GB, por lo que se necesita al menos esa cantidad mas el overhead de KV cache y activaciones; una estimacion conservadora situa el minimo en torno a 10-12 GB para contextos cortos, aunque no se dispone de mediciones publicadas.
- GPU recomendadas: NVIDIA Blackwell (RTX PRO 6000, B200) segun la model card, ya que la aceleracion de NVFP4 requiere instrucciones nativas de esa generacion.
- Compatibilidad con GPU consumer: cabe en GPUs con 16 GB o mas de VRAM, pero sin las ventajas de velocidad de NVFP4 en arquitecturas anteriores a Blackwell.
- Opciones de despliegue: vLLM (`vllm serve <repo>`), que es el unico runtime mencionado en la model card. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo afirma que la ganancia de velocidad requiere GPU Blackwell, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrysh/gemma-4-12b-it-nvfp4 | 6.509.756.464 (safetensors) | no disponible | NVFP4, group size 16 | Apache 2.0 | HuggingFace, 15 descargas |
| google/gemma-4-12B-it | no disponible | no disponible | BF16 (original) | Apache 2.0 | HuggingFace (modelo base) |
| Otras variantes del benchmark | no disponible | no disponible | otras 7 tecnicas | no disponible | no disponible |

No se dispone de informacion sobre el resto de variantes cuantizadas del benchmark ni sobre modelos alternativos de tamano comparable, por lo que la comparativa se limita al modelo base y a esta conversion.

## Limitaciones y advertencias

- Modelo de nicho: 15 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; no hay garantia de mantenimiento ni de soporte por parte del autor.
- Evaluacion incompleta: la model card no publica puntuaciones de BFCL, Energy-QA, hiring-bias ni MedQA, solo menciona que se ejecutaron.
- Rendimiento dependiente del hardware: la ventaja de NVFP4 en velocidad solo se materializa en GPUs Blackwell; en otras arquitecturas el modelo puede ser mas lento que una cuantizacion INT4 o incluso que BF16.
- Riesgo de degradacion por cuantizacion: al ser una conversion post-entrenamiento a 4 bits, puede perder precision en tareas de razonamiento o generacion de codigo respecto al modelo base, sin que se hayan publicado mediciones que lo cuantifiquen.
- Riesgo de alucinacion: inherente al modelo base Gemma 4 12B IT; no se documentan mitigaciones adicionales.
- Sesgos: el propio benchmark incluye una prueba de sesgo de contratacion, lo que sugiere que el autor considera relevante auditar este aspecto; no se publican resultados.
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano.
- Licencia: Apache 2.0 segun la model card, pero se remite a la del modelo base; conviene verificar los terminos de Google Gemma antes de un uso comercial.
- Formato: solo safetensors y runtime vLLM; no hay versiones GGUF para despliegue en CPU o en GPUs sin soporte de FP4.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrysh/gemma-4-12b-it-nvfp4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Libreria de cuantizacion: nvidia-modelopt 0.47.0 (no se proporciona enlace directo en la informacion disponible)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a esta publicacion.
