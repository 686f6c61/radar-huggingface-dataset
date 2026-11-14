# audenvenn/h3metal-flux2-klein-4b

## Resumen

h3metal-flux2-klein-4b es una conversion del modelo de generacion de imagenes FLUX.2 [klein] 4B de Black Forest Labs al formato propietario del motor de inferencia h3metal, desarrollado por audenvenn. No se trata de un modelo nuevo, sino de una cuantizacion a int8 empaquetada especificamente para ejecutarse sobre las unidades matriciales de las GPU Apple de clase M5 y M6, lo que permite generar imagenes con un modelo de difusion de 4B parametros en un Mac sin depender de CUDA ni de GPUs dedicadas.

El paquete incluye el transformer de difusion (DiT) cuantizado a int8 con rotacion de Hadamard y cuantizacion por fila de las activaciones, el codificador de texto Qwen3-4B tambien en int8 y el VAE en float32, sumando 8,3 GB en total. El motor h3metal es de codigo abierto bajo Apache-2.0 y mapea el archivo del transformer en memoria en lugar de copiarlo, lo que reduce el consumo a unos 7 GB para generar una imagen de 1024 x 1024.

Su relevancia es practica: demuestra que un pipeline text-to-image de ultima generacion puede correr en hardware consumer de Apple Silicon con latencias competitivas (7,4 s por imagen de 1024 x 1024 en un Mac mini M6 de 24 GB, 2,3 veces mas rapido que mflux 0.24 con sus propios pesos de 8 bits) y con una fidelidad numerica verificada frente a diffusers en bfloat16 (38,5 dB de PSNR, SSIM 0,995 en transformer y decoder).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) FLUX.2 [klein] 4B con codificador de texto Qwen3-4B y VAE |
| Parametros totales | 4B (modelo base FLUX.2 [klein] 4B); desglose por componente no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (pipeline text-to-image; se menciona padding de 512 tokens en el prompt) |
| Tipos de cuantizacion | int8 en transformer y text encoder; float32 en VAE |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.h3m` propietario de h3metal (dit.h3m, te.h3m, vae.h3m) mas `tokenizer.json`; no compatible con diffusers |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 [klein] 4B, un transformer de difusion de 4B parametros de Black Forest Labs para generacion de imagenes a partir de texto. Esta ficha cubre la conversion a h3metal, no el entrenamiento original: no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de esta version esta en la cuantizacion y el runtime. Los pesos de bloques del transformer se almacenan en int8 y las activaciones se cuantizan a int8 por fila tras aplicar una rotacion de Hadamard, una tecnica que reparte los valores atipicos entre canales para reducir el error de cuantizacion. El motor aplica los adaptadores LoRA directamente como terminos de rango bajo dentro de sus productos int8, sin descomprimir los pesos. El transformer se mapea en memoria (memory-mapped) en lugar de copiarse, y el VAE se mantiene en float32 para preservar la calidad de reconstruccion. La conversion es determinista: ejecutar `h3metal convert` sobre el checkpoint original produce los mismos bytes que el repositorio publicado, y la etiqueta git `h3m-1` fija el layout.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resoluciones como 1536 x 1024 y 1024 x 1024.
- Edicion de imagenes guiada por prompt (image-to-image): el ejemplo de la model card transforma una foto existente con la instruccion "Make it a sunny afternoon".
- Generacion en cuatro pasos de muestreo.
- Aplicacion de adaptadores LoRA con fuerza configurable (`--lora FILE[:STRENGTH]`), en layouts de diffusers, kohya o checkpoint original.
- Uso de imagenes de referencia a traves del codificador del VAE.
- Salida en PNG con marca de agua indicando que la imagen es generada por IA.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas.

## Casos de uso

- Generacion de ilustraciones y concept art en estaciones de trabajo Mac: el modelo produce imagenes de 1024 x 1024 en 7,4 s en un Mac mini M6, lo que permite iterar sobre prompts en un flujo de trabajo local sin GPU dedicada.
- Edicion fotografica asistida por prompt: partiendo de una foto (`-i photo.png`) y una instruccion de cambio de iluminacion o ambiente, el modelo regenera la escena conservando la composicion gracias al codificador del VAE.
- Prototipado rapido de assets para interfaces y videojuegos: la generacion en cuatro pasos y la resolucion configurable permiten producir variantes de un mismo concepto en segundos dentro de un pipeline de diseno.
- Personalizacion de estilo mediante LoRA: un estudio puede entrenar un adaptador con su estilo visual y aplicarlo en inferencia sobre los pesos int8 sin recompilar ni reconvertir el modelo.
- Creacion de contenido para marketing en local: al ejecutarse integramente en el Mac, los materiales y prompts no salen del equipo, lo que encaja con flujos con requisitos de confidencialidad.
- Investigacion en cuantizacion y eficiencia: el paquete sirve como referencia reproducible para medir el impacto de int8 con rotacion de Hadamard y cuantizacion por fila frente a bfloat16 en un pipeline de difusion completo.
- Generacion por lotes en equipos Apple Silicon: al mapear el transformer en memoria y usar unos 7 GB en total a 1024 x 1024, caben ejecuciones concurrentes o en segundo plano en Macs de 24 GB o mas.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tiempo por imagen 1024 x 1024 | 7,4 s | Mac mini M6, 24 GB; cuatro pasos; de lanzamiento a PNG |
| Aceleracion frente a mflux 0.24 | 2,3x | Misma maquina, pesos de 8 bits de mflux |
| PSNR frente a diffusers bfloat16 | 38,5 dB | Mismos embeddings de texto; transformer y decoder |
| SSIM frente a diffusers bfloat16 | 0,995 | Mismos embeddings de texto; transformer y decoder |
| Memoria en inferencia 1024 x 1024 | ~7 GB | 4,5 GB del transformer mapeados + 2,2 GB adicionales |

No se han publicado resultados de benchmarks estandar (FID, CLIP score, MMLU u otros) en la informacion disponible. La model card advierte que el pipeline completo obtiene una fidelidad inferior frente a la ejecucion en bfloat16 de diffusers, atribuido a la fragilidad del padding de 512 tokens del prompt ante cualquier redondeo.

## Requisitos de hardware

- GPU: exclusivamente Apple Silicon de clase M5 o M6 (se ejecuta sobre sus unidades matriciales); no hay soporte para NVIDIA, AMD ni GPU Apple de generaciones anteriores segun la informacion disponible.
- Sistema operativo: macOS 26; Python 3.10 o superior; h3metal 0.5.1 o posterior.
- Memoria: aproximadamente 7 GB a 1024 x 1024 (4,5 GB del transformer mapeados mas 2,2 GB adicionales); el repositorio completo ocupa 8,3 GB en disco.
- Cabe en Macs consumer con 24 GB de memoria unificada, como el Mac mini M6 citado en las mediciones.
- Despliegue: unicamente mediante el motor h3metal (rueda de Python `h3metal-0.5.1-py3-none-macosx_26_0_arm64.whl`) con los comandos `h3metal download` y `h3metal generate`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni diffusers.
- Latencia: 7,4 s por imagen de 1024 x 1024 en Mac mini M6 con cuatro pasos. No se documenta throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| h3metal-flux2-klein-4b | 4B (base FLUX.2 [klein] 4B) | 1024 x 1024 y 1536 x 1024 en los ejemplos; contexto no disponible | 7,4 s/imagen en Mac mini M6; 38,5 dB PSNR frente a diffusers bfloat16 | Apache-2.0 | Solo macOS 26 con GPU M5/M6 via h3metal |
| FLUX.2 [klein] 4B (original) | 4B | no disponible en la informacion proporcionada | no disponible | Apache-2.0 | Hugging Face; requiere diffusers u otro runtime compatible |
| mflux 0.24 con pesos de 8 bits | no disponible | no disponible | 2,3 veces mas lento que h3metal en Mac mini M6 | no disponible | Runtime para Apple Silicon |

La comparacion con otros modelos de difusion de tamano similar (por ejemplo, variantes de FLUX.1 o SD3) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor h3metal: los archivos `.h3m` no cargan en diffusers ni en otras librerias, lo que ata el uso a una unica implementacion mantenida por un solo autor.
- Requisito de hardware muy restrictivo: solo GPU Apple de clase M5 y M6 con macOS 26; queda fuera cualquier equipo NVIDIA, AMD o Mac anterior.
- Fidelidad inferior a bfloat16 en el pipeline completo: aunque transformer y decoder alcanzan 38,5 dB de PSNR, la model card reconoce que la ejecucion completa se desvia mas de diffusers por la fragilidad del padding de 512 tokens del prompt ante redondeos.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion; no se documentan sesgos especificos ni evaluaciones de sesgo en la informacion disponible.
- Idiomas soportados no documentados; el codificador de texto es Qwen3-4B, pero no se detalla cobertura multilingue del pipeline.
- Advertencia de contenido: las imagenes son generadas por IA y el motor inserta un aviso en cada PNG; conviene verificar obligaciones de transparencia en el uso publicado.
- Licencia Apache-2.0, igual que los pesos originales, con un archivo NOTICE que lista los cambios; no se documentan restricciones adicionales para uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta y creado y actualizado el mismo dia, lo que sugiere una publicacion muy reciente y sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audenvenn/h3metal-flux2-klein-4b
- Modelo base FLUX.2 [klein] 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio del motor h3metal: https://github.com/audenvenn/h3metal
- Documentacion de LoRA en h3metal: https://github.com/audenvenn/h3metal/blob/main/docs/lora.md
- Documentacion y mediciones de FLUX.2 en h3metal: https://github.com/audenvenn/h3metal/blob/main/docs/flux2.md
- Rueda de instalacion h3metal 0.5.1: https://github.com/audenvenn/h3metal/releases/download/v0.5.1/h3metal-0.5.1-py3-none-macosx_26_0_arm64.whl
