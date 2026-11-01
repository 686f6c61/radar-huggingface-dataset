# loom-fun/openbmb-MiniCPM-OCR-1.0-loom

## Resumen

`loom-fun/openbmb-MiniCPM-OCR-1.0-loom` es un paquete de distribucion para el runtime Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF `Q4_K_M` del modelo OCR `openbmb/MiniCPM-OCR-1.0-gguf` junto con programas `.loom` y una tarjeta `model.json` que permiten servirlo mediante `loom-serve` sobre GPUs AMD, en concreto sobre un Ryzen AI Max+ 395 "Strix Halo". El repositorio lo publica el usuario `loom-fun` bajo licencia Apache 2.0 y no incluye los pesos: estos se descargan aparte desde el repositorio original de OpenBMB.

El interes practico esta en que ofrece una via reproducible de desplegar un modelo OCR de MiniCPM en hardware AMD con aceleracion ROCm, con verificacion de integridad mediante `model.json.lock` y una API compatible con OpenAI en `/v1/chat/completions`. Para quien ya tenga un Strix Halo o un entorno AMD con el SDK Loom instalado, elimina el trabajo de empaquetado y de integracion del servidor.

La informacion publicada es muy limitada: no hay datos de arquitectura, parametros, contexto, idiomas ni benchmarks en la model card, y el repositorio ocupa 0.0 GB porque solo contiene los programas y la tarjeta. Todo lo relativo al modelo subyacente debe consultarse en el repositorio de OpenBMB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (corresponde al modelo base MiniCPM-OCR-1.0 de OpenBMB) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF), unica incluida en el paquete |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), descargados aparte; el repo solo contiene programas `.loom` y `model.json` |
| Modelo base | openbmb/MiniCPM-OCR-1.0-gguf |
| Runtime | Loom (`loom-serve`), dispositivo `amdgpu` |
| API expuesta | OpenAI-compatible `/v1/chat/completions` en `127.0.0.1:8080` |
| Hardware de generacion | AMD Ryzen AI Max+ 395 "Strix Halo" |
| Tamano del repositorio | 0.0 GB (sin pesos) |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura del modelo subyacente, los datos de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO. El paquete `loom` no modifica los pesos: la propia tarjeta indica que se trata del checkpoint GGUF "unmodified" de `openbmb/MiniCPM-OCR-1.0-gguf`, por lo que cualquier detalle arquitectonico debe obtenerse del repositorio de OpenBMB.

La innovacion tecnica de este repositorio es de empaquetado y despliegue, no de modelado. Se genero con el flujo `loom-skills` sobre un Ryzen AI Max+ 395, e incluye un fichero `model.json.lock` que permite a `loom-fetch` verificar la integridad de los programas y del GGUF descargado antes de servirlo. El resultado es un artefacto reproducible que arranca un servidor con API compatible con OpenAI sobre ROCm.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes, heredado del modelo base MiniCPM-OCR-1.0.
- Servicio de inferencia mediante API compatible con OpenAI (`/v1/chat/completions`), lo que facilita integrarlo con clientes y SDKs existentes.
- Despliegue verificado: `loom-fetch` comprueba los artefactos contra `model.json.lock` antes de materializarlos.
- Ejecucion en GPUs AMD mediante el backend `amdgpu` de Loom.
- Soporte de tool calling, agentes, vision general, audio, thinking mode o capacidades multilingues: no disponible en la informacion publicada.

## Casos de uso

- Digitalizacion de facturas y albaranes: enviar imagenes de documentos al endpoint `/v1/chat/completions` y recuperar el texto extraido para alimentar un ERP o un pipeline contable, aprovechando que el servidor habla el protocolo de OpenAI.
- Extraccion de texto en entornos con hardware AMD: equipos con Ryzen AI Max+ 395 o GPUs ROCm pueden servir el modelo sin depender de CUDA, usando `loom-serve --device=amdgpu`.
- Procesamiento por lotes de archivos escaneados: al ser un OCR servido localmente, se pueden recorrer directorios completos de PDFs e imagenes sin enviar datos a terceros.
- Cumplimiento y privacidad: al ejecutarse en local y no requerir servicios en la nube, es apto para digitalizar documentacion sensible (expedientes, historiales) dentro del perimetro de la organizacion.
- Reproducibilidad en CI: el flujo `loom-fetch` con `model.json.lock` permite fijar la version exacta del modelo y de los programas en un pipeline, de modo que las pruebas de regresion de OCR se ejecuten siempre contra el mismo artefacto.
- Prototipado rapido de aplicaciones OCR: arrancar el servidor con dos comandos y apuntar un cliente compatible con OpenAI permite validar un caso de uso en minutos sobre hardware de escritorio AMD.
- Indexacion de archivos historicos: convertir lotes de escaneos en texto para un motor de busqueda interno o un RAG, manteniendo los datos en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamano del modelo base, que no se especifica. Al servir una cuantizacion Q4_K_M, la huella sera la del GGUF correspondiente mas el overhead del runtime.
- GPU recomendadas: el paquete se genero y valido en un AMD Ryzen AI Max+ 395 "Strix Halo"; el backend es `amdgpu`, por lo que se orienta a GPUs AMD con ROCm.
- Compatibilidad con GPU de consumo: no confirmada para otras GPU; el unico hardware documentado es el Strix Halo.
- Opciones de despliegue: `loom-serve` del SDK Loom (`pip install "hrx-loom[hf]"`), con `loom-fetch` para materializar los artefactos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-fun/openbmb-MiniCPM-OCR-1.0-loom | no disponible | no disponible | GGUF Q4_K_M + programas `.loom` | Apache 2.0 | Paquete de despliegue para AMD Loom; sin pesos en el repo |
| openbmb/MiniCPM-OCR-1.0-gguf | no disponible | no disponible | GGUF | no disponible en esta ficha | Checkpoint original del que deriva este paquete |
| Otros modelos OCR open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene los pesos: sin ejecutar `loom-fetch` contra el repositorio de OpenBMB no hay modelo que servir.
- La model card no documenta sesgos, tasas de alucinacion ni limitaciones de idioma del modelo subyacente; deben consultarse en el repositorio original.
- El unico hardware validado es un Ryzen AI Max+ 395 "Strix Halo"; el rendimiento en otras GPUs AMD o en CUDA no esta documentado.
- Solo se distribuye la cuantizacion Q4_K_M; no hay alternativas de mayor o menor precision en este paquete.
- El servidor escucha en `127.0.0.1:8080` por defecto, es decir, solo en local; exponerlo en red requiere configuracion adicional no descrita.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se creo y actualizo el mismo dia (2026-10-29): no hay evidencia de uso en produccion.
- La licencia Apache 2.0 del paquete no garantiza por si sola los terminos del modelo base; conviene verificar la licencia del checkpoint de OpenBMB antes de un uso comercial.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/openbmb-MiniCPM-OCR-1.0-loom
- Modelo base en HuggingFace: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf
- SDK Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
