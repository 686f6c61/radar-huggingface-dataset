# DanielMarius/dms-rivagan-watermark-onnx

## Resumen

RivaGAN Watermark ONNX Pair es un par de redes neuronales en formato ONNX que implementan un esquema de marca de agua invisible para imagenes. El repositorio, publicado por el usuario DanielMarius, es una copia de seguridad byte a byte de los ficheros `rivagan_encoder.onnx` y `rivagan_decoder.onnx` empleados por el paquete `invisible-watermark==0.2.0` en un entorno de entrenamiento Kohya. No se trata de un modelo generativo ni de un checkpoint de difusion, sino de un backend de watermarking opcional.

El modelo original procede de la investigacion RivaGAN (DAI-Lab) y su empaquetado y exportacion a ONNX corre a cargo del proyecto ShieldMnt/invisible-watermark. El encoder incrusta una marca de agua de 32 bits en una imagen y el decoder la extrae. Ambos ficheros deben usarse conjuntamente y conservar sus nombres originales al restaurarlos en las rutas de assets del paquete.

La relevancia de este repositorio es acotada: sirve como respaldo verificable (con coincidencia SHA-256 respecto a los ficheros upstream fijados a un commit concreto) para entornos que dependen de `imwatermark` y necesitan reconstruir el paquete. La licencia de los pesos figura como desconocida, lo que limita su uso comercial sin una revision juridica previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RivaGAN (red neuronal para watermarking invisible, encoder y decoder acoplados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible (no aplica, procesa imagenes) |
| Licencia | other / desconocida (license_name: unknown) |
| Formato de pesos | ONNX (`rivagan_encoder.onnx`, `rivagan_decoder.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RivaGAN, un diseno adversarial de dos redes: un encoder que aprende a incrustar una marca de 32 bits en la imagen y un decoder que aprende a recuperarla, entrenados de forma conjunta para que la perturbacion sea imperceptible. La exportacion a ONNX permite ejecutar ambos modulos mediante ONNX Runtime o a traves del paquete `imwatermark`.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento, el uso de RLHF/DPO ni innovaciones adicionales mas alla de la propia formulacion GAN del watermarking. El autor del repositorio indica que los ficheros se corresponden con el commit upstream `68d0376d94a4701ed240af0841ec12e00676e325` y que se verifico la coincidencia SHA-256 con los ficheros fijados de origen.

## Capacidades

- Incrustacion de una marca de agua invisible de 32 bits en imagenes mediante el encoder.
- Extraccion de la marca de agua mediante el decoder, con la misma longitud de 32 bits.
- Integracion con el paquete `imwatermark` (`WatermarkEncoder` / `WatermarkDecoder`) o implementacion directa del preprocesado documentado con ONNX Runtime.
- Uso como backend opcional de watermarking en pipelines de generacion de imagenes (por ejemplo, entornos Kohya).
- No genera imagenes, no realiza tareas de vision general, no soporta tool calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues ni de modo de pensamiento.

## Casos de uso

- Marcado de imagenes generadas en pipelines de difusion: se incrusta una marca de 32 bits antes de publicar la imagen, de modo que pueda verificarse su procedencia con el decoder.
- Trazabilidad de assets en entornos de entrenamiento: restaurar los ficheros en las rutas esperadas por `imwatermark` para que las tareas de Kohya que dependen del watermarking sigan funcionando.
- Verificacion de integridad de un paquete: comparar los SHA-256 de los ficheros restaurados con los del commit upstream fijado antes de desplegar.
- Auditoria de contenido en repositorios internos: aplicar el decoder a imagenes almacenadas para comprobar si portan una marca conocida.
- Respaldo reproducible en entornos aislados: usar este repositorio como fuente de los dos ONNX cuando no se dispone de acceso al paquete original o se quiere fijar una version concreta.
- Pruebas de robustez de watermarking: evaluar la tasa de recuperacion de la marca tras recompresion, recorte o redimensionado de la imagen, dado que el propio autor advierte que la recuperacion no esta garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser dos redes ONNX de watermarking, la huella es muy inferior a la de un modelo generativo, pero no se aportan cifras.
- GPU recomendadas: no disponible; el modelo puede ejecutarse en CPU mediante ONNX Runtime y, presumiblemente, en cualquier GPU consumer, aunque no se documenta.
- Cabe en GPU consumer: previsiblemente si, sin datos concretos de memoria.
- Opciones de despliegue: ONNX Runtime o el paquete `imwatermark` (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Marca de agua | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RivaGAN Watermark ONNX Pair (este repo) | Encoder/decoder RivaGAN | 32 bits | ONNX | other / desconocida | HuggingFace (respaldo) |
| invisible-watermark (paquete upstream) | Paquete con backend RivaGAN | 32 bits | Python + ONNX | MIT (software) | GitHub / PyPI |
| RivaGAN original (DAI-Lab) | Investigacion | 32 bits | TensorFlow | no disponible | GitHub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia de los pesos figura como desconocida; el autor senala que la licencia MIT del paquete no debe interpretarse como una concesion verificada sobre los pesos. El uso comercial requiere revision juridica.
- El backend esta etiquetado como experimental por el proyecto upstream y la recuperacion de la marca no esta garantizada.
- El encoder y el decoder deben usarse juntos y conservar los nombres originales; mezclar versiones o renombrar ficheros puede romper la compatibilidad.
- No es un modelo generativo: no produce imagenes ni texto, por lo que no debe evaluarse con criterios de calidad generativa.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque el modelo no procesa lenguaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de la comunidad.
- El ejemplo de uso de la model card no fue ejecutado durante la creacion del respaldo, segun indica el propio autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DanielMarius/dms-rivagan-watermark-onnx
- Licencia del repositorio: https://huggingface.co/DanielMarius/dms-rivagan-watermark-onnx/blob/main/LICENSE.txt
- Paquete y exportaciones ONNX (ShieldMnt/invisible-watermark): https://github.com/ShieldMnt/invisible-watermark
- Investigacion original (DAI-Lab/RivaGAN): https://github.com/DAI-Lab/RivaGAN
- Documentacion de la API del paquete: https://github.com/ShieldMnt/invisible-watermark/wiki/API
- Commit upstream fijado: `68d0376d94a4701ed240af0841ec12e00676e325`
