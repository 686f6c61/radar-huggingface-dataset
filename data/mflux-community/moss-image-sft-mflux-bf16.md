# mflux-community/moss-image-sft-mflux-bf16

## Resumen

Este repositorio contiene una conversión a **BF16 en formato MLX** del modelo **MOSS-Image-SFT**, un generador de imágenes texto-a-imagen desarrollado por el equipo **OpenMOSS**. No se trata de un modelo nuevo ni de un fine-tune: es el mismo conjunto de pesos del checkpoint original, convertido por la comunidad **MFlux-Community** para poder ejecutarse de forma nativa en Apple Silicon mediante la librería MFlux, sin CUDA ni PyTorch.

MOSS-Image-SFT es la versión supervisada (SFT) de MOSS-Image-Base y, según la documentación disponible, es un **Diffusion Transformer (DiT) de 5.000 millones de parámetros** acoplado a un codificador de texto **Qwen3.5 de 9B** y al **VAE de FLUX.2**. Su rasgo diferencial es la calidad del texto renderizado dentro de la imagen y el control de maquetación: acepta prompts de hasta 4.096 tokens en lenguaje natural, etiquetas estilo booru o un JSON de layout, y genera desde 512 px hasta 2K en cualquier relación de aspecto.

La relevancia de esta ficha concreta es de infraestructura: permite ejecutar un modelo de imagen de última generación **en local sobre un Mac**, con cinco niveles de cuantización disponibles (de Q8 a Q3, entre 14,0 GB y 5,8 GB) frente a los 26,2 GB del build BF16. Es una pieza útil para quien quiera inferencia privada, sin coste por API y con control fino sobre el pipeline de conversión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para texto-a-imagen, con codificador de texto Qwen3.5 9B y VAE de FLUX.2 |
| Parametros totales | 5.000 M en el DiT (más 9.000 M del codificador de texto Qwen3.5, según la información del modelo original) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 4.096 tokens de prompt; no aplica ventana de contexto autorregresiva al ser un modelo de difusión |
| Tipos de cuantizacion | BF16 (este repo, sin cuantizar), Q8, Q6, Q5, Q4 y Q3 en MLX; también cuantización al vuelo con `--quantize` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo original) |
| Formato de pesos | safetensors en formato MLX (librería `mflux`) |
| Tarea (pipeline) | `text-to-image` |
| Resolucion de generacion | De 512 px a 2K, cualquier relación de aspecto |
| Entradas admitidas | Lenguaje natural, etiquetas estilo booru y JSON de layout |
| Tamano del repositorio | 26,2 GB (build BF16) |
| Repositorio base | `OpenMOSS-Team/MOSS-Image-SFT` (relación: `quantized`) |
| Fecha de conversión | 22 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un **Diffusion Transformer** para generación de imágenes condicionada por texto. El texto se procesa con un codificador **Qwen3.5 de 9B**, lo que explica la ventana de prompt de hasta 4.096 tokens y la capacidad de seguir instrucciones largas o estructuradas en JSON. La decodificación al espacio de píxeles se realiza con el **VAE de FLUX.2**. La model card de esta conversión no detalla la profundidad del DiT, el número de cabezas de atención ni el schedule de difusión empleado.

Sobre el entrenamiento, la información disponible solo indica que **MOSS-Image-SFT es un ajuste supervisado (SFT) de MOSS-Image-Base**, con la misma arquitectura y distribución de prompts, pero con mejor agrupación de texto y composición. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card de MFlux-Community tampoco documenta innovaciones técnicas adicionales: se limita a describir el proceso de conversión a MLX, que modifica los pesos del release original **únicamente** por conversión de formato, sin reentrenamiento.

## Capacidades

