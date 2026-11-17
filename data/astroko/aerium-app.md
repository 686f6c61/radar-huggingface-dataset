# Astroko/AERIUM-App

## Resumen

AERIUM 5.3 LoRA apps es un paquete de aplicacion distribuido a traves de Hugging Face por el usuario Astroko, que integra varios adaptadores LoRA sobre modelos de la familia Qwen (Qwen3-1.7B y Qwen3.5-0.8B) para construir un simulador de gestion de aerolineas llamado AERIUM, orientado a Windows AMD64 y Android 14+ ARM64. No se trata de un modelo unico publicado con pesos sueltos, sino de una aplicacion empaquetada (APK y ZIP) que incorpora los pesos ya fusionados y cuantizados, junto con el runtime de inferencia.

El sistema emplea tres roles funcionales: un LoRA sobre Qwen3-1.7B entrenado con 200 elementos anclados en informes oficiales mas 600 ejemplos de instruccion para la redaccion de articulos; un LoRA sobre Qwen3.5-0.8B para la seleccion de acciones permitidas por el motor del simulador; y un modelo de chat general de 4B en PC y 2B en telefono/web. La licencia declarada es Apache-2.0 y el unico idioma indicado en la model card es el coreano (ko).

La relevancia de esta ficha es limitada en terminos de investigacion: se trata de un artefacto de aplicacion con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni resultados de benchmarks publicados. Su interes practico reside en el patron de despliegue (LoRA fusionados y cuantizados sobre modelos pequenos para inferencia local en escritorio y movil) mas que en capacidades de modelo novedosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B y Qwen3.5-0.8B), con adaptadores LoRA fusionados |
| Parametros totales | No disponible como cifra unica; componentes de 0,8B, 1,7B, 2B y 4B segun rol y plataforma |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card indica "modified/quantized versions" sin especificar formatos) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos fusionados y cuantizados empaquetados en la aplicacion (APK/ZIP); no se publican safetensors ni GGUF sueltos |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de los modelos base Qwen3-1.7B y Qwen3.5-0.8B, es decir, transformers decoder-only, sobre los que se aplican adaptadores LoRA que posteriormente se fusionan y cuantizan para su empaquetado. La model card no detalla la configuracion de atencion, el numero de capas ni la longitud de contexto de los modelos base.

En cuanto a los datos de entrenamiento, el LoRA de redaccion de articulos se entreno con 200 elementos anclados en informes oficiales mas 600 ejemplos de instruccion. El LoRA de operaciones se entreno para seleccionar acciones permitidas por el motor del simulador. El autor advierte explicitamente que los ejemplos de entrenamiento y los resumenes fueron curados por el asistente y no aprobados por un editor humano. No se documenta el uso de RLHF, DPO ni el volumen total de tokens empleados.

## Capacidades

- Generacion de texto en coreano para la redaccion de articulos periodisticos dentro del simulador, con anclaje a informes oficiales.
- Seleccion de acciones de operaciones del motor del simulador mediante un LoRA dedicado sobre Qwen3.5-0.8B.
- Chat general conversacional con modelos de 4B en PC y 2B en telefono/web.
- Inferencia local en Windows con backend NVIDIA CUDA por defecto y opcion de CPU.
- Inferencia local en Android 14+ ARM64, con soporte variable de combinaciones GPU/NPU de Qualcomm.
- Inferencia web local que se conecta al companion de Windows y usa CPU.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo thinking: no disponibles.

## Casos de uso

