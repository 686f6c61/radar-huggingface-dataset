# MisterSnowCrash/sdxl-tile-decoders

## Resumen

SDXL tile decoders es un repositorio de pesos Core ML que contiene dos decodificadores VAE compilados para Stable Diffusion XL, empaquetados como ficheros `.mlmodelc` con pesos en FLOAT32 de aproximadamente 198 MB cada uno. No es un modelo generativo completo: son exclusivamente decodificadores de VAE que transforman latentes de 56 x 56 (equivalentes a una salida de 448 px) en imagen, y estan pensados para decodificar una imagen SDXL por baldosas solapadas en dispositivos que no pueden decodificar la imagen completa de una sola vez.

El repositorio lo publica el usuario MisterSnowCrash y deriva de dos VAEs de terceros: DreamShaper XL Turbo de Lykon y RealVisXL V5.0 de SG161222. Ambos se distribuyen como conversiones Core ML bajo la licencia CreativeML Open RAIL++-M, con las restricciones de uso que esta impone.

Su relevancia es practica y acotada: permite ejecutar la fase de decodificacion de SDXL en hardware Apple (Core ML) con memoria limitada, troceando el latente en regiones de 56 x 56 y recomponiendo la imagen con solapamiento. No incluye prompt, codificador de texto ni UNet, por lo que no genera imagenes por si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador VAE de Stable Diffusion XL convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | FLOAT32 (unica precision publicada) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CreativeML Open RAIL++-M (identificador `creativeml-openrail-m-plus-plus`) |
| Formato de pesos | Core ML compilado (`.mlmodelc`) |
| Tamano de cada fichero | ~198 MB |
| Tamano del repo | 0.4 GB |
| Resolucion de entrada | latente fijo de 56 x 56 |
| Resolucion de salida | 448 px por baldosa |
| VAEs de origen | DreamShaper XL Turbo (Lykon), RealVisXL V5.0 (SG161222) |

## Arquitectura y entrenamiento

Cada fichero es una conversion del decodificador VAE de un modelo SDXL existente a formato Core ML compilado, con pesos en FLOAT32. La arquitectura subyacente es la del VAE de SDXL (decodificador convolucional que expande el latente a pixeles), pero el artefacto publicado no entrena nada nuevo: es una conversion de inferencia. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO, porque el autor no entrena el modelo, solo convierte los pesos de terceros.

La innovacion tecnica es el troceado: el decodificador opera sobre un latente fijo de 56 x 56 (448 px de salida) y la imagen completa se reconstruye decodificando baldosas solapadas. Esto reduce el pico de memoria necesario para la decodificacion, a costa de un procesamiento por regiones y de la necesidad de gestionar el solapamiento para evitar costuras. No se documentan optimizaciones adicionales como atencion lineal, decodificacion especulativa ni cuantizacion.

## Capacidades

- Decodificacion de latentes SDXL de 56 x 56 a imagenes de 448 px.
- Decodificacion por baldosas solapadas para imagenes de mayor resolucion en dispositivos con memoria limitada.
- Ejecucion en Core ML sobre hardware Apple.
- Dos variantes de VAE seleccionables (DreamShaper XL Turbo y RealVisXL V5.0).
- No incluye codificador de texto, UNet ni pipeline de generacion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de procesamiento de texto.
- No dispone de modo thinking, vision, audio ni otras capacidades especiales.

## Casos de uso

- Decodificacion de imagenes SDXL en Mac con memoria unificada limitada: el troceado en baldosas de 56 x 56 permite decodificar latentes que no cabrian de una vez en memoria, usando Core ML como backend.
- Integracion en apps iOS o macOS que ya ejecutan el UNet y el codificador de texto de SDXL y necesitan un decodificador VAE compatible con Core ML.
- Seleccion de estilo de VAE en produccion: la variante DreamShaper XL Turbo y la RealVisXL V5.0 permiten comparar acabados visuales sin cambiar el resto del pipeline.
- Procesamiento por lotes en dispositivos Apple de gama media: al fijar la resolucion de baldosa, el consumo de memoria es predecible y facilita el encolado de trabajos.
- Prototipado de pipelines de difusion en Core ML: sirve como pieza de referencia para validar la interoperabilidad entre latentes generados por otros componentes y un decodificador compilado.
- Reconstruccion de imagenes de alta resolucion por mosaico: al decodificar regiones solapadas se pueden componer salidas mayores que 448 px gestionando el solapamiento entre baldosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; cada fichero pesa ~198 MB en FLOAT32 y el pico de memoria depende del tamano de la imagen y del solapamiento entre baldosas.
- GPU recomendadas: no disponible; el artefacto es Core ML, orientado a hardware Apple (CPU, GPU y Neural Engine segun el dispositivo).
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para CUDA ni para GPUs NVIDIA.
- Opciones de despliegue: Core ML (`.mlmodelc`) en macOS e iOS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un decodificador VAE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXL tile decoders (este repo) | Decodificador VAE SDXL troceado | Core ML (`.mlmodelc`) | FLOAT32 | CreativeML Open RAIL++-M | HuggingFace |
| VAE original de SDXL | Decodificador VAE SDXL completo | safetensors / diffusers | fp16, fp32 | CreativeML Open RAIL++-M | HuggingFace (stabilityai) |
| VAE de DreamShaper XL Turbo | Decodificador VAE SDXL completo | safetensors | fp16 | CreativeML Open RAIL++-M | HuggingFace (Lykon) |
| VAE de RealVisXL V5.0 | Decodificador VAE SDXL completo | safetensors | fp16 | CreativeML Open RAIL++-M | HuggingFace (SG161222) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: sin UNet ni codificador de texto no produce imagenes por si mismo.
- Resolucion de baldosa fija de 56 x 56 latentes (448 px); no admite otras resoluciones de entrada sin reconversion.
- Solo se publican pesos en FLOAT32, lo que limita el ahorro de memoria frente a variantes fp16.
- La decodificacion por baldosas puede introducir costuras o artefactos en las zonas de solapamiento si no se gestiona correctamente.
- Licencia CreativeML Open RAIL++-M: impone restricciones de uso (Attachment A) y requiere revisar `LICENSE` y `NOTICE.md` antes de un uso comercial.
- Al derivar de DreamShaper XL Turbo y RealVisXL V5.0, hereda las condiciones de sus autores originales.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque el artefacto no procesa texto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria documentada.
- No se especifican requisitos minimos de hardware Apple ni versiones de sistema compatibles.

## Enlaces

- HuggingFace: https://huggingface.co/MisterSnowCrash/sdxl-tile-decoders
- DreamShaper XL Turbo (Lykon): no disponible en la informacion proporcionada
- RealVisXL V5.0 (SG161222): no disponible en la informacion proporcionada
- Licencia CreativeML Open RAIL++-M: no disponible enlace directo en la informacion proporcionada (referenciada como `LICENSE` en el repo)
- Documentacion de Core ML: no disponible en la informacion proporcionada
