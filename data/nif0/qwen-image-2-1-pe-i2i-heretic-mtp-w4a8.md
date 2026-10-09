# nif0/Qwen-Image-2.1-PE-i2i-heretic-mtp-w4a8

## Resumen

nif0/Qwen-Image-2.1-PE-i2i-heretic-mtp-w4a8 es una version cuantizada del modelo darrellbest/Qwen-Image-2.1-PE-I2I-Heretic, un fine-tune que a su vez deriva de Qwen/Qwen-Image-2.1-PE-I2I, descrito en la model card como el potenciador de prompts (prompt enhancer) Qwen3.5-VL de 9B. El repositorio lo publica el usuario nif0 y su proposito es ofrecer una version de bajo peso (5,68 GiB) lista para ejecutarse en ComfyUI mediante comfy-kitchen, reduciendo el coste de VRAM respecto al modelo original en precision completa.

La cuantizacion aplicada es W4A8 con ConvRot (group size 256) y calibracion GPTQ, con el `lm_head` tambien en W4A8 y los embeddings y las capas lineales de vision en int8. Ademas, se ha injertado el cabezal de prediccion multi-token (MTP) del modelo Qwen/Qwen3.5-9B como tensores `mtp.*`, lo que habilita potencialmente decodificacion especulativa, aunque el autor advierte de que ese cabezal no fue entrenado sobre este fine-tune.

