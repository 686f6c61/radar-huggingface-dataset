# nikh360pro/capsbro-indic-conformer

## Resumen

CapsBro IndicConformer es una redistribucion en formato sherpa-onnx del modelo de reconocimiento automatico del habla (ASR) AI4Bharat IndicConformer 600M multilingual, desarrollado originalmente por AI4Bharat. El autor del repositorio, nikh360pro, empaqueta un fichero ONNX cuantizado a int8 por cada uno de los ocho idiomas indios soportados (bengali, gujarati, kannada, malayalam, marathi, punyabi, tamil y telugu), junto con el fichero de tokens compartido. Los ficheros se copian sin modificaciones del repositorio Docglasses-AI/indic-conformer-600m-sherpa-onnx-int8.

El modelo resuelve el problema de la transcripcion de voz multilingue para lenguas indias de bajos recursos, un ambito donde los modelos ASR generalistas suelen tener coberturas y precisiones muy inferiores. Su empaquetado para sherpa-onnx lo hace directamente desplegable en entornos de produccion ligeros, sin necesidad de framework de deep learning completo, y su cuantizacion int8 reduce el peso y los requisitos de computo.

La relevancia actual radica en la combinacion de tres factores: la licencia MIT (permite uso comercial sin restricciones practicas), el formato ONNX int8 (inferencia eficiente en CPU) y la cobertura de ocho idiomas indios en un unico paquete. El repositorio ocupa 5,3 GB y no registra descargas ni likes en el momento de la consulta, lo que indica un proyecto de redistribucion de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder CTC), segun el modelo base ai4bharat/indic-conformer-600m-multilingual |
| Parametros totales | 600M (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (un fichero ONNX por idioma) |
| Idiomas soportados | bn (bengali), gu (gujarati), kn (kannada), ml (malayalam), mr (marathi), pa (punyabi), ta (tamil), te (telugu) |
| Licencia | MIT |
| Formato de pesos | ONNX int8 (compatible con sherpa-onnx) |

## Arquitectura y entrenamiento

El modelo subyacente es AI4Bharat IndicConformer 600M multilingual, un modelo de reconocimiento del habla basado en la arquitectura Conformer (combinacion de convoluciones y self-attention) con cabecera CTC, segun indican las etiquetas del repositorio (`ctc`, `base_model:ai4bharat/indic-conformer-600m-multilingual`). El autor de esta redistribucion no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la model card del modelo base original, no incluida en la informacion disponible.

La innovacion tecnica de este repositorio no esta en el entrenamiento, sino en el empaquetado: se ofrece un fichero ONNX cuantizado a int8 por idioma, listo para sherpa-onnx, lo que permite inferencia en CPU sin dependencias de PyTorch y con un peso reducido frente al modelo original. Los ficheros se copian sin modificaciones del repositorio Docglasses-AI/indic-conformer-600m-sherpa-onnx-int8.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) para ocho idiomas indios: bengali, gujarati, kannada, malayalam, marathi, punyabi, tamil y telugu.
- Decodificacion CTC, con un modelo especifico por idioma (no se indica un mecanismo de deteccion automatica de idioma en la informacion disponible).
- Ejecucion via sherpa-onnx, lo que permite despliegue en CPU y en dispositivos de recursos limitados.
- Cuantizacion int8 para reducir el tamano y acelerar la inferencia.
- No se dispone de informacion sobre tool calling, capacidades de agente, vision, audio generativo ni modo de razonamiento; se trata de un modelo puramente ASR.

## Casos de uso

- Subtitulado automatico de video en lenguas indias: el paquete incluye un modelo int8 por idioma, de modo que una plataforma de captioning como CapsBro puede seleccionar el fichero correspondiente al idioma del audio y transcribir con sherpa-onnx sin infraestructura GPU.
- Transcripcion de reuniones y llamadas en marathi, tamil o telugu: al ejecutarse en CPU mediante ONNX, puede integrarse en servidores sin GPU para generar actas o busquedas sobre el audio.
- Accesibilidad para personas sordas en comunidades linguisticas indias: la licencia MIT permite incorporar la transcripcion en aplicaciones comerciales y de codigo abierto sin restricciones de uso.
- Indexacion y busqueda de archivos de audio: transcripcion previa de grabaciones en bengali, gujarati o punyabi para construir indices de texto buscables.
- Asistentes de voz y agentes conversacionales: el modelo actua como capa ASR que convierte la entrada de voz del usuario en texto para el posterior modulo de dialogo.
- Procesamiento por lotes de archivos de audio en servidores modestos: la cuantizacion int8 y el formato ONNX permiten desplegar varias instancias por maquina sin GPU dedicada.
- Investigacion en ASR multilingue para lenguas indias: sirve como linea base reproducible y ligera para comparar con otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso tipico; el modelo esta pensado para ejecucion en CPU con ONNX Runtime via sherpa-onnx.
- GPU recomendadas: no disponibles; al ser un modelo de 600M en int8, cualquier GPU consumer con suficiente memoria podria ejecutarlo, pero no se aportan datos concretos.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base (600M) y la cuantizacion int8, aunque no se especifican requisitos exactos.
- Opciones de despliegue: sherpa-onnx (libreria declarada del repositorio); al ser formato ONNX, tambien podria usarse con ONNX Runtime directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| CapsBro IndicConformer (este) | 600M | no disponible | 8 idiomas indios | MIT | ONNX int8 |
| ai4bharat/indic-conformer-600m-multilingual (base) | 600M | no disponible | multilingue indio | no disponible en la informacion | pesos originales |
| Docglasses-AI/indic-conformer-600m-sherpa-onnx-int8 | 600M | no disponible | 8 idiomas indios | no disponible en la informacion | ONNX int8 |

No se dispone de datos de rendimiento comparado (WER, latencia) en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Es una redistribucion: los ficheros se copian sin cambios del repositorio de Docglasses-AI; cualquier limitacion del modelo base AI4Bharat IndicConformer se hereda integramente.
- No se aportan datos sobre sesgos, tasas de error (WER) ni comportamiento en acentos o ruido; no es posible evaluar su calidad sin pruebas propias.
- Un modelo por idioma: no se indica deteccion automatica de idioma, por lo que el pipeline debe seleccionar el fichero correcto.
- Solo cubre ocho lenguas indias; no soporta castellano ni otras lenguas no listadas.
- El repositorio no registra descargas ni likes, y no hay evidencia de mantenimiento o validacion independiente.
- Licencia MIT declarada, compatible con uso comercial, pero conviene verificar la licencia del modelo base original antes de un despliegue en produccion.
- Riesgo de alucinacion en transcripcion: como todo modelo ASR, puede generar texto incorrecto en audio de baja calidad; no se han publicado metricas al respecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nikh360pro/capsbro-indic-conformer
- Modelo base: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- Repositorio de origen del empaquetado: https://huggingface.co/Docglasses-AI/indic-conformer-600m-sherpa-onnx-int8
