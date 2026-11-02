# msapino/fitodex

## Resumen

Fitodex es un artefacto de despliegue para Android publicado por Matías Sapino (junto a Valentina Marti Reta y Julieta Techenski) como Proyecto Final de Ingeniería Informática en el ITBA. No se trata de un modelo de lenguaje al uso, sino de un APK de 3,9 GB que empaqueta un clasificador de imágenes, un corpus agronómico y un modelo de lenguaje para funcionar íntegramente en el dispositivo, sin conexión a red. El repositorio de HuggingFace contiene únicamente ese binario; no se publican pesos en formato safetensors ni GGUF, ni la model card describe la arquitectura del modelo subyacente.

El problema que aborda es el diagnóstico de enfermedades y deficiencias nutricionales en hojas de lechuga a partir de una fotografía tomada con el teléfono. La propuesta diferencial es la privacidad y la operación offline: la imagen nunca sale del dispositivo y el sistema completo viaja dentro del APK. Está etiquetado con `android`, `agriculture`, `plant-disease` y licencia MIT.

Es relevante ahora como ejemplo de despliegue edge de un pipeline multimodal completo (visión + recuperación sobre corpus + generación de texto) en un único paquete instalable, aunque su naturaleza es la de un entregable académico cerrado, sin mantenimiento ni actualizaciones previstas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un APK, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card está redactada en castellano) |
| Licencia | MIT |
| Formato de pesos | APK de Android (`fitodex-1.0.0.apk`), sin safetensors ni GGUF publicados |
| Tamano del artefacto | 3.929.293.871 bytes (aprox. 3,9 GB) |
| Hash SHA-256 | `abd6a236246eebd9b014393ad61a84b902b904250fa1795997e7c39af5887bf8` |
| Android minimo | 7.0 (API 24) |
| ABI soportadas | `arm64-v8a` y `x86_64` |
| Espacio libre requerido | 8 GB en el dispositivo |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card describe la composición funcional del sistema: un clasificador de imágenes, un corpus agronómico y un modelo de lenguaje, todos empaquetados dentro del APK y ejecutados localmente en el teléfono. No se especifica si el clasificador es una CNN, un transformer visual o un modelo destilado, ni qué familia de modelo de lenguaje se emplea, su tamaño o su cuantización.

Tampoco se publican datos sobre el conjunto de entrenamiento: número de tokens, composición del dataset, imágenes utilizadas para el clasificador, ni si hubo ajuste fino con RLHF o DPO. La model card indica que el clasificador se degrada notablemente fuera de su conjunto de entrenamiento y remite a la pantalla «Alcance» de la aplicación para consultar las cifras medidas, pero esas métricas no se reproducen en el repositorio. El autor declara que las instrucciones de compilación y el código que produjo el APK están en el repositorio del proyecto, sin enlace explícito en la información disponible.

## Capacidades

- Diagnóstico de enfermedades y deficiencias en hojas de lechuga a partir de una fotografía.
- Ejecución completamente offline: clasificador, corpus agronómico y modelo de lenguaje residen en el dispositivo.
- Procesamiento local de la imagen, sin envío a servidores externos.
- Detección de especies no soportadas: reconoce la espinaca de Malabar y avisa de que no puede diagnosticarla.
- Interfaz de aplicación Android con pantalla de alcance que documenta las cifras de rendimiento medidas.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento.

## Casos de uso

- Diagnóstico de campo en explotaciones de lechuga: el agricultor fotografía una hoja y obtiene una evaluación inmediata sin cobertura móvil, gracias a que todo el pipeline viaja en el APK.
- Uso en invernaderos con conectividad limitada o restringida: al no requerir red, el sistema funciona en instalaciones aisladas donde no se permite el envío de imágenes a la nube.
- Escenarios con requisitos de privacidad de datos: la imagen no abandona el dispositivo, lo que facilita el cumplimiento en entornos donde la transferencia de fotografías a terceros es problemática.
- Formación y demostración agronómica: la aplicación sirve como herramienta didáctica para ilustrar deficiencias nutricionales y enfermedades foliares en lechuga.
- Evaluación académica de despliegue edge: el APK es un caso de estudio reproducible de empaquetado de un pipeline multimodal completo en un único artefacto Android.
- Triaje previo a la consulta con un agrónomo: la aplicación puede orientar al productor sobre qué observar antes de una visita técnica, siempre como complemento y no como sustituto del criterio profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la pantalla «Alcance» de la aplicación contiene cifras medidas y distingue las que no se midieron, pero no se reproducen en el repositorio de HuggingFace.

## Requisitos de hardware

- Dispositivo Android con API 24 (Android 7.0) o superior.
- ABI `arm64-v8a` o `x86_64`.
- 8 GB de espacio libre en el almacenamiento del teléfono para la instalación (el APK ocupa 3,9 GB).
- No se especifican requisitos de RAM, GPU móvil ni NPU.
- El despliegue es exclusivamente mediante instalación del APK (`adb install -r fitodex-1.0.0.apk`); no se contemplan vLLM, llama.cpp, Ollama ni TGI.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de diagnóstico foliar offline empaquetados como APK, ni se dispone de especificaciones del modelo subyacente que permitan una comparación técnica con alternativas.

## Limitaciones y advertencias

- No sustituye a un agrónomo: una hoja visualmente sana no descarta una enfermedad.
- Solo diagnostica lechuga; el resto de cultivos queda fuera de su alcance.
- El clasificador se degrada notablemente fuera de su conjunto de entrenamiento, según reconoce el propio autor.
- Es un entregable académico, no un producto mantenido: el artefacto es único y no se actualizará.
- No se publican pesos, arquitectura ni datos de entrenamiento, lo que impide auditoría técnica y reutilización más allá del APK.
- No se documentan sesgos conocidos ni tasas de alucinación del componente de lenguaje.
- La licencia MIT permite uso comercial del artefacto, pero la ausencia de mantenimiento y de garantías técnicas desaconseja su uso en producción sin validación adicional.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de adopción o validación externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/msapino/fitodex
- No se han encontrado en la información disponible enlaces al repositorio del proyecto, al paper, al blog del autor ni a demos.
