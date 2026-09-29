# COIL-D/translate-it2-hindi-bodo

## Resumen

COIL-D/translate-it2-hindi-bodo es un modelo de traduccion automatica neuronal publicado en HuggingFace por el usuario u organizacion COIL-D. Se trata de un ajuste fino (finetune) del modelo ai4bharat/indictrans2-indic-indic-dist-320M, perteneciente a la familia IndicTrans2 de AI4Bharat, especializada en traduccion entre lenguas de la India. El modelo esta orientado al par hindi (hi) y bodo (brx), segun indican sus etiquetas de idioma y el sufijo "hin-brx" del identificador.

El modelo cuenta con 320.861.184 parametros (aproximadamente 320,9 millones) y se distribuye en formato safetensors con un repositorio de 1,3 GB, lo que sugiere pesos en precision completa (fp32). Requiere codigo personalizado (custom_code) para su carga en la libreria transformers, un rasgo tipico de los modelos IndicTrans2. La licencia declarada es MIT, lo que en principio permite uso comercial, aunque el acceso al repositorio esta restringido (gated) y exige aceptar condiciones en HuggingFace.

Su relevancia radica en el caracter de bajos recursos del bodo, una lengua del noreste de la India con un numero limitado de recursos de traduccion automatica de calidad. Un modelo especializado de 320 M de parametros es adecuado para despliegue en hardware modesto y para la construccion de corpus paralelos, materiales educativos o servicios publicos bilingues. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado informacion tecnica detallada mas alla de los metadatos de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada de la familia IndicTrans2); confirmacion exacta no disponible |
| Parametros totales | 320.861.184 (~320,9 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo incluye safetensors (repo de 1,3 GB, compatible con pesos fp32). La cuantizacion requeriria conversion externa (GGUF, CTranslate2, etc.) |
| Idiomas soportados | hindi (hi) y bodo (brx) |
| Licencia | MIT |
| Formato de pesos | safetensors; requiere custom_code y trust_remote_code en transformers |

Otros datos de interes: pipeline declarado "translation", libreria transformers, acceso restringido (gated), repositorio de 1,3 GB, creado el 2026-09-29 y actualizado el 2026-09-29. Etiqueta arXiv declarada: arXiv:2609.28826 (no verificada).

## Arquitectura y entrenamiento

El modelo es un finetune de ai4bharat/indictrans2-indic-indic-dist-320M, por lo que hereda la arquitectura de la familia IndicTrans2 de AI4Bharat: un transformer encoder-decoder con tokenizador multilingue y etiquetas de idioma destino en la entrada. La variante "dist-320M" del modelo base es una version destilada de 320 millones de parametros, disenada para reducir coste de inferencia manteniendo calidad de traduccion en pares indico-indico. No se dispone en la informacion proporcionada de detalles especificos sobre el numero de capas, dimension del modelo, cabezas de atencion ni vocabulario.

En cuanto al entrenamiento especifico de este finetune, no hay informacion publicada en la ficha de HuggingFace sobre el volumen de tokens utilizados, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como SFT, DPO o RLHF. Tampoco se detalla el regimen de aprendizaje ni si se empleo destilacion adicional sobre el modelo base. El repositorio incluye codigo personalizado, lo que implica que la carga del modelo requiere ejecucion de codigo remoto y confiar en la implementacion del autor.

## Capacidades

- Traduccion automatica de texto entre hindi y bodo, segun los idiomas declarados (hi, brx) y la etiqueta de direccion "hin-brx".
- Generacion de texto condicionada a traduccion (pipeline text2text-generation), no generacion abierta ni conversacional.
- Procesamiento de texto plano a nivel de segmento u oracion; no se documenta soporte de documentos completos con contexto largo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No se documenta capacidad de vision, audio ni multimodalidad.
- Capacidad multilingue limitada a los dos idiomas declarados; no se documentan otros pares indicos.
- Capacidad de ajuste fino adicional al estar liberado en safetensors bajo licencia MIT, siempre que se cumplan las condiciones de acceso gated.
- Deteccion de idioma de origen y etiquetado de idioma destino: no confirmada en la informacion disponible.

## Casos de uso

- Traduccion de documentos administrativos en Assam: el modelo permite convertir comunicados, formularios y notificaciones oficiales del hindi al bodo, apoyando la cooficialidad del bodo en la administracion regional y reduciendo la dependencia de traductores humanos para grandes volumenes de texto.
- Creacion de corpus paralelos hindi-bodo: utilidad directa en investigacion linguistica y en el entrenamiento de futuros sistemas de traduccion, generando pares alineados a partir de fuentes monolingues.
- Material educativo bilingue: traduccion de libros de texto, guias didacticas y contenido curricular del hindi al bodo para escuelas que imparten ensenanza en lengua bodo.
- Localizacion de contenido digital: adaptacion de interfaces, avisos, paginas web y aplicaciones moviles para usuarios bodo, con un coste de inferencia bajo gracias a los 320,9 M de parametros.
- Subtitulado y doblaje de contenido audiovisual: traduccion de guiones y subtitulos del hindi al bodo para television, radio y plataformas de video regionales.
- Atencion al ciudadano en lengua bodo: integracion del modelo como componente de traduccion en portales de servicios publicos, salud o justicia, traduciendo consultas en hindi a bodo y viceversa.
- Investigacion en traduccion de lenguas de bajos recursos: el modelo sirve como punto de partida para experimentos de ajuste fino, destilacion o aumento de datos en el par hindi-bodo y en otras lenguas minoritarias del noreste de la India.
- Preservacion digital del bodo: generacion de versiones bilingues de archivos historicos, literatura y documentacion cultural que hoy solo existen en hindi o en transcripciones parciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas BLEU, chrF, COMET ni resultados en conjuntos de evaluacion como Flores-200, ni comparaciones con el modelo base. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia segun precision (calculo a partir de 320,9 M de parametros, sin overhead de activaciones ni cache de atencion):
  - fp32: aproximadamente 1,3 GB solo de pesos.
  - fp16/bf16: aproximadamente 0,65 GB solo de pesos.
  - int8: aproximadamente 0,33 GB solo de pesos.
  - int4: aproximadamente 0,17 GB solo de pesos.
- En la practica, el repositorio distribuido ocupa 1,3 GB, coherente con pesos fp32; para fp16 habria que convertir los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en fp16, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores. GPU de datacenter (A100, H100) solo se justifican para servir muchas peticiones en paralelo.
- Cabe sin problemas en GPU de consumo e incluso en CPU para inferencia por lotes pequenos, dado el reducido tamano del modelo.
- Opciones de despliegue: transformers con trust_remote_code habilitado (requisito imprescindible por el uso de custom_code). El soporte en vLLM, TGI, Ollama o llama.cpp no esta confirmado para este repositorio concreto y requeriria verificacion previa, dado que estos motores suelen no soportar codigo personalizado sin adaptacion.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| COIL-D/translate-it2-hindi-bodo | 320,9 M | no disponible | hi, brx | MIT | gated, 0 descargas | no disponible |
| ai4bharat/indictrans2-indic-indic-dist-320M (modelo base) | 320 M aprox. | no disponible | 22 lenguas indias | MIT (segun repositorio de AI4Bharat) | publico | no disponible en esta ficha |
| facebook/nllb-200-distilled-600M | 600 M | 512 tokens (referencia habitual del modelo) | 200 lenguas, incluida hi; cobertura de brx no confirmada | CC-BY-NC-4.0 | publico | no disponible en esta ficha |
| Modelos especificos hindi-bodo previos | no disponible | no disponible | hi, brx | no disponible | no disponible | no disponible |

Nota: los datos de la columna "Rendimiento" no pueden cumplimentarse porque no se han publicado benchmarks en la informacion disponible. La comparacion se limita por tanto a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de descargar los pesos, lo que anade friccion a la evaluacion y al despliegue.
- Requiere codigo personalizado: la carga en transformers necesita trust_remote_code=True, lo que implica ejecutar codigo de terceros y supone un riesgo de seguridad en entornos de produccion si no se audita antes.
- Ausencia total de documentacion tecnica: no hay model card detallada, ni informacion sobre datos de entrenamiento, hiperparametros, evaluacion o limitaciones conocidas. Esto dificulta estimar la calidad real de las traducciones.
- Riesgo de alucinacion y de traducciones infieles: como todo modelo generativo de traduccion, puede producir contenido ausente en el original, especialmente en segmentos largos, ambiguos o con terminologia especializada.
- Cobertura de idiomas muy limitada: solo se declaran hindi y bodo. No se documenta el comportamiento con texto mezclado, transliterado, con code-switching o con variedades dialectales del bodo.
- Longitud de contexto desconocida: al no publicarse la ventana maxima, no se puede garantizar el comportamiento con documentos largos; se recomienda segmentar por oraciones.
- Sesgos potenciales: derivados del corpus del modelo base IndicTrans2 y del posible corpus de ajuste, no documentados. Pueden aparecer sesgos de genero, registro o terminologia regional.
- Licencia MIT en la ficha, pero sujeta a las condiciones adicionales del acceso gated y a las licencias del modelo base y de los datos de entrenamiento, que no se detallan. Conviene revisar los terminos de IndicTrans2 antes de un uso comercial.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y mayor riesgo de errores no detectados.
- La fecha de creacion registrada (2026-09-29) y la referencia arXiv asociada no han podido corroborarse con fuentes externas.
- No apto para tareas distintas de la traduccion: no soporta tool calling, agentes, razonamiento multi-paso ni multimodalidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/COIL-D/translate-it2-hindi-bodo
- Repositorio del modelo base: https://huggingface.co/ai4bharat/indictrans2-indic-indic-dist-320M
- Referencia arXiv declarada en las etiquetas: arXiv:2609.28826 (no verificada; no se ha podido acceder al articulo)
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: las coincidencias obtenidas corresponden al termino "coil" en contextos de siderurgia y de un grupo musical britanico, ajenos por completo al contenido de esta ficha.
