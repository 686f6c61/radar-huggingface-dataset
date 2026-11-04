# JoshHughes/p0pc0rn-clip-reader-f16

## Resumen

p0pc0rn-clip-reader-f16 es un componente de codificador VAE de vídeo derivado de Lightricks/LTX-2.3, convertido y reorganizado por el proyecto p0pc0rn (Joshua Hughes) para su uso dentro de una aplicación WebGPU que se ejecuta en el dispositivo. No se trata de un modelo generativo completo, sino de la mitad codificadora del VAE de LTX-2.3, extraída de los tensores `vae.*` del checkpoint original y adaptada para convertir clips de vídeo en fotogramas latentes que posteriormente consume SANA-Video 2.0 en el flujo de "restyling" de la aplicación.

La modificación respecto al original es sustancial en cuanto a formato: los pesos se han convertido a coma flotante de 16 bits (sin cuantización adicional), se han reorganizado para la convolución 3D propia de p0pc0rn, se ha rellenado `conv_in`, se ha recortado `conv_out` a sus canales medios y se han reescalado `down_blocks.3` y el bloque intermedio por un factor de 1/64. El resultado es un paquete de 638 MB en 5 fragmentos, empaquetado en el formato propietario `pocketflux.pack/1`, que solo puede leer el motor WebGPU de p0pc0rn.

