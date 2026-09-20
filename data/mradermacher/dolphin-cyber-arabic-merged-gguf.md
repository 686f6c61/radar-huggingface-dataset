# mradermacher/dolphin-cyber-arabic-merged-GGUF

## Resumen

`mradermacher/dolphin-cyber-arabic-merged-GGUF` es una coleccion de cuantizaciones GGUF generadas por el usuario mradermacher a partir del modelo `Koko12345p/dolphin-cyber-arabic-merged`. No se trata por tanto de un modelo entrenado desde cero, sino de una conversion y compresion del modelo original a formatos optimizados para inferencia en CPU/GPU con llama.cpp y derivados. El repositorio incluye 12 variantes de cuantizacion, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), todas ellas cuantizaciones estaticas, sin versiones ponderadas ni con imatrix.

El modelo subyacente tiene 7.615.616.512 parametros (aproximadamente 7,6 mil millones) y esta etiquetado como modelo conversacional de tipo `transformers`. El nombre sugiere un ajuste orientado a contenido "cyber" y a idioma arabe, pero la model card solo declara el idioma `en`, lo que supone una contradiccion que conviene verificar antes de usarlo en produccion. La licencia no aparece declarada en la informacion disponible.

Su relevancia practica es limitada pero concreta: el modelo original no publica cifras de benchmarks ni una model card detallada, de modo que estas cuantizaciones GGUF son la via mas sencilla para ejecutar un modelo de 7,6B en hardware de consumo. Con Q4_K_M (4,8 GB) se puede desplegar en una GPU de 8 GB de VRAM o incluso en CPU con RAM suficiente, lo que reduce la barrera de entrada para pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la informacion proporcionada) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (segun la model card); el nombre del modelo menciona "arabic" |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base esta en safetensors/transformers) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura del modelo base. Dado el numero de parametros (7,6B) y que el modelo original se publica bajo `transformers` con pesos safetensors, lo mas probable es que se trate de un transformer decoder-only de escala 7B, pero esto no esta confirmado en la documentacion disponible. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset, la longitud de contexto nativa ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

Lo unico documentado por mradermacher es el proceso de cuantizacion: se han generado cuantizaciones estaticas (`quantize_version: 2`, `output_tensor_quantised: 1`), sin uso de imatrix ni de calibracion ponderada. El autor indica que las versiones ponderadas "no parecen estar disponibles" y que se pueden solicitar mediante una discusion en la comunidad. El repositorio ocupa 68,1 GB en total, suma coherente con las 12 variantes publicadas.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline de transformers apuntan a uso en dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones: no hay evaluaciones publicadas que lo confirmen, pero es el uso esperado de un modelo de 7,6B afinado sobre una base tipo Dolphin/Cyber.
- Capacidades multilingues: la model card solo declara ingles (`language: en`); el nombre del modelo sugiere soporte de arabe, pero no hay confirmacion documental.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; no hay indicios de capacidades multimodales.
- Inferencia local eficiente: al estar en GGUF, permite ejecucion en CPU y GPU de consumo con llama.cpp y compatibles.

## Casos de uso

- Pruebas de concepto de asistentes conversacionales en local: con la variante Q4_K_M (4,8 GB) se puede levantar un chatbot en una GPU de 8 GB o en CPU con 8-16 GB de RAM, sin depender de APIs externas.
- Experimentacion academica con cuantizacion: el repositorio permite comparar la degradacion de calidad entre Q2_K, Q4_K_M y Q8_0 sobre un mismo modelo, util para estudiar el impacto de la compresion en tareas de generacion.
- Generacion de texto en ingles con restricciones de conectividad: entornos aislados o sin acceso a servicios en la nube pueden ejecutar el modelo en local para redaccion asistida y resumen de documentos.
- Prototipado de pipelines con llama.cpp: integracion en scripts de linea de comandos, notebooks o aplicaciones de escritorio mediante la libreria `llama-cpp-python`, aprovechando el formato GGUF.
- Evaluacion comparativa de modelos de 7B: sirve como punto de referencia adicional en estudios internos que comparen modelos pequenos de la misma escala, dado que no existen resultados publicos previos.
- Despliegue en hardware modesto para demos: la variante Q3_K_S (3,6 GB) permite ejecutar el modelo en portatiles con GPU integrada o en contenedores con poca memoria, a costa de una perdida de calidad apreciable.
- Fine-tuning posterior no aplicable directamente: al ser unicamente pesos GGUF, no es la opcion adecuada para reentrenamiento; para ello habria que partir del modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni la informacion del modelo base incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion (pesos mas overhead de contexto y KV cache):
  - Q2_K (3,1 GB): aproximadamente 4 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L (3,6-4,2 GB): aproximadamente 5-6 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M (4,4-4,8 GB): aproximadamente 6-7 GB.
  - Q5_K_S / Q5_K_M (5,4-5,5 GB): aproximadamente 7-8 GB.
  - Q6_K (6,4 GB): aproximadamente 8-9 GB.
  - Q8_0 (8,2 GB): aproximadamente 10 GB.
  - f16 (15,3 GB): aproximadamente 17-18 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las cuantizaciones altas; A100 o H100 solo si se busca throughput elevado o lotes grandes.
- Cabe en GPU de consumo: si. Q4_K_M entra en GPUs de 8 GB; Q5 y Q6 en GPUs de 8-12 GB; Q8_0 y f16 requieren 10-18 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y, con conversion adicional, vLLM o TGI (estos ultimos no consumen GGUF directamente en todas sus versiones).
- Latencia y throughput: no disponible. No hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos corresponden a sus especificaciones publicas habituales y deberian verificarse en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/dolphin-cyber-arabic-merged-GGUF | 7,6B | no disponible | no disponible | GGUF (12 cuantizaciones) | HuggingFace |
| Mistral-7B (referencia de la misma escala) | 7,3B | 32k | Apache 2.0 | safetensors, GGUF | ampliamente disponible |
| Llama 3.1 8B | 8,03B | 128k | Llama 3.1 Community License | safetensors, GGUF | ampliamente disponible |
| Qwen2.5 7B | 7,6B | 128k | Apache 2.0 | safetensors, GGUF | ampliamente disponible |

La diferencia mas relevante no es el tamano, practicamente identico al de Qwen2.5 7B, sino la ausencia de informacion sobre contexto, licencia, datos de entrenamiento y evaluaciones, ademas de la discrepancia entre el nombre del modelo (que sugiere arabe) y su etiqueta de idioma (ingles).

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial. Es imprescindible contactar con el autor o revisar el repositorio del modelo base antes de cualquier despliegue en produccion.
- Discrepancia de idioma: el nombre del modelo incluye "arabic" pero la model card solo declara `en`. El soporte real de arabe es una incognita y deberia validarse empiricamente.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Riesgo de alucinacion: no hay evaluaciones de fiabilidad publicadas; como cualquier modelo de 7B sin datos de alineacion documentados, puede generar informacion falsa con seguridad aparente.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, raza, religion o geopoliticos.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan notablemente la calidad. Para uso serio conviene partir de Q4_K_M o superior.
- Solo cuantizaciones estaticas: el autor indica que no hay versiones con imatrix, que suelen ofrecer mejor relacion calidad/tamano en precisiones bajas.
- Sin fine-tuning directo: los ficheros GGUF no son adecuados para reentrenamiento; para ello hay que usar el modelo base en safetensors.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y mayor riesgo de errores no detectados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/dolphin-cyber-arabic-merged-GGUF
- Modelo base: https://huggingface.co/Koko12345p/dolphin-cyber-arabic-merged
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#dolphin-cyber-arabic-merged-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
