# juworld/whisper-large-v3-ilo-asr-lora

## Resumen

`juworld/whisper-large-v3-ilo-asr-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario juworld sobre el modelo base `openai/whisper-large-v3`, orientado al reconocimiento automatico del habla (ASR) en ilocano. El sufijo "ilo" del identificador corresponde al codigo ISO 639-3 del ilocano, una lengua austronesia hablada por entre 8 y 10 millones de personas, principalmente en la region de Ilocos y en el norte de Luzon (Filipinas). El repositorio contiene unicamente los pesos del adaptador (0,1 GB en formato safetensors), no el modelo completo: para usarlo hay que cargar `openai/whisper-large-v3` y aplicar el adaptador mediante la libreria PEFT.

El interes de este tipo de adaptadores es doble. Por un lado, el ilocano no figura entre los 99 idiomas declarados oficialmente por Whisper large-v3 (que si incluye tagalo/filipino), de modo que un ajuste fino especifico es la via practica para obtener transcripcion aceptable en esa lengua. Por otro, el formato LoRA permite especializar un modelo de 1.550 millones de parametros anadiendo solo decenas de megabytes de pesos, sin duplicar el coste de almacenamiento ni de despliegue.

Ahora bien, la model card publicada es la plantilla por defecto de HuggingFace con todos los campos marcados como "[More Information Needed]": no declara licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de un artefacto sin validacion externa conocida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder (Whisper large-v3). Rango, alpha y modulos objetivo: no disponible |
| Parametros totales | Modelo base: ~1.550 millones. Adaptador LoRA: no disponible (repositorio de 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio fija de 30 segundos por segmento; secuencia de decodificacion de hasta 448 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponibles en el repositorio. El modelo base admite fp32, fp16, int8 y cuantizaciones GGUF/CT2 mediante whisper.cpp, faster-whisper o CTranslate2 |
| Idiomas soportados | Ilocano (inferido del identificador del repositorio; la model card no declara idiomas). El modelo base declara 99 idiomas |
| Licencia | No disponible para el adaptador. El modelo base se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.2 (framework `transformers`) |
| Modelo base | `openai/whisper-large-v3` |
| Tarea | Reconocimiento automatico del habla (audio a texto) |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-10-09 |

## Arquitectura y entrenamiento

El modelo subyacente, Whisper large-v3, es un transformer secuencial encoder-decoder con aproximadamente 1.550 millones de parametros: 32 capas de encoder y 32 de decoder, dimension de modelo de 1280, 20 cabezas de atencion y un frontend que convierte el audio en 128 bandas mel-logaritmicas sobre ventanas de 30 segundos. La decodificacion es autorregresiva sobre un vocabulario multilingue y puede condicionarse con tokens de tarea (transcripcion o traduccion) y de idioma. Whisper fue entrenado con 680.000 horas de audio debilmente supervisado, sin ajuste fino supervisado especifico por tarea. Este repositorio no modifica esa arquitectura: solo anade matrices de bajo rango (LoRA) sobre pesos congelados, lo que reduce de forma drastica el numero de parametros entrenables.

No hay ninguna informacion publicada sobre el procedimiento de entrenamiento del adaptador. La model card no especifica el corpus utilizado (horas de audio en ilocano, procedencia, licencia del dataset), ni la particion train/validacion/test, ni el regimen numerico (fp16, bf16, fp32), ni el numero de pasos, ni si se aplicaron tecnicas de aumento de datos o de normalizacion de texto. Tampoco hay evidencia de evaluacion con WER/CER frente a un conjunto de referencia. El unico dato tecnico verificable del repositorio, ademas del modelo base, es la version de PEFT declarada por el autor (0.21.2).

## Capacidades

- Transcripcion de voz a texto en ilocano: es el objetivo declarado por el nombre del repositorio. No hay ninguna medicion publicada que confirme el nivel de calidad alcanzado.
- Capacidades heredadas del modelo base que podrian conservarse total o parcialmente tras el ajuste LoRA: transcripcion multilingue, traduccion de voz a texto en ingles, deteccion automatica de idioma y prediccion de marcas de tiempo a nivel de segmento.
- No es un modelo de proposito general: es un modelo exclusivamente de audio a texto. No genera codigo, no hace razonamiento simbolico, no procesa vision y no produce audio.
- No soporta tool calling ni function calling, ni dispone de modo de "pensamiento" o razonamiento multi-paso, ni de capacidades de agente.
- No se ha publicado informacion sobre si el ajuste preserva las capacidades multilingues del base o degrada el rendimiento en otros idiomas (es un riesgo habitual en ajustes LoRA de un solo idioma).
- No hay informacion sobre soporte de marcas de tiempo a nivel de palabra, diarizacion de hablantes ni puntuacion especifica del ilocano.

## Casos de uso

- Archivo y preservacion linguistica: transcripcion de grabaciones de historia oral, canciones tradicionales o testimonios en ilocano para construir corpus textuales anotados. Es uno de los pocos modelos publicos orientados explicitamente a esta lengua.
- Subtitulado de contenido audiovisual: generacion de subtitulos para noticias locales, videos divulgativos o material educativo rodado en ilocano, partiendo de segmentos de 30 segundos y ensamblando las marcas de tiempo.
- Investigacion academica en ASR de bajos recursos: servir como punto de partida reproducible para comparar estrategias de ajuste LoRA (rango, modulos objetivo, cantidad de audio) en lenguas filipinas minoritarias, siempre que se documente la licencia del adaptador.
- Servicios publicos y atencion ciudadana: transcripcion de llamadas o consultas en ilocano en administraciones locales del norte de Luzon, con revision humana obligatoria dado que no existe una evaluacion de error publicada.
- Documentacion clinica o administrativa por dictado: conversion a texto de notas dictadas en ilocano, integrada en un flujo posterior de traduccion o resumen con otro modelo de lenguaje.
- Analisis de encuestas y entrevistas cualitativas: transcripcion masiva de audio de campo para su posterior codificacion tematica, aprovechando que el adaptador ocupa pocos megabytes y puede ejecutarse en paralelo con otras variantes de Whisper.
- Prototipado rapido de productos de voz en ilocano: dado el reducido tamano del adaptador, permite desplegar una variante especializada sin duplicar el coste de servir un modelo completo adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del autor no incluye ninguna seccion de evaluacion cumplimentada (la seccion "Results" figura como "[More Information Needed]"), no se declara el conjunto de test ni la metrica (WER, CER) y no existe ninguna comparacion con el modelo base o con alternativas. Cualquier cifra de calidad que se quiera utilizar en produccion tendra que medirse localmente sobre un corpus de ilocano propio, y compararse contra la linea base de `openai/whisper-large-v3` sin adaptador para verificar que el ajuste aporta una mejora real.

## Requisitos de hardware

- Peso del adaptador: 0,1 GB, despreciable frente al modelo base.
- Memoria estimada para el modelo base (calculada a partir de 1.550 millones de parametros, sin contar activaciones ni cache de atencion): aproximadamente 6,2 GB en fp32, 3,1 GB en fp16/bf16, 1,6 GB en int8 y 0,8 GB en int4. Conviene anadir margen para el encoder sobre ventanas de 30 segundos y para el cache de atencion cruzada.
- GPU recomendadas: A100, H100 o L40S para servicio concurrente de alta carga; RTX 4090, RTX 4080 o RTX 3090 para inferencia individual de baja latencia.
- GPU de consumo: si cabe con holgura en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3070) usando fp16 o int8. En 6 GB o menos es necesario recurrir a cuantizacion int8/int4 o a ejecucion en CPU.
- Opciones de despliegue: `transformers` + PEFT para cargar el adaptador directamente; vLLM (soporta Whisper y puede servir adaptadores LoRA); faster-whisper/CTranslate2 y whisper.cpp requieren fusionar previamente el adaptador en el modelo base y convertir los pesos a CT2 o GGUF; TGI no ofrece soporte claro para esta combinacion; Ollama no esta pensado para modelos de audio.
- Latencia y throughput: no disponibles. No hay ninguna medicion publicada para este adaptador ni para su combinacion con el modelo base bajo cargas concretas.

## Comparativa con modelos similares

Los datos de rendimiento del adaptador no estan publicados, por lo que la comparacion se limita a especificaciones verificables del modelo base y de alternativas de la misma familia. La columna de rendimiento figura como "no disponible" en todos los casos.

| Modelo | Parametros | Ventana de audio | Idiomas declarados | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| `juworld/whisper-large-v3-ilo-asr-lora` (este modelo) | Adaptador LoRA sobre 1.550 M | 30 s | No declarados (ilocano inferido) | No disponible | safetensors (PEFT); 0 descargas |
| `openai/whisper-large-v3` | 1.550 M | 30 s | 99 | Apache-2.0 | safetensors, GGUF, CT2 |
| `openai/whisper-large-v3-turbo` | 809 M | 30 s | 99 (menos en tareas de traduccion) | Apache-2.0 | safetensors, CT2 |
| `openai/whisper-medium` | 769 M | 30 s | 99 | Apache-2.0 | safetensors, GGUF, CT2 |

No se dispone de informacion sobre otros adaptadores publicos de ilocano con los que comparar de forma directa: no disponible.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla vacia. No hay datos de entrenamiento, hiperparametros, evaluacion ni uso previsto declarado por el autor.
- Licencia no especificada para el adaptador. Aunque el modelo base es Apache-2.0, el adaptador no declara licencia propia; en ausencia de declaracion explicita debe asumirse que no hay cesion de derechos, lo que supone un riesgo legal para uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Sin validacion de la comunidad: 0 descargas y 0 "likes". No existe evidencia externa de que el adaptador funcione, ni de que se haya mantenido tras su publicacion.
- Riesgo de alucinacion inherente a la familia Whisper: en segmentos con silencio, ruido de fondo, musica o habla muy solapada, el modelo puede generar texto plausible no presente en el audio, o entrar en bucles de repeticion. Este comportamiento se agrava en idiomas de pocos recursos y sin datos de evaluacion.
- Sesgos desconocidos: al no conocerse la composicion del corpus de ajuste, no se puede estimar el sesgo por acento, dialecto (ilocano de Ilocos Norte frente a Ilocos Sur o La Union), edad, genero o registro. Tampoco se sabe si el corpus incluia habla espontanea o solo lectura.
- Code-switching: es frecuente el uso mezclado de ilocano, tagalo e ingles en Filipinas. No hay informacion sobre como se comporta el adaptador en esos casos, y es probable que el ajuste mono-idioma haya desplazado la distribucion de salida hacia el ilocano de forma forzada.
- Riesgo de degradacion del modelo base: un ajuste LoRA centrado en un unico idioma puede reducir el rendimiento en los otros 98 idiomas del modelo original. No se ha publicado ningun estudio de olvido catastrofico asociado a este adaptador.
- Dependencia de version: el autor declara PEFT 0.21.2. Diferencias de version en PEFT o `transformers` pueden impedir la carga del adaptador.
- Restricciones practicas de contexto: la ventana fija de 30 segundos obliga a segmentar el audio y a gestionar manualmente las fronteras entre segmentos, con el consiguiente riesgo de cortes en palabras.
- Sin garantia de mantenimiento ni soporte: no se conocen planes del autor, ni incidencias resueltas, ni una version posterior.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/juworld/whisper-large-v3-ilo-asr-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Variante turbo del modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Articulo de Whisper, "Robust Speech Recognition via Large-Scale Weak Supervision": https://arxiv.org/abs/2212.04356
- Articulo de LoRA, "Low-Rank Adaptation of Large Language Models": https://arxiv.org/abs/2106.09685
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto medioambiental citada en la plantilla de la model card (Lacoste et al., 2019): https://mlco2.github.io/impact
- Los resultados de busqueda web disponibles no contienen ningun enlace relacionado con este modelo ni con ASR en ilocano.
