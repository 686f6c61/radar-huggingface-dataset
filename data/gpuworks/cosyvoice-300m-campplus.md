# gpuworks/CosyVoice-300M-campplus

## Resumen

`gpuworks/CosyVoice-300M-campplus` no es un modelo generativo completo, sino un repositorio auxiliar que contiene un unico fichero: el codificador de hablante (speaker encoder) CampPlus en formato ONNX extraido del checkpoint CosyVoice-300M de FunAudioLLM. El fichero `campplus.onnx` se copia sin modificaciones desde la revision `24c40509c3c5ea6fe06b5f8790ff99e3714a6bee` del repositorio original, con un tamano de 28 303 423 bytes y un sha256 documentado para verificacion de integridad.

El proposito es operativo: el pipeline de clonacion de voz GLM-TTS implementado en vLLM-Omni requiere este speaker encoder, pero el checkpoint de GLM-TTS no lo incluye. Publicar el fichero aislado evita descargar los varios GB del checkpoint completo de CosyVoice-300M solo para obtener un componente de 28 MB.

Por tanto, este repositorio debe tratarse como una dependencia de despliegue, no como un modelo evaluable de forma autonoma. No tiene pipeline declarado en HuggingFace, no publica idiomas soportados y no ofrece benchmarks propios; su relevancia es la de simplificar el aprovisionamiento de inferencia en entornos de TTS con clonacion de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CampPlus (speaker encoder basado en red neuronal para extraccion de embeddings de hablante); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | no disponible (el fichero ONNX pesa 28 303 423 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuye como grafo ONNX ya exportado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`campplus.onnx`) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente el fichero `campplus.onnx`, un speaker encoder CampPlus exportado a ONNX. Su funcion en el pipeline de CosyVoice-300M y de GLM-TTS es convertir una muestra de audio de referencia en un embedding de hablante que condiciona la sintesis, lo que habilita la clonacion de voz zero-shot. No se dispone de informacion sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens de audio procesados ni si se aplicaron tecnicas de RLHF o DPO; esos detalles pertenecen al modelo original CosyVoice-300M y no se reproducen en esta model card.

La innovacion practica del repositorio es de empaquetado: se aisla un artefacto de 28 MB con hash sha256 verificado (`a6ac6a63997761ae2997373e2ee1c47040854b4b759ea41ec48e4e42df0f4d73`), copiado sin cambios desde la revision `24c40509c3c5ea6fe06b5f8790ff99e3714a6bee` en HuggingFace y `391a8a191a07f80a947276b66095a68757d08189` en ModelScope (`iic/CosyVoice-300M`). No hay reentrenamiento, cuantizacion adicional ni modificacion del grafo.

## Capacidades

- Extraccion de embeddings de hablante a partir de audio de referencia, en formato ONNX.
- Integracion como componente de clonacion de voz en pipelines TTS, concretamente en GLM-TTS sobre vLLM-Omni.
- Ejecucion mediante runtime ONNX, sin dependencia de frameworks de deep learning completos.
- Verificacion de integridad mediante sha256 publicado.
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues propias; el comportamiento linguistico depende del modelo TTS que consuma el embedding.

## Casos de uso

- Despliegue de GLM-TTS en vLLM-Omni: se descarga este repositorio de 28 MB en lugar del checkpoint completo de CosyVoice-300M (varios GB) para satisfacer la dependencia del speaker encoder, reduciendo el tiempo de aprovisionamiento y el consumo de almacenamiento en la imagen de contenedor.
- Clonacion de voz zero-shot en produccion: el embedding extraido del audio de referencia condiciona la sintesis para reproducir el timbre del hablante, lo que permite generar locuciones personalizadas sin reentrenar el modelo TTS.
- Verificacion de cadena de suministro: el sha256 publicado permite validar en CI que el fichero descargado coincide byte a byte con el artefacto auditado, util en entornos con requisitos de procedencia de artefactos.
- Pipelines de sintesis por lotes: al ser un grafo ONNX, puede ejecutarse con ONNX Runtime en CPU o GPU dentro de un servicio de generacion de audio por lotes, calculando embeddings de referencia una sola vez y reutilizandolos en multiples sintesis.
- Personalizacion de asistentes de voz: integrado en un TTS con clonacion, permite que un asistente conversacional mantenga una voz consistente definida por una muestra de audio del usuario o de un locutor autorizado.
- Investigacion en reconocimiento y verificacion de hablante: el encoder puede reutilizarse para obtener representaciones de hablante y comparar similitudes entre muestras en experimentos de diarizacion o validacion de identidad vocal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto pesa 28 MB, por lo que la huella de pesos es reducida, pero no se documenta el consumo en runtime.
- GPU recomendadas: no disponibles; al ejecutarse via ONNX Runtime puede correr en CPU y en GPU compatibles con los execution providers de ONNX.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del fichero, aunque no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: ONNX Runtime; en el contexto descrito, como dependencia de vLLM-Omni para GLM-TTS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpuworks/CosyVoice-300M-campplus | Speaker encoder ONNX aislado | 28 303 423 bytes (fichero) | no disponible | Apache 2.0 | HuggingFace |
| FunAudioLLM/CosyVoice-300M | Modelo TTS completo con speaker encoder incluido | varios GB (checkpoint completo) | no disponible | Apache 2.0 | HuggingFace, ModelScope |
| GLM-TTS | Modelo TTS con clonacion de voz | no disponible | no disponible | no disponible | Requiere este encoder en vLLM-Omni |

La diferencia relevante frente a CosyVoice-300M es de empaquetado, no de capacidad: este repositorio contiene un unico componente del modelo original, sin modificaciones. Frente a GLM-TTS, no es una alternativa sino una dependencia.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo TTS consumidor no produce ninguna salida util.
- No se documentan sesgos del encoder; al derivar de CosyVoice-300M, hereda las caracteristicas de sus datos de entrenamiento, no detalladas aqui.
- Riesgo de alucinacion no aplica en el sentido generativo, pero un embedding de baja calidad (audio de referencia ruidoso o corto) puede degradar la fidelidad de la clonacion en el TTS que lo consuma.
- No se declaran idiomas soportados; la cobertura linguistica depende del pipeline TTS completo.
- Licencia Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribucion del proyecto original FunAudioLLM/CosyVoice-300M.
- La fecha de creacion del repositorio indicada en los metadatos es 2026-11-03, posterior a la fecha actual; conviene verificar la procedencia y el hash antes de usarlo en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria; la unica garantia de integridad es el sha256 publicado.
- Uso de clonacion de voz: requiere consentimiento explicito del hablante cuya muestra se utilice, por implicaciones legales y eticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gpuworks/CosyVoice-300M-campplus
- Modelo original en HuggingFace: https://huggingface.co/FunAudioLLM/CosyVoice-300M
- Modelo original en ModelScope: https://modelscope.cn/models/iic/CosyVoice-300M
- Revision de referencia en HuggingFace: `24c40509c3c5ea6fe06b5f8790ff99e3714a6bee`
- Revision de referencia en ModelScope: `391a8a191a07f80a947276b66095a68757d08189`