Su relevancia es acotada pero interesante: demuestra un patrón de despliegue de componentes de modelos de vídeo de gran tamano en navegador mediante WebGPU, con verificación de integridad por sha256 a nivel de fragmento de 16 MiB y aceptación explícita de licencia antes de la descarga. No es un checkpoint interoperable con Transformers, Diffusers ni NeMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE convolucional 3D (mitad codificadora de LTX-2.3), causal en el tiempo |
| Parametros totales | no disponible (repo de 0,6 GB en f16, 5 fragmentos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 8k + 1 fotogramas, H y W multiplos de 32 |
| Tipos de cuantizacion | f16 (no cuantizado) |
| Idiomas soportados | no disponible (componente no linguistico) |
| Licencia | LTX-2 Community License Agreement |
| Formato de pesos | `pocketflux.pack/1` (manifest.json + fragmentos de 16 MiB con sha256); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El componente es la mitad codificadora del VAE de LTX-2.3, un autoencoder convolucional 3D con comportamiento causal en la dimension temporal. La entrada son 8k + 1 fotogramas con altura y anchura multiplos de 32, y la salida son fotogramas latentes. El autor no ha entrenado ni ajustado el modelo: la model card describe exclusivamente una conversion de formato y una reorganizacion de pesos, sin datos sobre el corpus de entrenamiento original, numero de tokens, composicion del dataset ni etapas de RLHF o DPO.

Las innovaciones tecnicas documentadas son de ingenieria de despliegue, no de modelado: conversion a f16, re-disposicion de tensores para la convolucion 3D del motor propio, relleno de `conv_in`, recorte de `conv_out` a los canales medios, reescalado de `down_blocks.3` y del bloque intermedio por 1/64, y un sistema de empaquetado con verificacion criptografica por fragmento. El sha256 del checkpoint Diffusers de origen es 425f0dfa227dee5d0ff3d9720563370810409a439c302ca74f0f944057ce55c5.

## Capacidades

- Codificacion de video a latentes: transforma clips de 8k + 1 fotogramas en fotogramas latentes consumibles por SANA-Video 2.0.
- Integracion en un pipeline de restyling de video dentro de la aplicacion p0pc0rn, junto con el LoRA `JoshHughes/p0pc0rn-video-lora-looks-c20`.
- Ejecucion en el dispositivo mediante WebGPU, sin dependencia de servidores remotos.
- Verificacion de integridad: comprobacion del `manifest.json` contra el sha256 incluido en la app y de cada fragmento de 16 MiB al descargarse.
- Gestion de licencias en la interfaz: muestra la licencia y exige aceptacion antes de la primera descarga.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Restyling de video en movil: la aplicacion captura o carga un clip, este codificador lo proyecta a latentes y SANA-Video 2.0 aplica el estilo del LoRA de looks; el componente es adecuado porque opera enteramente en el dispositivo con pesos f16 de 638 MB.
- Procesamiento de video sin conexion: al ejecutarse sobre WebGPU en el navegador, permite flujos de edicion de video en escenarios sin conectividad una vez descargado el paquete.
- Demostracion de despliegue WebGPU de componentes de modelos de video: sirve como referencia tecnica de como empaquetar, fragmentar y verificar un VAE de gran tamano para su ejecucion en navegador.
- Investigacion sobre reutilizacion de componentes: util para estudiar la extraccion y re-disposicion de subconjuntos de pesos de un checkpoint mayor (aqui, los tensores `vae.*` de LTX-2.3) sin reentrenar.
- Prototipado de pipelines video-a-video educativos o artisticos: el par codificador + SANA-Video 2.0 permite experimentar con transferencia de estilo temporal en un entorno controlado y con licencia aceptada explicitamente.
- Auditoria de integridad de artefactos: el esquema de manifest con sha256 por fragmento es un caso practico para disenar sistemas de distribucion de pesos verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete ocupa 638 MB en f16 y debe residir en memoria del dispositivo durante la inferencia, ademas de los latentes y del modelo SANA-Video 2.0 que consume su salida.
- GPU recomendadas: no disponibles; el autor no publica una lista de hardware validado.
- Compatibilidad con GPU de consumo: el destino declarado es WebGPU en telefonos, lo que implica que el componente esta pensado para ejecutarse en hardware movil con soporte WebGPU, sin que se detallen modelos concretos.
- Opciones de despliegue: exclusivamente el motor WebGPU de p0pc0rn; no es compatible con vLLM, llama.cpp, Ollama, TGI, Transformers ni Diffusers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Formato |
|---|---|---|---|---|---|
| p0pc0rn-clip-reader-f16 | Codificador VAE de video | no disponible (638 MB f16) | 8k + 1 fotogramas, H y W multiplos de 32 | LTX-2 Community License | `pocketflux.pack/1` |
| Lightricks/LTX-2.3 | Modelo de video completo | 22B (segun nombre del checkpoint `ltx-2.3-22b-dev.safetensors`) | no disponible | LTX-2 Community License | safetensors / Diffusers |
| VAE de LTX-2.3 (original) | Codificador-decodificador VAE | no disponible | no disponible | LTX-2 Community License | safetensors (Diffusers) |
| SANA-Video 2.0 | Modelo de video consumidor de latentes | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros codificadores VAE de video de terceros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo codifica video a latentes; requiere SANA-Video 2.0 y el LoRA de looks para producir resultados.
- Formato propietario: solo lo lee el motor WebGPU de p0pc0rn; no es utilizable en frameworks estandar.
- Restricciones de licencia: la LTX-2 Community License exige declarar que el contenido es generado por maquina al compartirlo, prohibe deepfakes y suplantacion sin consentimiento, y requiere licencia de pago a Lightricks para entidades con ingresos anuales de 10 millones de USD o mas.
- Sin licencia de marcas: no se licencia ninguna marca de Lightricks.
- Sin datos de sesgo ni de alucinacion: al no generar texto, las metricas habituales de sesgo linguistico no aplican, pero no se documenta ningun analisis de sesgo visual.
- Idiomas: no aplica ni se documenta soporte alguno.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sin benchmarks ni latencias publicadas: no hay evidencia cuantitativa de calidad de reconstruccion o de velocidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoshHughes/p0pc0rn-clip-reader-f16
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- LoRA de looks: https://huggingface.co/JoshHughes/p0pc0rn-video-lora-looks-c20
- Licencia LTX-2: https://huggingface.co/JoshHughes/p0pc0rn-clip-reader-f16/blob/main/LICENSE-LTX-2.txt
- Aplicacion p0pc0rn: https://artistjoshhughes.github.io/p0pc0rn/
- X oficial de la app: https://x.com/p0pc0rnapp
- X del autor: https://x.com/joshhughes___