- Simulacion de gestion de aerolinea en escritorio: el paquete Windows x64 incluye el ejecutable, los modelos, el runtime y los recursos web, de modo que el usuario puede ejecutar el simulador completo sin conexion a servicios externos.
- Simulacion de gestion de aerolinea en movil: el APK para Android 14+ ARM64 incorpora los modelos de noticias y operaciones, permitiendo jugar en dispositivo sin depender de un servidor.
- Redaccion asistida de articulos dentro del juego: el LoRA sobre Qwen3-1.7B genera borradores de noticias a partir de informes oficiales del simulador, que el usuario debe revisar y editar.
- Seleccion automatica de acciones del motor: el LoRA sobre Qwen3.5-0.8B elige entre las acciones permitidas por el motor, lo que permite automatizar decisiones operativas dentro de las reglas del simulador.
- Chat conversacional de proposito general en local: los modelos de 4B (PC) y 2B (telefono/web) cubren conversacion general sin salir del dispositivo.
- Despliegue de referencia para desarrolladores: el paquete sirve como ejemplo de empaquetado de LoRA fusionados y cuantizados sobre modelos pequenos de Qwen para distribucion en escritorio y movil.
- Evaluacion de inferencia en hardware movil Qualcomm: el autor documenta que la inferencia fisica en Android no ha sido verificada en esta version, por lo que el paquete puede usarse para probar combinaciones GPU/NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El paquete Windows ocupa 6.904.914.657 bytes y el APK 1.985.876.081 bytes, pero no se desglosa el reparto entre pesos y runtime.
- GPU recomendadas: NVIDIA con CUDA para el backend por defecto en PC; en Android, combinaciones GPU/NPU de Qualcomm (soporte variable segun telefono).
- Cabe en GPU consumer: no disponible como dato confirmado; los modelos base (0,8B a 4B) son de tamano reducido y en principio aptos para GPUs consumer, pero el autor no publica requisitos.
- Opciones de despliegue: aplicacion propia con runtime empaquetado; en PC se puede seleccionar CPU en ChatwithAI; la inferencia web local usa CPU y requiere el companion de Windows. No se menciona soporte de vLLM, llama.cpp, Ollama o TGI como opciones de usuario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AERIUM 5.3 LoRA apps | 0,8B / 1,7B / 2B / 4B por rol | No disponible | Apache-2.0 | Paquete APK/ZIP en Hugging Face |
| Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | Apache-2.0 | Pesos en Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | No disponible en esta ficha | Apache-2.0 | Pesos en Hugging Face |

No se dispone de datos de rendimiento comparativo entre AERIUM y sus modelos base ni con alternativas de la misma categoria.

## Limitaciones y advertencias

- La redaccion automatica de articulos requiere edicion contra el informe oficial; las comprobaciones automaticas de numeros, fechas y formato no constituyen verificacion factual completa.
- Los ejemplos de entrenamiento y resumenes fueron curados por el asistente, no aprobados por un editor humano.
- La inferencia fisica en Android no ha sido verificada para esta version.
- El soporte de combinaciones GPU/NPU de Qualcomm varia segun el telefono.
- En Android, el modelo general de 2B se descarga explicitamente dentro de la aplicacion, no viene incluido en el APK.
- Se recomienda exportar las partidas guardadas antes de instalar y no eliminar la aplicacion 5.2 LoRA previa.
- Idioma limitado al coreano (ko); no se declaran capacidades multilingues.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano, agravado por la falta de verificacion factual automatica en la redaccion de articulos.
- Sesgos conocidos: no documentados.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el paquete incluye avisos MIT de llama.cpp y pesos modificados/cuantizados de Qwen; conviene revisar las obligaciones de atribucion de ambos.
- El repositorio presenta 0 descargas y 0 likes, sin pipeline declarado ni benchmarks, por lo que no hay evidencia externa de calidad o estabilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Astroko/AERIUM-App
- Centro de descargas: https://aerium.astro-korea.workers.dev/download.html
- APK Android arm64: https://huggingface.co/Astroko/AERIUM-App/resolve/main/AERIUM-5.3.0-LoRA-Android-arm64.apk?download=true
- Paquete Windows x64: https://huggingface.co/Astroko/AERIUM-App/resolve/main/AERIUM-5.3.0-Windows-x64.zip?download=true
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
