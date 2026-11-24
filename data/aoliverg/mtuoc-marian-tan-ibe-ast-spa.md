# aoliverg/MTUOC-Marian-TAN-IBE-ast-spa

## Resumen

MTUOC-Marian-TAN-IBE-ast-spa es un modelo de traduccion automatica neuronal publicado en Hugging Face por el usuario aoliverg, asociado al ecosistema MTUOC (Machine Translation Universal Open Converter), una linea de trabajo de la Universitat Oberta de Catalunya orientada a la traduccion automatica abierta. El identificador del modelo indica un sistema de traduccion entre asturiano (ast) y espanol (spa), construido sobre la arquitectura Marian, la familia de modelos encoder-decoder de traduccion neuronal desarrollada originalmente por Microsoft Research y mantenida por el proyecto Helsinki-NLP.

El sufijo TAN-IBE hace referencia al corpus o dominio de entrenamiento, presumiblemente vinculado al Instituto de la Lengua Asturiana o a un corpus institucional de referencia para el par asturiano-espanol. El repositorio ocupa 2,0 GB, un tamano coherente con un modelo Marian de tipo transformer de aproximadamente 70 a 75 millones de parametros en precision completa, aunque el dato exacto no se declara en la informacion disponible.

La relevancia del modelo es limitada pero especifica: cubre un par linguistico de bajos recursos (asturiano-espanol) que apenas cuenta con sistemas abiertos de calidad, y lo hace bajo licencia GPL-3.0. No dispone de descargas ni interacciones registradas en el momento de la consulta, y la model card publicada es practicamente vacia, sin datos de entrenamiento, benchmarks ni instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion automatica) |
| Parametros totales | no disponible (estimacion por tamano de repo: ~70-75 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | asturiano y espanol (inferido del identificador del modelo) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (repo de 2,0 GB, presumiblemente pesos PyTorch/safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica, con atencion multi-cabeza estandar y sin mecanismos experimentales como attention linear o mezcla de expertos. Los modelos Marian de Helsinki-NLP suelen emplear vocabularios SentencePiece y entrenarse con cantidades moderadas de datos paralelos, lo que los hace ligeros y rapidos en inferencia comparados con modelos generativos grandes.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de aumento de datos, destilacion o ajuste fino. El sufijo TAN-IBE sugiere un corpus institucional del ambito asturiano, pero la model card no documenta ni la procedencia de los datos ni el proceso de entrenamiento. Tampoco se indica si el modelo se entreno desde cero o mediante fine-tuning de un checkpoint Marian multilingue existente.

## Capacidades

- Traduccion automatica directa asturiano-espanol (y presumiblemente en sentido inverso, aunque no se documenta).
- Generacion de texto condicionada a la tarea de traduccion; no es un modelo conversacional ni de instrucciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Cobertura multilingue limitada al par asturiano-espanol.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion administrativa asturiana al espanol: el modelo puede procesar textos institucionales del Principado de Asturias para facilitar su consulta por hablantes no asturianos, aprovechando que el par linguistico esta cubierto de forma especifica.
- Localizacion de contenido web y editorial: integracion en pipelines de publicacion bilinguees para medios o portales que ofrecen versiones en asturiano y castellano, reduciendo el coste de traduccion manual de articulos y notas.
- Preservacion y difusion del patrimonio linguistico: traduccion de corpus literarios o etnograficos en asturiano a espanol para investigadores que necesitan acceso rapido a materiales, con revision humana posterior.
- Subtitulado y transcripcion de contenido audiovisual: traduccion de subtitulos en asturiano a espanol en flujos automatizados, dado el bajo coste computacional de un modelo Marian.
- Sistemas de traduccion asistida (CAT): integracion como motor de sugerencias en herramientas de traduccion profesional para el par asturiano-espanol, donde la oferta de motores abiertos es escasa.
- Investigacion en traduccion de bajos recursos: uso como baseline o punto de comparacion en estudios sobre pares linguisticos minoritarios, gracias a su licencia abierta y su tamano manejable.
- Procesamiento de corpus paralelos: generacion de alineaciones o traducciones de referencia para construir y ampliar corpus paralelos asturiano-espanol en proyectos de linguistica computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un modelo Marian de ~75 M de parametros; menos de 500 MB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con holgura.
- Cabe en GPU consumer sin problemas, e incluso en CPU con latencias aceptables para traduccion por frases.
- Opciones de despliegue: transformers (Helsinki-NLP/MarianMT), CTranslate2, Marian NMT nativo, ONNX Runtime; tambien es convertible a otros formatos mediante scripts estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto (cientos de frases por segundo en GPU moderna) y latencia de decenas de milisegundos por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MTUOC-Marian-TAN-IBE-ast-spa | ~70-75 M (estimado) | no disponible | GPL-3.0 | Hugging Face, 0 descargas |
| Helsinki-NLP/opus-mt-ast-es | ~75 M | ~512 tokens | CC-BY-4.0 | Hugging Face, ampliamente usado |
| Helsinki-NLP/opus-mt-es-ast | ~75 M | ~512 tokens | CC-BY-4.0 | Hugging Face, ampliamente usado |
| NLLB-200-distilled-600M | 600 M | 512 tokens | CC-BY-NC-4.0 | Hugging Face, muy extendido |

La comparativa con Helsinki-NLP/opus-mt-ast-es es la mas directa: mismo par linguistico, misma familia arquitectonica y tamano similar, pero con licencia CC-BY-4.0 mas permisiva y mayor adopcion comunitaria. NLLB-200 ofrece cobertura multilingue amplia pero con licencia no comercial en su variante distilled.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, evaluacion ni limitaciones conocidas.
- Riesgo de sesgos derivados del corpus de entrenamiento no documentado, especialmente en terminologia institucional o regional.
- Riesgo de alucinacion y de traducciones infieles en textos largos o con vocabulario especializado, comun en modelos Marian de este tamano.
- Cobertura limitada al par asturiano-espanol; no debe usarse para otros pares linguisticos.
- Sin evidencia de evaluacion de calidad publicada (BLEU, COMET u otras metricas).
- Licencia GPL-3.0: implica obligaciones de copyleft para obras derivadas distribuidas; puede ser incompatible con productos comerciales propietarios que no liberen su codigo.
- Ausencia total de descargas y validacion comunitaria: no hay senales de uso en produccion ni de mantenimiento activo.
- Fecha de actualizacion del repositorio posterior a la de creacion sin cambios documentados en la model card, lo que no permite verificar mejoras.

## Enlaces

- Hugging Face: https://huggingface.co/aoliverg/MTUOC-Marian-TAN-IBE-ast-spa
- Proyecto MTUOC (referencia del ecosistema): https://github.com/aoliverg/MTUOC-Web
- Helsinki-NLP MarianMT (arquitectura base): https://github.com/Helsinki-NLP/Opus-MT
- Modelo comparable ast-es: https://huggingface.co/Helsinki-NLP/opus-mt-ast-es
- Modelo comparable es-ast: https://huggingface.co/Helsinki-NLP/opus-mt-es-ast