- **Generación de imágenes texto-a-imagen** con alta fidelidad en el texto renderizado dentro de la imagen (rótulos, carteles, packaging).
- **Prompts largos de hasta 4.096 tokens**, útil para descripciones densas de escena, estilo e iluminación sin truncamientos agresivos.
- **Control de maquetación mediante JSON de layout**, lo que permite posicionar elementos de forma estructurada en lugar de depender solo de lenguaje natural.
- **Etiquetas estilo booru** como formato alternativo de condicionamiento, habitual en pipelines de generación de personajes e ilustración.
- **Relaciones de aspecto arbitrarias** y salidas desde 512 px hasta 2K, sin necesidad de recortar o reescalar.
- **Inferencia local en Apple Silicon** mediante MLX, sin dependencia de CUDA ni de servicios en la nube.
- **Cuantización flexible**: builds Q8 a Q3 publicados y posibilidad de cuantizar al vuelo desde el BF16.
- No se documentan en la información disponible capacidades de *tool calling*, razonamiento multi-paso, agentes, visión de entrada, audio ni modo *thinking*; es un modelo puramente generativo de imagen.

## Casos de uso

- **Cartelería y señalética con texto legible**: el punto fuerte del modelo es el renderizado de texto dentro de la imagen, por lo que encaja en la generación de pósters, carteles de eventos o señales donde las letras deben salir correctas y no como garabatos, un fallo típico de los modelos de difusión anteriores.
- **Maquetación publicitaria controlada por JSON**: agencias y equipos de diseño pueden definir la posición de titular, imagen y marca en un layout estructurado y dejar que el modelo rellene el contenido visual, reduciendo el número de iteraciones manuales.
- **Prototipado de interfaces y mockups en local**: con prompts largos se pueden describir pantallas completas con jerarquía visual; al ejecutarse en un Mac, el diseñador puede iterar sin cuotas de API ni enviar material confidencial fuera de su equipo.
- **Ilustración editorial y de producto**: la ventana de 4K tokens permite especificar narrativa, paleta, composición y estilo en un solo prompt, lo que resulta práctico para cubiertas, ilustraciones de artículo y bodegones de catálogo a 2K.
- **Producción de assets para videojuegos**: la generación en cualquier relación de aspecto facilita sprites de fondo, banners y texturas en formatos panorámicos o verticales sin recortes posteriores.
- **Procesamiento por lotes offline**: integrado en un script de MFlux, el build Q4 o Q5 (7,5 GB y 9,1 GB) permite lanzar lotes nocturnos de imágenes en un Mac con 16 GB de memoria unificada, algo inviable con el BF16.
- **Investigación y ajuste de cuantizaciones**: el BF16 sirve como referencia de máxima fidelidad para medir la degradación de Q8, Q6, Q5, Q4 y Q3 sobre el mismo conjunto de prompts y semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card de esta conversión ni los resultados de búsqueda consultados incluyen cifras de FID, CLIP score, HPSv2, GenEval, DPGBench ni comparaciones cuantitativas con otros modelos de imagen. La única valoración cualitativa disponible, procedente de la conversión de `mlx-community`, afirma que MOSS-Image-SFT ofrece "mejor agrupación de texto y composición" que MOSS-Image-Base, sin acompañarla de métricas.

## Requisitos de hardware

- **Plataforma**: exclusivamente Apple Silicon (MLX). No hay soporte para GPU NVIDIA, AMD ni CPU x86 en este repositorio; para CUDA habría que usar el checkpoint original de OpenMOSS.
- **Memoria unificada estimada** (a partir del tamaño de los pesos publicados; la model card no detalla si el codificador de texto y el VAE están incluidos en esa cifra, por lo que conviene dejar margen):
  - BF16 (26,2 GB): ~32 GB o más de memoria unificada.
  - Q8 (14,0 GB): ~18-20 GB.
  - Q6 (10,7 GB): ~16 GB.
  - Q5 (9,1 GB): ~16 GB.
  - Q4 (7,5 GB): ~12-16 GB.
  - Q3 (5,8 GB): ~8-12 GB.
