# mradermacher/Gemma4_E2B_Abliterated_Baked_HF_Ready-GGUF

## Resumen

`mradermacher/Gemma4_E2B_Abliterated_Baked_HF_Ready-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `amkkk/Gemma4_E2B_Abliterated_Baked_HF_Ready`, publicado por mradermacher. Se trata de una variante "abliterated" de la familia Gemma 4, es decir, un modelo al que se le ha aplicado una edicion de pesos orientada a eliminar la direccion de rechazo (refusal direction) mediante tecnicas de edicion de modulos y direcciones de entrada, de modo que el modelo deja de negarse a responder a determinadas peticiones que el modelo original rechazaria.

El modelo base declara 4.628.569.635 parametros totales (aproximadamente 4,6 mil millones) y se distribuye con licencia Gemma. La model card del autor no proporciona detalles sobre arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de benchmarks; la informacion disponible se limita a la ficha de Hugging Face, los tags y la lista de cuantizaciones generadas.

La relevancia de esta publicacion es fundamentalmente practica: ofrece el modelo en formato GGUF con un abanico amplio de cuantizaciones (desde Q2_K hasta f16, ademas de variantes IQ y un modulo multimodal mmproj), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama. Es importante subrayar que se trata de un modelo derivado no oficial, con implicaciones eticas y de licencia que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4; detalles no publicados en la informacion disponible) |
| Parametros totales | 4.628.569.635 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 (multimodal) |
| Idiomas soportados | en (segun la model card) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Por el nombre y los tags, se trata de un modelo de la familia Gemma 4 (arquitectura transformer decoder-only, presumiblemente), al que se ha aplicado un proceso de "abliteration": edicion de pesos para eliminar la direccion de rechazo aprendida durante el alineamiento. Los tags `refusal-direction`, `model-editing` y `module-input-directions` indican que la intervencion se realizo sobre direcciones de entrada de modulos, una tecnica de edicion de representaciones internas mas que un reentrenamiento.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO en el modelo original. Tampoco se detalla el procedimiento exacto de abliteration empleado por el autor del modelo base (`amkkk`). La cuantizacion la realiza mradermacher con herramientas de llama.cpp, generando cuantizaciones estaticas (sin imatrix en este repositorio; las versiones con imatrix se publican en un repositorio separado `-i1-GGUF`).

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational`.
- Capacidad multimodal: la presencia de ficheros `mmproj` (multi-modal supplement) sugiere soporte de entrada de imagenes, aunque no se detalla en la model card.
- Respuestas sin rechazo a peticiones que el modelo original rechazaria, como consecuencia directa de la abliteration.
- No se documentan capacidades especificas de tool calling, function calling, agentes o modo de razonamiento extendido en la informacion disponible.
- Soporte multilingue limitado al ingles segun la model card.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Inference Endpoints.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo, comparando respuestas con el Gemma 4 original en experimentos controlados de red teaming academico.
- Evaluacion de robustez de filtros: util para probar si los sistemas de moderacion externos (clasificadores de contenido, guardrails) detectan correctamente respuestas no filtradas por el modelo, validando defensas en profundidad.
- Despliegue local en hardware de consumo: con cuantizaciones de 3,1 a 5,0 GB (Q2_K a Q8_0), el modelo cabe en GPUs consumer de 8 GB o incluso en CPU con RAM suficiente mediante llama.cpp u Ollama, lo que permite experimentar sin infraestructura dedicada.
- Generacion de texto creativo sin restricciones en entornos controlados: escritura de ficcion, guiones o dialogos que aborden temas sensibles, siempre que el operador asuma la responsabilidad del contenido generado.
- Prototipado rapido de asistentes conversacionales en ingles: gracias a su tamano contenido y a los formatos GGUF, se puede integrar en aplicaciones de escritorio o moviles con llama.cpp.
- Analisis de sesgos y comportamientos no deseados: al carecer de las capas de rechazo, puede revelar sesgos latentes del modelo base que quedaban enmascarados por las negativas, util en auditorias de modelos.
- Fine-tuning ligero o experimentacion con LoRA sobre una base sin rechazo, para proyectos de investigacion que requieran un punto de partida mas permisivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF): Q2_K ~3,1 GB; Q3_K_S/M/L ~3,2-3,4 GB; IQ4_XS ~3,4 GB; Q4_K_S/M ~3,5 GB; Q5_K_S/M ~3,7 GB; Q6_K ~3,9 GB; Q8_0 ~5,0 GB; f16 ~9,4 GB. Añadir ~0,7-1,1 GB si se usa el modulo mmproj multimodal.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad; A100/H100 no son necesarias para este tamano, aunque permitirian f16 con holgura.
- Cabe en GPU consumer: si, practicamente en todas las GPU modernas con 8 GB o mas en cuantizaciones Q4-Q5; las versiones Q2/Q3 pueden caber en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server. Tambien es posible usar transformers con el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma4_E2B_Abliterated_Baked_HF_Ready-GGUF (este) | ~4,6 B | no disponible | gemma | GGUF | Variante abliterated, solo ingles, cuantizaciones estaticas |
| amkkk/Gemma4_E2B_Abliterated_Baked_HF_Ready (base) | ~4,6 B | no disponible | gemma | safetensors (transformers) | Modelo original sin cuantizar del que deriva este |
| mradermacher/Gemma4_E2B_Abliterated_Baked_HF_Ready-i1-GGUF | ~4,6 B | no disponible | gemma | GGUF (imatrix) | Mismo modelo con cuantizaciones ponderadas por imatrix, mayor calidad por tamano |
| Gemma 4 original (familia) | no disponible | no disponible | gemma | safetensors / GGUF | Modelo oficial con alineamiento intacto; rechaza peticiones que esta variante acepta |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina el rechazo del modelo, lo que implica que puede generar contenido danino, ilegal o eticamente problematico sin filtro interno. No debe desplegarse en produccion orientada a usuarios finales sin guardrails externos robustos.
- Riesgo elevado de alucinacion y de respuestas inseguras al haberse alterado los pesos del modelo alineado; el proceso de edicion puede degradar capacidades generales no evaluadas en la model card.
- Sesgos conocidos: no documentados en la informacion disponible, pero heredados del modelo base Gemma 4 y potencialmente exacerbados por la eliminacion de capas de rechazo.
- Limitacion idiomatica: solo se declara soporte de ingles (`en`); el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no disponible; no debe asumirse una ventana larga sin verificacion empirica.
- Restricciones de licencia: la licencia es `gemma`, que impone terminos de uso de Google (Gemma Terms of Use). Es responsabilidad del usuario verificar si la modificacion (abliteration) y el uso comercial son conformes a dichos terminos; el autor del modelo derivado no ofrece garantias adicionales.
- Modelo derivado no oficial: no esta respaldado por Google ni por el equipo de Gemma; la calidad y seguridad del proceso de abliteration no han sido auditadas de forma independiente segun la informacion disponible.
- Repositorio con pocas descargas (286) y un solo like en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.
- Fecha de creacion y actualizacion del repositorio (2026) posteriores a la fecha de referencia habitual; verificar la vigencia de los enlaces antes de su uso.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Gemma4_E2B_Abliterated_Baked_HF_Ready-GGUF
- Modelo base: https://huggingface.co/amkkk/Gemma4_E2B_Abliterated_Baked_HF_Ready
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemma4_E2B_Abliterated_Baked_HF_Ready-i1-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Gemma4_E2B_Abliterated_Baked_HF_Ready-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor: https://www.nethype.de/
