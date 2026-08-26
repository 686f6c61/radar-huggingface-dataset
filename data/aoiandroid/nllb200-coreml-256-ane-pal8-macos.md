# aoiandroid/nllb200-coreml-256-ane-pal8-macos

## Resumen

El modelo `aoiandroid/nllb200-coreml-256-ane-pal8-macos` es un paquete Core ML compilado para macOS, derivado del modelo NLLB-200 de Meta AI (No Language Left Behind). Está diseñado específicamente para su uso en la aplicación TranslateBlue, una herramienta de traducción neuronal que funciona sin conexión. El autor, aoiandroid, ha convertido los pesos originales a formato `.mlmodelc` (modelo compilado de Apple) con una paletización de 8 bits (pal8) para reducir el tamaño y permitir una ejecución eficiente en el Apple Neural Engine (ANE).

Este modelo resuelve el problema de la traducción automática neuronal en dispositivos Apple sin necesidad de conexión a internet, aprovechando la aceleración por hardware del ANE. Su relevancia radica en que ofrece una alternativa ligera y optimizada para integraciones en apps de iOS y macOS, aunque hereda las restricciones de licencia no comercial del checkpoint original de NLLB. El repositorio tiene un tamaño de 1,4 GB y fue creado en agosto de 2026, aunque no se especifican detalles sobre la arquitectura interna ni el número de parámetros en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de NLLB-200, arquitectura transformer seq2seq) |
| Parametros totales | no disponible (el modelo original NLLB-200 distilled tiene 600M, pero no se confirma para este export) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Paletizacion de 8 bits (pal8) |
| Idiomas soportados | no disponible (se mencionan codigos FLORES como jpn_Jpan, pero no hay lista completa) |
| Licencia | MIT (repositorio) / CC-BY-NC 4.0 (checkpoint original NLLB, restriccion no comercial heredada) |
| Formato de pesos | Core ML compilado (`.mlmodelc`), paquete `.mlpackage` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de este export especifico. Se sabe que deriva del modelo NLLB-200 de Meta AI, que es un transformer seq2seq de gran escala entrenado para traduccion multilingue con soporte de 200 idiomas. El checkpoint original utilizado es la version destilada (distilled), que reduce el numero de parametros manteniendo una calidad aceptable. Este export concreto ha sido compilado para Core ML, lo que implica una conversion de los pesos a un formato optimizado para el runtime de Apple, y se ha aplicado una paletizacion de 8 bits para reducir el tamano del archivo y facilitar la inferencia en el ANE. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Traduccion automatica neuronal multilingue (heredada de NLLB-200, con soporte de codigos FLORES).
- Ejecucion offline en dispositivos Apple (macOS e iOS) mediante Core ML.
- Optimizacion para Apple Neural Engine (ANE) gracias a la paletizacion de 8 bits.
- Integracion directa con la aplicacion TranslateBlue.
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio.

## Casos de uso

- Traduccion offline en aplicaciones de escritorio macOS: el modelo puede integrarse en apps de productividad o lectura para traducir texto sin conexion, aprovechando el ANE para una latencia baja.
- Traduccion en tiempo real en apps de chat o correo: al estar compilado para Core ML, se puede cargar en memoria y ejecutar inferencias rapidas en segundo plano.
- Procesamiento de documentos multilingues: util para traductores o editores que necesitan convertir textos largos sin depender de servicios en la nube.
- Desarrollo de apps iOS con soporte de traduccion: el repositorio hermano `-ios` sugiere que el mismo modelo puede usarse en dispositivos moviles, ampliando el caso de uso a apps de viajes o educacion.
- Prototipado de soluciones de traduccion con privacidad: al funcionar localmente, los datos del usuario nunca salen del dispositivo, lo que es relevante para sectores con requisitos estrictos de confidencialidad.
- Investigacion y evaluacion de modelos NLLB en entornos Apple: los desarrolladores pueden usar este export como referencia para comparar rendimiento y calidad frente a otras implementaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni metricas de traduccion como BLEU o chrF para este export especifico.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo paletizado a 8 bits y compilado para Core ML, se espera que quepa en la memoria unificada de los Macs con chip Apple Silicon (8 GB o mas).
- GPU recomendadas: no aplica GPU tradicional; requiere Apple Neural Engine (ANE) o CPU con soporte Core ML. Compatible con Macs con chip M1 o posterior.
- Si cabe en consumer GPU: no aplica, es un formato exclusivo de Apple.
- Opciones de despliegue: Core ML runtime en macOS/iOS, integrable via `MLModel` o `MLModelc`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (traduccion neuronal en Core ML). Se puede mencionar que el modelo original NLLB-200 distilled (600M) es la referencia de partida, pero no hay datos de este export frente a alternativas como los modelos de traduccion de Apple o MarianMT en formato Core ML.

## Limitaciones y advertencias

- Licencia no comercial: el checkpoint original de NLLB se distribuye bajo CC-BY-NC 4.0, por lo que este derivado no puede usarse en aplicaciones comerciales sin permiso explicito de Meta.
- Informacion tecnica incompleta: no se documentan parametros, contexto, idiomas exactos ni requisitos de hardware, lo que dificulta la evaluacion previa a la integracion.
- Riesgo de alucinacion en traducciones: como cualquier modelo NMT, puede producir traducciones incorrectas o inventar contenido, especialmente en pares de idiomas poco representados.
- Dependencia del ecosistema Apple: el formato `.mlmodelc` solo funciona en dispositivos Apple, limitando su portabilidad a otras plataformas.
- Sin soporte de herramientas externas: no incluye tool calling ni capacidades de agente, por lo que su uso se limita a traduccion pura.
- Tamaño del repositorio (1,4 GB) puede ser elevado para apps con restricciones de descarga, aunque la paletizacion reduce el peso respecto al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aoiandroid/nllb200-coreml-256-ane-pal8-macos
- Repositorio fuente (mismo nombre sin sufijo -macos): https://huggingface.co/aoiandroid/nllb200-coreml-256-ane-pal8
- Coleccion de modelos NLLB de aoiandroid: https://huggingface.co/collections/aoiandroid/nllb
- Repositorio de referencia NLLB-200 (GitHub): https://github.com/JHmins/NLLB-200-Model
- Model zoo de Apple Core AI (referencia de ecosistema): https://github.com/john-rocky/coreai-model-zoo
- Tutorial de configuracion local de NLLB-200: https://nllb.com/setup-nllb-locally/