- **Equipos recomendados**: Mac con chip M-series y 32 GB o más para BF16 (M1/M2/M3/M4 Pro, Max o Ultra); 16 GB para Q4 y Q5; los modelos con 8 GB de memoria unificada quedan al límite incluso en Q3.
- **GPU dedicadas**: no aplica. El repositorio no es utilizable con A100, H100 ni RTX 4090 a través de MFlux.
- **Opciones de despliegue**: CLI `mflux-generate-moss-image` (paquete `mflux` instalable con `uv tool install mflux`), API de Python de MFlux, y descarga previa con `hf download` para uso sin conexión.
- **Latencia y throughput**: no disponibles. No se han publicado tiempos por imagen ni imágenes por minuto para ninguno de los niveles de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Prompt max. | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `mflux-community/moss-image-sft-mflux-bf16` (este repo) | 5.000 M (DiT) + 9.000 M (text encoder) | 4.096 tokens | safetensors MLX | Apache 2.0 | Build BF16 de referencia, 26,2 GB, solo Apple Silicon |
| `mflux-community/moss-image-sft-mflux-q4` | Igual, cuantizado a 4 bits | 4.096 tokens | safetensors MLX | Apache 2.0 | 7,5 GB; mejor opción para Mac de 16 GB |
| `mlx-community/MOSS-Image-SFT-bf16` | 5.000 M (DiT) + 9.000 M (text encoder) | 4.096 tokens | safetensors MLX | Apache 2.0 | Conversión MLX alternativa del mismo checkpoint base |
| `OpenMOSS-Team/MOSS-Image-SFT` | 5.000 M (DiT) + 9.000 M (text encoder) | 4.096 tokens | safetensors | Apache 2.0 | Release original; pensado para PyTorch/CUDA |
| MOSS-Image-Base | 5.000 M (DiT) | No disponible | No disponible | Apache 2.0 (según el release de la familia) | Checkpoint previo al SFT; peor agrupación de texto según la documentación |
| FLUX.1 [dev] | 12.000 M | No disponible | safetensors, GGUF | Licencia no comercial FLUX.1 [dev] | Alternativa de referencia en texto-a-imagen, pero con licencia restrictiva para uso comercial |

## Limitaciones y advertencias

- **No es un release oficial**: la conversión la firma MFlux-Community, no OpenMOSS. Ante cualquier discrepancia de calidad, la referencia es el checkpoint original.
- **Dependencia total de Apple Silicon**: no se puede ejecutar en CUDA ni en CPU x86. Esto descarta su uso en la mayoría de clústeres y en servidores Linux convencionales.
- **Sin datos de benchmarks**: no hay métricas objetivas publicadas que permitan comparar su calidad con FLUX, SDXL u otros modelos; cualquier afirmación de "mejor" o "peor" sería especulativa.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede generar texto ilegible en pasajes largos, anatomías incorrectas, marcas de agua espurias o elementos incoherentes con el prompt, especialmente en resoluciones bajas o prompts ambiguos.
- **Sesgos no documentados**: no se publica información sobre la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos de género, etnia, cultura o representación geográfica.
- **Idiomas no especificados**: se desconoce qué lenguas maneja el codificador de texto y con qué calidad; el ejemplo de la model card está en inglés y no hay evidencia de rendimiento en castellano.
- **Licencia**: Apache 2.0 permite uso comercial, pero la model card remite expresamente a los términos del modelo original, que conviene revisar antes de desplegar en producción.
- **Límite de 4.096 tokens**: prompts más largos requieren truncamiento o resumen previo; no hay mecanismo de memoria conversacional.
- **Memoria**: el build BF16 exige 32 GB o más de memoria unificada; en equipos de 16 GB hay que recurrir a Q4/Q5 con posible pérdida de fidelidad no cuantificada.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/mflux-community/moss-image-sft-mflux-bf16
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Conversión MLX alternativa (mlx-community): https://huggingface.co/mlx-community/MOSS-Image-SFT-bf16
- Cuantización Q8: https://huggingface.co/mflux-community/moss-image-sft-mflux-q8
- Cuantización Q6: https://huggingface.co/mflux-community/moss-image-sft-mflux-q6
- Cuantización Q5: https://huggingface.co/mflux-community/moss-image-sft-mflux-q5
- Cuantización Q4: https://huggingface.co/mflux-community/moss-image-sft-mflux-q4
- Cuantización Q3: https://huggingface.co/mflux-community/moss-image-sft-mflux-q3
- Repositorio de MFlux (implementación MLX): https://github.com/filipstrand/mflux
- Fork de la comunidad MFlux: https://github.com/mflux-community/mflux
- Ficha en Civitai con detalles del modelo MOSS Image: https://civitai.com/models/3005406/moss-image
- Registro de metadatos del modelo: https://free2aitools.com/model/mlx-community/moss-image-sft-bf16
