# mradermacher/Oni_Mitsubishi_12B_Vision-GGUF

## Resumen

Oni_Mitsubishi_12B_Vision es un modelo multimodal de tipo conversacional desarrollado por Sicarius-Prototyping, distribuido en formato GGUF por mradermacher. Se trata de un modelo de aproximadamente 11.770 millones de parametros (11,77 B) construido sobre la arquitectura Gemma, segun se desprende de la licencia `gemma` que acompania al repositorio. El modelo combina capacidades de texto e imagen, ya que el repositorio incluye ficheros `mmproj` (proyeccion multimodal) necesarios para procesar entradas visuales.

La relevancia de esta ficha radica en que se trata de una cuantizacion estatica del modelo original, publicada para facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles con GGUF. El autor de las cuantizaciones, mradermacher, es un colaborador habitual de la comunidad que publica versiones cuantizadas de modelos abiertos, y en este caso ofrece un rango completo de cuantizaciones desde Q2_K hasta Q8_0, ademas de las proyecciones multimodales en Q8_0 y f16.

No obstante, la informacion publica disponible es muy limitada: la model card del repositorio GGUF es una plantilla generica de cuantizacion y no incluye detalles sobre el entrenamiento, los datos utilizados, la longitud de contexto ni resultados de benchmarks. La model card del modelo base no se ha proporcionado en la informacion disponible, por lo que muchos parametros tecnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Gemma, segun licencia); detalles no disponibles |
| Parametros totales | 11.765.792.256 (11,77 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se trata de un transformer multimodal con proyeccion visual (ficheros `mmproj`), y de que la licencia `gemma` sugiere que deriva de la familia Gemma de Google. El numero de parametros (11,77 B) es coherente con un modelo de la escala de Gemma 12B, aunque no se confirma oficialmente la arquitectura exacta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. El repositorio de cuantizacion es una plantilla estandar de mradermacher y no aporta datos sobre el proceso de entrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles.
- Procesamiento de imagenes mediante proyeccion multimodal (`mmproj`), lo que permite entrada de vision junto con texto.
- Conversacion multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo puede desplegarse con llama.cpp u Ollama en hardware de consumo y mantener conversaciones que combinen texto e imagenes, util para prototipos de asistentes personales sin dependencia de la nube.
- Descripcion y analisis de imagenes: gracias a la proyeccion multimodal, puede emplearse para generar descripciones de fotografias, extraer texto de imagenes o responder preguntas sobre contenido visual en aplicaciones de accesibilidad.
- Prototipado rapido de aplicaciones de vision-lenguaje: al estar disponible en GGUF con cuantizaciones ligeras (Q4_K_S de 7,0 GB), permite a desarrolladores validar pipelines de VLM en estaciones de trabajo sin GPU de datacenter.
- Educacion y demostraciones tecnicas: su tamano moderado y su licencia Gemma lo hacen adecuado para talleres y cursos donde se ensena a desplegar modelos multimodales con llama.cpp.
- Investigacion academica sobre cuantizacion: el rango completo de cuantizaciones (de Q2_K a Q8_0) permite estudiar el impacto de la compresion en la calidad de un VLM de 12B, comparando salidas entre niveles.
- Clasificacion y moderacion de contenido visual: puede integrarse en pipelines que requieran etiquetar imagenes o detectar contenido inapropiado, siempre que se valide su comportamiento en el dominio concreto.
- Chatbot de soporte tecnico con capturas de pantalla: el modelo puede recibir capturas de pantalla de errores y ayudar a diagnosticar problemas, aunque su limitacion al ingles restringe su uso en castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar contexto ni cache KV):
  - Q2_K: ~4,9 GB
  - Q3_K_S: ~5,6 GB
  - Q4_K_S: ~7,0 GB
  - Q4_K_M: ~7,4 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,8 GB
  - Q8_0: ~12,6 GB
  - Proyeccion multimodal adicional: 0,7 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, las cuantizaciones Q4 caben en GPUs consumer con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); Q8_0 requiere al menos 16 GB (RTX 4080, RTX 4090, A100).
- Cabe en GPU consumer: si, en cuantizaciones Q4 y Q5 en GPUs de 8-12 GB; Q8_0 en GPUs de 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). Para el modelo base en transformers, vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Oni_Mitsubishi_12B_Vision (este) | 11,77 B | no disponible | si (mmproj) | gemma | GGUF |
| Gemma 3 12B (referencia de familia) | ~12 B | no disponible en esta ficha | si (en variantes multimodales) | gemma | safetensors, GGUF |
| Modelos VLM de ~12B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas. La comparacion se limita a parametros y licencia.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles (`language: en`), por lo que su rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Gemma, puede heredar sesgos presentes en los datos de entrenamiento de esa familia.
- Alucinacion: no hay informacion sobre tasas de alucinacion ni sobre fases de alineacion que las mitiguen.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google, que impone restricciones y obligaciones especificas (incluida la aceptacion de terminos y politicas de uso aceptable). Es imprescindible revisarla antes de un despliegue en produccion.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Madurez: el repositorio tiene muy pocas descargas (57) y cero likes, y la model card del modelo base no esta disponible en la informacion proporcionada; se recomienda validar el comportamiento antes de usarlo en produccion.
- Cuantizaciones de baja calidad: Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio rapido y Q6_K/Q8_0 para maxima calidad.
- Sin benchmarks: la ausencia de resultados publicados impide comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Oni_Mitsubishi_12B_Vision-GGUF
- Modelo base: https://huggingface.co/Sicarius-Prototyping/Oni_Mitsubishi_12B_Vision
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/Oni_Mitsubishi_12B_Vision-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Oni_Mitsubishi_12B_Vision-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
