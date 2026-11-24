# mradermacher/MiMo-V2.6-Flash-RL-heretic-GGUF

## Resumen

MiMo-V2.6-Flash-RL-heretic-GGUF es una cuantizacion en formato GGUF del modelo makhdoomhussainraza/MiMo-V2.6-Flash-RL-heretic, realizada por el usuario mradermacher. Se trata de una variante "abliterated" (tambien etiquetada como "heretic"), es decir, un modelo al que se le ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir las negativas a responder determinadas peticiones. El modelo base declara 1.318.620.160 parametros totales (aproximadamente 1,32 mil millones), lo que lo situa en la categoria de modelos pequenos.

El repositorio incluye cuantizaciones estaticas en varios niveles (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16) junto con suplementos multimodales mmproj (Q8_0 y f16), lo que sugiere que el modelo base tiene capacidad de vision. El tamano total del repositorio es de 293,6 GB, consecuencia de alojar todas las variantes de cuantizacion en un mismo espacio.

La relevancia de esta ficha es doble: por un lado, documenta una cuantizacion practica para ejecucion local en llama.cpp u Ollama; por otro, advierte de que el modelo base es una modificacion "abliterated" sin evaluacion publica de seguridad, con cero descargas y cero likes en el momento de la consulta, lo que implica ausencia total de validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer multimodal, inferido por la presencia de mmproj) |
| Parametros totales | 1.318.620.160 (aproximadamente 1,32 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; suplementos mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Los metadatos indican que el modelo base se distribuye con `library_name: transformers` y que la cuantizacion incluye archivos `mmproj`, lo que confirma que el modelo base incorpora un proyector multimodal (vision-lenguaje), aunque no se especifica el encoder visual ni el mecanismo de fusion.

Respecto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. El sufijo "RL" en el nombre sugiere un ajuste mediante refuerzo (probablemente RLHF o RLVR), y "heretic" indica la aplicacion de una tecnica de ablacion de rechazo (abliteration/heretic) sobre el modelo ajustado. No hay informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La cuantizacion fue realizada con la herramienta de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no se han publicado cuantizaciones ponderadas/imatrix para este modelo.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Procesamiento multimodal: la presencia de archivos mmproj indica soporte de entrada de imagenes junto con texto.
- Razonamiento y ajuste por refuerzo: el sufijo RL sugiere entrenamiento con senal de recompensa, aunque no se detalla el dominio.
- Comportamiento "abliterated": el modelo ha sido modificado para reducir rechazos, lo que afecta a la politica de seguridad del modelo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Inferencia local en equipos de gama alta: con cuantizaciones Q4_K_S (176,1 GB) o Q2_K (113,4 GB) el modelo puede desplegarse en estaciones de trabajo con suficiente VRAM o RAM, aunque los tamanos son elevados para un modelo de 1,32 B y obligan a segmentar en varias partes (part1of4, part1of3), lo que sugiere que el modelo base tiene una huella de pesos mucho mayor de lo que indica el recuento de parametros o que incluye componentes adicionales.
- Experimentacion con modelos sin censura: util para investigadores que estudian el efecto de la abliteration en la calidad y la seguridad de las respuestas, comparando el modelo heretic con su version original.
- Prototipado de pipelines multimodales: los archivos mmproj permiten alimentar imagenes junto a texto en herramientas compatibles con llama.cpp, util para pruebas de concepto de descripcion de imagenes o extraccion de informacion visual.
- Evaluacion de cuantizaciones: dado que el repositorio incluye desde Q2_K hasta f16, sirve para medir la degradacion de calidad por nivel de cuantizacion en un modelo pequeno con componente multimodal.
- Generacion de texto en ingles en entornos con licencia permisiva: la licencia MIT facilita su integracion en productos comerciales sin obligaciones de atribucion complejas.
- Fine-tuning posterior sobre la variante GGUF: aunque GGUF no es ideal para entrenamiento, puede usarse como referencia de comportamiento o para destilacion hacia modelos mas pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 113 GB para Q2_K, 176 GB para Q4_K_S y mas de 250 GB para f16, segun los tamanos de archivo publicados; el modelo completo en f16 requiere un entorno con memoria suficiente para alojar los pesos y el contexto.
- GPU recomendadas: no disponible de forma especifica; por volumen de pesos, se requieren configuraciones multi-GPU (varias A100 80 GB o H100 80 GB) para las cuantizaciones altas; las cuantizaciones bajas pueden intentarse en estaciones con gran cantidad de RAM y offloading parcial.
- Cabe en consumer GPU: no para las cuantizaciones publicadas tal cual; un modelo de 1,32 B en Q4_K_M deberia ocupar del orden de 1 GB, por lo que el desajuste entre el recuento de parametros y los tamanos de archivo publicados indica que el modelo base incluye pesos adicionales no contabilizados en el campo de parametros o que la cuantizacion se realizo sobre un checkpoint distinto. Se recomienda verificar los archivos antes de planificar el despliegue.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; los archivos multiparte deben concatenarse antes de su uso.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL-heretic (este) | 1,32 B (declarados) | no disponible | MIT | GGUF | Abliterated, multimodal, solo ingles |
| Modelo base makhdoomhussainraza/MiMo-V2.6-Flash-RL-heretic | no disponible | no disponible | MIT | safetensors/transformers | Version sin cuantizar |
| Alternativas de ~1-2 B abliterated | no disponible | no disponible | variable | GGUF | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated": la ablacion de rechazos elimina parte de las barreras de seguridad, por lo que puede generar contenido danino, ofensivo o inseguro; no es apto para produccion orientada al publico sin filtros adicionales.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad; el comportamiento real del modelo no esta verificado.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas, lo que limita su uso en entornos hispanohablantes.
- Riesgo de alucinacion: inherente a los modelos de lenguaje pequenos; no hay evaluaciones publicadas que lo cuantifiquen.
- Inconsistencia entre parametros declarados (1,32 B) y tamanos de cuantizacion (113-176 GB): sugiere que el checkpoint contiene pesos adicionales (posiblemente el encoder visual o capas no contabilizadas) o que la informacion de parametros es incorrecta; conviene inspeccionar los archivos antes de desplegar.
- Licencia MIT: permisiva para uso comercial, pero el autor no ofrece garantias sobre el comportamiento etico o legal del modelo modificado.
- Sin cuantizaciones imatrix/ponderadas: la calidad de las cuantizaciones bajas (Q2_K, Q3_K_S) puede degradarse mas que en versiones con calibracion.
- Fecha de creacion futura (2026-11-24): los metadatos indican una fecha posterior a la actual, lo que puede reflejar un error de registro; verificar la integridad del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiMo-V2.6-Flash-RL-heretic-GGUF
- Modelo base: https://huggingface.co/makhdoomhussainraza/MiMo-V2.6-Flash-RL-heretic
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MiMo-V2.6-Flash-RL-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
