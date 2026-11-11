# JoshHughes/wallowa-weather-stormscope

## Resumen

Wallowa Weather StormScope es una conversión del modelo NVIDIA StormScope (variante GOES + MRMS) orientada a ejecución en el navegador mediante WebGPU. El autor, JoshHughes, parte del modelo base `nvidia/stormscope-goes-mrms` y cuantiza a 8 bits por fila de salida los tres expertos del modelo MRMS, pliega las capas adaLN en cada llamada al sampler y empaqueta los pesos en un formato propietario (`pocketflux.pack/1`) que solo puede leer el motor WebGPU de su aplicación Wallowa Weather. El objetivo es permitir nowcasting meteorológico en un teléfono móvil sin infraestructura de servidor.

El modelo trabaja con entradas de radar y satélite: seis pasos temporales de 10 minutos de reflectividad compuesta del sistema MRMS de la NOAA, ocho bandas del instrumento ABI del satélite GOES-East (mantenidas en la imagen más reciente) y datos de rayos del sensor GLM, todo ello sobre la rejilla Lambert de 3 km del modelo HRRR. La salida son nueve fotogramas de 10 minutos que cubren el horizonte de +10 a +90 minutos, con predicciones de reflectividad y actividad eléctrica.

Se trata de un artefacto experimental y altamente especializado: no es un modelo de propósito general, no tiene pipeline declarado en Hugging Face, no publica idiomas soportados y su licencia es la NVIDIA Open Model License, no una licencia abierta estándar. Su relevancia radica en demostrar que un modelo de nowcasting de NVIDIA puede comprimirse hasta 348,5 MB de pesos int8 y ejecutarse en el cliente, aunque su utilidad fuera de la aplicación Wallowa Weather es prácticamente nula por el formato cerrado de empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de NVIDIA StormScope, variante GOES + MRMS; estructura de tres expertos segun la model card) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (la model card menciona tres expertos, pero no confirma que sea MoE ni detalla el reparto) |
| Longitud de contexto | No disponible (la entrada es una ventana fija de seis pasos de 10 minutos; no es un contexto de tokens) |
| Tipos de cuantizacion | Int8 por fila de salida (pesos de 348,5 MB); no se ofrecen otras variantes |
| Idiomas soportados | No disponible (modelo meteorologico, sin interfaz de lenguaje natural) |
| Licencia | NVIDIA Open Model License (con terminos Trustworthy AI de NVIDIA) |
| Formato de pesos | Formato propietario `pocketflux.pack/1`: `stormscope_mrms_i8.json` (red), `stormscope_mrms_i8.bin` (pesos int8), `ss_grid.bin` y `ss_grid.json` (rejilla y normalizacion), `manifest.json` (hashes) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de mencionar que el modelo MRMS consta de tres expertos y que incorpora capas adaLN (adaptive layer normalization) que el autor pliega en cada llamada al sampler. No se especifica si se trata de un transformer, un modelo convolucional, un sistema de difusión o una combinación, ni se detallan el número de capas, dimensiones ocultas o mecanismos de atención. Tampoco se indica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, algo esperable en un modelo de predicción meteorológica y no de lenguaje.

La innovación técnica documentada es la conversión: cuantización int8 por fila de salida de los tres expertos, plegado de adaLN para reducir operaciones por llamada al sampler y empaquetado con verificación de integridad mediante SHA-256 por archivo y por cada fragmento de 16 MiB. El modelo base se entrenó sobre la rejilla HRRR de 3 km con datos de MRMS, GOES-East ABI y GLM, pero los detalles de ese entrenamiento corresponden a la model card de NVIDIA y no se reproducen aquí.

## Capacidades

- Nowcasting de reflectividad radar: genera nueve fotogramas de 10 minutos (+10 a +90 minutos) sobre la rejilla HRRR de 3 km.
- Predicción de actividad eléctrica: emite campos de rayos junto con la reflectividad, usando entradas del sensor GLM.
- Fusión multimodal de observaciones: combina reflectividad compuesta MRMS, ocho bandas ABI de GOES-East y datos de rayos GLM en una única pasada.
- Ejecución en dispositivo: los pesos int8 y el motor WebGPU permiten inferencia en un teléfono sin backend.
- Verificación de integridad: el manifiesto permite comprobar cada fragmento de 16 MiB antes de cargarlo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No se documentan capacidades multilingües ni modos especiales de pensamiento, visión o audio en el sentido habitual de los LLM.

