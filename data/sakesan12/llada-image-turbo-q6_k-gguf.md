# sakesan12/LLaDA-Image-Turbo-q6_K-GGUF

## Resumen

El modelo `sakesan12/LLaDA-Image-Turbo-q6_K-GGUF` es una cuantizacion en formato GGUF del modelo **LLaDA-Image-Turbo** de inclusionAI, un modelo de generacion y edicion de imagenes de 6000 millones de parametros basado en un Diffusion Transformer (DiT). La version original en BF16 ocupa 12,2 GB, lo que la hace inutilizable en tarjetas graficas de 6 GB; esta cuantizacion q6_K reduce el peso a 5,0 GB manteniendo una fidelidad cercana a BF16, permitiendo su ejecucion en equipos con VRAM limitada mediante el uso de segmentacion de grafo y descarga parcial.

El modelo es un derivado no oficial creado por sakesan12 y se distribuye bajo licencia Apache-2.0. Esta pensado para el motor de difusion `pig` de la libreria `ggk`, y no incluye los componentes auxiliares necesarios (text encoder, adapter y VAE), que deben obtenerse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) |
| Parametros totales | 6000 millones (6B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q6_K, nvfp4 (mencionado en la comparativa) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

LLaDA-Image-Turbo es un modelo de 6000 millones de parametros basado en un Diffusion Transformer (DiT) entrenado desde cero, emparejado con un modulo congelado de comprension visual construido sobre el backbone de lenguaje difusion LLaDA2.0-Mini. Segun el paper [2609.03796](https://arxiv.org/abs/2609.03796), el entrenamiento no depende inicialmente de grandes cantidades de pares imagen-texto, sino que construye un fuerte prior generativo visual mediante pre-entrenamiento y mid-entrenamiento con datos de solo imagen.

La variante **Turbo** es una version destilada que genera imagenes en **4 pasos** con `cfg-scale 1.0`. El modelo conserva la estructura original de tensores: 335 tensores, 36 proyecciones `to_q` separadas y sin `qkv` fusionado. La cuantizacion se aplica solo a tensores de rango 2 o superior; los tensores unidimensionales (normas, sesgos y tokens de relleno) se mantienen en precision original, siguiendo la convencion de llama.cpp y stable-diffusion.cpp.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con 4 pasos de muestreo.
- Edicion de imagenes basada en instrucciones, preservando la composicion de la fuente.
- Soporte de resoluciones de 1024x1024 y multiplos de 16 (o 32 al editar con `--ref-image`).
- Ejecucion en soluciones con VRAM reducida gracias a la descarga de pesos por segmentos (`--max-vram`).
- Integracion con el motor de difusion `pig` de la libreria `ggk`.
- Compatible con cuantizacion GGUF y cargado mediante el motor sin necesidad de sello `general.architecture`.
- Capacidad para usar el algoritmo de muestreo Euler con `diffusion-fa` y `vae-tiling`.

## Casos de uso

- **Generacion de conceptos artisticos en equipos modestos**: un ilustrador con una GPU de 6 GB puede crear imagenes a 1024x1024 en unos 32 segundos de muestreo usando la cuantizacion q6_K, algo inviable con los pesos BF16 originales.
- **Edicion de fotografias mediante instrucciones**: se puede transformar una imagen existente ("conviertela en una pintura de acuarela") manteniendo la composicion, util en flujos de trabajo de retoque local sin depender de servicios en la nube.
- **Prototipado rapido de contenido visual en produccion**: al requerir solo 4 pasos y soportar `--offload-to-cpu`, el modelo puede integrarse en pipelines de generacion por lotes con restricciones de memoria.
- **Despliegue en entornos con GPU de gama baja**: el uso de `--max-vram 4`, `--vae-tiling` y `--backend te=cpu` permite ejecutar el modelo en tarjetas como una RTX 4050 Laptop, ampliando el acceso a la generacion de imagenes a desarrolladores sin hardware de alta gama.
- **Investigacion en cuantizacion de modelos de difusion**: los desarrolladores pueden comparar la calidad de cuantizaciones intermedias (q6_K frente a 4-bit) y el comportamiento del motor `pig` en tareas de text-to-image.
- **Generacion de contenido para aplicaciones locales**: el modelo puede usarse en herramientas de escritorio que requieran inferencia sin conexion y con tolerancia a una VRAM aproximada de 3,6 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6 GB en configuraciones con descarga parcial y VAE tiling.
- GPU recomendada: RTX 4050 Laptop (6 GB) como referencia minima; funciona mejor con GPUs de al menos 6 GB.
- Cabe en GPU de consumo: si, en tarjetas de 6 GB con los flags adecuados (`--max-vram`, `--vae-tiling`, `--backend te=cpu`).
- Opciones de despliegue: motor `pig` de la libreria `ggk`; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia estimada: 32 segundos de muestreo y 6 segundos de decodificacion a 1024x1024 en RTX 4050 Laptop.

## Comparativa con modelos similares

| Parametro | LLaDA-Image-Turbo BF16 | LLaDA-Image-Turbo q6_K (este modelo) | LLaDA-Image-Turbo nvfp4 |
|---|---|---|---|
| Tamano del archivo | 12,2 GB | 5,0 GB | 3,5 GB |
| Fits en 6 GB | no | en segmentos | si |
| Precision | BF16 | q6_K | nvfp4 (4-bit) |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Formato | Safetensors | GGUF | GGUF (presumiblemente) |

## Limitaciones y advertencias

- El modelo es debil en el binding de colores entre dos sujetos distintos.
- La disposicion espacial de los elementos suele ser imprecisa.
- No es capaz de renderizar texto legible de forma fiable.
- Los prompts mas largos no corrigen estas carencias.
- Es una derivacion cuantizada no oficial; no esta afiliada a inclusionAI.
- Requiere el text encoder, adapter y VAE de otros repositorios (`gguf-org/llada-image-gguf` y `gguf-org/pig-clip`).
- La latencia y el consumo de VRAM dependen en gran medida de la GPU y los flags empleados.
- No hay benchmarks publicados que permitan evaluar su calidad frente a otros modelos de generacion de imagenes.
- El modelo esta pensado para 4 pasos con CFG 1.0; aumentar cualquiera de los dos empeora los resultados.

## Enlaces

- Modelo en HuggingFace: [sakesan12/LLaDA-Image-Turbo-q6_K-GGUF](https://huggingface.co/sakesan12/LLaDA-Image-Turbo-q6_K-GGUF)
- Repositorio oficial: [inclusionAI/LLaDA-Image](https://github.com/inclusionAI/LLaDA-Image)
- Paper de LLaDA-Image: [arXiv:2609.03796](https://arxiv.org/abs/2609.03796)
- Componentes auxiliares: [gguf-org/llada-image-gguf](https://huggingface.co/gguf-org/llada-image-gguf)
- Text encoder auxiliar: [gguf-org/pig-clip](https://huggingface.co/gguf-org/pig-clip)
