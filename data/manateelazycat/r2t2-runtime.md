# manateelazycat/r2t2-runtime

## Resumen

`manateelazycat/r2t2-runtime` no es un modelo de lenguaje en sentido estricto, sino un repositorio de artefactos de despliegue: archivos Docker para arquitectura ARM64 con el runtime de inferencia y las dependencias necesarias para ejecutar el modelo **Confucius4-R2T2** en dispositivos NVIDIA Jetson. Lo publica el desarrollador conocido como manateelazycat y está etiquetado con `jetson` y `speech-recognition`, lo que apunta a un caso de uso de reconocimiento de voz (probablemente speech-to-text multilingüe) sobre hardware embebido.

El punto clave es que este repositorio **no contiene los pesos del modelo**. Los pesos de Confucius4-R2T2 se descargan por separado desde `netease-youdao/Confucius4-R2T2` y se montan en modo de solo lectura dentro del contenedor. Por tanto, la ficha describe el paquete de runtime, no la arquitectura del modelo subyacente, de la que no se ofrece información en la model card.

Su relevancia actual es operativa: facilita el despliegue reproducible de un modelo de reconocimiento de voz en placas Jetson AGX Thor y AGX Orin mediante imágenes Docker verificables (tamaño y SHA256 publicados), con vLLM como motor de inferencia nativo y una API de un solo worker.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (runtime con componentes Apache-2.0 y dependencias de terceros con sus propias licencias; los pesos se rigen por `MODEL_LICENSE` del modelo descargado aparte) |
| Formato de pesos | no disponible (el repositorio contiene archivos Docker: `.tar.gz` y `.tar`) |

| Artefacto | Plataforma | Tamaño (bytes) | SHA256 |
|---|---|---:|---|
| `r2t2-thor-0.1.13.tar.gz` | Jetson AGX Thor | 1.068.376.784 | `c85ea494326e5e399549c30ff7f61bd20438fc058020029e390e9c8aa3442398` |
| `r2t2-orin-vllm-host-0.1.13.tar` | Jetson AGX Orin | 5.155.840.000 | `d8667f5ad7e956c1de7eb2ebe4991b9cf8608e919456a9e70b8957206ad54169` |

| Metadato del repositorio | Valor |
|---|---|
| ID | manateelazycat/r2t2-runtime |
| Tamaño del repo | 14,7 GB |
| Descargas | 0 |
| Likes | 0 |
| Pipeline | no disponible |
| Creado | 2026-10-01 |
| Actualizado | 2026-11-04 |

## Arquitectura y entrenamiento

La model card no aporta información sobre la arquitectura del modelo Confucius4-R2T2 (transformer, MoE, híbrido u otra), ni sobre datos de entrenamiento, número de tokens, composición del dataset o técnicas de alineación como RLHF o DPO. Tampoco se indica la innovación técnica del modelo subyacente.

Lo que sí documenta el repositorio es la arquitectura del runtime: imágenes Docker para ARM64 que se cargan con `docker load -i <archive>` y que incluyen el motor de inferencia y sus dependencias. En ambas plataformas se emplea **vLLM nativo** con un único worker de API. El modelo se monta desde un directorio externo de solo lectura, lo que separa los pesos de las imágenes y permite actualizar el runtime sin redistribuir el modelo. Se ofrece un `checksums.json` para verificar tamaño, SHA256 e identidad de la imagen.

## Capacidades

- Reconocimiento de voz (speech recognition): es la capacidad a la que apunta la etiqueta `speech-recognition` del repositorio.
- Despliegue en hardware embebido NVIDIA Jetson: AGX Thor y AGX Orin, sobre ARM64.
- Inferencia con vLLM nativo con un único worker de API HTTP.
- Verificación de integridad de artefactos mediante SHA256 y `checksums.json`.
- Separación de pesos y runtime: montaje de pesos en modo solo lectura.
- Generación de texto, razonamiento, código, tool calling, agentes o capacidades multimodales: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de voz en el borde (edge) sobre Jetson AGX Orin: el archivo `r2t2-orin-vllm-host-0.1.13.tar` (~5,16 GB) permite levantar el servicio de reconocimiento de voz directamente en la placa sin depender de conectividad ni de servidores externos.
- Reconocimiento de voz en robótica o dispositivos autónomos con Jetson AGX Thor: el archivo `r2t2-thor-0.1.13.tar.gz` (~1,07 GB) está pensado para la plataforma Thor, adecuada para asistentes de voz embebidos en robots o sistemas de interacción por voz.
- Despliegue reproducible en entornos de producción con verificación de integridad: el `checksums.json` y los SHA256 publicados permiten auditar las imágenes antes de desplegarlas en flotas de dispositivos.
- Actualización de runtime sin redistribuir pesos: al montar el modelo desde `netease-youdao/Confucius4-R2T2` en solo lectura, se puede cambiar la imagen del runtime (versión 0.1.13) manteniendo intactos los pesos y su licencia.
- Servicio de voz como API interna: el worker vLLM con API permite conectar clientes de transcripción (por ejemplo, aplicaciones de subtitulado o dictado) a un endpoint en la propia placa Jetson.
- Laboratorios de investigación en edge AI: plataforma lista para medir latencia y throughput del reconocimiento de voz en ARM64 con GPU integradas, comparando Thor frente a Orin.
- Cumplimiento de licencias heterogéneas: el aviso de que el código del AI Pod es Apache-2.0 mientras las dependencias de terceros conservan sus licencias y `MODEL_LICENSE` recoge los términos del modelo facilita la revisión legal en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataformas soportadas: NVIDIA Jetson AGX Thor y NVIDIA Jetson AGX Orin, arquitectura ARM64.
- Almacenamiento: el archivo de Thor ocupa 1.068.376.784 bytes (~1,07 GB) y el de Orin 5.155.840.000 bytes (~5,16 GB); a ello se suman los pesos de Confucius4-R2T2 descargados aparte. El repositorio completo ocupa 14,7 GB.
- Memoria unificada: no se especifica la memoria mínima requerida para el modelo; depende de los pesos descargados desde `netease-youdao/Confucius4-R2T2`, de los que no consta información en esta ficha.
- Despliegue: carga de imágenes con `docker load -i <archive>` y motor de inferencia vLLM nativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite comparar con otros runtimes de despliegue ni modelos de reconocimiento de voz comparables en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de lenguaje: contiene imágenes Docker del runtime; los pesos deben descargarse por separado desde `netease-youdao/Confucius4-R2T2`.
- No se documentan parámetros, contexto, idiomas, cuantizaciones ni arquitectura del modelo: cualquier decisión basada en rendimiento del modelo requiere consultar la ficha de `netease-youdao/Confucius4-R2T2`.
- Licencia `other`: el código del AI Pod es Apache-2.0, pero las dependencias de terceros dentro de las imágenes conservan sus propias licencias y `MODEL_LICENSE` registra los términos del modelo descargado; hay que revisar ambas antes de un uso comercial.
- Plataforma restringida a ARM64 y a NVIDIA Jetson AGX Thor y AGX Orin; no es utilizable en x86, GPU de escritorio o servidores convencionales.
- Riesgo de alucinación, sesgos y limitaciones de idioma del modelo subyacente: no disponibles en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes, sin validación comunitaria conocida; conviene verificar los SHA256 antes de desplegar.

## Enlaces

- HuggingFace del runtime: https://huggingface.co/manateelazycat/r2t2-runtime
- Pesos del modelo (referenciado en la model card): https://huggingface.co/netease-youdao/Confucius4-R2T2
