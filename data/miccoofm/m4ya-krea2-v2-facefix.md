# MiccoOFM/m4ya-krea2-v2-facefix

## Resumen

`MiccoOFM/m4ya-krea2-v2-facefix` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario MiccoOFM. El adaptador inyecta un concepto concreto —una identidad facial invocada mediante el token `m4ya`— sobre el modelo base `krea/Krea-2-Raw`, y se distribuye con ejemplos generados sobre la variante Turbo del mismo modelo base. No se trata de un modelo fundacional, sino de un peso adicional de bajo rango que se carga sobre un pipeline `Krea2Pipeline` mediante la libreria `diffusers`.

El interes tecnico del artefacto es acotado: es un LoRA de un solo concepto, entrenado para fijar rasgos faciales consistentes en retratos, con un repositorio de 0,6 GB y 18 descargas en el momento de la consulta. Su relevancia practica esta limitada a quien ya este trabajando con Krea 2 y necesite replicar una identidad facial concreta en generaciones controladas; no aporta capacidades nuevas al modelo base ni compite en la categoria de modelos generativos generales.

La model card es muy escueta: no documenta volumen de dataset, numero de pasos de entrenamiento, hiperparametros, rango del LoRA ni resultados cuantitativos. Toda la informacion disponible procede de los metadatos del repositorio y de los tres prompts de ejemplo publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; el modelo base es Krea 2 |
| Parametros totales | no disponible (el repositorio pesa 0,6 GB; no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; la longitud de prompt no se documenta) |
| Tipos de cuantizacion | no disponible (la model card solo muestra carga en `bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con `diffusers` (carga via `pipe.load_lora_weights`); no se especifica si se publican en safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con la tecnica DreamBooth sobre Krea 2 RAW, segun indica la propia model card. DreamBooth es un metodo de ajuste fino personalizado que asocia un token raro (aqui `m4ya`) a un sujeto concreto a partir de un conjunto reducido de imagenes de referencia, de modo que el token activa esa identidad en la generacion. El LoRA se aplica sobre el pipeline `Krea2Pipeline` y los ejemplos publicados se han generado sobre la variante Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere un uso orientado a generacion rapida en pocos pasos.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango y alpha del LoRA, ni sobre si se aplicaron tecnicas de regularizacion (prior preservation) propias de DreamBooth. Tampoco se documenta ninguna innovacion arquitectonica: el valor del artefacto esta en el ajuste de identidad, no en cambios estructurales sobre el modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por un token de identidad (`m4ya`), orientada a retratos de una mujer adulta.
- Control de encuadre y composicion mediante prompt: los ejemplos cubren plano de cabeza y hombros, plano de cintura y retrato sentado en interior.
- Control de iluminacion y entorno por prompt: luz natural suave, luz de ventana, fondo gris liso o vegetacion desenfocada.
- Control de vestuario y expresion por prompt: camisa de cuadros abierta sobre top negro, camiseta blanca, expresion neutra con boca cerrada.
- Compatibilidad con la variante Turbo del modelo base para inferencia en pocos pasos (8 pasos en los ejemplos).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento; son capacidades ajenas a la categoria del modelo.
- Capacidad multilingue: no disponible; solo hay evidencia de prompts en ingles.

## Casos de uso

- Produccion de retratos consistentes de un personaje recurrente: el token `m4ya` permite mantener la misma identidad facial a lo largo de una serie de imagenes variando encuadre, vestuario y fondo mediante prompt, util para storyboards o ficcion serializada.
- Creacion de avatares y material de marca personal: generacion de retratos de estudio con fondo neutro y luz controlada, como los del ejemplo `sample_0`, para perfiles y material corporativo simulado.
- Ilustracion de escenas cotidianas con identidad fija: el ejemplo `sample_2` (retrato en una cafeteria con luz de ventana) muestra el uso para escenas narrativas donde el personaje debe reconocerse entre imagenes.
- Pruebas de concepto de vestuario: el ejemplo `sample_1` demuestra la capacidad de cambiar la ropa (camisa de cuadros sobre top negro) manteniendo el rostro, aplicable a previsualizacion de estilismo.
- Iteracion rapida en pipelines de generacion: al funcionar sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`, encaja en flujos de prototipado donde se generan muchas variantes en poco tiempo.
- Base para experimentacion con DreamBooth: sirve como referencia practica de como se estructura y se carga un LoRA de identidad sobre `Krea2Pipeline` en `diffusers`, para quien quiera replicar el proceso con otros sujetos.
- Integracion en herramientas de generacion asistida: al ser un peso LoRA cargable por API de `diffusers`, puede envolverse en un servicio interno que reciba prompts y devuelva imagenes con la identidad fijada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este LoRA. El consumo vendra determinado por el modelo base Krea 2 en `bfloat16`; el adaptador en si anade una sobrecarga marginal sobre ese presupuesto.
- GPU recomendadas: no disponible. La model card solo indica ejecucion en CUDA (`to("cuda")`) sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible; depende de los requisitos del modelo base Krea 2, que no se detallan en la informacion proporcionada.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`, segun el codigo de ejemplo de la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponible. Los ejemplos usan 8 pasos de inferencia sobre la variante Turbo, pero no se publican tiempos.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRA de identidad para Krea 2 ni sobre adaptadores comparables en la misma categoria que permita una comparacion con datos verificables. Se indica a continuacion lo que si es contrastable a nivel de metadatos del propio repositorio:

| Aspecto | m4ya-krea2-v2-facefix | Alternativas comparables |
|---|---|---|
| Tipo | LoRA DreamBooth de identidad | no disponible |
| Modelo base | krea/Krea-2-Raw (probado sobre Krea-2-Turbo) | no disponible |
| Parametros | no disponible | no disponible |
| Contexto | no aplica | no aplica |
| Rendimiento | sin benchmarks publicados | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Disponibilidad | Hugging Face, 18 descargas | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al tratarse de un LoRA de identidad facial entrenado con imagenes de una persona concreta, puede reproducir sesgos de iluminacion, edad aparente, tono de piel y estetica presentes en el dataset de entrenamiento, que no se describe.
- Riesgo de alucinacion: en modelos de difusion se traduce en artefactos visuales (deformaciones faciales, manos incorrectas, incoherencias en el fondo). La model card no reporta evaluaciones de calidad ni tasa de fallo.
- Limitaciones de contexto e idioma: no hay informacion sobre longitud optima de prompt ni sobre comportamiento en idiomas distintos del ingles; los unicos ejemplos estan en ingles.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial queda condicionado por la licencia del modelo base `krea/Krea-2-Raw`, que no se detalla en la informacion disponible y debe verificarse por separado.
- Caveats para produccion: el repositorio tiene 18 descargas y 0 likes, sin historial de validacion por terceros; la model card no documenta hiperparametros, dataset ni evaluaciones. No es un artefacto con garantias de robustez para entornos productivos sin una evaluacion propia previa.
- Dependencia estricta del token `m4ya`: fuera de ese token el adaptador no activa el concepto, y su comportamiento con otros prompts no esta documentado.
- Posible confusion de variantes: el adaptador se entrena sobre Krea 2 RAW pero los ejemplos se generan sobre Krea 2 Turbo; no se documenta el comportamiento sobre otras variantes del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MiccoOFM/m4ya-krea2-v2-facefix
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo usada en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