El dato real de safetensors cifra el total en 6.078.009.072 parametros y el tamano del repositorio en 6,1 GB (5,68 GiB segun la model card, de los cuales unos 0,23 GiB corresponden al cabezal MTP). Es relevante ahora porque permite ejecutar un potenciador de prompts multimodal, derivado de la familia Qwen3.5, en equipos con VRAM limitada dentro del ecosistema ComfyUI. El autor indica que no ha probado el fichero ni en ComfyUI ni en un runtime de decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5 (tag `qwen3_5`); incluye capas lineales de vision y cabezal MTP injertado |
| Parametros totales | 6.078.009.072 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 con ConvRot (group size 256) y calibracion GPTQ; `lm_head` en W4A8; embeddings y lineales de vision en int8 |
| Idiomas soportados | no disponible |
| Licencia | `other` (Qwen Research License, `license_name: qwen-research`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una version cuantizada de un fine-tune: nif0/Qwen-Image-2.1-PE-i2i-heretic-mtp-w4a8 parte de darrellbest/Qwen-Image-2.1-PE-I2I-Heretic, que a su vez se basa en Qwen/Qwen-Image-2.1-PE-I2I, identificado en la model card como el potenciador de prompts Qwen3.5-VL de 9B. La arquitectura subyacente es de tipo transformer multimodal (Qwen3.5), con presencia de capas lineales de vision tratadas en int8 en esta version cuantizada. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO al fine-tune original.

La innovacion tecnica de esta publicacion es doble. Por un lado, la cuantizacion W4A8 con ConvRot (group size 256) calibrada con GPTQ: el autor afirma que la calibracion GPTQ redujo el error ponderado de pesos a aproximadamente 0,26 veces el de una cuantizacion ConvRot round-to-nearest simple (metrica de error de pesos; no se midio KL en este modelo). Por otro, el injerto del cabezal de prediccion multi-token (MTP) procedente de Qwen/Qwen3.5-9B como tensores `mtp.*`, con lineales en int8 ConvRot y normas en bf16. El autor advierte de que ese cabezal no fue entrenado sobre este fine-tune, por lo que la tasa de aceptacion de borradores (draft acceptance) en decodificacion especulativa podria ser inferior a la del modelo base, y que ComfyUI probablemente ignore los pesos `mtp.*`.

## Capacidades

- Generacion de texto orientada a la mejora de prompts (prompt enhancement) para pipelines de generacion de imagenes, segun la funcion declarada del modelo base Qwen-Image-2.1-PE-I2I.
- Procesamiento multimodal con entrada de vision: el repo incluye capas lineales de vision cuantizadas a int8, lo que indica capacidad de manejar entradas visuales.
- Prediccion multi-token mediante el cabezal MTP injertado, orientada a decodificacion especulativa (rendimiento no verificado por el autor).
- Ejecucion en ComfyUI mediante comfy-kitchen, segun la propia model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Mejora automatica de prompts en ComfyUI: el modelo se integra en el flujo de trabajo de ComfyUI via comfy-kitchen para transformar instrucciones breves de usuario en prompts detallados antes de pasarlos a un modelo de generacion de imagen, con un coste de VRAM reducido por la cuantizacion W4A8.
- Preprocesado de instrucciones en pipelines de edicion de imagen (image-to-image): al derivar de un modelo PE-I2I, encaja como etapa previa que reescribe la orden del usuario y conserva la intencion antes de la fase de edicion.
- Despliegue en equipos con VRAM limitada: los 5,68 GiB de pesos permiten alojar el modelo en GPUs de gama de consumo alta, a diferencia del modelo sin cuantizar, facilitando su uso en estaciones de trabajo locales.
- Evaluacion de tecnicas de decodificacion especulativa: los tensores `mtp.*` permiten experimentar con decodificacion especulativa en runtimes compatibles, aunque el autor no ha validado su funcionamiento.
- Investigacion sobre cuantizacion W4A8 con ConvRot y GPTQ: sirve como caso de estudio reproducible para medir el impacto de la calibracion GPTQ frente a round-to-nearest en un transformer multimodal.
- Prototipado rapido de interfaces de generacion de imagen: al ser un potenciador de prompts ligero, permite construir demos interactivas donde el usuario escribe una frase corta y el modelo la expande antes de invocar el generador.
- Cadena de herramientas de edicion asistida: combinado con un modelo de difusion, se puede usar para reescribir instrucciones ambiguas en tareas de retoque o modificacion de imagenes existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento aportado por el autor es que la calibracion GPTQ redujo el error ponderado de pesos a aproximadamente 0,26 veces el de una cuantizacion ConvRot round-to-nearest, medido con una metrica de error de pesos; no se reporto KL ni metricas de calidad generativa.

## Requisitos de hardware

- Peso de los archivos: 5,68 GiB en total (aproximadamente 0,23 GiB corresponden al cabezal MTP), segun la model card; el repositorio ocupa 6,1 GB.
- VRAM estimada para inferencia: los pesos en W4A8 ocupan del orden de 5,7 GiB, por lo que se necesita VRAM adicional para activaciones, cache y el resto del pipeline; no se proporcionan cifras oficiales de VRAM total en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano de pesos, es plausible su ejecucion en GPUs de consumo con suficiente VRAM, pero el autor no lo confirma.
- Compatibilidad con GPU de consumo: no verificada por el autor.
- Opciones de despliegue: ComfyUI mediante comfy-kitchen es el destino declarado. El autor indica que ComfyUI probablemente ignore los pesos `mtp.*`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor no ha ejecutado el fichero ni en ComfyUI ni en un runtime de decodificacion especulativa, por lo que no hay mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nif0/Qwen-Image-2.1-PE-i2i-heretic-mtp-w4a8 | 6.078.009.072 (dato real) | no disponible | W4A8 ConvRot + GPTQ, int8 en embeddings y vision | qwen-research | HuggingFace, 0 descargas, 0 likes |
| darrellbest/Qwen-Image-2.1-PE-I2I-Heretic | no disponible | no disponible | sin cuantizar (modelo base del fine-tune) | no disponible | HuggingFace |
| Qwen/Qwen-Image-2.1-PE-I2I | no disponible en la informacion (descrito como Qwen3.5-VL 9B) | no disponible | sin cuantizar | qwen-research (presumible por la cadena) | HuggingFace |
| Qwen/Qwen3.5-9B | 9B (referencia, no confirmado en la informacion) | no disponible | sin cuantizar | no disponible | HuggingFace; origen del cabezal MTP |

Nota: no se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros declarados, formato de pesos y licencia.

## Limitaciones y advertencias

- El autor declara explicitamente que no ha probado el fichero ni en ComfyUI ni en un runtime de decodificacion especulativa ("Untested").
- El cabezal MTP no fue entrenado sobre este fine-tune, por lo que la tasa de aceptacion de borradores en decodificacion especulativa podria ser inferior a la del modelo base Qwen/Qwen3.5-9B.
- ComfyUI probablemente ignore los pesos `mtp.*`, de modo que esa capacidad podria no estar disponible en el flujo de trabajo previsto.
- La cuantizacion a 4 bits conlleva perdida de precision frente al modelo original; el autor solo reporta el error de pesos relativo frente a round-to-nearest, sin metrica de calidad generativa (no se midio KL).
- No se documentan sesgos conocidos, riesgos de alucinacion ni limitaciones idiomaticas en la informacion disponible.
- No se dispone de la longitud de contexto ni de los idiomas soportados.
- Licencia `other` con nombre `qwen-research`: se trata de una licencia de investigacion, por lo que el uso comercial puede estar restringido; conviene revisar el fichero `LICENSE` del repositorio antes de cualquier despliegue productivo.
- Cifra de parametros y denominacion de origen: el repositorio declara 6.078.009.072 parametros mientras que la model card describe el modelo de origen como "Qwen3.5-VL 9B" y el cabezal MTP procede de Qwen/Qwen3.5-9B; esta diferencia debe tenerse en cuenta al planificar recursos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas declarados; no hay validacion comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nif0/Qwen-Image-2.1-PE-i2i-heretic-mtp-w4a8
- Modelo base (fine-tune): https://huggingface.co/darrellbest/Qwen-Image-2.1-PE-I2I-Heretic
- Modelo de origen del prompt enhancer: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Modelo de origen del cabezal MTP: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen-Image-2.1 en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Qwen Image 2.1 INT4 (W4A8)/INT6 (W6A8) en Civitai: https://civitai.com/models/2951557/qwen-image-21-int4w4a8int6w6a8
- Ficha de Qwen-Image-2.1-PE-I2I en AI Indigo: https://aiindigo.com/tool/qwen-image-21-pe-i2i