## Casos de uso

- Aplicación móvil de meteorología: Wallowa Weather carga los pesos int8 en el cliente y muestra el nowcasting de reflectividad y rayos en el teléfono, evitando costes de servidor y latencia de red. Es el caso de uso para el que se creó el paquete.
- Visualización de radar en zonas con conectividad limitada: al ejecutarse en el dispositivo tras la descarga inicial, el modelo puede producir fotogramas de +10 a +90 minutos sin conexión persistente, útil en entornos rurales o durante cortes de red.
- Demostración de despliegue WebGPU de modelos meteorológicos: sirve como referencia técnica para equipos que quieran llevar modelos de nowcasting de NVIDIA a navegador con cuantización int8 y verificación por hashes.
- Investigación sobre compresión de modelos científicos: permite estudiar el impacto de la cuantización int8 por fila y del plegado de adaLN en la calidad de las predicciones, comparando contra el modelo base de NVIDIA.
- Integración en paneles de situación meteorológica de bajo coste: un servicio que sirva los ficheros empaquetados y deje la inferencia al cliente puede reducir el coste por usuario en aplicaciones de visualización de precipitación.
- Evaluación de fiabilidad de nowcasting a corto plazo: los nueve fotogramas permiten comparar la predicción con observaciones MRMS posteriores para calibrar la confianza del modelo en distintos regímenes de precipitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos int8 ocupan 348,5 MB; el consumo total de memoria depende del motor WebGPU y de los búferes intermedios, no documentados. Como referencia, el paquete completo del repositorio es de 0,4 GB.
- GPU recomendadas: no disponibles. El destino declarado es WebGPU en un teléfono, lo que implica GPUs integradas o móviles compatibles con WebGPU.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos (348,5 MB), aunque no se especifican los requisitos de memoria del motor ni el rendimiento.
- Opciones de despliegue: únicamente el motor WebGPU propio de la aplicación Wallowa Weather, que lee el formato `pocketflux.pack/1`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wallowa Weather StormScope (este) | No disponible | Ventana de 6 pasos de 10 min; salida de 9 fotogramas | `pocketflux.pack/1` int8 | NVIDIA Open Model License | Hugging Face, solo para la app Wallowa Weather |
| nvidia/stormscope-goes-mrms | No disponible | Misma ventana y salida | Pesos originales de NVIDIA | NVIDIA Open Model License | Hugging Face |
| Otros modelos de nowcasting radar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base, del que este paquete es una conversión. No se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- El propio autor advierte que es experimental y que no sustituye a un aviso del National Weather Service; para alertas oficiales debe consultarse weather.gov.
- El formato de pesos es propietario (`pocketflux.pack/1`) y solo lo lee el motor WebGPU de Wallowa Weather: no es reutilizable con herramientas estándar de inferencia.
- La cuantización int8 por fila y el plegado de adaLN pueden degradar la calidad respecto al modelo base de NVIDIA; no se publican métricas que cuantifiquen esa pérdida.
- La licencia NVIDIA Open Model License impone los términos Trustworthy AI de NVIDIA y no es una licencia de código abierto estándar; debe revisarse antes de cualquier uso comercial o redistribución.
- Wallowa Weather no está afiliada ni respaldada por NVIDIA, según la model card.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no es lingüístico; el riesgo principal es la predicción meteorológica incorrecta y su uso indebido como sistema de alerta.
- El repositorio tiene 0 descargas y 0 likes, y no declara pipeline ni idiomas: la validación por parte de la comunidad es inexistente.
- La fecha de creación indicada (2026-11-11) es futura respecto a la información habitual de Hugging Face; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshHughes/wallowa-weather-stormscope
- Modelo base NVIDIA StormScope (GOES + MRMS): https://huggingface.co/nvidia/stormscope-goes-mrms
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Avisos oficiales del National Weather Service: https://www.weather.gov
